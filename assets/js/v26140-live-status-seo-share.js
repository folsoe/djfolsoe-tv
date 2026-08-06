/* DJ FOLSOE V26140 — LIVE STATUS, SEO & SHARE EXPERIENCE */
(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const safe = (v, fallback = '') => String(v ?? '').trim() || fallback;
  const pageUrl = 'https://folsoetv.dk/';

  function setMeta(selector, value) {
    const node = document.querySelector(selector);
    if (node && value) node.setAttribute('content', value);
  }

  function snapshot() {
    const body = document.body;
    const live = body?.dataset?.broadcastState === 'live' || /\blive\b/i.test(safe($('heroChannelState')?.textContent));
    const show = safe($('deskTitle')?.textContent, 'DJ FOLSOE');
    const lead = safe($('deskText')?.textContent || $('cmsHeroLead')?.textContent, 'Live music television from Denmark.');
    return { live, show, lead };
  }

  function updateMetadata() {
    const state = snapshot();
    document.documentElement.dataset.live = state.live ? 'true' : 'false';
    const title = state.live ? `${state.show} · LIVE NOW · DJ FOLSOE TV` : `${state.show} · DJ FOLSOE TV`;
    const description = state.live ? `DJ FOLSOE is live now with ${state.show}. Watch directly on FOLSOE TV.` : state.lead;
    document.title = title;
    setMeta('meta[name="description"]', description);
    setMeta('meta[property="og:title"]', title);
    setMeta('meta[property="og:description"]', description);
    setMeta('meta[name="twitter:title"]', title);
    setMeta('meta[name="twitter:description"]', description);
    const kicker = $('shareStatusKicker');
    const shareTitle = $('shareStatusTitle');
    if (kicker) kicker.textContent = state.live ? 'LIVE NOW ON DJ FOLSOE TV' : 'DJ FOLSOE TV';
    if (shareTitle) shareTitle.textContent = state.live ? `SHARE ${state.show}` : 'SHARE THE BROADCAST';
    updateStructuredData(state, title, description);
  }

  function updateStructuredData(state, title, description) {
    let script = $('djfStructuredData');
    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'djfStructuredData';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': state.live ? 'BroadcastEvent' : 'WebSite',
      name: title,
      description,
      url: pageUrl,
      isLiveBroadcast: state.live,
      broadcaster: { '@type': 'Organization', name: 'DJ FOLSOE TV', url: pageUrl },
      inLanguage: ['da', 'en', 'de']
    });
  }

  function feedback(message) {
    const output = $('shareFeedback');
    if (!output) return;
    output.textContent = message;
    clearTimeout(feedback.timer);
    feedback.timer = setTimeout(() => { output.textContent = ''; }, 3000);
  }

  async function share() {
    const state = snapshot();
    const data = {
      title: state.live ? `${state.show} · LIVE NOW` : 'DJ FOLSOE TV',
      text: state.live ? `DJ FOLSOE is live now with ${state.show}.` : 'Watch DJ FOLSOE live music television from Denmark.',
      url: pageUrl
    };
    try {
      if (navigator.share) {
        await navigator.share(data);
        feedback('SHARE MENU OPENED');
      } else {
        await navigator.clipboard.writeText(pageUrl);
        feedback('LINK COPIED');
      }
    } catch (error) {
      if (error?.name !== 'AbortError') feedback('SHARE WAS NOT AVAILABLE');
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(pageUrl);
      feedback('FOLSOETV.DK COPIED');
    } catch (_) {
      const area = document.createElement('textarea');
      area.value = pageUrl;
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      area.remove();
      feedback('FOLSOETV.DK COPIED');
    }
  }

  function init() {
    $('shareBroadcastButton')?.addEventListener('click', share);
    $('copyBroadcastLink')?.addEventListener('click', copy);
    updateMetadata();
    const observer = new MutationObserver(updateMetadata);
    ['deskTitle','deskText','heroChannelState','cmsHeroLead'].forEach(id => {
      const node = $(id);
      if (node) observer.observe(node, { childList:true, subtree:true, characterData:true });
    });
    if (document.body) observer.observe(document.body, { attributes:true, attributeFilter:['data-broadcast-state'] });
    setInterval(updateMetadata, 30000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true });
  else init();
})();
