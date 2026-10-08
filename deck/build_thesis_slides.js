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

  // ===== Thesis 1: AI is a hardware boom, and Asia builds the hardware =====
  {
    const { s, T } = mk("Investment thesis 1: AI is a hardware boom, and Asia builds the hardware", "ANALYSIS");
    bar(s, T, 0.5, 1.15, 7.0, "Our three markets own the chokepoints");
    const rows = [
      [FaMicrochip, "Taiwan: makes the chips", "~70%", "TSMC share of global\nfoundry revenue (Q1 2026)",
        ["High-performance computing (incl. AI) was 58% of TSMC revenue in 2025", "TSMC is >40% of the TAIEX: our largest index is a chip index"]],
      [FaMemory, "Korea: makes the memory", "83%", "SK hynix (50%) + Samsung (33%)\nshare of HBM revenue (Q2 2026)",
        ["Every AI accelerator needs high-bandwidth memory (HBM)", "Samsung + SK hynix ≈ 48% of KOSPI market cap (verify)"]],
      [FaTools, "Japan: makes the tools", "~55%", "Advantest share of chip\ntest equipment",
        ["Tokyo Electron ~90% of coater/developers; #3 equipment maker", "Advantest + Tokyo Electron ≈ 20% of the Nikkei 225 (Jul 2026)"]],
    ];
    for (let i = 0; i < rows.length; i++) {
      const [ic, head, big, bigLab, pts] = rows[i], y = 1.72 + i * 1.38;
      s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y, w: 7.0, h: 1.25, fill: { color: i % 2 ? WHITE : GRAY }, line: { color: GRAY } });
      s.addShape(pres.shapes.OVAL, { x: 0.65, y: y + 0.15, w: 0.5, h: 0.5, fill: { color: BLUE }, line: { color: BLUE } });
      s.addImage({ data: await icon(ic, WHITE), x: 0.77, y: y + 0.27, w: 0.26, h: 0.26 });
      T(head, { x: 1.3, y: y + 0.12, w: 3.3, h: 0.32, fontSize: 13.5, bold: true, italic: true, color: BLUE, valign: "middle" });
      T(pts.map((t, j) => ({ text: t, options: { bullet: { indent: 10 }, breakLine: j < pts.length - 1 } })),
        { x: 1.3, y: y + 0.48, w: 3.55, h: 0.75, fontSize: 10, color: MUTED, paraSpaceAfter: 2 });
      T(big, { x: 4.95, y: y + 0.08, w: 2.45, h: 0.55, fontSize: 28, bold: true, color: BLUE, align: "center", valign: "middle" });
      T(bigLab, { x: 4.95, y: y + 0.63, w: 2.45, h: 0.55, fontSize: 9, color: MUTED, align: "center" });
    }
    bar(s, T, 7.75, 1.15, 5.08, "2026: spending is surging");
    const g = [["Hyperscaler capex (4 largest)", 0.77], ["Global chip market (WSTS)", 0.90], ["Logic chips (WSTS)", 0.37],
               ["DRAM equipment (SEMI)", 0.39], ["Chip test equipment (SEMI)", 0.31], ["All chip equipment (SEMI)", 0.232]];
    s.addChart(pres.charts.BAR, [{ name: "2026 growth", labels: g.map((x) => x[0]), values: g.map((x) => +(x[1] * 100).toFixed(1)) }],
      Object.assign(chartBase(), { x: 7.75, y: 1.65, w: 5.08, h: 4.1, barDir: "bar", chartColors: [BLUE], showValue: true, dataLabelPosition: "outEnd",
        dataLabelFormatCode: '"+"0"%"', dataLabelFontSize: 10, dataLabelColor: TXT, valAxisHidden: true, valGridLine: { style: "none" }, valAxisMinVal: 0, valAxisMaxVal: 110,
        title: "2026 growth vs 2025 (forecast / guidance)", showLegend: false, catAxisOrientation: "maxMin" }));
    note(T, "Sources: Counterpoint (foundry Q1 2026; HBM Q2 2026); TSMC 2025 results; Trading Economics / Focus Taiwan (TSMC weight); BIT Research (KOSPI weight); company reports and SEMI (TEL, Advantest); Nikkei index summary 17 Jul 2026; company guidance after Q1 2026 (capex); WSTS Spring 2026; SEMI mid-year forecast 14 Jul 2026. Full list in appendix.");
    banner(s, T, "We buy the picks and shovels: whichever AI model wins, it needs Taiwan's chips, Korea's memory and Japan's tools.");
    s.addNotes("Thesis 1. AI is first a hardware story, and the three markets in our basket each own a chokepoint: Taiwan fabricates the chips, Korea supplies the high-bandwidth memory, Japan makes the equipment and testers. The chart shows 2026 spending growth across the chain. Several figures are forecasts or guidance; HBM and foundry shares are Counterpoint estimates. Verify the KOSPI concentration figure on Bloomberg.");
  }

  // ===== Thesis 2: why an autocall on our theme with protection (economic + finance) =====
  {
    const { s, T } = mk("Investment thesis 2: Own the AI-hardware theme through a protected autocall", "ANALYSIS");
    const REC = RES.recommended, RN = RES.rn, SV = RES.coupon_sens, CPN = RES.inputs.coupon;
    const col = (x, w, head, sub) => {
      bar(s, T, x, 1.15, w, head);
      T(sub, { x, y: 1.62, w, h: 0.3, fontSize: 10.5, italic: true, color: MUTED, align: "center" });
    };
    const point = (x, w, y, num, big, bigColor, head, body) => {
      s.addShape(pres.shapes.RECTANGLE, { x, y, w, h: 0.86, fill: { color: num % 2 ? GRAY : WHITE }, line: { color: GRAY } });
      s.addShape(pres.shapes.OVAL, { x: x + 0.1, y: y + 0.2, w: 0.42, h: 0.42, fill: { color: WHITE }, line: { color: BLUE, width: 1.25 } });
      T(String(num), { x: x + 0.1, y: y + 0.2, w: 0.42, h: 0.42, fontSize: 13, bold: true, italic: true, color: BLUE, align: "center", valign: "middle" });
      T(big, { x: x + 0.62, y, w: 1.1, h: 0.86, fontSize: 19, bold: true, color: bigColor, align: "center", valign: "middle" });
      T([{ text: head, options: { bold: true, color: TXT, breakLine: true } }, { text: body, options: { color: MUTED } }],
        { x: x + 1.8, y: y + 0.06, w: w - 1.9, h: 0.78, fontSize: 9.5, valign: "middle" });
    };

    // ---- Left: economic aspect
    const LX = 0.5, LW = 6.0;
    col(LX, LW, "Economic aspect: why this theme needs protection", "Structural growth, but a violent and concentrated path");
    const d = [["TAIEX", -0.316], ["KOSPI", -0.249], ["Global chip index", -0.36]];
    s.addChart(pres.charts.BAR, [{ name: "2022", labels: d.map((x) => x[0]), values: d.map((x) => +(x[1] * 100).toFixed(1)) }],
      Object.assign(chartBase(), { x: LX, y: 1.95, w: 2.3, h: 1.75, barDir: "col", chartColors: [RED], showValue: true, dataLabelPosition: "outEnd",
        dataLabelFormatCode: '0"%"', dataLabelFontSize: 9, dataLabelColor: TXT, valAxisHidden: true, valGridLine: { style: "none" }, valAxisMinVal: -45, valAxisMaxVal: 0,
        title: "Last down-cycle: 2022 fall", titleFontSize: 9.5, showLegend: false, catAxisLabelFontSize: 8 }));
    T([{ text: "Growth is structural…", options: { bold: true, color: BLUE, breakLine: true } },
       { text: "Hyperscaler capex +77% and chip-equipment sales +23% in 2026 (thesis 1).", options: { breakLine: true } },
       { text: "…but the path is not", options: { bold: true, color: RED, breakLine: true } },
       { text: "Chip stocks fell 25–36% in 2022. A direct investor needed a 33–56% rally just to get back to even." }],
      { x: LX + 2.45, y: 2.0, w: LW - 2.5, h: 1.65, fontSize: 10, color: TXT, paraSpaceAfter: 3 });
    point(LX, LW, 3.8, 1, "~2×", RED, "The 2026 boom is priced in", "KOSPI roughly doubled in 2026 and has already had two violent one-day crashes (verify on Bloomberg).");
    point(LX, LW, 4.66, 2, ">40%", BLUE, "Returns hinge on a few names", "TSMC is >40% of the TAIEX; Advantest grew past the Nikkei's 10% weight cap. One stock can move the index.");
    point(LX, LW, 5.52, 3, "¥20trn", BLUE, "Reforms support a recovery to 100%", "Record Japanese buybacks (~¥20trn FY2025 forecast) and Korea's Value-up programme help the basket get back to its start.");

    // ---- Right: finance aspect
    const RX = 6.83, RW = 6.0;
    col(RX, RW, "Finance aspect: why an autocall with protection", "Today's rates pay for the protection; Asian volatility pays for the coupon");
    const parts = [["Protected principal", REC.pv_principal], ["Coupons (net of autocall)", REC.pv_coupons], ["Natixis hedging & margin", REC.natixis_margin]];
    s.addChart(pres.charts.BAR, parts.map((p) => ({ name: `${p[0]}: ${(p[1] * 100).toFixed(1)}%`, labels: ["100% issue price"], values: [+(p[1] * 100).toFixed(1)] })),
      Object.assign(chartBase(), { x: RX, y: 1.95, w: RW, h: 1.75, barDir: "bar", barGrouping: "stacked", chartColors: [BLUE, BLUE_M, "A6A6A6"],
        showValue: false,
        valAxisMinVal: 0, valAxisMaxVal: 100, valAxisHidden: true, valGridLine: { style: "none" }, catAxisHidden: true,
        title: "Where the client's 100% goes (fair value, % of notional)", titleFontSize: 9.5, showLegend: true, legendPos: "b", legendFontSize: 9, legendFontFace: F }));
    point(RX, RW, 3.8, 1, pct(RES.inputs.zcb_5y), BLUE, "High USD rates make protection cheap",
      `At 5.69% 5Y funding, USD 100 at year 5 costs only USD ${(RES.inputs.zcb_5y * 100).toFixed(1)} today, and early calls make it cheaper still (${pct(REC.pv_principal)} in our note).`);
    point(RX, RW, 4.66, 2, pct(RES.basket_vol, 0), BLUE, "Volatility funds the coupon, not losses",
      `Higher vol means more chances to touch 100%: fair coupon ${pct(SV.base)} rising to ${pct(SV["vol +3pts"])} if vol is 3pts higher.`);
    point(RX, RW, 5.52, 3, pct(RN.p_called, 0), BLUE, "The autocall only needs a recovery",
      `Called in ${pct(RN.p_called, 0)} of paths (${pct(RN.p_call_by_year[0], 0)} at year 1); memory pays missed coupons later. Result: ${pct(CPN, 2)} p.a. and 0% capital loss.`);

    note(T, "Sources: TWSE, Korea Times, Bloomberg/BNN (2022); BIT Research (KOSPI 2026, single source); Trading Economics, Nikkei Asia (index weights); Asset Management One (buybacks); case funding grid; team Monte Carlo (pricing/scenario2_autocall_mc.py). Full list in appendix.", 6.42);
    s.addNotes("Thesis 2 in two halves. Economic: AI hardware demand is structural, but chip stocks move in violent cycles, 2026 prices already reflect a boom, and the indices are concentrated in a few names; governance reforms support a recovery to the starting level. Finance: high USD rates make the 100% protection cheap, Asian volatility makes the 100% coupon trigger likely, and the autocall pays as soon as the basket recovers, with memory catching up missed coupons. Together: the family keeps the theme without the drawdown.");
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
      ["TSMC ~70–73% of global foundry revenue (Q1 2026); HPC 58% of 2025 revenue", "Counterpoint Research via press; TSMC results (verify in TSMC Q-reports)"],
      ["TSMC >40% of TAIEX market value (2026)", "Trading Economics (28 Jul 2026); Focus Taiwan (May 2026)"],
      ["HBM revenue share Q2 2026: SK hynix 50%, Samsung 33%, Micron 18%", "Counterpoint Research, Global DRAM and HBM Market Share (quarterly)"],
      ["Advantest ~55–58% of chip test equipment; TEL ~90% of coater/developers", "Industry research summaries; verify in TEL and Advantest annual reports"],
      ["Advantest 12.2% / TEL ~9–10% of Nikkei 225; weight cap from 1 Oct 2026", "Nikkei Asia announcement; Nikkei index summary (17 Jul 2026)"],
      ["Hyperscaler capex ~USD 725bn in 2026, +77% y/y", "Company guidance after Q1 2026 earnings, as reported by AI Weekly / Yahoo Finance"],
      ["Chip market ~USD 1.5trn in 2026 (+90%); logic +37%", "WSTS Spring 2026 forecast (2 Jun 2026), wsts.org"],
      ["Equipment USD 165.9bn (+23.2%); DRAM equip. +39%; test +31%", "SEMI mid-year forecast (14 Jul 2026), semi.org"],
      ["2022: TAIEX −31.6% peak to trough; KOSPI −24.9%; SOX −36%", "TWSE 2022 Market Highlights; Korea Times / Yonhap; Bloomberg via BNN"],
      ["KOSPI ~+100% YTD, above 9,000 (18 Jun 2026); Samsung + SK hynix ~48% of market cap", "BIT Research, 'The KOSPI supercycle' (single source: verify on Bloomberg)"],
      ["Japan buybacks ¥18.7trn FY2024, ~¥20trn forecast FY2025; P/B<1 share ~50% → 44%", "Asset Management One via portfolio institutional; investment-manager commentary"],
      ["Korea Value-Up Index beat KOSPI 200 by >30% (late 2024 – 27 Feb 2026)", "AllianceBernstein, 'South Korea's rising governance tide'"],
      ["Taiwan structured notes 2025: ~75,900 products, +81%; snowball autocalls favoured", "StructuredRetailProducts.com, Taiwan Q4 2025 review"],
      ["Strategy comparison, coupon pricing, call probabilities", "Team Monte Carlo: pricing/scenario2_vs_traditional.py, scenario2_autocall_mc.py"],
    ];
    const hdr = (t) => ({ text: t, options: { bold: true, color: WHITE, fill: { color: BLUE } } });
    s.addTable([[hdr("Fact used"), hdr("Source")]].concat(src.map((r) => [r[0], r[1]])), { x: 0.5, y: 1.15, w: 12.33, colW: [6.6, 5.73], fontFace: F, fontSize: 9.5,
      color: TXT, valign: "middle", border: { type: "solid", pt: 0.5, color: LINE }, fill: { color: WHITE }, rowH: 0.34, margin: [2, 5, 2, 5] });
    T("Several figures are forecasts or third-party estimates; numbers marked 'verify' come from a single secondary source. Full URLs: deck/thesis_sources.md.",
      { x: 0.5, y: 6.35, w: 12.33, h: 0.3, fontSize: 9, italic: true, color: MUTED });
  }

  await pres.writeFile({ fileName: path.join(__dirname, "Investment-Thesis-Slides.pptx") });
  console.log("wrote");
})();
