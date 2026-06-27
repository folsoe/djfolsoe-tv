
const VERSION = "DJ FOLSOE NETWORK V813.6 HOMEPAGE TWITCH CONTENT FIX";
const DEFAULT_CHANNEL = "djfolsoe";

const DEFAULT_THEMES = {"fredagsbar": {"emoji": "🍺", "title": {"da": "FREDAGSBAR", "en": "FRIDAY BAR", "de": "FREITAGSBAR"}, "slogan": {"da": "Weekenden starter her", "en": "Weekend starts here", "de": "Das Wochenende beginnt hier"}, "primary": "#ffb000", "secondary": "#ff2f78", "accent": "#ffd166"}, "popup": {"emoji": "⚡", "title": {"da": "POPUP", "en": "POPUP", "de": "POPUP"}, "slogan": {"da": "Når du mindst venter det", "en": "When you least expect it", "de": "Wenn du es am wenigsten erwartest"}, "primary": "#00d4ff", "secondary": "#ff00ea", "accent": "#ffffff"}, "trance": {"emoji": "💙", "title": {"da": "TRANCE TUESDAY", "en": "TRANCE TUESDAY", "de": "TRANCE TUESDAY"}, "slogan": {"da": "Uplifting energy", "en": "Uplifting energy", "de": "Uplifting Energy"}, "primary": "#00e5ff", "secondary": "#7b2fff", "accent": "#b8f7ff"}, "retro": {"emoji": "🕹️", "title": {"da": "RETRO HITS", "en": "RETRO HITS", "de": "RETRO HITS"}, "slogan": {"da": "Klassikere der aldrig dør", "en": "Classics that refuse to retire", "de": "Klassiker, die nie sterben"}, "primary": "#ff2bd6", "secondary": "#7b2fff", "accent": "#ffd166"}, "eurodance": {"emoji": "💛", "title": {"da": "EURODANCE", "en": "EURODANCE", "de": "EURODANCE"}, "slogan": {"da": "Store beats og store hooks", "en": "Big beats and big hooks", "de": "Große Beats und große Hooks"}, "primary": "#00f0ff", "secondary": "#005dff", "accent": "#ffe600"}, "morning": {"emoji": "☀️", "title": {"da": "GOOD MORNING TWITCH", "en": "GOOD MORNING TWITCH", "de": "GOOD MORNING TWITCH"}, "slogan": {"da": "Kaffe, musik og god stemning", "en": "Coffee, music and good vibes", "de": "Kaffee, Musik und gute Stimmung"}, "primary": "#ffb000", "secondary": "#ff5a00", "accent": "#fff1a8"}, "summer": {"emoji": "🌴", "title": {"da": "SUMMER BEATS", "en": "SUMMER BEATS", "de": "SUMMER BEATS"}, "slogan": {"da": "Sommer 2026 med sol og bangers", "en": "Summer 2026 with sunshine and bangers", "de": "Sommer 2026 mit Sonne und Bangers"}, "primary": "#00f5d4", "secondary": "#ffb703", "accent": "#fff08a"}, "weekend": {"emoji": "🎉", "title": {"da": "WEEKEND VIBES", "en": "WEEKEND VIBES", "de": "WEEKEND VIBES"}, "slogan": {"da": "Maksimal musik og fællesskab", "en": "Maximum music and community", "de": "Maximale Musik und Community"}, "primary": "#ffd166", "secondary": "#ff4d6d", "accent": "#00d4ff"}};

const DEFAULT_I18N = {"da": {"brand.kicker": "Broadcast Cloud · DJ FOLSOE på Twitch", "hero.title": "DJ FOLSOE", "hero.subtitle": "Music TV fra Danmark", "hero.body": "DJ FOLSOE er en dansk musikstreamer på Twitch med live DJ-shows, musikønsker, Top 20, fællesskab og broadcast-grafik bygget som en moderne Music TV-kanal.", "about.title": "Hvem er DJ FOLSOE?", "about.body": "DJ FOLSOE samler musik, chat, requests og dansk DJ-kultur i et levende broadcast-univers. Kanalen blander radioenergi, TV-grafik og fællesskab på Twitch.", "mods.title": "Mod-teamet", "mods.body": "Mods holder chatten god, hjælper nye seere og skaber den trygge stemning omkring streamen.", "shows.title": "Shows", "news.title": "Nyheder", "top20.title": "FOLSOE Top 20", "requests.title": "Musikønsker", "theme.active": "Aktivt tema", "chat.title": "Live Twitch chat", "box.follow": "Follow journey", "box.program": "Program / tema", "box.music": "Music desk", "box.chat": "Live Twitch chat", "admin.theme": "Theme Engine", "admin.topTicker": "Top ticker maskine", "admin.bottomTicker": "Bund ticker maskine", "admin.save": "Gem", "admin.add": "Tilføj", "admin.delete": "Slet", "admin.test": "Test"}, "en": {"brand.kicker": "Broadcast Cloud · DJ FOLSOE on Twitch", "hero.title": "DJ FOLSOE", "hero.subtitle": "Music TV from Denmark", "hero.body": "DJ FOLSOE is a Danish music streamer on Twitch with live DJ shows, song requests, Top 20 countdowns, community and broadcast graphics built as a modern Music TV channel.", "about.title": "Who is DJ FOLSOE?", "about.body": "DJ FOLSOE brings music, chat, requests and Danish DJ culture into a live broadcast universe. The channel blends radio energy, TV graphics and community on Twitch.", "mods.title": "The mod team", "mods.body": "Mods keep chat friendly, help new viewers and protect the good energy around the stream.", "shows.title": "Shows", "news.title": "News", "top20.title": "FOLSOE Top 20", "requests.title": "Song requests", "theme.active": "Active theme", "chat.title": "Live Twitch chat", "box.follow": "Follow journey", "box.program": "Program / theme", "box.music": "Music desk", "box.chat": "Live Twitch chat", "admin.theme": "Theme Engine", "admin.topTicker": "Top ticker machine", "admin.bottomTicker": "Bottom ticker machine", "admin.save": "Save", "admin.add": "Add", "admin.delete": "Delete", "admin.test": "Test"}, "de": {"brand.kicker": "Broadcast Cloud · DJ FOLSOE auf Twitch", "hero.title": "DJ FOLSOE", "hero.subtitle": "Music TV aus Dänemark", "hero.body": "DJ FOLSOE ist ein dänischer Musikstreamer auf Twitch mit Live-DJ-Shows, Musikwünschen, Top-20-Countdowns, Community und Broadcast-Grafik wie ein moderner Music-TV-Kanal.", "about.title": "Wer ist DJ FOLSOE?", "about.body": "DJ FOLSOE verbindet Musik, Chat, Musikwünsche und dänische DJ-Kultur in einem lebendigen Broadcast-Universum. Der Kanal kombiniert Radio-Energie, TV-Grafik und Community auf Twitch.", "mods.title": "Das Mod-Team", "mods.body": "Mods halten den Chat freundlich, helfen neuen Zuschauern und schützen die gute Stimmung im Stream.", "shows.title": "Shows", "news.title": "Nachrichten", "top20.title": "FOLSOE Top 20", "requests.title": "Musikwünsche", "theme.active": "Aktives Theme", "chat.title": "Live Twitch Chat", "box.follow": "Follower-Reise", "box.program": "Programm / Theme", "box.music": "Music Desk", "box.chat": "Live Twitch Chat", "admin.theme": "Theme Engine", "admin.topTicker": "Top-Ticker-Maschine", "admin.bottomTicker": "Bottom-Ticker-Maschine", "admin.save": "Speichern", "admin.add": "Hinzufügen", "admin.delete": "Löschen", "admin.test": "Test"}};

const DEFAULT_CORE = {
  platformVersion: VERSION,
  settings: { language: "da" },
  themeEngine: { activeTheme: "morning" },
  themes: DEFAULT_THEMES,
  themeTickerTop: Object.entries(DEFAULT_THEMES).map(([k,v],i)=>({id:"top_"+k,active:true,theme:k,text:`${v.emoji} ${v.title.da} · ${v.slogan.da}`,priority:i+1})),
  broadcastTickerBottom: [
    {id:"bottom_all_1",active:true,theme:"all",text:"TOP20 · REQUESTS · DJ NETWORK · NEWS · COMMUNITY · DJ FOLSOE Broadcast Cloud",priority:1}
  ],
  station: { followersCurrent: 870, followersGoal: 1000, viewers: 0, category: "Music" },
  schedule: [
    {day:"", time:"", show:"DJ FOLSOE LIVE", title:"DJ FOLSOE LIVE"}
  ],
  weeklyListeningChart: { title:"FOLSOE Weekly Listening Chart", items:[
    {rank:1, artist:"Axwell & Bonn", title:"Whatever Turns You On", points:92, genre:"Dance"},
    {rank:2, artist:"Lost Frequencies", title:"Live It All", points:88, genre:"Dance Pop"}
  ]},
  broadcastNews: [
    {id:"n1",active:true,theme:"all",label:"NEWS",text:"DJ FOLSOE Broadcast Cloud is live",priority:1}
  ],
  profile: {
    name:"DJ FOLSOE",
    tagline:"Music TV from Denmark",
    twitch:"https://twitch.tv/djfolsoe",
    genres:["Trance","Eurodance","Retro","EDM","Nu-Disco","Dance"],
    equipment:["Denon DJ","OBS","StreamElements","Broadcast Cloud"],
    mods:[{name:"Mod Team",role:"Chat safety, welcome and community"},{name:"VIP Crew",role:"Requests, vibes and support"}],
    about:{
      da:DEFAULT_I18N.da["about.body"],
      en:DEFAULT_I18N.en["about.body"],
      de:DEFAULT_I18N.de["about.body"]
    }
  }
};

function cors(){
  return {
    "access-control-allow-origin":"*",
    "access-control-allow-methods":"GET,POST,OPTIONS",
    "access-control-allow-headers":"content-type,x-admin-token,authorization",
    "cache-control":"no-store"
  };
}
function json(data, status=200){
  return new Response(JSON.stringify(data,null,2), {status, headers:{"content-type":"application/json; charset=utf-8", ...cors()}});
}
function deepMerge(base, extra){
  if(!extra || typeof extra !== "object") return structuredClone(base);
  const out = Array.isArray(base) ? [...base] : {...base};
  for(const [k,v] of Object.entries(extra)){
    if(v && typeof v === "object" && !Array.isArray(v) && out[k] && typeof out[k] === "object" && !Array.isArray(out[k])) out[k]=deepMerge(out[k],v);
    else out[k]=v;
  }
  return out;
}
async function getCore(env){
  let saved = null;
  try{
    if(env.DJF_DATA && env.DJF_DATA.get) saved = await env.DJF_DATA.get("broadcast-core","json");
    else if(env.DJF_DATA && env.DJF_DATA.getWithMetadata) saved = (await env.DJF_DATA.getWithMetadata("broadcast-core","json")).value;
  }catch(e){}
  return deepMerge(DEFAULT_CORE, saved || {});
}
async function putCore(env, core){
  core.platformVersion = VERSION;
  core.updatedAt = new Date().toISOString();
  if(env.DJF_DATA && env.DJF_DATA.put) await env.DJF_DATA.put("broadcast-core", JSON.stringify(core));
  return core;
}
function adminOk(request, env){
  const token = request.headers.get("x-admin-token") || request.headers.get("authorization")?.replace(/^Bearer\s+/i,"") || "";
  return !!env.ADMIN_TOKEN && token === env.ADMIN_TOKEN;
}
function lang(core){
  return (core.settings && core.settings.language) || "da";
}
function activeThemeKey(core){
  return String(core.themeEngine?.activeTheme || core.activeTheme || "morning").toLowerCase();
}
function themePayload(core){
  const key = activeThemeKey(core);
  const t = (core.themes && core.themes[key]) || DEFAULT_THEMES[key] || DEFAULT_THEMES.morning;
  const l = lang(core);
  return {
    activeTheme:key,
    theme:{
      key,
      emoji:t.emoji || "",
      title:(t.title && (t.title[l] || t.title.da || t.title.en)) || t.title || key.toUpperCase(),
      slogan:(t.slogan && (t.slogan[l] || t.slogan.da || t.slogan.en)) || t.slogan || "",
      primary:t.primary || "#00e5ff",
      secondary:t.secondary || "#7b2fff",
      accent:t.accent || "#ffd166"
    }
  };
}
function ticker(core, pos){
  const active = activeThemeKey(core);
  const items = Array.isArray(core[pos==="top"?"themeTickerTop":"broadcastTickerBottom"]) ? core[pos==="top"?"themeTickerTop":"broadcastTickerBottom"] : [];
  const filtered = items
    .filter(x=>x && x.active !== false)
    .filter(x=>pos==="top" ? String(x.theme||"").toLowerCase()===active : (!x.theme || x.theme==="all" || String(x.theme).toLowerCase()===active))
    .sort((a,b)=>Number(a.priority||99)-Number(b.priority||99))
    .map(x=>String(x.text||"").trim()).filter(Boolean);
  if(filtered.length) return filtered;
  const tp = themePayload(core).theme;
  return pos==="top" ? [`${tp.emoji} ${tp.title} · ${tp.slogan}`] : ["TOP20 · REQUESTS · DJ NETWORK · NEWS · COMMUNITY"];
}
function showState(core){
  const s = Array.isArray(core.schedule) && core.schedule[0] ? core.schedule[0] : {};
  const tp = themePayload(core).theme;
  return { title:s.show || s.title || tp.title || "DJ FOLSOE LIVE", day:s.day||"", time:s.time||"", description:s.description || tp.slogan || "" };
}
function overlayPayload(core){
  const tp = themePayload(core);
  const l = lang(core);
  const station = core.station || {};
  const chartItems = core.weeklyListeningChart?.items || core.top20Chart?.items || [];
  const top = chartItems[0] || {};
  const pick = chartItems.find(x=>x.folsoePick || x.pick===true || String(x.pick||"").toLowerCase()==="yes") || chartItems[1] || top || {};
  const show = showState(core);
  const followers = Number(station.followersCurrent || station.followers || 870);
  const goal = Number(station.followersGoal || 1000);
  const viewers = Number(station.viewers || 0);
  const topbarNews = ticker(core,"top");
  const footerTicker = ticker(core,"bottom");
  return {
    ok:true,
    version:VERSION,
    language:l,
    i18n: DEFAULT_I18N[l] || DEFAULT_I18N.da,
    theme:tp,
    visual:{primary:tp.theme.primary, secondary:tp.theme.secondary, accent:tp.theme.accent, title:tp.theme.title, emoji:tp.theme.emoji, mood:tp.theme.slogan},
    live:{isLive:!!station.live, viewers, followers, followersGoal:goal, subsToday:Number(station.subsToday||0), bitsToday:Number(station.bitsToday||0), category:station.category||"Music"},
    show,
    chart:{title:core.weeklyListeningChart?.title || "FOLSOE Weekly Listening Chart", items:chartItems.slice(0,20)},
    topbarNews,
    footerTicker,
    profile:core.profile || DEFAULT_CORE.profile,
    twitchChat:{channel:String(core.twitchChannel || DEFAULT_CHANNEL).toLowerCase(), enabled:true},
    motion:{lanes:{
      box1:[
        {label:DEFAULT_I18N[l]?.["box.follow"] || "Follow journey", headline:`${followers}/${goal} followers`, body:`${Math.max(0,goal-followers)} to go · ${viewers} viewers`},
        {label:"LIVE DATA", headline:`${viewers} viewers`, body:`${station.category || "Music"} · Broadcast Cloud`},
        {label:"SUPPORT", headline:`${station.subsToday || 0} subs · ${station.bitsToday || 0} bits`, body:"Follow · Subscribe · Share · Chat"}
      ],
      box2:[
        {label:DEFAULT_I18N[l]?.["box.program"] || "Program / theme", headline:show.title, body:`${show.day} ${show.time}`.trim() || show.description},
        {label:DEFAULT_I18N[l]?.["theme.active"] || "Active theme", headline:`${tp.theme.emoji} ${tp.theme.title}`.trim(), body:tp.theme.slogan},
        {label:"BROADCAST CLOUD", headline:"Website + admin + overlay", body:"One unified content engine"}
      ],
      box3:[
        {label: top.rank ? `TOP 20 #${top.rank}` : "TOP 20", headline:top.artist || "FOLSOE Chart", body:top.title || "Weekly Listening Chart"},
        {label:"FOLSOE PICK", headline:pick.artist || "DJ FOLSOE", body:pick.title || "Pick of the week"},
        {label:"REQUESTS", headline:"Requests open", body:"Use chat to request music"}
      ],
      box4:[{label:DEFAULT_I18N[l]?.["chat.title"] || "Live Twitch chat", headline:"Twitch chat", body:"Locked to real chat"}]
    }}
  };
}
async function twitchProfile(env, login){
  login = String(login||"").toLowerCase().replace(/[^a-z0-9_]/g,"");
  if(!login) return {ok:false, error:"Missing login"};
  try{
    if(!env.TWITCH_CLIENT_ID || !env.TWITCH_ACCESS_TOKEN) return {ok:false, login, avatar:""};
    const token = String(env.TWITCH_ACCESS_TOKEN).startsWith("Bearer ") ? String(env.TWITCH_ACCESS_TOKEN).slice(7) : env.TWITCH_ACCESS_TOKEN;
    const r = await fetch("https://api.twitch.tv/helix/users?login="+encodeURIComponent(login), {
      headers:{"Client-ID":env.TWITCH_CLIENT_ID, "Authorization":"Bearer "+token}
    });
    const j = await r.json();
    const u = j?.data?.[0];
    return {ok:!!u, login, displayName:u?.display_name || login, avatar:u?.profile_image_url || ""};
  }catch(e){return {ok:false, login, avatar:"", error:e.message || "profile error"};}
}


async function getTwitchProfilePayload(env, core){
  const login = String(core.twitchChannel || env.TWITCH_CHANNEL || "djfolsoe").toLowerCase();
  const fallback = {
    ok:false,
    login,
    displayName:"DJ FOLSOE",
    avatar:"",
    description:"Danish music streamer on Twitch with live DJ shows, song requests, Top 20 countdowns and community.",
    broadcasterType:"",
    viewCount:0,
    offline:false
  };
  try{
    if(!env.TWITCH_CLIENT_ID || !env.TWITCH_ACCESS_TOKEN) return fallback;
    const token = String(env.TWITCH_ACCESS_TOKEN).startsWith("Bearer ") ? String(env.TWITCH_ACCESS_TOKEN).slice(7) : env.TWITCH_ACCESS_TOKEN;
    const headers = {"Client-ID":env.TWITCH_CLIENT_ID,"Authorization":"Bearer "+token};
    const uRes = await fetch("https://api.twitch.tv/helix/users?login="+encodeURIComponent(login), {headers});
    const uJson = await uRes.json();
    const u = uJson && uJson.data && uJson.data[0];
    if(!u) return fallback;
    let stream = null;
    try{
      const sRes = await fetch("https://api.twitch.tv/helix/streams?user_login="+encodeURIComponent(login), {headers});
      const sJson = await sRes.json();
      stream = sJson && sJson.data && sJson.data[0];
    }catch(e){}
    return {
      ok:true,
      login,
      id:u.id,
      displayName:u.display_name || "DJ FOLSOE",
      avatar:u.profile_image_url || "",
      description:u.description || fallback.description,
      broadcasterType:u.broadcaster_type || "",
      viewCount:u.view_count || 0,
      isLive:!!stream,
      liveTitle:stream?.title || "",
      liveGame:stream?.game_name || "Music",
      viewers:stream?.viewer_count || 0,
      startedAt:stream?.started_at || ""
    };
  }catch(e){
    return {...fallback, error:e.message || "Twitch profile error"};
  }
}
function homepageNewsCards(core, overlay){
  const top = (core.themeTickerTop || []).filter(x=>x && x.active !== false).slice(0,6).map(x=>({type:"Show update", title:x.text || "", theme:x.theme || "all"}));
  const bottom = (core.broadcastTickerBottom || []).filter(x=>x && x.active !== false).slice(0,8).map(x=>({type:"Broadcast info", title:x.text || "", theme:x.theme || "all"}));
  const manual = (core.broadcastNews || []).filter(x=>x && x.active !== false).map(x=>({type:x.label||"News", title:x.text||x.title||"", theme:x.theme||"all"}));
  const chart = overlay.chart?.items?.[0] ? [{type:"Top 20 nyt", title:`#1 ${overlay.chart.items[0].artist} – ${overlay.chart.items[0].title}`, theme:"all"}] : [];
  return [
    ...manual,
    ...chart,
    {type:"Request info", title:"Send dit musikønske i Twitch chatten og vær med til at forme showet.", theme:"all"},
    {type:"Community news", title:"Chat, emotes, requests og fællesskab er en fast del af DJ FOLSOE.", theme:"all"},
    {type:"DJ Network", title:"Danske DJ streams, raids og community support.", theme:"all"},
    {type:"Twitch updates", title:"Følg DJ FOLSOE på Twitch, så du ikke misser næste live show.", theme:"all"},
    ...top,
    ...bottom
  ].filter(x=>x.title).slice(0,16);
}

export default {
  async fetch(request, env){
    if(request.method === "OPTIONS") return new Response("", {headers:cors()});
    const url = new URL(request.url);
    const path = url.pathname;
    try{
      if(path === "/" || path === "/api") return json({ok:true, version:VERSION, endpoints:["/api/theme","/api/overlay/v170-state","/api/theme-ticker-top","/api/bottom-ticker","/api/site","/api/i18n","/api/chat-profile"]});
      const core = await getCore(env);

      if(path === "/api/homepage"){
        const profile = await getTwitchProfilePayload(env, core);
        const overlay = overlayPayload(core);
        return json({
          ok:true,
          version:"DJ FOLSOE NETWORK V813.6 HOMEPAGE TWITCH CONTENT FIX",
          language:lang(core),
          i18n:DEFAULT_I18N[lang(core)] || DEFAULT_I18N.da,
          twitch:profile,
          profile:core.profile || DEFAULT_CORE.profile,
          shows:[
            {key:"trance",title:"Trance Tuesday",body:"Uplifting trance, emotion and big melodies."},
            {key:"top20",title:"FOLSOE Top 20",body:"Weekly listening chart and countdown show."},
            {key:"fredagsbar",title:"Fredagsbar",body:"Weekend energy, party tracks and community."},
            {key:"retro",title:"Retro Hits",body:"Classic tracks, nostalgia and singalong moments."},
            {key:"morning",title:"Good Morning Twitch",body:"Coffee, music and the best start of the day."},
            {key:"popup",title:"PopUp",body:"Surprise streams when you least expect it."},
            {key:"weekend",title:"Weekend / Eurodance / Summer",body:"Special themes as needed."}
          ],
          newsCards:homepageNewsCards(core, overlay),
          chart:overlay.chart,
          mods:(core.profile && core.profile.mods) || DEFAULT_CORE.profile.mods || [],
          overlay
        });
      }

      if(path === "/api/overlay/v170-state") return json(overlayPayload(core));
      if(path === "/api/site") return json({...overlayPayload(core), core});
      if(path === "/api/i18n") return json({ok:true, language:lang(core), profiles:DEFAULT_I18N});
      if(path === "/api/chat-profile") return json(await twitchProfile(env, url.searchParams.get("login")));

      if(path === "/api/theme"){
        if(request.method === "GET") return json(themePayload(core));
        if(!adminOk(request,env)) return json({error:"Unauthorized"},401);
        const body = await request.json();
        const key = String(body.theme || body.activeTheme || body.key || "").toLowerCase();
        if(!DEFAULT_THEMES[key] && !(core.themes && core.themes[key])) return json({error:"Unknown theme", theme:key},400);
        core.themeEngine = core.themeEngine || {};
        core.themeEngine.activeTheme = key;
        await putCore(env, core);
        return json({...themePayload(core), saved:true, overlay:overlayPayload(core)});
      }

      if(path === "/api/settings"){
        if(request.method === "GET") return json({ok:true, settings:core.settings || {}});
        if(!adminOk(request,env)) return json({error:"Unauthorized"},401);
        const body = await request.json();
        core.settings = {...(core.settings||{}), ...body};
        await putCore(env, core);
        return json({ok:true, settings:core.settings});
      }

      if(path === "/api/theme-ticker-top" || path === "/api/bottom-ticker"){
        const key = path === "/api/theme-ticker-top" ? "themeTickerTop" : "broadcastTickerBottom";
        if(request.method === "GET") return json({ok:true, items:core[key] || [], active:ticker(core, key==="themeTickerTop"?"top":"bottom")});
        if(!adminOk(request,env)) return json({error:"Unauthorized"},401);
        const body = await request.json();
        core[key] = Array.isArray(body.items) ? body.items : [];
        await putCore(env, core);
        return json({ok:true, items:core[key], active:ticker(core, key==="themeTickerTop"?"top":"bottom")});
      }

      if(path === "/api/core"){
        if(request.method === "GET") return json(core);
        if(!adminOk(request,env)) return json({error:"Unauthorized"},401);
        const body = await request.json();
        const saved = await putCore(env, deepMerge(core, body));
        return json({ok:true, core:saved});
      }

      return json({error:"Not found", path},404);
    }catch(e){return json({error:e.message || "Worker error", stack:String(e.stack||"")},500);}
  }
};
