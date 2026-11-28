(() => {
'use strict';
const $=id=>document.getElementById(id);
const langs=['da','en','de'];
const copy={
 series:['Nisserne og den sidste Karen Volf-småkage','The Elves and the Last Karen Volf Cookie','Die Wichtel und der letzte Karen-Volf-Keks'],
 season:['DJ FOLSOE · JULEKALENDER 2026','DJ FOLSOE · 2026 CHRISTMAS CALENDAR','DJ FOLSOE · ADVENTSKALENDER 2026'],
 intro:['Knas og Bøje har én opgave. Find den sidste småkage, før juleglæden forsvinder fra Twitch.','Knas and Bøje have one job. Find the last cookie before Christmas cheer disappears from Twitch.','Knas und Bøje haben eine Aufgabe. Sie müssen den letzten Keks finden, bevor die Weihnachtsfreude auf Twitch verschwindet.'],
 watch:['Kom med på Twitch','Join us on Twitch','Auf Twitch dabei sein'],
 label:['Historien','The story','Die Geschichte'],
 archive:['Vælg afsnit','Choose an episode','Folge auswählen'],
 wait:['Første afsnit åbner 29. november.','The first episode opens on 29 November.','Die erste Folge öffnet am 29. November.']
};
let calendar=window.DJF_JUL_EPISODES?.calendar??{};
let chosen='',lang=Math.max(0,langs.indexOf(new URL(location.href).searchParams.get('lang')||document.documentElement.lang));
const preview=window.DJF_JUL_PREVIEW === true || location.protocol==='file:';
const formatter=new Intl.DateTimeFormat('en-CA',{year:'numeric',month:'2-digit',day:'2-digit',timeZone:'Europe/Copenhagen'});
function today(){
 const f=Object.fromEntries(formatter.formatToParts().map(p=>[p.type,p.value]));
 return preview?'2026-12-24':[f.year,f.month,f.day].join('-');
}
function put(id,text){$(id).textContent=text;}
function render(){
 const allowed=Object.keys(calendar).sort().filter(date=>date<=today());
 if(!allowed.includes(chosen))chosen=preview?allowed[0]:allowed.at(-1);
 const record=calendar[chosen];
 document.documentElement.lang=langs[lang];
 document.querySelectorAll('[data-lang]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lang===langs[lang])));
 for(const id of ['series','season','intro','watch'])put(id,copy[id][lang]);
 put('archive-label',copy.archive[lang]);
 put('episode-label',copy.label[lang]);
 $('archive').hidden=!record;
 const choice=$('episode-select');
 choice.replaceChildren(...allowed.map(date=>new Option(date.slice(8)+'.'+date.slice(5,7)+' · '+calendar[date].title[lang],date)));
 if(record)choice.value=chosen;
 put('episode-heading',record?.title[lang]??copy.wait[lang]);
 $('episode-body').replaceChildren(...(record?.body[lang]??[]).map(text=>{const p=document.createElement('p');p.textContent=text;return p;}));
}
document.querySelectorAll('[data-lang]').forEach(b=>b.onclick=()=>{lang=langs.indexOf(b.dataset.lang);render();});
$('episode-select').onchange=event=>{chosen=event.currentTarget.value;render();};
render();
})();
