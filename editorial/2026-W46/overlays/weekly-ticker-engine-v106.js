/* DJ FOLSOE weekly editorial adapter. One fetch, one current bank. No historical banks loaded. */
(()=>{'use strict';
window.DJF_WEEKLY_STORIES?.destroy?.();
const aliases={'classic-dance':'eurodance',classicdance:'eurodance','retro-hits':'retro','trance-tuesday':'trance','good-morning-twitch':'morning','nu-disco':'nudisco','pop-up':'popup',top20:'chart',summer2026:'summer'};
const profiles=['trance','eurodance','retro','morning','fredagsbar','weekend','popup','nudisco','chart','danske','summer'];
const normalize=s=>aliases[s]||s||'popup',cache=new Map();let data=null,timer=null,request=null,dead=false;
const https=u=>{try{return new URL(u).protocol==='https:';}catch{return false;}};
const triple=(v,max)=>Array.isArray(v)&&v.length===3&&v.every(t=>typeof t==='string'&&t.length>0&&t.length<=max);
function validate(raw){
 const now=Date.now(),from=Date.parse(raw?.publishedAt),until=Date.parse(raw?.expiresAt);
 if(raw?.schema!==1||raw.status!=='published'||!/^\d{4}-W\d{2}$/.test(raw.week)||!Number.isFinite(from)||!Number.isFinite(until)||from>now+300000||until<=now||until-from>15*86400000)return null;
 const shows={};for(const key of ['retro','trance','eurodance'])shows[key]=(Array.isArray(raw.shows?.[key])?raw.shows[key]:[]).filter(s=>s&&typeof s.artist==='string'&&s.artist.length<=120&&typeof s.title==='string'&&s.title.length<=160&&triple(s.text,240)&&Array.isArray(s.sources)&&s.sources.some(https)).slice(0,10);
 const ticker={};
 for(const show of profiles){
  const bank=raw.ticker?.[show];if(!Array.isArray(bank)||bank.length<(['trance','eurodance','retro'].includes(show)?12:6)||bank.length>50)return null;
  const ids=new Set();for(const line of bank){const a=Date.parse(line.validFrom),b=Date.parse(line.validUntil);
   if(!line||typeof line.id!=='string'||line.id.length>160||ids.has(line.id)||line.week!==raw.week||line.show!==show||!['humour','question','fact'].includes(line.kind)||!triple(line.text,550)||!Number.isFinite(a)||!Number.isFinite(b)||a<from||b>until||b<=a||line.kind==='fact'&&(!Array.isArray(line.sources)||!line.sources.some(https)))return null;
   ids.add(line.id);
  }ticker[show]=bank;
 }
 return {week:raw.week,from,until,shows,ticker};
}
async function refresh(){
 if(dead||document.hidden)return;request?.abort();const controller=new AbortController();request=controller;const timeout=setTimeout(()=>controller.abort(),6000);
 try{const r=await fetch('https://folsoetv.dk/assets/data/weekly-show-notes.json',{credentials:'omit',cache:'no-store',signal:controller.signal});if(!r.ok)throw Error('feed');const next=validate(await r.json());if(!next)throw Error('invalid edition');if(!dead){if(data?.week!==next.week)cache.clear();data=next;}}
 catch{if(data&&data.until<=Date.now()){data=null;cache.clear();}}
 finally{clearTimeout(timeout);if(request===controller)request=null;}
}
function current(){return data&&data.from<=Date.now()&&data.until>Date.now()?data:null;}
const labels={humour:['STUDIEGLIMT','STUDIO MOMENT','STUDIOMOMENT'],fact:['HISTORIEN BAG','BEHIND THE SONG','HINTER DEM SONG'],question:['SNAK MED','JOIN THE CHAT','REDE MIT']};
window.DJF_TICKER_LIFE={version:106,pick(show,language){show=normalize(show);const lang=Number.isInteger(language)&&language>=0&&language<3?language:0,d=current();const bank=(d?.ticker[show]||[]).filter(x=>Date.parse(x.validFrom)<=Date.now()&&Date.parse(x.validUntil)>Date.now());if(!bank.length)return {label:'DJ FOLSOE',text:['Musik og godt selskab. Velkommen indenfor.','Music and good company. Welcome in.','Musik und gute Gesellschaft. Herzlich willkommen.'][lang]};
 const slot=Math.floor(Date.now()/90000);let state=cache.get(show);if(!state||state.week!==d.week||state.slot!==slot){const n=state?.week===d.week?state.n+1:0;state={week:d.week,slot,n,id:bank[n%bank.length].id};cache.set(show,state);}const line=bank.find(x=>x.id===state.id)||bank[0];return{label:labels[line.kind][lang],text:line.text[lang]};}};
function destroy(){dead=true;clearInterval(timer);request?.abort();window.removeEventListener('pagehide',destroy);document.removeEventListener('visibilitychange',visible);cache.clear();}
function visible(){if(!document.hidden)refresh();}
window.DJF_WEEKLY_STORIES={story(show){const d=current(),bank=d?.shows[normalize(show)]||[];return bank.length?bank[Math.floor(Date.now()/180000)%bank.length]:null;},refresh,status:()=>({week:current()?.week||null,available:!!current(),version:106,profiles:current()?Object.keys(current().ticker):[]}),destroy};
window.addEventListener('pagehide',destroy);document.addEventListener('visibilitychange',visible);refresh();timer=setInterval(refresh,300000);
})();
