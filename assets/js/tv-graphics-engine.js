
/* =========================================================
   DJ FOLSOE V945.0 — TV GRAPHICS ENGINE
   Visual state, transitions and theme response.
   ========================================================= */
(() => {
  const $ = id => document.getElementById(id);
  const root = document.documentElement;
  const body = document.body;
  const transition = $('tvEngineTransition');
  const transitionTitle = $('tvEngineTransitionTitle');
  const transitionKicker = $('tvEngineTransitionKicker');
  const liveState = $('tvEngineLiveState');
  const burst = $('tvEngineBurst');
  let lastSection = '';
  let lastActivitySignature = '';
  let transitionLocked = false;

  const themeClasses = [
    'tv-theme-morning','tv-theme-trance','tv-theme-retro','tv-theme-eurodance',
    'tv-theme-fredagsbar','tv-theme-summer','tv-theme-weekend','tv-theme-popup',
    'tv-theme-top20','tv-theme-danske'
  ];

  function normalizeTheme(value){
    return String(value || 'weekend').toLowerCase().trim().replace(/\s+/g,'-');
  }

  function setTheme(theme){
    themeClasses.forEach(c => body.classList.remove(c));
    body.classList.add('tv-theme-' + normalizeTheme(theme));
  }

  function setLiveState(isLive){
    body.classList.toggle('tv-is-live', !!isLive);
    if(liveState) liveState.textContent = isLive ? 'ON AIR' : 'STANDBY';
  }

  function showTransition(title, kicker='DJ FOLSOE NETWORK'){
    if(!transition || transitionLocked || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    transitionLocked = true;
    transitionTitle.textContent = title || 'LIVE MUSIC TV';
    transitionKicker.textContent = kicker;
    transition.classList.remove('is-active');
    void transition.offsetWidth;
    transition.classList.add('is-active');
    setTimeout(() => {
      transition.classList.remove('is-active');
      transitionLocked = false;
    }, 1050);
  }

  function showBurst(){
    if(!burst || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    burst.classList.remove('is-active');
    void burst.offsetWidth;
    burst.classList.add('is-active');
    setTimeout(() => burst.classList.remove('is-active'), 900);
  }

  function watchSections(){
    const sections = [...document.querySelectorAll('.tvGraphicSection')];
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        entry.target.classList.toggle('tv-in-view', entry.isIntersecting);
        if(entry.isIntersecting && entry.intersectionRatio > .55){
          const label = entry.target.dataset.tvLabel || '';
          if(label && lastSection && label !== lastSection){
            showTransition(label, 'DJ FOLSOE · CHANNEL 01');
          }
          lastSection = label;
        }
      });
    }, {threshold:[.2,.55,.8]});
    sections.forEach(section => observer.observe(section));
  }

  function readPageState(){
    const liveText = (
      $('livePill')?.textContent ||
      $('navState')?.textContent ||
      ''
    ).toUpperCase();
    setLiveState(liveText.includes('LIVE') || liveText.includes('ON AIR'));

    const theme = $('metricTheme')?.textContent || 'weekend';
    setTheme(theme);
  }

  function watchActivity(){
    const target = $('activityPulseHeadline');
    if(!target) return;
    const observer = new MutationObserver(() => {
      const signature = [
        target.textContent,
        $('activityPulseTime')?.textContent,
        $('activityTickerTime')?.textContent
      ].join('|');
      if(lastActivitySignature && signature !== lastActivitySignature){
        showBurst();
      }
      lastActivitySignature = signature;
    });
    observer.observe(target,{childList:true,subtree:true,characterData:true});
  }

  function watchStateMutations(){
    const targets = [$('livePill'),$('navState'),$('metricTheme')].filter(Boolean);
    const observer = new MutationObserver(readPageState);
    targets.forEach(target => observer.observe(target,{childList:true,subtree:true,characterData:true}));
  }

  function installNavigationTransitions(){
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', () => {
        const id = link.getAttribute('href').slice(1);
        const target = document.getElementById(id);
        if(target){
          showTransition(target.dataset.tvLabel || link.textContent.trim(), 'DJ FOLSOE NETWORK');
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    readPageState();
    watchSections();
    watchActivity();
    watchStateMutations();
    installNavigationTransitions();

    setTimeout(() => showTransition('DJ FOLSOE NETWORK', 'CHANNEL 01 · MUSIC TV'), 500);
    setInterval(readPageState, 5000);
  });
})();
