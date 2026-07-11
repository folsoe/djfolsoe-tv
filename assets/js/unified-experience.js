
/* =========================================================
   DJ FOLSOE V1001 — UNIFIED EXPERIENCE WEBSITE RENDERER
   Reads shared module order/visibility/theme from Cloudflare.
   ========================================================= */
(() => {
  const API=(window.DJF_API_BASE || 'https://djfolsoe-tv-api.sunefolsoe.workers.dev').replace(/\/$/,'');
  const MODULE_SELECTORS={
    hero:'#live',
    broadcastGuide:'#broadcastGuide',
    next:'#next',
    activity:'#activityPulseEngine',
    shows:'#shows',
    top20:'#top20',
    commands:'#viewerCommands',
    requests:'#requests'
  };

  async function getState(){
    try{
      const response=await fetch(`${API}/api/experience/state?t=${Date.now()}`,{cache:'no-store'});
      if(!response.ok) throw new Error(String(response.status));
      return await response.json();
    }catch(error){
      console.warn('Unified Experience fallback:',error);
      return null;
    }
  }

  function setToken(name,value){
    if(value) document.documentElement.style.setProperty(name,value);
  }

  function applyTheme(theme={},state={}){
    setToken('--ux-primary',theme.primary);
    setToken('--ux-secondary',theme.secondary);
    setToken('--ux-highlight',theme.highlight);
    setToken('--ux-surface',theme.surface);

    const id=state?.config?.activeTheme || state?.broadcast?.theme?.id || 'weekend';
    document.body.dataset.uxTheme=id;
    const title=state?.broadcast?.theme?.title || id.replace(/-/g,' ');
    const titleNode=document.getElementById('uxThemeName');
    if(titleNode) titleNode.textContent=String(title).toUpperCase();
  }

  function applyModules(modules=[]){
    for(const module of modules){
      const selector=MODULE_SELECTORS[module.id];
      const node=selector ? document.querySelector(selector) : null;
      if(!node) continue;
      node.hidden=module.enabled===false;
      node.style.setProperty('--ux-order',String(Number(module.order)||50));
      node.dataset.uxMode=module.mode || '';
    }
  }

  function applyLiveState(state){
    const live=!!state?.broadcast?.live;
    document.body.classList.toggle('ux-live',live);
    document.body.classList.toggle('ux-offline',!live);
  }

  function removeLegacyRuntimeLayers(){
    [
      '#networkOS','#osController','#tvGraphicsEngine','#liveControlRoom',
      '.osNetworkRibbon','.osHeroPortal'
    ].forEach(selector=>document.querySelectorAll(selector).forEach(node=>node.remove()));
  }

  async function refresh(){
    removeLegacyRuntimeLayers();
    const state=await getState();
    if(!state?.ok) return;
    applyTheme(state.theme,state);
    applyModules(state.config?.website?.modules || []);
    applyLiveState(state);
  }

  document.addEventListener('DOMContentLoaded',()=>{
    refresh();
    setInterval(refresh,30000);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
  });
})();
