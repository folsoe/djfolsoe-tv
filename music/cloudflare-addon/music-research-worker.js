/**
 * DJ FOLSOE MUSIC RESEARCH WORKER V1801
 * Deploy as standalone add-on or merge the route handlers into the existing Worker.
 * Secrets for weekly automation:
 * SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN
 */
const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Content-Type, Authorization","Access-Control-Allow-Methods":"GET,POST,OPTIONS","Content-Type":"application/json; charset=utf-8"};
const json=(data,status=200)=>new Response(JSON.stringify(data,null,2),{status,headers:cors});
const clean=s=>String(s||'').replace(/\s+/g,' ').trim();
function entities(s){return clean(s.replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/<[^>]+>/g,' '))}
async function fetchText(url){const r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0 DJ-FOLSOE-Music-Research/1.0','Accept':'text/html'}});if(!r.ok)throw new Error(`${r.status} from ${url}`);return r.text()}
function parseHitlisten(html,limit=60){
 const items=[];
 // Primary parser: visible rank blocks in the official chart page.
 const text=entities(html.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' '));
 // Locate likely uppercase artist/title pairs around numeric rank markers.
 const tokens=text.split(/\s{2,}|\n/).map(clean).filter(Boolean);
 for(let i=0;i<tokens.length-2&&items.length<limit;i++){
   if(/^\d{1,3}$/.test(tokens[i])){const rank=Number(tokens[i]);if(rank<1||rank>100)continue;const a=tokens[i+1],t=tokens[i+2];if(a&&t&&a.length<100&&t.length<140&&!/^\d+$/.test(a)&&!/^\d+$/.test(t))items.push({rank,artist:a,title:t,source:'Hitlisten Danmark'});}
 }
 const m=new Map();for(const x of items){const k=(x.artist+'|'+x.title).toLowerCase();if(!m.has(k))m.set(k,x)}return [...m.values()].slice(0,limit)
}
function parseShazam(html,limit=100){
 const items=[];const re=/"rank"\s*:\s*"?(\d+)"?[\s\S]{0,500}?"title"\s*:\s*"([^"]+)"[\s\S]{0,500}?"subtitle"\s*:\s*"([^"]+)"/g;let m;
 while((m=re.exec(html))&&items.length<limit)items.push({rank:Number(m[1]),title:entities(m[2]),artist:entities(m[3]),source:'Shazam Denmark'});
 return items
}
const retroSeeds=[
 [1970,'Simon & Garfunkel','Bridge Over Troubled Water'],[1971,'Rod Stewart','Maggie May'],[1972,'The Sweet','Wig-Wam Bam'],[1973,'ABBA','Ring Ring'],[1974,'ABBA','Waterloo'],[1975,'Queen','Bohemian Rhapsody'],[1976,'ABBA','Dancing Queen'],[1977,'Bee Gees','Stayin Alive'],[1978,'Boney M.','Rasputin'],[1979,'Chic','Good Times'],
 [1980,'Blondie','Call Me'],[1981,'Kim Carnes','Bette Davis Eyes'],[1982,'Survivor','Eye of the Tiger'],[1983,'Eurythmics','Sweet Dreams (Are Made of This)'],[1984,'Wham!','Wake Me Up Before You Go-Go'],[1985,'a-ha','Take on Me'],[1986,'Europe','The Final Countdown'],[1987,'Rick Astley','Never Gonna Give You Up'],[1988,'Yazz & The Plastic Population','The Only Way Is Up'],[1989,'Madonna','Like a Prayer']
].map((x,i)=>({year:x[0],artist:x[1],title:x[2],rank:i+1,source:'Retro chart seed'}));
async function research(url){const source=url.searchParams.get('source')||'hitlisten',limit=Math.min(200,Math.max(10,Number(url.searchParams.get('limit')||60))),yf=Number(url.searchParams.get('yearFrom')||0),yt=Number(url.searchParams.get('yearTo')||9999);let items=[];
 if(source==='hitlisten'){items=parseHitlisten(await fetchText('https://hitlisten.nu/default.asp?list=t40'),limit)}
 else if(source==='shazam-dk'){items=parseShazam(await fetchText('https://www.shazam.com/charts/top-200/denmark'),limit)}
 else if(source==='retro-numberones'){items=retroSeeds.filter(x=>x.year>=yf&&x.year<=yt).slice(0,limit)}
 else return json({error:'Unknown source'},400);
 return json({source,checkedAt:new Date().toISOString(),items});
}
async function spotifyToken(env){const body=new URLSearchParams({grant_type:'refresh_token',refresh_token:env.SPOTIFY_REFRESH_TOKEN});const r=await fetch('https://accounts.spotify.com/api/token',{method:'POST',headers:{Authorization:'Basic '+btoa(env.SPOTIFY_CLIENT_ID+':'+env.SPOTIFY_CLIENT_SECRET),'Content-Type':'application/x-www-form-urlencoded'},body});if(!r.ok)throw new Error('Spotify token '+r.status);return (await r.json()).access_token}
async function spotifySearch(token,artist,title){const q=encodeURIComponent(`track:${title} artist:${artist}`);const r=await fetch(`https://api.spotify.com/v1/search?q=${q}&type=track&market=DK&limit=5`,{headers:{Authorization:'Bearer '+token}});if(!r.ok)return null;const d=await r.json(),all=d.tracks?.items||[];return all[0]||null}
async function weekly(env){if(!env.SPOTIFY_REFRESH_TOKEN)return {skipped:true,reason:'Missing Spotify secrets'};const token=await spotifyToken(env),chart=parseHitlisten(await fetchText('https://hitlisten.nu/default.asp?list=t40'),60),uris=[];for(const c of chart.slice(0,55)){const t=await spotifySearch(token,c.artist,c.title);if(t?.uri&&!uris.includes(t.uri))uris.push(t.uri)}const week=new Intl.DateTimeFormat('da-DK',{week:'numeric'});const name=`DJ FOLSOE — GOOD MORNING — ${new Date().toISOString().slice(0,10)}`;const p=await fetch('https://api.spotify.com/v1/me/playlists',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({name,description:'Weekly playlist generated by DJ FOLSOE Music Research V1801',public:false})});if(!p.ok)throw new Error('Create playlist '+p.status);const playlist=await p.json();for(let i=0;i<uris.length;i+=100)await fetch(`https://api.spotify.com/v1/playlists/${playlist.id}/items`,{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({uris:uris.slice(i,i+100)})});return {playlist:playlist.external_urls?.spotify,count:uris.length}}
export default {async fetch(request,env){if(request.method==='OPTIONS')return new Response(null,{headers:cors});const url=new URL(request.url);try{if(url.pathname==='/api/music/research'||url.pathname==='/api/research')return research(url);if(url.pathname==='/api/music/research/health')return json({ok:true,version:'V1801'});if(url.pathname==='/api/music/research/run-weekly'&&request.method==='POST')return json(await weekly(env));return json({error:'Not found'},404)}catch(e){return json({error:e.message},500)}},async scheduled(event,env,ctx){ctx.waitUntil(weekly(env))}};
