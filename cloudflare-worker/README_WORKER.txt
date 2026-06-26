DJ FOLSOE V809 CLOUDFLARE WORKER

Du har allerede:
- Worker deployet
- /api/health virker
- KV namespace DJF_DATA oprettet
- KV binding DJF_DATA sat på Workeren
- ADMIN_TOKEN og TWITCH_CHANNEL som secrets

V809 endpoint check:
https://djfolsoe-tv-api.sunefolsoe.workers.dev/api/health
https://djfolsoe-tv-api.sunefolsoe.workers.dev/api/broadcast-core
https://djfolsoe-tv-api.sunefolsoe.workers.dev/api/chart
https://djfolsoe-tv-api.sunefolsoe.workers.dev/api/requests

Admin validering:
GET /api/admin/validate
Header:
x-admin-token: DIN_ADMIN_TOKEN

Frontend:
assets/js/config.js er sat til:
https://djfolsoe-tv-api.sunefolsoe.workers.dev

Når du senere laver api.folsoetv.dk, ændres config.js til:
window.DJF_API_BASE = "https://api.folsoetv.dk";

Secrets:
ADMIN_TOKEN
TWITCH_CHANNEL
TWITCH_CLIENT_ID
TWITCH_ACCESS_TOKEN
