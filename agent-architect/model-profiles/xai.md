---
family: xai
tier: frontier
researched_date: 2026-09-08
---

# Grok (xAI)

**Detection note.** The documentation site is now branded **"SpaceXAI Docs"** and model pages describe Grok as "SpaceXAI's" model, while the API host (`https://api.x.ai/v1`), console (`console.x.ai`), SDK (`xai_sdk`), and key variable (`XAI_API_KEY`) are unchanged. Detect on the host and the `grok-*` slugs, not the vendor name in prose.

### API surface

- Base URL `https://api.x.ai/v1`. The **Responses API is the recommended surface**. The Chat Completions page opens with a warning that it "is offered as a legacy endpoint. New features will come to the [Responses API] first," and xAI's own comparison table marks Chat Completions "(Deprecated)."
- The gap is agentic, not cosmetic. On Chat Completions, xAI documents **no reasoning content returned** and **function calling only** — none of the server-side tools (web search, X search, code execution, remote MCP). **Any agentic Grok system belongs on Responses.**
- Three client paths: the **OpenAI SDKs pointed at `api.x.ai/v1`** (OpenAI-compatible, including `client.responses.create`), the native `xai_sdk` over **gRPC**, and raw REST. A separate gRPC API is documented, plus a **WebSocket Responses mode** aimed at lower end-to-end latency on tool-heavy agent loops.
- Also documented: Batch API, deferred completions, mTLS authentication, and `service_tier: "priority"` for per-request scheduling priority.
- **Grok Build** (coding agent — TUI, headless, Agent Client Protocol; skills, plugins, MCP servers, hooks, subagents, sandbox, background tasks) and **Grok Bot** (persistent cloud-computer teammates) are product harnesses over the same models, not additional API surfaces. Treat "we use Grok Build" as a harness decision to audit, the same way Claude Managed Agents or an SDK loop would be.

### Reasoning state

- `reasoning_effort` (`reasoning.effort` on Responses) accepts `low`, `medium`, `high`, `xhigh`. **It defaults to `high`, and on `grok-4.6` and `grok-4.5` reasoning cannot be disabled.** `grok-4.3` additionally accepts `none`. On models without `xhigh` (`grok-4.5`), `xhigh` is **silently treated as `high`** — no error.
- **`presence_penalty`, `frequency_penalty`, and `stop` cannot be used with reasoning models; requests including them return an error.** A cross-provider harness that sets stop sequences generically hard-fails on Grok.
- Reasoning content is **encrypted by xAI** and returned only on request — `include: ["reasoning.encrypted_content"]` (Responses) or `use_encrypted_content=True` (xAI SDK / gRPC). You pass it back to carry reasoning into a later request. This is also the documented way to preserve **agentic tool-calling state** when the stateful path is unavailable.
- The stateful path is `previous_response_id`, and **responses are stored server-side for 30 days**. xAI's own instruction: to continue a conversation after 30 days, store the response history and the encrypted thinking content locally and pass them in a new request body. **A long-lived agent built on `previous_response_id` alone has a 30-day cliff.**
- `grok-4.6` exposes **summarized** reasoning, streamed as `response.reasoning_text.delta` / `response.reasoning_summary_text.delta` (`chunk.reasoning_content` in the xAI SDK). Usage reports `reasoning_tokens`.
- **On `grok-4.20-multi-agent`, `reasoning.effort` does not set reasoning depth — it sets how many agents collaborate** (`low`/`medium` → 4 agents, `high`/`xhigh` → 16; `agent_count` in the xAI SDK). Sub-agent reasoning, tool calls, and outputs are returned only when `use_encrypted_content` is set, and every sub-agent token and tool call is billed. A harness that sweeps `reasoning_effort` as a generic cost dial quadruples its fan-out on this model without meaning to.

### Tool semantics

- Two categories, and the split defines the execution loop: **built-in (server-side) tools run on xAI's servers automatically** — `web_search`, `x_search`, `code_execution`, image generation, `collections_search`, remote MCP — while **custom function tools pause execution and hand control back to the caller.**
- `tool_choice` accepts `"auto"` (default), `"required"`, `"none"`, or a named function. `parallel_tool_calls` defaults to **true**.
- **Maximum 200 tools per request.** A tool's `parameters` root must be an object, or an `anyOf`/`oneOf` whose every branch is an object; anything else "cannot be compiled into a tool-call grammar and is rejected with a `400` error that names the tool."
- **Server-side tool outputs are not returned in the API response** — only the invocations. `tool_calls` lists every *attempted* call; `server_side_tool_usage` lists only the successful, billable ones. **A trace layer that reconstructs the trajectory from the API response alone is missing every server-side tool result**, which matters directly for the Evaluation and Harness dimensions.
- `max_turns` caps **assistant turns in the server-side loop, not tool calls** (one turn may fan out to many parallel calls). **A client-side tool call resets the counter** — the request completes, and the follow-up starts with a fresh `max_turns` budget. `max_turns` is therefore not a global step budget for a mixed client/server agent; a real budget must be enforced by the caller.
- **With streaming, a function call arrives whole in a single chunk** rather than streamed across chunks — do not build incremental argument parsing against it.
- **Remote MCP:** configured in `tools` with `server_url`, `server_label`, optional `server_description`, `allowed_tools` (`allowed_tool_names` in the xAI SDK), `authorization`, `headers`. Supported in the xAI SDK, the OpenAI-compatible Responses API, and the Speech-to-Speech API. **Only Streamable HTTP and SSE transports.** The OpenAI Responses parameters **`require_approval` and `connector_id` are not supported** — a provider-side approval gate a portable harness expects must be implemented client-side. **Omitting `allowed_tools` injects every tool the MCP server exposes into context**; xAI's own guidance is to filter for context cost and to keep write-capable tools out of reach. This is Pattern 23 (tool loadout) stated by the vendor.
- Token accounting differs from plain chat: `completion_tokens` counts only the final text output, `prompt_tokens` is cumulative across every internal inference step, `cached_prompt_text_tokens` reports cache service.

### Modality support

- **Chat models: text and image input, text output.** Image limits are 20 MiB, `jpg`/`jpeg`/`png` only, **no limit on image count**, any image/text ordering, with `detail` of `auto` (default) / `low` / `high`. No audio or video *input* is claimed for the text models — do not assert it.
- **Imagine** (generated media): image generation up to 10 images per request with a `quality` of `auto` (default; resolves to `low` for generation, `medium` for editing), `low`, or `medium`; image editing with up to 5 reference images; text-to-video, image-to-video, and reference-to-video up to 15s; video editing; video extension. **Video is asynchronous** — start, poll by request ID, fetch.
- **Voice**: speech-to-speech over **WebSockets** with tool use and remote MCP, **ephemeral tokens** for client-side apps, SIP phone-call support; text-to-speech with inline speech tags and telephony μ-law output; speech-to-text in 25 languages with word-level timestamps, multichannel, diarization, a tunable `vad_threshold`, and "Smart Turn" end-of-turn prediction; custom voice cloning yielding a `voice_id` usable across TTS and speech-to-speech. When Discovery detects `grok-voice-*` or the speech-to-speech WebSocket, the Multimodal Architecture dimension applies.

### Context behavior

- 500K on `grok-4.6` / `grok-4.5`; 1M on the `grok-4.3` and `grok-4.20` lines; 256K on `grok-build-0.1`.
- **Long-context pricing steps up at a 200K prompt-token threshold and is then billed at the higher rate for every token in the request** — a cost cliff, not a ramp. A long agent loop that drifts past the threshold roughly doubles unit cost with no signal.
- **Prompt caching is automatic**, but xAI "highly recommend[s]" setting `prompt_cache_key` (Responses) or the `x-grok-conv-id` header (Chat Completions), because it routes a conversation's requests to the same server; without it "you often pay full input price on a cache-cold server."
- **Context Compaction** (`POST /v1/responses/compact`) returns a single opaque `compaction` item (`encrypted_content`, `object: "response.compaction"`, `usage.dropped_message_count`) standing in for the whole prior conversation. Rules: treat the blob as opaque, never parse or hand-merge it; **use the compaction item as the head of the next request and append new turns after it, never before**; one compaction per call; re-compaction is allowed; and **compaction cannot rescue a request already over the limit** — it shrinks a conversation that still fits. The xAI SDK exposes in-place `chat.compact()`.
- Silent degradation: **`logprobs` and `top_logprobs` are unsupported on `grok-4.20` and newer and "will be silently ignored if set."** A confidence-gating or routing layer reading logprobs degrades to nothing without an error.

### Structured output path

- `response_format.type` accepts `"json_schema"` (with `response_format.json_schema`), `"json_object"`, or `"text"` (default).
- **Tool-call arguments always conform strictly to the tool's input schema — "the `strict` flag is implicitly always `true`."** Strictness is not opt-in here, unlike several other families; a harness that only trusts schemas when it sets a `strict` flag is under-using this.
- Documented subset: Draft 2020-12 preferred, Draft-07 accepted. **`additionalProperties` defaults to `false` and must be set to `true` explicitly.** `format` is enforced only for `date`, `time`, `date-time`, `email`, `uuid`, `ipv4`, `ipv6`, `uri`.
- **Constraints are guaranteed only up to `minLength`/`maxLength` 2,048, `minItems`/`maxItems` 256, `minProperties`/`maxProperties` 64. Beyond those thresholds the schema is still accepted, but conformance falls back to model behavior rather than the output engine** — a silent-degradation shape, not a rejection. Validate downstream when a schema exceeds them.
- Accepted but not structurally enforced: `not`, `if`/`then`/`else`, multi-subschema `allOf`, unlisted `format` values. Rejected with 400: empty `enum`/`anyOf`, boolean property schemas, `maxContains`/`minContains`, and `items` as an array (use `prefixItems`).

### Deployment & residency

- **Retention default: every API request and response is stored encrypted at rest for 30 days for abuse auditing, then deleted.** xAI states it "never trains on your API inputs or outputs without your explicit permission."
- **Zero Data Retention is team-wide, self-serve from the console, and cannot be scoped to individual API keys.** xAI explicitly does *not* recommend it for most customers because it disables every stored-data feature: per-key request logging, the **stateful Responses API** (`store_messages`, `previous_response_id`), Files, Collections, Batch, deferred completions, stored image/video outputs (images become base64-only; video requires supplying your own `output.upload_url`), and voice-agent conversation history. Under ZDR the client owns conversation history and must set `use_encrypted_content` to keep agentic tool-calling state. **ZDR and a `previous_response_id`-based agent loop are mutually exclusive** — that is an architecture decision, not a config toggle.
- Every API response carries an **`x-zero-data-retention` header** (`"true"`/`"false"`), so ZDR posture is programmatically assertable at runtime. A residency-sensitive harness should assert on it rather than trust a console setting.
- Compliance: **SOC 2 Type 2**; HIPAA BAA via a questionnaire at `x.ai/legal/baa`; `trust.x.ai` is NDA-gated. The Voice and Imagine overview pages additionally claim HIPAA eligibility, GDPR compliance, and that audio and generated media are never stored or used for training.
- **Partner platforms.** **Google Cloud Vertex AI** — partner model via Model Garden (publisher xAI), OpenAI-compatible including the Responses API, publisher-prefixed IDs such as `xai/grok-4.6`; retention governed by Google Cloud Vertex AI policy, not xAI's. **Microsoft Foundry** — Azure-managed endpoints, Microsoft Entra ID / RBAC, serverless or PTU SKUs, billed via Azure Marketplace; **the deployment name you choose becomes the `model` value**, so a Grok deployment can appear in code under a string that contains no `grok` substring at all. The `grok-4.6` page also names Cursor and the OpenRouter, Vercel, and Cloudflare gateways.
- **Residency is the weakest-documented area of this family.** "EU data residency options" and "regional processing" are claimed on the Voice and Imagine overview pages without naming a single region, and one release note records Grok 4.5 becoming available in the API console for EU users. **No region list, no per-endpoint or per-model residency matrix, and no processing-vs-storage distinction is published on any xAI-owned page.** Do not assert an xAI processing region for any workload; if a residency obligation exists, treat this as an open question for the vendor, not a satisfied requirement.
- **No self-hosting path is documented.** There is no local-deployment page, no vLLM/SGLang parser flag, and no chat-template guidance. Treat Grok as **API-only**.

### Known production failure modes

- **A pinned retired slug that still works.** After the 2026-05-15 retirement the old slugs continue to resolve and are silently redirected to `grok-4.3` at a reasoning effort xAI chose. A `grok-3` or `grok-4-fast-reasoning` string in config looks healthy while running a different model at different cost and behavior. Grep for retired slugs and treat a working integration as a finding, not as evidence of health.
- **Agentic work left on Chat Completions**, losing reasoning content and every server-side tool, usually because the integration predates the Responses migration.
- **`previous_response_id` as the only conversation store**, with no local copy of history plus encrypted reasoning — silently fine until the 30-day boundary or a ZDR change.
- **ZDR enabled on a team whose agent loop depends on stored state**, breaking Files, Collections, Batch, deferred completions, and the stateful Responses path at once.
- **`max_turns` mistaken for a global step budget** in a mixed client/server tool system, where every client-side call resets it — an unbounded agent that looks bounded.
- **Traces reconstructed from API responses only**, missing server-side tool outputs entirely, so evaluation scores a trajectory it cannot actually see.
- **A generic `reasoning_effort` sweep applied to `grok-4.20-multi-agent`**, silently changing agent count (4 → 16) and cost rather than reasoning depth.
- **Stop sequences or presence/frequency penalties set portably**, which error out on reasoning models.
- **`logprobs`-based routing or confidence gating** that is silently ignored on current models.
- **Remote MCP wired without `allowed_tools`**, injecting a server's full tool catalog — including write-capable tools — into every request's context.
- **A schema past the enforced constraint limits** (`maxLength` > 2,048, `maxItems` > 256, `maxProperties` > 64) trusted as guaranteed when conformance has quietly fallen back to model behavior.
- **Cost drift across the 200K prompt-token threshold** in a long agent loop, re-pricing the entire request.

### Harness requirements

- Put agentic workloads on the **Responses API**; treat any Chat Completions agent loop as a migration finding.
- **Own conversation state locally** — history plus encrypted reasoning content — even when using `previous_response_id`, so the 30-day boundary and any future ZDR switch are non-events.
- Set `prompt_cache_key` (or `x-grok-conv-id`) on every request in a conversation; without it caching is unreliable.
- Enforce a **caller-side step budget**; do not rely on `max_turns` alone in a mixed client/server tool system.
- Capture `tool_calls` **and** `server_side_tool_usage`, and record explicitly that server-side tool outputs are unavailable, so the trace's known blind spot is documented rather than discovered during an incident.
- Filter remote MCP surfaces with `allowed_tools`; never attach a server without one.
- Reach for **Context Compaction** on long loops, and treat the returned compaction item as the immutable head of the next request.
- Assert on the `x-zero-data-retention` response header if retention posture is a requirement.
- Pin dated model slugs (`<modelname>-<date>`) where behavioral stability matters; `<modelname>` and `<modelname>-latest` move.
- Validate structured output downstream whenever a schema exceeds the documented enforcement thresholds.

### Retired / migration targets

| Effective | Retired model | Replacement |
| --- | --- | --- |
| 2026-05-15, 12:00 PM PT | `grok-4-1-fast-reasoning`, `grok-4-fast-reasoning`, `grok-4-0709` | `grok-4.3` with **`low`** reasoning effort |
| 2026-05-15, 12:00 PM PT | `grok-4-1-fast-non-reasoning`, `grok-4-fast-non-reasoning`, `grok-3` | `grok-4.3` with **`none`** reasoning effort |
| 2026-05-15, 12:00 PM PT | `grok-code-fast-1` | `grok-build-0.1` |
| 2026-05-15, 12:00 PM PT | `grok-imagine-image-pro` | `grok-imagine-image-quality` |
| 2026-11-02 | `grok-imagine-image-quality` | `grok-imagine-image-2.0` with `quality` set to `low` |
| deprecated, no date given | `grok-voice-think-fast-1.0` | `grok-voice-think-fast-2.0` |

**The mechanic matters more than the list.** xAI documents that retired slugs "continue to resolve, so you do not need to change your code to avoid breakage" — requests are redirected to the replacement at a reasoning effort xAI selects, and billed at the replacement's price. This is the opposite of the loud failure most families produce on a retired ID, and it is why a retired slug in config is a finding even when production is green.

### Version-specific notes

- **`grok-4.6`** — 500K context, knowledge cutoff 2026-02-01, text + image in / text out, **no text output limit**, reasoning `low`/`medium`/`high` (default) / `xhigh`. Announced 2026-08-12 and explicitly positioned for "long-running agents," with self-testing and verification behavior called out. The default model of Grok Build. xAI's recommendation for code and chat. Cost tier: $$$.
- **`grok-4.5`** — 500K context, same shape, no `xhigh` (requests asking for it get `high`). Cost tier: $$$.
- **`grok-4.3`** — 1M context, the only current text model that accepts `none` reasoning effort, and the redirect target for the May 2026 retirements. Cost tier: $$.
- **`grok-4.20-0309-reasoning` / `-non-reasoning`** — 1M context, dated slugs, split by reasoning mode rather than by an effort parameter. Cost tier: $$.
- **`grok-4.20-multi-agent-0309`** — 1M context, **beta** (xAI warns the interface may include breaking changes). A leader agent synthesizes 4 or 16 sub-agents; only the leader's tool calls and final response are returned unless `use_encrypted_content` is set. Every sub-agent token and tool call is billed. Multi-turn works via `previous_response_id`. Cost tier: $$$ and highly variable — a single request can cost many times a single-agent one.
- **`grok-build-0.1`** — 256K context, trained for agentic coding, the replacement for `grok-code-fast-1`. Reasoning-effort support is not documented. Cost tier: $$.
- **Aliasing:** `<modelname>` → latest stable, `<modelname>-latest` → newest including new features, `<modelname>-<date>` → pinned. Only the dated form is stable.

### Re-evaluate when

- Migrating between Chat Completions and the Responses API, or adopting the WebSocket Responses mode.
- Changing `reasoning_effort`, or routing any traffic to `grok-4.20-multi-agent` where that parameter changes meaning.
- Enabling or disabling Zero Data Retention, or taking on a data-residency obligation (xAI publishes no region list — see below).
- Attaching remote MCP servers, or changing which tools `allowed_tools` admits.
- Introducing Context Compaction, or crossing the 200K prompt-token pricing threshold in normal operation.
- Adding Voice (speech-to-speech, TTS, STT) or Imagine surfaces, which bring the Multimodal Architecture dimension into scope.
- Moving to Google Cloud Vertex AI or Microsoft Foundry, where retention, IDs, and lifecycle are governed by the cloud provider rather than xAI.
- Any xAI retirement announcement — because the failure mode is a silent redirect, not an error.

### Primary sources

- [Models](https://docs.x.ai/developers/models)
- [Grok 4.6](https://docs.x.ai/developers/grok-4-6)
- [Grok 4.6 announcement](https://x.ai/news/grok-4-6)
- [Reasoning](https://docs.x.ai/developers/model-capabilities/text/reasoning)
- [Generate text (Responses API)](https://docs.x.ai/developers/model-capabilities/text/generate-text)
- [Comparison with Chat Completions](https://docs.x.ai/developers/model-capabilities/text/comparison)
- [Function calling](https://docs.x.ai/developers/tools/function-calling)
- [Tool usage details](https://docs.x.ai/developers/tools/tool-usage-details)
- [Advanced tool usage](https://docs.x.ai/developers/tools/advanced-usage)
- [Remote MCP tools](https://docs.x.ai/developers/tools/remote-mcp)
- [Structured outputs](https://docs.x.ai/developers/model-capabilities/text/structured-outputs)
- [Context compaction](https://docs.x.ai/developers/advanced-api-usage/context-compaction)
- [Prompt caching](https://docs.x.ai/developers/advanced-api-usage/prompt-caching)
- [Multi agent](https://docs.x.ai/developers/model-capabilities/text/multi-agent)
- [Voice overview](https://docs.x.ai/developers/model-capabilities/audio/voice)
- [Imagine overview](https://docs.x.ai/developers/model-capabilities/imagine)
- [Model retirement, 2026-05-15](https://docs.x.ai/developers/migration/may-15-retirement)
- [Security FAQ — retention and ZDR](https://docs.x.ai/developers/faq/security)
- [Google Cloud Vertex AI](https://docs.x.ai/developers/community/google-cloud-vertex-ai)
- [Microsoft Foundry](https://docs.x.ai/developers/community/microsoft-foundry)
- [Grok Build](https://docs.x.ai/build/overview)

### Sourcing gap carried forward

- **Data-residency regions are not publicly documented as of 2026-09-08.** "EU data residency options" and "regional processing" appear on the Voice and Imagine overview pages with no region named; there is no residency or regions page, and `trust.x.ai` is NDA-gated. Do not assert an xAI processing region.
- **Max output tokens are not publicly documented as of 2026-09-08** for any text model except `grok-4.6` ("No text output limit").
- **Knowledge cutoffs are not publicly documented as of 2026-09-08** for any text model except `grok-4.6` (2026-02-01).
- **No self-hosting or open-weights path is documented on `docs.x.ai`** — no local-deployment page, parser flags, or chat template. Treat Grok as API-only and do not import a self-hosting story from a third party.
- **`grok-build-0.1`'s reasoning-effort support is not publicly documented as of 2026-09-08.**
- Day-level release dates are unavailable except for Grok 4.6 (2026-08-12); the release-notes page is month-grained. Rate limits and per-model detail pages were not fetched.
