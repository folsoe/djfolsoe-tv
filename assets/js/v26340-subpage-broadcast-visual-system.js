/* DJ FOLSOE V26340 — Subpage Broadcast Visual System */
(() => {
  "use strict";
  document.body.classList.add("v26340-subpage");

  const selectors = [
    ".grid",".cards",".showGrid",".musicGrid",".guideGrid",".archiveGrid",
    ".contentGrid",".cardGrid",".listGrid"
  ];
  selectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      if(el.children.length >= 2) el.classList.add("v26340EnhanceGrid");
    });
  });

  document.querySelectorAll("main img").forEach((img,i) => {
    if(!img.hasAttribute("decoding")) img.setAttribute("decoding","async");
    if(i>0 && !img.hasAttribute("loading")) img.setAttribute("loading","lazy");
  });
})();
