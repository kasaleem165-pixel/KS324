/* ==========================================================================
   audit.js — Audit entity CRUD, types, materiality, progress calculation
   ========================================================================== */
const Audits = (() => {

  const TYPES = ['Financial','Internal','Compliance','Operational','Procurement','Tax','Payroll',
    'Inventory','Revenue','Expense','IT','Project','General','Custom'];

  const STATUSES = ['Planning','Fieldwork','In Progress','Under Review','Completed','Archived'];

  function blank(){
    return {
      id: Utils.uid('audit'),
      name:'', client:'', reference:'', type:'General',
      periodFrom:'', periodTo:'', leadAuditor:'', department:'',
      materiality:0, performanceMateriality:0, highRiskThreshold:0,
      currency:'PKR', description:'', notes:'',
      status:'Planning', createdAt:new Date().toISOString(), updatedAt:new Date().toISOString()
    };
  }

  async function create(data){
    const audit = Object.assign(blank(), data);
    await Db.add('audits', audit);
    await seedDefaultRulesForAudit(audit.id);
    await AuditTrail.log('Audit created', audit.name, null, audit);
    return audit;
  }

  async function update(id, patch){
    const existing = await Db.get('audits', id);
    if(!existing) throw new Error('Audit not found');
    const updated = Object.assign({}, existing, patch, {updatedAt:new Date().toISOString()});
    await Db.put('audits', updated);
    await AuditTrail.log('Audit updated', updated.name, existing, updated);
    return updated;
  }

  async function archive(id){
    return update(id, {status:'Archived'});
  }

  async function remove(id){
    const existing = await Db.get('audits', id);
    // Cascade delete all related records for this audit.
    for(const store of ['documents','extractedData','rules','checkResults','exceptions','findings','queries','workingPapers','reports']){
      await Db.deleteByAudit(store, id);
    }
    await Db.deleteByAudit('auditTrail', id);
    await Db.remove('audits', id);
    Utils.toast('Audit "' + (existing ? existing.name : id) + '" and all related data deleted', 'warning');
  }

  function list(){
    return Db.getAll('audits').then(rows=>rows.sort((a,b)=> new Date(b.updatedAt)-new Date(a.updatedAt)));
  }

  function get(id){
    return Db.get('audits', id);
  }

  async function seedDefaultRulesForAudit(auditId){
    if(typeof Rules === 'undefined') return;
    const defaults = Rules.getDefaultRuleDefinitions();
    for(const d of defaults){
      await Db.add('rules', Object.assign({}, d, {id: Utils.uid('rule'), auditId, enabled:true, custom:false}));
    }
  }

  // -------- Progress / stats for a given audit --------
  async function stats(auditId){
    const [docs, exceptions, findings, queries, checkResults, workingPapers] = await Promise.all([
      Db.getByAudit('documents', auditId),
      Db.getByAudit('exceptions', auditId),
      Db.getByAudit('findings', auditId),
      Db.getByAudit('queries', auditId),
      Db.getByAudit('checkResults', auditId),
      Db.getByAudit('workingPapers', auditId)
    ]);
    const totalDocs = docs.length;
    const analyzed = docs.filter(d=>d.analysisStatus==='Analyzed').length;
    const checksPerformed = checkResults.length;
    const totalExceptions = exceptions.length;
    const highRisk = exceptions.filter(e=>e.risk==='Critical'||e.risk==='High').length;
    const openFindings = findings.filter(f=>f.status!=='Closed' && f.status!=='Resolved').length;
    const checksReviewed = exceptions.filter(e=>e.status!=='Open').length;

    const docsWeight = totalDocs ? analyzed/totalDocs : 0;
    const checksWeight = totalDocs ? Math.min(1, checksPerformed / Math.max(1,totalDocs)) : 0;
    const excWeight = totalExceptions ? checksReviewed/totalExceptions : 1;
    const wpWeight = workingPapers.length ? workingPapers.filter(w=>w.reviewStatus==='Reviewed').length / workingPapers.length : 0;
    const progress = Math.round(((docsWeight*0.35)+(checksWeight*0.25)+(excWeight*0.25)+(wpWeight*0.15))*100);

    return {
      totalDocs, analyzed, checksPerformed, totalExceptions, highRisk, openFindings,
      queries: queries.length, workingPapers: workingPapers.length, progress: isNaN(progress)?0:progress
    };
  }

  return { TYPES, STATUSES, blank, create, update, archive, remove, list, get, stats };
})();
