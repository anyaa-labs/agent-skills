---
family: anthropic
access: api-only
scope: global
researched_date: 2026-09-08
---

# Claude (Anthropic)

### API surface

- Messages API remains the base surface; Claude Agent SDK, code execution, MCP, Skills, and advisor/executor patterns are separate harness decisions.
- Use advisor/executor split when a high-intelligence model should guide a cheaper or more stateful execution worker.
- **Claude Managed Agents** is a pre-built, configurable agent harness on Anthropic infrastructure — an alternative to hand-rolling an agent loop on the Messages API. Four concepts: Agent (model, system prompt, tools, MCP servers, skills), Environment (Anthropic cloud sandbox or a self-hosted sandbox), Session, Events. Built-in tools cover bash, file operations, web search/fetch with domain allow/blocklists, and MCP servers. Streams over SSE, supports mid-execution steering and interruption, supports scheduled (cron) deployments, and has built-in prompt caching and compaction. Requires the `managed-agents-2026-04-01` beta header. Client toolsets (computer/browser use) are not available as Managed Agents tools, and MCP tunnels / "dreaming" are a narrower research preview within the beta.
- Model capabilities are queryable at runtime through the Models API (`max_input_tokens`, `max_tokens`, `capabilities`).

### Reasoning state

- Two thinking modes. **Adaptive** (`thinking: {"type": "adaptive", "display": ...}`) lets the model decide when and how deeply to think, and is already on with no configuration needed on Claude Fable 5.1, Mythos 5.1, Fable 5, Mythos 5, Mythos Preview, Opus 5, and Sonnet 5. **Extended** (`thinking: {"type": "enabled", "budget_tokens": N}`) is the manual legacy mode; it is deprecated on Opus 4.6/Sonnet 4.6 and not accepted at all on later models.
- **Every thinking block carries a `signature` — an encrypted copy of the full reasoning. Pass the assistant message's thinking blocks back complete and unmodified when returning tool results; modified thinking blocks are rejected with a 400.** With `display: "omitted"` the visible `thinking` text is empty but the signature still carries continuity.
- **Breaking change for API accounts created on or after 2026-08-31: replaying an invalidated thinking block — invalidated by client-side edits to earlier turns — is now *rejected* unless the caller explicitly opts into dropping it.** On older accounts this was silently tolerated on some model classes. A harness that combines context editing with thinking and was written before the cutover can therefore look correct on the account it was built against and hard-fail on a newer one; check account creation date and opt-in status, not just the code path.
- You do not prune old thinking yourself: pass all blocks back and the API filters them, billing input tokens only for blocks actually shown. Override with the `clear_thinking_20251015` context-editing strategy (must be listed first when combined with other edits).
- **Toggling thinking mid-turn does not error** — the API silently disables thinking for that request or strips blocks that would produce an invalid turn. Check for the presence of `thinking` blocks in the response to confirm thinking actually ran; this is a silent-degradation failure mode worth naming in an audit.
- On Opus 5 and later, `thinking: {"type": "disabled"}` combined with `xhigh`/`max` effort returns a 400. With thinking disabled, Opus 5 can occasionally emit tool calls as plain text or leak internal XML tags into visible output.
- Interleaved thinking is automatic on every adaptive-thinking model (no beta header) but only for tools used through the Messages API; Claude Haiku 4.5 does not support it.
- Fable 5.1, Mythos 5.1, and Fable 5 can emit *progress updates* — short user-facing status sentences arriving as their own signed `thinking` block immediately before the `tool_use` block they introduce (visible under `display: "updates"`).
- Forced tool use: manual extended thinking only supports `tool_choice` `auto`/`none`. Adaptive thinking supports forced tool use except on Fable 5.1 and Mythos 5.1.

### Tool semantics

- `tool_choice` defaults to `auto`; `disable_parallel_tool_use: true` caps a turn at one call; `strict: true` on a custom tool guarantees schema conformance. Anthropic-provided tools include web search, web fetch, code execution, advisor, tool search, the MCP connector, memory, bash, text editor, computer use, and browser use — each with its own `type` string and, for client tools, an execution model your harness must implement.
- **Tool search tool** solves context bloat (a five-server MCP setup can burn ~55k tokens of definitions before any work starts; tool search typically cuts this by over 85%) and the accuracy drop Anthropic documents past 30–50 available tools. You still transmit every tool definition on every request — `defer_loading: true` controls what enters the context window, not what you send. At least one tool (normally tool search itself) must stay non-deferred, or the API returns a 400. Deferred tools are stripped from the system-prompt prefix before the cache key is computed, so deferring more tools does not invalidate the prompt cache — but a deferred tool cannot also carry `cache_control`. Regex search takes `re.search()` patterns (max 200 chars); BM25 takes natural language (max 500 chars); up to 10,000 deferred tools. Anthropic's own threshold: reach for tool search at 10+ tools, >10k tokens of definitions, or when aggregating multiple MCP servers.
- **Programmatic tool calling** lets Claude call your tools from inside the code execution sandbox instead of round-tripping through the model — useful for tool chains a harness would otherwise orchestrate manually. Requires `code_execution_20260120`+ and `allowed_callers: ["code_execution_20260120"]` on the callable tool; omitting `"direct"` forces code-only calling. Not supported on Claude Haiku 4.5, not ZDR-eligible, not available on Bedrock or Google Cloud, and on Microsoft Foundry requires a Hosted-on-Anthropic deployment.
- **Harness implication:** tool search and programmatic tool calling are loadout strategies, not just API features. An agent wired to a large MCP surface should be built to *discover* tools at call time — deferring definitions and searching by name/intent — rather than preloading every tool definition into every request. Preloading a large catalog is the default failure mode this pattern is meant to replace.
- **Memory tool** (`memory_20250818`) is client-side: Claude requests file operations (`view`, `create`, `str_replace`, `insert`, `delete`, `rename`) against storage your application controls, under a `/memories` path prefix. The API auto-injects a memory-protocol system prompt when the tool is present. **Path-traversal protection is explicitly the developer's responsibility** — Anthropic's own docs name `/memories/../../secrets.env` as the attack to guard against. Treat this as a required check in any Memory Architecture review. **There is also no built-in expiration** — Anthropic's docs put memory file size, count, and lifetime entirely on the implementer, so a memory store with no explicit eviction policy grows without bound by design, not by oversight.
- **Context management**: `clear_tool_uses_20250919` (server-side clearing of oldest tool results, default trigger 100k input tokens), `clear_thinking_20251015`, and `compact_20260112` (server-side compaction, default trigger 150k input tokens, minimum 50k, returns a `compaction` block and drops prior content on subsequent requests). SDK-side `tool_runner` compaction is deprecated in favor of server-side compaction.
- `temperature`, `top_p`, and `top_k` are deprecated on Opus 4.7 and later and return a 400 when set to a non-default value (the Python SDK v1.0+ removes them entirely). Anthropic's stated replacement is prompting, not sampling controls.

### Modality support

- Current models (Fable 5.1, Opus 5, Sonnet 5, Haiku 4.5) support text and image input, text output, multilingual output, vision, and tool use. **No audio or video input is claimed on the models-overview page** — do not assert it.
- Voice/realtime support is usually product-harness specific rather than a default Claude API surface.
- Client toolsets: bash, text editor, and computer/browser use (`computer_toolset_20260801`, `browser_toolset_20260801`) execute on your infrastructure, not Anthropic's.

### Context behavior

- Strong instruction adherence, but long context still suffers from distraction and context rot. Initializer prompts and fresh-context handoffs are preferred for long-running work.
- Current frontier models carry a 1M-token context window (200K for Haiku 4.5). 1M tokens is roughly 555k words on the tokenizer introduced with Opus 4.7; models before it fit about 750k words per 1M tokens — a real difference when estimating how much document text actually fits.
- On the Message Batches API, Opus 5, Sonnet 5, Opus 4.8, Opus 4.7, Opus 4.6, and Sonnet 4.6 support up to 300k output tokens with the `output-300k-2026-03-24` beta header.

### Structured output path

- Use tool schemas, constrained output features where available, XML structure, and assistant prefill/template strategies.
- Every Claude model ID is a pinned snapshot, including the dateless IDs used from the 4.6 generation onward — pin deliberately and track the alias-to-snapshot mapping in your own config, since cross-platform IDs differ (Bedrock uses `anthropic.claude-opus-5`-style IDs, Google Cloud uses `claude-haiku-4-5@20251001`-style dated IDs).

### Deployment & residency

- Platforms: Claude API (`api.anthropic.com`), Claude Platform on AWS, Amazon Bedrock, Google Cloud, Microsoft Foundry.
- Amazon Bedrock offers **global endpoints (dynamic routing)** and **regional endpoints (guaranteed data routing)** for Claude Sonnet 4.5 and later; Google Cloud offers global, multi-region, and regional endpoints. Both partner platforms set their own lifecycle and retirement dates, which can differ from Anthropic's own.
- Data processor differs by surface: Anthropic is the data processor on the Claude API, Claude Platform on AWS, and Microsoft Foundry; the cloud provider is the data processor on Amazon Bedrock and Google Cloud's Agent Platform.
- Conversation content is not retained by default. **Exception: Claude Fable 5.1, Mythos 5.1, Fable 5, and Mythos 5 are designated "Covered Models" requiring 30-day data retention — ZDR is not available for them unless expressly authorized by Anthropic.** A request to Claude Fable 5 from an organization whose retention configuration does not meet this bar returns a `400 invalid_request_error`. This is a hard constraint for regulated deployments considering the Fable/Mythos tier.
- Programmatic tool calling and Claude Managed Agents are explicitly **not ZDR-eligible**; Managed Agents is also not eligible for HIPAA BAA coverage, since it is stateful by design.
- Activity Feed data is retained 6 years. Local session transcripts (Claude Code, Cowork) are stored 6 years by default or per the org's custom retention period; remote session transcripts 6 years unless deleted.
- **Geographic controls are two independent settings, and the inference one defaults to unrestricted.** `inference_geo` is a per-request parameter on `POST /v1/messages`, valued `"global"` or `"us"`. **`"global"` is the default — inference may run in any geography unless the caller sets otherwise**, so a system with a residency obligation that never sets this parameter is not compliant by default. Workspace settings `allowed_inference_geos` (rejects out-of-list requests) and `default_inference_geo` (fallback when the request omits it) are configurable via Console or the Admin API under `data_residency`. Organizations that used the legacy global-routing opt-out were auto-migrated to `allowed_inference_geos: ["us"]` + `default_inference_geo: "us"`.
- **The response reports where inference actually ran: `usage.inference_geo`.** This makes residency assertable at runtime rather than merely configured — the same audit affordance as xAI's `x-zero-data-retention` header. A residency-sensitive harness should assert on it, not trust the request parameter it sent.
- **`inference_geo` is a Claude 4.6+ parameter. On Claude Opus 4.5, Sonnet 4.5, Haiku 4.5 and earlier it returns a 400.** A residency retrofit applied uniformly across a model fleet will break on any older pinned model.
- **`inference_geo` is not available through the OpenAI SDK compatibility endpoint**, and is not applicable on Amazon Bedrock or Google Cloud (there the endpoint URL or inference profile determines the region) or on Microsoft Foundry (which uses the *US Data Zone Standard* deployment type instead). **A harness that reaches Claude through the OpenAI-compatible shim therefore has no way to express a residency requirement at all** — that is an architecture consequence of the compatibility layer, not a configuration gap, and it is easy to miss because the shim otherwise works.
- **Workspace geo — data at rest and endpoint processing (image transcoding, code execution) — is fixed at workspace creation, cannot be changed afterwards, and currently offers only `"us"`.** A first-party deployment therefore *cannot* satisfy an EU (or any non-US) data-at-rest requirement today; that requires Bedrock or Google Cloud regional endpoints instead. Note the asymmetry: `inference_geo` constrains processing location, workspace geo constrains storage location, and a claim of "EU residency" that is true for one can be false for the other.
- Cost: US-only inference is **1.1x standard rates across every token category** (input, output, cache writes, cache reads) on the first-party API and Claude Platform on AWS, and the same multiplier applies to Azure US Data Zone Standard deployments and to Managed Agents whose config pins `inference_geo: "us"`. Under a Priority Tier commitment each US-pinned token draws down **1.1 tokens** of committed TPM. Rate limits are shared across geos.
- Managed Agents pins `inference_geo` at the agent's model configuration with per-session override at session create; unpinned agents follow the workspace default per request. With self-hosted sandboxes, tool execution and the sandbox filesystem stay on your infrastructure, but **attached memory-store contents remain stored by Anthropic and are copied into the sandbox per session** — a residency boundary that the sandbox choice alone does not close.
- Batch API supports a per-request `inference_geo`.
- Platform quirk: on Amazon Bedrock, server-side tool search is available only through the InvokeModel API, not the Converse API.

### Version-specific notes

- **Claude Opus 5**: Anthropic's own recommended default for most workloads. Adaptive thinking always on; `high` effort by default. Cost tier: $$$$.
- **Claude Fable 5.1 / Mythos 5.1 (Mythos-class tier)**: Anthropic's recommendation is to reach for Fable 5.1 for demanding reasoning and long-horizon agentic work, or when Opus 5 falls short even at higher effort. Both are "Covered Models" under the 30-day retention rule above — factor that into any regulated deployment. The Mythos line (`claude-mythos-5-1`, `claude-mythos-5`, `claude-mythos-preview`) is documented in compatibility lists (effort, thinking, tool search, programmatic tool calling, compaction) but has **no reachable Anthropic-owned capability table** as of 2026-09-08 — its model pages redirect to `anthropic.com/glasswing`. Treat Mythos as documented-but-out-of-band and do not assert its context window or modality support. `claude-mythos-preview` is deprecated in favor of `claude-mythos-5`. Cost tier: $$$$ (assume premium; unverified pricing).
- **Claude Sonnet 5**: Strong default executor/orchestrator when cost matters and evals support it. Cost tier: $$$.
- **Claude Haiku 4.5**: Good for routing, extraction, and low-risk worker tasks after eval. Does not support `effort`, programmatic tool calling, or interleaved thinking — confirm these gaps before assigning it agentic sub-tasks that assume they exist. Cost tier: $$.
- **Legacy but still available**: Fable 5, Opus 4.8, Opus 4.7, Opus 4.6, Opus 4.5 (`claude-opus-4-5-20251101`), Sonnet 4.6, Sonnet 4.5 (`claude-sonnet-4-5-20250929`). Useful for cost/eval continuity, but plan a migration path — see Retired below for the generation that already fell off the lifecycle.

### Known production failure modes

- Harness assumes model context alone can carry a multi-hour task.
- Tool descriptions are treated as passive docs instead of model instructions.
- MCP server or Skill content enters the prompt without trust and loadout boundaries — including preloading every tool definition when tool search should have been used instead.
- Over-conservative abstention is overridden by aggressive retry loops.
- Thinking is silently disabled or stripped mid-turn (a 400 is not always returned) and the harness doesn't check for the absence of `thinking` blocks to detect it.
- Modified or dropped thinking `signature` blocks on tool-result round-trips, which the API rejects outright.
- Memory tool wired up without path-traversal checks on the `/memories` prefix.
- Memory store with no eviction or expiry policy, on the assumption the API ages entries out — it does not; size, count, and lifetime are the implementer's job.
- Invalidated thinking blocks replayed after client-side edits to earlier turns, on an account created on or after 2026-08-31 where that is rejected rather than silently tolerated.
- A ZDR-configured org routes traffic to a Covered Model (Fable/Mythos tier) and gets hard 400s instead of a planned degradation.

### Harness requirements

- Use XML or clearly delimited structure for Claude prompts.
- Build long-running work around initializer output, artifacts, and fresh-context handoffs.
- Keep tool loadouts small or searchable via the tool search tool; do not dump huge MCP catalogs into context by default.
- Respect abstention and escalate with evidence rather than forcing retries.
- Pass thinking blocks back unmodified on every tool-result round-trip; treat a missing `thinking` block in the response as a signal to re-check configuration, not an error to ignore.
- Confirm ZDR/data-retention posture against the Covered Models list before routing traffic to Fable or Mythos-tier models.

### Retired / migration targets

Retirement dates are for Anthropic-operated platforms only; Bedrock and Google Cloud set their own lifecycle and retirement dates for the same model IDs.

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
| `claude-mythos-preview` | — (deprecated) | — | `claude-mythos-5` |

Lifecycle terms: Active → Legacy → Deprecated → Retired. Anthropic commits to at least **60 days' notice** before retiring a publicly released model, and publishes usage-audit instructions (Console → Usage → Export) for finding calls to a deprecated model — a concrete first step when an audit finds one of the IDs above in production config.

### Re-evaluate when

- Changing model generation or thinking effort.
- Moving tool surfaces into MCP/Skills/code execution, or introducing tool search / programmatic tool calling.
- Introducing Claude Managed Agents or an advisor/executor architecture.
- Adding long-running task harnesses or background execution.
- Editing earlier turns client-side in a thinking-enabled loop, or moving the workload onto an API account created on or after 2026-08-31.
- Routing traffic to Fable- or Mythos-tier models under a ZDR or HIPAA-BAA requirement.

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

### Sourcing gap carried forward

No Anthropic-owned capability table for the Mythos line was reachable as of 2026-09-08 (its model pages redirect to `anthropic.com/glasswing`, which was not fetched by the research pass). Do not assert Mythos context windows, cutoffs, or modality support beyond "documented as compatible with the same effort/thinking/tool-search/compaction features as Fable 5.1." Audio and video input for current Claude models is likewise unconfirmed — only text and image input are claimed.
