---
family: ai2-olmo
access: open-weight
scope: global
researched_date: 2026-09-08
---

# OLMo (Ai2)

**Detection note.** OLMo appears under at least four different strings for the same weights: the HuggingFace repo (`allenai/Olmo-3.1-32B-Instruct`), OpenRouter (`allenai/olmo-3-32b-think`), Parasail (`Olmo-3-32B-Think`), and Cirrascale/Ai2 Endpoints (`OLMo-2-0325-32B-Instruct`). Grep for `olmo` case-insensitively **and** for the base URLs `openrouter.ai`, `ai2endpoints.cirrascale.ai`, `api.parasail.io`, and a local `vllm serve`. **Do not confuse OLMo with Ai2's Molmo (multimodal) or OLMoASR (speech)** — different families, not covered by this profile.

### API surface

- **Ai2 operates no first-party inference API.** This is the structural fact that shapes everything else. Ai2's own quickstart routes to three third-party providers, all OpenAI-compatible, **each with a different model-ID convention for the same weights**:

| Provider | Base URL | Model string |
| --- | --- | --- |
| OpenRouter | `https://openrouter.ai/api/v1` | `allenai/olmo-3-32b-think` |
| Cirrascale ("Ai2 Endpoints") | `https://ai2endpoints.cirrascale.ai/api` | `OLMo-2-0325-32B-Instruct` (list at `GET /api/models`) |
| Parasail | `https://api.parasail.io/v1` | `Olmo-3-32B-Think` |

- **Self-hosting is the first-class path**: `vllm serve "allenai/Olmo-3.1-32B-Instruct"` yields an OpenAI-compatible `/v1/chat/completions`.
- **Audit consequence: an OLMo model string in code tells you nothing about who is serving it, in which jurisdiction, or under whose retention policy.** Every OLMo finding in a Sovereignty & Residency or Agent Security review must trace the serving provider separately — the model name is not the boundary.

### Reasoning state

- **Think and Instruct are separate checkpoints, so reasoning is a model-selection decision, not a request parameter. There is no `enable_thinking`-style toggle.** Ai2 splits the roles explicitly: Instruct is "optimized for helpfulness, following complex instructions, and function calling"; Think is "optimized for reasoning capabilities, math, code, and precise instruction following."
- Think variants emit reasoning inside **`<think>…</think>`** within the assistant turn, using a ChatML-style template (`<|im_start|>assistant\n<think>…</think>\n…<|im_end|>`).
- Because reasoning is inline text rather than a typed block, **a harness that concatenates assistant content back into history will replay the full trace** — growing context turn over turn — unless it strips the tags deliberately.
- **Gap:** whether traces should be stripped or replayed across turns is **not publicly documented as of 2026-09-08**. There is no signature, encryption, or continuity mechanic documented, so stripping is safe from a correctness standpoint and is the sensible default for context cost; verify against your own evals.

### Tool semantics

- Documented and specific. Serving requires **`vllm>=0.11.1`** and a dedicated parser:

```
vllm serve allenai/Olmo-3-7B-Instruct --enable-auto-tool-choice --tool-call-parser olmo3
```

- **Without `--tool-call-parser olmo3`, tool calls will not parse.** Tool definitions use the standard OpenAI `tools` array schema.
- **Ai2 explicitly documents MCP:** "Olmo-3-Instruct models are also optimized for use with MCP servers," with a worked OpenAI Agents SDK + `MCPServerStdio` + `mcp-server-fetch` example routed through LiteLLM as `hosted_vllm/allenai/Olmo-3-7B-Instruct`. For an open-weights family this is unusually concrete — most publish no MCP guidance at all.
- **Tool calling is documented for Instruct only.** The Think 32B model card mentions no tool calling. **Do not assume a Think checkpoint can drive a tool loop** — if an agent needs both reasoning depth and tools, that is a two-model design decision, not a parameter.
- **Gaps:** parallel tool calls and tool-ID semantics are **not publicly documented as of 2026-09-08**.

### Modality support

- **Text only.** No image, audio, or video input; no generated media; no realtime or voice surface.
- Ai2's multimodal work is **Molmo** and its speech work is **OLMoASR** — separate families with separate contracts. A system that runs OLMo alongside either needs its own research pass for those; this profile does not cover them.

### Context behavior

- **65,536 tokens, and it is extrapolated rather than natively trained.** The `config.json` for `Olmo-3.1-32B-Instruct` gives `max_position_embeddings: 65536` reached via **YaRN**: `rope_type: "yarn"`, `factor: 8.0`, `original_max_position_embeddings: 8192`, `rope_theta: 500000`, `beta_fast: 32`, `beta_slow: 1`. Architecture `Olmo3ForCausalLM`, vocab 100278.
- **A YaRN factor of 8 over an 8K base is a material caveat for long-context agent work.** Ai2's only long-context statement is a positive one — Base "maintains performance at extended context lengths (~up to 65K tokens)," citing RULER — not a degradation disclosure. Treat 65K as a ceiling to validate against your own workload, not a comfortable operating range.
- **No caching feature exists**, because there is no hosted API to cache in. Cost control is entirely a serving-configuration matter.
- Note a stale-sample trap: the deployment guide's Modal example pins `max_model_len=4096` for an **Olmo 2** model. That is old sample code, not an Olmo 3 limit — but it is the kind of value that gets copied into production config unchanged.
- **Gap:** max output tokens are **not publicly documented as of 2026-09-08**.

### Structured output path

- **Not publicly documented as of 2026-09-08.** Ai2 documents no JSON mode, no schema parameter, and no grammar path.
- Anything available in practice comes from **vLLM's own guided-decoding stack** (or the third-party provider's), which makes structured output **a property of the serving layer, not of the model contract**. That has two consequences worth stating in a review: the guarantee moves if the serving stack changes, and it does not travel with the model when it is moved between providers.
- Any system depending on schema conformance must validate downstream and retry, and must record which serving stack is actually providing the guarantee.

### Deployment & residency

- **Weights-only, Apache 2.0** — stated on both the `Olmo-3.1-32B-Instruct` and `Olmo-3.1-32B-Think` cards. Ai2's docs claim "permissive commercial licensing: unrestricted commercial use," with the Responsible Use Guidelines referenced as intent rather than a license restriction.
- First-party deployment guides exist for **Google Vertex AI** (including Model Garden one-click, `model_garden.OpenModel("allenai/olmo-2-1124-7b")`) and **Modal.com** with vLLM.
- **Residency is entirely yours when self-hosting**, which — together with Apache 2.0 — is the main reason a residency- or sovereignty-constrained system would choose OLMo over a hosted family. **If instead you route through Cirrascale, Parasail, or OpenRouter, residency and retention are theirs and Ai2 documents nothing about them.** That distinction is the single most important thing to establish before scoring an OLMo deployment on the Sovereignty & Residency dimension.

### Known production failure modes

- **A model string that hides the actual serving provider.** Three providers, three ID conventions, one set of weights — the string in config does not identify who is processing the data or where.
- **Tool calls silently failing to parse** because the server was started without `--tool-call-parser olmo3`, or on a vLLM older than 0.11.1.
- **A Think checkpoint given tools.** Tool calling is documented for Instruct only; a Think model in a tool loop is undocumented behavior.
- **`<think>` traces replayed into history turn after turn** because inline tags were concatenated back rather than stripped, quietly inflating context and cost.
- **65K treated as a comfortable window** when it is reached by YaRN extrapolation from an 8K base and Ai2 publishes no degradation curve.
- **`max_model_len=4096` copied from the Olmo 2 Modal sample** into an Olmo 3 deployment, capping context at a sixteenth of the model's ceiling.
- **Structured output assumed to be a model guarantee** when it is supplied by the serving stack and disappears if that stack changes.
- **A provider a generation behind.** Cirrascale's own sample still ships `OLMo-2-0325-32B-Instruct` while Parasail and OpenRouter ship Olmo 3 — a "current OLMo" endpoint may be serving the previous family.
- **Molmo or OLMoASR facts imported into an OLMo decision.** They are separate families.

### Harness requirements

- **Record the serving provider explicitly** alongside the model string — provider, region, and retention posture. For OLMo the model name is not sufficient to describe the deployment.
- Pin `vllm>=0.11.1` and start with **`--enable-auto-tool-choice --tool-call-parser olmo3`**; smoke-test a tool call before shipping.
- Use **Instruct checkpoints for anything that calls tools**; treat Think as a reasoning-only role.
- Strip `<think>…</think>` from assistant turns before appending to history, unless an eval shows replay helps.
- Validate `max_model_len` against the deployed config rather than inheriting it from a sample, and validate long-context behavior against your own workload given the YaRN extrapolation.
- If output shape matters, choose and pin the guided-decoding stack deliberately, and record that the guarantee lives there rather than in the model.
- For a residency obligation, **self-host** — that is the only OLMo posture Ai2's own documentation supports.

### Retired / migration targets

- **No deprecation policy and no retirement notices exist.**
- The release-notes page documents the lineage — Olmo Feb 2024 → Olmo 7B April 2024 → Olmo July 2024 → OlmoE Sept 2024 → Olmo 2 Nov 2024 → Olmo 2 32B Mar 2025 → Olmo 2 1B May 2025 — and a naming-convention change (`model name, version, parameters, month-year`; "Olmo v1.7 is now Olmo April 2024"). **It stops at May 2025 and contains no Olmo 3 entries**, so it is itself stale relative to the rest of the site.
- **The practical migration signal is provider-side, not vendor-side.** Cirrascale's sample still ships `OLMo-2-0325-32B-Instruct` while Parasail and OpenRouter ship Olmo 3 — provider availability lags the model line. Check which generation your provider is actually serving rather than assuming the latest.
- With no deprecation policy, **profile age and the HuggingFace org are the only staleness signals available**; there will be no vendor notice.

### Version-specific notes

- **`allenai/Olmo-3.1-32B-Instruct`** — Apache 2.0, 65,536 context via YaRN, tool calling and MCP documented, `Olmo3ForCausalLM`. The default choice for an agent role. Cost tier: $ (self-hosted).
- **`allenai/Olmo-3.1-32B-Think`** — Apache 2.0, same context, `<think>…</think>` traces, **no documented tool calling**. Reasoning role only. Cost tier: $ (self-hosted).
- **`allenai/Olmo-3-7B-Instruct`** — the model Ai2's own tool-calling and MCP examples are written against. Cost tier: $.
- **`allenai/Olmo-3-7B-Think`** — 7B reasoning checkpoint. Cost tier: $.
- **Bases**: `allenai/Olmo-3-1125-32B`, `allenai/Olmo-3-1025-7B`. Also named in the blog: Olmo 3-RL Zero 7B, and a December refresh (Olmo 3.1 Think 32B, Olmo 3.1 Instruct 32B, Olmo 3.1 RL Zero 7B Code and Math).

### Re-evaluate when

- Changing serving provider, or moving between a hosted provider and self-hosting — residency, retention, and the model-ID convention all change together.
- Changing vLLM version or the serving stack, since both the tool-call parser and any structured-output guarantee live there.
- Switching between Instruct and Think checkpoints, especially if a tool loop is involved.
- Pushing context toward the 65K ceiling, given the YaRN extrapolation and the absence of a published degradation curve.
- Ai2 publishing a first-party inference API, a deprecation policy, or a structured-output path — none exist today.
- Adding Molmo or OLMoASR, which are separate families needing their own profiles.

### Primary sources

- [OLMo](https://allenai.org/olmo)
- [OLMo 3 blog](https://allenai.org/blog/olmo3)
- [Quick start — APIs](https://docs.allenai.org/quick_start/apis)
- [Quick start — deployment](https://docs.allenai.org/quick_start/deployment)
- [Models — OLMo](https://docs.allenai.org/models/olmo)
- [OLMo release notes](https://docs.allenai.org/release_notes/olmo-release-notes)
- [Latest releases](https://docs.allenai.org/latest-releases)
- [Ai2 docs index (llms.txt)](https://docs.allenai.org/llms.txt)
- [Olmo-3.1-32B-Instruct model card](https://huggingface.co/allenai/Olmo-3.1-32B-Instruct)
- [Olmo-3.1-32B-Think model card](https://huggingface.co/allenai/Olmo-3.1-32B-Think)
- [Olmo-3.1-32B-Instruct config.json](https://huggingface.co/allenai/Olmo-3.1-32B-Instruct/raw/main/config.json)

### Sourcing gap carried forward

- **Max output tokens are not publicly documented as of 2026-09-08.**
- **A structured-output path is not publicly documented as of 2026-09-08** — Ai2 documents none; anything available belongs to the serving stack, not the model contract.
- **Whether `<think>` traces should be replayed or stripped across turns is not publicly documented as of 2026-09-08.**
- **Parallel tool calls, tool-ID semantics, and prompt caching are not publicly documented as of 2026-09-08.**
- **No deprecation policy exists**, and the release-notes page itself stops at May 2025 with no Olmo 3 entries.
- **Retention and residency for the three third-party serving providers are not documented by Ai2** — trace them at the provider.
- **Refresh warning for the next research pass:** the live docs host is **`docs.allenai.org`** (`allenai.org/documentation` 302-redirects there), **not** `docs.allen.ai` — and `docs.allenai.org` is a **client-rendered SPA**. A plain fetch of any subpage, including `.md` variants and `llms-full.txt`, returns the site's intro shell rather than the page. Five of the sources above required a real browser. A fetch-only re-verification will wrongly conclude Ai2 documents nothing.
