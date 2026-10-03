/* Shared, event-driven translation layer. No translation API, polling or HTML replacement. */
(() => {
  'use strict';
  const data = window.DJF_SITE_TRANSLATIONS;
  if (!data || window.DJF_I18N) return;
  const languages = ['da', 'en', 'de'];
  const locales = {da: 'da-DK', en: 'en-GB', de: 'de-DE'};
  const storageKey = 'djf.site.language.v1';
  const normal = value => String(value || '').replace(/\s+/g, ' ').trim();
  const originals = new WeakMap();
  const attributes = new WeakMap();
  const reverse = new Map();
  const ambiguous = new Set();
  Object.entries(data.strings).forEach(([key, values]) => {
    values.forEach(value => {
      const k = normal(value);
      if (reverse.has(k) && reverse.get(k) !== key) ambiguous.add(k);
      else reverse.set(k, key);
    });
  });
  const excluded = 'script,style,noscript,code,pre,textarea,iframe,[translate="no"],[data-i18n-ignore],.djfLanguageBar,.chart-row strong,.chart-row small,.chartArtist,.chartTitle,#cmsChartGrid strong,#cmsChartGrid small,.v26410-song strong,#djfViewerGrid h3,#djfProfile h3,.djfChartMini strong,[data-track-title],[data-artist],.twitch-chat,.chat-message';
  const attrNames = ['title', 'aria-label', 'placeholder', 'alt'];
  let stored = '';
  try { stored = localStorage.getItem(storageKey) || ''; } catch (_) {}
  const requested = new URLSearchParams(location.search).get('lang');
  const browser = (navigator.language || 'en').slice(0, 2).toLowerCase();
  let language = [requested, stored, browser, 'en'].find(value => languages.includes(value));
  let bar;
  let scheduled = false;
  const pending = new Set();
  function keyFor(text) {
    const key = normal(text);
    if (Object.prototype.hasOwnProperty.call(data.strings, key)) return key;
    if (!ambiguous.has(key)) return reverse.get(key);
    return undefined;
  }
  function t(key, values = {}) {
    const source = keyFor(key);
    let value = source ? data.strings[source][languages.indexOf(language)] : key;
    return String(value).replace(/\{(\w+)\}/g, (whole, name) => Object.prototype.hasOwnProperty.call(values, name) ? String(values[name]) : whole);
  }
  function translated(value) {
    const key = keyFor(value);
    if (key) return t(key);
    // Translate the label only; broadcast titles and viewer counts are live content.
    const patterns = [
      [/^NEXT · (.+)$/, 'NEXT · {title}', 'title'],
      [/^Next: (.+)$/, 'Next: {title}', 'title'],
      [/^NEXT: (.+)$/, 'NEXT: {title}', 'title'],
      [/^UP NEXT: (.+)$/, 'UP NEXT: {title}', 'title'],
      [/^([\d.,]+) VIEWERS$/, '{count} VIEWERS', 'count'],
      [/^([\d.,]+) WATCHING NOW$/, '{count} WATCHING NOW', 'count'],
      [/^([\d.,]+) watching now · Twitch chat is open$/, '{count} watching now · Twitch chat is open', 'count'],
      [/^Published (.+)$/, 'Published {date}', 'date'],
      [/^LW ([\d—-]+)$/, 'LW {count}', 'count'],
      [/^PEAK ([\d—-]+)$/, 'PEAK {count}', 'count'],
      [/^WEEKS ([\d—-]+)$/, 'WEEKS {count}', 'count']
    ];
    for (const [pattern, template, slot] of patterns) {
      const match = normal(value).match(pattern);
      if (match) return t(template, {[slot]:match[1]});
    }
    return value;
  }
  function skip(node) {
    const element = node.nodeType === 1 ? node : node.parentElement;
    return !element || !!element.closest(excluded);
  }
  function translateText(node) {
    if (skip(node) || !normal(node.nodeValue)) return;
    if (node.parentElement.tagName === 'OPTION' && !node.parentElement.hasAttribute('value')) node.parentElement.setAttribute('value', node.parentElement.textContent);
    let record = originals.get(node);
    if (!record || node.nodeValue !== record.last) record = {source: node.nodeValue};
    const result = translated(record.source);
    const leading = record.source.match(/^\s*/)[0];
    const trailing = record.source.match(/\s*$/)[0];
    record.last = result === record.source ? record.source : leading + result + trailing;
    originals.set(node, record);
    if (node.nodeValue !== record.last) node.nodeValue = record.last;
  }
  function translateAttrs(element) {
    if (skip(element)) return;
    if (element.tagName === 'IMG' && /\/classic-dance(?:-(?:da|en|de))?\.svg(?:\?|$)/.test(element.getAttribute('src') || '')) {
      element.setAttribute('src', '/assets/img/classic-dance-' + language + '.svg');
    }
    let records = attributes.get(element);
    if (!records) { records = {}; attributes.set(element, records); }
    attrNames.forEach(name => {
      if (!element.hasAttribute(name)) return;
      const value = element.getAttribute(name);
      let record = records[name];
      if (!record || record.last !== value) record = {source: value};
      record.last = translated(record.source);
      records[name] = record;
      if (value !== record.last) element.setAttribute(name, record.last);
    });
  }
  function scan(root) {
    if (!root.isConnected) return;
    if (root.nodeType === 3) { translateText(root); return; }
    if (root.nodeType === 1 && skip(root)) return;
    if (root.nodeType === 1) translateAttrs(root);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (node.nodeType === 1 && node.matches(excluded)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    let node;
    while ((node = walker.nextNode())) {
      if (node.nodeType === 3) translateText(node);
      else translateAttrs(node);
    }
  }
  function metadata() {
    let path = location.pathname.replace(/^\//, '');
    if (!path || path.endsWith('/')) path += 'index.html';
    const descriptions = data.metadata[path];
    if (!descriptions) return;
    for (const selector of ['meta[name="description"]','meta[property="og:description"]','meta[name="twitter:description"]']) {
      const element = document.querySelector(selector);
      if (element) element.setAttribute('content', descriptions[languages.indexOf(language)]);
    }
    document.querySelectorAll('meta[property="og:locale"]').forEach(el => el.setAttribute('content', locales[language].replace('-', '_')));
  }
  const observer = new MutationObserver(records => {
    for (const record of records) {
      if (skip(record.target)) continue;
      if (record.type === 'childList') record.addedNodes.forEach(node => { if (node.nodeType === 1 || node.nodeType === 3) pending.add(node); });
      else pending.add(record.target);
    }
    if (!pending.size || scheduled) return;
    scheduled = true;
    // One batch per frame; no timer repeatedly walks an unchanged page.
    requestAnimationFrame(() => {
      scheduled = false;
      observer.disconnect();
      const roots = [...pending]; pending.clear();
      roots.filter(node => !roots.some(parent => parent !== node && parent.contains(node))).forEach(scan);
      observe();
    });
  });
  function observe() {
    observer.observe(document.documentElement, {subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: attrNames});
  }
  function setLanguage(next, persist = true) {
    if (!languages.includes(next)) return;
    language = next;
    if (persist) {
      try { localStorage.setItem(storageKey, language); } catch (_) {}
      // Keep any explicit language parameter aligned; preserve show IDs, anchors and other parameters.
      const url = new URL(location.href);
      if (url.searchParams.has('lang')) { url.searchParams.set('lang', language); history.replaceState(history.state, '', url); }
    }
    observer.disconnect();
    document.documentElement.lang = language;
    if (bar) {
      bar.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.language === language)));
      bar.setAttribute('aria-label', {da:'Vælg sprog', en:'Choose language', de:'Sprache wählen'}[language]);
    }
    scan(document.documentElement);
    metadata();
    observe();
    window.dispatchEvent(new CustomEvent('djf:languagechange', {detail: {language, locale: locales[language]}}));
  }
  window.DJF_I18N = {get language() {return language;}, get locale() {return locales[language];}, setLanguage, t};
  function start() {
    bar = document.createElement('div');
    bar.className = 'djfLanguageBar';
    bar.setAttribute('role', 'group');
    bar.setAttribute('translate', 'no');
    const label = document.createElement('span'); label.className = 'djfLanguageMark'; label.textContent = 'DA / EN / DE'; bar.append(label);
    for (const [code, name] of [['da','Dansk'],['en','English'],['de','Deutsch']]) {
      const button = document.createElement('button'); button.type = 'button'; button.dataset.language = code;
      button.lang = code; button.textContent = name; button.addEventListener('click', () => setLanguage(code)); bar.append(button);
    }
    document.body.prepend(bar);
    setLanguage(language, !!requested);
  }
  window.addEventListener('storage', event => { if (event.key === storageKey && languages.includes(event.newValue)) setLanguage(event.newValue, false); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once:true}); else start();
})();
