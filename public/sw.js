/* Rosewood Library · offline-first PWA shell 0.4.0.
 * Unique namespace; may ONLY control the directory containing this sw.js.
 * No reading state, cookies, analytics or identifiers are cached or transmitted.
 * Separate from Disc Ledger caches and service-worker registration.
 */
'use strict';
const VERSION='brosia-106-catalog-visible-2026-11-20-r6';
const CACHE_PREFIX='rosewood-library-2027-';
const SHELL=CACHE_PREFIX+'shell-'+VERSION;
const COVERS=CACHE_PREFIX+'public-covers-v1';
const MAX_COVERS=260;
const PRECACHE=["./","./index.html","./manifest.webmanifest","./pwa-client.js","./assets/achievements/a_new_chapter_locked.webp","./assets/achievements/a_new_chapter_unlocked.webp","./assets/achievements/bookworm_locked.webp","./assets/achievements/bookworm_unlocked.webp","./assets/achievements/century_locked.webp","./assets/achievements/century_unlocked.webp","./assets/achievements/disc_beginning_locked.webp","./assets/achievements/disc_beginning_unlocked.webp","./assets/achievements/disc_complete_locked.webp","./assets/achievements/disc_complete_unlocked.webp","./assets/achievements/double_digits_locked.webp","./assets/achievements/double_digits_unlocked.webp","./assets/achievements/first_reflection_locked.webp","./assets/achievements/first_reflection_unlocked.webp","./assets/achievements/five_favorites_locked.webp","./assets/achievements/five_favorites_unlocked.webp","./assets/achievements/growing_library_locked.webp","./assets/achievements/growing_library_unlocked.webp","./assets/achievements/literary_sampler_locked.webp","./assets/achievements/literary_sampler_unlocked.webp","./assets/achievements/moist_complete_locked.webp","./assets/achievements/moist_complete_unlocked.webp","./assets/achievements/own_book_locked.webp","./assets/achievements/own_book_unlocked.webp","./assets/achievements/philosophy_first_locked.webp","./assets/achievements/philosophy_first_unlocked.webp","./assets/achievements/philosophy_five_locked.webp","./assets/achievements/philosophy_five_unlocked.webp","./assets/achievements/philosophy_nineteen_locked.webp","./assets/achievements/philosophy_nineteen_unlocked.webp","./assets/achievements/public_victory_locked.webp","./assets/achievements/public_victory_unlocked.webp","./assets/achievements/reading_through_seasons_locked.webp","./assets/achievements/reading_through_seasons_unlocked.webp","./assets/achievements/research_ten_locked.webp","./assets/achievements/research_ten_unlocked.webp","./assets/achievements/rincewind_complete_locked.webp","./assets/achievements/rincewind_complete_unlocked.webp","./assets/achievements/secret_century_locked.webp","./assets/achievements/secret_century_unlocked.webp","./assets/achievements/series_complete_locked.webp","./assets/achievements/series_complete_unlocked.webp","./assets/achievements/seventy_five_locked.webp","./assets/achievements/seventy_five_unlocked.webp","./assets/achievements/thoughtful_journal_locked.webp","./assets/achievements/thoughtful_journal_unlocked.webp","./assets/achievements/tiffany_complete_locked.webp","./assets/achievements/tiffany_complete_unlocked.webp","./assets/app-icon.svg","./assets/botanical-divider.svg","./assets/celebration.svg","./assets/empty-shelf.svg","./assets/hero-book-rose.webp","./assets/icon-192.png","./assets/icon-512.png","./assets/book-covers/rosewood-2027-001.svg","./assets/book-covers/rosewood-2027-002.svg","./assets/book-covers/rosewood-2027-003.svg","./assets/book-covers/rosewood-2027-004.svg","./assets/book-covers/rosewood-2027-005.svg","./assets/book-covers/rosewood-2027-006.svg","./assets/book-covers/rosewood-2027-007.svg","./assets/book-covers/rosewood-2027-008.svg","./assets/book-covers/rosewood-2027-009.svg","./assets/book-covers/rosewood-2027-010.svg","./assets/book-covers/rosewood-2027-011.svg","./assets/book-covers/rosewood-2027-012.svg","./assets/book-covers/rosewood-2027-013.svg","./assets/book-covers/rosewood-2027-014.svg","./assets/book-covers/rosewood-2027-015.svg","./assets/book-covers/rosewood-2027-016.svg","./assets/book-covers/rosewood-2027-017.svg","./assets/book-covers/rosewood-2027-018.svg","./assets/book-covers/rosewood-2027-019.svg","./assets/book-covers/rosewood-2027-020.svg","./assets/book-covers/rosewood-2027-021.svg","./assets/book-covers/rosewood-2027-022.svg","./assets/book-covers/rosewood-2027-023.svg","./assets/book-covers/rosewood-2027-024.svg","./assets/book-covers/rosewood-2027-025.svg","./assets/book-covers/rosewood-2027-026.svg","./assets/book-covers/rosewood-2027-027.svg","./assets/book-covers/rosewood-2027-028.svg","./assets/book-covers/rosewood-2027-029.svg","./assets/book-covers/rosewood-2027-030.svg","./assets/book-covers/rosewood-revised-2027-031.svg","./assets/book-covers/rosewood-2027-032.svg","./assets/book-covers/rosewood-2027-033.svg","./assets/book-covers/rosewood-2027-034.svg","./assets/book-covers/rosewood-2027-035.svg","./assets/book-covers/rosewood-2027-036.svg","./assets/book-covers/rosewood-revised-2027-037.svg","./assets/book-covers/rosewood-2027-038.svg","./assets/book-covers/rosewood-2027-039.svg","./assets/book-covers/rosewood-2027-040.svg","./assets/book-covers/rosewood-2027-041.svg","./assets/book-covers/rosewood-revised-2027-042.svg","./assets/book-covers/rosewood-2027-043.svg","./assets/book-covers/rosewood-2027-044.svg","./assets/book-covers/rosewood-2027-045.svg","./assets/book-covers/rosewood-2027-046.svg","./assets/book-covers/rosewood-revised-2027-047.svg","./assets/book-covers/rosewood-2027-048.svg","./assets/book-covers/rosewood-2027-049.svg","./assets/book-covers/rosewood-2027-050.svg","./assets/book-covers/rosewood-2027-051.svg","./assets/book-covers/rosewood-2027-052.svg","./assets/book-covers/rosewood-revised-2027-053.svg","./assets/book-covers/rosewood-2027-054.svg","./assets/book-covers/rosewood-2027-055.svg","./assets/book-covers/rosewood-2027-056.svg","./assets/book-covers/rosewood-2027-057.svg","./assets/book-covers/rosewood-2027-058.svg","./assets/book-covers/rosewood-2027-059.svg","./assets/book-covers/rosewood-2027-060.svg","./assets/book-covers/rosewood-2027-061.svg","./assets/book-covers/rosewood-2027-062.svg","./assets/book-covers/rosewood-revised-2027-063.svg","./assets/book-covers/rosewood-2027-064.svg","./assets/book-covers/rosewood-2027-065.svg","./assets/book-covers/rosewood-2027-066.svg","./assets/book-covers/rosewood-2027-067.svg","./assets/book-covers/rosewood-2027-068.svg","./assets/book-covers/rosewood-revised-2027-069.svg","./assets/book-covers/rosewood-2027-070.svg","./assets/book-covers/rosewood-2027-071.svg","./assets/book-covers/rosewood-2027-072.svg","./assets/book-covers/rosewood-2027-073.svg","./assets/book-covers/rosewood-revised-2027-074.svg","./assets/book-covers/rosewood-2027-075.svg","./assets/book-covers/rosewood-2027-076.svg","./assets/book-covers/rosewood-2027-077.svg","./assets/book-covers/rosewood-2027-078.svg","./assets/book-covers/rosewood-revised-2027-079.svg","./assets/book-covers/rosewood-2027-080.svg","./assets/book-covers/rosewood-2027-081.svg","./assets/book-covers/rosewood-2027-082.svg","./assets/book-covers/rosewood-2027-083.svg","./assets/book-covers/rosewood-2027-084.svg","./assets/book-covers/rosewood-revised-2027-085.svg","./assets/book-covers/rosewood-2027-086.svg","./assets/book-covers/rosewood-2027-087.svg","./assets/book-covers/rosewood-2027-088.svg","./assets/book-covers/rosewood-2027-089.svg","./assets/book-covers/rosewood-revised-2027-090.svg","./assets/book-covers/rosewood-2027-091.svg","./assets/book-covers/rosewood-2027-092.svg","./assets/book-covers/rosewood-2027-093.svg","./assets/book-covers/rosewood-2027-094.svg","./assets/book-covers/rosewood-revised-2027-095.svg","./assets/book-covers/rosewood-2027-096.svg","./assets/book-covers/rosewood-2027-097.svg","./assets/book-covers/rosewood-2027-098.svg","./assets/book-covers/rosewood-2027-099.svg","./assets/book-covers/rosewood-2027-100.svg","./assets/book-covers/rosewood-2027-101.svg","./assets/book-covers/rosewood-2027-102.svg","./assets/book-covers/rosewood-revised-2027-103.svg","./assets/book-covers/rosewood-2027-104.svg","./assets/achievements/russian_literature_scholar_locked.webp","./assets/achievements/russian_literature_scholar_unlocked.webp","./assets/book-covers/rosewood-2027-105.svg","./assets/book-covers/rosewood-2027-106.svg"];
const ownScope=new URL(self.registration.scope);
const localURL=path=>new URL(path,ownScope).href;
const allowableCoverURL=url=>url.protocol==='https:' &&
  ((url.hostname==='covers.openlibrary.org' && /^\/b\/(?:id\/\d+|isbn\/\d{13})-[SML]\.jpg$/.test(url.pathname)) ||
   (url.hostname==='openlibrary.org' && url.pathname==='/search.json'));
const scopeContains=url=>url.origin===ownScope.origin && url.pathname.startsWith(ownScope.pathname);

self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(SHELL);
    // cache.addAll rejects on a missing dependency: never claim offline-ready with an incomplete shell.
    await cache.addAll(PRECACHE.map(localURL));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k.startsWith(CACHE_PREFIX) && k!==SHELL && k!==COVERS).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});
async function savePublicCover(request,response){
  if(!response || !(response.ok || response.type==='opaque'))return;
  const cache=await caches.open(COVERS);
  await cache.put(request,response.clone());
  const keys=await cache.keys();
  if(keys.length>MAX_COVERS)await Promise.all(keys.slice(0,keys.length-MAX_COVERS).map(key=>cache.delete(key)));
}
async function coverLookup(request){
  const cache=await caches.open(COVERS);
  const found=await cache.match(request);
  // Prefer verified existing provider reply when offline. Online: refresh data in the background.
  if(found){
    return found;
  }
  const response=await fetch(request);
  if(response.ok || response.type==='opaque'){
    // Service worker stores only provider media/search responses. The JS adapter still validates book identity.
    await savePublicCover(request,response.clone());
  }
  return response;
}
self.addEventListener('fetch',event=>{
 const req=event.request;
 if(req.method!=='GET')return;
 const u=new URL(req.url);
 if(scopeContains(u)){
   // Strict directory scope: never intercept parent/sibling apps on the same origin.
   if(req.mode==='navigate'){
     event.respondWith((async()=>{
       try{
         // Network-first when connected prevents a previous deployment from staying on screen.
         // Offline fallback is the current version's locally cached shell.
         const live=await fetch(new Request(req,{cache:'no-store'}));
         if(live.ok){const cache=await caches.open(SHELL);await cache.put(localURL('./index.html'),live.clone());return live;}
         throw Error('Navigation unavailable');
       }catch(_){const cache=await caches.open(SHELL);return await cache.match(localURL('./index.html')) || new Response('Brosia’s Library is offline and has not finished installing.',{status:503,headers:{'Content-Type':'text/plain'}});}
     })());return;
   }
   event.respondWith((async()=>{
     const cache=await caches.open(SHELL);
     const assetPath=u.pathname;
     const updateSensitive=assetPath.endsWith('/index.html')||assetPath.endsWith('/pwa-client.js')||assetPath.endsWith('/manifest.webmanifest');
     if(updateSensitive){try{const live=await fetch(new Request(req,{cache:'no-store'}));if(live.ok){await cache.put(req,live.clone());return live;}}catch(_){} }
     const cached=await cache.match(req);
     if(cached)return cached;
     try{return await fetch(req)}catch(_){return Response.error()}
   })());return;
 }
 // Only known public book cover URLs; never touch other external services.
 if(allowableCoverURL(u)){
   event.respondWith(coverLookup(req).catch(()=>Response.error()));
 }
});
self.addEventListener('message',event=>{
 if(event.data?.type==='ROSEWOOD_OFFLINE_CHECK'){
   caches.open(SHELL).then(async cache=>{
     const required=[localURL('./index.html'),localURL('./manifest.webmanifest'),localURL('./assets/icon-192.png')];
     const found=await Promise.all(required.map(u=>cache.match(u)));
     event.source?.postMessage({type:'ROSEWOOD_OFFLINE_STATUS',installed:found.every(Boolean),shellVersion:VERSION,coreCount:PRECACHE.length});
   }).catch(()=>{});
 }
});
