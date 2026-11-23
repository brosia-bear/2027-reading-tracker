/* Rosewood Library Session 11 — pure, nonbinding reading suggestions.
  Never writes state, creates reading activity, grades the reader, or marks books finished.
  Python parity: reference/pacing_reference.py suggested_finish_by(). */
(function(root){
 'use strict';
 const START='2027-01-01',END='2027-12-31',TARGET=104, DAY=86400000;
 const isObj=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
 const dt=s=>Date.parse(s+'T12:00:00Z');
 const iso=n=>new Date(n).toISOString().slice(0,10);
 function validDate(s){return typeof s==='string'&&/^\d{4}-\d\d-\d\d$/.test(s)&&Number.isFinite(dt(s))&&iso(dt(s))===s;}
 function todayLocal(d=new Date()){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
 function dayCount(a,b){return Math.round((dt(b)-dt(a))/DAY)+1;}
 function roundPython(n){const f=Math.floor(n);return n-f===.5?f+(f%2):Math.round(n);}
 const bounded=(n,min,max)=>Math.max(min,Math.min(max,n));
 const finitePositive=x=>typeof x==='number'&&Number.isFinite(x)&&x>0;
 function effort(book,record={},settings={},editionOverride=null){
 const edition=isObj(editionOverride)?editionOverride:{};
 const base=book.edition||{};
 const rawPages=edition.pages??book.pages??base.pages??null;
 const rawAudio=edition.audio_minutes_1x??book.audio_minutes_1x??base.audio_minutes_1x??null;
 const pages=Number(rawPages),audio=Number(rawAudio);
 const pph=finitePositive(settings.pages_per_hour)?settings.pages_per_hour:45;
 const speed=finitePositive(settings.playback_speed)?settings.playback_speed:2;
 const pagesHours=rawPages!=null&&finitePositive(pages)?pages/pph:null;
 const audioHours=rawAudio!=null&&finitePositive(audio)?audio/60/speed:null;
 const method=record?.method||'unspecified';let hours=null,source='';
 if(method==='audiobook'){hours=audioHours??pagesHours;source=audioHours!=null?'audiobook at chosen playback speed':'page estimate (audio length missing)';}
 else if(method==='mixed'){
  // Two formats are alternative ways to consume one book: never add their full runtimes.
  hours=pagesHours!=null&&audioHours!=null?(pagesHours+audioHours)/2:(pagesHours??audioHours);
  source=pagesHours!=null&&audioHours!=null?'average of alternative reading/listening estimates':pagesHours!=null?'page estimate':'audiobook estimate';
 }else{hours=pagesHours??audioHours;source=pagesHours!=null?'page estimate':'audiobook estimate';}
 const fallback=hours==null;
 if(fallback){hours=7;source='provisional 7-hour fallback (no reliable edition length)';}
 const verified=book?.edition?.estimates_source==='individually_verified' || edition.verified===true;
 return {hours:bounded(hours,.01,5000),provisional:fallback||!verified,unknown_length:fallback,source,method,edition_verified:verified};
 }
 function suggestions(asOf,entries,hoursById={}){
 if(!validDate(asOf)||asOf<START||asOf>END)throw Error('Planning date must be within 2027');
 if(!Array.isArray(entries))throw Error('Entries must be an array');
 if(!entries.length)return [];
 const available=dayCount(asOf,END),work=[];let total=0;
 for(const item of entries){
  const pct=Number(item.percent??0),raw=hoursById[item.id];
  if(!item?.id||!Number.isFinite(pct)||pct<0||pct>=100)throw Error('Only valid unfinished entries are accepted');
  if(raw!==undefined&&!finitePositive(raw))throw Error('Invalid estimated hours');
  const base=raw===undefined?7:raw;
  const left=base*Math.max(.01,1-pct/100);total+=left;work.push({left,provisional:raw===undefined});
 }
 let cumulative=0;
 return entries.map((item,i)=>{
  cumulative+=work[i].left;
  // Python round() uses ties-to-even, unlike Math.round().
  const offset=bounded(roundPython((cumulative/total)*available)-1,0,available-1);
  return {book_id:item.id,suggested_finish_by:iso(dt(asOf)+offset*DAY),is_soft_suggestion:true,estimate_provisional:work[i].provisional};
 });
 }
 function plan(state,canonical,asOf=todayLocal(),options={}){
 if(!isObj(state)||!Array.isArray(canonical))throw Error('Invalid planning data');
 if(!validDate(asOf))throw Error('Invalid current date');
 const future=asOf<START,expired=asOf>END,planningDate=future?START:asOf;
 const status=expired?'year_closed':future?'preview':'active';
 const completed=options.completedIds instanceof Set?options.completedIds:new Set(options.completedIds||[]);
 const privateGoal=state.goals?.private_goodreads??TARGET;
 if(!Number.isInteger(privateGoal)||privateGoal<1)throw Error('Invalid private goal');
 const remaining=Math.max(0,privateGoal-completed.size);
 const known=new Map();for(const b of [...canonical,...(state.custom_books||[])]){
  if(!b||typeof b.id!=='string'||known.has(b.id))throw Error('Duplicate book in schedule');known.set(b.id,b);
 }
 const priorities=state.overrides?.reading_order_ids||[];
 const seen=new Set(),ordered=[];
 for(const id of [...priorities,...canonical.map(b=>b.id),...(state.custom_books||[]).map(b=>b.id)]){
  if(seen.has(id)||!known.has(id))continue;seen.add(id);ordered.push(known.get(id));
 }
 const remainingBooks=ordered.filter(b=>{
  const eligible=b.id.startsWith('rosewood-custom-')?b.goodreads_eligible===true:b.goodreads_eligible_planned===true;
  if(!eligible||completed.has(b.id))return false;
  // A title already marked finished outside 2027 is historical, not auto-scheduled for rereading.
  const p=state.progress?.[b.id];return p?.status!=='finished' && p?.status!=='dnf';
 });
 const chosen=remainingBooks.slice(0,remaining), unscheduled=remainingBooks.slice(remaining).map(b=>b.id);
 const specs={},efforts={};let hoursTotal=0;
 for(const b of chosen){const effortInfo=effort(b,state.progress?.[b.id],state.settings,state.overrides?.edition_overrides?.[b.id]);efforts[b.id]=effortInfo;specs[b.id]=effortInfo.hours;
  const p=bounded(Number(state.progress?.[b.id]?.percent)||0,0,99.9);hoursTotal+=effortInfo.hours*Math.max(.01,1-p/100);
 }
 let output=[];
 if(!expired&&remaining>0){output=suggestions(planningDate,chosen.map(b=>({id:b.id,percent:bounded(Number(state.progress?.[b.id]?.percent)||0,0,99.9)})),specs)
  .map((row,i)=>{const b=chosen[i],override=state.overrides?.user_soft_dates?.[b.id];const humanOverride=validDate(override)&&override>=START&&override<=END;
  return {...row,title:b.title,author:b.author,pathway:b.pathway,plan_order:b.plan_order??null,custom:b.id.startsWith('rosewood-custom-'),
   suggested_finish_by:humanOverride?override:row.suggested_finish_by,automatically_suggested_date:row.suggested_finish_by,user_override:humanOverride,
   effort:efforts[b.id],remaining_hours:efforts[b.id].hours*Math.max(.01,1-bounded(Number(state.progress?.[b.id]?.percent)||0,0,99.9)/100)};
  });}
 const days=expired?0:dayCount(planningDate,END);
 const hrsPerWeek=days?hoursTotal/days*7:null;
 return {status,as_of:asOf,planning_date:expired?null:planningDate,private_goal:privateGoal,completed:completed.size,remaining_goal:remaining,
  queue:output,not_scheduled_ids:unscheduled,unscheduled_count:unscheduled.length,eligible_remaining:remainingBooks.length,
  estimated_total_hours:Math.round(hoursTotal*10)/10,hours_per_week:hrsPerWeek===null?null:Math.round(hrsPerWeek*10)/10,
  estimate_is_provisional:output.some(x=>x.effort.provisional),missing_goal_slots:Math.max(0,remaining-chosen.length)};
 }
 const api=Object.freeze({START,END,TARGET,validDate,todayLocal,roundPython,effort,suggestions,plan});
 root.RosewoodPacing=api;
 if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
