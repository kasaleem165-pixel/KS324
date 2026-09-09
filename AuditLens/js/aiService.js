/* ==========================================================================
   aiService.js — Provider-agnostic AI adapter.
   Today every function below is answered DETERMINISTICALLY from local
   structured data (no network call, no external provider). The public
   surface (AIService.*) is what the rest of the app calls, so a real model
   provider (Claude / OpenAI / Gemini / a local LLM) can be plugged in later
   by replacing PROVIDER.* below without touching any calling code.

   Every answer is tagged with one of three labels so the auditor always
   knows what they are looking at:
     FACT     — pulled directly from stored document/audit data
     INTERPRETATION — a calculation or pattern derived from that data
     AI-SUGGESTION — free-text generated content (draft only; needs review)
   AI-generated material is NEVER written into the audit record as verified
   evidence — it is always surfaced as a labelled draft.
   ========================================================================== */
const AIService = (() => {

  const TAGS = { FACT:'fact', INTERPRETATION:'interp', SUGGESTION:'ai' };

  // ---------------- Provider adapter (swap this for a real API later) ----------------
  const PROVIDER = {
    name: 'local-deterministic',
    // Placeholder for a future call, e.g. Claude/OpenAI/Gemini/local LLM.
    // Must never be called unless Settings > AI Mode is 'external' AND the
    // user has explicitly confirmed sending document content off-device.
    async complete(prompt, context){
      throw new Error('No external AI provider is configured. AuditLens is running in Local Only mode.');
    }
  };

  function isExternalAllowed(){
    const s = (typeof App !== 'undefined' && App.settings) ? App.settings : {};
    return s.aiMode === 'external';
  }

  // ---------------- analyzeDocument ----------------
  async function analyzeDocument(doc, extracted){
    const checks = await Rules.resultsForDocument(doc.id, doc.auditId);
    const facts = {
      name: doc.name, category: doc.category, amount: doc.amount, date: doc.documentDate,
      party: doc.party, reference: doc.referenceNumber, status: doc.analysisStatus
    };
    const exceptions = checks.filter(c=>c.result==='EXCEPTION');
    const warnings = checks.filter(c=>c.result==='WARNING');
    return {
      tag: TAGS.INTERPRETATION,
      facts,
      summary: `${exceptions.length} exception(s) and ${warnings.length} warning(s) identified by the rule engine for this document.`,
      exceptions, warnings
    };
  }

  // ---------------- summarizeDocument ----------------
  function summarizeDocument(doc){
    const parts = [];
    parts.push(`${doc.category} "${doc.name}"`);
    if(doc.party) parts.push(`involving ${doc.party}`);
    if(doc.amount!=null) parts.push(`for ${Utils.fmtCurrency(doc.amount)}`);
    if(doc.documentDate) parts.push(`dated ${Utils.fmtDate(doc.documentDate)}`);
    return { tag: TAGS.FACT, text: parts.join(' ') + '.' };
  }

  // ---------------- summarizeAudit ----------------
  async function summarizeAudit(auditId){
    const audit = await Audits.get(auditId);
    const stats = await Audits.stats(auditId);
    const exceptions = await Exceptions.listForAudit(auditId);
    const byRisk = groupCount(exceptions, 'risk');
    const text = `${audit.name} (${audit.client}) is ${stats.progress}% complete. ` +
      `${stats.totalDocs} document(s) received, ${stats.analyzed} analyzed, ${stats.checksPerformed} checks performed. ` +
      `${stats.totalExceptions} exception(s) identified (${stats.highRisk} rated High/Critical), ${stats.openFindings} finding(s) still open.`;
    return { tag: TAGS.INTERPRETATION, text, stats, byRisk };
  }

  function groupCount(arr, field){
    const out = {};
    arr.forEach(a=>{ out[a[field]] = (out[a[field]]||0)+1; });
    return out;
  }

  // ---------------- identifyPotentialIssues ----------------
  async function identifyPotentialIssues(auditId){
    const dupes = await Analysis.duplicateDetection(auditId);
    const threeWay = await Analysis.threeWayMatch(auditId);
    const mismatches = threeWay.filter(r=>r.status==='MISMATCH' || r.status==='MISSING DOCUMENT');
    const issues = [];
    dupes.forEach(d=> issues.push({tag:TAGS.INTERPRETATION, text:`Potential duplicate ${d.type.toLowerCase()} across ${d.documents.length} ${d.category} document(s): ${d.field}. Requires auditor review.`}));
    mismatches.forEach(m=> issues.push({tag:TAGS.INTERPRETATION, text:`Three-way match ${m.status} for invoice "${m.invoice.name}" — ${m.missing.join(', ')||'amount/vendor/date variance'}. Review required.`}));
    return issues;
  }

  // ---------------- generateFinding (draft text for a finding, from an exception) ----------------
  function generateFinding(exception, document){
    const draft = {
      condition: exception.description,
      criteria: 'Per the audit program, transactions of this nature should be supported by complete documentation, appropriate approval, and be free of arithmetic or reference errors.',
      cause: '[AI-SUGGESTION — DRAFT, REQUIRES AUDITOR REVIEW] Likely cause could not be determined automatically; suggest auditor inquiry with the process owner.',
      effect: `[AI-SUGGESTION — DRAFT] Potential ${exception.risk.toLowerCase()}-risk misstatement or control deficiency` + (exception.amount!=null ? ` of up to ${Utils.fmtCurrency(exception.amount)}` : '') + '.',
      recommendation: '[AI-SUGGESTION — DRAFT] Management should investigate the root cause, correct the specific instance noted, and strengthen the related control to prevent recurrence.'
    };
    return { tag: TAGS.SUGGESTION, draft, notice:'This finding narrative is an AI-generated draft. It must be reviewed, edited and confirmed by the auditor before being relied upon.' };
  }

  // ---------------- generateReport (narrative wrapper used by Management Letter, Executive Summary) ----------------
  async function generateReport(kind, auditId, filters){
    const audit = await Audits.get(auditId);
    const summary = await summarizeAudit(auditId);
    const issues = await identifyPotentialIssues(auditId);
    return {
      tag: TAGS.SUGGESTION,
      kind, audit, summary, issues,
      notice: 'Narrative sections of this report are drafted from local audit data. Review and edit before issuing — this is not a substitute for auditor judgment.'
    };
  }

  // ---------------- answerQuery — see queries.js for NL parsing; this wraps the result ----------------
  async function answerQuery(question, auditId){
    return Queries.answer(question, auditId); // deterministic parser lives in queries.js
  }

  return {
    TAGS, PROVIDER, isExternalAllowed,
    analyzeDocument, summarizeDocument, summarizeAudit, identifyPotentialIssues, generateFinding, generateReport, answerQuery
  };
})();
