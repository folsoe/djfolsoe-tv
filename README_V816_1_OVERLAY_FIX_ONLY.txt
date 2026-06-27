DJ FOLSOE NETWORK V816.1 OVERLAY FIX ONLY

Denne pakke rører IKKE ved hjemmesiden og admin-panelet.

Den retter kun StreamElements overlayet:
- Alle bokse får fallback + API data.
- Boksene er placeret som aftalt:
  Venstre: MUSIC øverst, LIVE STATUS nederst.
  Højre: COMMUNITY øverst, PROGRAM nederst.
  Bund: TOP20, NEWS, GOALS.
  Midten holdes fri til dig/camera.
- Top ticker fortsætter med at virke.
- Theme skifter farver i overlayet.
- Ingen boks skal blive hængende på Loading.

Opdater kun i StreamElements:
1. Slet alt i HTML/CSS/JS i overlay-widgetten.
2. Indsæt:
   streamelements-v170.3-overlay/HTML.txt
   streamelements-v170.3-overlay/CSS.txt
   streamelements-v170.3-overlay/JS.txt
3. Save.
4. Refresh OBS browser source.

Cloudflare-worker/worker.js kan deployes, men er ikke nødvendig hvis admin/hjemmeside allerede virker.
