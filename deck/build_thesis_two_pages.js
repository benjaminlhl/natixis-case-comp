// Investment thesis on two pages (reorganised from the team's new.pptx) in the team template (blue, Arial, section footer).
// Page 1, thesis 1: what we own (Asia's AI hardware bottlenecks, and the violent path of the indices that hold them).
// Page 2, thesis 2: why we wrap it in an autocall now (rates high for longer, record volatility funds the coupon).
// Data: deck/thesis_market_data.json, pricing/scenario2_thesis_numbers.json;
// coupon figures from the team's annual step-down pricing (pricing/natixis_2.pdf, Appendix E).
// Build: NODE_PATH=<dir with pptxgenjs> node deck/build_thesis_two_pages.js
const path = require("path");
const pptxgen = require("pptxgenjs");
const TN = require(path.join(__dirname, "..", "pricing", "scenario2_thesis_numbers.json"));
const MD = require(path.join(__dirname, "thesis_market_data.json"));

const BLUE = "2C5F82", BLUE_M = "8DB3D1", GRAY = "F2F2F2", TXT = "262626", MUTED = "595959",
      WHITE = "FFFFFF", LINE = "BFBFBF", RED = "B23B3B";
const F = "Arial";
const pct = (x, d = 1) => (x >= 0 ? "" : "−") + (Math.abs(x) * 100).toFixed(d) + "%";
const FAIR = 13.752219, CLIENT = 10, FUND_5Y = 5.69;

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
  // Three evidence rows per column, each: big number | finding | → what it means for the note
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
      "What we own: structural demand for Asian chips, memory and tools, bought in markets that are concentrated, fully priced and violent");

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
      ["~70%", "Taiwan makes the chips", "TSMC's share of global foundry revenue; TSMC is >40% of TAIEX.", "EWT 15% and 00878 TT 15%"],
      ["83%", "Korea makes the memory", "SK hynix + Samsung share of HBM, the memory every AI accelerator needs.", "EWY 20%"],
      ["~55%", "Japan makes the tools", "Advantest's share of chip test equipment; with Tokyo Electron ≈ 20% of the Nikkei.", "2644 JP 15%; 3119 HK 35% spans the region"],
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
       { text: "Down 10–25% in 2022; KOSPI fell 8.95% in a single day (13 Jul 2026)." }],
      { x: RX + 3.75, y: 2.0, w: CW - 3.75, h: 2.0, fontSize: 9.5, paraSpaceAfter: 2 });
    rows(RX, [
      ["−25%", "Round trips happen fast", "KOSPI went from 9,000+ in June to 6,789 on 28 Aug; J.P. Morgan expects a 10–15% correction in 2026.",
        "Buying in one go is risky: the note pays on recovery, no timing needed", true],
      [">40%", "Returns hinge on a few names", "TSMC >40% of TAIEX; Samsung + SK hynix ~48% of KOSPI; ~92% of advanced chips from Taiwan.",
        "Diversified five-ETF basket, not a worst-of on single names", true],
      ["38.6×", "Valuations price in a lot", "Nikkei CAPE 38.6×; Taiwan among the most expensive markets; DRAM gains slowing.",
        "Coupons lock in gains if the rally stalls", true],
    ]);

    banner("Whichever AI company wins, it needs Asia's chips, memory and tools, but the path to owning them is violent.");
    sources("WSTS; company capex guidance; Counterpoint (foundry, HBM); TrendForce (DRAM); industry research (test equipment); J.P. Morgan AWM 2026 Outlook; TWSE, KRX, Nikkei (index levels); FN News, BIT Research (KOSPI); Siblis (CAPE). Full list: deck/thesis_sources.md.");
    s.addNotes("Thesis 1, what we own. AI spending is a hardware boom and Asia holds the three bottlenecks: Taiwan's foundries, Korea's high-bandwidth memory, Japan's chip-making tools; each maps to an ETF in the basket. The demand is structural, but the memory cycle is maturing and the indices that hold the theme move violently: KOSPI lost about a quarter between June and August. Returns are concentrated in a few names and valuations are full, which is why we hold a diversified basket and take the return as coupons rather than buying outright.");
  }

  // ================= Page 2: thesis 2, why an autocall now =================
  {
    const { s, T, header, rows, banner, sources } = frame(pres,
      "Investment thesis 2: High rates and record volatility favour an autocall",
      "Why we wrap it: rates stay high, so bonds carry rate risk; volatility is at records, so the option the client sells is worth more than ever");
    const DOT = MD.fomc_dots_sep2026;
    const n = (y) => Object.values(DOT[y]).reduce((a, b) => a + b, 0);

    header(LX, "2a", "Rates stay high for longer");
    const iw = 5.55, ih = iw * 638 / 1804;
    s.addImage({ path: path.join(__dirname, "fomc_dot_plot_compact.png"), x: LX + (CW - iw) / 2, y: 1.92, w: iw, h: ih });
    T("FOMC dot plot, 16 Sep 2026 (shaded: today's 3.75–4.00%). Dots read from the Fed's chart.",
      { x: LX, y: 1.92 + ih + 0.02, w: CW, h: 0.18, fontSize: 7.5, italic: true, color: MUTED });
    rows(LX, [
      ["4.125%", "FOMC median to end-2027, cuts deferred to 2028",
        `${DOT["2026"]["4.125"]} of ${n("2026")} dots at 4.125% for 2026; 4.375% seen by ${DOT["2026"]["4.375"]} for 2026 and ${DOT["2027"]["4.375"]} for 2027.`,
        "Rate risk is structural, not a one-off"],
      ["+0.25%", "The Fed is hiking again", "16 Sep 2026: to 3.75–4.00%, the first hike since 2023; futures price ~87% odds of at least one more.",
        "Locking in a long fixed rate now is not attractive"],
      [pct(TN.rates["+100bp"].bond_value_change), "Long bonds carry rate risk", `a 5-year bond loses ~${pct(-TN.rates["+100bp"].bond_value_change)} per 1% rise in rates.`,
        "The note can redeem from year 1: short duration, cash back to reinvest higher"],
    ]);

    header(RX, "2b", "Record volatility pays the coupon");
    s.addChart(pres.charts.BAR, [{ name: "% a year", labels: ["5Y USD rate", "Client coupon", "Fair coupon"], values: [FUND_5Y, CLIENT, +FAIR.toFixed(2)] }],
      Object.assign(chartBase(), { x: RX, y: 1.95, w: 3.3, h: 2.05, barDir: "col", chartColors: ["A6A6A6", BLUE, BLUE_M], showValue: true,
        dataLabelPosition: "outEnd", dataLabelFormatCode: '0.00"%"', dataLabelFontSize: 8.5, dataLabelColor: TXT, valAxisHidden: true,
        valGridLine: { style: "none" }, valAxisMinVal: 0, valAxisMaxVal: 16, title: "Income on USD 100, % a year", showLegend: false }));
    T([{ text: "Volatility is the client's to sell", options: { bold: true, color: BLUE, breakLine: true } },
       { text: "In an autocall the client sells options on the basket; the higher the volatility, the more they are worth.", options: { breakLine: true } },
       { text: "High rates add to it", options: { bold: true, color: BLUE, breakLine: true } },
       { text: `At ${FUND_5Y}% 5Y USD funding, the forward drift and discounting raise the coupon the note can pay.` }],
      { x: RX + 3.45, y: 2.0, w: CW - 3.45, h: 2.0, fontSize: 9.5, paraSpaceAfter: 2 });
    rows(RX, [
      ["91.2", "Volatility is at records", "VKOSPI closed at an all-time high of 91.2 (9 Jun 2026), above the 2008 peak.",
        "Rich option premium funds a coupon well above bonds", true],
      [FAIR.toFixed(2) + "%", "Fair coupon a year", "Monte Carlo value of the five-ETF annual step-down autocall at today's rates, vols and correlations.",
        `Natixis keeps ${(FAIR - CLIENT).toFixed(2)}% a year for structuring and hedging`],
      [CLIENT + "%", "Client coupon a year", "Paid when the basket is at or above the call level (102.5% in year 1, stepping down to 92.5% in year 5).",
        "Coupons pay while the market swings; 70% barrier checked at maturity only"],
    ]);

    banner(`Rates and volatility make the option the client sells valuable: we turn it into a ${CLIENT}% coupon on Asia's AI hardware.`);
    sources(`Federal Reserve SEP (16 Sep 2026, dots read from chart); Federal Reserve via Advisor Perspectives; fed funds futures; Herald / SBS (VKOSPI); case USD funding grid (5Y ${FUND_5Y}%); standard bond maths; team Monte Carlo pricing (Appendix E: fair coupon ${FAIR.toFixed(6)}%).`);
    s.addNotes(`Thesis 2, why an autocall now. The Fed's dot plot keeps the median at 4.125% to end-2027 with cuts only from 2028, and it has just hiked, so a long bond carries real rate risk (about ${pct(-TN.rates["+100bp"].bond_value_change)} per 1% rise). The autocall can redeem from year 1, so its duration is short. Volatility is at records, and in an autocall the client sells options on the basket, so rich option premium plus high rates fund a fair coupon of ${FAIR.toFixed(2)}% a year. We pay the client ${CLIENT}% and keep ${(FAIR - CLIENT).toFixed(2)}% a year.`);
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
