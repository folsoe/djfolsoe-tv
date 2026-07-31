(() => {
"use strict";
const API="https://djfolsoe-tv-api.sunefolsoe.workers.dev";
const SCHEDULE_URL="https://djfolsoe-tv-api.sunefolsoe.workers.dev/api/twitch-schedule";
const CHANNEL="djfolsoe";
const $=id=>document.getElementById(id);
const state={live:false,viewers:0,followers:874,title:"",theme:"GOOD MORNING",schedule:[],next:null,scheduleUpdated:"",scheduleError:""};

function parents(){const s=new Set(["folsoetv.dk","www.folsoetv.dk"]);if(location.hostname&&!["localhost","127.0.0.1"].includes(location.hostname))s.add(location.hostname);return [...s]}
function pq(){return parents().map(x=>"parent="+encodeURIComponent(x)).join("&")}
async function fetchJson(url,ms=6000){const c=new AbortController(),t=setTimeout(()=>c.abort(),ms);try{const r=await fetch(url,{cache:"no-store",signal:c.signal});if(!r.ok)throw Error(`${url}: ${r.status}`);return await r.json()}finally{clearTimeout(t)}}
function obj(r){return r?.data||r?.twitch||r?.broadcast||r||{}}
function bool(d){return Boolean(d.live??d.isLive??d.online??String(d.type||"").toLowerCase()==="live")}
function pick(...x){return x.find(v=>v!==undefined&&v!==null&&v!=="")}
function mountChat(){if(!$("twitchChat").src)$("twitchChat").src=`https://www.twitch.tv/embed/${CHANNEL}/chat?${pq()}&darkpopout`}
function mountPlayer(){
 const frame=$("twitchPlayer");
 if(!frame.src) frame.src=`https://player.twitch.tv/?channel=${CHANNEL}&${pq()}&autoplay=false&muted=false`;
 frame.hidden=false;
 frame.addEventListener("load",()=>setTimeout(()=>$("playerLoading").classList.add("hidden"),350),{once:true});
}
function unmountPlayer(){
 const frame=$("twitchPlayer");
 frame.hidden=true;
 if(frame.src){frame.src="";frame.removeAttribute("src")}
 $("playerLoading").classList.add("hidden");
}
function cleanSegments(raw){
 const source=Array.isArray(raw?.segments)?raw.segments:Array.isArray(raw?.data?.segments)?raw.data.segments:Array.isArray(raw?.data)?raw.data:[];
 const now=Date.now();
 return source.map((s,i)=>({
   id:String(s.id||i),title:String(s.title||s.category?.name||"DJ FOLSOE LIVE"),
   startTime:String(s.startTime||s.start_time||""),endTime:String(s.endTime||s.end_time||""),
   canceled:Boolean(s.canceledUntil||s.canceled_until)
 })).filter(s=>!s.canceled&&Date.parse(s.startTime)>now-60000).sort((a,b)=>Date.parse(a.startTime)-Date.parse(b.startTime));
}
async function refresh(){
 let tw={},bc={},sch=null;
 const results=await Promise.allSettled([
  fetchJson(`${API}/api/twitch`).then(x=>tw=obj(x)),
  fetchJson(`${API}/api/broadcast`).then(x=>bc=obj(x)),
  fetchJson(`${SCHEDULE_URL}?v=${Date.now()}`).then(x=>sch=x)
 ]);
 state.live=bool(tw)||bool(bc);
 state.viewers=Number(pick(tw.viewerCount,tw.viewers,tw.viewer_count,bc.viewers,0));
 state.followers=Number(pick(tw.followers,tw.followerCount,bc.followers,state.followers));
 state.title=String(pick(tw.title,tw.streamTitle,bc.streamTitle,bc.showTitle,""));
 state.theme=String(pick(bc.theme?.title,bc.activeTheme,bc.theme,state.theme)).replace(/[_-]/g," ").toUpperCase();
 if(sch){
 state.schedule=cleanSegments(sch);
 const directNext=sch.next&&sch.next.startTime?sch.next:null;
 state.next=directNext||state.schedule[0]||null;
 state.scheduleUpdated=sch.generatedAt||"";
 state.scheduleError=sch.error||"";
}
 if(state.live)mountPlayer();else unmountPlayer();
 render();
}
function fmtDate(iso){
 const d=new Date(iso);if(isNaN(d))return"TIME TO BE ANNOUNCED";
 return d.toLocaleString("en-GB",{weekday:"long",day:"2-digit",month:"long",hour:"2-digit",minute:"2-digit",timeZone:"Europe/Copenhagen",timeZoneName:"short"}).toUpperCase();
}
function renderSchedule(){
 const n=state.next;
 $("nextShow") && ($("nextShow").textContent=n?.title||"NEXT SHOW TO BE ANNOUNCED");
 $("nextTime") && ($("nextTime").textContent=n?fmtDate(n.startTime):"Update the schedule on Twitch");
 $("offlineNextTitle").textContent=n?.title||"NEXT SHOW TO BE ANNOUNCED";
 $("offlineNextDate").textContent=n?fmtDate(n.startTime):(state.scheduleError||"The official Twitch schedule currently has no upcoming show.");
}
function escapeHtml(v){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function render(){
 $("followers").textContent=state.followers.toLocaleString("en-US");$("viewers").textContent=state.viewers.toLocaleString("en-US");$("theme").textContent=state.theme;
 $("channelStats") && ($("channelStats").textContent=`${state.followers.toLocaleString("en-US")} FOLLOWERS · ${state.viewers.toLocaleString("en-US")} VIEWERS`);
 $("heroFollowers").textContent=state.followers.toLocaleString("en-US");
 $("heroViewers").textContent=state.viewers.toLocaleString("en-US");
 $("heroChannelState").textContent=state.live?"DJ FOLSOE · LIVE NOW":"DJ FOLSOE · OFF AIR";
 $("heroChannelText").textContent=state.live?(state.title||"Watch the live show below."):(state.next?`Next: ${state.next.title}`:"The next show is displayed in the live channel below.");
 const b=$("watchButton"),p=$("livePill");b.classList.toggle("isLive",state.live);b.querySelector("span").textContent=state.live?"SE MED NU · WATCH LIVE":"SEE THE NEXT SHOW";
 p.classList.toggle("live",state.live);p.querySelector("b").textContent=state.live?"LIVE NOW":"OFFLINE";
 $("liveHeading").textContent=state.live?(state.title||"DJ FOLSOE IS LIVE NOW"):"DJ FOLSOE LIVE CHANNEL";
 $("streamTitle").textContent=state.live?(state.title||"DJ FOLSOE LIVE"):(state.next?`NEXT: ${state.next.title}`:"DJ FOLSOE · OFF AIR");
 $("streamMeta").textContent=state.live&&state.viewers?`${state.viewers.toLocaleString("en-US")} watching now · Twitch chat is open`:"Next show is synchronized from the official Twitch schedule";
 $("customOffline").hidden=state.live;$("offlineMessage").hidden=state.live;
 $("deskTitle").textContent=state.live?"DJ FOLSOE IS LIVE NOW":(state.next?`UP NEXT: ${state.next.title}`:"WELCOME TO DJ FOLSOE");
 $("deskText").textContent=state.live?"Watch the stream and join the Twitch chat directly above.":(state.next?fmtDate(state.next.startTime):"Follow the channel and become part of the community.");
 renderSchedule();tick();
}
function partsUntil(iso){let d=Math.max(0,Date.parse(iso)-Date.now());return{days:Math.floor(d/864e5),hours:Math.floor(d%864e5/36e5),minutes:Math.floor(d%36e5/6e4),seconds:Math.floor(d%6e4/1e3)}}
function tick(){
 const n=state.next;
 const setSafe=(id,value)=>{const el=$(id);if(el)el.textContent=value};

 if(!n){
  setSafe("countH","00");
  setSafe("countM","00");
  setSafe("countS","00");
  setSafe("offDays","00");
  setSafe("offHours","00");
  setSafe("offMinutes","00");
  setSafe("offSeconds","00");
  return;
 }

 const target=Date.parse(n.startTime);
 if(!Number.isFinite(target)){
  setSafe("offDays","00");
  setSafe("offHours","00");
  setSafe("offMinutes","00");
  setSafe("offSeconds","00");
  return;
 }

 let remaining=Math.max(0,target-Date.now());
 const days=Math.floor(remaining/864e5);
 const hours=Math.floor((remaining%864e5)/36e5);
 const minutes=Math.floor((remaining%36e5)/6e4);
 const seconds=Math.floor((remaining%6e4)/1e3);

 // Legacy compact counters are updated only if they still exist.
 setSafe("countH",String(days*24+hours).padStart(2,"0"));
 setSafe("countM",String(minutes).padStart(2,"0"));
 setSafe("countS",String(seconds).padStart(2,"0"));

 // Main offline countdown.
 setSafe("offDays",String(days).padStart(2,"0"));
 setSafe("offHours",String(hours).padStart(2,"0"));
 setSafe("offMinutes",String(minutes).padStart(2,"0"));
 setSafe("offSeconds",String(seconds).padStart(2,"0"));
}
mountChat();refresh();setInterval(tick,1000);setInterval(refresh,60000);
window.DJF_V20002_2=Object.freeze({version:"V20002.2",refresh,status:()=>({...state,parents:parents()})});
})();