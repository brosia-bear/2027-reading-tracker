/* The Rosewood Library — Session 15: original 24 award criteria, deterministic evidence.
 * Pure read-only evaluation; no fictional sessions, future dates, network or storage.
 * An earned badge is a durable historical event; current evidence may later change.
 */
(function(root){'use strict';
 const YEAR='2027',FIRST='2027-01-01',LAST='2027-12-31';
 const SLOW_IDS=new Set(['rosewood-revised-2027-031','rosewood-revised-2027-037']);
 const RUSSIAN_IDS=new Set([31,42,47,53,63,69,72,74,79,85,90,95,103].map(n=>`${n===72?'rosewood-2027':'rosewood-revised-2027'}-${String(n).padStart(3,'0')}`));
 const PATHS=['discworld','completed_fantasy_arc','philosophy','nonfiction_research','standalone_literature_fantasy'];
 const METRICS=new Set(['eligible_books','discworld_books','arc_complete','any_fantasy_arc','philosophy_books','research_books','books_with_notes','completed_custom_books','favorite_books','months_with_finished_books','all_pathways_finished','russian_lit_books']);
 const validDate=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s+'T12:00:00Z'))&&new Date(s+'T12:00:00Z').toISOString().slice(0,10)===s;
 const instant=s=>typeof s==='string'&&Number.isFinite(Date.parse(s))&&/^\d{4}-\d\d-\d\dT/.test(s);
 function today(date=new Date()) {return [date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-');}
 function verifyDefinitions(awards,arcs=[]){
 if(!Array.isArray(awards)||awards.length!==25||new Set(awards.map(x=>x.id)).size!==25)throw Error('The 24 preserved awards and standalone Russian Literature Scholar award are required');
 for(const a of awards){if(!a||!METRICS.has(a.trigger?.metric)||!a.locked_art?.endsWith(`/${a.id}_locked.webp`)||!a.unlocked_art?.endsWith(`/${a.id}_unlocked.webp`))throw Error('Invalid original award: '+a?.id);
  if(a.trigger.metric==='arc_complete'){if(!arcs.length)continue;if(!arcs.some(arc=>arc.id===a.trigger.threshold&&arc.main_arc_complete===true))throw Error('Award arc not found: '+a.id);}
  else if(!Number.isSafeInteger(a.trigger.threshold)||a.trigger.threshold<1)throw Error('Invalid numeric award threshold: '+a.id);
 }
 return true;
 }
 // The asOf date is a viewing horizon, never permission to award future records.
 function evaluate(state,planned,awards,arcs=[],asOf=today()){
 if(!state||!Array.isArray(planned)||!Array.isArray(arcs)||!validDate(asOf))throw Error('Invalid award evidence context');
 verifyDefinitions(awards,arcs);
 const byId=new Map();for(const b of [...planned,...(state.custom_books||[])]){if(!b||typeof b.id!=='string'||byId.has(b.id))throw Error('Duplicate award book ID');byId.set(b.id,b);}
 const canonical=new Set(planned.map(b=>b.id)),finished=new Map();
 for(const [id,p] of Object.entries(state.progress||{})){
  const b=byId.get(id),eligible=canonical.has(id)?b?.goodreads_eligible_planned===true:b?.goodreads_eligible===true;
  if(SLOW_IDS.has(id)||!b||!eligible||p?.status!=='finished'||p.percent!==100||p.goodreads_eligible!==true||!validDate(p.finished_at)||p.finished_at<FIRST||p.finished_at>LAST||p.finished_at>asOf)continue;
  finished.set(id,{book:b,date:p.finished_at});
 }
 const canonicalFinished=[...finished].filter(([id])=>canonical.has(id));
 const months=new Set([...finished.values()].map(x=>x.date.slice(0,7)));
 const noteIds=new Set();for(const [id,n] of Object.entries(state.overrides?.reader_notes||{})){
  if(byId.has(id)&&n&&instant(n.updated_at)&&n.updated_at.slice(0,10)<=asOf&&['personal','research','spoilers'].some(k=>typeof n[k]==='string'&&n[k].trim()))noteIds.add(id);
 }
 const favIds=new Set();for(const f of state.overrides?.reader_favorites||[]){
  if(f?.category==='book'&&finished.has(f.book_id)&&instant(f.created_at)&&f.created_at.slice(0,10)<=asOf)favIds.add(f.book_id);
 }
 const arcCounts=new Map();const completedArcIds=new Set();for(const arc of arcs){
  const ids=arc.books_planned_2027||[];if(arc.main_arc_complete===true&&ids.length&&ids.every(id=>finished.has(id)&&canonical.has(id)))completedArcIds.add(arc.id);
  arcCounts.set(arc.id,ids.filter(id=>finished.has(id)&&canonical.has(id)).length);
 }
 const fantasyArcs=arcs.filter(a=>!a.id.startsWith('discworld:')&&a.main_arc_complete===true&&a.books_planned_2027?.length&&a.books_planned_2027.every(id=>byId.get(id)?.pathway==='completed_fantasy_arc'));
 const pathways=new Set([...finished.values()].map(x=>x.book.pathway).filter(x=>PATHS.includes(x)));
 const discworldIds=canonicalFinished.filter(([,x])=>x.book.pathway==='discworld').map(([id])=>id);
 const philosophy=[...finished.values()].filter(x=>x.book.pathway==='philosophy').length;
 const research=[...finished.values()].filter(x=>x.book.pathway==='nonfiction_research').length;
 const custom=[...finished.keys()].filter(id=>!canonical.has(id)).length;
 const russianLit=[...finished.keys()].filter(id=>RUSSIAN_IDS.has(id));
 // Required Russian anthology achievement alone can also use a manually saved
 // complete War and Peace record, without adding it to general book-count awards.
 for(const id of RUSSIAN_IDS){if(!SLOW_IDS.has(id))continue;const p=state.progress?.[id];if(p?.status==='finished'&&p.percent===100&&p.goodreads_eligible===true&&validDate(p.finished_at)&&p.finished_at>=FIRST&&p.finished_at<=LAST&&p.finished_at<=asOf)russianLit.push(id);}
 const conditions={russian_lit_books:[russianLit.length,'of 13 Russian literature selections finished in 2027'],eligible_books:[finished.size,'distinct eligible books finished in 2027'],discworld_books:[discworldIds.length,'of 21 original 2027 Discworld titles finished'],philosophy_books:[philosophy,'philosophy books finished in 2027'],research_books:[research,'nonfiction/research books finished in 2027'],books_with_notes:[noteIds.size,'different books with saved, nonempty personal notes'],completed_custom_books:[custom,'eligible added books finished in 2027'],favorite_books:[favIds.size,'different finished 2027 books saved as book favorites'],months_with_finished_books:[months.size,'different months of 2027 with eligible finished books'],all_pathways_finished:[pathways.size,'of five reading pathways with an eligible 2027 finish'],any_fantasy_arc:[fantasyArcs.filter(a=>completedArcIds.has(a.id)).length,'completed, authored fantasy main-story arcs']};
 const items=awards.map(a=>{
  let progress,goal,detail;const metric=a.trigger.metric;
  if(metric==='arc_complete'){
  const arc=arcs.find(x=>x.id===a.trigger.threshold),ids=arc?.books_planned_2027||[];
  progress=arcCounts.get(a.trigger.threshold)||0;goal=ids.length||1;
  detail=arc?`${progress} of ${goal} original installments finished in 2027`:'Original arc information unavailable';
  }else{[progress,detail]=conditions[metric];goal=a.trigger.threshold;}
  const recordedAt=state.unlocked_achievements?.[a.id]||null;
  const realUnlockEvent=(state.event_history||[]).find(e=>e.type==='unlocked'&&e.item_id===a.id&&instant(e.at));
  const provenEarned=!!(recordedAt&&realUnlockEvent);
  const currentlyEligible=!!(metric==='arc_complete'&&arcs.length===0?false:progress>=goal);
  return {id:a.id,title:a.title,description:a.description,metric,progress,goal,detail,eligible:currentlyEligible,earned:provenEarned,earned_at:provenEarned?recordedAt:null,legacy_unverified:!!recordedAt&&!realUnlockEvent,unavailable:metric==='arc_complete'&&!arcs.length,changed:provenEarned&&!currentlyEligible,
   remaining:Math.max(0,goal-progress),evidence_ids:metric==='eligible_books'?[...finished.keys()]:metric==='russian_lit_books'?russianLit:metric==='books_with_notes'?[...noteIds]:metric==='favorite_books'?[...favIds]:[],locked_art:a.locked_art,unlocked_art:a.unlocked_art,celebration_copy:a.celebration_copy};
 });
 return {year:Number(YEAR),as_of:asOf,items,earned:items.filter(x=>x.earned).length,eligible:items.filter(x=>x.eligible&&!x.earned).map(x=>x.id),summary:{eligible:finished.size,discworld:discworldIds.length,notes:noteIds.size,favorites:favIds.size,months:months.size,pathways:pathways.size}};
 }
 const api=Object.freeze({YEAR,FIRST,LAST,PATHS,today,validDate,verifyDefinitions,evaluate});
 root.RosewoodAchievements=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);

