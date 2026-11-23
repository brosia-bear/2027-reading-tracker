/* Brosia's Library — evidence-derived reading milestones.
  No simulated entries, no network access and no extra storage schema. */
(function(root){'use strict';
 const YEAR='2027';
 const QUARTERS=Object.freeze([['2027-03-31','January–March'],['2027-06-30','April–June'],['2027-09-30','July–September'],['2027-12-31','October–December']]);
 const RUSSIAN_IDS=Object.freeze([31,42,47,53,63,69,72,74,79,85,90,95,103].map(n=>`${n===72?'rosewood-2027':'rosewood-revised-2027'}-${String(n).padStart(3,'0')}`));
 const TITLES=Object.freeze({'war-and-peace':"Tolstoy at Dawn",'les-miserables':"Hugo by Lamplight"});
 const localDate=(now=new Date())=>`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
 function evaluate(state,tracks,asOf=localDate()){
 if(!state||!tracks||!/^\d{4}-\d{2}-\d{2}$/.test(asOf))throw Error('Invalid milestone state');
 const saved=state.overrides?.slow_reads||{};
 const slow=Object.keys(TITLES).map(key=>{
  const entries=tracks[key]?.entries;
  if(!Array.isArray(entries)||entries.length!==365)throw Error('Incomplete daily-reading track: '+key);
  const done=new Set(saved[key]||[]);
  const quarter=QUARTERS.map(([cutoff,period],i)=>{
  const required=entries.filter(e=>e.date<=cutoff&&!e.rest_day);
  const read=required.filter(e=>done.has(e.date)).length;
  return Object.freeze({level:i+1,period,cutoff,required:required.length,read,earned:asOf>=cutoff&&read===required.length,complete:read===required.length});
  });
  const due=entries.filter(e=>e.date<=asOf&&!e.rest_day);
  const dueDone=due.filter(e=>done.has(e.date)).length;
  const earned=quarter.filter(q=>q.earned).length;
  return Object.freeze({id:key,title:TITLES[key],earned,levels:quarter,portion:earned/4,onTrack:asOf<YEAR+'-01-01'?null:dueDone===due.length,due:due.length,dueDone,missing:due.length-dueDone});
 });
 const progress=state.progress||{};
 const completed=RUSSIAN_IDS.filter(id=>{const p=progress[id];return p&&p.status==='finished'&&p.percent===100&&/^\d{4}-\d\d-\d\d$/.test(p.finished_at||'')&&p.finished_at>='2027-01-01'&&p.finished_at<='2027-12-31'&&p.finished_at<=asOf&&p.goodreads_eligible===true;});
 return Object.freeze({slow, russian:Object.freeze({title:'Russian Literature Scholar',completed:Object.freeze(completed),count:completed.length,total:RUSSIAN_IDS.length,earned:completed.length===RUSSIAN_IDS.length})});
 }
 const api=Object.freeze({YEAR,QUARTERS,RUSSIAN_IDS,evaluate});
 root.BrosiaReadingMilestones=api;
 if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
