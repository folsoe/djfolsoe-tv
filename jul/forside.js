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
  copy.append(kicker,title,description,episodeLine,actions);
  const schedule = node('div','station-advent-schedule');
  const scheduleTitle = node('h3');
  const dates = node('ol','station-advent-dates');
  schedule.append(scheduleTitle,dates);
  panel.append(copy,schedule);
  hero.before(panel);

  let rendered = '';
  function update() {
    const day = today();
    const locale = document.documentElement.lang.slice(0,2);
    const index = Math.max(0,languages.indexOf(locale));
    const format = new Intl.DateTimeFormat(locales[index],{day:'numeric',month:'short',timeZone:zone});
    const base = '/jul/?lang=' + languages[index];
    panel.hidden = day < '2026-11-28' || day > '2026-12-24';
    document.documentElement.classList.toggle('djf-jul-live',!panel.hidden);
    if (panel.hidden || rendered === day + locale) return;
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
