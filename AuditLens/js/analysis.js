/* ==========================================================================
   analysis.js — Three-way matching, duplicate detection, document relationships
   ========================================================================== */
const Analysis = (() => {

  // ---------------- Three-way matching: PO vs GRN vs Invoice ----------------
  async function threeWayMatch(auditId){
    const docs = await Documents.listForAudit(auditId);
    const invoices = docs.filter(d=>d.category==='Invoice');
    const pos = docs.filter(d=>d.category==='Purchase Order');
    const grns = docs.filter(d=>d.category==='Inventory' || d.category==='Sales Record'); // GRN proxy category
    const rows = [];

    invoices.forEach(inv=>{
      const po = pos.find(p=>p.referenceNumber === inv.links.po) || null;
      const grn = grns.find(g=>g.links && g.links.po === inv.links.po) || null;
      const fields = ['amount','party','documentDate'];
      let matched=0, total=0, missing=[];
      if(!po) missing.push('Purchase Order');
      if(!grn) missing.push('Goods Receipt');

      let status;
      if(missing.length===2){ status='MISSING DOCUMENT'; }
      else{
        fields.forEach(f=>{
          total++;
          const invVal = inv[f], poVal = po ? po[f] : undefined;
          if(po && invVal!=null && poVal!=null){
            const same = (f==='amount') ? Math.abs(invVal-poVal) <= Math.max(1, invVal*0.02) : String(invVal).toLowerCase()===String(poVal).toLowerCase();
            if(same) matched++;
          }
        });
        if(missing.length>0) status = 'PARTIAL MATCH';
        else if(matched===total) status = 'MATCHED';
        else if(matched>0) status = 'PARTIAL MATCH';
        else status = 'MISMATCH';
      }

      rows.push({
        invoice: inv, po, grn, status, missing,
        detail: {
          quantity: 'Not tracked — quantity fields are not extracted from unstructured documents in this version.',
          unitPrice: 'Not tracked automatically — verify manually against the PO line items.',
          amount: po ? `Invoice ${Utils.fmtCurrency(inv.amount)} vs PO ${Utils.fmtCurrency(po.amount)}` : 'PO not available',
          vendor: po ? `${inv.party||'—'} vs ${po.party||'—'}` : 'PO not available',
          date: po ? `${Utils.fmtDate(inv.documentDate)} vs ${Utils.fmtDate(po.documentDate)}` : 'PO not available',
          reference: `Invoice references PO "${inv.links.po||'none'}"`
        }
      });
    });
    return rows;
  }

  // ---------------- Duplicate detection ----------------
  async function duplicateDetection(auditId){
    const docs = await Documents.listForAudit(auditId);
    const groups = {};
    docs.forEach(d=>{
      if(!d.referenceNumber) return;
      const key = d.category + '|' + d.referenceNumber.toLowerCase();
      (groups[key] = groups[key] || []).push(d);
    });
    const byAmount = {};
    docs.forEach(d=>{
      if(d.amount==null) return;
      const key = d.category + '|' + d.amount + '|' + (d.party||'').toLowerCase() + '|' + (d.documentDate||'');
      (byAmount[key] = byAmount[key] || []).push(d);
    });

    const results = [];
    Object.entries(groups).forEach(([key, arr])=>{
      if(arr.length > 1){
        results.push({
          type:'Reference Number', field:key.split('|')[1], category:arr[0].category, documents:arr,
          note:'Potential duplicate — same reference number used on multiple documents.'
        });
      }
    });
    Object.entries(byAmount).forEach(([key, arr])=>{
      if(arr.length > 1){
        results.push({
          type:'Amount + Vendor + Date', field:Utils.fmtCurrency(arr[0].amount), category:arr[0].category, documents:arr,
          note:'Potential duplicate — same amount, vendor and date on multiple documents.'
        });
      }
    });
    return results;
  }

  // ---------------- Document relationship chain ----------------
  async function relationshipChain(doc, auditId){
    const docs = await Documents.listForAudit(auditId);
    const po = doc.links.po ? docs.find(d=>d.category==='Purchase Order' && d.referenceNumber===doc.links.po) : null;
    const grn = doc.links.grn ? docs.find(d=>d.referenceNumber===doc.links.grn) : null;
    const invoice = doc.category==='Invoice' ? doc : (doc.links.invoice ? docs.find(d=>d.referenceNumber===doc.links.invoice) : null);
    const payment = docs.find(d=>d.category==='Payment' && (d.links.invoice===doc.referenceNumber || d.referenceNumber===doc.links.payment));
    return [
      {label:'Purchase Order', doc: po},
      {label:'Invoice', doc: invoice},
      {label:'Goods Receipt', doc: grn},
      {label:'Payment', doc: payment}
    ];
  }

  return { threeWayMatch, duplicateDetection, relationshipChain };
})();
