# Animal Sales Pro — CLAUDE.md

## Project Overview
Standalone single-file HTML app (`animal_sales/AnimalSales.html`) for managing animal sales, collections, customers, and budgeting. All data stored in `localStorage` key `AnimalSalesDB`. No backend, no build step.

## Git — Animal Sales Pro
- **Feature branch**: `claude/animal-sales-receipts-pofPs`
- **Always push to both**: `git push origin claude/animal-sales-receipts-pofPs` AND `git push origin claude/animal-sales-receipts-pofPs:main --force`

## Git — BRAINS (index.html)
- **Feature branch**: `claude/optimistic-mccarthy-NPnuj`
- **Always push to both** (feature branch first, then force-update main):
  ```
  git push origin claude/optimistic-mccarthy-NPnuj
  git push origin claude/optimistic-mccarthy-NPnuj:main --force
  ```
- **Why `--force` on main**: Multiple sessions push to `main`; it can diverge from the feature branch. The feature branch is always the canonical source of truth, so `--force` is correct and expected here. Never do a plain push to `main` — it will fail with "non-fast-forward".

---

# BRAINS — Complete Project Reference

## What is BRAINS
**Branch Risk Audit Investigation & Supervision** — a single-file HTML audit management system for Beaconhouse Group, Systems & Audit department. Developed by Kamran Saleem, Senior Manager Systems & Audit. Version: v02/2026. Build: 27-Aug-2026.

## Project Goal
Go fully live/online for all auditors, supervisors, and administrator. Auditors use the Beaconhouse intranet. The system uses GitHub for session storage and Google Drive for annexure files.

## Two-Version Strategy (CRITICAL — read every session)

| | LIVE | DEV |
|---|---|---|
| File | `old/index.html` | `index.html` |
| Badge | 🟢 LIVE (green) | 🟡 DEV (amber) |
| Hosted on | Beaconhouse intranet (`beams.beaconhouse.edu.pk`) | GitHub Pages |
| URL | Intranet URL — internal only | `https://kasaleem165-pixel.github.io/KS324/` |
| Users | All auditors & supervisors (production) | Kamran only (testing) |
| Update method | Download `old/index.html` from GitHub → upload to intranet server | Auto on push — just refresh browser |
| Changes allowed | **Bug fixes only** | All new features + improvements |

### Amendment Rule (NEVER violate)
- **Bug** (something broken for auditors NOW) → fix in **BOTH** files
- **New feature / improvement** → fix in `index.html` (DEV) **ONLY**
- **When DEV is ready for release** → copy `index.html` → `old/index.html` → Kamran uploads to intranet

## Infrastructure & Services

### 1. GitHub — App Files
- **Repo**: `kasaleem165-pixel/KS324`
- **GitHub Pages**: `https://kasaleem165-pixel.github.io/KS324/` — serves `index.html` (DEV) online, auto-updates on push
- **App files**: `index.html` (DEV), `old/index.html` (LIVE)

### 2. GitHub — Session Storage
- **Repo**: `kasaleem165-pixel/brains-sessions` (private)
- **Purpose**: Stores all audit session JSON files for cloud sync
- **Session path format**: `sessions/{auditor-name}/{BRCODE_BranchName}.json`
  - Example: `sessions/khurram-saleem/BR001_Main-Branch.json`
- **User list**: `sessions/_system/users.json`
- **PAT**: Stored securely by Kamran — never store in this file (GitHub blocks as secret)
- **PAT type**: Fine-grained personal access token
- **PAT permissions**: `brains-sessions` repo only, Contents → Read and write
- **PAT expiry**: 1 year from creation — Kamran must regenerate when expired

### 3. Google Drive — Annexure Files
- **Purpose**: Stores annexure files attached by auditors during audit
- **Folder structure**: `BRAINS-Annexures` → `Photos` / `Scanned-Documents` / `Schedules`
- **Google Cloud Client ID**: `22287998975-hb9nqe71q43jtv7j0g0ctkiksomdv84j.apps.googleusercontent.com`
- **Status**: ✅ Working — folders being created correctly, verified by Kamran
- **Requirement**: HTTPS only — works on intranet and GitHub Pages, NOT on local `file://`
- **Fallback**: Auditor can paste a Google Drive link manually if auto-upload fails

### 4. Beaconhouse Intranet
- **URL**: `beams.beaconhouse.edu.pk` (example — actual URL known to Kamran)
- **Hosts**: `old/index.html` — the LIVE production version
- **Users**: All auditors and supervisors access BRAINS from here
- **Update process**: Kamran downloads `old/index.html` from GitHub → uploads to intranet server → all users get it on next browser refresh (no action needed from auditors)

## How Everything Connects
```
AUDITOR (on intranet):
  Opens beams.beaconhouse.edu.pk → old/index.html (LIVE 🟢)
  → logs in with username + password
  → works on audit report
  → session auto-saves every few minutes → brains-sessions repo (GitHub)
  → attaches annexures → uploaded to Google Drive (BRAINS-Annexures)
  → sends report for review → notification goes to supervisor's dashboard

SUPERVISOR (on intranet):
  Opens same intranet URL → old/index.html (LIVE 🟢)
  → logs in → Supervisor Dashboard opens automatically
  → sees pending reviews from auditors in their region
  → reviews report → records decision + comments
  → auditor gets notification + can load response

KAMRAN (Admin — testing on GitHub Pages):
  Opens kasaleem165-pixel.github.io/KS324/ → index.html (DEV 🟡)
  → logs in with admin password (username blank) → Admin Panel opens automatically
  → manages users, cloud settings, setup links
  → tests new features before releasing to intranet
```

## User Roles & Login
- **One URL for everyone** — role is determined by credentials alone, not URL
- **Administrator** (Kamran): username blank + admin password → Admin Panel opens automatically (DEV only)
- **RO Supervisor**: username + personal password → Supervisor Dashboard opens automatically
- **HO Supervisor**: username + personal password → Supervisor Dashboard opens automatically
- **Auditor**: username + personal password → Audit screen opens
- **Viewer**: read-only access, no edit/submit buttons
- **Named users**: managed in Admin Panel → Users tab, stored in `brains-sessions/sessions/_system/users.json`
- **Shared/legacy passwords** (username left blank): Auditor `S&A-BA2026` · RO Sup `RO@S&A2026` · HO Sup `HOSuper@2026` · Viewer `Br@insTest#2026`
- **`?mode=admin` / `?mode=supervisor`**: still work as cosmetic hints but no longer required

## Cloud Sync — Daily Workflow
```
Each auditor (one-time setup per computer):
  Cloud → Cloud Settings → enter GitHub Owner, Repo, Token, Name → Test → Save

Daily use:
  Open BRAINS → Cloud → Browse Cloud Sessions → Load last session
  Work on audit
  Cloud → Save to Cloud (regularly, like saving a Word doc)
  Before closing browser → Save to Cloud one final time
```

## Admin Panel — Cloud Settings Fields
| Field | Value |
|---|---|
| GitHub Owner | `kasaleem165-pixel` |
| Repository | `brains-sessions` |
| Access Token | PAT (Kamran shares via trusted channel) |
| Your Name | Auditor's own name (e.g. Khurram Saleem) |
| Google Drive Client ID | `22287998975-hb9nqe71q43jtv7j0g0ctkiksomdv84j.apps.googleusercontent.com` |

## Features — Verified Status (Oct 2026)

### ✅ Working in LIVE (intranet — old/index.html)
- Audit report creation (observations, evidence, custom observations, draft editing)
- Annexures with Google Drive upload — folders creating correctly ✅ verified
- Cloud sync — session save/load from GitHub ✅ verified
- Co-work status & cross-auditor alerts ✅ verified
- Supervisor review workflow (send → notify → review → respond)
- RO/HO response file (export + direct open)
- Collapsible observation summary index at top of reports
- Obs ↔ Annexure two-way clickable navigation
- Sortable tables across all report views
- Offline/local mode (localStorage fallback)
- Import/Export session files (.json)
- Print / PDF from browser

### ✅ Working in DEV only (GitHub Pages — index.html)
- Admin Panel with 4 tabs ✅ tested by Kamran
- User Management — add/edit/delete named users ✅ tested (2 auditors + 1 supervisor created)
- Single-URL role-based login (no ?mode= needed) ✅ tested
- Setup Links tab — one-click URL to auto-configure auditor Cloud Settings
- System tab — version info, change admin password
- LIVE/DEV version badges on login screen and footer

### ⏳ Pending
- Full supervisor review cycle end-to-end test on live intranet
- Release DEV features to LIVE (when Kamran approves DEV is ready)

## Admin Panel Tabs (DEV — index.html only)
1. **Users** — Add/Edit/Delete auditors and supervisors (role, region, password)
2. **Cloud Setup** — GitHub token, owner, repo name, Google Drive Client ID
3. **Setup Links** — Generate one-click URL that auto-fills Cloud Settings on any computer
4. **System** — BRAINS version info, change administrator password

## Setup Link Flow (for new auditors)
1. Admin opens Admin Panel → Setup Links → Generate → Copy URL
2. Admin sends URL to auditor via WhatsApp or email (URL contains GitHub token — share privately)
3. Auditor opens BRAINS, pastes URL in address bar, presses Enter
4. BRAINS shows "Cloud Settings configured automatically!" → auditor logs in normally
5. Cloud sync ready — no manual setup needed

## ES5-Only Rule (CRITICAL — all code changes)
- **No arrow functions** (`=>`) — use `function(){}` instead
- **No `const`/`let`** — use `var` only
- **No template literals** (backticks) — use `'string'+'concat'` instead
- **No destructuring, spread operators, classes** — plain ES5 only
- **Validate after every change** (both files if bug fix)

## Syntax Validation Commands
```bash
# DEV (index.html)
sed -n '/<script>/,/<\/script>/p' /home/user/KS324/index.html | grep -v "<script>\|<\/script>" > /tmp/e.js && node --check /tmp/e.js && echo OK

# LIVE (old/index.html)
sed -n '/<script>/,/<\/script>/p' /home/user/KS324/old/index.html | grep -v "<script>\|<\/script>" > /tmp/e2.js && node --check /tmp/e2.js && echo OK
```

## Key Technical Functions
| Function | Purpose |
|---|---|
| `_csGetCfg()` | Returns Cloud Settings config object from localStorage |
| `_CS_CFG_KEY` | localStorage key for cloud settings |
| `_csB64Dec()` | Base64 decode for GitHub API responses |
| `showAdminPanel()` | Opens the 4-tab Admin Panel overlay (DEV only) |
| `_supShowDashboard()` | Opens Supervisor Dashboard |
| `_pwGrantAccess(userObj)` | Called after successful login — routes to correct panel by role |
| `saveDraftResponses()` | Generates RO/HO response HTML file |
| `buildAnnexHtml()` | Builds annexure section with back-links to observations |
| `obsHtml(o, num, anchorId)` | Renders one observation with optional anchor ID |
| `_gdIsConfigured()` | Returns true if Google Drive Client ID is set |
| `_gdGetToken(cb)` | Gets Google OAuth token for Drive upload |
| `_startRestore()` | Called after login — restores last session from localStorage/cloud |

## Troubleshooting Reference
| Problem | Solution |
|---|---|
| Cloud button stays grey after saving settings | Click Test Connection — check token and repo name for typos |
| "403 Forbidden" on Save | PAT may have expired — Kamran regenerates and reshares |
| "404 Not Found" on Browse | Repo name or owner incorrect in Cloud Settings |
| Google Drive upload fails | Check HTTPS (not file://), check Client ID in Cloud Settings |
| Admin Panel not opening after login | Ensure using DEV version (index.html), hard-refresh with Ctrl+Shift+R |
| Supervisor sees no pending reviews | Auditor must have clicked "Send to RO Supervisor" first |

## What To Do At Start of Every Session
1. This CLAUDE.md is read automatically — no need to ask Kamran for context
2. Confirm which file is being worked on (LIVE = `old/index.html` / DEV = `index.html`)
3. Apply amendment rule strictly — new features in DEV only
4. After any code change — run syntax validation on the changed file(s)
5. Always push to both feature branch AND main with `--force`

## Database Structure
```javascript
DB = {
  animals:  [],   // {code, purchase_date, description, age_type, weight_final, admin_charges(=0), photos[], status, assigned_customer}
  customers:[],   // {id, name, phone, address, admin_charges(=0)}
  sales:    [],   // {receipt_no, animal_code, customer_id, sale_date, weight_at_sale, rate_per_kg, admin_charges(=0), carriage_charges, amount, is_lumpsum, location, notes}
  payments: [],   // {receipt_no, customer_id, pay_date, type, bank_name, sender_name, place, amount, discount, notes}
  banks:    [],   // {id, name, account_title, account_no}
  budget:   [],   // {id, date, animal_code, animal_age, animal_weight, customer_id, is_lumpsum, weight_at_entry, rate_per_kg, admin_charges, carriage_charges, amount, notes}
  settings: {}    // {rate_per_kg, admin_charges(=0), num_persons, locationList[], _migrationFlags...}
}
```

## Key Financial Rules
- **Sale Amount formula**: `amount = (weight × rate) + carriage + admin`  (or `lumpAmt + carriage + admin` for lump sum)
- **Sale Price (sp)** derived back from amount: `is_lumpsum ? (amount - carriage - admin) : weight × rate`
- **Admin charges are currently zero** everywhere (migration `_adminZero2026` zeroed all records and defaults)
- **Balance**: `amount - payments_received - discount`

## Amount / Sale Price pattern used throughout
```javascript
const sp = s.is_lumpsum
  ? (s.amount - (s.carriage_charges||0) - (s.admin_charges||0))
  : s.weight_at_sale * s.rate_per_kg;
```

## Navigation & Pages
- `show(p)` navigates pages, saves `_prevPage` for `goBack()`
- Pages: `dashboard`, `animals`, `customers`, `sale`, `reports`, `budgeting`, `settings`
- Nav bar: Dashboard · Animals · Customers · Budgeting · Reports · Settings
- Dashboard quick-actions (in order): Add Animal · Add Customer · New Sale · Record Collection · Budgeting · Reports

## Key Functions

### Rendering
| Function | What it renders |
|---|---|
| `renderDashboard()` | Summary stats + recent sales table |
| `renderAnimals()` | Animals list (available stock / all / sold view) |
| `renderCustomers()` | All customers with Animals count, Carriage, Admin, Total Sales, Received, Discount, Balance |
| `renderSales()` | All Sales report (Reports tab) |
| `renderSaleLedger()` | Sale Ledger grouped by customer with 17-column table |
| `renderPayments()` | Sales Collection with per-customer summary |
| `renderInlineLedger()` | Customer Ledger (sortable sales + payments) |
| `renderBudgeting()` | Budget entry form + Budget Records + Cost Estimation |
| `renderBudgetRecords()` | Budget records table with Sale Price/Carriage/Admin/Total summary |
| `renderLocationReport()` | Location Report |
| `renderWacchaReport()` | Sale Price Report |
| `renderBankwiseReport()` | Bank-wise Collection |
| `renderSenderwiseReport()` | Sender-wise Collection |

### Sale Entry / Edit
| Function | Purpose |
|---|---|
| `recordSale()` | Save new sale from New Sale page |
| `submitSaleForm()` | Dispatcher: calls `saveSalePageEdit` or `recordSale` |
| `openSaleEdit(rno)` | Open pre-filled **editsale-overlay** modal for editing |
| `saveSaleEdit()` | Save from edit modal (confirm popup first) |
| `calcSaleTotal()` | Live total calculation on New Sale form (includes admin) |
| `esCalc()` | Live total calculation on Edit Sale modal (includes admin) |

### Animal / Customer Edit
| Function | Purpose |
|---|---|
| `openAnimalEdit(code)` | Open pre-filled **editanimal-overlay** modal |
| `saveAnimalEdit()` | Save animal changes (confirm popup first) |
| `deleteAnimal(code)` | Delete with strong warning |
| `openCustomerEdit(cid)` | Open pre-filled **editcustomer-overlay** modal |
| `deleteSale(rno)` | Delete sale with confirmation |

### Budget
| Function | Purpose |
|---|---|
| `bgToggleMode()` | Toggle Weight×Rate / Lump Sum (hides/shows rows including `bg-carriage-row`) |
| `bgCalc()` | Live total calc for budget form (includes admin) |
| `addBudgetEntry()` | Save to `DB.budget[]` only — zero impact on sales |
| `clearBudgetForm()` | Reset all budget form fields |

### Utilities
| Function | Purpose |
|---|---|
| `custTotals(cid)` | Returns `{ts, tc, ta, tp, td, balance}` — aggregated from sales/payments |
| `cName(cid)` | Customer name by id |
| `aType(code)` | Animal age_type by code |
| `Rs(n)` | Format rupees |
| `fmtD(date)` | Format date |
| `fmtN(n,d)` | Format number |
| `th(label, tbl, col)` | Sortable `<th>` element |
| `sortToggle(tbl,col)` | Toggle sort state + re-render |
| `sortArr(arr,col,dir)` | Sort array |
| `save()` | Persist DB to localStorage |
| `load()` | Load DB + run all migrations |
| `flash(id, msg, type)` | Show flash message |
| `show(p)` / `goBack()` | Page navigation |

## SORT Object
```javascript
const SORT = {
  animals:{col:'code',dir:'asc'},
  customers:{col:'name',dir:'asc'},
  sales:{col:'receipt_no',dir:'desc'},
  payments:{col:'receipt_no',dir:'desc'},
  stock:{col:'code',dir:'asc'},
  locrpt:{col:'location',dir:'asc'},
  wacchart:{col:'sale_date',dir:'desc'},
  saleledger:{col:'receipt_no',dir:'asc'},
  custledger_s:{col:'receipt_no',dir:'asc'},
  custledger_p:{col:'pay_date',dir:'asc'}
};
```

## Migration Pattern
All one-time data fixes live in `load()` behind a settings flag:
```javascript
if(!DB.settings._flagName){
  // ...fix data...
  DB.settings._flagName = true;
}
```
Applied migrations (in order): `_tc20260526`, `_tc20260526b`, `_tc4000`, `_adminInAmount2026`, `_adminZero2026`, `_loc20260527`

## Modals / Overlays
| ID | Purpose |
|---|---|
| `editsale-overlay` | Edit existing sale (all fields including admin charges) |
| `editanimal-overlay` | Edit animal details |
| `editcustomer-overlay` | Edit customer details |
| `editpayment-overlay` (Edit Collection) | Edit collection/payment record |
| `receipt-overlay` | View/print sale invoice |
| `ledger-overlay` | Customer ledger popup |
| `dashdetail-overlay` | Dashboard detail popup |
| `photozoom-overlay` | Full-size animal photo |

## Reports Tab Sub-tabs
All Sales · Sale Ledger · Sales Collection · Customer Ledger · Location Report · Sale Price Report · Bank-wise Collection · Sender-wise Collection

## All Sales Screen columns (17 total in Sale Ledger)
S# · Photo · Invoice No · Date · Animal · Age · Wt(kg) · Rate/kg · Sale Price · Carriage · Admin · Total Sale · Customer · Received · Discount · Balance · Actions

## All Customers Screen columns (12 total)
S# · Name · Phone · Address · **Animals** · Carriage · Admin · Total Sales · Received · Discount · Balance · Actions

## Budget Entry Form
Replica of New Sale form. Fields: Animal Code (optional, ＋New button) · Customer dropdown (＋New button) · Budget Date · Entry Mode toggle (Weight×Rate / Lump Sum) · Weight · Rate · Admin Charges · Carriage/Transport · Base Amount (calc) · Total Amount (calc) · Notes.
Data stored in `DB.budget[]` only — never touches sales, animals, or payments.

## Excel Exports
| Button | Function | Key notes |
|---|---|---|
| Customers | `exportCustomersExcel()` | Uses `custTotals()`, includes Animals count |
| All Sales | `exportSalesExcel()` | sp uses lumpsum-aware formula, includes Admin column |
| Sale Ledger | `exportSaleLedgerExcel()` | sp lumpsum-aware, includes Admin column, subtotal rows per customer |
| Animals | `exportAnimalsExcel()` | From `animalComputedList()` |
| Stock | `exportStockExcel()` | Available animals only |
| Payments | `exportPaymentsExcel()` | All collection records |
| Budget | `exportBudgetExcel()` | From `animalComputedList()` cost estimates |

## Important Notes
- **Admin charges = 0 everywhere** — do not re-introduce non-zero defaults
- Sale Price shown on invoices/reports = `w×r` (weight mode) or `amount - carriage - admin` (lump sum)
- `custTotals()` returns `tc` (total carriage) and `ta` (total admin) aggregated from `DB.sales`, NOT from `c.admin_charges`
- Customer header rows in Sale Ledger use `onclick="void(0)"` + `user-select:none` to prevent unreadable highlight on click
- `bg-carriage-row` (budget carriage field) must stay in `bgToggleMode()` hide-list to avoid duplicate carriage in lump sum mode
