
(function(){
"use strict";
const $=id=>document.getElementById(id);
const esc=v=>String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
function render(raw){
  const cms=raw?.websiteCms||raw?.homepage?.cms||{};
  const news=Array.isArray(cms.news)?cms.news:[];
  const highlights=Array.isArray(cms.highlights)?cms.highlights:[];
  const newsBox=$("websiteCmsNews");
  if(newsBox&&news.length){
    newsBox.innerHTML=news.slice(0,8).map(item=>`
      <article class="websiteCms__newsItem">
        <time>${esc(item.dateLabel||item.date||"NOW")}</time>
        <div><strong>${esc(item.title||"Channel update")}</strong><p>${esc(item.body||item.description||"")}</p></div>
      </article>`).join("");
  }
  const hi=$("websiteCmsHighlights");
  if(hi&&highlights.length){
    hi.innerHTML=highlights.slice(0,6).map(item=>`
      <article class="websiteCms__card">
        <span class="websiteCms__label">${esc(item.type||"HIGHLIGHT")}</span>
        <strong>${esc(item.title||"DJ FOLSOE highlight")}</strong>
        <p>${esc(item.body||item.description||"")}</p>
        ${item.url?`<a href="${esc(item.url)}" target="_blank" rel="noopener">Open</a>`:""}
      </article>`).join("");
  }
}
window.addEventListener("djf:broadcast-core",e=>render(e.detail||{}));
document.addEventListener("DOMContentLoaded",()=>{if(window.__DJF_CORE__)render(window.__DJF_CORE__)});
window.DJF_WEBSITE_CMS_SITE=Object.freeze({version:"V19800",render});
})();
