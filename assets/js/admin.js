/* DJ FOLSOE NETWORK V920 · BROADCAST CORE CLEANUP */
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
    ok:true, version:'V920 Broadcast Core Cleanup', schema:'broadcast-core/v2-clean', source:core.source || 'admin-normalized', updatedAt:core.updatedAt || new Date().toISOString(),
    twitch: core.twitch || {},
    show:{current:showTitle,title:showTitle,mode,state:mode,live:!!b.live,viewers:b.viewers||0,streamTitle:b.streamTitle||showTitle},
    nextShow:{title:n.title||n.show||'Next DJ FOLSOE Broadcast',show:n.show||n.title||'Next DJ FOLSOE Broadcast',datetime:n.datetime||n.dateTime||'',dateTime:n.datetime||n.dateTime||'',timeLabel:n.timeLabel||'Announced soon',theme:n.theme||'Music TV',description:n.description||'',active:n.active!==false},
    theme:{id:themeId,title:titleCase(themeId),background:h.background||`themes/${themeId}.png`},
    hero:{eyebrow:h.eyebrow||'DJ FOLSOE TWITCH · MUSIC STREAMER FROM DENMARK',title:h.title||'DJ FOLSOE',subtitle:h.subtitle||'Dive into my Twitch world',text:h.text||core.website?.description||''},
    community:{followers:c.followers??b.followers??cp.followers??null,followerGoal:c.followerGoal||1000,subs:c.subs??cp.subs??0,subGoal:c.subGoal||cp.subGoal||100,text:c.text||h.text||'',requestText:c.requestText||cp.requestText||'Use !request Artist - Title in Twitch chat',specialEvent:c.specialEvent||cp.specialEvent||''},
    ticker:{text:tickerText,items:tickerText?[tickerText]:[]},
    top20: core.top20 || core.homepage?.top20 || [],
    featuredShows: core.featuredShows || core.homepage?.featuredShows || [],
    overlay:{title:showTitle,status:mode,infoLine:tickerText,requestText:c.requestText||cp.requestText||'Use !request Artist - Title in Twitch chat',specialEvent:c.specialEvent||cp.specialEvent||'',subGoal:c.subGoal||cp.subGoal||100}
  };
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
    version:'V920 Broadcast Core Cleanup',
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
    top20:[
      {rank:1,artist:'DJ FOLSOE',title:"This Week's Number One",status:'ADMIN CONTROLLED'},
      {rank:2,artist:'Viewer Pick',title:'Request of the Week',status:'COMMUNITY'},
      {rank:3,artist:'Future Hit',title:'Discovery Track',status:'NEW'}
    ],
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
  set('readyState','Preview OK'); status('👁 Preview updated. V920 uses one clean broadcast-core for website and overlay.');
  return p;
}
function djfSaveDraft(){ const p=buildPayload(); localStorage.setItem('DJF_V920_DRAFT',JSON.stringify(p)); set('readyState','Draft saved'); status('✅ Draft saved locally.'); return p; }
async function djfRefresh(){
  status('🔄 Refreshing Twitch + broadcast-core…');
  const u = await getJson('/api/broadcast?t='+Date.now(), null);
  const tw = await getJson('/api/twitch?live=1&t='+Date.now(), null);
  if(tw && (tw.ok || tw.isLive !== undefined)) twitchData = Object.assign(twitchData, tw);
  else if(u?.twitch) twitchData = Object.assign(twitchData, u.twitch);
  hydrateFromCore(normalizeCore(u));
  renderTwitch(); djfPreview();
  status(u ? '✅ Refreshed. Clean broadcast-core loaded.' : '⚠️ Could not reach API. You can still edit and save draft locally.', u ? 'ok' : 'warn');
}
function hydrateFromCore(core){
  if(!core) return;
  const h=core.hero||{}; const s=core.show||{}; const c=core.community||{}; const n=core.nextShow||{}; const t=core.theme||{};
  setValue('currentShow', s.current || s.title); setValue('theme', t.id); setValue('mode', s.mode || s.state);
  setValue('eyebrow', h.eyebrow); setValue('heroTitle', h.title); setValue('heroSubtitle', h.subtitle); setValue('heroText', h.text);
  setValue('ticker', core.ticker?.text || '');
  setValue('nextShowTitle', n.title || n.show); setValue('nextShowTheme', n.theme); setValue('nextShowDescription', n.description);
  if(n.datetime || n.dateTime){ const [d,time] = String(n.datetime||n.dateTime).split('T'); setValue('nextShowDate',d); setValue('nextShowTime',(time||'').slice(0,5)); }
  setValue('followerGoal', c.followerGoal); setValue('subs', c.subs); setValue('subGoal', c.subGoal); setValue('requestText', c.requestText); setValue('specialMessage', c.specialEvent);
}
function renderTwitch(){
  set('twitchStatus', twitchData.isLive ? 'LIVE' : 'OFFLINE'); $('twitchStatus')?.classList.toggle('ok',!!twitchData.isLive);
  set('twitchTitle', twitchData.liveTitle || 'twitch.tv/djfolsoe'); set('twitchViewers', Number(twitchData.viewers||0)); set('twitchFollowers', twitchData.followers ?? '—'); set('twitchSubs', twitchData.subs ?? val('subs',0));
}
async function djfOneClick(){
  try{
    djfSaveSettings();
    set('readyState','Publishing…'); status('🚀 One click started: Twitch sync → Clean broadcast-core → Website + Overlay publish…');
    await djfRefresh();
    const p = buildPayload();
    const r = await postJson('/api/publish', p);
    localStorage.setItem('DJF_V920_LAST_PUBLISH', new Date().toISOString());
    set('readyState','CLEAN CORE SYNC OK'); set('lastPublish', new Date().toLocaleString());
    status('✅ V920 COMPLETE. Website + overlay now use the same clean broadcast-core.');
    return r;
  }catch(e){ set('readyState','API ERROR'); status('❌ One click failed: '+e.message+'\n\nCheck Advanced → API base, ADMIN_TOKEN and Cloudflare Worker deploy.', 'bad'); }
}
async function djfTestApi(){
  djfSaveSettings(); status('Testing API…');
  const health = await getJson('/api/health?t='+Date.now(), null) || await getJson('/api/broadcast?t='+Date.now(), null);
  const msg = health ? JSON.stringify(health,null,2) : '❌ API could not be reached. Open /api/health directly and check Cloudflare Worker/CORS.';
  set('advancedStatus', msg); status(health ? '✅ API test OK.' : '❌ API test failed.', health ? 'ok' : 'bad');
}
function bindAutoPreview(){ ['currentShow','theme','mode','eyebrow','heroTitle','heroSubtitle','heroText','ticker','nextShowTitle','nextShowDate','nextShowTime','nextShowTheme','nextShowDescription','followerGoal','subs','subGoal','requestText','specialMessage'].forEach(id=>$(id)?.addEventListener('input',djfPreview)); $('currentShow')?.addEventListener('change',()=>{ const m=SHOW_THEME_MAP[val('currentShow')]; if(m) setValue('theme',m); djfPreview(); }); }
function restoreSettings(){ setValue('apiBase',apiBase()); setValue('adminToken',localStorage.getItem('DJF_ADMIN_TOKEN')||''); setValue('advancedToken',localStorage.getItem('DJF_ADMIN_TOKEN')||''); const draft=localStorage.getItem('DJF_V920_DRAFT') || localStorage.getItem('DJF_V9189_DRAFT'); if(draft){ try{ hydrateFromCore(normalizeCore(JSON.parse(draft))); }catch{} } const last=localStorage.getItem('DJF_V920_LAST_PUBLISH') || localStorage.getItem('DJF_V9189_LAST_PUBLISH'); if(last) set('lastPublish','Last publish: '+new Date(last).toLocaleString()); }
async function djfVerifySync(){
  const res = await getJson('/api/broadcast?t=' + Date.now(), null);
  if(!res || !res.ok){ status('⚠️ Published, but verify sync could not read /api/broadcast.', 'bad'); return null; }
  const core = normalizeCore(res);
  set('readyState', 'Clean core synced');
  set('lastPublish', core.updatedAt || res.updatedAt || new Date().toISOString());
  return core;
}
async function djfLoadFromCore(){
  status('🔄 Loading clean broadcast-core…');
  const res = await getJson('/api/broadcast?t=' + Date.now(), null);
  if(!res || !res.ok){ status('❌ Could not load broadcast-core.', 'bad'); return; }
  const core = normalizeCore(res);
  hydrateFromCore(core);
  djfPreview();
  status('✅ V920 clean broadcast-core loaded into admin.');
}
document.addEventListener('DOMContentLoaded',()=>{ restoreSettings(); bindAutoPreview(); renderTwitch(); djfPreview(); setTimeout(djfRefresh,450); });
