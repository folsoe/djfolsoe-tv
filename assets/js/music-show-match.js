(() => {
"use strict";

const SHOWS = [
  {
    id:"morning",
    label:"MORNING",
    title:"Good Morning Twitch",
    desc:"Radio hits, dance-pop, Nu Disco and familiar favourites for bright, relaxed mornings.",
    href:"/shows/good-morning-twitch/",
    musicHref:"/music/",
    terms:"Radio hits · Pop · Dance-pop · Nu Disco"
  },
  {
    id:"trance",
    label:"TUESDAY · 18:30–21:30",
    title:"Trance Tuesday",
    desc:"Uplifting, progressive and classic trance with long builds, emotional breakdowns and real melodic journeys.",
    href:"/shows/trance-tuesday/",
    musicHref:"/music/trance/",
    terms:"Uplifting · Progressive · Classic Trance"
  },
  {
    id:"eurodance",
    label:"THURSDAY · 19:00–21:00",
    title:"Eurodance",
    desc:"Eurodance from 1990 forward: huge hooks, female vocals, rap verses, piano riffs, synths and forgotten gems.",
    href:"/shows/eurodance/",
    musicHref:"/music/eurodance/",
    terms:"1990 → Forward · Eurodance"
  },
  {
    id:"retro",
    label:"SUNDAY · NORMALLY 08:00–12:00",
    title:"Retro Hits",
    desc:"The chart time machine: big hits, forgotten hits and stories from 10, 20, 30, 40 and 50 years ago.",
    href:"/shows/retro-hits/",
    musicHref:"/music/retro/",
    terms:"Pop · Dance · Rock · Chart History"
  },
  {
    id:"fredagsbar",
    label:"LAST FRIDAY · 19:00 → UNTIL COLD",
    title:"Fredagsbar",
    desc:"Dance, pop, house, disco, classics, requests and understated Danish Friday chaos.",
    href:"/shows/fredagsbar/",
    musicHref:"/music/",
    terms:"Dance · Pop · House · Disco · Requests"
  },
  {
    id:"popup",
    label:"POP-UP · ANY TIME",
    title:"POP UP",
    desc:"The mixed bag between the scheduled shows. No fixed genre and no promise about where the music goes next.",
    href:"/shows/pop-up/",
    musicHref:"/music/",
    terms:"Any Genre · Requests · Old + New"
  },
  {
    id:"weekend",
    label:"FRIDAY / SATURDAY / RAIDTRAIN",
    title:"WEEKEND",
    desc:"Fresh EDM and house, raidtrain energy and selected movement from the FOLSOE Top 20.",
    href:"/shows/weekend/",
    musicHref:"/#top20",
    terms:"New EDM · House · FOLSOE Top 20"
  },
  {
    id:"nudisco",
    label:"POP-UP · FULL GENRE SESSION",
    title:"Nu Disco",
    desc:"Modern disco, funk-driven house, basslines, strings, edits and remixes with old soul and new production.",
    href:"/shows/nu-disco/",
    musicHref:"/music/nu-disco/",
    terms:"Nu Disco · Funk · Disco House · Edits"
  }
];

function q(sel, root=document){ return root.querySelector(sel); }
function qa(sel, root=document){ return [...root.querySelectorAll(sel)]; }

function setText(el, txt){ if(el && txt) el.textContent=txt; }

function rewriteAuthority(){
  // Hero
  const h1 = qa("h1").find(x => /music universe/i.test(x.textContent||""));
  if(h1){
    const sec = h1.closest("section") || h1.parentElement;
    const subtitle = qa("p", sec).find(p => /genres|eras|sounds/i.test(p.textContent||""));
    if(subtitle) setText(subtitle, "The music behind every DJ FOLSOE show — from fixed weekly formats to completely unpredictable pop-ups.");
  }

  // MUSIC AUTHORITY section
  const authority = qa("h2").find(x => /explore the sound behind dj folsoe tv/i.test(x.textContent||""));
  if(authority){
    setText(authority, "The music behind the complete DJ FOLSOE show universe");
    const sec=authority.closest("section") || authority.parentElement?.parentElement;
    const p=sec ? qa("p",sec).find(x => x.textContent.trim().length>40) : null;
    if(p) setText(p, "Every show has its own musical logic. Trance Tuesday goes deep into trance. Eurodance stays with Eurodance. Retro Hits follows chart history across genres. Weekend looks forward to new EDM, house and the FOLSOE Top 20. Good Morning Twitch, Fredagsbar and POP UP stay deliberately broader, while Nu Disco commits completely to the groove.");
  }

  const guide = qa("h2").find(x => /dj folsoe music guide/i.test(x.textContent||""));
  if(guide){
    setText(guide, "DJ FOLSOE Shows & Music Guide");
    const sec=guide.closest("section") || guide.parentElement?.parentElement;
    const p=sec ? qa("p",sec).find(x => x.textContent.trim().length>40) : null;
    if(p) setText(p, "Use the music hub as the musical map for the live channel. Every show below links the broadcast identity with the genres, eras and sounds that belong to it — while requests and live choices can still change the route.");
  }
}

function findCardContainer(){
  // Prefer the current container holding the 4 existing genre cards.
  const links=qa('a[href*="/music/"]');
  const candidates=new Map();
  for(const a of links){
    const parent=a.parentElement;
    if(!parent) continue;
    candidates.set(parent,(candidates.get(parent)||0)+1);
  }
  return [...candidates.entries()].sort((a,b)=>b[1]-a[1])[0]?.[0] || null;
}

function fillExistingCard(card, data){
  card.setAttribute("href", data.href);
  card.setAttribute("data-show-id", data.id);
  card.setAttribute("title", data.terms);

  const all=[...card.querySelectorAll("span,b,strong,h2,h3,h4,p,small")];

  // Use the existing semantic order without altering markup/classes.
  const label=all.find(x => /90s|00s|uplifting|modern disco|70s|retro|trance|eurodance/i.test(x.textContent||"")) || all[0];
  const title=all.find(x => /eurodance|trance music|retro hits|nu-disco|nu disco/i.test(x.textContent||"")) || all[1];
  const desc=all.find(x => x.tagName==="P" || x.tagName==="SMALL") || all[2];

  if(label) label.textContent=data.label;
  if(title && title!==label) title.textContent=data.title;
  if(desc && desc!==label && desc!==title) desc.textContent=data.desc;

  // Last resort: when the card is very simple, preserve tags but replace text nodes.
  if(!title){
    card.textContent="";
    const s=document.createElement("span"); s.textContent=data.label;
    const b=document.createElement("strong"); b.textContent=data.title;
    const p=document.createElement("p"); p.textContent=data.desc;
    card.append(s,b,p);
  }
}

function syncCards(){
  const container=findCardContainer();
  if(!container) return;

  const original=qa(":scope > a",container);
  if(!original.length) return;
  const template=original[0].cloneNode(true);

  SHOWS.forEach((show,i)=>{
    let card=original[i];
    if(!card){
      card=template.cloneNode(true);
      container.appendChild(card);
    }
    fillExistingCard(card,show);
  });

  // Remove only surplus old cards beyond our 8; no layout/CSS changes.
  qa(":scope > a",container).slice(SHOWS.length).forEach(x=>x.remove());
}

function rewriteGuideLinks(){
  const deep = qa("h2").find(x => /go deeper with dj folsoe guides/i.test(x.textContent||""));
  if(!deep) return;
  const sec=deep.closest("section") || deep.parentElement?.parentElement;
  if(!sec) return;

  const links=qa("a",sec);
  const guides=[
    {txt:"90s Eurodance guide",href:"/guides/eurodance/"},
    {txt:"Trance explained",href:"/guides/trance/"},
    {txt:"Retro set programming",href:"/guides/retro/"},
    {txt:"Explore all shows",href:"/shows/"}
  ];
  guides.forEach((g,i)=>{
    if(!links[i]) return;
    links[i].textContent=g.txt;
    // Preserve existing real href if already present for first 3.
    if(i===3) links[i].href=g.href;
  });
}

function addShowMetadataWithoutLayout(){
  // Make all existing show links self-descriptive for accessibility/search without visual change.
  SHOWS.forEach(s=>{
    qa(`a[href="${s.href}"]`).forEach(a=>{
      a.setAttribute("title",`${s.title}: ${s.desc}`);
      a.dataset.musicContext=s.id;
    });
  });
}

function boot(){
  rewriteAuthority();
  syncCards();
  rewriteGuideLinks();
  addShowMetadataWithoutLayout();
  document.documentElement.dataset.musicShows="8";
}

if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",boot,{once:true});
else boot();
})();