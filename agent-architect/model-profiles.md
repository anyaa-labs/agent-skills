# Model Profiles for Agent Architecture Evaluation

> **Provenance:** Researched 2026-06-14. Sources: OpenAI model, reasoning, tools, Agents SDK, sandbox, and voice docs; Anthropic model, extended thinking, harness, advisor, context, MCP, and Skills docs; Google Gemini model, Interactions, function calling, Live API, and computer-use docs; DeepSeek API updates; Mistral function calling and structured output docs; Qwen function calling and agent docs; Meta Llama 4 announcement; context-rot and agent-eval research. See `references/model-runtime-contracts-2026-06.md` and `CHANGELOG.md` for update history.

These profiles describe *agent-relevant runtime contracts*, not just model personality. For current pricing, regional availability, rate limits, and provider-specific deployment constraints, use web research on the provider's official documentation.

## How to Use

During Discovery, detect model IDs, provider APIs, runtime surfaces, modalities, reasoning-state requirements, and tool protocols. Apply the closest family profile, then apply version-specific notes when the exact version is known.

Every profile includes:

- **API surface** - which endpoint/runtime the provider recommends for agentic work.
- **Reasoning state** - what hidden/summary/encrypted/thought-signature state must be preserved across turns.
- **Tool semantics** - function calling, parallel calls, tool IDs, MCP, tool search, or code-mode behavior.
- **Modality support** - text, image, audio, video, realtime, computer use, generated media.
- **Context behavior** - raw window and practical failure risks.
- **Structured output path** - strict schema, JSON mode, constrained decoding, grammar, or parser.
- **Known production failure modes** - agent-specific risks to check.
- **Harness requirements** - required state, boundaries, validation, and re-evaluation triggers.
- **Re-evaluate when** - provider/model events that should trigger a harness review.

**Precedence rule:** When a model profile contradicts a generic checklist item, the model-specific guidance takes precedence. Suppress the generic finding and report the model-aware finding instead.

**Version matching:** Detect the specific version string (for example, `gpt-5.5`, `claude-opus-4-8`, `gemini-3-pro`, `deepseek-v3.2`). Match to the closest version in the family profile. If only the family is known, apply family-wide patterns and flag: "Applying [family] profile. Exact version behavior may differ."

**API ID to family mapping:** Model strings in code often differ from marketing names. Match by prefix/substring:

- `gpt-5*`, `gpt-realtime*`, `o*`, `gpt-*` -> OpenAI GPT/reasoning/realtime family
- `claude-opus-4-*`, `claude-sonnet-4-*`, `claude-haiku-4-*`, `claude-*`, `anthropic.*` -> Claude family
- `gemini-3*`, `gemini-2.5*`, `gemini-*` -> Gemini family
- `qwen3*`, `qwen-*`, `qwen_*` -> Qwen family
- `deepseek-v4*`, `deepseek-v3*`, `deepseek-chat`, `deepseek-reasoner`, `deepseek-*` -> DeepSeek family
- `llama-4*`, `llama-*`, `meta-llama/*` -> Llama family
- `mistral-*`, `open-mistral-*`, `codestral-*` -> Mistral family
- `command-r*`, `cohere.*` -> Command R family

If an API ID matches a family but not a specific version in the profile, apply family-wide patterns and note the uncertainty. Do not treat it as UNKNOWN if the family is known.

**Cost tiers** are intentionally approximate for offline reasoning:

- **$$$$** - Premium frontier/advisor/reviewer.
- **$$$** - Standard frontier/orchestrator.
- **$$** - Mid-tier worker/router/extractor.
- **$** - Budget or self-hosted worker.

---

## OpenAI GPT, Reasoning, and Realtime

### API surface

- Use Responses API for production reasoning agents that call tools, preserve reasoning, or need hosted tools.
- Use Agents SDK when application code owns orchestration, state, tools, approvals, handoffs, guardrails, or tracing.
- Use sandbox agents when files, commands, packages, ports, artifacts, snapshots, mounts, or human review are part of the product.
- Preserve Chat Completions only for legacy simple chat paths where no reasoning-state or hosted-tool contract is needed.

### Reasoning state

- Reasoning models work best when reasoning items are carried forward with function-call outputs.
- In stateless or zero-data-retention setups, request encrypted reasoning content and replay it with subsequent turns.
- Dropping reasoning items can produce lower quality and can break multi-step tool loops.

### Tool semantics

- Function calling supports strict schemas and parallel calls on capable models.
- Tool calls are trace objects, not just generated JSON. Preserve call IDs, outputs, and reasoning items together.
- Hosted tools and SDK tools should be audited as part of the harness, not hidden behind "model capability."

### Modality support

- GPT-5.x covers text, coding, reasoning, image-capable workflows depending on model ID, and hosted tools.
- GPT-Realtime models cover low-latency speech-to-speech, translation, transcription, and live tool-mediated interactions.

### Context behavior

- Large context does not remove the need for relevance selection. Long conversations still need phase-aware handoffs and trace summaries.
- Treat cached/static context and per-turn dynamic state as separate cost surfaces.

### Structured output path

- Use strict schemas for tool definitions and structured outputs where supported.
- For non-tool JSON, validate output before persistence or downstream actions.

### Version-specific notes

- **GPT-5.5**: Start here for complex reasoning, coding, scientific reasoning, and multi-step agentic workflows. Use Responses API for best reasoning/tool performance. Preserve reasoning items across tool calls; in stateless or ZDR mode include and replay encrypted reasoning content. Cost tier: $$$$.
- **GPT-5.5-pro**: Highest-intelligence option when latency can be higher. Use for reviewer, planner, scientific reasoning, and difficult coding roles, not bulk worker turns. Cost tier: $$$$.
- **GPT-5.4**: Lower-cost reasoning option. Good for production flows where GPT-5.5 quality is not required every turn. Cost tier: $$$.
- **GPT-5.4-mini / GPT-5.4-nano**: Use for latency/cost-sensitive routing, extraction, transformation, and lightweight tool workers after eval proves quality. Confirm tool-search and schema support before use. Cost tier: $$/$.
- **GPT-Realtime-2 / GPT-Realtime-Translate / GPT-Realtime-Whisper**: Voice runtime models. Evaluate VAD, interruption, live tool timing, transcript drift, and fallback behavior separately from text agents. Cost tier: varies by audio usage.
- **GPT-4.1 and GPT-4o legacy paths**: Keep existing mitigations for literal instruction following, sycophancy, and strict schema enforcement until evals prove the migration target absorbs them.

### Known production failure modes

- Reasoning state dropped across tool calls.
- Generic Chat Completions endpoint used for a workflow that needs SDK state, background execution, approvals, or sandbox artifacts.
- Realtime voice paths without VAD, interruption, transcript, or fallback contracts.
- Legacy prompt scaffolding retained after model upgrades without eval.

### Harness requirements

- Prefer Responses API for reasoning agents; use Agents SDK when application code owns orchestration, state, tools, approvals, handoffs, or observability.
- Preserve reasoning items with function-call outputs. In stateless/ZDR mode request encrypted reasoning content and replay it with subsequent turns.
- Use sandbox agents when files, commands, packages, ports, artifacts, snapshots, mounts, or human review are part of the product.
- For realtime voice, define turn-taking, transcript source of truth, tool timing, and fallback channels.

### Re-evaluate when

- Changing between Chat Completions and Responses.
- Changing reasoning effort or moving to/from GPT-5.5-pro.
- Adding realtime voice or hosted/sandbox tools.
- Changing storage mode, ZDR, or stateless conversation handling.

---

## Claude (Anthropic)

### API surface

- Messages API remains the base surface; Claude Agent SDK, code execution, MCP, Skills, and advisor/executor patterns are separate harness decisions.
- Use advisor/executor split when a high-intelligence model should guide a cheaper or more stateful execution worker.

### Reasoning state

- Extended thinking blocks and tool-use history must be preserved according to the API contract.
- Thinking effort changes are behavior changes and should trigger evals, especially for long-running tasks.

### Tool semantics

- Tool descriptions receive prompt-engineering-level attention.
- MCP tools and Skills can reduce prompt bloat, but their descriptions and file contents become part of the instruction/data surface.
- Code-mode or filesystem-discoverable APIs are preferable when an MCP server exposes many tools.

### Modality support

- Claude supports text, vision, document, code, MCP, and skill-driven file workflows depending on model/API surface.
- Voice/realtime support is usually product-harness specific rather than the default Claude API surface.

### Context behavior

- Strong instruction adherence, but long context still suffers from distraction and context rot.
- Initializer prompts and fresh-context handoffs are preferred for long-running work.

### Structured output path

- Use tool schemas, constrained output features where available, XML structure, and assistant prefill/template strategies.

### Version-specific notes

- **Opus 4.8**: Strong advisor/reviewer/planner model. High effort may be the default on some surfaces; set effort deliberately. Cost tier: $$$$.
- **Opus 4.7 / Opus 4.6**: Use for high-stakes planning, review, and subtle bug finding. Cost tier: $$$$.
- **Sonnet 4.6**: Strong default executor/orchestrator when cost matters and evals support it. Cost tier: $$$.
- **Haiku 4.5**: Good for routing, extraction, and low-risk worker tasks after eval. Cost tier: $$.

### Known production failure modes

- Harness assumes model context alone can carry a multi-hour task.
- Tool descriptions are treated as passive docs instead of model instructions.
- MCP server or Skill content enters the prompt without trust and loadout boundaries.
- Over-conservative abstention is overridden by aggressive retry loops.

### Harness requirements

- Use XML or clearly delimited structure for Claude prompts.
- Build long-running work around initializer output, artifacts, and fresh-context handoffs.
- Keep tool loadouts small or searchable; do not dump huge MCP catalogs into context.
- Respect abstention and escalate with evidence rather than forcing retries.

### Re-evaluate when

- Changing model generation or thinking effort.
- Moving tool surfaces into MCP/Skills/code execution.
- Introducing managed-agent or advisor/executor architecture.
- Adding long-running task harnesses or background execution.

---

## Gemini (Google)

### API surface

- Use `generateContent` for stable existing integrations.
- Use Interactions API for new agentic workflows that need server-side history, typed execution steps, background tasks, complex reasoning, or multimodal multi-turn state.

### Reasoning state

- Thinking budgets and thought-signature/state behavior are part of the runtime contract.
- Multi-turn function calling can require preserving provider-specific state/signatures.

### Tool semantics

- Gemini 3 model APIs generate a unique `id` for every function call. If manually constructing conversation history or using REST, return the matching `id` in each function response.
- Gemini supports combined built-in tools and custom function calling on newer APIs. Verify exact model/API support before designing a mixed tool call.

### Modality support

- Gemini models cover text, image, audio, video, and long-context multimodal workflows depending on model ID.
- Gemini Live supports low-latency realtime voice and vision interactions, tool use, transcripts, barge-in, proactive audio, affective dialog, and live translation, with feature differences by model.
- Gemini computer use returns normalized screen coordinates and can emit multiple UI actions in one turn. The harness must execute actions and verify resulting screen state.

### Context behavior

- Gemini can handle very large raw context, but long context still needs context-selection evals.
- Media resolution, frame sampling, and transcript budgets are architecture decisions.

### Structured output path

- Use `response_schema`, structured output modes, or validated function-call schemas.
- Preserve function-call IDs and responses exactly when manually constructing history.

### Version-specific notes

- **Gemini 3 Pro / 3.x reasoning models**: Strong long-context and multimodal reasoning. Use Interactions API when agent state and background execution matter. Cost tier: $$$.
- **Gemini Flash 3 / Flash family**: Good high-throughput multimodal worker/router after eval. Cost tier: $$.
- **Gemini Live models**: Realtime voice/vision runtime. Evaluate latency, barge-in, synchronous tool calls, transcript drift, and modality fallback.
- **Gemini computer-use models**: Browser/screen action runtime. Require post-action visual validation and high-risk action approvals.

### Known production failure modes

- Thought signature or function-call ID not preserved.
- Long context used as a substitute for relevance selection.
- Computer-use actions continue after visual state diverges.
- Live tool calls lack timing and timeout policy.

### Harness requirements

- Preserve tool IDs and provider-required state across turns.
- Configure thinking budget, media resolution, and frame/transcript budgets explicitly.
- Validate screen state after computer-use actions.
- Treat media as untrusted instructions.

### Re-evaluate when

- Moving from `generateContent` to Interactions API.
- Moving to Gemini 3.x reasoning models.
- Adding Live API, computer use, media-resolution controls, or background execution.

---

## DeepSeek

### API surface

- OpenAI-compatible APIs are common, but model aliases and hosted behavior can change.
- Verify the target provider's structured output and tool-call behavior directly.

### Reasoning state

- Thinking/non-thinking modes are different runtime contracts.
- R1-style reasoning can leak into output if not contained.

### Tool semantics

- Tool support and structured output reliability vary by model and provider.
- Long agent loops need hard iteration and retry limits.

### Modality support

- Primarily text/code/reasoning on common API surfaces. Treat multimodal support as provider-specific until verified.

### Context behavior

- Good cost/performance can hide weak multi-turn reliability. Validate with repeated tool-loop evals.

### Structured output path

- Use explicit schema inspection prompts and external validation.
- Do not rely on self-correction alone after tool errors.

### Version-specific notes

- **DeepSeek V3.2**: Reasoning-first model framed for agents. Validate multi-turn tool behavior and structured output on the target provider before using as orchestrator.
- **DeepSeek V3.2-Speciale**: Reasoning-heavy API-only option. Treat as high-latency advisor/reasoner until evals prove agent-loop reliability.
- **DeepSeek R1**: Avoid system prompts, avoid few-shot, and keep it out of multi-step agent loops unless current provider evals prove otherwise.
- **deepseek-chat / deepseek-reasoner legacy aliases**: During the 2026 transition they point to `deepseek-v4-flash` non-thinking and thinking modes, and are scheduled for discontinuation on 2026-07-24. Do not build new production configs on these aliases.

### Known production failure modes

- Legacy aliases silently changing behavior or being discontinued.
- Error-loop retries after failed tools.
- Reasoning leakage into structured output.
- Provider-specific tool parser incompatibility.

### Harness requirements

- Pin exact model IDs where possible and track alias deprecations.
- Add hard turn limits and error-loop circuit breakers.
- Validate structured output outside the model.
- Run long-chain tool-use evals before using as an orchestrator.

### Re-evaluate when

- Any legacy alias is used.
- Switching thinking/non-thinking modes.
- Changing provider because structured output and tool support vary by host.

---

## Qwen

### API surface

- Qwen deployments vary across DashScope, OpenAI-compatible APIs, vLLM, SGLang, local servers, and Qwen-Agent.

### Reasoning state

- Qwen3-Coder and subsequent series may require explicit thinking-mode configuration depending on provider protocol.

### Tool semantics

- Qwen3 function calling is template- and parser-sensitive. Prefer Qwen-Agent or provider-supported templates for agentic tool use.
- Self-hosted Qwen3-Coder deployments must verify tokenizer, chat template, and tool parser compatibility before production use.

### Modality support

- Qwen family support varies by submodel. Treat vision, audio, and coding support as exact-model-specific.

### Context behavior

- Long-context claims need deployment-level testing because template/parser mismatch can dominate base model quality.

### Structured output path

- Use provider-supported tool templates, Qwen-Agent, or a validated external parser.
- Add a startup validation fixture for at least one successful and one failed tool call.

### Known production failure modes

- Tool calls fail because serving stack, tokenizer, or chat template differs from training/eval setup.
- Thinking-mode configuration changes output format.
- Self-hosted endpoints expose incomplete tool parser behavior.

### Harness requirements

- Add a startup validation that sends one simple tool-call fixture through the exact serving stack.
- Run long-chain tool-use evals on the deployment, not just the base model.

### Re-evaluate when

- Changing serving stack, tokenizer, chat template, tool parser, or thinking-mode configuration.

---

## Llama (Meta)

### API surface

- Usually self-hosted or provider-hosted through an OpenAI-compatible surface; actual tool support depends on serving stack.

### Reasoning state

- External state management is usually required for complex agents. Do not assume persistent reasoning state.

### Tool semantics

- Tool calling often depends on special tokens, chat templates, parser config, and serving framework.
- External grammar constraints remain important for reliable JSON in production.

### Modality support

- Llama 4 Scout/Maverick are natively multimodal open-weight models; verify exact host support for images and long context.

### Context behavior

- Advertised context can exceed effective reasoning range. Validate context selection and long-context performance on the deployed stack.

### Structured output path

- Use external grammar constraints where available: llama.cpp grammars, vLLM guided decoding, Outlines, or equivalent.

### Version-specific notes

- **Llama 4 Scout / Maverick**: Multimodal open-weight models with very large advertised context. Use context-selection validation and external output constraints before production agent use. Cost tier: $/$$ depending on host.
- **Llama 3.3 70B / 3.1 405B**: Viable open-weight options for controlled workers. Cost tier: $/$$.
- **Small Llama variants**: Restrict to short, bounded, validated tasks. Cost tier: $.

### Known production failure modes

- Path forgetting, malformed JSON, template mismatch, cascading self-correction, and hallucinated placeholders.
- Small models loop on capability descriptions instead of acting.

### Harness requirements

- Validate the exact serving stack with tool-call fixtures.
- Keep system prompts and tool sets small for smaller models.
- Detect cascading errors and stop rather than relying on self-correction.

### Re-evaluate when

- Changing serving framework, tokenizer, chat template, parser, quantization, or context length.

---

## Mistral

### API surface

- Mistral function calling and structured output are supported on current conversation APIs.

### Reasoning state

- Treat as short-chain unless the exact model and provider evals prove long-chain stability.

### Tool semantics

- Function calling uses standard schemas, but JSON mode still needs explicit prompt instructions.

### Modality support

- Depends on model and API surface; do not infer multimodal support from family name alone.

### Context behavior

- Strong fast worker profile. Avoid using as a deep multi-step orchestrator without eval evidence.

### Structured output path

- Use JSON mode or function calling plus explicit "output JSON" or format instruction.

### Version-specific notes

- **Mistral Large 3 / Medium**: Solid general worker/tool user. Not the first choice for long autonomous chains. Cost tier: $$.
- **Mistral Small**: Use for simple extraction/routing only after schema eval. Cost tier: $.

### Known production failure modes

- Implicit JSON-mode assumptions.
- Limited self-correction in long tool loops.
- Using fast worker models for reviewer/planner roles.

### Harness requirements

- Keep sessions short and validate output externally.
- Include explicit output format instructions even with JSON mode.

### Re-evaluate when

- Changing structured-output mode, model tier, or function-calling transport.

---

## Command R / Cohere

### API surface

- Strong document/RAG-oriented surfaces with citation capabilities and structured output modes.

### Reasoning state

- Do not assume hidden reasoning-state preservation beyond provider-supported conversation history.

### Tool semantics

- Strong multi-step tool behavior for retrieval-heavy workflows, but structured outputs and RAG modes can have compatibility constraints.

### Modality support

- Treat as text/document-first unless exact model docs say otherwise.

### Context behavior

- Good fit for cited RAG answers. Use explicit document boundaries and source attribution.

### Structured output path

- Use JSON schema / JSON object response formats where supported and include explicit "Generate a JSON" instruction.

### Version-specific notes

- **Command R+**: Strong retrieval/tool worker for cited answers. Cost tier: $$.

### Known production failure modes

- Infinite generation loop if JSON instruction is omitted with JSON mode.
- Structured output incompatible with some RAG configurations.

### Harness requirements

- Choose either structured output or native RAG mode when provider limitations require it.
- Leverage built-in citations instead of adding a separate citation hallucination surface.

### Re-evaluate when

- Changing RAG mode, structured-output mode, or citation requirements.
