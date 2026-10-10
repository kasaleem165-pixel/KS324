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
**Branch Risk Audit Investigation & Supervision** — a single-file HTML audit management system for Beaconhouse Group, Systems & Audit department. Developed by Kamran Saleem, Senior Manager Systems & Audit.

## Two-Version Strategy (CRITICAL — read every session)

| | LIVE | DEV |
|---|---|---|
| File | `old/index.html` | `index.html` |
| Badge | 🟢 LIVE (green) | 🟡 DEV (amber) |
| Hosted on | Beaconhouse intranet (central server) | GitHub Pages |
| URL | Intranet URL (internal) | `https://kasaleem165-pixel.github.io/KS324/` |
| Users | All auditors & supervisors | Kamran only (testing) |
| Update method | Download from GitHub → upload to intranet | Auto on push (just refresh browser) |
| Changes allowed | **Bug fixes only** | All new features + improvements |

### Amendment Rule (NEVER violate)
- **Bug** (something broken for auditors NOW) → fix in **BOTH** files
- **New feature / improvement** → fix in `index.html` (DEV) **ONLY**
- **When DEV is ready for release** → copy `index.html` → `old/index.html` → Kamran uploads to intranet

## Infrastructure & Services

### GitHub
- **Repo**: `kasaleem165-pixel/KS324` — stores app files (`index.html`, `old/index.html`)
- **GitHub Pages**: `https://kasaleem165-pixel.github.io/KS324/` — serves DEV version online (auto-updates on push)
- **Sessions repo**: `brains-sessions` — stores all audit session JSON files (cloud sync)
- **PAT**: stored securely by Kamran — do not store in this file (GitHub blocks it as a secret)
- **PAT permissions**: `brains-sessions` repo, Contents → Read and write only

### Google Drive
- **Purpose**: Stores annexure files uploaded by auditors (Photos, Scanned-Documents, Schedules)
- **Folder structure**: `BRAINS-Annexures` → subfolders per type
- **Client ID**: `22287998975-hb9nqe71q43jtv7j0g0ctkiksomdv84j.apps.googleusercontent.com`
- **Requirement**: Only works on HTTPS — works on GitHub Pages URL, NOT on local `file://`

### Beaconhouse Intranet
- Hosts `old/index.html` — the LIVE production version
- All auditors and supervisors access BRAINS from here
- Kamran manually uploads updated `old/index.html` when releasing a fix

## How Everything Connects
```
Auditor opens intranet URL
  → loads old/index.html (LIVE)
  → works on audit report
  → session auto-saves to GitHub (brains-sessions repo)
  → annexures upload to Google Drive (BRAINS-Annexures folder)

Supervisor opens intranet URL
  → loads old/index.html
  → opens Supervisor Dashboard
  → sees pending reviews from auditors (read from brains-sessions repo)

Kamran (Admin) opens GitHub Pages URL
  → loads index.html (DEV) for testing
  → Admin Panel opens automatically after admin login
  → manages users, cloud settings, setup links
```

## User Roles & Login
- **Single URL for all roles** — role determined by credentials, not URL
- **Administrator**: leave username blank + admin password → Admin Panel opens automatically
- **RO Supervisor**: username + password (named account) → Supervisor Dashboard opens
- **Auditor**: username + password (named account) → Audit screen opens
- **Shared passwords** (legacy, blank username): Auditor (`S&A-BA2026`), RO Sup (`RO@S&A2026`), HO Sup (`HOSuper@2026`), Viewer (`Br@insTest#2026`)
- **Named users**: stored in `brains-sessions/sessions/_system/users.json` on GitHub
- **Note**: `?mode=admin` and `?mode=supervisor` URL params still work but are no longer required

## Features — Current Status (as of Oct 2026)

### ✅ Fully Working (LIVE + DEV)
- Audit report creation (observations, evidence, custom observations)
- Annexures with Google Drive upload
- Cloud sync (save/load sessions from GitHub)
- Supervisor review workflow (send → notify → review → respond)
- RO/HO response file (export + direct open fix)
- Co-work status & cross-auditor alerts
- Collapsible observation summary index
- Obs ↔ Annexure two-way navigation links
- Sortable tables across all report views
- Offline/local mode (localStorage)
- Import/Export session files

### ✅ DEV Only (not yet in LIVE)
- Admin Panel with 4 tabs (Users · Cloud Setup · Setup Links · System)
- User Management (add/edit/delete named users)
- Single-URL role-based login (no ?mode= needed)
- Setup Links (one-click cloud config URL for auditors)
- LIVE/DEV version badges on login screen and footer

### ⏳ Pending / Not Yet Tested
- Full supervisor review cycle end-to-end test on live intranet
- Google Drive Client ID configured in Cloud Settings on intranet version

## Admin Panel (DEV only — index.html)
Four tabs accessible after administrator login:
1. **Users** — Add/Edit/Delete auditors and supervisors with role, region, password
2. **Cloud Setup** — GitHub token, owner, repo, Google Drive Client ID
3. **Setup Links** — Generate one-click URL to auto-configure any auditor's Cloud Settings
4. **System** — Version info, change admin password

## ES5-Only Rule (CRITICAL for all code changes)
- **No arrow functions** (`=>`) — use `function(){}` instead
- **No `const`/`let`** — use `var` only
- **No template literals** (backticks) — use string concatenation
- **No destructuring, spread, classes** — plain ES5 only
- Always validate after changes: `sed -n '/<script>/,/<\/script>/p' index.html | grep -v "<script>\|<\/script>" > /tmp/extracted.js && node --check /tmp/extracted.js`

## Syntax Validation Command
```bash
# For DEV (index.html)
sed -n '/<script>/,/<\/script>/p' /home/user/KS324/index.html | grep -v "<script>\|<\/script>" > /tmp/e.js && node --check /tmp/e.js && echo OK

# For LIVE (old/index.html)
sed -n '/<script>/,/<\/script>/p' /home/user/KS324/old/index.html | grep -v "<script>\|<\/script>" > /tmp/e2.js && node --check /tmp/e2.js && echo OK
```

## Key Technical Notes
- Single-file HTML app — all JS, CSS, data in one file
- Session data in browser `localStorage` + GitHub cloud sync
- `_csGetCfg()` — returns Cloud Settings config object
- `_CS_CFG_KEY` — localStorage key for cloud settings
- `_csB64Dec()` — base64 decode for GitHub API responses
- `showAdminPanel()` — opens the 4-tab Admin Panel overlay
- `_supShowDashboard()` — opens Supervisor Dashboard
- `_pwGrantAccess(userObj)` — called after successful login, routes to correct panel
- `saveDraftResponses()` — generates RO/HO response HTML file
- `buildAnnexHtml()` — builds annexure section with back-links to observations
- `obsHtml(o, num, anchorId)` — renders one observation with optional anchor

## What To Do At Start of Every Session
1. Read this CLAUDE.md — already done automatically
2. Check which file the user is working on (LIVE or DEV)
3. Apply the amendment rule strictly — never put new features in `old/index.html`
4. Always push to both feature branch AND main with --force

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
