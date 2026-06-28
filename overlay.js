const STORAGE_KEY="DJF_V818_SITE_DATA";
async function defaultData(){const r=await fetch("assets/data/site-data.json?v=8181",{cache:"no-store"});return await r.json()}
async function loadData(){const l=localStorage.getItem(STORAGE_KEY);if(l){try{return JSON.parse(l)}catch(e){}}return await defaultData()}
function saveData(d){localStorage.setItem(STORAGE_KEY,JSON.stringify(d))}
const $=id=>document.getElementById(id);
function val(id,v){const e=$(id);if(e)e.value=v??""}
function get(id){const e=$(id);return e?e.value:""}
function status(t){const e=$("status");if(e)e.textContent=t}
async function loadAdmin(){
 const d=await loadData(); window.currentData=d;
 val("heroTitle",d.hero?.headline); val("heroSubtitle",d.hero?.subtitle); val("aboutBody",d.about?.body);
 const n=d.nextShows?.[0]||{};
 val("nextTitle",n.title); val("nextDate",n.date); val("nextStart",n.start); val("nextEnd",n.end); val("nextDesc",n.description);
 const o=d.overlay||{};
 val("topText",o.topText); val("bottomText",o.bottomText); val("box1Main",o.box1Main); val("box2Main",o.box2Main); val("box3Main",o.box3Main); val("box4Main",o.box4Main);
 $("editor").value=JSON.stringify(d,null,2); status("✅ Admin indlæst");
}
function saveAdmin(){
 try{
  const d=JSON.parse($("editor").value||"{}");
  d.hero=d.hero||{}; d.about=d.about||{}; d.overlay=d.overlay||{}; d.nextShows=Array.isArray(d.nextShows)?d.nextShows:[{}]; d.nextShows[0]=d.nextShows[0]||{};
  d.hero.headline=get("heroTitle")||d.hero.headline; d.hero.subtitle=get("heroSubtitle")||d.hero.subtitle; d.about.body=get("aboutBody")||d.about.body;
  d.nextShows[0].title=get("nextTitle")||d.nextShows[0].title; d.nextShows[0].date=get("nextDate")||d.nextShows[0].date; d.nextShows[0].start=get("nextStart")||d.nextShows[0].start; d.nextShows[0].end=get("nextEnd")||d.nextShows[0].end; d.nextShows[0].description=get("nextDesc")||d.nextShows[0].description; d.nextShows[0].active=true;
  d.overlay.topText=get("topText")||d.overlay.topText; d.overlay.bottomText=get("bottomText")||d.overlay.bottomText; d.overlay.box1Main=get("box1Main")||d.overlay.box1Main; d.overlay.box2Main=get("box2Main")||d.overlay.box2Main; d.overlay.box3Main=get("box3Main")||d.overlay.box3Main; d.overlay.box4Main=get("box4Main")||d.overlay.box4Main;
  saveData(d); $("editor").value=JSON.stringify(d,null,2); status("✅ Gemt i browseren");
 }catch(e){status("❌ JSON fejl: "+e.message)}
}
async function resetAdmin(){localStorage.removeItem(STORAGE_KEY);await loadAdmin();status("✅ Nulstillet")}
function exportData(){const blob=new Blob([$("editor").value||"{}"],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="site-data-export.json";a.click();URL.revokeObjectURL(a.href)}
document.addEventListener("DOMContentLoaded",loadAdmin);
