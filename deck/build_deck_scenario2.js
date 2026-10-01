// Scenario 2 deck: The Asia Digital Bridge Legacy Note (NKE Private Wealth / Chak family)
// Build:  python3 pricing/scenario2/analysis.py   (writes results.json)
//         NODE_PATH=<dir with pptxgenjs, react, react-dom, react-icons, sharp> node deck/build_deck_scenario2.js
const path = require("path");
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const Fa = require("react-icons/fa");

const R = require(path.join(__dirname, "..", "pricing", "scenario2", "results.json"));

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9"; // 10 x 5.625
pres.title = "The Asia Digital Bridge Legacy Note";

// Palette: deep ink (legacy), jade (growth / digital), gold (locked-in gains)
const NAVY = "0E2238", NAVY2 = "1C3A5A", JADE = "1F8A70", JADE2 = "5FB49C", MIST = "E8F3EF", GOLD = "C99A2E",
      GOLDL = "F6ECD3", INK = "1A2230", MUTED = "5E6B78", LINE = "D3E0DB", RED = "B5473A", WHITE = "FFFFFF", GREY = "9AA5AF";
const HF = "Cambria", BF = "Calibri";

const pct = (x, d = 0) => (100 * x).toFixed(d) + "%";
const P = R.pricing, S = R.simulation, K = R.risk, SZ = R.sizing;
const PART = pct(P.participation_quoted);
const MODEL_NOTE = "Indicative Monte Carlo pricing with placeholder market inputs (pricing/scenario2/model.py); to be refreshed with Bloomberg data as of 17 Sep 2026.";

async function icon(Comp, color, px = 256) {
  const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(Comp, { color: "#" + color, size: px }));
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}

function title(s, t, sub) {
  s.addText(t, { x: 0.45, y: 0.25, w: 9.1, h: 0.55, fontFace: HF, fontSize: 21, bold: true, color: NAVY, margin: 0, valign: "middle", fit: "shrink", isTextBox: true });
  if (sub) s.addText(sub, { x: 0.45, y: 0.8, w: 9.1, h: 0.32, fontFace: BF, fontSize: 12, italic: true, color: JADE, margin: 0, isTextBox: true });
}
function pageNo(s, n) {
  s.addText(String(n), { x: 9.15, y: 5.28, w: 0.4, h: 0.25, fontFace: BF, fontSize: 9, color: MUTED, align: "right", margin: 0, isTextBox: true });
}
function foot(s, txt) {
  s.addText(txt, { x: 0.45, y: 5.28, w: 8.6, h: 0.25, fontFace: BF, fontSize: 7.5, italic: true, color: MUTED, margin: 0, valign: "middle", isTextBox: true });
}
function card(s, x, y, w, h, fill, line) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: fill || MIST }, rectRadius: 0.06, line: { color: line || fill || MIST, width: line ? 1 : 0.5 } });
}
function badge(s, x, y, label, color, d = 0.42, fs = 13) {
  s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color } });
  s.addText(label, { x, y, w: d, h: d, fontFace: HF, fontSize: fs, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0, isTextBox: true });
}
function iconDot(s, img, x, y, d, bg) {
  s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: bg } });
  const p = d * 0.25;
  s.addImage({ data: img, x: x + p, y: y + p, w: d - 2 * p, h: d - 2 * p });
}
const T = (text, o = {}) => ({ text, options: o });
const chartBase = () => ({
  catAxisLabelColor: MUTED, valAxisLabelColor: MUTED, catAxisLabelFontFace: BF, valAxisLabelFontFace: BF,
  catAxisLabelFontSize: 9, valAxisLabelFontSize: 9, valGridLine: { color: "E3EAE7", size: 0.5 },
  catGridLine: { style: "none" }, showLegend: false, titleFontFace: BF, titleColor: INK, titleFontSize: 11,
  catAxisLineColor: LINE, valAxisLineShow: false,
});

(async () => {
  const ic = {
    landmark: await icon(Fa.FaLandmark, WHITE), seed: await icon(Fa.FaSeedling, WHITE), chip: await icon(Fa.FaMicrochip, WHITE),
    bridge: await icon(Fa.FaArchway, WHITE), shield: await icon(Fa.FaShieldAlt, WHITE), lock: await icon(Fa.FaLock, WHITE),
    dollar: await icon(Fa.FaDollarSign, WHITE), chart: await icon(Fa.FaChartLine, WHITE), globe: await icon(Fa.FaGlobeAsia, WHITE),
    users: await icon(Fa.FaUsers, WHITE), bolt: await icon(Fa.FaBolt, WHITE), target: await icon(Fa.FaBullseye, WHITE),
    stop: await icon(Fa.FaHandPaper, WHITE), clock: await icon(Fa.FaHourglassHalf, WHITE), ban: await icon(Fa.FaBan, WHITE),
    oil: await icon(Fa.FaOilCan, WHITE), server: await icon(Fa.FaServer, WHITE),
  };

  // ======================= Title =======================
  {
    const s = pres.addSlide(); s.background = { color: NAVY };
    s.addShape(pres.shapes.BLOCK_ARC, { x: 5.6, y: 1.2, w: 5.6, h: 5.6, fill: { color: JADE, transparency: 35 }, angleRange: [180, 0], arcThicknessRatio: 0.12, line: { color: JADE, transparency: 35 } });
    s.addShape(pres.shapes.BLOCK_ARC, { x: 6.3, y: 1.9, w: 4.2, h: 4.2, fill: { color: GOLD, transparency: 25 }, angleRange: [180, 0], arcThicknessRatio: 0.1, line: { color: GOLD, transparency: 25 } });
    s.addText("Investment Strategy Challenge 2026  ·  Proposal to the NKE Private Wealth Investment Committee", { x: 0.6, y: 0.75, w: 8.4, h: 0.35, fontFace: BF, fontSize: 12, color: "B9C7D6", margin: 0, isTextBox: true });
    s.addText("The Asia Digital Bridge\nLegacy Note", { x: 0.6, y: 1.3, w: 6.4, h: 1.55, fontFace: HF, fontSize: 38, bold: true, color: WHITE, margin: 0, valign: "top", isTextBox: true });
    s.addText("Own Asia's AI supply chain, from wafer to app, while every dollar of principal and every banked gain is kept for the next generation", { x: 0.6, y: 3.0, w: 5.8, h: 0.85, fontFace: BF, fontSize: 15, italic: true, color: "DCE7E3", margin: 0, isTextBox: true });
    s.addText(`USD 100Mn  ·  7-year USD note  ·  100% principal protected  ·  ${PART} uncapped participation  ·  Trade date 17 Sep 2026`, { x: 0.6, y: 4.35, w: 8.8, h: 0.35, fontFace: BF, fontSize: 12, bold: true, color: GOLD, margin: 0, isTextBox: true });
    s.addText("Team [name]  ·  Natixis Global Markets Institute", { x: 0.6, y: 4.75, w: 6, h: 0.3, fontFace: BF, fontSize: 11, color: "B9C7D6", margin: 0, isTextBox: true });
    s.addNotes("One-line pitch: the Chak family already owns Asia's physical digital infrastructure. This note gives them the chips-and-platforms layer, in USD, with principal protected and gains banked along the way.");
  }

  // ======================= Agenda (not counted) =======================
  {
    const s = pres.addSlide(); s.background = { color: WHITE };
    title(s, "Agenda");
    const items = [
      ["Client and diagnosis", "Who the Chak family are, and what their balance sheet already owns", "1–2"],
      ["Market view", "Asia's AI build-out, a crowded 2026 rally and the return of high USD rates", "3"],
      ["Product design", "Basket, mechanics, payoff and scenario analysis", "4–6"],
      ["Pricing and back-testing", "Option budget, structuring trade-offs and 100,000-path simulation", "7–8"],
      ["Risk and recommendation", "Sizing, VaR and stress, hedging, exits and next steps", "9–10"],
      ["Appendix", "Market inputs, methodology, alternatives considered and sources", "A1–A4"],
    ];
    items.forEach((it, i) => {
      const y = 1.05 + i * 0.68;
      badge(s, 0.6, y + 0.04, String(i + 1), i === 5 ? GREY : i % 2 ? JADE : NAVY, 0.46, 14);
      s.addText(it[0], { x: 1.3, y, w: 3.2, h: 0.55, fontFace: HF, fontSize: 16, bold: true, color: NAVY, valign: "middle", margin: 0, isTextBox: true });
      s.addText(it[1], { x: 4.5, y, w: 4.2, h: 0.55, fontFace: BF, fontSize: 12, color: MUTED, valign: "middle", margin: 0, isTextBox: true });
      s.addText(it[2], { x: 8.75, y, w: 0.8, h: 0.55, fontFace: BF, fontSize: 12, bold: true, color: JADE, align: "right", valign: "middle", margin: 0, isTextBox: true });
    });
  }

  // ======================= Executive summary (not counted) =======================
  {
    const s = pres.addSlide(); s.background = { color: WHITE };
    title(s, "Executive summary", "A 7-year USD note that turns high USD rates into protected, uncapped exposure to Asia's AI stack");
    const stats = [
      ["100%", "Principal back in 2033", "Contractual floor at maturity (Natixis credit). A zero-coupon bond costing 67.6% funds it.", NAVY],
      [PART, "Uncapped participation", "In an equal-weight basket: Nikkei 225, TAIEX, KOSPI 200 and Hang Seng TECH, quanto USD", JADE],
      ["115→150%", "Legacy Lock-in", "Gains of +30% / +60% / +100% on any anniversary lock the floor at 115% / 130% / 150%", GOLD],
    ];
    stats.forEach((st, i) => {
      const x = 0.45 + i * 3.07;
      card(s, x, 1.3, 2.9, 2.05, MIST);
      s.addText(st[0], { x: x + 0.2, y: 1.4, w: 2.6, h: 0.75, fontFace: HF, fontSize: 34, bold: true, color: st[3], margin: 0, valign: "middle", isTextBox: true });
      s.addText(st[1], { x: x + 0.2, y: 2.15, w: 2.6, h: 0.3, fontFace: BF, fontSize: 13, bold: true, color: INK, margin: 0, isTextBox: true });
      s.addText(st[2], { x: x + 0.2, y: 2.47, w: 2.55, h: 0.8, fontFace: BF, fontSize: 10.5, color: MUTED, margin: 0, valign: "top", isTextBox: true });
    });
    s.addText([
      T("Recommendation. ", { bold: true, color: NAVY }),
      T("NKE invests USD 100Mn (5% of family wealth) in a Natixis note covering the four markets that make up Asia's AI supply chain: equipment, foundry, memory and platforms. The family's operating businesses already own the physical layer (data centres, power, real estate). The note adds the digital layer they lack, in USD, without picking a single winner. "),
      T(`In our 100,000-path simulation the note's median redemption is ${pct(S.median_redemption)} and the worst 5% of outcomes still return 100%. Holding the basket directly would return ${pct(S.direct_p5)} in that worst 5%, with a ${pct(S.direct_prob_loss)} chance of losing money.`, { bold: true }),
    ], { x: 0.45, y: 3.55, w: 9.1, h: 1.1, fontFace: BF, fontSize: 11.5, color: INK, margin: 0, valign: "top", isTextBox: true });
    card(s, 0.45, 4.7, 9.1, 0.48, NAVY);
    s.addText([
      T("What it costs: ", { bold: true, color: GOLD }),
      T(`no dividends, and the forgone 7Y bond yield. In ${pct(S.prob_floor_only)} of simulated paths the family gets exactly its principal back. Mark-to-market can fall ${pct(-K.stress_crash_volup_ratesup)} in a joint equity-vol-rate shock before maturity.`, { color: WHITE }),
    ], { x: 0.6, y: 4.7, w: 8.85, h: 0.48, fontFace: BF, fontSize: 10.5, margin: 0, valign: "middle", isTextBox: true });
    foot(s, MODEL_NOTE);
  }

  // ======================= 1. Client =======================
  {
    const s = pres.addSlide(); s.background = { color: WHITE };
    title(s, "The client: a third-generation family moving from operating to investing", "NKE Private Wealth, the single-family office of the Chak family");
    // Profile column
    card(s, 0.45, 1.25, 2.85, 3.9, MIST);
    iconDot(s, ic.landmark, 0.65, 1.4, 0.5, NAVY);
    s.addText("Client profile", { x: 1.25, y: 1.42, w: 1.9, h: 0.45, fontFace: HF, fontSize: 15, bold: true, color: NAVY, valign: "middle", margin: 0, isTextBox: true });
    s.addText([
      T("Chak family, third generation; operating succession just completed", { bullet: true, breakLine: true }),
      T("Businesses: technology infrastructure, renewable energy plants and real estate across Japan and Greater China", { bullet: true, breakLine: true }),
      T("Family net worth > USD 2Bn", { bullet: true, breakLine: true }),
      T("Mandate: USD 100Mn (about 5% of wealth) for one structured allocation", { bullet: true, bold: true }),
    ], { x: 0.65, y: 2.0, w: 2.5, h: 3.0, fontFace: BF, fontSize: 10.5, color: INK, paraSpaceAfter: 5, valign: "top", margin: 0, isTextBox: true });
    // Objectives column
    s.addText("Objectives", { x: 3.5, y: 1.25, w: 3.0, h: 0.35, fontFace: HF, fontSize: 15, bold: true, color: NAVY, margin: 0, isTextBox: true });
    const goals = [
      [ic.seed, "Capital appreciation for future generations", "Long-horizon growth, not current income"],
      [ic.chip, "Meaningful exposure to Asia's digital transformation", "Enough weight to matter, not a token allocation"],
      [ic.bridge, "Bridge traditional Asian markets and new technology", "Where the family has operating expertise"],
      [ic.shield, "Downside managed for generational preservation", "No permanent loss of the capital being passed on"],
    ];
    goals.forEach((g, i) => {
      const y = 1.7 + i * 0.86;
      iconDot(s, g[0], 3.5, y + 0.05, 0.45, i === 3 ? GOLD : JADE);
      s.addText(g[1], { x: 4.05, y, w: 2.55, h: 0.4, fontFace: BF, fontSize: 11, bold: true, color: INK, margin: 0, valign: "middle", isTextBox: true });
      s.addText(g[2], { x: 4.05, y: y + 0.4, w: 2.55, h: 0.35, fontFace: BF, fontSize: 9.5, color: MUTED, margin: 0, valign: "top", isTextBox: true });
    });
    // Risk profile column
    card(s, 6.8, 1.25, 2.75, 0.75, NAVY);
    s.addText([T("Risk tolerance: Moderate", { bold: true, breakLine: true, fontSize: 14 }), T("Can live with mark-to-market swings; cannot accept permanent capital loss", { fontSize: 9.5, color: "C9D6E2" })],
      { x: 6.95, y: 1.27, w: 2.5, h: 0.71, fontFace: BF, color: WHITE, margin: 0, valign: "middle", isTextBox: true });
    s.addText("Key assumptions", { x: 6.8, y: 2.12, w: 2.75, h: 0.3, fontFace: HF, fontSize: 13, bold: true, color: NAVY, margin: 0, isTextBox: true });
    const asm = [
      "Hold to maturity: a 7-year horizon, one succession cycle",
      "Reports in USD; operating cash flows are in JPY, CNY and HKD",
      "Professional investor; can hold OTC notes and accepts Natixis credit risk",
      "No income need: the businesses provide cash flow, so no coupon",
    ];
    asm.forEach((a, i) => {
      const y = 2.5 + i * 0.66;
      badge(s, 6.8, y + 0.08, String(i + 1), JADE2, 0.34, 11);
      s.addText(a, { x: 7.25, y, w: 2.3, h: 0.6, fontFace: BF, fontSize: 9.5, color: INK, margin: 0, valign: "middle", isTextBox: true });
    });
    pageNo(s, 1);
    s.addNotes("Assumptions are our reading of the brief; confirm them with the family's investment committee. The key one is no income need, which lets us spend the whole option budget on growth.");
  }

  // ======================= 2. Diagnosis =======================
  {
    const s = pres.addSlide(); s.background = { color: WHITE };
    title(s, "The family owns Asia's physical layer; the note adds the digital layer", "Diagnosis: avoid adding to risks the family already carries");
    // AI stack diagram
    const layers = [
      ["Applications & platforms", "AI models, cloud, e-commerce, super-apps", "Hang Seng TECH", JADE, WHITE],
      ["Semiconductors", "Equipment · foundry · memory / HBM", "Nikkei 225 · TAIEX · KOSPI 200", JADE, WHITE],
      ["Physical infrastructure", "Data centres · renewable power · real estate", "Already owned via family businesses", "C9D2DA", INK],
    ];
    s.addText("The AI value chain in Asia", { x: 0.45, y: 1.25, w: 5.2, h: 0.3, fontFace: HF, fontSize: 13, bold: true, color: NAVY, margin: 0, isTextBox: true });
    layers.forEach((l, i) => {
      const y = 1.62 + i * 0.86;
      s.addShape(pres.shapes.RECTANGLE, { x: 0.45 + i * 0.12, y, w: 5.2 - i * 0.24, h: 0.76, fill: { color: l[3] }, line: { color: WHITE, width: 1 } });
      s.addText([T(l[0], { bold: true, fontSize: 12.5, breakLine: true }), T(l[1], { fontSize: 9.5 })], { x: 0.65 + i * 0.12, y, w: 2.75, h: 0.76, fontFace: BF, color: l[4], margin: 0, valign: "middle", isTextBox: true });
      s.addText(l[2], { x: 3.35, y, w: 2.15 - i * 0.12, h: 0.76, fontFace: BF, fontSize: 10, bold: true, italic: i === 2, color: l[4], align: "right", margin: 0, valign: "middle", isTextBox: true });
    });
    s.addText("◄ the note adds these two layers", { x: 0.45, y: 4.22, w: 5.2, h: 0.25, fontFace: BF, fontSize: 9.5, italic: true, color: JADE, margin: 0, isTextBox: true });
    // Right: existing exposures
    card(s, 5.95, 1.25, 3.6, 3.2, MIST);
    s.addText("What the family's balance sheet already carries", { x: 6.1, y: 1.33, w: 3.35, h: 0.45, fontFace: HF, fontSize: 12, bold: true, color: NAVY, margin: 0, valign: "middle", isTextBox: true });
    s.addText([
      T("JPY, CNY and HKD currency exposure", { bullet: true, breakLine: true }),
      T("Greater China property cycle", { bullet: true, breakLine: true }),
      T("Power prices and interest-rate sensitivity in renewables", { bullet: true, breakLine: true }),
      T("Illiquid, concentrated, hard-asset wealth", { bullet: true, breakLine: true }),
      T("Implication: ", { bold: true, color: JADE }), T("no China property, utilities or REITs in the basket; pay out in USD; keep capital intact.", { color: INK }),
    ], { x: 6.1, y: 1.85, w: 3.35, h: 2.5, fontFace: BF, fontSize: 10.5, color: INK, paraSpaceAfter: 4, margin: 0, valign: "top", isTextBox: true });
    // Design principles strip
    const pr = [["Keep principal", "100% protection"], ["Add digital, not physical", "AI-stack basket"], ["No new FX risk", "USD quanto"], ["Don't pick one winner", "4-market basket"], ["Bank gains for heirs", "Legacy Lock-in"]];
    pr.forEach((p, i) => {
      const x = 0.45 + i * 1.84;
      card(s, x, 4.55, 1.72, 0.65, i === 4 ? GOLDL : WHITE, LINE);
      s.addText([T(p[0], { bold: true, color: NAVY, breakLine: true, fontSize: 10 }), T("→ " + p[1], { color: i === 4 ? "8A6A1E" : JADE, fontSize: 10, bold: true })],
        { x: x + 0.08, y: 4.55, w: 1.6, h: 0.65, fontFace: BF, margin: 0, valign: "middle", align: "center", isTextBox: true });
    });
    pageNo(s, 2);
    s.addNotes("The bottom strip maps each client constraint to one product feature; every later slide refers back to it.");
  }

  // ======================= 3. Market view =======================
  {
    const s = pres.addSlide(); s.background = { color: WHITE };
    title(s, "Asia builds the AI economy, but the 2026 rally makes entry risky", "Market view as of the 17 Sep 2026 trade date");
    // Col 1: AI capex
    iconDot(s, ic.server, 0.45, 1.25, 0.45, JADE);
    s.addText("AI capex runs through Asia", { x: 1.0, y: 1.25, w: 2.1, h: 0.45, fontFace: HF, fontSize: 12.5, bold: true, color: NAVY, margin: 0, valign: "middle", isTextBox: true });
    const st1 = [["> USD 600bn", "Big-5 hyperscaler capex 2026E, mostly AI servers, GPUs and data centres"], ["47%", "Chips' share of Korean exports in 1–10 Sep 2026 (+270% YoY)"], ["4 markets", "Japan (equipment), Taiwan (foundry), Korea (memory), HK/China (platforms)"]];
    st1.forEach((x, i) => {
      const y = 1.85 + i * 1.05;
      s.addText(x[0], { x: 0.45, y, w: 2.75, h: 0.42, fontFace: HF, fontSize: 21, bold: true, color: JADE, margin: 0, isTextBox: true });
      s.addText(x[1], { x: 0.45, y: y + 0.42, w: 2.75, h: 0.55, fontFace: BF, fontSize: 9.5, color: INK, margin: 0, valign: "top", isTextBox: true });
    });
    // Col 2: YTD chart
    s.addChart(pres.charts.BAR, [{ name: "YTD 2026", labels: ["TAIEX", "KOSPI", "Nikkei 225", "Hang Seng"], values: [66.3, 62.3, 29.2, -0.7] }], {
      x: 3.35, y: 1.2, w: 3.2, h: 2.75, barDir: "col", ...chartBase(), chartColors: [JADE, JADE, NAVY2, GREY], showValue: true, dataLabelPosition: "outEnd",
      dataLabelFormatCode: '0"%"', dataLabelColor: INK, dataLabelFontSize: 10, showTitle: true, title: "2026 YTD return (%), to late Sep", valAxisHidden: true, barGapWidthPct: 60,
    });
    card(s, 3.45, 4.05, 3.0, 1.1, MIST);
    s.addText([T("Implication: ", { bold: true, color: NAVY }), T("buying the momentum markets outright after +60% puts legacy capital at risk of a 2000-style reversal. Hong Kong tech has lagged, which gives a lower entry point.")],
      { x: 3.55, y: 4.08, w: 2.8, h: 1.04, fontFace: BF, fontSize: 9.5, color: INK, margin: 0, valign: "middle", isTextBox: true });
    // Col 3: rates & oil
    iconDot(s, ic.oil, 6.8, 1.25, 0.45, NAVY);
    s.addText("Oil shock keeps USD rates high", { x: 7.35, y: 1.25, w: 2.2, h: 0.45, fontFace: HF, fontSize: 12.5, bold: true, color: NAVY, margin: 0, valign: "middle", isTextBox: true });
    s.addText([
      T("Fed hiked to 3.75–4.00% on 16 Sep 2026, its first hike in three years; the dots signal more", { bullet: true, breakLine: true }),
      T("Brent near USD 109 on the Iran war, with volatility elevated across Asia", { bullet: true, breakLine: true }),
      T("USD 7Y Natixis funding of 5.75%: 67.6 cents today buys USD 1 in 2033", { bullet: true, bold: true, color: JADE }),
    ], { x: 6.8, y: 1.85, w: 2.75, h: 2.1, fontFace: BF, fontSize: 10, color: INK, paraSpaceAfter: 5, margin: 0, valign: "top", isTextBox: true });
    card(s, 6.8, 4.05, 2.75, 1.1, NAVY);
    s.addText([T("Therefore: ", { bold: true, color: GOLD }), T("own the AI stack through a floor, in USD, for 7 years. High rates pay for the protection.", { color: WHITE })],
      { x: 6.92, y: 4.08, w: 2.55, h: 1.04, fontFace: BF, fontSize: 10.5, margin: 0, valign: "middle", isTextBox: true });
    foot(s, "Sources: Goldman Sachs, CreditSights (capex); Korea Customs via TechTimes (exports); Seoul Economic Daily, Advisor Perspectives (index YTD); CNBC (Fed). Verify on Bloomberg as of 17 Sep 2026.");
    pageNo(s, 3);
  }

  // ======================= 4. Product overview =======================
  {
    const s = pres.addSlide(); s.background = { color: WHITE };
    title(s, "The Asia Digital Bridge Legacy Note", "One note, four markets and the full AI stack, with a floor that only ratchets up");
    card(s, 0.45, 1.25, 4.4, 1.05, NAVY);
    s.addText("A 7-year, USD-denominated Natixis note. It returns 100% of principal at maturity plus " + PART + " of the basket's gain, uncapped. Each anniversary, strong gains are locked in as a higher minimum redemption that can never fall back.",
      { x: 0.6, y: 1.27, w: 4.15, h: 1.01, fontFace: BF, fontSize: 10.5, color: WHITE, margin: 0, valign: "middle", isTextBox: true });
    const feats = [
      [ic.shield, "100% principal protection", "Funded by a 7Y Natixis zero-coupon bond", NAVY],
      [ic.chart, PART + " participation, no cap", "Full upside for the next generation", JADE],
      [ic.lock, "Legacy Lock-in ladder", "+30% / +60% / +100% → floor 115 / 130 / 150%", GOLD],
      [ic.dollar, "Quanto USD", "Local-market returns, no JPY/TWD/KRW/HKD risk", NAVY2],
    ];
    feats.forEach((f, i) => {
      const x = 0.45 + (i % 2) * 2.25, y = 2.45 + Math.floor(i / 2) * 1.38;
      card(s, x, y, 2.15, 1.25, MIST);
      iconDot(s, f[0], x + 0.12, y + 0.12, 0.42, f[3]);
      s.addText(f[1], { x: x + 0.62, y: y + 0.1, w: 1.48, h: 0.48, fontFace: BF, fontSize: 10.5, bold: true, color: NAVY, margin: 0, valign: "middle", isTextBox: true });
      s.addText(f[2], { x: x + 0.12, y: y + 0.65, w: 1.95, h: 0.55, fontFace: BF, fontSize: 9.5, color: INK, margin: 0, valign: "top", isTextBox: true });
    });
    // Basket table
    const hdr = ["Index", "Bloomberg", "Wt", "AI-stack role / bridge"].map((h) => ({ text: h, options: { bold: true, color: WHITE, fill: { color: NAVY } } }));
    const rows = [
      ["Nikkei 225", "NKY Index", "25%", "Traditional Japan Inc. + chip equipment (Tokyo Electron, Advantest)"],
      ["TAIEX", "TWSE Index", "25%", "Foundry and AI servers (TSMC, Hon Hai, MediaTek)"],
      ["KOSPI 200", "KOSPI2 Index", "25%", "Memory / HBM (SK hynix, Samsung Electronics)"],
      ["Hang Seng TECH", "HSTECH Index", "25%", "Platforms and AI apps (Tencent, Alibaba, Xiaomi)"],
    ].map((r, i) => r.map((c, j) => ({ text: c, options: { bold: j === 0, color: j === 2 ? JADE : INK, fill: { color: i % 2 ? WHITE : MIST } } })));
    s.addTable([hdr, ...rows], { x: 5.05, y: 1.25, w: 4.5, colW: [0.95, 0.95, 0.4, 2.2], fontFace: BF, fontSize: 9, border: { type: "solid", pt: 0.5, color: LINE }, rowH: 0.5, valign: "middle", margin: 0.04 });
    card(s, 5.05, 3.95, 4.5, 1.2, GOLDL);
    s.addText([
      T("Why these four: ", { bold: true, color: NAVY }),
      T("three traditional national benchmarks now driven by tech, plus one pure new-economy index. That is the bridge the family asked for. All four have deep listed futures and options, so Natixis can hedge at low cost. Equal weight keeps any one geopolitical risk (Taiwan, China regulation) to 25%."),
    ], { x: 5.18, y: 3.97, w: 4.25, h: 1.16, fontFace: BF, fontSize: 9.5, color: INK, margin: 0, valign: "middle", isTextBox: true });
    foot(s, "Constituent examples are indicative top weights; confirm with MEMB <GO> on Bloomberg. Price-return indices; basket performance = Σ 25% × S(t)/S(0).");
    pageNo(s, 4);
  }

  // ======================= 5. Mechanics =======================
  {
    const s = pres.addSlide(); s.background = { color: WHITE };
    title(s, "How the note works", "Key terms and redemption logic");
    card(s, 0.45, 1.2, 3.9, 3.95, WHITE, LINE);
    const terms = [
      ["Issuer", "Natixis S.A. (EMTN programme, private placement)"], ["Notional / price", "USD 100,000,000 at 100%"],
      ["Trade / strike date", "17 Sep 2026"], ["Maturity", "17 Sep 2033 (7 years)"],
      ["Underlying", "Equal-weight basket: NKY, TWSE, KOSPI2, HSTECH; quanto USD"],
      ["Participation", PART + " of basket gain, uncapped"],
      ["Lock-in dates", "Annually, 17 Sep 2027 to 2032 (6 dates)"],
      ["Lock-in ladder", "Basket ≥130% → floor 115%; ≥160% → 130%; ≥200% → 150%"],
      ["Redemption", "max[ Locked floor ; 100% + " + PART + " × max(0, Basket_final − 100%) ]"],
      ["Liquidity", "Natixis indicative secondary bid, daily"],
    ];
    s.addText("Key terms", { x: 0.6, y: 1.27, w: 3.6, h: 0.3, fontFace: HF, fontSize: 13, bold: true, color: NAVY, margin: 0, isTextBox: true });
    terms.forEach((t, i) => {
      const y = 1.62 + i * 0.35;
      s.addText(t[0], { x: 0.6, y, w: 1.15, h: 0.33, fontFace: BF, fontSize: 9, bold: true, color: JADE, margin: 0, valign: "middle", isTextBox: true });
      s.addText(t[1], { x: 1.75, y, w: 2.5, h: 0.33, fontFace: BF, fontSize: 9, color: INK, margin: 0, valign: "middle", isTextBox: true });
    });
    // Flowchart
    const box = (x, y, w, h, txt, fill, color, bold) => {
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: fill }, rectRadius: 0.06, line: { color: fill } });
      s.addText(txt, { x: x + 0.08, y, w: w - 0.16, h, fontFace: BF, fontSize: 10, bold: !!bold, color, align: "center", valign: "middle", margin: 0, isTextBox: true });
    };
    const arrow = (x1, y1, x2, y2, lbl, lx, ly) => {
      s.addShape(pres.shapes.LINE, { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1) || 0.001, h: Math.abs(y2 - y1) || 0.001, line: { color: MUTED, width: 1.25, endArrowType: "triangle" }, flipH: x2 < x1 });
      if (lbl) s.addText(lbl, { x: lx, y: ly, w: 0.5, h: 0.22, fontFace: BF, fontSize: 9, bold: true, color: MUTED, margin: 0, isTextBox: true });
    };
    s.addText("Each anniversary, years 1–6", { x: 4.6, y: 1.2, w: 3, h: 0.28, fontFace: BF, fontSize: 10, bold: true, color: GOLD, margin: 0, isTextBox: true });
    box(4.6, 1.5, 2.55, 0.72, "Basket at a new lock-in rung?\n(≥130%, ≥160%, ≥200%)", MIST, NAVY, true);
    box(7.6, 1.5, 1.95, 0.72, "Floor ratchets up to 115 / 130 / 150%, permanently", GOLDL, "6E5417", true);
    arrow(7.15, 1.86, 7.6, 1.86, "Yes", 7.2, 1.6);
    box(4.6, 2.65, 2.55, 0.62, "Keep current floor (starts at 100%)", MIST, NAVY);
    arrow(5.875, 2.22, 5.875, 2.65, "No", 5.95, 2.32);
    s.addText("At maturity (2033)", { x: 4.6, y: 3.42, w: 1.2, h: 0.28, fontFace: BF, fontSize: 10, bold: true, color: JADE, margin: 0, isTextBox: true });
    box(4.6, 3.72, 2.55, 0.72, "Basket final above 100%?", MIST, NAVY, true);
    arrow(5.875, 3.27, 5.875, 3.72);
    box(7.6, 3.62, 1.95, 0.62, "max(Floor; 100% + " + PART + " × gain)", JADE, WHITE, true);
    arrow(7.15, 3.93, 7.6, 3.93, "Yes", 7.2, 3.67);
    box(7.6, 4.45, 1.95, 0.6, "Locked floor (never < 100%)", NAVY, WHITE, true);
    s.addShape(pres.shapes.LINE, { x: 5.875, y: 4.44, w: 0.001, h: 0.31, line: { color: MUTED, width: 1.25 } });
    arrow(5.875, 4.75, 7.6, 4.75, "No", 6.0, 4.5);
    s.addShape(pres.shapes.LINE, { x: 9.0, y: 2.22, w: 0.001, h: 1.4, line: { color: GOLD, width: 1.25, dashType: "dash", endArrowType: "triangle" } });
    s.addText("floor carried to maturity", { x: 8.05, y: 2.75, w: 0.9, h: 0.5, fontFace: BF, fontSize: 8.5, italic: true, color: "8A6A1E", align: "right", margin: 0, isTextBox: true });
    pageNo(s, 5);
    s.addNotes("The lock-in observes the basket only on six anniversaries, which keeps it cheap (1.8% of notional) and easy to explain. A lock-in can only ratchet up.");
  }

  // ======================= 6. Payoff & scenarios =======================
  {
    const s = pres.addSlide(); s.background = { color: WHITE };
    title(s, "Payoff and scenario analysis", "Upside is uncapped; every outcome ends at or above 100%, and a boom that later busts still banks gains");
    const xs = [];
    for (let v = 50; v <= 250; v += 10) xs.push(v);
    const pay = (fl) => xs.map((v) => +Math.max(fl, 100 + P.participation_quoted * Math.max(v - 100, 0)).toFixed(1));
    s.addChart(pres.charts.LINE, [
      { name: "Floor 100% (no lock-in)", labels: xs.map((v) => v + "%"), values: pay(100) },
      { name: "Floor locked at 130%", labels: xs.map((v) => v + "%"), values: pay(130) },
      { name: "Direct basket", labels: xs.map((v) => v + "%"), values: xs },
    ], {
      x: 0.35, y: 1.2, w: 4.6, h: 3.95, ...chartBase(), chartColors: [JADE, GOLD, GREY], lineSize: 2.5, lineDataSymbol: "none",
      showLegend: true, legendPos: "b", legendFontSize: 9, legendFontFace: BF, legendColor: INK,
      showTitle: true, title: "Redemption (%) vs basket level at maturity", valAxisMinVal: 40, valAxisMaxVal: 300, valAxisMajorUnit: 50,
      catAxisLabelFrequency: 5, showCatAxisTitle: true, catAxisTitle: "Basket final / initial", catAxisTitleFontSize: 9, catAxisTitleColor: MUTED,
    });
    const hdr = ["Scenario (7 years)", "Basket end", "Peak", "Note", "Direct*"].map((h) => ({ text: h, options: { bold: true, color: WHITE, fill: { color: NAVY } } }));
    const rows = R.stress.map((x, i) => [
      { text: x.scenario, options: { bold: true } },
      { text: pct(x.basket_final), options: { align: "center" } },
      { text: pct(x.peak), options: { align: "center" } },
      { text: pct(x.note), options: { align: "center", bold: true, color: x.note > x.direct ? JADE : NAVY } },
      { text: pct(x.direct), options: { align: "center", color: x.direct < 1 ? RED : INK } },
    ].map((c) => ({ text: c.text, options: { ...c.options, fill: { color: i % 2 ? WHITE : MIST } } })));
    s.addTable([hdr, ...rows], { x: 5.15, y: 1.25, w: 4.4, colW: [1.9, 0.68, 0.55, 0.62, 0.65], fontFace: BF, fontSize: 9, color: INK, border: { type: "solid", pt: 0.5, color: LINE }, rowH: 0.4, valign: "middle", margin: 0.04 });
    card(s, 5.15, 4.2, 4.4, 0.95, GOLDL);
    s.addText([T("Read-across: ", { bold: true, color: NAVY }), T("the note gives up some upside in steady growth (no dividends) in exchange for a 130% exit in a boom-and-bust and 100% in a crisis. That is the trade-off a legacy portfolio should make.")],
      { x: 5.28, y: 4.22, w: 4.15, h: 0.91, fontFace: BF, fontSize: 9.5, color: INK, margin: 0, valign: "middle", isTextBox: true });
    foot(s, "*Direct = equal-weight basket bought outright, including ~1.8% p.a. dividends. Scenarios are stylised annual paths (pricing/scenario2/analysis.py).");
    pageNo(s, 6);
  }

  // ======================= 7. Pricing & structuring =======================
  {
    const s = pres.addSlide(); s.background = { color: WHITE };
    title(s, "Pricing: high USD rates fund an option budget of about 30%", "Where the USD 100 goes, and the dials the family can turn");
    const seg = [["Zero-coupon bond (100% floor)", P.zcb, NAVY], ["Uncapped basket call (" + PART + ")", P.upside_call_pv, JADE], ["Legacy Lock-in ladder", P.lockin_pv, GOLD], ["Natixis fee (35 bp p.a.)", P.fees, GREY], ["Model reserve (skew, fwd vol)", P.model_reserve, "B7C4CF"]];
    s.addChart(pres.charts.BAR, seg.map((g) => ({ name: g[0] + ": " + (100 * g[1]).toFixed(1) + "%", labels: ["Note"], values: [+(100 * g[1]).toFixed(1)] })), {
      x: 0.35, y: 1.2, w: 3.0, h: 3.95, barDir: "col", barGrouping: "stacked", ...chartBase(), chartColors: seg.map((g) => g[2]),
      showLegend: true, legendPos: "b", legendFontSize: 8, legendFontFace: BF, showTitle: true, title: "Use of USD 100 (% of notional)", valAxisHidden: true, valAxisMaxVal: 100, barGapWidthPct: 40,
    });
    // Dials table
    s.addText("Structuring dials (fair participation)", { x: 3.55, y: 1.22, w: 3.2, h: 0.3, fontFace: HF, fontSize: 12, bold: true, color: NAVY, margin: 0, isTextBox: true });
    const hd = (a) => a.map((h) => ({ text: h, options: { bold: true, color: WHITE, fill: { color: NAVY } } }));
    const rowsT = R.tenor_dial.map((t) => [String(t.tenor) + "Y", pct(t.funding, 2), pct(t.budget, 1), pct(t.participation)]).map((r) => r.map((c) => ({ text: c, options: { fill: { color: r[0] === "7Y" ? GOLDL : WHITE }, bold: r[0] === "7Y" } })));
    s.addTable([hd(["Tenor", "Funding", "Budget", "Particip."]), ...rowsT], { x: 3.55, y: 1.57, w: 3.1, colW: [0.6, 0.8, 0.8, 0.9], fontFace: BF, fontSize: 9, color: INK, border: { type: "solid", pt: 0.5, color: LINE }, rowH: 0.27, align: "center", valign: "middle", margin: 0.03 });
    const rowsP = R.protection_dial.map((t) => [pct(t.protection), pct(t.budget, 1), pct(t.participation)]).map((r) => r.map((c) => ({ text: c, options: { fill: { color: r[0] === "100%" ? GOLDL : WHITE }, bold: r[0] === "100%" } })));
    s.addTable([hd(["Protection", "Budget", "Particip."]), ...rowsP], { x: 3.55, y: 3.07, w: 3.1, colW: [1.1, 1.0, 1.0], fontFace: BF, fontSize: 9, color: INK, border: { type: "solid", pt: 0.5, color: LINE }, rowH: 0.27, align: "center", valign: "middle", margin: 0.03 });
    s.addText([T("Why 7Y and 100%: ", { bold: true, color: NAVY }), T("5Y buys only " + pct(R.tenor_dial[1].participation) + "; 10Y locks capital beyond one succession cycle. A 90% floor adds " + pct(R.protection_dial[2].participation - R.protection_dial[0].participation) + " participation but breaks the preservation mandate.")],
      { x: 3.55, y: 4.25, w: 3.1, h: 0.9, fontFace: BF, fontSize: 9, color: INK, margin: 0, valign: "top", isTextBox: true });
    // Sensitivities
    const se = R.sensitivity;
    const lab = ["Base", "Vol +3pts", "Vol −3pts", "Corr +0.15", "Corr −0.15", "Rates +50bp", "Rates −50bp"];
    const val = [se.base, se["vol_+3"], se["vol_-3"], se["corr_+0.15"], se["corr_-0.15"], se["rates_+50bp"], se["rates_-50bp"]].map((v) => +(100 * v).toFixed(0));
    s.addChart(pres.charts.BAR, [{ name: "Fair participation", labels: lab, values: val }], {
      x: 6.8, y: 1.2, w: 2.85, h: 2.85, barDir: "bar", ...chartBase(), chartColors: [JADE], showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: '0"%"',
      dataLabelFontSize: 8.5, dataLabelColor: INK, showTitle: true, title: "Fair participation under shocks", valAxisHidden: true, valAxisMinVal: 0, valAxisMaxVal: 180, catAxisOrientation: "maxMin", barGapWidthPct: 45,
    });
    card(s, 6.85, 4.15, 2.7, 1.0, MIST);
    s.addText([T("Design choices tested: ", { bold: true, color: NAVY }), T(`no lock-in ${pct(R.design_variants.equal_weight_no_ladder)}; best-of rainbow 40/30/20/10 only ${pct(R.design_variants.rainbow_40_30_20_10_with_ladder)}. We quote ${PART} vs ${pct(P.participation_fair)} fair; the gap is a model reserve.`)],
      { x: 6.95, y: 4.17, w: 2.5, h: 0.96, fontFace: BF, fontSize: 8.5, color: INK, margin: 0, valign: "middle", isTextBox: true });
    foot(s, "ZCB at the USD funding grid (linear interpolation, annual comp.). Options: correlated quanto GBM, 200k paths, OIS = funding − 45bp. " + "Inputs in Appendix A1.");
    pageNo(s, 7);
  }

  // ======================= 8. Back-testing =======================
  {
    const s = pres.addSlide(); s.background = { color: WHITE };
    title(s, "Back-testing: 100,000 fat-tailed paths over 7 years", "Same median as owning the basket directly, without the left tail");
    const F = R.fan, yrs = F.years.map((y) => "Y" + y);
    const names = ["5th pct", "25th pct", "Median", "75th pct", "95th pct"];
    const cols = ["B7C4CF", JADE2, NAVY, JADE2, "B7C4CF"];
    s.addChart(pres.charts.LINE, [
      ...names.map((n, j) => ({ name: n, labels: yrs, values: F.levels.map((row) => +(100 * row[j]).toFixed(0)) })),
      { name: "Note floor", labels: yrs, values: yrs.map(() => 100) },
    ], {
      x: 0.35, y: 1.2, w: 4.4, h: 2.9, ...chartBase(), chartColors: [...cols, GOLD], lineSize: 2, lineDataSymbol: "none", showLegend: true, legendPos: "b", legendFontSize: 8,
      showTitle: true, title: "Basket level fan chart (% of initial)", valAxisMinVal: 0, valAxisMaxVal: 350, valAxisMajorUnit: 50,
    });
    s.addChart(pres.charts.BAR, [{ name: "Probability", labels: S.hist_labels, values: S.hist.map((h) => +(100 * h).toFixed(1)) }], {
      x: 4.85, y: 1.2, w: 4.8, h: 2.9, barDir: "col", ...chartBase(), chartColors: [NAVY, JADE, JADE, JADE, JADE, GOLD], showValue: true, dataLabelPosition: "outEnd",
      dataLabelFormatCode: '0"%"', dataLabelFontSize: 9, dataLabelColor: INK, showTitle: true, title: "Distribution of note redemption at maturity (% of paths)", valAxisHidden: true, barGapWidthPct: 40,
    });
    const kp = [
      [pct(S.median_redemption), "Median redemption", NAVY], [pct(S.mean_irr, 1), "Mean IRR p.a.", JADE], [pct(S.prob_lock_115), "Paths locking ≥115%", GOLD],
      ["100% vs " + pct(S.direct_p5), "5th pct: note vs direct", NAVY], [pct(S.lockin_saved), "Paths where lock-in beat final", GOLD],
    ];
    kp.forEach((k, i) => {
      const x = 0.45 + i * 1.84;
      card(s, x, 4.2, 1.72, 0.95, MIST);
      s.addText(k[0], { x: x + 0.08, y: 4.24, w: 1.56, h: 0.45, fontFace: HF, fontSize: 17, bold: true, color: k[2], align: "center", margin: 0, valign: "middle", isTextBox: true });
      s.addText(k[1], { x: x + 0.08, y: 4.68, w: 1.56, h: 0.42, fontFace: BF, fontSize: 9, color: INK, align: "center", margin: 0, valign: "top", isTextBox: true });
    });
    foot(s, "Real-world MC: monthly multivariate-t (df=5, joint crashes), drifts 5–6% p.a. price return, vols 23–33%, correlations 0.40–0.65. Historical rolling and block-bootstrap back-test on Bloomberg data: backtest_bloomberg.py.");
    pageNo(s, 8);
    s.addNotes(`Mean redemption ${pct(S.mean_redemption)}, p95 ${pct(S.p95)}. Note returns exactly principal in ${pct(S.prob_floor_only)} of paths; direct basket loses money in ${pct(S.direct_prob_loss)}. The note beats a 7Y USD bond in ${pct(S.prob_beats_ust)} of paths: that is the honest cost of protection.`);
  }

  // ======================= 9. Risk =======================
  {
    const s = pres.addSlide(); s.background = { color: WHITE };
    title(s, "Risk analysis: what can go wrong, and what we do about it", "Investor risks, risk metrics and issuer hedging");
    const hdr = ["Risk", "What it means for the family", "Mitigant"].map((h) => ({ text: h, options: { bold: true, color: WHITE, fill: { color: NAVY } } }));
    const rows = [
      ["Issuer credit", "Natixis default would remove the floor", "Size capped by credit budget; track Natixis 5Y CDS"],
      ["Opportunity cost", `${pct(S.prob_floor_only)} of paths return only principal`, "Lock-in banks gains; bonds elsewhere carry income"],
      ["Mark-to-market", "Value can dip before 2033; secondary bid/offer", "Hold-to-maturity mandate; daily Natixis bid"],
      ["Geopolitics", "Taiwan Strait, China tech regulation", "25% cap per market; floor absorbs the tail"],
      ["Model / pricing", "Vol, correlation, skew on the lock-in", "1.45% reserve; sensitivities on p.7"],
      ["Dividends / FX", "No dividends; no local-FX upside", `Priced into ${PART}; USD matches reporting`],
    ].map((r, i) => r.map((c, j) => ({ text: c, options: { bold: j === 0, color: j === 0 ? NAVY : INK, fill: { color: i % 2 ? WHITE : MIST } } })));
    s.addTable([hdr, ...rows], { x: 0.45, y: 1.2, w: 5.4, colW: [1.15, 2.15, 2.1], fontFace: BF, fontSize: 8.5, border: { type: "solid", pt: 0.5, color: LINE }, rowH: 0.44, valign: "middle", margin: 0.04 });
    // Metrics
    card(s, 6.05, 1.2, 3.5, 1.95, NAVY);
    s.addText("Risk metrics (Unit 15)", { x: 6.2, y: 1.25, w: 3.2, h: 0.3, fontFace: HF, fontSize: 12, bold: true, color: GOLD, margin: 0, isTextBox: true });
    s.addText([
      T("Sizing: ", { bold: true, color: GOLD }), T(`credit budget 3% of USD 2Bn = USD 60Mn ÷ 60% loss if Natixis defaults (40% recovery) = USD ${(SZ.max_size / 1e6).toFixed(0)}Mn max`, { breakLine: true }),
      T("10-day 99% VaR (MTM): ", { bold: true, color: GOLD }), T(`${pct(K.var99_10d, 1)}; ES ${pct(K.es99_10d, 1)}`, { breakLine: true }),
      T("Joint stress: ", { bold: true, color: GOLD }), T(`equities −30%, vol +10pts, USD rates +100bp: ${pct(K.stress_crash_volup_ratesup, 1)} MTM. With rates −50bp: ${pct(K.stress_crash_volup_ratesdown, 1)}`, { breakLine: true }),
      T("At maturity: ", { bold: true, color: GOLD }), T("loss is 0% by contract (ex-credit)"),
    ], { x: 6.2, y: 1.6, w: 3.25, h: 1.8, fontFace: BF, fontSize: 10, color: WHITE, paraSpaceAfter: 5, margin: 0, valign: "top", isTextBox: true });
    card(s, 6.05, 3.25, 3.5, 1.9, MIST);
    s.addText("How Natixis hedges", { x: 6.2, y: 3.33, w: 3.2, h: 0.3, fontFace: HF, fontSize: 12, bold: true, color: NAVY, margin: 0, isTextBox: true });
    s.addText([
      T("Delta: OSE/CME Nikkei, TAIFEX, KRX KOSPI 200 and HKEX HSTECH futures", { bullet: true, breakLine: true }),
      T("Vega: long-dated listed options and variance swaps", { bullet: true, breakLine: true }),
      T("Quanto: dynamic FX forwards and NDFs (TWD, KRW)", { bullet: true, breakLine: true }),
      T("Correlation / forward skew: kept as residual, covered by the reserve", { bullet: true }),
    ], { x: 6.2, y: 3.68, w: 3.25, h: 1.42, fontFace: BF, fontSize: 9.5, color: INK, paraSpaceAfter: 3, margin: 0, valign: "top", isTextBox: true });
    s.addText(`Greeks at issue (per USD 100 notional): delta USD ${(100 * K.delta_per_1pct).toFixed(2)} per 1% basket move · vega USD ${(100 * K.vega_per_volpt).toFixed(2)} per vol pt · DV01 USD ${(100 * K.dv01_per_bp).toFixed(3)} per bp. MTM risk before maturity is mostly rates: the 7Y bond floor has a duration of about 6.6.`,
      { x: 0.45, y: 4.4, w: 5.4, h: 0.75, fontFace: BF, fontSize: 9, italic: true, color: MUTED, margin: 0, valign: "middle", isTextBox: true });
    foot(s, "VaR: delta-normal, basket vol " + pct(K.basket_vol, 1) + ", 100bp p.a. rate vol, zero equity–rate correlation. Stress: full Monte Carlo revaluation with spot, vol and rates shocked together.");
    pageNo(s, 9);
  }

  // ======================= 10. Summary & recommendation =======================
  {
    const s = pres.addSlide(); s.background = { color: NAVY };
    s.addText("Recommendation: invest USD 100Mn in the Legacy Note", { x: 0.45, y: 0.25, w: 9.1, h: 0.55, fontFace: HF, fontSize: 21, bold: true, color: WHITE, margin: 0, valign: "middle", isTextBox: true });
    const colw = 4.45;
    [["For the Chak family", JADE, [
      ["Objectives met", "Growth (uncapped " + PART + "), Asia digital exposure, a traditional-to-tech bridge, 100% floor"],
      ["Complements, not duplicates", "Adds the chips-and-platforms layer and USD; avoids property, power and local FX"],
      ["Gains banked for heirs", "The Legacy Lock-in turns a boom that later busts into a 130% exit"],
    ]], ["For Natixis", GOLD, [
      ["Hedgeable with listed instruments", "Four of Asia's most liquid futures and options markets"],
      ["Efficient funding", "7Y USD funding at the grid rate; 35 bp p.a. fee on a USD 100Mn ticket"],
      ["Relationship", "A long-term partnership with the next generation of a USD 2Bn family"],
    ]]].forEach((col, c) => {
      const x = 0.45 + c * (colw + 0.2);
      s.addText(col[0], { x, y: 0.95, w: colw, h: 0.32, fontFace: HF, fontSize: 13, bold: true, color: col[1], margin: 0, isTextBox: true });
      col[2].forEach((r, i) => {
        const y = 1.32 + i * 0.68;
        card(s, x, y, colw, 0.6, NAVY2);
        s.addText([T(r[0] + ": ", { bold: true, color: col[1] }), T(r[1], { color: WHITE })], { x: x + 0.12, y, w: colw - 0.24, h: 0.6, fontFace: BF, fontSize: 9.5, margin: 0, valign: "middle", isTextBox: true });
      });
    });
    s.addText("Exit plan: all four exits defined", { x: 0.45, y: 3.43, w: 9.1, h: 0.3, fontFace: HF, fontSize: 13, bold: true, color: WHITE, margin: 0, isTextBox: true });
    const ex = [
      [ic.target, "Profit target", "Lock-in rungs bank gains automatically. The investment committee reviews selling back if MTM ≥ 150%"],
      [ic.stop, "Stop-loss", "Not needed for market risk (contractual floor). Trigger on credit: Natixis 5Y CDS > 250bp; gap risk acknowledged"],
      [ic.ban, "Thesis invalidation", "Hyperscaler capex guided down for two straight quarters, or a Taiwan Strait blockade: review the position"],
      [ic.clock, "Time stop", "Maturity 17 Sep 2033, aligned with the family's next succession review"],
    ];
    ex.forEach((e, i) => {
      const x = 0.45 + i * 2.3;
      card(s, x, 3.78, 2.18, 1.3, WHITE);
      iconDot(s, e[0], x + 0.1, 3.86, 0.36, i === 0 ? GOLD : i === 3 ? JADE : NAVY);
      s.addText(e[1], { x: x + 0.52, y: 3.86, w: 1.6, h: 0.36, fontFace: BF, fontSize: 10.5, bold: true, color: NAVY, margin: 0, valign: "middle", isTextBox: true });
      s.addText(e[2], { x: x + 0.1, y: 4.26, w: 1.98, h: 0.78, fontFace: BF, fontSize: 9.5, color: INK, margin: 0, valign: "top", isTextBox: true });
    });
    s.addText("Next steps: confirm assumptions with the investment committee  ·  refresh pricing on Bloomberg  ·  term sheet and KID  ·  strike on 17 Sep 2026", { x: 0.45, y: 5.25, w: 8.6, h: 0.28, fontFace: BF, fontSize: 9, italic: true, color: GOLD, margin: 0, isTextBox: true });
    s.addText("10", { x: 9.15, y: 5.28, w: 0.4, h: 0.25, fontFace: BF, fontSize: 9, color: "B9C7D6", align: "right", margin: 0, isTextBox: true });
  }

  // ======================= Appendix A1: inputs =======================
  {
    const s = pres.addSlide(); s.background = { color: WHITE };
    title(s, "Appendix A1: market inputs and assumptions", "Placeholders calibrated to typical levels; every one is a Bloomberg field to refresh at the trade date");
    const hdr = ["Index", "BBG ticker", "Implied vol", "Local rate", "Div. yield", "Quanto adj.", "Q drift", "Real-world drift"].map((h) => ({ text: h, options: { bold: true, color: WHITE, fill: { color: NAVY } } }));
    const d = [
      ["Nikkei 225", "NKY Index", "23%", "3.23% (JPY grid)", "1.7%", "+0.5%", "2.0%", "5.0%"],
      ["TAIEX", "TWSE Index", "26%", "1.75%", "2.6%", "−0.2%", "−1.1%", "5.5%"],
      ["KOSPI 200", "KOSPI2 Index", "29%", "2.75%", "1.9%", "−0.3%", "0.6%", "5.0%"],
      ["Hang Seng TECH", "HSTECH Index", "33%", "5.00% (HKD)", "0.9%", "0.0%", "4.1%", "6.0%"],
    ].map((r, i) => r.map((c) => ({ text: c, options: { fill: { color: i % 2 ? WHITE : MIST } } })));
    s.addTable([hdr, ...d], { x: 0.45, y: 1.25, w: 9.1, colW: [1.25, 1.1, 0.95, 1.4, 0.95, 1.05, 0.9, 1.5], fontFace: BF, fontSize: 9.5, color: INK, border: { type: "solid", pt: 0.5, color: LINE }, rowH: 0.36, align: "center", valign: "middle" });
    const ch = ["", "NKY", "TWSE", "KOSPI2", "HSTECH"].map((h) => ({ text: h, options: { bold: true, color: WHITE, fill: { color: NAVY } } }));
    const cm = [["NKY", "1.00", "0.55", "0.60", "0.40"], ["TWSE", "0.55", "1.00", "0.65", "0.45"], ["KOSPI2", "0.60", "0.65", "1.00", "0.50"], ["HSTECH", "0.40", "0.45", "0.50", "1.00"]]
      .map((r) => r.map((c, j) => ({ text: c, options: { bold: j === 0, fill: { color: j === 0 ? MIST : WHITE } } })));
    s.addText("Correlation matrix", { x: 0.45, y: 3.2, w: 4, h: 0.3, fontFace: HF, fontSize: 12, bold: true, color: NAVY, margin: 0, isTextBox: true });
    s.addTable([ch, ...cm], { x: 0.45, y: 3.52, w: 4.2, colW: [0.9, 0.8, 0.8, 0.85, 0.85], fontFace: BF, fontSize: 9.5, color: INK, border: { type: "solid", pt: 0.5, color: LINE }, rowH: 0.3, align: "center", valign: "middle" });
    s.addText([
      T("Funding: ", { bold: true, color: NAVY }), T("USD grid from the rules (7Y 5.75%); tenors interpolated linearly. Derivatives discounted at OIS ≈ funding − 45bp.", { breakLine: true }),
      T("Fees: ", { bold: true, color: NAVY }), T("35 bp p.a. (2.45% upfront equivalent).", { breakLine: true }),
      T("Bloomberg to pull: ", { bold: true, color: NAVY }), T("OVDV (vol surfaces), CORR / HS (1Y and 3Y correlation), BDVD (dividends), SWPM (local curves), MEMB (constituents), CDSW (Natixis CDS)."),
    ], { x: 4.9, y: 3.2, w: 4.65, h: 1.95, fontFace: BF, fontSize: 9.5, color: INK, paraSpaceAfter: 6, margin: 0, valign: "top", isTextBox: true });
    pageNo(s, "A1");
  }

  // ======================= Appendix A2: methodology =======================
  {
    const s = pres.addSlide(); s.background = { color: WHITE };
    title(s, "Appendix A2: pricing and back-test methodology", "Reproducible: every number in this deck comes from pricing/scenario2/analysis.py");
    const steps = [
      ["1", "Budget", "Option budget = 100% − ZCB(7Y, USD funding) − fees. ZCB = 1 / 1.0575^7 = 67.6%."],
      ["2", "Price", "Risk-neutral quanto GBM, 4 correlated indices, annual steps (lock-in dates), 200,000 paths, common random numbers across bumps."],
      ["3", "Solve", "Bisection on participation so the PV of the payoff above 100% equals the budget. Quote below fair to hold a model reserve."],
      ["4", "Simulate", "Real-world monthly multivariate-t (df = 5) paths for fat tails and joint crashes, 100,000 paths, equity risk premium drifts."],
      ["5", "Stress", "Six stylised 7Y paths (boom-bust, lost decade, 2008-style, China tech decoupling, Taiwan shock, steady build-out)."],
      ["6", "Risk", "Bump-and-revalue Greeks; delta-normal 10-day VaR/ES; full revaluation joint stress (spot, vol and rates together)."],
    ];
    steps.forEach((st, i) => {
      const x = 0.45 + (i % 2) * 4.6, y = 1.25 + Math.floor(i / 2) * 1.0;
      badge(s, x, y + 0.21, st[0], i % 2 ? JADE : NAVY, 0.42, 13);
      s.addText([T(st[1] + ": ", { bold: true, color: NAVY }), T(st[2])], { x: x + 0.55, y, w: 3.9, h: 0.85, fontFace: BF, fontSize: 9.5, color: INK, margin: 0, valign: "middle", isTextBox: true });
    });
    card(s, 0.45, 4.3, 9.1, 0.85, GOLDL);
    s.addText([T("Historical back-test on Bloomberg data: ", { bold: true, color: NAVY }), T("export month-end PX_LAST for NKY, TWSE, KOSPI2, HSTECH (HSI spliced before 2015) and run backtest_bloomberg.py. It produces (a) a note struck every month with a full 7Y history and (b) a 12-month block bootstrap that keeps the cross-market correlation and crisis clustering that i.i.d. resampling destroys.")],
      { x: 0.6, y: 4.32, w: 8.8, h: 0.81, fontFace: BF, fontSize: 9.5, color: INK, margin: 0, valign: "middle", isTextBox: true });
    pageNo(s, "A2");
  }

  // ======================= Appendix A3: alternatives =======================
  {
    const s = pres.addSlide(); s.background = { color: WHITE };
    title(s, "Appendix A3: alternatives we considered and rejected", "Each fails at least one of the family's constraints");
    const hdr = ["Alternative", "Appeal", "Why not for the Chak family"].map((h) => ({ text: h, options: { bold: true, color: WHITE, fill: { color: NAVY } } }));
    const rows = [
      ["Worst-of autocallable on the same 4 indices", "High fixed coupon", "Barrier exposes principal to the single worst market (Taiwan or China tail); the family needs growth, not income"],
      [`Best-of rainbow (40/30/20/10 by rank)`, "Weights the winning market", `Participation falls to ${pct(R.design_variants.rainbow_40_30_20_10_with_ladder)}: paying for dispersion the family does not need`],
      ["10-year tenor", `${pct(R.tenor_dial[3].participation)} participation`, "Locks capital beyond one succession cycle; more credit exposure to one issuer"],
      ["90% protection", `${pct(R.protection_dial[2].participation)} participation`, "A 10% loss of generational capital is outside the mandate"],
      ["Digital-asset (Bitcoin) sleeve", "Direct crypto-tech exposure", "50%+ vol would consume the option budget; reputational and custody questions for a legacy portfolio"],
      ["Asia data-centre REITs / utilities", "Close to family expertise", "Duplicates the physical layer the family already owns through its businesses"],
    ].map((r, i) => r.map((c, j) => ({ text: c, options: { bold: j === 0, color: j === 0 ? NAVY : INK, fill: { color: i % 2 ? WHITE : MIST } } })));
    s.addTable([hdr, ...rows], { x: 0.45, y: 1.25, w: 9.1, colW: [2.5, 1.8, 4.8], fontFace: BF, fontSize: 9.5, border: { type: "solid", pt: 0.5, color: LINE }, rowH: 0.55, valign: "middle", margin: 0.05 });
    pageNo(s, "A3");
  }

  // ======================= Appendix A4: sources =======================
  {
    const s = pres.addSlide(); s.background = { color: WHITE };
    title(s, "Appendix A4: sources");
    const src = [
      ["Natixis GMI, Investment Strategy Challenge 2026: game rules and USD funding grid", null],
      ["Goldman Sachs: Global AI investment forecast to exceed USD 1 trillion in 2026", "https://www.goldmansachs.com/insights/articles/global-investment-is-forecast-to-exceed-1-trillion-in-2026"],
      ["CreditSights: Hyperscaler capex 2026 estimates", "https://know.creditsights.com/insights/technology-hyperscaler-capex-2026-estimates/"],
      ["TechTimes: South Korea chips hit 47% of exports (11 Sep 2026)", "https://www.techtimes.com/articles/327359/20260911/south-korea-chips-hit-47-exports-ai-demand-shatters-september-record.htm"],
      ["Seoul Economic Daily: KOSPI cedes global lead to Taiwan (1 Oct 2026)", "https://en.sedaily.com/finance/2026/10/01/kospi-cedes-global-lead-to-taiwan-as-monthly-gains-stall"],
      ["Advisor Perspectives: World markets watchlist (21 Sep 2026)", "https://www.advisorperspectives.com/dshort/updates/2026/09/21/world-markets-watchlist-september-21-2026"],
      ["CNBC: Fed rate decision, September 2026", "https://www.cnbc.com/2026/09/16/fed-rate-decision-september-2026.html"],
      ["Allianz Research: AI capex cycle, war-proof for now (Mar 2026)", "https://www.allianz.com/content/dam/onemarketing/azcom/Allianz_com/economic-research/publications/specials/en/2026/march/2026_03_25_AI.pdf"],
      ["Hang Seng Indexes: Hang Seng TECH Index factsheet", "https://www.hsi.com.hk/eng/indexes/all-indexes/hstech"],
      ["CUHK FINA4370A Unit 4 (volatility surface) and Unit 15 (trading proposal framework)", null],
    ];
    s.addText(src.map((x, i) => T(x[0], { bullet: true, breakLine: i < src.length - 1, ...(x[1] ? { hyperlink: { url: x[1] }, color: JADE } : { color: INK }) })),
      { x: 0.45, y: 1.0, w: 9.1, h: 4.1, fontFace: BF, fontSize: 11, paraSpaceAfter: 6, margin: 0, valign: "top", isTextBox: true });
    pageNo(s, "A4");
  }

  const out = path.join(__dirname, "Asia-Digital-Bridge-Legacy-Note.pptx");
  await pres.writeFile({ fileName: out });
  console.log("wrote", out);
})();
