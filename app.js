const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const LS={g:(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch{return d}},s:(k,v)=>localStorage.setItem(k,JSON.stringify(v))};
let P=LS.g('profile',null),ST=LS.g('st',{}),MY=LS.g('my',[]),ATT=LS.g('att',{}),tab='all',vm='a',sel='R',cus=[],km='a',REC=LS.g('rec',{}),mo=new Date(),md=null;
mo.setDate(1);
const DAYS=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],DS=DAYS.map(d=>d.slice(0,3));
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const subj=id=>SUBJECTS.find(s=>s.id===id)||{code:'Personal',title:'Personal',prof:''};
const t12=t=>{const[h,m]=t.split(':').map(Number);return(h%12||12)+':'+String(m).padStart(2,'0')+(h<12?' AM':' PM')};
const dt=d=>new Date(d).toLocaleString([],{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
const mm=t=>{const[h,m]=t.split(':').map(Number);return h*60+m},p2=n=>String(n).padStart(2,'0');

// ---------- Schedule helpers ----------
const subsOf=(p,c)=>p==='X'?SUBJECTS.filter(s=>c.includes(s.id)).map(s=>s.id):[...new Set(SLOTS.filter(s=>s.s.includes(p)).map(s=>s.sub))];
const slotsOf=(p,c)=>{const a=subsOf(p,c),k=p==='X'?'R':p;return SLOTS.filter(s=>a.includes(s.sub)&&s.s.includes(k))};
const mySubs=()=>subsOf(P.preset,P.custom),mySlots=()=>slotsOf(P.preset,P.custom);
const idxOf=no=>MASTER.findIndex(r=>r.no===no);
function attOf(sub,date){try{const m=view().att[date+'|'+sub],i=idxOf(P.me);if(!m||i<0)return null;return(BigInt('0x'+m)>>BigInt(i))&1n?'Present':'Absent'}catch{return null}}
const slotItem=(s,date)=>{const u=subj(s.sub),at=date?attOf(s.sub,date):null;return`<div class="item"><div><b>${u.code}</b> ${esc(u.title)}${at?` <span class="tag ${at==='Present'?'ok':'no'}">${at}</span>`:''}<br><small>${esc(u.prof)}${s.room==='TBA'?'':' | '+esc(s.room)}</small></div><small style="text-align:right">${t12(s.start)}<br>${t12(s.end)}</small></div>`};
function preview(p,c){
 const sl=slotsOf(p,c);
 return subsOf(p,c).map(id=>{const u=subj(id),w=sl.filter(s=>s.sub===id).sort((x,y)=>x.day-y.day).map(s=>`${DS[s.day]} ${t12(s.start)} to ${t12(s.end)}${s.room!=='TBA'?' ('+esc(s.room)+')':''}`).join('<br>');
  return`<div class="item"><div><b>${u.code}</b> ${esc(u.title)}<br><small>${esc(u.prof)}<br>${w}</small></div></div>`}).join('')||'<p class="mut">Pick at least one subject.</p>'}

// ---------- Navigation ----------
function show(v){
 if(v==='kiosk'&&!sessionStorage.getItem('pin')){if(prompt("Secretary's PIN")!==CONFIG.secretaryPin){alert('Wrong PIN');return}sessionStorage.setItem('pin','1')}
 $$('.view').forEach(e=>e.classList.toggle('on',e.id==='v-'+v));
 $$('nav button').forEach(b=>b.classList.toggle('on',b.dataset.v===v));window.scrollTo(0,0)}
$$('nav button').forEach(b=>b.onclick=()=>show(b.dataset.v));
$$('#tv button').forEach(b=>b.onclick=()=>{vm=b.dataset.m;$$('#tv button').forEach(x=>x.classList.toggle('on',x===b));renderTT()});

// ---------- Reminders (Notification API through the service worker) ----------
const NB=`<div class="row2"><div><b>Deadline reminders</b><small>24 hours and 2 hours before each unfinished task</small></div><button class="sw" type="button" role="switch" aria-label="Enable Deadline Reminders"></button></div>
<button class="pill tst" type="button">Send Test Notification</button>
<small>On iPhone: tap Share → Add to Home Screen first to enable notifications.</small><small class="nmsg"></small>`;
const canN=()=>'Notification' in window&&'serviceWorker' in navigator;
const nOn=()=>LS.g('notif',false)&&canN()&&Notification.permission==='granted';
const nMsg=t=>$$('.nmsg').forEach(e=>e.textContent=t);
const nDraw=()=>$$('.sw').forEach(b=>{b.classList.toggle('on',nOn());b.setAttribute('aria-checked',nOn())});
async function fire(title,body,tag){const r=await navigator.serviceWorker.ready;return r.showNotification(title,{body,tag,icon:'icon-192.png',badge:'icon-192.png'})}
async function ask(){
 if(!canN()){nMsg('This browser cannot show notifications. On iPhone, add the app to your Home Screen first.');return false}
 const p=Notification.permission==='granted'?'granted':await Notification.requestPermission();
 if(p!=='granted'){nMsg('Notifications are blocked. Allow them in your browser or phone settings.');return false}return true}
async function toggleN(){
 if(nOn()){LS.s('notif',false);nDraw();nMsg('Reminders off.');return}
 if(await ask()){LS.s('notif',true);nMsg('Reminders on. They show up when the app is open or running in the background.');checkN()}nDraw()}
async function testN(){if(await ask()){LS.s('notif',true);nDraw();await fire('ECE 1A test','Reminders are working on this device.','test');nMsg('Test sent.')}}
function checkN(){
 if(!P||!nOn())return;const done=LS.g('notified',[]);let ch=false;
 allTasks().filter(t=>stOf(t)!=='d').forEach(t=>{
  const h=(new Date(t.due)-Date.now())/36e5;if(h<=0||h>24)return;
  const k=t.id+(h<=2?':2':':24');if(done.includes(k))return;
  done.push(k);if(h<=2)done.push(t.id+':24');ch=true;
  fire(h<=2?'Due in under 2 hours':'Due within 24 hours',`${t.title} (${subj(t.sub).code}), ${dt(t.due)}`,k)});
 if(ch)LS.s('notified',[...new Set(done)])}
document.addEventListener('click',e=>{if(e.target.closest('.sw'))toggleN();else if(e.target.closest('.tst'))testN()});
document.addEventListener('visibilitychange',()=>!document.hidden&&checkN());

// ---------- Onboarding ----------
function step(n){$('#s1').hidden=n!==1;$('#s2').hidden=n!==2;if(n===2)drawPick()}
function openSetup(){
 $('#sn').value=P&&P.me?P.me:'';sel=P?P.preset:'R';cus=P&&P.custom?[...P.custom]:[];nDraw();step(1);$('#setup').showModal()}
$('#nx').onclick=()=>{if(!$('#sn').value){alert('Choose your name');return}step(2)};
$('#bk').onclick=()=>step(1);
function drawPick(){
 $('#pp').innerHTML=[['R','Regular','29 units'],['B','B','18 units'],['C','C','26 units'],['X','Custom','Irregular']].map(([k,l,u])=>`<button data-p="${k}" class="${sel===k?'on':''}">${l}<small>${u}</small></button>`).join('');
 $$('#pp button').forEach(b=>b.onclick=()=>{sel=b.dataset.p;drawPick()});
 $('#cu').hidden=sel!=='X';
 if(sel==='X'){$('#cu').innerHTML=SUBJECTS.map(s=>`<label class="chk"><input type="checkbox" value="${s.id}" ${cus.includes(s.id)?'checked':''}> ${s.code} ${esc(s.title)}</label>`).join('');
  $$('#cu input').forEach(i=>i.onchange=()=>{cus=$$('#cu input:checked').map(x=>x.value);drawPreview()})}
 drawPreview()}
function drawPreview(){
 $('#ph').innerHTML=`<b>${sel==='X'?'Custom':PRESETS[sel].name+' ('+PRESETS[sel].units+' units)'}</b><span class="tag">${subsOf(sel,cus).length} subjects</span>`;
 $('#pvw').innerHTML=preview(sel,cus)}
$('#ok').onclick=()=>{
 if(sel==='X'&&!cus.length){alert('Pick at least one subject');return}
 P={name:MASTER[idxOf($('#sn').value)].n,me:$('#sn').value,preset:sel,custom:cus};
 LS.s('profile',P);$('#setup').close();renderAll();checkN()};
$('#chip').onclick=openSetup;
$('#bell').onclick=()=>{nDraw();$('#cfg').showModal()};
$('#cx').onclick=()=>$('#cfg').close();
$('#edit').onclick=()=>{$('#cfg').close();openSetup()};

// ---------- Tasks ----------
const allTasks=()=>[...TASKS,...MY].filter(t=>t.sub==='me'||mySubs().includes(t.sub)).sort((a,b)=>a.due.localeCompare(b.due));
const stOf=t=>ST[t.id]||'p',soon=t=>stOf(t)==='p'&&new Date(t.due)-Date.now()<2592e5;
const LB={p:'Pending',g:'In progress',d:'Done'};
const FT={all:()=>true,p:t=>stOf(t)==='p',g:t=>stOf(t)==='g'||soon(t),d:t=>stOf(t)==='d'};
function renderTodo(){
 const l=allTasks(),c=Object.fromEntries(Object.keys(FT).map(k=>[k,l.filter(FT[k]).length])),pct=l.length?Math.round(c.d/l.length*100):0;
 $('#pct').textContent=pct+'% done';$('#bar').style.width=pct+'%';
 $('#ts').innerHTML=[['all','All'],['p','Pending'],['g','In Progress / Due Soon'],['d','Done']].map(([k,n])=>`<button data-k="${k}" class="${tab===k?'on':''}">${n} <span class="tag">${c[k]}</span></button>`).join('');
 $$('#ts button').forEach(b=>b.onclick=()=>{tab=b.dataset.k;renderTodo()});
 $('#tl').innerHTML=l.filter(FT[tab]).map(t=>`<div class="item ${stOf(t)==='d'?'done':''}"><span><b>${esc(t.title)}</b><br><small>${esc(subj(t.sub).code)} | ${t.type} | due ${dt(t.due)}${soon(t)?' | due soon':''}</small></span><span>${t.mine?`<button class="x" data-x="${t.id}" aria-label="Delete">×</button>`:''}<button class="st ${stOf(t)}" data-id="${t.id}">${LB[stOf(t)]}</button></span></div>`).join('')
  ||`<div class="empty"><img src="mascot-calc.png" alt=""><p><b>${l.length&&c.d===l.length?'All tasks done!':'Nothing here.'}</b></p></div>`;
 $$('#tl .st').forEach(b=>b.onclick=()=>{ST[b.dataset.id]={p:'g',g:'d',d:'p'}[ST[b.dataset.id]||'p'];LS.s('st',ST);renderTodo();renderHome()});
 $$('#tl .x').forEach(b=>b.onclick=()=>{MY=MY.filter(t=>t.id!==b.dataset.x);LS.s('my',MY);renderTodo();renderHome()})}
$('#addf').onsubmit=e=>{e.preventDefault();
 MY.push({id:'m'+Date.now(),sub:$('#ns').value,type:'task',title:$('#nt').value.trim(),due:$('#nd').value+'T23:59',mine:true});
 LS.s('my',MY);$('#nt').value='';renderTodo();renderHome();checkN()};

// ---------- Home ----------
function renderHome(){
 renderPts();
 const t=allTasks().find(t=>t.type!=='task'&&!t.mine&&stOf(t)!=='d'&&new Date(t.due)>Date.now());
 if(t){const ms=new Date(t.due)-Date.now();$('#count').innerHTML=`<small>NEXT UP</small><br>${esc(t.title)}<span class="big">${Math.floor(ms/864e5)}d ${Math.floor(ms%864e5/36e5)}h ${Math.floor(ms%36e5/6e4)}m</span><small>${esc(subj(t.sub).code)} | ${dt(t.due)}</small>`}
 else $('#count').textContent='No upcoming quizzes, labs or exams.';
 const all=allTasks();
 $('#sc').innerHTML=mySubs().map((id,i)=>{const u=subj(id),ts=all.filter(t=>t.sub===id),d=ts.filter(t=>stOf(t)==='d').length;
  return`<div class="sc c${i%4}"><small>${u.code}</small><b>${esc(u.title)}</b><div class="bar"><i style="width:${ts.length?d/ts.length*100:0}%"></i></div><small>${d} of ${ts.length} tasks done</small></div>`}).join('')}
function renderTT(){
 const sl=mySlots(),today=new Date().getDay();
 if(vm==='w'){
  let h='<div class="wk"><div class="wc hr">'+[...Array(14)].map((_,i)=>`<span style="top:${i*44+18}px">${t12((7+i)+':00').replace(':00','')}</span>`).join('')+'</div>';
  for(let d=1;d<=6;d++)h+=`<div class="wc"><b class="dh">${DS[d]}</b>`+sl.filter(s=>s.day===d).map(s=>`<div class="blk c${SUBJECTS.findIndex(x=>x.id===s.sub)%4}" style="top:${(mm(s.start)-420)/60*44+24}px;height:${(mm(s.end)-mm(s.start))/60*44-2}px"><b>${subj(s.sub).code}</b>${t12(s.start).replace(' ','')}<br>${s.room==='TBA'?'':esc(s.room)}</div>`).join('')+'</div>';
  $('#tt').innerHTML=h+'</div>';return}
 if(vm==='m'){month(sl);return}
 let h='';
 for(let i=1;i<=7;i++){const d=i%7,r=sl.filter(s=>s.day===d).sort((a,b)=>a.start.localeCompare(b.start));if(!r.length)continue;
  h+=`<div class="day ${d===today?'now':''}">${DAYS[d]}${d===today?' (today)':''}</div>`+r.map(s=>slotItem(s)).join('')}
 $('#tt').innerHTML=h||'<p class="mut">No classes selected.</p>'}
function month(sl){
 const y=mo.getFullYear(),m=mo.getMonth(),off=(new Date(y,m,1).getDay()+6)%7,n=new Date(y,m+1,0).getDate(),tk=allTasks(),now=new Date(),ts=`${now.getFullYear()}-${p2(now.getMonth()+1)}-${p2(now.getDate())}`;
 if(!md||!md.startsWith(`${y}-${p2(m+1)}`))md=ts.startsWith(`${y}-${p2(m+1)}`)?ts:`${y}-${p2(m+1)}-01`;
 let h=`<div class="mh"><button class="x" id="mp">‹</button><b>${mo.toLocaleDateString([],{month:'long',year:'numeric'})}</b><button class="x" id="mn">›</button></div><div class="mg">`+'MTWTFSS'.split('').map(c=>`<small style="text-align:center">${c}</small>`).join('')+'<span></span>'.repeat(off);
 for(let d=1;d<=n;d++){const k=`${y}-${p2(m+1)}-${p2(d)}`,dow=new Date(y,m,d).getDay(),hasC=sl.some(s=>s.day===dow),hasT=tk.some(t=>t.due.startsWith(k)),st=sl.filter(s=>s.day===dow).map(s=>attOf(s.sub,k)).filter(Boolean);
  h+=`<button data-d="${k}" class="${k===md?'sel':''} ${k===ts?'today':''}">${d}<i>${hasC?'<u class="c"></u>':''}${hasT?'<u class="t"></u>':''}${st.includes('Absent')?'<u class="no"></u>':st.length?'<u class="ok"></u>':''}</i></button>`}
 h+='</div>';
 h+='<small>Lavender: class | Blue: task due | Green: present | Red: absent</small>';const dd=new Date(md+'T00:00'),cl=sl.filter(s=>s.day===dd.getDay()).sort((a,b)=>a.start.localeCompare(b.start)),dl=tk.filter(t=>t.due.startsWith(md));
 h+=`<div class="day">${dd.toLocaleDateString([],{weekday:'long',month:'long',day:'numeric'})}</div>`+cl.map(s=>slotItem(s,md)).join('')+dl.map(t=>`<div class="item"><span><b>${esc(t.title)}</b><br><small>${esc(subj(t.sub).code)} | ${t.type} | due ${dt(t.due)}</small></span><span class="tag">${LB[stOf(t)]}</span></div>`).join('')||'';
 if(!cl.length&&!dl.length)h+='<p class="mut">Nothing scheduled.</p>';
 $('#tt').innerHTML=h;
 $('#mp').onclick=()=>{mo=new Date(y,m-1,1);renderTT()};$('#mn').onclick=()=>{mo=new Date(y,m+1,1);renderTT()};
 $$('.mg button').forEach(b=>b.onclick=()=>{md=b.dataset.d;renderTT()})}

// ---------- Reviewer ----------
function renderVault(){
 const s=$('#vs').value,p=$('#vp').value;
 $('#vl').innerHTML=VAULT.filter(v=>(!s||v.sub===s)&&(!p||v.period===p)).map(v=>`<div class="card"><h3>${esc(v.title)}</h3><small>${subj(v.sub).code}</small><span class="tag">${v.period}</span>${v.body}${v.link?`<p><a href="${esc(v.link)}" download>Download material</a></p>`:''}</div>`).join('')||'<p class="mut">No cards match.</p>'}
$('#vs').innerHTML='<option value="">All subjects</option>'+SUBJECTS.map(s=>`<option value="${s.id}">${s.code}</option>`).join('');
$('#vp').innerHTML='<option value="">All periods</option>'+['Prelims','Midterms','Finals'].map(p=>`<option>${p}</option>`).join('');
$('#vs').onchange=$('#vp').onchange=renderVault;

// ---------- Secretary's Kiosk ----------
const q=s=>`"${String(s).replace(/"/g,'""')}"`;
const kKey=()=>$('#kdate').value+'|'+$('#kblock').value;
const kRoster=()=>enrolled($('#kblock').value);
const touch=()=>LS.s('lt',new Date().toISOString());
const sumRec=o=>Object.values(o||{}).reduce((x,y)=>x+y,0);
function renderKiosk(){
 const sub=$('#kblock').value,date=$('#kdate').value,r=kRoster(),s=$('#ksearch').value.toLowerCase(),list=r.filter(x=>x.n.toLowerCase().includes(s));
 if(km==='a'){
  const a=ATT[kKey()]||{},n=r.filter(x=>a[x.no]).length;
  $('#kcount').textContent=`Present ${n} | Absent ${r.length-n} | Total ${r.length}`;
  $('#kl').innerHTML=list.map(x=>`<div class="item ${a[x.no]?'pres':'abs'}" data-no="${x.no}"><b>${esc(x.n)}</b><small>${a[x.no]?'Present '+new Date(a[x.no]).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})+' (tap to undo)':'Tap to mark present'}</small></div>`).join('');
  $$('#kl .item').forEach(e=>e.onclick=()=>{const k=kKey(),no=e.dataset.no;ATT[k]=ATT[k]||{};
   if(ATT[k][no]){if(!confirm('Undo attendance for '+MASTER[idxOf(no)].n+'?'))return;delete ATT[k][no];if(!Object.keys(ATT[k]).length)delete ATT[k]}else ATT[k][no]=new Date().toISOString();
   LS.s('att',ATT);touch();renderKiosk()})
 }else{
  const R=REC[sub]||{};
  $('#kcount').textContent=`Points given on ${date}: ${r.reduce((t,x)=>t+((R[x.no]||{})[date]||0),0)} | Class total: ${r.reduce((t,x)=>t+sumRec(R[x.no]),0)}`;
  $('#kl').innerHTML=list.map(x=>{const e=R[x.no]||{};return`<div class="item" data-no="${x.no}"><span><b>${esc(x.n)}</b><br><small>today ${e[date]||0}</small></span><span class="stp"><button class="x" data-d="-1" aria-label="Minus one">−</button><b>${sumRec(e)}</b><button class="x" data-d="1" aria-label="Plus one">+</button></span></div>`}).join('');
  $$('#kl .x').forEach(b=>b.onclick=()=>{const no=b.closest('.item').dataset.no;REC[sub]=REC[sub]||{};const e=REC[sub][no]=REC[sub][no]||{};
   e[date]=(e[date]||0)+Number(b.dataset.d);if(!e[date])delete e[date];LS.s('rec',REC);touch();renderKiosk()})}}
$('#kblock').innerHTML=SUBJECTS.map(s=>`<option value="${s.id}">${s.code}</option>`).join('');
$('#kdate').value=new Date(Date.now()-new Date().getTimezoneOffset()*6e4).toISOString().slice(0,10);
['kblock','kdate'].forEach(i=>$('#'+i).onchange=renderKiosk);$('#ksearch').oninput=renderKiosk;
$$('#km button').forEach(b=>b.onclick=()=>{km=b.dataset.m;$$('#km button').forEach(x=>x.classList.toggle('on',x===b));renderKiosk()});
function report(){
 const sub=$('#kblock').value,code=subj(sub).code,r=kRoster();
 if(km==='r'){const R=REC[sub]||{},t=x=>sumRec(R[x.no]);
  return{txt:`${code} | recitation points\n\n${r.map((x,i)=>`${i+1}. ${x.n}: ${t(x)}`).join('\n')}`,csv:['Name,Total Points',...r.map(x=>`${q(x.n)},${t(x)}`)],file:`recitation_${sub}`}}
 const a=ATT[kKey()]||{},pr=r.filter(x=>a[x.no]),ab=r.filter(x=>!a[x.no]),tm=x=>new Date(a[x.no]).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'});
 return{txt:`${code} | ${$('#kdate').value}\n\nPRESENT (${pr.length})\n${pr.map((x,i)=>`${i+1}. ${x.n} (${tm(x)})`).join('\n')}\n\nABSENT (${ab.length})\n${ab.map((x,i)=>`${i+1}. ${x.n}`).join('\n')}`,
  csv:['Name,Status,Time',...pr.map(x=>`${q(x.n)},Present,${a[x.no]}`),...ab.map(x=>`${q(x.n)},Absent,`)],file:`attendance_${sub}_${$('#kdate').value}`}}
async function copy(t){try{await navigator.clipboard.writeText(t)}catch{const e=document.createElement('textarea');e.value=t;document.body.appendChild(e);e.select();document.execCommand('copy');e.remove()}}
$('#kcopy').onclick=async()=>{await copy(report().txt);toast('Copied')};
$('#kcsv').onclick=()=>{const r=report(),l=document.createElement('a');l.href=URL.createObjectURL(new Blob([r.csv.join('\n')],{type:'text/csv'}));l.download=r.file+'.csv';l.click()};

// ---------- Class updates: the secretary shares attendance and recitation points, classmates apply them ----------
// There is no server, so the update travels as a link or code (send it in the class group chat).
// It lists the whole class by position in MASTER, so never reorder MASTER in data.js after sharing starts.
function snap(){
 const att={},rec={};
 for(const k in ATT){let m=0n;for(const no in ATT[k]){const i=idxOf(no);if(i>=0)m|=1n<<BigInt(i)}att[k]=m.toString(16)}
 for(const s in REC){rec[s]={};for(const no in REC[s]){const i=idxOf(no);if(i>=0)rec[s][i]=REC[s][no]}}
 return{v:1,t:LS.g('lt',''),att,rec}}
function view(){const r=LS.g('recv',null),l=snap();return r&&(!l.t||r.t>l.t)?r:l}
const toB=u=>{let s='';u.forEach(c=>s+=String.fromCharCode(c));return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')};
const fromB=t=>Uint8Array.from(atob(t.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
async function enc(o){
 const u=new TextEncoder().encode(JSON.stringify(o));
 if('CompressionStream' in window)return'z.'+toB(new Uint8Array(await new Response(new Blob([u]).stream().pipeThrough(new CompressionStream('deflate-raw'))).arrayBuffer()));
 return'j.'+toB(u)}
async function dec(c){
 let u=fromB(c.slice(2));
 if(c.startsWith('z.'))u=new Uint8Array(await new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer());
 return JSON.parse(new TextDecoder().decode(u))}
async function applyCode(c){
 try{const o=await dec(c.trim());if(o.v!==1||typeof o.att!=='object'||typeof o.rec!=='object')throw 0;
  LS.s('recv',o);if(P){renderHome();renderTT()}toast('Updated. Your attendance and points are refreshed.')}
 catch{toast('That update code did not work')}}
function hashIn(){const m=location.hash.match(/^#u=(.+)/);if(m){applyCode(m[1]);history.replaceState(null,'',location.pathname)}}
$('#kshare').onclick=async()=>{const url=location.origin+location.pathname+'#u='+await enc(snap());
 if(navigator.share){try{await navigator.share({title:'ECE 1A update',url});return}catch{}}
 await copy(url);toast('Update link copied. Send it to the class group chat.')};
$('#kcode').onclick=async()=>{await copy(await enc(snap()));toast('Update code copied')};
$('#capply').onclick=async()=>{const v=$('#cin').value.trim(),m=v.match(/#u=(.+)$/);await applyCode(m?m[1]:v);$('#cin').value=''};
let tt_;function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('on');clearTimeout(tt_);tt_=setTimeout(()=>e.classList.remove('on'),3500)}
function renderPts(){
 const v=view(),i=idxOf(P.me);let h='';
 Object.keys(v.rec||{}).forEach(sub=>{const e=(v.rec[sub]||{})[i];if(!e||!Object.keys(e).length)return;const u=subj(sub);
  h+=`<div class="card row2"><div><b>${u.code}</b> <small>${esc(u.title)}</small><br><small>${Object.keys(e).sort().map(d=>`${new Date(d+'T00:00').toLocaleDateString([],{month:'short',day:'numeric'})} ${e[d]>0?'+':''}${e[d]}`).join(' | ')}</small></div><span class="pts">${sumRec(e)}</span></div>`});
 $('#pts').innerHTML='<h2>Recitation Points</h2>'+(i<0?'<p class="mut">Pick your name in Settings, Change my schedule, to see your points.</p>':h||'<p class="mut">No points yet. When the secretary shares an update, open the link or paste it in Settings.</p>')+(v.t?`<small>Last update ${dt(v.t)}</small>`:'')}

// ---------- My Card ----------
const gn=n=>(n.split(',')[1]||n).trim().split(' ')[0],disp=n=>n.includes(',')?n.split(',')[1].trim()+' '+n.split(',')[0]:n;
const THEMES=['#EFEDF3','#EBDDF6','#DDE0F4','#DDF1E6','#F9E0E6','#FBE6D6','#F8F0CC','#E8E2D4'],ARTS=['mascot-sun.png','mascot-calc.png'];
let CARD=LS.g('card',{c:1,art:0,nick:'',bd:'',photo:''});
const saveCard=()=>{LS.s('card',CARD);renderCard()};
function renderCard(){
 const c=CARD,art=c.art===2&&c.photo?c.photo:ARTS[c.art<2?c.art:0],b=c.bd?new Date(c.bd+'T00:00').toLocaleDateString([],{month:'long',day:'numeric'}):'Not set';
 $('#mc').innerHTML=`<div class="mc" style="background:${THEMES[c.c]}"><div class="mbar"><i></i><span>${esc(gn(P.name).toLowerCase())}.exe</span><button class="pill" id="ce" type="button">Edit card</button></div><div class="mbody"><img class="mph" src="${art}" alt=""><div class="mi"><div class="mt">ECE 1A ✦<br>Student</div><div class="mf"><small>Full Name</small><b>${esc(disp(P.name))}</b></div><div class="mf2"><div class="mf"><small>Schedule</small><b>${P.preset==='X'?'Custom':PRESETS[P.preset].name}</b></div><div class="mf"><small>Birthday</small><b>${b}</b></div></div></div></div>${c.nick?`<p class="mq">${esc(c.nick)}</p>`:''}</div>`;
 $('#ce').onclick=openCard}
function openCard(){$('#cn').value=CARD.nick;$('#cb').value=CARD.bd;drawCC();$('#cd').showModal()}
function drawCC(){
 $('#cc').innerHTML=THEMES.map((t,i)=>`<button type="button" data-i="${i}" class="${CARD.c===i?'on':''}" style="background:${t}" aria-label="Color ${i+1}"></button>`).join('');
 $$('#cc button').forEach(b=>b.onclick=()=>{CARD.c=+b.dataset.i;saveCard();drawCC()});
 $$('#ca button').forEach(b=>{b.classList.toggle('on',+b.dataset.a===CARD.art);b.onclick=()=>{if(+b.dataset.a===2&&!CARD.photo){alert('Choose a photo first');return}CARD.art=+b.dataset.a;saveCard();drawCC()}})}
$('#cn').oninput=()=>{CARD.nick=$('#cn').value;saveCard()};$('#cb').onchange=()=>{CARD.bd=$('#cb').value;saveCard()};
$('#cf').onchange=e=>{const f=e.target.files[0];if(!f)return;const im=new Image();
 im.onload=()=>{const cv=document.createElement('canvas');cv.width=240;cv.height=300;const x=cv.getContext('2d'),s=Math.max(240/im.width,300/im.height);x.drawImage(im,(240-im.width*s)/2,(300-im.height*s)/2,im.width*s,im.height*s);CARD.photo=cv.toDataURL('image/jpeg',.8);CARD.art=2;saveCard();drawCC()};im.src=URL.createObjectURL(f)};
$('#cdone').onclick=()=>$('#cd').close();
$('#sn').innerHTML='<option value="">Choose your name</option>'+MASTER.map(r=>`<option value="${r.no}">${esc(r.n)}</option>`).join('');

// ---------- Install ----------
let dip=null;const standalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone;
addEventListener('beforeinstallprompt',e=>{e.preventDefault();dip=e});
addEventListener('appinstalled',()=>{dip=null;instDraw()});
function instDraw(){const s=standalone();$$('.inst').forEach(b=>b.hidden=s);$('#inst').hidden=s||LS.g('instx',false);if(inApp)$('#inst small').textContent='Open this link in Chrome first (three dots, Open in browser)'}
const inApp=/FBAN|FBAV|FB_IAB|Instagram|Messenger/i.test(navigator.userAgent);
async function doInstall(){
 if(inApp){alert('You opened this inside Messenger. Tap the three dots, choose Open in Chrome, then install from there.');return}
 if(dip){dip.prompt();await dip.userChoice;dip=null;instDraw();return}
 alert(/iphone|ipad|ipod/i.test(navigator.userAgent)?'Tap the Share button, then Add to Home Screen.':'Open your browser menu, then tap Install app or Add to Home screen.')}
document.addEventListener('click',e=>{if(e.target.closest('.inst'))doInstall();else if(e.target.id==='instx'){LS.s('instx',true);instDraw()}});

// ---------- Roster ----------
function renderRoster(){
 const q=$('#rsearch').value.toLowerCase(),s=$('#rsub').value,l=(s?enrolled(s):MASTER).filter(r=>r.n.toLowerCase().includes(q));
 $('#rl').innerHTML=`<p class="mut">${l.length} students</p>`+l.map(r=>`<div class="item"><b>${esc(r.n)}</b></div>`).join('')}
$('#rsub').innerHTML=`<option value="">Whole class (${MASTER.length})</option>`+SUBJECTS.map(s=>`<option value="${s.id}">${s.code} (${enrolled(s.id).length})</option>`).join('');
$('#rsub').onchange=renderRoster;
$('#rsearch').oninput=renderRoster;

// ---------- Boot ----------
function renderAll(){
 $('#hi').textContent='HELLO, '+gn(P.name).toUpperCase()+'.';
 $('#hs').textContent=new Date().toLocaleDateString([],{weekday:'long',month:'long',day:'numeric'});
 $('#chip').textContent=P.preset==='X'?'Custom':PRESETS[P.preset].name;
 $('#ns').innerHTML='<option value="me">Personal</option>'+mySubs().map(id=>`<option value="${id}">${subj(id).code}</option>`).join('');
 renderCard();renderHome();renderTT();renderTodo()}
$$('.nb').forEach(e=>e.innerHTML=NB);nDraw();
$('#pm').href=CONFIG.mayorMessenger;
renderVault();renderKiosk();renderRoster();instDraw();hashIn();addEventListener('hashchange',hashIn);
if(P){renderAll();checkN();if(!P.me)openSetup()}else openSetup();
setInterval(()=>{if(P){renderHome();checkN()}},6e4);
if('serviceWorker' in navigator){const had=!!navigator.serviceWorker.controller;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(had&&!window.rl){window.rl=1;location.reload()}});addEventListener('load',()=>navigator.serviceWorker.register('sw.js'))}