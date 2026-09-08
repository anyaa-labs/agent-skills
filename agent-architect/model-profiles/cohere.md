---
family: cohere
access: open-weight
scope: global
researched_date: 2026-09-08
---

# Command (Cohere)

*(H1 checked against the refreshed content: the current lineup spans Command A+, Command A, Command R+, plus Embed/Rerank/Parse/Audio/Aya sub-families — broader than "Command R," so "Command (Cohere)" is the accurate umbrella title, not a rename.)*

### Current models

- **Command A+** (`command-a-plus-05-2026`) — flagship, released 2026-05-20. Cohere's first **MoE**: 25B active / 218B total. **128K input, 64K output.** Text + image input. **Apache-2.0.** Weights on Cohere's own HF org. Runs on 1×B200 or 2×H100 at W4A4. 48 languages including all official EU languages. Documented as the **last** model in the Command A family, unifying vision, reasoning, translation, and agentic capability.
- `command-a-03-2025` — 256K, text; tool use / agents / RAG.
- `command-a-reasoning-08-2025` — 256K; Cohere's first reasoning model.
- `command-a-vision-07-2025` — 128K, text + images.
- `command-a-translate-08-2025` — 8K, translation across 23 languages.
- `command-r7b-12-2024`, `command-r-08-2024`, `command-r-plus-08-2024` — 128K, legacy tier (see Retired below for what's already gone).
- Embed: `embed-v4.0` (128K, text + images + mixed), `embed-english-v3.0`, `embed-english-light-v3.0`, `embed-multilingual-v3.0`, `embed-multilingual-light-v3.0`.
- Rerank: `rerank-v4.0-pro`, `rerank-v4.0-fast` (32K), `rerank-v3.5`, `rerank-english-v3.0`, `rerank-multilingual-v3.0`.
- Parse: `parse-v5.0` (document intelligence, vision). Audio: `cohere-transcribe-03-2026`, `cohere-transcribe-arabic-07-2026`. Aya: `tiny-aya-global`, `tiny-aya-earth`, `tiny-aya-fire`, `tiny-aya-water`, `c4ai-aya-expanse-32b`, `c4ai-aya-vision-32b`.

### API surface

- **Tool use (Chat v2)**: request carries `model`, `messages`, and `tools` (JSON Schema with `name`, `description`, `parameters`). The response returns a **`tool_plan`** — the model's stated reflection on next steps — *alongside* `tool_calls` (`id`, `type: "function"`, `function.name`, `function.arguments` as a JSON string). **`tool_plan` is Cohere-specific and has no OpenAI analogue; harnesses ported from OpenAI silently drop it**, losing the model's stated reasoning about what it's about to do.
- Responses include fine-grained citations automatically, with sources, text spans, and tool-output references — a genuine differentiator worth using instead of building a separate citation layer.

### Reasoning state

- **Reasoning toggle**: `thinking={"type": "enabled"}` (default) / `{"type": "disabled"}`, with budget via `thinking={"token_budget": N}`. Cohere recommends leaving at least 1K tokens for the response and suggests 31K as an optimal budget. Reasoning returns as **content blocks** — `content.type == "thinking"` vs `content.type == "text"` — and streams as `event.delta.message.content.thinking` / `...content.text`. Documented against `command-a-reasoning-08-2025`; the Command A+ page also references enabling and disabling `thinking`.
- Do not assume hidden reasoning-state preservation beyond what the API explicitly returns as thinking content blocks.

### Tool semantics

- **Tool results have an unusual shape — a real porting hazard**: role `"tool"`, `tool_call_id`, and `content` as an **array of document objects** (`{type: "document", document: {data, id?}}`), not a plain string. Code that appends a plain string as tool-result content will not match the schema.
- **`strict_tools=True`** (Chat v2) enforces tool definitions and prevents hallucinated tool names and parameters. **Cap: 200 fields across all tools** — a real ceiling for a large tool loadout.

### Modality support

- Command A+ and Command A Vision add text + image input; Command A Translate is text-only across 23 languages. Treat other Command tiers as text/document-first unless the specific model's docs say otherwise. Embed/Rerank/Parse/Aya each have their own modality scope (see Current models).

### Context behavior

- Context varies by model: Command A+ is **128K input, 64K output** per the changelog (the models table states "128K" without the input/output split — use the changelog figures, they're more specific). Command A / Command A Reasoning are 256K; Command A Vision and the Command R tier are 128K.
- Good fit for cited RAG answers; use explicit document boundaries and source attribution, and lean on Cohere's automatic citations rather than building a separate attribution layer.

### Structured output path

- **`response_format` supports `{"type": "json_object"}` and full JSON Schema mode.** Top level must be an object; every object needs at least one required field. Supported on Command A+, Command A, Command R+ (08-2024 and standard), Command R (08-2024 and standard).
- **JSON mode requires an explicit prompt instruction — a concrete, vendor-documented production failure mode.** Cohere states the prompt "should always explicitly instruct the model to generate a JSON"; without it, the model **may produce an infinite character stream and exhaust the context length.** This is not a style suggestion, it's a documented failure mode with a real cost impact.
- JSON Schema mode supports only a **subset** of JSON Schema — `minLength`, `maxLength`, `minimum`, `maximum`, `minItems`, `maxItems`, and certain regex patterns are **unsupported**. Schema processing adds first-request latency, cached thereafter.

### Deployment & residency

- Targets: **Cohere Platform, AWS Bedrock, AWS SageMaker, Microsoft Azure (serverless), Oracle Cloud Infrastructure, and Private Deployment.** SDKs in TypeScript, Python, Go, Java — support varies by platform (Go and Java on Bedrock/SageMaker are listed as "coming soon").
- **Private deployment** is the self-host path that matters for a residency constraint: on-premises or VPC (AWS/Azure/GCP/OCI). Containerized components typically on Kubernetes (not strictly required): API endpoints, model management/storage, a serving framework, and a fine-tuning framework. Cohere states **"the data never leaves your environment, and the model can be fully network-isolated"** — air-gapped operation is supported.
- Command A+ is explicitly positioned for **sovereign critical infrastructure**, with private deployment for enterprise and public-sector control. Among the Western open-weight-adjacent vendors in this pass, Cohere is the clearest "bring the model to the data" option for a Sovereignty & Residency review.
- **Which specific models are available for private deployment is not documented on the overview page as of 2026-09-08.** No formal data-residency/region policy page was found either — a residency-constrained deployment gets an architecture (private/air-gapped) but not a region- or jurisdiction-level guarantee from Cohere's own docs.

### Known production failure modes

- **Infinite generation loop / context exhaustion when JSON mode is requested without an explicit "generate JSON" instruction in the prompt** — vendor-documented, not a hypothetical.
- A harness ported from an OpenAI-shaped tool-calling contract silently drops `tool_plan`, losing the model's stated intent before acting.
- Tool-result content sent as a plain string instead of the required array-of-document-objects shape — a schema mismatch that an OpenAI-pattern harness will hit immediately.
- Exceeding the 200-field cap across all tools when `strict_tools=True` is set.
- JSON Schema mode silently rejecting or ignoring schema constraints Cohere doesn't support (`minLength`, regex patterns, etc.).

### Harness requirements

- Always include an explicit "generate JSON" instruction alongside `response_format` JSON mode — do not rely on the parameter alone.
- Preserve and surface `tool_plan` in the harness rather than discarding it as an unrecognized field; it is where Cohere puts the model's stated next-step reasoning.
- Build tool-result formatting around the array-of-document-objects shape from the start rather than porting an OpenAI-shaped string-content assumption.
- Keep total tool-field count under 200 when using `strict_tools=True`.
- Leverage built-in citations instead of adding a separate citation-hallucination surface.
- For a residency-constrained deployment, confirm which specific model is actually available under Private Deployment before committing to Cohere as the residency answer — the overview page does not enumerate this.

### Retired / migration targets

- **Retired 2026-04-04**: `embed-english-v2.0`, `embed-english-light-v2.0`, `embed-multilingual-v2.0`, `c4ai-aya-expanse-8b`, `c4ai-aya-vision-8b`. Replacements: `embed-english-v3.0` / `embed-multilingual-v3.0` / `embed-v4.0`; for chat, `command-r7b-12-2024`, `command-a-03-2025`, or `command-a-reasoning-08-2025`.
- **Deprecated 2025-09-15**: `command-r-03-2024` (alias `command-r`), `command-r-plus-04-2024` (alias `command-r-plus`), `command-light`, `command`, `summarize`. Replacements: `command-r-08-2024`, `command-r-plus-08-2024`, `command-a-03-2025`. Fine-tuning discontinued for `command-light`, `command`, `command-r`, `classify`, `rerank`.
- **Shut down 2025-04-30** (announced 2024-12-02): `rerank-english-v2.0`, `rerank-multilingual-v2.0` → `rerank-v3.5`.
- **2025-03-08**: fine-tuned Command-R-03-2024 models lost support; migrate to the Command-R-08-2024 base.
- **2025-01-31**: the Classify endpoint via default Embed models is no longer supported; requires fine-tuned Embed models.

### Re-evaluate when

- Changing structured-output mode, RAG/citation requirements, or tool-result formatting conventions.
- Porting a harness originally built against an OpenAI-shaped tool contract — check for `tool_plan` handling and tool-result content shape specifically.
- A residency requirement is in scope — confirm model availability under Private Deployment directly with Cohere rather than assuming from the overview page.
- Any model in the Retired table above is still referenced in config.

### Primary sources

- [Cohere models](https://docs.cohere.com/docs/models)
- [Deprecations](https://docs.cohere.com/docs/deprecations)
- [Tool use overview](https://docs.cohere.com/docs/tool-use-overview)
- [Structured outputs](https://docs.cohere.com/docs/structured-outputs)
- [Reasoning](https://docs.cohere.com/docs/reasoning)
- [Command A+](https://docs.cohere.com/docs/command-a-plus)
- [Cohere works everywhere](https://docs.cohere.com/docs/cohere-works-everywhere)
- [Private deployment overview](https://docs.cohere.com/docs/private-deployment-overview)
- [Command A+ changelog](https://docs.cohere.com/changelog/command-a-plus-05-2026)

### Sourcing gap carried forward

Model availability for Private Deployment, and a formal data-residency/region policy, are undocumented on the pages fetched. The research brief found no confirmation that structured output and RAG/agentic mode are mutually incompatible on the current lineup — that claim from the prior (2026-06-14) profile has been dropped rather than carried forward unverified.
