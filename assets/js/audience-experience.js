
/* =========================================================
   DJ FOLSOE V1001.3 — AUDIENCE EXPERIENCE COPY + ORDER PASS
   ========================================================= */
(() => {
  const textMap = new Map([
    ['DJ FOLSOE TWITCH · MUSIC STREAMER FROM DENMARK','Live music from Denmark'],
    ['DIVE INTO MY TWITCH WORLD','Live music, requests and good company'],
    ['Dive into my Twitch world','Live music, requests and good company'],
    ['Watch live now','Watch live'],
    ['Request a song','Make a request'],
    ['Next DJ FOLSOE Broadcast','Next show'],
    ['NEXT DJ FOLSOE BROADCAST','Up next on DJ FOLSOE'],
    ['Announced soon','New show coming soon'],
    ['The next show is controlled from admin and appears here automatically.','The next show will be announced here soon.'],
    ['Your favorite show','Explore the shows'],
    ['YOUR FAVORITE SHOW','Explore the shows'],
    ['Weekly listening chart',"This week's Top 20"],
    ['WEEKLY LISTENING CHART',"This week's Top 20"],
    ['Active viewer commands','Join the show'],
    ['ACTIVE VIEWER COMMANDS','Join the show'],
    ['Open Twitch chat','Join the conversation'],
    ['Music News','Latest music stories'],
    ['MUSIC NEWS','Latest music stories'],
    ['No current stories for this theme yet.','More stories are on the way.'],
    ['Channel memory is starting','The community is warming up'],
    ['CHANNEL MEMORY IS STARTING','The community is warming up']
  ]);

  function cleanTextNodes(root=document.body){
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const nodes=[];
    while(walker.nextNode()) nodes.push(walker.currentNode);
    for(const node of nodes){
      const raw=node.nodeValue;
      const trimmed=raw.trim();
      if(!trimmed) continue;
      for(const [from,to] of textMap){
        if(trimmed===from){
          node.nodeValue=raw.replace(from,to);
          break;
        }
      }
    }
  }

  function hideTechnicalLabels(){
    const forbidden=[
      'engine','module','database','admin controlled','source content',
      'ext-001','ext-002','ext-003','ext-004','platform connected',
      'system output','architecture'
    ];
    document.querySelectorAll('body *').forEach(node=>{
      if(node.children.length) return;
      const text=(node.textContent||'').trim().toLowerCase();
      if(forbidden.some(term=>text===term || text.startsWith(term+' '))){
        node.classList.add('audienceTechnicalHidden');
      }
    });
  }

  function prioritisePage(){
    const main=document.querySelector('.portalMain');
    if(!main) return;
    const order=[
      ['#live',10],
      ['#next',20],
      ['#shows',30],
      ['#musicNews',40],
      ['#top20',50],
      ['#activityPulseEngine',60],
      ['#viewerCommands',70],
      ['#requests',80]
    ];
    for(const [selector,value] of order){
      const node=document.querySelector(selector);
      if(node) node.style.order=String(value);
    }
  }

  function labelButtons(){
    document.querySelectorAll('a,button').forEach(node=>{
      const text=(node.textContent||'').trim();
      if(text==='Refresh') node.setAttribute('aria-label','Refresh music stories');
      if(text==='Watch live') node.setAttribute('aria-label','Watch DJ FOLSOE live on Twitch');
      if(text==='Join the conversation') node.setAttribute('aria-label','Open DJ FOLSOE Twitch chat');
    });
  }

  function run(){
    cleanTextNodes();
    hideTechnicalLabels();
    prioritisePage();
    labelButtons();
  }

  document.addEventListener('DOMContentLoaded',()=>{
    run();
    const observer=new MutationObserver(()=>run());
    observer.observe(document.body,{subtree:true,childList:true,characterData:true});
  });
})();
