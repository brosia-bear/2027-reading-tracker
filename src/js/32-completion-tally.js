/* Rosewood Library · Session 10: deterministic, read-only Goodreads-eligible completion tally.
 * The current committed record is the sole authority. Audit events are NOT reading credits.
 * No clock calls, storage writes, network, fabricated sessions, or Disc Ledger references.
 */
(function(root){
 'use strict';
 const DAY=/^\d{4}-\d{2}-\d{2}$/;
 const dateOK=s=>typeof s==='string'&&DAY.test(s)&&!Number.isNaN(Date.parse(s+'T12:00:00Z'))&&new Date(s+'T12:00:00Z').toISOString().slice(0,10)===s;
 const BOOKS=Object.freeze({PUBLIC:52,PRIVATE:104,YEAR:2027});
 const SLOW_IDS=new Set(['rosewood-revised-2027-031','rosewood-revised-2027-037']);
 function aggregate(state,planned=[],year=BOOKS.YEAR){
 if(!Number.isSafeInteger(year)||year<1||year>9999)throw Error('Invalid goal year');
 if(!state||typeof state!=='object'||!Array.isArray(planned))throw Error('Invalid Rosewood input');
 const canonical=new Map();for(const b of planned){if(!b||typeof b.id!=='string'||canonical.has(b.id))throw Error('Invalid or duplicate canonical book ID');canonical.set(b.id,b);}
 const customs=new Map();for(const b of state.custom_books||[]){if(!b||typeof b.id!=='string'||canonical.has(b.id)||customs.has(b.id))throw Error('Invalid or duplicate custom book ID');customs.set(b.id,b);}
 const ids=[],byPathway={},byArc={},byMonth={},bookDates={};let plannedCount=0,customCount=0;
 for(const [id,rec] of Object.entries(state.progress||{})){
  if(SLOW_IDS.has(id))continue; // separate chapter-a-day classics never count toward 52/104 or annual total
  const b=canonical.get(id)||customs.get(id);if(!b||!rec||rec.status!=='finished'||rec.percent!==100||rec.goodreads_eligible!==true||!dateOK(rec.finished_at)||!rec.finished_at.startsWith(String(year)+'-'))continue;
  // Canonical books use the authored eligibility field; reader-supplied additions use the
  // explicit saved classification. Do not trust the progress flag by itself.
  if(canonical.has(id) ? b.goodreads_eligible_planned!==true : b.goodreads_eligible!==true)continue;
  ids.push(id);bookDates[id]=rec.finished_at;byPathway[b.pathway]=(byPathway[b.pathway]||0)+1;
  if(b.series_arc_id)byArc[b.series_arc_id]=(byArc[b.series_arc_id]||0)+1;
  const month=rec.finished_at.slice(0,7);byMonth[month]=(byMonth[month]||0)+1;
  if(canonical.has(id))plannedCount++;else customCount++;
 }
 ids.sort((a,b)=>bookDates[a].localeCompare(bookDates[b])||a.localeCompare(b));
 const count=ids.length,goalPublic=state.goals?.public_goodreads??BOOKS.PUBLIC,goalPrivate=state.goals?.private_goodreads??BOOKS.PRIVATE;
 if(!Number.isSafeInteger(goalPublic)||goalPublic<=0||!Number.isSafeInteger(goalPrivate)||goalPrivate<=0)throw Error('Invalid goal targets');
 const cap=(n,max)=>Math.max(0,Math.min(100,n/max*100));
 return Object.freeze({year,count,completedIds:ids,bookDates,byPathway,byArc,byMonth,plannedCount,customCount,
  public:{goal:goalPublic,count,remaining:Math.max(0,goalPublic-count),percentage:cap(count,goalPublic),reached:count>=goalPublic},
  private:{goal:goalPrivate,count,remaining:Math.max(0,goalPrivate-count),percentage:cap(count,goalPrivate),reached:count>=goalPrivate}});
 }
 const api=Object.freeze({aggregate,dateOK,BOOKS});root.RosewoodGoals=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
