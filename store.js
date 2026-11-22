// تخزين محلي فقط: IndexedDB للوسائط، localStorage للإعدادات والنتائج
const DB={
 open(){return this.p||(this.p=new Promise((ok,no)=>{const r=indexedDB.open('bayt',1);r.onupgradeneeded=()=>r.result.createObjectStore('m');r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)}))},
 async tx(m,f){const d=await this.open();return new Promise((ok,no)=>{const t=d.transaction('m',m),q=f(t.objectStore('m'));t.oncomplete=()=>ok(q&&q.result);t.onerror=()=>no(t.error)})},
 get(k){return this.tx('readonly',s=>s.get(k))},set(k,v){return this.tx('readwrite',s=>s.put(v,k))},
 del(k){return this.tx('readwrite',s=>s.delete(k))},keys(){return this.tx('readonly',s=>s.getAllKeys())}};
const load=(k,d)=>{try{return JSON.parse(localStorage.getItem('bayt.'+k))||d}catch{return d}};
const save=(k,v)=>localStorage.setItem('bayt.'+k,JSON.stringify(v));
const cfg=()=>Object.assign({child:'C01',count:2,hints:true,tts:true,simple:false,pin:'1234'},load('cfg',{}));
const log=r=>{const a=load('trials',[]);a.push({t:new Date().toISOString(),child:cfg().child,...r});save('trials',a)};
const urls=new Map();
async function mUrl(key){if(urls.has(key))return urls.get(key);let b=null;try{b=await DB.get(key)}catch{}const u=b?URL.createObjectURL(b):null;urls.set(key,u);return u}
function drop(key){const u=urls.get(key);if(u)URL.revokeObjectURL(u);urls.delete(key)}
async function hydrate(root=document){for(const e of root.querySelectorAll('img[data-k]'))e.src=(await mUrl('img:'+e.dataset.k))||(window.IMGDATA&&IMGDATA[e.dataset.k])||`${e.dataset.k}.png`}
// الصوت: تسجيل الأخصائية ← ملف في sounds/ ← صوت المتصفح التجريبي (اختياري)
let cur=null;const miss=new Set();
const stopAudio=()=>{cur&&cur.pause();window.speechSynthesis&&speechSynthesis.cancel()};
const tryPlay=src=>miss.has(src)?Promise.resolve(false):new Promise(r=>{const a=new Audio(src);cur=a;a.onended=()=>r(true);a.onerror=()=>{miss.add(src);r(false)};a.play().catch(()=>{miss.add(src);r(false)})});
async function say(key){
 stopAudio();const u=await mUrl('snd:'+key);
 if(u&&await tryPlay(u))return;
 for(const x of ['mp3','m4a','wav','ogg'])if(await tryPlay(`sounds/${key}.${x}`))return;
 if(cfg().tts&&window.speechSynthesis){const s=SOUNDS.find(s=>s[0]===key),t=new SpeechSynthesisUtterance(s[1]);t.lang='ar-SA';t.rate=.8;speechSynthesis.speak(t)}}
