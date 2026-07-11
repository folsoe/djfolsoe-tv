const API_BASE='https://djfolsoe-tv-api.sunefolsoe.workers.dev';
const $=id=>document.getElementById(id);
const token=()=>$('adminToken').value.trim();
const headers=()=>({'Content-Type':'application/json','X-Admin-Token':token()});
function output(data){$('output').textContent=typeof data==='string'?data:JSON.stringify(data,null,2)}
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
async function loadFeed(){
  const d=await(await fetch(API_BASE+'/api/ext004/feed?limit=80&t='+Date.now(),{cache:'no-store'})).json();
  $('activityFeed').innerHTML=(d.events||[]).map(e=>`<article><b>${esc(e.type)}</b><div><strong>${esc(e.headline)}</strong><br><small>${esc(e.detail)}</small></div><time>${new Date(e.timestamp).toLocaleString()}</time></article>`).join('')||'<p>No activity stored yet.</p>';
}
async function post(path,body={}){
  if(!token()) return output('ADMIN_TOKEN is required.');
  const r=await fetch(API_BASE+path,{method:'POST',headers:headers(),body:JSON.stringify(body)});
  const d=await r.json();output(d);await loadFeed();return d;
}
$('setupEventSub').onclick=()=>post('/api/ext004/admin/setup-eventsub');
$('loadFeed').onclick=loadFeed;
$('clearFeed').onclick=()=>post('/api/ext004/admin/clear');
$('listSubscriptions').onclick=async()=>{
  if(!token()) return output('ADMIN_TOKEN is required.');
  const d=await(await fetch(API_BASE+'/api/ext004/admin/subscriptions',{headers:{'X-Admin-Token':token()},cache:'no-store'})).json();
  output(d);
};
$('addEvent').onclick=()=>post('/api/ext004/admin/event',{
  type:$('eventType').value,
  headline:$('eventHeadline').value,
  detail:$('eventDetail').value,
  user_login:$('eventLogin').value
});
loadFeed();
