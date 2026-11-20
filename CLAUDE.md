# Animal Sales Pro — CLAUDE.md

## Project Overview
Standalone single-file HTML app (`animal_sales/AnimalSales.html`) for managing animal sales, collections, customers, and budgeting. All data stored in `localStorage` key `AnimalSalesDB`. No backend, no build step.

## Git — Animal Sales Pro
- **Feature branch**: `claude/animal-sales-receipts-pofPs`
- **Always push to both**: `git push origin claude/animal-sales-receipts-pofPs` AND `git push origin claude/animal-sales-receipts-pofPs:main --force`

## Git — BRAINS (index.html)
- **Always push to**: `main` (this IS the DEV branch — GitHub Pages serves from here)
  ```
  git push origin HEAD:main --force
  ```
- **When releasing DEV → LIVE** (copy index.html → old/index.html, commit, then also sync):
  ```
  git push origin HEAD:brains-old-live --force
  ```
- **Why `--force` on main**: Multiple sessions push to `main`; it can diverge between sessions. `--force` is correct and expected here.

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
| Users | All auditors & supervisors (production) | Kamran + auditors during DEV rollout |
| Update method | Download `old/index.html` from GitHub → upload to intranet server | Auto on push — just refresh browser |
| Changes allowed | **Bug fixes only** | All new features + improvements |

### Future Plan (DO NOT act on this until Kamran explicitly says so)
- Kamran plans to eventually retire LIVE (intranet) once BRAINS DEV is fully launched and stable
- Until Kamran explicitly says "stop maintaining Old Live", treat LIVE as active production — keep updating it for bugs
- Do NOT assume retirement has happened — always maintain both files according to the amendment rule below

### Amendment Rule (NEVER violate)

#### Determine which file to work on FIRST — read Kamran's instruction carefully each session:
- If Kamran says he is working on **BRAINS Old Live** (`old/index.html`): make the change there, then ALSO apply to DEV (`index.html`) — new features go to DEV too, bug fixes go to both
- If Kamran says he is working on **BRAINS Dev** (`index.html`): make the change in DEV only, UNLESS it is a bug that also affects LIVE — then fix both
- If Kamran does not specify: **ask before proceeding** — never assume which file

#### The rules:
- **Bug** (something broken for auditors NOW) → fix in **BOTH** files
- **New feature / improvement started on LIVE** → apply to LIVE first, then also apply to DEV
- **New feature / improvement started on DEV** → DEV only, do NOT touch LIVE
- **When DEV is ready for release** → copy `index.html` → `old/index.html` → Kamran uploads to intranet

#### ⛔ HARD STOP — Before touching ANY file (added after session violation Nov 2026)

**The one check that overrides everything:**

> What did Kamran say at the start of this session — LIVE or DEV?

- Kamran said **LIVE** → work in `old/index.html`. Apply to DEV only if the exact same bug exists there too. **Never touch DEV for anything that does not exist in LIVE.**
- Kamran said **DEV** → work in `index.html`. Touch LIVE only if it is a bug that also affects LIVE.
- Kamran did not say → **ask before writing a single line of code.**

That is the only check needed. Kamran always states which BRAINS he is working on. Read that statement, follow it, do nothing beyond it.

#### Recommending changes in the other BRAINS

If Claude notices the same issue (or a related improvement) in the other BRAINS while working on the declared one:
- **Do the work in the declared BRAINS first and complete it fully.**
- Then **mention it as a recommendation** — e.g. "I also see this in DEV — should I apply it there too?"
- **Wait for Kamran's answer before touching the other file.** Never apply it silently.

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
- **Folder structure**: `BRAINS-Annexures / {year} / {region} / {branchFolder} / {fileType}`
  - `{year}` — from `rper_from` header field (audit period start date), falls back to current calendar year
  - `{region}` — from `brregion` header field (auto-filled by Branch Picker from BSS_BRANCHES); falls back to direct BSS_BRANCHES lookup by brcode; final fallback `'Unknown-Region'`
  - `{branchFolder}` — `_csBranchFolder()` slug (brcode_brname)
  - `{fileType}` — `Photos` / `Scanned-Documents` / `Schedules`
  - Old files in existing flat folders are untouched (Option 1 — no migration)
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
- Admin Panel with 7 tabs ✅ tested by Kamran (originally 4; expanded to 7)
- User Management — add/edit/delete named users ✅ tested (2 auditors + 1 supervisor created)
- Single-URL role-based login (no ?mode= needed) ✅ tested
- Setup Links tab — one-click URL to auto-configure auditor Cloud Settings
- System tab — version info, change admin password
- LIVE/DEV version badges on login screen and footer
- Formula Settings tab — all planning score, sensitivity, complexity formula parameters configurable
- Branches tab — admin manages branch list (225 branches), syncs to cloud via `sessions/_system/branches.json`
- Branch Picker — full-screen overlay after auditor login; searchable list of all branches, pre-fills header fields, checks cloud for existing sessions, supports loading partner's session directly
- Branch Switcher — File › Switch Branch: **IN PROGRESS** section (active branches) + **PAST REPORTS** section (all issued reports, all years, read-only view)
- Cloud Activity Log — 13-event audit trail; local queue flushed to per-auditor cloud files every 10 minutes; Admin Panel Activity Log tab shows merged log for all auditors with filter and CSV export

### ⏳ Pending
- Full supervisor review cycle end-to-end test on live intranet
- Release DEV features to LIVE (when Kamran approves DEV is ready)

## Admin Panel Tabs (DEV — index.html only)
1. **Users** — Add/Edit/Delete auditors and supervisors (role, region, password)
2. **Cloud Setup** — GitHub token, owner, repo name, Google Drive Client ID
3. **Setup Links** — Generate one-click URL that auto-fills Cloud Settings on any computer
4. **System** — BRAINS version info, change administrator password
5. **Formula Settings** — Planning score weights, sensitivity rating weights, complexity default, suggestion thresholds
6. **Branches** — Add/edit/delete branches; sync to `sessions/_system/branches.json`; load built-in 225 branches
7. **Activity Log** — View merged audit trail for all auditors; filter by event/auditor/date; export CSV; load from cloud

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
| `showAdminPanel()` | Opens the 7-tab Admin Panel overlay (DEV only) |
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

## Validation Protocol (MANDATORY — run after EVERY change before reporting done)

This protocol was added after a session where I missed bugs in adjacent code during sanity checks. Follow it without exception.

### Step 1 — Read the entire changed function
- Do not check only the lines that were edited
- Read the COMPLETE function from its opening `function` keyword to its closing `}`
- Note every variable the function reads, sets, clears, or overwrites

### Step 2 — Check all adjacent code (10–20 lines above and below the change)
- If anything is being cleared or reset near the change, ask: is that correct? does it interact with the fix?
- Look for arrays being set to `[]`, objects set to `{}`, or maps being rebuilt — these are high-risk

### Step 3 — Trace downstream effects
For any function that was changed, ask: what functions call this, and what do they do with the result?
Key downstream functions to check for BRAINS:
- `renderRpt()` — uses `obsOrder`, `obsById`, `obsTypeMap`, `selIds`, `obsNotesMap`, `obsEdits`
- `buildAnalysisHtml()` — uses `all = _getSelObs(selIds).concat(cuObs)`, `sensitivityMap`, `cosoMap`
- `getObsReportLabels()` — uses `obsOrder` exclusively for numbering
- `_obsOrderSync()` — rebuilds `obsOrder` based on `selIds` and `obsTypeMap`
- `captureSession()` / `restoreSession()` — saves/restores all in-memory maps
- `_getSelObs()` — merges active bank + retired obs; retired always takes priority

### Step 4 — Check all critical in-memory maps for unintended side effects
Any change near these maps requires explicitly confirming each one is correct after the fix:

| Map | Stores | Risk if wrong |
|---|---|---|
| `selIds` | `{obsId: true}` — which obs are selected | Wrong obs in report |
| `obsOrder` | `{repeated:[], new:[]}` — user's custom sequence | Wrong order, duplicates |
| `obsTypeMap` | `{obsId: 'New'/'Repeated'}` — per-report classification | Wrong New/Repeated labelling |
| `obsNotesMap` | `{obsId: text}` — branch-specific notes/tables | Missing tables in report |
| `obsEdits` | `{obsId: {observation, recommendation}}` — auditor's text edits | Text reverting to bank default |
| `annexMap` | `{obsId: annexLetter}` — linked annexures | Missing annexure references |
| `sensitivityMap` | `{obsId: level}` — sensitivity rating | Wrong sensitivity matrix |
| `customs` | Array of custom/orphaned observations | Duplicate obs if retired obs added here |
| `_retiredObs` | Hardcoded array of 15 deleted obs | Must be checked in orphan recovery |

### Step 5 — Retired observations checklist
Whenever a function touches `selIds`, `customs`, or iterates obs lists, verify:
- Are retired obs (`_retiredObs`) handled correctly? They are NOT in `DB.observations`
- Does any orphan recovery or fallback logic check `_retiredObs` before treating an ID as missing?
- Does `_getSelObs()` correctly return retired obs without duplicating them?

Retired obs IDs (15 total): `OBS_005, OBS_021, OBS_035, OBS_050, OBS_059, OBS_060, OBS_069, OBS_070, OBS_135, OBS_136, OBS_142, OBS_175, OBS_194, OBS_270, OBS_273`

### Step 6 — Run syntax validation on both files (if bug fix)
```bash
sed -n '/<script>/,/<\/script>/p' /home/user/KS324/index.html | grep -v "<script>\|<\/script>" > /tmp/e.js && node --check /tmp/e.js && echo OK_DEV
sed -n '/<script>/,/<\/script>/p' /home/user/KS324/old/index.html | grep -v "<script>\|<\/script>" > /tmp/e2.js && node --check /tmp/e2.js && echo OK_LIVE
```

### Step 7 — Report what was checked
When telling Kamran "sanity check done", explicitly state:
- Which function(s) were read in full
- Which adjacent lines were reviewed
- Which in-memory maps were confirmed unaffected
- Result of syntax validation

### Step 8 — File-generating features: mandatory round-trip test

This step was added after the Save Draft bug (Nov 2026) where only the first save was tested. The second save — what real auditees actually do — was never checked, causing duplicate `bhs-resp-data` scripts and lost responses.

Any feature that **generates a file for use outside BRAINS** (Auditee Copy, response files, export files, follow-up files) must pass ALL of the following before being marked done:

| # | Test | What to verify |
|---|---|---|
| 1 | **Generate** | File is produced without errors |
| 2 | **Open fresh** | Open the file as if on a new machine (clear localStorage or use a private window) — all data appears correctly |
| 3 | **Edit and save once** | Make a change, save → verify the saved file contains the change |
| 4 | **Save a second time** (repeat-save test) | Save again without closing the file → verify the second save still contains all data, no data from the first save is lost or duplicated |
| 5 | **Load back into BRAINS** | Use the Load function to import the file → verify BRAINS shows all data correctly — text, attachments, order, every field |
| 6 | **Multi-auditee chain** (where applicable) | If the file can be forwarded to a second person, simulate: Person A fills partly → saves → Person B opens → fills rest → saves → auditor loads → verify both sets of responses are present |

**The rule**: never mark a file-generating feature complete after testing only the first use. Always test the second save and the full round-trip back into BRAINS.

**If any step raises doubt — STOP and ask Kamran before proceeding.**

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

## Branch Complexity Calculator (Excel)
- **File**: `BRAINS_Branch_Complexity_Calculator.xlsx` (in repo root)
- **Repo path**: `/BRAINS_Branch_Complexity_Calculator.xlsx`
- **Raw download URL**: `https://raw.githubusercontent.com/kasaleem165-pixel/KS324/main/BRAINS_Branch_Complexity_Calculator.xlsx`
- **In-app download**: RA screen shows a download button linking to the raw URL above — auditors click it before starting an audit to get the latest copy
- **Sheet protection password**: `brains2026`
- **Unlocked cells**: Branch Name/Code/Region/Year (C5–C8), 4 score inputs (C12,C14,C16,C18), Signature rows, Comments box
- **To unlock for editing**: Review → Unprotect Sheet → enter `brains2026`
- **Tabs**: Branch Calculator (navy) · Scoring Criteria (gold) · Audit Report (green)

## Final Issuance Report — Format Reference

**Source file**: `Audit_Report_51_FCC_Lahore_3.html` (Report No. 206-LMA, 51 FCC Campus, Lahore — shared by Kamran Nov 2026 as the agreed standard format)

This is the agreed format for the final audit issuance report that BRAINS must generate. Every future session must use this as the reference when building or improving the report generation feature.

### Color Palette (CSS variables)
```css
--primary: #1a3557   /* dark navy */
--accent:  #c8960c   /* gold */
--high:    #c0392b   /* red — High risk */
--mh:      #e67e22   /* orange — Medium-High */
--lm:      #2980b9   /* blue — Low-Medium */
--low:     #27ae60   /* green — Low risk */
--bg:      #f4f6f9
--card:    #fff
--border:  #dde2ea
--text:    #2c3e50
--muted:   #7f8c8d
```

### Page Structure (top to bottom)

#### 1. Sticky Top Nav
- Left: "Beaconhouse **Systems & Audit**" brand
- Right links: Synopsis · Background · Repeated · New Findings · Annexures

#### 2. Cover Section
- Badge pill: "Confidential | Internal Audit" (gold)
- Title: "Audit Report — [Branch Name]" with sub-line "Report No. [XXX-CODE] | Systems & Audit Department"
- "⚠ Confidential & Proprietary Document" warning bar (gold border)
- Meta grid (auto-fit, 2–4 columns): Branch · Region · Audit Visit (date range) · Period Covered · Branch Head · Branch Accountant · Audit Type · Report Date

#### 3. Management Synopsis & Executive Dashboard (id="synopsis")
- Intro paragraph explaining how to use the interactive features
- **KPI tiles row** (6 clickable tiles, open filter modal):
  - High Risk (red) · Medium-High (orange) · Low-Medium (blue) · Low (green) · Total Unresolved (navy) · Resolved This Cycle (green)
- **Observation Resolution Summary table** (columns: Referred To | Last Audit Total | Resolved | Unresolved | New Obs. | New Resolved | New Unresolved | Total Unresolved) — rows for Regional Office and Branch Head, plus total row
- **HIGH RISK alert box** (red background) — links to all High risk observations
- **E. Analysis of Observations & Controls (COSO Framework)** — brief text + 4 risk tier badges
- **F. Sensitivity Matrix** — 3×3 table (Impact: High/Medium/Low × Likelihood: High/Medium/Low) with color-coded cells showing risk level and observation numbers
- **Synopsis Table — Section 1 (Repeated Observations)**
  - Columns: # · Observation (title + category sub-line) · Risk badge · Ref. (BH/RO) · Detail button
  - Each row expandable inline (▼ Detail button): shows Finding, Recommendation, Auditee Response, [RO Response], [Audit View], [Action Taken] boxes + "📄 View as Written in Report" button
- **Synopsis Table — Section 2 (New Observations)** — same structure

#### 4. Section 1 — Repeated (Unresolved) Observations (id="repeated-obs")
- Section title heading
- Category sub-headers (e.g., "Branch Imprest, Payments & Accounts")
- Each observation as a **card** (`.obs-block`):
  - Header row: obs-num badge (e.g., "1.1") + obs-title + risk badge
  - Meta tags: Category · "Referred To: BH/RO" · "Last Audit Ref: [num]"
  - **Finding box** (gold left-border, yellow bg) — always visible (not accordion)
  - **Recommendation** — accordion (collapsed by default)
  - **Auditee Response** — accordion
  - **RO Response** — accordion (only if Referred To: RO)
  - **Audit View** — accordion (orange left-border) — auditor's view on RO response
  - **Action Taken box** (green, bold) — shown only if observation resolved
  - "↑ Back to Synopsis" link (bottom of card)

#### 5. Section 2 — New Observations (id="new-obs")
- Same card structure as Section 1
- High risk cards have `border-top: 3px solid var(--high)` for visual prominence
- No "Last Audit Ref:" tag (these are new)

#### 6. Annexures (id="annexures")
- ann-table: Annexure letter | Description | Observation reference

#### 7. Footer
- Navy background, "Beaconhouse Systems & Audit" branding

### Interactive JavaScript Features
| Feature | How it works |
|---|---|
| KPI tile click | Opens modal filtered by risk level (or resolved/unresolved) — lists obs with Detail + View buttons |
| ▼ Detail button (synopsis) | Toggles inline detail-row beneath synopsis row |
| "View as Written in Report" | Opens modal with verbatim text from report (uses `VB` object) |
| Accordion toggles | Recommendation/Response sections in full obs cards |
| "Back to Synopsis" link | Scrolls back + highlights synopsis row in gold (`syn-highlight` class) |
| KPI back-banner | Floating bottom-right pill — appears when navigating from KPI modal to observation |
| Escape key | Closes any open modal |

### JavaScript Data Objects (embedded in `<script>` at bottom)
```javascript
OBS_INDEX = [{id:"1-1", num:"1.1", title:"...", cat:"...", risk:"mh", resolved:false}, ...]
VB = {"1-1": {title:"...", body:"<HTML verbatim text>"}, ...}
RISK_LABELS = {high:"High Risk", mh:"Medium-High", lm:"Low-Medium", low:"Low Risk"}
RISK_COLORS = {high:"var(--high)", mh:"var(--mh)", lm:"var(--lm)", low:"var(--low)"}
RISK_BG     = {high:"#fdecea", mh:"#fef3e2", lm:"#eaf4fb", low:"#e9f7ef"}
```

### Key CSS Classes
| Class | Purpose |
|---|---|
| `.kpi` + `.red/.org/.blu/.grn` | KPI stat tiles |
| `.kpi-btn` | Makes KPI tile clickable (hover lift effect) |
| `.syn-table` | Synopsis table (navy header, hover rows) |
| `.det-btn` | Dark navy pill button — expands inline detail |
| `.detail-row` / `.detail-panel` | Inline expanded row in synopsis |
| `.ibox.ifind/.irec/.iresp/.iview/.iaction` | Colour-coded info boxes in detail panel |
| `.obs-block` | Full observation card wrapper (scroll anchor) |
| `.obs-header` / `.obs-num` / `.obs-title` | Observation card header elements |
| `.obs-meta .tag` | Small grey metadata tags |
| `.finding-box` | Always-visible finding box (gold left-border) |
| `.view-box` | Audit View box (orange left-border) |
| `.action-box` | Action Taken box (green, bold) |
| `.accordion` / `.acc-toggle` / `.acc-body` | Collapsible sections |
| `.back-link` | "↑ Back to Synopsis" pill link |
| `.cat-header` | Navy-left-border category divider |
| `.matrix` | Sensitivity matrix 3×3 table |
| `.syn-highlight` | Gold highlight on synopsis row (applied by JS on back-link click) |
| `.modal-overlay` / `.modal-box` | Verbatim report modal |
| `#kpi-back-banner` | Floating bottom-right return banner |

### Print behaviour
`@media print`: hides top nav, back-links, detail/view buttons; forces accordion bodies and detail rows to display.

---

## Change Log

| Date | File(s) | Change | Details |
|---|---|---|---|
| Nov 2026 | Both DEV + LIVE | Bug fix: `applyRespLoad()` — 3-part fix | (1) Removed `obsOrder={repeated:[],new:[]};` — was wiping auditor's custom observation order on every response import. (2) Added `_retiredObs` to orphan recovery `_dbIdx` check — retired obs were not found in `DB.observations` so were added as empty orphans to `customs`, causing duplicates in sensitivity matrix, missing branch notes/tables, and missing annexure references. (3) Added stale cleanup at top of `applyRespLoad()` to remove previously-added orphaned retired obs from `customs` in sessions saved before the fix. |
| Nov 2026 | DEV only | New feature: Improved sensitivity suggestion formula + Audit Settings admin tab | Rewrote `getSuggestedSensDetail()` with new 4-signal formula (100 pts): Signal 1 — Finding Gravity max 50 (merged Diligent base × Materiality amplifier); Signal 2 — Obs-specific repeat count max 20; Signal 3 — COSO Component weight max 10; Signal 4 — Branch History max 20. Added `_getSensSettings()` for configurable thresholds from localStorage `_BRAINS_SENS_CFG`. Added `_getObsRepeatCount(obsId)` counting obs in `ra_loadedReports`. Added 5th Admin Panel tab "Audit Settings" with `_adminRenderAuditSettings()`, `_adminSaveSensSettings()`, `_adminResetSensSettings()`. |
| Nov 2026 | DEV only | New feature: Formula Settings admin tab — all formula parameters configurable | Replaced "Audit Settings" tab with unified "Formula Settings" tab (5th Admin Panel tab). 4 sections: (1) Planning Score Weights — Sensitivity/Outstanding/Complexity % weights, must sum to 100%; (2) Sensitivity Rating Weights — High/MtoH/LtoM/Low decimal values used in Sensitivity Area Score; (3) Branch Complexity Default Score — score assumed when branch not in Complexity Matrix; (4) Sensitivity Suggestion Thresholds — instance counts, financial amounts, COSO weights (moved from old Audit Settings tab). Added `_getFormulaCfg()` reading from `_BRAINS_FORMULA_CFG`. Updated `_getSensSettings()` to read new key first, falls back to old `_BRAINS_SENS_CFG`. Updated `ra_stage1CalcPlanningScore()` to use configurable weights and complexity default. Added live worked example at bottom of tab (`_adminFormulaExample()`) — full step-by-step calculation using current saved settings, recalculates on save. |
| Nov 2026 | DEV only | Enhancement: RA methodology screen shows live formula values + cross-link from Formula Settings | `ra_methodologyHtml()` now reads `_getFormulaCfg()` on each call — Component 1/2/3 weight % badges, Component 3 complexity default, and the Planning Score formula summary box all reflect current saved settings instead of hardcoded values. Bottom note updated to reference Admin › Formula Settings. Added "Open RA Methodology" button in Formula Settings tab — closes Admin Panel and launches RA methodology screen for cross-reference. |
| Nov 2026 | Both DEV + LIVE | Improvement: Save Draft overwrites same file instead of creating new copies | Root cause: every Save Draft click triggered a new browser download, leaving auditees with 10+ near-identical PARTIAL files. Fix uses the File System Access API file handle: on first Save Draft the picker opens once and the handle is stored in `_draftHandle`; every subsequent save writes directly to the same file silently (status label shows "✓ Draft saved (same file overwritten)"). Falls back to legacy download if browser does not support `showSaveFilePicker` or if the handle is invalidated. Note: fix only applies to Auditee Copy files generated after the upgrade — existing PARTIAL files in circulation retain old behaviour. |
| Nov 2026 | Both DEV + LIVE | Bug fix: auditee response text lost when loading PARTIAL draft files | Root cause: `buildHtml()` (isDraft=true) injected a fresh `bhs-resp-data` JSON script before `</head>` on every Save Draft without removing the previous copy, leaving duplicate scripts in the saved file. `getElementById('bhs-resp-data')` always returns the first (stale) copy, so the auditor saw empty responses even though the auditee had filled them in. Attachments still appeared because they existed only in the second (newer) copy and were also in localStorage on the same machine. Three-part fix: (1) `buildHtml` isDraft path — strip existing `bhs-resp-data` from `rawHtml` before injecting the new one, preventing duplicates at source. (2) `restoreEmbedded` in auditee copy — switched from `getElementById` to `querySelectorAll()[last]` to read the most recent script — recovers already-circulated files with duplicates. (3) `loadAuditeeFile` in BRAINS — same `querySelectorAll()[last]` fix so auditor always reads the most recent data. |
| Nov 2026 | Old LIVE only | New feature: RO Review Panel — card-based layout with wording diff | Added `_rvShowRoPanel()` card layout: each amended observation shown as a card with obs number (from `getObsReportLabels()`), title, WORDING EDITED badge, Wording Decision section (expand/collapse side-by-side diff using LCS word-level algorithm in `_rvDiffHtml()`), and Observation Decision section. Fixed `_rvObsTitle()` to look up retired obs (`_retiredObs`) so retired obs IDs show correct titles instead of raw IDs. |
| Nov 2026 | Old LIVE only | New feature: Supervisor Dashboard silent when cloud not configured | `_supLoadData()` silently returns empty content (no error message) when `cfg.token`, `cfg.owner`, or `cfg.repo` are not set — dashboard opens cleanly for auditors/supervisors who have not configured cloud sync. |
| Nov 2026 | Both DEV + LIVE | Bug fix: `_rvScrollToObs` wrong element ID | `_rvFindObsEl()` now tries `oc-{id}` first — the actual ID used in the report (`id="oc-{obsId}"` at renderRpt line 5809). Previous lookups for `obs-card-{id}` and `obs-block-{id}` never matched anything. |
| Nov 2026 | Both DEV + LIVE | Bug fix: `_rvObsTitle` retired obs showing raw ID | Added `_retiredObs` array lookup so retired observations (not in `DB.observations`) show their correct title instead of the raw ID string. |
| Nov 2026 | Old LIVE only | Bug fix: RO Review Panel — back button scroll + banner position | (1) `_rvFindObsEl()` was searching for `obs-{id}`, `obs-card-{id}`, `obs-block-{id}` — none exist. Report uses `id="oc-{obsId}"` (line 5809). Fixed to try `oc-{id}` first — now scrolls to the correct observation with gold outline highlight. (2) Back banner (`_rvInjectBackButton`) and inline back link (`_rvShowBackBtn`) both now use `document.getElementById('RP').scrollTop = 0` to return to the top of the right panel scroll container where `_rv_ro_panel` always lives — previously used `scrollIntoView` which was unreliable. Banner positioned at `top:44px` (below toolbar). |
| Nov 2026 | DEV only | New feature: Branch management from Admin Panel (6th tab) | Admin can add, edit, delete branches (code, name, region, city) in Admin Panel › Branches tab. Working copy held in `_adminBranchWorkingCopy()` and in `localStorage` key `_BRAINS_BRANCH_DB`. "Save to Cloud" pushes to `sessions/_system/branches.json` in `brains-sessions` repo. "Load Built-in" restores the 225 embedded branches. "Fetch from Cloud" pulls the saved list. `_branchDbInit()` is called at login to fetch cloud branches and update `BSS_BRANCHES` + `initBranchDataLists()` silently. |
| Nov 2026 | DEV only | New feature: Branch Picker at auditor login | After auditor login, full-screen overlay appears listing all 225 branches (searchable by code, name, region, city). Selecting a branch pre-fills all header fields; a cloud check shows existing sessions for that branch so the auditor can load a partner's session directly. "Continue Last Session" button skips the picker and resumes the previous session. Admin, supervisor, and viewer roles skip the picker. Stored in `_brPickerBranch`; functions: `_brPickerShow()`, `_brPickerFilter()`, `_brPickerSelect()`, `_brPickerCheckCloud()`, `_brPickerLoadSession()`, `_brPickerStartNew()`, `_brPickerFillHeader()`, `_brPickerDismiss()`, `_brPickerClose()`. |
| Nov 2026 | DEV only | New feature: Branch Switcher — File › Switch Branch | Shows all sessions saved by THIS auditor (filtered by `_csAuditorSlug`) for the current year, so the auditor can jump between multiple open branch audit reports. Currently open branch is marked "Open now". "Open Different Branch" goes to the full branch picker. Functions: `_brSwitcherShow()`, `_brSwPaint()`, `_brSwFetch()`, `_brSwRender()`, `_brSwLoad()`. Updated in same session — see Issued Reports entry below. |
| Nov 2026 | DEV only | New feature: Issued report tracking + Past Reports in Branch Switcher | When an auditor saves the final issuance report (any format — HTML, Word, PDF, All), `_issueMarkAndSave()` is called automatically from `saveAsFinal()`. It stamps `_reportStatus:'issued'` and `_issuedAt` into the session via `_issueSessionMeta` (a module-level variable merged into `captureSession()` output — no `restoreSession()` call, no UI flash). `captureSession()` changed from `return {...}` to `var sess={...}; merge; return sess` to support this. `cloudSave({silent:true})` auto-fires to persist the issued status. `_issueWriteIndex()` appends one entry `{year, brcode, brname, region, path, issuedAt}` to `sessions/_system/issued_{slug}.json` — a per-auditor index so all past reports load with 1 API call regardless of how many years exist. Branch Switcher updated: `_brSwFetch()` loads the issued index + current-year sessions in parallel (`Promise.all`). `_brSwRender()` splits results into **IN PROGRESS** (not issued) and **PAST REPORTS** (all issued, all years, most recent first). `_brSwLoadReadOnly()` loads a past report with `_readOnly:true`; a persistent green banner at the bottom always shows "READ-ONLY — Issued Report". `cloudSave()` blocked when `_readOnly:true` with a clear alert. Cloud save hook for `cloud_save` activity log event also skips read-only sessions. |
| Nov 2026 | DEV only | Enhancement: Google Drive folder structure — Year > Region > Branch > FileType | `_gdGetSubfolderId()` now builds a 5-level nested path: `BRAINS-Annexures / {year} / {region} / {branch} / {fileType}`. New helper `_gdRegionFolder()` reads region from `brregion` header field (auto-filled by Branch Picker from BSS_BRANCHES), falls back to direct BSS_BRANCHES lookup by brcode, final fallback `'Unknown-Region'`. Year derived from `rper_from` (audit period start), falls back to current calendar year. Old files in existing flat folders are untouched. |
| Nov 2026 | Both DEV + LIVE | Bug fix: RO Review Panel shows only wording-changed obs instead of all obs | `_rvShowRoPanel()` used `meta.amended_obs_ids` from the imported JSON as the obs list, falling back to `_rvGetAmendedObs()` (wording-changes only) when the field was absent. Supervisor saw only wording-edited obs (e.g. 32 of 85). Fix: always rebuild obs list from in-memory `selIds + customs` populated by `restoreSession()` before the panel opens; fall back to meta snapshot only if session state is empty. |
| Nov 2026 | Both DEV + LIVE | Bug fix: RO Review Panel observations out of sequence | `_rvShowRoPanel()` looped `amendedIds` in arrival order — observations appeared randomly (e.g. 1.4 then 2.8, skipping everything in between). Fix sorts the list by `getObsReportLabels()` label before the display loop. Sort is numeric on each dot-segment so 1.10 correctly follows 1.9. Falls back to arrival order if labels unavailable. |
| Nov 2026 | Both DEV + LIVE | Bug fix: RO Supervisor comments not appearing for auditor after import | Root cause: `captureSession()` does not include `_rvMeta` in its return object. In `_rvRoExport()`, `var meta = sess._rvMeta \|\| {}` always produced an empty `{}`, so the original auditor session's meta fields (`amended_obs_ids`, `wording_changed_ids`, `round`, `submitted_by`, `submitted_at`) were permanently lost from the exported JSON. Only `ro_decisions`, `ro_name`, `ro_reviewed_at`, and `status` survived. When the auditor imported the returned file, `meta.amended_obs_ids` was missing so `_rvShowAuditorPanel` fell back to `Object.keys(ro_decisions)` — showing only obs the supervisor explicitly clicked a decision on, and hiding the rest. Fix: added module-level `var _rvCurrentMeta = {}`. In `_rvShowRoPanel(sess)`, store `_rvCurrentMeta = meta` immediately after reading `sess._rvMeta`. In `_rvRoExport()`, start `meta` as a shallow copy of `_rvCurrentMeta` (using `hasOwnProperty` loop) instead of empty `{}`, then set supervisor fields on top. All original meta fields are now preserved in the exported JSON. |
| Nov 2026 | Both DEV + LIVE — deployed to intranet ✅ | Bug fix: Custom observations show blank text when auditor loads auditee response file | Root cause: auditee copy HTML assigns `id="obs-sc-{obsId}"` to each obs block, but `applyRespLoad()` orphan recovery called `doc.getElementById('obs-'+_lid)` — always returned null. Custom observations (IDs like `C1793257116946`) are not in `DB.observations`, so they go through orphan recovery. With the element never found, the fallback `.obs-title` and `.obs-meta .tag` lookups also failed — resulting in `title=_lid`, `observation:''`, `recommendation:''`. Standard `OBS_xxx` observations were unaffected (found in `DB.observations` before orphan recovery triggers). Two-part fix: (1) `obsHtml()` inside `downloadSoftCopy()` now embeds a hidden `<span>` with `data-rec-id`, `data-rec-title`, `data-rec-cat`, `data-rec-obs`, `data-rec-rec` attributes in every obs block — invisible to auditee, used for recovery when the file is loaded back into BRAINS. (2) `applyRespLoad()` orphan recovery now tries `obs-sc-{id}` first (new auditee copy format), then `obs-{id}` (older fallback); reads `data-rec-*` attributes from the hidden span to restore title, category, observation text and recommendation text; falls back to `.obs-title`/`.tag` for pre-fix files. Note: existing circulated auditee files generated before this fix do not have the recovery span — their custom obs text cannot be recovered retroactively. |
| Nov 2026 | Old LIVE only | Bug fix: RO Copy DRAFT file loses all responses when reopened | Root cause: `saveDraftTemp()` called `document.getElementById("bhs-resp-data")` but initial RO Copy HTML has no such tag — `el` was always null, JSON was never embedded, `_roRestoreEmbedded()` found nothing on reopen. Fix: create the `bhs-resp-data` script tag if it does not exist and append to `<head>` before capturing `outerHTML`. |
| Nov 2026 | Old LIVE only | New feature: RO supervisor "Save My Record Copy" button | RO supervisors had no readable record of the full report after submitting the final response to the auditor. Added a third purple button **"Save My Record Copy"** (`saveRoRecordCopy()`) in the RO Copy footer alongside Save Draft and Save Final Response. Saves the full readable RO Copy HTML with all responses embedded, named `*_RO_MyRecord.html` (or `*_HO_MyRecord.html`). Can be clicked before or after Save Final Response — the page never navigates away. On reopen, `_roRestoreEmbedded()` reads the embedded `bhs-resp-data` JSON and fills all textareas. No duplicate tag risk: uses `if(el){update}else{create}` pattern. |
| Nov 2026 | Both DEV + LIVE | Bug fix: Ghost observation blocking RO Export Response | An obs removed from the report (deselected from `selIds`) could still appear in `meta.wording_changed_ids` if the auditor edited its wording before deselecting it. `_rvShowRoPanel()` stored this stale ID in `data-wc-ids`; `_rvRoExportMenu()` validated it and found no wording decision, blocking export with "Wording decision missing" for a non-existent obs (e.g. "Delay in Return of Library Books" in Defence Campus report — supervisor stuck at 135/136 decided). Fix: filter `wordingChangedIds` to only include IDs present in `amendedIds` (the report's actual obs list built from `selIds + customs`). Removed obs are silently excluded — no card is shown for them and no decision is required. `totalDecisions` counter also corrected automatically. |
| Nov 2026 | DEV only | New feature: Cloud Activity Log — operational audit trail | Logs 13 event types (login, branch_open, branch_switch, session_load, partner_load, cloud_save, merge, send_ro, send_ho, issuance, admin_action, sensitivity, coso) to a localStorage queue (`_BRAINS_ACT_QUEUE`). `_actStartTimer()` starts a 10-minute interval batch flush (`_actFlush`) that appends events to per-auditor files `sessions/_system/activity_{slug}.json` in `brains-sessions`. Per-auditor files eliminate write conflicts; batching keeps API calls well under the 5,000/hour GitHub limit. Hooks placed in: `_pwGrantAccess` (login), `_brPickerStartNew`/`_brPickerLoadSession` (branch_open/partner_load/session_load), `_brSwLoad` (branch_switch), `cloudSave` (cloud_save), `_csLoadFile` (session_load/partner_load), `_csDoSubmitReviewRequest` (send_ro/send_ho), `_adminBranchSaveToCloud` (admin_action). Page also flushes on `beforeunload`. Admin Panel 7th tab "Activity Log": `_adminRenderActLog()` — merges local queue + all cloud auditor files, displays timeline table, filters by event type/auditor/date, exports CSV. Key functions: `_actLog()`, `_actFlush()`, `_actStartTimer()`, `_actCurrentUser()`, `_actCurrentBranch()`, `_alGetMerged()`, `_alRender()`, `_alApplyFilter()`, `_alExportCsv()`, `_alLoadCloud()`. |
