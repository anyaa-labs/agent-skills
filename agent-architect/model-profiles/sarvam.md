---
family: sarvam
access: open-weight
scope: regional
researched_date: 2026-09-08
---

# Sarvam AI (India)

**Regional note:** Sarvam is selected for Indic-language and voice coverage as often as for capability. Three vendor pages (`www.sarvam.ai`, including `/trust-center`) returned HTTP 403 to every fetch attempt in the research pass this profile is built from — India-residency, ISO 27001 / SOC 2, and air-gapped-deployment claims that reportedly live behind that block are **not verified as of 2026-09-08** and are deliberately excluded below, not filled from memory or third-party reporting. Only what a reachable Sarvam docs page states is recorded here.

### Current models

- `sarvam-105b` — chat/reasoning LLM, 105B-parameter MoE with Multi-head Latent Attention, 128K context, Apache 2.0 per the model docs.
- `sarvam-105b-conversations` — real-time dialogue / voice-agent variant, 32K context.
- **Saaras v3** — speech-to-text; output modes `transcribe`, `translate`, `verbatim`, `translit`, `codemix`.
- **Bulbul v3** — text-to-speech; 38 Indic voices per the self-hosted page.
- **Mayura** — text translation (11 languages).
- **Sarvam Translate** — text translation (23 languages).
- **Sarvam Vision** — document intelligence / OCR (23 languages).
- Third-party open-weight models re-served through `/v2/chat/completions`, documented as Beta and **explicitly not tuned for Indian languages**: GLM-5.2 (512K context, tool calling), Gemma 4 31B (text+image), DeepSeek V4 Flash (1M context).

### API surface

Base URL `https://api.sarvam.ai`; chat at `/v1/chat/completions`, plus `/v2/chat/completions` for the re-served open-weight models. Auth uses a proprietary `api-subscription-key` header; the docs state the endpoint "additionally accepts `Authorization: Bearer <key>` for OpenAI-compatible tooling" — that is an OpenAI-compatible chat-completions *shape*, not a claim of full API equivalence. Official Python and JavaScript SDKs; REST, WebSocket, and batch endpoints.

### Reasoning state

Not documented as a distinct provider-managed state (no thought-signature or encrypted-reasoning contract described on any reachable page). `sarvam-105b` is described as a chat/reasoning LLM but no cross-turn reasoning-echo requirement is stated — treat as an open question rather than a confirmed absence.

### Tool semantics

**Tool/function calling is documented** for the chat models, with function schemas and `tool_choice`. Not documented for the speech, TTS, translation, or vision product surfaces — those are non-conversational APIs and calling them "tool-capable" would be a category error.

### Modality support

- Modality is speech- and document-first as much as text: ASR (Saaras), TTS (Bulbul), and OCR/doc-AI (Sarvam Vision) are separate product surfaces from the chat LLM, not modalities of a single multimodal model.
- **Voice-first optimization is confirmed**: `sarvam-105b-conversations` is explicitly a real-time dialogue / voice-agent variant, and Bulbul v3 ships 38 Indic voices — a routing decision for a voice agent should prefer this variant over the base chat model.
- **Language coverage is asymmetric across products — this is a capability boundary, not a preference:**
  - **11 languages** for `sarvam-105b`, `sarvam-105b-conversations`, Bulbul v3, and Mayura: Hindi, Bengali, Tamil, Telugu, Kannada, Malayalam, Marathi, Gujarati, Punjabi, Odia, English.
  - **23 languages** for Saaras v3, Sarvam Vision, and Sarvam Translate: the 11 above plus Assamese, Urdu, Nepali, Konkani, Kashmiri, Sindhi, Sanskrit, Santali, Manipuri, Bodo, Maithili, Dogri. (The docs landing page writes "Meitei" for Manipuri — same language.)
  - An agent that transcribes a request in, say, Assamese via Saaras and then routes to `sarvam-105b` for reasoning has crossed the 23-vs-11 boundary: the chat model was never evaluated on that language. Route by the narrower list when the pipeline spans both surfaces.
- **Scripts:** Sarvam does not enumerate scripts per language anywhere reachable. What *is* documented: `sarvam-105b` accepts native-script, romanized, and code-mixed input, and Saaras v3 has explicit `translit` and `codemix` output modes. Beyond that, script-level coverage is **not publicly documented as of 2026-09-08.**

### Context behavior

`sarvam-105b`: 128K context. `sarvam-105b-conversations`: 32K context. Re-served third-party models via `/v2/chat/completions` carry their own context windows (GLM-5.2 512K, DeepSeek V4 Flash 1M) — those are the third-party vendor's contract, not Sarvam's, and the Beta/not-tuned-for-Indian-languages caveat applies to all of them.

### Structured output path

**Documented**, via `response_format` with JSON Schema and `json_object` mode, on the chat completion endpoints.

### Deployment & residency

This is the load-bearing section for a Sarvam deployment decision.

- **Self-hosting is offered and documented**: subscribe to a Sarvam model package on **AWS Marketplace**, deploy as an **Amazon SageMaker endpoint in your own AWS account and VPC**. Available self-hosted: Saaras v3, Bulbul v3, Sarvam Vision — notably **not** the flagship `sarvam-105b` chat model itself, per the sources reached.
- Documented guarantees on that self-hosted path: "Audio and documents are processed inside your own VPC. Nothing is sent to Sarvam"; endpoints deploy with **network isolation enabled** (no outbound internet from the model container); the endpoint runs in the same region and VPC as the application. The docs name BFSI, healthcare, and government data-residency needs as the motivation. Specific AWS regions are not enumerated.
- **Where the managed `api.sarvam.ai` inference is hosted is not documented on any reachable vendor page.** `www.sarvam.ai`, including `/trust-center`, returned HTTP 403 to every fetch attempt in this research pass. **Do not assert India-residency, ISO 27001, SOC 2, or air-gapped-deployment claims for the managed API** — they are widely reported and plausible but unverified as of 2026-09-08. If a compliance requirement depends on where the managed API runs, that requirement cannot be satisfied from public documentation today; the self-hosted VPC path is the only Sarvam deployment with a documented residency guarantee.

### Known production failure modes

- Routing a request in a language covered by Saaras/Sarvam Vision/Translate (the 23-language list) into `sarvam-105b` chat reasoning, which only covers 11 — the request lands on a model never evaluated for that language, and the failure looks like poor reasoning quality rather than a routing bug.
- Assuming the managed API satisfies an India-data-residency compliance obligation because the vendor is India-based — no reachable page documents where the managed API runs.
- Treating the third-party re-served models (GLM-5.2, Gemma 4, DeepSeek V4 Flash via `/v2/chat/completions`) as Indic-language-capable — the docs explicitly flag them as Beta and not tuned for Indian languages.
- Assuming `sarvam-105b` itself can be self-hosted because Saaras/Bulbul/Vision can — the documented self-host path does not cover the flagship chat model.

### Harness requirements

- Detect the target language against the 11-language chat list, not the 23-language speech/document list, before routing to `sarvam-105b` or `sarvam-105b-conversations`.
- Use `sarvam-105b-conversations` rather than the base chat model for voice-agent / real-time dialogue harnesses.
- If a data-residency or compliance obligation applies, require the AWS Marketplace / SageMaker self-hosted path and do not rely on the managed API until Sarvam publishes a reachable, fetchable residency statement.
- Do not assume tool/structured-output support extends to the ASR, TTS, translation, or OCR surfaces — those are documented separately and not as tool-callable chat endpoints.

### Retired / migration targets

- `sarvam-m` (24B) — deprecated, no longer available via API; stated replacement `sarvam-105b`.
- Sarvam-30B — deprecated; stated replacement `sarvam-105b`.
- Saarika v2.5 (11-language ASR) — being phased out; stated replacement Saaras v3.

### Re-evaluate when

- Any of the 403-blocked pages (`www.sarvam.ai`, `/trust-center`) becomes fetchable — the residency and compliance posture of the managed API should be re-verified from source rather than continuing to treat it as unknown.
- A self-hosted path is documented for `sarvam-105b` itself, changing the deployment options available under a residency constraint.
- The 11-vs-23 language asymmetry is reconciled (e.g. the chat model gains coverage for the additional 12 languages).

### Primary sources

- [Sarvam docs](https://docs.sarvam.ai/)
- [Models](https://docs.sarvam.ai/api/getting-started/models)
- [sarvam-105b reference](https://docs.sarvam.ai/api-reference-docs/models/sarvam-105b)
- [Chat completion overview](https://docs.sarvam.ai/api/api-guides-tutorials/chat-completion/overview)
- [Quickstart](https://docs.sarvam.ai/api/getting-started/quickstart)
- [Self-hosted introduction](https://docs.sarvam.ai/api/self-hosted/introduction)

### Sourcing gap carried forward

`www.sarvam.ai` (including `/trust-center`) returned HTTP 403 to every fetch attempt as of 2026-09-08. India-residency, ISO 27001 / SOC 2, and air-gapped-deployment claims reported elsewhere about Sarvam are **not sourced from a reachable vendor page** and are intentionally omitted here. Re-verify from source before recording them in any downstream checklist or audit finding.
