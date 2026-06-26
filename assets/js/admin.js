let data;const $=id=>document.getElementById(id);const SALT='DJFOLSOE-V801', HASH='8f087b4bb4fa447d0f0269230d9076299bd60d355e8401ff4de936603c8f8f1b';
async function sha256(t){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(t));return Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join('')}
async function boot(){
  initBackendFields();
  data = await loadInitialData();
  mergeLocal();
  initLogin();
  renderAdmin();
}
function apiBase(){return (localStorage.getItem('djf_api_base')||window.DJF_API_BASE||'').replace(/\/$/,'');}
function adminToken(){return localStorage.getItem(window.DJF_ADMIN_TOKEN_STORAGE_KEY||'djf_admin_token')||'';}
function initBackendFields(){
  setTimeout(()=>{
    if($('apiBaseInput')) $('apiBaseInput').value=apiBase();
    if($('adminTokenInput')) $('adminTokenInput').value=adminToken();
  },300);
}
async function loadInitialData(){
  const base=apiBase();
  if(base){
    try{
      const r=await fetch(base+'/api/broadcast-core',{cache:'no-store'});
      if(r.ok) return await r.json();
    }catch(e){}
  }
  const r=await fetch('assets/data/site-data.json');
  return await r.json();
}
async function loadFromBackend(){
  const base=apiBase(); if(!base){setBackendStatus('Mangler API Base URL.');return;}
  try{
    const r=await fetch(base+'/api/broadcast-core',{cache:'no-store'});
    if(!r.ok) throw new Error(await r.text());
    data=await r.json();
    localStorage.setItem('djf_site_data',JSON.stringify(data));
    renderAdmin();
    setBackendStatus('Data hentet fra backend.');
  }catch(e){setBackendStatus('Backend fejl: '+e.message);}
}
async function saveToBackend(){
  collectAll();
  const base=apiBase(); const token=adminToken();
  if(!base||!token){setBackendStatus('Mangler API Base URL eller Admin Token.');return;}
  try{
    const r=await fetch(base+'/api/broadcast-core',{method:'POST',headers:{'content-type':'application/json','x-admin-token':token},body:JSON.stringify(data)});
    if(!r.ok) throw new Error(await r.text());
    setBackendStatus('Data gemt i Broadcast Cloud / Cloudflare KV.'); if($('cloudKvStatus')) $('cloudKvStatus').textContent='Saved';
  }catch(e){setBackendStatus('Backend save fejl: '+e.message);}
}
async function loadRequestsBackend(){
  const base=apiBase(); if(!base){setBackendStatus('Mangler API Base URL.');return;}
  try{
    const r=await fetch(base+'/api/requests',{cache:'no-store'});
    if(!r.ok) throw new Error(await r.text());
    const reqs=await r.json();
    localStorage.setItem('djf_requests',JSON.stringify(reqs));
    renderRequests();
    setBackendStatus('Requests hentet fra backend.');
  }catch(e){setBackendStatus('Request backend fejl: '+e.message);}
}
function saveBackendConfig(){if($('apiBaseLogin')) localStorage.setItem('djf_api_base',$('apiBaseLogin').value.trim());
  if($('apiBaseInput')) localStorage.setItem('djf_api_base',$('apiBaseInput').value.trim());
  if($('adminTokenInput')) localStorage.setItem(window.DJF_ADMIN_TOKEN_STORAGE_KEY||'djf_admin_token',$('adminTokenInput').value.trim());
  window.DJF_API_BASE=apiBase();
  setBackendStatus('Backend config gemt lokalt.');
}
function setBackendStatus(msg){const el=$('backendStatus'); if(el) el.textContent=msg;}
function mergeLocal(){const saved=localStorage.getItem('djf_site_data');if(saved){try{data={...data,...JSON.parse(saved)}}catch(e){}}data.station=data.station||{};data.station.twitchLogin=data.station.twitchLogin||'djfolsoe';data.station.streamTitle=data.station.streamTitle||'';data.station.category=data.station.category||'';}
function initLogin(){
  if($('apiBaseLogin')) $('apiBaseLogin').value = apiBase() || 'https://djfolsoe-tv-api.sunefolsoe.workers.dev';
  if(localStorage.getItem('djf_admin_unlocked')==='1' && adminToken()) unlock();
  $('adminLogin').onclick=async()=>{
    if($('apiBaseLogin')) localStorage.setItem('djf_api_base',$('apiBaseLogin').value.trim());
    if($('adminPassword')) localStorage.setItem(window.DJF_ADMIN_TOKEN_STORAGE_KEY||'djf_admin_token',$('adminPassword').value.trim());
    const ok=await validateCloudAdmin();
    if(ok){
      localStorage.setItem('djf_admin_unlocked','1');
      unlock();
      await loadFromBackend();
    }
  };
  $('adminPassword').onkeydown=e=>{if(e.key==='Enter')$('adminLogin').click()};
}
async function validateCloudAdmin(){
  const base=apiBase(), token=adminToken();
  if(!base||!token){$('adminMessage').textContent='Mangler API Base URL eller ADMIN_TOKEN.';return false;}
  try{
    const r=await fetch(base+'/api/admin/validate',{headers:{'x-admin-token':token},cache:'no-store'});
    if(!r.ok) throw new Error('Token blev afvist');
    $('adminMessage').textContent='Cloud admin godkendt.';
    return true;
  }catch(e){
    $('adminMessage').textContent='Cloud login fejl: '+e.message;
    return false;
  }
}
function unlock(){$('adminLocked').classList.add('hidden');$('adminUnlocked').classList.remove('hidden');setTimeout(testCloud,300)}
function saveAll(){localStorage.setItem('djf_site_data',JSON.stringify(data));updateBackup();}
function renderAdmin(){renderControl();renderPrograms();renderTop20();renderShows();renderNews();renderRequests();updateBackup();}
function renderControl(){$('liveSelect').value=String(data.station.live);$('viewerInput').value=data.station.viewers||0;$('followersInput').value=data.station.followersCurrent||0;$('activeShowInput').value=data.station.activeShow||'';if($('twitchLoginInput'))$('twitchLoginInput').value=data.station.twitchLogin||'djfolsoe';const api=JSON.parse(localStorage.getItem('djf_twitch_api')||'{}');if($('twitchClientIdInput'))$('twitchClientIdInput').value=api.clientId||'';if($('twitchTokenInput'))$('twitchTokenInput').value=api.token||'';if($('twitchAutoInput'))$('twitchAutoInput').value=String(api.auto||false);}
function collectControl(){data.station.live=$('liveSelect').value==='true';data.station.viewers=Number($('viewerInput').value||0);data.station.followersCurrent=Number($('followersInput').value||0);data.station.activeShow=$('activeShowInput').value.trim();if($('twitchLoginInput'))data.station.twitchLogin=$('twitchLoginInput').value.trim()||'djfolsoe';}
function renderPrograms(){$('programEditor').innerHTML=data.schedule.map((p,i)=>`<div class="programRow"><div><label>Dag</label><input value="${p.day||''}" data-program="${i}" data-field="day"></div><div><label>Tid</label><input value="${p.time||''}" data-program="${i}" data-field="time"></div><div><label>Program</label><input value="${p.show||''}" data-program="${i}" data-field="show"></div><div><label>Beskrivelse</label><input value="${p.description||''}" data-program="${i}" data-field="description"></div><button onclick="removeProgram(${i})">Slet</button></div>`).join('');}
function collectPrograms(){document.querySelectorAll('[data-program]').forEach(inp=>{const i=Number(inp.dataset.program);data.schedule[i][inp.dataset.field]=inp.value;});}
function removeProgram(i){data.schedule.splice(i,1);renderPrograms();saveAll();}


function ensureChart(){
  if(!data.top20Chart){
    data.top20Chart={title:'FOLSOE TV Top 20',subtitle:'FOLSOE AIRPLAY HOT 20',week:'This Week',archive:[],items:[]};
  }
  if(!data.top20Chart.method){
    data.top20Chart.method={danishAirplay:40,hitlistenDk:20,bbcRadio1Uk:15,spotifyGlobal:10,appleGlobal:5,billboardGlobal:5,folsoePickViewers:5};
  }
  if(!Array.isArray(data.top20Chart.items)) data.top20Chart.items=[];
  while(data.top20Chart.items.length<20){
    const i=data.top20Chart.items.length;
    data.top20Chart.items.push({rank:i+1,lastWeek:'-',artist:'',title:'',status:'SAME',points:0,folsoePick:false,weeks:1,peak:i+1,genre:'Dance',cover:'',spotify:'',youtube:'',apple:'',scores:{danishAirplay:0,hitlistenDk:0,bbcRadio1Uk:0,spotifyGlobal:0,appleGlobal:0,billboardGlobal:0,folsoePickViewers:0}});
  }
  data.top20Chart.items=data.top20Chart.items.slice(0,20);
  data.top20Chart.items.forEach((x,i)=>{
    if(!x.rank)x.rank=i+1;
    if(!x.scores)x.scores={danishAirplay:0,hitlistenDk:0,bbcRadio1Uk:0,spotifyGlobal:0,appleGlobal:0,billboardGlobal:0,folsoePickViewers:0};
    if(!x.weeks)x.weeks=1;
    if(!x.peak)x.peak=x.rank||i+1;
    if(!x.genre)x.genre='Dance';
  });
}
function renderTop20(){
  ensureChart();
  $('top20Editor').innerHTML=data.top20Chart.items.map((x,i)=>`
    <div class="chartEditRow v806">
      <div class="rankCell"><label>Rank</label><input value="${x.rank||i+1}" data-chart="${i}" data-field="rank" type="number"></div>
      <div><label>Last</label><input value="${x.lastWeek||''}" data-chart="${i}" data-field="lastWeek"></div>
      <div><label>Artist</label><input value="${x.artist||''}" data-chart="${i}" data-field="artist"></div>
      <div><label>Title</label><input value="${x.title||''}" data-chart="${i}" data-field="title"></div>
      <div><label>Status</label><select data-chart="${i}" data-field="status"><option ${x.status==='NEW'?'selected':''}>NEW</option><option ${x.status==='UP'?'selected':''}>UP</option><option ${x.status==='DOWN'?'selected':''}>DOWN</option><option ${x.status==='SAME'?'selected':''}>SAME</option><option ${x.status==='RE'?'selected':''}>RE</option></select></div>
      <div><label>Points</label><input value="${x.points||0}" data-chart="${i}" data-field="points" type="number"></div>
      <div><label>Weeks</label><input value="${x.weeks||1}" data-chart="${i}" data-field="weeks" type="number"></div>
      <div><label>Peak</label><input value="${x.peak||x.rank||i+1}" data-chart="${i}" data-field="peak" type="number"></div>
      <div><label>Genre</label><input value="${x.genre||''}" data-chart="${i}" data-field="genre"></div>
      <div><label>Pick</label><select data-chart="${i}" data-field="folsoePick"><option value="false" ${!x.folsoePick?'selected':''}>No</option><option value="true" ${x.folsoePick?'selected':''}>Yes</option></select></div>
      <div><label>Airplay</label><input value="${x.scores?.danishAirplay||0}" data-chart="${i}" data-score="danishAirplay" type="number"></div>
      <div><label>Hitlisten</label><input value="${x.scores?.hitlistenDk||0}" data-chart="${i}" data-score="hitlistenDk" type="number"></div>
      <div><label>BBC/UK</label><input value="${x.scores?.bbcRadio1Uk||0}" data-chart="${i}" data-score="bbcRadio1Uk" type="number"></div>
      <div><label>Spotify</label><input value="${x.scores?.spotifyGlobal||0}" data-chart="${i}" data-score="spotifyGlobal" type="number"></div>
      <div><label>Apple</label><input value="${x.scores?.appleGlobal||0}" data-chart="${i}" data-score="appleGlobal" type="number"></div>
      <div><label>Billboard</label><input value="${x.scores?.billboardGlobal||0}" data-chart="${i}" data-score="billboardGlobal" type="number"></div>
      <div><label>FOLSOE</label><input value="${x.scores?.folsoePickViewers||0}" data-chart="${i}" data-score="folsoePickViewers" type="number"></div>
      <div class="wide"><label>Cover URL</label><input value="${x.cover||''}" data-chart="${i}" data-field="cover"></div>
      <div class="wide"><label>YouTube URL</label><input value="${x.youtube||''}" data-chart="${i}" data-field="youtube"></div>
    </div>`).join('');
}
function collectTop20(){
  ensureChart();
  document.querySelectorAll('[data-chart][data-field]').forEach(inp=>{
    const i=Number(inp.dataset.chart), f=inp.dataset.field;
    let v=inp.value;
    if(['rank','points','weeks','peak'].includes(f)) v=Number(v||0);
    if(f==='folsoePick') v=v==='true';
    data.top20Chart.items[i][f]=v;
  });
  document.querySelectorAll('[data-chart][data-score]').forEach(inp=>{
    const i=Number(inp.dataset.chart), f=inp.dataset.score;
    data.top20Chart.items[i].scores=data.top20Chart.items[i].scores||{};
    data.top20Chart.items[i].scores[f]=Number(inp.value||0);
  });
  data.top20Chart.items.sort((a,b)=>(Number(a.rank)||999)-(Number(b.rank)||999));
  data.top20=data.top20Chart.items.filter(x=>x.artist||x.title).map(x=>`${x.artist||''} - ${x.title||''}`.replace(/^ - /,'').replace(/ - $/,''));
}
function calculateChart(){
  collectTop20();
  const weights=data.top20Chart.method||{danishAirplay:40,hitlistenDk:20,bbcRadio1Uk:15,spotifyGlobal:10,appleGlobal:5,billboardGlobal:5,folsoePickViewers:5};
  data.top20Chart.items.forEach(x=>{
    const s=x.scores||{};
    x.points=Math.round(Object.keys(weights).reduce((sum,k)=>sum+(Number(s[k]||0)*Number(weights[k]||0)),0));
  });
  data.top20Chart.items.sort((a,b)=>(b.points||0)-(a.points||0));
  data.top20Chart.items.forEach((x,i)=>{
    x.rank=i+1;
    const lw=Number(x.lastWeek);
    if(String(x.lastWeek).toUpperCase()==='NEW'||!x.lastWeek) x.status='NEW';
    else if(!isNaN(lw)){
      if(lw>x.rank) x.status='UP';
      else if(lw<x.rank) x.status='DOWN';
      else x.status='SAME';
    }
    x.weeks=String(x.status).toUpperCase()==='NEW'?1:Number(x.weeks||1)+1;
    x.peak=Math.min(Number(x.peak||x.rank),x.rank);
  });
  saveAll();
  renderTop20();
}
function archiveChart(){
  ensureChart(); collectTop20();
  const stamp=new Date().toISOString().slice(0,10);
  data.top20Chart.archive=data.top20Chart.archive||[];
  data.top20Chart.archive.unshift({week:data.top20Chart.week||stamp,date:stamp,items:JSON.parse(JSON.stringify(data.top20Chart.items))});
  saveAll();
  alert('Chart arkiveret for '+stamp);
}
function clearTop(i){ ensureChart(); data.top20Chart.items[i]={rank:i+1,lastWeek:'-',artist:'',title:'',status:'SAME',points:0,folsoePick:false,weeks:1,peak:i+1,genre:'Dance',cover:'',spotify:'',youtube:'',apple:'',scores:{}}; renderTop20(); }
function renderShows(){$('showsEditor').innerHTML=(data.shows||[]).map((s,i)=>`<div class="showRow"><div><label>Titel</label><input value="${s.title||''}" data-show="${i}" data-field="title"></div><div><label>Type</label><input value="${s.type||''}" data-show="${i}" data-field="type"></div><div><label>Tekst</label><input value="${s.text||''}" data-show="${i}" data-field="text"></div><button onclick="removeShow(${i})">Slet</button></div>`).join('');}
function collectShows(){document.querySelectorAll('[data-show]').forEach(inp=>{const i=Number(inp.dataset.show);data.shows[i][inp.dataset.field]=inp.value;});}
function removeShow(i){data.shows.splice(i,1);renderShows();saveAll();}
function renderNews(){$('newsEditor').innerHTML=(data.news||[]).map((n,i)=>`<div class="newsRow"><div><label>Tag</label><input value="${n.tag||''}" data-news="${i}" data-field="tag"></div><div><label>Nyhed</label><input value="${n.title||''}" data-news="${i}" data-field="title"></div><button onclick="removeNews(${i})">Slet</button></div>`).join('');}
function collectNews(){document.querySelectorAll('[data-news]').forEach(inp=>{const i=Number(inp.dataset.news);data.news[i][inp.dataset.field]=inp.value;});}
function removeNews(i){data.news.splice(i,1);renderNews();saveAll();}
function renderRequests(){const reqs=JSON.parse(localStorage.getItem('djf_requests')||'[]');$('adminRequests').innerHTML=reqs.length?reqs.map((r,i)=>`<div class="newsItem"><b>${r.name}</b><p>${r.song}</p><small>${r.time}</small></div>`).join(''):'<p>Ingen sangønsker endnu.</p>';}
function collectAll(){collectControl();collectPrograms();collectTop20();collectShows();collectNews();}
function updateBackup(){$('jsonBackup').value=JSON.stringify(data,null,2);}


async function testCloud(){
  const base=apiBase();
  if(!base){setBackendStatus('Mangler API Base URL.');return false;}
  try{
    const h=await fetch(base+'/api/health',{cache:'no-store'});
    if(!h.ok) throw new Error('Health failed');
    const health=await h.json();
    const c=await fetch(base+'/api/broadcast-core',{cache:'no-store'});
    if(!c.ok) throw new Error('Broadcast core failed');
    if($('cloudApiStatus')) $('cloudApiStatus').textContent='Online';
    if($('cloudKvStatus')) $('cloudKvStatus').textContent='Connected';
    if($('cloudMode')) $('cloudMode').textContent='Cloud-first';
    setBackendStatus('Cloud OK: '+health.service);
    return true;
  }catch(e){
    if($('cloudApiStatus')) $('cloudApiStatus').textContent='Offline';
    if($('cloudKvStatus')) $('cloudKvStatus').textContent='Fallback';
    setBackendStatus('Cloud test fejl: '+e.message);
    return false;
  }
}
function setupV809Buttons(){
  if($('testCloud')) $('testCloud').onclick=()=>testCloud();
  if($('loadFromBackendTop')) $('loadFromBackendTop').onclick=()=>loadFromBackend();
  if($('saveToBackendTop')) $('saveToBackendTop').onclick=()=>saveToBackend();
  if($('openWorkerHealth')) $('openWorkerHealth').onclick=()=>window.open(apiBase()+'/api/health','_blank');
}

function saveTwitchSettings(){
  const api={
    channel: $('twitchLoginInput')?.value.trim() || 'djfolsoe',
    clientId: $('twitchClientIdInput')?.value.trim() || '',
    token: $('twitchTokenInput')?.value.trim() || '',
    auto: $('twitchAutoInput')?.value === 'true'
  };
  localStorage.setItem('djf_twitch_api', JSON.stringify(api));
  data.station.twitchLogin=api.channel;
  saveAll();
  const el=$('twitchApiResult'); if(el) el.textContent='Twitch API settings gemt lokalt.';
  return api;
}
async function fetchTwitchLiveData(){
  const api=saveTwitchSettings();
  const result=$('twitchApiResult')||$('apiStatusLine');
  if(!api.clientId || !api.token || !api.channel){
    if(result) result.textContent='Mangler Client ID, Access Token eller channel login.';
    return false;
  }
  try{
    if(result) result.textContent='Henter Twitch live-data...';
    const userRes=await fetch('https://api.twitch.tv/helix/users?login='+encodeURIComponent(api.channel),{
      headers:{'Client-ID':api.clientId,'Authorization':'Bearer '+api.token}
    });
    const userJson=await userRes.json();
    const user=userJson.data&&userJson.data[0];
    if(!user) throw new Error('Channel ikke fundet');
    data.station.twitchUserId=user.id;
    data.station.followersCurrent=data.station.followersCurrent||0;

    const streamRes=await fetch('https://api.twitch.tv/helix/streams?user_id='+encodeURIComponent(user.id),{
      headers:{'Client-ID':api.clientId,'Authorization':'Bearer '+api.token}
    });
    const streamJson=await streamRes.json();
    const stream=streamJson.data&&streamJson.data[0];

    if(stream){
      data.station.live=true;
      data.station.viewers=stream.viewer_count||0;
      data.station.streamTitle=stream.title||'';
      data.station.category=stream.game_name||'';
      data.station.startedAt=stream.started_at||'';
      if($('activeShowInput')) $('activeShowInput').value=data.station.streamTitle;
      if($('viewerInput')) $('viewerInput').value=data.station.viewers;
      if($('liveSelect')) $('liveSelect').value='true';
      if(result) result.textContent='LIVE: '+data.station.streamTitle+' · '+data.station.viewers+' viewers';
    }else{
      data.station.live=false;
      data.station.viewers=0;
      if($('viewerInput')) $('viewerInput').value=0;
      if($('liveSelect')) $('liveSelect').value='false';
      if(result) result.textContent='OFFLINE: Twitch stream er ikke live.';
    }
    saveAll();
    updateBackup();
    return true;
  }catch(e){
    if(result) result.textContent='Twitch API fejl: '+e.message;
    return false;
  }
}
function startTwitchAutoRefresh(){
  const api=JSON.parse(localStorage.getItem('djf_twitch_api')||'{}');
  if(api.auto){
    setTimeout(fetchTwitchLiveData, 1500);
    setInterval(fetchTwitchLiveData, 60000);
  }
}

document.addEventListener('DOMContentLoaded',()=>{boot();setTimeout(setupV809Buttons,500);
$('saveControl').onclick=()=>{collectControl();saveAll();alert('Kontrolcenter gemt.')};$('fetchTwitch').onclick=()=>fetchTwitchLiveData();$('openWebsite').onclick=()=>window.open('index.html','_blank');if($('saveTwitchApi'))$('saveTwitchApi').onclick=()=>saveTwitchSettings();if($('testTwitchApi'))$('testTwitchApi').onclick=()=>fetchTwitchLiveData();startTwitchAutoRefresh();
$('addProgram').onclick=()=>{data.schedule.push({day:'New day',time:'20:00',show:'New show',description:'Description'});renderPrograms();saveAll();};
$('savePrograms').onclick=()=>{collectPrograms();saveAll();alert('Programmer gemt.')};$('addShow').onclick=()=>{data.shows.push({title:'New show',type:'Show',text:'Description'});renderShows();saveAll();};
$('saveShows').onclick=()=>{collectShows();saveAll();alert('Feed gemt.')};$('addNews').onclick=()=>{data.news.push({tag:'News',title:'New headline'});renderNews();saveAll();};
$('saveNews').onclick=()=>{collectNews();saveAll();alert('Nyheder gemt.')};$('saveTop20').onclick=()=>{collectTop20();saveAll();renderTop20();alert('Top 20 gemt.')};if($('calculateChart'))$('calculateChart').onclick=()=>calculateChart();if($('sortChart'))$('sortChart').onclick=()=>{collectTop20();data.top20Chart.items.sort((a,b)=>(b.points||0)-(a.points||0));data.top20Chart.items.forEach((x,i)=>x.rank=i+1);saveAll();renderTop20();};if($('archiveChart'))$('archiveChart').onclick=()=>archiveChart();$('clearTop20').onclick=()=>{data.top20Chart={title:'FOLSOE TV Top 20',subtitle:'FOLSOE AIRPLAY HOT 20',week:'This Week',items:[]};renderTop20();saveAll();};
$('addManualRequest').onclick=()=>{const arr=JSON.parse(localStorage.getItem('djf_requests')||'[]');arr.unshift({name:$('manualName').value||'Admin',song:$('manualSong').value||'',time:new Date().toISOString()});localStorage.setItem('djf_requests',JSON.stringify(arr));$('manualSong').value='';renderRequests();};
$('clearRequests').onclick=()=>{localStorage.removeItem('djf_requests');renderRequests();};$('exportJson').onclick=()=>{collectAll();const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='site-data.json';a.click();};
$('copyJson').onclick=()=>{collectAll();updateBackup();navigator.clipboard.writeText($('jsonBackup').value);alert('JSON kopieret.')};$('resetLocal').onclick=()=>{localStorage.removeItem('djf_site_data');location.reload();};
if($('saveBackendConfig'))$('saveBackendConfig').onclick=()=>saveBackendConfig();
if($('loadFromBackend'))$('loadFromBackend').onclick=()=>loadFromBackend();
if($('saveToBackend'))$('saveToBackend').onclick=()=>saveToBackend();
if($('loadRequestsBackend'))$('loadRequestsBackend').onclick=()=>loadRequestsBackend();
$('adminLogout').onclick=()=>{localStorage.removeItem('djf_admin_unlocked');location.reload();};
});
async function fetchTwitchFullPackage(){
  const base=apiBase(); if(!base){setBackendStatus('Mangler API Base URL');return;}
  const el=document.getElementById('twitchFullStatus');
  try{
    if(el) el.textContent='Henter Twitch API package...';
    const r=await fetch(base+'/api/twitch-full',{cache:'no-store'});
    if(!r.ok) throw new Error(await r.text());
    const pkg=await r.json();
    data.twitchProfile=pkg.profile||pkg;
    data.twitchLive=pkg.live||{};
    data.twitchChannel=pkg.channel||{};
    data.twitchVideos=pkg.videos||[];
    data.twitchClips=pkg.clips||[];
    saveAll();
    if(el) el.textContent='Twitch data hentet og gemt i Broadcast Cloud.';
  }catch(e){ if(el) el.textContent='Twitch fejl: '+e.message; }
}
document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>{
  const b=document.getElementById('fetchTwitchFull'); if(b)b.onclick=()=>fetchTwitchFullPackage();
  const p=document.getElementById('openTwitchProfileApi'); if(p)p.onclick=()=>window.open(apiBase()+'/api/twitch-profile','_blank');
  const f=document.getElementById('openTwitchFullApi'); if(f)f.onclick=()=>window.open(apiBase()+'/api/twitch-full','_blank');
},800));
