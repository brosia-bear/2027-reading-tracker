/* Rosewood Session 16 — bundled, source-audited literary profiles.
 * Pure read-only catalogue overlay. Never reads or writes reader state and makes no requests.
 */
(function(root){'use strict';
 const obj=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
 const text=x=>typeof x==='string'&&x.trim().length>0;
 const https=x=>{try{return new URL(x).protocol==='https:';}catch(_){return false;}};
 const required=(ok,msg)=>{if(!ok)throw new Error(msg);};
 const EXPECTED=Array.from({length:10},(_,i)=>`rosewood-2027-${String(i+1).padStart(3,'0')}`);
 const CONFIDENCE=['high','medium','limited'];
 const SCOPE=['work','work and edition metadata','edition metadata','series/work','author bibliography','author biography and research context','author biography','reader review and chapter topics','specific edition metadata','specific edition metadata and work summary','author catalog and setting description','author interview','work history and authorial process','title-level synopsis and edition record','original work text and bibliographic record','original edition metadata','scholarly author context','third-edition bibliographic record and overview','author profile and book scope','author biography','publisher synopsis, award record and edition data','independent review and narrative-form discussion'];
 function validate(payload,catalog){
 required(obj(payload)&&payload.schema_version==='1.0','Literary profile dataset version is invalid');
 required(Array.isArray(payload.profiles)&&payload.profiles.length===10,'Session 16 must contain exactly ten profiles');
 const books=Array.isArray(catalog?.books)?catalog.books:[];
 required(books.length===104,'Protected catalog must contain 104 books');
 const byId=new Map(books.map(b=>[b.id,b]));
 const ids=payload.profiles.map(p=>p?.book_id);
 required(ids.every((id,i)=>id===EXPECTED[i]),'Session 16 profiles must be the first ten stable IDs in exact plan order');
 required(new Set(ids).size===10,'Duplicate profile book IDs');
 for(let i=0;i<payload.profiles.length;i++){
  const p=payload.profiles[i],b=byId.get(EXPECTED[i]);
  required(obj(p),'Profile must be an object');
  required(p.plan_order===i+1&&p.title===b.title&&p.author===b.author,'Profile title, author or plan order does not match the protected catalog: '+EXPECTED[i]);
  required(p.profile_status==='verified'&&/^\d{4}-\d{2}-\d{2}$/.test(p.verified_at),'Profile verification status/date is invalid');
  for(const key of ['verification_scope','genre_and_form','summary','author_and_work_background','before_reading','literary_approach','context','personal_fit','possible_mismatch'])required(text(p[key])&&p[key].length<=12000,`Profile ${p.book_id} is missing ${key}`);
  required(obj(p.publication)&&text(p.publication.basis),'Publication provenance is missing');
  required(obj(p.series)&&text(p.series.sequence_status),'Series placement disclosure is missing');
  required(Array.isArray(p.themes)&&p.themes.length>=3&&p.themes.every(t=>obj(t)&&text(t.label)&&text(t.discussion)&&text(t.basis)),'Theme records are incomplete');
  for(const key of ['reading_questions','discussion_questions'])required(Array.isArray(p[key])&&p[key].length>=2&&p[key].every(text),`Profile ${p.book_id} has insufficient ${key}`);
  required(obj(p.content_guidance)&&p.content_guidance.status==='limited_non_exhaustive'&&Array.isArray(p.content_guidance.notes),'Content-guidance scope must be explicit and non-exhaustive');
  required(p.spoiler_policy&&Array.isArray(p.spoiler_sections),'Spoiler policy is missing');
  required(obj(p.edition_information)&&text(p.edition_information.note),'Edition uncertainty must be disclosed');
  required(Array.isArray(p.sources)&&p.sources.length>=2,'Each profile requires at least two source records');
  const sourceIds=new Set();
  for(const s of p.sources){
  required(obj(s)&&text(s.id)&&!sourceIds.has(s.id),'Source IDs must be unique within a profile');sourceIds.add(s.id);
  required(text(s.title)&&text(s.organization)&&https(s.url),'Source title, organization and HTTPS URL are required');
  required(s.checked_on===payload.checked_on&&/^\d{4}-\d{2}-\d{2}$/.test(s.checked_on),'Source check date is invalid');
  required(text(s.scope)&&CONFIDENCE.includes(s.confidence),'Source scope/confidence is invalid');
  required(Array.isArray(s.supports)&&s.supports.length>0&&s.supports.every(text),'Every source must identify supported claims');
  }
  required(Array.isArray(p.related_connections),'Related-book connections must be an array');
  for(const r of p.related_connections)required(obj(r)&&byId.has(r.book_id)&&text(r.label)&&text(r.note),'Related-book link must resolve to a protected catalog ID');
 }
 return Object.freeze({valid:true,count:10,bookIds:EXPECTED.slice()});
 }
 function deepFreeze(o){if(!o||typeof o!=='object'||Object.isFrozen(o))return o;Object.freeze(o);Object.values(o).forEach(deepFreeze);return o;}
 function create(payload,catalog){validate(payload,catalog);const byId=new Map(payload.profiles.map(p=>[p.book_id,deepFreeze(p)]));
 return Object.freeze({count:byId.size,ids:Object.freeze([...byId.keys()]),get:id=>byId.get(id)||null,has:id=>byId.has(id),validate:()=>validate(payload,catalog)});
 }
 const api=Object.freeze({EXPECTED,validate,create});root.RosewoodLiteraryProfiles=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
