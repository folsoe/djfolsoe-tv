// DJ FOLSOE NETWORK V814.4 PRO MUSIC TV CHAT POLISH
// Worker routes:
// GET  /api/broadcast-core
// POST /api/broadcast-core
// GET  /api/chart
// POST /api/chart
// GET  /api/requests
// POST /api/requests
// DELETE /api/requests
// GET  /api/twitch-live
//
// Required KV binding: DJF_DATA
// Required env vars:
// ADMIN_TOKEN = long secret admin password/token
// TWITCH_CLIENT_ID = Twitch developer client id
// TWITCH_ACCESS_TOKEN = Twitch app/user access token
// TWITCH_CHANNEL = djfolsoe

const DEFAULT_DATA = {
  station: {
    name: "DJ FOLSOE",
    domain: "folsoetv.dk",
    twitch: "https://twitch.tv/djfolsoe",
    twitchLogin: "djfolsoe",
    live: false,
    viewers: 0,
    followersCurrent: 870,
    followersGoal: 1000,
    subsToday: 0,
    bitsToday: 0,
    streamTitle: "",
    category: ""
  },
  schedule: [],
  shows: [],
  top20: [],
  top20Chart: {
    title: "FOLSOE TV Top 20",
    subtitle: "FOLSOE AIRPLAY HOT 20",
    week: "This Week",
    archive: [],
    items: []
  },
  news: [],
  requests: [],
  broadcastCore: {
    version: "V814.4 PRO MUSIC TV CHAT POLISH",
    backend: "Cloudflare Worker",
    singleSourceOfTruth: true
  }
};

const KEY_CORE = "broadcast-core";
const KEY_REQUESTS = "requests";

function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET,POST,DELETE,OPTIONS",
      "access-control-allow-headers": "content-type,authorization,x-admin-token",
      ...extraHeaders
    }
  });
}

function okOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET,POST,DELETE,OPTIONS",
      "access-control-allow-headers": "content-type,authorization,x-admin-token"
    }
  });
}

function isAdmin(request, env) {
  const token = request.headers.get("x-admin-token") || (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  return Boolean(env.ADMIN_TOKEN && token && token === env.ADMIN_TOKEN);
}

async function getCore(env) {
  const raw = await env.DJF_DATA.get(KEY_CORE);
  if (!raw) return structuredClone(DEFAULT_DATA);
  try {
    return { ...structuredClone(DEFAULT_DATA), ...JSON.parse(raw) };
  } catch {
    return structuredClone(DEFAULT_DATA);
  }
}

async function putCore(env, data) {
  data.broadcastCore = data.broadcastCore || {};
  data.broadcastCore.version = "V814.4 PRO MUSIC TV CHAT POLISH";
  data.broadcastCore.backend = "Cloudflare Worker";
  data.broadcastCore.lastUpdated = new Date().toISOString();
  await env.DJF_DATA.put(KEY_CORE, JSON.stringify(data));
  return data;
}

async function getRequests(env) {
  const raw = await env.DJF_DATA.get(KEY_REQUESTS);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

async function putRequests(env, requests) {
  await env.DJF_DATA.put(KEY_REQUESTS, JSON.stringify(requests));
  return requests;
}


async function twitchHeaders(env){
  return {"Client-ID": env.TWITCH_CLIENT_ID, "Authorization": `Bearer ${env.TWITCH_ACCESS_TOKEN}`};
}
async function twitchUser(env){
  const clientId=env.TWITCH_CLIENT_ID, token=env.TWITCH_ACCESS_TOKEN, login=env.TWITCH_CHANNEL||"djfolsoe";
  if(!clientId||!token) return {configured:false, login};
  const res=await fetch(`https://api.twitch.tv/helix/users?login=${encodeURIComponent(login)}`,{headers: await twitchHeaders(env)});
  const j=await res.json();
  return {configured:true, user:j.data&&j.data[0], login};
}
async function twitchProfile(env){
  const tu=await twitchUser(env);
  if(!tu.configured) return {configured:false,message:"Missing TWITCH_CLIENT_ID or TWITCH_ACCESS_TOKEN"};
  if(!tu.user) return {configured:true, found:false, login:tu.login};
  let followers=0;
  try{
    const fr=await fetch(`https://api.twitch.tv/helix/channels/followers?broadcaster_id=${encodeURIComponent(tu.user.id)}`,{headers: await twitchHeaders(env)});
    const fj=await fr.json(); followers=fj.total||0;
  }catch(e){}
  return {configured:true, found:true, login:tu.login, userId:tu.user.id, displayName:tu.user.display_name, description:tu.user.description||"", profileImage:tu.user.profile_image_url||"", offlineImage:tu.user.offline_image_url||"", broadcasterType:tu.user.broadcaster_type||"", createdAt:tu.user.created_at||"", followers};
}
async function twitchChannelInfo(env,userId){
  if(!userId) return {};
  const r=await fetch(`https://api.twitch.tv/helix/channels?broadcaster_id=${encodeURIComponent(userId)}`,{headers: await twitchHeaders(env)});
  const j=await r.json(); return (j.data&&j.data[0])||{};
}
async function twitchVideos(env,userId){
  if(!userId) return [];
  const r=await fetch(`https://api.twitch.tv/helix/videos?user_id=${encodeURIComponent(userId)}&first=10&type=archive`,{headers: await twitchHeaders(env)});
  const j=await r.json(); return j.data||[];
}
async function twitchClips(env,userId){
  if(!userId) return [];
  const started=new Date(Date.now()-1000*60*60*24*30).toISOString();
  const r=await fetch(`https://api.twitch.tv/helix/clips?broadcaster_id=${encodeURIComponent(userId)}&first=10&started_at=${encodeURIComponent(started)}`,{headers: await twitchHeaders(env)});
  const j=await r.json(); return j.data||[];
}
async function fullTwitchPackage(env){
  const profile=await twitchProfile(env);
  if(!profile.configured||!profile.found) return profile;
  const live=await twitchLive(env);
  const channel=await twitchChannelInfo(env,profile.userId);
  const videos=await twitchVideos(env,profile.userId);
  const clips=await twitchClips(env,profile.userId);
  return {configured:true,found:true,profile,live,channel,videos,clips,lastUpdated:new Date().toISOString()};
}

async function twitchLive(env) {
  const clientId = env.TWITCH_CLIENT_ID;
  const token = env.TWITCH_ACCESS_TOKEN;
  const login = env.TWITCH_CHANNEL || "djfolsoe";
  if (!clientId || !token) {
    return { configured: false, live: false, message: "Missing TWITCH_CLIENT_ID or TWITCH_ACCESS_TOKEN" };
  }

  const userRes = await fetch(`https://api.twitch.tv/helix/users?login=${encodeURIComponent(login)}`, {
    headers: { "Client-ID": clientId, "Authorization": `Bearer ${token}` }
  });
  const userJson = await userRes.json();
  const user = userJson.data && userJson.data[0];
  if (!user) return { configured: true, live: false, message: "Channel not found", login };

  const streamRes = await fetch(`https://api.twitch.tv/helix/streams?user_id=${encodeURIComponent(user.id)}`, {
    headers: { "Client-ID": clientId, "Authorization": `Bearer ${token}` }
  });
  const streamJson = await streamRes.json();
  const stream = streamJson.data && streamJson.data[0];

  if (!stream) {
    return { configured: true, live: false, login, userId: user.id, viewers: 0, title: "", category: "" };
  }

  return {
    configured: true,
    live: true,
    login,
    userId: user.id,
    viewers: stream.viewer_count || 0,
    title: stream.title || "",
    category: stream.game_name || "",
    startedAt: stream.started_at || "",
    thumbnail: stream.thumbnail_url || ""
  };
}


function stripHtml(input){ return String(input||"").replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim(); }
function xmlText(block, tag){
  const m = block.match(new RegExp("<"+tag+"(?:\\\\s[^>]*)?>([\\\\s\\\\S]*?)<\\\\/"+tag+">","i"));
  if(!m) return "";
  return m[1].replace(/<!\[CDATA\[/g,"").replace(/\]\]>/g,"").trim();
}
function decodeXml(s){
  return String(s||"").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#39;/g,"'");
}
async function fetchRssSource(source){
  try{
    const res = await fetch(source.url, {headers:{"user-agent":"DJ FOLSOE Newsroom"}});
    if(!res.ok) return [];
    const xml = await res.text();
    const blocks = [...xml.matchAll(/<item[\s\S]*?<\/item>/gi)].map(m=>m[0]).slice(0,8);
    return blocks.map(item=>({
      category: source.category,
      source: source.label,
      title: decodeXml(stripHtml(xmlText(item,"title"))),
      url: decodeXml(stripHtml(xmlText(item,"link"))),
      publishedAt: decodeXml(stripHtml(xmlText(item,"pubDate"))),
      summary: decodeXml(stripHtml(xmlText(item,"description"))).slice(0,220)
    })).filter(x=>x.title);
  }catch(e){ return []; }
}
async function collectNewsroom(env){
  let core = await getCore(env);
  const sources = (core.unifiedNewsroom && core.unifiedNewsroom.sources) || [
    {id:"edm",label:"EDM.com",category:"EDM",url:"https://edm.com/.rss/full/"},
    {id:"mixmag",label:"Mixmag",category:"Dance / Club",url:"https://mixmag.net/rss.xml"},
    {id:"ra",label:"Resident Advisor",category:"Electronic",url:"https://ra.co/xml/news.xml"},
    {id:"nme_music",label:"NME Music",category:"Music",url:"https://www.nme.com/music/feed"},
    {id:"dr_kultur",label:"DR Kultur",category:"Danmark",url:"https://www.dr.dk/nyheder/service/feeds/kultur"}
  ];
  const batches = await Promise.all(sources.map(fetchRssSource));
  const items = batches.flat().slice(0,60);
  core.unifiedNewsroom = core.unifiedNewsroom || {};
  core.unifiedNewsroom.version = "V814.4 PRO MUSIC TV CHAT POLISH";
  core.unifiedNewsroom.sources = sources;
  core.unifiedNewsroom.items = items;
  core.unifiedNewsroom.lastUpdated = new Date().toISOString();
  await putCore(env, core);
  return core.unifiedNewsroom;
}


function forceBrandingPatch(core) {
  core = core || {};
  core.brand = "DJ FOLSOE";
  core.heroRibbon = { da:"BROADCAST CLOUD · DJ FOLSOE ON TWITCH", en:"BROADCAST CLOUD · DJ FOLSOE ON TWITCH", de:"BROADCAST CLOUD · DJ FOLSOE ON TWITCH" };
  core.about = { da:"DJ FOLSOE er en dansk musikstreamer på Twitch.tv med live DJ-shows, musikønsker, hitlister og et stærkt musikfællesskab.", en:"DJ FOLSOE is a Danish music streamer on Twitch.tv with live DJ shows, song requests, chart countdowns and a strong music community.", de:"DJ FOLSOE ist ein dänischer Musikstreamer auf Twitch.tv mit Live-DJ-Shows, Musikwünschen, Charts und einer starken Musik-Community." };
  core.station = core.station || {};
  core.station.name = "DJ FOLSOE";
  core.station.description_da = "DJ FOLSOE er en dansk musikstreamer på Twitch.tv med live DJ-shows, musikønsker, hitlister og et stærkt musikfællesskab.";
  core.station.description_en = "DJ FOLSOE is a Danish music streamer on Twitch.tv with live DJ shows, song requests, chart countdowns and a strong music community.";
  core.station.description_de = "DJ FOLSOE ist ein dänischer Musikstreamer auf Twitch.tv mit Live-DJ-Shows, Musikwünschen, Charts und einer starken Musik-Community.";
  core.broadcastCore = core.broadcastCore || {};
  core.broadcastCore.version = "V814.4 PRO MUSIC TV CHAT POLISH";
  core.broadcastCore.brandingLock = "DJ FOLSOE";
  core.translations = core.translations || {};
  core.translations.siteTitle = { da:"DJ FOLSOE", en:"DJ FOLSOE", de:"DJ FOLSOE" };
  core.translations.heroRibbon = { da:"BROADCAST CLOUD · DJ FOLSOE ON TWITCH", en:"BROADCAST CLOUD · DJ FOLSOE ON TWITCH", de:"BROADCAST CLOUD · DJ FOLSOE ON TWITCH" };
  core.translations.heroDescription = { da:"DJ FOLSOE er en dansk musikstreamer på Twitch.tv med live DJ-shows, musikønsker, hitlister og et stærkt musikfællesskab.", en:"DJ FOLSOE is a Danish music streamer on Twitch.tv with live DJ shows, song requests, chart countdowns and a strong music community.", de:"DJ FOLSOE ist ein dänischer Musikstreamer auf Twitch.tv mit Live-DJ-Shows, Musikwünschen, Charts und einer starken Musik-Community." };
  core.translations.about = { da:"DJ FOLSOE er en dansk musikstreamer på Twitch.tv med live DJ-shows, musikønsker, hitlister og et stærkt musikfællesskab.", en:"DJ FOLSOE is a Danish music streamer on Twitch.tv with live DJ shows, song requests, chart countdowns and a strong music community.", de:"DJ FOLSOE ist ein dänischer Musikstreamer auf Twitch.tv mit Live-DJ-Shows, Musikwünschen, Charts und einer starken Musik-Community." };

  const clean = (value) => {
    if (typeof value === "string") {
      return value
        .replaceAll("DJ FOLSOE", "DJ FOLSOE")
        .replaceAll("FOLSOE TV", "FOLSOE")
        .replace(/\s*[–—-]\s*presented as a modern Music TV channel from Denmark\.?/gi, "")
        .replace(/\s*[–—-]\s*præsenteret som en moderne Music TV-kanal fra Danmark\.?/gi, "")
        .replace(/\s*[–—-]\s*präsentiert als moderner Music-TV-Sender aus Dänemark\.?/gi, "")
        .replace(/\s*[–—-]\s*präsentiert als moderner Music-TV-Kanal aus Dänemark\.?/gi, "");
    }
    if (Array.isArray(value)) return value.map(clean);
    if (value && typeof value === "object") {
      for (const k of Object.keys(value)) value[k] = clean(value[k]);
      return value;
    }
    return value;
  };
  return clean(core);
}


function currentScheduleShow(core){
  const dayName=new Date().toLocaleDateString("en-US",{weekday:"long",timeZone:"Europe/Copenhagen"});
  const schedule=core.schedule||[];
  return schedule.find(x=>String(x.day||"").toLowerCase()===dayName.toLowerCase())||schedule[0]||{};
}
function buildV170OverlayState(core){
  const chart=core.weeklyListeningChart||core.top20Chart||{items:[]};
  const top=(chart.items||[])[0]||{};
  const newsroom=core.unifiedNewsroom||{items:[]};
  const station=core.station||{};
  const twitch=core.twitchLive||{};
  const show=currentScheduleShow(core);
  return {
    ok:true,version:"V814.4 PRO MUSIC TV CHAT POLISH",overlay:"V170.3 Broadcast Revolution",brand:"DJ FOLSOE",apiTime:new Date().toISOString(),
    lockedRules:{singleLeftLogo:true,noDuplicateLogo:true,fourBoxFooter:true,websiteIsMaster:true},
    live:{isLive:Boolean(twitch.live||station.live),viewers:twitch.viewers||station.viewers||0,followers:station.followersCurrent||0,followersGoal:station.followersGoal||1000,subsToday:station.subsToday||0,bitsToday:station.bitsToday||0,title:twitch.title||station.streamTitle||"",category:twitch.category||station.category||"Music"},
    show:{day:show.day||"",time:show.time||"",title:show.show||show.title||"DJ FOLSOE LIVE",description:show.description||""},
    chart:{title:chart.title||"FOLSOE Weekly Listening Chart",topTrack:top,items:(chart.items||[]).slice(0,20)},
    newsroom:{lastUpdated:newsroom.lastUpdated||"",items:(newsroom.items||[]).slice(0,8)},
    websiteNews:publicNewsItems(core).slice(0,12),
    footerBoxes:[
      {id:"box1",label:"LIVE STATUS",headline:(twitch.live||station.live)?"LIVE NOW":"OFFLINE",body:`${twitch.viewers||station.viewers||0} viewers · ${station.followersCurrent||0}/${station.followersGoal||1000} followers`},
      {id:"box2",label:"PROGRAM",headline:show.show||show.title||"DJ FOLSOE",body:`${show.day||""} ${show.time||""}`.trim()},
      {id:"box3",label:"TOP 20",headline:top.artist?`#1 ${top.artist}`:"FOLSOE Chart",body:top.title||"Weekly Listening Chart"},
      {id:"box4",label:"COMMUNITY",headline:"REQUESTS · CHAT · GROWTH",body:`Subs ${station.subsToday||0} · Bits ${station.bitsToday||0}`}
    ],
    ticker:[...(newsroom.items||[]).slice(0,8).map(x=>`${x.category||"Music"}: ${x.title||""}`),...(chart.items||[]).slice(0,5).map(x=>`FOLSOE TOP 20 #${x.rank}: ${x.artist} - ${x.title}`)].filter(Boolean)
  };
}


const DJF_THEMES = {"fredagsbar": {"title": "FREDAGSBAR", "emoji": "🍺", "primary": "#FFD166", "secondary": "#FF4D6D", "accent": "#FF9F1C", "mood": "Weekend starts here", "boxLabels": ["FREDAGSBAR LIVE", "BAR REQUESTS", "TOP 20", "PARTY CHAT"]}, "popup": {"title": "POPUP", "emoji": "⚡", "primary": "#FFFFFF", "secondary": "#00D4FF", "accent": "#FF2E93", "mood": "On when you least expect it", "boxLabels": ["POPUP LIVE", "CHALLENGE ME", "YOU CHOOSE", "I PLAY"]}, "trance": {"title": "TRANCE TUESDAY", "emoji": "💙", "primary": "#00D4FF", "secondary": "#8A2BE2", "accent": "#B8F7FF", "mood": "Music for the soul", "boxLabels": ["TRANCE LIVE", "NEXT DROP", "TOP TRANCE", "REQUESTS"]}, "retro": {"title": "RETRO HITS", "emoji": "🕹️", "primary": "#FF2E93", "secondary": "#7C3AED", "accent": "#FFD166", "mood": "70s 80s 90s memories", "boxLabels": ["RETRO LIVE", "OLD SCHOOL", "CLASSICS", "CHAT"]}, "eurodance": {"title": "EURODANCE", "emoji": "💛", "primary": "#FFE600", "secondary": "#005DFF", "accent": "#FF2E93", "mood": "90s and 00s dance energy", "boxLabels": ["EURODANCE LIVE", "RAVE ENERGY", "TOP 20", "DANCE CHAT"]}, "morning": {"title": "GOOD MORNING TWITCH", "emoji": "☀️", "primary": "#FFD166", "secondary": "#7DD3FC", "accent": "#FFFFFF", "mood": "Coffee, music and morning energy", "boxLabels": ["GOOD MORNING", "TODAY", "NEWS", "CHAT"]}, "summer": {"title": "SUMMER BEATS", "emoji": "🌴", "primary": "#00F5D4", "secondary": "#FFB703", "accent": "#FB5607", "mood": "Summer 2026 beats", "boxLabels": ["SUMMER LIVE", "VACATION VIBES", "TOP 20", "REQUESTS"]}, "weekend": {"title": "WEEKEND VIBES", "emoji": "🎉", "primary": "#FF4D6D", "secondary": "#FFD166", "accent": "#00D4FF", "mood": "Party, club and dancefloor energy", "boxLabels": ["WEEKEND LIVE", "PARTY MODE", "TOP 20", "COMMUNITY"]}};
function normalizeThemeName(name){
  const n=String(name||"").toLowerCase().trim();
  return DJF_THEMES[n]?n:"fredagsbar";
}
function getThemePayload(core){
  const engine=core.themeEngine||{};
  const active=normalizeThemeName(engine.activeTheme||core.activeTheme||"fredagsbar");
  return {ok:true,version:"V814.4 PRO MUSIC TV CHAT POLISH",activeTheme:active,theme:DJF_THEMES[active],themes:DJF_THEMES,commands:Object.keys(DJF_THEMES).map(x=>"!theme "+x)};
}
function applyThemeToOverlayState(state, core){
  const payload=getThemePayload(core);
  const t=payload.theme;
  state.theme=payload;
  state.visual={primary:t.primary,secondary:t.secondary,accent:t.accent,title:t.title,emoji:t.emoji,mood:t.mood};
  if(state.footerBoxes&&t.boxLabels) state.footerBoxes.forEach((b,i)=>{ if(t.boxLabels[i]) b.label=t.boxLabels[i]; });
  state.ticker=[`${t.emoji} ${t.title} · ${t.mood}`, ...(state.ticker||[])];
  return state;
}


function buildMotionPayload(state){
  const chartItems = (state.chart && state.chart.items) || [];
  const top = chartItems[0] || {};
  const newsItems = state.websiteNews || ((state.newsroom && state.newsroom.items) || []);
  const live = state.live || {};
  const show = state.show || {};
  const visual = state.visual || {};
  const themeTitle = visual.title || "DJ FOLSOE";
  const pick = chartItems.find(x=>x.folsoePick) || top;
  const newest = chartItems.find(x=>String(x.status||"").toUpperCase()==="NEW") || top;
  const danish = chartItems.find(x=>String(x.genre||"").toLowerCase().includes("dansk")) || top;

  state.motion = {
    version:"V814.4 PRO MUSIC TV CHAT POLISH",
    layout:"camera-safe-side-stacked",
    rotationMs:8000,
    classicTicker:false,
    cameraSafeArea:{x1:500,x2:1420,y1:120,y2:920},
    lanes:{
      box3:[
        {label:"FOLSOE TOP 20 #1", headline:top.artist||"FOLSOE Chart", body:top.title||"Weekly Listening Chart"},
        {label:"FOLSOE PICK", headline:pick.artist||"DJ FOLSOE", body:pick.title||"Pick of the week"},
        {label:"NEW ENTRY", headline:newest.artist||"New music", body:newest.title||"Fresh on the chart"},
        {label:"DANISH TRACK", headline:danish.artist||"Danish vibes", body:danish.title||"From Denmark"},
        {label:"TOP TRENDING", headline:chartItems[1]?`#${chartItems[1].rank} ${chartItems[1].artist}`:"Trending", body:chartItems[1]?chartItems[1].title:"Broadcast Cloud"}
      ],
      box1:[
        {label:"LIVE STATUS", headline:live.isLive?"LIVE NOW":"OFFLINE", body:`${live.viewers||0} viewers · ${live.category||"Music"}`},
        {label:"FOLLOW GOAL", headline:`${live.followers||0}/${live.followersGoal||1000}`, body:"Journey to the next milestone"},
        {label:"TODAY", headline:`${live.subsToday||0} subs · ${live.bitsToday||0} bits`, body:"Support keeps the broadcast growing"},
        {label:"STREAM TITLE", headline:live.title||"DJ FOLSOE", body:"Live DJ shows from Denmark"}
      ],
      box4:[
        {label:"COMMUNITY", headline:"REQUESTS · CHAT", body:"Be active and shape the show"},
        {label:"SONG REQUESTS", headline:"Request center", body:"Send your favorite track"},
        {label:"FOLLOWER JOURNEY", headline:`${live.followers||0}/${live.followersGoal||1000}`, body:"Help DJ FOLSOE grow"},
        {label:"CHAT ENERGY", headline:"Drop some love", body:"Emotes, requests and good vibes"}
      ],
      box2:[
        {label:"CURRENT SHOW", headline:show.title||"DJ FOLSOE LIVE", body:show.description||"Music, community and requests"},
        {label:"PROGRAM TIME", headline:`${show.day||"Today"} ${show.time||""}`.trim(), body:"Broadcast Cloud schedule"},
        {label:"ACTIVE THEME", headline:themeTitle, body:visual.mood||"Theme Engine active"},
        {label:"NEXT EVENT", headline:"Stay tuned", body:"More shows, more music, more community"}
      ]
    },
    footerCards:[
      {type:"TOP20", text:top.artist?`#1 ${top.artist} – ${top.title}`:"FOLSOE Weekly Listening Chart"},
      {type:"NEWS", text:newsItems[0]?newsItems[0].title:"FOLSOE Music Newsroom"},
      {type:"THEME", text:`${visual.emoji||""} ${themeTitle}`.trim()},
      {type:"GOALS", text:`Followers ${live.followers||0}/${live.followersGoal||1000}`},
      {type:"REQUESTS", text:"Requests, chat and community energy"}
    ],
    capsules:[
      {icon:"🎵", title:"NEW #1", text:top.artist?`${top.artist} – ${top.title}`:"FOLSOE Chart"},
      {icon:"🔥", title:"FOLSOE PICK", text:pick.title||"Pick of the week"},
      {icon:"❤️", title:"FOLLOW GOAL", text:`${live.followers||0}/${live.followersGoal||1000}`},
      {icon:"🚨", title:"MUSIC NEWS", text:newsItems[0]?newsItems[0].title:"Newsroom loading"},
      {icon:visual.emoji||"✨", title:"THEME", text:themeTitle}
    ]
  };
  return state;
}


function publicNewsItems(core){
  const manual = (core.news || []).map(x => ({
    category: x.tag || x.category || "DJ FOLSOE",
    title: x.title || "",
    summary: x.summary || x.text || "",
    source: "DJ FOLSOE"
  })).filter(x=>x.title);
  const newsroom = ((core.unifiedNewsroom && core.unifiedNewsroom.items) || []).map(x=>({
    category:x.category||"Music",
    title:x.title||"",
    summary:x.summary||"",
    source:x.source||"Newsroom"
  })).filter(x=>x.title);
  return manual.length ? manual : newsroom;
}


function adminInputCards(core){
  const news = publicNewsItems(core);
  const chart = core.weeklyListeningChart || core.top20Chart || {items:[]};
  const items = chart.items || [];
  const station = core.station || {};
  const show = currentScheduleShow(core);
  const theme = getThemePayload(core);
  const requests = core.requests || [];
  const cards = [];

  news.slice(0,8).forEach((n,i)=>cards.push({type:n.category||"NEWS", text:n.title||"", body:n.summary||"", source:"news"}));
  items.slice(0,8).forEach(x=>cards.push({type:`TOP 20 #${x.rank}`, text:`${x.artist||""} – ${x.title||""}`.trim(), body:`${x.points||0} points · ${x.genre||"Dance"}`, source:"chart"}));
  cards.push({type:"PROGRAM", text:show.show||show.title||"DJ FOLSOE LIVE", body:`${show.day||""} ${show.time||""}`.trim(), source:"schedule"});
  cards.push({type:"THEME", text:(theme.theme.emoji||"")+" "+(theme.theme.title||"DJ FOLSOE"), body:theme.theme.mood||"Broadcast Cloud", source:"theme"});
  cards.push({type:"FOLLOW GOAL", text:`${station.followersCurrent||0}/${station.followersGoal||1000} followers`, body:"Help DJ FOLSOE grow", source:"growth"});
  cards.push({type:"REQUESTS", text:requests[0] ? (requests[0].artist ? `${requests[0].artist} – ${requests[0].title||""}` : requests[0].title||requests[0].text||"Song requests") : "Song requests open", body:"Send your music wish", source:"requests"});
  cards.push({type:"COMMUNITY", text:"Chat, requests and good vibes", body:"Be active and shape the show", source:"community"});
  return cards.filter(x=>x.text);
}
function bindBoxesFromAdminContent(state, core){
  const cards = adminInputCards(core);
  const bySource = (s)=>cards.filter(x=>x.source===s);
  const news = bySource("news");
  const chart = bySource("chart");
  const schedule = bySource("schedule");
  const theme = bySource("theme");
  const growth = bySource("growth");
  const requests = bySource("requests");
  const community = bySource("community");

  state.topbarNews = broadcastNewsItems(core).map(x=>`${x.label||"NEWS"} · ${x.text}`);

  if(!state.motion) return state;
  state.motion.adminCards = cards;
  state.broadcastNews = broadcastNewsItems(core);
  state.motion.lanes = {
    box1:[...growth, ...cards.filter(x=>["growth","community"].includes(x.source))].map(x=>({label:x.type, headline:x.text, body:x.body})),
    box2:[...schedule, ...theme].map(x=>({label:x.type, headline:x.text, body:x.body})),
    box3:[...chart].map(x=>({label:x.type, headline:x.text, body:x.body})),
    box4:[...news, ...requests, ...community].map(x=>({label:x.type, headline:x.text, body:x.body}))
  };
  for (const key of ["box1","box2","box3","box4"]) {
    if(!state.motion.lanes[key] || !state.motion.lanes[key].length) {
      state.motion.lanes[key] = cards.slice(0,4).map(x=>({label:x.type, headline:x.text, body:x.body}));
    }
  }
  state.motion.footerCards = cards.slice(0,12);
  state.motion.capsules = cards.slice(0,8).map(x=>({icon:x.source==="news"?"🚨":x.source==="chart"?"🎵":x.source==="growth"?"❤️":"✨",title:x.type,text:x.text}));
  return state;
}


function broadcastNewsItems(core){
  const themePayload = getThemePayload(core);
  const active = themePayload.activeTheme || "fredagsbar";
  const manual = (core.broadcastNews || []).filter(x => x && x.active !== false).filter(x => !x.theme || x.theme === "all" || x.theme === active);
  const fallbackNews = publicNewsItems(core).map((x,i)=>({id:"site-news-"+i,active:true,theme:"all",label:x.category||"NEWS",text:x.title||"",priority:50+i}));
  const chart = core.weeklyListeningChart || core.top20Chart || {items:[]};
  const top = (chart.items||[])[0];
  const theme = themePayload.theme || {};
  const auto = [
    top ? {id:"auto-top20",active:true,theme:"all",label:"TOP 20",text:`#1 ${top.artist||""} – ${top.title||""}`.trim(),priority:20} : null,
    {id:"auto-theme",active:true,theme:"all",label:theme.title||"THEME",text:theme.mood||"Broadcast Cloud",priority:30}
  ].filter(Boolean);
  return [...manual, ...auto, ...fallbackNews]
    .filter(x=>x.text)
    .sort((a,b)=>(Number(a.priority||99)-Number(b.priority||99)))
    .slice(0,24);
}


function applyV814HybridLayout(state, core){
  const live = state.live || {};
  const show = state.show || {};
  const visual = state.visual || {};
  const chartItems = (state.chart && state.chart.items) || [];
  const top = chartItems[0] || {};
  const pick = chartItems.find(x=>x.folsoePick) || chartItems[1] || top;
  const news = state.broadcastNews || state.websiteNews || [];
  const station = core.station || {};
  const requests = core.requests || [];
  state.layout = {version:"V814.4 PRO MUSIC TV CHAT POLISH",topbar:"logo-news-clock",centerClear:true,footerTicker:true,box4LockedToChat:true,bottomStack:true};
  state.motion = state.motion || {}; state.motion.layout = "v814-bottom-stacked-hybrid"; state.motion.rotationMs = 8000;
  state.motion.lanes = {
    box1:[
      {label:"FOLLOW GOAL", headline:`${live.followers||station.followersCurrent||0}/${live.followersGoal||station.followersGoal||1000} followers`, body:"Help DJ FOLSOE grow"},
      {label:"LIVE STATUS", headline: live.isLive ? "LIVE NOW" : "OFFLINE", body:`${live.viewers||0} viewers · ${live.category||"Music"}`},
      {label:"SUB JOURNEY", headline:`${live.subsToday||station.subsToday||0} subs today`, body:"Follow · Subscribe · Bits · Share the love"},
      {label:"HYPE METER", headline:`${Math.min(100, Math.round(((live.followers||station.followersCurrent||0)/(live.followersGoal||station.followersGoal||1000))*100))}%`, body:"Community energy is building"}
    ],
    box2:[
      {label:"PROGRAM", headline:show.title||"DJ FOLSOE LIVE", body:`${show.day||""} ${show.time||""}`.trim() || "Broadcast Cloud schedule"},
      {label:"THEME", headline:visual.title||"DJ FOLSOE", body:visual.mood||"Theme Engine active"},
      {label:"NEXT SHOW", headline:show.nextTitle||"Stay tuned", body:"More shows, music and community"},
      {label:"THIS WEEK", headline:"Broadcast plan", body:"Shows and times are controlled from admin"}
    ],
    box3:[
      {label:top.rank ? `TOP 20 #${top.rank}` : "TOP 20", headline:top.artist||"FOLSOE Chart", body:top.title||"Weekly Listening Chart"},
      {label:"FOLSOE PICK", headline:pick.artist||"DJ FOLSOE", body:pick.title||"Pick of the week"},
      {label:"NEW ENTRY", headline:(chartItems.find(x=>String(x.status||"").toUpperCase()==="NEW")||top).artist||"New music", body:(chartItems.find(x=>String(x.status||"").toUpperCase()==="NEW")||top).title||"Fresh music"},
      {label:"LATEST REQUEST", headline:requests[0] ? (requests[0].artist||requests[0].user||"Request") : "Requests open", body:requests[0] ? (requests[0].title||requests[0].text||"") : "Send your song request"}
    ],
    box4:[
      {label:"LIVE CHAT", headline:"Chat is live", body:"Messages, emotes and community highlights"},
      {label:"CHAT HIGHLIGHT", headline:"Drop some love", body:"Be active and shape the show"},
      {label:"FIRST CHATTER", headline:"Welcome in", body:"First-time chatters get the spotlight"},
      {label:"EMOTE ENERGY", headline:"Spam the love", body:"Twitch emotes belong here"}
    ]
  };
  const top20Ticker = chartItems.slice(0,8).map(x=>`TOP20 #${x.rank} ${x.artist} – ${x.title}`);
  const newsTicker = (state.topbarNews || news.map(x=>`${x.label||x.category||"NEWS"} · ${x.text||x.title||""}`)).slice(0,10);
  const requestTicker = requests.slice(0,5).map(r=>`REQUEST ${r.user?("@"+r.user+" "):""}${r.artist? r.artist+" – ":""}${r.title||r.text||""}`);
  state.footerTicker = [
    top.artist ? `TOP20 #1 ${top.artist} – ${top.title}` : "FOLSOE Weekly Listening Chart",
    pick.title ? `FOLSOE PICK ${pick.artist||""} – ${pick.title}` : "",
    `FOLLOW GOAL ${live.followers||station.followersCurrent||0}/${live.followersGoal||station.followersGoal||1000}`,
    show.title ? `NEXT / NOW ${show.title} ${show.time||""}` : "",
    ...(requestTicker.length ? requestTicker : ["REQUESTS OPEN"]),
    ...top20Ticker.slice(1,4), ...newsTicker.slice(0,4)
  ].filter(Boolean);
  state.chat = {locked:true,title:"LIVE CHAT",placeholder:[{user:"DJ FOLSOE",text:"Velkommen i chatten ❤️"},{user:"Community",text:"Requests, emotes og god energi"},{user:"System",text:"Chatbox låst til box 4"}]};
  return state;
}


function safeArr(x){ return Array.isArray(x) ? x : []; }
function num(v, fallback){ v=Number(v); return Number.isFinite(v) ? v : fallback; }
function buildV814ContentPayload(core){
  core = core || {};
  const station = core.station || {};
  const themePayload = (typeof getThemePayload === "function") ? getThemePayload(core) : {activeTheme:"fredagsbar", theme:{title:"FREDAGSBAR", emoji:"🍺", mood:"Weekend starts here", primary:"#ffd166", secondary:"#ff4d6d", accent:"#ff9f1c"}};
  const theme = themePayload.theme || {};
  const schedule = safeArr(core.schedule);
  const show = (typeof currentScheduleShow === "function") ? currentScheduleShow(core) : (schedule[0] || {});
  const chart = core.weeklyListeningChart || core.top20Chart || core.top20 || {items:[]};
  const chartItems = safeArr(chart.items);
  const top = chartItems[0] || {};
  const pick = chartItems.find(x=>x && (x.folsoePick || x.pick === true || String(x.pick||"").toLowerCase()==="yes")) || chartItems[1] || top;
  const requests = safeArr(core.requests);
  const rawNews = (typeof broadcastNewsItems === "function") ? broadcastNewsItems(core) : safeArr(core.broadcastNews);
  const newsItems = rawNews.length ? rawNews : [{label:"NEWS", text:"DJ FOLSOE Broadcast Cloud is live"}];

  const followers = num(station.followersCurrent, 870);
  const goal = num(station.followersGoal, 1000);
  const viewers = num(station.viewers, 0);
  const subs = num(station.subsToday, 0);
  const bits = num(station.bitsToday, 0);
  const toGo = Math.max(0, goal - followers);
  const pct = Math.max(0, Math.min(100, Math.round((followers / Math.max(1, goal)) * 100)));

  const live = {
    isLive:Boolean(station.live),
    viewers,
    followers,
    followersGoal:goal,
    subsToday:subs,
    bitsToday:bits,
    title:station.streamTitle || "",
    category:station.category || "Music"
  };

  const visual = {
    primary:theme.primary || (theme.colors && theme.colors[0]) || "#ffd166",
    secondary:theme.secondary || (theme.colors && theme.colors[1]) || "#00d4ff",
    accent:theme.accent || (theme.colors && theme.colors[2]) || "#ff2e93",
    title:theme.title || show.show || show.title || "DJ FOLSOE",
    emoji:theme.emoji || "",
    mood:theme.mood || theme.slogan || "Broadcast Cloud"
  };

  const showState = {
    day:show.day || "",
    time:show.time || "",
    title:show.show || show.title || visual.title || "DJ FOLSOE LIVE",
    description:show.description || visual.mood || ""
  };

  const topbarNews = newsItems.map(x => `${x.label || x.category || "NEWS"} · ${x.text || x.title || ""}`).filter(Boolean);

  const box1 = [
    {label:"FOLLOW GOAL", headline:`${followers}/${goal} followers`, body:`${pct}% complete · ${toGo} to go`},
    {label:"LIVE STATUS", headline:live.isLive ? "LIVE NOW" : "OFFLINE", body:`${viewers} viewers · ${live.category}`},
    {label:"TODAY", headline:`${subs} subs · ${bits} bits`, body:"Support keeps the broadcast growing"},
    {label:"HYPE METER", headline:`${pct}%`, body:"Community energy is building"}
  ];
  const box2 = [
    {label:"PROGRAM", headline:showState.title, body:`${showState.day} ${showState.time}`.trim() || showState.description || "Broadcast Cloud schedule"},
    {label:"THEME", headline:`${visual.emoji ? visual.emoji + " " : ""}${visual.title}`.trim(), body:visual.mood},
    {label:"NEXT SHOW", headline:schedule[1] ? (schedule[1].show || schedule[1].title || "Next show") : "Stay tuned", body:schedule[1] ? `${schedule[1].day||""} ${schedule[1].time||""}`.trim() : "More music is coming"},
    {label:"THIS WEEK", headline:"Broadcast plan", body:"Shows and content are controlled from admin"}
  ];
  const box3 = [
    {label:top.rank ? `TOP 20 #${top.rank}` : "TOP 20", headline:top.artist || "FOLSOE Chart", body:top.title || "Weekly Listening Chart"},
    {label:"FOLSOE PICK", headline:pick.artist || "DJ FOLSOE", body:pick.title || "Pick of the week"},
    {label:"NEW ENTRY", headline:(chartItems.find(x=>String(x.status||"").toUpperCase()==="NEW")||top).artist || "New music", body:(chartItems.find(x=>String(x.status||"").toUpperCase()==="NEW")||top).title || "Fresh music"},
    {label:"LATEST REQUEST", headline:requests[0] ? (requests[0].artist || requests[0].user || "Request") : "Requests open", body:requests[0] ? (requests[0].title || requests[0].text || "") : "Send your song request"}
  ];
  const box4 = [
    {label:"LIVE CHAT", headline:"Chat is live", body:"Messages, emotes and community highlights"},
    {label:"CHAT HIGHLIGHT", headline:"Drop some love", body:"Be active and shape the show"},
    {label:"FIRST CHATTER", headline:"Welcome in", body:"First-time chatters get the spotlight"},
    {label:"EMOTE ENERGY", headline:"Spam the love", body:"Twitch emotes belong here"}
  ];

  const footerTicker = [
    top.artist ? `TOP20 #${top.rank||1} ${top.artist} – ${top.title||""}` : "FOLSOE Weekly Listening Chart",
    pick.title ? `FOLSOE PICK ${pick.artist||""} – ${pick.title}` : "",
    `FOLLOW GOAL ${followers}/${goal}`,
    showState.title ? `NOW/NEXT ${showState.title} ${showState.time||""}` : "",
    requests[0] ? `REQUEST ${requests[0].artist?requests[0].artist+" – ":""}${requests[0].title||requests[0].text||""}` : "REQUESTS OPEN",
    ...chartItems.slice(1,5).map(x=>`TOP20 #${x.rank} ${x.artist} – ${x.title}`),
    ...topbarNews.slice(0,5)
  ].filter(Boolean);

  return {
    ok:true,
    version:"V814.4 PRO MUSIC TV CHAT POLISH",
    overlay:"V814.4 PRO MUSIC TV CHAT POLISHroadcast Hybrid Engine",
    brand:"DJ FOLSOE",
    apiTime:new Date().toISOString(),
    layout:{centerClear:true,bottomStack:true,box4LockedToChat:true,footerTicker:true},
    theme:themePayload,
    visual,
    live,
    show:showState,
    chart:{title:chart.title || "FOLSOE Weekly Listening Chart", items:chartItems.slice(0,20), topTrack:top},
    topbarNews,
    footerTicker,
    motion:{
      layout:"v814-bottom-stacked-hybrid",
      rotationMs:8000,
      lanes:{box1,box2,box3,box4}
    },
    chat:{
      locked:true,
      placeholder:[
        {user:"DJ FOLSOE", text:"Velkommen i chatten ❤️"},
        {user:"Community", text:"Requests, emotes og god energi"},
        {user:"System", text:"Chatbox låst til box 4"}
      ]
    }
  };
}


function enhanceV8142Payload(state, core){
  core = core || {};
  const station = core.station || {};
  const chartItems = (state.chart && state.chart.items) || [];
  const news = state.topbarNews || [];
  const requests = Array.isArray(core.requests) ? core.requests : [];
  const schedule = Array.isArray(core.schedule) ? core.schedule : [];
  const live = state.live || {};
  const visual = state.visual || {};
  const top = chartItems[0] || {};
  const pick = chartItems.find(x=>x.folsoePick || x.pick === true || String(x.pick||"").toLowerCase()==="yes") || chartItems[1] || top;

  state.version = "V814.4 PRO MUSIC TV CHAT POLISH";
  state.layout = Object.assign({}, state.layout || {}, {
    boxNumbersRemoved:true,
    box4LockedToRealTwitchChat:true,
    tvStationGraphics:true
  });

  state.twitchChat = {
    channel: (core.twitchChannel || core.channel || "djfolsoe").toLowerCase(),
    enabled: true,
    method: "twitch-irc-websocket-anonymous",
    box: "box4"
  };

  state.motion = state.motion || {};
  state.motion.lanes = state.motion.lanes || {};

  state.motion.lanes.box1 = [
    {label:"FOLLOW JOURNEY", headline:`${live.followers||station.followersCurrent||0}/${live.followersGoal||station.followersGoal||1000} followers`, body:"Road to the next DJ FOLSOE milestone"},
    {label:"LIVE DATA", headline:`${live.viewers||station.viewers||0} viewers`, body:`${live.category||station.category||"Music"} · ${live.isLive ? "Live now" : "Offline"}`},
    {label:"SUPPORT STATUS", headline:`${live.subsToday||station.subsToday||0} subs · ${live.bitsToday||station.bitsToday||0} bits`, body:"Follows, subs and bits help build the broadcast"},
    {label:"COMMUNITY GOAL", headline:"Grow the channel", body:"Follow · Share · Chat · Request songs"}
  ];

  state.motion.lanes.box2 = [
    {label:"ON AIR", headline:(state.show&&state.show.title)||visual.title||"DJ FOLSOE LIVE", body:(state.show&&((state.show.day||"")+" "+(state.show.time||"")).trim())||"Program controlled from admin"},
    {label:"ACTIVE THEME", headline:`${visual.emoji||""} ${visual.title||"DJ FOLSOE"}`.trim(), body:visual.mood||"Theme Engine"},
    {label:"NEXT SHOW", headline:schedule[1] ? (schedule[1].show||schedule[1].title||"Next show") : "Next show", body:schedule[1] ? `${schedule[1].day||""} ${schedule[1].time||""}`.trim() : "Add more schedule in admin"},
    {label:"BROADCAST PLAN", headline:"Music TV from Denmark", body:"All show data comes from folsoetv.dk admin"}
  ];

  state.motion.lanes.box3 = [
    {label:top.rank ? `TOP 20 #${top.rank}` : "TOP 20", headline:top.artist||"FOLSOE Chart", body:top.title||"Weekly Listening Chart"},
    {label:"FOLSOE PICK", headline:pick.artist||"DJ FOLSOE", body:pick.title||"Pick of the week"},
    {label:"CHART DATA", headline:`${chartItems.length||20} tracks`, body:"Weekly listening chart from admin"},
    {label:"LATEST REQUEST", headline:requests[0] ? (requests[0].artist||requests[0].user||"Request") : "Requests open", body:requests[0] ? (requests[0].title||requests[0].text||"") : "Use chat to request music"}
  ];

  // box4 is not rotated with static content anymore. Frontend uses real Twitch chat.
  state.motion.lanes.box4 = [
    {label:"LIVE TWITCH CHAT", headline:"Connected to chat", body:"Showing Twitch messages 1:1 from chat"}
  ];

  const top20Ticker = chartItems.slice(0,10).map(x=>`TOP20 #${x.rank} ${x.artist} – ${x.title}`);
  const reqTicker = requests.slice(0,5).map(r=>`REQUEST ${r.user?("@"+r.user+" "):""}${r.artist? r.artist+" – ":""}${r.title||r.text||""}`);
  state.footerTicker = [
    top.artist ? `TOP20 #${top.rank||1} ${top.artist} – ${top.title||""}` : "FOLSOE WEEKLY LISTENING CHART",
    pick.title ? `FOLSOE PICK ${pick.artist||""} – ${pick.title}` : "",
    `FOLLOW GOAL ${live.followers||station.followersCurrent||0}/${live.followersGoal||station.followersGoal||1000}`,
    ...reqTicker,
    ...top20Ticker.slice(1,6),
    ...news.slice(0,6)
  ].filter(Boolean);

  return state;
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return okOptions();

    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";

    try {
      if (path === "/api/broadcast-news") {
        const core = await getCore(env);
        if (request.method === "GET") return json({ ok:true, version:"V814.4 PRO MUSIC TV CHAT POLISH", items:broadcastNewsItems(core), raw:core.broadcastNews||[] });
        if (request.method === "POST") {
          if (!isAdmin(request, env)) return json({ error:"Unauthorized" }, 401);
          const body = await request.json();
          core.broadcastNews = Array.isArray(body.items) ? body.items : [];
          const saved = await putCore(env, core);
          return json({ ok:true, items:broadcastNewsItems(saved), raw:saved.broadcastNews||[] });
        }
      }

      if (path === "/api/theme") {
        const core = await getCore(env);
        if (request.method === "GET") return json(getThemePayload(core));
        if (request.method === "POST") {
          if (!isAdmin(request, env)) return json({ error:"Unauthorized" }, 401);
          const body = await request.json();
          core.themeEngine = core.themeEngine || {};
          core.themeEngine.activeTheme = normalizeThemeName(body.theme || body.activeTheme);
          core.themeEngine.themes = DJF_THEMES;
          const saved = await putCore(env, core);
          return json({ ok:true, theme:getThemePayload(saved) });
        }
      }

      if (path === "/api/overlay-health") {
        const core = await getCore(env);
        return json({ ok:true, version:"V814.4 PRO MUSIC TV CHAT POLISH", hasCore:!!core, hasChart:!!(core.weeklyListeningChart||core.top20Chart), hasNews:!!core.broadcastNews });
      }

      if (path === "/api/chat-profile") {
        const login = (url.searchParams.get("login") || "").toLowerCase().replace(/[^a-z0-9_]/g, "");
        if (!login) return json({ ok:false, error:"Missing login" }, 400);
        try {
          if (!env.TWITCH_CLIENT_ID || !env.TWITCH_ACCESS_TOKEN) return json({ ok:false, login, avatar:"" });
          const token = String(env.TWITCH_ACCESS_TOKEN || "").startsWith("Bearer ") ? String(env.TWITCH_ACCESS_TOKEN).slice(7) : env.TWITCH_ACCESS_TOKEN;
          const r = await fetch("https://api.twitch.tv/helix/users?login=" + encodeURIComponent(login), {
            headers: { "Client-ID": env.TWITCH_CLIENT_ID, "Authorization": "Bearer " + token }
          });
          const j = await r.json();
          const u = j && j.data && j.data[0];
          return json({ ok:!!u, login, displayName:u?.display_name || login, avatar:u?.profile_image_url || "" });
        } catch (e) {
          return json({ ok:false, login, avatar:"", error:e.message || "profile error" });
        }
      }

      if (path === "/api/overlay/v170-state") {
        const core = await getCore(env);
        return json(enhanceV8142Payload(buildV814ContentPayload(core), core));
      }

      if (path === "/api/stable-status") {
        const core = await getCore(env);
        return json({ok:true,version:"V814.4 PRO MUSIC TV CHAT POLISH",brand:"DJ FOLSOE",frontendBinding:true,stableRelease:true,cloudDataVersion: core.broadcastCore && core.broadcastCore.version,time:new Date().toISOString()});
      }

      if (path === "/api/health") {
        return json({ ok: true, service: "DJ FOLSOE V814.4 PRO MUSIC TV CHAT POLISHorker", time: new Date().toISOString() });
      }

      if (path === "/api/admin/validate") {
        if (!isAdmin(request, env)) return json({ ok: false, error: "Unauthorized" }, 401);
        return json({ ok: true, admin: true, service: "DJ FOLSOE V814.4 PRO MUSIC TV CHAT POLISHdmin" });
      }

      if (path === "/api/seed") {
        if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
        if (!isAdmin(request, env)) return json({ error: "Unauthorized" }, 401);
        const existing = await getCore(env);
        const requests = await getRequests(env);
        existing.requests = requests;
        const saved = await putCore(env, existing);
        return json({ ok: true, seeded: true, data: saved });
      }


      if (path === "/api/newsroom") {
        const core = await getCore(env);
        if (request.method === "GET") {
          if (url.searchParams.get("refresh") === "1") return json(await collectNewsroom(env));
          return json(core.unifiedNewsroom || { version:"V814.4 PRO MUSIC TV CHAT POLISH", sources:[], items:[] });
        }
        if (request.method === "POST") {
          if (!isAdmin(request, env)) return json({ error:"Unauthorized" }, 401);
          const newsroom = await request.json();
          core.unifiedNewsroom = newsroom;
          const saved = await putCore(env, core);
          return json({ ok:true, newsroom:saved.unifiedNewsroom });
        }
      }

      if (path === "/api/newsroom/refresh") {
        if (!isAdmin(request, env)) return json({ error:"Unauthorized" }, 401);
        return json({ ok:true, newsroom: await collectNewsroom(env) });
      }

      if (path === "/api/admin/force-branding") {
        if (!isAdmin(request, env)) return json({ error:"Unauthorized" }, 401);
        let core = await getCore(env);
        core = forceBrandingPatch(core);
        const saved = await putCore(env, core);
        return json({ ok:true, message:"Branding forced into KV", core:saved });
      }

      if (path === "/api/broadcast-core") {
        if (request.method === "GET") {
          const core = await getCore(env);
          const requests = await getRequests(env);
          core.requests = requests;
          return json(core);
        }
        if (request.method === "POST") {
          if (!isAdmin(request, env)) return json({ error: "Unauthorized" }, 401);
          const body = await request.json();
          const saved = await putCore(env, body);
          return json({ ok: true, data: saved });
        }
      }

      if (path === "/api/chart-lab") {
        const core = await getCore(env);
        if (request.method === "GET") return json(core.chartLab || { candidates: [], method: { folsoeListening:45, danishCharts:20, edmTrend:15, spotify:15, viewerRequests:5 }});
        if (request.method === "POST") {
          if (!isAdmin(request, env)) return json({ error: "Unauthorized" }, 401);
          const lab = await request.json();
          core.chartLab = lab;
          const saved = await putCore(env, core);
          return json({ ok:true, chartLab:saved.chartLab });
        }
      }

      if (path === "/api/chart-lab/calculate") {
        if (!isAdmin(request, env)) return json({ error: "Unauthorized" }, 401);
        const core = await getCore(env);
        const lab = core.chartLab || { candidates: [], method: { folsoeListening:45, danishCharts:20, edmTrend:15, spotify:15, viewerRequests:5 } };
        const weights = lab.method || { folsoeListening:45, danishCharts:20, edmTrend:15, spotify:15, viewerRequests:5 };
        const calc = (x) => {
          const s = x.scores || {};
          return Math.round((Number(s.folsoeListening||0)*weights.folsoeListening + Number(s.danishCharts||0)*weights.danishCharts + Number(s.edmTrend||0)*weights.edmTrend + Number(s.spotify||0)*weights.spotify + Number(s.viewerRequests||0)*weights.viewerRequests)/100);
        };
        const filled = (lab.candidates || []).filter(x => x.artist || x.title).map(x => ({...x, points: calc(x)})).sort((a,b)=>(b.points||0)-(a.points||0));
        filled.forEach((x,i)=>{ x.rank=i+1; const lw=Number(x.lastWeek); x.status=String(x.lastWeek).toUpperCase()==="NEW"||!x.lastWeek||x.lastWeek==="-"?"NEW":(!isNaN(lw)?(lw>x.rank?"UP":lw<x.rank?"DOWN":"SAME"):"SAME"); x.weeks=x.status==="NEW"?1:Number(x.weeks||1)+1; x.peak=Math.min(Number(x.peak||x.rank),x.rank); });
        lab.candidates = [...filled, ...(lab.candidates||[]).filter(x=>!(x.artist||x.title))].slice(0,40);
        const top = filled.slice(0,20).map((x,i)=>({rank:i+1,lastWeek:x.lastWeek,artist:x.artist,title:x.title,status:x.status,points:x.points,weeks:x.weeks,peak:x.peak,genre:x.genre,folsoePick:!!x.pick,cover:x.cover,youtube:x.youtube,scores:x.scores}));
        core.chartLab = lab;
        core.weeklyListeningChart = { ...(core.weeklyListeningChart||{}), title:"FOLSOE Weekly Listening Chart", method:weights, items:top };
        core.top20Chart = core.weeklyListeningChart;
        core.top20 = top.map(x => `${x.artist} - ${x.title}`);
        const saved = await putCore(env, core);
        return json({ ok:true, chartLab:saved.chartLab, chart:saved.weeklyListeningChart });
      }

      if (path === "/api/weekly-listening-chart") {
        const core = await getCore(env);
        if (request.method === "GET") return json(core.weeklyListeningChart || core.top20Chart || DEFAULT_DATA.top20Chart);
        if (request.method === "POST") {
          if (!isAdmin(request, env)) return json({ error: "Unauthorized" }, 401);
          const chart = await request.json();
          core.weeklyListeningChart = chart;
          core.top20Chart = chart;
          core.top20 = (chart.items || []).filter(x => x.artist || x.title).map(x => `${x.artist || ""} - ${x.title || ""}`.replace(/^ - /,"").replace(/ - $/,""));
          const saved = await putCore(env, core);
          return json({ ok: true, chart: saved.weeklyListeningChart });
        }
      }

      if (path === "/api/chart/calculate") {
        if (!isAdmin(request, env)) return json({ error: "Unauthorized" }, 401);
        const core = await getCore(env);
        const chart = core.weeklyListeningChart || core.top20Chart || DEFAULT_DATA.top20Chart;
        const weights = chart.method || { folsoeListening:45, danishCharts:20, edmTrend:15, spotify:15, viewerRequests:5 };
        chart.items = (chart.items || []).map((x, idx) => {
          const s = x.scores || {};
          x.points = Math.round(Object.keys(weights).reduce((sum,k)=>sum + (Number(s[k] || 0) * Number(weights[k] || 0)), 0));
          return x;
        }).sort((a,b)=>(b.points||0)-(a.points||0)).map((x, idx) => {
          x.rank = idx + 1;
          const lw = Number(x.lastWeek);
          if (String(x.lastWeek).toUpperCase() === "NEW" || !x.lastWeek) x.status = "NEW";
          else if (!isNaN(lw)) x.status = lw > x.rank ? "UP" : lw < x.rank ? "DOWN" : "SAME";
          x.weeks = String(x.status).toUpperCase() === "NEW" ? 1 : Number(x.weeks || 0) + 1;
          x.peak = Math.min(Number(x.peak || x.rank), x.rank);
          return x;
        });
        core.weeklyListeningChart = chart;
        core.top20Chart = chart;
        const saved = await putCore(env, core);
        return json({ ok:true, chart:saved.weeklyListeningChart });
      }

      if (path === "/api/chart") {
        const core = await getCore(env);
        if (request.method === "GET") return json(core.top20Chart || DEFAULT_DATA.top20Chart);
        if (request.method === "POST") {
          if (!isAdmin(request, env)) return json({ error: "Unauthorized" }, 401);
          const chart = await request.json();
          core.top20Chart = chart;
          core.top20 = (chart.items || []).filter(x => x.artist || x.title).map(x => `${x.artist || ""} - ${x.title || ""}`.replace(/^ - /,"").replace(/ - $/,""));
          const saved = await putCore(env, core);
          return json({ ok: true, chart: saved.top20Chart });
        }
      }

      if (path === "/api/requests") {
        if (request.method === "GET") return json(await getRequests(env));
        if (request.method === "POST") {
          const body = await request.json();
          const requests = await getRequests(env);
          const item = {
            id: crypto.randomUUID(),
            name: String(body.name || "Viewer").slice(0, 80),
            song: String(body.song || "").slice(0, 200),
            status: body.status || "new",
            createdAt: new Date().toISOString()
          };
          if (!item.song) return json({ error: "Missing song" }, 400);
          requests.unshift(item);
          await putRequests(env, requests.slice(0, 500));
          return json({ ok: true, request: item });
        }
        if (request.method === "DELETE") {
          if (!isAdmin(request, env)) return json({ error: "Unauthorized" }, 401);
          await putRequests(env, []);
          return json({ ok: true, requests: [] });
        }
      }

      if (path === "/api/twitch-profile") {
        const profile = await twitchProfile(env);
        return json(profile);
      }

      if (path === "/api/twitch-full") {
        const pkg = await fullTwitchPackage(env);
        const core = await getCore(env);
        core.twitchProfile = pkg.profile || pkg;
        core.twitchLive = pkg.live || {};
        core.twitchChannel = pkg.channel || {};
        core.twitchVideos = pkg.videos || [];
        core.twitchClips = pkg.clips || [];
        core.broadcastCore = core.broadcastCore || {};
        core.broadcastCore.lastTwitchSync = new Date().toISOString();
        await putCore(env, core);
        return json(pkg);
      }

      if (path === "/api/twitch-live") {
        const live = await twitchLive(env);
        const core = await getCore(env);
        core.station = core.station || {};
        core.station.live = live.live;
        core.station.viewers = live.viewers || 0;
        core.station.streamTitle = live.title || "";
        core.station.category = live.category || "";
        core.station.startedAt = live.startedAt || "";
        await putCore(env, core);
        return json(live);
      }

      return json({ error: "Not found", path }, 404);
    } catch (err) {
      return json({ error: err.message || "Worker error" }, 500);
    }
  }
};
