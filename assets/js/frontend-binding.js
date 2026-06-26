
/* DJ FOLSOE V813.2 FRONTEND BINDING FIX */
(function(){
  const FALLBACK = window.DJF_BRAND_FALLBACK || {
    brand: "DJ FOLSOE",
    heroRibbon: { da: "BROADCAST CLOUD · DJ FOLSOE ON TWITCH", en: "BROADCAST CLOUD · DJ FOLSOE ON TWITCH", de: "BROADCAST CLOUD · DJ FOLSOE ON TWITCH" },
    heroDescription: { da: "DJ FOLSOE er en dansk musikstreamer på Twitch.tv med live DJ-shows, musikønsker, hitlister og et stærkt musikfællesskab.", en: "DJ FOLSOE is a Danish music streamer on Twitch.tv with live DJ shows, song requests, chart countdowns and a strong music community.", de: "DJ FOLSOE ist ein dänischer Musikstreamer auf Twitch.tv mit Live-DJ-Shows, Musikwünschen, Charts und einer starken Musik-Community." }
  };

  function lang(){
    return localStorage.getItem("djf_lang") || localStorage.getItem("DJF_LANG") || document.documentElement.lang || "da";
  }

  function pick(value){
    const l = lang();
    if (!value) return "";
    if (typeof value === "string") return value;
    return value[l] || value.da || value.en || value.de || "";
  }

  function cleanText(value){
    return String(value || "")
      .replaceAll("DJ FOLSOE TV", "DJ FOLSOE")
      .replaceAll("FOLSOE TV", "FOLSOE")
      .replace(/\s*[–—-]\s*presented as a modern Music TV channel from Denmark\.?/gi, "")
      .replace(/\s*[–—-]\s*præsenteret som en moderne Music TV-kanal fra Danmark\.?/gi, "")
      .replace(/\s*[–—-]\s*präsentiert als moderner Music-TV-Sender aus Dänemark\.?/gi, "")
      .replace(/\s*[–—-]\s*präsentiert als moderner Music-TV-Kanal aus Dänemark\.?/gi, "")
      .trim();
  }

  async function loadData(){
    const urls = [
      "/data.json?v=8132fb",
      "/assets/data/site-data.json?v=8132fb",
      "/site-data.json?v=8132fb"
    ];
    for (const url of urls){
      try {
        const r = await fetch(url, { cache: "no-store" });
        if (r.ok) return await r.json();
      } catch(e) {}
    }
    return {};
  }

  function bind(data){
    data = data || {};
    const translations = data.translations || {};
    const heroRibbon = translations.heroRibbon || data.heroRibbon || FALLBACK.heroRibbon;
    const heroDescription = translations.heroDescription || data.about || FALLBACK.heroDescription;
    const siteTitle = translations.siteTitle || data.brand || FALLBACK.brand;

    document.querySelectorAll('[data-bind="heroRibbon"], [data-i18n="heroRibbon"]').forEach(el => {
      el.textContent = cleanText(pick(heroRibbon));
    });
    document.querySelectorAll('[data-bind="heroDescription"], [data-i18n="heroDescription"]').forEach(el => {
      el.textContent = cleanText(pick(heroDescription));
    });
    document.querySelectorAll('[data-bind="siteTitle"], [data-i18n="siteTitle"]').forEach(el => {
      el.textContent = "DJ FOLSOE";
    });

    // Safety net: remove old text anywhere on the page
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(n => {
      n.nodeValue = cleanText(n.nodeValue)
        .replaceAll("BROADCAST CLOUD · RADIO 2026 · MUSIC TV FROM DENMARK", "BROADCAST CLOUD · DJ FOLSOE ON TWITCH")
        .replaceAll("BROADCAST CLOUD · RADIO 2026 · MUSIC TV FRA DANMARK", "BROADCAST CLOUD · DJ FOLSOE ON TWITCH");
    });

    const title = document.querySelector("title");
    if(title) title.textContent = "DJ FOLSOE";
  }

  async function run(){
    const data = await loadData();
    bind(data);
    window.DJF_BOUND_DATA = data;
  }

  document.addEventListener("DOMContentLoaded", run);
  window.addEventListener("load", () => setTimeout(run, 250));
  window.addEventListener("storage", run);
  window.DJF_REBIND_FRONTEND = run;
})();
