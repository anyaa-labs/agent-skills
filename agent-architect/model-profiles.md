# Model Profiles for Agent Architecture Evaluation

> **Provenance:** Researched 2026-04-02. Sources: Anthropic engineering blog, OpenAI GPT-4.1 prompting guide, Berkeley Function Calling Leaderboard V4, Chroma context rot study, Google Gemini tooling docs, DeepSeek API docs, Mistral function calling docs, Cohere structured outputs docs. See CHANGELOG.md for update history. These profiles describe *behavioral patterns* (stable for months) — for version-specific feature support or current pricing, use WebSearch.

## How to Use

During Phase 0, detect which models the codebase uses. Look up each model's profile here. Apply model-specific flags during checklist evaluation.

**Precedence rule:** When a model profile contradicts a generic checklist item, the model-specific guidance takes precedence. Suppress the generic finding and report the model-aware finding instead.

**Version matching:** Detect the specific version string (e.g., `gpt-4.1`). Match to the closest version in the family profile. If only the family is known, apply family-wide patterns and flag: "Applying [family] profile. Exact version behavior may differ."

**API ID to family mapping:** Model strings in code (API IDs) often differ from marketing names. Match by prefix/substring to family:
- `claude-*`, `anthropic.*` → Claude family
- `gpt-*`, `o1-*`, `o3-*` → GPT family
- `gemini-*` → Gemini family
- `llama-*`, `meta-llama/*` → Llama family
- `mistral-*`, `open-mistral-*` → Mistral family
- `deepseek-chat`, `deepseek-reasoner`, `deepseek-*` → DeepSeek family (`-reasoner` → R1 profile, `-chat` → V3/V3.1 profile)
- `command-r*`, `cohere.*` → Command R+ family

If an API ID matches a family but not a specific version in the profile, apply family-wide patterns and note the uncertainty. Do NOT treat it as UNKNOWN — it belongs to a known family.

**Cost tiers** (approximate, for offline estimation — do NOT treat as current pricing):
- **$$$$** — Premium frontier (Opus, GPT-4.5, Gemini Ultra): ~$15-75/M input tokens
- **$$$** — Standard frontier (Sonnet, GPT-4o, Gemini Pro): ~$2.50-10/M input tokens
- **$$** — Mid-tier (Haiku, GPT-4o-mini, Flash, Mistral Large): ~$0.25-1/M input tokens
- **$** — Budget / self-hosted (Llama, Mistral Small, DeepSeek): ~$0-0.50/M input tokens

---

## Claude (Anthropic)

### Family-wide patterns
- Prefers **XML tags** for prompt structure (`<instructions>`, `<context>`, `<document>`)
- Strong system prompt adherence — maintains constraints over long conversations
- Conservative error handling: **abstains rather than hallucinating** when uncertain
- Supports constrained decoding for structured output (GA since late 2025)
- Benefits from few-shot examples for complex output formats
- Prefill assistant responses to constrain output format
- Periodic instruction reinforcement helps in very long sessions

### Version-specific notes
- **Opus 4.6**: Strongest system prompt adherence. Best for orchestrator/planner roles. Handles 400K context reliably, degrades at 600K+. Finds subtle bugs other models miss. Cost tier: $$$$
- **Sonnet 4.5**: Lowest task drift across 20+ sequential steps. Drops to 18% accuracy at 1M tokens — unreliable for extreme-length contexts. Cost tier: $$$
- **Haiku 4.5**: Reliable for simple, well-defined tasks. Can miss subtleties Opus catches. Good as router/classifier. Cost tier: $$

### Known failure modes
- Over-conservative refusals on borderline tasks
- Without prefill or structured outputs, may wrap JSON in markdown code blocks
- Context rot at scale (Sonnet especially)

### Harness requirements
- Minimal explicit state management needed — maintains state well
- Tool definitions receive "prompt engineering-level attention" (Anthropic's own finding)
- Design tools to be "poka-yoke" (mistake-proof) — Claude's conservative behavior works with you

### Anti-patterns (things that work for other models but fail here)
- Markdown-structured prompts (works, but XML is measurably better)
- Aggressive retry-on-error loops (Claude will abstain — respect the abstention, don't force retries)

---

## GPT (OpenAI)

### Family-wide patterns
- Prefers **markdown** format (headers, bullets). GPT-4.1 also handles XML well.
- Strong native tool calling with parallel support and `strict: true` for schema enforcement
- Place critical instructions at **both beginning AND end** of system prompt
- Structure prompts: `# Role and Objective` / `# Instructions` / `# Output Format` / `# Examples`

### Version-specific notes
- **GPT-4o**: Prone to **sycophancy** — overrides system constraints to be "helpful." Highest hallucination rate when distractors present. Add explicit "do not deviate from system prompt" instructions. Cost tier: $$$
- **GPT-4.1**: Very **literal** — won't infer intent, requires explicit specification. Needs three mandatory reminders for agents: persistence ("keep going until resolved"), tool-calling ("do NOT guess"), planning ("think step by step"). These delivered ~20% improvement. Cost tier: $$$
- **GPT-4.1-nano**: **Bug**: duplicates tool calls when parallel calling enabled. Disable parallel for nano. Cost tier: $$
- **GPT-4o-mini**: Stops following instructions after a few turns in multi-turn conversations. System prompt drift. Cost tier: $$
- **GPT-3.5-turbo**: 40% structured output compliance without enforcement. Not suitable for agent systems. Cost tier: $

### Known failure modes
- Sycophancy (4o especially) — may override system prompt to please user
- Hallucination under distraction — generates confident but incorrect responses with noisy context
- Word count blindness — consistently violates length constraints
- Linear instruction decay — more instructions = proportionally lower per-instruction accuracy

### Harness requirements
- `strict: true` on all tool definitions in production (100% schema compliance)
- Must include "ask for missing information" escape hatch — without it, GPT hallucinates tool arguments
- Explicit planning instructions improve benchmarks ~4%
- External state tracking recommended for 4o (pushes through errors confidently)

### Anti-patterns
- Relying on implicit intent (GPT-4.1 won't infer — be explicit)
- XML tags on GPT-4o (wastes tokens, markdown is better; 4.1 handles both)
- Trusting 4o's error recovery (it hallucinates through errors)

---

## Gemini (Google)

### Family-wide patterns
- Supports both **markdown and XML** well
- Unique: can combine function calling with built-in tools (Google Search, Maps, code execution) in one call
- Context circulation preserves tool results across turns automatically
- Thinking mode with configurable thinking budget
- Best raw retrieval at extreme context lengths (99.7% at 1M)

### Version-specific notes
- **Gemini Pro (2.5/3)**: Best for "dump everything in context" approaches. **WARNING**: Multiple developers report destructive code edits — deleting unrelated code sections. Do not use for code editing without output validation. Cost tier: $$$
- **Gemini Flash (3)**: Handles 100+ tools simultaneously. 100% needle-in-haystack up to 2M tokens. Best for high-throughput multimodal processing. Cost tier: $$
- **Gemini Ultra**: Extended reasoning. Cost tier: $$$$

### Known failure modes
- Pro: destructive code edits (deletes unrelated sections)
- Random word generation in repetition tasks at 500-750 tokens
- Thought signature validation can cause 400 errors — must circulate signatures even at minimal thinking
- Greatest variability in long-context tasks among tested models

### Harness requirements
- Handle thought signature validation in multi-turn function calling
- Configure thinking budget explicitly
- Built-in Google Search grounding reduces need for RAG tool calling
- Unique `id` fields on every tool call — use for async execution tracking

### Anti-patterns
- Using Pro for code editing without validation (destructive edit risk)
- Ignoring context circulation (tool results don't auto-persist without it)

---

## Llama (Meta)

### Family-wide patterns
- Uses **special tokens** for tool calls (`<|python_tag|>`, `<|begin_of_text|>`)
- Requires external grammar constraints for reliable JSON (llama.cpp, vLLM, Outlines)
- Performance varies enormously by parameter count (8B vs 70B vs 405B)
- Keep system prompts short and focused — long guardrails "overwhelm working memory" on smaller models

### Version-specific notes
- **Llama 3.3 70B**: Native structured JSON with top-level "tool" key. Comparable to GPT-4o on tool calling. Cost tier: $ (self-hosted)
- **Llama 3.1 405B**: Strongest open-source option. Comparable to frontier models on most benchmarks. Cost tier: $$ (self-hosted)
- **Llama 3.1 8B**: Frequently produces malformed JSON in multi-turn. Gets stuck in loops listing capabilities. Cost tier: $ (self-hosted)
- **Llama 4 Maverick (400B)**: Unstable execution — defaults to parallel tool calls violating constraints, forgets paths, produces hallucinated placeholders. Cost tier: $$ (self-hosted)

### Known failure modes
- 8B: loops listing own capabilities instead of acting
- Forgets absolute paths after seeing working directory
- Placeholder hallucination: "Line 5 content" instead of actual data
- Cascading errors: recovery attempts introduce new mistakes
- Format inconsistency: correct answer in wrong format, or correct format with wrong answer

### Harness requirements
- External grammar constraints mandatory for JSON in production
- External state management essential (does not maintain state well)
- Cascading error detection — do not rely on self-correction
- 8B: limit tool count and system prompt length aggressively

### Anti-patterns
- Using 8B for complex agent scenarios (use 70B+)
- Relying on self-correction for error recovery
- Long system prompts on smaller models

---

## Mistral

### Family-wide patterns
- Standard **markdown** formatting works well
- Must **explicitly instruct** JSON output in prompt even when using JSON mode
- Standard JSON Schema for function calling arguments
- Optimized for fast "System 1" behavior — not tuned for extended deliberation

### Version-specific notes
- **Mistral Large 3**: Solid function calling. Not tuned for hundreds of tool calls or long agent chains. Cost tier: $$
- **Mistral Medium**: General purpose. Cost tier: $$
- **Mistral Small**: Structured output degrades on complex schemas. Cost tier: $

### Known failure modes
- Not agentic-tuned — not designed for extended multi-step workflows
- Limited self-correction compared to Claude or Command R+
- Not tuned for maximal truthfulness in autonomous workflows (SimpleQA weakness)

### Harness requirements
- Keep agent sessions short — not tuned for long chains
- External validation and retry logic needed
- Always include explicit "output JSON" instruction even with JSON mode enabled

### Anti-patterns
- Using for long multi-step agent orchestration (better as fast single-turn worker)
- Relying on implicit JSON mode (must be explicitly instructed)

---

## DeepSeek

### Family-wide patterns
- OpenAI-compatible API format
- R1 and V3 have fundamentally different use cases — do not conflate them

### Version-specific notes
- **DeepSeek R1**: Built-in chain-of-thought (`<think>` tags). **Avoid system prompts entirely** — put all instructions in user message. Zero-shot only — few-shot **degrades** performance. Temperature 0.5-0.7 (0.6 recommended). Not suitable for multi-step agent loops. Best for complex single-turn reasoning (math, logic, analysis). Cost tier: $
- **DeepSeek V3**: 81.5% on function calling benchmarks. **Critical bug**: when a tool returns an error, retries indefinitely wasting all turns. Best at single-turn multi-tool, worst at multi-turn. Cost tier: $
- **DeepSeek V3.1**: Major improvement — 92.2% accuracy (from V3's 58.5%). Proactively validates results. Post-training RL, not architecture, drives the improvement. Monitor for error-loop behavior inherited from V3. Cost tier: $

### Known failure modes
- R1: `<think>` tokens leak into structured output / JSON responses
- R1: infinite repetition without proper temperature setting
- V3: infinite retry loops on tool errors (critical — can exhaust budget)
- V3: limited Windows command training data
- V3: worst model tested at multi-turn function calling

### Harness requirements
- R1: force `<think>\n` prefix. No system prompt. No examples. Temperature 0.6.
- V3/V3.1: explicitly prompt schema inspection before tool use (raises accuracy from 52.9% to 87.5%)
- V3: implement hard turn limits and error-loop circuit breakers
- R1: not suitable as agent orchestrator — use V3.1 for agentic tasks

### Anti-patterns
- Using R1 for multi-step agent loops (use V3.1)
- Adding few-shot examples to R1 prompts (degrades performance)
- Using system prompts with R1 (put everything in user message)
- Using V3 without error-loop protection

---

## Command R+ (Cohere)

### Family-wide patterns
- Built-in **preamble + document** handling with automatic citation generation
- Strongest at multi-step tool use with self-correction
- JSON Schema mode for structured outputs
- `response_format: { type: "json_object" }` for valid JSON

### Version-specific notes
- **Command R+**: Outperforms GPT-4-turbo on multi-step tool benchmarks (ToolTalk Hard). Built-in citation generation from tool results. Cost tier: $$

### Known failure modes
- Without explicit "Generate a JSON" instruction, enters **infinite generation loop** exhausting context
- Structured outputs **not supported in RAG mode** — fundamental limitation for its core use case
- First schema request incurs processing latency overhead

### Harness requirements
- Always include explicit "Generate a JSON" instruction (even with JSON mode)
- Cannot combine structured outputs with RAG mode — choose one
- Leverage built-in multi-step tool use with self-correction
- Built-in citation generation reduces need for separate citation tools

### Anti-patterns
- Combining structured outputs with RAG mode (fundamentally incompatible)
- Omitting explicit JSON instruction (infinite loop risk)
