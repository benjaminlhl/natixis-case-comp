"""All references used in the team deck (NAT-fixed.pptx), grouped by topic.
Writes deck/REFERENCES.md (full list with links) and adds an 'Appendix G: References' slide (before the closing summary) to a deck.

Usage: python3 deck/references.py <in.pptx> <out.pptx>
Entries flagged verify=True rest on a secondary source or a value read from a chart; check before submission.
"""
import sys
from pathlib import Path

# (group, [(citation, url_or_note, slides, verify)])
REFS = [
    ("Case and client", [
        ("Natixis CIB, Investment Strategy Challenge 2026, Scenario 2 brief: NKE Private Wealth / Chak family mandate, USD funding grid, product rules", "Case pack supplied by the organisers", "2, 5, 10–16", False),
    ]),
    ("AI demand and the Asian hardware chain", [
        ("WSTS, Spring 2026 semiconductor market forecast (May 2026) and 2025 final release", "https://www.wsts.org/esraCMS/extension/media/f/WST/7618/WSTS_FC-Release-2026-May.pdf", "4", False),
        ("Hyperscaler 2026 capex guidance (Amazon, Microsoft, Alphabet, Meta), compiled by AI Weekly and Yahoo Finance", "https://aiweekly.co/node/8566", "4", False),
        ("Counterpoint Research, foundry revenue share (TSMC ~70%), via XTB and Motley Fool", "https://www.xtbofficial.com/en/market-analysis/stock-of-the-week-tsmc-the-heart-of-the-global-ai-revolution-january-22-2026", "4", False),
        ("Counterpoint Research, Global DRAM and HBM market share (SK hynix 50%, Samsung 33%, Q2 2026)", "https://counterpointresearch.com/insights/global-dram-and-hbm-market-share", "4", False),
        ("TrendForce, DRAM contract price outlook Q2–Q4 2026 (via iConnect007)", "https://iconnect007.com/article/150656/ai-server-demand-keeps-memory-prices-up-in-3q26-but-gains-moderate/150653/pcb", "4", False),
        ("Trading Economics and Focus Taiwan, TSMC >40% of TAIEX market value (2026)", "https://tradingeconomics.com/taiwan/stock-market/news/570234", "4", False),
        ("DataM Intelligence / Envisioning, Advantest ~55% of chip test equipment", "https://www.datamintelligence.com/blogs/top-companies-semiconductor-equipment-manufacturing-race-japan-2026", "4", True),
        ("Nikkei Inc., Advantest weight in the Nikkei 225 and index archive", "https://asia.nikkei.com/announcements/nikkei-to-lower-advantest-s-weight-in-nikkei-225", "4", False),
        ("Worldwide AI spending ~USD 2.7trn in 2026 (slide 3): source not recorded by the team", "Add the analyst source (e.g. Gartner or IDC forecast)", "3", True),
    ]),
    ("Markets, valuation and volatility", [
        ("Cembalest, M., Eye on the Market 2026 Outlook: \"Smothering Heights\", J.P. Morgan Asset & Wealth Management, 1 Jan 2026 (pp. 1, 33–34)", "PDF supplied by the team", "4, 5", False),
        ("TWSE Market Highlights 2021–2025; Trading Economics (TAIEX 2026 record)", "https://www.twse.com.tw/downloads/zh/about/company/factbook/2026/0.0105.html", "4", False),
        ("Korea Exchange year-end KOSPI levels 2021–2025 (via Korea Times, Invezz)", "https://www.koreatimes.co.kr/amp/economy/policy/20251230/korean-stock-market-finishes-2025-on-high-note", "4", True),
        ("BIT Research, \"The KOSPI supercycle\" (KOSPI 9,000+, Samsung + SK hynix ~48%)", "https://www.bit.com/knowledge-hub/the-kospi-supercycle", "4", True),
        ("FN News, KOSPI close 6,789 on 28 Aug 2026", "https://en.fnnews.com/news/202608310838266902", "4", False),
        ("Asiae, KOSPI −8.95% on 13 Jul 2026", "https://view.asiae.co.kr/en/article/2026071315333278624", "5", False),
        ("Nikkei Inc. index summary; Nippon.com / Jiji (Nikkei 225 levels)", "https://indexes.nikkei.co.jp/en/nkave/archives/summary?hl=ja-JP", "4", False),
        ("Siblis Research, Nikkei 225 CAPE (38.6×) and KOSPI P/E", "https://siblisresearch.com/data/japan-nikkei-pe-cape/", "4", False),
        ("SBS and Herald Corp, VKOSPI record close 91.23 (9 Jun 2026)", "https://sbsstar.net/article/N1008602024/koreas-fear-index-surges-19-amid-volatility-closes-at-alltime-high", "5", False),
    ]),
    ("Rates", [
        ("Board of Governors of the Federal Reserve System, Summary of Economic Projections, 16 Sep 2026 (dot plot; counts read from chart)", "https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm", "5", True),
        ("Advisor Perspectives and Admiral Markets, FOMC decision of 16 Sep 2026 (+0.25% to 3.75–4.00%)", "https://admiralmarkets.com/analytics/traders-blog/fed-raised-interest-rates", "5", True),
        ("Fed funds futures, ~87% probability of a further hike: source not recorded by the team", "Add the CME FedWatch date and figure", "5", True),
    ]),
    ("Underlying ETFs and data", [
        ("Global X ETFs (Hong Kong), Global X Asia Semiconductor ETF (3119 HK), product factsheet", "https://www.globalxetfs.com.hk", "6, 7", True),
        ("BlackRock iShares, MSCI South Korea ETF (EWY) and MSCI Taiwan ETF (EWT), factsheets and holdings", "https://www.ishares.com", "6, 7", True),
        ("Global X Japan, Global X Japan Semiconductor ETF (2644 JP), factsheet", "https://globalxetfs.co.jp", "6, 7", True),
        ("Cathay SITE, Cathay Taiwan ESG Sustainability High Dividend ETF (00878 TT), factsheet", "https://www.cathaysite.com.tw", "6, 7, 10", True),
        ("Bloomberg L.P., PX_LAST daily prices for the five ETFs (team file data/Stock.xlsx)", "Bloomberg Terminal", "7, 8, 9", False),
    ]),
    ("Methodology", [
        ("Markowitz, H. (1952), \"Portfolio Selection\", Journal of Finance 7(1), 77–91", "Modern portfolio theory (slide 7)", "7", False),
        ("Efron, B. (1979), \"Bootstrap Methods: Another Look at the Jackknife\", Annals of Statistics 7(1), 1–26", "Historical resampling (slides 8–9)", "8, 9", False),
        ("Black, F. and Scholes, M. (1973), \"The Pricing of Options and Corporate Liabilities\", Journal of Political Economy 81(3), 637–654", "Risk-neutral GBM", "11, 15", False),
        ("Glasserman, P. (2004), Monte Carlo Methods in Financial Engineering, Springer", "Correlated paths via Cholesky, standard errors", "11, 15, 16", False),
        ("Hull, J. C., Options, Futures, and Other Derivatives, Pearson", "Discounting, digitals, replication", "10, 13", False),
        ("Bouzoubaa, M. and Osseiran, A. (2010), Exotic Options and Hybrids: A Guide to Structuring, Pricing and Trading, Wiley", "Autocallables, step-down call levels, barriers", "6, 13, 14", False),
        ("Team write-up, \"Derivation of Fair Coupon Rate for Autocallable Structured Product\" (8 Oct 2026) and code pricing/stochastic_cal_for_natixis.py, pricing/scenario2_annual_checks.py", "Fair coupon 14.09%, sensitivities, variants", "10–16", False),
    ]),
]


def write_md(path):
    lines = ["# References", "", "Sources for every figure in the deck (`deck/NAT-fixed.pptx`). "
             "Items marked **verify** rest on a secondary source, a value read from a chart, or have no source recorded; "
             "check them before submission. Detailed fact-by-fact notes: `deck/thesis_sources.md`.", ""]
    n = 0
    for group, items in REFS:
        lines += [f"## {group}", "", "| # | Reference | Link / note | Slides |", "|---|---|---|---|"]
        for cite, url, slides, verify in items:
            n += 1
            link = f"[link]({url})" if url.startswith("http") else url
            lines.append(f"| {n} | {cite}{' **verify**' if verify else ''} | {link} | {slides} |")
        lines.append("")
    Path(path).write_text("\n".join(lines))


def add_slides(src, dst):
    from pptx import Presentation
    from pptx.util import Inches, Pt
    from pptx.dml.color import RGBColor
    BLUE, TXT, MUTED = RGBColor(0x2C, 0x5F, 0x82), RGBColor(0x26, 0x26, 0x26), RGBColor(0x59, 0x59, 0x59)

    prs = Presentation(src)
    layout = next(s.slide_layout for s in prs.slides if any(
        sh.has_text_frame and sh.text_frame.text.startswith("Appendix A") for sh in s.shapes))

    # number the entries, then lay all groups out on one slide
    numbered, n = [], 0
    for group, items in REFS:
        rows = []
        for cite, url, slides, verify in items:
            n += 1
            rows.append((n, cite, url, slides, verify))
        numbered.append((group, rows))
    pages = [numbered]

    for pi, groups in enumerate(pages):
        s = prs.slides.add_slide(layout)
        for ph in list(s.placeholders):
            ph._element.getparent().remove(ph._element)

        def tb(x, y, w, h):
            t = s.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h)).text_frame
            t.word_wrap = True
            t.margin_left = t.margin_right = t.margin_top = t.margin_bottom = 0
            return t

        def run(p, text, size, bold=False, color=TXT, italic=False):
            r = p.add_run(); r.text = text
            f = r.font; f.name = "Arial"; f.size = Pt(size); f.bold = bold; f.italic = italic; f.color.rgb = color

        t = tb(0.5, 0.11, 12.3, 0.6)
        run(t.paragraphs[0], "Appendix G: References", 22)
        t = tb(0.5, 0.85, 12.3, 0.3)
        run(t.paragraphs[0], "† = secondary source, value read from a chart, or source still to be added: verify before submission. "
                             "Slide numbers in brackets. Full links: deck/REFERENCES.md", 9.5, italic=True, color=MUTED)

        # flow the groups into two columns
        cols = [[], []]
        total = sum(1 + len(r) for _, r in groups)
        acc = 0
        for g in groups:
            cols[0 if acc < total / 2 else 1].append(g)
            acc += 1 + len(g[1])
        for ci, col in enumerate(cols):
            t = tb(0.5 + ci * 6.3, 1.25, 6.0, 5.6)
            first = True
            for group, rows in col:
                p = t.paragraphs[0] if first else t.add_paragraph(); first = False
                p.space_before = Pt(0 if p is t.paragraphs[0] else 6); p.space_after = Pt(3)
                run(p, group, 10.5, bold=True, color=BLUE)
                for num, cite, url, slides, verify in rows:
                    p = t.add_paragraph(); p.space_after = Pt(3)
                    run(p, f"[{num}] ", 8, bold=True, color=BLUE)
                    run(p, cite + ("†" if verify else ""), 8)
                    run(p, f"  ({slides})", 8, color=MUTED)
        # keep the summary slide last: move the references just before it
        lst = prs.slides._sldIdLst; ids = list(lst)
        if any(sh.has_text_frame and sh.text_frame.text.startswith("Summary") for sh in prs.slides[len(ids) - 2].shapes):
            new = ids[-1]; lst.remove(new); lst.insert(len(ids) - 2, new)
    prs.save(dst)


if __name__ == "__main__":
    write_md(Path(__file__).with_name("REFERENCES.md"))
    add_slides(sys.argv[1], sys.argv[2])
