const DEFAULT_THEME='retro';
const RSS_FEEDS=[
 ['DR Musik','https://www.dr.dk/nyheder/service/feeds/musik'],
 ['BBC Radio 1','https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml'],
 ['EDM.com','https://edm.com/.rss/full/'],
 ['Dancing Astronaut','https://dancingastronaut.com/feed/']
];
export default {async fetch(request, env){const url=new URL(request.url);const cors={'access-control-allow-origin':'*','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type'};if(request.method==='OPTIONS')return new Response(null,{headers:cors});
 if(url.pathname==='/api/theme'){
  if(request.method==='POST'){const body=await request.json().catch(()=>({}));const theme=String(body.theme||DEFAULT_THEME);await env.FOLSOE_KV?.put('theme',theme);return Response.json({ok:true,theme},{headers:cors});}
  const theme=await env.FOLSOE_KV?.get('theme')||DEFAULT_THEME;return Response.json({theme,updatedAt:new Date().toISOString()},{headers:cors});}
 if(url.pathname==='/api/newsroom'){
  const cached=await env.FOLSOE_KV?.get('newsroom','json'); if(cached&&Date.now()-new Date(cached.updatedAt).getTime()<15*60*1000)return Response.json(cached,{headers:cors});
  const items=[]; for(const [source,feed] of RSS_FEEDS){try{const txt=await fetch(feed,{cf:{cacheTtl:300}}).then(r=>r.text()); for(const item of txt.matchAll(/<item>[\s\S]*?<\/item>/g)){const block=item[0]; const title=clean(block.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>|<title>([\s\S]*?)<\/title>/)?.[1]||block.match(/<title>([\s\S]*?)<\/title>/)?.[1]||''); const link=clean(block.match(/<link>([\s\S]*?)<\/link>/)?.[1]||''); const summary=clean(block.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>|<description>([\s\S]*?)<\/description>/)?.[1]||''); if(title)items.push({source,title,link,summary:summary.slice(0,180)}); if(items.length>24)break;}}catch(e){}}
  const payload={updatedAt:new Date().toISOString(),items:items.slice(0,20)}; await env.FOLSOE_KV?.put('newsroom',JSON.stringify(payload)); return Response.json(payload,{headers:cors});}
 if(url.pathname==='/api/twitch/user'){
  const login=url.searchParams.get('login'); if(!login)return Response.json({error:'missing login'},{status:400,headers:cors});
  if(!env.TWITCH_CLIENT_ID||!env.TWITCH_APP_TOKEN)return Response.json({error:'Set TWITCH_CLIENT_ID and TWITCH_APP_TOKEN to enable avatars.'},{status:501,headers:cors});
  const r=await fetch('https://api.twitch.tv/helix/users?login='+encodeURIComponent(login),{headers:{'Client-ID':env.TWITCH_CLIENT_ID,'Authorization':'Bearer '+env.TWITCH_APP_TOKEN}}); const j=await r.json(); return Response.json(j.data?.[0]||{}, {headers:cors});}
 return new Response('FOLSOE Worker OK',{headers:cors});}}
function clean(s=''){return String(s).replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\s+/g,' ').trim();}
