(() => {
  const ADMIN_STORAGE_KEY = "DJF_V818_SITE_DATA";
  const DATA_URL = "assets/data/site-data.json?v=8182";
  let DATA = null;

  const $ = (id) => document.getElementById(id);
  const setStatus = (msg) => { const el = $("status"); if (el) el.textContent = msg; };
  const esc = (v) => String(v ?? "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll('"',"&quot;");

  async function fetchDefaultData(){
    const r = await fetch(DATA_URL, {cache:"no-store"});
    if(!r.ok) throw new Error("Kan ikke hente site-data.json");
    return await r.json();
  }

  async function loadData(){
    const local = localStorage.getItem(ADMIN_STORAGE_KEY);
    if(local){
      try { return JSON.parse(local); } catch(e) { console.warn("localStorage JSON fejl", e); }
    }
    return await fetchDefaultData();
  }

  function saveData(data){
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(data));
    DATA = data;
  }

  function input(name, value, type="text"){
    return `<label>${name}<input data-path="${name}" type="${type}" value="${esc(value)}"></label>`;
  }

  function textarea(name, value){
    return `<label class="wide">${name}<textarea data-path="${name}">${esc(value)}</textarea></label>`;
  }

  function renderHero(){
    $("heroEditor").innerHTML = [
      input("hero.headline", DATA.hero?.headline),
      textarea("hero.subtitle", DATA.hero?.subtitle),
      input("hero.primaryButton", DATA.hero?.primaryButton),
      input("hero.secondaryButton", DATA.hero?.secondaryButton)
    ].join("");
  }

  function renderAbout(){
    $("aboutEditor").innerHTML = [
      textarea("about.body", DATA.about?.body),
      ...(DATA.about?.cards || []).map((x,i)=>`
        <div class="miniCard">
          ${input(`about.cards.${i}.icon`, x.icon)}
          ${input(`about.cards.${i}.title`, x.title)}
          ${textarea(`about.cards.${i}.text`, x.text)}
        </div>`)
    ].join("");
  }

  function renderNextShows(){
    $("nextShowsEditor").innerHTML = (DATA.nextShows || []).map((x,i)=>`
      <div class="editCard">
        <h3>Show ${i+1}</h3>
        ${input(`nextShows.${i}.title`, x.title)}
        ${input(`nextShows.${i}.show`, x.show)}
        ${input(`nextShows.${i}.theme`, x.theme)}
        ${input(`nextShows.${i}.date`, x.date, "date")}
        ${input(`nextShows.${i}.start`, x.start, "time")}
        ${input(`nextShows.${i}.end`, x.end, "time")}
        ${textarea(`nextShows.${i}.description`, x.description)}
        ${input(`nextShows.${i}.active`, x.active)}
      </div>`).join("");
  }

  function renderMods(){
    $("modsEditor").innerHTML = (DATA.mods || []).map((x,i)=>`
      <div class="editCard">
        <h3>Mod ${i+1}</h3>
        ${input(`mods.${i}.name`, x.name)}
        ${input(`mods.${i}.role`, x.role)}
        ${textarea(`mods.${i}.text`, x.text)}
        ${input(`mods.${i}.avatar`, x.avatar)}
        ${input(`mods.${i}.active`, x.active)}
      </div>`).join("");
  }

  function renderShows(){
    $("showsEditor").innerHTML = (DATA.shows || []).map((x,i)=>`
      <div class="editCard">
        <h3>Showkort ${i+1}</h3>
        ${input(`shows.${i}.title`, x.title)}
        ${input(`shows.${i}.time`, x.time)}
        ${input(`shows.${i}.tag`, x.tag)}
        ${textarea(`shows.${i}.text`, x.text)}
      </div>`).join("");
  }

  function renderTop20(){
    $("top20Editor").innerHTML = (DATA.top20 || []).map((x,i)=>`
      <div class="editCard">
        <h3>#${x.rank || i+1}</h3>
        ${input(`top20.${i}.rank`, x.rank, "number")}
        ${input(`top20.${i}.artist`, x.artist)}
        ${input(`top20.${i}.title`, x.title)}
        ${input(`top20.${i}.genre`, x.genre)}
      </div>`).join("");
  }

  function renderSimpleArray(key, target, fields){
    $(target).innerHTML = (DATA[key] || []).map((x,i)=>`
      <div class="editCard">
        <h3>${key} ${i+1}</h3>
        ${fields.map(f => f === "text" || f === "note" ? textarea(`${key}.${i}.${f}`, x[f]) : input(`${key}.${i}.${f}`, x[f])).join("")}
      </div>`).join("");
  }

  function renderOverlay(){
    const o = DATA.overlay || {};
    $("overlayEditor").innerHTML = [
      input("overlay.topText", o.topText),
      input("overlay.bottomText", o.bottomText),
      input("overlay.box1Title", o.box1Title),
      input("overlay.box1Main", o.box1Main),
      input("overlay.box1Sub", o.box1Sub),
      input("overlay.box2Title", o.box2Title),
      input("overlay.box2Main", o.box2Main),
      input("overlay.box2Sub", o.box2Sub),
      input("overlay.box3Title", o.box3Title),
      input("overlay.box3Main", o.box3Main),
      input("overlay.box3Sub", o.box3Sub),
      input("overlay.box4Title", o.box4Title),
      input("overlay.box4Main", o.box4Main),
      input("overlay.box4Sub", o.box4Sub)
    ].join("");
  }

  function renderAll(){
    renderHero();
    renderAbout();
    renderNextShows();
    renderMods();
    renderShows();
    renderTop20();
    renderSimpleArray("discovery", "discoveryEditor", ["category","artist","title","note"]);
    renderSimpleArray("requests", "requestsEditor", ["lang","title","text"]);
    renderSimpleArray("community", "communityEditor", ["label","value","text"]);
    renderSimpleArray("journey", "journeyEditor", ["label","current","target","text"]);
    renderSimpleArray("hallOfFame", "hofEditor", ["icon","title","text"]);
    renderSimpleArray("djNetwork", "networkEditor", ["name","role","text"]);
    renderOverlay();
    $("jsonEditor").value = JSON.stringify(DATA, null, 2);
  }

  function setByPath(obj, path, value){
    const parts = path.split(".");
    let cur = obj;
    for(let i=0;i<parts.length-1;i++){
      const p = parts[i];
      const next = parts[i+1];
      if(cur[p] === undefined) cur[p] = /^\d+$/.test(next) ? [] : {};
      cur = cur[p];
    }
    const last = parts[parts.length-1];
    if(value === "true") value = true;
    else if(value === "false") value = false;
    else if(["rank","current","target"].includes(last)) value = Number(value || 0);
    cur[last] = value;
  }

  function collectForm(){
    document.querySelectorAll("[data-path]").forEach(el => setByPath(DATA, el.dataset.path, el.value));
    $("jsonEditor").value = JSON.stringify(DATA, null, 2);
  }

  async function init(){
    try{
      DATA = await loadData();
      renderAll();
      setStatus("✅ Admin klar");
    }catch(e){
      setStatus("❌ " + e.message);
      console.error(e);
    }
  }

  window.adminSave = function(){
    try{
      collectForm();
      saveData(DATA);
      setStatus("✅ Gemt i denne browser");
    }catch(e){ setStatus("❌ " + e.message); }
  };

  window.adminSaveJson = function(){
    try{
      DATA = JSON.parse($("jsonEditor").value);
      saveData(DATA);
      renderAll();
      setStatus("✅ JSON gemt");
    }catch(e){ setStatus("❌ JSON fejl: " + e.message); }
  };

  window.adminReset = async function(){
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    DATA = await fetchDefaultData();
    renderAll();
    setStatus("✅ Nulstillet til site-data.json");
  };

  window.adminExport = function(){
    collectForm();
    const blob = new Blob([JSON.stringify(DATA,null,2)], {type:"application/json"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "site-data.json";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  window.adminImport = function(ev){
    const file = ev.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try{
        DATA = JSON.parse(reader.result);
        saveData(DATA);
        renderAll();
        setStatus("✅ Importeret");
      }catch(e){ setStatus("❌ Import-fejl: " + e.message); }
    };
    reader.readAsText(file);
  };

  document.addEventListener("DOMContentLoaded", init);
})();