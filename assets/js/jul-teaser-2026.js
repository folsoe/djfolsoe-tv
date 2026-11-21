(() => {
  const main = document.querySelector('main');
  if (!main) return;
  // Copenhagen uses UTC+1 in November.
  const start = Date.parse('2026-11-21T00:00:00+01:00');
  const end = Date.parse('2026-11-29T00:00:00+01:00');
  const strings = {
    da: ['Juleføljeton hos DJ FOLSOE · Fra 29. november', 'Nisserne og det sidste omkvæd', 'Et rødt kabel er forsvundet blandt 37 ens pakker. Bøje har nummereret dem alle med ét. Nu skal fem nisser finde kablet og få det sidste omkvæd i æteren inden juleaften kl. 23. Hvad kan dog gå galt?', 'Et nyt kapitel hver dag frem til juleaften.'],
    en: ['Christmas serial at DJ FOLSOE · From 29 November', 'The Elves and the Last Chorus', 'A red cable has vanished among 37 identical parcels. Every parcel is marked number one. Now five elves have to find the cable and get the last chorus on air by 11 p.m. on Christmas Eve. What could possibly go wrong?', 'A new chapter every day through Christmas Eve.'],
    de: ['Weihnachtsgeschichte bei DJ FOLSOE · Ab 29. November', 'Die Wichtel und der letzte Refrain', 'Ein rotes Kabel ist zwischen 37 identischen Paketen verschwunden. Auf jedem Paket steht die Nummer eins. Jetzt müssen fünf Wichtel das Kabel finden und den letzten Refrain bis Heiligabend um 23 Uhr auf Sendung bringen. Was soll da schon schiefgehen?', 'Jeden Tag ein neues Kapitel bis Heiligabend.']
  };
  const section = document.createElement('section');
  section.id = 'jul-teaser-2026';
  section.setAttribute('aria-labelledby', 'jul-teaser-title');
  section.innerHTML = `<style>
    #jul-teaser-2026{margin-block:1.25rem 2rem;padding:clamp(1.2rem,4vw,3rem);background:radial-gradient(ellipse at 70% 95%,#552235,transparent 64%),#251521;color:#fff4e7;border:1px solid #d0a165;border-radius:14px}
    #jul-teaser-2026 h2{margin:.35rem 0 .7rem;font-size:clamp(1.8rem,4vw,3.5rem);line-height:1.06;color:inherit}
    #jul-teaser-2026 p{margin:.45rem 0;max-width:70ch}
    #jul-teaser-2026 .teaser-date,#jul-teaser-2026 .teaser-foot{color:#ffda99;font-weight:700}
    #jul-teaser-2026 ul{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,8rem),1fr));gap:.6rem;list-style:none;margin:1.25rem 0;padding:0}
    #jul-teaser-2026 li{display:grid;justify-items:center;text-align:center;font-weight:750}
    #jul-teaser-2026 .teaser-face{display:block;width:min(100%,10rem);aspect-ratio:1;background:url('/assets/img/jul-nissehold.webp') var(--face) center / 500% 100% no-repeat}
  </style><p class="teaser-date"></p><h2 id="jul-teaser-title"></h2><p class="teaser-copy"></p>
  <ul>${['Knas','Tilde','Bøje','Mulle','Mads Minus'].map((name,i)=>`<li><span class="teaser-face" style="--face:${i*25}%" aria-hidden="true"></span>${name}</li>`).join('')}</ul>
  <p class="teaser-foot"></p>`;
  const targets = ['.teaser-date', 'h2', '.teaser-copy', '.teaser-foot'];
  function translate() {
    const lang = document.documentElement.lang.toLowerCase().slice(0,2);
    (strings[lang] ?? strings.da).forEach((line, i) => {
      section.querySelector(targets[i]).textContent = line;
    });
  }
  let timer;
  function update() {
    clearTimeout(timer);
    const now = Date.now();
    if (now >= start && now < end) {
      translate();
      if (!section.isConnected) {
        const live = main.querySelector('.home-live');
        if (live) live.after(section); else main.prepend(section);
      }
    } else section.remove();
    if (now < end) timer = setTimeout(update, Math.min(3600000, (now < start ? start : end) - now));
  }
  new MutationObserver(translate).observe(document.documentElement, {attributes:true,attributeFilter:['lang']});
  document.addEventListener('visibilitychange', update);
  window.addEventListener('pageshow', update);
  update();
})();
