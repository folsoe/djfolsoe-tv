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
    data.top20Chart={title:'FOLSOE Weekly Listening Chart',subtitle:'FOLSOE WEEKLY LISTENING CHART',week:'This Week',archive:[],items:[]};
  }
  if(!data.top20Chart.method){
    data.top20Chart.method={folsoeListening:45,danishCharts:20,edmTrend:15,spotify:15,viewerRequests:5};
  }
  if(!Array.isArray((data.weeklyListeningChart||data.top20Chart).items)) (data.weeklyListeningChart||data.top20Chart).items=[];
  while((data.weeklyListeningChart||data.top20Chart).items.length<20){
    const i=(data.weeklyListeningChart||data.top20Chart).items.length;
    (data.weeklyListeningChart||data.top20Chart).items.push({rank:i+1,lastWeek:'-',artist:'',title:'',status:'SAME',points:0,folsoePick:false,weeks:1,peak:i+1,genre:'Dance',cover:'',spotify:'',youtube:'',apple:'',scores:{folsoeListening:0,danishCharts:0,edmTrend:0,spotify:0,viewerRequests:0}});
  }
  (data.weeklyListeningChart||data.top20Chart).items=(data.weeklyListeningChart||data.top20Chart).items.slice(0,20);
  (data.weeklyListeningChart||data.top20Chart).items.forEach((x,i)=>{
    if(!x.rank)x.rank=i+1;
    if(!x.scores)x.scores={folsoeListening:0,danishCharts:0,edmTrend:0,spotify:0,viewerRequests:0};
    if(!x.weeks)x.weeks=1;
    if(!x.peak)x.peak=x.rank||i+1;
    if(!x.genre)x.genre='Dance';
  });
}
function renderTop20(){
  ensureChart();
  $('top20Editor').innerHTML=(data.weeklyListeningChart||data.top20Chart).items.map((x,i)=>`
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
      <div><label>FOLSOE</label><input value="${x.scores?.danishFOLSOE||0}" data-chart="${i}" data-score="folsoeListening" type="number"></div>
      <div><label>DK Chart</label><input value="${x.scores?.hitlistenDk||0}" data-chart="${i}" data-score="danishCharts" type="number"></div>
      <div><label>EDM</label><input value="${x.scores?.bbcRadio1Uk||0}" data-chart="${i}" data-score="edmTrend" type="number"></div>
      <div><label>Spotify</label><input value="${x.scores?.spotifyGlobal||0}" data-chart="${i}" data-score="spotify" type="number"></div>
      <div><label>Apple</label><input value="${x.scores?.appleGlobal||0}" data-chart="${i}" data-score="viewerRequests" type="number"></div>
      <div><label>Spotify</label><input value="${x.scores?.billboardGlobal||0}" data-chart="${i}" data-score="spotify" type="number"></div>
      <div><label>FOLSOE</label><input value="${x.scores?.folsoePickViewers||0}" data-chart="${i}" data-score="viewerRequests" type="number"></div>
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
    (data.weeklyListeningChart||data.top20Chart).items[i][f]=v;
  });
  document.querySelectorAll('[data-chart][data-score]').forEach(inp=>{
    const i=Number(inp.dataset.chart), f=inp.dataset.score;
    (data.weeklyListeningChart||data.top20Chart).items[i].scores=(data.weeklyListeningChart||data.top20Chart).items[i].scores||{};
    (data.weeklyListeningChart||data.top20Chart).items[i].scores[f]=Number(inp.value||0);
  });
  (data.weeklyListeningChart||data.top20Chart).items.sort((a,b)=>(Number(a.rank)||999)-(Number(b.rank)||999));
  data.top20=(data.weeklyListeningChart||data.top20Chart).items.filter(x=>x.artist||x.title).map(x=>`${x.artist||''} - ${x.title||''}`.replace(/^ - /,'').replace(/ - $/,''));
}
function calculateChart(){
  collectTop20();
  const weights=data.top20Chart.method||{folsoeListening:45,danishCharts:20,edmTrend:15,spotify:15,viewerRequests:5};
  (data.weeklyListeningChart||data.top20Chart).items.forEach(x=>{
    const s=x.scores||{};
    x.points=Math.round(Object.keys(weights).reduce((sum,k)=>sum+(Number(s[k]||0)*Number(weights[k]||0)),0));
  });
  (data.weeklyListeningChart||data.top20Chart).items.sort((a,b)=>(b.points||0)-(a.points||0));
  (data.weeklyListeningChart||data.top20Chart).items.forEach((x,i)=>{
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
  data.top20Chart.archive.unshift({week:data.top20Chart.week||stamp,date:stamp,items:JSON.parse(JSON.stringify((data.weeklyListeningChart||data.top20Chart).items))});
  saveAll();
  alert('Chart arkiveret for '+stamp);
}
function clearTop(i){ ensureChart(); (data.weeklyListeningChart||data.top20Chart).items[i]={rank:i+1,lastWeek:'-',artist:'',title:'',status:'SAME',points:0,folsoePick:false,weeks:1,peak:i+1,genre:'Dance',cover:'',spotify:'',youtube:'',apple:'',scores:{}}; renderTop20(); }
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
$('saveNews').onclick=()=>{collectNews();saveAll();alert('Nyheder gemt.')};$('saveTop20').onclick=()=>{collectTop20();saveAll();renderTop20();alert('Top 20 gemt.')};if($('calculateChart'))$('calculateChart').onclick=()=>calculateChart();if($('sortChart'))$('sortChart').onclick=()=>{collectTop20();(data.weeklyListeningChart||data.top20Chart).items.sort((a,b)=>(b.points||0)-(a.points||0));(data.weeklyListeningChart||data.top20Chart).items.forEach((x,i)=>x.rank=i+1);saveAll();renderTop20();};if($('archiveChart'))$('archiveChart').onclick=()=>archiveChart();$('clearTop20').onclick=()=>{data.top20Chart={title:'FOLSOE Weekly Listening Chart',subtitle:'FOLSOE WEEKLY LISTENING CHART',week:'This Week',items:[]};renderTop20();saveAll();};
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



/* V812.1 CHART LAB ENGINE */
function ensureChartLab(){
  data.chartLab = data.chartLab || {
    version:'V812.1',
    title:'FOLSOE Chart Lab',
    maxCandidates:40,
    outputSize:20,
    method:{folsoeListening:45,danishCharts:20,edmTrend:15,spotify:15,viewerRequests:5},
    candidates:[]
  };
  data.chartLab.method = data.chartLab.method || {folsoeListening:45,danishCharts:20,edmTrend:15,spotify:15,viewerRequests:5};
  data.chartLab.candidates = data.chartLab.candidates || [];
  while(data.chartLab.candidates.length < 40){
    const i=data.chartLab.candidates.length;
    data.chartLab.candidates.push({
      candidate:true,rank:i+1,lastWeek:'-',artist:'',title:'',status:'SAME',points:0,weeks:1,peak:i+1,genre:'Dance',pick:false,cover:'',youtube:'',
      scores:{folsoeListening:0,danishCharts:0,edmTrend:0,spotify:0,viewerRequests:0}
    });
  }
  data.chartLab.candidates = data.chartLab.candidates.slice(0,40);
}
function calcCandidatePoints(c){
  const w=(data.chartLab&&data.chartLab.method)||{folsoeListening:45,danishCharts:20,edmTrend:15,spotify:15,viewerRequests:5};
  const s=c.scores||{};
  return Math.round(
    (Number(s.folsoeListening||0)*w.folsoeListening +
     Number(s.danishCharts||0)*w.danishCharts +
     Number(s.edmTrend||0)*w.edmTrend +
     Number(s.spotify||0)*w.spotify +
     Number(s.viewerRequests||0)*w.viewerRequests) / 100
  );
}
function renderTop20(){
  ensureChartLab();
  const rows=data.chartLab.candidates;
  $('top20Editor').innerHTML=rows.map((x,i)=>{
    x.scores=x.scores||{};
    const pts=calcCandidatePoints(x);
    return `<div class="chartEditRow lab">
      <div><label>Rank</label><input value="${x.rank||i+1}" data-lab="${i}" data-field="rank" type="number"></div>
      <div><label>Last</label><input value="${x.lastWeek||'-'}" data-lab="${i}" data-field="lastWeek"></div>
      <div><label>Artist</label><input value="${x.artist||''}" data-lab="${i}" data-field="artist"></div>
      <div><label>Title</label><input value="${x.title||''}" data-lab="${i}" data-field="title"></div>
      <div><label>Status</label><select data-lab="${i}" data-field="status"><option ${x.status==='NEW'?'selected':''}>NEW</option><option ${x.status==='UP'?'selected':''}>UP</option><option ${x.status==='DOWN'?'selected':''}>DOWN</option><option ${x.status==='SAME'?'selected':''}>SAME</option><option ${x.status==='RE'?'selected':''}>RE</option></select></div>
      <div><label>Genre</label><input value="${x.genre||''}" data-lab="${i}" data-field="genre"></div>
      <div><label>FOLSOE</label><input value="${x.scores.folsoeListening||0}" data-lab="${i}" data-score="folsoeListening" type="number"></div>
      <div><label>DK Chart</label><input value="${x.scores.danishCharts||0}" data-lab="${i}" data-score="danishCharts" type="number"></div>
      <div><label>EDM</label><input value="${x.scores.edmTrend||0}" data-lab="${i}" data-score="edmTrend" type="number"></div>
      <div><label>Spotify</label><input value="${x.scores.spotify||0}" data-lab="${i}" data-score="spotify" type="number"></div>
      <div><label>Viewer</label><input value="${x.scores.viewerRequests||0}" data-lab="${i}" data-score="viewerRequests" type="number"></div>
      <div><label>Points</label><div class="pointsPreview">${pts}</div></div>
      <div><label>Weeks</label><input value="${x.weeks||1}" data-lab="${i}" data-field="weeks" type="number"></div>
      <div><label>Peak</label><input value="${x.peak||x.rank||i+1}" data-lab="${i}" data-field="peak" type="number"></div>
      <div><label>Pick</label><select data-lab="${i}" data-field="pick"><option value="false" ${!x.pick?'selected':''}>No</option><option value="true" ${x.pick?'selected':''}>Yes</option></select></div>
      <div class="wide"><label>Cover URL</label><input value="${x.cover||''}" data-lab="${i}" data-field="cover"></div>
      <div class="wide"><label>YouTube URL</label><input value="${x.youtube||''}" data-lab="${i}" data-field="youtube"></div>
    </div>`;
  }).join('');
  updateChartLabSummary();
}
function collectTop20(){
  ensureChartLab();
  document.querySelectorAll('[data-lab][data-field]').forEach(inp=>{
    const i=Number(inp.dataset.lab), f=inp.dataset.field;
    let v=inp.value;
    if(['rank','weeks','peak'].includes(f)) v=Number(v||0);
    if(f==='pick') v=v==='true';
    data.chartLab.candidates[i][f]=v;
  });
  document.querySelectorAll('[data-lab][data-score]').forEach(inp=>{
    const i=Number(inp.dataset.lab), f=inp.dataset.score;
    data.chartLab.candidates[i].scores=data.chartLab.candidates[i].scores||{};
    data.chartLab.candidates[i].scores[f]=Math.max(0,Math.min(100,Number(inp.value||0)));
  });
}
function calculateChartLab(){
  collectTop20();
  const filled=data.chartLab.candidates.filter(x=>x.artist||x.title);
  filled.forEach(x=>x.points=calcCandidatePoints(x));
  filled.sort((a,b)=>(b.points||0)-(a.points||0));
  filled.forEach((x,i)=>{
    x.rank=i+1;
    const lw=Number(x.lastWeek);
    if(String(x.lastWeek).toUpperCase()==='NEW'||!x.lastWeek||x.lastWeek==='-') x.status='NEW';
    else if(!isNaN(lw)) x.status=lw>x.rank?'UP':lw<x.rank?'DOWN':'SAME';
    x.weeks=String(x.status).toUpperCase()==='NEW'?1:Number(x.weeks||1)+1;
    x.peak=Math.min(Number(x.peak||x.rank),x.rank);
  });
  const empty=data.chartLab.candidates.filter(x=>!(x.artist||x.title));
  data.chartLab.candidates=[...filled,...empty].slice(0,40);
  promoteTop20(false);
  renderTop20();
}
function promoteTop20(showAlert=true){
  collectTop20();
  const filled=data.chartLab.candidates.filter(x=>x.artist||x.title).map(x=>({...x, points:calcCandidatePoints(x)})).sort((a,b)=>(b.points||0)-(a.points||0));
  const top=filled.slice(0,20).map((x,i)=>({
    rank:i+1,lastWeek:x.lastWeek,artist:x.artist,title:x.title,status:x.status,points:x.points,weeks:x.weeks,peak:x.peak,genre:x.genre,folsoePick:!!x.pick,cover:x.cover,youtube:x.youtube,
    scores:x.scores
  }));
  data.weeklyListeningChart=data.weeklyListeningChart||{};
  data.weeklyListeningChart.title='FOLSOE Weekly Listening Chart';
  data.weeklyListeningChart.subtitle='Based on FOLSOE listening, Danish charts, EDM trends, Spotify and viewer requests';
  data.weeklyListeningChart.method=data.chartLab.method;
  data.weeklyListeningChart.items=top;
  data.top20Chart=data.weeklyListeningChart;
  data.top20=top.map(x=>`${x.artist} - ${x.title}`);
  saveAll();
  if(showAlert) alert('Top 20 sendt til website og gemt lokalt. Brug Gem alt til Cloud for backend.');
}
function addCandidate(){
  ensureChartLab();
  data.chartLab.candidates.unshift({candidate:true,rank:1,lastWeek:'NEW',artist:'',title:'',status:'NEW',points:0,weeks:1,peak:1,genre:'Dance',pick:false,cover:'',youtube:'',scores:{folsoeListening:0,danishCharts:0,edmTrend:0,spotify:0,viewerRequests:0}});
  data.chartLab.candidates=data.chartLab.candidates.slice(0,40);
  renderTop20();
}
function importCandidates(){
  ensureChartLab();
  const box=document.getElementById('candidateImportBox');
  const txt=(box&&box.value||'').trim();
  if(!txt){alert('Indsæt kandidater først.');return;}
  const imported=txt.split(/\n+/).map(line=>{
    const parts=line.split('|').map(x=>x.trim());
    const name=parts[0]||'';
    const [artist,title]=name.includes(' - ')?name.split(' - ',2):[name,''];
    return {candidate:true,rank:1,lastWeek:'NEW',artist,title,genre:parts[1]||'Dance',status:'NEW',points:0,weeks:1,peak:1,pick:false,cover:'',youtube:'',
      scores:{folsoeListening:Number(parts[2]||0),danishCharts:Number(parts[3]||0),edmTrend:Number(parts[4]||0),spotify:Number(parts[5]||0),viewerRequests:Number(parts[6]||0)}
    };
  });
  data.chartLab.candidates=[...imported,...data.chartLab.candidates].slice(0,40);
  renderTop20();
}
function exportChartLab(){
  collectTop20();
  const blob=new Blob([JSON.stringify(data.chartLab,null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='folsoe-chart-lab.json';a.click();
}
function updateChartLabSummary(){
  const el=document.getElementById('chartLabSummary');
  if(!el||!data.chartLab)return;
  const filled=data.chartLab.candidates.filter(x=>x.artist||x.title).length;
  const top=data.chartLab.candidates.filter(x=>x.artist||x.title).map(x=>({...x,points:calcCandidatePoints(x)})).sort((a,b)=>b.points-a.points)[0];
  el.textContent=`${filled} kandidater · Top preview: ${top?(top.artist+' - '+top.title+' ('+top.points+' pts)'):'ingen endnu'} · Vægtning: FOLSOE 45 / DK 20 / EDM 15 / Spotify 15 / Viewer 5`;
}
function clearTop(i){ensureChartLab();data.chartLab.candidates[i]={candidate:true,rank:i+1,lastWeek:'-',artist:'',title:'',status:'SAME',points:0,weeks:1,peak:i+1,genre:'Dance',pick:false,cover:'',youtube:'',scores:{folsoeListening:0,danishCharts:0,edmTrend:0,spotify:0,viewerRequests:0}};renderTop20();}
document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>{
  const a=document.getElementById('addCandidate'); if(a)a.onclick=()=>addCandidate();
  const i=document.getElementById('importCandidates'); if(i)i.onclick=()=>importCandidates();
  const c=document.getElementById('calculateChartLab'); if(c)c.onclick=()=>calculateChartLab();
  const p=document.getElementById('promoteTop20'); if(p)p.onclick=()=>promoteTop20(true);
  const e=document.getElementById('exportChartLab'); if(e)e.onclick=()=>exportChartLab();
},900));



/* V812.2 DATA FETCH FIX - Cloud auto sync */
function v8122SetSyncStatus(mode, msg){
  let el=document.getElementById('chartLabSummary');
  if(!el) return;
  el.classList.remove('sync-ok','sync-warn','sync-error');
  if(mode==='ok') el.classList.add('sync-ok');
  if(mode==='warn') el.classList.add('sync-warn');
  if(mode==='error') el.classList.add('sync-error');
  el.textContent = msg || el.textContent;
}
async function v8122LoadChartLabFromCloud(){
  const base = typeof apiBase === 'function' ? apiBase() : ((window.DJF_API_BASE||'').replace(/\/$/,''));
  if(!base) return false;
  try{
    const r = await fetch(base + '/api/chart-lab', {cache:'no-store'});
    if(!r.ok) throw new Error(await r.text());
    const lab = await r.json();
    if(lab && lab.candidates){
      data.chartLab = lab;
      if(typeof renderTop20 === 'function') renderTop20();
      v8122SetSyncStatus('ok','Chart Lab hentet fra Cloud.');
      return true;
    }
  }catch(e){
    v8122SetSyncStatus('error','Kunne ikke hente Chart Lab fra Cloud: ' + e.message);
  }
  return false;
}
async function v8122SaveChartLabToCloud(){
  if(typeof collectTop20 === 'function') collectTop20();
  const base = typeof apiBase === 'function' ? apiBase() : ((window.DJF_API_BASE||'').replace(/\/$/,''));
  const token = typeof adminToken === 'function' ? adminToken() : (localStorage.getItem(window.DJF_ADMIN_TOKEN_STORAGE_KEY||'djf_admin_token')||'');
  if(!base || !token){
    v8122SetSyncStatus('warn','Gemt lokalt – mangler API Base URL eller ADMIN_TOKEN.');
    if(typeof saveAll === 'function') saveAll();
    return false;
  }
  try{
    const r = await fetch(base + '/api/chart-lab', {
      method:'POST',
      headers:{'content-type':'application/json','x-admin-token':token},
      body:JSON.stringify(data.chartLab)
    });
    if(!r.ok) throw new Error(await r.text());
    v8122SetSyncStatus('ok','Chart Lab gemt i Cloud.');
    return true;
  }catch(e){
    v8122SetSyncStatus('error','Cloud save fejl: ' + e.message);
    return false;
  }
}
async function v8122CalculateChartLabInCloud(){
  const saved = await v8122SaveChartLabToCloud();
  if(!saved) return false;
  const base = typeof apiBase === 'function' ? apiBase() : ((window.DJF_API_BASE||'').replace(/\/$/,''));
  const token = typeof adminToken === 'function' ? adminToken() : (localStorage.getItem(window.DJF_ADMIN_TOKEN_STORAGE_KEY||'djf_admin_token')||'');
  try{
    const r = await fetch(base + '/api/chart-lab/calculate', {
      method:'POST',
      headers:{'content-type':'application/json','x-admin-token':token}
    });
    if(!r.ok) throw new Error(await r.text());
    const result = await r.json();
    if(result.chartLab) data.chartLab = result.chartLab;
    if(result.chart) {
      data.weeklyListeningChart = result.chart;
      data.top20Chart = result.chart;
    }
    if(typeof renderTop20 === 'function') renderTop20();
    if(typeof saveAll === 'function') saveAll();
    v8122SetSyncStatus('ok','Top 20 beregnet og gemt i Cloud.');
    return true;
  }catch(e){
    v8122SetSyncStatus('error','Cloud calculate fejl: ' + e.message);
    return false;
  }
}
document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>{
  v8122LoadChartLabFromCloud();
  const calc=document.getElementById('calculateChartLab');
  if(calc) calc.onclick=async()=>{ 
    if(typeof calculateChartLab === 'function') calculateChartLab();
    await v8122CalculateChartLabInCloud();
  };
  const promote=document.getElementById('promoteTop20');
  if(promote) promote.onclick=async()=>{ 
    if(typeof promoteTop20 === 'function') promoteTop20(false);
    await v8122SaveChartLabToCloud();
    if(typeof saveToBackend === 'function') await saveToBackend();
    v8122SetSyncStatus('ok','Top 20 sendt til website og gemt i Cloud.');
  };
},1200));



/* V812.3 IMPORT PLAYLIST AUTOFILL ENGINE */
function v8123NormalizeText(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');}
function v8123DetectGenre(artist,title){
  const a=v8123NormalizeText(artist+" "+title);
  if(/armin|trance|van buuren/.test(a)) return "Vocal Trance";
  if(/anyma|afterlife|bad angel/.test(a)) return "Melodic Techno";
  if(/meduza|anotr|armand|helden|hugel|house|miracle/.test(a)) return "House";
  if(/calvin|becky|lost frequencies|robin schulz|felix|cascada|alesso|onerepublic|kato/.test(a)) return "Dance Pop";
  if(/timmy trumpet|hardwell|maddix|scooter/.test(a)) return "Festival EDM";
  if(/svenstrup|vendelboe|dj encore|rune rask|hampenberg|minds of 99|under din sne|udødelige|udodelige/.test(a)) return "Dansk Dance";
  if(/axwell|swedish house|guetta|alok|tiesto/.test(a)) return "Progressive House / EDM";
  return "Dance";
}
function v8123SuggestScores(artist,title,genre){
  const a=v8123NormalizeText(artist+" "+title+" "+genre);
  let folsoe=82, dk=45, edm=78, spotify=70, viewer=45;
  if(/axwell|armin|anyma|calvin|guetta|alok|meduza|anotr|hugel|lost frequencies|bebe rexha|faithless/.test(a)){folsoe+=10;edm+=12;spotify+=12;}
  if(/svenstrup|vendelboe|dj encore|rune rask|hampenberg|minds of 99|kato|under din sne|udødelige|udodelige/.test(a)){dk+=42;viewer+=15;folsoe+=5;}
  if(/trance|armin|van buuren/.test(a)){folsoe+=13;edm+=13;viewer+=10;spotify-=8;}
  if(/melodic techno|anyma|bad angel/.test(a)){folsoe+=12;edm+=15;dk-=10;}
  if(/house|hugel|anotr|armand|meduza/.test(a)){edm+=10;spotify+=8;}
  if(/dance pop|becky|robin schulz|lost frequencies|felix|cascada|alesso|onerepublic/.test(a)){dk+=15;spotify+=14;}
  if(/festival edm|timmy trumpet|frank walker|john martin/.test(a)){edm+=12;viewer+=12;}
  if(/bootleg|remix/.test(a)){viewer+=18;dk+=10;spotify-=20;folsoe+=6;}
  if(/whatever turns you on|satisfy|shine|dream a little dream|bad angel|new religion/.test(a)){folsoe+=8;edm+=8;spotify+=5;}
  const clamp=n=>Math.max(0,Math.min(100,Math.round(n)));
  return {folsoeListening:clamp(folsoe),danishCharts:clamp(dk),edmTrend:clamp(edm),spotify:clamp(spotify),viewerRequests:clamp(viewer)};
}
function v8123ParseLine(line){
  let clean=String(line||'').trim(); if(!clean) return null;
  clean=clean.replace(/^\d+[\.\)]\s*/,'').replace(/\s+/g,' ');
  const parts=clean.split('|').map(x=>x.trim());
  const main=parts[0]; let artist="", title="";
  if(main.includes(" - ")){[artist,title]=main.split(" - ",2).map(x=>x.trim());} else {artist=main.trim(); title="";}
  const genre=parts[1]||v8123DetectGenre(artist,title);
  const scores=(parts.length>=7)?{folsoeListening:Number(parts[2]||0),danishCharts:Number(parts[3]||0),edmTrend:Number(parts[4]||0),spotify:Number(parts[5]||0),viewerRequests:Number(parts[6]||0)}:v8123SuggestScores(artist,title,genre);
  return {candidate:true,rank:1,lastWeek:"NEW",artist,title,status:"NEW",points:0,weeks:1,peak:1,genre,pick:false,cover:"",youtube:"",scores};
}
function importCandidates(){
  if(typeof ensureChartLab==="function") ensureChartLab();
  const box=document.getElementById('candidateImportBox');
  const txt=(box&&box.value||'').trim();
  if(!txt){alert('Indsæt en playlist først.');return;}
  const imported=txt.split(/\n+/).map(v8123ParseLine).filter(Boolean);
  const existing=new Set((data.chartLab.candidates||[]).map(x=>(String(x.artist).toLowerCase()+"|"+String(x.title).toLowerCase())));
  const fresh=imported.filter(x=>!existing.has(String(x.artist).toLowerCase()+"|"+String(x.title).toLowerCase()));
  data.chartLab.candidates=[...fresh,...(data.chartLab.candidates||[])].slice(0,40);
  if(typeof renderTop20==="function") renderTop20();
  if(typeof v8122SetSyncStatus==="function") v8122SetSyncStatus('warn',fresh.length+' sange importeret og autofyldt. Klik Beregn Top 20.');
  else alert(fresh.length+' sange importeret og autofyldt.');
}

/* V813 Unified Music Newsroom Admin */
async function v813RefreshNewsroom(){
  const base=apiBase(); const token=adminToken();
  const st=document.getElementById('newsroomStatus');
  if(!base||!token){ if(st)st.textContent='Mangler API Base URL eller ADMIN_TOKEN.'; return; }
  try{
    if(st) st.textContent='Henter musiknyheder...';
    const r=await fetch(base+'/api/newsroom/refresh',{headers:{'x-admin-token':token},cache:'no-store'});
    if(!r.ok) throw new Error(await r.text());
    const result=await r.json();
    data.unifiedNewsroom=result.newsroom;
    saveAll();
    v813RenderAdminNewsroom();
    if(st) st.textContent='Newsroom opdateret: '+((result.newsroom.items||[]).length)+' historier.';
  }catch(e){ if(st) st.textContent='Newsroom fejl: '+e.message; }
}
function v813RenderAdminNewsroom(){
  const list=document.getElementById('newsroomAdminList');
  if(!list) return;
  const items=(data.unifiedNewsroom&&data.unifiedNewsroom.items)||[];
  list.innerHTML=items.slice(0,12).map(x=>`<article class="newsroomItem"><b>${x.category||'Music'}</b><h3>${x.title||''}</h3><p>${x.summary||''}</p><small>${x.source||''}</small></article>`).join('') || '<p>Ingen nyheder hentet endnu.</p>';
}
document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>{
  const r=document.getElementById('refreshNewsroom'); if(r) r.onclick=()=>v813RefreshNewsroom();
  const o=document.getElementById('openNewsroomApi'); if(o) o.onclick=()=>window.open(apiBase()+'/api/newsroom','_blank');
  v813RenderAdminNewsroom();
},1000));



/* V813.2 FORCE KV BRANDING SYNC */
async function forceBrandingFix(){
  const base = apiBase();
  const token = adminToken();
  if(!base || !token){ alert("Mangler API Base URL eller ADMIN_TOKEN"); return; }
  try{
    const r = await fetch(base + "/api/admin/force-branding", {
      method:"POST",
      headers:{ "x-admin-token": token }
    });
    if(!r.ok) throw new Error(await r.text());
    const result = await r.json();
    data = result.core || data;
    saveAll();
    if(typeof renderAll === "function") renderAll();
    if(typeof renderTop20 === "function") renderTop20();
    alert("Branding er nu tvunget ind i Cloudflare KV. Hard refresh hjemmesiden med Ctrl+F5.");
  }catch(e){
    alert("Force branding fejl: " + e.message);
  }
}
document.addEventListener("DOMContentLoaded",()=>setTimeout(()=>{
  const b=document.getElementById("forceBrandingFix");
  if(b) b.onclick=()=>forceBrandingFix();
},1000));
