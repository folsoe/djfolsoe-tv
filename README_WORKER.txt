name = "djfolsoe-tv-api"
main = "worker.js"
compatibility_date = "2026-06-01"

[[kv_namespaces]]
binding = "DJF_DATA"
id = "REPLACE_WITH_KV_NAMESPACE_ID"

# Set secrets with:
# wrangler secret put ADMIN_TOKEN
# wrangler secret put TWITCH_CLIENT_ID
# wrangler secret put TWITCH_ACCESS_TOKEN
# wrangler secret put TWITCH_CHANNEL
