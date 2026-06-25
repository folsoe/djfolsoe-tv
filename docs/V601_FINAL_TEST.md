V601 FINAL TEST

Cloudflare:
1. worker.js skal være workers/github-save-worker.js
2. Deploy
3. Variables:
   GITHUB_OWNER = folsoe
   GITHUB_REPO = djfolsoe-tv
   GITHUB_BRANCH = main
4. Secrets:
   GITHUB_TOKEN
   CMS_PASSWORD

CMS:
1. Åbn https://folsoetv.dk/admin/
2. Worker URL: https://djfolsoe-cms-save.sunefolsoe.workers.dev
3. Password: din CMS_PASSWORD
4. Path: assets/data/cms.json
5. Branch: main
6. Klik Hent fra GitHub
7. Ret et felt
8. Klik Gem direkte til GitHub
