const $=id=>document.getElementById(id),ns='http://www.w3.org/2000/svg';let state,offset=0,drawKey='',phaseKey='',lastOk=0,raf=0;
const demo=!!window.WHEEL_DEMO||new URLSearchParams(location.search).has('demo'),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
function resize(){$('canvas').style.transform=`scale(${Math.min(innerWidth/1920,innerHeight/1080)})`;}addEventListener('resize',resize);resize();
for(let i=0;i<48;i++){const l=document.createElement('i');l.style.transform=`rotate(${i*7.5}deg) translateY(-249px)`;$('leds').append(l);}for(let i=0;i<5;i++)$('pips').append(document.createElement('i'));
function svg(type,attrs){const e=document.createElementNS(ns,type);for(const [k,v]of Object.entries(attrs))e.setAttribute(k,v);return e;}
function polar(r,a){return [280+r*Math.cos(a),280+r*Math.sin(a)];}
function draw(segments){
 $('wheel').replaceChildren();const n=segments.length,step=2*Math.PI/n,defs=svg('defs',{});$('wheel').append(defs);
 const aliases={'SEERNE DRIKKER':['SKÅL','CHAT'],'STUDIET DRIKKER':['SKÅL','STUDIE'],'MUSIKSKAM':['MUSIKSKAM'],'EMOJI-DOM':['EMOJI-DOM'],'VÆLG SIDE':['VÆLG SIDE'],'SANGMINDE':['SANGMINDE'],'STUE-DANS':['STUE-DANS'],'SYNG MED':['SYNG MED'],'CHAT-DJ':['CHAT-DJ'],'CHAT-JOKE':['CHAT-JOKE']};
 segments.forEach((s,i)=>{
 const a=-Math.PI/2+i*step,b=a+step,p=polar(231,a),q=polar(231,b),path=`M280 280 L${p.join(' ')} A231 231 0 0 1 ${q.join(' ')} Z`,g=svg('g',{}),rgb=s.color.slice(1).match(/../g).map(v=>parseInt(v,16));
 if(rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722<115)g.setAttribute('class','dark');
 g.append(svg('path',{d:path,fill:s.color,stroke:'#141522','stroke-width':2}));
 const clip=svg('clipPath',{id:'field-'+i});clip.append(svg('path',{d:path}));defs.append(clip);
 const layer=svg('g',{'clip-path':`url(#field-${i})`}),mid=(i+.5)*360/n-90,pos=polar(155,(a+b)/2);
 // Radial labels use the long dimension of each wedge, not its narrow arc.
 const label=svg('text',{x:pos[0],y:pos[1],'text-anchor':'middle','dominant-baseline':'middle',transform:`rotate(${mid} ${pos[0]} ${pos[1]})`});
 let lines=aliases[s.label];if(!lines){const words=s.label.split(/\s+/);lines=[''];for(const word of words){const last=lines.length-1;if(lines[last]&&lines[last].length+word.length+1>10&&lines.length<2)lines.push(word);else lines[last]+=(lines[last]?' ':'')+word;}}
 lines.slice(0,2).forEach((line,j)=>{const t=svg('tspan',{x:pos[0],y:pos[1]+(j-(lines.length-1)/2)*19});t.textContent=line;label.append(t);});
 layer.append(label);g.append(layer);$('wheel').append(g);
 // Measure actual glyphs once after insertion; only shrink a custom long label.
 for(const line of label.children){const length=line.getComputedTextLength(),limit=Math.min(132,2*(155-21/Math.tan(Math.PI/n)));if(length>limit){line.setAttribute('textLength',limit);line.setAttribute('lengthAdjust','spacingAndGlyphs');}}
 });
}
function confetti(){if(reduced)return;$('confetti').replaceChildren();for(let i=0;i<26;i++){const e=document.createElement('i');e.style.left=(10+Math.random()*80)+'%';e.style.background=['#d7ff54','#ff4faf','#60e9ec'][i%3];e.style.animationDelay=Math.random()*.5+'s';e.style.setProperty('--drift',(Math.random()*100-50)+'px');$('confetti').append(e);}setTimeout(()=>$('confetti').replaceChildren(),3500);}
function render(s){state=s;offset=s.serverNow-Date.now();lastOk=Date.now();const r=s.settings.placement,scale=Math.min(r.width/620,r.height/820);$('stage').style.left=r.x+'px';$('stage').style.top=r.y+'px';$('stage').style.transform=`scale(${scale})`;const segments=s.spin?.segments||s.settings.segments,key=JSON.stringify(segments);if(key!==drawKey){drawKey=key;draw(segments);}$('starter').textContent=s.startedBy||'FÆLLESSKABET';$('reason').textContent=s.source==='points'?'25.000 KANALPOINT':s.source==='manual'?'STARTET AF STUDIET':'5 SUBS / RESUBS SAMLET';$('round').textContent=String(s.round).padStart(2,'0');const p=s.phase,newKey=p+'-'+s.spin?.id;
 if(newKey!==phaseKey){phaseKey=newKey;if(p==='result')confetti();}
 if(p==='result'){const winner=s.spin.segments[s.spin.index];$('kicker').textContent='HJULET HAR TALT';$('result-title').textContent=winner.label;$('result-copy').textContent=winner.text;$('hub-top').textContent='WEEKENDENS';$('hub-main').textContent='DOM';$('hub-bottom').textContent='INGEN ANKEMULIGHED';}
 else if(p==='paused'){$('kicker').textContent='VI HOLDER LIGE IGEN';$('result-title').textContent='HJULET ER PÅ PAUSE';$('result-copy').textContent='Studiet genoptager om et øjeblik.';$('hub-main').textContent='Ⅱ';}
 else{$('kicker').textContent=p==='countdown'?'NU ER DER INGEN VEJ TILBAGE':'SKÆBNEN ER I BEVÆGELSE';$('result-title').textContent=p==='countdown'?'ER I KLAR?':'HVEM RAMMER DEN?';$('result-copy').textContent='Hjulet bestemmer. Chatten er med.';$('hub-top').textContent='WEEKEND';$('hub-bottom').textContent='SKÆBNEN KALDER';}
 cancelAnimationFrame(raf);frame();}
function frame(){if(!state)return;const s=state,now=Date.now()+offset,p=s.phase,active=['countdown','spinning','result','paused'].includes(p),cool=Math.max(0,Math.ceil((s.cooldownUntil-now)/1000));const showMini=!active&&s.armed&&(s.settings.compact||now<s.pulseUntil);$('stage').className=(!active&&!showMini?'hidden ':!active?'mini ':'')+(p==='result'?'result-phase':'');
 if(s.spin){let progress=p==='result'?1:p==='countdown'?0:Math.max(0,Math.min(1,(now-s.spin.startAt)/s.spin.duration));if(p==='paused')progress=0;const eased=1-Math.pow(1-progress,5),angle=reduced?(progress>=1?s.spin.rotation:0):s.spin.rotation*eased;$('wheel').style.transform=`rotate(${angle}deg)`;}
 if(p==='countdown')$('hub-main').textContent=Math.max(1,Math.ceil((s.deadline-now)/1000));else if(p==='spinning')$('hub-main').textContent='✳';
 $('compact-title').textContent=cool?'HJULET KØLER NED':'WEEKEND DOOMS WHEEL';$('compact-copy').textContent=cool?`Næste spin om ${Math.floor(cool/60)}:${String(cool%60).padStart(2,'0')} · ${s.queued} klar`:(s.queued?`${s.queued} spin klar · ${s.progress}/5 til næste`:`${s.progress}/5 subs/resubs · eller 25.000 kanalpoint`);[...$('pips').children].forEach((e,i)=>e.classList.toggle('on',i<s.progress));
 if(p==='spinning'&&!reduced)raf=requestAnimationFrame(frame);}
setInterval(()=>{if(state){if(!demo&&Date.now()-lastOk>10000&&['countdown','spinning'].includes(state.phase)){state={...state,phase:'paused'};phaseKey='';renderStale();}frame();}},200);
function renderStale(){$('result-title').textContent='FORBINDELSEN ER PÅ PAUSE';$('result-copy').textContent='Vi venter på hjulmotoren.';$('hub-main').textContent='Ⅱ';}
const params=new URLSearchParams(location.hash.slice(1));let access=params.get('key')||sessionStorage.getItem('wheel-overlay')||'';if(params.has('key')){sessionStorage.setItem('wheel-overlay',access);history.replaceState(null,'',location.pathname+location.search);}
async function poll(){try{const r=await fetch(WHEEL_CONFIG.api+'/tick',{method:'POST',headers:{'X-Overlay-Token':access},signal:AbortSignal.timeout(8000)});if(!r.ok)throw Error();render(await r.json());}catch{}finally{setTimeout(poll,1500);}}
if(demo){document.body.classList.add('demo');$('demo-label').hidden=false;const script=document.createElement('script');script.src='demo-data.js';document.body.append(script);}else if(access)poll();
