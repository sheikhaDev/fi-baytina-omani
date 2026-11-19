const C='bayt-v1';
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(['./','index.html','css/style.css','js/data.js','js/store.js','js/engine3d.js','js/app.js'])));self.skipWaiting()});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.open(C).then(async c=>{const m=await c.match(e.request);const f=fetch(e.request).then(r=>{if(r.ok)c.put(e.request,r.clone());return r});return m||f}))});
