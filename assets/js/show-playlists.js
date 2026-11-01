/* Official Spotify embeds only. No playback API, tokens, autoplay or track scraping. */
(()=>{'use strict';
const mounts=[...document.querySelectorAll('[data-djf-playlists]')];if(!mounts.length)return;
const languages=['da','en','de'],accents={retro:'#f7cd7d',trance:'#9bf9ff',eurodance:'#eaff46'};
const copy={
 tag:['MUSIKKEN FORTSÆTTER','KEEP THE MUSIC GOING','DIE MUSIK GEHT WEITER'],
 heading:['Ugens playlister','This week’s playlists','Die Playlists der Woche'],
 lead:['Find nye favoritter fra Retro Hits, Trance Tuesday og Classic Dance. Hvert show har sin egen Spotify-playliste.','Discover favourites from Retro Hits, Trance Tuesday and Classic Dance. Each show has its own Spotify playlist.','Entdecke Lieblingssongs aus Retro Hits, Trance Tuesday und Classic Dance. Jede Show hat ihre eigene Spotify-Playlist.'],
 showLead:['Tag musikken med videre. Find showets aktuelle udvalg på Spotify.','Take the music with you. Discover the show’s current selection on Spotify.','Nimm die Musik mit. Entdecke die aktuelle Auswahl der Show auf Spotify.'],
 retro:['70’ere, 80’ere og tidlige 90’ere. Danske favoritter, internationale hits og glemte perler.','The ’70s, ’80s and early ’90s. Danish favourites, international hits and forgotten gems.','70er, 80er und frühe 90er. Dänische Favoriten, internationale Hits und vergessene Perlen.'],
 trance:['Melodier, lange opbygninger og uplifting energi. En rejse ind i trancen.','Melodies, long builds and uplifting energy. A journey into trance.','Melodien, lange Spannungsbögen und Uplifting-Energie. Eine Reise in den Trance.'],
 eurodance:['Dance fra 1990–2009. Eurodance, house, vokaltrance og klubklassikere.','Dance from 1990–2009. Eurodance, house, vocal trance and club classics.','Dance von 1990–2009. Eurodance, House, Vocal Trance und Clubklassiker.'],
 open:['Åbn Spotify-afspilleren','Open the Spotify player','Spotify-Player öffnen'],
 close:['Luk Spotify-afspilleren','Close the Spotify player','Spotify-Player schließen'],
 link:['Åbn playlisten i Spotify ↗','Open the playlist in Spotify ↗','Playlist in Spotify öffnen ↗'],
 disclosure:['Spotify indlæses først, når du åbner afspilleren. Spotify kan behandle data og bruge cookies.','Spotify loads only when you open the player. Spotify may process data and use cookies.','Spotify wird erst beim Öffnen des Players geladen. Spotify kann Daten verarbeiten und Cookies verwenden.'],
 privacy:['Spotifys privatlivspolitik ↗','Spotify Privacy Policy ↗','Spotify-Datenschutzrichtlinie ↗'],
 help:['Afspilning og eventuelle forhåndslytninger styres af Spotify og kan afhænge af login, abonnement og browser.','Playback and any previews are controlled by Spotify and may depend on sign-in, subscription and browser.','Wiedergabe und eventuelle Hörproben werden von Spotify gesteuert und können von Anmeldung, Abo und Browser abhängen.'],
 unavailable:['Playlisterne kunne ikke hentes. Prøv igen senere.','The playlists could not be loaded. Please try again later.','Die Playlists konnten nicht geladen werden. Bitte versuche es später erneut.']
};
const lang=()=>languages.includes(document.documentElement.lang)?document.documentElement.lang:'da';
const tr=k=>copy[k]?.[languages.indexOf(lang())]||k;
const days={SU:['Søndag','Sunday','Sonntag'],TU:['Tirsdag','Tuesday','Dienstag'],TH:['Torsdag','Thursday','Donnerstag']};
function renderTimes(){document.querySelectorAll('[data-playlist-day]').forEach(n=>{const i=languages.indexOf(lang());n.textContent=days[n.dataset.playlistDay][i]+' · '+n.dataset.playlistTime+' · '+['dansk tid','Danish time','dänische Zeit'][i];});}
function node(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;}
function translated(tag,cls,key){const n=node(tag,cls,tr(key));n.dataset.playlistCopy=key;return n;}
function refresh(){document.querySelectorAll('[data-playlist-copy]').forEach(n=>n.textContent=tr(n.dataset.playlistCopy));document.querySelectorAll('[data-playlist-toggle]').forEach(b=>{b.textContent=tr(b.getAttribute('aria-expanded')==='true'?'close':'open');});renderTimes();}
function build(mount,shows){
 const selected=mount.dataset.playlistShow,keys=selected?[selected]:['retro','trance','eurodance'];
 const heading=node('div','djf-playlist-heading'),intro=node('div');intro.append(translated('p','eyebrow','tag'),translated('h2','','heading'),translated('p','',selected?'showLead':'lead'));heading.append(intro);
 const grid=node('div','djf-playlist-grid');
 for(const key of keys){const show=shows[key];if(!show||!accents[key]||!(/^[a-zA-Z0-9]{22}$/).test(show.id))continue;
  const card=node('article','djf-playlist-card');card.id='playlist-'+key;card.style.setProperty('--playlist-accent',accents[key]);
  const motif=node('div','djf-playlist-motif');motif.setAttribute('aria-hidden','true');motif.append(node('span','','DJ FOLSOE / SELECTED'));
  const actions=node('div','djf-playlist-actions'),button=translated('button','','open'),link=translated('a','','link');button.type='button';button.dataset.playlistToggle=key;button.setAttribute('aria-expanded','false');button.setAttribute('aria-controls','spotify-frame-'+key);
  link.href='https://open.spotify.com/playlist/'+show.id;link.target='_blank';link.rel='noopener noreferrer';
  const disclosure=node('p','djf-playlist-disclosure'),privacy=translated('a','','privacy');privacy.href='https://www.spotify.com/legal/privacy-policy/';privacy.target='_blank';privacy.rel='noopener noreferrer';disclosure.append(translated('span','','disclosure'),document.createTextNode(' '),privacy);
  const frame=node('div','djf-playlist-frame');frame.id='spotify-frame-'+key;frame.hidden=true;
  button.addEventListener('click',()=>{const open=button.getAttribute('aria-expanded')!=='true';button.setAttribute('aria-expanded',String(open));button.textContent=tr(open?'close':'open');frame.hidden=!open;
   if(open){const iframe=document.createElement('iframe');iframe.title='Spotify · '+show.name;iframe.src='https://open.spotify.com/embed/playlist/'+show.id;iframe.width='100%';iframe.height='352';iframe.allow='autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';iframe.allowFullscreen=true;iframe.loading='lazy';frame.replaceChildren(iframe);}else frame.replaceChildren();
  });
  actions.append(button,link);card.append(motif,node('p','eyebrow','DJ FOLSOE · SPOTIFY'),node('h3','',show.name));const schedule=show.schedule;if(days[schedule?.day]&&/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(schedule.start)&&/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(schedule.end)){const time=node('p','djf-playlist-time');time.dataset.playlistDay=schedule.day;time.dataset.playlistTime=schedule.start+'–'+schedule.end;card.append(time);}card.append(translated('p','',key),actions,disclosure,frame);grid.append(card);
 }
 if(!grid.children.length)throw Error('No valid playlists');mount.replaceChildren(heading,grid,translated('p','djf-playlist-help','help'));
}
const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),8000);
fetch('/assets/data/show-playlists.json',{credentials:'omit',signal:controller.signal}).then(r=>{if(!r.ok)throw Error('Unavailable');return r.json();}).then(data=>{if(data.schema!==1||!data.shows)throw Error('Invalid data');mounts.forEach(m=>build(m,data.shows));refresh();const key=location.hash.slice(1);if(/^playlist-(retro|trance|eurodance)$/.test(key))document.getElementById(key)?.scrollIntoView({block:'start'});}).catch(()=>mounts.forEach(m=>m.replaceChildren(translated('p','djf-playlist-error','unavailable')))).finally(()=>clearTimeout(timeout));
window.addEventListener('djf:languagechange',refresh);new MutationObserver(refresh).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
})();
