/* DJ FOLSOE V26110 — THEME-AWARE WEBSITE CONTENT SYSTEM
   Website-only bridge. It never writes to StreamElements or overlay state. */
(() => {
  "use strict";
  const API = 'https://djfolsoe-tv-api.sunefolsoe.workers.dev';
  const BUILD = 'V26110';
  let lastRevision = '';

  const clean = value => String(value ?? '').trim();
  const pick = (...values) => values.find(v => clean(v)) || '';
  const themeId = value => clean(value).toLowerCase().replace(/\s+/g, '-').replace(/_/g, '-');
  const byId = id => document.getElementById(id);
  const text = (id, value) => { const node=byId(id), v=clean(value); if(node&&v) node.textContent=v; };
  const safeUrl = value => { try { const u=new URL(clean(value), location.href); return ['http:','https:','#'].includes(u.protocol)||clean(value).startsWith('#') ? u.href : ''; } catch(_){ return clean(value).startsWith('#')?clean(value):''; } };

  function renderShows(shows) {
    if (!Array.isArray(shows) || !shows.length) return;
    const grid = document.querySelector('#shows .showGrid');
    if (!grid) return;
    const valid = shows.filter(show => show && show.enabled !== false && pick(show.title, show.name)).slice(0, 12);
    if (!valid.length) return;
    const fragment = document.createDocumentFragment();
    valid.forEach(show => {
      const article=document.createElement('article'), small=document.createElement('small'), h3=document.createElement('h3'), p=document.createElement('p');
      small.textContent=pick(show.time,show.day,show.timeLabel,'LIVE SHOW');
      h3.textContent=pick(show.title,show.name);
      p.textContent=pick(show.description,show.text,'DJ FOLSOE live on Twitch.');
      article.append(small,h3,p); fragment.appendChild(article);
    });
    grid.replaceChildren(fragment);
  }

  function renderChart(items, heading='') {
    if (heading) text('cmsChartHeading', heading);
    if (!Array.isArray(items) || !items.length) return;
    const grid=byId('cmsChartGrid'); if(!grid) return;
    const valid=items.filter(item=>item&&pick(item.title,item.track,item.song,item.name)).slice(0,20);
    if(!valid.length)return;
    const fragment=document.createDocumentFragment();
    valid.forEach((item,index)=>{
      const article=document.createElement('article');
      const rank=document.createElement('b');
      const copy=document.createElement('span');
      const title=document.createElement('strong');
      const meta=document.createElement('small');
      const pos=Number(item.position||item.rank||index+1);
      rank.textContent=String(pos).padStart(2,'0');
      title.textContent=pick(item.title,item.track,item.song,item.name);
      meta.textContent=pick(item.artist,item.subtitle,item.description,'DJ FOLSOE CHART');
      const movement=clean(item.movement||item.status).toLowerCase();
      if(/new/.test(movement))article.classList.add('isNew');
      else if(/up|rise/.test(movement))article.classList.add('isUp');
      else if(/down|fall/.test(movement))article.classList.add('isDown');
      copy.append(title,meta); article.append(rank,copy); fragment.appendChild(article);
    });
    grid.replaceChildren(fragment);
    text('cmsChartStatus', `${valid.length} TRACKS`);
  }

  function applyModuleConfig(core){
    const modules = core?.experience?.website?.modules || core?.website?.modules || core?.modules?.website || [];
    const configured = new Map(Array.isArray(modules)?modules.map(m=>[clean(m?.id),m]):[]);
    document.querySelectorAll('[data-cms-module]').forEach((node,index)=>{
      const id=clean(node.dataset.cmsModule); const item=configured.get(id);
      if(item){
        node.hidden=item.enabled===false;
        const order=Number(item.order); node.style.setProperty('--cms-order',Number.isFinite(order)?order:index*10+10);
        node.dataset.cmsMode=clean(item.mode)||'default';
      } else {
        node.hidden=false;
        node.style.setProperty('--cms-order',node.dataset.cmsOrder||index*10+10);
      }
    });
  }

  function apply(payload) {
    const core=payload?.data||payload?.core||payload||{};
    if(!core||typeof core!=='object')return false;
    const hero=core.hero||{}, next=core.nextShow||{}, community=core.community||{}, theme=core.theme||{}, show=core.show||{};
    const story=core.story||core.editorial||{}, special=core.specialEvent||community.specialEvent||{}, chart=core.top20||core.chart||[];

    text('cmsHeroEyebrow',hero.eyebrow); text('cmsHeroTitle',hero.title); text('cmsHeroLead',pick(hero.text,hero.subtitle));
    text('deskTitle',pick(show.title,show.current,hero.title)); text('deskText',pick(core.overlay?.infoLine,community.requestText,hero.subtitle));
    text('theme',pick(theme.title,theme.id)); text('offlineNextTitle',pick(next.title,next.show)); text('offlineNextDate',pick(next.timeLabel,next.description));
    text('heroChannelText',pick(community.specialEvent?.text,community.specialEvent,next.description));
    text('webDockLiveTitle',pick(show.title,show.current,hero.title)); text('webDockNextTitle',pick(next.title,next.show)); text('webDockNextTime',pick(next.timeLabel,next.description));
    text('automationNextTitle',pick(next.title,next.show)); text('automationNextDate',pick(next.timeLabel,next.description)); text('siteShowGenre',pick(show.genre,show.description,hero.subtitle));

    text('cmsStoryEyebrow',story.eyebrow); text('cmsStoryTitle',story.title); text('cmsStoryText',pick(story.text,story.description));
    const storyAction=byId('cmsStoryAction'), storyHref=safeUrl(story.url||story.link||'#live');
    if(storyAction&&storyHref){storyAction.href=storyHref;text('cmsStoryAction',pick(story.actionText,story.buttonText,'WATCH THE CHANNEL →'));}
    text('cmsSpecialTitle',pick(special.title,special.name)); text('cmsSpecialText',pick(special.text,special.description)); text('cmsSpecialBadge',pick(special.badge,special.dateLabel,'FOLSOE TV'));

    renderShows(core.featuredShows||core.shows);
    renderChart(Array.isArray(chart)?chart:(chart.items||chart.entries||[]),pick(chart.title,chart.heading));
    applyModuleConfig(core);

    const id=themeId(theme.id||next.theme);
    if(id){document.body.dataset.showTheme=id;document.documentElement.dataset.djfTheme=id;}
    lastRevision=clean(core.revision||core.updatedAt||payload.updatedAt);
    document.documentElement.dataset.djfCmsRevision=lastRevision;
    document.documentElement.dataset.cmsSync='ready';
    window.dispatchEvent(new CustomEvent('djf:v26110-site-applied',{detail:{core,revision:lastRevision}}));
    return true;
  }

  async function refresh(){
    document.documentElement.dataset.cmsSync='loading';
    try{
      const response=await fetch(`${API}/api/broadcast?v=${Date.now()}`,{cache:'no-store',headers:{Accept:'application/json'}});
      if(!response.ok)throw new Error(`HTTP ${response.status}`);
      return apply(await response.json());
    }catch(error){document.documentElement.dataset.cmsSync='error';console.warn('V26110 CMS fallback active',error);return false;}
  }

  function start(){
    document.documentElement.dataset.djfSiteBuild=BUILD;
    refresh(); setInterval(refresh,30000);
    window.addEventListener('focus',refresh);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
    window.DJF_V26110_SITE={refresh,apply,status:()=>({ready:true,build:BUILD,revision:lastRevision,sync:document.documentElement.dataset.cmsSync})};
    console.info('DJ FOLSOE V26110 Theme-Aware Website Content ready');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true}); else start();
})();
