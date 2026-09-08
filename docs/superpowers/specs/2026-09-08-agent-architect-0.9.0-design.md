# agent-architect 0.9.0 — Agent Identity, and correcting what the evidence now contradicts

**Status:** approved (scope: "everything", same branch as PR #14)
**Input:** `agent-architect/references/agent-engineering-landscape-2026-09.md` — 113 primary sources, five sweeps, 2026-06-08..2026-09-08.

## Goal

Two things, in priority order.

1. **Correct the four places the skill's current guidance is contradicted by evidence.** This is first because it is the only category where the skill would actively mislead an auditor today. Everything else is additive.
2. **Add Agent Identity & Authorization as the 13th dimension**, plus the cognitive patterns and checklist findings the sweep surfaced.

## Global constraints

- **The reference file governs.** `agent-engineering-landscape-2026-09.md` is the source of truth for every claim. Where this spec's prose and that file disagree, the file wins. (The 0.8.0 pass shipped three wrong facts because plan prose was trusted over researched sources; this constraint is the fix, carried forward.)
- **Respect the strength labels.** A `single-result` finding may not be written as a confident audit claim. Findings must carry their scope conditions where those conditions change the advice.
- **The de-rot guard still applies.** No model-version strings, context-window numbers, or dated perishable facts in `checklists/`. Those belong in `model-profiles/<family>.md`.
- **Conditional dimensions score N/A** and drop out of the weighted average — the established precedent (Memory, Multimodal, Sovereignty).
- Node built-in test runner only. Zero dependencies.
- Version → 0.9.0 in `package.json`, `SKILL.md`, and `tests/agent_architect_contract.test.mjs` (three places; 0.8.1 missed one and shipped red).

## Part 1 — Corrections (highest priority)

Each is a place current guidance is now wrong, not merely incomplete.

### 1.1 Step-count vs context-length degradation
**Evidence:** strong — arXiv:2609.01660, 9 models, 10,664 trajectories. Bounding the context window made decay *steeper* (logit slope -0.69 vs -0.44, p=3e-6), the opposite of a "lost in the middle" prediction.
**Change:** `context-management.md` and Pattern 3 (Context is Calories) must require *attributing* long-horizon degradation before prescribing a context fix. Recommending context reduction for step-count-driven decay is now a known-wrong recommendation.

### 1.2 Approval gates are not controls
**Evidence:** Anthropic's own telemetry — 97% of individual tool prompts approved vs 61% of plan proposals.
**Change:** any checklist item that treats a human approval gate as mitigation must require evidence that approvals actually discriminate. Absent that evidence, an approval gate is not a control.

### 1.3 Aggregate monitor/judge accuracy is a false average
**Evidence:** strong — arXiv:2608.00583 (CoT monitor 95% -> 11% on the CoT-only subset, cross-model, cross-monitor-family); arXiv:2609.02942 (rubric-only classifiers predict judge scores without seeing the response).
**Change:** `eval-infrastructure.md` and Pattern 12 (The Evaluation Asymmetry) must ask for accuracy **on the subset where the signal is the only defence**, and add the rubric-ablation and criterion-reversal probes.

### 1.4 Mid-trajectory confidence does not predict failure
**Evidence:** suggestive — arXiv:2608.29685, AUROC <=0.60 at 50% progress vs 0.85 at completion; mechanism is "path switching".
**Change:** `production-readiness.md` / Pattern 15 (The Recovery Ladder) must flag recovery triggers keyed on mid-run confidence, scoped to the deep-research task class the finding was measured on.

## Part 2 — The 13th dimension: Agent Identity & Authorization

**Why a dimension and not a checklist item:** four vendors converged on this independently inside one quarter (Microsoft Entra Agent ID's autonomous vs on-behalf-of split with sponsor lifecycle; OpenAI mTLS/X.509 workload identity GA; A2A v1.0 signed Agent Cards), and the strongest security result in the sweep is about it (arXiv:2609.00267 — LangGraph, CrewAI and AutoGen provide no built-in confinement against a prompt-injected sub-agent; a broker confined a compromised sub-agent to 1.5 reachable actions vs all 8,100 under bearer delegation). It currently falls between Agent Security (injection, trust boundaries) and Production Readiness (credentials as config), and neither claims it.

- **File:** `agent-architect/checklists/agent-identity.md`
- **Weight:** 1.0x
- **Conditional.** Applies when Discovery detects any of: agent-held credentials, sub-agent or tool-call delegation, remote agents over MCP or A2A, or a hosted agent-identity platform. Scores N/A only for a system with no delegated authority at all.
- **Headline Pass 1 finding:** authorization decided *inside the model* — an agent holding a broad bearer credential and being trusted not to misuse it — rather than by an external broker that can refuse. That is the configuration the paper shows fails all four threat classes.
- Also covers: auth mode provisioned vs assumed (autonomous vs on-behalf-of mismatch with runtime behaviour); orphaned agent identities with no live sponsor; third-party agents outside the identity plane; unsigned A2A Agent Cards trusted for capability claims; long-lived bearer keys where workload identity is available.

## Part 3 — New cognitive patterns

Proposed, each traceable to a labelled finding. Final numbering assigned during implementation; the count must be asserted by the existing contract test.

| Pattern | Source | Strength |
|---|---|---|
| The Autonomy Rung | loop taxonomy; arXiv:2608.21884 | term contested; taxonomy sound |
| Escalation Is a Tool, Not a Failure | arXiv:2608.29460 (OR=9.2, p<1e-12) | strong |
| Aggregate Accuracy Is a False Average | arXiv:2608.00583 | strong |
| The Rubber Stamp | Anthropic 97%/61% telemetry | vendor telemetry |
| Summary Collapse | arXiv:2608.29028 | suggestive-strong |
| No Referee by Default | Anthropic FRT; arXiv:2609.00267 | strong |
| Phantom Guardrail | arXiv:2607.13083 | suggestive |
| Identity Is Provisioned, Not Assumed | Entra Agent ID; OpenAI mTLS; A2A | vendor docs |
| Transactional Authority | x402 / agent spending | emerging |

**Judgment call, flagged:** "The Autonomy Rung" is included even though the term *loop engineering* has no verifiable coiner and is openly contested by its own popularizer (Osmani walks the autonomy back on 2026-08-14). The pattern is framed around the **auditable rung and stop condition**, not around the contested term. The skill must not assert a coiner.

## Part 4 — Checklist findings and model facts

**Checklists.** multi-agent: framework confinement, covert channels through writable shared surfaces, correlated failure among homogeneous agents, summary collapse. tool-design/security: MCP deployment base rates (91.8% of internet-facing servers lack OAuth; scanner true-positive rate under 50%; 41.6% churn within 3 days, so point-in-time MCP review is stale immediately), and A2A-vs-MCP layer confusion. harness-architecture: escalation channel, phantom guardrail, loop rung, checkpoint/restore as a recovery rung. memory: write-time similarity audits are exactly what memory-poisoning attacks are tuned to pass.

**Model facts** (profiles, not checklists). Already committed: Anthropic `inference_geo`, OpenAI per-request regional processing, Assistants API shutdown. Remaining: OpenAI Agents SDK before v0.22.0 leaking guardrail-blocked tool output into replay/persisted state and the silent default-model change in v0.20.0; mTLS/X.509 GA; spend-limit 429s being terminal rather than retryable, and the `slow_down` vs `server_is_overloaded` split; Anthropic memory-tool path traversal being the implementer's responsibility and the 2026-08-31 thinking-block replay cutover; Gemini Interactions API GA as the default agent interface; Grok 4.6 `xhigh`.

## Out of scope

Molmo/OLMoASR, Reka and Phi remain unprofiled per the 0.8.0 sweep's recorded decisions. No new model families. No restructuring of the profile layer.

## Testing

Extend `tests/agent_architect_contract.test.mjs` to 13 dimensions and the new pattern count; both are already asserted, so both fail until updated. Add the new checklist to the link-existence test. The de-rot guard must stay green with no new allow-markers — if a new finding needs a model fact, the fact belongs in a profile.
