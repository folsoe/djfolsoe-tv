/* DJ FOLSOE V26010 — SAFE WEBSITE CMS BRIDGE
   Reads existing broadcast data and only updates existing website nodes.
   Empty or failed CMS data never clears the current page. */
(() => {
  "use strict";
  const API = 'https://djfolsoe-tv-api.sunefolsoe.workers.dev';
  const BUILD = 'V26100';
  let lastRevision = '';

  const text = (id, value) => {
    const node = document.getElementById(id);
    const clean = String(value ?? '').trim();
    if (node && clean) node.textContent = clean;
  };
  const pick = (...values) => values.find(v => String(v ?? '').trim()) || '';
  const themeId = value => String(value || '').toLowerCase().trim().replace(/\s+/g, '-');

  function renderShows(shows) {
    if (!Array.isArray(shows) || !shows.length) return;
    const grid = document.querySelector('#shows .showGrid');
    if (!grid) return;
    const valid = shows.filter(show => show && show.enabled !== false && pick(show.title, show.name)).slice(0, 12);
    if (!valid.length) return;
    const fragment = document.createDocumentFragment();
    valid.forEach(show => {
      const article = document.createElement('article');
      const small = document.createElement('small');
      const h3 = document.createElement('h3');
      const p = document.createElement('p');
      small.textContent = pick(show.time, show.day, show.timeLabel, 'LIVE SHOW');
      h3.textContent = pick(show.title, show.name);
      p.textContent = pick(show.description, show.text, 'DJ FOLSOE live on Twitch.');
      article.append(small, h3, p);
      fragment.appendChild(article);
    });
    grid.replaceChildren(fragment);
  }

  function apply(payload) {
    const core = payload?.data || payload?.core || payload || {};
    if (!core || typeof core !== 'object') return false;
    const hero = core.hero || {};
    const next = core.nextShow || {};
    const community = core.community || {};
    const theme = core.theme || {};
    const show = core.show || {};

    text('cmsHeroEyebrow', hero.eyebrow);
    text('cmsHeroTitle', hero.title);
    text('cmsHeroLead', pick(hero.text, hero.subtitle));
    text('deskTitle', pick(show.title, show.current, hero.title));
    text('deskText', pick(core.overlay?.infoLine, community.requestText, hero.subtitle));
    text('theme', pick(theme.title, theme.id));
    text('offlineNextTitle', pick(next.title, next.show));
    text('offlineNextDate', pick(next.timeLabel, next.description));
    text('heroChannelText', pick(community.specialEvent, next.description));

    text('webDockLiveTitle', pick(show.title, show.current, hero.title));
    text('webDockNextTitle', pick(next.title, next.show));
    text('webDockNextTime', pick(next.timeLabel, next.description));
    text('automationNextTitle', pick(next.title, next.show));
    text('automationNextDate', pick(next.timeLabel, next.description));
    text('siteShowGenre', pick(show.genre, show.description, hero.subtitle));
    renderShows(core.featuredShows);

    const id = themeId(theme.id || next.theme);
    if (id) document.body.dataset.showTheme = id; document.documentElement.dataset.djfTheme = id;
    lastRevision = String(core.revision || core.updatedAt || payload.updatedAt || '');
    document.documentElement.dataset.djfCmsRevision = lastRevision;
    window.dispatchEvent(new CustomEvent('djf:v26010-site-applied', { detail: { core, revision: lastRevision } }));
    return true;
  }

  async function refresh() {
    try {
      const response = await fetch(`${API}/api/broadcast?v=${Date.now()}`, { cache: 'no-store', headers: { Accept: 'application/json' } });
      if (!response.ok) return false;
      return apply(await response.json());
    } catch (_) {
      return false;
    }
  }

  function start() {
    document.documentElement.dataset.djfSiteBuild = BUILD;
    refresh();
    setInterval(refresh, 30000);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
    window.DJF_V26100_SITE = { refresh, apply, status: () => ({ ready: true, build: BUILD, revision: lastRevision }) };
    console.info('DJ FOLSOE V26100 Overlay-to-Web Bridge ready');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
