// Scenario 2 deck: Asian Digital Transformation Capital-Protected Autocallable Note (NKE Private Wealth / Chak family)
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
  txt(s, `${pct(CPN)} a year from Asia's semiconductor build-out, with 100% of capital returned at maturity`, { x: 0.6, y: 3.0, w: 6.0, h: 0.85, fontSize: 15, italic: true, color: "E3F1EF" });
  txt(s, `USD 100mn · 5-year note issued by Natixis · ${pct(CPN)} p.a. memory coupon · 100% capital protected · Trade date 17 Sep 2026`, { x: 0.6, y: 4.45, w: 7.6, h: 0.4, fontSize: 11.5, bold: true, color: GOLD });
  s.addNotes("Title. One-line pitch: a capital-protected autocallable on the four Asian digital-transformation engines the Chak family already knows from its businesses. It pays 6.5% a year whenever the basket is at or above its starting level, catches up any missed coupons, and returns 100% of capital at maturity whatever the basket does.");
}

// ======================= Agenda (not counted) =======================
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Agenda");
  const items = [["Client & market", "Who the Chak family is, what they need, and why Asia's digital build-out now", "1–2"],
                 ["Product design", "Underlying basket, term sheet, and why a capital-protected autocallable", "3–4"],
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
  title(s, "Executive summary", "One note that turns the family's operating expertise into protected returns");
  const stats = [[pct(CPN), "Memory coupon p.a.", `${pct(QC, 2)} each quarter the basket is ≥ 100%; missed coupons are paid later when it recovers`],
                 ["100%", "Capital protected", "Principal returned in full at maturity whatever the basket does (Natixis credit risk only)"],
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
    { text: "a USD 100mn, 5-year Natixis capital-protected autocallable note", options: { bold: true, color: JADE } },
    { text: " on a semiconductor-heavy basket of four real, Bloomberg-listed indices (Taiwan TAIEX 35%, KOSPI 200 25%, Nikkei 225 20%, PHLX Semiconductor 20%). It gives the family the AI hardware layer (chips, memory and chip-making equipment) that complements, rather than duplicates, the infrastructure, power and property they already own. ", options: {} },
    { text: `The family never loses capital at maturity, earns ${pct(CPN)} a year in the ${pct(RN.p_called, 0)} of paths where the basket gets back to its starting level, and gets 100% back in the rest. Fair value is ${pct(REC.pv)}, so issuing at par leaves Natixis ${pct(REC.natixis_margin)} for hedging and margin.`, options: { bold: true } },
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
    ["What they can bear", ["Moderate risk: preserve the legacy first", "5-year horizon; coupons can be reinvested", "Accepts limited liquidity on 5% of wealth", "Volatile backdrop: no capital at risk"]],
  ];
  cols.forEach((c, i) => {
    const x = 0.5 + i * 3.05;
    card(s, x, 1.3, 2.85, 2.25, i === 2 ? INK : MINT);
    txt(s, c[0], { x: x + 0.2, y: 1.42, w: 2.5, h: 0.32, fontSize: 14, bold: true, color: i === 2 ? GOLD : INK });
    txt(s, c[1].map((t, j) => ({ text: t, options: { bullet: true, breakLine: j < c[1].length - 1 } })),
      { x: x + 0.2, y: 1.8, w: 2.5, h: 1.7, fontSize: 10.5, color: i === 2 ? WHITE : TXT, paraSpaceAfter: 3 });
  });
  const rows = [[hdr("Client need"), hdr("Design answer in our note")],
    ["Capital appreciation", `${pct(CPN)} p.a. coupon, above the 5.69% 5Y USD funding rate, in every path that autocalls; proceeds roll into the next note`],
    ["Exposure to Asian digital transformation", "Semiconductor-heavy basket: the AI hardware layer behind the family's tech-infrastructure business (slide 3)"],
    ["Generational preservation", "100% capital protection at maturity, diversified basket (not worst-of), BPCE-backed issuer"],
    ["Volatile markets", "Memory coupon: a missed coupon is not lost but paid when the basket recovers; drawdowns cannot touch the principal"]];
  s.addTable(rows, { x: 0.5, y: 3.7, w: 9, colW: [2.6, 6.4], fontFace: BF, fontSize: 9.5, color: TXT, border: { type: "solid", pt: 0.5, color: GRID }, fill: { color: WHITE }, rowH: 0.27, margin: [2, 5, 2, 5] });
  pageNo(s, 1);
  s.addNotes("Client needs translate one-for-one into design features. The key insight: this is legacy money. The family wants growth and Asian tech exposure, but the first rule is not to lose capital. That points us to an autocallable whose principal is fully protected, with a coupon that rewards recovery and is never lost, thanks to memory.");
}

// ======================= 2. Market view =======================
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Why now: Asia builds the hardware of the AI economy", "Investment thesis: structural growth themes, and a rate level that makes capital protection cheap");
  const th = [["Taiwan: the AI foundry", "TSMC and its supply chain make most of the world's advanced AI chips; Taiwan's index is dominated by semiconductors."],
              ["Korea: memory for AI", "Samsung and SK Hynix supply the high-bandwidth memory every AI accelerator needs; together a large share of KOSPI 200."],
              ["Japan: chip-making tools", "Tokyo Electron, Advantest and peers make the equipment and testers chip factories need, alongside TSE governance reforms."],
              ["Global chip leaders", "The PHLX Semiconductor index adds the global designers and toolmakers (incl. TSMC and ASML ADRs) on the other side of Asia's supply chain."]];
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
          { text: `High USD rates make the 5Y zero-coupon bond cheap (${pct(R.inputs.zcb_5y)}), so guaranteeing 100% back costs little. Asian equity volatility (basket ~${pct(R.basket_vol, 0)}) makes it likely the basket revisits 100%, which is what pays the ${pct(CPN)} coupon.`, options: { color: WHITE } }],
    { x: 6.3, y: 3.65, w: 3.05, h: 1.4, fontSize: 10 });
  foot(s, "Thesis is qualitative; index-level data to be refreshed on Bloomberg. Funding grid: Investment Strategy Challenge 2026 rules.");
  pageNo(s, 2);
  s.addNotes("Two arguments. (1) Structural: AI spending flows straight into Asian semiconductors: Taiwan makes the chips, Korea the memory, Japan the chip-making tools, with global chip leaders on the other side of the supply chain. (2) Structuring: high USD rates make the protected principal cheap, and Asian volatility makes the 100% coupon trigger likely to be hit, so we can protect capital and still pay above the funding rate.");
}

// ======================= 3. Basket =======================
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Underlying: a semiconductor-heavy basket of four indices", "Bespoke weighted basket, USD quanto (FX risk sits with Natixis); all constituents searchable on Bloomberg");
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
  const theme = ["Foundry and chip supply chain (TSMC, MediaTek, ASE): the core of AI chip production, in the family's Greater China home region",
                 "Memory for AI (Samsung, SK Hynix): high-bandwidth memory inside every AI accelerator",
                 "Chip-making equipment and test (Tokyo Electron, Advantest): home market of the family's tech-infrastructure business",
                 "Global semiconductor leaders, USD-listed: diversifies beyond Asia's single-country risks"];
  const rows = [[hdr("Index (Bloomberg)"), hdr("Wt"), hdr("Why it belongs (link to family)"), hdr("Vol*")]];
  names.forEach((k, i) => rows.push([{ text: `${L[k]}\n${k}`, options: { bold: true } }, pct(R.inputs.weights[i], 0), theme[i], pct(R.inputs.vols[i], 0)]));
  s.addTable(rows, { x: 3.55, y: 1.3, w: 5.95, colW: [1.55, 0.45, 3.4, 0.55], fontFace: BF, fontSize: 9, color: TXT, valign: "middle",
    border: { type: "solid", pt: 0.5, color: GRID }, fill: { color: WHITE }, rowH: [0.28, 0.66, 0.66, 0.66, 0.66], margin: [2, 5, 2, 5] });
  txt(s, [{ text: "Why a weighted basket, not worst-of: ", options: { bold: true, color: JADE } },
          { text: `a shock to one market (e.g. Taiwan geopolitics) is cushioned by the other three. Basket vol is ~${pct(R.basket_vol, 0)} vs 35% for the PHLX Semiconductor index alone, and correlation risk stays with the desk.` }],
    { x: 3.55, y: 4.35, w: 5.95, h: 0.6, fontSize: 10 });
  foot(s, "*Assumed 5Y implied vols for pricing. The draft's thematic indices (e.g. 'Greater China PropTech & NLP') are not Bloomberg-listed, so we use real indices.");
  pageNo(s, 3);
  s.addNotes("Each index is a real Bloomberg ticker (TWSE, KOSPI2, NKY, SOX Index). Semiconductors dominate TAIEX and KOSPI 200 through TSMC, Samsung and SK Hynix, Nikkei 225 carries Tokyo Electron and Advantest, and SOX is a pure chip index. Check look-through weights on Bloomberg before the pitch. Note the overlap: TSMC appears in both TAIEX and SOX, which raises correlation. Quanto USD: the client takes no JPY/TWD/KRW risk; SOX is already in USD.");
}

// ======================= 4. Term sheet + design choice =======================
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, `Term sheet: 5-year capital-protected autocallable, ${pct(CPN)} coupon`, "Why this design: above the funding rate, with zero chance of losing capital at maturity");
  const terms = [["Issuer", "Natixis SA (BPCE Group)"], ["Notional / currency", "USD 100,000,000 · quanto USD"], ["Trade / maturity", "17 Sep 2026 / 17 Sep 2031 (5Y)"],
                 ["Underlying", "Weighted basket of 4 indices (slide 3)"], ["Observation", "Quarterly, 20 dates; autocall from Q4 (Year 1)"],
                 ["Coupon", `${pct(CPN)} p.a. (${pct(QC, 2)} per quarter), paid if basket ≥ 100%`], ["Memory", "Missed coupons paid on the next date basket ≥ 100%"],
                 ["Autocall", "Basket ≥ 100% from Q4: 100% + coupons due, note ends"], ["At maturity", "100% of principal, whatever the basket level"],
                 ["Issue price / fair value", `100% / ${pct(REC.pv)}`]];
  const rows = terms.map((t) => [{ text: t[0], options: { bold: true, color: INK, fill: { color: MINT } } }, t[1]]);
  s.addTable(rows, { x: 0.5, y: 1.3, w: 4.6, colW: [1.45, 3.15], fontFace: BF, fontSize: 9.5, color: TXT, border: { type: "solid", pt: 0.5, color: WHITE }, fill: { color: "F5F9F8" }, rowH: 0.34, margin: [2, 5, 2, 5], valign: "middle" });
  const D = R.designs, keys = Object.keys(D);
  const drow = [[hdr("Autocall design (same basket, issued at 98%)"), hdr("Fair cpn"), hdr("Loss risk")]];
  keys.forEach((k) => {
    const rec = k.startsWith("Capital protected");
    const o = rec ? { bold: true, color: JADE, fill: { color: MINT } } : {};
    drow.push([{ text: rec ? k + " (ours)" : k, options: o }, { text: pct(D[k].fair_coupon), options: o }, { text: pct(D[k].p_loss), options: o }]);
  });
  s.addTable(drow, { x: 5.35, y: 1.3, w: 4.2, colW: [2.75, 0.7, 0.75], fontFace: BF, fontSize: 8.5, color: TXT, valign: "middle", align: "left",
    border: { type: "solid", pt: 0.5, color: GRID }, fill: { color: WHITE }, rowH: [0.3, 0.33, 0.33, 0.33, 0.33, 0.33], margin: [2, 4, 2, 4] });
  card(s, 5.35, 3.45, 4.2, 1.4, INK);
  const fx = D["Classic: fixed coupon, 70% barrier"], lv = D["Classic, 70% barrier, 10%-vol basket"];
  txt(s, [{ text: "Design call: ", options: { bold: true, color: GOLD } },
          { text: `The draft's 8.5% fixed coupon is worth ${pct(R.draft_8_5_fixed_70_pv)} to the client, so Natixis cannot fund it. At-risk designs pay ${pct(fx.fair_coupon, 0)}–${pct(D["Snowball, 65% barrier"].fair_coupon, 0)} for a ${pct(Math.min(fx.p_loss, D["Snowball, 65% barrier"].p_loss), 0)}–${pct(Math.max(fx.p_loss, D["Snowball, 65% barrier"].p_loss), 0)} chance of losing capital. Cutting that to ~1% needs a 10%-vol basket and pays only ${pct(lv.fair_coupon)}, below the 5.69% bond. Full protection prices at ${pct(REC.fair_coupon)}; we offer ${pct(CPN)}.`, options: { color: WHITE } }],
    { x: 5.5, y: 3.53, w: 3.9, h: 1.28, fontSize: 9.5 });
  foot(s, NOTE + " Loss risk = probability the note returns less than 100%.");
  pageNo(s, 4);
  s.addNotes("The table is the key design argument. Every design that puts capital at risk only pays 6–11% for a 10–12% chance of a loss; pushing the loss probability down with a calmer basket kills the coupon. Protecting capital fully keeps a coupon above the funding rate because the principal is cheap at 5.69% rates and the autocall usually returns it early.");
}

// ======================= 5. How it pays: timeline =======================
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "How it pays: one question every quarter", "Is the basket at or above 100% of its starting level? (checked quarterly; one date per year shown)");
  const yrs = [1, 2, 3, 4, 5];
  s.addShape(pres.shapes.LINE, { x: 0.8, y: 1.85, w: 8.4, h: 0, line: { color: SLATE, width: 2 } });
  dot(s, 0.55, 1.64, "0", SLATE, 0.42);
  txt(s, "Trade date\n17 Sep 2026\nInitial = 100%", { x: 0.15, y: 2.12, w: 1.25, h: 0.6, fontSize: 8.5, color: MUTED, align: "center" });
  yrs.forEach((y, i) => {
    const x = 2.15 + i * 1.6;
    dot(s, x, 1.64, "Y" + y, y === 5 ? GOLD : JADE, 0.42);
    txt(s, `If basket ≥ 100%:\ncalled, ${pct(1 + CPN * y)} total`, { x: x - 0.5, y: 2.12, w: 1.42, h: 0.45, fontSize: 9.5, bold: true, color: y === 5 ? GOLD : JADE, align: "center" });
    txt(s, `P(called by Y${y}) ${pct(RN.p_call_by_year[i], 0)}`, { x: x - 0.5, y: 2.55, w: 1.42, h: 0.25, fontSize: 8.5, color: MUTED, align: "center" });
  });
  txt(s, `Q1–Q3: coupon only (${pct(QC, 2)} if basket ≥ 100%). From Q4: coupon plus autocall. Missed coupons are always caught up.`, { x: 1.4, y: 1.25, w: 7.9, h: 0.25, fontSize: 9, italic: true, color: MUTED, align: "center" });
  const outs = [
    ["A", "Autocalled", `Basket ≥ 100% on any date from Q4: 100% plus every coupon to date, including missed ones. The note ends.`, pct(RN.p_called, 0), JADE],
    ["B", "Not called, early coupons", "Basket ≥ 100% in Q1–Q3 only, never afterwards. The family keeps those coupons and gets 100% back at Y5.", pct(RN.p_not_called_some_cpn, 0), SLATE],
    ["C", "Not called, no coupon", "Basket never back to 100%. The family gets 100% back at Y5: a 0% return, but no capital loss.", pct(RN.p_zero_return, 0), GOLD],
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
  s.addNotes(`Explain the note as one question asked every quarter: is the basket at or above where it started? If yes, the family is paid ${pct(QC, 2)} for that quarter plus any coupons missed before, and from Year 1 the note also ends with 100% back. If the answer is never yes, the family still gets 100% back at Year 5.`);
}

// ======================= 6. Payoff diagrams =======================
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Payoff diagrams: what the family receives, and when", "Left: total cash if called at each date. Right: payoff at Y5 if never called earlier, vs. owning the basket directly");
  const qs = []; for (let q = 4; q <= 20; q++) qs.push(q);
  s.addChart(pres.charts.BAR, [{ name: "Total cash if called", labels: qs.map((q) => (q % 4 === 0 ? "Y" + q / 4 : "")), values: qs.map((q) => +(100 + QC * 100 * q).toFixed(3)) }],
    Object.assign(chartBase(), { x: 0.4, y: 1.25, w: 4.4, h: 2.85, barDir: "col", chartColors: [JADE], barGapWidthPct: 35, valAxisMinVal: 90, valAxisMaxVal: 140,
      valAxisLabelFormatCode: '0"%"', showTitle: true, title: "Principal + all coupons (% of notional), by call quarter Q4–Q20", titleFontSize: 9.5 }));
  txt(s, yrs5().map((y, i) => ({ text: `Y${y}: ${pct(1 + CPN * y)}  (USD ${(100 * (1 + CPN * y)).toFixed(1)}mn)`, options: { breakLine: i < 4 } })),
    { x: 0.55, y: 4.2, w: 2.3, h: 0.95, fontSize: 9, color: TXT });
  txt(s, "With memory, the total depends only on when the note is called, not on how many coupon dates were missed along the way.", { x: 2.85, y: 4.2, w: 1.95, h: 0.95, fontSize: 9, italic: true, color: MUTED });

  const xs = []; for (let x = 30; x <= 160; x += 0.5) xs.push(x);
  const note = xs.map((x) => (x >= 100 ? 100 + CPN * 100 * 5 : 100));
  s.addChart(pres.charts.SCATTER, [{ name: "X", values: xs }, { name: "Autocallable note", values: note }, { name: "Basket directly", values: xs }],
    Object.assign(chartBase(), { x: 5.0, y: 1.25, w: 4.6, h: 3.3, chartColors: [JADE, SLATE], lineSize: 2.25, lineDataSymbol: "none", showLegend: true, legendPos: "b", legendFontSize: 9,
      valAxisMinVal: 20, valAxisMaxVal: 160, catAxisMinVal: 30, catAxisMaxVal: 160, valAxisLabelFormatCode: '0"%"', catAxisLabelFormatCode: '0"%"', catAxisMajorUnit: 20,
      showValAxisTitle: true, valAxisTitle: "Total received at Y5", valAxisTitleFontSize: 9, valAxisTitleColor: MUTED,
      showCatAxisTitle: true, catAxisTitle: "Final basket level (% of initial)", catAxisTitleFontSize: 9, catAxisTitleColor: MUTED,
      showTitle: true, title: "Payoff at Y5 (note not called earlier)", titleFontSize: 9.5 }));
  const zones = [["< 100%: 100% back; capital protected however far the basket falls", GOLD], [`≥ 100%: ${pct(1 + CPN * 5)} (principal + all 20 coupons via memory)`, JADE]];
  zones.forEach((z, i) => {
    s.addShape(pres.shapes.OVAL, { x: 5.15, y: 4.72 + i * 0.19, w: 0.1, h: 0.1, fill: { color: z[1] }, line: { color: z[1] } });
    txt(s, z[0], { x: 5.32, y: 4.66 + i * 0.19, w: 4.2, h: 0.2, fontSize: 8.5, color: TXT });
  });
  pageNo(s, 6);
  s.addNotes(`Left chart: the cash ladder. Each quarter the note lives adds ${pct(QC, 2)} of notional, paid either on the date or later through memory. Right chart: if the note reaches Year 5 without being called, there are only two zones. At or above 100% the family receives ${pct(1 + CPN * 5)}; below 100% it receives 100%, plus any coupons already paid in Q1–Q3. Above +${(CPN * 500).toFixed(1)}% the basket beats the note: that is the capped upside.`);
}

// ======================= 7. Building blocks =======================
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Under the hood: a bond plus a strip of digital options", "Replication used by the Natixis desk to price and hedge (values in % of notional, at trade date)");
  const xs = []; for (let x = 40; x <= 160; x += 1) xs.push(x);
  const blocks = [
    ["Protected principal", `100% repaid at autocall or maturity. Worth ${pct(REC.pv_principal)}: early repayment is worth more than a 5Y bond (${pct(R.inputs.zcb_5y)})`, xs.map(() => 100), INK, [0, 120]],
    ["Long quarterly digitals", `Pay ${pct(QC, 2)}, plus missed coupons, on each date the basket is ≥ 100%. Worth ${pct(REC.pv_coupons)}`, xs.map((x) => (x >= 100 ? QC * 100 : 0)), JADE, [-0.5, 2.2]],
    ["Autocall (Natixis's side)", "Remaining coupons: cancelled on a date from Q4 with basket ≥ 100%, when the note ends. This is what keeps the coupon affordable", xs.map((x) => (x >= 100 ? 0 : 1)), RED, [-0.3, 1.4]],
  ];
  blocks.forEach((b, i) => {
    const x = 0.45 + i * 3.1;
    card(s, x, 1.3, 2.9, 3.05);
    txt(s, b[0], { x: x + 0.15, y: 1.38, w: 2.6, h: 0.3, fontSize: 12, bold: true, color: b[3] === RED ? RED : INK });
    txt(s, b[1], { x: x + 0.15, y: 1.7, w: 2.6, h: 0.65, fontSize: 9, color: MUTED });
    s.addChart(pres.charts.SCATTER, [{ name: "X", values: xs }, { name: b[0], values: b[2] }], Object.assign(chartBase(), {
      x: x + 0.05, y: 2.35, w: 2.8, h: 1.9, chartColors: [b[3]], lineSize: 2, lineDataSymbol: "none", valAxisMinVal: b[4][0], valAxisMaxVal: b[4][1], valAxisHidden: true,
      catAxisMinVal: 40, catAxisMaxVal: 160, catAxisMajorUnit: 30, catAxisLabelFontSize: 7, catAxisLabelFormatCode: '0"%"', catAxisLabelPos: "low",
      showCatAxisTitle: true, catAxisTitle: "Basket on observation date", catAxisTitleFontSize: 7, catAxisTitleColor: MUTED }));
    if (i < 2) txt(s, i === 0 ? "+" : "−", { x: x + 2.88, y: 2.95, w: 0.25, h: 0.4, fontSize: 18, bold: true, color: INK, align: "center" });
  });
  card(s, 0.45, 4.45, 9.1, 0.7, INK);
  txt(s, [{ text: `Fair value ${pct(REC.pv)} = principal ${pct(REC.pv_principal)} + coupons ${pct(REC.pv_coupons)} (net of autocall).  `, options: { bold: true, color: GOLD } },
          { text: `Issued at 100%, leaving ${pct(REC.natixis_margin)} for hedging costs and Natixis margin. The client sells no put, so it takes no equity downside: it gives up upside above the coupon instead.`, options: { color: WHITE } }],
    { x: 0.6, y: 4.52, w: 8.8, h: 0.6, fontSize: 10, valign: "middle" });
  pageNo(s, 7);
  s.addNotes("Mini-charts show each leg's payoff on a single observation date against the basket level (the autocall leg is illustrative: it shows the remaining coupon stream switching off). Unlike a classic autocall, there is no short put: the coupon is funded by cheap protected principal and by the autocall cutting the coupon stream short when the basket is strong.");
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
    const outcome = o.call_q ? `Called Q${o.call_q} (${o.years}y)` : "100% back at Y5";
    const basket = o.call_q ? "–" : pct(o.path[19] - 1, 0);
    rows.push([{ text: n, options: { bold: true, color: cols[i] === SLATE ? MUTED : cols[i] } }, outcome, pct(o.coupons), (o.total * 100).toFixed(1), pct(o.irr), basket]);
  });
  s.addTable(rows, { x: 5.1, y: 1.3, w: 4.45, colW: [1.42, 0.98, 0.58, 0.52, 0.47, 0.48], fontFace: BF, fontSize: 8.5, color: TXT, valign: "middle",
    border: { type: "solid", pt: 0.5, color: GRID }, fill: { color: WHITE }, rowH: 0.42, margin: [2, 3, 2, 3] });
  card(s, 5.1, 3.95, 4.45, 1.15);
  txt(s, [{ text: "Reading: ", options: { bold: true, color: JADE } },
          { text: `the note earns ~${pct(Math.min(...names.filter((n) => st[n].call_q).map((n) => st[n].irr)))}–${pct(Math.max(...names.filter((n) => st[n].call_q).map((n) => st[n].irr)))} a year whenever the basket gets back to 100%, even after a 30% drawdown: memory pays all 15 missed coupons at Q15. In a lost decade or a lasting shock the family gets 100% back, while the basket itself is down 12–45%.` }],
    { x: 5.25, y: 4.03, w: 4.2, h: 1.0, fontSize: 9.5 });
  foot(s, "Paths are illustrative and not forecasts. 'Basket' = direct basket return at Y5 when the note is not called. Historical back-test to run on Bloomberg history (appendix).");
  pageNo(s, 8);
  s.addNotes("Walk the five scenarios. The 2022-style path is the key one: a 30% drawdown in the first year that would scare a direct investor, yet the note pays all 15 quarterly coupons at once when the basket recovers at Q15. The two bad paths are where protection earns its keep: the basket is down 12% and 45%, the family gets 100% back.");
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
  add("Capital loss", (m) => pct(m.p_loss, 0));
  s.addTable(rows, { x: 4.45, y: 1.25, w: 5.1, colW: [1.42, 0.92, 0.92, 0.92, 0.92], fontFace: BF, fontSize: 9, color: TXT, align: "center", valign: "middle",
    border: { type: "solid", pt: 0.5, color: GRID }, fill: { color: WHITE }, rowH: 0.3, margin: [2, 4, 2, 4] });
  const kp = [[pct(RN.p_call_by_year[0], 0), `called at the first review (${pct(1 + CPN)} total)`], ["0%", "chance of losing capital at maturity"], [pct(RN.p_zero_return, 0), "of paths earn nothing: 100% back after 5 years"]];
  kp.forEach((k, i) => {
    const x = 0.45 + i * 3.05;
    card(s, x, 3.95, 2.85, 1.1, i === 2 ? INK : MINT);
    txt(s, k[0], { x: x + 0.15, y: 4.02, w: 1.15, h: 0.95, fontFace: HF, fontSize: 24, bold: true, color: i === 2 ? GOLD : JADE, valign: "middle" });
    txt(s, k[1], { x: x + 1.3, y: 4.02, w: 1.45, h: 0.95, fontSize: 10, color: i === 2 ? WHITE : TXT, valign: "middle" });
  });
  foot(s, NOTE + " IRR uses actual quarterly coupon dates.");
  pageNo(s, 9);
  s.addNotes(`The table answers 'what if markets go nowhere?'. Even at 0% equity return the note is called in ~${pct(R.real_world["0%"].p_called, 0)} of paths, because volatility alone takes the basket back to 100% on some date. The honest cost of protection: in ~${pct(RN.p_zero_return, 0)} of paths (risk-neutral) the family earns nothing for 5 years, but it never loses capital.`);
}

// ======================= 10. Risks & hedging =======================
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Risks for the family, and how Natixis hedges its side", "Transparent disclosure plus a desk hedging plan for every exposure");
  const risks = [["Opportunity cost", `Basket never back to 100%: 0% for 5 years (~${pct(RN.p_zero_return, 0)} of paths)`, "Coupon above the funding rate in most paths; only 5% of wealth"],
                 ["Capped upside", `Basket +80% still pays ${pct(CPN)} p.a. and is called at Y1`, "Rest of family wealth keeps direct equity exposure"],
                 ["Reinvestment", `${pct(RN.p_call_by_year[0], 0)} called at Y1: cash back at prevailing rates`, "Natixis offers a roll into a new note at call"],
                 ["Issuer credit", "Protection depends on Natixis / BPCE paying", "BPCE senior rating; optional collateralised wrapper"],
                 ["Liquidity / MTM", "Sold before maturity, the price can be below 100%", "Natixis daily indicative price; hold to call or maturity"]];
  const rows = [[hdr("Risk"), hdr("What could happen"), hdr("Mitigant")]].concat(risks.map((r) => [{ text: r[0], options: { bold: true, color: INK } }, r[1], r[2]]));
  s.addTable(rows, { x: 0.45, y: 1.25, w: 5.4, colW: [1.15, 2.15, 2.1], fontFace: BF, fontSize: 8.5, color: TXT, valign: "middle",
    border: { type: "solid", pt: 0.5, color: GRID }, fill: { color: WHITE }, rowH: [0.27, 0.56, 0.5, 0.5, 0.5, 0.56], margin: [2, 4, 2, 4] });
  const hedges = [["Coupon digitals", "Natixis owes basket digitals struck at 100%: replicated with tight basket call spreads, delta-hedged with TAIEX / KOSPI 200 / Nikkei / SOX futures"],
                  ["Vol & correlation", `Coupon value moves with basket vol and correlation (fair ${pct(SV["vol -3pts"])}–${pct(SV["vol +3pts"])} for vol ±3pts): managed with listed index options and correlation trades`],
                  ["Quanto FX", "USD payout on TWD/KRW/JPY indices (SOX already USD): FX forwards and quanto adjustment in price"],
                  ["Rates & funding", "Protected principal funded at the 5.69% curve and hedged with USD swaps; the autocall shortens the liability"]];
  hedges.forEach((h, i) => {
    const y = 1.25 + i * 0.97;
    card(s, 6.05, y, 3.5, 0.87, i % 2 ? MINT : "F2F7F6");
    txt(s, h[0], { x: 6.18, y: y + 0.07, w: 3.25, h: 0.25, fontSize: 10.5, bold: true, color: JADE });
    txt(s, h[1], { x: 6.18, y: y + 0.32, w: 3.25, h: 0.52, fontSize: 8.5, color: TXT });
  });
  txt(s, [{ text: "Pricing sensitivity (fair coupon): ", options: { bold: true, color: INK } },
          { text: `base ${pct(SV.base)} · vol ±3pts ${pct(SV["vol -3pts"])}–${pct(SV["vol +3pts"])} · corr ±0.15 ${pct(SV["corr -0.15"])}–${pct(SV["corr +0.15"])} · equity drift −1/−2% ${pct(SV["drift -1%"])}–${pct(SV["drift -2%"])}. ${["base", "vol -3pts", "vol +3pts", "corr -0.15", "corr +0.15", "drift -1%", "drift -2%"].every((k) => SV[k] >= CPN - 1e-9) ? `The ${pct(CPN)} offer stays fundable in every case.` : `The ${pct(CPN)} offer needs re-checking if vols or correlation fall.`}` }],
    { x: 0.45, y: 4.45, w: 5.4, h: 0.7, fontSize: 9 });
  pageNo(s, 10);
  s.addNotes(`Investor risks on the left, desk hedges on the right. There is no capital-loss line: the main honest risks are earning nothing for 5 years, capped upside, and Natixis credit. The ${pct(CPN)} coupon sits below the ${pct(SV.base)} fair level in every sensitivity we ran, so the offer is robust to market moves before the trade date.`);
}

// ======================= Appendix A: assumptions & method =======================
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Appendix A: pricing assumptions and methodology", "Inputs to refresh on Bloomberg at trade date (BVOL / OVDV for vols, CORR for correlations)");
  const L = R.inputs.underlyings, names = Object.keys(L);
  const short = ["TWSE", "KOSPI2", "NKY", "SOX"];
  const rows = [[hdr("Index"), hdr("Weight"), hdr("Vol"), hdr("Div"), ...short.map(hdr)]];
  names.forEach((k, i) => rows.push([{ text: short[i], options: { bold: true } }, pct(R.inputs.weights[i], 0), pct(R.inputs.vols[i], 0), pct(R.inputs.divs[i], 1), ...R.inputs.corr[i].map((c) => c.toFixed(2))]));
  s.addTable(rows, { x: 0.45, y: 1.3, w: 5.2, colW: [0.9, 0.62, 0.52, 0.52, 0.66, 0.66, 0.66, 0.66], fontFace: BF, fontSize: 9, color: TXT, align: "center", valign: "middle",
    border: { type: "solid", pt: 0.5, color: GRID }, fill: { color: WHITE }, rowH: 0.3, margin: [2, 3, 2, 3] });
  txt(s, [
    { text: "Model. ", options: { bold: true, color: JADE } }, { text: "Correlated GBM for each index, 200,000 paths, quarterly steps. Risk-neutral drift = USD funding (linear interpolation of case grid) − dividend yield. Quanto adjustment ignored (assumed hedged by the desk; to be added with FX-equity correlations).", options: { breakLine: true } },
    { text: "Discounting. ", options: { bold: true, color: JADE } }, { text: "USD funding grid from the case rules; 5Y discount factor 0.758.", options: { breakLine: true } },
    { text: "Coupon solve. ", options: { bold: true, color: JADE } }, { text: "Bisection on coupon so that PV = 98% (2% hedging cost and margin).", options: { breakLine: true } },
    { text: "Historical back-test (to run). ", options: { bold: true, color: JADE } }, { text: "Monthly Bloomberg history since 2015 for all four indices. Launch a hypothetical note every month, apply the same coupon, memory and autocall rules, and record coupons, life and IRR by launch year." },
  ], { x: 0.45, y: 2.95, w: 5.2, h: 2.2, fontSize: 9.5, paraSpaceAfter: 4 });
  const rows2 = [[hdr("Design variant (capital protected)"), hdr("Fair cpn")],
    ["Coupon barrier 100% (base)", pct(SV.base)], ["Coupon barrier 95%", pct(SV["cpn barrier 95%"])], ["Coupon barrier 90%", pct(SV["cpn barrier 90%"])],
    ["First autocall at Y2", pct(SV["first call Y2"])], ["Equity drift −1%", pct(SV["drift -1%"])], ["Equity drift −2%", pct(SV["drift -2%"])],
    ["Vol +3pts / −3pts", `${pct(SV["vol +3pts"])} / ${pct(SV["vol -3pts"])}`]];
  s.addTable(rows2, { x: 5.95, y: 1.3, w: 3.6, colW: [2.5, 1.1], fontFace: BF, fontSize: 9, color: TXT, valign: "middle",
    border: { type: "solid", pt: 0.5, color: GRID }, fill: { color: WHITE }, rowH: 0.29, margin: [2, 4, 2, 4] });
  txt(s, "All variants priced at 98% with the same basket and inputs. Code: pricing/scenario2_autocall_mc.py", { x: 5.95, y: 3.7, w: 3.6, h: 0.45, fontSize: 8.5, italic: true, color: MUTED });
}

// ======================= Appendix B: alternatives =======================
{
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Appendix B: alternatives for the investment committee", "Same basket: a higher-coupon at-risk snowball, and a pure participation note");
  const p = R.ppn, sb = R.snowball_alt;
  const xs = []; for (let x = 40; x <= 180; x += 1) xs.push(x);
  s.addChart(pres.charts.SCATTER, [{ name: "X", values: xs },
    { name: `Our note (${pct(CPN)})`, values: xs.map((x) => (x >= 100 ? 100 + CPN * 500 : 100)) },
    { name: `Snowball ${pct(sb.coupon, 0)}, 65% barrier`, values: xs.map((x) => (x >= 100 ? 100 + sb.coupon * 500 : x >= sb.barrier * 100 ? 100 : x)) },
    { name: "PPN", values: xs.map((x) => 100 + p.participation * Math.max(x - 100, 0)) }, { name: "Basket", values: xs }],
    Object.assign(chartBase(), { x: 0.4, y: 1.25, w: 5.0, h: 3.6, chartColors: [JADE, RED, GOLD, SLATE], lineSize: 2, lineDataSymbol: "none", showLegend: true, legendPos: "b", legendFontSize: 8.5,
      valAxisMinVal: 30, valAxisMaxVal: 190, catAxisMinVal: 40, catAxisMaxVal: 180, catAxisMajorUnit: 20, valAxisLabelFormatCode: '0"%"', catAxisLabelFormatCode: '0"%"',
      showTitle: true, title: "Total received at Y5 (not called earlier) vs final basket level", titleFontSize: 9.5 }));
  const rows = [[hdr("Option"), hdr("Return"), hdr("Loss risk")],
                [{ text: "Protected autocallable (ours)", options: { bold: true, color: JADE } }, `${pct(CPN)} p.a. memory coupon`, "0%"],
                ["Snowball, 65% barrier", `${pct(sb.coupon, 0)} p.a., paid at call`, pct(sb.p_loss)],
                ["Principal-protected note", `${pct(p.participation, 0)} of basket gain at Y5`, "0%"]];
  s.addTable(rows, { x: 5.7, y: 1.3, w: 3.85, colW: [1.6, 1.45, 0.8], fontFace: BF, fontSize: 9, color: TXT, valign: "middle",
    border: { type: "solid", pt: 0.5, color: GRID }, fill: { color: WHITE }, rowH: 0.36, margin: [2, 4, 2, 4] });
  card(s, 5.7, 2.85, 3.85, 2.0);
  txt(s, [{ text: "Trade-off: ", options: { bold: true, color: JADE } },
          { text: `The snowball pays ${pct(sb.coupon, 0)} but loses capital in ~${pct(sb.p_loss, 0)} of paths. The PPN keeps full protection with uncapped upside, but pays nothing unless the basket ends above 100% after 5 years and has no early exit. Our note sits between them: full protection, a coupon above the funding rate, and money usually back within ~2 years.` }],
    { x: 5.85, y: 2.93, w: 3.6, h: 1.85, fontSize: 9.5 });
  foot(s, NOTE);
}

function yrs5() { return [1, 2, 3, 4, 5]; }

pres.writeFile({ fileName: path.join(__dirname, "Asian-Digital-Autocallable-Note.pptx") }).then((f) => console.log("wrote", f));
