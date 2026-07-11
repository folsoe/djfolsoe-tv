// DJ FOLSOE NETWORK V928 · WEBSITE DATA WAKE UP
const $ = (id) => document.getElementById(id);
const API_BASE = (window.DJF_API_BASE || 'https://djfolsoe-tv-api.sunefolsoe.workers.dev').replace(/\/$/, '');
let portal = {};
let nextDate = null;
let twitchTimer = null;
let lastCoreStamp = '';

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
function pickBroadcastCore(payload){
  if(!payload || typeof payload !== 'object') return null;
  return payload.core || payload.data || payload.broadcastCore || payload;
}
async function loadApiCore(){
  const apiPayload = await readJson(API_BASE + '/api/broadcast?t=' + Date.now(), null);
  const core = pickBroadcastCore(apiPayload);
  if(core && core.schema){
    core.__source = 'worker-api';
    return core;
  }
  return null;
}
async function loadStaticFallback(){
  // Only used when Worker is unreachable. Static files must never override live worker data.
  const localCore = await readJson('assets/data/broadcast-core.json?t=' + Date.now(), null) || await readJson('data/broadcast-core.json?t=' + Date.now(), null) || {};
  const core = pickBroadcastCore(localCore) || {};
  core.__source = 'static-fallback';
  return core;
}
async function loadPortal(){
  const apiCore = await loadApiCore();
  portal = apiCore || await loadStaticFallback();
  normalizeCore();
  renderPortal();
  tickCountdown();
  setInterval(tickCountdown, 1000);
  startPolling();
}
async function refreshTwitchAndCore(){
  const nextCore = await loadApiCore();
  if(nextCore){
    const stamp = nextCore.updatedAt || JSON.stringify({theme:nextCore.theme,show:nextCore.show,nextShow:nextCore.nextShow,ticker:nextCore.ticker,community:nextCore.community});
    if(stamp !== lastCoreStamp){
      lastCoreStamp = stamp;
      portal = nextCore;
      normalizeCore();
      renderPortal();
    }
  }
}
function startPolling(){
  if(twitchTimer) clearInterval(twitchTimer);
  twitchTimer = setInterval(refreshTwitchAndCore, 15000);
  document.addEventListener('visibilitychange', ()=>{ if(!document.hidden) refreshTwitchAndCore(); });
}
function normalizeCore(){
  // V921 accepts clean broadcast-core/v2 and also old V919 compatibility payloads.
  const old = portal || {};
  const b = old.broadcast || {};
  const hp = old.homepage || {};
  const heroOld = hp.hero || {};
  const ov = old.overlay || old.overlayHub || {};
  const cp = ov.controlPanel || {};
  const showTitle = old.show?.current || old.show?.title || b.activeShow || b.activeShowTitle || cp.title || 'DJ FOLSOE';
  const mode = old.show?.mode || old.show?.state || b.mode || b.broadcastState || ov.state || cp.status || 'OFFLINE';
  const themeId = old.theme?.id || old.activeTheme || b.activeTheme || ov.activeTheme || cp.theme || 'weekend';
  const tickerText = old.ticker?.text || (Array.isArray(hp.ticker) ? hp.ticker.join(' · ') : '') || ov.ticker || cp.infoLine || 'DJ FOLSOE TWITCH · MUSIC STREAMER FROM DENMARK';
  portal.twitch = old.twitch || {};
  portal.show = { current: showTitle, title: showTitle, mode, state: mode, live: !!old.show?.live || !!b.live, viewers: old.show?.viewers ?? b.viewers ?? cp.viewers ?? 0, streamTitle: old.show?.streamTitle || b.streamTitle || showTitle };
  portal.theme = { id: themeId, title: old.theme?.title || String(themeId).replace(/[-_]/g,' ').replace(/\b\w/g,c=>c.toUpperCase()), background: old.theme?.background || heroOld.background || `themes/${themeId}.png` };
  portal.hero = { eyebrow:'DJ FOLSOE TWITCH · MUSIC STREAMER FROM DENMARK', title:'DJ FOLSOE', subtitle:'Dive into my Twitch world', text:'Live DJ shows, song requests, Top 20 countdowns and community energy from Denmark.', ...heroOld, ...(old.hero||{}) };
  portal.community = { followers:null, followerGoal:1000, subs:0, subGoal:100, requestText:'Use !request Artist - Title in Twitch chat', specialEvent:'', ...(old.community||{}) };
  portal.nextShow = normalizeNextShow(old.nextShow || hp.nextShow || cp.nextShow || {});
  portal.ticker = { text: tickerText, items: old.ticker?.items || (tickerText ? [tickerText] : []) };
  portal.featuredShows = old.featuredShows || hp.featuredShows || [];
  portal.top20 = old.top20 || hp.top20 || [];
  portal.overlay = { title: showTitle, status: mode, infoLine: tickerText, requestText: portal.community.requestText, specialEvent: portal.community.specialEvent, ...(old.overlay && !old.overlay.controlPanel ? old.overlay : {}) };
  const tw = portal.twitch || {};
  if(tw.ok || tw.isLive !== undefined){
    portal.show.viewers = Number(tw.viewers || portal.show.viewers || 0);
    portal.show.live = !!tw.isLive || !!tw.live;
    portal.show.state = portal.show.live ? 'LIVE' : portal.show.state;
    portal.show.streamTitle = tw.liveTitle || tw.title || portal.show.streamTitle;
    portal.community.followers = tw.followers ?? portal.community.followers;
    portal.community.subs = tw.subs ?? portal.community.subs;
  }
  // Backward aliases for existing DOM render code
  portal.broadcast = { activeShow: portal.show.current, activeShowTitle: portal.show.title, mode: portal.show.mode, broadcastState: portal.show.state, activeTheme: portal.theme.id, live: portal.show.live, viewers: portal.show.viewers, streamTitle: portal.show.streamTitle };
  portal.homepage = { hero: {...portal.hero, background: portal.theme.background}, ticker: portal.ticker.items.length ? portal.ticker.items : [portal.ticker.text], nextShow: portal.nextShow, featuredShows: portal.featuredShows, top20: portal.top20, sectionTitles:{nextKicker:'NEXT SHOW',nextTitle:'Next DJ FOLSOE Broadcast',showsKicker:'FEATURED SHOWS',showsTitle:'Your favorite show',aboutKicker:'DISCOVER DJ FOLSOE',aboutTitle:'Music TV, Twitch and Danish DJ energy'}, aboutText: old.homepage?.aboutText || 'DJ FOLSOE is a Danish Twitch DJ and Music TV project built around live shows, requests, moderators, community and a broadcast look made for TV, mobile and desktop.'};
  portal.overlayHub = { ticker: portal.ticker.text, controlPanel: { title: portal.show.current, status: portal.show.state, theme: portal.theme.id, viewers: portal.show.viewers, followers: portal.community.followers, subs: portal.community.subs, subGoal: portal.community.subGoal, nextShow: portal.nextShow, infoLine: portal.ticker.text, requestText: portal.community.requestText, specialEvent: portal.community.specialEvent } };
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
  const active = portal?.theme?.id || portal.activeTheme || portal?.broadcast?.activeTheme || 'weekend';
  const lib = portal?.themes?.themeLibrary || portal?.themes || {};
  const fromLib = lib[active] || {};
  return {
    id: active,
    title: portal?.theme?.title || fromLib.title || String(active || 'Music TV').replace(/[-_]/g,' ').replace(/\b\w/g,c=>c.toUpperCase()),
    background: portal?.theme?.background || fromLib.background || `themes/${active}.png`
  };
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
  const twitchProfile = portal.twitch || {};
  const profileImage = twitchProfile.profileImage || twitchProfile.profile_image_url || '';
  const profileDescription = twitchProfile.description || hero.text || 'Live Music TV, requests, charts and community energy from Denmark.';
  const profileName = twitchProfile.displayName || twitchProfile.display_name || 'DJ FOLSOE';
  if($('navProfileImage')) {
    $('navProfileImage').src = profileImage || 'https://static-cdn.jtvnw.net/jtv_user_pictures/b759d05a-f6ea-41e5-b9e0-f834ad3d0eb3-profile_image-300x300.png';
    $('navProfileImage').alt = profileName + ' Twitch profile';
  }
  setText('navDisplayName', profileName);
  setText('navFollowers', `${Number(twitchProfile.followers ?? community.followers ?? 0).toLocaleString()} FOLLOWERS`);
  setText('navProfileDescription', profileDescription);
  setText('navLiveText', live ? 'LIVE ON TWITCH' : 'TWITCH CHANNEL');
  if($('navLiveDot')) $('navLiveDot').classList.toggle('is-live', live);
  if($('heroThemeBg')) $('heroThemeBg').style.backgroundImage = `url('${hero.background || theme.background || 'themes/weekend.png'}')`;
  document.documentElement.setAttribute('data-djf-theme', theme.id || broadcast.activeTheme || 'weekend');
  document.documentElement.setAttribute('data-djf-source', portal.__source || 'unknown');
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
  setText('topTicker', portal?.ticker?.text || (homepage.ticker || []).join('  •  ') || portal?.overlayHub?.ticker || 'DJ FOLSOE TWITCH · MUSIC STREAMER FROM DENMARK');
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
  const shows = portal.featuredShows || homepage.featuredShows || [];
  if($('showCards')) $('showCards').innerHTML = shows.map(s=>`<article class="showCard" style="--accent:${escapeHtml(s.color||'#69e7ff')}"><code>${escapeHtml(s.time||'LIVE')}</code><h3>${escapeHtml(s.title||'Show')}</h3><p>${escapeHtml(s.description||'DJ FOLSOE broadcast show')}</p></article>`).join('');
  const infos = homepage.infoCards || [{title:'Studio',text:'OBS, StreamElements, admin control and theme engine working as one system.'},{title:'Music',text:'Trance, Eurodance, Retro, EDM and Pop Up shows.'},{title:'Chat',text:'Requests, shoutouts, channel points, goals and community moments.'},{title:'Network',text:'A modern Music TV portal connected to Twitch.'}];
  if($('infoCards')) $('infoCards').innerHTML = infos.map(i=>`<div><span>${escapeHtml(i.kicker||'DJ FOLSOE')}</span><b>${escapeHtml(i.title||'Info')}</b><p>${escapeHtml(i.text||'')}</p></div>`).join('');
  setText('aboutText', homepage.aboutText || 'DJ FOLSOE is a Danish Twitch DJ and Music TV project built around live shows, requests, moderators, community and a broadcast look made for TV, mobile and desktop.');
  const chart = portal.top20 || homepage.top20 || [];
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


// =========================================================
// DJ FOLSOE WEBSITE EXTENSION CLIENTS V932.0
// Read-only clients for EXT001, EXT002 and EXT003.
// Existing website/core rendering remains unchanged.
// =========================================================
async function loadWebsiteExtensions(){
  await Promise.allSettled([
    loadViewerCommandsExtension()
  ]);
}

async function loadPresenceExtension(){
  const stats = await readJson(API_BASE + '/api/ext002/stats?t=' + Date.now(), null);
  if(!stats || stats.ok === false) return;
  setText('extOnlineNow', Number(stats.online_now || 0).toLocaleString());
  setText('extTodayViewers', Number(stats.today_viewers || 0).toLocaleString());
  setText('extTotalHours', Number(stats.total_hours || 0).toLocaleString());
  setText('extTotalProfiles', Number(stats.total_viewers || 0).toLocaleString());
  const onlinePayload = await readJson(API_BASE + '/api/ext002/online?limit=8&t=' + Date.now(), {online:[]});
  const online = Array.isArray(onlinePayload?.online) ? onlinePayload.online : [];
  const wrap = $('extOnlineProfiles');
  if(!wrap) return;
  wrap.innerHTML = online.length ? online.map(renderPresenceProfile).join('') : '<div class="extEmpty">No viewers are registered online right now.</div>';
}

function renderPresenceProfile(v){
  return `<article class="extProfileCard">
    <img src="${escapeHtml(v.profile_image || '')}" alt="">
    <div><h3>${escapeHtml(v.display_name || v.login || 'Viewer')}</h3><p>@${escapeHtml(v.login || '')} · ${Number(v.current_session_minutes || 0)} min online</p></div>
    <div class="extProfileStats"><div><b>${Number(v.total_sessions || 0)}</b><span>Sessions</span></div><div><b>${Number(v.total_minutes || 0)}</b><span>Total min</span></div><div><b>${Number(v.streak_days || 0)}</b><span>Streak</span></div></div>
  </article>`;
}

async function loadViewerCommandsExtension(){
  const payload = await readJson(API_BASE + '/api/ext003/active?overlay=1&viewer=1&t=' + Date.now(), {commands:[]});
  const commands = Array.isArray(payload?.commands) ? payload.commands : [];
  const wrap = $('extViewerCommands');
  if(!wrap) return;
  wrap.innerHTML = commands.length ? commands.map(c=>`<article class="extCommandCard"><code>${escapeHtml(c.usage || c.command || '')}</code><b>${escapeHtml(c.title || 'Viewer command')}</b><p>${escapeHtml(c.description || '')}</p><span>${escapeHtml(c.category || 'COMMAND')}</span></article>`).join('') : '<div class="extEmpty">Viewer commands will appear here automatically.</div>';
}

async function loadCommunityProfilesExtension(){
  const payload = await readJson(API_BASE + '/api/ext001/leaderboard?limit=8&t=' + Date.now(), {viewers:[]});
  const viewers = Array.isArray(payload?.viewers) ? payload.viewers : [];
  const wrap = $('extCommunityProfilesGrid');
  if(!wrap) return;
  wrap.innerHTML = viewers.length ? viewers.map(v=>`<article class="extProfileCard"><img src="${escapeHtml(v.profile_image || v.avatar || '')}" alt=""><div><h3>${escapeHtml(v.display_name || v.login || 'Viewer')}</h3><p>@${escapeHtml(v.login || '')}</p></div><div class="extProfileStats"><div><b>${Number(v.level || 1)}</b><span>Level</span></div><div><b>${Number(v.messages || 0)}</b><span>Chat</span></div><div><b>${Number(v.xp || 0)}</b><span>XP</span></div></div></article>`).join('') : '<div class="extEmpty">Viewer profiles will appear as Twitch users are registered.</div>';
}

document.addEventListener('DOMContentLoaded',()=>{ loadPortal(); loadWebsiteExtensions(); setInterval(loadWebsiteExtensions,30000); });

// =========================================================
// DJ FOLSOE V937.0 — WEBSITE LIVE ACTIVITY TICKER CLIENT
// Reads remembered Twitch events from Cloudflare EXT004.
// =========================================================
let websiteActivitySignature = '';
let websiteActivityTimer = null;

function activityRelativeTime(value){
  const when = new Date(value || 0).getTime();
  if(!when) return 'JUST NOW';
  const seconds = Math.max(0, Math.round((Date.now() - when) / 1000));
  if(seconds < 45) return 'JUST NOW';
  if(seconds < 3600) return `${Math.floor(seconds / 60)} MIN AGO`;
  if(seconds < 86400) return `${Math.floor(seconds / 3600)} H AGO`;
  return `${Math.floor(seconds / 86400)} D AGO`;
}

function activityIcon(type){
  return ({
    request:'♫',
    follow:'♥',
    sub:'★',
    resub:'★',
    gift_sub:'✦',
    bits:'◆',
    raid:'⚡',
    reward:'◈',
    poll:'▥',
    prediction:'◇',
    hype_train:'🔥',
    stream_online:'◉',
    stream_offline:'○',
    goal:'◎',
    channel_update:'▣',
    manual:'●'
  })[type] || '●';
}

function activityLabel(type){
  return ({
    request:'SONG REQUEST',
    follow:'NEW FOLLOWER',
    sub:'NEW SUB',
    resub:'RESUB',
    gift_sub:'GIFT SUB',
    bits:'BITS',
    raid:'RAID',
    reward:'CHANNEL POINTS',
    poll:'POLL',
    prediction:'PREDICTION',
    hype_train:'HYPE TRAIN',
    stream_online:'LIVE',
    stream_offline:'OFFLINE',
    goal:'GOAL',
    channel_update:'CHANNEL UPDATE',
    manual:'NETWORK'
  })[type] || 'TWITCH';
}

function activityTickerItem(event){
  const avatar = event.avatar
    ? `<img class="activityTickerAvatar" src="${escapeHtml(event.avatar)}" alt="">`
    : `<span class="activityTickerIcon" aria-hidden="true">${activityIcon(event.type)}</span>`;
  const headline = event.headline || event.title || 'DJ FOLSOE TWITCH ACTIVITY';
  const detail = event.detail || event.message || '';
  return `<article class="activityTickerItem" data-event-id="${escapeHtml(event.id || '')}">
    ${avatar}
    <span class="activityTickerCopy">
      <strong>${escapeHtml(headline)}</strong>
      <small>${escapeHtml(detail || activityRelativeTime(event.timestamp))}</small>
    </span>
    <span class="activityTickerTag">${escapeHtml(activityLabel(event.type))}</span>
  </article>`;
}

async function loadWebsiteActivityTicker(){
  const root = $('websiteActivityTicker');
  const track = $('activityTickerTrack');
  if(!root || !track) return;

  const payload = await readJson(API_BASE + '/api/ext004/feed?limit=30&t=' + Date.now(), null);
  const events = Array.isArray(payload?.events) ? payload.events : [];
  if(!events.length){
    root.classList.remove('has-events');
    setText('activityTickerLead','NETWORK');
    setText('activityTickerType','TWITCH');
    setText('activityTickerTime','WAITING FOR ACTIVITY');
    return;
  }

  const signature = events.slice(0,8).map(e=>e.id || `${e.type}:${e.timestamp}`).join('|');
  const sourceItems = events.slice(0,20);
  const html = sourceItems.map(activityTickerItem).join('');
  track.innerHTML = html + html;
  track.style.setProperty('--activity-duration', `${Math.max(34, sourceItems.length * 6)}s`);
  root.classList.add('has-events');
  setText('activityTickerLead','LIVE ACTIVITY');
  setText('activityTickerType', activityLabel(events[0].type));
  setText('activityTickerTime', activityRelativeTime(events[0].timestamp));

  if(websiteActivitySignature && signature !== websiteActivitySignature){
    root.classList.remove('is-new');
    void root.offsetWidth;
    root.classList.add('is-new');
  }
  websiteActivitySignature = signature;
}

function startWebsiteActivityTicker(){
  if(websiteActivityTimer) clearInterval(websiteActivityTimer);
  loadWebsiteActivityTicker();
  websiteActivityTimer = setInterval(loadWebsiteActivityTicker, 8000);
  document.addEventListener('visibilitychange', ()=>{
    if(!document.hidden) loadWebsiteActivityTicker();
  });
}

document.addEventListener('DOMContentLoaded', startWebsiteActivityTicker);
