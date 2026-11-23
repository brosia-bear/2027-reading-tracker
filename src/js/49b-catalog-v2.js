/* Brosia's Library catalog v2: 200 curated books + 2 daily classics.
 * Runs after the legacy 106-book index is built. It never reuses or renames an
 * existing ID:
 *  - #1–104 keep their established order and IDs, except slots 31 and 37, where
 *    the two Brigitte Knightley novels take the place of the daily classics;
 *  - Piranesi (#105) and The Left Hand of Darkness (#106) keep their IDs;
 *  - #107–200 are new curated additions with their own stable IDs;
 *  - War and Peace and Les Misérables keep their IDs and move to #201 and #202.
 * New additions are never marked "required": that set stays exactly as the
 * reader chose it. UMD so the same code runs in Node tests. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.BrosiaCatalogV2=api;
})(typeof window!=='undefined'?window:typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const SLOW_IDS=['rosewood-revised-2027-031','rosewood-revised-2027-037'];
 const KNIGHTLEY_SLOTS={31:'brosia-plan-2027-dearly-beloathed-01',37:'brosia-plan-2027-dearly-beloathed-02'};
 // Where each new book sits among the app's five shelves.
 const PATHWAY_FOR={philosophy:'philosophy',science_psychology:'nonfiction_research',history_society:'nonfiction_research',
  writing_craft:'nonfiction_research',classics:'standalone_literature_fantasy',speculative_fiction:'standalone_literature_fantasy',
  fantasy:'standalone_literature_fantasy',completed_fantasy_arc:'completed_fantasy_arc',standalone_literature_fantasy:'standalone_literature_fantasy'};
 // Finished trilogies/duologies among the additions (title -> [series, position]).
 const SERIES={
  'The Final Empire':['Mistborn (original trilogy)',1],'The Well of Ascension':['Mistborn (original trilogy)',2],'The Hero of Ages':['Mistborn (original trilogy)',3],
  'The City of Brass':['The Daevabad Trilogy',1],'The Kingdom of Copper':['The Daevabad Trilogy',2],'The Empire of Gold':['The Daevabad Trilogy',3],
  'The Bear and the Nightingale':['The Winternight Trilogy',1],'The Girl in the Tower':['The Winternight Trilogy',2],'The Winter of the Witch':['The Winternight Trilogy',3],
  'Red Sister':['Book of the Ancestor',1],'Grey Sister':['Book of the Ancestor',2],'Holy Sister':['Book of the Ancestor',3],
  'The Blade Itself':['The First Law (original trilogy)',1],'Before They Are Hanged':['The First Law (original trilogy)',2],'Last Argument of Kings':['The First Law (original trilogy)',3],
  'A Memory Called Empire':['Teixcalaan',1],'A Desolation Called Peace':['Teixcalaan',2],
  'Strange the Dreamer':['Strange the Dreamer duology',1],'Muse of Nightmares':['Strange the Dreamer duology',2],
  'The Irresistible Urge to Fall for Your Enemy':['Dearly Beloathed',1],'The Exquisite Torment of Loving Your Enemy':['Dearly Beloathed',2]};
 const SERIES_PATHWAY=new Set(['Mistborn (original trilogy)','The Daevabad Trilogy','The Winternight Trilogy','Book of the Ancestor','The First Law (original trilogy)']);

 function makeBook(entry,order){
  const series=SERIES[entry.title]||null;
  const category=entry.primary_category||'standalone_literature_fantasy';
  return {
   id:entry.id,plan_order:order,title:entry.title,author:entry.author,
   pathway:series&&SERIES_PATHWAY.has(series[0])?'completed_fantasy_arc':(PATHWAY_FOR[category]||'standalone_literature_fantasy'),
   origin:'curated_v2_extension',curated_extension:true,primary_category:category,
   goodreads_eligible_planned:true,publication_year:null,isbn13:null,
   series_arc_id:null,series_position:null,arc_finished_by_2027:null,
   series_name:series?series[0]:null,series_number:series?series[1]:null,
   is_discworld:false,discworld_original_saga:null,
   edition:{edition_name:null,pages:null,audio_minutes_1x:null,estimates_source:'edition_unverified'},
   profile:{status:'pending_research',summary:null,before_reading:null,potential_personal_fit:null,potential_mismatch:null,
    themes:[],reading_questions:[],spoiler_policy:'spoiler_light',source_notes:[],last_verified:null},
   labels:[]};
 }

 function validate(payload){
  if(!payload||payload.format!=='brosia-curated-catalog-v2')throw Error('Invalid curated catalog v2');
  const cur=payload.curated_books,slow=payload.daily_slow_reads;
  if(!Array.isArray(cur)||cur.length!==200)throw Error('Curated catalog must contain exactly 200 books');
  if(!Array.isArray(slow)||slow.length!==2||slow.map(s=>s.id).join()!==SLOW_IDS.join())throw Error('Daily classics must be War and Peace and Les Misérables');
  const ids=[...cur,...slow].map(b=>b.id);
  if(new Set(ids).size!==202)throw Error('Duplicate catalog identifiers');
  cur.forEach((b,i)=>{if((b.display_order||b.plan_order)!==i+1)throw Error('Catalog out of order at '+(i+1));});
 }

 // index: the legacy catalog index (books array + byId map) with 106 entries.
 function extend(index,payload){
  validate(payload);
  if(index.books.length!==106)throw Error('Expected the 106-book legacy index before extension');
  const legacyById=new Map(index.books.map(b=>[b.id,b]));
  const slowBooks=SLOW_IDS.map(id=>legacyById.get(id));
  if(slowBooks.some(b=>!b))throw Error('Daily classics missing from legacy index');
  const out=[];
  payload.curated_books.forEach((entry,i)=>{
   const order=i+1;
   const legacy=legacyById.get(entry.id);
   if(legacy){
    if(SLOW_IDS.includes(entry.id))throw Error('A daily classic cannot occupy a curated slot');
    if(order<=106&&legacy.plan_order!==order&&!KNIGHTLEY_SLOTS[order])throw Error('Original order changed at '+order);
    out.push(legacy);
   }else{
    if(order<=104&&KNIGHTLEY_SLOTS[order]!==entry.id)throw Error('Unexpected new book inside the original 104 at '+order);
    out.push(makeBook(entry,order));
   }
  });
  // Original 104: every legacy ID except the two daily classics, in legacy order.
  const legacyOrder=index.books.filter(b=>!SLOW_IDS.includes(b.id)).map(b=>b.id);
  const newOrder=out.filter(b=>legacyById.has(b.id)).map(b=>b.id);
  if(legacyOrder.join()!==newOrder.join())throw Error('Original relative reading order not preserved');
  slowBooks.forEach((b,i)=>out.push({...b,plan_order:201+i,daily_classic:true}));
  index.books.length=0;index.books.push(...out);
  for(const b of out){index.byId.set(b.id,b);if(!index.covers.has(b.id))index.covers.set(b.id,{book_id:b.id,title:b.title,author:b.author,status:'bundled'});}
  return summary(index);
 }

 function summary(index){
  const curated=index.books.filter(b=>!SLOW_IDS.includes(b.id));
  const slow=index.books.filter(b=>SLOW_IDS.includes(b.id));
  return Object.freeze({curated:curated.length,daily:slow.length,total:index.books.length,
   unique:new Set(index.books.map(b=>b.id)).size});
 }
 return Object.freeze({SLOW_IDS,KNIGHTLEY_SLOTS,extend,validate,summary,makeBook});
});
