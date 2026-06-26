// DJ FOLSOE TV NETWORK V812 - CLOUDFLARE WORKER BACKEND RESTORE
// Worker routes:
// GET  /api/broadcast-core
// POST /api/broadcast-core
// GET  /api/chart
// POST /api/chart
// GET  /api/requests
// POST /api/requests
// DELETE /api/requests
// GET  /api/twitch-live
//
// Required KV binding: DJF_DATA
// Required env vars:
// ADMIN_TOKEN = long secret admin password/token
// TWITCH_CLIENT_ID = Twitch developer client id
// TWITCH_ACCESS_TOKEN = Twitch app/user access token
// TWITCH_CHANNEL = djfolsoe

const DEFAULT_DATA = {
  station: {
    name: "DJ FOLSOE TV",
    domain: "folsoetv.dk",
    twitch: "https://twitch.tv/djfolsoe",
    twitchLogin: "djfolsoe",
    live: false,
    viewers: 0,
    followersCurrent: 870,
    followersGoal: 1000,
    subsToday: 0,
    bitsToday: 0,
    streamTitle: "",
    category: ""
  },
  schedule: [],
  shows: [],
  top20: [],
  top20Chart: {
    title: "FOLSOE TV Top 20",
    subtitle: "FOLSOE AIRPLAY HOT 20",
    week: "This Week",
    archive: [],
    items: []
  },
  news: [],
  requests: [],
  broadcastCore: {
    version: "V812",
    backend: "Cloudflare Worker",
    singleSourceOfTruth: true
  }
};

const KEY_CORE = "broadcast-core";
const KEY_REQUESTS = "requests";

function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET,POST,DELETE,OPTIONS",
      "access-control-allow-headers": "content-type,authorization,x-admin-token",
      ...extraHeaders
    }
  });
}

function okOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET,POST,DELETE,OPTIONS",
      "access-control-allow-headers": "content-type,authorization,x-admin-token"
    }
  });
}

function isAdmin(request, env) {
  const token = request.headers.get("x-admin-token") || (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  return Boolean(env.ADMIN_TOKEN && token && token === env.ADMIN_TOKEN);
}

async function getCore(env) {
  const raw = await env.DJF_DATA.get(KEY_CORE);
  if (!raw) return structuredClone(DEFAULT_DATA);
  try {
    return { ...structuredClone(DEFAULT_DATA), ...JSON.parse(raw) };
  } catch {
    return structuredClone(DEFAULT_DATA);
  }
}

async function putCore(env, data) {
  data.broadcastCore = data.broadcastCore || {};
  data.broadcastCore.version = "V812";
  data.broadcastCore.backend = "Cloudflare Worker";
  data.broadcastCore.lastUpdated = new Date().toISOString();
  await env.DJF_DATA.put(KEY_CORE, JSON.stringify(data));
  return data;
}

async function getRequests(env) {
  const raw = await env.DJF_DATA.get(KEY_REQUESTS);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

async function putRequests(env, requests) {
  await env.DJF_DATA.put(KEY_REQUESTS, JSON.stringify(requests));
  return requests;
}


async function twitchHeaders(env){
  return {"Client-ID": env.TWITCH_CLIENT_ID, "Authorization": `Bearer ${env.TWITCH_ACCESS_TOKEN}`};
}
async function twitchUser(env){
  const clientId=env.TWITCH_CLIENT_ID, token=env.TWITCH_ACCESS_TOKEN, login=env.TWITCH_CHANNEL||"djfolsoe";
  if(!clientId||!token) return {configured:false, login};
  const res=await fetch(`https://api.twitch.tv/helix/users?login=${encodeURIComponent(login)}`,{headers: await twitchHeaders(env)});
  const j=await res.json();
  return {configured:true, user:j.data&&j.data[0], login};
}
async function twitchProfile(env){
  const tu=await twitchUser(env);
  if(!tu.configured) return {configured:false,message:"Missing TWITCH_CLIENT_ID or TWITCH_ACCESS_TOKEN"};
  if(!tu.user) return {configured:true, found:false, login:tu.login};
  let followers=0;
  try{
    const fr=await fetch(`https://api.twitch.tv/helix/channels/followers?broadcaster_id=${encodeURIComponent(tu.user.id)}`,{headers: await twitchHeaders(env)});
    const fj=await fr.json(); followers=fj.total||0;
  }catch(e){}
  return {configured:true, found:true, login:tu.login, userId:tu.user.id, displayName:tu.user.display_name, description:tu.user.description||"", profileImage:tu.user.profile_image_url||"", offlineImage:tu.user.offline_image_url||"", broadcasterType:tu.user.broadcaster_type||"", createdAt:tu.user.created_at||"", followers};
}
async function twitchChannelInfo(env,userId){
  if(!userId) return {};
  const r=await fetch(`https://api.twitch.tv/helix/channels?broadcaster_id=${encodeURIComponent(userId)}`,{headers: await twitchHeaders(env)});
  const j=await r.json(); return (j.data&&j.data[0])||{};
}
async function twitchVideos(env,userId){
  if(!userId) return [];
  const r=await fetch(`https://api.twitch.tv/helix/videos?user_id=${encodeURIComponent(userId)}&first=10&type=archive`,{headers: await twitchHeaders(env)});
  const j=await r.json(); return j.data||[];
}
async function twitchClips(env,userId){
  if(!userId) return [];
  const started=new Date(Date.now()-1000*60*60*24*30).toISOString();
  const r=await fetch(`https://api.twitch.tv/helix/clips?broadcaster_id=${encodeURIComponent(userId)}&first=10&started_at=${encodeURIComponent(started)}`,{headers: await twitchHeaders(env)});
  const j=await r.json(); return j.data||[];
}
async function fullTwitchPackage(env){
  const profile=await twitchProfile(env);
  if(!profile.configured||!profile.found) return profile;
  const live=await twitchLive(env);
  const channel=await twitchChannelInfo(env,profile.userId);
  const videos=await twitchVideos(env,profile.userId);
  const clips=await twitchClips(env,profile.userId);
  return {configured:true,found:true,profile,live,channel,videos,clips,lastUpdated:new Date().toISOString()};
}

async function twitchLive(env) {
  const clientId = env.TWITCH_CLIENT_ID;
  const token = env.TWITCH_ACCESS_TOKEN;
  const login = env.TWITCH_CHANNEL || "djfolsoe";
  if (!clientId || !token) {
    return { configured: false, live: false, message: "Missing TWITCH_CLIENT_ID or TWITCH_ACCESS_TOKEN" };
  }

  const userRes = await fetch(`https://api.twitch.tv/helix/users?login=${encodeURIComponent(login)}`, {
    headers: { "Client-ID": clientId, "Authorization": `Bearer ${token}` }
  });
  const userJson = await userRes.json();
  const user = userJson.data && userJson.data[0];
  if (!user) return { configured: true, live: false, message: "Channel not found", login };

  const streamRes = await fetch(`https://api.twitch.tv/helix/streams?user_id=${encodeURIComponent(user.id)}`, {
    headers: { "Client-ID": clientId, "Authorization": `Bearer ${token}` }
  });
  const streamJson = await streamRes.json();
  const stream = streamJson.data && streamJson.data[0];

  if (!stream) {
    return { configured: true, live: false, login, userId: user.id, viewers: 0, title: "", category: "" };
  }

  return {
    configured: true,
    live: true,
    login,
    userId: user.id,
    viewers: stream.viewer_count || 0,
    title: stream.title || "",
    category: stream.game_name || "",
    startedAt: stream.started_at || "",
    thumbnail: stream.thumbnail_url || ""
  };
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return okOptions();

    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";

    try {
      if (path === "/api/health") {
        return json({ ok: true, service: "DJ FOLSOE TV V812 Worker", time: new Date().toISOString() });
      }

      if (path === "/api/admin/validate") {
        if (!isAdmin(request, env)) return json({ ok: false, error: "Unauthorized" }, 401);
        return json({ ok: true, admin: true, service: "DJ FOLSOE TV V812 Admin" });
      }

      if (path === "/api/seed") {
        if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
        if (!isAdmin(request, env)) return json({ error: "Unauthorized" }, 401);
        const existing = await getCore(env);
        const requests = await getRequests(env);
        existing.requests = requests;
        const saved = await putCore(env, existing);
        return json({ ok: true, seeded: true, data: saved });
      }

      if (path === "/api/broadcast-core") {
        if (request.method === "GET") {
          const core = await getCore(env);
          const requests = await getRequests(env);
          core.requests = requests;
          return json(core);
        }
        if (request.method === "POST") {
          if (!isAdmin(request, env)) return json({ error: "Unauthorized" }, 401);
          const body = await request.json();
          const saved = await putCore(env, body);
          return json({ ok: true, data: saved });
        }
      }

      if (path === "/api/weekly-listening-chart") {
        const core = await getCore(env);
        if (request.method === "GET") return json(core.weeklyListeningChart || core.top20Chart || DEFAULT_DATA.top20Chart);
        if (request.method === "POST") {
          if (!isAdmin(request, env)) return json({ error: "Unauthorized" }, 401);
          const chart = await request.json();
          core.weeklyListeningChart = chart;
          core.top20Chart = chart;
          core.top20 = (chart.items || []).filter(x => x.artist || x.title).map(x => `${x.artist || ""} - ${x.title || ""}`.replace(/^ - /,"").replace(/ - $/,""));
          const saved = await putCore(env, core);
          return json({ ok: true, chart: saved.weeklyListeningChart });
        }
      }

      if (path === "/api/chart/calculate") {
        if (!isAdmin(request, env)) return json({ error: "Unauthorized" }, 401);
        const core = await getCore(env);
        const chart = core.weeklyListeningChart || core.top20Chart || DEFAULT_DATA.top20Chart;
        const weights = chart.method || { folsoeListening:45, danishCharts:20, edmTrend:15, spotify:15, viewerRequests:5 };
        chart.items = (chart.items || []).map((x, idx) => {
          const s = x.scores || {};
          x.points = Math.round(Object.keys(weights).reduce((sum,k)=>sum + (Number(s[k] || 0) * Number(weights[k] || 0)), 0));
          return x;
        }).sort((a,b)=>(b.points||0)-(a.points||0)).map((x, idx) => {
          x.rank = idx + 1;
          const lw = Number(x.lastWeek);
          if (String(x.lastWeek).toUpperCase() === "NEW" || !x.lastWeek) x.status = "NEW";
          else if (!isNaN(lw)) x.status = lw > x.rank ? "UP" : lw < x.rank ? "DOWN" : "SAME";
          x.weeks = String(x.status).toUpperCase() === "NEW" ? 1 : Number(x.weeks || 0) + 1;
          x.peak = Math.min(Number(x.peak || x.rank), x.rank);
          return x;
        });
        core.weeklyListeningChart = chart;
        core.top20Chart = chart;
        const saved = await putCore(env, core);
        return json({ ok:true, chart:saved.weeklyListeningChart });
      }

      if (path === "/api/chart") {
        const core = await getCore(env);
        if (request.method === "GET") return json(core.top20Chart || DEFAULT_DATA.top20Chart);
        if (request.method === "POST") {
          if (!isAdmin(request, env)) return json({ error: "Unauthorized" }, 401);
          const chart = await request.json();
          core.top20Chart = chart;
          core.top20 = (chart.items || []).filter(x => x.artist || x.title).map(x => `${x.artist || ""} - ${x.title || ""}`.replace(/^ - /,"").replace(/ - $/,""));
          const saved = await putCore(env, core);
          return json({ ok: true, chart: saved.top20Chart });
        }
      }

      if (path === "/api/requests") {
        if (request.method === "GET") return json(await getRequests(env));
        if (request.method === "POST") {
          const body = await request.json();
          const requests = await getRequests(env);
          const item = {
            id: crypto.randomUUID(),
            name: String(body.name || "Viewer").slice(0, 80),
            song: String(body.song || "").slice(0, 200),
            status: body.status || "new",
            createdAt: new Date().toISOString()
          };
          if (!item.song) return json({ error: "Missing song" }, 400);
          requests.unshift(item);
          await putRequests(env, requests.slice(0, 500));
          return json({ ok: true, request: item });
        }
        if (request.method === "DELETE") {
          if (!isAdmin(request, env)) return json({ error: "Unauthorized" }, 401);
          await putRequests(env, []);
          return json({ ok: true, requests: [] });
        }
      }

      if (path === "/api/twitch-profile") {
        const profile = await twitchProfile(env);
        return json(profile);
      }

      if (path === "/api/twitch-full") {
        const pkg = await fullTwitchPackage(env);
        const core = await getCore(env);
        core.twitchProfile = pkg.profile || pkg;
        core.twitchLive = pkg.live || {};
        core.twitchChannel = pkg.channel || {};
        core.twitchVideos = pkg.videos || [];
        core.twitchClips = pkg.clips || [];
        core.broadcastCore = core.broadcastCore || {};
        core.broadcastCore.lastTwitchSync = new Date().toISOString();
        await putCore(env, core);
        return json(pkg);
      }

      if (path === "/api/twitch-live") {
        const live = await twitchLive(env);
        const core = await getCore(env);
        core.station = core.station || {};
        core.station.live = live.live;
        core.station.viewers = live.viewers || 0;
        core.station.streamTitle = live.title || "";
        core.station.category = live.category || "";
        core.station.startedAt = live.startedAt || "";
        await putCore(env, core);
        return json(live);
      }

      return json({ error: "Not found", path }, 404);
    } catch (err) {
      return json({ error: err.message || "Worker error" }, 500);
    }
  }
};
