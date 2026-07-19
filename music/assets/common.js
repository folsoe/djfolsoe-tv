
export const DB_KEY="djfolsoe_music_db_v1702";
export const HISTORY_KEY="djfolsoe_music_history_v1702";
export const PLANS_KEY="djfolsoe_music_plans_v1702";

export function load(key,fallback=[]){try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch{return fallback}}
export function save(key,value){localStorage.setItem(key,JSON.stringify(value))}
export function norm(v=""){return String(v).normalize("NFKD").replace(/\p{Diacritic}/gu,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim()}
export function trackKey(t){return t.spotifyId?`spotify:${t.spotifyId}`:`${norm(t.artist)}|${norm(t.title)}|${norm(t.version||"")}`}
export function parseCSV(text){
 const rows=[];let row=[],cell="",quote=false;
 for(let i=0;i<text.length;i++){const c=text[i],n=text[i+1];
  if(c==='"'&&quote&&n==='"'){cell+='"';i++;continue}
  if(c==='"'){quote=!quote;continue}
  if(!quote&&(c===','||c===';')){row.push(cell);cell="";continue}
  if(!quote&&(c==='\n'||c==='\r')){if(c==='\r'&&n==='\n')i++;row.push(cell);if(row.some(x=>x.trim()))rows.push(row);row=[];cell="";continue}
  cell+=c;
 } row.push(cell);if(row.some(x=>x.trim()))rows.push(row);return rows;
}
export function mapHeaders(headers){
 const aliases={
 artist:["artist","artists","artist name","interpret","kunstner","name"],
 title:["title","track","track name","song","sang","titel"],
 album:["album","album name"],spotifyId:["spotify id","track id","spotify_track_id"],
 spotifyUrl:["spotify url","url","track url","spotify link"],isrc:["isrc"],
 year:["year","release year","released","release date"],duration:["duration","duration ms","length"],
 playlist:["playlist","playlist name","list"],genre:["genre"],subgenre:["subgenre","style"],
 bpm:["bpm","tempo"],key:["key","toneart"],camelot:["camelot"],energy:["energy","energi"],
 country:["country","land"],label:["label"],version:["version","mix"],source:["source","kilde"]
 };
 const out={};headers.forEach((h,i)=>{const n=norm(h);for(const [field,list] of Object.entries(aliases)){if(list.some(a=>norm(a)===n)){out[field]=i;break}}});return out;
}
export function parseImport(text,sourceName="CSV"){
 const rows=parseCSV(text);if(rows.length<2)return [];
 const map=mapHeaders(rows[0]);const get=(r,k)=>map[k]===undefined?"":(r[map[k]]||"").trim();
 return rows.slice(1).map((r,i)=>({
  id:crypto.randomUUID(),artist:get(r,"artist"),title:get(r,"title"),album:get(r,"album"),
  version:get(r,"version"),year:get(r,"year"),country:get(r,"country"),label:get(r,"label"),
  spotifyId:get(r,"spotifyId"),spotifyUrl:get(r,"spotifyUrl"),isrc:get(r,"isrc"),
  duration:get(r,"duration"),genre:get(r,"genre"),subgenre:get(r,"subgenre"),
  bpm:Number(get(r,"bpm"))||null,key:get(r,"key"),camelot:get(r,"camelot"),
  energy:Number(get(r,"energy"))||5,playlists:get(r,"playlist")?[get(r,"playlist")]:[],
  tags:[],rating:0,crowdRating:0,lastPlayed:null,playCount:0,doNotRepeatUntil:null,
  source:get(r,"source")||sourceName,verified:false,createdAt:new Date().toISOString()
 })).filter(t=>t.artist&&t.title);
}
export function mergeTracks(existing,incoming){
 const map=new Map(existing.map(t=>[trackKey(t),t]));let added=0,merged=0;
 for(const t of incoming){const k=trackKey(t);if(map.has(k)){const old=map.get(k);map.set(k,{...t,...old,
  spotifyId:old.spotifyId||t.spotifyId,spotifyUrl:old.spotifyUrl||t.spotifyUrl,isrc:old.isrc||t.isrc,
  playlists:[...new Set([...(old.playlists||[]),...(t.playlists||[])])],source:[...new Set([old.source,t.source].filter(Boolean))].join(" | ")
 });merged++;}else{map.set(k,t);added++;}}
 return {tracks:[...map.values()],added,merged};
}
export function csvEscape(v){const s=String(v??"");return /[",;\n]/.test(s)?`"${s.replace(/"/g,'""')}"`:s}
export function download(name,text,type="text/csv;charset=utf-8"){
 const a=document.createElement("a");a.href=URL.createObjectURL(new Blob(["\ufeff"+text],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
export function exportMaster(tracks){
 const h=["Artist","Title","Version","Album","Year","Country","Label","Genre","Subgenre","BPM","Key","Camelot","Energy","Rating","Crowd Rating","Spotify ID","Spotify URL","ISRC","Last Played","Play Count","Tags","Playlists","Source","Verified"];
 const lines=[h.join(",")];for(const t of tracks)lines.push([t.artist,t.title,t.version,t.album,t.year,t.country,t.label,t.genre,t.subgenre,t.bpm,t.key,t.camelot,t.energy,t.rating,t.crowdRating,t.spotifyId,t.spotifyUrl,t.isrc,t.lastPlayed,t.playCount,(t.tags||[]).join("|"),(t.playlists||[]).join("|"),t.source,t.verified].map(csvEscape).join(","));
 return lines.join("\n");
}
export function exportSoundiiz(tracks){
 const h=["title","artist","album","isrc","platform","id"];const lines=[h.join(",")];
 for(const t of tracks)lines.push([t.title,t.artist,t.album,t.isrc,"spotify",t.spotifyId].map(csvEscape).join(","));return lines.join("\n");
}
export function exportTuneMyMusic(tracks){
 const h=["Track name","Artist name","Album","ISRC","Spotify URL"];const lines=[h.join(",")];
 for(const t of tracks)lines.push([t.title,t.artist,t.album,t.isrc,t.spotifyUrl].map(csvEscape).join(","));return lines.join("\n");
}
