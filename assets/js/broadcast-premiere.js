
/* =========================================================
   DJ FOLSOE V1001.4 — BROADCAST PREMIERE ENHANCER
   Profile portrait, audience copy, show identity and fallbacks.
   ========================================================= */
(() => {
  const API=(window.DJF_API_BASE||'https://djfolsoe-tv-api.sunefolsoe.workers.dev').replace(/\/$/,'');
  const $=id=>document.getElementById(id);

  async function getJson(path){
    try{
      const response=await fetch(`${API}${path}${path.includes('?')?'&':'?'}t=${Date.now()}`,{cache:'no-store'});
      return response.ok?await response.json():null;
    }catch(_){return null}
  }

  function setText(id,value){
    const node=$(id);
    if(node && value!==undefined && value!==null && String(value).trim()) node.textContent=value;
  }

  function setProfile(url){
    if(!url) return;
    ['navProfileImage','heroProfileImage'].forEach(id=>{
      const image=$(id);
      if(image && image.src!==url) image.src=url;
    });
  }

  function coreFrom(value){
    return value?.core || value?.data || value?.broadcast?.core || value?.broadcast?.data || value || {};
  }

  function applyBroadcast(payload){
    const core=coreFrom(payload);
    const twitch=core.twitch||payload?.broadcast||{};
    const show=core.show||{};
    const theme=core.theme||{};
    const live=!!(twitch.live||twitch.isLive||show.live);

    document.body.classList.toggle('ux-live',live);
    setProfile(twitch.profileImage||twitch.profile_image_url||payload?.broadcast?.profileImage);
    setText('navDisplayName',twitch.displayName||'DJ FOLSOE');
    setText('navState',live?'LIVE':'OFFLINE');
    setText('livePill',live?'LIVE NOW':'OFFLINE');
    setText('currentShow',show.title||show.current||twitch.title||'DJ FOLSOE');
    setText('streamTitle',show.streamTitle||twitch.title||(live?'Live now on Twitch':'Next broadcast coming soon'));
    setText('metricViewers',Number(twitch.viewers||show.viewers||0).toLocaleString());
    setText('metricFollowers',Number(twitch.followers||core.community?.followers||0).toLocaleString());
    setText('uxThemeName',(theme.title||theme.id||'Music TV').toUpperCase());
    setText('premiereHeroTheme',theme.title||theme.id||'Music TV');

    const description=twitch.description||core.hero?.text||core.community?.text;
    if(description) setText('navProfileDescription',description);
  }

  function decorateShowCards(){
    document.querySelectorAll('#showCards > *').forEach((card,index)=>{
      card.dataset.showIndex=String(index+1).padStart(2,'0');
      if(card.querySelector('.premiereShowNumber')) return;
      const label=document.createElement('span');
      label.className='premiereShowNumber';
      label.textContent=String(index+1).padStart(2,'0');
      card.prepend(label);
    });
  }

  function simplifyCommands(){
    const grid=$('extViewerCommands');
    if(!grid) return;
    grid.setAttribute('aria-label','All active Twitch commands');
  }

  async function refresh(){
    const experience=await getJson('/api/experience/state');
    const broadcast=await getJson('/api/broadcast');
    applyBroadcast(experience?.broadcast?experience:broadcast);
    decorateShowCards();
    simplifyCommands();
  }

  document.addEventListener('DOMContentLoaded',()=>{
    refresh();
    const observer=new MutationObserver(()=>{
      decorateShowCards();
      simplifyCommands();
    });
    observer.observe(document.body,{childList:true,subtree:true});
    setInterval(refresh,30000);
  });
})();
