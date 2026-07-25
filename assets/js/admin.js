/* DJ FOLSOE NETWORK V928.3 · ADMIN SAVE/PUBLISH LOCK FIX */
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
function titleCase(v){ return String(v||'').replace(/[-_]/g,' ').replace(/\b\w/g,c=>c.toUpperCase()); }
function normalizeCore(raw){
  const core = raw?.core || raw?.data || raw || {};
  if(core.schema === 'broadcast-core/v2-clean') return core;
  const b = core.broadcast || {};
  const h = core.homepage?.hero || {};
  const c = core.community || {};
  const n = core.nextShow || core.homepage?.nextShow || {};
  const ov = core.overlay || core.overlayHub || {};
  const cp = ov.controlPanel || {};
  const themeId = core.activeTheme || b.activeTheme || ov.activeTheme || cp.theme || 'weekend';
  const showTitle = b.activeShow || b.activeShowTitle || cp.title || 'DJ FOLSOE';
  const mode = b.mode || b.broadcastState || ov.state || cp.status || 'OFFLINE';
  const tickerText = Array.isArray(core.homepage?.ticker) ? core.homepage.ticker.join(' · ') : (ov.ticker || cp.infoLine || 'DJ FOLSOE TWITCH · MUSIC STREAMER FROM DENMARK');
  return {
    ok:true, version:'V928.2 Broadcast Content Manager', schema:'broadcast-core/v2-clean', source:core.source || 'admin-normalized', updatedAt:core.updatedAt || new Date().toISOString(),
    twitch: core.twitch || {},
    show:{current:showTitle,title:showTitle,mode,state:mode,live:!!b.live,viewers:b.viewers||0,streamTitle:b.streamTitle||showTitle},
    nextShow:{title:n.title||n.show||'Next DJ FOLSOE Broadcast',show:n.show||n.title||'Next DJ FOLSOE Broadcast',datetime:n.datetime||n.dateTime||'',dateTime:n.datetime||n.dateTime||'',timeLabel:n.timeLabel||'Announced soon',theme:n.theme||'Music TV',description:n.description||'',active:n.active!==false},
    theme:{id:themeId,title:titleCase(themeId),background:h.background||`themes/${themeId}.png`},
    hero:{eyebrow:h.eyebrow||'DJ FOLSOE TWITCH · MUSIC STREAMER FROM DENMARK',title:h.title||'DJ FOLSOE',subtitle:h.subtitle||'Dive into my Twitch world',text:h.text||core.website?.description||''},
    community:{followers:c.followers??b.followers??cp.followers??null,followerGoal:c.followerGoal||1000,subs:c.subs??cp.subs??0,subGoal:c.subGoal||cp.subGoal||100,text:c.text||h.text||'',requestText:c.requestText||cp.requestText||'Use !request Artist - Title in Twitch chat',specialEvent:c.specialEvent||cp.specialEvent||''},
    ticker:{text:tickerText,items:tickerText?[tickerText]:[]},
    top20: core.top20 || core.homepage?.top20 || [],
    featuredShows: core.featuredShows || core.homepage?.featuredShows || [],
    mods: core.mods || {},
    overlay:{title:showTitle,status:mode,infoLine:tickerText,requestText:c.requestText||cp.requestText||'Use !request Artist - Title in Twitch chat',specialEvent:c.specialEvent||cp.specialEvent||'',subGoal:c.subGoal||cp.subGoal||100}
  };
}

function top20FromFields(){
  return Array.from({length:20},(_,i)=>i+1).map(rank=>({
    rank,
    artist: val(`top${rank}Artist`, rank===1?'DJ FOLSOE':''),
    title: val(`top${rank}Title`, rank===1?"This Week's Number One":''),
    status: val(`top${rank}Status`, rank===1?'ADMIN CONTROLLED':'')
  })).filter(x=>x.artist || x.title || x.status || x.rank<=3);
}
function hydrateTop20(list){
  const arr = Array.isArray(list) ? list : [];
  Array.from({length:20},(_,i)=>i+1).forEach(rank=>{
    const item = arr.find(x=>Number(x.rank)===rank) || arr[rank-1] || {};
    setValue(`top${rank}Artist`, item.artist || '');
    setValue(`top${rank}Title`, item.title || '');
    setValue(`top${rank}Status`, item.status || '');
  });
}
function modsFromFields(){
  const title = val('modsTitle','DJ FOLSOE COMMUNITY CREW');
  const subtitle = val('modsSubtitle','The people keeping the chat, music and vibes alive');
  const head = val('modsHead','').split(/[\n,]/).map(x=>x.trim()).filter(Boolean);
  const community = val('modsCommunity','').split(/[\n,]/).map(x=>x.trim()).filter(Boolean);
  const music = val('modsMusic','').split(/[\n,]/).map(x=>x.trim()).filter(Boolean);
  const vip = val('modsVip','').split(/[\n,]/).map(x=>x.trim()).filter(Boolean);
  return {title, subtitle, groups:[
    {label:'HEAD MODS',names:head},
    {label:'COMMUNITY MODS',names:community},
    {label:'MUSIC TEAM',names:music},
    {label:'VIP SUPPORTERS',names:vip}
  ].filter(g=>g.names.length)};
}
function hydrateMods(mods){
  mods = mods && typeof mods==='object' ? mods : {};
  setValue('modsTitle', mods.title || 'DJ FOLSOE COMMUNITY CREW');
  setValue('modsSubtitle', mods.subtitle || 'The people keeping the chat, music and vibes alive');
  const groups = Array.isArray(mods.groups) ? mods.groups : [];
  const getNames = (label)=> groups.find(g=>String(g.label||'').toUpperCase()===label)?.names || [];
  setValue('modsHead', getNames('HEAD MODS').join('\n'));
  setValue('modsCommunity', getNames('COMMUNITY MODS').join('\n'));
  setValue('modsMusic', getNames('MUSIC TEAM').join('\n'));
  setValue('modsVip', getNames('VIP SUPPORTERS').join('\n'));
}
function renderTop20Editor(){
  const wrap=$('top20FullEditor'); if(!wrap || wrap.dataset.ready) return;
  wrap.dataset.ready='1';
  wrap.innerHTML = Array.from({length:20},(_,i)=>i+1).map(rank=>`<div class="top20Row"><b>#${rank}</b><input id="top${rank}Artist" placeholder="Artist"><input id="top${rank}Title" placeholder="Title"><input id="top${rank}Status" placeholder="NEW / UP / HOLD"></div>`).join('');
}

function djfShowFieldMap(){
  const map = [
    'Current show → core.show.current → website hero/overlay title',
    'Theme → core.theme.id/background → website background/overlay theme',
    'Broadcast mode → core.show.mode + core.overlay.status',
    'Hero text → core.hero → website frontpage + overlay title/info context',
    'Next show → core.nextShow → website Next Show + overlay next broadcast',
    'Ticker → core.ticker.text + core.overlay.infoLine',
    'Goals/request/special → core.community + core.overlay',
    'Top 20 quick edit → core.top20 → website chart section'
  ];
  status('V921 FIELD MAP:\n' + map.map(x=>'• '+x).join('\n'));
}


const FIELD_MAP = {
  currentShow: 'core.show.current',
  mode: 'core.show.mode',
  theme: 'core.theme.id',
  eyebrow: 'core.hero.eyebrow',
  heroTitle: 'core.hero.title',
  heroSubtitle: 'core.hero.subtitle',
  heroText: 'core.hero.text / core.community.text',
  ticker: 'core.ticker.text / core.overlay.infoLine',
  nextShowTitle: 'core.nextShow.show',
  nextShowDate: 'core.nextShow.datetime',
  nextShowTime: 'core.nextShow.datetime',
  nextShowTheme: 'core.nextShow.theme',
  followerGoal: 'core.community.followerGoal',
  subs: 'core.community.subs',
  subGoal: 'core.community.subGoal',
  requestText: 'core.community.requestText / core.overlay.requestText',
  specialMessage: 'core.community.specialEvent / core.overlay.specialEvent'
};
function validateMappedFields(){
  const missing = Object.keys(FIELD_MAP).filter(id => !$(id));
  if(missing.length) status('⚠️ Missing mapped admin fields: ' + missing.join(', '), 'warn');
  return missing.length === 0;
}

function buildPayload(){
  const current = val('currentShow','DJ FOLSOE');
  const themeId = val('theme', SHOW_THEME_MAP[current] || 'weekend');
  const mode = val('mode','OFFLINE');
  const tickerText = val('ticker','DJ FOLSOE TWITCH · MUSIC STREAMER FROM DENMARK · REQUEST A SONG · TOP 20 · LIVE COMMUNITY');
  const dt = nextDateTime();
  const followers = twitchData.followers ?? null;
  const subs = Number(twitchData.subs ?? val('subs',0) ?? 0);
  return {
    ok:true,
    version:'V928.2 Broadcast Content Manager',
    schema:'broadcast-core/v2-clean',
    source:'admin-publish',
    updatedAt:new Date().toISOString(),
    twitch:{...twitchData, channel:'djfolsoe'},
    show:{
      current, title:current, mode, state:mode,
      live:!!twitchData.isLive || mode==='LIVE SHOW' || mode==='LIVE',
      viewers:Number(twitchData.viewers||0),
      streamTitle:twitchData.liveTitle || `${current} · DJ FOLSOE Twitch music streamer from Denmark`
    },
    nextShow:{
      title:val('nextShowTitle','Next DJ FOLSOE Broadcast'),
      show:val('nextShowTitle','Next DJ FOLSOE Broadcast'),
      datetime:dt, dateTime:dt, timeLabel:nextTimeLabel(dt),
      theme:val('nextShowTheme',themeId),
      description:val('nextShowDescription','The next show is controlled from admin and appears automatically on website and overlay.'),
      active:true
    },
    theme:{id:themeId,title:titleCase(themeId),background:`themes/${themeId}.png`},
    hero:{
      eyebrow:val('eyebrow','DJ FOLSOE TWITCH · MUSIC STREAMER FROM DENMARK'),
      title:val('heroTitle','DJ FOLSOE'),
      subtitle:val('heroSubtitle','Dive into my Twitch world'),
      text:val('heroText','Live DJ shows, song requests, Top 20 countdowns and community energy from Denmark.')
    },
    community:{
      followers, followerGoal:Number(val('followerGoal',1000)),
      subs, subGoal:Number(val('subGoal',100)),
      text:val('heroText',''),
      requestText:val('requestText','Use !request Artist - Title in Twitch chat'),
      specialEvent:val('specialMessage','')
    },
    ticker:{text:tickerText,items:[tickerText]},
    top20: top20FromFields(),
    mods: modsFromFields(),
    featuredShows:[
      {time:'Morning',title:'Good Morning Twitch',description:'Bright morning mood, coffee, chat and fresh music.',color:'#ffe36e'},
      {time:'Tuesday',title:'Trance Tuesday',description:'Melodic trance, energy and emotional peak-time sound.',color:'#62ecff'},
      {time:'Special',title:'Eurodance',description:'90s and 00s dance classics with full Music TV nostalgia.',color:'#ff4bd8'},
      {time:'Friday',title:'Fredagsbar',description:'Weekend mode, party classics and Danish Friday energy.',color:'#6cffb5'},
      {time:'Sunday',title:'Retro Hits',description:'70s, 80s and 90s memories with viewer favourites.',color:'#ffe36e'},
      {time:'Surprise',title:'Pop Up Live',description:'The stream that appears when you least expect it.',color:'#ffffff'}
    ],
    overlay:{
      title:current,status:mode,infoLine:tickerText,
      requestText:val('requestText','Use !request Artist - Title in Twitch chat'),
      specialEvent:val('specialMessage',''),subGoal:Number(val('subGoal',100))
    }
  };
}
function djfPreview(){
  const p=buildPayload();
  set('previewWebsiteTitle',p.hero.title); set('previewWebsiteSub',p.hero.subtitle); set('previewWebsiteNext',`${p.nextShow.title} · ${p.nextShow.timeLabel}`);
  set('previewOverlayTitle',`${p.show.current} · ${p.show.mode}`); set('previewOverlayStats',`Viewers ${p.show.viewers||0} · Followers ${p.community.followers ?? '—'} · Subs ${p.community.subs||0}/${p.community.subGoal||100}`); set('previewOverlayTicker',p.ticker.text);
  set('homepage2030ShowCount',`${(p.featuredShows||[]).length} shows`);
  set('homepage2030ChartCount',`${(p.top20||[]).filter(x=>x && (x.artist||x.title)).length} chart entries`);
  set('homepage2030Theme',`Theme · ${p.theme.title||p.theme.id}`);
  set('readyState','Preview OK'); status('👁 Preview updated. V921 maps each visible website/overlay field to broadcast-core.');
  return p;
}
function djfSaveDraft(){ const p=buildPayload(); localStorage.setItem('DJF_V921_DRAFT',JSON.stringify(p)); set('readyState','Draft saved'); status('✅ Draft saved locally.'); return p; }
async function djfRefresh(){
  status('🔄 Refreshing Twitch + broadcast-core…');
  const u = await getJson('/api/broadcast?t='+Date.now(), null);
  const tw = await getJson('/api/twitch?live=1&t='+Date.now(), null);
  if(tw && (tw.ok || tw.isLive !== undefined)) twitchData = Object.assign(twitchData, tw);
  else if(u?.twitch) twitchData = Object.assign(twitchData, u.twitch);
  hydrateFromCore(normalizeCore(u));
  renderTwitch(); djfPreview();
  status(u ? '✅ Refreshed. Mapped broadcast-core loaded.' : '⚠️ Could not reach API. You can still edit and save draft locally.', u ? 'ok' : 'warn');
}
function hydrateFromCore(core){
  if(!core) return;
  const h=core.hero||{}; const s=core.show||{}; const c=core.community||{}; const n=core.nextShow||{}; const t=core.theme||{};
  setValue('currentShow', s.current || s.title); setValue('theme', t.id); setValue('mode', s.mode || s.state);
  setValue('eyebrow', h.eyebrow); setValue('heroTitle', h.title); setValue('heroSubtitle', h.subtitle); setValue('heroText', h.text);
  setValue('ticker', core.ticker?.text || '');
  setValue('nextShowTitle', n.title || n.show); setValue('nextShowTheme', n.theme); setValue('nextShowDescription', n.description);
  if(n.datetime || n.dateTime){ const [d,time] = String(n.datetime||n.dateTime).split('T'); setValue('nextShowDate',d); setValue('nextShowTime',(time||'').slice(0,5)); }
  setValue('followerGoal', c.followerGoal); setValue('subs', c.subs); setValue('subGoal', c.subGoal); setValue('requestText', c.requestText); setValue('specialMessage', c.specialEvent); hydrateTop20(core.top20); hydrateMods(core.mods);
}
function renderTwitch(){
  set('twitchStatus', twitchData.isLive ? 'LIVE' : 'OFFLINE'); $('twitchStatus')?.classList.toggle('ok',!!twitchData.isLive);
  set('twitchTitle', twitchData.liveTitle || 'twitch.tv/djfolsoe'); set('twitchViewers', Number(twitchData.viewers||0)); set('twitchFollowers', twitchData.followers ?? '—'); set('twitchSubs', twitchData.subs ?? val('subs',0));
}
async function djfSyncTwitchOnly(){
  const tw = await getJson('/api/twitch?live=1&t='+Date.now(), null);
  if(tw && (tw.ok || tw.isLive !== undefined)){
    twitchData = Object.assign(twitchData, tw);
    renderTwitch();
    return tw;
  }
  return null;
}

async function djfOneClick(){
  try{
    djfSaveSettings();
    validateMappedFields();
    set('readyState','Publishing…');
    status('🚀 Publishing exactly what is visible in admin. No reload. No reset.');

    // IMPORTANT V928.3:
    // Do NOT call djfRefresh() here. It loads old KV data and overwrites your edits
    // before publishing. Only sync Twitch numbers, then build payload from visible fields.
    await djfSyncTwitchOnly();

    const p = buildPayload();
    localStorage.setItem('DJF_V9283_LAST_PAYLOAD', JSON.stringify(p));
    localStorage.setItem('DJF_V9283_DRAFT', JSON.stringify(p));

    const r = await postJson('/api/publish', p);
    localStorage.setItem('DJF_V921_LAST_PUBLISH', new Date().toISOString());
    localStorage.setItem('DJF_V9283_LAST_PUBLISH', new Date().toISOString());

    const verify = await getJson('/api/broadcast?t='+Date.now(), null);
    const vc = normalizeCore(verify);
    const wantedTheme = p.theme?.id;
    const savedTheme = vc?.theme?.id;
    const okTheme = !wantedTheme || wantedTheme === savedTheme;

    set('readyState', okTheme ? 'PUBLISHED OK' : 'PUBLISHED - CHECK THEME');
    set('lastPublish', new Date().toLocaleString());
    status(okTheme
      ? `✅ Published. Theme saved as ${savedTheme}. Top20 + Mods included.`
      : `⚠️ Published, but verify says theme=${savedTheme}, expected=${wantedTheme}.`, okTheme ? 'ok' : 'warn');
    return r;
  }catch(e){
    set('readyState','API ERROR');
    status('❌ One click failed: '+e.message+'\n\nV928.3 does not reload old core before publish. Check API base, ADMIN_TOKEN and Worker deploy.', 'bad');
  }
}

function djfSaveContentDraft(){
  const p = buildPayload();
  localStorage.setItem('DJF_V9283_DRAFT', JSON.stringify(p));
  status('✅ Content draft saved locally: theme, Top20, mods, goals and text.');
  return p;
}

async function djfTestApi(){
  djfSaveSettings(); status('Testing API…');
  const health = await getJson('/api/health?t='+Date.now(), null) || await getJson('/api/broadcast?t='+Date.now(), null);
  const msg = health ? JSON.stringify(health,null,2) : '❌ API could not be reached. Open /api/health directly and check Cloudflare Worker/CORS.';
  set('advancedStatus', msg); status(health ? '✅ API test OK.' : '❌ API test failed.', health ? 'ok' : 'bad');
}
function bindAutoPreview(){ renderTop20Editor(); const dynamicIds = Array.from({length:20},(_,i)=>i+1).flatMap(rank=>[`top${rank}Artist`,`top${rank}Title`,`top${rank}Status`]); ['currentShow','theme','mode','eyebrow','heroTitle','heroSubtitle','heroText','ticker','nextShowTitle','nextShowDate','nextShowTime','nextShowTheme','nextShowDescription','followerGoal','subs','subGoal','requestText','specialMessage','modsTitle','modsSubtitle','modsHead','modsCommunity','modsMusic','modsVip',...dynamicIds].forEach(id=>$(id)?.addEventListener('input',djfPreview)); $('currentShow')?.addEventListener('change',()=>{ const m=SHOW_THEME_MAP[val('currentShow')]; if(m) setValue('theme',m); djfPreview(); }); }
function restoreSettings(){ setValue('apiBase',apiBase()); setValue('adminToken',localStorage.getItem('DJF_ADMIN_TOKEN')||''); setValue('advancedToken',localStorage.getItem('DJF_ADMIN_TOKEN')||''); const draft=localStorage.getItem('DJF_V9283_DRAFT') || localStorage.getItem('DJF_V921_DRAFT') || localStorage.getItem('DJF_V9189_DRAFT'); if(draft){ try{ hydrateFromCore(normalizeCore(JSON.parse(draft))); }catch{} } const last=localStorage.getItem('DJF_V921_LAST_PUBLISH') || localStorage.getItem('DJF_V9189_LAST_PUBLISH'); if(last) set('lastPublish','Last publish: '+new Date(last).toLocaleString()); }
async function djfVerifySync(){
  const res = await getJson('/api/broadcast?t=' + Date.now(), null);
  if(!res || !res.ok){ status('⚠️ Published, but verify sync could not read /api/broadcast.', 'bad'); return null; }
  const core = normalizeCore(res);
  set('readyState', 'Clean core synced');
  set('lastPublish', core.updatedAt || res.updatedAt || new Date().toISOString());
  return core;
}
async function djfLoadFromCore(){
  status('🔄 Loading mapped broadcast-core…');
  const res = await getJson('/api/broadcast?t=' + Date.now(), null);
  if(!res || !res.ok){ status('❌ Could not load broadcast-core.', 'bad'); return; }
  const core = normalizeCore(res);
  hydrateFromCore(core);
  window.dispatchEvent(new CustomEvent('djf:admin-core-loaded',{detail:core}));
  djfPreview();
  status('✅ V921 mapped broadcast-core loaded into admin. Fields now control website + overlay.');
}
document.addEventListener('DOMContentLoaded',()=>{ renderTop20Editor(); restoreSettings(); bindAutoPreview(); renderTwitch(); djfPreview(); status('✅ V928.3 loaded. Edit fields and publish; admin will not reload old core unless you press Load Core/Refresh.'); });


/* =========================================================
   DJ FOLSOE V19100 · ADMIN STUDIO PRO
   ========================================================= */
(function(){
"use strict";

const $studio=(id)=>document.getElementById(id);
const studioState={
  lastCore:null,
  lastRefreshAt:0,
  errors:[]
};

function studioText(id,value,fallback="—"){
  const el=$studio(id);
  if(el) el.textContent=(value===undefined||value===null||value==="")?fallback:String(value);
}

function studioJson(value){
  try{return JSON.stringify(value,null,2)}catch(_){return String(value)}
}

function studioThemeName(theme){
  if(!theme) return "Morning";
  if(typeof theme==="string") return theme;
  return theme.title||theme.id||"Morning";
}

function studioUpdateFromCore(core){
  if(!core||typeof core!=="object") return;
  studioState.lastCore=core;
  studioState.lastRefreshAt=Date.now();

  const show=core.show||core.currentShow||{};
  const theme=core.theme||{};
  const twitch=core.twitch||core.live||{};
  const music=core.music||core.nowPlaying||core.track||{};
  const current=music.current||music;
  const community=core.community||{};
  const overlay=core.overlay||core.overlayHub||{};

  studioText("studioChannelStatus",twitch.isLive?"LIVE":"READY");
  studioText("studioRuntimeState",overlay.status||core.status||"Broadcast core loaded");
  studioText("studioActiveShow",show.current||show.title||show.name||"DJ FOLSOE LIVE");
  studioText("studioActiveMode",show.mode||show.description||"Music TV");
  studioText("studioActiveTheme",studioThemeName(theme));
  studioText("studioThemeSource",theme.id||"Broadcast core");

  const track=[current.artist,current.title].filter(Boolean).join(" — ");
  studioText("studioNowPlaying",track||"No active track");
  studioText("studioMusicMeta",[
    current.genre,
    current.bpm?`${current.bpm} BPM`:"",
    current.key
  ].filter(Boolean).join(" · ")||"Waiting for music data");

  const queue=community.queue||[];
  studioText("studioCommunityQueue",`${Array.isArray(queue)?queue.length:0} queued`);
  studioText("studioCommunityActive",community.active?.title||community.active?.user||"No active event");

  studioText("studioPreviewKicker",show.kicker||"DJ FOLSOE NETWORK");
  studioText("studioPreviewTitle",show.current||show.title||"DJ FOLSOE LIVE");
  studioText("studioPreviewBody",show.description||overlay.infoLine||"Professional Music TV from Denmark.");
  studioText("studioPreviewLowerKicker",track?"NOW PLAYING":"CHANNEL");
  studioText("studioPreviewLowerTitle",track||overlay.requestText||"Live music");
  studioText("studioPreviewLowerBody",[
    current.album,current.year,current.genre
  ].filter(Boolean).join(" · ")||community.requestText||"Music data appears automatically.");

  const diag=$studio("studioDiagnostics");
  if(diag) diag.textContent=studioJson({
    refreshedAt:new Date().toISOString(),
    show:show.current||show.title||null,
    theme:theme.id||theme.title||theme,
    live:Boolean(twitch.isLive),
    track:track||null,
    queue:Array.isArray(queue)?queue.length:0
  });
}

async function studioRefresh(){
  const diag=$studio("studioDiagnostics");
  try{
    if(diag) diag.textContent="Refreshing Admin Studio Pro…";
    if(typeof window.djfLoadCore==="function"){
      await window.djfLoadCore();
    }
    const core=window.__DJF_ADMIN_CORE__||window.__DJF_CORE__||studioState.lastCore;
    if(core) studioUpdateFromCore(core);

    const workerHealthy=Boolean(core);
    studioText("studioServiceState",workerHealthy?"HEALTHY":"UNKNOWN");
    studioText("studioWorkerApiState",workerHealthy?"Worker and API connected":"Waiting for core data");
    studioText("studioPreviewBadge",workerHealthy?"READY":"CHECK");
  }catch(error){
    studioState.errors.push(String(error?.message||error));
    studioText("studioServiceState","ERROR");
    studioText("studioWorkerApiState",String(error?.message||error));
    if(diag) diag.textContent=studioJson({error:String(error?.message||error)});
  }
}

function studioCreateGraphic(type){
  const core=studioState.lastCore||{};
  const show=core.show||{};
  const next=core.nextShow||{};
  const chart=(core.top20||[])[0]||{};

  const payloads={
    upnext:{
      type:"upnext",
      title:next.title||next.name||"Next on DJ FOLSOE",
      body:next.displayTime||next.dateText||next.description||"Announced soon"
    },
    channel:{
      type:"channel",
      title:show.current||show.title||"DJ FOLSOE LIVE",
      body:show.description||"Professional Music TV from Denmark"
    },
    chart:{
      type:"chart",
      position:chart.rank||1,
      title:[chart.artist,chart.title].filter(Boolean).join(" — ")||"FOLSOE TOP 20",
      body:chart.status||"This week's chart update"
    },
    special:{
      type:"special",
      title:"DJ FOLSOE SPECIAL EVENT",
      body:"Live music, community and interactive television"
    }
  };

  const payload=payloads[type]||payloads.channel;

  window.dispatchEvent(new CustomEvent("djf:generate-graphic",{detail:payload}));
  const diag=$studio("studioDiagnostics");
  if(diag) diag.textContent=studioJson({graphicPreview:payload});
}

function studioThemePreview(theme){
  window.DJF_VISUAL_SYSTEM?.applyTheme?.(theme,document.documentElement);
  const themeSelect=document.getElementById("theme");
  if(themeSelect){
    const option=[...themeSelect.options].find(opt=>String(opt.value).toLowerCase()===theme);
    if(option){
      themeSelect.value=option.value;
      themeSelect.dispatchEvent(new Event("change",{bubbles:true}));
    }
  }
  studioText("studioActiveTheme",theme);
}

async function studioValidate(){
  const diag=$studio("studioDiagnostics");
  const result={
    adminCore:Boolean(studioState.lastCore),
    theme:document.documentElement.dataset.djfTheme||"morning",
    oneClickAvailable:typeof window.djfOneClick==="function",
    loadCoreAvailable:typeof window.djfLoadCore==="function",
    timestamp:new Date().toISOString()
  };
  if(diag) diag.textContent=studioJson(result);
  studioText("studioPreviewBadge",result.adminCore?"VALID":"CHECK");
  return result;
}

async function studioPreview(){
  const result=await studioValidate();
  window.dispatchEvent(new CustomEvent("djf:control-room-preview",{detail:result}));
  return result;
}

async function studioPublish(){
  const diag=$studio("studioDiagnostics");
  try{
    if(typeof window.djfOneClick==="function"){
      if(diag) diag.textContent="Safe publish started…";
      await window.djfOneClick();
      if(diag) diag.textContent="Safe publish completed.";
      studioText("studioPreviewBadge","PUBLISHED");
      setTimeout(()=>studioText("studioPreviewBadge","READY"),1800);
      return true;
    }
    throw new Error("One Click Publish is unavailable");
  }catch(error){
    if(diag) diag.textContent=studioJson({publishError:String(error?.message||error)});
    studioText("studioPreviewBadge","ERROR");
    return false;
  }
}

function studioRollback(){
  window.dispatchEvent(new CustomEvent("djf:release-rollback"));
  const diag=$studio("studioDiagnostics");
  if(diag) diag.textContent="Rollback event sent. Existing release manager will restore the last known good state.";
  studioText("studioPreviewBadge","ROLLBACK");
  setTimeout(()=>studioText("studioPreviewBadge","READY"),1800);
}

document.addEventListener("DOMContentLoaded",()=>{
  $studio("studioRefreshBtn")?.addEventListener("click",studioRefresh);
  $studio("studioSafePublishBtn")?.addEventListener("click",studioPublish);
  $studio("studioValidateBtn")?.addEventListener("click",studioValidate);
  $studio("studioPreviewBtn")?.addEventListener("click",studioPreview);
  $studio("studioPublishBtn")?.addEventListener("click",studioPublish);
  $studio("studioRollbackBtn")?.addEventListener("click",studioRollback);

  document.querySelectorAll("[data-studio-graphic]").forEach(button=>{
    button.addEventListener("click",()=>studioCreateGraphic(button.dataset.studioGraphic));
  });

  document.querySelectorAll("[data-studio-theme]").forEach(button=>{
    button.addEventListener("click",()=>studioThemePreview(button.dataset.studioTheme));
  });

  window.addEventListener("djf:admin-core-loaded",event=>{
    studioUpdateFromCore(event.detail||{});
  });

  setTimeout(studioRefresh,500);
});

window.DJF_ADMIN_STUDIO_PRO=Object.freeze({
  version:"V19100",
  refresh:studioRefresh,
  updateFromCore:studioUpdateFromCore,
  validate:studioValidate,
  preview:studioPreview,
  publish:studioPublish,
  rollback:studioRollback,
  getStatus:()=>({
    version:"V19100",
    lastRefreshAt:studioState.lastRefreshAt,
    coreLoaded:Boolean(studioState.lastCore),
    errors:studioState.errors.slice()
  })
});
})();
