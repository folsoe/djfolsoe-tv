
/* DJ FOLSOE V19300 · AI MUSIC DIRECTOR */
(function(){
"use strict";

const state={presets:null,plan:[],lastPrompt:"",errors:[]};
const $=id=>document.getElementById(id);
const value=id=>String($(id)?.value||"").trim();
const clamp=(n,min,max)=>Math.max(min,Math.min(max,Number(n)||0));

async function loadPresets(){
  if(state.presets)return state.presets;
  try{
    const response=await fetch("assets/data/music-director-presets.json",{cache:"no-store"});
    if(!response.ok)throw new Error(`Preset load failed: ${response.status}`);
    state.presets=await response.json();
    return state.presets;
  }catch(error){
    state.errors.push(String(error?.message||error));
    state.presets={showPresets:{},rules:{}};
    return state.presets;
  }
}

function trackCount(durationMinutes,averageMinutes){
  return Math.max(10,Math.round(durationMinutes/averageMinutes));
}

function parseLines(text){
  return String(text||"").split(/\n+/).map(v=>v.trim()).filter(Boolean);
}

function createSkeleton(preset,settings){
  const count=trackCount(settings.durationMinutes,settings.averageTrackMinutes);
  const curve=preset.energyCurve||[45,55,65,75,85,90,78,60];
  const genres=settings.genres.length?settings.genres:(preset.genres||["Radio Hits"]);
  const decades=Object.keys(preset.decades||{"2020s":100});
  const requestEvery=settings.requests?Math.max(8,Math.round(count/8)):0;
  const result=[];

  for(let i=0;i<count;i++){
    const progress=count<=1?0:i/(count-1);
    const curvePos=progress*(curve.length-1);
    const low=Math.floor(curvePos),high=Math.min(curve.length-1,Math.ceil(curvePos));
    const mix=curvePos-low;
    const energy=Math.round(curve[low]+(curve[high]-curve[low])*mix);
    const genre=genres[i%genres.length];
    const decade=decades[Math.floor(i/Math.max(1,Math.ceil(count/decades.length)))%decades.length];
    const isRequest=requestEvery>0 && (i+1)%requestEvery===0;

    result.push({
      position:i+1,
      artist:isRequest?"VIEWER REQUEST":"Artist suggestion",
      title:isRequest?"Open request slot":`${genre} selection`,
      genre,
      decade,
      energy,
      durationMinutes:settings.averageTrackMinutes,
      source:isRequest?"request":"director"
    });
  }
  return result;
}

function buildPrompt(preset,settings,plan){
  const decades=Object.entries(preset.decades||{}).map(([k,v])=>`${k}: ${v}%`).join(", ");
  return [
    `Create a ${settings.durationMinutes}-minute ${preset.name||settings.showName} DJ playlist.`,
    `Target approximately ${plan.length} tracks with an average length of ${settings.averageTrackMinutes} minutes.`,
    `Genres: ${settings.genres.join(", ")||preset.genres?.join(", ")||"Radio Hits"}.`,
    `Decade mix: ${decades||"balanced from 1980 to today"}.`,
    `Energy must follow this curve: ${(preset.energyCurve||[]).join(" → ")}.`,
    `Avoid repeating the same artist within ${settings.artistSpacing} tracks.`,
    `Maximum ${settings.maxSameDecade} tracks from the same decade in a row.`,
    settings.requests?"Include clearly marked viewer request slots.":"Do not include request slots.",
    settings.notes?`Additional instructions: ${settings.notes}`:"",
    `Return columns: position, artist, title, year, genre, BPM, key, energy, source.`
  ].filter(Boolean).join("\n");
}

function settings(){
  return {
    presetId:value("musicDirectorShow"),
    showName:$("musicDirectorShow")?.selectedOptions?.[0]?.textContent||"DJ FOLSOE Show",
    durationMinutes:clamp(value("musicDirectorDuration"),30,600)||240,
    averageTrackMinutes:clamp(value("musicDirectorAverage"),2,10)||3.6,
    genres:parseLines(value("musicDirectorGenres").replace(/,/g,"\n")),
    artistSpacing:clamp(value("musicDirectorArtistSpacing"),2,40)||12,
    maxSameDecade:clamp(value("musicDirectorDecadeRun"),1,12)||4,
    requests:Boolean($("musicDirectorRequests")?.checked),
    notes:value("musicDirectorNotes")
  };
}

function render(){
  const wrap=$("musicDirectorTimeline");
  if(!wrap)return;
  wrap.innerHTML=state.plan.map(track=>`
    <article class="aiMusicDirector__track">
      <strong>#${track.position}</strong>
      <div>
        <strong>${track.artist} — ${track.title}</strong>
        <span>${track.genre} · ${track.decade} · ${track.source}</span>
      </div>
      <div class="aiMusicDirector__energy" title="Energy ${track.energy}">
        <span style="width:${clamp(track.energy,0,100)}%"></span>
      </div>
    </article>
  `).join("");

  const total=state.plan.reduce((sum,t)=>sum+Number(t.durationMinutes||0),0);
  if($("musicDirectorTrackCount"))$("musicDirectorTrackCount").textContent=String(state.plan.length);
  if($("musicDirectorTotalTime"))$("musicDirectorTotalTime").textContent=`${Math.round(total)} min`;
  if($("musicDirectorPeak"))$("musicDirectorPeak").textContent=String(Math.max(0,...state.plan.map(t=>t.energy)));
  if($("musicDirectorRequestsCount"))$("musicDirectorRequestsCount").textContent=String(state.plan.filter(t=>t.source==="request").length);
  if($("musicDirectorPrompt"))$("musicDirectorPrompt").textContent=state.lastPrompt||"Generate a plan to create the Music Director prompt.";
}

async function generate(){
  const presets=await loadPresets();
  const s=settings();
  const preset=presets.showPresets?.[s.presetId]||{
    name:s.showName,durationMinutes:s.durationMinutes,
    genres:s.genres.length?s.genres:["Radio Hits","Dance Pop","Nu-Disco"],
    energyCurve:[40,50,60,72,84,90,78,60],
    decades:{"1980s":15,"1990s":20,"2000s":20,"2010s":20,"2020s":25}
  };
  if(!$("musicDirectorDuration")?.dataset.edited){
    $("musicDirectorDuration").value=preset.durationMinutes||240;
    s.durationMinutes=Number($("musicDirectorDuration").value);
  }
  state.plan=createSkeleton(preset,s);
  state.lastPrompt=buildPrompt(preset,s,state.plan);
  render();
  return state.plan;
}

function exportCsv(){
  if(!state.plan.length)return;
  const headers=["Position","Artist","Title","Genre","Decade","Energy","DurationMinutes","Source"];
  const rows=state.plan.map(t=>[
    t.position,t.artist,t.title,t.genre,t.decade,t.energy,t.durationMinutes,t.source
  ]);
  const csv=[headers,...rows].map(row=>row.map(v=>`"${String(v??"").replace(/"/g,'""')}"`).join(",")).join("\r\n");
  const blob=new Blob([csv],{type:"text/csv;charset=utf-8"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url;a.download=`DJF_${value("musicDirectorShow")||"playlist"}_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();URL.revokeObjectURL(url);
}

async function copyPrompt(){
  if(!state.lastPrompt)await generate();
  await navigator.clipboard.writeText(state.lastPrompt);
  if($("musicDirectorPrompt"))$("musicDirectorPrompt").textContent=`COPIED\n\n${state.lastPrompt}`;
}

function sendToAdmin(){
  const textarea=document.getElementById("playlistNotes")||
    document.getElementById("musicNotes")||
    document.getElementById("showDescription");
  const summary=`AI Music Director: ${state.plan.length} tracks\n\n${state.lastPrompt}`;
  if(textarea){
    textarea.value=summary;
    textarea.dispatchEvent(new Event("input",{bubbles:true}));
  }
  window.dispatchEvent(new CustomEvent("djf:music-director-plan",{detail:{
    settings:settings(),plan:state.plan,prompt:state.lastPrompt
  }}));
}

document.addEventListener("DOMContentLoaded",async()=>{
  await loadPresets();
  $("musicDirectorGenerateBtn")?.addEventListener("click",generate);
  $("musicDirectorExportBtn")?.addEventListener("click",exportCsv);
  $("musicDirectorCopyBtn")?.addEventListener("click",copyPrompt);
  $("musicDirectorAdminBtn")?.addEventListener("click",sendToAdmin);
  $("musicDirectorShow")?.addEventListener("change",()=>{
    if($("musicDirectorDuration"))delete $("musicDirectorDuration").dataset.edited;
    generate();
  });
  $("musicDirectorDuration")?.addEventListener("input",e=>e.target.dataset.edited="true");
  generate();
});

window.DJF_AI_MUSIC_DIRECTOR=Object.freeze({
  version:"V19300",generate,exportCsv,copyPrompt,sendToAdmin,
  getPlan:()=>state.plan.map(t=>({...t})),
  getPrompt:()=>state.lastPrompt,
  getStatus:()=>({version:"V19300",tracks:state.plan.length,errors:state.errors.slice()})
});
})();
