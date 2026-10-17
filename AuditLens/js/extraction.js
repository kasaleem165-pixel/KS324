/* ==========================================================================
   extraction.js — Text extraction (PDF.js) + field extraction with confidence
   Images are routed to ocr.js. Extraction NEVER blocks the rest of the app if
   it fails — failures are recorded on the document (analysisStatus:'Failed').
   ========================================================================== */
const Extraction = (() => {

  let pdfjsLoadPromise = null;
  const PDFJS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.5.136/pdf.min.mjs';
  const PDFJS_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.5.136/pdf.worker.min.mjs';

  function loadPdfJs(){
    if(window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
    if(pdfjsLoadPromise) return pdfjsLoadPromise;
    pdfjsLoadPromise = import(PDFJS_URL).then(mod=>{
      mod.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
      window.pdfjsLib = mod;
      return mod;
    }).catch(err=>{
      pdfjsLoadPromise = null;
      throw new Error('Could not load PDF text engine (no network access?). You can still enter fields manually.');
    });
    return pdfjsLoadPromise;
  }

  async function extractPdfText(blob){
    const pdfjsLib = await loadPdfJs();
    const buf = await blob.arrayBuffer();
    const doc = await pdfjsLib.getDocument({data: buf}).promise;
    let text = '';
    const maxPages = Math.min(doc.numPages, 25); // performance guard for very large PDFs
    for(let i=1;i<=maxPages;i++){
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map(it=>it.str).join(' ') + '\n';
    }
    return text.trim();
  }

  // ---------------- Field extraction via regex heuristics ----------------
  // NOTE: the separator before the captured value ([:\-]) is intentionally
  // MANDATORY, not optional. Making it optional would let a bare heading word
  // (e.g. a document titled "INVOICE") satisfy the whole pattern and capture
  // the next label's text instead of a real value. Requiring "Label: value"
  // or "Label- value" keeps matches anchored to an actual labelled field.
  const FIELD_PATTERNS = [
    {field:'documentDate', label:'Document Date', confidence:'Medium',
      re:/(?:invoice date|document date|dated|date|dt)\s*[:\-]\s*(\d{1,2}[\/\-. ](?:\d{1,2}|[A-Za-z]{3,9})[\/\-. ]\d{2,4})/i},
    {field:'invoiceNumber', label:'Invoice Number', confidence:'High',
      re:/invoice(?:\s*(?:no\.?|number|#))?\s*[:\-]\s*([A-Z0-9\-\/]{3,20})/i},
    {field:'voucherNumber', label:'Voucher Number', confidence:'High',
      re:/voucher(?:\s*(?:no\.?|number|#))?\s*[:\-]\s*([A-Z0-9\-\/]{3,20})/i},
    {field:'poNumber', label:'Purchase Order', confidence:'High',
      re:/(?:p\.?o\.?|purchase order)(?:\s*(?:no\.?|number|#))?\s*[:\-]\s*([A-Z0-9\-\/]{3,20})/i},
    {field:'vendor', label:'Vendor/Customer', confidence:'Medium',
      re:/(?:vendor|supplier|bill(?:ed)? to|from)\s*[:\-]\s*([A-Za-z0-9&.,'\- ]{3,60})/i},
    {field:'taxNumber', label:'Tax / NTN Number', confidence:'Medium',
      re:/(?:ntn|tax\s*(?:id|no\.?|number)|gst\s*no\.?)\s*[:\-]\s*([A-Z0-9\-]{5,20})/i},
    {field:'bankAccount', label:'Bank Account', confidence:'Medium',
      re:/(?:account\s*(?:no\.?|number|#)|iban)\s*[:\-]\s*([A-Z0-9\- ]{8,34})/i},
    {field:'reference', label:'Reference', confidence:'Low',
      re:/ref(?:erence)?\.?(?:\s*(?:no\.?|#))?\s*[:\-]\s*([A-Z0-9\-\/]{3,20})/i},
    {field:'address', label:'Address', confidence:'Low',
      re:/address\s*[:\-]\s*([A-Za-z0-9,.\- ]{6,80})/i},
    {field:'amount', label:'Amount', confidence:'Medium',
      re:/(?:amount|sub\s*-?total|net amount)\s*[:\-]\s*(?:rs\.?|pkr|\$|usd)?\s*([\d,]+(?:\.\d{1,2})?)/i},
    {field:'tax', label:'Tax', confidence:'Medium',
      re:/(?:tax|gst|vat)\s*(?:@?\s*\d{1,2}%)?\s*[:\-]\s*(?:rs\.?|pkr|\$)?\s*([\d,]+(?:\.\d{1,2})?)/i},
    {field:'total', label:'Total', confidence:'High',
      re:/(?:grand\s*total|total\s*amount|total)\s*[:\-]\s*(?:rs\.?|pkr|\$|usd)?\s*([\d,]+(?:\.\d{1,2})?)/i},
    {field:'description', label:'Description', confidence:'Low',
      re:/(?:description|particulars|narration)\s*[:\-]\s*([A-Za-z0-9,.\- ]{6,100})/i}
  ];

  function extractFieldsFromText(text){
    const fields = {};
    if(!text || !text.trim()){
      return fields;
    }
    const normalized = text.replace(/\s+/g,' ');
    FIELD_PATTERNS.forEach(p=>{
      const m = normalized.match(p.re);
      if(m && m[1]){
        let value = m[1].trim();
        if(['amount','tax','total'].includes(p.field)){
          const num = Utils.parseAmount(value);
          fields[p.field] = { value: num, raw:value, confidence: num!=null ? p.confidence : 'Low', status: num!=null ? 'Extracted':'Review Required' };
        } else {
          fields[p.field] = { value, confidence:p.confidence, status:'Extracted' };
        }
      } else {
        fields[p.field] = { value:null, confidence:'None', status:'Not Found' };
      }
    });
    return fields;
  }

  // ---------------- Orchestration: run for a document ----------------
  async function runExtraction(doc){
    await Documents.update(doc.id, {analysisStatus:'Processing'});
    try{
      let text = '';
      let method = '';
      if(doc.mime === 'application/pdf' || (doc.name||'').toLowerCase().endsWith('.pdf')){
        text = await extractPdfText(doc.fileBlob);
        method = 'PDF text layer (PDF.js)';
        if(!text || text.length < 15){
          // Likely a scanned PDF with no text layer — fall back to manual/OCR guidance.
          method = 'PDF text layer (empty — likely scanned)';
        }
      } else if((doc.mime||'').startsWith('image/')){
        const result = await OCR.recognize(doc.fileBlob);
        text = result.text;
        method = 'OCR (Tesseract.js), avg confidence ' + result.confidence + '%';
      } else if(doc.mime === 'text/plain' || doc.mime === 'text/csv'){
        text = await Utils.readFileAsText(doc.fileBlob);
        method = 'Plain text read';
      } else {
        method = 'No automatic extraction available for this file type — enter fields manually.';
      }

      const fields = extractFieldsFromText(text);
      const record = {
        id: Utils.uid('ext'), auditId: doc.auditId, documentId: doc.id,
        rawText: text ? text.slice(0, 20000) : '', method, fields,
        extractedAt: new Date().toISOString()
      };
      // one extractedData row per document — replace if exists
      const existingAll = await Db.getByAudit('extractedData', doc.auditId);
      const existing = existingAll.find(e=>e.documentId===doc.id);
      if(existing){ record.id = existing.id; await Db.put('extractedData', record); }
      else { await Db.add('extractedData', record); }

      const hasAnyField = Object.values(fields).some(f=>f.value !== null && f.value !== undefined && f.value !== '');
      const status = text ? (hasAnyField ? 'Analyzed' : 'Review Required') : 'Review Required';

      const patch = {analysisStatus: status, extractionText: text.slice(0,20000), extractionMethod: method, extractionError:''};
      if(fields.documentDate && fields.documentDate.value) patch.documentDate = normalizeDateGuess(fields.documentDate.value) || doc.documentDate;
      if(fields.invoiceNumber && fields.invoiceNumber.value) patch.referenceNumber = fields.invoiceNumber.value;
      else if(fields.voucherNumber && fields.voucherNumber.value) patch.referenceNumber = fields.voucherNumber.value;
      if(fields.vendor && fields.vendor.value) patch.party = fields.vendor.value;
      if(fields.total && fields.total.value != null) patch.amount = fields.total.value;
      else if(fields.amount && fields.amount.value != null) patch.amount = fields.amount.value;
      if(fields.poNumber && fields.poNumber.value) patch.links = Object.assign({}, doc.links, {po: fields.poNumber.value});

      await Documents.update(doc.id, patch);
      await AuditTrail.log('Document analyzed', doc.name, doc.analysisStatus, status);
      return record;
    }catch(err){
      console.error('Extraction failed for document', doc.id, err && err.message);
      await Documents.update(doc.id, {analysisStatus:'Failed', extractionError: (err && err.message) || 'Unknown extraction error'});
      Utils.toast('Extraction failed for "' + doc.name + '": ' + (err && err.message || 'unknown error'), 'error');
      return null;
    }
  }

  function normalizeDateGuess(raw){
    if(!raw) return null;
    const d = new Date(raw.replace(/(\d{1,2})[\/\-. ](\d{1,2}|[A-Za-z]{3,9})[\/\-. ](\d{2,4})/, '$2 $1 $3'));
    if(!isNaN(d.getTime())) return d.toISOString().slice(0,10);
    const d2 = new Date(raw);
    return isNaN(d2.getTime()) ? null : d2.toISOString().slice(0,10);
  }

  return { extractPdfText, extractFieldsFromText, runExtraction, FIELD_PATTERNS };
})();
