DJ FOLSOE NETWORK V816.20.1 — FULL RESTORE LOCKED

Denne pakke er baseret på den uploadede V816.20.1 Community Wall Patch,
som brugeren bekræftede virkede før dagens ændringer.

FORMÅL:
- Rul tilbage til den version, der virkede.
- Stop V818/V816.21/V816.22 eksperimenterne.
- Behold systemet samlet: hjemmeside, admin, worker, overlay og data.

UPLOAD TIL GITHUB / HJEMMESIDE:
- index.html
- admin.html
- assets/
- api/
- site-data.json
- broadcast-core.json
- robots.txt
- sitemap.xml
- eventuelle øvrige filer i roden

UPLOAD TIL CLOUDFLARE WORKER:
- cloudflare-worker/worker.js

STREAM ELEMENTS:
Brug filerne i:
- streamelements-v170.3-overlay/HTML.txt
- streamelements-v170.3-overlay/CSS.txt
- streamelements-v170.3-overlay/JS.txt

TEST EFTER UPLOAD:
1. https://folsoetv.dk/?restore=816201
2. https://folsoetv.dk/admin.html?restore=816201
3. https://djfolsoe-tv-api.sunefolsoe.workers.dev/api/theme
4. https://djfolsoe-tv-api.sunefolsoe.workers.dev/api/overlay/v170-state

VIGTIGT:
- Upload IKKE V818 ovenpå denne.
- Upload IKKE V816.21 / V816.22 ovenpå denne.
- Når denne virker, kalder vi den RESTORE BASE.
- Næste ændringer skal bygges som meget små patches ovenpå denne base.
