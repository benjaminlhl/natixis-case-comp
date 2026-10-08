// Investment thesis "at this moment": the five-ETF portfolio read through eight factors, in the team template
// (blue bars, Arial, section footer). Numbers from Bloomberg prices (simulation/factor_snapshot.json,
// simulation/collar_results.json) and dated public sources listed on the last slide and in deck/thesis_sources.md.
// Build: NODE_PATH=<dir with pptxgenjs> node deck/build_factor_thesis.js
const path = require("path");
const pptxgen = require("pptxgenjs");
const FS = require(path.join(__dirname, "..", "simulation", "factor_snapshot.json"));
const COL = require(path.join(__dirname, "..", "simulation", "collar_results.json"));
const IMG = (f) => path.join(__dirname, "..", "simulation", f);

const BLUE = "2C5F82", BLUE_L = "E8EFF5", TXT = "262626", MUTED = "595959", WHITE = "FFFFFF", LINE = "BFBFBF";
const SIG = { Positive: "E2F0E4", Mixed: "FFF3D6", Negative: "F8E1E1" };
const F = "Arial";
const pct = (x, d = 0) => (x >= 0 ? "+" : "−") + (Math.abs(x) * 100).toFixed(d) + "%";
const P = FS.etfs.Portfolio, E = FS.etfs;

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
pres.title = "Investment thesis: factors at the trade date";

const mk = (titleText, section) => {
  const s = pres.addSlide();
  s.background = { color: WHITE };
  const T = (t, o) => s.addText(t, Object.assign({ fontFace: F, fontSize: 12, color: TXT, margin: 0, valign: "top", isTextBox: true }, o));
  T(titleText, { x: 0.5, y: 0.3, w: 12.3, h: 0.6, fontSize: 22, valign: "middle" });
  s.addShape(pres.shapes.LINE, { x: 0.5, y: 0.98, w: 12.33, h: 0, line: { color: BLUE, width: 1 } });
  s.addShape(pres.shapes.LINE, { x: 0.5, y: 6.98, w: 12.33, h: 0, line: { color: LINE, width: 0.75 } });
  [["ANALYSIS", 0.5], ["STRATEGY", 4.69], ["APPENDIX", 8.89]].forEach(([t, x]) => {
    const on = t === section;
    if (on) s.addShape(pres.shapes.RECTANGLE, { x: x + 0.6, y: 6.96, w: 2.75, h: 0.05, fill: { color: BLUE }, line: { color: BLUE } });
    T(t, { x, y: 7.05, w: 3.95, h: 0.3, fontSize: 12, bold: on, color: on ? BLUE : MUTED, align: "center", charSpacing: 1 });
  });
  return { s, T };
};
const banner = (s, T, text, y = 6.22) => {
  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y, w: 12.33, h: 0.55, fill: { color: BLUE }, line: { color: BLUE } });
  T(text, { x: 0.65, y, w: 12.03, h: 0.55, fontSize: 12.5, bold: true, color: WHITE, align: "center", valign: "middle" });
};
const note = (T, text, y) => T(text, { x: 0.5, y, w: 12.33, h: 0.3, fontSize: 8, italic: true, color: MUTED });

// ---------- Slide 1: factor scorecard
{
  const { s, T } = mk("Investment thesis now: the AI-hardware story is intact, the entry point is volatile", "ANALYSIS");
  T("Eight factors behind 3119 HK, 2644 JP, 00878 TT, EWY and EWT at the 17 Sep 2026 trade date (market data to 8 Oct 2026)",
    { x: 0.5, y: 1.06, w: 12.3, h: 0.3, fontSize: 11, italic: true, color: MUTED });
  const H = (t) => ({ text: t, options: { bold: true, color: WHITE, fill: { color: BLUE }, fontSize: 10 } });
  const rows = [
    ["AI demand", "Positive", "TSMC Aug-26 revenue +53% y/y (Jan–Aug +39%); hyperscaler capex ≈US$725bn in 2026 (+77%); chip market ≈US$1.5trn (WSTS)",
      "Five years of structural growth: own the theme, not a bond"],
    ["Memory cycle", "Mixed", "Samsung Q3-26 operating profit seen at ≈₩100trn+ (₩12trn a year ago); but DRAM contract gains slow: +45–50% Q2, +13–18% Q3, +10–15% Q4e",
      "Earnings near a cyclical peak: Korea (EWY) and 3119 most exposed"],
    ["Momentum", "Mixed", `Portfolio ${pct(P.ret_1y)} in 1 year, ${pct(P.cagr_3y)} a year over 3 years; but ${pct(P.ret_3m)} in 3 months and ${pct(P.from_52w_high)} from its high (2644 JP ${pct(E["2644 JP"].from_52w_high)})`,
      "Entry after a pullback, but the trend is fragile"],
    ["Volatility", "Negative", `Realised vol ${(P.vol_3m * 100).toFixed(0)}% vs ${(P.vol_5y_weekly * 100).toFixed(0)}% 5-year average (${(P.vol_3m_percentile * 100).toFixed(0)}th percentile); VKOSPI record 91 (Jun-26); KOSPI −8.95% in one day (13 Jul)`,
      "Holding naked is costly; high vol makes option-based protection and coupons rich"],
    ["Valuation", "Mixed", "KOSPI forward P/E ≈7.8×; Nikkei 17.2× forward, CAPE 38.6; Taiwan among the most expensive markets",
      "Korea cheap, Japan and Taiwan full: no margin of safety in price"],
    ["Rates & FX", "Mixed", "Fed hiked to 3.75–4.00% (16 Sep), ≈1-in-3 odds of another on 28 Oct; BoJ 1.25% (18 Sep); USD/JPY ≈158; 5Y USD funding 5.69%",
      "Strong USD drags USD returns; high rates make a capital floor cheap (5Y zero-coupon 75.8)"],
    ["Geopolitics", "Negative", "Taiwan makes ≈92% of advanced chips and is 'the most blockade-sensitive advanced economy' (J.P. Morgan); US Section 232 chip tariff 25%",
      "A tail risk no diversification removes: needs a contractual floor"],
    ["Income & ESG", "Positive", `00878 (ESG high dividend) pays ≈7.6% a year, lowest vol (${(E["00878 TT"].vol_5y_weekly * 100).toFixed(0)}%), ${pct(E["00878 TT"].from_52w_high, 1)} from its high`,
      "Ballast and ESG credentials inside the basket"],
  ].map(([f, sig, ev, imp]) => [
    { text: f, options: { bold: true } },
    { text: sig, options: { bold: true, fill: { color: SIG[sig] }, align: "center" } },
    ev, imp]);
  s.addTable([[H("Factor"), H("Signal"), H("Reading now (evidence)"), H("What it means")], ...rows],
    { x: 0.5, y: 1.42, w: 12.33, colW: [1.35, 0.95, 6.33, 3.7], fontFace: F, fontSize: 9.5, color: TXT, valign: "middle",
      border: { type: "solid", pt: 0.5, color: LINE }, fill: { color: WHITE }, rowH: [0.32, 0.54, 0.54, 0.54, 0.54, 0.46, 0.54, 0.54, 0.46], margin: [2, 5, 2, 5] });
  banner(s, T, "Thesis: stay invested in Asian AI hardware for five years, but at 2× normal volatility and with tail risk, hold it with a floor", 6.0);
  note(T, "Sources: Bloomberg USD prices 2021–26 (team calculations); TSMC 6-K (10 Sep 2026); Hana/IBK Securities previews; TrendForce; Siblis Research; Federal Reserve; BoJ; J.P. Morgan AWM 2026 Outlook; WSTS. Full list in the appendix. Forecasts marked ≈ are consensus or approximate: verify before submission.", 6.6);
}

// ---------- Slide 2: where we are now (prices + KPI tiles)
{
  const { s, T } = mk(`Where we are now: one AI cycle in five years, ${pct(P.ret_1y)} in the last twelve months`, "ANALYSIS");
  s.addImage({ path: IMG("mc_factor_prices.png"), x: 0.5, y: 1.15, w: 8.6, h: 8.6 * 1120 / 2400 });
  const tiles = [
    [pct(P.ret_1y), "Portfolio, last 12 months"],
    [pct(P.ret_3m), "Last 3 months: the pullback"],
    [pct(P.from_52w_high), "Below the 52-week high"],
    [pct(P.max_dd_5y), "Worst fall in 5 years (2022)"],
  ];
  tiles.forEach(([v, l], i) => {
    const y = 1.2 + i * 1.18;
    s.addShape(pres.shapes.RECTANGLE, { x: 9.35, y, w: 3.48, h: 1.04, fill: { color: BLUE_L }, line: { color: BLUE_L } });
    T(v, { x: 9.5, y: y + 0.08, w: 3.2, h: 0.55, fontSize: 26, bold: true, color: BLUE });
    T(l, { x: 9.5, y: y + 0.64, w: 3.2, h: 0.32, fontSize: 10.5, color: MUTED });
  });
  banner(s, T, "Strong long-term trend, but we are buying after a 12-month surge and a sharp summer correction: timing risk is high", 5.95);
  note(T, "Source: Bloomberg PX_LAST in USD, 29 Sep 2021 to 17 Sep 2026; buy-and-hold portfolio at our weights (3119 HK 25%, 2644 JP 25%, 00878 TT 20%, EWY 15%, EWT 15%). Price only.", 6.6);
}

// ---------- Slide 3: risk regime + what we do about it
{
  const { s, T } = mk("Risk regime: volatility is at a 5-year extreme, and diversification is not helping", "ANALYSIS");
  s.addImage({ path: IMG("mc_factor_regime.png"), x: 1.17, y: 1.1, w: 11, h: 11 * 920 / 2600 });
  const boxes = [
    ["Volatility 2× normal", `Realised ${(P.vol_3m * 100).toFixed(0)}% vs ${(P.vol_5y_weekly * 100).toFixed(0)}% on average. In our 5-year simulation the unhedged worst 1% is USD ${COL.year5_percentiles_unhedged["1"].toFixed(0)}mn of 100.`],
    ["Correlation stays high", `The five ETFs move together (${FS.avg_corr_3m.toFixed(2)} now, ${FS.avg_corr_5y.toFixed(2)} on average): they share TSMC, Samsung and SK hynix, so a shock hits all five.`],
    ["So: protect, don't dilute", `A zero-cost collar (buy the ${(COL.put_strike * 100).toFixed(0)}% put, sell a ≈${(COL.call_strike_mc * 100).toFixed(0)}% call) lifts the worst 1% to USD 70mn and keeps the median at ${COL.year5_percentiles_collared["50"].toFixed(0)}.`],
  ];
  boxes.forEach(([h, b], i) => {
    const x = 0.5 + i * 4.18;
    s.addShape(pres.shapes.RECTANGLE, { x, y: 5.05, w: 3.97, h: 1.25, fill: { color: BLUE_L }, line: { color: BLUE_L } });
    s.addShape(pres.shapes.RECTANGLE, { x, y: 5.05, w: 0.07, h: 1.25, fill: { color: BLUE }, line: { color: BLUE } });
    T(h, { x: x + 0.2, y: 5.12, w: 3.67, h: 0.3, fontSize: 12, bold: true, color: BLUE });
    T(b, { x: x + 0.2, y: 5.44, w: 3.67, h: 0.82, fontSize: 10, color: TXT });
  });
  note(T, "Realised vol: 63-day daily returns of the buy-and-hold portfolio; 5-year average of that series 22% (weekly-return vol 24.5%). Correlation: 13-week weekly returns. Collar priced in the team Monte Carlo without volatility skew (real quotes will be dearer).", 6.45);
}

// ---------- Slide 4: sources
{
  const { s, T } = mk("Appendix: sources for the factor thesis", "APPENDIX");
  const src = [
    ["Prices, returns, volatility, correlation, drawdowns", "Bloomberg PX_LAST (USD), 3119 HK, 2644 JP, EWY US, EWT US, 00878 TT, 2021-09 to 2026-09; simulation/factor_snapshot.py"],
    ["TSMC Aug-26 revenue NT$514.8bn, +53.3% y/y; Jan–Aug +39.3%; Q3 guide US$44.6–45.8bn", "TSMC monthly revenue report / Form 6-K, 10 Sep 2026 (sec.gov); Focus Taiwan, 10 Sep 2026"],
    ["Samsung Q3-26 operating profit forecasts ₩101.7trn (IBK) to ₩108trn (Hana); Q3-25 ₩12.17trn", "Broker previews via StockHub (Oct 2026); Korea JoongAng Daily (Q3 2025 actual). Verify against the preliminary release"],
    ["DRAM contract prices +45–50% Q2, +13–18% Q3, +10–15% Q4e", "TrendForce via iConnect007 / TechNews (2026)"],
    ["Hyperscaler capex ≈US$725bn 2026; chip market ≈US$1.5trn", "Company guidance via AI Weekly / Yahoo Finance; WSTS Spring 2026 forecast"],
    ["KOSPI fwd P/E 7.82; Nikkei fwd 17.18, CAPE 38.59", "Siblis Research (1 Jul 2026)"],
    ["VKOSPI record 91.23 (9 Jun 2026); KOSPI −8.95% (13 Jul 2026)", "SBS; Herald Corp; Asiae"],
    ["Fed 3.75–4.00% (16 Sep 2026); BoJ 1.25% (18 Sep 2026); USD/JPY ≈158; Oct meeting odds", "Federal Reserve; TMGM / Oxford Economics market notes (Oct 2026). Verify on federalreserve.gov and boj.or.jp"],
    ["Taiwan ≈92% of advanced chips; blockade sensitivity; 10–15% correction base case", "J.P. Morgan AWM, Eye on the Market 2026 Outlook 'Smothering Heights' (1 Jan 2026)"],
    ["US Section 232 25% tariff on advanced logic chips", "Proclamation 11002 via Perkins Coie (Jan 2026)"],
    ["Collar and simulation outcomes", "Team Monte Carlo: simulation/portfolio_mc.py, simulation/collar_overlay.py"],
  ];
  const H = (t) => ({ text: t, options: { bold: true, color: WHITE, fill: { color: BLUE } } });
  s.addTable([[H("Fact"), H("Source")], ...src], { x: 0.5, y: 1.2, w: 12.33, colW: [5.6, 6.73], fontFace: F, fontSize: 9.5, color: TXT,
    border: { type: "solid", pt: 0.5, color: LINE }, valign: "middle", rowH: 0.42, margin: [2, 5, 2, 5] });
}

pres.writeFile({ fileName: path.join(__dirname, "Investment-Thesis-Factors.pptx") }).then((f) => console.log("wrote", f));
