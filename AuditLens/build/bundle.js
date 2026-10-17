// Bundles AuditLens's multi-file app into a single self-contained HTML file,
// the same way BRAINS/AnimalSalesPro ship as one .html — inline every local
// <link rel=stylesheet> and local <script src> in place, keep CDN <script>
// tags as external references (network, not filesystem).
const fs = require('fs');
const path = require('path');

const ROOT = process.argv[2];
const OUT = process.argv[3];

let html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

// Inline local stylesheets
html = html.replace(/<link rel="stylesheet" href="(css\/[^"]+)">/g, (m, href) => {
  const css = fs.readFileSync(path.join(ROOT, href), 'utf8');
  return `<style>\n/* ${href} */\n${css}\n</style>`;
});

// Inline local scripts (leave any http(s):// src alone)
html = html.replace(/<script src="((?:js|data)\/[^"]+)"><\/script>/g, (m, src) => {
  const js = fs.readFileSync(path.join(ROOT, src), 'utf8');
  return `<script>\n/* ${src} */\n${js}\n</script>`;
});

fs.writeFileSync(OUT, html);
console.log('Bundled', OUT, '(' + (fs.statSync(OUT).size/1024).toFixed(0) + ' KB)');
