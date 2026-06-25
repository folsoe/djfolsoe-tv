// DJ FOLSOE Broadcast CMS V601 - GitHub Save Engine
// Deploy as Cloudflare Worker.
// Required secrets / variables:
// GITHUB_TOKEN: GitHub fine-grained token with Contents: Read and Write for the repository
// CMS_PASSWORD: password you type in /admin/
// GITHUB_OWNER: GitHub owner/user, e.g. folsoe
// GITHUB_REPO: repository name, e.g. djfolsoe-tv
// GITHUB_BRANCH: optional, default main
//
// Endpoints:
// GET  /?path=assets/data/cms.json&branch=main
// POST /  body: { path, branch, content, message }

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "content-type,x-cms-password"
};

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });

    try {
      const password = request.headers.get("x-cms-password") || "";
      if (!env.CMS_PASSWORD || password !== env.CMS_PASSWORD) {
        return json({ error: "Unauthorized" }, 401);
      }

      const owner = env.GITHUB_OWNER;
      const repo = env.GITHUB_REPO;
      const token = env.GITHUB_TOKEN;
      const defaultBranch = env.GITHUB_BRANCH || "main";

      if (!owner || !repo || !token) {
        return json({ error: "Missing Worker secrets: GITHUB_OWNER, GITHUB_REPO or GITHUB_TOKEN" }, 500);
      }

      if (request.method === "GET") {
        const url = new URL(request.url);
        const path = url.searchParams.get("path") || "assets/data/cms.json";
        const branch = url.searchParams.get("branch") || defaultBranch;
        const file = await getFile({ owner, repo, path, branch, token });
        const text = decodeBase64(file.content);
        return json({ path, branch, sha: file.sha, content: JSON.parse(text) });
      }

      if (request.method === "POST") {
        const body = await request.json();
        const path = body.path || "assets/data/cms.json";
        const branch = body.branch || defaultBranch;
        const message = body.message || "CMS update from DJ FOLSOE Broadcast CMS";
        const contentObj = body.content;

        if (!contentObj) return json({ error: "Missing content" }, 400);

        const oldFile = await getFile({ owner, repo, path, branch, token });
        const newText = JSON.stringify(contentObj, null, 2) + "\n";

        // Backup old version first. If backup exists with same timestamp edge-case, GitHub returns error; main save still continues.
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const backupPath = "assets/data/backups/cms-" + timestamp + ".json";
        try {
          await putFile({
            owner, repo, path: backupPath, branch, token,
            message: "Backup cms.json before CMS update",
            content: decodeBase64(oldFile.content)
          });
        } catch (e) {}

        const updated = await putFile({
          owner, repo, path, branch, token,
          message, content: newText, sha: oldFile.sha
        });

        return json({
          ok: true,
          path,
          branch,
          commitSha: updated.commit && updated.commit.sha,
          contentSha: updated.content && updated.content.sha
        });
      }

      return json({ error: "Method not allowed" }, 405);
    } catch (e) {
      return json({ error: e.message || String(e) }, 500);
    }
  }
};

async function getFile({ owner, repo, path, branch, token }) {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponentPath(path)}?ref=${encodeURIComponent(branch)}`;
  const res = await fetch(url, { headers: ghHeaders(token) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "GitHub get file failed");
  return data;
}

async function putFile({ owner, repo, path, branch, token, message, content, sha }) {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponentPath(path)}`;
  const body = { message, content: encodeBase64(content), branch };
  if (sha) body.sha = sha;

  const res = await fetch(url, {
    method: "PUT",
    headers: { ...ghHeaders(token), "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "GitHub put file failed");
  return data;
}

function ghHeaders(token) {
  return {
    "Authorization": `Bearer ${token}`,
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "DJ-FOLSOE-Broadcast-CMS"
  };
}

function encodeURIComponentPath(path) {
  return path.split("/").map(encodeURIComponent).join("/");
}

function encodeBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  bytes.forEach(b => binary += String.fromCharCode(b));
  return btoa(binary);
}

function decodeBase64(str) {
  const clean = String(str || "").replace(/\n/g, "");
  const binary = atob(clean);
  const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj, null, 2), {
    status,
    headers: { ...CORS, "content-type": "application/json; charset=utf-8" }
  });
}