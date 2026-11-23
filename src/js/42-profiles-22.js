/* Session22: vetted current ACTIVE 061–070 editorial profiles only; never reader state. */
(function(root){'use strict';
 const EXPECTED=Object.freeze(Array.from({length:10},(_,i)=>{let n=i+61;return `rosewood-${(n===63||n===69)?'revised-':''}2027-${String(n).padStart(3,'0')}`;}));
 const nonempty=x=>typeof x==='string'&&x.trim().length>0&&x.length<20000;
 const obj=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
 const need=(test,msg)=>{if(!test)throw Error('Session22: '+msg);};
 const https=x=>{try{const u=new URL(x);return u.protocol==='https:'&&u.hostname&&u.username===''&&u.password==='';}catch(_){return false;}};
 const basis=new Set(['source_verified_topic','source_verified_setup_and_editorial_interpretation','editorial_interpretation','author_commentary_and_editorial_interpretation']);
 function validate(d,activeBooks){
 need(obj(d)&&d.schema_version==='1.0'&&d.dataset_id==='rosewood-literary-profiles-session22-active','dataset');
 need(d.cohort?.session===22&&d.cohort.first_plan_order===61&&d.cohort.last_plan_order===70&&d.cohort.book_count===10,'cohort');
 need(Array.isArray(activeBooks)&&activeBooks.length===104&&new Set(activeBooks.map(x=>x.id)).size===104,'active 104');
 need(Array.isArray(d.profiles)&&d.profiles.length===10,'ten profiles');
 need(d.profiles.every((p,i)=>p?.book_id===EXPECTED[i]),'exact active IDs');
 for(let i=0;i<10;i++){
  const p=d.profiles[i], b=activeBooks[i+60];
  need(p.book_id===b.id&&p.title===b.title&&p.author===b.author&&p.plan_order===i+61,'active identity mismatch '+(i+61));
  need(p.profile_status==='verified'&&p.verified_at===d.checked_on&&/^\d{4}-\d\d-\d\d$/.test(p.verified_at),'verification date');
  for(const k of ['summary','verification_scope','author_and_work_background','before_reading','literary_approach','context','genre_and_form','personal_fit','possible_mismatch'])need(nonempty(p[k]),'missing prose '+k);
  need(obj(p.publication)&&nonempty(p.publication.basis)&&obj(p.series)&&nonempty(p.series.sequence_status),'historical/series notes');
  need(Array.isArray(p.themes)&&p.themes.length>=3&&p.themes.every(t=>nonempty(t.label)&&nonempty(t.discussion)&&basis.has(t.basis)),'interpreted themes');
  for(const k of ['reading_questions','discussion_questions'])need(Array.isArray(p[k])&&p[k].length>=2&&p[k].every(nonempty),'specific questions');
  need(p.content_guidance?.status==='limited_non_exhaustive'&&Array.isArray(p.content_guidance.notes),'limited content guidance');
  need(p.spoiler_policy==='spoiler_light'&&Array.isArray(p.spoiler_sections),'spoiler guard');
  need(p.edition_information?.pages===null&&p.edition_information?.audio_minutes_1x===null&&/not (?:been )?(?:identified|verified)/i.test(p.edition_information.note),'unverified edition values');
  need(Array.isArray(p.sources)&&p.sources.length>=3,'individual source count');
  const ids=new Set();for(const x of p.sources){
  need(nonempty(x.id)&&!ids.has(x.id),'duplicate source');ids.add(x.id);
  need(nonempty(x.title)&&nonempty(x.organization)&&https(x.url)&&x.checked_on===d.checked_on&&nonempty(x.scope)&&nonempty(x.notes)&&['high','medium','limited'].includes(x.confidence),'HTTPS source fields');
  need(Array.isArray(x.supports)&&x.supports.length&&x.supports.every(nonempty),'claim scope');
  }
  need(Array.isArray(p.related_connections)&&p.related_connections.every(x=>activeBooks.some(b=>b.id===x.book_id)&&nonempty(x.label)&&nonempty(x.note)),'related active book ID');
 }
 return Object.freeze({valid:true,count:10,bookIds:EXPECTED});
 }
 function freeze(x){if(x&&typeof x==='object'&&!Object.isFrozen(x)){Object.freeze(x);for(const v of Object.values(x))freeze(v);}return x;}
 function create(d,activeBooks){validate(d,activeBooks);const map=new Map(d.profiles.map(p=>[p.book_id,freeze(p)]));return Object.freeze({count:10,ids:Object.freeze([...map.keys()]),get:id=>map.get(id)||null,has:id=>map.has(id),validate:()=>validate(d,activeBooks)});}
 function combine(previous,cohort){need(previous?.count===60&&cohort?.count===10,'60+10 vetted registries required');const ids=Object.freeze([...previous.ids,...cohort.ids]);need(ids.length===70&&new Set(ids).size===70,'70 unique profiles');need(ids.every((id,i)=>i<60?id===previous.ids[i]:id===EXPECTED[i-60]),'prior 60 identity or new active IDs mismatch');return Object.freeze({count:70,ids,get:id=>previous.get(id)||cohort.get(id)||null,has:id=>previous.has(id)||cohort.has(id),validate:()=>Object.freeze({valid:true,count:70})});}
 const api=Object.freeze({EXPECTED,validate,create,combine});root.RosewoodLiteraryProfiles22=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
