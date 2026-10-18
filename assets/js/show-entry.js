/* DJ FOLSOE 20–29. Existing read-only endpoints; no credentials or new service. */
(()=>{'use strict';
const API='https://djfolsoe-tv-api.sunefolsoe.workers.dev',langs=['da','en','de'],locales=['da-DK','en-GB','de-DE'],key='djf.site.language.v1';
function unwrap(raw){return raw?.data&&!Array.isArray(raw.data)?raw.data:raw?.twitch||raw;}
function liveState(raw,now=Date.now()){
 if(!raw||typeof raw!=='object'||raw.error)return 'unknown';
 const stamp=raw.generatedAt||raw.updatedAt;if(stamp&&(!Number.isFinite(Date.parse(stamp))||now-Date.parse(stamp)>600000))return 'unknown';
 const d=unwrap(raw);if(!d||d.error)return 'unknown';
 for(const v of [d.live,d.isLive,d.online,d.stream?.live]){if(v===true||v===1||v==='true')return 'live';if(v===false||v===0||v==='false')return 'offline';}
 if(d.type==='live'||d.stream?.type==='live')return 'live';if(d.type==='offline'||Object.hasOwn(d,'stream')&&d.stream===null)return 'offline';
 if(Array.isArray(raw.data))return raw.data.length&&raw.data[0]?.type==='live'?'live':raw.data.length===0?'offline':'unknown';
 return 'unknown';
}
function nextShow(raw,now=Date.now()){
 if(!raw||typeof raw!=='object'||raw.error)return {state:'error'};
 const stamp=raw.generatedAt;if(stamp&&(!Number.isFinite(Date.parse(stamp))||now-Date.parse(stamp)>86400000))return {state:'error'};
 const d=unwrap(raw);if(!d||d.error)return {state:'error'};
 const list=Array.isArray(d.segments)?d.segments:Array.isArray(raw.data)?raw.data:null;
 const direct=d.next||d.nextShow;
 if(!list&&!direct)return {state:'error'};
 const rows=[...(list||[]),...(direct?[direct]:[])].filter(x=>x&&!x.canceled_until&&!x.canceledUntil&&!x.cancelled&&!x.canceled).map(x=>({title:String(x.title||x.name||'DJ FOLSOE'),at:Date.parse(x.startTime||x.start_time||'')})).filter(x=>Number.isFinite(x.at)&&x.at>now).sort((a,b)=>a.at-b.at);
 return rows.length?{state:'ready',...rows[0]}:{state:'empty'};
}
window.DJF_ENTRY_STATUS={liveState,nextShow};
if(typeof document==='undefined')return;
const data=window.DJF_ENTRY_COPY;if(!data)return;
let saved='';try{saved=localStorage.getItem(key)||'';}catch{}
let lang=[new URLSearchParams(location.search).get('lang'),saved,navigator.language?.slice(0,2),'da'].find(x=>langs.includes(x)),status='loading',next={state:'error'},loadedAt=0,busy=false;
const i=()=>langs.indexOf(lang),word=k=>data[k]?.[i()]||k;
function renderStatus(){
 const live=document.getElementById('live-state'),node=document.getElementById('next-show');
 if(live){live.textContent=word(status);live.dataset.state=status;}
 if(node)node.textContent=next.state==='ready'?next.title+' · '+new Intl.DateTimeFormat(locales[i()],{weekday:'long',day:'numeric',month:'long',hour:'2-digit',minute:'2-digit',timeZone:'Europe/Copenhagen',timeZoneName:'short'}).format(next.at):word(next.state==='empty'?'noschedule':'schedulefail');
}
function render(){document.documentElement.lang=lang;const path=location.pathname;const titleKey=path==='/'||path==='/index.html'?'hero':/^\/(?:shows|showhub)\/(?:index.html)?$/.test(path)?'all':path.startsWith('/music/')?'music':path.startsWith('/commands/')?'join':null;if(titleKey)document.title=word(titleKey).replace(/\n/g,' ')+' | DJ FOLSOE';document.querySelectorAll('[data-copy]').forEach(n=>n.textContent=word(n.dataset.copy));document.querySelectorAll('[data-lang]').forEach(n=>n.setAttribute('aria-pressed',String(n.dataset.lang===lang)));document.querySelectorAll('a[href^="/"]').forEach(a=>{const u=new URL(a.getAttribute('href'),location.origin);u.searchParams.set('lang',lang);a.href=u.pathname+u.search+u.hash;});
 const desc=path.startsWith('/shows/')&&data['desc_'+document.documentElement.dataset.show]||data.lead;document.querySelector('meta[name="description"]')?.setAttribute('content',desc[i()]);renderStatus();}
function setLanguage(value,persist=true){if(!langs.includes(value))return;lang=value;if(persist){try{localStorage.setItem(key,lang);}catch{}const u=new URL(location.href);u.searchParams.set('lang',lang);try{history.replaceState(null,'',u);}catch{}}render();window.dispatchEvent(new CustomEvent('djf:languagechange',{detail:{language:lang}}));}
window.DJF_I18N={get language(){return lang},get locale(){return locales[i()]},setLanguage,t:k=>word(k)};
document.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>setLanguage(b.dataset.lang)));
window.addEventListener('storage',e=>{if(e.key===key)setLanguage(e.newValue,false);});
async function get(path){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000);try{const r=await fetch(API+path,{cache:'no-store',credentials:'omit',signal:controller.signal});if(!r.ok)throw Error('HTTP '+r.status);return await r.json();}finally{clearTimeout(timer);}}
async function refresh(){if(busy||document.hidden||!document.getElementById('live-state'))return;busy=true;const button=document.getElementById('refresh');if(button)button.disabled=true;try{const [a,b]=await Promise.allSettled([get('/api/twitch'),get('/api/twitch-schedule')]);status=a.status==='fulfilled'?liveState(a.value):'unknown';next=b.status==='fulfilled'?nextShow(b.value):{state:'error'};loadedAt=Date.now();renderStatus();}finally{busy=false;if(button)button.disabled=false;}}
document.getElementById('refresh')?.addEventListener('click',refresh);
const timer=setInterval(()=>{if(!document.hidden){if(loadedAt&&Date.now()-loadedAt>120000){status='unknown';next={state:'error'};renderStatus();}refresh();}},60000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden){if(Date.now()-loadedAt>120000){status='unknown';next={state:'error'};renderStatus();}refresh();}});
window.addEventListener('pagehide',()=>clearInterval(timer),{once:true});
const form=document.getElementById('request-form');if(form)form.addEventListener('submit',async e=>{e.preventDefault();const artist=document.getElementById('artist').value.replace(/\s+/g,' ').trim(),track=document.getElementById('track').value.replace(/\s+/g,' ').trim();if(!artist||!track)return;const output=document.getElementById('request-result'),feedback=document.getElementById('request-feedback');output.value=['ønske: ','request: ','wunsch: '][i()]+artist+' - '+track;output.hidden=false;try{await navigator.clipboard.writeText(output.value);feedback.textContent=word('copied');}catch{feedback.textContent=word('copyfail');output.focus();output.select();}});
document.getElementById('player-details')?.addEventListener('toggle',e=>{const mount=document.getElementById('player-mount');if(e.target.open&&!mount.firstChild&&/^https?:$/.test(location.protocol)){const f=document.createElement('iframe');f.src='https://player.twitch.tv/?channel=djfolsoe&parent='+encodeURIComponent(location.hostname)+'&autoplay=false';f.title='DJ FOLSOE · Twitch';f.allowFullscreen=true;mount.append(f);}else if(!e.target.open)mount.replaceChildren();});
render();refresh();
})();
