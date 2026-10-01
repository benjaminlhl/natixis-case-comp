// Scenario 2 deck: the Asia AI Hardware Barbell (NKE Private Wealth): growth note + 10% Phoenix.
// Numbers come from pricing/scenario2_results.json and scenario2_barbell_results.json; placeholder market inputs.
// Run: node deck/build_deck_scenario2.js   (from the repo root)
const pptxgen = require("pptxgenjs");
const R = require("../pricing/scenario2_results.json");
const pres = new pptxgen();
pres.layout = "LAYOUT_16x9"; // 10 x 5.625
pres.title = "The Asia AI Hardware Barbell";

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


// ===== Barbell data (pricing/scenario2_barbell.py) =====
const BB = require("../pricing/scenario2_barbell_results.json");
const PHX = BB.phoenix, PT = BB.terms, PF = BB.portfolio;
const PROD = lockAvg;                       // growth note participation with Legacy Lock + averaging
const AG = Math.round(BB.alloc[0] * 100), AP = Math.round(BB.alloc[1] * 100);   // 60 / 40
const phxWorst = Math.min(...BB.phx_stress.map((x) => x[1]));
const gWorst = Math.min(...risk.stress.map((x) => x[3]));
const comboStressMn = (risk.v0 - gWorst) * AG + (PHX.value - phxWorst) * AP;     // USD Mn
const b6 = PF["0.06"];

// ---------- Cover ----------
{
  const s = pres.addSlide(); s.background = { color: INK };
  s.addShape(pres.shapes.OVAL, { x: 6.5, y: -1.3, w: 5.2, h: 5.2, fill: { color: INK2 } });
  s.addShape(pres.shapes.OVAL, { x: 8.3, y: 3.3, w: 2.6, h: 2.6, fill: { color: JADE, transparency: 15 } });
  s.addShape(pres.shapes.OVAL, { x: 7.6, y: 3.0, w: 0.7, h: 0.7, fill: { color: VER } });
  txt(s, "Investment Strategy Challenge 2026 · Proposal for NKE Private Wealth", { x: 0.6, y: 1.0, w: 7, h: 0.4, fontSize: 13, color: "BFD8CF" });
  txt(s, "The Asia AI Hardware Barbell", { x: 0.6, y: 1.45, w: 6.6, h: 1.5, fontFace: HF, fontSize: 40, bold: true, color: WHITE });
  txt(s, "Protect the legacy, earn 10% income, own the hardware of Asia's AI era", { x: 0.6, y: 3.0, w: 6.4, h: 0.9, fontSize: 17, italic: true, color: "E2EEE9" });
  txt(s, "USD 100Mn · USD " + AG + "Mn protected growth note + USD " + AP + "Mn 10% Phoenix note · Trade date 17 Sep 2026", { x: 0.6, y: 4.5, w: 7.5, h: 0.4, fontSize: 12, bold: true, color: GOLD });
  s.addNotes("Title. Two Natixis notes on Asian AI hardware: one protects and grows, one pays income.");
}

// ---------- Executive summary (not counted) ----------
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Executive summary", "A barbell: one note protects and grows, one note pays income");
  const stats = [[AG + "%", "Capital protected", "USD " + AG + "Mn back in 2033 whatever markets do (issuer credit)"],
                 ["10%", "Income on USD " + AP + "Mn", "Paid quarterly while the basket is above 60%; USD " + (AP * 0.1).toFixed(0) + "Mn a year"],
                 [pct(PROD), "Upside participation", "Uncapped, on a 10% vol-target index of 13 Asian AI-hardware leaders"]];
  stats.forEach((st, i) => {
    const x = 0.5 + i * 3.05;
    card(s, x, 1.4, 2.85, 2.35);
    txt(s, st[0], { x: x + 0.25, y: 1.55, w: 2.4, h: 0.85, fontFace: HF, fontSize: 40, bold: true, color: i === 1 ? VER : i === 2 ? JADE : INK });
    txt(s, st[1], { x: x + 0.25, y: 2.42, w: 2.4, h: 0.35, fontSize: 15, bold: true });
    txt(s, st[2], { x: x + 0.25, y: 2.82, w: 2.4, h: 0.85, fontSize: 11.5, color: MUTED });
  });
  s.addText([
    { text: "We recommend " },
    { text: "USD " + AG + "Mn in a 7Y 100%-protected growth note and USD " + AP + "Mn in a 5Y 10% Phoenix autocall", options: { bold: true, color: JADE } },
    { text: ", both issued by Natixis on Asian AI hardware, to express our view that AI investment is shifting to physical hardware while geopolitics and inflation argue for protection. " },
    { text: "Simulated 7Y median " + x2(b6["Barbell 60/40"].p50) + " (6% basket return) with a " + pct(b6["Barbell 60/40"].p_below) + " chance of ending below 100. Contractual floor: " + AG + "% of capital.", options: { bold: true } },
  ], { x: 0.5, y: 3.95, w: 9, h: 1.15, fontFace: BF, fontSize: 12.5, color: TXT, margin: 0, valign: "top", isTextBox: true });
  foot(s, NOTE);
  s.addNotes("Executive summary (does not count toward the 10-slide limit). Unit 15: thesis, instruments, expected return, maximum loss.");
}

// ---------- 1. Client profile ----------
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Client profile: protect the legacy, then grow", "NKE Private Wealth, single-family office of the Chak family (third generation)");
  card(s, 0.5, 1.35, 2.9, 3.0, INK);
  txt(s, "Client", { x: 0.7, y: 1.5, w: 2.5, h: 0.35, fontFace: HF, fontSize: 15, bold: true, color: GOLD });
  bullets(s, ["Single-family office, Chak family", "Net worth > USD 2Bn", "Businesses: tech infrastructure, renewables, real estate", "Japan and Greater China", "Patriarch now focused on allocation and legacy"],
    { x: 0.7, y: 1.9, w: 2.55, h: 2.4, fontSize: 11, color: "E2EEE9" });
  txt(s, "Goals", { x: 3.65, y: 1.35, w: 2.9, h: 0.35, fontFace: HF, fontSize: 15, bold: true, color: INK });
  const goals = [["1", "Capital appreciation", "Grow wealth for future generations"], ["2", "Asia's digital transformation", "Exposure to the sectors driving it, bridging traditional and new"], ["3", "Downside managed", "Appropriate for generational wealth preservation"]];
  goals.forEach((g, i) => {
    const y = 1.8 + i * 0.85;
    badge(s, 3.65, y, g[0], i === 2 ? VER : JADE, 0.4);
    txt(s, g[1], { x: 4.15, y: y - 0.02, w: 2.4, h: 0.28, fontSize: 12, bold: true, color: INK });
    txt(s, g[2], { x: 4.15, y: y + 0.27, w: 2.4, h: 0.5, fontSize: 10.5, color: MUTED });
  });
  card(s, 6.8, 1.35, 2.7, 3.0, MIST);
  txt(s, "Risk tolerance: Moderate", { x: 6.95, y: 1.5, w: 2.45, h: 0.35, fontFace: HF, fontSize: 13.5, bold: true, color: JADE });
  txt(s, "Key assumptions", { x: 6.95, y: 1.9, w: 2.45, h: 0.3, fontSize: 11.5, bold: true, color: INK });
  bullets(s, ["Mandate: USD 100Mn (5% of net worth)", "5–7 year horizon; limited early exit accepted", "Regular cash flow welcome for next-generation distributions", "USD base; open to Natixis structured notes"],
    { x: 6.95, y: 2.25, w: 2.45, h: 2.05, fontSize: 10.5 });
  card(s, 0.5, 4.5, 9, 0.6, "FBEDE9");
  s.addText([{ text: "Hidden risk: ", options: { bold: true, color: VER } },
    { text: "the family already owns Asian infrastructure, renewables and property. We give them the AI hardware layer and exclude what they already own." }],
    { x: 0.7, y: 4.52, w: 8.6, h: 0.56, fontFace: BF, fontSize: 11.5, color: TXT, margin: 0, valign: "middle", isTextBox: true });
  pageNo(s, 1);
  s.addNotes("Template: client profile, goals, risk tolerance, key assumptions. The cash-flow assumption justifies the income sleeve; confirm it with the investment committee.");
}

// ---------- 2. Outlook ----------
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Outlook: volatile macro, AI shifts to hardware", "Macro, geopolitical and sector view (figures to be sourced on Bloomberg / Natixis research as of 17 Sep 2026)");
  const cols = [
    ["Geopolitics and elections", INK2, ["US midterms (Nov 2026) and the 2028 race keep trade policy uncertain", "US–China tech restrictions and tariffs hit cross-border families", "Capital rotates to supply-chain security and reshoring"]],
    ["Middle East, oil, inflation", VER, ["US–Iran conflict and Strait of Hormuz risk drive oil volatility", "Sticky core inflation keeps long-end yields high", "Rewards real pricing power; penalises cash-burning growth"]],
    ["AI pivots to hardware", JADE, ["High-multiple AI software de-rates on higher discount rates", "Capex shifts decisively to chips, HBM memory, equipment, servers", "Asia (Taiwan, Korea, Japan) supplies that hardware"]],
  ];
  cols.forEach((c, i) => {
    const x = 0.5 + i * 3.05;
    card(s, x, 1.35, 2.85, 2.95, MIST);
    s.addShape(pres.shapes.OVAL, { x: x + 0.18, y: 1.52, w: 0.3, h: 0.3, fill: { color: c[1] } });
    txt(s, c[0], { x: x + 0.58, y: 1.47, w: 2.2, h: 0.42, fontFace: HF, fontSize: 13, bold: true, color: INK, valign: "middle" });
    bullets(s, c[2], { x: x + 0.18, y: 2.02, w: 2.55, h: 2.2, fontSize: 10.5 });
  });
  card(s, 0.5, 4.45, 9, 0.65, INK);
  txt(s, "Therefore: own Asia's AI hardware, with protection for the legacy and income while we wait.", { x: 0.7, y: 4.45, w: 8.6, h: 0.65, fontFace: HF, fontSize: 13.5, bold: true, color: WHITE, valign: "middle" });
  pageNo(s, 2);
  s.addNotes("Template: investment outlook. Add sourced data points: long-end UST yield level, Natixis strategist survey on inflation risk, hyperscaler capex, TSMC/HBM market shares. Note: the 2026 midterms, not a 2027 election.");
}

// ---------- 3. Thesis ----------
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Investment thesis: traditional strategies fall short", "Simulated 7-year outcomes at a 6% p.a. basket return: median and worst 5%");
  const lab = ["Direct equity", "7Y Treasury", "Growth note only", "Our barbell"];
  const med = [b6["Direct basket"].p50, BB.ust_multiple, b6["Growth note only"].p50, b6["Barbell 60/40"].p50];
  const p5 = [b6["Direct basket"].p5, BB.ust_multiple, b6["Growth note only"].p5, b6["Barbell 60/40"].p5];
  s.addChart(pres.charts.BAR, [{ name: "Median", labels: lab, values: med.map((v) => +v.toFixed(2)) }, { name: "Worst 5%", labels: lab, values: p5.map((v) => +v.toFixed(2)) }], {
    x: 0.4, y: 1.3, w: 4.7, h: 3.75, barDir: "col", barGrouping: "clustered", ...chartBase(), chartColors: [JADE, VER],
    showLegend: true, legendPos: "b", legendFontFace: BF, legendFontSize: 10, legendColor: TXT,
    showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: '0.00"x"', dataLabelColor: TXT, dataLabelFontSize: 9,
    showTitle: true, title: "Multiple of capital after 7 years", valAxisHidden: true, barGapWidthPct: 60,
  });
  const imp = [
    ["Equities alone: no floor", pct(b6["Direct basket"].p_below) + " chance of losing money; worst 5% keep " + x2(b6["Direct basket"].p5)],
    ["Bonds alone: no growth", "A 7Y Treasury locks ~" + x2(BB.ust_multiple) + " with no link to the AI build-out"],
    ["One autocall alone: capped", "10% coupons, but capital at risk and no upside beyond the coupon"],
    ["Our answer: a barbell", AG + "% floor + " + pct(PROD) + " upside, with " + AP + "% earning 10% income"],
  ];
  imp.forEach((t, i) => {
    const y = 1.35 + i * 0.93, last = i === 3;
    if (last) card(s, 5.3, y - 0.08, 4.25, 0.9, MIST);
    badge(s, 5.4, y, String(i + 1), last ? JADE : VER, 0.36);
    txt(s, t[0], { x: 5.9, y: y - 0.03, w: 3.55, h: 0.28, fontSize: 12, bold: true, color: last ? JADE : INK });
    txt(s, t[1], { x: 5.9, y: y + 0.26, w: 3.55, h: 0.5, fontSize: 10.5 });
  });
  foot(s, "Forward simulation (12k paths, one-factor two-regime model), not a historical backtest. Treasury proxy = funding less ~100bp.");
  pageNo(s, 3);
  s.addNotes("Template: traditional strategies fall short, then implications. The growth note alone has the best floor; the barbell trades a little floor for regular income.");
}

// ---------- 4. Solution overview ----------
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "The Asia AI Hardware Barbell", "Two Natixis notes, one theme: protect and grow with " + AG + "%, earn income with " + AP + "%");
  const sleeves = [
    ["A", "Preserve and grow", "USD " + AG + "Mn · Asia Digital Bridge Note", JADE,
      ["7 years, 100% capital protected", pct(PROD) + " uncapped participation", "10% vol-target index of 13 AI-hardware names", "Legacy Lock banks gains at +30/60/90%"]],
    ["B", "Earn income", "USD " + AP + "Mn · AI Hardware Phoenix", VER,
      ["5 years, autocallable", "10% p.a. coupon, paid quarterly (60% barrier, memory)", "Basket: TSMC · SK Hynix · Tokyo Electron", "Capital at risk only below 50% at maturity"]],
  ];
  sleeves.forEach((sl, i) => {
    const x = 0.5 + i * 3.1;
    card(s, x, 1.35, 2.95, 3.0, i ? "FBEDE9" : MIST);
    badge(s, x + 0.2, 1.5, sl[0], sl[3]);
    txt(s, sl[1], { x: x + 0.8, y: 1.5, w: 2.05, h: 0.46, fontFace: HF, fontSize: 15, bold: true, color: INK, valign: "middle" });
    txt(s, sl[2], { x: x + 0.2, y: 2.05, w: 2.6, h: 0.3, fontSize: 10.5, bold: true, color: sl[3] });
    bullets(s, sl[4], { x: x + 0.2, y: 2.42, w: 2.6, h: 1.85, fontSize: 10.5 });
  });
  card(s, 6.75, 1.35, 2.8, 3.0, INK);
  txt(s, "Combined", { x: 6.95, y: 1.48, w: 2.4, h: 0.35, fontFace: HF, fontSize: 15, bold: true, color: GOLD });
  const kp = [[AG + "%", "contractual floor"], ["USD " + (AP * 0.1).toFixed(0) + "Mn", "income a year if paid"], [x2(b6["Barbell 60/40"].p50), "median at 7Y (6% case)"], [pct(b6["Barbell 60/40"].p_below), "chance below 100"]];
  kp.forEach((k, i) => {
    const y = 1.9 + i * 0.6;
    txt(s, k[0], { x: 6.95, y, w: 1.15, h: 0.45, fontFace: HF, fontSize: 17, bold: true, color: WHITE, valign: "middle" });
    txt(s, k[1], { x: 8.1, y, w: 1.4, h: 0.45, fontSize: 10, color: "D8E8E2", valign: "middle" });
  });
  txt(s, "Both sleeves are USD quanto (no FX risk) and exclude data centres, telecom towers, renewables and property, which the family already owns.", { x: 0.5, y: 4.5, w: 9, h: 0.55, fontSize: 10.5, italic: true, color: MUTED });
  foot(s, NOTE);
  pageNo(s, 4);
  s.addNotes("Template: product overview. The barbell answers both objectives: Sleeve A preserves and grows, Sleeve B funds distributions to the next generation.");
}

// ---------- 5. Sleeve A ----------
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Sleeve A: Asia Digital Bridge growth note", "USD " + AG + "Mn · 7Y · 100% protected · " + pct(PROD) + " participation");
  const rows = [["Term", "Proposal"], ["Underlying", "10% vol-target index on 13 equal-weight AI-hardware stocks"],
    ["Index rule", "Exposure = 10% ÷ max(20d, 60d) vol, cap 150%; 1% p.a. decrement"],
    ["Redemption", "100% + " + pct(PROD) + " × max(0, index perf, locked gain)"], ["Final level", "Average of the last 12 monthly closes"],
    ["Legacy Lock", "Gains floored at +30/60/90% once hit on an annual date"], ["Dates", "17 Sep 2026 to Sep 2033"]];
  table(s, rows, { x: 0.5, y: 1.3, w: 5.0, colW: [1.25, 3.75], rowH: 0.44, fontSize: 10 });
  const steps = [["7Y USD funding (rules grid)", "5.75%"], ["Zero-coupon bond (floor)", pct(ZCB, 1)], ["Issuer fee", "2.0%"], ["Option budget", pct(BUDGET, 1)], ["Participation", pct(PROD)]];
  txt(s, "Pricing build-up", { x: 5.8, y: 1.3, w: 3.75, h: 0.3, fontFace: HF, fontSize: 14, bold: true, color: INK });
  steps.forEach((st, i) => {
    const y = 1.68 + i * 0.47, last = i === steps.length - 1;
    card(s, 5.8, y, 3.75, 0.4, last ? JADE : MIST);
    txt(s, st[0], { x: 5.95, y, w: 2.6, h: 0.4, fontSize: 10.5, valign: "middle", color: last ? WHITE : TXT, bold: last });
    txt(s, st[1], { x: 8.45, y, w: 1.0, h: 0.4, fontSize: 12, valign: "middle", align: "right", bold: true, color: last ? WHITE : INK });
  });
  card(s, 0.5, 4.5, 9, 0.6, INK);
  s.addText([{ text: "Why a vol-target index: ", options: { bold: true, color: GOLD } },
    { text: "its volatility is fixed at 10%, so Natixis hedges with delta only and the option is cheap. Exposure falls from ~" + Math.round(1000 / VOLC) + "% to ~" + Math.round(1000 / VOLS) + "% in a crash (appendix D)." }],
    { x: 0.7, y: 4.52, w: 8.6, h: 0.56, fontFace: BF, fontSize: 11, color: WHITE, margin: 0, valign: "middle", isTextBox: true });
  foot(s, NOTE);
  pageNo(s, 5);
  s.addNotes("Template: key terms. Live formulas in pricing/Asia-Digital-Bridge-Pricer.xlsx (Pricer tab). Constituents: TSMC, MediaTek, SK Hynix, Samsung, Tokyo Electron, Advantest, Disco, Shin-Etsu, ASE, Ibiden, Hon Hai, Quanta, Delta.");
}

// ---------- 6. Sleeve B ----------
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Sleeve B: how the Phoenix pays 10%", "USD " + AP + "Mn · 5Y autocall on TSMC, SK Hynix and Tokyo Electron (equal weight, USD quanto)");
  const rows = [["Term", "Proposal"], ["Coupon", "2.5% a quarter if basket ≥ 60%; missed coupons paid later (memory)"],
    ["Autocall", "Quarterly if basket ≥ 100%, trigger steps down 5% a year"], ["Capital", "100% back unless basket < 50% at maturity; then basket level"],
    ["Expected life", PHX.life.toFixed(1) + " years (" + pct(PHX.call_by_year[0]) + " called in year 1)"], ["P(capital loss)", pct(PHX.p_loss) + "; expected loss " + pct(PHX.exp_loss, 1)]];
  table(s, rows, { x: 0.5, y: 1.3, w: 4.9, colW: [1.25, 3.65], rowH: 0.46, fontSize: 10 });
  txt(s, "Where the coupon comes from", { x: 5.7, y: 1.3, w: 3.85, h: 0.3, fontFace: HF, fontSize: 14, bold: true, color: INK });
  const steps = [["1", "Interest", "Natixis pays its 5.69% USD funding rate on the cash"], ["2", "Put sold", "Client sells a 50% barrier put on the basket (worth " + pct(PHX.pv_put, 1) + " of notional)"],
                 ["3", "Upside given up", "Return is capped at the coupons"], ["4", "Early call", "Calls in good markets shorten the life, so fewer coupons are owed"]];
  steps.forEach((st, i) => {
    const y = 1.72 + i * 0.6;
    badge(s, 5.7, y, st[0], i === 1 ? VER : JADE, 0.36);
    txt(s, st[1], { x: 6.18, y: y - 0.02, w: 3.35, h: 0.25, fontSize: 11, bold: true, color: INK });
    txt(s, st[2], { x: 6.18, y: y + 0.22, w: 3.35, h: 0.36, fontSize: 9.5 });
  });
  card(s, 0.5, 4.2, 9, 0.9, MIST);
  s.addText([{ text: "Value check: ", options: { bold: true, color: JADE } },
    { text: "coupons " + pct(PHX.pv_cpn, 1) + " + principal " + pct(PHX.pv_princ, 1) + " − put " + pct(PHX.pv_put, 1) + " = " + pct(PHX.value, 1) + "; Natixis keeps " + pct(PHX.margin, 1) + ". " },
    { text: "Is it a covered call? ", options: { bold: true, color: VER } }, { text: "Economically close: bond + short put = stock + short call. The barrier gives conditional protection." }],
    { x: 0.7, y: 4.22, w: 8.6, h: 0.86, fontFace: BF, fontSize: 10.5, color: TXT, margin: 0, valign: "middle", isTextBox: true });
  foot(s, "Monte Carlo, 40k paths, cash flows discounted at the Natixis 5Y USD funding rate. " + NOTE.split(";")[0] + ".");
  pageNo(s, 6);
  s.addNotes("We rejected worst-of structures: at 10% they needed 30–45% barriers and still had 9–41% loss probabilities. An equal-weight basket of three gets 10% at a 50% barrier with ~9% loss probability. Phoenix tab in the Excel pricer.");
}

// ---------- 7. Payoffs & scenarios ----------
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Payoffs and scenarios", "Sleeve A redemption vs index; Sleeve B cash flows in four scenarios");
  const xs = [-40, -20, 0, 20, 40, 60, 80, 100];
  s.addChart(pres.charts.LINE, [
    { name: "Sleeve A redemption", labels: xs.map((v) => v + "%"), values: xs.map((v) => +(100 + PROD * Math.max(v, 0)).toFixed(1)) },
    { name: "Holding the index", labels: xs.map((v) => v + "%"), values: xs.map((v) => 100 + v) },
  ], {
    x: 0.4, y: 1.3, w: 4.5, h: 3.8, ...chartBase(), chartColors: [JADE, "9AA8AF"], lineSize: 3, lineDataSymbol: "none",
    showLegend: true, legendPos: "b", legendFontFace: BF, legendFontSize: 10, legendColor: TXT,
    showTitle: true, title: "Sleeve A payoff (% of notional)", valAxisMinVal: 50,
    showCatAxisTitle: true, catAxisTitle: "VT index performance at maturity", catAxisTitleFontSize: 10, catAxisTitleColor: MUTED,
  });
  const sc = [["Called at Q1 (basket ≥ 100%)", 1, 1.0], ["Called in year 2 (basket 96%, trigger 95%)", 8, 1.0],
              ["Never called; basket 70% at maturity", 20, 1.0], ["Basket 45% at maturity; coupons stop after year 2", 8, 0.45]];
  const rows = [["Sleeve B scenario", "Coupons", "Total cash"]].concat(sc.map((r) => [r[0], (r[1] * 2.5).toFixed(1) + "%", (r[2] * 100 + r[1] * 2.5).toFixed(1) + "%"]));
  table(s, rows, { x: 5.1, y: 1.3, w: 4.45, colW: [2.65, 0.8, 1.0], rowH: 0.5, fontSize: 10 });
  card(s, 5.1, 3.95, 4.45, 1.15, "FBEDE9");
  s.addText([{ text: "Combined worst case: ", options: { bold: true, color: VER } },
    { text: "Sleeve A returns USD " + AG + "Mn in 2033; Sleeve B only loses if the basket is below 50% at maturity (" + pct(PHX.p_loss) + " chance), after any coupons already paid." }],
    { x: 5.25, y: 4.0, w: 4.15, h: 1.05, fontFace: BF, fontSize: 10.5, color: TXT, margin: 0, valign: "middle", isTextBox: true });
  foot(s, "Sleeve A participation " + pct(PROD) + " (with Legacy Lock and 12M averaging). Coupons: 2.5% per quarter.");
  pageNo(s, 7);
  s.addNotes("Template: scenario analysis and payoff diagram. Sleeve A example with the Lock: index hits +60% in year 4 and ends +20% -> " + (100 + PROD * 60).toFixed(0) + "%.");
}

// ---------- 8. Back-testing ----------
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Back-testing: how the barbell behaves", "12,000 simulated 7-year paths per regime; historical windows to be added from Bloomberg (2005–2026)");
  const regs = [["0.03", "Bear (3%)"], ["0.06", "Base (6%)"], ["0.09", "Bull (9%)"]];
  s.addChart(pres.charts.BAR, [
    { name: "Barbell", labels: regs.map((r) => r[1]), values: regs.map((r) => Math.round(PF[r[0]]["Barbell 60/40"].p_below * 100)) },
    { name: "Direct equity", labels: regs.map((r) => r[1]), values: regs.map((r) => Math.round(PF[r[0]]["Direct basket"].p_below * 100)) },
  ], {
    x: 0.4, y: 1.3, w: 4.5, h: 3.3, barDir: "col", barGrouping: "clustered", ...chartBase(), chartColors: [JADE, "9AA8AF"],
    showLegend: true, legendPos: "b", legendFontFace: BF, legendFontSize: 10, legendColor: TXT,
    showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: '0"%"', dataLabelColor: TXT, dataLabelFontSize: 10,
    showTitle: true, title: "Chance of ending below 100 after 7 years", valAxisHidden: true, barGapWidthPct: 60,
  });
  const rows = [["7Y multiple", "Bear", "Base", "Bull"]];
  [["Barbell median", "Barbell 60/40", "p50"], ["Barbell worst 5%", "Barbell 60/40", "p5"], ["Growth note median", "Growth note only", "p50"], ["Direct equity median", "Direct basket", "p50"]].forEach((r) =>
    rows.push([r[0]].concat(regs.map((g) => x2(PF[g[0]][r[1]][r[2]])))));
  table(s, rows, { x: 5.15, y: 1.35, w: 4.4, colW: [1.7, 0.9, 0.9, 0.9], rowH: 0.4, fontSize: 10 });
  bullets(s, ["Phoenix: " + pct(PHX.call_by_year[0]) + " called in year 1, " + pct(PHX.call_by_year[4]) + " by year 5; cash reinvested at 3.75%",
              "The barbell's worst 5% stays near or above " + x2(PF["0.03"]["Barbell 60/40"].p5) + "; direct equity's falls to " + x2(PF["0.03"]["Direct basket"].p5),
              "Same simulated paths drive both sleeves, so correlation between them is captured"],
    { x: 5.15, y: 3.5, w: 4.4, h: 1.6, fontSize: 10 });
  foot(s, "One-factor model: market vol " + 26 + "%/" + 48 + "% (calm/stress), idiosyncratic 28%. Forward simulation, not a historical backtest.");
  pageNo(s, 8);
  s.addNotes("Template: back-testing. Run pricing/scenario2_backtest.py on the Bloomberg export for historical rolling 7Y windows. Rolling the Phoenix into a new issue after each call would raise income versus the cash assumption.");
}

// ---------- 9. Risks & hedging ----------
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Key risk factors and hedging", "Unit 15 checklist: stress, sizing and exits");
  const rows = [["Risk", "What could happen", "Mitigation / hedge"],
    ["Credit", "Natixis default", "BPCE guarantee; 5% of net worth only"],
    ["Phoenix barrier", pct(PHX.p_loss) + " chance basket < 50% at maturity", "Basket of 3, European barrier, coupons kept"],
    ["Market (MTM)", "Combined stress: −USD " + comboStressMn.toFixed(1) + "Mn", "Sleeve A floor; vol target cuts exposure"],
    ["Reinvestment", pct(PHX.call_by_year[0]) + " of Phoenix calls in year 1", "Roll into a new Phoenix at prevailing terms"],
    ["Concentration", "Taiwan 6 of 13 names; chip cycle", "Equal weights; three layers of the chain"],
    ["FX / inflation", "Asian FX moves; real value of floor", "USD quanto; Lock and coupons"]];
  table(s, rows, { x: 0.5, y: 1.3, w: 5.6, colW: [1.2, 2.25, 2.15], rowH: 0.42, fontSize: 9.5 });
  card(s, 6.35, 1.3, 3.2, 1.7, MIST);
  s.addText([{ text: "Sizing\n", options: { bold: true, color: JADE, fontSize: 12 } },
    { text: "USD 100Mn ÷ USD 2Bn = 5.0% of net worth. Contractual max loss: USD " + AP + "Mn (Phoenix basket to zero) = " + (AP / 20).toFixed(1) + "% of net worth. Combined stress MTM: USD " + comboStressMn.toFixed(1) + "Mn = " + pct(comboStressMn / 2000, 2) + "." }],
    { x: 6.5, y: 1.36, w: 2.95, h: 1.58, fontFace: BF, fontSize: 10, color: TXT, margin: 0, valign: "top", isTextBox: true });
  txt(s, "Four exits", { x: 6.35, y: 3.12, w: 3.2, h: 0.28, fontFace: HF, fontSize: 12.5, bold: true, color: INK });
  bullets(s, ["Profit: Phoenix autocalls; Sleeve A Lock banks gains", "Stop-loss: none on A (floor); B exits on the issuer bid", "Thesis broken: Taiwan blockade or chip export bans", "Time: B by 2031, A by Sep 2033"],
    { x: 6.35, y: 3.45, w: 3.2, h: 1.65, fontSize: 10 });
  foot(s, "Stress: AI hardware crash (stocks −30%, vol up) on both sleeves at once. Sleeve A: 10-day 99% VaR " + pct(risk.var99, 1) + "; details in appendix B.");
  pageNo(s, 9);
  s.addNotes("Template: key risk factors with hedging. Phoenix stress MTM: crash " + pct(phxWorst, 1) + "; Sleeve A crash " + (gWorst * 100).toFixed(1) + ".");
}

// ---------- 10. Summary ----------
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Summary: value for the client and for Natixis", "Advantages, risks and how each side is protected");
  const hdr = ["", "Chak family (client)", "Natixis (issuer)"];
  const rows = [
    ["Advantages", AG + "% floor for the heirs · 10% income on " + AP + "% · " + pct(PROD) + " uncapped upside in Asia's AI hardware · no doubling-up",
                   "Two issues at 5.69–5.75% USD funding · proprietary index · recurring Phoenix rolls · family-office relationship"],
    ["Risks", "Phoenix capital at risk below 50% · Natixis credit · lock-up · reinvestment after calls",
              "Vol-target gap risk · Phoenix correlation and dividend risk · long-dated rates"],
    ["Hedging", "Barbell split · equal weights · USD quanto · Legacy Lock",
                "Delta-hedge both notes · correlation reserve · swap fixed-rate funding"]];
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
  txt(s, "Protect the legacy. Earn while you wait. Own the hardware of Asia's AI era.", { x: 0.5, y: 4.92, w: 8.5, h: 0.3, fontFace: HF, fontSize: 13, italic: true, bold: true, color: JADE, align: "center" });
  pageNo(s, 10);
  s.addNotes("Template: summary with client and issuer views.");
}

// ---------- Appendix A: digital assets ----------
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Appendix A: adding a digital-asset sleeve", "Options considered if the family wants direct exposure to digital assets");
  const rows = [["Variant (Sleeve A)", "Underlying", "Participation", "Assessment"],
    ["Core (recommended)", "Asia Digital Bridge VT index", pct(PART), "Best fit for a legacy mandate"],
    ["80/20 static sleeve", "80% VT index + 20% spot Bitcoin ETF (IBIT US)", "~130%", "Possible add-on: crypto adds ~11pt of vol"],
    ["Best-of", "Better of VT index or Bitcoin ETF", "~40–45%", "Rejected: Bitcoin vol (50–60%) makes it too expensive"]];
  table(s, rows, { x: 0.5, y: 1.35, w: 9, colW: [1.8, 3.0, 1.3, 2.9], rowH: 0.55, fontSize: 11 });
  bullets(s, ["IBIT US is a US-listed spot Bitcoin ETF with daily volume well above the USD 5M rule (confirm on Bloomberg)",
    "Why not in the core: drawdowns of 70%+ in past cycles and no earnings anchor; hard to defend for generational wealth",
    "If included, keep it in the 80/20 form so protection and most of the participation are preserved"],
    { x: 0.5, y: 3.75, w: 9, h: 1.3, fontSize: 11.5 });
  foot(s, "Indicative Monte Carlo: Bitcoin vol 50–60%, correlation 0.2–0.4 with the VT index, same option budget, base participation shown.");
  s.addNotes("Appendix (not counted).");
}

// ---------- Appendix B: methodology ----------
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Appendix B: methodology and assumptions", "All inputs are placeholders to be refreshed with Bloomberg data as of 17 Sep 2026");
  const rows = [["Input", "Value used", "Source / to refresh"],
    ["USD funding 5Y / 7Y", "5.69% / 5.75%", "2026 rules funding grid"],
    ["USD OIS (option drift)", "3.75%", "Assumption: Bloomberg USSO curve"],
    ["Market factor vol", "26% calm / 48% stress", "Assumption: calibrate to history"],
    ["Idiosyncratic vol", "28%", "Assumption: single-name vols ~38–55%"],
    ["Dividends / quanto", "1.5% / −0.2% p.a.", "Assumption"],
    ["Issuer margin", "2.0% (A) / " + pct(PHX.margin, 1) + " (B)", "Model output / assumption"]];
  table(s, rows, { x: 0.5, y: 1.3, w: 5.4, colW: [1.7, 1.6, 2.1], rowH: 0.42, fontSize: 9.5 });
  txt(s, "Models", { x: 6.2, y: 1.3, w: 3.3, h: 0.3, fontFace: HF, fontSize: 14, bold: true, color: INK });
  bullets(s, ["Sleeve A: daily Monte Carlo, VT index rebuilt each day with lag and cap; Lock and averaging on the same paths",
    "Sleeve B: quarterly-observed autocall, coupons with memory, cash flows discounted at Natixis funding",
    "Portfolio: both sleeves on the same paths; Phoenix cash reinvested at cash",
    "Stress: spot and vol shocked together; VaR 10-day 99% delta-normal"],
    { x: 6.2, y: 1.7, w: 3.35, h: 3.3, fontSize: 10.5 });
  foot(s, "Code: pricing/scenario2_vt_note.py · scenario2_barbell.py · scenario2_backtest.py · Asia-Digital-Bridge-Pricer.xlsx");
  s.addNotes("Appendix (not counted).");
}

// ---------- Appendix C: sources ----------
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Appendix C: sources", "Data and frameworks behind this proposal");
  bullets(s, ["Natixis, Investment Strategy Challenge 2026 game rules: client brief (Scenario 2), eligibility rules, USD funding grid",
    "E. Lam, FINA4370A Unit 15, CUHK Business School (Aug 2026): trading proposal framework, sizing, exits, liquidity evidence",
    "Natixis research and strategist surveys (to cite for the outlook data points)",
    "Bloomberg (to be pulled as of 17 Sep 2026): constituent prices, market caps, volumes, USD OIS curve, implied volatility",
    "Company filings of the constituents (AI revenue exposure, capacity plans)",
    "Team models: pricing/scenario2_vt_note.py, scenario2_barbell.py, scenario2_backtest.py, Asia-Digital-Bridge-Pricer.xlsx"],
    { x: 0.5, y: 1.35, w: 9, h: 3.7, fontSize: 12, paraSpaceAfter: 10 });
  s.addNotes("Appendix (not counted).");
}

// ---------- Appendix D: VT index and decrement choice ----------
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Appendix D: the vol-target index and its design", "Exposure falls as volatility rises; a high decrement inflates the headline but hurts heirs");
  const vols = [8, 10, 15, 20, 25, 30, 35, 40, 45, 50];
  s.addChart(pres.charts.LINE, [{ name: "Equity exposure", labels: vols.map((v) => v + "%"), values: vols.map((v) => Math.round(Math.min(10 / v, 1.5) * 100)) }], {
    x: 0.4, y: 1.3, w: 4.5, h: 3.6, ...chartBase(), chartColors: [JADE], lineSize: 3, lineDataSymbol: "circle", lineDataSymbolSize: 5,
    showTitle: true, title: "Equity exposure (%) vs basket volatility", valAxisMinVal: 0, valAxisMaxVal: 160,
  });
  const d = R.designs;
  const labels = ["12%/4%", "10%/2%", "10%/1% (ours)", "10%/0%", "Raw basket"];
  s.addChart(pres.charts.BAR, [{ name: "P(only 100 back)", labels, values: d.map((r) => Math.round(r[7] * 100)) }], {
    x: 5.1, y: 1.3, w: 4.5, h: 3.6, barDir: "col", ...chartBase(), chartColors: [VER, VER, JADE, VER, "9AA8AF"],
    showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: '0"%"', dataLabelColor: TXT, dataLabelFontSize: 10,
    showTitle: true, title: "Chance of only 100 back (9% return)", valAxisHidden: true, barGapWidthPct: 60, varyColors: true,
  });
  foot(s, "Participation: " + d.map((r, i) => labels[i].replace(" (ours)", "") + " " + pct(r[3])).join(" · ") + ". Labels: target vol / decrement.");
  s.addNotes("Appendix (not counted). We turned down a " + pct(d[0][3]) + " headline because it returns only 100 in " + pct(d[0][7]) + " of paths.");
}

pres.writeFile({ fileName: "deck/Asia-AI-Hardware-Barbell.pptx" }).then((f) => console.log("saved", f));
