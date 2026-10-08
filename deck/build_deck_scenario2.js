// Scenario 2 deck: Asian Digital Transformation Buffered Autocallable Note (70% barrier + embedded 70% put) (NKE Private Wealth / Chak family)
// Numbers come from pricing/scenario2_results.json (run pricing/scenario2_autocall_mc.py first).
// Build: NODE_PATH=<dir with pptxgenjs> node deck/build_deck_scenario2.js
const path = require("path");
const pptxgen = require("pptxgenjs");
const R = require(path.join(__dirname, "..", "pricing", "scenario2_results.json"));

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9"; // 10 x 5.625
pres.title = "Asian Digital Transformation Autocallable Note";

// Palette: "Jade & Ink" (Asian digital, legacy wealth)
const INK = "0B3C49", JADE = "0F8B8D", MINT = "E6F2F0", GOLD = "D9961A", RED = "B8433A",
      TXT = "1D2B30", MUTED = "5F7176", WHITE = "FFFFFF", GRID = "DCE7E5", SLATE = "8FA6AA";
const HF = "Cambria", BF = "Calibri";

const pct = (x, d = 1) => ((Math.abs(x) < 5e-5 ? 0 : x) * 100).toFixed(d) + "%";
const CPN = R.inputs.coupon, QC = CPN / 4;
const REC = R.recommended, RN = R.rn, SV = R.coupon_sens;
const SHORT = { "3119 HK Equity": "Asia Semiconductor (3119 HK)", "2644 JP Equity": "Japan Semiconductor (2644 JP)", "EWT US Equity": "iShares MSCI Taiwan (EWT)",
                "EWY US Equity": "iShares MSCI South Korea (EWY)", "00878 TT Equity": "Taiwan ESG High Dividend (00878 TT)" };
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
  txt(s, "Asian Digital Transformation Autocallable Note", { x: 0.6, y: 1.05, w: 6.2, h: 1.75, fontFace: HF, fontSize: 34, bold: true, color: WHITE, valign: "middle" });
  txt(s, `${pct(CPN, 2)} a year from Asia's semiconductor build-out, with at least 70% of capital back whatever happens`, { x: 0.6, y: 3.0, w: 6.0, h: 0.85, fontSize: 15, italic: true, color: "E3F1EF" });
  txt(s, `USD 100mn · 5-year note issued by Natixis · ${pct(CPN, 2)} p.a. memory coupon · 70% barrier + embedded 70% put · Trade date 17 Sep 2026`, { x: 0.6, y: 4.45, w: 7.6, h: 0.4, fontSize: 11.5, bold: true, color: GOLD });
  s.addNotes("Title. One-line pitch: a buffered autocallable on five Asian ETFs covering the AI-hardware supply chain (pan-Asian and Japanese semiconductors, Taiwan, Korea) plus an ESG sleeve. It pays a coupon whenever the basket is at or above its starting level and catches up any missed coupons. At maturity the family gets 100% back unless the basket has fallen more than 30%; even then an embedded 70% put returns 70%, so the loss is capped at 30%.");
}

// ======================= Agenda (not counted) =======================
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Agenda");
  const items = [["Client & market", "Who the Chak family is, what they need, and why Asia's digital build-out now", "1–2"],
                 ["Product design", "Underlying basket, term sheet, and why a buffered autocallable (70% barrier + 70% put)", "3–4"],
                 ["Payoffs explained", "Observation timeline and the three outcomes at maturity (building blocks in the appendix)", "5"],
                 ["Scenarios & back-testing", "Stress paths and Monte Carlo outcome distributions", "6–7"],
                 ["Risks & hedging", "Investor risks, mitigants, and how the Natixis desk hedges", "8"]];
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
  title(s, "Executive summary", "One note that turns the family's operating expertise into double-digit income with a capped downside");
  const stats = [[pct(CPN, 2), "Memory coupon p.a.", `${pct(QC, 2)} each quarter the basket is ≥ 100%; missed coupons are paid later when it recovers`],
                 ["70%", "Minimum repayment", "100% back unless the basket ends below 70%; then the embedded put still pays 70%. Maximum loss 30% (plus Natixis credit)"],
                 [pct(RN.p_call_by_year[0], 0), "Called at first review", `Risk-neutral. ${pct(RN.p_called, 0)} called within 5 years; expected life ${RN.exp_life_y} years`]];
  stats.forEach((st, i) => {
    const x = 0.5 + i * 3.05;
    card(s, x, 1.35, 2.85, 2.3);
    txt(s, st[0], { x: x + 0.22, y: 1.48, w: 2.45, h: 0.8, fontFace: HF, fontSize: 38, bold: true, color: i === 1 ? GOLD : JADE, valign: "middle" });
    txt(s, st[1], { x: x + 0.22, y: 2.3, w: 2.45, h: 0.32, fontSize: 13, bold: true, color: INK });
    txt(s, st[2], { x: x + 0.22, y: 2.65, w: 2.45, h: 0.95, fontSize: 10.5, color: MUTED });
  });
  txt(s, [
    { text: "We recommend ", options: {} },
    { text: "a USD 100mn, 5-year Natixis buffered autocallable note", options: { bold: true, color: JADE } },
    { text: " on a basket of five Bloomberg-listed Asian ETFs: Global X Asia Semiconductor (3119 HK) 35%, iShares MSCI South Korea (EWY) 20%, iShares MSCI Taiwan (EWT) 15%, Global X Japan Semiconductor (2644 JP) 15% and Cathay Taiwan ESG High Dividend (00878 TT) 15%. It gives the family the AI hardware layer (chips, memory and chip-making equipment) that complements, rather than duplicates, the infrastructure, power and property they already own. ", options: {} },
    { text: `The family earns ${pct(CPN, 2)} a year in the ${pct(RN.p_called, 0)} of paths where the basket gets back to its starting level, gets 100% back if it ends anywhere above 70%, and never less than 70% (${pct(RN.p_floor, 0)} of paths, risk-neutral). Fair value is ${pct(REC.pv)}, so issuing at par leaves Natixis ${pct(REC.natixis_margin)} for hedging and margin.`, options: { bold: true } },
  ], { x: 0.5, y: 3.85, w: 9, h: 1.3, fontSize: 11.5 });
  s.addNotes("Executive summary (does not count toward the 10-slide limit).");
}

// ======================= 1. Client =======================
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "The family wants growth without putting the legacy at risk", "Client diagnosis: third-generation dynasty, succession done, now allocating for legacy");
  const cols = [
    ["Who they are", ["Single-family office: NKE Private Wealth", "Net worth > USD 2bn; mandate USD 100mn (~5%)", "Businesses: tech infrastructure, renewable power plants, real estate in Japan and Greater China"]],
    ["What they want", ["Capital appreciation for future generations", "Meaningful exposure to Asia's digital transformation", "To bridge traditional Asian sectors with emerging tech they know"]],
    ["What they can bear", ["Moderate risk: preserve the legacy first", "5-year horizon; coupons can be reinvested", "Accepts limited liquidity on 5% of wealth", "Volatile backdrop: loss must be capped"]],
  ];
  cols.forEach((c, i) => {
    const x = 0.5 + i * 3.05;
    card(s, x, 1.3, 2.85, 2.25, i === 2 ? INK : MINT);
    txt(s, c[0], { x: x + 0.2, y: 1.42, w: 2.5, h: 0.32, fontSize: 14, bold: true, color: i === 2 ? GOLD : INK });
    txt(s, c[1].map((t, j) => ({ text: t, options: { bullet: true, breakLine: j < c[1].length - 1 } })),
      { x: x + 0.2, y: 1.8, w: 2.5, h: 1.7, fontSize: 10.5, color: i === 2 ? WHITE : TXT, paraSpaceAfter: 3 });
  });
  const rows = [[hdr("Client need"), hdr("Design answer in our note")],
    ["Capital appreciation", `${pct(CPN, 2)} p.a. coupon, above the 5.69% 5Y USD funding rate, in every path that autocalls; proceeds roll into the next note`],
    ["Exposure to Asian digital transformation", "Semiconductor-heavy basket: the AI hardware layer behind the family's tech-infrastructure business (slide 3)"],
    ["Generational preservation", "70% barrier plus embedded 70% put: maximum loss 30% at maturity; diversified basket (not worst-of); BPCE-backed issuer"],
    ["Volatile markets", "Memory coupon: a missed coupon is paid when the basket recovers; a fall of up to 30% at maturity costs nothing"]];
  s.addTable(rows, { x: 0.5, y: 3.7, w: 9, colW: [2.6, 6.4], fontFace: BF, fontSize: 9.5, color: TXT, border: { type: "solid", pt: 0.5, color: GRID }, fill: { color: WHITE }, rowH: 0.27, margin: [2, 5, 2, 5] });
  pageNo(s, 1);
  s.addNotes("Client needs translate one-for-one into design features. The key insight: this is legacy money. The family wants growth and Asian tech exposure, but the first rule is to never suffer a large loss. That points us to an autocallable with a 30% buffer and a hard 70% floor, paying a double-digit coupon that rewards recovery and is never lost, thanks to memory.");
}

// ======================= 2. Market view =======================
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Why now: Asia builds the hardware of the AI economy", "Investment thesis: structural growth themes, and high rates and volatility that pay for a coupon with a floor");
  const th = [["Taiwan: the AI foundry", "TSMC and its supply chain make most of the world's advanced AI chips; Taiwan's index is dominated by semiconductors."],
              ["Korea: memory for AI", "Samsung and SK hynix supply the high-bandwidth memory every AI accelerator needs; together ~44% of EWY."],
              ["Japan: chip-making tools", "Tokyo Electron, Advantest and peers make the equipment and testers chip factories need, alongside TSE governance reforms."],
              ["ESG sleeve", "00878 adds ESG-screened Taiwan leaders (MSCI ESG methodology) and a lower-volatility, high-dividend anchor to the basket."]];
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
          { text: `High USD rates make the principal cheap to fund (5Y zero-coupon ${pct(R.inputs.zcb_5y)}). Asian volatility (basket ~${pct(R.basket_vol, 0)}) makes the basket likely to revisit 100%, which pays the ${pct(CPN, 2)} coupon, and the embedded 70% put caps the loss at 30%.`, options: { color: WHITE } }],
    { x: 6.3, y: 3.65, w: 3.05, h: 1.4, fontSize: 10 });
  foot(s, "Thesis is qualitative; index-level data to be refreshed on Bloomberg. Funding grid: Investment Strategy Challenge 2026 rules.");
  pageNo(s, 2);
  s.addNotes("Two arguments. (1) Structural: AI spending flows straight into Asian semiconductors: Taiwan makes the chips, Korea the memory, Japan the chip-making tools, plus an ESG-screened Taiwan sleeve. (2) Structuring: high USD rates make the principal cheap, Asian volatility makes the 100% coupon trigger likely to be hit, and a 70% put caps the downside, so we can pay a double-digit coupon with a hard floor.");
}

// ======================= 3. Basket =======================
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Underlying: five Asian ETFs across the AI-hardware chain", "Bespoke weighted basket, USD payout (quanto on the HKD, JPY and TWD lines); all Bloomberg-listed");
  const L = R.inputs.underlyings, names = Object.keys(L);
  const COLS = [INK, JADE, GOLD, SLATE, "5BA37A"];
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
  pageNo(s, 3);
  s.addNotes("Five Bloomberg-listed ETFs: 3119 HK (Asia semiconductors), 2644 JP (Japan semiconductors), EWT and EWY (US-listed Taiwan and Korea country funds) and 00878 TT (Taiwan ESG high dividend). EWT and EWY trade in USD, so no quanto is needed; the HKD, JPY and TWD lines are quantoed into USD. Check: 3119 trading value against the USD 5M/day rule, 2644 top holdings, and 00878 distributions (~7.6% a year), which reduce its price-return path and so the chance of the basket getting back to 100%.");
}

// ======================= 4. Term sheet + design choice =======================
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, `Term sheet: 5-year buffered autocallable, ${pct(CPN, 2)} coupon`, "Why this design: a double-digit coupon, with the loss at maturity capped at 30%");
  const terms = [["Issuer", "Natixis SA (BPCE Group)"], ["Notional / currency", "USD 100,000,000 · quanto USD"], ["Trade / maturity", "17 Sep 2026 / 17 Sep 2031 (5Y)"],
                 ["Underlying", `Weighted basket of ${R.inputs.weights.length} Asian ETFs (slide 3)`], ["Observation", "Quarterly, 20 dates; autocall from Q4 (Year 1)"],
                 ["Coupon", `${pct(CPN, 2)} p.a. (${pct(QC, 2)} per quarter), paid if basket ≥ 100%`], ["Memory", "Missed coupons paid on the next date basket ≥ 100%"],
                 ["Autocall", "Basket ≥ 100% from Q4: 100% + coupons due, note ends"], ["At maturity", "100% if basket ≥ 70%; otherwise 70% (embedded 70% put)"],
                 ["Issue price / fair value", `100% / ${pct(REC.pv)}`]];
  const rows = terms.map((t) => [{ text: t[0], options: { bold: true, color: INK, fill: { color: MINT } } }, t[1]]);
  s.addTable(rows, { x: 0.5, y: 1.3, w: 4.6, colW: [1.45, 3.15], fontFace: BF, fontSize: 9.5, color: TXT, border: { type: "solid", pt: 0.5, color: WHITE }, fill: { color: "F5F9F8" }, rowH: 0.34, margin: [2, 5, 2, 5], valign: "middle" });
  const D = R.designs, OURS = "70% barrier + 70% put, memory coupon (ours)";
  const show = [["Classic: fixed coupon, 70% barrier", "Classic fixed coupon, 70% barrier", "Up to 100%"],
                ["Snowball, 65% barrier", "Snowball, 65% barrier", "Up to 100%"],
                ["Memory coupon, 70% barrier, no put", "Memory coupon, 70% barrier, no put", "Up to 100%"],
                ["Capital protected (100%), memory coupon", "Memory coupon, 100% protected", "None"],
                [OURS, "Memory coupon, 70% barrier + 70% put (ours)", "30%"]];
  const drow = [[hdr("Autocall design (same basket, issued at 98%)"), hdr("Fair cpn"), hdr("Loss risk"), hdr("Max loss")]];
  show.forEach(([k, lab, ml]) => {
    const o = k === OURS ? { bold: true, color: JADE, fill: { color: MINT } } : {};
    drow.push([{ text: lab, options: o }, { text: pct(D[k].fair_coupon), options: o }, { text: pct(D[k].p_loss), options: o }, { text: ml, options: o }]);
  });
  s.addTable(drow, { x: 5.35, y: 1.3, w: 4.2, colW: [2.2, 0.62, 0.66, 0.72], fontFace: BF, fontSize: 8.5, color: TXT, valign: "middle", align: "left",
    border: { type: "solid", pt: 0.5, color: GRID }, fill: { color: WHITE }, rowH: [0.3, 0.33, 0.33, 0.33, 0.33, 0.33], margin: [2, 4, 2, 4] });
  card(s, 5.35, 3.45, 4.2, 1.4, INK);
  const np_ = D["Memory coupon, 70% barrier, no put"], fp = D["Capital protected (100%), memory coupon"];
  txt(s, [{ text: "Design call: ", options: { bold: true, color: GOLD } },
          { text: `The draft's 8.5% fixed coupon is worth ${pct(R.draft_8_5_fixed_70_pv)}, so Natixis cannot fund it. Full protection pays only ${pct(fp.fair_coupon)}. Without a put the coupon is ${pct(np_.fair_coupon)}, but a crash can wipe out the capital. The embedded 70% put costs ~${(100 * (np_.fair_coupon - REC.fair_coupon)).toFixed(1)}pts of coupon and caps the loss at 30%: fair ${pct(REC.fair_coupon)}, we offer ${pct(CPN, 2)}.`, options: { color: WHITE } }],
    { x: 5.5, y: 3.53, w: 3.9, h: 1.28, fontSize: 9.5 });
  foot(s, NOTE + " Loss risk = probability the note returns less than 100% at maturity (risk-neutral).");
  pageNo(s, 4);
  s.addNotes("The table is the key design argument. Full protection is safe but pays under 8%. Removing all protection pays more but exposes the family to the whole drawdown in a crash. Our design sits between: the family accepts the first 30% of loss below the barrier risk only in a deep fall, and Natixis embeds a 70% put so the worst case is 70% back. The put costs a little over 2 points of coupon, which is the price of the hard floor.");
}

// ======================= 5. How it pays: timeline + payoff at maturity =======================
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "How it pays: one question every quarter, three outcomes", "Is the basket at or above 100% of its starting level? (checked quarterly; one date per year shown)");
  const yrs = [1, 2, 3, 4, 5];
  txt(s, `Q1–Q3: coupon only (${pct(QC, 2)} if basket ≥ 100%). From Q4: coupon plus autocall. Missed coupons are always caught up.`, { x: 1.4, y: 1.15, w: 7.9, h: 0.25, fontSize: 9, italic: true, color: MUTED, align: "center" });
  s.addShape(pres.shapes.LINE, { x: 0.8, y: 1.7, w: 8.4, h: 0, line: { color: SLATE, width: 2 } });
  dot(s, 0.55, 1.49, "0", SLATE, 0.42);
  txt(s, "Trade date\n17 Sep 2026", { x: 0.15, y: 1.95, w: 1.25, h: 0.4, fontSize: 8.5, color: MUTED, align: "center" });
  yrs.forEach((y, i) => {
    const x = 2.15 + i * 1.6;
    dot(s, x, 1.49, "Y" + y, y === 5 ? GOLD : JADE, 0.42);
    txt(s, `If ≥ 100%: called,\n${pct(1 + CPN * y)} total`, { x: x - 0.5, y: 1.95, w: 1.42, h: 0.42, fontSize: 9, bold: true, color: y === 5 ? GOLD : JADE, align: "center" });
    txt(s, `P(called by Y${y}) ${pct(RN.p_call_by_year[i], 0)}`, { x: x - 0.5, y: 2.36, w: 1.42, h: 0.22, fontSize: 8, color: MUTED, align: "center" });
  });
  // Payoff at Y5 (not called earlier)
  const xs = []; for (let x = 30; x <= 160; x += 0.5) xs.push(x);
  const note = xs.map((x) => (x >= 100 ? 100 + CPN * 100 * 5 : x >= 70 ? 100 : 70));
  s.addChart(pres.charts.SCATTER, [{ name: "X", values: xs }, { name: "Autocallable note", values: note }, { name: "Basket directly", values: xs }],
    Object.assign(chartBase(), { x: 0.35, y: 2.7, w: 4.6, h: 2.45, chartColors: [JADE, SLATE], lineSize: 2.25, lineDataSymbol: "none", showLegend: true, legendPos: "b", legendFontSize: 8.5,
      valAxisMinVal: 20, valAxisMaxVal: 170, catAxisMinVal: 30, catAxisMaxVal: 160, valAxisLabelFormatCode: '0"%"', catAxisLabelFormatCode: '0"%"', catAxisMajorUnit: 20,
      showCatAxisTitle: true, catAxisTitle: "Final basket level (% of initial)", catAxisTitleFontSize: 8.5, catAxisTitleColor: MUTED,
      showTitle: true, title: "Total received at Y5 if never called", titleFontSize: 9.5 }));
  const outs = [
    ["A", "Autocalled", `Basket ≥ 100% on any date from Q4: 100% plus every coupon to date. The note ends.`, pct(RN.p_called, 0), JADE],
    ["B", "Not called, basket ≥ 70% at Y5", "The 30% buffer absorbs the fall: 100% back, plus any early coupons.", pct(RN.p_not_called_some_cpn + RN.p_zero_return, 0), SLATE],
    ["C", "Not called, basket < 70% at Y5", "The embedded put pays 70% back. Maximum loss 30%.", pct(RN.p_floor, 0), GOLD],
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
  foot(s, "Probabilities are risk-neutral (drift = funding rate − dividends); real-world outcomes are on slide 7. The desk's replication (bond, coupon digitals, 70% put pair) is in Appendix B.");
  pageNo(s, 5);
  s.addNotes(`Explain the note as one question asked every quarter: is the basket at or above where it started? If yes, the family is paid ${pct(QC, 2)} for that quarter plus any coupons missed before, and from Year 1 the note also ends with 100% back. If the note is never called, the payoff chart shows three zones at Year 5: at or above 100% the family receives ${pct(1 + CPN * 5)}; between 70% and 100% it gets 100% back; below 70% the embedded put pays 70%, so the loss stops at 30%.`);
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
      valAxisLabelFormatCode: '0"%"', showTitle: true, title: "Basket level (% of initial); coupon and autocall level 100%", titleFontSize: 9.5 }));
  const rows = [[hdr("Scenario"), hdr("Outcome"), hdr("Coupons"), hdr("USD mn"), hdr("IRR"), hdr("Basket")]];
  names.forEach((n, i) => {
    const o = st[n];
    const outcome = o.call_q ? `Called Q${o.call_q} (${o.years}y)` : o.total < 0.99 ? "70% back at Y5 (put)" : "100% back at Y5";
    const basket = o.call_q ? "–" : pct(o.path[19] - 1, 0);
    rows.push([{ text: n, options: { bold: true, color: cols[i] === SLATE ? MUTED : cols[i] } }, outcome, pct(o.coupons), (o.total * 100).toFixed(1), pct(o.irr), basket]);
  });
  s.addTable(rows, { x: 5.1, y: 1.3, w: 4.45, colW: [1.42, 0.98, 0.58, 0.52, 0.47, 0.48], fontFace: BF, fontSize: 8.5, color: TXT, valign: "middle",
    border: { type: "solid", pt: 0.5, color: GRID }, fill: { color: WHITE }, rowH: 0.42, margin: [2, 3, 2, 3] });
  card(s, 5.1, 3.95, 4.45, 1.15);
  txt(s, [{ text: "Reading: ", options: { bold: true, color: JADE } },
          { text: `the note earns ~${pct(Math.min(...names.filter((n) => st[n].call_q).map((n) => st[n].irr)))}–${pct(Math.max(...names.filter((n) => st[n].call_q).map((n) => st[n].irr)))} a year whenever the basket gets back to 100%, even after a 30% drawdown: memory pays all 15 missed coupons at Q15. In a lost decade (basket −12%) the buffer returns 100%; in a lasting shock (basket −45%) the embedded put returns 70%.` }],
    { x: 5.25, y: 4.03, w: 4.2, h: 1.0, fontSize: 9.5 });
  foot(s, "Paths are illustrative and not forecasts. 'Basket' = direct basket return at Y5 when the note is not called. Historical back-test to run on Bloomberg history (appendix).");
  pageNo(s, 6);
  s.addNotes("Walk the five scenarios. The 2022-style path is the key one: a 30% drawdown in the first year that would scare a direct investor, yet the note pays all 15 quarterly coupons at once when the basket recovers at Q15. The two bad paths show the two layers of protection: at −12% the 30% buffer returns 100%; at −45% the embedded put returns 70%, so the family loses 30% instead of 45%.");
}

// ======================= 9. Simulation results =======================
{
  const s = pres.addSlide(); s.background = { color: WHITE };
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
  add("Zero return (100% back)", (m) => pct(m.p_zero_return, 0));
  add("70% back (put pays)", (m) => pct(m.p_floor, 0));
  s.addTable(rows, { x: 4.45, y: 1.25, w: 5.1, colW: [1.42, 0.92, 0.92, 0.92, 0.92], fontFace: BF, fontSize: 9, color: TXT, align: "center", valign: "middle",
    border: { type: "solid", pt: 0.5, color: GRID }, fill: { color: WHITE }, rowH: 0.3, margin: [2, 4, 2, 4] });
  const kp = [[pct(RN.p_call_by_year[0], 0), `called at the first review (${pct(1 + CPN)} total)`], [pct(RN.p_floor, 0), "chance of 70% back: loss capped at 30%"], ["70%", "worst case at maturity, in every path"]];
  kp.forEach((k, i) => {
    const x = 0.45 + i * 3.05;
    card(s, x, 3.95, 2.85, 1.1, i === 2 ? INK : MINT);
    txt(s, k[0], { x: x + 0.15, y: 4.02, w: 1.15, h: 0.95, fontFace: HF, fontSize: 24, bold: true, color: i === 2 ? GOLD : JADE, valign: "middle" });
    txt(s, k[1], { x: x + 1.3, y: 4.02, w: 1.45, h: 0.95, fontSize: 10, color: i === 2 ? WHITE : TXT, valign: "middle" });
  });
  foot(s, NOTE + " IRR uses actual quarterly coupon dates.");
  pageNo(s, 7);
  s.addNotes(`The table answers 'what if markets go nowhere?'. Even at 0% equity return the note is called in ~${pct(R.real_world["0%"].p_called, 0)} of paths, because volatility alone takes the basket back to 100% on some date. The honest cost of the higher coupon: in ~${pct(RN.p_floor, 0)} of paths (risk-neutral; ${pct(R.real_world["8%"].p_floor, 0)} at 8% equity returns) the basket ends below 70% and the family gets 70% back, but never less.`);
}

// ======================= 10. Risks & hedging =======================
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Risks for the family, and how Natixis hedges its side", "Transparent disclosure plus a desk hedging plan for every exposure");
  const risks = [["Capital loss", `Basket below 70% at Y5: 70% back, a 30% loss (~${pct(RN.p_floor, 0)} of paths)`, "Embedded 70% put caps the loss; diversified basket; only 5% of wealth"],
                 ["Capped upside", `Basket +80% still pays ${pct(CPN, 2)} p.a. and is called at Y1`, "Rest of family wealth keeps direct equity exposure"],
                 ["ETF structure", "00878 pays ~7.6% a year out, lowering its price path; 3119 trading is thin; ETF tracking error", "00878 held at 15%; verify volumes; Natixis can reference total-return versions"],
                 ["Issuer credit", "Repayment and the 70% floor depend on Natixis / BPCE", "BPCE senior rating; optional collateralised wrapper"],
                 ["Liquidity / MTM", "Sold before maturity, the price can be below 100%", "Natixis daily indicative price; hold to call or maturity"]];
  const rows = [[hdr("Risk"), hdr("What could happen"), hdr("Mitigant")]].concat(risks.map((r) => [{ text: r[0], options: { bold: true, color: INK } }, r[1], r[2]]));
  s.addTable(rows, { x: 0.45, y: 1.25, w: 5.4, colW: [1.15, 2.15, 2.1], fontFace: BF, fontSize: 8.5, color: TXT, valign: "middle",
    border: { type: "solid", pt: 0.5, color: GRID }, fill: { color: WHITE }, rowH: [0.27, 0.56, 0.5, 0.5, 0.5, 0.56], margin: [2, 4, 2, 4] });
  const hedges = [["Coupon digitals", "Natixis owes basket digitals struck at 100%: replicated with tight basket call spreads, delta-hedged with ETF units, constituent stocks and index futures as proxies; listed options on EWY/EWT"],
                  ["Vol & correlation", `Coupon value moves with basket vol and correlation (fair ${pct(SV["vol -3pts"])}–${pct(SV["vol +3pts"])} for vol ±3pts): managed with listed index options and correlation trades`],
                  ["Quanto FX", "EWT and EWY already trade in USD; 3119 (HKD, pegged), 2644 (JPY) and 00878 (TWD) need FX forwards and a quanto adjustment"],
                  ["Put pair & funding", "Natixis is long the client's 70% barrier put and short the embedded 70% put: a 30% digital put, hedged with basket put spreads. Principal funded at 5.69%"]];
  hedges.forEach((h, i) => {
    const y = 1.25 + i * 0.97;
    card(s, 6.05, y, 3.5, 0.87, i % 2 ? MINT : "F2F7F6");
    txt(s, h[0], { x: 6.18, y: y + 0.07, w: 3.25, h: 0.25, fontSize: 10.5, bold: true, color: JADE });
    txt(s, h[1], { x: 6.18, y: y + 0.32, w: 3.25, h: 0.52, fontSize: 8.5, color: TXT });
  });
  txt(s, [{ text: "Pricing sensitivity (fair coupon): ", options: { bold: true, color: INK } },
          { text: `base ${pct(SV.base)} · vol ±3pts ${pct(SV["vol -3pts"])}–${pct(SV["vol +3pts"])} · corr ±0.15 ${pct(SV["corr -0.15"])}–${pct(SV["corr +0.15"])} · equity drift −1/−2% ${pct(SV["drift -1%"])}–${pct(SV["drift -2%"])}. ${["base", "vol -3pts", "vol +3pts", "corr -0.15", "corr +0.15", "drift -1%", "drift -2%"].every((k) => SV[k] >= CPN - 1e-9) ? `The ${pct(CPN, 2)} offer stays fundable in every case.` : `The ${pct(CPN, 2)} offer needs re-checking if vols or correlation fall.`}` }],
    { x: 0.45, y: 4.45, w: 5.4, h: 0.7, fontSize: 9 });
  pageNo(s, 8);
  s.addNotes(`Investor risks on the left, desk hedges on the right. The capital-loss line is explicit: below 70% at maturity the family loses 30%, never more. The other honest risks are capped upside and Natixis credit. The ${pct(CPN, 2)} coupon sits below the ${pct(SV.base)} fair level in every sensitivity we ran, so the offer is robust to market moves before the trade date.`);
}

// ======================= Appendix A: assumptions & method =======================
{
  const s = pres.addSlide(); s.background = { color: WHITE };
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
  const rows2 = [[hdr("Variant of our note (70% barrier + put)"), hdr("Fair cpn")],
    ["Coupon barrier 100% (base)", pct(SV.base)], ["Coupon barrier 95%", pct(SV["cpn barrier 95%"])], ["Coupon barrier 90%", pct(SV["cpn barrier 90%"])],
    ["First autocall at Y2", pct(SV["first call Y2"])], ["Equity drift −1%", pct(SV["drift -1%"])], ["Equity drift −2%", pct(SV["drift -2%"])],
    ["Vol +3pts / −3pts", `${pct(SV["vol +3pts"])} / ${pct(SV["vol -3pts"])}`]];
  s.addTable(rows2, { x: 5.95, y: 1.3, w: 3.6, colW: [2.5, 1.1], fontFace: BF, fontSize: 9, color: TXT, valign: "middle",
    border: { type: "solid", pt: 0.5, color: GRID }, fill: { color: WHITE }, rowH: 0.29, margin: [2, 4, 2, 4] });
  txt(s, "All variants priced at 98% with the same basket and inputs. Code: pricing/scenario2_autocall_mc.py", { x: 5.95, y: 3.7, w: 3.6, h: 0.45, fontSize: 8.5, italic: true, color: MUTED });
}

// ======================= Appendix B: building blocks =======================
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Appendix B: how Natixis replicates the note", "Replication used by the Natixis desk to price and hedge (values in % of notional, at trade date)");
  const xs = []; for (let x = 40; x <= 160; x += 1) xs.push(x);
  const blocks = [
    ["Principal", `100% repaid at autocall or maturity. Worth ${pct(REC.pv_principal)}`, xs.map(() => 100), INK, [0, 120], "Basket on any date"],
    ["Coupon digitals", `${pct(QC, 2)} plus missed coupons on each date ≥ 100%. Worth ${pct(REC.pv_coupons)} (net of autocall)`, xs.map((x) => (x >= 100 ? QC * 100 : 0)), JADE, [-0.5, 3.2], "Basket on any date"],
    ["Autocall (Natixis)", "From Q4, basket ≥ 100%: remaining coupons cancelled, note ends. Keeps the coupon affordable", xs.map((x) => (x >= 100 ? 0 : 1)), SLATE, [-0.3, 1.4], "Basket on any date"],
    ["70% put pair", `Client sells a 70% barrier put (${pct(-REC.pv_short_barrier_put)}); the note embeds a 70% put back (${pct(REC.pv_long_put)}). Net: −30% only if < 70% at Y5`, xs.map((x) => (x < 70 ? -30 : 0)), RED, [-36, 6], "Basket at Y5"],
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
  txt(s, [{ text: `Fair value ${pct(REC.pv)} = principal ${pct(REC.pv_principal)} + coupons ${pct(REC.pv_coupons)} − put pair ${pct(-REC.pv_buffer_net)}.  `, options: { bold: true, color: GOLD } },
          { text: `Issued at 100%, leaving ${pct(REC.natixis_margin)} for hedging and margin. The short barrier put funds the higher coupon; the embedded put stops the loss at 30%.`, options: { color: WHITE } }],
    { x: 0.6, y: 4.52, w: 8.8, h: 0.6, fontSize: 10, valign: "middle" });
  s.addNotes("Mini-charts show each leg's payoff against the basket level (the autocall leg is illustrative: it shows the remaining coupon stream switching off). The put pair is the key: like a classic autocall, the client sells a put at the 70% barrier, which funds the double-digit coupon; unlike a classic autocall, the note buys a 70% put back, so below 70% the loss is a fixed 30% instead of the whole fall. Together they are a 30% digital put struck at 70%, observed only at maturity.");
}

// ======================= Appendix C: alternatives =======================
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Appendix C: alternatives for the investment committee", "Same basket: full protection, a higher-coupon at-risk snowball, and a pure participation note");
  const p = R.ppn, sb = R.snowball_alt;
  const xs = []; for (let x = 40; x <= 180; x += 1) xs.push(x);
  s.addChart(pres.charts.SCATTER, [{ name: "X", values: xs },
    { name: `Our note (${pct(CPN, 2)})`, values: xs.map((x) => (x >= 100 ? 100 + CPN * 500 : x >= 70 ? 100 : 70)) },
    { name: `Snowball ${pct(sb.coupon, 0)}, 65% barrier`, values: xs.map((x) => (x >= 100 ? 100 + sb.coupon * 500 : x >= sb.barrier * 100 ? 100 : x)) },
    { name: "PPN", values: xs.map((x) => 100 + p.participation * Math.max(x - 100, 0)) }, { name: "Basket", values: xs }],
    Object.assign(chartBase(), { x: 0.4, y: 1.25, w: 5.0, h: 3.6, chartColors: [JADE, RED, GOLD, SLATE], lineSize: 2, lineDataSymbol: "none", showLegend: true, legendPos: "b", legendFontSize: 8.5,
      valAxisMinVal: 30, valAxisMaxVal: 190, catAxisMinVal: 40, catAxisMaxVal: 180, catAxisMajorUnit: 20, valAxisLabelFormatCode: '0"%"', catAxisLabelFormatCode: '0"%"',
      showTitle: true, title: "Total received at Y5 (not called earlier) vs final basket level", titleFontSize: 9.5 }));
  const rows = [[hdr("Option"), hdr("Return"), hdr("Loss risk")],
                [{ text: "Buffered autocallable (ours)", options: { bold: true, color: JADE } }, `${pct(CPN, 2)} p.a. memory coupon`, `${pct(RN.p_floor, 0)} (max 30%)`],
                ["100% protected autocallable", `~${pct(R.protected_100_fair_coupon, 1)} fair coupon`, "0%"],
                ["Snowball, 65% barrier", `${pct(sb.coupon, 0)} p.a., paid at call`, pct(sb.p_loss)],
                ["Principal-protected note", `${pct(p.participation, 0)} of basket gain at Y5`, "0%"]];
  s.addTable(rows, { x: 5.7, y: 1.3, w: 3.85, colW: [1.6, 1.45, 0.8], fontFace: BF, fontSize: 9, color: TXT, valign: "middle",
    border: { type: "solid", pt: 0.5, color: GRID }, fill: { color: WHITE }, rowH: 0.36, margin: [2, 4, 2, 4] });
  card(s, 5.7, 3.2, 3.85, 1.25);
  txt(s, [{ text: "Trade-off: ", options: { bold: true, color: JADE } },
          { text: `The snowball pays ${pct(sb.coupon, 0)} but loses capital in ~${pct(sb.p_loss, 0)} of paths. Full protection pays only ~${pct(R.protected_100_fair_coupon, 0)}. The PPN pays nothing unless the basket ends above 100% after 5 years. Our note pays ${pct(CPN, 2)} and caps the loss at 30%, with money usually back within ~2 years.` }],
    { x: 5.85, y: 3.27, w: 3.6, h: 1.12, fontSize: 9 });
  foot(s, NOTE);
}

function yrs5() { return [1, 2, 3, 4, 5]; }

pres.writeFile({ fileName: path.join(__dirname, "Asian-Digital-Autocallable-Note.pptx") }).then((f) => console.log("wrote", f));
