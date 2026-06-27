
const VERSION = "DJ FOLSOE NETWORK V813.8 STABLE REBASE HOME ADMIN";
const DEFAULT_CORE = {"version": "DJ FOLSOE NETWORK V813.8 STABLE REBASE HOME ADMIN", "activeTheme": "morning", "twitchChannel": "djfolsoe", "themes": {"fredagsbar": {"emoji": "🍺", "title": "FREDAGSBAR", "desc": "Weekend starts here", "primary": "#ffb000", "secondary": "#ff2f78", "accent": "#ffd166"}, "popup": {"emoji": "⚡", "title": "POPUP", "desc": "Når du mindst venter det", "primary": "#00d4ff", "secondary": "#ff00ea", "accent": "#ffffff"}, "trance": {"emoji": "💙", "title": "TRANCE TUESDAY", "desc": "Uplifting trance energy", "primary": "#00e5ff", "secondary": "#7b2fff", "accent": "#b8f7ff"}, "retro": {"emoji": "🕹️", "title": "RETRO HITS", "desc": "Klassikere der aldrig dør", "primary": "#ff2bd6", "secondary": "#7b2fff", "accent": "#ffd166"}, "eurodance": {"emoji": "💛", "title": "EURODANCE", "desc": "Big beats and big hooks", "primary": "#00f0ff", "secondary": "#005dff", "accent": "#ffe600"}, "morning": {"emoji": "☀️", "title": "GOOD MORNING TWITCH", "desc": "Kaffe, musik og god stemning", "primary": "#ffb000", "secondary": "#ff5a00", "accent": "#fff1a8"}, "summer": {"emoji": "🌴", "title": "SUMMER BEATS", "desc": "Summer 2026 beats", "primary": "#00f5d4", "secondary": "#ffb703", "accent": "#fff08a"}, "weekend": {"emoji": "🎉", "title": "WEEKEND VIBES", "desc": "Maximum music and community", "primary": "#ffd166", "secondary": "#ff4d6d", "accent": "#00d4ff"}}, "topTickerItems": [{"id": "top_morning", "active": true, "theme": "morning", "text": "☀️ GOOD MORNING TWITCH · Coffee, music and good vibes", "priority": 1}, {"id": "top_summer", "active": true, "theme": "summer", "text": "🌴 SUMMER BEATS · Summer 2026 · sunshine and bangers", "priority": 2}, {"id": "top_trance", "active": true, "theme": "trance", "text": "💙 TRANCE TUESDAY · Uplifting energy · goosebumps may occur", "priority": 3}, {"id": "top_fredagsbar", "active": true, "theme": "fredagsbar", "text": "🍺 FREDAGSBAR · Weekend starts here · live from Denmark", "priority": 4}], "bottomTickerItems": [{"id": "bottom1", "active": true, "theme": "all", "text": "TOP20 · REQUESTS · DJ NETWORK · NEWS · COMMUNITY · DJ FOLSOE Broadcast Cloud", "priority": 1}, {"id": "bottom2", "active": true, "theme": "all", "text": "FOLLOW DJ FOLSOE · BE ACTIVE IN CHAT · REQUEST YOUR SONG · SHARE THE LOVE", "priority": 2}], "homepageNews": [{"id": "news1", "active": true, "type": "Seneste show", "title": "Fredagsbar – Tak for en fantastisk aften!", "body": "Se highlights, requests og moments fra seneste show.", "theme": "all", "priority": 1}, {"id": "news2", "active": true, "type": "Top 20 nyt", "title": "Ny Top 20 ude nu", "body": "Se denne uges største hits på FOLSOE Top 20.", "theme": "all", "priority": 2}, {"id": "news3", "active": true, "type": "Request info", "title": "Husk dine requests", "body": "Brug !ønske / !request / !Wunsch i chatten.", "theme": "all", "priority": 3}, {"id": "news4", "active": true, "type": "Community news", "title": "Fællesskabet vokser", "body": "Chat, emotes, follows og god stemning hver stream.", "theme": "all", "priority": 4}], "shows": [{"key": "trance", "title": "Trance Tuesday", "time": "Tirsdag 18:30", "body": "Uplifting trance, emotion and big melodies."}, {"key": "top20", "title": "FOLSOE Top 20", "time": "Torsdag 18:30", "body": "Weekly listening chart and countdown show."}, {"key": "fredagsbar", "title": "Fredagsbar", "time": "1. fredag hver måned 20:00", "body": "Weekend energy, party tracks and community."}, {"key": "retro", "title": "Retro Hits", "time": "Søndag 20:00", "body": "Classic tracks, nostalgia and singalong moments."}, {"key": "morning", "title": "Good Morning Twitch", "time": "Hver dag 07:00", "body": "Coffee, music and the best start of the day."}, {"key": "popup", "title": "PopUp", "time": "Surprise!", "body": "Surprise streams when you least expect it."}], "top20": [{"rank": 1, "artist": "Axwell & Bonn", "title": "Whatever Turns You On", "genre": "Dance", "points": 92}, {"rank": 2, "artist": "Hugel, David Guetta", "title": "Shine", "genre": "Dance", "points": 90}, {"rank": 3, "artist": "Calvin Harris", "title": "Satisfy", "genre": "Dance", "points": 88}, {"rank": 4, "artist": "Rune Rask, Hampenberg, The Minds of 99", "title": "Under Din Sne", "genre": "Bootleg Remix", "points": 87}, {"rank": 5, "artist": "Svenstrup & Vendelboe x DJ Encore", "title": "Udødelige", "genre": "Dance", "points": 86}, {"rank": 6, "artist": "Armin Van Buuren", "title": "Dream A Little Dream", "genre": "Trance", "points": 85}], "profile": {"name": "DJ FOLSOE", "fallbackAvatar": "", "description": "DJ FOLSOE er en dansk musikstreamer på Twitch med live DJ-shows, musikønsker, Top 20, fællesskab og dansk DJ-kultur.", "mods": [{"name": "Mod Master", "role": "Chat Safety"}, {"name": "Vibe Guardian", "role": "Community"}, {"name": "Request Helper", "role": "Requests"}, {"name": "DJ Support", "role": "Tech & Support"}, {"name": "Good Vibes", "role": "Positivity"}], "genres": ["Trance", "Eurodance", "Retro", "EDM", "Pop", "Nu-Disco"]}};

function cors() {
  return {
    "access-control-allow-origin":"*",
    "access-control-allow-methods":"GET,POST,OPTIONS",
    "access-control-allow-headers":"content-type,x-admin-token,authorization",
    "cache-control":"no-store"
  };
}
function json(data,status=200) {
  return new Response(JSON.stringify(data,null,2), {status,headers:{"content-type":"application/json; charset=utf-8",...cors()}});
}
function adminOk(request, env) {
  const t = request.headers.get("x-admin-token") || (request.headers.get("authorization")||"").replace(/^Bearer\s+/i,"");
  return !!env.ADMIN_TOKEN && t === env.ADMIN_TOKEN;
}
async function getCore(env) {
  let saved = null;
  try {
    if (env.DJF_DATA && env.DJF_DATA.get) saved = await env.DJF_DATA.get("broadcast-core","json");
  } catch(e) {}
  return Object.assign({}, DEFAULT_CORE, saved || {}, {themes: Object.assign({}, DEFAULT_CORE.themes, (saved&&saved.themes)||{})});
}
async function putCore(env, core) {
  core.version = VERSION;
  core.updatedAt = new Date().toISOString();
  if (env.DJF_DATA && env.DJF_DATA.put) await env.DJF_DATA.put("broadcast-core", JSON.stringify(core));
  return core;
}
function activeTheme(core) {
  return String(core.activeTheme || core.themeEngine?.activeTheme || "morning").toLowerCase();
}
function themePayload(core) {
  const key = activeTheme(core);
  const t = core.themes?.[key] || DEFAULT_CORE.themes[key] || DEFAULT_CORE.themes.morning;
  return {activeTheme:key, theme:{key, ...t}};
}
function sortItems(items) {
  return (Array.isArray(items)?items:[]).filter(x=>x&&x.active!==false).sort((a,b)=>Number(a.priority||99)-Number(b.priority||99));
}
function topTicker(core) {
  const key = activeTheme(core);
  const items = sortItems(core.topTickerItems).filter(x=>String(x.theme||"").toLowerCase()===key);
  const t = themePayload(core).theme;
  return items.length ? items.map(x=>x.text).filter(Boolean) : [`${t.emoji} ${t.title} · ${t.desc}`];
}
function bottomTicker(core) {
  const key = activeTheme(core);
  const items = sortItems(core.bottomTickerItems).filter(x=>!x.theme||x.theme==="all"||String(x.theme).toLowerCase()===key);
  return items.length ? items.map(x=>x.text).filter(Boolean) : ["TOP20 · REQUESTS · DJ NETWORK · NEWS · COMMUNITY"];
}
async function twitchProfile(env, core) {
  const login = String(core.twitchChannel || env.TWITCH_CHANNEL || "djfolsoe").toLowerCase();
  const fallback = {
    ok:false, login, displayName:"DJ FOLSOE", avatar:core.profile?.fallbackAvatar||"",
    description:core.profile?.description || DEFAULT_CORE.profile.description, isLive:false, viewers:0, viewCount:0, game:"Music"
  };
  try {
    if (!env.TWITCH_CLIENT_ID || !env.TWITCH_ACCESS_TOKEN) return fallback;
    const token = String(env.TWITCH_ACCESS_TOKEN).startsWith("Bearer ") ? String(env.TWITCH_ACCESS_TOKEN).slice(7) : env.TWITCH_ACCESS_TOKEN;
    const headers = {"Client-ID":env.TWITCH_CLIENT_ID,"Authorization":"Bearer "+token};
    const uRes = await fetch("https://api.twitch.tv/helix/users?login="+encodeURIComponent(login), {headers});
    const uJson = await uRes.json();
    const u = uJson?.data?.[0];
    if (!u) return fallback;
    let stream = null;
    try {
      const sRes = await fetch("https://api.twitch.tv/helix/streams?user_login="+encodeURIComponent(login), {headers});
      stream = (await sRes.json())?.data?.[0] || null;
    } catch(e) {}
    return {
      ok:true, login, id:u.id, displayName:u.display_name||"DJ FOLSOE", avatar:u.profile_image_url||"",
      description:u.description||fallback.description, viewCount:u.view_count||0,
      isLive:!!stream, viewers:stream?.viewer_count||0, game:stream?.game_name||"Music", liveTitle:stream?.title||""
    };
  } catch(e) {
    return {...fallback,error:e.message||"Twitch error"};
  }
}
async function buildHomepage(env, core) {
  const tw = await twitchProfile(env, core);
  return {
    ok:true, version:VERSION, twitch:tw, theme:themePayload(core), profile:core.profile,
    shows: core.shows || DEFAULT_CORE.shows,
    newsCards: sortItems(core.homepageNews || DEFAULT_CORE.homepageNews),
    top20: core.top20 || DEFAULT_CORE.top20,
    topTickerItems: core.topTickerItems || [],
    bottomTickerItems: core.bottomTickerItems || [],
    mods: core.profile?.mods || DEFAULT_CORE.profile.mods
  };
}
function overlayState(core) {
  const theme = themePayload(core);
  return {
    ok:true, version:VERSION, theme, visual:{primary:theme.theme.primary,secondary:theme.theme.secondary,accent:theme.theme.accent,title:theme.theme.title,emoji:theme.theme.emoji,mood:theme.theme.desc},
    topbarNews: topTicker(core), footerTicker: bottomTicker(core),
    chart:{items:core.top20||DEFAULT_CORE.top20},
    show:{title:theme.theme.title,description:theme.theme.desc},
    live:{followers:870,followersGoal:1000,viewers:0},
    twitchChat:{channel:core.twitchChannel||"djfolsoe"}
  };
}
export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response("",{headers:cors()});
    const url = new URL(request.url);
    const path = url.pathname;
    try {
      const core = await getCore(env);
      if (path === "/" || path === "/api") return json({ok:true,version:VERSION});
      if (path === "/api/core") {
        if (request.method === "GET") return json(core);
        if (!adminOk(request,env)) return json({error:"Unauthorized"},401);
        const body = await request.json();
        return json({ok:true,core:await putCore(env,Object.assign(core,body))});
      }
      if (path === "/api/theme") {
        if (request.method === "GET") return json(themePayload(core));
        if (!adminOk(request,env)) return json({error:"Unauthorized"},401);
        const body = await request.json();
        const key = String(body.theme || body.activeTheme || "").toLowerCase();
        if (!core.themes?.[key]) return json({error:"Unknown theme", key},400);
        core.activeTheme = key;
        core.themeEngine = {activeTheme:key};
        await putCore(env,core);
        return json({ok:true,...themePayload(core),overlay:overlayState(core)});
      }
      if (path === "/api/overlay/v170-state") return json(overlayState(core));
      if (path === "/api/homepage" || path === "/api/site") return json(await buildHomepage(env, core));
      if (path === "/api/twitch-profile") return json(await twitchProfile(env, core));
      if (path === "/api/chat-profile") {
        const login = url.searchParams.get("login") || core.twitchChannel || "djfolsoe";
        return json(await twitchProfile(env, {...core,twitchChannel:login}));
      }
      if (path === "/api/theme-ticker-top") {
        if (request.method === "GET") return json({ok:true,items:core.topTickerItems||[],active:topTicker(core)});
        if (!adminOk(request,env)) return json({error:"Unauthorized"},401);
        const body = await request.json(); core.topTickerItems = Array.isArray(body.items)?body.items:[];
        await putCore(env,core); return json({ok:true,items:core.topTickerItems,active:topTicker(core)});
      }
      if (path === "/api/bottom-ticker") {
        if (request.method === "GET") return json({ok:true,items:core.bottomTickerItems||[],active:bottomTicker(core)});
        if (!adminOk(request,env)) return json({error:"Unauthorized"},401);
        const body = await request.json(); core.bottomTickerItems = Array.isArray(body.items)?body.items:[];
        await putCore(env,core); return json({ok:true,items:core.bottomTickerItems,active:bottomTicker(core)});
      }
      if (path === "/api/homepage-news") {
        if (request.method === "GET") return json({ok:true,items:core.homepageNews||[]});
        if (!adminOk(request,env)) return json({error:"Unauthorized"},401);
        const body = await request.json(); core.homepageNews = Array.isArray(body.items)?body.items:[];
        await putCore(env,core); return json({ok:true,items:core.homepageNews});
      }
      if (path === "/api/shows") {
        if (request.method === "GET") return json({ok:true,items:core.shows||[]});
        if (!adminOk(request,env)) return json({error:"Unauthorized"},401);
        const body = await request.json(); core.shows = Array.isArray(body.items)?body.items:[];
        await putCore(env,core); return json({ok:true,items:core.shows});
      }
      return json({error:"Not found",path},404);
    } catch(e) {
      return json({error:e.message||"worker error", stack:String(e.stack||"")},500);
    }
  }
}
