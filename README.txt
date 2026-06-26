DJ FOLSOE V813.2 FRONTEND BINDING FIX

Problem:
Data/JSON var korrekt, men forsiden kunne stadig vise hardcoded gammel tekst.

Fix:
- Ny fil: assets/js/frontend-binding.js
- Forsiden binder nu hero ribbon, titel og beskrivelse direkte fra data.json/site-data.json.
- Safety net fjerner gammel tekst fra hele siden efter render.
- Language switch kalder binding igen.
- Cache-busting: ?v=8132fb

Korrekt offentlig branding:
BROADCAST CLOUD · DJ FOLSOE ON TWITCH

DA:
DJ FOLSOE er en dansk musikstreamer på Twitch.tv med live DJ-shows, musikønsker, hitlister og et stærkt musikfællesskab.

EN:
DJ FOLSOE is a Danish music streamer on Twitch.tv with live DJ shows, song requests, chart countdowns and a strong music community.

DE:
DJ FOLSOE ist ein dänischer Musikstreamer auf Twitch.tv mit Live-DJ-Shows, Musikwünschen, Charts und einer starken Musik-Community.

Upload:
1. Upload hele pakken til GitHub.
2. Deploy cloudflare-worker/worker.js i Cloudflare.
3. Åbn https://folsoetv.dk/?v=8132fb
4. Tryk Ctrl + F5.
5. Test i browser console:
   window.DJF_REBIND_FRONTEND()
