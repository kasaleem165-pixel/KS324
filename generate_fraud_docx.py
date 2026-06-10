from docx import Document
from docx.shared import Pt, RGBColor, Inches, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
import copy

doc = Document()

# ── Page margins ──────────────────────────────────────────────────────────────
for section in doc.sections:
    section.top_margin    = Cm(1.8)
    section.bottom_margin = Cm(1.8)
    section.left_margin   = Cm(2.2)
    section.right_margin  = Cm(2.2)

# ── Colour palette ────────────────────────────────────────────────────────────
C_DARK   = RGBColor(0x0d, 0x1b, 0x3e)   # deep navy (header bg)
C_MID    = RGBColor(0x1a, 0x2f, 0x5e)   # mid navy
C_WHITE  = RGBColor(0xFF, 0xFF, 0xFF)
C_LGREY  = RGBColor(0xF2, 0xF5, 0xFA)   # light bg rows
C_MGREY  = RGBColor(0xD8, 0xE2, 0xF0)   # border / header row
C_TEXT   = RGBColor(0x1a, 0x1a, 0x2e)   # body text

C_BLUE   = RGBColor(0x1e, 0x4a, 0x8a)
C_PURPLE = RGBColor(0x3a, 0x1e, 0x6a)
C_GREEN  = RGBColor(0x1e, 0x5a, 0x2a)
C_ORANGE = RGBColor(0x7a, 0x46, 0x00)
C_LIME   = RGBColor(0x3a, 0x5a, 0x00)
C_PINK   = RGBColor(0x6a, 0x1a, 0x4a)
C_CYAN   = RGBColor(0x1a, 0x3a, 0x5a)

C_RED_LIGHT   = RGBColor(0xFF, 0xEB, 0xEB)
C_GREEN_LIGHT = RGBColor(0xEB, 0xFF, 0xF0)

# ── Helper: set paragraph/cell background ─────────────────────────────────────
def set_cell_bg(cell, rgb: RGBColor):
    tc   = cell._tc
    tcPr = tc.get_or_add_tcPr()
    shd  = OxmlElement('w:shd')
    shd.set(qn('w:val'),   'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'),  str(rgb))
    tcPr.append(shd)

def set_cell_border(cell, color='AABBD0', sz=4):
    tc   = cell._tc
    tcPr = tc.get_or_add_tcPr()
    tcBorders = OxmlElement('w:tcBorders')
    for side in ('top','left','bottom','right'):
        b = OxmlElement(f'w:{side}')
        b.set(qn('w:val'),   'single')
        b.set(qn('w:sz'),    str(sz))
        b.set(qn('w:space'), '0')
        b.set(qn('w:color'), color)
        tcBorders.append(b)
    tcPr.append(tcBorders)

def no_border_cell(cell):
    tc   = cell._tc
    tcPr = tc.get_or_add_tcPr()
    tcBorders = OxmlElement('w:tcBorders')
    for side in ('top','left','bottom','right','insideH','insideV'):
        b = OxmlElement(f'w:{side}')
        b.set(qn('w:val'),   'none')
        b.set(qn('w:sz'),    '0')
        b.set(qn('w:space'), '0')
        b.set(qn('w:color'), 'auto')
        tcBorders.append(b)
    tcPr.append(tcBorders)

# ── Helper: paragraph styles ──────────────────────────────────────────────────
def para(text, bold=False, size=10, color=C_TEXT, align=WD_ALIGN_PARAGRAPH.LEFT, space_before=0, space_after=4):
    p = doc.add_paragraph()
    p.alignment = align
    p.paragraph_format.space_before = Pt(space_before)
    p.paragraph_format.space_after  = Pt(space_after)
    run = p.add_run(text)
    run.bold       = bold
    run.font.size  = Pt(size)
    run.font.color.rgb = color
    return p

def heading(text, level_color=C_DARK, size=13):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.space_after  = Pt(4)
    run = p.add_run(text)
    run.bold           = True
    run.font.size      = Pt(size)
    run.font.color.rgb = level_color
    return p

def bullet(text, bold_prefix=None, color=C_TEXT, size=9.5):
    p = doc.add_paragraph(style='List Bullet')
    p.paragraph_format.space_after  = Pt(3)
    p.paragraph_format.left_indent  = Inches(0.25)
    if bold_prefix:
        r1 = p.add_run(bold_prefix + '  ')
        r1.bold           = True
        r1.font.size      = Pt(size)
        r1.font.color.rgb = color
        r2 = p.add_run(text)
        r2.font.size      = Pt(size)
        r2.font.color.rgb = C_TEXT
    else:
        r = p.add_run(text)
        r.font.size      = Pt(size)
        r.font.color.rgb = color
    return p

def divider():
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after  = Pt(2)
    pPr  = p._p.get_or_add_pPr()
    pBdr = OxmlElement('w:pBdr')
    bot  = OxmlElement('w:bottom')
    bot.set(qn('w:val'),   'single')
    bot.set(qn('w:sz'),    '4')
    bot.set(qn('w:space'), '1')
    bot.set(qn('w:color'), 'AABBD0')
    pBdr.append(bot)
    pPr.append(pBdr)
    return p

def page_break():
    doc.add_page_break()

# ── Helper: section header bar (coloured) ─────────────────────────────────────
def section_header(step_num, step_label, title, bg=C_DARK):
    t = doc.add_table(rows=1, cols=2)
    t.alignment = WD_TABLE_ALIGNMENT.LEFT
    t.autofit   = False
    t.columns[0].width = Cm(1.4)
    t.columns[1].width = Cm(15.5)
    # number bubble
    c0 = t.cell(0, 0)
    set_cell_bg(c0, bg)
    no_border_cell(c0)
    c0.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
    p0 = c0.paragraphs[0]
    p0.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r0 = p0.add_run(str(step_num))
    r0.bold = True; r0.font.size = Pt(16); r0.font.color.rgb = C_WHITE
    # label + title
    c1 = t.cell(0, 1)
    set_cell_bg(c1, bg)
    no_border_cell(c1)
    c1.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
    p1a = c1.paragraphs[0]
    p1a.alignment = WD_ALIGN_PARAGRAPH.LEFT
    r1a = p1a.add_run(step_label.upper())
    r1a.font.size = Pt(8); r1a.font.color.rgb = C_MGREY
    p1b = c1.add_paragraph()
    r1b = p1b.add_run(title)
    r1b.bold = True; r1b.font.size = Pt(14); r1b.font.color.rgb = C_WHITE
    doc.add_paragraph().paragraph_format.space_after = Pt(4)

# ── Helper: box card ──────────────────────────────────────────────────────────
def card_start(title, bg=C_LGREY, title_color=C_DARK):
    t = doc.add_table(rows=1, cols=1)
    t.alignment = WD_TABLE_ALIGNMENT.LEFT
    t.autofit   = False
    t.columns[0].width = Cm(17)
    c = t.cell(0, 0)
    set_cell_bg(c, bg)
    set_cell_border(c, 'AABBD0', 6)
    p = c.paragraphs[0]
    r = p.add_run(title)
    r.bold = True; r.font.size = Pt(10); r.font.color.rgb = title_color
    p.paragraph_format.space_after = Pt(4)
    return c

def card_bullet(cell, text, bold_prefix=None, color=C_TEXT):
    p = cell.add_paragraph(style='List Bullet')
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.left_indent = Inches(0.2)
    if bold_prefix:
        r1 = p.add_run(bold_prefix + '  ')
        r1.bold = True; r1.font.size = Pt(9); r1.font.color.rgb = color
        r2 = p.add_run(text)
        r2.font.size = Pt(9); r2.font.color.rgb = C_TEXT
    else:
        r = p.add_run(text)
        r.font.size = Pt(9); r.font.color.rgb = C_TEXT

def card_para(cell, text, color=C_TEXT, size=9, bold=False):
    p = cell.add_paragraph()
    p.paragraph_format.space_after = Pt(3)
    r = p.add_run(text)
    r.font.size = Pt(size); r.font.color.rgb = color; r.bold = bold

def spacer(n=1):
    for _ in range(n):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after  = Pt(3)

# ═════════════════════════════════════════════════════════════════════════════
# COVER PAGE
# ═════════════════════════════════════════════════════════════════════════════
t = doc.add_table(rows=1, cols=1)
t.autofit = False
t.columns[0].width = Cm(17)
c = t.cell(0, 0)
set_cell_bg(c, C_DARK)
no_border_cell(c)

p = c.paragraphs[0]
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
r = p.add_run('KNOWLEDGE & SKILL (KS) SCHOOL SYSTEM')
r.bold = True; r.font.size = Pt(9); r.font.color.rgb = C_MGREY

p2 = c.add_paragraph()
p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
r2 = p2.add_run('Compliance & Risk Division')
r2.font.size = Pt(9); r2.font.color.rgb = C_MGREY

c.add_paragraph()

p3 = c.add_paragraph()
p3.alignment = WD_ALIGN_PARAGRAPH.CENTER
r3 = p3.add_run('PRELIMINARY FRAUD ASSESSMENT')
r3.bold = True; r3.font.size = Pt(22); r3.font.color.rgb = C_WHITE

p4 = c.add_paragraph()
p4.alignment = WD_ALIGN_PARAGRAPH.CENTER
r4 = p4.add_run('Attendance Record Manipulation — Systems Administrator')
r4.font.size = Pt(12); r4.font.color.rgb = C_MGREY

c.add_paragraph()

p5 = c.add_paragraph()
p5.alignment = WD_ALIGN_PARAGRAPH.CENTER
r5 = p5.add_run('Northern Operations Hub (400)  |  January 2026')
r5.font.size = Pt(10); r5.font.color.rgb = C_MGREY

c.add_paragraph()

meta_lines = [
    ('Subject:',       'Mr. Shakeel'),
    ('Employee ID:',   '47291'),
    ('Designation:',   'Systems Administrator'),
]
for lbl, val in meta_lines:
    pm = c.add_paragraph()
    pm.alignment = WD_ALIGN_PARAGRAPH.CENTER
    rl = pm.add_run(lbl + '  ')
    rl.bold = True; rl.font.size = Pt(9); rl.font.color.rgb = C_MGREY
    rv = pm.add_run(val)
    rv.font.size = Pt(9); rv.font.color.rgb = C_WHITE

c.add_paragraph()

tags = ['Confidential', 'Preliminary Assessment', 'Attendance Fraud', 'Privilege Misuse', 'Data Manipulation']
pt = c.add_paragraph()
pt.alignment = WD_ALIGN_PARAGRAPH.CENTER
for tag in tags:
    rt = pt.add_run(f'  [{tag}]  ')
    rt.font.size = Pt(8); rt.font.color.rgb = C_MGREY

c.add_paragraph()

pf = c.add_paragraph()
pf.alignment = WD_ALIGN_PARAGRAPH.CENTER
rf = pf.add_run('7-Point Preliminary Fraud Assessment  ·  Fact Finding Report — C&R Division')
rf.font.size = Pt(8); rf.font.color.rgb = RGBColor(0x60, 0x70, 0x80)

spacer(2)

# ═════════════════════════════════════════════════════════════════════════════
# SLIDE 1 — SITUATION, RED FLAGS & HYPOTHESIS
# ═════════════════════════════════════════════════════════════════════════════
page_break()
section_header(1, 'Step 1 of 7', 'Situation, Red Flags & Hypothesis', C_BLUE)

# Stat row
st = doc.add_table(rows=1, cols=4)
st.alignment = WD_TABLE_ALIGNMENT.LEFT
st.autofit   = False
for i, (num, lbl) in enumerate([('96','Suspect entries Jul 2024–Nov 2025'),
                                  ('10','Confirmed altered entries Oct–Nov 2025'),
                                  ('17+','Months of sustained pattern'),
                                  ('5', 'Dates CCTV-corroborated')]):
    st.columns[i].width = Cm(4.25)
    c = st.cell(0, i)
    set_cell_bg(c, C_LGREY)
    set_cell_border(c, 'AABBD0', 4)
    c.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
    pn = c.paragraphs[0]
    pn.alignment = WD_ALIGN_PARAGRAPH.CENTER
    rn = pn.add_run(num)
    rn.bold = True; rn.font.size = Pt(22); rn.font.color.rgb = C_BLUE
    pl = c.add_paragraph()
    pl.alignment = WD_ALIGN_PARAGRAPH.CENTER
    rl = pl.add_run(lbl)
    rl.font.size = Pt(8); rl.font.color.rgb = RGBColor(0x50, 0x60, 0x80)
spacer()

# Situation
c = card_start('Situation', C_LGREY, C_BLUE)
card_para(c, 'The C&R Division at KS School System\'s Northern Operations Hub (400) detected anomalies in the facial recognition attendance system (ATLAS). The Systems Administrator — custodian of the system — allegedly exploited admin access to back-date and alter his own "Time In" entries to conceal late arrivals and absences.')
spacer()

# Red Flags
c = card_start('Red Flags', C_LGREY, C_BLUE)
card_bullet(c, 'Auditor observed Mr. Shakeel routinely arriving late and leaving late, yet his leave balance reflected no corresponding deductions for late arrivals.', 'RF-1  |  Direct Observation (SOMOTO):', C_BLUE)
card_bullet(c, '96 instances over 17 months (Jul 2024–Nov 2025) where "Time In" was recorded within seconds of the 09:00 threshold — a clustering too precise to be natural and indicative of deliberate manipulation.', 'RF-2  |  Anomalous Attendance Pattern:', C_BLUE)
spacer()

# Hypothesis — two-column table
heading('Hypothesis', C_BLUE, 11)
ht = doc.add_table(rows=1, cols=2)
ht.alignment = WD_TABLE_ALIGNMENT.LEFT
ht.autofit   = False
ht.columns[0].width = Cm(8.4)
ht.columns[1].width = Cm(8.4)

ca = ht.cell(0, 0)
set_cell_bg(ca, RGBColor(0xFF, 0xEB, 0xEB))
set_cell_border(ca, 'F08080', 6)
pa = ca.paragraphs[0]
ra = pa.add_run('⚠  HYPOTHESIS A — GUILTY')
ra.bold = True; ra.font.size = Pt(8); ra.font.color.rgb = RGBColor(0xC0, 0x30, 0x30)
card_para(ca, 'Mr. Shakeel knowingly misused admin access to fabricate and overwrite "Time In" records, concealing habitual late arrivals to avoid salary deductions and disciplinary action — constituting payroll / time-and-attendance fraud.', RGBColor(0x60, 0x10, 0x10), 9)

cb = ht.cell(0, 1)
set_cell_bg(cb, RGBColor(0xEB, 0xFF, 0xF0))
set_cell_border(cb, '50C878', 6)
pb = cb.paragraphs[0]
rb = pb.add_run('✓  HYPOTHESIS B — NOT GUILTY')
rb.bold = True; rb.font.size = Pt(8); rb.font.color.rgb = RGBColor(0x10, 0x70, 0x30)
card_bullet(cb, 'System glitch caused missed morning scans; subject corrected records in good faith, unaware that supervisor approval was required.', None, RGBColor(0x10, 0x60, 0x20))
card_bullet(cb, 'Subject believed his routine late sittings entitled him to offset late arrivals informally, without knowledge of the formal policy or approval process for such adjustments.', None, RGBColor(0x10, 0x60, 0x20))
spacer()

# Why It Matters
c = card_start('Why It Matters', C_LGREY, C_BLUE)
for pt_text in ['Undermines integrity of the organization\'s attendance controls',
                'Financial loss through unearned pay and avoided deductions',
                'Abuse of privileged IT role and position of trust',
                '17-month pattern confirms willful, sustained conduct',
                'Same privileges could be used to manipulate other employees\' records']:
    card_bullet(c, pt_text)

# ═════════════════════════════════════════════════════════════════════════════
# SLIDE 2 — LEGAL DESTINATION & CASE STRATEGY
# ═════════════════════════════════════════════════════════════════════════════
page_break()
section_header(2, 'Step 2 of 7', 'Legal Destination & Case Strategy', C_PURPLE)

c = card_start('Legal Destination — Disciplinary Action', C_LGREY, C_PURPLE)
card_para(c, 'This case is classified as an internal employment disciplinary matter. The subject holds a position of trust as the custodian of the attendance system, and the evidence indicates a breach of that trust through unauthorized use of admin privileges to alter official records. The appropriate legal destination is a formal disciplinary proceeding under the organization\'s HR and employment policies.')
spacer()

# Three-column: Grounds / Strategy / Open Questions
lt = doc.add_table(rows=1, cols=3)
lt.alignment = WD_TABLE_ALIGNMENT.LEFT
lt.autofit   = False
for i in range(3): lt.columns[i].width = Cm(5.6)

cc = [lt.cell(0, i) for i in range(3)]
titles = ['Grounds for Disciplinary Action', 'Disciplinary Case Strategy', 'Key Open Questions']
for ci, t_color in zip(cc, [C_PURPLE]*3):
    set_cell_bg(ci, C_LGREY)
    set_cell_border(ci, 'B07EF0', 6)

p0 = cc[0].paragraphs[0]; r0 = p0.add_run(titles[0]); r0.bold=True; r0.font.size=Pt(9); r0.font.color.rgb=C_PURPLE
for bp, bt in [('Misconduct:','Unauthorized modification of attendance records using admin privileges'),
               ('Breach of Trust:','Abuse of privileged role entrusted to safeguard data integrity'),
               ('Policy Violation:','Bypassing approved correction process without supervisor authorization'),
               ('Misrepresentation:','Inaccurate records affecting payroll and leave calculations')]:
    card_bullet(cc[0], bt, bp, C_PURPLE)

p1 = cc[1].paragraphs[0]; r1 = p1.add_run(titles[1]); r1.bold=True; r1.font.size=Pt(9); r1.font.color.rgb=C_PURPLE
for bp, bt in [('Immediate:','Preserve all digital evidence and secure system logs'),
               ('Short-term:','Issue show-cause notice; obtain subject\'s written explanation'),
               ('Formal Hearing:','Constitute inquiry committee; present findings and evidence'),
               ('Decision:','Determine penalty based on intent, duration, and financial impact'),
               ('Recovery:','Recover salary/benefit amounts confirmed as improperly obtained')]:
    card_bullet(cc[1], bt, bp, C_PURPLE)

p2 = cc[2].paragraphs[0]; r2 = p2.add_run(titles[2]); r2.bold=True; r2.font.size=Pt(9); r2.font.color.rgb=C_PURPLE
for bt in ['Does the subject have a prior disciplinary record?',
           'Was he formally informed of the attendance correction policy?',
           'Was there implicit management tolerance of such adjustments?',
           'What is the exact financial value of benefit improperly obtained?',
           'Did his line manager have awareness of the late arrivals?']:
    card_bullet(cc[2], bt)
spacer()

c = card_start('Classification', C_LGREY, C_PURPLE)
card_para(c, '[Disciplinary Misconduct]  [Breach of Trust]  [Unauthorized System Use]  [Attendance Policy Violation]', C_PURPLE, 9, True)

# ═════════════════════════════════════════════════════════════════════════════
# SLIDE 3 — SCHEME MECHANICS
# ═════════════════════════════════════════════════════════════════════════════
page_break()
section_header(3, 'Step 3 of 7', 'Scheme Mechanics', C_GREEN)

# Methods — 3 columns
mt = doc.add_table(rows=1, cols=3)
mt.alignment = WD_TABLE_ALIGNMENT.LEFT
mt.autofit   = False
for i in range(3): mt.columns[i].width = Cm(5.6)
methods = [
    ('Method A — Retroactive Creation',
     'No "Time In" recorded in the morning. At departure, subject punched a back-dated "Time In" of ≈08:59–09:00 using admin access.',
     '8 instances — Oct 2025'),
    ('Method B — Overwriting Late Entry',
     'A genuine late "Time In" existed (e.g., 09:34 or 10:20). Subject replaced it with an earlier fabricated timestamp (e.g., 08:50) via admin access.',
     '2 instances — 3 & 24 Oct 2025'),
    ('Method C — Cross-Day Back-Dating',
     'Previous day\'s attendance not recorded. On the next day, both days\' fabricated entries were submitted together.',
     '1 instance — 3 & 4 Nov 2025'),
]
for i, (title, body, tag) in enumerate(methods):
    c = mt.cell(0, i)
    set_cell_bg(c, C_LGREY)
    set_cell_border(c, '7EF0A0', 6)
    pt = c.paragraphs[0]; rt = pt.add_run(title); rt.bold=True; rt.font.size=Pt(9); rt.font.color.rgb=C_GREEN
    card_para(c, body)
    card_para(c, f'▶ {tag}', RGBColor(0xC0, 0x30, 0x30), 8, True)
spacer()

# Step-by-step
c = card_start('How the Scheme Operated — Step by Step', C_LGREY, C_GREEN)
steps = [
    ('Step 1', 'Arrives late or absent — no morning facial scan recorded.'),
    ('Step 2', 'Logs into ATLAS at end of day with admin credentials.'),
    ('Step 3', 'Enters or replaces "Time In" with a fabricated timestamp just before 09:00.'),
    ('Step 4', 'Report shows on-time arrival. Late/absence hidden from HR and payroll.'),
    ('Step 5', 'Full salary maintained. Deductions and penalties avoided.'),
]
for s, t in steps:
    card_bullet(c, t, s, C_GREEN)
spacer()

# Control Failures
ct = doc.add_table(rows=1, cols=3)
ct.alignment = WD_TABLE_ALIGNMENT.LEFT
ct.autofit   = False
for i in range(3): ct.columns[i].width = Cm(5.6)
failures = [
    ('No Segregation of Duties', 'IT custodian could modify their own records without independent approval.'),
    ('No Audit Alert',           'Back-dated entries triggered no automated flag or supervisor notification.'),
    ('Unrestricted Admin Access','Records could be overwritten with no secondary authorization required.'),
]
for i, (title, body) in enumerate(failures):
    c = ct.cell(0, i)
    set_cell_bg(c, RGBColor(0xFF, 0xEB, 0xEB))
    set_cell_border(c, 'F08080', 6)
    pt = c.paragraphs[0]; rt = pt.add_run(f'⚠ {title}'); rt.bold=True; rt.font.size=Pt(9); rt.font.color.rgb=RGBColor(0xC0,0x30,0x30)
    card_para(c, body, RGBColor(0x60,0x10,0x10))

# ═════════════════════════════════════════════════════════════════════════════
# SLIDE 4 — EVIDENCE COLLECTION & PROCEDURES
# ═════════════════════════════════════════════════════════════════════════════
page_break()
section_header(4, 'Step 4 of 7', 'Evidence Collection & Procedures', C_ORANGE)

et = doc.add_table(rows=1, cols=2)
et.alignment = WD_TABLE_ALIGNMENT.LEFT
et.autofit   = False
et.columns[0].width = Cm(8.4)
et.columns[1].width = Cm(8.4)

ce = et.cell(0, 0)
set_cell_bg(ce, C_LGREY); set_cell_border(ce, 'F0C07E', 6)
pe = ce.paragraphs[0]; re = pe.add_run('Evidence Collected'); re.bold=True; re.font.size=Pt(10); re.font.color.rgb=C_ORANGE
for bp, bt in [('ATLAS Attendance Data:','Actual vs. altered "Time In" records Oct–Nov 2025 (Annexures A–G)'),
               ('System Audit Logs:',    'Timestamps of back-dated entry creation/modification'),
               ('CCTV Footage:',         'Morning arrival footage for 13, 16, 20, 21, 23 Oct and 3, 4 Nov 2025'),
               ('CCTV Comparator:',      'Colleague arrival times vs. ATLAS to validate ~3–4 min system offset'),
               ('Historical Data:',      '96-instance dataset Jul 2024–Nov 2025 (Annexure H)'),
               ('Staff Interviews:',     'Verbal confirmations from admin and IT staff')]:
    card_bullet(ce, bt, bp, C_ORANGE)

cf = et.cell(0, 1)
set_cell_bg(cf, C_LGREY); set_cell_border(cf, 'F0C07E', 6)
pf2 = cf.paragraphs[0]; rf2 = pf2.add_run('Evidence Still Required'); rf2.bold=True; rf2.font.size=Pt(10); rf2.font.color.rgb=C_ORANGE
for bt in ['Full admin modification logs (who changed what, and when)',
           'Authorization records for subject\'s admin privileges',
           'Payroll data for the full 17-month period',
           'HR policy on late attendance deductions and thresholds',
           'CCTV review for remaining 85 unverified historical dates',
           'Forensic image of ATLAS server database',
           'Formal written statement from subject']:
    card_bullet(cf, bt)
spacer()

# Procedures table
heading('Recommended Evidence Procedures', C_ORANGE, 11)
pt_tbl = doc.add_table(rows=9, cols=4)
pt_tbl.alignment = WD_TABLE_ALIGNMENT.LEFT
pt_tbl.style = 'Table Grid'
pt_tbl.autofit = False
widths = [Cm(0.8), Cm(6.5), Cm(5.5), Cm(4.0)]
for i, w in enumerate(widths): pt_tbl.columns[i].width = w
hdrs = ['#', 'Procedure', 'Purpose', 'Priority']
for i, h in enumerate(hdrs):
    c = pt_tbl.cell(0, i); set_cell_bg(c, C_DARK)
    r = c.paragraphs[0].add_run(h); r.bold=True; r.font.size=Pt(9); r.font.color.rgb=C_WHITE
rows_data = [
    ('1','Forensic imaging of ATLAS server database','Preserve tamper-proof evidence','Immediate'),
    ('2','Extract full system audit log','Establish who changed what and when','Immediate'),
    ('3','Secure CCTV archive for full period','Prevent overwriting of recordings','Immediate'),
    ('4','Obtain payroll data Jul 2024–Nov 2025','Quantify financial benefit obtained','Short-term'),
    ('5','CCTV review for all 96 flagged dates','Corroborate manipulation across full dataset','Short-term'),
    ('6','Independent IT forensic expert review','Third-party audit trail validation','Short-term'),
    ('7','HR file review for prior warnings','Establish recurrence and prior knowledge','Medium-term'),
    ('8','Formal written statement from subject','Document subject\'s explanation or defence','Medium-term'),
]
for ri, row in enumerate(rows_data, 1):
    bg = C_LGREY if ri % 2 == 0 else C_WHITE
    for ci, val in enumerate(row):
        c = pt_tbl.cell(ri, ci)
        set_cell_bg(c, bg)
        r = c.paragraphs[0].add_run(val); r.font.size = Pt(8.5); r.font.color.rgb = C_TEXT
        if ci == 3:
            colors = {'Immediate': RGBColor(0xC0,0x30,0x30), 'Short-term': RGBColor(0xA0,0x70,0x00), 'Medium-term': RGBColor(0x10,0x70,0x30)}
            r.bold = True; r.font.color.rgb = colors.get(val, C_TEXT)

# ═════════════════════════════════════════════════════════════════════════════
# SLIDE 5 — INTERVIEWS & STATEMENTS
# ═════════════════════════════════════════════════════════════════════════════
page_break()
section_header(5, 'Step 5 of 7', 'Interviews & Statements', C_LIME)

it = doc.add_table(rows=1, cols=2)
it.alignment = WD_TABLE_ALIGNMENT.LEFT
it.autofit   = False
it.columns[0].width = Cm(8.4)
it.columns[1].width = Cm(8.4)

ci1 = it.cell(0, 0)
set_cell_bg(ci1, C_LGREY); set_cell_border(ci1, 'C0F07E', 6)
pi1 = ci1.paragraphs[0]; ri1 = pi1.add_run('Interviews Conducted'); ri1.bold=True; ri1.font.size=Pt(10); ri1.font.color.rgb=C_LIME
for bt in ['Discussions held with administrative and IT staff at Northern Operations Hub',
           'Purpose: establish facts on attendance discrepancies and system admin practices',
           'Verbal confirmations obtained where documentation was absent',
           'Statement details maintained in the case file']:
    card_bullet(ci1, bt)
p_lim = ci1.add_paragraph()
p_lim.paragraph_format.space_before = Pt(6)
r_lim = p_lim.add_run('Mr. Shakeel has not yet provided a formal written statement responding to the specific findings in this report.')
r_lim.font.size = Pt(8.5); r_lim.italic = True; r_lim.font.color.rgb = RGBColor(0x50, 0x70, 0x30)

ci2 = it.cell(0, 1)
set_cell_bg(ci2, C_LGREY); set_cell_border(ci2, 'C0F07E', 6)
pi2 = ci2.paragraphs[0]; ri2 = pi2.add_run('Interviews Required (Next Phase)'); ri2.bold=True; ri2.font.size=Pt(10); ri2.font.color.rgb=C_LIME

int_tbl = ci2.add_table(rows=7, cols=2)
int_tbl.autofit = False
int_tbl.columns[0].width = Cm(3.8)
int_tbl.columns[1].width = Cm(4.2)
int_hdrs = [('Interviewee', 'Relevance')]
int_rows = [
    ('Mr. Shakeel (47291)',       'Subject — formal statement, right to respond'),
    ('IT Head / Supervisor',      'Admin access authorization; awareness of edits'),
    ('HR Manager',                'Payroll processing; attendance discrepancy awareness'),
    ('CCTV-identified colleagues','Corroborate subject absence on specific dates'),
    ('ATLAS Vendor / IT Provider','System back-dating capability; log integrity'),
    ('Hub Head / Line Manager',   'Workplace patterns; prior complaints'),
]
for ri2_idx, (name, rel) in enumerate(int_hdrs + int_rows):
    bg = C_DARK if ri2_idx == 0 else (C_LGREY if ri2_idx % 2 == 0 else C_WHITE)
    tc = int_tbl.cell(ri2_idx, 0); set_cell_bg(tc, bg)
    tr = int_tbl.cell(ri2_idx, 1); set_cell_bg(tr, bg)
    rc = tc.paragraphs[0].add_run(name)
    rc.font.size = Pt(8); rc.font.color.rgb = C_WHITE if ri2_idx == 0 else C_TEXT; rc.bold = (ri2_idx == 0)
    rr = tr.paragraphs[0].add_run(rel)
    rr.font.size = Pt(8); rr.font.color.rgb = C_WHITE if ri2_idx == 0 else C_TEXT; rr.bold = (ri2_idx == 0)
spacer()

# Three question cards
qt = doc.add_table(rows=1, cols=3)
qt.alignment = WD_TABLE_ALIGNMENT.LEFT
qt.autofit   = False
for i in range(3): qt.columns[i].width = Cm(5.6)

q_data = [
    ('Key Questions — Subject', [
        'Were you authorized to modify your own attendance?',
        'Why do "Time In" entries appear at departure time?',
        'Why do 96 entries cluster at exactly 08:59–09:00 over 17 months?',
        'Why are you absent from CCTV at your claimed arrival times?',
        'Who else knew about your admin access capabilities?',
    ]),
    ('Key Questions — IT / System', [
        'Who granted admin access and under what policy?',
        'Is there a policy governing attendance record modification?',
        'Are modifications separately logged with a full audit trail?',
        'Has anyone else used admin access to alter records?',
    ]),
    ('Interview Best Practices', [
        'Interview subject only after all documentary evidence is secured',
        'Use signed, witnessed statement format',
        'Present specific dates for direct response',
        'Allow subject to provide alternative explanation',
        'Retain audio/transcripts in case file',
        'Consult legal counsel before formal subject interview',
    ]),
]
for i, (title, bullets) in enumerate(q_data):
    c = qt.cell(0, i)
    set_cell_bg(c, C_LGREY); set_cell_border(c, 'C0F07E', 6)
    pt2 = c.paragraphs[0]; rt2 = pt2.add_run(title); rt2.bold=True; rt2.font.size=Pt(9); rt2.font.color.rgb=C_LIME
    for b in bullets: card_bullet(c, b)

# ═════════════════════════════════════════════════════════════════════════════
# SLIDE 6 — EVIDENCE ANALYSIS & QUANTIFICATION
# ═════════════════════════════════════════════════════════════════════════════
page_break()
section_header(6, 'Step 6 of 7', 'Evidence Analysis & Quantification', C_PINK)

# Stat row
s6t = doc.add_table(rows=1, cols=5)
s6t.alignment = WD_TABLE_ALIGNMENT.LEFT
s6t.autofit   = False
for i, (num, lbl) in enumerate([('10','Confirmed manipulated entries Oct–Nov 2025'),
                                  ('96','Historically suspect entries Jul 2024–Nov 2025'),
                                  ('5', 'CCTV-verified absence instances'),
                                  ('3–4 min','ATLAS vs CCTV time offset'),
                                  ('17+','Months duration of pattern')]):
    s6t.columns[i].width = Cm(3.4)
    c = s6t.cell(0, i)
    set_cell_bg(c, C_LGREY); set_cell_border(c, 'F07EC8', 4)
    pn = c.paragraphs[0]; pn.alignment = WD_ALIGN_PARAGRAPH.CENTER
    rn = pn.add_run(num); rn.bold=True; rn.font.size=Pt(18); rn.font.color.rgb=C_PINK
    pl = c.add_paragraph(); pl.alignment = WD_ALIGN_PARAGRAPH.CENTER
    rl = pl.add_run(lbl); rl.font.size=Pt(7.5); rl.font.color.rgb=RGBColor(0x60,0x40,0x60)
spacer()

# Confirmed cases table + financial
a6t = doc.add_table(rows=1, cols=2)
a6t.alignment = WD_TABLE_ALIGNMENT.LEFT
a6t.autofit   = False
a6t.columns[0].width = Cm(9.5)
a6t.columns[1].width = Cm(7.3)

ca6 = a6t.cell(0, 0)
set_cell_bg(ca6, C_LGREY); set_cell_border(ca6, 'F07EC8', 6)
pa6 = ca6.paragraphs[0]; ra6 = pa6.add_run('Confirmed Manipulation Cases (Oct–Nov 2025)'); ra6.bold=True; ra6.font.size=Pt(9); ra6.font.color.rgb=C_PINK

case_tbl = ca6.add_table(rows=11, cols=4)
case_tbl.autofit = False
col_widths = [Cm(2.4), Cm(2.6), Cm(2.4), Cm(1.8)]
for i, w in enumerate(col_widths): case_tbl.columns[i].width = w
case_hdrs = ['Date', 'Raw Time In', 'Fabricated Entry', 'CCTV']
case_rows = [
    ('02-Oct-25','18:02:45','08:59:13','—'),
    ('03-Oct-25','09:34:04','08:50:18','—'),
    ('07-Oct-25','20:56:56','08:59:41','—'),
    ('09-Oct-25','19:07:47','09:00:09','—'),
    ('13-Oct-25','18:02:07','09:01:01','✅'),
    ('16-Oct-25','22:49:31','08:55:27','✅'),
    ('20-Oct-25','Marked at Time Out','08:59:41','✅'),
    ('21-Oct-25','18:59:02','08:58:17','✅'),
    ('23-Oct-25','18:33:03','08:55:52','✅'),
    ('03–04 Nov-25','17:57:23 / None','Backdated 04-Nov','✅'),
]
for ri_c, row in enumerate([case_hdrs] + case_rows):
    bg = C_DARK if ri_c == 0 else (C_LGREY if ri_c % 2 == 0 else C_WHITE)
    for ci_c, val in enumerate(row):
        c = case_tbl.cell(ri_c, ci_c)
        set_cell_bg(c, bg)
        r = c.paragraphs[0].add_run(val)
        r.font.size = Pt(8); r.font.color.rgb = C_WHITE if ri_c == 0 else C_TEXT; r.bold = (ri_c == 0)

cb6 = a6t.cell(0, 1)
set_cell_bg(cb6, C_LGREY); set_cell_border(cb6, 'F07EC8', 6)
pb6 = cb6.paragraphs[0]; rb6 = pb6.add_run('Financial Quantification'); rb6.bold=True; rb6.font.size=Pt(9); rb6.font.color.rgb=C_PINK
card_para(cb6, 'Full quantification pending payroll data. Framework:', RGBColor(0x70,0x40,0x60), 8.5)
for bp, bt in [('Direct Loss:','Wages paid for disguised absences/late arrivals across 96 dates'),
               ('Benefit Loss:','Bonuses or incentives tied to attendance metrics'),
               ('Avoided Penalties:','Late deductions and sanctions that should have applied'),
               ('Indirect Costs:','Investigation, remediation, and reputational risk')]:
    card_bullet(cb6, bt, bp, C_PINK)
p_s = cb6.add_paragraph()
r_s = p_s.add_run('Status: Not Yet Quantified — pending payroll data and HR policy review across all 96 suspect dates.')
r_s.font.size=Pt(8); r_s.italic=True; r_s.font.color.rgb=RGBColor(0x70,0x40,0x60)
spacer()

c_pat = card_start('Pattern Analysis — Historical Data Significance', C_LGREY, C_PINK)
card_para(c_pat, '96 entries falling within a 2-minute window over 17 months cannot occur by chance — confirming deliberate, systematic back-dating targeting the exact 09:00 reporting threshold.')

# ═════════════════════════════════════════════════════════════════════════════
# SLIDE 7 — CASE FILE, EXPERT OUTPUT & RECOVERY SUPPORT
# ═════════════════════════════════════════════════════════════════════════════
page_break()
section_header(7, 'Step 7 of 7', 'Case File, Expert Output & Recovery Support', C_CYAN)

c7t = doc.add_table(rows=1, cols=3)
c7t.alignment = WD_TABLE_ALIGNMENT.LEFT
c7t.autofit   = False
for i in range(3): c7t.columns[i].width = Cm(5.6)

s7_data = [
    ('Case File Contents', [
        'Fact Finding Report — C&R Division, Jan 2026',
        'Annexures A–G: Actual vs. altered attendance reports (Oct–Nov 2025)',
        'Annexure H: 96-instance historical pattern data (Jul 2024–Nov 2025)',
        'CCTV footage for 5 verified dates',
        'Staff interview notes and verbal confirmations',
        'ATLAS screenshots — original vs. modified entries',
        'Inquiry Committee (IC-1) recommended decisions',
    ]),
    ('Expert Output Required', [
        'IT Forensic Expert: Validate audit trail integrity; confirm logs untampered; assess scope of manipulation',
        'Payroll/HR Analyst: Quantify financial benefit across 17-month period',
        'Legal Counsel: Disciplinary charge drafting; advice on recovery mechanisms',
        'ATLAS Vendor: Confirm back-dating capability and log completeness',
    ]),
    ('Recovery Support', [
        'Financial: Salary/benefit recovery via employment contract',
        'Disciplinary: IC-1 recommendations implemented through HR processes',
        'System: Segregation of duties; dual-approval for admin edits; automated audit alerts',
        'Policy: Restrict self-modification of attendance; mandatory supervisor sign-off',
    ]),
]
for i, (title, bullets) in enumerate(s7_data):
    c = c7t.cell(0, i)
    set_cell_bg(c, C_LGREY); set_cell_border(c, '7EC8F0', 6)
    pt3 = c.paragraphs[0]; rt3 = pt3.add_run(title); rt3.bold=True; rt3.font.size=Pt(9); rt3.font.color.rgb=C_CYAN
    for b in bullets: card_bullet(c, b)
spacer()

# Action plan
c_ap = card_start('Prioritized Action Plan', C_LGREY, C_CYAN)
plan = [
    ('Immediate (Week 1)',   'Forensic image ATLAS server · Secure all CCTV archives · Preserve all digital evidence'),
    ('Short-Term (Wks 2–4)','CCTV review for all 96 dates · Independent IT forensic report · Obtain full payroll data · Brief legal counsel'),
    ('Medium-Term (Mo 2–3)','Formal disciplinary hearing · Quantify total financial loss · Issue charges per IC-1 recommendations'),
    ('Parallel Track',       'Review all staff records for manipulation by subject · Implement IT control remediation'),
    ('Decision Gate',        'Assess penalty based on intent, duration, and quantified financial impact'),
    ('Close-Out',            'System-wide control improvements deployed · Attendance policy updated · Recovery action initiated'),
]
for lbl, txt in plan:
    card_bullet(c_ap, txt, lbl, C_CYAN)

# ═════════════════════════════════════════════════════════════════════════════
# CLOSING — OVERALL ASSESSMENT
# ═════════════════════════════════════════════════════════════════════════════
page_break()

t_cl = doc.add_table(rows=1, cols=1)
t_cl.autofit = False
t_cl.columns[0].width = Cm(17)
c_cl = t_cl.cell(0, 0)
set_cell_bg(c_cl, C_DARK); no_border_cell(c_cl)
pc1 = c_cl.paragraphs[0]; pc1.alignment = WD_ALIGN_PARAGRAPH.CENTER
rc1 = pc1.add_run('PRELIMINARY FRAUD ASSESSMENT  ·  CONCLUSION')
rc1.bold=True; rc1.font.size=Pt(14); rc1.font.color.rgb=C_WHITE
pc2 = c_cl.add_paragraph(); pc2.alignment = WD_ALIGN_PARAGRAPH.CENTER
rc2 = pc2.add_run('Overall Assessment & Recommendation')
rc2.font.size=Pt(10); rc2.font.color.rgb=C_MGREY
spacer()

oc = doc.add_table(rows=1, cols=2)
oc.alignment = WD_TABLE_ALIGNMENT.LEFT
oc.autofit   = False
oc.columns[0].width = Cm(8.4)
oc.columns[1].width = Cm(8.4)

co1 = oc.cell(0, 0)
set_cell_bg(co1, RGBColor(0xFF, 0xEB, 0xEB)); set_cell_border(co1, 'F08080', 8)
po1 = co1.paragraphs[0]; ro1 = po1.add_run('Is Further Investigation Justified?')
ro1.bold=True; ro1.font.size=Pt(10); ro1.font.color.rgb=RGBColor(0xC0,0x30,0x30)
p_yes = co1.add_paragraph()
r_yes = p_yes.add_run('YES — Strongly Recommended')
r_yes.bold=True; r_yes.font.size=Pt(11); r_yes.font.color.rgb=RGBColor(0xC0,0x30,0x30)
card_para(co1, '10 confirmed manipulated entries with documentary proof, 5 CCTV-corroborated dates, a statistically anomalous 17-month pattern of 96 suspect entries, and the subject\'s unique privileged access all meet the threshold for full formal investigation and disciplinary proceedings.', RGBColor(0x60,0x10,0x10), 9)

co2 = oc.cell(0, 1)
set_cell_bg(co2, RGBColor(0xFF, 0xF8, 0xE8)); set_cell_border(co2, 'F0C07E', 8)
po2 = co2.paragraphs[0]; ro2 = po2.add_run('What Remains Unclear')
ro2.bold=True; ro2.font.size=Pt(10); ro2.font.color.rgb=C_ORANGE
for bt in ['Total financial value of benefit obtained',
           'Whether manipulation extends to other employees\' records',
           'Full integrity of system audit logs (forensic review needed)',
           'Subject\'s formal explanation or defence',
           'Authorization history for subject\'s admin access',
           'Status of IC-1 disciplinary recommendations']:
    card_bullet(co2, bt, color=RGBColor(0x60,0x40,0x00))
spacer()

fc = doc.add_table(rows=1, cols=3)
fc.alignment = WD_TABLE_ALIGNMENT.LEFT
fc.autofit   = False
for i in range(3): fc.columns[i].width = Cm(5.6)

cf1 = fc.cell(0, 0); set_cell_bg(cf1, RGBColor(0xFF,0xEB,0xEB)); set_cell_border(cf1, 'F08080', 6)
pf1 = cf1.paragraphs[0]; rf1 = pf1.add_run('Fraud Risk Rating'); rf1.bold=True; rf1.font.size=Pt(9); rf1.font.color.rgb=RGBColor(0xC0,0x30,0x30)
p_high = cf1.add_paragraph(); r_high = p_high.add_run('HIGH')
r_high.bold=True; r_high.font.size=Pt(20); r_high.font.color.rgb=RGBColor(0xC0,0x30,0x30)
card_para(cf1, 'Clear evidence, long-term pattern, deliberate method, unique privileged access.', RGBColor(0x80,0x10,0x10), 8.5)

cf2 = fc.cell(0, 1); set_cell_bg(cf2, C_LGREY); set_cell_border(cf2, 'F0C07E', 6)
pf2b = cf2.paragraphs[0]; rf2b = pf2b.add_run('Classification'); rf2b.bold=True; rf2b.font.size=Pt(9); rf2b.font.color.rgb=C_ORANGE
for tag in ['Disciplinary Misconduct', 'Breach of Trust', 'Unauthorized System Use', 'Attendance Policy Violation']:
    p_tag = cf2.add_paragraph(); r_tag = p_tag.add_run(f'▶ {tag}')
    r_tag.font.size=Pt(8.5); r_tag.font.color.rgb=C_ORANGE

cf3 = fc.cell(0, 2); set_cell_bg(cf3, C_LGREY); set_cell_border(cf3, '7EB8F0', 6)
pf3 = cf3.paragraphs[0]; rf3 = pf3.add_run('Immediate Actions'); rf3.bold=True; rf3.font.size=Pt(9); rf3.font.color.rgb=C_BLUE
for bt in ['Forensic image ATLAS server', 'Secure all CCTV archives',
           'Issue show-cause notice to subject', 'Engage legal counsel',
           'Proceed to disciplinary hearing']:
    card_bullet(cf3, bt)
spacer()

divider()
p_foot = doc.add_paragraph()
p_foot.alignment = WD_ALIGN_PARAGRAPH.CENTER
r_foot = p_foot.add_run('Knowledge & Skill (KS) School System  ·  Compliance & Risk Division  ·  Northern Operations Hub  ·  Preliminary Fraud Assessment  ·  January 2026  ·  Confidential & Proprietary')
r_foot.font.size=Pt(7.5); r_foot.font.color.rgb=RGBColor(0x60,0x70,0x80)

# ── Save ──────────────────────────────────────────────────────────────────────
doc.save('/home/user/KS324/Fraud_Assessment_Presentation.docx')
print('Done.')
