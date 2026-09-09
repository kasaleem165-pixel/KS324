/* ==========================================================================
   auditTrail.js — immutable-style local action log
   ========================================================================== */
const AuditTrail = (() => {

  async function log(action, record, prevValue, newValue){
    try{
      const auditId = (typeof App !== 'undefined' && App.currentAuditId) ? App.currentAuditId : null;
      const settings = (typeof App !== 'undefined' && App.settings) ? App.settings : {};
      const entry = {
        id: Utils.uid('trail'),
        auditId,
        date: new Date().toISOString(),
        action,
        user: settings.auditorName || 'Auditor',
        record: record || '',
        previousValue: prevValue !== undefined ? safeStringify(prevValue) : '',
        newValue: newValue !== undefined ? safeStringify(newValue) : ''
      };
      await Db.add('auditTrail', entry);
      return entry;
    }catch(e){
      console.error('AuditTrail.log failed:', e && e.message);
    }
  }

  function safeStringify(v){
    try{
      const s = typeof v === 'string' ? v : JSON.stringify(v);
      return s && s.length > 400 ? s.slice(0,400) + '…' : (s || '');
    }catch(e){ return String(v); }
  }

  async function listForAudit(auditId){
    const rows = await Db.getByAudit('auditTrail', auditId);
    return rows.sort((a,b)=> new Date(b.date) - new Date(a.date));
  }

  return { log, listForAudit };
})();
