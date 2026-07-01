// DJ FOLSOE NETWORK V923 - STREAM ELEMENTS JSONP BRIDGE
// Lightweight Cloudflare Worker. Stores one clean broadcast-core and returns compatibility aliases.
// Endpoints: GET /api/health, GET /api/broadcast, GET /api/broadcast-jsonp, POST /api/publish, GET /api/twitch

const VERSION = 'V923 StreamElements JSONP Bridge';
const SCHEMA = 'broadcast-core/v2-clean';
const KEY = 'broadcast-core';
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Token',
  'Access-Control-Max-Age': '86400'
};
let MEMORY_CORE = null;
let MEMORY_UPDATED_AT = null;
let TWITCH_CACHE = { at: 0, data: null };

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
  });
}

function js(data, status = 200) {
  return new Response(data, {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/javascript; charset=utf-8', 'Cache-Control': 'no-store' }
  });
}
function safeCallbackName(v) {
  const name = String(v || 'djfBroadcastCoreCallback').replace(/[^a-zA-Z0-9_$\.]/g, '');
  return name || 'djfBroadcastCoreCallback';
}
function cleanPath(pathname) { return pathname.replace(/\/+$/, '') || '/'; }
function authOk(request, env) {
  if (!env.ADMIN_TOKEN) return true;
  const header = request.headers.get('x-admin-token') || '';
  const auth = request.headers.get('authorization') || '';
  const bearer = auth.toLowerCase().startsWith('bearer ') ? auth.slice(7) : '';
  return header === env.ADMIN_TOKEN || bearer === env.ADMIN_TOKEN;
}
async function readBody(request) { try { return await request.json(); } catch (_) { return {}; } }

function defaultCore(env = {}) {
  const now = new Date().toISOString();
  const channel = env.TWITCH_CHANNEL || 'djfolsoe';
  return {
    ok: true,
    version: VERSION,
    schema: SCHEMA,
    source: 'worker-default',
    updatedAt: now,
    twitch: {
      ok: true, source: 'fallback', channel, displayName: 'DJFolsoe', userId: '', profileImage: '',
      isLive: false, live: false, viewers: 0, followers: null, subs: null,
      liveTitle: 'DJ FOLSOE', title: 'DJ FOLSOE', category: 'Music', startedAt: null, checkedAt: now
    },
    show: { current: 'DJ FOLSOE', title: 'DJ FOLSOE', mode: 'OFFLINE', state: 'OFFLINE' },
    nextShow: {
      title: 'Next DJ FOLSOE Broadcast', show: 'Next DJ FOLSOE Broadcast', datetime: '', dateTime: '',
      timeLabel: 'Announced soon', theme: 'Music TV', description: 'The next show is controlled from admin and appears here automatically.', active: true
    },
    theme: { id: 'weekend', title: 'Weekend', background: 'themes/weekend.png' },
    hero: {
      eyebrow: 'DJ FOLSOE TWITCH · MUSIC STREAMER FROM DENMARK',
      title: 'DJ FOLSOE', subtitle: 'Dive into my Twitch world',
      text: 'Live DJ shows, song requests, Top 20 countdowns and community energy from Denmark.'
    },
    community: {
      followers: null, followerGoal: 1000, subs: 0, subGoal: 100,
      text: 'Live DJ shows, song requests, Top 20 countdowns and community energy from Denmark.',
      requestText: 'Use !request Artist - Title in Twitch chat', specialEvent: ''
    },
    ticker: { text: 'DJ FOLSOE TWITCH · MUSIC STREAMER FROM DENMARK · REQUEST A SONG · TOP 20 · LIVE COMMUNITY', items: [] },
    top20: [
      { rank: 1, artist: 'DJ FOLSOE', title: "This Week's Number One", status: 'ADMIN CONTROLLED' },
      { rank: 2, artist: 'Viewer Pick', title: 'Request of the Week', status: 'COMMUNITY' },
      { rank: 3, artist: 'Future Hit', title: 'Discovery Track', status: 'NEW' }
    ],
    featuredShows: [
      { time: 'Morning', title: 'Good Morning Twitch', description: 'Bright morning mood, coffee, chat and fresh music.', color: '#ffe36e' },
      { time: 'Tuesday', title: 'Trance Tuesday', description: 'Melodic trance, energy and emotional peak-time sound.', color: '#62ecff' },
      { time: 'Special', title: 'Eurodance', description: '90s and 00s dance classics with full Music TV nostalgia.', color: '#ff4bd8' },
      { time: 'Friday', title: 'Fredagsbar', description: 'Weekend mode, party classics and Danish Friday energy.', color: '#6cffb5' },
      { time: 'Sunday', title: 'Retro Hits', description: '70s, 80s and 90s memories with viewer favourites.', color: '#ffe36e' },
      { time: 'Surprise', title: 'Pop Up Live', description: 'The stream that appears when you least expect it.', color: '#ffffff' }
    ],
    overlay: {
      title: 'DJ FOLSOE', status: 'OFFLINE', infoLine: 'DJ FOLSOE TWITCH · MUSIC STREAMER FROM DENMARK',
      requestText: 'Use !request Artist - Title in Twitch chat', specialEvent: '', subGoal: 100
    }
  };
}
function normalizeNextShow(raw) {
  const x = raw || {};
  const dt = x.datetime || x.dateTime || (x.date && (x.start || x.time) ? `${x.date}T${x.start || x.time}` : '');
  let label = x.timeLabel || x.start || x.time || 'Announced soon';
  if (dt && (!x.timeLabel || x.timeLabel === 'Announced soon')) {
    const d = new Date(dt);
    if (!isNaN(d.getTime())) label = d.toLocaleString('en-GB', { weekday:'short', day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });
  }
  const title = x.title || x.show || 'Next DJ FOLSOE Broadcast';
  return { title, show: x.show || title, datetime: dt, dateTime: dt, timeLabel: label, theme: x.theme || 'Music TV', description: x.description || x.body || 'The next show is controlled from admin and appears here automatically.', active: x.active !== false };
}
function normalizeCore(input = {}, twitch = null, env = {}) {
  const base = defaultCore(env);
  const oldHero = input.homepage?.hero || {};
  const oldBroadcast = input.broadcast || {};
  const oldCommunity = input.community || {};
  const oldOverlay = input.overlay || input.overlayHub || {};
  const cp = oldOverlay.controlPanel || {};
  const themeId = input.theme?.id || input.activeTheme || oldBroadcast.activeTheme || oldOverlay.activeTheme || cp.theme || base.theme.id;
  const showTitle = input.show?.current || input.show?.title || oldBroadcast.activeShow || oldBroadcast.activeShowTitle || cp.title || base.show.title;
  const mode = input.show?.mode || input.show?.state || oldBroadcast.mode || oldBroadcast.broadcastState || oldOverlay.state || cp.status || base.show.mode;
  const clean = {
    ...base,
    ...pick(input, ['source']),
    updatedAt: input.updatedAt || new Date().toISOString(),
    twitch: { ...base.twitch, ...(input.twitch || {}), ...(twitch || {}) },
    show: { ...base.show, ...(input.show || {}), current: showTitle, title: showTitle, mode, state: mode },
    nextShow: normalizeNextShow(input.nextShow || input.homepage?.nextShow || cp.nextShow || base.nextShow),
    theme: { ...base.theme, ...(input.theme || {}), id: themeId, title: input.theme?.title || titleCase(themeId), background: input.theme?.background || oldHero.background || `themes/${themeId}.png` },
    hero: { ...base.hero, ...oldHero, ...(input.hero || {}) },
    community: { ...base.community, ...oldCommunity, ...(input.community || {}) },
    ticker: normalizeTicker(input.ticker || input.homepage?.ticker || oldOverlay.ticker || input.bottomTickerItems || base.ticker),
    top20: input.top20 || input.homepage?.top20 || base.top20,
    featuredShows: input.featuredShows || input.homepage?.featuredShows || base.featuredShows,
    overlay: { ...base.overlay, ...cp, ...(input.overlay && !input.overlay.controlPanel ? input.overlay : {}), title: showTitle, status: mode }
  };
  const tw = clean.twitch || {};
  clean.show.live = !!tw.isLive || !!tw.live || mode === 'LIVE SHOW' || mode === 'LIVE';
  clean.show.viewers = Number(tw.viewers || oldBroadcast.viewers || 0);
  clean.show.streamTitle = tw.liveTitle || tw.title || oldBroadcast.streamTitle || `${showTitle} · DJ FOLSOE Twitch music streamer from Denmark`;
  clean.community.followers = tw.followers ?? clean.community.followers ?? oldBroadcast.followers ?? cp.followers ?? null;
  clean.community.subs = tw.subs ?? clean.community.subs ?? cp.subs ?? 0;
  clean.overlay.infoLine = clean.ticker.text || clean.overlay.infoLine;
  clean.overlay.requestText = clean.community.requestText;
  clean.overlay.specialEvent = clean.community.specialEvent;
  clean.overlay.subGoal = clean.community.subGoal;
  clean.ok = true;
  clean.version = VERSION;
  clean.schema = SCHEMA;
  return clean;
}
function normalizeTicker(raw) {
  if (typeof raw === 'string') return { text: raw, items: [raw] };
  if (Array.isArray(raw)) {
    const texts = raw.map(x => typeof x === 'string' ? x : x?.text).filter(Boolean);
    return { text: texts.join(' · ') || '', items: texts };
  }
  const text = raw?.text || (raw?.items || []).join(' · ') || '';
  return { text, items: raw?.items || (text ? [text] : []) };
}
function pick(obj, keys) { const out = {}; for (const k of keys) if (obj && obj[k] !== undefined) out[k] = obj[k]; return out; }
function titleCase(v) { return String(v || '').replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()); }
function compatibility(core) {
  const tickerText = core.ticker?.text || '';
  const followers = core.community?.followers ?? core.twitch?.followers ?? null;
  const subs = core.community?.subs ?? core.twitch?.subs ?? 0;
  return {
    broadcast: {
      version: VERSION, mode: core.show.mode, broadcastState: core.show.state, activeShow: core.show.current, activeShowTitle: core.show.title,
      activeTheme: core.theme.id, live: !!core.show.live, viewers: core.show.viewers || 0, followers, streamTitle: core.show.streamTitle, updatedAt: core.updatedAt
    },
    homepage: {
      version: VERSION, hero: { ...core.hero, background: core.theme.background }, ticker: core.ticker.items?.length ? core.ticker.items : [tickerText],
      nextShow: core.nextShow,
      sectionTitles: { nextKicker:'NEXT SHOW', nextTitle:'Next DJ FOLSOE Broadcast', showsKicker:'FEATURED SHOWS', showsTitle:'Your favorite show', aboutKicker:'DISCOVER DJ FOLSOE', aboutTitle:'Music TV, Twitch and Danish DJ energy' },
      featuredShows: core.featuredShows, aboutText:'DJ FOLSOE is a Danish Twitch DJ and Music TV project built around live shows, requests, moderators, community and a broadcast look made for TV, mobile and desktop.', top20: core.top20
    },
    website: { title: core.hero.title || 'DJ FOLSOE', description: core.hero.text || '', primaryLanguage: 'en' },
    overlayHub: {
      version: VERSION, state: core.show.state, activeShow: core.show.current, activeTheme: core.theme.id, ticker: tickerText,
      controlPanel: { title: core.overlay.title || core.show.current, status: core.overlay.status || core.show.state, theme: core.theme.id, viewers: core.show.viewers || 0, followers, subs, subGoal: core.community.subGoal, nextShow: core.nextShow, infoLine: core.overlay.infoLine || tickerText, requestText: core.overlay.requestText, specialEvent: core.overlay.specialEvent },
      updatedAt: core.updatedAt
    },
    bottomTickerItems: [{ id:'v921-main-ticker', active:true, theme:'all', text:tickerText, priority:1 }]
  };
}
async function kvGet(env) {
  try { if (env.BROADCAST_CORE?.get) { const raw = await env.BROADCAST_CORE.get(KEY); if (raw) return JSON.parse(raw); } } catch (_) {}
  return null;
}
async function kvPut(env, core) {
  try { if (env.BROADCAST_CORE?.put) { await env.BROADCAST_CORE.put(KEY, JSON.stringify(core)); return true; } } catch (_) {}
  return false;
}
async function getStoredCore(env) { return MEMORY_CORE || await kvGet(env) || defaultCore(env); }
async function getTwitch(env) {
  const now = Date.now();
  if (TWITCH_CACHE.data && now - TWITCH_CACHE.at < 30000) return TWITCH_CACHE.data;
  const channel = env.TWITCH_CHANNEL || 'djfolsoe';
  const clientId = env.TWITCH_CLIENT_ID;
  const token = env.TWITCH_ACCESS_TOKEN;
  const fallback = { ok:true, source:'fallback', channel, isLive:false, live:false, viewers:0, followers:null, subs:null, liveTitle:'DJ FOLSOE', title:'DJ FOLSOE', category:'Music', checkedAt:new Date().toISOString() };
  if (!clientId || !token) { TWITCH_CACHE = { at: now, data: fallback }; return fallback; }
  const headers = { 'Client-ID': clientId, 'Authorization': `Bearer ${token}` };
  try {
    const userRes = await fetch(`https://api.twitch.tv/helix/users?login=${encodeURIComponent(channel)}`, { headers });
    const userJson = await userRes.json();
    const user = userJson.data?.[0];
    if (!user) throw new Error('Twitch user not found');
    const streamRes = await fetch(`https://api.twitch.tv/helix/streams?user_id=${encodeURIComponent(user.id)}`, { headers });
    const stream = (await streamRes.json()).data?.[0];
    let followers = null;
    try { followers = (await (await fetch(`https://api.twitch.tv/helix/channels/followers?broadcaster_id=${encodeURIComponent(user.id)}`, { headers })).json()).total ?? null; } catch (_) {}
    const data = { ok:true, source:'twitch-api', channel, userId:user.id, displayName:user.display_name, profileImage:user.profile_image_url, isLive:!!stream, live:!!stream, viewers:stream?.viewer_count || 0, followers, subs:null, liveTitle:stream?.title || user.display_name || 'DJ FOLSOE', title:stream?.title || user.display_name || 'DJ FOLSOE', category:stream?.game_name || 'Music', startedAt:stream?.started_at || null, checkedAt:new Date().toISOString() };
    TWITCH_CACHE = { at: now, data }; return data;
  } catch (e) { TWITCH_CACHE = { at: now, data: { ...fallback, ok:false, error:e.message } }; return TWITCH_CACHE.data; }
}
async function handle(request, env) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS_HEADERS });
  const url = new URL(request.url);
  const path = cleanPath(url.pathname);
  if (path === '/api/health' || path === '/api/health-check') {
    return json({ ok:true, version:VERSION, schema:SCHEMA, worker:'djfolsoe-tv-api', endpoints:['/api/health','/api/broadcast','/api/broadcast-jsonp','/api/publish','/api/twitch'], hasKV:!!env.BROADCAST_CORE, memoryUpdatedAt:MEMORY_UPDATED_AT, checkedAt:new Date().toISOString() });
  }
  if (path === '/api/twitch' || path === '/api/twitch-profile') return json(await getTwitch(env));
  if (path === '/api/broadcast' || path === '/api/unified-control' || path === '/api/website-portal' || path === '/api/broadcast-jsonp') {
    const stored = await getStoredCore(env);
    const twitch = url.searchParams.get('twitch') === '0' ? null : await getTwitch(env);
    const core = normalizeCore(stored, twitch, env);
    const compat = compatibility(core);
    const payload = { ok:true, version:VERSION, schema:SCHEMA, storage: MEMORY_CORE ? 'memory' : (env.BROADCAST_CORE ? 'kv-or-default' : 'memory-default'), core, data: core, twitch: core.twitch, ...compat, overlay: compat.overlayHub, updatedAt: core.updatedAt };
    if (path === '/api/broadcast-jsonp') {
      const cb = safeCallbackName(url.searchParams.get('callback'));
      return js(`${cb}(${JSON.stringify(payload)});`);
    }
    return json(payload);
  }
  if (path === '/api/publish' && request.method === 'POST') {
    if (!authOk(request, env)) return json({ ok:false, error:'Unauthorized' }, 401);
    const body = await readBody(request);
    const twitch = await getTwitch(env);
    const core = normalizeCore(body.core || body.data || body, twitch, env);
    core.source = 'admin-publish';
    core.updatedAt = new Date().toISOString();
    MEMORY_CORE = core; MEMORY_UPDATED_AT = core.updatedAt;
    const stored = await kvPut(env, core);
    return json({ ok:true, version:VERSION, schema:SCHEMA, stored, storage: stored ? 'kv' : 'memory', core, data: core, twitch: core.twitch, ...compatibility(core), updatedAt: core.updatedAt });
  }
  return json({ ok:false, error:'Not found', version:VERSION, path }, 404);
}
export default { fetch: handle };
