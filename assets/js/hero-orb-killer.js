
/* =========================================================
   DJ FOLSOE V1000.3 — HERO ORB KILLER
   Detects oversized circular gradient elements and pseudo-elements.
   ========================================================= */
(() => {
  const EXCLUDED = [
    '.livePanel',
    '.broadcastMonitor',
    '.heroContent',
    '.heroBg',
    '.osHeroPortal',
    'img',
    'video',
    'canvas',
    'svg',
    'button',
    'a'
  ];

  function isExcluded(node){
    return EXCLUDED.some(selector => {
      try{
        return node.matches?.(selector) || node.closest?.(selector);
      }catch(_){
        return false;
      }
    });
  }

  function px(value){
    const n = parseFloat(value);
    return Number.isFinite(n) ? n : 0;
  }

  function isGradient(background){
    return /gradient|color-mix/i.test(String(background || ''));
  }

  function roundness(style, width, height){
    const radius = Math.max(
      px(style.borderTopLeftRadius),
      px(style.borderTopRightRadius),
      px(style.borderBottomLeftRadius),
      px(style.borderBottomRightRadius)
    );
    return radius >= Math.min(width, height) * 0.38 ||
           String(style.borderRadius).includes('50%');
  }

  function looksLikeOrb(style, rect, heroRect){
    if(rect.width < 150 || rect.height < 150) return false;

    const area = rect.width * rect.height;
    const heroArea = Math.max(1, heroRect.width * heroRect.height);
    const aspect = rect.width / Math.max(1, rect.height);

    const largeEnough = area > heroArea * 0.07;
    const nearlyRound = aspect > 0.68 && aspect < 1.46;
    const circular = roundness(style, rect.width, rect.height);
    const visual = isGradient(style.backgroundImage) ||
                   isGradient(style.background) ||
                   /blur/i.test(style.filter) ||
                   px(style.boxShadow) > 0;

    return largeEnough && nearlyRound && circular && visual;
  }

  function pseudoRect(style, ownerRect){
    const width = px(style.width) || ownerRect.width;
    const height = px(style.height) || ownerRect.height;
    return {width, height};
  }

  function scan(){
    const hero = document.querySelector('.compactMusicTvHero');
    if(!hero) return;

    const heroRect = hero.getBoundingClientRect();
    const nodes = [hero, ...hero.querySelectorAll('*')];

    for(const node of nodes){
      if(isExcluded(node)) continue;

      const rect = node.getBoundingClientRect();
      const style = getComputedStyle(node);

      if(style.display !== 'none' && looksLikeOrb(style, rect, heroRect)){
        node.classList.add('djf-orb-killed');
        node.setAttribute('data-djf-orb-killed','true');
        continue;
      }

      for(const pseudo of ['::before','::after']){
        const ps = getComputedStyle(node, pseudo);
        if(!ps || ps.content === 'none' || ps.display === 'none') continue;

        const pr = pseudoRect(ps, rect);
        const fakeRect = {width:pr.width, height:pr.height};

        if(looksLikeOrb(ps, fakeRect, heroRect)){
          node.classList.add(pseudo === '::before' ? 'djf-kill-before' : 'djf-kill-after');
        }
      }
    }
  }

  function runRepeated(){
    scan();
    setTimeout(scan, 250);
    setTimeout(scan, 800);
    setTimeout(scan, 1800);
    setTimeout(scan, 3500);
  }

  document.addEventListener('DOMContentLoaded', runRepeated);
  window.addEventListener('load', runRepeated);
  window.addEventListener('resize', () => setTimeout(scan, 120), {passive:true});

  const observer = new MutationObserver(() => setTimeout(scan, 40));
  document.addEventListener('DOMContentLoaded', () => {
    const hero = document.querySelector('.compactMusicTvHero');
    if(hero){
      observer.observe(hero, {
        subtree:true,
        childList:true,
        attributes:true,
        attributeFilter:['class','style']
      });
    }
  });
})();
