const fs=require('fs'),{chromium}=require('playwright');
const fonts=fs.readFileSync('fonts/embed.css','utf8');
const MONTHS=["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
const DAYS=["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"];
const QUOTES=[["Ce qu'on fait chaque jour compte plus que ce qu'on fait de temps en temps.","Gretchen Rubin"],["La simplicité est la sophistication suprême.","attribué à Léonard de Vinci"],["Il faut cultiver notre jardin.","Voltaire, Candide"],["Le génie n'est qu'une longue patience.","attribué à Buffon"],["Rien ne sert de courir ; il faut partir à point.","La Fontaine"],["Vingt fois sur le métier remettez votre ouvrage.","Boileau"],["Ce que l'on conçoit bien s'énonce clairement.","Boileau"],["La patience est amère, mais son fruit est doux.","Rousseau"],["Le cœur a ses raisons que la raison ne connaît point.","Pascal"],["L'essentiel est invisible pour les yeux.","Saint-Exupéry"],["Je pense, donc je suis.","Descartes"],["La lecture est une amitié.","Proust"],["On ne voit bien qu'avec le cœur.","Saint-Exupéry"],["Qui vit sans folie n'est pas si sage qu'il croit.","La Rochefoucauld"]];
const isoWeek=d=>{const x=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));const n=x.getUTCDay()||7;x.setUTCDate(x.getUTCDate()+4-n);const y=new Date(Date.UTC(x.getUTCFullYear(),0,1));return Math.ceil(((x-y)/864e5+1)/7)};
const moonAge=d=>{const s=29.530588853;return(((d.getTime()-Date.UTC(2000,0,6,18,14))/864e5)%s+s)%s};
const moonName=a=>a<1.85?"nouvelle lune":a<5.54?"premier croissant":a<9.23?"premier quartier":a<12.92?"gibbeuse croissante":a<16.61?"pleine lune":a<20.30?"gibbeuse décroissante":a<23.99?"dernier quartier":a<27.68?"dernier croissant":"nouvelle lune";
function moonSvg(a){const f=a/29.530588853,r=7,k=Math.cos(f*2*Math.PI),right=f<.5,rx=Math.abs(k)*r;
  // lit region: half circle on lit side + ellipse half
  const s1=right?1:0, s2=((k>0)===right)?0:1;
  return `<svg width="16" height="16" viewBox="-8 -8 16 16"><circle r="7" fill="#1D2733"/><path d="M0 -7 A7 7 0 0 ${s1} 0 7 A${rx.toFixed(2)} 7 0 0 ${s2} 0 -7Z" fill="#FFE9A0"/><circle r="7" fill="none" stroke="#1D2733" stroke-width=".6"/></svg>`}
function mini(d){const y=d.getFullYear(),m=d.getMonth(),first=(new Date(y,m,1).getDay()+6)%7,n=new Date(y,m+1,0).getDate();
  let h=["L","M","M","J","V","S","D"].map((s,i)=>`<span class="h ${i==5?'sa':i==6?'su':''}">${s}</span>`).join('');
  h+='<span></span>'.repeat(first);
  for(let i=1;i<=n;i++){const wd=(first+i-1)%7;h+=`<span class="${wd==5?'sa':wd==6?'su':''} ${i==d.getDate()?'today':''}">${i}</span>`}
  return h}
function page(d){const y=d.getFullYear(),wd=d.getDay(),len=(y%4==0&&y%100!=0)||y%400==0?366:365,doy=Math.round((d-new Date(y,0,1,12))/864e5)+1,a=moonAge(d),q=QUOTES[doy%QUOTES.length];
  let hours='';for(let h=6;h<=23;h++)hours+=`<div class="hr"><span>${String(h).padStart(2,'0')}</span></div>`;
  return `<section class="page"><header class="head ${wd==0?'sun':wd==6?'sat':''}">
  <div class="dnum">${d.getDate()}</div><div class="dmeta"><div class="dmonth">${MONTHS[d.getMonth()].replace(/^./,c=>c.toUpperCase())} ${y}</div><div class="dwd">${DAYS[wd]}</div></div>
  <div class="stats"><span>jour</span><b>${doy} / ${len}</b><span>reste</span><b>${len-doy} j</b><span>semaine</span><b>S${isoWeek(d)}</b><div class="moon">${moonSvg(a)}<span>${moonName(a)}</span></div></div></header>
  <div class="row"><div class="mini">${mini(d)}</div><div class="prio"><div class="lbl">Trois choses aujourd'hui</div>${'<div class="task"><i></i><u></u></div>'.repeat(3)}</div></div>
  <div class="body"><div class="tl">${hours}</div><div class="free"><div class="lbl">Notes · idées · ce qui s'est passé</div></div></div>
  <div class="trk"><span class="lbl">Eau</span><span class="dots">${'<i></i>'.repeat(8)}</span><span class="lbl">Sommeil</span><u class="sl"></u><span class="lbl">Humeur</span><span class="mood">${[1,2,3,4,5].map(n=>`<i>${n}</i>`).join('')}</span></div>
  <footer class="quote">« ${q[0]} »<small>— ${q[1]}</small></footer></section>`}
const pages=[];for(let d=new Date(2026,9,31,12);d<=new Date(2026,10,30,12);d=new Date(d.getFullYear(),d.getMonth(),d.getDate()+1,12))pages.push(page(d));
const html=`<!doctype html><meta charset="utf-8"><style>${fonts}
@page{size:A5;margin:0}*{box-sizing:border-box;margin:0}
body{font-family:"Zen Kaku Gothic New",sans-serif;color:#1D2733;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{width:148mm;height:210mm;padding:8mm 8mm 7mm;display:flex;flex-direction:column;gap:3mm;page-break-after:always;overflow:hidden;
 background-image:linear-gradient(#DCE2E8 .2mm,transparent .2mm),linear-gradient(90deg,#DCE2E8 .2mm,transparent .2mm);background-size:3.7mm 3.7mm;background-position:8mm 8mm}
.head{display:flex;gap:4mm;align-items:flex-end;border-bottom:.6mm solid #1D2733;padding-bottom:1.5mm;background:#fff}
.dnum{font:700 40pt/0.9 "Shippori Mincho",serif}.dmonth{font:500 10pt "Shippori Mincho",serif}.dwd{font:700 12pt "Zen Kaku Gothic New"}
.sun .dnum,.sun .dwd{color:#C23B2A}.sat .dnum,.sat .dwd{color:#2D5E8E}
.stats{margin-left:auto;display:grid;grid-template-columns:auto auto;gap:0 3mm;font:7pt "IBM Plex Mono",monospace;color:#5F6B78;text-align:right}.stats b{color:#1D2733;font-weight:500}
.moon{grid-column:1/-1;display:flex;gap:1.5mm;align-items:center;justify-content:flex-end}
.row{display:flex;gap:4mm}.mini{display:grid;grid-template-columns:repeat(7,4.6mm);font:6.5pt/3.8mm "IBM Plex Mono";text-align:center;background:#fff;border:.2mm solid #C3CCD6;padding:1mm;align-self:start}
.mini .h{color:#5F6B78}.mini .su{color:#C23B2A}.mini .sa{color:#2D5E8E}.mini .today{background:#1D2733;color:#fff;border-radius:.5mm}
.prio{flex:1;display:flex;flex-direction:column;gap:2mm}.lbl{font:700 6.5pt "Zen Kaku Gothic New";letter-spacing:.14em;text-transform:uppercase;color:#5F6B78}
.task{display:flex;gap:2mm;align-items:center;height:6mm}.task i{width:3mm;height:3mm;border:.3mm solid #1D2733;border-radius:.4mm;background:#fff}.task u{flex:1;border-bottom:.25mm dashed #8E99A6;height:100%}
.body{flex:1;display:grid;grid-template-columns:44% 1fr;gap:4mm;min-height:0}
.tl{display:flex;flex-direction:column}.hr{flex:1;border-top:.2mm solid #C3CCD6;font:6.5pt "IBM Plex Mono";color:#5F6B78;padding-top:.5mm;background:rgba(255,255,255,.55)}.hr:last-child{border-bottom:.2mm solid #C3CCD6}
.trk{display:flex;align-items:center;gap:2mm;flex-wrap:wrap}.dots,.mood{display:flex;gap:1mm;margin-right:3mm}.dots i{width:3.2mm;height:3.2mm;border:.25mm solid #5F6B78;border-radius:50%;background:#fff}
.mood i{font:6.5pt/3.6mm "IBM Plex Mono";font-style:normal;width:4.5mm;text-align:center;border:.2mm solid #C3CCD6;border-radius:.5mm;background:#fff}.sl{width:14mm;border-bottom:.25mm dashed #8E99A6;height:4mm;margin-right:3mm}
.quote{border-top:.3mm solid #1D2733;padding-top:1.5mm;font:500 8.5pt/1.5 "Shippori Mincho",serif;background:#fff}.quote small{display:block;font:6pt "IBM Plex Mono";color:#5F6B78}
</style>${pages.join('')}`;
fs.writeFileSync('carnet-print.html',html);
(async()=>{const b=await chromium.launch(),p=await b.newPage();await p.setContent(html,{waitUntil:'load'});await p.evaluate(()=>document.fonts.ready);
await p.pdf({path:'/home/user/theoryNotes/carnet-du-jour-nov-2026.pdf',format:'A5',printBackground:true,preferCSSPageSize:true});
await p.screenshot({path:'shot.png',clip:{x:0,y:0,width:560,height:794}});await b.close()})();
