/* DJ FOLSOE V26290 — profile-photo guard + clean navigation */
(()=>{
 const avatar=document.getElementById('siteProfileImage');
 if(avatar){
   const sync=()=>{
     const bg=getComputedStyle(avatar).backgroundImage;
     const inline=avatar.style.backgroundImage||'';
     avatar.classList.toggle('has-profile-photo', (bg&&bg!=='none') || inline.includes('url('));
   };
   new MutationObserver(sync).observe(avatar,{attributes:true,attributeFilter:['style','class']});
   sync(); setTimeout(sync,1200); setTimeout(sync,3500);
 }
})();
