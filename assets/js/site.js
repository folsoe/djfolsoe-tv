const $ = (id) => document.getElementById(id);
const API_BASE = (window.DJF_API_BASE || '').replace(/\/$/, '');
const API_ROOT = API_BASE || '';
let twitchTimer = null;
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
  let twitch = {};
  let computedHomepage = {};
  let schedule = {};
  cloud = await readJson(API_ROOT + '/api/website-portal?t=' + Date.now(), {});
  computedHomepage = await readJson(API_ROOT + '/api/homepage?t=' + Date.now(), {});
  schedule = await readJson(API_ROOT + '/api/show-schedule?t=' + Date.now(), {});
  twitch = await readJson(API_ROOT + '/api/twitch-profile?live=1&t=' + Date.now(), {});
  portal = deepMerge({homepage:localHomepage, website:localWebsite, community:localCommunity, broadcast:localBroadcast, themes:localThemes}, cloud || {});
  const apiNextShow = normalizeNextShow(schedule.nextShow || computedHomepage.nextShow || cloud.nextShow || cloud?.homepage?.nextShow || portal?.homepage?.nextShow || {});
  portal.homepage = Object.assign({}, portal.homepage || {}, {
    nextShow: apiNextShow,
    upcomingShows: schedule.upcomingShows || computedHomepage.upcomingShows || portal.homepage?.upcomingShows || []
  });
  portal.twitch = twitch || {};
  if(portal.twitch && portal.twitch.ok){
    portal.broadcast = Object.assign({}, portal.broadcast || {}, {
      viewers: portal.twitch.viewers || 0,
      live: !!portal.twitch.isLive,
      broadcastState: portal.twitch.isLive ? 'LIVE' : (portal.broadcast?.broadcastState || 'OFFLINE'),
      streamTitle: portal.twitch.liveTitle || portal.broadcast?.streamTitle
    });
    portal.community = Object.assign({}, portal.community || {}, {
      followers: portal.twitch.followers ?? portal.community?.followers
    });
  }
  renderPortal();
  tickCountdown();
  setInterval(tickCountdown, 1000);
  startTwitchLivePolling();
}
async function refreshTwitchLive(){
  const twitch = await readJson(API_ROOT + '/api/twitch-profile?live=1&t=' + Date.now(), null);
  if(!twitch || !twitch.ok) return;
  portal.twitch = twitch;
  portal.broadcast = Object.assign({}, portal.broadcast || {}, {
    viewers: Number(twitch.viewers || 0),
    live: !!twitch.isLive,
    broadcastState: twitch.isLive ? 'LIVE' : (portal.broadcast?.broadcastState || 'OFFLINE'),
    streamTitle: twitch.liveTitle || portal.broadcast?.streamTitle,
    currentShowTitle: twitch.liveTitle || portal.broadcast?.currentShowTitle
  });
  portal.community = Object.assign({}, portal.community || {}, {
    followers: twitch.followers ?? portal.community?.followers,
    subs: twitch.subs ?? portal.community?.subs,
    subGoal: portal.community?.subGoal || 100
  });
  renderPortal();
}
function startTwitchLivePolling(){
  if(twitchTimer) clearInterval(twitchTimer);
  twitchTimer = setInterval(refreshTwitchLive, 30000);
  document.addEventListener('visibilitychange', ()=>{ if(!document.hidden) refreshTwitchLive(); });
}
function normalizeNextShow(raw){
  const x = raw || {};
  const dateTime = x.datetime || x.dateTime || (x.date && (x.start || x.time) ? `${x.date}T${x.start || x.time}` : '');
  const title = x.title || x.show || 'Next DJ FOLSOE Broadcast';
  const startLabel = x.timeLabel || x.start || x.time || (dateTime ? formatNextDateLabel(dateTime) : 'Announced soon');
  return {
    title,
    show: x.show || title,
    datetime: dateTime || '',
    dateTime: dateTime || '',
    timeLabel: startLabel,
    theme: x.theme || 'Music TV',
    description: x.description || x.body || 'The next show is controlled from admin and appears here automatically.',
    active: x.active !== false
  };
}
function formatNextDateLabel(dateTime){
  const d = new Date(dateTime);
  if(!dateTime || isNaN(d.getTime())) return 'Announced soon';
  return d.toLocaleString('en-GB', {weekday:'short', day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit'});
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
  const sectionTitles = homepage.sectionTitles || {};
  const live = broadcast.live || broadcast.broadcastState === 'LIVE';
  $('heroThemeBg').style.backgroundImage = `url('${hero.background || theme.background || 'themes/weekend.png'}')`;
  $('navState').textContent = live ? 'LIVE' : (broadcast.broadcastState || 'OFFLINE');
  $('livePill').textContent = live ? 'LIVE NOW' : (broadcast.broadcastState || 'OFFLINE');
  $('livePill').style.color = live ? 'var(--green)' : 'var(--gold)';
  $('heroEyebrow').textContent = hero.eyebrow || 'DJ FOLSOE TWITCH · MUSIC STREAMER FROM DENMARK';
  $('heroTitle').textContent = hero.title || 'DJ FOLSOE';
  $('heroSubtitle').textContent = hero.subtitle || 'Dive into my Twitch world';
  $('heroText').textContent = hero.text || website.description || 'Modern live DJ shows, requests, chart countdowns and retro music television vibes from Denmark.';
  $('currentShow').textContent = broadcast.currentShowTitle || broadcast.activeShowTitle || theme.title || 'Current broadcast';
  $('streamTitle').textContent = broadcast.streamTitle || hero.streamTitle || 'DJ FOLSOE · Twitch music streamer from Denmark';
  $('metricViewers').textContent = broadcast.viewers || 0;
  $('metricFollowers').textContent = community.followers ?? broadcast.followers ?? '—';
  $('metricSubGoal').textContent = `${community.subs || 0} / ${community.subGoal || 100}`;
  $('metricTheme').textContent = theme.title || 'Music TV';
  $('topTicker').textContent = (homepage.ticker || []).join('  •  ') || 'DJ FOLSOE LIVE • REQUESTS • TOP 20 • MUSIC TV FROM DENMARK';
  if($('nextKicker')) $('nextKicker').textContent = sectionTitles.nextKicker || 'NEXT SHOW';
  if($('showsKicker')) $('showsKicker').textContent = sectionTitles.showsKicker || 'FEATURED SHOWS';
  if($('showsTitle')) $('showsTitle').textContent = sectionTitles.showsTitle || 'Your favorite show';
  if($('aboutKicker')) $('aboutKicker').textContent = sectionTitles.aboutKicker || 'DISCOVER DJ FOLSOE';
  if($('aboutTitle')) $('aboutTitle').textContent = sectionTitles.aboutTitle || 'Music TV, Twitch and Danish DJ energy';
  const next = normalizeNextShow(homepage.nextShow || portal.nextShow || {});
  $('nextTitle').textContent = sectionTitles.nextTitle || next.title || 'Next DJ FOLSOE Broadcast';
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
  const wall = community.wall || [{title:'Followers',text:String(community.followers||'Growing every stream')},{title:'Subs',text:`${community.subs||0}/${community.subGoal||100}`},{title:'Requests',text:'Use !request in chat'},{title:'Twitch chat',text:'Chat and community are shown in the live overlay.'}];
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
