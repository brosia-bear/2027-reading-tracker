/* Rosewood Session 14 — private literary research and favorites. No network requests.
  The historical v1 backup signature/schema stays unchanged: fields are optional. */
(function(root){'use strict';
 const KINDS=Object.freeze(['reading_note','favorite_passage','question','character','craft','other','ideology','redemption','restitution','institutions']);
 const CATEGORIES=Object.freeze(['book','character','scene','theme','prose','other']);
 const obj=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
 const iso=x=>typeof x==='string'&&/^\d{4}-\d\d-\d\dT/.test(x)&&Number.isFinite(Date.parse(x));
 const required=(v,msg)=>{if(!v)throw new Error(msg)};
 const clean=s=>typeof s==='string'?s.trim():'';
 const uniq=a=>new Set(a).size===a.length;
 function checkEntry(x,ids){required(obj(x),'Research entry must be an object');required(Object.keys(x).sort().join()===['body','book_id','created_at','id','kind','linked_book_ids','tags','title','updated_at'].sort().join(),'Research fields are invalid');
 required(typeof x.id==='string'&&/^research-[a-zA-Z0-9-]{5,100}$/.test(x.id),'Invalid research ID');
 required(ids.has(x.book_id),'Research entry refers to a missing book');
 required(typeof x.title==='string'&&clean(x.title).length>0&&x.title.length<=200,'Research title is required (up to 200 characters)');
 required(typeof x.body==='string'&&x.body.length<=30000,'Research note is too long');
 required(KINDS.includes(x.kind),'Unknown research category');
 required(Array.isArray(x.tags)&&x.tags.length<=12&&uniq(x.tags)&&x.tags.every(t=>typeof t==='string'&&/^[\p{L}\p{N} _-]{1,40}$/u.test(t)),'Invalid or duplicate research tags');
 required(Array.isArray(x.linked_book_ids)&&x.linked_book_ids.length<=30&&uniq(x.linked_book_ids)&&x.linked_book_ids.every(id=>ids.has(id)&&id!==x.book_id),'Linked books must exist and be distinct');
 required(iso(x.created_at)&&iso(x.updated_at),'Invalid research timestamp');return true;
 }
 function checkFavorite(x,ids){required(obj(x),'Favorite must be an object');required(Object.keys(x).sort().join()===['book_id','category','created_at','id','label','reason','updated_at'].sort().join(),'Favorite fields are invalid');
 required(typeof x.id==='string'&&/^favorite-[a-zA-Z0-9-]{5,100}$/.test(x.id),'Invalid favorite ID');
 required(ids.has(x.book_id),'Favorite refers to a missing book');
 required(CATEGORIES.includes(x.category),'Invalid favorite category');
 required(typeof x.label==='string'&&clean(x.label).length>0&&x.label.length<=200,'Favorite label is required');
 required(typeof x.reason==='string'&&x.reason.length<=12000,'Favorite explanation is too long');
 required(iso(x.created_at)&&iso(x.updated_at),'Invalid favorite timestamp');return true;
 }
 function checkCollection(state,ids){const notes=state.overrides.research_entries||[],favorites=state.overrides.reader_favorites||[];
 required(Array.isArray(notes)&&notes.length<=4000,'Research collection is invalid or too large');required(Array.isArray(favorites)&&favorites.length<=4000,'Favorite collection is invalid or too large');
 required(uniq(notes.map(x=>x?.id)),'Duplicate research IDs');required(uniq(favorites.map(x=>x?.id)),'Duplicate favorite IDs');
 for(const x of notes)checkEntry(x,ids);for(const x of favorites)checkFavorite(x,ids);return true;
 }
 function uid(prefix){const val=root.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`;return prefix+'-'+val;}
 function newEntry(values,bookIds,old){const now=new Date().toISOString();const result={id:old?.id||uid('research'),book_id:values.book_id,kind:values.kind||'other',title:values.title,body:values.body||'',tags:values.tags||[],linked_book_ids:values.linked_book_ids||[],created_at:old?.created_at||now,updated_at:now};checkEntry(result,bookIds);return result;}
 function newFavorite(values,bookIds,old){const now=new Date().toISOString();const result={id:old?.id||uid('favorite'),book_id:values.book_id,category:values.category||'book',label:values.label,reason:values.reason||'',created_at:old?.created_at||now,updated_at:now};checkFavorite(result,bookIds);return result;}
 function find(state,{query='',tag='',kind='',bookId=''}={}){const q=clean(query).toLocaleLowerCase();return (state.overrides?.research_entries||[]).filter(x=> (!bookId||x.book_id===bookId||x.linked_book_ids.includes(bookId))&&(!kind||x.kind===kind)&&(!tag||x.tags.includes(tag))&&(!q||[x.title,x.body,x.tags.join(' ')].join(' ').toLocaleLowerCase().includes(q))).slice().sort((a,b)=>b.updated_at.localeCompare(a.updated_at));}
 function counts(state){return CATEGORIES.reduce((a,k)=>(a[k]=(state.overrides?.reader_favorites||[]).filter(f=>f.category===k).length,a),{});}
 const api={KINDS,CATEGORIES,checkEntry,checkFavorite,checkCollection,newEntry,newFavorite,find,counts};root.RosewoodResearch=Object.freeze(api);if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
