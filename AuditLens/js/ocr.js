/* ==========================================================================
   ocr.js — Browser OCR via Tesseract.js (lazy-loaded), for scanned images.
   Never sends document images anywhere — Tesseract.js runs fully in-browser.
   ========================================================================== */
const OCR = (() => {
  let loadPromise = null;
  const TESSERACT_URL = 'https://cdnjs.cloudflare.com/ajax/libs/tesseract.js/5.1.0/tesseract.min.js';

  function load(){
    if(window.Tesseract) return Promise.resolve(window.Tesseract);
    if(loadPromise) return loadPromise;
    loadPromise = new Promise((resolve,reject)=>{
      const s = document.createElement('script');
      s.src = TESSERACT_URL;
      s.onload = ()=>resolve(window.Tesseract);
      s.onerror = ()=>{ loadPromise=null; reject(new Error('Could not load OCR engine (no network access?). Enter fields manually instead.')); };
      document.head.appendChild(s);
    });
    return loadPromise;
  }

  async function recognize(blob, onProgress){
    const Tesseract = await load();
    const { data } = await Tesseract.recognize(blob, 'eng', {
      logger: m=>{ if(onProgress && m.status==='recognizing text') onProgress(Math.round((m.progress||0)*100)); }
    });
    return { text: data.text || '', confidence: Math.round(data.confidence || 0) };
  }

  return { load, recognize };
})();
