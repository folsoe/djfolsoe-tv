
(()=>{
 if(/(?:admin|overlay|streamelements|twitch-connect)/i.test(location.pathname))return;
 const API='https://djfolsoe-tv-api.sunefolsoe.workers.dev';
 const path=location.pathname;
 const isHome=path==='/'||path.endsWith('/index.html')&&path.split('/').filter(Boolean).length===1;
 document.body.classList.add('djfUnifiedPublic');
 if(!isHome){
   const old=[...document.body.children].find(x=>x.tagName==='HEADER'); if(old) old.classList.add('djfLegacyHeaderHidden');
   const mast=document.createElement('header'); mast.className='djfUnifiedMasthead';
   mast.innerHTML=`<div class="djfMastTop"><a class="djfMastCell djfMastBrand" href="/"><span class="djfMastBrandMark">DJF</span><span><strong>DJ FOLSOE</strong><small>ON TWITCH · LIVE MUSIC TV</small></span></a><section class="djfMastCell"><span class="djfMastIcon">♫</span><span><small>FOLSOE TV</small><strong>${document.title.split('|')[0].split('·')[0].trim()||'DJ FOLSOE'}</strong><b>Music · shows · community</b></span></section><section class="djfMastCell"><span class="djfMastIcon">●</span><span><small>CHANNEL STATUS</small><strong id="djfUnifiedStatus">DJ FOLSOE</strong><b id="djfUnifiedNext">Official Twitch schedule</b></span></section><section class="djfMastCell djfMastSupport"><span class="djfMastIcon">♥</span><span><small>SUPPORT THE STREAM</small><strong>MOBILEPAY / VIPPS</strong><b>1267PN</b></span></section></div><nav class="djfMastNav"><a href="/">HOME</a><i></i><a href="/watch-live/">LIVE</a><i></i><a href="/shows/">SHOWS</a><i></i><a href="https://twitch.tv/djfolsoe/schedule" target="_blank" rel="noopener">SCHEDULE</a><i></i><a href="/music/">MUSIC</a><i></i><a href="/guides/">GUIDES</a><i></i><a href="/charts/">CHARTS</a><i></i><a href="/archive/">ARCHIVE</a><i></i><a href="/about-dj-folsoe/">ABOUT</a><i></i><a href="https://djfolsoe-shop.fourthwall.com/" target="_blank" rel="noopener">SHOP ↗</a><i></i><a href="https://twitch.tv/djfolsoe" target="_blank" rel="noopener">TWITCH ↗</a></nav>`;
   document.body.prepend(mast);
   mast.querySelectorAll('a').forEach(a=>{try{if(a.pathname===path)a.setAttribute('aria-current','page')}catch(_){}});
   const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),8000);
   Promise.allSettled([fetch(API+'/api/twitch',{cache:'no-store',signal:controller.signal}).then(r=>{if(!r.ok)throw Error(r.status);return r.json()}),fetch(API+'/api/twitch-schedule',{cache:'no-store',signal:controller.signal}).then(r=>{if(!r.ok)throw Error(r.status);return r.json()})]).then(([tw,sc])=>{
     const raw=tw.value,t=raw?.data||raw?.twitch||raw, s=sc.value?.data||sc.value;let state='STATUS UNKNOWN';
     const stamp=raw?.generatedAt||raw?.updatedAt,stale=stamp&&(!Number.isFinite(Date.parse(stamp))||Date.now()-Date.parse(stamp)>600000);
     if(tw.status==='fulfilled'&&t&&!t.error&&!raw.error&&!stale){const v=t.live??t.isLive??t.online??t.stream?.live;if(v===true||v===1||v==='true'||t.type==='live'||t.stream?.type==='live')state='LIVE';else if(v===false||v===0||v==='false'||t.type==='offline'||Object.hasOwn(t,'stream')&&t.stream===null)state='OFF AIR';}
     const st=document.getElementById('djfUnifiedStatus');if(st)st.textContent='DJ FOLSOE · '+state;
     const nx=document.getElementById('djfUnifiedNext');if(nx){const source=s?.segments,rows=[...(Array.isArray(source)?source:[]),s?.next||s?.nextShow].filter(x=>x&&!x.canceledUntil&&!x.canceled_until&&!x.cancelled&&!x.canceled&&Date.parse(x.startTime||x.start_time)>Date.now()).sort((a,b)=>Date.parse(a.startTime||a.start_time)-Date.parse(b.startTime||b.start_time));const n=rows[0];nx.textContent=n?'NEXT · '+(n.title||n.name||'DJ FOLSOE'):sc.status==='fulfilled'&&Array.isArray(source)&&!s.error?'No upcoming show announced':'Schedule unavailable — check Twitch';}
   }).finally(()=>clearTimeout(timeout));
 }
 async function charts(){
   const nodes=[...document.querySelectorAll('.djfChartTeaser[data-chart-kind]')]; if(!nodes.length)return;
   try{const r=await fetch(API+'/api/cms/chart-universe',{cache:'no-store'});const j=await r.json();const u=j.chartUniverse||j;nodes.forEach(n=>{const kind=n.dataset.chartKind||'top20';const arr=(u[kind]||[]).filter(x=>x.artist||x.title).slice(0,5);const g=n.querySelector('.djfChartTeaserGrid');if(g)g.innerHTML=arr.length?arr.map(x=>`<article class="djfChartMini"><b>${String(x.rank||'').padStart(2,'0')}</b><div><strong>${esc(x.artist||'—')} — ${esc(x.title||'—')}</strong><span>${kind==='retro_top10'&&x.year?esc(x.year)+' · ':''}${x.status?esc(x.status):'DJ FOLSOE CHART'}</span></div></article>`).join(''):'<p>Chart is ready for the next update.</p>'})}catch(e){nodes.forEach(n=>{const g=n.querySelector('.djfChartTeaserGrid');if(g)g.innerHTML='<p>Chart temporarily unavailable.</p>'})}
 }
 function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
 charts();
})();

/* Load the shared public music-TV identity exactly once. */
(()=>{if(window.DJF_STATION_BOOT||/(?:admin|overlay|streamelements|twitch-connect)/i.test(location.pathname))return;window.DJF_STATION_BOOT=true;
const css=document.createElement('link');css.rel='stylesheet';css.href='/assets/css/station-2026.css?v=overlay-20261015';document.head.append(css);
const js=document.createElement('script');js.src='/assets/js/station-2026.js?v=overlay-20261015';js.defer=true;document.head.append(js);})();

/* Share one language preference across the existing public pages. */
(()=>{if(/(?:admin|overlay|streamelements|twitch-connect)/i.test(location.pathname)||window.DJF_I18N||document.querySelector('script[src*="/site-i18n.js"]'))return;
 const css=document.createElement('link');css.rel='stylesheet';css.href='/assets/css/site-i18n.css?v=1';document.head.append(css);
 const start=()=>{if(window.DJF_I18N)return;const script=document.createElement('script');script.src='/assets/js/site-i18n.js?v=20-29';document.head.append(script);};
 if(window.DJF_SITE_TRANSLATIONS)start();else{const catalog=document.createElement('script');catalog.src='/assets/js/site-i18n-catalog.js?v=20-29';catalog.onload=start;document.head.append(catalog);}
})();
