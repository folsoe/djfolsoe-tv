(() => {
  'use strict';

  const panel = document.querySelector('.home-live');
  const signal = document.getElementById('live-state');
  if (!panel || !signal) return;

  const screen = document.getElementById('home-live-screen');
  const mount = document.getElementById('home-live-video');
  const fallback = panel.querySelector('.home-live-mobile');
  const languages = ['da', 'en', 'de'];
  const labels = {
    badge: ['LIVE PÅ TWITCH', 'LIVE ON TWITCH', 'LIVE AUF TWITCH'],
    watch: ['Åbn Twitch ↗', 'Open Twitch ↗', 'Twitch öffnen ↗'],
    mobile: ['Se DJ FOLSOE live på Twitch ↗', 'Watch DJ FOLSOE live on Twitch ↗', 'DJ FOLSOE live auf Twitch ansehen ↗'],
    note: [
      'Afspilleren starter uden lyd. Slå lyden til i afspilleren. Twitch kan behandle data, når videoen indlæses.',
      'The player starts muted. Turn on sound in the player. Twitch may process data when the video loads.',
      'Der Player startet stumm. Den Ton könnt ihr im Player einschalten. Twitch kann beim Laden des Videos Daten verarbeiten.',
    ],
    noteMobile: [
      'På denne skærm kan du åbne liveudsendelsen direkte på Twitch.',
      'On this screen, you can open the live stream directly on Twitch.',
      'Auf diesem Bildschirm könnt ihr den Livestream direkt auf Twitch öffnen.',
    ],
  };
  const copy = new Map([...panel.querySelectorAll('[data-live-copy]')].map(element => [element.dataset.liveCopy, element]));
  let player;

  function render() {
    if (signal.dataset.state !== 'live') {
      panel.hidden = true;
      if (player) { player.remove(); player = undefined; }
      return;
    }

    panel.hidden = false;
    const canEmbed = location.protocol === 'https:' && screen.clientWidth >= 400;
    const lang = Math.max(0, languages.indexOf(document.documentElement.lang.split('-')[0]));
    for (const [key, element] of copy) {
      element.textContent = labels[key === 'note' && !canEmbed ? 'noteMobile' : key][lang];
    }

    fallback.hidden = canEmbed;
    mount.hidden = !canEmbed;
    if (!canEmbed) {
      if (player) { player.remove(); player = undefined; }
      return;
    }
    if (player) return;

    const url = new URL('https://player.twitch.tv/');
    url.search = new URLSearchParams({ channel: 'djfolsoe', parent: location.hostname, autoplay: 'true', muted: 'true' });
    player = document.createElement('iframe');
    player.title = 'DJ FOLSOE · Twitch Live';
    player.src = url.href;
    player.allow = 'autoplay; fullscreen';
    player.allowFullscreen = true;
    mount.append(player);
  }

  new MutationObserver(render).observe(signal, { attributes: true, attributeFilter: ['data-state'] });
  if (typeof ResizeObserver === 'function') new ResizeObserver(render).observe(screen);
  else window.addEventListener('resize', render);
  window.addEventListener('djf:languagechange', render);
  render();
})();
