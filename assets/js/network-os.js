
/* =========================================================
   DJ FOLSOE V1000 — NETWORK OS
   Cinematic scene, canvas universe and reactive TV system.
   ========================================================= */
(() => {
  const $ = id => document.getElementById(id);
  const body = document.body;
  const root = document.documentElement;
  const API = (window.DJF_API_BASE || 'https://djfolsoe-tv-api.sunefolsoe.workers.dev').replace(/\/$/,'');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = matchMedia('(max-width: 720px)').matches;

  let currentScene = 'ON AIR';
  let latestEventId = '';
  let intensityLow = false;
  let stateCache = null;

  function setText(id,value){
    const node=$(id);
    if(node) node.textContent=value ?? '';
  }

  async function fetchJson(path){
    try{
      const response=await fetch(API+path+(path.includes('?')?'&':'?')+'t='+Date.now(),{cache:'no-store'});
      if(!response.ok) return null;
      return await response.json();
    }catch(_){ return null; }
  }

  function boot(){
    if(reducedMotion){
      body.classList.remove('networkOsBooting');
      body.classList.add('networkOsReady');
      return;
    }
    const messages=[
      'INITIALISING BROADCAST UNIVERSE',
      'CONNECTING TWITCH SIGNAL',
      'LOADING CHANNEL MEMORY',
      'CALIBRATING TV GRAPHICS',
      'OPENING CHANNEL 01'
    ];
    let value=0;
    const timer=setInterval(()=>{
      value+=Math.floor(Math.random()*8)+3;
      if(value>100) value=100;
      setText('osBootPercent',String(value).padStart(2,'0')+'%');
      const bar=$('osBootProgressBar');
      if(bar) bar.style.width=value+'%';
      setText('osBootMessage',messages[Math.min(messages.length-1,Math.floor(value/22))]);
      if(value>=100){
        clearInterval(timer);
        setTimeout(()=>{
          body.classList.remove('networkOsBooting');
          body.classList.add('networkOsReady','os-camera');
          revealScene('DJ FOLSOE NETWORK','CHANNEL 01 · INTERACTIVE MUSIC TV');
        },350);
      }
    },75);
  }

  function revealScene(name,kicker='DJ FOLSOE NETWORK'){
    const panel=$('osSceneTitle');
    if(!panel || reducedMotion) return;
    setText('osSceneName',name);
    setText('osSceneKicker',kicker);
    setText('osSceneMeta','CHANNEL 01 · DENMARK');
    panel.classList.remove('is-active');
    void panel.offsetWidth;
    panel.classList.add('is-active');
    setTimeout(()=>panel.classList.remove('is-active'),1700);
  }

  function setScene(targetId,sceneName){
    currentScene=sceneName;
    setText('osRibbonScene',sceneName);
    document.querySelectorAll('.osController button[data-os-target]').forEach(button=>{
      button.classList.toggle('is-active',button.dataset.osTarget===targetId);
    });
    document.querySelectorAll('.tvGraphicSection').forEach(section=>{
      const active=section.id===targetId || section.contains(document.getElementById(targetId));
      section.classList.toggle('os-section-active',active);
      section.classList.toggle('os-section-muted',!active);
    });
    revealScene(sceneName,'DJ FOLSOE NETWORK OS');
    const target=document.getElementById(targetId);
    target?.scrollIntoView({behavior:reducedMotion?'auto':'smooth',block:'center'});
    setTimeout(()=>{
      document.querySelectorAll('.tvGraphicSection').forEach(section=>section.classList.remove('os-section-muted'));
    },1700);
  }

  function installController(){
    document.querySelectorAll('.osController button[data-os-target]').forEach(button=>{
      button.addEventListener('click',()=>setScene(button.dataset.osTarget,button.dataset.osScene||'NETWORK'));
    });
    $('osIntensityToggle')?.addEventListener('click',()=>{
      intensityLow=!intensityLow;
      body.classList.toggle('os-low-intensity',intensityLow);
      $('osIntensityToggle')?.classList.toggle('is-active',!intensityLow);
    });
  }

  function installPointerCamera(){
    if(mobile || reducedMotion) return;
    window.addEventListener('pointermove',event=>{
      const x=(event.clientX/window.innerWidth-.5)*2;
      const y=(event.clientY/window.innerHeight-.5)*2;
      root.style.setProperty('--os-x',x.toFixed(3));
      root.style.setProperty('--os-y',y.toFixed(3));
    },{passive:true});
  }

  function eventEnergy(event){
    const weights={
      raid:100,gift_sub:96,sub:88,resub:90,bits:84,follow:72,
      hype_train:98,request:66,reward:70,stream_online:100,goal:75
    };
    return weights[event?.type] || 55;
  }

  function shockwave(event){
    const wave=$('osActivityShockwave');
    if(!wave || reducedMotion) return;
    wave.classList.remove('is-active');
    void wave.offsetWidth;
    wave.classList.add('is-active');
    const energy=eventEnergy(event);
    root.style.setProperty('--os-energy',(energy/100).toFixed(2));
    setText('osRibbonEnergy',energy+'%');
    setTimeout(()=>wave.classList.remove('is-active'),1250);
  }

  function coreFromState(state){
    return state?.broadcast?.core || state?.broadcast?.data || state?.core || {};
  }

  function renderState(state){
    if(!state) return;
    stateCache=state;
    const core=coreFromState(state);
    const twitch=core.twitch || state?.broadcast?.twitch || {};
    const show=core.show || {};
    const theme=core.theme || {};
    const live=!!(twitch.live || twitch.isLive || show.live);
    const activity=state.activity || {};
    const latest=activity.latest || activity.events?.[0];

    setText('osSignalValue',live?'ON AIR':'STANDBY');
    setText('osPortalState',live?'LIVE NOW':'STANDBY');
    setText('osPortalTheme',(theme.title||theme.id||'MUSIC TV').toUpperCase());
    setText('osRibbonState',live?'LIVE SIGNAL':'CONNECTED');
    setText('osRibbonActivity',(activity.count||0)+' EVENTS');

    body.classList.toggle('os-live',live);

    if(latest){
      const id=latest.id || latest.type+':'+latest.timestamp;
      if(latestEventId && id!==latestEventId){
        shockwave(latest);
        revealScene(latest.headline || 'NETWORK EVENT',(latest.type||'LIVE ACTIVITY').toUpperCase());
      }
      latestEventId=id;
    }
  }

  async function refreshState(){
    const state=await fetchJson('/api/platform/state')
      || await fetchJson('/api/core/state')
      || await fetchJson('/api/broadcast');
    renderState(state);
  }

  function watchSections(){
    const sections=[...document.querySelectorAll('.tvGraphicSection')];
    const observer=new IntersectionObserver(entries=>{
      const visible=entries
        .filter(entry=>entry.isIntersecting)
        .sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
      if(!visible || visible.intersectionRatio<.45) return;
      const scene=visible.target.dataset.tvLabel || visible.target.id || 'NETWORK';
      currentScene=scene;
      setText('osRibbonScene',scene);
      document.querySelectorAll('.osController button[data-os-target]').forEach(button=>{
        button.classList.toggle('is-active',button.dataset.osTarget===visible.target.id);
      });
    },{threshold:[.25,.45,.7]});
    sections.forEach(section=>observer.observe(section));
  }

  function canvasUniverse(){
    if(reducedMotion) return;
    const canvas=$('networkOSCanvas');
    if(!canvas) return;
    const ctx=canvas.getContext('2d',{alpha:true});
    let width=0,height=0,dpr=1;
    let particles=[];
    let streaks=[];

    function resize(){
      dpr=Math.min(2,window.devicePixelRatio||1);
      width=window.innerWidth;
      height=window.innerHeight;
      canvas.width=Math.round(width*dpr);
      canvas.height=Math.round(height*dpr);
      canvas.style.width=width+'px';
      canvas.style.height=height+'px';
      ctx.setTransform(dpr,0,0,dpr,0,0);

      const count=mobile?45:110;
      particles=Array.from({length:count},()=>({
        x:Math.random()*width,
        y:Math.random()*height,
        z:Math.random(),
        size:Math.random()*1.8+.3,
        speed:Math.random()*.22+.04,
        phase:Math.random()*Math.PI*2
      }));
      streaks=Array.from({length:mobile?5:14},()=>({
        x:Math.random()*width,
        y:Math.random()*height,
        length:Math.random()*120+50,
        speed:Math.random()*1.2+.35,
        alpha:Math.random()*.16+.03
      }));
    }

    function cssColor(name,fallback){
      return getComputedStyle(root).getPropertyValue(name).trim() || fallback;
    }

    function frame(time){
      ctx.clearRect(0,0,width,height);
      const a=cssColor('--os-a','#35ddff');
      const c=cssColor('--os-c','#ff2ea6');
      const energy=parseFloat(getComputedStyle(root).getPropertyValue('--os-energy'))||.72;

      for(const p of particles){
        p.y-=p.speed*(1+energy);
        p.x+=Math.sin(time*.0003+p.phase)*.08;
        if(p.y<-10){p.y=height+10;p.x=Math.random()*width}
        const alpha=.08+p.z*.36;
        ctx.globalAlpha=alpha;
        ctx.fillStyle=p.z>.65?c:a;
        ctx.beginPath();
        ctx.arc(p.x,p.y,p.size*(.6+p.z),0,Math.PI*2);
        ctx.fill();
      }

      ctx.lineWidth=1;
      for(const s of streaks){
        s.x+=s.speed*(.7+energy);
        s.y-=s.speed*.18;
        if(s.x>width+s.length){s.x=-s.length;s.y=Math.random()*height}
        const grad=ctx.createLinearGradient(s.x,s.y,s.x+s.length,s.y);
        grad.addColorStop(0,'transparent');
        grad.addColorStop(.65,a);
        grad.addColorStop(1,'transparent');
        ctx.globalAlpha=s.alpha;
        ctx.strokeStyle=grad;
        ctx.beginPath();
        ctx.moveTo(s.x,s.y);
        ctx.lineTo(s.x+s.length,s.y-18);
        ctx.stroke();
      }
      ctx.globalAlpha=1;
      requestAnimationFrame(frame);
    }

    addEventListener('resize',resize,{passive:true});
    resize();
    requestAnimationFrame(frame);
  }

  document.addEventListener('DOMContentLoaded',()=>{
    boot();
    installController();
    installPointerCamera();
    watchSections();
    canvasUniverse();
    refreshState();
    setInterval(refreshState,9000);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden) refreshState()});
  });
})();
