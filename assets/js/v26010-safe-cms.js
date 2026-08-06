/* DJ FOLSOE V26010 — SAFE CMS INTEGRATION FOUNDATION
   Additive admin guard. Does not replace visual-cms.js or existing endpoints. */
(() => {
  "use strict";
  const BUILD = "V26010";
  const ALLOWED = new Set(["dashboard", "homepage", "shows", "theme", "schedule", "charts"]);

  function installSafeMode() {
    document.documentElement.dataset.djfCmsBuild = BUILD;
    document.documentElement.dataset.djfCmsMode = "safe-foundation";

    document.querySelectorAll('#cmsNav [data-screen]').forEach(button => {
      const name = String(button.dataset.screen || "");
      if (!ALLOWED.has(name)) button.hidden = true;
    });

    document.querySelectorAll('[data-screen-panel]').forEach(panel => {
      const name = String(panel.dataset.screenPanel || "");
      if (!ALLOWED.has(name)) panel.dataset.v26010Disabled = "true";
    });

    const title = document.querySelector('.brandCopy strong, .cmsBrand strong, header strong');
    if (title && !document.getElementById('v26010SafeBadge')) {
      const badge = document.createElement('small');
      badge.id = 'v26010SafeBadge';
      badge.textContent = ' · SAFE CMS';
      badge.style.cssText = 'margin-left:8px;color:#62e6ff;font-size:11px;letter-spacing:.12em';
      title.appendChild(badge);
    }

    const note = document.createElement('div');
    note.id = 'v26010ScopeNote';
    note.innerHTML = '<strong>V26010 SAFE FOUNDATION</strong><span>Only controls that are connected to the current website and overlay are shown. Existing design and event engines remain locked.</span>';
    note.style.cssText = 'margin:14px 0;padding:12px 16px;border:1px solid rgba(98,230,255,.35);border-radius:12px;background:rgba(98,230,255,.07);display:flex;gap:14px;align-items:center;flex-wrap:wrap';
    note.querySelector('strong').style.cssText = 'color:#62e6ff;letter-spacing:.08em';
    note.querySelector('span').style.cssText = 'color:#cbd4e5';
    const host = document.querySelector('.cmsMain, main, #cmsScreens');
    if (host && !document.getElementById('v26010ScopeNote')) host.prepend(note);
  }

  function protectNavigation() {
    document.addEventListener('click', event => {
      const jump = event.target.closest('[data-screen-jump]');
      if (!jump) return;
      const name = String(jump.dataset.screenJump || "");
      if (ALLOWED.has(name)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      const toast = document.getElementById('toast');
      if (toast) {
        toast.textContent = 'This module is paused during the safe CMS integration.';
        toast.className = 'toast error show';
      }
    }, true);
  }

  function start() {
    installSafeMode();
    protectNavigation();
    const observer = new MutationObserver(installSafeMode);
    observer.observe(document.body, { childList: true, subtree: true });
    window.DJF_V26010_SAFE_CMS = {
      build: BUILD,
      allowedScreens: [...ALLOWED],
      status: () => ({ ready: true, build: BUILD, safeMode: true, allowedScreens: [...ALLOWED] })
    };
    console.info('DJ FOLSOE V26010 Safe CMS Foundation ready');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
