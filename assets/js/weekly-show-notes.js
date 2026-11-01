/* Weekly editorial excerpts. This file does not read Spotify metadata or play music. */
(()=>{'use strict';
const roots=[...document.querySelectorAll('[data-djf-playlists]')];if(!roots.length)return;
const keys=['retro','trance','eurodance'],langs=['da','en','de'];let records=null,expiresAt=0,controller=null,busy=false,timer=null;
const index=()=>Math.max(0,langs.indexOf(document.documentElement.lang));
const headings=['Historier bag musikken','Stories behind the music','Geschichten hinter der Musik'];
const sourceText=['Kilde ↗','Source ↗','Quelle ↗'];
function validate(raw){if(raw?.schema!==1||raw.status!=='published'||!/^\d{4}-W\d{2}$/.test(raw.week))return null;const published=Date.parse(raw.publishedAt),expires=Date.parse(raw.expiresAt),now=Date.now();if(!Number.isFinite(published)||!Number.isFinite(expires)||published>now+300000||expires<=now||expires-published>15*86400000)return null;
 expiresAt=expires;const out={};for(const k of keys){out[k]=(Array.isArray(raw.shows?.[k])?raw.shows[k]:[]).filter(s=>s&&typeof s.artist==='string'&&s.artist.length<=120&&typeof s.title==='string'&&s.title.length<=160&&Array.isArray(s.text)&&s.text.length===3&&s.text.every(t=>typeof t==='string'&&t.length>0&&t.length<=240)&&Array.isArray(s.sources)&&s.sources.some(x=>{try{return new URL(x).protocol==='https:';}catch{return false;}})).slice(0,10);}return out;}
function render(){if(expiresAt<=Date.now())records=null;for(const root of roots){let section=root.querySelector('.djf-weekly-notes');if(section)section.remove();if(!records)continue;const wanted=root.dataset.playlistShow?[root.dataset.playlistShow]:keys;const stories=wanted.flatMap(k=>(records[k]||[]).map(s=>({...s,key:k})));if(!stories.length)continue;
 section=document.createElement('div');section.className='djf-weekly-notes';const heading=document.createElement('h3');heading.textContent=headings[index()];section.append(heading);
 const list=document.createElement('div');list.className='djf-weekly-note-grid';for(const story of stories.slice(0,root.dataset.playlistShow?10:6)){const card=document.createElement('article');card.className='djf-weekly-note';const title=document.createElement('h4');title.textContent=story.artist+' · '+story.title;const body=document.createElement('p');body.textContent=story.text[index()];const link=document.createElement('a');link.textContent=sourceText[index()];link.href=story.sources.find(x=>{try{return new URL(x).protocol==='https:';}catch{return false;}});link.target='_blank';link.rel='noopener noreferrer';card.append(title,body,link);list.append(card);}section.append(list);root.append(section);
 }}
async function refresh(){if(busy)return;busy=true;controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),8000);try{const r=await fetch('/assets/data/weekly-show-notes.json',{credentials:'omit',cache:'no-store',signal:controller.signal});if(!r.ok)throw Error();records=validate(await r.json());render();}catch{if(expiresAt<=Date.now()){records=null;render();}}finally{clearTimeout(timeout);busy=false;}}
const observer=new MutationObserver(()=>{if(records&&roots.some(r=>!r.querySelector('.djf-weekly-notes')))render();});roots.forEach(r=>observer.observe(r,{childList:true}));
function start(){if(timer)return;refresh();timer=setInterval(()=>{if(expiresAt<=Date.now()&&records){records=null;render();}if(!document.hidden)refresh();},60000);}function stop(){clearInterval(timer);timer=null;controller?.abort();}
window.addEventListener('pagehide',stop);window.addEventListener('pageshow',start);start();
window.addEventListener('djf:languagechange',render);
})();
