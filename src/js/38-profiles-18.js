/* Rosewood Session 18 — third audited, immutable profile cohort.
  No storage operations, network requests, or reader-data references. */
(function(root){'use strict';
 const EXPECTED=Object.freeze(Array.from({length:10},(_,i)=>`rosewood-2027-${String(i+21).padStart(3,'0')}`));
 const goodText=x=>typeof x==='string'&&x.trim().length>0&&x.length<=20000;
 const obj=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
 const require=(ok,why)=>{if(!ok)throw Error(why);};
 const https=x=>{try{let u=new URL(x);return u.protocol==='https:'&&!!u.hostname&&!u.username&&!u.password;}catch(_){return false;}};
 const allowedThemes=new Set(['source_verified_topic','source_verified_setup_and_editorial_interpretation','editorial_interpretation','author_commentary_and_editorial_interpretation']);
 function validate(payload,catalog){
 require(obj(payload)&&payload.schema_version==='1.0','Session 18 invalid profile format');
 require(Array.isArray(payload.profiles)&&payload.profiles.length===10,'Session 18 requires exactly ten researched profiles');
 const books=Array.isArray(catalog?.books)?catalog.books:[];require(books.length===104,'104-book protected catalog required');
 const ids=payload.profiles.map(p=>p?.book_id);
 require(ids.every((id,i)=>id===EXPECTED[i]),'Session 18 stable IDs must be 021–030 in original order');
 const byId=new Map(books.map(b=>[b.id,b]));
 require(new Set(books.map(b=>b.id)).size===104,'Protected catalog has duplicate IDs');
 for(let i=0;i<10;i++){
  const p=payload.profiles[i], b=byId.get(EXPECTED[i]);require(obj(p)&&b,'Profile must match real catalog book');
  require(p.plan_order===i+21&&b.plan_order===i+21&&p.title===b.title&&p.author===b.author,`Profile title, author or order mismatch ${EXPECTED[i]}`);
  require(p.profile_status==='verified'&&p.verified_at===payload.checked_on&&/^\d{4}-\d{2}-\d{2}$/.test(p.verified_at),'Research date/status invalid');
  for(const k of ['verification_scope','genre_and_form','summary','author_and_work_background','before_reading','literary_approach','context','personal_fit','possible_mismatch'])require(goodText(p[k]),`Missing research field ${k}`);
  require(obj(p.publication)&&goodText(p.publication.basis),'Publication provenance missing');
  require(obj(p.series)&&goodText(p.series.sequence_status),'Series disclosure missing');
  require(Array.isArray(p.themes)&&p.themes.length>=3&&p.themes.every(t=>obj(t)&&goodText(t.label)&&goodText(t.discussion)&&allowedThemes.has(t.basis)),'Themes incomplete or mislabeled');
  for(const k of ['reading_questions','discussion_questions'])require(Array.isArray(p[k])&&p[k].length>=2&&p[k].every(goodText),`Questions missing ${k}`);
  require(obj(p.content_guidance)&&p.content_guidance.status==='limited_non_exhaustive'&&Array.isArray(p.content_guidance.notes),'Do not overclaim content audit');
  require(p.spoiler_policy==='spoiler_light'&&Array.isArray(p.spoiler_sections),'Spoiler policy missing');
  require(obj(p.edition_information)&&/not (?:been )?(?:identified|verified)/i.test(p.edition_information.note),'Reader edition uncertainty must be explicit');
  require(p.edition_information.pages===null&&p.edition_information.audio_minutes_1x===null,'Unverified reader edition values must remain null');
  require(Array.isArray(p.sources)&&p.sources.length>=2,'Each book needs at least two sources');
  const seen=new Set();for(const s of p.sources){
  require(obj(s)&&goodText(s.id)&&!seen.has(s.id),'Source IDs must be unique');seen.add(s.id);
  require(goodText(s.title)&&goodText(s.organization)&&https(s.url),'Source must be an HTTPS title-specific citation');
  require(s.checked_on===payload.checked_on&&goodText(s.scope)&&['high','medium','limited'].includes(s.confidence),'Source provenance not complete');
  require(Array.isArray(s.supports)&&s.supports.length&&s.supports.every(goodText),'Source claim mapping missing');
  }
  require(Array.isArray(p.related_connections),'Related connections missing');
  for(const r of p.related_connections)require(obj(r)&&byId.has(r.book_id)&&goodText(r.label)&&goodText(r.note),'Related connection does not resolve');
 }
 return Object.freeze({valid:true,count:10,bookIds:EXPECTED.slice()});
 }
 function deepFreeze(o){if(!o||typeof o!=='object'||Object.isFrozen(o))return o;Object.freeze(o);for(const v of Object.values(o))deepFreeze(v);return o;}
 function create(payload,catalog){validate(payload,catalog);const map=new Map(payload.profiles.map(p=>[p.book_id,deepFreeze(p)]));return Object.freeze({count:10,ids:Object.freeze([...map.keys()]),get:id=>map.get(id)||null,has:id=>map.has(id),validate:()=>validate(payload,catalog)});}
 function combine(first,second){require(first?.count===20&&second?.count===10,'Combine requires validated twenty-book registry and third ten-book cohort');const ids=Object.freeze([...first.ids,...second.ids]);require(new Set(ids).size===30&&ids.every((id,i)=>id===`rosewood-2027-${String(i+1).padStart(3,'0')}`),'Combined 30 profile IDs/order are invalid');return Object.freeze({count:30,ids,get:id=>first.get(id)||second.get(id)||null,has:id=>first.has(id)||second.has(id),validate:()=>Object.freeze({valid:true,count:30})});}
 const api=Object.freeze({EXPECTED,validate,create,combine});root.RosewoodLiteraryProfiles18=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
