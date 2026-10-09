// Two appendix slides on how the fair coupon was priced, transcribed from the team's write-up
// "Derivation of Fair Coupon Rate for Autocallable Structured Product" (pricing/natixis_2.pdf):
// section 2 (mathematical formulas), section 3 (pricing results) and section 4 (grids and matrices).
// Team template: blue, Arial, ANALYSIS / STRATEGY / APPENDIX footer.
// Build: NODE_PATH=<dir with pptxgenjs> node deck/build_appendix_pricing.js
const path = require("path");
const pptxgen = require("pptxgenjs");

const BLUE = "2C5F82", BLUE_L = "E8EFF5", GRAY = "F2F2F2", TXT = "262626", MUTED = "595959", WHITE = "FFFFFF", LINE = "BFBFBF";
const F = "Arial";

// Section 3: pricing results (Case A)
const FAIR = 13.752219, SE_BP = 2.236, CI = [13.708396, 13.796041], CLIENT = 10;
const SPREAD = +(FAIR - CLIENT).toFixed(6);
// Section 4 grids
const TERM = [["1", "4.78%", "4.671%", "0.9544"], ["2", "5.30%", "5.166%", "0.9015"], ["3", "5.52%", "5.375%", "0.8466"],
              ["4 (interpolated)", "5.605%", "5.454%", "0.7981"], ["5", "5.69%", "5.534%", "0.7510"]];
const ASSETS = ["3119.HK", "EWY", "EWT", "2644.T", "00878.TW"];
const RHO = [[1.000, 0.534, 0.741, 0.863, 0.562], [0.534, 1.000, 0.587, 0.491, 0.438], [0.741, 0.587, 1.000, 0.614, 0.689],
             [0.863, 0.491, 0.614, 1.000, 0.517], [0.562, 0.438, 0.689, 0.517, 1.000]];
const VOL = [[30.45, 32.34, 33.50, 36.70, 37.50], [41.50, 42.70, 44.50, 44.50, 44.50], [32.40, 35.80, 36.30, 36.30, 36.30],
             [23.00, 24.90, 25.60, 25.60, 25.90], [7.00, 9.00, 12.00, 12.00, 12.00]];
const DV = [[0.0927, 0.1126, 0.1177, 0.1633, 0.1744], [0.1722, 0.1868, 0.2078, 0.2078, 0.2078], [0.1050, 0.1340, 0.1384, 0.1384, 0.1406],
            [0.0529, 0.0620, 0.0655, 0.0655, 0.0689], [0.0049, 0.0081, 0.0162, 0.0162, 0.0162]];
const W = [35, 20, 15, 15, 15], H = ["102.5%", "100%", "97.5%", "95%", "92.5%"];

function addAppendixPricing(pres, labels = ["Appendix E", "Appendix F"]) {
  const mk = (titleText, sub) => {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    const T = (t, o) => s.addText(t, Object.assign({ fontFace: F, fontSize: 12, color: TXT, margin: 0, valign: "top", isTextBox: true }, o));
    T(titleText, { x: 0.5, y: 0.3, w: 12.3, h: 0.6, fontSize: 22, valign: "middle" });
    s.addShape(pres.shapes.LINE, { x: 0.5, y: 0.98, w: 12.33, h: 0, line: { color: BLUE, width: 1 } });
    T(sub, { x: 0.5, y: 1.06, w: 12.33, h: 0.3, fontSize: 11, italic: true, color: MUTED });
    s.addShape(pres.shapes.LINE, { x: 0.5, y: 6.98, w: 12.33, h: 0, line: { color: LINE, width: 0.75 } });
    [["ANALYSIS", 0.5], ["STRATEGY", 4.69], ["APPENDIX", 8.89]].forEach(([t, x]) => {
      const on = t === "APPENDIX";
      if (on) s.addShape(pres.shapes.RECTANGLE, { x: x + 0.6, y: 6.96, w: 2.75, h: 0.05, fill: { color: BLUE }, line: { color: BLUE } });
      T(t, { x, y: 7.05, w: 3.95, h: 0.3, fontSize: 12, bold: on, color: on ? BLUE : MUTED, align: "center", charSpacing: 1 });
    });
    return { s, T };
  };
  const head = (s, T, x, y, w, t) => {
    s.addShape(pres.shapes.RECTANGLE, { x, y, w, h: 0.34, fill: { color: BLUE }, line: { color: BLUE } });
    T(t, { x: x + 0.1, y, w: w - 0.2, h: 0.34, fontSize: 11, bold: true, color: WHITE, valign: "middle" });
  };
  const Hc = (t) => ({ text: t, options: { bold: true, color: WHITE, fill: { color: BLUE }, align: "center" } });
  const C = (t, o = {}) => ({ text: String(t), options: Object.assign({ align: "center" }, o) });
  // Equation runs: [text, "sub" | "sup" | undefined]
  const eq = (parts, size = 12) => parts.map(([t, k]) => ({ text: t, options: Object.assign({ fontFace: "Cambria Math", fontSize: size, color: TXT },
    k === "sub" ? { subscript: true } : k === "sup" ? { superscript: true } : {}) }));

  // ---------- Slide 1: method, formulas and result ----------
  {
    const { s, T } = mk(`${labels[0]}: how we priced the note, and why the fair coupon is ${FAIR.toFixed(2)}%`,
      "Monte Carlo simulation of the five-ETF basket (1,000,000 paths); the fair coupon makes the note worth exactly its issue price");
    const blocks = [
      ["A", "Term structure & discount factors", "Annual rates are converted to continuous rates; each cash flow is discounted at its own tenor",
        [eq([["r", ""], ["j", "sub"], [" = ln(1 + R", ""], ["j", "sub"], [")     (1)", ""]]), eq([["D", ""], ["j", "sub"], [" = exp(−r", ""], ["j", "sub"], [" · t", ""], ["j", "sub"], [")     (2)", ""]])]],
      ["B", "Asset paths (correlated geometric Brownian motion)", "Each ETF moves one year at a time with its own interval variance ΔV; shocks are correlated through the Cholesky factor L of ρ",
        [eq([["X", ""], ["i,j", "sub"], [" = X", ""], ["i,j−1", "sub"], [" · exp( (r", ""], ["j", "sub"], [" − q", ""], ["i,j", "sub"], [" − ½ΔV", ""], ["i,j", "sub"], [") + √ΔV", ""], ["i,j", "sub"], [" · Z", ""], ["i,j", "sub"], [" )     (3)", ""]]),
         eq([["Z = ε · L", ""], ["T", "sup"], [",   ρ = L · L", ""], ["T", "sup"], ["     (4)", ""]])]],
      ["C", "Basket & autocall trigger", "The basket is the weighted sum of normalised ETF prices; the note ends at the first year it reaches that year's barrier",
        [eq([["B", ""], ["j", "sub"], [" = Σ", ""], ["i=1..5", "sub"], [" w", ""], ["i", "sub"], [" X", ""], ["i,j", "sub"], ["     (5)", ""]]), eq([["call at first k with  B", ""], ["k", "sub"], [" ≥ H", ""], ["k", "sub"], ["     (6)", ""]])]],
      ["D", "Maturity payout (never called)", "A 70% barrier observed only at Year 5",
        [eq([["R", ""], ["5", "sub"], [" = 1.0  if B", ""], ["5", "sub"], [" ≥ 0.70;   R", ""], ["5", "sub"], [" = B", ""], ["5", "sub"], ["  if B", ""], ["5", "sub"], [" < 0.70     (7)", ""]])]],
      ["E", "Fair coupon", "a = discounted principal repaid, b = discounted years of coupon (Case A: no coupon on never-called paths)",
        [eq([["1.0 = E[a + y · b]     (8)", ""]]), eq([["y = (1.0 − E[a]) / E[b]     (9)", ""]])]],
    ];
    blocks.forEach(([letter, head_, desc, eqs], i) => {
      const y = 1.45 + i * 0.9;
      s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y, w: 8.0, h: 0.82, fill: { color: i % 2 ? WHITE : GRAY }, line: { color: GRAY } });
      s.addShape(pres.shapes.OVAL, { x: 0.6, y: y + 0.19, w: 0.44, h: 0.44, fill: { color: BLUE }, line: { color: BLUE } });
      T(letter, { x: 0.6, y: y + 0.19, w: 0.44, h: 0.44, fontSize: 13, bold: true, color: WHITE, align: "center", valign: "middle" });
      T([{ text: head_, options: { bold: true, color: TXT, breakLine: true } }, { text: desc, options: { color: MUTED, fontSize: 8.5 } }],
        { x: 1.15, y: y + 0.05, w: 3.35, h: 0.72, fontSize: 10, valign: "middle" });
      eqs.forEach((e, k) => T(e, { x: 4.6, y: y + 0.06 + k * (0.7 / eqs.length), w: 3.85, h: 0.7 / eqs.length, valign: "middle", fontSize: 12 }));
    });
    // Right: product and result
    head(s, T, 8.75, 1.45, 4.08, "Product priced");
    const prod = [["Basket weights", "3119.HK 35% · EWY 20% · EWT 15% · 2644.T 15% · 00878.TW 15%"],
                  ["Autocall barrier H", "Y1 102.5% · Y2 100% · Y3 97.5% · Y4 95% · Y5 92.5%"],
                  ["Called in year k", "100 × (1 + k × y)"], ["Never called", "R₅ as in (7)"], ["Simulation", "1,000,000 paths, annual steps"]];
    s.addTable(prod.map(([a, b]) => [{ text: a, options: { bold: true, color: BLUE, fill: { color: BLUE_L } } }, b]),
      { x: 8.75, y: 1.82, w: 4.08, colW: [1.35, 2.73], fontFace: F, fontSize: 8.5, color: TXT, valign: "middle",
        border: { type: "solid", pt: 0.5, color: WHITE }, fill: { color: GRAY }, rowH: 0.36, margin: [1, 4, 1, 4] });
    head(s, T, 8.75, 3.75, 4.08, "Pricing results (Case A)");
    const res = [["Fair coupon", `${FAIR.toFixed(6)}%`], ["Standard error", `${SE_BP} bp`], ["Approx. 95% CI", `[${CI[0].toFixed(6)}%, ${CI[1].toFixed(6)}%]`]];
    s.addTable(res.map(([a, b], i) => [{ text: a, options: { bold: true } }, { text: b, options: { bold: i === 0, color: i === 0 ? BLUE : TXT, align: "right" } }]),
      { x: 8.75, y: 4.12, w: 4.08, colW: [1.5, 2.58], fontFace: F, fontSize: 10, color: TXT, valign: "middle",
        border: { type: "solid", pt: 0.5, color: LINE }, fill: { color: WHITE }, rowH: 0.38, margin: [1, 6, 1, 6] });
    s.addShape(pres.shapes.RECTANGLE, { x: 8.75, y: 5.3, w: 4.08, h: 0.68, fill: { color: BLUE_L }, line: { color: BLUE, width: 1 } });
    T([{ text: `${FAIR.toFixed(6)}% = `, options: { bold: true, color: BLUE } }, { text: `${CLIENT}% coupon to the client + ${SPREAD.toFixed(6)}% kept by Natixis`, options: { color: TXT } }],
      { x: 8.85, y: 5.3, w: 3.9, h: 0.68, fontSize: 10, valign: "middle" });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 6.1, w: 12.33, h: 0.5, fill: { color: BLUE }, line: { color: BLUE } });
    T(`We are collecting ${SPREAD.toFixed(6)}% from the customer and give them a ${CLIENT}% coupon`,
      { x: 0.65, y: 6.1, w: 12.03, h: 0.5, fontSize: 13, bold: true, color: WHITE, align: "center", valign: "middle" });
    T("Source: team write-up 'Derivation of Fair Coupon Rate for Autocallable Structured Product' (8 Oct 2026), sections 2–3. Excludes issuer credit, fees and hedging costs.",
      { x: 0.5, y: 6.66, w: 12.33, h: 0.28, fontSize: 8, italic: true, color: MUTED });
    s.addNotes(`How we priced the note. A: annual rates from the case grid are turned into continuous rates and discount factors. B: we simulate each ETF one year at a time with correlated geometric Brownian motion, using the implied-volatility term structure through interval variances and the correlation matrix through its Cholesky factor. C: the basket is the weighted sum of the five ETFs; the note is called at the first year the basket reaches that year's barrier, which steps down from 102.5% to 92.5%. D: if never called, the family gets 100% back unless the basket is below 70% at Year 5. E: the fair coupon is the value of y that makes the expected discounted payoff equal 1. Result: ${FAIR.toFixed(6)}% with a standard error of ${SE_BP} basis points. We pay the client a ${CLIENT}% coupon and collect the remaining ${SPREAD.toFixed(6)}%.`);
  }

  // ---------- Slide 2: grids and matrices ----------
  {
    const { s, T } = mk(`${labels[1]}: pricing inputs, grids and matrices`, "Every input used in the Monte Carlo simulation (team write-up, section 4)");
    const X1 = 0.5, X2 = 6.83, WD = 6.0;
    // 4.1 term structure
    head(s, T, X1, 1.45, WD, "4.1  Term structure of interest rates");
    s.addTable([[Hc("Year (t)"), Hc("Risk-free rate (R)"), Hc("Continuous rate r = ln(1 + R)"), Hc("Discount factor (D)")]].concat(TERM.map((r) => r.map((v, i) => C(v, i === 0 ? { bold: true } : {})))),
      { x: X1, y: 1.8, w: WD, colW: [1.3, 1.35, 1.95, 1.4], fontFace: F, fontSize: 9.5, color: TXT, valign: "middle",
        border: { type: "solid", pt: 0.5, color: LINE }, fill: { color: WHITE }, rowH: 0.3, margin: [1, 3, 1, 3] });
    // 4.2 correlation
    head(s, T, X2, 1.45, WD, "4.2  Correlation matrix (ρ)");
    s.addTable([[Hc("Asset")].concat(ASSETS.map(Hc))].concat(RHO.map((row, i) => [C(ASSETS[i], { bold: true, align: "left" })].concat(row.map((v, j) => C(v.toFixed(3), i === j ? { color: MUTED } : {}))))),
      { x: X2, y: 1.8, w: WD, colW: [1.25, 0.95, 0.95, 0.95, 0.95, 0.95], fontFace: F, fontSize: 9.5, color: TXT, valign: "middle",
        border: { type: "solid", pt: 0.5, color: LINE }, fill: { color: WHITE }, rowH: 0.3, margin: [1, 3, 1, 3] });
    // 4.3 vol grid
    head(s, T, X1, 3.85, WD, "4.3  Implied volatility grid (σ), annualised");
    const yrs = ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5"];
    s.addTable([[Hc("Asset / Year")].concat(yrs.map(Hc))].concat(VOL.map((row, i) => [C(ASSETS[i], { bold: true, align: "left" })].concat(row.map((v) => C(v.toFixed(2) + "%"))))),
      { x: X1, y: 4.2, w: WD, colW: [1.25, 0.95, 0.95, 0.95, 0.95, 0.95], fontFace: F, fontSize: 9.5, color: TXT, valign: "middle",
        border: { type: "solid", pt: 0.5, color: LINE }, fill: { color: WHITE }, rowH: 0.3, margin: [1, 3, 1, 3] });
    // 4.4 interval variances
    head(s, T, X2, 3.85, WD, "4.4  Interval variances (ΔV), drive each year's diffusion step");
    s.addTable([[Hc("Asset / Interval")].concat(yrs.map(Hc))].concat(DV.map((row, i) => [C(ASSETS[i], { bold: true, align: "left" })].concat(row.map((v) => C(v.toFixed(4)))))),
      { x: X2, y: 4.2, w: WD, colW: [1.25, 0.95, 0.95, 0.95, 0.95, 0.95], fontFace: F, fontSize: 9.5, color: TXT, valign: "middle",
        border: { type: "solid", pt: 0.5, color: LINE }, fill: { color: WHITE }, rowH: 0.3, margin: [1, 3, 1, 3] });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 6.1, w: 12.33, h: 0.5, fill: { color: BLUE }, line: { color: BLUE } });
    T(`Basket weights ${ASSETS.map((a, i) => `${a} ${W[i]}%`).join(" · ")}   |   Autocall barriers ${H.join(" / ")}   |   Maturity barrier 70%`,
      { x: 0.65, y: 6.1, w: 12.03, h: 0.5, fontSize: 11, bold: true, color: WHITE, align: "center", valign: "middle" });
    T("Source: team write-up, section 4. Rates: case USD funding grid (Year 4 interpolated). Correlation matrix checked positive definite before the Cholesky decomposition.",
      { x: 0.5, y: 6.66, w: 12.33, h: 0.28, fontSize: 8, italic: true, color: MUTED });
    s.addNotes("All inputs to the simulation. Term structure: the case USD grid, with Year 4 interpolated between 3 and 5 years, converted to continuous rates and discount factors. Correlations: pairwise correlations between the five ETFs. Implied volatilities: a term structure for each ETF over five years. Interval variances: the variance used for each one-year step in the simulation.");
  }
}

module.exports = { addAppendixPricing };

if (require.main === module) {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";
  pres.title = "Appendix: pricing the fair coupon";
  addAppendixPricing(pres);
  pres.writeFile({ fileName: path.join(__dirname, "Appendix-Pricing.pptx") }).then((f) => console.log("wrote", f));
}
