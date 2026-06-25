// Cloudflare Worker placeholder for future Twitch integration.
// Add TWITCH_CLIENT_ID and TWITCH_APP_TOKEN as environment variables.
// This is not active on GitHub Pages until deployed to Cloudflare Workers.
export default {
  async fetch(request, env) {
    const channel = "djfolsoe";
    return Response.json({
      channel,
      live: false,
      viewers: 0,
      title: "DJ FOLSOE TV",
      description: "Connect Twitch API here in V502."
    }, { headers: { "Access-Control-Allow-Origin": "*" } });
  }
};