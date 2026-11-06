# BRAINS — Session Log: November 2026

**Project**: BRAINS (Branch Risk Audit Investigation & Supervision)
**Developer**: Kamran Saleem, Senior Manager Systems & Audit, Beaconhouse Group
**Session Date**: November 2026
**AI Assistant**: Claude (Anthropic) via Claude Code

---

## Session Summary

This session addressed four critical bugs reported by an auditor after the LIVE version of BRAINS was updated on the Beaconhouse intranet. All bugs traced to a single root cause in `applyRespLoad()`. Three fixes were applied to both DEV (`index.html`) and LIVE (`old/index.html`). A mandatory 7-step Validation Protocol was added to CLAUDE.md. A Change Log section was also added to CLAUDE.md.

---

## Background: What Triggered This Session

Kamran uploaded a newly amended version of `old/index.html` to the Beaconhouse intranet. After deployment, an auditor reported four problems:

1. **Observation order mismatch** — order of observations in Repeated and New sections did not match the Navigation panel
2. **Duplicate observation count** — sensitivity matrix showed more observations than actual (e.g. 68 instead of 62)
3. **Missing branch-specific tables** — certain observations had employee/data tables entered by the auditor, which disappeared
4. **Missing annexure references** — some observations previously showed "Refer Annexure-X" which was now missing

---

## Root Cause Analysis

All four issues were caused by two bugs in `applyRespLoad()` — the function that imports the auditee/supervisor response file back into BRAINS.

### Bug 1: obsOrder was being cleared

Inside `applyRespLoad()`, there was this line:

```javascript
obsOrder = {repeated:[], new:[]};
```

**Effect**: Every time an auditor loaded a response file, their custom observation ordering was wiped. The report then rebuilt order from the bank sequence (alphabetical/default), which did not match the Navigation panel order that the auditor had set.

**Fix**: Removed this line entirely. The function `_obsOrderSync()` already handles order cleanup correctly when called by `renderRpt()` — it preserves existing order and only appends/removes as needed.

### Bug 2: Retired observations not in orphan recovery check

BRAINS has 15 "retired" observations — observations deleted from the active bank (`DB.observations`) but still used in historical audit sessions. They are stored in a hardcoded array `_retiredObs`.

The orphan recovery code inside `applyRespLoad()` checked:
- `DB.observations` ✅
- `customs` ✅
- `_retiredObs` ❌ (missing)

**Effect**: When a session contained a retired obs (e.g. OBS_021, OBS_135), the orphan recovery code could not find it in `DB.observations` or `customs`, so it created a new empty orphan entry in `customs`. This caused:
- The same obs ID to appear TWICE in `all = _getSelObs(selIds).concat(cuObs)`
- `obsById` was built with last-write-wins — the empty orphan overwrote the proper retired obs
- Result: missing text, missing tables, missing annexure references, and duplicate obs in sensitivity matrix

**Fix**: Added `_retiredObs` to the `_dbIdx` lookup in orphan recovery:

```javascript
for(var _rObsI=0;_rObsI<_retiredObs.length;_rObsI++) _dbIdx[_retiredObs[_rObsI].id]=true;
```

### Bug 3 (Edge Case): Stale orphans in sessions saved before the fix

Sessions that auditors had already saved to cloud BEFORE the fix was applied already had the stale empty orphan entries stored in `customs`. Simply fixing the orphan recovery code was not enough — those stale entries would persist and still cause duplicates.

**Fix**: Added a cleanup block at the TOP of `applyRespLoad()` to strip any retired obs that were previously added as orphans:

```javascript
var _retiredIdsCln = {};
for(var _rci=0;_rci<_retiredObs.length;_rci++) _retiredIdsCln[_retiredObs[_rci].id]=true;
customs = customs.filter(function(c){ return !_retiredIdsCln[c.id]; });
```

---

## Complete 3-Part Fix Applied

**File**: `applyRespLoad()` function in both `index.html` (DEV) and `old/index.html` (LIVE)

### Part 1 — Stale cleanup (added at top of function)
```javascript
// Clean up retired obs that were previously added to customs as orphans
var _retiredIdsCln={};
for(var _rci=0;_rci<_retiredObs.length;_rci++) _retiredIdsCln[_retiredObs[_rci].id]=true;
customs=customs.filter(function(c){return !_retiredIdsCln[c.id];});
```

### Part 2 — Removed obsOrder clear
```javascript
// REMOVED: obsOrder={repeated:[],new:[]};
// _obsOrderSync() handles cleanup — clearing here wipes auditor's custom order
```

### Part 3 — Added _retiredObs to orphan recovery
```javascript
var _dbIdx = {};
for(var _di=0;_di<DB.observations.length;_di++) _dbIdx[DB.observations[_di].id]=true;
for(var _ci=0;_ci<customs.length;_ci++) _dbIdx[customs[_ci].id]=true;
for(var _rObsI=0;_rObsI<_retiredObs.length;_rObsI++) _dbIdx[_retiredObs[_rObsI].id]=true;  // <-- ADDED
```

---

## Specific Instances Verified by Kamran

Kamran provided screenshots of two specific observations for verification:

### OBS_021 — "Outgoing/Departure Attendance not Marked by Staff"
- Confirmed in `_retiredObs` list ✅
- Covered by the 3-part fix ✅
- Annexure reference ("Refer Annexure-G") not visible in RA screen: **NORMAL** — annexure references are auto-appended in generated reports only, not stored in observation textarea text

### OBS_035 — "Early Confirmation of Employee without Approval"
- Confirmed in `_retiredObs` list ✅
- Covered by the 3-part fix ✅
- Branch notes (employee table) empty in RA screen: **Data loss** in working session — auditor must re-enter branch notes and save to cloud (this is a one-time re-entry, not a recurring bug)

---

## Clarifications Given During Session

### Q: Why does observation heading show in report but not in RA screen?
**Answer**: Normal by design. The draft report is a formatted output document — it renders observation titles as bold headings. The BRAINS RA working screen shows the OBS code (OBS_021) as the identifier. These are two different views of the same data serving different purposes. Not a bug.

### Q: Does the annexure reference ("Refer Annexure-G") appear in the RA textarea?
**Answer**: No, and that is correct. Annexure references are auto-appended by the report generator from `annexMap`. The RA screen textarea shows raw observation text only. The reference will appear correctly in all generated reports (draft, response, final).

### Q: Were fixes applied to both DEV and LIVE?
**Answer**: Yes. All three fixes were applied to both `index.html` (DEV) and `old/index.html` (LIVE), following the amendment rule — bug fixes always go to both files.

---

## What Kamran Needs To Do

1. **Download `old/index.html`** from GitHub (`kasaleem165-pixel/KS324`, main branch) → upload to Beaconhouse intranet server
2. **Download `index.html`** from GitHub → replace the copy on your laptop (DEV local copy)
3. **Advise auditor** that OBS_035 branch notes (employee table) need to be re-entered manually and saved to cloud — this was a data loss in the working session that cannot be recovered automatically

---

## Validation Protocol Added to CLAUDE.md

A 7-step mandatory Validation Protocol was added to CLAUDE.md after Kamran pointed out that these bugs should have been caught during earlier sanity checks. The protocol requires:

1. Read the ENTIRE changed function (not just edited lines)
2. Check 10–20 lines of adjacent code
3. Trace all downstream effects (renderRpt, buildAnalysisHtml, etc.)
4. Explicitly confirm all 9 critical in-memory maps are unaffected
5. Verify retired obs are handled correctly in any function touching selIds/customs
6. Run syntax validation on both files (if bug fix)
7. Explicitly report what was checked when declaring "sanity check done"

---

## Retired Observations Reference (15 total)

These obs IDs are deleted from `DB.observations` but still used in historical sessions. They are stored in the hardcoded `_retiredObs` array in both files.

`OBS_005, OBS_021, OBS_035, OBS_050, OBS_059, OBS_060, OBS_069, OBS_070, OBS_135, OBS_136, OBS_142, OBS_175, OBS_194, OBS_270, OBS_273`

Any function that iterates obs lists MUST check `_retiredObs` as well as `DB.observations` and `customs`.

---

## Git Commits in This Session

All changes pushed to:
- Feature branch: `claude/optimistic-mccarthy-NPnuj`
- Main: forced updated with `git push origin claude/optimistic-mccarthy-NPnuj:main --force`

Changes committed:
- 3-part bug fix in `applyRespLoad()` — both `index.html` and `old/index.html`
- 7-step Validation Protocol added to `CLAUDE.md`
- Change Log section added to `CLAUDE.md`

---

## Key Rule Reminders (from CLAUDE.md)

- **Amendment Rule**: Bug fixes → BOTH files. New features → DEV (`index.html`) ONLY
- **ES5 Only**: No arrow functions, no const/let, no template literals (backticks), no destructuring
- **Git Push**: Always push to BOTH `claude/optimistic-mccarthy-NPnuj` AND force-update `main`
- **Confirm before DEV changes**: Any amendment affecting DEV BRAINS — confirm with Kamran first
- **CLAUDE.md is the permanent record**: Add any new decisions or checks to CLAUDE.md at end of session

---

*End of Session Log — November 2026*
