/* Pure 2027 slow-read timeline. No user-state mutation, networking or guessed thread URLs. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.RosewoodSlowReads=api;})(typeof window!=='undefined'?window:typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const iso=s=>typeof s==='string'&&/^2027-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(s)&&new Date(s+'T12:00:00Z').toISOString().slice(0,10)===s;
 function create(data){
 if(data?.format!=='rosewood-slow-reads-v1'||data.year!==2027)throw Error('Unverified slow-read schedule');
 const tracks={};
 for(const [name,count] of [['war_and_peace',361],['les_miserables',365]]){
  const t=data[name];if(!t||t.entries?.length!==365||t.chapter_days!==count)throw Error('Incorrect '+name+' chapter count');
  let read=0;const dates=new Set();
  t.entries.forEach((e,i)=>{
  const expected=new Date(Date.UTC(2027,0,1+i)).toISOString().slice(0,10);
  if(e.date!==expected||!iso(e.date)||dates.has(e.date))throw Error('Missing or repeated calendar date: '+e.date);
  dates.add(e.date);if(!e.rest_day)read++;
  });
  if(read!==count)throw Error('Wrong number of chapters: '+name);
  tracks[t.id]=Object.freeze({...t,byDate:new Map(t.entries.map(e=>[e.date,e]))});
 }
 return Object.freeze(tracks);
 }
 function validateSaved(saved){
 if(saved===undefined)return true;
 if(!saved||typeof saved!=='object'||Array.isArray(saved))throw Error('Slow read records must be an object');
 for(const [key,dates] of Object.entries(saved)){
  if(!['war-and-peace','les-miserables'].includes(key)||!Array.isArray(dates)||dates.length>365)throw Error('Invalid slow read selection');
  if(new Set(dates).size!==dates.length||dates.some(x=>!iso(x)))throw Error('Slow read completion contains an invalid date or duplicate');
  if(key==='war-and-peace'&&dates.some(d=>['2027-03-07','2027-06-14','2027-09-19','2027-12-03'].includes(d)))throw Error('War and Peace break days cannot be marked chapters');
 }
 return true;
 }
 function progress(saved,tracks){
 validateSaved(saved);return Object.fromEntries(Object.entries(tracks).map(([slug,t])=>{
  const dates=new Set(saved?.[slug]||[]);
  return [slug,{completed:dates.size,total:t.chapter_days,percentage:100*dates.size/t.chapter_days,complete:dates.size===t.chapter_days}];
 }));
 }
 return Object.freeze({create,validateSaved,progress});
});
