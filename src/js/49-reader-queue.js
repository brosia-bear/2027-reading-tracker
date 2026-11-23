/* 2027 reader-owned queue: commitment means 2027 completion target, NOT fixed
  reading position. Every normal book is movable; daily slow reads are pinned.
  Book records are never reassigned.
  Stateless operations only. Every persisted change uses the existing v1
  reading_order_ids override, so historical backups remain compatible. */
(function(root,factory){
 const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;
 else root.RosewoodQueue=api;
})(typeof window!=='undefined'?window:typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const SLOW_IDS=Object.freeze(['rosewood-revised-2027-031','rosewood-revised-2027-037']);
 const CLASSIC_IDS=Object.freeze(['rosewood-2027-058']); // Oscar Wilde, The Picture of Dorian Gray
 const slowSet=new Set(SLOW_IDS),classicSet=new Set(CLASSIC_IDS);
 const committed=book=>!!book&&(book.pathway==='philosophy'||!!book.revision_of||classicSet.has(book.id));
 const classification=book=>slowSet.has(book?.id)?'slow_read':committed(book)?'committed':'suggestion';
 const eligible=book=>book?.id?.startsWith('rosewood-custom-')?book.goodreads_eligible===true:book?.goodreads_eligible_planned===true;
 function fullOrder(books,custom=[],saved=[]){
 if(!Array.isArray(books)||!Array.isArray(custom)||!Array.isArray(saved))throw Error('Invalid reading library');
 const all=[...books,...custom],map=new Map(all.map(b=>[b.id,b]));
 if(map.size!==all.length)throw Error('Duplicate book identifiers');
 const ids=[],seen=new Set();
 for(const id of [...saved,...all.map(b=>b.id)]){if(!map.has(id)||seen.has(id))continue;seen.add(id);ids.push(id);}
 // Slow reads are independent of the regular reading queue AND anchored in
 // their original slots. This also normalizes older saved priorities that
 // accidentally displaced their positions, without changing any book IDs.
 const pinned=books.map((b,i)=>slowSet.has(b.id)?[i,b.id]:null).filter(Boolean);
 const normal=ids.filter(id=>!slowSet.has(id)),out=Array(ids.length);
 for(const [i,id] of pinned)out[i]=id;
 let k=0;for(let i=0;i<out.length;i++)if(out[i]===undefined)out[i]=normal[k++];
 return out;
 }
 function commitmentSummary(books,progress={}){
 const chosen=books.filter(committed);
 const done=chosen.filter(b=>{const p=progress?.[b.id];return p?.status==='finished'&&typeof p.finished_at==='string'&&p.finished_at.startsWith('2027-');});
 const missed=chosen.filter(b=>progress?.[b.id]?.status==='dnf');
 return Object.freeze({required:chosen.length,finished:done.length,remaining:chosen.length-done.length,
  dnf_unmet:missed.length,deadline:'2027-12-31',required_ids:chosen.map(b=>b.id),finished_ids:done.map(b=>b.id)});
 }
 function sequenceOK(ids,byId){const last=new Map();for(const id of ids){const b=byId.get(id);if(!b)throw Error('Unknown queue member');if(!b.series_arc_id||!Number.isSafeInteger(b.series_position))continue;
 const prev=last.get(b.series_arc_id)||0;if(b.series_position<prev)return false;last.set(b.series_arc_id,b.series_position);
 }return true;}
 // Choosing a book to read is independent of Goodreads goal eligibility.
 // A reader may intentionally read an ineligible imported/custom title; it just
 // must not receive goal credit. Finished and DNF records still leave the queue.
 function remaining(book,progress){if(!book||typeof book.id!=='string')return false;const p=progress?.[book.id];return !slowSet.has(book.id)&&p?.status!=='finished'&&p?.status!=='dnf';}
 function getQueue(books,custom=[],saved=[],progress={}){
 const byId=new Map([...books,...custom].map(b=>[b.id,b]));
 return fullOrder(books,custom,saved).map(id=>byId.get(id)).filter(b=>remaining(b,progress));
 }
 function swap(books,custom,saved,progress,fromId,toId){
 if(fromId===toId)throw Error('Choose a different book');
 const all=[...books,...custom],byId=new Map(all.map(b=>[b.id,b]));
 const from=byId.get(fromId),to=byId.get(toId);
 if(!from||!to||!remaining(from,progress)||!remaining(to,progress))throw Error('Both selections must be unfinished reading-queue books outside the two daily slow reads');
 const proposed=fullOrder(books,custom,saved),i=proposed.indexOf(fromId),j=proposed.indexOf(toId);
 if(i===-1||j===-1)throw Error('Book is missing from the reading plan');
 [proposed[i],proposed[j]]=[proposed[j],proposed[i]];
 return proposed;
 }
 function promote(books,custom,saved,progress,fromId,toId){
 if(fromId===toId)throw Error('Choose a different book');
 const all=[...books,...custom],byId=new Map(all.map(b=>[b.id,b]));
 const from=byId.get(fromId),to=byId.get(toId);
 if(!from||!to||!remaining(from,progress)||!remaining(to,progress))throw Error('Both books must be unfinished reading-queue books outside daily slow reads');
 const proposed=fullOrder(books,custom,saved),i=proposed.indexOf(fromId),j=proposed.indexOf(toId);
 if(i<0||j<0)throw Error('Book is not in your reading plan');
 proposed.splice(j,1);proposed.splice(i,0,toId);
 return fullOrder(books,custom,proposed);
 }
 function options(books,custom,saved,progress,fromId){const current=getQueue(books,custom,saved,progress);return current.filter(b=>b.id!==fromId).filter(b=>{
 try{promote(books,custom,saved,progress,fromId,b.id);return true;}catch(_){return false;}
 });}
 function shuffle(books,custom,saved,progress,random=Math.random){
 const all=[...books,...custom],byId=new Map(all.map(b=>[b.id,b]));
 const ids=fullOrder(books,custom,saved),positions=[];
 // ANY unfinished ordinary book, including philosophy and classics, may
 // change places. The two daily books and finished books remain where they are.
 for(let i=0;i<ids.length;i++)if(remaining(byId.get(ids[i]),progress))positions.push(i);
 if(positions.length<2)throw Error('There are fewer than two unfinished regular books to shuffle');
 const before=ids.slice();
 for(let i=positions.length-1;i>0;i--){
  const n=random();if(!Number.isFinite(n)||n<0||n>=1)throw Error('Invalid shuffle source');
  const j=Math.floor(n*(i+1));[ids[positions[i]],ids[positions[j]]]=[ids[positions[j]],ids[positions[i]]];
 }
 // Uniform shuffles can coincidentally return the original order. Guarantee
 // the user gets an observable change when there are >=2 movable books.
 if(ids.every((id,i)=>id===before[i]))[ids[positions[0]],ids[positions[1]]]=[ids[positions[1]],ids[positions[0]]];
 return {ids,swaps:positions.filter(i=>ids[i]!==before[i]).length};
 }
 return Object.freeze({SLOW_IDS,CLASSIC_IDS,committed,classification,commitmentSummary,eligible,fullOrder,sequenceOK,remaining,getQueue,swap,promote,options,shuffle});
});
