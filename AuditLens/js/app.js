/* ==========================================================================
   app.js — Bootstrap: open DB, load settings, seed demo data, wire chrome
   ========================================================================== */
const App = (() => {

  const state = { currentAuditId: null, settings: {} };

  async function loadSettings(){
    let s = await Db.get('settings', 'app');
    if(!s){
      s = { id:'app', appName:'AuditLens', organization:'', auditorName:'Auditor',
        currency:'PKR', dateFormat:'DD-MMM-YYYY', defaultMateriality:5000000,
        defaultPerformanceMateriality:3000000, defaultHighRiskThreshold:1000000,
        aiMode:'local', ocrEnabled:true, lastAuditId:null };
      await Db.put('settings', s);
    }
    state.settings = s;
    return s;
  }

  async function saveLastAudit(){
    state.settings.lastAuditId = state.currentAuditId;
    await Db.put('settings', state.settings);
  }

  async function pickFallbackAudit(){
    const audits = await Audits.list();
    state.currentAuditId = audits.length ? audits[0].id : null;
    await saveLastAudit();
  }

  async function refreshTopbar(){
    const infoEl = document.getElementById('topbarAuditInfo');
    if(state.currentAuditId){
      const a = await Audits.get(state.currentAuditId);
      infoEl.innerHTML = a ? `<strong>${Utils.escapeHtml(a.name)}</strong> · ${Utils.escapeHtml(a.client)}` : `<span class="topbar-audit-label">No audit selected</span>`;
    } else {
      infoEl.innerHTML = `<span class="topbar-audit-label">No audit selected</span>`;
    }
    document.getElementById('topbarUser').textContent = state.settings.auditorName || 'Auditor';
    document.getElementById('appNameLabel').textContent = state.settings.appName || 'AuditLens';
    const pill = document.getElementById('modePill');
    pill.textContent = state.settings.aiMode==='external' ? 'External AI Allowed' : 'Local Only';
    pill.className = 'mode-pill' + (state.settings.aiMode==='external' ? ' ai-on' : '');
  }

  async function refreshAuditList(){
    await refreshTopbar();
    if((location.hash||'').includes('audits')) UI.handleRoute();
  }

  function wireChrome(){
    const hamburger = document.getElementById('hamburgerBtn');
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebarBackdrop');
    hamburger.addEventListener('click', ()=>{
      sidebar.classList.toggle('open');
      backdrop.classList.toggle('show');
    });
    backdrop.addEventListener('click', ()=>{ sidebar.classList.remove('open'); backdrop.classList.remove('show'); });

    const search = document.getElementById('globalSearchInput');
    const results = document.getElementById('globalSearchResults');
    search.addEventListener('input', Utils.debounce(async ()=>{
      const q = search.value.trim();
      if(q.length < 2){ results.hidden = true; return; }
      await runGlobalSearch(q, results);
    }, 250));
    document.addEventListener('click', e=>{
      if(!results.contains(e.target) && e.target !== search) results.hidden = true;
    });
  }

  async function runGlobalSearch(q, host){
    if(!state.currentAuditId){ host.hidden = false; host.innerHTML = '<div class="gsr-empty">Select an audit first.</div>'; return; }
    const term = q.toLowerCase();
    const [docs, excs, findings, queries, wps] = await Promise.all([
      Documents.listForAudit(state.currentAuditId), Exceptions.listForAudit(state.currentAuditId),
      Findings.listForAudit(state.currentAuditId), Queries.listForAudit(state.currentAuditId),
      WorkingPapers.listForAudit(state.currentAuditId)
    ]);
    const dMatch = docs.filter(d=>[d.name,d.party,d.referenceNumber,d.category].join(' ').toLowerCase().includes(term)).slice(0,6);
    const eMatch = excs.filter(e=>(e.title+e.description).toLowerCase().includes(term)).slice(0,5);
    const fMatch = findings.filter(f=>(f.title+f.condition).toLowerCase().includes(term)).slice(0,5);
    const qMatch = queries.filter(q2=>(q2.question+q2.answer).toLowerCase().includes(term)).slice(0,5);
    const wMatch = wps.filter(w=>(w.title+w.reference).toLowerCase().includes(term)).slice(0,5);

    const groups = [
      ['Documents', dMatch, d=>`#/documents/${d.id}`, d=>`${d.name} <small>${d.category}${d.party?' · '+d.party:''}</small>`],
      ['Exceptions', eMatch, ()=>'#/exceptions', e=>`${e.title} <small>${e.risk}</small>`],
      ['Findings', fMatch, ()=>'#/findings', f=>`${f.title}`],
      ['Queries', qMatch, ()=>'#/queries', q2=>`${q2.question}`],
      ['Working Papers', wMatch, ()=>'#/workingpapers', w=>`${w.reference} — ${w.title}`]
    ].filter(([,arr])=>arr.length);

    if(!groups.length){ host.innerHTML = '<div class="gsr-empty">No matches found.</div>'; host.hidden = false; return; }
    host.innerHTML = groups.map(([label, arr, hrefFn, textFn])=>`
      <div class="gsr-group">${label}</div>
      ${arr.map(item=>`<div class="gsr-item" onclick="location.hash='${hrefFn(item)}'; document.getElementById('globalSearchResults').hidden=true;">${textFn(item)}</div>`).join('')}
    `).join('');
    host.hidden = false;
  }

  async function init(){
    try{
      await Db.open();
    }catch(e){
      document.getElementById('mainContent').innerHTML = `<div class="notice-box danger"><strong>AuditLens could not start.</strong> ${Utils.escapeHtml(e.message)}<br>Try a modern browser (Chrome, Edge, Firefox, Safari) with local storage enabled, not in strict private-browsing mode.</div>`;
      return;
    }
    await loadSettings();
    const audits = await Audits.list();
    if(audits.length === 0){
      Utils.toast('Setting up a demo audit so you can explore AuditLens…');
      try{
        const demo = await DemoData.seed();
        state.currentAuditId = demo.id;
      }catch(e){
        console.error('Demo data seed failed', e && e.message);
        Utils.toast('Demo data could not be created: ' + e.message, 'error');
      }
    } else {
      state.currentAuditId = state.settings.lastAuditId && audits.find(a=>a.id===state.settings.lastAuditId)
        ? state.settings.lastAuditId : audits[0].id;
    }
    await saveLastAudit();
    wireChrome();
    await refreshTopbar();
    UI.init();
  }

  window.addEventListener('error', ev=>{
    console.error('Uncaught error:', ev.error || ev.message);
  });
  window.addEventListener('unhandledrejection', ev=>{
    console.error('Unhandled promise rejection:', ev.reason);
  });

  document.addEventListener('DOMContentLoaded', init);

  return {
    get currentAuditId(){ return state.currentAuditId; },
    set currentAuditId(v){ state.currentAuditId = v; },
    get settings(){ return state.settings; },
    set settings(v){ state.settings = v; },
    saveLastAudit, pickFallbackAudit, refreshTopbar, refreshAuditList
  };
})();
