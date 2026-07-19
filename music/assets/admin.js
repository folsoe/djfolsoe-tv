
import {DB_KEY,HISTORY_KEY,PLANS_KEY,load,save,parseImport,mergeTracks,download,exportMaster,exportSoundiiz,exportTuneMyMusic,norm} from "./common.js";
let tracks=load(DB_KEY,[]),history=load(HISTORY_KEY,[]),plans=load(PLANS_KEY,[]);
let showProfiles=[];
const $=id=>document.getElementById(id);const log=m=>{$("log").textContent+=`[${new Date().toLocaleTimeString("da-DK")}] ${m}\n`; $("log").scrollTop=$("log").scrollHeight};

async function init(){
 showProfiles=await fetch("data/show-profiles.json").then(r=>r.json());
 $("show").innerHTML=showProfiles.map(s=>`<option value="${s.id}">${s.name}</option>`).join("");
 render();
}
function render(){
 $("trackCount").textContent=tracks.length.toLocaleString("da-DK");
 $("verifiedCount").textContent=tracks.filter(t=>t.verified).length.toLocaleString("da-DK");
 $("historyCount").textContent=history.length.toLocaleString("da-DK");
 $("planCount").textContent=plans.length.toLocaleString("da-DK");
 const q=norm($("q").value),genre=$("genre").value,status=$("status").value;
 const filtered=tracks.filter(t=>(!q||norm(`${t.artist} ${t.title} ${t.album} ${(t.tags||[]).join(" ")}`).includes(q))&&(!genre||t.genre===genre)&&(!status||(status==="verified"?t.verified:!t.verified))).slice(0,500);
 $("genre").innerHTML='<option value="">Alle genrer</option>'+[...new Set(tracks.map(t=>t.genre).filter(Boolean))].sort().map(g=>`<option>${g}</option>`).join("");
 $("rows").innerHTML=filtered.map(t=>`<tr><td><input type="checkbox" data-id="${t.id}"></td><td>${t.artist}</td><td>${t.title}</td><td>${t.version||""}</td><td>${t.year||""}</td><td>${t.genre||""}</td><td>${t.bpm||""}</td><td>${t.camelot||t.key||""}</td><td>${t.energy||""}</td><td class="${t.verified?"status-ready":"status-warn"}">${t.verified?"Verificeret":"Kontrol"}</td></tr>`).join("");
}
$("file").addEventListener("change",async e=>{
 for(const file of e.target.files){const text=await file.text();const incoming=parseImport(text,file.name);const result=mergeTracks(tracks,incoming);tracks=result.tracks;save(DB_KEY,tracks);log(`${file.name}: ${result.added} tilføjet, ${result.merged} flettet.`)}
 render();
});
["q","genre","status"].forEach(id=>$(id).addEventListener("input",render));
$("exportMaster").onclick=()=>download("dj-folsoe-master-library.csv",exportMaster(tracks));
$("exportSoundiiz").onclick=()=>download("dj-folsoe-soundiiz-import.csv",exportSoundiiz(tracks));
$("exportTMM").onclick=()=>download("dj-folsoe-tunemymusic-import.csv",exportTuneMyMusic(tracks));
$("exportPublic").onclick=()=>download("music-database.json",JSON.stringify(tracks.map(({source,...t})=>t),null,2),"application/json");
$("verifySelected").onclick=()=>{const ids=[...document.querySelectorAll('tbody input:checked')].map(x=>x.dataset.id);tracks=tracks.map(t=>ids.includes(t.id)?{...t,verified:true}:t);save(DB_KEY,tracks);render();log(`${ids.length} numre markeret verificeret.`)};
$("deleteSelected").onclick=()=>{const ids=new Set([...document.querySelectorAll('tbody input:checked')].map(x=>x.dataset.id));tracks=tracks.filter(t=>!ids.has(t.id));save(DB_KEY,tracks);render();log(`${ids.size} numre slettet.`)};

function eligible(t,p,cutoff){
 const genres=p.genres.includes("Any")||p.genres.some(g=>norm(`${t.genre} ${t.subgenre} ${(t.tags||[]).join(" ")}`).includes(norm(g)));
 const energy=Number(t.energy||5)>=p.minEnergy&&Number(t.energy||5)<=p.maxEnergy;
 const bpm=!t.bpm||(t.bpm>=p.bpmMin&&t.bpm<=p.bpmMax);
 const recent=t.lastPlayed&&new Date(t.lastPlayed)>=cutoff;
 return genres&&energy&&bpm&&!recent;
}
function score(t,p){
 let s=(Number(t.rating||0)*2)+(Number(t.crowdRating||0)*2)+(t.verified?4:0)+(t.spotifyId?2:0);
 if((t.tags||[]).some(x=>/forgotten|deep cut/i.test(x)))s+=2;
 if((t.tags||[]).some(x=>/anthem|hit|singalong/i.test(x)))s+=1;
 s+=Math.random()*4;return s;
}
function generatePlan(){
 const p=showProfiles.find(x=>x.id===$("show").value),week=$("week").value||new Date().toISOString().slice(0,10);
 const cutoff=new Date();cutoff.setDate(cutoff.getDate()-p.repeatDays);
 let pool=tracks.filter(t=>eligible(t,p,cutoff)).sort((a,b)=>score(b,p)-score(a,p));
 const selected=[],artists=new Map();
 for(const t of pool){const a=norm(t.artist);if((artists.get(a)||0)>=2)continue;selected.push(t);artists.set(a,(artists.get(a)||0)+1);if(selected.length>=p.targetTracks)break}
 selected.sort((a,b)=>(Number(a.energy||5)-Number(b.energy||5))||(Number(a.bpm||0)-Number(b.bpm||0)));
 const plan={id:crypto.randomUUID(),showId:p.id,showName:p.name,week,status:"Draft",createdAt:new Date().toISOString(),trackIds:selected.map(t=>t.id)};
 plans.unshift(plan);save(PLANS_KEY,plans);log(`${p.name}: ${selected.length} numre genereret.`);renderPlan(plan);
}
function renderPlan(plan){
 const list=plan.trackIds.map(id=>tracks.find(t=>t.id===id)).filter(Boolean);
 $("planTitle").textContent=`${plan.showName} — ${plan.week} — ${list.length} numre`;
 $("planRows").innerHTML=list.map((t,i)=>`<tr><td>${i+1}</td><td>${t.artist}</td><td>${t.title}</td><td>${t.bpm||""}</td><td>${t.camelot||t.key||""}</td><td>${t.energy||""}</td><td>${(t.tags||[]).join(", ")}</td></tr>`).join("");
 $("planDialog").showModal();$("exportPlanSoundiiz").onclick=()=>download(`${plan.showId}-${plan.week}-soundiiz.csv`,exportSoundiiz(list));
 $("exportPlanTMM").onclick=()=>download(`${plan.showId}-${plan.week}-tunemymusic.csv`,exportTuneMyMusic(list));
 $("exportPlanMaster").onclick=()=>download(`${plan.showId}-${plan.week}.csv`,exportMaster(list));
 $("approvePlan").onclick=()=>{plan.status="Approved";save(PLANS_KEY,plans);log("Plan godkendt.");};
}
$("generate").onclick=generatePlan;
$("closePlan").onclick=()=>$("planDialog").close();
$("reset").onclick=()=>{if(confirm("Slet hele den lokale musikdatabase?")){tracks=[];history=[];plans=[];save(DB_KEY,[]);save(HISTORY_KEY,[]);save(PLANS_KEY,[]);render()}};
init();
