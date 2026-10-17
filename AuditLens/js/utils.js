/* ==========================================================================
   utils.js — shared helpers (ids, formatting, escaping, toasts, files)
   No dependencies. Attaches a single global: Utils
   ========================================================================== */
const Utils = (() => {

  function uid(prefix){
    const rnd = Math.random().toString(36).slice(2, 8);
    const t = Date.now().toString(36);
    return (prefix ? prefix + '_' : '') + t + rnd;
  }

  function escapeHtml(str){
    if(str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  const CURRENCY_SYMBOLS = { PKR:'Rs.', USD:'$', EUR:'€', GBP:'£', AED:'AED', INR:'₹' };

  function currencySymbol(code){
    return CURRENCY_SYMBOLS[code] || (code ? code + ' ' : '');
  }

  function fmtCurrency(amount, currencyOverride){
    const settings = (typeof App !== 'undefined' && App.settings) ? App.settings : {};
    const code = currencyOverride || settings.currency || 'PKR';
    const n = Number(amount) || 0;
    const sym = currencySymbol(code);
    return sym + ' ' + n.toLocaleString('en-US', {maximumFractionDigits:2, minimumFractionDigits: (n % 1 !== 0 ? 2 : 0)});
  }

  function fmtNumber(n, decimals){
    const num = Number(n) || 0;
    return num.toLocaleString('en-US', {maximumFractionDigits: decimals != null ? decimals : 2});
  }

  function fmtDate(value, formatOverride){
    if(!value) return '—';
    const d = (value instanceof Date) ? value : new Date(value);
    if(isNaN(d.getTime())) return String(value);
    const settings = (typeof App !== 'undefined' && App.settings) ? App.settings : {};
    const fmt = formatOverride || settings.dateFormat || 'DD-MMM-YYYY';
    const dd = String(d.getDate()).padStart(2,'0');
    const mm = String(d.getMonth()+1).padStart(2,'0');
    const yyyy = d.getFullYear();
    const MMM = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()];
    switch(fmt){
      case 'MM/DD/YYYY': return `${mm}/${dd}/${yyyy}`;
      case 'YYYY-MM-DD': return `${yyyy}-${mm}-${dd}`;
      case 'DD/MM/YYYY': return `${dd}/${mm}/${yyyy}`;
      default: return `${dd}-${MMM}-${yyyy}`;
    }
  }

  function fmtDateTime(value){
    if(!value) return '—';
    const d = new Date(value);
    if(isNaN(d.getTime())) return String(value);
    return fmtDate(d) + ' ' + String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
  }

  function todayISO(){
    return new Date().toISOString().slice(0,10);
  }

  function parseAmount(str){
    if(str === null || str === undefined) return null;
    const cleaned = String(str).replace(/[,\sA-Za-z$₹£€.]*(?=\d)|[,\s]/g,'').replace(/[^\d.\-]/g,'');
    const n = parseFloat(cleaned);
    return isNaN(n) ? null : n;
  }

  function debounce(fn, ms){
    let t;
    return function(...args){
      clearTimeout(t);
      t = setTimeout(()=>fn.apply(this,args), ms || 250);
    };
  }

  function toast(message, type){
    const host = document.getElementById('toastHost');
    if(!host) return;
    const el = document.createElement('div');
    el.className = 'toast' + (type ? (' ' + type) : '');
    el.textContent = message;
    host.appendChild(el);
    setTimeout(()=>{ el.style.opacity='0'; el.style.transition='opacity .25s'; setTimeout(()=>el.remove(), 260); }, 3600);
  }

  function downloadFile(filename, content, mime){
    try{
      const blob = (content instanceof Blob) ? content : new Blob([content], {type: mime || 'text/plain'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(()=>URL.revokeObjectURL(url), 4000);
    }catch(e){
      console.error('downloadFile failed', e && e.message);
      toast('Could not export file: ' + (e && e.message || 'unknown error'), 'error');
    }
  }

  function readFileAsText(file){
    return new Promise((resolve,reject)=>{
      const r = new FileReader();
      r.onload = ()=>resolve(r.result);
      r.onerror = ()=>reject(r.error || new Error('Failed to read file'));
      r.readAsText(file);
    });
  }
  function readFileAsArrayBuffer(file){
    return new Promise((resolve,reject)=>{
      const r = new FileReader();
      r.onload = ()=>resolve(r.result);
      r.onerror = ()=>reject(r.error || new Error('Failed to read file'));
      r.readAsArrayBuffer(file);
    });
  }
  function readFileAsDataURL(file){
    return new Promise((resolve,reject)=>{
      const r = new FileReader();
      r.onload = ()=>resolve(r.result);
      r.onerror = ()=>reject(r.error || new Error('Failed to read file'));
      r.readAsDataURL(file);
    });
  }

  function blobToBase64(blob){
    return new Promise((resolve,reject)=>{
      const r = new FileReader();
      r.onload = ()=>resolve(r.result.split(',')[1] || '');
      r.onerror = ()=>reject(r.error);
      r.readAsDataURL(blob);
    });
  }
  function base64ToBlob(base64, mime){
    const bytes = atob(base64 || '');
    const arr = new Uint8Array(bytes.length);
    for(let i=0;i<bytes.length;i++) arr[i] = bytes.charCodeAt(i);
    return new Blob([arr], {type: mime || 'application/octet-stream'});
  }

  // ---- Badge helpers ----
  function riskBadgeClass(risk){
    switch((risk||'').toLowerCase()){
      case 'critical': return 'badge-red';
      case 'high': return 'badge-orange';
      case 'medium': return 'badge-yellow';
      case 'low': return 'badge-blue';
      case 'informational': return 'badge-gray';
      default: return 'badge-gray';
    }
  }
  function statusBadgeClass(status){
    switch((status||'').toLowerCase()){
      case 'open': return 'badge-red';
      case 'under review': return 'badge-yellow';
      case 'response pending': return 'badge-orange';
      case 'resolved': return 'badge-green';
      case 'closed': return 'badge-gray';
      case 'accepted risk': return 'badge-blue';
      case 'not analyzed': return 'badge-gray';
      case 'analyzed': return 'badge-green';
      case 'review required': return 'badge-yellow';
      case 'processing': return 'badge-blue';
      case 'failed': return 'badge-red';
      case 'pass': return 'badge-green';
      case 'warning': return 'badge-yellow';
      case 'exception': return 'badge-red';
      case 'not applicable': return 'badge-gray';
      case 'draft': return 'badge-gray';
      case 'in progress': return 'badge-yellow';
      case 'planned': return 'badge-blue';
      case 'reviewed': return 'badge-green';
      default: return 'badge-gray';
    }
  }
  function confidenceClass(level){
    return 'confidence-' + (level || 'None');
  }
  function badge(text, cls){
    return `<span class="badge ${cls}">${escapeHtml(text)}</span>`;
  }

  function csvEscape(v){
    const s = (v === null || v === undefined) ? '' : String(v);
    if(/[",\n]/.test(s)) return '"' + s.replace(/"/g,'""') + '"';
    return s;
  }
  function toCSV(rows, headers){
    const lines = [];
    lines.push(headers.map(h=>csvEscape(h.label)).join(','));
    rows.forEach(row=>{
      lines.push(headers.map(h=> csvEscape(typeof h.value === 'function' ? h.value(row) : row[h.value])).join(','));
    });
    return lines.join('\r\n');
  }

  function fileIcon(mime, name){
    const n = (name||'').toLowerCase();
    if((mime||'').includes('pdf') || n.endsWith('.pdf')) return '📕';
    if((mime||'').startsWith('image/')) return '🖼️';
    if(n.endsWith('.csv') || n.endsWith('.xlsx') || n.endsWith('.xls')) return '📊';
    if(n.endsWith('.doc') || n.endsWith('.docx')) return '📝';
    if(n.endsWith('.txt')) return '📃';
    return '📄';
  }

  function bytesToSize(bytes){
    if(!bytes) return '0 KB';
    const units = ['B','KB','MB','GB'];
    let i = 0, n = bytes;
    while(n >= 1024 && i < units.length-1){ n/=1024; i++; }
    return n.toFixed(i===0?0:1) + ' ' + units[i];
  }

  function clamp(n,min,max){ return Math.max(min, Math.min(max, n)); }

  function daysBetween(d1, d2){
    const a = new Date(d1), b = new Date(d2);
    return Math.round((b-a) / 86400000);
  }

  return {
    uid, escapeHtml, fmtCurrency, currencySymbol, fmtNumber, fmtDate, fmtDateTime, todayISO,
    parseAmount, debounce, toast, downloadFile, readFileAsText, readFileAsArrayBuffer, readFileAsDataURL,
    blobToBase64, base64ToBlob, riskBadgeClass, statusBadgeClass, confidenceClass, badge,
    csvEscape, toCSV, fileIcon, bytesToSize, clamp, daysBetween
  };
})();
