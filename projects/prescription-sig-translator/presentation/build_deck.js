// build_deck.js - builds the project presentation.
//
//   node build_deck.js            -> prescription-sig-translator-presentation.pptx
//
// Screenshots: save PNGs of the running app into ./screenshots with these names
// and rerun the script; each one is placed on its slide automatically.
//   01_clean_sig.png   02_model_flag.png   03_rule_check.png   04_batch.png
// If a file is missing, that slide keeps an empty picture placeholder, which can
// also be filled by hand in PowerPoint (click the picture icon).
//
// Requires: npm install pptxgenjs   (optional for icons: react react-dom react-icons sharp)

const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");

let applyTheme = null;
try { ({ applyTheme } = require(process.env.APPLY_THEME || "./apply_theme.js")); } catch (e) { /* optional */ }

// ------------------------------------------------------------------ theme
const THEME = {
  name: "Sig Translator",
  headFontFace: "Cambria",
  bodyFontFace: "Calibri",
  colors: {
    dk1: "1B2A2A", lt1: "FFFFFF", dk2: "0F3D3E", lt2: "EAF3F0",
    accent1: "1F7A64", accent2: "E58E1A", accent3: "6B8F87", accent4: "B54708",
    accent5: "3F5BA9", accent6: "9DB8B1", hlink: "1F7A64", folHlink: "6B8F87",
  },
};
const HEX = THEME.colors;

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.author = "Keaton Ludwig";
pres.title = "Prescription Sig Translator";
const C = pres.SchemeColor;

// ------------------------------------------------------------------ icons (optional)
let icon = () => null;
try {
  const React = require("react");
  const RDS = require("react-dom/server");
  const fa = require("react-icons/fa");
  const sharp = require("sharp");
  const cache = {};
  icon = async (name, color) => {
    const key = name + color;
    if (cache[key]) return cache[key];
    const svg = RDS.renderToStaticMarkup(React.createElement(fa[name], { color: "#" + color, size: 256 }));
    const buf = await sharp(Buffer.from(svg)).png().toBuffer();
    return (cache[key] = "image/png;base64," + buf.toString("base64"));
  };
} catch (e) { /* icons are decoration only */ }

// ------------------------------------------------------------------ layouts
const FOOT = "Keaton Ludwig | Prescription Sig Translator";
pres.defineSlideMaster({
  title: "TITLE_DARK",
  background: { color: HEX.dk2 },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: 0.8, y: 2.0, w: 11.7, h: 1.9,
      fontFace: THEME.headFontFace, fontSize: 44, bold: true, color: C.background1, valign: "bottom" }, text: "" } },
    { placeholder: { options: { name: "body", type: "body", x: 0.8, y: 4.1, w: 11.7, h: 1.5,
      fontSize: 20, color: C.background2, valign: "top" }, text: "" } },
  ],
});
pres.defineSlideMaster({
  title: "CONTENT",
  background: { color: HEX.lt1 },
  margin: [0.5, 0.6, 0.6, 0.6],
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: 0.6, y: 0.35, w: 12.1, h: 0.85,
      fontFace: THEME.headFontFace, fontSize: 34, bold: true, color: C.text2, valign: "middle" }, text: "" } },
    { text: { text: FOOT, options: { x: 0.6, y: 7.0, w: 8, h: 0.3, fontSize: 10, color: C.accent3 } } },
  ],
  slideNumber: { x: 12.2, y: 7.0, w: 0.6, h: 0.3, fontSize: 10, color: C.accent3, align: "right" },
});
pres.defineSlideMaster({
  title: "SCREENSHOT",
  background: { color: HEX.lt2 },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: 0.6, y: 0.35, w: 12.1, h: 0.85,
      fontFace: THEME.headFontFace, fontSize: 34, bold: true, color: C.text2, valign: "middle" }, text: "" } },
    { rect: { x: 0.6, y: 1.4, w: 8.9, h: 5.3, fill: { color: "FFFFFF" }, line: { color: "FFFFFF", width: 0.5 } } },
    { text: { text: "Screenshot goes here: save it in screenshots/ and rerun build_deck.js, or click to insert a picture",
      options: { x: 1.1, y: 3.7, w: 7.9, h: 0.6, fontSize: 13, color: "6B8F87", align: "center", italic: true } } },
    { placeholder: { options: { name: "shot", type: "pic", x: 0.6, y: 1.4, w: 8.9, h: 5.3, color: C.text2 },
      text: "Screenshot of the running app" } },
    { placeholder: { options: { name: "body", type: "body", x: 9.85, y: 1.4, w: 2.9, h: 5.3,
      fontSize: 15, color: C.text1, valign: "top" }, text: "" } },
    { text: { text: FOOT, options: { x: 0.6, y: 7.0, w: 8, h: 0.3, fontSize: 10, color: C.accent3 } } },
  ],
  slideNumber: { x: 12.2, y: 7.0, w: 0.6, h: 0.3, fontSize: 10, color: C.accent3, align: "right" },
});

// ------------------------------------------------------------------ helpers
const T = (o) => Object.assign({ isTextBox: true, margin: 0, fontSize: 15, color: C.text1, valign: "top" }, o);

async function iconCircle(slide, name, x, y, d, fill, fg) {
  slide.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: fill }, line: { color: fill } });
  const img = await icon(name, fg);
  if (img) slide.addImage({ data: img, x: x + d * 0.25, y: y + d * 0.25, w: d * 0.5, h: d * 0.5 });
}

function card(slide, x, y, w, h, fill) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.12, fill: { color: fill || C.background2 },
    line: { color: fill || C.background2 } });
}

function bullets(items, size) {
  return items.map((t, i) => ({ text: t, options: { bullet: true, breakLine: i < items.length - 1, paraSpaceAfter: 8, fontSize: size || 15 } }));
}

const chartText = { catAxisLabelFontFace: "+mn-lt", valAxisLabelFontFace: "+mn-lt", dataLabelFontFace: "+mn-lt",
  titleFontFace: "+mn-lt", legendFontFace: "+mn-lt", catAxisLabelColor: "4A5A58", valAxisLabelColor: "4A5A58",
  catAxisLabelFontSize: 12, valAxisLabelFontSize: 11, dataLabelFontSize: 12, legendFontSize: 12, titleFontSize: 14,
  titleColor: HEX.dk2, dataLabelColor: "1B2A2A" };

// ------------------------------------------------------------------ slides
async function build() {
  // 1. Title ----------------------------------------------------------------
  pres.addSection({ title: "Introduction" });
  let s = pres.addSlide({ masterName: "TITLE_DARK", sectionTitle: "Introduction" });
  s.addText("Translating Prescription Sigs With a Fine-Tuned Language Model", { placeholder: "title" });
  s.addText([
    { text: "A Streamlit app that drafts patient labels and flags error-prone sigs for the pharmacist", options: { breakLine: true } },
    { text: "Keaton Ludwig  |  Generative AI project  |  November 2026", options: { fontSize: 15 } },
  ], { placeholder: "body" });
  await iconCircle(s, "FaPrescriptionBottleAlt", 0.8, 0.8, 0.95, C.accent1, "FFFFFF");
  s.addNotes("This project fine-tunes a small open-source language model to read prescription sigs, the shorthand directions on a prescription, and turn them into the sentence printed on a patient's label. Just as important, it teaches the model when not to translate: error-prone abbreviations get flagged for the pharmacist. The final step puts the fine-tuned model into a Streamlit app.");

  // 2. Problem --------------------------------------------------------------
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Introduction" });
  s.addText("One letter can mean four times the dose", { placeholder: "title" });
  card(s, 0.6, 1.5, 5.6, 2.6, C.background2);
  s.addText([
    { text: "1 tab po QD", options: { fontFace: "Courier New", fontSize: 30, bold: true, color: C.text2, breakLine: true } },
    { text: "intended: once daily", options: { fontSize: 16, color: C.accent3, breakLine: true } },
    { text: " ", options: { fontSize: 10, breakLine: true } },
    { text: "1 tab po QID", options: { fontFace: "Courier New", fontSize: 30, bold: true, color: C.accent4, breakLine: true } },
    { text: "misread: four times daily", options: { fontSize: 16, color: C.accent4 } },
  ], T({ x: 0.95, y: 1.75, w: 5.0, h: 2.2 }));
  s.addText("4x", T({ x: 0.6, y: 4.4, w: 2.2, h: 1.2, fontSize: 66, bold: true, color: C.accent4, fontFace: THEME.headFontFace }));
  s.addText("dosing difference from a one-character misreading. QD, QOD, U, OD and TIW are on the ISMP and Joint Commission lists of abbreviations to avoid.",
    T({ x: 2.8, y: 4.55, w: 3.4, h: 1.4, fontSize: 14, color: C.text1 }));
  s.addText([
    { text: "What a sig is", options: { bold: true, fontSize: 18, color: C.text2, breakLine: true } },
    { text: "The coded direction a prescriber writes, e.g. 1-2 tabs PO q4-6h PRN pain, max 8/day. Pharmacy technicians translate it into the label sentence.", options: { fontSize: 15, breakLine: true } },
    { text: " ", options: { fontSize: 8, breakLine: true } },
    { text: "Why lookup tables are not enough", options: { bold: true, fontSize: 18, color: C.text2, breakLine: true } },
    { text: "Dispensing software expands common codes, but it translates error-prone codes confidently and wrongly, and struggles with long free-text sigs.", options: { fontSize: 15, breakLine: true } },
    { text: " ", options: { fontSize: 8, breakLine: true } },
    { text: "Patients misread labels too", options: { bold: true, fontSize: 18, color: C.text2, breakLine: true } },
    { text: "Plain-language instructions improve comprehension (Davis et al., 2006; Wolf et al., 2011).", options: { fontSize: 15 } },
  ], T({ x: 6.8, y: 1.5, w: 5.9, h: 5.2 }));
  s.addNotes("I work as a pharmacy technician and translate sigs every shift. The danger is in the shorthand itself: QD and QID differ by one letter but by a factor of four. Those abbreviations are on the ISMP and Joint Commission do-not-use lists. Software lookup tables handle common codes but print a confident wrong answer for these.");

  // 3. What it does ---------------------------------------------------------
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Introduction" });
  s.addText("The system drafts, flags, and hands off", { placeholder: "title" });
  const steps = [
    ["FaKeyboard", "Raw sig in", "One sig only. No drug name, strength or patient data."],
    ["FaBrain", "Fine-tuned model", "Qwen2.5-0.5B writes a 12-field JSON label."],
    ["FaShieldAlt", "Safety checks", "Model flags, schema validation, and a rule-based abbreviation scan."],
    ["FaUserMd", "Pharmacist", "Clean labels go to verification. Flagged sigs never print on their own."],
  ];
  for (let i = 0; i < steps.length; i++) {
    const x = 0.6 + i * 3.1;
    card(s, x, 1.6, 2.8, 3.1, i === 2 ? "FDF1E1" : C.background2);
    await iconCircle(s, steps[i][0], x + 0.25, 1.85, 0.8, i === 2 ? C.accent2 : C.accent1, "FFFFFF");
    s.addText(steps[i][1], T({ x: x + 0.25, y: 2.85, w: 2.35, h: 0.45, fontSize: 18, bold: true, color: C.text2 }));
    s.addText(steps[i][2], T({ x: x + 0.25, y: 3.35, w: 2.35, h: 1.3, fontSize: 14 }));
    if (i < 3) s.addShape(pres.shapes.RIGHT_ARROW, { x: x + 2.83, y: 3.0, w: 0.24, h: 0.3, fill: { color: C.accent3 }, line: { color: C.accent3 } });
  }
  s.addText([
    { text: "Example output  ", options: { bold: true, color: C.text2 } },
    { text: "1-2 tabs PO q4-6h PRN pain, max 8/day", options: { fontFace: "Courier New", color: C.accent1 } },
    { text: "  ->  \"Take 1 to 2 tablets by mouth every 4 to 6 hours as needed for pain. Do not take more than 8 tablets per day.\"" },
  ], T({ x: 0.6, y: 5.15, w: 12.1, h: 0.9, fontSize: 15 }));
  s.addNotes("The input is just the sig. The model returns a fixed 12-field JSON record: the breakdown, the patient sentence, and a list of flags. The app then applies safety checks, and only a clean, valid label is shown as ready for the pharmacist to verify.");

  // 4. Data -----------------------------------------------------------------
  pres.addSection({ title: "Building the model" });
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Building the model" });
  s.addText("Training data built from real hospital orders", { placeholder: "title" });
  const funnel = [["18,087", "MIMIC-IV demo medication orders (100 de-identified patients)"],
    ["6,587", "map cleanly to a retail sig (IV, IM and tube orders dropped)"],
    ["845", "training examples: 676 train / 84 validation / 85 test"]];
  funnel.forEach((f, i) => {
    const w = 6.4 - i * 0.9;
    card(s, 0.6, 1.55 + i * 1.6, w, 1.35, i === 2 ? C.accent1 : C.background2);
    s.addText(f[0], T({ x: 0.85, y: 1.7 + i * 1.6, w: 2.0, h: 1.0, fontSize: 36, bold: true, fontFace: THEME.headFontFace,
      color: i === 2 ? C.background1 : C.text2, valign: "middle" }));
    s.addText(f[1], T({ x: 2.9, y: 1.7 + i * 1.6, w: w - 2.5, h: 1.05, fontSize: 14, color: i === 2 ? C.background1 : C.text1, valign: "middle" }));
  });
  s.addChart(pres.charts.DOUGHNUT, [{ name: "Examples", labels: ["Routine", "Complex", "Error-prone"], values: [560, 120, 165] }],
    Object.assign({}, chartText, { x: 7.4, y: 1.4, w: 5.3, h: 3.5, holeSize: 55, showTitle: true, title: "845 examples by group",
      showPercent: false, showValue: true, dataLabelColor: "FFFFFF", showLegend: true, legendPos: "r",
      chartColors: [HEX.accent1, HEX.accent3, HEX.accent2] }));
  s.addText(bullets([
    "Labels are correct by construction: every field comes from the structured order, not from a model.",
    "165 error-prone sigs, 11 for each of 15 ISMP / Joint Commission types.",
    "126 generated sigs removed because they matched a test input.",
  ], 14), T({ x: 7.4, y: 5.05, w: 5.3, h: 1.8 }));
  s.addNotes("No public dataset of pharmacist-approved sigs exists, so I built one from the open MIMIC-IV demo. Joining the prescriptions and pharmacy tables gives real dose, form, route and frequency. After dropping inpatient-only orders, 6,587 remained, from which I built 845 examples in three groups. Because labels come from the structured order, they cannot be hallucinated.");

  // 5. Prompting failed ----------------------------------------------------
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Building the model" });
  s.addText("Prompting alone never learned when to stop", { placeholder: "title" });
  s.addChart(pres.charts.BAR, [
    { name: "Flag recall (%)", labels: ["Zero-shot plain", "Zero-shot + rules", "Few-shot", "Explicit list", "Best prompt 0.5B", "Best prompt 3B"], values: [0, 66.7, 50, 66.7, 62.5, 0] },
    { name: "False flags (%)", labels: ["Zero-shot plain", "Zero-shot + rules", "Few-shot", "Explicit list", "Best prompt 0.5B", "Best prompt 3B"], values: [0, 75, 66.7, 33.3, 50, 45] },
  ], Object.assign({}, chartText, { x: 0.6, y: 1.4, w: 7.6, h: 5.3, barDir: "col", barGrouping: "clustered",
    chartColors: [HEX.accent1, HEX.accent2], showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "0",
    showLegend: true, legendPos: "b", valAxisMaxVal: 100, valGridLine: { color: "E3ECE9", size: 0.75 }, catGridLine: { style: "none" },
    showTitle: true, title: "Prompt experiments before fine-tuning (higher recall, lower false flags is better)" }));
  card(s, 8.6, 1.5, 4.1, 2.3, "FDF1E1");
  s.addText([{ text: "0%", options: { fontSize: 54, bold: true, color: C.accent4, fontFace: THEME.headFontFace, breakLine: true } },
    { text: "of error-prone sigs flagged by Qwen2.5-3B, a model six times larger, with the best prompt.", options: { fontSize: 14 } }],
    T({ x: 8.9, y: 1.65, w: 3.6, h: 2.0 }));
  s.addText(bullets([
    "Bigger models knew more abbreviations but still translated them.",
    "Prompts that avoided errors did it by flagging most safe sigs.",
    "Conclusion: knowing when to flag is a learned behavior, so fine-tune.",
  ], 15), T({ x: 8.6, y: 4.1, w: 4.1, h: 2.6 }));
  s.addNotes("Before fine-tuning, I ran five prompt experiments. Prompts either flagged nothing or flagged almost everything. The 3B model, six times larger, flagged none of the error-prone sigs. That told me the behavior of stopping to flag had to be learned, which is what fine-tuning is for.");

  // 6. Training ------------------------------------------------------------
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Building the model" });
  s.addText("A full fine-tune of all 494 million parameters", { placeholder: "title" });
  const steps6 = ["0", "10", "20", "30", "40", "50", "60", "70", "80", "90", "100", "110", "120"];
  s.addChart(pres.charts.LINE, [
    { name: "Validation loss", labels: steps6, values: [1.947, 0.182, 0.049, 0.068, 0.0176, 0.0194, 0.016, 0.011, 0.0067, 0.0084, 0.0046, 0.0033, 0.0027] },
  ], Object.assign({}, chartText, { x: 0.6, y: 1.4, w: 7.4, h: 5.3, chartColors: [HEX.accent1], lineSize: 3, lineDataSymbolSize: 7,
    valAxisLogScaleBase: 10, valAxisMinVal: 0.001, valAxisMaxVal: 10, showLegend: false, showTitle: true,
    title: "Validation loss by optimizer step (log scale)", catAxisTitle: "Step", showCatAxisTitle: true,
    catAxisTitleFontFace: "+mn-lt", catAxisTitleColor: "4A5A58", catAxisTitleFontSize: 12,
    valGridLine: { color: "E3ECE9", size: 0.75 }, catGridLine: { style: "none" } }));
  const cfg = [["Model", "Qwen2.5-0.5B-Instruct"], ["Method", "Full fine-tune, no LoRA"], ["Optimizer", "AdamW, lr 2e-5, linear decay"],
    ["Schedule", "3 epochs, effective batch 16"], ["Hardware", "RTX 5080, bf16, 12.2 GB peak"], ["Time", "3.3 minutes"],
    ["Val. loss", "1.947 -> 0.0027"], ["Token accuracy", "61.3% -> 99.9%"]];
  s.addTable(cfg.map((r, i) => [
    { text: r[0], options: { bold: true, color: HEX.dk2, fill: { color: i % 2 ? "FFFFFF" : HEX.lt2 } } },
    { text: r[1], options: { color: HEX.dk1, fill: { color: i % 2 ? "FFFFFF" : HEX.lt2 } } }]),
    { x: 8.4, y: 1.5, w: 4.3, colW: [1.55, 2.75], fontSize: 13, fontFace: THEME.bodyFontFace, rowH: 0.42,
      border: { type: "solid", pt: 0.5, color: "D5E3DF" } });
  s.addText("Training and validation loss fell together with no gap, so no sign of overfitting. The model saw only a one-sentence system prompt, so the flagging rules had to be learned from data.",
    T({ x: 8.4, y: 5.1, w: 4.3, h: 1.6, fontSize: 13, color: C.text1 }));
  s.addNotes("Every parameter was trained, with no adapters. Training took about three minutes on my own GPU. Validation loss dropped from 1.95 to 0.003 and the curves show a good fit. These numbers say the model learned my label format; whether it reads sigs correctly is the next slide.");

  // 7. Results ------------------------------------------------------------
  pres.addSection({ title: "Results" });
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Results" });
  s.addText("Fine-tuning cut critical errors sharply", { placeholder: "title" });
  const sys = ["Lookup table", "Base 0.5B + prompt", "Base 3B + prompt", "Fine-tuned 0.5B"];
  s.addChart(pres.charts.BAR, [
    { name: "Held-out test (n=85)", labels: sys, values: [18, 41, 27, 3] },
    { name: "Hand-written suite (n=28)", labels: sys, values: [12, 9, 9, 3] },
  ], Object.assign({}, chartText, { x: 0.6, y: 1.4, w: 7.6, h: 5.3, barDir: "col", barGrouping: "clustered",
    chartColors: [HEX.accent3, HEX.accent1], showValue: true, dataLabelPosition: "outEnd", showLegend: true, legendPos: "b",
    valGridLine: { color: "E3ECE9", size: 0.75 }, catGridLine: { style: "none" }, showTitle: true,
    title: "Critical errors: confidently wrong labels (lower is better)" }));
  const stats = [["0.880", "flag F1 (vs. 0.380 base 0.5B, 0.182 base 3B)"], ["7 of 8", "error-prone sigs caught on the hand-written suite"], ["5%", "false flags, down from 50%"]];
  stats.forEach((st, i) => {
    card(s, 8.6, 1.5 + i * 1.75, 4.1, 1.5, i === 0 ? C.accent1 : C.background2);
    s.addText(st[0], T({ x: 8.85, y: 1.6 + i * 1.75, w: 3.6, h: 0.75, fontSize: 34, bold: true, fontFace: THEME.headFontFace,
      color: i === 0 ? C.background1 : C.text2 }));
    s.addText(st[1], T({ x: 8.85, y: 2.35 + i * 1.75, w: 3.6, h: 0.55, fontSize: 13, color: i === 0 ? C.background1 : C.text1 }));
  });
  s.addNotes("Critical errors are my main metric: a safe sig mistranslated, or an error-prone sig printed without a flag. The fine-tuned 0.5B model made 3 on each test set, versus 41 and 9 for the same model before training. Flag F1 went from 0.38 to 0.88. The hand-written suite is the more honest test because it did not come from my generator.");

  // 8. Error analysis -> M4 change -------------------------------------------
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Results" });
  s.addText("The remaining errors pointed to a fix", { placeholder: "title" });
  const errs = [["Uppercase QD read as \"once daily\"", "3 critical errors. Only 1 training example had QD in capitals."],
    ["Dotted t.i.w. translated", "Correct meaning, but TIW must be flagged."],
    ["R1 with no dose form became an eye drop", "No training sig lacked a dose form."],
    ["Invented flag reasons", "e.g. claiming AA is on the Do Not Use list. The flag still held the label."]];
  for (let i = 0; i < errs.length; i++) {
    await iconCircle(s, "FaExclamationTriangle", 0.6, 1.55 + i * 1.3, 0.65, "FDF1E1", HEX.accent4);
    s.addText(errs[i][0], T({ x: 1.45, y: 1.55 + i * 1.3, w: 5.4, h: 0.4, fontSize: 17, bold: true, color: C.text2 }));
    s.addText(errs[i][1], T({ x: 1.45, y: 1.97 + i * 1.3, w: 5.4, h: 0.7, fontSize: 14 }));
  }
  card(s, 7.3, 1.5, 5.4, 5.2, C.background2);
  await iconCircle(s, "FaShieldAlt", 7.6, 1.8, 0.8, C.accent1, "FFFFFF");
  s.addText("App change: a rule-based safety layer", T({ x: 8.6, y: 1.85, w: 3.9, h: 0.8, fontSize: 18, bold: true, color: C.text2 }));
  s.addText(bullets([
    "Most remaining critical errors were missed flags, not bad translations.",
    "The app now scans every raw sig for the ISMP / Joint Commission abbreviations with regular expressions, in every format (qd, QD, q.d.).",
    "A hit holds the label for review even if the model did not flag it, and the reason names the real list entry.",
    "Tested on the hand-written suite: all error-prone inputs caught, no safe sig falsely flagged.",
  ], 14), T({ x: 7.6, y: 2.85, w: 4.85, h: 3.7 }));
  s.addNotes("Reading the errors showed a pattern: the dangerous ones were missed flags, especially QD in capital letters. Rather than wait for a retrain, the app adds a deterministic second layer: a regex scan for the listed abbreviations. The model handles translation and unfamiliar input, the rules guarantee the known dangerous codes are never printed.");

  // 9. App architecture ------------------------------------------------------
  pres.addSection({ title: "The app" });
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "The app" });
  s.addText("Inside the Streamlit app", { placeholder: "title" });
  const layers = [["FaBrain", "1. Model flags", "The fine-tuned model's own flags and needs_pharmacist_review field."],
    ["FaCode", "2. Schema validation", "The reply must parse as the 12-field JSON label. A broken reply is never shown as a label."],
    ["FaSearch", "3. Safety checks", "Regex scan for error-prone abbreviations, plus a check for a body site or route the sig never implied."]];
  for (let i = 0; i < layers.length; i++) {
    const y = 1.5 + i * 1.45;
    card(s, 0.6, y, 6.6, 1.25, C.background2);
    await iconCircle(s, layers[i][0], 0.85, y + 0.22, 0.8, C.accent1, "FFFFFF");
    s.addText(layers[i][1], T({ x: 1.9, y: y + 0.15, w: 5.1, h: 0.4, fontSize: 17, bold: true, color: C.text2 }));
    s.addText(layers[i][2], T({ x: 1.9, y: y + 0.55, w: 5.1, h: 0.65, fontSize: 13 }));
  }
  s.addText("Any one layer holds the label. Only a valid, unflagged label is shown as ready, and even then the pharmacist signs off.",
    T({ x: 0.6, y: 5.95, w: 6.6, h: 0.8, fontSize: 14, italic: true, color: C.accent1 }));
  s.addText([
    { text: "Three tabs", options: { bold: true, fontSize: 18, color: C.text2, breakLine: true } },
    { text: "Translate a sig: ", options: { bold: true, bullet: true } }, { text: "label card, field breakdown, flags with their source, verify or send-to-pharmacist log.", options: { breakLine: true } },
    { text: "Batch queue: ", options: { bold: true, bullet: true } }, { text: "paste or upload a CSV of sigs, sort into ready vs. needs review, download results.", options: { breakLine: true } },
    { text: "About the model: ", options: { bold: true, bullet: true } }, { text: "training setup, evaluation results, limitations.", options: { breakLine: true } },
    { text: " ", options: { fontSize: 8, breakLine: true } },
    { text: "Runs locally", options: { bold: true, fontSize: 18, color: C.text2, breakLine: true } },
    { text: "The 2 GB model loads once (cached) on GPU or CPU, so prescription text never leaves the pharmacy computer. Code: app.py (interface) and sig_engine.py (model, validation, rules).", options: {} },
  ], T({ x: 7.7, y: 1.5, w: 5.0, h: 5.2, fontSize: 14, paraSpaceAfter: 6 }));
  s.addNotes("The app is two Python files. sig_engine.py loads the fine-tuned model, runs greedy decoding with the same short prompt used in training, validates the JSON and runs the rule check. app.py is the Streamlit interface with three tabs. The model runs locally.");

  // 10-13. Screenshots ------------------------------------------------------
  const shots = [
    ["01_clean_sig.png", "A routine sig becomes a ready-to-verify label",
      ["Input: 1-2 tabs PO q4-6h PRN pain, max 8/day", "No flags from the model or the safety checks, so the label is ready for verification.", "Dose range, interval, PRN reason and the 8-tablet daily maximum are all kept.", "About 2 to 4 seconds per sig on my GPU."]],
    ["02_model_flag.png", "An error-prone sig is held for the pharmacist",
      ["Input: 1 gtt OD bid", "Both the model and the rule check flagged it.", "The model's best reading says left eye and its reason calls OD \"once daily\". OD means right eye.", "That is why a flagged reading is never printed. The rule check's reason states the real meaning."]],
    ["03_rule_check.png", "The rule check catches what the model missed",
      ["Input: 1 TAB PO QD", "The model translated it as \"once daily\" with no flag, the same blind spot found in the evaluation.", "The rule check flags QD and names the Do Not Use entry, so the label is held anyway."]],
    ["04_batch.png", "Batch mode sorts a queue of sigs",
      ["8 sigs: 4 ready, 4 held for review.", "All 4 safe sigs translated correctly, none over-flagged.", "The model flagged 3 of the 4 error-prone sigs. The rule check caught the 4th (1 TAB PO QD).", "Results download as CSV."]],
  ];
  for (const [file, title, notes] of shots) {
    s = pres.addSlide({ masterName: "SCREENSHOT", sectionTitle: "The app" });
    s.addText(title, { placeholder: "title" });
    const p = path.join(__dirname, "..", "screenshots", file);
    if (fs.existsSync(p)) {
      s.addImage({ path: p, placeholder: "shot", x: 0.6, y: 1.4, w: 8.9, h: 5.3, sizing: { type: "contain", w: 8.9, h: 5.3 } });
    }
    s.addText(notes.map((t, i) => ({ text: t, options: { bullet: true, breakLine: i < notes.length - 1, paraSpaceAfter: 10 } })), { placeholder: "body" });
    s.addNotes(title + ". " + notes.join(" "));
  }

  // 14. Limitations and next steps -------------------------------------------
  pres.addSection({ title: "Wrap-up" });
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Wrap-up" });
  s.addText("Limitations and next steps", { placeholder: "title" });
  card(s, 0.6, 1.5, 5.9, 5.2, C.background2);
  s.addText("Limitations", T({ x: 0.9, y: 1.75, w: 5.3, h: 0.5, fontSize: 20, bold: true, color: C.text2 }));
  s.addText(bullets([
    "Hospital data from 100 patients: few inhalers, eye drops or topical sigs; no ear drops.",
    "Held-out sigs share a generator with training; the hand-written suite is only 28 sigs.",
    "Results vary by 1 to 2 errors between identical training runs.",
    "Flag reasons can be invented; the scorer checks facts appear, not where they attach.",
  ], 14), T({ x: 0.9, y: 2.35, w: 5.3, h: 4.2 }));
  card(s, 6.8, 1.5, 5.9, 5.2, "E4F1EC");
  s.addText("Next steps", T({ x: 7.1, y: 1.75, w: 5.3, h: 0.5, fontSize: 20, bold: true, color: C.text2 }));
  s.addText(bullets([
    "Retrain with every error-prone code in every format, sigs with no dose form, and \"max N doses in M minutes\".",
    "Train with three seeds and report the mean and range.",
    "Build a 100+ sig hand-written test set, ideally de-identified real sigs with approval.",
    "Pilot as a drafting aid alongside the pharmacist, never as an automatic printer.",
  ], 14), T({ x: 7.1, y: 2.35, w: 5.3, h: 4.2 }));
  s.addNotes("The biggest limitation is the data: a hospital demo of 100 patients does not look like a retail pharmacy. The next steps are a retrain that fills those gaps, multiple seeds for fair averages, and a larger hand-written test set.");

  // 15. Closing ------------------------------------------------------------
  s = pres.addSlide({ masterName: "TITLE_DARK", sectionTitle: "Wrap-up" });
  s.addText("Fine-tuning taught a small model when to stop", { placeholder: "title" });
  s.addText("Critical errors 41 -> 3 on held-out sigs and 9 -> 3 on the hand-written suite, in a 2 GB model that runs on a pharmacy computer. The model drafts and flags; the pharmacist verifies.",
    { placeholder: "body" });
  s.addNotes("To sum up: prompting could not teach the model when a sig is unsafe to translate; fine-tuning could. Combined with a rule-based check in the app, it is a practical drafting and flagging tool that keeps the pharmacist in charge.");

  // 16. References ----------------------------------------------------------
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Wrap-up" });
  s.addText("References", { placeholder: "title" });
  const refs = [
    "Bahree, A. (2024). Generative AI in action. Manning Publications.",
    "Davis, T. C., et al. (2006). Literacy and misunderstanding prescription drug labels. Annals of Internal Medicine, 145(12), 887-894.",
    "Institute for Safe Medication Practices. (2021). ISMP list of error-prone abbreviations, symbols, and dose designations. https://www.ismp.org",
    "Johnson, A., Bulgarelli, L., Pollard, T., Horng, S., Celi, L. A., & Mark, R. (2023). MIMIC-IV Clinical Database Demo (version 2.2). PhysioNet. https://doi.org/10.13026/dp1f-ex47",
    "Qwen. (2024). Qwen2.5-0.5B-Instruct [Model card]. Hugging Face. https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct",
    "Streamlit. (2026). Streamlit documentation. https://docs.streamlit.io",
    "The Joint Commission. (2023). Do not use list. https://www.jointcommission.org",
    "Wolf, M. S., et al. (2011). Effect of standardized, patient-centered label instructions to improve comprehension of prescription drug use. Medical Care, 49(1), 96-100.",
    "Wolf, T., et al. (2020). Transformers: State-of-the-art natural language processing. Proceedings of EMNLP 2020: System Demonstrations, 38-45.",
  ];
  s.addText(refs.map((r, i) => ({ text: r, options: { breakLine: i < refs.length - 1, paraSpaceAfter: 7, indentLevel: 0 } })),
    T({ x: 0.6, y: 1.45, w: 12.1, h: 5.35, fontSize: 13 }));

  const out = path.join(__dirname, "prescription-sig-translator-presentation.pptx");
  await pres.writeFile({ fileName: out });
  if (applyTheme) await applyTheme(out, THEME);
  console.log("Wrote", out);
}

build().catch((e) => { console.error(e); process.exit(1); });
