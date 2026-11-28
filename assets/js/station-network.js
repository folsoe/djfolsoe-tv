(() => {
  'use strict';
  const artwork = {
    'trance-tuesday':'trance', 'trance-music-explained':'trance', trance:'trance',
    eurodance:'eurodance', '90s-eurodance-guide':'eurodance',
    'retro-hits':'retro', 'retro-hits-dj-set-guide':'retro',
    fredagsbar:'fredagsbar', 'good-morning-twitch':'morning', 'nu-disco':'nudisco',
    weekend:'weekend', 'pop-up':'popup', charts:'top20', 'retro-top-10':'retro',
    'dj-denmark':'danske', archive:'retro', music:'nudisco', shows:'weekend',
    guides:'trance', editorial:'eurodance', community:'morning',
    commands:'popup', 'watch-live':'portrait', 'about-dj-folsoe':'portrait',
    press:'portrait', 'twitch-music-requests-guide':'morning'
  };

  function picture(key) {
    const img = document.createElement('img');
    img.className = 'station-picture';
    img.alt = '';
    img.loading = 'lazy';
    img.decoding = 'async';
    if (key === 'portrait') {
      img.classList.add('station-picture-portrait');
      img.src = '/assets/img/dj-folsoe-portrait.png';
    } else {
      img.width = 1000;
      img.height = 500;
      img.src = '/assets/img/station/' + key + '.png';
    }
    return img;
  }

  function pageArtwork(path) {
    const segments = path.split('/').filter(Boolean);
    return artwork[segments.at(-1)] || artwork[segments[0]];
  }

  const key = pageArtwork(location.pathname);
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
  const hero = document.querySelector('main .page-hero, main .v26340SubHero, main .v26400-chartHero, main .archive-hero, main .editorial-hero');
  if (hero && key) {
    const figure = document.createElement('figure');
    figure.className = 'station-page-picture';
    figure.append(picture(key));
    hero.append(figure);
  }

  for (const card of document.querySelectorAll('.show-card')) {
    const link = card.matches('a[href]') ? card : card.querySelector('a[href^="/shows/"]');
    const image = link && pageArtwork(link.pathname);
    if (image && !card.querySelector('img')) card.prepend(picture(image));
  }

  const news = document.querySelector('#musiknyheder');
  if (!news) return;

  const presenter = document.querySelector('#main > .person');
  if (presenter) {
    const portrait = picture('portrait');
    portrait.classList.add('station-person-photo');
    portrait.alt = 'Sune Folsø';
    presenter.append(portrait);
  }

  const feature = document.querySelector('.sound-stage-feature');
  if (feature) {
    const artwork = picture(feature.dataset.channel);
    artwork.classList.add('station-listen-photo');
    feature.prepend(artwork);
    const updateArtwork = () => {
      const key = feature.dataset.channel;
      if (['trance','eurodance','retro'].includes(key)) artwork.src = '/themes/' + key + '.jpg';
    };
    new MutationObserver(updateArtwork).observe(feature, {attributes:true, attributeFilter:['data-channel']});
    updateArtwork();
  }
  const paths = [
    {
      href:'/guides/trance-music-explained/', image:'trance',
      title:['Hvad er trance?', 'What is trance?', 'Was ist Trance?'],
      description:['Læs om opbygningen, breakdowns og den energi, der bærer et trance-sæt.', 'Explore the build-ups, breakdowns and energy that shape a trance set.', 'Erfahre, wie Spannungsaufbau, Breakdowns und Energie ein Trance-Set prägen.']
    },
    {
      href:'/guides/90s-eurodance-guide/', image:'eurodance',
      title:['Tilbage til 90’ernes dansegulv', 'Back to the ’90s dance floor', 'Zurück auf die Tanzfläche der 90er'],
      description:['Genfind Eurodance og de klublyde, der præger Classic Dance #90 #00.', 'Rediscover Eurodance and the club sounds behind Classic Dance #90 #00.', 'Entdecke Eurodance und die Clubsounds hinter Classic Dance #90 #00 wieder.']
    },
    {
      href:'/archive/retro-hits/', image:'retro',
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
  for (const id of ['djf-jul-historie','jul-teaser-2026','jul-2026']) {
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
    card.append(picture(path.image), heading, description, link);
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
