(() => {
  'use strict';
  const calendar = window.DJF_JUL_EPISODES?.calendar;
  const hero = document.querySelector('#main > .hero');
  if (!hero || !calendar) return;

  const zone = 'Europe/Copenhagen';
  const languages = ['da','en','de'];
  const locales = ['da-DK','en-GB','de-DE'];
  const today = () => new Intl.DateTimeFormat('sv-SE',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const adventDates = Object.entries(calendar).filter(([, episode]) => episode.advent).sort();
  const node = (tag, className) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    return element;
  };

  const panel = node('section','djf-jul-forside');
  panel.id = 'djf-jul-historie';
  panel.setAttribute('aria-labelledby','station-advent-promo-title');
  const copy = node('div','station-advent-promo-copy');
  const kicker = node('p','station-advent-promo-kicker');
  const title = node('h2');
  title.id = 'station-advent-promo-title';
  const description = node('p');
  const episodeLine = node('p','station-advent-episode');
  const actions = node('div','station-advent-actions');
  const primary = node('a','station-advent-primary');
  const cast = node('a','station-advent-cast');
  actions.append(primary,cast);
  copy.append(description,episodeLine,actions);
  const schedule = node('div','station-advent-schedule');
  const scheduleTitle = node('h3');
  const dates = node('ol','station-advent-dates');
  schedule.append(scheduleTitle,dates);
  const ownBanner = node('div','station-christmas-own-banner');
  const lockup = node('div','station-christmas-lockup');
  lockup.append(kicker,title);
  ownBanner.append(lockup);
  for (const [spot,index] of [['left',0],['rear',1],['right',2],['edge',7]]) {
    const elf = node('span','station-christmas-elf station-christmas-elf-' + spot);
    elf.style.setProperty('--face',index * 100 / 9 + '%');
    elf.setAttribute('aria-hidden','true');
    ownBanner.append(elf);
  }
  const ownDetails = node('div','station-christmas-own-details');
  ownDetails.append(copy,schedule);
  panel.append(ownBanner,ownDetails);
  const wrapper = node('section','station-christmas-switch');
  wrapper.hidden = true;
  const controls = node('div','station-christmas-controls');
  const ownTab = node('button');
  const cosmoTab = node('button');
  const pause = node('button','station-christmas-pause');
  const cosmo = node('section','station-christmas-cosmo');
  cosmo.id = 'station-cosmo-show';
  const poster = node('img');
  poster.src = '/assets/img/cosmo-juleshow-banner-2026.webp';
  poster.width = 1284;
  poster.height = 439;
  const cosmoCopy = node('div','station-christmas-cosmo-copy');
  const cosmoTitle = node('h2');
  cosmoTitle.id = 'station-cosmo-title';
  cosmo.setAttribute('aria-labelledby',cosmoTitle.id);
  const cosmoTime = node('p');
  const cosmoLink = node('a');
  cosmoLink.href = 'https://www.twitch.tv/djcosmodk';
  cosmoCopy.append(cosmoTitle,cosmoTime,cosmoLink);
  cosmo.append(poster,cosmoCopy);
  ownTab.setAttribute('aria-controls',panel.id);
  cosmoTab.setAttribute('aria-controls',cosmo.id);
  for (const button of [ownTab,cosmoTab,pause]) button.type = 'button';
  controls.append(ownTab,cosmoTab,pause);
  const viewport = node('div','station-christmas-viewport');
  viewport.append(panel,cosmo);
  wrapper.append(controls,viewport);
  hero.before(wrapper);

  const promoEnds = Date.parse('2026-12-24T18:00:00+01:00');
  let available = false;
  let active = 'own';
  let paused = false;
  let languageIndex = 0;
  function show() {
    if (!available) active = 'own';
    const showCosmo = active === 'cosmo';
    panel.hidden = wrapper.hidden || showCosmo;
    cosmo.hidden = wrapper.hidden || !showCosmo;
    cosmo.classList.toggle('station-christmas-available',available);
    controls.hidden = !available;
    ownTab.setAttribute('aria-pressed',String(!showCosmo));
    cosmoTab.setAttribute('aria-pressed',String(showCosmo));
    pause.textContent = (paused
      ? ['Start automatisk skift','Start rotation','Wechsel starten']
      : ['Sæt skift på pause','Pause rotation','Wechsel pausieren'])[languageIndex];
  }
  ownTab.addEventListener('click',() => { active = 'own';show(); });
  cosmoTab.addEventListener('click',() => { active = 'cosmo';show(); });
  pause.addEventListener('click',() => { paused = !paused;show(); });
  setInterval(() => {
    if (wrapper.hidden || !available || document.hidden || paused ||
        wrapper.matches(':hover,:focus-within')) return;
    active = active === 'own' ? 'cosmo' : 'own';
    show();
  },12000);

  let rendered = '';
  function update() {
    const day = today();
    const locale = document.documentElement.lang.slice(0,2);
    const index = Math.max(0,languages.indexOf(locale));
    const format = new Intl.DateTimeFormat(locales[index],{day:'numeric',month:'short',timeZone:zone});
    const base = '/jul/?lang=' + languages[index];
    languageIndex = index;
    wrapper.hidden = day < '2026-11-28' || day > '2026-12-24';
    available = !wrapper.hidden && Date.now() < promoEnds;
    document.documentElement.classList.toggle('djf-jul-live',!wrapper.hidden);
    show();
    if (wrapper.hidden || rendered === day + locale) return;
    ownTab.textContent = ['DJ FOLSOEs julekalender','DJ FOLSOE Christmas calendar','DJ FOLSOEs Adventskalender'][index];
    cosmoTab.textContent = ['DJ Cosmos juleshow','DJ Cosmo’s Christmas shows','DJ Cosmos Weihnachtsshows'][index];
    cosmoTitle.textContent = ['Jul hos DJCOSMODK','Christmas with DJCOSMODK','Weihnachten bei DJCOSMODK'][index];
    cosmoTime.textContent = ['Hver dag 1.–24. december fra kl. 16.00 dansk tid','Daily, 1–24 December from 16:00 Copenhagen time','Täglich, 1.–24. Dezember ab 16:00 Uhr Kopenhagener Zeit'][index];
    cosmoLink.textContent = ['Se DJCOSMODK på Twitch','Watch DJCOSMODK on Twitch','DJCOSMODK auf Twitch ansehen'][index];
    poster.alt = ['DJ Cosmos julebanner med julefigurer og gavehjul','DJ Cosmo Christmas banner with festive characters and a prize wheel','DJ Cosmos Weihnachtsbanner mit Weihnachtsfiguren und Glücksrad'][index];
    rendered = day + locale;
    const row = calendar[day];
    kicker.textContent = ['JULEKALENDER · DJ FOLSOE','CHRISTMAS CALENDAR · DJ FOLSOE','ADVENTSKALENDER · DJ FOLSOE'][index];
    title.textContent = ['Nisserne og den sidste Karen Volf-småkage','The Elves and the Last Karen Volf Cookie','Die Wichtel und der letzte Karen-Volf-Keks'][index];
    description.textContent = row ? row.teaser[index] : [
      'Uret er gået i stå, og der mangler en krumme. Første afsnit åbner søndag 29. november, og historien fortsætter hver dag til juleaften.',
      'The clock has stopped and a crumb is missing. The first episode opens Sunday 29 November, with a new chapter daily until Christmas Eve.',
      'Die Uhr steht still und ein Krümel fehlt. Die erste Folge öffnet am Sonntag, 29. November. Bis Heiligabend folgt jeden Tag ein neues Kapitel.'
    ][index];
    episodeLine.textContent = row ? (row.advent ? adventLabel(row.advent,index) + ' · ' : '') + row.title[index] : [
      'Premiere · 1. søndag i advent','Premiere · First Sunday of Advent','Premiere · 1. Advent'
    ][index];
    primary.textContent = row ? ['Læs dagens afsnit','Read today’s episode','Heutige Folge lesen'][index] : ['Se julekalenderen','See the calendar','Zum Adventskalender'][index];
    primary.href = row ? base + '&episode=' + day + '#episode-heading' : base;
    cast.textContent = ['Mød nisseholdet','Meet the elves','Das Wichtelteam kennenlernen'][index];
    cast.href = base + '#jul-medvirkende';
    scheduleTitle.textContent = ['Fire adventssøndage','Four Advent Sundays','Vier Adventssonntage'][index];
    dates.replaceChildren(...adventDates.map(([date,episode]) => {
      const unlocked = date <= day;
      const tile = node('li');
      const label = node(unlocked ? 'a' : 'span');
      if (unlocked) label.href = base + '&episode=' + date + '#episode-heading';
      const candle = node('b','station-advent-candle');
      candle.setAttribute('aria-hidden','true');
      candle.dataset.lit = String(unlocked);
      const name = node('strong');
      name.textContent = adventLabel(episode.advent,index);
      const stamp = node('time');
      stamp.dateTime = date;
      stamp.textContent = format.format(new Date(date + 'T12:00:00Z'));
      label.append(candle,name,stamp);
      tile.append(label);
      return tile;
    }));
  }

  function adventLabel(number,index) {
    return [number + '. advent','Advent ' + number,number + '. Advent'][index];
  }
  new MutationObserver(update).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  document.addEventListener('visibilitychange',() => { if (!document.hidden) update(); });
  setInterval(() => { if (!document.hidden) update(); },60000);
  update();
})();
