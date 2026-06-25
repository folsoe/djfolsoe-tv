# V601 – GitHub Save Engine setup

## 1. GitHub token
Create a fine-grained GitHub token:
- Repository: your folsoetv.dk / djfolsoe-tv repository
- Permissions: Contents = Read and Write
- Copy token once

## 2. Cloudflare Worker
Create a new Worker and paste `workers/github-save-worker.js`.

Set variables:
- GITHUB_OWNER = your GitHub username, e.g. folsoe
- GITHUB_REPO = your repository name
- GITHUB_BRANCH = main

Set secrets:
- GITHUB_TOKEN = your GitHub token
- CMS_PASSWORD = your own admin password

## 3. Admin
Open:
https://folsoetv.dk/admin/

Fill:
- Worker URL
- Admin password
- Repository path: assets/data/cms.json
- Branch: main

Click:
- Gem indstillinger lokalt
- Gem direkte til GitHub

## 4. Important
GitHub Pages may take 30-90 seconds to show the new data after save.
