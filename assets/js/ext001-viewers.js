async function load(){
const r=await fetch('/api/ext001/leaderboard');
const d=await r.json();
document.getElementById('viewer-grid').innerHTML=(d.viewers||[]).map(v=>
`<div class="card"><img src="${v.profile_image}"><h3>${v.display_name}</h3><p>Level ${v.level||1}</p></div>`).join('');
}
load();