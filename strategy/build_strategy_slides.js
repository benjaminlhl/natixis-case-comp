// Strategy slides from the team's Monte Carlo app: five-ETF portfolio (3119 HK 35%, EWY 20%, EWT 15%, 2644 JP 15%,
// 00878 TT 15%), 5-year simulation per USD 100,000 invested, annual checkpoints and the USD 70,000 target.
// Team template: blue, Arial, ANALYSIS / STRATEGY / APPENDIX footer.
// Data: strategy/app_simulation_results.json; chart image from strategy/make_strategy_chart.py.
// Build: NODE_PATH=<dir with pptxgenjs> node strategy/build_strategy_slides.js
const path = require("path");
const pptxgen = require("pptxgenjs");
const R = require(path.join(__dirname, "app_simulation_results.json"));
const C = R.checkpoints, S0 = R.start_value, TGT = R.target;

const BLUE = "2C5F82", BLUE_L = "E8EFF5", BLUE_M = "8DB3D1", GRAY = "F2F2F2", TXT = "262626", MUTED = "595959",
      WHITE = "FFFFFF", LINE = "BFBFBF", GREEN = "2E9E44", RED = "C0392B", ORANGE = "E67E22";
const F = "Arial";
const usd = (v) => "$" + v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const k = (v) => "$" + (v / 1000).toFixed(1) + "k";
const cagr = (v) => Math.pow(v / S0, 1 / 5) - 1;
const pc = (x, d = 1) => (x < 0 ? "−" : "+") + Math.abs(x * 100).toFixed(d) + "%";
const last = (a) => a[a.length - 1];

// only: list of slide numbers to add (1 allocation + risk/return, 2 Monte Carlo, 3 checkpoints); default all
function addStrategySlides(pres, only) {
const want = (n) => !only || only.includes(n);
const mk = (titleText) => {
  const s = pres.addSlide();
  s.background = { color: WHITE };
  const T = (t, o) => s.addText(t, Object.assign({ fontFace: F, fontSize: 12, color: TXT, margin: 0, valign: "top", isTextBox: true }, o));
  T(titleText, { x: 0.5, y: 0.3, w: 12.3, h: 0.6, fontSize: 22, valign: "middle" });
  s.addShape(pres.shapes.LINE, { x: 0.5, y: 0.98, w: 12.33, h: 0, line: { color: BLUE, width: 1 } });
  s.addShape(pres.shapes.LINE, { x: 0.5, y: 6.98, w: 12.33, h: 0, line: { color: LINE, width: 0.75 } });
  [["ANALYSIS", 0.5], ["STRATEGY", 4.69], ["APPENDIX", 8.89]].forEach(([t, x]) => {
    const on = t === "STRATEGY";
    if (on) s.addShape(pres.shapes.RECTANGLE, { x: x + 0.6, y: 6.96, w: 2.75, h: 0.05, fill: { color: BLUE }, line: { color: BLUE } });
    T(t, { x, y: 7.05, w: 3.95, h: 0.3, fontSize: 12, bold: on, color: on ? BLUE : MUTED, align: "center", charSpacing: 1 });
  });
  return { s, T };
};
const banner = (s, T, text, y = 6.1) => {
  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y, w: 12.33, h: 0.5, fill: { color: BLUE }, line: { color: BLUE } });
  T(text, { x: 0.65, y, w: 12.03, h: 0.5, fontSize: 12, bold: true, color: WHITE, align: "center", valign: "middle" });
};
const note = (T, text, y = 6.66) => T(text, { x: 0.5, y, w: 12.33, h: 0.28, fontSize: 8, italic: true, color: MUTED });
const hdr = (t) => ({ text: t, options: { bold: true, color: WHITE, fill: { color: BLUE } } });

// ---------- Slide 1: allocation + risk/return of the five ETFs ----------
if (want(1)) {
  const { s, T } = mk("Strategy: our five-ETF basket sits at the low-risk edge of every possible mix");
  T("USD 100mn across five Bloomberg-listed ETFs; our weights (red star) deliver ~26% expected return for only ~17% volatility",
    { x: 0.5, y: 1.06, w: 12.33, h: 0.3, fontSize: 11, italic: true, color: MUTED });
  const etfs = [
    ["3119 HK", "Pan-Asian chip leaders"], ["EWY US", "Korea: memory for AI"], ["EWT US", "Taiwan: the AI foundry"],
    ["2644 JP", "Japan: chip-making tools"], ["00878 TT", "ESG dividend anchor"]];
  const w = etfs.map((e) => R.weights[e[0]]);
  const cols = [BLUE, "4F86AE", BLUE_M, "A6A6A6", GREEN];
  const head = (x, wd, t) => {
    s.addShape(pres.shapes.RECTANGLE, { x, y: 1.45, w: wd, h: 0.36, fill: { color: BLUE }, line: { color: BLUE } });
    T(t, { x, y: 1.45, w: wd, h: 0.36, fontSize: 11.5, bold: true, color: WHITE, align: "center", valign: "middle" });
  };
  // Left: allocation
  head(0.5, 3.75, "Allocation");
  s.addChart(pres.charts.DOUGHNUT, [{ name: "Weight", labels: etfs.map((e) => e[0]), values: w.map((x) => x * 100) }],
    { x: 0.85, y: 1.85, w: 2.05, h: 2.05, holeSize: 52, chartColors: cols, showPercent: false, showValue: false, showLegend: false });
  T([{ text: "USD", options: { fontSize: 9, color: MUTED, breakLine: true } }, { text: "100mn", options: { bold: true, fontSize: 13, color: BLUE } }],
    { x: 1.37, y: 2.6, w: 1.0, h: 0.55, align: "center", valign: "middle" });
  T([{ text: "Half in the semiconductor core", options: { bold: true, color: BLUE, breakLine: true } },
     { text: "3119 HK + 2644 JP = 50%; Korea adds memory, Taiwan the foundry, 00878 the ESG income." }],
    { x: 3.0, y: 2.05, w: 1.25, h: 1.7, fontSize: 8.5, color: TXT });
  const rows = etfs.map((e, i) => [
    { text: "■", options: { color: cols[i], fontSize: 12, align: "center" } },
    { text: e[0], options: { bold: true } }, e[1],
    { text: (w[i] * 100).toFixed(0) + "%", options: { bold: true, align: "right" } }]);
  s.addTable(rows, { x: 0.5, y: 4.05, w: 3.75, colW: [0.3, 0.85, 2.0, 0.6], fontFace: F, fontSize: 9.5, color: TXT, valign: "middle",
    border: { type: "solid", pt: 0.5, color: "E3E3E3" }, fill: { color: WHITE }, rowH: 0.36, margin: [1, 4, 1, 4] });
  // Middle: risk/return cloud from the team app
  head(4.45, 5.0, "Risk vs return: single ETFs and random mixes");
  s.addImage({ path: path.join(__dirname, "risk_return_cloud.jpg"), x: 4.5, y: 1.88, w: 4.9, h: 4.9 * 1273 / 1620 });
  // Right: how to read + takeaways
  head(9.65, 3.18, "How to read it");
  T([{ text: "Orange dots: ", options: { bold: true, color: ORANGE } }, { text: "each ETF on its own (2644 is the dot near 0.26, 0.25).", options: { breakLine: true } },
     { text: "Red star: ", options: { bold: true, color: RED } }, { text: "our basket (35 / 20 / 15 / 15 / 15).", options: { breakLine: true } },
     { text: "Small dots: ", options: { bold: true, color: BLUE } }, { text: "thousands of random weightings of the five ETFs; lighter = more return per unit of risk.", options: { breakLine: true } },
     { text: "Axes: ", options: { bold: true, color: TXT } }, { text: "annualised volatility (risk) and expected return." }],
    { x: 9.7, y: 1.88, w: 3.1, h: 1.45, fontSize: 9, color: TXT, paraSpaceAfter: 3 });
  s.addShape(pres.shapes.RECTANGLE, { x: 9.65, y: 3.4, w: 3.18, h: 2.55, fill: { color: BLUE_L }, line: { color: BLUE_L } });
  T([{ text: "Takeaways", options: { bold: true, color: BLUE, fontSize: 11, breakLine: true } },
     { text: "Our basket (red star): ~26% return at ~17% volatility, the lowest risk of all the mixes shown.", options: { bullet: true, breakLine: true } },
     { text: "Most random mixes need 22–32% volatility for the same 25–28% return: our weights get it with less risk.", options: { bullet: true, breakLine: true } },
     { text: "Less risk than any single ETF, about a third of EWY's (~49%), while giving up only a few points versus EWT's ~31%.", options: { bullet: true, breakLine: true } },
     { text: "Why: 3119 HK (35%) anchors the basket; the other four move differently enough to pull risk down.", options: { bullet: true } }],
    { x: 9.75, y: 3.48, w: 3.0, h: 2.42, fontSize: 9.5, color: TXT, paraSpaceAfter: 4 });
  banner(s, T, "Our basket (red star): ~26% return for ~17% volatility, less risk than any single ETF or random mix");
  note(T, "Risk/return chart: team analysis app (annualised from historical data; red star = our basket at 35/20/15/15/15; values read from the chart). Liquidity: 3119 HK is borderline against the USD 5M/day rule, verify on Bloomberg.");
}

// ---------- Slide 2: Monte Carlo chart ----------
if (want(2)) {
  const { s, T } = mk("Monte Carlo: the median portfolio grows 2.8× in five years");
  T("5-year simulation of the five-ETF portfolio, per USD 100,000 invested (×1,000 for the USD 100mn mandate)",
    { x: 0.5, y: 1.06, w: 12.33, h: 0.3, fontSize: 11, italic: true, color: MUTED });
  s.addImage({ path: path.join(__dirname, "mc_checkpoints.png"), x: 0.5, y: 1.42, w: 8.2, h: 8.2 * 1078 / 1892 });
  const tiles = [
    [k(last(C.median)), `Median at Year 5: ${(last(C.median) / S0).toFixed(1)}× the start, ${pc(cagr(last(C.median)))} a year`, BLUE],
    [k(last(C.p5)), `Bearish (5th percentile): still above the start, ${pc(cagr(last(C.p5)))} a year`, RED],
    [k(last(C.p95)), `Bullish (95th percentile): ${(last(C.p95) / S0).toFixed(1)}× the start`, GREEN],
    [(last(C.prob_ge_target) * 100).toFixed(1) + "%", "Chance of ending at or above the USD 70,000 target", ORANGE],
  ];
  tiles.forEach(([v, l, c], i) => {
    const y = 1.45 + i * 1.12;
    s.addShape(pres.shapes.RECTANGLE, { x: 8.95, y, w: 3.88, h: 1.0, fill: { color: GRAY }, line: { color: GRAY } });
    s.addShape(pres.shapes.RECTANGLE, { x: 8.95, y, w: 0.07, h: 1.0, fill: { color: c }, line: { color: c } });
    T(v, { x: 9.15, y: y + 0.06, w: 3.6, h: 0.5, fontSize: 22, bold: true, color: c });
    T(l, { x: 9.15, y: y + 0.56, w: 3.6, h: 0.4, fontSize: 9.5, color: MUTED });
  });
  banner(s, T, `Even the bearish path ends above the start (${k(last(C.p5))}); the USD 70,000 target is the 1st percentile`);
  note(T, "Source: team Monte Carlo app (annual checkpoints of the simulated paths). Lines connect the yearly values. Results depend on the app's return and volatility inputs; refresh with Bloomberg data at the 17 Sep 2026 trade date.");
}

// ---------- Slide 3: annual checkpoint table ----------
if (want(3)) {
  const { s, T } = mk("Annual checkpoints: the downside stays above the USD 70,000 target");
  T("Simulated portfolio value at each year-end, per USD 100,000 invested", { x: 0.5, y: 1.06, w: 12.33, h: 0.3, fontSize: 11, italic: true, color: MUTED });
  const H = (t, c) => ({ text: t, options: { bold: true, color: WHITE, fill: { color: c || BLUE }, align: "center" } });
  const rows = [[H("Timeline"), H("Median value (USD)"), H("Bearish 5th percentile (USD)", RED), H("Bullish 95th percentile (USD)", GREEN), H("Probability ≥ target (USD 70,000)", ORANGE)]];
  rows.push([{ text: "Start", options: { bold: true } }, usd(S0), usd(S0), usd(S0), "–"].map((x) => typeof x === "string" ? { text: x, options: { align: "center", color: MUTED } } : x));
  C.labels.forEach((lab, i) => rows.push([
    { text: lab, options: { bold: true } },
    { text: usd(C.median[i]), options: { align: "center", bold: i === 4 } },
    { text: usd(C.p5[i]), options: { align: "center", bold: i === 4 } },
    { text: usd(C.p95[i]), options: { align: "center", bold: i === 4 } },
    { text: (C.prob_ge_target[i] * 100).toFixed(2) + "%", options: { align: "center", bold: i === 4 } }]));
  s.addTable(rows, { x: 0.5, y: 1.5, w: 8.2, colW: [1.1, 1.7, 1.8, 1.8, 1.8], fontFace: F, fontSize: 10.5, color: TXT, valign: "middle",
    border: { type: "solid", pt: 0.5, color: LINE }, fill: { color: WHITE }, rowH: [0.55, 0.45, 0.5, 0.5, 0.5, 0.5, 0.5], margin: [2, 6, 2, 6] });
  // Year-5 row highlight
  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 1.5 + 0.55 + 0.45 + 4 * 0.5, w: 8.2, h: 0.5, fill: { type: "none" }, line: { color: BLUE, width: 1.75 } });
  const reads = [
    ["Year 1 is the stress point", `The 5th percentile falls to ${k(C.p5[0])} (${pc(C.p5[0] / S0 - 1, 0)}) before recovering every year after.`],
    ["The target holds", `At least ${(Math.min(...C.prob_ge_target) * 100).toFixed(1)}% of paths stay at or above USD 70,000 in every year, rising to ${(last(C.prob_ge_target) * 100).toFixed(1)}% at Year 5.`],
    ["Upside compounds", `Median ${k(last(C.median))} at Year 5 (${pc(cagr(last(C.median)))} a year); for the mandate, about USD ${(last(C.median) / S0 * 100).toFixed(0)}mn.`],
  ];
  reads.forEach(([h, b], i) => {
    const y = 1.5 + i * 1.18;
    s.addShape(pres.shapes.RECTANGLE, { x: 8.95, y, w: 3.88, h: 1.06, fill: { color: BLUE_L }, line: { color: BLUE_L } });
    T(h, { x: 9.1, y: y + 0.08, w: 3.6, h: 0.3, fontSize: 11.5, bold: true, color: BLUE });
    T(b, { x: 9.1, y: y + 0.4, w: 3.6, h: 0.62, fontSize: 9.5, color: TXT });
  });
  banner(s, T, "A growth portfolio whose bad years stay above the USD 70,000 line in 97–99% of simulated paths");
  note(T, "Source: team Monte Carlo app, Annual Portfolio Checkpoint Table. Probabilities are shares of simulated paths; they are model outputs, not guarantees.");
}

}
module.exports = { addStrategySlides };

if (require.main === module) {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
  pres.title = "Strategy: five-ETF Asian AI-hardware portfolio";
  addStrategySlides(pres);
  pres.writeFile({ fileName: path.join(__dirname, "Strategy-Slides.pptx") }).then((f) => console.log("wrote", f));
}
