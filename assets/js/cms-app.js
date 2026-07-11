import{$,show}from'./cms-dom.js';
import{store}from'./cms-store.js';
import{connect,forget,preflight,savedToken}from'./cms-auth.js';
import{navigate}from'./cms-router.js';

window.addEventListener('error',event=>{
  const box=$('fatalError');
  $('fatalErrorText').textContent=event.message||'Unknown JavaScript error';
  show(box,true);
});
window.addEventListener('unhandledrejection',event=>{
  console.error(event.reason);
});

document.addEventListener('click',event=>{
  const route=event.target.closest('[data-route]')?.dataset.route;
  if(route&&store.get('state'))navigate(route);
});

document.addEventListener('DOMContentLoaded',async()=>{
  $('connectButton').addEventListener('click',()=>connect());
  $('retryButton').addEventListener('click',()=>connect());
  $('forgetButton').addEventListener('click',forget);
  const saved=savedToken();
  if(saved)$('adminToken').value=saved;
  await preflight();
  if(saved)await connect({silent:true});
});
