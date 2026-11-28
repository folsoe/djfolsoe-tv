(() => {
  'use strict';
  const header = document.querySelector('body > header');
  const flag = document.createElement('div');
  flag.className = 'station-header-extra';
  const clock = document.createElement('time');
  const dayLabel = document.createElement('span');
  dayLabel.className = 'station-header-date';
  clock.className = 'station-clock';
  const opener = document.createElement('button');
  opener.type = 'button';
  opener.className = 'station-calendar-open';
  opener.hidden = true;
  const dateTime = document.createElement('div');
  dateTime.className = 'station-header-time';
  dateTime.append(dayLabel, clock);
  const ticker = document.createElement('div');
  ticker.className = 'station-header-ticker';
  const card = document.createElement('div');
  card.className = 'station-header-card';
  const pause = document.createElement('button');
  pause.type = 'button';
  pause.className = 'station-header-pause';
  ticker.append(card, pause);
  flag.append(dateTime, ticker);
  header?.prepend(flag);
  header?.append(opener);

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
  const twitch = 'https://www.twitch.tv/djfolsoe';
  const socials = [
    ['tiktok','TikTok','@folsoesune','https://www.tiktok.com/@folsoesune'],
    ['instagram','Instagram','@folsoesune','https://www.instagram.com/folsoesune/'],
    ['facebook','Facebook','DJ FOLSOE','https://www.facebook.com/sune.folsoe']
  ];
  const messages = {
    da:['LIVE NU','Twitch · Offline','Twitch · Kanal','seere lige nu','følgere på Twitch','Støt streamen','Sæt skift på pause','Genoptag skift'],
    en:['LIVE NOW','Twitch · Offline','Twitch · Channel','watching now','Twitch followers','Support the stream','Pause rotation','Resume rotation'],
    de:['JETZT LIVE','Twitch · Offline','Twitch · Kanal','schauen gerade zu','Twitch-Follower','Stream unterstützen','Wechsel pausieren','Wechsel fortsetzen']
  };
  let twitchData;
  let active = 'twitch';
  let paused = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
    clock.textContent = time;
    clock.setAttribute('aria-label', copy.clock + ' · ' + time);
    dayLabel.textContent = new Intl.DateTimeFormat(copy.locale, {timeZone:zone, weekday:'short', day:'numeric', month:'short'}).format(now);
    renderTicker();
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

  function tickerItems() {
    const language = messages[lang()] ? lang() : 'da';
    const words = messages[language];
    const fresh = twitchData && Date.now() - twitchData.received < 120000;
    const state = fresh ? twitchData.status : 'unknown';
    const {followers, viewers} = fresh ? twitchData : {};
    const format = new Intl.NumberFormat(labels[language].locale);
    const list = [['twitch', state === 'live' ? words[0] : state === 'offline' ? words[1] : words[2], '@djfolsoe', twitch]];
    if (state === 'live' && Number.isInteger(viewers)) list.push(['viewers','Twitch',format.format(viewers) + ' ' + words[3],twitch]);
    if (Number.isInteger(followers)) list.push(['followers','Twitch',format.format(followers) + ' ' + words[4],twitch]);
    list.push(['vipps','Vipps / MobilePay',words[5] + ' · 1267PN'], ...socials);
    return list;
  }

  function renderTicker(advance = false) {
    const items = tickerItems();
    let index = items.findIndex(([id]) => id === active);
    if (index === -1) index = 0;
    if (advance) index = (index + 1) % items.length;
    const [id, heading, text, href] = items[index];
    active = id;
    const words = messages[lang()] || messages.da;
    pause.textContent = paused ? '▶' : 'Ⅱ';
    pause.setAttribute('aria-label', words[paused ? 7 : 6]);
    const hash = [id, heading, text, href].join('|');
    if (card.dataset.current === hash) return;
    card.dataset.current = hash;
    card.dataset.kind = id;
    card.dataset.live = String(id === 'twitch' && heading === words[0]);
    const item = document.createElement(href ? 'a' : 'div');
    if (href) item.href = href;
    const name = document.createElement('strong');
    name.textContent = heading;
    const detail = document.createElement('span');
    detail.textContent = text;
    item.append(name, detail);
    card.replaceChildren(item);
  }

  window.addEventListener('djf:twitch-status', ({detail}) => {
    const payload = detail.payload;
    const followers = payload?.followerCount ?? payload?.followers;
    const viewers = payload?.viewerCount ?? payload?.viewers;
    twitchData = {
      status:detail.status,
      followers:Number.isInteger(followers) && followers >= 0 ? followers : undefined,
      viewers:Number.isInteger(viewers) && viewers >= 0 ? viewers : undefined,
      received:Date.now()
    };
    renderTicker();
  });
  pause.addEventListener('click', () => {
    paused = !paused;
    renderTicker();
  });
  setInterval(() => {
    if (!document.hidden && !paused && !card.matches(':hover, :focus-within')) renderTicker(true);
  }, 6500);

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
