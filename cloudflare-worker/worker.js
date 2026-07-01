/* DJ FOLSOE NETWORK V925 · DIRECT THEME SWITCH PANIC FIX
   Uses the existing Cloudflare KV binding name: DJF_DATA
   Endpoints:
   GET  /api/health
   GET  /api/broadcast
   GET  /api/broadcast-jsonp?callback=...
   POST /api/publish
   GET  /api/twitch
*/

const VERSION = 'V925 Direct Theme Switch Panic Fix';
const SCHEMA = 'broadcast-core/v2-clean';
const CORE_KEY = 'broadcast-core:live';

const THEME_PRESETS = {
  weekend: { id:'weekend', title:'Weekend', background:'themes/weekend.png' },
  trance: { id:'trance', title:'Trance Tuesday', background:'themes/trance.png' },
  fredagsbar: { id:'fredagsbar', title:'Fredagsbar', background:'themes/fredagsbar.png' },
  eurodance: { id:'eurodance', title:'Eurodance', background:'themes/eurodance.png' },
  retro: { id:'retro', title:'Retro Hits', background:'themes/retro.png' },
  popup: { id:'popup', title:'Pop Up Live', background:'themes/popup.png' },
  morning: { id:'morning', title:'Good Morning Twitch', background:'themes/morning.png' },
  summer: { id:'summer', title:'Summer', background:'themes/summer.png' },
  danske: { id:'danske', title:'Danish Hits', background:'themes/danske.png' },
  top20: { id:'top20', title:'FOLSOE TOP 20', background:'themes/top20.png' }
};
function normalizeThemeId(value){
  const key = String(value||'').toLowerCase().trim().replace(/\s+/g,'').replace(/_/g,'-');
  const aliases = { friday:'fredagsbar', fredag:'fredagsbar', danish:'danske', dansk:'danske', chart:'top20', folsoetop20:'top20', goodmorning:'morning' };
  return aliases[key] || key || 'weekend';
}
function applyThemePreset(core, themeValue){
  const id = normalizeThemeId(themeValue);
  const preset = THEME_PRESETS[id] || THEME_PRESETS.weekend;
  const now = new Date().toISOString();
  core.theme = { ...(core.theme||{}), ...preset };
  core.show = { ...(core.show||{}), current: core.show?.current || 'DJ FOLSOE', title: core.show?.title || 'DJ FOLSOE' };
  core.overlay = { ...(core.overlay||{}), status: core.show?.mode || core.show?.state || core.overlay?.status || 'OFFLINE' };
  core.updatedAt = now;
  core.source = 'direct-theme-switch';
  core.version = VERSION;
  core.schema = SCHEMA;
  core.debug = { ...(core.debug||{}), lastThemeSwitch: { theme: preset.id, title: preset.title, at: now, endpoint: '/api/set-theme' } };
  return core;
}


const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Token, x-admin-token, Cache-Control, Pragma',
  'Access-Control-Max-Age': '86400'
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
    }
  });
}

function js(data, callback = 'callback') {
  const safeCallback = String(callback || 'callback').replace(/[^a-zA-Z0-9_.$]/g, '') || 'callback';
  return new Response(`${safeCallback}(${JSON.stringify(data)});`, {
    status: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
    }
  });
}

function getKV(env) {
  return env.DJF_DATA || env.BROADCAST_CORE || env.broadcast_core || null;
}

function defaultCore(twitch = {}) {
  const now = new Date().toISOString();
  const followers = Number(twitch.followers ?? 869) || 869;
  return {
    ok: true,
    version: VERSION,
    schema: SCHEMA,
    source: 'worker-default',
    updatedAt: now,
    twitch: {
      ok: twitch.ok !== false,
      source: twitch.source || 'default',
      channel: twitch.channel || 'djfolsoe',
      displayName: twitch.displayName || 'DJFolsoe',
      userId: twitch.userId || '756562979',
      profileImage: twitch.profileImage || 'https://static-cdn.jtvnw.net/jtv_user_pictures/b759d05a-f6ea-41e5-b9e0-f834ad3d0eb3-profile_image-300x300.png',
      isLive: !!(twitch.isLive || twitch.live),
      live: !!(twitch.isLive || twitch.live),
      viewers: Number(twitch.viewers || 0),
      followers,
      subs: twitch.subs ?? null,
      liveTitle: twitch.liveTitle || twitch.title || 'DJ FOLSOE',
      title: twitch.title || twitch.liveTitle || 'DJ FOLSOE',
      category: twitch.category || 'Music',
      startedAt: twitch.startedAt || null,
      checkedAt: twitch.checkedAt || now
    },
    show: {
      current: 'DJ FOLSOE',
      title: 'DJ FOLSOE',
      mode: twitch.live ? 'LIVE' : 'OFFLINE',
      state: twitch.live ? 'LIVE' : 'OFFLINE',
      live: !!twitch.live,
      viewers: Number(twitch.viewers || 0),
      streamTitle: twitch.title || 'DJ FOLSOE'
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
    theme: { id: 'weekend', title: 'Weekend', background: 'themes/weekend.png' },
    hero: {
      eyebrow: 'DJ FOLSOE TWITCH · MUSIC STREAMER FROM DENMARK',
      title: 'DJ FOLSOE',
      subtitle: 'Dive into my Twitch world',
      text: 'Live DJ shows, song requests, Top 20 countdowns and community energy from Denmark.'
    },
    community: {
      followers,
      followerGoal: 1000,
      subs: 0,
      subGoal: 100,
      text: 'Live DJ shows, song requests, Top 20 countdowns and community energy from Denmark.',
      requestText: 'Use !request Artist - Title in Twitch chat',
      specialEvent: ''
    },
    ticker: {
      text: 'DJ FOLSOE TWITCH · MUSIC STREAMER FROM DENMARK · REQUEST A SONG · TOP 20 · LIVE COMMUNITY',
      items: []
    },
    overlay: {
      title: 'DJ FOLSOE',
      status: twitch.live ? 'LIVE' : 'OFFLINE',
      infoLine: 'DJ FOLSOE TWITCH · MUSIC STREAMER FROM DENMARK · REQUEST A SONG · TOP 20 · LIVE COMMUNITY',
      requestText: 'Use !request Artist - Title in Twitch chat',
      specialEvent: '',
      subGoal: 100
    },
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
    ]
  };
}

function mergeCore(input, twitch) {
  const base = defaultCore(twitch);
  const incoming = input && typeof input === 'object' ? (input.core || input.data || input.broadcastCore || input) : {};
  const merged = {
    ...base,
    ...incoming,
    version: VERSION,
    schema: SCHEMA,
    source: 'admin-publish',
    updatedAt: new Date().toISOString(),
    twitch: { ...base.twitch, ...(incoming.twitch || twitch || {}) },
    show: { ...base.show, ...(incoming.show || {}) },
    nextShow: { ...base.nextShow, ...(incoming.nextShow || {}) },
    theme: { ...base.theme, ...(incoming.theme || {}) },
    hero: { ...base.hero, ...(incoming.hero || {}) },
    community: { ...base.community, ...(incoming.community || {}) },
    ticker: { ...base.ticker, ...(incoming.ticker || {}) },
    overlay: { ...base.overlay, ...(incoming.overlay || {}) },
    top20: Array.isArray(incoming.top20) ? incoming.top20 : base.top20,
    featuredShows: Array.isArray(incoming.featuredShows) ? incoming.featuredShows : base.featuredShows
  };
  const followers = Number(merged.twitch.followers ?? merged.community.followers ?? 0) || 0;
  merged.community.followers = followers;
  merged.show.viewers = Number(merged.twitch.viewers ?? merged.show.viewers ?? 0) || 0;
  merged.show.live = !!(merged.twitch.live || merged.twitch.isLive || merged.show.live);
  merged.show.mode = merged.show.mode || (merged.show.live ? 'LIVE' : 'OFFLINE');
  merged.show.state = merged.show.state || merged.show.mode;
  merged.overlay.status = merged.overlay.status || merged.show.mode;
  return merged;
}

async function fetchTwitch(env) {
  const channel = env.TWITCH_CHANNEL || 'djfolsoe';
  const clientId = env.TWITCH_CLIENT_ID;
  const token = env.TWITCH_ACCESS_TOKEN;
  const now = new Date().toISOString();
  if (!clientId || !token) {
    return { ok: false, source: 'missing-token', channel, live: false, isLive: false, viewers: 0, followers: 869, checkedAt: now };
  }
  const headers = { 'Client-ID': clientId, 'Authorization': `Bearer ${token}` };
  try {
    const userRes = await fetch(`https://api.twitch.tv/helix/users?login=${encodeURIComponent(channel)}`, { headers });
    const userJson = await userRes.json();
    const user = userJson.data && userJson.data[0];
    const userId = user?.id || '756562979';

    let live = false, viewers = 0, title = user?.display_name || 'DJFolsoe', category = 'Music', startedAt = null;
    const streamRes = await fetch(`https://api.twitch.tv/helix/streams?user_id=${encodeURIComponent(userId)}`, { headers });
    const streamJson = await streamRes.json();
    const stream = streamJson.data && streamJson.data[0];
    if (stream) {
      live = true;
      viewers = Number(stream.viewer_count || 0);
      title = stream.title || title;
      category = stream.game_name || category;
      startedAt = stream.started_at || null;
    }

    let followers = 869;
    try {
      const followRes = await fetch(`https://api.twitch.tv/helix/channels/followers?broadcaster_id=${encodeURIComponent(userId)}&first=1`, { headers });
      const followJson = await followRes.json();
      followers = Number(followJson.total ?? followers) || followers;
    } catch (_) {}

    return {
      ok: true,
      source: 'twitch-api',
      channel,
      displayName: user?.display_name || 'DJFolsoe',
      userId,
      profileImage: user?.profile_image_url || 'https://static-cdn.jtvnw.net/jtv_user_pictures/b759d05a-f6ea-41e5-b9e0-f834ad3d0eb3-profile_image-300x300.png',
      isLive: live,
      live,
      viewers,
      followers,
      subs: null,
      liveTitle: title,
      title,
      category,
      startedAt,
      checkedAt: now
    };
  } catch (e) {
    return { ok: false, source: 'twitch-error', error: String(e.message || e), channel, live: false, isLive: false, viewers: 0, followers: 869, checkedAt: now };
  }
}

async function readCore(env) {
  const kv = getKV(env);
  const twitch = await fetchTwitch(env);
  if (kv) {
    try {
      const stored = await kv.get(CORE_KEY, 'json');
      if (stored) return mergeCore(stored, twitch);
    } catch (e) {
      return mergeCore({ source: 'kv-read-error', error: String(e.message || e) }, twitch);
    }
  }
  return mergeCore(defaultCore(twitch), twitch);
}

async function writeCore(env, core) {
  const kv = getKV(env);
  if (!kv) return { ok: false, storage: 'memory-default', persistent: false, warning: 'KV binding not found. Expected DJF_DATA or BROADCAST_CORE.' };
  await kv.put(CORE_KEY, JSON.stringify(core));
  return { ok: true, storage: 'cloudflare-kv', binding: env.DJF_DATA ? 'DJF_DATA' : 'BROADCAST_CORE', persistent: true };
}

function compatibility(core) {
  return {
    ok: true,
    version: VERSION,
    schema: SCHEMA,
    storage: 'cloudflare-kv',
    persistent: true,
    core,
    data: core,
    twitch: core.twitch,
    broadcast: {
      version: VERSION,
      mode: core.show?.mode || 'OFFLINE',
      broadcastState: core.show?.state || core.show?.mode || 'OFFLINE',
      activeShow: core.show?.current || core.show?.title || 'DJ FOLSOE',
      activeShowTitle: core.show?.title || 'DJ FOLSOE',
      activeTheme: core.theme?.id || 'weekend',
      live: !!core.show?.live,
      viewers: core.show?.viewers || 0,
      followers: core.community?.followers || core.twitch?.followers || 0,
      streamTitle: core.show?.streamTitle || core.twitch?.title || 'DJ FOLSOE',
      updatedAt: core.updatedAt
    },
    homepage: {
      version: VERSION,
      hero: { ...(core.hero || {}), background: core.theme?.background || 'themes/weekend.png' },
      ticker: [core.ticker?.text || ''],
      nextShow: core.nextShow,
      sectionTitles: { nextKicker: 'NEXT SHOW', nextTitle: 'Next DJ FOLSOE Broadcast', showsKicker: 'FEATURED SHOWS', showsTitle: 'Your favorite show', aboutKicker: 'DISCOVER DJ FOLSOE', aboutTitle: 'Music TV, Twitch and Danish DJ energy' },
      featuredShows: core.featuredShows || [],
      aboutText: core.community?.text || core.hero?.text || '',
      top20: core.top20 || []
    },
    website: { title: core.hero?.title || 'DJ FOLSOE', description: core.hero?.text || '', primaryLanguage: 'en' },
    overlayHub: {
      version: VERSION,
      state: core.show?.state || 'OFFLINE',
      activeShow: core.show?.title || 'DJ FOLSOE',
      activeTheme: core.theme?.id || 'weekend',
      ticker: core.ticker?.text || '',
      controlPanel: {
        title: core.overlay?.title || core.show?.title || 'DJ FOLSOE',
        status: core.overlay?.status || core.show?.mode || 'OFFLINE',
        theme: core.theme?.id || 'weekend',
        viewers: core.show?.viewers || core.twitch?.viewers || 0,
        followers: core.community?.followers || core.twitch?.followers || 0,
        subs: core.community?.subs || 0,
        subGoal: core.community?.subGoal || core.overlay?.subGoal || 100,
        nextShow: core.nextShow,
        infoLine: core.overlay?.infoLine || core.ticker?.text || '',
        requestText: core.overlay?.requestText || core.community?.requestText || '',
        specialEvent: core.overlay?.specialEvent || core.community?.specialEvent || ''
      },
      updatedAt: core.updatedAt
    },
    overlay: {
      version: VERSION,
      state: core.show?.state || 'OFFLINE',
      activeShow: core.show?.title || 'DJ FOLSOE',
      activeTheme: core.theme?.id || 'weekend',
      ticker: core.ticker?.text || '',
      controlPanel: {
        title: core.overlay?.title || core.show?.title || 'DJ FOLSOE',
        status: core.overlay?.status || core.show?.mode || 'OFFLINE',
        theme: core.theme?.id || 'weekend',
        viewers: core.show?.viewers || core.twitch?.viewers || 0,
        followers: core.community?.followers || core.twitch?.followers || 0,
        subs: core.community?.subs || 0,
        subGoal: core.community?.subGoal || core.overlay?.subGoal || 100,
        nextShow: core.nextShow,
        infoLine: core.overlay?.infoLine || core.ticker?.text || '',
        requestText: core.overlay?.requestText || core.community?.requestText || '',
        specialEvent: core.overlay?.specialEvent || core.community?.specialEvent || ''
      },
      updatedAt: core.updatedAt
    },
    updatedAt: core.updatedAt
  };
}

async function handle(request, env) {
  const url = new URL(request.url);
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders });

  if (url.pathname === '/api/health' || url.pathname === '/health') {
    const kv = getKV(env);
    return json({
      ok: true,
      version: VERSION,
      schema: SCHEMA,
      worker: 'djfolsoe-tv-api',
      storage: kv ? 'cloudflare-kv' : 'memory-default',
      binding: env.DJF_DATA ? 'DJF_DATA' : (env.BROADCAST_CORE ? 'BROADCAST_CORE' : null),
      persistent: !!kv,
      endpoints: ['/api/health','/api/broadcast','/api/publish','/api/twitch','/api/broadcast-jsonp'],
      checkedAt: new Date().toISOString()
    });
  }

  if (url.pathname === '/api/twitch') return json(await fetchTwitch(env));

  if (url.pathname === '/api/set-theme' || url.pathname === '/api/force-theme' || url.pathname === '/api/theme') {
    let body = {};
    if (request.method === 'POST') { try { body = await request.json(); } catch (_) {} }
    const requestedTheme = url.searchParams.get('theme') || url.searchParams.get('id') || body.theme || body.id || 'weekend';
    const current = await readCore(env);
    const core = applyThemePreset(current, requestedTheme);
    const saved = await writeCore(env, core);
    return json({ ok:true, version:VERSION, action:'set-theme', theme:core.theme, saved, core, data:core, compatibility: compatibility(core), updatedAt:core.updatedAt });
  }


  if (url.pathname === '/api/broadcast' || url.pathname === '/api/broadcast-core') {
    const core = await readCore(env);
    return json(compatibility(core));
  }

  if (url.pathname === '/api/broadcast-jsonp') {
    const core = await readCore(env);
    return js(compatibility(core), url.searchParams.get('callback') || 'callback');
  }

  if (url.pathname === '/api/publish' && request.method === 'POST') {
    let body = {};
    try { body = await request.json(); } catch (_) {}
    const twitch = await fetchTwitch(env);
    const core = mergeCore(body, twitch);
    const saved = await writeCore(env, core);
    return json({ ok: true, version: VERSION, saved, core, data: core, updatedAt: core.updatedAt });
  }

  return json({ ok: false, version: VERSION, error: 'Not found', path: url.pathname }, 404);
}

export default {
  async fetch(request, env, ctx) {
    try { return await handle(request, env || {}); }
    catch (e) { return json({ ok: false, version: VERSION, error: String(e.message || e), stack: String(e.stack || '') }, 500); }
  }
};
