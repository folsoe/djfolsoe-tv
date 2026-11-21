(() => {
  const main = document.querySelector('main');
  if (!main) return;
  // Copenhagen uses UTC+1 in November.
  const start = Date.parse('2026-11-21T00:00:00+01:00');
  const end = Date.parse('2026-11-29T00:00:00+01:00');
  const strings = {
    da: ['Juleføljeton hos DJ FOLSOE · Fra 29. november', 'Nisserne og den sidste Karen Volf-småkage', 'Juleglæden er gået i stå på dansk Twitch. Nisserne har til juleaften kl. 23 til at få chatten til at grine sammen igen, finde det røde kabel og sørge for småkager til alle. Bøje har meldt sig til at passe lageret. Det var måske den første fejl', 'Et nyt kapitel hver dag frem til juleaften.'],
    en: ['Christmas serial at DJ FOLSOE · From 29 November', 'The Elves and the Last Karen Volf Biscuit', 'Christmas cheer has stalled on Danish Twitch. The elves have until 11 p.m. on Christmas Eve to get chat laughing together, find the red cable and save enough biscuits for everyone. Bøje volunteered to guard the tins. That might have been their first mistake', 'A new chapter every day through Christmas Eve.'],
    de: ['Weihnachtsgeschichte bei DJ FOLSOE · Ab 29. November', 'Die Wichtel und der letzte Karen-Volf-Keks', 'Auf Twitch-Dänemark ist die Weihnachtsfreude ins Stocken geraten. Bis Heiligabend um 23 Uhr müssen die Wichtel den Chat wieder zum Lachen bringen, das rote Kabel finden und Kekse für alle retten. Bøje hat sich als Hüter der Dosen gemeldet. Das war vielleicht der erste Fehler', 'Jeden Tag ein neues Kapitel bis Heiligabend.']
  };
  const cast = [
  [
    "Knas",
    "Knas",
    "Knas",
    "Studieteknikeren, der har pakket det røde kabel ind.",
    "The studio technician who gift-wrapped the red cable.",
    "Der Studiotechniker, der das rote Kabel als Geschenk verpackt hat."
  ],
  [
    "Tilde",
    "Tilde",
    "Tilde",
    "Holder styr på udsendelsen, så længe ingen rører ved køreplanen.",
    "Keeps the show on track, provided nobody touches the running order.",
    "Hält die Sendung auf Kurs, solange niemand den Ablaufplan anfasst."
  ],
  [
    "Bøje",
    "Bøje",
    "Bøje",
    "Nummererer gaver og tager forplejningen personligt.",
    "Numbers the parcels and takes the catering personally.",
    "Nummeriert die Pakete und nimmt die Verpflegung persönlich."
  ],
  [
    "Mulle",
    "Mulle",
    "Mulle",
    "Har et vaffeljern med en fortid.",
    "Has a waffle iron with a past.",
    "Hat ein Waffeleisen mit Vergangenheit."
  ],
  [
    "Mads Minus",
    "Mads Minus",
    "Mads Minus",
    "Svarer helst via en printer, ingen har tilsluttet.",
    "Prefers to answer through a printer nobody plugged in.",
    "Antwortet am liebsten über einen Drucker, den niemand angeschlossen hat."
  ],
  [
    "Ester",
    "Ester",
    "Ester",
    "Gyldne hovedtelefoner og en besked fra fortiden.",
    "Golden headphones and a message from the past.",
    "Goldene Kopfhörer und eine Nachricht aus der Vergangenheit."
  ],
  [
    "Pip",
    "Pip",
    "Pip",
    "Låner ting, når de ser ud til at kede sig.",
    "Borrows things whenever they look bored.",
    "Leiht sich Dinge, wenn sie gelangweilt aussehen."
  ],
  [
    "Lydprøven",
    "Soundcheck",
    "Soundcheck",
    "Rensdyret, der spiser fejl. Gerne hele køreplanen.",
    "A reindeer that eats mistakes. Entire running orders welcome.",
    "Das Rentier frisst Fehler. Am liebsten ganze Ablaufpläne."
  ],
  [
    "Urmageren",
    "The Clockmaker",
    "Die Uhrmacherin",
    "Passer på to visere og bestemmer selv, hvornår hun åbner.",
    "Keeps two clock hands safe and opens whenever she pleases.",
    "Hütet zwei Uhrzeiger und öffnet, wann es ihr passt."
  ],
  [
    "Sune / DJ FOLSOE",
    "Sune / DJ FOLSOE",
    "Sune / DJ FOLSOE",
    "Kommer for at høre et nummer. Får en generalprøve med rensdyr.",
    "Comes to hear a song. Gets a dress rehearsal with a reindeer.",
    "Kommt wegen eines Liedes und erlebt eine Generalprobe mit Rentier."
  ]
];
  const section = document.createElement('section');
  section.id = 'jul-teaser-2026';
  section.setAttribute('aria-labelledby', 'jul-teaser-title');
  section.innerHTML = `<style>
    #jul-teaser-2026{margin-block:1.25rem 2rem;padding:clamp(1.2rem,4vw,3rem);background:radial-gradient(ellipse at 70% 95%,#552235,transparent 64%),#251521;color:#fff4e7;border:1px solid #d0a165;border-radius:14px}
    #jul-teaser-2026 h2{margin:.35rem 0 .7rem;font-size:clamp(1.8rem,4vw,3.5rem);line-height:1.06;color:inherit}
    #jul-teaser-2026 p{margin:.45rem 0;max-width:70ch}
    #jul-teaser-2026 .teaser-date,#jul-teaser-2026 .teaser-foot{color:#ffda99;font-weight:700}
    #jul-teaser-2026 ul{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,8rem),1fr));gap:.6rem;list-style:none;margin:1.25rem 0;padding:0}
    #jul-teaser-2026 li{display:grid;justify-items:center;text-align:center;align-content:start;padding:.45rem;border-radius:8px;background:#fff3}
    #jul-teaser-2026 .teaser-face{display:block;width:min(100%,10rem);aspect-ratio:1;background:url('/assets/img/jul-nissehold-10-v4.webp') var(--face) center / 1000% 100% no-repeat}
    #jul-teaser-2026 .teaser-role{font-size:.9rem;line-height:1.35}
    @media(min-width:850px){#jul-teaser-2026 ul{grid-template-columns:repeat(5,minmax(0,1fr))}}
  </style><p class="teaser-date"></p><h2 id="jul-teaser-title"></h2><p class="teaser-copy"></p>
  <ul>${cast.map((_,i)=>`<li><span class="teaser-face" style="--face:${i*100/9}%" aria-hidden="true"></span><strong></strong><p class="teaser-role"></p></li>`).join('')}</ul>
  <p class="teaser-foot"></p>`;
  const targets = ['.teaser-date', 'h2', '.teaser-copy', '.teaser-foot'];
  function translate() {
    const lang = document.documentElement.lang.toLowerCase().slice(0,2);
    const language = ['da','en','de'].indexOf(lang);
    const index = Math.max(language,0);
    section.querySelectorAll('li').forEach((card, i) => {
      card.querySelector('strong').textContent = cast[i][index];
      card.querySelector('.teaser-role').textContent = cast[i][index + 3];
    });
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
