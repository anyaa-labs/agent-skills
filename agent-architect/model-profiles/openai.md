---
family: openai
access: open-weight
scope: global
researched_date: 2026-09-08
---

# OpenAI GPT, Reasoning, and Realtime

### API surface

- The Responses API is the documented surface for current models. OpenAI's own migration guide states plainly: **"Starting with GPT-5.4, Chat Completions does not support tool calling with `reasoning_effort` values other than `none`."** Chat Completions still exists and still does function calling, but not while reasoning effort is active — for any agentic system on a current OpenAI reasoning model, Responses is effectively mandatory.
- Use Agents SDK when application code owns orchestration, state, tools, approvals, handoffs, guardrails, or tracing.
- Use sandbox agents when files, commands, packages, ports, artifacts, snapshots, mounts, or human review are part of the product.
- **The Agent Builder product, the Evals dashboard, and the `/v1/prompts` reusable-prompts API are being shut down** (announced 2026-06-03, sunset 2026-10-31 → 2026-11-30 depending on component). Any architecture guidance that assumed OpenAI Agent Builder as a harness option is stale — plan a migration to Agents SDK or a custom orchestration layer instead.

### Reasoning state

This is the dominant failure mode in OpenAI agent loops:

- `reasoning.effort` accepts `none`, `minimal`, `low`, `medium`, `high`, `xhigh`, `max`. **`gpt-6-astra` rejects `none` with a 400** — it always reasons at some level.
- `reasoning.summary` (set to `"auto"` for the most detailed available summarizer) returns summaries in the `summary` array of the `reasoning` output item. Opt-in.
- **When using function calling, you must pass back the reasoning items returned with the last function call, plus all subsequent reasoning and function-output items.** Omitting them breaks reasoning continuity and wastes tokens.
- `previous_response_id` is the simplest stateful integration and carries reasoning across turns automatically.
- With `store: false` or Zero Data Retention, reasoning items carry an `encrypted_content` property by default; replay the encrypted tokens on subsequent calls to preserve reasoning without server-side storage. **This is the ZDR-compatible path and must be wired explicitly** — it does not happen for free.

### Tool semantics

- Hosted tools in the Responses API, by `type`: `web_search`, `file_search` (over vector stores), `tool_search` (deferred tool definitions — **only `gpt-5.4` and later support it**), `mcp` (remote MCP servers), and `function` for custom tools. Shell, computer use, image generation, and skills capabilities are referenced on the tools guide without full per-model specification — do not assert which models support them.
- Custom function tools take `strict: true` with `additionalProperties: false` for schema enforcement.
- Tool calls are trace objects, not just generated JSON — preserve call IDs, outputs, and reasoning items together across a multi-step tool loop.
- **OpenAI's `tool_search` and Anthropic's tool search tool solve the same context-bloat problem with the same deferred-definition mechanic.** A model-agnostic harness can abstract over both: discover and load tool definitions on demand rather than preloading a full MCP catalog, especially once a loadout crosses into double-digit tool counts.

### Modality support

- GPT-6 Astra and the GPT-5.6 family (Sol, Terra, Luna) cover text and image input, text output, multilingual capabilities, and vision.
- **GPT-6 Astra** is OpenAI's stated "most capable model, built for the hardest end-to-end work." The research brief does not document a specific computer-use/browsing/Codex-session emphasis for it beyond that purpose string and the `reasoning.effort` behavior below — treat any such emphasis as unverified rather than vendor-documented (see Sourcing gap carried forward).
- Specialized modality models: `gpt-image-2` (image generation), `gpt-realtime-2.1` / `gpt-realtime-2.1-mini` (voice/realtime, with reasoning), `gpt-transcribe` / `gpt-live-transcribe` (speech-to-text), `gpt-realtime-translate` (speech translation), `gpt-audio-1.5` (documented replacement for the retired `gpt-audio` family), `gpt-5.6-cyber` (cybersecurity).

### Context behavior

- Large context does not remove the need for relevance selection. Long conversations still need phase-aware handoffs and trace summaries.
- Treat cached/static context and per-turn dynamic state as separate cost surfaces.
- GPT-6 Astra and the GPT-5.6 family carry a 1.05M-token context window with a 128K max output.

### Structured output path

- Use strict schemas for tool definitions and structured outputs where supported.
- For non-tool JSON, validate output before persistence or downstream actions.

### Deployment & residency

- OpenAI documents data residency across **10 regions**: United States, Europe (EEA + Switzerland), Australia, Canada, Japan, India, Singapore, South Korea, United Kingdom, United Arab Emirates.
- **Only three of those regions offer regional processing — United States, Europe, and the UAE. The other seven (Australia, Canada, Japan, India, Singapore, South Korea, United Kingdom) provide regional storage only, not regional inference.** This is load-bearing for a sovereignty audit: "data residency in India," for example, means storage in India, not inference in India.
- The UAE's regional processing is both model- and endpoint-limited and requires additional approval: `/v1/chat/completions` (`gpt-5.6-luna`, `gpt-5.5-2026-04-23`, `gpt-5.2-2025-12-11`), `/v1/responses` (adds `gpt-5.5-pro-2026-04-23`), and `/v1/embeddings` (`text-embedding-3-large`) — every other model and endpoint in the UAE is storage-only.
- Non-US regions require approval for abuse-monitoring controls; image support in these regions requires approval for enhanced ZDR or enhanced modified abuse monitoring.
- Eligible endpoints for residency controls: `/v1/chat/completions`, `/v1/responses`, `/v1/batches`, `/v1/embeddings`, `/v1/audio`, `/v1/images`, `/v1/fine_tuning/jobs`, `/v1/moderations`, `/v1/realtime`.
- **Regional processing can be selected per request, not only per project.** OpenAI: "As an alternative to creating a region-specific project, you can select regional processing for an individual request by using the prefixed domain with an API key from a project having Global geography" — e.g. `us.api.openai.com` / `eu.api.openai.com`. Eligibility and retention requirements still apply, and the selected endpoint *and* model must support regional processing.
- **Audit consequence: "our project is EU-pinned" is no longer a sufficient answer.** Residency is now determined by the base URL each call actually uses, so a single Global-geography key can emit both in-boundary and out-of-boundary traffic depending on which client instance issued the request. Check the base URL at every call site, not just the project's geography setting — and treat a mixed-residency workload sharing one Global key as the specific shape to look for.
- Zero Data Retention excludes customer content from abuse-monitoring logs and **forces `store` to be treated as `false` even when the request sets it to `true`**. Requires prior OpenAI approval.
- Responses API default retention is **30 days** when `store` is omitted or true. Background mode stores data for roughly 10 minutes to enable polling.

### Version-specific notes

- **GPT-6 Astra** (`gpt-6-astra`): OpenAI's stated "most capable model, built for the hardest end-to-end work." Reasoning effort `low`/`medium`/`high`/`xhigh`/`max` — **`none` is rejected with a 400**, so a low-latency path that assumes reasoning can be turned fully off will not work on this model. Confirm rollout availability before depending on it in production: it should be treated as a different architectural bet than a GA flagship until its availability status is confirmed at build time, not assumed from this profile. Cost tier: $$$$.
- **GPT-5.6 Sol** (`gpt-5.6-sol`, alias `gpt-5.6`): Flagship for complex professional work. Use Responses API for best reasoning/tool performance; preserve reasoning items across tool calls, and in stateless/ZDR mode include and replay encrypted reasoning content. Cost tier: $$$$.
- **GPT-5.6 Terra** (`gpt-5.6-terra`): Balances intelligence and cost — the default production reasoning model for most agentic workflows. Cost tier: $$$.
- **GPT-5.6 Luna** (`gpt-5.6-luna`): Cost-sensitive workloads; also one of the three models on OpenAI's UAE regional-processing allowlist. Cost tier: $$.
- **GPT-realtime-2.1 / GPT-realtime-2.1-mini, GPT-realtime-translate, GPT-transcribe / GPT-live-transcribe, GPT-audio-1.5**: Voice/audio runtime models, including a reasoning-capable realtime line. Evaluate VAD, interruption, live tool timing, transcript drift, and fallback behavior separately from text agents. Cost tier: varies by audio usage.
- **GPT-5.6-cyber**: Specialized cybersecurity model — treat as a narrow-purpose deployment, not a general worker substitute.
- **Deprecated generation (GPT-5.x pre-5.6, o3)**: deprecated 2026-06-11, shut down 2026-12-11 — see Retired below. Anyone still on `gpt-5-*` or `o3-*` has a live model with a migration deadline, not a dead endpoint; do not carry forward mitigations written for those IDs without re-validating against the GPT-5.6 family.

### Known production failure modes

- Reasoning state dropped across tool calls.
- Generic Chat Completions endpoint used for a workflow that needs SDK state, background execution, approvals, or sandbox artifacts — or used with a reasoning-effort value it no longer supports (anything but `none` on GPT-5.4 and later).
- Realtime voice paths without VAD, interruption, transcript, or fallback contracts.
- Legacy prompt scaffolding retained after a model upgrade without eval — especially scaffolding built around the GPT-5 (pre-5.6) or o3 generation, which is deprecated but not shut down until 2026-12-11.
- Harness code still targets Agent Builder, the Evals dashboard, or `/v1/prompts` after their announced shutdown.
- A UAE deployment assumes regional *processing* everywhere the region is listed for residency, when in fact only three models on three endpoints qualify.

### Harness requirements

- Prefer Responses API for reasoning agents; use Agents SDK when application code owns orchestration, state, tools, approvals, handoffs, or observability.
- Preserve reasoning items with function-call outputs. In stateless/ZDR mode, request encrypted reasoning content and replay it with subsequent turns.
- Use sandbox agents when files, commands, packages, ports, artifacts, snapshots, mounts, or human review are part of the product.
- For realtime voice, define turn-taking, transcript source of truth, tool timing, and fallback channels.
- Before relying on `tool_search`, confirm the model is `gpt-5.4` or later.
- Before deploying to a non-US, non-EU, non-UAE region, confirm whether the requirement is data *storage* or data *processing* — OpenAI's residency page only guarantees the former outside those three regions.

### Retired / migration targets

| Announced | Shutdown | Models | Replacement |
| --- | --- | --- | --- |
| 2026-08-26 | 2027-02-26 | `whisper-1`, `gpt-4o-transcribe`, `gpt-4o-mini-transcribe`, `gpt-4o-transcribe-diarize` | `gpt-live-transcribe` or `gpt-transcribe` |
| 2026-07-20 | 2027-01-20 | `gpt-realtime`, `gpt-audio`, `gpt-4o-audio`, `gpt-realtime-mini`, `gpt-audio-mini` | `gpt-realtime-2.1`, `gpt-audio-1.5` |
| 2026-06-11 | 2026-12-11 | `gpt-5-2025-08-07`, `gpt-5-mini-2025-08-07`, `gpt-5-nano-2025-08-07`, `gpt-5-pro-2025-10-06`, `o3-2025-04-16`, `o3-pro-2025-06-10` | `gpt-5.6-sol`, `gpt-5.6-terra`, `gpt-5.6-luna` |
| 2026-06-03 | 2026-10-31 → 2026-11-30 | `/v1/prompts` API, Evals dashboard, Agent Builder | Migrate orchestration to Agents SDK or a custom harness; no drop-in model replacement |
| 2026-06-02 | 2026-12-01 | `gpt-image-1-mini`, `gpt-image-1.5`, `chatgpt-image-latest` | `gpt-image-2` |
| 2026-04-22 | 2026-10-23 | `gpt-3.5-turbo-0125`, `gpt-4-0613`, `gpt-4-1106-preview`, `gpt-4-turbo`, `gpt-4.1-nano`, `gpt-4o-2024-05-13`, `gpt-image-1`, `o1-2024-12-17`, `o1-pro-2025-03-19`, `o3-mini-2025-01-31`, `o4-mini-2025-04-16` | `gpt-5.6-*` / `gpt-image-2` |
| 2026-03-24 | 2026-09-24 | `sora-2`, `sora-2-pro`, Videos API | None announced as of 2026-09-08 |
| 2025-09-26 | 2026-09-28 | `gpt-3.5-turbo-instruct`, `babbage-002`, `davinci-002`, `gpt-3.5-turbo-1106` | `gpt-5.6-terra` |
| 2025-08-26 | **2026-08-26 — already past** | Assistants API (`/v1/assistants`, `/v1/threads`) | Responses API + Conversations API |

**`o3` is deprecated, not yet shut down**: `o3-2025-04-16` and `o3-pro-2025-06-10` were deprecated 2026-06-11 and are scheduled to shut down 2026-12-11 (94 days out as of this writing) — replaced by the GPT-5.6 family. Anyone currently running `o3-2025-04-16` has a live model and a migration deadline, not a dead endpoint; treat this as an active-migration item, not a historical note. **The base, un-dated `gpt-4o` and `gpt-4.1` aliases do not appear in the OpenAI-owned deprecations page fetched for this pass** — only specific dated snapshots are listed as retiring (`gpt-4o-2024-05-13`, `gpt-4.1-nano`), and the audio-capable `gpt-4o-audio` variant is retiring separately (2026-07-20 → 2027-01-20, replaced by `gpt-audio-1.5`). Treat the current status of the bare `gpt-4o` / `gpt-4.1` aliases as **not verified as of 2026-09-08** rather than asserting they are fully retired or still GA — check the live deprecations page before reporting a finding against them. GPT-4.5 does not appear anywhere in the sourced deprecations page or models list; do not assert a GPT-4.5 retirement date.

**The Assistants API row is the only *completed* shutdown in this table, and that changes the finding's severity.** Every other row is a future date, so the finding is "plan a migration". The Assistants API shut down on **2026-08-26**, so `/v1/assistants` and `/v1/threads` calls **fail outright today** — this is a live outage in the audited system, not a deprecation warning. Grep for `assistants.create`, `/v1/assistants`, `/v1/threads`, `openai.beta.assistants`, and `openai.beta.threads`; any hit is CRITICAL. Note the long tail here: it was announced a full year ahead (2025-08-26), which is exactly why a system can still be carrying it — the warning arrived long before anyone's current sprint.

### Re-evaluate when

- Changing between Chat Completions and Responses.
- Changing reasoning effort or moving to/from a `-pro` variant.
- Adding realtime voice or hosted/sandbox tools.
- Changing storage mode, ZDR, or stateless conversation handling.
- Any harness dependency on Agent Builder, the Evals dashboard, or `/v1/prompts` — these are being shut down.

### Open-weight: gpt-oss

Folded into this profile rather than a separate family file — same vendor, and its one load-bearing operational fact is short enough to live here.

- **Models**: `openai/gpt-oss-120b` (117B total / 5.1B active MoE, last updated 2025-08-26), `openai/gpt-oss-20b` (21B total / 3.6B active, runs within 16GB memory, last updated 2025-08-26), `openai/gpt-oss-safeguard-120b` (updated 2025-10-29) and `openai/gpt-oss-safeguard-20b` (updated 2026-01-14) for safety-reasoning/content-labeling use cases. License: **Apache-2.0**.
- **The harmony response format is mandatory.** OpenAI states these models were trained on it and "should only be used with the harmony format as it will not work correctly otherwise." Calling `model.generate` directly requires applying it via the chat template or the `openai-harmony` package — this is the highest-risk self-hosting fact in the family.
- Reasoning effort is **Low / Medium / High, set in the system prompt** (literally `Reasoning: high`), not an API parameter — a different control surface than the hosted `reasoning.effort` field on GPT-5.6/GPT-6.
- Capabilities: function calling with defined schemas, built-in web browsing, Python execution, structured outputs.
- Deployment: vLLM (`vllm serve openai/gpt-oss-20b` — no documented tool-call-parser or reasoning-parser flag; the harmony format is expected to carry that structure), Transformers (including an OpenAI-compatible Serve option), Ollama, LM Studio, llama.cpp; the safeguard card adds SGLang and Docker Model Runner. MXFP4 quantization of MoE weights enables single-80GB-GPU deployment of the 120b variant.
- **Context window is not stated on any vendor page successfully fetched — not verified as of 2026-09-08** (`openai.com/index/introducing-gpt-oss/` returned HTTP 403). Do not assert a context-window number for gpt-oss.
- **No deprecation or retirement notices exist for any gpt-oss repo as of 2026-09-08.** Nothing has been removed from the HuggingFace org; residency is not applicable to a self-hosted open-weight release.

### Primary sources

- [OpenAI models](https://developers.openai.com/api/docs/models)
- [OpenAI deprecations](https://developers.openai.com/api/docs/deprecations)
- [Reasoning guide](https://developers.openai.com/api/docs/guides/reasoning)
- [Tools guide](https://developers.openai.com/api/docs/guides/tools)
- [Migrate to Responses](https://developers.openai.com/api/docs/guides/migrate-to-responses)
- [Your data](https://developers.openai.com/api/docs/guides/your-data)
- [OpenAI HuggingFace org](https://huggingface.co/openai)
- [gpt-oss-120b](https://huggingface.co/openai/gpt-oss-120b)
- [gpt-oss-20b](https://huggingface.co/openai/gpt-oss-20b)

### Sourcing gap carried forward

`help.openai.com`'s model-release-notes page (the source named in the original research task) returned HTTP 403 and was not reachable; the retirement facts above come from the OpenAI-owned deprecations page instead. The tools guide does not enumerate per-model support for computer use, shell, image generation, or skills — treat those as referenced but unspecified per model. Realtime/voice runtime contract details (session limits, VAD, interruption semantics) were not fetched in the research pass and are not asserted here. **GPT-6 Astra's computer-use/browsing/software-engineering/Codex-session-continuity emphasis is not in the research brief** — it appears only in a pre-research planning document, not in any vendor page the brief cites. The brief supports only the purpose string ("our most capable model, built for the hardest end-to-end work") and the `reasoning.effort` `none`→400 behavior. Do not represent the broader emphasis as vendor-documented until it is independently verified.
