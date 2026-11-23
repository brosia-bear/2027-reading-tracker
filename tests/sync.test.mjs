// Sync engine tests: two simulated devices against an in-memory fake Supabase.
// These test the merge logic only; row-level security is verified live.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const Storage = require('../src/js/31-storage-engine.js');
const SRC = fs.readFileSync(new URL('../src/js/32b-sync.js', import.meta.url), 'utf8');

function fakeServer() {
  const rows = new Map(); let clock = Date.parse('2027-01-01T00:00:00Z');
  const users = { 'a@x.test': 'uid-a', 'b@x.test': 'uid-b' };
  const json = (status, body) => ({ ok: status < 400, status, json: async () => body, text: async () => JSON.stringify(body) });
  return {
    rows,
    online: true,
    async fetch(url, opts = {}) {
      if (!this.online) throw new TypeError('Failed to fetch');
      const u = new URL(url);
      if (u.pathname === '/auth/v1/token') {
        const body = JSON.parse(opts.body);
        const uid = users[body.email];
        if (!uid || body.password !== 'pw') return json(400, { error_description: 'Invalid login credentials' });
        return json(200, { access_token: 'tok-' + uid, refresh_token: 'r', expires_in: 3600, user: { id: uid, email: body.email } });
      }
      const uid = (opts.headers?.Authorization || '').replace('Bearer tok-', '');
      if (opts.method === 'GET') {
        const since = u.searchParams.get('updated_at').replace('gt.', '');
        const out = [...rows.values()].filter(r => r.user_id === uid && r.updated_at > since).sort((a, b) => a.updated_at.localeCompare(b.updated_at));
        return json(200, out.map(({ record_key, data, deleted, updated_at }) => ({ record_key, data, deleted, updated_at })));
      }
      if (opts.method === 'POST') {
        for (const r of JSON.parse(opts.body)) {
          assert.equal(r.user_id, uid, 'row must belong to the signed-in user');
          clock += 1000; rows.set(uid + '|' + r.record_key, { ...r, updated_at: new Date(clock).toISOString() });
        }
        return { ok: true, status: 201, json: async () => null, text: async () => '' };
      }
      return json(404, {});
    },
  };
}

function device(server, initialState) {
  const store = new Map();
  const ctx = {
    console, Date, JSON, Math, Map, Set, Object, Array, String, Number, Promise, Error, TypeError, URL, encodeURIComponent,
    setTimeout: () => 0, clearTimeout: () => {}, setInterval: () => 0,
    localStorage: { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, v), removeItem: k => store.delete(k) },
    navigator: { get onLine() { return server.online; } },
    fetch: (...a) => server.fetch(...a), crypto: { randomUUID: () => 'dev-' + Math.random() },
    addEventListener() {}, confirm: () => true,
  };
  ctx.window = ctx; vm.createContext(ctx); vm.runInContext(SRC, ctx);
  const sync = ctx.BrosiaSync;
  sync.configure({ url: 'https://fake.supabase.co', key: 'pk' });
  const reader = { state: structuredClone(initialState) };
  const engine = { async applySyncedState(r, next) { r.state = structuredClone(next); return next; } };
  sync.attach(reader, engine, () => {});
  const edit = fn => { fn(reader.state); reader.state.last_saved_at = new Date().toISOString(); };
  return { sync, reader, edit };
}

const base = () => {
  const s = Storage.defaultState();
  s.overrides.slow_reads = {};
  return s;
};
const finished = { status: 'finished', percent: 100, finished_at: '2027-02-01' };

test('decompose → compose round-trips a realistic state', () => {
  const { sync } = device(fakeServer(), base());
  const s = base();
  s.progress['rosewood-2027-001'] = finished;
  s.custom_books = [{ id: 'rosewood-custom-1', title: 'A', author: 'B' }, { id: 'rosewood-custom-2', title: 'C', author: 'D' }];
  s.overrides.reader_notes['rosewood-2027-002'] = { text: 'Loved it' };
  s.overrides.slow_reads = { 'war-and-peace': ['2027-01-01', '2027-01-02'] };
  s.overrides.reading_order_ids = ['rosewood-2027-003', 'rosewood-2027-001'];
  const again = JSON.parse(JSON.stringify(sync.compose(s, sync.decompose(s))));
  for (const k of ['progress', 'custom_books', 'goals', 'settings']) assert.deepEqual(again[k], s[k], k);
  assert.deepEqual(again.overrides.reader_notes, s.overrides.reader_notes);
  assert.deepEqual(again.overrides.slow_reads, s.overrides.slow_reads);
  assert.deepEqual(again.overrides.reading_order_ids, s.overrides.reading_order_ids);
});

test('an edit on one device reaches the other', async () => {
  const server = fakeServer();
  const A = device(server, base()), B = device(server, base());
  await A.sync.signIn('a@x.test', 'pw'); await B.sync.signIn('a@x.test', 'pw');
  A.edit(s => { s.progress['rosewood-2027-001'] = finished; });
  await A.sync.syncNow(); await B.sync.syncNow();
  assert.deepEqual(B.reader.state.progress['rosewood-2027-001'], finished);
});

test('offline edits are kept and upload when back online', async () => {
  const server = fakeServer();
  const A = device(server, base()), B = device(server, base());
  await A.sync.signIn('a@x.test', 'pw'); await B.sync.signIn('a@x.test', 'pw');
  server.online = false;
  A.edit(s => { s.overrides.slow_reads['war-and-peace'] = ['2027-01-05']; });
  await A.sync.syncNow();
  server.online = true;
  await A.sync.syncNow(); await B.sync.syncNow();
  assert.deepEqual(B.reader.state.overrides.slow_reads['war-and-peace'], ['2027-01-05']);
});

test('edits to different records on two devices both survive', async () => {
  const server = fakeServer();
  const A = device(server, base()), B = device(server, base());
  await A.sync.signIn('a@x.test', 'pw'); await B.sync.signIn('a@x.test', 'pw');
  A.edit(s => { s.overrides.reader_notes['rosewood-2027-010'] = { text: 'from phone' }; });
  B.edit(s => { s.overrides.reader_notes['rosewood-2027-020'] = { text: 'from laptop' }; });
  await A.sync.syncNow(); await B.sync.syncNow(); await A.sync.syncNow();
  for (const d of [A, B]) {
    assert.equal(d.reader.state.overrides.reader_notes['rosewood-2027-010'].text, 'from phone');
    assert.equal(d.reader.state.overrides.reader_notes['rosewood-2027-020'].text, 'from laptop');
  }
});

test('deletions propagate (unchecking a chapter)', async () => {
  const server = fakeServer();
  const A = device(server, base()), B = device(server, base());
  await A.sync.signIn('a@x.test', 'pw'); await B.sync.signIn('a@x.test', 'pw');
  A.edit(s => { s.overrides.slow_reads['les-miserables'] = ['2027-01-01', '2027-01-02']; });
  await A.sync.syncNow(); await B.sync.syncNow();
  A.edit(s => { s.overrides.slow_reads['les-miserables'] = ['2027-01-01']; });
  await A.sync.syncNow(); await B.sync.syncNow();
  assert.deepEqual(B.reader.state.overrides.slow_reads['les-miserables'], ['2027-01-01']);
});

test('repeated syncs are idempotent (no duplicate rows or changes)', async () => {
  const server = fakeServer();
  const A = device(server, base());
  await A.sync.signIn('a@x.test', 'pw');
  A.edit(s => { s.progress['rosewood-2027-001'] = finished; });
  await A.sync.syncNow(); const n = server.rows.size;
  await A.sync.syncNow(); await A.sync.syncNow();
  assert.equal(server.rows.size, n);
});

test('a device with an existing library merges into an empty account and vice versa', async () => {
  const server = fakeServer();
  const seeded = base(); seeded.progress['rosewood-2027-050'] = finished;
  const A = device(server, seeded), B = device(server, base());
  await A.sync.signIn('b@x.test', 'pw');
  await B.sync.signIn('b@x.test', 'pw');
  assert.deepEqual(B.reader.state.progress['rosewood-2027-050'], finished);
});
