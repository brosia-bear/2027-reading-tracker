/* The Rosewood Library — Session 9 on-device state engine, backwards-compatible v1 private schema.
 * No reading data is created by the demonstration UI. No cloud, Disc Ledger state,
 * external accounts, trackers, cookies, or network requests.
 * Embedded in index.html by build_prototype.py to work offline and in local preview.
 */
(function (root) {
 'use strict';
 const DB_NAME = 'rosewood-library-2027';
 const DB_VERSION = 2;
 const APP_ID = 'rosewood-library-2027';
 const SIGNATURE = 'rosewood-library-backup-v1';
 const EXPORT_VERSION = 1;
 const STATE_KEY = 'main';
 const MAX_BACKUP_BYTES = 16 * 1024 * 1024;
 const STORES = Object.freeze({ state: 'reader_state', progress: 'reader_progress', events: 'reader_events', snapshots: 'migration_snapshots', meta: 'metadata' });
 const PATHWAYS = new Set(['discworld','completed_fantasy_arc','philosophy','nonfiction_research','standalone_literature_fantasy','other']);
 const STATUSES = new Set(['not_started','reading','paused','finished','dnf']);
 const METHODS = new Set(['ebook','physical','audiobook','mixed','unspecified']);
 const EVENT_TYPES = new Set(['finished','reopened','progress_changed','unlocked','note_added','goal_changed']);
 const customExtraFields=['genre','series_name','series_position','notes','isbn','cover_override','updated_at','goodreads_data'];
 const allowedState = ['format','schema_version','planning_year','goals','progress','custom_books','unlocked_achievements','event_history','settings','overrides','last_saved_at'];
 const isObject = v => !!v && typeof v === 'object' && !Array.isArray(v);
 const own = (x,k) => Object.prototype.hasOwnProperty.call(x,k);
 const assert = (ok, message) => { if(!ok) throw new Error(message); };
 const keysExact = (obj, keys, label) => {assert(isObject(obj),label+' must be an object'); for(const k of keys)assert(own(obj,k),label+' missing '+k);for(const k of Object.keys(obj))assert(keys.includes(k),label+' unexpected field '+k);};
 const isoDate = x => typeof x==='string' && /^\d{4}-\d{2}-\d{2}$/.test(x) && !Number.isNaN(Date.parse(x+'T12:00:00Z')) && new Date(x+'T12:00:00Z').toISOString().slice(0,10)===x;
 const isoInstant = x => typeof x==='string' && /^\d{4}-\d{2}-\d{2}T/.test(x) && !Number.isNaN(Date.parse(x));
 const nullable = (v,pred) => v===null || pred(v);
 const isNum = x => typeof x==='number' && Number.isFinite(x);
 const isNonNegative = x => isNum(x) && x>=0;
 const clone = obj => JSON.parse(JSON.stringify(obj));
 const stable = obj => JSON.stringify(obj, function(key,value) { if(isObject(value)) { const sorted={};for(const k of Object.keys(value).sort())sorted[k]=value[k];return sorted; }return value; });
 function defaultState() {return {
  format:SIGNATURE,schema_version:1,planning_year:2027,
  goals:{public_goodreads:52,private_goodreads:104},progress:{},custom_books:[],
  unlocked_achievements:{},event_history:[],
  settings:{pages_per_hour:45,playback_speed:2,pacing_messages:true,reduced_motion:false,auto_backup_reminder:true,theme_id:'rosewood-library-v1'},
  overrides:{reading_order_ids:[],user_soft_dates:{},edition_overrides:{},reader_notes:{}},last_saved_at:null
 };}
 function validateState(s,plannedIds,awardIds) {
  keysExact(s,allowedState,'Rosewood state');
  assert(s.format===SIGNATURE && s.schema_version===1 && s.planning_year===2027,'Incompatible Rosewood state/version');
  keysExact(s.goals,['public_goodreads','private_goodreads'],'Goals');
  assert(Number.isSafeInteger(s.goals.public_goodreads)&&s.goals.public_goodreads>=1 && Number.isSafeInteger(s.goals.private_goodreads)&&s.goals.private_goodreads>=1,'Invalid goals');
  assert(s.goals.public_goodreads<=s.goals.private_goodreads,'Public goal must not exceed private goal');
  keysExact(s.settings,['pages_per_hour','playback_speed','pacing_messages','reduced_motion','auto_backup_reminder','theme_id'],'Settings');
  assert(isNum(s.settings.pages_per_hour)&&s.settings.pages_per_hour>0&&s.settings.pages_per_hour<=1000,'Invalid pages/hour');
  assert(isNum(s.settings.playback_speed)&&s.settings.playback_speed>0&&s.settings.playback_speed<=5,'Invalid playback speed');
  for(const x of ['pacing_messages','reduced_motion','auto_backup_reminder']) assert(typeof s.settings[x]==='boolean','Invalid '+x);
  assert(s.settings.theme_id==='rosewood-library-v1','Unknown theme');
  assert(Array.isArray(s.custom_books)&&s.custom_books.length<=10000,'Invalid custom books');
  const idSet=new Set(plannedIds), customIds=new Set();
  for(const b of s.custom_books){
   const required=['id','title','author','pathway','goodreads_eligible','series_arc_id','pages','audio_minutes_1x','created_at','custom_profile'];
   assert(isObject(b),'Custom book must be an object');for(const k of required)assert(own(b,k),'Custom book missing '+k);for(const k of Object.keys(b))assert([...required,...customExtraFields].includes(k),'Custom book unexpected field '+k);
   assert(typeof b.id==='string'&&/^rosewood-custom-[a-zA-Z0-9-]+$/.test(b.id)&&!idSet.has(b.id)&&!customIds.has(b.id),'Duplicate or invalid custom ID');
   customIds.add(b.id);idSet.add(b.id);
   assert(typeof b.title==='string'&&b.title.trim().length>0&&typeof b.author==='string'&&b.author.trim().length>0,'Custom title/author required');
   assert(PATHWAYS.has(b.pathway) && typeof b.goodreads_eligible==='boolean','Invalid custom-book category');
   assert(nullable(b.series_arc_id,x=>typeof x==='string'),'Invalid series arc');
   assert(nullable(b.pages,x=>Number.isInteger(x)&&x>=1),'Invalid page count');
   assert(nullable(b.audio_minutes_1x,x=>Number.isInteger(x)&&x>=1),'Invalid audio duration');
   assert(isoInstant(b.created_at)&&typeof b.custom_profile==='string'&&b.custom_profile.length<=200000,'Invalid custom-book metadata');
   assert(b.title.length<=240&&b.author.length<=240,'Custom title/author too long');
   if(own(b,'goodreads_data')){const gd=root.RosewoodGoodreads||typeof require==='function'&&require('./rosewood-goodreads.js');assert(gd&&isObject(b.goodreads_data)&&Object.keys(b.goodreads_data).length===gd.HEADERS.length,'Invalid imported Goodreads metadata');for(const field of gd.HEADERS)assert(typeof b.goodreads_data[field]==='string'&&b.goodreads_data[field].length<=50000,'Invalid Goodreads column '+field);}
   if(own(b,'genre'))assert(typeof b.genre==='string'&&b.genre.length<=100,'Invalid genre');
   if(own(b,'series_name'))assert(typeof b.series_name==='string'&&b.series_name.length<=240,'Invalid series name');
   if(own(b,'series_position'))assert(nullable(b.series_position,x=>Number.isSafeInteger(x)&&x>=1&&x<=9999),'Invalid series number');
   if(own(b,'notes'))assert(typeof b.notes==='string'&&b.notes.length<=12000,'Invalid notes');
   if(own(b,'isbn'))assert(nullable(b.isbn,x=>typeof x==='string'&&/^(?:\d{13}|\d{9}[\dX])$/.test(x)),'Invalid ISBN');
   if(own(b,'updated_at'))assert(isoInstant(b.updated_at),'Invalid modified timestamp');
   if(own(b,'cover_override')&&b.cover_override!==null){
    keysExact(b.cover_override,['url','source','edition_verified'],'Custom cover');
    assert(typeof b.cover_override.url==='string'&&/^https:\/\/[^\s]+$/.test(b.cover_override.url)&&b.cover_override.edition_verified===false&&['user_supplied_url','user_supplied_isbn'].includes(b.cover_override.source),'Invalid custom cover provenance');
    const c=root.RosewoodCustom||typeof require==='function'&&require('./rosewood-custom.js');
    assert(c&&c.safeCoverURL(b.cover_override.url)===b.cover_override.url,'Unsafe custom cover address');
   }
  }
  assert(isObject(s.progress),'Progress must be object');
  assert(Object.keys(s.progress).length<=20000,'Too many progress records');
  for(const [id,p] of Object.entries(s.progress)){
   assert(idSet.has(id),'Progress references unknown book ID: '+id);
   keysExact(p,['status','percent','started_at','finished_at','pages_read','audio_minutes_elapsed_1x','method','rating_quarter_stars','notes','review','goodreads_eligible','is_reread','reread_allowed'],'Progress');
   assert(STATUSES.has(p.status)&&isNum(p.percent)&&p.percent>=0&&p.percent<=100,'Invalid status/progress');
   for(const date of ['started_at','finished_at']) assert(nullable(p[date],isoDate),'Invalid '+date);
   assert(nullable(p.pages_read,isNonNegative)&&nullable(p.audio_minutes_elapsed_1x,isNonNegative),'Invalid page/audio reading');
   assert(METHODS.has(p.method),'Unknown reading method');
   assert(nullable(p.rating_quarter_stars,x=>isNum(x)&&x>=0.25&&x<=5&&Number.isInteger(x*4)),'Invalid rating');
   assert(typeof p.notes==='string'&&typeof p.review==='string'&&p.notes.length<=20000&&p.review.length<=20000,'Invalid review/notes');
   for(const f of ['goodreads_eligible','is_reread','reread_allowed']) assert(typeof p[f]==='boolean','Invalid '+f);
   assert(p.status!=='finished'||p.finished_at!==null,'Finished book requires finish date');
   assert(p.started_at===null||p.finished_at===null||p.started_at<=p.finished_at,'Finish cannot precede start date');
  }
  assert(isObject(s.unlocked_achievements),'Achievements must be object');
  for(const [key,at] of Object.entries(s.unlocked_achievements))assert(awardIds.includes(key) && isoInstant(at),'Unknown achievement or timestamp: '+key);
  assert(Array.isArray(s.event_history)&&s.event_history.length<=200000,'Invalid events');
  const eventIds=new Set();
  for(const e of s.event_history){
   keysExact(e,['id','type','item_id','at'],'Reading event');
   assert(typeof e.id==='string' && e.id.length>0 && !eventIds.has(e.id),'Duplicate or empty event ID');eventIds.add(e.id);
   assert(EVENT_TYPES.has(e.type)&&isoInstant(e.at),'Invalid event');
   const requiredLink=e.type==='goal_changed'?e.item_id==='goals':e.type==='unlocked'?awardIds.includes(e.item_id):idSet.has(e.item_id);
   assert(typeof e.item_id==='string'&&requiredLink,'Event references unknown book/achievement or wrong event type');
  }
  // reader_notes is optional in backups from Sessions 1–7: old v1 archives stay valid.
  const overrideFields=['reading_order_ids','user_soft_dates','edition_overrides','reader_notes','research_entries','reader_favorites','series_continuation_choices','slow_reads'];
  assert(isObject(s.overrides),'Overrides must be an object');
  for(const field of overrideFields.slice(0,3))assert(own(s.overrides,field),'Overrides missing '+field);
  for(const field of Object.keys(s.overrides))assert(overrideFields.includes(field),'Overrides unexpected field '+field);
  assert(Array.isArray(s.overrides.reading_order_ids)&&new Set(s.overrides.reading_order_ids).size===s.overrides.reading_order_ids.length,'Duplicate reading order IDs');
  for(const id of s.overrides.reading_order_ids)assert(idSet.has(id),'Order references unknown ID');
  assert(isObject(s.overrides.user_soft_dates)&&isObject(s.overrides.edition_overrides),'Invalid overrides');
  for(const [id,date] of Object.entries(s.overrides.user_soft_dates))assert(idSet.has(id)&&isoDate(date),'Invalid soft date or book reference');
  for(const [id,info] of Object.entries(s.overrides.edition_overrides))assert(idSet.has(id)&&isObject(info),'Invalid edition override');
  if(own(s.overrides,'reader_notes')){
   assert(isObject(s.overrides.reader_notes)&&Object.keys(s.overrides.reader_notes).length<=20000,'Reader notes must be a limited object');
   for(const [id,note] of Object.entries(s.overrides.reader_notes)){
    assert(idSet.has(id),'Reader note references an unknown book: '+id);
    keysExact(note,['personal','research','spoilers','updated_at'],'Reader note');
    for(const field of ['personal','research','spoilers']) assert(typeof note[field]==='string'&&note[field].length<=20000,'Invalid '+field+' notes');
    assert(isoInstant(note.updated_at),'Invalid reader-note timestamp');
   }
  }
  const research=root.RosewoodResearch||typeof require==='function'&&require('./rosewood-research.js');
  if(own(s.overrides,'research_entries')||own(s.overrides,'reader_favorites')){assert(research,'Research validator unavailable');research.checkCollection(s,idSet);}
  if(own(s.overrides,'slow_reads')){const slow=root.RosewoodSlowReads||typeof require==='function'&&require('./rosewood-slowreads.js');assert(slow,'Slow-read validator missing');slow.validateSaved(s.overrides.slow_reads);}
  if(own(s.overrides,'series_continuation_choices')){const app=root.RosewoodSeriesReview||typeof require==='function'&&require('./rosewood-series-review.js');assert(app,'Series review validator unavailable');app.valid(s.overrides.series_continuation_choices,['kindreds_curse','letters_of_enchantment','regency_faerie_tales','heroes_of_olympus','lord_of_the_rings','plated_prisoner','selection','if_he_had_been_with_me']);}
  assert(nullable(s.last_saved_at,isoInstant),'Invalid saved timestamp');
  return true;
 }
 function migrateV0(old) {
  assert(isObject(old)&&old.format==='rosewood-library-backup-v0'&&old.schema_version===0&&old.planning_year===2027,'Unrecognized legacy format');
  const allowed=['format','schema_version','planning_year','goals','progress','custom_books','unlocked_achievements','event_history','settings','overrides','last_saved_at'];
  for(const k of Object.keys(old))assert(allowed.includes(k),'Legacy fields cannot be discarded: '+k);
  const base=defaultState();
  for(const k of ['goals','settings','overrides']) if(own(old,k)) {assert(isObject(old[k]),'Legacy '+k+' malformed');for(const [name,v] of Object.entries(old[k])){assert(own(base[k],name),'Unrecognized legacy field: '+name);base[k][name]=v;}}
  for(const k of ['progress','custom_books','unlocked_achievements','event_history','last_saved_at'])if(own(old,k))base[k]=clone(old[k]);
  return base;
 }
 function waitRequest(req){return new Promise((resolve,reject)=>{req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error||new Error('Database request failed'));});}
 function waitTx(tx){return new Promise((resolve,reject)=>{tx.oncomplete=()=>resolve();tx.onabort=()=>reject(tx.error||new Error('Database transaction aborted'));tx.onerror=()=>{};});}
 const blocked = () => new Error('On-device storage is unavailable here. Open the installed HTTPS app or use an unrestricted browser; no changes have been saved.');
 function openDatabase(){return new Promise((resolve,reject)=>{
  if(!root.indexedDB){reject(blocked());return;}
  let req;try{req=root.indexedDB.open(DB_NAME,DB_VERSION);}catch(e){reject(blocked());return;}
  req.onblocked=()=>reject(new Error('Another Rosewood tab is blocking the database upgrade. Close the other tab and retry.'));
  req.onerror=()=>reject(req.error||blocked());
  req.onupgradeneeded=ev=>{
   const db=req.result,tx=req.transaction;
   if(ev.oldVersion>0 && !db.objectStoreNames.contains(STORES.state))throw new Error('Unknown previous Rosewood database layout. Refusing to initialize over existing data.');
   if(!db.objectStoreNames.contains(STORES.state))db.createObjectStore(STORES.state,{keyPath:'id'});
   if(!db.objectStoreNames.contains(STORES.meta))db.createObjectStore(STORES.meta,{keyPath:'id'});
   if(!db.objectStoreNames.contains(STORES.progress))db.createObjectStore(STORES.progress,{keyPath:'id'});
   if(!db.objectStoreNames.contains(STORES.events))db.createObjectStore(STORES.events,{keyPath:'id'});
   if(!db.objectStoreNames.contains(STORES.snapshots))db.createObjectStore(STORES.snapshots,{keyPath:'id'});
   if(ev.oldVersion>0&&ev.oldVersion<2){
    const read=tx.objectStore(STORES.state).get(STATE_KEY);
    read.onsuccess=()=>{if(read.result){
     tx.objectStore(STORES.snapshots).put({id:'pre-db-upgrade-v'+ev.oldVersion,payload:clone(read.result),reason:'pre-db-upgrade',created_at:new Date().toISOString()});
     for(const [id,progress] of Object.entries(read.result.payload?.progress||{}))tx.objectStore(STORES.progress).put({id,progress:clone(progress)});
    }};
   }
  };
  req.onsuccess=()=>{const db=req.result;db.onversionchange=()=>db.close();resolve(db);};
 });}
 const context=(books,awards,arcs=[],archivedIds=[])=>({plannedIds:[...books.map(b=>typeof b==='string'?b:b.id),...archivedIds],awardIds:awards.map(a=>typeof a==='string'?a:a.id),books,awards,arcs});
 // Session 15: unlocking is an atomic change to the original state and event stores.
 // The view-only evaluator never mutates data; it only identifies evidence already saved.
 // Earliest qualifying commit's timestamp remains preserved even if a record is reopened.
 function reconcileInTransaction(state,ctx,tx){
  const engine=root.RosewoodAchievements||typeof require==='function'&&require('./rosewood-achievements.js');
  if(!engine||ctx.awards.length!==25||ctx.awards.some(x=>!x.trigger)||ctx.books.some(x=>typeof x==='string'))return [];
  const snapshot=engine.evaluate(state,ctx.books,ctx.awards,ctx.arcs,engine.today());
  const now=new Date().toISOString(),added=[];
  for(const id of snapshot.eligible){
   const priorEvent=state.event_history.find(e=>e.type==='unlocked'&&e.item_id===id);
   if(priorEvent){state.unlocked_achievements[id]=priorEvent.at;added.push(id);continue;}
   const eventId='rosewood-earned-'+id;
   state.unlocked_achievements[id]=now;
   const ev={id:eventId,type:'unlocked',item_id:id,at:now};
   state.event_history.push(ev);tx.objectStore(STORES.events).put(clone(ev));added.push(id);
  }
  return added;
 }
 function check(s,ctx){validateState(s,ctx.plannedIds,ctx.awardIds);return s;}
 async function openReader(books,awards,arcs=[],archivedIds=[]){
  const ctx=context(books,awards,arcs,archivedIds);const db=await openDatabase();
  const tx=db.transaction([STORES.state,STORES.progress,STORES.snapshots,STORES.events],'readwrite'),done=waitTx(tx),store=tx.objectStore(STORES.state);
  const row=await waitRequest(store.get(STATE_KEY));let current;
  try{
   if(row){
    if(row.payload?.schema_version===0){current=check(migrateV0(row.payload),ctx);tx.objectStore(STORES.snapshots).put({id:'legacy-schema-v0-'+Date.now(),payload:clone(row.payload),reason:'pre-schema-migration',created_at:new Date().toISOString()});store.put({id:STATE_KEY,payload:current,revision:(row.revision||0)+1});const p=tx.objectStore(STORES.progress);p.clear();for(const [id,progress] of Object.entries(current.progress))p.put({id,progress:clone(progress)});}
    else current=check(row.payload,ctx);
   }else{current=defaultState();check(current,ctx);store.put({id:STATE_KEY,payload:current,revision:1});}
   const earned=reconcileInTransaction(current,ctx,tx);
   if(earned.length){check(current,ctx);store.put({id:STATE_KEY,payload:current,revision:(row?.revision||0)+1});}
  }catch(e){try{tx.abort();}catch(_){}await done.catch(()=>{});db.close();throw e;}
  await done;
  return {db,ctx,state:clone(current)};
 }
 async function readState(reader){const tx=reader.db.transaction([STORES.state],'readonly'),done=waitTx(tx);const row=await waitRequest(tx.objectStore(STORES.state).get(STATE_KEY));await done;assert(row&&row.payload,'Missing Rosewood record');return clone(check(row.payload,reader.ctx));}
 async function changeSettings(reader,patch){
  assert(isObject(patch)&&Object.keys(patch).length>0,'No settings to update');
  for(const key of Object.keys(patch))assert(['pages_per_hour','playback_speed','pacing_messages','reduced_motion','auto_backup_reminder'].includes(key),'Setting cannot be changed: '+key);
  const tx=reader.db.transaction([STORES.state],'readwrite'),done=waitTx(tx);
  try{
   const store=tx.objectStore(STORES.state),row=await waitRequest(store.get(STATE_KEY));assert(row,'Reader state missing');
   const s=clone(row.payload);Object.assign(s.settings,patch);s.last_saved_at=new Date().toISOString();check(s,reader.ctx);
   store.put({id:STATE_KEY,payload:s,revision:(row.revision||0)+1});await done;reader.state=clone(s);return clone(s);
  }catch(e){try{tx.abort();}catch(_){}await done.catch(()=>{});throw e;}
 }
 // SESSION 11: atomic, user-authorized priority and NONBINDING date overrides.
 // Older v1 backups already contain both keys; no schema change or automatic catalog edits.
 async function changePlanningOverrides(reader,patch){
  assert(isObject(patch)&&Object.keys(patch).length>0,'Select a planning change');
  for(const key of Object.keys(patch))assert(['reading_order_ids','user_soft_dates'].includes(key),'Planning field is not editable');
  const tx=reader.db.transaction([STORES.state],'readwrite'),done=waitTx(tx);
  try{
   const store=tx.objectStore(STORES.state),row=await waitRequest(store.get(STATE_KEY));assert(row,'Reader state missing');
   const state=clone(check(row.payload,reader.ctx));
   if(own(patch,'reading_order_ids')){
    assert(Array.isArray(patch.reading_order_ids),'Reading priority must be an array');
    state.overrides.reading_order_ids=clone(patch.reading_order_ids);
   }
   if(own(patch,'user_soft_dates')){
    assert(isObject(patch.user_soft_dates),'Suggested dates must be keyed by book ID');
    for(const [id,date] of Object.entries(patch.user_soft_dates)){
     assert([...reader.ctx.plannedIds,...state.custom_books.map(x=>x.id)].includes(id),'Unknown book for date');
     if(date===null)delete state.overrides.user_soft_dates[id];
     else{assert(isoDate(date)&&date>='2027-01-01'&&date<='2027-12-31','Soft dates must fall within 2027');state.overrides.user_soft_dates[id]=date;}
    }
   }
   state.last_saved_at=new Date().toISOString();check(state,reader.ctx);
   store.put({id:STATE_KEY,payload:state,revision:(row.revision||0)+1});
   await done;reader.state=clone(state);return clone(state.overrides);
  }catch(err){try{tx.abort();}catch(_){}await done.catch(()=>{});throw err;}
 }
 // Exact book progress is user-entered, because chapter lengths are not uniform.
 // Stored in the existing optional per-book edition override, preserving backup format.
 async function changeSlowReadPercent(reader,track,percent){
  assert(['war-and-peace','les-miserables'].includes(track),'Unknown slow-read track');
  assert(percent===null||(typeof percent==='number'&&Number.isFinite(percent)&&percent>=0&&percent<=100),'Book percentage must be from 0 to 100');
  const id=track==='war-and-peace'?'rosewood-revised-2027-031':'rosewood-revised-2027-037';
  assert(reader.ctx.plannedIds.includes(id),'Slow read is missing from this library');
  const tx=reader.db.transaction([STORES.state],'readwrite'),done=waitTx(tx);
  try{
   const store=tx.objectStore(STORES.state),row=await waitRequest(store.get(STATE_KEY));assert(row,'Reader state missing');
   const state=clone(check(row.payload,reader.ctx));
   const older=state.overrides.edition_overrides[id]||{};
   if(percent===null){
    const latest={...older};delete latest.slow_read_percent;
    if(Object.keys(latest).length)state.overrides.edition_overrides[id]=latest;
    else delete state.overrides.edition_overrides[id];
   }else state.overrides.edition_overrides[id]={...older,slow_read_percent:Math.round(percent*10)/10};
   state.last_saved_at=new Date().toISOString();check(state,reader.ctx);
   store.put({id:STATE_KEY,payload:state,revision:(row.revision||0)+1});await done;
   reader.state=clone(state);return percent;
  }catch(err){try{tx.abort();}catch(_){}await done.catch(()=>{});throw err;}
 }
 // Chapter checkmarks are explicit reader actions, independent of book-finished events.
 // Optional override preserves old backup schema v1 and imports; transaction is atomic.
 async function changeSlowReadChapter(reader,track,date,completed){
  assert(['war-and-peace','les-miserables'].includes(track),'Unknown slow-read track');
  assert(typeof completed==='boolean','Chapter checkmark requires true/false');
  const slow=root.RosewoodSlowReads||typeof require==='function'&&require('./rosewood-slowreads.js');
  assert(slow,'Slow-reading validator unavailable');
  slow.validateSaved({[track]:[date]});
  const tx=reader.db.transaction([STORES.state],'readwrite'),done=waitTx(tx);
  try{
   const store=tx.objectStore(STORES.state),row=await waitRequest(store.get(STATE_KEY));assert(row,'Reader state missing');
   const state=clone(check(row.payload,reader.ctx));if(!own(state.overrides,'slow_reads'))state.overrides.slow_reads={};
   const days=new Set(state.overrides.slow_reads[track]||[]);if(completed)days.add(date);else days.delete(date);
   state.overrides.slow_reads[track]=Array.from(days).sort();
   state.last_saved_at=new Date().toISOString();check(state,reader.ctx);
   store.put({id:STATE_KEY,payload:state,revision:(row.revision||0)+1});await done;
   reader.state=clone(state);return clone(state.overrides.slow_reads);
  }catch(err){try{tx.abort();}catch(_){}await done.catch(()=>{});throw err;}
 }
 // Custom-book changes always read current state within one exclusive write transaction.
 // On deletion, linked progress/events/overrides are removed only after explicit UI
 // confirmation; a full pre-delete recovery snapshot is saved in the SAME transaction.
 async function changeCustomBook(reader,operation,input,plannedBooks,options={}){
  assert(['create','edit','delete'].includes(operation),'Unknown custom-book operation');
  const C=root.RosewoodCustom||typeof require==='function'&&require('./rosewood-custom.js');
  assert(C,'Custom-book validation module is unavailable. Nothing was saved.');
  const planned=Array.isArray(plannedBooks)?plannedBooks:[];
  assert(planned.length===reader.ctx.books.length&&planned.every((x,i)=>x.id===reader.ctx.books[i].id),'Original catalog context mismatch');
  const stores=[STORES.state,STORES.progress,STORES.events,STORES.snapshots];
  const tx=reader.db.transaction(stores,'readwrite'),done=waitTx(tx);
  try{
   const stateStore=tx.objectStore(STORES.state),row=await waitRequest(stateStore.get(STATE_KEY));assert(row,'Reader state missing');
   const state=clone(check(row.payload,reader.ctx));
   let result,removed;
   if(operation==='delete'){
    assert(typeof input==='string','Select a custom book to delete');
    const idx=state.custom_books.findIndex(b=>b.id===input);assert(idx>=0,'Book not found or not a custom entry');
    assert(options.confirmed===true,'Deletion requires explicit confirmation');
    removed=state.custom_books[idx];
    tx.objectStore(STORES.snapshots).put({id:'pre-custom-delete-'+Date.now()+'-'+C.newId(),reason:'pre-custom-delete',created_at:new Date().toISOString(),payload:clone(state)});
    state.custom_books.splice(idx,1);
    delete state.progress[input];state.event_history=state.event_history.filter(e=>e.item_id!==input);
    state.overrides.reading_order_ids=state.overrides.reading_order_ids.filter(id=>id!==input);
    delete state.overrides.user_soft_dates[input];delete state.overrides.edition_overrides[input];if(state.overrides.reader_notes)delete state.overrides.reader_notes[input];
    if(state.overrides.research_entries)state.overrides.research_entries=state.overrides.research_entries.filter(n=>n.book_id!==input).map(n=>({...n,linked_book_ids:n.linked_book_ids.filter(ref=>ref!==input)}));
    if(state.overrides.reader_favorites)state.overrides.reader_favorites=state.overrides.reader_favorites.filter(n=>n.book_id!==input);
    tx.objectStore(STORES.progress).clear();for(const [id,p] of Object.entries(state.progress))tx.objectStore(STORES.progress).put({id,progress:clone(p)});
    tx.objectStore(STORES.events).clear();for(const event of state.event_history)tx.objectStore(STORES.events).put(clone(event));
    result={id:input,deleted:true};
   }else{
    const details=C.validateInput(input),id=operation==='create'?C.newId():options.id;
    if(operation==='edit')assert(typeof id==='string'&&state.custom_books.some(b=>b.id===id),'Book not found or not a custom entry');
    assert(operation!=='create'||!state.custom_books.some(b=>b.id===id),'Generated ID already exists');
    const matches=C.duplicates(details,planned,state.custom_books,operation==='edit'?id:null);
    assert(!matches.length||options.allow_duplicate===true,'This title and author already exist in the library. Review the duplicate warning and check the explicit confirmation box.');
    const prev=operation==='edit'?state.custom_books.find(b=>b.id===id):null;
    const record=C.toRecord(details,id,prev?.created_at||new Date().toISOString(),prev);
    // Editing an imported book must never discard the original Goodreads 23-column record.
    if(prev&&prev.goodreads_data)record.goodreads_data=clone(prev.goodreads_data);
    if(operation==='create')state.custom_books.push(record);else state.custom_books[state.custom_books.findIndex(b=>b.id===id)]=record;
    result=clone(record);
   }
   state.last_saved_at=new Date().toISOString();check(state,reader.ctx);
   stateStore.put({id:STATE_KEY,payload:state,revision:(row.revision||0)+1});
   await done;reader.state=clone(state);return result;
  }catch(e){try{tx.abort();}catch(_){}await done.catch(()=>{});throw e;}
 }
 // Session 8: independently editable, private book notes. No reading progress or
 // completed-book events are synthesized by a note save. Existing v1 backups that
 // predate the optional reader_notes field continue to validate and restore.
 async function changeBookNotes(reader,id,values){
  assert(typeof id==='string' && (reader.ctx.plannedIds.includes(id)||reader.state.custom_books.some(b=>b.id===id)),'Unknown book for reader notes');
  assert(isObject(values),'Reader notes must be an object');
  keysExact(values,['personal','research','spoilers'],'Editable reader notes');
  for(const field of ['personal','research','spoilers'])assert(typeof values[field]==='string'&&values[field].length<=20000,'Invalid '+field+' notes (maximum 20,000 characters)');
  const tx=reader.db.transaction([STORES.state,STORES.events],'readwrite'),done=waitTx(tx);
  try{
   const store=tx.objectStore(STORES.state),row=await waitRequest(store.get(STATE_KEY));assert(row,'Reader state missing');
   const state=clone(check(row.payload,reader.ctx));
   const allIds=new Set([...reader.ctx.plannedIds,...state.custom_books.map(b=>b.id)]);
   assert(allIds.has(id),'This book is no longer saved. Nothing was written.');
   if(!state.overrides.reader_notes)state.overrides.reader_notes={};
   const hasText=['personal','research','spoilers'].some(k=>values[k].trim().length>0);
   if(hasText)state.overrides.reader_notes[id]={personal:values.personal,research:values.research,spoilers:values.spoilers,updated_at:new Date().toISOString()};
   else delete state.overrides.reader_notes[id];
   reconcileInTransaction(state,reader.ctx,tx);
   state.last_saved_at=new Date().toISOString();check(state,reader.ctx);
   store.put({id:STATE_KEY,payload:state,revision:(row.revision||0)+1});
   await done;reader.state=clone(state);return clone(state.overrides.reader_notes[id]||null);
  }catch(err){try{tx.abort();}catch(_){}await done.catch(()=>{});throw err;}
 }
 // A yes/no series interest record is separate from saved reading priorities and progress.
 async function changeSeriesReview(reader,choices){
  const engine=root.RosewoodSeriesReview||typeof require==='function'&&require('./rosewood-series-review.js');
  const ids=['kindreds_curse','letters_of_enchantment','regency_faerie_tales','heroes_of_olympus','lord_of_the_rings','plated_prisoner','selection','if_he_had_been_with_me'];
  assert(engine&&isObject(choices)&&Object.keys(choices).length>0,'Select a yes/no series choice');engine.valid(choices,ids);
  const tx=reader.db.transaction([STORES.state],'readwrite'),done=waitTx(tx);
  try{const store=tx.objectStore(STORES.state),row=await waitRequest(store.get(STATE_KEY));assert(row,'Reader state missing');const s=clone(check(row.payload,reader.ctx));
   s.overrides.series_continuation_choices={...(s.overrides.series_continuation_choices||{}),...choices};s.last_saved_at=new Date().toISOString();check(s,reader.ctx);
   store.put({id:STATE_KEY,payload:s,revision:(row.revision||0)+1});await done;reader.state=clone(s);return clone(s.overrides.series_continuation_choices);
  }catch(e){try{tx.abort();}catch(_){}await done.catch(()=>{});throw e;}
 }
 // Explicit user-previewed Goodreads CSV import: all custom books, historical records
 // and the state mirror are written in one transaction or all rolled back.
 async function importGoodreads(reader,preview,options={}){
  assert(options.confirmed===true,'Import requires explicit reader confirmation');
  assert(isObject(preview)&&Array.isArray(preview.records)&&preview.records.length<=2000,'Invalid import preview');
  const G=root.RosewoodGoodreads||typeof require==='function'&&require('./rosewood-goodreads.js');assert(G,'CSV import module unavailable');
  const tx=reader.db.transaction([STORES.state,STORES.progress,STORES.events],'readwrite'),done=waitTx(tx);
  try{
   const store=tx.objectStore(STORES.state),row=await waitRequest(store.get(STATE_KEY));assert(row,'Reader state missing');
   const state=clone(check(row.payload,reader.ctx));
   const seen=new Set([...reader.ctx.plannedIds,...state.custom_books.map(b=>b.id)]);
   for(const rec of preview.records){
    assert(typeof rec.id==='string'&&/^rosewood-custom-goodreads-\d{1,15}$/.test(rec.id)&&!seen.has(rec.id),'Duplicate/invalid Goodreads ID; import refused');
    assert(isObject(rec.row),'Invalid Goodreads row');
    const book=G.bookFrom(rec);state.custom_books.push(book);seen.add(book.id);
    const progress=G.progressFrom(rec.row);if(progress)state.progress[book.id]=progress;
   }
   state.last_saved_at=new Date().toISOString();check(state,reader.ctx);
   store.put({id:STATE_KEY,payload:state,revision:(row.revision||0)+1});
   const mirror=tx.objectStore(STORES.progress);mirror.clear();for(const [id,p] of Object.entries(state.progress))mirror.put({id,progress:clone(p)});
   await done;reader.state=clone(state);return {added:preview.records.length,read:preview.records.filter(r=>!!G.progressFrom(r.row)).length};
  }catch(e){try{tx.abort();}catch(_){}await done.catch(()=>{});throw e;}
 }
 // Session 14: each research/favorite operation is a single indexedDB write transaction.
 // No progress, ratings, events, goals, or completed-book history is touched.
 async function changeResearchItem(reader,collection,operation,values,options={}){
  assert(['research_entries','reader_favorites'].includes(collection),'Unknown research collection');
  assert(['create','edit','delete'].includes(operation),'Unknown research action');
  const engine=root.RosewoodResearch||typeof require==='function'&&require('./rosewood-research.js');
  assert(engine,'Private research module unavailable');
  const tx=reader.db.transaction([STORES.state,STORES.events],'readwrite'),done=waitTx(tx);
  try{
   const store=tx.objectStore(STORES.state),row=await waitRequest(store.get(STATE_KEY));assert(row,'Reader state missing');
   const s=clone(check(row.payload,reader.ctx));
   const ids=new Set([...reader.ctx.plannedIds,...s.custom_books.map(x=>x.id)]);
   const list=s.overrides[collection]||[];let record;
   if(operation==='delete'){
    assert(options.confirmed===true,'Deleting private research requires explicit confirmation');
    const index=list.findIndex(x=>x.id===values);assert(index>=0,'Research item not found');
    record=clone(list[index]);list.splice(index,1);
   }else{
    assert(isObject(values),'Research input must be an object');
    const old=operation==='edit'?list.find(x=>x.id===values.id):null;
    if(operation==='edit')assert(old,'Research item not found');
    record=collection==='research_entries'?engine.newEntry(values,ids,old):engine.newFavorite(values,ids,old);
    if(operation==='create')list.push(record);else list[list.findIndex(x=>x.id===old.id)]=record;
   }
   s.overrides[collection]=list;reconcileInTransaction(s,reader.ctx,tx);s.last_saved_at=new Date().toISOString();check(s,reader.ctx);
   store.put({id:STATE_KEY,payload:s,revision:(row.revision||0)+1});
   await done;reader.state=clone(s);return clone(record);
  }catch(err){try{tx.abort();}catch(_){}await done.catch(()=>{});throw err;}
 }
 // Session 9: one validated reading record per stable ID. The only event dates
 // describe explicit saves/transitions, never inferred pages read or sessions.
 const progressFields=['status','percent','started_at','finished_at','pages_read','audio_minutes_elapsed_1x','method','rating_quarter_stars','notes','review','goodreads_eligible','is_reread','reread_allowed'];
 function emptyProgress(eligible=true){return {status:'not_started',percent:0,started_at:null,finished_at:null,pages_read:null,audio_minutes_elapsed_1x:null,method:'unspecified',rating_quarter_stars:null,notes:'',review:'',goodreads_eligible:!!eligible,is_reread:false,reread_allowed:false};}
 function validateProgressInput(value,eligible){
  keysExact(value,progressFields,'Book progress');
  const p=value;
  assert(STATUSES.has(p.status),'Choose a valid reading status');
  assert(isNum(p.percent)&&p.percent>=0&&p.percent<=100,'Percent must be between 0 and 100');
  assert(p.status==='finished'?p.percent===100:p.percent<100,'Only finished books can have 100% completion');
  if(p.status==='not_started')assert(p.percent===0,'Not started requires zero percent');
  assert(nullable(p.started_at,isoDate)&&nullable(p.finished_at,isoDate),'Start/finish date is invalid');
  assert(p.status==='finished'?!!p.finished_at:p.finished_at===null,'Only finished books may have a finish date; completed books require one');
  assert(!p.started_at||!p.finished_at||p.started_at<=p.finished_at,'Finish date is before start date');
  for(const key of ['pages_read','audio_minutes_elapsed_1x'])assert(nullable(p[key],x=>isNum(x)&&x>=0&&x<=1e8),'Invalid '+key+' amount');
  assert(METHODS.has(p.method),'Unknown reading format');
  assert(nullable(p.rating_quarter_stars,x=>isNum(x)&&x>=0.25&&x<=5&&Number.isInteger(x*4)),'Rating must use quarter-star increments from 0.25 to 5');
  assert(typeof p.notes==='string'&&p.notes.length<=20000&&typeof p.review==='string'&&p.review.length<=20000,'Reading note/review too long');
  assert(typeof p.goodreads_eligible==='boolean'&&p.goodreads_eligible===eligible,'Eligibility must match this book’s saved classification');
  assert(typeof p.is_reread==='boolean'&&typeof p.reread_allowed==='boolean','Reread flags must be boolean');
  assert(!p.is_reread||p.reread_allowed,'Reread requires explicit authorization');
  return clone(p);
 }
 async function changeBookProgress(reader,id,action,values=null,options={}){
  assert(typeof id==='string','A valid stable book ID is required');
  assert(action==='save'||action==='clear','Unknown progress action');
  // All operations obtain the freshest state inside one write transaction to
  // prevent a stale reader handle overwriting other books' journals or edits.
  const tx=reader.db.transaction([STORES.state,STORES.progress,STORES.events],'readwrite'),done=waitTx(tx);
  try{
   const main=tx.objectStore(STORES.state),row=await waitRequest(main.get(STATE_KEY));assert(row,'Reader state missing');
   const state=clone(check(row.payload,reader.ctx));
   const book=state.custom_books.find(b=>b.id===id);
   const validId=reader.ctx.plannedIds.includes(id)||!!book;
   assert(validId,'This book does not exist in your Rosewood library. No changes saved.');
   const eligibility=book?book.goodreads_eligible:true;
   const old=state.progress[id]||null;
   if(action==='clear'){
    assert(options.confirmedClear===true,'Clearing reading progress requires confirmation');
    delete state.progress[id];
   }else{
    const record=validateProgressInput(values,eligibility);
    if(record.status==='finished'&&old?.status!=='finished')assert(options.confirmedCompletion===true,'Confirm that you actually finished the book');
    if(old?.status==='finished'&&record.status!=='finished')assert(options.confirmedReopen===true,'Reopening a finished book requires explicit confirmation');
    // A same-title reread is one persisted record, not a second earned book.
    state.progress[id]=record;
    const changed= !old || old.status!==record.status || old.percent!==record.percent || old.pages_read!==record.pages_read || old.audio_minutes_elapsed_1x!==record.audio_minutes_elapsed_1x || old.started_at!==record.started_at || old.finished_at!==record.finished_at;
    if(changed){
     const type=record.status==='finished'&&old?.status!=='finished'?'finished':old?.status==='finished'&&record.status!=='finished'?'reopened':'progress_changed';
     const uuid=root.crypto?.randomUUID?.()||('rosewood-'+Date.now()+'-'+Math.random().toString(36).slice(2));
     state.event_history.push({id:uuid,type,item_id:id,at:new Date().toISOString()});
    }
   }
   reconcileInTransaction(state,reader.ctx,tx);
   state.last_saved_at=new Date().toISOString();check(state,reader.ctx);
   main.put({id:STATE_KEY,payload:state,revision:(row.revision||0)+1});
   // Clearing and rebuilding just this mirror guarantees no stale extra row;
   // the whole transaction rolls back on any failure.
   const mirror=tx.objectStore(STORES.progress);mirror.clear();
   for(const [bookId,p] of Object.entries(state.progress))mirror.put({id:bookId,progress:clone(p)});
   const events=tx.objectStore(STORES.events);events.clear();
   for(const ev of state.event_history)events.put(clone(ev));
   await done;reader.state=clone(state);
   return clone(state.progress[id]||null);
  }catch(e){try{tx.abort();}catch(_){}await done.catch(()=>{});throw e;}
 }
 async function reconcileAwards(reader){
  const tx=reader.db.transaction([STORES.state,STORES.events],'readwrite'),done=waitTx(tx);
  try{const store=tx.objectStore(STORES.state),row=await waitRequest(store.get(STATE_KEY));assert(row,'Reader state missing');
   const state=clone(check(row.payload,reader.ctx)),earned=reconcileInTransaction(state,reader.ctx,tx);
   if(earned.length){state.last_saved_at=new Date().toISOString();check(state,reader.ctx);store.put({id:STATE_KEY,payload:state,revision:(row.revision||0)+1});}
   await done;reader.state=clone(state);return earned;
  }catch(e){try{tx.abort();}catch(_){}await done.catch(()=>{});throw e;}
 }
 async function sha256(text){
  assert(root.crypto&&root.crypto.subtle&&typeof root.TextEncoder==='function','Secure cryptographic hashing is unavailable. Export/import requires HTTPS or a secure browser context.');
  const bytes=new root.TextEncoder().encode(text), digest=await root.crypto.subtle.digest('SHA-256',bytes);
  return Array.from(new Uint8Array(digest),x=>x.toString(16).padStart(2,'0')).join('');
 }
 async function makeBackup(reader){
  const state=await readState(reader);check(state,reader.ctx);
  const payload=stable(state);const checksum=await sha256(payload);
  return {signature:SIGNATURE,backup_version:EXPORT_VERSION,app_id:APP_ID,exported_at:new Date().toISOString(),integrity:{algorithm:'SHA-256',sha256:checksum},state};
 }
 async function inspectBackup(reader,text){
  assert(typeof text==='string'&&new TextEncoder().encode(text).byteLength<=MAX_BACKUP_BYTES,'Backup file too large or invalid');
  let obj;try{obj=JSON.parse(text);}catch(_){throw new Error('This is not a valid JSON backup.');}
  keysExact(obj,['signature','backup_version','app_id','exported_at','integrity','state'],'Backup envelope');
  assert(obj.signature===SIGNATURE&&obj.backup_version===1&&obj.app_id===APP_ID,'Not a compatible Rosewood Library backup. Disc Ledger backups cannot be imported.');
  assert(isoInstant(obj.exported_at),'Backup export date invalid');
  keysExact(obj.integrity,['algorithm','sha256'],'Backup checksum');
  assert(obj.integrity.algorithm==='SHA-256'&&/^[a-f0-9]{64}$/.test(obj.integrity.sha256),'Invalid checksum metadata');
  const hash=await sha256(stable(obj.state));assert(hash===obj.integrity.sha256,'Backup checksum does not match: file may have been changed or damaged.');
  check(obj.state,reader.ctx);
  return {state:clone(obj.state), expected_sha256:hash, preview:{exported_at:obj.exported_at,custom_books:obj.state.custom_books.length,progress_records:Object.keys(obj.state.progress).length,events:obj.state.event_history.length,awards:Object.keys(obj.state.unlocked_achievements).length,goals:clone(obj.state.goals)}};
 }
 async function restoreBackup(reader,inspected){
  // UI must explicitly confirm; backend accepts only a validated preview object.
  assert(isObject(inspected)&&isObject(inspected.preview)&&isObject(inspected.state),'Import must be inspected first');
  check(inspected.state,reader.ctx);
  assert(typeof inspected.expected_sha256==='string' && inspected.expected_sha256===await sha256(stable(inspected.state)),'Import preview was changed after validation. Inspect the original backup again.');
  const tx=reader.db.transaction([STORES.state,STORES.progress,STORES.events,STORES.snapshots],'readwrite'),done=waitTx(tx);
  try{
   const stateStore=tx.objectStore(STORES.state),row=await waitRequest(stateStore.get(STATE_KEY));assert(row,'Reader state missing');
   const before=clone(row.payload);
   tx.objectStore(STORES.snapshots).put({id:'pre-import-'+Date.now()+'-'+Math.round(Math.random()*1e9),reason:'pre-import',created_at:new Date().toISOString(),payload:before});
   // The copy/import and event mirror are atomic across three stores.
   stateStore.put({id:STATE_KEY,payload:clone(inspected.state),revision:(row.revision||0)+1});
   const progressStore=tx.objectStore(STORES.progress);progressStore.clear();for(const [id,progress] of Object.entries(inspected.state.progress))progressStore.put({id,progress:clone(progress)});
   const eventStore=tx.objectStore(STORES.events);eventStore.clear();for(const ev of inspected.state.event_history)eventStore.put(clone(ev));
   await done;reader.state=clone(inspected.state);return clone(reader.state);
  }catch(e){try{tx.abort();}catch(_){}await done.catch(()=>{});throw e;}
 }
 // Cloud sync: write a merged state produced by BrosiaSync. Aborts if the local
 // record changed after the merge was computed, so a concurrent edit is never lost.
 async function applySyncedState(reader,next,expectedSavedAt){
  check(next,reader.ctx);
  const tx=reader.db.transaction([STORES.state,STORES.progress,STORES.events,STORES.snapshots],'readwrite'),done=waitTx(tx);
  try{
   const stateStore=tx.objectStore(STORES.state),row=await waitRequest(stateStore.get(STATE_KEY));assert(row,'Reader state missing');
   if(expectedSavedAt!==undefined&&row.payload.last_saved_at!==expectedSavedAt)throw Error('Local library changed during sync; will retry');
   tx.objectStore(STORES.snapshots).put({id:'pre-sync-latest',reason:'pre-sync',created_at:new Date().toISOString(),payload:clone(row.payload)});
   stateStore.put({id:STATE_KEY,payload:clone(next),revision:(row.revision||0)+1});
   const progressStore=tx.objectStore(STORES.progress);progressStore.clear();for(const [id,progress] of Object.entries(next.progress))progressStore.put({id,progress:clone(progress)});
   const eventStore=tx.objectStore(STORES.events);eventStore.clear();for(const ev of next.event_history)eventStore.put(clone(ev));
   await done;reader.state=clone(next);return clone(next);
  }catch(e){try{tx.abort();}catch(_){}await done.catch(()=>{});throw e;}
 }
 async function getSnapshotCount(reader){const tx=reader.db.transaction([STORES.snapshots],'readonly'),done=waitTx(tx),n=await waitRequest(tx.objectStore(STORES.snapshots).count());await done;return n;}
 const api={DB_NAME,DB_VERSION,SIGNATURE,APP_ID,STORES,defaultState,validateState,migrateV0,stable,openDatabase,openReader,readState,changeSettings,changePlanningOverrides,changeSlowReadPercent,changeSlowReadChapter,changeCustomBook,changeBookNotes,changeBookProgress,reconcileAwards,emptyProgress,validateProgressInput,makeBackup,changeResearchItem,changeSeriesReview,importGoodreads,inspectBackup,restoreBackup,applySyncedState,getSnapshotCount};
 root.RosewoodStorage=Object.freeze(api);
 if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
