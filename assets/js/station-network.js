(() => {
  'use strict';
  // Each photo is assigned to one editorial context. Index cards and destination
  // pages have separate assignments so a cover cannot repeat on a second route.
  const photos = {"studio": ["Radio studio", 1000, 666], "tiesto": ["Tiësto", 420, 300], "morten": ["David Guetta & MORTEN · Hï Ibiza, 2022", 1000, 660], "anna": ["Anna Lunoe", 830, 700], "sasha": ["Sasha & John Digweed · Bristol, 2025", 1000, 663], "trance": ["Above & Beyond · Trance Energy, 2010", 800, 534], "club": ["Weekend Club · Berlin", 933, 700], "copenhagen": ["Nyhavn · København", 933, 700], "decks": ["DJ booth · Bob Beaman, München", 1000, 477], "vinyl": ["Jaume Pujagut · Vinyl collection", 933, 700], "wham": ["Wham! · 1984", 620, 700], "set": ["DJ booth · Bob Beaman, München", 1000, 463], "classic-booth": ["Deux Technics SL-1200", 1000, 275], "popup-booth": ["Pioneer CDJ-2000", 598, 506], "retro-deck": ["Technics SL-1200 · 1972", 933, 700], "disco-ball": ["ABC · Glasgow", 933, 700], "weekend-dj": ["DJ AnthonyB.", 848, 700], "record-shop": ["Disquaire · Lyon", 1000, 664], "club-crowd": ["Dance floor", 1000, 666], "sasha-solo": ["Sasha · Bucharest, 2006", 800, 533], "headphones": ["DJ headphones and mixer", 875, 700], "radio-history": ["Radio control room · Library of Congress", 950, 700], "live-club": ["DJ Lamberto · 2026", 933, 700], "gnags": ["Peter A.G. Nielsen · Gnags", 933, 700], "rave-1992": ["Fantazia Summertime · 1992", 800, 600], "dj-1994": ["DJ Dan · 1994", 557, 525]};
  const showCovers = {
    '/shows/fredagsbar/':'club-crowd',
    '/shows/weekend/':'weekend-dj',
    '/shows/nu-disco/':'disco-ball',
    '/shows/pop-up/':'popup-booth'
  };
  const pageCovers = {
    '/shows/good-morning-twitch/':'radio-history',
    '/shows/nu-disco/':'live-club',
    '/guides/90s-eurodance-guide/':'rave-1992'
  };
  const selectorCovers = {trance:'trance', eurodance:'classic-booth', retro:'retro-deck'};
  const playlistCovers = {retro:'vinyl'};

  function editorialPicture(key, img = document.createElement('img')) {
    img.classList.add('station-picture');
    img.loading = 'lazy';
    img.decoding = 'async';
    if (key === 'portrait') {
      img.classList.add('station-picture-portrait');
      img.src = '/assets/img/dj-folsoe-portrait.png';
    } else {
      const [caption, width, height] = photos[key];
      img.alt = caption;
      img.width = width;
      img.height = height;
      img.src = '/assets/img/editorial/' + key + '.jpg';
    }
    return img;
  }

  window.djfEditorialPhoto = editorialPicture;

  const key = pageCovers[location.pathname];
  const header = document.querySelector('body > header, body > nav.seo-nav, main > header');
  if (!header?.querySelector('img[src*="/brand/"]')) {
    const brand = header?.querySelector('a.brand[href="/"]') || document.createElement('a');
    brand.href = '/';
    brand.classList.add('station-brand-link');
    const logo = document.createElement('img');
    logo.src = '/assets/img/brand/station-logo.svg';
    logo.className = 'station-brand';
    logo.alt = 'DJ FOLSOE';
    logo.width = 204;
    logo.height = 48;
    brand.replaceChildren(logo);
    if (!brand.isConnected) {
      if (header) header.prepend(brand);
      else {
        const bar = document.createElement('header');
        bar.className = 'station-compact-header';
        bar.append(brand);
        document.body.prepend(bar);
      }
    }
  }
  function mountStationDirectory(isHome) {
    const main = document.querySelector('main');
    if (!main) return;
    const directory = document.createElement('nav');
    directory.className = 'station-directory';
    const title = document.createElement('h2');
    title.className = 'station-directory-title';
    title.id = 'station-directory-title';
    directory.setAttribute('aria-labelledby', title.id);
    const items = document.createElement('ul');
    directory.append(title, items);

    const publicSections = [
      ['live','/watch-live/',['Se live','Watch live','Live ansehen'],['Twitch og næste sendetid','Twitch and what’s on next','Twitch und nächste Sendung']],
      ['shows','/shows/',['Find dit show','Browse shows','Shows entdecken'],['Fra Trance Tuesday til Retro Hits','From Trance Tuesday to Retro Hits','Von Trance Tuesday bis Retro Hits']],
      ['news','/music/',['Musikredaktionen','Music desk','Musikredaktion'],['Nyheder, genrer og lytteguider','News, genres and listening guides','News, Genres und Hörtipps']],
      ['charts','/charts/',['Hitlister','Charts','Charts'],['Top 20 og Retro Top 10','Top 20 and Retro Top 10','Top 20 und Retro Top 10']],
      ['community','/community/',['Vær med','Join in','Mitmachen'],['Chat, musikønsker og fællesskab','Chat, requests and community','Chat, Musikwünsche und Community']]
    ];
    const panels = publicSections.map(([key, url, names, descriptions]) => {
      const item = document.createElement('li');
      const link = document.createElement('a');
      const label = document.createElement('strong');
      const description = document.createElement('span');
      item.dataset.channel = key;
      item.append(link);
      link.append(label, description);
      items.append(item);
      if (location.pathname.startsWith(url)) link.setAttribute('aria-current','location');
      return {key, url, names, descriptions, link, label, description};
    });
    if (isHome) {
      const anchor = main.querySelector('.sound-stage') || main.querySelector('.signal');
      if (anchor) anchor.before(directory); else main.append(directory);
    } else {
      main.append(directory);
    }

    const status = document.getElementById('live-state');
    const nextShow = document.getElementById('next-show');
    function update() {
      const language = Math.max(0, ['da','en','de'].indexOf(document.documentElement.lang.slice(0,2)));
      title.textContent = isHome ? ['På DJ FOLSOE','On DJ FOLSOE','Bei DJ FOLSOE'][language] : ['Se mere hos DJ FOLSOE','More from DJ FOLSOE','Mehr von DJ FOLSOE'][language];
      for (const panel of panels) {
        const isLive = panel.key === 'live' && status?.dataset.state === 'live';
        panel.link.href = (panel.key === 'news' ? '/?lang=' + ['da','en','de'][language] + '#musiknyheder' : panel.url + '?lang=' + ['da','en','de'][language]);
        panel.label.textContent = isLive ? ['Live nu','Live now','Jetzt live'][language] : panel.names[language];
        const upcoming = panel.key === 'live' && status?.dataset.state === 'offline' ? nextShow?.textContent.trim() : '';
        panel.description.textContent = upcoming || panel.descriptions[language];
        panel.link.dataset.live = String(isLive);
      }
    }
    update();
    const watcher = new MutationObserver(update);
    watcher.observe(document.documentElement, {attributes:true, attributeFilter:['lang']});
    if (status) watcher.observe(status, {attributes:true, attributeFilter:['data-state']});
    if (nextShow) watcher.observe(nextShow, {childList:true});
  }

  const credits = document.createElement('a');
  credits.className = 'station-photo-credits';
  credits.href = '/fotokreditering/';
  document.body.append(credits);
  function updateCredits() {
    credits.textContent = {da:'Fotokreditering', en:'Photo credits', de:'Bildnachweise'}[document.documentElement.lang.slice(0, 2)] || 'Photo credits';
  }
  updateCredits();
  new MutationObserver(updateCredits).observe(document.documentElement, {attributes:true, attributeFilter:['lang']});

  const hero = document.querySelector('main .page-hero, main .v26340SubHero, main .v26400-chartHero, main .archive-hero, main .editorial-hero');
  if (hero && key) {
    const figure = document.createElement('figure');
    figure.className = 'station-page-picture';
    figure.append(editorialPicture(key));
    hero.append(figure);
  }

  const news = document.querySelector('#musiknyheder');
  mountStationDirectory(Boolean(news));
  if (!news) return;

  for (const card of document.querySelectorAll('#shows .show-card[href]')) {
    const image = showCovers[card.pathname];
    if (image && !card.querySelector('img')) card.prepend(editorialPicture(image));
  }

  const presenter = document.querySelector('#main > .person');
  if (presenter) {
    const portrait = editorialPicture('portrait');
    portrait.classList.add('station-person-photo');
    portrait.alt = 'Sune Folsø';
    presenter.append(portrait);
  }

  const feature = document.querySelector('.sound-stage-feature');
  if (feature) {
    const artwork = editorialPicture(selectorCovers[feature.dataset.channel]);
    artwork.classList.add('station-listen-photo');
    feature.prepend(artwork);
    const updateArtwork = () => {
      const key = feature.dataset.channel;
      if (selectorCovers[key]) editorialPicture(selectorCovers[key], artwork);
    };
    new MutationObserver(updateArtwork).observe(feature, {attributes:true, attributeFilter:['data-channel']});
    updateArtwork();
  }
  const weekly = document.querySelector('[data-home-weekly-stories]');
  const addWeeklyPhotos = () => {
    for (const card of weekly.querySelectorAll('.djf-home-week-card')) {
      for (const article of card.querySelectorAll('article')) {
        if (article.querySelector('img')) continue;
        const track = article.querySelector('.djf-home-week-track')?.textContent || '';
        const key = /^Sasha ·/i.test(track) ? 'sasha-solo'
          : /^Wham!/i.test(track) ? 'wham'
          : /^GNAGS ·/i.test(track) ? 'gnags'
          : /^Baby D ·/i.test(track) ? 'dj-1994'
          : null;
        if (!key || weekly.querySelector('[data-week-photo="' + key + '"]')) continue;
        const image = editorialPicture(key);
        const figure = document.createElement('figure');
        figure.className = 'station-week-photo';
        figure.dataset.weekPhoto = key;
        const caption = document.createElement('figcaption');
        caption.textContent = image.alt;
        figure.append(image, caption);
        article.prepend(figure);
      }
    }
  };
  if (weekly) {
    new MutationObserver(addWeeklyPhotos).observe(weekly, {childList:true});
    addWeeklyPhotos();
  }

  const playlists = document.getElementById('show-playlists');
  const addPlaylistPhotos = () => {
    for (const card of playlists.querySelectorAll('.djf-playlist-card[id^="playlist-"]')) {
      const key = playlistCovers[card.id.slice(9)];
      if (key && !card.querySelector('.station-picture')) card.prepend(editorialPicture(key));
    }
  };
  if (playlists) {
    new MutationObserver(addPlaylistPhotos).observe(playlists, {childList:true, subtree:true});
    addPlaylistPhotos();
  }

  const paths = [
    {
      href:'/guides/trance-music-explained/',
      title:['Hvad er trance?', 'What is trance?', 'Was ist Trance?'],
      description:['Læs om opbygningen, breakdowns og den energi, der bærer et trance-sæt.', 'Explore the build-ups, breakdowns and energy that shape a trance set.', 'Erfahre, wie Spannungsaufbau, Breakdowns und Energie ein Trance-Set prägen.']
    },
    {
      href:'/guides/90s-eurodance-guide/',
      title:['Tilbage til 90’ernes dansegulv', 'Back to the ’90s dance floor', 'Zurück auf die Tanzfläche der 90er'],
      description:['Genfind Eurodance og de klublyde, der præger Classic Dance #90 #00.', 'Rediscover Eurodance and the club sounds behind Classic Dance #90 #00.', 'Entdecke Eurodance und die Clubsounds hinter Classic Dance #90 #00 wieder.']
    },
    {
      href:'/archive/retro-hits/', image:'record-shop',
      title:['Gå på opdagelse i Retro Hits', 'Explore the Retro Hits archive', 'Entdecke das Retro-Hits-Archiv'],
      description:['Find tidligere udsendelser og musikken fra 70’erne, 80’erne og de tidlige 90’ere.', 'Find past shows and music from the ’70s, ’80s and early ’90s.', 'Finde frühere Sendungen und Musik aus den 70ern, 80ern und frühen 90ern.']
    }
  ];
  const section = document.createElement('section');
  section.className = 'station-explore';
  section.setAttribute('aria-labelledby', 'station-explore-title');
  const title = document.createElement('h2');
  title.id = 'station-explore-title';
  const grid = document.createElement('div');
  grid.className = 'station-explore-grid';
  section.append(title, grid);
  const stories = document.getElementById('musikfortaellinger');
  (stories || news).after(section);

  // Keep the station and schedule first, then present the seasonal stories together.
  for (const id of ['jul-teaser-2026','jul-2026']) {
    const seasonal = document.getElementById(id);
    if (seasonal) section.before(seasonal);
  }

  const welcome = document.querySelector('#main > .welcome');
  if (welcome && presenter) presenter.before(welcome);

  const labels = paths.map(path => {
    const card = document.createElement('article');
    card.className = 'station-explore-card';
    const heading = document.createElement('h3');
    const description = document.createElement('p');
    const link = document.createElement('a');
    link.href = path.href;
    if (path.image) card.append(editorialPicture(path.image));
    card.append(heading, description, link);
    grid.append(card);
    return {path, heading, description, link};
  });

  function localize() {
    const language = Math.max(0, ['da','en','de'].indexOf(document.documentElement.lang.slice(0, 2)));
    title.textContent = ['Lyt videre, og kom tættere på musikken', 'Keep listening, get closer to the music', 'Weiterhören und die Musik entdecken'][language];
    for (const {path, heading, description, link} of labels) {
      heading.textContent = path.title[language];
      description.textContent = path.description[language];
      link.textContent = ['Læs videre', 'Read more', 'Weiterlesen'][language];
      link.setAttribute('aria-label', link.textContent + ' · ' + heading.textContent);
    }
  }
  localize();
  new MutationObserver(localize).observe(document.documentElement, {attributes:true, attributeFilter:['lang']});
})();
