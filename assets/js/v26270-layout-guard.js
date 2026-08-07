/* DJ FOLSOE V26270 — defensive homepage layout guard */
(()=>{
  'use strict';
  const boot=()=>{
    document.documentElement.dataset.homeLayout='v26270';
    // Keep only one official entity panel if an older cached/CMS fragment injects another.
    const bands=[...document.querySelectorAll('.entityBand')];
    bands.slice(1).forEach(node=>node.remove());
    // Remove accidental duplicate IDs while preserving the first live control used by existing scripts.
    const seen=new Set();
    document.querySelectorAll('[id]').forEach(node=>{
      if(seen.has(node.id)) node.removeAttribute('id'); else seen.add(node.id);
    });
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
})();
