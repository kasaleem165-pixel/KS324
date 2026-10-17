/* ==========================================================================
   exceptions.js — Exception management
   ========================================================================== */
const Exceptions = (() => {

  const RISKS = ['Critical','High','Medium','Low','Informational'];
  const STATUSES = ['Open','Under Review','Response Pending','Resolved','Closed','Accepted Risk'];

  function blank(auditId){
    return {
      id: Utils.uid('exc'), auditId,
      title:'', documentId:'', ruleId:'', ruleName:'',
      description:'', evidence:'', amount:null, risk:'Medium', status:'Open',
      auditorObservation:'', impact:'', recommendation:'', managementResponse:'',
      resolution:'', responsiblePerson:'', dueDate:'', conclusion:'',
      createdAt:new Date().toISOString(), updatedAt:new Date().toISOString()
    };
  }

  async function createFromCheck(audit, doc, rule, message){
    const exc = blank(audit.id);
    exc.title = `${rule.name} — ${doc.name}`;
    exc.documentId = doc.id;
    exc.ruleId = rule.id;
    exc.ruleName = rule.name;
    exc.description = message;
    exc.evidence = `Detected by automated rule "${rule.name}" during Run Checks on ${Utils.fmtDate(new Date())}.`;
    exc.amount = doc.amount;
    exc.risk = severityToRisk(rule.severity, audit, doc.amount);
    await Db.add('exceptions', exc);
    await AuditTrail.log('Exception created', exc.title, null, exc);
    await Documents.update(doc.id, {risk: highestRisk(doc.risk, exc.risk)});
    return exc;
  }

  function severityToRisk(severity, audit, amount){
    if(severity==='Critical') return 'Critical';
    if(severity==='High'){
      if(audit && amount!=null && amount > (audit.materiality||Infinity)) return 'Critical';
      return 'High';
    }
    if(severity==='Medium') return 'Medium';
    if(severity==='Low') return 'Low';
    return 'Informational';
  }
  const RISK_ORDER = ['Informational','Low','Medium','High','Critical'];
  function highestRisk(a,b){
    return RISK_ORDER.indexOf(b) > RISK_ORDER.indexOf(a||'Informational') ? b : (a||'Low');
  }

  async function create(auditId, data){
    const exc = Object.assign(blank(auditId), data);
    await Db.add('exceptions', exc);
    await AuditTrail.log('Exception created', exc.title, null, exc);
    return exc;
  }
  async function update(id, patch){
    const existing = await Db.get('exceptions', id);
    if(!existing) throw new Error('Exception not found');
    const updated = Object.assign({}, existing, patch, {updatedAt:new Date().toISOString()});
    await Db.put('exceptions', updated);
    await AuditTrail.log('Exception modified', updated.title, existing, updated);
    return updated;
  }
  async function remove(id){
    const existing = await Db.get('exceptions', id);
    await Db.remove('exceptions', id);
    await AuditTrail.log('Exception deleted', existing ? existing.title : id, existing, null);
  }
  function get(id){ return Db.get('exceptions', id); }
  function listForAudit(auditId){ return Db.getByAudit('exceptions', auditId).then(r=>r.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt))); }

  return { RISKS, STATUSES, blank, createFromCheck, create, update, remove, get, listForAudit };
})();
