DJ FOLSOE V813.4 V170.3 BROADCAST INTEGRATION

Kobler V813.3 STABLE sammen med V170.3 Broadcast Revolution StreamElements overlay.

Nyt:
- Worker endpoint: /api/overlay/v170-state
- StreamElements package i mappen: streamelements-v170.3-overlay/
- Admin panel til overlay API
- 4 footer bokse: Live Status, Program, Top 20, Community
- Låst regel: kun ét DJ FOLSOE LIVE logo i venstre hjørne

Dataflow:
Admin → Cloudflare KV → /api/overlay/v170-state → StreamElements → OBS

Deploy:
1. Upload hele pakken til GitHub
2. Deploy cloudflare-worker/worker.js i Cloudflare
3. Test https://djfolsoe-tv-api.sunefolsoe.workers.dev/api/overlay/v170-state
4. Kopiér HTML/CSS/JS fra streamelements-v170.3-overlay ind i StreamElements Custom Widget
