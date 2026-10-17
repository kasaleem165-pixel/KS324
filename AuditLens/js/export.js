/* ==========================================================================
   export.js — Save / Export / Import / Backup / Restore
   Documents' binary content (fileBlob) is embedded as base64 so a single
   JSON file is a complete, self-contained audit package.
   ========================================================================== */
const ExportImport = (() => {

  const STORES_FOR_AUDIT = ['documents','extractedData','rules','checkResults','exceptions','findings','queries','workingPapers','reports','auditTrail'];

  async function exportAudit(auditId){
    const audit = await Audits.get(auditId);
    if(!audit) throw new Error('Audit not found');
    const payload = { appName:'AuditLens', exportType:'single-audit', exportVersion:1, exportedAt:new Date().toISOString(), audit, data:{} };

    for(const store of STORES_FOR_AUDIT){
      const rows = await Db.getByAudit(store, auditId);
      if(store === 'documents'){
        payload.data.documents = await Promise.all(rows.map(async d=>{
          const copy = Object.assign({}, d);
          delete copy.fileBlob;
          if(d.fileBlob){
            try{ copy.fileBase64 = await Utils.blobToBase64(d.fileBlob); }
            catch(e){ copy.fileBase64 = null; copy.exportWarning = 'Could not embed file content: ' + e.message; }
          }
          return copy;
        }));
      } else {
        payload.data[store] = rows;
      }
    }
    const json = JSON.stringify(payload, null, 2);
    const filename = `AuditLens_${sanitizeFilename(audit.name)}_${Utils.todayISO()}.json`;
    Utils.downloadFile(filename, json, 'application/json');
    await AuditTrail.log('Audit exported', audit.name, null, filename);
    return filename;
  }

  function sanitizeFilename(name){
    return (name||'audit').replace(/[^a-z0-9\-_ ]/gi,'').replace(/\s+/g,'_').slice(0,60) || 'audit';
  }

  async function importAudit(jsonText, {asNew}={}){
    let payload;
    try{ payload = JSON.parse(jsonText); }
    catch(e){ throw new Error('This file is not valid AuditLens JSON: ' + e.message); }
    if(!payload || payload.appName !== 'AuditLens' || !payload.audit){
      throw new Error('This does not look like an AuditLens export file.');
    }
    const oldAuditId = payload.audit.id;
    const newAuditId = asNew ? Utils.uid('audit') : oldAuditId;
    const idMap = { [oldAuditId]: newAuditId };

    const audit = Object.assign({}, payload.audit, {id:newAuditId, updatedAt:new Date().toISOString()});
    await Db.put('audits', audit);

    for(const store of STORES_FOR_AUDIT){
      const rows = payload.data[store] || [];
      for(const row of rows){
        const copy = Object.assign({}, row, {auditId:newAuditId});
        if(asNew) copy.id = Utils.uid(store.slice(0,4));
        if(store === 'documents' && row.fileBase64){
          copy.fileBlob = Utils.base64ToBlob(row.fileBase64, row.mime);
          delete copy.fileBase64;
        }
        await Db.put(store, copy);
      }
    }
    await AuditTrail.log('Audit imported', audit.name, null, {from:oldAuditId, to:newAuditId});
    return audit;
  }

  // ---------------- Full-application backup / restore ----------------
  async function backupAll(){
    const payload = { appName:'AuditLens', exportType:'full-backup', exportVersion:1, exportedAt:new Date().toISOString(), data:{} };
    for(const store of Db.STORES){
      const rows = await Db.getAll(store);
      if(store === 'documents'){
        payload.data.documents = await Promise.all(rows.map(async d=>{
          const copy = Object.assign({}, d); delete copy.fileBlob;
          if(d.fileBlob){ try{ copy.fileBase64 = await Utils.blobToBase64(d.fileBlob); }catch(e){ copy.fileBase64=null; } }
          return copy;
        }));
      } else {
        payload.data[store] = rows;
      }
    }
    const json = JSON.stringify(payload);
    const filename = `AuditLens_FullBackup_${Utils.todayISO()}.json`;
    Utils.downloadFile(filename, json, 'application/json');
    return filename;
  }

  async function restoreAll(jsonText){
    let payload;
    try{ payload = JSON.parse(jsonText); }
    catch(e){ throw new Error('Invalid backup file: ' + e.message); }
    if(!payload || payload.appName !== 'AuditLens' || !payload.data){
      throw new Error('This does not look like an AuditLens backup file.');
    }
    for(const store of Db.STORES){
      await Db.clear(store);
      const rows = payload.data[store] || [];
      for(const row of rows){
        const copy = Object.assign({}, row);
        if(store === 'documents' && row.fileBase64){
          copy.fileBlob = Utils.base64ToBlob(row.fileBase64, row.mime);
          delete copy.fileBase64;
        }
        await Db.put(store, copy);
      }
    }
    return true;
  }

  return { exportAudit, importAudit, backupAll, restoreAll };
})();
