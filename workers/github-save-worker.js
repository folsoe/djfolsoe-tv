// DJ FOLSOE Broadcast CMS V601 FINAL - GitHub Save Engine
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
      if (!env.CMS_PASSWORD || password !== env.CMS_PASSWORD) return json({ error: "Unauthorized" }, 401);

      const owner = env.GITHUB_OWNER || "folsoe";
      const repo = env.GITHUB_REPO || "djfolsoe-tv";
      const token = env.GITHUB_TOKEN;
      const defaultBranch = env.GITHUB_BRANCH || "main";
      if (!token) return json({ error: "Missing GITHUB_TOKEN secret" }, 500);

      if (request.method === "GET") {
        const url = new URL(request.url);
        const path = url.searchParams.get("path") || "assets/data/cms.json";
        const branch = url.searchParams.get("branch") || defaultBranch;
        const file = await getFile({ owner, repo, path, branch, token });
        return json({ ok: true, path, branch, sha: file.sha, content: JSON.parse(decodeBase64(file.content)) });
      }

      if (request.method === "POST") {
        const body = await request.json();
        const path = body.path || "assets/data/cms.json";
        const branch = body.branch || defaultBranch;
        const message = body.message || "CMS update from DJ FOLSOE Broadcast CMS V601 FINAL";
        if (!body.content) return json({ error: "Missing content" }, 400);

        const oldFile = await getFile({ owner, repo, path, branch, token });
        const oldText = decodeBase64(oldFile.content);
        const newText = JSON.stringify(body.content, null, 2) + "\n";

        try {
          const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
          await putFile({ owner, repo, path: "assets/data/backups/cms-" + timestamp + ".json", branch, token, message: "Backup cms.json", content: oldText });
        } catch (e) {}

        const updated = await putFile({ owner, repo, path, branch, token, message, content: newText, sha: oldFile.sha });
        return json({ ok: true, saved: true, path, branch, commitSha: updated.commit && updated.commit.sha });
      }

      return json({ error: "Method not allowed" }, 405);
    } catch (e) {
      return json({ error: e.message || String(e) }, 500);
    }
  }
};

async function getFile({ owner, repo, path, branch, token }) {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encPath(path)}?ref=${encodeURIComponent(branch)}`;
  const res = await fetch(url, { headers: gh(token) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "GitHub get file failed");
  return data;
}
async function putFile({ owner, repo, path, branch, token, message, content, sha }) {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encPath(path)}`;
  const body = { message, content: b64(content), branch };
  if (sha) body.sha = sha;
  const res = await fetch(url, { method: "PUT", headers: { ...gh(token), "content-type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "GitHub put file failed");
  return data;
}
function gh(token){ return { "Authorization": `Bearer ${token}`, "Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "DJ-FOLSOE-Broadcast-CMS" }; }
function encPath(path){ return path.split("/").map(encodeURIComponent).join("/"); }
function b64(str){ const bytes = new TextEncoder().encode(str); let bin = ""; bytes.forEach(b => bin += String.fromCharCode(b)); return btoa(bin); }
function decodeBase64(str){ const bin = atob(String(str || "").replace(/\n/g, "")); return new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0))); }
function json(obj, status=200){ return new Response(JSON.stringify(obj, null, 2), { status, headers: { ...CORS, "content-type": "application/json; charset=utf-8" } }); }
