/* DJ FOLSOE V26120 — BROADCAST NAVIGATION & MOBILE EXPERIENCE
   Website-only navigation layer. */
(() => {
  'use strict';
  const BUILD='V26120';
  const toggle=document.getElementById('mobileNavToggle');
  const menu=document.getElementById('mobileBroadcastNav');
  const back=document.getElementById('broadcastBackToTop');
  const navLinks=[...document.querySelectorAll('.broadcastNav a[href^="#"],.mobileBroadcastNav a[href^="#"],.mobileBroadcastDock a[href^="#"]')];
  const targets=[...new Set(navLinks.map(a=>a.getAttribute('href')).filter(Boolean))]
    .map(hash=>document.querySelector(hash)).filter(Boolean);

  function setMenu(open){
    if(!toggle||!menu)return;
    toggle.setAttribute('aria-expanded',String(open));
    toggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');
    menu.hidden=!open;
  }
  toggle?.addEventListener('click',()=>setMenu(toggle.getAttribute('aria-expanded')!=='true'));
  menu?.addEventListener('click',event=>{if(event.target.closest('a'))setMenu(false)});
  document.addEventListener('keydown',event=>{if(event.key==='Escape')setMenu(false)});
  document.addEventListener('click',event=>{
    if(!menu||menu.hidden)return;
    if(!menu.contains(event.target)&&!toggle?.contains(event.target))setMenu(false);
  });

  function activate(id){
    navLinks.forEach(link=>{
      const active=link.getAttribute('href')===`#${id}`;
      if(active)link.setAttribute('aria-current','page'); else link.removeAttribute('aria-current');
    });
  }
  if('IntersectionObserver' in window&&targets.length){
    const visible=new Map();
    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>visible.set(entry.target.id,entry.isIntersecting?entry.intersectionRatio:0));
      const current=[...visible.entries()].sort((a,b)=>b[1]-a[1])[0];
      if(current&&current[1]>0)activate(current[0]);
    },{rootMargin:'-28% 0px -55% 0px',threshold:[0,.15,.35,.6]});
    targets.forEach(target=>observer.observe(target));
  }

  function updateScroll(){back?.classList.toggle('isVisible',window.scrollY>700)}
  window.addEventListener('scroll',updateScroll,{passive:true});updateScroll();
  back?.addEventListener('click',()=>window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}));

  document.documentElement.dataset.djfNavigationBuild=BUILD;
  window.DJF_V26120_NAV={
    open:()=>setMenu(true),close:()=>setMenu(false),status:()=>({build:BUILD,menuOpen:toggle?.getAttribute('aria-expanded')==='true',targets:targets.map(x=>x.id)})
  };
  console.info('DJ FOLSOE V26120 Broadcast Navigation ready');
})();
