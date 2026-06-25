// V600 placeholder Cloudflare Worker for Twitch data.
// Deploy later to Cloudflare Workers and connect frontend to this endpoint.
export default {
  async fetch(request, env) {
    return Response.json({
      channel: "djfolsoe",
      live: false,
      viewers: 0,
      title: "DJ FOLSOE TV",
      description: "Twitch API connection placeholder"
    }, { headers: { "Access-Control-Allow-Origin": "*" }});
  }
};