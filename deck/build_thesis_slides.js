// Investment-thesis slides in the team template style (blue bars, Arial, section footer).
// Data: external facts are cited on each slide (full list in deck/thesis_sources.md);
// strategy comparison comes from pricing/scenario2_vs_traditional.json.
// Build: NODE_PATH=<dir with pptxgenjs, react, react-dom, react-icons, sharp> node deck/build_thesis_slides.js
const path = require("path");
const pptxgen = require("pptxgenjs");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const sharp = require("sharp");
const { FaMicrochip, FaMemory, FaTools } = require("react-icons/fa");
const VT = require(path.join(__dirname, "..", "pricing", "scenario2_vs_traditional.json"));
const RES = require(path.join(__dirname, "..", "pricing", "scenario2_results.json"));
const TN = require(path.join(__dirname, "..", "pricing", "scenario2_thesis_numbers.json"));

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
    bar(s, T, 0.5, 1.15, 7.0, "Each market in our basket controls a bottleneck");
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
    const g = [["Hyperscaler capex", 0.77], ["Global chip market (WSTS)", 0.90], ["DRAM equipment (SEMI)", 0.39], ["Chip test equipment (SEMI)", 0.31], ["All chip equipment (SEMI)", 0.232]];
    s.addChart(pres.charts.BAR, [{ name: "2026 growth", labels: g.map((x) => x[0]), values: g.map((x) => +(x[1] * 100).toFixed(1)) }],
      Object.assign(chartBase(), { x: 7.75, y: 1.62, w: 5.08, h: 2.25, barDir: "bar", chartColors: [BLUE], showValue: true, dataLabelPosition: "outEnd",
        dataLabelFormatCode: '"+"0"%"', dataLabelFontSize: 9, dataLabelColor: TXT, valAxisHidden: true, valGridLine: { style: "none" }, valAxisMinVal: 0, valAxisMaxVal: 110,
        title: "2026 growth vs 2025 (forecast / guidance)", titleFontSize: 10, showLegend: false, catAxisOrientation: "maxMin", catAxisLabelFontSize: 9 }));
    const dr = [["Q2 2026", 47.5], ["Q3 2026", 15.5], ["Q4 2026e", 12.5]];
    s.addChart(pres.charts.BAR, [{ name: "DRAM", labels: dr.map((x) => x[0]), values: dr.map((x) => x[1]) }],
      Object.assign(chartBase(), { x: 7.75, y: 3.9, w: 2.6, h: 1.9, barDir: "col", chartColors: [BLUE_M], showValue: true, dataLabelPosition: "outEnd",
        dataLabelFormatCode: '"+"0"%"', dataLabelFontSize: 9, dataLabelColor: TXT, valAxisHidden: true, valGridLine: { style: "none" }, valAxisMinVal: 0, valAxisMaxVal: 60,
        title: "DRAM contract price, q/q", titleFontSize: 9.5, showLegend: false, catAxisLabelFontSize: 8.5 }));
    s.addShape(pres.shapes.RECTANGLE, { x: 10.45, y: 3.95, w: 2.38, h: 1.85, fill: { color: BLUE_L }, line: { color: BLUE_L } });
    T([{ text: "Cycle check", options: { bold: true, italic: true, color: BLUE, breakLine: true } },
       { text: "Memory prices still rising, but gains slowing (midpoints of TrendForce ranges)", options: { bullet: { indent: 8 }, breakLine: true } },
       { text: "US 25% tariff on some advanced chips since Jan 2026 (Section 232)", options: { bullet: { indent: 8 }, breakLine: true } },
       { text: "Leads straight to thesis 2: own it with protection", options: { bullet: { indent: 8 }, bold: true } }],
      { x: 10.55, y: 4.02, w: 2.2, h: 1.75, fontSize: 8.5, color: TXT, paraSpaceAfter: 2 });
    note(T, "Sources: Counterpoint (foundry, HBM); TSMC; Trading Economics / TWSE (TAIEX, 2025 close 28,963.6); TrendForce (DRAM); Siblis Research (P/E, 1 Jul 2026); SEMI (14 Jul 2026); WSTS (Jun 2026); company capex guidance; Nikkei; White House Proclamation 11002. Full list in appendix.");
    banner(s, T, "We buy the picks and shovels: whichever AI model wins, it needs Taiwan's chips, Korea's memory and Japan's tools.");
    s.addNotes("Thesis 1. AI is a hardware story and our three markets each own a bottleneck. The boom is visible in earnings, not just prices: KOSPI's forward P/E of 7.8x against 23x trailing means analysts expect earnings to roughly triple. But the cycle is maturing: memory price increases are decelerating and US tariffs are a live risk. That tension (great theme, risky path) is the bridge to thesis 2.");
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
    banner(s, T, "Same conclusion as ours: stay in the AI-hardware theme, but not unprotected. Our note keeps the upside path and removes the capital risk.");
    s.addNotes("Third-party validation from J.P. Morgan's 2026 Outlook. Left: the AI theme has driven most of the equity market's returns and earnings since ChatGPT, and the moat runs through TSMC (8 of the 10 largest companies depend on it). Right: JPM's own 'what could go wrong' list maps onto our risks: Taiwan dependence (~92% of advanced chips) and blockade vulnerability, a possible 'Metaverse moment' for hyperscaler capex, and a 10–15% correction in its 2026 base case. That is the case for owning the theme through capital protection. Note: the outlook is dated 1 Jan 2026, before this year's moves.");
  }

  // ===== Thesis 2: why an autocall on our theme with protection (economic + finance) =====
  {
    const { s, T } = mk("Investment thesis 2: Own the AI-hardware theme through a protected autocall", "ANALYSIS");
    const REC = RES.recommended, RN = RES.rn, CPN = RES.inputs.coupon, R100 = TN.rates["+100bp"], V = TN.vol;
    const col = (x, w, head, sub) => {
      bar(s, T, x, 1.15, w, head);
      T(sub, { x, y: 1.62, w, h: 0.3, fontSize: 10.5, italic: true, color: MUTED, align: "center" });
    };
    const point = (x, w, y, num, big, bigColor, head, body) => {
      s.addShape(pres.shapes.RECTANGLE, { x, y, w, h: 0.86, fill: { color: num % 2 ? GRAY : WHITE }, line: { color: GRAY } });
      s.addShape(pres.shapes.OVAL, { x: x + 0.1, y: y + 0.2, w: 0.42, h: 0.42, fill: { color: WHITE }, line: { color: BLUE, width: 1.25 } });
      T(String(num), { x: x + 0.1, y: y + 0.2, w: 0.42, h: 0.42, fontSize: 13, bold: true, italic: true, color: BLUE, align: "center", valign: "middle" });
      T(big, { x: x + 0.62, y, w: 1.15, h: 0.86, fontSize: 18, bold: true, color: bigColor, align: "center", valign: "middle" });
      T([{ text: head, options: { bold: true, color: TXT, breakLine: true } }, { text: body, options: { color: MUTED } }],
        { x: x + 1.85, y: y + 0.05, w: w - 1.95, h: 0.8, fontSize: 9.3, valign: "middle" });
    };
    // Economic
    const LX = 0.5, LW = 6.0;
    col(LX, LW, "Economic aspect: why this theme needs protection", "Structural growth, but a violent, concentrated and late-cycle path");
    const vk = [["Oct 2008 (GFC)", 89.3], ["5 Mar 2026 (Iran war)", 83.6], ["9 Jun 2026", 91.2]];
    s.addChart(pres.charts.BAR, [{ name: "VKOSPI", labels: vk.map((x) => x[0]), values: vk.map((x) => x[1]) }],
      Object.assign(chartBase(), { x: LX, y: 1.95, w: 2.6, h: 1.75, barDir: "col", chartColors: [DGRAY, DGRAY, RED], showValue: true, dataLabelPosition: "outEnd",
        dataLabelFormatCode: "0.0", dataLabelFontSize: 9, dataLabelColor: TXT, valAxisHidden: true, valGridLine: { style: "none" }, valAxisMinVal: 0, valAxisMaxVal: 110,
        title: "Korea 'fear index' (VKOSPI) closes", titleFontSize: 9.5, showLegend: false, catAxisLabelFontSize: 7.5 }));
    T([{ text: "Growth is structural…", options: { bold: true, color: BLUE, breakLine: true } },
       { text: "Capex +77%, chip market +90% in 2026 (thesis 1).", options: { breakLine: true } },
       { text: "…but the path is violent", options: { bold: true, color: RED, breakLine: true } },
       { text: "VKOSPI closed at an all-time high of 91.2 on 9 Jun 2026, above the 2008 crisis peak. Circuit breakers fired three times in June." }],
      { x: LX + 2.7, y: 1.98, w: LW - 2.75, h: 1.7, fontSize: 9.5, color: TXT, paraSpaceAfter: 3 });
    point(LX, LW, 3.8, 1, "−25%", RED, "Round trips happen fast", "KOSPI hit 9,000+ in June (~+110% YTD), then 6,789 on 28 Aug: about −25% in ten weeks. J.P. Morgan's 2026 base case includes a 10–15% correction.");
    point(LX, LW, 4.66, 2, ">40%", BLUE, "Returns hinge on a few names", "TSMC is >40% of the TAIEX, and ~92% of advanced chips are made in Taiwan, which J.P. Morgan calls the most blockade-sensitive advanced economy.");
    point(LX, LW, 5.52, 3, "¥20trn", BLUE, "Reforms support a recovery to 100%", "Record Japanese buybacks (~¥20trn FY2025 forecast) and Korea's Value-up programme help the basket get back to its start, which is all the coupon needs.");
    // Finance
    const RX = 6.83, RW = 6.0;
    col(RX, RW, "Finance aspect: why an autocall with protection", "Rates are high and rising; volatility is at records. Both favour this structure");
    const rr = [["5Y USD bond", R100.bond_value_change], ["Our protected autocall", R100.note_value_change]];
    s.addChart(pres.charts.BAR, [{ name: "+1% rates", labels: rr.map((x) => x[0]), values: rr.map((x) => +(x[1] * 100).toFixed(1)) }],
      Object.assign(chartBase(), { x: RX, y: 1.95, w: 2.6, h: 1.75, barDir: "col", chartColors: [DGRAY, BLUE], showValue: true, dataLabelPosition: "outEnd",
        dataLabelFormatCode: '0.0"%"', dataLabelFontSize: 9, dataLabelColor: TXT, valAxisHidden: true, valGridLine: { style: "none" }, valAxisMinVal: -5, valAxisMaxVal: 0,
        title: "Value change if rates rise 1%", titleFontSize: 9.5, showLegend: false, catAxisLabelFontSize: 8 }));
    T([{ text: "The Fed is hiking again", options: { bold: true, color: BLUE, breakLine: true } },
       { text: "16 Sep 2026: +0.25% to 3.75–4.00%, the first hike since 2023; the median dot points to 4.1% by year end.", options: { breakLine: true } },
       { text: "So: avoid long duration", options: { bold: true, color: BLUE, breakLine: true } },
       { text: `Our note has ~${Math.round(R100.note_value_change / R100.bond_value_change * 100)}% of a 5Y bond's rate risk: it usually ends within ~${RN.exp_life_y.toFixed(0)} years.` }],
      { x: RX + 2.7, y: 1.98, w: RW - 2.75, h: 1.7, fontSize: 9.5, color: TXT, paraSpaceAfter: 3 });
    point(RX, RW, 3.8, 1, pct(RES.inputs.zcb_5y), BLUE, "High rates make protection cheap",
      `At 5.69% 5Y funding, USD 100 at year 5 costs USD ${(RES.inputs.zcb_5y * 100).toFixed(1)} today; early calls lower it to ${pct(REC.pv_principal)} in our note.`);
    point(RX, RW, 4.66, 2, pct(R100.new_note_fair_coupon), BLUE, "Rising rates pay off at the roll",
      `${pct(RN.p_call_by_year[0], 0)} of notes are called at year 1. If rates are 1% higher by then, a new note would pay ~${pct(R100.new_note_fair_coupon)}.`);
    point(RX, RW, 5.52, 3, pct(V["+5pts"]), BLUE, "Record volatility funds the coupon",
      `Fair coupon ${pct(V["+0pts"])} at our vol inputs, ${pct(V["+5pts"])} with 5pts more vol. 2026's record vols make our ${pct(CPN, 2)} conservative.`);
    note(T, "Sources: Herald / SBS / FN News (VKOSPI); FN News and Shinhan (KOSPI 28 Aug); TWSE, Korea Times, Bloomberg/BNN (2022); Trading Economics, Nikkei Asia (weights); Siblis (valuations); J.P. Morgan 2026 Outlook; Asset Management One (buybacks); Federal Reserve via Advisor Perspectives (16 Sep 2026); case funding grid; team Monte Carlo.", 6.42);
    s.addNotes("Thesis 2 in two halves. Economic: demand is structural but the path is violent (record VKOSPI, a 25% KOSPI round trip in ten weeks), concentrated and late-cycle; reforms make a recovery to 100% plausible, which is all our coupon needs. Finance: rates are high and rising, so protection is cheap and long-duration bonds are risky. Our note has about a third of a 5-year bond's rate sensitivity and usually returns cash within two years, when a new note would pay more. Record volatility makes our 6.75% coupon conservative.");
  }

  // ===== Thesis 2, one-slide version =====
  {
    const { s, T } = mk("Investment thesis 2: Traditional strategies fall short; a protected autocall fits 2026", "ANALYSIS");
    T("Rising rates, record volatility and a late-cycle chip boom: the conditions where an autocall beats bonds, stocks and plain protected notes",
      { x: 0.5, y: 1.05, w: 12.3, h: 0.3, fontSize: 11.5, bold: true, italic: true, color: TXT });
    const RN = RES.rn, CPN = RES.inputs.coupon, R100 = TN.rates["+100bp"], V = TN.vol, BE = TN.breakeven;
    const base = VT["4% equity p.a."];
    const PW = 4.08, PX = [0.5, 0.5 + PW + 0.2], PY = [1.45, 3.7];
    const panel = (i, head) => {
      const x = PX[i % 2], y = PY[Math.floor(i / 2)];
      s.addShape(pres.shapes.RECTANGLE, { x, y, w: PW, h: 0.32, fill: { color: BLUE }, line: { color: BLUE } });
      T(head, { x, y, w: PW, h: 0.32, fontSize: 10.5, bold: true, color: WHITE, align: "center", valign: "middle" });
      return { x, y: y + 0.36 };
    };
    const cap = (x, y, t) => T(t, { x, y, w: PW, h: 0.4, fontSize: 8.5, color: MUTED });
    // P1 rates
    let p = panel(0, "Rates are rising: bonds carry the duration risk");
    const rr = [["-1%", "-100bp"], ["-0.5%", "-50bp"], ["+0.5%", "+50bp"], ["+1%", "+100bp"]];
    s.addChart(pres.charts.BAR, [{ name: "5Y USD bond", labels: rr.map((x) => x[0]), values: rr.map((x) => +(TN.rates[x[1]].bond_value_change * 100).toFixed(1)) },
                                 { name: "Our autocall", labels: rr.map((x) => x[0]), values: rr.map((x) => +(TN.rates[x[1]].note_value_change * 100).toFixed(1)) }],
      Object.assign(chartBase(), { x: p.x, y: p.y, w: PW, h: 1.38, barDir: "col", barGrouping: "clustered", chartColors: ["404040", BLUE], showTitle: false,
        showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "0.0", dataLabelFontSize: 7, dataLabelColor: TXT, valAxisMinVal: -6, valAxisMaxVal: 6,
        valAxisLabelFormatCode: '0"%"', catAxisLabelFontSize: 8, valAxisLabelFontSize: 8, showLegend: true, legendPos: "r", legendFontSize: 8, legendFontFace: F, catAxisLabelPos: "low" }));
    cap(p.x, p.y + 1.42, "Value change for a parallel rate move. The Fed hiked to 3.75–4.00% on 16 Sep 2026 (first hike since 2023), with another expected.");
    // P2 volatility
    p = panel(1, "Volatility is at records: protection is needed");
    const vk = [["Oct 2008", 89.3], ["Mar 2026", 83.6], ["Jun 2026", 91.2]];
    s.addChart(pres.charts.BAR, [{ name: "VKOSPI", labels: vk.map((x) => x[0]), values: vk.map((x) => x[1]) }],
      Object.assign(chartBase(), { x: p.x, y: p.y, w: PW, h: 1.38, barDir: "col", chartColors: [DGRAY, DGRAY, RED], showTitle: false, showValue: true, dataLabelPosition: "outEnd",
        dataLabelFormatCode: "0.0", dataLabelFontSize: 8, dataLabelColor: TXT, valAxisHidden: true, valGridLine: { style: "none" }, valAxisMinVal: 0, valAxisMaxVal: 110, showLegend: false, catAxisLabelFontSize: 8 }));
    cap(p.x, p.y + 1.42, "VKOSPI closing peaks: 2026 beat the 2008 crisis. KOSPI then fell ~25% (9,000+ in June to 6,789 on 28 Aug).");
    // P3 regimes
    p = panel(2, "The autocall wins in most markets");
    const strat = [["Protected autocall (ours)", "Our autocall"], ["Direct basket", "Hold the basket"], ["5Y USD bond", "5Y bond"]];
    const regs = Object.keys(base.regimes);
    s.addChart(pres.charts.BAR, strat.map(([k, n]) => ({ name: n, labels: regs.map((r) => r.split(" (")[0]), values: regs.map((r) => +(base.regimes[r][k] * 100).toFixed(1)) })),
      Object.assign(chartBase(), { x: p.x, y: p.y, w: PW, h: 1.38, barDir: "col", barGrouping: "clustered", chartColors: [BLUE, "A6A6A6", "404040"], showTitle: false,
        showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "0", dataLabelFontSize: 7, dataLabelColor: TXT, valAxisMinVal: -10, valAxisMaxVal: 20,
        valAxisLabelFormatCode: '0"%"', catAxisLabelFontSize: 8, valAxisLabelFontSize: 8, showLegend: true, legendPos: "r", legendFontSize: 8, legendFontFace: F }));
    cap(p.x, p.y + 1.42, "Mean return % p.a. by type of 5-year market (team simulation, equities +4% p.a.). Ties the stocks in moderate markets, beats them in bear and flat ones.");
    // P4 break-even vs bond
    p = panel(3, "Beats the bond in about 4 of 5 outcomes");
    const keys = Object.keys(BE);
    s.addChart(pres.charts.LINE, [{ name: "Our autocall: mean IRR", labels: keys, values: keys.map((k) => +(BE[k].mean_irr * 100).toFixed(2)) },
                                  { name: "5Y bond", labels: keys, values: keys.map(() => 5.69) }],
      Object.assign(chartBase(), { x: p.x, y: p.y, w: PW * 0.62, h: 1.38, chartColors: [BLUE, "404040"], lineSize: 2, lineDataSymbol: "circle", lineDataSymbolSize: 4, showTitle: false,
        valAxisMinVal: 4, valAxisMaxVal: 7, valAxisLabelFormatCode: '0"%"', catAxisLabelFontSize: 8, valAxisLabelFontSize: 8, showLegend: true, legendPos: "b", legendFontSize: 7.5, legendFontFace: F }));
    T([{ text: pct(BE["4%"].p_beats_bond, 0), options: { fontSize: 22, bold: true, color: BLUE, breakLine: true } },
       { text: "of paths beat the 5.69% bond at +4% equity a year", options: { fontSize: 8.5, color: MUTED, breakLine: true } },
       { text: "~6%", options: { fontSize: 18, bold: true, color: BLUE, breakLine: true } },
       { text: "equity return at which the average also matches the bond", options: { fontSize: 8.5, color: MUTED } }],
      { x: p.x + PW * 0.64, y: p.y + 0.02, w: PW * 0.36, h: 1.38 });
    cap(p.x, p.y + 1.42, "x-axis: average annual equity return. The note beats the bond in every path where it is called; the bond wins only if the basket never recovers.");
    // Implications
    const IX = 8.98, IW = 3.85;
    T("Implications", { x: IX, y: 1.4, w: IW, h: 0.35, fontSize: 15, bold: true, color: TXT, align: "center" });
    s.addShape(pres.shapes.LINE, { x: IX + 0.3, y: 1.78, w: IW - 0.6, h: 0, line: { color: BLUE, width: 0.75 } });
    const imp = [["Low rate risk", `Loses ${pct(-R100.note_value_change)} if rates rise 1%, vs ${pct(-R100.bond_value_change)} for a 5Y bond`],
                 ["Rising rates help at the roll", `${pct(RN.p_call_by_year[0], 0)} called at year 1; a new note would then pay ~${pct(R100.new_note_fair_coupon)} if rates are 1% higher`],
                 ["Volatility becomes income", `Fair coupon ${pct(V["+0pts"])}, ${pct(V["+5pts"])} with 5pts more vol: our ${pct(CPN, 2)} is conservative`],
                 ["Pays without a rally", "6.2% p.a. vs 2.0% for the stocks when the basket goes sideways"],
                 ["Proven in Asia", "Taiwan structured-note issuance +81% in 2025; snowball autocalls the favourite payoff (SRP)"]];
    imp.forEach((m, i) => {
      const y = 1.88 + i * 0.8;
      s.addShape(pres.shapes.RECTANGLE, { x: IX, y, w: IW, h: 0.72, fill: { color: WHITE }, line: { color: BLUE, width: 1 } });
      T(String(i + 1), { x: IX + 0.05, y, w: 0.45, h: 0.72, fontSize: 22, bold: true, italic: true, color: BLUE, align: "center", valign: "middle" });
      T([{ text: m[0] + ": ", options: { bold: true, color: TXT } }, { text: m[1], options: { color: MUTED } }],
        { x: IX + 0.55, y: y + 0.03, w: IW - 0.65, h: 0.66, fontSize: 9, valign: "middle" });
    });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 6.0, w: 12.33, h: 0.48, fill: { color: BLUE }, line: { color: BLUE } });
    T(`Result: ${pct(CPN, 2)} a year whenever the basket is back at its start, 100% of capital at maturity, a third of a bond's rate risk.`,
      { x: 0.65, y: 6.0, w: 12.03, h: 0.48, fontSize: 12.5, bold: true, color: WHITE, align: "center", valign: "middle" });
    note(T, "Sources: Federal Reserve via Advisor Perspectives (16 Sep 2026); Herald / SBS (VKOSPI); FN News / Shinhan (KOSPI); StructuredRetailProducts.com; team Monte Carlo (scenario2_thesis_numbers.py, scenario2_vs_traditional.py).", 6.56);
    s.addNotes("One-slide thesis 2. Panel 1: rates are rising, and our note has about a third of a 5-year bond's rate sensitivity. Panel 2: Korean volatility closed at an all-time high in June 2026, above 2008. Panel 3: the note wins or ties in most market types. Panel 4: it beats the bond in about 4 of 5 outcomes, and its average matches the bond at ~6% equity returns. Implications make the case. Use instead of the two-part thesis 2 plus evidence if you need to save a slide.");
  }

  // ===== Thesis 2 evidence: autocallables beat the normal ways to own the theme =====
  {
    const { s, T } = mk("Thesis 2 evidence: the protected autocall beats the usual ways to own this theme", "STRATEGY");
    const base = VT["4% equity p.a."];
    const strat = ["Protected autocall (ours)", "Direct basket", "Principal-protected note", "5Y USD bond"];
    const lab = { "Protected autocall (ours)": "Our protected autocall", "Direct basket": "Hold the basket", "Principal-protected note": "Plain protected note", "5Y USD bond": "5Y USD bond (5.69%)" };
    const regs = Object.keys(base.regimes);
    bar(s, T, 0.5, 1.15, 7.0, "Average annual return by type of market (5 years)");
    s.addChart(pres.charts.BAR, strat.map((k) => ({ name: lab[k], labels: regs.map((r) => `${r.split(" (")[0]} (${Math.round(base.regimes[r].share_of_paths * 100)}% of paths)`), values: regs.map((r) => +(base.regimes[r][k] * 100).toFixed(1)) })),
      Object.assign(chartBase(), { x: 0.5, y: 1.62, w: 7.0, h: 4.15, barDir: "col", barGrouping: "clustered", chartColors: [BLUE, "A6A6A6", BLUE_M, "404040"],
        showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: '0.0', dataLabelFontSize: 8, dataLabelColor: TXT,
        valAxisLabelFormatCode: '0"%"', valAxisMinVal: -10, valAxisMaxVal: 20, showLegend: true, legendPos: "b", legendFontSize: 10, legendFontFace: F,
        title: "Mean IRR, % p.a. (simulation, equities +4% p.a. on average)", catAxisLabelFontSize: 9.5 }));

    bar(s, T, 7.75, 1.15, 5.08, "Same 100,000 paths, summary");
    const hdr = (t) => ({ text: t, options: { bold: true, color: WHITE, fill: { color: BLUE } } });
    const rows = [[hdr("Strategy"), hdr("Mean"), hdr("Median"), hdr("Loss risk"), hdr("Worst 5%")]];
    strat.forEach((k) => {
      const x = base.strategies[k], ours = k.startsWith("Protected");
      const o = ours ? { bold: true, color: BLUE, fill: { color: BLUE_L } } : {};
      rows.push([{ text: lab[k], options: o }, { text: pct(x.mean_irr), options: o }, { text: pct(x.median_irr), options: o },
                 { text: pct(x.p_loss, 0), options: o }, { text: pct(x.worst_5pct_irr), options: o }]);
    });
    s.addTable(rows, { x: 7.75, y: 1.65, w: 5.08, colW: [1.9, 0.75, 0.8, 0.8, 0.83], fontFace: F, fontSize: 10, color: TXT, valign: "middle",
      border: { type: "solid", pt: 0.5, color: LINE }, fill: { color: WHITE }, rowH: 0.36, margin: [2, 4, 2, 4] });
    s.addShape(pres.shapes.RECTANGLE, { x: 7.75, y: 3.6, w: 5.08, h: 2.15, fill: { color: GRAY }, line: { color: GRAY } });
    T([{ text: "Why it works", options: { bold: true, italic: true, color: BLUE, fontSize: 12, breakLine: true } },
       { text: "Pays in sideways markets: 6.2% vs 2.0% for the stocks when the basket goes nowhere", options: { bullet: { indent: 10 }, breakLine: true } },
       { text: "Volatility raises the chance of touching 100%, so it funds the coupon instead of hurting the family", options: { bullet: { indent: 10 }, breakLine: true } },
       { text: "Market evidence: Taiwan structured-note issuance +81% in 2025, snowball autocalls the favourite payoff (SRP)", options: { bullet: { indent: 10 }, breakLine: true } },
       { text: `Honest caveat: a 5Y bond earns more in bear markets, but gives no AI exposure`, options: { bullet: { indent: 10 }, color: RED } }],
      { x: 7.9, y: 3.68, w: 4.8, h: 2.05, fontSize: 9.5, color: TXT, paraSpaceAfter: 3 });
    note(T, `Our Monte Carlo (pricing/scenario2_vs_traditional.py): TAIEX 40% / KOSPI 200 30% / Nikkei 225 30%, real-world equity drift 4% p.a.; protected note participation ${Math.round(RES.ppn.participation * 100)}%. Market regime = basket's own 5Y annualised total return. Early-called notes are not assumed to be reinvested. SRP = StructuredRetailProducts.com.`);
    banner(s, T, "Best way to own the theme: equals or beats the stocks in 3 of 4 markets, beats a plain protected note in 3 of 4, and never loses capital.");
    s.addNotes("Thesis 2 evidence. Same simulated paths for all four strategies. The note beats holding the basket in bear and flat markets, ties in moderate ones and lags only in bull markets. It beats the plain principal-protected note in every market except a bull market. Be upfront about the bond: a fixed 5.69% wins in bear markets and on average unless equities return ~8% a year, but a bond gives none of the AI exposure the family asked for.");
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
      ["VKOSPI record close 91.23 (9 Jun 2026), above Oct 2008 (89.30); 83.58 on 5 Mar 2026", "Herald Corp; SBS; FN News (Jun 2026)"],
      ["KOSPI 9,000+ in June (~+110% YTD), 6,789 on 28 Aug 2026", "BIT Research; FN News / Shinhan Securities (31 Aug 2026)"],
      ["2022: TAIEX −31.6% peak to trough; KOSPI −24.9%; SOX −36%", "TWSE 2022 Market Highlights; Korea Times; Bloomberg via BNN"],
      ["Japan buybacks ¥18.7trn FY2024, ~¥20trn FY2025e; Korea Value-Up Index +30% vs KOSPI 200", "Asset Management One via portfolio institutional; AllianceBernstein"],
      ["42 AI stocks = 65–75% of S&P 500 returns/profits/capex; ~92% of advanced chips from Taiwan; 10–15% correction in 2026 base case", "J.P. Morgan AWM, Eye on the Market 2026 Outlook \"Smothering Heights\" (1 Jan 2026)"],
      ["Taiwan structured notes 2025: ~75,900 products, +81%; snowball autocalls favoured", "StructuredRetailProducts.com, Taiwan Q4 2025 review"],
      ["Rate and vol sensitivities, break-even vs bond, market-type comparison", "Team Monte Carlo: scenario2_thesis_numbers.py, scenario2_vs_traditional.py"],
    ];
    const hdr = (t) => ({ text: t, options: { bold: true, color: WHITE, fill: { color: BLUE } } });
    s.addTable([[hdr("Fact used"), hdr("Source")]].concat(src.map((r) => [r[0], r[1]])), { x: 0.5, y: 1.15, w: 12.33, colW: [7.2, 5.13], fontFace: F, fontSize: 8.5,
      color: TXT, valign: "middle", border: { type: "solid", pt: 0.5, color: LINE }, fill: { color: WHITE }, rowH: 0.28, margin: [1, 5, 1, 5] });
    T("Several figures are forecasts or third-party estimates; numbers marked 'verify' come from a single secondary source. Full URLs: deck/thesis_sources.md.",
      { x: 0.5, y: 6.35, w: 12.33, h: 0.3, fontSize: 9, italic: true, color: MUTED });
  }

  await pres.writeFile({ fileName: path.join(__dirname, "Investment-Thesis-Slides.pptx") });
  console.log("wrote");
})();
