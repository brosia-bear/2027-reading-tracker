/* Brosia's Library — category ladders: 5, 10, 15, 20, 25 finished books per shelf.
 * Computed from saved finished records every time (never stored), so a tier
 * cannot be awarded twice, refreshes and syncs never create new events, and
 * un-finishing a book corrects the count. A book may count toward several
 * shelves (e.g. Psychology and Nonfiction); the 52/104 goals still count it once.
 * The tier date is the finish date of the book that reached it. UMD for tests. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.BrosiaLadders=api;
})(typeof window!=='undefined'?window:typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const TIERS=[5,10,15,20,25];
 const TIER_NAMES=['Bronze','Copper','Silver','Gold','Rosewood'];
 const has=(f,...g)=>!!f&&g.some(x=>f.genres.includes(x));
 const SHELVES=[
  {id:'philosophy',title:'Philosophy & Ethics',about:'Philosophy, ethics and political thought.',
   test:(f,b)=>f?.form==='philosophy'||has(f,'philosophy','ethics','existentialism','stoicism','political-philosophy')||b.pathway==='philosophy'},
  {id:'nonfiction',title:'Nonfiction & Research',about:'Any nonfiction: science, history, psychology, essays.',
   test:(f,b)=>f?['nonfiction','memoir'].includes(f.form):b.pathway==='nonfiction_research'},
  {id:'science',title:'Science & Nature',about:'Biology, medicine, the cosmos and the natural world.',
   test:f=>has(f,'science','biology','neuroscience','medicine','nature','astronomy')},
  {id:'psychology',title:'Psychology & Behavior',about:'How minds work, and why people do what they do.',
   test:f=>has(f,'psychology','social-psychology','moral-psychology','neuroscience','trauma','behavioral-economics','rationality')},
  {id:'history',title:'History & Society',about:'History, justice, politics and how societies work.',
   test:f=>has(f,'history','social-justice','sociology','politics','law','anthropology','revolution')},
  {id:'classics',title:'Russian & World Classics',about:'Dostoevsky, Tolstoy, Chekhov and the great classics.',
   test:f=>has(f,'russian-classic','classic')},
  {id:'literary',title:'Literary Fiction & Ideas',about:'Literary and philosophical fiction, stories and plays.',
   test:(f,b)=>f?f.form==='fiction'&&has(f,'literary-fiction','philosophical-fiction','magical-realism','literary-fantasy','short-stories','drama','poetry','gothic','satire'):b.pathway==='standalone_literature_fantasy'},
  {id:'fantasy',title:'Fantasy & Speculative Fiction',about:'Epic and literary fantasy, myth and science fiction.',
   test:(f,b)=>f?f.form==='fiction'&&f.genres.some(g=>/fantasy|science-fiction|mythic|fairy-tale|space-opera|dystopia/.test(g)):['discworld','completed_fantasy_arc'].includes(b.pathway)},
  {id:'craft',title:'Writing Craft & Storytelling',about:'Books about writing and how stories work.',
   test:f=>f?.form==='craft'||has(f,'writing-craft')},
  {id:'memoir',title:'Memoirs & Life Stories',about:'Memoir and biography.',
   test:f=>f?.form==='memoir'||has(f,'memoir','biography')},
  {id:'arcs',title:'Discworld & Finished Fantasy Arcs',about:'Discworld, and fantasy series with a finished arc.',
   test:(f,b)=>has(f,'discworld')||b.pathway==='discworld'||b.pathway==='completed_fantasy_arc'||(!!b.series_name&&f?.form==='fiction')}];

 const finishedDate=r=>r&&r.status==='finished'&&typeof r.finished_at==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(r.finished_at)?r.finished_at:null;

 // books: catalog + added books; facets: {id: tags}; progress: state.progress; scope: 'year' (2027) | 'all'
 function evaluate(books,facets,progress,scope='year',year=2027){
  const done=[];
  for(const b of books){
   const d=finishedDate(progress?.[b.id]);if(!d)continue;
   if(scope==='year'&&!d.startsWith(year+'-'))continue;
   done.push({book:b,date:d,f:facets[b.id]||null});
  }
  done.sort((a,b)=>a.date.localeCompare(b.date)||String(a.book.id).localeCompare(String(b.book.id)));
  return SHELVES.map(s=>{
   const counted=done.filter(x=>s.test(x.f,x.book));
   const tiers=TIERS.map((n,i)=>({threshold:n,name:TIER_NAMES[i],earned:counted.length>=n,earned_on:counted.length>=n?counted[n-1].date:null}));
   const next=TIERS.find(n=>counted.length<n)||null;
   return {id:s.id,title:s.title,about:s.about,count:counted.length,next,tiers,books:counted.map(x=>({id:x.book.id,title:x.book.title,date:x.date}))};
  });
 }
 return Object.freeze({TIERS,TIER_NAMES,SHELVES,evaluate});
});
