const DB_NAME='djfolsoe-music-server-v1800';
const DB_VERSION=1;
const TRACKS='tracks', HISTORY='history', PLANS='plans', SETTINGS='settings';
let dbPromise;
function db(){if(!dbPromise)dbPromise=new Promise((resolve,reject)=>{const r=indexedDB.open(DB_NAME,DB_VERSION);r.onupgradeneeded=()=>{const d=r.result;if(!d.objectStoreNames.contains(TRACKS)){const s=d.createObjectStore(TRACKS,{keyPath:'id'});s.createIndex('artist','artist');s.createIndex('title','title');s.createIndex('genre','genre');s.createIndex('year','year');s.createIndex('spotifyId','spotifyId',{unique:false});}if(!d.objectStoreNames.contains(HISTORY))d.createObjectStore(HISTORY,{keyPath:'id'});if(!d.objectStoreNames.contains(PLANS))d.createObjectStore(PLANS,{keyPath:'id'});if(!d.objectStoreNames.contains(SETTINGS))d.createObjectStore(SETTINGS,{keyPath:'key'});};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});return dbPromise}
function tx(store,mode='readonly'){return db().then(d=>d.transaction(store,mode).objectStore(store))}
export async function putMany(store,items){if(!items.length)return;const d=await db();await new Promise((resolve,reject)=>{const t=d.transaction(store,'readwrite'),s=t.objectStore(store);items.forEach(x=>s.put(x));t.oncomplete=resolve;t.onerror=()=>reject(t.error)})}
export async function put(store,item){return putMany(store,[item])}
export async function getAll(store){const s=await tx(store);return new Promise((resolve,reject)=>{const r=s.getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
export async function get(store,key){const s=await tx(store);return new Promise((resolve,reject)=>{const r=s.get(key);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
export async function delMany(store,ids){const d=await db();await new Promise((resolve,reject)=>{const t=d.transaction(store,'readwrite'),s=t.objectStore(store);ids.forEach(id=>s.delete(id));t.oncomplete=resolve;t.onerror=()=>reject(t.error)})}
export async function clear(store){const s=await tx(store,'readwrite');return new Promise((resolve,reject)=>{const r=s.clear();r.onsuccess=resolve;r.onerror=()=>reject(r.error)})}
export async function count(store){const s=await tx(store);return new Promise((resolve,reject)=>{const r=s.count();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
export {TRACKS,HISTORY,PLANS,SETTINGS};
