/* Bônus: Catálogo de cortes (cardápio de cortes editável com galeria). Usa helpers do index.html do bônus. */
(function(){
if(!window.EXTRAS)return;
const KC='agk_cat1',KP='agk_cat1_ph';
const STY={low:'Degradê baixo',mid:'Degradê médio',skin:'Degradê navalhado',high:'Degradê alto',social:'Social',part:'Social com risco',pomp:'Topete',crop:'Crop (franja)',buzz:'Máquina (militar)',moh:'Moicano disfarçado',curly:'Cacheado',medium:'Médio na tesoura',kid:'Infantil'};
const DEF=[
['low','Degradê baixo','Disfarçado discreto. Vai bem com tudo.'],
['mid','Degradê médio','Equilibrado, moderno e fácil de manter.'],
['skin','Degradê navalhado','Zerado na navalha, acabamento limpo.'],
['social','Social clássico','Tesoura e máquina, visual alinhado.'],
['part','Social com risco','Risco lateral marcado, estilo elegante.'],
['pomp','Topete','Volume na frente com laterais curtas.'],
['crop','Crop francês','Franja texturizada e laterais baixas.'],
['buzz','Máquina (militar)','Curto por igual. Prático no dia a dia.'],
['moh','Moicano disfarçado','Faixa no meio e degradê em volta da orelha.'],
['curly','Cacheado com degradê','Cachos em cima, laterais limpas.'],
['medium','Médio na tesoura','Comprimento e movimento na tesoura.'],
['kid','Corte infantil','Corte rápido e confortável para a criançada.']];
let cat={titulo:'Catálogo de cortes',sub:'Escolha o seu estilo e mostre para o barbeiro',outros:'Barba | \nSobrancelha | \nPigmentação | \nHidratação | ',fmt:'print',items:DEF.map(([s,n,d],i)=>({id:'c'+i,s,n,d,p:'',on:true}))};
try{const o=JSON.parse(localStorage.getItem(KC)||'null');if(o&&o.items)cat=Object.assign(cat,o)}catch(_){}
let PH={};try{PH=JSON.parse(localStorage.getItem(KP)||'{}')}catch(_){}
const IMG={};const getImg=id=>{if(!PH[id])return null;if(IMG[id]&&IMG[id].src===PH[id])return IMG[id].complete?IMG[id]:null;const i=new Image();i.onload=()=>draw();i.src=PH[id];IMG[id]=i;return null};
const DIMG={};const getDef=st=>{if(st==='kid'||STY[st]){const i=DIMG[st]||(DIMG[st]=(()=>{const im=new Image();im.onload=()=>{draw();if(window.__catRows)__catRows()};im.src='cortes/'+st+'.jpg';return im})());return i.complete&&i.naturalWidth?i:null}return null};
const saveC=()=>{try{localStorage.setItem(KC,JSON.stringify(cat))}catch(_){}};
const saveP=()=>{try{localStorage.setItem(KP,JSON.stringify(PH));return true}catch(_){toast('Memória cheia: use fotos menores ou remova alguma');return false}};
const brl=v=>{const s=String(v||'').trim();if(!s)return'';const n=parseFloat(s.replace(/[^\d,.]/g,'').replace(/\.(?=\d{3}\b)/g,'').replace(',','.'));return isNaN(n)?s:'R$ '+(n%1?n.toFixed(2).replace('.',','):n.toFixed(0))};
const parseO=t=>String(t||'').split('\n').map(l=>l.trim()).filter(Boolean).map(l=>{const p=l.split('|');return{n:p[0].trim(),p:brl(p[1]||'')}});
const esc=s=>String(s||'').replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
const FM={print:{W:2000,H:2828,cols:4,lab:'Pôster A3/A4 (imprimir)',f:'catalogo-de-cortes-poster.png'},feed:{W:1080,H:1350,cols:4,lab:'Feed 4:5',f:'catalogo-de-cortes-feed.png'},story:{W:1080,H:1920,cols:3,lab:'Story 9:16',f:'catalogo-de-cortes-story.png'}};

// ---------- ilustração (perfil com o corte), caixa 200x200
const P=s=>new Path2D(s);
const HEAD=P('M84 200L86 165C70 155 52 135 50 108C46 70 70 38 104 36C132 34 150 50 150 72C150 80 152 86 154 92L152 96C156 102 162 106 164 110C164 113 158 115 154 115C156 119 157 122 154 124C156 127 155 130 151 131C153 136 153 142 148 146C140 152 126 154 120 152C122 166 124 182 128 200Z');
const ZONE=P('M20 0L148 0L148 60C142 66 134 72 130 80L127 110L118 110C114 96 98 94 93 106L91 122C85 136 82 150 86 166L20 166Z');
const CAPE=P('M28 200C40 176 70 168 100 172C130 168 162 176 174 200Z');
const TOPS={
 std:'M147 64C158 46 146 22 112 21C80 20 56 40 49 82L64 92L140 70Z',
 social:'M149 62C153 44 140 27 108 26C80 25 58 42 51 84L64 92L140 70Z',
 pomp:'M150 66C174 44 164 6 122 7C86 8 60 30 51 80L64 92L140 72Z',
 crop:'M155 75L150 70L153 66L147 64C150 44 138 26 108 25C80 24 58 42 51 84L64 92L140 72Z',
 buzz:'M149 64C152 46 138 33 106 32C80 32 60 46 53 82L64 92L140 70Z',
 moh:'M146 60C164 34 146 4 110 6C86 8 68 26 60 56L72 62L140 66Z',
 medium:'M151 70C163 42 146 16 108 16C70 16 42 44 42 100C42 132 58 152 78 162L92 140L140 74Z'};
const FADE={low:[118,152],mid:[98,136],high:[78,116],skin:[86,110],moh:[70,104],curly:[100,138],social:[132,166],part:[132,166],pomp:[104,140],crop:[100,138],kid:[128,166]};
function cutArt(c,x,y,w,h,s){
 const sc=Math.min(w/140,h/172);c.save();c.beginPath();c.rect(x,y,w,h);c.clip();
 const g=c.createLinearGradient(x,y,x,y+h);g.addColorStop(0,'#f3eee6');g.addColorStop(1,'#d9d1c4');c.fillStyle=g;c.fillRect(x,y,w,h);
 c.translate(x+w/2-106*sc,y+h-192*sc);c.scale(sc,sc);
 const HAIR='#211a14',SKIN='#e3c3a0',LINE='#a98060';
 c.fillStyle=SKIN;c.fill(HEAD);
 // laterais (degradê)
 c.save();c.clip(HEAD);c.clip(ZONE);
 if(s==='buzz'){c.globalAlpha=.62;c.fillStyle=HAIR;c.fillRect(0,0,200,170)}
 else if(s==='medium'){c.fillStyle=HAIR;c.fillRect(0,0,200,170)}
 else{const f=FADE[s]||FADE.mid,gr=c.createLinearGradient(0,f[0],0,f[1]);gr.addColorStop(0,'rgba(33,26,20,.95)');gr.addColorStop(1,'rgba(33,26,20,0)');c.fillStyle=gr;c.fillRect(0,0,200,170)}
 c.restore();
 // topo
 c.fillStyle=HAIR;
 const top={low:'std',mid:'std',skin:'std',high:'std',curly:null,social:'social',part:'social',kid:'social'}[s]!==undefined?{low:'std',mid:'std',skin:'std',high:'std',curly:null,social:'social',part:'social',kid:'social'}[s]:s;
 if(top&&TOPS[top]){c.fill(P(TOPS[top]))}
 if(s==='curly'){c.fill(P(TOPS.buzz));for(let a=0;a<15;a++){const t=Math.PI*(1.06+a*0.068),r=56;const cx=102+Math.cos(t)*r*1.02,cy=84+Math.sin(t)*r*1.06;c.beginPath();c.arc(cx,cy,9.5,0,7);c.fill()}for(let a=0;a<9;a++){const t=Math.PI*(1.15+a*0.09),r=44;c.beginPath();c.arc(102+Math.cos(t)*r,80+Math.sin(t)*r,9,0,7);c.fill()}}
 // textura
 if(top&&s!=='buzz'){c.strokeStyle='rgba(255,255,255,.16)';c.lineWidth=1.6;c.lineCap='round';const L=s==='pomp'?[[70,40,140,22],[80,52,146,36],[66,62,120,46]]:s==='moh'?[[84,30,136,16],[88,44,140,34]]:[[70,46,136,32],[64,58,128,44],[82,36,140,40]];L.forEach(([a,b,cx,d])=>{c.beginPath();c.moveTo(a,b);c.quadraticCurveTo((a+cx)/2,Math.min(b,d)-8,cx,d);c.stroke()})}
 if(s==='part'){c.strokeStyle=SKIN;c.lineWidth=2.4;c.beginPath();c.moveTo(132,40);c.quadraticCurveTo(104,42,72,58);c.stroke()}
 // orelha, olho, sobrancelha
 c.fillStyle=SKIN;c.beginPath();c.ellipse(106,104,8.5,13.5,-.15,0,7);c.fill();c.strokeStyle=LINE;c.lineWidth=2;c.beginPath();c.ellipse(106,104,8.5,13.5,-.15,0,7);c.stroke();c.beginPath();c.arc(107,104,4,-1.2,1.6);c.stroke();
 c.strokeStyle=HAIR;c.lineWidth=3;c.lineCap='round';c.beginPath();c.moveTo(136,88);c.quadraticCurveTo(143,85,150,88);c.stroke();
 c.lineWidth=2.4;c.beginPath();c.moveTo(141,97);c.quadraticCurveTo(145,95,149,97);c.stroke();
 if(s!=='kid'){c.strokeStyle='rgba(60,40,25,.22)';c.lineWidth=5;c.beginPath();c.moveTo(150,134);c.quadraticCurveTo(136,150,121,150);c.stroke()}
 c.strokeStyle=LINE;c.lineWidth=1.6;c.beginPath();c.moveTo(119,152);c.quadraticCurveTo(121,160,122,168);c.stroke();
 c.fillStyle='#1f1f22';c.fill(CAPE);c.strokeStyle='rgba(255,255,255,.12)';c.lineWidth=2;c.beginPath();c.moveTo(86,172);c.quadraticCurveTo(104,182,128,172);c.stroke();
 c.restore()}
function photo(c,img,x,y,w,h){c.save();c.beginPath();c.rect(x,y,w,h);c.clip();const r=Math.max(w/img.width,h/img.height),iw=img.width*r,ih=img.height*r;c.drawImage(img,x+(w-iw)/2,y+(h-ih)*.25,iw,ih);c.restore()}

// ---------- texto
function fit(c,t,maxW,wt,size,min){let s=size;c.font=`${wt} ${s}px Poppins,sans-serif`;while(s>min&&c.measureText(t).width>maxW){s-=1;c.font=`${wt} ${s}px Poppins,sans-serif`}return s}
function lines(c,t,maxW,font,max){c.font=font;const ws=String(t||'').split(/\s+/).filter(Boolean),out=[];let cur='';ws.forEach(w=>{const n=cur?cur+' '+w:w;if(c.measureText(n).width>maxW&&cur){out.push(cur);cur=w}else cur=n});if(cur)out.push(cur);if(out.length>max){out.length=max;let l=out[max-1];while(l.length>1&&c.measureText(l+'…').width>maxW)l=l.slice(0,-1);out[max-1]=l+'…'}return out}
function lt(c,t,x,y,font,col,ls,al){c.font=font;c.fillStyle=col;if('letterSpacing' in c)c.letterSpacing=(ls||0)+'px';const w=c.measureText(t).width;c.fillText(t,al==='c'?x-w/2:al==='r'?x-w:x,y);if('letterSpacing' in c)c.letterSpacing='0px';return w}

// ---------- pôster
function poster(c,W,H,fm){
 const th=THEMES[cfg.theme],u=W/1000,pad=48*u,F=FM[fm];
 c.fillStyle=th.bg;c.fillRect(0,0,W,H);
 pole(c,0,0,W,20*u,th);
 let y=20*u+(fm==='feed'?40:58)*u;
 if(logoImg&&fm!=='feed'){const lh=(fm==='print'?96:110)*u,lw=Math.min(logoImg.width*lh/logoImg.height,300*u);c.drawImage(logoImg,(W-lw)/2,y,lw,lh*lw/(logoImg.width*lh/logoImg.height));y+=lh+22*u}
 const nome=(cfg.nome||'Nome da sua barbearia').toUpperCase();
 const ks=fit(c,nome,W-2*pad,800,(fm==='feed'?26:30)*u,14*u);lt(c,nome,W/2,y+ks,`800 ${ks}px Poppins,sans-serif`,th.ac,ks*.18,'c');y+=ks+(fm==='feed'?14:20)*u;
 const tt=(cat.titulo||'Catálogo de cortes').toUpperCase();const ts=fit(c,tt,W-2*pad,800,(fm==='feed'?78:fm==='story'?104:96)*u,30*u);lt(c,tt,W/2,y+ts*.86,`800 ${ts}px Poppins,sans-serif`,th.fg,0,'c');y+=ts*.86+(fm==='feed'?16:24)*u;
 if(cat.sub){const ss=fit(c,cat.sub,W-2*pad-40*u,500,(fm==='feed'?24:28)*u,14*u);c.fillStyle=th.ac;c.fillRect(W/2-c.measureText(cat.sub).width/2-50*u,y+ss*.55,30*u,3*u);c.fillRect(W/2+c.measureText(cat.sub).width/2+20*u,y+ss*.55,30*u,3*u);lt(c,cat.sub,W/2,y+ss*.85,`500 ${ss}px Poppins,sans-serif`,th.mu,0,'c');y+=ss+(fm==='feed'?22:34)*u}
 // rodapé
 const footH=fm==='print'?H*.235:fm==='story'?H*.17:H*.115;const gridB=H-footH-(fm==='print'?24:18)*u;
 const its=cat.items.filter(i=>i.on).slice(0,12),n=Math.max(its.length,1);
 let cols=F.cols;if(n<=6&&fm!=='story')cols=3;if(n<=4)cols=2;const rows=Math.ceil(n/cols),gp=(fm==='print'?20:14)*u;
 const cw=(W-2*pad-(cols-1)*gp)/cols,ch=(gridB-y-(rows-1)*gp)/rows;
 its.forEach((it,k)=>{const cx=pad+(k%cols)*(cw+gp),cy=y+Math.floor(k/cols)*(ch+gp);
  c.fillStyle=th.fg;c.globalAlpha=.07;rr(c,cx,cy,cw,ch,10*u);c.fill();c.globalAlpha=.55;c.strokeStyle=th.ac;c.lineWidth=1.6*u;rr(c,cx,cy,cw,ch,10*u);c.stroke();c.globalAlpha=1;
  const ip=8*u,hs=Math.min(cw*.085,ch*.08,(fm==='print'?26:24)*u);
  const label=(k+1)+'. '+(it.n||STY[it.s]||'Corte').toUpperCase();const ls=fit(c,label,cw-2*ip-4*u,800,hs,hs*.6);lt(c,label,cx+cw/2,cy+ip+ls*1.05,`800 ${ls}px Poppins,sans-serif`,th.fg,0,'c');
  const ds=Math.min(cw*.06,(fm==='print'?18:17)*u);const showD=it.d&&ch>cw*1.05;const dl=showD?lines(c,it.d,cw-2*ip-4*u,`500 ${ds}px Poppins,sans-serif`,2):[];
  const pr=brl(it.p);const ps=Math.min(cw*.085,(fm==='print'?28:24)*u);
  const bot=(dl.length?dl.length*ds*1.3+ip:0)+(pr?ps*1.55+ip:0)+ip;
  const iy=cy+ip+ls*1.5,ih=ch-(iy-cy)-bot;const ix=cx+ip,iw=cw-2*ip;
  const img=getImg(it.id)||getDef(it.s);if(img)photo(c,img,ix,iy,iw,ih);else cutArt(c,ix,iy,iw,ih,it.s);
  let ty=iy+ih+ip;dl.forEach((l,j)=>lt(c,l,cx+cw/2,ty+ds*(1+j*1.3),`500 ${ds}px Poppins,sans-serif`,th.mu,0,'c'));ty+=dl.length*ds*1.3+(dl.length?ip:0);
  if(pr){c.font=`800 ${ps}px Poppins,sans-serif`;const pw=c.measureText(pr).width+ps*1.4;c.fillStyle=th.ac;rr(c,cx+(cw-pw)/2,ty,pw,ps*1.5,ps*.75);c.fill();lt(c,pr,cx+cw/2,ty+ps*1.1,`800 ${ps}px Poppins,sans-serif`,th.on,0,'c')}
 });
 // faixa de frase
 const fy=H-footH;c.fillStyle=th.ac;
 if(fm==='print'){
  const by=fy+8*u,bh=footH-70*u,colW=(W-2*pad-30*u)/2;
  // outros serviços
  c.globalAlpha=.07;c.fillStyle=th.fg;rr(c,pad,by,colW,bh,12*u);c.fill();c.globalAlpha=1;
  lt(c,'OUTROS SERVIÇOS',pad+colW/2,by+52*u,`800 ${28*u}px Poppins,sans-serif`,th.ac,5*u,'c');
  const os=parseO(cat.outros).slice(0,7),rowH=Math.min(52*u,(bh-110*u)/Math.max(os.length,1)),fs=Math.min(26*u,rowH*.55);
  os.forEach((o,j)=>{const ry=by+100*u+j*rowH+fs;const nm=o.n.slice(0,30);lt(c,nm,pad+34*u,ry,`600 ${fs}px Poppins,sans-serif`,th.fg,0,'l');if(o.p)lt(c,o.p,pad+colW-34*u,ry,`800 ${fs}px Poppins,sans-serif`,th.ac,0,'r');c.strokeStyle=th.mu;c.globalAlpha=.3;c.lineWidth=1.5*u;c.beginPath();c.moveTo(pad+34*u,ry+rowH*.35);c.lineTo(pad+colW-34*u,ry+rowH*.35);c.stroke();c.globalAlpha=1});
  // QR
  const qx=pad+colW+30*u;c.strokeStyle=th.ac;c.lineWidth=3*u;rr(c,qx,by,colW,bh,12*u);c.stroke();
  const qs=Math.min(bh-70*u,colW*.4);qrDraw(c,qx+30*u,by+(bh-qs)/2,qs,'#14110d','#ffffff',1);
  const tx=qx+qs+56*u,tw=colW-qs-80*u;let ty=by+bh/2-110*u;
  lt(c,'AGENDE',tx,ty+40*u,`800 ${fit(c,'AGENDE PELO',tw,800,46*u,20*u)}px Poppins,sans-serif`,th.fg,0,'l');lt(c,'PELO QR CODE',tx,ty+92*u,`800 ${fit(c,'PELO QR CODE',tw,800,46*u,20*u)}px Poppins,sans-serif`,th.ac,0,'l');
  const lk=linkShow();lt(c,lk,tx,ty+140*u,`600 ${fit(c,lk,tw,600,22*u,12*u)}px Poppins,sans-serif`,th.mu,0,'l');
  if(cfg.hor){const hl=lines(c,'Abertos '+T('{hor}'),tw,`500 ${19*u}px Poppins,sans-serif`,3);hl.forEach((l,j)=>lt(c,l,tx,ty+180*u+j*27*u,`500 ${19*u}px Poppins,sans-serif`,th.fg,0,'l'))}
  const l2=[cfg.ig,cfg.wpp,cfg.end].filter(Boolean).join('   ·   ')||'@seuinstagram   ·   (00) 00000-0000';c.fillStyle=th.ac;c.fillRect(0,H-44*u,W,44*u);const s2=fit(c,l2,W-2*pad,800,20*u,12*u);lt(c,l2,W/2,H-15*u,`800 ${s2}px Poppins,sans-serif`,th.on,1,'c');
 }else{
  const by=fy+(fm==='story'?10:4)*u,qs=footH-(fm==='story'?70:36)*u;c.globalAlpha=.07;c.fillStyle=th.fg;rr(c,pad,by,W-2*pad,qs+(fm==='story'?40:24)*u,14*u);c.fill();c.globalAlpha=1;
  const q=qs*(fm==='story'?.88:.86),qy=by+((qs+(fm==='story'?40:24)*u)-q)/2;qrDraw(c,pad+20*u,qy,q,'#14110d','#ffffff',1);
  const tx=pad+q+48*u,tw=W-pad-tx-20*u,cyM=by+(qs+(fm==='story'?40:24)*u)/2;
  const a1='AGENDE PELO QR CODE OU PELO LINK',s1=fit(c,a1,tw,800,(fm==='story'?34:28)*u,12*u);lt(c,a1,tx,cyM-s1*.5,`800 ${s1}px Poppins,sans-serif`,th.ac,0,'l');
  const lk=linkShow(),s2=fit(c,lk,tw,800,(fm==='story'?38:32)*u,12*u);lt(c,lk,tx,cyM+s2*.75,`800 ${s2}px Poppins,sans-serif`,th.fg,0,'l');
  const l3=[cfg.ig,cfg.wpp].filter(Boolean).join('  ·  ');if(l3){const s3=fit(c,l3,tw,500,(fm==='story'?26:22)*u,11*u);lt(c,l3,tx,cyM+s2*.75+s3*1.6,`500 ${s3}px Poppins,sans-serif`,th.mu,0,'l')}
 }
}

// ---------- tela
let cv;
function draw(){if(!cv)return;const F=FM[cat.fmt]||FM.print;const pw=Math.min(F.W,1000),r=pw/F.W;cv.width=pw;cv.height=Math.round(F.H*r);const c=cv.getContext('2d');c.setTransform(r,0,0,r,0,0);poster(c,F.W,F.H,cat.fmt)}
function shrink(file,cb){const i=new Image();i.onload=()=>{const m=520,r=Math.min(1,m/Math.max(i.width,i.height));const k=document.createElement('canvas');k.width=Math.round(i.width*r);k.height=Math.round(i.height*r);k.getContext('2d').drawImage(i,0,0,k.width,k.height);cb(k.toDataURL('image/jpeg',.8));URL.revokeObjectURL(i.src)};i.onerror=()=>toast('Não consegui abrir essa imagem');i.src=URL.createObjectURL(file)}
function rows(){window.__catRows=()=>{clearTimeout(rows.r);rows.r=setTimeout(rows,300)};const L=document.getElementById('catL');L.innerHTML='';const on=cat.items.filter(i=>i.on).length;
 cat.items.forEach((it,k)=>{const d=document.createElement('div');d.className='item catr';
  d.innerHTML=`<div class="cath"><label class="cton"><input type="checkbox" ${it.on?'checked':''}> Mostrar</label><span class="catb"><button class="btn s" data-a="up" title="Subir">↑</button><button class="btn s" data-a="dn" title="Descer">↓</button><button class="btn s" data-a="rm" title="Excluir">✕</button></span></div>
  <div class="catg"><div class="catp"><canvas width="120" height="120"></canvas><label class="btn s catf">${PH[it.id]?'Trocar foto':'Pôr sua foto'}<input type="file" accept="image/*" hidden></label>${PH[it.id]?'<button class="btn s" data-a="nf">Usar foto padrão</button>':''}</div>
  <div class="g" style="grid-template-columns:1fr"><div><label>Nome do corte</label><input type="text" data-k="n" value="${esc(it.n)}"></div><div><label>Descrição curta</label><input type="text" data-k="d" maxlength="70" value="${esc(it.d)}"></div><div class="g" style="grid-template-columns:1fr 1fr"><div><label>Preço (opcional)</label><input type="text" data-k="p" inputmode="decimal" placeholder="35" value="${esc(it.p)}"></div><div><label>Foto padrão</label><select data-k="s">${Object.entries(STY).map(([v,l])=>`<option value="${v}" ${v===it.s?'selected':''}>${l}</option>`).join('')}</select></div></div></div></div>`;
  const pc=d.querySelector('canvas'),pd=()=>{const c=pc.getContext('2d');const img=(PH[it.id]&&IMG[it.id]&&IMG[it.id].complete?IMG[it.id]:null)||getDef(it.s);if(img)photo(c,img,0,0,120,120);else cutArt(c,0,0,120,120,it.s)};pd();if(PH[it.id]&&!(IMG[it.id]&&IMG[it.id].complete)){getImg(it.id);setTimeout(pd,300)}
  d.querySelector('.cton input').onchange=e=>{if(e.target.checked&&on>=12){e.target.checked=false;return toast('Máximo de 12 cortes no catálogo')}it.on=e.target.checked;saveC();rows();draw()};
  d.querySelectorAll('[data-k]').forEach(el=>{el.oninput=el.onchange=()=>{it[el.dataset.k]=el.value;saveC();if(el.dataset.k==='s')pd();clearTimeout(rows.t);rows.t=setTimeout(draw,200)}});
  d.querySelector('input[type=file]').onchange=e=>{const f=e.target.files[0];if(!f)return;shrink(f,u=>{const old=PH[it.id];PH[it.id]=u;if(!saveP()){if(old)PH[it.id]=old;else delete PH[it.id];return}delete IMG[it.id];getImg(it.id);setTimeout(()=>{rows();draw()},150);toast('Foto adicionada')})};
  d.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{const a=b.dataset.a;if(a==='up'&&k>0)[cat.items[k-1],cat.items[k]]=[cat.items[k],cat.items[k-1]];if(a==='dn'&&k<cat.items.length-1)[cat.items[k+1],cat.items[k]]=[cat.items[k],cat.items[k+1]];if(a==='rm'){if(!confirmRm(it))return;delete PH[it.id];saveP();cat.items.splice(k,1)}if(a==='nf'){delete PH[it.id];delete IMG[it.id];saveP()}saveC();rows();draw()});
  L.appendChild(d)});
 document.getElementById('catN').textContent=`${on} de 12 cortes no catálogo`}
function confirmRm(it){return !it._rm?(it._rm=1,toast('Toque em ✕ de novo para excluir'),setTimeout(()=>{delete it._rm},2500),false):true}
function build(){
 const s=document.getElementById('s_catalogo');
 if(!s.dataset.i){s.dataset.i=1;
  const ti=document.getElementById('catT'),su=document.getElementById('catS'),ou=document.getElementById('catO');ti.value=cat.titulo;su.value=cat.sub;ou.value=cat.outros;
  ti.oninput=()=>{cat.titulo=ti.value;saveC();draw()};su.oninput=()=>{cat.sub=su.value;saveC();draw()};ou.oninput=()=>{cat.outros=ou.value;saveC();draw()};
  document.querySelectorAll('#catF button').forEach(b=>{b.classList.toggle('on',b.dataset.f===cat.fmt);b.onclick=()=>{cat.fmt=b.dataset.f;saveC();document.querySelectorAll('#catF button').forEach(x=>x.classList.toggle('on',x===b));document.getElementById('catHint').textContent=cat.fmt==='print'?'Imprima em papel A3 ou A4 (gráfica ou em casa). A lista de outros serviços aparece só no pôster.':'Pronto para postar no Instagram.';draw()}});
  document.getElementById('catAdd').onclick=()=>{const on=cat.items.filter(i=>i.on).length;cat.items.push({id:'u'+Date.now(),s:'mid',n:'Novo corte',d:'',p:'',on:on<12});saveC();rows();draw();setTimeout(()=>document.querySelector('#catL .catr:last-child input[data-k=n]').select(),50)};
  document.getElementById('catDl').onclick=()=>{const F=FM[cat.fmt];const k=document.createElement('canvas');k.width=F.W;k.height=F.H;poster(k.getContext('2d'),F.W,F.H,cat.fmt);dl(k,F.f);toast('Baixando '+F.lab)};
  document.getElementById('catR').onclick=()=>{if(!confirmRm(cat))return;cat.items=DEF.map(([s,n,d],i)=>({id:'c'+i,s,n,d,p:'',on:true}));PH={};saveP();saveC();rows();draw();toast('Catálogo restaurado')};
  document.getElementById('catHint').textContent=cat.fmt==='print'?'Imprima em papel A3 ou A4 (gráfica ou em casa). A lista de outros serviços aparece só no pôster.':'Pronto para postar no Instagram.';
  cv=document.getElementById('catCv');rows()}
 draw()}

const css=document.createElement('style');css.textContent=`
.catw{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:18px;align-items:start}
@media(min-width:821px){.catv{position:sticky;top:64px}}
@media(max-width:820px){.catw{grid-template-columns:1fr}.catv{order:-1}}
.catv canvas{width:100%;height:auto;border-radius:8px;display:block}
.cath{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}.cton{display:flex;gap:6px;align-items:center;font-size:13px;margin:0}.cton input{width:18px;height:18px}
.catb{display:flex;gap:4px}.catb .btn{padding:5px 10px}
.catg{display:grid;grid-template-columns:120px 1fr;gap:12px}.catp{display:flex;flex-direction:column;gap:6px}.catp canvas{width:120px;height:120px;border-radius:8px}.catp .btn{text-align:center;padding:7px 8px;font-size:12px}
.catf{display:block;margin:0;color:var(--tx)!important;font-weight:700!important}
@media(max-width:480px){.catg{grid-template-columns:92px 1fr}.catp canvas{width:92px;height:92px}}
`;document.head.appendChild(css);

const X=EXTRAS.X,init0=EXTRAS.init;
X.splice(5,0,['catalogo','Catálogo de cortes','Pôster com os cortes, fotos e preços, para a parede e o Instagram','💈']);
EXTRAS.init=function(){init0();if(document.getElementById('s_catalogo'))return;
 const s=document.createElement('section');s.className='sec x';s.id='s_catalogo';
 s.innerHTML=`<p class="i">Monte o catálogo da sua barbearia: o cliente aponta o corte que quer e não tem erro. Já vem com fotos de exemplo; troque pelas fotos dos seus cortes, ajuste nomes e preços e baixe.</p>
 <div class="catw"><div>
 <div class="item"><div class="g" style="grid-template-columns:1fr"><div><label>Título</label><input type="text" id="catT" maxlength="40"></div><div><label>Frase abaixo do título</label><input type="text" id="catS" maxlength="60"></div></div></div>
 <h3 style="display:flex;justify-content:space-between;align-items:center">Cortes <small id="catN" style="color:var(--mu);font-weight:500;font-size:13px"></small></h3>
 <p class="i" style="font-size:13px;margin-top:-4px">Dica: fotografe o corte de lado, com fundo liso e boa luz. Peça autorização do cliente antes de usar a foto.</p>
 <div id="catL"></div><button class="btn s" id="catAdd">+ Adicionar corte</button>
 <h3>Outros serviços (só no pôster)</h3><textarea id="catO" style="min-height:120px" placeholder="Barba | 30&#10;Sobrancelha | 10"></textarea><p class="i" style="font-size:13px;margin-top:6px">Formato: nome | preço, um por linha. Até 7 itens.</p>
 <button class="btn s" id="catR" style="margin-top:6px">Restaurar catálogo padrão</button>
 </div><div class="catv"><div class="row"><div class="seg" id="catF"><button data-f="print">Pôster A3/A4</button><button data-f="feed">Feed 4:5</button><button data-f="story">Story 9:16</button></div></div>
 <div class="card"><canvas id="catCv"></canvas><div class="m"><span id="catHint">Imprima em papel A3 ou A4 (gráfica ou em casa). A lista de outros serviços aparece só no pôster.</span><button class="btn" id="catDl">Baixar</button></div></div></div></div>`;
 document.getElementById('app').appendChild(s);
 window.BUILD.catalogo=build};
window.__catPoster=poster;window.__catState=()=>cat;
})();
