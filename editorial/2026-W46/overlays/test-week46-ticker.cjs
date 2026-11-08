const fs=require('fs'),vm=require('vm'),assert=require('assert');
const code=fs.readFileSync('weekly-ticker-engine-v106.js','utf8'),original=JSON.parse(fs.readFileSync('week46-content/weekly-show-notes.json'));
let now=Date.parse('2026-11-10T12:00:00Z'),reply=structuredClone(original),calls=[],intervals=[],events={};
class Clock extends Date{static now(){return now;}}
const win={addEventListener:(n,f)=>events[n]=f,removeEventListener(){}},doc={hidden:false,addEventListener:(n,f)=>events[n]=f,removeEventListener(){}};
vm.runInNewContext(code,{window:win,document:doc,Date:Clock,URL,AbortController,fetch:async(url,options)=>{calls.push({url,options});return{ok:true,json:async()=>reply};},setInterval:(f,t)=>{intervals.push({f,t});return 1;},clearInterval(){},setTimeout:()=>1,clearTimeout(){}});
const flush=()=>new Promise(r=>setImmediate(r));
(async()=>{
 await flush();assert.equal(win.DJF_WEEKLY_STORIES.status().week,'2026-W46');assert.equal(intervals.length,1);
 for(const [show,bank]of Object.entries(original.ticker)){
  const seen=new Set();for(let i=0;i<bank.length;i++){now+=90000;const da=win.DJF_TICKER_LIFE.pick(show,0);assert(bank.some(x=>x.text[0]===da.text));seen.add(da.text);for(let l=1;l<3;l++){const v=win.DJF_TICKER_LIFE.pick(show,l);const found=bank.find(x=>x.text[0]===da.text);assert.equal(v.text,found.text[l]);}}
  assert.equal(seen.size,bank.length,show);
 }
 assert.equal(win.DJF_TICKER_LIFE.pick('top20',0).text,win.DJF_TICKER_LIFE.pick('chart',0).text);
 assert.equal(win.DJF_TICKER_LIFE.pick('classic-dance',0).text,win.DJF_TICKER_LIFE.pick('eurodance',0).text);
 reply=structuredClone(original);reply.ticker.morning=[];await win.DJF_WEEKLY_STORIES.refresh();assert.equal(win.DJF_WEEKLY_STORIES.status().week,'2026-W46');
 reply=structuredClone(original);reply.week='2026-W47';for(const bank of Object.values(reply.ticker))for(const x of bank){x.week=reply.week;x.id=x.id.replace('W46','W47');x.text=x.text.map(t=>'NEXT '+t);}
 await win.DJF_WEEKLY_STORIES.refresh();assert.equal(win.DJF_WEEKLY_STORIES.status().week,'2026-W47');assert(win.DJF_TICKER_LIFE.pick('retro',0).text.startsWith('NEXT '));
 now=Date.parse('2026-11-16T11:00:00Z');assert.equal(win.DJF_WEEKLY_STORIES.status().available,false);assert(!win.DJF_TICKER_LIFE.pick('retro',0).text.includes('NEXT'));
 assert(calls.every(x=>x.options.credentials==='omit'&&x.options.cache==='no-store'));const before=calls.length;doc.hidden=true;await win.DJF_WEEKLY_STORIES.refresh();assert.equal(calls.length,before);
 console.log('PASS: 84 texts, 11 profiles, DA/EN/DE, full rotation, show aliases, invalid replacement retains valid bank, next-week replacement, expiry, visibility, one polling engine.');
})().catch(e=>{console.error(e);process.exit(1)});
