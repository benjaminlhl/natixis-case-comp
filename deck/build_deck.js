const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_16x9"; // 10 x 5.625
pres.title = "The K-Dislocation Note";

// Palette: Purple Magic
const P = "2A1650", P2 = "4B2E83", LAV = "EEE8F7", AMB = "E8A33D", TEAL = "1E9E8F", RED = "C8463D",
      INK = "1F1B2D", MUTED = "6B6680", WHITE = "FFFFFF", LINE = "D9D2E9";
const HF = "Cambria", BF = "Calibri";

const NOTE = "Illustrative prices from Monte Carlo with placeholder inputs; to be re-run with Bloomberg data as of 17 Sep 2026.";

function title(s, t, sub) {
  s.addText(t, { x: 0.5, y: 0.3, w: 9, h: 0.6, fontFace: HF, fontSize: 28, bold: true, color: P, margin: 0, isTextBox: true });
  if (sub) s.addText(sub, { x: 0.5, y: 0.88, w: 9, h: 0.35, fontFace: BF, fontSize: 13, italic: true, color: MUTED, margin: 0, isTextBox: true });
}
function pageNo(s, n) {
  s.addText(String(n), { x: 9.1, y: 5.2, w: 0.4, h: 0.3, fontFace: BF, fontSize: 9, color: MUTED, align: "right", margin: 0, isTextBox: true });
}
function foot(s, txt) {
  s.addText(txt, { x: 0.5, y: 5.2, w: 8.4, h: 0.3, fontFace: BF, fontSize: 8.5, italic: true, color: MUTED, margin: 0, isTextBox: true });
}
function badge(s, x, y, label, color) {
  s.addShape(pres.shapes.OVAL, { x, y, w: 0.5, h: 0.5, fill: { color } });
  s.addText(label, { x, y, w: 0.5, h: 0.5, fontFace: HF, fontSize: 16, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0, isTextBox: true });
}
function card(s, x, y, w, h, fill) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: fill || LAV }, rectRadius: 0.08, line: { color: fill || LAV } });
}
const chartBase = () => ({
  catAxisLabelColor: MUTED, valAxisLabelColor: MUTED, catAxisLabelFontFace: BF, valAxisLabelFontFace: BF,
  catAxisLabelFontSize: 10, valAxisLabelFontSize: 10, valGridLine: { color: "E6E1F0", size: 0.75 },
  catGridLine: { style: "none" }, showLegend: false, titleFontFace: BF, titleColor: INK, titleFontSize: 12,
});

// ---------- Title ----------
{
  const s = pres.addSlide(); s.background = { color: P };
  s.addShape(pres.shapes.OVAL, { x: 6.6, y: -1.2, w: 5, h: 5, fill: { color: P2 } });
  s.addShape(pres.shapes.OVAL, { x: 8.2, y: 3.4, w: 2.6, h: 2.6, fill: { color: AMB, transparency: 20 } });
  s.addText("Investment Strategy Challenge 2026 · Proposal for Purple Magic Capital", { x: 0.6, y: 1.0, w: 7, h: 0.4, fontFace: BF, fontSize: 13, color: "CFC3E8", margin: 0, isTextBox: true });
  s.addText("The K-Dislocation Note", { x: 0.6, y: 1.45, w: 6.4, h: 1.5, fontFace: HF, fontSize: 40, bold: true, color: WHITE, margin: 0, isTextBox: true });
  s.addText("Turning the Iran-war oil shock into Korea's buy-the-dip trigger, with a maximum loss known on day one", { x: 0.6, y: 3.05, w: 6.4, h: 0.9, fontFace: BF, fontSize: 17, italic: true, color: "E9E2F6", margin: 0, isTextBox: true });
  s.addText("KRW 135bn · 18-month note · 90% capital protected · Trade date 17 Sep 2026", { x: 0.6, y: 4.5, w: 7.5, h: 0.4, fontFace: BF, fontSize: 12, color: AMB, bold: true, margin: 0, isTextBox: true });
  s.addNotes("Title. One-line pitch: the oil shock is Korea's biggest macro risk; we make it the trigger that buys the dislocation, with the next loss capped at a known number.");
}

// ---------- Executive summary (not counted) ----------
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Executive summary", "One note, three catalyst engines, one known maximum loss");
  const stats = [["10%", "Maximum loss", "KRW ~13.5bn, known on day one: 90% capital protection"], ["~14%", "Option budget", "Spent on three engines tied to oil, KRW and Korean equity catalysts"], ["2 of 3", "Regimes that pay", "Pays in an oil shock and in a peace/re-rating; loses only in stagnation"]];
  stats.forEach((st, i) => {
    const x = 0.5 + i * 3.05;
    card(s, x, 1.45, 2.85, 2.35);
    s.addText(st[0], { x: x + 0.25, y: 1.6, w: 2.4, h: 0.9, fontFace: HF, fontSize: 44, bold: true, color: i === 1 ? AMB : P2, margin: 0, isTextBox: true });
    s.addText(st[1], { x: x + 0.25, y: 2.5, w: 2.4, h: 0.35, fontFace: BF, fontSize: 15, bold: true, color: INK, margin: 0, isTextBox: true });
    s.addText(st[2], { x: x + 0.25, y: 2.9, w: 2.4, h: 0.8, fontFace: BF, fontSize: 12, color: MUTED, margin: 0, isTextBox: true });
  });
  s.addText([
    { text: "We recommend ", options: {} },
    { text: "an 18-month, 90% capital-protected KRW note", options: { bold: true, color: P2 } },
    { text: " on Brent, KOSPI 200 and USD/KRW to express our view that the Iran-war oil shock will dislocate Korean assets, and that structural inflows and reforms will drive the recovery. ", options: {} },
    { text: "Target redemption: 114–141% in oil-shock regimes, 109.5% in a ceasefire. Maximum loss: 10% (KRW 13.5bn ≈ 10 bp of AUM), contractual.", options: { bold: true } },
  ], { x: 0.5, y: 3.95, w: 9, h: 1.15, fontFace: BF, fontSize: 12.5, color: INK, margin: 0, valign: "top", isTextBox: true });
  s.addNotes("Executive summary (does not count toward the 10-slide limit).");
}

// ---------- 1. Client diagnosis ----------
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Purple Magic needs asymmetry and trust", "Client diagnosis: a sophisticated fund redeploying after a USD 30M loss");
  const cols = [
    ["Who they are", ["Korea-based hedge fund, USD 10bn AUM", "Macro and event-driven strategies", "Prefers customised, exotic structures"]],
    ["What they want", ["Redeploy KRW 135bn (~USD 95–100M)", "Capture emerging macro catalysts", "Profit from dislocations and regulatory shifts"]],
    ["What they need", ["A defined, known maximum loss", "Transparent pricing and Greeks", "Clear unwind terms and secondary market"]],
  ];
  cols.forEach((c, i) => {
    const x = 0.5 + i * 3.05;
    card(s, x, 1.5, 2.85, 3.0, i === 2 ? P : LAV);
    badge(s, x + 0.25, 1.7, String(i + 1), i === 2 ? AMB : P2);
    s.addText(c[0], { x: x + 0.25, y: 2.3, w: 2.4, h: 0.4, fontFace: HF, fontSize: 16, bold: true, color: i === 2 ? WHITE : P, margin: 0, isTextBox: true });
    s.addText(c[1].map((t, j) => ({ text: t, options: { bullet: true, breakLine: j < c[1].length - 1 } })),
      { x: x + 0.2, y: 2.75, w: 2.5, h: 1.6, fontFace: BF, fontSize: 12.5, color: i === 2 ? "EDE7F7" : INK, paraSpaceAfter: 6, valign: "top", margin: 0, isTextBox: true });
  });
  s.addText("Design brief: convex payoffs on Korea-specific catalysts, with a capped and disclosed downside.", { x: 0.5, y: 4.7, w: 9, h: 0.4, fontFace: BF, fontSize: 13, bold: true, italic: true, color: P2, margin: 0, isTextBox: true });
  pageNo(s, 1);
  s.addNotes("The USD 30M loss ended a relationship. Our edge is pairing exotic payoffs with transparency: known max loss, Greeks, unwind terms.");
}

// ---------- 2. Market view ----------
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Five catalysts, one dislocation trade", "Market view as of 17 Sep 2026 (status of each to be confirmed on Bloomberg)");
  const cats = [
    ["Oil shock from the Iran war", "Korea imports almost all its oil: trade balance, inflation and KRW are exposed", AMB, "A"],
    ["AI memory cycle", "Samsung and SK Hynix are a large share of KOSPI and exports", P2, "C"],
    ["Value-up reforms / MSCI watch", "Governance reform and possible upgrade can re-rate Korean equities", P2, "C"],
    ["WGBI index inclusion", "Index-driven buying of Korean government bonds supports KRW", TEAL, "B"],
    ["Fed vs BoK divergence", "Drives USD/KRW and the Korea–US yield gap", TEAL, "B"],
  ];
  cats.forEach((c, i) => {
    const y = 1.4 + i * 0.73;
    s.addShape(pres.shapes.OVAL, { x: 0.5, y: y + 0.05, w: 0.45, h: 0.45, fill: { color: c[2] } });
    s.addText(String(i + 1), { x: 0.5, y: y + 0.05, w: 0.45, h: 0.45, fontFace: HF, fontSize: 14, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0, isTextBox: true });
    s.addText(c[0], { x: 1.15, y, w: 3.0, h: 0.55, fontFace: BF, fontSize: 14, bold: true, color: INK, valign: "middle", margin: 0, isTextBox: true });
    s.addText(c[1], { x: 4.15, y, w: 4.2, h: 0.55, fontFace: BF, fontSize: 12, color: MUTED, valign: "middle", margin: 0, isTextBox: true });
    card(s, 8.5, y + 0.07, 1.0, 0.42, LAV);
    s.addText("Engine " + c[3], { x: 8.5, y: y + 0.07, w: 1.0, h: 0.42, fontFace: BF, fontSize: 11, bold: true, color: P2, align: "center", valign: "middle", margin: 0, isTextBox: true });
  });
  pageNo(s, 2);
  s.addNotes("Each catalyst maps to one engine of the note. Confirm current status (WGBI phase-in, MSCI review outcome, oil levels) with Bloomberg as of trade date.");
}

// ---------- 3. Architecture ----------
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "One note, three engines", "How KRW 135bn is allocated inside an 18-month, 90% protected note");
  // stacked bar of note (left)
  const segs = [["Zero-coupon bond (90% protection)", 84.5, P], ["Natixis margin", 1.5, MUTED], ["A  Oil-shock dip buyer", 5, AMB], ["B  Decoupling dual digital", 3, TEAL], ["C  Re-rating call spread", 6, P2]];
  let y = 1.45; const H = 3.6;
  // Show ZCB compressed visually: scale ZCB to 45% of height, options expanded for legibility
  const vis = [1.55, 0.3, 0.7, 0.45, 0.6];
  segs.forEach((g, i) => {
    const h = vis[i];
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y, w: 1.6, h, fill: { color: g[2] }, line: { color: WHITE, width: 1.5 } });
    s.addText(g[1] + "%", { x: 0.6, y, w: 1.6, h, fontFace: BF, fontSize: 12, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0, isTextBox: true });
    s.addText(g[0], { x: 2.35, y, w: 2.4, h, fontFace: BF, fontSize: 11.5, color: INK, valign: "middle", margin: 0, isTextBox: true });
    y += h;
  });
  // engines cards (right)
  const eng = [
    ["A", "Oil-shock dip buyer", "Brent ≥125% (first 12M) switches on a KOSPI 200 call struck on the trigger day, ~120% participation", AMB],
    ["B", "Decoupling dual digital", "Pays ~9x if Brent ≥110% AND USD/KRW ≤97% at maturity", TEAL],
    ["C", "Re-rating call spread", "~65% participation in KOSPI 200 from 100% to 130%", P2],
  ];
  eng.forEach((e, i) => {
    const yy = 1.45 + i * 1.2;
    card(s, 5.0, yy, 4.5, 1.05, LAV);
    badge(s, 5.2, yy + 0.27, e[0], e[3]);
    s.addText(e[1], { x: 5.9, y: yy + 0.1, w: 3.45, h: 0.35, fontFace: HF, fontSize: 14, bold: true, color: P, margin: 0, isTextBox: true });
    s.addText(e[2], { x: 5.9, y: yy + 0.45, w: 3.45, h: 0.55, fontFace: BF, fontSize: 11, color: INK, margin: 0, isTextBox: true });
  });
  foot(s, "Issuer: Natixis. KRW-denominated, funded at the USD grid rate and swapped to KRW via cross-currency swap. " + "Bar not to scale; budget split illustrative.");
  pageNo(s, 3);
  s.addNotes("Architecture: ZCB delivers 90% at maturity; the ~14% option budget is split A 5%, B 3%, C 6%.");
}

// ---------- 4. Engine A ----------
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Engine A: the oil shock buys the dip", "Brent-triggered KOSPI 200 call with strike reset");
  const rows = [["Trigger", "Brent daily close ≥ 125% of initial, any day in months 1–12"], ["On trigger", "KOSPI 200 call starts, strike = KOSPI level on trigger day"], ["Participation", "~120% of KOSPI gain from trigger to maturity"], ["Maturity", "18 months"], ["Budget", "5% of notional"], ["Cost vs vanilla", "~4.1% per 100% participation, ~35–40% of an 18M ATM call"]];
  s.addTable(rows.map((r) => [{ text: r[0], options: { bold: true, color: P } }, { text: r[1], options: { color: INK } }]),
    { x: 0.5, y: 1.4, w: 4.6, colW: [1.35, 3.25], fontFace: BF, fontSize: 11, border: { type: "solid", pt: 0.5, color: LINE }, fill: { color: WHITE }, rowH: 0.5, valign: "middle" });
  const xs = [-30, -20, -10, 0, 10, 20, 30, 40];
  s.addChart(pres.charts.LINE, [{ name: "Engine A payout", labels: xs.map((v) => v + "%"), values: xs.map((v) => 1.2 * Math.max(v, 0)) }], {
    x: 5.3, y: 1.3, w: 4.3, h: 3.0, ...chartBase(), chartColors: [AMB], lineSize: 3, lineDataSymbol: "circle", lineDataSymbolSize: 6,
    showTitle: true, title: "Payout (% notional) vs KOSPI move after trigger", catAxisTitle: "KOSPI at maturity vs trigger level", showCatAxisTitle: true, catAxisTitleFontSize: 10, catAxisTitleColor: MUTED,
  });
  card(s, 5.3, 4.4, 4.3, 0.7, LAV);
  s.addText("Why it's cheap: the call only exists if the shock happens (~44% trigger probability at 35% Brent vol), and its strike is reset to the dislocated level.", { x: 5.45, y: 4.43, w: 4.05, h: 0.64, fontFace: BF, fontSize: 10.5, color: INK, margin: 0, valign: "middle", isTextBox: true });
  foot(s, NOTE);
  pageNo(s, 4);
  s.addNotes("Engine A converts the main macro risk into the entry signal. Variants to test: strike set 1 month after trigger; 120% trigger.");
}

// ---------- 5. Engine B ----------
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Engine B: KRW decouples from oil", "Dual digital: Brent ≥ 110% AND USD/KRW ≤ 97% at maturity");
  s.addChart(pres.charts.BAR, [{ name: "Payout multiple", labels: ["+0.1", "+0.3", "+0.5"], values: [7.2, 9.0, 12.4] }], {
    x: 0.5, y: 1.35, w: 4.6, h: 3.3, barDir: "col", ...chartBase(), chartColors: [TEAL], showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: '0.0"x"', dataLabelColor: INK, dataLabelFontSize: 11,
    showTitle: true, title: "Payout multiple vs corr(Brent, USD/KRW)", valAxisHidden: true, barGapWidthPct: 80,
  });
  const pts = [
    ["The view", "WGBI bond inflows and chip exports keep KRW strong even if oil rises"],
    ["Why it's cheap", "Joint event goes against the usual oil–KRW link: the more positive the correlation, the cheaper the digital"],
    ["Skew check", "USD/KRW risk reversals favour USD calls, so the KRW-strength leg is the cheap wing (Unit 4)"],
    ["Max loss", "Premium only: 3% of notional"],
  ];
  pts.forEach((p, i) => {
    const y = 1.4 + i * 0.83;
    s.addText(p[0], { x: 5.4, y, w: 4.1, h: 0.3, fontFace: HF, fontSize: 13.5, bold: true, color: P, margin: 0, isTextBox: true });
    s.addText(p[1], { x: 5.4, y: y + 0.3, w: 4.1, h: 0.5, fontFace: BF, fontSize: 11.5, color: INK, margin: 0, isTextBox: true });
  });
  foot(s, NOTE + " Measure realised correlation (1Y, 3Y) before fixing strikes.");
  pageNo(s, 5);
  s.addNotes("At a 3% budget and ~9x payout, B returns ~27% of notional if both conditions are met. Correlation is the main pricing driver.");
}

// ---------- 6. Engine C ----------
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Engine C: owning the ceasefire", "KOSPI 200 100/130 call spread, ~65% participation");
  const xs = [-20, -10, 0, 10, 20, 30, 40, 50];
  s.addChart(pres.charts.LINE, [{ name: "Engine C payout", labels: xs.map((v) => v + "%"), values: xs.map((v) => +(0.65 * Math.min(Math.max(v, 0), 30)).toFixed(1)) }], {
    x: 0.5, y: 1.3, w: 4.6, h: 3.4, ...chartBase(), chartColors: [P2], lineSize: 3, lineDataSymbol: "circle", lineDataSymbolSize: 6,
    showTitle: true, title: "Payout (% notional) vs KOSPI 200 return at maturity",
  });
  s.addText("Skew-aware pricing", { x: 5.4, y: 1.4, w: 4.1, h: 0.35, fontFace: HF, fontSize: 15, bold: true, color: P, margin: 0, isTextBox: true });
  const st = [["9.2%", "Cost with skew"], ["8.1%", "Cost at flat vol"]];
  st.forEach((v, i) => {
    const x = 5.4 + i * 2.1;
    card(s, x, 1.85, 1.95, 1.25, i === 0 ? P : LAV);
    s.addText(v[0], { x, y: 1.92, w: 1.95, h: 0.7, fontFace: HF, fontSize: 30, bold: true, color: i === 0 ? WHITE : P2, align: "center", margin: 0, isTextBox: true });
    s.addText(v[1], { x, y: 2.62, w: 1.95, h: 0.35, fontFace: BF, fontSize: 11, color: i === 0 ? "E9E2F6" : MUTED, align: "center", margin: 0, isTextBox: true });
  });
  s.addText([
    { text: "The 130% call we sell sits at lower implied vol, so it earns less than flat vol suggests (Unit 4, slide 7).", options: { bullet: true, breakLine: true } },
    { text: "Budget 6% buys ~65% participation; maximum gain +19.5% of notional.", options: { bullet: true, breakLine: true } },
    { text: "Pays in the peace scenario, when Engines A and B are idle.", options: { bullet: true } },
  ], { x: 5.4, y: 3.3, w: 4.1, h: 1.6, fontFace: BF, fontSize: 11.5, color: INK, paraSpaceAfter: 6, margin: 0, valign: "top", isTextBox: true });
  foot(s, NOTE);
  pageNo(s, 6);
  s.addNotes("Engine C is the hedge of the book's thesis: it pays when the oil shock does not happen and Korea re-rates.");
}

// ---------- 7. Pricing & funding ----------
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Pricing: funding grid to option budget", "USD funding interpolated to 18M and swapped into KRW");
  const steps = [["5.04%", "USD funding, 18M", "Linear interpolation: 1Y 4.78%, 2Y 5.30%"], ["~4–5%", "KRW-equivalent", "After USD/KRW cross-currency swap (verify basis)"], ["84–85%", "Cost of 90% ZCB", "90 × discount factor at KRW-equivalent rate"], ["~14%", "Option budget", "After ~1.5% Natixis margin"]];
  steps.forEach((t, i) => {
    const x = 0.5 + i * 2.3;
    card(s, x, 1.4, 2.1, 1.65, i === 3 ? P : LAV);
    s.addText(t[0], { x: x + 0.1, y: 1.5, w: 1.9, h: 0.6, fontFace: HF, fontSize: 26, bold: true, color: i === 3 ? AMB : P2, align: "center", margin: 0, isTextBox: true });
    s.addText(t[1], { x: x + 0.1, y: 2.1, w: 1.9, h: 0.3, fontFace: BF, fontSize: 12, bold: true, color: i === 3 ? WHITE : INK, align: "center", margin: 0, isTextBox: true });
    s.addText(t[2], { x: x + 0.1, y: 2.42, w: 1.9, h: 0.55, fontFace: BF, fontSize: 9.5, color: i === 3 ? "E9E2F6" : MUTED, align: "center", margin: 0, isTextBox: true });
    if (i < 3) s.addText("›", { x: x + 2.08, y: 1.95, w: 0.25, h: 0.5, fontFace: BF, fontSize: 22, bold: true, color: P2, align: "center", margin: 0, isTextBox: true });
  });
  s.addText("Protection dial: the fund chooses its risk", { x: 0.5, y: 3.25, w: 9, h: 0.35, fontFace: HF, fontSize: 14, bold: true, color: P, margin: 0, isTextBox: true });
  const hdr = ["Protection", "Budget", "A participation", "B payout", "C participation", "Max loss"].map((t) => ({ text: t, options: { bold: true, color: WHITE, fill: { color: P2 } } }));
  s.addTable([hdr,
    ["90% (recommended)", "~14%", "~120%", "~27%", "~65%", "10% (~KRW 13.5bn)"].map((t, i) => ({ text: t, options: { bold: i === 0, color: INK, fill: { color: LAV } } })),
    ["80% (aggressive)", "~24%", "~220%", "~45%", "~110%", "20%"].map((t, i) => ({ text: t, options: { bold: i === 0, color: INK } })),
  ], { x: 0.5, y: 3.65, w: 9, colW: [1.8, 1.0, 1.5, 1.2, 1.5, 2.0], fontFace: BF, fontSize: 11, border: { type: "solid", pt: 0.5, color: LINE }, rowH: 0.36, valign: "middle", align: "center" });
  foot(s, NOTE);
  pageNo(s, 7);
  s.addNotes("KRW is not in the funding grid: footnote 1 lets us swap. KRW-equivalent funding is lower than the USD rate; show the formula and the Bloomberg CCS input.");
}

// ---------- 8. Scenario map ----------
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Wins in war and peace, not stagnation", "Note redemption at 18 months, 90% protection case");
  s.addChart(pres.charts.BAR, [{ name: "Redemption", labels: ["Oil shock + rebound", "Oil shock + KRW strong", "Ceasefire, KOSPI +30%", "Stagnation"], values: [114, 141, 109.5, 90] }], {
    x: 0.5, y: 1.3, w: 5.2, h: 3.75, barDir: "col", ...chartBase(), chartColors: [AMB, TEAL, P2, RED], showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: '0.0"%"', dataLabelColor: INK, dataLabelFontSize: 11,
    valAxisMinVal: 60, valAxisMaxVal: 150, valAxisHidden: true, barGapWidthPct: 60, catAxisLabelFontSize: 9.5,
  });
  const sc = [["Base: oil shock, KOSPI +20% from trigger", "A pays 24%", AMB], ["Best: oil shock, KRW resilient, rebound", "A + B pay 51%", TEAL], ["Alternative: ceasefire and re-rating", "C pays 19.5%", P2], ["Worst: flat, or no rebound after shock", "Capped at −10% at maturity", RED]];
  sc.forEach((r, i) => {
    const y = 1.45 + i * 0.88;
    s.addShape(pres.shapes.OVAL, { x: 6.0, y: y + 0.12, w: 0.3, h: 0.3, fill: { color: r[2] } });
    s.addText(r[0], { x: 6.45, y, w: 3.1, h: 0.3, fontFace: BF, fontSize: 12, bold: true, color: INK, margin: 0, isTextBox: true });
    s.addText(r[1], { x: 6.45, y: y + 0.3, w: 3.1, h: 0.3, fontFace: BF, fontSize: 11.5, color: MUTED, margin: 0, isTextBox: true });
  });
  foot(s, "Illustrative outcomes using budget split on slide 3. Redemption = 90% + engine payouts.");
  pageNo(s, 8);
  s.addNotes("Key message: payoffs in two very different regimes, and the bad regime has a known floor.");
}

// ---------- 9. Sizing & market risk ----------
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Sizing and market risk", "Unit 15 sizing identity, VaR / ES, and stress tests with spot and vol shocked together");
  // Sizing card
  card(s, 0.5, 1.4, 3.0, 3.65, P);
  s.addText("Sizing identity", { x: 0.7, y: 1.5, w: 2.6, h: 0.35, fontFace: HF, fontSize: 14, bold: true, color: AMB, margin: 0, isTextBox: true });
  s.addText([
    { text: "Risk budget: 25 bp of USD 10bn AUM", options: { breakLine: true } },
    { text: "= USD 25M", options: { bold: true, breakLine: true } },
    { text: "Loss per unit: 10% of notional", options: { breakLine: true } },
    { text: "(contractual, held to maturity)", options: { italic: true, breakLine: true } },
    { text: "Max notional = 25M ÷ 10%", options: { breakLine: true } },
    { text: "= USD 250M", options: { bold: true } },
  ], { x: 0.7, y: 1.9, w: 2.6, h: 1.7, fontFace: BF, fontSize: 11.5, color: WHITE, margin: 0, valign: "top", isTextBox: true });
  s.addText("Proposed KRW 135bn ≈ USD 97M uses 39% of the budget. Max loss ≈ USD 9.7M = 10 bp of AUM, a third of the USD 30M lost with the previous manager.", { x: 0.7, y: 3.65, w: 2.6, h: 1.3, fontFace: BF, fontSize: 10.5, color: "E9E2F6", margin: 0, valign: "top", isTextBox: true });
  // VaR / Greeks
  s.addText("VaR and Greeks (% notional)", { x: 3.75, y: 1.4, w: 2.75, h: 0.3, fontFace: HF, fontSize: 12, bold: true, color: P, margin: 0, isTextBox: true });
  const gk = [["Fair value at issue", "98.1%"], ["10-day 99% VaR (delta-normal)", "5.6%"], ["Expected shortfall 99%", "6.4%"], ["Delta Brent / +1%", "+0.33"], ["Delta KOSPI 200 / +1%", "+0.26"], ["Delta USD/KRW / +1%", "−0.30"], ["Vega KOSPI / +1 vol pt", "+0.36"], ["Worst MTM before maturity", "~84%"]];
  s.addTable(gk.map((r, i) => [{ text: r[0], options: { color: INK, fill: { color: i % 2 ? WHITE : LAV } } }, { text: r[1], options: { bold: true, color: P2, align: "right", fill: { color: i % 2 ? WHITE : LAV } } }]),
    { x: 3.75, y: 1.75, w: 2.65, colW: [1.95, 0.7], fontFace: BF, fontSize: 9.5, border: { type: "solid", pt: 0.5, color: LINE }, rowH: 0.36, valign: "middle" });
  // Stress
  s.addText("Instant stress: MTM change", { x: 6.65, y: 1.4, w: 2.85, h: 0.3, fontFace: HF, fontSize: 12.5, bold: true, color: P, margin: 0, isTextBox: true });
  const st = [["Risk-off", "KOSPI −20%, KRW −5%, vols +10 pts, rates +50 bp", "−0.3 pts", INK], ["Oil shock", "Brent +30%, KOSPI −10%, vols +8 pts", "+13.0 pts", TEAL], ["Ceasefire", "Brent −20%, KOSPI +10%, vols −3 pts", "−2.9 pts", RED]];
  st.forEach((r, i) => {
    const y = 1.75 + i * 0.95;
    card(s, 6.65, y, 2.85, 0.82, LAV);
    s.addText(r[0], { x: 6.8, y: y + 0.07, w: 1.5, h: 0.3, fontFace: BF, fontSize: 12, bold: true, color: INK, margin: 0, isTextBox: true });
    s.addText(r[2], { x: 8.2, y: y + 0.07, w: 1.2, h: 0.3, fontFace: BF, fontSize: 12, bold: true, color: r[3], align: "right", margin: 0, isTextBox: true });
    s.addText(r[1], { x: 6.8, y: y + 0.38, w: 2.6, h: 0.4, fontFace: BF, fontSize: 9.5, color: MUTED, margin: 0, isTextBox: true });
  });
  s.addText("Long vega cushions the risk-off case: higher vol lifts Engine A.", { x: 6.65, y: 4.62, w: 2.85, h: 0.45, fontFace: BF, fontSize: 9.5, italic: true, color: P2, margin: 0, isTextBox: true });
  foot(s, "Placeholder inputs; USD/KRW ≈ 1,390 assumed. Delta-normal VaR overstates risk for a convex note; early exit can be below the 90% floor.");
  pageNo(s, 9);
  s.addNotes("Unit 15: size off the contractual loss, show the division. VaR with all three parameters (10-day, 99%, delta-normal) plus ES. Stress moves spot and vol together. Script: pricing/risk_metrics.py.");
}

// ---------- 10. Risk register & exits ----------
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Risk register and exit plan", "Every risk named, and four exits defined in advance");
  const hdr = ["Risk", "Assessment and mitigant"].map((t) => ({ text: t, options: { bold: true, color: WHITE, fill: { color: P } } }));
  const rows = [
    ["Model", "Correlation and skew drive B and C. Price with surface vols; show correlation sensitivity"],
    ["Liquidity", "OTC note: ~1.9% margin in, ~1% bid/offer out. Hedges trade in deep KOSPI 200, Brent and USD/KRW markets"],
    ["Counterparty", "Natixis issuer risk: disclose rating and CDS. ISDA/CSA for the OTC hedges"],
    ["Operational", "Daily Brent trigger monitoring, independent fixing source, monthly MTM report"],
    ["KRW mechanics", "CCS basis and offshore non-deliverability: settlement terms agreed up front"],
  ];
  s.addTable([hdr, ...rows.map((r, i) => r.map((t, j) => ({ text: t, options: { bold: j === 0, color: INK, fill: { color: i % 2 ? WHITE : LAV } } })))],
    { x: 0.5, y: 1.4, w: 4.9, colW: [1.25, 3.65], fontFace: BF, fontSize: 9.5, border: { type: "solid", pt: 0.5, color: LINE }, rowH: 0.6, valign: "middle" });
  const ex = [
    ["1", "Profit target", "Sell back to Natixis when MTM ≥ 115% (net of ~1% bid/offer)"],
    ["2", "Thesis invalidation", "Exit if WGBI flows reverse and MSCI drops Korea from review, even if P&L is positive"],
    ["3", "Time stop", "Month 12: Engine A's trigger window closes. Hold or sell back on B and C value"],
    ["4", "No stop-loss as risk control", "Max loss is contractual (Unit 15). Any stop triggers on Brent/KOSPI levels, not note price"],
  ];
  ex.forEach((e, i) => {
    const y = 1.4 + i * 0.93;
    badge(s, 5.7, y + 0.05, e[0], i === 3 ? RED : AMB);
    s.addText(e[1], { x: 6.35, y, w: 3.15, h: 0.3, fontFace: BF, fontSize: 12.5, bold: true, color: P, margin: 0, isTextBox: true });
    s.addText(e[2], { x: 6.35, y: y + 0.3, w: 3.15, h: 0.55, fontFace: BF, fontSize: 10.5, color: INK, margin: 0, isTextBox: true });
  });
  pageNo(s, 10);
  s.addNotes("Unit 15: all four exits. On a long-convexity note a stop-loss does not limit loss; the max loss is already contractual. Thesis invalidation is the most professional exit.");
}

// ---------- Appendix ----------
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Appendix: terms and methodology", "Not counted toward the 10-slide limit");
  const terms = [["Issuer", "Natixis"], ["Notional", "KRW 135bn"], ["Trade / issue date", "17 Sep 2026"], ["Maturity", "18 months"], ["Capital protection", "90% at maturity"], ["Underlyings", "Brent (CO1 Comdty), KOSPI 200 (KOSPI2 Index), USD/KRW (KRW Curncy)"], ["Funding", "USD grid 18M 5.04%, swapped to KRW via CCS"]];
  s.addTable(terms.map((r) => [{ text: r[0], options: { bold: true, color: P } }, { text: r[1], options: { color: INK } }]),
    { x: 0.5, y: 1.4, w: 4.6, colW: [1.55, 3.05], fontFace: BF, fontSize: 10.5, border: { type: "solid", pt: 0.5, color: LINE }, rowH: 0.45, valign: "middle" });
  s.addText("Methodology", { x: 5.4, y: 1.4, w: 4.1, h: 0.35, fontFace: HF, fontSize: 14, bold: true, color: P, margin: 0, isTextBox: true });
  s.addText([
    { text: "Monte Carlo, 200k paths, daily steps, correlated GBM for Brent, KOSPI 200 and USD/KRW", options: { bullet: true, breakLine: true } },
    { text: "Placeholder inputs: vols 35% / 22% / 9%; KRW 2.5%, USD 3.75%; KOSPI dividend 1.8%", options: { bullet: true, breakLine: true } },
    { text: "Engine C priced with skew (130% strike at lower IV)", options: { bullet: true, breakLine: true } },
    { text: "To finalise: Bloomberg OVDV surfaces, 25-delta risk reversals, realised correlations, CCS basis, local-vol pricing for barriers", options: { bullet: true, breakLine: true } },
    { text: "Considered and rejected: Korea Value-Up Index as Engine C underlying. Hedge liquidity is far thinner than KOSPI 200 (evidence OI and volume as of 17 Sep 2026)", options: { bullet: true, breakLine: true } },
    { text: "Next steps: agree protection level and weights with the PM; indicative term sheet in 48 hours; final pricing on trade date", options: { bullet: true } },
  ], { x: 5.4, y: 1.8, w: 4.1, h: 3.6, fontFace: BF, fontSize: 10, color: INK, paraSpaceAfter: 4, margin: 0, valign: "top", isTextBox: true });
  s.addNotes("Appendix. Scripts: pricing/illustrative_mc.py and pricing/risk_metrics.py.");
}

pres.writeFile({ fileName: process.argv[2] }).then((f) => console.log("wrote", f));
