/* DJ FOLSOE V26280 — visual bridge. No replacement of existing live engines. */
(()=>{
  'use strict';
  const $=id=>document.getElementById(id);
  const text=(id,val)=>{const el=$(id); if(el && val!==undefined && val!==null && String(val).trim()!=='') el.textContent=String(val).trim();};
  const read=id=>$(id)?.textContent?.trim()||'';
  function sync(){
    text('v26280Viewers',read('heroViewers')||'0');
    text('v26280NextCompact',read('webDockNextTitle')||read('offlineNextTitle')||'SCHEDULE');
    text('v26280Theme',read('theme')||document.body.dataset.showTheme||'DJ FOLSOE');
    text('v26280Requests','OPEN');
    [['offDays','v26280Days'],['offHours','v26280Hours'],['offMinutes','v26280Minutes'],['offSeconds','v26280Seconds']].forEach(([a,b])=>text(b,read(a)||'00'));
    const state=(read('heroChannelState')||'').toUpperCase();
    document.body.classList.toggle('v26280-is-live',state.includes('LIVE')&&!state.includes('OFF'));
  }
  // Reuse the existing Worker/API already used by the website for follower truth; no new backend.
  async function followerSync(){
    try{
      const r=await fetch('https://djfolsoe-tv-api.sunefolsoe.workers.dev/api/twitch',{cache:'no-store',signal:AbortSignal.timeout?AbortSignal.timeout(4500):undefined});
      if(!r.ok) throw new Error('http '+r.status);
      const d=await r.json();
      const n=d.followers??d.followerCount??d.data?.followers??d.twitch?.followers;
      text('v26280Followers',Number.isFinite(Number(n))?Number(n).toLocaleString('da-DK'):'—');
    }catch(e){ text('v26280Followers','—'); }
  }
  const watched=['heroViewers','webDockNextTitle','offlineNextTitle','theme','offDays','offHours','offMinutes','offSeconds','heroChannelState'];
  const mo=new MutationObserver(sync); watched.forEach(id=>{const el=$(id); if(el) mo.observe(el,{subtree:true,childList:true,characterData:true,attributes:true});});
  const bo=new MutationObserver(sync); bo.observe(document.body,{attributes:true,attributeFilter:['data-show-theme','data-broadcast-state']});
  sync(); followerSync(); setInterval(sync,1000); setInterval(followerSync,60000);
  window.DJF_WEBSITE_V26280={version:'V26280',sync,followerSync,status:()=>({theme:document.body.dataset.showTheme,state:read('heroChannelState'),viewers:read('v26280Viewers'),followers:read('v26280Followers'),next:read('v26280NextCompact')})};
})();
