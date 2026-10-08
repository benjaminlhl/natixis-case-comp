// Pricing slides for the team's stochastic fair-yield calculation (pricing/stochastic_cal_for_natixis.py,
// brief in pricing/stochastic_cal_brief.pdf). Numbers: pricing/stochastic_cal_summary.json (1,000,000 paths, seed 12345).
// Team template: blue, Arial, ANALYSIS / STRATEGY / APPENDIX footer.
// Build: NODE_PATH=<dir with pptxgenjs> node deck/build_pricing_slides.js
const path = require("path");
const pptxgen = require("pptxgenjs");
const S = require(path.join(__dirname, "..", "pricing", "stochastic_cal_summary.json"));

const BLUE = "2C5F82", BLUE_L = "E8EFF5", BLUE_M = "8DB3D1", MID = "4F86AE", GRAY = "F2F2F2", TXT = "262626", MUTED = "595959",
      WHITE = "FFFFFF", LINE = "BFBFBF", RED = "B23B3B", GREEN = "2E9E44";
const F = "Arial";
const p = (x, d = 1) => (x * 100).toFixed(d) + "%";
const FAIR = S.y_used, CLIENT = S.client, SPREAD = FAIR - CLIENT;
const TRIG = [1.025, 1.0, 0.975, 0.95, 0.925];
const VOL = [["3119 HK", [0.3045, 0.3234, 0.335, 0.367, 0.375]], ["EWY", [0.415, 0.427, 0.445, 0.445, 0.445]],
             ["EWT", [0.324, 0.358, 0.363, 0.363, 0.363]], ["2644 JP", [0.23, 0.249, 0.256, 0.256, 0.259]],
             ["00878 TT", [0.07, 0.09, 0.12, 0.12, 0.12]]];

function addPricingSlides(pres) {
  const mk = (titleText, sub, section) => {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    const T = (t, o) => s.addText(t, Object.assign({ fontFace: F, fontSize: 12, color: TXT, margin: 0, valign: "top", isTextBox: true }, o));
    T(titleText, { x: 0.5, y: 0.3, w: 12.3, h: 0.6, fontSize: 22, valign: "middle" });
    s.addShape(pres.shapes.LINE, { x: 0.5, y: 0.98, w: 12.33, h: 0, line: { color: BLUE, width: 1 } });
    T(sub, { x: 0.5, y: 1.06, w: 12.33, h: 0.3, fontSize: 11, italic: true, color: MUTED });
    s.addShape(pres.shapes.LINE, { x: 0.5, y: 6.98, w: 12.33, h: 0, line: { color: LINE, width: 0.75 } });
    [["ANALYSIS", 0.5], ["STRATEGY", 4.69], ["APPENDIX", 8.89]].forEach(([t, x]) => {
      const on = t === section;
      if (on) s.addShape(pres.shapes.RECTANGLE, { x: x + 0.6, y: 6.96, w: 2.75, h: 0.05, fill: { color: BLUE }, line: { color: BLUE } });
      T(t, { x, y: 7.05, w: 3.95, h: 0.3, fontSize: 12, bold: on, color: on ? BLUE : MUTED, align: "center", charSpacing: 1 });
    });
    return { s, T };
  };
  const head = (s, T, x, y, w, t) => {
    s.addShape(pres.shapes.RECTANGLE, { x, y, w, h: 0.38, fill: { color: BLUE }, line: { color: BLUE } });
    T(t, { x, y, w, h: 0.38, fontSize: 11.5, bold: true, color: WHITE, align: "center", valign: "middle" });
  };
  const banner = (s, T, text, y = 6.1) => {
    s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y, w: 12.33, h: 0.5, fill: { color: BLUE }, line: { color: BLUE } });
    T(text, { x: 0.65, y, w: 12.03, h: 0.5, fontSize: 12, bold: true, color: WHITE, align: "center", valign: "middle" });
  };
  const note = (T, text, y = 6.66) => T(text, { x: 0.5, y, w: 12.33, h: 0.28, fontSize: 8, italic: true, color: MUTED });
  const H = (t) => ({ text: t, options: { bold: true, color: WHITE, fill: { color: BLUE }, align: "center" } });

  // ---------- Slide 1: what we price and how ----------
  {
    const { s, T } = mk("Pricing: a Monte Carlo search for the fair yield",
      "The fair yield is the annual coupon that makes the note worth exactly USD 100 today, using market volatilities and correlations", "STRATEGY");
    // Left: the note being priced
    head(s, T, 0.5, 1.45, 3.9, "1  The note we price");
    const terms = [["Observation", "Annual, Years 1–5"], ["Autocall trigger", "102.5% → 100% → 97.5% → 95% → 92.5% (steps down 2.5% a year)"],
      ["If called in year k", "USD 100 × (1 + k × yield): the coupon accrues, paid at the call"], ["Never called", "Year 5: 100% back if basket ≥ 70%; below 70%, the basket level"],
      ["Basket", "3119 HK 35%, EWY 20%, EWT 15%, 2644 JP 15%, 00878 TT 15% (USD)"], ["Discounting", "5.69% a year (case USD rate), flat"]];
    s.addTable(terms.map(([a, b]) => [{ text: a, options: { bold: true, color: BLUE, fill: { color: BLUE_L } } }, b]),
      { x: 0.5, y: 1.88, w: 3.9, colW: [1.25, 2.65], fontFace: F, fontSize: 9, color: TXT, valign: "middle",
        border: { type: "solid", pt: 0.5, color: WHITE }, fill: { color: GRAY }, rowH: 0.62, margin: [2, 5, 2, 5] });
    // Middle: market inputs
    head(s, T, 4.6, 1.45, 4.1, "2  Market inputs");
    const vrows = [[H("Implied vol"), H("1Y"), H("2Y"), H("3Y"), H("4Y"), H("5Y")]].concat(
      VOL.map(([n, v]) => [{ text: n, options: { bold: true } }].concat(v.map((x) => ({ text: p(x, 0), options: { align: "center" } })))));
    s.addTable(vrows, { x: 4.6, y: 1.88, w: 4.1, colW: [1.1, 0.6, 0.6, 0.6, 0.6, 0.6], fontFace: F, fontSize: 9, color: TXT, valign: "middle",
      border: { type: "solid", pt: 0.5, color: LINE }, fill: { color: WHITE }, rowH: 0.3, margin: [1, 4, 1, 4] });
    T([{ text: "Term structure used properly: ", options: { bold: true, color: BLUE } },
       { text: "each year's variance is the increase in total variance (t × σ²), not the quoted vol itself.", options: { breakLine: true } },
       { text: "Correlations: ", options: { bold: true, color: BLUE } },
       { text: "supplied 5×5 matrix (0.44–0.86), checked positive definite (smallest eigenvalue 0.11).", options: { breakLine: true } },
       { text: "Rate: ", options: { bold: true, color: BLUE } },
       { text: "5.69% case rate, annually compounded; no dividends (USD performance assumed)." }],
      { x: 4.6, y: 3.82, w: 4.1, h: 2.0, fontSize: 9.5, color: TXT, paraSpaceAfter: 4 });
    // Right: method
    head(s, T, 8.9, 1.45, 3.93, "3  Method");
    const steps = [["Simulate", "1,000,000 correlated lognormal basket paths (seed 12345), risk-neutral drift = 5.69%"],
                   ["Record", "the first year the basket is at or above that year's trigger, or 'never called'"],
                   ["Value", "every path's cash flows, discounted: PV = E[a] + yield × E[b]"],
                   ["Solve", "yield = (1 − E[a]) / E[b], so the note is worth exactly 100%"]];
    steps.forEach(([h, b], i) => {
      const y = 1.92 + i * 0.98;
      s.addShape(pres.shapes.RECTANGLE, { x: 8.9, y, w: 3.93, h: 0.88, fill: { color: i % 2 ? WHITE : GRAY }, line: { color: GRAY } });
      s.addShape(pres.shapes.OVAL, { x: 9.0, y: y + 0.22, w: 0.44, h: 0.44, fill: { color: BLUE }, line: { color: BLUE } });
      T(String(i + 1), { x: 9.0, y: y + 0.22, w: 0.44, h: 0.44, fontSize: 13, bold: true, color: WHITE, align: "center", valign: "middle" });
      T([{ text: h + ": ", options: { bold: true, color: TXT } }, { text: b, options: { color: MUTED } }],
        { x: 9.55, y: y + 0.04, w: 3.2, h: 0.8, fontSize: 9.5, valign: "middle" });
    });
    banner(s, T, "a = discounted principal repaid, b = discounted years of coupon earned: the fair yield balances the two at USD 100");
    note(T, "Source: team pricing brief and stochastic_cal_for_natixis.py. Excludes issuer credit, fees and hedging costs. Vol inputs: USD vs local-currency basis to confirm; 2644 JP row to confirm (originally labelled 2664).");
    s.addNotes("This slide explains what the team's pricing model does. The note is a step-down autocall: each year the basket is compared with a trigger that starts at 102.5% and falls by 2.5 points a year. If it is called in year k the family receives 100 plus k times the yield. If it is never called, the family gets 100% back unless the basket has fallen below 70% at Year 5, in which case it gets the basket level. We simulate one million market paths using implied volatilities and correlations, value the cash flows on each path, and solve for the yield that makes the note worth exactly 100.");
  }

  // ---------- Slide 2: result ----------
  {
    const { s, T } = mk(`Result: the fair yield is ${p(FAIR, 2)} a year`,
      "1,000,000 simulated paths; we take the bottom of the 95% confidence interval so the yield is never overstated", "STRATEGY");
    head(s, T, 0.5, 1.45, 6.0, "When does the note end? (risk-neutral, % of paths)");
    const labs = ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Never called"];
    const vals = S.first_call.concat([S.never]).map((x) => +(x * 100).toFixed(1));
    s.addChart(pres.charts.BAR, [{ name: "First call", labels: labs, values: vals }], {
      x: 0.5, y: 1.9, w: 6.0, h: 3.0, barDir: "col", chartColors: [BLUE, BLUE, BLUE, BLUE, BLUE, RED], showValue: true,
      dataLabelPosition: "outEnd", dataLabelFormatCode: '0.0"%"', dataLabelFontSize: 10, dataLabelColor: TXT, dataLabelFontFace: F,
      valAxisHidden: true, valGridLine: { style: "none" }, valAxisMinVal: 0, valAxisMaxVal: 60, catAxisLabelFontSize: 10, catAxisLabelFontFace: F,
      catAxisLabelColor: MUTED, catAxisLineColor: LINE, showLegend: false });
    T([{ text: "Never called (", options: {} }, { text: p(S.never), options: { bold: true } },
       { text: `): ${p(S.never_above70)} end above 70% and get 100% back; ${p(S.never_below70)} end below 70% and get the basket level. Average repayment when never called: ${p(S.cond_repay, 0)}. Expected life ${S.exp_life.toFixed(1)} years.` }],
      { x: 0.5, y: 5.0, w: 6.0, h: 0.9, fontSize: 9.5, color: TXT });
    head(s, T, 6.83, 1.45, 6.0, "Fair yield");
    const tiles = [[p(S.y_point, 2), "Monte Carlo point estimate (standard error 0.02%)", BLUE],
                   [`${p(FAIR, 2)} – ${p(2 * S.y_point - FAIR, 2)}`, "95% confidence interval", MID],
                   [p(FAIR, 2), "Fair yield we use: the lower bound, conservative", BLUE],
                   ["8.77%", "If never-called paths also earned the coupon (alternative Case B)", "7F7F7F"]];
    tiles.forEach(([v, l, c], i) => {
      const y = 1.92 + i * 0.98;
      s.addShape(pres.shapes.RECTANGLE, { x: 6.83, y, w: 6.0, h: 0.88, fill: { color: i === 2 ? BLUE_L : GRAY }, line: { color: i === 2 ? BLUE : GRAY, width: i === 2 ? 1.5 : 0.5 } });
      s.addShape(pres.shapes.RECTANGLE, { x: 6.83, y, w: 0.07, h: 0.88, fill: { color: c }, line: { color: c } });
      T(v, { x: 7.05, y, w: 2.6, h: 0.88, fontSize: 20, bold: true, color: c, valign: "middle" });
      T(l, { x: 9.7, y, w: 3.05, h: 0.88, fontSize: 10, color: MUTED, valign: "middle" });
    });
    banner(s, T, `About half the paths end at Year 1; the coupon is paid for by the ${p(S.never_below70)} of paths that end below the 70% barrier`);
    note(T, `Case A (base): no coupon on never-called paths. Probabilities are risk-neutral (drift = 5.69%), not forecasts. Model: correlated lognormal, deterministic vol term structure, zero dividends.`);
    s.addNotes("The model gives 13.85% as its central estimate, with a statistical uncertainty of about 2 basis points. We use 13.81%, the bottom of the 95% confidence interval, so we never quote a yield the model cannot support. About half of paths are called at Year 1; 18.8% are never called, and in 13.7% the basket ends below the 70% barrier, which is the risk that funds the high yield.");
  }

  // ---------- Slide 3: split ----------
  {
    const { s, T } = mk(`Splitting ${p(FAIR, 2)}: 10% a year to the family, ${p(SPREAD, 2)} to Natixis`,
      "The family is offered a 10% yield; the gap to the fair yield is Natixis's hedging cost and profit", "STRATEGY");
    head(s, T, 0.5, 1.45, 3.6, "How the fair yield is shared");
    s.addChart(pres.charts.BAR, [{ name: "Family", labels: ["Fair yield"], values: [CLIENT * 100] }, { name: "Natixis", labels: ["Fair yield"], values: [+(SPREAD * 100).toFixed(2)] }], {
      x: 0.5, y: 1.9, w: 3.6, h: 3.9, barDir: "col", barGrouping: "stacked", chartColors: [BLUE, BLUE_M], showValue: true, dataLabelFormatCode: '0.00"%"',
      dataLabelFontSize: 12, dataLabelColor: WHITE, dataLabelFontFace: F, dataLabelFontBold: true, valAxisHidden: true, valGridLine: { style: "none" },
      valAxisMinVal: 0, valAxisMaxVal: 15, catAxisLabelFontSize: 10, catAxisLabelFontFace: F, catAxisLabelColor: MUTED, showLegend: true, legendPos: "b", legendFontSize: 10, legendFontFace: F });
    head(s, T, 4.35, 1.45, 4.3, "What the family receives (USD 100mn)");
    const rows = [[H("If called at"), H("Repaid"), H("Return a year"), H("Probability")]];
    for (let k = 1; k <= 5; k++) rows.push([{ text: `Year ${k} (≥ ${p(TRIG[k - 1], 1)})`, options: { bold: true } }, { text: `USD ${(100 * (1 + CLIENT * k)).toFixed(0)}mn`, options: { align: "center" } },
      { text: p(Math.pow(1 + CLIENT * k, 1 / k) - 1), options: { align: "center" } }, { text: p(S.first_call[k - 1]), options: { align: "center" } }]);
    rows.push([{ text: "Never, basket ≥ 70%", options: { bold: true } }, { text: "USD 100mn", options: { align: "center" } }, { text: "0.0%", options: { align: "center" } }, { text: p(S.never_above70), options: { align: "center" } }]);
    rows.push([{ text: "Never, basket < 70%", options: { bold: true, color: RED } }, { text: "Basket level", options: { align: "center", color: RED } }, { text: "Loss", options: { align: "center", color: RED } }, { text: p(S.never_below70), options: { align: "center", color: RED } }]);
    s.addTable(rows, { x: 4.35, y: 1.88, w: 4.3, colW: [1.45, 1.0, 0.95, 0.9], fontFace: F, fontSize: 9.5, color: TXT, valign: "middle",
      border: { type: "solid", pt: 0.5, color: LINE }, fill: { color: WHITE }, rowH: 0.42, margin: [1, 4, 1, 4] });
    T(`Median return ${p(S.client_irr_median)} a year; chance of a capital loss ${p(S.p_loss)} (risk-neutral).`,
      { x: 4.35, y: 5.35, w: 4.3, h: 0.5, fontSize: 9.5, italic: true, color: MUTED });
    head(s, T, 8.9, 1.45, 3.93, "What Natixis earns");
    const nat = [[p(S.natixis_upfront), `of notional, upfront: at a 10% yield the note is worth ${(S.pv_at_client * 100).toFixed(1)} but sells at 100`],
                 [`USD ${(S.natixis_upfront * 100).toFixed(1)}mn`, "on the USD 100mn mandate, before hedging costs"],
                 [`${p(SPREAD, 2)}`, `of yield a year, earned only while the note is alive (expected life ${S.exp_life.toFixed(1)} years)`]];
    nat.forEach(([v, l], i) => {
      const y = 1.92 + i * 1.3;
      s.addShape(pres.shapes.RECTANGLE, { x: 8.9, y, w: 3.93, h: 1.2, fill: { color: i % 2 ? WHITE : GRAY }, line: { color: GRAY } });
      T(v, { x: 9.05, y: y + 0.08, w: 3.7, h: 0.5, fontSize: 20, bold: true, color: BLUE });
      T(l, { x: 9.05, y: y + 0.6, w: 3.7, h: 0.55, fontSize: 9.5, color: MUTED });
    });
    banner(s, T, `The family earns 10% a year in the ${p(1 - S.never)} of paths that are called; Natixis keeps ${p(S.natixis_upfront)} of notional for hedging and margin`);
    note(T, `Natixis value = fair value at 13.81% (100%) minus fair value at 10% (${(S.pv_at_client * 100).toFixed(1)}%). Return a year = (1 + 10% × k)^(1/k) − 1. Excludes issuer credit and hedging costs, which come out of Natixis's share.`);
    s.addNotes("The fair yield of 13.81% is split: the family is offered 10% a year, accruing and paid when the note is called, and Natixis keeps the difference. Because the coupon is only paid while the note is alive, the 3.81% is not an annual fee; its value today is 4.7% of notional, about USD 4.7mn on the USD 100mn mandate, which has to cover hedging costs and Natixis's profit.");
  }
}

module.exports = { addPricingSlides };

if (require.main === module) {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";
  pres.title = "Pricing: fair yield of the autocallable";
  addPricingSlides(pres);
  pres.writeFile({ fileName: path.join(__dirname, "Pricing-Slides.pptx") }).then((f) => console.log("wrote", f));
}
