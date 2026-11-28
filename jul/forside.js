(() => {
'use strict';
const parts=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{year:'numeric',month:'2-digit',day:'2-digit',timeZone:'Europe/Copenhagen'}).formatToParts().map(p=>[p.type,p.value]));
const day=[parts.year,parts.month,parts.day].join('-');
if(day<'2026-11-29'||day>'2026-12-24')return;
const section=document.getElementById('jul-2026'),row=window.DJF_JUL_EPISODES?.calendar?.[day];
if(!section||!row||document.getElementById('djf-jul-historie'))return;
const insert=document.createElement('aside');
insert.id='djf-jul-historie';
insert.className='djf-jul-forside';
const heading=document.createElement('h2'),teaser=document.createElement('p'),link=document.createElement('a');
insert.append(heading,teaser,link);
section.before(insert);
function update(){
 const code=document.documentElement.lang?.slice(0,2);
 const i=Math.max(0,['da','en','de'].indexOf(code));
 heading.textContent=row.advent?[row.advent+'. advent · '+row.title[i],'Advent '+row.advent+' · '+row.title[i],row.advent+'. Advent · '+row.title[i]][i]:row.title[i];
 teaser.textContent=row.teaser[i];
 link.href='/jul/?lang='+['da','en','de'][i];
 link.textContent=['Læs dagens afsnit','Read today’s episode','Heute weiterlesen'][i];
}
new MutationObserver(update).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
update();
})();
