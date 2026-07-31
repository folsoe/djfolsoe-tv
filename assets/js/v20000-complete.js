(() => {
"use strict";
const API="https://djfolsoe-tv-api.sunefolsoe.workers.dev";
const CHANNEL="djfolsoe";
const $=id=>document.getElementById(id);
const state={live:false,viewers:0,followers:874,title:"",theme:"GOOD MORNING",nextTitle:"GOOD MORNING TWITCH",nextAt:null};

function parents(){const s=new Set(["folsoetv.dk","www.folsoetv.dk"]);if(location.hostname&&!["localhost","127.0.0.1"].includes(location.hostname))s.add(location.hostname);return [...s]}
function pq(){return parents().map(x=>"parent="+encodeURIComponent(x)).join("&")}
function mount(){
 $("twitchPlayer").src=`https://player.twitch.tv/?channel=${CHANNEL}&${pq()}&autoplay=false&muted=false`;
 $("twitchChat").src=`https://www.twitch.tv/embed/${CHANNEL}/chat?${pq()}&darkpopout`;
 $("twitchPlayer").addEventListener("load",()=>setTimeout(()=>$("playerLoading").classList.add("hidden"),500),{once:true});
}
async function fetchJson(url,ms=4500){const c=new AbortController(),t=setTimeout(()=>c.abort(),ms);try{const r=await fetch(url,{cache:"no-store",signal:c.signal});if(!r.ok)throw Error(r.status);return await r.json()}finally{clearTimeout(t)}}
function obj(r){return r?.data||r?.twitch||r?.broadcast||r||{}}
function bool(d){return Boolean(d.live??d.isLive??d.online??String(d.type||"").toLowerCase()==="live")}
function pick(...x){return x.find(v=>v!==undefined&&v!==null&&v!=="")}
async function refresh(){
 let tw={},bc={};
 await Promise.allSettled([
  fetchJson(`${API}/api/twitch`).then(x=>tw=obj(x)),
  fetchJson(`${API}/api/broadcast`).then(x=>bc=obj(x))
 ]);
 state.live=bool(tw)||bool(bc);
 state.viewers=Number(pick(tw.viewerCount,tw.viewers,tw.viewer_count,bc.viewers,0));
 state.followers=Number(pick(tw.followers,tw.followerCount,bc.followers,state.followers));
 state.title=String(pick(tw.title,tw.streamTitle,bc.streamTitle,bc.showTitle,""));
 state.theme=String(pick(bc.theme?.title,bc.activeTheme,bc.theme,state.theme)).replace(/[_-]/g," ").toUpperCase();
 state.nextTitle=String(pick(bc.nextShow?.title,bc.nextTitle,bc.nextShowTitle,state.nextTitle));
 const when=pick(bc.nextShow?.start,bc.nextShow?.startsAt,bc.nextShowTime,bc.nextAt);
 state.nextAt=when?new Date(when):state.nextAt;
 render();
}
function render(){
 $("followers").textContent=state.followers.toLocaleString("en-US");
 $("viewers").textContent=state.viewers.toLocaleString("en-US");
 $("theme").textContent=state.theme;
 $("channelStats").textContent=`${state.followers.toLocaleString("en-US")} FOLLOWERS · ${state.viewers.toLocaleString("en-US")} VIEWERS`;
 $("nextShow").textContent=state.nextTitle;
 const b=$("watchButton"),p=$("livePill");
 b.classList.toggle("isLive",state.live); b.querySelector("span").textContent=state.live?"SE MED NU · WATCH LIVE":"OPEN THE LIVE CHANNEL";
 p.classList.toggle("live",state.live); p.querySelector("b").textContent=state.live?"LIVE NOW":"OFFLINE";
 $("liveHeading").textContent=state.live?(state.title||"DJ FOLSOE IS LIVE NOW"):"DJ FOLSOE LIVE CHANNEL";
 $("streamTitle").textContent=state.live?(state.title||"DJ FOLSOE LIVE"):"DJ FOLSOE · OFF AIR";
 $("streamMeta").textContent=state.live&&state.viewers?`${state.viewers.toLocaleString("en-US")} watching now · Twitch chat is open`:"Official Twitch stream embedded on FOLSOE TV";
 $("offlineMessage").hidden=state.live;
 $("deskTitle").textContent=state.live?"DJ FOLSOE IS LIVE NOW":"WELCOME TO DJ FOLSOE";
 $("deskText").textContent=state.live?"Watch the stream and join the Twitch chat directly above.":"Follow the channel and become part of the community.";
}
function tick(){
 if(!(state.nextAt instanceof Date)||isNaN(state.nextAt)){ $("nextTime").textContent="Follow Twitch for the next live notification"; return }
 let d=Math.max(0,state.nextAt-Date.now()),h=Math.floor(d/36e5),m=Math.floor(d%36e5/6e4),s=Math.floor(d%6e4/1e3);
 $("countH").textContent=String(h).padStart(2,"0");$("countM").textContent=String(m).padStart(2,"0");$("countS").textContent=String(s).padStart(2,"0");
 $("nextTime").textContent=state.nextAt.toLocaleString("en-GB",{weekday:"long",hour:"2-digit",minute:"2-digit",timeZone:"Europe/Copenhagen"});
}
const desk=[
 ["WELCOME TO DJ FOLSOE","Follow the channel and become part of the community."],
 ["LIVE MUSIC TV FROM DENMARK","Eurodance, Trance, Retro Hits and Nu-Disco."],
 ["YOUR MUSIC · YOUR CHAT · YOUR SHOW","Use Twitch chat to interact with the live broadcast."],
 ["WATCH ON ANY SCREEN","Open folsoetv.dk and press Se med nu."]
];let di=0;
function rotate(){di=(di+1)%desk.length;$("deskTitle").textContent=state.live&&di===0?"DJ FOLSOE IS LIVE NOW":desk[di][0];$("deskText").textContent=desk[di][1]}
mount();refresh();render();tick();setInterval(tick,1000);setInterval(refresh,30000);setInterval(rotate,8500);
window.DJF_V20000=Object.freeze({refresh,status:()=>({...state,parents:parents()})});
})();