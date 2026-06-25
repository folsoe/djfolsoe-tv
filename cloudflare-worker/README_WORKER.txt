DJ FOLSOE TV V808 CLOUDFLARE WORKER

1. Install Wrangler:
   npm install -g wrangler

2. Login:
   wrangler login

3. Create KV namespace:
   wrangler kv namespace create DJF_DATA

4. Copy the returned id into wrangler.toml:
   [[kv_namespaces]]
   binding = "DJF_DATA"
   id = "..."

5. Add secrets:
   wrangler secret put ADMIN_TOKEN
   wrangler secret put TWITCH_CLIENT_ID
   wrangler secret put TWITCH_ACCESS_TOKEN
   wrangler secret put TWITCH_CHANNEL

6. Deploy:
   wrangler deploy

7. In Cloudflare, add route/subdomain:
   api.folsoetv.dk/* -> djfolsoe-tv-api

Frontend config:
Open assets/js/config.js and set:
window.DJF_API_BASE = "https://api.folsoetv.dk";
