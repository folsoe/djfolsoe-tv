/* DJ FOLSOE V26130 — BROADCAST POLISH & PERFORMANCE
   Website-only progressive enhancement. */
(() => {
  'use strict';
  const BUILD='V26130';
  const root=document.documentElement;
  const body=document.body;
  const themeColor=document.getElementById('djfThemeColor');
  body.classList.add('isBooting');

  function cssColor(name,fallback){
    const value=getComputedStyle(root).getPropertyValue(name).trim();
    return value||fallback;
  }
  function syncThemeColor(){
    const color=cssColor('--surface','#080b16');
    themeColor?.setAttribute('content',color);
  }
  function networkState(){
    if(!navigator.onLine)return'offline';
    const type=navigator.connection?.effectiveType||'';
    return /(^|-)2g$/.test(type)?'slow':'online';
  }
  function syncNetwork(){
    root.dataset.network=networkState();
  }
  function prepareReveal(){
    const modules=[...document.querySelectorAll('.cmsModule')];
    if(matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver'in window)){
      modules.forEach(module=>module.classList.add('isVisible'));
      return;
    }
    modules.forEach(module=>module.setAttribute('data-v26130-reveal',''));
    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting)return;
        entry.target.classList.add('isVisible');
        observer.unobserve(entry.target);
      });
    },{rootMargin:'120px 0px',threshold:.06});
    modules.forEach(module=>observer.observe(module));
  }
  function finishBoot(){
    body.classList.remove('isBooting');
    body.classList.add('isReady');
  }

  window.addEventListener('online',syncNetwork);
  window.addEventListener('offline',syncNetwork);
  navigator.connection?.addEventListener?.('change',syncNetwork);
  window.addEventListener('djf:theme-pack-applied',syncThemeColor);
  new MutationObserver(syncThemeColor).observe(root,{attributes:true,attributeFilter:['data-djf-theme']});

  syncNetwork();
  syncThemeColor();
  prepareReveal();
  requestAnimationFrame(()=>requestAnimationFrame(finishBoot));

  root.dataset.djfPolishBuild=BUILD;
  window.DJF_V26130_POLISH={
    status:()=>({build:BUILD,theme:root.dataset.djfTheme||'',network:root.dataset.network||'',ready:body.classList.contains('isReady')}),
    refresh:()=>{syncNetwork();syncThemeColor();}
  };
  console.info('DJ FOLSOE V26130 Broadcast Polish ready');
})();
