/* ==========================================================================
   documents.js — Document register CRUD, categories, upload handling
   ========================================================================== */
const Documents = (() => {

  const CATEGORIES = ['Financial Statement','Invoice','Receipt','Bank Statement','Ledger','Voucher',
    'Purchase Order','Sales Record','Payroll','Tax Document','Contract','Agreement','Inventory',
    'Fixed Asset','Budget','Expense','Tender','Payment','Minutes','Policy','Correspondence','Other'];

  const ACCEPTED_EXT = ['.pdf','.jpg','.jpeg','.png','.txt','.csv','.xls','.xlsx','.doc','.docx'];

  function blank(auditId){
    return {
      id: Utils.uid('doc'),
      auditId,
      name:'', category:'Other', customCategory:'',
      documentDate:'', referenceNumber:'', party:'', amount:null,
      mime:'', size:0, fileBlob:null, sourceType:'upload', // upload | camera
      uploadDate:new Date().toISOString(),
      analysisStatus:'Not Analyzed', // Not Analyzed | Processing | Analyzed | Review Required | Failed
      risk:'Low',
      extractionText:'', extractionMethod:'', extractionError:'',
      observation:'', conclusion:'',
      links:{ po:'', grn:'', invoice:'', payment:'' }, // reference numbers of linked docs
      updatedAt:new Date().toISOString()
    };
  }

  async function addFromFile(auditId, file, category, sourceType){
    if(!file) throw new Error('No file provided');
    const ext = '.' + (file.name.split('.').pop()||'').toLowerCase();
    if(!ACCEPTED_EXT.includes(ext)){
      throw new Error('Unsupported file type: ' + ext);
    }
    if(file.size > 50*1024*1024){
      throw new Error('File too large (max 50MB): ' + file.name);
    }
    const doc = blank(auditId);
    doc.name = file.name;
    doc.mime = file.type || guessMime(ext);
    doc.size = file.size;
    doc.category = category || guessCategory(file.name);
    doc.sourceType = sourceType || 'upload';
    try{
      doc.fileBlob = file.slice(0, file.size, doc.mime); // store as Blob directly in IndexedDB
    }catch(e){
      doc.fileBlob = file;
    }
    await Db.add('documents', doc);
    await AuditTrail.log('Document uploaded', doc.name, null, {category:doc.category, size:doc.size});
    return doc;
  }

  function guessMime(ext){
    const map = {'.pdf':'application/pdf','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png',
      '.txt':'text/plain','.csv':'text/csv','.xls':'application/vnd.ms-excel',
      '.xlsx':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.doc':'application/msword','.docx':'application/vnd.openxmlformats-officedocument.wordprocessingml.document'};
    return map[ext] || 'application/octet-stream';
  }

  function guessCategory(filename){
    const n = filename.toLowerCase();
    if(n.includes('invoice')) return 'Invoice';
    if(n.includes('receipt')) return 'Receipt';
    if(n.includes('bank')) return 'Bank Statement';
    if(n.includes('ledger')) return 'Ledger';
    if(n.includes('voucher')) return 'Voucher';
    if(n.includes('po') || n.includes('purchase_order') || n.includes('purchaseorder')) return 'Purchase Order';
    if(n.includes('payroll') || n.includes('salary')) return 'Payroll';
    if(n.includes('tax')) return 'Tax Document';
    if(n.includes('contract')) return 'Contract';
    if(n.includes('budget')) return 'Budget';
    if(n.includes('payment') || n.includes('pay_')) return 'Payment';
    return 'Other';
  }

  async function update(id, patch){
    const existing = await Db.get('documents', id);
    if(!existing) throw new Error('Document not found');
    const updated = Object.assign({}, existing, patch, {updatedAt:new Date().toISOString()});
    await Db.put('documents', updated);
    return updated;
  }

  async function remove(id){
    const doc = await Db.get('documents', id);
    await Db.remove('documents', id);
    // Remove dependent extracted data & check results
    const extracted = await Db.getByAudit('extractedData', doc ? doc.auditId : null);
    for(const e of extracted){ if(e.documentId === id) await Db.remove('extractedData', e.id); }
    const checks = await Db.getByAudit('checkResults', doc ? doc.auditId : null);
    for(const c of checks){ if(c.documentId === id) await Db.remove('checkResults', c.id); }
    if(doc) await AuditTrail.log('Document deleted', doc.name, doc, null);
    return true;
  }

  function get(id){ return Db.get('documents', id); }
  function listForAudit(auditId){ return Db.getByAudit('documents', auditId); }

  function objectUrlFor(doc){
    if(!doc || !doc.fileBlob) return null;
    try{ return URL.createObjectURL(doc.fileBlob); }catch(e){ return null; }
  }

  return { CATEGORIES, ACCEPTED_EXT, blank, addFromFile, update, remove, get, listForAudit, objectUrlFor, guessCategory };
})();
