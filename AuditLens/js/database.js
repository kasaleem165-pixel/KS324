/* ==========================================================================
   database.js — IndexedDB abstraction layer (AuditLensDB)
   Generic CRUD over named object stores. Swap this module out later to move
   to a server database without touching feature modules (they only call Db.*).
   ========================================================================== */
const Db = (() => {
  const DB_NAME = 'AuditLensDB';
  const DB_VERSION = 1;
  const STORES = [
    'audits','documents','extractedData','rules','checkResults','exceptions',
    'findings','queries','workingPapers','reports','auditTrail','settings'
  ];
  let dbPromise = null;

  function open(){
    if(dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject)=>{
      if(!('indexedDB' in window)){
        reject(new Error('This browser does not support IndexedDB. AuditLens cannot store data locally.'));
        return;
      }
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (ev)=>{
        const db = req.result;
        STORES.forEach(name=>{
          if(!db.objectStoreNames.contains(name)){
            const store = db.createObjectStore(name, {keyPath:'id'});
            if(name !== 'settings'){
              store.createIndex('by_auditId','auditId',{unique:false});
            }
          }
        });
      };
      req.onsuccess = ()=>resolve(req.result);
      req.onerror = ()=>reject(req.error || new Error('Failed to open IndexedDB'));
      req.onblocked = ()=>console.warn('IndexedDB open blocked — close other AuditLens tabs.');
    });
    return dbPromise;
  }

  function tx(storeName, mode){
    return open().then(db=>db.transaction(storeName, mode).objectStore(storeName));
  }

  function add(storeName, obj){
    return tx(storeName,'readwrite').then(store=>new Promise((resolve,reject)=>{
      const r = store.add(obj);
      r.onsuccess = ()=>resolve(obj);
      r.onerror = ()=>reject(r.error);
    }));
  }

  function put(storeName, obj){
    return tx(storeName,'readwrite').then(store=>new Promise((resolve,reject)=>{
      const r = store.put(obj);
      r.onsuccess = ()=>resolve(obj);
      r.onerror = ()=>reject(r.error);
    }));
  }

  function get(storeName, id){
    return tx(storeName,'readonly').then(store=>new Promise((resolve,reject)=>{
      const r = store.get(id);
      r.onsuccess = ()=>resolve(r.result || null);
      r.onerror = ()=>reject(r.error);
    }));
  }

  function getAll(storeName){
    return tx(storeName,'readonly').then(store=>new Promise((resolve,reject)=>{
      const r = store.getAll();
      r.onsuccess = ()=>resolve(r.result || []);
      r.onerror = ()=>reject(r.error);
    }));
  }

  function getByAudit(storeName, auditId){
    if(!auditId) return Promise.resolve([]);
    return tx(storeName,'readonly').then(store=>new Promise((resolve,reject)=>{
      const idx = store.index('by_auditId');
      const r = idx.getAll(auditId);
      r.onsuccess = ()=>resolve(r.result || []);
      r.onerror = ()=>reject(r.error);
    }));
  }

  function remove(storeName, id){
    return tx(storeName,'readwrite').then(store=>new Promise((resolve,reject)=>{
      const r = store.delete(id);
      r.onsuccess = ()=>resolve(true);
      r.onerror = ()=>reject(r.error);
    }));
  }

  function clear(storeName){
    return tx(storeName,'readwrite').then(store=>new Promise((resolve,reject)=>{
      const r = store.clear();
      r.onsuccess = ()=>resolve(true);
      r.onerror = ()=>reject(r.error);
    }));
  }

  function count(storeName){
    return tx(storeName,'readonly').then(store=>new Promise((resolve,reject)=>{
      const r = store.count();
      r.onsuccess = ()=>resolve(r.result || 0);
      r.onerror = ()=>reject(r.error);
    }));
  }

  async function bulkPut(storeName, arr){
    const store = await tx(storeName,'readwrite');
    return new Promise((resolve,reject)=>{
      let i=0;
      function next(){
        if(i >= arr.length) return resolve(true);
        const r = store.put(arr[i++]);
        r.onsuccess = next;
        r.onerror = ()=>reject(r.error);
      }
      next();
    });
  }

  async function deleteByAudit(storeName, auditId){
    const rows = await getByAudit(storeName, auditId);
    for(const row of rows){ await remove(storeName, row.id); }
    return true;
  }

  return { STORES, open, add, put, get, getAll, getByAudit, remove, clear, count, bulkPut, deleteByAudit };
})();
