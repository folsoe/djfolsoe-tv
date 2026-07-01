const $ = (id) => document.getElementById(id);
const API_BASE = (window.DJF_API_BASE || '').replace(/\/$/, '');
let portal = {};
let nextDate = null;

async function readJson(url, fallback){
  try{ const r = await fetch(url, {cache:'no-store'}); if(r.ok) return await r.json(); }catch(e){}
  return fallback;
}
async function loadPortal(){
  const localHomepage = await readJson('data/homepage.json', null) || await readJson('assets/data/homepage.json', null) || {};
  const localWebsite = await readJson('data/website.json', null) || {};
  const localCommunity = await readJson('data/community.json', null) || {};
  const localBroadcast = await readJson('data/broadcast.json', {}) || {};
  const localThemes = await readJson('data/themes.json', {}) || {};
  let cloud = {};
  if(API_BASE){ cloud = await readJson(API_BASE + '/api/website-portal', {}); }
  portal = deepMerge({homepage:localHomepage, website:localWebsite, community:localCommunity, broadcast:localBroadcast, themes:localThemes}, cloud || {});
  renderPortal();
  tickCountdown();
  setInterval(tickCountdown, 1000);
}
function deepMerge(a,b){
  const out = Array.isArray(a) ? [...a] : {...(a||{})};
  Object.keys(b||{}).forEach(k=>{
    if(b[k] && typeof b[k]==='object' && !Array.isArray(b[k])) out[k]=deepMerge(out[k]||{}, b[k]);
    else out[k]=b[k];
  });
  return out;
}
function pickTheme(){
  const active = portal?.themes?.activeTheme || portal?.broadcast?.activeTheme || portal?.broadcast?.activeShow || 'weekend';
  const lib = portal?.themes?.themeLibrary || {};
  return lib[active] || Object.values(lib)[0] || {title:'Music TV', background:'themes/weekend.png'};
}
function renderPortal(){
  const homepage = portal.homepage || {};
  const website = portal.website || {};
  const community = portal.community || {};
  const broadcast = portal.broadcast || {};
  const theme = pickTheme();
  const hero = homepage.hero || {};
  const live = broadcast.live || broadcast.broadcastState === 'LIVE';
  $('heroThemeBg').style.backgroundImage = `url('${hero.background || theme.background || 'themes/weekend.png'}')`;
  $('navState').textContent = live ? 'LIVE' : (broadcast.broadcastState || 'OFFLINE');
  $('livePill').textContent = live ? 'LIVE NOW' : (broadcast.broadcastState || 'OFFLINE');
  $('livePill').style.color = live ? 'var(--green)' : 'var(--gold)';
  $('heroEyebrow').textContent = hero.eyebrow || 'MUSIC TV FROM DENMARK';
  $('heroTitle').textContent = hero.title || 'DJ FOLSOE LIVE';
  $('heroSubtitle').textContent = hero.subtitle || 'One channel. Live shows. Community energy.';
  $('heroText').textContent = hero.text || website.description || 'Modern live DJ shows, requests, chart countdowns and retro music television vibes from Denmark.';
  $('currentShow').textContent = broadcast.currentShowTitle || broadcast.activeShowTitle || theme.title || 'Current broadcast';
  $('streamTitle').textContent = broadcast.streamTitle || hero.streamTitle || 'DJ FOLSOE · Music TV from Denmark';
  $('metricViewers').textContent = broadcast.viewers || 0;
  $('metricFollowers').textContent = community.followers || broadcast.followers || '—';
  $('metricSubGoal').textContent = `${community.subs || 0} / ${community.subGoal || 100}`;
  $('metricTheme').textContent = theme.title || 'Music TV';
  $('topTicker').textContent = (homepage.ticker || []).join('  •  ') || 'DJ FOLSOE LIVE • REQUESTS • TOP 20 • MUSIC TV FROM DENMARK';
  const next = homepage.nextShow || {};
  $('nextTitle').textContent = next.title || 'Next broadcast';
  $('nextTime').textContent = next.timeLabel || next.datetime || 'TBA';
  $('nextTheme').textContent = next.theme || theme.title || 'Music TV';
  $('nextDescription').textContent = next.description || 'Upcoming DJ FOLSOE show will appear here from admin.';
  nextDate = next.datetime ? new Date(next.datetime) : null;
  const shows = homepage.featuredShows || [];
  $('showCards').innerHTML = shows.map(s=>`<article class="showCard" style="--accent:${escapeHtml(s.color||'#69e7ff')}"><code>${escapeHtml(s.time||'LIVE')}</code><h3>${escapeHtml(s.title||'Show')}</h3><p>${escapeHtml(s.description||'DJ FOLSOE broadcast show')}</p></article>`).join('');
  const infos = homepage.infoCards || [{title:'Studio',text:'Live DJ setup and broadcast look'},{title:'Requests',text:'Viewer music requests in Twitch chat'},{title:'Community',text:'Mods, chat and regular viewers'},{title:'Music',text:'Trance, Retro, Eurodance, EDM and more'}];
  $('infoCards').innerHTML = infos.map(i=>`<div><span>${escapeHtml(i.kicker||'DJ FOLSOE')}</span><b>${escapeHtml(i.title||'Info')}</b><p>${escapeHtml(i.text||'')}</p></div>`).join('');
  $('aboutText').textContent = homepage.aboutText || $('aboutText').textContent;
  const chart = homepage.top20 || [];
  $('chartList').innerHTML = chart.slice(0,10).map((x,i)=>`<div class="chartRow"><i>#${x.rank||i+1}</i><strong>${escapeHtml(x.artist||'Artist')} - ${escapeHtml(x.title||'Title')}</strong><em>${escapeHtml(x.status||'')}</em></div>`).join('');
  const wall = community.wall || [{title:'Followers',text:String(community.followers||'Growing every stream')},{title:'Subs',text:`${community.subs||0}/${community.subGoal||100}`},{title:'Requests',text:'Use !request in chat'},{title:'Chat',text:'Box 4 remains Twitch chat'}];
  $('communityWall').innerHTML = wall.map(w=>`<div><span>${escapeHtml(w.kicker||'COMMUNITY')}</span><b>${escapeHtml(w.title||'')}</b><p>${escapeHtml(w.text||'')}</p></div>`).join('');
  $('communityText').textContent = community.text || $('communityText').textContent;
}
function tickCountdown(){
  if(!nextDate || isNaN(nextDate.getTime())){ $('nextCountdown').textContent='TBA'; return; }
  const diff = Math.max(0, nextDate.getTime() - Date.now());
  const h = Math.floor(diff/3600000), m = Math.floor(diff%3600000/60000), s = Math.floor(diff%60000/1000);
  $('nextCountdown').textContent = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}
function escapeHtml(v){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
document.addEventListener('DOMContentLoaded', loadPortal);
