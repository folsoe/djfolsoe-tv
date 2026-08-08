// DJ FOLSOE V26410 — weekly chart archive helper
// Run locally with Node: node tools/archive-chart-week.js
const fs=require("fs"), path=require("path");
const root=path.resolve(__dirname,"..");
const current=JSON.parse(fs.readFileSync(path.join(root,"data","charts.json"),"utf8"));
if(!current.chart_week) throw new Error("charts.json is missing chart_week");
const dir=path.join(root,"data","chart-archive"); fs.mkdirSync(dir,{recursive:true});
const file=path.join(dir,`${current.chart_week}.json`);
fs.writeFileSync(file,JSON.stringify({week:current.chart_week,date:current.published_date,top20:current.top20,retro_top10:current.retro_top10},null,2));
const idxFile=path.join(dir,"index.json");
let idx={weeks:[]}; if(fs.existsSync(idxFile)) idx=JSON.parse(fs.readFileSync(idxFile,"utf8"));
idx.weeks=idx.weeks.filter(x=>x.week!==current.chart_week);
idx.weeks.unshift({week:current.chart_week,date:current.published_date,label:`Week ${String(current.chart_week).split("W")[1]} · ${String(current.chart_week).slice(0,4)}`,file:`/data/chart-archive/${current.chart_week}.json`});
fs.writeFileSync(idxFile,JSON.stringify(idx,null,2));
console.log("Archived",current.chart_week);
