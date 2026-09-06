/* ==========================================================================
   sampling.js — Simple, transparent audit sampling tool
   ========================================================================== */
const Sampling = (() => {

  const METHODS = ['Random','Systematic','Stratified','High Value','Manual'];

  function suggestSampleSize(populationSize, riskLevel, materiality, avgAmount){
    // A simple, transparent heuristic — not a substitute for firm methodology.
    let pct = 0.10;
    if(riskLevel==='High') pct = 0.25;
    else if(riskLevel==='Medium') pct = 0.15;
    else if(riskLevel==='Low') pct = 0.08;
    let n = Math.ceil(populationSize * pct);
    n = Utils.clamp(n, Math.min(5, populationSize), populationSize);
    return n;
  }

  function runSampling({population, method, sampleSize, riskLevel, materiality}){
    const n = Utils.clamp(sampleSize, 1, population.length);
    let selected = [];
    let methodology = '';

    switch(method){
      case 'Random': {
        const pool = [...population];
        for(let i=0;i<n && pool.length;i++){
          const idx = Math.floor(Math.random()*pool.length);
          selected.push(pool.splice(idx,1)[0]);
        }
        methodology = `${n} item(s) selected using a pseudo-random draw from a population of ${population.length}.`;
        break;
      }
      case 'Systematic': {
        const interval = Math.max(1, Math.floor(population.length / n));
        const start = Math.floor(Math.random()*interval);
        for(let i=start; i<population.length && selected.length<n; i+=interval){ selected.push(population[i]); }
        methodology = `Systematic selection with a sampling interval of every ${interval} item(s), starting at a random point (item #${start+1}).`;
        break;
      }
      case 'Stratified': {
        const strata = {};
        population.forEach(d=>{ (strata[d.category]=strata[d.category]||[]).push(d); });
        const keys = Object.keys(strata);
        const perStratum = Math.max(1, Math.floor(n/keys.length));
        keys.forEach(k=>{
          const pool = [...strata[k]];
          for(let i=0;i<perStratum && pool.length;i++){
            const idx = Math.floor(Math.random()*pool.length);
            selected.push(pool.splice(idx,1)[0]);
          }
        });
        methodology = `Population stratified into ${keys.length} categor(ies) (${keys.join(', ')}), approximately ${perStratum} item(s) drawn from each.`;
        break;
      }
      case 'High Value': {
        selected = [...population].filter(d=>d.amount!=null).sort((a,b)=>b.amount-a.amount).slice(0,n);
        methodology = `Top ${selected.length} item(s) by transaction amount selected (highest-value / key item testing).`;
        break;
      }
      case 'Manual':
      default: {
        selected = [];
        methodology = 'Manual selection — the auditor selects specific items directly from the population list.';
        break;
      }
    }

    return {
      populationSize: population.length, sampleSize: selected.length, method, methodology,
      riskLevel, materiality, selected
    };
  }

  return { METHODS, suggestSampleSize, runSampling };
})();
