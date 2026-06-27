
const VERSION = "DJ FOLSOE NETWORK V816.1 OVERLAY FIX ONLY"; // V816.1 overlay fix marker
const DEFAULT_CORE = {"version": "DJ FOLSOE NETWORK V816 BROADCAST OS", "activeTheme": "weekend", "language": "da", "twitchChannel": "djfolsoe", "themes": {"fredagsbar": {"emoji": "🍺", "title": "FREDAGSBAR", "desc": "Weekend starts here · live from Denmark", "primary": "#ffb000", "secondary": "#ff2f78", "accent": "#ffd166", "bg": "linear-gradient(135deg,#341007,#22051e)"}, "popup": {"emoji": "⚡", "title": "POPUP", "desc": "You never know when DJ FOLSOE goes live", "primary": "#00d4ff", "secondary": "#ff00ea", "accent": "#ffffff", "bg": "linear-gradient(135deg,#061c2a,#2b0631)"}, "trance": {"emoji": "💙", "title": "TRANCE TUESDAY", "desc": "Uplifting energy · goosebumps may occur", "primary": "#00e5ff", "secondary": "#7b2fff", "accent": "#b8f7ff", "bg": "linear-gradient(135deg,#031525,#170935)"}, "retro": {"emoji": "🕹️", "title": "RETRO HITS", "desc": "Classics that refuse to retire", "primary": "#ff2bd6", "secondary": "#7b2fff", "accent": "#ffd166", "bg": "linear-gradient(135deg,#230821,#15112a)"}, "eurodance": {"emoji": "💛", "title": "EURODANCE", "desc": "Big beats · big hooks · 90s/00s survived", "primary": "#00f0ff", "secondary": "#005dff", "accent": "#ffe600", "bg": "linear-gradient(135deg,#031b2a,#081d52)"}, "morning": {"emoji": "☀️", "title": "GOOD MORNING TWITCH", "desc": "Coffee, music and good vibes", "primary": "#ffb000", "secondary": "#ff5a00", "accent": "#fff1a8", "bg": "linear-gradient(135deg,#2b1300,#1c1021)"}, "summer": {"emoji": "🌴", "title": "SUMMER BEATS", "desc": "Summer 2026 · sunshine and bangers", "primary": "#00f5d4", "secondary": "#ffb703", "accent": "#fff08a", "bg": "linear-gradient(135deg,#052b2a,#372105)"}, "weekend": {"emoji": "🎉", "title": "WEEKEND VIBES", "desc": "Maximum music and community", "primary": "#ffd166", "secondary": "#ff4d6d", "accent": "#00d4ff", "bg": "linear-gradient(135deg,#23102c,#061b2b)"}}, "station": {"followers": 870, "followersGoal": 1000, "subs": 0, "viewers": 0, "category": "Music"}, "profile": {"name": "DJ FOLSOE", "fallbackAvatar": "", "description": "DJ FOLSOE er en dansk musikstreamer på Twitch med live DJ-shows, musikønsker, Top 20, fællesskab og dansk DJ-kultur.", "genres": ["Trance", "Eurodance", "Retro", "EDM", "Pop", "Nu-Disco"], "mods": [{"name": "Mod Master", "role": "Chat Safety"}, {"name": "Vibe Guardian", "role": "Community"}, {"name": "Request Helper", "role": "Requests"}, {"name": "DJ Support", "role": "Tech & Support"}, {"name": "Good Vibes", "role": "Positivity"}]}, "shows": [{"key": "trance", "title": "Trance Tuesday", "time": "Tirsdag 18:30", "body": "Uplifting trance, emotion and big melodies."}, {"key": "top20", "title": "FOLSOE Top 20", "time": "Torsdag 18:30", "body": "Weekly listening chart and countdown show."}, {"key": "fredagsbar", "title": "Fredagsbar", "time": "1. fredag hver måned 20:00", "body": "Weekend energy, party tracks and community."}, {"key": "retro", "title": "Retro Hits", "time": "Søndag 20:00", "body": "Classic tracks, nostalgia and singalong moments."}, {"key": "morning", "title": "Good Morning Twitch", "time": "Hver dag 07:00", "body": "Coffee, music and the best start of the day."}, {"key": "popup", "title": "PopUp", "time": "Surprise!", "body": "Surprise streams when you least expect it."}], "homepageNews": [{"id": "news1", "active": true, "type": "Seneste show", "title": "Fredagsbar – Tak for en fantastisk aften!", "body": "Se highlights, requests og moments fra seneste show.", "theme": "all", "priority": 1}, {"id": "news2", "active": true, "type": "Top 20 nyt", "title": "Ny Top 20 ude nu", "body": "Se denne uges største hits på FOLSOE Top 20.", "theme": "all", "priority": 2}, {"id": "news3", "active": true, "type": "Request info", "title": "Husk dine requests", "body": "Brug !ønske / !request / !Wunsch i chatten.", "theme": "all", "priority": 3}, {"id": "news4", "active": true, "type": "Community news", "title": "Fællesskabet vokser", "body": "Chat, emotes, follows og god stemning hver stream.", "theme": "all", "priority": 4}, {"id": "news5", "active": true, "type": "DJ Network", "title": "Danske DJs live nu", "body": "Se hvem der er live og find næste raid target.", "theme": "all", "priority": 5}, {"id": "news6", "active": true, "type": "Twitch updates", "title": "Nye emotes unlocked", "body": "Tjek de nye emotes og brug dem i chatten.", "theme": "all", "priority": 6}], "topTickerItems": [{"id": "top_weekend", "active": true, "theme": "weekend", "text": "🎉 WEEKEND VIBES · Broadcast Cloud", "priority": 1}, {"id": "top_morning", "active": true, "theme": "morning", "text": "☀️ GOOD MORNING TWITCH · Coffee, music and good vibes", "priority": 2}, {"id": "top_summer", "active": true, "theme": "summer", "text": "🌴 SUMMER BEATS · Summer 2026 · sunshine and bangers", "priority": 3}, {"id": "top_trance", "active": true, "theme": "trance", "text": "💙 TRANCE TUESDAY · Uplifting energy", "priority": 4}], "bottomTickerItems": [{"id": "bottom1", "active": true, "theme": "all", "text": "TOP20 · REQUESTS · DJ NETWORK · NEWS · COMMUNITY · DJ FOLSOE Broadcast Cloud", "priority": 1}, {"id": "bottom2", "active": true, "theme": "all", "text": "FOLLOW DJ FOLSOE · BE ACTIVE IN CHAT · REQUEST YOUR SONG · SHARE THE LOVE", "priority": 2}], "top20": [{"rank": 1, "artist": "Axwell & Bonn", "title": "Whatever Turns You On", "genre": "Dance", "points": 92}, {"rank": 2, "artist": "Hugel, David Guetta", "title": "Shine", "genre": "Dance", "points": 90}, {"rank": 3, "artist": "Calvin Harris", "title": "Satisfy", "genre": "Dance", "points": 88}, {"rank": 4, "artist": "Rune Rask, Hampenberg, The Minds of 99", "title": "Under Din Sne", "genre": "Bootleg Remix", "points": 87}, {"rank": 5, "artist": "Svenstrup & Vendelboe x DJ Encore", "title": "Udødelige", "genre": "Dance", "points": 86}, {"rank": 6, "artist": "Armin Van Buuren", "title": "Dream A Little Dream", "genre": "Trance", "points": 85}, {"rank": 7, "artist": "Lost Frequencies", "title": "Live It All", "genre": "Dance Pop", "points": 84}, {"rank": 8, "artist": "David Guetta, Alok", "title": "Run Run River", "genre": "Progressive EDM", "points": 83}, {"rank": 9, "artist": "Anyma", "title": "Bad Angel", "genre": "Melodic Techno", "points": 82}, {"rank": 10, "artist": "Bebe Rexha", "title": "New Religion", "genre": "Pop Dance", "points": 81}]};
const I18N = {"da": {"nav.home": "Forside", "nav.shows": "Shows", "nav.top20": "Top 20", "nav.news": "Nyheder", "nav.community": "Community", "nav.network": "DJ Network", "nav.about": "Om mig", "hero.subtitle": "Music TV fra Danmark", "hero.cta.twitch": "Se mig live på Twitch", "hero.cta.follow": "Følg mig", "hero.live": "Live på Twitch", "hero.offline": "Offline lige nu", "chat.title": "Live chat", "chat.open": "Åbn chat på Twitch", "about.title": "Hvem er DJ FOLSOE?", "about.body": "DJ FOLSOE samler musik, chat, requests og dansk DJ-kultur i et levende broadcast-univers. Kanalen blander radioenergi, TV-grafik og fællesskab på Twitch.", "shows.title": "Shows", "shows.all": "Se alle shows →", "news.title": "Nyheder & opdateringer", "news.all": "Se alle nyheder →", "top20.title": "FOLSOE Top 20", "top20.full": "Se hele listen →", "top20.button": "Se hele Top 20", "community.title": "Fællesskab & stats", "mods.title": "Mod-teamet", "mods.body": "Vores mods holder chatten god, hjælper nye seere og skaber den trygge stemning omkring streamen.", "cta.title": "Klar til næste show?", "cta.body": "Følg kanalen på Twitch, så du aldrig går glip af et show.", "cta.button": "Følg mig på Twitch"}, "en": {"nav.home": "Home", "nav.shows": "Shows", "nav.top20": "Top 20", "nav.news": "News", "nav.community": "Community", "nav.network": "DJ Network", "nav.about": "About", "hero.subtitle": "Music TV from Denmark", "hero.cta.twitch": "Watch me live on Twitch", "hero.cta.follow": "Follow me", "hero.live": "Live on Twitch", "hero.offline": "Offline right now", "chat.title": "Live chat", "chat.open": "Open chat on Twitch", "about.title": "Who is DJ FOLSOE?", "about.body": "DJ FOLSOE brings music, chat, requests and Danish DJ culture into a living broadcast universe. The channel blends radio energy, TV graphics and community on Twitch.", "shows.title": "Shows", "shows.all": "See all shows →", "news.title": "News & updates", "news.all": "See all news →", "top20.title": "FOLSOE Top 20", "top20.full": "See full list →", "top20.button": "See full Top 20", "community.title": "Community & stats", "mods.title": "Mod team", "mods.body": "Mods keep chat friendly, help new viewers and protect the good vibe around the stream.", "cta.title": "Ready for the next show?", "cta.body": "Follow the channel on Twitch so you never miss a show.", "cta.button": "Follow me on Twitch"}, "de": {"nav.home": "Start", "nav.shows": "Shows", "nav.top20": "Top 20", "nav.news": "News", "nav.community": "Community", "nav.network": "DJ Network", "nav.about": "Über mich", "hero.subtitle": "Music TV aus Dänemark", "hero.cta.twitch": "Live auf Twitch ansehen", "hero.cta.follow": "Folgen", "hero.live": "Live auf Twitch", "hero.offline": "Gerade offline", "chat.title": "Live Chat", "chat.open": "Chat auf Twitch öffnen", "about.title": "Wer ist DJ FOLSOE?", "about.body": "DJ FOLSOE verbindet Musik, Chat, Musikwünsche und dänische DJ-Kultur in einem lebendigen Broadcast-Universum. Der Kanal kombiniert Radio-Energie, TV-Grafik und Community auf Twitch.", "shows.title": "Shows", "shows.all": "Alle Shows →", "news.title": "News & Updates", "news.all": "Alle News →", "top20.title": "FOLSOE Top 20", "top20.full": "Ganze Liste →", "top20.button": "Top 20 ansehen", "community.title": "Community & Stats", "mods.title": "Mod-Team", "mods.body": "Mods halten den Chat freundlich, helfen neuen Zuschauern und schützen die gute Stimmung im Stream.", "cta.title": "Bereit für die nächste Show?", "cta.body": "Folge dem Kanal auf Twitch, damit du keine Show verpasst.", "cta.button": "Auf Twitch folgen"}};

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
  const core = Object.assign({}, DEFAULT_CORE, saved || {});
  core.themes = Object.assign({}, DEFAULT_CORE.themes, core.themes || {});
  core.profile = Object.assign({}, DEFAULT_CORE.profile, core.profile || {});
  return core;
}
async function putCore(env, core) {
  core.version = VERSION;
  core.updatedAt = new Date().toISOString();
  if (env.DJF_DATA && env.DJF_DATA.put) await env.DJF_DATA.put("broadcast-core", JSON.stringify(core));
  return core;
}
function activeTheme(core) {
  return String(core.activeTheme || "weekend").toLowerCase();
}
function themePayload(core) {
  const key = activeTheme(core);
  const t = core.themes?.[key] || DEFAULT_CORE.themes[key] || DEFAULT_CORE.themes.weekend;
  return {activeTheme:key, theme:{key, ...t}};
}
function sortItems(items) {
  return (Array.isArray(items)?items:[]).filter(x=>x && x.active!==false).sort((a,b)=>Number(a.priority||99)-Number(b.priority||99));
}
function topTicker(core) {
  const key = activeTheme(core);
  const items = sortItems(core.topTickerItems).filter(x=>String(x.theme||"").toLowerCase()===key);
  const t = themePayload(core).theme;
  return items.length ? items.map(x=>x.text).filter(Boolean) : [`${t.emoji} ${t.title} · ${t.desc}`];
}
function bottomTicker(core) {
  const key = activeTheme(core);
  const items = sortItems(core.bottomTickerItems).filter(x=>!x.theme || x.theme==="all" || String(x.theme).toLowerCase()===key);
  return items.length ? items.map(x=>x.text).filter(Boolean) : ["TOP20 · REQUESTS · DJ NETWORK · NEWS · COMMUNITY"];
}
async function twitchProfile(env, core, loginOverride) {
  const login = String(loginOverride || core.twitchChannel || env.TWITCH_CHANNEL || "djfolsoe").toLowerCase();
  const fallback = {
    ok:false, login, displayName:"DJ FOLSOE", avatar:core.profile?.fallbackAvatar||"",
    description:core.profile?.description || DEFAULT_CORE.profile.description,
    isLive:false, viewers:0, viewCount:0, game:"Music", liveTitle:""
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
function overlayState(core) {
  const theme = themePayload(core);
  const top20 = Array.isArray(core.top20) ? core.top20 : DEFAULT_CORE.top20;
  const station = core.station || {};
  return {
    ok:true, version:VERSION, theme,
    visual:{primary:theme.theme.primary, secondary:theme.theme.secondary, accent:theme.theme.accent, title:theme.theme.title, emoji:theme.theme.emoji, mood:theme.theme.desc},
    topbarNews: topTicker(core),
    footerTicker: bottomTicker(core),
    chart:{items:top20},
    live:{followers:station.followers||870,followersGoal:station.followersGoal||1000,viewers:station.viewers||0,subs:station.subs||0},
    show:{title:theme.theme.title, description:theme.theme.desc},
    twitchChat:{channel:core.twitchChannel||"djfolsoe"},
    boxes:{
      music: top20[0] ? {label:"MUSIC", title:`#${top20[0].rank} ${top20[0].artist}`, body:top20[0].title} : {label:"MUSIC",title:"FOLSOE Top 20",body:"Chart loading"},
      community: {label:"COMMUNITY",title:"Live chat",body:"Twitch chat locked to box 4"},
      status: {label:"LIVE STATUS",title:`${station.followers||870}/${station.followersGoal||1000} followers`,body:"Broadcast Cloud online"},
      program: {label:"PROGRAM",title:theme.theme.title,body:theme.theme.desc},
      top20: top20[0] ? {label:"TOP20",title:`#${top20[0].rank} ${top20[0].artist}`,body:top20[0].title} : {label:"TOP20",title:"Top 20",body:"Chart loading"},
      news: {label:"NEWS",title:(core.homepageNews||[])[0]?.title || "Broadcast News",body:(core.homepageNews||[])[0]?.body || "News from admin"},
      goals: {label:"GOALS",title:`${station.followers||870}/${station.followersGoal||1000} followers`,body:"Help DJ FOLSOE grow"}
    }
  };
}
async function homepage(env, core) {
  const tw = await twitchProfile(env, core);
  return {
    ok:true, version:VERSION, language:core.language||"da", i18n:I18N[core.language||"da"]||I18N.da,
    twitch:tw, theme:themePayload(core), profile:core.profile,
    shows:core.shows||DEFAULT_CORE.shows,
    newsCards:sortItems(core.homepageNews||DEFAULT_CORE.homepageNews),
    top20:core.top20||DEFAULT_CORE.top20,
    mods:core.profile?.mods||DEFAULT_CORE.profile.mods
  };
}
async function saveList(request, env, core, key) {
  if (!adminOk(request,env)) return json({error:"Unauthorized"},401);
  const body = await request.json();
  core[key] = Array.isArray(body.items) ? body.items : [];
  await putCore(env,core);
  return json({ok:true,items:core[key]});
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
        await putCore(env,core);
        return json({ok:true,...themePayload(core),overlay:overlayState(core)});
      }
      if (path === "/api/overlay/v170-state") return json(overlayState(core));
      if (path === "/api/homepage" || path === "/api/site") return json(await homepage(env, core));
      if (path === "/api/twitch-profile") return json(await twitchProfile(env, core));
      if (path === "/api/chat-profile") return json(await twitchProfile(env, core, url.searchParams.get("login")));
      if (path === "/api/theme-ticker-top") {
        if (request.method === "GET") return json({ok:true,items:core.topTickerItems||[],active:topTicker(core)});
        return saveList(request,env,core,"topTickerItems");
      }
      if (path === "/api/bottom-ticker") {
        if (request.method === "GET") return json({ok:true,items:core.bottomTickerItems||[],active:bottomTicker(core)});
        return saveList(request,env,core,"bottomTickerItems");
      }
      if (path === "/api/homepage-news") {
        if (request.method === "GET") return json({ok:true,items:core.homepageNews||[]});
        return saveList(request,env,core,"homepageNews");
      }
      if (path === "/api/shows") {
        if (request.method === "GET") return json({ok:true,items:core.shows||[]});
        return saveList(request,env,core,"shows");
      }
      if (path === "/api/top20") {
        if (request.method === "GET") return json({ok:true,items:core.top20||[]});
        return saveList(request,env,core,"top20");
      }
      return json({error:"Not found",path},404);
    } catch(e) {
      return json({error:e.message||"worker error", stack:String(e.stack||"")},500);
    }
  }
};
