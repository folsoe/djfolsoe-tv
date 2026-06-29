
/* =========================================================
   DJ FOLSOE V816.20.2.0 — WEBSITE + ADMIN I18N FIX
   EN is primary. DA is second. DE is third.
   Overlay stays English only.
   ========================================================= */

(function(){
  const MAP = {
    en: {
      "HOME":"HOME","ABOUT":"ABOUT","SHOWS":"SHOWS","COMMUNITY":"COMMUNITY","NEXT SHOW":"NEXT SHOW","REQUESTS":"REQUESTS","NEWS":"NEWS","TOP 20":"TOP 20","ADMIN":"ADMIN",
      "WHO IS DJ FOLSOE?":"WHO IS DJ FOLSOE?","Music":"Music","Shows":"Shows","Requests":"Requests","Community":"Community",
      "Live data":"Live data","Status":"Status","Viewers":"Viewers","Followers":"Followers","Category":"Category","Title":"Title",
      "WATCH ON TWITCH":"WATCH ON TWITCH","SEE ME LIVE ON TWITCH":"SEE ME LIVE ON TWITCH","SONG REQUESTS":"SONG REQUESTS",
      "Countdown":"Countdown","COUNTDOWN":"COUNTDOWN","Fresh morning vibes — maybe":"Fresh morning vibes — maybe",
      "FOLSOE TOP 20":"FOLSOE TOP 20","SEE FULL CHART":"SEE FULL CHART","MUSIC DISCOVERY UNIVERSE":"MUSIC DISCOVERY UNIVERSE",
      "LIVE REQUEST WALL":"LIVE REQUEST WALL","COMMUNITY LOVE":"COMMUNITY LOVE","VIEWER JOURNEY":"VIEWER JOURNEY","HALL OF FAME":"HALL OF FAME","DJ NETWORK":"DJ NETWORK","COMING UP":"COMING UP",
      "LATEST REQUESTS":"LATEST REQUESTS","NEWS & UPDATES":"NEWS & UPDATES","NEW DISCOVERIES":"NEW DISCOVERIES","MOD TEAM":"MOD TEAM",
      "DJ FOLSOE brings music, chat, requests and Danish DJ culture together in a live broadcast universe.":"DJ FOLSOE brings music, chat, requests and Danish DJ culture together in a live broadcast universe.",
      "Trance, Retro, EDM, Pop and more":"Trance, Retro, EDM, Pop and more",
      "Live DJ shows and themed streams":"Live DJ shows and themed streams",
      "Use !request, !ønske or !Wunsch in chat.":"Use !request, !ønske or !Wunsch in chat.",
      "Chat, mods and Danish DJ culture":"Chat, mods and Danish DJ culture",
      "Mods keep the chat friendly, help new viewers and create a safe community around the stream.":"Mods keep the chat friendly, help new viewers and create a safe community around the stream.",
      "Broadcast Control Center":"Broadcast Control Center","Load data":"Load data","Save data":"Save data","Reset":"Reset","Download data":"Download data",
      "Hero text":"Hero text","Who is DJ Folsoe?":"Who is DJ Folsoe?","Date":"Date","Start":"Start","End":"End","Next show text":"Next show text",
      "Overlay top ticker":"Overlay top ticker","Overlay bottom ticker":"Overlay bottom ticker","ADVANCED JSON":"ADVANCED JSON","ALL CONTENT":"ALL CONTENT",
      "Theme Engine for overlay":"Theme Engine for overlay","Website content":"Website content","Homepage news/cards":"Homepage news/cards","Add news":"Add news","Delete":"Delete","Save":"Save",
      "Admin token":"Admin token","Sync token":"Sync token","Test theme API":"Test theme API"
    },
    da: {
      "HOME":"FORSIDE","ABOUT":"OM MIG","SHOWS":"SHOWS","COMMUNITY":"COMMUNITY","NEXT SHOW":"NÆSTE SHOW","REQUESTS":"REQUESTS","NEWS":"NYHEDER","TOP 20":"TOP 20","ADMIN":"ADMIN",
      "WHO IS DJ FOLSOE?":"HVEM ER DJ FOLSOE?","Music":"Musik","Shows":"Shows","Requests":"Requests","Community":"Community",
      "Live data":"Live data","Status":"Status","Viewers":"Seere","Followers":"Følgere","Category":"Kategori","Title":"Titel",
      "WATCH ON TWITCH":"SE PÅ TWITCH","SEE ME LIVE ON TWITCH":"SE MIG LIVE PÅ TWITCH","SONG REQUESTS":"MUSIKØNSKER",
      "Countdown":"Countdown","COUNTDOWN":"COUNTDOWN","Fresh morning vibes — maybe":"Morgenfrisk — måske",
      "FOLSOE TOP 20":"FOLSOE TOP 20","SEE FULL CHART":"SE HELE LISTEN","MUSIC DISCOVERY UNIVERSE":"MUSIC DISCOVERY UNIVERSE",
      "LIVE REQUEST WALL":"LIVE REQUEST WALL","COMMUNITY LOVE":"COMMUNITY LOVE","VIEWER JOURNEY":"VIEWER JOURNEY","HALL OF FAME":"HALL OF FAME","DJ NETWORK":"DJ NETWORK","COMING UP":"KOMMENDE SHOWS",
      "LATEST REQUESTS":"SENESTE MUSIKØNSKER","NEWS & UPDATES":"NYHEDER & OPDATERINGER","NEW DISCOVERIES":"DEM HER HAR JEG LIGE OPDAGET","MOD TEAM":"MOD-TEAMET",
      "DJ FOLSOE brings music, chat, requests and Danish DJ culture together in a live broadcast universe.":"DJ FOLSOE samler musik, chat, requests og dansk DJ-kultur i et levende broadcast-univers.",
      "Trance, Retro, EDM, Pop and more":"Trance, Retro, EDM, Pop og mere",
      "Live DJ shows and themed streams":"Live DJ-shows og temastreams",
      "Use !request, !ønske or !Wunsch in chat.":"Brug !ønske, !request eller !Wunsch i chatten.",
      "Chat, mods and Danish DJ culture":"Chat, mods og dansk DJ-kultur",
      "Mods keep the chat friendly, help new viewers and create a safe community around the stream.":"Mods holder chatten venlig, hjælper nye seere og skaber et trygt community omkring streamen.",
      "Broadcast Control Center":"Broadcast Control Center","Load data":"Hent data","Save data":"Gem data","Reset":"Nulstil","Download data":"Download data",
      "Hero text":"Hero tekst","Who is DJ Folsoe?":"Hvem er DJ Folsoe?","Date":"Dato","Start":"Start","End":"Slut","Next show text":"Næste show tekst",
      "Overlay top ticker":"Overlay top ticker","Overlay bottom ticker":"Overlay bund ticker","ADVANCED JSON":"AVANCERET JSON","ALL CONTENT":"ALT INDHOLD",
      "Theme Engine for overlay":"Theme Engine til overlay","Website content":"Hjemmeside indhold","Homepage news/cards":"Forside nyheder/cards","Add news":"Tilføj nyhed","Delete":"Slet","Save":"Gem",
      "Admin token":"Admin token","Sync token":"Synk token","Test theme API":"Test theme API"
    },
    de: {
      "HOME":"START","ABOUT":"ÜBER MICH","SHOWS":"SHOWS","COMMUNITY":"COMMUNITY","NEXT SHOW":"NÄCHSTE SHOW","REQUESTS":"WÜNSCHE","NEWS":"NEWS","TOP 20":"TOP 20","ADMIN":"ADMIN",
      "WHO IS DJ FOLSOE?":"WER IST DJ FOLSOE?","Music":"Musik","Shows":"Shows","Requests":"Wünsche","Community":"Community",
      "Live data":"Live-Daten","Status":"Status","Viewers":"Zuschauer","Followers":"Follower","Category":"Kategorie","Title":"Titel",
      "WATCH ON TWITCH":"AUF TWITCH ANSEHEN","SEE ME LIVE ON TWITCH":"LIVE AUF TWITCH","SONG REQUESTS":"MUSIKWÜNSCHE",
      "Countdown":"Countdown","COUNTDOWN":"COUNTDOWN","Fresh morning vibes — maybe":"Frische Morgenstimmung — vielleicht",
      "FOLSOE TOP 20":"FOLSOE TOP 20","SEE FULL CHART":"GANZE CHART ANSEHEN","MUSIC DISCOVERY UNIVERSE":"MUSIC DISCOVERY UNIVERSE",
      "LIVE REQUEST WALL":"LIVE REQUEST WALL","COMMUNITY LOVE":"COMMUNITY LOVE","VIEWER JOURNEY":"VIEWER JOURNEY","HALL OF FAME":"HALL OF FAME","DJ NETWORK":"DJ NETWORK","COMING UP":"KOMMENDE SHOWS",
      "LATEST REQUESTS":"NEUESTE MUSIKWÜNSCHE","NEWS & UPDATES":"NEWS & UPDATES","NEW DISCOVERIES":"NEUE ENTDECKUNGEN","MOD TEAM":"MOD-TEAM",
      "DJ FOLSOE brings music, chat, requests and Danish DJ culture together in a live broadcast universe.":"DJ FOLSOE verbindet Musik, Chat, Wünsche und dänische DJ-Kultur in einem lebendigen Broadcast-Universum.",
      "Trance, Retro, EDM, Pop and more":"Trance, Retro, EDM, Pop und mehr",
      "Live DJ shows and themed streams":"Live-DJ-Shows und Themenstreams",
      "Use !request, !ønske or !Wunsch in chat.":"Nutze !Wunsch, !request oder !ønske im Chat.",
      "Chat, mods and Danish DJ culture":"Chat, Mods und dänische DJ-Kultur",
      "Mods keep the chat friendly, help new viewers and create a safe community around the stream.":"Mods halten den Chat freundlich, helfen neuen Zuschauern und schaffen eine sichere Community rund um den Stream.",
      "Broadcast Control Center":"Broadcast Control Center","Load data":"Daten laden","Save data":"Daten speichern","Reset":"Zurücksetzen","Download data":"Daten herunterladen",
      "Hero text":"Hero-Text","Who is DJ Folsoe?":"Wer ist DJ Folsoe?","Date":"Datum","Start":"Start","End":"Ende","Next show text":"Text für nächste Show",
      "Overlay top ticker":"Overlay Top-Ticker","Overlay bottom ticker":"Overlay Bottom-Ticker","ADVANCED JSON":"ERWEITERTES JSON","ALL CONTENT":"ALLE INHALTE",
      "Theme Engine for overlay":"Theme Engine für Overlay","Website content":"Website-Inhalt","Homepage news/cards":"Startseiten-News/Cards","Add news":"News hinzufügen","Delete":"Löschen","Save":"Speichern",
      "Admin token":"Admin-Token","Sync token":"Token synchronisieren","Test theme API":"Theme API testen"
    }
  };

  const ALIASES = {
    "FORSIDE":"HOME","OM MIG":"ABOUT","NÆSTE SHOW":"NEXT SHOW","NYHEDER":"NEWS","MUSIKØNSKER":"REQUESTS",
    "HVEM ER DJ FOLSOE?":"WHO IS DJ FOLSOE?","MUSIK":"Music","SEERE":"Viewers","FØLGERE":"Followers",
    "SE PÅ TWITCH":"WATCH ON TWITCH","SE MIG LIVE PÅ TWITCH":"SEE ME LIVE ON TWITCH","MOD-TEAMET":"MOD TEAM",
    "SENESTE MUSIKØNSKER":"LATEST REQUESTS","NYHEDER & OPDATERINGER":"NEWS & UPDATES",
    "DEM HER HAR JEG LIGE OPDAGET":"NEW DISCOVERIES","KOMMENDE SHOWS":"COMING UP",
    "HENT DATA":"Load data","GEM DATA":"Save data","NULSTIL":"Reset","SLET":"Delete","GEM":"Save"
  };

  function canonical(txt){
    const t = String(txt||"").replace(/\s+/g," ").trim();
    if(!t) return "";
    return MAP.en[t] ? t : (ALIASES[t.toUpperCase()] || t);
  }

  function translateText(txt, lang){
    let s = String(txt||"");
    const trimmed = s.replace(/\s+/g," ").trim();
    const key = canonical(trimmed);
    if(key && MAP[lang] && MAP[lang][key]){
      return s.replace(trimmed, MAP[lang][key]);
    }
    // phrase replacements inside longer dynamic strings
    Object.keys(ALIASES).forEach(alias=>{
      const enKey = ALIASES[alias];
      const target = MAP[lang][enKey];
      if(target) s = s.replace(new RegExp(alias.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),"gi"), target);
    });
    Object.keys(MAP.en).forEach(enKey=>{
      const target = MAP[lang][enKey];
      if(target && target !== enKey) s = s.replace(new RegExp(enKey.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),"g"), target);
    });
    return s;
  }

  function applyLang(lang){
    lang = ["en","da","de"].includes(lang) ? lang : "en";
    document.documentElement.lang = lang;
    localStorage.setItem("DJF_LANG", lang);

    document.querySelectorAll("body *").forEach(el=>{
      if(["SCRIPT","STYLE","TEXTAREA","INPUT","SELECT","OPTION"].includes(el.tagName)) return;
      if(el.children.length === 0 && el.textContent && el.textContent.trim()){
        if(!el.dataset.i18nSource) el.dataset.i18nSource = canonical(el.textContent) || el.textContent.trim();
        el.textContent = translateText(el.dataset.i18nSource, lang);
      }
      ["title","aria-label"].forEach(attr=>{
        if(el.hasAttribute && el.hasAttribute(attr)){
          const k = "i18n"+attr;
          if(!el.dataset[k]) el.dataset[k] = canonical(el.getAttribute(attr)) || el.getAttribute(attr);
          el.setAttribute(attr, translateText(el.dataset[k], lang));
        }
      });
    });

    document.querySelectorAll("input[placeholder], textarea[placeholder]").forEach(el=>{
      if(!el.dataset.i18nPlaceholder) el.dataset.i18nPlaceholder = canonical(el.getAttribute("placeholder")) || el.getAttribute("placeholder");
      el.setAttribute("placeholder", translateText(el.dataset.i18nPlaceholder, lang));
    });

    document.querySelectorAll(".langs button, [data-lang], .langBtn").forEach(btn=>{
      const val = (btn.dataset.lang || btn.textContent || "").trim().toLowerCase();
      const code = val.includes("da") || val === "dk" ? "da" : val.includes("de") ? "de" : "en";
      btn.classList.toggle("active", code === lang);
      btn.setAttribute("aria-pressed", code === lang ? "true" : "false");
    });
  }

  function fixLangButtons(){
    const containers = document.querySelectorAll(".langs, .language, .languageSwitcher, .langSwitch");
    containers.forEach(c=>{
      const existing = [...c.querySelectorAll("button")];
      if(existing.length >= 3){
        c.innerHTML = "";
        [["en","EN"],["da","DA"],["de","DE"]].forEach(([code,label])=>{
          const b = document.createElement("button");
          b.type = "button";
          b.dataset.lang = code;
          b.textContent = label;
          b.addEventListener("click",()=>applyLang(code));
          c.appendChild(b);
        });
      }
    });
    document.querySelectorAll("[data-lang]").forEach(el=>{
      el.addEventListener("click", e=>{
        e.preventDefault();
        let code = (el.dataset.lang||el.textContent||"en").toLowerCase();
        if(code==="dk") code="da";
        applyLang(code);
      });
    });
  }

  window.DJF_applyLang = applyLang;
  document.addEventListener("DOMContentLoaded",()=>{
    fixLangButtons();
    applyLang(localStorage.getItem("DJF_LANG") || "en");
    setTimeout(()=>applyLang(localStorage.getItem("DJF_LANG") || "en"), 800);
    setTimeout(()=>applyLang(localStorage.getItem("DJF_LANG") || "en"), 2200);
  });
})();
