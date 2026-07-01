// DJ FOLSOE NETWORK V918.9 - BROADCAST CORE ENGINE
// Lightweight Cloudflare Worker: one master broadcast-core for admin, website and overlay.
// Endpoints:
// GET  /api/health
// GET  /api/broadcast
// POST /api/publish
// GET  /api/twitch

const VERSION = 'V918.9 Broadcast Core Engine';
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
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
}
function cleanPath(pathname) {
  return pathname.replace(/\/+$/, '') || '/';
}
function authOk(request, env) {
  const required = env.ADMIN_TOKEN;
  if (!required) return true;
  const headerToken = request.headers.get('x-admin-token') || '';
  const auth = request.headers.get('authorization') || '';
  const bearer = auth.toLowerCase().startsWith('bearer ') ? auth.slice(7) : '';
  return headerToken === required || bearer === required;
}
async function readBody(request) {
  try { return await request.json(); } catch (_) { return {}; }
}
function defaultCore(env = {}) {
  const channel = env.TWITCH_CHANNEL || 'djfolsoe';
  const now = new Date().toISOString();
  return {
    ok: true,
    version: VERSION,
    schema: 'broadcast-core/v1',
    source: 'worker-default',
    activeTheme: 'weekend',
    language: 'en',
    twitch: {
      ok: true,
      channel,
      isLive: false,
      live: false,
      viewers: 0,
      followers: null,
      subs: 0,
      liveTitle: 'DJ FOLSOE',
      title: 'DJ FOLSOE',
      category: 'Music',
      profileImage: ''
    },
    broadcast: {
      mode: 'OFFLINE',
      broadcastState: 'OFFLINE',
      activeShow: 'DJ FOLSOE',
      activeShowTitle: 'DJ FOLSOE',
      activeTheme: 'weekend',
      live: false,
      viewers: 0,
      followers: null,
      streamTitle: 'DJ FOLSOE · Twitch music streamer from Denmark',
      updatedAt: now
    },
    homepage: {
      hero: {
        eyebrow: 'DJ FOLSOE TWITCH · MUSIC STREAMER FROM DENMARK',
        title: 'DJ FOLSOE',
        subtitle: 'Dive into my Twitch world',
        text: 'Live DJ shows, song requests, Top 20 countdowns and community energy from Denmark.',
        background: 'themes/weekend.png'
      },
      ticker: ['DJ FOLSOE TWITCH · MUSIC STREAMER FROM DENMARK · REQUEST A SONG · TOP 20 · LIVE COMMUNITY'],
      nextShow: {
        title: 'Next DJ FOLSOE Broadcast',
        show: 'Next DJ FOLSOE Broadcast',
        datetime: '',
        dateTime: '',
        timeLabel: 'Announced soon',
        theme: 'Music TV',
        description: 'The next show is controlled from admin and appears here automatically.',
        active: true
      },
      sectionTitles: {
        nextKicker: 'NEXT SHOW',
        nextTitle: 'Next DJ FOLSOE Broadcast',
        showsKicker: 'FEATURED SHOWS',
        showsTitle: 'Your favorite show',
        aboutKicker: 'DISCOVER DJ FOLSOE',
        aboutTitle: 'Music TV, Twitch and Danish DJ energy'
      },
      featuredShows: [
        { time: 'Morning', title: 'Good Morning Twitch', description: 'Bright morning mood, coffee, chat and fresh music.', color: '#ffe36e' },
        { time: 'Tuesday', title: 'Trance Tuesday', description: 'Melodic trance, energy and emotional peak-time sound.', color: '#62ecff' },
        { time: 'Special', title: 'Eurodance', description: '90s and 00s dance classics with full Music TV nostalgia.', color: '#ff4bd8' },
        { time: 'Friday', title: 'Fredagsbar', description: 'Weekend mode, party classics and Danish Friday energy.', color: '#6cffb5' },
        { time: 'Sunday', title: 'Retro Hits', description: '70s, 80s and 90s memories with viewer favourites.', color: '#ffe36e' },
        { time: 'Surprise', title: 'Pop Up Live', description: 'The stream that appears when you least expect it.', color: '#ffffff' }
      ],
      aboutText: 'DJ FOLSOE is a Danish Twitch DJ and Music TV project built around live shows, requests, moderators, community and a broadcast look made for TV, mobile and desktop.',
      top20: [
        { rank: 1, artist: 'DJ FOLSOE', title: "This Week's Number One", status: 'ADMIN CONTROLLED' },
        { rank: 2, artist: 'Viewer Pick', title: 'Request of the Week', status: 'COMMUNITY' },
        { rank: 3, artist: 'Future Hit', title: 'Discovery Track', status: 'NEW' }
      ]
    },
    website: {
      title: 'DJ FOLSOE',
      description: 'Live DJ shows, song requests, Top 20 countdowns and community energy from Denmark.',
      primaryLanguage: 'en'
    },
    nextShow: {
      title: 'Next DJ FOLSOE Broadcast',
      show: 'Next DJ FOLSOE Broadcast',
      datetime: '',
      dateTime: '',
      timeLabel: 'Announced soon',
      theme: 'Music TV',
      description: 'The next show is controlled from admin and appears here automatically.',
      active: true
    },
    overlayHub: {
      version: VERSION,
      state: 'OFFLINE',
      activeShow: 'DJ FOLSOE',
      activeTheme: 'weekend',
      ticker: 'DJ FOLSOE TWITCH · MUSIC STREAMER FROM DENMARK',
      controlPanel: {
        title: 'DJ FOLSOE',
        status: 'OFFLINE',
        theme: 'weekend',
        viewers: 0,
        followers: null,
        subs: 0,
        subGoal: 100,
        infoLine: 'DJ FOLSOE TWITCH · MUSIC STREAMER FROM DENMARK'
      },
      updatedAt: now
    },
    community: {
      followers: null,
      subs: 0,
      subGoal: 100,
      followerGoal: 1000,
      requestText: 'Use !request Artist - Title in Twitch chat',
      specialEvent: '',
      wall: [
        { kicker: 'FOLLOWERS', title: 'Follower journey', text: 'Goal: 1000 followers' },
        { kicker: 'SUBS', title: 'Sub journey', text: '0/100 subs' },
        { kicker: 'REQUESTS', title: 'Song requests', text: 'Use !request Artist - Title in Twitch chat' },
        { kicker: 'LIVE CHAT', title: 'Twitch chat', text: 'Chat and community are shown in the live overlay.' }
      ]
    },
    updatedAt: now
  };
}
function mergeCore(core, twitch) {
  const out = { ...defaultCore(), ...(core || {}) };
  out.version = VERSION;
  out.schema = 'broadcast-core/v1';
  out.ok = true;
  out.twitch = { ...(out.twitch || {}), ...(twitch || {}) };
  out.broadcast = { ...(out.broadcast || {}) };
  out.community = { ...(out.community || {}) };
  out.homepage = { ...(out.homepage || {}) };
  if (twitch) {
    out.broadcast.viewers = Number(twitch.viewers || 0);
    out.broadcast.live = !!twitch.isLive;
    out.broadcast.broadcastState = twitch.isLive ? 'LIVE' : (out.broadcast.broadcastState || out.broadcast.mode || 'OFFLINE');
    out.broadcast.streamTitle = twitch.liveTitle || twitch.title || out.broadcast.streamTitle;
    out.community.followers = twitch.followers ?? out.community.followers;
    out.community.subs = twitch.subs ?? out.community.subs;
  }
  out.nextShow = out.nextShow || out.homepage.nextShow;
  out.overlayHub = out.overlayHub || out.overlay || {};
  out.overlay = out.overlayHub;
  out.updatedAt = out.updatedAt || new Date().toISOString();
  return out;
}
async function kvGet(env) {
  try {
    if (env.BROADCAST_CORE && env.BROADCAST_CORE.get) {
      const raw = await env.BROADCAST_CORE.get('broadcast-core');
      if (raw) return JSON.parse(raw);
    }
  } catch (_) {}
  return null;
}
async function kvPut(env, core) {
  try {
    if (env.BROADCAST_CORE && env.BROADCAST_CORE.put) {
      await env.BROADCAST_CORE.put('broadcast-core', JSON.stringify(core));
      return true;
    }
  } catch (_) {}
  return false;
}
async function getStoredCore(env) {
  return MEMORY_CORE || await kvGet(env) || defaultCore(env);
}
async function getTwitch(env) {
  const now = Date.now();
  if (TWITCH_CACHE.data && now - TWITCH_CACHE.at < 30000) return TWITCH_CACHE.data;
  const channel = env.TWITCH_CHANNEL || 'djfolsoe';
  const clientId = env.TWITCH_CLIENT_ID;
  const token = env.TWITCH_ACCESS_TOKEN;
  const fallback = { ok: true, source: 'fallback', channel, isLive: false, live: false, viewers: 0, followers: null, subs: 0, liveTitle: 'DJ FOLSOE', title: 'DJ FOLSOE', category: 'Music' };
  if (!clientId || !token) {
    TWITCH_CACHE = { at: now, data: fallback };
    return fallback;
  }
  const headers = { 'Client-ID': clientId, 'Authorization': `Bearer ${token}` };
  try {
    const userRes = await fetch(`https://api.twitch.tv/helix/users?login=${encodeURIComponent(channel)}`, { headers });
    const userJson = await userRes.json();
    const user = userJson.data && userJson.data[0];
    if (!user) throw new Error('Twitch user not found');
    const streamRes = await fetch(`https://api.twitch.tv/helix/streams?user_id=${encodeURIComponent(user.id)}`, { headers });
    const streamJson = await streamRes.json();
    const stream = streamJson.data && streamJson.data[0];
    let followers = null;
    try {
      const folRes = await fetch(`https://api.twitch.tv/helix/channels/followers?broadcaster_id=${encodeURIComponent(user.id)}`, { headers });
      const folJson = await folRes.json();
      followers = folJson.total ?? null;
    } catch (_) {}
    const data = {
      ok: true,
      source: 'twitch-api',
      channel,
      userId: user.id,
      displayName: user.display_name,
      profileImage: user.profile_image_url || '',
      isLive: !!stream,
      live: !!stream,
      viewers: stream ? Number(stream.viewer_count || 0) : 0,
      followers,
      subs: null,
      liveTitle: stream ? stream.title : 'DJ FOLSOE',
      title: stream ? stream.title : 'DJ FOLSOE',
      category: stream ? stream.game_name : 'Music',
      startedAt: stream ? stream.started_at : null,
      checkedAt: new Date().toISOString()
    };
    TWITCH_CACHE = { at: now, data };
    return data;
  } catch (err) {
    const data = { ...fallback, ok: false, error: String(err && err.message ? err.message : err), checkedAt: new Date().toISOString() };
    TWITCH_CACHE = { at: now, data };
    return data;
  }
}

export default {
  async fetch(request, env, ctx) {
    try {
      if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS_HEADERS });
      const url = new URL(request.url);
      const path = cleanPath(url.pathname);

      if (path === '/' || path === '/api' || path === '/api/health' || path === '/api/health-check') {
        return json({ ok: true, ready: true, status: 'ok', worker: 'djfolsoe-tv-api', version: VERSION, checkedAt: new Date().toISOString(), hasKV: !!env.BROADCAST_CORE, message: 'Broadcast Core Engine is running.' });
      }

      if (path === '/api/twitch' || path === '/api/twitch-profile') {
        return json(await getTwitch(env));
      }

      if (path === '/api/broadcast' || path === '/api/broadcast-core' || path === '/api/unified-control' || path === '/api/website-portal' || path === '/api/overlay-hub' || path === '/api/homepage') {
        const stored = await getStoredCore(env);
        const twitch = await getTwitch(env);
        const core = mergeCore(stored, twitch);
        return json({ ok: true, version: VERSION, core, twitch, data: core, updatedAt: core.updatedAt });
      }

      if (path === '/api/publish' || path === '/api/save' || path === '/api/unified-control/publish') {
        if (request.method !== 'POST') return json({ ok: false, error: 'POST required', version: VERSION }, 405);
        if (!authOk(request, env)) return json({ ok: false, error: 'Unauthorized: ADMIN_TOKEN does not match', version: VERSION }, 401);
        const body = await readBody(request);
        const twitch = await getTwitch(env);
        const core = mergeCore(body.core || body.data || body, twitch);
        core.source = 'admin-publish';
        core.updatedAt = new Date().toISOString();
        MEMORY_CORE = core;
        MEMORY_UPDATED_AT = core.updatedAt;
        const savedToKV = await kvPut(env, core);
        return json({ ok: true, saved: true, savedToKV, savedInMemory: true, version: VERSION, updatedAt: core.updatedAt, core, data: core });
      }

      return json({ ok: false, status: 404, version: VERSION, path, message: 'Endpoint not found.' }, 404);
    } catch (err) {
      return json({ ok: false, status: 500, version: VERSION, error: String(err && err.message ? err.message : err), message: 'Worker caught an error and returned JSON instead of crashing.' }, 500);
    }
  }
};
