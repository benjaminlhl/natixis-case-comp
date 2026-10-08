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

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
pres.title = "Strategy: five-ETF Asian AI-hardware portfolio";

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

// ---------- Slide 1: allocation ----------
{
  const { s, T } = mk("Strategy: a five-ETF portfolio across Asia's AI-hardware chain");
  T("USD 100mn split across five Bloomberg-listed ETFs; half of it in the semiconductor core (3119 HK + 2644 JP)",
    { x: 0.5, y: 1.06, w: 12.33, h: 0.3, fontSize: 11, italic: true, color: MUTED });
  const etfs = [
    ["3119 HK", "Global X Asia Semiconductor ETF", "Core: pan-Asian chip leaders (TSMC, Samsung, SK hynix)"],
    ["EWY US", "iShares MSCI South Korea ETF", "Memory for AI: Samsung + SK hynix ≈ 44% of the fund"],
    ["EWT US", "iShares MSCI Taiwan ETF", "The AI foundry: TSMC, MediaTek, Delta"],
    ["2644 JP", "Global X Japan Semiconductor ETF", "Chip-making tools: Tokyo Electron, Advantest"],
    ["00878 TT", "Cathay Taiwan ESG Sustainability High Dividend ETF", "ESG sleeve: dividend income, lowest volatility"],
  ];
  const w = etfs.map((e) => R.weights[e[0]]);
  const cols = [BLUE, "4F86AE", BLUE_M, "A6A6A6", GREEN];
  s.addChart(pres.charts.DOUGHNUT, [{ name: "Weight", labels: etfs.map((e) => e[0]), values: w.map((x) => x * 100) }],
    { x: 0.5, y: 1.5, w: 3.9, h: 3.9, holeSize: 55, chartColors: cols, showPercent: false, showValue: true, dataLabelFormatCode: '0"%"',
      dataLabelColor: WHITE, dataLabelFontSize: 11, dataLabelFontBold: true, dataLabelFontFace: F, showLegend: true, legendPos: "b", legendFontSize: 9.5, legendFontFace: F });
  T([{ text: "USD 100mn", options: { bold: true, fontSize: 16, color: BLUE, breakLine: true } }, { text: "5 ETFs", options: { fontSize: 10, color: MUTED } }],
    { x: 1.65, y: 2.75, w: 1.6, h: 0.7, align: "center", valign: "middle" });
  const rows = [[hdr("ETF (Bloomberg)"), hdr("Weight"), hdr("USD mn"), hdr("Role in the portfolio")]].concat(etfs.map((e, i) => [
    { text: [{ text: e[0], options: { bold: true, breakLine: true } }, { text: e[1], options: { fontSize: 8, color: MUTED } }] },
    { text: (w[i] * 100).toFixed(0) + "%", options: { bold: true, align: "center" } },
    { text: (w[i] * 100).toFixed(0), options: { align: "center" } }, e[2]]));
  s.addTable(rows, { x: 4.7, y: 1.5, w: 8.13, colW: [3.0, 0.8, 0.8, 3.53], fontFace: F, fontSize: 9.5, color: TXT, valign: "middle",
    border: { type: "solid", pt: 0.5, color: LINE }, fill: { color: WHITE }, rowH: [0.34, 0.62, 0.62, 0.62, 0.62, 0.62], margin: [2, 6, 2, 6] });
  T([{ text: "Why these weights: ", options: { bold: true, color: BLUE } },
     { text: "the largest slice (35%) goes to the broadest chip basket; Korea (20%) adds memory, the tightest part of the AI supply chain; Taiwan, Japan and the ESG dividend sleeve (15% each) complete the chain and steady the ride." }],
    { x: 4.7, y: 5.2, w: 8.13, h: 0.7, fontSize: 10, color: TXT });
  banner(s, T, "One theme, five bottlenecks: chips, memory, foundry, tools, plus an ESG income anchor");
  note(T, "Weights from the team's allocation. Liquidity rule (USD 5M/day, 6-month average): EWY, EWT, 2644 and 00878 pass; 3119 HK is borderline, verify on Bloomberg.");
}

// ---------- Slide 2: Monte Carlo chart ----------
{
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
{
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

pres.writeFile({ fileName: path.join(__dirname, "Strategy-Slides.pptx") }).then((f) => console.log("wrote", f));
