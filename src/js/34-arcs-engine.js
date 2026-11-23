/* Rosewood Library Session 13 — pure, date-aware story arc and pathway engine.
 * Historical context is NEVER automatically treated as a reader completion.
 * Does not mutate data, grant achievements, make network requests or reorder without consent. */
(function(root){
 'use strict';
 const PATHS=['discworld','completed_fantasy_arc','philosophy','nonfiction_research','standalone_literature_fantasy'];
 const validDate=s=>typeof s==='string'&&/^\d{4}-\d\d-\d\d$/.test(s)&&!Number.isNaN(Date.parse(s+'T12:00:00Z'))&&new Date(s+'T12:00:00Z').toISOString().slice(0,10)===s;
 const assert=(v,m)=>{if(!v)throw Error(m)};
 function credit(state,b,asOf='2027-12-31'){
 const r=state?.progress?.[b.id];const eligible=b.id.startsWith('rosewood-custom-')?b.goodreads_eligible===true:b.goodreads_eligible_planned===true;
 return eligible&&r?.goodreads_eligible===true&&r.status==='finished'&&r.percent===100&&validDate(r.finished_at)&&r.finished_at>='2027-01-01'&&r.finished_at<='2027-12-31'&&r.finished_at<=asOf;
 }
 function snapshots(index,state,asOf='2027-12-31'){
 assert(index?.arcs?.length===10 && [104,106].includes(index?.books?.length),'Original 104-book seed must remain intact; optional two supplemental regular books may be present');
 assert(state&&typeof state==='object','Missing reader state');assert(validDate(asOf),'Invalid snapshot date');
 const views=index.arcs.map(a=>{
  assert(a.main_arc_complete===true,'Unfinished main story arc cannot be represented as complete');
  const entries=a.books_planned_2027.map(id=>index.byId.get(id));assert(entries.every(Boolean),'Unknown canonical arc member');
  const current=entries.filter(b=>credit(state,b,asOf));const remaining=entries.filter(b=>!credit(state,b,asOf));
  const historical=a.previously_read_titles.length;
  const custom=(state.custom_books||[]).filter(b=>b.series_arc_id===a.id);
  return {id:a.id,name:a.name,qualification:a.qualification,main_arc_complete:true,total_main_arc_books:a.total_main_arc_books,
   historical_titles:a.previously_read_titles.slice(),historical_expected_count:historical,
   planned_2027:entries.length,finished_2027:current.length,remaining_2027:remaining.length,
   percentage:entries.length?Math.round(current.length/entries.length*100):100,
   story_context_progress_assuming_baseline:`${historical+current.length}/${a.total_main_arc_books}`,
   next:remaining[0]?{id:remaining[0].id,title:remaining[0].title,position:remaining[0].series_position}:null,
   finished_ids:current.map(b=>b.id),remaining_ids:remaining.map(b=>b.id),book_ids:entries.map(b=>b.id),
   custom_related_ids:custom.map(b=>b.id),
   subset:a.id==='discworld:full'||a.id.startsWith('discworld:')||a.id==='his_dark_materials',
   historical_note:a.id==='discworld:full'?'Twenty projected 2026 completions: not confirmed reading records.':historical?'Previously read titles are historical context, never a new 2027 credit.':'No earlier main-arc titles are listed.'};
 });
 const summary={};for(const p of PATHS){
  const entries=index.books.filter(b=>b.pathway===p),done=entries.filter(b=>credit(state,b,asOf));
  const custom=(state.custom_books||[]).filter(b=>b.pathway===p);
  summary[p]={pathway:p,planned:entries.length,completed:done.length,remaining:entries.length-done.length,custom_total:custom.length,custom_completed:custom.filter(b=>credit(state,b,asOf)).length,next:entries.find(b=>!credit(state,b,asOf))?.id||null};
 }
 return {as_of:asOf,arcs:views,pathways:summary,discworld:{historical_expected:20,planned_2027:21,total:41,finished_2027:views.find(a=>a.id==='discworld:full').finished_2027}};
 }
 function orderWithOverrides(index,state){
 const custom=state?.custom_books||[],map=new Map([...index.books,...custom].map(b=>[b.id,b]));
 assert(map.size===index.books.length+custom.length,'Duplicate book stable IDs');
 const ids=[],seen=new Set();for(const id of [...(state?.overrides?.reading_order_ids||[]),...index.books.map(b=>b.id),...custom.map(b=>b.id)]){
  if(!map.has(id)||seen.has(id))continue;seen.add(id);ids.push(id);
 }
 return ids;
 }
 function sequenceOK(ids,index,custom=[]){
 const map=new Map([...index.books,...custom].map(b=>[b.id,b]));const previous=new Map();
 if(new Set(ids).size!==ids.length || ids.some(id=>!map.has(id)))return false;
 for(const id of ids){const b=map.get(id);if(!b.series_arc_id||!Number.isSafeInteger(b.series_position))continue;
  const old=previous.get(b.series_arc_id)??0;if(b.series_position<old)return false;previous.set(b.series_arc_id,b.series_position);
 }return true;
 }
 function prioritize(index,state,arcId,asOf='2027-12-31'){
 const snap=snapshots(index,state,asOf),a=snap.arcs.find(x=>x.id===arcId);
 assert(a,'Choose a known finished main story arc');
 assert(a.remaining_ids.length,'This story arc has no unfinished 2027 titles');
 const original=orderWithOverrides(index,state),selected=new Set(a.book_ids);
 // When whole Discworld is chosen, preserve CURRENT within-subseries relative order only if it is valid.
 // For a subset, canonical series-position order is authoritative.
 const front=a.remaining_ids.slice();
 // Include already-completed earlier installments as invisible ordering anchors.
 // The pacing engine filters finished titles, so only unfinished ones appear to read.
 const proposed=[...a.book_ids,...original.filter(id=>!selected.has(id))];
 assert(sequenceOK(proposed,index,state.custom_books||[]),'This change would break the installment order in another completed story arc. No changes saved.');
 return {arc_id:arcId,front,ids:proposed,changed:proposed.some((id,i)=>id!==original[i]),total:proposed.length};
 }
 const api=Object.freeze({PATHS,credit,snapshots,sequenceOK,orderWithOverrides,prioritize});
 root.RosewoodArcs=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
