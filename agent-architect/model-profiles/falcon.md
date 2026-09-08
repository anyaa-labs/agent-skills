---
family: falcon
access: open-weight
scope: regional
researched_date: 2026-09-08
---

# Falcon / TII (UAE)

**Regional note:** Falcon is a UAE sovereign-research program (Technology Innovation Institute) publishing open weights with no vendor-hosted inference. No data-residency or sovereign-cloud claim appears on any TII page reached — residency for a Falcon deployment is entirely a function of where the deployer chooses to self-host.

### Current models

- `tiiuae/Falcon-H1R-7B` — reasoning model built on `tiiuae/Falcon-H1-7B-Base`; also `-FP8` and `-GGUF`.
- `tiiuae/Falcon-H1-34B-Instruct` and family — Falcon-H1 at 0.5B, 1.5B, 1.5B-Deep, 3B, 7B, 34B, each in Base and Instruct. Hybrid Transformer + Mamba (SSM) architecture.
- `tiiuae/Falcon-Perception` (0.6B) and `tiiuae/Falcon-Perception-300M` — open-vocabulary grounding and instance segmentation (vision-language, mask generation).
- `tiiuae/Falcon-OCR` (0.3B) — image-to-text.
- Named on the vendor model page but with model cards returning HTTP 401 in this research pass: Falcon-H1-Arabic (vendor site says 3B / 7B / 34B), Falcon Arabic, Falcon-H1-Tiny-R (0.6B, 0.09B), Falcon-E (edge), Falcon 3, Falcon Mamba 7B, Falcon 2 11B, Falcon 40B, Falcon 180B. Treat these as named-but-unverified; do not source claims about them from anywhere but a fetchable card.

### API surface

**No TII-operated inference API is documented.** The vendor site offers demo UIs only (`chat.falconllm.tii.ae`, `vision.falcon.aidrc.tii.ae`). Everything else is self-serve weights served through your own stack (transformers, vLLM, SGLang; GGUF / llama.cpp / Ollama for quantized local runs). There is no Falcon-branded managed API surface to route to — a harness must own the serving layer.

### Reasoning state

Falcon-H1R-7B emits reasoning in `<think>...</think>` blocks. No reasoning-echo requirement (passing prior reasoning state back on subsequent turns) is documented — treat as an open question, not a confirmed absence.

### Tool semantics

**Function calling is supported via vLLM's `--enable-auto-tool-choice`** for Falcon-H1R-7B — this is a property of the serving stack the deployer chooses, not a TII-hosted API contract. No tool-calling documentation exists for the base Falcon-H1 instruct line, Falcon-Perception, or Falcon-OCR.

### Modality support

- Falcon-H1 / H1R and the base instruct line: text only.
- Falcon-Perception: multimodal (image + text → masks/coordinates), max 2,048 decode tokens.
- Falcon-OCR: image-to-text.
- **Language & script coverage — capability boundary, treat precisely:**
  - **Falcon-H1 (including H1R): 18 languages, named exactly** — Arabic, Czech, German, English, Spanish, French, Hindi, Italian, Japanese, Korean, Dutch, Polish, Portuguese, Romanian, Russian, Swedish, Urdu, Chinese. The card adds these are "scalable to 100+," but only the 18 are the trained core — **treat the 18 as the capability boundary**, not the "100+" marketing claim.
  - Scripts implied by that 18-language list span Latin, Arabic (Arabic + Urdu), Devanagari (Hindi), Cyrillic (Russian), Han (Chinese), Japanese kana/kanji, and Hangul — but **TII does not state script coverage explicitly**, and per-script quality is not documented.
  - Falcon 40B (older generation, card access limited): English, German, Spanish, French, Italian, Portuguese, Polish, Dutch, Romanian, Czech, Swedish — no Arabic.
  - Falcon-H1-Arabic / Falcon Arabic are described on the vendor site as covering Modern Standard Arabic plus regional dialects (code-switching), but the exact dialect list and code-switching behavior live on TII's HF blog posts rather than a fetchable model card in this pass — **the dialect and code-switching breakdown is not verified here**.
  - `tiiuae/Falcon-Perception` documents English only.

### Context behavior

Falcon-H1R-7B: **262,144-token** max model length as configured for vLLM. Context length is **not stated** on the Falcon-H1-34B-Instruct card. Falcon-Perception: max 2,048 decode tokens.

### Structured output path

Not documented. No `json_schema`, `json_object`, or grammar/constrained-decoding path is stated on any Falcon page reached — this is a property the deployer's own serving stack (e.g. vLLM guided decoding) would have to supply, not something TII documents as part of the model contract.

### Deployment & residency

- Open weights, self-host only. **No hosted inference, no data-residency claim, and no sovereign-cloud claim appear on any TII page reached** — residency is entirely the deployer's choice of where to run the self-hosted weights.
- **Two distinct licenses are in play and the difference matters for a compliance review:**
  - `Falcon-H1` / `Falcon-H1R`: **"Falcon-LLM License"** (terms at `falconllm.tii.ae/falcon-terms-and-conditions.html`). **This is not an OSI open-source license** — it is Apache-2.0-derived with an Acceptable Use Policy, attribution requirements, a professional-advice-use prohibition, and (for Falcon 180B) a "Hosting Use" restriction barring shared instances or managed services without written TII permission.
  - `tiiuae/Falcon-Perception`: **Apache 2.0**. Falcon 7B is also Apache 2.0 per the vendor model page.
- Reasoning parser note for self-hosters: Falcon-H1R-7B uses the **`deepseek_r1` reasoning parser** in vLLM/SGLang — not a Falcon-named parser; guessing a Falcon-branded parser name will misparse the `<think>` blocks.

### Known production failure modes

- Assuming the "scalable to 100+" languages claim on the Falcon-H1 card means production-quality coverage beyond the 18 named languages — it does not; the 18 are the trained core.
- Guessing a Falcon-named vLLM reasoning parser for Falcon-H1R-7B instead of `deepseek_r1` — produces malformed reasoning-block parsing, not an error.
- Treating the "Falcon-LLM License" as OSI-open (e.g. for a hosted-service offering) — it carries an Acceptable Use Policy and, for Falcon 180B, an explicit "Hosting Use" restriction requiring written TII permission for shared/managed-service deployment.
- Relying on Falcon-H1-Arabic / Falcon Arabic dialect or code-switching behavior without independent validation — the dialect list is not documented on a fetchable card in this pass.
- Assuming any managed, TII-hosted inference endpoint exists — none is documented; only self-hosting and demo chat UIs are.

### Harness requirements

- Own the full serving stack (vLLM/SGLang/transformers) since no vendor-hosted inference exists; pin the `deepseek_r1` reasoning parser and `--enable-auto-tool-choice` for Falcon-H1R-7B tool calling.
- Detect the target language against the 18-language Falcon-H1 list before routing; do not assume the "100+" marketing figure reflects evaluated capability.
- Confirm which license applies (Falcon-LLM License vs. Apache 2.0) before offering a Falcon deployment as a hosted/shared service — the Falcon-LLM License's Hosting Use restriction can block that use case without a separate TII agreement.
- Do not assume a structured-output path exists; supply constrained decoding at the serving-stack layer if the harness requires schema-valid output.

### Retired / migration targets

**Not publicly documented as of 2026-09-08.** TII's model page lists older generations (Falcon 180B, 40B, Falcon 2, Falcon 3, Falcon Mamba) alongside current ones without deprecation labels or stated replacements.

### Re-evaluate when

- A TII-operated hosted inference API is announced — this would be a first for the family and change the Deployment & residency and API surface sections above.
- The Falcon-H1-Arabic / Falcon Arabic model cards become fetchable (currently HTTP 401) — dialect and code-switching claims should be sourced from there directly rather than the vendor blog.
- A data-residency or sovereign-cloud statement appears on any TII page — none exists today.

### Primary sources

- [Falcon LLM](https://falconllm.tii.ae/)
- [Falcon models](https://falconllm.tii.ae/falcon-models.html)
- [Falcon terms and conditions](https://falconllm.tii.ae/falcon-terms-and-conditions.html)
- [TII HuggingFace org](https://huggingface.co/tiiuae)
- [Falcon-H1-34B-Instruct](https://huggingface.co/tiiuae/Falcon-H1-34B-Instruct)
- [Falcon-H1R-7B](https://huggingface.co/tiiuae/Falcon-H1R-7B)
- [Falcon-Perception](https://huggingface.co/tiiuae/Falcon-Perception)

### Sourcing gap carried forward

Falcon-H1-Arabic, Falcon Arabic, Falcon-H1-Tiny-R, Falcon-E, Falcon 3, Falcon Mamba 7B, Falcon 2 11B, Falcon 40B, and Falcon 180B model cards returned HTTP 401 in this pass — named on the vendor model page but unverified beyond that naming. No deprecation table exists for any Falcon generation. No context length is stated for Falcon-H1-34B-Instruct. Arabic dialect and code-switching coverage for Falcon-H1-Arabic is not traceable to a fetchable model card.
