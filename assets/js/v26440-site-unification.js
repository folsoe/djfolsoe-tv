
(()=>{
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
   Promise.allSettled([fetch(API+'/api/twitch',{cache:'no-store'}).then(r=>r.json()),fetch(API+'/api/twitch-schedule',{cache:'no-store'}).then(r=>r.json())]).then(([tw,sc])=>{
     const t=tw.value||{}, s=sc.value||{}; const live=!!(t.live||t.isLive||t.stream?.live); const st=document.getElementById('djfUnifiedStatus'); if(st)st.textContent=live?'DJ FOLSOE · LIVE':'DJ FOLSOE · OFF AIR';
     const n=s.next||s.nextShow||s.segments?.[0]||s.data?.segments?.[0]; const nx=document.getElementById('djfUnifiedNext'); if(nx&&n)nx.textContent=`NEXT · ${n.title||n.name||'SHOW'}`;
   });
 }
 async function charts(){
   const nodes=[...document.querySelectorAll('.djfChartTeaser[data-chart-kind]')]; if(!nodes.length)return;
   try{const r=await fetch(API+'/api/cms/chart-universe',{cache:'no-store'});const j=await r.json();const u=j.chartUniverse||j;nodes.forEach(n=>{const kind=n.dataset.chartKind||'top20';const arr=(u[kind]||[]).filter(x=>x.artist||x.title).slice(0,5);const g=n.querySelector('.djfChartTeaserGrid');if(g)g.innerHTML=arr.length?arr.map(x=>`<article class="djfChartMini"><b>${String(x.rank||'').padStart(2,'0')}</b><div><strong>${esc(x.artist||'—')} — ${esc(x.title||'—')}</strong><span>${kind==='retro_top10'&&x.year?esc(x.year)+' · ':''}${x.status?esc(x.status):'DJ FOLSOE CHART'}</span></div></article>`).join(''):'<p>Chart is ready for the next update.</p>'})}catch(e){nodes.forEach(n=>{const g=n.querySelector('.djfChartTeaserGrid');if(g)g.innerHTML='<p>Chart temporarily unavailable.</p>'})}
 }
 function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
 charts();
})();
