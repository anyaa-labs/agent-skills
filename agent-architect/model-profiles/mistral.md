---
family: mistral
access: open-weight
scope: global
researched_date: 2026-09-08
---

# Mistral

**Sourcing status: partial, and this profile should not be treated as load-bearing for exact model IDs.** Two Mistral documentation pages gave conflicting API model-ID conventions for the same model — one rendered `mistral-medium-3505`, the other `mistral-medium-3.5-26.04` — and only one ID in the entire current lineup could be independently confirmed: **`mistral-large-2512`** (Mistral Large 3). **This profile deliberately writes no other Mistral API model ID.** Anyone needing to call a Mistral model by ID other than Large 3 must re-verify against the live API reference first; treat every other model name below as a product/family name, not a confirmed API identifier. **Mistral needs a dedicated re-verification pass before this profile is fully load-bearing for ID-level harness routing.**

### Current models

Named by product line, not by unverified API ID (see caveat above):

- **Mistral Medium 3.5** — frontier-class, agentic/coding focus. License: Modified MIT. API-only tier; an open-weight repo exists on Mistral's HF org.
- **Mistral Large 3** — the one confirmed API ID: **`mistral-large-2512`**. 256K context, Apache-2.0, open weights, MoE 41B active / 675B total, released 2025-12-02.
- **Mistral Small 4** — hybrid model unifying instruct, reasoning, and coding. Apache-2.0.
- **Ministral 3** — 14B / 8B / 3B variants, all Apache-2.0, text + vision.
- **Z.ai GLM 5.2** — served on Mistral's own platform as a third-party open-source text model, 1M-token context.
- Specialized: **OCR 4.1** (document layout/bounding boxes), **Codestral** and **Codestral Embed**, **Mistral Embed**, **Voxtral TTS** (zero-shot voice cloning — **CC BY-NC 4.0, non-commercial**, unlike the rest of the line), **Voxtral Mini Transcribe 2**, **Voxtral Mini Transcribe Realtime** (Apache-2.0), **Shieldstral 1.0** (multimodal moderation, Apache-2.0), **Mistral Moderation 2** (128K, jailbreak detection), **Leanstral 1.5** (Lean 4 formal-proof agent, Apache-2.0).

**License varies per model, not per family** — Modified MIT, Apache-2.0, and CC BY-NC 4.0 (non-commercial) all appear in the current lineup. Check the specific model before assuming permissive licensing.

### API surface

- Function calling and structured output are documented across the lineup, including Mistral Large 3, Devstral, Magistral, and Ministral 3. Mistral Large 3 specifically supports structured outputs, function calling, document QnA, chat completions, batching, and the agent/conversation APIs.

### Reasoning state

- No persistent or hidden reasoning state is vendor-documented for the current lineup. Treat as short-chain unless the exact model and provider evals prove long-chain stability.
- **Whether Mistral Small 4's hybrid reasoning mode has an explicit toggle (request parameter vs. prompt) is not verified** — the model-card URL 404'd during research. Do not assume a specific toggle mechanism without checking the live docs first.

### Tool semantics

- A `tools` array of JSON-schema function specs, each requiring `type: "function"` plus `function.name`, `function.description`, `function.parameters` (with `required`).
- `tool_choice`: `"auto"` (default) / `"any"` (forces a tool) / `"none"`. `parallel_tool_calls`: `true` (default, model decides) / `false` (forces sequential).
- JSON mode still needs an explicit prompt instruction to reliably produce JSON — do not assume implicit compliance from `response_format` alone.

### Modality support

- The generalist line (Medium 3.5, Large 3, Small 4, Ministral 3) is multimodal text + vision. Specialized models are modality-specific: OCR 4.1 (documents), Voxtral (audio/TTS), Embed (embeddings). Do not infer multimodal support from the family name alone — check the specific model.

### Context behavior

- The only context figure independently confirmed for the current lineup is Mistral Large 3's **256K**. Treat other models' context windows as unverified until checked against the live model card.

### Structured output path

- Use JSON mode or function calling, plus an explicit "output JSON" / format instruction in the prompt — Mistral's own function-calling schema does not guarantee compliance without it.

### Deployment & residency

- **Self-hosting gap: Mistral's own vLLM page documents only `--tokenizer_mode mistral`, `--config_format mistral`, and `--load_format mistral`, illustrated with Mistral NeMo, Mistral Small, and Pixtral-12B — examples that are stale relative to the current lineup.** Mistral does **not** document a `--tool-call-parser` flag on its own vLLM page at all. vLLM's own (not Mistral-owned) docs describe a `mistral` tool parser requiring `--enable-auto-tool-choice --tool-call-parser mistral`, but that guidance comes from vLLM, not Mistral. **Self-hosting Mistral with working tool calls almost certainly requires a parser flag Mistral itself does not document** — budget for third-party/community verification before relying on it in production.
- **Zero Data Retention (ZDR)** is available on paid plans for **stateless endpoints only**: `/v1/chat/completions`, `/v1/fim/completions`, `/v1/embeddings`, `/v1/moderations`, `/v1/chat/moderations`, `/v1/classifications`, `/v1/chat/classifications`, `/v1/ocr`, `/v1/audio/speech`, `/v1/audio/transcriptions`. It applies across models except Labs models. **ZDR does not apply to Agents, Batch, Conversations, Libraries, the Files API, Vibe Work, or Chat.** This is the load-bearing constraint for any residency- or retention-sensitive deployment: the moment an agent harness uses Mistral's agent or stateful surface, ZDR is off, even if it's on for the plain chat-completions calls elsewhere in the same system.
- **EU hosting**: Mistral's Help Center states EU-default hosting with GDPR Art. 46 safeguards for transfers — but the dedicated ZDR docs page itself makes no geographic claim. Treat the EU-default claim as Help-Center-sourced, not API-reference-sourced, and re-verify before using it as a compliance guarantee.
- For a residency-constrained deployment, self-hosting the Apache-2.0 models (Large 3, Small 4, Ministral 3) is the only path that avoids the ZDR/stateful-surface gap entirely — but see the vLLM tool-parser gap above before assuming that path is turnkey.

### Known production failure modes

- Implicit JSON-mode assumptions producing non-conformant output.
- Limited self-correction in long tool loops.
- Using fast-worker-tier models for reviewer/planner roles they were not evaluated for.
- Self-hosting via vLLM without a working tool-call parser, because Mistral's own docs stop short of the flag that makes tool calls parse correctly.
- Assuming ZDR coverage extends to an agent/conversation/batch workflow when it is explicitly excluded.

### Harness requirements

- Keep sessions short and validate output externally regardless of structured-output mode.
- Include explicit output-format instructions even when JSON mode is requested.
- Re-verify any Mistral model ID beyond `mistral-large-2512` against the live API reference before hardcoding it into routing config.
- If self-hosting for residency reasons, validate the tool-call parser end-to-end before production — do not assume Mistral's documented vLLM flags are sufficient.
- Confirm ZDR applies to the specific endpoint in use (stateless list above) before relying on it for a retention commitment.

### Retired / migration targets

Mistral publishes a deprecation table in its models docs covering 30+ models with windows from October 2025 through August 2026, migrating toward Mistral Medium 3.5, Mistral Small 4, and Ministral variants. Named in it: Mistral Medium 3 / 3.1, Mistral Small 3.2, Devstral variants, and legacy Mistral 7B / Mixtral.

**The table itself could not be fetched verbatim — the dedicated deprecation URLs 404'd — so no per-model retirement dates are asserted here. Do not copy dates that circulate in search summaries or aggregator sites; re-fetch the live deprecation table before citing a specific date.**

### Re-evaluate when

- Changing structured-output mode, model tier, or function-calling transport.
- Self-hosting is proposed — the tool-call parser gap above must be resolved first.
- Any workflow moves from a stateless endpoint (ZDR-eligible) to Agents/Batch/Conversations/Libraries/Files/Vibe Work/Chat (not ZDR-eligible).
- A Mistral model ID other than `mistral-large-2512` needs to be hardcoded — re-verify it first.

### Primary sources

- [Models overview](https://docs.mistral.ai/getting-started/models/models_overview/)
- [Models](https://docs.mistral.ai/models)
- [Mistral Large 3 model card](https://docs.mistral.ai/models/model-cards/mistral-large-3-25-12)
- [Function calling](https://docs.mistral.ai/capabilities/function_calling/)
- [vLLM local deployment](https://docs.mistral.ai/models/deployment/local-deployment/vllm)
- [Zero data retention](https://docs.mistral.ai/admin/monitor-comply/zero-data-retention)
- [Mistral HuggingFace org](https://huggingface.co/mistralai)

### Sourcing gap carried forward

**Exact API model ID strings are unresolved for every model except `mistral-large-2512`.** Two Mistral doc pages rendered different conventions for the same model (`mistral-medium-3505` vs `mistral-medium-3.5-26.04`); neither is confirmed. A downstream task or harness that needs a Mistral model ID beyond Large 3 must re-verify against the live API reference first — do not extrapolate a naming convention from the one confirmed ID. Deprecation dates for the 30+-model migration table are not verified (dedicated URLs 404'd). Mistral Small 4's reasoning-mode toggle mechanism is not verified. This family needs a dedicated re-verification pass before it should be treated as load-bearing for ID-level routing or audit findings.
