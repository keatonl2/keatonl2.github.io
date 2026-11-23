"""
sig_engine.py - model loading, inference, schema validation, and the rule-based
safety check for the prescription sig translator.

Kept separate from app.py so the logic can be tested without Streamlit.

Pipeline for one sig:
  1. The fine-tuned Qwen2.5-0.5B-Instruct model writes the 12-field JSON label
     (greedy decoding, same one-sentence system prompt used in training).
  2. parse_label() checks the reply against the 12-field label schema. A reply that
     does not parse is treated as "needs review", never as a label.
  3. rule_check() scans the raw sig for ISMP / Joint Commission error-prone
     abbreviations. The fine-tuning evaluation showed the model can miss some (uppercase QD),
     so any hit forces pharmacist review even if the model did not flag it.
  4. consistency_issues() catches labels that name a body site or route the sig
     never implied (the "PO sig became an eye drop" error found in evaluation).
  5. SigResult combines them: a label is only shown as ready when the output is
     valid AND no check raised anything.
"""

from __future__ import annotations

import json
import os
import re
import time
from dataclasses import dataclass, field

# --------------------------------------------------------------------------- #
# Constants carried over from the prompting study and fine-tuning notebook
# --------------------------------------------------------------------------- #

DEFAULT_MODEL_DIR = os.environ.get(
    "SIG_MODEL_DIR",
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "sig_translator_qwen05b_full_ft"),
)

# The fine-tuned model was trained with only this short prompt (see the fine-tuning notebook).
TRAIN_SYSTEM = (
    "Translate the prescription sig into the JSON label format. "
    "Flag anything a pharmacist must confirm."
)

FIELDS = [
    "dose", "dose_form", "route", "frequency", "as_needed", "indication", "duration",
    "max_daily", "additional_instructions", "patient_instruction", "flags",
    "needs_pharmacist_review",
]

FIELD_LABELS = {
    "dose": "Dose",
    "dose_form": "Dose form",
    "route": "Route",
    "frequency": "Frequency",
    "as_needed": "As needed (PRN)",
    "indication": "Indication",
    "duration": "Duration",
    "max_daily": "Maximum daily amount",
    "additional_instructions": "Additional instructions",
}

# --------------------------------------------------------------------------- #
# Schema validation (same rules as the fine-tuning notebook)
# --------------------------------------------------------------------------- #


def parse_label(text: str | None) -> dict | None:
    """Pull the JSON object out of a reply and check it against the schema.

    Returns the dict, or None if the reply is not valid JSON, is missing a field,
    or uses the wrong type for a field.
    """
    text = re.sub(r"```(?:json)?", "", text or "")
    start, end = text.find("{"), text.rfind("}")
    if start == -1 or end <= start:
        return None
    try:
        obj = json.loads(text[start:end + 1])
    except json.JSONDecodeError:
        return None
    if not isinstance(obj, dict) or set(FIELDS) - set(obj):
        return None
    if not isinstance(obj["patient_instruction"], str) or not isinstance(obj["flags"], list):
        return None
    if not isinstance(obj["as_needed"], bool) or not isinstance(obj["needs_pharmacist_review"], bool):
        return None
    for f in obj["flags"]:
        if not isinstance(f, dict):
            return None
    return obj


# --------------------------------------------------------------------------- #
# Rule-based safety check (defense in depth)
# --------------------------------------------------------------------------- #
# Each rule: (name, compiled regex, reason). Reasons are written to name the real
# list entry, because evaluation found the model sometimes invents flag reasons.

_I = re.IGNORECASE
RULES = [
    ("QD", re.compile(r"(?<![a-z])q\.?\s?d\.?(?![a-z])", _I),
     "QD (daily) is on The Joint Commission \"Do Not Use\" list; it can be misread as "
     "QID (four times daily). Confirm the intended frequency."),
    ("QOD", re.compile(r"(?<![a-z])q\.?\s?o\.?\s?d\.?(?![a-z])", _I),
     "QOD (every other day) is on The Joint Commission \"Do Not Use\" list; it can be "
     "misread as QD or QID. Confirm the intended frequency."),
    ("U", re.compile(r"\d\s*u\b\.?(?!nit)", _I),
     "U for units is on The Joint Commission \"Do Not Use\" list; it can be misread as "
     "0 or 4 (10 U read as 100). Confirm the dose in units."),
    ("IU", re.compile(r"(?<![a-z])i\.?u\.?(?![a-z])", _I),
     "IU is on The Joint Commission \"Do Not Use\" list; it can be misread as IV or 10. "
     "Confirm the dose in units."),
    ("SC/SQ/sub q", re.compile(r"(?<![a-z])(s\.?c\.?|s\.?q\.?|sub\s?q)(?![a-z])", _I),
     "SC, SQ and sub q are on the ISMP error-prone list; the q can be misread as "
     "\"every\". Confirm the route (subcutaneous)."),
    ("OD/OS/OU", re.compile(r"(?<![a-z])(o\.?d|o\.?s|o\.?u)\.?(?![a-z])", _I),
     "OD, OS and OU (right, left, both eyes) are on the ISMP error-prone list; they are "
     "confused with each other and OD with \"once daily\". Confirm which eye."),
    # Ear abbreviations: only uppercase or dotted, so "as needed" is not matched.
    ("AD/AS/AU", re.compile(r"(?<![A-Za-z])(AD|AS|AU|[aA]\.[dsuDSU]\.)(?![A-Za-z])(?!\s+(DIRECTED|NEEDED|LIB|TOLERATED|SOON)\b)"),
     "AD, AS and AU (right, left, both ears) are on the ISMP error-prone list; they are "
     "confused with each other and with eye abbreviations. Confirm which ear."),
    ("TIW", re.compile(r"(?<![a-z])t\.?\s?i\.?\s?w\.?(?![a-z])", _I),
     "TIW (three times a week) is on the ISMP error-prone list; it can be misread as "
     "three times a day or twice a week. Confirm the intended frequency."),
    ("cc", re.compile(r"(?<![a-z])c\.?c\.?(?![a-z])", _I),
     "cc is on the ISMP error-prone list; it can be misread as U (units). "
     "Confirm the volume in mL."),
    ("D/C", re.compile(r"(?<![a-z])d\s?/\s?c(?![a-z])", _I),
     "D/C is on the ISMP error-prone list; it can mean discharge or discontinue. "
     "Confirm the intent."),
    ("trailing zero", re.compile(r"(?<![\d.])\d+\.0+(?!\d)"),
     "A trailing zero (e.g., 1.0 mg) is on The Joint Commission \"Do Not Use\" list; the "
     "decimal can be missed and the dose read as 10 times larger. Confirm the dose."),
    ("leading zero", re.compile(r"(?<![\d.])\.\d"),
     "A missing leading zero (e.g., .5 mg) is on The Joint Commission \"Do Not Use\" list; "
     "the decimal can be missed and the dose read as 10 times larger. Confirm the dose."),
]


def rule_check(sig: str) -> list[dict]:
    """Return a flag dict for every error-prone abbreviation found in the raw sig."""
    hits = []
    for name, rx, reason in RULES:
        m = rx.search(sig or "")
        if m:
            hits.append({"abbreviation": name, "matched": m.group(0).strip(), "reason": reason})
    # QOD also matches nothing in the QD rule because of the letter guard, but a
    # dotted "q.o.d." could hit both; keep only QOD in that case.
    names = {h["abbreviation"] for h in hits}
    if "QOD" in names and "QD" in names:
        hits = [h for h in hits if h["abbreviation"] != "QD"]
    return hits


# --------------------------------------------------------------------------- #
# Consistency check (from the first draft of the app)
# --------------------------------------------------------------------------- #
# Evaluation found the model turning "1 PO BID PRN x10d" into an eye drop. This
# check catches output that names a body site or route the sig never implied.

def consistency_issues(sig: str, label: dict | None) -> list[str]:
    if not label:
        return []
    text = f"{label.get('patient_instruction') or ''} {label.get('route') or ''}"
    low = (sig or "").lower()
    issues = []
    if re.search(r"\b(eyes?|ears?|drops?)\b", text, re.I) and not re.search(
            r"eye|ear|gtt|drop|ophth|otic|ocul|\b(o\.?[dsu]|a\.?[dsu])\b", low):
        issues.append("The label mentions eyes, ears or drops, but the sig does not.")
    if re.search(r"under the skin|inject", text, re.I) and not re.search(
            r"inject|subq|subcut|\bsq\b|\bsc\b|\bim\b|\biv\b|\bunits?\b|\d\s*u\b", low):
        issues.append("The label mentions an injection, but the sig does not.")
    if re.search(r"under the tongue", text, re.I) and not re.search(r"\bsl\b|sublingual|tongue", low):
        issues.append("The label says under the tongue, but the sig does not.")
    if re.search(r"rectal", text, re.I) and not re.search(r"\bpr\b|rect|supp", low):
        issues.append("The label says rectally, but the sig does not.")
    return issues


# --------------------------------------------------------------------------- #
# Decision logic
# --------------------------------------------------------------------------- #

@dataclass
class SigResult:
    sig: str
    raw: str
    label: dict | None
    model_flags: list = field(default_factory=list)
    rule_flags: list = field(default_factory=list)
    consistency: list = field(default_factory=list)
    seconds: float = 0.0

    @property
    def valid(self) -> bool:
        return self.label is not None

    @property
    def model_flagged(self) -> bool:
        return bool(self.label) and (bool(self.label["flags"]) or self.label["needs_pharmacist_review"])

    @property
    def needs_review(self) -> bool:
        return (not self.valid) or self.model_flagged or bool(self.rule_flags) or bool(self.consistency)

    @property
    def status(self) -> str:
        if not self.valid:
            return "Invalid output - review"
        if self.model_flagged and self.rule_flags:
            return "Flagged (model + rule check)"
        if self.model_flagged:
            return "Flagged (model)"
        if self.rule_flags:
            return "Flagged (rule check only)"
        if self.consistency:
            return "Flagged (consistency check)"
        return "Ready for verification"

    def to_row(self) -> dict:
        lab = self.label or {}
        flags = [f"{f.get('abbreviation', '')}" for f in (lab.get("flags") or [])]
        return {
            "sig": self.sig,
            "status": self.status,
            "patient_instruction": lab.get("patient_instruction", ""),
            "model_flags": "; ".join(flags),
            "rule_flags": "; ".join(h["abbreviation"] for h in self.rule_flags),
            "consistency": "; ".join(self.consistency),
            **{k: lab.get(k) for k in FIELD_LABELS},
            "seconds": round(self.seconds, 2),
        }


# --------------------------------------------------------------------------- #
# Model
# --------------------------------------------------------------------------- #

class SigTranslator:
    """Wraps the fine-tuned model. Heavy imports happen here so the rest of the
    module can be imported (and tested) without torch installed."""

    def __init__(self, model_dir: str = DEFAULT_MODEL_DIR, device: str | None = None):
        import torch
        from transformers import AutoModelForCausalLM, AutoTokenizer

        if not os.path.isdir(model_dir):
            raise FileNotFoundError(
                f"Model folder not found: {os.path.abspath(model_dir)}. Set SIG_MODEL_DIR "
                "or put sig_translator_qwen05b_full_ft next to app.py."
            )
        self.torch = torch
        self.model_dir = model_dir
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        if self.device == "cuda":
            dtype = torch.bfloat16 if torch.cuda.is_bf16_supported() else torch.float16
        else:
            dtype = torch.float32
        self.dtype = str(dtype).replace("torch.", "")
        self.tok = AutoTokenizer.from_pretrained(model_dir)
        self.tok.padding_side = "left"
        if self.tok.pad_token is None:
            self.tok.pad_token = self.tok.eos_token
        self.model = AutoModelForCausalLM.from_pretrained(model_dir, dtype=dtype)
        self.model.to(self.device).eval()
        self.n_params = sum(p.numel() for p in self.model.parameters())

    def _prompt(self, sig: str) -> str:
        msgs = [{"role": "system", "content": TRAIN_SYSTEM},
                {"role": "user", "content": sig.strip()}]
        return self.tok.apply_chat_template(msgs, tokenize=False, add_generation_prompt=True)

    def generate(self, sigs: list[str], max_new_tokens: int = 320) -> list[str]:
        """Greedy decoding, batched, exactly as in the notebook evaluation."""
        prompts = [self._prompt(s) for s in sigs]
        enc = self.tok(prompts, return_tensors="pt", padding=True).to(self.device)
        with self.torch.inference_mode():
            out = self.model.generate(
                **enc, max_new_tokens=max_new_tokens, do_sample=False,
                pad_token_id=self.tok.pad_token_id,
            )
        new = out[:, enc["input_ids"].shape[1]:]
        return [self.tok.decode(t, skip_special_tokens=True).strip() for t in new]

    def translate(self, sigs: list[str], batch_size: int = 8) -> list[SigResult]:
        results = []
        for i in range(0, len(sigs), batch_size):
            chunk = sigs[i:i + batch_size]
            t0 = time.time()
            raws = self.generate(chunk)
            per = (time.time() - t0) / len(chunk)
            for sig, raw in zip(chunk, raws):
                results.append(build_result(sig, raw, per))
        return results


def build_result(sig: str, raw: str, seconds: float = 0.0) -> SigResult:
    label = parse_label(raw)
    return SigResult(
        sig=sig, raw=raw, label=label,
        model_flags=(label or {}).get("flags", []) if label else [],
        rule_flags=rule_check(sig), consistency=consistency_issues(sig, label), seconds=seconds,
    )
