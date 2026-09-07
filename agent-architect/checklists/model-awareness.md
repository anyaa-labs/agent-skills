# Model Awareness Checklist

## Instructions

Apply this checklist against agent systems where the target model(s) are known or detectable. Read `model-profiles.md` first to load the relevant model profile(s). Be specific — cite the model, the file:line, and the mismatch.

**This checklist requires model detection from Phase 0.** If no models were detected, skip this checklist and note: "N/A — no models detected in codebase."

## Precedence Rule

When a finding from this checklist contradicts a finding from another checklist, the model-specific finding takes precedence. Suppress the generic finding and replace it with the model-aware one.

**Examples of precedence overrides:**
- A family profile's `### Known production failure modes` (or version-specific notes) states that a documented model behavior contradicts a generic checklist item — e.g. the profile says few-shot examples measurably degrade this model's output → generic finding "no few-shot examples" (`prompt-architecture.md 2.5`) → **suppress**, report: "Few-shot correctly omitted — the [family] profile documents that examples degrade this model's performance."
- A family profile documents that a model is intended for single-turn use only, with no agentic tool loop → generic finding "no stop conditions" (`prompt-architecture.md 1.2`) → **downgrade to Minor**, note: "Stop conditions less critical — profile documents single-turn-only usage for this model."

Note: the 8K token threshold (prompt-architecture 1.4) is about prompt *quality* and instruction dilution, NOT about whether the prompt fits in the context window. A bloated 15K prompt is still a quality problem even on a model with a very large context window. Do NOT suppress prompt-architecture 1.4 based on context window size.
- `prompt-architecture.md 1.2` flags "no stop conditions" → this is model-independent → **no override**, finding stands.

**Rule of thumb:** Override generic findings only when the model profile provides specific, contradictory guidance. If the model profile is silent on a topic, the generic checklist applies.

**Multi-model artifacts:** When a single prompt/artifact serves multiple models (e.g., Claude primary + GPT fallback), evaluate against the **primary model** — the one that handles the majority of traffic. Report secondary model incompatibilities as separate findings with reduced severity (IMPORTANT, not CRITICAL), noting: "This prompt is optimized for [primary model]. When falling back to [secondary model], [specific issue] will occur. Consider model-specific prompt variants for the fallback path."

## Dedup Rule

Do NOT report findings that duplicate items already covered in other checklists:
- "No model fallback" → already in `production-readiness.md 2.5`
- "No cross-model eval" → already in `eval-infrastructure.md 3.3`
- "No cost controls" → already in `production-readiness.md 1.5`

If you find a model-specific angle on these (e.g., "fallback model is incompatible — switching from the primary model's family to the fallback family would break the primary model's documented prompt format"), report the model-specific angle as an enhancement to the existing finding, not as a separate finding.

## Pass 1 — Critical

These cause production failures or fundamentally broken agent behavior due to model mismatch.

### 1.1 Prompt Format Mismatched to Model
The prompt structure does not match the model's documented preference, causing measurable quality degradation.

**What to look for:** Read the detected family's profile (`agent-architect/model-profiles/<family>.md`, found via the index at `agent-architect/model-profiles.md`) and compare its documented prompt-format preference — system-vs-user-message placement, few-shot vs. zero-shot, special token formatting, XML vs. markdown structuring — against the artifact. Report the mismatch, citing the profile's own wording as evidence. If the profile is silent on prompt format, this finding does not apply.

**Suppression:** Do not flag format mismatch if the system uses constrained decoding or strict mode that compensates. Do not flag minor preference differences (e.g., markdown with Claude works fine, just not optimal — that is suboptimal, not broken).

### 1.2 No Structured Output Enforcement
The model supports constrained decoding or strict schema mode, but the system does not enable it. Enforcement gaps range from a mild accuracy hit to unacceptable schema-compliance rates in production agent systems, depending on the family.

**What to look for:** Consult the detected family profile's `### Structured output path` section for the documented enforcement mechanism (strict schema, JSON mode, constrained decoding, external grammar, or required prompt instruction). Flag when the profile documents a mechanism the code does not use — for example, a family whose profile requires an explicit "output JSON" instruction even with JSON mode enabled, or one that needs external grammar constraints (llama.cpp, vLLM, Outlines) because no native structured-output mode exists. If the profile documents no structured-output path at all for the detected model, this finding does not apply.

### 1.3 Context Window Exceeded (Effective Range, Not Raw)
The system pushes more tokens into context than the model can reliably process. The effective range is often much smaller than the advertised window.

**What to look for:** Cross-reference the estimated context size (from the context-management checklist) against the detected family profile's `### Context behavior` section, which documents the raw window alongside any known practical-reliability risk below the advertised ceiling. Do not reason from the advertised context-window number alone.

**Suppression:** If the system uses context management strategies (chunking, summarization, retrieval with relevance thresholds), do not flag even if raw token counts are high.

### 1.4 Known Model Failure Mode Unmitigated
The system uses a model with a documented critical failure mode, and no mitigation is present.

**What to look for:** Consult the detected family profile's `### Known production failure modes` section. Flag any listed failure mode that has no corresponding mitigation in the harness (circuit breakers on retry loops, output validation before destructive actions, guardrail instructions, restrictions on parallel tool calls, mode-incompatibility checks, etc.). If the profile lists no failure modes for the detected version, this finding does not apply.

### 1.5 Reasoning State Not Preserved Across Tool Turns
The model/API requires reasoning items, thinking blocks, encrypted reasoning content, or thought signatures to be preserved across tool turns, but the harness drops them. The next turn loses planning state or returns provider errors.

**What to look for:** Responses reasoning items omitted after tool calls; encrypted reasoning content not replayed in stateless/ZDR mode; Claude thinking blocks discarded; Gemini thought signatures or function-call IDs missing from manually constructed history.

### 1.6 API Surface Mismatched to Agent Runtime
The application uses a basic chat/content endpoint for a workflow that requires server-managed state, background execution, typed trace steps, sandbox state, realtime sessions, or SDK-owned orchestration.

**What to look for:** Long-running file/code agents implemented as stateless chat calls; realtime voice implemented through non-realtime text APIs; Gemini agent workflows on `generateContent` when Interactions API state is needed; OpenAI reasoning agents using legacy Chat Completions when Responses/Agents SDK is required for the runtime contract.

### 1.7 Model Alias or Deprecated ID in Production
The production config uses a legacy alias, preview ID, or scheduled-deprecation model name without a migration gate or eval baseline.

**What to look for:** Consult the detected family profile's `### Retired / migration targets` section. If the production model ID matches a retired or scheduled-deprecation entry, flag it as CRITICAL and cite the profile's named replacement and, where documented, the shutdown date — Tasks across this skill's model-profile refresh keep these tables verified and dated, so this finding can now name a concrete migration target with a source. Also flag provider aliases like "latest" in production config, or model strings not pinned by environment-specific rollout policy.

Some families' `### Retired / migration targets` section documents a confirmed absence of a vendor deprecation page, or a migration window without verified per-model dates, rather than a populated table. When that is the case the profile says so explicitly — do not fabricate a retirement date to fill the gap. Report the finding using only what the profile states, or note that retirement status could not be confirmed from vendor sources and recommend the auditee verify directly.

## Pass 2 — Important

These degrade quality or increase risk but may not cause outright failures.

### 2.1 Wrong Model for the Role
The model is being used for a role it is poorly suited for, based on documented strengths and weaknesses.

**What to look for:** Consult the detected family profile's current models or version-specific notes section for per-model facts and cost information. Cost may be indicated via per-model tier annotations (where present) or the family profile's frontmatter tier field (if annotations are absent). Flag when a model documented as premium/frontier tier is used for high-volume worker tasks it wasn't designed for and a cheaper tier in the profile would serve; when a model whose profile flags it as unsuited for multi-step agentic orchestration is used as an orchestrator; or when a model documented as a small/budget tier is used as the primary agent in complex, multi-step scenarios its profile flags as out of scope.

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

**What to look for:** Compare the detected model's cost tier and documented strengths (from the family profile's current models or version-specific notes section) against the role it fills. Cost may be indicated via per-model tier annotations (where present) or the family profile's frontmatter tier field (if annotations are absent). Look for a cheaper tier in the same family that the profile suggests would suffice, a newer version in the profile documented as better suited to the specific task pattern than the one deployed, or the absence of a router/classifier model to keep simple requests off an expensive tier.

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
- **Stale profile:** If the family profile's `researched_date` is more than 90 days
  old, cap confidence at 6 and append: "Based on a profile last verified [date];
  provider behavior may have changed." Offer live verification via the Unknown
  Model Protocol.
