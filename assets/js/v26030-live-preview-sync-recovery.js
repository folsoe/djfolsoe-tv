/* DJ FOLSOE V26030 — LIVE PREVIEW, SYNC & RECOVERY
   Admin-only additive layer on V26020.
   Does not change website, overlay, Worker data model or existing save handlers. */
(() => {
  "use strict";

  const BUILD = "V26030";
  const API = "https://djfolsoe-tv-api.sunefolsoe.workers.dev";
  const FORM_SNAPSHOT_KEY = "djf_v26030_form_snapshot";
  const REMOTE_SNAPSHOT_KEY = "djf_v26030_remote_snapshot";
  const $ = id => document.getElementById(id);
  const clean = value => String(value ?? "").trim();
  let lastRevision = "";
  let lastCheckedAt = null;
  let checking = false;

  function toast(message, error = false) {
    const node = $("toast");
    if (!node) return;
    node.textContent = message;
    node.className = `toast ${error ? "error" : "success"} show`;
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => node.classList.remove("show"), 3400);
  }

  function addStyles() {
    if ($("v26030Styles")) return;
    const style = document.createElement("style");
    style.id = "v26030Styles";
    style.textContent = `
      .v26030Panel{margin:0 0 18px;border:1px solid rgba(126,89,255,.28);border-radius:14px;background:linear-gradient(120deg,rgba(126,89,255,.08),rgba(98,230,255,.055));overflow:hidden}
      .v26030Head{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:13px 15px;border-bottom:1px solid rgba(255,255,255,.08);flex-wrap:wrap}
      .v26030Head strong{display:block}.v26030Head small{display:block;color:#aebbd1;margin-top:3px}
      .v26030Actions{display:flex;gap:8px;flex-wrap:wrap}.v26030Actions button{min-height:36px}
      .v26030StatusGrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1px;background:rgba(255,255,255,.08)}
      .v26030Status{padding:12px 14px;background:#0c1220;min-width:0}.v26030Status span{display:block;color:#8f9bb0;font-size:11px;letter-spacing:.08em}.v26030Status b{display:block;margin-top:5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.v26030Status b.ok{color:#58e3a0}.v26030Status b.warn{color:#ffd164}.v26030Status b.bad{color:#ff6680}
      .v26030Preview{padding:14px;display:none}.v26030Preview.open{display:block}.v26030PreviewToolbar{display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:10px;flex-wrap:wrap}.v26030PreviewToolbar div{display:flex;gap:7px}.v26030FrameWrap{height:560px;overflow:auto;border:1px solid rgba(255,255,255,.12);border-radius:12px;background:#05070d;padding:10px}.v26030Frame{display:block;width:100%;height:100%;min-height:520px;border:0;border-radius:8px;background:#fff;margin:auto;transition:width .2s ease}.v26030Frame.mobile{width:390px}.v26030Frame.tablet{width:820px}
      .v26030Recovery{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 15px;border-top:1px solid rgba(255,255,255,.08);flex-wrap:wrap}.v26030Recovery p{margin:0;color:#aebbd1;font-size:12px}.v26030Recovery p b{color:#fff}
      @media(max-width:1000px){.v26030StatusGrid{grid-template-columns:repeat(2,minmax(0,1fr))}.v26030FrameWrap{height:480px}}
    `;
    document.head.appendChild(style);
  }

  function fieldValue(node) {
    if (node.type === "checkbox" || node.type === "radio") return node.checked;
    return node.value;
  }

  function collectFormSnapshot() {
    const fields = [...document.querySelectorAll('#cmsScreens input[id],#cmsScreens textarea[id],#cmsScreens select[id]')]
      .filter(node => !node.closest('[data-v26020-disabled="true"]'))
      .map(node => ({ id: node.id, type: node.type || node.tagName.toLowerCase(), value: fieldValue(node) }));
    return { build: BUILD, savedAt: new Date().toISOString(), revision: lastRevision, fields };
  }

  function saveFormSnapshot(reason = "manual") {
    const snapshot = collectFormSnapshot();
    snapshot.reason = reason;
    localStorage.setItem(FORM_SNAPSHOT_KEY, JSON.stringify(snapshot));
    updateRecoveryLabel();
    return snapshot;
  }

  function readSnapshot(key) {
    try { return JSON.parse(localStorage.getItem(key) || "null"); }
    catch (_) { return null; }
  }

  function restoreFormSnapshot() {
    const snapshot = readSnapshot(FORM_SNAPSHOT_KEY);
    if (!snapshot?.fields?.length) return toast("No recovery snapshot is available.", true);
    let applied = 0;
    snapshot.fields.forEach(item => {
      const node = $(item.id);
      if (!node) return;
      if (node.type === "checkbox" || node.type === "radio") node.checked = Boolean(item.value);
      else node.value = item.value ?? "";
      node.dispatchEvent(new Event("input", { bubbles: true }));
      node.dispatchEvent(new Event("change", { bubbles: true }));
      applied += 1;
    });
    toast(`Recovered ${applied} admin fields. Nothing is live until you press Save.`);
  }

  function updateRecoveryLabel() {
    const node = $("v26030RecoveryText");
    if (!node) return;
    const snapshot = readSnapshot(FORM_SNAPSHOT_KEY);
    node.innerHTML = snapshot?.savedAt
      ? `Recovery snapshot: <b>${new Date(snapshot.savedAt).toLocaleString()}</b>`
      : "Recovery snapshot: <b>none yet</b>";
  }

  async function fetchJson(url, timeout = 8000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, { cache: "no-store", headers: { Accept: "application/json" }, signal: controller.signal });
      const body = await response.json().catch(() => null);
      return { ok: response.ok, status: response.status, body };
    } catch (error) {
      return { ok: false, status: 0, error: clean(error?.message || error) };
    } finally { clearTimeout(timer); }
  }

  function setStatus(id, text, state = "") {
    const node = $(id);
    if (!node) return;
    node.textContent = text;
    node.className = state;
  }

  async function checkSync(showToast = false) {
    if (checking) return;
    checking = true;
    setStatus("v26030Api", "Checking…", "warn");
    setStatus("v26030Broadcast", "Checking…", "warn");
    try {
      const [health, broadcast] = await Promise.all([
        fetchJson(`${API}/api/health?v=${Date.now()}`),
        fetchJson(`${API}/api/broadcast?v=${Date.now()}`)
      ]);
      setStatus("v26030Api", health.ok ? "ONLINE" : `ERROR ${health.status || "NETWORK"}`, health.ok ? "ok" : "bad");
      if (broadcast.ok) {
        const payload = broadcast.body || {};
        const core = payload.data || payload.core || payload;
        const revision = clean(core.revision || core.updatedAt || payload.updatedAt || "unknown");
        const theme = clean(core.theme?.id || core.theme || core.activeTheme || "not set");
        lastRevision = revision;
        lastCheckedAt = new Date();
        setStatus("v26030Broadcast", revision, "ok");
        setStatus("v26030Theme", theme.toUpperCase(), theme ? "ok" : "warn");
        setStatus("v26030Checked", lastCheckedAt.toLocaleTimeString(), "ok");
        localStorage.setItem(REMOTE_SNAPSHOT_KEY, JSON.stringify({ savedAt: new Date().toISOString(), revision, core }));
        const old = $("v26020Revision");
        if (old) old.textContent = `Revision: ${revision}`;
        if (showToast) toast("Live CMS state checked successfully.");
      } else {
        setStatus("v26030Broadcast", `ERROR ${broadcast.status || "NETWORK"}`, "bad");
        setStatus("v26030Theme", "UNCHANGED", "warn");
        setStatus("v26030Checked", "FAILED", "bad");
        if (showToast) toast("Could not read live CMS data. Existing site and overlay remain unchanged.", true);
      }
    } finally { checking = false; }
  }

  function installPublishProtection() {
    ["saveHomepage", "saveShows", "saveTickers", "saveChart"].forEach(id => {
      const button = $(id);
      if (!button || button.dataset.v26030Protected) return;
      button.dataset.v26030Protected = "true";
      button.addEventListener("click", () => {
        saveFormSnapshot(`before ${id}`);
        setStatus("v26030Broadcast", "Publishing…", "warn");
        setTimeout(() => checkSync(false), 1200);
        setTimeout(() => checkSync(false), 3200);
      }, true);
    });
  }

  function setPreviewMode(mode) {
    const frame = $("v26030Frame");
    if (!frame) return;
    frame.classList.remove("mobile", "tablet");
    if (mode === "mobile" || mode === "tablet") frame.classList.add(mode);
  }

  function ensurePanel() {
    if ($("v26030Panel")) return;
    const anchor = $("v26020DraftNotice") || $("v26020Bar");
    if (!anchor) return;
    const panel = document.createElement("section");
    panel.id = "v26030Panel";
    panel.className = "v26030Panel";
    panel.innerHTML = `
      <div class="v26030Head">
        <div><strong>V26030 · Live Preview, Sync & Recovery</strong><small>Read-only checks and safe recovery. Website and overlay code are untouched.</small></div>
        <div class="v26030Actions"><button id="v26030Check" class="secondary">Check live sync</button><button id="v26030TogglePreview" class="secondary">Open preview</button><button id="v26030Snapshot" class="secondary">Create recovery point</button></div>
      </div>
      <div class="v26030StatusGrid">
        <div class="v26030Status"><span>WORKER API</span><b id="v26030Api">WAITING</b></div>
        <div class="v26030Status"><span>LIVE REVISION</span><b id="v26030Broadcast">WAITING</b></div>
        <div class="v26030Status"><span>ACTIVE THEME</span><b id="v26030Theme">WAITING</b></div>
        <div class="v26030Status"><span>LAST CHECK</span><b id="v26030Checked">WAITING</b></div>
      </div>
      <div id="v26030Preview" class="v26030Preview">
        <div class="v26030PreviewToolbar"><strong>Live website preview</strong><div><button data-preview-mode="desktop" class="secondary">Desktop</button><button data-preview-mode="tablet" class="secondary">Tablet</button><button data-preview-mode="mobile" class="secondary">Mobile</button><button id="v26030Reload" class="secondary">Reload</button></div></div>
        <div class="v26030FrameWrap"><iframe id="v26030Frame" class="v26030Frame" src="/" title="Live website preview"></iframe></div>
      </div>
      <div class="v26030Recovery"><p id="v26030RecoveryText">Recovery snapshot: <b>none yet</b></p><div class="v26030Actions"><button id="v26030Restore" class="secondary">Restore form snapshot</button><button id="v26030Clear" class="secondary">Delete snapshot</button></div></div>`;
    anchor.after(panel);

    $("v26030Check").onclick = () => checkSync(true);
    $("v26030TogglePreview").onclick = () => {
      const preview = $("v26030Preview");
      const open = preview.classList.toggle("open");
      $("v26030TogglePreview").textContent = open ? "Close preview" : "Open preview";
      if (open) $("v26030Frame").src = `/?cmsPreview=${Date.now()}`;
    };
    $("v26030Snapshot").onclick = () => { saveFormSnapshot("manual"); toast("Recovery point created locally."); };
    $("v26030Restore").onclick = restoreFormSnapshot;
    $("v26030Clear").onclick = () => { localStorage.removeItem(FORM_SNAPSHOT_KEY); updateRecoveryLabel(); toast("Recovery snapshot deleted."); };
    $("v26030Reload").onclick = () => { $("v26030Frame").src = `/?cmsPreview=${Date.now()}`; };
    panel.querySelectorAll("[data-preview-mode]").forEach(button => button.onclick = () => setPreviewMode(button.dataset.previewMode));
    updateRecoveryLabel();
  }

  function boot() {
    addStyles();
    ensurePanel();
    installPublishProtection();
    const observer = new MutationObserver(() => { ensurePanel(); installPublishProtection(); });
    observer.observe(document.body, { childList: true, subtree: true });
    checkSync(false);
    setInterval(() => checkSync(false), 45000);
    window.DJF_V26030_SYNC_RECOVERY = {
      build: BUILD,
      check: () => checkSync(true),
      snapshot: () => saveFormSnapshot("api"),
      restore: restoreFormSnapshot,
      status: () => ({ build: BUILD, revision: lastRevision, lastCheckedAt })
    };
    console.info("DJ FOLSOE V26030 Live Preview, Sync & Recovery ready");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
