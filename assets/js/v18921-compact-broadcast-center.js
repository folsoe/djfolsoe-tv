
(() => {
  "use strict";

  const $ = id => document.getElementById(id);
  const FOLLOWER_FLOOR = 874;
  const HOLD_MS = 8200;

  let core = {};
  let index = 0;
  let timer = 0;

  const themeContent = {
    morning:["GOOD MORNING TWITCH","Feel-good music, weather and community.","☀"],
    trance:["TRANCE TUESDAY","Progressive, vocal trance and classic anthems.","TR"],
    eurodance:["EURODANCE LIVE","90s, 00s and high-energy club classics.","EU"],
    retro:["RETRO HITS","Classics from the 70s, 80s and 90s.","RE"],
    fredagsbar:["FREDAGSBAR","Party music, requests and great company.","BAR"],
    summer:["SUMMER 2026","Summer hits, house and feel-good classics.","SUM"],
    weekend:["WEEKEND LIVE","Anthems, requests and surprises.","WK"],
    popup:["POP UP LIVE","A surprise live DJ broadcast.","POP"],
    danske:["DANISH HITS","Danish pop, rock, dance and classics.","DK"],
    top20:["FOLSOE TOP 20","Twenty tracks and one number one.","20"]
  };

  function currentTheme() {
    return document.documentElement.dataset.djfTheme || "morning";
  }

  function count(...values) {
    for (const value of values) {
      const n = Number(value);
      if (Number.isFinite(n) && n >= 0) return Math.floor(n);
    }
    return 0;
  }

  function followers() {
    return Math.max(FOLLOWER_FLOOR, count(
      core.twitch?.followers,
      core.twitch?.followerCount,
      core.followers,
      core.community?.followers
    ));
  }

  function viewers() {
    return count(core.twitch?.viewers, core.viewers);
  }

  function nextShow() {
    return core.nextShow || core.schedule?.next || {};
  }

  function themeData() {
    return themeContent[currentTheme()] || themeContent.morning;
  }

  function currentShowTitle() {
    return core.show?.title ||
      core.currentShow?.title ||
      core.showTitle ||
      themeData()[0];
  }

  function currentShowBody() {
    return core.twitch?.title ||
      core.streamTitle ||
      core.show?.description ||
      themeData()[1];
  }

  function renderDashboard() {
    const next = nextShow();
    const followerTotal = followers();
    const nextMilestone = Math.ceil((followerTotal + 1) / 25) * 25;
    const remaining = Math.max(0, nextMilestone - followerTotal);
    const isLive = Boolean(core.twitch?.isLive ?? core.isLive);

    $("v18921Status").textContent = isLive ? "LIVE CHANNEL" : "CHANNEL CONNECTED";
    $("v18921LiveState").textContent = isLive ? "LIVE NOW" : "LIVE CHANNEL";

    $("v18921CurrentShow").textContent = currentShowTitle();
    $("v18921CurrentBody").textContent = currentShowBody();

    $("v18921NextShow").textContent =
      next.title || next.name || "NEXT DJ FOLSOE BROADCAST";
    $("v18921NextTime").textContent =
      next.displayTime || next.dateText || next.start || "Announced soon";

    $("v18921Followers").textContent = followerTotal.toLocaleString("en-GB");
    $("v18921FollowerMilestone").textContent =
      remaining > 0 ? `${remaining} until ${nextMilestone}` : "Milestone reached";

    $("v18921Viewers").textContent = viewers().toLocaleString("en-GB");
    $("v18921Theme").textContent =
      core.theme?.title || themeData()[0];
  }

  function moments() {
    const next = nextShow();
    const followerTotal = followers();
    const t = themeData();

    return [
      [t[0],t[1],"Follow DJ FOLSOE for more live shows.",t[2]],
      ["DANSK","VELKOMMEN TIL DJ FOLSOE","Følg kanalen og bliv en del af fællesskabet.","DA"],
      ["ENGLISH","LIVE MUSIC TELEVISION FROM DENMARK","Watch, chat, request and join the community.","EN"],
      ["DEUTSCH","WILLKOMMEN BEI DJ FOLSOE","Folge dem Kanal und werde Teil der Community.","DE"],
      ["COMMUNITY",`${followerTotal.toLocaleString("en-GB")} TWITCH FOLLOWERS`,"Thank you for being part of the channel.","♥"],
      ["UP NEXT",next.title || next.name || "NEXT DJ FOLSOE BROADCAST",next.displayTime || next.dateText || "Announced soon","NEXT"],
      ["TWITCH","WATCH · FOLLOW · JOIN","Open Twitch and become part of the live show.","TV"]
    ];
  }

  function showMoment() {
    const list = moments();
    const position = index % list.length;
    const item = list[position];
    index = (position + 1) % list.length;

    $("v18921MomentKicker").textContent = item[0];
    $("v18921MomentTitle").textContent = item[1];
    $("v18921MomentBody").textContent = item[2];
    $("v18921MomentIcon").textContent = item[3];
    $("v18921MomentProgress").style.width =
      `${Math.round((position + 1) / list.length * 100)}%`;
  }

  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      showMoment();
      schedule();
    }, HOLD_MS);
  }

  window.addEventListener("djf:broadcast-core", event => {
    core = event.detail || {};
    renderDashboard();
    index = 0;
    showMoment();
  }, { passive:true });

  const observer = new MutationObserver(() => {
    renderDashboard();
    index = 0;
    showMoment();
  });

  observer.observe(document.documentElement, {
    attributes:true,
    attributeFilter:["data-djf-theme"]
  });

  renderDashboard();
  showMoment();
  schedule();

  window.addEventListener("beforeunload", () => {
    clearTimeout(timer);
    observer.disconnect();
  }, { once:true });

  window.DJF_WEBSITE_V18921 = Object.freeze({
    next:showMoment,
    refresh:renderDashboard,
    status:() => ({
      build:"V18921",
      theme:currentTheme(),
      followers:followers(),
      viewers:viewers(),
      cards:moments().length
    })
  });
})();
