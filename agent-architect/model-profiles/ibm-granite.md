---
family: ibm-granite
access: open-weight
scope: global
researched_date: 2026-09-08
---

# IBM Granite

**Provenance note:** Added on Task 1's reconciliation, not in the design's original provisional inventory. IBM Granite 4.2 has **the best-documented self-hosting contract of any family in this research pass** — a clean three-way thinking switch via chat-template kwargs, exact vLLM and SGLang parser flags, and prescriptive sampling — directly useful to the "what breaks when self-hosted" question this skill's residency and deployment guidance cares about.

### Current models

- **`ibm-granite/granite-4.2-30b`** (29B), **`ibm-granite/granite-4.2-8b`** (9B), **`ibm-granite/granite-4.2-3b`** (4B) — the current language line, all updated within days of 2026-09-08. GGUF variants published under the same org.
- IBM describes the 4.2 line as "efficient reasoning and thinking language models for multilingual generation, coding, and AI assistant workflows," purpose-built for agentic workflows: 3B for edge, 8B balanced general-purpose, 30B flagship.
- Six Granite families: Granite Language, Granite Speech, Granite Vision, Granite Guardian, Granite Embedding, Granite Time Series. Only the Language family is detailed below.
- **License: Apache-2.0**, released with cryptographic signatures, ISO certification, and transparency disclosures.
- `granite-4.2-30b` is **text-only** (decoder-only transformer). Vision is a separate Granite family.

### API surface

IBM does not publish a first-party hosted inference API for Granite in the sources reviewed — the documented surface is the **OpenAI-compatible API exposed by self-hosting** it via vLLM or SGLang (see Deployment & residency). It integrates with agentic frameworks (OpenCode, Pi, OpenHands) via that OpenAI-compatible surface, and is also available through managed offerings (watsonx.ai, OpenRouter, Replicate) whose own API contracts are not detailed in the sources reviewed.

### Reasoning state

- **Three-way thinking switch, toggled via chat-template kwargs to `apply_chat_template()`** — the cleanest such contract among the open-weight families in this pass:
  - Full thinking (**default**): `enable_thinking=True` → chain-of-thought inside `<think>...</think>`
  - Non-thinking: `enable_thinking=False`
  - **Low-effort**: `enable_thinking=True, low_effort=True` → brief reasoning
- **No reasoning-echo rule (a requirement to pass prior reasoning state back on subsequent turns) is documented for Granite in the sources reviewed.** Do not assume there is none — treat this as an open question rather than a confirmed absence, and re-verify before building a multi-turn tool loop that depends on one behavior or the other.

### Tool semantics

- Tool calling uses **OpenAI's function definition schema**; the model reasons about tool selection first, then emits **`<tool_call>` blocks**.
- **The vLLM tool-call parser is `--tool-call-parser qwen3_coder` — not a Granite-named parser.** Self-hosters who guess a `granite`-named parser get malformed tool calls. This is the archetypal "what breaks when self-hosted" fact for this family.
- SGLang uses `--tool-call-parser auto` (paired with `--reasoning-parser auto`).

### Modality support

`granite-4.2-30b` (and the 8B/3B siblings) are **text-only**, decoder-only transformers. Vision, Speech, Guardian, Embedding, and Time-Series are separate Granite product families with their own model cards; per-model detail for those was not fetched in this pass.

### Context behavior

- **Context: 128K native, extendable to 512K** (the 512K extension is called out specifically for the 30B).
- `max_new_tokens=8192` is the vendor's recommended budget for thinking mode.

### Structured output path

**Not documented in the sources reviewed.** No `json_schema`, `json_object`, or strict-mode structured-output path is stated on any Granite page fetched. Treat this as an open question — do not assume OpenAI-style structured output support without a fresh vendor citation; validate tool-call output externally in the meantime.

### Deployment & residency

- **Vendor-documented serving stacks: vLLM, SGLang, Transformers**, plus quantized formats for **llama.cpp and Ollama**.
- **vLLM flags IBM documents, exactly:**
  - `--reasoning-parser granite_thinking_parser`
  - `--tool-call-parser qwen3_coder` — again: not a Granite-named parser.
  - `--enable-auto-tool-choice`
  - `--max-model-len 131072` (for 128K)
  - `--dtype bfloat16`
- **SGLang:** `python3 -m sglang.launch_server --model-path ibm-granite/granite-4.2-30b --reasoning-parser auto --tool-call-parser auto`
- **Sampling is prescriptive**: IBM says use **`temperature=1.0` and `top_p=0.95` across all tasks and serving backends**, with `max_new_tokens=8192` for thinking mode. This departs from the low-temperature default conventionally used for agentic work and is worth honoring rather than overriding.
- Architecture (8B): GQA with 32 attention heads / 8 KV heads, RoPE, separate input and output embeddings.
- **This is the self-host path that makes Granite viable under a residency constraint**: deployment is documented across cloud, on-premises, and edge, with availability through Hugging Face, Ollama, LM Studio, watsonx.ai, OpenRouter, Replicate, Weights & Biases, Unsloth, AnythingLLM, and enterprise channels including watsonx and **Red Hat Enterprise Linux AI**.
- **Residency: not vendor-stated in the pages fetched.** No data-retention or geographic-processing commitment is documented for any Granite-branded managed offering in this pass — for a fully self-hosted deployment, residency is whatever the operator's own infrastructure guarantees, not something IBM documents at the model layer.

### Known production failure modes

- Guessing a "granite"-named tool-call parser when self-hosting: the vLLM flag is `--tool-call-parser qwen3_coder`, not a Granite-named parser — a guess here produces malformed tool calls, not an error.
- Overriding IBM's prescriptive `temperature=1.0` / `top_p=0.95` sampling with a conventional low-temperature agentic setup — IBM's own guidance departs from the usual default and was presumably validated against it.
- Assuming SGLang or Ollama support matches the vLLM level of detail: vendor documentation for those beyond the `auto`/`auto` parser pair is thin.

### Harness requirements

- Pin the exact vLLM flags IBM documents (`--reasoning-parser granite_thinking_parser --tool-call-parser qwen3_coder --enable-auto-tool-choice --max-model-len 131072 --dtype bfloat16`) rather than guessing a Granite-specific parser name.
- Set the thinking mode explicitly via chat-template kwargs (`enable_thinking`, `low_effort`) — no request-level reasoning-effort parameter is documented.
- Start from IBM's prescriptive sampling (`temperature=1.0`, `top_p=0.95`, `max_new_tokens=8192` for thinking mode) rather than a conventional low-temperature agentic default.
- Do not assume a structured-output / `json_schema` path exists; validate tool-calling output externally instead.
- Before relying on any reasoning-echo behavior in a multi-turn tool loop, verify it directly — none is documented either way in the sources reviewed.

### Retired / migration targets

**IBM publishes no deprecation table with dated retirements and replacements for Granite model IDs — not publicly documented as of 2026-09-08.** Granite 4.0 and 4.1 have their own doc pages and appear superseded by 4.2 rather than formally retired.

### Re-evaluate when

- Self-hosting is proposed on a serving stack not named here (anything beyond vLLM, SGLang, Transformers, llama.cpp, Ollama) — no vendor guidance exists for it.
- A new Granite generation ships — the `qwen3_coder` tool-call-parser choice is generation-specific and should be re-verified, not assumed to carry forward.
- Structured output or a reasoning-echo requirement is later documented by IBM — this pass found neither, and either would change the Reasoning state / Structured output sections above.
- A deprecation table is later published for Granite model IDs.

### Primary sources

- [IBM Granite](https://www.ibm.com/granite)
- [Granite 4.2 docs](https://www.ibm.com/granite/docs/models/granite4-2)
- [IBM Granite HuggingFace org](https://huggingface.co/ibm-granite)
- [granite-4.2-8b model card](https://huggingface.co/ibm-granite/granite-4.2-8b)
- [granite-4.2-30b model card](https://huggingface.co/ibm-granite/granite-4.2-30b)

### Sourcing gap carried forward

No deprecation table exists. SGLang and Ollama flags beyond `auto`/`auto` are thin in vendor docs. Per-model detail for the Speech, Vision, Guardian, Embedding, and Time-Series families was not fetched. No reasoning-state echo rule, structured-output path, or managed-offering residency statement is documented anywhere in the sources reviewed — each is recorded here as an open question rather than filled from memory.
