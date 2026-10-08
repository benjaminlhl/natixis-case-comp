// One-page investment thesis: the key points of the thesis deck (thesis 1, J.P. Morgan outlook, thesis 2 and the
// FOMC dot plot) on a single slide in the team template (blue, Arial, section footer).
// Data: deck/thesis_market_data.json, pricing/scenario2_thesis_numbers.json, pricing/scenario2_results.json.
// Build: NODE_PATH=<dir with pptxgenjs> node deck/build_thesis_onepage.js
const path = require("path");
const pptxgen = require("pptxgenjs");
const RES = require(path.join(__dirname, "..", "pricing", "scenario2_results.json"));
const TN = require(path.join(__dirname, "..", "pricing", "scenario2_thesis_numbers.json"));
const MD = require(path.join(__dirname, "thesis_market_data.json"));

const BLUE = "2C5F82", BLUE_L = "E8EFF5", BLUE_M = "8DB3D1", GRAY = "F2F2F2", TXT = "262626", MUTED = "595959",
      WHITE = "FFFFFF", LINE = "BFBFBF", RED = "B23B3B";
const F = "Arial";
const pct = (x, d = 1) => (x >= 0 ? "" : "−") + (Math.abs(x) * 100).toFixed(d) + "%";

function addThesisOnePage(pres) {
const s = pres.addSlide();
s.background = { color: WHITE };
const T = (t, o) => s.addText(t, Object.assign({ fontFace: F, fontSize: 12, color: TXT, margin: 0, valign: "top", isTextBox: true }, o));

// Title, rules and section footer (team template)
T("Investment thesis: Monopolizing the AI Supply Chain via Structured Overlays", { x: 0.5, y: 0.3, w: 12.3, h: 0.6, fontSize: 22, valign: "middle" });
s.addShape(pres.shapes.LINE, { x: 0.5, y: 0.98, w: 12.33, h: 0, line: { color: BLUE, width: 1 } });
s.addShape(pres.shapes.LINE, { x: 0.5, y: 6.98, w: 12.33, h: 0, line: { color: LINE, width: 0.75 } });
[["ANALYSIS", 0.5], ["STRATEGY", 4.69], ["APPENDIX", 8.89]].forEach(([t, x]) => {
  const on = t === "ANALYSIS";
  if (on) s.addShape(pres.shapes.RECTANGLE, { x: x + 0.6, y: 6.96, w: 2.75, h: 0.05, fill: { color: BLUE }, line: { color: BLUE } });
  T(t, { x, y: 7.05, w: 3.95, h: 0.3, fontSize: 12, bold: on, color: on ? BLUE : MUTED, align: "center", charSpacing: 1 });
});
T("What we own and why we wrap it: structural demand for Asian chips, memory and tools, held through a market of high rates, record volatility and concentrated, full prices",
  { x: 0.5, y: 1.04, w: 12.33, h: 0.3, fontSize: 10.5, italic: true, color: MUTED });

const header = (x, w, num, text) => {
  s.addShape(pres.shapes.RECTANGLE, { x, y: 1.42, w, h: 0.42, fill: { color: BLUE }, line: { color: BLUE } });
  T([{ text: num + "  ", options: { bold: true, color: BLUE_M } }, { text, options: { bold: true, color: WHITE } }],
    { x: x + 0.15, y: 1.42, w: w - 0.3, h: 0.42, fontSize: 12.5, valign: "middle" });
};
const chartBase = () => ({ catAxisLabelColor: MUTED, valAxisLabelColor: MUTED, catAxisLabelFontFace: F, valAxisLabelFontFace: F,
  catAxisLabelFontSize: 8.5, valAxisLabelFontSize: 8, valGridLine: { color: "E3E3E3", size: 0.5 }, catGridLine: { style: "none" },
  titleFontFace: F, titleColor: TXT, titleFontSize: 9.5, catAxisLineColor: LINE });

// ---------------- Left: thesis 1, what we own ----------------
const LX = 0.5, LW = 6.0;
header(LX, LW, "1", "Asia controls AI's hardware bottlenecks");
const cm = MD.chip_market_bn;
s.addChart(pres.charts.BAR, [{ name: "Chip market", labels: cm.labels, values: cm.values }],
  Object.assign(chartBase(), { x: LX, y: 1.92, w: 2.7, h: 2.05, barDir: "col", chartColors: [BLUE, BLUE, BLUE_M, BLUE_M], showValue: true, dataLabelPosition: "outEnd",
    dataLabelFormatCode: '"$"#,##0', dataLabelFontSize: 8, dataLabelColor: TXT, valAxisHidden: true, valGridLine: { style: "none" }, valAxisMinVal: 0, valAxisMaxVal: 2250,
    showTitle: true, title: "Global chip market, US$bn (WSTS)", showLegend: false }));
T([{ text: "Demand is structural", options: { bold: true, color: BLUE, breakLine: true } },
   { text: "Hyperscaler capex ~US$725bn in 2026 (+77%); the chip market nearly doubles to ~US$1.5trn.", options: { breakLine: true } },
   { text: "The moat runs through Asia", options: { bold: true, color: BLUE, breakLine: true } },
   { text: "8 of the world's 10 largest companies depend on TSMC (J.P. Morgan).", options: { breakLine: true } },
   { text: "…but the cycle is maturing", options: { bold: true, color: RED, breakLine: true } },
   { text: "DRAM price gains slowing: +48% in Q2, ~+13% expected in Q4 2026." }],
  { x: LX + 2.85, y: 1.98, w: LW - 2.9, h: 2.0, fontSize: 9.5, color: TXT, paraSpaceAfter: 2 });
const nodes = [["~70%", "Taiwan makes the chips", "TSMC share of global foundry revenue; TSMC >40% of TAIEX"],
               ["83%", "Korea makes the memory", "SK hynix + Samsung share of HBM, the memory every AI accelerator needs"],
               ["~55%", "Japan makes the tools", "Advantest share of chip test equipment; with Tokyo Electron ≈ 20% of the Nikkei"]];
nodes.forEach(([big, head, body], i) => {
  const y = 4.08 + i * 0.66;
  s.addShape(pres.shapes.RECTANGLE, { x: LX, y, w: LW, h: 0.6, fill: { color: i % 2 ? WHITE : GRAY }, line: { color: GRAY } });
  s.addShape(pres.shapes.RECTANGLE, { x: LX, y, w: 0.07, h: 0.6, fill: { color: BLUE }, line: { color: BLUE } });
  T(big, { x: LX + 0.12, y, w: 1.15, h: 0.6, fontSize: 18, bold: true, color: BLUE, align: "center", valign: "middle" });
  T([{ text: head + ": ", options: { bold: true, color: TXT } }, { text: body, options: { color: MUTED } }],
    { x: LX + 1.35, y, w: LW - 1.45, h: 0.6, fontSize: 9.5, valign: "middle" });
});

// ---------------- Right: thesis 2, why an autocall now ----------------
const RX = 6.83, RW = 6.0;
header(RX, RW, "2", "2026 punishes bonds and buy-and-hold");
const DOT = MD.fomc_dots_sep2026;
s.addImage({ path: path.join(__dirname, "fomc_dot_plot_compact.png"), x: RX, y: 1.95, w: 3.6, h: 3.6 * 638 / 1804 });
T("FOMC dot plot, 16 Sep 2026 (shaded: today's 3.75–4.00%)", { x: RX, y: 3.25, w: 3.6, h: 0.2, fontSize: 7.5, italic: true, color: MUTED });
T([{ text: "Rates stay high", options: { bold: true, color: BLUE, breakLine: true } },
   { text: `Fed median 4.125% to end-2027, cuts only from 2028; 4.375% seen by ${DOT["2026"]["4.375"]} members for 2026 and ${DOT["2027"]["4.375"]} for 2027.` }],
  { x: RX + 3.75, y: 1.98, w: RW - 3.75, h: 1.3, fontSize: 9.5, color: TXT, paraSpaceAfter: 2 });
const R100 = TN.rates["+100bp"];
const why = [
  [pct(R100.bond_value_change), "Long bonds carry rate risk", `a 5-year bond loses ~${pct(-R100.bond_value_change)} per 1% rise.`,
    "Redeems from year 1 (expected life ~2 years): short duration, cash back to reinvest"],
  ["91.2", "Volatility is at records", "VKOSPI's all-time high; KOSPI fell ~25% from June to August 2026.",
    "Coupons pay on recovery, no timing needed; rich option premium funds them"],
  ["~92%", "Concentrated and fully priced", "of advanced chips come from Taiwan; Nikkei CAPE 38.6×.",
    "Diversified five-ETF basket; coupons lock in gains if the rally stalls"],
];
why.forEach(([big, head, body, link], i) => {
  const y = 3.5 + i * 0.83;
  s.addShape(pres.shapes.RECTANGLE, { x: RX, y, w: RW, h: 0.77, fill: { color: i % 2 ? WHITE : GRAY }, line: { color: GRAY } });
  s.addShape(pres.shapes.RECTANGLE, { x: RX, y, w: 0.07, h: 0.77, fill: { color: i === 0 ? BLUE : RED }, line: { color: i === 0 ? BLUE : RED } });
  T(big, { x: RX + 0.12, y, w: 1.15, h: 0.77, fontSize: 18, bold: true, color: i === 0 ? BLUE : RED, align: "center", valign: "middle" });
  T([{ text: head + ": ", options: { bold: true, color: TXT } }, { text: body, options: { color: MUTED, breakLine: true } },
     { text: "→ " + link, options: { bold: true, color: BLUE } }],
    { x: RX + 1.35, y: y + 0.03, w: RW - 1.45, h: 0.71, fontSize: 9, valign: "middle", paraSpaceAfter: 1 });
});

// Conclusion and sources
s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 6.06, w: 12.33, h: 0.5, fill: { color: BLUE }, line: { color: BLUE } });
T("Whichever AI company wins, it needs Asia's chips, memory and tools; a memory-coupon autocall pays while the market swings.",
  { x: 0.65, y: 6.06, w: 12.03, h: 0.5, fontSize: 11.5, bold: true, color: WHITE, align: "center", valign: "middle" });
T("Sources: WSTS; company capex guidance; Counterpoint (foundry, HBM); TrendForce (DRAM); industry research (test equipment); J.P. Morgan AWM 2026 Outlook; Federal Reserve SEP (16 Sep 2026, dots read from chart); Herald / SBS (VKOSPI); FN News, BIT Research (KOSPI); Siblis (CAPE); case USD funding grid. Full list: deck/thesis_sources.md.",
  { x: 0.5, y: 6.6, w: 12.33, h: 0.32, fontSize: 7.5, italic: true, color: MUTED });
s.addNotes("One-page thesis. Left: what we own. AI spending is a hardware boom and Asia holds the three bottlenecks: Taiwan's foundries, Korea's high-bandwidth memory, Japan's chip-making tools. Demand is structural, though the memory cycle is maturing. Right: why we hold it through an autocall now. The Fed's dot plot keeps rates high until 2028, so long bonds carry rate risk while an autocall redeems early; volatility is at records, so buy-and-hold must sit through violent swings while autocall coupons pay on recovery and are funded by option premium; the theme is concentrated and fully priced, so a diversified basket and a capped upside cost little.");

}
module.exports = { addThesisOnePage };

if (require.main === module) {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
  pres.title = "Investment thesis on one page";
  addThesisOnePage(pres);
  pres.writeFile({ fileName: path.join(__dirname, "Investment-Thesis-OnePage.pptx") }).then((f) => console.log("wrote", f));
}
