(() => {
  'use strict';
  const header = document.querySelector('body > header');
  const flag = document.createElement('div');
  flag.className = 'station-header-extra';
  const clock = document.createElement('time');
  clock.className = 'station-clock';
  const opener = document.createElement('button');
  opener.type = 'button';
  opener.className = 'station-calendar-open';
  opener.hidden = true;
  flag.append(clock, opener);
  header?.append(flag);

  const dialog = document.createElement('dialog');
  dialog.className = 'station-advent';
  dialog.setAttribute('aria-labelledby', 'station-advent-title');
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'station-advent-close';
  close.textContent = '×';
  close.autofocus = true;
  const date = document.createElement('p');
  date.className = 'station-advent-date';
  const title = document.createElement('h2');
  title.id = 'station-advent-title';
  const teaser = document.createElement('p');
  const article = document.createElement('a');
  article.className = 'station-advent-link';
  dialog.append(close, date, title, teaser, article);
  document.body.append(dialog);

  const zone = 'Europe/Copenhagen';
  const isoDate = new Intl.DateTimeFormat('sv-SE', {timeZone:zone, year:'numeric', month:'2-digit', day:'2-digit'});
  const labels = {
    da:{locale:'da-DK',clock:'Dansk tid',open:'Julekalender',close:'Luk julekalenderen',read:'Læs dagens afsnit'},
    en:{locale:'en-GB',clock:'Danish time',open:'Christmas calendar',close:'Close the Christmas calendar',read:'Read today’s episode'},
    de:{locale:'de-DE',clock:'Dänische Zeit',open:'Adventskalender',close:'Adventskalender schließen',read:'Heutige Folge lesen'}
  };
  const lang = () => document.documentElement.lang.slice(0, 2);
  let previousDay = '';
  let returnFocus;

  function refresh() {
    const now = new Date();
    const day = isoDate.format(now);
    const language = labels[lang()] ? lang() : 'da';
    const copy = labels[language];
    const index = ['da','en','de'].indexOf(language);
    const time = new Intl.DateTimeFormat(copy.locale, {timeZone:zone, hour:'2-digit', minute:'2-digit', hourCycle:'h23'}).format(now);
    clock.dateTime = now.toISOString();
    clock.textContent = copy.clock + ' · ' + time;
    const episode = /^2026-12-(0[1-9]|1[0-9]|2[0-4])$/.test(day) && window.DJF_JUL_EPISODES?.calendar?.[day];
    opener.hidden = !episode;
    if (!episode) {
      if (dialog.open) dialog.close();
      return;
    }
    opener.textContent = copy.open;
    close.setAttribute('aria-label', copy.close);
    date.textContent = new Intl.DateTimeFormat(copy.locale, {timeZone:zone, day:'numeric', month:'long'}).format(now);
    title.textContent = episode.title[index];
    teaser.textContent = episode.teaser[index];
    article.textContent = copy.read;
    article.href = '/jul/?lang=' + language + '#episode-heading';
    if (day === previousDay || document.hidden) return;
    previousDay = day;
    let dismissed = '';
    try { dismissed = localStorage.getItem('djf-advent-dismissed'); } catch {}
    if (dismissed !== day && !dialog.open) openCalendar();
  }

  function openCalendar() {
    if (dialog.open) return;
    returnFocus = document.activeElement;
    dialog.showModal();
  }
  opener.addEventListener('click', openCalendar);
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    try { localStorage.setItem('djf-advent-dismissed', previousDay); } catch {}
    if (returnFocus && returnFocus !== document.body) returnFocus.focus();
  });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
  new MutationObserver(refresh).observe(document.documentElement, {attributes:true, attributeFilter:['lang']});
  refresh();
  setInterval(() => { if (!document.hidden) refresh(); }, 15000);
})();
