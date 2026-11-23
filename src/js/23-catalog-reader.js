/* Rosewood Library — Session 6 offline catalog reader. No reader records are written here.
  UMD to enable deterministic Node regression tests and a browser-global pure adapter. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.RosewoodCatalog=api;
})(typeof window!=='undefined'?window:typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const PATHS={discworld:'Discworld',completed_fantasy_arc:'Completed fantasy',philosophy:'Philosophy',nonfiction_research:'Research & nonfiction',standalone_literature_fantasy:'Literature & standalones'};
 const EXPECTED={discworld:21,completed_fantasy_arc:20,philosophy:19,nonfiction_research:24,standalone_literature_fantasy:20};
 const normalize=s=>String(s??'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim().replace(/\s+/g,' ');
 const textKey=s=>normalize(s).replace(/ /g,'');
 const compare=(a,b)=>String(a).localeCompare(String(b),'en',{numeric:true,sensitivity:'base'});
 const assert=(test,message)=>{if(!test)throw new Error('Rosewood catalog integrity: '+message)};
 function create(catalog,arcPayload,coverPayload,baseline){
  assert(catalog?.books?.length===104,'expected 104 immutable source books');
  assert(arcPayload?.arcs?.length===10,'expected ten original main-arc/collection records');
  assert(coverPayload?.covers?.length===104,'expected 104 cover provenance records');
  assert(baseline?.total===20&&baseline.titles?.length===20,'expected 20 separate 2026 Discworld baseline titles');
  const books=catalog.books, arcs=arcPayload.arcs;
  const byId=new Map(),byArc=new Map(),covers=new Map(),pathways=Object.fromEntries(Object.keys(EXPECTED).map(k=>[k,0]));
  books.forEach((b,i)=>{
   const id=`rosewood-2027-${String(i+1).padStart(3,'0')}`;
   assert(b.id===id&&b.plan_order===i+1,'stable ID and plan_order mismatch at position '+(i+1));
   assert(!byId.has(b.id),'duplicate ID '+b.id);
   assert(typeof b.title==='string'&&b.title.trim()&&typeof b.author==='string'&&b.author.trim(),'book title/author missing');
   assert(Object.hasOwn(EXPECTED,b.pathway),'unknown pathway for '+b.id);
   assert(b.origin==='user_approved_2027_plan'&&b.goodreads_eligible_planned===true,'planned book provenance/eligibility invalid');
   byId.set(b.id,b);pathways[b.pathway]++;
  });
  for(const [name,n] of Object.entries(EXPECTED))assert(pathways[name]===n,'wrong pathway count '+name);
  const seenArcIds=new Set();
  arcs.forEach(arc=>{
   assert(typeof arc.id==='string'&&!seenArcIds.has(arc.id),'duplicate/invalid arc ID');seenArcIds.add(arc.id);
   assert(arc.main_arc_complete===true,'unfinished main arc '+arc.id);
   assert(Array.isArray(arc.books_planned_2027)&&Array.isArray(arc.previously_read_titles),'malformed arc '+arc.id);
   assert(arc.total_main_arc_books===arc.books_planned_2027.length+arc.previously_read_titles.length,'arc length conflict '+arc.id);
   const memberSet=new Set();
   for(const id of arc.books_planned_2027){assert(byId.has(id),'unknown arc member '+id);assert(!memberSet.has(id),'duplicate arc member '+id);memberSet.add(id);}
   byArc.set(arc.id,arc);
  });
  const disc=arcs.find(x=>x.id==='discworld:full');
  assert(disc&&disc.books_planned_2027.length===21&&disc.previously_read_titles.length===20&&disc.total_main_arc_books===41,'Discworld baseline conflicts with main arc');
  assert(new Set(disc.previously_read_titles).size===20,'duplicate historical Discworld title');
  assert(disc.previously_read_titles.every((v,i)=>v===baseline.titles[i]),'2026 baseline title/order mismatch');
  assert(new Set(disc.books_planned_2027).size===21,'duplicate 2027 Discworld member');
  assert(disc.books_planned_2027.every(id=>byId.get(id).is_discworld),'non-Discworld member in Discworld collection');
  for(const b of books){
   if(b.series_arc_id)assert(byArc.has(b.series_arc_id)&&byArc.get(b.series_arc_id).books_planned_2027.includes(b.id),'missing link to series arc for '+b.id);
  }
  for(const c of coverPayload.covers){
   assert(byId.has(c.book_id)&&!covers.has(c.book_id),'duplicate/unknown cover record '+c.book_id);
   const b=byId.get(c.book_id);
   assert(c.title===b.title&&c.author===b.author,'cover provenance mismatch '+c.book_id);
   assert(c.provider==='Open Library','unapproved cover provider '+c.book_id);
   // A fabricated ID or unreviewed URL must not masquerade as verified provenance.
   if(c.status==='lookup_pending')assert(c.cover_id==null&&c.cover_url==null,'pending cover has prefilled cover identity');
   covers.set(c.book_id,c);
  }
  return Object.freeze({books,arcs,baseline,byId,byArc,covers,pathways:Object.freeze(pathways)});
 }
 function query(index,{q='',pathway='all',sort='plan',arc='all',scope='planned'}={}){
  if(scope==='custom')return []; // Custom books are future device records; never silently merge them with the immutable seed.
  const search=normalize(q);
  let result=index.books.filter(b=>{
   if(pathway!=='all'&&b.pathway!==pathway)return false;
   if(arc!=='all'&&!index.byArc.get(arc)?.books_planned_2027.includes(b.id))return false;
   if(!search)return true;
   const arcName=b.series_arc_id?index.byArc.get(b.series_arc_id)?.name:'';
   return normalize([b.title,b.author,b.pathway,PATHS[b.pathway],arcName,b.discworld_original_saga,...(b.labels||[])].join(' ')).includes(search);
  });
  result=result.slice();
  const comparator={
   plan:(a,b)=>a.plan_order-b.plan_order,
   title:(a,b)=>compare(a.title,b.title)||a.plan_order-b.plan_order,
   author:(a,b)=>compare(a.author,b.author)||compare(a.title,b.title)||a.plan_order-b.plan_order,
   pathway:(a,b)=>compare(PATHS[a.pathway],PATHS[b.pathway])||a.plan_order-b.plan_order,
   series:(a,b)=>compare(a.series_arc_id||'~',b.series_arc_id||'~')||(a.series_position??999)-(b.series_position??999)||a.plan_order-b.plan_order
  }[sort]||((a,b)=>a.plan_order-b.plan_order);
  return result.sort(comparator);
 }
 function matchOpenLibrary(book,data){
  if(!data||!Array.isArray(data.docs))return null;
  const normTitle=t=>normalize(t).replace(/^(?:the|a) /,'').replace(/\s+(?:a novel|volume [ivx]+)$/,'');
  const wantedTitle=normTitle(book.title),wantedAuthor=textKey(book.author);
  const authorPart=book.author.split(/\s+and\s+|\s*&\s*|,/i)[0].trim();
  const normAuthor=t=>normalize(t).replace(/dostoyevsky|dostoyevskiy|dostoevskiy/g,'dostoevsky');
  const authorWords=normAuthor(authorPart).split(' ').filter(Boolean);
  const authorSurname=authorWords.at(-1),authorFirst=authorWords[0];
  for(const doc of data.docs){
   if(!Number.isSafeInteger(doc.cover_i)||doc.cover_i<1||doc.cover_i>9999999999)continue;
   const got=normTitle(doc.title||'');
   if(got!==wantedTitle && !got.startsWith(wantedTitle+' '))continue;
   if(!Array.isArray(doc.author_name)||!doc.author_name.some(a=>{
     const words=normAuthor(a).split(' ').filter(Boolean);
     return textKey(a)===wantedAuthor || (words.at(-1)===authorSurname && authorFirst && words[0]?.[0]===authorFirst[0]);
   }))continue;
   // Search matching verifies a title/author work, not an exact printing or cover edition.
   const workKey=typeof doc.key==='string'&&/^\/works\/OL\d+W$/.test(doc.key)?doc.key:null;
   return {status:'work_matched_edition_unverified',provider:'Open Library',work_key:workKey,cover_id:doc.cover_i,cover_url:`https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg?default=false`,match_method:'normalized_title_author_with_subtitle_tolerance',edition_verified:false};
  }
  return null;
 }
 function coverLookupURL(book){
  const u=new URL('https://openlibrary.org/search.json');
  u.searchParams.set('title',book.title);u.searchParams.set('author',book.author);
  u.searchParams.set('fields','key,title,author_name,cover_i');u.searchParams.set('limit','20');
  return u.toString();
 }
 return Object.freeze({create,query,normalize,matchOpenLibrary,coverLookupURL,PATHS,EXPECTED});
});
