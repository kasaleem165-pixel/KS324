# AuditLens
### Auditor Document Analysis & Working Papers

A standalone, single-page web application for auditors who receive many documents during an
engagement and need to organize, analyze, test and report on them — with **no backend, no
build step, and no server database**. Everything runs in the browser and is stored locally in
IndexedDB (`AuditLensDB`).

Central workflow:

```
CREATE AUDIT → ADD DOCUMENTS → EXTRACT DATA → RUN CHECKS → REVIEW EXCEPTIONS → QUERY → WORKING PAPERS → REPORTS
```

---

## 1. How to run it

AuditLens needs no installation.

1. Copy the `AuditLens/` folder anywhere.
2. **Serve it over HTTP** (recommended) rather than opening `index.html` directly with
   `file://` — some browsers restrict IndexedDB / `fetch()` on blob URLs under `file://`.
   Any static file server works, e.g.:
   ```bash
   cd AuditLens
   python3 -m http.server 8080
   # then open http://localhost:8080 in your browser
   ```
   (Opening `index.html` directly also works in most Chromium-based browsers, but a local
   server is safer and is what real deployment will look like.)
3. On first run, AuditLens automatically creates a **demo audit** with 20 realistic
   documents (invoices, purchase orders, payments, bank statements, receipts, payroll),
   deliberately containing a duplicate invoice, a missing PO, a missing approval, a
   high-value transaction, an arithmetic mismatch, and a document outside the audit
   period — so every screen has real data to explore immediately.
4. Use the sidebar to move through the workflow: Dashboard → Audits → Documents →
   Analysis → Audit Rules → Exceptions → Findings → Ask the Audit → Working Papers →
   Sampling → Reports → Audit Trail → Settings.

No API keys, no accounts, no external services are required. An internet connection is
only used, optionally, to load PDF.js / Tesseract.js / Chart.js from a CDN when you
open a real PDF or scanned image, or view dashboard charts — the application still
works fully offline for text-based documents and every non-chart screen.

---

## 2. File structure

```
AuditLens/
│
├── index.html                 Single HTML shell — layout, sidebar, topbar, modal/toast hosts
│
├── css/
│   ├── styles.css              Design tokens, layout shell, buttons, forms, tables, modals
│   ├── dashboard.css           Dashboard cards, workflow strip, charts
│   ├── documents.css           Upload dropzone, document register, document viewer
│   ├── reports.css             Report Center + print stylesheet
│   └── responsive.css          Mobile breakpoints, collapsible sidebar
│
├── js/
│   ├── utils.js                 Formatting, escaping, toasts, file helpers, badges, CSV
│   ├── database.js              IndexedDB abstraction (AuditLensDB) — generic CRUD per store
│   ├── auditTrail.js            Immutable-style local action log
│   ├── audit.js                 Audit entity CRUD, types, materiality, progress calculation
│   ├── documents.js              Document register CRUD, categories, upload handling
│   ├── extraction.js            PDF.js text extraction + regex field extraction w/ confidence
│   ├── ocr.js                   Tesseract.js browser OCR (lazy-loaded, fully local)
│   ├── rules.js                  Audit check engine: default rules + rule builder + evaluator
│   ├── analysis.js              Three-way matching, duplicate detection, relationship chains
│   ├── exceptions.js            Exception management CRUD
│   ├── findings.js               Audit findings CRUD (condition/criteria/cause/effect/rec.)
│   ├── aiService.js             Provider-agnostic AI adapter (deterministic today)
│   ├── queries.js                "Ask the Audit" NL query engine + query history CRUD
│   ├── workingpapers.js          Working paper CRUD + linking to documents/exceptions
│   ├── sampling.js               Random / systematic / stratified / high-value / manual sampling
│   ├── reports.js                15 report generators + CSV/JSON export helpers
│   ├── export.js                 Full audit export/import + application backup/restore
│   ├── router.js                Hash router + every page's render/interaction logic (UI)
│   └── app.js                   Bootstrap: opens DB, loads settings, seeds demo, wires chrome
│
├── data/
│   └── demo-data.js             Generates the realistic demo audit on first run
│
└── README.md
```

---

## 3. Implemented features

- **Audits**: create / edit / archive / delete, materiality & threshold settings, configurable
  currency, audit types, full progress calculation.
- **Documents**: drag-and-drop or click-to-browse upload (PDF/JPG/PNG/TXT/CSV/XLS(X)/DOC(X)),
  camera capture for scanning, 22 built-in categories + custom, a searchable/filterable
  register in table and card views.
- **Document Viewer**: split preview/detail layout, extracted fields with confidence labels
  and full manual override, live audit-check results, document relationship chain
  (PO → Invoice → Goods Receipt → Payment) with missing links highlighted, auditor
  observation and conclusion fields.
- **Extraction**: PDF.js text-layer extraction, Tesseract.js OCR for images, plain-text/CSV
  reading, regex-based field extraction (date, invoice/voucher/PO number, vendor, address,
  tax ID, bank account, amounts) each tagged **Extracted / Not Found / Review Required**
  with a **High/Medium/Low/None confidence** indicator — never presented as verified fact.
- **Audit Rules Engine**: 27 default rules across Document, Amount, Date, Duplicate, Vendor,
  Compliance and Cross-Document categories, each with ID/description/severity/enable-disable;
  a visual Rule Builder (field/operator/value) to add custom rules; Run Checks evaluates every
  enabled rule against every document and produces PASS / WARNING / EXCEPTION /
  REVIEW REQUIRED / NOT APPLICABLE results, auto-raising Exceptions for EXCEPTION results.
- **Analysis**: three-way matching (PO vs Goods Receipt vs Invoice) with
  MATCHED/PARTIAL MATCH/MISMATCH/MISSING DOCUMENT outcomes, and duplicate detection across
  reference numbers and amount/vendor/date combinations — always phrased as *potential*
  duplicates requiring auditor judgment.
- **Exceptions**: full lifecycle (Open → Under Review → Response Pending → Resolved / Closed /
  Accepted Risk) with risk rating, evidence, impact, recommendation, management response,
  resolution, responsible person and due date; one click converts an exception to a Finding.
- **Findings**: condition / criteria / cause / effect / risk / recommendation / management
  response / auditor conclusion structure.
- **Ask the Audit**: a natural-language query box answering the specification's example
  questions (and similar phrasings) from local structured data, always returning Answer +
  Supporting Evidence + Related Exceptions + Calculation + Source; falls back to a keyword
  search when no specific pattern matches. Every saved query can be reopened, exported, added
  to a working paper, or deleted.
- **AIService adapter** (`js/aiService.js`): a provider-agnostic surface
  (`analyzeDocument`, `summarizeDocument`, `summarizeAudit`, `identifyPotentialIssues`,
  `generateFinding`, `generateReport`, `answerQuery`) implemented **deterministically from
  local data today**. All narrative/AI output is explicitly tagged FACT / INTERPRETATION /
  AI-SUGGESTION and never auto-saved as verified evidence.
- **Working Papers**: reference, objective, scope, population, sample, procedure, evidence,
  testing, results, conclusion, prepared/reviewed by & date, review status, with linked
  documents and exceptions.
- **Sampling**: Random, Systematic, Stratified, High-Value and Manual methods over any
  document category, with a transparent, visible methodology statement.
- **Report Center**: all 15 required reports (Audit Summary, Executive Summary, Document
  Register, Document Analysis, Exception Report, High-Risk Exception Report, Audit Findings,
  Missing Documents, Compliance Checklist, Transaction Testing, Working Papers, Query
  Analysis, Management Letter [draft], Audit Trail, Custom Report), each with filters
  (date/category/risk/status/amount/vendor), Preview, Print (browser print-to-PDF), and
  CSV/JSON export.
- **Audit Trail**: every create/update/delete/analyze/run-checks/query/report action is
  logged with date, user, record, previous and new values.
- **Export / Import / Backup / Restore**: export a single audit (including embedded document
  files, as base64) to one JSON package and re-import it; full-application backup/restore of
  every audit and store in IndexedDB.
- **Settings**: application name, organization, auditor name, currency (PKR/USD/EUR/GBP/AED/
  INR/Other), date format, default materiality/thresholds, Local-Only vs external-AI mode
  toggle, OCR enable/disable, backup controls.
- **Global Search**: documents, exceptions, findings, queries and working papers from the
  top bar.
- **Visual Analytics**: Chart.js donut/bar/pie charts for documents-by-category,
  exceptions-by-risk and checks-by-result (loaded from CDN; the dashboard still works
  fully without it if offline).
- **Demo data**: one realistic demo audit with 20 documents (10 invoices, 3 POs, 2 payments,
  2 bank statements, 2 receipts, 1 payroll) run through the *real* extraction and rules
  pipeline, deliberately containing the required set of exceptions, plus two working papers
  and a finding, so the app is fully explorable on first open.
- **Error handling**: extraction/OCR/PDF failures are caught per document (never crash the
  app), unsupported/oversized files are rejected with a message, unhandled errors and promise
  rejections are logged to the console without exposing document content.
- **Empty states** and **accessible forms** (labels, keyboard-operable dropzone, focus
  outlines, `aria-*` on the router's live regions) throughout.

## 4. Known limitations

- Field extraction uses **regex heuristics**, not a real NLP/vision model — it works well on
  clearly labelled "Label: value" text (as produced by the demo data and most typed
  invoices/vouchers) but will under-extract free-form or heavily stylised documents. This is
  by design flagged with confidence levels and always editable.
- Quantity and unit-price are **not** extracted for three-way matching (no structured line-item
  parser in this version) — only amount, vendor and date are compared automatically; quantity/
  price must still be verified manually against the source PO.
- PDF text extraction only reads the text layer (via PDF.js) — a purely scanned PDF with no
  text layer will need OCR (images) or manual entry; large PDFs are capped at 25 pages for
  performance.
- OCR (Tesseract.js) and PDF.js are loaded from a public CDN on first use; without internet
  access at that moment, the app shows a clear error and lets you enter fields manually
  instead of failing silently.
- IndexedDB storage is per-browser-profile: it is not synced between devices or browsers.
  Use Export Audit / Backup for portability, and note that clearing browser site data will
  remove everything (export/back up regularly).
- The Rule Builder supports single-condition (optionally AND-chained in the underlying data
  model) comparisons on document/extracted fields — it does not yet support OR logic or
  cross-document conditions from the UI (those exist as built-in Cross-Document rules
  instead).
- "PDF export" is via the browser's native print dialog (Print to PDF) rather than an
  embedded PDF-generation library, to avoid adding a heavy dependency; CSV/JSON export is
  always available as a structured alternative.
- Single-user, local-only by default: there is no login, multi-user concurrency, or
  role-based access control in this version.

## 5. Adding a real AI provider later

All AI-shaped functionality already goes through **`js/aiService.js`**, and the natural-
language query parser through **`js/queries.js`**. To connect a real model:

1. In `aiService.js`, replace the body of `PROVIDER.complete(prompt, context)` with an actual
   API call (Claude, OpenAI, Gemini, or a local LLM server) — this is the single seam the
   rest of the app is written against.
2. Gate every external call behind `AIService.isExternalAllowed()` (already wired to the
   Settings → "Allow External AI" toggle) and show the existing "Local Only" warning before
   any document content leaves the browser — do not remove that check.
3. Keep the FACT / INTERPRETATION / AI-SUGGESTION tagging convention (`AIService.TAGS`) for
   anything the provider generates, and keep writing AI text into `*.observation`,
   `*.recommendation` etc. as an editable draft — never as a final, unreviewed value.
4. For `Queries.answer()`, you can either keep the deterministic pattern-matcher as a fast
   path and fall back to the provider for anything it doesn't recognise, or replace the
   fallback `genericSearch()` with a provider call that still returns the same
   `{answer, evidence, relatedExceptions, calculation, source}` shape so `queries.js` and the
   Ask the Audit screen need no changes.
5. For OCR/PDF-to-text quality, a provider's vision/document endpoint can be added as an
   alternative branch inside `extraction.js`'s `runExtraction()`, still populating the same
   `fields` structure with `{value, confidence, status}` per field so nothing downstream
   changes.

## 6. Adding a backend / server database later

The entire persistence layer is isolated in **`js/database.js`** (`Db.*`) with a small,
uniform surface: `add / put / get / getAll / getByAudit / remove / clear / count / bulkPut /
deleteByAudit`, all Promise-based. Every other module calls only `Db.*` — never `indexedDB`
directly. To move to a server database:

1. Re-implement `database.js`'s exported functions against your API (e.g. `fetch()` calls to
   a REST/GraphQL backend) while keeping the exact same function names and Promise-based
   signatures.
2. Replace document `Blob` storage (`documents.fileBlob`) with a file-upload endpoint and
   store a URL/reference instead — `documents.js`'s `objectUrlFor()` is the one place that
   would need to switch from `URL.createObjectURL(blob)` to the served URL.
3. `export.js` / `import` logic can become "sync" logic instead of pure file download/upload,
   or be kept as-is for offline backup even after a backend exists.
4. Add authentication/session handling in `app.js`'s `init()` before `Db.open()` is called,
   and scope every `auditId`-indexed query server-side to the logged-in user/firm.
5. Because every feature module (`audit.js`, `documents.js`, `rules.js`, `exceptions.js`,
   `findings.js`, `queries.js`, `workingpapers.js`, `reports.js`, `auditTrail.js`) only talks
   to `Db.*`, none of them need to change for this migration.

## 7. Important audit principle

AuditLens is an **audit assistance tool, not an autonomous auditor**. It never states
"fraud detected" — instead it uses language such as *"potential anomaly detected — requires
auditor review"*, *"potential duplicate"*, *"exception identified"*, *"supporting evidence not
found"*, and *"review required"*. The auditor always makes the final professional judgment;
AI-generated text is always labelled as a draft requiring review.
