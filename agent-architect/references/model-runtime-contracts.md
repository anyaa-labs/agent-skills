# Model Runtime Contracts

This reference records the current source snapshot used to refresh `model-profiles.md`. It separates model behavior from API/runtime contract because production agent failures increasingly come from preserving or mishandling runtime state.

## Current Snapshot

Researched 2026-09-08. Provider notes below are a condensed pointer into `references/model-landscape-2026-09.md`, the primary-source evidence pass this refresh is built on — every claim there traces to a page the provider itself owns (docs site, API reference, HuggingFace model card, changelog, or release blog). When a provider note here and the landscape brief disagree, the landscape brief wins; this file is a summary, not a second source of truth. Per-family runtime detail, including exact model IDs, parser flags, and version-specific notes, lives in `model-profiles/<family>.md` — load the family file Discovery actually detected rather than re-deriving it from this page.

## Profile Fields Required

Every provider family profile in `model-profiles.md` must include these eleven headings:

- API surface
- Reasoning state
- Tool semantics
- Modality support
- Context behavior
- Structured output path
- Deployment & residency
- Known production failure modes
- Harness requirements
- Retired / migration targets
- Re-evaluate when

## Provider Notes

**Anthropic.** Effort (`low`…`max`) replaced manual `max_tokens`-style tuning and now governs thinking, tool calls, and text together; changing top-level effort busts the prompt cache, so a mid-conversation effort change should go through the per-message effort path instead. Every thinking block carries an encrypted `signature` that must be returned unmodified with tool results — a 400 otherwise. Tool search (deferred tool loading, `defer_loading: true`) and programmatic tool calling (calling tools from the code-execution sandbox instead of round-tripping the model) are both current, and Claude Managed Agents is a separate pre-built harness with its own statefulness and ZDR posture. A documented "Mythos" line exists in compatibility lists but has no reachable capability table — do not write specs for it from memory.

**OpenAI.** The Responses API is effectively mandatory for current reasoning models — Chat Completions drops tool calling once reasoning effort is anything but `none`. Reasoning items returned with a function call, plus every subsequent reasoning/function-output item, must be replayed on the next turn or reasoning continuity breaks; under Zero Data Retention this happens via `encrypted_content` replay rather than server-side storage. OpenAI's `tool_search` hosted tool is the same deferred-definition mechanic as Anthropic's tool search tool — a model-agnostic harness can treat them as one capability.

**Google Gemini.** The Interactions API, not `generateContent`, is now the documented agentic surface: it manages history server-side, exposes typed execution steps, and supports background execution. In stateless mode (`store=false`) the caller must resend the full history including every model-generated `thought` and `function_call` step exactly as received — the Gemini analogue of Anthropic's thinking-block and OpenAI's reasoning-item preservation rules. Agentic video understanding (on-demand transcript/frame retrieval instead of fixed sampling) is the multimodal analogue of tool search — see the multimodal reference for what that changes architecturally. Gemini's newest stable tier is Flash-only; treat "use the Pro model" advice as needing a preview-tier caveat, and do not assume Live/realtime support on the newest non-Live Flash release.

**Meta Llama.** Tool calling is a prompt-format convention (Python-style or JSON-style output text), not a vendor-enforced API contract — the harness owns the tool-call parser, with no vendor-side JSON-schema guarantee. Meta's 2026 releases are a separate proprietary "Muse" line; Llama itself shows no public statement on continued-flagship status, so treat it as a frozen generation rather than a current one until a provider-owned page says otherwise.

**Mistral.** Function calling and JSON-mode structured output are supported, but JSON mode requires an explicit prompt instruction — there is no schema-enforced path documented across the whole current lineup outside dedicated moderation/OCR models. Zero Data Retention on Mistral is scoped to a specific list of stateless endpoints and explicitly excludes the agent/conversation surface — the moment a workflow uses Mistral's stateful agent API, ZDR is off. Self-hosted tool-call parsing depends on a vLLM-owned (not Mistral-owned) parser flag.

**Cohere.** The richest runtime-contract documentation of the open-weight-adjacent tier, and the easiest to port incorrectly: tool responses return a Cohere-specific `tool_plan` field alongside `tool_calls` that OpenAI-shaped harnesses silently drop, and tool *results* are an array of document objects rather than a plain string. JSON mode without an explicit "produce JSON" instruction can run away and exhaust the context window — a vendor-documented failure mode, not a theoretical one. Cohere is the clearest "bring the model to the data" option for sovereignty-sensitive deployments, with genuine air-gapped private deployment support.

**IBM Granite.** The best-documented self-hosting contract in the current landscape: an explicit three-way thinking switch via chat-template kwargs (full / non-thinking / low-effort), and vendor-published vLLM and SGLang parser flags. The one sharp edge: the vendor-documented tool-call parser is not a Granite-named parser — guessing one produces malformed tool calls silently rather than an error. Sampling guidance is prescriptive and unusually high-temperature for agentic work; deviating from it without cause is itself worth a harness note.

**OpenAI open-weight (gpt-oss).** Folded into the OpenAI profile rather than kept separate — same vendor, one load-bearing fact: the harmony response format is mandatory, and calling the model outside it does not degrade gracefully, it stops working correctly. Reasoning effort is a system-prompt convention (`Reasoning: high`), not an API parameter, which is a materially different contract than the hosted OpenAI models.

**Microsoft Phi.** Too thinly documented for its own profile — no tool-calling contract, no structured-output path, and no parser flags on any reachable Microsoft-owned page. Treat as a capability-unknown family if detected; do not assume OpenAI-shaped tool calling just because the ecosystem around it does.

**DeepSeek, Qwen, Moonshot/Kimi, Zhipu/GLM, MiniMax (Chinese open-weight tier).** Read as one cohort — the failure modes converge even though the flagship model IDs differ every few months:
- Permissive (MIT/Apache) licensing is no longer the norm across this tier; only DeepSeek's current flagship line stays fully permissive. License terms vary **per repository**, not per family — check the specific weights, not the vendor's reputation.
- Every family in this tier now requires echoing reasoning state back on multi-turn tool use, but the rule differs by vendor: unconditional on some, gated by a flag with a silent (non-erroring) quality penalty on others, and a hard 400 on at least one. A harness built against one vendor's rule will silently degrade or hard-fail against another's — never assume the rule transfers.
- Self-hosted parser flags (tool-call parser, reasoning parser) are vendor-documented only for each family's *previous* generation, not its current flagship. The current flagship routinely ships no chat template and no documented parser name at all — guessing produces malformed tool calls, not an error.
- Structured output in this tier is weak: most families support JSON-object mode only, not schema-enforced JSON; tool calling is the vendor-blessed path to structured data for most of them.
- Anthropic-compatible endpoints are now near-universal across this tier, alongside the native and OpenAI-compatible surfaces — useful for harness portability, but each has its own quirks (wrong-endpoint-silently-uses-wrong-quota, thinking-mode defaults that invert between endpoints of the same vendor).
- Residency claims in this tier are almost always base-URL routing (pick a regional endpoint), not a data-processing-location guarantee — treat "sovereign" and "regional" as unrelated properties here.

**Regional families (Sarvam, Falcon/TII, Jais, ALLaM, K2, SEA-LION, HyperCLOVA X, Upstage Solar).** Tool-calling support is the sharpest capability split in this group — several bilingual/regional models (short-context Arabic models in particular) document no tool-calling contract at all, which rules them out for agent harnesses regardless of language fit. "Sovereign" or "regional" branding rarely comes with a documented data-residency guarantee; only a couple of vendors in this group document anything concrete beyond "self-host the open weights in your own region." Verify residency claims against a provider-owned page before writing them into a compliance-facing profile — vendor marketing and vendor documentation diverge here more than in any other tier.

**Model Context Protocol.** The current spec revision is stateless at the protocol level: the connection handshake and session ID are gone, list results (`tools/list`, `resources/list`, `prompts/list`) are cacheable with an explicit TTL and cache scope, and server-initiated requests (roots, sampling, elicitation) are replaced by a multi-round-trip pattern the client resolves by retrying with the missing input. Roots, Sampling, and Logging are deprecated as protocol features — an architecture that still routes model calls back through MCP Sampling is on a deprecated path. See `references/model-landscape-2026-09.md` (Model Context Protocol section) for the full delta and for what is transport detail versus architecture-relevant; header-based routing, error-code renumbering, and subscription-transport mechanics are deliberately excluded from this summary as non-architectural.

## Sources

- [Model Landscape Research Brief, 2026-09-08](./model-landscape-2026-09.md) — primary-source evidence pass behind this refresh; the authoritative source for every claim above.
- [Claude models overview](https://platform.claude.com/docs/en/about-claude/models/overview)
- [Tool search tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-search-tool)
- [Programmatic tool calling](https://platform.claude.com/docs/en/agents-and-tools/tool-use/programmatic-tool-calling)
- [Claude Managed Agents overview](https://platform.claude.com/docs/en/managed-agents/overview)
- [OpenAI reasoning models](https://developers.openai.com/api/docs/guides/reasoning)
- [OpenAI tools](https://developers.openai.com/api/docs/guides/tools)
- [Gemini Interactions API](https://ai.google.dev/gemini-api/docs/interactions/interactions-overview)
- [Gemini function calling](https://ai.google.dev/gemini-api/docs/function-calling)
- [Meta AI developer docs overview](https://developer.meta.com/ai/docs/overview/)
- [Mistral function calling](https://docs.mistral.ai/capabilities/function_calling/)
- [Mistral zero data retention](https://docs.mistral.ai/admin/monitor-comply/zero-data-retention)
- [Cohere tool use overview](https://docs.cohere.com/docs/tool-use-overview)
- [IBM Granite 4.2 docs](https://www.ibm.com/granite/docs/models/granite4-2)
- [DeepSeek API updates](https://api-docs.deepseek.com/updates)
- [QwenCloud docs](https://docs.qwencloud.com/)
- [Moonshot / Kimi tool-call guidance](https://github.com/MoonshotAI/Kimi-K2/blob/main/docs/tool_call_guidance.md)
- [Z.ai / GLM function calling](https://docs.z.ai/guides/capabilities/function-calling)
- [MiniMax text generation guide](https://platform.minimax.io/docs/guides/text-generation)
- [MCP 2026-07-28 release post](https://blog.modelcontextprotocol.io/posts/2026-07-28/)
- [MCP 2026-07-28 specification changelog](https://modelcontextprotocol.io/specification/2026-07-28/changelog)
