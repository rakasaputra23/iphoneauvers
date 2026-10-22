(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* =====================================================================
   CERITA: ubah bagian ini saja untuk mengganti isi ponsel.
   ===================================================================== */
const STORY={
  date:{y:2026,m:10,d:17},                       // tanggal "hari ini" di dalam cerita
  weather:{city:'Madiun',now:18,hi:21,lo:12,text:'Sebagian Besar Cerah'},
  agenda:['Belanja','Cuci baju'],
  birthday:{who:'Rara',m:11,d:21},
  contact:{name:'Rara',emoji:'🌼',initial:'H'},
  notifyFirst:2,                                 // berapa pesan pertama yang masuk sebagai notifikasi
  history:[
    {stamp:'<b>Jumat</b> 21.40'},
    {from:'in',text:'Besok jadi ke pasar malam kan?'},
    {from:'me',text:'Jadi dong. Jam berapa?'},
    {from:'in',text:'Jam 4 sore ya, jangan telat 😤'},
    {from:'me',text:'Siap, siap 👌'}
  ],
  script:[
    {from:'in',text:'Heii, udah bangun belum? 🌼'},
    {from:'in',text:'Aku nemu sesuatu di lemari kamarku. Kamu pasti kaget deh'},
    {from:'in',text:'Kaset rekaman waktu SMA dulu, yang kamu nyanyi itu'},
    {from:'me',text:'Hah?? Jangan diputar dulu! 😭'},
    {from:'in',text:'Terlambat, udah kuputar wkwk'},
    {from:'in',text:'Suaramu fals banget tapi lucu 😆'},
    {from:'me',text:'Tunggu di situ, aku ke sana sekarang!'},
    {from:'in',text:'Oke, kutunggu. Bawa gorengan ya 🌼'}
  ],
  others:[
    {name:'Mama',type:'person',text:'Jangan lupa makan ya, Nak 🍚',time:'Jumat'},
    {name:'Pengumuman Penjas',type:'group',count:38,text:'Siap',time:'Kemarin',unread:3},
    {name:'Grup Futsal',type:'group',count:14,text:'Dimas: Besok jadi kan? Lapangan udah kupesan',time:'Kamis'},
    {name:'Kak Diandra',type:'person',text:'Fotonya udah kukirim lewat email ya',time:'Selasa'}
  ]
};
/* ===================================================================== */

const MONTHS=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const DAYS=['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
const sd=STORY.date, wd=DAYS[new Date(sd.y,sd.m-1,sd.d).getDay()];
const bdDays=(()=>{const a=Date.UTC(sd.y,sd.m-1,sd.d);let b=Date.UTC(sd.y,STORY.birthday.m-1,STORY.birthday.d);if(b<a)b=Date.UTC(sd.y+1,STORY.birthday.m-1,STORY.birthday.d);return Math.round((b-a)/864e5)})();
const C=STORY.contact, CN=C.name+' '+C.emoji;

/* ---------- ikon ---------- */
const petals=['#f9a825','#f4511e','#d81b60','#8e24aa','#3f7df4','#26c6da','#43a047','#c0ca33'].map((c,i)=>`<ellipse cx="30" cy="19" rx="7.5" ry="11" fill="${c}" fill-opacity=".85" transform="rotate(${i*45} 30 30)" style="mix-blend-mode:multiply"/>`).join('');
const ticks=Array.from({length:12},(_,i)=>`<line x1="30" y1="8" x2="30" y2="${i%3?10.5:12}" stroke="#000" stroke-width="${i%3?1:1.6}" transform="rotate(${i*30} 30 30)"/>`).join('');
const IC={
  kamera:{bg:'linear-gradient(#6e6e75,#3a3a40)',svg:'<path d="M14 22h8l3-5h10l3 5h8a3 3 0 0 1 3 3v19a3 3 0 0 1-3 3H14a3 3 0 0 1-3-3V25a3 3 0 0 1 3-3z" fill="#e9e9ee"/><circle cx="30" cy="34" r="9" fill="#3a3a40"/><circle cx="30" cy="34" r="5.5" fill="#6c7bd6"/>'},
  foto:{bg:'#fff',svg:petals},
  mail:{bg:'linear-gradient(#45b3ff,#1675ff)',svg:'<rect x="11" y="16" width="38" height="28" rx="4" fill="#fff"/><path d="M13 20l17 13 17-13" fill="none" stroke="#1675ff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>'},
  jam:{bg:'#000',svg:`<circle cx="30" cy="30" r="25" fill="#fff"/>${ticks}<line class="hh" x1="30" y1="30" x2="30" y2="18" stroke="#000" stroke-width="2.6" stroke-linecap="round"/><line class="mh" x1="30" y1="30" x2="30" y2="11" stroke="#000" stroke-width="2" stroke-linecap="round"/><line class="sh" x1="30" y1="34" x2="30" y2="9" stroke="#ff9500" stroke-width="1.1"/><circle cx="30" cy="30" r="2" fill="#ff9500"/>`},
  catatan:{bg:'#fff',svg:'<rect width="60" height="17" fill="#ffd60a"/><path d="M5 28h50M5 37h50M5 46h50M5 55h50" stroke="#e1e1e6" stroke-width="1.2"/>'},
  cuaca:{bg:'linear-gradient(#3f93f2,#2a63d6)',svg:'<circle cx="22" cy="23" r="9" fill="#ffd60a"/><path d="M20 45a8 8 0 0 1-1.2-15.9 11 11 0 0 1 21.3 2.1A7 7 0 0 1 42 45z" fill="#fff"/>'},
  pengaturan:{bg:'linear-gradient(#a9a9af,#6e6e74)',svg:'<circle cx="30" cy="30" r="19" fill="none" stroke="#e8e8ed" stroke-width="6" stroke-dasharray="5 5.9"/><circle cx="30" cy="30" r="14" fill="none" stroke="#e8e8ed" stroke-width="7"/><circle cx="30" cy="30" r="6.5" fill="#76767c"/>'},
  peta:{bg:'#f1ead8',svg:'<rect y="38" width="26" height="22" fill="#bfe3a8"/><path d="M0 16h60v8H0z" fill="#fff"/><path d="M-4 48L64 14" stroke="#ffd45c" stroke-width="5"/><path d="M36 0v60" stroke="#fff" stroke-width="5"/><path d="M30 10a9 9 0 0 1 9 9c0 7-9 17-9 17s-9-10-9-17a9 9 0 0 1 9-9z" fill="#ff3b30"/><circle cx="30" cy="19" r="3.4" fill="#fff"/>'},
  telepon:{bg:'linear-gradient(#66e381,#22b83f)',svg:'<path d="M21 14c-2 .5-4 2.6-3.6 5.8 1.2 9.3 9.3 17.4 18.6 18.6 3.2.4 5.3-1.6 5.8-3.6l.3-2.2c.1-.8-.4-1.5-1.1-1.8l-5.2-2.1c-.7-.3-1.5-.1-2 .5l-2 2.4c-4.2-1.7-8.1-5.6-9.8-9.8l2.4-2c.6-.5.8-1.3.5-2L24.8 13.5c-.3-.7-1-1.2-1.8-1.1z" fill="#fff"/>'},
  safari:{bg:'linear-gradient(#fafafc,#d9d9de)',svg:'<circle cx="30" cy="30" r="22" fill="#2f8bff"/><circle cx="30" cy="30" r="22" fill="none" stroke="#fff" stroke-width="1.6" stroke-dasharray="1 5.5"/><g transform="rotate(45 30 30)"><path d="M30 12l5.5 18h-11z" fill="#ff3b30"/><path d="M30 48l-5.5-18h11z" fill="#eef0f5"/></g>'},
  pesan:{bg:'linear-gradient(#4be57f,#1fb855)',svg:'<path d="M30 11.5a18.5 18.5 0 0 0-15.9 28L11.5 48.5l9.3-2.5A18.5 18.5 0 1 0 30 11.5z" fill="none" stroke="#fff" stroke-width="3.4" stroke-linejoin="round"/><path d="M24.2 22c-.9 0-2 1.3-2 3 0 4.2 5.6 9.8 10.2 10.6 1.8.3 3.2-1 3.4-2.2l-3.2-1.7-1.4 1.2c-2.1-.9-4-2.800-4.900-4.900l1.200-1.400-1.700-3.200z" fill="#fff"/>'},
  musik:{bg:'linear-gradient(#ff6c84,#f6213a)',svg:'<path d="M40 14L24 18v20.5A6 6 0 1 0 28 44V25l8-2v10.5A6 6 0 1 0 40 39z" fill="#fff"/>'},
  pengingat:{bg:'#fff',svg:'<circle cx="15" cy="19" r="4.2" fill="#ff9500"/><rect x="24" y="17" width="22" height="4" rx="2" fill="#d1d1d6"/><circle cx="15" cy="31" r="4.2" fill="#0b7bff"/><rect x="24" y="29" width="22" height="4" rx="2" fill="#d1d1d6"/><circle cx="15" cy="43" r="4.2" fill="#ff3b30"/><rect x="24" y="41" width="22" height="4" rx="2" fill="#d1d1d6"/>'}
};
function ic(id,s){
  const st=s?`--s:${s}px;`:'';
  if(id==='kalender')return `<span class="ic cal" style="${st}"><small>${wd}</small><b>${sd.d}</b></span>`;
  const o=IC[id];return `<span class="ic" style="${st}background:${o.bg}"><svg viewBox="0 0 60 60">${o.svg}</svg></span>`;
}

/* ---------- audio & getar ---------- */
let ac=null,soundOn=true;
function actx(){if(!ac){try{ac=new(window.AudioContext||window.webkitAudioContext)()}catch(e){}}if(ac&&ac.state==='suspended')ac.resume();return ac}
function tone(fr,o={}){if(!soundOn)return;const a=actx();if(!a)return;const vol=o.vol||.05,dur=o.dur||.14,gap=o.gap||.11;fr.forEach((f,i)=>{const t=a.currentTime+i*gap,os=a.createOscillator(),g=a.createGain();os.type='sine';os.frequency.value=f;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+dur+.22);os.connect(g);g.connect(a.destination);os.start(t);os.stop(t+dur+.3)})}
const buzz=()=>{try{navigator.vibrate&&navigator.vibrate(18)}catch(e){}};
addEventListener('pointerdown',()=>actx(),{once:true});

/* ---------- elemen & ukuran ---------- */
const screenEl=$('#screen'),home=$('#home'),lock=$('#lock'),banner=$('#banner'),homeBtn=$('#homeBtn'),sbt=$('#sbt');
function setHome(on){homeBtn.hidden=!on;sbt.hidden=on}
let scale=1;
function fit(){
  const m=innerWidth<520;
  document.body.classList.toggle('m',m);
  const sa=!!(navigator.standalone||matchMedia('(display-mode: standalone)').matches);
  document.body.classList.toggle('sa',m&&sa);
  scale=m?1:Math.min(1,(innerHeight-28)/876,(innerWidth-28)/417);
  document.documentElement.style.setProperty('--k',scale);
  drawWall();
}

/* ---------- wallpaper galaksi (dibuat di canvas) ---------- */
function drawWall(){
  const c=$('#wall'),w=screenEl.clientWidth||393,h=screenEl.clientHeight||852,d=Math.min(2,devicePixelRatio||1);
  c.width=w*d;c.height=h*d;const g=c.getContext('2d');g.scale(d,d);
  let s=11;const rnd=()=>{s=(s*16807)%2147483647;return s/2147483647};
  g.fillStyle='#0b070e';g.fillRect(0,0,w,h);
  const pal=['255,255,255','255,226,180','255,186,150','250,170,205','170,200,255','255,240,215'];
  for(let i=0;i<52;i++){
    const x=rnd()*w,y=rnd()*h,r=3+Math.pow(rnd(),2)*22,col=pal[(rnd()*pal.length)|0];
    g.save();g.translate(x,y);g.rotate(rnd()*3.14);g.scale(1,.32+rnd()*.5);
    const gr=g.createRadialGradient(0,0,0,0,0,r);
    gr.addColorStop(0,`rgba(${col},.95)`);gr.addColorStop(.3,`rgba(${col},.3)`);gr.addColorStop(1,`rgba(${col},0)`);
    g.fillStyle=gr;g.beginPath();g.arc(0,0,r,0,6.283);g.fill();g.restore();
  }
  for(let i=0;i<1300;i++){
    const x=rnd()*w,y=rnd()*h,r=.3+rnd()*rnd()*1.3;
    g.fillStyle=`rgba(${pal[(rnd()*pal.length)|0]},${.25+rnd()*.7})`;
    g.beginPath();g.arc(x,y,r,0,6.283);g.fill();
  }
  const v=g.createRadialGradient(w/2,h/2,h*.25,w/2,h/2,h*.75);
  v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.45)');g.fillStyle=v;g.fillRect(0,0,w,h);
}

/* ---------- isi statis ---------- */
$('#lkd').textContent=`${wd}, ${sd.d} ${MONTHS[sd.m-1]}`;
$('#lkw').textContent=`${STORY.weather.city} · ${STORY.weather.now}° · Cerah`;
$('#wcd').textContent=wd;$('#wcn').textContent=sd.d;
$('#wca').innerHTML=STORY.agenda.map(a=>`<li><i></i><div><strong>${esc(a)}</strong><span>Sepanjang hari</span></div></li>`).join('');
$('#wxc').textContent=STORY.weather.city;$('#wxt').textContent=STORY.weather.now+'°';
$('#wxs').textContent=STORY.weather.text;$('#wxr').textContent=`T:${STORY.weather.hi}° R:${STORY.weather.lo}°`;
$('#lkn').innerHTML=`<div class="notif">${ic('pengingat')}<div class="bt"><div class="bh"><span>Ulang Tahun ${esc(STORY.birthday.who)} 🎂</span><time>sekarang</time></div><p>${STORY.birthday.d} ${MONTHS[STORY.birthday.m-1]} · ${bdDays} hari lagi</p></div></div>`;

const APPS=[['kamera','Kamera'],['foto','Foto'],['mail','Mail',2],['kalender','Kalender'],['jam','Jam'],['catatan','Catatan'],['cuaca','Cuaca'],['pengaturan','Pengaturan'],['peta','Peta']];
const DOCK=[['telepon','Telepon',3],['safari','Safari'],['pesan','WhatsApp',0],['musik','Musik']];
const icoHTML=([id,l,b])=>`<button class="ico" type="button" data-app="${id}"><span class="wrap">${ic(id)}<em class="badge" ${b?'':'hidden'}>${b||''}</em></span><span class="lbl">${l}</span></button>`;
$('#grid').innerHTML=APPS.map(icoHTML).join('');
$('#dock').innerHTML=DOCK.map(icoHTML).join('');
const pesanBtn=$('#dock [data-app="pesan"]');

/* ---------- jam ---------- */
let lastMin='';
function tick(){
  const d=new Date(),t=`${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`;
  if(t!==lastMin){lastMin=t;$('#sbt').textContent=t;$('#lkt').textContent=t}
  const h=d.getHours()%12+d.getMinutes()/60,m=d.getMinutes()+d.getSeconds()/60,sc=d.getSeconds();
  [['.hh',h*30],['.mh',m*6],['.sh',sc*6]].forEach(([q,a])=>{const e=$('#grid '+q);if(e)e.setAttribute('transform',`rotate(${a} 30 30)`)});
}

/* ---------- navigasi: kunci, aplikasi ---------- */
let locked=true,cur=null,storyStarted=false;
function setLight(on){screenEl.classList.toggle('lt',on)}
function unlock(){
  if(!locked)return;locked=false;
  lock.style.transform='translateY(-106%)';lock.style.opacity='0';lock.classList.add('gone');
  screenEl.classList.remove('locked');
  if(!storyStarted){storyStarted=true;setTimeout(runStory,2400)}
}
function lockNow(){
  if(locked)return;
  if(cur)closeApp(true);
  locked=true;hidePin();hideBanner();
  lock.style.transform='';lock.style.opacity='';lock.classList.remove('gone');
  screenEl.classList.add('locked');setLight(false);
}
let drag=null;
lock.addEventListener('pointerdown',e=>{drag={y:e.clientY,dy:0};lock.setPointerCapture(e.pointerId);lock.style.transition='none'});
lock.addEventListener('pointermove',e=>{if(!drag)return;drag.dy=Math.max(0,(drag.y-e.clientY)/scale);lock.style.transform=`translateY(${-drag.dy}px)`;lock.style.opacity=String(1-drag.dy/700)});
lock.addEventListener('pointerup',e=>{
  if(!drag)return;const dy=drag.dy;drag=null;lock.style.transition='';
  const hit=document.elementFromPoint(e.clientX,e.clientY);
  if(dy>90||(dy<6&&hit&&hit.closest('.lk-hint'))){lock.style.transform='';lock.style.opacity='';showPin()}
  else{lock.style.transform='';lock.style.opacity=''}
});
lock.addEventListener('pointercancel',()=>{drag=null;lock.style.transition='';lock.style.transform='';lock.style.opacity=''});

/* ---------- kode sandi ---------- */
const PIN='5106';let pinBuf='',pinOpen=false,pinBusy=false;
const pinEl=$('#pin'),pinD=$('#pin-d'),pinT=$('#pin-t'),pinC=$('#pin-c');
const LETTERS={2:'ABC',3:'DEF',4:'GHI',5:'JKL',6:'MNO',7:'PQRS',8:'TUV',9:'WXYZ'};
$('#pin-k').innerHTML=[1,2,3,4,5,6,7,8,9,'',0,''].map(n=>n===''?'<span></span>':`<button type="button" class="pk" data-n="${n}"><b>${n}</b><small>${LETTERS[n]||''}</small></button>`).join('');
function paintPin(){[...pinD.children].forEach((d,i)=>d.classList.toggle('f',i<pinBuf.length));pinC.textContent=pinBuf.length?'Hapus':'Batal'}
function showPin(){if(!locked||pinOpen)return;pinOpen=true;pinBuf='';paintPin();pinT.textContent='Masukkan Kode Sandi';pinEl.classList.add('on');tone([1400],{vol:.012,dur:.02})}
function hidePin(){pinOpen=false;pinEl.classList.remove('on');pinBuf='';paintPin()}
async function pinKey(n){
  if(!pinOpen||pinBusy)return;
  if(n==='del'){pinBuf=pinBuf.slice(0,-1);paintPin();return}
  if(pinBuf.length>=4)return;
  pinBuf+=n;paintPin();tone([1900],{vol:.012,dur:.015});
  if(pinBuf.length<4)return;
  pinBusy=true;await sleep(200);
  if(pinBuf===PIN){hidePin();pinBusy=false;unlock();return}
  buzz();pinD.classList.add('shake');pinT.textContent='Kode sandi salah. Coba lagi';
  await sleep(480);pinD.classList.remove('shake');pinBuf='';paintPin();pinBusy=false;
}
$('#pin-k').addEventListener('click',e=>{const b=e.target.closest('.pk');if(b)pinKey(b.dataset.n)});
pinC.addEventListener('click',()=>pinBuf.length?pinKey('del'):hidePin());
addEventListener('keydown',e=>{if(!pinOpen)return;if(/^\d$/.test(e.key))pinKey(e.key);else if(e.key==='Backspace')pinKey('del');else if(e.key==='Escape')hidePin()});

const hb=$('#hb');let hbY=null;
hb.addEventListener('pointerdown',e=>{hbY=e.clientY;hb.setPointerCapture(e.pointerId)});
hb.addEventListener('pointerup',e=>{
  if(hbY===null)return;const dy=hbY-e.clientY;hbY=null;
  if(dy>28||Math.abs(dy)<6){if(locked){if(!pinOpen)showPin()}else if(cur)closeApp()}
});

const appEls={pesan:$('#app-pesan'),pengaturan:$('#app-set'),ph:$('#app-ph')};
function openApp(id,btn){
  if(cur||locked)return;
  let el=appEls[id];
  if(!el){
    el=appEls.ph;const lbl=(APPS.concat(DOCK).find(a=>a[0]===id)||[id,id])[1];
    el.innerHTML=`<div class="ph-c">${ic(id,96)}<h2>${esc(lbl)}</h2><p>Aplikasi ini belum tersedia.</p></div>`;
  }
  cur={id,el};setHome(true);
  const r=btn.getBoundingClientRect(),s=screenEl.getBoundingClientRect();
  el.style.transformOrigin=`${(r.left+r.width/2-s.left)/scale}px ${(r.top+r.height/2-s.top)/scale}px`;
  el.classList.add('pre');el.hidden=false;void el.offsetWidth;el.classList.remove('pre');
  home.classList.add('under');
  setLight(id==='pesan'||id==='pengaturan');
  if(id==='pesan')onPesanOpen();
  tone([1400],{vol:.012,dur:.02});
}
function closeApp(fast){
  if(!cur)return;const {id,el}=cur;cur=null;setHome(false);
  el.classList.add('pre');home.classList.remove('under');setLight(false);
  const done=()=>{el.hidden=true;if(id==='pesan')resetPesanViews()};
  fast?done():setTimeout(done,430);
}
document.addEventListener('click',e=>{const b=e.target.closest('.ico');if(b)openApp(b.dataset.app,b.querySelector('.ic'))});
$('#power').addEventListener('click',()=>locked?(pinOpen?hidePin():showPin()):lockNow());
homeBtn.addEventListener('click',()=>closeApp());

/* ---------- banner & notifikasi ---------- */
let bannerT=null,bannerTap=null;
function showBanner(title,body,onTap){
  banner.innerHTML=`${ic('pesan')}<div class="bt"><div class="bh"><span>${esc(title)}</span><time>sekarang</time></div><p>${esc(body)}</p></div>`;
  bannerTap=onTap;banner.classList.add('show');clearTimeout(bannerT);bannerT=setTimeout(hideBanner,5000);
}
function hideBanner(){banner.classList.remove('show');clearTimeout(bannerT)}
let bY=null;
banner.addEventListener('pointerdown',e=>{bY=e.clientY;banner.setPointerCapture(e.pointerId)});
banner.addEventListener('pointermove',e=>{if(bY!==null&&bY-e.clientY>14){bY=null;hideBanner()}});
banner.addEventListener('pointerup',()=>{if(bY!==null){bY=null;hideBanner();bannerTap&&bannerTap()}});
function lockNotif(title,body){
  const n=document.createElement('div');n.className='notif';
  n.innerHTML=`${ic('pesan')}<div class="bt"><div class="bh"><span>${esc(title)}</span><time>sekarang</time></div><p>${esc(body)}</p></div>`;
  $('#lkn').appendChild(n);
}
function notify(title,body){
  buzz();tone([1319,1760,2093],{vol:.06,dur:.12,gap:.1});
  if(locked)lockNotif(title,body);else showBanner(title,body,openThreadAnywhere);
}

/* ---------- Pesan ---------- */
const th=$('#th'),ml=$('#ml'),box=$('#msgs'),kb=$('#kb'),tx=$('#tx'),ph=$('#ph'),sendb=$('#sendb'),micb=$('#micb'),hint=$('#hint');
let threadShown=false,unread=0,lastFrom=null,lastB=null,typingEl=null,rcpt=null,reply=null,kbDown=null,auto=false;
const fmt=d=>`${d.getHours()}.${String(d.getMinutes()).padStart(2,'0')}`;
const TKA='fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"';
const TK={
  sent:`<svg viewBox="0 0 16 11" width="15" height="11" ${TKA} stroke="#667781"><path d="M1.5 5.8l3.2 3.2L11.5 1.6"/></svg>`,
  read:`<svg viewBox="0 0 16 11" width="15" height="11" ${TKA} stroke="#53bdeb"><path d="M1 5.8l3.2 3.2L10.6 1.6M6.4 8.8l.7.4L14.4 1.6"/></svg>`
};
$('#thav').textContent=C.initial;$('#thnm').textContent=CN;

function stamp(html){const s=document.createElement('div');s.className='stamp';s.innerHTML=html;box.appendChild(s);lastFrom=null;lastB=null}
function bubble(from,text,anim,time,tk){
  const el=document.createElement('div');
  el.className=`b ${from}`+(lastB&&lastFrom===from?'':' tail')+(anim?' pop':'');
  const t=document.createElement('span');t.className='t';t.textContent=text;el.appendChild(t);
  const mt=document.createElement('span');mt.className='mt';mt.innerHTML=(time||fmt(new Date()))+(from==='me'?TK[tk||'sent']:'');el.appendChild(mt);
  if(lastB&&lastFrom!==from)el.classList.add('gap');
  box.appendChild(el);lastFrom=from;lastB=el;return el;
}
function showTyping(){if(typingEl)return;typingEl=1;const s=$('#thst');s.textContent='sedang mengetik…';s.classList.add('ty')}
function hideTyping(){typingEl=null;const s=$('#thst');s.textContent='online';s.classList.remove('ty')}
function scrollEnd(smooth){box.scrollTo({top:box.scrollHeight,behavior:smooth?'smooth':'auto'})}
/* true bila chat sedang berada di dasar (pengguna belum scroll ke atas) */
const atBottom=()=>box.scrollHeight-box.scrollTop-box.clientHeight<90;
new ResizeObserver(()=>{ if(stickBottom) scrollEnd(false) }).observe(box);
let stickBottom=true;
box.addEventListener('scroll',()=>{ stickBottom=atBottom() },{passive:true});

const cvs=$('#cvs');
let liveRow=null;
const OTHER_UN=STORY.others.reduce((a,o)=>a+(o.unread||0),0);
const AVP='<svg viewBox="0 0 24 24" fill="#fff"><circle cx="12" cy="9" r="4.2"/><path d="M3.8 21c0-4.4 3.7-7 8.2-7s8.2 2.6 8.2 7z"/></svg>';
const AVG='<svg viewBox="0 0 24 24" fill="#fff"><circle cx="8.2" cy="9" r="3.2"/><circle cx="15.8" cy="9" r="3.2"/><path d="M2 19.5c0-3.4 2.8-5.4 6.2-5.4s6.2 2 6.2 5.4zM13.6 14.3c.7-.2 1.4-.3 2.2-.3 3.4 0 6.2 2 6.2 5.5h-6.4c0-2-.8-3.8-2-5.2z"/></svg>';
function rowHTML(o,live){
  const av=live?`<span class="av" style="background:linear-gradient(#f6a1b8,#e86c92)">${esc(C.initial)}</span>`:`<span class="av ph">${o.type==='group'?AVG:AVP}</span>`;
  const ub=live?0:(o.unread||0),pre=o.mine?TK.read:'';
  return `<button class="cv${ub?' un':''}" type="button"${live?' id="cv-live"':''}>${av}<span class="tx2"><span class="l1"><b class="nm">${esc(o.name)}</b><span class="tm"${live?' id="cvt"':''}>${esc(o.time)}</span></span><span class="l2"><span class="pv"${live?' id="cvp"':''}>${pre}${esc(o.text)}</span><i class="ub"${live?' id="cvb"':''} ${ub?'':'hidden'}>${ub||''}</i></span></span></button>`;
}
function paintUb(){const u=$('#cvb');if(!u)return;u.textContent=unread;u.hidden=unread<1;liveRow&&liveRow.classList.toggle('un',unread>0)}
function buildList(){
  cvs.innerHTML=rowHTML({name:CN,text:lastLiveText(),time:'Jumat',mine:(STORY.history.filter(x=>x.text).slice(-1)[0]||{}).from==='me'},true)+STORY.others.map(o=>rowHTML(o,false)).join('');
  liveRow=$('#cv-live');liveRow.addEventListener('click',showThread);
}
function lastLiveText(){const h=STORY.history.filter(x=>x.text);return h.length?h[h.length-1].text:''}
function setLiveRow(text,time,mine){
  $('#cvp').innerHTML=(mine?TK.read:'')+esc(text);
  if(time)$('#cvt').textContent=time==='sekarang'?fmt(new Date()):time;
  paintUb();
}
function updateBadge(){
  const b=pesanBtn.querySelector('.badge'),n=unread+OTHER_UN;b.textContent=n;b.hidden=n<1;const tb=$('#tabbadge');if(tb){tb.textContent=n;tb.hidden=n<1}
  paintUb();
}

function initThread(){
  $('#bkn').textContent=OTHER_UN||'';
  const en=document.createElement('div');en.className='enc';en.textContent='🔒 Pesan dan panggilan terenkripsi secara end-to-end. Tidak ada pihak di luar chat ini, bahkan WhatsApp, yang dapat membaca atau mendengarkannya.';box.appendChild(en);
  let mi=40;STORY.history.forEach(h=>h.stamp?stamp(h.stamp):bubble(h.from,h.text,false,'21.'+(mi++),'read'));
}
function showThread(){
  threadShown=true;th.classList.add('show');ml.classList.add('back');
  unread=0;updateBadge();
  stickBottom=true;
  setTimeout(()=>scrollEnd(false),50);
}
function hideThread(){threadShown=false;th.classList.remove('show');ml.classList.remove('back');hideKb(true)}
function resetPesanViews(){threadShown=false;th.classList.remove('show');ml.classList.remove('back');hideKb(true)}
function onPesanOpen(){}
$('#back').addEventListener('click',hideThread);
$('#wa-set').addEventListener('click',()=>{closeApp(true);openApp('pengaturan',$('#grid [data-app="pengaturan"] .ic'))});
const isOpen=()=>threadShown&&cur&&cur.id==='pesan';
function openThreadAnywhere(){
  if(locked)return;
  if(cur&&cur.id!=='pesan'){closeApp(true)}
  if(!cur)openApp('pesan',pesanBtn.querySelector('.ic'));
  showThread();
}

/* ---------- keyboard ---------- */
const LET=['qwertyuiop','asdfghjkl','zxcvbnm'];
const kl=c=>`<button class="k lt" type="button" data-k="${c}">${c}</button>`;
kb.innerHTML=`<div class="kb-in">
 <div class="kr">${[...LET[0]].map(kl).join('')}</div>
 <div class="kr r2">${[...LET[1]].map(kl).join('')}</div>
 <div class="kr"><button class="k sp wd" type="button" data-k="shift"><svg width="20" height="20" viewBox="0 0 20 20"><path d="M10 2L2 11h4.5v6h7v-6H18z" fill="none" stroke="#000" stroke-width="1.6" stroke-linejoin="round"/></svg></button>${[...LET[2]].map(kl).join('')}<button class="k sp wd" type="button" data-k="back"><svg width="24" height="18" viewBox="0 0 24 18"><path d="M8 1h13a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8L1 9z" fill="none" stroke="#000" stroke-width="1.5" stroke-linejoin="round"/><path d="M12 6l6 6M18 6l-6 6" stroke="#000" stroke-width="1.5" stroke-linecap="round"/></svg></button></div>
 <div class="kr r4"><button class="k sp w1" type="button" data-k="123">123</button><button class="k sm" type="button" data-k=" ">spasi</button><button class="k sp w2 sm" type="button" data-k="return">return</button></div>
 <div class="kb-foot"><svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke="#000" stroke-width="1.5" stroke-linecap="round"><circle cx="13" cy="13" r="10"/><circle cx="9.5" cy="11" r=".6" fill="#000"/><circle cx="16.5" cy="11" r=".6" fill="#000"/><path d="M8.5 15.5c1.2 2 7.8 2 9 0"/></svg><svg width="22" height="26" viewBox="0 0 24 26" fill="#000"><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5.5 12a6.5 6.5 0 0 0 13 0M12 19v3" stroke="#000" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg></div></div>`;
function showKb(){clearTimeout(kbDown);kb.classList.add('up');th.classList.add('kbup');setTimeout(()=>kb.classList.contains('up')&&kb.classList.add('done'),340)}
function hideKb(now){kb.classList.remove('done');kb.classList.remove('up');th.classList.remove('kbup')}

/* ---------- mengetik otomatis & mengirim ---------- */
/* Aturan:
   - Pengguna BEBAS membuka keyboard (ketuk kolom pesan) kapan saja, juga saat lawan bicara mengetik.
   - Tombol keyboard hanya memberi efek tekan + suara; teks yang ditekan pengguna TIDAK muncul.
   - Teks di kolom hanya berasal dari cerita: muncul mengetik sendiri setelah lawan mengirim pesan,
     tidak bisa diubah, dan baru terkirim saat pengguna menekan tombol kirim (atau return). */
function paintField(){
  const n=reply?reply.n:0,all=reply&&n>=reply.chars.length;
  tx.textContent=reply?reply.chars.slice(0,n).join(''):'';
  ph.hidden=n>0;
  micb.hidden=n>0;$('#camb').hidden=n>0;sendb.hidden=n===0;sendb.classList.toggle('on',!!all);
}
function send(){
  if(!reply||reply.n<reply.chars.length)return;
  const text=reply.chars.join(''),done=reply.done;reply=null;paintField();
  stickBottom=true;
  const b=bubble('me',text,true);b.classList.add('pop');
  scrollEnd(true);tone([880,1320],{vol:.05,dur:.1,gap:.07});
  setLiveRow(text,'sekarang',true);
  const mt=b.querySelector('.mt');setTimeout(()=>{mt.innerHTML=fmt(new Date())+TK.read},1500);
  setTimeout(hideKb,350);
  done();
}
sendb.addEventListener('pointerdown',e=>{e.preventDefault();send()});
function keyEl(c){
  if(c===' ')return kb.querySelector('[data-k=" "]');
  const l=c.toLowerCase();
  if(/[a-z]/.test(l))return kb.querySelector(`[data-k="${l}"]`);
  if(/[0-9]/.test(l))return kb.querySelector('[data-k="123"]');
  return null;
}
function flash(k){if(!k)return;k.classList.add('down');setTimeout(()=>k.classList.remove('down'),95)}
async function autoType(){
  if(!reply||auto||reply.n>=reply.chars.length)return;auto=true;
  const r=reply;showKb();paintField();
  await sleep(450);
  while(reply===r&&r.n<r.chars.length){
    const c=r.chars[r.n];
    if(c!==c.toLowerCase()&&/[a-z]/i.test(c))flash(kb.querySelector('[data-k="shift"]'));
    flash(keyEl(c));tone([1900],{vol:.012,dur:.015});
    r.n++;paintField();
    await sleep((c===' '?70:48)+Math.random()*70);
  }
  if(reply!==r){auto=false;return}
  auto=false;paintField();
}
/* tombol keyboard: hanya efek tekan + suara. "return" mengirim bila balasan sudah selesai diketik. */
kb.addEventListener('pointerdown',e=>{
  const k=e.target.closest('.k');if(!k)return;e.preventDefault();
  flash(k);tone([1900],{vol:.012,dur:.015});
  if(k.dataset.k==='return'&&reply&&!auto&&reply.n>=reply.chars.length)send();
});
/* ketuk kolom pesan: keyboard selalu bisa dibuka (juga saat lawan sedang mengetik / mengirim pesan) */
document.querySelector('.comp').addEventListener('pointerdown',e=>{
  if(e.target.closest('.fldw'))showKb();
});
/* menyentuh area chat menutup keyboard seperti WhatsApp asli,
   kecuali saat balasan cerita sedang diketik otomatis */
box.addEventListener('pointerdown',()=>{ if(!auto) hideKb(); });

function playerReply(text){
  return new Promise(res=>{
    reply={chars:Array.from(text),n:0,done:res};
    paintField();
    autoType();            /* mengetik sendiri begitu giliran pengguna tiba */
  });
}

/* ---------- mesin cerita ---------- */
const typeMs=t=>Math.min(2600,650+Array.from(t).length*30);
async function untilOpen(){while(!isOpen())await sleep(180)}
function deliver(text,wantNotify){
  const open=isOpen();
  const keep=atBottom();                      /* hanya auto-scroll bila pengguna masih di dasar */
  const b=bubble('in',text,true);
  if(open){tone([1175,1568],{vol:.045,dur:.1,gap:.08});if(keep){stickBottom=true;scrollEnd(true)}setLiveRow(text,'sekarang')}
  else{unread++;updateBadge();setLiveRow(text,'sekarang');notify(CN,text)}
  return b;
}
async function runStory(){
  stamp(`<b>Hari Ini</b> ${fmt(new Date())}`);
  let notified=0;
  for(const st of STORY.script){
    if(st.from==='in'){
      if(notified<STORY.notifyFirst&&!isOpen()){
        await sleep(notified?2600:400);
        deliver(st.text,true);notified++;continue;
      }
      await untilOpen();
      showTyping();if(atBottom())scrollEnd(true);
      await sleep(typeMs(st.text));
      hideTyping();deliver(st.text,false);
      await sleep(700);
    }else{
      await untilOpen();await sleep(500);
      await playerReply(st.text);   /* menunggu pengguna menekan kirim */
      await sleep(1700);
    }
  }
  await untilOpen();
  if(atBottom())scrollEnd(true);
}

/* ---------- pengaturan ---------- */
$('#snd').addEventListener('click',()=>{soundOn=!soundOn;$('#swsnd').classList.toggle('on',soundOn)});
const again=()=>location.reload();
$('#reset').addEventListener('click',again);

/* ---------- mulai ---------- */
buildList();initThread();paintField();updateBadge();fit();tick();
setInterval(tick,1000);
addEventListener('resize',fit);
})();