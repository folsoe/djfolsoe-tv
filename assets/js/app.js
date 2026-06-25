let data, activeTheme='morning', tickerIndex=0;

async function load(){
  const response = await fetch('data.json');
  data = await response.json();
  activeTheme = data.station.currentTheme || 'morning';
  renderThemes();
  renderSchedule();
  renderCommands();
  renderNewsToolbar();
  setTheme(activeTheme);
  setInterval(updateTicker, 3500);
}
function $(id){return document.getElementById(id)}
function themeById(id){return data.themes.find(t=>t.id===id)||data.themes[0]}
function setTheme(id){
  activeTheme=id;
  const t=themeById(id);
  document.documentElement.style.setProperty('--themeA', t.colorA);
  document.documentElement.style.setProperty('--themeB', t.colorB);
  $('currentThemeName').textContent=t.title.toUpperCase();
  $('previewIcon').textContent=t.icon;
  $('previewTitle').textContent=t.title;
  $('previewSub').textContent=t.subtitle;
  $('footerBadge').textContent=t.label||t.title;
  document.querySelectorAll('.themeCard').forEach(c=>c.classList.toggle('active',c.dataset.theme===id));
  document.querySelectorAll('.newsToolbar button').forEach(b=>b.classList.toggle('active',b.dataset.theme===id));
  renderNews();
  updateTicker();
}
function renderThemes(){
  $('themeGrid').innerHTML=data.themes.map(t=>`
    <article class="themeCard" data-theme="${t.id}" onclick="setTheme('${t.id}')" style="--a:${t.colorA};--b:${t.colorB}">
      <div class="icon">${t.icon}</div>
      <strong>${t.title}</strong>
      <p>${t.subtitle}</p>
      <code>${t.commands[0]}</code>
    </article>`).join('');
}
function renderSchedule(){
  $('scheduleList').innerHTML=data.schedule.map(s=>`
    <div class="scheduleItem">
      <b>${s.day}</b><span>${s.show}</span><code>${s.time}</code>
    </div>`).join('');
}
function renderCommands(){
  $('commandList').innerHTML=data.commands.map(c=>`
    <div class="commandItem"><b>${c.cmd}</b><p>${c.desc}</p></div>`).join('');
}
function renderNewsToolbar(){
  $('newsToolbar').innerHTML=data.themes.map(t=>`<button data-theme="${t.id}" onclick="setTheme('${t.id}')">${t.icon} ${t.title}</button>`).join('');
}
function renderNews(){
  const arr=data.news[activeTheme]||data.news.popup;
  $('newsGrid').innerHTML=arr.map((n,i)=>`
    <div class="newsItem">
      <b>${i===0?'TOP STORY':'RADAR'}</b>
      <p>${n}</p>
    </div>`).join('');
}
function updateTicker(){
  const arr=data.news[activeTheme]||data.news.popup;
  $('tickerText').textContent=arr[tickerIndex++%arr.length];
}
document.addEventListener('DOMContentLoaded',load);
document.getElementById('randomTheme')?.addEventListener('click',()=>{
  const pick=data.themes[Math.floor(Math.random()*data.themes.length)];
  setTheme(pick.id);
});