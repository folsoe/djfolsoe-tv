(() => {
  'use strict';
  const root = document.querySelector('[data-home-weekly-stories]');
  if (!root) return;

  const shows = [
    ['trance', 'Trance Tuesday', '/shows/trance-tuesday/'],
    ['eurodance', 'Classic Dance #90 #00', '/shows/eurodance/'],
    ['retro', 'Retro Hits', '/shows/retro-hits/'],
  ];
  const languages = ['da', 'en', 'de'];
  const words = {
    title: ['Ugens musikfortællinger', 'This week’s music stories', 'Musikgeschichten der Woche'],
    week: ['Uge', 'Week', 'Woche'],
    source: ['Kilde ↗', 'Source ↗', 'Quelle ↗'],
    spotify: ['Åbn ugens playliste ↗', 'Open this week’s playlist ↗', 'Playlist der Woche öffnen ↗'],
    show: ['Find showet →', 'Explore the show →', 'Zur Show →'],
    life: ['Musikminder', 'Music memories', 'Musikerinnerungen'],
    humor: ['Fra studiet · fiktiv', 'From the studio · fiction', 'Aus dem Studio · fiktiv'],
  };
  let bulletin;
  let playlists;
  const languageIndex = () => Math.max(0, languages.indexOf(document.documentElement.lang.split('-')[0]));
  const copy = (values, lang) => Array.isArray(values) && typeof values[lang] === 'string' ? values[lang] : '';

  function node(tag, text, className) {
    const element = document.createElement(tag);
    if (text) element.textContent = text;
    if (className) element.className = className;
    return element;
  }

  function link(label, href) {
    const anchor = node('a', label);
    anchor.href = href;
    if (href.startsWith('https:')) {
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
    }
    return anchor;
  }

  function https(value) {
    try { return new URL(value).protocol === 'https:'; } catch { return false; }
  }

  function render() {
    if (!bulletin || Date.parse(bulletin.expiresAt) <= Date.now()) {
      root.hidden = true;
      return;
    }
    const lang = languageIndex();
    const featured = node('section', '', 'djf-home-week');
    const grid = node('div', '', 'djf-home-week-grid');
    featured.append(
      node('p', words.week[lang] + ' ' + bulletin.week.slice(-2), 'djf-home-week-label'),
      node('h3', words.title[lang]),
      grid
    );
    for (const [key, show, path] of shows) {
      const stories = bulletin.shows?.[key];
      if (!Array.isArray(stories) || !stories.length) continue;
      const card = node('div', '', 'djf-home-week-card');
      card.dataset.show = key;
      card.append(node('p', show, 'djf-home-week-label'));
      for (const story of stories.slice(0, 2)) {
        const article = node('article');
        const title = copy(story.headline, lang) || [story.artist, story.title].filter(Boolean).join(' · ');
        const source = story.sources?.find(https);
        article.append(
          node('p', [story.artist, story.title].filter(Boolean).join(' · '), 'djf-home-week-track'),
          node('h4', title),
          node('p', copy(story.longText, lang) || copy(story.text, lang))
        );
        if (copy(story.questionText, lang)) article.append(node('p', copy(story.questionText, lang), 'djf-home-week-question'));
        if (source) article.append(link(words.source[lang], source));
        card.append(article);
      }
      const id = playlists?.week === bulletin.week ? playlists.shows?.[key]?.id : null;
      const actions = node('div', '', 'djf-home-week-actions');
      if (/^[A-Za-z0-9]{22}$/.test(id || '')) {
        actions.append(link(words.spotify[lang], 'https://open.spotify.com/playlist/' + id));
      }
      actions.append(link(words.show[lang], path));
      card.append(actions);
      grid.append(card);
    }
    if (!grid.childElementCount) { root.hidden = true; return; }

    const columns = node('div', '', 'djf-home-week-columns');
    for (const column of bulletin.columns || []) {
      if (!['life', 'humor'].includes(column.kind)) continue;
      const article = node('article');
      article.append(node('p', words[column.kind][lang], 'djf-home-week-label'),
        node('h4', copy(column.title, lang)), node('p', copy(column.text, lang)));
      columns.append(article);
    }
    if (columns.childElementCount) featured.append(columns);
    root.replaceChildren(featured);
    root.hidden = false;
  }

  document.addEventListener('visibilitychange', () => { if (!document.hidden) render(); });
  window.addEventListener('djf:languagechange', render);
  const json = async path => {
    const response = await fetch(path, { credentials: 'omit', cache: 'no-cache', signal: AbortSignal.timeout(6000) });
    if (!response.ok) throw new Error('Data unavailable');
    return response.json();
  };
  Promise.allSettled([json('/assets/data/weekly-show-notes.json'), json('/assets/data/show-playlists.json')])
    .then(([stories, lists]) => {
      const data = stories.value;
      if (data?.schema !== 1 || data.status !== 'published' || !/^\d{4}-W\d{2}$/.test(data.week)) return;
      const now = Date.now(), from = Date.parse(data.publishedAt), until = Date.parse(data.expiresAt);
      if (!(from <= now && now < until && until - from <= 15 * 86400000)) return;
      bulletin = data;
      playlists = lists.value;
      render();
      setTimeout(render, until - now + 100);
    });
})();
