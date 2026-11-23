/* Brosia's Library cloud sync (Supabase, free tier). No third-party libraries:
 * auth and data use Supabase's REST endpoints directly.
 *
 * Model. The on-device reader state (one IndexedDB record) is split into small
 * records, e.g. "progress|<bookId>", "overrides.reader_notes|<bookId>",
 * "overrides.slow_reads.war-and-peace|2027-03-04". Each record is one row in
 * public.library_records, owned by the signed-in user (row-level security).
 *
 * Pending changes need no separate queue: the last state known to match the
 * server is kept as per-record hashes ("base"). Anything that differs from base
 * is pending, survives reloads and offline periods (it lives in IndexedDB), and
 * is uploaded on the next successful sync.
 *
 * Conflicts: a record changed locally and remotely since the last sync keeps the
 * local version (the most recent edit on this device) and uploads it.
 * "Synced" is shown only after the server acknowledged every pending record. */
(function(root,factory){
 const api=factory(root);
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.BrosiaSync=api;
})(typeof window!=='undefined'?window:typeof globalThis!=='undefined'?globalThis:this,function(root){
 'use strict';
 const TABLE='library_records';
 const MAP_PATHS=new Set(['progress','unlocked_achievements','overrides.user_soft_dates','overrides.edition_overrides',
  'overrides.reader_notes','overrides.series_continuation_choices']);
 const WHOLE_TOP=['goals','settings'];
 const isObj=v=>!!v&&typeof v==='object'&&!Array.isArray(v);
 const stable=v=>JSON.stringify(v,(k,x)=>{if(isObj(x)){const o={};for(const key of Object.keys(x).sort())o[key]=x[key];return o;}return x;});
 // Small, fast non-cryptographic hash (FNV-1a) — only used to detect change.
 const hash=v=>{const s=stable(v);let h=0x811c9dc5;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193);}return (h>>>0).toString(36)+':'+s.length;};

 // ---------- state <-> records ----------
 function decompose(state){
  const out=new Map();
  for(const k of WHOLE_TOP)out.set(`${k}|*`,state[k]);
  const visit=(path,value)=>{
   if(path==='overrides.slow_reads'&&isObj(value)){
    out.set(`${path}|#`,'set');
    for(const [track,dates] of Object.entries(value))for(const d of dates||[])out.set(`${path}.${track}|${d}`,true);
    return;
   }
   if(Array.isArray(value)&&value.length&&value.every(x=>isObj(x)&&typeof x.id==='string')){
    out.set(`${path}|#`,'array');value.forEach(x=>out.set(`${path}|${x.id}`,x));return;
   }
   if(MAP_PATHS.has(path)&&isObj(value)){out.set(`${path}|#`,'map');for(const [k,v] of Object.entries(value))out.set(`${path}|${k}`,v);return;}
   out.set(`${path}|*`,value);
  };
  visit('progress',state.progress);visit('custom_books',state.custom_books);
  visit('unlocked_achievements',state.unlocked_achievements);visit('event_history',state.event_history);
  for(const [k,v] of Object.entries(state.overrides||{}))visit(`overrides.${k}`,v);
  return out;
 }
 function compose(template,records){
  const s={format:template.format,schema_version:template.schema_version,planning_year:template.planning_year,
   goals:template.goals,settings:template.settings,progress:{},custom_books:[],unlocked_achievements:{},event_history:[],
   overrides:{reading_order_ids:[],user_soft_dates:{},edition_overrides:{},reader_notes:{}},last_saved_at:new Date().toISOString()};
  const arrays=new Map(),localOrder=new Map();
  for(const [path,val] of [['custom_books',template.custom_books],['event_history',template.event_history],
   ...Object.entries(template.overrides||{}).map(([k,v])=>['overrides.'+k,v])])
   if(Array.isArray(val))localOrder.set(path,new Map(val.map((x,i)=>[x?.id,i])));
  const setPath=(path,v)=>{const parts=path.split('.');let o=s;for(let i=0;i<parts.length-1;i++)o=o[parts[i]]??(o[parts[i]]={});o[parts.at(-1)]=v;};
  const getPath=path=>path.split('.').reduce((o,p)=>o?.[p],s);
  for(const [key,val] of records){
   const bar=key.lastIndexOf('|'),path=key.slice(0,bar),id=key.slice(bar+1);
   if(path.startsWith('overrides.slow_reads.')){const track=path.slice('overrides.slow_reads.'.length);
    s.overrides.slow_reads=s.overrides.slow_reads||{};(s.overrides.slow_reads[track]=s.overrides.slow_reads[track]||[]).push(id);continue;}
   if(id==='*'){if(WHOLE_TOP.includes(path))s[path]=val;else setPath(path,val);continue;}
   if(id==='#'){if(getPath(path)===undefined)setPath(path,val==='array'?[]:{});continue;}
   if(MAP_PATHS.has(path)){if(!isObj(getPath(path)))setPath(path,{});getPath(path)[id]=val;continue;}
   if(!arrays.has(path))arrays.set(path,[]);arrays.get(path).push(val);
  }
  for(const [path,items] of arrays){
   const order=localOrder.get(path)||new Map();
   const when=x=>x?.created_at||x?.at||x?.added_at||x?.date||'';
   items.sort((a,b)=>{const ia=order.has(a.id)?order.get(a.id):Infinity,ib=order.has(b.id)?order.get(b.id):Infinity;
    return ia!==ib?ia-ib:String(when(a)).localeCompare(String(when(b)))||String(a.id).localeCompare(String(b.id));});
   setPath(path,items);
  }
  if(s.overrides.slow_reads)for(const t of Object.keys(s.overrides.slow_reads))s.overrides.slow_reads[t].sort();
  return s;
 }

 // ---------- config, session, persistence ----------
 let cfg=null,reader=null,engine=null,onApplied=null;
 const LS=root.localStorage;
 const lsGet=(k,d)=>{try{const v=LS.getItem(k);return v?JSON.parse(v):d;}catch(_){return d;}};
 const lsSet=(k,v)=>{try{LS.setItem(k,JSON.stringify(v));}catch(_){}};
 const lsDel=k=>{try{LS.removeItem(k);}catch(_){}};
 const SESSION_KEY='brosia-sync-session',DEVICE_KEY='brosia-device-id',LAST_UID_KEY='brosia-sync-last-uid';
 const baseKey=uid=>'brosia-sync-base:'+uid,cursorKey=uid=>'brosia-sync-cursor:'+uid;
 const deviceId=()=>{let d=lsGet(DEVICE_KEY,null);if(!d){d=(root.crypto?.randomUUID?.()||String(Math.random()).slice(2));lsSet(DEVICE_KEY,d);}return d;};
 let session=lsGet(SESSION_KEY,null);
 const status={state:'signed_out',pending:0,lastSynced:null,error:null};
 const listeners=new Set();
 const emit=()=>{for(const fn of listeners)try{fn({...status,email:session?.user?.email||null});}catch(_){}};
 function setStatus(patch){Object.assign(status,patch);emit();}

 async function authFetch(path,body){
  const res=await fetch(cfg.url+'/auth/v1/'+path,{method:'POST',headers:{apikey:cfg.key,'Content-Type':'application/json'},body:JSON.stringify(body)});
  const data=await res.json().catch(()=>({}));
  if(!res.ok)throw Error(data.error_description||data.msg||data.message||'Sign-in failed');
  return data;
 }
 function storeSession(d){
  session={access_token:d.access_token,refresh_token:d.refresh_token,expires_at:d.expires_at||Math.floor(Date.now()/1000)+(d.expires_in||3600),user:{id:d.user.id,email:d.user.email}};
  lsSet(SESSION_KEY,session);
 }
 async function token(){
  if(!session)throw Error('Signed out');
  if(session.expires_at-Math.floor(Date.now()/1000)<90){
   try{storeSession(await authFetch('token?grant_type=refresh_token',{refresh_token:session.refresh_token}));}
   catch(e){if(navigator.onLine!==false){session=null;lsDel(SESSION_KEY);setStatus({state:'signed_out',error:'Your session expired. Sign in again.'});}throw e;}
  }
  return session.access_token;
 }
 async function rest(method,query,body,extraHeaders={}){
  const res=await fetch(`${cfg.url}/rest/v1/${TABLE}${query}`,{method,headers:{apikey:cfg.key,Authorization:'Bearer '+await token(),
   'Content-Type':'application/json',...extraHeaders},body:body?JSON.stringify(body):undefined});
  if(!res.ok){const t=await res.text().catch(()=>'');throw Error(`Server ${res.status}: ${t.slice(0,160)}`);}
  return res.status===204?null:res.json().catch(()=>null);
 }

 // ---------- the sync cycle ----------
 let running=null,again=false,timer=null;
 function pendingKeys(local,base){
  const keys=new Set();
  for(const [k,v] of local)if(base[k]!==hash(v))keys.add(k);
  for(const k of Object.keys(base))if(!local.has(k))keys.add(k);
  return keys;
 }
 function refreshPendingCount(){
  if(!session||!reader)return;
  const n=pendingKeys(decompose(reader.state),lsGet(baseKey(session.user.id),{})).size;
  setStatus({pending:n,state:navigator.onLine===false?'offline':n?'pending':status.state==='error'?'error':'synced'});
 }
 async function cycle(){
  const uid=session.user.id,base=lsGet(baseKey(uid),{});let cursor=lsGet(cursorKey(uid),'1970-01-01T00:00:00Z');
  // 1) Pull everything changed on the server since the last cursor (5 s overlap).
  const since=new Date(Date.parse(cursor)-5000).toISOString();
  const remote=[];let page=0;
  for(;;){
   const rows=await rest('GET',`?select=record_key,data,deleted,updated_at&updated_at=gt.${encodeURIComponent(since)}&order=updated_at.asc&limit=1000&offset=${page*1000}`);
   remote.push(...rows);if(rows.length<1000)break;page++;
  }
  const savedAt=reader.state.last_saved_at;
  const local=decompose(reader.state),pending=pendingKeys(local,base),working=new Map(local);
  let changed=false;
  for(const r of remote){
   if(r.updated_at>cursor)cursor=r.updated_at;
   if(pending.has(r.record_key))continue; // local edit wins; uploaded below
   if(r.deleted){if(working.has(r.record_key)){working.delete(r.record_key);changed=true;}delete base[r.record_key];}
   else{const h=hash(r.data);if(!working.has(r.record_key)||hash(working.get(r.record_key))!==h){working.set(r.record_key,r.data);changed=true;}base[r.record_key]=h;}
  }
  // 2) Apply remote changes to this device.
  if(changed){
   const next=compose(reader.state,working);
   await engine.applySyncedState(reader,next,savedAt);
   onApplied?.(reader.state);
  }
  // 3) Push local changes the server hasn't acknowledged.
  const now=new Date().toISOString(),dev=deviceId();
  const rows=[...pending].map(k=>local.has(k)
   ?{user_id:uid,record_key:k,data:local.get(k),deleted:false,client_updated_at:now,device_id:dev}
   :{user_id:uid,record_key:k,data:null,deleted:true,client_updated_at:now,device_id:dev});
  for(let i=0;i<rows.length;i+=400){
   const batch=rows.slice(i,i+400);
   await rest('POST','?on_conflict=user_id,record_key',batch,{Prefer:'resolution=merge-duplicates,return=minimal'});
   for(const r of batch){if(r.deleted)delete base[r.record_key];else base[r.record_key]=hash(r.data);}
   lsSet(baseKey(uid),base);
  }
  lsSet(baseKey(uid),base);lsSet(cursorKey(uid),cursor);
 }
 async function syncNow(){
  if(!cfg||!reader||!session)return;
  if(navigator.onLine===false){refreshPendingCount();return;}
  if(running){again=true;return running;}
  setStatus({state:'syncing',error:null});
  running=(async()=>{
   try{await cycle();setStatus({state:'synced',lastSynced:new Date().toISOString(),error:null});}
   catch(e){if(session)setStatus({state:'error',error:e.message});}
   finally{running=null;refreshPendingCount();if(again){again=false;schedule(300);}}
  })();
  return running;
 }
 const schedule=(ms=1500)=>{clearTimeout(timer);timer=setTimeout(syncNow,ms);};

 // Wrap every storage mutation so changes upload shortly after they're saved.
 function wrapStorage(storage){
  const wrapped={...storage};
  for(const [name,fn] of Object.entries(storage)){
   if(typeof fn!=='function'||!/^(change|import|restore)/.test(name))continue;
   wrapped[name]=async(...args)=>{const out=await fn(...args);if(session&&reader){refreshPendingCount();schedule();}return out;};
  }
  return Object.freeze(wrapped);
 }

 // ---------- public API ----------
 function configure(options){cfg={url:options.url.replace(/\/$/,''),key:options.key};}
 function attach(r,storage,applied){
  reader=r;engine=storage;onApplied=applied;
  if(session){setStatus({state:'pending'});syncNow();}else setStatus({state:'signed_out'});
  root.addEventListener?.('online',()=>schedule(200));
  root.addEventListener?.('offline',refreshPendingCount);
  root.document?.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')schedule(200);});
  setInterval(()=>{if(root.document?.visibilityState!=='hidden')syncNow();},60000);
 }
 async function signIn(email,password){
  const d=await authFetch('token?grant_type=password',{email,password});
  const last=lsGet(LAST_UID_KEY,null);
  if(last&&last!==d.user.id&&root.confirm&&!root.confirm('This device was last synced with a different account. Merge this device’s library into the new account?'))throw Error('Sign-in cancelled');
  storeSession(d);lsSet(LAST_UID_KEY,d.user.id);setStatus({state:'syncing',error:null});
  await syncNow();
 }
 async function signOut(){
  const t=session?.access_token;session=null;lsDel(SESSION_KEY);setStatus({state:'signed_out',pending:0,error:null});
  if(t&&cfg)fetch(cfg.url+'/auth/v1/logout',{method:'POST',headers:{apikey:cfg.key,Authorization:'Bearer '+t}}).catch(()=>{});
 }
 async function resetPassword(email){await authFetch('recover',{email});}
 function onStatus(fn){listeners.add(fn);fn({...status,email:session?.user?.email||null});return()=>listeners.delete(fn);}
 return Object.freeze({configure,attach,wrapStorage,signIn,signOut,resetPassword,syncNow,onStatus,decompose,compose,hash,
  get signedIn(){return !!session;}});
});
