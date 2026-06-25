let data;const $=id=>document.getElementById(id);const SALT='DJFOLSOE-V801', HASH='8f087b4bb4fa447d0f0269230d9076299bd60d355e8401ff4de936603c8f8f1b';
async function sha256(t){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(t));return Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join('')}
async function boot(){const r=await fetch('assets/data/site-data.json');data=await r.json();mergeLocal();initLogin();renderAdmin();}
function mergeLocal(){const saved=localStorage.getItem('djf_site_data');if(saved){try{data={...data,...JSON.parse(saved)}}catch(e){}}data.station=data.station||{};data.station.twitchLogin=data.station.twitchLogin||'djfolsoe';data.station.streamTitle=data.station.streamTitle||'';data.station.category=data.station.category||'';}
function initLogin(){if(localStorage.getItem('djf_admin_unlocked')==='1')unlock();$('adminLogin').onclick=async()=>{const h=await sha256(SALT+$('adminPassword').value);if(h===HASH){localStorage.setItem('djf_admin_unlocked','1');unlock();}else $('adminMessage').textContent='Forkert password.'};$('adminPassword').onkeydown=e=>{if(e.key==='Enter')$('adminLogin').click()}}
function unlock(){$('adminLocked').classList.add('hidden');$('adminUnlocked').classList.remove('hidden')}
function saveAll(){localStorage.setItem('djf_site_data',JSON.stringify(data));updateBackup();}
function renderAdmin(){renderControl();renderPrograms();renderTop20();renderShows();renderNews();renderRequests();updateBackup();}
function renderControl(){$('liveSelect').value=String(data.station.live);$('viewerInput').value=data.station.viewers||0;$('followersInput').value=data.station.followersCurrent||0;$('activeShowInput').value=data.station.activeShow||'';if($('twitchLoginInput'))$('twitchLoginInput').value=data.station.twitchLogin||'djfolsoe';const api=JSON.parse(localStorage.getItem('djf_twitch_api')||'{}');if($('twitchClientIdInput'))$('twitchClientIdInput').value=api.clientId||'';if($('twitchTokenInput'))$('twitchTokenInput').value=api.token||'';if($('twitchAutoInput'))$('twitchAutoInput').value=String(api.auto||false);}
function collectControl(){data.station.live=$('liveSelect').value==='true';data.station.viewers=Number($('viewerInput').value||0);data.station.followersCurrent=Number($('followersInput').value||0);data.station.activeShow=$('activeShowInput').value.trim();if($('twitchLoginInput'))data.station.twitchLogin=$('twitchLoginInput').value.trim()||'djfolsoe';}
function renderPrograms(){$('programEditor').innerHTML=data.schedule.map((p,i)=>`<div class="programRow"><div><label>Dag</label><input value="${p.day||''}" data-program="${i}" data-field="day"></div><div><label>Tid</label><input value="${p.time||''}" data-program="${i}" data-field="time"></div><div><label>Program</label><input value="${p.show||''}" data-program="${i}" data-field="show"></div><div><label>Beskrivelse</label><input value="${p.description||''}" data-program="${i}" data-field="description"></div><button onclick="removeProgram(${i})">Slet</button></div>`).join('');}
function collectPrograms(){document.querySelectorAll('[data-program]').forEach(inp=>{const i=Number(inp.dataset.program);data.schedule[i][inp.dataset.field]=inp.value;});}
function removeProgram(i){data.schedule.splice(i,1);renderPrograms();saveAll();}

function ensureChart(){
  if(!data.top20Chart){
    data.top20Chart={title:'FOLSOE TV Top 20',subtitle:'FOLSOE AIRPLAY HOT 20',week:'This Week',items:[]};
  }
  if(!Array.isArray(data.top20Chart.items)) data.top20Chart.items=[];
  while(data.top20Chart.items.length<20){
    const i=data.top20Chart.items.length;
    data.top20Chart.items.push({rank:i+1,lastWeek:'-',artist:'',title:'',status:'SAME',points:0,folsoePick:false});
  }
  data.top20Chart.items=data.top20Chart.items.slice(0,20);
  data.top20Chart.items.forEach((x,i)=>{ if(!x.rank)x.rank=i+1; });
}
function renderTop20(){
  ensureChart();
  $('top20Editor').innerHTML=data.top20Chart.items.map((x,i)=>`
    <div class="chartEditRow">
      <div class="rankCell"><label>Rank</label><input value="${x.rank||i+1}" data-chart="${i}" data-field="rank" type="number"></div>
      <div><label>Last</label><input value="${x.lastWeek||''}" data-chart="${i}" data-field="lastWeek"></div>
      <div><label>Artist</label><input value="${x.artist||''}" data-chart="${i}" data-field="artist"></div>
      <div><label>Title</label><input value="${x.title||''}" data-chart="${i}" data-field="title"></div>
      <div><label>Status</label><select data-chart="${i}" data-field="status"><option ${x.status==='NEW'?'selected':''}>NEW</option><option ${x.status==='UP'?'selected':''}>UP</option><option ${x.status==='DOWN'?'selected':''}>DOWN</option><option ${x.status==='SAME'?'selected':''}>SAME</option><option ${x.status==='RE'?'selected':''}>RE</option></select></div>
      <div><label>Points</label><input value="${x.points||0}" data-chart="${i}" data-field="points" type="number"></div>
      <div><label>Pick</label><select data-chart="${i}" data-field="folsoePick"><option value="false" ${!x.folsoePick?'selected':''}>No</option><option value="true" ${x.folsoePick?'selected':''}>Yes</option></select></div>
    </div>`).join('');
}
function collectTop20(){
  ensureChart();
  document.querySelectorAll('[data-chart]').forEach(inp=>{
    const i=Number(inp.dataset.chart), f=inp.dataset.field;
    let v=inp.value;
    if(f==='rank'||f==='points') v=Number(v||0);
    if(f==='folsoePick') v=v==='true';
    data.top20Chart.items[i][f]=v;
  });
  data.top20Chart.items.sort((a,b)=>(Number(a.rank)||999)-(Number(b.rank)||999));
  data.top20=data.top20Chart.items.filter(x=>x.artist||x.title).map(x=>`${x.artist||''} - ${x.title||''}`.replace(/^ - /,'').replace(/ - $/,''));
}
function clearTop(i){ ensureChart(); data.top20Chart.items[i]={rank:i+1,lastWeek:'-',artist:'',title:'',status:'SAME',points:0,folsoePick:false}; renderTop20(); }
function renderShows(){$('showsEditor').innerHTML=(data.shows||[]).map((s,i)=>`<div class="showRow"><div><label>Titel</label><input value="${s.title||''}" data-show="${i}" data-field="title"></div><div><label>Type</label><input value="${s.type||''}" data-show="${i}" data-field="type"></div><div><label>Tekst</label><input value="${s.text||''}" data-show="${i}" data-field="text"></div><button onclick="removeShow(${i})">Slet</button></div>`).join('');}
function collectShows(){document.querySelectorAll('[data-show]').forEach(inp=>{const i=Number(inp.dataset.show);data.shows[i][inp.dataset.field]=inp.value;});}
function removeShow(i){data.shows.splice(i,1);renderShows();saveAll();}
function renderNews(){$('newsEditor').innerHTML=(data.news||[]).map((n,i)=>`<div class="newsRow"><div><label>Tag</label><input value="${n.tag||''}" data-news="${i}" data-field="tag"></div><div><label>Nyhed</label><input value="${n.title||''}" data-news="${i}" data-field="title"></div><button onclick="removeNews(${i})">Slet</button></div>`).join('');}
function collectNews(){document.querySelectorAll('[data-news]').forEach(inp=>{const i=Number(inp.dataset.news);data.news[i][inp.dataset.field]=inp.value;});}
function removeNews(i){data.news.splice(i,1);renderNews();saveAll();}
function renderRequests(){const reqs=JSON.parse(localStorage.getItem('djf_requests')||'[]');$('adminRequests').innerHTML=reqs.length?reqs.map((r,i)=>`<div class="newsItem"><b>${r.name}</b><p>${r.song}</p><small>${r.time}</small></div>`).join(''):'<p>Ingen sangønsker endnu.</p>';}
function collectAll(){collectControl();collectPrograms();collectTop20();collectShows();collectNews();}
function updateBackup(){$('jsonBackup').value=JSON.stringify(data,null,2);}

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

document.addEventListener('DOMContentLoaded',()=>{boot();
$('saveControl').onclick=()=>{collectControl();saveAll();alert('Kontrolcenter gemt.')};$('fetchTwitch').onclick=()=>fetchTwitchLiveData();$('openWebsite').onclick=()=>window.open('index.html','_blank');if($('saveTwitchApi'))$('saveTwitchApi').onclick=()=>saveTwitchSettings();if($('testTwitchApi'))$('testTwitchApi').onclick=()=>fetchTwitchLiveData();startTwitchAutoRefresh();
$('addProgram').onclick=()=>{data.schedule.push({day:'New day',time:'20:00',show:'New show',description:'Description'});renderPrograms();saveAll();};
$('savePrograms').onclick=()=>{collectPrograms();saveAll();alert('Programmer gemt.')};$('addShow').onclick=()=>{data.shows.push({title:'New show',type:'Show',text:'Description'});renderShows();saveAll();};
$('saveShows').onclick=()=>{collectShows();saveAll();alert('Feed gemt.')};$('addNews').onclick=()=>{data.news.push({tag:'News',title:'New headline'});renderNews();saveAll();};
$('saveNews').onclick=()=>{collectNews();saveAll();alert('Nyheder gemt.')};$('saveTop20').onclick=()=>{collectTop20();saveAll();renderTop20();alert('Top 20 gemt.')};if($('sortChart'))$('sortChart').onclick=()=>{collectTop20();data.top20Chart.items.sort((a,b)=>(b.points||0)-(a.points||0));data.top20Chart.items.forEach((x,i)=>x.rank=i+1);saveAll();renderTop20();};$('clearTop20').onclick=()=>{data.top20Chart={title:'FOLSOE TV Top 20',subtitle:'FOLSOE AIRPLAY HOT 20',week:'This Week',items:[]};renderTop20();saveAll();};
$('addManualRequest').onclick=()=>{const arr=JSON.parse(localStorage.getItem('djf_requests')||'[]');arr.unshift({name:$('manualName').value||'Admin',song:$('manualSong').value||'',time:new Date().toISOString()});localStorage.setItem('djf_requests',JSON.stringify(arr));$('manualSong').value='';renderRequests();};
$('clearRequests').onclick=()=>{localStorage.removeItem('djf_requests');renderRequests();};$('exportJson').onclick=()=>{collectAll();const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='site-data.json';a.click();};
$('copyJson').onclick=()=>{collectAll();updateBackup();navigator.clipboard.writeText($('jsonBackup').value);alert('JSON kopieret.')};$('resetLocal').onclick=()=>{localStorage.removeItem('djf_site_data');location.reload();};$('adminLogout').onclick=()=>{localStorage.removeItem('djf_admin_unlocked');location.reload();};
});