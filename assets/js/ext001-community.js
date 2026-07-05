// DJ FOLSOE NETWORK EXT001-B · GitHub community page
const API_BASE = 'https://djfolsoe-tv-api.sunefolsoe.workers.dev';
const qs = (s) => document.querySelector(s);

function esc(v){ return String(v ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

function viewerCard(v){
  return `
    <article class="djf-card">
      <img src="${esc(v.profile_image || v.avatar || '')}" alt="">
      <h3>${esc(v.display_name || v.login || 'Viewer')}</h3>
      <p class="djf-meta">@${esc(v.login || '')}</p>
      <div class="djf-stats">
        <div><strong>${esc(v.level || 1)}</strong><span>Level</span></div>
        <div><strong>${esc(v.messages || 0)}</strong><span>Chat</span></div>
        <div><strong>${esc(v.xp || 0)}</strong><span>XP</span></div>
      </div>
    </article>
  `;
}

async function loadLeaderboard(){
  const grid = qs('#djfViewerGrid');
  grid.innerHTML = '<p class="djf-meta">Loading Twitch viewer data...</p>';
  try{
    const res = await fetch(`${API_BASE}/api/ext001/leaderboard?limit=50`, {cache:'no-store'});
    const data = await res.json();
    const viewers = data.viewers || [];
    grid.innerHTML = viewers.length ? viewers.map(viewerCard).join('') : '<p class="djf-meta">No viewers registered yet. Open the stream chat to create profiles.</p>';
  }catch(e){
    grid.innerHTML = '<p class="djf-meta">Could not load community data.</p>';
  }
}

async function openProfile(){
  const login = qs('#djfViewerSearch').value.trim().replace(/^@/,'');
  if(!login) return;
  const box = qs('#djfProfile');
  box.hidden = false;
  box.innerHTML = '<p class="djf-meta">Loading viewer profile...</p>';
  try{
    const res = await fetch(`${API_BASE}/api/ext001/viewer?login=${encodeURIComponent(login)}&create=1`, {cache:'no-store'});
    const v = await res.json();
    const viewer = v.viewer || v;
    box.innerHTML = `
      <img src="${esc(viewer.profile_image || viewer.avatar || '')}" alt="">
      <h3>${esc(viewer.display_name || viewer.login)}</h3>
      <p class="djf-meta">@${esc(viewer.login)} · First seen ${viewer.first_seen ? new Date(viewer.first_seen).toLocaleDateString() : 'today'}</p>
      <div class="djf-stats">
        <div><strong>${esc(viewer.level || 1)}</strong><span>Level</span></div>
        <div><strong>${esc(viewer.messages || 0)}</strong><span>Chat</span></div>
        <div><strong>${esc(viewer.profile_hits || 0)}</strong><span>Profile hits</span></div>
      </div>
    `;
    loadLeaderboard();
  }catch(e){
    box.innerHTML = '<p class="djf-meta">Could not load viewer profile.</p>';
  }
}

qs('#djfSearchBtn')?.addEventListener('click', openProfile);
qs('#djfRefreshBtn')?.addEventListener('click', loadLeaderboard);
qs('#djfViewerSearch')?.addEventListener('keydown', e => { if(e.key === 'Enter') openProfile(); });
loadLeaderboard();
