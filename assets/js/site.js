// DJ FOLSOE NETWORK V918.9 · BROADCAST CORE ENGINE
const $ = (id) => document.getElementById(id);
const API_BASE = (window.DJF_API_BASE || 'https://djfolsoe-tv-api.sunefolsoe.workers.dev').replace(/\/$/, '');
let portal = {};
let nextDate = null;
let twitchTimer = null;

async function readJson(url, fallback){
  try{ const r = await fetch(url, {cache:'no-store'}); if(r.ok) return await r.json(); }catch(e){}
  return fallback;
}
function deepMerge(a,b){
  const out = Array.isArray(a) ? [...a] : {...(a||{})};
  Object.keys(b||{}).forEach(k=>{
    if(b[k] && typeof b[k]==='object' && !Array.isArray(b[k])) out[k]=deepMerge(out[k]||{}, b[k]);
    else out[k]=b[k];
  });
  return out;
}
async function loadPortal(){
  const localCore = await readJson('data/broadcast-core.json', null) || await readJson('assets/data/broadcast-core.json', null) || {};
  const apiCore = await readJson(API_BASE + '/api/broadcast?t=' + Date.now(), null) || await readJson(API_BASE + '/api/unified-control?t=' + Date.now(), null) || {};
  portal = deepMerge(localCore, apiCore.core || apiCore.data || apiCore);
  if(apiCore.twitch) portal.twitch = apiCore.twitch;
  normalizeCore();
  renderPortal();
  tickCountdown();
  setInterval(tickCountdown, 1000);
  startPolling();
}
async function refreshTwitchAndCore(){
  const core = await readJson(API_BASE + '/api/broadcast?t=' + Date.now(), null);
  if(core){ portal = deepMerge(portal, core.core || core.data || core); normalizeCore(); renderPortal(); }
}
function startPolling(){
  if(twitchTimer) clearInterval(twitchTimer);
  twitchTimer = setInterval(refreshTwitchAndCore, 30000);
  document.addEventListener('visibilitychange', ()=>{ if(!document.hidden) refreshTwitchAndCore(); });
}
function normalizeCore(){
  portal.homepage = portal.homepage || {};
  portal.broadcast = portal.broadcast || {};
  portal.community = portal.community || {};
  portal.overlayHub = portal.overlayHub || portal.overlay || {};
  portal.nextShow = normalizeNextShow(portal.nextShow || portal.homepage.nextShow || {});
  portal.homepage.nextShow = portal.nextShow;
  const tw = portal.twitch || {};
  if(tw.ok || tw.isLive !== undefined){
    portal.broadcast.viewers = Number(tw.viewers || portal.broadcast.viewers || 0);
    portal.broadcast.live = !!tw.isLive || !!tw.live;
    portal.broadcast.broadcastState = portal.broadcast.live ? 'LIVE' : (portal.broadcast.broadcastState || portal.broadcast.mode || 'OFFLINE');
    portal.broadcast.streamTitle = tw.liveTitle || tw.title || portal.broadcast.streamTitle;
    portal.community.followers = tw.followers ?? portal.community.followers;
    portal.community.subs = tw.subs ?? portal.community.subs;
  }
}
function normalizeNextShow(raw){
  const x = raw || {};
  const dateTime = x.datetime || x.dateTime || (x.date && (x.start || x.time) ? `${x.date}T${x.start || x.time}` : '');
  const title = x.title || x.show || 'Next DJ FOLSOE Broadcast';
  const startLabel = x.timeLabel || x.start || x.time || (dateTime ? formatNextDateLabel(dateTime) : 'Announced soon');
  return {title,show:x.show||title,datetime:dateTime||'',dateTime:dateTime||'',timeLabel:startLabel,theme:x.theme||'Music TV',description:x.description||x.body||'The next show is controlled from admin and appears here automatically.',active:x.active!==false};
}
function formatNextDateLabel(dateTime){
  const d = new Date(dateTime);
  if(!dateTime || isNaN(d.getTime())) return 'Announced soon';
  return d.toLocaleString('en-GB', {weekday:'short', day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit'});
}
function pickTheme(){
  const active = portal.activeTheme || portal?.broadcast?.activeTheme || 'weekend';
  const lib = portal?.themes?.themeLibrary || portal?.themes || {};
  return lib[active] || {title: String(active || 'Music TV').replace(/-/g,' '), background:`themes/${active}.png`};
}
function renderPortal(){
  const homepage = portal.homepage || {};
  const website = portal.website || {};
  const community = portal.community || {};
  const broadcast = portal.broadcast || {};
  const theme = pickTheme();
  const hero = homepage.hero || {};
  const sectionTitles = homepage.sectionTitles || {};
  const live = broadcast.live || broadcast.broadcastState === 'LIVE' || broadcast.mode === 'LIVE SHOW';
  if($('heroThemeBg')) $('heroThemeBg').style.backgroundImage = `url('${hero.background || theme.background || 'themes/weekend.png'}')`;
  if($('navState')) $('navState').textContent = live ? 'LIVE' : (broadcast.broadcastState || broadcast.mode || 'OFFLINE');
  if($('livePill')) { $('livePill').textContent = live ? 'LIVE NOW' : (broadcast.broadcastState || broadcast.mode || 'OFFLINE'); $('livePill').style.color = live ? 'var(--green)' : 'var(--gold)'; }
  setText('heroEyebrow', hero.eyebrow || 'DJ FOLSOE TWITCH · MUSIC STREAMER FROM DENMARK');
  setText('heroTitle', hero.title || 'DJ FOLSOE');
  setText('heroSubtitle', hero.subtitle || 'Dive into my Twitch world');
  setText('heroText', hero.text || website.description || 'Live DJ shows, requests, chart countdowns and community energy from Denmark.');
  setText('currentShow', broadcast.currentShowTitle || broadcast.activeShowTitle || broadcast.activeShow || theme.title || 'Current broadcast');
  setText('streamTitle', broadcast.streamTitle || 'DJ FOLSOE · Twitch music streamer from Denmark');
  setText('metricViewers', broadcast.viewers || 0);
  setText('metricFollowers', community.followers ?? broadcast.followers ?? '—');
  setText('metricSubGoal', `${community.subs || 0} / ${community.subGoal || 100}`);
  setText('metricTheme', theme.title || broadcast.activeTheme || portal.activeTheme || 'Music TV');
  setText('topTicker', (homepage.ticker || []).join('  •  ') || portal?.overlayHub?.ticker || 'DJ FOLSOE TWITCH · MUSIC STREAMER FROM DENMARK');
  setText('nextKicker', sectionTitles.nextKicker || 'NEXT SHOW');
  setText('showsKicker', sectionTitles.showsKicker || 'FEATURED SHOWS');
  setText('showsTitle', sectionTitles.showsTitle || 'Your favorite show');
  setText('aboutKicker', sectionTitles.aboutKicker || 'DISCOVER DJ FOLSOE');
  setText('aboutTitle', sectionTitles.aboutTitle || 'Music TV, Twitch and Danish DJ energy');
  const next = normalizeNextShow(homepage.nextShow || portal.nextShow || {});
  setText('nextTitle', sectionTitles.nextTitle || 'Next DJ FOLSOE Broadcast');
  setText('nextTime', next.timeLabel || 'TBA');
  setText('nextTheme', next.theme || theme.title || 'Music TV');
  setText('nextDescription', next.description || 'Upcoming DJ FOLSOE show will appear here from admin.');
  nextDate = next.datetime ? new Date(next.datetime) : null;
  const shows = homepage.featuredShows || [];
  if($('showCards')) $('showCards').innerHTML = shows.map(s=>`<article class="showCard" style="--accent:${escapeHtml(s.color||'#69e7ff')}"><code>${escapeHtml(s.time||'LIVE')}</code><h3>${escapeHtml(s.title||'Show')}</h3><p>${escapeHtml(s.description||'DJ FOLSOE broadcast show')}</p></article>`).join('');
  const infos = homepage.infoCards || [{title:'Studio',text:'OBS, StreamElements, admin control and theme engine working as one system.'},{title:'Music',text:'Trance, Eurodance, Retro, EDM and Pop Up shows.'},{title:'Chat',text:'Requests, shoutouts, channel points, goals and community moments.'},{title:'Network',text:'A modern Music TV portal connected to Twitch.'}];
  if($('infoCards')) $('infoCards').innerHTML = infos.map(i=>`<div><span>${escapeHtml(i.kicker||'DJ FOLSOE')}</span><b>${escapeHtml(i.title||'Info')}</b><p>${escapeHtml(i.text||'')}</p></div>`).join('');
  setText('aboutText', homepage.aboutText || 'DJ FOLSOE is a Danish Twitch DJ and Music TV project built around live shows, requests, moderators, community and a broadcast look made for TV, mobile and desktop.');
  const chart = homepage.top20 || [];
  if($('chartList')) $('chartList').innerHTML = chart.slice(0,10).map((x,i)=>`<div class="chartRow"><i>#${x.rank||i+1}</i><strong>${escapeHtml(x.artist||'Artist')} - ${escapeHtml(x.title||'Title')}</strong><em>${escapeHtml(x.status||'')}</em></div>`).join('');
  const wall = community.wall || [{title:'Follower journey',text:String(community.followers||'Growing every stream')},{title:'Sub journey',text:`${community.subs||0}/${community.subGoal||100}`},{title:'Song requests',text:community.requestText||'Use !request in chat'},{title:'Twitch chat',text:'Chat and community are shown in the live overlay.'}];
  if($('communityWall')) $('communityWall').innerHTML = wall.map(w=>`<div><span>${escapeHtml(w.kicker||'COMMUNITY')}</span><b>${escapeHtml(w.title||'')}</b><p>${escapeHtml(w.text||'')}</p></div>`).join('');
  setText('communityText', community.text || 'Join the Twitch chat, request music and be part of the DJ FOLSOE broadcast community.');
}
function setText(id, value){ const el=$(id); if(el) el.textContent = value ?? ''; }
function tickCountdown(){
  if(!nextDate || isNaN(nextDate.getTime())){ setText('nextCountdown','TBA'); return; }
  const diff = Math.max(0, nextDate.getTime() - Date.now());
  const h = Math.floor(diff/3600000), m = Math.floor(diff%3600000/60000), s = Math.floor(diff%60000/1000);
  setText('nextCountdown', `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`);
}
function escapeHtml(v){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
document.addEventListener('DOMContentLoaded', loadPortal);
