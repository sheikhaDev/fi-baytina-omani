const app=document.getElementById('app');
const IC={back:'<svg viewBox="0 0 48 48"><path d="M16 10l16 14-16 14"/></svg>',spk:'<svg viewBox="0 0 48 48"><path d="M8 18h8l10-8v28l-10-8H8z"/><path d="M33 17q6 7 0 14M38 12q10 12 0 24"/></svg>',next:'<svg viewBox="0 0 48 48"><path d="M30 10L14 24l16 14"/></svg>'};
const shuffle=a=>a.map(x=>[Math.random(),x]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);
const item=id=>ITEMS.find(i=>i.id===id);
const hdr=mid=>`<header class="top"><a class="btn" href="#/" aria-label="رجوع">${IC.back}</a>${mid||''}<button class="btn" id="spk" aria-label="أعد السماع">${IC.spk}</button></header>`;
const praise=()=>say('p_'+(1+Math.random()*4|0));

function home(){
 app.innerHTML=`<main class="home"><img class="bg" data-k="house" alt=""><h1>في بيتنا العُماني</h1><p>أتعلم أن أطلب احتياجاتي</p>
 <nav class="acts"><a class="act" href="#/a1"><span class="pair"><img data-k="water" alt=""><img data-k="apple" alt=""></span>أتعرف إلى الصور</a>
 <a class="act" href="#/a2"><img data-k="house" alt="">أطلب احتياجاتي</a>
 <a class="act" href="#/a3"><img data-k="help" alt="">أطبق ما تعلمته</a></nav><a class="pro" href="#/panel">لوحة الأخصائية</a></main>`;
 hydrate()}

// ---------- النشاط الأول ----------
function a1(){
 const S=cfg(),pool=ITEMS.filter(i=>i.quiz);let n=0;const TOTAL=5;
 const round=()=>{
  if(n>=TOTAL){app.innerHTML=hdr()+`<div class="done">أحسنت!<br><a class="btn" href="#/" style="margin-top:1rem">الرئيسية</a></div>`;say('p_2');return}
  const opts=shuffle(pool).slice(0,S.count),t=opts[Math.random()*opts.length|0];let tries=0,hint=false;
  app.innerHTML=`<div class="stage">${hdr()}<div class="choices">${opts.map(o=>`<button class="pic" data-id="${o.id}" aria-label="${o.n}"><img data-k="${o.id}" alt="${o.n}"></button>`).join('')}</div></div>`;
  hydrate();say(n?'q_'+t.id:'ins_start').then(()=>n||say('q_'+t.id));
  document.getElementById('spk').onclick=()=>say('q_'+t.id);
  app.querySelectorAll('.pic').forEach(b=>b.onclick=()=>{
   if(b.dataset.id===t.id){b.classList.add('yes');log({act:1,item:t.id,tries,hint,ok:1});n++;praise();setTimeout(round,1800)}
   else{tries++;b.classList.remove('no');void b.offsetWidth;b.classList.add('no');say('r_'+(1+(tries%2)));
    if(S.hints&&tries>=2){hint=true;app.querySelector(`[data-id="${t.id}"]`).classList.add('hint')}}})};
 round()}

// ---------- النشاط الثاني ----------
function a2(){
 const S=cfg();let E=null,room='kitchen';
 app.innerHTML=`${hdr(`<div class="rooms">${ROOMS.map(r=>`<button class="room" data-r="${r[0]}"><img data-k="${r[0]}" alt="">${r[1]}</button>`).join('')}</div>`)}
 <div class="v2" id="v"></div><button class="pic small help" id="hb" aria-label="مساعدة"><img data-k="help" alt=""></button><div id="cd"></div>`;
 hydrate();const v=document.getElementById('v'),cd=document.getElementById('cd');
 const card=id=>{cd.innerHTML=`<div class="ov"><button class="bigcard" id="cc"><img data-k="${id}" alt=""><span>${item(id).p}</span></button><button class="btn" id="cl" aria-label="رجوع">${IC.next}</button></div>`;hydrate(cd);
  document.getElementById('cc').onclick=()=>{say('c_'+id);log({act:2,item:id,tries:0,hint:false,ok:1})};document.getElementById('cl').onclick=()=>cd.innerHTML=''};
 const simple=()=>{E=null;v.innerHTML=`<div class="choices">${ROOM_ITEMS[room].map(i=>`<button class="pic" data-id="${i}"><img data-k="${i}" alt=""></button>`).join('')}</div>`;hydrate(v);v.querySelectorAll('.pic').forEach(b=>b.onclick=()=>card(b.dataset.id))};
 const enter=r=>{room=r;app.querySelectorAll('.room').forEach(b=>b.classList.toggle('on',b.dataset.r===r));say('ins_what');
  if(E)E.set(SCENES[r]);else simple()};
 if(!S.simple){try{const cv=document.createElement('canvas');v.appendChild(cv);E=new Engine(cv);
  cv.onclick=e=>{const b=cv.getBoundingClientRect(),o=E.pick((e.clientX-b.left)*cv.width/b.width,(e.clientY-b.top)*cv.height/b.height);if(o&&o.item){E.bounce(o);card(o.item)}};
  addEventListener('resize',()=>E&&E.resize())}catch{E=null;v.innerHTML=''}}
 app.querySelectorAll('.room').forEach(b=>b.onclick=()=>enter(b.dataset.r));
 document.getElementById('hb').onclick=()=>card('help');document.getElementById('spk').onclick=()=>say('ins_what');
 enter('kitchen')}

// ---------- النشاط الثالث ----------
function a3(i=0){
 const it=ITEMS[i];
 app.innerHTML=hdr()+`<main class="card3"><button class="bigcard" id="cc"><img data-k="${it.id}" alt=""><span>${it.p}</span></button>
 <div class="row"><button class="btn" id="tn" style="font-size:2rem">الحين دورك</button><button class="btn" id="nx" aria-label="التالي">${IC.next}</button></div></main>`;
 hydrate();say('c_'+it.id);
 const ph=()=>say('c_'+it.id);document.getElementById('cc').onclick=ph;document.getElementById('spk').onclick=ph;
 document.getElementById('tn').onclick=()=>say('ins_turn');document.getElementById('nx').onclick=()=>a3((i+1)%ITEMS.length)}

// ---------- لوحة الأخصائية ----------
const dl=(n,b)=>{const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=n;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),4000)};
const csv=rows=>new Blob(['\ufeff'+rows.map(r=>r.map(c=>`"${String(c??'').replace(/"/g,'""')}"`).join(',')).join('\n')],{type:'text/csv'});
const toPng=f=>new Promise(r=>{const i=new Image();i.onload=()=>{const k=Math.min(1,800/Math.max(i.width,i.height)),c=document.createElement('canvas');c.width=i.width*k;c.height=i.height*k;c.getContext('2d').drawImage(i,0,0,c.width,c.height);c.toBlob(r,'image/png')};i.src=URL.createObjectURL(f)});
const TYPES=['قبلي','تكويني','بعدي'];

async function panel(tab='img'){
 if(!panel.ok){app.innerHTML=`<div class="panel"><h2>لوحة الأخصائية</h2><label>الرقم السري <input id="pin" type="password" inputmode="numeric"></label><button class="p-btn main" id="go">دخول</button> <a class="p-btn" href="#/">رجوع</a></div>`;const go=()=>{if(pin.value===cfg().pin){panel.ok=1;panel(tab)}else{pin.value='';pin.placeholder='الرقم غير صحيح'}};document.getElementById('go').onclick=go;pin.onkeydown=e=>e.key==='Enter'&&go();return}
 const T=[['img','الصور'],['snd','الأصوات'],['cfg','تخصيص الأنشطة'],['prog','تقدم الطفل'],['ses','الجلسات'],['exp','التصدير']];
 app.innerHTML=`<div class="panel"><a class="p-btn" href="#/">الرئيسية</a><h2>لوحة الأخصائية</h2>
 <div class="note">البيانات تُحفظ في هذا المتصفح فقط ولا تُرسل إلى أي خادم. استخدم رمزًا للطفل (مثل C01) وليس اسمه.</div>
 <div class="tabs">${T.map(t=>`<button data-t="${t[0]}" class="${t[0]===tab?'on':''}">${t[1]}</button>`).join('')}</div><div id="pb"></div></div>`;
 app.querySelectorAll('.tabs button').forEach(b=>b.onclick=()=>panel(b.dataset.t));
 const pb=document.getElementById('pb'),S=cfg(),keys=await DB.keys(),pend={};
 const refresh=()=>panel(tab);
 if(tab==='img'){
  pb.innerHTML=`<p>اختر صورة الغرض، عاينها، ثم احفظها. تُحوَّل تلقائيًا إلى PNG.</p><div class="grid">${IMGS.map(([k,n])=>`<div class="tile" data-k="${k}"><img data-k="${k}" alt=""><b>${n}</b>${keys.includes('img:'+k)?'<small>مخصصة</small>':'<small>افتراضية</small>'}<input type="file" accept="image/*" aria-label="رفع صورة ${n}"><button class="p-btn main sv" hidden>حفظ</button><button class="p-btn rs">استعادة الافتراضي</button></div>`).join('')}</div>`;hydrate(pb);
  pb.querySelectorAll('.tile').forEach(t=>{const k=t.dataset.k,im=t.querySelector('img'),sv=t.querySelector('.sv');
   t.querySelector('input').onchange=async e=>{const f=e.target.files[0];if(!f)return;pend[k]=await toPng(f);im.src=URL.createObjectURL(pend[k]);sv.hidden=false};
   sv.onclick=async()=>{await DB.set('img:'+k,pend[k]);drop('img:'+k);refresh()};
   t.querySelector('.rs').onclick=async()=>{await DB.del('img:'+k);drop('img:'+k);refresh()}})}
 if(tab==='snd'){
  pb.innerHTML=`<p>سجّل كل عبارة بصوتك ثم ارفعها (mp3 أو m4a أو wav). استمع قبل الحفظ.</p>${SOUNDS.map(([k,t,w])=>`<div class="row2" data-k="${k}"><b>${t}<br><small>${w}</small></b><small>${keys.includes('snd:'+k)?'مرفوع':'غير مرفوع'}</small><audio controls></audio><input type="file" accept="audio/*" aria-label="رفع ${t}"><button class="p-btn main sv" hidden>حفظ</button><button class="p-btn rs">حذف</button></div>`).join('')}`;
  for(const r of pb.querySelectorAll('.row2')){const k=r.dataset.k,au=r.querySelector('audio'),sv=r.querySelector('.sv'),u=await mUrl('snd:'+k);if(u)au.src=u;
   r.querySelector('input').onchange=e=>{const f=e.target.files[0];if(!f)return;pend[k]=f;au.src=URL.createObjectURL(f);sv.hidden=false};
   sv.onclick=async()=>{await DB.set('snd:'+k,pend[k]);drop('snd:'+k);miss.clear();refresh()};
   r.querySelector('.rs').onclick=async()=>{await DB.del('snd:'+k);drop('snd:'+k);refresh()}}}
 if(tab==='cfg'){
  pb.innerHTML=`<label>رمز الطفل <input id="f_child" value="${S.child}"></label>
  <label>عدد الصور في النشاط الأول <select id="f_count"><option ${S.count==2?'selected':''}>2</option><option ${S.count==3?'selected':''}>3</option></select></label>
  <label><input type="checkbox" id="f_hints" ${S.hints?'checked':''}> تفعيل التلميح (تلوين الصورة الصحيحة بعد محاولتين)</label>
  <label><input type="checkbox" id="f_tts" ${S.tts?'checked':''}> صوت المتصفح التجريبي عند غياب التسجيل (ليس بلهجة عُمانية)</label>
  <label><input type="checkbox" id="f_simple" ${S.simple?'checked':''}> عرض مبسط بدل ثلاثي الأبعاد</label>
  <label>الرقم السري <input id="f_pin" value="${S.pin}"></label><button class="p-btn main" id="sv">حفظ</button>`;
  document.getElementById('sv').onclick=e=>{save('cfg',{child:f_child.value.trim()||'C01',count:+f_count.value,hints:f_hints.checked,tts:f_tts.checked,simple:f_simple.checked,pin:f_pin.value||'1234'});e.target.textContent='تم الحفظ'}}
 if(tab==='prog'){
  const tr=load('trials',[]),kids=[...new Set(tr.map(x=>x.child))],c=pb.dataset.c||S.child;
  const rows=[1,2].map(a=>{const x=tr.filter(t=>t.child===c&&t.act===a),ind=x.filter(t=>t.ok&&!t.tries&&!t.hint).length,h=x.filter(t=>t.hint).length;return`<tr><td>${a==1?'التعرف إلى الصور':'طلب الاحتياجات'}</td><td>${x.length}</td><td>${ind}</td><td>${h}</td><td>${x.length?(x.reduce((s,t)=>s+t.tries,0)/x.length).toFixed(1):'-'}</td></tr>`}).join('');
  pb.innerHTML=`<p>الطفل: <b>${c}</b> ${kids.length?'(الأطفال المسجلون: '+kids.join('، ')+')':''}</p><table><tr><th>النشاط</th><th>الاستجابات</th><th>صحيحة باستقلال</th><th>بتلميح</th><th>متوسط الأخطاء</th></tr>${rows}</table><div class="note">النجاح داخل التطبيق لا يعني تلقائيًا اكتساب التواصل الوظيفي. الحكم على التعميم يكون من تسجيل جلسات التطبيق الواقعي في تبويب «الجلسات».</div>`}
 if(tab==='ses'){
  const ss=load('sessions',[]),pct=(c,t)=>{const x=ss.filter(s=>s.child===c&&s.type===t);return x.length?Math.round(100*x.filter(s=>s.indep).length/x.length)+'% (من '+x.length+')':null};
  const cmp=[...new Set(ss.map(s=>s.child))].map(c=>{const a=pct(c,'قبلي'),b=pct(c,'بعدي');return a&&b?`<tr><td>${c}</td><td>${a}</td><td>${b}</td></tr>`:''}).join('');
  pb.innerHTML=`<h3>تسجيل ملاحظة جلسة</h3><label>النوع <select id="s_t">${TYPES.map(t=>`<option>${t}</option>`).join('')}</select></label>
  <label>العبارة <select id="s_i">${ITEMS.map(i=>`<option value="${i.id}">${i.p}</option>`).join('')}</select></label>
  <label><input type="checkbox" id="s_a"> استخدم البطاقة بصورة مستقلة</label><label><input type="checkbox" id="s_h"> احتاج إلى تلميح</label>
  <label><input type="checkbox" id="s_e"> عبّر عن حاجته</label><label><input type="checkbox" id="s_m"> كرر المهارة في المنزل</label>
  <label>ملاحظات<br><textarea id="s_n" rows="2" cols="40"></textarea></label><button class="p-btn main" id="s_sv">حفظ</button>
  <h3>مقارنة القبلي والبعدي (نسبة الأداء المستقل)</h3>${cmp?`<table><tr><th>الطفل</th><th>قبلي</th><th>بعدي</th></tr>${cmp}</table>`:'<p>لا توجد بيانات كافية: أدخل جلسات قبلية وبعدية فعلية أولًا.</p>'}
  <h3>السجل</h3><table><tr><th>التاريخ</th><th>الطفل</th><th>النوع</th><th>العبارة</th><th>مستقل</th><th>تلميح</th><th>عبّر</th><th>المنزل</th><th></th></tr>${ss.map((s,i)=>`<tr><td>${s.t.slice(0,10)}</td><td>${s.child}</td><td>${s.type}</td><td>${item(s.item).n}</td><td>${s.indep?'✓':''}</td><td>${s.hint?'✓':''}</td><td>${s.expr?'✓':''}</td><td>${s.home?'✓':''}</td><td><button data-d="${i}">حذف</button></td></tr>`).join('')}</table>`;
  document.getElementById('s_sv').onclick=()=>{ss.push({t:new Date().toISOString(),child:S.child,type:s_t.value,item:s_i.value,indep:s_a.checked,hint:s_h.checked,expr:s_e.checked,home:s_m.checked,note:s_n.value});save('sessions',ss);refresh()};
  pb.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{ss.splice(+b.dataset.d,1);save('sessions',ss);refresh()})}
 if(tab==='exp'){
  pb.innerHTML=`<div class="note">الصور والأصوات المرفوعة تبقى في هذا المتصفح. لإدراجها في GitHub نزّلها هنا، ثم ضعها في مجلدي images/ و sounds/ وارفع التغييرات.</div>
  <p><button class="p-btn main" id="e1">نتائج التدريب (CSV – يفتح في Excel)</button> <button class="p-btn main" id="e2">الجلسات (CSV)</button> <button class="p-btn" id="e3">نسخة احتياطية (JSON)</button></p>
  <p><button class="p-btn main" id="e4">تنزيل الصور والأصوات المضافة</button></p>`;
  document.getElementById('e1').onclick=()=>dl('trials.csv',csv([['time','child','activity','item','errors','hint','correct'],...load('trials',[]).map(t=>[t.t,t.child,t.act,t.item,t.tries,t.hint?1:0,t.ok?1:0])]));
  document.getElementById('e2').onclick=()=>dl('sessions.csv',csv([['date','child','type','item','independent','hint','expressed','home','note'],...load('sessions',[]).map(s=>[s.t,s.child,s.type,s.item,+s.indep,+s.hint,+s.expr,+s.home,s.note])]));
  document.getElementById('e3').onclick=()=>dl('bayt-backup.json',new Blob([JSON.stringify({cfg:load('cfg',{}),trials:load('trials',[]),sessions:load('sessions',[])})]));
  document.getElementById('e4').onclick=async e=>{let i=0;for(const k of keys){const b=await DB.get(k),name=k.startsWith('img:')?k.slice(4)+'.png':k.slice(4)+'.'+((b.type.split('/')[1]||'mp3').replace('mpeg','mp3').replace('x-m4a','m4a').replace('mp4','m4a').replace('x-wav','wav'));setTimeout(()=>dl(name,b),i++*500)}if(!keys.length)e.target.textContent='لا توجد وسائط مضافة'}}}

// ---------- التوجيه ----------
const R={'':home,'/':home,'/a1':a1,'/a2':a2,'/a3':()=>a3(),'/panel':()=>panel()};
function route(){stopAudio();(R[location.hash.slice(1)]||home)()}
addEventListener('hashchange',route);route();
if('serviceWorker'in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('sw.js').catch(()=>{});
