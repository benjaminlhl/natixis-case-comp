// Scenario 2 deck: Asian Digital Transformation Autocallable Note (classic memory-coupon autocall) (NKE Private Wealth / Chak family)
// Numbers come from pricing/scenario2_results.json (run pricing/scenario2_autocall_mc.py first).
// Build: NODE_PATH=<dir with pptxgenjs> node deck/build_deck_scenario2.js
const path = require("path");
const pptxgen = require("pptxgenjs");
const R = require(path.join(__dirname, "..", "pricing", "scenario2_results.json"));


// Team-template slides (thesis, strategy) are authored on a 13.33 x 7.5 canvas; scale them by 0.75 onto this 10 x 5.625 deck.
const SCALE = 0.75;
function scaleOpts(o, top) {
  if (Array.isArray(o)) return o.map((v) => scaleOpts(v, false));
  if (!o || typeof o !== "object") return o;
  const r = {};
  for (const [k, v] of Object.entries(o)) {
    if (top && ["x", "y", "w", "h"].includes(k) && typeof v === "number") r[k] = v * SCALE;
    else if ((k === "colW" || k === "rowH") && top) r[k] = Array.isArray(v) ? v.map((z) => z * SCALE) : v * SCALE;
    else if (/^fontSize$|FontSize$/.test(k) && typeof v === "number") r[k] = Math.round(v * SCALE * 10) / 10;
    else if (k === "line" && v && typeof v === "object") r[k] = Object.assign({}, v, typeof v.width === "number" ? { width: v.width * SCALE } : {});
    else if (k === "options" || k === "text") r[k] = scaleOpts(v, false);
    else r[k] = v;
  }
  return r;
}
const scaleText = (t) => (Array.isArray(t) ? t.map((run) => (run && typeof run === "object" ? scaleOpts(run, false) : run)) : t);
function scaledPres(p) {
  return {
    shapes: p.shapes, charts: p.charts,
    addSlide() {
      const s = p.addSlide();
      this.last = s;
      return {
        set background(b) { s.background = b; },
        addText: (t, o) => s.addText(scaleText(t), scaleOpts(o, true)),
        addShape: (type, o) => s.addShape(type, scaleOpts(o, true)),
        addImage: (o) => s.addImage(scaleOpts(o, true)),
        addChart: (type, data, o) => s.addChart(type, data, scaleOpts(o, true)),
        addTable: (rows, o) => s.addTable(rows.map((row) => row.map((c) => (c && typeof c === "object" ? scaleOpts(c, false) : c))), scaleOpts(o, true)),
        addNotes: (t) => s.addNotes(t),
      };
    },
  };
}
const { addThesisOnePage } = require(path.join(__dirname, "build_thesis_onepage.js"));
const { addStrategySlides } = require(path.join(__dirname, "..", "strategy", "build_strategy_slides.js"));

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9"; // 10 x 5.625
pres.title = "Asian Digital Transformation Autocallable Note";

// Palette: team template (blue, Arial), shared with the thesis and strategy slides
const BLUE = "2C5F82", INK = BLUE, JADE = BLUE, MID = "4F86AE", BLUE_M = "8DB3D1", MINT = "E8EFF5", GRAY = "F2F2F2",
      RED = "B23B3B", ORANGE = "E67E22", GREEN = "2E9E44", HL = "BFD7EA", LINE = "BFBFBF",
      TXT = "262626", MUTED = "595959", WHITE = "FFFFFF", GRID = "E3E3E3", SLATE = "A6A6A6";
const HF = "Arial", BF = "Arial";

const pct = (x, d = 1) => ((Math.abs(x) < 5e-5 ? 0 : x) * 100).toFixed(d) + "%";
const CPN = R.inputs.coupon, QC = CPN / 4;
const REC = R.recommended, RN = R.rn, SV = R.coupon_sens;
const SHORT = { "3119 HK Equity": "Asia Semiconductor (3119 HK)", "2644 JP Equity": "Japan Semiconductor (2644 JP)", "EWT US Equity": "iShares MSCI Taiwan (EWT)",
                "EWY US Equity": "iShares MSCI South Korea (EWY)", "00878 TT Equity": "Taiwan ESG High Dividend (00878 TT)" };
const NOTE = "Monte Carlo, 200k paths. Vols, dividends and correlations are assumptions to refresh with Bloomberg data as of the 17 Sep 2026 trade date; discounting uses the USD funding grid.";

// Team template geometry (the 13.33 x 7.5 template scaled by 0.75 onto this 10 x 5.625 deck)
function title(s, t, sub) {
  const r = s.raw || s;
  r.addText(t, { x: 0.375, y: 0.225, w: 9.225, h: 0.45, fontFace: HF, fontSize: 16.5, color: TXT, margin: 0, valign: "middle", isTextBox: true });
  r.addShape(pres.shapes.LINE, { x: 0.375, y: 0.735, w: 9.25, h: 0, line: { color: BLUE, width: 0.75 } });
  if (sub) r.addText(sub, { x: 0.375, y: 0.785, w: 9.25, h: 0.23, fontFace: BF, fontSize: 8.5, italic: true, color: MUTED, margin: 0, isTextBox: true });
}
function sectionFooter(r, section) {
  r.addShape(pres.shapes.LINE, { x: 0.375, y: 5.235, w: 9.25, h: 0, line: { color: LINE, width: 0.56 } });
  [["ANALYSIS", 0.375], ["STRATEGY", 3.5175], ["APPENDIX", 6.6675]].forEach(([t, x]) => {
    const on = t === section;
    if (on) r.addShape(pres.shapes.RECTANGLE, { x: x + 0.45, y: 5.22, w: 2.0625, h: 0.0375, fill: { color: BLUE }, line: { color: BLUE } });
    r.addText(t, { x, y: 5.2875, w: 2.9625, h: 0.225, fontFace: BF, fontSize: 9, bold: on, color: on ? BLUE : MUTED, align: "center", charSpacing: 1, margin: 0, isTextBox: true });
  });
}
function pageNo(s, n) {
  (s.raw || s).addText(String(n), { x: 9.3, y: 5.2875, w: 0.32, h: 0.225, fontFace: BF, fontSize: 8, color: MUTED, align: "right", margin: 0, isTextBox: true });
}
function foot(s, txt) {
  (s.raw || s).addText(txt, { x: 0.375, y: 4.99, w: 8.8, h: 0.23, fontFace: BF, fontSize: 6.8, italic: true, color: MUTED, margin: 0, valign: "top", isTextBox: true });
}
// Content of the original 16:9 layout (y 1.15-5.15) is moved into the template's body (y 1.05-4.95);
// Arial runs wider than Calibri, so font sizes are trimmed by 8%.
const FY = (y) => 1.05 + (y - 1.15) * 0.975, FH = 0.975, FF = 0.92;
function fitOpts(o, top) {
  if (Array.isArray(o)) return o.map((v) => fitOpts(v, false));
  if (!o || typeof o !== "object") return o;
  const r = {};
  for (const [k, v] of Object.entries(o)) {
    if (top && k === "y" && typeof v === "number") r[k] = FY(v);
    else if (top && k === "h" && typeof v === "number") r[k] = v * FH;
    else if (top && k === "rowH") r[k] = Array.isArray(v) ? v.map((z) => z * FH) : v * FH;
    else if (/^fontSize$|FontSize$/.test(k) && typeof v === "number") r[k] = Math.round(v * FF * 10) / 10;
    else if (k === "options" || k === "text") r[k] = fitOpts(v, false);
    else r[k] = v;
  }
  return r;
}
const fitText = (t) => (Array.isArray(t) ? t.map((run) => (run && typeof run === "object" ? fitOpts(run, false) : run)) : t);
function contentSlide(section) {
  const r = pres.addSlide();
  r.background = { color: WHITE };
  if (section) sectionFooter(r, section);
  return {
    raw: r,
    addText: (t, o) => r.addText(fitText(t), fitOpts(o, true)),
    addShape: (type, o) => r.addShape(type, fitOpts(o, true)),
    addImage: (o) => r.addImage(fitOpts(o, true)),
    addChart: (type, data, o) => r.addChart(type, data, fitOpts(o, true)),
    addTable: (rows, o) => r.addTable(rows.map((row) => row.map((c) => (c && typeof c === "object" ? fitOpts(c, false) : c))), fitOpts(o, true)),
    addNotes: (t) => r.addNotes(t),
  };
}
function card(s, x, y, w, h, fill) {
  s.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: fill || MINT }, line: { color: fill || MINT } });
}
function dot(s, x, y, label, color, size = 0.42) {
  s.addShape(pres.shapes.OVAL, { x, y, w: size, h: size, fill: { color: color || JADE } });
  s.addText(label, { x, y, w: size, h: size, fontFace: HF, fontSize: 13, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0, isTextBox: true });
}
function txt(s, t, o) {
  s.addText(t, Object.assign({ fontFace: BF, fontSize: 11, color: TXT, margin: 0, valign: "top", isTextBox: true }, o));
}
const chartBase = () => ({
  catAxisLabelColor: MUTED, valAxisLabelColor: MUTED, catAxisLabelFontFace: BF, valAxisLabelFontFace: BF,
  catAxisLabelFontSize: 9, valAxisLabelFontSize: 9, valGridLine: { color: GRID, size: 0.5 },
  catGridLine: { style: "none" }, showLegend: false, titleFontFace: BF, titleColor: TXT, titleFontSize: 11,
  catAxisLineColor: SLATE, valAxisLineShow: false,
});
const hdr = (t) => ({ text: t, options: { bold: true, color: WHITE, fill: { color: INK } } });

// ======================= Title =======================
{
  const s = pres.addSlide(); s.background = { color: INK };
  s.addShape(pres.shapes.OVAL, { x: 6.4, y: -1.4, w: 5.4, h: 5.4, fill: { color: JADE, transparency: 35 } });
  s.addShape(pres.shapes.OVAL, { x: 8.3, y: 3.5, w: 2.4, h: 2.4, fill: { color: BLUE_M, transparency: 25 } });
  txt(s, "Investment Strategy Challenge 2026 · Proposal for NKE Private Wealth (Chak family)", { x: 0.6, y: 0.6, w: 7.5, h: 0.35, fontSize: 12.5, color: "BFDCD8" });
  txt(s, "Asian Digital Transformation Autocallable Note", { x: 0.6, y: 1.05, w: 6.2, h: 1.75, fontFace: HF, fontSize: 34, bold: true, color: WHITE, valign: "middle" });
  txt(s, `${pct(CPN, 2)} a year from Asia's semiconductor build-out, paid each quarter the basket is at or above its start`, { x: 0.6, y: 3.0, w: 6.0, h: 0.85, fontSize: 15, italic: true, color: "E3F1EF" });
  txt(s, `USD 100mn · 5-year note issued by Natixis · ${pct(CPN, 2)} p.a. memory coupon · autocall from Year 1 · Trade date 17 Sep 2026`, { x: 0.6, y: 4.45, w: 7.6, h: 0.4, fontSize: 11.5, bold: true, color: HL });
  s.addNotes("Title. One-line pitch: a classic memory-coupon autocallable on five Asian ETFs covering the AI-hardware supply chain (pan-Asian and Japanese semiconductors, Taiwan, Korea) plus an ESG sleeve. It pays a coupon whenever the basket is at or above its starting level and catches up any missed coupons. If the basket never gets back to its start, the note repays the basket's level at Year 5.");
}

// ======================= Agenda (not counted) =======================
{
  const s = contentSlide(null);
  title(s, "Agenda");
  const items = [["Client & market", "Who the Chak family is, what they need, and why Asia's digital build-out now", "1–2"],
                 ["Investment thesis & strategy", "Why Asian AI hardware, why an autocall now, our five-ETF weights and their 5-year simulation", "3–5"],
                 ["Product design", "Underlying basket, term sheet, and why a classic memory-coupon autocallable", "6–7"],
                 ["Payoffs explained", "Observation timeline and the three outcomes at maturity (building blocks in the appendix)", "8"],
                 ["Simulation", "Monte Carlo outcome distribution of the note (stress paths in the appendix)", "9"],
                 ["Risks & hedging", "Investor risks, mitigants, and how the Natixis desk hedges", "10"]];
  items.forEach((it, i) => {
    const y = 1.05 + i * 0.7;
    dot(s, 0.6, y + 0.05, String(i + 1), i % 2 ? MID : BLUE, 0.5);
    txt(s, it[0], { x: 1.35, y, w: 5, h: 0.32, fontSize: 16, bold: true, color: INK });
    txt(s, it[1], { x: 1.35, y: y + 0.33, w: 7, h: 0.3, fontSize: 11.5, color: MUTED });
    txt(s, (it[2].includes("–") ? "Slides " : "Slide ") + it[2], { x: 8.0, y: y + 0.08, w: 1.5, h: 0.3, fontSize: 11, color: MUTED, align: "right" });
  });
}

// ======================= Executive summary (not counted) =======================
{
  const s = contentSlide(null);
  title(s, "Executive summary", "One note that turns the family's view on Asian AI hardware into double-digit income");
  const stats = [[pct(CPN, 2), "Memory coupon p.a.", `${pct(QC, 2)} each quarter the basket is ≥ 100%; missed coupons are paid later when it recovers`],
                 [pct(RN.p_floor, 0), "Chance of a loss", `If never called, repaid at the basket level (on average ${pct(RN.avg_repayment_when_hit, 0)} back): the price of the higher coupon`],
                 [pct(RN.p_call_by_year[0], 0), "Called at first review", `Risk-neutral. ${pct(RN.p_called, 0)} called within 5 years; expected life ${RN.exp_life_y} years`]];
  stats.forEach((st, i) => {
    const x = 0.5 + i * 3.05;
    card(s, x, 1.35, 2.85, 2.3);
    txt(s, st[0], { x: x + 0.22, y: 1.48, w: 2.45, h: 0.8, fontFace: HF, fontSize: 38, bold: true, color: i === 1 ? RED : BLUE, valign: "middle" });
    txt(s, st[1], { x: x + 0.22, y: 2.3, w: 2.45, h: 0.32, fontSize: 13, bold: true, color: INK });
    txt(s, st[2], { x: x + 0.22, y: 2.65, w: 2.45, h: 0.95, fontSize: 10.5, color: MUTED });
  });
  txt(s, [
    { text: "We recommend ", options: {} },
    { text: "a USD 100mn, 5-year Natixis autocallable note", options: { bold: true, color: JADE } },
    { text: " on a basket of five Bloomberg-listed Asian ETFs: Global X Asia Semiconductor (3119 HK) 35%, iShares MSCI South Korea (EWY) 20%, iShares MSCI Taiwan (EWT) 15%, Global X Japan Semiconductor (2644 JP) 15% and Cathay Taiwan ESG High Dividend (00878 TT) 15%. It gives the family the AI hardware layer (chips, memory and chip-making equipment) that complements, rather than duplicates, the infrastructure, power and property they already own. ", options: {} },
    { text: `The family earns ${pct(CPN, 2)} a year in the ${pct(RN.p_called, 0)} of paths where the basket gets back to its starting level; if it never does (${pct(RN.p_floor, 0)} of paths, risk-neutral), the note repays the basket's level at Year 5. Fair value is ${pct(REC.pv)}, so issuing at par leaves Natixis ${pct(REC.natixis_margin)} for hedging and margin.`, options: { bold: true } },
  ], { x: 0.5, y: 3.85, w: 9, h: 1.3, fontSize: 11.5 });
  s.addNotes("Executive summary (does not count toward the 10-slide limit).");
}

// ======================= 1. Client =======================
{
  const s = contentSlide("ANALYSIS");
  title(s, "The family wants growth from Asia's AI build-out, on 5% of its wealth", "Client diagnosis: third-generation dynasty, succession done, now allocating for legacy");
  const cols = [
    ["Who they are", ["Single-family office: NKE Private Wealth", "Net worth > USD 2bn; mandate USD 100mn (~5%)", "Businesses: tech infrastructure, renewable power plants, real estate in Japan and Greater China"]],
    ["What they want", ["Capital appreciation for future generations", "Meaningful exposure to Asia's digital transformation", "To bridge traditional Asian sectors with emerging tech they know"]],
    ["What they can bear", ["Moderate risk: income first, capital usually back early", "5-year horizon; coupons can be reinvested", "Accepts limited liquidity on 5% of wealth", "Accepts equity risk on 5% of wealth"]],
  ];
  cols.forEach((c, i) => {
    const x = 0.5 + i * 3.05;
    card(s, x, 1.3, 2.85, 2.25, i === 2 ? INK : MINT);
    txt(s, c[0], { x: x + 0.2, y: 1.42, w: 2.5, h: 0.32, fontSize: 14, bold: true, color: i === 2 ? HL : INK });
    txt(s, c[1].map((t, j) => ({ text: t, options: { bullet: true, breakLine: j < c[1].length - 1 } })),
      { x: x + 0.2, y: 1.8, w: 2.5, h: 1.7, fontSize: 10.5, color: i === 2 ? WHITE : TXT, paraSpaceAfter: 3 });
  });
  const rows = [[hdr("Client need"), hdr("Design answer in our note")],
    ["Capital appreciation", `${pct(CPN, 2)} p.a. coupon, above the 5.69% 5Y USD funding rate, in every path that autocalls; proceeds roll into the next note`],
    ["Exposure to Asian digital transformation", "Semiconductor-heavy basket: the AI hardware layer behind the family's tech-infrastructure business (slide 6)"],
    ["Generational preservation", `Diversified basket (not worst-of); capital back early in ${pct(RN.p_called, 0)} of paths; BPCE-backed issuer`],
    ["Volatile markets", "Memory coupon: a missed coupon is paid when the basket recovers, so a temporary drawdown costs nothing"]];
  s.addTable(rows, { x: 0.5, y: 3.7, w: 9, colW: [2.6, 6.4], fontFace: BF, fontSize: 9.5, color: TXT, border: { type: "solid", pt: 0.5, color: GRID }, fill: { color: WHITE }, rowH: 0.27, margin: [2, 5, 2, 5] });
  pageNo(s, 1);
  s.addNotes("Client needs translate one-for-one into design features. The key insight: this is legacy money. The family wants growth and Asian tech exposure, and is willing to take equity risk on 5% of its wealth. That points us to a classic autocallable on a diversified basket: a double-digit coupon that rewards recovery and is never lost, thanks to memory, with capital usually back within about two years.");
}

// ======================= 2. Market view =======================
{
  const s = contentSlide("ANALYSIS");
  title(s, "Why now: Asia builds the hardware of the AI economy", "Investment thesis: structural growth themes, and high rates and volatility that pay for a double-digit coupon");
  const th = [["Taiwan: the AI foundry", "TSMC and its supply chain make most of the world's advanced AI chips; Taiwan's index is dominated by semiconductors."],
              ["Korea: memory for AI", "Samsung and SK hynix supply the high-bandwidth memory every AI accelerator needs; together ~44% of EWY."],
              ["Japan: chip-making tools", "Tokyo Electron, Advantest and peers make the equipment and testers chip factories need, alongside TSE governance reforms."],
              ["ESG sleeve", "00878 adds ESG-screened Taiwan leaders (MSCI ESG methodology) and a lower-volatility, high-dividend anchor to the basket."]];
  th.forEach((t, i) => {
    const x = 0.5 + (i % 2) * 2.75, y = 1.3 + Math.floor(i / 2) * 1.55;
    card(s, x, y, 2.6, 1.4);
    dot(s, x + 0.15, y + 0.15, String(i + 1), i === 3 ? GREEN : JADE, 0.38);
    txt(s, t[0], { x: x + 0.62, y: y + 0.15, w: 1.9, h: 0.42, fontSize: 11.5, bold: true, color: INK, valign: "middle" });
    txt(s, t[1], { x: x + 0.15, y: y + 0.62, w: 2.35, h: 0.75, fontSize: 9.5, color: TXT });
  });
  s.addChart(pres.charts.LINE, [{ name: "USD funding", labels: ["1Y", "2Y", "3Y", "5Y", "7Y", "10Y", "20Y"], values: [4.78, 5.30, 5.52, 5.69, 5.75, 5.82, 6.04] }], Object.assign(chartBase(), {
    x: 6.15, y: 1.25, w: 3.35, h: 2.2, chartColors: [JADE], lineSize: 2, lineDataSymbol: "circle", lineDataSymbolSize: 5,
    showTitle: true, title: "USD funding curve (case grid, %)", valAxisMinVal: 4.5, valAxisMaxVal: 6.25, valAxisLabelFormatCode: "0.0",
    showValue: true, dataLabelPosition: "t", dataLabelFontSize: 7.5, dataLabelColor: MUTED, dataLabelFormatCode: "0.00" }));
  card(s, 6.15, 3.55, 3.35, 1.55, INK);
  txt(s, [{ text: "What the curve means for structuring", options: { bold: true, color: HL, breakLine: true } },
          { text: `High USD rates (5Y funding 5.69%) and Asian volatility (basket ~${pct(R.basket_vol, 0)}) make option premium rich, and the basket is likely to revisit 100%: together they pay the ${pct(CPN, 2)} coupon.`, options: { color: WHITE } }],
    { x: 6.3, y: 3.65, w: 3.05, h: 1.4, fontSize: 10 });
  foot(s, "Thesis is qualitative; index-level data to be refreshed on Bloomberg. Funding grid: Investment Strategy Challenge 2026 rules.");
  pageNo(s, 2);
  s.addNotes("Two arguments. (1) Structural: AI spending flows straight into Asian semiconductors: Taiwan makes the chips, Korea the memory, Japan the chip-making tools, plus an ESG-screened Taiwan sleeve. (2) Structuring: high USD rates and Asian volatility make option premium rich, and volatility makes the 100% coupon trigger likely to be hit, so we can pay a double-digit coupon.");
}

// ======================= 3–4. Investment thesis and strategy (team template) =======================
{ const sp = scaledPres(pres); addThesisOnePage(sp); pageNo(sp.last, 3); }
{ const sp = scaledPres(pres); addStrategySlides(sp, [1]); pageNo(sp.last, 4); }
{ const sp = scaledPres(pres); addStrategySlides(sp, [2]); pageNo(sp.last, 5); }

// ======================= 3. Basket =======================
{
  const s = contentSlide("STRATEGY");
  title(s, "Underlying: five Asian ETFs across the AI-hardware chain", "Bespoke weighted basket, USD payout (quanto on the HKD, JPY and TWD lines); all Bloomberg-listed");
  const L = R.inputs.underlyings, names = Object.keys(L);
  const COLS = [BLUE, SLATE, BLUE_M, MID, GREEN];   // 3119, 2644, EWT, EWY, 00878: same colours as the strategy slide
  s.addChart(pres.charts.DOUGHNUT, [{ name: "Weight", labels: names.map((k) => SHORT[k] || L[k]), values: R.inputs.weights.map((w) => w * 100) }], {
    x: 0.35, y: 1.2, w: 2.8, h: 2.75, holeSize: 55, chartColors: COLS, showLegend: false,
    showPercent: false, showValue: true, dataLabelColor: WHITE, dataLabelFontSize: 10, dataLabelFontBold: true, dataLabelFormatCode: '0"%"' });
  txt(s, "Basket", { x: 1.25, y: 2.33, w: 1.0, h: 0.5, fontFace: HF, fontSize: 14, bold: true, color: INK, align: "center", valign: "middle" });
  names.forEach((k, i) => {
    s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 4.08 + i * 0.21, w: 0.13, h: 0.13, fill: { color: COLS[i] }, line: { color: COLS[i] } });
    txt(s, SHORT[k] || L[k], { x: 0.7, y: 4.04 + i * 0.21, w: 2.8, h: 0.2, fontSize: 8.5, color: TXT });
  });
  const theme = {
    "3119 HK Equity": "Pan-Asian chip leaders (40 names; TSMC, Samsung, SK hynix the largest): the core AI-hardware exposure",
    "2644 JP Equity": "Japanese semiconductor stocks (FactSet Japan Semiconductor Index, e.g. Tokyo Electron, Advantest): the family's home market",
    "EWT US Equity": "Taiwan large caps (TSMC, MediaTek, Delta): AI foundry and server chain in the family's Greater China region",
    "EWY US Equity": "Korea large caps (Samsung + SK hynix ~44%): high-bandwidth memory for AI",
    "00878 TT Equity": "ESG-screened Taiwan high-dividend leaders (Quanta, UMC, MediaTek): ESG sleeve and lower-volatility anchor" };
  const rows = [[hdr("ETF (Bloomberg)"), hdr("Wt"), hdr("Role in the basket"), hdr("Vol*")]];
  names.forEach((k, i) => rows.push([{ text: `${SHORT[k] || L[k]}`, options: { bold: true } }, pct(R.inputs.weights[i], 0), theme[k] || "", pct(R.inputs.vols[i], 0)]));
  s.addTable(rows, { x: 3.4, y: 1.25, w: 6.1, colW: [1.6, 0.42, 3.55, 0.53], fontFace: BF, fontSize: 8.5, color: TXT, valign: "middle",
    border: { type: "solid", pt: 0.5, color: GRID }, fill: { color: WHITE }, rowH: [0.26, ...names.map(() => 0.52)], margin: [2, 4, 2, 4] });
  txt(s, [{ text: "Why a weighted basket, not worst-of: ", options: { bold: true, color: JADE } },
          { text: `a shock to one ETF is cushioned by the others: basket vol ~${pct(R.basket_vol, 0)} vs ${pct(Math.min(...R.inputs.vols), 0)}–${pct(Math.max(...R.inputs.vols), 0)} alone. Overlap (TSMC, Samsung, SK hynix sit in several ETFs) keeps correlations high (0.45–0.85).` }],
    { x: 3.4, y: 4.2, w: 6.1, h: 0.6, fontSize: 9.5 });
  foot(s, "*Assumed 5Y vols. USD 5M/day ETF rule: EWY, EWT, 2644, 00878 pass; 3119 is borderline (~USD 4–5M/day), verify the 6-month average on Bloomberg. 00878 distributes ~7.6% a year, which lowers its price path.");
  pageNo(s, 6);
  s.addNotes("Five Bloomberg-listed ETFs: 3119 HK (Asia semiconductors), 2644 JP (Japan semiconductors), EWT and EWY (US-listed Taiwan and Korea country funds) and 00878 TT (Taiwan ESG high dividend). EWT and EWY trade in USD, so no quanto is needed; the HKD, JPY and TWD lines are quantoed into USD. Check: 3119 trading value against the USD 5M/day rule, 2644 top holdings, and 00878 distributions (~7.6% a year), which reduce its price-return path and so the chance of the basket getting back to 100%.");
}

// ======================= 4. Term sheet + design choice =======================
{
  const s = contentSlide("STRATEGY");
  title(s, `Term sheet: 5-year autocallable, ${pct(CPN, 2)} memory coupon`, "Why this design: the highest coupon on the basket, with capital usually back early");
  const terms = [["Issuer", "Natixis SA (BPCE Group)"], ["Notional / currency", "USD 100,000,000 · quanto USD"], ["Trade / maturity", "17 Sep 2026 / 17 Sep 2031 (5Y)"],
                 ["Underlying", `Weighted basket of ${R.inputs.weights.length} Asian ETFs (slide 6)`], ["Observation", "Quarterly, 20 dates; autocall from Q4 (Year 1)"],
                 ["Coupon", `${pct(CPN, 2)} p.a. (${pct(QC, 2)} per quarter), paid if basket ≥ 100%`], ["Memory", "Missed coupons paid on the next date basket ≥ 100%"],
                 ["Autocall", "Basket ≥ 100% from Q4: 100% + coupons due, note ends"], ["At maturity", "Not called: repaid at the basket level (no floor)"],
                 ["Issue price / fair value", `100% / ${pct(REC.pv)}`]];
  const rows = terms.map((t) => [{ text: t[0], options: { bold: true, color: INK, fill: { color: MINT } } }, t[1]]);
  s.addTable(rows, { x: 0.5, y: 1.3, w: 4.6, colW: [1.45, 3.15], fontFace: BF, fontSize: 9.5, color: TXT, border: { type: "solid", pt: 0.5, color: WHITE }, fill: { color: "F5F9F8" }, rowH: 0.34, margin: [2, 5, 2, 5], valign: "middle" });
  const D = R.designs, OURS = "Classic memory autocall, no barrier (ours)";
  const show = [["Classic: fixed coupon, 70% barrier", "Classic fixed coupon, 70% barrier", "Up to 100%"],
                ["Snowball, 65% barrier", "Snowball, 65% barrier", "Up to 100%"],
                ["Memory coupon, 70% barrier + 70% put", "Memory coupon, 70% barrier + 70% put", "30%"],
                ["Capital protected (100%), memory coupon", "Memory coupon, 100% protected", "None"],
                [OURS, "Classic memory autocall, no barrier (ours)", "Up to 100%"]];
  const drow = [[hdr("Autocall design (same basket, issued at 98%)"), hdr("Fair cpn"), hdr("Loss risk"), hdr("Max loss")]];
  show.forEach(([k, lab, ml]) => {
    const o = k === OURS ? { bold: true, color: JADE, fill: { color: MINT } } : {};
    drow.push([{ text: lab, options: o }, { text: pct(D[k].fair_coupon), options: o }, { text: pct(D[k].p_loss), options: o }, { text: ml, options: o }]);
  });
  s.addTable(drow, { x: 5.35, y: 1.3, w: 4.2, colW: [2.2, 0.62, 0.66, 0.72], fontFace: BF, fontSize: 8.5, color: TXT, valign: "middle", align: "left",
    border: { type: "solid", pt: 0.5, color: GRID }, fill: { color: WHITE }, rowH: [0.3, 0.33, 0.33, 0.33, 0.33, 0.33], margin: [2, 4, 2, 4] });
  card(s, 5.35, 3.45, 4.2, 1.4, INK);
  const bp = D["Memory coupon, 70% barrier + 70% put"], fp = D["Capital protected (100%), memory coupon"];
  txt(s, [{ text: "Design call: ", options: { bold: true, color: HL } },
          { text: `The draft's 8.5% fixed coupon is worth ${pct(R.draft_8_5_fixed_70_pv)}, so Natixis cannot fund it. Full protection pays only ${pct(fp.fair_coupon)}; a 70% floor pays ${pct(bp.fair_coupon)}. Without barrier or floor the classic autocall is worth ${pct(REC.fair_coupon)}: the family takes the basket's fall if the note is never called. We offer ${pct(CPN, 2)}.`, options: { color: WHITE } }],
    { x: 5.5, y: 3.53, w: 3.9, h: 1.28, fontSize: 9.5 });
  foot(s, NOTE + " Loss risk = probability the note returns less than 100% at maturity (risk-neutral).");
  pageNo(s, 7);
  s.addNotes("The table is the key design argument. Full protection is safe but pays under 8%. Removing all protection pays more but exposes the family to the whole drawdown in a crash. We choose the classic autocall: no barrier and no floor, so the family takes the basket's fall if the note is never called, in exchange for the highest coupon. Diversification and the memory coupon keep that outcome to about one path in five.");
}

// ======================= 5. How it pays: timeline + payoff at maturity =======================
{
  const s = contentSlide("STRATEGY");
  title(s, "How it pays: one question every quarter, three outcomes", "Is the basket at or above 100% of its starting level? (checked quarterly; one date per year shown)");
  const yrs = [1, 2, 3, 4, 5];
  txt(s, `Q1–Q3: coupon only (${pct(QC, 2)} if basket ≥ 100%). From Q4: coupon plus autocall. Missed coupons are always caught up.`, { x: 1.4, y: 1.15, w: 7.9, h: 0.25, fontSize: 9, italic: true, color: MUTED, align: "center" });
  s.addShape(pres.shapes.LINE, { x: 0.8, y: 1.7, w: 8.4, h: 0, line: { color: SLATE, width: 2 } });
  dot(s, 0.55, 1.49, "0", SLATE, 0.42);
  txt(s, "Trade date\n17 Sep 2026", { x: 0.15, y: 1.95, w: 1.25, h: 0.4, fontSize: 8.5, color: MUTED, align: "center" });
  yrs.forEach((y, i) => {
    const x = 2.15 + i * 1.6;
    dot(s, x, 1.49, "Y" + y, y === 5 ? MID : JADE, 0.42);
    txt(s, `If ≥ 100%: called,\n${pct(1 + CPN * y)} total`, { x: x - 0.5, y: 1.95, w: 1.42, h: 0.42, fontSize: 9, bold: true, color: y === 5 ? MID : JADE, align: "center" });
    txt(s, `P(called by Y${y}) ${pct(RN.p_call_by_year[i], 0)}`, { x: x - 0.5, y: 2.36, w: 1.42, h: 0.22, fontSize: 8, color: MUTED, align: "center" });
  });
  // Payoff at Y5 (not called earlier)
  const xs = []; for (let x = 30; x <= 160; x += 0.5) xs.push(x);
  const note = xs.map((x) => (x >= 100 ? 100 + CPN * 100 * 5 : x));
  s.addChart(pres.charts.SCATTER, [{ name: "X", values: xs }, { name: "Autocallable note", values: note }, { name: "Basket directly", values: xs }],
    Object.assign(chartBase(), { x: 0.35, y: 2.7, w: 4.6, h: 2.45, chartColors: [JADE, SLATE], lineSize: 2.25, lineDataSymbol: "none", showLegend: true, legendPos: "b", legendFontSize: 8.5,
      valAxisMinVal: 20, valAxisMaxVal: 170, catAxisMinVal: 30, catAxisMaxVal: 160, valAxisLabelFormatCode: '0"%"', catAxisLabelFormatCode: '0"%"', catAxisMajorUnit: 20,
      showCatAxisTitle: true, catAxisTitle: "Final basket level (% of initial)", catAxisTitleFontSize: 8.5, catAxisTitleColor: MUTED,
      showTitle: true, title: "Total received at Y5 if never called", titleFontSize: 9.5 }));
  const outs = [
    ["A", "Autocalled", `Basket ≥ 100% on any date from Q4: 100% plus every coupon to date. The note ends.`, pct(RN.p_called, 0), JADE],
    ["B", "Not called, basket 70–100% at Y5", "Repaid at the basket level (e.g. 85% back), plus any early coupons.", pct(RN.p_floor - RN.p_repaid_below_70, 0), SLATE],
    ["C", "Not called, basket < 70% at Y5", "Repaid at the basket level: the family bears the full fall.", pct(RN.p_repaid_below_70, 0), RED],
  ];
  outs.forEach((o, i) => {
    const y = 2.75 + i * 0.8;
    card(s, 5.15, y, 4.4, 0.72);
    dot(s, 5.27, y + 0.15, o[0], o[4], 0.42);
    txt(s, o[1], { x: 5.8, y: y + 0.06, w: 2.85, h: 0.27, fontSize: 10.5, bold: true, color: INK });
    txt(s, o[2], { x: 5.8, y: y + 0.32, w: 2.85, h: 0.38, fontSize: 8.5, color: TXT });
    txt(s, [{ text: o[3], options: { bold: true, color: o[4], fontSize: 16, breakLine: true } }, { text: "risk-neutral", options: { color: MUTED, fontSize: 7.5 } }],
      { x: 8.65, y: y + 0.05, w: 0.85, h: 0.62, align: "center", valign: "middle" });
  });
  foot(s, "Probabilities are risk-neutral (drift = funding rate − dividends); real-world outcomes are on slide 9. The desk's replication (bond, coupon digitals, short put) is in Appendix C; stress paths in Appendix B.");
  pageNo(s, 8);
  s.addNotes(`Explain the note as one question asked every quarter: is the basket at or above where it started? If yes, the family is paid ${pct(QC, 2)} for that quarter plus any coupons missed before, and from Year 1 the note also ends with 100% back. If the note is never called, the payoff chart shows the two zones at Year 5: at or above 100% the family receives ${pct(1 + CPN * 5)}; below 100% it is repaid at the basket level.`);
}

// ======================= 9. Simulation results =======================
{
  const s = contentSlide("STRATEGY");
  title(s, "Simulation back-test: most paths end early with full coupons", "Monte Carlo outcome distribution: risk-neutral and under three real-world equity return assumptions");
  s.addChart(pres.charts.BAR, [{ name: "Cumulative call probability", labels: ["Y1", "Y2", "Y3", "Y4", "Y5"], values: RN.p_call_by_year.map((x) => +(x * 100).toFixed(1)) }],
    Object.assign(chartBase(), { x: 0.35, y: 1.2, w: 3.9, h: 2.6, barDir: "col", chartColors: [JADE], showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: '0"%"',
      dataLabelFontSize: 9, dataLabelColor: TXT, valAxisMinVal: 0, valAxisMaxVal: 100, valAxisLabelFormatCode: '0"%"', showTitle: true, title: "Cumulative autocall probability (risk-neutral)", titleFontSize: 9.5 }));
  const sc = [["Risk-neutral", RN], ["0% equity p.a.", R.real_world["0%"]], ["4% equity p.a.", R.real_world["4%"]], ["8% equity p.a.", R.real_world["8%"]]];
  const rows = [[hdr("Metric"), ...sc.map((x) => hdr(x[0]))]];
  const add = (lab, f) => rows.push([{ text: lab, options: { bold: true } }, ...sc.map((x) => f(x[1]))]);
  add("Called within 5Y", (m) => pct(m.p_called, 0));
  add("Expected life (yrs)", (m) => m.exp_life_y.toFixed(1));
  add("Mean IRR", (m) => pct(m.irr_mean, 1));
  add("Median IRR", (m) => pct(m.irr_p50, 1));
  add("Avg coupons received", (m) => pct(m.exp_total_coupons, 1));
  add("Avg repayment if not called", (m) => pct(m.avg_repayment_when_hit, 0));
  add("Capital loss (not called)", (m) => pct(m.p_floor, 0));
  s.addTable(rows, { x: 4.45, y: 1.25, w: 5.1, colW: [1.42, 0.92, 0.92, 0.92, 0.92], fontFace: BF, fontSize: 9, color: TXT, align: "center", valign: "middle",
    border: { type: "solid", pt: 0.5, color: GRID }, fill: { color: WHITE }, rowH: 0.3, margin: [2, 4, 2, 4] });
  const kp = [[pct(RN.p_call_by_year[0], 0), `called at the first review (${pct(1 + CPN)} total)`], [pct(RN.p_floor, 0), "chance of a loss: never called, repaid at the basket level"], [pct(RN.avg_repayment_when_hit, 0), "average repayment in those paths"]];
  kp.forEach((k, i) => {
    const x = 0.45 + i * 3.05;
    card(s, x, 3.95, 2.85, 1.1, i === 2 ? INK : MINT);
    txt(s, k[0], { x: x + 0.15, y: 4.02, w: 1.15, h: 0.95, fontFace: HF, fontSize: 24, bold: true, color: i === 2 ? HL : JADE, valign: "middle" });
    txt(s, k[1], { x: x + 1.3, y: 4.02, w: 1.45, h: 0.95, fontSize: 10, color: i === 2 ? WHITE : TXT, valign: "middle" });
  });
  foot(s, NOTE + " IRR uses actual quarterly coupon dates.");
  pageNo(s, 9);
  s.addNotes(`The table answers 'what if markets go nowhere?'. Even at 0% equity return the note is called in ~${pct(R.real_world["0%"].p_called, 0)} of paths, because volatility alone takes the basket back to 100% on some date. The honest cost of the higher coupon: in ~${pct(RN.p_floor, 0)} of paths (risk-neutral; ${pct(R.real_world["8%"].p_floor, 0)} at 8% equity returns) the basket never gets back to its start and the family is repaid the basket's level, ${pct(RN.avg_repayment_when_hit, 0)} on average.`);
}

// ======================= 10. Risks & hedging =======================
{
  const s = contentSlide("STRATEGY");
  title(s, "Risks for the family, and how Natixis hedges its side", "Transparent disclosure plus a desk hedging plan for every exposure");
  const risks = [["Capital loss", `Never called: repaid at the basket level (~${pct(RN.p_floor, 0)} of paths, ${pct(RN.avg_repayment_when_hit, 0)} back on average)`, "Diversified basket, memory coupon; only 5% of wealth"],
                 ["Capped upside", `Basket +80% still pays ${pct(CPN, 2)} p.a. and is called at Y1`, "Rest of family wealth keeps direct equity exposure"],
                 ["ETF structure", "00878 pays ~7.6% a year out, lowering its price path; 3119 trading is thin; ETF tracking error", "00878 held at 15%; verify volumes; Natixis can reference total-return versions"],
                 ["Issuer credit", "Coupons and repayment depend on Natixis / BPCE", "BPCE senior rating; optional collateralised wrapper"],
                 ["Liquidity / MTM", "Sold before maturity, the price can be below 100%", "Natixis daily indicative price; hold to call or maturity"]];
  const rows = [[hdr("Risk"), hdr("What could happen"), hdr("Mitigant")]].concat(risks.map((r) => [{ text: r[0], options: { bold: true, color: INK } }, r[1], r[2]]));
  s.addTable(rows, { x: 0.45, y: 1.25, w: 5.4, colW: [1.15, 2.15, 2.1], fontFace: BF, fontSize: 8.5, color: TXT, valign: "middle",
    border: { type: "solid", pt: 0.5, color: GRID }, fill: { color: WHITE }, rowH: [0.27, 0.56, 0.5, 0.5, 0.5, 0.56], margin: [2, 4, 2, 4] });
  const hedges = [["Coupon digitals", "Natixis owes basket digitals struck at 100%: replicated with tight basket call spreads, delta-hedged with ETF units, constituent stocks and index futures as proxies; listed options on EWY/EWT"],
                  ["Vol & correlation", `Coupon value moves with basket vol and correlation (fair ${pct(SV["vol -3pts"])}–${pct(SV["vol +3pts"])} for vol ±3pts): managed with listed index options and correlation trades`],
                  ["Quanto FX", "EWT and EWY already trade in USD; 3119 (HKD, pegged), 2644 (JPY) and 00878 (TWD) need FX forwards and a quanto adjustment"],
                  ["Short put & funding", "Natixis is long the client's put at 100% (live only if never called), hedged with basket put spreads and delta. Principal funded at 5.69%"]];
  hedges.forEach((h, i) => {
    const y = 1.25 + i * 0.97;
    card(s, 6.05, y, 3.5, 0.87, i % 2 ? MINT : "F2F7F6");
    txt(s, h[0], { x: 6.18, y: y + 0.07, w: 3.25, h: 0.25, fontSize: 10.5, bold: true, color: JADE });
    txt(s, h[1], { x: 6.18, y: y + 0.32, w: 3.25, h: 0.52, fontSize: 8.5, color: TXT });
  });
  txt(s, [{ text: "Pricing sensitivity (fair coupon): ", options: { bold: true, color: INK } },
          { text: `base ${pct(SV.base)} · vol ±3pts ${pct(SV["vol -3pts"])}–${pct(SV["vol +3pts"])} · corr ±0.15 ${pct(SV["corr -0.15"])}–${pct(SV["corr +0.15"])} · equity drift −1/−2% ${pct(SV["drift -1%"])}–${pct(SV["drift -2%"])}. ${["base", "vol -3pts", "vol +3pts", "corr -0.15", "corr +0.15", "drift -1%", "drift -2%"].every((k) => SV[k] >= CPN - 1e-9) ? `The ${pct(CPN, 2)} offer stays fundable in every case.` : `The ${pct(CPN, 2)} offer needs re-checking if vols or correlation fall.`}` }],
    { x: 0.45, y: 4.45, w: 5.4, h: 0.7, fontSize: 9 });
  pageNo(s, 10);
  s.addNotes(`Investor risks on the left, desk hedges on the right. The capital-loss line is explicit: if the note is never called, the family bears the basket's fall. The other honest risks are capped upside and Natixis credit. The ${pct(CPN, 2)} coupon sits below the ${pct(SV.base)} fair level in every sensitivity we ran, so the offer is robust to market moves before the trade date.`);
}

// ======================= Appendix A: assumptions & method =======================
{
  const s = contentSlide("APPENDIX");
  title(s, "Appendix A: pricing assumptions and methodology", "Inputs to refresh on Bloomberg at trade date (BVOL / OVDV for vols, CORR for correlations)");
  const L = R.inputs.underlyings, names = Object.keys(L);
  const short = names.map((k) => k.replace(" Equity", "").replace(" Index", ""));
  const rows = [[hdr("ETF"), hdr("Weight"), hdr("Vol"), hdr("Div"), ...short.map(hdr)]];
  names.forEach((k, i) => rows.push([{ text: short[i], options: { bold: true } }, pct(R.inputs.weights[i], 0), pct(R.inputs.vols[i], 0), pct(R.inputs.divs[i], 1), ...R.inputs.corr[i].map((c) => c.toFixed(2))]));
  s.addTable(rows, { x: 0.45, y: 1.3, w: 5.2, colW: [0.9, 0.62, 0.52, 0.52, ...short.map(() => 2.64 / short.length)], fontFace: BF, fontSize: 9, color: TXT, align: "center", valign: "middle",
    border: { type: "solid", pt: 0.5, color: GRID }, fill: { color: WHITE }, rowH: 0.3, margin: [2, 3, 2, 3] });
  txt(s, [
    { text: "Model. ", options: { bold: true, color: JADE } }, { text: "Correlated GBM for each ETF, 200,000 paths, quarterly steps. Risk-neutral drift = USD funding (linear interpolation of case grid) − dividend yield. Quanto adjustment ignored (assumed hedged by the desk; to be added with FX-equity correlations).", options: { breakLine: true } },
    { text: "Discounting. ", options: { bold: true, color: JADE } }, { text: "USD funding grid from the case rules; 5Y discount factor 0.758.", options: { breakLine: true } },
    { text: "Coupon solve. ", options: { bold: true, color: JADE } }, { text: "Bisection on coupon so that PV = 98% (2% hedging cost and margin).", options: { breakLine: true } },
    { text: "Historical back-test (to run). ", options: { bold: true, color: JADE } }, { text: "Monthly Bloomberg history since 2021 for all five ETFs (00878 and 3119 launched in 2020–21). Launch a hypothetical note every month, apply the same coupon, memory and autocall rules, and record coupons, life and IRR by launch year." },
  ], { x: 0.45, y: 3.25, w: 5.2, h: 2.0, fontSize: 9, paraSpaceAfter: 3 });
  const rows2 = [[hdr("Variant of our note"), hdr("Fair cpn")],
    ["Coupon barrier 100% (base)", pct(SV.base)], ["Coupon barrier 95%", pct(SV["cpn barrier 95%"])], ["Coupon barrier 90%", pct(SV["cpn barrier 90%"])],
    ["First autocall at Y2", pct(SV["first call Y2"])], ["Equity drift −1%", pct(SV["drift -1%"])], ["Equity drift −2%", pct(SV["drift -2%"])],
    ["Vol +3pts / −3pts", `${pct(SV["vol +3pts"])} / ${pct(SV["vol -3pts"])}`]];
  s.addTable(rows2, { x: 5.95, y: 1.3, w: 3.6, colW: [2.5, 1.1], fontFace: BF, fontSize: 9, color: TXT, valign: "middle",
    border: { type: "solid", pt: 0.5, color: GRID }, fill: { color: WHITE }, rowH: 0.29, margin: [2, 4, 2, 4] });
  txt(s, "All variants priced at 98% with the same basket and inputs. Code: pricing/scenario2_autocall_mc.py", { x: 5.95, y: 3.7, w: 3.6, h: 0.45, fontSize: 8.5, italic: true, color: MUTED });
}

// ======================= Appendix B: stress scenarios =======================
{
  const s = contentSlide("APPENDIX");
  title(s, "Appendix B: scenario analysis, five paths for Asian markets", "Hypothetical quarterly basket paths and what the USD 100mn note returns in each");
  const st = R.stress, names = Object.keys(st);
  const cols = [BLUE, ORANGE, "1F3B57", SLATE, RED];
  const qlab = []; for (let q = 0; q <= 20; q++) qlab.push(q % 4 === 0 ? "Y" + q / 4 : "");
  s.addChart(pres.charts.LINE, names.map((n) => ({ name: n, labels: qlab, values: [100].concat(st[n].path.map((v) => +(v * 100).toFixed(1))) })),
    Object.assign(chartBase(), { x: 0.35, y: 1.2, w: 4.6, h: 3.6, chartColors: cols, lineSize: 2, lineDataSymbol: "none", valAxisMinVal: 40, valAxisMaxVal: 180,
      valAxisLabelFormatCode: '0"%"', showTitle: true, title: "Basket level (% of initial); coupon and autocall level 100%", titleFontSize: 9.5 }));
  const rows = [[hdr("Scenario"), hdr("Outcome"), hdr("Coupons"), hdr("USD mn"), hdr("IRR"), hdr("Basket")]];
  names.forEach((n, i) => {
    const o = st[n];
    const outcome = o.call_q ? `Called Q${o.call_q} (${o.years}y)` : `${(o.total * 100).toFixed(0)}% back at Y5`;
    const basket = o.call_q ? "–" : pct(o.path[19] - 1, 0);
    rows.push([{ text: n, options: { bold: true, color: cols[i] === SLATE ? MUTED : cols[i] } }, outcome, pct(o.coupons), (o.total * 100).toFixed(1), pct(o.irr), basket]);
  });
  s.addTable(rows, { x: 5.1, y: 1.3, w: 4.45, colW: [1.42, 0.98, 0.58, 0.52, 0.47, 0.48], fontFace: BF, fontSize: 8.5, color: TXT, valign: "middle",
    border: { type: "solid", pt: 0.5, color: GRID }, fill: { color: WHITE }, rowH: 0.42, margin: [2, 3, 2, 3] });
  card(s, 5.1, 3.95, 4.45, 1.15);
  txt(s, [{ text: "Reading: ", options: { bold: true, color: JADE } },
          { text: `the note earns ~${pct(Math.min(...names.filter((n) => st[n].call_q).map((n) => st[n].irr)))}–${pct(Math.max(...names.filter((n) => st[n].call_q).map((n) => st[n].irr)))} a year whenever the basket gets back to 100%, even after a 30% drawdown: memory pays all 15 missed coupons at Q15. If the basket never recovers (lost decade, lasting shock) the note repays the basket's level, 88% or 55%.` }],
    { x: 5.25, y: 4.03, w: 4.2, h: 1.0, fontSize: 9.5 });
  foot(s, "Paths are illustrative and not forecasts. 'Basket' = direct basket return at Y5 when the note is not called. Historical back-test to run on Bloomberg history (appendix).");
  s.addNotes("Walk the five scenarios. The 2022-style path is the key one: a 30% drawdown in the first year that would scare a direct investor, yet the note pays all 15 quarterly coupons at once when the basket recovers at Q15. The two bad paths are the honest cost: if the basket never gets back to 100%, the family is repaid the basket's level (88% and 55%).");
}

// ======================= Appendix C: building blocks =======================
{
  const s = contentSlide("APPENDIX");
  title(s, "Appendix C: how Natixis replicates the note", "Replication used by the Natixis desk to price and hedge (values in % of notional, at trade date)");
  const xs = []; for (let x = 40; x <= 160; x += 1) xs.push(x);
  const blocks = [
    ["Principal", `100% repaid at autocall or maturity. Worth ${pct(REC.pv_principal)}`, xs.map(() => 100), INK, [0, 120], "Basket on any date"],
    ["Coupon digitals", `${pct(QC, 2)} plus missed coupons on each date ≥ 100%. Worth ${pct(REC.pv_coupons)} (net of autocall)`, xs.map((x) => (x >= 100 ? QC * 100 : 0)), JADE, [-0.5, 3.2], "Basket on any date"],
    ["Autocall (Natixis)", "From Q4, basket ≥ 100%: remaining coupons cancelled, note ends. Keeps the coupon affordable", xs.map((x) => (x >= 100 ? 0 : 1)), SLATE, [-0.3, 1.4], "Basket on any date"],
    ["Short put (client)", `If never called, the client bears the basket's fall below 100% at Y5. Worth −${pct(-REC.pv_short_barrier_put)}`, xs.map((x) => (x < 100 ? x - 100 : 0)), RED, [-66, 6], "Basket at Y5"],
  ];
  blocks.forEach((b, i) => {
    const x = 0.45 + i * 2.32;
    card(s, x, 1.3, 2.14, 3.05);
    txt(s, b[0], { x: x + 0.12, y: 1.38, w: 1.95, h: 0.3, fontSize: 11.5, bold: true, color: b[3] === RED ? RED : INK });
    txt(s, b[1], { x: x + 0.12, y: 1.68, w: 1.95, h: 0.8, fontSize: 8.5, color: MUTED });
    s.addChart(pres.charts.SCATTER, [{ name: "X", values: xs }, { name: b[0], values: b[2] }], Object.assign(chartBase(), {
      x: x + 0.03, y: 2.5, w: 2.08, h: 1.78, chartColors: [b[3]], lineSize: 2, lineDataSymbol: "none", valAxisMinVal: b[4][0], valAxisMaxVal: b[4][1], valAxisHidden: true,
      catAxisMinVal: 40, catAxisMaxVal: 160, catAxisMajorUnit: 40, catAxisLabelFontSize: 7, catAxisLabelFormatCode: '0"%"', catAxisLabelPos: "low",
      showCatAxisTitle: true, catAxisTitle: b[5], catAxisTitleFontSize: 7, catAxisTitleColor: MUTED }));
    if (i < 3) txt(s, i === 0 ? "+" : "−", { x: x + 2.12, y: 2.95, w: 0.2, h: 0.4, fontSize: 16, bold: true, color: INK, align: "center" });
  });
  card(s, 0.45, 4.45, 9.1, 0.7, INK);
  txt(s, [{ text: `Fair value ${pct(REC.pv)} = principal ${pct(REC.pv_principal)} + coupons ${pct(REC.pv_coupons)} − short put ${pct(-REC.pv_buffer_net)}.  `, options: { bold: true, color: HL } },
          { text: `Issued at 100%, leaving ${pct(REC.natixis_margin)} for hedging and margin. The short put funds the double-digit coupon.`, options: { color: WHITE } }],
    { x: 0.6, y: 4.52, w: 8.8, h: 0.6, fontSize: 10, valign: "middle" });
  s.addNotes("Mini-charts show each leg's payoff against the basket level (the autocall leg is illustrative: it shows the remaining coupon stream switching off). The short put is the key: the client sells Natixis a put on the basket at 100%, live only if the note is never called, and its premium funds the double-digit coupon.");
}

// ======================= Appendix D: alternatives =======================
{
  const s = contentSlide("APPENDIX");
  title(s, "Appendix D: alternatives for the investment committee", "Same basket: full protection, a higher-risk snowball, and a pure participation note");
  const p = R.ppn, sb = R.snowball_alt;
  const xs = []; for (let x = 40; x <= 180; x += 1) xs.push(x);
  s.addChart(pres.charts.SCATTER, [{ name: "X", values: xs },
    { name: `Our note (${pct(CPN, 2)})`, values: xs.map((x) => (x >= 100 ? 100 + CPN * 500 : x)) },
    { name: `Snowball ${pct(sb.coupon, 0)}, 65% barrier`, values: xs.map((x) => (x >= 100 ? 100 + sb.coupon * 500 : x >= sb.barrier * 100 ? 100 : x)) },
    { name: "PPN", values: xs.map((x) => 100 + p.participation * Math.max(x - 100, 0)) }, { name: "Basket", values: xs }],
    Object.assign(chartBase(), { x: 0.4, y: 1.25, w: 5.0, h: 3.6, chartColors: [JADE, RED, ORANGE, SLATE], lineSize: 2, lineDataSymbol: "none", showLegend: true, legendPos: "b", legendFontSize: 8.5,
      valAxisMinVal: 30, valAxisMaxVal: 190, catAxisMinVal: 40, catAxisMaxVal: 180, catAxisMajorUnit: 20, valAxisLabelFormatCode: '0"%"', catAxisLabelFormatCode: '0"%"',
      showTitle: true, title: "Total received at Y5 (not called earlier) vs final basket level", titleFontSize: 9.5 }));
  const rows = [[hdr("Option"), hdr("Return"), hdr("Loss risk")],
                [{ text: "Classic autocallable (ours)", options: { bold: true, color: JADE } }, `${pct(CPN, 2)} p.a. memory coupon`, pct(RN.p_floor, 0)],
                ["100% protected autocallable", `~${pct(R.protected_100_fair_coupon, 1)} fair coupon`, "0%"],
                ["Snowball, 65% barrier", `${pct(sb.coupon, 0)} p.a., paid at call`, pct(sb.p_loss)],
                ["Principal-protected note", `${pct(p.participation, 0)} of basket gain at Y5`, "0%"]];
  s.addTable(rows, { x: 5.7, y: 1.3, w: 3.85, colW: [1.6, 1.45, 0.8], fontFace: BF, fontSize: 9, color: TXT, valign: "middle",
    border: { type: "solid", pt: 0.5, color: GRID }, fill: { color: WHITE }, rowH: 0.36, margin: [2, 4, 2, 4] });
  card(s, 5.7, 3.2, 3.85, 1.25);
  txt(s, [{ text: "Trade-off: ", options: { bold: true, color: JADE } },
          { text: `The snowball pays ${pct(sb.coupon, 0)} but loses capital in ~${pct(sb.p_loss, 0)} of paths. Full protection pays only ~${pct(R.protected_100_fair_coupon, 0)}. The PPN pays nothing unless the basket ends above 100% after 5 years. Our note pays ${pct(CPN, 2)}, with money usually back within ~2 years, but takes the basket's fall if never called.` }],
    { x: 5.85, y: 3.27, w: 3.6, h: 1.12, fontSize: 9 });
  foot(s, NOTE);
}

function yrs5() { return [1, 2, 3, 4, 5]; }

pres.writeFile({ fileName: path.join(__dirname, "Asian-Digital-Autocallable-Note.pptx") }).then((f) => console.log("wrote", f));
