/* DJ FOLSOE • Music television identity. Existing players, data and controls stay live. */
(() => {
  'use strict';
  if (window.DJF_STATION_2026 || /(?:admin|overlay|streamelements|twitch-connect)/i.test(location.pathname)) return;
  window.DJF_STATION_2026 = true;
  const body = document.body;
  body.classList.add('djfStation26');
  function placeLanguage(){const bar=document.querySelector('.djfLanguageBar');if(bar&&body.firstElementChild!==bar)body.prepend(bar);}
  placeLanguage();window.addEventListener('load',placeLanguage,{once:true});
  const shows = [
    ['trance','trance-tuesday','TRANCE TUESDAY','#44e4f2',['Melodier uden loft.','Melodies without limits.','Melodien ohne Grenzen.']],
    ['eurodance','eurodance','CLASSIC DANCE','#edff42',['#90 #00 · To årtier. Ét dansegulv.','#90 #00 · Two decades. One dancefloor.','#90 #00 · Zwei Jahrzehnte. Eine Tanzfläche.']],
    ['retro','retro-hits','RETRO HITS','#ffb575',['Minder med volumen på.','Memories with the volume up.','Erinnerungen. Laut aufgedreht.']],
    ['fredagsbar','fredagsbar','FREDAGSBAR','#ff334b',['Godt selskab. Tvivlsomme idéer.','Good company. Questionable ideas.','Gute Gesellschaft. Fragwürdige Ideen.']],
    ['morning','good-morning-twitch','GOOD MORNING TWITCH','#ffd777',['Kaffen er valgfri. Musikken er klar.','Coffee optional. Music ready.','Kaffee nach Belieben. Musik steht bereit.']],
    ['weekend','weekend','WEEKEND','#c5ff44',['Din weekend. Dit tempo.','Your weekend. Your pace.','Dein Wochenende. Dein Tempo.']],
    ['nudisco','nu-disco','NU DISCO','#e3acff',['Gammel sjæl. Nyt groove.','Old soul. New groove.','Alte Seele. Neuer Groove.']],
    ['popup','pop-up','POP UP','#ff6054',['Planen? Den finder vi ud af.','The plan? We’ll work it out.','Der Plan? Wird sich zeigen.']]
  ];
  const words = new Map();
  const language = () => window.DJF_I18N?.language || document.documentElement.lang || 'en';
  const index = () => ({da:0,en:1,de:2}[language()] ?? 1);
  function copy(element, values) { element.setAttribute('translate','no'); words.set(element, values); element.textContent=values[index()]; }
  function label(tag, className, values) { const e=document.createElement(tag);e.className=className;copy(e,values);return e; }
  function localize() { words.forEach((values,e)=>{if(e.isConnected)e.textContent=values[index()];}); }
  const active = shows.find(show => location.pathname.includes('/shows/'+show[1]+'/') || location.pathname.includes('/archive/'+show[1]+'/'));
  if(active){body.dataset.stationShow=active[0];body.style.setProperty('--s26-accent',active[3]);}
  const hero = document.querySelector('#hero .heroGrid');
  if(hero){
    const art=document.createElement('div');art.className='s26ChannelArt';art.setAttribute('aria-hidden','true');art.setAttribute('translate','no');
    art.innerHTML='<div class="s26Orbit"><i></i><i></i><i></i></div><div class="s26Ident"><span>DJ FOLSOE</span><strong>MUSIC<br><em>TELEVISION.</em></strong><b>FOLSOE<span>TV</span></b></div><div class="s26ArtBase"><span>DENMARK → EVERYWHERE</span><span>↗</span></div>';
    hero.insertBefore(art,hero.querySelector('aside'));
    const strap=document.createElement('div');strap.className='s26Strap';
    strap.append(label('span','',['MUSIK MED MENNESKER BAG.','MUSIC WITH PEOPLE BEHIND IT.','MUSIK MIT MENSCHEN DAHINTER.']),label('a','',['FIND DIT SHOW ↗','FIND YOUR SHOW ↗','FINDE DEINE SHOW ↗']));
    strap.lastChild.href='/showhub/';hero.closest('section').append(strap);
  }
  // Replace only the static show promotion cards; no API controls or player nodes are rebuilt.
  const grid=document.querySelector('.djfHomeShowGrid');
  if(grid){
    const cards=document.createDocumentFragment();
    shows.forEach((show,i)=>{
      const a=document.createElement('a');a.href='/shows/'+show[1]+'/';a.className='djfHomeShowCard s26Program';a.dataset.stationShow=show[0];a.style.setProperty('--s26-accent',show[3]);
      const visual=document.createElement('div');visual.className='s26ProgramVisual';
      const img=document.createElement('img');img.src='/assets/img/station/'+show[0]+'.svg';img.alt='';img.loading='lazy';img.decoding='async';visual.append(img);
      const num=document.createElement('b');num.className='s26ProgramNumber';num.textContent=String(i+1).padStart(2,'0');visual.append(num);
      const c=document.createElement('div');c.className='s26ProgramCopy';
      const name=document.createElement('strong');name.textContent=show[2];name.setAttribute('translate','no');
      c.append(name,label('span','',show[4]));a.append(visual,c);cards.append(a);
    });
    grid.replaceChildren(cards);
  }
  // Use the same art direction in the show directory without touching descriptions or links.
  document.querySelectorAll('.suCard').forEach(card=>{
    const link=card.matches('a')?card:card.querySelector('a[href*="/shows/"]');
    const show=shows.find(s=>link?.getAttribute('href')?.includes('/shows/'+s[1]+'/'));
    if(show){card.dataset.stationShow=show[0];card.style.setProperty('--s26-accent',show[3]);card.style.setProperty('--s26-art','url("/assets/img/station/'+show[0]+'.svg")');}
  });
  const mainHero=document.querySelector('.trIHero,.rhHero,.fbHero,.cdHero,.wHero,.nHero,.pHero,.v26352MorningHero');
  if(mainHero&&active){
    mainHero.classList.add('s26ShowHero');
    const img=document.createElement('img');img.className='s26ShowArt';img.src='/assets/img/station/'+active[0]+'.svg';img.alt='';img.decoding='async';mainHero.prepend(img);
    const ident=document.createElement('div');ident.className='s26ShowIdent';ident.setAttribute('translate','no');ident.textContent='FOLSOE TV / '+String(shows.indexOf(active)+1).padStart(2,'0');mainHero.append(ident);
  }
  const hub=document.querySelector('.show-detail');
  function hubTheme(){
    if(!hub)return;const show=shows.find(s=>s[0]===body.dataset.show)||shows[0];
    body.style.setProperty('--s26-accent',show[3]);hub.style.setProperty('--s26-art','url("/assets/img/station/'+show[0]+'.svg")');
  }
  if(hub){hubTheme();new MutationObserver(hubTheme).observe(body,{attributes:true,attributeFilter:['data-show']});}
  // A few transform-only entrances. Reduced motion and background tabs pause animation.
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  function motion(){body.classList.toggle('s26Still',document.hidden||reduce.matches);}
  motion();document.addEventListener('visibilitychange',motion);reduce.addEventListener?.('change',motion);
  if('IntersectionObserver' in window){
    const io=new IntersectionObserver(entries=>entries.forEach(e=>e.target.classList.toggle('s26InView',e.isIntersecting)),{rootMargin:'80px'});
    document.querySelectorAll('.s26ChannelArt,.s26ShowHero').forEach(e=>io.observe(e));
  }else document.querySelectorAll('.s26ChannelArt,.s26ShowHero').forEach(e=>e.classList.add('s26InView'));
  window.addEventListener('djf:languagechange',localize);
})();
