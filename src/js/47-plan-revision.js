/* Rosewood 2027 explicit user-selected plan revision. Preserve historical IDs rather than
  repurposing old saved progress, notes, favorites or Goodreads history for new books. */
(function(root,factory){
 const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.RosewoodPlanRevision=api;
})(typeof window!=='undefined'?window:typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 function apply(index,payload){
 if(!payload||payload.format!=='rosewood-plan-revision-v1'||!Array.isArray(payload.substitutions)||payload.substitutions.length!==13)throw Error('Invalid approved plan revision');
 const originals=[],changed=new Set();
 for(const r of payload.substitutions){
  const slot=r.slot-1,prior=index.books[slot];
  if(!Number.isInteger(slot)||slot<0||slot>=104||!prior||prior.id!==r.old_id||prior.title!==r.old_title||prior.author!==r.old_author)throw Error('Plan revision does not match original book '+r.slot);
  if(prior.pathway!=='standalone_literature_fantasy'||prior.series_arc_id||changed.has(slot)||index.byId.has(r.new_id)||!/^(rosewood-revised-2027-\d{3})$/.test(r.new_id))throw Error('Unsafe book replacement');
  if(typeof r.title!=='string'||!r.title||typeof r.author!=='string'||!r.author)throw Error('Missing revised book identity');
  changed.add(slot);originals.push(prior);
  const replacement={...prior,id:r.new_id,title:r.title,author:r.author,
   origin:'reader_requested_2027_revision',edition:{edition_name:null,pages:null,audio_minutes_1x:null,estimates_source:'edition_unverified'},
   profile:{...prior.profile,status:'pending_research',summary:null,before_reading:null,potential_personal_fit:null,potential_mismatch:null,
    themes:[],reading_questions:[],source_notes:[],last_verified:null},labels:['Revised 2027 selection','Russian literature and classics'],
   revision_of:r.old_id,revision_note:r.notes};
  index.books[slot]=replacement;index.byId.set(replacement.id,replacement);
  index.covers.set(replacement.id,{book_id:replacement.id,title:replacement.title,author:replacement.author,provider:'Open Library',status:'lookup_pending',cover_id:null,cover_url:null});
 }
 if(index.books.length!==104||new Set(index.books.map(b=>b.id)).size!==104)throw Error('Revised plan must retain 104 distinct active books');
 return Object.freeze({previous:originals,revision:payload});
 }
 return Object.freeze({apply});
});
