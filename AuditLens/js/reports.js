/* ==========================================================================
   reports.js — Report Center: 15 report generators + shared render/export
   Every generator returns a normalized shape:
     { title, meta:[{label,value}], sections:[ {heading, type:'table'|'html',
       headers?, rows?, html?} ] }
   which reports page (router.js) renders, prints, and exports (CSV/JSON).
   ========================================================================== */
const Reports = (() => {

  const CATALOGUE = [
    {key:'audit-summary', name:'Audit Summary', icon:'📋', desc:'Overall status, scope and key metrics for the audit.'},
    {key:'executive-summary', name:'Executive Summary', icon:'🗞️', desc:'High-level narrative summary for management.'},
    {key:'document-register', name:'Document Register', icon:'📁', desc:'Full list of all documents received.'},
    {key:'document-analysis', name:'Document Analysis', icon:'🔬', desc:'Analysis status and extracted-field coverage per document.'},
    {key:'exception-report', name:'Exception Report', icon:'⚠️', desc:'All exceptions identified across the audit.'},
    {key:'high-risk-exceptions', name:'High-Risk Exception Report', icon:'🛑', desc:'Only Critical / High risk exceptions.'},
    {key:'audit-findings', name:'Audit Findings', icon:'📌', desc:'Formal findings in condition/criteria/cause/effect format.'},
    {key:'missing-documents', name:'Missing Documents', icon:'🚫', desc:'Cross-document relationships with a missing component.'},
    {key:'compliance-checklist', name:'Compliance Checklist', icon:'✅', desc:'Result of every compliance-category rule, by document.'},
    {key:'transaction-testing', name:'Transaction Testing', icon:'🧮', desc:'All rule check results (PASS/WARNING/EXCEPTION/…) by document.'},
    {key:'working-papers', name:'Working Papers', icon:'🗂️', desc:'Status and review state of all working papers.'},
    {key:'query-analysis', name:'Query Analysis', icon:'💬', desc:'History of questions asked and answers given.'},
    {key:'management-letter', name:'Management Letter', icon:'✉️', desc:'Draft management letter (AI-assisted narrative — review required).'},
    {key:'audit-trail', name:'Audit Trail', icon:'🕒', desc:'Full immutable-style action log for the audit.'},
    {key:'custom-report', name:'Custom Report', icon:'🛠️', desc:'Build a report from the document register using your own filters.'}
  ];

  async function baseMeta(audit){
    const stats = await Audits.stats(audit.id);
    return [
      {label:'Client', value:audit.client}, {label:'Audit', value:audit.name},
      {label:'Reference', value:audit.reference}, {label:'Period', value:`${Utils.fmtDate(audit.periodFrom)} – ${Utils.fmtDate(audit.periodTo)}`},
      {label:'Lead Auditor', value:audit.leadAuditor}, {label:'Status', value:audit.status},
      {label:'Progress', value: stats.progress + '%'}, {label:'Generated', value: Utils.fmtDateTime(new Date())}
    ];
  }

  function applyDocFilters(docs, filters){
    if(!filters) return docs;
    return docs.filter(d=>{
      if(filters.category && d.category !== filters.category) return false;
      if(filters.risk && d.risk !== filters.risk) return false;
      if(filters.status && d.analysisStatus !== filters.status) return false;
      if(filters.vendor && !(d.party||'').toLowerCase().includes(filters.vendor.toLowerCase())) return false;
      if(filters.dateFrom && d.documentDate && d.documentDate < filters.dateFrom) return false;
      if(filters.dateTo && d.documentDate && d.documentDate > filters.dateTo) return false;
      if(filters.amountMin && (d.amount==null || d.amount < Number(filters.amountMin))) return false;
      if(filters.amountMax && (d.amount==null || d.amount > Number(filters.amountMax))) return false;
      return true;
    });
  }

  const DOC_HEADERS = [
    {label:'ID', value:'id'}, {label:'Document Name', value:'name'}, {label:'Category', value:'category'},
    {label:'Date', value:d=>Utils.fmtDate(d.documentDate)}, {label:'Reference', value:'referenceNumber'},
    {label:'Party/Vendor', value:'party'}, {label:'Amount', value:d=>d.amount!=null?Utils.fmtCurrency(d.amount):''},
    {label:'Upload Date', value:d=>Utils.fmtDate(d.uploadDate)}, {label:'Status', value:'analysisStatus'},
    {label:'Risk', value:'risk'}
  ];

  async function generate(key, auditId, filters){
    const audit = await Audits.get(auditId);
    const meta = await baseMeta(audit);
    const docs = applyDocFilters(await Documents.listForAudit(auditId), filters);

    switch(key){
      case 'audit-summary': return auditSummary(audit, meta);
      case 'executive-summary': return executiveSummary(audit, meta);
      case 'document-register': return documentRegister(audit, meta, docs);
      case 'document-analysis': return documentAnalysis(audit, meta, docs);
      case 'exception-report': return exceptionReport(audit, meta, false);
      case 'high-risk-exceptions': return exceptionReport(audit, meta, true);
      case 'audit-findings': return auditFindings(audit, meta);
      case 'missing-documents': return missingDocuments(audit, meta);
      case 'compliance-checklist': return complianceChecklist(audit, meta);
      case 'transaction-testing': return transactionTesting(audit, meta);
      case 'working-papers': return workingPapersReport(audit, meta);
      case 'query-analysis': return queryAnalysis(audit, meta);
      case 'management-letter': return managementLetter(audit, meta);
      case 'audit-trail': return auditTrailReport(audit, meta);
      case 'custom-report': return customReport(audit, meta, docs);
      default: throw new Error('Unknown report: ' + key);
    }
  }

  async function auditSummary(audit, meta){
    const stats = await Audits.stats(audit.id);
    return { title:'Audit Summary', meta, sections:[
      {heading:'Key Metrics', type:'html', html:`
        <div class="report-summary-line"><span>Total Documents</span><strong>${stats.totalDocs}</strong></div>
        <div class="report-summary-line"><span>Documents Analyzed</span><strong>${stats.analyzed}</strong></div>
        <div class="report-summary-line"><span>Checks Performed</span><strong>${stats.checksPerformed}</strong></div>
        <div class="report-summary-line"><span>Exceptions</span><strong>${stats.totalExceptions}</strong></div>
        <div class="report-summary-line"><span>High Risk Exceptions</span><strong>${stats.highRisk}</strong></div>
        <div class="report-summary-line"><span>Open Findings</span><strong>${stats.openFindings}</strong></div>
        <div class="report-summary-line"><span>Working Papers</span><strong>${stats.workingPapers}</strong></div>
        <div class="report-summary-line"><span>Overall Progress</span><strong>${stats.progress}%</strong></div>`},
      {heading:'Audit Description', type:'html', html:`<p>${Utils.escapeHtml(audit.description||'—')}</p>`},
      {heading:'Materiality', type:'html', html:`
        <div class="kv-list">
          <dt>Materiality</dt><dd>${Utils.fmtCurrency(audit.materiality, audit.currency)}</dd>
          <dt>Performance Materiality</dt><dd>${Utils.fmtCurrency(audit.performanceMateriality, audit.currency)}</dd>
          <dt>High-Risk Threshold</dt><dd>${Utils.fmtCurrency(audit.highRiskThreshold, audit.currency)}</dd>
        </div>`}
    ]};
  }

  async function executiveSummary(audit, meta){
    const s = await AIService.summarizeAudit(audit.id);
    return { title:'Executive Summary', meta, sections:[
      {heading:'Summary', type:'html', html:`<p><span class="fact-tag interp">Interpretation</span> ${Utils.escapeHtml(s.text)}</p>`},
      {heading:'Exceptions by Risk', type:'html', html: Object.entries(s.byRisk).map(([k,v])=>`<div class="report-summary-line"><span>${k}</span><strong>${v}</strong></div>`).join('') || '<p class="muted">No exceptions recorded.</p>'}
    ]};
  }

  function documentRegister(audit, meta, docs){
    return { title:'Document Register', meta, sections:[
      {heading:`${docs.length} Document(s)`, type:'table', headers:DOC_HEADERS, rows:docs}
    ]};
  }

  async function documentAnalysis(audit, meta, docs){
    const headers = [
      {label:'Document', value:'name'}, {label:'Category', value:'category'},
      {label:'Status', value:'analysisStatus'}, {label:'Method', value:'extractionMethod'},
      {label:'Fields Captured', value:d=>d.referenceNumber||d.party||d.amount!=null?'Yes':'No'},
      {label:'Risk', value:'risk'}
    ];
    return { title:'Document Analysis', meta, sections:[
      {heading:`${docs.length} Document(s)`, type:'table', headers, rows:docs}
    ]};
  }

  async function exceptionReport(audit, meta, highRiskOnly){
    let excs = await Exceptions.listForAudit(audit.id);
    if(highRiskOnly) excs = excs.filter(e=>e.risk==='Critical'||e.risk==='High');
    const docs = await Documents.listForAudit(audit.id);
    const headers = [
      {label:'ID', value:'id'}, {label:'Title', value:'title'},
      {label:'Document', value:e=>{ const d=docs.find(x=>x.id===e.documentId); return d?d.name:'—'; }},
      {label:'Risk', value:'risk'}, {label:'Status', value:'status'},
      {label:'Amount', value:e=>e.amount!=null?Utils.fmtCurrency(e.amount):''},
      {label:'Responsible', value:'responsiblePerson'}, {label:'Due Date', value:e=>Utils.fmtDate(e.dueDate)}
    ];
    return { title: highRiskOnly?'High-Risk Exception Report':'Exception Report', meta, sections:[
      {heading:`${excs.length} Exception(s)`, type:'table', headers, rows:excs}
    ]};
  }

  async function auditFindings(audit, meta){
    const findings = await Findings.listForAudit(audit.id);
    const sections = findings.map(f=>({
      heading: f.title || '(untitled finding)', type:'html', html:`
        <div class="kv-list">
          <dt>Condition</dt><dd>${Utils.escapeHtml(f.condition)}</dd>
          <dt>Criteria</dt><dd>${Utils.escapeHtml(f.criteria)}</dd>
          <dt>Cause</dt><dd>${Utils.escapeHtml(f.cause)}</dd>
          <dt>Effect</dt><dd>${Utils.escapeHtml(f.effect)}</dd>
          <dt>Risk</dt><dd>${Utils.escapeHtml(f.risk)}</dd>
          <dt>Recommendation</dt><dd>${Utils.escapeHtml(f.recommendation)}</dd>
          <dt>Management Response</dt><dd>${Utils.escapeHtml(f.managementResponse||'—')}</dd>
          <dt>Status</dt><dd>${Utils.escapeHtml(f.status)}</dd>
        </div>`
    }));
    return { title:'Audit Findings', meta, sections: sections.length?sections:[{heading:'No findings', type:'html', html:'<p class="muted">No findings recorded yet.</p>'}] };
  }

  async function missingDocuments(audit, meta){
    const docs = await Documents.listForAudit(audit.id);
    const invoices = docs.filter(d=>d.category==='Invoice');
    const rows = [];
    for(const inv of invoices){
      const chain = await Analysis.relationshipChain(inv, audit.id);
      chain.forEach(link=>{ if(!link.doc) rows.push({invoice:inv.name, missing:link.label}); });
    }
    return { title:'Missing Documents', meta, sections:[
      {heading:`${rows.length} Missing Link(s)`, type:'table',
        headers:[{label:'Invoice', value:'invoice'},{label:'Missing Component', value:'missing'}], rows}
    ]};
  }

  async function complianceChecklist(audit, meta){
    const results = (await Rules.latestResultsForAudit(audit.id)).filter(r=>r.category==='Compliance'||r.category==='Document');
    const docs = await Documents.listForAudit(audit.id);
    const headers = [
      {label:'Document', value:r=>{ const d=docs.find(x=>x.id===r.documentId); return d?d.name:'—'; }},
      {label:'Rule', value:'ruleName'}, {label:'Result', value:'result'}, {label:'Message', value:'message'}
    ];
    return { title:'Compliance Checklist', meta, sections:[
      {heading:`${results.length} Check Result(s)`, type:'table', headers, rows:results}
    ]};
  }

  async function transactionTesting(audit, meta){
    const results = await Rules.latestResultsForAudit(audit.id);
    const docs = await Documents.listForAudit(audit.id);
    const headers = [
      {label:'Document', value:r=>{ const d=docs.find(x=>x.id===r.documentId); return d?d.name:'—'; }},
      {label:'Rule', value:'ruleName'}, {label:'Category', value:'category'}, {label:'Severity', value:'severity'},
      {label:'Result', value:'result'}, {label:'Message', value:'message'}, {label:'Evaluated', value:r=>Utils.fmtDateTime(r.evaluatedAt)}
    ];
    return { title:'Transaction Testing', meta, sections:[
      {heading:`${results.length} Check Result(s)`, type:'table', headers, rows:results}
    ]};
  }

  async function workingPapersReport(audit, meta){
    const wps = await WorkingPapers.listForAudit(audit.id);
    const headers = [
      {label:'Reference', value:'reference'}, {label:'Title', value:'title'}, {label:'Prepared By', value:'preparedBy'},
      {label:'Prepared Date', value:w=>Utils.fmtDate(w.preparedDate)}, {label:'Reviewed By', value:'reviewedBy'},
      {label:'Review Status', value:'reviewStatus'}, {label:'Conclusion', value:'conclusion'}
    ];
    return { title:'Working Papers', meta, sections:[
      {heading:`${wps.length} Working Paper(s)`, type:'table', headers, rows:wps}
    ]};
  }

  async function queryAnalysis(audit, meta){
    const qs = await Queries.listForAudit(audit.id);
    const headers = [
      {label:'Date', value:q=>Utils.fmtDateTime(q.date)}, {label:'Question', value:'question'},
      {label:'Answer', value:'answer'}, {label:'Auditor', value:'auditor'}, {label:'Status', value:'status'}
    ];
    return { title:'Query Analysis', meta, sections:[
      {heading:`${qs.length} Saved Quer(y/ies)`, type:'table', headers, rows:qs}
    ]};
  }

  async function managementLetter(audit, meta){
    const draft = await AIService.generateReport('management-letter', audit.id);
    const findings = await Findings.listForAudit(audit.id);
    const highRisk = (await Exceptions.listForAudit(audit.id)).filter(e=>e.risk==='Critical'||e.risk==='High');
    return { title:'Management Letter (Draft)', meta, sections:[
      {heading:'Notice', type:'html', html:`<div class="notice-box danger"><strong>AI-Generated Draft — Review Required.</strong> ${Utils.escapeHtml(draft.notice)}</div>`},
      {heading:'Executive Summary', type:'html', html:`<p>${Utils.escapeHtml(draft.summary.text)}</p>`},
      {heading:'High-Risk Issues', type:'html', html: highRisk.length ? highRisk.map(e=>`<p>• ${Utils.escapeHtml(e.title)} — ${Utils.escapeHtml(e.description)}</p>`).join('') : '<p class="muted">None identified.</p>'},
      {heading:'Key Findings & Recommendations', type:'html', html: findings.length ? findings.map(f=>`<p><strong>${Utils.escapeHtml(f.title)}:</strong> ${Utils.escapeHtml(f.recommendation)}</p>`).join('') : '<p class="muted">No findings recorded yet.</p>'},
      {heading:'Management Responses', type:'html', html: findings.filter(f=>f.managementResponse).map(f=>`<p><strong>${Utils.escapeHtml(f.title)}:</strong> ${Utils.escapeHtml(f.managementResponse)}</p>`).join('') || '<p class="muted">Pending.</p>'},
      {heading:'Conclusion', type:'html', html:'<p>[Auditor to complete overall conclusion before issuing this letter.]</p>'}
    ]};
  }

  async function auditTrailReport(audit, meta){
    const trail = await AuditTrail.listForAudit(audit.id);
    const headers = [
      {label:'Date', value:t=>Utils.fmtDateTime(t.date)}, {label:'Action', value:'action'},
      {label:'User', value:'user'}, {label:'Record', value:'record'}
    ];
    return { title:'Audit Trail', meta, sections:[
      {heading:`${trail.length} Log Entr(y/ies)`, type:'table', headers, rows:trail}
    ]};
  }

  function customReport(audit, meta, docs){
    return { title:'Custom Report (Filtered Document Register)', meta, sections:[
      {heading:`${docs.length} Document(s) matching your filters`, type:'table', headers:DOC_HEADERS, rows:docs}
    ]};
  }

  // ---------------- Export helpers ----------------
  function flattenForExport(report){
    const rows = [];
    report.sections.forEach(s=>{
      if(s.type==='table'){ s.rows.forEach(r=> rows.push(r)); }
    });
    return rows;
  }
  function toCSV(report){
    const tableSection = report.sections.find(s=>s.type==='table');
    if(!tableSection) return 'No tabular data in this report.';
    return Utils.toCSV(tableSection.rows, tableSection.headers);
  }
  function toJSON(report){
    return JSON.stringify(report, (k,v)=> k==='fileBlob' ? undefined : v, 2);
  }

  async function persistGenerated(auditId, key, name){
    const rec = { id:Utils.uid('rpt'), auditId, key, name, generatedAt:new Date().toISOString() };
    await Db.add('reports', rec);
    await AuditTrail.log('Report generated', name, null, null);
    return rec;
  }

  return { CATALOGUE, generate, toCSV, toJSON, persistGenerated };
})();
