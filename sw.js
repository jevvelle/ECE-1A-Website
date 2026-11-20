// Bump CACHE whenever you change any file.
const CACHE='class-portal-v6';
const ASSETS=['./','./index.html','./styles.css','./app.js','./data.js','./manifest.json','./icon-192.png','./icon-512.png','./mascot-sun.png','./mascot-calc.png','./fonts/jakarta-500.woff2','./fonts/jakarta-600.woff2','./fonts/jakarta-700.woff2'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))));self.clients.claim()});
// Network first (so updates show up right away), cache when offline or the network is slow.
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;
 e.respondWith((async()=>{
  const c=await caches.open(CACHE);
  try{const r=await Promise.race([fetch(e.request,{cache:'no-cache'}),new Promise((_,j)=>setTimeout(j,4000))]);if(r.ok)c.put(e.request,r.clone());return r}
  catch{return(await c.match(e.request,{ignoreSearch:true}))||(await c.match('./index.html'))}
 })())});
self.addEventListener('notificationclick',e=>{
 e.notification.close();
 e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>l.length?l[0].focus():clients.openWindow('./index.html')));
});