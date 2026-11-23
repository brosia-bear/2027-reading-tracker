/* Session26: current ACTIVE 091–100, deep-frozen read-only editorial registry. No private reader data. */
(function(root){'use strict';
const EXPECTED=Object.freeze(Array.from({length:4},(_,i)=>{const n=i+101;return `rosewood-${[103].includes(n)?'revised-':''}2027-${String(n).padStart(3,'0')}`;}));
const need=(ok,msg)=>{if(!ok)throw Error('Session26: '+msg);};
const str=x=>typeof x==='string'&&x.trim().length>0&&x.length<20000;
const obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const safe=u=>{try{const x=new URL(u);return x.protocol==='https:'&&!!x.hostname&&!x.username&&!x.password;}catch{return false;}};
const basis=new Set(['source_verified_topic','source_verified_setup_and_editorial_interpretation','editorial_interpretation','author_commentary_and_editorial_interpretation']);
function validate(d,active){
 need(obj(d)&&d.dataset_id==='rosewood-literary-profiles-session26-active'&&d.schema_version==='1.0','dataset');
 need(d.cohort?.session===26&&d.cohort.first_plan_order===101&&d.cohort.last_plan_order===104&&d.cohort.book_count===4,'cohort');
 need(Array.isArray(active)&&active.length===104&&new Set(active.map(b=>b.id)).size===104,'active 104');
 need(Array.isArray(d.profiles)&&d.profiles.length===4,'four profiles');
 need(d.profiles.every((p,i)=>p?.book_id===EXPECTED[i]),'exact active IDs');
 for(let i=0;i<4;i++){
 const p=d.profiles[i],b=active[i+100];
 need(p.book_id===b.id&&p.title===b.title&&p.author===b.author&&p.plan_order===i+101,'active identity mismatch '+(i+91));
 need(p.profile_status==='verified'&&p.verified_at===d.checked_on&&/^\d{4}-\d{2}-\d{2}$/.test(p.verified_at),'verification date');
 for(const k of ['summary','author_and_work_background','before_reading','literary_approach','context','verification_scope','genre_and_form','personal_fit','possible_mismatch'])need(str(p[k]),'missing prose '+k);
 need(obj(p.publication)&&str(p.publication.basis)&&obj(p.series)&&str(p.series.sequence_status),'history and series');
 need(Array.isArray(p.themes)&&p.themes.length>=3&&p.themes.every(t=>str(t.label)&&str(t.discussion)&&basis.has(t.basis)),'editorial themes');
 for(const k of ['reading_questions','discussion_questions'])need(Array.isArray(p[k])&&p[k].length>=2&&p[k].every(str),'specific questions');
 need(p.reading_questions.length+p.discussion_questions.length>=5,'five questions');
 need(p.content_guidance?.status==='limited_non_exhaustive'&&Array.isArray(p.content_guidance.notes),'content guidance');
 need(p.spoiler_policy==='spoiler_light'&&Array.isArray(p.spoiler_sections),'spoilers');
 need(p.edition_information?.pages===null&&p.edition_information?.audio_minutes_1x===null&&/not (?:been )?(?:identified|verified)/i.test(p.edition_information.note),'edition values');
 need(Array.isArray(p.sources)&&p.sources.length>=3,'source count');
 const seen=new Set();for(const s of p.sources){
  need(str(s.id)&&!seen.has(s.id),'duplicate source');seen.add(s.id);
  need(str(s.title)&&str(s.organization)&&safe(s.url)&&s.checked_on===d.checked_on&&str(s.scope)&&str(s.notes)&&['high','medium','limited'].includes(s.confidence),'HTTPS source fields');
  need(Array.isArray(s.supports)&&s.supports.length&&s.supports.every(str),'claim scope');
 }
 need(Array.isArray(p.related_connections)&&p.related_connections.every(r=>active.some(b=>b.id===r.book_id)&&str(r.label)&&str(r.note)),'related active book');
 }
 return Object.freeze({valid:true,count:4,bookIds:EXPECTED});
}
function deepFreeze(x){if(x&&typeof x==='object'&&!Object.isFrozen(x)){Object.freeze(x);for(const v of Object.values(x))deepFreeze(v);}return x;}
function create(d,active){validate(d,active);const m=new Map(d.profiles.map(p=>[p.book_id,deepFreeze(p)]));return Object.freeze({count:4,ids:Object.freeze([...m.keys()]),get:id=>m.get(id)||null,has:id=>m.has(id),validate:()=>validate(d,active)});}
function combine(prev,cohort){need(prev?.count===100&&cohort?.count===4,'100+4 vetted registries required');const ids=Object.freeze([...prev.ids,...cohort.ids]);need(ids.length===104&&new Set(ids).size===104,'104 unique profiles');need(cohort.ids.every((id,i)=>id===EXPECTED[i]),'new active IDs mismatch');return Object.freeze({count:104,ids,get:id=>prev.get(id)||cohort.get(id)||null,has:id=>prev.has(id)||cohort.has(id),validate:()=>Object.freeze({valid:true,count:104})});}
const api=Object.freeze({EXPECTED,validate,create,combine});root.RosewoodLiteraryProfiles26=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
