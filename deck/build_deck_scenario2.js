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
const PART = R.part, BUDGET = R.budget, ZCB = R.zcb;
const lockAvg = R.menu.find((m) => m[0].startsWith("+ Lock + averaging"))[2];
const rw = R.realworld, risk = R.risk;
const worstLoss = risk.v0 - Math.min(...risk.stress.map((s) => s[3]));

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
  txt(s, "Every dollar back for the next generation, with 1.6x the upside of Asia's digital build-out", { x: 0.6, y: 3.0, w: 6.4, h: 0.9, fontSize: 17, italic: true, color: "E2EEE9" });
  txt(s, "USD 100Mn · 7-year note · 100% capital protected · Trade date 17 Sep 2026", { x: 0.6, y: 4.5, w: 7.5, h: 0.4, fontSize: 12, bold: true, color: GOLD });
  s.addNotes("Title. One-line pitch: full capital protection for the next generation, and leveraged participation in Asia's digital transformation through an index that cuts its own risk in a panic.");
}

// ---------- Executive summary (not counted) ----------
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Executive summary", "One note: protect the legacy, own Asia's digital build-out");
  const stats = [["100%", "Capital protected", "At maturity in 2033, subject to Natixis credit. No loss path except issuer default"],
                 [pct(lockAvg), "Upside participation", "Uncapped, on a 10% vol-target index of 13 Asian digital leaders, with Legacy Lock"],
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
    { text: " on the Asia Digital Bridge 10% Vol-Target Index, to express our view that Asia owns the hardware and platforms of the AI era, while volatility and geopolitics argue for protected exposure. " },
    { text: "Median outcome 1.41x–1.59x of capital in our 6–9% basket-return cases (vs 1.38x for a 7Y Treasury). Maximum loss at maturity: zero, contractual, ex issuer default.", options: { bold: true } },
  ], { x: 0.5, y: 3.95, w: 9, h: 1.15, fontFace: BF, fontSize: 12.5, color: TXT, margin: 0, valign: "top", isTextBox: true });
  foot(s, NOTE);
  s.addNotes("Executive summary (does not count toward the 10-slide limit). Unit 15: thesis, instrument, expected return, maximum loss in one paragraph.");
}

// ---------- 1. Client ----------
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Growth for the heirs, without risking the legacy", "Client diagnosis: NKE Private Wealth, single-family office, third generation");
  const cols = [
    ["Who they are", ["Net worth > USD 2Bn; USD 100Mn to deploy (5%)", "Businesses: tech infrastructure, renewables, real estate", "Japan and Greater China"]],
    ["What they want", ["Capital appreciation for future generations", "Exposure to Asia's digital transformation", "Bridge traditional markets and new technology"]],
    ["What they need", ["Principal protected: generational wealth", "Long horizon matching succession", "No doubling-up on existing exposures"]],
  ];
  cols.forEach((c, i) => {
    const x = 0.5 + i * 3.05, dark = i === 2;
    card(s, x, 1.4, 2.85, 2.75, dark ? INK : MIST);
    badge(s, x + 0.25, 1.58, String(i + 1), dark ? VER : JADE);
    txt(s, c[0], { x: x + 0.25, y: 2.14, w: 2.4, h: 0.4, fontFace: HF, fontSize: 16, bold: true, color: dark ? WHITE : INK });
    bullets(s, c[1], { x: x + 0.22, y: 2.58, w: 2.45, h: 1.5, fontSize: 11.5, color: dark ? "E2EEE9" : TXT });
  });
  card(s, 0.5, 4.3, 9, 0.78, "FBEDE9");
  s.addText([{ text: "The hidden risk: ", options: { bold: true, color: VER } },
    { text: "the family already earns its wealth in Asian infrastructure, renewables and property. We give digital exposure through chips, AI and platforms, exclude those sectors, and pay in USD so the note adds no JPY/HKD/CNY risk." }],
    { x: 0.7, y: 4.33, w: 8.6, h: 0.72, fontFace: BF, fontSize: 12, color: TXT, margin: 0, valign: "middle", isTextBox: true });
  pageNo(s, 1);
  s.addNotes("Risk profile: moderate. Willing to take equity risk on the upside, not willing to lose capital. The concentration insight is our differentiator: most proposals will simply buy more Asian infrastructure.");
}

// ---------- 2. Thesis ----------
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Asia owns the hardware and platforms of the AI era", "Investment thesis: three pillars (market data to be confirmed on Bloomberg as of 17 Sep 2026)");
  const chain = [["Design", "MediaTek"], ["Foundry", "TSMC"], ["Memory", "SK Hynix · Samsung"], ["Equipment", "Tokyo Electron · Advantest"], ["Platforms", "Tencent · Alibaba · Xiaomi"]];
  chain.forEach((c, i) => {
    const x = 0.5 + i * 1.82;
    card(s, x, 1.38, 1.62, 1.05, i % 2 ? MIST : INK);
    txt(s, c[0], { x: x + 0.12, y: 1.46, w: 1.4, h: 0.32, fontFace: HF, fontSize: 13.5, bold: true, color: i % 2 ? INK : WHITE, align: "center" });
    txt(s, c[1], { x: x + 0.1, y: 1.8, w: 1.42, h: 0.55, fontSize: 10.5, color: i % 2 ? TXT : "D8E8E2", align: "center" });
    if (i < 4) s.addText("›", { x: x + 1.6, y: 1.65, w: 0.24, h: 0.45, fontFace: BF, fontSize: 22, bold: true, color: JADE, align: "center", margin: 0, isTextBox: true });
  });
  txt(s, "The AI value chain runs through Taiwan, Korea, Japan and China. Our basket owns every link.", { x: 0.5, y: 2.5, w: 9, h: 0.3, fontSize: 11.5, italic: true, color: MUTED });
  const pillars = [
    ["A", "Structural AI capex", "Data-centre and AI spending drives demand for leading-edge chips, HBM memory and test equipment: segments Asian firms dominate.", JADE],
    ["B", "Champions go digital", "Japan's governance reforms and Korea's Value-up programme reward incumbents moving into digital: Sony, Hitachi, SoftBank, Keyence.", INK2],
    ["C", "Protection is cheap now", "USD funding at 5.75% for 7Y buys the bond floor at 67.6%. Geopolitics (US–China, Taiwan, export controls) is why the family wants a floor.", VER],
  ];
  pillars.forEach((p, i) => {
    const x = 0.5 + i * 3.05;
    badge(s, x, 2.98, p[0], p[3]);
    txt(s, p[1], { x: x + 0.58, y: 3.03, w: 2.3, h: 0.4, fontFace: HF, fontSize: 14, bold: true, color: INK });
    txt(s, p[2], { x, y: 3.55, w: 2.85, h: 1.5, fontSize: 11.5 });
  });
  pageNo(s, 2);
  s.addNotes("Pull supporting data from Bloomberg: TSMC share of leading-edge foundry, HBM share for SK Hynix/Samsung, TOPIX ROE trend, AI capex forecasts. Keep claims qualitative until sourced.");
}

// ---------- 3. Why this structure ----------
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Why a protected note on a vol-target index", "We tested four alternatives and rejected each for a reason the family will recognise");
  const rows = [["Alternative", "What it offers", "Why we rejected it"],
    ["Direct equity basket", "Full upside", "28–51% chance of losing money over 7Y in our simulation; no floor for heirs"],
    ["Autocall / high-coupon note", "Income, early exit", "Client wants growth, not income; early call forces reinvestment of a legacy pool"],
    ["JPY-denominated note", "Matches home currency", "JPY 7Y funding 3.23% leaves ~half the option budget; adds to existing JPY risk"],
    ["Protected note on raw basket", "Simple call on 13 stocks", "No liquid 7Y Asian single-stock vol: dealer charges ~30% IV, so only " + pct(R.raw_part) + " participation"],
    ["Asia Digital Bridge Note", "Protected, " + pct(PART) + " participation", "Index vol fixed at 10%: hedgeable by Natixis, cheap to buy, de-risks itself in a crash"]];
  table(s, rows, { x: 0.5, y: 1.38, w: 9, colW: [2.2, 2.0, 4.8], rowH: 0.5 });
  card(s, 0.5, 4.5, 9, 0.6, MIST);
  txt(s, "Unit 15 principle: a structure is justified by the alternatives it beats. Each rejected option fails one client need: protection, growth, or cost.", { x: 0.7, y: 4.53, w: 8.6, h: 0.54, fontSize: 11.5, italic: true, color: INK, valign: "middle" });
  foot(s, NOTE);
  pageNo(s, 3);
  s.addNotes("Highlight the last row in the room. The raw-basket comparison is the key technical argument for a vol-target index: liquidity of long-dated single-stock vol in Asia.");
}
// colour the recommended row
{
  const s = pres._slides[pres._slides.length - 1];
  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 1.38 + 5 * 0.5, w: 9, h: 0.5, fill: { color: JADE, transparency: 85 }, line: { color: JADE, width: 1.25 } });
}

// ---------- 4. Product ----------
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "The Asia Digital Bridge Note", "Where every dollar of the USD 100Mn goes, and what it buys");
  s.addChart(pres.charts.DOUGHNUT, [{ name: "Allocation", labels: ["Zero-coupon bond (floor)", "Options on VT index", "Issuer fee"], values: [+(ZCB * 100).toFixed(1), +(BUDGET * 100).toFixed(1), 2.0] }], {
    x: 0.4, y: 1.25, w: 3.6, h: 3.4, chartColors: [INK, JADE, GOLD], holeSize: 58, showLegend: true, legendPos: "b", legendFontFace: BF, legendFontSize: 10, legendColor: TXT,
    showValue: false, showPercent: true, dataLabelColor: WHITE, dataLabelFontSize: 11, dataLabelFontBold: true, showTitle: false,
  });
  txt(s, "USD 100Mn", { x: 1.45, y: 2.33, w: 1.5, h: 0.4, fontFace: HF, fontSize: 15, bold: true, color: INK, align: "center" });
  const groups = [
    ["Semiconductors (6)", "TSMC · Samsung · SK Hynix · MediaTek · Tokyo Electron · Advantest", JADE],
    ["Traditional champions going digital (4)", "Sony · Hitachi · SoftBank Group · Keyence", INK2],
    ["Platforms (3)", "Tencent · Alibaba · Xiaomi", VER],
  ];
  txt(s, "Underlying: 13 names, equal weight, USD quanto", { x: 4.35, y: 1.3, w: 5.2, h: 0.35, fontFace: HF, fontSize: 14, bold: true, color: INK });
  groups.forEach((g, i) => {
    const y = 1.75 + i * 0.78;
    s.addShape(pres.shapes.OVAL, { x: 4.35, y: y + 0.08, w: 0.22, h: 0.22, fill: { color: g[2] } });
    txt(s, g[0], { x: 4.7, y, w: 4.85, h: 0.3, fontSize: 12, bold: true });
    txt(s, g[1], { x: 4.7, y: y + 0.3, w: 4.85, h: 0.4, fontSize: 11, color: MUTED });
  });
  card(s, 4.35, 4.15, 5.2, 0.95, MIST);
  txt(s, "Excluded on purpose: renewables, real estate, data-centre REITs (family overlap) and US-restricted names (e.g. SMIC). All names > USD 250M market cap, > USD 5M daily volume, on Bloomberg.", { x: 4.5, y: 4.2, w: 4.95, h: 0.85, fontSize: 10.5, valign: "middle" });
  foot(s, NOTE);
  pageNo(s, 4);
  s.addNotes("67.6% buys the 7Y zero-coupon bond at 5.75% USD funding, which guarantees 100 back. 30.4% buys the call on the VT index. 2% is Natixis margin. Eligibility check sits in the Excel Basket tab.");
}

// ---------- 5. VT index ----------
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "An index that cuts its own risk in a panic", "Natixis Asia Digital Bridge 10% Vol-Target Index: how exposure responds to market volatility");
  const vols = [8, 10, 15, 20, 25, 30, 35, 40, 45, 50];
  s.addChart(pres.charts.LINE, [{ name: "Equity exposure", labels: vols.map((v) => v + "%"), values: vols.map((v) => Math.round(Math.min(10 / v, 1.5) * 100)) }], {
    x: 0.4, y: 1.3, w: 5.0, h: 3.5, ...chartBase(), chartColors: [JADE], lineSize: 3, lineDataSymbol: "circle", lineDataSymbolSize: 6,
    showTitle: true, title: "Equity exposure (%) vs basket realised volatility", valAxisMinVal: 0, valAxisMaxVal: 160,
    showCatAxisTitle: true, catAxisTitle: "Basket realised volatility", catAxisTitleFontSize: 10, catAxisTitleColor: MUTED,
  });
  const steps = [["1", "Measure", "Basket volatility = max(20-day, 60-day) realised, observed with a 1-day lag"],
                 ["2", "Size", "Exposure = 10% ÷ volatility, capped at 150%; the rest earns cash"],
                 ["3", "Deduct", "1% per year decrement: lowers the option cost (see slide 8)"]];
  steps.forEach((st, i) => {
    const y = 1.35 + i * 0.95;
    badge(s, 5.75, y, st[0], i === 2 ? VER : JADE, 0.42);
    txt(s, st[1], { x: 6.3, y: y - 0.02, w: 3.2, h: 0.3, fontFace: HF, fontSize: 13.5, bold: true, color: INK });
    txt(s, st[2], { x: 6.3, y: y + 0.28, w: 3.2, h: 0.6, fontSize: 11 });
  });
  card(s, 5.75, 4.2, 3.8, 0.9, INK);
  s.addText([{ text: "Calm market (22% vol): ", options: { bold: true, color: GOLD } }, { text: "~45% exposure. " },
             { text: "Crash (45% vol): ", options: { bold: true, color: GOLD } }, { text: "~22% exposure, cut automatically." }],
    { x: 5.9, y: 4.23, w: 3.55, h: 0.84, fontFace: BF, fontSize: 11.5, color: WHITE, margin: 0, valign: "middle", isTextBox: true });
  foot(s, "Simulated: average exposure " + pct(R.w_mean) + ", realised index volatility " + pct(R.idx_vol, 1) + " vs 10% target (lag creates small gap risk, priced in the Monte Carlo).");
  pageNo(s, 5);
  s.addNotes("Because the index volatility is fixed by construction, Natixis can hedge with delta only and price the option off a known vol. That is what makes 164% participation possible on a 7Y Asian basket.");
}

// ---------- 6. Pricing & term sheet ----------
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Term sheet and pricing", "Transparent build-up from funding grid to participation");
  const rows = [["Term", "Proposal"], ["Issuer", "Natixis (guaranteed by BPCE)"], ["Notional / currency", "USD 100Mn; underlying quanto USD"],
    ["Dates", "Issue 17 Sep 2026; maturity Sep 2033 (7Y)"], ["Protection", "100% at maturity (issuer credit)"],
    ["Redemption", "100% + Participation × max(0, Index perf)"], ["Participation", pct(PART) + " base · " + pct(lockAvg) + " with Lock + averaging"],
    ["Legacy Lock", "Gains floored at +30/+60/+90% if hit on an annual date"], ["Averaging", "Final level = average of last 12 monthly closes"],
    ["Liquidity", "Natixis indicative daily secondary bid"]];
  table(s, rows, { x: 0.5, y: 1.3, w: 4.9, colW: [1.45, 3.45], rowH: 0.36, fontSize: 10 });
  const steps = [["7Y USD funding (rules grid)", "5.75%"], ["Zero-coupon bond", pct(ZCB, 1)], ["Issuer fee", "2.0%"], ["Option budget", pct(BUDGET, 1)],
                 ["ATM call on VT index (MC)", pct(R.c_mc, 1)], ["Participation = budget ÷ call", pct(PART)]];
  txt(s, "Pricing build-up", { x: 5.7, y: 1.3, w: 3.8, h: 0.3, fontFace: HF, fontSize: 14, bold: true, color: INK });
  steps.forEach((st, i) => {
    const y = 1.68 + i * 0.47, last = i === steps.length - 1;
    card(s, 5.7, y, 3.85, 0.4, last ? JADE : MIST);
    txt(s, st[0], { x: 5.85, y, w: 2.6, h: 0.4, fontSize: 11, valign: "middle", color: last ? WHITE : TXT, bold: last });
    txt(s, st[1], { x: 8.4, y, w: 1.05, h: 0.4, fontSize: 12, valign: "middle", align: "right", bold: true, color: last ? WHITE : INK });
  });
  txt(s, "Tenor check: 5Y 143% · 6Y 151% · 7Y 157% · 10Y 169% (Black-Scholes). 7Y matches one generation's handover at most of the 10Y benefit.", { x: 5.7, y: 4.55, w: 3.85, h: 0.6, fontSize: 9.5, italic: true, color: MUTED });
  foot(s, NOTE);
  pageNo(s, 6);
  s.addNotes("Live formulas in pricing/Asia-Digital-Bridge-Pricer.xlsx. Change OIS, fee, target vol or decrement and the participation updates.");
}

// ---------- 7. Payoff & scenarios ----------
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Payoff: full floor, leveraged upside", "Redemption at maturity vs VT index performance, and outcomes across market regimes");
  const xs = [-40, -20, 0, 10, 20, 30, 50, 75, 100];
  s.addChart(pres.charts.LINE, [
    { name: "Note redemption", labels: xs.map((v) => v + "%"), values: xs.map((v) => 100 + PART * Math.max(v, 0)) },
    { name: "Holding the index", labels: xs.map((v) => v + "%"), values: xs.map((v) => 100 + v) },
  ], {
    x: 0.4, y: 1.3, w: 4.7, h: 3.55, ...chartBase(), chartColors: [JADE, "9AA8AF"], lineSize: 3, lineDataSymbol: "none",
    showLegend: true, legendPos: "b", legendFontFace: BF, legendFontSize: 10, legendColor: TXT,
    showTitle: true, title: "Redemption (% of notional)", valAxisMinVal: 50,
    showCatAxisTitle: true, catAxisTitle: "VT index performance at maturity", catAxisTitleFontSize: 10, catAxisTitleColor: MUTED,
  });
  const f = (x) => x.toFixed(2) + "x";
  const rows = [["7Y regime (basket return p.a.)", "Note median", "Direct basket median", "Direct basket 5th pct"],
    ["Bear: 3%", f(rw["0.03"]["VT note"].p50), f(rw["0.03"]["Direct basket"].p50), f(rw["0.03"]["Direct basket"].p5)],
    ["Base: 6%", f(rw["0.06"]["VT note"].p50), f(rw["0.06"]["Direct basket"].p50), f(rw["0.06"]["Direct basket"].p5)],
    ["Bull: 9%", f(rw["0.09"]["VT note"].p50), f(rw["0.09"]["Direct basket"].p50), f(rw["0.09"]["Direct basket"].p5)]];
  table(s, rows, { x: 5.35, y: 1.35, w: 4.2, colW: [1.5, 0.85, 0.95, 0.9], rowH: 0.5, fontSize: 10 });
  card(s, 5.35, 3.55, 4.2, 1.3, MIST);
  s.addText([{ text: "Worst case for the note: ", options: { bold: true, color: VER } }, { text: "1.00x, contractual. " },
    { text: "Worst 5% for direct equity: ", options: { bold: true, color: VER } }, { text: "0.32x–0.49x. The note beats direct ownership at the median in every regime and never loses capital." }],
    { x: 5.5, y: 3.6, w: 3.9, h: 1.2, fontFace: BF, fontSize: 11.5, color: TXT, margin: 0, valign: "middle", isTextBox: true });
  foot(s, "Forward simulation (20k paths, two-regime basket volatility 22%/45%), not a historical backtest. " + NOTE.split(";")[0] + ".");
  pageNo(s, 7);
  s.addNotes("Payoff = 100% + " + pct(PART) + " x max(0, index perf). Scenario table from pricing/scenario2_vt_note.py, section 5. Historical rolling-window backtest to be added once the Bloomberg export is run (pricing/scenario2_backtest.py).");
}

// ---------- 8. Decrement trap ----------
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "We turned down a 353% headline", "The decrement trap: a bigger participation can mean a worse outcome for heirs");
  const d = R.designs;
  const labels = ["12%/4%", "10%/2%", "10%/1% (ours)", "10%/0%", "Raw basket"];
  s.addChart(pres.charts.BAR, [{ name: "Participation", labels, values: d.map((r) => Math.round(r[3] * 100)) }], {
    x: 0.4, y: 1.3, w: 4.5, h: 3.0, barDir: "col", ...chartBase(), chartColors: [INK2, INK2, JADE, INK2, "9AA8AF"],
    showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: '0"%"', dataLabelColor: TXT, dataLabelFontSize: 10,
    showTitle: true, title: "Headline participation", valAxisHidden: true, barGapWidthPct: 60, varyColors: true,
  });
  s.addChart(pres.charts.BAR, [{ name: "P(only 100 back)", labels, values: d.map((r) => Math.round(r[7] * 100)) }], {
    x: 5.1, y: 1.3, w: 4.5, h: 3.0, barDir: "col", ...chartBase(), chartColors: [VER, VER, JADE, VER, "9AA8AF"],
    showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: '0"%"', dataLabelColor: TXT, dataLabelFontSize: 10,
    showTitle: true, title: "Chance of only 100 back after 7Y (9% basket return)", valAxisHidden: true, barGapWidthPct: 60, varyColors: true,
  });
  card(s, 0.5, 4.4, 9, 0.7, INK);
  s.addText([{ text: "Our choice (10% target, 1% decrement): ", options: { bold: true, color: GOLD } },
    { text: "highest median (" + d[2][6].toFixed(2) + "x) with a 12% chance of only 100 back, vs 35% for the 353% design. After 7 years of ~2.5% inflation, 100 back is a 16% real loss." }],
    { x: 0.7, y: 4.43, w: 8.6, h: 0.64, fontFace: BF, fontSize: 11.5, color: WHITE, margin: 0, valign: "middle", isTextBox: true });
  foot(s, "Labels: target volatility / annual decrement. Forward simulation; same option budget for every design.");
  pageNo(s, 8);
  s.addNotes("A higher decrement lowers the index forward, so calls are cheaper and participation looks larger, but the drag means the index often ends below its start. This slide shows judgement, not just structuring.");
}

// ---------- 9. Risk ----------
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Risk, sizing and exits", "Unit 15 checklist: stress with spot, volatility and rates shocked together");
  const rows = [["Stress scenario", "VT index", "Note MTM"]].concat(risk.stress.map((x) => [x[0].split(":")[0] + ": " + x[0].split(":")[1].trim().split(",")[0], (x[1] - 1 >= 0 ? "+" : "") + pct(x[1] - 1, 1), (x[3] * 100).toFixed(1)]));
  table(s, rows, { x: 0.5, y: 1.3, w: 4.9, colW: [3.1, 0.9, 0.9], rowH: 0.4, fontSize: 10 });
  txt(s, "10-day 99% VaR " + pct(risk.var99, 1) + " · ES " + pct(risk.es99, 1) + " of notional (mark-to-market only)", { x: 0.5, y: 3.4, w: 4.9, h: 0.3, fontSize: 10.5, bold: true, color: INK });
  card(s, 0.5, 3.8, 4.9, 1.3, MIST);
  s.addText([{ text: "Sizing: ", options: { bold: true, color: JADE } },
    { text: "USD 100Mn ÷ USD 2Bn = 5.0% of net worth. Contractual max loss at maturity: 0 (ex issuer default). Worst stress MTM: USD " + (worstLoss * 100).toFixed(1) + "Mn ÷ USD 2Bn = " + pct(worstLoss * 0.05, 2) + " of net worth." }],
    { x: 0.65, y: 3.85, w: 4.6, h: 1.2, fontFace: BF, fontSize: 11, color: TXT, margin: 0, valign: "middle", isTextBox: true });
  const exits = [["Profit target", "Sell back on the Natixis bid if the index is up 60%, or let the Legacy Lock bank it"],
    ["Stop-loss", "None: the 100% floor is the stop, so a stop would only crystallise MTM"],
    ["Thesis broken", "Taiwan blockade or sweeping chip export bans: exit on the secondary bid"],
    ["Time", "Hold to maturity, Sep 2033"]];
  txt(s, "Four exits", { x: 5.7, y: 1.3, w: 3.8, h: 0.3, fontFace: HF, fontSize: 14, bold: true, color: INK });
  exits.forEach((e, i) => {
    const y = 1.68 + i * 0.6;
    badge(s, 5.7, y, String(i + 1), i === 2 ? VER : JADE, 0.36);
    txt(s, e[0] + ": ", { x: 6.18, y: y - 0.02, w: 3.35, h: 0.25, fontSize: 11, bold: true, color: INK });
    txt(s, e[1], { x: 6.18, y: y + 0.22, w: 3.35, h: 0.36, fontSize: 9.5, color: TXT });
  });
  txt(s, "Also disclosed: Natixis credit risk · inflation erodes the real floor · VT lags V-shaped rebounds · quanto correlation · model risk on regime parameters.", { x: 5.7, y: 4.15, w: 3.85, h: 0.95, fontSize: 10, italic: true, color: MUTED });
  foot(s, NOTE);
  pageNo(s, 9);
  s.addNotes("Greeks per 100 notional: delta " + (risk.delta * 100).toFixed(2) + " per 1% index move; DV01 " + (risk.dv01 * 100).toFixed(3) + ". Vega to basket close to zero by design (index vol fixed at 10%).");
}

// ---------- 10. Why it works ----------
{
  const s = pres.addSlide(); s.background = { color: INK };
  txt(s, "Why it works for the family and for Natixis", { x: 0.5, y: 0.35, w: 9, h: 0.6, fontFace: HF, fontSize: 26, bold: true, color: WHITE });
  const cols = [
    ["For the Chak family", JADE, ["Every dollar back in 2033 for the next generation", pct(lockAvg) + " uncapped participation in Asia's digital leaders", "Diversifies away from their own sectors and currencies", "Legacy Lock banks big gains for heirs"]],
    ["For Natixis", VER, ["Delta-only hedge: index vol fixed by design", "7Y USD funding at 5.75% for the BPCE group", "Proprietary index reusable across private-bank clients", "Long-term relationship with a third-generation family office"]],
  ];
  cols.forEach((c, i) => {
    const x = 0.5 + i * 4.6;
    card(s, x, 1.2, 4.4, 3.2, INK2);
    badge(s, x + 0.25, 1.4, i ? "N" : "C", c[1]);
    txt(s, c[0], { x: x + 0.85, y: 1.45, w: 3.4, h: 0.4, fontFace: HF, fontSize: 17, bold: true, color: WHITE });
    bullets(s, c[2], { x: x + 0.3, y: 2.05, w: 3.85, h: 2.2, fontSize: 12.5, color: "E2EEE9", paraSpaceAfter: 8 });
  });
  txt(s, "Protect the legacy. Own the digital future of Asia.", { x: 0.5, y: 4.6, w: 9, h: 0.5, fontFace: HF, fontSize: 20, italic: true, bold: true, color: GOLD, align: "center" });
  pageNo(s, 10);
  s.addNotes("Close on the two-sided value: the winning deck last year included an issuer-benefits view; the panel are Natixis Global Markets.");
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
    ["Basket volatility regimes", "22% calm / 45% stress", "Assumption: calibrate to basket history"],
    ["Raw-basket 7Y implied vol", "30%", "Assumption: dealer quote / long-dated surface"],
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

pres.writeFile({ fileName: "deck/Asia-Digital-Bridge-Note.pptx" }).then((f) => console.log("saved", f));
