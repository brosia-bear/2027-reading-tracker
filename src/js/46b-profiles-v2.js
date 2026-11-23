/* Brosia's Library profiles v2: editorial profiles for the 98 catalog books that
 * the original 104 research cohorts do not cover (the Dearly Beloathed duology,
 * Piranesi, The Left Hand of Darkness and the curated additions #107–200).
 * Read-only, deep-frozen, and checked against the live catalog: every regular
 * book must end up with exactly one profile. UMD so Node tests can load it. */
(function(root){'use strict';
const need=(ok,msg)=>{if(!ok)throw Error('Profiles v2: '+msg);};
const str=x=>typeof x==='string'&&x.trim().length>0&&x.length<20000;
const obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const safe=u=>{try{const x=new URL(u);return x.protocol==='https:'&&!!x.hostname&&!x.username&&!x.password;}catch{return false;}};
const PROSE=['summary','author_and_work_background','before_reading','literary_approach','context','verification_scope','genre_and_form','personal_fit','possible_mismatch'];
function validateProfile(p,book){
 need(obj(p)&&book&&p.book_id===book.id,'unknown book '+(p&&p.book_id));
 need(p.title===book.title&&p.author===book.author,'identity mismatch '+p.book_id);
 need(['sources_checked','editorial_draft'].includes(p.profile_status),'status '+p.book_id);
 for(const k of PROSE)need(str(p[k]),'missing '+k+' for '+p.book_id);
 need(obj(p.publication)&&str(p.publication.basis)&&(Number.isInteger(p.publication.first_publication_year)||str(p.publication.first_publication_period)),'publication '+p.book_id);
 need(obj(p.series)&&str(p.series.name)&&Array.isArray(p.series.sequence)&&str(p.series.sequence_status),'series '+p.book_id);
 need(Array.isArray(p.themes)&&p.themes.length>=3&&p.themes.every(t=>str(t.label)&&str(t.discussion)&&t.basis==='editorial_interpretation'),'themes '+p.book_id);
 need(Array.isArray(p.reading_questions)&&p.reading_questions.length>=3&&p.reading_questions.every(str),'reading questions '+p.book_id);
 need(Array.isArray(p.discussion_questions)&&p.discussion_questions.length>=2&&p.discussion_questions.every(str),'discussion questions '+p.book_id);
 need(p.content_guidance?.status==='limited_non_exhaustive'&&Array.isArray(p.content_guidance.notes)&&p.content_guidance.notes.every(str),'content guidance '+p.book_id);
 need(p.spoiler_policy==='spoiler_light'&&Array.isArray(p.spoiler_sections),'spoilers '+p.book_id);
 need(obj(p.edition_information)&&p.edition_information.pages===null&&p.edition_information.audio_minutes_1x===null&&Array.isArray(p.edition_information.examples),'edition '+p.book_id);
 need(Array.isArray(p.sources),'sources '+p.book_id);
 const seen=new Set();
 for(const s of p.sources){
  need(str(s.id)&&!seen.has(s.id)&&str(s.title)&&str(s.organization)&&safe(s.url)&&str(s.scope)&&['high','medium','limited'].includes(s.confidence)&&Array.isArray(s.supports)&&s.supports.every(str),'source fields '+p.book_id);
  seen.add(s.id);
 }
 need(Array.isArray(p.related_connections)&&p.related_connections.every(r=>str(r.book_id)&&str(r.label)&&str(r.note)),'related '+p.book_id);
}
function deepFreeze(x){if(x&&typeof x==='object'&&!Object.isFrozen(x)){Object.freeze(x);for(const v of Object.values(x))deepFreeze(v);}return x;}
// prev: the combined 104-profile registry. books: every regular catalog book (202 incl. daily classics).
function extend(prev,payload,books){
 need(prev&&typeof prev.get==='function'&&typeof prev.has==='function','previous registry');
 need(obj(payload)&&payload.dataset_id==='brosia-literary-profiles-v2'&&payload.schema_version==='1.0'&&Array.isArray(payload.profiles),'dataset');
 const byId=new Map(books.map(b=>[b.id,b]));
 const mine=new Map();
 for(const p of payload.profiles){
  need(!mine.has(p.book_id)&&!prev.has(p.book_id),'duplicate profile '+p.book_id);
  validateProfile(p,byId.get(p.book_id));
  for(const r of p.related_connections)need(byId.has(r.book_id),'related book not in catalog '+r.book_id);
  mine.set(p.book_id,deepFreeze(p));
 }
 const uncovered=books.filter(b=>!prev.has(b.id)&&!mine.has(b.id)).map(b=>b.title);
 need(!uncovered.length,'books without a profile: '+uncovered.join(', '));
 const ids=Object.freeze([...prev.ids,...mine.keys()]);
 return Object.freeze({count:ids.length,ids,added:mine.size,get:id=>prev.get(id)||mine.get(id)||null,has:id=>prev.has(id)||mine.has(id),isV2:id=>mine.has(id)});
}
const api=Object.freeze({extend,validateProfile});
root.BrosiaProfilesV2=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
