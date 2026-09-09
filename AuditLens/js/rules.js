/* ==========================================================================
   rules.js — Reusable Audit Check (Rules) Engine
   A rule = {id,name,description,category,severity,enabled,builtinKey|builderCondition}
   Running checks produces `checkResults` rows and, for EXCEPTION-severity
   findings, auto-creates linked `exceptions` (never auto-labels fraud).
   ========================================================================== */
const Rules = (() => {

  const CATEGORIES = ['Document','Amount','Date','Duplicate','Vendor','Compliance','Cross-Document','Custom'];
  const SEVERITIES = ['Critical','High','Medium','Low','Informational'];
  const RESULTS = ['PASS','WARNING','EXCEPTION','REVIEW REQUIRED','NOT APPLICABLE'];

  // ---------------- Default rule catalogue ----------------
  function getDefaultRuleDefinitions(){
    return [
      // DOCUMENT CHECKS
      {name:'Missing Date', category:'Document', severity:'Medium', builtinKey:'missingDate',
        description:'Flags documents with no document date captured.'},
      {name:'Missing Reference', category:'Document', severity:'Low', builtinKey:'missingReference',
        description:'Flags documents with no invoice/voucher/reference number captured.'},
      {name:'Missing Signature', category:'Document', severity:'Medium', builtinKey:'missingSignature',
        description:'Checks extracted text for signature/authorization wording.'},
      {name:'Missing Supporting Document', category:'Document', severity:'Medium', builtinKey:'missingSupportingDocument',
        description:'Invoice-type documents with no linked Purchase Order reference.'},
      {name:'Missing Approval', category:'Document', severity:'High', builtinKey:'missingApproval',
        description:'High-value documents with no approval wording found in the extracted text.'},
      // AMOUNT CHECKS
      {name:'Amount Above Threshold', category:'Amount', severity:'High', builtinKey:'amountAboveThreshold',
        description:'Transaction amount exceeds the audit high-risk threshold or materiality.'},
      {name:'Arithmetic Mismatch', category:'Amount', severity:'High', builtinKey:'arithmeticMismatch',
        description:'Extracted amount + tax does not equal the extracted total.'},
      {name:'Tax Mismatch', category:'Amount', severity:'Medium', builtinKey:'taxMismatch',
        description:'Amount present but no tax captured on a taxable document category.'},
      {name:'Unusually High Amount', category:'Amount', severity:'Medium', builtinKey:'unusuallyHighAmount',
        description:'Amount is more than 3x the average for its document category.'},
      {name:'Round Amount', category:'Amount', severity:'Informational', builtinKey:'roundAmount',
        description:'Amount is an exact round number — may indicate an estimate rather than an actual.'},
      {name:'Duplicate Amount', category:'Amount', severity:'Low', builtinKey:'duplicateAmount',
        description:'The same amount recurs across multiple documents of the same category.'},
      // DATE CHECKS
      {name:'Future Date', category:'Date', severity:'High', builtinKey:'futureDate',
        description:'Document date is after today\'s date.'},
      {name:'Outside Audit Period', category:'Date', severity:'Medium', builtinKey:'outsideAuditPeriod',
        description:'Document date falls outside the defined audit period.'},
      {name:'Invalid Date', category:'Date', severity:'Low', builtinKey:'invalidDate',
        description:'A date-like value was found but could not be parsed with confidence.'},
      {name:'Unusual Timing', category:'Date', severity:'Informational', builtinKey:'unusualTiming',
        description:'Document dated on a weekend or non-business day.'},
      // DUPLICATE CHECKS
      {name:'Duplicate Invoice Number', category:'Duplicate', severity:'High', builtinKey:'duplicateInvoiceNumber',
        description:'The same invoice number appears on more than one Invoice document.'},
      {name:'Duplicate Voucher Number', category:'Duplicate', severity:'High', builtinKey:'duplicateVoucherNumber',
        description:'The same voucher number appears on more than one Voucher document.'},
      {name:'Duplicate Transaction', category:'Duplicate', severity:'Medium', builtinKey:'duplicateTransaction',
        description:'Same amount, date and party recur across documents.'},
      {name:'Duplicate Payment', category:'Duplicate', severity:'High', builtinKey:'duplicatePayment',
        description:'The same reference number appears on more than one Payment document.'},
      // VENDOR CHECKS
      {name:'Duplicate Vendor', category:'Vendor', severity:'Medium', builtinKey:'duplicateVendor',
        description:'Very similar vendor names found — potential duplicate vendor master data.'},
      {name:'Same Bank Account', category:'Vendor', severity:'High', builtinKey:'sameBankAccount',
        description:'Different vendor names share the same extracted bank account number.'},
      {name:'Same Address', category:'Vendor', severity:'Medium', builtinKey:'sameAddress',
        description:'Different vendor names share the same extracted address.'},
      {name:'High Vendor Concentration', category:'Vendor', severity:'Low', builtinKey:'highVendorConcentration',
        description:'A single vendor accounts for a large share of total transaction value.'},
      // COMPLIANCE CHECKS
      {name:'Policy Threshold Exceeded', category:'Compliance', severity:'High', builtinKey:'policyThresholdExceeded',
        description:'Amount exceeds performance materiality with no approval evidence found.'},
      // CROSS-DOCUMENT CHECKS
      {name:'Invoice ↔ Purchase Order', category:'Cross-Document', severity:'Medium', builtinKey:'invoicePOMatch',
        description:'Matches each Invoice to a Purchase Order by reference number.'},
      {name:'Invoice ↔ Payment', category:'Cross-Document', severity:'Low', builtinKey:'invoicePaymentMatch',
        description:'Checks whether each Invoice can be traced to a Payment record.'},
      {name:'Payroll ↔ Payment', category:'Cross-Document', severity:'Medium', builtinKey:'payrollPaymentMatch',
        description:'Checks whether Payroll documents can be traced to a corresponding Payment.'}
    ];
  }

  async function listForAudit(auditId){
    return (await Db.getByAudit('rules', auditId)).sort((a,b)=> a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
  }

  async function create(auditId, data){
    const rule = Object.assign({id:Utils.uid('rule'), auditId, enabled:true, custom:true, category:'Custom', severity:'Medium'}, data);
    await Db.add('rules', rule);
    await AuditTrail.log('Rule created', rule.name, null, rule);
    return rule;
  }
  async function update(id, patch){
    const existing = await Db.get('rules', id);
    const updated = Object.assign({}, existing, patch);
    await Db.put('rules', updated);
    await AuditTrail.log('Rule updated', updated.name, existing, updated);
    return updated;
  }
  async function remove(id){
    const existing = await Db.get('rules', id);
    await Db.remove('rules', id);
    await AuditTrail.log('Rule deleted', existing ? existing.name : id, existing, null);
  }
  async function duplicate(id){
    const existing = await Db.get('rules', id);
    if(!existing) return null;
    const copy = Object.assign({}, existing, {id:Utils.uid('rule'), name: existing.name + ' (Copy)', custom:true});
    await Db.add('rules', copy);
    return copy;
  }
  async function toggle(id, enabled){ return update(id, {enabled}); }

  // ---------------- Builder condition evaluation (custom rules) ----------------
  function getField(doc, extracted, field){
    if(field.startsWith('extracted.')){
      const key = field.split('.')[1];
      return extracted && extracted.fields && extracted.fields[key] ? extracted.fields[key].value : null;
    }
    return doc[field];
  }
  function evalOperator(value, operator, target){
    const num = parseFloat(value), num2 = parseFloat(target);
    switch(operator){
      case '>': return !isNaN(num) && num > num2;
      case '>=': return !isNaN(num) && num >= num2;
      case '<': return !isNaN(num) && num < num2;
      case '<=': return !isNaN(num) && num <= num2;
      case '==': return String(value||'').toLowerCase() === String(target||'').toLowerCase();
      case '!=': return String(value||'').toLowerCase() !== String(target||'').toLowerCase();
      case 'contains': return String(value||'').toLowerCase().includes(String(target||'').toLowerCase());
      case 'isEmpty': return value === null || value === undefined || value === '';
      case 'isMissing': return value === null || value === undefined || value === '' || value === 'Missing';
      default: return false;
    }
  }
  function evalBuilderCondition(cond, doc, extracted){
    if(!cond) return false;
    const clauses = [cond].concat(cond.andWith || []);
    return clauses.every(c=> evalOperator(getField(doc, extracted, c.field), c.operator, c.value));
  }

  // ---------------- Built-in rule handlers ----------------
  const BUILTIN = {
    missingDate: (doc)=> !doc.documentDate ? ex('Document date not captured — required for period-cutoff testing.') : pass(),
    missingReference: (doc)=> !doc.referenceNumber ? warn('No invoice/voucher/reference number captured.') : pass(),
    missingSignature: (doc, ctx)=>{
      const text = (doc.extractionText||'').toLowerCase();
      if(!text) return na('No extracted text available to check for a signature.');
      return /sign(ed|ature)?|authoriz(ed|ation)/i.test(text) ? pass() : review('Signature / authorization wording not found in extracted text — review the original document.');
    },
    missingSupportingDocument: (doc)=>{
      if(!['Invoice','Purchase Order'].includes(doc.category)) return na();
      if(doc.category==='Invoice' && !doc.links.po) return warn('Purchase order not found for this invoice.');
      return pass();
    },
    missingApproval: (doc, ctx)=>{
      const threshold = ctx.audit.highRiskThreshold || Infinity;
      if(!doc.amount || doc.amount <= threshold) return na();
      const text = (doc.extractionText||'').toLowerCase();
      return /approved|approval/.test(text) ? pass() : ex('High-value document with no approval evidence found in extracted text.');
    },
    amountAboveThreshold: (doc, ctx)=>{
      if(doc.amount == null) return na();
      const materiality = ctx.audit.materiality || Infinity;
      const hrt = ctx.audit.highRiskThreshold || Infinity;
      if(doc.amount > materiality) return ex(`Amount ${Utils.fmtCurrency(doc.amount, ctx.audit.currency)} exceeds materiality of ${Utils.fmtCurrency(materiality, ctx.audit.currency)}.`);
      if(doc.amount > hrt) return review(`Amount ${Utils.fmtCurrency(doc.amount, ctx.audit.currency)} exceeds the high-risk threshold — review recommended.`);
      return pass();
    },
    arithmeticMismatch: (doc, ctx)=>{
      const f = ctx.extracted && ctx.extracted.fields;
      if(!f || f.amount?.value==null || f.total?.value==null) return na();
      const tax = f.tax?.value || 0;
      const expected = Math.round((f.amount.value + tax) * 100)/100;
      const total = Math.round(f.total.value * 100)/100;
      return Math.abs(expected-total) > 1 ? ex(`Amount (${f.amount.value}) + Tax (${tax}) = ${expected}, but document total is ${total}.`) : pass();
    },
    taxMismatch: (doc, ctx)=>{
      if(!['Invoice','Purchase Order','Sales Record'].includes(doc.category)) return na();
      const f = ctx.extracted && ctx.extracted.fields;
      if(!f || f.amount?.value==null) return na();
      if((f.tax?.value||0) === 0 && f.amount.value > 0) return warn('No tax amount captured on a taxable document — verify tax treatment.');
      return pass();
    },
    unusuallyHighAmount: (doc, ctx)=>{
      if(doc.amount == null) return na();
      const peers = ctx.allDocs.filter(d=>d.category===doc.category && d.amount!=null && d.id!==doc.id);
      if(peers.length < 2) return na();
      const avg = peers.reduce((s,d)=>s+d.amount,0)/peers.length;
      return doc.amount > avg*3 ? warn(`Amount is ${(doc.amount/avg).toFixed(1)}x the ${doc.category} average (${Utils.fmtCurrency(avg, ctx.audit.currency)}).`) : pass();
    },
    roundAmount: (doc)=> (doc.amount && doc.amount>=10000 && doc.amount % 1000 === 0) ? warn('Amount is an exact round figure — may indicate an estimate.') : pass(),
    duplicateAmount: (doc, ctx)=>{
      if(doc.amount==null) return na();
      const matches = ctx.allDocs.filter(d=>d.category===doc.category && d.amount===doc.amount && d.id!==doc.id);
      return matches.length ? warn(`${matches.length} other ${doc.category} document(s) share this exact amount.`) : pass();
    },
    futureDate: (doc)=> (doc.documentDate && new Date(doc.documentDate) > new Date()) ? ex('Document date is in the future.') : pass(),
    outsideAuditPeriod: (doc, ctx)=>{
      if(!doc.documentDate || !ctx.audit.periodFrom || !ctx.audit.periodTo) return na();
      const d = new Date(doc.documentDate);
      return (d < new Date(ctx.audit.periodFrom) || d > new Date(ctx.audit.periodTo)) ? ex('Document date falls outside the defined audit period.') : pass();
    },
    invalidDate: (doc, ctx)=>{
      const f = ctx.extracted && ctx.extracted.fields && ctx.extracted.fields.documentDate;
      return (f && f.status==='Review Required') ? warn('A date-like value was found but could not be parsed reliably.') : pass();
    },
    unusualTiming: (doc)=>{
      if(!doc.documentDate) return na();
      const day = new Date(doc.documentDate).getDay();
      return (day===0||day===6) ? warn('Document dated on a weekend.') : pass();
    },
    duplicateInvoiceNumber: (doc, ctx)=> dupCheck(doc, ctx, 'Invoice', 'referenceNumber', 'invoice number'),
    duplicateVoucherNumber: (doc, ctx)=> dupCheck(doc, ctx, 'Voucher', 'referenceNumber', 'voucher number'),
    duplicatePayment: (doc, ctx)=> dupCheck(doc, ctx, 'Payment', 'referenceNumber', 'payment reference'),
    duplicateTransaction: (doc, ctx)=>{
      if(doc.amount==null || !doc.documentDate || !doc.party) return na();
      const matches = ctx.allDocs.filter(d=> d.id!==doc.id && d.amount===doc.amount && d.documentDate===doc.documentDate && (d.party||'').toLowerCase()===(doc.party||'').toLowerCase());
      return matches.length ? warn(`Potential duplicate transaction — same amount, date and party as ${matches.length} other document(s).`) : pass();
    },
    duplicateVendor: (doc, ctx)=>{
      if(!doc.party) return na();
      const norm = doc.party.toLowerCase().replace(/[^a-z0-9]/g,'');
      const matches = ctx.allDocs.filter(d=>d.id!==doc.id && d.party && d.party.toLowerCase().replace(/[^a-z0-9]/g,'')===norm && d.party!==doc.party);
      return matches.length ? warn(`Similar vendor name variant found: "${matches[0].party}" — potential duplicate vendor record.`) : pass();
    },
    sameBankAccount: (doc, ctx)=>{
      const acc = ctx.extracted?.fields?.bankAccount?.value;
      if(!acc || !doc.party) return na();
      const others = ctx.allExtracted.filter(e=> e.documentId!==doc.id && e.fields?.bankAccount?.value === acc);
      if(!others.length) return pass();
      const otherDocs = others.map(e=>ctx.allDocs.find(d=>d.id===e.documentId)).filter(Boolean);
      const diffVendor = otherDocs.find(d=>d.party && d.party!==doc.party);
      return diffVendor ? ex(`Bank account also used by a different vendor: "${diffVendor.party}".`) : pass();
    },
    sameAddress: (doc, ctx)=>{
      const addr = ctx.extracted?.fields?.address?.value;
      if(!addr || !doc.party) return na();
      const others = ctx.allExtracted.filter(e=> e.documentId!==doc.id && e.fields?.address?.value === addr);
      const otherDocs = others.map(e=>ctx.allDocs.find(d=>d.id===e.documentId)).filter(Boolean);
      const diffVendor = otherDocs.find(d=>d.party && d.party!==doc.party);
      return diffVendor ? warn(`Address also used by a different vendor: "${diffVendor.party}".`) : pass();
    },
    highVendorConcentration: (doc, ctx)=>{
      if(!doc.party || doc.amount==null) return na();
      const vendorDocs = ctx.allDocs.filter(d=>d.party===doc.party && d.amount!=null);
      const total = ctx.allDocs.filter(d=>d.amount!=null).reduce((s,d)=>s+d.amount,0);
      const vendorTotal = vendorDocs.reduce((s,d)=>s+d.amount,0);
      if(!total) return na();
      const pct = vendorTotal/total;
      return pct > 0.4 ? warn(`Vendor "${doc.party}" represents ${(pct*100).toFixed(0)}% of total transaction value.`) : pass();
    },
    policyThresholdExceeded: (doc, ctx)=>{
      const pm = ctx.audit.performanceMateriality || Infinity;
      if(doc.amount==null || doc.amount <= pm) return na();
      const text = (doc.extractionText||'').toLowerCase();
      return /approved|approval/.test(text) ? pass() : ex(`Amount exceeds performance materiality (${Utils.fmtCurrency(pm, ctx.audit.currency)}) with no approval evidence found.`);
    },
    invoicePOMatch: (doc, ctx)=>{
      if(doc.category !== 'Invoice') return na();
      if(!doc.links.po) return ex('No linked Purchase Order reference found for this invoice.');
      const po = ctx.allDocs.find(d=>d.category==='Purchase Order' && d.referenceNumber===doc.links.po);
      if(!po) return ex(`Referenced Purchase Order "${doc.links.po}" was not found among uploaded documents.`);
      if(po.amount!=null && doc.amount!=null && Math.abs(po.amount-doc.amount) > Math.max(1, po.amount*0.02)){
        return warn(`Invoice amount (${Utils.fmtCurrency(doc.amount, ctx.audit.currency)}) differs from PO amount (${Utils.fmtCurrency(po.amount, ctx.audit.currency)}).`);
      }
      return pass();
    },
    invoicePaymentMatch: (doc, ctx)=>{
      if(doc.category !== 'Invoice') return na();
      const paid = ctx.allDocs.find(d=>d.category==='Payment' && (d.links.invoice===doc.referenceNumber || d.referenceNumber===doc.referenceNumber));
      return paid ? pass() : review('No corresponding Payment record found — payment may still be outstanding.');
    },
    payrollPaymentMatch: (doc, ctx)=>{
      if(doc.category !== 'Payroll') return na();
      const paid = ctx.allDocs.find(d=>d.category==='Payment' && d.amount===doc.amount);
      return paid ? pass() : review('No corresponding Payment record found for this payroll amount.');
    }
  };

  function dupCheck(doc, ctx, category, field, label){
    if(doc.category !== category || !doc[field]) return na();
    const matches = ctx.allDocs.filter(d=> d.id!==doc.id && d.category===category && d[field]===doc[field]);
    return matches.length ? ex(`Potential duplicate ${label}: "${doc[field]}" also appears on ${matches.length} other document(s).`) : pass();
  }
  function pass(msg){ return {result:'PASS', message: msg||'No issue identified.'}; }
  function warn(msg){ return {result:'WARNING', message: msg}; }
  function ex(msg){ return {result:'EXCEPTION', message: msg}; }
  function review(msg){ return {result:'REVIEW REQUIRED', message: msg}; }
  function na(msg){ return {result:'NOT APPLICABLE', message: msg||'Rule does not apply to this document.'}; }

  // ---------------- Run all enabled rules for an audit ----------------
  async function runChecks(auditId){
    const [audit, docs, rules, allExtracted] = await Promise.all([
      Audits.get(auditId), Documents.listForAudit(auditId), listForAudit(auditId), Db.getByAudit('extractedData', auditId)
    ]);
    const enabledRules = rules.filter(r=>r.enabled);
    const results = [];
    let exceptionsCreated = 0;

    for(const doc of docs){
      const extracted = allExtracted.find(e=>e.documentId===doc.id) || null;
      const ctx = {audit, allDocs:docs, allExtracted, extracted};
      for(const rule of enabledRules){
        let outcome;
        try{
          if(rule.builtinKey && BUILTIN[rule.builtinKey]){
            outcome = BUILTIN[rule.builtinKey](doc, ctx);
          } else if(rule.builderCondition){
            outcome = evalBuilderCondition(rule.builderCondition, doc, extracted) ? ex(rule.description) : pass();
          } else {
            outcome = na('Rule has no evaluatable condition.');
          }
        }catch(e){
          outcome = {result:'REVIEW REQUIRED', message:'Rule evaluation error: ' + e.message};
        }
        const cr = {
          id:Utils.uid('cr'), auditId, documentId:doc.id, ruleId:rule.id, ruleName:rule.name,
          category:rule.category, severity:rule.severity, result:outcome.result, message:outcome.message,
          evaluatedAt:new Date().toISOString()
        };
        await Db.add('checkResults', cr);
        results.push(cr);

        if(outcome.result === 'EXCEPTION'){
          const already = await findExistingException(auditId, doc.id, rule.id);
          if(!already){
            await Exceptions.createFromCheck(audit, doc, rule, outcome.message);
            exceptionsCreated++;
          }
        }
      }
    }
    await AuditTrail.log('Rule execution', audit.name, null, `${results.length} checks run, ${exceptionsCreated} new exceptions`);
    return {results, exceptionsCreated};
  }

  async function findExistingException(auditId, documentId, ruleId){
    const rows = await Db.getByAudit('exceptions', auditId);
    return rows.find(r=>r.documentId===documentId && r.ruleId===ruleId && r.status!=='Closed');
  }

  async function latestResultsForAudit(auditId){
    return Db.getByAudit('checkResults', auditId);
  }
  async function resultsForDocument(documentId, auditId){
    const all = await Db.getByAudit('checkResults', auditId);
    return all.filter(r=>r.documentId===documentId).sort((a,b)=> new Date(b.evaluatedAt)-new Date(a.evaluatedAt));
  }

  return {
    CATEGORIES, SEVERITIES, RESULTS, getDefaultRuleDefinitions, listForAudit, create, update, remove, duplicate, toggle,
    runChecks, latestResultsForAudit, resultsForDocument, evalBuilderCondition
  };
})();
