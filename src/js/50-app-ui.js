/* Rosewood Library 2027 plan revision, derived from 0.18.0-researched-profiles-cohort3.
 * Earlier research cohorts remain unchanged.
 * Rosewood Library v0.15: real nonbinding weighted finish-by dates and saved reading priorities.
 * Seed catalog/achievement JSON is bundled locally, not fetched.
 * Online covers: progressive, strictly title+author matched Open Library public requests.
 * No ISBN/cover provenance is asserted until verified by later catalog curation. */
(() => {
 'use strict';
 // Cloud sync (Supabase). The publishable key is safe in the app; row-level
 // security limits every row to its owner.
 window.BrosiaSync.configure({url:'https://ldxnwwctiwkfzzvxleun.supabase.co',key:'sb_publishable_xj0-jWo14fhz7VL0_l22UA_FuS6eNSD'});
 window.RosewoodStorage=window.BrosiaSync.wrapStorage(window.RosewoodStorage);
 const bookCatalog=JSON.parse(document.getElementById('rosewood-seed').textContent);
 const awardCatalog=JSON.parse(document.getElementById('rosewood-achievements').textContent);
 const arcPayload=JSON.parse(document.getElementById('rosewood-arcs').textContent);
 const coverPayload=JSON.parse(document.getElementById('rosewood-cover-manifest').textContent);
 const localCoverPayload=JSON.parse(document.getElementById('brosia-cover-display-manifest').textContent);
 const localCoverAssets=new Map(localCoverPayload.covers.map(c=>[c.book_id,c.asset]));
 const bundledCovers=new Map(Object.entries(JSON.parse(document.getElementById('brosia-covers').textContent).covers||{}));
 const localCoverFor=book=>bundledCovers.get(book?.id)||null;
 // When no published cover exists, make one: a jewel or neutral cloth with the
 // title and author set in Garamond. Tone is stable per book.
 const COVER_TONES=['#1F5C4A','#22396B','#6E1E2E','#4B2D5E','#7D5A1E','#3E4A52','#2F4A32','#1E2A44','#5E4B3F','#5C3A3A'];
 const coverTone=id=>{let h=0;for(const ch of String(id))h=(h*31+ch.charCodeAt(0))>>>0;return COVER_TONES[h%COVER_TONES.length];};
 function madeCover(book){return `<div class="made-cover" style="--tone:${coverTone(book.id)}" role="img" aria-label="${esc(book.title)} by ${esc(book.author)}"><span class="made-title">${esc(book.title)}</span><span class="made-rule" aria-hidden="true"></span><span class="made-author">${esc(book.author)}</span></div>`;}
 function coverMarkup(book,extraUrl){
  const url=extraUrl||localCoverFor(book);
  if(!url)return madeCover(book);
  return `<img class="book-local-cover" src="${esc(url)}" alt="Cover of ${esc(book.title)} by ${esc(book.author)}" loading="lazy" decoding="async" onerror="this.replaceWith(Object.assign(document.createElement('div'),{innerHTML:this.dataset.fallback}).firstChild)" data-fallback="${esc(madeCover(book))}">`;
 }
 const baseline=JSON.parse(document.getElementById('rosewood-baseline').textContent);
 const literaryPayload=JSON.parse(document.getElementById('rosewood-literary-profiles').textContent);
 const literaryProfiles16=window.RosewoodLiteraryProfiles.create(literaryPayload,bookCatalog);
 const literaryPayload17=JSON.parse(document.getElementById('rosewood-literary-profiles17').textContent);
 const literaryProfiles17=window.RosewoodLiteraryProfiles17.create(literaryPayload17,bookCatalog);
 const literaryPayload18=JSON.parse(document.getElementById('rosewood-literary-profiles18').textContent);
 const literaryProfiles18=window.RosewoodLiteraryProfiles18.create(literaryPayload18,bookCatalog);
 const literaryFirstTwenty=window.RosewoodLiteraryProfiles17.combine(literaryProfiles16,literaryProfiles17);
 const literaryFirstThirty=window.RosewoodLiteraryProfiles18.combine(literaryFirstTwenty,literaryProfiles18);
 // Reject corrupted or incomplete planned catalogs before any book browsing is rendered.
 const catalogIndex=window.RosewoodCatalog.create(bookCatalog,arcPayload,coverPayload,baseline);
 // Historic research was verified against the original seed, BEFORE the separate
 // 2027 plan overlay. Never attach a predecessor profile to the replacement novel.
 const revisionPayload=JSON.parse(document.getElementById('rosewood-revision').textContent);
 const revision=window.RosewoodPlanRevision.apply(catalogIndex,revisionPayload);
 const literaryPayload19=JSON.parse(document.getElementById('rosewood-literary-profiles19').textContent);
 const literaryProfiles19=window.RosewoodLiteraryProfiles19.create(literaryPayload19,catalogIndex.books);
 const literaryFirstForty=window.RosewoodLiteraryProfiles19.combine(literaryFirstThirty,literaryProfiles19);
 const literaryPayload20=JSON.parse(document.getElementById('rosewood-literary-profiles20').textContent);
 const literaryProfiles20=window.RosewoodLiteraryProfiles20.create(literaryPayload20,catalogIndex.books);
 const literaryFirstFifty=window.RosewoodLiteraryProfiles20.combine(literaryFirstForty,literaryProfiles20);
 const literaryPayload21=JSON.parse(document.getElementById('rosewood-literary-profiles21').textContent);
 const literaryProfiles21=window.RosewoodLiteraryProfiles21.create(literaryPayload21,catalogIndex.books);
 const literaryFirstSixty=window.RosewoodLiteraryProfiles21.combine(literaryFirstFifty,literaryProfiles21);
 const literaryPayload22=JSON.parse(document.getElementById('rosewood-literary-profiles22').textContent);
 const literaryProfiles22=window.RosewoodLiteraryProfiles22.create(literaryPayload22,catalogIndex.books);
 const literaryFirstSeventy=window.RosewoodLiteraryProfiles22.combine(literaryFirstSixty,literaryProfiles22);
 const literaryPayload23=JSON.parse(document.getElementById('rosewood-literary-profiles23').textContent);
 const literaryProfiles23=window.RosewoodLiteraryProfiles23.create(literaryPayload23,catalogIndex.books);
 const literaryFirstEighty=window.RosewoodLiteraryProfiles23.combine(literaryFirstSeventy,literaryProfiles23);
 const literaryPayload24=JSON.parse(document.getElementById('rosewood-literary-profiles24').textContent);
 const literaryProfiles24=window.RosewoodLiteraryProfiles24.create(literaryPayload24,catalogIndex.books);
 const literaryFirstNinety=window.RosewoodLiteraryProfiles24.combine(literaryFirstEighty,literaryProfiles24);
 const literaryPayload25=JSON.parse(document.getElementById('rosewood-literary-profiles25').textContent);
 const literaryProfiles25=window.RosewoodLiteraryProfiles25.create(literaryPayload25,catalogIndex.books);
 const literaryFirstHundred=window.RosewoodLiteraryProfiles25.combine(literaryFirstNinety,literaryProfiles25);
 const literaryPayload26=JSON.parse(document.getElementById('rosewood-literary-profiles26').textContent);
 const literaryProfiles26=window.RosewoodLiteraryProfiles26.create(literaryPayload26,catalogIndex.books);
 const literaryProfiles=window.RosewoodLiteraryProfiles26.combine(literaryFirstHundred,literaryProfiles26);
 const slowReadPayload=JSON.parse(document.getElementById('rosewood-slowreads').textContent);
 const slowTracks=window.RosewoodSlowReads.create(slowReadPayload);
 const originalBooks=revision.previous;
 const seriesReview=JSON.parse(document.getElementById('rosewood-series-review').textContent).series;
 const books=catalogIndex.books;
 const regularSupplementPayload=JSON.parse(document.getElementById('brosia-regular-supplements').textContent);
 if(regularSupplementPayload.format!=='brosia-regular-106-catalog-v1'||regularSupplementPayload.new_regular_books?.length!==2)throw Error('Invalid extended library supplement');
 // Keep the 104 original archived book identities and 13 substitutions intact. These
 // two additional books have brand-new IDs, never inherited from displaced originals.
 for(const entry of regularSupplementPayload.new_regular_books){
  if(catalogIndex.byId.has(entry.id)||!/^rosewood-2027-10[56]$/.test(entry.id))throw Error('Duplicate/invalid supplementary book');
  const book=Object.freeze(entry);catalogIndex.books.push(book);catalogIndex.byId.set(book.id,book);
  catalogIndex.covers.set(book.id,{book_id:book.id,title:book.title,author:book.author,provider:'Open Library',status:'lookup_pending',cover_id:null,cover_url:null});
 }
 if(catalogIndex.books.length!==106)throw Error('Legacy 106-book index incomplete');
 // Catalog v2: 200 curated books in the established order, daily classics at #201–202.
 const catalogV2=window.BrosiaCatalogV2.extend(catalogIndex,JSON.parse(document.getElementById('brosia-catalog-v2').textContent));
 if(catalogV2.curated!==200||catalogV2.daily!==2||catalogV2.unique!==202)throw Error('Catalog must have 200 curated books and 2 daily classics');
 if(!catalogIndex.byId.has('rosewood-2027-105')||!catalogIndex.byId.has('rosewood-2027-106')||new Set(catalogIndex.books.map(b=>b.id)).size!==202)throw Error('Book catalog is incomplete');
 const queueEngine=window.RosewoodQueue;
 // Both yearlong classics have independent calendars; neither consumes one of
 // the 104 ordinary slots or counts in either year-end public/private total.
 const yearlongBooks=new Set(['rosewood-revised-2027-031','rosewood-revised-2027-037']);
 const awards=awardCatalog.achievements;
 const routes=[['overview','⌂','Home'],['library','▤','Books'],['discover','','Discover'],['slowreads','◷','Slow Reads'],['research','✎','Notes'],['pacing','◷','Pacing'],['achievements','✧','Awards'],['wrapped','◈','Review'],['settings','⚙','Settings']];
 const labels={discworld:'Discworld',completed_fantasy_arc:'Completed fantasy',philosophy:'Philosophy',nonfiction_research:'Research & nonfiction',standalone_literature_fantasy:'Literature & standalones'};
 const readingKind=b=>b.curated_extension?'Suggested reading':b.pathway==='philosophy'?'Required — Philosophy':yearlongBooks.has(b.id)?'Required — Daily classic':queueEngine.committed(b)?'Required — Classic':'Suggested reading';
 const icons={discworld:'✦',completed_fantasy_arc:'◇',philosophy:'◌',nonfiction_research:'✎',standalone_literature_fantasy:'❀'};
 const esc=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 const safeKey=window.RosewoodCatalog.normalize;
 const dialog=document.getElementById('modal');
 let lastFocus=null,activeRoute='overview';
 document.querySelector('.skip-link')?.addEventListener('click',event=>{event.preventDefault();document.getElementById('main-content')?.focus({preventScroll:false});});
 let rosewoodReader=null,rosewoodBusy=false,rosewoodPendingRestore=null;
 // Route switching changes presentation only. No history of books/readings is stored in this session.
 // Line icons drawn for the Ex Libris theme (stroke inherits currentColor).
 const NAV_ICONS={
  overview:'<path d="M4 11.5 12 5l8 6.5"/><path d="M6 10v9.5h12V10"/><path d="M10 19.5V15a2 2 0 0 1 4 0v4.5"/>',
  library:'<path d="M4.5 4.5h3.2v15H4.5zM9.4 4.5h3.2v15H9.4z"/><path d="m14.6 5.4 3-.7 3.4 14.6-3 .7z"/>',
  discover:'<circle cx="10.5" cy="10.5" r="6"/><path d="m15 15 5 5"/><path d="M8.2 11.5c.6-1.9 2-3 3.8-3"/>',
  slowreads:'<path d="M3 6.5c3-1.6 6-1.6 9 0 3-1.6 6-1.6 9 0v12c-3-1.6-6-1.6-9 0-3-1.6-6-1.6-9 0z"/><path d="M12 6.5v12"/><path d="M15.5 6v5l1.5-1 1.5 1V6"/>',
  research:'<path d="M19.5 4C13 5 8.5 10 6.5 17.5L5 20.5"/><path d="M19.5 4c0 6.5-4.5 10.5-11 11.5"/><path d="M10 10.5 13.5 14"/>',
  pacing:'<circle cx="12" cy="12" r="8.5"/><path d="m15.2 8.8-2 4.4-4.4 2 2-4.4z"/>',
  achievements:'<circle cx="12" cy="9" r="5"/><path d="m9.2 13.4-1.7 7.1 4.5-2.4 4.5 2.4-1.7-7.1"/>',
  wrapped:'<path d="M6.5 3.5h11v17l-5.5-3.5-5.5 3.5z"/><path d="M9.5 8h5M9.5 11h5"/>',
  settings:'<path d="M4 7h9.5M18.5 7H20M4 17h3.5M12.5 17H20"/><circle cx="16" cy="7" r="2.2"/><circle cx="10" cy="17" r="2.2"/>',
  more:'<circle cx="6" cy="12" r="1.1"/><circle cx="12" cy="12" r="1.1"/><circle cx="18" cy="12" r="1.1"/>'};
 const navIcon=name=>`<span class="nav-icon" aria-hidden="true"><svg viewBox="0 0 24 24">${NAV_ICONS[name]||''}</svg></span>`;
 const navButton=([name,,title])=>`<button type="button" class="nav-btn" data-route="${name}" aria-current="${name===activeRoute?'page':'false'}">${navIcon(name)}<span>${title}</span></button>`;
 function navHtml(){return routes.map(navButton).join('');}
 // Phones: four primary destinations plus a "More" menu for the rest.
 const MOBILE_PRIMARY=['overview','library','discover','slowreads'];
 function mobileNavHtml(){
  const primary=routes.filter(r=>MOBILE_PRIMARY.includes(r[0])).map(navButton).join('');
  const rest=routes.filter(r=>!MOBILE_PRIMARY.includes(r[0]));
  const current=rest.some(r=>r[0]===activeRoute);
  return primary+`<details class="nav-more${current?' current':''}"><summary aria-label="More sections">${navIcon('more')}<span>More</span></summary><div class="nav-more-panel">${rest.map(navButton).join('')}</div></details>`;
 }
 function renderNav(){document.getElementById('desktop-nav').innerHTML=navHtml();document.getElementById('mobile-nav').innerHTML=mobileNavHtml();}

 // Sync card + status line
 {
  const $=id=>document.getElementById(id);
  const form=$('sync-signin'),account=$('sync-account'),msg=$('sync-form-msg'),statusEl=$('sync-status'),heroSync=$('hero-sync');
  const plural=n=>n===1?'1 change':n+' changes';
  const when=iso=>{if(!iso)return '';const d=new Date(iso),m=Math.round((Date.now()-d)/60000);return m<1?'just now':m<60?m+' min ago':d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});};
  window.BrosiaSync.onStatus(s=>{
   const signedIn=!!s.email;form.hidden=signedIn;account.hidden=!signedIn;if(signedIn)$('sync-email').textContent=s.email;
   const text={signed_out:s.error||'Saved on this device only. Sign in to keep your phone, iPad and computer in step.',
    syncing:'Syncing…',pending:'Saved on this device · waiting to sync '+plural(s.pending),
    offline:s.pending?'Offline · '+plural(s.pending)+' saved here, will sync when you’re back online':'Offline · everything was synced',
    synced:'Synced with your account'+(s.lastSynced?' · '+when(s.lastSynced):''),error:'Sync needs attention: '+(s.error||'unknown problem')}[s.state]||'';
   statusEl.textContent=text;statusEl.dataset.state=s.state;
   if(heroSync){heroSync.textContent=signedIn?({synced:'· synced',syncing:'· syncing',pending:'· waiting to sync',offline:'· offline',error:'· sync needs attention'}[s.state]||''):'';heroSync.dataset.state=s.state;}
  });
  form.addEventListener('submit',async e=>{e.preventDefault();msg.textContent='Signing in…';
   try{await window.BrosiaSync.signIn($('sync-email-input').value.trim(),$('sync-password').value);msg.textContent='';$('sync-password').value='';}
   catch(err){msg.textContent=err.message==='Invalid login credentials'?'That email and password don’t match. Check them, or use Forgot password.':err.message;}});
  $('sync-forgot').addEventListener('click',async()=>{const email=$('sync-email-input').value.trim();if(!email){msg.textContent='Enter your email first, then tap Forgot password.';return;}
   try{await window.BrosiaSync.resetPassword(email);msg.textContent='Check your email for a link to reset your password.';}catch(err){msg.textContent=err.message;}});
  $('sync-now').addEventListener('click',()=>window.BrosiaSync.syncNow());
  $('sync-signout').addEventListener('click',async()=>{if(confirm('Sign out? Your library stays on this device; it just stops syncing.'))await window.BrosiaSync.signOut();});
 }
 document.addEventListener('click',e=>{const open=document.querySelector('.nav-more[open]');if(open&&!open.contains(e.target))open.removeAttribute('open');});
 {const heroDate=document.getElementById('hero-date');if(heroDate)heroDate.textContent=new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'});}
 function openRoute(name){if(!routes.some(x=>x[0]===name))return;activeRoute=name;for(const s of document.querySelectorAll('.main-section'))s.setAttribute('aria-hidden',String(s.id!==`view-${name}`));renderNav();const heading=document.querySelector(`#view-${name} h1`); if(heading){heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true});}window.scrollTo({top:0,behavior:'instant'});if(name==='library'){observeCovers();}if(name==='research')renderResearch();if(name==='discover')renderDiscover();if(name==='slowreads')renderSlowReads();}
 const BOOK_GRAPHIC='<span class="fallback-symbol" aria-hidden="true"></span>';
 let liveProgress={}; // Current saved records, never the completion event log.
 let currentGoalSummary=null;
 let pacingSummary=null,showAllPacing=false;
 function createBookCard(b){const num=String(b.plan_order).padStart(3,'0');const arc=b.series_arc_id?catalogIndex.byArc.get(b.series_arc_id):null;const rp=liveProgress[b.id];const nextSoft=pacingSummary?.queue?.find(x=>x.book_id===b.id);const pacingVisible=nextSoft?rosewoodReader?.state?.settings?.pacing_messages!==false:false;const softLabel=yearlongBooks.has(b.id)?'<div class="soft-book-date">A chapter a day, all year</div>':nextSoft&&pacingVisible?`<div class="soft-book-date" data-soft-date="${esc(b.id)}">Aim to finish by ${esc(formatSoftDate(nextSoft.suggested_finish_by))}</div>`:'';const stateLabel=rp?({not_started:'Not started',reading:'Reading',paused:'Paused',finished:'Finished',dnf:'DNF'}[rp.status]||'Reading record'):'';
  return `<article class="book-card" data-book="${esc(b.id)}" data-book-id="${esc(b.id)}" aria-label="Book ${b.plan_order}: ${esc(b.title)} by ${esc(b.author)}"><div class="book-cover" data-cover-id="${esc(b.id)}">${coverMarkup(b)}</div><div><div class="book-name">${esc(b.title)}</div><div class="book-meta">${esc(b.author)}</div><div class="book-kind">${esc(readingKind(b))}</div>${softLabel}</div><div class="right">${stateLabel?`<span class="pill rose">${esc(stateLabel)}</span>`:''}<button class="btn small-btn row-open" data-book="${esc(b.id)}" aria-label="Open ${esc(b.title)}">Open</button></div></article>`;
 }
 const goalCard=(num,kind,goal,subtitle,pct=0)=>`<section class="card ${kind} goal-card" aria-label="${esc(subtitle)}: ${num} of ${goal} books finished in 2027"><div class="topline"><strong>${kind==='rose'?'Goodreads challenge':'Private goal'}</strong></div><div class="big-num num">${num} <span>of ${goal}</span></div><div class="meter" role="progressbar" aria-label="${esc(subtitle)} progress" aria-valuemin="0" aria-valuemax="${goal}" aria-valuenow="${typeof num==='number'?Math.min(num,goal):0}"><span style="width:${pct}%"></span></div><p class="subline">${typeof num==='number'?(kind==='rose'?'One book a week':'Two books a week'):'Waiting for your records'}</p></section>`;
 document.getElementById('overview-goals').innerHTML=goalCard('—','rose',52,'Public milestone')+goalCard('—','sage',104,'Private goal');
 const goalLive=document.getElementById('goal-live-status');
 function renderUpcomingCards(){
  const root=document.getElementById('overview-bookcards');if(!root)return;
  const choices=rosewoodReader?queueEngine.getQueue(books,rosewoodReader.state.custom_books,rosewoodReader.state.overrides.reading_order_ids,rosewoodReader.state.progress):books.filter(b=>!yearlongBooks.has(b.id));
  root.innerHTML=choices.slice(0,3).map(createBookCard).join('')||'<p class="small muted">No unfinished books in your flexible queue.</p>';
 }
 renderUpcomingCards();
 const libraryRoot=document.getElementById('library-bookcards');
 const viewRoot=document.getElementById('catalog-view-root');
 const arcRoot=document.getElementById('arc-browsing');
 const customRoot=document.getElementById('custom-browsing');
 const customApi=window.RosewoodCustom;
 const arcEngine=window.RosewoodArcs;
 let arcSnapshot=null;
 let customShelfQuery='';
 let catalogView='planned';
 function currentArcDate(){const n=window.RosewoodPacing.todayLocal();return n>'2027-12-31'?'2027-12-31':n;}
 function updateArcs(){
  arcSnapshot=arcEngine.snapshots(catalogIndex,rosewoodReader?.state||{progress:{},custom_books:[]},currentArcDate());
  renderPathwayPanels();
 }
 function renderPathwayPanels(){
  const root=document.getElementById('pathway-panels');if(!root)return;
  const snap=arcSnapshot;if(!snap)return;
  const current=document.getElementById('pathway-filter').value;
  root.innerHTML=arcEngine.PATHS.map(p=>{
   const x=snap.pathways[p];return `<button type="button" class="pathway-tile" data-pathway-choose="${esc(p)}" aria-pressed="${current===p}"><span class="pathway-name">${esc(labels[p])}</span> <span class="pathway-count">${x.completed} of ${x.planned}</span></button>`;
  }).join('');
 }
 function renderArcBrowsing(){
  const view=arcSnapshot;const ready=!!rosewoodReader;
  const intro=`<p class="small muted arc-context">Each group below has a finished <strong>main story arc</strong>; connected universes can have more books. Historical titles are listed separately as context and never count toward 2027. The 2026 Discworld list reflects your stated plan, not a verified completion log. Counts here show saved 2027 finishes only.</p>`;
  arcRoot.innerHTML=intro+view.arcs.map(a=>{
   const members=a.book_ids.map(id=>catalogIndex.byId.get(id));const previous=a.historical_expected_count;
   return `<article class="card rose arc-card" data-arc-id="${esc(a.id)}" data-arc-completed="${a.finished_2027}" data-arc-remaining="${a.remaining_2027}">
    <div class="spread wrap"><div><span class="eyebrow">${a.id==='discworld:full'?'The 41 main novels':'Finished main story arc'}</span><h3>${esc(a.name)}</h3></div><span class="pill sage">${a.finished_2027}/${a.planned_2027} finished in 2027</span></div>
    <div class="arc-progress-track" role="progressbar" aria-label="${esc(a.name)}: planned 2027 books finished" aria-valuemin="0" aria-valuemax="${a.planned_2027}" aria-valuenow="${a.finished_2027}"><span style="width:${a.percentage}%"></span></div>
    <p class="small muted">${a.remaining_2027} still to read in this plan · ${a.percentage}% of 2027 titles finished. ${previous} earlier title${previous===1?'':'s'} listed as ${a.id==='discworld:full'?'expected 2026 completions':'historical context'}; ${a.total_main_arc_books} total main-arc titles.</p>
    <p class="arc-next"><strong>${a.next?'Up next in this arc:':'Main arc reading plan:'}</strong> ${a.next?`<button class="arc-book-link" type="button" data-book="${esc(a.next.id)}">${esc(a.next.title)} <span class="tiny">(open profile)</span></button>`:'All planned 2027 books completed.'}</p>
    <div class="cluster arc-actions"><button type="button" class="btn small-btn" data-arc-prioritize="${esc(a.id)}" ${ready&&a.remaining_2027?'':'disabled'}>Read this arc next</button><span class="tiny muted">Only changes your optional reading priorities after confirmation</span></div>
    <details><summary class="small">View ${members.length} planned 2027 installment${members.length===1?'':'s'}</summary><ol class="arc-members">${members.map(b=>`<li><button class="arc-book-link" data-book="${esc(b.id)}"><span>${esc(b.title)}</span><span class="tiny muted">${a.finished_ids.includes(b.id)?'✓ Finished 2027':'Not counted finished'} · #${b.plan_order}${b.series_position?' · installment '+b.series_position:''}</span></button></li>`).join('')}</ol></details>
    ${previous?`<details><summary class="small">${previous} earlier book${previous===1?'':'s'} (not 2027 credit)</summary><p class="small muted">${esc(a.historical_note)}</p><ul class="small">${a.historical_titles.map(t=>`<li>${esc(t)}</li>`).join('')}</ul></details>`:''}
    ${a.custom_related_ids.length?`<p class="small muted">${a.custom_related_ids.length} added book${a.custom_related_ids.length>1?'s':''} tagged with this series; kept separate from the defined main-arc total.</p>`:''}
    ${a.subset?'<p class="tiny muted">A connected subset, not a claim that every story in its shared universe ends here.</p>':''}
    </article>`;
  }).join('');
 }
 function requestArcPriority(arcId){
  if(!rosewoodReader||rosewoodBusy)return;
  let draft;try{draft=arcEngine.prioritize(catalogIndex,rosewoodReader.state,arcId,currentArcDate());}catch(e){document.getElementById('catalog-view-status').textContent='Priority not changed: '+e.message;return;}
  const arc=arcSnapshot?.arcs.find(x=>x.id===arcId);if(!arc)return;
  if(dialog.open&&!canLeaveProfile())return;
  showDialog(`<div class="dialog-head"><div><span class="eyebrow">Your choice · optional priority</span><h2>Read ${esc(arc.name)} next?</h2></div>${closeButton}</div><p>This will place ${draft.front.length} unfinished main-arc books first in your <strong>suggested</strong> reading order, in their internal sequence. It preserves your book records and saved dates.</p><p class="small muted">Next: ${esc(arc.next?.title||'—')}. You can undo the preference later or restore the default order.</p><label class="custom-checkbox-label"><input id="arc-priority-consent" type="checkbox"> I want to change my saved reading priorities</label><p id="arc-priority-feedback" role="status" aria-live="polite"></p><div class="cluster"><button type="button" id="arc-priority-confirm" class="btn primary" disabled>Save this priority</button><button type="button" class="btn" data-close>Cancel</button></div>`);
  dialog.querySelector('#arc-priority-consent').addEventListener('change',ev=>{dialog.querySelector('#arc-priority-confirm').disabled=!ev.target.checked});
  dialog.querySelector('#arc-priority-confirm').addEventListener('click',async()=>{
   if(rosewoodBusy||!dialog.querySelector('#arc-priority-consent')?.checked)return;
   const feedback=dialog.querySelector('#arc-priority-feedback'),button=dialog.querySelector('#arc-priority-confirm');rosewoodBusy=true;button.disabled=true;
   try{
    // Re-evaluate against the current saved reader state before starting the atomic write.
    const latest=arcEngine.prioritize(catalogIndex,rosewoodReader.state,arcId,currentArcDate());
    if(!latest.changed){feedback.textContent='This arc is already next in your saved priorities.';return;}
    await window.RosewoodStorage.changePlanningOverrides(rosewoodReader,{reading_order_ids:latest.ids});
    closeDialog();updatePacing();renderLibrary();renderUpcomingCards();
    document.getElementById('catalog-view-status').textContent=`Saved your choice: ${arc.name} is next. No books were marked finished.`;
   }catch(e){feedback.textContent='Nothing was changed: '+e.message;button.disabled=false;}
   finally{rosewoodBusy=false;}
  });
 }
 function renderLibrary(){
  updateArcs();
  document.querySelectorAll('[data-catalog-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.catalogView===catalogView)));
  viewRoot.hidden=catalogView!=='planned';arcRoot.hidden=catalogView!=='arcs';customRoot.hidden=catalogView!=='custom';
  if(catalogView==='arcs'){renderArcBrowsing();return;}
  if(catalogView==='custom'){renderCustomShelf();return;}
  const q=document.getElementById('book-search').value,way=document.getElementById('pathway-filter').value,sort=document.getElementById('book-sort').value,arc=document.getElementById('arc-filter').value,status=document.getElementById('book-status-filter').value;
  let found=window.RosewoodCatalog.query(catalogIndex,{q,pathway:way,sort:sort==='my_plan'?'plan':sort,arc});
  if(status!=='all')found=found.filter(b=>(liveProgress[b.id]?.status||'not_started')===status);
  if(sort==='my_plan'&&rosewoodReader){const priorities=arcEngine.orderWithOverrides(catalogIndex,rosewoodReader.state),byId=new Map(priorities.map((id,i)=>[id,i]));found.sort((a,b)=>byId.get(a.id)-byId.get(b.id));}
  renderPathwayPanels();
  libraryRoot.innerHTML=found.length?found.map(createBookCard).join(''):'<div class="no-results"><img src="assets/empty-shelf.svg" class="empty-illustration" width="160" height="115" alt=""><p>No planned books match those filters. Try clearing the search or changing pathways.</p></div>';
  document.getElementById('library-count').textContent=(found.length===books.length?`${found.length} books`:`${found.length} of ${books.length} books`);
  observeCovers();
 }
 document.getElementById('arc-filter').innerHTML='<option value="all">All finished story arcs</option>'+catalogIndex.arcs.map(a=>`<option value="${esc(a.id)}">${esc(a.name)}</option>`).join('');
 for(const id of ['book-search','pathway-filter','book-sort','arc-filter','book-status-filter']){
  document.getElementById(id).addEventListener(id==='book-search'?'input':'change',renderLibrary);
 }
 document.querySelectorAll('[data-catalog-view]').forEach(b=>b.addEventListener('click',()=>{catalogView=b.dataset.catalogView;renderLibrary();document.getElementById('catalog-view-status').textContent=catalogView==='planned'?'Browsing the year ahead':catalogView==='arcs'?'Browsing completed story arcs':'Browsing your saved additional books';}));
 document.getElementById('custom-search').addEventListener('input',e=>{customShelfQuery=e.target.value;renderCustomShelf();});
 document.getElementById('pathway-panels').addEventListener('click',e=>{const btn=e.target.closest('[data-pathway-choose]');if(!btn)return;const select=document.getElementById('pathway-filter');select.value=select.value===btn.dataset.pathwayChoose?'all':btn.dataset.pathwayChoose;catalogView='planned';renderLibrary();});
 arcRoot.addEventListener('click',e=>{const btn=e.target.closest('[data-arc-prioritize]');if(btn)requestArcPriority(btn.dataset.arcPrioritize);});
 // Session 15: verified award states always come from the saved library reader.
 const achievementEngine=window.RosewoodAchievements;
 achievementEngine.verifyDefinitions(awards,catalogIndex.arcs);
 let artworkUnlockedPreview=false,knownAwardEvents=null;
 function awardSnapshot(){return rosewoodReader?achievementEngine.evaluate(rosewoodReader.state,books,awards,catalogIndex.arcs,achievementEngine.today()):null;}
 function trophy(){
  const snapshot=awardSnapshot(),items=snapshot?.items||awards.map(a=>({id:a.id,title:a.title,description:a.description,progress:0,goal:a.trigger.threshold,detail:'Open your locally saved library to verify progress',earned:false,unavailable:false,earned_at:null,changed:false,locked_art:a.locked_art,unlocked_art:a.unlocked_art}));
  document.getElementById('achievement-status').textContent=snapshot?`${snapshot.earned} of ${awards.length} truly earned and saved · ${snapshot.eligible.length} currently eligible for their first unlock · 2027 reading credit only; no future or imported 2026 completions.`:'Saved awards unavailable until library storage opens; no award is assumed to be earned.';
  document.getElementById('achievements-grid').innerHTML=items.map(x=>{
   const claimed=x.earned, art=claimed||artworkUnlockedPreview?x.unlocked_art:x.locked_art;
   const state=claimed?`Earned ${new Date(x.earned_at).toLocaleDateString()}${x.changed?' · Original supporting evidence has since changed':''}`:x.legacy_unverified?'Unverified legacy award record · not counted':x.unavailable?'Not assessable: original arc catalog not present':`Locked · ${x.remaining??x.goal} remaining`;
   return `<article class="trophy ${claimed||artworkUnlockedPreview?'art-preview-unlocked':'art-preview-locked'}" data-achievement-id="${esc(x.id)}" data-earned="${claimed}" aria-label="${esc(x.title)}: ${esc(state)}"><img class="achievement-art" loading="lazy" width="154" height="154" src="${esc(art)}" alt="" decoding="async"><strong>${esc(x.title)}</strong><small>${esc(x.description)}</small><span class="pill ${claimed?'gold':''}">${esc(state)}</span><p class="tiny muted">${esc(x.detail||'')}</p>${!claimed&&typeof x.goal==='number'?`<div class="meter" role="progressbar" aria-label="${esc(x.title)} evidence" aria-valuemin="0" aria-valuemax="${x.goal}" aria-valuenow="${Math.min(x.progress,x.goal)}"><span style="width:${Math.min(100,100*x.progress/x.goal)}%"></span></div>`:''}${!claimed&&artworkUnlockedPreview?'<span class="tiny muted">Artwork preview only · not earned</span>':''}</article>`;
  }).join('');
  renderClassicsMilestones();
 }
 function renderClassicsMilestones(){
  const target=document.getElementById('classics-milestones');if(!target)return;
  if(!rosewoodReader){target.innerHTML='<p class="small muted">Your saved milestones appear when device storage opens.</p>';return;}
  const milestones=window.BrosiaReadingMilestones.evaluate(rosewoodReader.state,slowTracks);
  const slowHtml=milestones.slow.map(x=>`<article class="card soft classics-milestone"><div class="milestone-flower" aria-hidden="true">✿</div><h3>${esc(x.title)}</h3><p class="small">${esc(x.id==='war-and-peace'?'War and Peace':'Les Misérables')} · ${x.earned} of 4 quarterly levels earned</p><div class="milestone-levels" aria-label="${x.earned} of four levels unlocked">${x.levels.map(level=>`<span class="milestone-level ${level.earned?'is-earned':''}" title="${esc(level.period)} · ${level.read}/${level.required} chapters checked">${level.earned?'✦':level.level}</span>`).join('')}</div><p class="tiny muted">${x.onTrack===null?'Your progress is based on completed daily chapters.':x.onTrack?'Your chapters are caught up through today.':`${x.missing} chapter${x.missing===1?'':'s'} before today still to check off.`} A level unlocks after its quarter ends and every assigned chapter through that quarter is checked. Catching up later also counts.</p></article>`).join('');
  target.innerHTML=slowHtml;
 }
 function showAwardCelebration(ids){
  const a=awards.find(x=>x.id===ids[0]);if(!a)return;
  document.getElementById('rosewood-award-notice')?.remove();
  const panel=document.createElement('aside');panel.id='rosewood-award-notice';panel.className='real-completion-popup earned-award-popup';
  panel.setAttribute('role','status');panel.setAttribute('aria-live','polite');panel.setAttribute('aria-label','Earned Brosia’s Library achievement');
  panel.innerHTML=`<img src="${esc(a.unlocked_art)}" alt="" width="106" height="106"><div><strong>${esc(a.celebration_copy)}</strong><p>${ids.length>1?`${ids.length} genuine awards earned and saved in this transaction.`:'Your reading evidence unlocked this award.'}</p><small>Your award is already saved. Dismissing this message changes nothing.</small></div><button class="btn small-btn" type="button" aria-label="Dismiss earned achievement celebration">Close</button>`;
  panel.querySelector('button').addEventListener('click',()=>panel.remove());
  (dialog.open?dialog:document.body).appendChild(panel);
 }
 function refreshAchievements(announce=true){
  if(rosewoodReader){
   const current=new Set(rosewoodReader.state.event_history.filter(e=>e.type==='unlocked').map(e=>e.id));
   if(announce&&knownAwardEvents){const fresh=rosewoodReader.state.event_history.filter(e=>e.type==='unlocked'&&!knownAwardEvents.has(e.id)).map(e=>e.item_id);
    if(fresh.length)showAwardCelebration(fresh);
   }
   knownAwardEvents=current;
  } else knownAwardEvents=null;
  trophy();
 }
 document.getElementById('award-art-preview').addEventListener('click',()=>{artworkUnlockedPreview=!artworkUnlockedPreview;document.getElementById('award-art-preview').setAttribute('aria-pressed',String(artworkUnlockedPreview));document.getElementById('award-art-preview').textContent=artworkUnlockedPreview?'Show actual locked artwork':'Preview unearned badge artwork';trophy();});
 trophy();
 const wrappedSelect=document.getElementById('wrapped-month');
 for(let month=1;month<=12;month++){
  const value='2027-'+String(month).padStart(2,'0');
  wrappedSelect.insertAdjacentHTML('beforeend',`<option value="${value}">${esc(new Date(value+'-15T12:00:00').toLocaleDateString('en-US',{month:'long'}))}</option>`);
 }
 function renderReadingReview(){
  const root=document.getElementById('wrapped-stat-cards');if(!root)return;
  if(!rosewoodReader){root.innerHTML='<p class="small muted">Open local storage to see your saved reading history. No sample records are displayed.</p>';return;}
  const progress=rosewoodReader.state.progress||{},month=wrappedSelect.value;
  const byId=new Map([...books,...customState()].map(b=>[b.id,b]));
  const completed=Object.entries(progress).filter(([id,p])=>{
   const b=byId.get(id),eligible=!yearlongBooks.has(id)&&b&&(books.some(x=>x.id===id)?b.goodreads_eligible_planned===true:b.goodreads_eligible===true);
   return eligible&&p?.status==='finished'&&p.percent===100&&p.goodreads_eligible===true&&/^2027-\d{2}-\d{2}$/.test(p.finished_at||'')&&p.finished_at<=localIso()&&(!month||month==='all'||p.finished_at.startsWith(month));
  });
  const rated=completed.map(([,p])=>Number(p.rating)).filter(x=>Number.isFinite(x)&&x>0);
  const authors=new Set(completed.map(([id])=>byId.get(id).author));
  const values=[['Books finished',String(completed.length)],['Authors read',String(authors.size)],['Books rated',String(rated.length)],['Average rating',rated.length?(rated.reduce((a,b)=>a+b,0)/rated.length).toFixed(2)+' / 5':'—']];
  root.innerHTML=values.map(([label,value])=>`<article class="wrapped-card"><div class="small muted">${esc(label)}</div><div class="number num">${esc(value)}</div><div class="tiny muted">From saved records</div></article>`).join('')+(!completed.length?'<p class="small muted">No eligible finished books recorded for this period.</p>':'');
 }
 wrappedSelect.addEventListener('change',renderReadingReview);
 renderReadingReview();
 // The native modal traps keyboard focus; its actual heading is the accessible name.
 // The returned focus is restored by one close event rather than two competing handlers.
 function showDialog(inner,profile=false){
  if(!dialog.open)lastFocus=document.activeElement;
  dialog.classList.toggle('profile-dialog',!!profile);
  document.getElementById('modal-body').innerHTML=inner;
  const heading=dialog.querySelector('.dialog-head h2')||dialog.querySelector('h2');
  if(heading){heading.id='rosewood-active-dialog-title';heading.tabIndex=-1;dialog.setAttribute('aria-labelledby',heading.id);dialog.removeAttribute('aria-label');}
  else {dialog.removeAttribute('aria-labelledby');dialog.setAttribute('aria-label',profile?'Book profile and private notes':'Library dialog');}
  if(!dialog.open)dialog.showModal();
  // A descriptive heading is preferable to immediately announcing an unnamed × control.
  (heading||dialog.querySelector('button')||dialog).focus({preventScroll:true});
 }
 function canLeaveProfile(){const changed=!!dialog.querySelector('#reader-notes-form[data-dirty="true"], #reader-progress-form[data-dirty="true"]');return !changed||confirm('Discard your unsaved notes or reading record for this book?');}
 function closeDialog(){if(!canLeaveProfile())return;if(dialog.open)dialog.close();}
 dialog.addEventListener('click',event=>{if(event.target===dialog)closeDialog();});
 dialog.addEventListener('close',()=>{
  dialog.querySelector('#rosewood-finished-notice')?.remove();
  const target=lastFocus?.isConnected?lastFocus:document.querySelector(`#view-${activeRoute} h1`);
  target?.focus?.({preventScroll:true});lastFocus=null;
 });
 dialog.addEventListener('cancel',e=>{if(!canLeaveProfile())e.preventDefault();});
 const closeButton='<button class="close-button" type="button" data-close aria-label="Close dialog">×</button>';
 const pendingText='Research pending. This section has not yet been independently verified; no description or content guidance is being invented.';
 const progressFor=id=>rosewoodReader?.state?.progress?.[id]||null;
 const noteFor=id=>rosewoodReader?.state?.overrides?.reader_notes?.[id]||{personal:'',research:'',spoilers:'',updated_at:null};
 const hasRealValue=value=>value!==null&&value!==undefined&&String(value).trim()!==''&&!/^(?:unknown|not (?:provided|verified|applicable|selected|yet verified|identified|yet available)|edition unverified|no verified edition|no serial arc required|standalone \/ no serial arc|awaiting real pacing implementation|pending_research)$/i.test(String(value).trim());
 const displayOrPending=value=>typeof value==='string'&&value.trim()?esc(value):'';
 const fieldSection=(heading,content,subheading='')=>!content||!String(content).trim()?'' : `<section class="profile-panel"><h3>${esc(heading)}</h3>${subheading?`<p class="tiny muted">${esc(subheading)}</p>`:''}<div class="profile-content">${content}</div></section>`;
 function noteEditor(id){const current=noteFor(id),ready=!!rosewoodReader;
  return `<section class="profile-panel profile-journal"><div class="spread"><h3>My private reading journal</h3><span class="pill sage">${current.updated_at?'Last saved '+esc(new Date(current.updated_at).toLocaleString()):'Not written yet'}</span></div><p class="small muted">Personal thoughts and project research stay in library device storage. These are not book-progress entries or dated reading sessions.</p>
   <form id="reader-notes-form" data-book-id="${esc(id)}" class="stack" novalidate>
   <label class="field"><span>Personal thoughts & reading notes</span><textarea name="personal" rows="5" maxlength="20000" ${ready?'':'disabled'} placeholder="What are you noticing? Ideas, favorite passages, questions…">${esc(current.personal)}</textarea></label>
   <label class="field"><span>Literary research notes</span><textarea name="research" rows="5" maxlength="20000" ${ready?'':'disabled'} placeholder="Characters, memorable scenes, favorite details, writing style, questions…">${esc(current.research)}</textarea></label>
   <details class="spoiler-notes"><summary>My spoiler notes (private, collapsed)</summary><label class="field"><span>Spoiler notes</span><textarea name="spoilers" rows="5" maxlength="20000" ${ready?'':'disabled'} placeholder="Plot revelations and ending reflections…">${esc(current.spoilers)}</textarea></label></details>
   <div class="spread wrap"><button type="submit" class="btn primary" ${ready?'':'disabled'}>Save my notes</button><span id="reader-notes-status" role="status" aria-live="polite" class="small" data-state="${ready?'idle':'error'}">${ready?'Changes are saved when you press the button.':'Device storage unavailable. Notes cannot be saved here.'}</span></div></form></section>`;
 }
 function progressEditor(book,custom){
  const stored=progressFor(book.id),p=stored||window.RosewoodStorage.emptyProgress(custom?book.goodreads_eligible:true),ready=!!rosewoodReader;
  const statuses=[['not_started','Not started'],['reading','Reading'],['paused','Paused'],['finished','Finished'],['dnf','DNF — did not finish']];
  const methods=[['unspecified','Not specified'],['physical','Physical book'],['ebook','Ebook'],['audiobook','Audiobook'],['mixed','Mixed formats']];
  const statusLabel=stored?statuses.find(x=>x[0]===p.status)?.[1]||p.status:'No reading record yet';
  return `<section class="profile-panel progress-editor" aria-label="Saved reading progress"><div class="spread wrap"><h3>My reading progress</h3><span class="pill sage">${esc(statusLabel)}</span></div><p class="small muted">Your changes are saved only when you select Save reading record. A completed book requires its finish date and your explicit confirmation. Eligible 2027 completions update both goal cards after successful saving.</p>
   <form id="reader-progress-form" data-book-id="${esc(book.id)}" data-saved-status="${esc(p.status)}" data-dirty="false" class="stack">
   <div class="profile-progress-fields">
   <label class="field"><span>Reading status</span><select name="status" ${ready?'':'disabled'}>${statuses.map(([v,l])=>`<option value="${v}" ${p.status===v?'selected':''}>${esc(l)}</option>`).join('')}</select></label>
   <label class="field"><span>Overall completion (%)</span><input name="percent" type="number" step="1" min="0" max="100" value="${p.percent}" ${ready?'':'disabled'}></label>
   <label class="field"><span>Reading method</span><select name="method" ${ready?'':'disabled'}>${methods.map(([v,l])=>`<option value="${v}" ${p.method===v?'selected':''}>${esc(l)}</option>`).join('')}</select></label>
   <label class="field"><span>Pages read (optional)</span><input name="pages_read" type="number" min="0" step="1" value="${p.pages_read??''}" ${ready?'':'disabled'}></label>
   <label class="field"><span>Audiobook position at 1×, minutes (optional)</span><input name="audio_minutes_elapsed_1x" type="number" min="0" step="0.1" value="${p.audio_minutes_elapsed_1x??''}" ${ready?'':'disabled'}></label>
   <label class="field"><span>Started on (optional)</span><input name="started_at" type="date" value="${esc(p.started_at||'')}" ${ready?'':'disabled'}></label>
   <label class="field"><span>Finished on (required when finished)</span><input name="finished_at" type="date" value="${esc(p.finished_at||'')}" ${ready?'':'disabled'}></label>
   <label class="field"><span>My rating (optional; ¼-star increments)</span><select name="rating_quarter_stars" ${ready?'':'disabled'}><option value="">Not rated</option>${Array.from({length:20},(_,i)=>(i+1)/4).map(n=>`<option value="${n}" ${n===p.rating_quarter_stars?'selected':''}>${n.toFixed(2).replace(/0+$/,'').replace(/\.$/,'')} / 5</option>`).join('')}</select></label>
   </div>
   <label class="field"><span>Reading record note (separate from private journal)</span><textarea name="notes" rows="2" maxlength="20000" ${ready?'':'disabled'}>${esc(p.notes)}</textarea></label>
   <label class="field"><span>My written review</span><textarea name="review" rows="3" maxlength="20000" ${ready?'':'disabled'}>${esc(p.review)}</textarea></label>
   <div class="stack"><label class="custom-checkbox-label"><input type="checkbox" name="is_reread" ${p.is_reread?'checked':''} ${ready?'':'disabled'}> This is a reread (does not create another book or goal credit)</label><label class="custom-checkbox-label"><input type="checkbox" name="reread_allowed" ${p.reread_allowed?'checked':''} ${ready?'':'disabled'}> I explicitly authorize labeling this a reread</label><label class="custom-checkbox-label"><input type="checkbox" name="confirm_finished" ${ready?'':'disabled'}> I confirm this book was actually finished on the date entered (required when marking Finished)</label><label class="custom-checkbox-label"><input type="checkbox" name="confirm_reopen" ${ready?'':'disabled'}> I confirm reopening a previously finished book (only required when reopening)</label></div>
   <div class="spread wrap"><span class="small muted">Goodreads eligibility: ${custom?(book.goodreads_eligible?'Eligible per your entry':'Not eligible per your entry'):'Planned as eligible · not verified against Goodreads'}</span></div>
   <div role="status" aria-live="polite" id="reader-progress-status" data-state="${ready?'idle':'error'}" class="small">${ready?(stored?'Your last saved reading record is displayed.':'No reading progress saved yet.'):'Storage unavailable; reading records cannot be saved.'}</div>
   <div class="cluster"><button type="submit" class="btn primary" ${ready?'':'disabled'}>Save reading record</button><button type="button" class="btn custom-danger" data-clear-progress="${esc(book.id)}" ${ready&&stored?'':'disabled'}>Clear reading record</button></div></form></section>`;
 }
 function profileNavigator(book){if(!book.plan_order)return '';
  const prev=books[book.plan_order-2],next=books[book.plan_order];
  return `<nav class="profile-navigation" aria-label="Book-to-book navigation">${prev?`<button class="btn" type="button" data-book="${esc(prev.id)}" aria-label="Previous book: ${esc(prev.title)}">← Previous book</button>`:'<span></span>'}${next?`<button class="btn" type="button" data-book="${esc(next.id)}" aria-label="Next book: ${esc(next.title)}">Next book →</button>`:'<span></span>'}</nav>`;
 }
 function profileCover(book,custom){
  const url=custom?window.RosewoodCustom.safeCoverURL(book.cover_override?.url||''):null;
  return `<div class="profile-cover-frame"><div class="profile-cover-image">${coverMarkup(book,url)}</div></div>`;
 }
 function researchSourceList(p){
  return `<section class="profile-panel literary-sources"><div class="spread wrap"><h3>Sources and verification</h3><span class="pill sage">${esc(p.profile_status)} · ${esc(p.verified_at)}</span></div><p class="small muted">The cited sources support the factual claims listed under each record. Interpretive observations are labeled separately. All links are optional; the bundled profile remains available offline.</p><ol class="profile-citations">${(p.sources||[]).map(s=>`<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)}</a><div class="tiny muted">${esc(s.organization)} · ${esc(s.source_type.replaceAll('_',' '))} · ${esc(s.scope)} · ${esc(s.confidence)} confidence · checked ${esc(s.checked_on)}</div><ul class="tiny">${s.supports.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>${s.notes?`<p class="tiny muted">Limitation: ${esc(s.notes)}</p>`:''}</li>`).join('')}</ol><p class="tiny muted">Work-level research does not verify the reader’s exact physical, ebook or audiobook edition. No exact-edition cover is claimed here.</p></section>`;
 }
 function researchedDetails(book,p){
  const arc=book.series_arc_id?catalogIndex.byArc.get(book.series_arc_id):null,matched=coverIds.get(book.id);
  const pub=p.publication.first_publication_year?String(p.publication.first_publication_year):p.publication.first_publication_period||'';
  const legacyPages=book.edition?.pages?`${book.edition.pages} pages`:'';
  const legacyAudio=book.edition?.audio_minutes_1x?`${book.edition.audio_minutes_1x} min`:'';
  const facts=[['Reading order','#'+book.plan_order+' of '+books.length],['Reading category',readingKind(book)],['Author',book.author],['First publication',pub],['Narrative arc',arc?.name||p.series.name||''],['Position in arc',book.series_position?'Book '+book.series_position:p.series.position?'Book '+p.series.position:''],['Research scope','Work-level claims checked'],['Pages',book.edition?.pages?legacyPages:''],['Audio duration',book.edition?.audio_minutes_1x?legacyAudio:''],['ISBN',book.isbn13||''],['Goodreads eligibility','Planned as eligible; not an edition verification']];
  const themeLabel=t=>t.basis==='source_verified_topic'?'Source-verified topic':t.basis==='source_verified_setup_and_editorial_interpretation'?'Source setup + editorial reading':t.basis==='author_commentary_and_editorial_interpretation'?'Author commentary + editorial reading':'Editorial interpretation';
  const themeList=p.themes.map(t=>`<li><strong>${esc(t.label)}</strong><p>${esc(t.discussion)}</p><span class="tiny muted">${esc(themeLabel(t))}</span></li>`).join('');
  const related=p.related_connections.length?`<section class="profile-panel"><h3>Related reading</h3><ul class="profile-related">${p.related_connections.map(r=>{const b=catalogIndex.byId.get(r.book_id);return `<li><button type="button" class="arc-book-link" data-book="${esc(r.book_id)}">${esc(b?.title||r.label)}</button><p class="small muted">${esc(r.note)}</p></li>`;}).join('')}</ul></section>`:'';
  const examples=p.edition_information.examples||[];
  const editionText=examples.length?`<ul>${examples.map(x=>typeof x==='string'?`<li>${esc(x)}</li>`:`<li>${esc([x.publisher,x.year,x.format,x.pages?x.pages+' pages':'',x.audio_minutes_1x?`${Math.floor(x.audio_minutes_1x/60)} h ${x.audio_minutes_1x%60} min audio`:'' ,x.isbn13?'ISBN '+x.isbn13:''].filter(Boolean).join(' · '))}<div class="tiny muted">${esc(x.scope||'')}</div></li>`).join('')}</ul>`:'';
  return `<div class="profile-facts">${facts.filter(([k,v])=>hasRealValue(v)).map(([k,v])=>`<div><span>${esc(k)}</span><strong>${esc(v)}</strong></div>`).join('')}</div>
  <div class="info-box literary-verification-note"><strong>Research status: work-level profile verified.</strong> ${esc(p.verification_scope)} Editorial interpretation is identified as such. This does not verify the edition you own.</div>
  <div class="profile-grid">
   ${fieldSection('Spoiler-light overview',`<p>${esc(p.summary)}</p>`,'Original paraphrase based on the listed title-specific sources')}
   ${fieldSection('Author and work background',`<p>${esc(p.author_and_work_background)}</p>`,'Bibliographic and author facts are tied to source records below')}
   ${fieldSection('Before reading',`<p>${esc(p.before_reading)}</p>`,'Context and reading approach; not a plot recap')}
   ${fieldSection('Literary approach',`<p>${esc(p.literary_approach)}</p>`,'Editorial analysis, not a claim of authorial intent unless cited')}
   ${fieldSection('Historical and cultural context',`<p>${esc(p.context)}</p>`,'Known context and explicit limits')}
   ${themeList?fieldSection('Themes and interpretive possibilities',`<ul class="literary-theme-list">${themeList}</ul>`,'Interpretations are not presented as settled facts'):''}
   ${fieldSection('Why it may fit your reading plan',`<p>${esc(p.personal_fit)}</p>`,'A possibility, not a prediction of your reaction')}
   ${fieldSection('Possible mismatch',`<p>${esc(p.possible_mismatch)}</p>`,'Balanced reading-fit guidance')}
   ${p.content_guidance?.notes?.length?fieldSection('Content considerations',`<ul>${p.content_guidance.notes.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`):''}
   ${p.reading_questions?.length?fieldSection('Questions to carry into the book',`<ol>${p.reading_questions.map(x=>`<li>${esc(x)}</li>`).join('')}</ol>`):''}
   ${p.discussion_questions?.length?fieldSection('Discussion and reflection',`<ol>${p.discussion_questions.map(x=>`<li>${esc(x)}</li>`).join('')}</ol>`):''}
  </div>
  ${related}
  ${examples.length?`<section class="profile-panel literary-editions"><h3>Edition and listening notes</h3><p class="small muted">These are catalogue examples only and may not match your copy.</p>${editionText}</section>`:''}
  <details class="profile-panel profile-spoiler-guard"><summary>After-reading and spoiler-sensitive material (collapsed)</summary><p class="small">No editorial plot-revealing material is included in this research cohort. Your own private spoiler reflections remain in the separate, collapsed journal below.</p></details>
  ${researchSourceList(p)}
  <div class="cluster literary-reader-links"><button class="btn small-btn" type="button" data-scroll-reader-notes>Go to my private notes</button><span class="tiny muted">Your notes, ratings, progress and favorites remain separate from this editorial profile.</span></div>`;
 }
 function plannedDetails(book){
  const p=book.profile||{},arc=book.series_arc_id?catalogIndex.byArc.get(book.series_arc_id):null;
  const researched=literaryProfiles.get(book.id);if(researched)return researchedDetails(book,researched);
  const facts=[['Reading order','#'+book.plan_order+' of '+books.length],['Author',book.author],['First publication',book.publication_year?String(book.publication_year):''],['Genre',p.genre_and_form||''],['Narrative arc',arc?.name||''],['Position in arc',book.series_position?'Book '+book.series_position:''],['Pages',book.edition?.pages?String(book.edition.pages):''],['Audio at 1×',book.edition?.audio_minutes_1x?String(book.edition.audio_minutes_1x)+' min':''],['ISBN',book.isbn13||'']];
  const themes=Array.isArray(p.themes)?p.themes:[];
  const questions=Array.isArray(p.reading_questions)?p.reading_questions:[];
  const discussions=Array.isArray(p.discussion_questions)?p.discussion_questions:[];
  const section=(heading,value,sub='')=>value&&String(value).trim()?fieldSection(heading,`<p>${esc(value)}</p>`,sub):'';
  const linkedSources=Array.isArray(p.sources)?p.sources.filter(x=>x?.url&&/^https:\/\//.test(x.url)):[];
  const legacySources=Array.isArray(p.source_notes)?p.source_notes.filter(x=>x?.url_or_citation&&/^https:\/\//.test(x.url_or_citation)):[];
  const sourceItems=linkedSources.length?linkedSources.map(x=>`<li><a href="${esc(x.url)}" target="_blank" rel="noopener noreferrer">${esc(x.title)}</a><p class="small muted">${esc([x.organization,x.supports].filter(Boolean).join(' · '))}</p></li>`):legacySources.map(x=>`<li><a href="${esc(x.url_or_citation)}" target="_blank" rel="noopener noreferrer">${esc(x.supports||'Source')}</a></li>`);
  const related=Array.isArray(p.related_connections)?p.related_connections.filter(x=>catalogIndex.byId.has(x.book_id)):[];
  return `<div class="profile-facts">${facts.filter(([k,v])=>hasRealValue(v)).map(([k,v])=>`<div><span>${esc(k)}</span><strong>${esc(v)}</strong></div>`).join('')}</div>
  <div class="profile-grid">
    ${section('Spoiler-light overview',p.summary)}
    ${section('Author and work background',p.author_and_work_background)}
    ${section('Before reading',p.before_reading)}
    ${section('Literary approach',p.literary_approach)}
    ${section('Historical and cultural context',p.context)}
    ${section('Why it may fit your reading plan',p.potential_personal_fit)}
    ${section('Possible mismatch',p.potential_mismatch)}
    ${p.difficulty?.explanation?section('Difficulty and content considerations',p.difficulty.explanation):''}
    ${themes.length?fieldSection('Themes and interpretive possibilities',`<ul class="literary-theme-list">${themes.map(x=>typeof x==='string'?`<li>${esc(x)}</li>`:`<li><strong>${esc(x.label)}</strong><p>${esc(x.discussion)}</p></li>`).join('')}</ul>`):''}
    ${questions.length?fieldSection('Questions to carry into the book',`<ol>${questions.map(x=>`<li>${esc(x)}</li>`).join('')}</ol>`):''}
    ${discussions.length?fieldSection('Discussion and reflection',`<ol>${discussions.map(x=>`<li>${esc(x)}</li>`).join('')}</ol>`):''}
    ${Array.isArray(p.content_guidance)&&p.content_guidance.length?fieldSection('Content considerations',`<ul>${p.content_guidance.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`):''}
  </div>
  ${related.length?`<section class="profile-panel"><h3>Related reading</h3><ul class="profile-related">${related.map(x=>`<li><button type="button" class="arc-book-link" data-book="${esc(x.book_id)}">${esc(catalogIndex.byId.get(x.book_id).title)}</button>${x.note?`<p class="small muted">${esc(x.note)}</p>`:''}</li>`).join('')}</ul></section>`:''}
  ${sourceItems.length?`<section class="profile-panel literary-sources"><h3>Sources and reading resources</h3><ol class="profile-citations">${sourceItems.join('')}</ol></section>`:''}`;
 }
 function showBook(id){
  if(dialog.open&&!canLeaveProfile())return;
  const custom=customState().find(x=>x.id===id),book=custom||catalogIndex.byId.get(id);if(!book)return;
  const title=book.title,author=book.author;
  const lead=custom?'Added to your personal shelf':`${esc(readingKind(book))}`;
  let contents;
  if(custom){const facts=[['Author',book.author],['Reading category',book.pathway==='philosophy'?'Required — Philosophy':'Suggested reading'],['Genre',book.genre||''],['Series',book.series_name||''],['Series position',book.series_position||''],['Pages',book.pages?String(book.pages)+' · user supplied':''],['Audio',book.audio_minutes_1x?book.audio_minutes_1x+' minutes · user supplied':''],['ISBN',book.isbn||''],['Goodreads eligibility',book.goodreads_eligible?'Marked eligible by you; not externally verified':'Marked ineligible'],['Cover',book.cover_override?book.cover_override.source.replaceAll('_',' '):'']];
   contents=`<div class="profile-facts">${facts.filter(([k,v])=>hasRealValue(v)).map(([k,v])=>`<div><span>${esc(k)}</span><strong>${esc(v)}</strong></div>`).join('')}</div><div class="info-box">This is a user-added book. Bibliographic details and the series-completion status have not been independently verified.</div>
   ${book.goodreads_data?`<details class="profile-panel"><summary><strong>Imported Goodreads history · all 23 original columns</strong></summary><dl class="profile-source-list" style="margin-top:12px">${Object.entries(book.goodreads_data).map(([k,v])=>`<div><dt>${esc(k)}</dt><dd>${esc(v||'—')}</dd></div>`).join('')}</dl><p class="small muted">Historical export only, not live Goodreads sync. Editing your book metadata retains the imported source fields.</p></details>`:''}
   ${fieldSection('About this book',displayOrPending(book.custom_profile),'Your own bibliographic description; no automatic research')}
   
   ${book.notes?fieldSection('Why I added it',`<p>${esc(book.notes)}</p>`,'Your own notes'):''}
   <button class="btn rose-btn" type="button" data-edit-custom="${esc(id)}">Edit bibliographic details</button>`;
  }else contents=plannedDetails(book);
  showDialog(`<div class="profile-view" data-profile-book="${esc(id)}" data-research-status="${custom?'reader_added':literaryProfiles.has(id)?'work_level_verified':book.profile?.status==='curated_work_level_sources'?'curated_work_level_sources':'pending_research'}"><div class="dialog-head"><div><span class="eyebrow">${lead}</span><h2>${esc(title)}</h2><p class="small muted">${esc(author)}</p></div>${closeButton}</div>${profileCover(book,!!custom)}${softDateProfile(id)}${contents}${progressEditor(book,!!custom)}${noteEditor(id)}<div class="cluster"><button class="btn small-btn" type="button" data-research-from="${esc(id)}">+ Linked reading note</button><button class="btn small-btn" type="button" data-favorite-from="${esc(id)}">+ Reader favorite</button><button class="btn small-btn" type="button" data-route="research">Browse research</button></div>${!custom?profileNavigator(book):''}<div class="profile-footer"><button class="btn" type="button" data-close>Close book profile</button></div></div>`,true);
 }
 function customState(){return rosewoodReader?.state?.custom_books||[];}
 // Session 14: private book-linked commonplace journal. Every user string is escaped.
 const researchEngine=window.RosewoodResearch;
 const allLibraryBooks=()=>[...books,...(rosewoodReader?.state?.custom_books||[])];
 const itemBook=id=>allLibraryBooks().find(x=>x.id===id);
 const researchName=id=>itemBook(id)?.title||'Unavailable book';
 const researchItems=()=>rosewoodReader?.state?.overrides?.research_entries||[];
 const favoriteItems=()=>rosewoodReader?.state?.overrides?.reader_favorites||[];
 const researchOptions=(selected='')=>allLibraryBooks().map(b=>`<option value="${esc(b.id)}" ${b.id===selected?'selected':''}>${esc(b.title)} — ${esc(b.author)}</option>`).join('');
 const researchCap=x=>({reading_note:'Reading thoughts',favorite_passage:'Favorite passage',question:'Question',character:'Character',craft:'Writing & style',other:'Other',ideology:'Ideology',redemption:'Redemption',restitution:'Restitution',institutions:'Institutions'})[x]||String(x).replaceAll('_',' ');
 let pendingGoodreadsPreview=null;
 document.getElementById('goodreads-open-file').addEventListener('click',()=>{
  if(!rosewoodReader){document.getElementById('goodreads-import-status').textContent='Device storage is unavailable. No import was started.';return;}
  document.getElementById('goodreads-file').click();
 });
 document.getElementById('goodreads-file').addEventListener('change',async e=>{
  const status=document.getElementById('goodreads-import-status'),file=e.target.files?.[0];pendingGoodreadsPreview=null;
  if(!file)return;
  if(!rosewoodReader){status.textContent='Storage unavailable. No import was started.';return;}
  if(file.size>10*1024*1024){status.textContent='File exceeds the 10 MB import limit.';return;}
  try{
   const preview=window.RosewoodGoodreads.preview(await file.text(),books,customState());pendingGoodreadsPreview=preview;
   status.textContent=`Goodreads CSV checked: ${preview.input_count} rows, ${preview.new_count} new custom books, ${preview.read_count} with historic or current read dates, ${preview.skipped.length} skipped as existing/invalid. No data changed.`;
   const examples=preview.skipped.slice(0,8).map(x=>`<li>${esc(x.title)} — ${esc(x.why)}</li>`).join('');
   showDialog(`<div class="dialog-head"><div><span class="eyebrow">Review before changing your library</span><h2>Goodreads CSV import</h2></div>${closeButton}</div><p><strong>${preview.new_count} new books</strong> from ${preview.input_count} Goodreads rows; ${preview.read_count} saved read dates; ${preview.skipped.length} already present, protected or invalid.</p><p class="small" style="margin-top:10px">Every imported book retains its Goodreads metadata inside the private library backup. Existing book IDs and progress will not be overwritten. Only actual eligible finishes dated in 2027 count toward 2027 goals; older finishes are historical. No account synchronization.</p>${examples?`<details style="margin:12px 0"><summary>Sample skipped entries (${preview.skipped.length})</summary><ul class="small">${examples}</ul></details>`:''}<label class="custom-checkbox-label" style="margin:15px 0"><input id="goodreads-import-consent" type="checkbox"> I have reviewed the import and consent to adding these ${preview.new_count} books and their historical reading records on this device</label><p id="goodreads-import-error" class="small" role="alert"></p><div class="cluster"><button type="button" id="goodreads-confirm-import" class="btn primary" disabled>Import ${preview.new_count} books</button><button type="button" class="btn" data-close>Cancel</button></div>`);
   document.getElementById('goodreads-import-consent').addEventListener('change',e=>{document.getElementById('goodreads-confirm-import').disabled=!e.target.checked||!preview.new_count;});
   document.getElementById('goodreads-confirm-import').addEventListener('click',async()=>{
    if(!pendingGoodreadsPreview||!document.getElementById('goodreads-import-consent').checked)return;
    const button=document.getElementById('goodreads-confirm-import');button.disabled=true;
    try{
     const result=await window.RosewoodStorage.importGoodreads(rosewoodReader,pendingGoodreadsPreview,{confirmed:true});pendingGoodreadsPreview=null;closeDialog();refreshProgressCards();renderCustomShelf();renderResearch();status.textContent=`Imported ${result.added} books; ${result.read} saved reading dates. Original book IDs and earlier records preserved. Export a backup to protect your imported history.`;
    }catch(err){document.getElementById('goodreads-import-error').textContent='Import rolled back: '+err.message;button.disabled=false;}
   });
  }catch(err){status.textContent='CSV validation failed; nothing changed: '+err.message;}
  finally{e.target.value='';}
 });
 function renderSeriesReview(){
  const root=document.getElementById('series-review-list');if(!root)return;
  const choices=rosewoodReader?.state?.overrides?.series_continuation_choices||{},summary=window.RosewoodSeriesReview.count(seriesReview,choices);
  document.getElementById('series-review-summary').textContent=`${summary.yes} yes · ${summary.no} no · ${summary.unreviewed} undecided`;
  root.innerHTML=seriesReview.map(s=>{
   const answer=choices[s.id];const missing=s.missing_main_book_titles.map(esc).join(' · ');
   return `<article class="research-card" data-series-id="${esc(s.id)}"><div class="spread wrap"><div><h3>${esc(s.name)}</h3><p class="research-meta">${s.read_verified_in_export.length}/${s.completed_main_books} listed as read in older Goodreads history${s.currently_reading_in_export.length?` · ${s.currently_reading_in_export.length} still in progress`:''}</p></div><span class="pill ${answer===true?'sage':answer===false?'rose':'gold'}">${answer===true?'Want to continue':answer===false?'Do not continue':'Undecided'}</span></div><p class="small"><strong>Remaining or unverified:</strong> ${missing}</p><p class="tiny muted">${esc(s.note)}</p><p class="tiny muted"><a href="${esc(s.source)}" target="_blank" rel="noreferrer noopener">Publisher / series source (external)</a></p><div class="research-buttons"><button class="btn small-btn" type="button" data-series-choice="${esc(s.id)}" data-choice="yes" aria-label="Yes, continue ${esc(s.name)}">Yes</button><button class="btn small-btn" type="button" data-series-choice="${esc(s.id)}" data-choice="no" aria-label="No, skip ${esc(s.name)}">No</button></div></article>`;
  }).join('');
 }
 async function saveSeriesChoice(changes){
  const status=document.getElementById('series-review-status');if(!rosewoodReader){status.textContent='On-device storage is unavailable. No answer saved.';return;}
  status.textContent='Saving your series interest…';
  try{await window.RosewoodStorage.changeSeriesReview(rosewoodReader,changes);status.textContent='Your choices were saved. They do not change the book catalog, completion records or dates.';}
  catch(err){status.textContent='No choice saved: '+err.message;}
 }
 function renderResearch(){
  const root=document.getElementById('research-list');if(!root)return;
  if(!rosewoodReader){root.innerHTML='<p class="info-box">Private device storage is unavailable. Nothing will be saved until storage is restored.</p>';document.getElementById('favorites-list').innerHTML='';return;}
  const book=document.getElementById('research-book'),previous=book.value;
  book.innerHTML='<option value="">Every book</option>'+researchOptions(previous);
  const tag=document.getElementById('research-tag'),before=tag.value;
  const tags=[...new Set(researchItems().flatMap(n=>n.tags))].sort();tag.innerHTML='<option value="">All tags</option>'+tags.map(t=>`<option value="${esc(t)}" ${before===t?'selected':''}>${esc(t)}</option>`).join('');
  const notes=researchEngine.find(rosewoodReader.state,{query:document.getElementById('research-query').value,kind:document.getElementById('research-kind').value,bookId:book.value,tag:tag.value});
  document.getElementById('research-count').textContent=`${researchItems().length} saved note${researchItems().length===1?'':'s'}`;
  root.innerHTML=notes.length?notes.map(n=>`<article class="research-card" data-research-id="${esc(n.id)}"><div class="eyebrow">${esc(researchCap(n.kind))} · Reader-authored</div><h3>${esc(n.title)}</h3><div class="research-meta">${esc(researchName(n.book_id))} · Updated ${esc(n.updated_at.slice(0,10))}</div><p class="small">${esc(n.body)}</p><div class="research-tags">${n.tags.map(t=>`<span class="pill">${esc(t)}</span>`).join('')}</div>${n.linked_book_ids.length?`<p class="small muted">Also connected to: ${n.linked_book_ids.map(researchName).map(esc).join(' · ')}</p>`:''}<div class="research-buttons"><button class="btn small-btn" type="button" data-research-edit="${esc(n.id)}">Edit note</button><button class="btn small-btn" type="button" data-research-delete="${esc(n.id)}">Remove</button><button class="btn small-btn" type="button" data-book="${esc(n.book_id)}">Book profile</button></div></article>`).join(''):'<div class="no-results">No notes match these filters. Save an observation from a book you are reading.</div>';
  const counts=researchEngine.counts(rosewoodReader.state);
  document.getElementById('favorites-stats').innerHTML=researchEngine.CATEGORIES.map(k=>`<span class="pill">${esc(researchCap(k))}: ${counts[k]}</span>`).join('');
  const fav=favoriteItems().slice().sort((a,b)=>b.updated_at.localeCompare(a.updated_at));
  document.getElementById('favorites-list').innerHTML=fav.length?fav.map(f=>`<article class="research-card" data-favorite-id="${esc(f.id)}"><span class="eyebrow">Favorite ${esc(f.category)}</span><h3>${esc(f.label)}</h3><div class="research-meta">${esc(researchName(f.book_id))}</div><p class="small">${esc(f.reason)}</p><div class="research-buttons"><button class="btn small-btn" type="button" data-favorite-edit="${esc(f.id)}">Edit favorite</button><button class="btn small-btn" type="button" data-favorite-delete="${esc(f.id)}">Remove</button></div></article>`).join(''):'<p class="no-results small">No favorites recorded yet. These are separate from star ratings and completion records.</p>';
 }
 function showResearchEditor(id='',bookId=''){
  if(!rosewoodReader){openRoute('settings');return;}
  const previous=researchItems().find(n=>n.id===id),current=previous?.book_id||bookId||books[0].id;
  const selected=new Set(previous?.linked_book_ids||[]);
  const linked=allLibraryBooks().filter(b=>b.id!==current).map(b=>`<option value="${esc(b.id)}" ${selected.has(b.id)?'selected':''}>${esc(b.title)}</option>`).join('');
  showDialog(`<div class="dialog-head"><div><span class="eyebrow">Private commonplace book</span><h2>${previous?'Edit reading note':'New reading note'}</h2></div>${closeButton}</div><form class="research-form" id="research-editor" data-edit-id="${esc(id)}"><div class="field"><label for="research-editor-book">Primary book</label><select required id="research-editor-book" name="book_id">${researchOptions(current)}</select></div><div class="field"><label for="research-editor-kind">Note category</label><select id="research-editor-kind" name="kind">${researchEngine.KINDS.filter(k=>['reading_note','favorite_passage','question','character','craft','other'].includes(k)||previous?.kind===k).map(k=>`<option value="${k}" ${previous?.kind===k?'selected':''}>${esc(researchCap(k))}</option>`).join('')}</select></div><div class="field"><label for="research-editor-title">Note title</label><input id="research-editor-title" name="title" required maxlength="200" value="${esc(previous?.title||'')}" placeholder="A moment or thought I want to remember…"></div><div class="field"><label for="research-editor-body">Your thoughts, favorite passage reference, or other notes</label><textarea id="research-editor-body" name="body" maxlength="30000" placeholder="Write freely about what you read…">${esc(previous?.body||'')}</textarea></div><div class="field"><label for="research-editor-tags">Tags (comma-separated, max 12)</label><input id="research-editor-tags" name="tags" value="${esc((previous?.tags||[]).join(', '))}" placeholder="favorite, reaction, memorable scene"></div><div class="field"><label for="research-editor-links">Cross-reference other books (Ctrl/⌘ to select several)</label><select multiple id="research-editor-links" name="links">${linked}</select><p class="research-help">Links are saved by stable book ID. Select a primary book, then related books. No automatic thematic claims are made.</p></div><p id="research-editor-status" role="alert" class="small"></p><div class="cluster"><button class="btn primary" type="submit">Save reading note</button><button class="btn" data-close type="button">Cancel</button></div></form>`);
  document.getElementById('research-editor-title').focus();
 }
 function showFavoriteEditor(id='',bookId=''){
  if(!rosewoodReader){openRoute('settings');return;}
  const previous=favoriteItems().find(x=>x.id===id),current=previous?.book_id||bookId||books[0].id;
  showDialog(`<div class="dialog-head"><div><span class="eyebrow">Your private favorites</span><h2>${previous?'Edit saved favorite':'Save a favorite'}</h2></div>${closeButton}</div><form id="favorite-editor" class="research-form" data-edit-id="${esc(id)}"><div class="field"><label for="favorite-editor-book">Book</label><select name="book_id" id="favorite-editor-book" required>${researchOptions(current)}</select></div><div class="field"><label for="favorite-editor-category">Category</label><select id="favorite-editor-category" name="category">${researchEngine.CATEGORIES.map(k=>`<option value="${k}" ${previous?.category===k?'selected':''}>${esc(researchCap(k))}</option>`).join('')}</select></div><div class="field"><label for="favorite-editor-label">Favorite title</label><input id="favorite-editor-label" required name="label" maxlength="200" value="${esc(previous?.label||'')}"></div><div class="field"><label for="favorite-editor-reason">Why it matters to you</label><textarea name="reason" id="favorite-editor-reason" maxlength="12000">${esc(previous?.reason||'')}</textarea></div><p id="favorite-editor-status" role="alert" class="small"></p><div class="cluster"><button class="btn primary" type="submit">Save favorite</button><button class="btn" data-close type="button">Cancel</button></div></form>`);
  document.getElementById('favorite-editor-label').focus();
 }
 async function saveResearchForm(form,isFavorite){
  const data=new FormData(form),editing=form.dataset.editId;
  const value=isFavorite?{book_id:data.get('book_id'),category:data.get('category'),label:data.get('label'),reason:data.get('reason')}:{book_id:data.get('book_id'),kind:data.get('kind'),title:data.get('title'),body:data.get('body'),tags:String(data.get('tags')).split(',').map(t=>t.trim()).filter(Boolean),linked_book_ids:[...form.querySelector('#research-editor-links').selectedOptions].map(x=>x.value).filter(id=>id!==data.get('book_id'))};
  if(editing)value.id=editing;
  const message=form.querySelector('[role=alert]'),save=form.querySelector('button[type=submit]');save.disabled=true;
  try{await window.RosewoodStorage.changeResearchItem(rosewoodReader,isFavorite?'reader_favorites':'research_entries',editing?'edit':'create',value);closeDialog();renderResearch();refreshAchievements();}
  catch(e){message.textContent='Nothing was saved: '+e.message;save.disabled=false;}
 }
 function showResearchDelete(collection,id){
  if(!rosewoodReader)return;
  const entry=(collection==='research_entries'?researchItems():favoriteItems()).find(x=>x.id===id);if(!entry)return;
  showDialog(`<div class="dialog-head"><div><span class="eyebrow">Confirm private removal</span><h2>Remove “${esc(entry.title||entry.label)}”?</h2></div>${closeButton}</div><p class="small">This removes only the chosen ${collection==='research_entries'?'research note':'favorite'} from your active library and future backups. Your book, reading progress, reviews and goal counts remain unchanged.</p><label class="custom-checkbox-label" style="margin:15px 0"><input type="checkbox" id="research-delete-consent"> I understand this will remove the saved item</label><p class="small" role="alert" id="research-delete-status"></p><div class="cluster"><button type="button" class="btn custom-danger" id="research-delete-confirm" disabled>Remove this item</button><button type="button" class="btn" data-close>Keep it</button></div>`);
  document.getElementById('research-delete-consent').addEventListener('change',e=>{document.getElementById('research-delete-confirm').disabled=!e.target.checked;});
  document.getElementById('research-delete-confirm').addEventListener('click',async()=>{
   if(!document.getElementById('research-delete-consent').checked)return;
   try{await window.RosewoodStorage.changeResearchItem(rosewoodReader,collection,'delete',id,{confirmed:true});closeDialog();renderResearch();refreshAchievements();}catch(e){document.getElementById('research-delete-status').textContent='Remove failed: '+e.message;}
  });
 }
 function renderCustomShelf(){
  const target=document.getElementById('custom-books-list'),status=document.getElementById('custom-shelf-status');
  if(!rosewoodReader){status.textContent='Device storage is unavailable. No personal books can be saved here. Use an installed HTTPS app or retry storage in Settings.';target.innerHTML='<p class="info-box">Saving is disabled until library storage opens successfully.</p>';return;}
  const filtered=customState().filter(b=>customApi.normalize([b.title,b.author,b.series_name||'',b.genre||'',b.notes||''].join(' ')).includes(customApi.normalize(customShelfQuery)));
  status.textContent=`${filtered.length} of ${customState().length} added books displayed · ${books.length} original planned titles remain separate.`;
  target.innerHTML=filtered.length?filtered.map(b=>{
   const cover=b.cover_override;const safe=cover?.url?customApi.safeCoverURL(cover.url):null;const rp=liveProgress[b.id];
   return `<article class="book-card custom-book-card" data-custom-id="${esc(b.id)}"><div class="book-cover">${coverMarkup(b,safe||null)}</div><div><span class="small muted">Added book · ${esc(labels[b.pathway]||'Other')}</span><div class="book-name">${esc(b.title)}</div><div class="book-meta">${esc(b.author)}${b.series_name?' · '+esc(b.series_name):''}</div>${b.notes||b.custom_profile?`<div class="book-note">${esc((b.notes||b.custom_profile).slice(0,190))}</div>`:''}${cover?`<div class="cover-provider">Image: ${esc(cover.source.replaceAll('_',' '))}</div>`:''}</div><div class="right"><span class="pill sage">${rp?esc(({not_started:'Not started',reading:'Reading',paused:'Paused',finished:'Finished',dnf:'DNF'}[rp.status]||'Reading record')):'Saved'}</span><div class="custom-card-actions"><button class="btn small-btn" type="button" data-book="${esc(b.id)}">View</button><button class="btn small-btn" type="button" data-edit-custom="${esc(b.id)}">Edit</button><button class="btn small-btn custom-danger" type="button" data-delete-custom="${esc(b.id)}">Delete</button></div></div></article>`;
  }).join(''):'<div class="no-results"><img src="assets/empty-shelf.svg" width="110" alt=""><p>No added books match yet. Use “Add a book” to save your next discovery.</p></div>';
 }
 function showCustomBook(id){showBook(id);}
 function showAddBook(id=null){if(dialog.open&&!canLeaveProfile())return;const editing=id?customState().find(x=>x.id===id):null;if(id&&!editing)return;
  const v=(key)=>esc(editing?.[key]??'');const path=editing?.pathway||'standalone_literature_fantasy';
  showDialog(`<div class="dialog-head"><div><span class="eyebrow">Your personal shelf</span><h2>${editing?'Edit saved book':'Add an unlisted book'}</h2><p class="small muted">Your planned catalog will not be changed.</p></div>${closeButton}</div>
   <form id="custom-book-form" class="stack" novalidate data-edit-id="${esc(editing?.id||'')}">
   <div class="custom-form-error" id="custom-form-error" role="alert" hidden></div>
   <div class="field"><label for="new-book-title">Book title *</label><input id="new-book-title" name="title" required maxlength="240" autocomplete="off" value="${v('title')}" aria-describedby="custom-form-help"></div>
   <div class="field"><label for="new-book-author">Author *</label><input id="new-book-author" name="author" required maxlength="240" value="${v('author')}"></div>
   <div class="custom-form-grid"><div class="field"><label for="new-book-path">Reading pathway</label><select name="pathway" id="new-book-path">${Object.entries({...labels,other:'Other'}).map(([key,label])=>`<option value="${esc(key)}" ${path===key?'selected':''}>${esc(label)}</option>`).join('')}</select></div>
   <div class="field"><label for="new-book-genre">Genre (optional)</label><input id="new-book-genre" name="genre" maxlength="100" placeholder="Historical fiction, memoir…" value="${v('genre')}"></div></div>
   <div class="custom-form-grid"><div class="field"><label for="new-book-series">Series name (optional)</label><input id="new-book-series" name="series_name" maxlength="240" value="${v('series_name')}"></div><div class="field"><label for="new-book-series-pos">Series number (optional)</label><input id="new-book-series-pos" name="series_position" type="number" min="1" max="9999" value="${v('series_position')}"></div></div>
   <div class="custom-form-grid"><div class="field"><label for="new-book-pages">Edition pages</label><input id="new-book-pages" name="pages" type="number" min="1" max="100000" value="${v('pages')}"></div><div class="field"><label for="new-book-audio">Audiobook minutes at 1×</label><input id="new-book-audio" name="audio_minutes_1x" type="number" min="1" max="100000" value="${v('audio_minutes_1x')}"></div></div>
   <div class="custom-form-grid"><div class="field"><label for="new-book-isbn">ISBN-10 or ISBN-13 (optional)</label><input id="new-book-isbn" name="isbn" maxlength="26" placeholder="978…" value="${v('isbn')}"></div><div class="field"><label for="new-book-cover">Cover image HTTPS URL (optional)</label><input id="new-book-cover" name="cover_url" type="url" maxlength="2048" placeholder="https://…/cover.jpg" value="${esc(editing?.cover_override?.source==='user_supplied_url'?editing.cover_override.url:'')}"></div></div>
   <p class="custom-form-help" id="custom-form-help">Covers you supply are displayed as user-supplied, not verified editions. If you enter only an ISBN, the library can use Open Library's ISBN cover endpoint when online. Third-party images may reveal normal connection details to their host; reading notes are never sent.</p>
   <div class="field"><label for="new-book-notes">Your notes (optional)</label><textarea id="new-book-notes" name="notes" maxlength="12000" placeholder="Why this one caught your eye…">${esc(editing?.notes??editing?.custom_profile??'')}</textarea></div>
   <label class="custom-checkbox-label"><input type="checkbox" name="goodreads_eligible" id="new-book-eligible" ${editing?.goodreads_eligible!==false?'checked':''}><span>Goodreads-eligible published book (only finished eligible books will eventually count toward the two goals)</span></label>
   <div class="custom-confirm" id="duplicate-warning" hidden><strong>Possible duplicate book</strong><p id="duplicate-description" class="small"></p><label class="custom-checkbox-label"><input type="checkbox" id="duplicate-ack"><span>I reviewed the matching title and author, and intentionally want another entry.</span></label></div>
   <p class="tiny muted">* Required fields. ${editing?'Changes save atomically on this device.':'Your book is added to your separate personal shelf, not inserted into your approved catalog.'}</p>
   <div class="cluster"><button class="btn primary" id="custom-save" type="submit">${editing?'Save changes':'Save to my library'}</button><button class="btn" type="button" data-close>Cancel</button></div>
   </form>`);
  const form=document.getElementById('custom-book-form');for(const fld of ['new-book-title','new-book-author'])form.querySelector('#'+fld).addEventListener('input',()=>updateDuplicateWarning(form));
  updateDuplicateWarning(form);form.querySelector('#new-book-title').focus();
 }
 function collectForm(form){const f=new FormData(form);return Object.fromEntries([...f.entries()].filter(([key])=>key!=='goodreads_eligible').concat([['goodreads_eligible',form.querySelector('#new-book-eligible').checked]]));}
 function updateDuplicateWarning(form){let matches=[];try{const raw=collectForm(form);matches=customApi.duplicates(raw,books,customState(),form.dataset.editId||null);}catch(_){}
  const el=form.querySelector('#duplicate-warning');el.hidden=!matches.length;
  form.querySelector('#duplicate-description').textContent=matches.map(b=>`${b.title} by ${b.author} (${b.origin})`).join(' · ');
  if(!matches.length)form.querySelector('#duplicate-ack').checked=false;
  return matches;
 }
 function customError(form,message){const el=form.querySelector('#custom-form-error');el.textContent=message;el.hidden=false;el.scrollIntoView({block:'nearest'});el.setAttribute('tabindex','-1');el.focus({preventScroll:true});}
 async function submitCustomForm(form){if(!rosewoodReader)return customError(form,'Device saving is unavailable. No book was saved.');if(rosewoodBusy)return;
  let fields;try{fields=customApi.validateInput(collectForm(form));}catch(e){return customError(form,e.message);}
  const duplicates=updateDuplicateWarning(form);if(duplicates.length&&!form.querySelector('#duplicate-ack').checked)return customError(form,'A matching book already exists. Review the warning and check the confirmation box if you intentionally want a separate record.');
  const editingId=form.dataset.editId;const button=form.querySelector('#custom-save');button.disabled=true;rosewoodBusy=true;
  try{const result=await window.RosewoodStorage.changeCustomBook(rosewoodReader,editingId?'edit':'create',fields,books,{id:editingId,allow_duplicate:!!duplicates.length&&form.querySelector('#duplicate-ack').checked});
   closeDialog();refreshProgressCards();renderCustomShelf();document.getElementById('custom-shelf-status').textContent=`✓ Saved “${result.title}” on this device. ${customState().length} additional books · 106 approved books preserved.`;
   catalogView='custom';renderLibrary();updatePacing();openRoute('library');
  }catch(e){button.disabled=false;customError(form,'Save failed: '+e.message+' Nothing was added or changed.');}finally{rosewoodBusy=false;}
 }
 function confirmDeleteCustom(id){if(dialog.open&&!canLeaveProfile())return;const b=customState().find(x=>x.id===id);if(!b)return;showDialog(`<div class="dialog-head"><div><span class="eyebrow">Destructive action · recovery snapshot saved</span><h2>Remove “${esc(b.title)}”?</h2></div>${closeButton}</div><p>Deleting this added book will also remove its linked progress, book-specific history, and dates if any were imported. Research notes and favorites anchored to this book will also leave the active library, while cross-references to it will be safely removed. A pre-delete recovery snapshot is saved locally, but future backups reflect the deletion.</p><label class="custom-checkbox-label" style="margin:17px 0"><input id="delete-ack" type="checkbox"><span>I understand that this book and its active records will be removed.</span></label><div role="alert" id="delete-error" class="custom-form-error" hidden></div><div class="cluster"><button type="button" class="btn custom-danger" data-confirm-delete="${esc(id)}" disabled>Delete this book</button><button type="button" class="btn" data-close>Keep book</button></div>`);
  document.getElementById('delete-ack').addEventListener('change',e=>{document.querySelector('[data-confirm-delete]').disabled=!e.target.checked;});
 }
 async function deleteCustom(id){if(!rosewoodReader||rosewoodBusy)return;rosewoodBusy=true;const button=document.querySelector('[data-confirm-delete]');if(button)button.disabled=true;
  try{await window.RosewoodStorage.changeCustomBook(rosewoodReader,'delete',id,books,{confirmed:true});closeDialog();refreshProgressCards();renderCustomShelf();renderResearch();renderSlowReads();renderHomeRitual();}
  catch(e){const el=document.getElementById('delete-error');if(el){el.hidden=false;el.textContent='Deletion failed: '+e.message+' The book has not been removed.';}if(button)button.disabled=false;}finally{rosewoodBusy=false;}
 }
 function showCelebration(){showDialog(`<div class="dialog-head"><h2>Another story for your shelves</h2>${closeButton}</div><div class="celebration-content" style="position:relative;overflow:hidden"><span class="petal a" aria-hidden="true"></span><span class="petal b" aria-hidden="true"></span><span class="petal c" aria-hidden="true"></span><div class="celebration-art"><img src="assets/celebration.svg" width="260" height="168" alt="An open book, blooming rose and golden sparkles"/></div><p>Every finished book is a story worth celebrating. Your real reading history and achievements are based only on saved completions.</p><button class="btn primary" type="button" data-close>Back to my library</button></div>`);}

 function showNotice(){showDialog(`<div class="dialog-head"><div><span class="eyebrow">Brosia’s Library</span><h2>About your library</h2></div>${closeButton}</div><p>Your books, original research and progress are stored locally on this device when storage is available. Your curated books and the two chapter-a-day reading calendars are available. The daily classics are excluded from your regular-book completion totals. Your reading review shows only actual recorded eligible completions, not practice data.</p><p style="margin-top:12px"><strong>Important limitations:</strong> No automatic cross-device synchronization, live Goodreads sync or guaranteed installed-device storage durability. Exact-edition covers have not been certified. Export regular backups from Settings.</p><p>When online, public cover lookups may contact Open Library and Google Books. Opening research profiles does not fetch their linked sources automatically.</p>`);}
 // SESSION 11 — PURE WEIGHTED SUGGESTIONS; NEVER MUTATES THE BOOK CATALOG.
 const fmtHours=n=>Number.isFinite(n)?`${n.toFixed(1)} h`:'—';
 function formatSoftDate(date){if(!window.RosewoodPacing.validDate(date))return '—';
  return new Date(date+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});}
 function computePacing(asOf){
  if(!rosewoodReader)return null;
  const goal=window.RosewoodGoals.aggregate(rosewoodReader.state,books,2027);
  // 104 regular titles occupy the 104 flexible book slots. The two separate
  // classics have independent yearlong calendars and never enter these totals.
  return window.RosewoodPacing.plan(rosewoodReader.state,books.filter(b=>!yearlongBooks.has(b.id)),asOf||window.RosewoodPacing.todayLocal(),{completedIds:goal.completedIds});
 }
 function softDateProfile(id){
  if(yearlongBooks.has(id))return '<div class="profile-summary-banner rosewood-soft-profile"><strong>Yearlong chapter-a-day reading: January 1–December 31, 2027.</strong><br><span class="small">Follow the Slow Reads calendar for the chapter-a-day schedule.</span><div style="margin-top:8px"><button class="btn small-btn" type="button" data-route="slowreads">Open daily chapters</button></div></div>';
  if(!rosewoodReader?.state?.settings?.pacing_messages)return '';
  const entry=pacingSummary?.queue?.find(x=>x.book_id===id);if(!entry)return '';
  return `<div class="profile-summary-banner rosewood-soft-profile" data-soft-date="${esc(id)}"><strong>Finish by ~ ${esc(formatSoftDate(entry.suggested_finish_by))} to stay on track.</strong><br><span class="small">${entry.user_override?'Your own saved preferred date.':'Calculated, not mandatory.'} ${esc(entry.effort.source)} · ${fmtHours(entry.remaining_hours)} estimated remaining${entry.effort.provisional?' · provisional/unverified edition':''}. This is a suggestion, never a deadline.</span><div style="margin-top:8px"><button class="btn small-btn" data-pace-date="${esc(id)}" type="button">Adjust my suggested date</button></div></div>`;
 }
 // Live pace uses the private 104 goal; public 52 is a separate completion counter.
 let compassSummary=null;
 function computeCompass(asOf){
  if(!rosewoodReader)return null;
  return window.RosewoodCompass.fromReader(rosewoodReader.state,books,asOf||window.RosewoodPacing.todayLocal());
 }
 function renderCompass(asOf){
  const c=document.getElementById('reading-compass'),h=document.getElementById('compass-headline'),d=document.getElementById('compass-description'),f=document.getElementById('compass-finish'),m=document.getElementById('compass-metrics');
  if(!rosewoodReader){compassSummary=null;c.dataset.state='unknown';h.textContent='Reading records unavailable';d.textContent='On-device saving could not be opened. No reading history is assumed.';f.textContent='Your public and private goals remain unchanged.';m.innerHTML='';return;}
  const visible=rosewoodReader.state.settings.pacing_messages!==false;
  if(!visible){compassSummary=null;c.dataset.state='hidden';h.textContent='Reading compass hidden';d.textContent='Your choice is saved. Your 52-book public milestone and 104-book private goal still count normally.';f.textContent='Turn gentle pacing messages back on in Settings if you want.';m.innerHTML='';return;}
  try{compassSummary=computeCompass(asOf);}catch(err){compassSummary=null;c.dataset.state='unknown';h.textContent='Compass calculation unavailable';d.textContent=err.message;f.textContent='Your saved records have not been changed.';m.innerHTML='';return;}
  const a=compassSummary;
  if(a.phase==='preview'){
   c.dataset.state='preview';h.textContent='Your reading year begins January 1';d.textContent='Finish a book in 2027 and your pace toward 104 will show here.';
   f.textContent='';m.innerHTML='';return;
  }
  const snap=a.snapshot, status=snap.status; c.dataset.state=status;
  if(a.phase==='year_closed'){
   h.textContent='Your 2027 reading year is closed';
   d.textContent=`${a.completed} books finished in 2027.`;
  }else if(a.completed===0&&a.partial_equivalent===0){
   h.textContent='Nothing finished yet';
   d.textContent=`About ${snap.expected_book_equivalents.toFixed(1)} books by today would keep you on pace for 104.`;
  }else{
   const names={ahead:'Ahead of pace',on_track:'On pace',behind:'A little behind pace',complete:'You reached 104'};
   h.textContent=names[status]||'Your reading progress';
   const diff=Math.abs(snap.balance_book_equivalents).toFixed(1);
   d.textContent=`${a.completed} finished, about ${snap.expected_book_equivalents.toFixed(1)} expected by today.${status==='ahead'?` About ${diff} books ahead.`:status==='behind'?` About ${diff} books behind.`:''}`;
  }
  f.textContent=a.projection===null?'':`At this rate, about ${a.projection} books by year’s end.`;
  m.innerHTML='';
 }
 function exportOptionalCalendar(){
  const status=document.getElementById('rosewood-calendar-status');
  if(!rosewoodReader){status.textContent='Device storage unavailable; no export created.';return;}
  if(rosewoodReader.state.settings.pacing_messages===false){status.textContent='Gentle pacing is hidden. Enable it in Settings before exporting suggestions.';return;}
  const s=pacingSummary;
  if(!s||s.status==='year_closed'||!s.queue.length){status.textContent='No current finish-by suggestions to export.';return;}
  try{
   const withReminders=document.getElementById('calendar-reminders').checked;
   const data=window.RosewoodCompass.makeCalendar(s.queue,{reminders:withReminders});
   const blob=new Blob([data],{type:'text/calendar;charset=utf-8'}),url=URL.createObjectURL(blob),link=document.createElement('a');
   link.href=url;link.download='Rosewood_Optional_Reading_Suggestions_2027.ics';document.body.appendChild(link);link.click();link.remove();
   setTimeout(()=>URL.revokeObjectURL(url),2000);
   status.textContent=`Prepared ${s.queue.length} optional suggestion${s.queue.length===1?'':'s'}. Import the .ics file yourself; re-export after plan changes.`;
  }catch(err){status.textContent='Calendar export failed: '+err.message;}
 }
 document.getElementById('rosewood-calendar-export').addEventListener('click',exportOptionalCalendar);
 // 2027 plan commitments never change book identities. Only a saved ordering
 // preference changes, and the two slow reads always remain on daily calendars.
 function queueBooks(){return rosewoodReader?queueEngine.getQueue(books,customState(),rosewoodReader.state.overrides.reading_order_ids,rosewoodReader.state.progress):[];}
 function renderNextRead(){
  const root=document.getElementById('next-read-root');if(!root)return;
  if(!rosewoodReader){root.innerHTML='<h2>Next read</h2><p class="small">Your saved book order is unavailable until device storage opens. No changes can be made.</p>';return;}
  const all=queueBooks(),next=all[0];
  if(!next){root.innerHTML='<h2>Next read</h2><p>There are no unread eligible books available in your current selection.</p><div class="next-read-options"><button class="btn" type="button" data-open="add-book">Add a book</button><button class="btn" type="button" data-queue-import="true">Import Goodreads CSV</button></div>';return;}
  const other=queueEngine.options(books,customState(),rosewoodReader.state.overrides.reading_order_ids,rosewoodReader.state.progress,next.id)
   .sort((a,b)=>a.plan_order-b.plan_order);
  const commitment=queueEngine.commitmentSummary(books,rosewoodReader.state.progress);
  root.innerHTML=`<div class="bookplate"><div class="book-cover bookplate-cover">${coverMarkup(next)}</div><div class="bookplate-text"><span class="eyebrow">Your next read</span><h2>${esc(next.title)}</h2><div class="next-read-author">${esc(next.author)}</div><p class="bookplate-kind">${esc(readingKind(next))}</p><button class="btn small-btn" type="button" data-book="${esc(next.id)}">View book</button></div></div>
   <p class="bookplate-commitment">${commitment.finished} of ${commitment.required} required books finished · due December 31, 2027${commitment.dnf_unmet?' · '+commitment.dnf_unmet+' marked DNF still to finish':''}</p>
   <div class="next-read-controls"><label class="field" for="next-read-replacement"><span>Read something else next</span><select id="next-read-replacement" ${other.length?'':'disabled'}><option value="">Choose from ${other.length} books</option>${other.map(b=>`<option value="${esc(b.id)}">${esc(b.title)} — ${esc(b.author)}</option>`).join('')}</select></label><button type="button" class="btn primary" data-queue-swap="${esc(next.id)}" ${other.length?'':'disabled'}>Make this my next read</button></div>
   <div class="next-read-options"><button class="btn small-btn" type="button" data-queue-shuffle>Shuffle</button><button class="btn small-btn" type="button" data-queue-reset>Original order</button><button class="btn small-btn" type="button" data-route="pacing">Full reading order</button></div>
   <p class="tiny muted" role="status" id="next-read-status" aria-live="polite"></p>`;
 }
 async function saveQueueOrder(ids,success){
  if(!rosewoodReader||rosewoodBusy)return;
  const status=document.getElementById('next-read-status');rosewoodBusy=true;
  try{await window.RosewoodStorage.changePlanningOverrides(rosewoodReader,{reading_order_ids:ids});
   updatePacing();renderLibrary();renderUpcomingCards();
   document.getElementById('next-read-status')?.insertAdjacentText('afterbegin',success+' ');
  }catch(err){if(status)status.textContent='Nothing changed: '+err.message;}
  finally{rosewoodBusy=false;}
 }
 function queuePick(target){
  if(!rosewoodReader||rosewoodBusy)return;
  const from=queueBooks()[0]?.id;if(!from||!target||from===target)return;
  try{const ids=queueEngine.promote(books,customState(),rosewoodReader.state.overrides.reading_order_ids,rosewoodReader.state.progress,from,target);
   saveQueueOrder(ids,'Next book selected.');
  }catch(err){const status=document.getElementById('next-read-status');if(status)status.textContent=err.message;}
 }
 function queueSwap(from){
  const select=document.getElementById('next-read-replacement'),target=select?.value;
  if(!target)return void(document.getElementById('next-read-status').textContent='Choose a different book first.');
  try{const ids=queueEngine.promote(books,customState(),rosewoodReader.state.overrides.reading_order_ids,rosewoodReader.state.progress,from,target);
   saveQueueOrder(ids,'Next read changed! Every book and your reading history remain intact.');
  }catch(err){document.getElementById('next-read-status').textContent=err.message;}
 }
 function queueShuffle(){
  if(!rosewoodReader||rosewoodBusy)return;
  try{const result=queueEngine.shuffle(books,customState(),rosewoodReader.state.overrides.reading_order_ids,rosewoodReader.state.progress);
   saveQueueOrder(result.ids,'Unfinished regular books shuffled, including required classics and philosophy; daily slow reads stayed pinned.');
  }catch(err){document.getElementById('next-read-status').textContent=err.message;}
 }
 function queueReset(){
  if(!rosewoodReader||rosewoodBusy)return;
  showDialog(`<div class="dialog-head"><div><span class="eyebrow">Your reading plan · optional preference</span><h2>Restore the original suggested order?</h2></div>${closeButton}</div><p>This clears your <strong>saved book-order preferences only</strong>, including any earlier series priority choices. It will not remove books, clear notes, undo completions, change daily slow reads or affect saved approximate finish-by dates.</p><div class="cluster"><button class="btn primary" type="button" data-queue-confirm-reset>Restore original order</button><button class="btn" type="button" data-close>Keep my order</button></div>`);
 }
 function updatePacing(){
  pacingSummary=null;
  const note=document.getElementById('overview-soft-pacing');
  if(!rosewoodReader){renderNextRead();note.innerHTML='<strong>Gentle reading suggestions</strong><p class="small">Saved reader records are unavailable. No suggested dates were calculated.</p>';renderPacingView();renderCompass();return;}
  try{pacingSummary=computePacing();}catch(err){renderNextRead();note.textContent='Unable to calculate dates: '+err.message;renderPacingView();renderCompass();return;}
  const s=pacingSummary;const visible=rosewoodReader.state.settings.pacing_messages;
  if(!visible){note.innerHTML='<strong>Gentle pacing messages are hidden</strong><p class="small">You can turn them on in Settings at any time. No reading records are changed.</p>';}
  else if(s.status==='year_closed')note.innerHTML='<strong>2027 is complete.</strong><p class="small">Finish-by suggestions are no longer issued after December 31, 2027. Your saved reading records remain available.</p>';
  else if(s.remaining_goal===0)note.innerHTML='<strong>Your private 104-book goal is complete!</strong><p class="small">The year’s reading suggestions are optional now.</p>';
  else{const next=s.queue[0];note.innerHTML=`<strong>${s.status==='preview'?'Upcoming':'Your gentle reading plan'}</strong><p class="small">${next?`Next: ${esc(next.title)}${s.status==='preview'?' · an optional reading choice':` · an optional pace suggestion near ${esc(formatSoftDate(next.suggested_finish_by))}`}.`:'Add books to your reading queue.'} No hard deadlines.</p>`;}
  renderPacingView();renderCompass();renderNextRead();renderUpcomingCards();
 }
 function renderPacingView(){
  const summary=document.getElementById('pacing-live-summary'),stats=document.getElementById('pacing-live-stats'),list=document.getElementById('pacing-live-list');
  if(!pacingSummary||!rosewoodReader){summary.textContent='Saved data is unavailable, so no reading dates have been calculated.';stats.innerHTML='';list.innerHTML='';return;}
  const s=pacingSummary,visible=rosewoodReader.state.settings.pacing_messages;
  if(!visible){summary.innerHTML='<h2>Pacing messages are hidden</h2><p>Turn on “Show gentle pacing messages” in Settings to view suggestions. Your completed-book goals and reading records continue to work.</p>';stats.innerHTML='';list.innerHTML='';return;}
  if(s.status==='year_closed'){summary.innerHTML='<h2>Your 2027 year has ended.</h2><p>No new future finish-by suggestions are generated after December 31. All saved book progress stays intact.</p>';stats.innerHTML='';list.innerHTML='';return;}
  summary.innerHTML=`<span class="eyebrow">${s.status==='preview'?'Upcoming':'Live suggestions · updated for '+esc(s.as_of)}</span><h2>${s.remaining_goal===0?'Your private reading goal is met':'A path through your books'}</h2><p class="small">${s.completed} genuinely completed eligible books · ${s.remaining_goal} more toward your private ${s.private_goal}-book goal. ${s.status==='preview'?'Suggestions are not reading records.':''} Every date is adjustable and entirely optional.</p>`;
  // The workload estimate deliberately excludes the two independently paced classics.
  stats.innerHTML=`<div class="mini-stat"><small>Remaining planned workload</small><strong>${fmtHours(s.estimated_total_hours)}</strong><span class="tiny muted">Estimates, not logged reading</span></div><div class="mini-stat"><small>Estimated weekly time</small><strong>${fmtHours(s.hours_per_week)}</strong><span class="tiny muted">Through Dec 31 · ${s.hours_per_week>20?'This is demanding; adjust your goal if needed.':'Compare with the time you actually have.'}</span></div><div class="mini-stat"><small>Suggested book slots</small><strong>${s.queue.length}</strong><span class="tiny muted">${s.unscheduled_count} optional extra books beyond goal</span></div>`;
  summary.insertAdjacentHTML('beforeend','<p class="small"><strong>Two separate daily slow reads:</strong> <i>War and Peace</i> and <i>Les Misérables</i> have their own chapter calendars and do not count toward the public 52-book or private 104-book completion totals. Their independent calendars run through December 31, 2027.</p>');
  if(s.remaining_goal===0){list.innerHTML='<p class="info-box">You have completed your private goal; feel free to read whatever you love without another finish-by suggestion.</p>';return;}
  if(!s.queue.length){list.innerHTML='<p class="info-box">No eligible unfinished books are currently available to schedule. Add an eligible book to your shelf to plan more reading.</p>';return;}
  const excludedCustom=customState().filter(b=>b.goodreads_eligible===true && !s.queue.some(q=>q.book_id===b.id) && rosewoodReader.state.progress?.[b.id]?.status!=='finished' && rosewoodReader.state.progress?.[b.id]?.status!=='dnf');
  const addCustom=excludedCustom.length?`<div class="card soft pacing-custom-priority"><strong>Reading one of your added books next?</strong><p class="small muted">Select it to put it at the front of your optional plan. Your existing reading order remains intact, and no book gets marked finished.</p><label class="field" for="pacing-custom-book-choice">Added eligible book</label><select id="pacing-custom-book-choice">${excludedCustom.map(b=>`<option value="${esc(b.id)}">${esc(b.title)} — ${esc(b.author)}</option>`).join('')}</select> <button class="btn small-btn" type="button" data-pace-prioritize-custom>Place at the front of my plan</button></div>`:'';
  const shown=showAllPacing?s.queue:s.queue.slice(0,16);
  list.innerHTML=addCustom+shown.map((q,i)=>`<article class="pace-entry" data-pacing-book="${esc(q.book_id)}"><span class="pace-index">${i+1}</span><div><strong>${esc(q.title)}</strong> <span class="tiny muted">· ${esc((catalogIndex.byId.get(q.book_id)||customState().find(b=>b.id===q.book_id))?.id.startsWith('rosewood-custom-')?'Suggested reading':readingKind(catalogIndex.byId.get(q.book_id)||customState().find(b=>b.id===q.book_id)))}</span><p class="small">Finish by ~ <strong>${esc(formatSoftDate(q.suggested_finish_by))}</strong> to stay on track${q.user_override?' · your saved preference':''}</p><p class="tiny muted">${fmtHours(q.remaining_hours)} suggested reading time · not a deadline</p><div class="pace-actions"><button class="btn small-btn" type="button" data-pace-move="${esc(q.book_id)}" data-direction="-1" ${i===0?'disabled':''} aria-label="Move ${esc(q.title)} earlier in your reading plan">Move earlier</button><button class="btn small-btn" type="button" data-pace-move="${esc(q.book_id)}" data-direction="1" ${i===s.queue.length-1?'disabled':''} aria-label="Move ${esc(q.title)} later in your reading plan">Move later</button><button class="btn small-btn" type="button" data-pace-date="${esc(q.book_id)}">Adjust date</button><button class="btn small-btn" type="button" data-book="${esc(q.book_id)}">Book profile</button></div></div></article>`).join('')+(s.queue.length>16?`<button class="btn" type="button" data-pace-show-all="true">${showAllPacing?'Show fewer books':'Show all '+s.queue.length+' suggestions'}</button>`:'');
 }
 async function prioritizeCustomBook(){
  if(!rosewoodReader||rosewoodBusy)return;
  const id=document.getElementById('pacing-custom-book-choice')?.value;
  const book=customState().find(b=>b.id===id&&b.goodreads_eligible===true);
  if(!book)return;
  const existing=rosewoodReader.state.overrides.reading_order_ids;
  rosewoodBusy=true;
  try{
   await window.RosewoodStorage.changePlanningOverrides(rosewoodReader,{reading_order_ids:[id,...existing.filter(x=>x!==id)]});
   updatePacing();refreshAchievements();renderLibrary();renderUpcomingCards();
  }catch(e){document.getElementById('pacing-live-summary').insertAdjacentHTML('beforeend',`<p role="alert">Priority was not saved: ${esc(e.message)}</p>`);}
  finally{rosewoodBusy=false;}
 }
 async function movePacingBook(id,direction){
  if(!rosewoodReader||rosewoodBusy||!pacingSummary||![-1,1].includes(direction))return;
  const ids=pacingSummary.queue.map(x=>x.book_id),index=ids.indexOf(id),dest=index+direction;
  if(index<0||dest<0||dest>=ids.length)return;
  [ids[index],ids[dest]]=[ids[dest],ids[index]];
  // Manual order is always the reader's choice, including series installments.
  // The daily slow reads are anchored by RosewoodQueue.fullOrder.
  // New priorities always precede the stable default catalog; no automatic catalog mutation.
  const extras=[...books.map(x=>x.id),...customState().map(x=>x.id)].filter(x=>!ids.includes(x));
  rosewoodBusy=true;
  try{await window.RosewoodStorage.changePlanningOverrides(rosewoodReader,{reading_order_ids:[...ids,...extras]});updatePacing();renderLibrary();renderUpcomingCards();}
  catch(e){document.getElementById('pacing-live-summary').insertAdjacentHTML('beforeend',`<p role="alert">Could not save reading priority: ${esc(e.message)}. Original order retained.</p>`);}
  finally{rosewoodBusy=false;}
 }
 function showSoftDateEditor(id){if(!rosewoodReader||rosewoodBusy)return;
  const item=pacingSummary?.queue.find(x=>x.book_id===id);if(!item)return;
  if(dialog.open&&!canLeaveProfile())return;
  showDialog(`<div class="dialog-head"><div><span class="eyebrow">Gentle 2027 finish-by preference</span><h2>${esc(item.title)}</h2></div>${closeButton}</div><p>This changes only your optional suggestion, not an actual deadline, book order, status or goal.</p><form id="rosewood-soft-date-form" data-book-id="${esc(id)}"><div class="field"><label for="chosen-soft-date">My approximate finish-by date</label><input id="chosen-soft-date" type="date" name="softdate" min="2027-01-01" max="2027-12-31" required value="${esc(item.suggested_finish_by)}"></div><label class="custom-checkbox-label"><input type="checkbox" name="reset"> Restore automatically suggested date instead</label><p id="soft-date-save-status" role="status" aria-live="polite"></p><div class="cluster"><button class="btn primary" type="submit">Save my preference</button><button class="btn" type="button" data-close>Cancel</button></div></form>`);
 }
 async function saveSoftDate(form){
  if(!rosewoodReader||rosewoodBusy)return;
  const id=form.dataset.bookId,date=form.elements.softdate.value,reset=form.elements.reset.checked;
  const status=form.querySelector('#soft-date-save-status');
  if(!reset&&(!window.RosewoodPacing.validDate(date)||date<'2027-01-01'||date>'2027-12-31')){status.textContent='Choose a valid date in 2027.';return;}
  rosewoodBusy=true;
  try{await window.RosewoodStorage.changePlanningOverrides(rosewoodReader,{user_soft_dates:{[id]:reset?null:date}});closeDialog();updatePacing();renderLibrary();renderUpcomingCards();}
  catch(e){status.textContent='Save failed: '+e.message+' The previous preference was retained.';}
  finally{rosewoodBusy=false;}
 }
 document.addEventListener('click',e=>{const route=e.target.closest('[data-route]');if(route){e.preventDefault();openRoute(route.dataset.route);return;}const close=e.target.closest('[data-close]');if(close){closeDialog();return;}
  const quick=e.target.closest('[data-slow-open]');if(quick){selectedSlow=quick.dataset.slowOpen;selectedSlowDate=homeSlowDate();document.querySelectorAll('[data-slow-book]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.slowBook===selectedSlow)));openRoute('slowreads');return;}
  const all=e.target.closest('[data-series-all]');if(all){saveSeriesChoice(Object.fromEntries(seriesReview.map(s=>[s.id,all.dataset.seriesAll==='yes'])));return;}
  const one=e.target.closest('[data-series-choice]');if(one){saveSeriesChoice({[one.dataset.seriesChoice]:one.dataset.choice==='yes'});return;}
  const rn=e.target.closest('[data-research-new]');if(rn){showResearchEditor();return;}
  const fn=e.target.closest('[data-favorite-new]');if(fn){showFavoriteEditor();return;}
  const re=e.target.closest('[data-research-edit]');if(re){showResearchEditor(re.dataset.researchEdit);return;}
  const fe=e.target.closest('[data-favorite-edit]');if(fe){showFavoriteEditor(fe.dataset.favoriteEdit);return;}
  const rd=e.target.closest('[data-research-delete]');if(rd){showResearchDelete('research_entries',rd.dataset.researchDelete);return;}
  const fd=e.target.closest('[data-favorite-delete]');if(fd){showResearchDelete('reader_favorites',fd.dataset.favoriteDelete);return;}
  const rb=e.target.closest('[data-research-from]');if(rb){showResearchEditor('',rb.dataset.researchFrom);return;}
  const fb=e.target.closest('[data-favorite-from]');if(fb){showFavoriteEditor('',fb.dataset.favoriteFrom);return;}
  const jumpNotes=e.target.closest('[data-scroll-reader-notes]');if(jumpNotes){const form=dialog.querySelector('#reader-notes-form');if(form){form.scrollIntoView({behavior:'smooth',block:'start'});form.querySelector('textarea[name=personal]')?.focus({preventScroll:true});}return;}
  const edit=e.target.closest('[data-edit-custom]');if(edit){showAddBook(edit.dataset.editCustom);return;}
  const del=e.target.closest('[data-delete-custom]');if(del){confirmDeleteCustom(del.dataset.deleteCustom);return;}
  const reallyDelete=e.target.closest('[data-confirm-delete]');if(reallyDelete){if(document.getElementById('delete-ack')?.checked)deleteCustom(reallyDelete.dataset.confirmDelete);return;}
  const clear=e.target.closest('[data-clear-progress]');if(clear){clearReadingRecord(clear.dataset.clearProgress);return;}
  const prioritize=e.target.closest('[data-pace-prioritize-custom]');if(prioritize){prioritizeCustomBook();return;}
  const move=e.target.closest('[data-pace-move]');if(move){movePacingBook(move.dataset.paceMove,Number(move.dataset.direction));return;}
  const adjust=e.target.closest('[data-pace-date]');if(adjust){showSoftDateEditor(adjust.dataset.paceDate);return;}
  const showAll=e.target.closest('[data-pace-show-all]');if(showAll){showAllPacing=!showAllPacing;renderPacingView();return;}
  const picked=e.target.closest('[data-queue-pick]');if(picked){queuePick(picked.dataset.queuePick);return;}
  const qswap=e.target.closest('[data-queue-swap]');if(qswap){queueSwap(qswap.dataset.queueSwap);return;}
  if(e.target.closest('[data-queue-shuffle]')){queueShuffle();return;}
  if(e.target.closest('[data-queue-reset]')){queueReset();return;}
  if(e.target.closest('[data-queue-confirm-reset]')){if(!rosewoodReader||rosewoodBusy)return;closeDialog();saveQueueOrder([],'Default suggested order restored.');return;}
  if(e.target.closest('[data-queue-import]')){openRoute('library');document.getElementById('goodreads-open-file').focus();document.getElementById('goodreads-open-file').click();return;}
  const book=e.target.closest('[data-book]');if(book){showBook(book.dataset.book);return;}
  const trigger=e.target.closest('[data-open]');if(trigger){const type=trigger.dataset.open;if(type==='add-book'||type==='custom-book')showAddBook();if(type==='celebration')showCelebration();if(type==='prototype-notice')showNotice();}
 });
 document.addEventListener('submit',e=>{if(e.target.id==='custom-book-form'){e.preventDefault();submitCustomForm(e.target);}
  if(e.target.id==='research-editor'){e.preventDefault();saveResearchForm(e.target,false);}
  if(e.target.id==='favorite-editor'){e.preventDefault();saveResearchForm(e.target,true);}
  if(e.target.id==='reader-notes-form'){e.preventDefault();saveReaderNotes(e.target);}
  if(e.target.id==='reader-progress-form'){e.preventDefault();saveReadingRecord(e.target);}
  if(e.target.id==='rosewood-soft-date-form'){e.preventDefault();saveSoftDate(e.target);}});
 for(const field of ['research-query','research-kind','research-book','research-tag'])document.getElementById(field).addEventListener(field==='research-query'?'input':'change',renderResearch);
 document.addEventListener('input',e=>{if(e.target.closest('#reader-progress-form')){const f=e.target.closest('#reader-progress-form');f.dataset.dirty='true';const s=f.querySelector('#reader-progress-status');if(s){s.textContent='Unsaved reading-record changes.';s.dataset.state='editing';}}if(e.target.closest('#reader-notes-form')){const form=e.target.closest('#reader-notes-form');form.dataset.dirty='true';const status=form.querySelector('#reader-notes-status');if(status){status.textContent='Unsaved changes — choose Save my notes.';status.dataset.state='editing';}}});
 function refreshProgressCards(){
  liveProgress={...(rosewoodReader?.state?.progress||{})};
  if(rosewoodReader){
   currentGoalSummary=window.RosewoodGoals.aggregate(rosewoodReader.state,books,2027);
   const s=currentGoalSummary;
   document.getElementById('overview-goals').innerHTML=goalCard(s.count,'rose',s.public.goal,'Public milestone',s.public.percentage)+goalCard(s.count,'sage',s.private.goal,'Private goal',s.private.percentage);
   goalLive.textContent=`${s.count} distinct Goodreads-eligible books finished in 2027: ${s.plannedCount} planned and ${s.customCount} added. ${s.public.remaining} to the public milestone; ${s.private.remaining} to the private goal. No Goodreads account sync.`;
   goalLive.dataset.state='saved';
  }else{
   currentGoalSummary=null;
   document.getElementById('overview-goals').innerHTML=goalCard('—','rose',52,'Public milestone')+goalCard('—','sage',104,'Private goal');
   goalLive.textContent='Saved data unavailable; goal counts cannot be calculated. No data has been assumed or reset.';
   goalLive.dataset.state='error';
  }
  updatePacing();refreshAchievements();renderLibrary();renderUpcomingCards();
  renderReadingReview();
 }
 function showSavedCompletion(bookId){
  // Only call following a committed new "finished" event; no counter/award writes.
  const b=catalogIndex.byId.get(bookId)||customState().find(x=>x.id===bookId);
  if(!b)return;
  document.getElementById('rosewood-finished-notice')?.remove();
  const aside=document.createElement('aside');aside.id='rosewood-finished-notice';
  aside.className='real-completion-popup';aside.setAttribute('role','status');aside.setAttribute('aria-live','polite');aside.setAttribute('aria-label','Book completion celebration');
  const counted=!!currentGoalSummary?.completedIds.includes(bookId);
  aside.innerHTML=`<img src="assets/celebration.svg" alt="An open book with roses and golden sparkles" width="106" height="78"><div><strong>You finished this book!</strong><p>${esc(b.title)} · ${counted?`${currentGoalSummary.count} of ${currentGoalSummary.private.goal} books toward your private 2027 goal`:'Recorded in your reading history; not counted in your 2027 eligible-book goals'}</p><small>Another story has found a home in your library. Awards are granted only from verifiable evidence.</small></div><button class="btn small-btn" type="button" aria-label="Dismiss book celebration">Close</button>`;
  aside.querySelector('button').addEventListener('click',()=>aside.remove());
  (dialog.open?dialog:document.body).appendChild(aside);
 }
 async function saveReadingRecord(form){
  const status=form.querySelector('#reader-progress-status'),button=form.querySelector('button[type="submit"]');
  if(!rosewoodReader||rosewoodBusy){status.textContent='Storage unavailable or another save is active. Nothing was saved.';status.dataset.state='error';return;}
  const id=form.dataset.bookId,book=customState().find(b=>b.id===id),eligible=book?book.goodreads_eligible:true;
  const v=name=>form.elements[name].value;
  const nullableNumber=name=>v(name)===''?null:Number(v(name));
  const record={status:v('status'),percent:Number(v('percent')),started_at:v('started_at')||null,finished_at:v('finished_at')||null,pages_read:nullableNumber('pages_read'),audio_minutes_elapsed_1x:nullableNumber('audio_minutes_elapsed_1x'),method:v('method'),rating_quarter_stars:nullableNumber('rating_quarter_stars'),notes:v('notes'),review:v('review'),goodreads_eligible:eligible,is_reread:form.elements['is_reread'].checked,reread_allowed:form.elements['reread_allowed'].checked};
  button.disabled=true;rosewoodBusy=true;status.textContent='Saving actual reading progress…';status.dataset.state='saving';
  try{
   const previousEvents=new Set(rosewoodReader.state.event_history.map(e=>e.id));
   const saved=await window.RosewoodStorage.changeBookProgress(rosewoodReader,id,'save',record,{confirmedCompletion:form.elements['confirm_finished'].checked,confirmedReopen:form.elements['confirm_reopen'].checked});
   // A new committed event is authoritative across two open reader handles,
   // unlike a stale previous-status snapshot or repeated click.
   const realNewFinish=rosewoodReader.state.event_history.some(ev=>ev.type==='finished'&&ev.item_id===id&&!previousEvents.has(ev.id));
   form.dataset.dirty='false';form.dataset.savedStatus=saved.status;refreshProgressCards();status.dataset.state='saved';status.textContent=`✓ ${saved.status==='finished'?'Finished book recorded':'Reading record saved'} on this device. 2027 goal totals and earned awards recalculated; The reading review uses only saved completions.`;
   form.querySelector('[data-clear-progress]').disabled=false;
   // Do not cover an actual earned-award celebration with the generic finished-book toast.
   const newAward=rosewoodReader.state.event_history.some(ev=>ev.type==='unlocked'&&!previousEvents.has(ev.id));
   if(realNewFinish&&!newAward)showSavedCompletion(id);
  }catch(e){status.dataset.state='error';status.textContent='Save failed: '+e.message+' Previous saved record retained.';}
  finally{button.disabled=false;rosewoodBusy=false;}
 }
 async function clearReadingRecord(id){
  if(!rosewoodReader||rosewoodBusy)return;
  if(!confirm('Clear this book’s reading status, dates, rating and review? Your separate private notes will remain.'))return;
  const form=dialog.querySelector('#reader-progress-form'),status=form?.querySelector('#reader-progress-status');if(!form||form.dataset.bookId!==id)return;
  rosewoodBusy=true;
  try{await window.RosewoodStorage.changeBookProgress(rosewoodReader,id,'clear',null,{confirmedClear:true});form.dataset.dirty='false';refreshProgressCards();showBook(id);}
  catch(e){if(status){status.textContent='Clear failed: '+e.message;status.dataset.state='error';}}
  finally{rosewoodBusy=false;}
 }
 async function saveReaderNotes(form){
  if(!rosewoodReader){form.querySelector('#reader-notes-status').textContent='Storage unavailable. No notes were saved.';return;}
  const id=form.dataset.bookId,status=form.querySelector('#reader-notes-status'),button=form.querySelector('button[type=submit]');
  if(button.disabled)return;
  const values=Object.fromEntries(['personal','research','spoilers'].map(k=>[k,form.elements[k].value]));
  button.disabled=true;status.textContent='Saving your private notes…';status.dataset.state='saving';
  try{const result=await window.RosewoodStorage.changeBookNotes(rosewoodReader,id,values);refreshAchievements();
   form.dataset.dirty='false';status.dataset.state='saved';status.textContent=result?'✓ Notes saved on this device.':'✓ Empty notes cleared on this device.';
  }catch(err){status.dataset.state='error';status.textContent='Save failed: '+err.message+' Your previous notes were retained.';}
  finally{button.disabled=false;}
 }
 // COVER ENGINE — Progressive online requests, strict normalized title + author match.
 // Online imagery is optional; neutral fallbacks keep this file fully viewable offline.
 const coverIds=new Map(),bookById=catalogIndex.byId;
 const coverCandidates=JSON.parse(document.getElementById('brosia-public-cover-candidates').textContent).covers;
 let observer=null,queue=[],inFlight=0,requested=new Set();
 const delay=(ms)=>new Promise(resolve=>setTimeout(resolve,ms));
 // Image.load validates actual image bytes/dimensions without ever exposing private records.
 function imageAvailable(url,timeout=7000){return new Promise(resolve=>{
  const image=new Image();let settled=false;
  const finish=good=>{if(settled)return;settled=true;clearTimeout(timer);image.onload=null;image.onerror=null;resolve(good);};
  const timer=setTimeout(()=>finish(false),timeout);
  image.onload=()=>finish(image.naturalWidth>=40&&image.naturalHeight>=60);
  image.onerror=()=>finish(false);
  image.referrerPolicy='no-referrer';image.src=url;
 });}
 function matchGoogleBooks(book,data){
  if(!Array.isArray(data?.items))return null;
  const norm=t=>window.RosewoodCatalog.normalize(t||'');
  const requestedTitle=norm(book.title).replace(/^the /,'');
  const normalizeAuthor=t=>norm(t).replace(/dostoyevsky|dostoyevskiy|dostoevskiy/g,'dostoevsky');
  const firstAuthor=normalizeAuthor(book.author.split(/\s+and\s+|\s*&\s*|,/i)[0]);
  const firstWords=firstAuthor.split(' ').filter(Boolean),surname=firstWords.at(-1);
  for(const entry of data.items){
   const info=entry.volumeInfo;if(!info||!Array.isArray(info.authors))continue;
   const seenTitle=norm(info.title).replace(/^the /,'');
   if(seenTitle!==requestedTitle&&!seenTitle.startsWith(requestedTitle+':')&&!seenTitle.startsWith(requestedTitle+' '))continue;
   if(!info.authors.some(a=>{const v=normalizeAuthor(a).split(' ');return v.includes(surname)&&v.includes(firstWords[0]);}))continue;
   const raw=info.imageLinks?.large||info.imageLinks?.medium||info.imageLinks?.small||info.imageLinks?.thumbnail;
   if(typeof raw!=='string')continue;
   try{
    const u=new URL(raw.replace(/^http:\/\//,'https://'));
    if(u.protocol!=='https:'||!['books.google.com','books.googleusercontent.com','books.google.co.uk'].includes(u.hostname))continue;
    return {status:'work_matched_edition_unverified',provider:'Google Books',cover_url:u.href,edition_verified:false,match_method:'matched_book_title_author'};
   }catch(_){}
  }
  return null;
 }
 async function jsonWithTimeout(url){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),9500);
  try{const response=await fetch(url,{signal:controller.signal,referrerPolicy:'no-referrer'});if(!response.ok)throw Error('Public catalog unavailable');return await response.json();}
  finally{clearTimeout(timer);}
 }
 async function fetchCover(book){
  // Priority: independently cited ISBN example -> work-level Open Library -> Google Books.
  // Neither the ISBN nor a public search establishes the user's exact edition.
  for(const isbn of coverCandidates[book.id]||[]){
   const url=`https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg?default=false`;
   if(await imageAvailable(url,6500))return {status:'work_matched_edition_unverified',provider:'Open Library ISBN example',cover_url:url,edition_verified:false,match_method:'bibliographic_source_isbn'};
  }
  try{
   const matched=window.RosewoodCatalog.matchOpenLibrary(book,await jsonWithTimeout(window.RosewoodCatalog.coverLookupURL(book)));
   if(matched&&await imageAvailable(matched.cover_url,6500))return matched;
  }catch(_){}
  try{
   const query=new URL('https://www.googleapis.com/books/v1/volumes');
   query.searchParams.set('q',`intitle:${book.title} inauthor:${book.author.split(/\s+and\s+|\s*&\s*|,/i)[0]}`);
   query.searchParams.set('maxResults','12');query.searchParams.set('projection','lite');query.searchParams.set('printType','books');
   const matched=matchGoogleBooks(book,await jsonWithTimeout(query.href));
   if(matched&&await imageAvailable(matched.cover_url,6500))return matched;
  }catch(_){}
  return {status:'no_match',provider:'Public catalogs'};
 }
 const coverLabel=result=>result?.status==='work_matched_edition_unverified'?`Published cover`: 'Library cover';
 function updateCover(bookId,result){
  for(const box of document.querySelectorAll(`[data-cover-id="${bookId}"]`)){
   const label=box.closest('.book-card')?.querySelector(`[data-source-label="${bookId}"]`);
   if(label)label.textContent=coverLabel(result);
   box.dataset.coverStatus=result?.status||'pending';
   if(result?.status!=='work_matched_edition_unverified'||!result.cover_url){box.querySelector('img.book-published-cover')?.remove();box.setAttribute('aria-label','Book cover');continue;}
   if(box.querySelector('img.book-published-cover'))continue;
   const img=document.createElement('img');img.className='book-published-cover';img.alt=`Published cover for ${bookById.get(bookId).title}`;
   img.loading='lazy';img.referrerPolicy='no-referrer';
   img.addEventListener('load',()=>box.setAttribute('aria-label','Published cover'));
   img.addEventListener('error',()=>{img.remove();box.dataset.coverStatus='image_failed';box.setAttribute('aria-label','Library cover');if(label)label.textContent='Library cover';});
   img.src=result.cover_url;box.appendChild(img);
  }
 }
 async function processCoverQueue(){
  while(inFlight<2&&queue.length){
   const id=queue.shift(),book=bookById.get(id);if(!book)continue;
   inFlight++;
   (async()=>{
    const result=await fetchCover(book);coverIds.set(id,result);updateCover(id,result);updateBulkCoverStatus();
   })().finally(async()=>{inFlight--;await delay(350);processCoverQueue();});
  }
 }
 const priorityCoverIds=["rosewood-2027-007", "rosewood-2027-016", "rosewood-2027-018", "rosewood-2027-019", "rosewood-2027-023", "rosewood-2027-039", "rosewood-2027-055", "rosewood-2027-056", "rosewood-2027-059", "rosewood-2027-062", "rosewood-2027-064", "rosewood-2027-066", "rosewood-2027-067", "rosewood-2027-071", "rosewood-2027-072", "rosewood-2027-086", "rosewood-2027-087", "rosewood-2027-088", "rosewood-2027-089", "rosewood-2027-091", "rosewood-2027-092", "rosewood-2027-093", "rosewood-2027-094", "rosewood-2027-096", "rosewood-2027-097", "rosewood-2027-098", "rosewood-2027-099", "rosewood-2027-100", "rosewood-2027-101", "rosewood-2027-102", "rosewood-2027-104", "rosewood-2027-105", "rosewood-2027-106", "rosewood-revised-2027-042", "rosewood-revised-2027-053", "rosewood-revised-2027-063", "rosewood-revised-2027-069", "rosewood-revised-2027-074", "rosewood-revised-2027-090", "rosewood-revised-2027-095", "rosewood-revised-2027-103"];
 let priorityCoverRequested=false;
 function prioritizeMissingCovers(){return;

  if(priorityCoverRequested||navigator.onLine===false)return;
  priorityCoverRequested=true;
  for(const id of priorityCoverIds)if(bookById.has(id))beginCover(id);
 }
 function beginCover(id){return; // covers are bundled; no live lookups

  if(coverIds.has(id)){updateCover(id,coverIds.get(id));return;}
  if(requested.has(id))return;
  requested.add(id);queue.push(id);processCoverQueue();
 }
 // Optional published-cover refresh. No saved reading data is touched.
 const bulkCoverButton=document.getElementById('cover-refresh-all');
 const bulkCoverStatus=document.getElementById('cover-batch-status');
 let bulkCoverRunning=false;
 function updateBulkCoverStatus(){
  if(!bulkCoverStatus)return;
  const results=books.map(b=>coverIds.get(b.id));
  const checked=results.filter(Boolean).length;
  bulkCoverStatus.textContent=checked>=106?'Cover check finished. Every book has a cover.':`Checking book covers: ${checked} of 106.`;
  if(bulkCoverRunning&&checked===106){
   bulkCoverRunning=false;if(bulkCoverButton)bulkCoverButton.disabled=false;
  }
 }
 bulkCoverButton?.addEventListener('click',()=>{
  if(bulkCoverRunning)return;
  bulkCoverRunning=true;bulkCoverButton.disabled=true;
  if(navigator.onLine===false){
   bulkCoverStatus.textContent='All 106 library covers are available offline.';
   bulkCoverRunning=false;bulkCoverButton.disabled=false;return;
  }
  // Retry previous unavailable/unmatched results, but retain confirmed matches.
  for(const book of books){
   const id=book.id,known=coverIds.get(id);
   if(known?.status==='work_matched_edition_unverified')continue;
   coverIds.delete(id);requested.delete(id);
   beginCover(id);
  }
  updateBulkCoverStatus();
 });
 function observeCovers(){
  if(observer)observer.disconnect();const elems=[...document.querySelectorAll('.book-cover')];
  if('IntersectionObserver' in window){
   observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){beginCover(entry.target.dataset.coverId);observer.unobserve(entry.target);}}, {rootMargin:'120px 0px'});
   for(const el of elems){const result=coverIds.get(el.dataset.coverId);if(result)updateCover(el.dataset.coverId,result);else observer.observe(el);}
  }else{for(const el of elems.slice(0,6))beginCover(el.dataset.coverId);}
 }

 // Parallel, date-addressable reading room. Full schedule is bundled offline;
 // source URLs are clickable only on explicit user action; chapter flags save in Rosewood.
 const slowRoot=document.getElementById('slow-read-root');
 let selectedSlow='war-and-peace';
 const localIso=()=>{const n=new Date();return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`;};
 const homeSlowDate=()=>{const d=localIso();return d>='2027-01-01'&&d<='2027-12-31'?d:'2027-01-01';};
 let selectedSlowDate=homeSlowDate();
 let slowWriteBusy=false;
 function renderHomeRitual(){
  const target=document.getElementById('slow-ritual-home');if(!target)return;
  const date=homeSlowDate(), saved=rosewoodReader?.state?.overrides?.slow_reads||{};
  target.innerHTML=[['war-and-peace','Morning','War and Peace','Maude · Oxford Mandelker'],['les-miserables','Evening','Les Misérables','Unabridged Hapgood']].map(([key,when,title,edition])=>{
   const e=slowTracks[key].byDate.get(date);const complete=new Set(saved[key]||[]).has(date);const progress=window.RosewoodSlowReads.progress(saved,slowTracks)[key];
   const bookId=slowTracks[key].book_id;const exact=rosewoodReader?.state?.overrides?.edition_overrides?.[bookId]?.slow_read_percent;
   const pct=typeof exact==='number'?exact:progress.percentage;
   const chapter=e.rest_day?'A rest day — no chapter scheduled':esc(e.label||e.english_hapgood_title);
   return `<article class="ritual-entry" data-state="${e.rest_day?'rest':complete?'done':'open'}"><p class="ritual-when">${when}</p><div class="ritual-body"><h3>${esc(title)}</h3><p class="ritual-chapter">${chapter}</p><div class="meter" aria-hidden="true"><span style="width:${Math.min(100,Math.max(0,pct)).toFixed(1)}%"></span></div><p class="ritual-meta">${progress.completed} of ${progress.total} chapters${complete?' · today’s is done':''} <span class="ritual-edition">${esc(edition)}</span></p></div><button type="button" class="btn ${complete||e.rest_day?'':'primary'} small-btn" data-slow-open="${key}">${complete?'Review':e.rest_day?'View':'Read'}</button></article>`;
  }).join('');
 }
 function renderSlowReads(message=''){
  if(!slowRoot)return;
  const track=slowTracks[selectedSlow],saved=rosewoodReader?.state?.overrides?.slow_reads||{},
   completed=new Set(saved[selectedSlow]||[]),stats=window.RosewoodSlowReads.progress(saved,slowTracks)[selectedSlow];
  const exact=rosewoodReader?.state?.overrides?.edition_overrides?.[track.book_id]?.slow_read_percent;
  const actualPercent=typeof exact==='number'?exact:stats.percentage;
  const selected=track.byDate.get(selectedSlowDate)||track.entries[0];
  const month=selected.date.slice(0,7),months=[...new Set(track.entries.map(e=>e.date.slice(0,7)))];
  const days=track.entries.filter(e=>e.date.startsWith(month));
  const links=(u,label)=>u&&/^https:\/\//.test(u)?`<a class="slow-link" href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>`:'';
  const marker=stats.completed===0?'No saved chapters yet':`${stats.completed} of ${stats.total} chapter days saved`;
  const intro=selectedSlow==='war-and-peace'?
   'MORNING READING · Oxford World’s Classics, Louise and Aylmer Maude, edited by Amy Mandelker. Follow Simon Haisell’s 361-chapter calendar and four scheduled breaks. Some online Maude chapter divisions differ.':
   'EVENING READING · Unabridged Isabel F. Hapgood. All 365 chapter titles and the 2025 reader commentary come from your uploaded PDFs. The commentary can contain spoilers.';
  const chapter=selected.rest_day?'Rest/catch-up day': selectedSlow==='war-and-peace'?selected.label:
   [selected.french_volume,selected.french_book,selected.english_hapgood_title].filter(Boolean).join(' · ');
  const detail=selectedSlow==='war-and-peace'?`${selected.edition_note?`<p class="small">${esc(selected.edition_note)}</p>`:''}
   <div class="slow-resources">${links(selected.daily_discussion_thread_url,'Open this chapter’s Chat thread')}
   
   ${links(selected.source_day_deep_link||selected.schedule_url,'Find this date’s chapter-chat link in the schedule')}
   ${links(selected.book_guide_url,'Weekly essays, audio and book guide')}
   ${links('https://books.google.com/books?id=M3nkuBw5pdQC','Oxford World’s Classics Maude edition')}
   ${links('https://footnotesandtangents.substack.com/p/2026-war-and-peace-invite','Welcome pack')}</div>`:
   `${selected.french_title?`<p><strong>Original French:</strong> ${esc(selected.french_title)}</p>`:''}
   ${selected.english_hapgood_title?`<p><strong>Hapgood English:</strong> ${esc(selected.english_hapgood_title)}</p>`:''}
   ${selected.french_volume||selected.french_book?`<p class="small">${selected.french_volume?`<strong>Part:</strong> ${esc(selected.french_volume)}`:''}${selected.french_volume&&selected.french_book?' · ':''}${selected.french_book?`<strong>Book:</strong> ${esc(selected.french_book)}`:''}</p>`:''}
   ${selected.companion_episode?`<p class="small"><strong>Companion episode:</strong> ${esc(selected.companion_episode)}</p>`:''}
   <div class="slow-resources">${links(selected.reading_companion_schedule,'Original Reading Companion schedule')}
   ${links(selected.companion_episode_url,'Listen to the Reading Companion podcast')}
   ${links(selected.companion_transcripts_url,'Companion transcripts')}
   ${links(selected.reading_text_url,'Read the public-domain Hapgood text (Gutenberg)')}</div>
   ${selected.commentary_2025?`<details class="slow-commentary"><summary>Read Briana Lewis’s 2025 chapter commentary · spoilers</summary>
   ${selected.commentary_pdf_pages?.length?`<p class="small">Source PDF pages ${esc(selected.commentary_pdf_pages.join(', '))}</p>`:''}
   <div class="slow-commentary-text">${esc(selected.commentary_2025)}</div></details>`:''}`;
  slowRoot.innerHTML=`<div class="card soft slow-summary"><div class="spread wrap"><div><h2>${esc(track.title)}</h2><p class="small">${esc(intro)}</p></div><span class="pill sage">${stats.completed} / ${stats.total} chapters</span></div>
   <div class="arc-progress-track" role="progressbar" aria-label="Saved slow-reading chapter days" aria-valuemin="0" aria-valuemax="${stats.total}" aria-valuenow="${stats.completed}"><span style="width:${stats.percentage.toFixed(3)}%"></span></div>
   <p class="small"><strong>${actualPercent.toFixed(1)}% through the book</strong> ${typeof exact==='number'?'· saved book position':'· estimated from completed chapters'}</p>
   <p class="small muted">${stats.completed} of ${stats.total} chapters checked (${stats.percentage.toFixed(1)}% of chapters). Each chapter can have a different length.</p>
   <form id="slow-percent-form" class="slow-percent-form"><label class="field" for="slow-exact-percent"><span>Actual book percentage</span><input id="slow-exact-percent" name="percent" type="number" min="0" max="100" step="0.1" value="${typeof exact==='number'?exact:''}" placeholder="0–100" ${!rosewoodReader||slowWriteBusy?'disabled':''}></label><button type="submit" class="btn small-btn" ${!rosewoodReader||slowWriteBusy?'disabled':''}>Save percentage</button><button type="button" class="btn small-btn ghost" data-slow-percent-reset ${typeof exact==='number'&&rosewoodReader&&!slowWriteBusy?'':'hidden'}>Use chapter progress</button></form>
   <p class="small muted" id="slow-percent-save-status" role="status" aria-live="polite"></p></div>
   <div class="card slow-calendar"><div class="spread wrap"><div><label for="slow-month-picker"><strong>Explore by month</strong></label><select id="slow-month-picker">${months.map(m=>`<option value="${m}" ${month===m?'selected':''}>${esc(new Date(m+'-15T12:00:00').toLocaleDateString('en-US',{month:'long',year:'numeric'}))}</option>`).join('')}</select></div>
   <div><label for="slow-date-picker"><strong>Go to a chapter</strong></label><input type="date" id="slow-date-picker" min="2027-01-01" max="2027-12-31" value="${selected.date}"></div></div>
   <div class="slow-month-grid" aria-label="Chapters in selected month">${days.map(e=>`<button type="button" data-slow-date="${e.date}" aria-pressed="${e.date===selected.date}" title="${esc(e.label||'')}" class="${completed.has(e.date)?'slow-done':''} ${e.rest_day?'slow-rest':''}"><span>${Number(e.date.slice(-2))}</span><small>${e.rest_day?'Rest':completed.has(e.date)?'Read':'Chapter'}</small></button>`).join('')}</div></div>
   <article class="card slow-day" data-day="${selected.date}"><div class="spread wrap"><div><span class="eyebrow">${esc(new Date(selected.date+'T12:00:00').toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'}))}</span><h3>${esc(chapter)}</h3></div><span class="pill ${selected.rest_day?'gold':'rose'}">${selected.rest_day?'Rest day':completed.has(selected.date)?'Chapter recorded':'Chapter to read'}</span></div>
   ${detail}
   ${selected.rest_day?'<p class="small muted">No chapter completion is expected on this scheduled reflection day.</p>':`<button type="button" class="btn primary" data-slow-toggle="${selected.date}" aria-label="${completed.has(selected.date)?'Undo reading this chapter':'Mark this chapter read'}" ${!rosewoodReader||slowWriteBusy?'disabled':''}>${completed.has(selected.date)?'Undo chapter checkmark':'Mark this chapter read'}</button>`}
   <p class="small muted" role="status" aria-live="polite" id="slow-save-status">${esc(message||(!rosewoodReader?'Device storage unavailable: checkmarks cannot be saved.':'Checkmarks save to your Rosewood device backup.'))}</p></article>`;
  // The actual day’s reading is the first actionable element, above optional month browsing.
  const dayCard=slowRoot.querySelector('.slow-day'), calendarCard=slowRoot.querySelector('.slow-calendar');
  if(dayCard&&calendarCard)calendarCard.before(dayCard);
 }
 document.querySelectorAll('[data-slow-book]').forEach(btn=>btn.addEventListener('click',()=>{
  selectedSlow=btn.dataset.slowBook;document.querySelectorAll('[data-slow-book]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.slowBook===selectedSlow)));renderSlowReads();
 }));
 async function saveExactSlowPercent(value){
  if(!rosewoodReader||slowWriteBusy)return;
  const status=document.getElementById('slow-percent-save-status');
  if(value!==null&&(!Number.isFinite(value)||value<0||value>100)){if(status)status.textContent='Enter a percentage from 0 to 100.';return;}
  slowWriteBusy=true;let feedback='';
  try{await window.RosewoodStorage.changeSlowReadPercent(rosewoodReader,selectedSlow,value);
   feedback=value===null?'Using the chapter checklist percentage.':'Book percentage saved on this device.';renderHomeRitual();}
  catch(err){feedback='Percentage not saved: '+err.message;}
  finally{slowWriteBusy=false;renderSlowReads(feedback);}
 }
 slowRoot.addEventListener('submit',e=>{
  if(e.target.id!=='slow-percent-form')return;e.preventDefault();
  const field=e.target.elements.percent;
  if(!field.value.trim()){document.getElementById('slow-percent-save-status').textContent='Enter a percentage or choose Use chapter progress.';return;}
  saveExactSlowPercent(Number(field.value));
 });
 slowRoot.addEventListener('click',async e=>{
  const btn=e.target.closest('button');if(!btn)return;
  if(btn.hasAttribute('data-slow-percent-reset')){saveExactSlowPercent(null);return;}
  if(btn.dataset.slowDate){selectedSlowDate=btn.dataset.slowDate;renderSlowReads();return;}
  const date=btn.dataset.slowToggle;if(!date||!rosewoodReader||slowWriteBusy)return;
  const saved=new Set(rosewoodReader.state.overrides?.slow_reads?.[selectedSlow]||[]);
  slowWriteBusy=true;btn.disabled=true;let feedback='';
  try{await window.RosewoodStorage.changeSlowReadChapter(rosewoodReader,selectedSlow,date,!saved.has(date));feedback='Chapter checkmark saved on this device.';refreshAchievements(false);}
  catch(err){feedback='Chapter checkmark NOT saved: '+err.message;}
  finally{slowWriteBusy=false;renderSlowReads(feedback);renderHomeRitual();}
 });
 slowRoot.addEventListener('change',e=>{
  if(e.target.id==='slow-date-picker'){
   if(slowTracks[selectedSlow].byDate.has(e.target.value)){selectedSlowDate=e.target.value;renderSlowReads();}
  }else if(e.target.id==='slow-month-picker'){
   selectedSlowDate=e.target.value+'-01';renderSlowReads();
  }
 });
 // Independently saved Rosewood preferences and backups; reading goals now aggregate committed progress.

 const storageStatus=(message,state)=>{const el=document.getElementById('rosewood-storage-status');if(el){el.textContent=message;el.dataset.state=state||'info';}};
 const storageControls=['preview-pages','preview-audio-speed','saved-pacing-messages'];
 function toggleStorageReady(ready){for(const id of [...storageControls,'rosewood-backup-export','rosewood-backup-import']){const el=document.getElementById(id);if(el)el.disabled=!ready;}}
 function applyPreferences(settings){document.getElementById('preview-pages').value=String(settings.pages_per_hour);document.getElementById('preview-audio-speed').value=String(settings.playback_speed);document.getElementById('saved-pacing-messages').checked=settings.pacing_messages;}
 async function initRosewoodStorage(){
  toggleStorageReady(false);storageStatus('Opening private device storage…','checking');
  try{rosewoodReader=await window.RosewoodStorage.openReader(books,awards,catalogIndex.arcs,originalBooks.map(b=>b.id));applyPreferences(rosewoodReader.state.settings);toggleStorageReady(true);storageStatus('✓ Preferences and saved books and reading records loaded from this device.','saved');refreshProgressCards();renderCustomShelf();renderResearch();renderSlowReads();renderHomeRitual();
   window.BrosiaSync.attach(rosewoodReader,window.RosewoodStorage,state=>{applyPreferences(state.settings);refreshProgressCards();renderCustomShelf();renderResearch();renderSlowReads();renderHomeRitual();});}
  catch(e){rosewoodReader=null;storageStatus('Storage unavailable: '+e.message+' No preference changes were saved.','error');toggleStorageReady(false);refreshProgressCards();renderCustomShelf();renderSlowReads();renderHomeRitual();}
 }
 async function saveSettings(patch){
  if(!rosewoodReader||rosewoodBusy)return;
  rosewoodBusy=true;toggleStorageReady(false);storageStatus('Saving preferences to this device…','saving');
  try{const s=await window.RosewoodStorage.changeSettings(rosewoodReader,patch);applyPreferences(s.settings);updatePacing();renderLibrary();renderUpcomingCards();storageStatus('✓ Saved locally · '+new Date(s.last_saved_at).toLocaleString(),'saved');}
  catch(e){storageStatus('Save failed: '+e.message+' Your change was not saved.','error');try{applyPreferences((await window.RosewoodStorage.readState(rosewoodReader)).settings);}catch(_){}}
  finally{rosewoodBusy=false;toggleStorageReady(!!rosewoodReader);}
 }
 document.getElementById('preview-pages').addEventListener('change',e=>{
  const n=Number(e.target.value);
  if(!Number.isFinite(n)||n<=0||n>1000){
   e.target.setAttribute('aria-invalid','true');e.target.setAttribute('aria-describedby','rosewood-storage-status');
   storageStatus('Enter a reading pace between 1 and 1,000 pages per hour.','error');return;
  }
  e.target.removeAttribute('aria-invalid');e.target.removeAttribute('aria-describedby');
  saveSettings({pages_per_hour:n});
 });
 document.getElementById('preview-audio-speed').addEventListener('change',e=>saveSettings({playback_speed:Number(e.target.value)}));
 document.getElementById('saved-pacing-messages').addEventListener('change',e=>saveSettings({pacing_messages:e.target.checked}));
 document.getElementById('storage-retry').addEventListener('click',()=>{if(rosewoodReader)rosewoodReader.db.close();initRosewoodStorage();});
 document.getElementById('rosewood-backup-export').addEventListener('click',async()=>{
  if(!rosewoodReader)return;storageStatus('Preparing verified library backup…','saving');
  try{
   const result=await window.RosewoodStorage.makeBackup(rosewoodReader),data=JSON.stringify(result,null,2)+'\n';
   const blob=new Blob([data],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
   a.href=url;a.download='Brosias_Library_backup_'+new Date().toISOString().slice(0,10)+'.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);
   storageStatus('✓ Validated library backup prepared. Keep the downloaded file somewhere safe.','saved');
  }catch(e){storageStatus('Backup export failed: '+e.message,'error');}
 });
 document.getElementById('rosewood-backup-import').addEventListener('click',()=>{document.getElementById('rosewood-backup-file').value='';document.getElementById('rosewood-backup-file').click();});
 document.getElementById('rosewood-backup-file').addEventListener('change',async(e)=>{
  const f=e.target.files&&e.target.files[0];if(!f||!rosewoodReader)return;
  rosewoodPendingRestore=null;storageStatus('Checking the backup before import…','saving');
  try{
   if(f.size>16*1024*1024)throw Error('Backup is too large');
   const inspected=await window.RosewoodStorage.inspectBackup(rosewoodReader,await f.text());
   rosewoodPendingRestore=inspected;
   showDialog(`<div class="dialog-head"><div><span class="eyebrow">library backup preview</span><h2>Review before restoring</h2></div>${closeButton}</div><p><strong>Exported:</strong> ${esc(new Date(inspected.preview.exported_at).toLocaleString())}</p><p><strong>Goals:</strong> ${inspected.preview.goals.public_goodreads} public / ${inspected.preview.goals.private_goodreads} private</p><p><strong>Custom books:</strong> ${inspected.preview.custom_books} · <strong>Progress records:</strong> ${inspected.preview.progress_records}</p><p><strong>History events:</strong> ${inspected.preview.events} · <strong>Unlocked achievements:</strong> ${inspected.preview.awards}</p><div class="info-box" style="margin:16px 0">This will replace the current on-device library records. A pre-import snapshot will be kept locally, but you should export your current backup first. Disc Ledger data is never touched.</div><label class="field"><span><input type="checkbox" id="restore-confirm"> I understand my current library data will be replaced</span></label><div class="cluster" style="margin-top:18px"><button type="button" class="btn primary" id="restore-confirm-button" disabled>Replace library data</button><button type="button" class="btn" data-close>Cancel</button></div>`);
   document.getElementById('restore-confirm').addEventListener('change',ev=>{document.getElementById('restore-confirm-button').disabled=!ev.target.checked;});
   document.getElementById('restore-confirm-button').addEventListener('click',async()=>{
    if(!document.getElementById('restore-confirm').checked||!rosewoodPendingRestore)return;
    const btn=document.getElementById('restore-confirm-button');btn.disabled=true;storageStatus('Restoring backup in one transaction…','saving');
    try{const restored=await window.RosewoodStorage.restoreBackup(rosewoodReader,rosewoodPendingRestore);applyPreferences(restored.settings);rosewoodPendingRestore=null;closeDialog();refreshProgressCards();renderCustomShelf();renderResearch();renderSlowReads();renderHomeRitual();storageStatus('✓ Backup restored, including added books, and committed to this device.','saved');}
    catch(err){storageStatus('Restore failed: '+err.message+' Existing data retained.','error');btn.disabled=false;}
   });
   storageStatus('Backup validated. Confirm replacement in the preview dialog.','saved');
  }catch(err){storageStatus('Import refused: '+err.message+' Nothing was replaced.','error');}
 });
 initRosewoodStorage();

 // Give the page a working catalog even without any network or cover matches.
 updateArcs();renderLibrary();renderNav();renderSlowReads();renderHomeRitual();
 const initial=location.hash.replace('#','');if(routes.some(x=>x[0]===initial))openRoute(initial);

 // ---------- Discover ----------
 const facetPayload=JSON.parse(document.getElementById('brosia-facets').textContent).books;
 const D=window.BrosiaDiscover;
 const discoverEntries=()=>D.build([...books,...(rosewoodReader?customState():[])],facetPayload,b=>yearlongBooks.has(b.id));
 const MOODS=['thought-provoking','funny','lyrical','emotionally-devastating','hopeful','cozy','romantic','epic','dark','contemplative','adventurous','atmospheric','whimsical','justice-minded','intense','tender','suspenseful','morally-gray','wonder-filled','challenging','comforting','rebellious','tragic','immersive'];
 const FORMS=[['fiction','Fiction'],['nonfiction','Nonfiction'],['philosophy','Philosophy'],['memoir','Memoir'],['craft','Writing craft']];
 const LENGTHS=[['short','Short'],['medium','Medium'],['long','Long'],['epic','Very long']];
 const EFFORTS=[['light','Easy to sink into'],['moderate','Some focus'],['demanding','Demanding']];
 const ds={mode:'mood',q:{moods:[],moodMode:'any',forms:[],lengths:[],efforts:[],genres:[],themes:[],unreadOnly:true,includeDaily:false},guide:{step:0,answers:{}},search:'',browse:null,hidden:new Set(),featured:null};
 const surpriseBag=D.makeBag();
 const chip=(group,value,label,on)=>`<button type="button" class="chip" data-chip="${group}" data-value="${esc(value)}" aria-pressed="${on}">${esc(label)}</button>`;
 const cap=s=>D.LABEL(s).replace(/^./,c=>c.toUpperCase());
 const GUIDE=[
  ['kind','Tonight, fiction or nonfiction?',[['fiction','A story'],['nonfiction','Something true or a big idea'],['','Surprise me']]],
  ['energy','How much energy do you have?',[['light','Not much, something easy'],['moderate','A medium amount'],['demanding','I want to wrestle with ideas']]],
  ['appetite','What are you hungry for?',[['comfort','Comfort'],['wonder','Wonder'],['laughter','Laughter'],['sadness','A good cry'],['romance','Romantic tension'],['mystery','Mystery'],['injustice','Righteous anger'],['ideas','Big ideas']]],
  ['time','How long a book?',[['short','Short'],['medium','Medium'],['long','Long and immersive'],['','I don’t mind']]]];
 function discoverPanel(){
  const p=document.getElementById('discover-panel');if(!p)return;
  if(ds.mode==='mood'){
   p.innerHTML=`<div class="chip-row" role="group" aria-label="Moods">${MOODS.map(m=>chip('moods',m,cap(m),ds.q.moods.includes(m))).join('')}</div>
    <div class="discover-match">${ds.q.moods.length>1?`Show books that are <button type="button" class="link-toggle" data-mood-mode>${ds.q.moodMode==='all'?'all of these':'any of these'}</button>`:''}</div>
    <details class="discover-refine"${ds.q.forms.length||ds.q.lengths.length||ds.q.efforts.length?' open':''}><summary>Refine</summary>
     <div class="refine-group"><p>Kind of book</p><div class="chip-row">${FORMS.map(([v,l])=>chip('forms',v,l,ds.q.forms.includes(v))).join('')}</div></div>
     <div class="refine-group"><p>Length</p><div class="chip-row">${LENGTHS.map(([v,l])=>chip('lengths',v,l,ds.q.lengths.includes(v))).join('')}</div></div>
     <div class="refine-group"><p>Reading effort</p><div class="chip-row">${EFFORTS.map(([v,l])=>chip('efforts',v,l,ds.q.efforts.includes(v))).join('')}</div></div>
     <label class="refine-check"><input type="checkbox" data-q-toggle="unreadOnly" ${ds.q.unreadOnly?'checked':''}> Hide books I’ve finished</label>
     <label class="refine-check"><input type="checkbox" data-q-toggle="includeDaily" ${ds.q.includeDaily?'checked':''}> Include the two daily classics</label>
    </details>${ds.q.moods.length||ds.q.forms.length||ds.q.lengths.length||ds.q.efforts.length?'<button type="button" class="link-toggle" data-discover-reset>Clear all</button>':''}`;
  }else if(ds.mode==='guide'){
   const g=ds.guide;
   if(g.step<GUIDE.length){const [key,question,opts]=GUIDE[g.step];
    p.innerHTML=`<div class="guide"><p class="guide-step">Question ${g.step+1} of ${GUIDE.length}</p><h2>${question}</h2><div class="guide-options">${opts.map(([v,l])=>`<button type="button" class="guide-option" data-guide="${key}" data-value="${v}" aria-pressed="${g.answers[key]===v}">${esc(l)}</button>`).join('')}</div><div class="cluster">${g.step?'<button type="button" class="link-toggle" data-guide-back>Back</button>':''}<button type="button" class="link-toggle" data-guide-skip>Skip</button></div></div>`;}
   else p.innerHTML='<div class="guide"><h2>Here’s what fits</h2><div class="cluster"><button type="button" class="link-toggle" data-guide-back>Change an answer</button><button type="button" class="link-toggle" data-guide-restart>Start over</button></div></div>';
  }else if(ds.mode==='browse'){
   const entries=discoverEntries();
   const shelf=(key,label)=>`<div class="refine-group"><p>${label}</p><div class="chip-row">${D.counts(entries,key).filter(([,n])=>n>=3).map(([v,n])=>`<button type="button" class="chip" data-browse="${key}" data-value="${esc(v)}" aria-pressed="${ds.browse?.key===key&&ds.browse.value===v}">${esc(cap(v))} <span class="chip-n">${n}</span></button>`).join('')}</div></div>`;
   p.innerHTML=shelf('genres','Genres and shelves')+shelf('themes','Themes and ideas');
  }else{
   p.innerHTML=`<div class="field"><label for="discover-search">Title, author, genre or theme</label><input type="search" id="discover-search" class="search-field" placeholder="Try “Dostoyevsky”, “grief” or “finished trilogy”" value="${esc(ds.search)}"></div>`;
  }
 }
 function discoverQuery(){
  if(ds.mode==='mood')return ds.q;
  if(ds.mode==='guide')return ds.guide.step>=GUIDE.length?D.guided(ds.guide.answers):null;
  if(ds.mode==='browse')return ds.browse?{unreadOnly:false,[ds.browse.key]:[ds.browse.value]}:null;
  return null;
 }
 function resultCard(item,featured){
  const b=item.entry.book,f=item.entry.f,st=rosewoodReader?.state?.progress?.[b.id]?.status;
  const isNext=queueBooks()[0]?.id===b.id,daily=yearlongBooks.has(b.id);
  const meta=[f&&{short:'Short',medium:'Medium length',long:'Long',epic:'Very long'}[f.length],f&&{light:'easy to sink into',moderate:'some focus',demanding:'demanding'}[f.effort],b.series_name].filter(Boolean).join(' · ');
  const reasons=item.reasons?.length?item.reasons.join(' · '):(f?f.moods.slice(0,3).map(D.LABEL).join(' · '):'');
  return `<article class="discover-card${featured?' featured':''}" data-result="${esc(b.id)}"><div class="book-cover">${coverMarkup(b)}</div><div class="discover-body">${featured?'<p class="eyebrow">A surprise pick</p>':''}<h3>${esc(b.title)}</h3><p class="discover-author">${esc(b.author)}</p>${reasons?`<p class="discover-why">${esc(reasons)}</p>`:''}${meta?`<p class="discover-meta">${esc(meta)}</p>`:''}
   <div class="discover-actions"><button type="button" class="btn small-btn" data-book="${esc(b.id)}">Open</button>${isNext?'<span class="discover-note">Your next read</span>':st==='finished'?'<span class="discover-note">Finished</span>':daily?'':`<button type="button" class="btn small-btn primary" data-discover-next="${esc(b.id)}">Make this my next read</button>`}${featured?'<button type="button" class="link-toggle" data-surprise-again>Try another</button>':`<button type="button" class="link-toggle" data-discover-hide="${esc(b.id)}">Not tonight</button>`}</div></div></article>`;
 }
 function discoverResults(){
  const root=document.getElementById('discover-results'),count=document.getElementById('discover-count');if(!root)return;
  const entries=discoverEntries(),progress=rosewoodReader?.state?.progress||{};
  let list=null;
  if(ds.mode==='search'){list=ds.search.trim()?D.search(entries,ds.search).map(entry=>({entry,reasons:[]})):null;}
  else{const q=discoverQuery();if(q)list=D.filter(entries,{...q,excludeIds:[...ds.hidden]},progress);}
  if(!list){root.innerHTML=ds.mode==='mood'?'<p class="discover-empty">Choose a mood or two to begin.</p>':'';count.textContent='';return;}
  count.textContent=list.length?(list.length===1?'1 book':`${list.length} books`):'';
  root.innerHTML=list.length?list.slice(0,60).map(x=>resultCard(x)).join('')+(list.length>60?`<p class="discover-empty">Showing the best 60 of ${list.length}. Add a mood or refine to narrow it down.</p>`:'')
   :`<div class="discover-empty"><p>Nothing matches all of that.</p>${ds.mode==='mood'&&ds.q.moodMode==='all'?'<button type="button" class="link-toggle" data-mood-mode>Match any mood instead</button>':''}<button type="button" class="link-toggle" data-discover-reset>Clear filters</button></div>`;
 }
 function renderDiscover(){
  for(const t of document.querySelectorAll('[data-discover-mode]'))t.setAttribute('aria-selected',String(t.dataset.discoverMode===ds.mode));
  discoverPanel();discoverResults();
  const feat=document.getElementById('discover-featured');if(feat)feat.innerHTML=ds.featured?resultCard(ds.featured,true):'';
 }
 function surprise(){
  const entries=discoverEntries(),progress=rosewoodReader?.state?.progress||{};
  const q=discoverQuery();
  let pool=q?D.filter(entries,{...q,unreadOnly:true,excludeIds:[...ds.hidden]},progress):[];
  if(!pool.length)pool=D.filter(entries,{unreadOnly:true,excludeIds:[...ds.hidden]},progress);
  const pick=surpriseBag(pool);ds.featured=pick?{...pick,reasons:pick.reasons?.length?pick.reasons:[]}:null;renderDiscover();
  document.getElementById('discover-featured')?.scrollIntoView({behavior:'smooth',block:'nearest'});
 }
 document.getElementById('view-discover')?.addEventListener('click',e=>{
  const t=e.target;
  const mode=t.closest('[data-discover-mode]');if(mode){ds.mode=mode.dataset.discoverMode;ds.featured=null;renderDiscover();if(ds.mode==='search')document.getElementById('discover-search')?.focus();return;}
  const c=t.closest('[data-chip]');if(c){const arr=ds.q[c.dataset.chip],v=c.dataset.value,i=arr.indexOf(v);i<0?arr.push(v):arr.splice(i,1);ds.featured=null;renderDiscover();return;}
  if(t.closest('[data-mood-mode]')){ds.q.moodMode=ds.q.moodMode==='all'?'any':'all';renderDiscover();return;}
  if(t.closest('[data-discover-reset]')){Object.assign(ds.q,{moods:[],forms:[],lengths:[],efforts:[],moodMode:'any'});ds.browse=null;ds.hidden.clear();ds.featured=null;renderDiscover();return;}
  const g=t.closest('[data-guide]');if(g){ds.guide.answers[g.dataset.guide]=g.dataset.value;ds.guide.step++;renderDiscover();return;}
  if(t.closest('[data-guide-skip]')){delete ds.guide.answers[GUIDE[ds.guide.step][0]];ds.guide.step++;renderDiscover();return;}
  if(t.closest('[data-guide-back]')){ds.guide.step=Math.max(0,ds.guide.step-1);renderDiscover();return;}
  if(t.closest('[data-guide-restart]')){ds.guide={step:0,answers:{}};renderDiscover();return;}
  const br=t.closest('[data-browse]');if(br){const same=ds.browse?.key===br.dataset.browse&&ds.browse.value===br.dataset.value;ds.browse=same?null:{key:br.dataset.browse,value:br.dataset.value};renderDiscover();return;}
  const hide=t.closest('[data-discover-hide]');if(hide){ds.hidden.add(hide.dataset.discoverHide);renderDiscover();return;}
  if(t.closest('#discover-surprise')||t.closest('[data-surprise-again]')){surprise();return;}
  const next=t.closest('[data-discover-next]');if(next){queuePick(next.dataset.discoverNext);next.replaceWith(Object.assign(document.createElement('span'),{className:'discover-note',textContent:'Now your next read'}));return;}
 });
 document.getElementById('view-discover')?.addEventListener('input',e=>{if(e.target.id==='discover-search'){ds.search=e.target.value;discoverResults();}});
 document.getElementById('view-discover')?.addEventListener('change',e=>{const k=e.target.dataset?.qToggle;if(k){ds.q[k]=e.target.checked;discoverResults();}});
 // Home teaser: six moods that open Discover pre-filtered.
 {const row=document.getElementById('home-mood-chips');if(row){
  row.innerHTML=['cozy','thought-provoking','funny','emotionally-devastating','romantic','adventurous','lyrical','dark'].map(m=>`<button type="button" class="chip" data-home-mood="${m}">${esc(cap(m))}</button>`).join('');
  row.addEventListener('click',e=>{const b=e.target.closest('[data-home-mood]');if(!b)return;Object.assign(ds,{mode:'mood',featured:null});ds.q.moods=[b.dataset.homeMood];openRoute('discover');});
 }}
 window.__rosewoodPrototype={version:'0.31.0-106-all-menus-exact-slow-book-progress',queueImplemented:true,getQueueIds:()=>rosewoodReader?queueEngine.fullOrder(books,customState(),rosewoodReader.state.overrides.reading_order_ids):[],getNextRead:()=>queueBooks()[0]?.id||null,getQueueStatuses:()=>books.map(b=>({id:b.id,kind:queueEngine.classification(b)})),getCommitmentSummary:()=>queueEngine.commitmentSummary(books,rosewoodReader?.state?.progress||{}),revisedPlanImplemented:true,getRevisedPlan:()=>revisionPayload,slowReadsImplemented:true,getSlowReadTracks:()=>slowTracks,getSlowReadSaved:()=>rosewoodReader?.state?.overrides?.slow_reads||{},arcTrackingImplemented:true,getArcSnapshot:()=>arcSnapshot,compassImplemented:true,getCompass:()=>compassSummary,previewCompass:day=>computeCompass(day),calendarImplemented:true,softDatesImplemented:true,getPacing:()=>pacingSummary,previewPacing:day=>computePacing(day),goalsImplemented:true,getGoalSummary:()=>currentGoalSummary,readingRecordsImplemented:true,getBookProgress:id=>rosewoodReader?.state?.progress?.[id]||null,bookProfilesImplemented:true,literaryProfilesImplemented:true,literaryProfileCount:literaryProfiles.count,literaryProfileCohorts:Object.freeze([16,17,18,19,20,21,22,23,24,25,26]),getLiteraryProfile:id=>literaryProfiles.get(id),readerNotesImplemented:true,privateResearchImplemented:true,goodreadsCSVImportImplemented:true,seriesReviewImplemented:true,getSeriesReview:()=>rosewoodReader?.state?.overrides?.series_continuation_choices||{},readerFavoritesImplemented:true,earnedAchievementsImplemented:true,getAchievements:()=>awardSnapshot(),getClassicsMilestones:()=>rosewoodReader?window.BrosiaReadingMilestones.evaluate(rosewoodReader.state,slowTracks):null,getResearchNotes:()=>researchItems().map(x=>({...x})),getFavoriteCounts:()=>rosewoodReader?researchEngine.counts(rosewoodReader.state):null,customBooksImplemented:true,getCustomBooks:()=>customState().map(x=>({...x})),storageImplemented:true,catalogImplemented:true,plannedCount:106,totalBooksWithSlowReads:106,regularScheduleCount:104,slowReadCount:2,achievementCount:awards.length,coverLookup:'106 bundled title-and-author covers with optional public published cover matching',persistenceImplemented:true,getBookById:id=>catalogIndex.byId.get(id),getCoverProvenance:id=>coverIds.get(id)||{status:'lookup_pending'}};
})();
