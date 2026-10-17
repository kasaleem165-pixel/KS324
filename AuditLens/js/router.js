/* ==========================================================================
   router.js — Hash router + all page render / interaction handlers (UI)
   Keeping the interactive glue here (rather than spread across many small
   files) means every screen's markup and its onclick handlers stay next to
   each other, which is easier for a non-technical auditor's flows to trace.
   ========================================================================== */
const esc = Utils.escapeHtml;

const UI = (() => {
  const main = () => document.getElementById('mainContent');

  // ---------------- Modal ----------------
  function modal(title, bodyHtml, footerHtml, wide){
    const host = document.getElementById('modalHost');
    host.innerHTML = `
      <div class="modal-box${wide?' wide':''}" role="dialog" aria-modal="true" aria-label="${esc(title)}">
        <div class="modal-header"><h2>${esc(title)}</h2><button class="modal-close" onclick="UI.closeModal()" aria-label="Close">✕</button></div>
        <div class="modal-body">${bodyHtml}</div>
        ${footerHtml ? `<div class="modal-footer">${footerHtml}</div>` : ''}
      </div>`;
    host.hidden = false;
  }
  function closeModal(){ const host = document.getElementById('modalHost'); host.hidden = true; host.innerHTML=''; }
  function confirmAction(message, onConfirmFnName){
    modal('Please Confirm', `<p>${esc(message)}</p>`,
      `<button class="btn" onclick="UI.closeModal()">Cancel</button>
       <button class="btn btn-danger" onclick="${onConfirmFnName}; UI.closeModal();">Confirm</button>`);
  }

  // ---------------- Empty state helper ----------------
  function emptyState(icon, title, sub, actionHtml){
    return `<div class="empty-state"><div class="ico">${icon}</div><h3>${esc(title)}</h3><p>${esc(sub)}</p>${actionHtml||''}</div>`;
  }

  function requireAudit(){
    if(!App.currentAuditId){
      main().innerHTML = `<div class="page-header"><div><h1>No Audit Selected</h1><p class="sub">Create or open an audit to get started.</p></div></div>` +
        emptyState('📁','No audit selected','Create your first audit to begin the AuditLens workflow.',
          `<button class="btn btn-primary" onclick="UI.go('audits')">+ Add New Audit</button>`);
      return false;
    }
    return true;
  }

  // ==========================================================================
  // DASHBOARD
  // ==========================================================================
  async function renderDashboard(){
    if(!requireAudit()) return;
    const audit = await Audits.get(App.currentAuditId);
    const stats = await Audits.stats(audit.id);
    const docs = await Documents.listForAudit(audit.id);
    main().innerHTML = `
      <div class="page-header">
        <div><h1>Audit Overview</h1><p class="sub">${esc(audit.name)}</p></div>
        <div class="page-actions">
          <button class="btn btn-primary" onclick="UI.go('documents')">+ Add Documents</button>
          <button class="btn btn-navy" onclick="UI.runChecksNow()">▶ Run Audit Checks</button>
        </div>
      </div>

      <div class="dash-audit-strip">
        <div class="item"><span>Client</span><strong>${esc(audit.client)}</strong></div>
        <div class="item"><span>Audit Name</span><strong>${esc(audit.name)}</strong></div>
        <div class="item"><span>Audit Period</span><strong>${Utils.fmtDate(audit.periodFrom)} – ${Utils.fmtDate(audit.periodTo)}</strong></div>
        <div class="item"><span>Auditor</span><strong>${esc(audit.leadAuditor||'—')}</strong></div>
        <div class="item"><span>Status</span><span class="status-chip">${esc(audit.status)}</span></div>
      </div>

      <div class="stat-cards">
        ${statCard('DOCUMENTS', stats.totalDocs, 'documents', 'blue')}
        ${statCard('ANALYZED', stats.analyzed, 'documents', 'green')}
        ${statCard('CHECKS PERFORMED', stats.checksPerformed, 'documents', 'navy')}
        ${statCard('EXCEPTIONS', stats.totalExceptions, 'exceptions', 'orange')}
        ${statCard('HIGH RISK', stats.highRisk, 'exceptions', 'red')}
        ${statCard('OPEN FINDINGS', stats.openFindings, 'findings', 'yellow')}
        ${statCard('QUERIES', stats.queries, 'queries', 'blue')}
        ${statCard('PROGRESS', stats.progress + '%', 'reports', 'green')}
      </div>

      <div class="card">
        <div class="panel-title"><h2>Audit Progress</h2><span class="muted">${stats.progress}% complete</span></div>
        <div class="progress-ring-wrap"><div class="progress-bar-track"><div class="progress-bar-fill" style="width:${stats.progress}%"></div></div></div>
      </div>

      <div class="card">
        <h2>Audit Workflow</h2>
        <div class="workflow-strip">
          ${workflowStep(1,'Create Audit', true, 'audits')}
          ${workflowStep(2,'Add Documents', stats.totalDocs>0, 'documents')}
          ${workflowStep(3,'Analyze', stats.analyzed>0, 'documents')}
          ${workflowStep(4,'Run Checks', stats.checksPerformed>0, 'rules')}
          ${workflowStep(5,'Review Exceptions', stats.totalExceptions>0, 'exceptions')}
          ${workflowStep(6,'Ask Questions', stats.queries>0, 'queries')}
          ${workflowStep(7,'Working Papers', stats.workingPapers>0, 'workingpapers')}
          ${workflowStep(8,'Generate Reports', false, 'reports')}
        </div>
      </div>

      <div class="dash-charts">
        <div class="chart-card"><h3>Documents by Category</h3><canvas id="chartByCategory"></canvas></div>
        <div class="chart-card"><h3>Exceptions by Risk</h3><canvas id="chartByRisk"></canvas></div>
        <div class="chart-card"><h3>Checks: Pass / Warning / Exception</h3><canvas id="chartByCheck"></canvas></div>
      </div>

      <div class="card dash-recent-table">
        <div class="panel-title"><h2>Recent Documents</h2><button class="btn btn-sm" onclick="UI.go('documents')">View all</button></div>
        ${docs.length ? recentDocsTable(docs.slice(0,6)) : emptyState('📄','No documents have been added yet.','Upload your first document to begin extraction and analysis.', `<button class="btn btn-primary" onclick="UI.go('documents')">+ Add Documents</button>`)}
      </div>
    `;
    renderDashCharts(docs, audit);
  }

  function statCard(label, value, route, accent){
    return `<div class="stat-card accent-${accent}" onclick="UI.go('${route}')">
      <div class="stat-label">${esc(label)}</div><div class="stat-value">${esc(String(value))}</div></div>`;
  }
  function workflowStep(n, label, done, route){
    return `<div class="workflow-step ${done?'done':''}" onclick="UI.go('${route}')">
      <div class="wf-num">${done?'✓':n}</div><div class="wf-label">${esc(label)}</div></div>`;
  }
  function recentDocsTable(docs){
    return `<div class="table-wrap"><table><thead><tr><th class="no-sort">Document</th><th class="no-sort">Category</th><th class="no-sort">Amount</th><th class="no-sort">Status</th><th class="no-sort">Risk</th></tr></thead><tbody>
      ${docs.map(d=>`<tr style="cursor:pointer" onclick="UI.go('documents/${d.id}')">
        <td>${Utils.fileIcon(d.mime,d.name)} ${esc(d.name)}</td><td>${esc(d.category)}</td>
        <td>${d.amount!=null?Utils.fmtCurrency(d.amount):'—'}</td>
        <td>${Utils.badge(d.analysisStatus, Utils.statusBadgeClass(d.analysisStatus))}</td>
        <td>${Utils.badge(d.risk, Utils.riskBadgeClass(d.risk))}</td></tr>`).join('')}
      </tbody></table></div>`;
  }
  async function renderDashCharts(docs, audit){
    if(typeof Chart === 'undefined') return;
    const byCat = {}; docs.forEach(d=>byCat[d.category]=(byCat[d.category]||0)+1);
    const excs = await Exceptions.listForAudit(audit.id);
    const byRisk = {}; excs.forEach(e=>byRisk[e.risk]=(byRisk[e.risk]||0)+1);
    const checks = await Rules.latestResultsForAudit(audit.id);
    const byResult = {}; checks.forEach(c=>byResult[c.result]=(byResult[c.result]||0)+1);
    const palette = ['#2f6fed','#12805c','#a5460c','#b3261e','#8a6100','#0b2545','#4a86ff','#98a2b3'];
    try{
      new Chart(document.getElementById('chartByCategory'), {type:'doughnut', data:{labels:Object.keys(byCat), datasets:[{data:Object.values(byCat), backgroundColor:palette}]}, options:{plugins:{legend:{position:'bottom', labels:{boxWidth:10,font:{size:10}}}}}});
      new Chart(document.getElementById('chartByRisk'), {type:'bar', data:{labels:Object.keys(byRisk), datasets:[{data:Object.values(byRisk), backgroundColor:'#b3261e'}]}, options:{plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true,ticks:{precision:0}}}}});
      new Chart(document.getElementById('chartByCheck'), {type:'pie', data:{labels:Object.keys(byResult), datasets:[{data:Object.values(byResult), backgroundColor:palette}]}, options:{plugins:{legend:{position:'bottom', labels:{boxWidth:10,font:{size:10}}}}}});
    }catch(e){ console.error('Chart render failed', e && e.message); }
  }

  async function runChecksNow(){
    Utils.toast('Running audit checks…');
    try{
      const {results, exceptionsCreated} = await Rules.runChecks(App.currentAuditId);
      Utils.toast(`${results.length} checks run — ${exceptionsCreated} new exception(s) identified.`, 'success');
      handleRoute();
    }catch(e){
      Utils.toast('Run Checks failed: ' + e.message, 'error');
    }
  }

  // ==========================================================================
  // AUDITS
  // ==========================================================================
  async function renderAudits(){
    const audits = await Audits.list();
    main().innerHTML = `
      <div class="page-header">
        <div><h1>Audits</h1><p class="sub">Create, open, or manage your audit engagements.</p></div>
        <div class="page-actions"><button class="btn btn-primary" onclick="UI.openAuditForm()">+ Add New Audit</button></div>
      </div>
      <div class="card">
        ${audits.length===0 ? emptyState('📁','No audits yet.','Create your first audit to begin.', `<button class="btn btn-primary" onclick="UI.openAuditForm()">+ Add New Audit</button>`) : `
        <div class="table-wrap"><table><thead><tr>
          <th class="no-sort">Name</th><th class="no-sort">Client</th><th class="no-sort">Type</th><th class="no-sort">Period</th><th class="no-sort">Status</th><th class="no-sort">Actions</th>
        </tr></thead><tbody>
          ${audits.map(a=>`<tr>
            <td><strong>${esc(a.name)}</strong>${a.id===App.currentAuditId?' <span class="badge badge-blue">Current</span>':''}</td>
            <td>${esc(a.client)}</td><td>${esc(a.type)}</td>
            <td>${Utils.fmtDate(a.periodFrom)} – ${Utils.fmtDate(a.periodTo)}</td>
            <td>${Utils.badge(a.status, Utils.statusBadgeClass(a.status))}</td>
            <td class="chip-row">
              <button class="btn btn-sm btn-primary" onclick="UI.switchAudit('${a.id}')">Open</button>
              <button class="btn btn-sm" onclick="UI.openAuditForm('${a.id}')">Edit</button>
              <button class="btn btn-sm" onclick="UI.archiveAudit('${a.id}')">Archive</button>
              <button class="btn btn-sm btn-danger" onclick="UI.deleteAudit('${a.id}')">Delete</button>
            </td></tr>`).join('')}
        </tbody></table></div>`}
      </div>`;
  }

  function auditForm(a){
    const types = Audits.TYPES.map(t=>`<option ${a.type===t?'selected':''}>${t}</option>`).join('');
    return `<form id="auditForm">
      <div class="form-grid">
        <div class="form-row"><label>Audit Name *</label><input required name="name" value="${esc(a.name)}"></div>
        <div class="form-row"><label>Client/Organization *</label><input required name="client" value="${esc(a.client)}"></div>
        <div class="form-row"><label>Audit Reference</label><input name="reference" value="${esc(a.reference)}"></div>
        <div class="form-row"><label>Audit Type</label><select name="type">${types}</select></div>
        <div class="form-row"><label>Audit Period From</label><input type="date" name="periodFrom" value="${a.periodFrom||''}"></div>
        <div class="form-row"><label>Audit Period To</label><input type="date" name="periodTo" value="${a.periodTo||''}"></div>
        <div class="form-row"><label>Lead Auditor</label><input name="leadAuditor" value="${esc(a.leadAuditor)}"></div>
        <div class="form-row"><label>Department</label><input name="department" value="${esc(a.department)}"></div>
        <div class="form-row"><label>Currency</label><select name="currency">${['PKR','USD','EUR','GBP','AED','INR','Other'].map(c=>`<option ${a.currency===c?'selected':''}>${c}</option>`).join('')}</select></div>
        <div class="form-row"><label>Materiality</label><input type="number" name="materiality" value="${a.materiality||0}"></div>
        <div class="form-row"><label>Performance Materiality</label><input type="number" name="performanceMateriality" value="${a.performanceMateriality||0}"></div>
        <div class="form-row"><label>High-Risk Threshold</label><input type="number" name="highRiskThreshold" value="${a.highRiskThreshold||0}"></div>
      </div>
      <div class="form-row"><label>Description</label><textarea name="description">${esc(a.description)}</textarea></div>
      <div class="form-row"><label>Notes</label><textarea name="notes">${esc(a.notes)}</textarea></div>
    </form>`;
  }
  async function openAuditForm(id){
    const a = id ? await Audits.get(id) : Audits.blank();
    modal(id?'Edit Audit':'Add New Audit', auditForm(a),
      `<button class="btn" onclick="UI.closeModal()">Cancel</button>
       <button class="btn btn-primary" onclick="UI.saveAuditForm('${id||''}')">Save Audit</button>`, true);
  }
  async function saveAuditForm(id){
    const form = document.getElementById('auditForm');
    if(!form.reportValidity()) return;
    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());
    ['materiality','performanceMateriality','highRiskThreshold'].forEach(k=>data[k]=Number(data[k])||0);
    try{
      if(id){ await Audits.update(id, data); Utils.toast('Audit updated', 'success'); }
      else{ const created = await Audits.create(data); App.currentAuditId = created.id; await App.saveLastAudit(); Utils.toast('Audit created', 'success'); }
      closeModal();
      await App.refreshTopbar();
      renderAudits();
    }catch(e){ Utils.toast('Could not save audit: '+e.message, 'error'); }
  }
  async function switchAudit(id){
    App.currentAuditId = id;
    await App.saveLastAudit();
    await App.refreshTopbar();
    Utils.toast('Switched audit', 'success');
    go('dashboard');
  }
  function archiveAudit(id){ Audits.archive(id).then(()=>{ Utils.toast('Audit archived'); renderAudits(); }); }
  function deleteAudit(id){
    confirmAction('This permanently deletes the audit and ALL related documents, exceptions, findings, working papers and history. This cannot be undone. Continue?',
      `UI.doDeleteAudit('${id}')`);
  }
  async function doDeleteAudit(id){
    await Audits.remove(id);
    if(App.currentAuditId === id){ App.currentAuditId = null; await App.saveLastAudit(); await App.pickFallbackAudit(); }
    await App.refreshTopbar();
    renderAudits();
  }

  // ==========================================================================
  // DOCUMENTS — register (table/card), upload, viewer
  // ==========================================================================
  let docViewMode = 'table';
  let docFilters = {};

  async function renderDocuments(){
    if(!requireAudit()) return;
    const all = await Documents.listForAudit(App.currentAuditId);
    const docs = filterDocs(all, docFilters);
    main().innerHTML = `
      <div class="page-header">
        <div><h1>Documents</h1><p class="sub">Upload, categorize and review every document received for this audit.</p></div>
      </div>

      <div class="upload-dropzone" id="dropzone" tabindex="0" role="button" aria-label="Add documents">
        <div class="ico">⬆️</div>
        <strong>+ ADD DOCUMENTS</strong>
        <small>Click to browse, drag &amp; drop files here, or use SCAN / CAPTURE below. PDF, JPG, PNG, TXT, CSV, XLS(X), DOC(X) — max 50MB each.</small>
        <input type="file" id="fileInput" multiple hidden accept=".pdf,.jpg,.jpeg,.png,.txt,.csv,.xls,.xlsx,.doc,.docx">
      </div>
      <div class="form-actions" style="margin:-10px 0 18px;">
        <button class="btn" onclick="document.getElementById('cameraInput').click()">📷 Scan / Capture Document</button>
        <input type="file" id="cameraInput" accept="image/*" capture="environment" hidden>
        <select id="uploadCategory" class="btn" style="width:auto;">${Documents.CATEGORIES.map(c=>`<option>${c}</option>`).join('')}</select>
        <span class="muted" style="align-self:center;">Category applied to next upload (auto-detected otherwise)</span>
      </div>

      <div class="doc-toolbar">
        <div class="filters">
          <select id="fCategory">${['All Categories'].concat(Documents.CATEGORIES).map(c=>`<option ${docFilters.category===c?'selected':''}>${c}</option>`).join('')}</select>
          <select id="fStatus"><option>All Status</option>${['Not Analyzed','Processing','Analyzed','Review Required','Failed'].map(s=>`<option ${docFilters.status===s?'selected':''}>${s}</option>`).join('')}</select>
          <select id="fRisk"><option>All Risk</option>${Exceptions.RISKS.map(r=>`<option ${docFilters.risk===r?'selected':''}>${r}</option>`).join('')}</select>
          <input type="search" id="fSearch" placeholder="Search name, vendor, reference…" value="${esc(docFilters.q||'')}">
          <button class="btn btn-sm" onclick="UI.clearDocFilters()">Clear</button>
        </div>
        <div class="view-toggle">
          <button class="${docViewMode==='table'?'active':''}" onclick="UI.setDocView('table')">☰ Table</button>
          <button class="${docViewMode==='card'?'active':''}" onclick="UI.setDocView('card')">▦ Cards</button>
        </div>
        <button class="btn btn-sm" onclick="UI.exportDocsExcel()">⬇ Export</button>
      </div>

      <div id="docListArea">${docs.length ? (docViewMode==='table'?docTable(docs):docCards(docs)) : emptyState('📄','No documents match your filters.','Try clearing filters, or add a new document above.')}</div>
    `;
    wireUploadZone();
    document.getElementById('fCategory').onchange = e=>{ docFilters.category = e.target.value==='All Categories'?null:e.target.value; renderDocuments(); };
    document.getElementById('fStatus').onchange = e=>{ docFilters.status = e.target.value==='All Status'?null:e.target.value; renderDocuments(); };
    document.getElementById('fRisk').onchange = e=>{ docFilters.risk = e.target.value==='All Risk'?null:e.target.value; renderDocuments(); };
    document.getElementById('fSearch').oninput = Utils.debounce(e=>{ docFilters.q = e.target.value; renderDocuments(); }, 300);
  }
  function filterDocs(docs, f){
    return docs.filter(d=>{
      if(f.category && d.category!==f.category) return false;
      if(f.status && d.analysisStatus!==f.status) return false;
      if(f.risk && d.risk!==f.risk) return false;
      if(f.q){ const q=f.q.toLowerCase(); if(!(d.name+d.party+d.referenceNumber).toLowerCase().includes(q)) return false; }
      return true;
    });
  }
  function clearDocFilters(){ docFilters = {}; renderDocuments(); }
  function setDocView(v){ docViewMode = v; renderDocuments(); }

  function docTable(docs){
    return `<div class="table-wrap"><table><thead><tr>
      <th class="no-sort">#</th><th class="no-sort">Document</th><th class="no-sort">Category</th><th class="no-sort">Date</th><th class="no-sort">Reference</th>
      <th class="no-sort">Party/Vendor</th><th class="no-sort">Amount</th><th class="no-sort">Uploaded</th><th class="no-sort">Status</th><th class="no-sort">Risk</th><th class="no-sort">Exceptions</th><th class="no-sort">Actions</th>
    </tr></thead><tbody>
      ${docs.map((d,i)=>`<tr>
        <td>${i+1}</td>
        <td style="cursor:pointer" onclick="UI.go('documents/${d.id}')">${Utils.fileIcon(d.mime,d.name)} ${esc(d.name)}</td>
        <td>${esc(d.category)}</td><td>${Utils.fmtDate(d.documentDate)}</td><td>${esc(d.referenceNumber||'—')}</td>
        <td>${esc(d.party||'—')}</td><td>${d.amount!=null?Utils.fmtCurrency(d.amount):'—'}</td>
        <td>${Utils.fmtDate(d.uploadDate)}</td><td>${Utils.badge(d.analysisStatus, Utils.statusBadgeClass(d.analysisStatus))}</td>
        <td>${Utils.badge(d.risk, Utils.riskBadgeClass(d.risk))}</td>
        <td id="excCount_${d.id}">…</td>
        <td class="chip-row">
          <button class="btn btn-sm" onclick="UI.go('documents/${d.id}')">View</button>
          <button class="btn btn-sm btn-danger" onclick="UI.deleteDocument('${d.id}')">Delete</button>
        </td></tr>`).join('')}
    </tbody></table></div>`;
  }
  function docCards(docs){
    return `<div class="doc-card-grid">${docs.map(d=>`
      <div class="doc-card" onclick="UI.go('documents/${d.id}')">
        <div class="doc-thumb">${Utils.fileIcon(d.mime,d.name)}</div>
        <div class="doc-name">${esc(d.name)}</div>
        <div class="doc-meta">${esc(d.category)} · ${d.amount!=null?Utils.fmtCurrency(d.amount):'—'}</div>
        <div class="doc-badges">${Utils.badge(d.analysisStatus, Utils.statusBadgeClass(d.analysisStatus))}${Utils.badge(d.risk, Utils.riskBadgeClass(d.risk))}</div>
      </div>`).join('')}</div>`;
  }
  async function fillExceptionCounts(){
    const excs = await Exceptions.listForAudit(App.currentAuditId);
    document.querySelectorAll('[id^=excCount_]').forEach(el=>{
      const id = el.id.replace('excCount_','');
      const n = excs.filter(e=>e.documentId===id && e.status!=='Closed').length;
      el.textContent = n;
    });
  }

  function wireUploadZone(){
    const zone = document.getElementById('dropzone');
    const input = document.getElementById('fileInput');
    const camera = document.getElementById('cameraInput');
    if(!zone) return;
    zone.onclick = ()=>input.click();
    zone.onkeydown = e=>{ if(e.key==='Enter'||e.key===' '){ input.click(); } };
    input.onchange = ()=>handleFiles(input.files, 'upload');
    camera.onchange = ()=>handleFiles(camera.files, 'camera');
    ['dragenter','dragover'].forEach(ev=>zone.addEventListener(ev, e=>{ e.preventDefault(); zone.classList.add('dragover'); }));
    ['dragleave','drop'].forEach(ev=>zone.addEventListener(ev, e=>{ e.preventDefault(); zone.classList.remove('dragover'); }));
    zone.addEventListener('drop', e=>{ if(e.dataTransfer.files.length) handleFiles(e.dataTransfer.files, 'upload'); });
    fillExceptionCounts();
  }
  async function handleFiles(fileList, sourceType){
    const category = document.getElementById('uploadCategory') ? document.getElementById('uploadCategory').value : null;
    let ok=0, fail=0;
    for(const file of Array.from(fileList)){
      try{
        const doc = await Documents.addFromFile(App.currentAuditId, file, category, sourceType);
        ok++;
        Extraction.runExtraction(doc).then(()=>{ if(location.hash.includes('documents')) renderDocuments(); });
      }catch(e){
        fail++;
        Utils.toast(`Could not add "${file.name}": ${e.message}`, 'error');
      }
    }
    if(ok) Utils.toast(`${ok} document(s) uploaded — extraction running in the background.`, 'success');
    renderDocuments();
  }
  function deleteDocument(id){
    confirmAction('Delete this document and its extracted data / check results permanently?', `UI.doDeleteDocument('${id}')`);
  }
  async function doDeleteDocument(id){ await Documents.remove(id); renderDocuments(); }
  async function exportDocsExcel(){
    const docs = filterDocs(await Documents.listForAudit(App.currentAuditId), docFilters);
    const csv = Utils.toCSV(docs, Reports.CATALOGUE.find(()=>true) && [
      {label:'Name',value:'name'},{label:'Category',value:'category'},{label:'Date',value:d=>Utils.fmtDate(d.documentDate)},
      {label:'Reference',value:'referenceNumber'},{label:'Party',value:'party'},{label:'Amount',value:d=>d.amount||''},
      {label:'Status',value:'analysisStatus'},{label:'Risk',value:'risk'}
    ]);
    Utils.downloadFile('Documents.csv', csv, 'text/csv');
  }

  // ---------------- Document Viewer ----------------
  async function renderDocumentViewer(id){
    if(!requireAudit()) return;
    const doc = await Documents.get(id);
    if(!doc){ main().innerHTML = emptyState('📄','Document not found.','It may have been deleted.'); return; }
    const extractedAll = await Db.getByAudit('extractedData', App.currentAuditId);
    const extracted = extractedAll.find(e=>e.documentId===id) || null;
    const checks = await Rules.resultsForDocument(id, App.currentAuditId);
    const chain = await Analysis.relationshipChain(doc, App.currentAuditId);

    main().innerHTML = `
      <div class="page-header">
        <div><h1>${Utils.fileIcon(doc.mime,doc.name)} ${esc(doc.name)}</h1><p class="sub">${esc(doc.category)}</p></div>
        <div class="page-actions">
          <button class="btn" onclick="UI.go('documents')">← Back to Register</button>
          <button class="btn btn-navy" onclick="UI.reanalyzeDocument('${doc.id}')">↻ Re-run Extraction</button>
        </div>
      </div>
      <div class="doc-viewer">
        <div class="doc-preview-pane">
          <h3>Document Preview</h3>
          <div class="doc-preview-body">${previewMarkup(doc)}</div>
          <div class="form-actions" style="margin-top:10px;">
            <span class="badge badge-gray">${Utils.bytesToSize(doc.size)}</span>
            <span class="badge badge-gray">${esc(doc.sourceType)}</span>
          </div>
        </div>
        <div class="doc-details-pane">
          <div class="card">
            <div class="panel-title"><h3>Document</h3>${Utils.badge(doc.analysisStatus, Utils.statusBadgeClass(doc.analysisStatus))}</div>
            <div class="kv-list">
              <dt>Category</dt><dd>${categorySelectInline(doc)}</dd>
              <dt>Risk</dt><dd>${Utils.badge(doc.risk, Utils.riskBadgeClass(doc.risk))}</dd>
              <dt>Uploaded</dt><dd>${Utils.fmtDateTime(doc.uploadDate)}</dd>
              <dt>Extraction Method</dt><dd>${esc(doc.extractionMethod||'—')}</dd>
              ${doc.extractionError?`<dt>Error</dt><dd class="muted">${esc(doc.extractionError)}</dd>`:''}
            </div>
          </div>

          <div class="card">
            <div class="panel-title"><h3>Extracted Information</h3><span class="muted">Manual correction always allowed</span></div>
            ${extractedFieldsForm(doc, extracted)}
            <div class="form-actions"><button class="btn btn-primary btn-sm" onclick="UI.saveDocFields('${doc.id}')">Save Fields</button></div>
          </div>

          <div class="card">
            <h3>Audit Checks</h3>
            ${checks.length ? checks.map(c=>checkItem(c)).join('') : `<p class="muted">No checks run yet. Use <strong>Audit Rules → Run Checks</strong> or the dashboard button.</p>`}
            <div class="form-actions"><button class="btn btn-sm" onclick="UI.createManualException('${doc.id}')">+ Raise Exception Manually</button></div>
          </div>

          <div class="card">
            <h3>Document Relationships</h3>
            <div class="rel-chain">
              ${chain.map((c,i)=>`${i>0?'<span class="rel-arrow">→</span>':''}<span class="rel-node ${c.doc?'present':'missing'}" ${c.doc?`onclick="UI.go('documents/${c.doc.id}')" style="cursor:pointer"`:''}>${c.label}${c.doc?' ✓':' — missing'}</span>`).join('')}
            </div>
            <p class="muted">Components shown in red have no matching document among those uploaded for this audit.</p>
          </div>

          <div class="card">
            <h3>Auditor Observation</h3>
            <textarea id="obsField">${esc(doc.observation)}</textarea>
            <h3 style="margin-top:14px;">Conclusion</h3>
            <textarea id="concField">${esc(doc.conclusion)}</textarea>
            <div class="form-actions"><button class="btn btn-primary btn-sm" onclick="UI.saveObservation('${doc.id}')">Save Observation &amp; Conclusion</button></div>
          </div>

          ${extracted && extracted.rawText ? `<div class="card"><h3>Raw Extracted Text</h3><pre style="white-space:pre-wrap;font-size:.78rem;max-height:200px;overflow:auto;background:var(--surface-2);padding:10px;border-radius:8px;">${esc(extracted.rawText.slice(0,3000))}</pre></div>` : ''}
        </div>
      </div>
    `;
  }
  function categorySelectInline(doc){
    return `<select onchange="UI.setDocCategory('${doc.id}', this.value)" style="width:auto;display:inline-block;padding:3px 6px;">
      ${Documents.CATEGORIES.map(c=>`<option ${doc.category===c?'selected':''}>${c}</option>`).join('')}</select>`;
  }
  async function setDocCategory(id, category){ await Documents.update(id, {category}); Utils.toast('Category updated','success'); }

  function previewMarkup(doc){
    if(!doc.fileBlob) return `<div class="doc-preview-placeholder">No file content stored.</div>`;
    const url = Documents.objectUrlFor(doc);
    if(!url) return `<div class="doc-preview-placeholder">Preview unavailable for this file.</div>`;
    if((doc.mime||'').startsWith('image/')) return `<img src="${url}" alt="${esc(doc.name)}">`;
    if(doc.mime === 'application/pdf') return `<iframe src="${url}" title="${esc(doc.name)}" style="width:100%;height:70vh;"></iframe>`;
    if(doc.mime === 'text/plain' || doc.mime === 'text/csv') return `<pre id="txtPreview_${doc.id}">Loading…</pre>` + loadTextPreview(doc, url);
    return `<div class="doc-preview-placeholder">Preview not supported for this file type.<br>Use the extracted text panel below, or download the original.</div>`;
  }
  function loadTextPreview(doc, url){
    fetch(url).then(r=>r.text()).then(t=>{ const el=document.getElementById('txtPreview_'+doc.id); if(el) el.textContent = t.slice(0,5000); }).catch(()=>{});
    return '';
  }

  function extractedFieldsForm(doc, extracted){
    const fields = (extracted && extracted.fields) || {};
    const rows = [
      ['documentDate','Document Date', doc.documentDate],
      ['referenceNumber','Reference / Invoice No.', doc.referenceNumber],
      ['party','Vendor / Customer', doc.party],
      ['amount','Amount', doc.amount]
    ];
    return rows.map(([key,label,val])=>{
      const f = fields[key==='referenceNumber'?'invoiceNumber':(key==='party'?'vendor':key)];
      const conf = f ? f.confidence : 'None';
      const status = f ? f.status : (val ? 'Manually set' : 'Not Found');
      return `<div class="extracted-field-row">
        <label>${esc(label)}<br><span class="${Utils.confidenceClass(conf)}">${status} · Confidence: ${conf}</span></label>
        <input data-field="${key}" value="${esc(val==null?'':val)}">
        <span></span>
      </div>`;
    }).join('') + (extracted ? extraFieldsBlock(extracted.fields) : '<p class="muted">No extraction has run yet for this document.</p>');
  }
  function extraFieldsBlock(fields){
    const extras = ['poNumber','taxNumber','bankAccount','tax','total','description','address','voucherNumber'];
    const rows = extras.filter(k=>fields[k] && fields[k].value!=null && fields[k].value!=='').map(k=>{
      const f = fields[k];
      return `<div class="extracted-field-row"><label>${esc(k)}<br><span class="${Utils.confidenceClass(f.confidence)}">Confidence: ${f.confidence}</span></label><div>${esc(String(f.value))}</div><span></span></div>`;
    });
    return rows.length ? `<hr class="divider">${rows.join('')}` : '';
  }
  async function saveDocFields(id){
    const inputs = document.querySelectorAll('#mainContent [data-field]');
    const patch = {};
    inputs.forEach(inp=>{
      const key = inp.dataset.field;
      let value = inp.value.trim();
      if(key==='amount') value = value ? Utils.parseAmount(value) : null;
      patch[key] = value;
    });
    await Documents.update(id, patch);
    await AuditTrail.log('Document fields corrected manually', id, null, patch);
    Utils.toast('Fields saved', 'success');
    renderDocumentViewer(id);
  }
  async function saveObservation(id){
    await Documents.update(id, {observation: document.getElementById('obsField').value, conclusion: document.getElementById('concField').value});
    Utils.toast('Observation saved', 'success');
  }
  async function reanalyzeDocument(id){
    const doc = await Documents.get(id);
    Utils.toast('Re-running extraction…');
    await Extraction.runExtraction(doc);
    renderDocumentViewer(id);
  }
  function checkItem(c){
    const icons = {PASS:'✅', WARNING:'⚠️', EXCEPTION:'⛔', 'REVIEW REQUIRED':'🔎', 'NOT APPLICABLE':'➖'};
    return `<div class="check-item"><span class="check-ico">${icons[c.result]||'•'}</span>
      <div><strong>${esc(c.ruleName)}</strong> — ${Utils.badge(c.result, Utils.statusBadgeClass(c.result))}<br>
      <span class="muted">${esc(c.message)}</span></div></div>`;
  }
  async function createManualException(docId){
    const doc = await Documents.get(docId);
    const audit = await Audits.get(App.currentAuditId);
    modal('Raise Exception Manually', exceptionForm(Object.assign(Exceptions.blank(App.currentAuditId), {documentId:docId, title:'Manual exception — '+doc.name, amount:doc.amount})),
      `<button class="btn" onclick="UI.closeModal()">Cancel</button><button class="btn btn-primary" onclick="UI.saveExceptionForm('')">Create Exception</button>`, true);
  }

  // ==========================================================================
  // ANALYSIS — three-way matching, duplicates, relationships
  // ==========================================================================
  async function renderAnalysis(){
    if(!requireAudit()) return;
    const threeWay = await Analysis.threeWayMatch(App.currentAuditId);
    const dupes = await Analysis.duplicateDetection(App.currentAuditId);
    main().innerHTML = `
      <div class="page-header"><div><h1>Analysis</h1><p class="sub">Three-way matching and duplicate detection across all documents.</p></div></div>

      <div class="card">
        <h2>Three-Way Matching — Purchase Order vs Goods Receipt vs Invoice</h2>
        <p class="muted">Quantity and unit-price line items are not extracted automatically from unstructured documents in this version — verify those manually against the source PO. Amount, vendor and date are compared automatically.</p>
        ${threeWay.length===0 ? emptyState('🔬','No invoices to match yet.','Upload Invoice, Purchase Order and Inventory/Goods-Receipt documents to use this module.') : `
        <div class="table-wrap"><table><thead><tr><th class="no-sort">Invoice</th><th class="no-sort">PO</th><th class="no-sort">Goods Receipt</th><th class="no-sort">Status</th><th class="no-sort">Detail</th></tr></thead><tbody>
          ${threeWay.map(r=>`<tr>
            <td><a href="#/documents/${r.invoice.id}">${esc(r.invoice.name)}</a></td>
            <td>${r.po?`<a href="#/documents/${r.po.id}">${esc(r.po.name)}</a>`:'<span class="muted">Not found</span>'}</td>
            <td>${r.grn?`<a href="#/documents/${r.grn.id}">${esc(r.grn.name)}</a>`:'<span class="muted">Not found</span>'}</td>
            <td>${matchBadge(r.status)}</td>
            <td class="muted" style="font-size:.78rem;">${esc(r.detail.amount)}<br>${esc(r.detail.vendor)}</td>
          </tr>`).join('')}
        </tbody></table></div>`}
      </div>

      <div class="card">
        <h2>Duplicate Detection</h2>
        <p class="muted">Wording below intentionally says "potential duplicate" — the auditor must confirm before treating any item as a confirmed duplicate.</p>
        ${dupes.length===0 ? emptyState('🔁','No potential duplicates found.','Nothing to review right now.') : `
        <div class="table-wrap"><table><thead><tr><th class="no-sort">Type</th><th class="no-sort">Category</th><th class="no-sort">Value</th><th class="no-sort">Documents</th><th class="no-sort">Note</th></tr></thead><tbody>
          ${dupes.map(d=>`<tr><td>${esc(d.type)}</td><td>${esc(d.category)}</td><td>${esc(d.field)}</td>
            <td>${d.documents.map(x=>`<a href="#/documents/${x.id}">${esc(x.name)}</a>`).join(', ')}</td>
            <td class="muted">${esc(d.note)}</td></tr>`).join('')}
        </tbody></table></div>`}
      </div>
    `;
  }
  function matchBadge(status){
    const cls = {MATCHED:'badge-green', 'PARTIAL MATCH':'badge-yellow', MISMATCH:'badge-orange', 'MISSING DOCUMENT':'badge-red'}[status] || 'badge-gray';
    return `<span class="badge ${cls}">${status}</span>`;
  }

  // ==========================================================================
  // RULES — audit check engine + rule builder
  // ==========================================================================
  async function renderRules(){
    if(!requireAudit()) return;
    const rules = await Rules.listForAudit(App.currentAuditId);
    const grouped = {};
    rules.forEach(r=>{ (grouped[r.category]=grouped[r.category]||[]).push(r); });
    main().innerHTML = `
      <div class="page-header">
        <div><h1>Audit Rules</h1><p class="sub">The audit check engine — default rules plus any you create.</p></div>
        <div class="page-actions">
          <button class="btn" onclick="UI.openRuleForm()">+ Create Rule</button>
          <button class="btn btn-navy" onclick="UI.runChecksNow()">▶ Run Checks</button>
        </div>
      </div>
      ${Object.keys(grouped).sort().map(cat=>`
        <div class="card">
          <h2>${esc(cat)} Checks</h2>
          <div class="table-wrap"><table><thead><tr><th class="no-sort">Name</th><th class="no-sort">Description</th><th class="no-sort">Severity</th><th class="no-sort">Enabled</th><th class="no-sort">Actions</th></tr></thead><tbody>
            ${grouped[cat].map(r=>`<tr>
              <td><strong>${esc(r.name)}</strong></td><td class="muted">${esc(r.description)}</td>
              <td>${Utils.badge(r.severity, Utils.riskBadgeClass(r.severity))}</td>
              <td><label class="checkbox-row"><input type="checkbox" ${r.enabled?'checked':''} onchange="UI.toggleRule('${r.id}', this.checked)"> ${r.enabled?'On':'Off'}</label></td>
              <td class="chip-row">
                ${r.custom?`<button class="btn btn-sm" onclick="UI.openRuleForm('${r.id}')">Edit</button>`:''}
                <button class="btn btn-sm" onclick="UI.duplicateRule('${r.id}')">Duplicate</button>
                ${r.custom?`<button class="btn btn-sm btn-danger" onclick="UI.deleteRule('${r.id}')">Delete</button>`:''}
              </td></tr>`).join('')}
          </tbody></table></div>
        </div>`).join('')}
    `;
  }
  function ruleForm(r){
    return `<form id="ruleForm">
      <div class="form-row"><label>Rule Name *</label><input required name="name" value="${esc(r.name||'')}"></div>
      <div class="form-row"><label>Description</label><textarea name="description">${esc(r.description||'')}</textarea></div>
      <div class="form-grid">
        <div class="form-row"><label>Category</label><select name="category">${Rules.CATEGORIES.map(c=>`<option ${r.category===c?'selected':''}>${c}</option>`).join('')}</select></div>
        <div class="form-row"><label>Severity → Result if triggered</label><select name="severity">${Rules.SEVERITIES.map(s=>`<option ${r.severity===s?'selected':''}>${s}</option>`).join('')}</select></div>
      </div>
      <fieldset><legend>Condition</legend>
        <div class="form-grid">
          <div class="form-row"><label>Field</label><select name="field">
            <option value="amount">Amount</option><option value="documentDate">Document Date</option>
            <option value="referenceNumber">Reference Number</option><option value="party">Vendor/Party</option>
            <option value="category">Category</option><option value="extracted.tax">Extracted: Tax</option>
            <option value="extracted.total">Extracted: Total</option>
          </select></div>
          <div class="form-row"><label>Operator</label><select name="operator">
            <option value=">">&gt;</option><option value=">=">&ge;</option><option value="<">&lt;</option><option value="<=">&le;</option>
            <option value="==">= (equals)</option><option value="!=">≠ (not equals)</option>
            <option value="contains">contains</option><option value="isEmpty">is empty / missing</option>
          </select></div>
          <div class="form-row"><label>Value</label><input name="value" placeholder="e.g. 1000000 or a vendor name"></div>
        </div>
        <p class="muted">Example: Field=Amount, Operator=&gt;, Value=1000000 → "High Value Transaction". Documents meeting this condition are marked as the selected severity's Exception result.</p>
      </fieldset>
    </form>`;
  }
  async function openRuleForm(id){
    const existing = id ? await Db.get('rules', id) : null;
    const r = existing || {};
    modal(id?'Edit Rule':'Create Rule', ruleForm(r),
      `<button class="btn" onclick="UI.closeModal()">Cancel</button><button class="btn btn-primary" onclick="UI.saveRuleForm('${id||''}')">Save Rule</button>`, true);
    if(existing && existing.builderCondition){
      const f = document.getElementById('ruleForm');
      f.field.value = existing.builderCondition.field; f.operator.value = existing.builderCondition.operator; f.value.value = existing.builderCondition.value||'';
    }
  }
  async function saveRuleForm(id){
    const form = document.getElementById('ruleForm');
    if(!form.reportValidity()) return;
    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());
    const builderCondition = {field:data.field, operator:data.operator, value:data.value};
    const payload = {name:data.name, description:data.description, category:data.category, severity:data.severity, builderCondition};
    try{
      if(id) await Rules.update(id, payload);
      else await Rules.create(App.currentAuditId, payload);
      closeModal(); Utils.toast('Rule saved', 'success'); renderRules();
    }catch(e){ Utils.toast('Could not save rule: '+e.message, 'error'); }
  }
  function toggleRule(id, enabled){ Rules.toggle(id, enabled).then(()=>Utils.toast(enabled?'Rule enabled':'Rule disabled')); }
  function duplicateRule(id){ Rules.duplicate(id).then(()=>{ Utils.toast('Rule duplicated','success'); renderRules(); }); }
  function deleteRule(id){ confirmAction('Delete this custom rule?', `UI.doDeleteRule('${id}')`); }
  async function doDeleteRule(id){ await Rules.remove(id); renderRules(); }

  // ==========================================================================
  // EXCEPTIONS
  // ==========================================================================
  async function renderExceptions(){
    if(!requireAudit()) return;
    const excs = await Exceptions.listForAudit(App.currentAuditId);
    const docs = await Documents.listForAudit(App.currentAuditId);
    main().innerHTML = `
      <div class="page-header"><div><h1>Exceptions</h1><p class="sub">All potential issues identified for auditor review.</p></div>
        <div class="page-actions"><button class="btn btn-primary" onclick="UI.openExceptionForm()">+ New Exception</button></div></div>
      ${excs.length===0 ? emptyState('✅','No exceptions found.','Run audit checks to identify potential exceptions.', `<button class="btn btn-primary" onclick="UI.go('rules')">Go to Audit Rules</button>`) : `
      <div class="card">
        <div class="table-wrap"><table><thead><tr>
          <th class="no-sort">Title</th><th class="no-sort">Document</th><th class="no-sort">Risk</th><th class="no-sort">Status</th><th class="no-sort">Amount</th><th class="no-sort">Actions</th>
        </tr></thead><tbody>
          ${excs.map(e=>{ const d = docs.find(x=>x.id===e.documentId); return `<tr>
            <td><strong>${esc(e.title)}</strong><br><span class="muted" style="font-size:.76rem;">${esc((e.description||'').slice(0,80))}</span></td>
            <td>${d?`<a href="#/documents/${d.id}">${esc(d.name)}</a>`:'—'}</td>
            <td>${Utils.badge(e.risk, Utils.riskBadgeClass(e.risk))}</td>
            <td>${Utils.badge(e.status, Utils.statusBadgeClass(e.status))}</td>
            <td>${e.amount!=null?Utils.fmtCurrency(e.amount):'—'}</td>
            <td class="chip-row">
              <button class="btn btn-sm" onclick="UI.openExceptionForm('${e.id}')">Open</button>
              <button class="btn btn-sm" onclick="UI.convertToFinding('${e.id}')">→ Finding</button>
              <button class="btn btn-sm btn-danger" onclick="UI.deleteException('${e.id}')">Delete</button>
            </td></tr>`; }).join('')}
        </tbody></table></div>
      </div>`}
    `;
  }
  function exceptionForm(e){
    return `<form id="excForm">
      <div class="form-row"><label>Title *</label><input required name="title" value="${esc(e.title)}"></div>
      <div class="form-row"><label>Description</label><textarea name="description">${esc(e.description)}</textarea></div>
      <div class="form-row"><label>Evidence</label><textarea name="evidence">${esc(e.evidence)}</textarea></div>
      <div class="form-grid">
        <div class="form-row"><label>Amount</label><input type="number" name="amount" value="${e.amount||''}"></div>
        <div class="form-row"><label>Risk</label><select name="risk">${Exceptions.RISKS.map(r=>`<option ${e.risk===r?'selected':''}>${r}</option>`).join('')}</select></div>
        <div class="form-row"><label>Status</label><select name="status">${Exceptions.STATUSES.map(s=>`<option ${e.status===s?'selected':''}>${s}</option>`).join('')}</select></div>
        <div class="form-row"><label>Responsible Person</label><input name="responsiblePerson" value="${esc(e.responsiblePerson)}"></div>
        <div class="form-row"><label>Due Date</label><input type="date" name="dueDate" value="${e.dueDate||''}"></div>
      </div>
      <div class="form-row"><label>Auditor Observation</label><textarea name="auditorObservation">${esc(e.auditorObservation)}</textarea></div>
      <div class="form-row"><label>Impact</label><textarea name="impact">${esc(e.impact)}</textarea></div>
      <div class="form-row"><label>Recommendation</label><textarea name="recommendation">${esc(e.recommendation)}</textarea></div>
      <div class="form-row"><label>Management Response</label><textarea name="managementResponse">${esc(e.managementResponse)}</textarea></div>
      <div class="form-row"><label>Resolution</label><textarea name="resolution">${esc(e.resolution)}</textarea></div>
      <div class="form-row"><label>Conclusion</label><textarea name="conclusion">${esc(e.conclusion)}</textarea></div>
      <input type="hidden" name="documentId" value="${e.documentId||''}">
    </form>`;
  }
  async function openExceptionForm(id){
    const e = id ? await Exceptions.get(id) : Exceptions.blank(App.currentAuditId);
    modal(id?'Exception — '+e.title:'New Exception', exceptionForm(e),
      `<button class="btn" onclick="UI.closeModal()">Cancel</button><button class="btn btn-primary" onclick="UI.saveExceptionForm('${id||''}')">Save</button>`, true);
  }
  async function saveExceptionForm(id){
    const form = document.getElementById('excForm');
    if(!form.reportValidity()) return;
    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());
    data.amount = data.amount ? Number(data.amount) : null;
    try{
      if(id) await Exceptions.update(id, data);
      else await Exceptions.create(App.currentAuditId, data);
      closeModal(); Utils.toast('Exception saved', 'success'); renderExceptions();
    }catch(e){ Utils.toast('Could not save exception: '+e.message, 'error'); }
  }
  function deleteException(id){ confirmAction('Delete this exception?', `UI.doDeleteException('${id}')`); }
  async function doDeleteException(id){ await Exceptions.remove(id); renderExceptions(); }
  async function convertToFinding(id){
    const e = await Exceptions.get(id);
    await Findings.createFromException(e);
    Utils.toast('Finding created from exception', 'success');
    go('findings');
  }

  // ==========================================================================
  // FINDINGS
  // ==========================================================================
  async function renderFindings(){
    if(!requireAudit()) return;
    const findings = await Findings.listForAudit(App.currentAuditId);
    main().innerHTML = `
      <div class="page-header"><div><h1>Findings</h1><p class="sub">Condition · Criteria · Cause · Effect · Recommendation</p></div>
        <div class="page-actions"><button class="btn btn-primary" onclick="UI.openFindingForm()">+ New Finding</button></div></div>
      ${findings.length===0 ? emptyState('📌','No findings yet.','Convert an exception into a finding, or create one directly.', `<button class="btn" onclick="UI.go('exceptions')">Go to Exceptions</button>`) : findings.map(f=>`
      <div class="card">
        <div class="panel-title"><h3>${esc(f.title)}</h3>${Utils.badge(f.status, Utils.statusBadgeClass(f.status))}</div>
        <div class="kv-list">
          <dt>Condition</dt><dd>${esc(f.condition)}</dd>
          <dt>Criteria</dt><dd>${esc(f.criteria)}</dd>
          <dt>Cause</dt><dd>${esc(f.cause)}</dd>
          <dt>Effect</dt><dd>${esc(f.effect)}</dd>
          <dt>Risk</dt><dd>${Utils.badge(f.risk, Utils.riskBadgeClass(f.risk))}</dd>
          <dt>Recommendation</dt><dd>${esc(f.recommendation)}</dd>
          <dt>Management Response</dt><dd>${esc(f.managementResponse||'—')}</dd>
          <dt>Auditor Conclusion</dt><dd>${esc(f.auditorConclusion||'—')}</dd>
        </div>
        <div class="form-actions"><button class="btn btn-sm" onclick="UI.openFindingForm('${f.id}')">Edit</button><button class="btn btn-sm btn-danger" onclick="UI.deleteFinding('${f.id}')">Delete</button></div>
      </div>`).join('')}
    `;
  }
  function findingForm(f){
    return `<form id="findForm">
      <div class="form-row"><label>Title *</label><input required name="title" value="${esc(f.title)}"></div>
      <div class="form-row"><label>Condition — What was found?</label><textarea name="condition">${esc(f.condition)}</textarea></div>
      <div class="form-row"><label>Criteria — What should have happened?</label><textarea name="criteria">${esc(f.criteria)}</textarea></div>
      <div class="form-row"><label>Cause — Why did it happen?</label><textarea name="cause">${esc(f.cause)}</textarea></div>
      <div class="form-row"><label>Effect — What is the impact?</label><textarea name="effect">${esc(f.effect)}</textarea></div>
      <div class="form-row"><label>Risk</label><select name="risk">${Exceptions.RISKS.map(r=>`<option ${f.risk===r?'selected':''}>${r}</option>`).join('')}</select></div>
      <div class="form-row"><label>Recommendation</label><textarea name="recommendation">${esc(f.recommendation)}</textarea></div>
      <div class="form-row"><label>Management Response</label><textarea name="managementResponse">${esc(f.managementResponse)}</textarea></div>
      <div class="form-row"><label>Auditor Conclusion</label><textarea name="auditorConclusion">${esc(f.auditorConclusion)}</textarea></div>
      <div class="form-row"><label>Status</label><select name="status">${Findings.STATUSES.map(s=>`<option ${f.status===s?'selected':''}>${s}</option>`).join('')}</select></div>
    </form>`;
  }
  async function openFindingForm(id){
    const f = id ? await Findings.get(id) : Findings.blank(App.currentAuditId);
    modal(id?'Edit Finding':'New Finding', findingForm(f),
      `<button class="btn" onclick="UI.closeModal()">Cancel</button><button class="btn btn-primary" onclick="UI.saveFindingForm('${id||''}')">Save</button>`, true);
  }
  async function saveFindingForm(id){
    const form = document.getElementById('findForm');
    if(!form.reportValidity()) return;
    const data = Object.fromEntries(new FormData(form).entries());
    if(id) await Findings.update(id, data); else await Findings.create(App.currentAuditId, data);
    closeModal(); Utils.toast('Finding saved', 'success'); renderFindings();
  }
  function deleteFinding(id){ confirmAction('Delete this finding?', `UI.doDeleteFinding('${id}')`); }
  async function doDeleteFinding(id){ await Findings.remove(id); renderFindings(); }

  // ==========================================================================
  // QUERIES — Ask the Audit
  // ==========================================================================
  let lastQueryResult = null, lastQuestion = '';
  async function renderQueries(){
    if(!requireAudit()) return;
    const history = await Queries.listForAudit(App.currentAuditId);
    main().innerHTML = `
      <div class="page-header"><div><h1>Ask the Audit</h1><p class="sub">Query your audit data in plain language. Answers are generated locally from stored, structured data.</p></div></div>
      <div class="card">
        <textarea id="queryBox" placeholder="e.g. Show all invoices above 500,000." style="min-height:70px;font-size:1rem;"></textarea>
        <div class="chip-row" style="margin:8px 0;">${Queries.EXAMPLES.map(q=>`<button class="btn btn-sm btn-ghost" onclick="UI.fillQuery('${q.replace(/'/g,"\\'")}')">${esc(q)}</button>`).join('')}</div>
        <div class="form-actions"><button class="btn btn-primary btn-lg" onclick="UI.runQuery()">🔎 Ask</button></div>
      </div>
      <div id="queryAnswerArea"></div>
      <div class="card">
        <h2>Query History</h2>
        ${history.length===0 ? emptyState('💬','No queries yet.','Ask a question above to get started.') : `
        <div class="table-wrap"><table><thead><tr><th class="no-sort">Date</th><th class="no-sort">Question</th><th class="no-sort">Answer</th><th class="no-sort">Actions</th></tr></thead><tbody>
          ${history.map(q=>`<tr><td>${Utils.fmtDateTime(q.date)}</td><td>${esc(q.question)}</td><td>${esc((q.answer||'').slice(0,90))}</td>
            <td class="chip-row">
              <button class="btn btn-sm" onclick="UI.reopenQuery('${q.id}')">Reopen</button>
              <button class="btn btn-sm" onclick="UI.exportQuery('${q.id}')">Export</button>
              <button class="btn btn-sm btn-danger" onclick="UI.deleteQuery('${q.id}')">Delete</button>
            </td></tr>`).join('')}
        </tbody></table></div>`}
      </div>
    `;
  }
  function fillQuery(q){ document.getElementById('queryBox').value = q; }
  async function runQuery(){
    const q = document.getElementById('queryBox').value.trim();
    if(!q){ Utils.toast('Type a question first', 'warning'); return; }
    lastQuestion = q;
    const result = await AIService.answerQuery(q, App.currentAuditId);
    lastQueryResult = result;
    renderQueryAnswer(q, result);
    await Queries.save(App.currentAuditId, q, result);
  }
  function renderQueryAnswer(q, r){
    document.getElementById('queryAnswerArea').innerHTML = `
      <div class="card">
        <div class="notice-box info"><span class="fact-tag interp">Interpretation</span> Answer generated locally from your audit's stored data — verify before relying on it as audit evidence.</div>
        <h2>Answer</h2><p>${esc(r.answer)}</p>
        <h3>Supporting Evidence</h3>${(r.evidence&&r.evidence.length) ? `<ul>${r.evidence.map(d=>`<li><a href="#/documents/${d.id}">${esc(d.name)}</a> — ${esc(d.category)}${d.amount!=null?' — '+Utils.fmtCurrency(d.amount):''}</li>`).join('')}</ul>` : '<p class="muted">No specific documents returned.</p>'}
        <h3>Related Exceptions</h3>${(r.relatedExceptions&&r.relatedExceptions.length) ? `<ul>${r.relatedExceptions.map(e=>`<li>${esc(e.title)} — ${Utils.badge(e.risk, Utils.riskBadgeClass(e.risk))}</li>`).join('')}</ul>` : '<p class="muted">None.</p>'}
        <h3>Calculation</h3><p class="muted">${esc(r.calculation||'—')}</p>
        <h3>Source</h3><p class="muted">${esc(r.source||'—')}</p>
        <div class="form-actions"><button class="btn btn-sm" onclick="UI.addQueryToWP()">+ Add to Working Paper</button></div>
      </div>`;
  }
  async function reopenQuery(id){
    const rows = await Queries.listForAudit(App.currentAuditId);
    const q = rows.find(r=>r.id===id);
    if(!q) return;
    document.getElementById('queryBox') || await renderQueries();
    document.getElementById('queryBox').value = q.question;
    renderQueryAnswer(q.question, {answer:q.answer, evidence:[], relatedExceptions:[], calculation:'(from saved history)', source:'Query History'});
  }
  function deleteQuery(id){ Queries.remove(id).then(renderQueries); }
  async function exportQuery(id){
    const rows = await Queries.listForAudit(App.currentAuditId);
    const q = rows.find(r=>r.id===id);
    Utils.downloadFile(`Query_${id}.json`, JSON.stringify(q, null, 2), 'application/json');
  }
  async function addQueryToWP(){
    const wps = await WorkingPapers.listForAudit(App.currentAuditId);
    if(!wps.length){ Utils.toast('Create a working paper first', 'warning'); return; }
    modal('Add to Working Paper', `<div class="form-row"><label>Select Working Paper</label><select id="wpSelect">${wps.map(w=>`<option value="${w.id}">${esc(w.reference)} — ${esc(w.title)}</option>`).join('')}</select></div>`,
      `<button class="btn" onclick="UI.closeModal()">Cancel</button><button class="btn btn-primary" onclick="UI.confirmAddQueryToWP()">Add</button>`);
  }
  async function confirmAddQueryToWP(){
    const wpId = document.getElementById('wpSelect').value;
    await WorkingPapers.addQueryAsEvidence(wpId, {date:new Date().toISOString(), question:lastQuestion, answer: lastQueryResult ? lastQueryResult.answer : ''});
    closeModal(); Utils.toast('Added to working paper', 'success');
  }

  // ==========================================================================
  // WORKING PAPERS
  // ==========================================================================
  async function renderWorkingPapers(){
    if(!requireAudit()) return;
    const wps = await WorkingPapers.listForAudit(App.currentAuditId);
    main().innerHTML = `
      <div class="page-header"><div><h1>Working Papers</h1><p class="sub">Document your objective, procedures, testing and conclusion for each audit area.</p></div>
        <div class="page-actions"><button class="btn btn-primary" onclick="UI.openWPForm()">+ New Working Paper</button></div></div>
      ${wps.length===0 ? emptyState('🗂️','No working papers yet.','Create your first working paper to document audit procedures.') : `
      <div class="table-wrap"><table><thead><tr><th class="no-sort">Ref</th><th class="no-sort">Title</th><th class="no-sort">Prepared By</th><th class="no-sort">Review Status</th><th class="no-sort">Actions</th></tr></thead><tbody>
        ${wps.map(w=>`<tr><td>${esc(w.reference)}</td><td>${esc(w.title)}</td><td>${esc(w.preparedBy)}</td>
          <td>${Utils.badge(w.reviewStatus, Utils.statusBadgeClass(w.reviewStatus))}</td>
          <td class="chip-row"><button class="btn btn-sm" onclick="UI.openWPForm('${w.id}')">Open</button><button class="btn btn-sm btn-danger" onclick="UI.deleteWP('${w.id}')">Delete</button></td>
        </tr>`).join('')}
      </tbody></table></div>`}
    `;
  }
  function wpForm(w){
    return `<form id="wpForm">
      <div class="form-grid">
        <div class="form-row"><label>Reference</label><input name="reference" value="${esc(w.reference)}"></div>
        <div class="form-row"><label>Title *</label><input required name="title" value="${esc(w.title)}"></div>
      </div>
      <div class="form-row"><label>Objective</label><textarea name="objective">${esc(w.objective)}</textarea></div>
      <div class="form-row"><label>Scope</label><textarea name="scope">${esc(w.scope)}</textarea></div>
      <div class="form-grid">
        <div class="form-row"><label>Population</label><input name="population" value="${esc(w.population)}"></div>
        <div class="form-row"><label>Sample</label><input name="sample" value="${esc(w.sample)}"></div>
      </div>
      <div class="form-row"><label>Procedure</label><textarea name="procedure">${esc(w.procedure)}</textarea></div>
      <div class="form-row"><label>Evidence</label><textarea name="evidence" style="min-height:120px;">${esc(w.evidence)}</textarea></div>
      <div class="form-row"><label>Testing</label><textarea name="testing">${esc(w.testing)}</textarea></div>
      <div class="form-row"><label>Results</label><textarea name="results">${esc(w.results)}</textarea></div>
      <div class="form-row"><label>Exceptions Note</label><textarea name="exceptionsNote">${esc(w.exceptionsNote)}</textarea></div>
      <div class="form-row"><label>Conclusion</label><textarea name="conclusion">${esc(w.conclusion)}</textarea></div>
      <div class="form-grid">
        <div class="form-row"><label>Prepared By</label><input name="preparedBy" value="${esc(w.preparedBy)}"></div>
        <div class="form-row"><label>Prepared Date</label><input type="date" name="preparedDate" value="${w.preparedDate||''}"></div>
        <div class="form-row"><label>Reviewed By</label><input name="reviewedBy" value="${esc(w.reviewedBy)}"></div>
        <div class="form-row"><label>Review Date</label><input type="date" name="reviewDate" value="${w.reviewDate||''}"></div>
      </div>
      <div class="form-row"><label>Review Status</label><select name="reviewStatus">${WorkingPapers.REVIEW_STATUSES.map(s=>`<option ${w.reviewStatus===s?'selected':''}>${s}</option>`).join('')}</select></div>
      ${w.id ? linkedPanel(w) : ''}
    </form>`;
  }
  function linkedPanel(w){
    return `<fieldset><legend>Linked Items</legend>
      <p class="muted">${w.linkedDocumentIds.length} document(s), ${w.linkedExceptionIds.length} exception(s) linked. Link more from the Documents or Exceptions screens, or via "Add to Working Paper" in Ask the Audit.</p>
    </fieldset>`;
  }
  async function openWPForm(id){
    const w = id ? await WorkingPapers.get(id) : Object.assign(WorkingPapers.blank(App.currentAuditId), {reference: await WorkingPapers.nextReference(App.currentAuditId)});
    modal(id?'Working Paper — '+w.reference:'New Working Paper', wpForm(w),
      `<button class="btn" onclick="UI.closeModal()">Cancel</button><button class="btn btn-primary" onclick="UI.saveWPForm('${id||''}')">Save</button>`, true);
  }
  async function saveWPForm(id){
    const form = document.getElementById('wpForm');
    if(!form.reportValidity()) return;
    const data = Object.fromEntries(new FormData(form).entries());
    if(id) await WorkingPapers.update(id, data); else await WorkingPapers.create(App.currentAuditId, data);
    closeModal(); Utils.toast('Working paper saved', 'success'); renderWorkingPapers();
  }
  function deleteWP(id){ confirmAction('Delete this working paper?', `UI.doDeleteWP('${id}')`); }
  async function doDeleteWP(id){ await WorkingPapers.remove(id); renderWorkingPapers(); }

  // ==========================================================================
  // SAMPLING
  // ==========================================================================
  async function renderSampling(){
    if(!requireAudit()) return;
    const docs = await Documents.listForAudit(App.currentAuditId);
    const categories = [...new Set(docs.map(d=>d.category))];
    main().innerHTML = `
      <div class="page-header"><div><h1>Audit Sampling</h1><p class="sub">Transparent sample selection from your document population.</p></div></div>
      <div class="card">
        <div class="form-grid">
          <div class="form-row"><label>Population</label><select id="sampPop"><option value="all">All Documents (${docs.length})</option>${categories.map(c=>`<option value="${esc(c)}">${esc(c)} (${docs.filter(d=>d.category===c).length})</option>`).join('')}</select></div>
          <div class="form-row"><label>Sampling Method</label><select id="sampMethod">${Sampling.METHODS.map(m=>`<option>${m}</option>`).join('')}</select></div>
          <div class="form-row"><label>Sample Size</label><input type="number" id="sampSize" value="5" min="1"></div>
          <div class="form-row"><label>Risk Level</label><select id="sampRisk"><option>Low</option><option selected>Medium</option><option>High</option></select></div>
        </div>
        <div class="form-actions"><button class="btn btn-primary" onclick="UI.runSamplingNow()">Generate Sample</button></div>
      </div>
      <div id="sampResult"></div>
    `;
  }
  async function runSamplingNow(){
    const audit = await Audits.get(App.currentAuditId);
    const docs = await Documents.listForAudit(App.currentAuditId);
    const popKey = document.getElementById('sampPop').value;
    const population = popKey==='all' ? docs : docs.filter(d=>d.category===popKey);
    const method = document.getElementById('sampMethod').value;
    const sampleSize = Number(document.getElementById('sampSize').value)||1;
    const riskLevel = document.getElementById('sampRisk').value;
    const result = Sampling.runSampling({population, method, sampleSize, riskLevel, materiality:audit.materiality});
    document.getElementById('sampResult').innerHTML = `
      <div class="card">
        <h2>Sample Selected</h2>
        <p><strong>Methodology:</strong> ${esc(result.methodology)}</p>
        <p class="muted">Population: ${result.populationSize} · Sample size: ${result.sampleSize} · Risk level: ${esc(result.riskLevel)}</p>
        ${method==='Manual' ? `<div class="table-wrap"><table><thead><tr><th class="no-sort">Select</th><th class="no-sort">Document</th><th class="no-sort">Amount</th></tr></thead><tbody>
          ${population.map(d=>`<tr><td><input type="checkbox" class="manualSampleItem" value="${d.id}"></td><td>${esc(d.name)}</td><td>${d.amount!=null?Utils.fmtCurrency(d.amount):'—'}</td></tr>`).join('')}
        </tbody></table></div>` :
        `<div class="table-wrap"><table><thead><tr><th class="no-sort">Document</th><th class="no-sort">Category</th><th class="no-sort">Amount</th><th class="no-sort">Date</th></tr></thead><tbody>
          ${result.selected.map(d=>`<tr><td><a href="#/documents/${d.id}">${esc(d.name)}</a></td><td>${esc(d.category)}</td><td>${d.amount!=null?Utils.fmtCurrency(d.amount):'—'}</td><td>${Utils.fmtDate(d.documentDate)}</td></tr>`).join('')}
        </tbody></table></div>`}
      </div>`;
  }

  // ==========================================================================
  // REPORTS
  // ==========================================================================
  let currentReport = null, currentReportKey = null;
  async function renderReports(){
    if(!requireAudit()) return;
    main().innerHTML = `
      <div class="page-header"><div><h1>Report Center</h1><p class="sub">Generate, preview, print and export professional audit reports.</p></div></div>
      <div class="report-grid">
        ${Reports.CATALOGUE.map(r=>`<div class="report-tile" onclick="UI.openReport('${r.key}')">
          <div class="ico">${r.icon}</div><h3>${esc(r.name)}</h3><p>${esc(r.desc)}</p></div>`).join('')}
      </div>
      <div id="reportOutputArea"></div>
    `;
  }
  async function openReport(key){
    const docs = await Documents.listForAudit(App.currentAuditId);
    const vendors = [...new Set(docs.map(d=>d.party).filter(Boolean))];
    document.getElementById('reportOutputArea').innerHTML = `
      <div class="report-filter-bar">
        <div class="form-row"><label>Category</label><select id="rfCategory"><option value="">All</option>${Documents.CATEGORIES.map(c=>`<option>${c}</option>`).join('')}</select></div>
        <div class="form-row"><label>Risk</label><select id="rfRisk"><option value="">All</option>${Exceptions.RISKS.map(r=>`<option>${r}</option>`).join('')}</select></div>
        <div class="form-row"><label>Vendor</label><select id="rfVendor"><option value="">All</option>${vendors.map(v=>`<option>${esc(v)}</option>`).join('')}</select></div>
        <div class="form-row"><label>Date From</label><input type="date" id="rfDateFrom"></div>
        <div class="form-row"><label>Date To</label><input type="date" id="rfDateTo"></div>
        <div class="form-row"><label>Amount Min</label><input type="number" id="rfAmountMin"></div>
        <div class="form-row"><label>Amount Max</label><input type="number" id="rfAmountMax"></div>
        <button class="btn btn-primary" onclick="UI.generateReportNow('${key}')">Generate</button>
      </div>
      <div id="reportRenderArea"></div>
    `;
    generateReportNow(key);
  }
  function collectReportFilters(){
    const val = id => document.getElementById(id) ? document.getElementById(id).value : '';
    return { category:val('rfCategory'), risk:val('rfRisk'), vendor:val('rfVendor'), dateFrom:val('rfDateFrom'), dateTo:val('rfDateTo'), amountMin:val('rfAmountMin'), amountMax:val('rfAmountMax') };
  }
  async function generateReportNow(key){
    const filters = collectReportFilters();
    try{
      const report = await Reports.generate(key, App.currentAuditId, filters);
      currentReport = report; currentReportKey = key;
      await Reports.persistGenerated(App.currentAuditId, key, report.title);
      document.getElementById('reportRenderArea').innerHTML = renderReportHtml(report);
    }catch(e){
      document.getElementById('reportRenderArea').innerHTML = `<div class="notice-box danger">Could not generate report: ${esc(e.message)}</div>`;
    }
  }
  function renderReportHtml(report){
    return `<div class="report-output" id="reportPrintArea">
      <div class="report-output-header">
        <h1>${esc(report.title)}</h1>
        <div class="meta">${report.meta.map(m=>`${esc(m.label)}: <strong>${esc(String(m.value))}</strong>`).join(' &nbsp;·&nbsp; ')}</div>
      </div>
      ${report.sections.map(s=>`<div class="report-section"><h2>${esc(s.heading)}</h2>${s.type==='table'?reportTable(s):s.html}</div>`).join('')}
    </div>
    <div class="form-actions no-print">
      <button class="btn" onclick="window.print()">🖨️ Print</button>
      <button class="btn" onclick="UI.exportCurrentReport('csv')">⬇ Export CSV</button>
      <button class="btn" onclick="UI.exportCurrentReport('json')">⬇ Export JSON</button>
      <button class="btn btn-primary" onclick="UI.saveCurrentReport()">💾 Save Report Record</button>
    </div>`;
  }
  function reportTable(section){
    if(!section.rows.length) return '<p class="muted">No matching records.</p>';
    return `<div class="table-wrap"><table><thead><tr>${section.headers.map(h=>`<th class="no-sort">${esc(h.label)}</th>`).join('')}</tr></thead><tbody>
      ${section.rows.map(row=>`<tr>${section.headers.map(h=>`<td>${esc(String(typeof h.value==='function'?h.value(row):(row[h.value]??'')))}</td>`).join('')}</tr>`).join('')}
    </tbody></table></div>`;
  }
  function exportCurrentReport(fmt){
    if(!currentReport) return;
    const name = currentReport.title.replace(/[^a-z0-9]/gi,'_');
    if(fmt==='csv') Utils.downloadFile(name+'.csv', Reports.toCSV(currentReport), 'text/csv');
    else Utils.downloadFile(name+'.json', Reports.toJSON(currentReport), 'application/json');
  }
  async function saveCurrentReport(){
    if(!currentReportKey) return;
    await Reports.persistGenerated(App.currentAuditId, currentReportKey, currentReport.title);
    Utils.toast('Report record saved to Reports store', 'success');
  }

  // ==========================================================================
  // AUDIT TRAIL
  // ==========================================================================
  async function renderAuditTrail(){
    if(!requireAudit()) return;
    const trail = await AuditTrail.listForAudit(App.currentAuditId);
    main().innerHTML = `
      <div class="page-header"><div><h1>Audit Trail</h1><p class="sub">Immutable-style local log of every recorded action.</p></div></div>
      <div class="card">
        ${trail.length===0 ? emptyState('🕒','No activity recorded yet.','Actions will appear here as you work.') : `
        <div class="table-wrap"><table><thead><tr><th class="no-sort">Date/Time</th><th class="no-sort">Action</th><th class="no-sort">User</th><th class="no-sort">Record</th><th class="no-sort">Previous</th><th class="no-sort">New</th></tr></thead><tbody>
          ${trail.map(t=>`<tr><td>${Utils.fmtDateTime(t.date)}</td><td>${esc(t.action)}</td><td>${esc(t.user)}</td><td>${esc(t.record)}</td>
            <td class="muted" style="max-width:180px;">${esc(t.previousValue)}</td><td class="muted" style="max-width:180px;">${esc(t.newValue)}</td></tr>`).join('')}
        </tbody></table></div>`}
      </div>`;
  }

  // ==========================================================================
  // SETTINGS
  // ==========================================================================
  async function renderSettings(){
    const s = App.settings;
    main().innerHTML = `
      <div class="page-header"><div><h1>Settings</h1><p class="sub">Configure AuditLens for your firm and this workstation.</p></div></div>
      <div class="grid grid-2">
        <div class="card">
          <h2>Organization</h2>
          <div class="form-row"><label>Application Name</label><input id="setAppName" value="${esc(s.appName||'AuditLens')}"></div>
          <div class="form-row"><label>Organization</label><input id="setOrg" value="${esc(s.organization||'')}"></div>
          <div class="form-row"><label>Auditor Name</label><input id="setAuditor" value="${esc(s.auditorName||'')}"></div>
        </div>
        <div class="card">
          <h2>Regional</h2>
          <div class="form-row"><label>Currency</label><select id="setCurrency">${['PKR','USD','EUR','GBP','AED','INR','Other'].map(c=>`<option ${s.currency===c?'selected':''}>${c}</option>`).join('')}</select></div>
          <div class="form-row"><label>Date Format</label><select id="setDateFmt">${['DD-MMM-YYYY','MM/DD/YYYY','DD/MM/YYYY','YYYY-MM-DD'].map(f=>`<option ${s.dateFormat===f?'selected':''}>${f}</option>`).join('')}</select></div>
        </div>
        <div class="card">
          <h2>Default Materiality &amp; Thresholds</h2>
          <div class="form-row"><label>Default Materiality</label><input type="number" id="setMateriality" value="${s.defaultMateriality||0}"></div>
          <div class="form-row"><label>Default Performance Materiality</label><input type="number" id="setPerfMateriality" value="${s.defaultPerformanceMateriality||0}"></div>
          <div class="form-row"><label>Default High-Risk Threshold</label><input type="number" id="setHrt" value="${s.defaultHighRiskThreshold||0}"></div>
        </div>
        <div class="card">
          <h2>Privacy &amp; AI Mode</h2>
          <div class="notice-box">Documents are kept local by default. External AI/OCR is never used without your explicit action.</div>
          <div class="form-row"><label>Processing Mode</label>
            <select id="setAiMode">
              <option value="local" ${s.aiMode!=='external'?'selected':''}>Local Only (recommended)</option>
              <option value="external" ${s.aiMode==='external'?'selected':''}>Allow External AI (not configured — see AIService)</option>
            </select>
          </div>
          <div class="checkbox-row"><input type="checkbox" id="setOcrEnabled" ${s.ocrEnabled!==false?'checked':''}><label for="setOcrEnabled" style="margin:0;">Enable browser OCR (Tesseract.js) for scanned images</label></div>
        </div>
        <div class="card">
          <h2>Backup &amp; Restore (Full Application)</h2>
          <p class="muted">Backs up every audit in this browser's IndexedDB, including documents.</p>
          <div class="form-actions">
            <button class="btn" onclick="UI.backupAll()">⬇ Backup Everything</button>
            <button class="btn" onclick="document.getElementById('restoreInput').click()">⬆ Restore From Backup</button>
            <input type="file" id="restoreInput" accept="application/json" hidden>
          </div>
        </div>
        <div class="card">
          <h2>This Audit — Export / Import</h2>
          <p class="muted">Exports the current audit only, including document files, as one JSON package.</p>
          <div class="form-actions">
            <button class="btn" onclick="UI.exportCurrentAudit()" ${App.currentAuditId?'':'disabled'}>⬇ Export Current Audit</button>
            <button class="btn" onclick="document.getElementById('importInput').click()">⬆ Import Audit</button>
            <input type="file" id="importInput" accept="application/json" hidden>
          </div>
        </div>
      </div>
      <div class="form-actions"><button class="btn btn-primary btn-lg" onclick="UI.saveSettings()">Save Settings</button></div>
    `;
    document.getElementById('restoreInput').onchange = async e=>{
      const file = e.target.files[0]; if(!file) return;
      confirmAction('Restoring will REPLACE all data currently in AuditLens on this browser. Continue?', 'UI.doRestore()');
      window._restoreFile = file;
    };
    document.getElementById('importInput').onchange = async e=>{
      const file = e.target.files[0]; if(!file) return;
      try{ const text = await Utils.readFileAsText(file); const audit = await ExportImport.importAudit(text, {asNew:true}); Utils.toast('Audit imported: '+audit.name, 'success'); await App.refreshAuditList(); }
      catch(err){ Utils.toast('Import failed: '+err.message, 'error'); }
    };
  }
  async function doRestore(){
    try{
      const text = await Utils.readFileAsText(window._restoreFile);
      await ExportImport.restoreAll(text);
      Utils.toast('Restore complete — reloading…', 'success');
      setTimeout(()=>location.reload(), 900);
    }catch(e){ Utils.toast('Restore failed: '+e.message, 'error'); }
  }
  async function saveSettings(){
    const s = {
      id:'app', appName: document.getElementById('setAppName').value || 'AuditLens',
      organization: document.getElementById('setOrg').value, auditorName: document.getElementById('setAuditor').value,
      currency: document.getElementById('setCurrency').value, dateFormat: document.getElementById('setDateFmt').value,
      defaultMateriality: Number(document.getElementById('setMateriality').value)||0,
      defaultPerformanceMateriality: Number(document.getElementById('setPerfMateriality').value)||0,
      defaultHighRiskThreshold: Number(document.getElementById('setHrt').value)||0,
      aiMode: document.getElementById('setAiMode').value,
      ocrEnabled: document.getElementById('setOcrEnabled').checked,
      lastAuditId: App.currentAuditId
    };
    await Db.put('settings', s);
    App.settings = s;
    await App.refreshTopbar();
    Utils.toast('Settings saved', 'success');
  }
  async function exportCurrentAudit(){
    try{ await ExportImport.exportAudit(App.currentAuditId); Utils.toast('Audit exported', 'success'); }
    catch(e){ Utils.toast('Export failed: '+e.message, 'error'); }
  }
  async function backupAll(){ await ExportImport.backupAll(); Utils.toast('Backup downloaded', 'success'); }

  // ==========================================================================
  // ROUTER CORE
  // ==========================================================================
  function go(path){ location.hash = '#/' + path; }
  function parseHash(){
    const h = (location.hash || '#/dashboard').replace(/^#\//,'');
    const [route, id] = h.split('/');
    return {route: route||'dashboard', id};
  }
  async function handleRoute(){
    const {route, id} = parseHash();
    document.querySelectorAll('.nav-list a').forEach(a=>a.classList.toggle('active', a.dataset.route===route));
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebarBackdrop').classList.remove('show');
    document.getElementById('mainContent').focus();
    try{
      switch(route){
        case 'dashboard': return renderDashboard();
        case 'audits': return renderAudits();
        case 'documents': return id ? renderDocumentViewer(id) : renderDocuments();
        case 'analysis': return renderAnalysis();
        case 'rules': return renderRules();
        case 'exceptions': return renderExceptions();
        case 'findings': return renderFindings();
        case 'queries': return renderQueries();
        case 'workingpapers': return renderWorkingPapers();
        case 'sampling': return renderSampling();
        case 'reports': return renderReports();
        case 'audittrail': return renderAuditTrail();
        case 'settings': return renderSettings();
        default: return renderDashboard();
      }
    }catch(e){
      console.error('Render failed for route', route, e);
      main().innerHTML = `<div class="notice-box danger"><strong>Something went wrong loading this page.</strong><br>${esc(e.message)}</div>`;
    }
  }
  function init(){
    window.addEventListener('hashchange', handleRoute);
    handleRoute();
  }

  return {
    init, go, handleRoute, modal, closeModal, confirmAction,
    runChecksNow,
    openAuditForm, saveAuditForm, switchAudit, archiveAudit, deleteAudit, doDeleteAudit,
    clearDocFilters, setDocView, deleteDocument, doDeleteDocument, exportDocsExcel,
    setDocCategory, saveDocFields, saveObservation, reanalyzeDocument, createManualException,
    openRuleForm, saveRuleForm, toggleRule, duplicateRule, deleteRule, doDeleteRule,
    openExceptionForm, saveExceptionForm, deleteException, doDeleteException, convertToFinding,
    openFindingForm, saveFindingForm, deleteFinding, doDeleteFinding,
    fillQuery, runQuery, reopenQuery, deleteQuery, exportQuery, addQueryToWP, confirmAddQueryToWP,
    openWPForm, saveWPForm, deleteWP, doDeleteWP,
    runSamplingNow,
    openReport, generateReportNow, exportCurrentReport, saveCurrentReport,
    saveSettings, exportCurrentAudit, backupAll, doRestore
  };
})();
