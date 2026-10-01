// Scenario 2 deck: the Asia Digital Bridge Note (NKE Private Wealth).
// Numbers come from pricing/scenario2_results.json (pricing/scenario2_vt_note.py), placeholder market inputs.
// Run: node deck/build_deck_scenario2.js   (from the repo root)
const pptxgen = require("pptxgenjs");
const R = require("../pricing/scenario2_results.json");
const pres = new pptxgen();
pres.layout = "LAYOUT_16x9"; // 10 x 5.625
pres.title = "The Asia Digital Bridge Note";

// Palette: ink + jade (Asian digital), vermilion accent
const INK = "0F2A3D", INK2 = "1C4460", JADE = "1F8A70", MIST = "E8F2EE", VER = "D9482B", GOLD = "E2A73B",
      TXT = "1E2B33", MUTED = "62717A", WHITE = "FFFFFF", LINE = "CFDDD7";
const HF = "Cambria", BF = "Calibri";
const NOTE = "Indicative pricing: Monte Carlo with placeholder market inputs; funding from the 2026 rules grid. To be refreshed with Bloomberg data as of 17 Sep 2026.";

const pct = (x, d = 0) => (100 * x).toFixed(d) + "%";
const PART = R.part, BUDGET = R.budget, ZCB = R.zcb;   // PART = base version (no Lock/averaging)
const lockAvg = R.menu.find((m) => m[0].startsWith("+ Lock + averaging"))[2];
const rw = R.realworld, risk = R.risk;
const worstLoss = risk.v0 - Math.min(...risk.stress.map((s) => s[3]));
const x2 = (v) => v.toFixed(2) + "x";
const VOLC = 27, VOLS = 50, RAWIV = 33;   // keep in sync with pricing/scenario2_vt_note.py

function title(s, t, sub) {
  s.addText(t, { x: 0.5, y: 0.28, w: 9, h: 0.6, fontFace: HF, fontSize: 26, bold: true, color: INK, margin: 0, isTextBox: true });
  if (sub) s.addText(sub, { x: 0.5, y: 0.86, w: 9, h: 0.34, fontFace: BF, fontSize: 13, italic: true, color: MUTED, margin: 0, isTextBox: true });
}
function pageNo(s, n) {
  s.addText(String(n), { x: 9.1, y: 5.22, w: 0.4, h: 0.28, fontFace: BF, fontSize: 9, color: MUTED, align: "right", margin: 0, isTextBox: true });
}
function foot(s, txt) {
  s.addText(txt, { x: 0.5, y: 5.22, w: 8.5, h: 0.28, fontFace: BF, fontSize: 8, italic: true, color: MUTED, margin: 0, isTextBox: true });
}
function badge(s, x, y, label, color, d = 0.46) {
  s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color } });
  s.addText(label, { x, y, w: d, h: d, fontFace: HF, fontSize: 14, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0, isTextBox: true });
}
function card(s, x, y, w, h, fill) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: fill || MIST }, rectRadius: 0.08, line: { color: fill || MIST } });
}
function txt(s, t, o) {
  s.addText(t, Object.assign({ fontFace: BF, fontSize: 12, color: TXT, margin: 0, valign: "top", isTextBox: true }, o));
}
function bullets(s, items, o) {
  s.addText(items.map((t, j) => ({ text: t, options: { bullet: true, breakLine: j < items.length - 1 } })),
    Object.assign({ fontFace: BF, fontSize: 12, color: TXT, paraSpaceAfter: 5, margin: 0, valign: "top", isTextBox: true }, o));
}
const chartBase = () => ({
  catAxisLabelColor: MUTED, valAxisLabelColor: MUTED, catAxisLabelFontFace: BF, valAxisLabelFontFace: BF,
  catAxisLabelFontSize: 10, valAxisLabelFontSize: 10, valGridLine: { color: "E3ECE8", size: 0.75 },
  catGridLine: { style: "none" }, showLegend: false, titleFontFace: BF, titleColor: TXT, titleFontSize: 12,
});
function table(s, rows, o, headFill) {
  const data = rows.map((r, i) => r.map((c) => ({ text: String(c), options: i === 0
    ? { bold: true, color: WHITE, fill: { color: headFill || INK } } : { color: TXT } })));
  s.addTable(data, Object.assign({ fontFace: BF, fontSize: 10.5, border: { type: "solid", pt: 0.5, color: LINE },
    fill: { color: WHITE }, valign: "middle", margin: 0.05 }, o));
}

// ---------- Cover ----------
{
  const s = pres.addSlide(); s.background = { color: INK };
  s.addShape(pres.shapes.OVAL, { x: 6.5, y: -1.3, w: 5.2, h: 5.2, fill: { color: INK2 } });
  s.addShape(pres.shapes.OVAL, { x: 8.3, y: 3.3, w: 2.6, h: 2.6, fill: { color: JADE, transparency: 15 } });
  s.addShape(pres.shapes.OVAL, { x: 7.6, y: 3.0, w: 0.7, h: 0.7, fill: { color: VER } });
  txt(s, "Investment Strategy Challenge 2026 · Proposal for NKE Private Wealth", { x: 0.6, y: 1.0, w: 7, h: 0.4, fontSize: 13, color: "BFD8CF" });
  txt(s, "The Asia Digital Bridge Note", { x: 0.6, y: 1.45, w: 6.6, h: 1.5, fontFace: HF, fontSize: 40, bold: true, color: WHITE });
  txt(s, "Every dollar back for the next generation, with 1.6x the upside of Asia's AI hardware build-out", { x: 0.6, y: 3.0, w: 6.4, h: 0.9, fontSize: 17, italic: true, color: "E2EEE9" });
  txt(s, "USD 100Mn · 7-year note · 100% capital protected · Trade date 17 Sep 2026", { x: 0.6, y: 4.5, w: 7.5, h: 0.4, fontSize: 12, bold: true, color: GOLD });
  s.addNotes("Title. One-line pitch: full capital protection for the next generation, and leveraged participation in Asia's digital transformation through an index that cuts its own risk in a panic.");
}

// ---------- Executive summary (not counted) ----------
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Executive summary", "One note: protect the legacy, own Asia's digital build-out");
  const stats = [["100%", "Capital protected", "At maturity in 2033, subject to Natixis credit. No loss path except issuer default"],
                 [pct(lockAvg), "Upside participation", "Uncapped, on a 10% vol-target index of 13 Asian AI-hardware leaders, with Legacy Lock"],
                 [pct(worstLoss * 100e6 / 2e9, 2), "Of net worth at risk", "Worst stress mark-to-market (USD " + (worstLoss * 100).toFixed(1) + "Mn) before maturity"]];
  stats.forEach((st, i) => {
    const x = 0.5 + i * 3.05;
    card(s, x, 1.4, 2.85, 2.35);
    txt(s, st[0], { x: x + 0.25, y: 1.55, w: 2.4, h: 0.85, fontFace: HF, fontSize: 40, bold: true, color: i === 1 ? JADE : INK });
    txt(s, st[1], { x: x + 0.25, y: 2.42, w: 2.4, h: 0.35, fontSize: 15, bold: true });
    txt(s, st[2], { x: x + 0.25, y: 2.82, w: 2.4, h: 0.85, fontSize: 11.5, color: MUTED });
  });
  s.addText([
    { text: "We recommend " },
    { text: "a 7-year, 100% capital-protected USD note", options: { bold: true, color: JADE } },
    { text: " on the Asia Digital Bridge 10% Vol-Target Index, to express our view that Asia builds the hardware of the AI era, while volatility and geopolitics argue for protected exposure. " },
    { text: "Median outcome " + x2(rw["0.06"]["VT note"].p50) + "–" + x2(rw["0.09"]["VT note"].p50) + " of capital in our 6–9% basket-return cases (vs " + x2(R.ust_multiple) + " for a 7Y Treasury). Maximum loss at maturity: zero, contractual, ex issuer default.", options: { bold: true } },
  ], { x: 0.5, y: 3.95, w: 9, h: 1.15, fontFace: BF, fontSize: 12.5, color: TXT, margin: 0, valign: "top", isTextBox: true });
  foot(s, NOTE);
  s.addNotes("Executive summary (does not count toward the 10-slide limit). Unit 15: thesis, instrument, expected return, maximum loss in one paragraph.");
}

// Flow follows last year's winning deck: client > outlook > thesis > product overview > product details
// (terms, index, scenarios/payoff) > back-testing > risks & hedging > client/issuer summary.
const PROD = lockAvg;   // the proposed product includes Legacy Lock + 12M averaging

// ---------- 1. Client profile ----------
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Client profile: protect the legacy, then grow", "NKE Private Wealth, single-family office of the Chak family (third generation)");
  // Profile
  card(s, 0.5, 1.35, 2.9, 3.0, INK);
  txt(s, "Client", { x: 0.7, y: 1.5, w: 2.5, h: 0.35, fontFace: HF, fontSize: 15, bold: true, color: GOLD });
  bullets(s, ["Single-family office, Chak family", "Net worth > USD 2Bn", "Businesses: tech infrastructure, renewables, real estate", "Japan and Greater China", "Patriarch now focused on allocation and legacy"],
    { x: 0.7, y: 1.9, w: 2.55, h: 2.4, fontSize: 11, color: "E2EEE9" });
  // Goals
  txt(s, "Goals", { x: 3.65, y: 1.35, w: 2.9, h: 0.35, fontFace: HF, fontSize: 15, bold: true, color: INK });
  const goals = [["1", "Capital appreciation", "Grow wealth for future generations"], ["2", "Asia's digital transformation", "Exposure to the sectors driving it, bridging traditional and new"], ["3", "Downside managed", "Appropriate for generational wealth preservation"]];
  goals.forEach((g, i) => {
    const y = 1.8 + i * 0.85;
    badge(s, 3.65, y, g[0], i === 2 ? VER : JADE, 0.4);
    txt(s, g[1], { x: 4.15, y: y - 0.02, w: 2.4, h: 0.28, fontSize: 12, bold: true, color: INK });
    txt(s, g[2], { x: 4.15, y: y + 0.27, w: 2.4, h: 0.5, fontSize: 10.5, color: MUTED });
  });
  // Risk tolerance + assumptions
  card(s, 6.8, 1.35, 2.7, 3.0, MIST);
  txt(s, "Risk tolerance: Moderate", { x: 6.95, y: 1.5, w: 2.45, h: 0.35, fontFace: HF, fontSize: 13.5, bold: true, color: JADE });
  txt(s, "Key assumptions", { x: 6.95, y: 1.9, w: 2.45, h: 0.3, fontSize: 11.5, bold: true, color: INK });
  bullets(s, ["Mandate: USD 100Mn (5% of net worth)", "7-year horizon; family accepts limited early-exit liquidity", "Open to structured notes issued by Natixis", "USD base currency for the mandate"],
    { x: 6.95, y: 2.25, w: 2.45, h: 2.05, fontSize: 10.5 });
  card(s, 0.5, 4.5, 9, 0.6, "FBEDE9");
  s.addText([{ text: "Hidden risk: ", options: { bold: true, color: VER } },
    { text: "the family already owns Asian infrastructure, renewables and property. We give them the AI hardware layer and exclude what they already own." }],
    { x: 0.7, y: 4.52, w: 8.6, h: 0.56, fontFace: BF, fontSize: 11.5, color: TXT, margin: 0, valign: "middle", isTextBox: true });
  pageNo(s, 1);
  s.addNotes("Template: client profile, goals, risk tolerance, key assumptions. The concentration insight differentiates us: most proposals will buy more of what the family already owns.");
}

// ---------- 2. Investment outlook ----------
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Outlook: Asia builds the hardware of AI", "Pricing in macro, sector and geographic factors (data points to be sourced on Bloomberg as of 17 Sep 2026)");
  const chain = [["Chips", "TSMC · MediaTek"], ["Memory", "SK Hynix · Samsung"], ["Equipment", "Tokyo Electron · Advantest · Disco · Shin-Etsu"], ["Packaging", "ASE · Ibiden"], ["Servers", "Hon Hai · Quanta · Delta"]];
  chain.forEach((c, i) => {
    const x = 0.5 + i * 1.82;
    card(s, x, 1.35, 1.62, 1.0, i % 2 ? MIST : INK);
    txt(s, c[0], { x: x + 0.12, y: 1.42, w: 1.4, h: 0.3, fontFace: HF, fontSize: 13.5, bold: true, color: i % 2 ? INK : WHITE, align: "center" });
    txt(s, c[1], { x: x + 0.1, y: 1.75, w: 1.42, h: 0.55, fontSize: 10.5, color: i % 2 ? TXT : "D8E8E2", align: "center" });
    if (i < 4) s.addText("›", { x: x + 1.6, y: 1.6, w: 0.24, h: 0.45, fontFace: BF, fontSize: 22, bold: true, color: JADE, align: "center", margin: 0, isTextBox: true });
  });
  const cols = [
    ["Sector: AI capex", JADE, "Hyperscaler AI spending flows to leading-edge chips, HBM memory, test equipment and AI servers. HBM and advanced packaging are capacity-constrained."],
    ["Geography: Asia", INK2, "Every AI accelerator passes through Taiwan, Korea and Japan. Traditional makers (Hon Hai, Shin-Etsu, Ibiden) are now critical AI suppliers."],
    ["Macro: protection is cheap", VER, "USD funding of 5.75% for 7Y buys the bond floor at 67.6%. US–China tension and export controls make a floor valuable."],
  ];
  cols.forEach((c, i) => {
    const x = 0.5 + i * 3.05;
    s.addShape(pres.shapes.OVAL, { x, y: 2.62, w: 0.24, h: 0.24, fill: { color: c[1] } });
    txt(s, c[0], { x: x + 0.34, y: 2.56, w: 2.5, h: 0.35, fontFace: HF, fontSize: 13.5, bold: true, color: INK });
    txt(s, c[2], { x, y: 2.98, w: 2.85, h: 1.3, fontSize: 11 });
  });
  card(s, 0.5, 4.45, 9, 0.65, INK);
  txt(s, "Therefore: own Asia's AI hardware supply chain, wrapped in full capital protection.", { x: 0.7, y: 4.45, w: 8.6, h: 0.65, fontFace: HF, fontSize: 14, bold: true, color: WHITE, valign: "middle" });
  pageNo(s, 2);
  s.addNotes("Template: investment outlook across macro, sector and geography, ending with a 'therefore'. Source TSMC foundry share, HBM share, AI-server share and hyperscaler capex on Bloomberg.");
}

// ---------- 3. Investment thesis ----------
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Investment thesis: traditional strategies fall short", "Simulated 7-year outcomes at a 6% p.a. basket return: median and worst 5%");
  const b = rw["0.06"];
  s.addChart(pres.charts.BAR, [
    { name: "Median", labels: ["Direct equity", "7Y Treasury", "Our note"], values: [+b["Direct basket"].p50.toFixed(2), +R.ust_multiple.toFixed(2), +b["VT note"].p50.toFixed(2)] },
    { name: "Worst 5%", labels: ["Direct equity", "7Y Treasury", "Our note"], values: [+b["Direct basket"].p5.toFixed(2), +R.ust_multiple.toFixed(2), +b["VT note"].p5.toFixed(2)] },
  ], {
    x: 0.4, y: 1.3, w: 4.6, h: 3.75, barDir: "col", barGrouping: "clustered", ...chartBase(), chartColors: [JADE, VER],
    showLegend: true, legendPos: "b", legendFontFace: BF, legendFontSize: 10, legendColor: TXT,
    showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: '0.00"x"', dataLabelColor: TXT, dataLabelFontSize: 10,
    showTitle: true, title: "Multiple of capital after 7 years", valAxisHidden: true, barGapWidthPct: 70,
  });
  const imp = [
    ["Equities alone: no floor for heirs", pct(b["Direct basket"].p_loss) + " chance of losing money; worst 5% keep only " + x2(b["Direct basket"].p5)],
    ["Bonds alone: no growth", "A 7Y Treasury locks ~" + x2(R.ust_multiple) + " with no link to the AI build-out"],
    ["Plain protected note: weak upside", "Dealers charge ~" + RAWIV + "% vol for 7Y Asian stocks: only " + pct(R.raw_part) + " participation"],
    ["Our answer", "Floor of a bond, " + pct(PROD) + " of the upside, through an index that de-risks itself"],
  ];
  imp.forEach((t, i) => {
    const y = 1.35 + i * 0.93, last = i === 3;
    if (last) card(s, 5.25, y - 0.08, 4.3, 0.9, MIST);
    badge(s, 5.35, y, String(i + 1), last ? JADE : VER, 0.36);
    txt(s, t[0], { x: 5.85, y: y - 0.03, w: 3.6, h: 0.28, fontSize: 12, bold: true, color: last ? JADE : INK });
    txt(s, t[1], { x: 5.85, y: y + 0.26, w: 3.6, h: 0.5, fontSize: 10.5 });
  });
  foot(s, "Forward simulation (20k paths, two-regime volatility " + VOLC + "%/" + VOLS + "%), not a historical backtest. Treasury proxy = funding less ~100bp.");
  pageNo(s, 3);
  s.addNotes("Template: 'traditional strategies fall short', then implications. Autocalls were also rejected: the family wants growth, and early calls force reinvestment of a legacy pool.");
}

// ---------- 4. Product overview ----------
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "The Natixis Asia Digital Bridge Note", "7-year USD note, 100% capital protected, on a 10% vol-target index of Asian AI-hardware leaders");
  const feats = [["Full capital protection", "100% back at maturity in 2033 (issuer credit)", JADE],
                 ["Uncapped upside", pct(PROD) + " of the index performance", INK2],
                 ["Self-de-risking index", "Equity exposure cut automatically when volatility spikes", VER],
                 ["Legacy Lock", "Gains floored at +30 / +60 / +90% once reached", GOLD]];
  feats.forEach((f, i) => {
    const x = 0.5 + (i % 2) * 2.3, y = 1.35 + Math.floor(i / 2) * 1.55;
    card(s, x, y, 2.15, 1.4, MIST);
    s.addShape(pres.shapes.OVAL, { x: x + 0.15, y: y + 0.15, w: 0.3, h: 0.3, fill: { color: f[2] } });
    txt(s, f[0], { x: x + 0.15, y: y + 0.52, w: 1.9, h: 0.3, fontSize: 12, bold: true, color: INK });
    txt(s, f[1], { x: x + 0.15, y: y + 0.84, w: 1.9, h: 0.5, fontSize: 10, color: MUTED });
  });
  txt(s, "Excluded: data centres, telecom towers, renewables (family overlap); US-restricted chipmakers (e.g. SMIC).", { x: 0.5, y: 4.5, w: 4.45, h: 0.6, fontSize: 9.5, italic: true, color: MUTED });
  const names = [["TSMC", "2330 TT"], ["MediaTek", "2454 TT"], ["SK Hynix", "000660 KS"], ["Samsung Electronics", "005930 KS"], ["Tokyo Electron", "8035 JT"], ["Advantest", "6857 JT"], ["Disco", "6146 JT"],
                 ["Shin-Etsu Chemical", "4063 JT"], ["ASE Technology", "3711 TT"], ["Ibiden", "4062 JT"], ["Hon Hai (Foxconn)", "2317 TT"], ["Quanta Computer", "2382 TT"], ["Delta Electronics", "2308 TT"]];
  const rows = [["Constituent", "Ticker", "Weight"]].concat(names.map((n) => [n[0], n[1], "7.7%"]));
  table(s, rows, { x: 5.2, y: 1.3, w: 4.35, colW: [2.15, 1.3, 0.9], rowH: 0.255, fontSize: 9 });
  foot(s, "Equal weight, USD quanto. All names > USD 250M market cap and > USD 5M daily volume (to confirm on Bloomberg). " );
  pageNo(s, 4);
  s.addNotes("Template: product overview with key features and constituent table (ticker, weight). Eligibility check in the Excel Basket tab.");
}

// ---------- 5. Product details: terms & pricing ----------
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Product details: key terms and pricing", "Transparent build-up from the Natixis funding grid to participation");
  const rows = [["Term", "Proposal"], ["Issuer", "Natixis (guaranteed by BPCE)"], ["Notional / currency", "USD 100Mn; underlying quanto USD"],
    ["Dates", "Issue 17 Sep 2026; maturity Sep 2033 (7Y)"], ["Protection", "100% at maturity (issuer credit)"],
    ["Redemption", "100% + " + pct(PROD) + " × max(0, Index perf, Locked gain)"], ["Final index level", "Average of the last 12 monthly closes"],
    ["Legacy Lock", "Annual check: +30 / +60 / +90% floors once hit"], ["Liquidity", "Natixis indicative daily secondary bid"]];
  table(s, rows, { x: 0.5, y: 1.3, w: 4.9, colW: [1.45, 3.45], rowH: 0.38, fontSize: 10 });
  const steps = [["7Y USD funding (rules grid)", "5.75%"], ["Zero-coupon bond (floor)", pct(ZCB, 1)], ["Issuer fee", "2.0%"], ["Option budget", pct(BUDGET, 1)],
                 ["Option on VT index, with Lock + averaging", pct(BUDGET / PROD, 1)], ["Participation = budget ÷ option", pct(PROD)]];
  txt(s, "Pricing build-up (% of notional)", { x: 5.7, y: 1.3, w: 3.85, h: 0.3, fontFace: HF, fontSize: 14, bold: true, color: INK });
  steps.forEach((st, i) => {
    const y = 1.68 + i * 0.47, last = i === steps.length - 1;
    card(s, 5.7, y, 3.85, 0.4, last ? JADE : MIST);
    txt(s, st[0], { x: 5.85, y, w: 2.75, h: 0.4, fontSize: 10.5, valign: "middle", color: last ? WHITE : TXT, bold: last });
    txt(s, st[1], { x: 8.5, y, w: 0.95, h: 0.4, fontSize: 12, valign: "middle", align: "right", bold: true, color: last ? WHITE : INK });
  });
  txt(s, "Base version without Lock/averaging: " + pct(PART) + ". Tenor check: 5Y 143% · 7Y 157% · 10Y 169% (Black-Scholes); 7Y matches one generation's handover.", { x: 5.7, y: 4.55, w: 3.85, h: 0.6, fontSize: 9.5, italic: true, color: MUTED });
  foot(s, NOTE);
  pageNo(s, 5);
  s.addNotes("Template: key terms. Live formulas in pricing/Asia-Digital-Bridge-Pricer.xlsx.");
}

// ---------- 6. Product details: the index ----------
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Product details: an index that cuts its own risk", "Natixis Asia Digital Bridge 10% Vol-Target Index: exposure responds to market volatility");
  const vols = [8, 10, 15, 20, 25, 30, 35, 40, 45, 50];
  s.addChart(pres.charts.LINE, [{ name: "Equity exposure", labels: vols.map((v) => v + "%"), values: vols.map((v) => Math.round(Math.min(10 / v, 1.5) * 100)) }], {
    x: 0.4, y: 1.3, w: 5.0, h: 3.5, ...chartBase(), chartColors: [JADE], lineSize: 3, lineDataSymbol: "circle", lineDataSymbolSize: 6,
    showTitle: true, title: "Equity exposure (%) vs basket realised volatility", valAxisMinVal: 0, valAxisMaxVal: 160,
    showCatAxisTitle: true, catAxisTitle: "Basket realised volatility", catAxisTitleFontSize: 10, catAxisTitleColor: MUTED,
  });
  const steps = [["1", "Measure", "Basket volatility = max(20-day, 60-day) realised, with a 1-day lag"],
                 ["2", "Size", "Exposure = 10% ÷ volatility, capped at 150%; the rest earns cash"],
                 ["3", "Deduct", "1% per year decrement lowers the option cost (we rejected 4%: see slide 8)"]];
  steps.forEach((st, i) => {
    const y = 1.35 + i * 0.95;
    badge(s, 5.75, y, st[0], i === 2 ? VER : JADE, 0.42);
    txt(s, st[1], { x: 6.3, y: y - 0.02, w: 3.2, h: 0.3, fontFace: HF, fontSize: 13.5, bold: true, color: INK });
    txt(s, st[2], { x: 6.3, y: y + 0.28, w: 3.2, h: 0.6, fontSize: 11 });
  });
  card(s, 5.75, 4.2, 3.8, 0.9, INK);
  s.addText([{ text: "Calm market (" + VOLC + "% vol): ", options: { bold: true, color: GOLD } }, { text: "~" + Math.round(1000 / VOLC) + "% exposure. " },
             { text: "Crash (" + VOLS + "% vol): ", options: { bold: true, color: GOLD } }, { text: "~" + Math.round(1000 / VOLS) + "% exposure, cut automatically." }],
    { x: 5.9, y: 4.23, w: 3.55, h: 0.84, fontFace: BF, fontSize: 11.5, color: WHITE, margin: 0, valign: "middle", isTextBox: true });
  foot(s, "Simulated: average exposure " + pct(R.w_mean) + ", realised index volatility " + pct(R.idx_vol, 1) + " vs 10% target (lag gap risk priced in the Monte Carlo).");
  pageNo(s, 6);
  s.addNotes("Because the index volatility is fixed, Natixis hedges with delta only and prices the option off a known vol. That is what makes " + pct(PROD) + " participation possible on a 7Y Asian basket.");
}

// ---------- 7. Product details: scenarios & payoff ----------
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Product details: scenario analysis and payoff", "Redemption at maturity, % of notional");
  const sc = [["Index averages +50% at maturity", 100 + PROD * 50], ["Index hits +60% in year 4 (Lock), ends +20%", 100 + PROD * 60],
              ["Index ends +10%", 100 + PROD * 10], ["Index ends −25% (no Lock hit)", 100]];
  const rows = [["Scenario", "Redemption"]].concat(sc.map((r) => [r[0], r[1].toFixed(1) + "%"]));
  table(s, rows, { x: 0.5, y: 1.3, w: 4.4, colW: [3.2, 1.2], rowH: 0.48, fontSize: 10.5 });
  card(s, 0.5, 3.85, 4.4, 1.25, MIST);
  s.addText([{ text: "Worst case: ", options: { bold: true, color: VER } }, { text: "100%, contractual (ex issuer default). " },
    { text: "Legacy Lock: ", options: { bold: true, color: JADE } }, { text: "a +60% gain reached in year 4 is kept for the heirs even if markets fall before 2033." }],
    { x: 0.65, y: 3.9, w: 4.1, h: 1.15, fontFace: BF, fontSize: 11, color: TXT, margin: 0, valign: "middle", isTextBox: true });
  const xs = [-40, -20, 0, 10, 20, 30, 50, 75, 100];
  s.addChart(pres.charts.LINE, [
    { name: "Note redemption", labels: xs.map((v) => v + "%"), values: xs.map((v) => +(100 + PROD * Math.max(v, 0)).toFixed(1)) },
    { name: "Holding the index", labels: xs.map((v) => v + "%"), values: xs.map((v) => 100 + v) },
  ], {
    x: 5.1, y: 1.3, w: 4.5, h: 3.8, ...chartBase(), chartColors: [JADE, "9AA8AF"], lineSize: 3, lineDataSymbol: "none",
    showLegend: true, legendPos: "b", legendFontFace: BF, legendFontSize: 10, legendColor: TXT,
    showTitle: true, title: "Payoff diagram (% of notional)", valAxisMinVal: 50,
    showCatAxisTitle: true, catAxisTitle: "VT index performance at maturity", catAxisTitleFontSize: 10, catAxisTitleColor: MUTED,
  });
  foot(s, "Participation " + pct(PROD) + " (with Legacy Lock and 12M averaging). " + NOTE.split(";")[0] + ".");
  pageNo(s, 7);
  s.addNotes("Template: scenario analysis next to the payoff diagram. Redemption = 100% + participation x max(0, final average perf, locked gain).");
}

// ---------- 8. Back-testing ----------
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Back-testing: simulated outcomes and design choice", "20,000 simulated 7-year paths; historical rolling windows to be added from Bloomberg (2005–2026)");
  const d = R.designs;
  const labels = ["12%/4%", "10%/2%", "10%/1% (ours)", "10%/0%", "Raw basket"];
  s.addChart(pres.charts.BAR, [{ name: "P(only 100 back)", labels, values: d.map((r) => Math.round(r[7] * 100)) }], {
    x: 0.4, y: 1.3, w: 4.6, h: 2.9, barDir: "col", ...chartBase(), chartColors: [VER, VER, JADE, VER, "9AA8AF"],
    showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: '0"%"', dataLabelColor: TXT, dataLabelFontSize: 10,
    showTitle: true, title: "Chance of only 100 back (9% basket return)", valAxisHidden: true, barGapWidthPct: 60, varyColors: true,
  });
  txt(s, "Participation: " + d.map((r, i) => labels[i].replace(" (ours)", "") + " " + pct(r[3])).join(" · "), { x: 0.5, y: 4.25, w: 4.5, h: 0.4, fontSize: 9.5, color: MUTED });
  const f = (x) => x.toFixed(2) + "x";
  const rows = [["Basket return p.a.", "Median", "Worst 5%", "P(100 only)"]].concat(["0.03", "0.06", "0.09"].map((k) => {
    const v = rw[k]["VT note"]; return [pct(+k) + " (" + (k === "0.03" ? "bear" : k === "0.06" ? "base" : "bull") + ")", f(v.p50), f(v.p5), pct(v.p_floor)];
  }));
  table(s, rows, { x: 5.25, y: 1.35, w: 4.3, colW: [1.45, 0.9, 0.95, 1.0], rowH: 0.42, fontSize: 10 });
  bullets(s, ["Two-regime basket volatility (" + VOLC + "% calm, " + VOLS + "% stress) so crashes and the vol-target lag are captured",
              "No path ends below 100; the note's median beats direct equity in every regime",
              "We turned down a " + pct(d[0][3]) + " headline: " + pct(d[0][7]) + " chance of only 100 back vs " + pct(d[2][7]) + " for ours"],
    { x: 5.25, y: 3.2, w: 4.3, h: 1.9, fontSize: 10.5 });
  foot(s, "Labels: target volatility / annual decrement, same option budget. Forward simulation, not a historical backtest.");
  pageNo(s, 8);
  s.addNotes("Template: back-testing with result interpretation. Run pricing/scenario2_backtest.py on the Bloomberg export to add historical rolling 7Y windows and GFC/2015/2018/2020/2022 stress windows.");
}

// ---------- 9. Key risks & hedging ----------
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Key risk factors and hedging", "Unit 15 checklist: stress, sizing and exits");
  const rows = [["Risk", "What could happen", "Mitigation / hedge"],
    ["Credit", "Natixis default: protection lost", "BPCE guarantee; 5% of net worth only"],
    ["Market (MTM)", "Worst stress: note marked at " + (Math.min(...risk.stress.map((x) => x[3])) * 100).toFixed(1), "Floor at maturity; vol target cuts exposure"],
    ["Concentration", "Taiwan is 6 of 13 names; chip cycle", "Equal weight caps any name at 7.7%"],
    ["Liquidity", "7-year lock-up; bid/offer on exit", "Natixis daily secondary bid"],
    ["FX", "JPY/TWD/KRW moves", "Quanto USD: no FX exposure"],
    ["Inflation", "100 back = ~84 in real terms", "Legacy Lock and " + pct(PROD) + " upside"]];
  table(s, rows, { x: 0.5, y: 1.3, w: 5.6, colW: [1.15, 2.25, 2.2], rowH: 0.42, fontSize: 9.5 });
  card(s, 6.35, 1.3, 3.2, 1.7, MIST);
  s.addText([{ text: "Sizing\n", options: { bold: true, color: JADE, fontSize: 12 } },
    { text: "USD 100Mn ÷ USD 2Bn = 5.0% of net worth. Max loss at maturity: 0. Worst stress MTM: USD " + (worstLoss * 100).toFixed(1) + "Mn ÷ USD 2Bn = " + pct(worstLoss * 0.05, 2) + " of net worth. 10-day 99% VaR " + pct(risk.var99, 1) + ", ES " + pct(risk.es99, 1) + "." }],
    { x: 6.5, y: 1.36, w: 2.95, h: 1.58, fontFace: BF, fontSize: 10, color: TXT, margin: 0, valign: "top", isTextBox: true });
  txt(s, "Four exits", { x: 6.35, y: 3.12, w: 3.2, h: 0.28, fontFace: HF, fontSize: 12.5, bold: true, color: INK });
  bullets(s, ["Profit: sell back if index +60%, or let the Lock bank it", "Stop-loss: none, the floor is the stop", "Thesis broken: Taiwan blockade or chip export bans", "Time: hold to Sep 2033"],
    { x: 6.35, y: 3.45, w: 3.2, h: 1.65, fontSize: 10 });
  foot(s, "Stress: AI hardware crash (basket −30%, vol " + VOLC + "→" + VOLS + "%), Taiwan gap (−20% overnight), stagflation (−15%, rates +100bp). Details in appendix B.");
  pageNo(s, 9);
  s.addNotes("Template: key risk factors with corresponding hedging. Greeks per 100 notional: delta " + (risk.delta * 100).toFixed(2) + " per 1% index move; DV01 " + (risk.dv01 * 100).toFixed(3) + ".");
}

// ---------- 10. Summary ----------
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Summary: value for the client and for Natixis", "Advantages, risks and how each side is protected");
  const hdr = ["", "Chak family (client)", "Natixis (issuer)"];
  const rows = [
    ["Advantages", "100% back in 2033 · " + pct(PROD) + " uncapped upside in Asia's AI hardware · diversifies away from their own sectors and currencies",
                   "7Y USD funding at 5.75% · proprietary index reusable for other clients · long-term family-office relationship"],
    ["Risks", "Natixis credit · 7-year lock-up · inflation on the floor · VT lags sharp rebounds",
              "Gap risk from the vol-target lag · quanto correlation · long-dated rates"],
    ["Hedging", "Floor + Legacy Lock · equal weight · USD quanto",
                "Delta-hedge the index (vol fixed by design) · correlation reserve · swap fixed-rate funding"]];
  hdr.forEach((h, j) => {
    if (!h) return;
    const x = 1.95 + (j - 1) * 3.8;
    card(s, x, 1.3, 3.6, 0.45, j === 1 ? JADE : INK);
    txt(s, h, { x, y: 1.3, w: 3.6, h: 0.45, fontFace: HF, fontSize: 13.5, bold: true, color: WHITE, align: "center", valign: "middle" });
  });
  rows.forEach((r, i) => {
    const y = 1.9 + i * 1.0;
    badge(s, 0.5, y + 0.2, r[0][0], [JADE, VER, INK2][i], 0.42);
    txt(s, r[0], { x: 1.0, y: y + 0.26, w: 0.9, h: 0.3, fontSize: 11, bold: true, color: INK });
    [1, 2].forEach((j) => {
      const x = 1.95 + (j - 1) * 3.8;
      card(s, x, y, 3.6, 0.88, MIST);
      txt(s, r[j], { x: x + 0.12, y: y + 0.05, w: 3.36, h: 0.78, fontSize: 10.5, valign: "middle" });
    });
  });
  txt(s, "Protect the legacy. Own the hardware of Asia's AI era.", { x: 0.5, y: 4.95, w: 9, h: 0.3, fontFace: HF, fontSize: 13, italic: true, bold: true, color: JADE, align: "center" });
  pageNo(s, 10);
  s.addNotes("Template: summary with client and issuer views (advantages, risks, hedging), as in last year's winning deck.");
}

// ---------- Appendix A: digital assets ----------
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Appendix A: adding a digital-asset sleeve", "Options considered if the family wants direct exposure to digital assets");
  const rows = [["Variant", "Underlying", "Participation", "Assessment"],
    ["Core (recommended)", "Asia Digital Bridge VT index", pct(PART), "Best fit for a legacy mandate"],
    ["80/20 static sleeve", "80% VT index + 20% spot Bitcoin ETF (IBIT US)", "~130%", "Possible add-on: crypto adds ~11pt of vol to the basket"],
    ["Best-of", "Better of VT index or Bitcoin ETF", "~40–45%", "Rejected: Bitcoin vol (50–60%) makes the best-of too expensive"]];
  table(s, rows, { x: 0.5, y: 1.35, w: 9, colW: [1.8, 3.0, 1.3, 2.9], rowH: 0.55, fontSize: 11 });
  bullets(s, ["IBIT US is a US-listed spot Bitcoin ETF with daily volume well above the USD 5M rule (confirm on Bloomberg)",
    "Why not in the core: drawdowns of 70%+ in past cycles and no earnings anchor; hard to defend for generational wealth",
    "If included, keep it in the 80/20 form so protection and most of the participation are preserved"],
    { x: 0.5, y: 3.75, w: 9, h: 1.3, fontSize: 11.5 });
  foot(s, "Indicative Monte Carlo: Bitcoin vol 50–60%, correlation 0.2–0.4 with the VT index, same 30.4% option budget.");
  s.addNotes("Appendix (not counted). Digital assets are an eligible asset class, so showing we considered and sized them is useful in Q&A.");
}

// ---------- Appendix B: methodology ----------
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Appendix B: methodology and assumptions", "All inputs are placeholders to be refreshed with Bloomberg data as of 17 Sep 2026");
  const rows = [["Input", "Value used", "Source / to refresh"],
    ["USD funding 7Y", "5.75%", "2026 rules funding grid (linear interpolation)"],
    ["USD OIS for option pricing", "3.75%", "Assumption: Bloomberg USSO7"],
    ["Basket volatility regimes", VOLC + "% calm / " + VOLS + "% stress", "Assumption: calibrate to basket history"],
    ["Raw-basket 7Y implied vol", RAWIV + "%", "Assumption: dealer quote / long-dated surface"],
    ["Issuer fee", "2.0% upfront", "Assumption"],
    ["Quanto adjustment", "−0.2% p.a.", "Assumption: equity–FX correlation"]];
  table(s, rows, { x: 0.5, y: 1.3, w: 5.4, colW: [1.8, 1.4, 2.2], rowH: 0.42, fontSize: 9.5 });
  txt(s, "Models", { x: 6.2, y: 1.3, w: 3.3, h: 0.3, fontFace: HF, fontSize: 14, bold: true, color: INK });
  bullets(s, ["Pricing: daily Monte Carlo, 20k paths, two-regime basket vol; VT index rebuilt each day with lag and cap",
    "MTM and Greeks: Black-Scholes on the VT index, scaled to the Monte Carlo price",
    "VaR: 10-day 99% delta-normal; ES from the normal tail",
    "Backtest: rolling 7Y windows on Bloomberg history 2005–2026, plus GFC, 2015, 2018, 2020, 2022 stress windows"],
    { x: 6.2, y: 1.7, w: 3.35, h: 3.3, fontSize: 10.5 });
  foot(s, "Code: pricing/scenario2_vt_note.py · pricing/scenario2_backtest.py · pricing/Asia-Digital-Bridge-Pricer.xlsx");
  s.addNotes("Appendix (not counted).");
}

// ---------- Appendix C: sources ----------
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Appendix C: sources", "Data and frameworks behind this proposal");
  bullets(s, ["Natixis, Investment Strategy Challenge 2026 game rules: client brief (Scenario 2), eligibility rules, USD funding grid",
    "E. Lam, FINA4370A Unit 15, CUHK Business School (Aug 2026): trading proposal framework, sizing, exits, liquidity evidence",
    "Bloomberg (to be pulled as of 17 Sep 2026): constituent prices, market caps, trading volumes, USD OIS curve, implied volatility",
    "Company filings and investor presentations of the 13 constituents (AI revenue exposure, capacity plans)",
    "Team models: pricing/scenario2_vt_note.py (Monte Carlo), pricing/scenario2_backtest.py, pricing/Asia-Digital-Bridge-Pricer.xlsx"],
    { x: 0.5, y: 1.35, w: 9, h: 3.6, fontSize: 12, paraSpaceAfter: 10 });
  s.addNotes("Appendix (not counted). Add specific report citations once market data points are sourced.");
}

pres.writeFile({ fileName: "deck/Asia-Digital-Bridge-Note.pptx" }).then((f) => console.log("saved", f));
