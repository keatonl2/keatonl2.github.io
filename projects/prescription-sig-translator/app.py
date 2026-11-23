"""
app.py - Streamlit front end for the prescription sig translator.

Run:
    streamlit run app.py

The app loads the fully fine-tuned Qwen2.5-0.5B-Instruct model
(folder sig_translator_qwen05b_full_ft, or the path in SIG_MODEL_DIR) and runs it
locally, so prescription text never leaves the machine.

Design rule: the app drafts and flags, a pharmacist verifies.
A label is only shown as print-ready when the model's output is valid JSON and
neither the model nor the rule-based check raised a flag. Nothing prints itself.
"""

import dataclasses
import io
import json
import os
from datetime import datetime

import pandas as pd
import streamlit as st

import sig_engine as se

st.set_page_config(page_title="Prescription Sig Translator", page_icon="💊", layout="wide")

EXAMPLES = {
    "Routine": [
        "1 tab po bid x10d",
        "2 puffs inh q4-6h prn sob",
        "5 ml po tid x7d",
        "apply thin layer to rash bid x2wk",
    ],
    "Complex": [
        "1-2 tabs PO q4-6h PRN pain, max 8/day",
        "2 tabs po on day 1, then 1 tab po daily on days 2-5",
        "1 tab po qam and 2 tabs po qpm",
        "4 tabs po daily x3d, then 3 tabs daily x3d, then 2 tabs daily x3d, then 1 tab daily x3d, then stop",
    ],
    "Error-prone": [
        "1 tab po qd",
        "inject 10 U subq qhs",
        "1 gtt OD bid",
        "take 1.0 mg po daily",
        "1 tab po tiw",
    ],
}

# Results from the fine-tuning notebook (held-out split = 85 sigs, M2 suite = 28 sigs)
M3_RESULTS = pd.DataFrame(
    [
        ["Lookup table", 18, 12, "0%", "0.000"],
        ["Base 0.5B + best prompt", 41, 9, "75%", "0.380"],
        ["Base 3B + best prompt", 27, 9, "0%", "0.182"],
        ["Fine-tuned 0.5B (this app)", 3, 3, "87.5%", "0.880"],
    ],
    columns=["System", "Critical errors (held-out, n=85)", "Critical errors (M2 suite, n=28)",
             "Flag recall (M2 suite)", "Flag F1"],
)

# --------------------------------------------------------------------------- #
# Styling
# --------------------------------------------------------------------------- #
st.markdown(
    """
    <style>
      .label-card {border: 2px solid #1f6f5c; border-radius: 10px; padding: 18px 22px;
                   background: #f4fbf8; font-size: 1.15rem; line-height: 1.5; color: #12302a;}
      .label-card small {color: #4b6b63; font-size: 0.8rem; text-transform: uppercase;
                         letter-spacing: .06em;}
      .blocked-card {border: 2px dashed #b54708; border-radius: 10px; padding: 18px 22px;
                     background: #fff8f0; font-size: 1.05rem; line-height: 1.5; color: #4a2a0a;}
      .blocked-card small {color: #b54708; font-size: 0.8rem; text-transform: uppercase;
                           letter-spacing: .06em;}
      .pill {display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: .8rem;
             font-weight: 600; margin-right: 6px;}
      .pill-model {background: #fde7d9; color: #9a3412;}
      .pill-rule {background: #e0e7ff; color: #3730a3;}
    </style>
    """,
    unsafe_allow_html=True,
)

# --------------------------------------------------------------------------- #
# Model loading (cached for the whole session)
# --------------------------------------------------------------------------- #


@st.cache_resource(show_spinner="Loading the fine-tuned model...")
def load_translator(model_dir: str):
    return se.SigTranslator(model_dir)


if "history" not in st.session_state:
    st.session_state.history = []
if "sig_input" not in st.session_state:
    st.session_state.sig_input = "1-2 tabs PO q4-6h PRN pain, max 8/day"

# --------------------------------------------------------------------------- #
# Sidebar
# --------------------------------------------------------------------------- #
with st.sidebar:
    st.header("Model")
    model_dir = st.text_input("Model folder", value=se.DEFAULT_MODEL_DIR,
                              help="Folder saved by the fine-tuning notebook.")
    try:
        translator = load_translator(model_dir)
        st.success("Fine-tuned model loaded")
        st.caption(
            f"**{os.path.basename(os.path.normpath(model_dir))}**  \n"
            f"{translator.n_params / 1e6:.0f}M parameters | {translator.device.upper()} | "
            f"{translator.dtype}"
        )
    except Exception as exc:  # noqa: BLE001 - show any load problem to the user
        translator = None
        st.error(f"Could not load the model.\n\n{exc}")

    st.divider()
    st.header("Try an example")
    for group, sigs in EXAMPLES.items():
        with st.expander(group, expanded=(group == "Error-prone")):
            for s in sigs:
                if st.button(s, key=f"ex_{s}", width="stretch"):
                    st.session_state.sig_input = s

    st.divider()
    use_rules = st.toggle("Rule-based safety checks", value=True,
                          help="Scans the raw sig for ISMP / Joint Commission error-prone "
                               "abbreviations, and checks the label for a body site or route the "
                               "sig never implied. Either one forces review even if the model "
                               "did not flag.")
    show_raw = st.toggle("Show raw model output", value=False)

# --------------------------------------------------------------------------- #
# Header
# --------------------------------------------------------------------------- #
st.title("💊 Prescription Sig Translator")
st.caption(
    "Fully fine-tuned Qwen2.5-0.5B-Instruct | translates a sig into a patient label and "
    "flags error-prone sigs for the pharmacist | runs locally, no PHI leaves the machine"
)

tab_one, tab_batch, tab_about = st.tabs(["Translate a sig", "Batch queue", "About the model"])


def effective(result: se.SigResult) -> se.SigResult:
    """Drop rule flags when the user has switched the rule check off."""
    return dataclasses.replace(result, rule_flags=[], consistency=[]) if not use_rules else result


def render_flags(result: se.SigResult):
    for f in result.model_flags:
        st.markdown(
            f"<span class='pill pill-model'>MODEL</span> **{f.get('abbreviation', '?')}** "
            f"- {f.get('reason', '')}", unsafe_allow_html=True)
    for f in result.rule_flags:
        st.markdown(
            f"<span class='pill pill-rule'>RULE CHECK</span> **{f['abbreviation']}** "
            f"(matched `{f['matched']}`) - {f['reason']}", unsafe_allow_html=True)
    for msg in result.consistency:
        st.markdown(f"<span class='pill pill-rule'>CONSISTENCY</span> {msg} The model may have "
                    "invented this; check it against the original sig.", unsafe_allow_html=True)
    if (result.rule_flags or result.consistency) and not result.model_flagged and result.valid:
        st.caption("The model did not flag this sig. The safety checks caught it, so the label "
                   "is still held for review.")


# --------------------------------------------------------------------------- #
# Tab 1: single sig
# --------------------------------------------------------------------------- #
with tab_one:
    col_in, col_btn = st.columns([5, 1])
    with col_in:
        sig = st.text_input("Prescription sig", key="sig_input",
                            placeholder="e.g. 1 tab po bid x10d", label_visibility="collapsed")
    with col_btn:
        go = st.button("Translate", type="primary", width="stretch",
                       disabled=translator is None)

    if go and sig.strip():
        with st.spinner("Translating..."):
            st.session_state.last = translator.translate([sig.strip()])[0]

    res = st.session_state.get("last")
    if res is not None:
        res = effective(res)
        left, right = st.columns([3, 2], gap="large")

        with left:
            if not res.valid:
                st.error("The model's reply was not valid JSON for the label schema. "
                         "Nothing can be printed; enter the label manually.")
            elif res.needs_review:
                st.warning(f"**Pharmacist review required** - {res.status}")
                st.markdown(
                    "<div class='blocked-card'><small>Best reading - not for printing</small><br>"
                    f"{res.label['patient_instruction']}</div>", unsafe_allow_html=True)
                st.subheader("Why it was flagged")
                render_flags(res)
            else:
                st.success("No flags - ready for pharmacist verification")
                st.markdown(
                    "<div class='label-card'><small>Patient label</small><br>"
                    f"{res.label['patient_instruction']}</div>", unsafe_allow_html=True)

            b1, b2, _ = st.columns([1, 1, 2])
            with b1:
                if st.button("Mark verified", disabled=res.needs_review,
                             help="Only available when nothing is flagged."):
                    st.session_state.history.append(
                        {"time": datetime.now().strftime("%H:%M:%S"), **res.to_row(),
                         "decision": "verified"})
                    st.toast("Added to the verified log")
            with b2:
                if st.button("Send to pharmacist", disabled=not res.needs_review):
                    st.session_state.history.append(
                        {"time": datetime.now().strftime("%H:%M:%S"), **res.to_row(),
                         "decision": "sent for review"})
                    st.toast("Queued for pharmacist review")

        with right:
            st.subheader("Sig breakdown")
            if res.valid:
                rows = []
                for key, name in se.FIELD_LABELS.items():
                    v = res.label.get(key)
                    if isinstance(v, bool):
                        v = "Yes" if v else "No"
                    rows.append({"Field": name, "Value": "-" if v in (None, "") else str(v)})
                st.dataframe(pd.DataFrame(rows), hide_index=True, width="stretch")
            st.caption(f"Input: `{res.sig}` | {res.seconds:.2f} s")

        if show_raw:
            with st.expander("Raw model output", expanded=True):
                st.code(res.raw, language="json")

    if st.session_state.history:
        st.divider()
        st.subheader("Session log")
        log = pd.DataFrame(st.session_state.history)
        st.dataframe(log[["time", "sig", "decision", "status", "patient_instruction"]],
                     hide_index=True, width="stretch")

# --------------------------------------------------------------------------- #
# Tab 2: batch queue
# --------------------------------------------------------------------------- #
with tab_batch:
    st.write("Paste one sig per line, or upload a CSV with a `sig` column. Each sig is "
             "translated and sorted into **ready** or **needs review**.")
    default_batch = "\n".join(EXAMPLES["Routine"][:2] + EXAMPLES["Complex"][:2] +
                              EXAMPLES["Error-prone"][:3] + ["1 TAB PO QD"])
    text = st.text_area("Sigs", value=default_batch, height=200)
    upload = st.file_uploader("...or upload a CSV", type=["csv"])

    if st.button("Run batch", type="primary", disabled=translator is None):
        if upload is not None:
            sigs = pd.read_csv(upload)["sig"].dropna().astype(str).tolist()
        else:
            sigs = [s.strip() for s in text.splitlines() if s.strip()]
        prog = st.progress(0.0, text="Translating...")
        results = []
        for i in range(0, len(sigs), 8):
            results += translator.translate(sigs[i:i + 8])
            prog.progress(min(1.0, (i + 8) / len(sigs)), text=f"{min(i + 8, len(sigs))}/{len(sigs)}")
        prog.empty()
        st.session_state.batch = results

    batch = st.session_state.get("batch")
    if batch:
        batch = [effective(r) for r in batch]
        df = pd.DataFrame([r.to_row() for r in batch])
        n_rev = sum(r.needs_review for r in batch)
        n_rule_only = sum(bool(r.rule_flags or r.consistency) and not r.model_flagged and r.valid
                          for r in batch)
        m1, m2, m3, m4 = st.columns(4)
        m1.metric("Sigs", len(batch))
        m2.metric("Ready for verification", len(batch) - n_rev)
        m3.metric("Needs pharmacist review", n_rev)
        m4.metric("Caught only by safety checks", n_rule_only)

        def color(row):
            c = "#fff4e5" if row.status != "Ready for verification" else "#eefaf4"
            return [f"background-color: {c}"] * len(row)

        show = df[["sig", "status", "patient_instruction", "model_flags", "rule_flags", "consistency",
                   "seconds"]]
        st.dataframe(show.style.apply(color, axis=1), hide_index=True, width="stretch")
        buf = io.StringIO()
        df.to_csv(buf, index=False)
        st.download_button("Download results (CSV)", buf.getvalue(), "sig_batch_results.csv",
                           "text/csv")

# --------------------------------------------------------------------------- #
# Tab 3: about
# --------------------------------------------------------------------------- #
with tab_about:
    st.subheader("What this app does")
    st.markdown(
        """
- **Input:** one raw sig, with no drug name, strength, or patient information.
- **Model:** Qwen2.5-0.5B-Instruct, **fully fine-tuned** (all 494M parameters, no LoRA) on
  845 sigs built from real MIMIC-IV demo orders (676 train / 84 validation / 85 test).
- **Output:** a 12-field JSON label - the breakdown, a plain-English patient sentence, and a
  list of flags for anything the pharmacist must confirm.
- **Safety layers:** (1) the model's own learned flags, (2) schema validation, so a broken
  reply never becomes a label, (3) a rule-based scan for ISMP / Joint Commission
  error-prone abbreviations, and (4) a consistency check for a body site or route the sig
  never implied. Any one of them holds the label for review.
        """
    )
    st.subheader("Evaluation results")
    st.dataframe(M3_RESULTS, hide_index=True, width="stretch")
    st.caption(
        "Critical error = a confidently wrong label (a safe sig mistranslated, or an error-prone "
        "sig translated without a flag). The rule check was added to the app because the "
        "remaining model errors were missed flags, mostly uppercase QD."
    )
    st.subheader("Limitations")
    st.markdown(
        """
- Training data comes from a hospital database of 100 patients, so inhalers, eye drops and
  topical sigs are under-represented.
- The model can write a plausible but invented flag *reason*; the flag itself is what matters.
- This is a drafting and flagging tool. A pharmacist verifies every label.
        """
    )
