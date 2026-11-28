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
const cast=[["Knas","Studieteknikeren følger det røde kabel.","The studio technician follows the red cable.","Der Studiotechniker folgt dem roten Kabel."],["Tilde","Hun holder styr på sporene i den blå notesbog.","She keeps track of the clues in her blue notebook.","Sie sammelt die Spuren in ihrem blauen Notizbuch."],["Bøje","Hans vafler er både bevismateriale og fristelse.","His waffles are both evidence and temptation.","Seine Waffeln sind Beweismittel und Versuchung zugleich."],["Mulle","Hun fanger det på kamera, de andre overser.","She catches what the others miss on camera.","Sie hält fest, was die anderen übersehen."],["Mads Minus","Han hører, når et slag eller en pause mangler.","He notices when a beat or a pause is missing.","Ihm fällt auf, wenn ein Schlag oder eine Pause fehlt."],["Ester","De gyldne hovedtelefoner opfanger lyd fra det gamle studie.","Her golden headphones pick up sound from the old studio.","Ihre goldenen Kopfhörer fangen Töne aus dem alten Studio auf."],["Pip","De kedelige ting, han låner, viser sig at være afgørende.","The dull things he borrows turn out to be crucial.","Die langweiligen Dinge, die er ausleiht, erweisen sich als entscheidend."],["Lydprøven","Rensdyret spiser papirfejl og finder spor, der er værd at beholde.","The reindeer eats mistakes on paper and spots clues worth keeping.","Das Rentier frisst Fehler auf Papier und entdeckt wertvolle Spuren."],["Urmageren","Hun passer forsvundne visere og husker den gamle julesending.","She takes care of missing clock hands and remembers the old Christmas broadcast.","Sie hütet verschwundene Uhrzeiger und erinnert sich an die alte Weihnachtssendung."],["Sune / DJ FOLSOE","Han holder udsendelsen i gang og giver chatten plads i mysteriet.","He keeps the show going and gives chat a part in the mystery.","Er hält die Sendung am Laufen und gibt dem Chat eine Rolle im Rätsel."]];
let calendar=window.DJF_JUL_EPISODES?.calendar??{};
const params = new URLSearchParams(location.search);
let chosen=params.get('episode')||'',lang=Math.max(0,langs.indexOf(params.get('lang')||document.documentElement.lang));
const preview=window.DJF_JUL_PREVIEW === true || location.protocol==='file:';
const formatter=new Intl.DateTimeFormat('en-CA',{year:'numeric',month:'2-digit',day:'2-digit',timeZone:'Europe/Copenhagen'});
function today(){
 const f=Object.fromEntries(formatter.formatToParts().map(p=>[p.type,p.value]));
 return preview?'2026-12-24':[f.year,f.month,f.day].join('-');
}
function put(id,text){$(id).textContent=text;}
function renderCast(){
 let box=$('jul-medvirkende');
 if(!box){
  box=document.createElement('details');box.id='jul-medvirkende';box.className='jul-medvirkende';
  box.append(document.createElement('summary'),document.createElement('dl'));
  $('episode-body').closest('section').after(box);
 }
 if (location.hash==='#jul-medvirkende') box.open=true;
 const [label,list]=box.children;
 label.textContent=['Mød de 10 medvirkende','Meet the ten characters','Die zehn Figuren kennenlernen'][lang];
 list.replaceChildren(...cast.flatMap(([name,...role])=>{
  const term=document.createElement('dt'),definition=document.createElement('dd');
  term.textContent=name;definition.textContent=role[lang];return [term,definition];
 }));
}
function render(){
 const allowed=Object.keys(calendar).sort().filter(date=>date<=today());
 if(!allowed.includes(chosen))chosen=preview?allowed[0]:allowed.at(-1);
 const record=calendar[chosen];
 document.documentElement.lang=langs[lang];
 document.querySelectorAll('[data-lang]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lang===langs[lang])));
 for(const id of ['series','season','intro','watch'])put(id,copy[id][lang]);
 renderCast();
 put('archive-label',copy.archive[lang]);
 const count=record?.advent??0;
 const headline=count?[count+'. søndag i advent','Advent Sunday '+count,count+'. Advent'][lang]:copy.label[lang];
 put('episode-label',headline);
 let candleRow=$('advent-lys');
 if(!candleRow){
  candleRow=document.createElement('div');candleRow.id='advent-lys';
  candleRow.className='advent-lys';candleRow.setAttribute('aria-hidden','true');
  $('episode-label').after(candleRow);
 }
 candleRow.hidden=!count;
 candleRow.replaceChildren(...Array.from({length:count?4:0},(_,index)=>{
   const candle=document.createElement('i');
   candle.className=index<count?'taendt':'';
   return candle;
 }));
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
