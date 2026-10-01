// Scenario 2 deck: Asian Digital Transformation Snowball Note (NKE Private Wealth / Chak family)
// Numbers come from pricing/scenario2_results.json (run pricing/scenario2_autocall_mc.py first).
// Build: NODE_PATH=<dir with pptxgenjs> node deck/build_deck_scenario2.js
const path = require("path");
const pptxgen = require("pptxgenjs");
const R = require(path.join(__dirname, "..", "pricing", "scenario2_results.json"));

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9"; // 10 x 5.625
pres.title = "Asian Digital Transformation Snowball Note";

// Palette: "Jade & Ink" (Asian digital, legacy wealth)
const INK = "0B3C49", JADE = "0F8B8D", MINT = "E6F2F0", GOLD = "D9961A", RED = "B8433A",
      TXT = "1D2B30", MUTED = "5F7176", WHITE = "FFFFFF", GRID = "DCE7E5", SLATE = "8FA6AA";
const HF = "Cambria", BF = "Calibri";

const pct = (x, d = 1) => (x * 100).toFixed(d) + "%";
const CPN = R.inputs.coupon, BAR = R.inputs.barrier;
const NOTE = "Monte Carlo, 200k paths. Vols, dividends and correlations are assumptions to refresh with Bloomberg data as of the 17 Sep 2026 trade date; discounting uses the USD funding grid.";

function title(s, t, sub) {
  s.addText(t, { x: 0.5, y: 0.28, w: 9, h: 0.55, fontFace: HF, fontSize: 22, bold: true, color: INK, margin: 0, isTextBox: true });
  if (sub) s.addText(sub, { x: 0.5, y: 0.82, w: 9, h: 0.32, fontFace: BF, fontSize: 12.5, italic: true, color: MUTED, margin: 0, isTextBox: true });
}
function pageNo(s, n) {
  s.addText(String(n), { x: 9.1, y: 5.25, w: 0.4, h: 0.25, fontFace: BF, fontSize: 9, color: MUTED, align: "right", margin: 0, isTextBox: true });
}
function foot(s, txt) {
  s.addText(txt, { x: 0.5, y: 5.22, w: 8.4, h: 0.3, fontFace: BF, fontSize: 8, italic: true, color: MUTED, margin: 0, valign: "top", isTextBox: true });
}
function card(s, x, y, w, h, fill) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: fill || MINT }, rectRadius: 0.07, line: { color: fill || MINT } });
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
  s.addShape(pres.shapes.OVAL, { x: 8.3, y: 3.5, w: 2.4, h: 2.4, fill: { color: GOLD, transparency: 15 } });
  txt(s, "Investment Strategy Challenge 2026 · Proposal for NKE Private Wealth (Chak family)", { x: 0.6, y: 0.6, w: 7.5, h: 0.35, fontSize: 12.5, color: "BFDCD8" });
  txt(s, "Asian Digital Transformation Snowball Note", { x: 0.6, y: 1.05, w: 6.2, h: 1.75, fontFace: HF, fontSize: 34, bold: true, color: WHITE, valign: "middle" });
  txt(s, "Growth that accrues while Asia digitalises, with capital protected unless the basket is down more than 35% at maturity", { x: 0.6, y: 3.0, w: 6.0, h: 0.85, fontSize: 15, italic: true, color: "E3F1EF" });
  txt(s, `USD 100mn · 5-year note issued by Natixis · ${pct(CPN)} p.a. snowball coupon · ${pct(BAR, 0)} European barrier · Trade date 17 Sep 2026`, { x: 0.6, y: 4.45, w: 7.6, h: 0.4, fontSize: 11.5, bold: true, color: GOLD });
  s.addNotes("Title. One-line pitch: a growth autocall on the four Asian digital-transformation engines the Chak family already knows from its businesses. The coupon rolls up into principal instead of being paid as income, and capital is protected unless the basket is down more than 35% at maturity.");
}

// ======================= Agenda (not counted) =======================
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Agenda");
  const items = [["Client & market", "Who the Chak family is, what they need, and why Asia's digital build-out now", "1–2"],
                 ["Product design", "Underlying basket, term sheet, and why a snowball coupon", "3–4"],
                 ["Payoffs explained", "Observation timeline, payoff diagrams, and the building blocks the client owns", "5–7"],
                 ["Scenarios & back-testing", "Stress paths and Monte Carlo outcome distributions", "8–9"],
                 ["Risks & hedging", "Investor risks, mitigants, and how the Natixis desk hedges", "10"]];
  items.forEach((it, i) => {
    const y = 1.15 + i * 0.8;
    dot(s, 0.6, y + 0.05, String(i + 1), i % 2 ? GOLD : JADE, 0.5);
    txt(s, it[0], { x: 1.35, y, w: 5, h: 0.32, fontSize: 16, bold: true, color: INK });
    txt(s, it[1], { x: 1.35, y: y + 0.33, w: 7, h: 0.3, fontSize: 11.5, color: MUTED });
    txt(s, (it[2].includes("–") ? "Slides " : "Slide ") + it[2], { x: 8.0, y: y + 0.08, w: 1.5, h: 0.3, fontSize: 11, color: MUTED, align: "right" });
  });
}

// ======================= Executive summary (not counted) =======================
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Executive summary", "One note that turns the family's operating expertise into accruing, protected growth");
  const stats = [[pct(CPN), "Snowball coupon p.a.", "Accrues every quarter and is paid with principal at autocall: 109% after Y1, up to 145% at Y5"],
                 ["−35%", "Protection at maturity", "European barrier: only the final level counts, so interim drawdowns cannot hurt the capital"],
                 [pct(R.rn.p_call_by_year[0], 0), "Called at first review", `Risk-neutral. ${pct(R.rn.p_called, 0)} called within 5 years; expected life ${R.rn.exp_life_y} years`]];
  stats.forEach((st, i) => {
    const x = 0.5 + i * 3.05;
    card(s, x, 1.35, 2.85, 2.3);
    txt(s, st[0], { x: x + 0.22, y: 1.48, w: 2.45, h: 0.8, fontFace: HF, fontSize: 38, bold: true, color: i === 1 ? GOLD : JADE, valign: "middle" });
    txt(s, st[1], { x: x + 0.22, y: 2.3, w: 2.45, h: 0.32, fontSize: 13, bold: true, color: INK });
    txt(s, st[2], { x: x + 0.22, y: 2.65, w: 2.45, h: 0.95, fontSize: 10.5, color: MUTED });
  });
  txt(s, [
    { text: "We recommend ", options: {} },
    { text: "a USD 100mn, 5-year Natixis snowball autocallable note", options: { bold: true, color: JADE } },
    { text: " on a basket of four real, Bloomberg-listed Asian indices (Hang Seng TECH 30%, Nikkei 225 30%, TAIEX 25%, MSCI AC Asia Pacific Utilities 15%). These mirror the family's businesses in Greater China real estate, Japan technology infrastructure and renewable power. ", options: {} },
    { text: "The coupon accrues and is paid with capital at call rather than as income, which matches a growth mandate. A diversified basket (not worst-of) and a maturity-only barrier make it suitable for generational wealth. Fair value is 97.3%, so issuing at par leaves Natixis 2.7% to cover hedging and margin.", options: { bold: true } },
  ], { x: 0.5, y: 3.85, w: 9, h: 1.3, fontSize: 11.5 });
  s.addNotes("Executive summary (does not count toward the 10-slide limit).");
}

// ======================= 1. Client =======================
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "The family wants growth for the next generation, not income", "Client diagnosis: third-generation dynasty, succession done, now allocating for legacy");
  const cols = [
    ["Who they are", ["Single-family office: NKE Private Wealth", "Net worth > USD 2bn; mandate USD 100mn (~5%)", "Businesses: tech infrastructure, renewable power plants, real estate in Japan and Greater China"]],
    ["What they want", ["Capital appreciation for future generations", "Meaningful exposure to Asia's digital transformation", "To bridge traditional Asian sectors with emerging tech they know"]],
    ["What they can bear", ["Moderate risk: preserve the legacy first", "5-year horizon with no need for income", "Accepts limited liquidity on 5% of wealth", "Volatile backdrop: needs a buffer"]],
  ];
  cols.forEach((c, i) => {
    const x = 0.5 + i * 3.05;
    card(s, x, 1.3, 2.85, 2.25, i === 2 ? INK : MINT);
    txt(s, c[0], { x: x + 0.2, y: 1.42, w: 2.5, h: 0.32, fontSize: 14, bold: true, color: i === 2 ? GOLD : INK });
    txt(s, c[1].map((t, j) => ({ text: t, options: { bullet: true, breakLine: j < c[1].length - 1 } })),
      { x: x + 0.2, y: 1.8, w: 2.5, h: 1.7, fontSize: 10.5, color: i === 2 ? WHITE : TXT, paraSpaceAfter: 3 });
  });
  const rows = [[hdr("Client need"), hdr("Design answer in our note")],
    ["Capital appreciation", "Snowball coupon: 9% p.a. accrues and is paid with principal, so value builds up instead of leaking out as income"],
    ["Exposure to Asian digital transformation", "Four real indices mapped to the family's own industries (slide 3)"],
    ["Generational preservation", "European 65% barrier, diversified basket (not worst-of), BPCE-backed issuer"],
    ["Volatile markets", "Autocall locks in gains at the first good review date; drawdowns before maturity do not count"]];
  s.addTable(rows, { x: 0.5, y: 3.7, w: 9, colW: [2.6, 6.4], fontFace: BF, fontSize: 9.5, color: TXT, border: { type: "solid", pt: 0.5, color: GRID }, fill: { color: WHITE }, rowH: 0.27, margin: [2, 5, 2, 5] });
  pageNo(s, 1);
  s.addNotes("Client needs translate one-for-one into design features. The key insight: the family asked for capital appreciation, not income. That points us to a coupon that accrues and is paid at call (snowball), rather than a quarterly income note.");
}

// ======================= 2. Market view =======================
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Why now: Asia builds the hardware of the AI economy", "Investment thesis: structural growth themes, with volatility rich enough to fund a high coupon");
  const th = [["AI hardware supply chain", "Taiwan and Japan make the chips, equipment and servers behind global AI capex (TSMC, Tokyo Electron, Advantest)."],
              ["Japan corporate reform", "TSE pressure on capital efficiency and shareholder returns supports a re-rating of Japanese tech and industrials."],
              ["China platform tech reset", "After the 2021–22 regulatory drawdown, Greater China internet and EV leaders trade at a discount to global peers."],
              ["Power for data centres", "AI data centres drive grid and utility investment: steady, lower-volatility exposure that anchors the basket."]];
  th.forEach((t, i) => {
    const x = 0.5 + (i % 2) * 2.75, y = 1.3 + Math.floor(i / 2) * 1.55;
    card(s, x, y, 2.6, 1.4);
    dot(s, x + 0.15, y + 0.15, String(i + 1), i === 3 ? GOLD : JADE, 0.38);
    txt(s, t[0], { x: x + 0.62, y: y + 0.15, w: 1.9, h: 0.42, fontSize: 11.5, bold: true, color: INK, valign: "middle" });
    txt(s, t[1], { x: x + 0.15, y: y + 0.62, w: 2.35, h: 0.75, fontSize: 9.5, color: TXT });
  });
  s.addChart(pres.charts.LINE, [{ name: "USD funding", labels: ["1Y", "2Y", "3Y", "5Y", "7Y", "10Y", "20Y"], values: [4.78, 5.30, 5.52, 5.69, 5.75, 5.82, 6.04] }], Object.assign(chartBase(), {
    x: 6.15, y: 1.25, w: 3.35, h: 2.2, chartColors: [JADE], lineSize: 2, lineDataSymbol: "circle", lineDataSymbolSize: 5,
    showTitle: true, title: "USD funding curve (case grid, %)", valAxisMinVal: 4.5, valAxisMaxVal: 6.25, valAxisLabelFormatCode: "0.0",
    showValue: true, dataLabelPosition: "t", dataLabelFontSize: 7.5, dataLabelColor: MUTED, dataLabelFormatCode: "0.00" }));
  card(s, 6.15, 3.55, 3.35, 1.55, INK);
  txt(s, [{ text: "What the curve means for structuring", options: { bold: true, color: GOLD, breakLine: true } },
          { text: `High USD rates make the 5Y zero-coupon bond cheap (${pct(R.inputs.zcb_5y)}). Combined with Asian equity volatility (basket ~${pct(R.basket_vol, 0)}), this funds a 9% p.a. growth coupon without a worst-of structure.`, options: { color: WHITE } }],
    { x: 6.3, y: 3.65, w: 3.05, h: 1.4, fontSize: 10 });
  foot(s, "Thesis is qualitative; index-level data to be refreshed on Bloomberg. Funding grid: Investment Strategy Challenge 2026 rules.");
  pageNo(s, 2);
  s.addNotes("Two arguments. (1) Structural: Asia supplies AI hardware, Japan's reforms re-rate equities, China tech trades at a discount, and power demand grows. (2) Structuring: high USD rates plus Asian vol make an attractive coupon possible on a diversified basket, so we don't need a riskier worst-of.");
}

// ======================= 3. Basket =======================
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Underlying: four indices that mirror the family's businesses", "Bespoke weighted basket, USD quanto (FX risk sits with Natixis); all constituents searchable on Bloomberg");
  const L = R.inputs.underlyings, names = Object.keys(L);
  s.addChart(pres.charts.DOUGHNUT, [{ name: "Weight", labels: names.map((k) => L[k]), values: R.inputs.weights.map((w) => w * 100) }], {
    x: 0.35, y: 1.25, w: 3.0, h: 3.0, holeSize: 55, chartColors: [INK, JADE, GOLD, SLATE], showLegend: false,
    showPercent: false, showValue: true, dataLabelColor: WHITE, dataLabelFontSize: 10, dataLabelFontBold: true, dataLabelFormatCode: '0"%"' });
  txt(s, "Basket", { x: 1.35, y: 2.5, w: 1.0, h: 0.5, fontFace: HF, fontSize: 14, bold: true, color: INK, align: "center", valign: "middle" });
  const legend = [INK, JADE, GOLD, SLATE];
  names.forEach((k, i) => {
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 4.35 + i * 0.2, w: 0.13, h: 0.13, fill: { color: legend[i] }, line: { color: legend[i] } });
    txt(s, L[k], { x: 0.8, y: 4.31 + i * 0.2, w: 2.6, h: 0.2, fontSize: 9, color: TXT });
  });
  const theme = ["Greater China platform, PropTech and EV leaders: digitising the real-estate and consumer economy the family operates in",
                 "Japan tech and semiconductor equipment: home market of the family's technology infrastructure business",
                 "AI supply chain and machine learning hardware (foundry, servers, networking) feeding regional logistics and retail",
                 "Grid and power operators: the smart-grid layer above the family's renewable plants; lowers basket volatility"];
  const rows = [[hdr("Index (Bloomberg)"), hdr("Wt"), hdr("Why it belongs (link to family)"), hdr("Vol*")]];
  names.forEach((k, i) => rows.push([{ text: `${L[k]}\n${k}`, options: { bold: true } }, pct(R.inputs.weights[i], 0), theme[i], pct(R.inputs.vols[i], 0)]));
  s.addTable(rows, { x: 3.55, y: 1.3, w: 5.95, colW: [1.55, 0.45, 3.4, 0.55], fontFace: BF, fontSize: 9, color: TXT, valign: "middle",
    border: { type: "solid", pt: 0.5, color: GRID }, fill: { color: WHITE }, rowH: [0.28, 0.66, 0.66, 0.66, 0.66], margin: [2, 5, 2, 5] });
  txt(s, [{ text: "Why a weighted basket, not worst-of: ", options: { bold: true, color: JADE } },
          { text: "one index collapsing (e.g. a China regulatory shock) is cushioned by the other three. Basket vol is ~19% vs 32% for HSTECH alone, and correlation risk stays with the desk." }],
    { x: 3.55, y: 4.35, w: 5.95, h: 0.6, fontSize: 10 });
  foot(s, "*Assumed 5Y implied vols for pricing. The draft's thematic indices (e.g. 'Greater China PropTech & NLP') are not Bloomberg-listed, so we map each theme to a real index.");
  pageNo(s, 3);
  s.addNotes("Each index is a real Bloomberg ticker (verify MXAP0UT Index for MSCI AC Asia Pacific Utilities). Weights: 60% to the two tech engines the family knows best, 25% to the AI supply chain, and 15% to utilities as a low-vol anchor linked to their renewable assets. Quanto USD: the client takes no JPY/HKD/TWD risk.");
}

// ======================= 4. Term sheet + design choice =======================
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Term sheet: 5-year snowball autocall, 65% European barrier", "Why snowball: same risk as an income autocall, but a much higher coupon that accrues until paid");
  const terms = [["Issuer", "Natixis SA (BPCE Group)"], ["Notional / currency", "USD 100,000,000 · quanto USD"], ["Trade / maturity", "17 Sep 2026 / 17 Sep 2031 (5Y)"],
                 ["Underlying", "Weighted basket of 4 indices (slide 3)"], ["Observation", "Quarterly, autocall from Q4 (Year 1)"],
                 ["Autocall trigger", "Basket ≥ 100% of initial level"], ["Snowball coupon", `${pct(CPN)} p.a. × years elapsed, paid at call`],
                 ["Barrier", `${pct(BAR, 0)} European (maturity only)`], ["Below barrier", "Principal × final basket level"], ["Issue price / fair value", `100% / ${pct(R.recommended.pv)}`]];
  const rows = terms.map((t) => [{ text: t[0], options: { bold: true, color: INK, fill: { color: MINT } } }, t[1]]);
  s.addTable(rows, { x: 0.5, y: 1.3, w: 4.6, colW: [1.6, 3.0], fontFace: BF, fontSize: 9.5, color: TXT, border: { type: "solid", pt: 0.5, color: WHITE }, fill: { color: "F5F9F8" }, rowH: 0.34, margin: [2, 5, 2, 5], valign: "middle" });
  const d = R.design_fair_coupon;
  const labels = ["Fixed income coupon", "Phoenix memory (70% cpn barrier)", "Snowball (recommended)"];
  const vals = [d.fixed_unconditional_65, d.phoenix_memory_cb70_65, d.snowball_65].map((x) => +(x * 100).toFixed(1));
  s.addChart(pres.charts.BAR, [{ name: "Fair coupon", labels, values: vals }], Object.assign(chartBase(), {
    x: 5.35, y: 1.25, w: 4.15, h: 2.35, barDir: "bar", chartColors: [SLATE, SLATE, JADE], varyColors: true, showValue: true, dataLabelPosition: "outEnd",
    dataLabelFormatCode: '0.0"%"', dataLabelFontSize: 10, dataLabelColor: TXT, valAxisMinVal: 0, valAxisMaxVal: 12, valAxisHidden: true, valGridLine: { style: "none" },
    showTitle: true, title: "Fair coupon p.a., same basket / autocall / 65% barrier, issued at 98%", titleFontSize: 9.5, catAxisLabelFontSize: 9 }));
  card(s, 5.35, 3.72, 4.15, 1.38, INK);
  txt(s, [{ text: "Design call: ", options: { bold: true, color: GOLD } },
          { text: `A quarterly-paid coupon is only worth ~${pct(d.fixed_unconditional_65)} at the 5.69% funding rate, so the original 8.5% fixed-coupon draft would cost Natixis ${pct(R.draft_8_5_fixed_70_pv - 0.98)} above a 98% issue price. Paying the coupon only at call lifts it to ${pct(d.snowball_65)} fair. We offer ${pct(CPN)} and keep the rest as hedging margin.`, options: { color: WHITE } }],
    { x: 5.5, y: 3.8, w: 3.85, h: 1.25, fontSize: 9.5 });
  foot(s, NOTE);
  pageNo(s, 4);
  s.addNotes("The bar chart is the key design argument. With the same basket, autocall and barrier, the coupon mechanism alone moves the fair coupon from ~5.6% to ~9.7%. In the snowball, the client gives up coupons only in the scenarios where the basket never returns to 100%, which is the trade a growth investor should prefer to an income stream.");
}

// ======================= 5. How it pays: timeline =======================
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "How it pays: one question each quarter, one at maturity", "Observation timeline (quarterly from Year 1; one example review date per year shown)");
  const yrs = [1, 2, 3, 4, 5];
  s.addShape(pres.shapes.LINE, { x: 0.8, y: 1.85, w: 8.4, h: 0, line: { color: SLATE, width: 2 } });
  dot(s, 0.55, 1.64, "0", SLATE, 0.42);
  txt(s, "Trade date\n17 Sep 2026\nInitial = 100%", { x: 0.15, y: 2.12, w: 1.25, h: 0.6, fontSize: 8.5, color: MUTED, align: "center" });
  yrs.forEach((y, i) => {
    const x = 2.15 + i * 1.6;
    dot(s, x, 1.64, "Y" + y, y === 5 ? GOLD : JADE, 0.42);
    txt(s, `If basket ≥ 100%:\n${pct(1 + CPN * y, 0)} back`, { x: x - 0.5, y: 2.12, w: 1.42, h: 0.45, fontSize: 9.5, bold: true, color: y === 5 ? GOLD : JADE, align: "center" });
    txt(s, `P(called by Y${y}) ${pct(R.rn.p_call_by_year[i], 0)}`, { x: x - 0.5, y: 2.55, w: 1.42, h: 0.25, fontSize: 8.5, color: MUTED, align: "center" });
  });
  txt(s, "Quarterly checks between dates pay pro-rata (e.g. Q6 = 113.5%)", { x: 2.0, y: 1.25, w: 7.2, h: 0.25, fontSize: 9, italic: true, color: MUTED, align: "center" });
  const outs = [
    ["A", "Autocalled", `Basket ≥ 100% on any review from Q4. Note ends with 100% + ${pct(CPN)} × years.`, `${pct(R.rn.p_called, 0)}`, JADE],
    ["B", "Not called, final ≥ 65%", "Basket ended between 65% and 100% at Year 5. Full principal is returned, with no coupon.", `${pct(R.rn.p_par_no_coupon, 0)}`, SLATE],
    ["C", "Not called, final < 65%", "Barrier breached at maturity. Principal × final level, e.g. basket at 55% returns 55%.", `${pct(R.rn.p_loss, 1)}`, RED],
  ];
  outs.forEach((o, i) => {
    const x = 0.5 + i * 3.05;
    card(s, x, 3.05, 2.85, 2.0);
    dot(s, x + 0.18, 3.18, o[0], o[4], 0.42);
    txt(s, o[1], { x: x + 0.7, y: 3.2, w: 2.05, h: 0.38, fontSize: 12, bold: true, color: INK, valign: "middle" });
    txt(s, o[2], { x: x + 0.18, y: 3.7, w: 2.5, h: 0.8, fontSize: 10, color: TXT });
    txt(s, [{ text: o[3], options: { bold: true, color: o[4], fontSize: 16 } }, { text: "  risk-neutral probability", options: { color: MUTED, fontSize: 8.5 } }],
      { x: x + 0.18, y: 4.55, w: 2.5, h: 0.4, valign: "middle" });
  });
  foot(s, "Probabilities are risk-neutral (drift = funding rate − dividends). Real-world outcomes under different equity returns are on slide 9.");
  pageNo(s, 5);
  s.addNotes("Explain the note as a single question asked every quarter from Year 1: is the basket at or above where it started? If yes, the family gets its money back plus 9% for every year elapsed. If it is never yes, only one more number matters: the final level versus 65%.");
}

// ======================= 6. Payoff diagrams =======================
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Payoff diagrams: what the family receives, and when", "Left: redemption if called at each review date. Right: maturity payoff if never called, vs. owning the basket directly");
  const qs = []; for (let q = 4; q <= 20; q++) qs.push(q);
  s.addChart(pres.charts.BAR, [{ name: "Redemption if called", labels: qs.map((q) => (q % 4 === 0 ? "Y" + q / 4 : "")), values: qs.map((q) => +(100 + CPN * 100 * q / 4).toFixed(2)) }],
    Object.assign(chartBase(), { x: 0.4, y: 1.25, w: 4.4, h: 2.85, barDir: "col", chartColors: [JADE], barGapWidthPct: 35, valAxisMinVal: 90, valAxisMaxVal: 150,
      valAxisLabelFormatCode: '0"%"', showTitle: true, title: "Redemption at autocall (% of notional), by review quarter Q4–Q20", titleFontSize: 9.5 }));
  const ann = [[1, "109%"], [2, "118%"], [3, "127%"], [4, "136%"], [5, "145%"]];
  txt(s, ann.map((a, i) => ({ text: `Y${a[0]}: ${a[1]}  (USD ${(100 * (1 + CPN * a[0])).toFixed(0)}mn)`, options: { breakLine: i < ann.length - 1 } })),
    { x: 0.55, y: 4.2, w: 2.3, h: 0.95, fontSize: 9, color: TXT });
  txt(s, "Coupon accrues as simple interest: 2.25% per quarter. The longer the wait, the bigger the payout (145% at Y5 ≈ 7.7% p.a. compounded).", { x: 2.85, y: 4.2, w: 1.95, h: 0.95, fontSize: 9, italic: true, color: MUTED });

  const xs = []; for (let x = 30; x <= 160; x += 0.5) xs.push(x);
  const note = xs.map((x) => (x >= 100 ? 100 + CPN * 100 * 5 : x >= BAR * 100 ? 100 : x));
  s.addChart(pres.charts.SCATTER, [{ name: "X", values: xs }, { name: "Snowball note", values: note }, { name: "Basket directly", values: xs }],
    Object.assign(chartBase(), { x: 5.0, y: 1.25, w: 4.6, h: 3.3, chartColors: [JADE, SLATE], lineSize: 2.25, lineDataSymbol: "none", showLegend: true, legendPos: "b", legendFontSize: 9,
      valAxisMinVal: 20, valAxisMaxVal: 160, catAxisMinVal: 30, catAxisMaxVal: 160, valAxisLabelFormatCode: '0"%"', catAxisLabelFormatCode: '0"%"', catAxisMajorUnit: 20,
      showValAxisTitle: true, valAxisTitle: "Redemption at Y5", valAxisTitleFontSize: 9, valAxisTitleColor: MUTED,
      showCatAxisTitle: true, catAxisTitle: "Final basket level (% of initial)", catAxisTitleFontSize: 9, catAxisTitleColor: MUTED,
      showTitle: true, title: "Maturity payoff (note not called earlier)", titleFontSize: 9.5 }));
  const zones = [["< 65%: 1-for-1 loss, same as the basket", RED], ["65–100%: 100% back (the buffer zone)", SLATE], ["≥ 100%: 145% (Y5 call)", JADE]];
  zones.forEach((z, i) => {
    s.addShape(pres.shapes.OVAL, { x: 5.15, y: 4.68 + i * 0.17, w: 0.1, h: 0.1, fill: { color: z[1] }, line: { color: z[1] } });
    txt(s, z[0], { x: 5.32, y: 4.62 + i * 0.17, w: 4.2, h: 0.18, fontSize: 8.5, color: TXT });
  });
  pageNo(s, 6);
  s.addNotes("Left chart: the payout ladder. Each quarter adds 2.25% of notional. Right chart: if the note survives to Year 5, there are three zones. Above 100% the family gets 145% (better than the basket up to +45%; above that the basket wins, which is the capped upside). Between 65% and 100% they get par: a 35% buffer versus owning the basket. Below 65% they participate 1-for-1, same as owning the basket.");
}

// ======================= 7. Building blocks =======================
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Under the hood: a bond plus three option positions", "Replication used by the Natixis desk to price and hedge (values in % of notional, at trade date)");
  const xs = []; for (let x = 40; x <= 140; x += 1) xs.push(x);
  const blocks = [
    ["Zero-coupon bond", "Natixis 5Y funding at 5.69%", xs.map(() => 100), INK, "+"],
    ["Long autocall digitals", "Pay 9% × years the first time the basket ≥ 100% on a review date", xs.map((x) => (x >= 100 ? 45 : 0)), JADE, "+"],
    ["Short European put", "Strike 65%, killed if the note autocalls: the client takes losses below 65%", xs.map((x) => (x < 65 ? -(65 - x) : 0)), RED, "−"],
    ["Short digital put", "Pays 35% if final < 65%: the jump from 100% to 65% at the barrier", xs.map((x) => (x < 65 ? -35 : 0)), RED, "−"],
  ];
  blocks.forEach((b, i) => {
    const x = 0.45 + i * 2.33;
    card(s, x, 1.3, 2.18, 3.05);
    txt(s, b[0], { x: x + 0.12, y: 1.38, w: 1.95, h: 0.3, fontSize: 11.5, bold: true, color: b[3] === RED ? RED : INK });
    txt(s, b[1], { x: x + 0.12, y: 1.68, w: 1.95, h: 0.6, fontSize: 8.5, color: MUTED });
    s.addChart(pres.charts.SCATTER, [{ name: "X", values: xs }, { name: b[0], values: b[2] }], Object.assign(chartBase(), {
      x: x + 0.02, y: 2.3, w: 2.12, h: 1.95, chartColors: [b[3]], lineSize: 2, lineDataSymbol: "none", valAxisMinVal: -50, valAxisMaxVal: 110, valAxisMajorUnit: 50, valAxisHidden: true,
      catAxisMinVal: 40, catAxisMaxVal: 140, catAxisMajorUnit: 25, catAxisLabelFontSize: 7, catAxisLabelFormatCode: '0"%"', catAxisLabelPos: "low" }));
    if (i < 3) txt(s, "+", { x: x + 2.12, y: 2.95, w: 0.25, h: 0.4, fontSize: 18, bold: true, color: INK, align: "center" });
  });
  const pv = R.recommended.pv;
  card(s, 0.45, 4.45, 9.1, 0.7, INK);
  txt(s, [{ text: "Payoff at Y5 = bond + digitals − put − digital put.  ", options: { bold: true, color: GOLD } },
          { text: `Fair value ${pct(pv)} vs 100% issue price → ${pct(R.recommended.natixis_margin)} for hedging costs and Natixis margin. The premium the client earns by selling the 65% downside (the two red legs) is what funds the 9% snowball coupon.`, options: { color: WHITE } }],
    { x: 0.6, y: 4.52, w: 8.8, h: 0.6, fontSize: 10, valign: "middle" });
  pageNo(s, 7);
  s.addNotes("Mini-charts show each leg's payoff at maturity against the final basket level. In practice the digitals and puts are path-dependent: they all die at the first autocall. The client is effectively selling downside protection below 65% and buying a ladder of autocall digitals.");
}

// ======================= 8. Stress scenarios =======================
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Scenario analysis: five paths for Asian markets", "Hypothetical quarterly basket paths and what the USD 100mn note returns in each");
  const st = R.stress, names = Object.keys(st);
  const cols = [JADE, GOLD, INK, SLATE, RED];
  const qlab = []; for (let q = 0; q <= 20; q++) qlab.push(q % 4 === 0 ? "Y" + q / 4 : "");
  s.addChart(pres.charts.LINE, names.map((n) => ({ name: n, labels: qlab, values: [100].concat(st[n].path.map((v) => +(v * 100).toFixed(1))) })),
    Object.assign(chartBase(), { x: 0.35, y: 1.2, w: 4.6, h: 3.6, chartColors: cols, lineSize: 2, lineDataSymbol: "none", valAxisMinVal: 40, valAxisMaxVal: 180,
      valAxisLabelFormatCode: '0"%"', showTitle: true, title: "Basket level (% of initial); autocall line 100%, barrier 65%", titleFontSize: 9.5 }));
  const rows = [[hdr("Scenario"), hdr("Outcome"), hdr("Payout"), hdr("USD mn"), hdr("IRR")]];
  names.forEach((n, i) => {
    const o = st[n];
    const outcome = o.call_q ? `Called Q${o.call_q} (${o.years}y)` : (o.payout >= 1 ? "Par at Y5" : "Barrier hit at Y5");
    rows.push([{ text: n, options: { bold: true, color: cols[i] === SLATE ? MUTED : cols[i] } }, outcome, pct(o.payout, 1), (o.payout * 100).toFixed(1), pct(o.irr, 1)]);
  });
  s.addTable(rows, { x: 5.1, y: 1.3, w: 4.45, colW: [1.55, 1.05, 0.65, 0.6, 0.6], fontFace: BF, fontSize: 8.5, color: TXT, valign: "middle",
    border: { type: "solid", pt: 0.5, color: GRID }, fill: { color: WHITE }, rowH: 0.42, margin: [2, 4, 2, 4] });
  card(s, 5.1, 3.95, 4.45, 1.15);
  txt(s, [{ text: "Reading: ", options: { bold: true, color: JADE } },
          { text: "the note earns ~8–9% p.a. in up, flat and recovering markets, including a 30% interim drawdown, because only the final level is tested against the barrier. It returns par in a lost decade, and loses like the basket only if Asia ends 5 years down by more than 35%." }],
    { x: 5.25, y: 4.03, w: 4.2, h: 1.0, fontSize: 9.5 });
  foot(s, "Paths are illustrative and not forecasts. Historical rolling-window back-test to be run on Bloomberg index history (method in appendix).");
  pageNo(s, 8);
  s.addNotes("Walk the five scenarios. The 2022-style path is the key one: a 30% drawdown in the first year that would scare a direct investor, yet the note still pays 133.75% at Q15 because the barrier is only observed at maturity. The worst path, a geopolitical shock with no recovery, returns 55%: the same as holding the basket.");
}

// ======================= 9. Simulation results =======================
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Simulation back-test: most paths end early, at a profit", "Monte Carlo outcome distribution: risk-neutral and under three real-world equity return assumptions");
  s.addChart(pres.charts.BAR, [{ name: "Cumulative call probability", labels: ["Y1", "Y2", "Y3", "Y4", "Y5"], values: R.rn.p_call_by_year.map((x) => +(x * 100).toFixed(1)) }],
    Object.assign(chartBase(), { x: 0.35, y: 1.2, w: 3.9, h: 2.6, barDir: "col", chartColors: [JADE], showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: '0"%"',
      dataLabelFontSize: 9, dataLabelColor: TXT, valAxisMinVal: 0, valAxisMaxVal: 100, valAxisLabelFormatCode: '0"%"', showTitle: true, title: "Cumulative autocall probability (risk-neutral)", titleFontSize: 9.5 }));
  const sc = [["Risk-neutral", R.rn], ["0% equity p.a.", R.real_world["0%"]], ["4% equity p.a.", R.real_world["4%"]], ["8% equity p.a.", R.real_world["8%"]]];
  const rows = [[hdr("Metric"), ...sc.map((x) => hdr(x[0]))]];
  const add = (lab, f) => rows.push([{ text: lab, options: { bold: true } }, ...sc.map((x) => f(x[1]))]);
  add("Called within 5Y", (m) => pct(m.p_called, 0));
  add("Expected life (yrs)", (m) => m.exp_life_y.toFixed(1));
  add("Mean IRR", (m) => pct(m.irr_mean, 1));
  add("Par, no coupon", (m) => pct(m.p_par_no_coupon, 0));
  add("Capital loss", (m) => pct(m.p_loss, 1));
  add("Avg loss if loss", (m) => pct(m.avg_loss_given_loss, 0));
  add("ES 95% (loss)", (m) => pct(m.es95_loss, 0));
  s.addTable(rows, { x: 4.45, y: 1.25, w: 5.1, colW: [1.42, 0.92, 0.92, 0.92, 0.92], fontFace: BF, fontSize: 9, color: TXT, align: "center", valign: "middle",
    border: { type: "solid", pt: 0.5, color: GRID }, fill: { color: WHITE }, rowH: 0.3, margin: [2, 4, 2, 4] });
  const kp = [[pct(R.rn.p_call_by_year[0], 0), "called at the first review (109%)"], [pct(1 - R.rn.p_loss, 0), "of paths return at least par"], [pct(R.rn.p_loss * R.rn.avg_loss_given_loss, 1), "expected capital loss (prob × severity)"]];
  kp.forEach((k, i) => {
    const x = 0.45 + i * 3.05;
    card(s, x, 3.95, 2.85, 1.1, i === 2 ? INK : MINT);
    txt(s, k[0], { x: x + 0.15, y: 4.02, w: 1.15, h: 0.95, fontFace: HF, fontSize: 24, bold: true, color: i === 2 ? GOLD : JADE, valign: "middle" });
    txt(s, k[1], { x: x + 1.3, y: 4.02, w: 1.45, h: 0.95, fontSize: 10, color: i === 2 ? WHITE : TXT, valign: "middle" });
  });
  foot(s, NOTE + " ES 95% = average loss in the worst 5% of paths.");
  pageNo(s, 9);
  s.addNotes("The table answers 'what if markets go nowhere?'. Even at 0% equity return the note is called in ~69% of paths, because volatility alone takes the basket back above 100% on some review date. The honest tail: in roughly 1 path in 13 (risk-neutral) the basket ends below 65% and the average loss in those paths is ~47%.");
}

// ======================= 10. Risks & hedging =======================
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Risks for the family, and how Natixis hedges its side", "Transparent disclosure plus a desk hedging plan for every Greek");
  const risks = [["Market / barrier", "Below 65% at Y5, loss is 1-for-1 from 100%", "Diversified basket; maturity-only barrier; 35% buffer"],
                 ["Opportunity cost", "Called early means reinvestment risk; flat 65–100% means 0% for 5Y", "Snowball pays more the longer it waits; roll-over at call"],
                 ["Capped upside", "Basket +80% still pays 145% at most", "15% of family wealth stays in direct equity"],
                 ["Issuer credit", "Unsecured Natixis / BPCE exposure", "BPCE senior rating; optional collateralised wrapper"],
                 ["Liquidity", "Bespoke note; secondary price at Natixis bid", "Natixis daily indicative price; 5% of net worth only"]];
  const rows = [[hdr("Risk"), hdr("What could happen"), hdr("Mitigant")]].concat(risks.map((r) => [{ text: r[0], options: { bold: true, color: INK } }, r[1], r[2]]));
  s.addTable(rows, { x: 0.45, y: 1.25, w: 5.4, colW: [1.15, 2.15, 2.1], fontFace: BF, fontSize: 8.5, color: TXT, valign: "middle",
    border: { type: "solid", pt: 0.5, color: GRID }, fill: { color: WHITE }, rowH: [0.27, 0.56, 0.56, 0.5, 0.5, 0.5], margin: [2, 4, 2, 4] });
  const hedges = [["Delta / vega", "Natixis is long the 65% put the client sells (long downside vega). Delta-hedge with HSTECH / NKY / TAIEX futures; sell listed OTM index puts to recycle vega and skew"],
                  ["Correlation", "Long a basket put means long correlation. Offset by buying worst-of puts or a dispersion trade (short basket vol, long single-index vol)"],
                  ["Quanto FX", "USD payout on JPY/HKD/TWD indices: FX forwards and quanto adjustment in price (FX-equity correlation)"],
                  ["Rates & funding", "Fixed snowball accrual hedged with USD swaps; proceeds fund the 5.69% ZCB"]];
  hedges.forEach((h, i) => {
    const y = 1.25 + i * 0.97;
    card(s, 6.05, y, 3.5, 0.87, i % 2 ? MINT : "F2F7F6");
    txt(s, h[0], { x: 6.18, y: y + 0.07, w: 3.25, h: 0.25, fontSize: 10.5, bold: true, color: JADE });
    txt(s, h[1], { x: 6.18, y: y + 0.32, w: 3.25, h: 0.52, fontSize: 8.5, color: TXT });
  });
  const sv = R.coupon_sens;
  txt(s, [{ text: "Pricing sensitivity (fair coupon): ", options: { bold: true, color: INK } },
          { text: `base ${pct(sv.base)} · vol ±3pts ${pct(sv["vol -3pts"])}–${pct(sv["vol +3pts"])} · corr ±0.15 ${pct(sv["corr -0.15"])}–${pct(sv["corr +0.15"])}. ${pct(CPN)} is fundable unless vols fall ~3pts before trade date.` }],
    { x: 0.45, y: 4.45, w: 5.4, h: 0.7, fontSize: 9 });
  pageNo(s, 10);
  s.addNotes("Investor risks on the left, desk hedges on the right. The 9% coupon is below the 9.7% fair level, which leaves a cushion if vol or correlation move before the 17 Sep 2026 trade date.");
}

// ======================= Appendix A: assumptions & method =======================
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Appendix A: pricing assumptions and methodology", "Inputs to refresh on Bloomberg at trade date (BVOL / OVDV for vols, CORR for correlations)");
  const L = R.inputs.underlyings, names = Object.keys(L);
  const short = ["HSTECH", "NKY", "TWSE", "MXAP0UT"];
  const rows = [[hdr("Index"), hdr("Weight"), hdr("Vol"), hdr("Div"), ...short.map(hdr)]];
  names.forEach((k, i) => rows.push([{ text: short[i], options: { bold: true } }, pct(R.inputs.weights[i], 0), pct(R.inputs.vols[i], 0), pct(R.inputs.divs[i], 1), ...R.inputs.corr[i].map((c) => c.toFixed(2))]));
  s.addTable(rows, { x: 0.45, y: 1.3, w: 5.2, colW: [0.9, 0.62, 0.52, 0.52, 0.66, 0.66, 0.66, 0.66], fontFace: BF, fontSize: 9, color: TXT, align: "center", valign: "middle",
    border: { type: "solid", pt: 0.5, color: GRID }, fill: { color: WHITE }, rowH: 0.3, margin: [2, 3, 2, 3] });
  txt(s, [
    { text: "Model. ", options: { bold: true, color: JADE } }, { text: "Correlated GBM for each index, 200,000 paths, quarterly steps. Risk-neutral drift = USD funding (linear interpolation of case grid) − dividend yield. Quanto adjustment ignored (assumed hedged by the desk; to be added with FX-equity correlations).", options: { breakLine: true } },
    { text: "Discounting. ", options: { bold: true, color: JADE } }, { text: "USD funding grid from the case rules; 5Y discount factor 0.758.", options: { breakLine: true } },
    { text: "Coupon solve. ", options: { bold: true, color: JADE } }, { text: "Bisection on coupon so that PV = 98% (2% hedging cost and margin).", options: { breakLine: true } },
    { text: "Historical back-test (to run). ", options: { bold: true, color: JADE } }, { text: "Monthly Bloomberg history since 2015 for all four indices. Launch a hypothetical note every month, apply the same autocall and barrier rules, and record payout, life and IRR. Report hit rates by launch year." },
  ], { x: 0.45, y: 2.95, w: 5.2, h: 2.2, fontSize: 9.5, paraSpaceAfter: 4 });
  const sv = R.coupon_sens, d = R.design_fair_coupon;
  const rows2 = [[hdr("Design variant"), hdr("Fair cpn")],
    ["Snowball, 70% barrier", pct(d.snowball_70)], ["Snowball, 65% (base)", pct(d.snowball_65)], ["Snowball, 60% barrier", pct(d.snowball_60)],
    ["Step-down trigger −5%/yr", pct(sv["stepdown 5%/yr"])], ["First call at Y2", pct(sv["first call Y2"])],
    ["Fixed coupon, 70% barrier", pct(d.fixed_unconditional_70)], ["Phoenix memory, 70% cpn barrier", pct(d.phoenix_memory_cb70_65)]];
  s.addTable(rows2, { x: 5.95, y: 1.3, w: 3.6, colW: [2.6, 1.0], fontFace: BF, fontSize: 9, color: TXT, valign: "middle",
    border: { type: "solid", pt: 0.5, color: GRID }, fill: { color: WHITE }, rowH: 0.29, margin: [2, 4, 2, 4] });
  txt(s, "All variants priced at 98% with the same basket and inputs. Code: pricing/scenario2_autocall_mc.py", { x: 5.95, y: 3.7, w: 3.6, h: 0.45, fontSize: 8.5, italic: true, color: MUTED });
}

// ======================= Appendix B: PPN alternative =======================
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Appendix B: alternative for a risk-averse patriarch", "100% principal-protected note on the same basket");
  const p = R.ppn;
  const xs = []; for (let x = 40; x <= 180; x += 1) xs.push(x);
  s.addChart(pres.charts.SCATTER, [{ name: "X", values: xs }, { name: "PPN", values: xs.map((x) => 100 + p.participation * Math.max(x - 100, 0)) },
    { name: "Snowball (Y5, not called)", values: xs.map((x) => (x >= 100 ? 145 : x >= 65 ? 100 : x)) }, { name: "Basket", values: xs }],
    Object.assign(chartBase(), { x: 0.4, y: 1.25, w: 5.0, h: 3.6, chartColors: [GOLD, JADE, SLATE], lineSize: 2, lineDataSymbol: "none", showLegend: true, legendPos: "b", legendFontSize: 9,
      valAxisMinVal: 30, valAxisMaxVal: 190, catAxisMinVal: 40, catAxisMaxVal: 180, catAxisMajorUnit: 20, valAxisLabelFormatCode: '0"%"', catAxisLabelFormatCode: '0"%"',
      showTitle: true, title: "Payoff at Y5 vs final basket level", titleFontSize: 9.5 }));
  const rows = [[hdr("PPN term"), hdr("Value")], ["Zero-coupon bond (5Y)", pct(p.zcb)], ["Option budget (at 98%)", pct(p.option_budget)],
                ["5Y ATM basket call", pct(p.atm_call_pv)], ["Upside participation", pct(p.participation, 0)], ["Minimum redemption", "100%"]];
  s.addTable(rows, { x: 5.7, y: 1.3, w: 3.85, colW: [2.35, 1.5], fontFace: BF, fontSize: 9.5, color: TXT, valign: "middle",
    border: { type: "solid", pt: 0.5, color: GRID }, fill: { color: WHITE }, rowH: 0.3, margin: [2, 4, 2, 4] });
  card(s, 5.7, 3.25, 3.85, 1.6);
  txt(s, [{ text: "Trade-off: ", options: { bold: true, color: JADE } },
          { text: `High USD rates fund ~${pct(p.participation, 0)} participation with full capital protection, but nothing is earned unless the basket ends above 100% after 5 years, and there is no early exit. The snowball earns 9% p.a. in flat-to-up markets and pays out early. We recommend the snowball, and keep the PPN as the fallback if the investment committee requires hard protection.` }],
    { x: 5.85, y: 3.33, w: 3.6, h: 1.45, fontSize: 9.5 });
  foot(s, NOTE);
}

pres.writeFile({ fileName: path.join(__dirname, "Asian-Digital-Snowball-Note.pptx") }).then((f) => console.log("wrote", f));
