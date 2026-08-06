/* DJ FOLSOE V26020 — CLICK CMS MANAGEMENT
   Additive admin-only layer built on the working V26010 foundation.
   Does not change website, overlay, Worker endpoints or visual-cms.js. */
(() => {
  "use strict";

  const BUILD = "V26020";
  const API = "https://djfolsoe-tv-api.sunefolsoe.workers.dev";
  const ALLOWED = new Set(["dashboard", "homepage", "shows", "theme", "schedule", "charts"]);
  const DRAFT_KEY = "djf_v26020_click_cms_draft";
  const SNAPSHOT_KEY = "djf_v26020_last_published_snapshot";
  let dirty = false;
  let draftTimer = 0;
  let lastRemoteRevision = "";

  const $ = id => document.getElementById(id);
  const clean = value => String(value ?? "").trim();

  function toast(message, error = false) {
    const node = $("toast");
    if (!node) return;
    node.textContent = message;
    node.className = `toast ${error ? "error" : "success"} show`;
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => node.classList.remove("show"), 3200);
  }

  function addStyles() {
    if ($("v26020Styles")) return;
    const style = document.createElement("style");
    style.id = "v26020Styles";
    style.textContent = `
      [data-v26020-disabled="true"]{display:none!important}
      .v26020Bar{margin:14px 0 18px;padding:14px 16px;border:1px solid rgba(98,230,255,.28);border-radius:14px;background:linear-gradient(110deg,rgba(98,230,255,.08),rgba(126,89,255,.07));display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap}
      .v26020BarCopy{display:flex;align-items:center;gap:12px;min-width:260px}.v26020BarCopy i{width:38px;height:38px;display:grid;place-items:center;border-radius:10px;background:#62e6ff;color:#06121a;font-style:normal;font-weight:900}.v26020BarCopy strong{display:block}.v26020BarCopy span{display:block;color:#aebbd1;font-size:12px;margin-top:3px}
      .v26020Actions{display:flex;gap:8px;flex-wrap:wrap}.v26020Actions button{min-height:38px}
      .v26020Status{display:flex;gap:14px;align-items:center;font-size:12px;color:#aebbd1}.v26020Status b{color:#fff}.v26020Dot{width:9px;height:9px;border-radius:50%;background:#6d778a;box-shadow:0 0 0 3px rgba(109,119,138,.14)}.v26020Dot.dirty{background:#ffc84a;box-shadow:0 0 0 3px rgba(255,200,74,.14)}.v26020Dot.saved{background:#4fe39a;box-shadow:0 0 0 3px rgba(79,227,154,.14)}
      .v26020DraftNotice{margin:0 0 16px;padding:13px 15px;border:1px solid rgba(255,200,74,.35);border-radius:12px;background:rgba(255,200,74,.08);display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}.v26020DraftNotice[hidden]{display:none}.v26020DraftNotice div strong{display:block;color:#ffd36b}.v26020DraftNotice div span{display:block;color:#cbd4e5;font-size:12px;margin-top:3px}.v26020DraftNotice aside{display:flex;gap:8px}
      .v26020Duplicate{margin-left:2px}.editCard[data-v26020-dirty="true"]{outline:1px solid rgba(255,200,74,.45);outline-offset:3px}
      .simpleRow[data-v26020-dirty="true"]{outline:1px solid rgba(255,200,74,.35);outline-offset:2px;border-radius:8px}
      .v26020Scope{font-size:11px;color:#62e6ff;letter-spacing:.09em;margin-left:8px}
    `;
    document.head.appendChild(style);
  }

  function lockScope() {
    document.documentElement.dataset.djfCmsBuild = BUILD;
    document.documentElement.dataset.djfCmsMode = "click-management";

    document.querySelectorAll('#cmsNav [data-screen]').forEach(button => {
      const name = clean(button.dataset.screen);
      button.hidden = !ALLOWED.has(name);
    });
    document.querySelectorAll('[data-screen-panel]').forEach(panel => {
      const name = clean(panel.dataset.screenPanel);
      if (!ALLOWED.has(name)) panel.dataset.v26020Disabled = "true";
      else delete panel.dataset.v26020Disabled;
    });

    const sidebarTitle = document.querySelector('.cmsLogo small');
    if (sidebarTitle) sidebarTitle.textContent = "Click CMS Management";
    const topLabel = document.querySelector('.cmsTopbar p');
    if (topLabel) topLabel.textContent = "DJ FOLSOE NETWORK · SAFE CLICK CMS";
  }

  function ensureToolbar() {
    if ($("v26020Bar")) return;
    const host = $("cmsScreens") || document.querySelector(".cmsWorkspace main") || document.querySelector(".cmsWorkspace");
    if (!host) return;
    const bar = document.createElement("section");
    bar.id = "v26020Bar";
    bar.className = "v26020Bar";
    bar.innerHTML = `
      <div class="v26020BarCopy"><i>CMS</i><div><strong>V26020 Click Management</strong><span>Add, edit, delete, reorder and publish only connected content.</span></div></div>
      <div class="v26020Status"><span id="v26020Dot" class="v26020Dot saved"></span><span id="v26020State"><b>Saved</b> · no local changes</span><span id="v26020Revision">Revision: —</span></div>
      <div class="v26020Actions"><button id="v26020Preview" class="secondary">Preview website</button><button id="v26020SaveDraft" class="secondary">Save local draft</button><button id="v26020DiscardDraft" class="secondary">Discard draft</button></div>`;
    host.prepend(bar);

    const notice = document.createElement("section");
    notice.id = "v26020DraftNotice";
    notice.className = "v26020DraftNotice";
    notice.hidden = true;
    notice.innerHTML = `<div><strong>Unpublished local draft found</strong><span id="v26020DraftTime">Saved locally</span></div><aside><button id="v26020RestoreDraft">Restore draft</button><button id="v26020IgnoreDraft" class="secondary">Ignore</button></aside>`;
    bar.after(notice);

    $("v26020Preview").onclick = () => window.open("/", "_blank", "noopener");
    $("v26020SaveDraft").onclick = () => saveLocalDraft(true);
    $("v26020DiscardDraft").onclick = discardLocalDraft;
    $("v26020RestoreDraft").onclick = restoreLocalDraft;
    $("v26020IgnoreDraft").onclick = () => { notice.hidden = true; };
  }

  function markDirty(source) {
    dirty = true;
    const dot = $("v26020Dot");
    const state = $("v26020State");
    if (dot) dot.className = "v26020Dot dirty";
    if (state) state.innerHTML = `<b>Unpublished changes</b>${source ? ` · ${source}` : ""}`;
    clearTimeout(draftTimer);
    draftTimer = setTimeout(() => saveLocalDraft(false), 900);
  }

  function markSaved() {
    dirty = false;
    const dot = $("v26020Dot");
    const state = $("v26020State");
    if (dot) dot.className = "v26020Dot saved";
    if (state) state.innerHTML = "<b>Published</b> · admin and live data synchronized";
    localStorage.removeItem(DRAFT_KEY);
    const notice = $("v26020DraftNotice");
    if (notice) notice.hidden = true;
  }

  function readField(selector) {
    return [...document.querySelectorAll(selector)].map(node => ({
      id: node.id || "",
      name: node.name || "",
      value: node.type === "checkbox" ? node.checked : node.value
    }));
  }

  function collectDraft() {
    const shows = [...document.querySelectorAll('[data-show-index]')].map(card => {
      const item = {};
      card.querySelectorAll('[data-show-field]').forEach(node => item[node.dataset.showField] = node.value);
      return item;
    });
    const tickers = kind => [...document.querySelectorAll(`[data-ticker-kind="${kind}"]`)].map(row => ({
      theme: row.querySelector('[data-ticker-field="theme"]')?.value || "all",
      text: row.querySelector('[data-ticker-field="text"]')?.value || ""
    }));
    return {
      build: BUILD,
      savedAt: new Date().toISOString(),
      homepage: readField('#heroEyebrowInput,#heroTitleInput,#heroSubtitleInput,#heroTextInput,#nextTitleInput,#nextTimeLabelInput,#nextDateInput,#nextThemeInput,#nextDescriptionInput,#followerGoalInput,#subGoalInput,#requestTextInput,#specialEventInput'),
      shows,
      topTicker: tickers("top"),
      themeTicker: tickers("theme")
    };
  }

  function saveLocalDraft(showToast) {
    try {
      const draft = collectDraft();
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      if (showToast) toast("Local draft saved. Nothing live was changed.");
      showDraftNotice(draft);
    } catch (error) {
      if (showToast) toast("Could not save local draft.", true);
    }
  }

  function showDraftNotice(draft) {
    const notice = $("v26020DraftNotice");
    if (!notice || !draft) return;
    notice.hidden = false;
    const time = $("v26020DraftTime");
    if (time) time.textContent = `Saved ${new Date(draft.savedAt).toLocaleString()}`;
  }

  function findDraft() {
    try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || "null"); }
    catch (_) { return null; }
  }

  function applyHomepageDraft(fields = []) {
    fields.forEach(field => {
      const node = field.id ? $(field.id) : null;
      if (!node) return;
      if (node.type === "checkbox") node.checked = Boolean(field.value);
      else node.value = field.value ?? "";
      node.dispatchEvent(new Event("input", { bubbles: true }));
    });
  }

  function renderDraftShows(shows = []) {
    const host = $("showsEditor");
    const add = $("addShow");
    if (!host || !add) return;
    host.innerHTML = "";
    shows.forEach(() => add.click());
    [...host.querySelectorAll('[data-show-index]')].forEach((card, index) => {
      const item = shows[index] || {};
      card.querySelectorAll('[data-show-field]').forEach(node => { node.value = item[node.dataset.showField] ?? node.value; });
    });
    enhanceEditors();
  }

  function renderDraftTickers(kind, items = []) {
    const host = kind === "top" ? $("topTickerEditor") : $("themeTickerEditor");
    const add = kind === "top" ? $("addTopTicker") : $("addThemeTicker");
    if (!host || !add) return;
    host.innerHTML = "";
    items.forEach(() => add.click());
    [...host.querySelectorAll(`[data-ticker-kind="${kind}"]`)].forEach((row, index) => {
      const item = items[index] || {};
      const theme = row.querySelector('[data-ticker-field="theme"]');
      const text = row.querySelector('[data-ticker-field="text"]');
      if (theme) theme.value = item.theme || "weekend";
      if (text) text.value = item.text || "";
    });
    enhanceEditors();
  }

  function restoreLocalDraft() {
    const draft = findDraft();
    if (!draft) return toast("No local draft was found.", true);
    applyHomepageDraft(draft.homepage);
    renderDraftShows(draft.shows);
    renderDraftTickers("top", draft.topTicker);
    renderDraftTickers("theme", draft.themeTicker);
    markDirty("restored local draft");
    $("v26020DraftNotice").hidden = true;
    toast("Local draft restored. Press the relevant Save button to publish.");
  }

  function discardLocalDraft() {
    localStorage.removeItem(DRAFT_KEY);
    const notice = $("v26020DraftNotice");
    if (notice) notice.hidden = true;
    toast("Local draft discarded. Live content was not changed.");
  }

  function enhanceShowCard(card) {
    if (!card || card.dataset.v26020Enhanced) return;
    card.dataset.v26020Enhanced = "true";
    const index = clean(card.dataset.showIndex);
    const actions = card.querySelector('.rowActions');
    if (actions) {
      const duplicate = document.createElement("button");
      duplicate.type = "button";
      duplicate.className = "secondary v26020Duplicate";
      duplicate.textContent = "Duplicate";
      duplicate.onclick = event => {
        event.preventDefault();
        event.stopPropagation();
        const values = {};
        card.querySelectorAll('[data-show-field]').forEach(node => values[node.dataset.showField] = node.value);
        $("addShow")?.click();
        const cards = [...document.querySelectorAll('[data-show-index]')];
        const copy = cards[cards.length - 1];
        copy?.querySelectorAll('[data-show-field]').forEach(node => {
          node.value = node.dataset.showField === "title" ? `${values.title || "Show"} copy` : (values[node.dataset.showField] ?? "");
        });
        enhanceEditors();
        markDirty("show duplicated");
      };
      const remove = actions.querySelector('[data-remove-show]');
      actions.insertBefore(duplicate, remove || null);
    }
    card.querySelectorAll('input,textarea,select').forEach(node => node.addEventListener('input', () => {
      card.dataset.v26020Dirty = "true";
      markDirty(`show ${Number(index) + 1}`);
    }));
  }

  function enhanceTicker(row) {
    if (!row || row.dataset.v26020Enhanced) return;
    row.dataset.v26020Enhanced = "true";
    row.querySelectorAll('input,select').forEach(node => node.addEventListener('input', () => {
      row.dataset.v26020Dirty = "true";
      markDirty("ticker message");
    }));
  }

  function enhanceEditors() {
    document.querySelectorAll('[data-show-index]').forEach(enhanceShowCard);
    document.querySelectorAll('[data-ticker-kind]').forEach(enhanceTicker);
  }

  function installSafeDeletes() {
    document.addEventListener("click", event => {
      const showDelete = event.target.closest('[data-remove-show]');
      if (showDelete && !showDelete.dataset.v26020Confirmed) {
        event.preventDefault();
        event.stopImmediatePropagation();
        const card = showDelete.closest('[data-show-index]');
        const title = card?.querySelector('[data-show-field="title"]')?.value || "this show";
        if (!window.confirm(`Delete “${title}”? The change is not live until you press Save shows.`)) return;
        showDelete.dataset.v26020Confirmed = "true";
        showDelete.click();
        delete showDelete.dataset.v26020Confirmed;
        markDirty("show deleted");
        return;
      }
      const tickerDelete = event.target.closest('[data-remove-ticker]');
      if (tickerDelete && !tickerDelete.dataset.v26020Confirmed) {
        event.preventDefault();
        event.stopImmediatePropagation();
        const text = tickerDelete.closest('.simpleRow')?.querySelector('[data-ticker-field="text"]')?.value || "this ticker message";
        if (!window.confirm(`Delete “${text}”? The change is not live until you press Save ticker messages.`)) return;
        tickerDelete.dataset.v26020Confirmed = "true";
        tickerDelete.click();
        delete tickerDelete.dataset.v26020Confirmed;
        markDirty("ticker deleted");
      }
    }, true);
  }

  function monitorEdits() {
    document.addEventListener("input", event => {
      if (event.target.closest('[data-screen-panel="homepage"]')) markDirty("homepage");
    });
    ["addShow", "addTopTicker", "addThemeTicker"].forEach(id => {
      const node = $(id);
      if (!node || node.dataset.v26020Bound) return;
      node.dataset.v26020Bound = "true";
      node.addEventListener("click", () => setTimeout(() => { enhanceEditors(); markDirty("item added"); }, 0));
    });

    ["saveHomepage", "saveShows", "saveTickers", "saveChart"].forEach(id => {
      const node = $(id);
      if (!node || node.dataset.v26020BoundSave) return;
      node.dataset.v26020BoundSave = "true";
      node.addEventListener("click", () => setTimeout(refreshRemoteState, 900));
    });
  }

  async function refreshRemoteState() {
    try {
      const response = await fetch(`${API}/api/broadcast?v=${Date.now()}`, { cache: "no-store", headers: { Accept: "application/json" } });
      if (!response.ok) return false;
      const payload = await response.json();
      const core = payload?.data || payload?.core || payload || {};
      const revision = clean(core.revision || core.updatedAt || payload.updatedAt);
      if (revision) {
        lastRemoteRevision = revision;
        const label = $("v26020Revision");
        if (label) label.textContent = `Revision: ${revision}`;
      }
      if (dirty) {
        localStorage.setItem(SNAPSHOT_KEY, JSON.stringify({ savedAt: new Date().toISOString(), revision, core }));
        markSaved();
      }
      return true;
    } catch (_) {
      return false;
    }
  }

  function boot() {
    addStyles();
    lockScope();
    ensureToolbar();
    installSafeDeletes();
    monitorEdits();
    enhanceEditors();

    const observer = new MutationObserver(() => {
      lockScope();
      ensureToolbar();
      enhanceEditors();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    const draft = findDraft();
    if (draft) showDraftNotice(draft);
    refreshRemoteState();
    setInterval(refreshRemoteState, 30000);

    window.addEventListener("beforeunload", event => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    });

    window.DJF_V26020_CLICK_CMS = {
      build: BUILD,
      allowedScreens: [...ALLOWED],
      saveDraft: () => saveLocalDraft(true),
      restoreDraft: restoreLocalDraft,
      discardDraft: discardLocalDraft,
      refresh: refreshRemoteState,
      status: () => ({ ready: true, build: BUILD, dirty, revision: lastRemoteRevision })
    };
    console.info("DJ FOLSOE V26020 Click CMS Management ready");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
