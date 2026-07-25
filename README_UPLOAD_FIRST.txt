# DJ FOLSOE WEBSITE — EMERGENCY RESTORE

Upload the CONTENTS of this folder to the root of the GitHub repository used by folsoetv.dk.

Required structure:

- index.html
- 404.html
- robots.txt
- sitemap.xml
- assets/css/site.css
- assets/js/site.js
- .github/workflows/music-research-v2.yml

Important:
1. Do not paste workflow YAML into index.html.
2. The workflow must only be stored in `.github/workflows/music-research-v2.yml`.
3. In GitHub Pages settings, publish from the repository root unless your existing setup explicitly uses `/docs`.
4. After uploading, open `https://folsoetv.dk/?restore=20260725` and press Ctrl+F5.
5. The website attempts to load live data from:
   https://djfolsoe-tv-api.sunefolsoe.workers.dev

The Music Research workflow requires the existing `music/` folder, package.json and package-lock.json.
If those files are missing, the website still works, but the workflow will fail until the music project is restored.
