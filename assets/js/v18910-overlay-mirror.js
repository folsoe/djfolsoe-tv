
(() => {
  "use strict";

  const $ = id => document.getElementById(id);
  let core = {};
  let index = 0;
  let timer = 0;
  const HOLD = 8500;

  const content = {
    morning:[
      ["SHOW FACT","GOOD MORNING TWITCH","MORNING HITS · WEATHER · COMMUNITY","INFO"],
      ["GOD MORGEN","DU SER GOOD MORNING TWITCH","FØLG DJ FOLSOE FOR FLERE LIVE SHOWS","DA"],
      ["GOOD MORNING","YOU ARE WATCHING LIVE MUSIC TV","FOLLOW DJ FOLSOE AND JOIN THE CHAT","EN"],
      ["GUTEN MORGEN","DU SIEHST LIVE MUSIC TV","FOLGE DJ FOLSOE UND BLEIB DABEI","DE"]
    ],
    trance:[
      ["SHOW FACT","TRANCE TUESDAY","PROGRESSIVE · VOCAL TRANCE · CLASSIC ANTHEMS","INFO"],
      ["VELKOMMEN","DU SER TRANCE TUESDAY LIVE","FØLG KANALEN FOR MERE TRANCE","DA"],
      ["WELCOME","YOU ARE WATCHING TRANCE TUESDAY","FOLLOW FOR MORE TRANCE","EN"],
      ["WILLKOMMEN","DU SIEHST TRANCE TUESDAY","FOLGE FÜR MEHR TRANCE","DE"]
    ],
    eurodance:[
      ["SHOW FACT","EURODANCE LIVE","90s · 00s · HANDS UP · CLUB ANTHEMS","INFO"],
      ["VELKOMMEN","DU SER EURODANCE LIVE","SKRIV DIN FAVORIT I CHATTEN","DA"],
      ["WELCOME","YOU ARE WATCHING EURODANCE LIVE","FOLLOW AND STAY TUNED","EN"],
      ["WILLKOMMEN","DU SIEHST EURODANCE LIVE","FOLGE UND BLEIB DABEI","DE"]
    ],
    retro:[
      ["SHOW FACT","RETRO HITS","CLASSICS FROM THE 70s · 80s · 90s","INFO"],
      ["VELKOMMEN","DU SER RETRO HITS LIVE","FØLG FOR FLERE RETRO SHOWS","DA"],
      ["WELCOME","YOU ARE WATCHING RETRO HITS","FOLLOW FOR MORE CLASSICS","EN"],
      ["WILLKOMMEN","DU SIEHST RETRO HITS","FOLGE FÜR MEHR KLASSIKER","DE"]
    ],
    fredagsbar:[
      ["SHOW FACT","FREDAGSBAR","PARTY MUSIC · REQUESTS · GOOD COMPANY","INFO"],
      ["SKÅL DERUDE","DU ER EN DEL AF FESTEN","FØLG DJ FOLSOE OG INVITÉR EN VEN","DA"],
      ["WELCOME","YOU ARE PART OF THE FRIDAY BAR","FOLLOW AND BRING A FRIEND","EN"],
      ["PROST","DU BIST TEIL DER FREITAGSBAR","FOLGE UND BRING EINEN FREUND MIT","DE"]
    ]
  };

  function theme() {
    return document.documentElement.dataset.djfTheme || "morning";
  }

  function cards() {
    const data = content[theme()] || content.morning;
    const next = core.nextShow || core.schedule?.next || {};
    const followers = Math.max(874, Number(
      core.twitch?.followers || core.followers || core.community?.followers || 874
    ));
    return [
      ...data,
      ["WATCH · FOLLOW · JOIN","TWITCH.TV/DJFOLSOE","LIVE SHOWS · CHAT · REQUESTS · COMMUNITY","TV"],
      ["EXPLORE THE CHANNEL","FOLSOETV.DK","SHOWS · SCHEDULE · CHARTS · COMMUNITY","WEB"],
      ["UP NEXT",next.title || next.name || "NEXT DJ FOLSOE BROADCAST",next.displayTime || next.dateText || "ANNOUNCED SOON","NEXT"],
      ["TWITCH COMMUNITY",`${followers.toLocaleString("en-GB")} FOLLOWERS`,"THANK YOU FOR BEING PART OF THE CHANNEL","LIVE"]
    ];
  }

  function show() {
    const list = cards();
    const card = list[index % list.length];
    index = (index + 1) % list.length;
    $("liveDeskKicker").textContent = card[0];
    $("nowPlayingTitle").textContent = card[1];
    $("nowPlayingMeta").textContent = card[2];
    $("liveDeskIcon").textContent = card[3];
    $("nowPlayingProgress").style.width = `${Math.round(index / list.length * 100)}%`;
  }

  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(() => { show(); schedule(); }, HOLD);
  }

  window.addEventListener("djf:broadcast-core", event => {
    core = event.detail || {};
    index = 0;
    show();
  }, { passive:true });

  show();
  schedule();
  window.addEventListener("beforeunload", () => clearTimeout(timer), { once:true });

  window.DJF_WEBSITE_V18910 = Object.freeze({
    next:show,
    status:() => ({ build:"V18910",theme:theme(),cards:cards().length,index })
  });
})();
