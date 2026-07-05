// DJ FOLSOE NETWORK EXT001-B · GitHub admin community page
const API_BASE = 'https://djfolsoe-tv-api.sunefolsoe.workers.dev';
const $ = (id) => document.getElementById(id);

function out(data){ $('adminOutput').textContent = typeof data === 'string' ? data : JSON.stringify(data, null, 2); }

async function loadViewer(){
  const login = $('viewerLogin').value.trim().replace(/^@/,'');
  if(!login) return out('Missing Twitch login');
  const res = await fetch(`${API_BASE}/api/ext001/viewer?login=${encodeURIComponent(login)}&create=1`, {cache:'no-store'});
  const data = await res.json();
  const v = data.viewer || data;
  $('displayName').value = v.display_name || '';
  $('profileImage').value = v.profile_image || v.avatar || '';
  $('level').value = v.level || 1;
  $('xp').value = v.xp || 0;
  $('vip').value = v.vip || 0;
  $('moderator').value = v.moderator || 0;
  out(v);
}

async function saveViewer(){
  const login = $('viewerLogin').value.trim().replace(/^@/,'');
  const token = $('adminToken').value.trim();
  if(!login) return out('Missing Twitch login');
  if(!token) return out('Missing ADMIN_TOKEN');

  const body = {
    login,
    display_name: $('displayName').value.trim(),
    profile_image: $('profileImage').value.trim(),
    level: Number($('level').value || 1),
    xp: Number($('xp').value || 0),
    vip: Number($('vip').value || 0),
    moderator: Number($('moderator').value || 0)
  };

  const res = await fetch(`${API_BASE}/api/ext001/admin/viewer`, {
    method:'POST',
    headers:{'Content-Type':'application/json','X-Admin-Token': token},
    body: JSON.stringify(body)
  });
  const data = await res.json();
  out(data);
}

$('loadViewer')?.addEventListener('click', loadViewer);
$('saveViewer')?.addEventListener('click', saveViewer);
