from docx import Document
from docx.shared import Pt, Cm, RGBColor, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_ALIGN_VERTICAL, WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
import copy

doc = Document()

# ── Page setup: A4, narrow margins ──────────────────────────────────────
section = doc.sections[0]
section.page_width  = Cm(21)
section.page_height = Cm(29.7)
section.top_margin    = Cm(1.5)
section.bottom_margin = Cm(1.5)
section.left_margin   = Cm(1.8)
section.right_margin  = Cm(1.8)

# ── Helper: set paragraph shading ───────────────────────────────────────
def shade_paragraph(para, hex_color):
    pPr = para._p.get_or_add_pPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), hex_color)
    pPr.append(shd)

def shade_cell(cell, hex_color):
    tc   = cell._tc
    tcPr = tc.get_or_add_tcPr()
    shd  = OxmlElement('w:shd')
    shd.set(qn('w:val'),   'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'),  hex_color)
    tcPr.append(shd)

def set_cell_border(cell, **kwargs):
    tc   = cell._tc
    tcPr = tc.get_or_add_tcPr()
    tcBorders = OxmlElement('w:tcBorders')
    for edge in ('top', 'left', 'bottom', 'right', 'insideH', 'insideV'):
        if edge in kwargs:
            tag = OxmlElement(f'w:{edge}')
            tag.set(qn('w:val'),   kwargs[edge].get('val',   'single'))
            tag.set(qn('w:sz'),    kwargs[edge].get('sz',    '4'))
            tag.set(qn('w:space'), kwargs[edge].get('space', '0'))
            tag.set(qn('w:color'), kwargs[edge].get('color', 'auto'))
            tcBorders.append(tag)
    tcPr.append(tcBorders)

def cell_text(cell, text, bold=False, size=9, color=None, align=WD_ALIGN_PARAGRAPH.LEFT, italic=False):
    para = cell.paragraphs[0]
    para.alignment = align
    run  = para.add_run(text)
    run.bold   = bold
    run.italic = italic
    run.font.size = Pt(size)
    if color:
        run.font.color.rgb = RGBColor(*bytes.fromhex(color))
    return run

def add_colored_heading(doc, text, bg_hex, fg_hex='FFFFFF', size=11):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    shade_paragraph(p, bg_hex)
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after  = Pt(4)
    run = p.add_run(text)
    run.bold = True
    run.font.size = Pt(size)
    run.font.color.rgb = RGBColor(*bytes.fromhex(fg_hex))
    return p

# ═══════════════════════════════════════════════════════════════
# HEADER BLOCK
# ═══════════════════════════════════════════════════════════════
header_tbl = doc.add_table(rows=1, cols=2)
header_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
header_tbl.columns[0].width = Cm(12)
header_tbl.columns[1].width = Cm(5.4)

left_cell  = header_tbl.cell(0, 0)
right_cell = header_tbl.cell(0, 1)

shade_cell(left_cell,  '1E3A5F')
shade_cell(right_cell, '1E3A5F')

lp = left_cell.paragraphs[0]
lp.alignment = WD_ALIGN_PARAGRAPH.LEFT
lp.paragraph_format.space_before = Pt(6)
lp.paragraph_format.space_after  = Pt(2)
r = lp.add_run('BEACONHOUSE GROUP')
r.bold = True; r.font.size = Pt(14)
r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

lp2 = left_cell.add_paragraph()
lp2.alignment = WD_ALIGN_PARAGRAPH.LEFT
lp2.paragraph_format.space_before = Pt(0)
lp2.paragraph_format.space_after  = Pt(6)
r2 = lp2.add_run('Systems & Audit — Annual Report FY 2024')
r2.font.size = Pt(9.5); r2.font.color.rgb = RGBColor(0xB0, 0xC8, 0xE8)

rp = right_cell.paragraphs[0]
rp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
rp.paragraph_format.space_before = Pt(6)
rp.paragraph_format.space_after  = Pt(2)
r3 = rp.add_run('CEO BRIEFING NOTE')
r3.bold = True; r3.font.size = Pt(10)
r3.font.color.rgb = RGBColor(0xFF, 0xD7, 0x00)

rp2 = right_cell.add_paragraph()
rp2.alignment = WD_ALIGN_PARAGRAPH.RIGHT
rp2.paragraph_format.space_before = Pt(0)
rp2.paragraph_format.space_after  = Pt(6)
r4 = rp2.add_run('Period: Jul 2023 – Jun 2024')
r4.font.size = Pt(8.5); r4.font.color.rgb = RGBColor(0xB0, 0xC8, 0xE8)

# Thin gold divider
div = doc.add_paragraph()
shade_paragraph(div, 'F59E0B')
div.paragraph_format.space_before = Pt(0)
div.paragraph_format.space_after  = Pt(0)
pPr = div._p.get_or_add_pPr()
pBdr = OxmlElement('w:pBdr'); pPr.append(pBdr)
bot = OxmlElement('w:bottom')
bot.set(qn('w:val'),'single'); bot.set(qn('w:sz'),'8')
bot.set(qn('w:space'),'0'); bot.set(qn('w:color'),'F59E0B')
pBdr.append(bot)

# ═══════════════════════════════════════════════════════════════
# SECTION A — KEY PERFORMANCE METRICS (6-cell KPI grid)
# ═══════════════════════════════════════════════════════════════
add_colored_heading(doc, '▌ KEY PERFORMANCE METRICS', '1E3A5F', 'FFFFFF', 10)

kpi_tbl = doc.add_table(rows=2, cols=3)
kpi_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER

kpi_data = [
    ('TOTAL SAVINGS', 'Rs. 192.8 M',   'Prev. Cont. Rs. 73.1M  |  Curr. Cont. Rs. 6.2M  |  One-off Rs. 113.5M', '16a34a'),
    ('INVESTIGATIONS', '27  Cases',       '79 disciplinary outcomes across 27 assignments', 'b91c1c'),
    ('BRANCH AUDIT', '39  Branches',    '2,264 observations raised  |  ROC · RON · ROS · FHS', '0369a1'),
    ('PRE-AUDIT',    '27,432 Vouchers','2,158 observations  |  19 entities covered', 'b45309'),
    ('AIDN VOUCHERS','121  Checked',   'Rs. 27.6M reviewed  |  Rs. 1.39M savings achieved', '6d28d9'),
    ('ENTITY COVERAGE','19  Entities', '4 Full · 7 Savings · 8 Pre-Audit Only · 0 Nil', '0f766e'),
]

for idx, (label, value, sub, accent) in enumerate(kpi_data):
    row_idx = idx // 3
    col_idx = idx %  3
    cell = kpi_tbl.cell(row_idx, col_idx)
    shade_cell(cell, 'F8FAFC')
    set_cell_border(cell,
        top={'val':'single','sz':'4','color':accent},
        bottom={'val':'single','sz':'2','color':'E2E8F0'},
        left={'val':'single','sz':'2','color':'E2E8F0'},
        right={'val':'single','sz':'2','color':'E2E8F0'})
    cell.paragraphs[0].paragraph_format.space_before = Pt(5)
    cell_text(cell, label + '\n', bold=True, size=7.5, color=accent)
    p2 = cell.add_paragraph()
    p2.alignment = WD_ALIGN_PARAGRAPH.LEFT
    r = p2.add_run(value)
    r.bold = True; r.font.size = Pt(15)
    r.font.color.rgb = RGBColor(*bytes.fromhex('1E3A5F'))
    p3 = cell.add_paragraph()
    p3.paragraph_format.space_after = Pt(5)
    r3 = p3.add_run(sub)
    r3.font.size = Pt(7); r3.font.color.rgb = RGBColor(0x64, 0x74, 0x8B)

# ═══════════════════════════════════════════════════════════════
# SECTION B — INVESTIGATIONS & OUTCOMES
# ═══════════════════════════════════════════════════════════════
add_colored_heading(doc, '▌ INVESTIGATIONS & DISCIPLINARY OUTCOMES', 'B91C1C', 'FFFFFF', 9.5)

inv_tbl = doc.add_table(rows=2, cols=7)
inv_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
inv_headers = ['End of\nService','Financial\nRecoveries','Warning\nLetters','Letters\nof Advice','Letters\nof Caution','Vendor\nBlacklisting','Staff\nTransfers']
inv_values  = ['19',            '24',                   '16',            '9',              '3',               '6',                 '2']
inv_colors  = ['DC2626',        '2563EB',               'D97706',        '16A34A',         '7C3AED',          '111827',            '0369A1']

for col_idx, (hdr, val, clr) in enumerate(zip(inv_headers, inv_values, inv_colors)):
    hcell = inv_tbl.cell(0, col_idx)
    vcell = inv_tbl.cell(1, col_idx)
    shade_cell(hcell, 'FEF2F2')
    shade_cell(vcell, 'FFFBEB')
    cell_text(hcell, hdr, bold=True, size=7.5, color=clr, align=WD_ALIGN_PARAGRAPH.CENTER)
    hcell.paragraphs[0].paragraph_format.space_before = Pt(3)
    hcell.paragraphs[0].paragraph_format.space_after  = Pt(2)
    p = vcell.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after  = Pt(4)
    r = p.add_run(val)
    r.bold = True; r.font.size = Pt(16)
    r.font.color.rgb = RGBColor(*bytes.fromhex(clr))

# Recovery note
p_rec = doc.add_paragraph()
p_rec.paragraph_format.space_before = Pt(3)
p_rec.paragraph_format.space_after  = Pt(3)
r = p_rec.add_run('Financial Recoveries: ')
r.bold = True; r.font.size = Pt(8.5)
r.font.color.rgb = RGBColor(0x1E, 0x3A, 0x5F)
r2 = p_rec.add_run('Total Rs. 2.2M recovered across 24 recovery outcomes. Largest: KG-1 Jauhar Rs. 605,593 (attendance fraud + unregistered students). FHS Rs. 768,605 (cash misappropriation). RON Rs. 390,204 (accounts discrepancy).')
r2.font.size = Pt(8); r2.font.color.rgb = RGBColor(0x33, 0x41, 0x55)

# ═══════════════════════════════════════════════════════════════
# SECTION C — SAVINGS BREAKDOWN
# ═══════════════════════════════════════════════════════════════
add_colored_heading(doc, '▌ SAVINGS & FINANCIAL IMPACT BY ENTITY', '0F766E', 'FFFFFF', 9.5)

sav_tbl = doc.add_table(rows=6, cols=5)
sav_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER

# Header row
sav_hdrs = ['Entity', 'Prev. Cont. (Rs.)', 'Curr. Cont. (Rs.)', 'One-off (Rs.)', 'TOTAL (Rs.)']
for ci, h in enumerate(sav_hdrs):
    c = sav_tbl.cell(0, ci)
    shade_cell(c, '0F766E')
    p = c.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(3)
    p.paragraph_format.space_after  = Pt(3)
    r = p.add_run(h); r.bold = True; r.font.size = Pt(8)
    r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

sav_rows = [
    ('Construction (HO)',  '—',          '—',         '89,552,194', '89,552,194'),
    ('ROS – Region South', '50,386,416', '1,340,198', '2,850,767',  '54,577,381'),
    ('ROC – Region Central','22,669,200','—',         '5,300,698',  '27,969,898'),
    ('BIC-HO (4200)',      '—',          '—',         '11,237,116', '11,237,116'),
    ('FHS + RON + Others', '—',          '4,888,536', '6,546,074',  '10,461,470'),
]

row_colors = ['F0FDF4', 'F8FAFC', 'F0FDF4', 'F8FAFC', 'F0FDF4']
for ri, (row_data, bg) in enumerate(zip(sav_rows, row_colors)):
    for ci, val in enumerate(row_data):
        c = sav_tbl.cell(ri + 1, ci)
        shade_cell(c, bg)
        align = WD_ALIGN_PARAGRAPH.LEFT if ci == 0 else WD_ALIGN_PARAGRAPH.RIGHT
        p = c.paragraphs[0]
        p.alignment = align
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after  = Pt(2)
        is_total = (ci == 4)
        clr = '15803D' if is_total else '334155'
        r = p.add_run(val)
        r.bold = is_total
        r.font.size = Pt(8)
        r.font.color.rgb = RGBColor(*bytes.fromhex(clr))

# Grand total row inline note
p_gt = doc.add_paragraph()
p_gt.paragraph_format.space_before = Pt(2)
p_gt.paragraph_format.space_after  = Pt(3)
shade_paragraph(p_gt, 'ECFDF5')
r1 = p_gt.add_run('GROUP TOTAL  ►  Rs. 192,768,059   ')
r1.bold = True; r1.font.size = Pt(9)
r1.font.color.rgb = RGBColor(0x05, 0x7A, 0x55)
r2 = p_gt.add_run(' (Prev. Cont. Rs. 73.1M  +  Curr. Cont. Rs. 6.2M  +  One-off Rs. 113.5M)')
r2.font.size = Pt(8); r2.font.color.rgb = RGBColor(0x33, 0x41, 0x55)

# ═══════════════════════════════════════════════════════════════
# SECTION D — POLICIES, ISO & TRAINING  |  BRANCH AUDIT SUMMARY
# ═══════════════════════════════════════════════════════════════
add_colored_heading(doc, '▌ POLICIES & ISO  ·  BRANCH AUDIT SUMMARY  ·  ENTITY COVERAGE', '1D4ED8', 'FFFFFF', 9.5)

bot_tbl = doc.add_table(rows=1, cols=3)
bot_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER

# --- Left: Policies & ISO
lc = bot_tbl.cell(0, 0)
shade_cell(lc, 'EFF6FF')
lp = lc.paragraphs[0]
lp.paragraph_format.space_before = Pt(4)
r = lp.add_run('POLICIES & ISO'); r.bold = True; r.font.size = Pt(8.5)
r.font.color.rgb = RGBColor(0x1D, 0x4E, 0xD8)

policies = [
    ('Policy Manuals Revised', '28'),
    ('New Policy Developments', '14'),
    ('Entities Covered', '5  (ESL, FHS, BIC, BT, Homebridge)'),
    ('ISO 9001:2015', 'Surveillance audit passed'),
    ('ISO 27001', 'Gap analysis completed'),
    ('Training Sessions', '8 sessions · 200+ staff'),
]
for label, val in policies:
    pp = lc.add_paragraph()
    pp.paragraph_format.space_before = Pt(1)
    pp.paragraph_format.space_after  = Pt(1)
    r1 = pp.add_run(f'{label}:  '); r1.font.size = Pt(7.5)
    r1.font.color.rgb = RGBColor(0x44, 0x40, 0x3C)
    r2 = pp.add_run(val); r2.bold = True; r2.font.size = Pt(7.5)
    r2.font.color.rgb = RGBColor(0x1D, 0x4E, 0xD8)
lc.add_paragraph().paragraph_format.space_after = Pt(4)

# --- Middle: Branch Audit
mc = bot_tbl.cell(0, 1)
shade_cell(mc, 'F0FDF4')
mp = mc.paragraphs[0]
mp.paragraph_format.space_before = Pt(4)
r = mp.add_run('BRANCH AUDIT'); r.bold = True; r.font.size = Pt(8.5)
r.font.color.rgb = RGBColor(0x15, 0x80, 0x3D)

branch_rows = [
    ('ROC (Central)', '12 branches', '705 obs'),
    ('RON (North)',   '10 branches', '553 obs'),
    ('ROS (South)',   '16 branches', '976 obs'),
    ('FHS',           '1 unit',      '30 obs'),
    ('TOTAL',         '39 branches', '2,264 obs'),
]
for entity, branches, obs in branch_rows:
    pp = mc.add_paragraph()
    pp.paragraph_format.space_before = Pt(1)
    pp.paragraph_format.space_after  = Pt(1)
    is_total = entity == 'TOTAL'
    r1 = pp.add_run(f'{entity}: '); r1.bold = is_total; r1.font.size = Pt(7.5)
    r1.font.color.rgb = RGBColor(0x15, 0x80, 0x3D) if is_total else RGBColor(0x33, 0x41, 0x55)
    r2 = pp.add_run(f'{branches}  ·  {obs}'); r2.bold = is_total; r2.font.size = Pt(7.5)
    r2.font.color.rgb = RGBColor(0x05, 0x7A, 0x55) if is_total else RGBColor(0x33, 0x41, 0x55)
mc.add_paragraph().paragraph_format.space_after = Pt(4)

# --- Right: Entity Coverage
rc = bot_tbl.cell(0, 2)
shade_cell(rc, 'FFFBEB')
rp = rc.paragraphs[0]
rp.paragraph_format.space_before = Pt(4)
r = rp.add_run('ENTITY COVERAGE'); r.bold = True; r.font.size = Pt(8.5)
r.font.color.rgb = RGBColor(0x92, 0x40, 0x0E)

coverage = [
    ('Full Coverage (4)',        'ROC · RON · ROS · FHS',                     '16A34A'),
    ('Savings/Initiatives (7)', 'Construction · BIC-HO · PTSL · UCS\nEducators · Estate · KASALIN', '0369A1'),
    ('Pre-Audit Only (8)',       'HO · Alpha · Concordia · MAK\nBPS · BT · PDLC · ECD',             'D97706'),
    ('Nil / Planned (0)',        'All 19 entities had S&A engagement in FY 2024', '6B7280'),
]
for cat, entities, clr in coverage:
    pp = rc.add_paragraph()
    pp.paragraph_format.space_before = Pt(2)
    pp.paragraph_format.space_after  = Pt(0)
    r1 = pp.add_run(cat + '\n'); r1.bold = True; r1.font.size = Pt(7.5)
    r1.font.color.rgb = RGBColor(*bytes.fromhex(clr))
    r2 = pp.add_run(entities); r2.font.size = Pt(7)
    r2.font.color.rgb = RGBColor(0x44, 0x40, 0x3C)
rc.add_paragraph().paragraph_format.space_after = Pt(4)

# ═══════════════════════════════════════════════════════════════
# FOOTER
# ═══════════════════════════════════════════════════════════════
footer_div = doc.add_paragraph()
shade_paragraph(footer_div, '1E3A5F')
footer_div.paragraph_format.space_before = Pt(6)
footer_div.paragraph_format.space_after  = Pt(4)
footer_div.alignment = WD_ALIGN_PARAGRAPH.CENTER
r1 = footer_div.add_run('Systems & Audit Department  |  Beaconhouse Group  |  FY 2024 Annual Report  |  Confidential — For CEO Review Only')
r1.font.size = Pt(7.5); r1.font.color.rgb = RGBColor(0xB0, 0xC8, 0xE8)
r2 = footer_div.add_run('  |  Prepared: January 2026')
r2.font.size = Pt(7.5); r2.font.color.rgb = RGBColor(0xFF, 0xD7, 0x00)

out_path = '/home/user/KS324/CEO_Briefing_Note_SA_FY2024.docx'
doc.save(out_path)
print(f'Saved: {out_path}')
