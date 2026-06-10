from docx import Document
from docx.shared import Pt, RGBColor, Inches, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

doc = Document()

# ── Page margins ──────────────────────────────────────────────────────────────
for section in doc.sections:
    section.top_margin    = Cm(2.0)
    section.bottom_margin = Cm(2.0)
    section.left_margin   = Cm(2.5)
    section.right_margin  = Cm(2.5)

# ── Style helpers ─────────────────────────────────────────────────────────────
def h1(text):
    """Slide title — Gamma breaks on Heading 1"""
    p = doc.add_paragraph(text, style='Heading 1')
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after  = Pt(6)
    return p

def h2(text):
    """Sub-section within a slide — Gamma uses as card header"""
    p = doc.add_paragraph(text, style='Heading 2')
    p.paragraph_format.space_before = Pt(10)
    p.paragraph_format.space_after  = Pt(4)
    return p

def h3(text):
    """Card sub-label"""
    p = doc.add_paragraph(text, style='Heading 3')
    p.paragraph_format.space_before = Pt(8)
    p.paragraph_format.space_after  = Pt(3)
    return p

def body(text, bold=False, italic=False):
    p = doc.add_paragraph(text, style='Normal')
    p.paragraph_format.space_after = Pt(4)
    if bold or italic:
        for run in p.runs:
            run.bold   = bold
            run.italic = italic
    return p

def b(text, prefix=None):
    """Bullet point, optional bold prefix"""
    p = doc.add_paragraph(style='List Bullet')
    p.paragraph_format.space_after = Pt(3)
    if prefix:
        r1 = p.add_run(prefix + ':  ')
        r1.bold = True
        p.add_run(text)
    else:
        p.add_run(text)
    return p

def nb(text, prefix=None):
    """Numbered list"""
    p = doc.add_paragraph(style='List Number')
    p.paragraph_format.space_after = Pt(3)
    if prefix:
        r1 = p.add_run(prefix + ':  ')
        r1.bold = True
        p.add_run(text)
    else:
        p.add_run(text)
    return p

def divider():
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after  = Pt(2)
    pPr  = p._p.get_or_add_pPr()
    pBdr = OxmlElement('w:pBdr')
    bot  = OxmlElement('w:bottom')
    bot.set(qn('w:val'),   'single')
    bot.set(qn('w:sz'),    '6')
    bot.set(qn('w:space'), '1')
    bot.set(qn('w:color'), 'AAAAAA')
    pBdr.append(bot)
    pPr.append(pBdr)

def simple_table(headers, rows, col_widths_cm=None):
    t = doc.add_table(rows=1+len(rows), cols=len(headers))
    t.style = 'Table Grid'
    t.autofit = False
    if col_widths_cm:
        for i, w in enumerate(col_widths_cm):
            t.columns[i].width = Cm(w)
    # header row
    for i, h in enumerate(headers):
        c = t.cell(0, i)
        r = c.paragraphs[0].add_run(h)
        r.bold = True
        r.font.size = Pt(9)
        tc = c._tc
        tcPr = tc.get_or_add_tcPr()
        shd = OxmlElement('w:shd')
        shd.set(qn('w:val'),   'clear')
        shd.set(qn('w:color'), 'auto')
        shd.set(qn('w:fill'),  '2C3E7A')
        tcPr.append(shd)
        r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
    # data rows
    for ri, row in enumerate(rows):
        fill = 'F2F5FA' if ri % 2 == 0 else 'FFFFFF'
        for ci, val in enumerate(row):
            c = t.cell(ri+1, ci)
            r = c.paragraphs[0].add_run(str(val))
            r.font.size = Pt(8.5)
            tc = c._tc
            tcPr = tc.get_or_add_tcPr()
            shd = OxmlElement('w:shd')
            shd.set(qn('w:val'),   'clear')
            shd.set(qn('w:color'), 'auto')
            shd.set(qn('w:fill'),  fill)
            tcPr.append(shd)
    doc.add_paragraph().paragraph_format.space_after = Pt(4)

# ═══════════════════════════════════════════════════════════════════════════════
# SLIDE 1 — COVER
# ═══════════════════════════════════════════════════════════════════════════════
h1('Preliminary Fraud Assessment')
body('Attendance Record Manipulation — Systems Administrator', bold=True)
body('Knowledge & Skill (KS) School System  |  Compliance & Risk Division')
body('Northern Operations Hub (400)  |  January 2026')
divider()
b('Mr. Shakeel', 'Subject')
b('47291', 'Employee ID')
b('Systems Administrator', 'Designation')
divider()
body('Framework: 7-Point Preliminary Fraud Assessment  ·  Fact Finding Report — C&R Division', italic=True)

# ═══════════════════════════════════════════════════════════════════════════════
# SLIDE 2 — SITUATION, RED FLAGS & HYPOTHESIS
# ═══════════════════════════════════════════════════════════════════════════════
h1('Step 1 — Situation, Red Flags & Hypothesis')

h2('Key Statistics')
b('96 suspicious entries detected — Jul 2024 to Nov 2025')
b('10 confirmed manipulated entries — Oct to Nov 2025')
b('17+ months of sustained anomalous pattern')
b('5 dates independently corroborated by CCTV footage')

h2('Situation')
body('The C&R Division at KS School System\'s Northern Operations Hub (400) detected anomalies in the facial recognition attendance system (ATLAS). The Systems Administrator — custodian of the system — allegedly exploited admin access to back-date and alter his own "Time In" entries to conceal late arrivals and absences.')

h2('Red Flags')
b('Auditor observed Mr. Shakeel routinely arriving late and leaving late, yet his leave balance reflected no corresponding deductions for late arrivals.', 'RF-1  |  Direct Observation (SOMOTO)')
b('96 instances over 17 months (Jul 2024–Nov 2025) where "Time In" was recorded within seconds of the 09:00 threshold — a clustering too precise to be natural and indicative of deliberate manipulation.', 'RF-2  |  Anomalous Attendance Pattern')

h2('Hypothesis A — Guilty')
body('Mr. Shakeel knowingly misused admin access to fabricate and overwrite "Time In" records, concealing habitual late arrivals to avoid salary deductions and disciplinary action — constituting payroll / time-and-attendance fraud.')

h2('Hypothesis B — Not Guilty')
b('System glitch caused missed morning scans; subject corrected records in good faith, unaware that supervisor approval was required.')
b('Subject believed his routine late sittings entitled him to offset late arrivals informally, without knowledge of the formal policy or approval process for such adjustments.')

h2('Why It Matters')
b('Undermines integrity of the organization\'s attendance controls')
b('Financial loss through unearned pay and avoided deductions')
b('Abuse of privileged IT role and position of trust')
b('17-month pattern confirms willful, sustained conduct')
b('Same privileges could be used to manipulate other employees\' records')

# ═══════════════════════════════════════════════════════════════════════════════
# SLIDE 3 — LEGAL DESTINATION & CASE STRATEGY
# ═══════════════════════════════════════════════════════════════════════════════
h1('Step 2 — Legal Destination & Case Strategy')

h2('Legal Destination — Disciplinary Action')
body('This case is classified as an internal employment disciplinary matter. The subject holds a position of trust as custodian of the attendance system, and the evidence indicates a breach of that trust through unauthorized use of admin privileges to alter official records. The appropriate legal destination is a formal disciplinary proceeding under the organization\'s HR and employment policies.')

h2('Grounds for Disciplinary Action')
b('Unauthorized modification of attendance records using admin privileges', 'Misconduct')
b('Abuse of privileged role entrusted to safeguard data integrity', 'Breach of Trust')
b('Bypassing approved correction process without supervisor authorization', 'Policy Violation')
b('Inaccurate records affecting payroll and leave calculations', 'Misrepresentation')

h2('Disciplinary Case Strategy')
b('Preserve all digital evidence and secure system logs', 'Immediate')
b('Issue show-cause notice; obtain subject\'s written explanation', 'Short-term')
b('Constitute inquiry committee; present findings and evidence to subject', 'Formal Hearing')
b('Determine penalty based on intent, duration, and financial impact — from written warning to termination', 'Decision')
b('Recover salary/benefit amounts confirmed as improperly obtained', 'Recovery')

h2('Key Open Questions')
b('Does the subject have a prior disciplinary record?')
b('Was he formally informed of the attendance correction policy?')
b('Was there implicit management tolerance of such adjustments?')
b('What is the exact financial value of benefit improperly obtained?')
b('Did his line manager have awareness of the late arrivals?')

h2('Classification')
b('Disciplinary Misconduct')
b('Breach of Trust')
b('Unauthorized System Use')
b('Attendance Policy Violation')

# ═══════════════════════════════════════════════════════════════════════════════
# SLIDE 4 — SCHEME MECHANICS
# ═══════════════════════════════════════════════════════════════════════════════
h1('Step 3 — Scheme Mechanics')

h2('Method A — Retroactive Creation')
body('No "Time In" recorded in the morning. At departure, subject punched a back-dated "Time In" of ≈08:59–09:00 using admin access.')
body('▶  8 confirmed instances — Oct 2025', bold=True)

h2('Method B — Overwriting a Late Entry')
body('A genuine late "Time In" existed (e.g., 09:34 or 10:20). Subject replaced it with an earlier fabricated timestamp (e.g., 08:50) via admin access.')
body('▶  2 confirmed instances — 3 & 24 Oct 2025', bold=True)

h2('Method C — Cross-Day Back-Dating')
body('Previous day\'s attendance not recorded. On the next day, both days\' fabricated entries were submitted together.')
body('▶  1 confirmed instance — 3 & 4 Nov 2025', bold=True)

h2('How the Scheme Operated — Step by Step')
nb('Arrives late or absent — no morning facial scan recorded.')
nb('Logs into ATLAS at end of day with admin credentials.')
nb('Enters or replaces "Time In" with a fabricated timestamp just before 09:00.')
nb('Report shows on-time arrival. Late/absence hidden from HR and payroll.')
nb('Full salary maintained. Deductions and penalties avoided.')

h2('Enabling Control Failures')
b('IT custodian could modify their own records without independent approval.', 'No Segregation of Duties')
b('Back-dated entries triggered no automated flag or supervisor notification.', 'No Audit Alert')
b('Records could be overwritten with no secondary authorization required.', 'Unrestricted Admin Access')

# ═══════════════════════════════════════════════════════════════════════════════
# SLIDE 5 — EVIDENCE COLLECTION & PROCEDURES
# ═══════════════════════════════════════════════════════════════════════════════
h1('Step 4 — Evidence Collection & Procedures')

h2('Evidence Collected')
b('ATLAS Attendance Data: Actual vs. altered "Time In" records Oct–Nov 2025 (Annexures A–G)', '')
b('System Audit Logs: Timestamps of back-dated entry creation/modification')
b('CCTV Footage: Morning arrival footage for 13, 16, 20, 21, 23 Oct and 3, 4 Nov 2025')
b('CCTV Comparator: Colleague arrival times vs. ATLAS to validate ~3–4 min system offset')
b('Historical Data: 96-instance dataset Jul 2024–Nov 2025 (Annexure H)')
b('Staff Interviews: Verbal confirmations from admin and IT staff')

h2('Evidence Still Required')
b('Full admin modification logs — who changed what, and when')
b('Authorization records for subject\'s admin privileges')
b('Payroll data for the full 17-month period')
b('HR policy on late attendance deductions and disciplinary thresholds')
b('CCTV review for remaining 85 unverified historical dates')
b('Forensic image of ATLAS server database')
b('Formal written statement from subject')

h2('Recommended Evidence Procedures')
simple_table(
    ['#', 'Procedure', 'Purpose', 'Priority'],
    [
        ('1', 'Forensic imaging of ATLAS server database', 'Preserve tamper-proof evidence', 'Immediate'),
        ('2', 'Extract full system audit log', 'Establish who changed what and when', 'Immediate'),
        ('3', 'Secure CCTV archive for full period', 'Prevent overwriting of recordings', 'Immediate'),
        ('4', 'Obtain payroll data Jul 2024–Nov 2025', 'Quantify financial benefit obtained', 'Short-term'),
        ('5', 'CCTV review for all 96 flagged dates', 'Corroborate manipulation across full dataset', 'Short-term'),
        ('6', 'Independent IT forensic expert review', 'Third-party audit trail validation', 'Short-term'),
        ('7', 'HR file review for prior warnings', 'Establish recurrence and prior knowledge', 'Medium-term'),
        ('8', 'Formal written statement from subject', 'Document subject\'s explanation or defence', 'Medium-term'),
    ],
    col_widths_cm=[1.0, 5.5, 5.5, 3.0]
)

# ═══════════════════════════════════════════════════════════════════════════════
# SLIDE 6 — INTERVIEWS & STATEMENTS
# ═══════════════════════════════════════════════════════════════════════════════
h1('Step 5 — Interviews & Statements')

h2('Interviews Conducted')
b('Discussions held with administrative and IT staff at Northern Operations Hub')
b('Purpose: establish facts on attendance discrepancies and system admin practices')
b('Verbal confirmations obtained where documentation was absent')
b('Statement details maintained in the case file')
body('Mr. Shakeel has not yet provided a formal written statement responding to the specific findings in this report.', italic=True)

h2('Interviews Required — Next Phase')
simple_table(
    ['Interviewee', 'Relevance'],
    [
        ('Mr. Shakeel (47291)', 'Subject — formal statement, right to respond'),
        ('IT Head / Supervisor', 'Admin access authorization; awareness of edits'),
        ('HR Manager', 'Payroll processing; attendance discrepancy awareness'),
        ('CCTV-identified colleagues', 'Corroborate subject absence on specific dates'),
        ('ATLAS Vendor / IT Provider', 'System back-dating capability; log integrity'),
        ('Hub Head / Line Manager', 'Workplace patterns; prior complaints'),
    ],
    col_widths_cm=[6.0, 9.0]
)

h2('Key Questions — Subject')
b('Were you authorized to modify your own attendance?')
b('Why do "Time In" entries appear at departure time?')
b('Why do 96 entries cluster at exactly 08:59–09:00 over 17 months?')
b('Why are you absent from CCTV at your claimed arrival times?')
b('Who else knew about your admin access capabilities?')

h2('Key Questions — IT / System')
b('Who granted admin access and under what policy?')
b('Is there a policy governing attendance record modification?')
b('Are modifications separately logged with a full audit trail?')
b('Has anyone else used admin access to alter records?')

h2('Interview Best Practices')
b('Interview subject only after all documentary evidence is secured')
b('Use signed, witnessed statement format')
b('Present specific dates for direct response')
b('Allow subject to provide alternative explanation')
b('Consult legal counsel before formal subject interview')

# ═══════════════════════════════════════════════════════════════════════════════
# SLIDE 7 — EVIDENCE ANALYSIS & QUANTIFICATION
# ═══════════════════════════════════════════════════════════════════════════════
h1('Step 6 — Evidence Analysis & Quantification')

h2('Key Metrics')
b('10 confirmed manipulated entries — Oct to Nov 2025')
b('96 historically suspect entries — Jul 2024 to Nov 2025')
b('5 instances of CCTV-verified absence vs. system claim')
b('3–4 minute offset between ATLAS system time and CCTV time')
b('17+ months duration of the identified pattern')

h2('Confirmed Manipulation Cases — Oct to Nov 2025')
simple_table(
    ['Date', 'Raw Time In', 'Fabricated Entry', 'CCTV Verified'],
    [
        ('02-Oct-25', '18:02:45', '08:59:13', '—'),
        ('03-Oct-25', '09:34:04', '08:50:18', '—'),
        ('07-Oct-25', '20:56:56', '08:59:41', '—'),
        ('09-Oct-25', '19:07:47', '09:00:09', '—'),
        ('13-Oct-25', '18:02:07', '09:01:01', 'Yes'),
        ('16-Oct-25', '22:49:31', '08:55:27', 'Yes'),
        ('20-Oct-25', 'Marked at Time Out', '08:59:41', 'Yes'),
        ('21-Oct-25', '18:59:02', '08:58:17', 'Yes'),
        ('23-Oct-25', '18:33:03', '08:55:52', 'Yes'),
        ('03–04 Nov-25', '17:57:23 / None', 'Backdated on 04-Nov', 'Yes'),
    ],
    col_widths_cm=[3.0, 4.5, 4.5, 3.0]
)

h2('Financial Quantification')
body('Full quantification is pending payroll data. The preliminary framework covers:')
b('Direct Loss: Wages paid for disguised absences/late arrivals across 96 dates')
b('Benefit Loss: Bonuses or incentives tied to attendance metrics')
b('Avoided Penalties: Late deductions and sanctions that should have applied')
b('Indirect Costs: Investigation, remediation, and reputational risk')
body('Status: Not yet quantified — pending payroll data and HR policy review across all 96 suspect dates.', italic=True)

h2('Pattern Analysis — Historical Data Significance')
body('96 entries falling within a 2-minute window over 17 months cannot occur by chance — confirming deliberate, systematic back-dating targeting the exact 09:00 reporting threshold.')

# ═══════════════════════════════════════════════════════════════════════════════
# SLIDE 8 — CASE FILE, EXPERT OUTPUT & RECOVERY SUPPORT
# ═══════════════════════════════════════════════════════════════════════════════
h1('Step 7 — Case File, Expert Output & Recovery Support')

h2('Case File Contents')
b('Fact Finding Report — C&R Division, January 2026')
b('Annexures A–G: Actual vs. altered attendance reports (Oct–Nov 2025)')
b('Annexure H: 96-instance historical pattern data (Jul 2024–Nov 2025)')
b('CCTV footage for 5 verified dates')
b('Staff interview notes and verbal confirmations')
b('ATLAS screenshots — original vs. modified entries')
b('Inquiry Committee (IC-1) recommended decisions')

h2('Expert Output Required')
b('IT Forensic Expert: Validate audit trail integrity; confirm logs untampered; assess full scope of manipulation')
b('Payroll/HR Analyst: Quantify financial benefit obtained across the 17-month period')
b('Legal Counsel: Disciplinary charge drafting; advice on recovery mechanisms')
b('ATLAS Vendor: Confirm system back-dating capability and log completeness')

h2('Recovery Support')
b('Financial: Salary/benefit recovery via employment contract provisions')
b('Disciplinary: IC-1 recommendations implemented through HR processes')
b('System: Segregation of duties; dual-approval for admin edits; automated audit alerts')
b('Policy: Restrict self-modification of attendance; mandatory supervisor sign-off for all adjustments')

h2('Prioritized Action Plan')
b('Forensic image ATLAS server · Secure all CCTV archives · Preserve all digital evidence', 'Immediate — Week 1')
b('CCTV review for all 96 dates · Independent IT forensic report · Obtain full payroll data · Brief legal counsel', 'Short-Term — Weeks 2–4')
b('Formal disciplinary hearing · Quantify total financial loss · Issue charges per IC-1 recommendations', 'Medium-Term — Months 2–3')
b('Review all staff records for manipulation by subject · Implement IT control remediation', 'Parallel Track')
b('Assess penalty based on intent, duration, and quantified financial impact', 'Decision Gate')
b('System-wide control improvements deployed · Attendance policy updated · Recovery action initiated', 'Close-Out')

# ═══════════════════════════════════════════════════════════════════════════════
# SLIDE 9 — OVERALL ASSESSMENT & RECOMMENDATION
# ═══════════════════════════════════════════════════════════════════════════════
h1('Overall Assessment & Recommendation')

h2('Is Further Investigation Justified?')
body('YES — Strongly Recommended', bold=True)
body('10 confirmed manipulated entries with documentary proof, 5 CCTV-corroborated dates, a statistically anomalous 17-month pattern of 96 suspect entries, and the subject\'s unique privileged access all meet the threshold for full formal investigation and disciplinary proceedings.')

h2('What Remains Unclear')
b('Total financial value of benefit obtained')
b('Whether manipulation extends to other employees\' records')
b('Full integrity of system audit logs — forensic review needed')
b('Subject\'s formal explanation or defence')
b('Authorization history for subject\'s admin access')
b('Status of IC-1 disciplinary recommendations')

h2('Fraud Risk Rating')
body('HIGH', bold=True)
body('Clear evidence, long-term pattern, deliberate method, unique privileged access.')

h2('Classification')
b('Disciplinary Misconduct')
b('Breach of Trust')
b('Unauthorized System Use')
b('Attendance Policy Violation')

h2('Immediate Actions')
b('Forensic image ATLAS server')
b('Secure all CCTV archives')
b('Issue show-cause notice to subject')
b('Engage legal counsel')
b('Proceed to formal disciplinary hearing')

divider()
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
r = p.add_run('Knowledge & Skill (KS) School System  ·  Compliance & Risk Division  ·  Northern Operations Hub  ·  January 2026  ·  Confidential & Proprietary')
r.font.size  = Pt(8)
r.font.color.rgb = RGBColor(0x80, 0x80, 0x90)
r.italic = True

# ── Save ──────────────────────────────────────────────────────────────────────
doc.save('/home/user/KS324/Fraud_Assessment_Gamma.docx')
print('Done.')
