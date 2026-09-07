# Model Landscape Research Brief, 2026-09-08

Primary-source evidence pass for the `agent-architect` model profiles. Every claim below traces to a page the provider owns — its docs site, API reference, model card on its own HuggingFace org, changelog, or release blog. Aggregator blogs, leaderboards, and benchmark roundups were used only to decide what to search for and are never cited.

**Where a fact could not be traced to a provider-owned page, this brief records the gap rather than the fact.** Downstream tasks must copy from here and must not fill gaps from memory.

Excluded by scope: benchmark scores and pricing.

---

## Family reconciliation

Status of every family in the design doc's provisional inventory (`docs/superpowers/specs/2026-09-08-agent-architect-model-landscape-refresh-design.md`). **Read this before writing any profile.**

**Headline: all 14 provisional files are VERIFIED. Nothing was dropped at the family level.** Three changes to the inventory are recommended below, and one member of `regional-other.md` is dropped.

| Provisional file | Status | Note |
| --- | --- | --- |
| `anthropic.md` | **VERIFIED** | Lineup is entirely different from the 2026-06 reference. See gaps: the Mythos line is documented in compatibility lists but has no reachable capability table. |
| `openai.md` | **VERIFIED** | `help.openai.com` release notes (named in the task brief) returned 403; the OpenAI-owned deprecations page was used instead and is the better source. |
| `google.md` | **VERIFIED** | Two real gaps: per-model context windows live only on per-model pages (one fetched), and no residency guarantee is documented for the Gemini Developer API. |
| `deepseek.md` | **VERIFIED** | The 2026-06 deprecation claim is **correct**; two corrections recorded (exact time, and a mode-split mapping). |
| `qwen.md` | **VERIFIED** | The task brief's named source `qwen.readthedocs.io` is **stale** — it documents Qwen3 while the vendor ships Qwen3.8. Use QwenCloud + the HF org. |
| `moonshot.md` | **VERIFIED** | Docs moved to `platform.kimi.ai`. The brief's specific question about Kimi's tool-calling protocol has a **split answer** — documented for K2, not for K3. |
| `zhipu.md` | **VERIFIED** | Retirements are the one section that cannot be written: **no vendor deprecation page exists on either platform.** |
| `minimax.md` | **VERIFIED** | Most restrictive licensing of any family here; structured output is undocumented for current models. |
| `meta.md` | **VERIFIED, with a framing caveat** | Llama appears frozen. Meta's 2026 releases are the proprietary **Muse** line, and Meta publishes no statement on Llama's status. Write the profile as "frozen with a pivot," not as a current flagship. |
| `mistral.md` | **VERIFIED, with one blocker** | **Do not write Mistral API model ID strings from this brief except `mistral-large-2512`.** Two Mistral doc pages gave conflicting ID conventions. One verification pass against the API reference is required first. |
| `cohere.md` | **VERIFIED** | Richest runtime-contract documentation of any open-weight-adjacent family, and the most porting hazards (`tool_plan`, document-array tool results). |
| `sarvam.md` | **VERIFIED** | Managed-API residency is **unverified** — `www.sarvam.ai` and its trust center returned 403. Do not import India-residency or ISO/SOC claims. |
| `falcon.md` | **VERIFIED** | Two different licenses within the family; the Falcon-LLM License is **not** OSI-open. |
| `regional-other.md` | **VERIFIED, with one member dropped** | Jais 2, ALLaM, K2, SEA-LION, HyperCLOVA X, and Upstage all confirmed. **Sailor2 is DROPPED** — no Sailor2 content appears under `aisingapore` or `sea-lion.ai`; it is a separate project with no vendor-owned page reached. Also: **K2 Think is superseded by K2-Horizon**, so write the entry as "K2 (K2-Think / K2-Horizon)", not "K2 Think V2". |

### Recommended changes to the inventory

1. **ADD `ibm-granite.md`.** Not in the provisional list, but IBM Granite 4.2 has the **best-documented self-hosting contract of any family in this pass** — a clean three-way thinking switch via chat-template kwargs, exact vLLM and SGLang parser flags, and prescriptive sampling. It clears the three-primary-link bar comfortably (5 links). It is directly useful to the "what breaks when self-hosted" question the plan cares about.
2. **DO NOT add a Microsoft Phi file.** Verified as **THIN**: no tool-calling documentation on the current model card, no structured-output path, no parser flags, no deprecation policy, and only **2** reachable primary links — below the design's three-link bar. There is also **no Phi-5**, despite third-party claims. A short note in a combined file is the most it warrants.
3. **Fold OpenAI's open-weight `gpt-oss` line into `openai.md`** rather than creating a file. It is the same vendor, it has not been updated since 2025-08 (core) / 2026-01 (safeguard), and its one load-bearing fact — the mandatory **harmony response format** — is a paragraph, not a profile.

### Bar checks against the design's own rules

- The design requires **at least three primary-provider links per family file.** Every family above clears it except **Microsoft Phi (2)**, which is why it is not recommended for a file. Inside `regional-other.md`, **ALLaM carries only 2** — flag it with the explicit evidence caveat the design's risk section already prescribes.
- The design requires **eleven field headings** per family file. This brief supplies `### Current models`, `### Runtime contract notes`, `### Deployment & residency`, `### Retired`, and `### Primary sources`. The remaining headings (API surface, reasoning state, tool semantics, modality support, context behavior, structured output path, known production failure modes, harness requirements, re-evaluate when) are all **derivable from the runtime-contract notes below**, which were written with those fields in mind — but they are not pre-split. Tasks 4–7 do that split.

---
## Anthropic Claude

### Current models

| Model | Claude API ID | Alias | Thinking | Default effort | Context | Max output | Reliable knowledge cutoff | Retirement not sooner than |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Claude Fable 5.1 | `claude-fable-5-1` | `claude-fable-5-1` | Adaptive (always on) | `high` | 1M | 128K | Jun 2026 | 2027-09-01 |
| Claude Opus 5 | `claude-opus-5` | `claude-opus-5` | Adaptive | `high` | 1M | 128K | May 2026 | 2027-07-24 |
| Claude Sonnet 5 | `claude-sonnet-5` | `claude-sonnet-5` | Adaptive | `high` | 1M | 128K | Jan 2026 | 2027-06-30 |
| Claude Haiku 4.5 | `claude-haiku-4-5-20251001` | `claude-haiku-4-5` | Extended | not supported | 200K | 64K | Feb 2025 | 2026-10-15 |

- Anthropic's own recommendation on the overview page: start with Claude Opus 5 for most workloads; use Claude Fable 5.1 for demanding reasoning and long-horizon agentic work, or when evals on Opus 5 at higher effort still fall short.
- All current models support text and image input, text output, multilingual output, vision, and tool use. No audio or video input is listed on the overview page.
- Legacy but still available: Claude Fable 5, Claude Opus 4.8, Opus 4.7, Opus 4.6, Opus 4.5 (`claude-opus-4-5-20251101`), Sonnet 4.6, Sonnet 4.5 (`claude-sonnet-4-5-20250929`).
- A separate **Mythos** line exists (`claude-mythos-5-1`, `claude-mythos-5`, `claude-mythos-preview`) and appears in the compatibility lists on the effort, thinking, tool-search, programmatic-tool-calling, and compaction pages. It is not in the models-overview comparison table; its model pages redirect to `anthropic.com/glasswing`. `claude-mythos-preview` is deprecated with `claude-mythos-5` as the replacement. Treat Mythos as documented-but-out-of-band; no capability table for it was reachable on `platform.claude.com`.
- Every Claude model ID is a pinned snapshot, including the dateless IDs used from the 4.6 generation onward. For models before 4.6 the alias is a pointer to a dated ID.
- Cross-platform IDs differ: Bedrock uses `anthropic.claude-opus-5`-style IDs on its Messages-API endpoint; Google Cloud uses `claude-haiku-4-5@20251001`-style dated IDs; Microsoft Foundry and Claude Platform on AWS use the Claude API IDs.
- Model capabilities are queryable at runtime through the Models API, which returns `max_input_tokens`, `max_tokens`, and a `capabilities` object.
- 1M tokens is roughly 555k words on the tokenizer introduced with Claude Opus 4.7; models before it fit about 750k words in 1M tokens.
- On the Message Batches API, Opus 5, Sonnet 5, Opus 4.8, Opus 4.7, Opus 4.6, and Sonnet 4.6 support up to 300k output tokens with the `output-300k-2026-03-24` beta header.

### Runtime contract notes

**Effort.** Set `output_config.effort` to one of `low`, `medium`, `high`, `xhigh`, `max`. The API default is `high`, and passing `high` is identical to omitting the parameter. Effort applies to all output tokens — text, tool calls, and thinking — so lower effort produces fewer and terser tool calls. Not every model that supports `max` supports `xhigh`. Supported on `claude-fable-5-1`, `claude-mythos-5-1`, `claude-fable-5`, `claude-mythos-5`, `claude-mythos-preview`, `claude-opus-5`, `claude-opus-4-8`, `claude-opus-4-7`, `claude-opus-4-6`, `claude-opus-4-5-20251101`, `claude-sonnet-5`, `claude-sonnet-4-6`. Claude Haiku 4.5 does not support effort.

- Changing top-level effort between requests invalidates the prompt cache. Per-message effort (beta header `mid-conversation-output-config-2026-07-01`, via a `role: "system"` message with empty `content` carrying `output_config.effort`) preserves the cache and is available on Claude Fable 5.1, Claude Mythos 5.1, and Claude Opus 5. Claude Fable 5 returns a 400 for it.
- `adaptive` is a thinking mode, not an effort level; passing it as an effort value is an error.
- At `xhigh` and `max`, Anthropic recommends a large `max_tokens` (64k as a starting point) because `max_tokens` is a hard limit on thinking plus response text.

**Thinking / reasoning state.** Two modes. *Adaptive* (`thinking: {"type": "adaptive", "display": ...}`) lets the model decide when and how deeply to think. *Extended* (`thinking: {"type": "enabled", "budget_tokens": N}`) is the manual mode; it is deprecated on Claude Opus 4.6 and Sonnet 4.6 and **not accepted on later models**.

- On Fable 5.1, Mythos 5.1, Fable 5, Mythos 5, Mythos Preview, Opus 5, and Sonnet 5, thinking is already on and needs no configuration. On Opus 4.8, 4.7, 4.6, and Sonnet 4.6 it is off until `thinking: {type: "adaptive"}` is set.
- `display` accepts `"omitted"` (default on Fable 5.1, Mythos 5.1, Fable 5, Mythos 5, Opus 5, Sonnet 5, Opus 4.8, Opus 4.7, Mythos Preview), `"summarized"`, and `"updates"` (beta header `thinking-display-updates-2026-08-18`).
- **Every thinking block carries a `signature`, an encrypted copy of the full reasoning. When returning tool results you must pass the assistant message's thinking blocks back complete and unmodified. Modified thinking blocks are rejected with a 400.** With `display: "omitted"` the `thinking` field is empty but the signature still carries continuity; text placed in that empty field on round-trip is ignored rather than rejected.
- You do not prune old thinking yourself: pass all blocks back and the API filters them, billing input tokens only for the blocks actually shown. Override with the `clear_thinking_20251015` context-editing strategy.
- Toggling thinking mid-turn does not error — the API silently disables thinking for that request, or strips blocks that would create an invalid turn structure. Check for the presence of `thinking` blocks in the response to confirm thinking was active. This is a silent-degradation failure mode worth naming in an audit.
- On Claude Opus 5 and later, `thinking: {"type": "disabled"}` combined with `xhigh` or `max` effort returns a 400. With thinking disabled, Opus 5 can occasionally emit tool calls as plain text or leak internal XML tags into visible output.
- Interleaved thinking is automatic on every model that supports adaptive thinking; no beta header. Claude Haiku 4.5 does not support interleaved thinking. Interleaved thinking works only for tools used through the Messages API.
- Fable 5.1, Mythos 5.1, and Fable 5 can emit *progress updates*: short user-facing status sentences that arrive as their own `thinking` block with their own signature, immediately before the `tool_use` block they introduce. Under `display: "updates"`, any thinking block with non-empty text is a progress update.
- Forced tool use: manual extended thinking supports only `tool_choice` `auto` or `none`; `any` and `tool` error. Adaptive thinking supports forced tool use **except on Claude Fable 5.1 and Claude Mythos 5.1**.

**Tool semantics.** `tool_choice` defaults to `{"type": "auto"}`; `disable_parallel_tool_use: true` caps a turn at one tool call. `strict: true` on a custom tool guarantees schema conformance. Anthropic-provided tools, with exact `type` strings:

| Tool | `type` | Execution | Beta header |
| --- | --- | --- | --- |
| Web search | `web_search_20260318`, `web_search_20260209`, `web_search_20250305` | Server | none |
| Web fetch | `web_fetch_20260318`, `web_fetch_20260309`, `web_fetch_20260209`, `web_fetch_20250910` | Server | none |
| Code execution | `code_execution_20260521`, `code_execution_20260120`, `code_execution_20250825` | Server | none |
| Advisor | `advisor_20260301` | Server | `advisor-tool-2026-03-01` |
| Tool search | `tool_search_tool_regex_20251119`, `tool_search_tool_bm25_20251119` | Server | none |
| MCP connector | `mcp_toolset` | Server | `mcp-client-2025-11-20` |
| Memory | `memory_20250818` | Client | none |
| Bash | `bash_20250124` | Client | none |
| Text editor | `text_editor_20250728`, `text_editor_20250124` | Client | none |
| Computer use | `computer_toolset_20260801`, `computer_20251124`, `computer_20250124` | Client | none / `computer-use-2025-11-24` / `computer-use-2025-01-24` |
| Browser use | `browser_toolset_20260801` | Client | none |

Per-tool optional properties: `cache_control`, `strict`, `defer_loading`, `allowed_callers`, `input_examples`, `eager_input_streaming`.

**Tool search tool.** Solves two named problems: context bloat (a five-server MCP setup can consume ~55k tokens of definitions before any work; tool search typically cuts this by over 85%) and tool-selection accuracy (which Anthropic says degrades past 30–50 available tools). Mechanics that matter architecturally:

- You still send every tool definition on every request. `defer_loading: true` controls what enters the context window, not what you transmit.
- **At least one tool must stay non-deferred**, normally the tool search tool itself. All-deferred returns a 400.
- Deferred tools are stripped from the system-prompt prefix before the cache key is computed, so adding them does not invalidate the prompt cache. A deferred tool cannot also carry `cache_control` (400) — put the breakpoint on a non-deferred tool.
- Regex variant takes Python `re.search()` patterns (max 200 chars); BM25 takes natural language (max 500 chars). Up to 10,000 deferred tools; default 5 results, `limit` 1–10,000.
- `server_tool_use` blocks with `srvtoolu_...` IDs must never receive a `tool_result`; the API rejects it. Pass `server_tool_use` and `tool_search_tool_result` blocks back unchanged.
- You can implement custom (e.g. embedding-based) tool search by returning `tool_reference` blocks from your own tool's `tool_result`.
- Anthropic's own threshold guidance: use tool search at 10+ tools, >10k tokens of definitions, or when aggregating multiple MCP servers.

**Programmatic tool calling.** Lets Claude call your tools from inside the code execution sandbox instead of round-tripping through the model. Requires `code_execution_20260120` or later plus `allowed_callers: ["code_execution_20260120"]` on the callable tool. Omitting `"direct"` from `allowed_callers` steers Claude to call the tool only from code. Response `tool_use` blocks carry a `caller` field. Supported on `claude-fable-5-1`, `claude-mythos-5-1`, `claude-fable-5`, `claude-mythos-5`, `claude-opus-5`, `claude-opus-4-8`, `claude-opus-4-7`, `claude-opus-4-6`, `claude-opus-4-5-20251101`, `claude-sonnet-5`, `claude-sonnet-4-6`, `claude-sonnet-4-5-20250929`. **Claude Haiku 4.5 accepts the tool version but does not support programmatic tool calling.** Not ZDR-eligible. Not available on Amazon Bedrock or Google Cloud; on Microsoft Foundry it requires a Hosted-on-Anthropic deployment.

**Memory tool.** `{"type": "memory_20250818", "name": "memory"}`. Client-side: Claude requests file operations and your application executes them against storage you control. Commands: `view`, `create`, `str_replace`, `insert`, `delete`, `rename`. `/memories` is a path prefix your handler maps onto real storage. Available on all Claude 4 and later models. When the tool is present, the API automatically injects a memory-protocol system prompt ("ALWAYS VIEW YOUR MEMORY DIRECTORY BEFORE DOING ANYTHING ELSE… ASSUME INTERRUPTION"). **Path-traversal protection is explicitly the developer's responsibility** — the docs call out `/memories/../../secrets.env` as the attack. This is a concrete audit item for any Memory Architecture review.

**Context management.** Three documented mechanisms:

- `clear_tool_uses_20250919` — server-side clearing of oldest tool results past a threshold (default trigger 100,000 input tokens, `keep` default 3, plus `clear_at_least`, `exclude_tools`, `clear_tool_inputs`). Beta header `context-management-2025-06-27`.
- `clear_thinking_20251015` — thinking-block clearing, same beta header. When combining strategies it must be listed first in the `edits` array.
- `compact_20260112` — server-side compaction, beta header `compact-2026-01-12`, declared in `context_management.edits`. Default trigger 150,000 input tokens (minimum 50,000). Returns a `compaction` content block; the API drops all content before that block on subsequent requests. `pause_after_compaction` stops the response after the summary. Supported on Fable 5.1, Mythos 5.1, Fable 5, Mythos 5, Mythos Preview, Opus 5, Opus 4.8, Opus 4.7, Opus 4.6, Sonnet 5, Sonnet 4.6.
- SDK-side compaction via `tool_runner` `compactionControl` is deprecated in favour of server-side compaction.

**Claude Managed Agents.** A pre-built, configurable agent harness on Anthropic infrastructure — an alternative to writing your own agent loop on the Messages API. Four concepts: Agent (model, system prompt, tools, MCP servers, skills), Environment (Anthropic cloud sandbox or a self-hosted sandbox on your own infrastructure), Session, Events. Built-in tools: bash, file operations (read/write/edit/glob/grep), web search and fetch with domain allow/blocklists, MCP servers. Streams over SSE; supports mid-execution steering and interruption; supports scheduled deployments on a cron. Built-in prompt caching and compaction. All endpoints require the `managed-agents-2026-04-01` beta header. **Managed Agents is stateful by design and is therefore not eligible for Zero Data Retention or HIPAA BAA coverage.** MCP tunnels and "dreaming" are in a narrower research preview within the beta. Client toolsets (computer/browser use) are not available as Managed Agents tools.

**Deprecated API parameters.** `temperature`, `top_p`, `top_k` are deprecated on Claude Opus 4.7 and later and return a 400 when set to a non-default value. The Python SDK v1.0+ removes them entirely, so passing them raises a `TypeError`. Anthropic's stated replacement is prompting.

### Deployment & residency

- Platforms: Claude API (`api.anthropic.com`), Claude Platform on AWS, Amazon Bedrock, Google Cloud, Microsoft Foundry.
- Amazon Bedrock offers **global endpoints (dynamic routing)** and **regional endpoints (guaranteed data routing)** for Claude Sonnet 4.5 and later. Google Cloud offers global, multi-region, and regional endpoints. Both partner platforms set their own lifecycle and retirement dates, which can differ from Anthropic's.
- On the Claude API, Claude Platform on AWS, and Microsoft Foundry, Anthropic is the data processor. On Amazon Bedrock and Google Cloud's Agent Platform, the cloud provider is the data processor.
- Conversation content is not retained by default. **Exception: Claude Fable 5.1, Claude Mythos 5.1, Claude Fable 5, and Claude Mythos 5 are designated "Covered Models" requiring 30-day data retention, and ZDR is not available for them unless expressly authorized by Anthropic.** On the Claude API, a request to Claude Fable 5 from an organization whose retention configuration does not meet this requirement returns a `400 invalid_request_error`. This is a hard architectural constraint for regulated deployments.
- Features explicitly not ZDR-eligible: programmatic tool calling; Claude Managed Agents.
- Activity Feed data is retained 6 years. Local session transcripts (Claude Code, Cowork) are stored 6 years by default or for the organization's custom retention period; remote session transcripts 6 years unless deleted.
- Platform quirk: on Amazon Bedrock, server-side tool search is available only through the InvokeModel API, not the Converse API.

### Retired

Retirement dates below are for Anthropic-operated platforms only; Bedrock and Google Cloud set their own.

| Retired model | Deprecated | Retired | Recommended replacement |
| --- | --- | --- | --- |
| `claude-opus-4-1-20250805` | 2026-06-05 | 2026-08-05 | `claude-opus-4-8` |
| `claude-opus-4-20250514` | 2026-04-14 | 2026-06-15 | `claude-opus-4-8` |
| `claude-sonnet-4-20250514` | 2026-04-14 | 2026-06-15 | `claude-sonnet-4-6` |
| `claude-3-7-sonnet-20250219` | 2025-10-28 | 2026-02-19 | `claude-sonnet-4-6` |
| `claude-3-5-haiku-20241022` | 2025-12-19 | 2026-02-19 | `claude-haiku-4-5-20251001` |
| `claude-3-haiku-20240307` | 2026-02-19 | 2026-04-20 | `claude-haiku-4-5-20251001` |
| `claude-3-opus-20240229` | 2025-06-30 | 2026-01-05 | `claude-opus-4-8` |
| `claude-3-5-sonnet-20240620`, `claude-3-5-sonnet-20241022` | 2025-08-13 | 2025-10-28 | `claude-sonnet-4-6` |
| `claude-2.0`, `claude-2.1`, `claude-3-sonnet-20240229` | 2025-01-21 | 2025-07-21 | `claude-opus-4-8` / `claude-sonnet-4-6` |

Also deprecated: `claude-mythos-preview` → `claude-mythos-5`.

Lifecycle terms: Active → Legacy → Deprecated → Retired. Anthropic commits to at least **60 days' notice** before retiring a publicly released model, and publishes usage-audit instructions (Console → Usage → Export) for finding deprecated-model calls.

### Primary sources

- [Models overview](https://platform.claude.com/docs/en/about-claude/models/overview)
- [Model deprecations](https://platform.claude.com/docs/en/about-claude/model-deprecations)
- [Tool use with Claude](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview)
- [Tool reference](https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-reference)
- [Tool search tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-search-tool)
- [Programmatic tool calling](https://platform.claude.com/docs/en/agents-and-tools/tool-use/programmatic-tool-calling)
- [Memory tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool)
- [Effort](https://platform.claude.com/docs/en/build-with-claude/effort)
- [Thinking](https://platform.claude.com/docs/en/build-with-claude/thinking)
- [Context editing](https://platform.claude.com/docs/en/build-with-claude/context-editing)
- [Compaction](https://platform.claude.com/docs/en/build-with-claude/compaction)
- [Claude Managed Agents overview](https://platform.claude.com/docs/en/managed-agents/overview)
- [API and data retention](https://platform.claude.com/docs/en/manage-claude/api-and-data-retention)

### Sourcing gaps

- No Anthropic-owned capability table for the Mythos line was reachable; the model pages link to `anthropic.com/glasswing`, which was not fetched. Mythos context windows, cutoffs, and modality support are **not documented on a reachable Anthropic page as of 2026-09-08**.
- Audio and video input support for current Claude models is not claimed on the models-overview page; only text and image input are listed. Do not assert audio input.

---

## OpenAI

### Current models

| Model | Model ID | Purpose | Context | Max output | Reasoning effort | Knowledge cutoff |
| --- | --- | --- | --- | --- | --- | --- |
| GPT-6 Astra | `gpt-6-astra` | "Our most capable model, built for the hardest end-to-end work" | 1.05M | 128K | `low`/`medium`/`high`/`xhigh`/`max` (**`none` returns 400**) | 2026-04-30 |
| GPT-5.6 Sol | `gpt-5.6-sol` (alias `gpt-5.6`) | Flagship for complex professional work | 1.05M | 128K | `none`…`max` | 2026-02-16 |
| GPT-5.6 Terra | `gpt-5.6-terra` | Balances intelligence and cost | 1.05M | 128K | supported | 2026-02-16 |
| GPT-5.6 Luna | `gpt-5.6-luna` | Cost-sensitive workloads | 1.05M | 128K | supported | 2026-02-16 |

Specialized: `gpt-5.6-cyber` (cybersecurity), `gpt-image-2` (image generation), `gpt-realtime-2.1` and `gpt-realtime-2.1-mini` (voice/realtime, with reasoning), `gpt-transcribe` (speech-to-text), `gpt-live-transcribe` (low-latency transcription), `gpt-realtime-translate` (speech translation), `gpt-audio-1.5` (named as the replacement for the retired `gpt-audio` family).

All latest OpenAI models support text and image input, text output, multilingual capabilities, and vision.

### Runtime contract notes

**API surface.** The Responses API is the documented surface for the current models. The migration guide states plainly: **"Starting with GPT-5.4, Chat Completions does not support tool calling with `reasoning_effort` values other than `none`."** Chat Completions still exists and still does function calling, but not while reasoning effort is active. For any agentic system on a current OpenAI reasoning model, Responses is effectively mandatory.

**Reasoning state.** This is the dominant failure mode in OpenAI agent loops:

- `reasoning.effort` accepts `none`, `minimal`, `low`, `medium`, `high`, `xhigh`, `max`. `gpt-6-astra` rejects `none` with a 400.
- `reasoning.summary` (set to `"auto"` for the most detailed available summarizer) returns summaries in the `summary` array of the `reasoning` output item. Opt-in.
- **When using function calling, you must pass back the reasoning items returned with the last function call, plus all subsequent reasoning and function-output items.** Omitting them breaks reasoning continuity and costs tokens.
- `previous_response_id` is the simplest stateful integration and carries reasoning across turns automatically.
- With `store: false` or Zero Data Retention, reasoning items carry an `encrypted_content` property by default; you replay the encrypted tokens on subsequent calls to preserve reasoning without server-side storage. **This is the ZDR-compatible path and must be wired explicitly.**

**Tools.** Hosted tools in the Responses API, with type strings: `web_search`, `file_search` (over vector stores), `tool_search` (deferred tool definitions — **only `gpt-5.4` and later support it**), `mcp` (remote MCP servers), and `function` for custom tools. The docs also reference shell, computer use, image generation, and skills capabilities without full specification on the tools guide page. Custom function tools take `strict: true` with `additionalProperties: false` for schema enforcement.

Note the convergent design: OpenAI's `tool_search` and Anthropic's tool search tool solve the same context-bloat problem with the same deferred-definition mechanic. A model-agnostic harness can abstract over both.

### Deployment & residency

- OpenAI documents data residency across **10 regions**: United States, Europe (EEA + Switzerland), Australia, Canada, Japan, India, Singapore, South Korea, United Kingdom, United Arab Emirates.
- **Three regions offer regional processing — the United States, Europe, and the United Arab Emirates — the other seven (Australia, Canada, Japan, India, Singapore, South Korea, United Kingdom) provide regional storage only.** The UAE's regional processing is both model- and endpoint-limited and requires additional approval: `/v1/chat/completions` (`gpt-5.6-luna`, `gpt-5.5-2026-04-23`, `gpt-5.2-2025-12-11`), `/v1/responses` (adds `gpt-5.5-pro-2026-04-23`), and `/v1/embeddings` (`text-embedding-3-large`) — every other model and endpoint in the UAE is storage-only. This distinction is load-bearing for a sovereignty audit: "data residency in India" for OpenAI means storage in India, not inference in India, and "data residency in the UAE" means processing only for a short model allowlist on three endpoints.
- Non-US regions require approval for abuse-monitoring controls. Image support in these regions requires approval for enhanced ZDR or enhanced modified abuse monitoring.
- Eligible endpoints: `/v1/chat/completions`, `/v1/responses`, `/v1/batches`, `/v1/embeddings`, `/v1/audio`, `/v1/images`, `/v1/fine_tuning/jobs`, `/v1/moderations`, `/v1/realtime`.
- Zero Data Retention excludes customer content from abuse-monitoring logs and **forces `store` to be treated as `false` even when the request sets it to `true`**. Requires prior OpenAI approval.
- Responses API default retention is **30 days** when `store` is omitted or true. Background mode stores data for roughly 10 minutes to enable polling.

### Retired

| Announced | Shutdown | Models | Replacement |
| --- | --- | --- | --- |
| 2026-08-26 | 2027-02-26 | `whisper-1`, `gpt-4o-transcribe`, `gpt-4o-mini-transcribe`, `gpt-4o-transcribe-diarize` | `gpt-live-transcribe` or `gpt-transcribe` |
| 2026-07-20 | 2027-01-20 | `gpt-realtime`, `gpt-audio`, `gpt-4o-audio`, `gpt-realtime-mini`, `gpt-audio-mini` | `gpt-realtime-2.1`, `gpt-audio-1.5` |
| 2026-06-11 | 2026-12-11 | `gpt-5-2025-08-07`, `gpt-5-mini-2025-08-07`, `gpt-5-nano-2025-08-07`, `gpt-5-pro-2025-10-06`, `o3-2025-04-16`, `o3-pro-2025-06-10` | `gpt-5.6-sol`, `gpt-5.6-terra`, `gpt-5.6-luna` |
| 2026-06-03 | 2026-10-31 → 2026-11-30 | `/v1/prompts` API, Evals dashboard, Agent Builder | per-platform migration guidance |
| 2026-06-02 | 2026-12-01 | `gpt-image-1-mini`, `gpt-image-1.5`, `chatgpt-image-latest` | `gpt-image-2` |
| 2026-04-22 | 2026-10-23 | `gpt-3.5-turbo-0125`, `gpt-4-0613`, `gpt-4-1106-preview`, `gpt-4-turbo`, `gpt-4.1-nano`, `gpt-4o-2024-05-13`, `gpt-image-1`, `o1-2024-12-17`, `o1-pro-2025-03-19`, `o3-mini-2025-01-31`, `o4-mini-2025-04-16` | `gpt-5.6-*` / `gpt-image-2` |
| 2026-03-24 | 2026-09-24 | `sora-2`, `sora-2-pro`, Videos API | none announced |
| 2025-09-26 | 2026-09-28 | `gpt-3.5-turbo-instruct`, `babbage-002`, `davinci-002`, `gpt-3.5-turbo-1106` | `gpt-5.6-terra` |

**Note the 2026-06-03 entry: the Agent Builder and the Evals platform are being shut down**, with the `/v1/prompts` reusable-prompts API. Any architecture guidance that assumed OpenAI Agent Builder as a harness option is stale.

### Primary sources

- [OpenAI models](https://developers.openai.com/api/docs/models)
- [OpenAI deprecations](https://developers.openai.com/api/docs/deprecations)
- [Reasoning guide](https://developers.openai.com/api/docs/guides/reasoning)
- [Tools guide](https://developers.openai.com/api/docs/guides/tools)
- [Migrate to Responses](https://developers.openai.com/api/docs/guides/migrate-to-responses)
- [Your data](https://developers.openai.com/api/docs/guides/your-data)

### Sourcing gaps

- `https://help.openai.com/en/articles/9624314-model-release-notes` (named in the task brief) returned **HTTP 403** and was not reachable. Retirement facts above come from the OpenAI-owned deprecations page instead, which is the better source anyway.
- The tools guide did not enumerate model support for computer use, shell, image generation, or skills; those are referenced but **not fully specified on the page fetched as of 2026-09-08**. Do not assert per-model support for them.
- Realtime/voice runtime contract (session limits, VAD, interruption semantics) was not fetched this pass.

---

## Google Gemini

### Current models

Stable Gemini 3 series:

| Model | Model ID | Stated purpose |
| --- | --- | --- |
| Gemini 3.8 Flash | `gemini-3.8-flash` | "Most intelligent Flash model, engineered for long-horizon software engineering" |
| Gemini 3.7 Flash | `gemini-3.7-flash` | Complex coding and agentic workflows |
| Gemini 3.6 Flash | `gemini-3.6-flash` | Speed and multimodal across general agentic tasks |
| Gemini 3.5 Flash | `gemini-3.5-flash` | Routine, high-throughput workloads |
| Gemini 3.5 Flash-Lite | `gemini-3.5-flash-lite` | Fastest, most cost-effective 3.5 model |
| Gemini 3.1 Flash-Lite | `gemini-3.1-flash-lite` | Frontier-class performance at reduced cost |

**Note the shape of the lineup: as of 2026-09-08 the stable tier is Flash-only.** The Pro tier (`gemini-3.1-pro-preview`) is in preview, and `gemini-3-pro-preview` has been shut down.

Preview: `gemini-3.1-pro-preview`, `gemini-3-flash-preview`, `gemini-3.1-flash-live-preview` (real-time dialogue/voice), `gemini-3.1-flash-tts-preview`, `gemini-3.5-live-translate-preview` (real-time speech-to-speech, 70+ languages).

Gemini 2.5 series still listed: `gemini-2.5-flash`, `gemini-2.5-flash-lite`, `gemini-2.5-pro`, `gemini-2.5-flash-native-audio-preview-12-2025`, `gemini-2.5-flash-preview-tts`, `gemini-2.5-pro-preview-tts`.

Image: `gemini-3.1-flash-image` (Nano Banana 2), `gemini-3.1-flash-lite-image`, `gemini-3-pro-image` (Nano Banana Pro, 4K), `gemini-2.5-flash-image`.
Video: `gemini-omni-1.1-flash` (generation, editing, keyframe interpolation), `veo-3.1-generate-preview`, `veo-3.1-lite-generate-preview`.
Speech: `gemini-3.5-transcribe`, `gemini-3.5-transcribe-live` (speaker diarization, custom vocabulary).
Music: `lyria-3.5`, `lyria-3-clip-preview`, `lyria-3-pro-preview`, `lyria-realtime-exp`.
Agent/tool models: `gemini-2.5-computer-use-preview-10-2025`, `deep-research-preview-04-2026`, `deep-research-max-preview-04-2026`, `antigravity-preview-05-2026` (managed agent that runs code, manages files, browses the web).
Embedding: `gemini-embedding-2-preview` (multimodal: text, images, video, audio), `gemini-embedding-001`.
Robotics: `gemini-robotics-er-2-preview`, `gemini-robotics-er-1.6-preview`.

Version naming: stable (`gemini-3.8-flash`), preview (`…-preview-MM-YYYY`), latest aliases (`gemini-flash-latest`), experimental. Experimental variants get a stated **two-week notice** before deprecation.

**One model verified in detail** — `gemini-3.8-flash`, from its own model page: input limit **1,048,576 tokens**, output limit **65,536 tokens**; inputs **text, image, video, audio, and PDF**; output text only. Function calling, structured outputs, Batch API, and caching all supported. **Thinking supported at `low` / `medium` / `high`; `minimal` is not supported. The Live API is not supported on this model** — Live is a separate model line (`gemini-3.1-flash-live-preview`, `gemini-2.5-flash-native-audio-preview-12-2025`), which is an architectural constraint for voice agents: you cannot use the newest Flash for realtime. Knowledge cutoff is not stated on the page.

### Runtime contract notes

**Interactions API is the agentic surface.** Google states that "all new models, multimodal capabilities, tools, and agentic features will launch on the Interactions API." It differs from `generateContent` by managing conversation state server-side, exposing observable execution steps, and supporting background execution.

- An Interaction is one complete conversation turn holding chronological execution steps. Typed step kinds include `function_call`, `function_result`, `model_output`, `thought`, and `user_input`.
- `previous_interaction_id` links turns for server-side history retrieval. `store` defaults to `true`.
- `background=true` runs the interaction asynchronously.
- `tools`, `system_instruction`, and `generation_config` are **interaction-scoped**: they apply only to the current interaction and must be re-specified when running stateless.
- `interactions.get` returns full context including `user_input` steps; `interactions.create` responses omit user input.
- **Stateless mode (`store=false`) disables background execution and `previous_interaction_id`, and requires you to resend the full history including all model-generated `thought` and `function_call` steps exactly as received.** Omitting or reformatting them breaks subsequent turns. This is the Gemini analogue of Anthropic's thinking-block preservation and OpenAI's reasoning-item replay.

**Function calling.**

- The model returns `function_call` steps with `type`, `name`, `arguments`, and an **`id`**. The `function_result` step you send back requires `name`, `call_id` (echoing that id), and `result`. Manually-constructed history that drops or mismatches `call_id` breaks.
- **Thought signatures on Gemini 3 series models are handled automatically by the SDKs.** Hand-rolled HTTP clients must handle them; the docs' guarantee is SDK-scoped.
- Modes: `auto` (default), `any`, `none`, and `validated` (schema adherence enforced).
- Parallel calling via `generation_config: {"tool_choice": "any"}`; compositional/sequential chaining happens across turns via `previous_interaction_id`.

**Sampling parameters.** As of the 2026-07-21 changelog entry, `temperature`, `top_p`, and `top_k` are **deprecated** on Gemini — the same move Anthropic made on Opus 4.7+. Two of three frontier providers have now removed sampling knobs from the agent-tuning surface.

**Agentic video understanding** (2026-09-01) lets Flash models dynamically request transcripts and frames on demand, reported by Google as reducing token usage by up to 88% for long-form video content. This is just-in-time retrieval applied to a modality, and it is the multimodal analogue of tool search.

**Other 2026 platform changes:** File Search supports multimodal search with image embedding via `gemini-embedding-2` (2026-05-05); event-driven webhooks replace polling workflows (2026-05-04); Flex and Priority inference tiers introduced (2026-04-01).

### Deployment & residency

- The Gemini API and Google AI Studio are available in roughly 195 countries and territories. **That page documents geographic access eligibility only — it states nothing about where data is processed, and makes no data-residency commitment.**
- Users outside the supported territories are directed to the "Gemini API in Gemini Enterprise Agent Platform" instead. Note that Google's enterprise surface appears to have been renamed from "Vertex AI" to "Gemini Enterprise Agent Platform"; Anthropic's docs also refer to "Google Cloud's Agent Platform".
- The Gemini API terms draw a hard line between paid and unpaid tiers. **Unpaid Services:** Google uses submitted content to "provide, improve, and develop Google products and services," and "human reviewers may read, annotate, and process your API input and output." The terms instruct: "Do not submit sensitive, confidential, or personal information to the Unpaid Services." **Paid Services:** prompts and responses are not used to improve Google's products; processing follows the Data Processing Addendum for Products Where Google is a Data Processor, and logs are retained for a limited period solely to detect and prevent Prohibited Use Policy violations.
- **The terms state paid-service data "may be stored transiently or cached in any country in which Google or its agents maintain facilities."** For a Sovereignty & Residency audit this is the operative fact on the Gemini Developer API: there is no geographic confinement commitment on this surface.
- Users in the EEA, Switzerland, or the UK receive paid-service protections even when the service is offered free of charge.

### Retired

- `gemini-2.0-flash` and `gemini-2.0-flash-lite` — shut down 2026-06-01.
- `gemini-3-pro-preview` — shut down.
- `gemini-3.1-flash-lite-preview` — shut down.
- `imagen-4.0-generate` (Imagen 4) — deprecated; Imagen 4 and Gemini 3 Image models shut down 2026-08-17 (announced 2026-06-15).
- Veo models — shut down 2026-06-30 (announced 2026-06-15).
- `gemini-robotics-er-1.6-preview` — shut down 2026-08-31 (announced 2026-07-30).
- **Interactions API breaking schema change**: announced 2026-05-06 (`outputs` → `steps`, and `response_format` output-format configuration changed), new schema became default 2026-05-26, legacy removed 2026-06-08.

### Primary sources

- [Gemini models](https://ai.google.dev/gemini-api/docs/models)
- [Gemini API changelog](https://ai.google.dev/gemini-api/docs/changelog)
- [Gemini function calling](https://ai.google.dev/gemini-api/docs/function-calling)
- [Interactions API overview](https://ai.google.dev/gemini-api/docs/interactions/interactions-overview)
- [Live API](https://ai.google.dev/gemini-api/docs/live-api)
- [Available regions](https://ai.google.dev/gemini-api/docs/available-regions)
- [Gemini API additional terms of service](https://ai.google.dev/gemini-api/terms)
- [Gemini 3.8 Flash model page](https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash)

### Sourcing gaps

- **The models index page does not state per-model context windows, output token limits, or knowledge cutoffs** — but the per-model detail pages do, at `ai.google.dev/gemini-api/docs/models/<model-id>`. Only one was fetched this pass (below). **Do not write context-window numbers for any other Gemini model into a profile without fetching its own page first.** Note the URL pattern is not uniform: `.../models/gemini-3.1-pro` returned 404, so preview models may be pathed differently.
- **No Google-owned page documenting Gemini data-residency or ML-processing-location guarantees was reachable this pass.** `cloud.google.com/vertex-ai/generative-ai/docs/data-residency` 301s to `docs.cloud.google.com/...` which returned 404; `.../docs/learn/locations` returned a navigation index for the Gemini Enterprise Agent Platform with no residency content. Record Gemini residency as **not verified as of 2026-09-08**.
- Interaction data retention was reported as 55 days for paid projects and 1 day for free accounts on the Interactions overview; treat as single-source and re-verify before quoting a number.
- The Live API overview does not name the model IDs that support it, and does not state session duration limits, session-resumption behaviour, or voice-activity-detection semantics. It confirms only: 16-bit PCM 16kHz input / 24kHz output, JPEG ≤1FPS image input, function calling and Google Search inside sessions, 70 supported languages, and barge-in interrupt support.

---

## Model Context Protocol

### The 2026-07-28 revision

Protocol version string: **`2026-07-28`**. This is the largest structural change in MCP's history and it changes agent-architecture guidance, not just transport wiring.

**Changes that alter architecture guidance:**

1. **MCP is now stateless.** The `initialize` / `notifications/initialized` handshake is removed. Every request carries its protocol version and client capabilities in `_meta` (`io.modelcontextprotocol/protocolVersion`, `io.modelcontextprotocol/clientCapabilities`). Clients SHOULD identify themselves per request (`io.modelcontextprotocol/clientInfo`); servers SHOULD identify themselves in each result's `_meta` (`io.modelcontextprotocol/serverInfo`). Version mismatches return `UnsupportedProtocolVersionError`.
2. **Protocol-level sessions are gone**, along with the `Mcp-Session-Id` header. `tools/list`, `resources/list`, and `prompts/list` no longer vary per connection. **Servers that need cross-call state must use explicit, server-minted handles passed as ordinary tool arguments.** This is a design instruction, not a transport detail: any MCP server whose design depended on implicit session state must be redesigned around explicit handles.
3. **Multi Round-Trip Requests (MRTR)** replace server-initiated requests (`roots/list`, `sampling/createMessage`, `elicitation/create`). A server returns an `InputRequiredResult` (`resultType: "input_required"`) whose `inputRequests` field carries what it needs; the client retries the original request with `inputResponses`. Mid-call confirmation and parameter collection now work over stateless connections.
4. **All results carry a required `resultType`** field: `"complete"` or `"input_required"`. Clients MUST treat results from earlier-protocol servers that omit the field as `"complete"`.
5. **Roots, Sampling, and Logging are deprecated.** Suggested migrations, stated in the changelog: pass directories or files via tool parameters, resource URIs, or server configuration instead of Roots; integrate directly with LLM provider APIs instead of Sampling; log to `stderr` (stdio) or use OpenTelemetry instead of Logging. **Any architecture that routes model calls back through MCP Sampling is now on a deprecated path.**
6. **Tasks moved out of core into an official extension** (`io.modelcontextprotocol/tasks`). The redesigned extension replaces blocking `tasks/result` with polling via `tasks/get`, adds `tasks/update` for client-to-server input, removes `tasks/list`, and lets servers return task handles unsolicited. Long-running MCP work is now an extension concern.
7. **`server/discover` is mandatory**: servers MUST implement it to advertise supported protocol versions, capabilities, and identity. Clients MAY call it before any other request, or use it as a backward-compatibility probe on STDIO.
8. **Subscriptions replaced**: the HTTP GET endpoint and `resources/subscribe`/`resources/unsubscribe` give way to `subscriptions/listen`, a single long-lived POST-response stream. Clients opt into specific notification types (`toolsListChanged`, `promptsListChanged`, `resourcesListChanged`, `resourceSubscriptions`); notifications are tagged with `io.modelcontextprotocol/subscriptionId`. Request-scoped notifications (`notifications/progress`, `notifications/message`) still flow on the response stream of their own request.
9. **`ping`, `logging/setLevel`, and `notifications/roots/list_changed` are removed.** Log level is per-request via `io.modelcontextprotocol/logLevel` in `_meta`; servers MUST NOT emit `notifications/message` for requests that omit it.
10. **Cacheable list results.** `tools/list`, `prompts/list`, `resources/list`, `resources/read`, and `resources/templates/list` now require `ttlMs` (freshness hint, milliseconds) and `cacheScope` (`"public"` or `"private"`, controlling whether shared intermediaries may cache). Servers SHOULD return tools from `tools/list` in a deterministic order to enable client-side caching and improve LLM prompt-cache hit rates. **Deterministic tool ordering is now a prompt-caching concern, which makes it an agent-architecture concern.**

**Changes that are transport or plumbing detail:**

- Header-based routing: `Mcp-Method` and `Mcp-Name` headers are required on Streamable HTTP POSTs, so gateways and rate limiters can route and authorize without parsing JSON bodies. Custom headers from tool parameters via `x-mcp-header`.
- SSE stream resumability and message redelivery removed (`Last-Event-ID`, SSE event IDs). A broken response stream loses the in-flight request; clients MUST re-issue with a new request ID. *(Architecturally relevant for retry design, though transport-level.)*
- HTTP+SSE transport reclassified as Deprecated; migrate to Streamable HTTP.
- Resource-not-found error code changed from `-32002` to `-32602`.
- Error-code allocation policy: `-32000`–`-32019` implementation-defined (existing SDK usage grandfathered), `-32020`–`-32099` reserved for the spec. Renumbered: `HeaderMismatch` `-32001`→`-32020`, `MissingRequiredClientCapability` `-32003`→`-32021`, `UnsupportedProtocolVersion` `-32004`→`-32022`.
- `inputSchema` / `outputSchema` loosened to allow any JSON Schema 2020-12 keywords; `structuredContent` allows any JSON value; `$ref` resolution requirements and composition-keyword resource bounds added.
- `extensions` field added to `ClientCapabilities` and `ServerCapabilities`.
- OpenTelemetry trace-context propagation conventions documented for `_meta` keys (`traceparent`, `tracestate`, `baggage`).
- `notifications/elicitation/complete` and the URL-mode `elicitationId` field (both new in 2025-11-25) removed; under MRTR the client learns the outcome by retrying, and servers needing correlation encode their own identifier in `requestState`.

**Authorization hardening:**

- Authorization servers SHOULD include the `iss` parameter per RFC 9207; MCP clients **MUST validate a present `iss`** against the recorded issuer before redeeming the authorization code.
- **OAuth 2.0 Dynamic Client Registration (RFC 7591) is deprecated** in favour of Client ID Metadata Documents (CIMD). DCR remains available only for backwards compatibility with authorization servers that lack CIMD support.
- Clients MUST specify an appropriate `application_type` during DCR to avoid OpenID Connect redirect-URI conflicts.
- Client credentials are bound to the issuing authorization server: clients MUST key persisted credentials by issuer identifier, MUST NOT reuse them with a different authorization server, and MUST re-register when the authorization server changes.

**Governance.** MCP adopted a feature lifecycle and deprecation policy with Active / Deprecated / Removed states and a **minimum twelve-month deprecation window**, plus a registry of deprecated features. Deprecated features remain functional during the window.

**SDK support** as stated in the release post: TypeScript, Python, Go, and C# Tier 1 SDKs updated; Rust SDK in beta. The post acknowledges "some migration cost, especially for developers that did depend on session identifiers."

**Extensions to know about.** The specification index names three notable extensions beyond the core protocol, all opt-in and negotiated by both sides: **Tasks** (`io.modelcontextprotocol/tasks` — asynchronous execution of long-running operations with polling, mid-flight input, and durable handles), **Skills over MCP** (rich structured instructions for agent workflows, discovered and consumed through MCP), and **MCP Apps** (interactive UI elements — charts, forms, video players — rendered inline in conversations). Enterprise Managed Authorization is also named as an extension in the release post.

**Confirmed current.** `modelcontextprotocol.io/specification/` points at the `2026-07-28` schema and lists no newer draft as of 2026-09-08. The index also now describes the base protocol as "Stateless, self-contained requests" with "Per-request capability negotiation."

### Primary sources

- [MCP 2026-07-28 release post](https://blog.modelcontextprotocol.io/posts/2026-07-28/)
- [MCP 2026-07-28 specification changelog](https://modelcontextprotocol.io/specification/2026-07-28/changelog)
- [MCP specification index](https://modelcontextprotocol.io/specification/)

### Sourcing gaps

- Adoption status is not covered: whether Anthropic's `mcp_toolset` connector (beta `mcp-client-2025-11-20`) or OpenAI's `mcp` tool have shipped 2026-07-28 support is **not documented on any page fetched as of 2026-09-08**. Do not assert that either client speaks the new revision.

---
## Meta Llama

**Status: VERIFIED, but the family appears frozen.** Meta's 2026 model releases are the **Muse** line, not Llama. `developer.meta.com/ai/docs/overview/` lists Muse Spark, Muse Glimmer, Muse Image, and Muse Voice Transcribe alongside Llama 4, Llama Guard 4, and Llama 3.3. Muse Spark 1.3 is **proprietary, not open weights**, served through Muse Code and the Meta Model API; its own announcement lists "the Muse Spark open weights release" as a *future* roadmap item. **Meta publishes no statement on whether Llama is still maintained or has been superseded — not publicly documented as of 2026-09-08.** Treat any advice that positions Llama as Meta's current flagship open-weight line as needing this caveat.

`www.llama.com/docs/*` now 301-redirects to `developer.meta.com/ai/docs/*`.

### Current models

- **Llama 4 Scout** — 17B active / 109B total across 16 experts. Context **up to 10M tokens**. Runs on a single H100.
- **Llama 4 Maverick** — 400B total across experts, natively multimodal, **1M token context**. Requires a distributed setup. (The active-parameter count rendered ambiguously on the fetched page; do not quote it.)
- Knowledge cutoff: **August 2024**.
- **Llama Guard 4** — current safety/protection model with Llama 4 support.
- Llama 3.3 and earlier are documented as prior generations.

### Runtime contract notes

- Prompt format uses structured control tokens: `<|begin_of_text|>`, `<|header_start|>`, `<|eot|>`. Four roles: system, user, assistant, and tool (tool outputs carry the role name `ipython`).
- **Tool calling is a prompt-format convention, not an API contract.** Meta documents two output formats the model emits — Python-style (`[func_name(param="value")]`) and JSON-style (`{name, parameters}`). There is no vendor-side JSON-schema enforcement; the harness must parse these itself. This is the single most important architectural fact about Llama in an agent system: you own the tool-call parser.
- Vision: text plus **up to 5 images**. **Image understanding is English-only** even though text spans 12 languages. Images are tiled to 336×336 with dynamic patch tokens and tile separator tokens, so larger images cost more prompt tokens.
- Structured-output path: **not publicly documented by Meta as of 2026-09-08.**

### Deployment & residency

- Distribution: direct download from Meta, Hugging Face, Kaggle, plus cloud and edge partners. Docs cover private cloud, production pipelines, autoscaling, and accelerator management.
- **Meta documents no serving-stack flags** — no vLLM/SGLang tool-call-parser or reasoning-parser guidance. **Not publicly documented as of 2026-09-08.** Self-hosters must source parser configuration from the serving framework, not from Meta.
- Residency: not vendor-stated.

**License: Llama 4 Community License** — not Apache-2.0, not MIT. Key terms: a commercial license must be requested from Meta above **700 million monthly active users**; "Built with Llama" must be prominently displayed; derivative model names must **begin with "Llama"**; the copyright notice must be retained; Meta's Acceptable Use Policy is incorporated by reference. This is a real procurement constraint, not boilerplate.

### Retired

Meta publishes no deprecation/retirement table with dates and replacements for Llama model IDs — **not publicly documented as of 2026-09-08.** Llama 3.x is presented as a prior generation, not formally retired.

### Primary sources

- [Meta AI developer docs overview](https://developer.meta.com/ai/docs/overview/)
- [Meta AI docs index](https://developer.meta.com/ai/docs/)
- [Model cards and prompt formats](https://developer.meta.com/ai/docs/model-cards-and-prompt-formats/)
- [Llama 4 model card and prompt format](https://developer.meta.com/ai/docs/model-cards-and-prompt-formats/llama4/)
- [Llama 4 license](https://developer.meta.com/ai/llama4/license/)
- [Meta AI blog](https://ai.meta.com/blog/)
- [Introducing Muse Spark 1.3](https://research.meta.ai/blog/introducing-muse-spark-1-3)

---

## Mistral

**Status: VERIFIED, with one unresolved conflict — see Sourcing gaps. Do not write Mistral API model ID strings from this brief except `mistral-large-2512`.**

### Current models

Generalist (all multimodal text + vision):

- **Mistral Medium 3.5** — frontier-class, agentic/coding focus. License **Modified MIT**. API-only tier; open-weight repo `mistralai/Mistral-Medium-3.5-128B` exists on Mistral's HF org.
- **Mistral Large 3** — API ID **`mistral-large-2512`**, **256k context**, **Apache-2.0**, open weights, MoE 41B active / 675B total, released 2025-12-02.
- **Mistral Small 4** — hybrid model unifying instruct, reasoning, and coding. **Apache-2.0**. Repos: `mistralai/Mistral-Small-4-119B-2603`, `-NVFP4`, `-eagle`.
- **Ministral 3** in 14B / 8B / 3B, all **Apache-2.0**, text + vision.
- **Z.ai GLM 5.2** is served on Mistral's platform as a third-party open-source text model with a 1M-token context window.

Specialized: **OCR 4.1** (paragraph-level bounding boxes, structural block labels, block-level confidence), **Codestral** and **Codestral Embed**, **Mistral Embed**, **Voxtral TTS** (zero-shot voice cloning — **CC BY-NC 4.0, non-commercial**, unlike the rest of the line), **Voxtral Mini Transcribe 2**, **Voxtral Mini Transcribe Realtime** (Apache-2.0), **Shieldstral 1.0** (multimodal moderation, Apache-2.0, `mistralai/Shieldstral-1.0-3B`), **Mistral Moderation 2** (128k, jailbreak detection), **Leanstral 1.5** (Lean 4 formal-proof agent, Apache-2.0, `mistralai/Leanstral-1.5-119B-A6B`).

### Runtime contract notes

- **Function calling**: a `tools` array of JSON-schema function specs, each requiring `type: "function"` plus `function.name`, `function.description`, `function.parameters` (with `required`).
- `tool_choice`: `"auto"` (default) / `"any"` (forces a tool) / `"none"`. `parallel_tool_calls`: `true` (default, model decides) / `false` (forces sequential).
- Function calling is documented across the lineup including Mistral Large 3, Devstral, Magistral, and Ministral 3.
- Mistral Large 3 supports structured outputs, function calling, document QnA, chat completions, batching, and the agent/conversation APIs.
- Whether Mistral Small 4's hybrid reasoning mode has an explicit toggle (request parameter vs. prompt): **not verified** — the model-card URL 404'd.

### Deployment & residency

- **Mistral's own vLLM page documents only** `--tokenizer_mode mistral`, `--config_format mistral`, and `--load_format mistral`, illustrated with Mistral NeMo, Mistral Small, and Pixtral-12B. Those examples are **stale relative to the current lineup**.
- **Mistral does not document a `--tool-call-parser` flag on its own vLLM page.** vLLM's own docs describe a `mistral` tool parser requiring `--enable-auto-tool-choice --tool-call-parser mistral`, but that is vLLM-owned, not Mistral-owned. **Self-hosting gap: tool calling almost certainly requires a parser flag Mistral itself does not document.**
- **Zero Data Retention is available on paid plans for stateless endpoints only**: `/v1/chat/completions`, `/v1/fim/completions`, `/v1/embeddings`, `/v1/moderations`, `/v1/chat/moderations`, `/v1/classifications`, `/v1/chat/classifications`, `/v1/ocr`, `/v1/audio/speech`, `/v1/audio/transcriptions`. It applies across models **except Labs models**. **ZDR does not apply to Agents, Batch, Conversations, Libraries, the Files API, Vibe Work, or Chat.** This is the load-bearing constraint: the moment you use Mistral's agent or stateful surface, ZDR is off.
- EU hosting (default EU hosting, GDPR Art. 46 safeguards for transfers) is stated in Mistral's Help Center; **the docs ZDR page itself makes no geographic claim.** Treat EU-default as help-center-sourced.

### Retired

Mistral publishes a deprecation table in its models docs covering 30+ models with windows from October 2025 through August 2026, migrating toward Mistral Medium 3.5, Mistral Small 4, and Ministral variants. Named in it: Mistral Medium 3 / 3.1, Mistral Small 3.2, Devstral variants, and legacy Mistral 7B / Mixtral. **The table could not be fetched verbatim (the dedicated deprecation URLs 404'd), so no per-model dates are asserted here. Do not copy dates that circulate in search summaries.**

### Primary sources

- [Models overview](https://docs.mistral.ai/getting-started/models/models_overview/)
- [Models](https://docs.mistral.ai/models)
- [Mistral Large 3 model card](https://docs.mistral.ai/models/model-cards/mistral-large-3-25-12)
- [Function calling](https://docs.mistral.ai/capabilities/function_calling/)
- [vLLM local deployment](https://docs.mistral.ai/models/deployment/local-deployment/vllm)
- [Zero data retention](https://docs.mistral.ai/admin/monitor-comply/zero-data-retention)
- [Mistral HuggingFace org](https://huggingface.co/mistralai)

### Sourcing gaps

- **Exact API model ID strings are unresolved.** Two Mistral doc pages rendered different conventions (`mistral-medium-3505` vs `mistral-medium-3.5-26.04`), while the Large 3 model card gave `mistral-large-2512`. **Only `mistral-large-2512` is verified.** A downstream task that needs Mistral IDs must re-verify against the API reference first.
- Deprecation dates not verified. Mistral Small 4 reasoning toggle not verified.

---

## Cohere

**Status: VERIFIED. The richest runtime-contract documentation of any open-weight-adjacent family in this pass, and the one with the most porting hazards.**

### Current models

- **`command-a-plus-05-2026`** — flagship, released 2026-05-20. Cohere's first **MoE**: **25B active / 218B total**. **128K input, 64K output.** Text + image input. **Apache-2.0.** Weights at `CohereLabs/command-a-plus-05-2026-w4a4` on Cohere's own HF org. Runs on 1×B200 or 2×H100 at W4A4. **48 languages including all official EU languages.** Documented as the *last* model in the Command A family, unifying vision, reasoning, translation, and agentic capability.
- `command-a-03-2025` — 256k, text; tool use / agents / RAG.
- `command-a-reasoning-08-2025` — 256k; Cohere's first reasoning model.
- `command-a-vision-07-2025` — 128k, text + images.
- `command-a-translate-08-2025` — 8k, translation across 23 languages.
- `command-r7b-12-2024`, `command-r-08-2024`, `command-r-plus-08-2024` — 128k.
- Embed: `embed-v4.0` (128k, text + images + mixed), `embed-english-v3.0`, `embed-english-light-v3.0`, `embed-multilingual-v3.0`, `embed-multilingual-light-v3.0` (512).
- Rerank: `rerank-v4.0-pro`, `rerank-v4.0-fast` (32k), `rerank-v3.5`, `rerank-english-v3.0`, `rerank-multilingual-v3.0` (4k).
- Parse: `parse-v5.0` (document intelligence, vision).
- Audio: `cohere-transcribe-03-2026`, `cohere-transcribe-arabic-07-2026`.
- Aya: `tiny-aya-global` (3.35B, 70 languages), `tiny-aya-earth`, `tiny-aya-fire`, `tiny-aya-water`, `c4ai-aya-expanse-32b`, `c4ai-aya-vision-32b`.

### Runtime contract notes

- **Tool use (Chat v2)**: request carries `model`, `messages`, and `tools` (JSON Schema with `name`, `description`, `parameters`). The response returns a **`tool_plan`** — the model's stated reflection on next steps — *alongside* `tool_calls` (`id`, `type: "function"`, `function.name`, `function.arguments` as a JSON string). **`tool_plan` is Cohere-specific and has no OpenAI analogue; harnesses ported from OpenAI silently drop it.**
- **Tool results have an unusual shape**: role `"tool"`, `tool_call_id`, and `content` as an **array of document objects** (`{type: "document", document: {data, id?}}`), not a plain string. A real porting hazard.
- Responses include **fine-grained citations** automatically, with sources, text spans, and tool-output references.
- **Structured outputs**: `response_format` supports `{"type": "json_object"}` and full **JSON Schema mode**. Top level must be an object; every object needs at least one required field. Supported on Command A+, Command A, Command R+ (08-2024 and standard), Command R (08-2024 and standard).
- **JSON mode requires an explicit prompt instruction.** Cohere states the prompt "should always explicitly instruct the model to generate a JSON" — **without it the model may produce an infinite character stream and exhaust the context length.** This is a concrete, vendor-documented production failure mode.
- JSON Schema mode supports only a **subset** of JSON Schema: `minLength`, `maxLength`, `minimum`, `maximum`, `minItems`, `maxItems`, and certain regex patterns are **unsupported**. Schema processing adds first-request latency, cached thereafter.
- **`strict_tools=True`** (Chat v2) enforces tool definitions and prevents hallucinated tool names and parameters. **Cap: 200 fields across all tools.**
- **Reasoning toggle**: `thinking={"type": "enabled"}` (default) / `{"type": "disabled"}`, with budget via `thinking={"token_budget": N}`. Cohere recommends leaving at least 1K tokens for the response and suggests 31K as an optimal budget. Reasoning returns as **content blocks** — `content.type == "thinking"` vs `content.type == "text"` — and streams as `event.delta.message.content.thinking` / `...content.text`. Documented against `command-a-reasoning-08-2025`; the Command A+ page also references enabling and disabling `thinking`.

### Deployment & residency

- Targets: **Cohere Platform, AWS Bedrock, AWS SageMaker, Microsoft Azure (serverless), Oracle Cloud Infrastructure, and Private Deployment.** SDKs in TypeScript, Python, Go, Java — **support varies by platform** (Go and Java on Bedrock/SageMaker listed as "coming soon").
- **Private deployment**: on-premises or VPC (AWS/Azure/GCP/OCI). Containerized components typically on Kubernetes (not strictly required): API endpoints, model management/storage, a serving framework, and a fine-tuning framework. Cohere states **"the data never leaves your environment, and the model can be fully network-isolated"** — air-gapped operation is supported.
- Command A+ is explicitly positioned for **sovereign critical infrastructure**, with private deployment for enterprise and public-sector control. For a Sovereignty & Residency dimension, Cohere is the clearest "bring the model to the data" option among Western vendors.
- Which specific models are available for private deployment: **not documented on the overview page as of 2026-09-08.** No formal data-residency/region policy page was found.

### Retired

- **Retired 2026-04-04**: `embed-english-v2.0`, `embed-english-light-v2.0`, `embed-multilingual-v2.0`, `c4ai-aya-expanse-8b`, `c4ai-aya-vision-8b`. Replacements: `embed-english-v3.0` / `embed-multilingual-v3.0` / `embed-v4.0`; for chat, `command-r7b-12-2024`, `command-a-03-2025`, or `command-a-reasoning-08-2025`.
- **Deprecated 2025-09-15**: `command-r-03-2024` (alias `command-r`), `command-r-plus-04-2024` (alias `command-r-plus`), `command-light`, `command`, `summarize`. Replacements: `command-r-08-2024`, `command-r-plus-08-2024`, `command-a-03-2025`. Fine-tuning discontinued for `command-light`, `command`, `command-r`, `classify`, `rerank`.
- **Shut down 2025-04-30** (announced 2024-12-02): `rerank-english-v2.0`, `rerank-multilingual-v2.0` → `rerank-v3.5`.
- **2025-03-08**: fine-tuned Command-R-03-2024 models lost support; migrate to the Command-R-08-2024 base.
- **2025-01-31**: the Classify endpoint via default Embed models is no longer supported; it requires fine-tuned Embed models.

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

### Sourcing gaps

- Command A+ context is stated as "128K" in the models table but "128K input, 64K output" in the changelog — use the changelog figures.
- Model availability for private deployment, and a formal data-residency/region policy, are undocumented.

---

## IBM Granite

**Status: VERIFIED. The best-documented self-hosting contract of any family in this brief — recommend including it as a profile.**

### Current models

- **`ibm-granite/granite-4.2-30b`** (29B), **`ibm-granite/granite-4.2-8b`** (9B), **`ibm-granite/granite-4.2-3b`** (4B) — the current language line, all updated within days of 2026-09-08. GGUF variants published under the same org (`granite-4.2-30b-GGUF`, etc.).
- IBM describes the 4.2 line as "efficient reasoning and thinking language models for multilingual generation, coding, and AI assistant workflows," purpose-built for agentic workflows: 3B for edge, 8B balanced general-purpose, 30B flagship.
- Six Granite families: **Granite Language, Granite Speech, Granite Vision, Granite Guardian, Granite Embedding, Granite Time Series.**
- **License: Apache-2.0**, released with cryptographic signatures, ISO certification, and transparency disclosures.
- `granite-4.2-30b` is **text-only** (decoder-only transformer). Vision is a separate Granite family.

### Runtime contract notes

- **Context: 128K native, extendable to 512K** (the 512K extension is called out for the 30B).
- **Three-way thinking switch, toggled via chat-template kwargs to `apply_chat_template()`** — the cleanest such contract in this set:
  - Full thinking (**default**): `enable_thinking=True` → chain-of-thought inside `<think>...</think>`
  - Non-thinking: `enable_thinking=False`
  - **Low-effort**: `enable_thinking=True, low_effort=True` → brief reasoning
- Tool calling uses **OpenAI's function definition schema**; the model reasons about tool selection first, then emits **`<tool_call>` blocks**.
- **Sampling is prescriptive**: IBM says use **`temperature=1.0` and `top_p=0.95` across all tasks and serving backends**, with `max_new_tokens=8192` for thinking mode. This contradicts the usual low-temperature default for agentic work and is worth honoring.
- Architecture (8B): GQA with 32 attention heads / 8 KV heads, RoPE, separate input and output embeddings.

### Deployment & residency

- Vendor-documented serving stacks: **vLLM, SGLang, Transformers**, plus quantized formats for **llama.cpp and Ollama**.
- **vLLM flags IBM documents, exactly:**
  - `--reasoning-parser granite_thinking_parser`
  - `--tool-call-parser qwen3_coder` — **note: the tool parser is not a Granite-named parser.** Self-hosters who guess a `granite` parser name get malformed tool calls. This is the archetypal "what breaks when self-hosted" fact.
  - `--enable-auto-tool-choice`
  - `--max-model-len 131072` (for 128K)
  - `--dtype bfloat16`
- **SGLang**: `python3 -m sglang.launch_server --model-path ibm-granite/granite-4.2-30b --reasoning-parser auto --tool-call-parser auto`
- Integrates with agentic frameworks (OpenCode, Pi, OpenHands) via OpenAI-compatible APIs.
- Availability IBM lists: Hugging Face, Ollama, LM Studio, watsonx.ai, OpenRouter, Replicate, Weights & Biases, Unsloth, AnythingLLM; enterprise via watsonx and **Red Hat Enterprise Linux AI**. Deployment across cloud, on-premises, and edge.
- Residency: not vendor-stated in the pages fetched.

### Retired

IBM publishes no deprecation table with dated retirements and replacements for Granite model IDs — **not publicly documented as of 2026-09-08.** Granite 4.0 and 4.1 have their own doc pages and appear superseded rather than formally retired.

### Primary sources

- [IBM Granite](https://www.ibm.com/granite)
- [Granite 4.2 docs](https://www.ibm.com/granite/docs/models/granite4-2)
- [IBM Granite HuggingFace org](https://huggingface.co/ibm-granite)
- [granite-4.2-8b model card](https://huggingface.co/ibm-granite/granite-4.2-8b)
- [granite-4.2-30b model card](https://huggingface.co/ibm-granite/granite-4.2-30b)

### Sourcing gaps

No deprecation table. SGLang and Ollama flags beyond `auto` are thin. Per-model detail for the Speech / Vision / Guardian / Embedding / Time-Series families was not fetched.

---

## OpenAI open-weight (gpt-oss)

**Status: VERIFIED but stale. Includable on the harmony-format requirement alone.**

### Current models

- **`openai/gpt-oss-120b`** — 117B total / 5.1B active MoE. Last updated **2025-08-26**.
- **`openai/gpt-oss-20b`** — 21B total / 3.6B active. Last updated **2025-08-26**. Runs within 16GB memory.
- **`openai/gpt-oss-safeguard-120b`** (updated 2025-10-29) and **`openai/gpt-oss-safeguard-20b`** (updated 2026-01-14) — safety-reasoning variants for LLM input/output filtering and Trust & Safety content labeling.
- Also in the org: `openai/privacy-filter`, `openai/circuit-sparsity`, and the Whisper line.
- **License: Apache-2.0.**

### Runtime contract notes

- **The harmony response format is mandatory.** OpenAI states the models were trained on it and "should only be used with the harmony format as it will not work correctly otherwise." If calling `model.generate` directly you must apply it via the chat template or the **`openai-harmony`** package. This is the highest-risk self-hosting fact in this family.
- **Reasoning effort has three levels — Low / Medium / High — set in the system prompt**, literally as e.g. `Reasoning: high`. It is *not* an API parameter at the weights level.
- Capabilities: function calling with defined schemas, web browsing via built-in tools, Python execution, structured outputs.
- **Context window: not stated on any vendor page successfully fetched — not verified as of 2026-09-08.** (`openai.com/index/introducing-gpt-oss/` returned HTTP 403.)

### Deployment & residency

- Documented stacks: **vLLM, Transformers (including an OpenAI-compatible Serve option), Ollama, LM Studio, llama.cpp**; the safeguard card adds **SGLang and Docker Model Runner**.
- The documented vLLM command is minimal: `vllm serve openai/gpt-oss-20b`. **No tool-call-parser or reasoning-parser flag is documented** — the harmony format is expected to carry that structure instead.
- **MXFP4 quantization of MoE weights** enables single-80GB-GPU deployment for the 120b.
- Residency: not applicable / not vendor-stated.

### Retired

No deprecation or retirement notices for gpt-oss repos — **not publicly documented as of 2026-09-08.** Nothing has been removed from the org.

### Primary sources

- [OpenAI HuggingFace org](https://huggingface.co/openai)
- [gpt-oss-120b](https://huggingface.co/openai/gpt-oss-120b)
- [gpt-oss-20b](https://huggingface.co/openai/gpt-oss-20b)
- [gpt-oss-safeguard-120b](https://huggingface.co/openai/gpt-oss-safeguard-120b)

---

## Microsoft Phi

**Status: THIN. Too thin to be load-bearing as its own profile; fold into a combined note if used at all.**

- **There is no Phi-5.** Microsoft's own HuggingFace org, sorted by last-modified, shows the newest Phi repo as **`microsoft/Phi-4-reasoning-vision-15B`** (updated roughly a week before 2026-09-08); `microsoft/phi-4` was last updated 2026-07-14. Claims of a Phi-5 release trace to a third-party GPU-hosting blog and are **not corroborated by any Microsoft-owned page**. Do not propagate them.
- **`microsoft/Phi-4-reasoning-vision-15B`** — released 2026-03-04. 15B params. **MIT license.** **16,384-token context.** Text + image in, text out. Mid-fusion: Phi-4-Reasoning backbone plus a SigLIP-2 vision encoder, up to 3,600 visual tokens with dynamic resolution.
- **Dual-mode reasoning**: `<think>...</think>` blocks for multi-step reasoning; a **`<nothink>`** tag for direct perception tasks. **The model auto-selects the mode**, though either can be forced with appended tokens — so there is no clean boolean switch. Requires a detailed system prompt / chat template that establishes the dual-mode behavior. Chat template uses `<|im_start|>` and `<|im_sep|>`.
- **Tool calling is not documented on the Phi-4-reasoning-vision-15B card — not publicly documented as of 2026-09-08.** Structured-output path likewise undocumented.
- Deployment: **vLLM server, bf16**. Stated requirements `torch >= 2.7.1`, `transformers >= 4.57.1`, `vllm >= 0.15.2`. Tested on A6000 / A100 / H100 / B200, Ubuntu 22.04.5 LTS. **No tool-call-parser or reasoning-parser flag documented** — a real gap for server-side parsing of `<think>` blocks.
- Residency: not vendor-stated. No deprecation table.

### Primary sources

- [Microsoft HuggingFace org, sorted by modified](https://huggingface.co/microsoft/models?sort=modified)
- [Phi-4-reasoning-vision-15B](https://huggingface.co/microsoft/Phi-4-reasoning-vision-15B)

### Sourcing gaps

`azure.microsoft.com/en-us/products/phi` **timed out** and is unreachable in this pass.

---
## Chinese open-weight families — cross-cutting findings

Read these before writing any of the five profiles below. They are the findings that generalise, and several contradict what a 2026-06-era reference would say.

**1. Permissive licensing is no longer the norm.** Only DeepSeek V4 is still plain MIT. Qwen's flagship moved to a bespoke "Qwen3.8-Max License", Kimi K3 to a "Kimi K3 License" carrying a US$20M Model-as-a-Service revenue trigger, GLM-5.3 to a "GLM-5.3 License", and **MiniMax M3 and M2.7 are non-commercial by default**, with MiniMax H3 carrying an explicit territorial restriction. Any guidance that says "these are open-source MIT models" is now wrong for four of five families. **Licenses vary per repo within a family** — GLM-5.3 is custom but GLM-5.3-Flash is MIT; Qwen3.5 is Apache-2.0 but Qwen3.8 is not. Check the individual repo, never the family.

**2. The newest flagship model cards have stopped publishing serving parser flags.** They delegate to `recipes.vllm.ai`, `cookbook.sglang.io`, and similar — third-party, and therefore outside the sourcing rule. Exact `--tool-call-parser` / `--reasoning-parser` names are vendor-documented only for the *previous* generation in every family:

| Family | Vendor-documented parsers | Generation they cover | Current flagship |
| --- | --- | --- | --- |
| Qwen | `--reasoning-parser qwen3`, `--tool-call-parser qwen3_coder` | Qwen3.5, Qwen3.6 | Qwen3.8 — **not documented** |
| Moonshot / Kimi | `--tool-call-parser kimi_k2`, `--reasoning-parser kimi_k2` | K2.6, K2.7-Code | K3 — **not documented** |
| Zhipu / GLM | `--tool-call-parser glm47`, `--reasoning-parser glm45` | GLM-5, GLM-4.7 | GLM-5.1+ — **not documented** |
| MiniMax | vLLM `minimax_m2` / `minimax_m2_append_think`; SGLang `minimax-m2` / `minimax-append-think` | M2 family | M3 — only `auto` is stated |
| DeepSeek | none | — | V4 — **no serving-stack path documented at all** |

**This is the single largest gap in the pass.** Do not guess a parser name; a guessed name produces malformed tool calls, not an error.

**3. Two flagships have abandoned Jinja chat templates for Python reference encoders.** DeepSeek V4 ships `encoding_dsv4.py` with DSML tool-call markup, and Kimi K3 ships `encoding_k3.py` with XTML markers. Neither ships a `chat_template.jinja`. Self-hosting either with working tool calls depends on third-party engine support the vendors link to but do not author.

**4. Every family now requires echoing reasoning state back, with different rules and different failure modes.** This is the most likely source of silent production breakage in a cross-model harness:

| Family | Rule | Failure mode if violated |
| --- | --- | --- |
| DeepSeek | Prior `reasoning_content` must be echoed **when `tools` are present** — even for turns with no tool call. Ignored entirely when no `tools`. | **Hard 400** |
| Moonshot / Kimi | Mandatory always on K3 and K2.7-Code ("preserved thinking history mode"): the complete assistant message including `reasoning_content` and `tool_calls`. | Degraded behavior; field may be `reasoning` not `reasoning_content` on some engines |
| Zhipu / GLM | Gated by `thinking.clear_thinking`, whose default is **`true` on the standard API, `false` on the Coding Plan endpoint, and `false` in the 5.3 chat template** | Silent quality and cache-hit loss |
| MiniMax | Mandatory, but the representation differs across all three protocol surfaces | Interleaved thinking stops working |
| Qwen | Opt-in via `preserve_thinking`, **off by default** | Accuracy degrades; no error |

**5. Self-hosted and vendor-API call shapes diverge for the same feature.** Qwen: self-hosted needs `extra_body={"chat_template_kwargs": {...}}` while Qwen Cloud takes the same keys bare in `extra_body`. Kimi: `chat_template_kwargs` self-hosted vs a `thinking` request field on the API. GLM: `clear_thinking` default is inverted between the two. **Code written against one silently no-ops against the other** — no error, just a feature that stops applying.

**6. Structured output is much weaker than commonly assumed.** Only Qwen documents a strict `json_schema` path (on "selected models"), and Kimi documents one under its own MFJS dialect. DeepSeek and GLM are `json_object`-only. **MiniMax documents no schema path at all for M3 or M2.x.** For four of five families, tool calling is the vendor-blessed route to structured data.

**7. Anthropic-compatible endpoints are now universal** across all five: DeepSeek `/anthropic`, Qwen `/apps/anthropic` (three plan-specific hosts), Kimi `/anthropic/v1/messages`, GLM `/api/anthropic`, MiniMax `/anthropic`. Three families (DeepSeek, GLM, Kimi) also use a **`[1m]` model-ID suffix** convention for 1M context in Claude Code, and **none of them documents what the suffix means** outside those integration examples.

**8. Residency, where stated, is Singapore-centric for the international tiers.** Kimi: "secure servers located in Singapore." GLM: "generally processed in Singapore," Singapore-registered operator. Qwen: `ap-southeast-1` and the phrase "the Beijing and Singapore regions." MiniMax states only base-URL routing (`api.minimax.io` vs `api.minimax.cn`). **DeepSeek states nothing reachable at all.**

---

## DeepSeek

**Status: VERIFIED. The deprecation claim in the 2026-06 reference was correct, but needs two corrections — see Retired.**

### Current models

| Model ID | Version | Architecture | Context | Max output |
| --- | --- | --- | --- | --- |
| `deepseek-v4-flash` | DeepSeek-V4-Flash-0731 | 284B total / 13B activated MoE | 1M | 384K |
| `deepseek-v4-pro` | DeepSeek-V4-Pro-0813 | 1.6T total / 49B activated MoE | 1M | 384K |
| `deepseek-v4-flash-vision-exp` | experimental vision | matches V4-Flash on text | 1M | 384K |

All three support both thinking and non-thinking modes. The vision model bills images at up to 384 tokens each and **does not support FIM completion** (the other two support FIM in non-thinking mode only).

Open weights: `deepseek-ai/DeepSeek-V4-Pro`, `DeepSeek-V4-Pro-Base`, `DeepSeek-V4-Flash`, `DeepSeek-V4-Flash-Base`, `DeepSeek-V4-Flash-Vision-Exp`. Base repos are FP8 Mixed; instruct repos are FP4+FP8 Mixed with MoE experts in FP4. Adjacent: `deepseek-ai/DeepSeek-Math-V2` (Apache-2.0), `deepseek-ai/DeepSeek-OCR-2`.

DeepSeek-V4-Pro-0813 introduced three thinking effort levels: `low` / `high` / `max`.

### Runtime contract notes

- **Three protocol surfaces.** OpenAI Chat Completions and the OpenAI **Responses API** both at `https://api.deepseek.com`; Anthropic Messages at `https://api.deepseek.com/anthropic`.
- **Anthropic model-name mapping:** `claude-opus*` → `deepseek-v4-pro`; `claude-haiku*` and `claude-sonnet*` → `deepseek-v4-flash`. **Any unsupported model name silently maps to `deepseek-v4-flash`** rather than erroring. `anthropic-version` and `anthropic-beta` headers are **ignored** on `/messages`.
- **Thinking toggle differs per protocol.** OpenAI: `{"thinking": {"type": "enabled" | "disabled"}}` plus `reasoning_effort` (`low` / `high` / `max`). Anthropic: `{"reasoning": {"effort": "none" | "low" | "high" | "max"}}` where `none` disables, plus `output_config.effort`. Thinking is **on by default at effort `high`**. `medium` and `xhigh` are accepted and silently remapped to `high`.
- **Thinking mode silently ignores `temperature`, `top_p`, `presence_penalty`, and `frequency_penalty`** — they are accepted without error and have no effect.
- **Reasoning-state echo rule, and it is conditional on `tools`:** a request **without** `tools` need not pass `reasoning_content` back (if passed it is ignored and not concatenated into context). A request **with** `tools` must pass back `reasoning_content` for **all previous turns — including turns with no tool call — or the API returns a 400.** Reasoning arrives in a `reasoning_content` field sibling to `content`; `usage` carries `reasoning_tokens`.
- **Structured output is JSON-mode only.** `response_format` supports `{"type": "json_object"}`; there is no `json_schema`. You must also include the word "json" in a system or user message. The docs warn JSON output "may occasionally return empty content."
- Tool calling is OpenAI-shaped, **max 128 functions**, `tool_choice` supports `none` / `auto` / `required` / named. A `strict` schema-compliance mode exists and is marked **Beta**, requiring the base URL `https://api.deepseek.com/beta`.
- `finish_reason` includes a non-standard value: `insufficient_system_resource`.
- `user_id` (via `extra_body`) provides content-safety, KV-cache, and scheduling isolation. Concurrency limits: v4-pro 500, v4-flash and vision-exp 2500.
- DeepSeek's published Codex model catalog declares `context_window: 1048576`, `apply_patch_tool_type: "freeform"`, `supports_parallel_tool_calls: true`, effort levels low/high/max.

### Deployment & residency

- **License: MIT** for all V4 weights — "This repository and the model weights are licensed under the MIT License." **DeepSeek is the only one of these five families still on a fully permissive license.**
- **No Jinja chat template is shipped.** Verbatim: "This release does not include a Jinja-format chat template. Instead, we provide a dedicated `encoding` folder with Python scripts." You call `encode_messages(messages, thinking_mode=...)` and `parse_message_from_completion_text(...)` from `encoding_dsv4.py`. The vendor notes the parser "does not attempt to correct or recover from malformed output."
- **DeepSeek documents no vLLM, SGLang, TensorRT-LLM, or llama.cpp path for V4** — zero mentions across the model card and encoding docs, and there is no `DeepSeek-V4` GitHub repo under `deepseek-ai`. The only vendor-documented local path is their own `inference/` reference implementation: `convert.py` then `torchrun generate.py --nproc-per-node ${MP}`, single- or multi-node. Vendor local-deploy recommendation: `temperature = 1.0`, `top_p = 1.0`; for Think Max, a context window of at least 384K.
- **The tool-calling wire format is proprietary DSML, not OpenAI JSON.** Tool calls are emitted inside `<｜DSML｜tool_calls｜>` / `<｜DSML｜invoke name="fn"｜>` / `<｜DSML｜parameter name="p" string="true"｜>` markup, where `string="true"` means a raw string and `string="false"` means a JSON value. Tool results come back wrapped in `<tool_result>` inside **user** messages, sorted to match the preceding `tool_calls` order. Special tokens: `<｜begin▁of▁sentence｜>`, `<｜User｜>`, `<｜Assistant｜>`, `<think>` / `</think>`, `<｜latest_reminder｜>`.
- **Self-hosted thinking control is a function kwarg, not a request field:** `thinking_mode="thinking" | "chat"` (chat mode emits `</think>` immediately after `<｜Assistant｜>`), plus `drop_thinking` (default `True`) which is **automatically disabled when tools are present** — mirroring the hosted API's 400-on-missing-reasoning rule.
- `reasoning_effort="max"` prepends a literal "Reasoning Effort: Absolute maximum with no shortcuts permitted…" block before the system message.
- Roles supported by the encoder: `system`, `user`, `assistant`, `tool`, `latest_reminder`, `developer` — but "the official API does not accept messages with" the `developer` role.
- **Residency: no vendor-owned page reachable.** The privacy policy at `platform.deepseek.com/downloads/...` returns HTTP 403 and the `cdn.deepseek.com` policy URL did not resolve. **No hosting-location or data-retention claim is recorded.**

### Retired

**The claim in the 2026-06 reference was correct. Verified verbatim from the 2026-04-24 V4 release page:**

> "⚠️ Note: deepseek-chat & deepseek-reasoner will be fully retired and inaccessible after Jul 24th, 2026, 15:59 (UTC Time). (Currently routing to deepseek-v4-flash non-thinking/thinking)."

**Two corrections downstream tasks must carry:**

1. The retirement time is **2026-07-24 at 15:59 UTC**, not midnight — and that date is now roughly six weeks past, so these IDs are **already dead**. Write "retired," not "will be discontinued."
2. The mapping is **mode-split, not single**: `deepseek-chat` → `deepseek-v4-flash` **non-thinking**; `deepseek-reasoner` → `deepseek-v4-flash` **thinking**. Saying they "map to `deepseek-v4-flash`" is true but loses the distinction.

Prior lineage from `/updates`: 2025-12-01 both IDs → V3.2; 2025-09-29 → V3.2-Exp; 2025-09-22 → V3.1-Terminus; 2025-08-21 → V3.1; 2025-05-28 `deepseek-reasoner` → R1-0528; 2025-03-24 `deepseek-chat` → V3-0324. The V3.2-Speciale temporary endpoint expired 2025-12-15 15:59 UTC.

**Note the discovery hazard: the pricing page carries no deprecation notices.** The retirement lives only on the changelog/news pages. A reader checking "what models can I call" against the pricing page would never learn a model was retired.

### Primary sources

- [DeepSeek API updates](https://api-docs.deepseek.com/updates)
- [V4 release note, 2026-04-24](https://api-docs.deepseek.com/news/news260424)
- [V4-Pro GA, 2026-08-13](https://api-docs.deepseek.com/news/news260813)
- [V4-Flash-Vision-Exp, 2026-08-21](https://api-docs.deepseek.com/news/news260821)
- [Models and pricing](https://api-docs.deepseek.com/quick_start/pricing)
- [Thinking mode](https://api-docs.deepseek.com/guides/thinking_mode)
- [Tool calls](https://api-docs.deepseek.com/guides/tool_calls)
- [Anthropic API compatibility](https://api-docs.deepseek.com/guides/anthropic_api)
- [Responses API](https://api-docs.deepseek.com/guides/responses_api)
- [JSON mode](https://api-docs.deepseek.com/guides/json_mode)
- [Create chat completion reference](https://api-docs.deepseek.com/api/create-chat-completion)
- [DeepSeek-V4-Pro model card](https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro)
- [DeepSeek-V4-Flash model card](https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash)
- [deepseek-ai HuggingFace org](https://huggingface.co/deepseek-ai)

### Sourcing gaps

- Hosting location, data residency, and retention: **no vendor-owned page reachable** (403 and dead URLs).
- Semantics of the `deepseek-v4-pro[1m]` model-ID suffix, which appears only in the Claude Code integration guide: **not publicly documented as of 2026-09-08.**
- vLLM / SGLang / TensorRT-LLM support for V4: **not documented by DeepSeek.** This is an absence of mention, not an explicit denial.
- There is no error-code page entry for the tools-plus-missing-`reasoning_content` 400; that rule is stated only in the thinking-mode guide.

---

## Qwen (Alibaba)

**Status: VERIFIED, with an important documentation caveat.** Alibaba has moved the developer-facing surface to **QwenCloud** (`www.qwencloud.com`, `docs.qwencloud.com`), fronting DashScope endpoints. QwenCloud also resells non-Qwen models (GLM, Kimi, DeepSeek), so its model list is not all first-party.

**`qwen.readthedocs.io` is stale.** It documents Qwen3 (2504) and Qwen3-2507 as the current generation, while the vendor's own HuggingFace org publishes **Qwen3.8**. The task brief names `qwen.readthedocs.io` as the Qwen source; it is still accurate for the deployment-framework pages it covers but **must not be used as the current-lineup source.**

### Current models

**API model IDs (QwenCloud):** `qwen3.8-max`, `qwen3.8-max-0902`, `qwen3.8-flash`, `qwen3.7-max` (plus snapshots `-2026-06-08`, `-2026-05-20`, `-2026-05-17`, `-preview`), `qwen3.7-plus` (+`-2026-05-26`), `qwen3.7-flash` (+`-2026-07-15`), `qwen3.6-plus` (+`-2026-04-02`), `qwen3.6-flash`, `qwen3.6-max-preview`, `qwen3.8-27b`, `qwen3.8-2.4t-a95b`. Also `qwen-flash-character` (roleplay), `qwen-mt-image-2.0`, `qwen-image-3.0`, `wan3.0-video` / `-prime`, `fun-asr`, `cosyvoice-v3.5-plus`.

**Open weights (HF `Qwen` org):** `Qwen/Qwen3.8-2.4T-A95B` (+`-FP8`), `Qwen/Qwen3.8-27B` (+`-FP8`), `Qwen/Qwen3.8-Flash-Next` (+`-FP8`), `Qwen/Qwen3.6-35B-A3B` (+`-FP8`), `Qwen/Qwen3.6-27B` (+`-FP8`), `Qwen/Qwen3.5-397B-A17B` (+`-FP8`, `-GPTQ-Int4`), `Qwen/Qwen3.5-122B-A10B` (+`-FP8`, `-GPTQ-Int4`), `Qwen/Qwen3.5-27B`. Adjacent: `Qwen/Qwen3-ASR-0.6B-hf`, `Qwen3-ASR-1.7B-hf`, `Qwen3-ForcedAligner-0.6B-hf`, `Qwen/Qwen-AgentWorld-35B-A3B`, `Qwen/Qwen-Drive-1.0-4B`, `Qwen/WebWorld-{8B,14B,32B}`, and a `Qwen/SAE-Res-*` interpretability family.

`Qwen/Qwen3.8-27B` is a vision-language model with native image and video understanding, **Apache-2.0**, context **262,144 native, extensible to 1,000,000**.

Vendor-stated relationship between hosted and open: "**Qwen3.8-Max** is the official version based on Qwen3.8-2.4T-A95B with more features, such as vision input & non-thinking support, 1M context length by default, official built-in tools." The hosted flagship is a **superset** of the open weight — a distinction worth preserving in any "use the open model instead" recommendation.

### Runtime contract notes

- **OpenAI-compatible** at `https://dashscope-intl.aliyuncs.com/compatible-mode/v1`, plus a **Responses API** and native DashScope. **Anthropic-compatible endpoints exist and differ by billing plan:** pay-as-you-go `https://dashscope-intl.aliyuncs.com/apps/anthropic`; Coding Plan `https://coding-intl.dashscope.aliyuncs.com/apps/anthropic`; Token Plan `https://token-plan.ap-southeast-1.maas.aliyuncs.com/apps/anthropic`. The vendor states plainly that mismatching key type to base URL is a common failure.
- **Thinking control has four distinct knobs**, none OpenAI-standard, all passed via `extra_body` in the Python SDK:
  - `enable_thinking` (bool) — per-request toggle on hybrid models.
  - `reasoning_effort` — levels vary by model; `qwen3.8-max` accepts `low` / `medium` / `xhigh` with **default `xhigh`**.
  - `thinking_budget` — caps thinking tokens, range **1–32768** (console default 4000). Chat Completions and DashScope only; **not supported by the Responses API**. `qwen3.8-max` **errors** if `reasoning_effort` and `thinking_budget` are both set.
  - `preserve_thinking` (bool) — see the echo rule below.
- **Reasoning-state echo rule:** "By default, models do **not** read `reasoning_content` from the `messages` array in multi-turn conversations. Set `preserve_thinking` to `true` to append the `reasoning_content` in assistant messages to the next input." Supported on `qwen3.8-max`, `qwen3.8-max-0902`, `qwen3.8-flash`, the `qwen3.7-max`/`-plus`/`-flash` families and snapshots, `qwen3.6-max-preview`, and `qwen3.6-plus`. For tool calling the guidance is stronger: "In multi-turn tool-call flows, include the assistant's `reasoning_content` when sending tool results back. **Omitting it degrades accuracy.**" Note this is a **quality warning, not a hard 400** as with DeepSeek — which makes it easier to get wrong and never notice.
- Reasoning surfaces as `reasoning_content` (Chat Completions / DashScope) or `reasoning_text` events (Responses API).
- **Prompt-level toggle:** with `enable_thinking: true`, `/no_think` skips thinking for one turn and `/think` restores it; the last instruction wins. Supported only by open-source Qwen3 hybrid models and `qwen-plus-2025-04-28`.
- **Structured output — both modes, and Qwen is the only one of these five with a documented strict path.** `{"type": "json_object"}` (most Qwen models, plus the hosted Kimi/GLM/DeepSeek on QwenCloud) does **not** strictly follow a schema and requires the word "JSON" in the prompt or the API errors. `{"type": "json_schema", "json_schema": {…, "strict": true}}` **does** strictly follow the schema but is "Selected models only." Caveat: models labelled non-thinking-mode accept `json_object` in thinking mode without error, but "structured output may not take effect."
- Vendor-run tools documented: function calling, web search, web extractor, code interpreter, image search, and MCP server connection.
- **Streaming is mandatory for some models:** Qwen3 open-source models and `qwen3.8-2.4t-a95b` **require** streaming. Qwen3.7 Max/Plus, Qwen3.6 Plus, Qwen3.5 Plus/Flash, Qwen3 Max, and Qwen3.5 open-source support non-streaming.
- Qwen3-Omni produces no audio output when thinking is enabled.

### Deployment & residency

- **Licenses have fragmented, per repo:** `Qwen/Qwen3.8-2.4T-A95B` → `license_name: qwen3.8-max`, LICENSE titled **"Qwen3.8-Max License"**. `Qwen/Qwen3.8-Flash-Next` → `license_name: qwen-community-1.0`, **"Qwen Community License 1.0"**. `Qwen/Qwen3.5-397B-A17B` → **apache-2.0**. `Qwen/Qwen3.8-27B` → **apache-2.0**. Apache-2.0 is no longer the family default.
- **Vendor-named serving stacks:** SGLang, vLLM, TokenSpeed — "compatible with vLLM, SGLang, TokenSpeed, etc."; "For production workloads… dedicated serving engines such as SGLang, vLLM, or TokenSpeed are recommended."
- **Exact parser flags, vendor-documented on the Qwen3.5 and Qwen3.6 cards only:**

  ```
  vllm serve Qwen/Qwen3.6-35B-A3B --tensor-parallel-size 8 --max-model-len 262144 \
    --reasoning-parser qwen3 --enable-auto-tool-choice --tool-call-parser qwen3_coder

  python -m sglang.launch_server --model-path Qwen/Qwen3.6-35B-A3B --tp-size 8 \
    --context-length 262144 --reasoning-parser qwen3 --tool-call-parser qwen3_coder
  ```

  The Qwen3.8 flagship card carries **only** bare `vllm serve "Qwen/Qwen3.8-27B"` and `python3 -m sglang.launch_server --model-path "Qwen/Qwen3.8-27B" …` with no parser flags, linking out to third-party cookbooks instead. **The correct parser names for Qwen3.8 are not vendor-documented as of 2026-09-08.**
- **Self-hosted and cloud use a different call shape for the same feature**, stated explicitly by the vendor: self-hosted takes `extra_body={"chat_template_kwargs": {"enable_thinking": True, "preserve_thinking": True}}`; **Qwen Cloud takes `extra_body={"enable_thinking": True, "preserve_thinking": True}`** with no `chat_template_kwargs` wrapper. Code written against one silently no-ops against the other.
- **Thinking cannot be disabled on `Qwen3.8-2.4T-A95B`:** "a text-only model that requires thinking mode for all interactions… thinking cannot be disabled. Every response will automatically begin with reasoning enclosed in `<think>\n...</think>\n\n`." `Qwen3.8-27B` is hybrid with thinking **on by default**, disabled with `chat_template_kwargs: {"enable_thinking": False}`.
- **Long context needs explicit YaRN overrides on both engines** — `VLLM_ALLOW_LONG_MAX_MODEL_LEN=1` plus `--hf-overrides '{"text_config":{"rope_parameters":{…,"rope_type":"yarn","factor":4.0,"original_max_position_embeddings":262144}}}' --max-model-len 1010000`, and the SGLang equivalent with `SGLANG_ALLOW_OVERWRITE_LONGER_CONTEXT_LEN=1 --json-model-override-args … --context-length 1000000`. **1M is not the default self-hosted context**; 262,144 is.
- Recommended sampling: `temperature=1.0, top_p=0.95, top_k=20, min_p=0.0, presence_penalty=0.0, repetition_penalty=1.0`. For agentic tasks within 1M context: reasoning max 262,144 tokens, final response max 131,072.
- **Residency (vendor-stated):** deprecation notices name "**the Beijing and Singapore regions**" explicitly. International endpoints are `dashscope-intl.aliyuncs.com` and `token-plan.ap-southeast-1.maas.aliyuncs.com` (ap-southeast-1 = Singapore); retirement pricing tables are quoted "based on the Singapore region." **No data-retention or compliance-posture statement was found** — only region names.

### Retired

QwenCloud publishes a formal **model deprecation policy**: snapshot models get a 30-day sunset notice, mainline models get 3 months; QPM/TPM are throttled down from the notice date; after the retirement date inference fails outright, and console features plus documentation are retired with the model.

**Scheduled 2026-10-10 00:00 (UTC+8) — legacy mainline**, replacement in parentheses: `qwen3.6-max-preview` (→ `qwen3.7-max`), `qwen3-max-preview` (→ `qwen3.7-max`), `qwen3-max` (→ `qwen3.7-max`), `qwen3-vl-flash` (→ `qwen3.6-flash`), `qwen3-coder-plus` (→ `qwen3.7-plus`).

**Scheduled 2026-10-10 — historical mainline** (→ "latest Qwen3.6/Qwen3.7 series"): `qwen-turbo`, `qwen-vl-max`, `qwen-vl-plus`, `qwq-plus`, `qvq-max`. Coding Plan and Token Plan equivalents retire simultaneously; pro-rata refunds available by ticket.

**Retired 2026-05-13 — snapshots** (→ "latest Qwen3.6 series"): `qwen-max-latest`, `qwen-max-2025-01-25`; `qwen-turbo-latest`, `qwen-turbo-2025-04-28`, `qwen-turbo-2024-11-01`; `qwen-vl-max-latest`, `-2025-08-13`, `-2025-04-08`; `qwen-vl-plus-latest`, `-2025-08-15`, `-2025-07-10`, `-2025-05-07`, `-2025-01-25`; `qvq-max-latest`, `qvq-max-2025-03-25`; and open-source snapshots `qwen2.5-vl-{3b,7b,32b,72b}-instruct`, `qwen2.5-{7b,14b}-instruct-1m`, `qwen2.5-{7b,14b,32b,72b}-instruct`, `qwen3-0.6b`, `qwen3-1.7b`, `qwen3-4b`.

**Retired 2026-05-30:** GTE-RERANK. Also scheduled 2026-10-10: `codeqwen1.5-7b-chat` (→ `qwen3.7-plus`), `cosyvoice-v3` (→ `cosyvoice-v3.5-plus`), `fun-asr-*` snapshots (→ `fun-asr`), and the `aitryon-*` / `animate-anyone-*` / `emo-*` / `emoji-*` vision families (→ `qwen-image-3.0` / `wan2.7-r2v`).

### Primary sources

- [QwenCloud](https://www.qwencloud.com/)
- [QwenCloud docs](https://docs.qwencloud.com/)
- [Model changelog](https://docs.qwencloud.com/changelog/models)
- [Model deprecation policy](https://docs.qwencloud.com/changelog/model-deprecation)
- [Mainline model deprecations](https://docs.qwencloud.com/changelog/model-deprecations/mainline-models)
- [Historical mainline deprecations](https://docs.qwencloud.com/changelog/model-deprecations/historical-mainline-models)
- [Legacy snapshot deprecations](https://docs.qwencloud.com/changelog/model-deprecations/legacy-snapshot-models)
- [Thinking guide](https://docs.qwencloud.com/developer-guides/text-generation/thinking.md)
- [Structured output guide](https://docs.qwencloud.com/developer-guides/text-generation/structured-output.md)
- [Qwen3.8-2.4T-A95B model card](https://huggingface.co/Qwen/Qwen3.8-2.4T-A95B)
- [Qwen3.8-27B model card](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Qwen3.6-35B-A3B model card](https://huggingface.co/Qwen/Qwen3.6-35B-A3B)
- [Qwen3.5-397B-A17B model card](https://huggingface.co/Qwen/Qwen3.5-397B-A17B)
- [Qwen HuggingFace org](https://huggingface.co/Qwen)
- [Qwen function calling docs (Qwen3-era)](https://qwen.readthedocs.io/en/latest/framework/function_call.html)

### Sourcing gaps

- **Parser flag names for the Qwen3.8 generation: not publicly documented as of 2026-09-08.** `--reasoning-parser qwen3` and `--tool-call-parser qwen3_coder` are confirmed only for Qwen3.5 and Qwen3.6. Note that `qwen.readthedocs.io` (Qwen3 era) documents a *different* pair — `--tool-call-parser hermes --reasoning-parser deepseek_r1` — so the parser name has changed at least twice across generations. **Never carry a parser name forward across a Qwen generation.**
- The legacy-mainline retirement list is published **only as a PNG image**, not machine-readable text; it was read visually and transcribed. Verify before relying on it programmatically.
- `alibabacloud.com/help/en/model-studio/deprecated-models` returns **404** — the deprecation record now lives on QwenCloud, not Model Studio.
- Which models support `json_schema` strict mode: the page says "Selected models only" without enumerating them.
- No vendor statement on data retention or compliance posture.
- TensorRT-LLM, llama.cpp, Ollama: not named by the vendor for the current generation (though `qwen.readthedocs.io` has dedicated pages for the Qwen3 era).

---

## Moonshot AI / Kimi

**Status: VERIFIED. Docs have moved from `platform.moonshot.ai` to `platform.kimi.ai`.**

The task brief asked specifically whether Kimi's tool-calling protocol is documented on a Moonshot-owned page. **The answer is split.** For **K2-generation** models: **yes** — `github.com/MoonshotAI/Kimi-K2/docs/tool_call_guidance.md` documents the token protocol in prose (`<|tool_calls_section_begin|>`, `<|tool_call_begin|>`, `<|tool_call_argument_begin|>`, tool IDs formatted `functions.{name}:{idx}`), explicitly for servers without a parser, and the same tokens appear in the shipped `chat_template.jinja` of the live K2.6 and K2.7-Code repos alongside a vendor `tool_declaration_ts.py`. For **K3: no.** The K3 repo ships **no `chat_template.jinja`** and no `chat_template` key in `tokenizer_config.json`; it ships `encoding_k3.py` ("Kimi K3 XTML encoding helpers") using a **different marker set** (`<|open|>`, `<|close|>`, `<|sep|>`, `<|end_of_msg|>`) with `normalize_tool_arguments` and `normalize_xtml_tool_result_messages`. **K3's tool-call protocol exists as vendor reference code only — no prose spec, no chat template, no documented parser flag. The K2 token protocol does not transfer to K3.**

### Current models

- `kimi-k3` — flagship. 2.8T total / 104B activated MoE, 93 layers, 896 experts (16 selected + 2 shared), vocab 160K, MoonViT-V2 (401M) vision encoder, **native MXFP4 weights / MXFP8 activations via quantization-aware training**. Context **1,048,576**; `max_completion_tokens` defaults to 131,072 and is settable to 1,048,576.
- `kimi-k2.7-code` and `kimi-k2.7-code-highspeed` — coding models, 256K context, native INT4. Highspeed is the same model at roughly 180 tok/s (up to 260 in short context); output speed is the only difference.
- `kimi-k2.6` — text, image, and video input; thinking and non-thinking; 256K context; native INT4. **The only current hybrid.**
- Open weights: `moonshotai/Kimi-K3`, `moonshotai/Kimi-K2.7-Code`, `moonshotai/Kimi-K2.6`. `Kimi-K2.5`, `Kimi-K2-Instruct`, `Kimi-K2-Thinking` and others remain on HF, but their API IDs are retired. **The `-highspeed` variant has no open-weight repo.**

### Runtime contract notes

- **Three surfaces:** OpenAI Chat Completions `https://api.moonshot.ai/v1/chat/completions`; OpenAI Responses `https://api.moonshot.ai/v1/responses`; **Anthropic Messages `https://api.moonshot.ai/anthropic/v1/messages`** — current, fully documented, with a dedicated Claude Code guide.
- **Reasoning-state echo rule — the strictest of these five. Verbatim:** "Kimi K3 was trained in the **preserved thinking history mode**. For multi-turn conversations and tool calls, Kimi K3 requires the complete assistant message returned by the API to be passed back to `messages` as-is — **including `reasoning_content` and `tool_calls`, not just `content`**." Same for `kimi-k2.7-code`. On the Anthropic surface, reasoning arrives as a `thinking` block **with a `signature`** that must be passed back unchanged; block order is thinking → text → tool_use; `usage` carries `thinking_tokens`.
- **Thinking is not toggleable on the flagship.** `kimi-k3` always reasons; the `thinking` parameter is unsupported and must not be passed. `kimi-k2.7-code`: `{"type": "disabled"}` **errors**; `thinking.keep` accepts only `"all"` or omission. `kimi-k2.6`: `thinking.type` `enabled` (default) / `disabled`, `thinking.keep` `null` (default, history dropped) / `"all"`.
- Effort: top-level `reasoning_effort` = `low` / `high` / `max`, **default `max`**. The Anthropic surface uses `output_config.effort` with the same ladder. **Switching effort levels invalidates prefix-cache hits.**
- **Sampling parameters are locked.** `temperature`, `top_p` (0.95), `n` (1), `presence_penalty` (0), `frequency_penalty` (0) are non-modifiable on K3, K2.7-Code, and K2.6 — passing any other value **returns an error**. Omit them. `temperature` is fixed at 1.0 for K3 and K2.7-Code.
- **Tool calling:** standard OpenAI loop off `finish_reason == "tool_calls"`. **`tool_choice: "required"` works on `kimi-k3` only** — `kimi-k2.6` and `kimi-k2.7-code` error on it. Extensions: built-in tools declared with `"type": "builtin_function"` and a `$`-prefixed name (e.g. `$web_search`); and **dynamic tool loading** by injecting a `system` message carrying its own `tools` field mid-conversation (per-request, not server-retained). Changing `tool_choice` does not bust the prefix cache; changing the tool prefix does.
- Vendor caveat: `$web_search` "is being updated and is not recommended for use in the near term" for K3. K3 users are steered to the **Formula API** instead (`GET /v1/formulas/{uri}/tools`, `POST /v1/formulas/{uri}/fibers`, URIs like `moonshot/web-search:latest`; catalog includes `web-search`, `code-runner`, `quickjs`, `memory`, `excel`, `fetch`, `rethink`).
- **Structured output:** `{"type": "json_object"}` and `{"type": "json_schema", "json_schema": {name, strict, schema}}`. Under `strict: true` the schema must conform to **MFJS (Moonshot Flavored JSON Schema)**, validatable with Moonshot's own `walle` tool (`github.com/MoonshotAI/walle`). The vendor rates `kimi-k2.7-code` most stable here (supports `anyOf` / `oneOf` / `$ref` / `additionalProperties: true`); `kimi-k2.6` is more likely to emit out-of-schema fields when strict is off.
- **Partial mode** is not a top-level parameter — it is `"partial": true` on an assistant message inside `messages`; in thinking mode that message must also carry `reasoning_content`.
- K3 vision does **not** accept public image URLs — base64 or `ms://<file-id>` only. Prefix caching engages only when the prior prompt exceeded 256 tokens.
- **One documentation inconsistency:** the Claude Code guide's table says K3 thinking is "On by default, can be turned off," contradicting three other pages. Trust the models-overview, thinking-models, and K3 quickstart pages.

### Deployment & residency

- **Licenses diverged at K3 — "Modified MIT" is no longer universal:**
  - `moonshotai/Kimi-K3` → `license_name: "kimi-k3"`, LICENSE titled **"Kimi K3 License"**. MIT-derived, but adds a **Model-as-a-Service revenue trigger**: if the licensee or its affiliates run a MaaS business exceeding **US$20M aggregate revenue over any consecutive 12 months**, a separate agreement with Moonshot is required before any commercial use. Plus attribution ("Kimi K3" displayed) for products over 100M MAU or US$20M monthly revenue. Both carve-outs are waived for purely internal use.
  - `moonshotai/Kimi-K2.7-Code` and `moonshotai/Kimi-K2.6` → `license_name: modified-mit`, **"Modified MIT License"** — MIT plus attribution above 100M MAU / US$20M monthly revenue only. **No MaaS clause.**
- **Vendor-documented serving stacks:** K2.6 and K2.7-Code — **vLLM, SGLang, KTransformers**, with `transformers >= 4.57.1, < 5.0.0`; each HF repo ships its own `docs/deploy_guidance.md`. K3 — the card *names* vLLM, SGLang, and TokenSpeed but links only to third-party recipes; **there is no `docs/deploy_guidance.md` in the K3 HF repo (404) and none in `github.com/MoonshotAI/Kimi-K3`.**
- **Exact parser flags, K2.6 and K2.7-Code only:**

  ```
  vllm serve $MODEL_PATH -tp 8 --mm-encoder-tp-mode data --trust-remote-code \
    --tool-call-parser kimi_k2 --reasoning-parser kimi_k2

  sglang serve --model-path $MODEL_PATH --tp 8 --trust-remote-code \
    --tool-call-parser kimi_k2 --reasoning-parser kimi_k2
  ```

  Both are `kimi_k2`, not `kimi_k2_6`. The vendor states `--tool-call-parser kimi_k2` is **required** to enable tool calling and `--reasoning-parser kimi_k2` is required for correct reasoning handling. Pins: vLLM 0.19.1 manually verified; SGLang `>= 0.5.10.post1`. **No vendor-stated parser name exists for K3.**
- **Self-hosted thinking is a chat-template kwarg, not a request field:** `extra_body={'chat_template_kwargs': {"thinking": False}}` for K2.6 instant mode; `{"thinking": True, "preserve_thinking": True}` for preserved thinking. The K2.6 card shows the official-API form and the vLLM/SGLang form side by side. Confirmed in the vendor's `chat_template.jinja` (`preserve_thinking | default(false)`).
- **What breaks self-hosted:** video-in-chat is "an experimental feature and is only supported in our official API for now." The K2.7-Code card warns "Some API (e.g. vLLM) may not support `reasoning_content`, you can try `reasoning` instead" — **the field name for echoing preserved thinking is not stable across engines**, which is a live hazard given the mandatory echo rule. Context caching, Formula tools, `$web_search`, and the batch and files APIs are platform-only. Moonshot publishes `github.com/MoonshotAI/Kimi-Vendor-Verifier` to check that third-party deployments match theirs.
- **Residency (vendor-stated):** the privacy agreement says the service is "provided and controlled by MOONSHOT AI PTE. LTD. … in Singapore" and "We store the information we collect in **secure servers located in Singapore**," repeated under the EEA / Switzerland / UK terms. A separate China platform exists at `platform.kimi.com` with API root `https://api.moonshot.cn`, the same three protocol paths, and **an identical model lineup and identical retirement dates**.

### Retired

| Model IDs | Retired | Replacement |
| --- | --- | --- |
| `kimi-k2.5` | 2026-08-31 (16:00) — calls now return 404 "model not found" | `kimi-k3` |
| `moonshot-v1-8k`, `-32k`, `-128k`, `-auto`, `-8k-vision-preview`, `-32k-vision-preview`, `-128k-vision-preview` | 2026-08-31 | `kimi-k3` |
| `kimi-k2-0905-preview`, `kimi-k2-0711-preview`, `kimi-k2-turbo-preview`, `kimi-k2-thinking`, `kimi-k2-thinking-turbo` | 2026-05-25 | `kimi-k3` |
| `kimi-latest` | 2026-01-28 | `kimi-k3` |
| `kimi-thinking-preview` | 2025-11-11 | `kimi-k3` |

The same 2026-08-31 changelog entry carries three integration-breaking changes: Files API IDs now carry a `file_` prefix; images are no longer OCR'd for text extraction (use `purpose=image` for vision); and same-name uploads are auto-renamed server-side.

### Primary sources

- [Kimi platform docs index](https://platform.kimi.ai/docs/introduction)
- [Models](https://platform.kimi.ai/docs/models)
- [Models overview / parameter reference](https://platform.kimi.ai/docs/api/models-overview)
- [Chat API](https://platform.kimi.ai/docs/api/chat)
- [Anthropic Messages API](https://platform.kimi.ai/docs/api/messages)
- [Platform changelog](https://platform.kimi.ai/docs/platform-changelog)
- [Kimi K3 quickstart](https://platform.kimi.ai/docs/guide/kimi-k3-quickstart)
- [Thinking models guide](https://platform.kimi.ai/docs/guide/use-thinking-models)
- [Tool calls guide](https://platform.kimi.ai/docs/guide/use-kimi-api-to-complete-tool-calls)
- [Response format guide](https://platform.kimi.ai/docs/guide/response_format)
- [Privacy agreement](https://platform.kimi.ai/docs/agreement/userprivacy)
- [Kimi-K3 model card](https://huggingface.co/moonshotai/Kimi-K3)
- [Kimi-K2.7-Code model card](https://huggingface.co/moonshotai/Kimi-K2.7-Code)
- [Kimi-K2.6 model card](https://huggingface.co/moonshotai/Kimi-K2.6)
- [Kimi K2 tool-call guidance](https://github.com/MoonshotAI/Kimi-K2/blob/master/docs/tool_call_guidance.md)
- [Kimi K3 blog](https://www.kimi.ai/blog/kimi-k3)

### Sourcing gaps

- **K3 self-hosted tool-call and reasoning parser flag names: no vendor-owned page reachable.** Do not assert `--tool-call-parser kimi_k3` or any K3 parser name.
- **K3's chat template is not published**; the protocol is inferable only from vendor reference code, not a spec.
- TensorRT-LLM: not mentioned by Moonshot for any current model.
- `kimi-k3[1m]` suffix: **not publicly documented as of 2026-09-08.**
- CN-platform residency: base URLs confirmed, but the CN-side privacy agreement was not fetched — **no claim is made** that CN data stays in mainland China.
- The `kimi-k2.7-code-highspeed` → open-weight repo mapping is presumed but not explicitly stated.
- The K3 blog says weights would be released "by July 27, 2026" while the HF repo's last-modified is 2026-09-02; no vendor page reconciles this.

---

## Zhipu AI / Z.ai / GLM

**Status: VERIFIED, except for retirements — see below.**

### Current models

**API IDs, international (`docs.z.ai`) — text/chat enum:** `glm-5.3`, `glm-5.2`, `glm-5.1`, `glm-5`, `glm-4.7`, `glm-4.7-flash`, `glm-4.7-flashx`, `glm-4.6`, `glm-4.5`, `glm-4.5-air`, `glm-4.5-x`, `glm-4.5-airx`, `glm-4.5-flash`, `glm-4-32b-0414-128k`. **Vision enum:** `glm-5.3-flash`, `glm-4.6v`, `glm-4.6v-flash`, `glm-4.6v-flashx`, `glm-4.5v`, `autoglm-phone-multilingual`.

- `glm-5.3` — flagship, **text-only input**, **1M context / 128K max output**, released 2026-08-18. Same base model as GLM-5.2; all gains from post-training.
- `glm-5.3-flash` — first native-multimodal model of the GLM-5 series (video, image, text, file input), 1M / 128K, 320B total / 18B active, hybrid sparse + linear attention. Released 2026-08-26.
- `glm-5.2` — 1M / 128K. `glm-5.1` and `glm-5` — 200K / 128K. `glm-4.7*` and `glm-4.6` — 200K. `glm-4.5*` — 128K / 96K. `glm-4.6v` — 128K / 32K. `glm-4.5v` — 64K / 16K.
- Non-LLM: `glm-ocr`, `glm-asr-2512`, `glm-image`, `cogview-4`, `cogvideox-3`.
- **The China platform (`open.bigmodel.cn`, `docs.bigmodel.cn`) carries extra IDs not on z.ai:** `glm-5-turbo`, `glm-5v-turbo`, `glm-4-long`, `glm-4-flashx-250414`, `glm-4-flash-250414`, `glm-4.1v-thinking` / `-flashx` / `-flash`, `glm-4v-flash`, `glm-realtime`, `glm-4-voice`, `glm-tts`, `glm-tts-clone`, `autoglm-phone`, `embedding-2`, `embedding-3`, Vidu Q1 / Vidu 2, CogView-3-Flash, CodeGeeX-4, Rerank. **The two catalogs are not identical** — a fact worth knowing before assuming a model ID works on both.

**Open weights (`zai-org`, formerly THUDM):** `GLM-5.3` (744B-A40B, FP8), `GLM-5.3-BF16`, `GLM-5.3-Flash` (320B-A18B, FP8), `GLM-5.3-Flash-BF16`, `GLM-5.2` + `-FP8`, `GLM-5.1` + `-FP8`, `GLM-5` + `-FP8`, `GLM-4.7` + `-FP8`, `GLM-4.7-Flash`, `GLM-4.6` + `-FP8`, `GLM-4.6V` / `-FP8` / `-Flash`, `GLM-4.5` / `-FP8` / `-Air` / `-Air-FP8` / `-Base` / `-Air-Base`, `GLM-4.5V` + `-FP8`, `GLM-OCR`, `GLM-Image`, `GLM-ASR-Nano-2512`, `GLM-TTS`, `AutoGLM-Phone-9B` + `-Multilingual`, the `GLM-4-32B-0414` family, and `GLM-Z1-*`. Also on ModelScope under `ZhipuAI/`.

### Runtime contract notes

- **OpenAI-compatible** general endpoint `https://api.z.ai/api/paas/v4`. **Anthropic-compatible: yes, current** — `https://api.z.ai/api/anthropic` (international), `https://open.bigmodel.cn/api/anthropic` (China, `x-api-key` header).
- **Three protocols on the Coding Plan endpoint:** Anthropic Messages `https://api.z.ai/api/anthropic`; OpenAI Chat Completions `https://api.z.ai/api/coding/paas/v4`; OpenAI Responses `https://api.z.ai/api/v1`. **Using the wrong one silently fails to draw on Coding Plan quota.** The vendor also notes that anyone who has ever subscribed to a GLM Coding Plan — including an expired one — can currently access the model API "only through the OpenAI Chat Completion-compatible protocol."
- **Thinking toggle:** `thinking: {"type": "enabled" | "disabled"}`. **On `glm-5.3` and `glm-5.3-flash` thinking is forced** — `"disabled"` returns an error. The vendor's migration note is explicit: change `disabled` → `enabled` and set `reasoning_effort: "low"` **before** switching model ID, or requests fail.
- **`reasoning_effort`** (GLM-5.2 and later): GLM-5.3 and 5.3-Flash accept only `low` / `high` / `max` (**default `max`**) and **error** on anything else. GLM-5.2 accepts `max` / `xhigh` / `high` / `medium` / `low` / `minimal` / `none` with documented remapping (`none` and `minimal` stop thinking; `low` and `medium` → `high`; `xhigh` → `max`). **The Coding Plan endpoint remaps more forgivingly and never errors** (`none`/`minimal`/`low` → `low`; `medium`/`high` → `high`; `xhigh`/`max` → `max`; a disabled toggle becomes `low`). Priority: explicit effort > thinking toggle > default `max`.
- **Reasoning-state echo rule — two named, separately controlled behaviors:**
  - *Interleaved thinking* (since GLM-4.5, on by default): thinking blocks "should be explicitly preserved and returned together with the tool results."
  - *Preserved thinking*: controlled by `thinking.clear_thinking`. **Default `true` on the standard API** (prior `reasoning_content` stripped) but **default `false` on the Coding Plan endpoint.** To use it on the standard API, set `clear_thinking: false` and "must return the complete, unmodified `reasoning_content` back to the API" — consecutive blocks must exactly match the original order; reordering or editing degrades quality and cache hits. The vendor recommends `clear_thinking: false` for GLM-5.3-Flash.
- Reasoning arrives as `reasoning_content` / `delta.reasoning_content`, distinct from `content`.
- **Tool calling:** OpenAI-shaped, but **`tool_choice` supports only `auto`** — stated outright by the vendor. Optional `tool_stream: true` (with `stream: true`) streams tool-call argument deltas; default `false`; supported on GLM-5.3 / 5.2 / 5.1 / 5 / 4.7 / 4.6.
- **Structured output is JSON mode only.** `response_format` accepts `{"type": "text"}` or `{"type": "json_object"}`. **There is no `json_schema` or strict path** on either platform — the enum affirmatively lists only those two values.
- Sampling defaults: GLM-5.3 / 5.2 / 5.1 / 5 / 4.7 / 4.6 → `temperature` 1.0, `top_p` 0.95; GLM-4.5 series → `temperature` 0.6. GLM-5.3-Flash recommended: `temperature: 1`, `top_p: 0.95`, `reasoning_effort: max`, `stream: true` plus `tool_stream: true`.
- **Context caching is implicit and automatic** with no request parameter; hit rate is reported via `usage.prompt_tokens_details.cached_tokens`. The vendor states the mechanism is open beta and its hit/retention logic "has not yet been announced" — so it cannot be reasoned about or relied on in a cost model.
- **Claude Code specifics:** 1M context requires a `[1m]` model-ID suffix (`glm-5.3[1m]`, `glm-5.3-flash[1m]`) plus `CLAUDE_CODE_AUTO_COMPACT_WINDOW: "1000000"`. The vendor notes Claude Code sends `thinking.type` plus `output_config.effort` while Codex sends `reasoning.effort`, both normalized to the low/high/max ladder.

### Deployment & residency

- **Licenses split by release, not uniform:** `zai-org/GLM-5.3` → `license_name: glm-5.3`, LICENSE titled **"GLM-5.3 License"**. `zai-org/GLM-5.3-Flash` → **MIT**. `zai-org/GLM-5.2` → **MIT**. The flagship moved off MIT while the Flash variant and the prior release stayed on it.
- **Vendor-named serving stacks:** SGLang, vLLM, Transformers, KTransformers, Unsloth, TokenSpeed; plus vLLM-Ascend / xLLM / SGLang for Ascend NPU. **No vendor-documented TensorRT-LLM or llama.cpp path** for GLM-5. Version floors: GLM-5.2 → SGLang v0.5.13.post1+, vLLM v0.23.0+, KTransformers v0.5.12+; GLM-5.1 → SGLang v0.5.10+, vLLM v0.19.0+, xLLM v0.8.0+. Fine-tuning: slime (the GLM team's own RL framework), ms-swift v4.4.0+.
- **Exact parser flags the vendor publishes** (on the GLM-5 and GLM-4.7 cards):

  ```
  vllm serve zai-org/GLM-5 --tensor-parallel-size 8 --gpu-memory-utilization 0.85 \
    --speculative-config.method mtp --speculative-config.num_speculative_tokens 3 \
    --tool-call-parser glm47 --reasoning-parser glm45 --enable-auto-tool-choice \
    --served-model-name glm-5

  sglang serve --model-path zai-org/GLM-5 --tp-size 8 \
    --tool-call-parser glm47 --reasoning-parser glm45 \
    --speculative-algorithm EAGLE --speculative-num-steps 3 \
    --speculative-eagle-topk 1 --speculative-num-draft-tokens 4 \
    --mem-fraction-static 0.85 --served-model-name glm-5
  ```

  GLM-4.5 and 4.5-Air use `--tool-call-parser glm45 --reasoning-parser glm45`. **The reasoning parser has been `glm45` continuously; the tool-call parser changed from `glm45` to `glm47` at the 4.7 generation**, and GLM-5 still uses `glm47`. The GLM-5.1, 5.2, and 5.3 cards defer to third-party cookbooks — **the correct parser for those is not vendor-documented as of 2026-09-08.**
- **Why the flags are load-bearing:** the GLM-5.3 `chat_template.jinja` emits tool calls in a bespoke XML form — `<tool_call>{name}<arg_key>k</arg_key><arg_value>v</arg_value></tool_call>` inside a `<tools>` block — **not OpenAI JSON**, with reasoning in `<think>…</think>`. Without the server-side parsers, an OpenAI-compatible client receives that markup as plain `content`, with no `tool_calls` and no `reasoning_content`. It does not error; it silently returns markup.
- **Self-hosted thinking is a chat-template kwarg.** The template reads `reasoning_effort` (`{%- set effective_reasoning_effort = reasoning_effort if ... in ['low','high'] else 'max' -%}`) and injects a literal `<|system|>Reasoning Effort: Max` turn; it also reads `clear_thinking`, gating whether prior `<think>` blocks are re-rendered. **In the GLM-5.3 and 5.3-Flash templates `clear_thinking` defaults to `false`** — pass `clear_thinking=true` explicitly for chat scenarios. This is the **inverse** of the hosted standard-API default (`true`), so self-hosted and vendor-API behavior diverge silently. No thinking off-switch exists in the 5.3 templates.
- **What you lose self-hosted:** implicit context caching and `cached_tokens` accounting, the `/api/anthropic` shim, the `[1m]` suffix convention, the Coding-Plan effort remapping that swallows unsupported values instead of erroring, and the built-in Web Search / Web Reader / Vision / Zread MCP servers.
- **Residency (vendor-stated):** z.ai international is "provided and controlled by JINGSHENG HENGXING TECHNOLOGY PTE. LTD," registered in **Singapore**. The privacy policy states "We generally provide the Services from Singapore… your personal data is generally processed in Singapore," with possible transfer outside your jurisdiction. **The DPA states the company does "not store any of the content the Customer or its End Users provide or generate while using our Services… processed in real-time… and is not saved on our servers."** The China platform is a separate operator (北京智谱华章科技股份有限公司) on separate endpoints with its own privacy policy, content-safety review, and generative-AI filing pages.

### Retired

**No vendor-owned deprecation or retirement page exists on either platform.** Both sitemaps and both `llms.txt` indexes were checked, and candidate URLs (`/guides/overview/deprecations`, `/cn/update/model-deprecation`, `/release-notes/apis`, a models-list endpoint) all 404. Both the "New Released" and `模型与产品发布记录` pages are additive only. **Retired model IDs with stated replacements and dates are not publicly documented as of 2026-09-08.**

Two adjacent facts that *are* documented: `thinking.type: "disabled"` is retired **as a capability** on `glm-5.3` and `glm-5.3-flash` (migration: switch to `enabled` plus `reasoning_effort: "low"`); and older IDs (`glm-4.5*`, `glm-4-32b-0414-128k`, `glm-4.5v`) remain live in the current enum, i.e. **not** retired.

### Primary sources

- [Z.ai docs overview](https://docs.z.ai/guides/overview/overview)
- [GLM-5.3](https://docs.z.ai/guides/llm/glm-5.3)
- [GLM-5.2](https://docs.z.ai/guides/llm/glm-5.2)
- [GLM-5.3-Flash](https://docs.z.ai/guides/vlm/glm-5.3-flash)
- [Thinking](https://docs.z.ai/guides/capabilities/thinking)
- [Function calling](https://docs.z.ai/guides/capabilities/function-calling)
- [Structured output](https://docs.z.ai/guides/capabilities/struct-output)
- [Context caching](https://docs.z.ai/guides/capabilities/cache)
- [API reference: chat completion](https://docs.z.ai/api-reference/llm/chat-completion)
- [Model list and pricing](https://docs.z.ai/guides/overview/pricing)
- [Devpack: Claude Code](https://docs.z.ai/devpack/tool/claude)
- [Privacy policy](https://docs.z.ai/legal-agreement/privacy-policy)
- [China platform model overview](https://docs.bigmodel.cn/cn/guide/start/model-overview)
- [GLM-5.3 model card](https://huggingface.co/zai-org/GLM-5.3)
- [GLM-5.3-Flash model card](https://huggingface.co/zai-org/GLM-5.3-Flash)
- [GLM-5 model card](https://huggingface.co/zai-org/GLM-5)
- [zai-org HuggingFace org](https://huggingface.co/zai-org)

### Sourcing gaps

- **vLLM / SGLang parser flags for GLM-5.1, 5.2, 5.3, and 5.3-Flash: not on any vendor-owned page.** `glm47` and `glm45` are confirmed only for GLM-5, 4.7, and 4.5.
- **Retired model IDs, replacements, and sunset dates: no vendor-owned page exists.** This is a genuine absence, not an unreachable page — record it as such.
- JSON-schema / strict structured output: not documented; the `response_format` enum affirmatively lists only `text` and `json_object`.
- TensorRT-LLM and llama.cpp: never mentioned (absence, not denial).
- China-side residency, retention, and compliance specifics: those pages exist in the index but were not fetched — **no China-specific claim is made.**
- `glm-5-turbo` and `glm-5v-turbo`: only the China model-overview table row (200K / 128K) is verified.

---

## MiniMax

**Status: VERIFIED. The most restrictive licensing of the five, and the weakest structured-output story.**

### Current models

| Model ID | Context (vendor-stated) | Notes |
| --- | --- | --- |
| `MiniMax-M3` | 1,000,000 | Flagship, "frontier multimodal coding model"; **the only model accepting image/video input** |
| `MiniMax-M2.7` | 204,800 | "Beginning the journey of recursive self-improvement" |
| `MiniMax-M2.7-highspeed` | 204,800 | Same performance, faster |
| `MiniMax-M2.5` / `-highspeed` | 204,800 | Legacy, still served |
| `MiniMax-M2.1` / `-highspeed` | 204,800 | Legacy, still served |
| `MiniMax-M2` | 204,800 | Legacy, still served |
| `M2-her` | 64K | Chat/roleplay; `model` field "fixed as `M2-her`" |

Spec caveat: the native `POST /v1/text/chatcompletion_v2` OpenAPI `model` enum **omits** `MiniMax-M2.1-highspeed` though the guides list it, and `MiniMax-Text-01` and `MiniMax-M1` linger in that spec's parameter defaults without being in the enum.

**Open weights:** `MiniMaxAI/MiniMax-M3` (~428B total / ~23B activated, native multimodal, MiniMax Sparse Attention), `MiniMaxAI/MiniMax-M3-MXFP8`, `MiniMaxAI/MiniMax-M2.7`, `MiniMax-M2.5`, `MiniMax-M2.1`, `MiniMax-M2` (230B / 10B). Older: `MiniMax-M1-40k` / `-80k` (+`-hf`), `MiniMax-Text-01` (+`-hf`), `MiniMax-VL-01`, `SynLogic-{7B,32B,Mix-3-32B}`, `VTP-{Small,Base,Large}-f16d64`. **The `-highspeed` variants have no open-weight repo — API-only.**

Non-text: video `MiniMax-H3`, `MiniMax-H3-Max`, legacy `MiniMax-Hailuo-2.3` / `-Fast` / `Hailuo-02` (open: `MiniMaxAI/MiniMax-H3`); speech `speech-2.8-hd` / `-turbo`, legacy `speech-2.6-*` / `speech-02-*`; music `music-3.0`, `music-2.6`, `music-cover` (open: `MiniMaxAI/MiniMax-Music3`); image `image-01`.

### Runtime contract notes

- **Four surfaces, all on `https://api.minimax.io`:** Anthropic-compatible `/anthropic` — **which the vendor labels "Recommended"**, noting it "supports thinking blocks, interleaved thinking, and other advanced features" — plus `/anthropic/v1/messages/count_tokens`; OpenAI-compatible `/v1`; OpenAI Responses `/v1/responses`; and MiniMax-native `/v1/text/chatcompletion_v2`. Official AI SDK provider: `vercel-minimax-ai-provider`.
- **Reasoning-state echo rule — a hard requirement, stated four different ways:**
  - "In multi-turn function call conversations, the complete model response (i.e., the assistant message) **must be append to the conversation history** to maintain the continuity of the reasoning chain."
  - OpenAI native format: "in the message history, **do not modify the `content` field. You must preserve the model's thinking content completely**, i.e., `<think>reasoning_content</think>`. This is essential to ensure Interleaved Thinking works effectively."
  - With `reasoning_split=True`: "the entire `response_message` — **including the `reasoning_details` field** — must be preserved in the message history and passed back."
  - Anthropic path: "Append the full `response.content` list to the message history (includes all content blocks: thinking/text/tool_use)"; "When a response includes `thinking` blocks, **preserve them unchanged in later turns, especially in tool-use conversations.**"
- **Thinking representation differs by surface — the sharp edge.** Anthropic → typed `thinking` blocks. OpenAI with `reasoning_split=true` → `reasoning_content` plus `reasoning_details` (**the vendor "strongly recommend[s] developers use the Interleaved Thinking compatible format"**). OpenAI with `reasoning_split=false` (**the default**) → thinking inlined in `content` as `<think>…</think>`. M3's own `chat_template.jinja` uses `<mm:think>` natively, so the `<think>` form is an API-layer rendering, and **self-hosted M3 leaking raw `<mm:think>` is an explicitly documented failure mode.**
- **The M3 thinking on/off default is contradicted across three MiniMax-owned pages.** `text-anthropic-api` says "Thinking is off by default for MiniMax-M3 and can be enabled with `adaptive`"; `text-openai-api` says "If `thinking` is omitted, thinking is on by default"; `responses-create` says `reasoning: {"effort": "none"}` "is the default behavior and disables reasoning output." The M3 card and chat template document three modes — `enabled` / `adaptive` / `disabled` — with a template default of `adaptive`. **Treat the default as surface-dependent and always set it explicitly.** For all M2.x: "thinking cannot be disabled; `thinking: {"type": "disabled"}` is accepted but thinking remains on." On the Responses API, `minimal | low | medium | high` "are accepted for compatibility… but they do not tune MiniMax-M3's reasoning depth."
- **Tool calling:** standard `tools` / `tool_choice`; **`function_call` is not supported**. On the wire the model emits `<minimax:tool_call>…</minimax:tool_call>` XML for M2 through M2.7 ("MiniMax-M2.7 supports the same toolcall syntax as MiniMax-M2"); M3's template uses a namespaced `<tool_call>` variant. A server-side `web_search` tool (Beta) exists on the Anthropic Messages API and the OpenAI Responses API **only**.
- **Structured output is effectively unavailable for current models.** `response_format` with `{"type": "json_schema", …}` exists **only** on the native `/v1/text/chatcompletion_v2` endpoint, and the spec scopes it to `MiniMax-Text-01`. **No `response_format` or `json_schema` support for M3 or M2.x is documented on any MiniMax-owned page as of 2026-09-08.** Tool calling is the vendor-blessed structured path.
- Parameters: `temperature` in [0, 2], recommended 1; `top_p` default 0.95 (M3) / 0.9 (M2.x). Ignored on the Anthropic path: `top_k`, `stop_sequences`, `mcp_servers`, `context_management`, `container`. Ignored on the OpenAI path: `presence_penalty`, `frequency_penalty`, `logit_bias`; `n` supports 1 only. `service_tier` accepts `standard` / `priority`. M3 multimodal limits: images ≤10 MB, URL or base64 video ≤50 MB, request body ≤64 MB, Files API video ≤512 MB via `mm_file://{file_id}`. **Prompt caching: automatic caching covers M3, M2.7, M2.5, M2.1; explicit `cache_control` covers M2.7, M2.5, M2.1, M2 — M3 is notably absent from the explicit list.**

### Deployment & residency

- **Licenses — the most restrictive of the five families, and they tightened over time:**
  - `MiniMax-M3` and `-MXFP8` → `license_name: minimax-community`, file headed **"MINIMAX COMMUNITY LICENSE"**. **Non-commercial by default.** Commercial use requires displaying "Built with MiniMax M3", a one-time notice to `api@minimax.io`, and **prior written authorization above $20M yearly revenue**. Has a Prohibited Uses appendix.
  - `MiniMax-M2.7` → file headed **"NON-COMMERCIAL LICENSE"**: "Non-commercial use permitted based on MIT-style terms; commercial use requires prior written authorization," plus a "Built with MiniMax M2.7" display requirement. Personal self-hosted development and non-profit/academic research are explicitly free. **A material tightening versus M2.**
  - `MiniMax-M2.5` → HF frontmatter says `modified-mit` but the repo file is `LICENSE-MODEL` headed **"MINIMAX MODEL LICENSE"** — **frontmatter and file disagree; trust the file.**
  - `MiniMax-M2.1` → `modified-mit`; MIT plus "if the Software… is used for any of your commercial products or services, you shall prominently display 'MiniMax M2.1' on the user interface."
  - `MiniMax-M2` → `modified-mit`; MIT plus attribution triggered only above **100M MAU or $30M ARR**. The most permissive of the family.
  - `MiniMax-H3` → `license_name: minimax-h3-community-license-agreement`, **"MiniMax H3 COMMUNITY LICENSE AGREEMENT"**, dated 2026-08-02, and **expressly limited to a defined "Applicable Territory"** — a territorial restriction worth flagging in any procurement review.
- **Exact parser flags, vendor-published for the M2 family** (one guide covers M2, M2.1, M2.5, M2.7 — "You only need to change the model name"):

  ```
  SAFETENSORS_FAST_GPU=1 vllm serve MiniMaxAI/MiniMax-M2.7 --trust-remote-code \
      --tensor-parallel-size 4 \
      --enable-auto-tool-choice --tool-call-parser minimax_m2 \
      --reasoning-parser minimax_m2_append_think

  python -m sglang.launch_server --model-path MiniMaxAI/MiniMax-M2.7 --tp-size 4 \
      --tool-call-parser minimax-m2 --reasoning-parser minimax-append-think \
      --trust-remote-code --host 0.0.0.0 --port 8000 --mem-fraction-static 0.85
  ```

  **The parser names differ by engine: vLLM uses underscores (`minimax_m2`, `minimax_m2_append_think`), SGLang uses hyphens (`minimax-m2`, `minimax-append-think`).** `--enable-auto-tool-choice` is vLLM-only. 8-GPU adds `--enable_expert_parallel --tensor-parallel-size 8` (vLLM) or `--ep-size 8` (SGLang). SGLang `>= v0.5.4.post1`. Documented workarounds: `CUDA error: illegal memory access` → add `--compilation-config "{\"cudagraph_mode\": \"PIECEWISE\"}"`; garbled output → vLLM nightly after commit `cf3eacfe58fa9e745c2854782ada884a9f992cf7`.
- **M2.x hardware, vendor-stated:** 220 GB weights, 240 GB per 1M context tokens; 96G×4 → 400K aggregate KV cache; 144G×8 → up to 3M. Critically: **"The maximum context length per individual sequence remains 196K tokens"** — *lower* than the 204,800 the API advertises.
- **M3 self-hosting is explicitly marked Experimental by MiniMax** ("Last documentation review: August 26, 2026"). Reference baseline: 8×B200, `MiniMaxAI/MiniMax-M3-MXFP8` pinned to revision `c5454eb03678d8710e54a4e0fc681b9f3b4a3dba` (~444 GB), an SGLang image pinned by digest, with `--reasoning-parser auto --tool-call-parser auto --tp 8 --attention-backend fa4 --mm-attention-backend flashinfer_cudnn --moe-runner-backend deep_gemm --chunked-prefill-size 8192 --mem-fraction-static 0.65`. **M3 gets `auto` parsers, not a named `minimax_m3` parser.** The M3 card also names SGLang, vLLM, Transformers (`minimax_m3_vl`), KTransformers, unsloth, ATOM (ROCm), and MLX-LM.
- **Recommended sampling:** M2 family → `temperature=1.0, top_p=0.95, top_k=40`; M3 → `temperature=1.0, top_p=0.95` (no `top_k`). M2.7, M2.5, and M2.1 ship a default system prompt (e.g. `You are a helpful assistant. Your name is MiniMax-M2.7 and is built by MiniMax.`).
- **What breaks self-hosted (vendor-stated):** video input is "Not validated in this SGLang recipe"; context is validated only from 1K to 128K input tokens — **"1M is a model limit, not the validated production default"**; the ROCm path has no vision validation. Omitting the parsers surfaces raw `<mm:think>` and raw tool-call tokens in `content`. Open weights "do not include MiniMax Platform managed files, caching, content safeguards, or platform-only workflows" — prompt caching, server-side `web_search`, the Files API, and `service_tier` are API-only.
- **Residency (vendor-stated, verbatim):** "The `ANTHROPIC_BASE_URL` should be set based on your location: for international users, use `https://api.minimax.io/anthropic`; for users in China, use `https://api.minimax.cn/anthropic`." Platforms: `platform.minimax.io` (international) versus `platform.minimaxi.com` (China); region auto-detects from key origin, with manual override `mmx config set --key region --value [cn|global]`. **No data-retention or compliance difference between the two is stated.** The only retention statement is speech-specific: "All interfaces are stateless: each call only processes the provided input, does not store user data." MiniMax publishes **EU AI Act Article 53(1)(d) training-content summaries** for M3 and H3 — the only such disclosure found in this entire pass.

### Retired

**No MiniMax text/LLM retirement, deprecation, or shutdown date is publicly documented as of 2026-09-08.** `MiniMax-M2.5`, `-M2.5-highspeed`, `-M2.1`, `-M2.1-highspeed`, and `-M2` sit under a "Legacy Models" accordion but are all still listed as supported on all three endpoints with no replacement date. The `/docs/faq/history-modelinfo` page linked from the FAQ returns **HTTP 404**.

Documented retirements, **non-text only**:

- Music, effective **2026-08-20**: paid Music Generation and Lyrics Generation APIs "will no longer be available to new users; existing paying users can continue"; free `Music-3.0-free`, `Music-2.6-free`, and `music-cover-free` "will be discontinued." Replacement: MiniMax Audio, or open-source `MiniMaxAI/MiniMax-Music3`.
- Speech, **2025-06-20**: "The previous text-to-voice API is now considered legacy. Service for this endpoint will continue uninterrupted, but it will not receive future updates" — replaced by Voice Design.

Release dates: M3 2026-06-01 · M2.7 2026-03-18 · M2.5 2026-02 · M2.1 2025-12-22 · M2 2025-10-27 · MiniMax-Text-01 and VL-01 2025-01-15.

### Primary sources

- [Models introduction](https://platform.minimax.io/docs/guides/models-intro)
- [Text generation guide](https://platform.minimax.io/docs/guides/text-generation)
- [M3 function calling](https://platform.minimax.io/docs/guides/text-m3-function-call)
- [M2 reasoning](https://platform.minimax.io/docs/guides/text-m2-reasoning)
- [Local deployment](https://platform.minimax.io/docs/guides/local-deploy)
- [Local deployment: M3](https://platform.minimax.io/docs/guides/local-deploy-m3)
- [Anthropic-compatible API](https://platform.minimax.io/docs/api-reference/text-anthropic-api)
- [OpenAI-compatible API](https://platform.minimax.io/docs/api-reference/text-openai-api)
- [Responses API](https://platform.minimax.io/docs/api-reference/responses-create)
- [Prompt caching](https://platform.minimax.io/docs/api-reference/text-prompt-caching)
- [Model release notes](https://platform.minimax.io/docs/release-notes/models)
- [Transparency / EU AI Act summaries](https://platform.minimax.io/docs/guides/transparency)
- [MiniMax-M3 model card](https://huggingface.co/MiniMaxAI/MiniMax-M3)
- [MiniMax-M2.7 model card](https://huggingface.co/MiniMaxAI/MiniMax-M2.7)
- [MiniMax-M2 model card](https://huggingface.co/MiniMaxAI/MiniMax-M2)
- [MiniMaxAI HuggingFace org](https://huggingface.co/MiniMaxAI)

### Sourcing gaps

- **Structured output for M3 and M2.x: not publicly documented as of 2026-09-08.** Do not assume constrained JSON decoding.
- **The M3 thinking default is unresolvable from vendor docs** — three MiniMax-owned pages give three different answers. Record the contradiction, not a value.
- **M3 self-host parser identifiers: not published.** Only `--reasoning-parser auto --tool-call-parser auto` is vendor-stated; there is no `minimax_m3` analogue.
- **MiniMax publishes no vLLM command of its own for M3** — the card links to third-party `recipes.vllm.ai`.
- The "do not remove `<think>`" warning appears on the M2 card and the M3 function-call guide but is **not repeated** on the M2.7, M2.5, or M2.1 cards.
- Residency: only base-URL routing is vendor-stated. **No region-specific data-retention, storage-location, or compliance claim was found**; `platform.minimaxi.com` docs were not independently fetched.
- `/docs/faq/history-modelinfo` is linked from the FAQ but **404s**.
- The native `chatcompletion_v2` per-model defaults list only M2, M1, and Text-01 — a stale spec, unusable for current models.

---

## Regional families — cross-cutting findings

Read these three before writing any regional profile. They are the findings most likely to make a downstream profile wrong.

**1. Namespace churn is the biggest correctness risk in this area.** Four of eight regional families moved their canonical location, and none announced it in a way a stale reference would survive:

| Old | Current |
| --- | --- |
| `huggingface.co/inceptionai`, `inceptionai.ai` | **`huggingface.co/inception42`**, `inception42.ai` |
| `huggingface.co/LLM360/K2-Think`, `k2think.ai`, `ifm.mbzuai.ac.ae` | **`huggingface.co/IFM/K2-Think`**, `chat.ifm.ai`, `ifm.ai` |
| `huggingface.co/ALLaM-AI` | **`huggingface.co/humain-ai`** (the `ALLaM-AI` org page 404s; only the model URL still resolves) |
| `developers.upstage.ai/docs` | **`console.upstage.ai/docs`** |

**2. Tool calling is the sharpest capability split among regional models.** Documented: Sarvam, SEA-LION (v4.5), K2-Horizon, Upstage Solar, HyperCLOVA X (`HCX-007` and `HCX-005` only). **Not documented at all: Jais-2 and ALLaM** — both bilingual Arabic models with short contexts (8K and 4K respectively). That combination makes them poor fits for agent harnesses regardless of language quality, and it is a capability boundary, not a preference.

**3. "Sovereign" branding rarely comes with a documented residency guarantee.** Only two families document anything concrete: **Sarvam** (self-host in your own AWS VPC with network isolation, via AWS Marketplace/SageMaker) and **Upstage** (dedicated/on-prem deployment, SOC 2 + ISO 27001). Every other family's residency posture reduces to "self-host the open weights wherever you like." **No family in this survey documents a region for its own managed inference endpoint.** For a Sovereignty & Residency audit dimension this is the headline: regional provenance and data residency are independent properties, and buying the former does not get you the latter.

**Blocked sources.** Three vendor sites returned HTTP 403 to automated fetching, and their claims are deliberately excluded here rather than sourced from search snippets: `www.sarvam.ai` (including `/trust-center`), `inception42.ai`, `ifm.ai`. Sarvam's India-residency, ISO 27001 / SOC 2, and air-gapped-deployment claims live behind that block. They are plausible and widely reported, but they are **not verified as of 2026-09-08** and must not be copied into an authoritative reference without a successful vendor-page fetch.

---

## Sarvam AI (India)

**Status: VERIFIED.**

### Current models

- `sarvam-105b` — chat/reasoning LLM, 105B-parameter MoE with Multi-head Latent Attention, **128K context**. Released under Apache 2.0 per the model docs.
- `sarvam-105b-conversations` — real-time dialogue / voice-agent variant, **32K context**.
- **Saaras v3** — speech-to-text; output modes `transcribe`, `translate`, `verbatim`, `translit`, `codemix`.
- **Bulbul v3** — text-to-speech; 38 Indic voices per the self-hosted page.
- **Mayura** — text translation (11 languages).
- **Sarvam Translate** — text translation (23 languages).
- **Sarvam Vision** — document intelligence / OCR (23 languages).
- Third-party open-weight models re-served through `/v2/chat/completions` (documented as Beta and **explicitly not tuned for Indian languages**): GLM-5.2 (512K ctx, tool calling), Gemma 4 31B (text+image), DeepSeek V4 Flash (1M ctx).

### Language & script coverage

- **11 languages** for `sarvam-105b`, `sarvam-105b-conversations`, Bulbul v3, and Mayura: Hindi, Bengali, Tamil, Telugu, Kannada, Malayalam, Marathi, Gujarati, Punjabi, Odia, English.
- **23 languages** for Saaras v3, Sarvam Vision, and Sarvam Translate: Hindi, Bengali, Tamil, Telugu, Kannada, Malayalam, Marathi, Gujarati, Punjabi, Odia, Assamese, Urdu, Nepali, Konkani, Kashmiri, Sindhi, Sanskrit, Santali, Manipuri, Bodo, Maithili, Dogri, English. (The docs landing page writes "Meitei" for Manipuri; same language.)
- **Note the asymmetry: the chat LLM covers 11 languages, the speech and document models cover 23.** An agent that transcribes in Assamese and then reasons in the chat model has crossed a capability boundary.
- **Scripts:** Sarvam does not enumerate scripts per language anywhere reachable. What *is* documented: `sarvam-105b` accepts **native-script, romanized, and code-mixed input**, and Saaras v3 has explicit `translit` and `codemix` output modes. Beyond that, script-level coverage is **not publicly documented as of 2026-09-08.**

### Runtime contract notes

- Base URL `https://api.sarvam.ai`; chat at `/v1/chat/completions`, plus `/v2/chat/completions` for the re-served open-weight models.
- Auth uses a proprietary `api-subscription-key` header; the docs state the endpoint "additionally accepts `Authorization: Bearer <key>` for OpenAI-compatible tooling." That is an OpenAI-compatible chat-completions *shape*, not a claim of full API equivalence.
- **Tool/function calling: documented**, with function schemas and `tool_choice`.
- **Structured output: documented**, via `response_format` with JSON Schema and `json_object` mode.
- Official Python and JavaScript SDKs; REST, WebSocket, and batch endpoints.
- Modality is speech- and document-first as much as text: ASR (Saaras), TTS (Bulbul), and OCR/doc-AI (Sarvam Vision) are separate product surfaces from the chat LLM.

### Deployment & residency

- **Self-hosting is offered and documented**: subscribe to a Sarvam model package on **AWS Marketplace**, deploy as an **Amazon SageMaker endpoint in your own AWS account and VPC**. Available self-hosted: Saaras v3, Bulbul v3, Sarvam Vision.
- Documented guarantees on that path: "Audio and documents are processed inside your own VPC. Nothing is sent to Sarvam"; endpoints deploy with **network isolation enabled** (no outbound internet from the model container); the endpoint runs in the same region and VPC as the application. The docs name BFSI, healthcare, and government data-residency needs as the motivation. Specific AWS regions are not enumerated.
- **Where the managed API is hosted is not documented on any reachable vendor page.** `www.sarvam.ai`, including `/trust-center`, returned HTTP 403 to every fetch attempt, so India-residency, ISO 27001 / SOC 2, and air-gapped claims that reportedly live there are **unverified**.

### Retired

- `sarvam-m` (24B) — deprecated, no longer available via API; stated replacement `sarvam-105b`.
- Sarvam-30B — deprecated; stated replacement `sarvam-105b`.
- Saarika v2.5 (11-language ASR) — being phased out; stated replacement Saaras v3.

### Primary sources

- [Sarvam docs](https://docs.sarvam.ai/)
- [Models](https://docs.sarvam.ai/api/getting-started/models)
- [sarvam-105b reference](https://docs.sarvam.ai/api-reference-docs/models/sarvam-105b)
- [Chat completion overview](https://docs.sarvam.ai/api/api-guides-tutorials/chat-completion/overview)
- [Quickstart](https://docs.sarvam.ai/api/getting-started/quickstart)
- [Self-hosted introduction](https://docs.sarvam.ai/api/self-hosted/introduction)

---

## Falcon / TII (UAE)

**Status: VERIFIED.**

### Current models

- `tiiuae/Falcon-H1R-7B` — reasoning model built on `tiiuae/Falcon-H1-7B-Base`; also `-FP8` and `-GGUF`.
- `tiiuae/Falcon-H1-34B-Instruct` and family — Falcon-H1 at 0.5B, 1.5B, 1.5B-Deep, 3B, 7B, 34B, each in Base and Instruct. Hybrid Transformer + Mamba (SSM) architecture.
- `tiiuae/Falcon-Perception` (0.6B) and `tiiuae/Falcon-Perception-300M` — open-vocabulary grounding and instance segmentation (vision-language, mask generation).
- `tiiuae/Falcon-OCR` (0.3B) — image-to-text.
- Named on the vendor model page but with model cards returning HTTP 401: Falcon-H1-Arabic (vendor site says 3B / 7B / 34B), Falcon Arabic, Falcon-H1-Tiny-R (0.6B, 0.09B), Falcon-E (edge), Falcon 3, Falcon Mamba 7B, Falcon 2 11B, Falcon 40B, Falcon 180B.

### Language & script coverage

- **Falcon-H1 (including H1R): 18 languages, named exactly** — Arabic, Czech, German, English, Spanish, French, Hindi, Italian, Japanese, Korean, Dutch, Polish, Portuguese, Romanian, Russian, Swedish, Urdu, Chinese. The card adds these are "scalable to 100+", but only the 18 are the trained core. **Treat the 18 as the capability boundary.**
- Scripts implied by that list span Latin, Arabic (Arabic + Urdu), Devanagari (Hindi), Cyrillic (Russian), Han (Chinese), Japanese kana/kanji, and Hangul — **but TII does not state script coverage explicitly**, and per-script quality is not documented.
- Falcon 40B: English, German, Spanish, French, Italian, Portuguese, Polish, Dutch, Romanian, Czech, Swedish.
- Falcon-H1-Arabic / Falcon Arabic are described as covering Modern Standard Arabic plus regional dialects; the exact dialect list lives on TII's HF blog posts rather than a fetchable model card, so **the dialect breakdown is not verified here**.
- `tiiuae/Falcon-Perception` documents English only.

### Runtime contract notes

- **No TII-operated inference API is documented.** The vendor site offers demo UIs only (`chat.falconllm.tii.ae`, `vision.falcon.aidrc.tii.ae`). Everything else is self-serve weights.
- Falcon-H1R-7B: **262,144-token** max model length as configured for vLLM. Reasoning is emitted in `<think>...</think>` blocks with the **`deepseek_r1` reasoning parser** in vLLM/SGLang — note the parser is not Falcon-named. **Function calling is supported via vLLM's `--enable-auto-tool-choice`.** The chat template ships with the model.
- Context length is **not stated** on the Falcon-H1-34B-Instruct card.
- Falcon-Perception: multimodal (image + text → masks/coordinates), max 2,048 decode tokens.
- Serving: transformers, vLLM, SGLang; GGUF / llama.cpp / Ollama for quantized local runs.

### Deployment & residency

- Open weights, self-host only. **Two distinct licenses are in play and the difference matters:**
  - `Falcon-H1` / `Falcon-H1R`: **"Falcon-LLM License"** (terms at `falconllm.tii.ae/falcon-terms-and-conditions.html`). **This is not an OSI open-source license** — it is Apache-2.0-derived with an Acceptable Use Policy, attribution requirements, a professional-advice-use prohibition, and (for Falcon 180B) a "Hosting Use" restriction barring shared instances or managed services without written TII permission.
  - `tiiuae/Falcon-Perception`: **Apache 2.0**. Falcon 7B is also Apache 2.0 per the vendor model page.
- **No hosted inference, no data-residency claim, and no sovereign-cloud claim appear on any TII page reached.** Residency is entirely the deployer's choice.

### Retired

**Not publicly documented as of 2026-09-08.** TII's model page lists older generations (Falcon 180B, 40B, Falcon 2, Falcon 3, Falcon Mamba) alongside current ones without deprecation labels or stated replacements.

### Primary sources

- [Falcon LLM](https://falconllm.tii.ae/)
- [Falcon models](https://falconllm.tii.ae/falcon-models.html)
- [Falcon terms and conditions](https://falconllm.tii.ae/falcon-terms-and-conditions.html)
- [TII HuggingFace org](https://huggingface.co/tiiuae)
- [Falcon-H1-34B-Instruct](https://huggingface.co/tiiuae/Falcon-H1-34B-Instruct)
- [Falcon-H1R-7B](https://huggingface.co/tiiuae/Falcon-H1R-7B)
- [Falcon-Perception](https://huggingface.co/tiiuae/Falcon-Perception)

---

## Regional — other

Four families with enough verified material to be useful but not enough to justify a standalone profile. Recommended destination: a single `regional-other.md`.

### Jais (UAE — Inception / G42 / MBZUAI) — VERIFIED

**Namespace: the HuggingFace org is now `inception42`.** The `inceptionai` namespace still resolves for individual model URLs, but its org page states it is "not operational and only created to reserve the… user name." `www.inceptionai.ai` 301-redirects to `inception42.ai`.

- **Current models:** `inception42/Jais-2-70B-Chat` (72B) and `inception42/Jais-2-8B-Chat` (8B), plus `-GGUF` variants. Earlier generations remain published: `jais-adapted-70b-chat-4bit-bnb`, `jais-family-256m`, `jais-family-256m-chat`, `jais-30b-chat-v3`, `jais-30b-v3`, and the wider `jais-family-*` / `jais-adapted-*` releases (590M–70B). Also `inception42/Llama-3.1-Sherkala-8B-Chat`, a Kazakh-focused sibling release, not Jais. Developed jointly by MBZUAI, Inception, and Cerebras.
- **Language & script:** **Arabic (Modern Standard Arabic and regional dialects) and English.** Bilingual by design, Arabic-centric. Scripts: Arabic and Latin, implied by the language pair. The cards do not discuss transliteration, Arabizi / romanized Arabic, or per-dialect script handling, and **do not enumerate which dialects**. Vocabulary size 150,272 is the only quantitative tokenizer signal given.
- **Runtime contract:** **Context length 8,192 tokens** for both Jais-2 chat models — short by 2026 standards and a real constraint for agent work. Transformer decoder-only with RoPE, squared-ReLU, custom μP parameterization. **Tool/function calling is not documented at all on the Jais-2 cards — do not assume it works.** Structured output not documented. Text only. Serving: transformers, vLLM, SGLang, Docker. A hosted chat experience runs on Cerebras hardware at `jaischat.ai` — a chat UI, not a documented API. Model files are **gated** on HuggingFace.
- **Deployment & residency:** **Open weights under Apache 2.0.** Self-hosting is the documented path. **No data-residency, UAE-hosting, or sovereign-cloud guarantee is documented on any reachable vendor page**; `inception42.ai` returned HTTP 403.
- **Retired:** not publicly documented as of 2026-09-08. Jais-1 repos remain published with no deprecation notice, though Jais-2 is presented as the successor generation.
- Sources: [inception42 org](https://huggingface.co/inception42), [inceptionai org](https://huggingface.co/inceptionai), [Jais-2-8B-Chat](https://huggingface.co/inceptionai/Jais-2-8B-Chat), [Jais-2-70B-Chat](https://huggingface.co/inception42/Jais-2-70B-Chat)

### ALLaM (Saudi Arabia — SDAIA) — THIN

- **Current models:** `ALLaM-AI/ALLaM-7B-Instruct-preview`, a 7B bilingual instruct model. **The canonical repo now resolves under the `humain-ai` org** (`humain-ai/ALLaM-7B-Instruct-preview`); the `ALLaM-AI` org landing page returns 404 while the model URL under it still works. Two pinned revisions: `revision="v1"` (7b-alpha-v1.27.2.25) and `revision="v2"` (7b-alpha-v2.33.0.30, newest). Developed by the National Center for Artificial Intelligence (NCAI) at the Saudi Data and AI Authority (SDAIA); hosted under HUMAIN, described on its own HF page as a PIF-owned company founded May 2025 in Riyadh. **`humain-ai` publishes only this one model repo.**
- **Language & script:** **Arabic and English**, bilingual, Arabic-centric. Pretrained on 5.2T tokens (4T English, then 1.2T mixed). Scripts: Arabic and Latin, implied. **No dialect list, no script-level statement, no transliteration or Arabizi claim.** "Arabic and English" is the entirety of what is documented.
- **Runtime contract:** **Context window 4,096 tokens** — the tightest in this survey, which rules out most long-context agent patterns. **Tool/function calling: not documented anywhere on the card.** Structured output not documented. Text only. Serving: transformers, vLLM, SGLang; the card notes an OpenAI-compatible API format when served through those inference servers, which is a property of the serving stack, not a vendor endpoint. The card states the model "is optimized to function without a predefined system prompt" but accepts custom system prompts in English or Arabic, and **explicitly requires the developer to add their own safety layer**.
- **Deployment & residency:** **Open weights under Apache 2.0.** Self-hosting is the only documented path. **No SDAIA- or HUMAIN-operated API, no data-residency guarantee, and no sovereign-cloud claim are documented on any vendor-owned page reached.** Reports of a 34B ALLaM powering a HUMAIN chat product could not be traced to a vendor page and are not recorded.
- **Retired:** not publicly documented as of 2026-09-08; `v1` remains fetchable alongside `v2`.
- Sources: [ALLaM-7B-Instruct-preview](https://huggingface.co/ALLaM-AI/ALLaM-7B-Instruct-preview), [humain-ai org](https://huggingface.co/humain-ai)

### K2 (UAE — MBZUAI / Institute of Foundation Models) — VERIFIED

**Two renames.** The HuggingFace org is now **`IFM`** (`LLM360/K2-Think` redirects to `IFM/K2-Think`); `ifm.mbzuai.ac.ae` 301-redirects to `ifm.ai` and `k2think.ai` 302-redirects to `chat.ifm.ai`. IFM describes itself as "a global AI research lab… launched in May 2025 by MBZUAI," with sites in Abu Dhabi, Silicon Valley, and Paris.

- **Current models:** `IFM/K2-Think` (32B reasoning model, base `Qwen/Qwen2.5-32B`) is still published with no deprecation notice, but **`K2-Horizon` is the current family**: `IFM/K2-Horizon-375B-A23B` (379B sparse MoE, 23B activated), `IFM/K2-Horizon-MoVA-36B-A4B-FP8`, `IFM/K2-Horizon-7B-FP8`, `IFM/K2-Horizon-0.9B`, `IFM/K2-Horizon-7B-Uno`, `IFM/K2-Horizon-0.9B-Uno`, plus GGUF variants at 0.9B / 3.7B / 7B / MoVA-36B-A4B.
- **Language & script:** **English only** is what the model cards declare — both `K2-Think` and the K2-Horizon cards carry English-only language metadata. **Despite being a UAE / MBZUAI sovereign-adjacent program, no Arabic capability is claimed on these cards.** Do not infer Arabic coverage from institutional origin; that is Jais and Falcon territory. Non-English and script coverage are **not publicly documented as of 2026-09-08.**
- **Runtime contract:** K2-Horizon has a **524,288-token (512K) native context**. **Tool calling is documented and first-class**: a dedicated `k2_horizon` tool-call parser plus `--enable-auto-tool-choice`. This is the strongest documented agent contract among the regional families. Reasoning is explicit, with recommended `reasoning_effort="high"`, `temperature=1.0`, `top_p=0.95`, and a dedicated reasoning parser. Text only. Serving: vLLM (recipes at `recipes.vllm.ai/IFM`) and SGLang; validated on an 8×H200 node for the 375B MoE. Access is through **OpenAI-compatible endpoints you stand up yourself**. K2-Think's context window is not stated on its card.
- **Deployment & residency:** **Open weights under Apache 2.0** for both K2-Think and K2-Horizon. **No IFM-hosted production API is documented** — the cards point only to self-hosting recipes; `chat.ifm.ai` is a chat UI and `ifm.ai` returned HTTP 403. **No data-residency, UAE-hosting, or sovereign-cloud claim is documented on any reachable IFM page.**
- **Retired:** not publicly documented. `IFM/K2-Think` carries no deprecation marker and names no successor, even though K2-Horizon is clearly the active line — the succession is inferable from release activity, not stated.
- Sources: [IFM org](https://huggingface.co/IFM), [K2-Think](https://huggingface.co/IFM/K2-Think), [K2-Horizon-375B-A23B](https://huggingface.co/IFM/K2-Horizon-375B-A23B), [K2-Horizon-7B](https://huggingface.co/IFM/K2-Horizon-7B)

### SEA-LION / AI Singapore — VERIFIED

- **Current models:** `aisingapore/Qwen-SEA-LION-v4.5-27B-IT` (fine-tuned from `Qwen/Qwen3.6-27B`; also `-SpecDecoder` and `-GGUF`), `aisingapore/Gemma-SEA-LION-v4.5-E2B-IT` (from `google/gemma-4-E2B-it`, 2.3B effective / 5.1B with embeddings; also `-GGUF`), `aisingapore/Llama-SEA-LION-v3.5-70B-R` (reasoning, servable via the SEA-LION API), `aisingapore/SEA-Guard` (safety classifier). Embeddings: `SEA-LION-ModernBERT-Embedding-600M` (1024-dim), `-300M`, `SEA-LION-E5-Embedding-600M`, plus `SEA-LION-ModernBERT-300M`/`-600M` base models. The docs also index v1–v3.5 lines and VL variants; 77 models total in the org.
- **Language & script:** **v4.5 models are fine-tuned on seven named SEA languages plus English: Burmese, Indonesian, Filipino, Malay, Tamil, Thai, Vietnamese.** This named list is the reliable capability boundary. The Qwen v4.5 card additionally claims inherited support for 201 languages from the base model — that is **base-model breadth, not SEA-LION fine-tuning**, and must not be read as regional-quality coverage. The site says "11+ SEA languages" and the docs overview says evaluation on "10 regional languages," neither of which is reconciled to a named list. Where the counts disagree, **use the seven**. Scripts spanning that list necessarily include Latin (Indonesian, Filipino, Malay, Vietnamese with diacritics), Burmese (Myanmar script), Tamil, and Thai; **AI Singapore does not state script coverage explicitly** and does not document romanized-input handling.
- **Runtime contract:** public API at **`https://api.sea-lion.ai/v1`**; the docs state the chat endpoints are "compatible with OpenAI's API and libraries." **Rate limit: 10 requests per minute per user** (as of 2026-06-04) — a hard planning constraint; the public API is not a production-throughput surface. **Function/tool calling is documented** for Qwen-SEA-LION-v4.5, framed for agentic loops. Context: Qwen-SEA-LION-v4.5-27B-IT **262K**; Gemma-SEA-LION-v4.5-E2B-IT **128K**. Modality: Qwen v4.5 is a causal LM with a vision encoder (text + image); the Gemma v4.5 card claims text, image (variable aspect ratio and resolution), video, and audio. Structured output not documented.
- **Deployment & residency:** **Apache-2.0** for both v4.5 models per their cards. The docs' general statement is that SEA-LION aims at MIT "as much as possible" but that per-model terms follow the base model (Llama3, Gemma, Qwen) — **check the individual card, do not assume MIT.** Self-hosting is extensively documented: vLLM on Linux, Ollama, Kaggle, plus Google Vertex AI, Amazon Bedrock Custom Model Import, a Bedrock Access Gateway, and Cloudflare Workers AI. **Where the hosted `api.sea-lion.ai` inference runs is not documented** — no country, region, or provider is named, and no data-residency or Singapore-sovereignty guarantee appears; the docs direct residency questions to an email address. Governance context that *is* stated: SEA-LION is anchored by the Products Pillar of AI Singapore, supported by the National Research Foundation and NUS.
- **Retired:** not publicly documented as of 2026-09-08; v1–v3.5 remain listed with no deprecation labels.
- **Sailor2 is a separate project. No Sailor2 content appears under `aisingapore` or `sea-lion.ai`, so nothing is recorded for it.**
- Sources: [SEA-LION](https://sea-lion.ai/), [SEA-LION docs](https://docs.sea-lion.ai/), [v4.5 models](https://docs.sea-lion.ai/models/sea-lion-v4.5.md), [Qwen-SEA-LION-v4.5](https://docs.sea-lion.ai/models/sea-lion-v4.5/qwen-sea-lion-v4.5.md), [Gemma-SEA-LION-v4.5](https://docs.sea-lion.ai/models/sea-lion-v4.5/gemma-sea-lion-v4.5.md), [API guide](https://docs.sea-lion.ai/guides/inferencing/api.md), [aisingapore HF org](https://huggingface.co/aisingapore)

### HyperCLOVA X (Korea — NAVER) — VERIFIED

- **Hosted models (CLOVA Studio on NAVER Cloud Platform), by model ID:** `HCX-007` (hybrid reasoning; 128K max input, 32,768 max output, 128K combined; text only), `HCX-005` (multimodal text+image; 128K in, 4,096 out, 128K combined), `HCX-DASH-002` (lightweight; 32K in, 4,096 out), `HCX-003` (7,600 in, 4,096 out, 8,192 combined), `HCX-DASH-001` (3,500 in, 4,096 out, 4,096 combined).
- **Open weights (`naver-hyperclovax` HF org):** `HyperCLOVAX-SEED-Think-32B` (33B), `-Think-14B` (15B), `-Omni-8B` (11B), `HyperCLOVAX-SEED-Vision-Instruct-3B` (4B), `-Text-Instruct-1.5B`, `-Text-Instruct-0.5B`. The clova.ai lineup page also names "HyperCLOVA X THINK."
- **Language & script:** clova.ai states proficiency in **Korean, English, Japanese, and Chinese**. The SEED-Think-32B card describes the model as **Korean-centric** with multilingual capability without naming the others. **The CLOVA Studio model documentation does not state supported languages at all** — it describes Korean optimization only. Scripts: Hangul, Latin, Japanese kana/kanji, and Han are implied; **NAVER makes no explicit script-coverage statement**, and no romanization or transliteration behavior is documented. Treat anything beyond Korean as thinly documented.
- **Runtime contract:** endpoint `https://clovastudio.stream.ntruss.com/v3/chat-completions/{modelName}`. **This is a proprietary API surface, not OpenAI-compatible** — no OpenAI compatibility is claimed anywhere in the NAVER Cloud docs, and the parameter names are NAVER's own (`topP`, `topK`, `maxTokens` / `maxCompletionTokens`, `repetitionPenalty`, `includeAiFilters`). **Function calling is documented and model-gated: `HCX-007` and `HCX-005` only**, and `maxTokens` must exceed 1024 to use it. **Structured outputs are available only on `HCX-007`**, as is thinking/reasoning mode. Fine-tuning ("tuning") is available on HCX-005, HCX-DASH-002, HCX-003, HCX-DASH-001, but **tuning-trained jobs get no image input, no inference, no function calling, and no structured outputs** — a real trap if you plan to fine-tune an agent model. `HyperCLOVAX-SEED-Think-32B` (open weights) accepts text, images, and video, outputs text, 128K context, knowledge cutoff May 2025. **Tool calling is not documented on the open-weight SEED cards.**
- **Deployment & residency:** hosted via CLOVA Studio on NAVER Cloud Platform, with a separate **NAVER Cloud Platform for public institutions** (gov-ncloud) tier offering CLOVA Studio at `clovastudio.gov-ncloud.com`. **No explicit region, data-residency, or sovereignty guarantee is stated in the CLOVA Studio docs or on the reachable product pages** — the gov-ncloud product page rendered as navigation only with no compliance text. Korea-residency claims in third-party writeups could not be traced to a NAVER page and are not recorded. **Open weights ship under a proprietary per-model "HyperCLOVA X SEED … Model License Agreement", not an OSI license** — the HF org page describes the lineup as available for commercial use, but the license file governs. Self-hosting is possible only via the SEED models, not the hosted `HCX-*` line.
- **Retired:** not publicly documented as of 2026-09-08. `HCX-003` and `HCX-DASH-001` remain listed with much smaller context limits than the current tier, but NAVER states no deprecation and names no replacements.
- Sources: [HyperCLOVA X](https://clova.ai/en/hyperclova), [CLOVA Studio info](https://guide.ncloud-docs.com/docs/en/clovastudio-info), [CLOVA Studio models](https://guide.ncloud-docs.com/docs/en/clovastudio-model), [Chat completions v3 API](https://api.ncloud-docs.com/docs/en/clovastudio-chatcompletionsv3), [CLOVA Studio product](https://www.ncloud.com/product/aiService/clovaStudio), [gov-ncloud CLOVA Studio](https://www.gov-ncloud.com/product/aiService/clovaStudio), [naver-hyperclovax HF org](https://huggingface.co/naver-hyperclovax), [SEED-Think-32B](https://huggingface.co/naver-hyperclovax/HyperCLOVAX-SEED-Think-32B)

### Upstage Solar (Korea) — VERIFIED

Docs moved: `developers.upstage.ai/docs/*` now 308-redirects to `console.upstage.ai/docs/*`. **Fetching note for later tasks: `console.upstage.ai/docs/*` HTML renders only a promo hero to automated fetchers — append `.md` to the docs path for real content, and use `/api/docs/for-agents/raw` for the API contract.**

- **Current models.** Chat aliases: `solar-pro4` (latest, reasoning on by default), `solar-pro3`, `solar-pro2`, `solar-mini`, `syn-pro`. Active pinned versions: `solar-pro4-260806`, `solar-pro3-260323`, `solar-pro2-251215`, `solar-pro2-250909`, `solar-pro2-250710`, `solar-pro2-preview`, `solar-pro-250422`, `solar-pro-241126`, `solar-mini-250422`, `solar-mini-250123`, `solar-mini-240612`, `solar-mini-ja-250123`, `solar-mini-ja-240612`, `solar-docvision-preview`, `syn-250326`, `syn-pro-251021`. Document AI: `document-parse-260630`, `document-parse-260128`, `information-extract-260904`/`-260610`/`-260304`, `document-classify-260304`/`-260114`, OCR `ocr-260630`/`ocr-250904`/`ocr-2.2.1`/`ocr-2.1.1`/`ocr-2.1.0`/`ocr-1.0.0`, embeddings `solar-embedding-2-query` / `solar-embedding-2-passage`, `groundedness-check-240502` (beta). Open weights: `upstage/Solar-Open2-250B` (250B total / 15B active MoE, **1M context**), `upstage/Solar-Open-100B` (103B), `upstage/solar-pro-preview-instruct` (22B), `upstage/SOLAR-10.7B-Instruct-v1.0`, `upstage/SOLAR-10.7B-v1.0`, TinySolar 187m/111m.
- **Language & script:** **English, Korean, Japanese** are the documented core across the LLM and document-processing APIs, for both `solar-pro4` and `upstage/Solar-Open2-250B`. **Simplified Chinese and Kanji/Hanzi are documented as beta, not core.** `solar-mini-ja-*` is a Japanese-specific variant line. Scripts: Latin, Hangul, and Japanese kana/kanji are covered by the core three; Hanzi is explicitly beta-only. This family is East-Asia-scoped — **no Southeast Asian, Indic, Arabic, or Cyrillic coverage is claimed.**
- **Runtime contract:** base URL `https://api.upstage.ai/v1` (`/v2` for Agent APIs). The docs state the chat, embeddings, and document-classification endpoints are **"OpenAI SDK compatible"** — the clearest OpenAI-compat claim of any family in this brief. **Function calling documented**, with a max of **128 tools** per request and function names limited to alphanumerics plus underscore/hyphen, max 64 chars. **Structured outputs documented** via `response_format` with `json_schema`; first-level properties must be `string`, `integer`, `number`, or `array`, and max nesting depth is 10. Context / max output: `solar-pro4` **512K context, 128K max output**; `solar-pro3` 128K; `solar-mini` 32K; `Solar-Open2-250B` 1M. Reasoning effort is adjustable; on Solar Open 2 reasoning traces are kept separate from the final answer. `solar-mini` has no reasoning.
- **Deployment & residency:** **"Dedicated and on-premises deployment" is offered** for organizations with data-residency requirements, and **SOC 2 and ISO 27001** certified operations are claimed, both on the Solar Pro 4 release blog. **No region or country is named for the managed API**, and no Korea-residency or sovereign-cloud guarantee is documented. `solar-pro4` itself is **proprietary — not open weights**; API access only. The open weights are the separate `Solar-Open*` line under the **"Upstage Solar License"**, a proprietary license, not OSI. Solar Open 2 supports tool calling via the standard OpenAI function-calling interface when self-served with vLLM.
- **Retired.** Upstage publishes the most complete lifecycle table of any family in this brief, at `/docs/models/history`: `solar-open2` deprecated **2026-08-12** (HuggingFace only thereafter); `solar-pro3-260126` deprecated → `solar-pro3` or later; `solar-pro-preview` and `solar-10.7b-v1.0` marked older versions → recent Solar Mini/Pro; `document-parse-251217`/`-250618`/`-250508`/`-250404`/`-250116`/`-240910` deprecated → `document-parse` latest; `information-extract-260610` and `-260304` carry a deprecation date of **2026-10-06** → `information-extract-260904`, with `-260114`/`-250930`/`-250804`/`-250630`/`-250529` also deprecated; `document-classify-250830` deprecated → latest; `solar-embedding-1-large-query`/`-passage` deprecation dated **2026-12-31** → `solar-embedding-2-*`; prebuilt extractors (air waybill, bill of lading / shipping request, commercial invoice / packing list, KR export declaration, both `-250415` and `-4.1.6`) **deprecated 2026-05-06, service discontinued, no replacement**, along with `receipt-extraction-3.2.0` and `receipt-extractor-1.0.0`; `layout-analysis-*` / `layout-analyzer-0.1.0` are beta legacy.
- Sources: [Model history](https://console.upstage.ai/docs/models/history.md), [API docs for agents](https://console.upstage.ai/api/docs/for-agents/raw), [Solar Pro 4 blog](https://www.upstage.ai/blog/en/solar-pro-4), [Upstage HF org](https://huggingface.co/upstage), [Solar-Open2-250B](https://huggingface.co/upstage/Solar-Open2-250B)

---

## Sources

Every URL cited in this brief, deduplicated. All are provider-owned: vendor docs sites, API references, changelogs, release blogs, model cards on the vendor's own HuggingFace org, or repos under the vendor's own GitHub org. No aggregator, leaderboard, or news source is cited anywhere in this document.

- https://ai.google.dev/gemini-api/docs/available-regions
- https://ai.google.dev/gemini-api/docs/changelog
- https://ai.google.dev/gemini-api/docs/function-calling
- https://ai.google.dev/gemini-api/docs/interactions/interactions-overview
- https://ai.google.dev/gemini-api/docs/live-api
- https://ai.google.dev/gemini-api/docs/models
- https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash
- https://ai.google.dev/gemini-api/terms
- https://ai.meta.com/blog/
- https://api-docs.deepseek.com/api/create-chat-completion
- https://api-docs.deepseek.com/guides/anthropic_api
- https://api-docs.deepseek.com/guides/json_mode
- https://api-docs.deepseek.com/guides/responses_api
- https://api-docs.deepseek.com/guides/thinking_mode
- https://api-docs.deepseek.com/guides/tool_calls
- https://api-docs.deepseek.com/news/news260424
- https://api-docs.deepseek.com/news/news260813
- https://api-docs.deepseek.com/news/news260821
- https://api-docs.deepseek.com/quick_start/pricing
- https://api-docs.deepseek.com/updates
- https://api.ncloud-docs.com/docs/en/clovastudio-chatcompletionsv3
- https://blog.modelcontextprotocol.io/posts/2026-07-28/
- https://clova.ai/en/hyperclova
- https://console.upstage.ai/api/docs/for-agents/raw
- https://console.upstage.ai/docs/models/history.md
- https://developer.meta.com/ai/docs/
- https://developer.meta.com/ai/docs/model-cards-and-prompt-formats/
- https://developer.meta.com/ai/docs/model-cards-and-prompt-formats/llama4/
- https://developer.meta.com/ai/docs/overview/
- https://developer.meta.com/ai/llama4/license/
- https://developers.openai.com/api/docs/deprecations
- https://developers.openai.com/api/docs/guides/migrate-to-responses
- https://developers.openai.com/api/docs/guides/reasoning
- https://developers.openai.com/api/docs/guides/tools
- https://developers.openai.com/api/docs/guides/your-data
- https://developers.openai.com/api/docs/models
- https://docs.bigmodel.cn/cn/guide/start/model-overview
- https://docs.cohere.com/changelog/command-a-plus-05-2026
- https://docs.cohere.com/docs/cohere-works-everywhere
- https://docs.cohere.com/docs/command-a-plus
- https://docs.cohere.com/docs/deprecations
- https://docs.cohere.com/docs/models
- https://docs.cohere.com/docs/private-deployment-overview
- https://docs.cohere.com/docs/reasoning
- https://docs.cohere.com/docs/structured-outputs
- https://docs.cohere.com/docs/tool-use-overview
- https://docs.mistral.ai/admin/monitor-comply/zero-data-retention
- https://docs.mistral.ai/capabilities/function_calling/
- https://docs.mistral.ai/getting-started/models/models_overview/
- https://docs.mistral.ai/models
- https://docs.mistral.ai/models/deployment/local-deployment/vllm
- https://docs.mistral.ai/models/model-cards/mistral-large-3-25-12
- https://docs.qwencloud.com/
- https://docs.qwencloud.com/changelog/model-deprecation
- https://docs.qwencloud.com/changelog/model-deprecations/historical-mainline-models
- https://docs.qwencloud.com/changelog/model-deprecations/legacy-snapshot-models
- https://docs.qwencloud.com/changelog/model-deprecations/mainline-models
- https://docs.qwencloud.com/changelog/models
- https://docs.qwencloud.com/developer-guides/text-generation/structured-output.md
- https://docs.qwencloud.com/developer-guides/text-generation/thinking.md
- https://docs.sarvam.ai/
- https://docs.sarvam.ai/api-reference-docs/models/sarvam-105b
- https://docs.sarvam.ai/api/api-guides-tutorials/chat-completion/overview
- https://docs.sarvam.ai/api/getting-started/models
- https://docs.sarvam.ai/api/getting-started/quickstart
- https://docs.sarvam.ai/api/self-hosted/introduction
- https://docs.sea-lion.ai/
- https://docs.sea-lion.ai/guides/inferencing/api.md
- https://docs.sea-lion.ai/models/sea-lion-v4.5.md
- https://docs.sea-lion.ai/models/sea-lion-v4.5/gemma-sea-lion-v4.5.md
- https://docs.sea-lion.ai/models/sea-lion-v4.5/qwen-sea-lion-v4.5.md
- https://docs.z.ai/api-reference/llm/chat-completion
- https://docs.z.ai/devpack/tool/claude
- https://docs.z.ai/guides/capabilities/cache
- https://docs.z.ai/guides/capabilities/function-calling
- https://docs.z.ai/guides/capabilities/struct-output
- https://docs.z.ai/guides/capabilities/thinking
- https://docs.z.ai/guides/llm/glm-5.2
- https://docs.z.ai/guides/llm/glm-5.3
- https://docs.z.ai/guides/overview/overview
- https://docs.z.ai/guides/overview/pricing
- https://docs.z.ai/guides/vlm/glm-5.3-flash
- https://docs.z.ai/legal-agreement/privacy-policy
- https://falconllm.tii.ae/
- https://falconllm.tii.ae/falcon-models.html
- https://falconllm.tii.ae/falcon-terms-and-conditions.html
- https://github.com/MoonshotAI/Kimi-K2/blob/master/docs/tool_call_guidance.md
- https://guide.ncloud-docs.com/docs/en/clovastudio-info
- https://guide.ncloud-docs.com/docs/en/clovastudio-model
- https://huggingface.co/ALLaM-AI/ALLaM-7B-Instruct-preview
- https://huggingface.co/IFM
- https://huggingface.co/IFM/K2-Horizon-375B-A23B
- https://huggingface.co/IFM/K2-Horizon-7B
- https://huggingface.co/IFM/K2-Think
- https://huggingface.co/MiniMaxAI
- https://huggingface.co/MiniMaxAI/MiniMax-M2
- https://huggingface.co/MiniMaxAI/MiniMax-M2.7
- https://huggingface.co/MiniMaxAI/MiniMax-M3
- https://huggingface.co/Qwen
- https://huggingface.co/Qwen/Qwen3.5-397B-A17B
- https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- https://huggingface.co/Qwen/Qwen3.8-2.4T-A95B
- https://huggingface.co/Qwen/Qwen3.8-27B
- https://huggingface.co/aisingapore
- https://huggingface.co/deepseek-ai
- https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash
- https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro
- https://huggingface.co/humain-ai
- https://huggingface.co/ibm-granite
- https://huggingface.co/ibm-granite/granite-4.2-30b
- https://huggingface.co/ibm-granite/granite-4.2-8b
- https://huggingface.co/inception42
- https://huggingface.co/inception42/Jais-2-70B-Chat
- https://huggingface.co/inceptionai
- https://huggingface.co/inceptionai/Jais-2-8B-Chat
- https://huggingface.co/microsoft/Phi-4-reasoning-vision-15B
- https://huggingface.co/microsoft/models?sort=modified
- https://huggingface.co/mistralai
- https://huggingface.co/moonshotai/Kimi-K2.6
- https://huggingface.co/moonshotai/Kimi-K2.7-Code
- https://huggingface.co/moonshotai/Kimi-K3
- https://huggingface.co/naver-hyperclovax
- https://huggingface.co/naver-hyperclovax/HyperCLOVAX-SEED-Think-32B
- https://huggingface.co/openai
- https://huggingface.co/openai/gpt-oss-120b
- https://huggingface.co/openai/gpt-oss-20b
- https://huggingface.co/openai/gpt-oss-safeguard-120b
- https://huggingface.co/tiiuae
- https://huggingface.co/tiiuae/Falcon-H1-34B-Instruct
- https://huggingface.co/tiiuae/Falcon-H1R-7B
- https://huggingface.co/tiiuae/Falcon-Perception
- https://huggingface.co/upstage
- https://huggingface.co/upstage/Solar-Open2-250B
- https://huggingface.co/zai-org
- https://huggingface.co/zai-org/GLM-5
- https://huggingface.co/zai-org/GLM-5.3
- https://huggingface.co/zai-org/GLM-5.3-Flash
- https://modelcontextprotocol.io/specification/
- https://modelcontextprotocol.io/specification/2026-07-28/changelog
- https://platform.claude.com/docs/en/about-claude/model-deprecations
- https://platform.claude.com/docs/en/about-claude/models/overview
- https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool
- https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview
- https://platform.claude.com/docs/en/agents-and-tools/tool-use/programmatic-tool-calling
- https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-reference
- https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-search-tool
- https://platform.claude.com/docs/en/build-with-claude/compaction
- https://platform.claude.com/docs/en/build-with-claude/context-editing
- https://platform.claude.com/docs/en/build-with-claude/effort
- https://platform.claude.com/docs/en/build-with-claude/thinking
- https://platform.claude.com/docs/en/manage-claude/api-and-data-retention
- https://platform.claude.com/docs/en/managed-agents/overview
- https://platform.kimi.ai/docs/agreement/userprivacy
- https://platform.kimi.ai/docs/api/chat
- https://platform.kimi.ai/docs/api/messages
- https://platform.kimi.ai/docs/api/models-overview
- https://platform.kimi.ai/docs/guide/kimi-k3-quickstart
- https://platform.kimi.ai/docs/guide/response_format
- https://platform.kimi.ai/docs/guide/use-kimi-api-to-complete-tool-calls
- https://platform.kimi.ai/docs/guide/use-thinking-models
- https://platform.kimi.ai/docs/introduction
- https://platform.kimi.ai/docs/models
- https://platform.kimi.ai/docs/platform-changelog
- https://platform.minimax.io/docs/api-reference/responses-create
- https://platform.minimax.io/docs/api-reference/text-anthropic-api
- https://platform.minimax.io/docs/api-reference/text-openai-api
- https://platform.minimax.io/docs/api-reference/text-prompt-caching
- https://platform.minimax.io/docs/guides/local-deploy
- https://platform.minimax.io/docs/guides/local-deploy-m3
- https://platform.minimax.io/docs/guides/models-intro
- https://platform.minimax.io/docs/guides/text-generation
- https://platform.minimax.io/docs/guides/text-m2-reasoning
- https://platform.minimax.io/docs/guides/text-m3-function-call
- https://platform.minimax.io/docs/guides/transparency
- https://platform.minimax.io/docs/release-notes/models
- https://qwen.readthedocs.io/en/latest/framework/function_call.html
- https://research.meta.ai/blog/introducing-muse-spark-1-3
- https://sea-lion.ai/
- https://www.gov-ncloud.com/product/aiService/clovaStudio
- https://www.ibm.com/granite
- https://www.ibm.com/granite/docs/models/granite4-2
- https://www.kimi.ai/blog/kimi-k3
- https://www.ncloud.com/product/aiService/clovaStudio
- https://www.qwencloud.com/
- https://www.upstage.ai/blog/en/solar-pro-4
