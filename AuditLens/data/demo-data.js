/* ==========================================================================
   demo-data.js — Generates one realistic demo audit so AuditLens is usable
   immediately after first open. All "documents" here are plain-text (.txt)
   synthetic files run through the REAL extraction + rules pipeline, so the
   demo proves the actual mechanics rather than being hand-faked data.
   ========================================================================== */
const DemoData = (() => {

  function textBlob(str){ return new Blob([str], {type:'text/plain'}); }

  function invoiceText({num, date, vendor, address, ntn, po, desc, amount, tax, total, approved}){
    return [
      'INVOICE',
      `Invoice Number: ${num}`,
      `Invoice Date: ${date}`,
      `Vendor: ${vendor}`,
      `Address: ${address}`,
      `NTN: ${ntn}`,
      po ? `Purchase Order No: ${po}` : '',
      `Description: ${desc}`,
      `Amount: ${amount.toLocaleString()}`,
      `Tax: ${tax.toLocaleString()}`,
      `Total: ${total.toLocaleString()}`,
      approved ? `Approved by Finance Manager on ${date}.` : 'Pending review — not yet approved.'
    ].filter(Boolean).join('\n');
  }
  function poText({num, date, vendor, desc, amount}){
    return ['PURCHASE ORDER', `PO Number: ${num}`, `Date: ${date}`, `Vendor: ${vendor}`,
      `Description: ${desc}`, `Amount: ${amount.toLocaleString()}`, `Total: ${amount.toLocaleString()}`].join('\n');
  }
  function paymentText({num, date, vendor, invoiceRef, amount, bank}){
    return ['PAYMENT VOUCHER', `Reference: ${num}`, `Date: ${date}`, `Vendor: ${vendor}`,
      `Description: Payment against Invoice ${invoiceRef}`, `Bank Account: ${bank}`,
      `Amount: ${amount.toLocaleString()}`, `Total: ${amount.toLocaleString()}`, `Approved by Finance Manager on ${date}.`].join('\n');
  }
  function receiptText({num, date, party, amount}){
    return ['CASH RECEIPT', `Reference: ${num}`, `Date: ${date}`, `Vendor: ${party}`,
      `Description: Receipt acknowledgement`, `Amount: ${amount.toLocaleString()}`, `Total: ${amount.toLocaleString()}`].join('\n');
  }
  function bankText({num, date, desc, amount}){
    return ['BANK STATEMENT', `Reference: ${num}`, `Date: ${date}`, `Description: ${desc}`,
      `Account No: PK36AUDT0000${num}`, `Amount: ${amount.toLocaleString()}`, `Total: ${amount.toLocaleString()}`].join('\n');
  }
  function payrollText({num, date, amount}){
    return ['PAYROLL SUMMARY', `Reference: ${num}`, `Date: ${date}`, `Vendor: Staff Payroll — February 2026`,
      `Description: Net salaries payable for all staff`, `Amount: ${amount.toLocaleString()}`, `Total: ${amount.toLocaleString()}`,
      `Approved by Finance Manager on ${date}.`].join('\n');
  }

  async function makeDoc(auditId, {name, category, text, sourceType}){
    const blob = textBlob(text);
    const file = new File([blob], name, {type:'text/plain'});
    const doc = await Documents.addFromFile(auditId, file, category, sourceType || 'upload');
    await Extraction.runExtraction(doc);
    return Documents.get(doc.id);
  }

  async function seed(){
    const audit = await Audits.create({
      name:'Multan Textile Mills — Annual Financial Audit FY2026',
      client:'Multan Textile Mills Ltd',
      reference:'AUD-2026-001',
      type:'Financial',
      periodFrom:'2026-01-01',
      periodTo:'2026-06-30',
      leadAuditor:'M. Kamran, ACA',
      department:'Finance & Accounts',
      materiality:5000000,
      performanceMateriality:3000000,
      highRiskThreshold:1000000,
      currency:'PKR',
      description:'Annual statutory financial audit covering purchases, payroll, banking and revenue cycles for the six-month period ended 30-Jun-2026.',
      notes:'Demo audit auto-generated on first run so the application can be explored immediately.',
      status:'Fieldwork'
    });
    const A = audit.id;

    // ---- Purchase Orders (3) ----
    await makeDoc(A, {name:'PO_101.txt', category:'Purchase Order', text: poText({num:'PO-101', date:'10-01-2026', vendor:'Al-Habib Traders', desc:'Raw cotton fabric rolls', amount:800000})});
    await makeDoc(A, {name:'PO_102.txt', category:'Purchase Order', text: poText({num:'PO-102', date:'01-02-2026', vendor:'Zenith Suppliers', desc:'Packaging material', amount:450000})});
    await makeDoc(A, {name:'PO_103.txt', category:'Purchase Order', text: poText({num:'PO-103', date:'10-02-2026', vendor:'National Hardware Store', desc:'Machine spare parts', amount:300000})});

    // ---- Invoices (10), including deliberate exceptions ----
    await makeDoc(A, {name:'Invoice_1001.txt', category:'Invoice', text: invoiceText({num:'INV-1001', date:'20-01-2026', vendor:'Al-Habib Traders', address:'Plot 12, Industrial Area, Multan', ntn:'1234567-8', po:'PO-101', desc:'Raw cotton fabric rolls', amount:800000, tax:144000, total:944000, approved:true})});
    await makeDoc(A, {name:'Invoice_1002.txt', category:'Invoice', text: invoiceText({num:'INV-1002', date:'05-02-2026', vendor:'Zenith Suppliers', address:'23-B Gulberg, Lahore', ntn:'2233445-6', po:'PO-102', desc:'Packaging material', amount:450000, tax:81000, total:531000, approved:true})});
    await makeDoc(A, {name:'Invoice_1003.txt', category:'Invoice', text: invoiceText({num:'INV-1003', date:'15-02-2026', vendor:'National Hardware Store', address:'Hall Road, Multan', ntn:'3344556-7', po:'PO-103', desc:'Machine spare parts', amount:300000, tax:54000, total:354000, approved:true})});
    await makeDoc(A, {name:'Invoice_1004.txt', category:'Invoice', text: invoiceText({num:'INV-1004', date:'20-02-2026', vendor:'Speedy Logistics', address:'Multan Bypass, Multan', ntn:'4455667-8', po:null, desc:'Freight and transport charges — no PO raised', amount:120000, tax:0, total:120000, approved:true})}); // invoice without PO
    await makeDoc(A, {name:'Invoice_1005.txt', category:'Invoice', text: invoiceText({num:'INV-1005', date:'01-03-2026', vendor:'Crown Enterprises', address:'DHA Phase 5, Lahore', ntn:'5566778-9', po:null, desc:'Bulk dyeing chemicals — urgent purchase', amount:1500000, tax:270000, total:1770000, approved:false})}); // high-value + missing approval
    await makeDoc(A, {name:'Invoice_1006.txt', category:'Invoice', text: invoiceText({num:'INV-1006', date:'05-03-2026', vendor:'Metro Stationers', address:'Chowk Bazaar, Multan', ntn:'6677889-0', po:null, desc:'Office stationery', amount:60000, tax:0, total:60000, approved:true})}); // round amount
    await makeDoc(A, {name:'Invoice_1007.txt', category:'Invoice', text: invoiceText({num:'INV-1007', date:'10-03-2026', vendor:'Prime Electricals', address:'Model Town, Multan', ntn:'7788990-1', po:null, desc:'Electrical fittings for plant', amount:250000, tax:37500, total:300000, approved:true})}); // arithmetic mismatch (250000+37500=287500, not 300000)
    await makeDoc(A, {name:'Invoice_1001_dup.txt', category:'Invoice', text: invoiceText({num:'INV-1001', date:'15-03-2026', vendor:'Al-Habib Traders', address:'Plot 12, Industrial Area, Multan', ntn:'1234567-8', po:null, desc:'Additional cotton fabric rolls — resubmission', amount:810000, tax:145800, total:955800, approved:true})}); // duplicate invoice number
    await makeDoc(A, {name:'Invoice_1009.txt', category:'Invoice', text: invoiceText({num:'INV-1009', date:'20-03-2026', vendor:'Al-Habib Traders', address:'Plot 12, Industrial Area, Multan', ntn:'1234567-8', po:null, desc:'Minor fabric top-up order', amount:95000, tax:17100, total:112100, approved:true})});
    await makeDoc(A, {name:'Invoice_1010.txt', category:'Invoice', text: invoiceText({num:'INV-1010', date:'15-11-2025', vendor:'Zenith Suppliers', address:'23-B Gulberg, Lahore', ntn:'2233445-6', po:null, desc:'Packaging material — prior period', amount:220000, tax:39600, total:259600, approved:true})}); // outside audit period

    // ---- Payments (2) ----
    await makeDoc(A, {name:'Payment_301.txt', category:'Payment', text: paymentText({num:'PAY-301', date:'25-01-2026', vendor:'Al-Habib Traders', invoiceRef:'INV-1001', amount:800000, bank:'Habib Bank Ltd — 01-2233-4455'})});
    await makeDoc(A, {name:'Payment_302.txt', category:'Payment', text: paymentText({num:'PAY-302', date:'10-02-2026', vendor:'Zenith Suppliers', invoiceRef:'INV-1002', amount:450000, bank:'MCB Bank Ltd — 09-8877-6655'})});

    // ---- Bank Statements (2) ----
    await makeDoc(A, {name:'BankStatement_Jan2026.txt', category:'Bank Statement', text: bankText({num:'BNK-JAN26', date:'31-01-2026', desc:'Monthly bank statement — January 2026', amount:800000})});
    await makeDoc(A, {name:'BankStatement_Feb2026.txt', category:'Bank Statement', text: bankText({num:'BNK-FEB26', date:'28-02-2026', desc:'Monthly bank statement — February 2026', amount:450000})});

    // ---- Receipts (2) ----
    await makeDoc(A, {name:'Receipt_201.txt', category:'Receipt', text: receiptText({num:'RCPT-201', date:'25-01-2026', party:'Lahore Garments Co', amount:50000})});
    await makeDoc(A, {name:'Receipt_202.txt', category:'Receipt', text: receiptText({num:'RCPT-202', date:'18-02-2026', party:'Faisalabad Fabrics', amount:75000})});

    // ---- Payroll (1) ----
    await makeDoc(A, {name:'Payroll_Feb2026.txt', category:'Payroll', text: payrollText({num:'PR-FEB26', date:'28-02-2026', amount:350000})});

    // ---- Run the real audit-check engine so exceptions are generated organically ----
    await Rules.runChecks(A);

    // ---- Ensure a rounded set of working papers exists ----
    const docs = await Documents.listForAudit(A);
    const exceptions = await Exceptions.listForAudit(A);
    const invDoc = n => docs.find(d=>d.name===n);

    const wp1 = await WorkingPapers.create(A, {
      title:'Purchases & Payables — Vouching of Invoices to Purchase Orders',
      objective:'To verify that a sample of purchase invoices are properly supported by an approved purchase order and correctly recorded.',
      scope:'All Invoice-category documents recorded during the audit period.',
      population:`${docs.filter(d=>d.category==='Invoice').length} invoices totalling ${Utils.fmtCurrency(docs.filter(d=>d.category==='Invoice').reduce((s,d)=>s+(d.amount||0),0), audit.currency)}.`,
      sample:'Judgmental sample — all invoices above the high-risk threshold plus 3 invoices selected at random.',
      procedure:'Traced each sampled invoice to its purchase order, agreed vendor/amount/date, and inspected for evidence of approval.',
      evidence:'See linked documents.',
      testing:'10 invoices tested; 3 exceptions noted (missing PO, arithmetic mismatch, duplicate invoice number).',
      results:'Not all invoices could be matched to an approved purchase order; one arithmetic discrepancy identified.',
      conclusion:'Based on procedures performed, the purchases cycle is operating with some control gaps that require management attention. See linked exceptions.',
      preparedBy:'M. Kamran, ACA', preparedDate:'2026-04-05',
      reviewedBy:'S. Fatima, FCA', reviewDate:'2026-04-08', reviewStatus:'Reviewed'
    });
    for(const d of docs.filter(d=>d.category==='Invoice')) await WorkingPapers.linkDocument(wp1.id, d.id);
    for(const e of exceptions) await WorkingPapers.linkException(wp1.id, e.id);

    const wp2 = await WorkingPapers.create(A, {
      title:'Cash & Bank — Reconciliation of Payments to Bank Statements',
      objective:'To confirm that recorded payments are supported by corresponding bank statement entries.',
      scope:'Payment vouchers and bank statements for January–February 2026.',
      population:'2 payment vouchers and 2 monthly bank statements.',
      sample:'100% — full population tested given the low volume.',
      procedure:'Agreed each payment voucher amount and date to the corresponding bank statement entry.',
      evidence:'See linked documents.',
      testing:'Both payments traced to bank statement entries without exception.',
      results:'No exceptions noted.',
      conclusion:'Cash and bank payments tested are adequately supported and reconciled.',
      preparedBy:'M. Kamran, ACA', preparedDate:'2026-04-10',
      reviewedBy:'', reviewDate:'', reviewStatus:'Ready for Review'
    });
    const bankAndPay = docs.filter(d=>d.category==='Payment'||d.category==='Bank Statement');
    for(const d of bankAndPay) await WorkingPapers.linkDocument(wp2.id, d.id);

    // ---- Convert the highest-risk exception into a formal finding ----
    const topException = exceptions.sort((a,b)=>{
      const order=['Informational','Low','Medium','High','Critical'];
      return order.indexOf(b.risk)-order.indexOf(a.risk);
    })[0];
    if(topException){
      await Findings.createFromException(topException);
    }

    // ---- A sample saved query, so Query History isn't empty on first look ----
    const q = 'Which invoices do not have purchase orders?';
    const result = await Queries.answer(q, A);
    await Queries.save(A, q, result);

    return audit;
  }

  return { seed };
})();
