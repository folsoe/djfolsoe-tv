
/* =========================================================
   DJ FOLSOE V946.0 — LIVE MUSIC TV EXPERIENCE
   Broadcast rundown, control room and reactive moments.
   ========================================================= */
(() => {
  const $ = id => document.getElementById(id);
  const API = (window.DJF_API_BASE || 'https://djfolsoe-tv-api.sunefolsoe.workers.dev').replace(/\/$/,'');
  let lastMomentId = '';
  let controlCollapsed = false;
  let latestState = null;

  function escapeHtml(value){
    return String(value ?? '').replace(/[&<>"']/g, char => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    })[char]);
  }

  async function getJson(path, fallback=null){
    try{
      const response = await fetch(API + path + (path.includes('?') ? '&' : '?') + 't=' + Date.now(), {cache:'no-store'});
      if(!response.ok) throw new Error(String(response.status));
      return await response.json();
    }catch(_error){
      return fallback;
    }
  }

  function setText(id,value){
    const element=$(id);
    if(element) element.textContent=value ?? '';
  }

  function formatNumber(value){
    return Number(value || 0).toLocaleString();
  }

  function relativeTime(value){
    const timestamp=new Date(value || 0).getTime();
    if(!timestamp) return 'JUST NOW';
    const seconds=Math.max(0,Math.round((Date.now()-timestamp)/1000));
    if(seconds<60) return 'JUST NOW';
    if(seconds<3600) return Math.floor(seconds/60)+' MIN AGO';
    if(seconds<86400) return Math.floor(seconds/3600)+' H AGO';
    return Math.floor(seconds/86400)+' D AGO';
  }

  function updateClock(){
    const now=new Date();
    setText('experienceClock',now.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}));
    setText('experienceDate',now.toLocaleDateString([], {weekday:'short',day:'2-digit',month:'short'}).toUpperCase());
  }

  function findCore(payload){
    return payload?.broadcast?.core || payload?.broadcast?.data || payload?.broadcast?.core?.core || payload?.core || {};
  }

  function renderRundown(state){
    const core=findCore(state);
    const twitch=core.twitch || state?.broadcast?.twitch || {};
    const show=core.show || {};
    const next=core.nextShow || {};
    const theme=core.theme || {};
    const live=!!(twitch.live || twitch.isLive || show.live);

    document.body.classList.toggle('experience-live',live);
    setText('rundownNowState',live?'LIVE NOW':'STANDBY');
    setText('rundownNowTitle',show.title || show.current || twitch.displayName || 'DJ FOLSOE');
    setText('rundownNowDescription',show.streamTitle || twitch.title || 'DJ FOLSOE Network programming');
    setText('rundownNowTheme',(theme.title || theme.id || 'Music TV').toUpperCase());
    setText('rundownNowViewers',formatNumber(twitch.viewers || show.viewers)+' VIEWERS');

    setText('rundownNextTime',next.timeLabel || next.datetime || next.dateTime || 'TBA');
    setText('rundownNextCountdown',$('nextCountdown')?.textContent || 'ANNOUNCED SOON');
    setText('rundownNextTitle',next.title || next.show || 'Next DJ FOLSOE Broadcast');
    setText('rundownNextDescription',next.description || 'The next broadcast appears automatically from admin.');
    setText('rundownNextTheme',(next.theme || 'Network').toUpperCase());

    const shows=Array.isArray(core.featuredShows) ? core.featuredShows : [];
    const later=$('rundownLaterList');
    if(later){
      later.innerHTML=shows.slice(0,4).map((item,index)=>`
        <div>
          <span>${String(index+1).padStart(2,'0')}</span>
          <strong>${escapeHtml(item.title || 'DJ FOLSOE SHOW')}</strong>
        </div>`).join('') || '<div><span>01</span><strong>PROGRAMMING TBA</strong></div>';
    }
  }

  function markSystem(name,online){
    const node=document.querySelector(`[data-system="${name}"]`);
    node?.classList.toggle('is-online',!!online);
  }

  function renderControlRoom(state){
    const status=state?.core || state?.status || {};
    const activity=state?.activity || {};
    const memory=state?.memory || {};
    const presence=state?.presence || {};
    const modules=Array.isArray(state?.modules) ? state.modules : [];
    const eventSubModule=modules.find(item=>item.id==='eventsub');
    const twitchConnected=!!(status.twitchConnected || state?.broadcast?.twitch?.ok);
    const eventSubConnected=!!(status.eventSubConnected || eventSubModule?.status==='online');

    setText('controlTwitch',twitchConnected?'ONLINE':'ATTENTION');
    setText('controlEventSub',eventSubConnected?'ONLINE':'ATTENTION');
    setText('controlActivity',formatNumber(activity.count || 0));
    setText('controlMemory',formatNumber(memory.viewers || memory.stats?.viewers || 0));
    setText('controlCommunity',formatNumber(presence.total_viewers || 0));

    markSystem('twitch',twitchConnected);
    markSystem('eventsub',eventSubConnected);
    markSystem('activity',true);
    markSystem('memory',true);
    markSystem('community',true);

    const pulseMessage=eventSubConnected
      ? 'ALL NETWORK SYSTEMS RECEIVING LIVE SIGNAL'
      : twitchConnected
        ? 'TWITCH CONNECTED · EVENTSUB REQUIRES ATTENTION'
        : 'NETWORK CORE CHECKING TWITCH CONNECTION';
    setText('networkPulseMessage',pulseMessage);
  }

  function momentIcon(type){
    return ({
      follow:'♥',sub:'★',resub:'★',gift_sub:'✦',bits:'◆',raid:'⚡',
      request:'♫',reward:'◈',hype_train:'🔥',stream_online:'◉',
      stream_offline:'○',poll:'▥',prediction:'◇',goal:'◎'
    })[type] || '●';
  }

  function momentType(type){
    return ({
      follow:'NEW FOLLOWER',sub:'NEW SUBSCRIBER',resub:'RESUB',
      gift_sub:'GIFT SUBS',bits:'BITS',raid:'INCOMING RAID',
      request:'SONG REQUEST',reward:'CHANNEL REWARD',
      hype_train:'HYPE TRAIN',stream_online:'NOW LIVE',
      stream_offline:'BROADCAST ENDED',poll:'TWITCH POLL',
      prediction:'PREDICTION',goal:'COMMUNITY GOAL'
    })[type] || 'NETWORK EVENT';
  }

  function showMoment(event){
    const root=$('broadcastMoment');
    if(!root || !event) return;
    setText('broadcastMomentIcon',momentIcon(event.type));
    setText('broadcastMomentType',momentType(event.type));
    setText('broadcastMomentHeadline',event.headline || 'DJ FOLSOE NETWORK');
    setText('broadcastMomentDetail',event.detail || relativeTime(event.timestamp));
    root.classList.remove('is-active');
    void root.offsetWidth;
    root.classList.add('is-active');
    setTimeout(()=>root.classList.remove('is-active'),4500);
  }

  function renderLatestActivity(state){
    const latest=state?.activity?.latest || state?.activity?.events?.[0];
    if(!latest) return;
    if(lastMomentId && latest.id && latest.id!==lastMomentId){
      showMoment(latest);
    }
    lastMomentId=latest.id || `${latest.type}:${latest.timestamp}`;
  }

  async function loadExperience(){
    const state=await getJson('/api/platform/state',null)
      || await getJson('/api/core/state',null)
      || await getJson('/api/broadcast',null);
    if(!state) return;
    latestState=state;
    renderRundown(state);
    renderControlRoom(state);
    renderLatestActivity(state);
  }

  function installControlRoom(){
    const toggle=$('controlRoomToggle');
    const room=$('liveControlRoom');
    if(!toggle || !room) return;
    toggle.addEventListener('click',()=>{
      controlCollapsed=!controlCollapsed;
      room.classList.toggle('is-collapsed',controlCollapsed);
      toggle.textContent=controlCollapsed?'+':'−';
    });
  }

  function syncNextCountdown(){
    const source=$('nextCountdown');
    if(source) setText('rundownNextCountdown',source.textContent || 'ANNOUNCED SOON');
  }

  document.addEventListener('DOMContentLoaded',()=>{
    updateClock();
    installControlRoom();
    loadExperience();
    syncNextCountdown();

    setInterval(updateClock,1000);
    setInterval(loadExperience,10000);
    setInterval(syncNextCountdown,1000);

    document.addEventListener('visibilitychange',()=>{
      if(!document.hidden) loadExperience();
    });
  });
})();
