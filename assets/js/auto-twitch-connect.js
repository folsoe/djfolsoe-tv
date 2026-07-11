const API_BASE='https://djfolsoe-tv-api.sunefolsoe.workers.dev';
const $=id=>document.getElementById(id);
const token=()=>$('adminToken').value.trim();
let pollTimer=null;
let countdownTimer=null;

function headers(){return {'Content-Type':'application/json','X-Admin-Token':token()}}
function out(data){$('output').textContent=typeof data==='string'?data:JSON.stringify(data,null,2)}
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
async function api(path,options={}){
  const response=await fetch(API_BASE+path,{cache:'no-store',...options,headers:{...headers(),...(options.headers||{})}});
  const data=await response.json();
  return data;
}
async function loadFeed(){
  const d=await(await fetch(API_BASE+'/api/ext004/feed?limit=40&t='+Date.now(),{cache:'no-store'})).json();
  $('eventCount').textContent=d.count||0;
  $('activityFeed').innerHTML=(d.events||[]).map(e=>`<article><b>${esc(e.type)}</b><div><strong>${esc(e.headline)}</strong><br><small>${esc(e.detail)}</small></div><time>${new Date(e.timestamp).toLocaleString()}</time></article>`).join('')||'<p>No activity yet.</p>';
}
function renderConnected(d){
  const connected=!!d.connected;
  $('connectionOrb').textContent=connected?'CONNECTED':'OFFLINE';
  $('connectionOrb').classList.toggle('is-live',connected);
  $('userTokenState').textContent=connected?'CONNECTED':'NOT CONNECTED';
  $('userTokenDetail').textContent=connected?`${d.login||'DJ FOLSOE'} · expires in ${Math.round((d.expires_in||0)/60)} min`:'Connect Twitch to begin.';
  $('scopeList').innerHTML=(d.scopes||[]).map(s=>`<span>${esc(s)}</span>`).join('')||'<span>No scopes loaded</span>';
  if(connected) $('deviceCard').hidden=true;
}
async function checkStatus(){
  if(!token()) return out('ADMIN_TOKEN is required.');
  const d=await api('/api/ext004/admin/device/status');
  out(d);renderConnected(d);await loadFeed();return d;
}
function startCountdown(expiresAt){
  clearInterval(countdownTimer);
  countdownTimer=setInterval(()=>{
    const seconds=Math.max(0,Math.round((Number(expiresAt)-Date.now())/1000));
    $('deviceCountdown').textContent=`Code expires in ${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;
    if(seconds<=0) clearInterval(countdownTimer);
  },1000);
}
async function startConnect(){
  if(!token()) return out('ADMIN_TOKEN is required.');
  const d=await api('/api/ext004/admin/device/start',{method:'POST',body:'{}'});
  out(d);
  if(!d.ok) return;
  $('deviceCard').hidden=false;
  $('deviceCode').textContent=d.user_code||'--------';
  $('deviceLink').href=d.verification_uri||'https://www.twitch.tv/activate';
  startCountdown(d.expires_at);
  window.open(d.verification_uri||'https://www.twitch.tv/activate','_blank','noopener');
  clearInterval(pollTimer);
  pollTimer=setInterval(pollConnect,Math.max(5000,Number(d.interval||5)*1000));
}
async function pollConnect(){
  const d=await api('/api/ext004/admin/device/poll');
  out(d);
  if(d.connected){
    clearInterval(pollTimer);clearInterval(countdownTimer);
    renderConnected(d);await loadFeed();
  } else if(!d.ok && !d.pending){
    clearInterval(pollTimer);
  }
}
async function disconnect(){
  if(!token()) return out('ADMIN_TOKEN is required.');
  const d=await api('/api/ext004/admin/device/disconnect',{method:'POST',body:'{}'});
  out(d);renderConnected({connected:false,scopes:[]});$('deviceCard').hidden=true;
}
$('connectTwitch').onclick=startConnect;
$('checkStatus').onclick=checkStatus;
$('disconnectTwitch').onclick=disconnect;
loadFeed();
