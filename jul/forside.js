(() => {
'use strict';
const parts=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{year:'numeric',month:'2-digit',day:'2-digit',timeZone:'Europe/Copenhagen'}).formatToParts().map(p=>[p.type,p.value]));
const day=[parts.year,parts.month,parts.day].join('-');
if(day<'2026-11-28'||day>'2026-12-24')return;
const eve=day==='2026-11-28';
document.documentElement.classList.add('djf-jul-live');
const section=document.getElementById('jul-2026'),row=window.DJF_JUL_EPISODES?.calendar?.[day];
if(!section||(!row&&!eve)||document.getElementById('djf-jul-historie'))return;
const insert=document.createElement('aside');
insert.id='djf-jul-historie';
insert.className='djf-jul-forside';
const heading=document.createElement('h2'),teaser=document.createElement('p'),link=document.createElement('a');
const premiere=document.createElement('strong');
premiere.hidden=!eve;
insert.append(premiere,heading,teaser,link);
section.before(insert);
function update(){
 const code=document.documentElement.lang?.slice(0,2);
 const i=Math.max(0,['da','en','de'].indexOf(code));
 if(eve){
  premiere.textContent=['Premiere i morgen · 1. søndag i advent','Premieres tomorrow · First Sunday of Advent','Premiere morgen · 1. Advent'][i];
  heading.textContent=['Nisserne og den sidste Karen Volf-småkage','The Elves and the Last Karen Volf Cookie','Die Wichtel und der letzte Karen-Volf-Keks'][i];
  teaser.textContent=['Klokken står på 19.24. Knas tæller tre krummer. Fra mixeren svarer en stemme: fire. I morgen begynder julegyset.','The clock reads 19:24. Knas counts three crumbs. A voice from the mixer answers: four. The Christmas mystery begins tomorrow.','Die Uhr zeigt 19:24. Knas zählt drei Krümel. Eine Stimme aus dem Mischpult antwortet: vier. Morgen beginnt das Weihnachtsrätsel.'][i];
  link.href='/jul/?lang='+['da','en','de'][i];
  link.textContent=['Se julekalenderen og mød nisserne','See the calendar and meet the elves','Zum Kalender und zu den Wichteln'][i];
  return;
 }
 heading.textContent=row.advent?[row.advent+'. advent · '+row.title[i],'Advent '+row.advent+' · '+row.title[i],row.advent+'. Advent · '+row.title[i]][i]:row.title[i];
 teaser.textContent=row.teaser[i];
 link.href='/jul/?lang='+['da','en','de'][i];
 link.textContent=['Læs dagens afsnit','Read today’s episode','Heute weiterlesen'][i];
}
new MutationObserver(update).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
update();
})();
