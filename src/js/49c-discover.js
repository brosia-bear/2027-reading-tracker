/* Brosia's Library — Discover engine. Offline, deterministic, explainable.
 * Works over every curated book (and added books) using editorial tags from
 * catalog/facets.txt. Never changes reading order or records by itself.
 *
 * Query semantics: within one facet, options are OR (moods may be switched to
 * AND); across facets, AND. Books missing a tag never silently match a strict
 * filter. UMD so the same code runs in Node tests. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.BrosiaDiscover=api;
})(typeof window!=='undefined'?window:typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const ALIASES=[[/dostoyevsk(y|ii|i)|dostoevsk(ii|i)/g,'dostoevsky'],[/tolstoi/g,'tolstoy'],[/chekov/g,'chekhov'],
  [/nietzche|nietsche/g,'nietzsche'],[/kierkegard/g,'kierkegaard'],[/marcus aurelius antoninus/g,'marcus aurelius']];
 const norm=s=>ALIASES.reduce((v,[re,to])=>v.replace(re,to),String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'')
  .toLowerCase().replace(/[’'`]/g,'').replace(/&/g,' and ').replace(/[^a-z0-9]+/g,' ').trim());
 const LABEL=s=>String(s).replace(/-/g,' ');

 function build(books,facets,isDaily){
  return books.map(b=>{
   const f=facets[b.id]||null;
   const words=[b.title,b.author,b.series_name,...(f?[...f.genres,...f.themes,...f.moods]:[])].filter(Boolean).join(' ');
   return {book:b,f,daily:!!isDaily?.(b),text:' '+norm(words)+' ',titleN:norm(b.title),authorN:norm(b.author)};
  });
 }

 // Match every query word (title, author, series, tags); quoted phrases stay together.
 function search(entries,query){
  const q=String(query||'').trim();if(!q)return [];
  const phrases=[...q.matchAll(/"([^"]+)"/g)].map(m=>norm(m[1]));
  const words=norm(q.replace(/"[^"]*"/g,' ')).split(' ').filter(Boolean);
  const terms=[...phrases,...words];
  return entries.filter(e=>terms.every(t=>e.text.includes(' '+t)||e.text.includes(t+' ')||e.text.includes(t)))
   .map(e=>({entry:e,score:(e.titleN.startsWith(terms[0])?3:0)+(e.titleN.includes(norm(q))?2:0)+(e.authorN.includes(terms[0])?1:0)}))
   .sort((a,b)=>b.score-a.score||a.entry.book.plan_order-b.entry.book.plan_order).map(x=>x.entry);
 }

 const STATUS_OK=(status,progress,id)=>{const s=progress?.[id]?.status||'not_started';return !status?.length||status.includes(s);};

 function filter(entries,q={},progress={}){
  const moods=q.moods||[],genres=q.genres||[],themes=q.themes||[],forms=q.forms||[],lengths=q.lengths||[],efforts=q.efforts||[];
  const excluded=new Set(q.excludeIds||[]);
  const out=[];
  for(const e of entries){
   if(excluded.has(e.book.id))continue;
   if(e.daily&&!q.includeDaily)continue;
   const st=progress?.[e.book.id]?.status;
   if(q.unreadOnly&&(st==='finished'||st==='dnf'))continue;
   if(!STATUS_OK(q.status,progress,e.book.id))continue;
   const f=e.f;if(!f)continue;
   const hitMoods=moods.filter(m=>f.moods.includes(m));
   if(moods.length&&(q.moodMode==='all'?hitMoods.length!==moods.length:!hitMoods.length))continue;
   const hitGenres=genres.filter(g=>f.genres.includes(g));if(genres.length&&!hitGenres.length)continue;
   const hitThemes=themes.filter(t=>f.themes.includes(t));if(themes.length&&!hitThemes.length)continue;
   if(forms.length&&!forms.includes(f.form))continue;
   if(lengths.length&&!lengths.includes(f.length))continue;
   if(efforts.length&&!efforts.includes(f.effort))continue;
   const score=hitMoods.length*3+hitGenres.length*2+hitThemes.length*2+(q.preferUnread&&!st?1:0);
   const reasons=[];
   if(hitMoods.length)reasons.push(hitMoods.map(LABEL).join(', '));
   if(hitGenres.length)reasons.push(hitGenres.map(LABEL).join(', '));
   if(hitThemes.length)reasons.push('about '+hitThemes.map(LABEL).join(', '));
   if(e.book.series_name)reasons.push('part of a finished series');
   out.push({entry:e,score,reasons});
  }
  out.sort((a,b)=>b.score-a.score||a.entry.book.plan_order-b.entry.book.plan_order);
  return diversify(out);
 }
 // Gently avoid runs of the same author at the top (stable, deterministic).
 function diversify(list){
  const out=[],held=[];const recent=[];
  for(const item of list){
   const a=item.entry.authorN;
   if(recent.slice(-2).includes(a)){held.push(item);continue;}
   out.push(item);recent.push(a);
   while(held.length&&!recent.slice(-2).includes(held[0].entry.authorN)){const h=held.shift();out.push(h);recent.push(h.entry.authorN);}
  }
  return out.concat(held);
 }

 // "Help me choose": answers -> query. Every question can be skipped.
 const APPETITE={comfort:['cozy','comforting','tender','hopeful','whimsical'],wonder:['wonder-filled','atmospheric','lyrical','immersive','epic'],
  laughter:['funny','witty','whimsical','absurd'],sadness:['emotionally-devastating','tragic','cathartic'],romance:['romantic','enemies-to-lovers','tender'],
  mystery:['mysterious','suspenseful','eerie'],injustice:['justice-minded','rebellious'],ideas:['thought-provoking','philosophical','contemplative','challenging']};
 function guided(a={}){
  const q={unreadOnly:true,moods:[],moodMode:'any'};
  if(a.kind==='fiction')q.forms=['fiction'];
  else if(a.kind==='nonfiction')q.forms=['nonfiction','philosophy','memoir','craft'];
  if(a.energy==='light')q.efforts=['light'];else if(a.energy==='moderate')q.efforts=['light','moderate'];else if(a.energy==='demanding')q.efforts=['moderate','demanding'];
  if(a.appetite&&APPETITE[a.appetite])q.moods=APPETITE[a.appetite];
  if(a.time==='short')q.lengths=['short'];else if(a.time==='medium')q.lengths=['short','medium'];else if(a.time==='long')q.lengths=['long','epic'];
  return q;
 }

 // Surprise me: random from the pool without repeats until the pool is used up.
 function makeBag(random=Math.random){
  let used=new Set();
  return function next(pool){
   const ids=pool.map(x=>(x.entry||x).book.id);
   let left=ids.filter(id=>!used.has(id));
   if(!left.length){used=new Set();left=ids;}
   if(!left.length)return null;
   const id=left[Math.floor(random()*left.length)];used.add(id);
   return pool.find(x=>(x.entry||x).book.id===id);
  };
 }

 function counts(entries,key){
  const m=new Map();for(const e of entries)if(e.f&&!e.daily)for(const v of e.f[key])m.set(v,(m.get(v)||0)+1);
  return [...m].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));
 }
 return Object.freeze({norm,build,search,filter,guided,makeBag,counts,APPETITE,LABEL});
});
