// Rearranged "Our client: NKE Private Wealth" slide (team template style: blue bars, Arial, section footer).
// Build: NODE_PATH=<dir with pptxgenjs, react, react-dom, react-icons, sharp> node deck/build_client_slide.js
const path = require("path");
const pptxgen = require("pptxgenjs");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const sharp = require("sharp");
const { FaBuilding, FaUsers, FaSeedling, FaMicrochip, FaLink } = require("react-icons/fa");

const BLUE = "2C5F82", BLUE_L = "E8EFF5", GRAY = "F2F2F2", TXT = "262626", MUTED = "595959", WHITE = "FFFFFF", LINE = "BFBFBF";
const F = "Arial";

async function icon(Comp, color) {
  const svg = renderToStaticMarkup(React.createElement(Comp, { color: "#" + color, size: 256 }));
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + png.toString("base64");
}

(async () => {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
  const s = pres.addSlide();
  s.background = { color: WHITE };
  const T = (t, o) => s.addText(t, Object.assign({ fontFace: F, fontSize: 12, color: TXT, margin: 0, valign: "top", isTextBox: true }, o));

  // Title (template style)
  T("Our client: NKE Private Wealth", { x: 0.5, y: 0.3, w: 12.3, h: 0.6, fontSize: 26, valign: "middle" });
  s.addShape(pres.shapes.LINE, { x: 0.5, y: 0.98, w: 12.33, h: 0, line: { color: BLUE, width: 1 } });

  // Three equal columns with identical header bars
  const W = 3.95, G = 0.24, X = [0.5, 0.5 + W + G, 0.5 + 2 * (W + G)];
  const heads = ["Client profile", "Goals", "Risk tolerance: Moderate"];
  heads.forEach((h, i) => {
    s.addShape(pres.shapes.RECTANGLE, { x: X[i], y: 1.15, w: W, h: 0.5, fill: { color: BLUE }, line: { color: BLUE } });
    T(h, { x: X[i], y: 1.15, w: W, h: 0.5, fontSize: 17, bold: true, italic: true, color: WHITE, align: "center", valign: "middle" });
  });

  // Shared row grid so the three columns read across
  const ROW_Y = [1.85, 3.33, 4.81], ROW_H = 1.38;

  // ---- Column 1: profile (rows 1-2) + mandate (row 3)
  const prof = [
    [FaBuilding, "Provider: NKE Private Wealth", ["Prestigious single-family office for the Chak family", "Third-generation dynasty; Japan and Greater China", "Tech infrastructure, renewables, real estate; net worth > USD 2bn"]],
    [FaUsers, "Client: The Chak Family", ["Patriarch has handed operations to G3", "Now focused on strategic asset allocation and legacy planning in a volatile market"]],
  ];
  for (let i = 0; i < prof.length; i++) {
    const [ic, head, lines] = prof[i], y = [1.85, 3.62][i];
    s.addShape(pres.shapes.OVAL, { x: X[0], y: y + 0.02, w: 0.5, h: 0.5, fill: { color: BLUE_L }, line: { color: BLUE_L } });
    s.addImage({ data: await icon(ic, BLUE), x: X[0] + 0.12, y: y + 0.14, w: 0.26, h: 0.26 });
    T(head, { x: X[0] + 0.65, y, w: W - 0.65, h: 0.32, fontSize: 13.5, bold: true, italic: true, color: BLUE, valign: "middle" });
    T(lines.map((t, j) => ({ text: t, options: { bullet: { indent: 10 }, breakLine: j < lines.length - 1 } })),
      { x: X[0] + 0.65, y: y + 0.38, w: W - 0.65, h: ROW_H - 0.42, fontSize: 11, color: MUTED, paraSpaceAfter: 2 });
  }
  s.addShape(pres.shapes.RECTANGLE, { x: X[0], y: ROW_Y[2] + 0.05, w: W, h: ROW_H - 0.1, fill: { color: BLUE_L }, line: { color: BLUE, width: 1, dashType: "dash" } });
  T([{ text: "Client mandate", options: { bold: true, italic: true, color: BLUE, fontSize: 13.5, breakLine: true } },
     { text: "Allocate USD 100mn in a product that compounds capital for future generations and captures Asia's digital transformation", options: { fontSize: 11.5 } }],
    { x: X[0] + 0.2, y: ROW_Y[2] + 0.15, w: W - 0.4, h: ROW_H - 0.3, align: "center", valign: "middle" });

  // ---- Column 2: goals (icon circles)
  const goals = [
    [FaSeedling, "Capital for the next generations", "Grow the USD 100mn ticket while keeping a defined capital barrier, so the legacy sleeve is not an open-ended equity drawdown."],
    [FaMicrochip, "Digital transformation in Asia", "Meaningful exposure to the compute–power–platform stack that sits next to the family's own tech-infrastructure and renewable plants."],
    [FaLink, "Bridge old Asia and new tech", "Prefer underlyings that connect Japan and Greater China real-economy franchises with emerging technology."],
  ];
  for (let i = 0; i < goals.length; i++) {
    const [ic, head, body] = goals[i], y = ROW_Y[i];
    s.addShape(pres.shapes.OVAL, { x: X[1], y: y + 0.02, w: 0.5, h: 0.5, fill: { color: BLUE }, line: { color: BLUE } });
    s.addImage({ data: await icon(ic, WHITE), x: X[1] + 0.12, y: y + 0.14, w: 0.26, h: 0.26 });
    T(`${i + 1}. ${head}`, { x: X[1] + 0.65, y, w: W - 0.65, h: 0.32, fontSize: 13.5, bold: true, italic: true, color: TXT, valign: "middle" });
    T(body, { x: X[1] + 0.65, y: y + 0.38, w: W - 0.65, h: ROW_H - 0.42, fontSize: 11, color: MUTED });
  }

  // ---- Column 3: assumptions on a gray panel
  s.addShape(pres.shapes.RECTANGLE, { x: X[2], y: 1.65, w: W, h: 4.55, fill: { color: GRAY }, line: { color: GRAY } });
  const asm = [
    ["Structured products", "Family is open to structured notes / OTC, provided barriers and issuer credit are explicit."],
    ["Horizon & liquidity", "5-year horizon; trade date 17 Sep 2026. Secondary liquidity accepted as limited (issuer bid, not an exchange)."],
    ["Execution & eligibility", "NKE / Natixis can design, price and book a bespoke note. Underlyings must be Bloomberg-searchable large caps; no OFAC names."],
  ];
  asm.forEach((a, i) => {
    const y = ROW_Y[i];
    s.addShape(pres.shapes.OVAL, { x: X[2] + 0.15, y: y + 0.02, w: 0.5, h: 0.5, fill: { color: WHITE }, line: { color: BLUE, width: 1.5 } });
    T(String(i + 1), { x: X[2] + 0.15, y: y + 0.02, w: 0.5, h: 0.5, fontSize: 16, bold: true, italic: true, color: BLUE, align: "center", valign: "middle" });
    T(a[0], { x: X[2] + 0.8, y, w: W - 0.95, h: 0.32, fontSize: 13.5, bold: true, italic: true, color: TXT, valign: "middle" });
    T(a[1], { x: X[2] + 0.8, y: y + 0.38, w: W - 0.95, h: ROW_H - 0.42, fontSize: 11, color: MUTED });
  });

  // Key takeaway banner
  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 6.32, w: 12.33, h: 0.52, fill: { color: BLUE }, line: { color: BLUE } });
  T("The family owns Asian infrastructure, renewables and property. We should give them the AI hardware layer and exclude what they originally own.",
    { x: 0.6, y: 6.32, w: 12.13, h: 0.52, fontSize: 12, bold: true, color: WHITE, align: "center", valign: "middle" });

  // Section footer (template style)
  s.addShape(pres.shapes.LINE, { x: 0.5, y: 6.98, w: 12.33, h: 0, line: { color: LINE, width: 0.75 } });
  const nav = [["ANALYSIS", 0.5, true], ["STRATEGY", 4.69, false], ["APPENDIX", 8.89, false]];
  nav.forEach(([t, x, on]) => {
    if (on) s.addShape(pres.shapes.RECTANGLE, { x: x + 0.6, y: 6.96, w: 2.75, h: 0.05, fill: { color: BLUE }, line: { color: BLUE } });
    T(t, { x, y: 7.05, w: W, h: 0.3, fontSize: 12, bold: on, color: on ? BLUE : MUTED, align: "center", charSpacing: 1 });
  });
  T("2", { x: 12.43, y: 7.05, w: 0.4, h: 0.3, fontSize: 12, color: MUTED, align: "right" });

  await pres.writeFile({ fileName: path.join(__dirname, "Client-Slide-Rearranged.pptx") });
  console.log("wrote");
})();
