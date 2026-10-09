// Investment thesis on two pages (reorganised from the team's new.pptx) in the team template (blue, Arial, section footer).
// Page 1, thesis 1: the theme (Asia's AI hardware bottlenecks, and the violent path of the indices that hold them).
// Indicators only: no product or strategy content, which follows on the strategy slides.
// Page 2, thesis 2: the backdrop (rates high for longer, bonds carry rate risk, record equity volatility).
// Data: deck/thesis_market_data.json, pricing/scenario2_thesis_numbers.json;
// Build: NODE_PATH=<dir with pptxgenjs> node deck/build_thesis_two_pages.js
const path = require("path");
const pptxgen = require("pptxgenjs");
const TN = require(path.join(__dirname, "..", "pricing", "scenario2_thesis_numbers.json"));
const MD = require(path.join(__dirname, "thesis_market_data.json"));

const BLUE = "2C5F82", BLUE_M = "8DB3D1", GRAY = "F2F2F2", TXT = "262626", MUTED = "595959",
      WHITE = "FFFFFF", LINE = "BFBFBF", RED = "B23B3B";
const F = "Arial";
const pct = (x, d = 1) => (x >= 0 ? "" : "−") + (Math.abs(x) * 100).toFixed(d) + "%";
const FUND_5Y = 5.69;

const LX = 0.5, RX = 6.83, CW = 6.0;

function frame(pres, title, subtitle) {
  const s = pres.addSlide();
  s.background = { color: WHITE };
  const T = (t, o) => s.addText(t, Object.assign({ fontFace: F, fontSize: 12, color: TXT, margin: 0, valign: "top", isTextBox: true }, o));
  T(title, { x: 0.5, y: 0.3, w: 12.33, h: 0.6, fontSize: 22, valign: "middle" });
  s.addShape(pres.shapes.LINE, { x: 0.5, y: 0.98, w: 12.33, h: 0, line: { color: BLUE, width: 1 } });
  s.addShape(pres.shapes.LINE, { x: 0.5, y: 6.98, w: 12.33, h: 0, line: { color: LINE, width: 0.75 } });
  [["ANALYSIS", 0.5], ["STRATEGY", 4.69], ["APPENDIX", 8.89]].forEach(([t, x]) => {
    const on = t === "ANALYSIS";
    if (on) s.addShape(pres.shapes.RECTANGLE, { x: x + 0.6, y: 6.96, w: 2.75, h: 0.05, fill: { color: BLUE }, line: { color: BLUE } });
    T(t, { x, y: 7.05, w: 3.95, h: 0.3, fontSize: 12, bold: on, color: on ? BLUE : MUTED, align: "center", charSpacing: 1 });
  });
  T(subtitle, { x: 0.5, y: 1.04, w: 12.33, h: 0.3, fontSize: 10.5, italic: true, color: MUTED });
  const header = (x, num, text) => {
    s.addShape(pres.shapes.RECTANGLE, { x, y: 1.42, w: CW, h: 0.42, fill: { color: BLUE }, line: { color: BLUE } });
    T([{ text: num + "  ", options: { bold: true, color: BLUE_M } }, { text, options: { bold: true, color: WHITE } }],
      { x: x + 0.15, y: 1.42, w: CW - 0.3, h: 0.42, fontSize: 12.5, valign: "middle" });
  };
  // Three evidence rows per column, each: big number | finding | → what it implies
  const rows = (x, items) => items.forEach(([big, head, body, link, red], i) => {
    const y = 4.12 + i * 0.66, h = 0.6, c = red ? RED : BLUE;
    s.addShape(pres.shapes.RECTANGLE, { x, y, w: CW, h, fill: { color: i % 2 ? WHITE : GRAY }, line: { color: GRAY } });
    s.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.07, h, fill: { color: c }, line: { color: c } });
    T(big, { x: x + 0.12, y, w: 1.15, h, fontSize: 17, bold: true, color: c, align: "center", valign: "middle" });
    const runs = [{ text: head + ": ", options: { bold: true, color: TXT } }, { text: body, options: { color: MUTED, breakLine: !!link } }];
    if (link) runs.push({ text: "→ " + link, options: { bold: true, color: BLUE } });
    T(runs, { x: x + 1.35, y, w: CW - 1.45, h, fontSize: 9, valign: "middle", paraSpaceAfter: 1 });
  });
  const banner = (text) => {
    s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 6.1, w: 12.33, h: 0.46, fill: { color: BLUE }, line: { color: BLUE } });
    T(text, { x: 0.65, y: 6.1, w: 12.03, h: 0.46, fontSize: 11.5, bold: true, color: WHITE, align: "center", valign: "middle" });
  };
  const sources = (text) => T("Sources: " + text, { x: 0.5, y: 6.62, w: 12.33, h: 0.32, fontSize: 7.5, italic: true, color: MUTED });
  return { s, T, header, rows, banner, sources };
}

const chartBase = () => ({ catAxisLabelColor: MUTED, valAxisLabelColor: MUTED, catAxisLabelFontFace: F, valAxisLabelFontFace: F,
  catAxisLabelFontSize: 8.5, valAxisLabelFontSize: 8, valGridLine: { color: "E3E3E3", size: 0.5 }, catGridLine: { style: "none" },
  showTitle: true, titleFontFace: F, titleColor: TXT, titleFontSize: 9.5, catAxisLineColor: LINE });

function addThesisTwoPages(pres) {
  // ================= Page 1: thesis 1, what we own =================
  {
    const { s, T, header, rows, banner, sources } = frame(pres,
      "Investment thesis 1: Asia controls AI's hardware bottlenecks",
      "The theme: structural demand for Asian chips, memory and tools, traded in markets that are concentrated, fully priced and violent");

    header(LX, "1a", "Demand is structural, and it runs through Asia");
    const cm = MD.chip_market_bn;
    s.addChart(pres.charts.BAR, [{ name: "Chip market", labels: cm.labels, values: cm.values }],
      Object.assign(chartBase(), { x: LX, y: 1.95, w: 2.8, h: 2.05, barDir: "col", chartColors: [BLUE, BLUE, BLUE_M, BLUE_M], showValue: true,
        dataLabelPosition: "outEnd", dataLabelFormatCode: '"$"#,##0', dataLabelFontSize: 8, dataLabelColor: TXT, valAxisHidden: true,
        valGridLine: { style: "none" }, valAxisMinVal: 0, valAxisMaxVal: 2250, title: "Global chip market, US$bn (WSTS)", showLegend: false }));
    T([{ text: "Demand is structural", options: { bold: true, color: BLUE, breakLine: true } },
       { text: "Hyperscaler capex ~US$725bn in 2026 (+77%); the chip market nearly doubles to ~US$1.5trn.", options: { breakLine: true } },
       { text: "The moat runs through Asia", options: { bold: true, color: BLUE, breakLine: true } },
       { text: "8 of the world's 10 largest companies depend on TSMC (J.P. Morgan).", options: { breakLine: true } },
       { text: "…but the cycle is maturing", options: { bold: true, color: RED, breakLine: true } },
       { text: "DRAM price gains slowing: +48% in Q2, ~+13% expected in Q4 2026." }],
      { x: LX + 2.95, y: 2.0, w: CW - 2.95, h: 2.0, fontSize: 9.5, paraSpaceAfter: 2 });
    rows(LX, [
      ["~70%", "Taiwan makes the chips", "TSMC's share of global foundry revenue; TSMC is >40% of TAIEX.", "Taiwan is the single largest AI chokepoint"],
      ["83%", "Korea makes the memory", "SK hynix + Samsung share of HBM, the memory every AI accelerator needs.", "No AI accelerator ships without Korean memory"],
      ["~55%", "Japan makes the tools", "Advantest's share of chip test equipment; with Tokyo Electron ≈ 20% of the Nikkei.", "Every new fab needs Japanese tools"],
    ]);

    header(RX, "1b", "A strong theme on a violent path");
    const idx = ["TAIEX", "KOSPI", "Nikkei 225"].map((k) => ({ name: k, labels: MD.index_levels.labels,
      values: MD.index_levels[k].map((v) => +(v / MD.index_levels[k][0] * 100).toFixed(1)) }));
    s.addChart(pres.charts.LINE, idx, Object.assign(chartBase(), { x: RX, y: 1.95, w: 3.6, h: 2.05, chartColors: [BLUE, RED, "A6A6A6"], lineSize: 2,
      lineDataSymbol: "circle", lineDataSymbolSize: 4, valAxisMinVal: 50, valAxisMaxVal: 325, valAxisMajorUnit: 50, valAxisLabelFontSize: 7.5,
      catAxisLabelFontSize: 7, title: "Index level, end-2021 = 100", showLegend: true, legendPos: "b", legendFontSize: 7.5, legendFontFace: F }));
    T([{ text: "Growth is structural…", options: { bold: true, color: BLUE, breakLine: true } },
       { text: "TAIEX and KOSPI are 2–3× their end-2022 levels on AI demand.", options: { breakLine: true } },
       { text: "…but the path is violent", options: { bold: true, color: RED, breakLine: true } },
       { text: "Down 10–25% in 2022; records in June 2026, then sharp falls within weeks." }],
      { x: RX + 3.75, y: 2.0, w: CW - 3.75, h: 2.0, fontSize: 9.5, paraSpaceAfter: 2 });
    rows(RX, [
      ["−25%", "Round trips happen fast", "KOSPI went from 9,000+ in June to 6,789 on 28 Aug 2026, in about ten weeks.",
        "Entry timing is hard; drawdowns are deep and quick", true],
      [">40%", "Returns hinge on a few names", "TSMC >40% of TAIEX; Samsung + SK hynix ~48% of KOSPI; ~92% of advanced chips from Taiwan.",
        "Single-name risk is high", true],
      ["38.6×", "Valuations price in a lot", "Nikkei CAPE 38.6×; Taiwan among the most expensive markets; DRAM gains slowing.",
        "Upside from here is less certain than the theme", true],
    ]);

    banner("Whichever AI company wins, it needs Asia's chips, memory and tools, but the path to owning them is violent.");
    sources("WSTS; company capex guidance; Counterpoint (foundry, HBM); TrendForce (DRAM); industry research (test equipment); J.P. Morgan AWM 2026 Outlook; TWSE, KRX, Nikkei (index levels); FN News, BIT Research (KOSPI); Siblis (CAPE). Full list: deck/thesis_sources.md.");
    s.addNotes("Thesis 1, the theme. AI spending is a hardware boom and Asia holds the three bottlenecks: Taiwan's foundries, Korea's high-bandwidth memory, Japan's chip-making tools. The demand is structural, but the memory cycle is maturing and the indices that hold the theme move violently: KOSPI lost about a quarter between June and August. Returns are concentrated in a few names and valuations are full.");
  }

  // ================= Page 2: thesis 2, the rate and volatility backdrop =================
  {
    const { s, T, header, rows, banner, sources } = frame(pres,
      "Investment thesis 2: Rates stay high and volatility is at records",
      "The backdrop for the next five years: the Fed holds rates high, bonds carry rate risk, and Asian equities swing harder than ever");
    const DOT = MD.fomc_dots_sep2026;
    const n = (y) => Object.values(DOT[y]).reduce((a, b) => a + b, 0);

    header(LX, "2a", "The Fed holds rates high for longer");
    const iw = 5.55, ih = iw * 638 / 1804;
    s.addImage({ path: path.join(__dirname, "fomc_dot_plot_compact.png"), x: LX + (CW - iw) / 2, y: 1.92, w: iw, h: ih });
    T("FOMC dot plot, 16 Sep 2026 (shaded: today's 3.75–4.00%). Dots read from the Fed's chart.",
      { x: LX, y: 1.92 + ih + 0.02, w: CW, h: 0.18, fontSize: 7.5, italic: true, color: MUTED });
    rows(LX, [
      ["4.125%", "FOMC median to end-2027, cuts deferred to 2028",
        `${DOT["2026"]["4.125"]} of ${n("2026")} dots at 4.125% for 2026; 4.375% seen by ${DOT["2026"]["4.375"]} for 2026 and ${DOT["2027"]["4.375"]} for 2027.`,
        "Rate risk is structural, not a one-off"],
      ["+0.25%", "The Fed is hiking again", "16 Sep 2026: to 3.75–4.00%, the first hike since 2023.",
        "The easing cycle is over for now"],
      ["~87%", "Markets price more", "probability of at least one further hike priced by fed funds futures.",
        "Risk to rates is still to the upside"],
    ]);

    header(RX, "2b", "Bonds carry rate risk, equities swing hard");
    const RK = ["-200bp", "-100bp", "base", "+100bp", "+200bp"];
    s.addChart(pres.charts.BAR, [{ name: "5Y USD bond", labels: ["−2%", "−1%", "0", "+1%", "+2%"],
        values: RK.map((k) => k === "base" ? 0 : +(TN.rates[k].bond_value_change * 100).toFixed(1)) }],
      Object.assign(chartBase(), { x: RX, y: 1.95, w: 3.3, h: 2.05, barDir: "col", chartColors: [BLUE], invertIfNegative: false, showValue: true,
        dataLabelPosition: "outEnd", dataLabelFormatCode: '+0.0"%";−0.0"%";0', dataLabelFontSize: 8, dataLabelColor: TXT, valAxisHidden: true,
        valGridLine: { style: "none" }, valAxisMinVal: -12, valAxisMaxVal: 12, catAxisLabelPos: "low",
        title: "5Y USD bond price change vs rate move", showLegend: false }));
    T([{ text: "Yields are high…", options: { bold: true, color: BLUE, breakLine: true } },
       { text: `5Y USD at ${FUND_5Y}%: high income on offer.`, options: { breakLine: true } },
       { text: "…but prices are exposed", options: { bold: true, color: RED, breakLine: true } },
       { text: "With hikes back on the table, a fixed rate locked in today loses value if rates rise further." }],
      { x: RX + 3.45, y: 2.0, w: CW - 3.45, h: 2.0, fontSize: 9.5, paraSpaceAfter: 2 });
    rows(RX, [
      [pct(TN.rates["+100bp"].bond_value_change), "Long bonds carry rate risk", `a 5-year bond loses ~${pct(-TN.rates["+100bp"].bond_value_change)} per 1% rise in rates.`,
        "Duration is a risk, not a hedge, in this cycle"],
      ["91.2", "Volatility is at records", "VKOSPI closed at an all-time high of 91.2 (9 Jun 2026), above the 2008 peak.",
        "Option-implied risk in Asian equities is extreme", true],
      ["−8.95%", "Single days move markets", "KOSPI's one-day fall on 13 Jul 2026; J.P. Morgan expects a 10–15% correction in 2026.",
        "Buy-and-hold must sit through deep drawdowns", true],
    ]);

    banner("Rates stay high for longer and Asian equity volatility is at records: neither bonds nor buy-and-hold are a comfortable place to sit.");
    sources(`Federal Reserve SEP (16 Sep 2026, dots read from chart); Federal Reserve via Advisor Perspectives; fed funds futures; case USD funding grid (5Y ${FUND_5Y}%); standard bond maths; Herald / SBS (VKOSPI); FN News, BIT Research (KOSPI); J.P. Morgan AWM 2026 Outlook.`);
    s.addNotes(`Thesis 2, the backdrop. The Fed's dot plot keeps the median at 4.125% to end-2027 with cuts only from 2028; it has just hiked and futures price more. Yields are high, but a long bond loses about ${pct(-TN.rates["+100bp"].bond_value_change)} per 1% rise, so duration is a risk. Asian equity volatility is at records: VKOSPI hit 91.2 and KOSPI fell nearly 9% in one day. Both bonds and buy-and-hold carry more risk than usual.`);
  }
}
module.exports = { addThesisTwoPages };

if (require.main === module) {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
  pres.title = "Investment thesis on two pages";
  addThesisTwoPages(pres);
  pres.writeFile({ fileName: path.join(__dirname, "Investment-Thesis-TwoPages.pptx") }).then((f) => console.log("wrote", f));
}
