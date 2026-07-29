
(() => {
  "use strict";

  const $ = id => document.getElementById(id);
  const FOLLOWER_FLOOR = 874;
  let core = {};
  let momentIndex = 0;
  let timer = 0;
  const HOLD = 8200;

  const themes = {
    morning: {
      title: "GOOD MORNING TWITCH",
      body: "Feel-good music, weather and community.",
      icon: "☀"
    },
    trance: {
      title: "TRANCE TUESDAY",
      body: "Progressive, vocal trance and classic anthems.",
      icon: "◇"
    },
    eurodance: {
      title: "EURODANCE LIVE",
      body: "90s, 00s and high-energy club classics.",
      icon: "EU"
    },
    retro: {
      title: "RETRO HITS",
      body: "Classics from the 70s, 80s and 90s.",
      icon: "RE"
    },
    fredagsbar: {
      title: "FREDAGSBAR",
      body: "Party music, requests and great company.",
      icon: "BAR"
    },
    summer: {
      title: "SUMMER 2026",
      body: "Summer hits, house and feel-good classics.",
      icon: "SUM"
    },
    weekend: {
      title: "WEEKEND LIVE",
      body: "Anthems, requests and surprises.",
      icon: "WK"
    },
    popup: {
      title: "POP UP LIVE",
      body: "A surprise live DJ broadcast.",
      icon: "POP"
    },
    danske: {
      title: "DANISH HITS",
      body: "Danish pop, rock, dance and classics.",
      icon: "DK"
    },
    top20: {
      title: "FOLSOE TOP 20",
      body: "Twenty tracks and one number one.",
      icon: "20"
    }
  };

  const baseMoments = [
    ["WELCOME","YOU ARE WATCHING DJ FOLSOE MUSIC TV","Follow the channel and become part of the live community.","TV"],
    ["DANSK","VELKOMMEN TIL DJ FOLSOE","Følg kanalen og vær med næste gang vi går live.","DA"],
    ["ENGLISH","LIVE MUSIC TELEVISION FROM DENMARK","Watch, chat, request and join the community.","EN"],
    ["DEUTSCH","WILLKOMMEN BEI DJ FOLSOE","Folge dem Kanal und werde Teil der Community.","DE"],
    ["TWITCH","FOLLOW · CHAT · REQUEST","Open Twitch and join the live show.","LIVE"]
  ];

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

  function nextShow() {
    return core.nextShow || core.schedule?.next || {};
  }

  function followerCount() {
    return Math.max(FOLLOWER_FLOOR, count(
      core.twitch?.followers,
      core.twitch?.followerCount,
      core.followers,
      core.community?.followers
    ));
  }

  function viewerCount() {
    return count(core.twitch?.viewers, core.viewers);
  }

  function showTitle() {
    return core.show?.title ||
      core.currentShow?.title ||
      core.showTitle ||
      themes[currentTheme()]?.title ||
      "DJ FOLSOE MUSIC TV";
  }

  function renderWall() {
    const theme = currentTheme();
    const themeData = themes[theme] || themes.morning;
    const next = nextShow();
    const followers = followerCount();
    const milestone = Math.ceil((followers + 1) / 25) * 25;
    const remaining = Math.max(0, milestone - followers);
    const viewers = viewerCount();

    $("v18920WallLiveTitle").textContent = showTitle();
    $("v18920WallLiveBody").textContent =
      core.twitch?.title ||
      core.streamTitle ||
      themeData.body;
    $("v18920WallFollowers").textContent = followers.toLocaleString("en-GB");
    $("v18920WallMilestone").textContent =
      remaining > 0 ? `${remaining} until the next milestone` : "Milestone reached";
    $("v18920WallViewers").textContent = viewers.toLocaleString("en-GB");
    $("v18920WallNext").textContent =
      next.title || next.name || "NEXT DJ FOLSOE BROADCAST";
    $("v18920WallNextTime").textContent =
      next.displayTime || next.dateText || next.start || "Announced soon";
    $("v18920WallTheme").textContent =
      core.theme?.title || themeData.title;

    $("v18920CenterStatus").textContent =
      Boolean(core.twitch?.isLive ?? core.isLive) ? "LIVE CHANNEL" : "CHANNEL CONNECTED";

    const timeline = $("v18920Timeline");
    if (timeline) {
      timeline.innerHTML = `
        <div><b>NOW</b><strong>${showTitle()}</strong><small>${core.twitch?.title || themeData.body}</small></div>
        <div><b>NEXT</b><strong>${next.title || next.name || "Next DJ FOLSOE broadcast"}</strong><small>${next.displayTime || next.dateText || "Schedule updates automatically"}</small></div>
        <div><b>FOLLOW</b><strong>Never miss the next live show</strong><small>Follow twitch.tv/djfolsoe</small></div>
      `;
    }
  }

  function moments() {
    const theme = currentTheme();
    const themeData = themes[theme] || themes.morning;
    const next = nextShow();
    const followers = followerCount();

    return [
      [themeData.title, themeData.body, "Follow DJ FOLSOE for more live shows.", themeData.icon],
      ...baseMoments,
      ["COMMUNITY",`${followers.toLocaleString("en-GB")} TWITCH FOLLOWERS`,"Thank you for being part of the channel.","♥"],
      ["UP NEXT",next.title || next.name || "NEXT DJ FOLSOE BROADCAST",next.displayTime || next.dateText || "Announced soon","NEXT"]
    ];
  }

  function showMoment() {
    const list = moments();
    const item = list[momentIndex % list.length];
    const position = momentIndex % list.length;
    momentIndex = (position + 1) % list.length;

    $("v18920MomentKicker").textContent = item[0];
    $("v18920MomentTitle").textContent = item[1];
    $("v18920MomentBody").textContent = item[2];
    $("v18920MomentIcon").textContent = item[3];
    $("v18920MomentProgress").style.width =
      `${Math.round((position + 1) / list.length * 100)}%`;
  }

  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      showMoment();
      schedule();
    }, HOLD);
  }

  window.addEventListener("djf:broadcast-core", event => {
    core = event.detail || {};
    renderWall();
    momentIndex = 0;
    showMoment();
  }, { passive:true });

  const observer = new MutationObserver(() => {
    renderWall();
    momentIndex = 0;
    showMoment();
  });
  observer.observe(document.documentElement, {
    attributes:true,
    attributeFilter:["data-djf-theme"]
  });

  renderWall();
  showMoment();
  schedule();

  window.addEventListener("beforeunload", () => {
    clearTimeout(timer);
    observer.disconnect();
  }, { once:true });

  window.DJF_WEBSITE_V18920 = Object.freeze({
    next:showMoment,
    refresh:renderWall,
    status:() => ({
      build:"V18920",
      theme:currentTheme(),
      followers:followerCount(),
      viewers:viewerCount(),
      moments:moments().length
    })
  });
})();
