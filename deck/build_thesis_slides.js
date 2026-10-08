// Investment-thesis slides in the team template style (blue bars, Arial, section footer).
// Market-only investment thesis: no reference to our product. External facts are cited on each slide
// (full list in deck/thesis_sources.md); market series in deck/thesis_market_data.json; bond rate sensitivity
// from pricing/scenario2_thesis_numbers.json (bond figures only).
// Build: NODE_PATH=<dir with pptxgenjs, react, react-dom, react-icons, sharp> node deck/build_thesis_slides.js
const path = require("path");
const pptxgen = require("pptxgenjs");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const sharp = require("sharp");
const { FaMicrochip, FaMemory, FaTools } = require("react-icons/fa");
const RES = require(path.join(__dirname, "..", "pricing", "scenario2_results.json"));
const TN = require(path.join(__dirname, "..", "pricing", "scenario2_thesis_numbers.json"));
const MD = require(path.join(__dirname, "thesis_market_data.json"));
// Index levels rebased to 100 at end-2021
const idxSeries = () => ["TAIEX", "KOSPI", "Nikkei 225"].map((k) => ({ name: k, labels: MD.index_levels.labels,
  values: MD.index_levels[k].map((v) => +(v / MD.index_levels[k][0] * 100).toFixed(1)) }));
const RATE_KEYS = ["-200bp", "-150bp", "-100bp", "-50bp", "base", "+50bp", "+100bp", "+150bp", "+200bp"];
const BLUE = "2C5F82", BLUE_L = "E8EFF5", BLUE_M = "8DB3D1", GRAY = "F2F2F2", TXT = "262626", MUTED = "595959",
      WHITE = "FFFFFF", LINE = "BFBFBF", RED = "B23B3B", DGRAY = "7F7F7F";
const F = "Arial";
const pct = (x, d = 1) => (x >= 0 ? "" : "−") + (Math.abs(x) * 100).toFixed(d) + "%";

async function icon(Comp, color) {
  const svg = renderToStaticMarkup(React.createElement(Comp, { color: "#" + color, size: 256 }));
  return "image/png;base64," + (await sharp(Buffer.from(svg)).png().toBuffer()).toString("base64");
}

(async () => {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
  pres.title = "Investment thesis slides";

  const mk = (titleText, section) => {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    const T = (t, o) => s.addText(t, Object.assign({ fontFace: F, fontSize: 12, color: TXT, margin: 0, valign: "top", isTextBox: true }, o));
    T(titleText, { x: 0.5, y: 0.3, w: 12.3, h: 0.6, fontSize: 24, valign: "middle" });
    s.addShape(pres.shapes.LINE, { x: 0.5, y: 0.98, w: 12.33, h: 0, line: { color: BLUE, width: 1 } });
    s.addShape(pres.shapes.LINE, { x: 0.5, y: 6.98, w: 12.33, h: 0, line: { color: LINE, width: 0.75 } });
    [["ANALYSIS", 0.5], ["STRATEGY", 4.69], ["APPENDIX", 8.89]].forEach(([t, x]) => {
      const on = t === section;
      if (on) s.addShape(pres.shapes.RECTANGLE, { x: x + 0.6, y: 6.96, w: 2.75, h: 0.05, fill: { color: BLUE }, line: { color: BLUE } });
      T(t, { x, y: 7.05, w: 3.95, h: 0.3, fontSize: 12, bold: on, color: on ? BLUE : MUTED, align: "center", charSpacing: 1 });
    });
    return { s, T };
  };
  const bar = (s, T, x, y, w, text) => {
    s.addShape(pres.shapes.RECTANGLE, { x, y, w, h: 0.42, fill: { color: BLUE }, line: { color: BLUE } });
    T(text, { x, y, w, h: 0.42, fontSize: 14, bold: true, italic: true, color: WHITE, align: "center", valign: "middle" });
  };
  const banner = (s, T, text) => {
    s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 6.18, w: 12.33, h: 0.55, fill: { color: BLUE }, line: { color: BLUE } });
    T(text, { x: 0.65, y: 6.18, w: 12.03, h: 0.55, fontSize: 12.5, bold: true, color: WHITE, align: "center", valign: "middle" });
  };
  const note = (T, text, y = 5.86) => T(text, { x: 0.5, y, w: 12.33, h: 0.3, fontSize: 8, italic: true, color: MUTED });
  const chartBase = () => ({ catAxisLabelColor: MUTED, valAxisLabelColor: MUTED, catAxisLabelFontFace: F, valAxisLabelFontFace: F,
    catAxisLabelFontSize: 10, valAxisLabelFontSize: 9, valGridLine: { color: "E3E3E3", size: 0.5 }, catGridLine: { style: "none" },
    titleFontFace: F, titleColor: TXT, titleFontSize: 11, showTitle: true, catAxisLineColor: LINE });

  // ===== Thesis 1: AI is a hardware boom, and Asia owns the chokepoints =====
  {
    const { s, T } = mk("Investment thesis 1: AI is a hardware boom, and Asia owns the chokepoints", "ANALYSIS");
    bar(s, T, 0.5, 1.15, 7.0, "Taiwan, Korea and Japan each control a bottleneck");
    const rows = [
      [FaMicrochip, "Taiwan: makes the chips", "~70%", "TSMC share of global\nfoundry revenue (Q1 2026)",
        ["HPC/AI 58% of TSMC revenue (2025); 3nm sold out through 2026", "TAIEX record 48,476 (2 Oct 2026), ~+67% YTD; TSMC >40% of the index"]],
      [FaMemory, "Korea: makes the memory", "83%", "SK hynix (50%) + Samsung (33%)\nshare of HBM revenue (Q2 2026)",
        ["DRAM contract prices +45–50% q/q in Q2 2026; server DRAM still undersupplied", "KOSPI forward P/E 7.8× vs 23× trailing: earnings, not just multiples"]],
      [FaTools, "Japan: makes the tools", "~55%", "Advantest share of chip\ntest equipment",
        ["Test equipment +31% and DRAM equipment +39% in 2026 (SEMI)", "Advantest + Tokyo Electron ≈ 20% of the Nikkei 225; forward P/E 17.2×"]],
    ];
    for (let i = 0; i < rows.length; i++) {
      const [ic, head, big, bigLab, pts] = rows[i], y = 1.68 + i * 1.33;
      s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y, w: 7.0, h: 1.23, fill: { color: i % 2 ? WHITE : GRAY }, line: { color: GRAY } });
      s.addShape(pres.shapes.OVAL, { x: 0.65, y: y + 0.15, w: 0.5, h: 0.5, fill: { color: BLUE }, line: { color: BLUE } });
      s.addImage({ data: await icon(ic, WHITE), x: 0.77, y: y + 0.27, w: 0.26, h: 0.26 });
      T(head, { x: 1.3, y: y + 0.1, w: 3.3, h: 0.32, fontSize: 13.5, bold: true, italic: true, color: BLUE, valign: "middle" });
      T(pts.map((t, j) => ({ text: t, options: { bullet: { indent: 10 }, breakLine: j < pts.length - 1 } })),
        { x: 1.3, y: y + 0.45, w: 3.6, h: 0.76, fontSize: 9.5, color: MUTED, paraSpaceAfter: 2 });
      T(big, { x: 4.95, y: y + 0.06, w: 2.45, h: 0.55, fontSize: 28, bold: true, color: BLUE, align: "center", valign: "middle" });
      T(bigLab, { x: 4.95, y: y + 0.61, w: 2.45, h: 0.55, fontSize: 9, color: MUTED, align: "center" });
    }
    bar(s, T, 7.75, 1.15, 5.08, "Demand is surging, but the cycle is maturing");
    const cm = MD.chip_market_bn;
    s.addChart(pres.charts.BAR, [{ name: "Chip market", labels: cm.labels, values: cm.values }],
      Object.assign(chartBase(), { x: 7.75, y: 1.62, w: 2.45, h: 2.25, barDir: "col", chartColors: [BLUE, BLUE, BLUE_M, BLUE_M], showValue: true, dataLabelPosition: "outEnd",
        dataLabelFormatCode: '"$"#,##0', dataLabelFontSize: 8, dataLabelColor: TXT, valAxisHidden: true, valGridLine: { style: "none" }, valAxisMinVal: 0, valAxisMaxVal: 2200,
        title: "Chip market, US$bn (WSTS)", titleFontSize: 9.5, showLegend: false, catAxisLabelFontSize: 8.5 }));
    const cx = MD.hyperscaler_capex_bn;
    s.addChart(pres.charts.BAR, [{ name: "2025", labels: cx.labels, values: cx["2025"] }, { name: "2026 guidance", labels: cx.labels, values: cx["2026 guidance (mid)"] }],
      Object.assign(chartBase(), { x: 10.3, y: 1.62, w: 2.53, h: 2.25, barDir: "col", barGrouping: "clustered", chartColors: [BLUE_M, BLUE], showValue: true, dataLabelPosition: "outEnd",
        dataLabelFormatCode: "0", dataLabelFontSize: 7, dataLabelColor: TXT, valAxisHidden: true, valGridLine: { style: "none" }, valAxisMinVal: 0, valAxisMaxVal: 240,
        title: "Hyperscaler capex, US$bn", titleFontSize: 9.5, showLegend: true, legendPos: "b", legendFontSize: 7.5, legendFontFace: F, catAxisLabelFontSize: 7.5 }));
    const dr = [["Q2 2026", 47.5], ["Q3 2026", 15.5], ["Q4 2026e", 12.5]];
    s.addChart(pres.charts.BAR, [{ name: "DRAM", labels: dr.map((x) => x[0]), values: dr.map((x) => x[1]) }],
      Object.assign(chartBase(), { x: 7.75, y: 3.9, w: 2.6, h: 1.9, barDir: "col", chartColors: [BLUE_M], showValue: true, dataLabelPosition: "outEnd",
        dataLabelFormatCode: '"+"0"%"', dataLabelFontSize: 9, dataLabelColor: TXT, valAxisHidden: true, valGridLine: { style: "none" }, valAxisMinVal: 0, valAxisMaxVal: 60,
        title: "DRAM contract price, q/q", titleFontSize: 9.5, showLegend: false, catAxisLabelFontSize: 8.5 }));
    s.addShape(pres.shapes.RECTANGLE, { x: 10.45, y: 3.95, w: 2.38, h: 1.85, fill: { color: BLUE_L }, line: { color: BLUE_L } });
    T([{ text: "Cycle check", options: { bold: true, italic: true, color: BLUE, breakLine: true } },
       { text: "Memory prices still rising, but gains slowing (midpoints of TrendForce ranges)", options: { bullet: { indent: 8 }, breakLine: true } },
       { text: "US 25% tariff on some advanced chips since Jan 2026 (Section 232)", options: { bullet: { indent: 8 }, breakLine: true } },
       { text: "Structural demand, cyclical prices: own it through a structure built for volatility (thesis 2)", options: { bullet: { indent: 8 }, bold: true } }],
      { x: 10.55, y: 4.02, w: 2.2, h: 1.75, fontSize: 8.5, color: TXT, paraSpaceAfter: 2 });
    note(T, "Sources: Counterpoint (foundry, HBM); TSMC; Trading Economics / TWSE; TrendForce (DRAM, range midpoints); Siblis (P/E, 1 Jul 2026); SEMI (14 Jul 2026); WSTS (2025 actual $795.6bn; 2024 implied; 2026–27 Spring 2026 forecast); company reports and guidance midpoints (capex; Microsoft 2025 calendar-year estimate); White House Proclamation 11002.");
    banner(s, T, "Whichever AI model or company wins, it needs Taiwan's chips, Korea's memory and Japan's tools.");
    s.addNotes("Thesis 1. AI is a hardware story and Taiwan, Korea and Japan each own a bottleneck. The boom is visible in earnings, not just prices: KOSPI's forward P/E of 7.8x against 23x trailing means analysts expect earnings to roughly triple. But the cycle is maturing: memory price increases are decelerating and US tariffs are a live risk. That tension, a great theme on a risky path, is thesis 2.");
  }

  // ===== Third-party view: J.P. Morgan 2026 Outlook =====
  {
    const { s, T } = mk("J.P. Morgan's 2026 Outlook: the AI moat is real, and so are its cracks", "ANALYSIS");
    T("\"Smothering Heights: is the largest moat in market history indestructible?\" (M. Cembalest, J.P. Morgan Asset & Wealth Management, 1 Jan 2026)",
      { x: 0.5, y: 1.03, w: 12.3, h: 0.3, fontSize: 11, italic: true, color: MUTED });
    const W2 = 6.0, LX = 0.5, RX = 6.83;
    // Left: the theme is the market
    bar(s, T, LX, 1.4, W2, "The theme is the market");
    const cats = ["42 AI stocks", "S&P 500 ex-AI", "MSCI Japan", "MSCI China", "MSCI Europe"];
    s.addChart(pres.charts.BAR, [{ name: "Price return", labels: cats, values: [190, 26, 59, 50, 33] }, { name: "Earnings growth", labels: cats, values: [153, 19, 52, 15, 4] }],
      Object.assign(chartBase(), { x: LX, y: 1.88, w: W2, h: 2.0, barDir: "col", barGrouping: "clustered", chartColors: [BLUE, BLUE_M], showValue: true, dataLabelPosition: "outEnd",
        dataLabelFormatCode: '0"%"', dataLabelFontSize: 8, dataLabelColor: TXT, valAxisHidden: true, valGridLine: { style: "none" }, valAxisMinVal: 0, valAxisMaxVal: 220,
        title: "Since ChatGPT's launch (Nov 2022 to Dec 2025)", titleFontSize: 9.5, showLegend: true, legendPos: "r", legendFontSize: 8.5, legendFontFace: F, catAxisLabelFontSize: 8.5 }));
    const lp = [["$3trn → $18trn", "Market cap of 4 hyperscalers + NVIDIA, TSMC, ASML, AMD in ~7 years: ~20% of MSCI World"],
                ["65–75%", "Share of S&P 500 returns, profits and capex since Nov 2022 from 42 AI-linked stocks"],
                ["8 of 10", "Of the world's 10 largest companies depend heavily on TSMC supply"]];
    lp.forEach((x, i) => {
      const y = 3.98 + i * 0.6;
      s.addShape(pres.shapes.RECTANGLE, { x: LX, y, w: W2, h: 0.54, fill: { color: i % 2 ? WHITE : GRAY }, line: { color: GRAY } });
      T(x[0], { x: LX + 0.1, y, w: 1.75, h: 0.54, fontSize: 15, bold: true, color: BLUE, align: "center", valign: "middle" });
      T(x[1], { x: LX + 1.95, y, w: W2 - 2.05, h: 0.54, fontSize: 9.5, color: TXT, valign: "middle" });
    });
    // Right: but the moat has cracks
    bar(s, T, RX, 1.4, W2, "…but the moat has cracks");
    const rel = [["Europe on Russian energy (2021)", 22], ["World on Taiwan: all chips", 64], ["World on Taiwan: advanced chips", 92]];
    s.addChart(pres.charts.BAR, [{ name: "Reliance", labels: rel.map((x) => x[0]), values: rel.map((x) => x[1]) }],
      Object.assign(chartBase(), { x: RX, y: 1.88, w: W2, h: 2.0, barDir: "col", chartColors: ["A6A6A6", BLUE_M, RED], showValue: true, dataLabelPosition: "outEnd",
        dataLabelFormatCode: '"~"0"%"', dataLabelFontSize: 9, dataLabelColor: TXT, valAxisHidden: true, valGridLine: { style: "none" }, valAxisMinVal: 0, valAxisMaxVal: 105,
        title: "Dependence on a single source (JPM, read from chart)", titleFontSize: 9.5, showLegend: false, catAxisLabelFontSize: 8.5 }));
    const rp = [["10–11 days", "Taiwan's gas storage; LNG is 40% of its power and 90% of energy is imported: \"the most blockade-sensitive advanced economy\""],
                ["$1.3trn", "Hyperscaler capex + R&D since 2022: risk of a \"Metaverse moment\" (Mag 7 fell 50% in 2022)"],
                ["−10–15%", "JPM's base case: a correction at some point in 2026, then markets end the year higher"]];
    rp.forEach((x, i) => {
      const y = 3.98 + i * 0.6;
      s.addShape(pres.shapes.RECTANGLE, { x: RX, y, w: W2, h: 0.54, fill: { color: i % 2 ? WHITE : GRAY }, line: { color: GRAY } });
      T(x[0], { x: RX + 0.1, y, w: 1.75, h: 0.54, fontSize: 15, bold: true, color: RED, align: "center", valign: "middle" });
      T(x[1], { x: RX + 1.95, y, w: W2 - 2.05, h: 0.54, fontSize: 9.5, color: TXT, valign: "middle" });
    });
    note(T, "Source: J.P. Morgan Asset & Wealth Management, Eye on the Market, 2026 Outlook \"Smothering Heights\" (M. Cembalest, 1 Jan 2026), pp. 1–2, 7, 33–35, 46; underlying data Bloomberg, USITC, BP, ROC Taiwan, Global Guardian. Reliance values read from JPM's chart (approximate).");
    banner(s, T, "J.P. Morgan's key risks (concentration, Taiwan, a 10–15% correction) are what an autocall with a 30% buffer and a 70% floor is built to absorb.");
    s.addNotes("Third-party validation from J.P. Morgan's 2026 Outlook. Left: the AI theme has driven most of the equity market's returns and earnings since ChatGPT, and the moat runs through TSMC (8 of the 10 largest companies depend on it). Right: JPM's own 'what could go wrong' list highlights: Taiwan dependence (~92% of advanced chips) and blockade vulnerability, a possible 'Metaverse moment' for hyperscaler capex, and a 10–15% correction in its 2026 base case. These are the risks any investor in the theme has to manage. Note: the outlook is dated 1 Jan 2026, before this year's moves.");
  }

  // ===== Thesis 2: a strong theme on a fragile path (economic + finance) — market evidence only =====
  {
    const { s, T } = mk("Investment thesis 2: Volatile markets and high rates favour autocallables", "ANALYSIS");
    const R100 = TN.rates["+100bp"];
    const col = (x, w, head, sub) => {
      bar(s, T, x, 1.15, w, head);
      T(sub, { x, y: 1.62, w, h: 0.3, fontSize: 10.5, italic: true, color: MUTED, align: "center" });
    };
    const point = (x, w, y, num, big, bigColor, head, body, link) => {
      s.addShape(pres.shapes.RECTANGLE, { x, y, w, h: 0.86, fill: { color: num % 2 ? GRAY : WHITE }, line: { color: GRAY } });
      s.addShape(pres.shapes.OVAL, { x: x + 0.1, y: y + 0.2, w: 0.42, h: 0.42, fill: { color: WHITE }, line: { color: BLUE, width: 1.25 } });
      T(String(num), { x: x + 0.1, y: y + 0.2, w: 0.42, h: 0.42, fontSize: 13, bold: true, italic: true, color: BLUE, align: "center", valign: "middle" });
      T(big, { x: x + 0.62, y, w: 1.15, h: 0.86, fontSize: 18, bold: true, color: bigColor, align: "center", valign: "middle" });
      T([{ text: head + ": ", options: { bold: true, color: TXT } }, { text: body, options: { color: MUTED, breakLine: true } },
         { text: "→ " + link, options: { bold: true, color: BLUE } }],
        { x: x + 1.85, y: y + 0.04, w: w - 1.95, h: 0.8, fontSize: 8.8, valign: "middle", paraSpaceAfter: 1 });
    };
    // Economic
    const LX = 0.5, LW = 6.0;
    col(LX, LW, "Economic aspect: a strong theme on a volatile path", "Structural growth, but a violent, concentrated and late-cycle equity market");
    s.addChart(pres.charts.LINE, idxSeries(), Object.assign(chartBase(), { x: LX, y: 1.95, w: 3.75, h: 1.8, chartColors: [BLUE, RED, "A6A6A6"], lineSize: 2,
      lineDataSymbol: "circle", lineDataSymbolSize: 4, valAxisMinVal: 50, valAxisMaxVal: 325, valAxisMajorUnit: 50, valAxisLabelFontSize: 7.5, catAxisLabelFontSize: 7,
      title: "Index level, end-2021 = 100", titleFontSize: 9.5, showLegend: true, legendPos: "b", legendFontSize: 7.5, legendFontFace: F }));
    T([{ text: "Growth is structural…", options: { bold: true, color: BLUE, breakLine: true } },
       { text: "Capex +77% and chip market +90% in 2026 (thesis 1).", options: { breakLine: true } },
       { text: "…but the path is violent", options: { bold: true, color: RED, breakLine: true } },
       { text: "Down 10–25% in 2022, then 2–3× since. KOSPI fell 8.95% in a single day (13 Jul 2026)." }],
      { x: LX + 3.85, y: 1.98, w: LW - 3.9, h: 1.75, fontSize: 9, color: TXT, paraSpaceAfter: 2 });
    point(LX, LW, 3.8, 1, "−25%", RED, "Round trips happen fast", "KOSPI went from 9,000+ in June to 6,789 on 28 Aug; J.P. Morgan expects a 10–15% correction in 2026.",
      "Autocall coupons are paid when the basket gets back to its start: no need to time the bottom");
    point(LX, LW, 4.66, 2, ">40%", BLUE, "Returns hinge on a few names", "TSMC >40% of TAIEX; Samsung + SK hynix ~48% of KOSPI; ~92% of advanced chips from Taiwan.",
      "Use a diversified ETF basket, not a worst-of on single names");
    point(LX, LW, 5.52, 3, "38.6×", BLUE, "Valuations price in a lot", "Nikkei CAPE 38.6×; Taiwan among the most expensive markets; DRAM price gains slowing.",
      "Capping upside at the coupon costs little when the good news is already priced");
    // Finance
    const RX = 6.83, RW = 6.0;
    col(RX, RW, "Finance aspect: today's rates and volatility suit autocalls", "Rates are high and rising again; volatility is at records");
    const ff = MD.fed_funds_upper;
    s.addChart(pres.charts.LINE, [{ name: "Fed funds (upper bound)", labels: ff.labels, values: ff.values }],
      Object.assign(chartBase(), { x: RX, y: 1.95, w: 3.75, h: 1.8, chartColors: [BLUE], lineSize: 2.25, lineDataSymbol: "none",
        valAxisMinVal: 0, valAxisMaxVal: 6, valAxisMajorUnit: 1, valAxisLabelFormatCode: '0"%"', valAxisLabelFontSize: 7.5, catAxisLabelFontSize: 6.5,
        title: "Fed funds rate (upper bound), 2022–2026", titleFontSize: 9.5, showLegend: false }));
    T([{ text: "The Fed is hiking again", options: { bold: true, color: BLUE, breakLine: true } },
       { text: "16 Sep 2026: +0.25% to 3.75–4.00%, the first hike since 2023; median dot 4.1% for end-2026.", options: { breakLine: true } },
       { text: "Markets price more", options: { bold: true, color: BLUE, breakLine: true } },
       { text: "~87% probability of at least one further move priced by futures." }],
      { x: RX + 3.85, y: 1.98, w: RW - 3.9, h: 1.75, fontSize: 9, color: TXT, paraSpaceAfter: 2 });
    point(RX, RW, 3.8, 1, pct(R100.bond_value_change), RED, "Long bonds carry rate risk",
      `A 5-year bond loses ~${pct(-R100.bond_value_change)} per 1% rate rise, as the Fed hikes again.`,
      "Autocalls can redeem from year 1: short duration, and cash to reinvest at higher rates");
    point(RX, RW, 4.66, 2, "91.2", RED, "Volatility is at records",
      "VKOSPI closed at an all-time high of 91.2 (9 Jun 2026), above the 2008 peak.",
      "Rich option premium funds higher autocall coupons");
    point(RX, RW, 5.52, 3, pct(RES.inputs.zcb_5y), BLUE, "High rates make guarantees cheap",
      `At 5.69% 5Y USD funding, USD 100 payable in 5 years costs only USD ${(RES.inputs.zcb_5y * 100).toFixed(1)} today.`,
      "A capital floor is affordable inside an autocall");
    note(T, "Sources: TWSE, KRX/press, Nikkei (index levels; 2021–23 KOSPI/Nikkei to verify); Asiae, FN News, BIT Research (KOSPI); J.P. Morgan 2026 Outlook; Trading Economics, Siblis (valuations); TrendForce; Federal Reserve via Advisor Perspectives; Herald / SBS (VKOSPI); case funding grid; standard bond maths.", 6.42);
    s.addNotes("Thesis 2, market evidence only. Economic: AI-hardware demand is structural, but the equity path is violent (2022 falls, 2026 round trips), concentrated in a handful of names, and valuations already assume a lot while memory price momentum slows. Finance: the Fed is hiking again, so long bonds carry real rate risk; volatility is at record highs; and high rates make a capital floor unusually cheap. Each point ends with the autocall link: coupons paid on recovery (not timing), a diversified basket, capped upside that costs little, short duration, coupons funded by volatility, and a floor funded by high rates.");
  }

  // ===== Thesis 2, one-slide version: a matrix of market reality vs. traditional strategy vs. autocall =====
  {
    const { s, T } = mk("Investment thesis 2: Traditional strategies fall short; autocallables fit 2026", "ANALYSIS");
    const R100 = TN.rates["+100bp"], DOT = MD.fomc_dots_sep2026;
    // Column layout: theme tile | evidence charts | traditional outcome | autocall answer
    const CX = [0.5, 2.2, 8.0, 10.45], CW = [1.6, 5.7, 2.35, 2.38];
    const heads = [["", null], ["Market reality in 2026 (evidence)", null], ["Plain bonds / buy-and-hold", RED], ["Autocallable answer", BLUE]];
    heads.forEach(([h, c], i) => {
      if (!h) return;
      T(h, { x: CX[i], y: 1.12, w: CW[i], h: 0.3, fontSize: 11, bold: true, color: c || TXT, align: i === 1 ? "left" : "center" });
      s.addShape(pres.shapes.LINE, { x: CX[i], y: 1.44, w: CW[i], h: 0, line: { color: c || LINE, width: c ? 2 : 0.75 } });
    });
    const RY = [1.55, 3.08, 4.61], RH = 1.43;
    const row = (i, key, sub, trad, auto) => {
      const y = RY[i];
      if (i > 0) s.addShape(pres.shapes.LINE, { x: 0.5, y: y - 0.06, w: 12.33, h: 0, line: { color: "D9D9D9", width: 0.5, dashType: "dash" } });
      s.addShape(pres.shapes.RECTANGLE, { x: CX[0], y, w: CW[0], h: RH, fill: { color: BLUE }, line: { color: BLUE } });
      T(key, { x: CX[0] + 0.1, y: y + 0.15, w: CW[0] - 0.2, h: 0.5, fontSize: 15, bold: true, color: WHITE });
      T(sub, { x: CX[0] + 0.1, y: y + 0.68, w: CW[0] - 0.2, h: 0.7, fontSize: 9, color: "DCE6EE" });
      [[2, trad, "F7ECEC"], [3, auto, BLUE_L]].forEach(([c, txt, fill]) => {
        s.addShape(pres.shapes.RECTANGLE, { x: CX[c], y, w: CW[c], h: RH, fill: { color: fill }, line: { color: fill } });
        T(txt, { x: CX[c] + 0.1, y: y + 0.06, w: CW[c] - 0.2, h: RH - 0.12, fontSize: 8.8, color: TXT, valign: "middle", paraSpaceAfter: 2 });
      });
    };
    const small = (t, x, y, w) => T(t, { x, y, w, h: 0.2, fontSize: 7.5, italic: true, color: MUTED });

    // Row 1: rates
    row(0, "Rates", "The Fed sees rates high until 2028",
      [{ text: `A 5-year bond loses ~${pct(-R100.bond_value_change)} for every 1% rise in rates, `, options: {} },
       { text: `and ${DOT["2026"]["4.375"] + DOT["2027"]["4.375"]} Fed dots sit at 4.375% for 2026–27: more hikes are possible.`, options: {} }],
      [{ text: "Early exit: ", options: { bold: true, color: BLUE } }, { text: "can redeem from year 1, so duration is short.", options: { breakLine: true } },
       { text: "Cheap floor: ", options: { bold: true, color: BLUE } }, { text: `USD ${(RES.inputs.zcb_5y * 100).toFixed(1)} today buys USD 100 in 5 years, so a 70% floor fits inside.` }]);
    s.addImage({ path: path.join(__dirname, "fomc_dot_plot_compact.png"), x: CX[1], y: RY[0] + 0.02, w: 3.45, h: 3.45 * 638 / 1804 });
    small("FOMC dot plot, 16 Sep 2026 (shaded: today's 3.75–4.00%)", CX[1], RY[0] + 1.24, 3.45);
    const keys = RATE_KEYS;
    const labs = keys.map((k) => k === "base" ? "0" : (parseInt(k) / 100).toFixed(1).replace(/^(\d)/, "+$1"));
    s.addChart(pres.charts.BAR, [{ name: "5Y USD bond", labels: labs, values: keys.map((k) => k === "base" ? 0 : +(TN.rates[k].bond_value_change * 100).toFixed(1)) }],
      Object.assign(chartBase(), { x: CX[1] + 3.55, y: RY[0], w: 2.15, h: 1.24, barDir: "col", chartColors: ["7F7F7F"], showTitle: false, showValue: false,
        valAxisMinVal: -10, valAxisMaxVal: 10, valAxisMajorUnit: 5, valAxisLabelFormatCode: '0"%"', catAxisLabelFontSize: 6.5, valAxisLabelFontSize: 7,
        showLegend: false, catAxisLabelPos: "low" }));
    small("5Y bond value vs rate move (%)", CX[1] + 3.6, RY[0] + 1.24, 2.1);

    // Row 2: volatility
    row(1, "Volatility", "Violent paths, record fear gauges",
      [{ text: "Index levels fell 10–25% in 2022, then rose 2–3×; KOSPI lost ~25% from June to August 2026. Buy-and-hold must sit through it or time the bottom." }],
      [{ text: "Paid on recovery: ", options: { bold: true, color: BLUE } }, { text: "coupons pay once the basket is back at its start; memory catches up missed ones.", options: { breakLine: true } },
       { text: "Vol funds the coupon: ", options: { bold: true, color: BLUE } }, { text: "VKOSPI hit a record 91.2." }]);
    s.addChart(pres.charts.LINE, idxSeries(), Object.assign(chartBase(), { x: CX[1], y: RY[1], w: CW[1], h: 1.24, chartColors: [BLUE, RED, "A6A6A6"], lineSize: 2, showTitle: false,
      lineDataSymbol: "none", valAxisMinVal: 50, valAxisMaxVal: 325, valAxisMajorUnit: 100, valAxisLabelFontSize: 7, catAxisLabelFontSize: 7,
      showLegend: true, legendPos: "r", legendFontSize: 7.5, legendFontFace: F }));
    small("TAIEX, KOSPI, Nikkei 225 (end-2021 = 100)", CX[1], RY[1] + 1.24, CW[1]);

    // Row 3: valuation and concentration
    row(2, "Valuation", "Much good news is priced, in a few names",
      [{ text: "KOSPI trades at 23× trailing earnings; Nikkei CAPE 38.6×; TSMC is >40% of TAIEX and Taiwan makes ~92% of advanced chips. Upside is concentrated and partly priced." }],
      [{ text: "Diversify: ", options: { bold: true, color: BLUE } }, { text: "five-ETF basket, not a worst-of on single names.", options: { breakLine: true } },
       { text: "Cap costs little: ", options: { bold: true, color: BLUE } }, { text: "giving up upside beyond the coupon matters less when it is already priced." }]);
    const pe = [["KOSPI", 22.95, 7.82], ["Nikkei 225", 22.09, 17.18]];
    s.addChart(pres.charts.BAR, [{ name: "Trailing P/E", labels: pe.map((x) => x[0]), values: pe.map((x) => x[1]) }, { name: "Forward P/E", labels: pe.map((x) => x[0]), values: pe.map((x) => x[2]) }],
      Object.assign(chartBase(), { x: CX[1], y: RY[2], w: CW[1], h: 1.24, barDir: "bar", barGrouping: "clustered", chartColors: ["A6A6A6", BLUE], showTitle: false, showValue: true,
        dataLabelPosition: "outEnd", dataLabelFormatCode: '0.0"×"', dataLabelFontSize: 8, dataLabelColor: TXT, valAxisHidden: true, valGridLine: { style: "none" },
        valAxisMinVal: 0, valAxisMaxVal: 27, catAxisLabelFontSize: 8.5, showLegend: true, legendPos: "r", legendFontSize: 7.5, legendFontFace: F }));
    small("Price/earnings, 1 Jul 2026 (Siblis Research)", CX[1], RY[2] + 1.24, CW[1]);

    T([{ text: "Market proof: ", options: { bold: true, color: BLUE } },
       { text: "Taiwan structured-note issuance rose 81% in 2025, with autocalls the favourite payoff (SRP). Investors facing the same market are already choosing this answer." }],
      { x: 0.5, y: 6.2, w: 12.33, h: 0.3, fontSize: 10, color: TXT });
    note(T, "Sources: Federal Reserve, Summary of Economic Projections (16 Sep 2026; dot counts read from Figure 2, verify); TWSE, KRX/press, Nikkei (index levels); Siblis Research (P/E); Herald / SBS (VKOSPI); J.P. Morgan 2026 Outlook; StructuredRetailProducts.com; case funding grid with standard bond maths.", 6.56);
    s.addNotes("Read across each row: what the 2026 market looks like, what that does to plain bonds or buy-and-hold equity, and how an autocallable answers it. Rates: the Fed's dot plot keeps rates high until 2028 with a hawkish minority, so long bonds carry rate risk, while high rates make a capital floor cheap and an autocall can redeem from year 1. Volatility: violent round trips punish buy-and-hold timing; autocall coupons pay on recovery and record volatility funds them. Valuation: concentration and full prices make upside less valuable, so capping it at the coupon costs little, and a diversified ETF basket avoids single-name risk. Our specific note and its numbers come in the product section.");
  }

  // ===== Appendix: sources =====
  {
    const { s, T } = mk("Appendix: sources for the investment thesis", "APPENDIX");
    const src = [
      ["TSMC ~70–73% of global foundry revenue (Q1 2026); HPC 58% of 2025 revenue; 3nm sold out through 2026", "Counterpoint via press; TSMC results (verify in TSMC quarterly reports)"],
      ["TSMC >40% of TAIEX; TAIEX record 48,476 on 2 Oct 2026 (~+67% vs 2025 close 28,963.6)", "Trading Economics (Jul, Oct 2026); TWSE 2025 Market Highlights"],
      ["HBM revenue share Q2 2026: SK hynix 50%, Samsung 33%, Micron 18%", "Counterpoint Research, Global DRAM and HBM Market Share"],
      ["DRAM contract prices: Q2 2026 +45–50% q/q (consumer), Q3 +13–18%, Q4e +10–15% (conventional)", "TrendForce via press (May–Sep 2026)"],
      ["Advantest ~55–58% of test equipment; TEL ~90% of coater/developers; Advantest 12.2% of Nikkei 225", "Industry research summaries (verify in annual reports); Nikkei Asia"],
      ["KOSPI forward P/E 7.8x, trailing 23.0x; Nikkei forward 17.2x, CAPE 38.6 (1 Jul 2026)", "Siblis Research"],
      ["Hyperscaler capex ~USD 725bn in 2026, +77% y/y", "Company guidance after Q1 2026, via AI Weekly / Yahoo Finance"],
      ["Chip market ~USD 1.5trn in 2026 (+90%); equipment USD 165.9bn (+23.2%), DRAM equip. +39%, test +31%", "WSTS Spring 2026 (2 Jun 2026); SEMI mid-year forecast (14 Jul 2026)"],
      ["US 25% Section 232 tariff on a narrow set of advanced logic chips from 15 Jan 2026", "White House Proclamation 11002, via Perkins Coie / Mondaq"],
      ["Fed +0.25% to 3.75–4.00% on 16 Sep 2026, first hike since 2023; median dot 4.1% end-2026", "Federal Reserve decision, via Advisor Perspectives"],
      ["FOMC dot plot: medians 4.125% (2026), 4.125% (2027), 3.875% (2028), 3.625% (2029), 3.25% longer run", "Federal Reserve, Summary of Economic Projections, Figure 2 (16 Sep 2026)"],
      ["VKOSPI record close 91.23 (9 Jun 2026), above Oct 2008 (89.30); 83.58 on 5 Mar 2026", "Herald Corp; SBS; FN News (Jun 2026)"],
      ["KOSPI 9,000+ in June (~+110% YTD), 6,789 on 28 Aug 2026", "BIT Research; FN News / Shinhan Securities (31 Aug 2026)"],
      ["2022: TAIEX −31.6% peak to trough; KOSPI −24.9%; SOX −36%", "TWSE 2022 Market Highlights; Korea Times; Bloomberg via BNN"],
      ["Japan buybacks ¥18.7trn FY2024, ~¥20trn FY2025e; Korea Value-Up Index +30% vs KOSPI 200", "Asset Management One via portfolio institutional; AllianceBernstein"],
      ["42 AI stocks = 65–75% of S&P 500 returns/profits/capex; ~92% of advanced chips from Taiwan; 10–15% correction in 2026 base case", "J.P. Morgan AWM, Eye on the Market 2026 Outlook \"Smothering Heights\" (1 Jan 2026)"],
      ["Taiwan structured notes 2025: ~75,900 products, +81%; snowball autocalls favoured", "StructuredRetailProducts.com, Taiwan Q4 2025 review"],
      ["5Y bond value change for −2% to +2% rate moves; 5Y discount factor 75.8%", "Standard bond maths on the case USD funding grid (5Y 5.69%)"],
    ];
    const hdr = (t) => ({ text: t, options: { bold: true, color: WHITE, fill: { color: BLUE } } });
    s.addTable([[hdr("Fact used"), hdr("Source")]].concat(src.map((r) => [r[0], r[1]])), { x: 0.5, y: 1.15, w: 12.33, colW: [7.2, 5.13], fontFace: F, fontSize: 8.5,
      color: TXT, valign: "middle", border: { type: "solid", pt: 0.5, color: LINE }, fill: { color: WHITE }, rowH: 0.27, margin: [1, 5, 1, 5] });
    T("Several figures are forecasts or third-party estimates; numbers marked 'verify' come from a single secondary source. Full URLs: deck/thesis_sources.md.",
      { x: 0.5, y: 6.66, w: 12.33, h: 0.26, fontSize: 8, italic: true, color: MUTED });
  }

  await pres.writeFile({ fileName: path.join(__dirname, "Investment-Thesis-Slides.pptx") });
  console.log("wrote");
})();
