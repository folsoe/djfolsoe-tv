
import {DB_KEY,load,norm} from "./common.js";
let tracks=load(DB_KEY,[]);const $=id=>document.getElementById(id);
async function init(){if(!tracks.length){try{tracks=await fetch("data/music-database.json").then(r=>r.json())}catch{tracks=[]}}render()}
function render(){
 const q=norm($("q").value),genre=$("genre").value,year=$("year").value;
 const out=tracks.filter(t=>(!q||norm(`${t.artist} ${t.title} ${t.album} ${(t.tags||[]).join(" ")}`).includes(q))&&(!genre||t.genre===genre)&&(!year||String(t.year)===year)).slice(0,1000);
 $("count").textContent=`${out.length.toLocaleString("da-DK")} vist / ${tracks.length.toLocaleString("da-DK")} i databasen`;
 $("genre").innerHTML='<option value="">Alle genrer</option>'+[...new Set(tracks.map(t=>t.genre).filter(Boolean))].sort().map(g=>`<option>${g}</option>`).join("");
 $("year").innerHTML='<option value="">Alle år</option>'+[...new Set(tracks.map(t=>t.year).filter(Boolean))].sort((a,b)=>b-a).map(y=>`<option>${y}</option>`).join("");
 $("rows").innerHTML=out.map(t=>`<tr><td>${t.artist}</td><td>${t.title}</td><td>${t.version||""}</td><td>${t.year||""}</td><td>${t.country||""}</td><td>${t.genre||""}</td><td>${t.bpm||""}</td><td>${t.camelot||t.key||""}</td><td>${t.energy||""}</td><td>${t.playCount||0}</td><td>${t.spotifyUrl?`<a href="${t.spotifyUrl}" target="_blank">Spotify</a>`:""}</td></tr>`).join("");
}
["q","genre","year"].forEach(id=>$(id).addEventListener("input",render));init();
