from docx import Document
from docx.shared import Pt, RGBColor, Inches, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

doc = Document()
for section in doc.sections:
    section.top_margin = Cm(2.0); section.bottom_margin = Cm(2.0)
    section.left_margin = Cm(2.5); section.right_margin = Cm(2.5)

def h1(text):
    p = doc.add_paragraph(text, style='Heading 1')
    p.paragraph_format.space_after = Pt(6); return p

def h2(text):
    p = doc.add_paragraph(text, style='Heading 2')
    p.paragraph_format.space_before = Pt(10); p.paragraph_format.space_after = Pt(4); return p

def body(text, bold=False, italic=False):
    p = doc.add_paragraph(text, style='Normal')
    p.paragraph_format.space_after = Pt(4)
    for r in p.runs: r.bold = bold; r.italic = italic
    return p

def b(text, prefix=None):
    p = doc.add_paragraph(style='List Bullet')
    p.paragraph_format.space_after = Pt(3)
    if prefix:
        r1 = p.add_run(prefix + ':  '); r1.bold = True
        p.add_run(text)
    else:
        p.add_run(text)
    return p

def nb(text, prefix=None):
    p = doc.add_paragraph(style='List Number')
    p.paragraph_format.space_after = Pt(3)
    if prefix:
        r1 = p.add_run(prefix + ':  '); r1.bold = True
        p.add_run(text)
    else:
        p.add_run(text)
    return p

def div():
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(2); p.paragraph_format.space_after = Pt(2)
    pPr = p._p.get_or_add_pPr()
    pBdr = OxmlElement('w:pBdr')
    bot = OxmlElement('w:bottom')
    bot.set(qn('w:val'),'single'); bot.set(qn('w:sz'),'4')
    bot.set(qn('w:space'),'1'); bot.set(qn('w:color'),'AAAAAA')
    pBdr.append(bot); pPr.append(pBdr)

def tbl(headers, rows, widths=None):
    t = doc.add_table(rows=1+len(rows), cols=len(headers))
    t.style = 'Table Grid'; t.autofit = False
    if widths:
        for i,w in enumerate(widths): t.columns[i].width = Cm(w)
    for i,h in enumerate(headers):
        c = t.cell(0,i)
        r = c.paragraphs[0].add_run(h); r.bold=True; r.font.size=Pt(9)
        tc=c._tc; tcPr=tc.get_or_add_tcPr()
        shd=OxmlElement('w:shd'); shd.set(qn('w:val'),'clear')
        shd.set(qn('w:color'),'auto'); shd.set(qn('w:fill'),'2C3E7A')
        tcPr.append(shd); r.font.color.rgb=RGBColor(0xFF,0xFF,0xFF)
    for ri,row in enumerate(rows):
        fill = 'F2F5FA' if ri%2==0 else 'FFFFFF'
        for ci,val in enumerate(row):
            c = t.cell(ri+1,ci)
            r = c.paragraphs[0].add_run(str(val)); r.font.size=Pt(8.5)
            tc=c._tc; tcPr=tc.get_or_add_tcPr()
            shd=OxmlElement('w:shd'); shd.set(qn('w:val'),'clear')
            shd.set(qn('w:color'),'auto'); shd.set(qn('w:fill'),fill)
            tcPr.append(shd)
    doc.add_paragraph().paragraph_format.space_after = Pt(4)

# ── COVER ─────────────────────────────────────────────────────────────────────
h1('Preliminary Fraud Assessment')
body('Attendance Record Manipulation — Systems Administrator', bold=True)
body('Knowledge & Skill (KS) School System  |  Compliance & Risk Division')
body('Northern Operations Hub (400)  |  January 2026')
div()
b('Mr. Shakeel', 'Subject'); b('47291', 'Employee ID'); b('Systems Administrator', 'Designation')
div()
body('7-Point Preliminary Fraud Assessment  ·  C&R Division Fact Finding Report', italic=True)

# ── SLIDE 1 ── SITUATION, RED FLAGS & HYPOTHESIS ──────────────────────────────
h1('Step 1 — Situation, Red Flags & Hypothesis')

h2('Key Statistics')
b('96 suspect entries — Jul 2024 to Nov 2025')
b('10 confirmed altered entries — Oct to Nov 2025')
b('17+ months of sustained anomalous pattern')
b('5 dates independently corroborated by CCTV footage')

h2('Situation')
body('The C&R Division at KS School System\'s Northern Operations Hub (400) detected anomalies in the ATLAS facial recognition attendance system. The Systems Administrator — system custodian — allegedly exploited admin access to back-date and alter his "Time In" entries, concealing late arrivals and absences.')

h2('Red Flags')
b('Auditor observed routine late arrivals and late departures, yet no corresponding leave deductions were recorded.', 'RF-1  |  SOMOTO (Direct Observation)')
b('96 "Time In" entries over 17 months all fall within seconds of the 09:00 threshold — statistically impossible by chance.', 'RF-2  |  Anomalous Pattern')

h2('Hypothesis A — Guilty')
body('Mr. Shakeel knowingly misused admin access to fabricate "Time In" records, concealing late arrivals to avoid salary deductions and disciplinary action — constituting payroll / time-and-attendance fraud.')

h2('Hypothesis B — Not Guilty')
b('System glitch caused missed morning scans; corrections made in good faith without knowing supervisor approval was needed.')
b('Subject believed late sittings entitled him to offset late arrivals informally, unaware of the formal policy and approval process.')

# ── SLIDE 2 ── LEGAL DESTINATION & CASE STRATEGY ─────────────────────────────
h1('Step 2 — Legal Destination & Case Strategy')

h2('Legal Destination — Internal Disciplinary Action')
body('Classified as an internal employment disciplinary matter. The subject breached the trust placed in his privileged role. A formal disciplinary proceeding under the organization\'s HR and employment policies is the appropriate legal destination.')

h2('Grounds for Disciplinary Action')
b('Unauthorized modification of attendance records using admin privileges', 'Misconduct')
b('Abuse of data custodian role', 'Breach of Trust')
b('Corrections made without supervisor authorization', 'Policy Violation')
b('Inaccurate records affecting payroll and leave calculations', 'Misrepresentation')

h2('Case Strategy')
b('Preserve evidence; secure system logs', 'Immediate')
b('Issue show-cause notice; obtain written explanation', 'Short-term')
b('Constitute inquiry committee; present findings', 'Formal Hearing')
b('Determine penalty based on intent and financial impact', 'Decision')
b('Recover improperly obtained salary/benefit amounts', 'Recovery')

h2('Key Open Questions')
b('Does the subject have a prior disciplinary record?')
b('Was he formally informed of the attendance correction policy?')
b('Was there any implicit management tolerance?')
b('Exact financial value of benefit improperly obtained?')
b('Did his line manager have awareness of the late arrivals?')

# ── SLIDE 3 ── SCHEME MECHANICS ──────────────────────────────────────────────
h1('Step 3 — Scheme Mechanics')

h2('Method A — Retroactive Creation')
body('No morning scan. At departure, subject punched a back-dated "Time In" of ≈08:59 via admin access.')
body('▶  8 confirmed instances — Oct 2025', bold=True)

h2('Method B — Overwriting a Late Entry')
body('Genuine late entry (e.g., 09:34 or 10:20) replaced with fabricated earlier timestamp via admin access.')
body('▶  2 confirmed instances — Oct 2025', bold=True)

h2('Method C — Cross-Day Back-Dating')
body('Previous day\'s absence not recorded. Next day, both days\' fabricated entries submitted together.')
body('▶  1 confirmed instance — Nov 2025', bold=True)

h2('Step-by-Step')
nb('Arrives late or absent — no morning facial scan.')
nb('Logs into ATLAS at end of day with admin credentials.')
nb('Enters fabricated "Time In" just before 09:00.')
nb('Report shows on-time arrival — late/absence hidden from HR.')
nb('Full salary maintained; deductions avoided.')

h2('Control Failures')
b('IT custodian could modify own records without independent approval.', 'No Segregation of Duties')
b('Back-dated entries triggered no automated flag or notification.', 'No Audit Alert')
b('Records overwritten with no secondary authorization required.', 'Unrestricted Admin Access')

# ── SLIDE 4 ── EVIDENCE COLLECTION & PROCEDURES ──────────────────────────────
h1('Step 4 — Evidence Collection & Procedures')

h2('Evidence Collected')
b('ATLAS attendance data — actual vs. altered entries, Oct–Nov 2025 (Annexures A–G)')
b('System audit logs — timestamps of modifications')
b('CCTV footage — 13, 16, 20, 21, 23 Oct & 3, 4 Nov 2025')
b('CCTV comparator — colleague times vs. ATLAS (~3–4 min system offset)')
b('Historical dataset — 96 instances Jul 2024–Nov 2025 (Annexure H)')
b('Staff interviews — verbal confirmations obtained')

h2('Evidence Still Required')
b('Full admin modification logs — who, what, when')
b('Authorization records for subject\'s admin privileges')
b('Payroll data for the full 17-month period')
b('HR policy on late deductions and thresholds')
b('CCTV review for remaining 85 unverified dates')
b('Forensic image of ATLAS server database')
b('Formal written statement from subject')

h2('Recommended Evidence Procedures')
tbl(
    ['#','Procedure','Purpose','Priority'],
    [('1','Forensic image of ATLAS database','Tamper-proof preservation','Immediate'),
     ('2','Extract full admin audit log','Who changed what and when','Immediate'),
     ('3','Secure CCTV archive','Prevent overwriting','Immediate'),
     ('4','Obtain payroll data Jul 2024–Nov 2025','Quantify financial benefit','Short-term'),
     ('5','CCTV review for all 96 flagged dates','Full dataset corroboration','Short-term'),
     ('6','Independent IT forensic review','Third-party validation','Short-term')],
    widths=[0.8,5.5,5.5,3.2]
)

# ── SLIDE 5 ── INTERVIEWS & STATEMENTS ───────────────────────────────────────
h1('Step 5 — Interviews & Statements')

h2('Interviews Conducted')
b('Administrative and IT staff at Northern Operations Hub')
b('Purpose: verify attendance discrepancies and system admin practices')
b('Verbal confirmations obtained where documentation was absent')
body('Mr. Shakeel has not yet provided a formal written statement responding to the specific findings in this report.', italic=True)

h2('Interviews Required')
tbl(
    ['Interviewee','Relevance'],
    [('Mr. Shakeel (47291)','Formal statement; right to respond'),
     ('IT Head / Supervisor','Admin access authorization'),
     ('HR Manager','Payroll and attendance policy'),
     ('Identified colleagues','Corroborate CCTV absence'),
     ('Hub Head / Line Manager','Workplace patterns; prior complaints')],
    widths=[6.0,9.0]
)

h2('Key Questions — Subject')
b('Were you authorized to modify your own attendance?')
b('Why do "Time In" entries appear at departure time?')
b('Why do 96 entries cluster at 08:59–09:00 over 17 months?')
b('Why are you absent from CCTV at your claimed arrival times?')

h2('Interview Best Practices')
b('Interview subject after all evidence is secured')
b('Use signed, witnessed statement format; present specific dates')
b('Allow subject to provide alternative explanation')
b('Consult legal counsel before formal interview')

# ── SLIDE 6 ── EVIDENCE ANALYSIS & QUANTIFICATION ────────────────────────────
h1('Step 6 — Evidence Analysis & Quantification')

h2('Confirmed Manipulation Cases — Oct–Nov 2025')
tbl(
    ['Date','Raw Time In','Fabricated Entry','CCTV'],
    [('02-Oct-25','18:02:45','08:59:13','—'),
     ('03-Oct-25','09:34:04','08:50:18','—'),
     ('07-Oct-25','20:56:56','08:59:41','—'),
     ('09-Oct-25','19:07:47','09:00:09','—'),
     ('13-Oct-25','18:02:07','09:01:01','Yes'),
     ('16-Oct-25','22:49:31','08:55:27','Yes'),
     ('20-Oct-25','Marked at Time Out','08:59:41','Yes'),
     ('21-Oct-25','18:59:02','08:58:17','Yes'),
     ('23-Oct-25','18:33:03','08:55:52','Yes'),
     ('03–04 Nov-25','17:57:23 / None','Backdated on 04-Nov','Yes')],
    widths=[3.0,4.0,4.0,4.0]
)

h2('Financial Quantification')
tbl(
    ['Head','Basis','Amount'],
    [('Leave Encashment','Recoverable amount based on entitled leave encashment','Rs. 70,000'),
     ('Late Arrival Deduction','Excessive late arrivals treated as Leave Without Pay (LWP)','Approx. Rs. 150,000'),
     ('Total Estimated Recovery','','Approx. Rs. 220,000')],
    widths=[4.5,7.0,3.5]
)

h2('Pattern Significance')
body('96 entries within a 2-minute window over 17 months cannot occur naturally — confirming deliberate, systematic back-dating targeting the exact 09:00 reporting threshold.')

# ── SLIDE 7 ── CASE FILE, EXPERT OUTPUT & RECOVERY ───────────────────────────
h1('Step 7 — Case File, Expert Output & Recovery Support')

h2('Case File Contents')
b('Fact Finding Report — C&R Division, January 2026')
b('Annexures A–G: Actual vs. altered records Oct–Nov 2025')
b('Annexure H: 96-instance historical pattern Jul 2024–Nov 2025')
b('CCTV footage for 5 verified dates')
b('Interview notes and verbal confirmations')
b('IC-1 recommended decisions')

h2('Expert Output Required')
b('IT Forensic Expert: Audit trail integrity; full scope of manipulation', '')
b('Payroll/HR Analyst: Quantify benefit across 17-month period')
b('Legal Counsel: Draft disciplinary charges; recovery advice')
b('ATLAS Vendor: Confirm back-dating capability and log completeness')

h2('Action Plan')
b('Forensic image ATLAS; secure CCTV archives', 'Immediate')
b('CCTV review (96 dates); IT forensic report; payroll data', 'Weeks 2–4')
b('Disciplinary hearing; quantify loss; issue charges', 'Months 2–3')
b('Review other staff records; IT control remediation', 'Parallel')
b('Policy update; recovery action; system controls deployed', 'Close-Out')

h2('Recovery & Risk')
b('Financial recovery — approx. Rs. 220,000 via employment contract')
b('IC-1 disciplinary recommendations implemented through HR')
b('Segregation of duties; dual-approval for admin edits; automated audit alerts')
body('Risk Rating: HIGH — Clear evidence, long-term pattern, deliberate method, unique privileged access.', bold=True)

# ── CLOSING ── OVERALL ASSESSMENT & RECOMMENDATIONS ──────────────────────────
h1('Overall Assessment & Recommendations')

h2('Assessment')
body('Further Investigation — Strongly Recommended', bold=True)
b('Preliminary findings indicate a sustained pattern of attendance record manipulation through misuse of administrative access rights.')
b('A show-cause notice was issued to Mr. Shakeel. His submitted response reflected acceptance of the identified irregularities.')
b('A detailed forensic audit is recommended to substantiate findings, identify full extent of manipulation, evaluate possible involvement of other parties, and quantify complete financial impact.')

h2('What Remains Unclear')
b('Full extent of manipulation across 17-month dataset')
b('Possible involvement of other parties')
b('Complete financial impact beyond the estimated Rs. 220,000')
b('Full integrity of system audit logs — forensic review pending')
b('Authorization history for subject\'s admin access')

h2('Future Control & Governance Recommendations')
b('Implement a complete approval workflow for attendance adjustments with documented justification and digital approval trail.')
b('Strengthen approval hierarchy by restricting back-date access and enforcing multi-level authorization for attendance amendments.')
b('Maintain detailed audit trails for all attendance edits — including user ID, date, time, and change history.')
b('Introduce automated exception reports for unusual attendance patterns and repeated manual overrides.')
b('Segregate system administration rights from attendance approval authority to minimize misuse of power.')
b('Conduct periodic compliance reviews and independent audits of attendance system activities.')

div()
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
r = p.add_run('Knowledge & Skill (KS) School System  ·  Compliance & Risk Division  ·  Northern Operations Hub  ·  January 2026  ·  Confidential & Proprietary')
r.font.size = Pt(8); r.italic = True; r.font.color.rgb = RGBColor(0x80,0x80,0x90)

doc.save('/home/user/KS324/Fraud_Assessment_Gamma.docx')
print('Done.')
