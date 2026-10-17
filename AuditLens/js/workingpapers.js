/* ==========================================================================
   workingpapers.js — Working Paper CRUD with linked documents / exceptions
   ========================================================================== */
const WorkingPapers = (() => {

  const REVIEW_STATUSES = ['Not Started','In Progress','Ready for Review','Reviewed','Sent Back'];

  async function nextReference(auditId){
    const existing = await Db.getByAudit('workingPapers', auditId);
    return 'WP-' + String(existing.length + 1).padStart(3,'0');
  }

  function blank(auditId, ref){
    return {
      id: Utils.uid('wp'), auditId, reference: ref || 'WP-001',
      title:'', objective:'', scope:'', population:'', sample:'',
      procedure:'', evidence:'', testing:'', results:'', exceptionsNote:'',
      conclusion:'', preparedBy:'', preparedDate:Utils.todayISO(),
      reviewedBy:'', reviewDate:'', reviewStatus:'Not Started',
      linkedDocumentIds:[], linkedExceptionIds:[],
      createdAt:new Date().toISOString(), updatedAt:new Date().toISOString()
    };
  }

  async function create(auditId, data){
    const ref = await nextReference(auditId);
    const wp = Object.assign(blank(auditId, ref), data);
    await Db.add('workingPapers', wp);
    await AuditTrail.log('Working paper created', wp.reference + ' ' + wp.title, null, wp);
    return wp;
  }
  async function update(id, patch){
    const existing = await Db.get('workingPapers', id);
    if(!existing) throw new Error('Working paper not found');
    const updated = Object.assign({}, existing, patch, {updatedAt:new Date().toISOString()});
    await Db.put('workingPapers', updated);
    await AuditTrail.log('Working paper changed', updated.reference + ' ' + updated.title, existing, updated);
    return updated;
  }
  async function remove(id){
    const existing = await Db.get('workingPapers', id);
    await Db.remove('workingPapers', id);
    await AuditTrail.log('Working paper deleted', existing ? existing.reference : id, existing, null);
  }
  function get(id){ return Db.get('workingPapers', id); }
  function listForAudit(auditId){ return Db.getByAudit('workingPapers', auditId).then(r=>r.sort((a,b)=>a.reference.localeCompare(b.reference))); }

  async function linkDocument(wpId, documentId){
    const wp = await get(wpId);
    if(!wp.linkedDocumentIds.includes(documentId)) wp.linkedDocumentIds.push(documentId);
    return update(wpId, {linkedDocumentIds: wp.linkedDocumentIds});
  }
  async function linkException(wpId, exceptionId){
    const wp = await get(wpId);
    if(!wp.linkedExceptionIds.includes(exceptionId)) wp.linkedExceptionIds.push(exceptionId);
    return update(wpId, {linkedExceptionIds: wp.linkedExceptionIds});
  }
  async function addQueryAsEvidence(wpId, query){
    const wp = await get(wpId);
    const addition = `\n\n[Ask the Audit — ${Utils.fmtDate(query.date)}]\nQ: ${query.question}\nA: ${query.answer}`;
    return update(wpId, {evidence: (wp.evidence||'') + addition});
  }

  return { REVIEW_STATUSES, blank, nextReference, create, update, remove, get, listForAudit, linkDocument, linkException, addQueryAsEvidence };
})();
