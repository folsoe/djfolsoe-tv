const SITE = {
  apiBase: window.FOLSOE_API_BASE || '',
  defaultLang: localStorage.getItem('folsoe.lang') || 'da'
};

const THEME_CONFIG = {
  fredagsbar:{label:{da:'Fredagsbar',en:'Friday Bar',de:'Freitagsbar'}, emoji:'🍻', image:'/themes/fredagsbar.jpg'},
  popup:{label:{da:'Popup',en:'Pop-up',de:'Pop-up'}, emoji:'⚡', image:'/themes/popup.jpg'},
  trance:{label:{da:'Trance Tuesday',en:'Trance Tuesday',de:'Trance Tuesday'}, emoji:'💙', image:'/themes/trance.jpg'},
  retro:{label:{da:'Retro Hits',en:'Retro Hits',de:'Retro Hits'}, emoji:'🕹️', image:'/themes/retro.jpg'},
  eurodance:{label:{da:'Eurodance',en:'Eurodance',de:'Eurodance'}, emoji:'💛', image:'/themes/eurodance.jpg'},
  morning:{label:{da:'Good Morning Twitch',en:'Good Morning Twitch',de:'Good Morning Twitch'}, emoji:'🌞', image:'/themes/morning.jpg'},
  summer:{label:{da:'Summer Beats',en:'Summer Beats',de:'Summer Beats'}, emoji:'🌴', image:'/themes/summer.jpg'},
  weekend:{label:{da:'Weekend Vibes',en:'Weekend Vibes',de:'Weekend Vibes'}, emoji:'🎉', image:'/themes/weekend.jpg'}
};

const I18N = {
 da:{themeEngine:'Theme Engine', switchTheme:'Skift aktivt tema i Broadcast Cloud.', activeTheme:'Aktivt tema', openApi:'Åbn /api/theme', newsroom:'FOLSOE Music Newsroom', newsroomText:'Henter samlet RSS fra EDM, dance, Danmark og internationale musikkilder via Cloudflare Worker.', fetchNews:'Hent nyheder nu', openNewsApi:'Åbn /api/newsroom', noNews:'Ingen nyheder hentet endnu.', notUpdated:'Newsroom ikke opdateret endnu.', aboutTitle:'Hvem er DJ FOLSOE?', aboutText:'DJ FOLSOE streamer musik-tv, dance, trance, retro, eurodance og pop-up shows fra Danmark med fokus på fællesskab, chat, mods og seerønsker.', modsTitle:'Mods og community', modsText:'Mods hjælper med god stemning, tryg chat og flow i showet. Her kan du fremhæve dine faste mods og deres roller.', latestTop:'Seneste topnyheder', latestBottom:'Bundticker', chatTitle:'Live chat', avatarMissing:'Profilbilleder kræver Twitch Client ID og App Token i Worker.'},
 en:{themeEngine:'Theme Engine', switchTheme:'Switch the active theme in Broadcast Cloud.', activeTheme:'Active theme', openApi:'Open /api/theme', newsroom:'FOLSOE Music Newsroom', newsroomText:'Collects RSS from EDM, dance, Danish and international music sources through a Cloudflare Worker.', fetchNews:'Fetch news now', openNewsApi:'Open /api/newsroom', noNews:'No news fetched yet.', notUpdated:'Newsroom has not updated yet.', aboutTitle:'Who is DJ FOLSOE?', aboutText:'DJ FOLSOE streams music TV, dance, trance, retro, eurodance and pop-up shows from Denmark with community, chat, mods and viewer requests at the center.', modsTitle:'Mods and community', modsText:'Mods keep the vibe positive, the chat safe and the show flowing. Use this section to highlight your regular mods and their roles.', latestTop:'Latest top news', latestBottom:'Bottom ticker', chatTitle:'Live chat', avatarMissing:'Profile pictures require Twitch Client ID and App Token in the Worker.'},
 de:{themeEngine:'Theme Engine', switchTheme:'Aktives Thema in der Broadcast Cloud wechseln.', activeTheme:'Aktives Thema', openApi:'/api/theme öffnen', newsroom:'FOLSOE Music Newsroom', newsroomText:'Sammelt RSS aus EDM, Dance, Dänemark und internationalen Musikquellen über einen Cloudflare Worker.', fetchNews:'News jetzt laden', openNewsApi:'/api/newsroom öffnen', noNews:'Noch keine News geladen.', notUpdated:'Newsroom wurde noch nicht aktualisiert.', aboutTitle:'Wer ist DJ FOLSOE?', aboutText:'DJ FOLSOE streamt Musik-TV, Dance, Trance, Retro, Eurodance und Pop-up-Shows aus Dänemark mit Community, Chat, Mods und Musikwünschen im Mittelpunkt.', modsTitle:'Mods und Community', modsText:'Mods sorgen für gute Stimmung, sicheren Chat und einen sauberen Showflow. Hier kannst du deine festen Mods und Rollen hervorheben.', latestTop:'Neueste Top-News', latestBottom:'Ticker unten', chatTitle:'Live-Chat', avatarMissing:'Profilbilder benötigen Twitch Client ID und App Token im Worker.'}
};

const channel = ('BroadcastChannel' in window) ? new BroadcastChannel('folsoe-theme') : null;
function t(k){return (I18N[SITE.defaultLang]||I18N.da)[k]||k;}
function setLang(lang){SITE.defaultLang=lang; localStorage.setItem('folsoe.lang',lang); document.documentElement.lang=lang; renderText(); renderThemeButtons();}
function getTheme(){return localStorage.getItem('folsoe.theme') || 'retro';}
async function setTheme(theme, source='admin'){
 if(!THEME_CONFIG[theme]) return;
 localStorage.setItem('folsoe.theme', theme);
 applyTheme(theme);
 channel?.postMessage({type:'theme', theme, source, ts:Date.now()});
 try{ await fetch(`${SITE.apiBase}/api/theme`, {method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({theme})}); }catch(e){}
}
function applyTheme(theme){
 const cfg=THEME_CONFIG[theme]||THEME_CONFIG.retro;
 const img=new Image(); img.src=cfg.image;
 document.documentElement.style.setProperty('--theme-bg', `url('${cfg.image}')`);
 document.querySelectorAll('[data-active-theme]').forEach(el=>el.textContent=`${t('activeTheme')}: ${theme}`);
 document.querySelectorAll('[data-theme-name]').forEach(el=>el.textContent=cfg.label[SITE.defaultLang]||cfg.label.da);
}
async function syncTheme(){
 try{const r=await fetch(`${SITE.apiBase}/api/theme`,{cache:'no-store'}); if(r.ok){const j=await r.json(); if(j.theme&&j.theme!==getTheme()){localStorage.setItem('folsoe.theme',j.theme); applyTheme(j.theme);}}}catch(e){}
}
function renderText(){document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=t(el.dataset.i18n)); applyTheme(getTheme());}
function renderThemeButtons(){
 const wrap=document.querySelector('[data-theme-buttons]'); if(!wrap) return; wrap.innerHTML='';
 Object.entries(THEME_CONFIG).forEach(([key,cfg])=>{const b=document.createElement('button'); b.className='pill'; b.textContent=`${cfg.emoji} ${cfg.label[SITE.defaultLang]||cfg.label.da}`; b.onclick=()=>setTheme(key); wrap.appendChild(b);});
}
async function fetchNews(){
 const status=document.querySelector('[data-news-status]'), list=document.querySelector('[data-news-list]'), top=document.querySelector('[data-news-top]'), bottom=document.querySelector('[data-news-bottom]');
 try{const r=await fetch(`${SITE.apiBase}/api/newsroom`,{cache:'no-store'}); const j=await r.json(); const items=j.items||[]; status&&(status.textContent=j.updatedAt?`Updated: ${new Date(j.updatedAt).toLocaleString()}`:t('notUpdated')); const html=items.slice(0,8).map(x=>`<article class="news"><b>${escapeHtml(x.title)}</b><small>${escapeHtml(x.source||'Music News')}</small><p>${escapeHtml(x.summary||'')}</p></article>`).join('')||`<p>${t('noNews')}</p>`; list&&(list.innerHTML=html); top&&(top.textContent=items[0]?.title||t('noNews')); bottom&&(bottom.textContent=items.slice(0,5).map(x=>x.title).join(' • ')||t('noNews'));}catch(e){status&&(status.textContent='Newsroom API not reachable yet.');}
}
function escapeHtml(s=''){return String(s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));}
channel && (channel.onmessage=e=>{if(e.data?.type==='theme') {localStorage.setItem('folsoe.theme',e.data.theme); applyTheme(e.data.theme);}});
window.addEventListener('storage',e=>{if(e.key==='folsoe.theme') applyTheme(e.newValue||'retro');});
window.Folsoe={setTheme, syncTheme, setLang, fetchNews, THEME_CONFIG};
document.addEventListener('DOMContentLoaded',()=>{renderText(); renderThemeButtons(); applyTheme(getTheme()); syncTheme(); fetchNews(); setInterval(syncTheme,2000);});
