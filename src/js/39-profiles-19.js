/* Session 19: fourth individually researched cohort of CURRENT ACTIVE reading-plan IDs.
  Pure immutable editorial information. No storage, network, telemetry, or changes to user records. */
(function(root){'use strict';
 const EXPECTED=Object.freeze(Array.from({length:10},(_,i)=>{const n=String(i+31).padStart(3,'0');return ['031','037'].includes(n)?`rosewood-revised-2027-${n}`:`rosewood-2027-${n}`;}));
 const good=x=>typeof x==='string'&&x.trim().length>0&&x.length<20000;
 const object=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
 const need=(x,msg)=>{if(!x)throw Error('Session19: '+msg);};
 const https=x=>{try{const u=new URL(x);return u.protocol==='https:'&&u.hostname&&!u.username&&!u.password;}catch(_){return false;}};
 const allowed=new Set(['source_verified_topic','source_verified_setup_and_editorial_interpretation','editorial_interpretation','author_commentary_and_editorial_interpretation']);
 function validate(d,activeBooks){
 need(object(d)&&d.schema_version==='1.0'&&d.dataset_id==='rosewood-literary-profiles-session19-active','invalid dataset');
 need(d.cohort?.session===19&&d.cohort.first_plan_order===31&&d.cohort.last_plan_order===40&&d.cohort.book_count===10,'cohort');
 need(Array.isArray(activeBooks)&&activeBooks.length===104&&new Set(activeBooks.map(b=>b.id)).size===104,'active 104 required');
 need(Array.isArray(d.profiles)&&d.profiles.length===10,'ten profiles required');
 need(d.profiles.every((p,i)=>p?.book_id===EXPECTED[i]),'exact revised active ID order');
 for(let i=0;i<10;i++){
  const p=d.profiles[i], b=activeBooks[i+30];
  need(p.plan_order===i+31&&p.title===b.title&&p.author===b.author&&p.book_id===b.id, 'active identity mismatch '+(i+31));
  need(p.profile_status==='verified'&&p.verified_at===d.checked_on&&/^\d{4}-\d\d-\d\d$/.test(p.verified_at),'research date');
  for(const k of ['summary','verification_scope','author_and_work_background','before_reading','literary_approach','context','genre_and_form','personal_fit','possible_mismatch'])need(good(p[k]),k);
  need(object(p.publication)&&good(p.publication.basis)&&object(p.series)&&good(p.series.sequence_status),'publication and series');
  need(Array.isArray(p.themes)&&p.themes.length>=3&&p.themes.every(t=>good(t.label)&&good(t.discussion)&&allowed.has(t.basis)),'themes');
  for(const k of ['reading_questions','discussion_questions'])need(Array.isArray(p[k])&&p[k].length>=2&&p[k].every(good),'questions');
  need(p.content_guidance?.status==='limited_non_exhaustive'&&Array.isArray(p.content_guidance.notes),'content disclaimer');
  need(p.spoiler_policy==='spoiler_light'&&Array.isArray(p.spoiler_sections),'spoiler policy');
  need(p.edition_information?.pages===null&&p.edition_information?.audio_minutes_1x===null&&/not (?:been )?(?:identified|verified)/i.test(p.edition_information.note),'no fabricated edition');
  need(Array.isArray(p.sources)&&p.sources.length>=3,'source count');
  const ids=new Set();for(const s of p.sources){
  need(good(s.id)&&!ids.has(s.id),'duplicate source');ids.add(s.id);
  need(good(s.title)&&good(s.organization)&&https(s.url)&&s.checked_on===d.checked_on&&good(s.scope)&&good(s.notes)&&['high','medium','limited'].includes(s.confidence),'safe complete source');
  need(Array.isArray(s.supports)&&s.supports.length>=1&&s.supports.every(good),'source claim map');
  }
  need(Array.isArray(p.related_connections)&&p.related_connections.every(r=>activeBooks.some(b=>b.id===r.book_id)&&good(r.label)&&good(r.note)),'related active IDs');
 }
 return Object.freeze({valid:true,count:10,bookIds:EXPECTED});
 }
 function deepFreeze(o){if(!o||typeof o!=='object'||Object.isFrozen(o))return o;Object.freeze(o);for(const v of Object.values(o))deepFreeze(v);return o;}
 function create(d,activeBooks){validate(d,activeBooks);const records=new Map(d.profiles.map(p=>[p.book_id,deepFreeze(p)]));return Object.freeze({count:10,ids:Object.freeze([...records.keys()]),get:id=>records.get(id)||null,has:id=>records.has(id),validate:()=>validate(d,activeBooks)});}
 function combine(existing,newCohort){need(existing?.count===30&&newCohort?.count===10,'30+10 validated registries required');const ids=Object.freeze([...existing.ids,...newCohort.ids]);need(ids.length===40&&new Set(ids).size===40,'40 unique profile IDs');need(ids.every((id,i)=>i<30?id===`rosewood-2027-${String(i+1).padStart(3,'0')}`:id===EXPECTED[i-30]),'first 30 preserved and new active IDs exact');return Object.freeze({count:40,ids,get:id=>existing.get(id)||newCohort.get(id)||null,has:id=>existing.has(id)||newCohort.has(id),validate:()=>Object.freeze({valid:true,count:40})});}
 const api=Object.freeze({EXPECTED,validate,create,combine});root.RosewoodLiteraryProfiles19=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
