/* Rosewood-only PWA lifecycle; this file does not persist any reading information. */
(()=>{
 'use strict';
 const status=document.getElementById('rosewood-connection');
 const install=document.getElementById('rosewood-install');
 let promptEvent=null;
 function setStatus(){
  if(!status)return;
  const local=location.protocol==='file:';
  const supported=('serviceWorker' in navigator) && (window.isSecureContext || location.hostname==='localhost' || location.hostname==='127.0.0.1');
  status.textContent=local?'Local preview · host over HTTPS for offline installation':
    !navigator.onLine?"Offline · Brosia’s Library is available if previously installed":
    !supported?'Preview · HTTPS required for installation':"Online · Brosia’s Library offline shell can be installed";
  status.dataset.connection=navigator.onLine?'online':'offline';
 }
 window.addEventListener('online',setStatus);
 window.addEventListener('offline',setStatus);
 window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();promptEvent=e;if(install)install.hidden=false;});
 window.addEventListener('appinstalled',()=>{promptEvent=null;if(install)install.hidden=true;setStatus();});
 install?.addEventListener('click',async()=>{if(!promptEvent)return;const e=promptEvent;promptEvent=null;install.hidden=true;try{await e.prompt();await e.userChoice;}catch(_){setStatus();}});
 setStatus();
 if(location.protocol==='file:' || !('serviceWorker' in navigator) || !window.isSecureContext)return;
 window.addEventListener('load',()=>{
   const scriptURL=new URL('./sw.js',location.href);
   const folderURL=new URL('./',location.href);
   navigator.serviceWorker.register(scriptURL.href,{scope:folderURL.pathname,updateViaCache:'none'})
     .then(reg=>{
       // Explicitly check the registered worker's scope is the exact app folder.
       if(new URL(reg.scope).pathname!==folderURL.pathname)throw Error('Unexpected worker scope');
       const relay=()=>{navigator.serviceWorker.controller?.postMessage({type:'ROSEWOOD_OFFLINE_CHECK'});};
       navigator.serviceWorker.addEventListener('controllerchange',relay,{once:true});relay();
     }).catch(err=>{if(status)status.textContent='Offline installation unavailable: '+String(err.message||err);});
   navigator.serviceWorker.addEventListener('message',event=>{
      if(event.data?.type==='ROSEWOOD_OFFLINE_STATUS'&&status){
        status.textContent=(navigator.onLine?'Online':'Offline')+(event.data.installed?' · Offline assets saved':' · Offline install incomplete');
        status.dataset.offlineReady=String(Boolean(event.data.installed));
      }
   });
 });
})();
