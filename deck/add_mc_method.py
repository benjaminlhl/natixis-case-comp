"""Add the Monte Carlo methodology box to the portfolio Monte Carlo slide ('Monte Carlo: the median portfolio ...').
The four stat cards on the right are regrouped into a 2 x 2 grid so the box fits underneath; the chart is unchanged.

Usage: python3 deck/add_mc_method.py <in.pptx> <out.pptx>
"""
import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR

BLUE, TXT, MUTED, FILL = RGBColor(0x2C, 0x5F, 0x82), RGBColor(0x26, 0x26, 0x26), RGBColor(0x59, 0x59, 0x59), RGBColor(0xE8, 0xEF, 0xF5)
METHOD = [
    ("Historical resampling", "past 5 years of monthly returns, drawn at random with replacement."),
    ("Path generation", "10,000 unique 5-year paths, each built from 60 monthly returns."),
    ("Payoff valuation", "each path runs the note's exact autocall, coupon and 70% barrier logic."),
    ("Risk & return metrics", "aggregated into call probabilities, barrier breaches and the payout distribution."),
]
X0, W_ALL, Y0 = 8.95, 3.88, 1.45          # right-hand column of the slide
CW, CH, GAP = (W_ALL - 0.08) / 2, 1.0, 0.08


def find_slide(prs):
    for s in prs.slides:
        for sh in s.shapes:
            if sh.has_text_frame and sh.text_frame.text.startswith("Monte Carlo: the median portfolio"):
                return s
    raise SystemExit("portfolio Monte Carlo slide not found")


def inch(v):
    return round(v / 914400, 2)


def main(src, dst):
    prs = Presentation(src)
    s = find_slide(prs)

    # Each card = background, colour bar, big number, description, stacked at the same top in 1.12" steps.
    tops = sorted({inch(sh.top) for sh in s.shapes if inch(sh.left) == X0 and sh.shape_type == 1})
    for k, top in enumerate(tops):
        col, row = k % 2, k // 2
        nx, ny = X0 + col * (CW + 0.08), Y0 + row * (CH + GAP)
        for sh in s.shapes:
            t = inch(sh.top)
            if inch(sh.left) == X0 and t == top:                       # background and bar
                sh.left, sh.top = Inches(nx), Inches(ny)
                if inch(sh.width) > 1: sh.width = Inches(CW)
            elif inch(sh.left) == 9.15 and abs(t - top) < 0.1:         # big number
                sh.left, sh.top, sh.width = Inches(nx + 0.15), Inches(ny + 0.04), Inches(CW - 0.2)
                for p in sh.text_frame.paragraphs:
                    for r in p.runs: r.font.size = Pt(20)
            elif inch(sh.left) == 9.15 and abs(t - top - 0.56) < 0.1:  # description
                sh.left, sh.top, sh.width, sh.height = Inches(nx + 0.15), Inches(ny + 0.46), Inches(CW - 0.22), Inches(0.5)
                sh.text_frame.word_wrap = True
                for p in sh.text_frame.paragraphs:
                    for r in p.runs: r.font.size = Pt(8.5)

    y, h = Y0 + 2 * CH + GAP + 0.12, 6.12 - (Y0 + 2 * CH + GAP + 0.12)
    box = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(X0), Inches(y), Inches(W_ALL), Inches(h))
    box.fill.solid(); box.fill.fore_color.rgb = FILL; box.line.fill.background(); box.shadow.inherit = False
    bar = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(X0), Inches(y), Inches(0.07), Inches(h))
    bar.fill.solid(); bar.fill.fore_color.rgb = BLUE; bar.line.fill.background(); bar.shadow.inherit = False

    tb = s.shapes.add_textbox(Inches(X0 + 0.2), Inches(y + 0.1), Inches(W_ALL - 0.3), Inches(h - 0.2))
    tf = tb.text_frame; tf.word_wrap = True; tf.vertical_anchor = MSO_ANCHOR.TOP
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0

    def run(p, text, bold=False, color=TXT, size=10.5):
        r = p.add_run(); r.text = text
        r.font.name = "Arial"; r.font.size = Pt(size); r.font.bold = bold; r.font.color.rgb = color

    p = tf.paragraphs[0]; p.space_after = Pt(8)
    run(p, "Monte Carlo methodology", bold=True, color=BLUE, size=12.5)
    for head, body in METHOD:
        p = tf.add_paragraph(); p.space_after = Pt(8)
        run(p, "• " + head + ": ", bold=True); run(p, body)
    prs.save(dst)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
