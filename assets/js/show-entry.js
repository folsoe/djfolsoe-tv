/* DJ FOLSOE 20–29. Existing read-only endpoints; no credentials or new service. */
(()=>{'use strict';
const API='https://djfolsoe-tv-api.sunefolsoe.workers.dev',langs=['da','en','de'],locales=['da-DK','en-GB','de-DE'],key='djf.site.language.v1';
const {liveState,nextShow}=window.DJF_BRIDGE;
window.DJF_ENTRY_STATUS={liveState,nextShow};
if(typeof document==='undefined')return;
const data=window.DJF_ENTRY_COPY;if(!data)return;
let saved='';try{saved=localStorage.getItem(key)||'';}catch{}
let lang=[new URLSearchParams(location.search).get('lang'),saved,navigator.language?.slice(0,2),'da'].find(x=>langs.includes(x)),status='loading',next={state:'error'},loadedAt=0,busy=false;
const i=()=>langs.indexOf(lang),word=k=>data[k]?.[i()]||k;
function renderStatus(){
 const live=document.getElementById('live-state'),node=document.getElementById('next-show');
 if(live){live.textContent=word(status);live.dataset.state=status;}
 if(node)node.textContent=next.state==='ready'?window.DJF_BRIDGE.nextText({next:{title:next.title,startTime:new Date(next.at).toISOString()}},i()):window.DJF_BRIDGE.nextText(null,i());
 const offline=document.getElementById('offline-visit');if(offline)offline.hidden=status!=='offline';
}
function render(){document.documentElement.lang=lang;const path=location.pathname;const titleKey=path==='/'||path==='/index.html'?'hero':/^\/(?:shows|showhub)\/(?:index.html)?$/.test(path)?'all':path.startsWith('/charts/')?'charts':path.startsWith('/music/')?'music':path.startsWith('/commands/')?'join':null;if(titleKey)document.title=word(titleKey).replace(/\n/g,' ')+' | DJ FOLSOE';document.querySelectorAll('[data-copy]').forEach(n=>n.textContent=word(n.dataset.copy));document.querySelectorAll('[data-lang]').forEach(n=>n.setAttribute('aria-pressed',String(n.dataset.lang===lang)));document.querySelectorAll('a[href^="/"]').forEach(a=>{const u=new URL(a.getAttribute('href'),location.origin);u.searchParams.set('lang',lang);a.href=u.pathname+u.search+u.hash;});
 const desc=path.startsWith('/shows/')&&data['desc_'+document.documentElement.dataset.show]||data.lead;document.querySelector('meta[name="description"]')?.setAttribute('content',desc[i()]);renderStatus();}
function setLanguage(value,persist=true){if(!langs.includes(value))return;lang=value;if(persist){try{localStorage.setItem(key,lang);}catch{}const u=new URL(location.href);u.searchParams.set('lang',lang);try{history.replaceState(null,'',u);}catch{}}render();window.dispatchEvent(new CustomEvent('djf:languagechange',{detail:{language:lang}}));}
window.DJF_I18N={get language(){return lang},get locale(){return locales[i()]},setLanguage,t:k=>word(k)};
document.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>setLanguage(b.dataset.lang)));
window.addEventListener('storage',e=>{if(e.key===key)setLanguage(e.newValue,false);});
async function get(path){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000);try{const r=await fetch(API+path,{cache:'no-store',credentials:'omit',signal:controller.signal});if(!r.ok)throw Error('HTTP '+r.status);return await r.json();}finally{clearTimeout(timer);}}
async function refresh(){if(busy||document.hidden||!document.getElementById('live-state'))return;busy=true;const button=document.getElementById('refresh');if(button)button.disabled=true;try{const [a,b]=await Promise.allSettled([get('/api/twitch'),get('/api/twitch-schedule')]);status=a.status==='fulfilled'?liveState(a.value):'unknown';next=b.status==='fulfilled'?nextShow(b.value):{state:'error'};loadedAt=Date.now();renderStatus();window.dispatchEvent(new CustomEvent('djf:twitch-status',{detail:{status,payload:a.status==='fulfilled'?a.value:null}}));}finally{busy=false;if(button)button.disabled=false;}}
document.getElementById('refresh')?.addEventListener('click',refresh);
let timer;function startPolling(){if(timer)return;timer=setInterval(()=>{if(!document.hidden){if(loadedAt&&Date.now()-loadedAt>120000){status='unknown';next={state:'error'};renderStatus();}refresh();}},60000);}
document.addEventListener('visibilitychange',()=>{if(!document.hidden){if(Date.now()-loadedAt>120000){status='unknown';next={state:'error'};renderStatus();}refresh();}});
window.addEventListener('pagehide',()=>{clearInterval(timer);timer=null;});
window.addEventListener('pageshow',()=>{startPolling();refresh();});startPolling();
const form=document.getElementById('request-form');if(form)form.addEventListener('submit',async e=>{e.preventDefault();const artist=document.getElementById('artist').value.replace(/\s+/g,' ').trim(),track=document.getElementById('track').value.replace(/\s+/g,' ').trim();if(!artist||!track)return;const output=document.getElementById('request-result'),feedback=document.getElementById('request-feedback');output.value=['ønske: ','request: ','wunsch: '][i()]+artist+' - '+track;output.hidden=false;try{await navigator.clipboard.writeText(output.value);feedback.textContent=word('copied');}catch{feedback.textContent=word('copyfail');output.focus();output.select();}});
document.getElementById('player-details')?.addEventListener('toggle',e=>{const mount=document.getElementById('player-mount');if(e.target.open&&!mount.firstChild&&/^https?:$/.test(location.protocol)){const f=document.createElement('iframe');f.src='https://player.twitch.tv/?channel=djfolsoe&parent='+encodeURIComponent(location.hostname)+'&autoplay=false';f.title='DJ FOLSOE · Twitch';f.allowFullscreen=true;mount.append(f);}else if(!e.target.open)mount.replaceChildren();});
render();refresh();
})();


/* Editorial navigation for the public homepage and show pages. */
(() => {
  'use strict';

  const main = document.querySelector('main#main');
  const path = location.pathname.replace(/index\.html$/, '');
  const home = path === '/';
  const guide = path === '/shows/';
  const show = /^\/shows\/[^/]+\/$/.test(path);
  const hero = main?.querySelector(home ? '.hero' : '.page-hero');
  if (!hero || !(home || guide || show)) return;

  const copy = {
    homeStories: ['Ugens musikfortællinger', 'This week’s music stories', 'Musikgeschichten der Woche'],
    playlists: ['Ugens playlister', 'This week’s playlists', 'Playlists der Woche'],
    choose: ['Vælg dit show', 'Choose your show', 'Wähle deine Show'],
    stories: ['Historier bag musikken', 'Stories behind the music', 'Geschichten hinter der Musik'],
    listen: ['Lyt efter', 'Listen for', 'Hör hin'],
    chat: ['Spørgsmål til chatten', 'A question for chat', 'Eine Frage für den Chat'],
    guide: [
      'Vælg en aften efter lyden. Gå efter de lange melodier til Trance Tuesday, klubminderne til Classic Dance eller søndagsfavoritterne til Retro Hits.',
      'Pick a show by sound. Try Trance Tuesday for long melodies, Classic Dance for club memories or Retro Hits for Sunday favourites.',
      'Wähle nach Klang. Trance Tuesday für lange Melodien, Classic Dance für Cluberinnerungen oder Retro Hits für Sonntagsfavoriten.',
    ],
  };

  const showGuide = {
    'trance-tuesday': [
      ['Hør efter den lille melodi, der bliver liggende, når trommerne træder væk. Når beatet vender tilbage, har melodien ofte fået en helt anden vægt.', 'Listen for the melody that stays when the drums drop away. When the beat returns, the same melody can feel completely different.', 'Hör auf die Melodie, die bleibt, wenn die Drums wegfallen. Kehrt der Beat zurück, kann dieselbe Melodie ganz anders wirken.'],
      ['Hvilket breakdown kunne du blive i lidt længere?', 'Which breakdown would you happily stay in a little longer?', 'In welchem Break würdest du gern etwas länger bleiben?'],
    ],
    eurodance: [
      ['Prøv at høre forskellen på 90’ernes hurtige skift mellem rap og omkvæd og 00’ernes længere opbygninger. Begge kan få hele gulvet til at synge.', 'Listen for the shift from quick ’90s rap-and-chorus exchanges to longer ’00s builds. Both can get the room singing.', 'Achte auf den Unterschied zwischen dem schnellen Wechsel von Rap und Refrain in den 90ern und den längeren Aufbauten der 00er. Mitsingen geht bei beiden.'],
      ['Hvilket omkvæd sidder stadig fast fra din første skolefest?', 'Which chorus still takes you back to your first school disco?', 'Welcher Refrain erinnert dich noch an deine erste Schuldisco?'],
    ],
    'retro-hits': [
      ['Vælg én gammel favorit og følg bassen hele vejen gennem omkvædet. Der gemmer sig ofte en anden melodi under den, du allerede kan udenad.', 'Pick an old favourite and follow the bass through the chorus. There is often a second melody underneath the one you already know by heart.', 'Such dir einen alten Lieblingssong aus und folge dem Bass durch den Refrain. Unter der vertrauten Melodie versteckt sich oft eine zweite.'],
      ['Hvilken sang kunne få dig til at skrue op i bilen, selv om du næsten var hjemme?', 'Which song would make you turn up the radio even when you were almost home?', 'Bei welchem Song würdest du das Radio aufdrehen, obwohl du fast zu Hause bist?'],
    ],
    fredagsbar: [
      ['Lyt til, hvordan et genkendeligt omkvæd kan skifte stemningen i rummet. Det er ofte dér, fyraften bliver til en fest.', 'Listen for the familiar chorus that changes the mood in the room. That is often when the end of work becomes a party.', 'Achte darauf, wie ein vertrauter Refrain die Stimmung im Raum verändert. Genau da wird aus Feierabend oft eine Party.'],
      ['Hvad er din sang, når arbejdsugen er slut?', 'What’s your song for the end of the working week?', 'Was ist dein Song zum Feierabend am Freitag?'],
    ],
    'good-morning-twitch': [
      ['Læg mærke til, hvordan de første numre åbner morgenen: en tydelig vokal, lidt luft omkring beatet og gradvist mere bevægelse.', 'Notice how the opening tracks wake up the morning: a clear voice, room around the beat and gradually more movement.', 'Achte darauf, wie die ersten Songs den Morgen öffnen: eine klare Stimme, Platz um den Beat und allmählich mehr Bewegung.'],
      ['Hvilken sang må gerne afløse dit vækkeur?', 'Which song would you let replace your alarm clock?', 'Welcher Song dürfte deinen Wecker ersetzen?'],
    ],
    weekend: [
      ['Følg stemningen gennem genreskiftene. En basgang, en vokal eller bare et godt omkvæd kan være det, der binder to vidt forskellige numre sammen.', 'Follow the mood through the genre changes. A bassline, a voice or a good chorus can connect two very different tracks.', 'Folge der Stimmung durch die Genrewechsel. Eine Basslinie, eine Stimme oder ein guter Refrain kann zwei ganz unterschiedliche Songs verbinden.'],
      ['Køkkenfest, biltur eller langsom søndag: hvor passer dagens musik ind hos dig?', 'Kitchen party, road trip or slow Sunday: where does today’s music fit for you?', 'Küchenparty, Autofahrt oder ruhiger Sonntag: Wohin passt die heutige Musik bei dir?'],
    ],
    'nu-disco': [
      ['Følg basgangen, når hi-hatten åbner, eller strygerne kommer ind. Små ændringer i lagene får ofte et groove til at føles helt nyt.', 'Follow the bassline when the hi-hat opens or the strings enter. Small changes in the layers often make a groove feel new.', 'Folge der Basslinie, wenn sich die Hi-Hat öffnet oder die Streicher einsetzen. Kleine Veränderungen können einen Groove ganz neu wirken lassen.'],
      ['Hvilken basgang får dig til at vippe med foden med det samme?', 'Which bassline makes your foot tap immediately?', 'Bei welcher Basslinie wippst du sofort mit dem Fuß?'],
    ],
    'pop-up': [
      ['Lyt efter, hvad der forbinder to numre, selv når de kommer fra vidt forskellige år. Måske er det rytmen, måske en stemning, der hænger ved.', 'Listen for what connects tracks from very different years. It might be the rhythm or simply a mood that lingers.', 'Hör darauf, was Stücke aus ganz unterschiedlichen Jahren verbindet. Vielleicht ist es der Rhythmus oder einfach eine Stimmung, die bleibt.'],
      ['Hvilken musikalsk omvej skal vi tage næste gang?', 'What musical detour should we take next time?', 'Welchen musikalischen Umweg sollen wir nächstes Mal nehmen?'],
    ],
  };

  function make(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  }

  function addLink(nav, label, hash) {
    if (!document.getElementById(hash)) return;
    const link = make('a', '', label);
    link.href = '#' + hash;
    nav.append(link);
  }

  function render() {
    const lang = Math.max(0, ['da', 'en', 'de'].indexOf(document.documentElement.lang.split('-')[0]));
    const nav = make('nav', 'editorial-jump');
    if (home) {
      addLink(nav, copy.homeStories[lang], 'musikfortaellinger');
      addLink(nav, copy.playlists[lang], 'show-playlists');
      addLink(nav, copy.choose[lang], 'shows');
    } else if (guide) {
      addLink(nav, copy.choose[lang], 'editorial-show-grid');
    } else {
      addLink(nav, copy.stories[lang], 'historier');
      const playlists = main.querySelector('[data-djf-playlists]');
      if (playlists) {
        if (!playlists.id) playlists.id = 'show-playlists';
        addLink(nav, copy.playlists[lang], playlists.id);
      }
    }
    if (nav.childElementCount) nav.setAttribute('aria-label', copy.choose[lang]);

    const oldNav = hero.querySelector('.editorial-jump');
    if (oldNav) oldNav.replaceWith(nav);
    else (home ? hero.firstElementChild : hero).append(nav);

    const strip = make('div', 'editorial-listen-strip');
    const tip = showGuide[path.split('/')[2]];
    if (tip) {
      for (const [index, heading] of [copy.listen[lang], copy.chat[lang]].entries()) {
        const item = make('div');
        item.append(make('h2', '', heading), make('p', '', tip[index][lang]));
        strip.append(item);
      }
    } else if (guide) {
      strip.append(make('p', '', copy.guide[lang]));
    }
    const oldStrip = main.querySelector('.editorial-listen-strip');
    if (oldStrip) oldStrip.replaceWith(strip);
    else if (strip.childElementCount) hero.after(strip);
  }

  document.documentElement.dataset.editorialPage = home ? 'home' : guide ? 'guide' : 'show';
  if (guide) {
    const grid = main.querySelector('.show-grid');
    if (grid && !grid.id) grid.id = 'editorial-show-grid';
  }
  for (const card of main.querySelectorAll('.show-card, .home-editorial-card')) {
    const slug = new URL(card.href).pathname.split('/')[2];
    if (slug) card.dataset.showCard = slug;
  }
  window.addEventListener('djf:languagechange', render);
  render();
})();


/* The weekly show selector lends the public front page the rhythm of a TV programme. */
(() => {
  'use strict';
  const main = document.getElementById('main');
  if (document.documentElement.dataset.editorialPage !== 'home' || !main) return;
  const signal = main.querySelector('.signal');
  if (!signal) return;

  const langIndex = () => Math.max(0, ['da', 'en', 'de'].indexOf(document.documentElement.lang.split('-')[0]));
  const labels = {
    title: ['Find din lyd', 'Find your sound', 'Finde deinen Sound'],
    open: ['Gå til showet', 'Explore the show', 'Zur Show'],
    music: ['Ugens playliste', 'This week’s playlist', 'Playlist der Woche'],
    time: ['Dansk tid', 'Denmark time', 'Dänische Zeit'],
  };
  const shows = [
    {
      name: 'Trance Tuesday', id: 'trance', path: 'trance-tuesday',
      genre: ['Melodisk trance', 'Melodic trance', 'Melodic Trance'],
      day: ['Tirsdag', 'Tuesday', 'Dienstag'], time: '18.30–21.30',
      line: ['Fra det første pulsslag til det drop, du har ventet på hele aftenen.', 'From the first pulse to the drop you’ve been waiting for all night.', 'Vom ersten Puls bis zum Drop, auf den du den ganzen Abend gewartet hast.'],
    },
    {
      name: 'Classic Dance #90 #00', id: 'eurodance', path: 'eurodance',
      genre: ['Klubklassikere', 'Club classics', 'Clubklassiker'],
      day: ['Torsdag', 'Thursday', 'Donnerstag'], time: '19.00–21.00',
      line: ['To årtier med store omkvæd, danske klubhits og numre, der stadig fylder gulvet.', 'Two decades of big choruses, Danish club hits and records that still fill the floor.', 'Zwei Jahrzehnte voller großer Refrains, dänischer Clubhits und Songs, die heute noch die Tanzfläche füllen.'],
    },
    {
      name: 'Retro Hits', id: 'retro', path: 'retro-hits',
      genre: ['Pop, soul og disco', 'Pop, soul and disco', 'Pop, Soul und Disco'],
      day: ['Søndag', 'Sunday', 'Sonntag'], time: '08.00–12.00',
      line: ['Radiofavoritter, de glemte B-sider og sangene, der stadig kan åbne et helt musikminde.', 'Radio favourites, forgotten B-sides and songs that can bring a whole memory back.', 'Radiofavoriten, vergessene B-Seiten und Songs, die eine ganze Erinnerung zurückholen.'],
    },
  ];

  function node(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  }

  const section = node('section', 'sound-stage');
  section.setAttribute('aria-labelledby', 'sound-stage-heading');
  const heading = node('h2');
  heading.id = 'sound-stage-heading';
  const row = node('div', 'sound-stage-row');
  const choices = node('div', 'sound-stage-choices');
  const stage = node('div', 'sound-stage-feature');
  stage.id = 'sound-stage-feature';
  const title = node('h3');
  const time = node('p', 'sound-stage-time');
  const description = node('p', 'sound-stage-description');
  const actions = node('div', 'sound-stage-actions');
  const detail = node('a');
  const playlist = node('a');
  actions.append(detail, playlist);
  stage.append(time, title, description, actions);
  row.append(choices, stage);
  section.append(heading, row);

  let selected = 0;
  const buttons = shows.map((show, index) => {
    const button = node('button', 'sound-stage-choice');
    button.type = 'button';
    button.dataset.channel = show.id;
    button.setAttribute('aria-controls', stage.id);
    button.append(node('span', '', show.name), node('small'));
    button.addEventListener('click', () => {
      selected = index;
      render();
    });
    choices.append(button);
    return button;
  });

  function render() {
    const lang = langIndex();
    const show = shows[selected];
    heading.textContent = labels.title[lang];
    stage.dataset.channel = show.id;
    buttons.forEach((button, index) => {
      button.setAttribute('aria-pressed', String(index === selected));
      button.lastElementChild.textContent = shows[index].genre[lang];
    });
    time.textContent = show.day[lang] + ' · ' + show.time + ' · ' + labels.time[lang];
    title.textContent = show.name;
    description.textContent = show.line[lang];
    detail.textContent = labels.open[lang];
    detail.href = '/shows/' + show.path + '/?lang=' + document.documentElement.lang;
    playlist.textContent = labels.music[lang];
    playlist.href = '#playlist-' + show.id;
  }

  signal.after(section);
  window.addEventListener('djf:languagechange', render);
  render();
})();
