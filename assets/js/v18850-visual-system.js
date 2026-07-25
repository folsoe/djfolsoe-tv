/* DJ FOLSOE V18850 · SHARED DESIGN RUNTIME */
(function(global){
  "use strict";

  const VERSION="V18850";
  const VALID_THEMES=[
    "morning","trance","eurodance","fredagsbar","retro",
    "popup","summer","weekend","danske","top20"
  ];
  const STORAGE_KEY="djf-v18850-visual-system";

  const state={
    theme:"morning",
    density:"comfortable",
    motion:"full",
    applications:0,
    errors:[]
  };

  function clean(value){return String(value||"").toLowerCase().trim()}
  function validTheme(value){
    const key=clean(value);
    return VALID_THEMES.includes(key)?key:"morning";
  }
  function applyTheme(theme,root=document.documentElement){
    const safe=validTheme(theme);
    state.theme=safe;
    state.applications++;
    root.setAttribute("data-djf-theme",safe);
    try{
      localStorage.setItem(STORAGE_KEY,JSON.stringify({
        theme:state.theme,density:state.density,motion:state.motion
      }));
    }catch(error){state.errors.push(String(error))}
    window.dispatchEvent(new CustomEvent("djf:visual-theme",{
      detail:{theme:safe,version:VERSION}
    }));
    return safe;
  }
  function setDensity(value,root=document.documentElement){
    const safe=["compact","comfortable","spacious"].includes(value)
      ? value : "comfortable";
    state.density=safe;
    root.setAttribute("data-djf-density",safe);
    return safe;
  }
  function setMotion(value,root=document.documentElement){
    const safe=["full","reduced","none"].includes(value)?value:"full";
    state.motion=safe;
    root.setAttribute("data-djf-motion",safe);
    return safe;
  }
  function restore(root=document.documentElement){
    try{
      const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}");
      if(saved.density) setDensity(saved.density,root);
      if(saved.motion) setMotion(saved.motion,root);
      return applyTheme(saved.theme||"morning",root);
    }catch(_){
      return applyTheme("morning",root);
    }
  }
  function getStatus(){
    return {
      version:VERSION,
      theme:state.theme,
      density:state.density,
      motion:state.motion,
      applications:state.applications,
      errors:state.errors.slice()
    };
  }

  global.DJF_VISUAL_SYSTEM=Object.freeze({
    version:VERSION,
    themes:VALID_THEMES.slice(),
    applyTheme,setDensity,setMotion,restore,getStatus
  });
})(window);


/* DJ FOLSOE V18850.1 · EXISTING SITE/ADMIN BINDING */
(function(){
  "use strict";

  const THEME_ALIASES={
    "good morning twitch":"morning",
    "morning":"morning",
    "trance tuesday":"trance",
    "trance":"trance",
    "eurodance":"eurodance",
    "fredagsbar":"fredagsbar",
    "friday bar":"fredagsbar",
    "retro hits":"retro",
    "retro":"retro",
    "pop up live":"popup",
    "popup":"popup",
    "summer beats":"summer",
    "summer":"summer",
    "weekend vibes":"weekend",
    "weekend":"weekend",
    "danish hits":"danske",
    "danske":"danske",
    "folsoe top 20":"top20",
    "folsø top 20":"top20",
    "top20":"top20",
    "chart":"top20"
  };

  function normalizeTheme(value){
    const raw=String(value||"").toLowerCase().trim();
    return THEME_ALIASES[raw] || (window.DJF_VISUAL_SYSTEM?.themes.includes(raw) ? raw : "morning");
  }

  function setTheme(value,source="binding"){
    const theme=normalizeTheme(value);
    window.DJF_VISUAL_SYSTEM?.applyTheme(theme,document.documentElement);
    document.documentElement.dataset.djfThemeSource=source;
    return theme;
  }

  function bindWebsite(){
    const active=document.getElementById("activeTheme");
    if(active){
      const observer=new MutationObserver(()=>setTheme(active.textContent,"website-core"));
      observer.observe(active,{childList:true,characterData:true,subtree:true});
      setTheme(active.textContent,"website-startup");
    }
    window.addEventListener("djf:broadcast-core",event=>{
      const core=event.detail||{};
      setTheme(core.theme?.id||core.theme?.title||core.activeTheme,"website-event");
    });
  }

  function bindAdmin(){
    const select=document.getElementById("theme");
    if(select){
      select.addEventListener("change",()=>setTheme(select.value,"admin-select"));
      setTheme(select.value,"admin-startup");
    }
    const currentShow=document.getElementById("currentShow");
    if(currentShow){
      currentShow.addEventListener("change",()=>{
        setTimeout(()=>setTheme(select?.value||currentShow.value,"admin-show"),0);
      });
    }
    window.addEventListener("djf:admin-core-loaded",event=>{
      const core=event.detail||{};
      setTheme(core.theme?.id||core.theme?.title,"admin-core");
    });
  }

  document.addEventListener("DOMContentLoaded",()=>{
    window.DJF_VISUAL_SYSTEM?.restore(document.documentElement);
    if(document.documentElement.dataset.djfSurface==="website") bindWebsite();
    if(document.documentElement.dataset.djfSurface==="admin") bindAdmin();
  });

  window.DJF_EXISTING_VISUAL_BINDING=Object.freeze({
    version:"V18850.1",
    normalizeTheme,
    setTheme,
    getStatus:()=>({
      theme:document.documentElement.dataset.djfTheme||"morning",
      surface:document.documentElement.dataset.djfSurface||"unknown",
      source:document.documentElement.dataset.djfThemeSource||"startup"
    })
  });
})();


/* DJ FOLSOE V18900 · BROADCAST EXPERIENCE REVOLUTION */
(function(){
"use strict";
const VERSION="V18900";
function overlayExperience(){
  const root=document.getElementById("djfBroadcastPackage");
  if(!root||window.DJF_BROADCAST_EXPERIENCE)return;
  root.classList.add("v18900ExperienceRevolution");
  const state={focus:"balanced",energy:"balanced",changes:0,lastChangeAt:0};
  let timer=null;
  function setFocus(focus,duration=0){
    const safe=["balanced","centre","lower-third","music"].includes(focus)?focus:"balanced";
    state.focus=safe;state.changes++;state.lastChangeAt=Date.now();root.dataset.viewerFocus=safe;
    clearTimeout(timer);if(duration>0)timer=setTimeout(()=>setFocus("balanced"),duration);return safe;
  }
  function setEnergy(energy){
    const safe=["calm","balanced","high"].includes(energy)?energy:"balanced";
    state.energy=safe;root.dataset.viewerEnergy=safe;return safe;
  }
  window.addEventListener("djf:graphics-show",e=>setFocus("lower-third",Number(e.detail?.duration)||7600));
  window.addEventListener("djf:generated-graphic-published",e=>setFocus("lower-third",Number(e.detail?.graphic?.duration)||9000));
  window.addEventListener("djf:community-show",e=>setFocus("lower-third",Number(e.detail?.event?.duration)||8200));
  window.addEventListener("djf:music-track",()=>setFocus("music",4200));
  window.addEventListener("djf:performance-transition-start",e=>setFocus("centre",Number(e.detail?.duration)||2600));
  window.addEventListener("djf:performance-active-deck",e=>setEnergy(e.detail?.energy||"balanced"));
  window.DJF_BROADCAST_EXPERIENCE=Object.freeze({
    version:VERSION,setFocus,setEnergy,
    getStatus:()=>({...state,version:VERSION})
  });
  setFocus("balanced");setEnergy("balanced");
}
document.addEventListener("DOMContentLoaded",overlayExperience);
window.DJF_EXPERIENCE_REVOLUTION=Object.freeze({version:VERSION});
})();
