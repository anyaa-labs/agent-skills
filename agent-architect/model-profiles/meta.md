---
family: meta
tier: open-weight
researched_date: 2026-09-08
---

# Llama (Meta)

**Status caveat, load-bearing for this whole profile:** the family appears frozen. Meta's 2026 model releases are the **Muse** line, not Llama — `developer.meta.com/ai/docs/overview/` lists Muse Spark, Muse Glimmer, Muse Image, and Muse Voice Transcribe alongside Llama 4, Llama Guard 4, and Llama 3.3. Muse Spark 1.3 is **proprietary, not open weights** (served through Muse Code and the Meta Model API); Meta's own announcement lists an open-weights Muse Spark release as a *future* roadmap item, not a shipped fact. **Meta publishes no statement on whether Llama is still maintained or has been superseded** — not publicly documented as of 2026-09-08. Treat any guidance that positions Llama as Meta's current flagship open-weight line as needing this caveat, and flag it explicitly in any audit that recommends Llama going forward. `www.llama.com/docs/*` now 301-redirects to `developer.meta.com/ai/docs/*`.

### Current models

- **Llama 4 Scout** — 17B active / 109B total across 16 experts. Context up to **10M tokens**. Runs on a single H100.
- **Llama 4 Maverick** — 400B total across experts, natively multimodal, **1M token context**. Requires a distributed setup. (The active-parameter count rendered ambiguously on the fetched page — do not quote a number for it.)
- Knowledge cutoff: **August 2024**.
- **Llama Guard 4** — current safety/protection model with Llama 4 support.
- Llama 3.3 and earlier are documented as prior generations, not formally retired (see Retired below).

### API surface

- Usually self-hosted or provider-hosted through an OpenAI-compatible surface; actual tool support depends entirely on the serving stack, since Meta itself documents none (see Deployment & residency).

### Reasoning state

- No persistent or hidden reasoning state is documented. External state management is required for complex agents — do not assume anything survives across turns beyond what you explicitly pass back.

### Tool semantics

- **Tool calling is a prompt-format convention, not an API contract — the single most important architectural fact about Llama in an agent system.** Meta documents two output formats the model emits: Python-style (`[func_name(param="value")]`) and JSON-style (`{name, parameters}`). There is no vendor-side JSON-schema enforcement; the harness must parse these itself and own recovery from malformed output.
- Prompt format uses structured control tokens: `<|begin_of_text|>`, `<|header_start|>`, `<|eot|>`. Four roles: system, user, assistant, and tool (tool outputs carry the role name `ipython`).
- External grammar constraints remain important for reliable JSON in production: llama.cpp grammars, vLLM guided decoding, Outlines, or equivalent — Meta provides none of this itself.

### Modality support

- Llama 4 Scout and Maverick are natively multimodal: text plus **up to 5 images**. **Image understanding is English-only even though text spans 12 languages.** Images are tiled to 336×336 with dynamic patch tokens and tile separator tokens, so larger images cost more prompt tokens than a flat per-image estimate would suggest.

### Context behavior

- Advertised context is very large (10M for Scout, 1M for Maverick) but effective reasoning range at that length is not vendor-characterized. Validate context selection and long-context performance on the deployed stack rather than trusting the advertised number.

### Structured output path

- **Not publicly documented by Meta as of 2026-09-08.** Use external grammar constraints (llama.cpp grammars, vLLM guided decoding, Outlines, or equivalent) — there is no vendor-native structured-output mode to fall back on.

### Deployment & residency

- Distribution: direct download from Meta, Hugging Face, Kaggle, plus cloud and edge partners. Docs cover private cloud, production pipelines, autoscaling, and accelerator management at a conceptual level.
- **Meta documents no serving-stack flags at all — no vLLM/SGLang `--tool-call-parser` or `--reasoning-parser` guidance, not even for the previous generation.** This is a harder gap than the Chinese open-weight families in this pass, where at least the prior generation's flags are documented. Self-hosters must source parser configuration entirely from the serving framework's own docs, not from Meta.
- Residency: not vendor-stated. No hosting-location, data-processing, or retention claim was found for self-hosted or partner-hosted deployments.
- **License: Llama 4 Community License — not Apache-2.0, not MIT.** This is a real procurement constraint, not boilerplate: a commercial license must be requested from Meta above **700 million monthly active users**; "Built with Llama" must be prominently displayed; derivative model names must **begin with "Llama"**; the copyright notice must be retained; Meta's Acceptable Use Policy is incorporated by reference. A residency-driven self-host decision still has to clear this license, independent of infrastructure.

### Version-specific notes

- **Llama 4 Scout / Maverick**: Multimodal open-weight models with very large advertised context. Use context-selection validation and external output constraints before production agent use. Cost tier: $/$$ depending on host.
- **Llama 3.3 70B / 3.1 405B**: Viable open-weight options for controlled workers, presented as prior generations rather than formally retired. Cost tier: $/$$.
- **Small Llama variants**: Restrict to short, bounded, validated tasks. Cost tier: $.

### Known production failure modes

- Path forgetting, malformed JSON from the unenforced tool-call format, chat-template mismatch, cascading self-correction, and hallucinated placeholders.
- Small models loop on describing their own capabilities instead of acting.
- A self-hosted deployment silently produces malformed tool calls because no vendor-documented parser flags exist to configure against — the gap is discovered in production, not from a doc page.

### Harness requirements

- Validate the exact serving stack with tool-call fixtures covering both the Python-style and JSON-style output formats Meta documents — do not assume the serving framework picked the right one by default.
- Keep system prompts and tool sets small for smaller models.
- Detect cascading errors and stop rather than relying on self-correction, since there is no vendor-native structured-output or schema-enforcement path to fall back on.
- Confirm the Llama 4 Community License's MAU threshold and naming/attribution requirements are compatible with the deployment before shipping.

### Retired / migration targets

**Meta publishes no deprecation/retirement table with dates and replacements for Llama model IDs — not publicly documented as of 2026-09-08.** Llama 3.x is presented as a prior generation, not formally retired; there is no vendor-stated end-of-life date to plan a migration around. Treat any claim of a specific Llama retirement date as unsourced until Meta publishes one.

### Re-evaluate when

- Changing serving framework, tokenizer, chat template, parser, quantization, or context length.
- Meta publishes any statement on Llama's maintenance status relative to the Muse line, or a deprecation table appears.
- Monthly active users approach the 700M Llama 4 Community License threshold.

### Primary sources

- [Meta AI developer docs overview](https://developer.meta.com/ai/docs/overview/)
- [Meta AI docs index](https://developer.meta.com/ai/docs/)
- [Model cards and prompt formats](https://developer.meta.com/ai/docs/model-cards-and-prompt-formats/)
- [Llama 4 model card and prompt format](https://developer.meta.com/ai/docs/model-cards-and-prompt-formats/llama4/)
- [Llama 4 license](https://developer.meta.com/ai/llama4/license/)
- [Introducing Muse Spark 1.3](https://research.meta.ai/blog/introducing-muse-spark-1-3)

### Sourcing gap carried forward

Meta publishes no statement on whether Llama is still maintained or has been superseded by the Muse line — not publicly documented as of 2026-09-08. Meta documents no serving-stack (vLLM/SGLang) flags for Llama at all, for any generation. No deprecation/retirement table exists for Llama model IDs. No residency or data-handling statement was found for self-hosted or partner-hosted deployments.
