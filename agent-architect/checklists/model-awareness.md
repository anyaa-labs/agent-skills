# Model Awareness Checklist

## Instructions

Apply this checklist against agent systems where the target model(s) are known or detectable. Read `model-profiles.md` first to load the relevant model profile(s). Be specific — cite the model, the file:line, and the mismatch.

**This checklist requires model detection from Phase 0.** If no models were detected, skip this checklist and note: "N/A — no models detected in codebase."

## Precedence Rule

When a finding from this checklist contradicts a finding from another checklist, the model-specific finding takes precedence. Suppress the generic finding and replace it with the model-aware one.

**Examples of precedence overrides:**
- `prompt-architecture.md 2.5` flags "no few-shot examples" → but DeepSeek R1 profile says few-shot degrades performance → **suppress 2.5**, report: "Few-shot correctly omitted — R1 performance degrades with examples."
- `prompt-architecture.md 1.2` flags "no stop conditions" → but DeepSeek R1 is used only for single-turn reasoning (no agentic loops) → **downgrade to Minor**, note: "Stop conditions less critical for single-turn R1 usage."

Note: the 8K token threshold (prompt-architecture 1.4) is about prompt *quality* and instruction dilution, NOT about whether the prompt fits in the context window. A bloated 15K prompt is still a quality problem even on Gemini Flash with 1M context. Do NOT suppress prompt-architecture 1.4 based on context window size.
- `prompt-architecture.md 1.2` flags "no stop conditions" → this is model-independent → **no override**, finding stands.

**Rule of thumb:** Override generic findings only when the model profile provides specific, contradictory guidance. If the model profile is silent on a topic, the generic checklist applies.

**Multi-model artifacts:** When a single prompt/artifact serves multiple models (e.g., Claude primary + GPT fallback), evaluate against the **primary model** — the one that handles the majority of traffic. Report secondary model incompatibilities as separate findings with reduced severity (IMPORTANT, not CRITICAL), noting: "This prompt is optimized for [primary model]. When falling back to [secondary model], [specific issue] will occur. Consider model-specific prompt variants for the fallback path."

## Dedup Rule

Do NOT report findings that duplicate items already covered in other checklists:
- "No model fallback" → already in `production-readiness.md 2.5`
- "No cross-model eval" → already in `eval-infrastructure.md 3.3`
- "No cost controls" → already in `production-readiness.md 1.5`

If you find a model-specific angle on these (e.g., "fallback model is incompatible — switching from Claude to DeepSeek R1 would break the XML-tagged prompts"), report the model-specific angle as an enhancement to the existing finding, not as a separate finding.

## Pass 1 — Critical

These cause production failures or fundamentally broken agent behavior due to model mismatch.

### 1.1 Prompt Format Mismatched to Model
The prompt structure does not match the model's documented preference, causing measurable quality degradation.

**What to look for:**
- XML-tagged prompts sent to GPT-4o (wastes tokens — use markdown)
- Markdown-structured prompts sent to Claude (works but XML is measurably better)
- System prompt present for DeepSeek R1 (should be in user message — system prompts degrade R1)
- Few-shot examples given to DeepSeek R1 (degrades performance — use zero-shot)
- Missing special token formatting for Llama models

**Suppression:** Do not flag format mismatch if the system uses constrained decoding or strict mode that compensates. Do not flag minor preference differences (e.g., markdown with Claude is suboptimal, not broken).

### 1.2 No Structured Output Enforcement
The model supports constrained decoding or strict schema mode, but the system does not enable it. Without enforcement, schema compliance ranges from 40% (GPT-3.5) to ~98% (Claude) — unacceptable for production agent systems.

**What to look for:**
- GPT models without `strict: true` on tool definitions
- Claude without constrained decoding or structured output enforcement (tool use with schema, `response_format`, or XML prefill/template strategies)
- Gemini without `response_schema` or structured output mode enabled
- DeepSeek V3/V3.1 without explicit schema inspection prompts (raises accuracy from ~53% to ~88%)
- Llama without external grammar constraints (llama.cpp, vLLM, Outlines)
- Mistral without explicit "output JSON" instruction in prompt (required even with JSON mode)
- Command R+ without explicit "Generate a JSON" instruction (infinite loop risk)

### 1.3 Context Window Exceeded (Effective Range, Not Raw)
The system pushes more tokens into context than the model can reliably process. The effective range is often much smaller than the advertised window.

**What to look for:** Cross-reference the estimated context size (from context-management checklist) against the model profile's effective range. Key thresholds:
- Claude Sonnet: unreliable beyond ~150K
- GPT-4o: practical limit ~80-100K
- Llama 3.1: practical limit ~80K
- Gemini Flash: reliable to 1M+ (rarely an issue)

**Suppression:** If the system uses context management strategies (chunking, summarization, retrieval with relevance thresholds), do not flag even if raw token counts are high.

### 1.4 Known Model Failure Mode Unmitigated
The system uses a model with a documented critical failure mode, and no mitigation is present.

**What to look for:**
- DeepSeek V3 without error-loop circuit breaker / max turn limits (infinite retry on tool errors)
- GPT-4o without sycophancy guardrails in system prompt (overrides constraints to be "helpful")
- GPT-4.1-nano with parallel tool calling enabled (duplicates calls)
- Gemini Pro used for code editing without output validation (destructive edits)
- Llama 8B in complex agent scenarios (loops, path forgetting, cascading errors)
- Command R+ structured outputs combined with RAG mode (fundamentally incompatible)

## Pass 2 — Important

These degrade quality or increase risk but may not cause outright failures.

### 2.1 Wrong Model for the Role
The model is being used for a role it is poorly suited for, based on documented strengths and weaknesses.

**What to look for:**
- DeepSeek R1 as agent orchestrator (not designed for multi-step — use V3.1)
- Opus/GPT-4.5 for bulk processing worker tasks (cost-prohibitive — use Haiku/Flash/mini)
- Mistral Large for extended multi-step agent chains (optimized for fast single-turn)
- GPT-3.5-turbo in any agent system (40% structured output compliance)
- Llama 8B as primary agent (use 70B+ for complex scenarios)

**Suppression:** If cost or latency constraints justify the choice and the user is aware of the tradeoff, note it but do not flag as a finding.

### 2.2 Harness Patterns That Expire on Model Upgrade
Agent harness components (output parsers, retry loops, chain-of-thought scaffolding, prompt format workarounds) are model-version-specific but not marked for re-evaluation.

**What to look for:** Components that compensate for model weaknesses that may be fixed in newer versions. These should be marked with `# RE-EVALUATE ON MODEL UPGRADE` or equivalent.

**Examples:**
- Custom JSON repair logic (may be unnecessary with strict mode)
- Explicit CoT prompting for models that now have native reasoning
- Tool-call retry loops for models that have improved tool reliability
- Prompt reinforcement patterns for models that now maintain instructions better

## Pass 3 — Minor

### 3.1 Suboptimal Model Selection
A cheaper, faster, or more capable model could handle this role without tradeoffs. Not wrong, just leaving value on the table.

**What to look for:** Refer to the model selection matrix in the model profiles. Common examples:
- Using Opus where Sonnet would suffice (cost reduction)
- Using GPT-4o where GPT-4.1 is better for the specific task pattern
- Not using a router/classifier model to avoid sending simple requests to expensive models

## Suppressions — DO NOT flag

- Systems that use a single model and are explicitly prototyping (model choice is deferred).
- Model mismatches in test/eval code (using a cheaper model for testing is fine).
- Systems where the model is configurable and the user can switch (flag if the default is wrong, not if the option exists).
- Format preferences that are suboptimal but not broken (e.g., markdown with Claude works fine, just not optimal).

## Confidence Calibration

- **9-10:** You read the code, identified the model, and found a specific mismatch documented in the model profile. Concrete evidence.
- **7-8:** Model is detected and the pattern matches a known anti-pattern from the profile. Very likely correct.
- **5-6:** Model family is detected but exact version is unclear. Applying family defaults. Flag with caveat: "Applying [family] profile — exact version may differ."
- **3-4:** Model is inferred from SDK imports or API URLs, not from explicit model strings. Appendix only.
