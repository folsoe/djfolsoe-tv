(()=>{"use strict";
function add(){
 if(document.getElementById("djfFacebookDock"))return;
 const dock=document.createElement("aside");
 dock.id="djfFacebookDock";
 dock.setAttribute("aria-label","DJ FOLSOE on Facebook");
 const items=[
  ["https://www.facebook.com/profile.php?id=61550472850742","DJ FOLSOE","Facebook page",""],
  ["https://www.facebook.com/groups/kesseogfolsoe","Kesse & Folsoe","Facebook group","djfFbGroup"]
 ];
 items.forEach(([href,title,sub,extra])=>{
  const a=document.createElement("a");a.href=href;a.target="_blank";a.rel="noopener noreferrer";
  a.className="djfFbLink "+extra;a.setAttribute("aria-label",title+" — "+sub);
  a.innerHTML='<span class="djfFbIcon" aria-hidden="true"><b>f</b></span><span class="djfFbText"><strong>'+title+'</strong><small>'+sub+'</small></span>';
  dock.appendChild(a);
 });
 document.body.appendChild(dock);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",add,{once:true});else add();
})();