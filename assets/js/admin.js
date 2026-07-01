/* DJ FOLSOE NETWORK V919 · BROADCAST CORE SYNC */
const DEFAULT_API_BASE = 'https://djfolsoe-tv-api.sunefolsoe.workers.dev';
const TWITCH_URL = 'https://www.twitch.tv/djfolsoe';
const WEBSITE_URL = 'https://folsoetv.dk';
const SHOW_THEME_MAP = {
  'DJ FOLSOE':'weekend','Good Morning Twitch':'morning','Trance Tuesday':'trance','Eurodance':'eurodance','Fredagsbar':'fredagsbar','Retro Hits':'retro','FOLSOE Top 20':'chart','Pop Up Live':'popup','Summer Beats':'summer','Weekend Vibes':'weekend'
};
let twitchData = {ok:false,isLive:false,viewers:0,followers:null,subs:null,liveTitle:''};
const $ = (id)=>document.getElementById(id);
const val = (id, fallback='')=>($(id)?.value ?? fallback);
const set = (id, value)=>{ const el=$(id); if(el) el.textContent = value ?? ''; };
const setValue = (id, value)=>{ const el=$(id); if(el && value !== undefined && value !== null) el.value = value; };
function apiBase(){ return (localStorage.getItem('DJF_API_BASE') || window.DJF_API_BASE || DEFAULT_API_BASE).replace(/\/$/,''); }
function token(){ return (localStorage.getItem('DJF_ADMIN_TOKEN') || val('adminToken') || val('advancedToken') || '').trim(); }
function headers(){ const h={'content-type':'application/json'}; const t=token(); if(t){ h['x-admin-token']=t; h['authorization']='Bearer '+t; } return h; }
async function getJson(path, fallback=null){
  try{ const r=await fetch(apiBase()+path,{cache:'no-store',headers:headers()}); const txt=await r.text(); let data={}; try{data=JSON.parse(txt)}catch{data={raw:txt}}; if(!r.ok) throw new Error(data.error||data.message||r.statusText); return data; }catch(e){ return fallback; }
}
async function postJson(path, body){
  const r=await fetch(apiBase()+path,{method:'POST',cache:'no-store',headers:headers(),body:JSON.stringify(body)});
  const txt=await r.text(); let data={}; try{data=JSON.parse(txt)}catch{data={raw:txt}};
  if(!r.ok) throw new Error(data.error || data.message || txt || ('HTTP '+r.status));
  return data;
}
function status(msg, cls=''){
  const box=$('statusBox'); if(box){ box.textContent = msg; box.className = cls; }
  const adv=$('advancedStatus'); if(adv && cls==='bad') adv.textContent = msg;
}
function djfSaveSettings(){
  const api = val('apiBase'); if(api) localStorage.setItem('DJF_API_BASE', api.replace(/\/$/,''));
  const t = val('adminToken') || val('advancedToken'); if(t) localStorage.setItem('DJF_ADMIN_TOKEN', t);
  setValue('adminToken', token()); setValue('advancedToken', token()); setValue('apiBase', apiBase());
  status('✅ Settings saved.');
}
function djfToggleAdvanced(){ $('advancedPanel')?.toggleAttribute('open'); }
function djfOpenWebsite(){ window.open(WEBSITE_URL,'_blank'); }
function djfOpenTwitch(){ window.open(TWITCH_URL,'_blank'); }
function djfOpenApi(path){ window.open(apiBase()+path,'_blank'); }
function djfPresetMode(mode){ setValue('mode', mode); djfPreview(); }
function nextDateTime(){ const d=val('nextShowDate'); const t=val('nextShowTime'); return d&&t ? `${d}T${t}` : ''; }
function nextTimeLabel(dt){ if(!dt) return 'Announced soon'; const d=new Date(dt); if(isNaN(d.getTime())) return 'Announced soon'; return d.toLocaleString('en-GB',{weekday:'short',day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}); }
function buildPayload(){
  const show = val('currentShow','DJ FOLSOE');
  const theme = val('theme', SHOW_THEME_MAP[show] || 'weekend');
  const mode = val('mode','OFFLINE');
  const title = val('heroTitle','DJ FOLSOE');
  const subtitle = val('heroSubtitle','Dive into my Twitch world');
  const text = val('heroText','Live DJ shows, song requests, Top 20 countdowns and community energy from Denmark.');
  const ticker = val('ticker','LIVE DJ SHOWS FROM DENMARK · REQUEST A SONG IN TWITCH CHAT');
  const dt = nextDateTime();
  const nextShow = {title:val('nextShowTitle','Next DJ FOLSOE Broadcast'),show:val('nextShowTitle','Next DJ FOLSOE Broadcast'),datetime:dt,dateTime:dt,timeLabel:nextTimeLabel(dt),theme:val('nextShowTheme',theme),description:val('nextShowDescription','The next show is controlled from admin and appears automatically on website and overlay.'),active:true};
  const followers = twitchData.followers ?? null;
  const subs = Number(twitchData.subs ?? val('subs',0) ?? 0);
  const community = {
    followers, subs, subGoal:Number(val('subGoal',100)), followerGoal:Number(val('followerGoal',1000)),
    text:val('heroText',''), requestText:val('requestText','Use !request Artist - Title in Twitch chat'), specialEvent:val('specialMessage',''),
    wall:[
      {kicker:'FOLLOWERS',title:'Follower journey',text: followers ? `${followers}/${val('followerGoal',1000)} followers` : `Goal: ${val('followerGoal',1000)} followers`},
      {kicker:'SUBS',title:'Sub journey',text:`${subs}/${val('subGoal',100)} subs`},
      {kicker:'REQUESTS',title:'Song requests',text:val('requestText','Use !request Artist - Title in Twitch chat')},
      {kicker:'LIVE CHAT',title:'Twitch chat',text:'Chat and community are shown in the live overlay.'}
    ]
  };
  const broadcast = {version:'V919 Broadcast Core Sync',mode,broadcastState:mode,activeShow:show,activeShowTitle:show,activeTheme:theme,live:twitchData.isLive || mode==='LIVE SHOW',viewers:Number(twitchData.viewers||0),followers,streamTitle:twitchData.liveTitle || `${show} · DJ FOLSOE Twitch music streamer from Denmark`,updatedAt:new Date().toISOString()};
  const homepage = {
    version:'V919 Broadcast Core Sync',
    hero:{eyebrow:val('eyebrow','DJ FOLSOE TWITCH · MUSIC STREAMER FROM DENMARK'),title,subtitle,text,background:`themes/${theme}.png`},
    ticker:[ticker],nextShow,
    sectionTitles:{nextKicker:'NEXT SHOW',nextTitle:'Next DJ FOLSOE Broadcast',showsKicker:'FEATURED SHOWS',showsTitle:'Your favorite show',aboutKicker:'DISCOVER DJ FOLSOE',aboutTitle:'Music TV, Twitch and Danish DJ energy'},
    featuredShows:[
      {time:'Morning',title:'Good Morning Twitch',description:'Bright morning mood, coffee, chat and fresh music.',color:'#ffe36e'},
      {time:'Tuesday',title:'Trance Tuesday',description:'Melodic trance, energy and emotional peak-time sound.',color:'#62ecff'},
      {time:'Special',title:'Eurodance',description:'90s and 00s dance classics with full Music TV nostalgia.',color:'#ff4bd8'},
      {time:'Friday',title:'Fredagsbar',description:'Weekend mode, party classics and Danish Friday energy.',color:'#6cffb5'},
      {time:'Sunday',title:'Retro Hits',description:'70s, 80s and 90s memories with viewer favourites.',color:'#ffe36e'},
      {time:'Surprise',title:'Pop Up Live',description:'The stream that appears when you least expect it.',color:'#ffffff'}
    ],
    aboutText:'DJ FOLSOE is a Danish Twitch DJ and Music TV project built around live shows, requests, moderators, community and a broadcast look made for TV, mobile and desktop.',
    top20:[{rank:1,artist:'DJ FOLSOE',title:"This Week's Number One",status:'ADMIN CONTROLLED'},{rank:2,artist:'Viewer Pick',title:'Request of the Week',status:'COMMUNITY'},{rank:3,artist:'Future Hit',title:'Discovery Track',status:'NEW'}]
  };
  const overlayHub = {version:'V919 Broadcast Core Sync',state:mode,activeShow:show,activeTheme:theme,ticker,controlPanel:{title:show,status:mode,theme,viewers:Number(twitchData.viewers||0),followers,subs,subGoal:Number(val('subGoal',100)),nextShow,infoLine:ticker,requestText:community.requestText,specialEvent:community.specialEvent},updatedAt:new Date().toISOString()};
  return {version:'V919 Broadcast Core Sync',activeTheme:theme,language:'en',homepage,website:{title:'DJ FOLSOE',description:text,primaryLanguage:'en'},broadcast,nextShow,overlayHub,community,bottomTickerItems:[{id:'v9185-main-ticker',active:true,theme:'all',text:ticker,priority:1}],updatedAt:new Date().toISOString()};
}
function djfPreview(){
  const p=buildPayload();
  set('previewWebsiteTitle',p.homepage.hero.title); set('previewWebsiteSub',p.homepage.hero.subtitle); set('previewWebsiteNext',`${p.nextShow.title} · ${p.nextShow.timeLabel}`);
  set('previewOverlayTitle',`${p.broadcast.activeShow} · ${p.broadcast.mode}`); set('previewOverlayStats',`Viewers ${p.broadcast.viewers||0} · Followers ${p.community.followers ?? '—'} · Subs ${p.community.subs||0}/${p.community.subGoal||100}`); set('previewOverlayTicker',p.overlayHub.ticker);
  set('readyState','Preview OK'); status('👁 Preview updated. Same data will publish to website and overlay.');
  return p;
}
function djfSaveDraft(){ const p=buildPayload(); localStorage.setItem('DJF_V9189_DRAFT',JSON.stringify(p)); set('readyState','Draft saved'); status('✅ Draft saved locally.'); return p; }
async function djfRefresh(){
  status('🔄 Refreshing Twitch + admin data…');
  const u = await getJson('/api/broadcast?t='+Date.now(), null) || await getJson('/api/unified-control?t='+Date.now(), null);
  const tw = await getJson('/api/twitch?live=1&t='+Date.now(), null) || await getJson('/api/twitch-profile?live=1&t='+Date.now(), null);
  if(tw && (tw.ok || tw.isLive !== undefined)) twitchData = Object.assign(twitchData, tw);
  else if(u?.twitch) twitchData = Object.assign(twitchData, u.twitch);
  hydrateFromCore(u?.core || u || null);
  renderTwitch(); djfPreview();
  status(tw || u ? '✅ Refreshed. Twitch/Admin data loaded.' : '⚠️ Could not reach API. You can still edit and save draft locally.', tw || u ? 'ok' : 'warn');
}
function hydrateFromCore(core){
  if(!core) return;
  const h=core.homepage?.hero||{}; const b=core.broadcast||{}; const c=core.community||{}; const n=core.nextShow||core.homepage?.nextShow||{};
  setValue('currentShow', b.activeShow || b.activeShowTitle); setValue('theme', core.activeTheme || b.activeTheme); setValue('mode', b.mode || b.broadcastState);
  setValue('eyebrow', h.eyebrow); setValue('heroTitle', h.title); setValue('heroSubtitle', h.subtitle); setValue('heroText', h.text);
  setValue('ticker', Array.isArray(core.homepage?.ticker) ? core.homepage.ticker[0] : core.overlayHub?.ticker);
  setValue('nextShowTitle', n.title || n.show); setValue('nextShowTheme', n.theme); setValue('nextShowDescription', n.description);
  if(n.datetime || n.dateTime){ const [d,t] = String(n.datetime||n.dateTime).split('T'); setValue('nextShowDate',d); setValue('nextShowTime',(t||'').slice(0,5)); }
  setValue('followerGoal', c.followerGoal); setValue('subs', c.subs); setValue('subGoal', c.subGoal); setValue('requestText', c.requestText); setValue('specialMessage', c.specialEvent);
}
function renderTwitch(){
  set('twitchStatus', twitchData.isLive ? 'LIVE' : 'OFFLINE'); $('twitchStatus')?.classList.toggle('ok',!!twitchData.isLive);
  set('twitchTitle', twitchData.liveTitle || 'twitch.tv/djfolsoe'); set('twitchViewers', Number(twitchData.viewers||0)); set('twitchFollowers', twitchData.followers ?? '—'); set('twitchSubs', twitchData.subs ?? val('subs',0));
}
async function djfOneClick(){
  try{
    djfSaveSettings();
    set('readyState','Publishing…'); status('🚀 One click started: Twitch sync → Admin data → Website + Overlay publish…');
    await djfRefresh();
    const p = buildPayload();
    const r = await postJson('/api/publish', p);
    localStorage.setItem('DJF_V9189_LAST_PUBLISH', new Date().toISOString());
    set('readyState','LIVE SYNC OK'); set('lastPublish', new Date().toLocaleString());
    status('✅ ONE CLICK COMPLETE. Website + overlay now use the same Twitch/Admin data.');
    return r;
  }catch(e){ set('readyState','API ERROR'); status('❌ One click failed: '+e.message+'\n\nCheck Advanced → API base, ADMIN_TOKEN and Cloudflare Worker deploy.', 'bad'); }
}
async function djfTestApi(){
  djfSaveSettings(); status('Testing API…');
  const health = await getJson('/api/health?t='+Date.now(), null) || await getJson('/api/broadcast?t='+Date.now(), null) || await getJson('/api/health-check?t='+Date.now(), null);
  const msg = health ? JSON.stringify(health,null,2) : '❌ API could not be reached. Open /api/health directly and check Cloudflare Worker/CORS.';
  set('advancedStatus', msg); status(health ? '✅ API test OK.' : '❌ API test failed.', health ? 'ok' : 'bad');
}
function bindAutoPreview(){ ['currentShow','theme','mode','eyebrow','heroTitle','heroSubtitle','heroText','ticker','nextShowTitle','nextShowDate','nextShowTime','nextShowTheme','nextShowDescription','followerGoal','subs','subGoal','requestText','specialMessage'].forEach(id=>$(id)?.addEventListener('input',djfPreview)); $('currentShow')?.addEventListener('change',()=>{ const m=SHOW_THEME_MAP[val('currentShow')]; if(m) setValue('theme',m); djfPreview(); }); }
function restoreSettings(){ setValue('apiBase',apiBase()); setValue('adminToken',localStorage.getItem('DJF_ADMIN_TOKEN')||''); setValue('advancedToken',localStorage.getItem('DJF_ADMIN_TOKEN')||''); const draft=localStorage.getItem('DJF_V9189_DRAFT'); if(draft){ try{ hydrateFromCore(JSON.parse(draft)); }catch{} } const last=localStorage.getItem('DJF_V9189_LAST_PUBLISH'); if(last) set('lastPublish','Last publish: '+new Date(last).toLocaleString()); }
document.addEventListener('DOMContentLoaded',()=>{ restoreSettings(); bindAutoPreview(); renderTwitch(); djfPreview(); setTimeout(djfRefresh,450); });

async function djfVerifySync(){
  const res = await getJson('/api/broadcast?t=' + Date.now(), null);
  if(!res || !res.ok){ status('⚠️ Published, but verify sync could not read /api/broadcast.', 'bad'); return null; }
  const core = res.core || res.data || res;
  const storage = res.storage || (res.hasKV ? 'kv' : 'broadcast-core');
  set('readyState', 'Synced');
  set('lastPublish', core.updatedAt || res.updatedAt || new Date().toISOString());
  return core;
}
async function djfLoadFromCore(){
  status('🔄 Loading broadcast-core…');
  const res = await getJson('/api/broadcast?t=' + Date.now(), null);
  if(!res || !res.ok){ status('❌ Could not load broadcast-core.', 'bad'); return; }
  const core = res.core || res.data || res;
  const b = core.broadcast || {};
  const h = (core.homepage && core.homepage.hero) || {};
  const c = core.community || {};
  const n = core.nextShow || (core.homepage && core.homepage.nextShow) || {};
  setValue('currentShow', b.activeShow || b.activeShowTitle || 'DJ FOLSOE');
  setValue('theme', b.activeTheme || core.activeTheme || 'weekend');
  setValue('mode', b.mode || b.broadcastState || 'OFFLINE');
  setValue('eyebrow', h.eyebrow);
  setValue('heroTitle', h.title);
  setValue('heroSubtitle', h.subtitle);
  setValue('heroText', h.text);
  setValue('ticker', ((core.homepage&&core.homepage.ticker)||[]).join('  •  '));
  setValue('nextShowTitle', n.title || n.show);
  setValue('nextShowTheme', n.theme);
  setValue('nextShowDescription', n.description);
  setValue('subGoal', c.subGoal);
  setValue('followerGoal', c.followerGoal);
  setValue('requestText', c.requestText);
  djfPreview();
  status('✅ Broadcast-core loaded into admin.');
}
