/* ==========================================================================
   queries.js — "Ask the Audit": deterministic natural-language query engine
   over local structured data, plus Query History CRUD.
   ========================================================================== */
const Queries = (() => {

  function num(str){ const n = Utils.parseAmount(str); return n; }

  const PATTERNS = [
    { // Show all invoices/documents above/over X
      test:/(?:show|list|find).*(?:invoice|document|transaction)s?.*(?:above|over|greater than|more than)\s*([\d,]+)/i,
      run: async (q, auditId, docs)=>{
        const threshold = num(q.match(/([\d,]+)/)[1]);
        const isInvoiceOnly = /invoice/i.test(q);
        const matches = docs.filter(d=> d.amount!=null && d.amount > threshold && (!isInvoiceOnly || d.category==='Invoice'));
        return {
          answer: `${matches.length} ${isInvoiceOnly?'invoice':'document'}(s) found with an amount above ${Utils.fmtCurrency(threshold)}.`,
          evidence: matches, relatedExceptions: [],
          calculation: `Filter: amount > ${Utils.fmtCurrency(threshold)}`,
          source: `${matches.length} of ${docs.length} documents in the audit`
        };
      }
    },
    { // invoices without / no purchase orders
      test:/invoice.*(?:without|no|missing).*purchase order|invoices.*not have.*purchase order/i,
      run: async (q, auditId, docs)=>{
        const invoices = docs.filter(d=>d.category==='Invoice');
        const noPO = invoices.filter(d=>!d.links.po);
        return {
          answer: `${noPO.length} of ${invoices.length} invoice(s) have no linked Purchase Order reference.`,
          evidence: noPO, relatedExceptions: [],
          calculation: `Invoices where links.po is empty`,
          source: `${invoices.length} Invoice-category documents`
        };
      }
    },
    { // high-risk exceptions
      test:/high[- ]risk exceptions?|critical exceptions?/i,
      run: async (q, auditId)=>{
        const excs = await Exceptions.listForAudit(auditId);
        const hi = excs.filter(e=>e.risk==='High'||e.risk==='Critical');
        return {
          answer: `${hi.length} exception(s) rated High or Critical risk.`,
          evidence: [], relatedExceptions: hi,
          calculation:'Filter: exceptions.risk in [High, Critical]',
          source: `${excs.length} total exceptions on file`
        };
      }
    },
    { // unanalyzed documents count
      test:/how many documents.*(?:unanalyzed|not analyzed|still.*analyz)/i,
      run: async (q, auditId, docs)=>{
        const un = docs.filter(d=>d.analysisStatus==='Not Analyzed' || d.analysisStatus==='Review Required' || d.analysisStatus==='Failed');
        return {
          answer: `${un.length} of ${docs.length} document(s) are still unanalyzed or require review.`,
          evidence: un, relatedExceptions: [],
          calculation:'Filter: analysisStatus != Analyzed',
          source: `${docs.length} total documents`
        };
      }
    },
    { // vendor highest total payment
      test:/which vendor.*(?:highest|largest|most).*(?:payment|paid|received)/i,
      run: async (q, auditId, docs)=>{
        const payments = docs.filter(d=>d.category==='Payment' && d.party && d.amount!=null);
        const totals = {};
        payments.forEach(p=>{ totals[p.party] = (totals[p.party]||0) + p.amount; });
        const sorted = Object.entries(totals).sort((a,b)=>b[1]-a[1]);
        if(!sorted.length) return { answer:'No payment records with vendor and amount were found.', evidence:[], relatedExceptions:[], calculation:'—', source:'0 payment documents' };
        const [vendor, total] = sorted[0];
        return {
          answer: `"${vendor}" received the highest total payments: ${Utils.fmtCurrency(total)}.`,
          evidence: payments.filter(p=>p.party===vendor), relatedExceptions:[],
          calculation: `Sum of Payment.amount grouped by vendor, highest of ${sorted.length} vendor(s)`,
          source: `${payments.length} Payment-category documents`
        };
      }
    },
    { // transactions outside audit period
      test:/outside (?:the )?audit period/i,
      run: async (q, auditId, docs, audit)=>{
        const outside = docs.filter(d=> d.documentDate && audit.periodFrom && audit.periodTo &&
          (new Date(d.documentDate) < new Date(audit.periodFrom) || new Date(d.documentDate) > new Date(audit.periodTo)));
        return {
          answer: `${outside.length} document(s) are dated outside the audit period (${Utils.fmtDate(audit.periodFrom)} to ${Utils.fmtDate(audit.periodTo)}).`,
          evidence: outside, relatedExceptions: [],
          calculation: 'Filter: documentDate not within [periodFrom, periodTo]',
          source: `${docs.length} total documents`
        };
      }
    },
    { // duplicate invoice numbers
      test:/duplicate invoice numbers?/i,
      run: async (q, auditId)=>{
        const dupes = await Analysis.duplicateDetection(auditId);
        const invDupes = dupes.filter(d=>d.type==='Reference Number' && d.category==='Invoice');
        const evidence = invDupes.flatMap(d=>d.documents);
        return {
          answer: `${invDupes.length} duplicate invoice number group(s) found, covering ${evidence.length} document(s).`,
          evidence, relatedExceptions:[],
          calculation:'Group Invoice documents by referenceNumber, keep groups with count > 1',
          source:'Document register (Invoice category)'
        };
      }
    },
    { // summarize unresolved findings
      test:/summari[sz]e.*unresolved findings|unresolved findings/i,
      run: async (q, auditId)=>{
        const findings = await Findings.listForAudit(auditId);
        const open = findings.filter(f=>f.status!=='Closed' && f.status!=='Resolved');
        return {
          answer: open.length
            ? `${open.length} finding(s) remain unresolved: ${open.slice(0,5).map(f=>f.title).join('; ')}${open.length>5?'…':''}.`
            : 'No unresolved findings — all findings are Resolved or Closed.',
          evidence: [], relatedExceptions: [], findings: open,
          calculation:'Filter: findings.status not in [Resolved, Closed]',
          source:`${findings.length} total findings on file`
        };
      }
    }
  ];

  async function answer(question, auditId){
    const audit = await Audits.get(auditId);
    const docs = await Documents.listForAudit(auditId);
    for(const p of PATTERNS){
      if(p.test.test(question)){
        try{
          return await p.run(question, auditId, docs, audit);
        }catch(e){
          console.error('Query pattern failed', e && e.message);
        }
      }
    }
    // Fallback: generic keyword search across documents + exceptions
    return genericSearch(question, auditId, docs);
  }

  async function genericSearch(question, auditId, docs){
    const terms = question.toLowerCase().replace(/[?.,]/g,'').split(/\s+/).filter(t=>t.length>2);
    const excs = await Exceptions.listForAudit(auditId);
    const matchDocs = docs.filter(d=> terms.some(t=> (d.name+d.party+d.category+d.referenceNumber).toLowerCase().includes(t)));
    const matchExc = excs.filter(e=> terms.some(t=> (e.title+e.description).toLowerCase().includes(t)));
    if(!matchDocs.length && !matchExc.length){
      return {
        answer: "I could not match this question to a specific data query. Try phrasing like the examples shown above, or use Global Search / Document filters for a manual look.",
        evidence: [], relatedExceptions: [], calculation:'No matching pattern or keyword hits', source:'—'
      };
    }
    return {
      answer: `Found ${matchDocs.length} document(s) and ${matchExc.length} exception(s) matching keywords in your question.`,
      evidence: matchDocs, relatedExceptions: matchExc,
      calculation: 'Keyword match across document name/vendor/category/reference and exception title/description',
      source: 'Local keyword search fallback'
    };
  }

  // ---------------- Query History CRUD ----------------
  async function save(auditId, question, result){
    const settings = (typeof App !== 'undefined' && App.settings) ? App.settings : {};
    const rec = {
      id: Utils.uid('q'), auditId, date:new Date().toISOString(), question,
      answer: result.answer,
      documentsUsed: (result.evidence||[]).map(d=>d.id),
      status:'Answered', auditor: settings.auditorName || 'Auditor'
    };
    await Db.add('queries', rec);
    await AuditTrail.log('Query performed', question, null, result.answer);
    return rec;
  }
  async function update(id, patch){
    const existing = await Db.get('queries', id);
    const updated = Object.assign({}, existing, patch);
    await Db.put('queries', updated);
    return updated;
  }
  async function remove(id){ await Db.remove('queries', id); }
  function listForAudit(auditId){ return Db.getByAudit('queries', auditId).then(r=>r.sort((a,b)=>new Date(b.date)-new Date(a.date))); }

  const EXAMPLES = [
    'Show all invoices above 500,000.',
    'Which invoices do not have purchase orders?',
    'Show all high-risk exceptions.',
    'How many documents are still unanalyzed?',
    'Which vendor received the highest total payment?',
    'Show transactions outside the audit period.',
    'List duplicate invoice numbers.',
    'Summarize unresolved findings.'
  ];

  return { answer, save, update, remove, listForAudit, EXAMPLES };
})();
