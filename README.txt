DJ FOLSOE NETWORK V816 BROADCAST OS

Dette er en ren stabil rebuild, lavet for at få alt til at virke igen:
- Hjemmeside
- Admin kontrolcenter
- Theme Engine
- Top/bund ticker til overlay
- Forside nyheder
- Shows editor
- Top 20 editor
- Twitch profil/beskrivelse/live status via Worker
- Overlay API med fallback, så boksene ikke hænger på Loading

Deploy:
1. Upload hele pakken til GitHub repo root.
2. Deploy cloudflare-worker/worker.js i Cloudflare Worker.
3. Tjek Cloudflare bindings/secrets:
   - ADMIN_TOKEN
   - DJF_DATA KV binding
   - TWITCH_CLIENT_ID
   - TWITCH_ACCESS_TOKEN
   - TWITCH_CHANNEL=djfolsoe
4. Åbn admin:
   https://folsoetv.dk/admin.html?v=816
5. Ctrl+F5
6. Indsæt ADMIN_TOKEN og skift tema.
7. Åbn forside:
   https://folsoetv.dk/?v=816

StreamElements:
- Brug filerne i streamelements-v170.3-overlay:
  HTML.txt
  CSS.txt
  JS.txt
