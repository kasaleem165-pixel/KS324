/* ==========================================================================
   findings.js — Audit Findings (condition/criteria/cause/effect/risk/rec.)
   ========================================================================== */
const Findings = (() => {

  const STATUSES = ['Draft','Reported','Management Response Received','Resolved','Closed'];

  function blank(auditId){
    return {
      id: Utils.uid('find'), auditId, exceptionId:'',
      title:'', condition:'', criteria:'', cause:'', effect:'', risk:'Medium',
      recommendation:'', managementResponse:'', auditorConclusion:'',
      status:'Draft', createdAt:new Date().toISOString(), updatedAt:new Date().toISOString()
    };
  }

  async function createFromException(exception){
    const f = blank(exception.auditId);
    f.exceptionId = exception.id;
    f.title = exception.title;
    f.condition = exception.description;
    f.criteria = 'Documents supporting this transaction should meet the audit\'s standard document, approval and reconciliation requirements.';
    f.cause = 'To be determined by auditor inquiry — root cause not yet established.';
    f.effect = exception.impact || 'Potential financial misstatement, control weakness, or non-compliance — to be assessed by the auditor.';
    f.risk = exception.risk;
    f.recommendation = exception.recommendation || 'Management should investigate the condition described and strengthen the related control.';
    f.managementResponse = exception.managementResponse || '';
    await Db.add('findings', f);
    await AuditTrail.log('Finding created from exception', f.title, null, f);
    return f;
  }

  async function create(auditId, data){
    const f = Object.assign(blank(auditId), data);
    await Db.add('findings', f);
    await AuditTrail.log('Finding created', f.title, null, f);
    return f;
  }
  async function update(id, patch){
    const existing = await Db.get('findings', id);
    if(!existing) throw new Error('Finding not found');
    const updated = Object.assign({}, existing, patch, {updatedAt:new Date().toISOString()});
    await Db.put('findings', updated);
    await AuditTrail.log('Finding updated', updated.title, existing, updated);
    return updated;
  }
  async function remove(id){
    const existing = await Db.get('findings', id);
    await Db.remove('findings', id);
    await AuditTrail.log('Finding deleted', existing ? existing.title : id, existing, null);
  }
  function get(id){ return Db.get('findings', id); }
  function listForAudit(auditId){ return Db.getByAudit('findings', auditId).then(r=>r.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt))); }

  return { STATUSES, blank, createFromException, create, update, remove, get, listForAudit };
})();
