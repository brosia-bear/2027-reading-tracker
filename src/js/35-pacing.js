/* Rosewood Library Session 12 — read-only 2027 pacing snapshots and optional ICS exports.
 * Exact parity with reference/pacing_reference.py pace_snapshot/projected_year_end.
 * No storage, activity inference, background timer, automatic alerts or Goodreads sync.
 */
(function(root){
 'use strict';
 const START='2027-01-01',END='2027-12-31',DAYS=365,DAY=86400000;
 const SLOW_IDS=new Set(['rosewood-revised-2027-031','rosewood-revised-2027-037']);
 const isoDate=s=>typeof s==='string'&&/^\d{4}-\d\d-\d\d$/.test(s)&&Number.isFinite(Date.parse(s+'T12:00:00Z'))&&new Date(s+'T12:00:00Z').toISOString().slice(0,10)===s;
 const elapsed=s=>Math.round((Date.parse(s+'T12:00:00Z')-Date.parse(START+'T12:00:00Z'))/DAY)+1;
 const roundPython=n=>{const floor=Math.floor(n);return n-floor===.5?floor+(floor%2):Math.round(n);};
 const r3=n=>roundPython(n*1000)/1000; // mirrors Python ties-to-even at three decimals
 function paceSnapshot(asOf,completed,partialEquivalent=0,target=104,graceBooks=1){
 if(!isoDate(asOf)||asOf<START||asOf>END)throw Error('Date outside 2027');
 if(!Number.isInteger(completed)||completed<0||!Number.isFinite(partialEquivalent)||partialEquivalent<0||!Number.isInteger(target)||target<1||!Number.isFinite(graceBooks)||graceBooks<=0)throw Error('Invalid pace progress');
 const expected=target*elapsed(asOf)/DAYS, balance=completed+partialEquivalent-expected;
 const status=completed>=target?'complete':balance>=graceBooks?'ahead':balance<=-graceBooks?'behind':'on_track';
 return {as_of:asOf,target,counted_completed:completed,partial_equivalent_for_pacing_only:r3(partialEquivalent),expected_book_equivalents:r3(expected),balance_book_equivalents:r3(balance),status,days_remaining:Math.round((Date.parse(END+'T12:00:00Z')-Date.parse(asOf+'T12:00:00Z'))/DAY)};
 }
 function projectedYearEnd(asOf,completed){
 if(!isoDate(asOf)||asOf<START||asOf>END||!Number.isInteger(completed)||completed<0)throw Error('Invalid projection input');
 if(elapsed(asOf)<28||completed<8)return null;
 return roundPython(completed/elapsed(asOf)*DAYS);
 }
 // Return only unique, current, eligible works. A percentage is not a daily activity session.
 function fromReader(state,canonical,asOf){
 if(!state||!Array.isArray(canonical)||!isoDate(asOf))throw Error('Invalid reader snapshot');
 const phase=asOf<START?'preview':asOf>END?'year_closed':'active';
 if(phase==='preview')return {phase,as_of:asOf,completed:0,partial_equivalent:0,public_completed:0,private_goal:state.goals?.private_goodreads??104,public_goal:state.goals?.public_goodreads??52,snapshot:null,projection:null,source:'No 2027 reading history exists yet. These are planning targets only.'};
 const observation=phase==='year_closed'?END:asOf;
 const byId=new Map();for(const book of [...canonical,...(state.custom_books||[])]){
  if(!book||typeof book.id!=='string'||byId.has(book.id))throw Error('Duplicate or invalid book in snapshot');byId.set(book.id,book);
 }
 let completed=0,partial=0;
 for(const [id,p] of Object.entries(state.progress||{})){
  if(SLOW_IDS.has(id))continue;
  const b=byId.get(id);
  if(!b||!p||p.goodreads_eligible!==true|| (id.startsWith('rosewood-custom-')?b.goodreads_eligible!==true:b.goodreads_eligible_planned!==true))continue;
  if(p.is_reread===true&&p.reread_allowed!==true)continue;
  if(p.status==='finished'&&p.percent===100&&isoDate(p.finished_at)&&p.finished_at>=START&&p.finished_at<=observation){completed++;continue;}
  // A future-completed book cannot be awarded credit or counted as partial at an earlier snapshot.
  if(p.status==='finished'||p.status==='dnf'||p.status==='not_started')continue;
  if(!['reading','paused'].includes(p.status))continue;
  if(p.started_at&&(!isoDate(p.started_at)||p.started_at>observation))continue;
  const pct=Number(p.percent);
  if(Number.isFinite(pct)&&pct>0&&pct<100)partial+=pct/100;
 }
 const snapshot=paceSnapshot(observation,completed,partial,state.goals?.private_goodreads??104,1);
 return {phase,as_of:asOf,observed_through:observation,completed,partial_equivalent:r3(partial),public_completed:completed,public_goal:state.goals?.public_goodreads??52,private_goal:snapshot.target,snapshot,
  projection:phase==='active'?projectedYearEnd(observation,completed):null,
  source:'Current saved records only; partial percentages indicate present book progress, not dated reading sessions.'};
 }
 function escapeICS(text){return String(text).replace(/\\/g,'\\\\').replace(/\r\n|\r|\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');}
 function foldICS(line){ // RFC 5545 75 octets per physical line (UTF-8 safe)
 const encoder=new TextEncoder();let current='',bytes=0;const lines=[];
 for(const ch of line){const n=encoder.encode(ch).length;if(bytes+n>75){lines.push(current);current=' ';bytes=1;}current+=ch;bytes+=n;}
 lines.push(current);return lines.join('\r\n');
 }
 function makeCalendar(queue,opts={}){
 if(!Array.isArray(queue))throw Error('Reading queue required');
 const reminders=opts.reminders===true,now=opts.generatedAt instanceof Date?opts.generatedAt:new Date();
 if(!Number.isFinite(now.getTime()))throw Error('Invalid export timestamp');
 const stamp=now.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
 const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Rosewood Library//Optional Reading Suggestions//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-CALNAME:Rosewood 2027 Optional Reading Suggestions','X-WR-CALDESC:Flexible suggestions only - not deadlines'];
 const seen=new Set();
 for(const row of queue){
  if(!row||typeof row.book_id!=='string'||!/^rosewood-(2027-\d{3}|revised-2027-\d{3}|custom-[a-zA-Z0-9-]+)$/.test(row.book_id)||seen.has(row.book_id)||!isoDate(row.suggested_finish_by)||row.suggested_finish_by<START||row.suggested_finish_by>END)throw Error('Invalid or duplicate reading suggestion');
  seen.add(row.book_id);const stampDay=row.suggested_finish_by.replace(/-/g,'');
  const following=new Date(Date.parse(row.suggested_finish_by+'T12:00:00Z')+DAY).toISOString().slice(0,10).replace(/-/g,'');
  lines.push('BEGIN:VEVENT','UID:'+row.book_id+'-soft-2027@rosewood-library.invalid','DTSTAMP:'+stamp,'DTSTART;VALUE=DATE:'+stampDay,'DTEND;VALUE=DATE:'+following,
  'SUMMARY:'+escapeICS('Optional Rosewood reading suggestion: '+String(row.title||'Untitled')),
  'DESCRIPTION:'+escapeICS('Finish by approximately '+row.suggested_finish_by+' if this suits you. Not a deadline or an overdue task. If your plan changes, remove the old imported events and export the new suggestions. No automatic synchronization.'),'TRANSP:TRANSPARENT','STATUS:TENTATIVE');
  if(reminders)lines.push('BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:An optional Rosewood reading suggestion, not a deadline','TRIGGER:-P2D','END:VALARM');
  lines.push('END:VEVENT');
 }
 lines.push('END:VCALENDAR');
 return lines.map(foldICS).join('\r\n')+'\r\n';
 }
 const api=Object.freeze({START,END,paceSnapshot,projectedYearEnd,fromReader,makeCalendar,isoDate,foldICS,escapeICS});
 root.RosewoodCompass=api;
 if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
