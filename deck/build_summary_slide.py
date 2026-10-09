"""Closing summary slide for the team deck (NAT.pptx), drawn on the deck's own '1_Analysis' layout so the
side bars, title rule, section footer and page number come from the template.

Usage: python3 deck/build_summary_slide.py <NAT.pptx> <out_dir>
Writes <out_dir>/NAT-with-summary.pptx (summary appended as the last slide) and <out_dir>/Summary-Slide.pptx.
Numbers follow the deck as uploaded: 12.75% client coupon (slides 6, 9), 14.09% fair coupon (Appendix E),
call probabilities and expected value from slide 9 (team outlook), basket risk/return from slide 7.
"""
import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR

BLUE, BLUE_M, GRAY, TXT, MUTED, WHITE, RED = "2C5F82", "8DB3D1", "F2F2F2", "262626", "595959", "FFFFFF", "B23B3B"
CLIENT_CPN, FAIR_CPN = 12.75, 14.092219


def rgb(h):
    return RGBColor.from_string(h)


def box(s, x, y, w, h, fill, line=None):
    r = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(x), Inches(y), Inches(w), Inches(h))
    r.fill.solid(); r.fill.fore_color.rgb = rgb(fill)
    if line: r.line.color.rgb = rgb(line)
    else: r.line.fill.background()
    r.shadow.inherit = False
    return r


def text(s, x, y, w, h, paras, size=10, anchor=MSO_ANCHOR.TOP, align=PP_ALIGN.LEFT):
    """paras: list of paragraphs; each paragraph a list of (text, {bold, color, italic, size})."""
    tb = s.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = tb.text_frame; tf.word_wrap = True; tf.vertical_anchor = anchor
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    for i, runs in enumerate(paras):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align; p.space_after = Pt(3)
        for t, o in runs:
            r = p.add_run(); r.text = t
            f = r.font; f.name = "Arial"; f.size = Pt(o.get("size", size)); f.bold = o.get("bold", False)
            f.italic = o.get("italic", False); f.color.rgb = rgb(o.get("color", TXT))
    return tb


def add_summary(prs, layout):
    s = prs.slides.add_slide(layout)
    for ph in list(s.placeholders):  # keep the slide clean: the layout already draws the page number
        ph._element.getparent().remove(ph._element)

    text(s, 0.53, 0.15, 12.3, 0.6, [[("Summary: Asia's AI hardware, held through an autocall that pays while markets swing", {"size": 22})]],
         anchor=MSO_ANCHOR.MIDDLE)
    text(s, 0.6, 0.85, 12.2, 0.3, [[("From the family's mandate to the note: what we recommend, why now, and what the family can expect",
                                     {"italic": True, "color": MUTED, "size": 11})]])

    # Four steps: client -> thesis -> product -> outcome
    cols = [
        ("1", "The client", [
            ("USD 100mn, 5 years, moderate risk", "Chak family office (NKE Private Wealth); ~5% of family wealth."),
            ("Two goals", "Compound capital for the next generation, and own Asia's digital transformation."),
            ("One constraint", "A defined capital barrier, not an open-ended equity drawdown."),
        ]),
        ("2", "The thesis", [
            ("Asia controls AI's hardware", "~70% of foundry (Taiwan), 83% of HBM (Korea), ~55% of chip test (Japan)."),
            ("But the path is violent", "KOSPI −25% in ten weeks; VKOSPI at a record 91.2."),
            ("And rates stay high", "FOMC median 4.125% to end-2027; long bonds lose ~4% per 1% rise."),
        ]),
        ("3", "The product", [
            (f"{CLIENT_CPN:.2f}% a year, 5Y autocallable note", "Natixis-issued, USD 100mn, five Asian ETFs: 3119 HK 35%, EWY 20%, EWT 15%, 2644 JP 15%, 00878 TT 15%."),
            ("Step-down call, yearly", f"Called if the basket ≥ 102.5% in Y1, falling 2.5% a year to 92.5% in Y5; pays 100% + {CLIENT_CPN:.2f}% × years."),
            ("70% barrier at maturity only", "If never called, 100% back unless the basket ends below 70%."),
        ]),
        ("4", "The outcome", [
            ("Capital usually back early", "78% called in year 1 (112.75%); 99.3% called within five years."),
            ("Loss is rare", "0.2% of paths end below 70%, where the family takes the basket's fall."),
            ("Priced with room", f"Fair coupon {FAIR_CPN:.2f}%: Natixis keeps {FAIR_CPN - CLIENT_CPN:.2f}% a year for hedging and margin."),
        ]),
    ]
    X0, W, GAP, Y0 = 0.6, 2.93, 0.16, 1.3
    for i, (num, head, items) in enumerate(cols):
        x = X0 + i * (W + GAP)
        box(s, x, Y0, W, 0.45, BLUE)
        text(s, x + 0.15, Y0, W - 0.3, 0.45, [[(num + "  ", {"bold": True, "color": BLUE_M, "size": 13}),
                                               (head, {"bold": True, "color": WHITE, "size": 13})]], anchor=MSO_ANCHOR.MIDDLE)
        if i < 3:  # arrow to the next step
            a = s.shapes.add_shape(MSO_SHAPE.ISOSCELES_TRIANGLE,
                                   Inches(x + W + 0.02), Inches(Y0 + 0.13), Inches(0.12), Inches(0.19))
            a.rotation = 90; a.fill.solid(); a.fill.fore_color.rgb = rgb(BLUE_M); a.line.fill.background()
        for j, (h, b) in enumerate(items):
            y = Y0 + 0.55 + j * 0.97
            box(s, x, y, W, 0.9, GRAY if j % 2 == 0 else WHITE, line=GRAY)
            box(s, x, y, 0.06, 0.9, RED if (i == 1 and j == 1) else BLUE)
            text(s, x + 0.18, y + 0.08, W - 0.3, 0.78, [[(h, {"bold": True, "color": BLUE, "size": 10.5})],
                                                         [(b, {"color": TXT, "size": 9.5})]])

    # Why it fits: the family's goals mapped to the note's features
    Y1 = 4.8
    text(s, 0.6, Y1, 12.2, 0.28, [[("Why it fits the family", {"bold": True, "color": BLUE, "size": 11.5})]])
    fits = [
        (f"{CLIENT_CPN:.2f}%", "Growth", "a double-digit coupon from the AI-hardware theme, without having to time entry"),
        ("70%", "Protection", "a defined barrier, checked only at maturity, for the legacy sleeve"),
        ("~1.3 yrs", "Flexibility", "expected life is short, so capital returns early to reinvest at higher rates"),
    ]
    FW = (12.2 - 2 * 0.16) / 3
    for i, (big, head, body) in enumerate(fits):
        x = 0.6 + i * (FW + 0.16)
        box(s, x, Y1 + 0.32, FW, 0.78, "E8EFF5")
        text(s, x + 0.1, Y1 + 0.32, 1.25, 0.78, [[(big, {"bold": True, "color": BLUE, "size": 19})]], anchor=MSO_ANCHOR.MIDDLE, align=PP_ALIGN.CENTER)
        text(s, x + 1.45, Y1 + 0.32, FW - 1.55, 0.78, [[(head + ": ", {"bold": True, "size": 10}), (body, {"color": MUTED, "size": 10})]],
             anchor=MSO_ANCHOR.MIDDLE)

    box(s, 0.6, 6.12, 12.2, 0.48, BLUE)
    text(s, 0.75, 6.12, 11.9, 0.48, [[("Own the scarce part of AI, Asia's chips, memory and tools, and get paid while the market swings.",
                                       {"bold": True, "color": WHITE, "size": 12.5})]], anchor=MSO_ANCHOR.MIDDLE, align=PP_ALIGN.CENTER)
    text(s, 0.6, 6.64, 12.2, 0.25, [[("Call and loss probabilities on the team outlook (slide 9); fair coupon from the Monte Carlo pricing (Appendix E). "
                                      "Not a guarantee of future returns; capital at risk below the 70% barrier and to Natixis credit.",
                                      {"italic": True, "color": MUTED, "size": 7.5})]])
    s.notes_slide.notes_text_frame.text = (
        "Close on one page. The family wants to grow capital for the next generation and own Asia's digital transformation, with a defined "
        "barrier. Our thesis: Asia holds AI's hardware bottlenecks, but the path is violent and rates stay high. So we hold a five-ETF Asian "
        f"basket through a five-year autocallable note paying {CLIENT_CPN:.2f}% a year, with a step-down call and a 70% barrier at maturity only. "
        "On our outlook the note is usually called in year one and loses capital in very few paths.")
    return s


def main(src, out_dir):
    prs = Presentation(src)
    layout = prs.slides[9].slide_layout  # '1_Analysis' with STRATEGY highlighted, as on the product slides
    add_summary(prs, layout)
    prs.save(f"{out_dir}/NAT-with-summary.pptx")

    one = Presentation(src)
    lst = one.slides._sldIdLst
    for sid in list(lst):
        one.part.drop_rel(sid.rId); lst.remove(sid)
    add_summary(one, [l for l in one.slide_layouts if l.name == layout.name][0])
    one.save(f"{out_dir}/Summary-Slide.pptx")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
