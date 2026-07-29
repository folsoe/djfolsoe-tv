
(() => {
  "use strict";

  const API = "https://djfolsoe-tv-api.sunefolsoe.workers.dev";
  const FOLLOWER_FLOOR = 874;
  const CACHE_KEY = "djf-v19000-cache";
  const $ = id => document.getElementById(id);
  const safe = v => v && typeof v === "object" ? v : {};
  const arr = v => Array.isArray(v) ? v : [];

  const defaultSchedule = [
    {time:"08:00",title:"Good Morning Twitch",description:"Morning show",theme:"morning"},
    {time:"19:00",title:"Trance Tuesday",description:"Trance & Classics",theme:"trance"},
    {time:"21:00",title:"Community Hour",description:"Requests & Chat",theme:"weekend"},
    {time:"23:00",title:"After Hours",description:"Chill & Classics",theme:"retro"},
    {time:"01:00",title:"Night Beats",description:"Deep & Dance",theme:"eurodance"}
  ];

  const themeInfo = {
    morning:{title:"Good Morning Twitch",desc:"Morning live show with great music, good vibes and your requests.",icon:"☀"},
    trance:{title:"Trance Tuesday",desc:"High energy trance and classic anthems.",icon:"TR"},
    eurodance:{title:"Eurodance Live",desc:"90s, 00s and high-energy club classics.",icon:"EU"},
    retro:{title:"Retro Hits",desc:"Classics from the 70s, 80s and 90s.",icon:"RE"},
    fredagsbar:{title:"Fredagsbar",desc:"Party music, requests and great company.",icon:"BAR"},
    summer:{title:"Summer 2026",desc:"Summer hits, house and feel-good classics.",icon:"SUM"},
    weekend:{title:"Weekend Live",desc:"Anthems, requests and surprises.",icon:"WK"},
    popup:{title:"Pop Up Live",desc:"A surprise live DJ broadcast.",icon:"POP"},
    danske:{title:"Danish Hits",desc:"Danish pop, rock, dance and classics.",icon:"DK"},
    top20:{title:"Folsoe Top 20",desc:"Twenty tracks and one number one.",icon:"20"}
  };

  let state = {
    data:{},
    isLive:false,
    followers:FOLLOWER_FLOOR,
    viewers:0,
    theme:"morning",
    current:null,
    next:null,
    nextDate:null,
    schedule:defaultSchedule,
    deskIndex:0
  };
  let deskTimer = 0;
  let countdownTimer = 0;

  function count(...values){
    for(const value of values){
      const n = Number(value);
      if(Number.isFinite(n) && n >= 0) return Math.floor(n);
    }
    return 0;
  }

  function normalizeTheme(value){
    const raw = String(value || "morning").toLowerCase().trim();
    const map = {
      "good morning twitch":"morning","good morning":"morning",
      "trance tuesday":"trance","retro hits":"retro",
      "friday bar":"fredagsbar","fredagsbar":"fredagsbar",
      "pop up live":"popup","danish hits":"danske",
      "folsoe top 20":"top20"
    };
    return map[raw] || raw.replace(/\s+/g,"");
  }

  function parseDate(value){
    if(!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function formatShowTime(date){
    if(!date) return "Announced soon";
    const now = new Date();
    const tomorrow = new Date(now); tomorrow.setDate(now.getDate()+1);
    const sameDay = date.toDateString() === now.toDateString();
    const nextDay = date.toDateString() === tomorrow.toDateString();
    const time = new Intl.DateTimeFormat("en-GB",{hour:"2-digit",minute:"2-digit"}).format(date);
    return sameDay ? `Today ${time}` : nextDay ? `Tomorrow ${time}` :
      new Intl.DateTimeFormat("en-GB",{weekday:"short",day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}).format(date);
  }

  function getJson(path, timeout=4500){
    const controller = new AbortController();
    const timer = setTimeout(()=>controller.abort(), timeout);
    return fetch(API + path,{cache:"no-store",headers:{Accept:"application/json"},signal:controller.signal})
      .then(r=>{if(!r.ok) throw new Error(`${path} ${r.status}`); return r.json();})
      .finally(()=>clearTimeout(timer));
  }

  function unwrap(payload){
    return safe(payload?.core || payload?.data || payload?.broadcastCore || payload);
  }

  function merge(results){
    const merged = {};
    for(const result of results){
      if(result.status === "fulfilled") Object.assign(merged, unwrap(result.value));
    }
    return merged;
  }

  function buildSchedule(data){
    const candidates = arr(data.schedule?.items || data.schedule || data.shows || data.featuredShows);
    if(!candidates.length) return defaultSchedule;
    return candidates.slice(0,5).map((item,index)=>({
      time:item.time || item.displayTime || defaultSchedule[index]?.time || "TBA",
      title:item.title || item.name || defaultSchedule[index]?.title || "DJ FOLSOE LIVE",
      description:item.description || item.text || defaultSchedule[index]?.description || "Live music television",
      theme:normalizeTheme(item.theme || item.id || item.title)
    }));
  }

  function deriveState(data){
    const twitch = safe(data.twitch || data.live);
    const isLive = Boolean(twitch.isLive ?? twitch.live ?? data.isLive);
    const next = safe(data.nextShow || data.schedule?.next);
    const currentRaw = safe(data.show || data.currentShow);
    const nextTheme = normalizeTheme(next.theme || next.id || next.title || data.activeTheme || "morning");
    const currentTheme = normalizeTheme(currentRaw.theme || currentRaw.id || currentRaw.title || data.activeTheme || "morning");
    const nextDate = parseDate(next.start || next.startAt || next.date || next.datetime);

    const nextShow = {
      title:next.title || next.name || themeInfo[nextTheme]?.title || "Next DJ FOLSOE Broadcast",
      description:next.description || next.text || themeInfo[nextTheme]?.desc || "Live music television from Denmark.",
      time:next.displayTime || next.dateText || formatShowTime(nextDate),
      theme:nextTheme
    };

    const liveShow = {
      title:twitch.title || currentRaw.title || data.showTitle || themeInfo[currentTheme]?.title || "DJ FOLSOE LIVE",
      description:twitch.description || currentRaw.description || data.streamTitle || themeInfo[currentTheme]?.desc || "Live music television from Denmark.",
      theme:currentTheme
    };

    // Critical logic: offline always shows NEXT show, never stale previous stream title.
    const current = isLive ? liveShow : {
      title:nextShow.title,
      description:nextShow.description,
      theme:nextShow.theme
    };

    state = {
      data,
      isLive,
      followers:Math.max(FOLLOWER_FLOOR,count(twitch.followers,twitch.followerCount,data.followers,data.community?.followers)),
      viewers:count(twitch.viewers,data.viewers),
      theme:isLive ? current.theme : nextShow.theme,
      current,
      next:nextShow,
      nextDate,
      schedule:buildSchedule(data),
      deskIndex:state.deskIndex
    };
  }

  function setText(id,value){
    const el=$(id);
    if(el && value !== undefined && value !== null) el.textContent=String(value);
  }

  function renderProfile(){
    const profile = $("v19000Profile");
    const twitch = safe(state.data.twitch || state.data.live);
    const image = twitch.profileImage || twitch.profileImageUrl || twitch.profile_image_url || state.data.profileImage;
    if(profile && image){
      profile.style.backgroundImage = `url("${String(image).replace(/"/g,"%22")}")`;
      profile.classList.add("has-image");
    }
  }

  function renderStatic(){
    document.documentElement.dataset.djfTheme = state.theme;

    const currentInfo = themeInfo[state.current.theme] || themeInfo.morning;
    const nextInfo = themeInfo[state.next.theme] || themeInfo.morning;

    setText("v19000OnlineState",state.isLive ? "LIVE NOW" : "OFFLINE");
    $("v19000TopStatus")?.classList.toggle("is-live",state.isLive);

    setText("v19000TopShowLabel",state.isLive ? "ON AIR SHOW" : "NEXT SHOW");
    setText("v19000TopShowTitle",state.current.title);
    setText("v19000TopShowDescription",state.current.description);
    setText("v19000TopShowTime",state.isLive ? "LIVE NOW" : state.next.time);
    setText("v19000TopShowIcon",currentInfo.icon);

    setText("v19000StatusShow",state.current.title);
    setText("v19000TopFollowers",state.followers.toLocaleString("en-GB"));
    setText("v19000TopViewers",state.viewers.toLocaleString("en-GB"));

    setText("v19000HeroNextTitle",state.next.title);
    setText("v19000HeroNextTime",state.next.time);

    setText("v19000DeskNextTitle",state.next.title);
    setText("v19000DeskNextTime",state.next.time);
    setText("v19000DeskNextBody",state.next.description);

    setText("v19000Followers",state.followers.toLocaleString("en-GB"));
    setText("v19000Viewers",state.viewers.toLocaleString("en-GB"));
    setText("v19000Theme",currentInfo.title);

    const milestone = Math.ceil((state.followers+1)/25)*25;
    setText("v19000FollowerMilestone",`Next milestone: ${milestone}`);
    $("v19000FollowerProgress").style.width = `${Math.min(100,(state.followers/milestone)*100)}%`;

    setText("v19000CenterStatus",state.isLive ? "LIVE CHANNEL" : "CHANNEL CONNECTED");
    setText("v19000CenterCurrentTitle",state.current.title);
    setText("v19000CenterCurrentBody",state.current.description);
    setText("v19000CenterNextTitle",state.next.title);
    setText("v19000CenterNextBody",state.next.description);
    setText("v19000CenterNextTime",state.next.time);
    setText("v19000CenterFollowers",`${state.followers.toLocaleString("en-GB")} FOLLOWERS`);
    setText("v19000CenterMilestone",`Let's reach ${milestone}! 🚀`);

    renderSchedule();
    renderProfile();
    renderDesk();
  }

  function renderSchedule(){
    const container = $("v19000ScheduleCards");
    if(!container) return;
    container.innerHTML = state.schedule.map((show,index)=>{
      const active = !state.isLive && show.title.toLowerCase() === state.next.title.toLowerCase();
      return `<article class="v19000-schedule-card ${active ? "active" : ""}">
        <b>${show.time}</b>
        <strong>${show.title}</strong>
        <small>${show.description}</small>
      </article>`;
    }).join("");
  }

  function deskCards(){
    const info = themeInfo[state.theme] || themeInfo.morning;
    const milestone = Math.ceil((state.followers+1)/25)*25;
    return [
      ["DA","VELKOMMEN TIL DJ FOLSOE","Følg kanalen og bliv en del af fællesskabet."],
      ["EN","FOLLOW ON TWITCH","Join the community and never miss a live show!"],
      ["DE","WILLKOMMEN BEI DJ FOLSOE","Folge dem Kanal und werde Teil der Community."],
      [info.icon,info.title.toUpperCase(),info.desc],
      ["♥",`${state.followers.toLocaleString("en-GB")} FOLLOWERS`,`Next milestone: ${milestone}`],
      ["NEXT",state.next.title,state.next.time]
    ];
  }

  function renderDots(){
    const cards = deskCards();
    for(const id of ["v19000DeskDots","v19000MiniDots"]){
      const el=$(id); if(!el) continue;
      el.innerHTML = cards.map((_,i)=>`<i class="${i===state.deskIndex ? "active" : ""}"></i>`).join("");
    }
  }

  function renderDesk(){
    const cards = deskCards();
    const pos = ((state.deskIndex % cards.length) + cards.length) % cards.length;
    state.deskIndex = pos;
    const card = cards[pos];

    setText("v19000DeskIcon",card[0]);
    setText("v19000DeskTitle",card[1]);
    setText("v19000DeskBody",card[2]);

    setText("v19000MiniDeskIcon",card[0]);
    setText("v19000MiniDeskTitle",card[1]);
    setText("v19000MiniDeskBody",card[2]);

    $("v19000MiniProgress").style.width = `${Math.round((pos+1)/cards.length*100)}%`;
    renderDots();
  }

  function moveDesk(step){
    const cards = deskCards();
    state.deskIndex = (state.deskIndex + step + cards.length) % cards.length;
    renderDesk();
    restartDeskTimer();
  }

  function restartDeskTimer(){
    clearInterval(deskTimer);
    deskTimer = setInterval(()=>moveDesk(1),8200);
  }

  function renderCountdown(){
    let remaining = state.nextDate ? state.nextDate.getTime() - Date.now() : 0;
    if(state.isLive) remaining = 0;
    const total = Math.max(0,Math.floor(remaining/1000));
    const h = Math.floor(total/3600);
    const m = Math.floor((total%3600)/60);
    const s = total%60;

    setText("v19000CountdownHours",String(h).padStart(2,"0"));
    setText("v19000CountdownMinutes",String(m).padStart(2,"0"));
    setText("v19000CountdownSeconds",String(s).padStart(2,"0"));
    setText("v19000CenterCountdown",state.isLive ? "LIVE NOW" : `Starts in ${h}h ${m}m ${s}s`);
  }

  function renderCache(){
    try{
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
      if(cached.data){
        deriveState(cached.data);
        renderStatic();
        renderCountdown();
      }
    }catch{}
  }

  async function load(){
    const results = await Promise.allSettled([
      getJson("/api/broadcast"),
      getJson("/api/twitch"),
      getJson("/api/homepage")
    ]);
    const data = merge(results);
    if(!Object.keys(data).length) return;
    deriveState(data);
    renderStatic();
    renderCountdown();
    try{localStorage.setItem(CACHE_KEY,JSON.stringify({at:Date.now(),data}))}catch{}
    window.dispatchEvent(new CustomEvent("djf:broadcast-core",{detail:data}));
  }

  $("v19000DeskPrev")?.addEventListener("click",()=>moveDesk(-1));
  $("v19000DeskNext")?.addEventListener("click",()=>moveDesk(1));
  $("v19000MiniDeskPrev")?.addEventListener("click",()=>moveDesk(-1));
  $("v19000MiniDeskNext")?.addEventListener("click",()=>moveDesk(1));

  renderCache();
  load();
  restartDeskTimer();
  countdownTimer = setInterval(renderCountdown,1000);
  const refreshTimer = setInterval(()=>{if(!document.hidden) load()},30000);

  document.addEventListener("visibilitychange",()=>{if(!document.hidden) load()},{passive:true});
  window.addEventListener("beforeunload",()=>{
    clearInterval(deskTimer);
    clearInterval(countdownTimer);
    clearInterval(refreshTimer);
  },{once:true});

  window.DJF_WEBSITE_V19000 = Object.freeze({
    refresh:load,
    nextDesk:()=>moveDesk(1),
    status:()=>({
      build:"V19000",
      isLive:state.isLive,
      current:state.current,
      next:state.next,
      followers:state.followers,
      viewers:state.viewers,
      theme:state.theme
    })
  });
})();
