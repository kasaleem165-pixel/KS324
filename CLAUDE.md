# Animal Sales Pro — CLAUDE.md

## Project Overview
Standalone single-file HTML app (`animal_sales/AnimalSales.html`) for managing animal sales, collections, customers, and budgeting. All data stored in `localStorage` key `AnimalSalesDB`. No backend, no build step.

## Git
- **Feature branch**: `claude/animal-sales-receipts-pofPs`
- **Always push to both**: `git push origin claude/animal-sales-receipts-pofPs` AND `git push origin claude/animal-sales-receipts-pofPs:main`

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
