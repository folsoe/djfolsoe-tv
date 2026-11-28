(() => {
  'use strict';
  const root = document.querySelector('#musiknyheder');
  if (!root) return;

  const language = () => {
    const code = document.documentElement.lang?.slice(0, 2);
    return Math.max(0, ['da', 'en', 'de'].indexOf(code));
  };
  const labels = {
    nav: ['Musiknyheder', 'Music news', 'Musiknews'],
    kicker: ['DJ FOLSOE · MUSIKREDAKTION', 'DJ FOLSOE · MUSIC DESK', 'DJ FOLSOE · MUSIKREDAKTION'],
    title: ['Nyt fra musikkens verden', 'What’s new in music', 'Neues aus der Musikwelt'],
    intro: ['Nye udgivelser, lange DJ-sæt og historier om musikken, der finder vej tilbage til dansegulvet.', 'New releases, extended DJ sets and stories about music finding its way back to the dance floor.', 'Neue Veröffentlichungen, lange DJ-Sets und Geschichten über Musik, die den Weg zurück auf die Tanzfläche findet.'],
    detail: ['Læs historien', 'Read the story', 'Geschichte lesen'],
    sources: ['Kilder og lytning', 'Sources and listening', 'Quellen und Hörtipps'],
    release: ['Ny single', 'New single', 'Neue Single'],
    set: ['DJ-sæt', 'DJ set', 'DJ-Set'],
    upcoming: ['På vej', 'Coming up', 'Demnächst'],
    studioPhoto: ['Studieillustration', 'Studio illustration', 'Studioillustration'],
    related: ['Lyt videre hos DJ FOLSOE', 'Keep listening with DJ FOLSOE', 'Weiterhören bei DJ FOLSOE'],
    updated: ['Redaktionen opdateret', 'Desk updated', 'Redaktion aktualisiert'],
    ep: ['Ny EP', 'New EP', 'Neue EP'],
    archive: ['Fra arkivet', 'From the archive', 'Aus dem Archiv'],
    station: ['MUSIK-TV PÅ TWITCH', 'MUSIC TV ON TWITCH', 'MUSIK-TV AUF TWITCH'],
    hero: ['Musik på sendefladen', 'Music on the air', 'Musik auf Sendung'],
    lead: ['Se DJ FOLSOE live på Twitch. Mellem udsendelserne finder du nye udgivelser, musikhistorier og næste show på samme kanal.', 'Watch DJ FOLSOE live on Twitch. Between broadcasts, find new releases, music stories and the next show on the same channel.', 'Sieh DJ FOLSOE live auf Twitch. Zwischen den Sendungen findest du hier neue Musik, Geschichten und das nächste Showdatum.'],
    program: ['Se sendeplanen', 'See the schedule', 'Zum Sendeplan'],
    stories: ['Læs musiknyheder', 'Read music news', 'Musiknews lesen'],
    unavailable: ['Musiknyhederne kunne ikke hentes lige nu.', 'Music news is temporarily unavailable.', 'Musiknews sind gerade nicht verfügbar.']
  };
  const texts = (key, index) => labels[key]?.[index] ?? '';
  const node = (tag, value, cls) => {
    const el = document.createElement(tag);
    if (value) el.textContent = value;
    if (cls) el.className = cls;
    return el;
  };
  const validText = rows => Array.isArray(rows) && rows.length === 3 && rows.every(s => typeof s === 'string' && s.trim());
  const validLink = source => {
    try {
      const link = new URL(source.url);
      return link.protocol === 'https:' && !link.username && !link.password && typeof source.label === 'string';
    } catch { return false; }
  };
  const listening = {
    release: ['trance', '/music/trance/'],
    set: ['weekend', '/shows/weekend/'],
    ep: ['nudisco', '/music/nu-disco/'],
    archive: ['retro', '/archive/retro-hits/'],
    upcoming: ['popup', '/shows/']
  };
  let entries = [];
  let failed = false;
  let updated = '';
  let fingerprint = '';
  let inFlight = false;
  let checked = 0;
  const interval = 180000;

  function render() {
    const index = language();
    const t = key => texts(key, index);
    for (const item of document.querySelectorAll('[data-music-desk-copy]')) {
      item.textContent = t(item.dataset.musicDeskCopy);
    }
    const results = root.querySelector('[data-music-desk-stories]');
    const dates = new Intl.DateTimeFormat(['da-DK','en-GB','de-DE'][index], { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
    const dateline = root.querySelector('[data-music-desk-updated]');
    if (dateline) {
      dateline.hidden = !updated;
      if (updated) dateline.textContent = t('updated') + ' · ' + dates.format(new Date(updated+'T12:00:00Z'));
    }
    if (failed) {
      results.replaceChildren(node('p', t('unavailable')));
      return;
    }
    const open = new Set([...results.querySelectorAll('details[open]')].map(el => el.dataset.story));
    results.replaceChildren(...entries.map((story, position) => {
      const card = node('article', '', 'djf-desk-story');
      const [art, href] = listening[story.kind];
      if (position !== 0) {
        const image = node('img', '', 'station-picture');
        image.src = '/assets/img/station/' + art + '.png';
        image.alt = '';
        image.width = 1000;
        image.height = 500;
        image.loading = 'lazy';
        image.decoding = 'async';
        card.append(image);
      }
      if (position === 0) {
        card.classList.add('djf-desk-lead');
        const figure = node('figure', '', 'djf-desk-photo');
        figure.append(node('figcaption', t('studioPhoto')));
        card.append(figure);
      }
      card.dataset.kind = story.kind;
      const metadata = node('div', '', 'djf-desk-meta');
      const time = node('time', dates.format(new Date(story.date + 'T12:00:00Z')));
      time.dateTime = story.date;
      metadata.append(node('span', t(story.kind)), time);
      const detail = node('details');
      detail.dataset.story = story.id;
      detail.open = open.has(story.id);
      detail.append(node('summary', t('detail')), node('p', story.story[index]));
      const sources = node('ul', '', 'djf-desk-sources');
      sources.setAttribute('aria-label', t('sources'));
      for (const source of story.sources) {
        const li = node('li');
        const link = node('a', source.label + ' ↗');
        link.href = source.url;
        li.append(link);
        sources.append(li);
      }
      const related = node('a', t('related'), 'station-desk-related');
      related.href = href;
      detail.append(related);
      card.append(metadata, node('h3', story.title[index]), node('p', story.intro[index]), detail, sources);
      return card;
    }));
  }
  new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  render();
  const dateOk = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value));
  async function refresh(){
    if (inFlight || document.hidden) return;
    inFlight = true;
    checked = Date.now();
    const controller = new AbortController();
    const deadline = setTimeout(() => controller.abort(), 7500);
    try {
      const response = await fetch('/assets/data/music-desk.json', { credentials: 'omit', cache: 'no-cache', signal: controller.signal });
      if (!response.ok) throw Error('Unavailable');
      const data = await response.json();
      if (data.schema !== 1 || !Array.isArray(data.stories)) throw Error('Invalid feed');
      const valid = data.stories.filter(item => item && typeof item.id === 'string' && ['release','set','ep','archive','upcoming'].includes(item.kind)
        && dateOk(item.date) && [item.title,item.intro,item.story].every(validText)
        && Array.isArray(item.sources) && item.sources.length && item.sources.every(validLink)).slice(0, 12);
      if (!valid.length) throw Error('Empty feed');
      const stamp = dateOk(data.updated) ? data.updated : '';
      const signature = JSON.stringify([stamp, valid]);
      if (signature === fingerprint) return;
      updated = stamp;
      entries = valid;
      fingerprint = signature;
      failed = false;
      render();
    } catch {
      if (!entries.length && !failed) { failed = true; render(); }
    } finally {
      clearTimeout(deadline);
      inFlight = false;
    }
  }
  setInterval(refresh, interval);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && (!entries.length || Date.now()-checked >= interval)) refresh();
  });
  refresh();
})();
