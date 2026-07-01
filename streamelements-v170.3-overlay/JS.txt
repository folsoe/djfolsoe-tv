
/* DJ FOLSOE NETWORK V922.3 · NO CONSOLE OVERLAY SELF TEST */
function englishTickerText(s){
  return String(s||"")
    .replace(/RETRO HITS\s*·?\s*KLASSIKERE DER ALDRIG DØR/gi,"RETRO HITS · CLASSICS THAT NEVER DIE")
    .replace(/KLASSIKERE DER ALDRIG DØR/gi,"CLASSICS THAT NEVER DIE")
    .replace(/GOD MORGEN TWITCH/gi,"GOOD MORNING TWITCH")
    .replace(/KAFFE, MUSIK OG GOD STEMNING/gi,"COFFEE, MUSIC AND GOOD VIBES")
    .replace(/SENESTE FØLGER/gi,"LATEST FOLLOWER")
    .replace(/SENESTE SUB/gi,"LATEST SUBSCRIBER")
    .replace(/SENESTE BITS/gi,"LATEST CHEER")
    .replace(/SENESTE RAID/gi,"LATEST RAID")
    .replace(/FØLG DJ FOLSOE/gi,"FOLLOW DJ FOLSOE")
    .replace(/MUSIKØNSKER/gi,"REQUESTS")
    .replace(/BESØG FOLSOETV\.DK/gi,"VISIT FOLSOETV.DK");
}


/* V816.20.1.8 - Bottom ticker Twitch pack */

/* V816.20.1.8.1 - Smooth color ticker helpers */
let lastTopTickerKey="";
let lastBottomTickerKey="";

function tickerClean(v){
  if(v == null) return "";
  if(typeof v === "string" || typeof v === "number") return String(v);
  if(typeof v === "object"){
    return v.displayName || v.display_name || v.broadcaster_name || v.broadcaster_login || v.login || v.channel || v.userName || v.user_name || v.name || v.username || "";
  }
  return String(v);
}

function tickerChannelName(v){
  if(!v) return "djfolsoe";
  if(typeof v === "string") return v.replace(/^@/,"").trim() || "djfolsoe";
  if(typeof v === "object"){
    return String(v.broadcaster_login || v.login || v.channel || v.broadcaster_name || v.displayName || "djfolsoe").replace(/^@/,"").trim() || "djfolsoe";
  }
  return "djfolsoe";
}

function tickerEscape(s){
  return String(s||"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
}

function tickerParts(items){
  return (items||[])
    .map(tickerClean)
    .map(x=>englishTickerText(x).replace(/\[object Object\]/g,"DJFOLSOE"))
    .map(x=>x.trim())
    .filter(Boolean);
}

function tickerClassFor(text, i){
  const s = String(text||"").toUpperCase();
  if(s.includes("FOLLOWER GOAL")) return "goal";
  if(s.includes("LATEST FOLLOWER")) return "follower";
  if(s.includes("LATEST SUBSCRIBER")) return "sub";
  if(s.includes("LATEST CHEER")) return "cheer";
  if(s.includes("LATEST RAID")) return "raid";
  if(s.includes("REQUEST")) return "request";
  if(s.includes("TWITCH.TV") || s.includes("FOLLOW DJ FOLSOE")) return "follow";
  if(s.includes("FOLSOETV.DK") || s.includes("VISIT")) return "station";
  if(s.includes("CHAT")) return "chat";
  return ["cyan","pink","yellow","white","orange"][i%5];
}

function renderTickerHtml(parts){
  return parts.map((p,i)=>{
    const cls = tickerClassFor(p,i);
    const label = String(p||"").split("·")[0].trim();
    const rest = String(p||"").includes("·") ? String(p||"").split("·").slice(1).join("·").trim() : "";
    const body = rest ? `<b>${tickerEscape(label)}</b><em>${tickerEscape(rest)}</em>` : `<b>${tickerEscape(p)}</b>`;
    return `<span class="tickerItem ${cls}">${body}</span>`;
  }).join(`<span class="tickerSep">✦</span>`);
}


/* V816.20.1.8.2 - Real StreamElements/Twitch ticker events */
const djfTickerEvents = {
  latestFollower:"",
  latestSub:"",
  latestBits:"",
  latestRaid:""
};

function eventNameFromPayload(ev){
  if(!ev) return "";
  return tickerClean(
    ev.displayName || ev.name || ev.username || ev.nick || ev.user || ev.sender || ev.raider || ev.from || ev.login || ""
  );
}

function saveTickerEvent(type, value){
  value = tickerClean(value).replace(/\[object Object\]/g,"").trim();
  if(!value) return;
  djfTickerEvents[type] = value;
  lastBottomTickerKey = ""; // refresh smooth ticker once, not every 2 sec
  renderTickers();
}

window.addEventListener("onEventReceived", function(obj){
  try{
    const detail = obj.detail || {};
    const listener = String(detail.listener || "").toLowerCase();
    const ev = detail.event || {};
    const data = ev.data || ev;

    if(listener.includes("follower") || listener.includes("follow")){
      saveTickerEvent("latestFollower", eventNameFromPayload(data));
    }

    if(listener.includes("subscriber") || listener.includes("subscription") || listener.includes("sub")){
      saveTickerEvent("latestSub", eventNameFromPayload(data));
    }

    if(listener.includes("cheer") || listener.includes("bit")){
      const name = eventNameFromPayload(data);
      const amount = data.amount || data.bits || data.count || "";
      saveTickerEvent("latestBits", amount ? `${name} · ${amount} bits` : name);
    }

    if(listener.includes("raid")){
      const name = eventNameFromPayload(data);
      const amount = data.amount || data.viewers || data.raiders || "";
      saveTickerEvent("latestRaid", amount ? `${name} · ${amount} viewers` : name);
    }
  }catch(e){
    console.log("DJF ticker event failed", e);
  }
});

function twitchTickerPack(){
  const live = state.live || {};
  const followers = live.followers || 870;
  const goal = live.followersGoal || 1000;
  const toGo = Math.max(0, goal - followers);
  const tc = state.twitchCommunity || {};

  const latestFollower =
    djfTickerEvents.latestFollower ||
    tickerClean(tc.latestFollower?.displayName || tc.latestFollower?.userName || "");

  const latestSub =
    djfTickerEvents.latestSub ||
    tickerClean(tc.latestSub?.displayName || tc.latestSub?.userName || "");

  const latestBits =
    djfTickerEvents.latestBits ||
    "";

  const latestRaid =
    djfTickerEvents.latestRaid ||
    tickerClean(tc.latestRaid?.displayName || tc.latestRaid?.userName || "");

  return [
    "FOLLOW DJ FOLSOE ON TWITCH · twitch.tv/djfolsoe",
    "FOLLOWER GOAL · " + followers + "/" + goal + " · " + toGo + " TO GO",
    latestFollower ? "LATEST FOLLOWER · " + latestFollower : "LATEST FOLLOWER · WAITING FOR NEXT LIVE FOLLOW",
    latestSub ? "LATEST SUBSCRIBER · " + latestSub : "LATEST SUBSCRIBER · WAITING FOR NEXT LIVE SUB",
    latestBits ? "LATEST CHEER · " + latestBits : "LATEST CHEER · WAITING FOR NEXT LIVE CHEER",
    latestRaid ? "LATEST RAID · " + latestRaid : "LATEST RAID · WAITING FOR NEXT LIVE RAID",
    "REQUEST YOUR SONG · !ønske · !request · !Wunsch",
    "JOIN THE CHAT · SAY HELLO · SHARE THE LOVE",
    "VISIT FOLSOETV.DK · SHOWS · TOP 20 · REQUESTS · COMMUNITY"
  ];
}


/* V816.20.1.7.3 - FORCE OBS BACKGROUND */
function forceThemeBackground(key){
  key = String(key || "").toLowerCase();
  if(!key || key === "loading"){ return; }
  const bg = "https://folsoetv.dk/themes/" + key + ".png";
  const root = document.getElementById("djfV170Reborn");
  if(!root) return;

  let layer = document.getElementById("themeBgLayer");
  if(!layer){
    layer = document.createElement("div");
    layer.id = "themeBgLayer";
    root.insertBefore(layer, root.firstChild);
  }

  layer.style.cssText =
    "position:absolute;inset:0;z-index:0;pointer-events:none;" +
    "background-image:linear-gradient(180deg,rgba(0,0,0,.03),rgba(0,0,0,.10)),url('" + bg + "');" +
    "background-position:center center;background-size:cover;background-repeat:no-repeat;" +
    "opacity:1;filter:saturate(1.08) contrast(1.04);";

  root.style.backgroundImage = "url('" + bg + "')";
  root.style.backgroundPosition = "center center";
  root.style.backgroundSize = "cover";
  root.style.backgroundRepeat = "no-repeat";
  root.style.backgroundColor = "transparent";
  document.documentElement.style.setProperty("--theme-bg-url", bg);
}

const API_BASE=(window.DJF_API_BASE||"https://djfolsoe-tv-api.sunefolsoe.workers.dev").replace(/\/$/,"");
const DEFAULT_CHANNEL="djfolsoe";
const OVERLAY_VERSION="V926.2 CLEAN NO DEBUG";
const DJF_SHOW_DEBUG=false;
let overlayDebug={version:OVERLAY_VERSION,api:API_BASE,lastFetch:null,lastTheme:null,lastError:null,source:null};
function renderOverlayDebug(){
  try{ const el=document.getElementById("djfOverlayDebugBadge"); if(el) el.remove(); }catch(e){}
}
function hideOverlayDebugAfter(ms=25000){ try{ const el=document.getElementById("djfOverlayDebugBadge"); if(el) el.remove(); }catch(e){} }

let state=loadingState();
let tick=0;
let lastTheme="";
let chatQueue=[];
let twitchSocket=null;
let twitchConnectedChannel="";
let reconnectTimer=null;
let reconnectAttempts=0;
let chatLive=false;
const profileCache={};

/* V816.7 - Ported from your working JS:
   - preserve <img> tags before escaping
   - parse Twitch IRC emote tags by ranges
   - parse StreamElements emote objects/arrays
   - fallback known Twitch emote words
   - render unicode emoji as proper spans
*/
const V97_TWITCH_GLOBAL_EMOTES = {
  Kappa:"25", PogChamp:"88", LUL:"425618", Kreygasm:"41", "4Head":"354", HeyGuys:"30259",
  BibleThump:"86", WutFace:"28087", DansGame:"33", CoolStoryBob:"123171", SeemsGood:"64138",
  NotLikeThis:"58765", FailFish:"360", ResidentSleeper:"245", Jebaited:"114836", VoHiYo:"81274",
  SwiftRage:"34", Keepo:"1902", FrankerZ:"65", EleGiggle:"4339", PJSalt:"36", RalpherZ:"1900", WTRuck:"114847"
};
const V97_TWITCH_GLOBAL_EMOTES_LOWER = Object.keys(V97_TWITCH_GLOBAL_EMOTES).reduce((m,k)=>{m[k.toLowerCase()]=V97_TWITCH_GLOBAL_EMOTES[k];return m;},{});
const V97_UNICODE_EMOJI_RE = /([\u{1F1E6}-\u{1F1FF}]{2}|[\u{1F300}-\u{1FAFF}]|[\u{2600}-\u{27BF}]\uFE0F?)/gu;

function twitchEmoteImg(emoteId, alt){
  return `<img class="chatEmote" src="https://static-cdn.jtvnw.net/emoticons/v2/${emoteId}/default/dark/3.0" alt="${esc(alt)}">`;
}
function preserveTagsThenEscape(input){
  const tags=[];
  let output=String(input||"").replace(/<img\b[^>]*>/gi, match=>{
    tags.push(match);
    return "___DJF_IMG_"+(tags.length-1)+"___";
  });
  output=esc(output);
  tags.forEach((tag,index)=>{ output=output.replace("___DJF_IMG_"+index+"___", tag); });
  return output;
}
function renderUnicodeEmoji(html){
  return String(html||"").replace(V97_UNICODE_EMOJI_RE, match=>`<span class="chatUnicodeEmoji">${match}</span>`);
}
function renderFallbackTwitchWords(html){
  const imgTags=[];
  let working=String(html||"").replace(/<img\b[^>]*>/gi, match=>{
    imgTags.push(match);
    return "___DJF_IMG_"+(imgTags.length-1)+"___";
  });
  working=working.replace(/\b([A-Za-z][A-Za-z0-9_]{1,30})\b/g, (full,word)=>{
    const id=V97_TWITCH_GLOBAL_EMOTES[word] || V97_TWITCH_GLOBAL_EMOTES_LOWER[String(word).toLowerCase()];
    return id ? twitchEmoteImg(id,word) : full;
  });
  imgTags.forEach((tag,index)=>{ working=working.replace("___DJF_IMG_"+index+"___", tag); });
  return working;
}
function parseTwitchTagEmotes(rawText, tagString){
  try{
    if(!tagString || typeof tagString !== "string") return null;
    const replacements=[];
    tagString.split("/").forEach(group=>{
      const parts=group.split(":");
      const emoteId=parts[0];
      const ranges=(parts[1]||"").split(",");
      ranges.forEach(range=>{
        const nums=range.split("-");
        const start=parseInt(nums[0],10);
        const end=parseInt(nums[1],10);
        if(!isNaN(start)&&!isNaN(end)) replacements.push({start,end,emoteId});
      });
    });
    if(!replacements.length) return null;
    replacements.sort((a,b)=>b.start-a.start);
    let output=String(rawText||"");
    replacements.forEach(rep=>{
      const label=output.substring(rep.start,rep.end+1);
      output=output.substring(0,rep.start)+twitchEmoteImg(rep.emoteId,label)+output.substring(rep.end+1);
    });
    return renderUnicodeEmoji(preserveTagsThenEscape(output));
  }catch(e){return null;}
}
function parseStreamElementsEmotes(rawText, emotes){
  try{
    if(!emotes) return null;
    const raw=String(rawText||"");
    const replacements=[];
    if(Array.isArray(emotes)){
      emotes.forEach(item=>{
        const emoteId=item.id || item.emoteId || item._id;
        const name=item.name || item.code || item.text || "";
        const start=parseInt(item.start ?? item.startIndex ?? item.from,10);
        const end=parseInt(item.end ?? item.endIndex ?? item.to,10);
        if(emoteId && !isNaN(start) && !isNaN(end)){
          replacements.push({start,end,emoteId});
        } else if(emoteId && name){
          V97_TWITCH_GLOBAL_EMOTES[name]=emoteId;
          V97_TWITCH_GLOBAL_EMOTES_LOWER[String(name).toLowerCase()]=emoteId;
        }
      });
    } else if(typeof emotes === "object"){
      Object.keys(emotes).forEach(emoteId=>{
        const positions=emotes[emoteId] || [];
        if(Array.isArray(positions)){
          positions.forEach(pos=>{
            if(typeof pos === "string"){
              const nums=pos.split("-");
              const start=parseInt(nums[0],10);
              const end=parseInt(nums[1],10);
              if(!isNaN(start)&&!isNaN(end)) replacements.push({start,end,emoteId});
            } else if(typeof pos === "object"){
              const start=parseInt(pos.start ?? pos.startIndex ?? pos.from,10);
              const end=parseInt(pos.end ?? pos.endIndex ?? pos.to,10);
              if(!isNaN(start)&&!isNaN(end)) replacements.push({start,end,emoteId});
            }
          });
        }
      });
    }
    if(!replacements.length) return null;
    replacements.sort((a,b)=>b.start-a.start);
    let output=raw;
    replacements.forEach(rep=>{
      const label=raw.substring(rep.start,rep.end+1);
      output=output.substring(0,rep.start)+twitchEmoteImg(rep.emoteId,label)+output.substring(rep.end+1);
    });
    return renderUnicodeEmoji(preserveTagsThenEscape(output));
  }catch(e){return null;}
}
function getRenderedChatFromData(data){
  return data.renderedText || data.renderedMessage || data.messageHtml || data.html || data.rendered || "";
}
function chatHTML(text, data){
  data=data||{};
  const rawText=String(text||"");
  const rendered=getRenderedChatFromData(data);
  if(rendered && String(rendered).includes("<img")){
    return renderUnicodeEmoji(renderFallbackTwitchWords(preserveTagsThenEscape(rendered)));
  }
  const bySE =
    parseStreamElementsEmotes(rawText, data.emotes) ||
    parseStreamElementsEmotes(rawText, data.emote) ||
    parseStreamElementsEmotes(rawText, data.twitchEmotes) ||
    parseStreamElementsEmotes(rawText, data.badges && data.badges.emotes);
  if(bySE) return bySE;
  const byTags =
    parseTwitchTagEmotes(rawText, data.tags && (data.tags.emotes || data.tags["emotes"])) ||
    parseTwitchTagEmotes(rawText, data.emotesRaw) ||
    parseTwitchTagEmotes(rawText, data.rawEmotes) ||
    parseTwitchTagEmotes(rawText, data.emotes);
  if(byTags) return byTags;
  return renderUnicodeEmoji(renderFallbackTwitchWords(esc(rawText)));
}


function q(id){return document.getElementById(id);}
function clip(v,max){v=String(v||"").trim();return v.length>max?v.slice(0,Math.max(0,max-1))+"…":v;}
function esc(s){return String(s||"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));}
function safeArr(a,b){return Array.isArray(a)&&a.length?a:b;}



/* V922 - Website & Overlay Renderer Sync
   Reads the same broadcast-core as the website/admin.
   This keeps the visual overlay layout intact, but prevents it from falling back to old standard data.
*/
function pickCorePayload(payload){
  if(!payload || typeof payload !== 'object') return null;
  return payload.core || payload.data || payload.broadcastCore || payload;
}

function themeMeta(id){
  const key=String(id||'weekend').toLowerCase();
  const map={
    weekend:['WEEKEND','🎉','#00d4ff','#ff4d6d','#ffd166'],
    trance:['TRANCE TUESDAY','💙','#62ecff','#8b5cf6','#ffffff'],
    eurodance:['EURODANCE','⚡','#ff4bd8','#62ecff','#ffe36e'],
    fredagsbar:['FREDAGSBAR','🍻','#6cffb5','#ffd166','#ff4d6d'],
    retro:['RETRO HITS','🪩','#ffe36e','#ff4bd8','#ffffff'],
    popup:['POP UP LIVE','🚨','#ffffff','#ff4d6d','#62ecff'],
    morning:['GOOD MORNING TWITCH','☕','#ffe36e','#6cffb5','#ffffff'],
    summer:['SUMMER','☀️','#ffe36e','#62ecff','#ff4d6d']
  };
  const v=map[key]||map.weekend;
  return {key,title:v[0],emoji:v[1],primary:v[2],secondary:v[3],accent:v[4],mood:v[0]};
}

function broadcastCoreToOverlayState(core){
  const fb=fallbackState();
  core=pickCorePayload(core)||{};
  const tw=core.twitch||{};
  const show=core.show||{};
  const next=core.nextShow||{};
  const theme=core.theme||{};
  const hero=core.hero||{};
  const community=core.community||{};
  const ticker=core.ticker||{};
  const overlay=core.overlay||{};
  const top20=Array.isArray(core.top20)?core.top20:[];
  const themeId=(theme.id||theme.key||core.activeTheme||'weekend').toLowerCase();
  const meta=themeMeta(themeId);
  const followers=Number(tw.followers ?? community.followers ?? 0) || 0;
  const followerGoal=Number(community.followerGoal ?? 1000) || 1000;
  const subs=Number(tw.subs ?? community.subs ?? 0) || 0;
  const subGoal=Number(community.subGoal ?? overlay.subGoal ?? 100) || 100;
  const viewers=Number(tw.viewers ?? show.viewers ?? 0) || 0;
  const live=!!(tw.live || tw.isLive || show.live);
  const mode=String(show.mode || show.state || overlay.status || (live?'LIVE':'OFFLINE')).toUpperCase();
  const showTitle=show.title || show.current || tw.liveTitle || hero.title || overlay.title || 'DJ FOLSOE';
  const description=hero.text || community.text || 'Live DJ shows, song requests, Top 20 countdowns and community energy from Denmark.';
  const tickerText=ticker.text || overlay.infoLine || 'DJ FOLSOE TWITCH · MUSIC STREAMER FROM DENMARK · REQUEST A SONG · TOP 20 · LIVE COMMUNITY';
  const nextLabel=next.show || next.title || 'Next DJ FOLSOE Broadcast';
  const nextTime=next.timeLabel || next.datetime || next.dateTime || 'Announced soon';
  const requestText=community.requestText || overlay.requestText || 'Use !request Artist - Title in Twitch chat';
  const specialEvent=community.specialEvent || overlay.specialEvent || '';
  return normalize({
    theme:{activeTheme:themeId,theme:{key:themeId,title:meta.title,emoji:meta.emoji,desc:meta.mood,bgImage:theme.background||('https://folsoetv.dk/themes/'+themeId+'.png')}},
    visual:{primary:meta.primary,secondary:meta.secondary,accent:meta.accent,title:meta.title,emoji:meta.emoji,mood:theme.title||meta.mood},
    topbarNews:[`${mode} · ${showTitle} · ${meta.title}`],
    footerTicker:[tickerText, specialEvent].filter(Boolean),
    chart:{items:top20.map(x=>({rank:x.rank,artist:x.artist,title:x.title,status:x.status}))},
    live:{followers,followersGoal:followerGoal,viewers,subs,subGoal},
    show:{title:showTitle,description},
    twitchCommunity:{},
    twitchChat:{channel:DEFAULT_CHANNEL},
    motion:{lanes:{
      box1:[
        {label:'LIVE STATUS',headline:live ? `${viewers} viewers` : 'OFFLINE',body:`${followers}/${followerGoal} followers · ${subs}/${subGoal} subs`,icon: live ? '🔴' : '⚫'},
        {label:'FOLLOWER GOAL',headline:`${followers}/${followerGoal} followers`,body:`${Math.max(0,followerGoal-followers)} to go · twitch.tv/djfolsoe`,icon:'📡'},
        {label:'COMMUNITY',headline:`${subs}/${subGoal} subs`,body:requestText,icon:'💜'}
      ],
      box2:[
        {label:'CURRENT SHOW',headline:showTitle,body:description,icon:'📺'},
        {label:'NEXT SHOW',headline:nextLabel,body:nextTime,icon:'⏭️'},
        {label:'THEME',headline:`${meta.emoji} ${theme.title||meta.title}`,body:themeId,icon:'🎨'}
      ],
      box3:[
        ...(top20.length?top20.slice(0,2).map(x=>({label:x.rank?`TOP 20 #${x.rank}`:'TOP 20',headline:x.artist||'DJ FOLSOE',body:x.title||'',icon:'🎵'})):[]),
        {label:'REQUESTS',headline:'Requests open',body:requestText,icon:'🎧'},
        {label:'INFO',headline:overlay.title||showTitle,body:overlay.infoLine||tickerText,icon:'✨'}
      ]
    }}
  });
}

function loadingState(){
  return {
    theme:{activeTheme:"loading",theme:{key:"loading",title:"LOADING BROADCAST CORE",emoji:"📡",desc:"Waiting for admin data",primary:"#62ecff",secondary:"#ff4bd8",accent:"#ffe36e",bgImage:""}},
    visual:{primary:"#62ecff",secondary:"#ff4bd8",accent:"#ffe36e",title:"LOADING BROADCAST CORE",emoji:"📡",mood:"Waiting for /api/broadcast"},
    topbarNews:["LOADING BROADCAST CORE · WAITING FOR API"],
    footerTicker:["LOADING BROADCAST CORE · IF THIS STAYS VISIBLE THE OVERLAY CANNOT REACH THE API"],
    chart:{items:[]},
    live:{followers:0,followersGoal:1000,viewers:0,subs:0,subGoal:100},
    show:{title:"LOADING BROADCAST CORE",description:"Waiting for admin / Twitch data"},
    twitchChat:{channel:DEFAULT_CHANNEL},
    motion:{lanes:{box1:[{label:"API",headline:"Loading broadcast-core",body:"Waiting for Worker",icon:"📡"}],box2:[{label:"THEME",headline:"Not loaded yet",body:"No fallback weekend",icon:"🎨"}],box3:[{label:"STATUS",headline:"Waiting",body:"If this remains, API is blocked",icon:"⚠️"}]}}
  };
}

function fallbackState(){
  return {
    theme:{activeTheme:"weekend",theme:{key:"weekend",title:"WEEKEND VIBES",emoji:"🎉",desc:"Broadcast Cloud",primary:"#00d4ff",secondary:"#ff4d6d",accent:"#ffd166"}},
    visual:{primary:"#00d4ff",secondary:"#ff4d6d",accent:"#ffd166",title:"WEEKEND VIBES",emoji:"🎉",mood:"Broadcast Cloud"},
    topbarNews:["🎉 WEEKEND VIBES · Broadcast Cloud"],
    footerTicker:["TOP20 · REQUESTS · DJ NETWORK · NEWS · COMMUNITY"],
    chart:{items:[{rank:1,artist:"Axwell & Bonn",title:"Whatever Turns You On"},{rank:2,artist:"Hugel, David Guetta",title:"Shine"}]},
    live:{followers:870,followersGoal:1000,viewers:0,subs:0},
    show:{title:"WEEKEND VIBES",description:"Broadcast Cloud"},
    twitchChat:{channel:DEFAULT_CHANNEL},
    motion:{lanes:{
      box1:[
        {label:"FOLLOW JOURNEY",headline:"870/1000 followers",body:"130 to go · 0 viewers",icon:"📡"},
        {label:"LIVE STATUS",headline:"0 viewers",body:"Broadcast Cloud · Twitch Music TV",icon:"👁️"},
        {label:"GOALS",headline:"Help DJ FOLSOE grow",body:"Follow · Chat · Request · Share the love",icon:"💜"}
      ],
      box2:[
        {label:"PROGRAM",headline:"DJ FOLSOE LIVE",body:"Broadcast Cloud schedule",icon:"📺"},
        {label:"ACTIVE THEME",headline:"🎉 WEEKEND VIBES",body:"Maximum music and community",icon:"🎨"},
        {label:"NEXT SHOW",headline:"Next DJ FOLSOE show",body:"Check the website for latest program",icon:"⏭️"}
      ],
      box3:[
        {label:"TOP 20 #1",headline:"Axwell & Bonn",body:"Whatever Turns You On",icon:"🎵"},
        {label:"FOLSOE PICK",headline:"Hugel, David Guetta",body:"Shine",icon:"⭐"},
        {label:"REQUESTS",headline:"Requests open",body:"Use !ønske / !request / !Wunsch in chat",icon:"🎧"}
      ]
    }}
  };
}

function normalize(j){
  const fb=fallbackState();
  const s=(j&&typeof j==="object")?j:{};
  s.theme=s.theme||fb.theme;
  s.visual=Object.assign(fb.visual,s.visual||{});
  s.topbarNews=safeArr(s.topbarNews,fb.topbarNews);
  s.footerTicker=safeArr(s.footerTicker,fb.footerTicker);
  s.chart=s.chart||fb.chart;
  s.live=Object.assign(fb.live,s.live||{});
  s.show=Object.assign(fb.show,s.show||{});
  s.twitchChat=Object.assign(fb.twitchChat,s.twitchChat||{});
  s.motion=s.motion||{lanes:{}};
  s.motion.lanes=s.motion.lanes||{};

  const top=(s.chart.items&&s.chart.items[0])||fb.chart.items[0];
  const pick=(s.chart.items&&s.chart.items[1])||top;
  const v=s.visual, l=s.live;

  s.motion.lanes.box1=safeArr(s.motion.lanes.box1,[
    {label:"FOLLOW JOURNEY",headline:`${l.followers||870}/${l.followersGoal||1000} followers`,body:`${Math.max(0,(l.followersGoal||1000)-(l.followers||870))} to go · ${l.viewers||0} viewers`,icon:"📡"},
    {label:"LIVE STATUS",headline:`${l.viewers||0} viewers`,body:"Broadcast Cloud · Twitch Music TV",icon:"👁️"},
    {label:"GOALS",headline:"Help DJ FOLSOE grow",body:"Follow · Chat · Request · Share the love",icon:"💜"}
  ]);
  s.motion.lanes.box2=safeArr(s.motion.lanes.box2,[
    {label:"PROGRAM",headline:s.show.title||v.title||"DJ FOLSOE LIVE",body:s.show.description||v.mood||"Broadcast Cloud",icon:"📺"},
    {label:"ACTIVE THEME",headline:`${v.emoji||""} ${v.title||"THEME"}`,body:v.mood||"Theme Engine",icon:"🎨"},
    {label:"NEXT SHOW",headline:"Next DJ FOLSOE show",body:"Check the website for latest program",icon:"⏭️"}
  ]);
  s.motion.lanes.box3=safeArr(s.motion.lanes.box3,[
    {label:top.rank?`TOP 20 #${top.rank}`:"TOP 20",headline:top.artist||"FOLSOE Top 20",body:top.title||"Weekly Listening Chart",icon:"🎵"},
    {label:"FOLSOE PICK",headline:pick.artist||"DJ FOLSOE",body:pick.title||"Pick of the week",icon:"⭐"},
    {label:"REQUESTS",headline:"Requests open",body:"Use !ønske / !request / !Wunsch in chat",icon:"🎧"}
  ]);

  return s;
}

function apiCandidates(){
  // V923: Worker JSONP bridge for StreamElements. Fetch is blocked in some SE browser sources.
  // Do NOT use static GitHub JSON files like /api/broadcast-core.json,
  // because they contain static-default/weekend and reset the overlay.
  const bases=[];
  if(API_BASE) bases.push(API_BASE);
  bases.push("https://djfolsoe-tv-api.sunefolsoe.workers.dev");
  const seen={};
  return bases
    .filter(Boolean)
    .map(b=>String(b).replace(/\/$/,""))
    .filter(b=>!seen[b]&&(seen[b]=1))
    .map(b=>b+"/api/broadcast");
}

function jsonpLoad(url, timeoutMs=9000){
  return new Promise((resolve,reject)=>{
    const cb="djfBroadcastCoreJsonp_"+Date.now()+"_"+Math.floor(Math.random()*99999);
    const sep=url.includes("?")?"&":"?";
    const src=url.replace(/\/api\/broadcast(?:\?.*)?$/, "/api/broadcast-jsonp") + sep + "callback=" + encodeURIComponent(cb) + "&ts=" + Date.now();
    let done=false;
    const timer=setTimeout(()=>{
      if(done) return; done=true; cleanup(); reject(new Error("JSONP timeout"));
    }, timeoutMs);
    function cleanup(){
      clearTimeout(timer);
      try{ delete window[cb]; }catch(e){ window[cb]=undefined; }
      const el=document.getElementById(cb); if(el&&el.parentNode) el.parentNode.removeChild(el);
    }
    window[cb]=function(payload){
      if(done) return; done=true; cleanup(); resolve(payload);
    };
    const script=document.createElement("script");
    script.id=cb;
    script.async=true;
    script.src=src;
    script.onerror=function(){ if(done) return; done=true; cleanup(); reject(new Error("JSONP script failed")); };
    document.head.appendChild(script);
  });
}

async function fetchFirstCore(){
  const urls=apiCandidates();
  let lastErr="";
  for(const baseUrl of urls){
    try{
      overlayDebug.source=baseUrl.replace(/\?.*/,"")+" via JSONP";
      renderOverlayDebug();
      const payload=await jsonpLoad(baseUrl);
      const core=pickCorePayload(payload);
      if(!core || typeof core !== "object") throw new Error("No core JSONP payload");
      return {payload,url:baseUrl+" via JSONP"};
    }catch(e){
      lastErr=(baseUrl+" → "+(e&&e.message?e.message:String(e))).slice(0,220);
      overlayDebug.lastError=lastErr;
      renderOverlayDebug();
    }
  }
  throw new Error(lastErr || "No JSONP API candidates worked");
}

async function loadState(){
  try{
    const result=await fetchFirstCore();
    const payload=result.payload;
    const nextState=broadcastCoreToOverlayState(payload);
    const nextTheme=(nextState.theme&&nextState.theme.activeTheme)||"unknown";
    state=nextState;
    overlayDebug.lastFetch=new Date().toLocaleTimeString();
    overlayDebug.lastTheme=nextTheme;
    overlayDebug.lastError=null;
    overlayDebug.source=result.url;
    console.log("V924.2 overlay JSONP core applied", nextTheme, state?.show?.title, payload);
  }catch(e){
    overlayDebug.lastError=String(e&&e.message?e.message:e);
    overlayDebug.source="API FAILED - keeping current visible state";
    console.warn("V924.2 broadcast-core JSONP failed; keeping current overlay state", e);
    state=state||loadingState();
  }
  applyTheme();
  renderAll();
  connectChat();
  renderOverlayDebug();
  hideOverlayDebugAfter();
}
function applyTheme(){
  const key=(state.theme&&state.theme.activeTheme)||"weekend";
  overlayDebug.lastTheme=key;
  if(key!==lastTheme){
    document.body.className="theme-"+key;
    forceThemeBackground(key);
    lastTheme=key;
  }
  const v=state.visual||{};
  document.documentElement.style.setProperty("--a",v.accent||"#ffd166");
  document.documentElement.style.setProperty("--b",v.secondary||"#ff4d6d");
  document.documentElement.style.setProperty("--c",v.primary||"#00d4ff");
  forceThemeBackground(key);
  /* V816.20.1.7 theme background variable */
  /* V816.20.1.7.2 absolute theme url fix */
  const bg=(state.theme&&state.theme.theme&&state.theme.theme.bgImage)||("https://folsoetv.dk/themes/"+key+".png");
  document.documentElement.style.setProperty("--theme-bg", `url("${bg}")`);
  const root=document.getElementById("djfV170Reborn");
  if(root) root.style.setProperty("--theme-bg", `url("${bg}")`);
}

function setStats(id,items){
  const el=q(id+"Stats"); if(!el)return;
  el.innerHTML=(items||[]).slice(0,3).map(x=>`<div class="stat"><span>${clip(x.label,10)}</span><b>${clip(x.value,14)}</b></div>`).join("");
}

function statsFor(box){
  const l=state.live||{}, c=(state.chart&&state.chart.items)||[], v=state.visual||{}, show=state.show||{};
  if(box==="box1") return [
    {label:"Viewers",value:l.viewers||0},
    {label:"Followers",value:(l.followers||870)+"/"+(l.followersGoal||1000)},
    {label:"To go",value:Math.max(0,(l.followersGoal||1000)-(l.followers||870))}
  ];
  if(box==="box2") return [
    {label:"Show",value:show.title||"DJ FOLSOE"},
    {label:"Theme",value:v.title||"Theme"},
    {label:"Mode",value:"Live"}
  ];
  return [
    {label:"Top #1",value:c[0]?c[0].artist:"Chart"},
    {label:"Pick",value:(c[1]||c[0]||{}).title||"Pick"},
    {label:"Tracks",value:c.length||20}
  ];
}

function setCard(box,item){
  q(box+"Label").textContent=clip(item.label||"",24);
  q(box+"Title").textContent=clip(item.headline||item.title||"",34);
  q(box+"Body").textContent=clip(item.body||"",78);
  q(box+"Icon").textContent=item.icon||"•";
  setStats(box,statsFor(box));
  const el=q(box); if(el){el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash");}
}

function renderCards(){
  const lanes=state.motion.lanes;
  const i=tick++;
  setCard("box1",lanes.box1[i%lanes.box1.length]);
  setCard("box2",lanes.box2[i%lanes.box2.length]);
  setCard("box3",lanes.box3[i%lanes.box3.length]);
}

function renderTickers(){
  const topParts = tickerParts(state.topbarNews||[]);
  const bottomParts = tickerParts([...(state.footerTicker||[]), ...twitchTickerPack()]);

  const topKey = topParts.join("||");
  const bottomKey = bottomParts.join("||");

  const topEl = q("topTickerText");
  const bottomEl = q("bottomTickerText");

  if(topEl && topKey !== lastTopTickerKey){
    const topHtml = renderTickerHtml(topParts);
    topEl.innerHTML = topHtml + `<span class="tickerSep">✦</span>` + topHtml;
    document.documentElement.style.setProperty("--topDur",Math.max(28,Math.min(95,topKey.length/4.1))+"s");
    lastTopTickerKey = topKey;
  }

  if(bottomEl && bottomKey !== lastBottomTickerKey){
    const bottomHtml = renderTickerHtml(bottomParts);
    bottomEl.innerHTML = bottomHtml + `<span class="tickerSep">✦</span>` + bottomHtml;
    document.documentElement.style.setProperty("--bottomDur",Math.max(70,Math.min(190,bottomKey.length/4.0))+"s");
    lastBottomTickerKey = bottomKey;
  }
}

function renderAll(){
  renderCards();
  renderTickers();
  renderChatWaiting();
}

function clock(){
  q("clockBox").textContent=new Date().toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"});
}

/* STREAM ELEMENTS CHAT FALLBACK
   If StreamElements exposes chat events to the widget, this catches them even if Twitch IRC is blocked. */
window.addEventListener("onEventReceived", function(obj){
  try{
    const detail=obj.detail||{};
    const listener=String(detail.listener||"").toLowerCase();
    const ev=detail.event||{};
    if(listener.includes("message") || listener.includes("chat")){
      const data=ev.data||ev||{};
      const user=data.displayName||data.nick||data.name||data.username||"CHAT";
      const login=(data.nick||data.username||user||"chat").toLowerCase();
      const text=data.text||data.message||data.renderedText||"";
      if(text) pushChat({user,login,text,html:chatHTML(text,data)});
    }
  }catch(e){console.log("SE chat event parse failed",e);}
});

function htmlFromSEMessage(data,text){
  // Some StreamElements payloads provide rendered html. Use it only if it contains emote images.
  if(data.renderedText && String(data.renderedText).includes("<img")) return String(data.renderedText);
  return esc(text).replace(/([😀-🙏🌀-🗿🚀-🛿☀-⛿✀-➿])/gu,'<span class="chatEmoji">$1</span>');
}

/* TWITCH IRC OVER WEBSOCKET */
function parseTags(raw){
  const tags={};
  if(!raw||raw[0]!=="@")return tags;
  raw.slice(1).split(" ")[0].split(";").forEach(pair=>{
    const [k,v=""]=pair.split("=");
    tags[k]=v;
  });
  return tags;
}

function decodeIrcValue(v){
  return String(v||"").replace(/\\s/g," ").replace(/\\:/g,";").replace(/\\r/g,"\r").replace(/\\n/g,"\n");
}

function emotesToHtml(text,tags){
  const em=tags.emotes||"";
  if(!em)return esc(text).replace(/([😀-🙏🌀-🗿🚀-🛿☀-⛿✀-➿])/gu,'<span class="chatEmoji">$1</span>');
  const ranges=[];
  em.split("/").forEach(group=>{
    const [id,pos]=group.split(":");
    (pos||"").split(",").forEach(p=>{
      const [s,e]=p.split("-").map(Number);
      if(Number.isFinite(s)&&Number.isFinite(e))ranges.push({id,s,e});
    });
  });
  ranges.sort((a,b)=>a.s-b.s);
  let out="",last=0;
  ranges.forEach(r=>{
    out+=esc(text.slice(last,r.s));
    out+=`<img class="chatEmote" src="https://static-cdn.jtvnw.net/emoticons/v2/${r.id}/default/dark/3.0" alt="">`;
    last=r.e+1;
  });
  out+=esc(text.slice(last));
  return out.replace(/([😀-🙏🌀-🗿🚀-🛿☀-⛿✀-➿])/gu,'<span class="chatEmoji">$1</span>');
}

async function getAvatar(login){
  login=String(login||"").toLowerCase().replace(/[^a-z0-9_]/g,"");
  if(!login)return "";
  if(profileCache[login])return profileCache[login];
  try{
    const r=await fetch(API_BASE+"/api/chat-profile?login="+encodeURIComponent(login),{cache:"force-cache"});
    const j=await r.json();
    if(j.avatar){profileCache[login]=j.avatar;return j.avatar;}
  }catch(e){}
  return "";
}

function pushChat(item){
  chatLive=true;
  chatQueue.push(item);
  chatQueue=chatQueue.slice(-10);
  showChat(item);
}

async function showChat(item){
  q("chatUser").textContent=clip(item.user||"CHAT",22);
  q("chatMessage").innerHTML=item.html||chatHTML(item.text||"",{});
  q("chatAvatarFallback").textContent=(item.user||"C").slice(0,1).toUpperCase();
  const img=q("chatAvatarImg"), fb=q("chatAvatarFallback");
  const av=await getAvatar(item.login||item.user);
  if(av){img.src=av;img.style.display="block";fb.style.display="none";}
  else{img.style.display="none";fb.style.display="grid";}
  const card=q("box4"); if(card){card.classList.remove("flash"); void card.offsetWidth; card.classList.add("flash");}
}

function renderChatWaiting(){
  if(chatQueue.length)return;
  const status = twitchSocket && twitchSocket.readyState===1 ? "Connected · waiting for next chat message…" : "Connecting to Twitch chat…";
  showChat({user:"LIVE CHAT",login:"djfolsoe",text:status});
}

function scheduleReconnect(){
  clearTimeout(reconnectTimer);
  const delay=Math.min(30000, 1500 + reconnectAttempts*2500);
  reconnectAttempts++;
  reconnectTimer=setTimeout(()=>{twitchSocket=null;connectChat(true);},delay);
}

function connectChat(force=false){
  const channel=((state.twitchChat&&state.twitchChat.channel)||DEFAULT_CHANNEL).toLowerCase().replace(/^#/,"");
  if(!force && twitchSocket && twitchSocket.readyState===1 && twitchConnectedChannel===channel) return;
  if(twitchSocket && [0,1].includes(twitchSocket.readyState) && twitchConnectedChannel===channel) return;

  twitchConnectedChannel=channel;
  try{
    twitchSocket=new WebSocket("wss://irc-ws.chat.twitch.tv:443");

    twitchSocket.onopen=()=>{
      reconnectAttempts=0;
      // Correct Twitch anonymous IRC order: PASS, NICK, CAP, JOIN
      twitchSocket.send("PASS SCHMOOPIIE");
      twitchSocket.send("NICK justinfan"+Math.floor(10000+Math.random()*89999));
      twitchSocket.send("CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership");
      twitchSocket.send("JOIN #"+channel);
      renderChatWaiting();
    };

    twitchSocket.onmessage=ev=>{
      const raw=String(ev.data||"");
      raw.split("\r\n").filter(Boolean).forEach(line=>{
        if(line.startsWith("PING")){twitchSocket.send("PONG :tmi.twitch.tv");return;}
        if(line.includes("RECONNECT")){try{twitchSocket.close();}catch(e){} scheduleReconnect(); return;}
        if(!line.includes(" PRIVMSG ")) return;

        const t=parseTags(line);
        const msgIndex=line.indexOf(" :");
        const text=msgIndex>=0?line.slice(msgIndex+2):"";
        const login=(line.match(/:([^!]+)!/)||[])[1]||"chat";
        const user=decodeIrcValue(t["display-name"]||login);
        if(!text)return;

        pushChat({user,login,text,html:chatHTML(text,{tags:t,emotes:t.emotes})});
      });
    };

    twitchSocket.onerror=err=>{
      console.log("Twitch IRC websocket error",err);
    };

    twitchSocket.onclose=()=>{
      console.log("Twitch IRC closed - reconnecting");
      scheduleReconnect();
    };
  }catch(e){
    console.log("Twitch connect failed",e);
    scheduleReconnect();
  }
}

// Manual test helper in browser console:
// DJF_TEST_CHAT("Sune", "Hej Kappa 💜")
window.DJF_TEST_CHAT=function(user,text){
  pushChat({user:user||"TEST",login:(user||"test").toLowerCase(),text:text||"Test message 💜",html:esc(text||"Test message 💜").replace(/([😀-🙏🌀-🗿🚀-🛿☀-⛿✀-➿])/gu,'<span class="chatEmoji">$1</span>')});
};

clock();
setInterval(clock,1000);
loadState();
setInterval(loadState,10000);
setInterval(renderCards,8000);
setTimeout(()=>connectChat(true),1000);

window.DJF_TEST_PORT_EMOTES=function(){ DJF_TEST_CHAT("DJFOLSOE","Kappa LUL PogChamp 💜"); };




/* =========================================================
   V900 - Music TV Europe engines
   Keeps topbar, bottom ticker and logo untouched.
   ========================================================= */

function v900Text(v, fallback=""){
  v = tickerClean ? tickerClean(v) : String(v||"");
  return String(v || fallback || "").replace(/Use !ønske \/ !request \/ !Wunsch in chat/gi,"Use !request in chat");
}

function v900Lanes(){
  const l=state.live||{};
  const c=(state.chart&&state.chart.items)||[];
  const v=state.visual||{};
  const show=state.show||{};
  const top=c[0]||{artist:"FOLSOE TOP 20",title:"Weekly countdown"};
  const pick=c[1]||top;
  const followers=l.followers||870;
  const goal=l.followersGoal||1000;
  const toGo=Math.max(0,goal-followers);

  const latestFollower=(state.twitchCommunity&&state.twitchCommunity.latestFollower&&
    (state.twitchCommunity.latestFollower.displayName||state.twitchCommunity.latestFollower.userName)) || djfTickerEvents?.latestFollower || "Waiting for next follow";
  const latestSub=(state.twitchCommunity&&state.twitchCommunity.latestSub&&
    (state.twitchCommunity.latestSub.displayName||state.twitchCommunity.latestSub.userName)) || djfTickerEvents?.latestSub || "Waiting for next sub";
  const latestRaid=(state.twitchCommunity&&state.twitchCommunity.latestRaid&&
    (state.twitchCommunity.latestRaid.displayName||state.twitchCommunity.latestRaid.userName)) || djfTickerEvents?.latestRaid || "Waiting for next raid";

  return {
    story:[
      {label:"NOW PLAYING",headline:v900Text(top.artist,"Music TV"),body:v900Text(top.title,"Live from Denmark"),icon:"🎵"},
      {label:"FOLLOW JOURNEY",headline:`${followers}/${goal} followers`,body:`${toGo} to go · ${l.viewers||0} viewers`,icon:"📡"},
      {label:"LATEST FOLLOWER",headline:v900Text(latestFollower,"Waiting for next follow"),body:"Thank you for joining the DJ FOLSOE community",icon:"💜"},
      {label:"LATEST SUBSCRIBER",headline:v900Text(latestSub,"Waiting for next sub"),body:"Subscriber love keeps the channel growing",icon:"⭐"},
      {label:"LATEST RAID",headline:v900Text(latestRaid,"Waiting for next raid"),body:"DJ network love · welcome raiders",icon:"🚀"},
      {label:"LATEST REQUEST",headline:"Requests open",body:"Use !request in chat and shape the show",icon:"🎧"}
    ],
    featured:[
      {label:"NEXT SHOW",headline:show.title||v.title||"DJ FOLSOE LIVE",body:show.description||v.mood||"Modern Music TV from Denmark",icon:"📺"},
      {label:"ACTIVE THEME",headline:`${v.emoji||""} ${v.title||"MUSIC TV"}`,body:v.mood||"Theme engine locked to the show identity",icon:"🎨"},
      {label:"TOP 20 SPOTLIGHT",headline:`#1 ${v900Text(top.artist,"FOLSOE TOP 20")}`,body:v900Text(top.title,"Weekly countdown"),icon:"🏆"},
      {label:"FOLSOE PICK",headline:v900Text(pick.artist,"DJ FOLSOE PICK"),body:v900Text(pick.title,"Featured track"),icon:"✨"}
    ],
    community:[
      {label:"COMMUNITY GOAL",headline:`${followers}/${goal}`,body:`${Math.round((followers/goal)*100)}% of the next follower milestone`,icon:"📈"},
      {label:"TOP REQUESTER",headline:"Chat decides",body:"Requests and music choices live from the community",icon:"🎙️"},
      {label:"DJ NETWORK",headline:"Live radar",body:"Danish and European DJ friends on the network",icon:"🌍"},
      {label:"CHAT ENERGY",headline:`${l.viewers||0} viewers`,body:"Say hello · use emotes · share the love",icon:"💬"}
    ]
  };
}

function setCard(box,item){
  item=item||{};
  const label=q(box+"Label"), title=q(box+"Title"), body=q(box+"Body"), icon=q(box+"Icon"), badge=q(box+"Badge");
  if(label) label.textContent=clip(item.label||"",32);
  if(title) title.textContent=clip(item.headline||item.title||"", box==="box2"?48:38);
  if(body) body.textContent=clip(item.body||"", box==="box2"?120:96);
  if(icon) icon.textContent=item.icon||"•";
  if(badge) badge.textContent = box==="box1" ? "STORY" : box==="box2" ? "FEATURE" : "COMMUNITY";
  setStats(box,statsFor(box));
  const el=q(box); if(el){el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash");}
}

function statsFor(box){
  const l=state.live||{}, c=(state.chart&&state.chart.items)||[], v=state.visual||{}, show=state.show||{};
  if(box==="box1") return [
    {label:"Viewers",value:l.viewers||0},
    {label:"Followers",value:(l.followers||870)+"/"+(l.followersGoal||1000)},
    {label:"To go",value:Math.max(0,(l.followersGoal||1000)-(l.followers||870))}
  ];
  if(box==="box2") return [
    {label:"Show",value:show.title||v.title||"DJ FOLSOE"},
    {label:"Theme",value:v.title||"Theme"},
    {label:"Mode",value:"Live TV"}
  ];
  return [
    {label:"Goal",value:(l.followers||870)+"/"+(l.followersGoal||1000)},
    {label:"Top #1",value:c[0]?c[0].artist:"Chart"},
    {label:"Chat",value:"Live"}
  ];
}

function renderCards(){
  const lanes=v900Lanes();
  const i=tick++;
  setCard("box1",lanes.story[i%lanes.story.length]);
  setCard("box2",lanes.featured[Math.floor(i/2)%lanes.featured.length]);
  setCard("box3",lanes.community[i%lanes.community.length]);
}


/* =========================================================
   V900.1 - Clean-stage one-card show info engine
   Only box1 is used for info pop. Box4 remains chat.
   ========================================================= */
function v9001InfoLane(){
  const l=state.live||{};
  const c=(state.chart&&state.chart.items)||[];
  const v=state.visual||{};
  const show=state.show||{};
  const top=c[0]||{artist:"FOLSOE TOP 20",title:"Weekly countdown"};
  const pick=c[1]||top;
  const followers=l.followers||870;
  const goal=l.followersGoal||1000;
  const toGo=Math.max(0,goal-followers);
  const title=show.title||v.title||"DJ FOLSOE LIVE";
  const mood=show.description||v.mood||"Modern Music TV from Denmark";
  return [
    {label:"NOW ON AIR",headline:title,body:mood,icon:v.emoji||"📺"},
    {label:"NEXT SHOW",headline:title,body:"Check folsoetv.dk for schedule, countdown and show details",icon:"⏭️"},
    {label:"TOP 20 SPOTLIGHT",headline:`#1 ${tickerClean(top.artist)||"FOLSOE TOP 20"}`,body:tickerClean(top.title)||"Weekly countdown",icon:"🏆"},
    {label:"FOLSOE PICK",headline:tickerClean(pick.artist)||"DJ FOLSOE PICK",body:tickerClean(pick.title)||"Featured track",icon:"✨"},
    {label:"FOLLOW JOURNEY",headline:`${followers}/${goal} followers`,body:`${toGo} to go · ${l.viewers||0} viewers watching`,icon:"📡"},
    {label:"REQUESTS",headline:"Requests are open",body:"Use !request in chat and help shape the show",icon:"🎧"},
    {label:"COMMUNITY",headline:"Chat is part of the show",body:"Say hello · use emotes · share the love",icon:"💜"}
  ];
}

function renderCards(){
  const lane=v9001InfoLane();
  const i=tick++;
  setCard("box1",lane[i%lane.length]);
}

/* V900.1 setCard null safety */
const __v9001SetCard = setCard;
setCard = function(box,item){
  if(!q(box)) return;
  return __v9001SetCard(box,item);
};


/* =========================================================
   V900.1.1 - multi-message chat stack
   Shows latest 4 chats inside the same angled chat box.
   ========================================================= */

function renderChatStack(){
  const el=q("chatMessage");
  if(!el) return;
  const items=(chatQueue&&chatQueue.length?chatQueue:[{user:"LIVE CHAT",login:"djfolsoe",text:"Waiting for Twitch chat…"}]).slice(-4).reverse();
  el.innerHTML=`<div class="chatStack">${items.map(item=>`
    <div class="chatLine">
      <span class="chatLineUser">${esc(clip(item.user||"CHAT",24))}</span>
      <span class="chatLineText">${item.html||chatHTML(item.text||"",{})}</span>
    </div>
  `).join("")}</div>`;
}

async function showChat(item){
  chatQueue=chatQueue.slice(-10);
  renderChatStack();
  q("chatUser").textContent=clip(item.user||"CHAT",22);
  q("chatAvatarFallback").textContent=(item.user||"C").slice(0,1).toUpperCase();
  const img=q("chatAvatarImg"), fb=q("chatAvatarFallback");
  const av=await getAvatar(item.login||item.user);
  if(av){img.src=av;img.style.display="block";fb.style.display="none";}
  else{img.style.display="none";fb.style.display="grid";}
  const card=q("box4"); if(card){card.classList.remove("flash"); void card.offsetWidth; card.classList.add("flash");}
}

function renderChatWaiting(){
  if(chatQueue.length){renderChatStack();return;}
  const status = twitchSocket && twitchSocket.readyState===1 ? "Connected · waiting for next chat message…" : "Connecting to Twitch chat…";
  showChat({user:"LIVE CHAT",login:"djfolsoe",text:status});
}


/* =========================================================
   V901 — European Music TV Broadcast Bursts
   No info boxes. Only animated broadcast text bottom right.
   ========================================================= */

function burstClean(v){
  try{ return String(tickerClean ? tickerClean(v) : (v||"")).trim(); }
  catch(e){ return String(v||"").trim(); }
}

function v901BurstLane(){
  const l=state.live||{};
  const c=(state.chart&&state.chart.items)||[];
  const v=state.visual||{};
  const show=state.show||{};
  const top=c[0]||{artist:"FOLSOE TOP 20",title:"Weekly countdown"};
  const pick=c[1]||top;
  const followers=l.followers||870;
  const goal=l.followersGoal||1000;
  const toGo=Math.max(0,goal-followers);
  const latestFollower=(state.twitchCommunity&&state.twitchCommunity.latestFollower&&(state.twitchCommunity.latestFollower.displayName||state.twitchCommunity.latestFollower.userName)) || (typeof djfTickerEvents!=="undefined" && djfTickerEvents.latestFollower) || "";
  const latestSub=(state.twitchCommunity&&state.twitchCommunity.latestSub&&(state.twitchCommunity.latestSub.displayName||state.twitchCommunity.latestSub.userName)) || (typeof djfTickerEvents!=="undefined" && djfTickerEvents.latestSub) || "";
  const latestRaid=(state.twitchCommunity&&state.twitchCommunity.latestRaid&&(state.twitchCommunity.latestRaid.displayName||state.twitchCommunity.latestRaid.userName)) || (typeof djfTickerEvents!=="undefined" && djfTickerEvents.latestRaid) || "";

  return [
    {kicker:"NOW ON AIR",title:show.title||v.title||"DJ FOLSOE LIVE",body:show.description||v.mood||"Music TV from Denmark"},
    {kicker:"NEXT SHOW",title:show.title||"DJ FOLSOE TV",body:"Full schedule and countdown at folsoetv.dk"},
    {kicker:"TOP 20 SPOTLIGHT",title:"#1 "+(burstClean(top.artist)||"FOLSOE TOP 20"),body:burstClean(top.title)||"Weekly countdown"},
    {kicker:"FOLSOE PICK",title:burstClean(pick.artist)||"DJ FOLSOE PICK",body:burstClean(pick.title)||"Featured track"},
    {kicker:"FOLLOW JOURNEY",title:`${followers}/${goal} followers`,body:`${toGo} to go · follow DJ FOLSOE on Twitch`},
    {kicker:"REQUESTS",title:"Request your song",body:"Use !request in chat and shape the show"},
    {kicker:"LATEST FOLLOWER",title:burstClean(latestFollower)||"Waiting for next follow",body:"Thank you for joining the community"},
    {kicker:"LATEST SUBSCRIBER",title:burstClean(latestSub)||"Waiting for next sub",body:"Subscriber love keeps the channel growing"},
    {kicker:"LATEST RAID",title:burstClean(latestRaid)||"Waiting for next raid",body:"DJ network love · welcome raiders"},
    {kicker:"COMMUNITY",title:"Chat is part of the show",body:"Say hello · use emotes · share the love"}
  ];
}

function renderBurst(){
  const lane=v901BurstLane();
  const item=lane[tick % lane.length] || lane[0];
  const k=q("burstKicker"), t=q("burstTitle"), b=q("burstBody"), root=q("broadcastBurst");
  if(!root) return;
  if(k) k.textContent=clip(item.kicker||"BROADCAST",32);
  if(t) t.textContent=clip(item.title||"",38);
  if(b) b.textContent=clip(item.body||"",82);
  root.classList.remove("burstFlash");
  void root.offsetWidth;
  root.classList.add("burstFlash");
}

function renderCards(){
  renderBurst();
}

/* V901 box safety */
const __v901OldSetCard = typeof setCard==="function" ? setCard : null;
if(__v901OldSetCard){
  setCard=function(box,item){ if(!q(box)) return; return __v901OldSetCard(box,item); };
}


/* =========================================================
   V901.1 — LIVE BROADCAST BURST ENGINE
   1) Permanent rotation
   2) StreamElements live events takeover
   3) Theme/show mode
   4) Hype mode for raids / big events
   ========================================================= */

window.djfTickerEvents = window.djfTickerEvents || {};
let v901EventQueue = [];
let v901ManualBurst = null;
let v901BurstLastKey = "";

function v901PushBurst(item){
  if(!item || !item.kicker) return;
  v901EventQueue.push(Object.assign({mode:"event",ttl:1}, item));
  v901EventQueue = v901EventQueue.slice(-12);
  renderBurst(true);
}

function v901Amount(ev){
  return ev?.amount || ev?.count || ev?.quantity || ev?.gifted || ev?.viewers || ev?.data?.amount || "";
}

function v901EventName(ev){
  return ev?.name || ev?.displayName || ev?.display_name || ev?.username || ev?.userName || ev?.user_name || ev?.login || ev?.data?.name || ev?.data?.username || "Someone";
}

function v901SongFromEvent(ev){
  return ev?.song || ev?.text || ev?.message || ev?.data?.text || ev?.data?.message || "";
}

function v901ThemeTitle(){
  const v=state?.visual||{};
  return `${v.emoji||""} ${v.title||"DJ FOLSOE TV"}`.trim();
}

function v901ShowModeBurst(){
  const v=state?.visual||{};
  const show=state?.show||{};
  return {
    mode:"show",
    kicker:"SHOW MODE",
    title:show.title || v.title || "DJ FOLSOE LIVE",
    body:show.description || v.mood || "Music TV from Denmark"
  };
}

/* Manual commands from browser console or future admin/worker:
   window.djfBroadcastBurst({kicker:"NEW FOLLOWER",title:"Name",body:"Thanks!"})
*/
window.djfBroadcastBurst = function(item){
  v901PushBurst(Object.assign({mode:"event"}, item||{}));
};

window.djfHypeBurst = function(item){
  v901PushBurst(Object.assign({mode:"hype"}, item||{}));
};

/* StreamElements event receiver */
window.addEventListener("onEventReceived", function(obj){
  try{
    const detail = obj.detail || {};
    const listener = String(detail.listener || "").toLowerCase();
    const ev = detail.event || {};
    const name = v901EventName(ev);
    const amount = v901Amount(ev);

    if(listener.includes("follower")){
      window.djfTickerEvents.latestFollower = name;
      v901PushBurst({mode:"event",kicker:"NEW FOLLOWER",title:name,body:"Welcome to the DJ FOLSOE community"});
    }

    if(listener.includes("subscriber") || listener.includes("sub-latest")){
      window.djfTickerEvents.latestSub = name;
      v901PushBurst({mode:"event",kicker:"NEW SUBSCRIBER",title:name,body:amount ? `Tier / months: ${amount}` : "Thank you for supporting the stream"});
    }

    if(listener.includes("cheer") || listener.includes("bit")){
      window.djfTickerEvents.latestCheer = amount ? `${name} · ${amount}` : name;
      v901PushBurst({mode:"event",kicker:"LATEST CHEER",title:name,body:amount ? `${amount} bits · thank you!` : "Thanks for the bits"});
    }

    if(listener.includes("raid")){
      window.djfTickerEvents.latestRaid = amount ? `${name} · ${amount}` : name;
      v901PushBurst({mode:"hype",kicker:"RAID INCOMING",title:name,body:amount ? `${amount} viewers · welcome raiders!` : "Welcome raiders!"});
    }

    if(listener.includes("tip") || listener.includes("donation")){
      v901PushBurst({mode:"event",kicker:"SUPPORTER LOVE",title:name,body:amount ? `Donation: ${amount}` : "Thank you for supporting the channel"});
    }

    if(listener.includes("message") || listener.includes("chat")){
      const text = v901SongFromEvent(ev);
      if(/^!request\s+/i.test(text) || /^!ønske\s+/i.test(text) || /^!wunsch\s+/i.test(text)){
        const request = text.replace(/^!(request|ønske|wunsch)\s+/i,"").trim();
        window.djfTickerEvents.latestRequest = request;
        v901PushBurst({mode:"event",kicker:"SONG REQUEST",title:name,body:request || "Request received"});
      }
    }
  }catch(e){
    console.log("V901 burst event parse failed", e);
  }
});

/* Alias for Streamer.bot / external JS injection */
window.addEventListener("djf-burst", function(e){
  v901PushBurst(e.detail || {});
});

function v901PickBurst(){
  if(v901EventQueue.length){
    const item = v901EventQueue.shift();
    return item;
  }

  // Every 5th automatic burst is pure show mode
  if(typeof tick !== "undefined" && tick % 5 === 0){
    return v901ShowModeBurst();
  }

  const lane = v901BurstLane();
  return lane[tick % lane.length] || lane[0];
}

function renderBurst(force=false){
  const item = v901PickBurst();
  const root=q("broadcastBurst"), k=q("burstKicker"), t=q("burstTitle"), b=q("burstBody");
  if(!root || !item) return;

  const key = `${item.mode||"auto"}|${item.kicker}|${item.title}|${item.body}`;
  if(!force && key === v901BurstLastKey) return;
  v901BurstLastKey = key;

  if(k) k.textContent = clip(item.kicker || "BROADCAST", 32);
  if(t) t.textContent = clip(item.title || "", 42);
  if(b) b.textContent = clip(item.body || "", 96);

  root.classList.remove("eventMode","hypeMode","showMode","burstFlash");
  void root.offsetWidth;
  if(item.mode === "hype") root.classList.add("hypeMode");
  else if(item.mode === "show") root.classList.add("showMode");
  else if(item.mode === "event") root.classList.add("eventMode");
  else root.classList.add("burstFlash");
}

/* make renderCards only feed bursts */
function renderCards(){
  renderBurst();
}


/* =========================================================
   V901.2 — BURST TIMING FIX
   Each burst gets its own full display time.
   Show Mode no longer takes over every second.
   ========================================================= */

let v9012BurstIndex = 0;
let v9012LastChange = 0;
let v9012CurrentItem = null;
let v9012CurrentKey = "";
const V9012_BURST_MS = 10500;

function v9012AutoLane(){
  const base = v901BurstLane ? v901BurstLane() : [];
  const show = v901ShowModeBurst ? v901ShowModeBurst() : null;

  // Give every item its own slot. Show Mode appears once per full cycle, not constantly.
  const lane = [];
  base.forEach(x => lane.push(Object.assign({mode:"auto"}, x)));
  if(show) lane.push(Object.assign({mode:"show"}, show));
  return lane.length ? lane : [
    {mode:"auto",kicker:"BROADCAST",title:"DJ FOLSOE TV",body:"Music TV from Denmark"}
  ];
}

function v9012NextItem(force=false){
  const now = Date.now();

  // Live events always take priority, but only one at a time.
  if(v901EventQueue && v901EventQueue.length){
    v9012LastChange = now;
    return v901EventQueue.shift();
  }

  // Keep current item on screen for the full duration.
  if(!force && v9012CurrentItem && now - v9012LastChange < V9012_BURST_MS){
    return v9012CurrentItem;
  }

  const lane = v9012AutoLane();
  const item = lane[v9012BurstIndex % lane.length];
  v9012BurstIndex++;
  v9012LastChange = now;
  return item;
}

function renderBurst(force=false){
  const root=q("broadcastBurst"), k=q("burstKicker"), t=q("burstTitle"), b=q("burstBody");
  if(!root) return;

  const item = v9012NextItem(force);
  if(!item) return;

  const key = `${item.mode||"auto"}|${item.kicker||""}|${item.title||""}|${item.body||""}`;
  if(!force && key === v9012CurrentKey && Date.now() - v9012LastChange < V9012_BURST_MS) return;

  v9012CurrentItem = item;
  v9012CurrentKey = key;

  if(k) k.textContent = clip(item.kicker || "BROADCAST", 34);
  if(t) t.textContent = clip(item.title || "", 46);
  if(b) b.textContent = clip(item.body || "", 104);

  root.classList.remove("eventMode","hypeMode","showMode","burstFlash","burstRestart");
  void root.offsetWidth;

  if(item.mode === "hype") root.classList.add("hypeMode");
  else if(item.mode === "show") root.classList.add("showMode");
  else if(item.mode === "event") root.classList.add("eventMode");
  else root.classList.add("burstRestart");
}

function renderCards(){
  renderBurst(false);
}

/* Event bursts should start immediately and stay visible */
const __v9012PushBurst = typeof v901PushBurst === "function" ? v901PushBurst : null;
v901PushBurst = function(item){
  if(!item || !item.kicker) return;
  v901EventQueue = v901EventQueue || [];
  v901EventQueue.push(Object.assign({mode:"event"}, item));
  v901EventQueue = v901EventQueue.slice(-12);
  v9012CurrentItem = null;
  v9012LastChange = 0;
  renderBurst(true);
};

/* =========================================================
   V926 — THEME ENGINE REWRITE
   Hard override: reads broadcast-core through JSONP and applies the
   selected theme background directly to the overlay DOM.
   This bypasses the old V813/V900 theme renderer that could stay on weekend.
   ========================================================= */
(function(){
  const V926_VERSION = 'V926.2 CLEAN NO DEBUG';
  const V926_API = (window.DJF_API_BASE || 'https://djfolsoe-tv-api.sunefolsoe.workers.dev').replace(/\/$/, '');
  const V926_THEME_URLS = {
    weekend: 'https://folsoetv.dk/themes/weekend.png',
    trance: 'https://folsoetv.dk/themes/trance.png',
    eurodance: 'https://folsoetv.dk/themes/eurodance.png',
    fredagsbar: 'https://folsoetv.dk/themes/fredagsbar.png',
    retro: 'https://folsoetv.dk/themes/retro.png',
    popup: 'https://folsoetv.dk/themes/popup.png',
    morning: 'https://folsoetv.dk/themes/morning.png',
    summer: 'https://folsoetv.dk/themes/summer.png',
    danske: 'https://folsoetv.dk/themes/danske.png',
    danish: 'https://folsoetv.dk/themes/danske.png'
  };
  const V926_META = {
    weekend: ['WEEKEND', '#00d4ff', '#ff4d6d', '#ffd166'],
    trance: ['TRANCE TUESDAY', '#62ecff', '#8b5cf6', '#ffffff'],
    eurodance: ['EURODANCE', '#ff4bd8', '#62ecff', '#ffe36e'],
    fredagsbar: ['FREDAGSBAR', '#6cffb5', '#ffd166', '#ff4d6d'],
    retro: ['RETRO HITS', '#ffe36e', '#ff4bd8', '#ffffff'],
    popup: ['POP UP LIVE', '#ffffff', '#ff4d6d', '#62ecff'],
    morning: ['GOOD MORNING TWITCH', '#ffe36e', '#6cffb5', '#ffffff'],
    summer: ['SUMMER', '#ffe36e', '#62ecff', '#ff4d6d'],
    danske: ['DANISH HITS', '#ff4d4d', '#ffffff', '#62ecff'],
    danish: ['DANISH HITS', '#ff4d4d', '#ffffff', '#62ecff']
  };
  let lastApplied = '';
  let lastPayload = null;
  let lastError = '';

  function safeText(v){ return String(v == null ? '' : v); }
  function normalizeTheme(raw){
    const key = safeText(raw || '').trim().toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/_/g, '-')
      .replace('trance-tuesday', 'trance')
      .replace('retro-hits', 'retro')
      .replace('pop-up-live', 'popup')
      .replace('good-morning-twitch', 'morning')
      .replace('danish-hits', 'danske');
    return V926_THEME_URLS[key] ? key : (key || 'weekend');
  }
  function pickPayload(payload){
    if(!payload || typeof payload !== 'object') return {};
    return payload.core || payload.data || payload.broadcastCore || payload;
  }
  function extractTheme(payload){
    const core = pickPayload(payload);
    const theme = core.theme || {};
    const overlay = core.overlay || {};
    const overlayPanel = overlay.controlPanel || {};
    const hub = core.overlayHub || {};
    const hubPanel = hub.controlPanel || {};
    const broadcast = core.broadcast || payload.broadcast || {};
    return normalizeTheme(
      theme.id || theme.key || theme.title ||
      overlay.activeTheme || overlay.theme || overlayPanel.theme ||
      hub.activeTheme || hub.theme || hubPanel.theme ||
      broadcast.activeTheme || core.activeTheme || payload.activeTheme ||
      'weekend'
    );
  }
  function themeUrl(theme, payload){
    const core = pickPayload(payload || {});
    const bg = core?.theme?.background || core?.homepage?.hero?.background || core?.hero?.background || '';
    if(bg && /^https?:\/\//i.test(bg)) return bg;
    if(bg && String(bg).startsWith('themes/')) return 'https://folsoetv.dk/' + bg.replace(/^\//, '');
    return V926_THEME_URLS[theme] || ('https://folsoetv.dk/themes/' + theme + '.png');
  }
  function ensureLayer(){
    let root = document.getElementById('djfV170Reborn') || document.querySelector('.djfV170Reborn') || document.body;
    if(root && root !== document.body){
      try{ root.style.position = root.style.position || 'relative'; root.style.overflow = 'hidden'; }catch(e){}
    }
    let layer = document.getElementById('djfThemeEngineV926');
    if(!layer){
      layer = document.createElement('div');
      layer.id = 'djfThemeEngineV926';
      layer.setAttribute('data-djf-theme-layer', 'v926');
      const parent = root || document.body;
      parent.insertBefore(layer, parent.firstChild);
    }
    layer.style.cssText = [
      'position:absolute', 'inset:0', 'z-index:0', 'pointer-events:none',
      'background-position:center center', 'background-size:cover', 'background-repeat:no-repeat',
      'opacity:1', 'filter:saturate(1.08) contrast(1.05)',
      'transition:background-image .35s ease, opacity .35s ease'
    ].join(';') + ';';
    return {root, layer};
  }
  function bringContentAbove(root){
    // V926.1: only keep known overlay layers above the background.
    // Do not assign z-index to every child, because that can freeze old animations/layouts.
    try{
      ['topTicker','topTickerText','bottomTicker','bottomTickerText','broadcastBurst','box4','djfOverlayDebugBadge'].forEach(id=>{
        const el=document.getElementById(id);
        if(el){
          if(getComputedStyle(el).position === 'static') el.style.position='relative';
          el.style.zIndex = id==='djfOverlayDebugBadge' ? '999999' : '5';
        }
      });
    }catch(e){}
  }

  function updateExistingThemeLabels(theme, payload){
    // V926.1: do not overwrite ticker/burst DOM manually.
    // The original render engines must stay alive and render their own HTML/animations.
    try{
      const meta = V926_META[theme] || V926_META.weekend;
      document.documentElement.style.setProperty('--djf-theme-title', meta[0]);
    }catch(e){}
  }

  function wakeOriginalOverlay(payload){
    // V926.1: theme rewrite must not kill the original broadcast/ticker/chat engines.
    try{
      if(payload && typeof broadcastCoreToOverlayState === 'function'){
        state = broadcastCoreToOverlayState(payload);
      }
    }catch(e){ console.log('V926.1 state wake failed', e); }
    try{ if(typeof renderTickers === 'function') renderTickers(); }catch(e){}
    try{ if(typeof renderCards === 'function') renderCards(); }catch(e){}
    try{ if(typeof renderBurst === 'function') renderBurst(false); }catch(e){}
    try{ if(typeof renderAll === 'function') renderAll(); }catch(e){}
    try{ if(typeof connectChat === 'function') connectChat(); }catch(e){}
  }

  function renderDebug(theme, source){
    try{ const el=document.getElementById('djfV926Debug'); if(el) el.remove(); }catch(e){}
  }

  function applyV926Theme(theme, payload, source){
    theme = normalizeTheme(theme);
    const url = themeUrl(theme, payload);
    const meta = V926_META[theme] || V926_META.weekend;
    const {root, layer} = ensureLayer();
    const bgValue = `linear-gradient(180deg,rgba(0,0,0,.02),rgba(0,0,0,.12)), url('${url}')`;
    layer.style.backgroundImage = bgValue;
    try{
      const oldLayer = document.getElementById('themeBgLayer');
      if(oldLayer && oldLayer !== layer){
        oldLayer.style.backgroundImage = bgValue;
        oldLayer.style.opacity = '1';
      }
    }catch(e){}
    try{
      document.body.className = String(document.body.className || '').replace(/theme-[a-z0-9_-]+/g, '').trim() + ' theme-' + theme;
      document.documentElement.style.setProperty('--theme-bg-url', url);
      document.documentElement.style.setProperty('--theme-bg', `url('${url}')`);
      document.documentElement.style.setProperty('--a', meta[3]);
      document.documentElement.style.setProperty('--b', meta[2]);
      document.documentElement.style.setProperty('--c', meta[1]);
      if(root){
        root.style.backgroundImage = bgValue;
        root.style.backgroundPosition = 'center center';
        root.style.backgroundSize = 'cover';
        root.style.backgroundRepeat = 'no-repeat';
        root.style.backgroundColor = 'transparent';
        root.setAttribute('data-active-theme', theme);
      }
    }catch(e){}
    bringContentAbove(root);
    updateExistingThemeLabels(theme, payload);
    wakeOriginalOverlay(payload);
    lastApplied = theme;
    window.DJF_CURRENT_THEME = theme;
    window.DJF_THEME_ENGINE_VERSION = V926_VERSION;
    renderDebug(theme, source || 'V926 direct apply');
  }
  function jsonp(url, timeoutMs){
    return new Promise((resolve, reject) => {
      const cb = '__djfV926Jsonp_' + Math.random().toString(36).slice(2);
      let done = false;
      const timer = setTimeout(() => {
        if(done) return;
        done = true;
        cleanup();
        reject(new Error('JSONP timeout'));
      }, timeoutMs || 8000);
      function cleanup(){
        try{ delete window[cb]; }catch(e){ window[cb] = undefined; }
        try{ script.remove(); }catch(e){}
        clearTimeout(timer);
      }
      window[cb] = function(payload){
        if(done) return;
        done = true;
        cleanup();
        resolve(payload);
      };
      const script = document.createElement('script');
      script.src = url + (url.includes('?') ? '&' : '?') + 'callback=' + encodeURIComponent(cb) + '&ts=' + Date.now();
      script.async = true;
      script.onerror = function(){
        if(done) return;
        done = true;
        cleanup();
        reject(new Error('JSONP script load failed'));
      };
      document.head.appendChild(script);
    });
  }
  async function loadAndApply(){
    try{
      lastError = '';
      const payload = await jsonp(V926_API + '/api/broadcast-jsonp', 9000);
      lastPayload = payload;
      const theme = extractTheme(payload);
      applyV926Theme(theme, payload, V926_API + '/api/broadcast-jsonp');
    }catch(e){
      lastError = String(e && e.message ? e.message : e);
      const theme = extractTheme(lastPayload) || lastApplied || window.DJF_CURRENT_THEME || 'weekend';
      applyV926Theme(theme, lastPayload || {}, 'kept-current-theme');
    }
  }
  window.DJF_V926_FORCE_THEME = function(theme){ applyV926Theme(theme, lastPayload || {}, 'manual window.DJF_V926_FORCE_THEME'); };
  window.DJF_V926_RELOAD_THEME = loadAndApply;
  setTimeout(loadAndApply, 250);
  setInterval(loadAndApply, 5000);
})();

/* =========================================================
   V927 — OVERLAY DATA WAKE UP
   Purpose: keep V926 theme switching, but wake the visible overlay data.
   Uses the already loaded broadcast-core state from JSONP.
   No debug panel. No worker/admin changes.
   ========================================================= */
(function(){
  const V927_VERSION = 'V927 OVERLAY DATA WAKE UP';
  function clean(v,fallback=''){
    try{ return String(tickerClean ? tickerClean(v) : (v ?? fallback)).trim() || fallback; }
    catch(e){ return String(v ?? fallback).trim() || fallback; }
  }
  function upper(v,fallback=''){
    return clean(v,fallback).toUpperCase();
  }
  function getState(){ return (typeof state !== 'undefined' && state) ? state : {}; }
  function liveData(){
    const s=getState();
    const l=s.live||{};
    return {
      viewers:Number(l.viewers||0),
      followers:Number(l.followers||0),
      followersGoal:Number(l.followersGoal||1000),
      subs:Number(l.subs||0),
      subGoal:Number(l.subGoal||100)
    };
  }
  function showData(){
    const s=getState();
    const show=s.show||{};
    const visual=s.visual||{};
    return {
      title: clean(show.title || visual.title || 'DJ FOLSOE'),
      description: clean(show.description || visual.mood || 'Live DJ shows, requests and Music TV from Denmark'),
      themeTitle: clean(visual.title || (s.theme&&s.theme.theme&&s.theme.theme.title) || 'MUSIC TV'),
      themeKey: clean((s.theme&&s.theme.activeTheme) || window.DJF_CURRENT_THEME || 'music-tv')
    };
  }
  function chartItems(){
    const s=getState();
    return (s.chart && Array.isArray(s.chart.items)) ? s.chart.items : [];
  }
  function tickerBaseParts(){
    const s=getState();
    const l=liveData();
    const sh=showData();
    const toGo=Math.max(0,l.followersGoal-l.followers);
    const base=[];
    (s.topbarNews||[]).forEach(x=>base.push(clean(x)));
    if(!base.length) base.push(`${sh.themeTitle} · ${sh.title}`);
    return base.filter(Boolean).map(englishTickerText);
  }
  function bottomTickerParts(){
    const s=getState();
    const l=liveData();
    const sh=showData();
    const toGo=Math.max(0,l.followersGoal-l.followers);
    const parts=[];
    (s.footerTicker||[]).forEach(x=>parts.push(clean(x)));
    parts.push(`FOLLOWER GOAL · ${l.followers}/${l.followersGoal} · ${toGo} TO GO`);
    parts.push(`SUB GOAL · ${l.subs}/${l.subGoal}`);
    parts.push('REQUEST YOUR SONG · !request Artist - Title');
    parts.push('FOLLOW DJ FOLSOE ON TWITCH · twitch.tv/djfolsoe');
    return parts.filter(Boolean).map(englishTickerText);
  }

  // Override ticker renderer so top and bottom tickers wake up from broadcast-core.
  if(typeof renderTickers === 'function'){
    renderTickers = function(){
      try{
        const topParts = tickerParts(tickerBaseParts());
        const bottomParts = tickerParts(bottomTickerParts());
        const topKey = topParts.join('||');
        const bottomKey = bottomParts.join('||');
        const topEl = q('topTickerText');
        const bottomEl = q('bottomTickerText');
        if(topEl && topKey !== lastTopTickerKey){
          const topHtml = renderTickerHtml(topParts);
          topEl.innerHTML = topHtml + `<span class="tickerSep">✦</span>` + topHtml;
          document.documentElement.style.setProperty('--topDur', Math.max(28,Math.min(95,topKey.length/4.1))+'s');
          lastTopTickerKey = topKey;
        }
        if(bottomEl && bottomKey !== lastBottomTickerKey){
          const bottomHtml = renderTickerHtml(bottomParts);
          bottomEl.innerHTML = bottomHtml + `<span class="tickerSep">✦</span>` + bottomHtml;
          document.documentElement.style.setProperty('--bottomDur', Math.max(70,Math.min(190,bottomKey.length/4.0))+'s');
          lastBottomTickerKey = bottomKey;
        }
      }catch(e){ console.log('V927 renderTickers failed', e); }
    };
  }

  // Override the visible broadcast burst lane so lower-right/near-bottom output follows broadcast-core.
  window.v927BurstLane = function(){
    const s=getState();
    const l=liveData();
    const sh=showData();
    const c=chartItems();
    const top=c[0]||{rank:1,artist:'DJ FOLSOE',title:'This Week\'s Number One'};
    const pick=c[1]||top;
    const next = (s.motion && s.motion.lanes && s.motion.lanes.box2 && s.motion.lanes.box2.find(x=>String(x.label||'').toUpperCase().includes('NEXT'))) || null;
    const toGo=Math.max(0,l.followersGoal-l.followers);
    const req = (s.footerTicker||[]).find(x=>String(x).toUpperCase().includes('REQUEST')) || 'Use !request Artist - Title in chat';
    return [
      {kicker:'NOW ON AIR',title:sh.title,body:sh.description},
      {kicker:'ACTIVE THEME',title:sh.themeTitle,body:sh.themeKey},
      {kicker:'LIVE STATUS',title:`${l.viewers} viewers`,body:`${l.followers}/${l.followersGoal} followers · ${l.subs}/${l.subGoal} subs`},
      {kicker:'FOLLOW JOURNEY',title:`${l.followers}/${l.followersGoal} followers`,body:`${toGo} to go · follow twitch.tv/djfolsoe`},
      {kicker:'NEXT SHOW',title:clean(next&&next.headline,'Next DJ FOLSOE Broadcast'),body:clean(next&&next.body,'Announced soon')},
      {kicker:'TOP 20 SPOTLIGHT',title:'#'+clean(top.rank,'1')+' '+clean(top.artist,'DJ FOLSOE'),body:clean(top.title,'This Week\'s Number One')},
      {kicker:'FOLSOE PICK',title:clean(pick.artist,'Viewer Pick'),body:clean(pick.title,'Request of the Week')},
      {kicker:'REQUESTS',title:'Request your song',body:clean(req,'Use !request Artist - Title in chat')}
    ];
  };

  if(typeof renderBurst === 'function'){
    renderBurst = function(){
      try{
        const lane=window.v927BurstLane();
        const item=lane[(typeof tick !== 'undefined' ? tick : 0) % lane.length] || lane[0];
        const k=q('burstKicker'), t=q('burstTitle'), b=q('burstBody'), root=q('broadcastBurst');
        if(!root) return;
        if(k) k.textContent=clip(item.kicker||'BROADCAST',32);
        if(t) t.textContent=clip(item.title||'',42);
        if(b) b.textContent=clip(item.body||'',96);
        root.classList.remove('burstFlash');
        void root.offsetWidth;
        root.classList.add('burstFlash');
      }catch(e){ console.log('V927 renderBurst failed', e); }
    };
  }
  if(typeof renderCards === 'function'){
    renderCards = function(){
      try{ if(typeof renderBurst === 'function') renderBurst(); }catch(e){}
    };
  }

  window.DJF_OVERLAY_DATA_VERSION = V927_VERSION;
  window.DJF_V927_WAKE_DATA = function(){
    try{ renderTickers(); }catch(e){}
    try{ renderCards(); }catch(e){}
    try{ if(typeof renderChatWaiting==='function') renderChatWaiting(); }catch(e){}
  };
  setTimeout(window.DJF_V927_WAKE_DATA, 600);
  setInterval(window.DJF_V927_WAKE_DATA, 7000);
})();

/* =========================================================
   V927.1 — DIRECT OVERLAY DATA WAKE FIX
   Purpose: V927 theme works, but visible data may still be driven by old renderers.
   This runs after everything else and writes the live broadcast-core directly to
   the existing ticker + broadcast burst DOM. No debug box. No layout changes.
   ========================================================= */
(function(){
  const V9271_VERSION = 'V927.1 DIRECT OVERLAY DATA WAKE FIX';
  const API = (window.DJF_API_BASE || 'https://djfolsoe-tv-api.sunefolsoe.workers.dev').replace(/\/$/, '');
  let cache = null;
  let idx = 0;
  function escHtml(s){ return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
  function clean(s,f=''){ return String(s ?? f ?? '').trim() || f || ''; }
  function num(v,f=0){ v=Number(v); return Number.isFinite(v)?v:f; }
  function coreOf(payload){ return (payload && (payload.core || payload.data || payload.broadcastCore)) || payload || {}; }
  function jsonp(url, timeoutMs){
    return new Promise((resolve,reject)=>{
      const cb='__djfV9271_'+Math.random().toString(36).slice(2);
      let done=false;
      const timer=setTimeout(()=>{ if(done) return; done=true; cleanup(); reject(new Error('JSONP timeout')); }, timeoutMs||8000);
      function cleanup(){ try{delete window[cb];}catch(e){window[cb]=undefined;} try{script.remove();}catch(e){} clearTimeout(timer); }
      window[cb]=function(payload){ if(done) return; done=true; cleanup(); resolve(payload); };
      const script=document.createElement('script');
      script.async=true;
      script.src=url+(url.includes('?')?'&':'?')+'callback='+encodeURIComponent(cb)+'&ts='+Date.now();
      script.onerror=function(){ if(done) return; done=true; cleanup(); reject(new Error('JSONP script load failed')); };
      document.head.appendChild(script);
    });
  }
  function themeId(core){
    const t=core.theme||{}, o=core.overlay||{}, op=o.controlPanel||{}, b=core.broadcast||{};
    return clean(t.id||t.key||o.activeTheme||o.theme||op.theme||b.activeTheme||core.activeTheme||window.DJF_CURRENT_THEME||'weekend').toLowerCase();
  }
  function themeTitle(id, core){
    const title=(core.theme&&core.theme.title)||'';
    const map={weekend:'WEEKEND',trance:'TRANCE TUESDAY',eurodance:'EURODANCE',fredagsbar:'FREDAGSBAR',retro:'RETRO HITS',popup:'POP UP LIVE',morning:'GOOD MORNING TWITCH',summer:'SUMMER'};
    return clean(title || map[id] || id.toUpperCase());
  }
  function data(core){
    const tw=core.twitch||{}, show=core.show||{}, hero=core.hero||{}, com=core.community||{}, ticker=core.ticker||{}, next=core.nextShow||{}, overlay=core.overlay||{};
    const id=themeId(core);
    const followers=num(tw.followers ?? com.followers,0);
    const followerGoal=num(com.followerGoal,1000);
    const subs=num(tw.subs ?? com.subs,0);
    const subGoal=num(com.subGoal ?? overlay.subGoal,100);
    const viewers=num(tw.viewers ?? show.viewers,0);
    const live=!!(tw.live||tw.isLive||show.live);
    const title=clean(show.title||show.current||tw.liveTitle||hero.title||overlay.title||'DJ FOLSOE');
    const description=clean(show.description||hero.text||com.text||'Live DJ shows, requests and Music TV from Denmark.');
    const tick=clean(ticker.text||overlay.infoLine||'DJ FOLSOE TWITCH · MUSIC STREAMER FROM DENMARK · REQUEST A SONG · TOP 20 · LIVE COMMUNITY');
    const req=clean(com.requestText||overlay.requestText||'Use !request Artist - Title in Twitch chat');
    const nextTitle=clean(next.show||next.title||'Next DJ FOLSOE Broadcast');
    const nextTime=clean(next.timeLabel||next.datetime||next.dateTime||'Announced soon');
    const top20=Array.isArray(core.top20)?core.top20:[];
    return {id,theme:themeTitle(id,core),followers,followerGoal,subs,subGoal,viewers,live,title,description,tick,req,nextTitle,nextTime,top20,special:clean(com.specialEvent||overlay.specialEvent||'')};
  }
  function tickerItem(text,cls){ return '<span class="tickerItem '+(cls||'white')+'"><b>'+escHtml(text.split('·')[0].trim())+'</b>'+(text.includes('·')?'<em>'+escHtml(text.split('·').slice(1).join('·').trim())+'</em>':'')+'</span>'; }
  function renderTickersDirect(d){
    const topEl=document.getElementById('topTickerText');
    const bottomEl=document.getElementById('bottomTickerText');
    const top=[`${d.live?'LIVE':'OFFLINE'} · ${d.title}`,`ACTIVE THEME · ${d.theme}`,`VIEWERS · ${d.viewers}`];
    const bottom=[d.tick,`FOLLOWER GOAL · ${d.followers}/${d.followerGoal} · ${Math.max(0,d.followerGoal-d.followers)} TO GO`,`SUB GOAL · ${d.subs}/${d.subGoal}`,d.req,'FOLLOW DJ FOLSOE ON TWITCH · twitch.tv/djfolsoe'].filter(Boolean);
    if(topEl){ const html=top.map((x,i)=>tickerItem(x,['cyan','pink','yellow'][i%3])).join('<span class="tickerSep">✦</span>'); topEl.innerHTML=html+'<span class="tickerSep">✦</span>'+html; }
    if(bottomEl){ const html=bottom.map((x,i)=>tickerItem(x,['station','goal','sub','request','follow'][i%5])).join('<span class="tickerSep">✦</span>'); bottomEl.innerHTML=html+'<span class="tickerSep">✦</span>'+html; }
  }
  function renderBurstDirect(d){
    const k=document.getElementById('burstKicker'), t=document.getElementById('burstTitle'), b=document.getElementById('burstBody'), root=document.getElementById('broadcastBurst');
    if(!root) return;
    const top=d.top20&&d.top20[0]||{rank:1,artist:'DJ FOLSOE',title:"This Week's Number One"};
    const pick=d.top20&&d.top20[1]||top;
    const lane=[
      ['NOW ON AIR',d.title,d.description],
      ['ACTIVE THEME',d.theme,d.id],
      ['LIVE STATUS',`${d.viewers} viewers`,`${d.followers}/${d.followerGoal} followers · ${d.subs}/${d.subGoal} subs`],
      ['NEXT SHOW',d.nextTitle,d.nextTime],
      ['FOLLOW JOURNEY',`${d.followers}/${d.followerGoal} followers`,`${Math.max(0,d.followerGoal-d.followers)} to go · twitch.tv/djfolsoe`],
      ['TOP 20 SPOTLIGHT',`#${top.rank||1} ${clean(top.artist,'DJ FOLSOE')}`,clean(top.title,"This Week's Number One")],
      ['FOLSOE PICK',clean(pick.artist,'Viewer Pick'),clean(pick.title,'Request of the Week')],
      ['REQUESTS','Request your song',d.req]
    ];
    if(d.special) lane.unshift(['SPECIAL EVENT',d.special,d.tick]);
    const item=lane[idx++ % lane.length];
    if(k) k.textContent=item[0].slice(0,32);
    if(t) t.textContent=item[1].slice(0,42);
    if(b) b.textContent=item[2].slice(0,96);
    root.classList.remove('burstFlash'); void root.offsetWidth; root.classList.add('burstFlash');
  }
  async function wake(){
    try{
      const payload=await jsonp(API+'/api/broadcast-jsonp',8000);
      cache=coreOf(payload);
      const d=data(cache);
      renderTickersDirect(d);
      renderBurstDirect(d);
      window.DJF_OVERLAY_DATA_VERSION=V9271_VERSION;
    }catch(e){
      if(cache){ const d=data(cache); renderTickersDirect(d); renderBurstDirect(d); }
    }
  }
  window.DJF_V9271_WAKE_DATA=wake;
  setTimeout(wake,800);
  setInterval(wake,15000);
})();


/* =========================================================
   V927.2 — STABLE TICKER & INFO ROTATION
   Purpose:
   - Top ticker is admin-first: core.ticker.text / core.ticker.items.
   - Bottom ticker is stable community/status data.
   - The lower info burst stays on screen longer and does not flicker.
   - This final layer wins over older V900/V927 render intervals.
   ========================================================= */
(function(){
  const V9272_VERSION = 'V927.2 STABLE TICKER & INFO ROTATION';
  const API = (window.DJF_API_BASE || 'https://djfolsoe-tv-api.sunefolsoe.workers.dev').replace(/\/$/, '');
  const ROTATE_MS = 18000;
  const FETCH_MS = 12000;
  let coreCache = null;
  let stableIndex = 0;
  let lastRotate = 0;
  let lastTickerKey = '';
  let lastBurstKey = '';

  function esc2(s){ return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
  function clean2(v,f=''){ return String(v ?? f ?? '').replace(/\[object Object\]/g,'').trim() || f || ''; }
  function num2(v,f=0){ v=Number(v); return Number.isFinite(v)?v:f; }
  function coreOf2(payload){ return (payload && (payload.core || payload.data || payload.broadcastCore)) || payload || {}; }
  function jsonp2(url, timeoutMs){
    return new Promise((resolve,reject)=>{
      const cb='__djfV9272_'+Math.random().toString(36).slice(2);
      let done=false, script;
      const timer=setTimeout(()=>{ if(done) return; done=true; cleanup(); reject(new Error('JSONP timeout')); }, timeoutMs||8000);
      function cleanup(){ try{delete window[cb];}catch(e){window[cb]=undefined;} try{script&&script.remove();}catch(e){} clearTimeout(timer); }
      window[cb]=function(payload){ if(done) return; done=true; cleanup(); resolve(payload); };
      script=document.createElement('script');
      script.async=true;
      script.src=url+(url.includes('?')?'&':'?')+'callback='+encodeURIComponent(cb)+'&ts='+Date.now();
      script.onerror=function(){ if(done) return; done=true; cleanup(); reject(new Error('JSONP script load failed')); };
      document.head.appendChild(script);
    });
  }
  function data2(core){
    core=coreOf2(core);
    const tw=core.twitch||{}, show=core.show||{}, hero=core.hero||{}, com=core.community||{}, ticker=core.ticker||{}, next=core.nextShow||{}, overlay=core.overlay||{}, theme=core.theme||{};
    const followers=num2(tw.followers ?? com.followers,0);
    const followerGoal=num2(com.followerGoal,1000);
    const subs=num2(tw.subs ?? com.subs,0);
    const subGoal=num2(com.subGoal ?? overlay.subGoal,100);
    const viewers=num2(tw.viewers ?? show.viewers,0);
    const live=!!(tw.live||tw.isLive||show.live);
    const themeId=clean2(theme.id||theme.key||overlay.activeTheme||core?.broadcast?.activeTheme||window.DJF_CURRENT_THEME||'weekend').toLowerCase();
    const themeTitle=clean2(theme.title||({weekend:'Weekend',trance:'Trance Tuesday',eurodance:'Eurodance',fredagsbar:'Fredagsbar',retro:'Retro Hits',popup:'Pop Up Live',morning:'Good Morning Twitch',summer:'Summer'}[themeId])||themeId.toUpperCase());
    const title=clean2(show.title||show.current||tw.liveTitle||hero.title||overlay.title||'DJ FOLSOE');
    const description=clean2(show.description||hero.text||com.text||'Live DJ shows, requests and Music TV from Denmark.');
    const adminTicker=clean2(ticker.text||overlay.infoLine||'');
    const tickerItems=Array.isArray(ticker.items)?ticker.items.map(x=>clean2(x)).filter(Boolean):[];
    const requestText=clean2(com.requestText||overlay.requestText||'Use !request Artist - Title in Twitch chat');
    const special=clean2(com.specialEvent||overlay.specialEvent||'');
    const nextTitle=clean2(next.show||next.title||'Next DJ FOLSOE Broadcast');
    const nextTime=clean2(next.timeLabel||next.datetime||next.dateTime||'Announced soon');
    const top20=Array.isArray(core.top20)?core.top20:[];
    return {core,tw,show,hero,com,ticker,next,overlay,theme,followers,followerGoal,subs,subGoal,viewers,live,themeId,themeTitle,title,description,adminTicker,tickerItems,requestText,special,nextTitle,nextTime,top20};
  }
  function itemHtml(text, cls){
    text=clean2(text);
    const parts=text.split('·');
    const label=parts[0].trim();
    const rest=parts.slice(1).join('·').trim();
    return '<span class="tickerItem '+(cls||'white')+'"><b>'+esc2(label)+'</b>'+(rest?'<em>'+esc2(rest)+'</em>':'')+'</span>';
  }
  function applyTicker(d){
    const topEl=document.getElementById('topTickerText');
    const bottomEl=document.getElementById('bottomTickerText');
    const top=[];
    if(d.adminTicker) top.push(d.adminTicker);
    d.tickerItems.forEach(x=>{ if(!top.includes(x)) top.push(x); });
    if(d.special) top.unshift('SPECIAL EVENT · '+d.special);
    if(!top.length) top.push('DJ FOLSOE TWITCH · MUSIC STREAMER FROM DENMARK');

    const toGo=Math.max(0,d.followerGoal-d.followers);
    const bottom=[
      `${d.live?'LIVE':'OFFLINE'} · ${d.title} · ${d.viewers} viewers`,
      `ACTIVE THEME · ${d.themeTitle}`,
      `FOLLOWER GOAL · ${d.followers}/${d.followerGoal} · ${toGo} TO GO`,
      `SUB GOAL · ${d.subs}/${d.subGoal}`,
      `NEXT SHOW · ${d.nextTitle} · ${d.nextTime}`,
      d.requestText,
      'FOLLOW DJ FOLSOE ON TWITCH · twitch.tv/djfolsoe'
    ].filter(Boolean);

    const key=top.join('||')+'##'+bottom.join('||');
    if(key===lastTickerKey) return;
    lastTickerKey=key;
    if(topEl){
      const html=top.map((x,i)=>itemHtml(x,['cyan','pink','yellow','white'][i%4])).join('<span class="tickerSep">✦</span>');
      topEl.innerHTML=html+'<span class="tickerSep">✦</span>'+html;
      document.documentElement.style.setProperty('--topDur', Math.max(55, Math.min(150, top.join('').length/2.2))+'s');
    }
    if(bottomEl){
      const html=bottom.map((x,i)=>itemHtml(x,['station','goal','sub','request','follow','cyan'][i%6])).join('<span class="tickerSep">✦</span>');
      bottomEl.innerHTML=html+'<span class="tickerSep">✦</span>'+html;
      document.documentElement.style.setProperty('--bottomDur', Math.max(95, Math.min(230, bottom.join('').length/2.0))+'s');
    }
  }
  function burstLane(d){
    const top=d.top20[0]||{rank:1,artist:'DJ FOLSOE',title:"This Week's Number One"};
    const pick=d.top20[1]||top;
    const toGo=Math.max(0,d.followerGoal-d.followers);
    const lane=[];
    if(d.special) lane.push(['SPECIAL EVENT',d.special,d.adminTicker||d.description]);
    lane.push(['NOW ON AIR',d.title,d.description]);
    lane.push(['ACTIVE THEME',d.themeTitle,d.themeId]);
    lane.push(['NEXT SHOW',d.nextTitle,d.nextTime]);
    lane.push(['LIVE STATUS',`${d.viewers} viewers`,`${d.followers}/${d.followerGoal} followers · ${d.subs}/${d.subGoal} subs`]);
    lane.push(['FOLLOW JOURNEY',`${d.followers}/${d.followerGoal} followers`,`${toGo} to go · twitch.tv/djfolsoe`]);
    lane.push(['TOP 20 SPOTLIGHT',`#${clean2(top.rank,'1')} ${clean2(top.artist,'DJ FOLSOE')}`,clean2(top.title,"This Week's Number One")]);
    lane.push(['FOLSOE PICK',clean2(pick.artist,'Viewer Pick'),clean2(pick.title,'Request of the Week')]);
    lane.push(['REQUESTS','Request your song',d.requestText]);
    return lane;
  }
  function writeBurst(item){
    const k=document.getElementById('burstKicker'), t=document.getElementById('burstTitle'), b=document.getElementById('burstBody'), root=document.getElementById('broadcastBurst');
    if(!root||!item) return;
    const key=item.join('||');
    if(key===lastBurstKey) return;
    lastBurstKey=key;
    if(k) k.textContent=clean2(item[0]).slice(0,32);
    if(t) t.textContent=clean2(item[1]).slice(0,44);
    if(b) b.textContent=clean2(item[2]).slice(0,110);
    root.classList.remove('burstFlash'); void root.offsetWidth; root.classList.add('burstFlash');
  }
  function applyStable(forceRotate=false){
    if(!coreCache) return;
    const d=data2(coreCache);
    applyTicker(d);
    const now=Date.now();
    const lane=burstLane(d);
    if(forceRotate || now-lastRotate>ROTATE_MS){
      lastRotate=now;
      const item=lane[stableIndex++ % lane.length] || lane[0];
      writeBurst(item);
    }
    window.DJF_OVERLAY_DATA_VERSION=V9272_VERSION;
  }
  async function fetchCore(){
    try{
      const payload=await jsonp2(API+'/api/broadcast-jsonp',8000);
      coreCache=coreOf2(payload);
      applyStable(false);
    }catch(e){
      applyStable(false);
    }
  }
  // Win over older intervals: old code may call renderBurst/renderCards often, but this throttles output.
  window.renderBurst = function(force){ applyStable(!!force); };
  window.renderCards = function(){ applyStable(false); };
  window.DJF_V9272_STABLE_WAKE = function(){ fetchCore(); applyStable(true); };
  setTimeout(()=>{ fetchCore(); setTimeout(()=>applyStable(true),700); }, 900);
  setInterval(fetchCore, FETCH_MS);
  setInterval(()=>applyStable(false), 1000);
})();
