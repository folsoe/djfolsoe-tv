(() => {
  'use strict';
  const languages = ['da','en','de'];
  const query = new URLSearchParams(location.search);
  const genres = {
    'trance-tuesday':['electronic'],
    eurodance:['electronic','retro'],
    'retro-hits':['retro','relaxed'],
    'good-morning-twitch':['relaxed'],
    fredagsbar:['party'],
    weekend:['party'],
    'nu-disco':['electronic','party'],
    'pop-up':['party','relaxed']
  };
  const common = {
    all:['Alle','All','Alle'],
    clear:['Nulstil','Reset','Zurücksetzen'],
    empty:['Ingen resultater. Prøv en anden søgning.','No results. Try a different search.','Keine Treffer. Versuche eine andere Suche.']
  };
  function mount({section,result,cardSelector,id,filters,searchLabel,tags,searchText}) {
    const root = document.querySelector(section);
    const grid = root?.querySelector(result);
    if (!grid) return;

    const controls = document.createElement('div');
    controls.className = 'station-filter';
    const group = document.createElement('div');
    group.className = 'station-filter-options';
    group.setAttribute('role','group');
    const searchRow = document.createElement('div');
    searchRow.className = 'station-filter-search';
    const label = document.createElement('label');
    label.htmlFor = 'station-search-' + id;
    const search = document.createElement('input');
    search.id = label.htmlFor;
    search.type = 'search';
    search.value = (query.get(id + '-q') || '').slice(0,100);
    search.maxLength = 100;
    const clear = document.createElement('button');
    clear.type = 'button';
    const status = document.createElement('p');
    status.className = 'station-filter-status';
    status.setAttribute('role','status');
    searchRow.append(label,search,clear);
    controls.append(group,searchRow,status);
    grid.before(controls);

    const valid = new Set(filters.map(([key]) => key));
    let active = valid.has(query.get(id)) ? query.get(id) : 'all';
    const buttons = [['all',common.all],...filters].map(([key,words]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.addEventListener('click',() => {active = key;update();});
      group.append(button);
      return {key,words,button};
    });

    function render() {
      const lang = Math.max(0,languages.indexOf(document.documentElement.lang.slice(0,2)));
      label.textContent = searchLabel[lang];
      group.setAttribute('aria-label',searchLabel[lang]);
      clear.textContent = common.clear[lang];
      buttons.forEach(({key,words,button}) => {
        button.textContent = words[lang];
        button.setAttribute('aria-pressed', String(active === key));
      });
      const text = search.value.trim().toLocaleLowerCase();
      let count = 0;
      const cards = [...grid.querySelectorAll(cardSelector)];
      for (const card of cards) {
        const visible = (active === 'all' || tags(card).includes(active)) &&
          (!text || searchText(card).toLocaleLowerCase().includes(text));
        card.hidden = !visible;
        if (visible) count++;
      }
      status.textContent = !cards.length ? '' : count ? [
        count + ' af ' + cards.length,
        count + ' of ' + cards.length,
        count + ' von ' + cards.length
      ][lang] : common.empty[lang];
      clear.disabled = active === 'all' && !search.value;
    }

    function update() {
      render();
      const url = new URL(location.href);
      if (active === 'all') url.searchParams.delete(id); else url.searchParams.set(id,active);
      const value = search.value.trim();
      if (value) url.searchParams.set(id + '-q',value); else url.searchParams.delete(id + '-q');
      try { history.replaceState(history.state,'',url); } catch {}
    }

    search.addEventListener('input',update);
    clear.addEventListener('click',() => { active = 'all'; search.value = ''; update(); search.focus(); });
    new MutationObserver(render).observe(grid,{childList:true});
    new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
    render();
  }

  mount({
    section:'#shows',result:'.show-grid',cardSelector:'.show-card',id:'show',
    searchLabel:['Søg efter et show','Search shows','Shows suchen'],
    filters:[
      ['electronic',['Elektronisk','Electronic','Elektronisch']],
      ['retro',['Retro','Retro','Retro']],
      ['party',['Fest og weekend','Party and weekend','Party und Wochenende']],
      ['relaxed',['Rolig start','Easy listening','Entspannt hören']]
    ],
    tags:card => genres[card.pathname?.split('/').filter(Boolean).at(-1)] || [],
    searchText:card => card.textContent
  });
  mount({
    section:'#musiknyheder',result:'[data-music-desk-stories]',cardSelector:'.djf-desk-story',id:'news',
    searchLabel:['Søg efter musiknyheder','Search music news','Musiknews suchen'],
    filters:[
      ['release',['Udgivelser','Releases','Veröffentlichungen']],
      ['set',['DJ-sæt','DJ sets','DJ-Sets']],
      ['archive',['Musikarkiv','Music archive','Musikarchiv']],
      ['upcoming',['På vej','Coming up','Demnächst']]
    ],
    tags:card => [card.dataset.kind === 'ep' ? 'release' : card.dataset.kind],
    searchText:card => [...card.querySelectorAll('h3,p')].map(el=>el.textContent).join(' ')
  });
})();
