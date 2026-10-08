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

  // ===== Thesis 2: chip cycles are violent, so own the theme with protection =====
  {
    const { s, T } = mk("Investment thesis 2: Chip cycles are violent, so own the theme with protection", "ANALYSIS");
    bar(s, T, 0.5, 1.15, 4.0, "The last down-cycle (2022)");
    const d = [["TAIEX (peak to trough)", -0.316], ["KOSPI (calendar year)", -0.249], ["Global chip index SOX (calendar year)", -0.36]];
    s.addChart(pres.charts.BAR, [{ name: "2022", labels: d.map((x) => x[0]), values: d.map((x) => +(x[1] * 100).toFixed(1)) }],
      Object.assign(chartBase(), { x: 0.5, y: 1.65, w: 4.0, h: 3.0, barDir: "col", chartColors: [RED], showValue: true, dataLabelPosition: "outEnd",
        dataLabelFormatCode: '0.0"%"', dataLabelFontSize: 10, dataLabelColor: TXT, valAxisMinVal: -45, valAxisMaxVal: 0, valAxisLabelFormatCode: '0"%"',
        title: "2022 decline", showLegend: false, catAxisLabelFontSize: 9 }));
    T("Chip stocks fell 25–36% in a single year when the inventory cycle turned. A direct investor would have needed a 33–56% rally just to get back to even.",
      { x: 0.5, y: 4.75, w: 4.0, h: 1.0, fontSize: 10.5, color: MUTED });

    bar(s, T, 4.75, 1.15, 4.0, "2026: the boom is priced in");
    const st = [["~2×", "KOSPI in 2026: ~+100% YTD, crossed 9,000 (Jun 2026), then two violent single-day crashes"],
                [">40%", "TSMC's weight in the TAIEX: one stock drives the index"],
                ["12%", "Advantest's Nikkei 225 weight (Jul 2026): above the 10% cap, so Nikkei is cutting it"],
                ["−4%", "Nikkei fall in a chip-led selloff, mid-July 2026"]];
    st.forEach((x, i) => {
      const y = 1.7 + i * 1.02;
      s.addShape(pres.shapes.RECTANGLE, { x: 4.75, y, w: 4.0, h: 0.92, fill: { color: i % 2 ? WHITE : GRAY }, line: { color: GRAY } });
      T(x[0], { x: 4.85, y, w: 1.15, h: 0.92, fontSize: 22, bold: true, color: i === 0 || i === 3 ? RED : BLUE, align: "center", valign: "middle" });
      T(x[1], { x: 6.05, y: y + 0.08, w: 2.6, h: 0.8, fontSize: 10, color: TXT, valign: "middle" });
    });

    bar(s, T, 9.0, 1.15, 3.83, "Tailwind: governance reform");
    const gv = [["Japan", "TSE's 2023 push on companies below 1× book: record buybacks (¥18.7trn FY2024, ~¥20trn forecast FY2025); share of Prime firms below 1× P/B down from ~50% to 44%"],
                ["Korea", "Corporate Value-up Programme (Feb 2024): Korea Value-Up Index beat KOSPI 200 by >30% from late 2024 to Feb 2026"]];
    gv.forEach((x, i) => {
      const y = 1.7 + i * 2.05;
      s.addShape(pres.shapes.RECTANGLE, { x: 9.0, y, w: 3.83, h: 1.92, fill: { color: BLUE_L }, line: { color: BLUE_L } });
      T(x[0], { x: 9.15, y: y + 0.1, w: 3.5, h: 0.3, fontSize: 13, bold: true, italic: true, color: BLUE });
      T(x[1], { x: 9.15, y: y + 0.45, w: 3.55, h: 1.4, fontSize: 10, color: TXT });
    });
    note(T, "Sources: TWSE 2022 market highlights; Korea Times / Yonhap (KOSPI 2022); Bloomberg via BNN (SOX 2022); BIT Research (KOSPI 2026, verify on Bloomberg); Trading Economics (TSMC weight, Jul 2026); Nikkei Asia (Advantest weight cap); Nikkei index summary; Asset Management One via portfolio institutional (Japan buybacks); AllianceBernstein (Korea Value-Up Index).");
    banner(s, T, "Keep the AI exposure, hand the drawdown to Natixis: 100% capital protection, and a coupon that needs only a recovery to 100%.");
    s.addNotes("Thesis 2. The growth is real but chip stocks are the most cyclical part of the market: 2022 cost 25–36% in a year. After the 2026 rally the risk is skewed: KOSPI roughly doubled and already had single-day crashes, and the indices are concentrated in a few names. Governance reforms in Japan and Korea are a tailwind that helps the basket recover to 100%, which is all our coupon needs. KOSPI 2026 figures come from one secondary source: check them on Bloomberg before presenting.");
  }

  // ===== Thesis 3: autocallables beat the normal ways to own the theme =====
  {
    const { s, T } = mk("Investment thesis 3: An autocallable beats the usual ways to own this theme", "STRATEGY");
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
    s.addNotes("Thesis 3. Same simulated paths for all four strategies. The note beats holding the basket in bear and flat markets, ties in moderate ones and lags only in bull markets. It beats the plain principal-protected note in every market except a bull market. Be upfront about the bond: a fixed 5.69% wins in bear markets and on average unless equities return ~8% a year, but a bond gives none of the AI exposure the family asked for.");
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
