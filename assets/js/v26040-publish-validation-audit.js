/* DJ FOLSOE V26040 — PUBLISH VALIDATION & AUDIT TRAIL
   Admin-only additive layer on V26030.
   Does not change website, overlay, Worker endpoints or existing save handlers. */
(() => {
  "use strict";

  const BUILD = "V26040";
  const AUDIT_KEY = "djf_v26040_audit";
  const MAX_AUDIT = 80;
  const $ = id => document.getElementById(id);
  const clean = value => String(value ?? "").trim();
  const nowIso = () => new Date().toISOString();

  function toast(message, error = false) {
    const node = $("toast");
    if (!node) return;
    node.textContent = message;
    node.className = `toast ${error ? "error" : "success"} show`;
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => node.classList.remove("show"), 3600);
  }

  function readAudit() {
    try {
      const value = JSON.parse(localStorage.getItem(AUDIT_KEY) || "[]");
      return Array.isArray(value) ? value : [];
    } catch (_) { return []; }
  }

  function writeAudit(items) {
    localStorage.setItem(AUDIT_KEY, JSON.stringify(items.slice(0, MAX_AUDIT)));
  }

  function addAudit(type, title, details = "") {
    const items = readAudit();
    items.unshift({ id: `${Date.now()}-${Math.random().toString(36).slice(2,8)}`, at: nowIso(), type, title, details });
    writeAudit(items);
    renderAudit();
  }

  function field(id) { return $(id); }
  function value(id) { return clean(field(id)?.value); }

  function collectVisibleInputs(scope = document) {
    return [...scope.querySelectorAll('input[id],textarea[id],select[id]')]
      .filter(node => node.offsetParent !== null && !node.disabled && !node.closest('[data-v26020-disabled="true"]'));
  }

  function validateHomepage() {
    const errors = [], warnings = [];
    if (!value("heroTitleInput")) errors.push("Hero title is empty.");
    if (!value("heroTextInput")) warnings.push("Hero text is empty.");
    const date = value("nextDateInput");
    if (date && Number.isNaN(new Date(date).getTime())) errors.push("Next show date is invalid.");
    if (value("nextTitleInput") && !date) warnings.push("Next show has a title but no date.");
    return { errors, warnings };
  }

  function normalizeKey(value) {
    return clean(value).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function validateShows() {
    const errors = [], warnings = [];
    const editor = $("showsEditor");
    if (!editor) return { errors, warnings };
    const rows = [...editor.querySelectorAll('[data-show-row], .show-editor-row, .cms-show-row, article, .card')]
      .filter(row => row.querySelector('input,textarea,select'));
    const keys = new Map();
    rows.forEach((row, index) => {
      const inputs = [...row.querySelectorAll('input,textarea,select')];
      const titleNode = inputs.find(node => /title|name/i.test(node.id || node.name || node.dataset.field || "")) || inputs[0];
      const title = clean(titleNode?.value);
      if (!title) warnings.push(`Show ${index + 1} has no title.`);
      const key = normalizeKey(title);
      if (key) {
        if (keys.has(key)) errors.push(`Duplicate show title: ${title}.`);
        keys.set(key, true);
      }
    });
    return { errors, warnings };
  }

  function validateTickers() {
    const errors = [], warnings = [];
    const screen = $("screen-tickers") || document;
    const fields = collectVisibleInputs(screen).filter(node => /ticker/i.test(node.id || node.name || node.dataset.field || ""));
    const values = fields.map(node => clean(node.value)).filter(Boolean);
    const duplicates = values.filter((item, index) => values.findIndex(value => value.toLowerCase() === item.toLowerCase()) !== index);
    if (duplicates.length) warnings.push(`Duplicate ticker text: ${[...new Set(duplicates)].join(", ")}.`);
    return { errors, warnings };
  }

  function validateChart() {
    const errors = [], warnings = [];
    const size = Number(value("chartSize") || 0);
    if (size && ![10,20].includes(size)) warnings.push("Chart size is not 10 or 20.");
    return { errors, warnings };
  }

  const validators = {
    saveHomepage: validateHomepage,
    saveShows: validateShows,
    saveTickers: validateTickers,
    saveChart: validateChart
  };

  function validate(buttonId) {
    const result = validators[buttonId]?.() || { errors: [], warnings: [] };
    return {
      errors: [...new Set(result.errors || [])],
      warnings: [...new Set(result.warnings || [])]
    };
  }

  function summary(result) {
    const lines = [];
    if (result.errors.length) lines.push(`Errors:\n- ${result.errors.join("\n- ")}`);
    if (result.warnings.length) lines.push(`Warnings:\n- ${result.warnings.join("\n- ")}`);
    return lines.join("\n\n");
  }

  function installValidation() {
    Object.keys(validators).forEach(buttonId => {
      const button = $(buttonId);
      if (!button || button.dataset.v26040Validation) return;
      button.dataset.v26040Validation = "true";
      button.addEventListener("click", event => {
        const result = validate(buttonId);
        if (result.errors.length) {
          event.preventDefault();
          event.stopImmediatePropagation();
          addAudit("blocked", buttonId, summary(result));
          alert(`Publication blocked.\n\n${summary(result)}`);
          toast("Publication blocked by validation.", true);
          return;
        }
        if (result.warnings.length) {
          const proceed = confirm(`Validation warnings:\n\n${summary(result)}\n\nPublish anyway?`);
          if (!proceed) {
            event.preventDefault();
            event.stopImmediatePropagation();
            addAudit("cancelled", buttonId, summary(result));
            toast("Publication cancelled. Nothing was changed.", true);
            return;
          }
        }
        addAudit("publish", buttonId, result.warnings.length ? summary(result) : "Validation passed.");
      }, true);
    });
  }

  function addStyles() {
    if ($("v26040Styles")) return;
    const style = document.createElement("style");
    style.id = "v26040Styles";
    style.textContent = `
      .v26040Panel{margin:0 0 18px;border:1px solid rgba(65,226,159,.28);border-radius:14px;background:linear-gradient(120deg,rgba(65,226,159,.07),rgba(67,217,255,.045));overflow:hidden}
      .v26040Head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px 15px;border-bottom:1px solid rgba(255,255,255,.08);flex-wrap:wrap}.v26040Head small{display:block;color:#aebbd1;margin-top:3px}.v26040Actions{display:flex;gap:8px;flex-wrap:wrap}
      .v26040Body{display:grid;grid-template-columns:minmax(0,1fr) 220px;gap:1px;background:rgba(255,255,255,.07)}
      .v26040Audit{background:#0c1220;max-height:260px;overflow:auto}.v26040Item{display:grid;grid-template-columns:92px minmax(0,1fr);gap:12px;padding:11px 14px;border-bottom:1px solid rgba(255,255,255,.06)}.v26040Item time{color:#8f9bb0;font-size:11px}.v26040Item strong{display:block}.v26040Item p{margin:4px 0 0;color:#aebbd1;font-size:11px;white-space:pre-wrap}.v26040Item[data-type="blocked"] strong{color:#ff6680}.v26040Item[data-type="publish"] strong{color:#58e3a0}.v26040Item[data-type="cancelled"] strong{color:#ffd164}
      .v26040Summary{background:#0b101c;padding:14px}.v26040Summary span{display:block;color:#8f9bb0;font-size:11px;letter-spacing:.08em}.v26040Summary b{display:block;font-size:28px;margin-top:6px}.v26040Empty{padding:24px;color:#8f9bb0;text-align:center}
      @media(max-width:900px){.v26040Body{grid-template-columns:1fr}.v26040Summary{display:flex;justify-content:space-between;align-items:center}.v26040Summary b{margin:0}}
    `;
    document.head.appendChild(style);
  }

  function renderAudit() {
    const list = $("v26040Audit");
    if (!list) return;
    const items = readAudit();
    $("v26040Count").textContent = String(items.length);
    if (!items.length) {
      list.innerHTML = '<div class="v26040Empty">No admin publication activity recorded yet.</div>';
      return;
    }
    list.innerHTML = items.slice(0, 30).map(item => `
      <div class="v26040Item" data-type="${item.type}">
        <time>${new Date(item.at).toLocaleString()}</time>
        <div><strong>${item.type.toUpperCase()} · ${item.title}</strong><p>${clean(item.details).replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))}</p></div>
      </div>`).join("");
  }

  function ensurePanel() {
    if ($("v26040Panel")) return;
    const anchor = $("v26030Panel") || $("v26020Bar");
    if (!anchor) return;
    const panel = document.createElement("section");
    panel.id = "v26040Panel";
    panel.className = "v26040Panel";
    panel.innerHTML = `
      <div class="v26040Head">
        <div><strong>V26040 · Publish Validation & Audit Trail</strong><small>Blocks invalid CMS publications before existing save handlers run. Nothing outside admin is changed.</small></div>
        <div class="v26040Actions"><button id="v26040Validate" class="secondary">Validate current screen</button><button id="v26040Clear" class="secondary">Clear audit</button></div>
      </div>
      <div class="v26040Body"><div id="v26040Audit" class="v26040Audit"></div><aside class="v26040Summary"><span>LOCAL AUDIT EVENTS</span><b id="v26040Count">0</b></aside></div>`;
    anchor.after(panel);
    $("v26040Validate").onclick = () => {
      const active = [...document.querySelectorAll('[id^="screen-"]')].find(node => node.offsetParent !== null)?.id || "";
      const map = { "screen-homepage": "saveHomepage", "screen-shows": "saveShows", "screen-tickers": "saveTickers", "screen-chart": "saveChart" };
      const buttonId = map[active];
      if (!buttonId) return toast("No supported CMS editor is open.", true);
      const result = validate(buttonId);
      if (!result.errors.length && !result.warnings.length) return toast("Validation passed. This screen is ready to publish.");
      alert(summary(result));
    };
    $("v26040Clear").onclick = () => {
      if (!confirm("Delete the local admin audit history?")) return;
      localStorage.removeItem(AUDIT_KEY);
      renderAudit();
      toast("Local audit history deleted.");
    };
    renderAudit();
  }

  function boot() {
    addStyles();
    ensurePanel();
    installValidation();
    const observer = new MutationObserver(() => { ensurePanel(); installValidation(); });
    observer.observe(document.body, { childList: true, subtree: true });
    window.DJF_V26040_VALIDATION_AUDIT = { build: BUILD, validate, audit: readAudit, clear: () => { localStorage.removeItem(AUDIT_KEY); renderAudit(); } };
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
