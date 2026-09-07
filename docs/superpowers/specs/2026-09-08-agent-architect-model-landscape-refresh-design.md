# Agent Architect Model Landscape Refresh — Design

**Date:** 2026-09-08
**Target version:** 0.8.0 (from 0.7.1)
**Status:** Approved

---

## Problem

`agent-architect/model-profiles.md` is stamped `Researched 2026-06-14`. Roughly three months of model releases have landed since, and the skill's model layer is now not merely incomplete but in places actively wrong.

### Verified gaps

| Provider | Skill currently says | Landscape as of 2026-09-08 |
|---|---|---|
| Anthropic | Opus 4.8 / 4.7 / 4.6, Sonnet 4.6, Haiku 4.5 | Opus 5 (GA 2026-07-24), Sonnet 5 (GA 2026-06-30), and a new Mythos-class tier: Fable 5, Fable 5.1 (2026-09-01), Mythos 5. Tool Search and Programmatic Tool Calling shipped. Memory for Managed Agents in public beta. |
| OpenAI | GPT-5.5 / 5.4 / Realtime-2; GPT-4o and GPT-4.1 as live legacy paths | GPT-6 Astra (2026-09-03) for computer use, browsing, software engineering, with Codex context preservation. GPT-5.3 Instant. o3 retired 2026-08-26; GPT-4.5 retired 2026-06-27. |
| Google | Gemini 3 Pro, Flash 3, Interactions API | Gemini 3.5 / 3.6 / 3.7 Flash, Gemini 3.5 Pro. Managed Agents API on Agent Platform. Agentic video processing. Gemini Robotics ER 2 (embodied reasoning). |
| Open weight | DeepSeek V3.2, Qwen3, Llama 4, Mistral Large 3, Command R+ | DeepSeek V4 / V4 Pro, Kimi K2.6 / K2.7 Code / K3, GLM-5.2, MiniMax M3, Qwen3-Coder-Next, Mistral Small 4, Gemma 4. Moonshot, Zhipu, and MiniMax have no profile at all. |
| Regional / sovereign | No category exists | Sarvam 105B / 30B (22 Indian languages, voice-first, India-hosted), Falcon H1 and Falcon 4, Jais 2, ALLaM, K2 Think V2, SEA-LION / Sailor2, HyperCLOVA X, Upstage. |
| MCP | 2025-11-25 specification | 2026-07-28 specification: stateless protocol core, multi-round-trip requests, header-based routing, cacheable list results, authorization hardening, formal extensions framework. |

Two facts are stated incorrectly rather than merely omitted:

1. `model-profiles.md` describes the DeepSeek legacy alias discontinuation of 2026-07-24 as a scheduled future event. That date has passed.
2. `references/multimodal-agents.md` and `checklists/multimodal-architecture.md` prescribe fixed frame-sampling and media-resolution budgets. Gemini's agentic video processing, where the model navigates video rather than consuming fixed-rate frames, supersedes that guidance for current Gemini models.

### The structural problem underneath

Staleness is the symptom. The cause is that perishable model facts live in two places:

- `model-profiles.md`, by design, governed by a documented precedence rule.
- Inside the checklists, by accident.

`checklists/model-awareness.md` hard-codes `GPT-4o: practical limit ~80-100K` (1.3), `GPT-4.1-nano with parallel tool calling enabled` (1.4), `deepseek-chat`, `deepseek-reasoner` (1.7), and `GPT-3.5` / `DeepSeek V3/V3.1` (1.2). Every one of those concerns a model that is now retired or superseded. Nothing tests those copies, so they rot silently while the profiles get refreshed around them.

The existing freshness test compounds this. `tests/source_links.test.mjs` asserts the literal string `Researched 2026-06-14`. That is a freshness *pin*, not a freshness *check*: it passes indefinitely and never signals that the underlying data aged out.

---

## Goals

1. Bring model data current to 2026-09-08, verified against primary provider documentation.
2. Add Sovereignty & Residency as a 12th audit dimension.
3. Convert the model layer into a genuine data layer, so the next refresh is a per-family file edit rather than a cross-checklist archaeology exercise.
4. Make both forms of rot — aged data and duplicated facts — mechanically detectable.

## Non-goals

- No runtime engine, provider SDK, or external dependency. The skill inspects agent systems; it must not become one.
- No benchmark scores in profiles. They rot faster than anything else and are rarely agent-relevant.
- No pricing tables beyond the existing coarse `$`–`$$$$` cost tiers.
- No unrelated refactoring of AUDIT / REVIEW / DESIGN mode flow.

---

## Design

### 1. Profiles split by family

`agent-architect/model-profiles.md` becomes a thin index containing only:

- The family table (family, files, tier, `researched_date`).
- The API-ID-to-family prefix mapping.
- The precedence rule and version-matching rule.
- Cost tier definitions.
- The staleness protocol.

Each family's substance moves to `agent-architect/model-profiles/<family>.md`, loaded only when Discovery detects that family. This applies the skill's own Pattern 23 (*Tool Loadout Beats Tool Hoarding*) to its own reference material: today Discovery loads all eight families to reason about one.

**Family inventory** (provisional — confirmed by the primary-source pass in Task 1):

| Tier | Files |
|---|---|
| Frontier hosted | `anthropic.md`, `openai.md`, `google.md` |
| Open weight | `deepseek.md`, `qwen.md`, `moonshot.md`, `zhipu.md`, `minimax.md`, `meta.md`, `mistral.md`, `cohere.md` |
| Regional / sovereign | `sarvam.md`, `falcon.md`, `regional-other.md` |

`moonshot.md` (Kimi), `zhipu.md` (GLM), `minimax.md`, `sarvam.md`, `falcon.md`, and `regional-other.md` are new.

`regional-other.md` groups Jais 2, ALLaM, K2 Think V2, SEA-LION / Sailor2, HyperCLOVA X, and Upstage. This deliberately breaks the one-file-per-family rule. The justification: these models share a residency-first evaluation shape, each has thin publicly documented agent-relevant runtime detail, and separate near-empty files would cost more to maintain than they return. Any model in this file that later acquires substantial documented agent semantics graduates to its own file.

**Profile fields.** Each family file retains the nine required fields from `references/model-runtime-contracts-2026-06.md` (API surface, reasoning state, tool semantics, modality support, context behavior, structured output path, known production failure modes, harness requirements, re-evaluate when) and gains two:

- **Deployment & residency** — hosting regions, sovereign-cloud availability, self-host path, and data-flow constraints. This is the evidence base for the new dimension.
- **Retired / migration targets** — models withdrawn or superseded, with their replacement. Auditing real codebases still surfaces `gpt-4o` and `o3`; "this model is retired, migrate to X" is among the highest-value findings the skill can produce, and it is only possible if retired IDs stay recorded somewhere.

Each family file carries frontmatter:

```yaml
---
family: <name>
tier: frontier | open-weight | regional
researched_date: YYYY-MM-DD
---
```

### 2. Sovereignty & Residency as the 12th dimension

A new conditional dimension, weight 1.0x, backed by `agent-architect/checklists/sovereignty-residency.md`.

It is conditional in exactly the way Memory Architecture and Multimodal Architecture already are: it scores N/A and drops out of the weighted average when Discovery finds no trigger. This keeps it from penalising single-region systems that have no residency requirement.

**Discovery step 2.10** detects:

- Regional model identifiers (`sarvam*`, `falcon*`, `jais*`, `allam*`, `sea-lion*`, `sailor*`, `hyperclova*`, `solar*`).
- Region configuration: `region=`, `ap-south`, `eu-west`, `me-central`, sovereign-cloud endpoints, Bedrock/Azure/Vertex region pinning.
- Compliance and residency markers: `DPDP`, `GDPR`, `data residency`, `on-prem`, `VPC endpoint`, `air-gapped`, `sovereign`.
- Self-hosted serving stacks (vLLM, SGLang, TGI, Ollama) bound to a declared region.

It emits a System Map line: `Residency: [declared region(s); inference host; egress boundary] / [absent]`.

Checklist coverage spans three severity passes: inference crossing a declared residency boundary; prompt, log, and trace egress evading the boundary the inference call respects; model choice legally incompatible with the deployment region; language and script coverage mismatched to the user population; code-switching unevaluated in multilingual deployments; and absent fallback when a sovereign endpoint is unavailable.

Cross-references rather than duplicates: `security.md` owns data-flow containment, `harness-architecture.md` owns runtime placement, `production-readiness.md` owns compliance gating. This dimension owns the residency contract itself.

### 3. Staleness protocol

Two layers, because maintainers and audit subjects need different signals.

**Test layer.** A test reads `researched_date` from each family file and compares against today. Past 90 days it emits a diagnostic warning via `t.diagnostic()`. Past 180 days it fails. The asymmetry is deliberate: a hard failure at 90 days would break the build for a contributor touching something unrelated, while silence until 180 lets data drift a full release cycle unnoticed.

**Runtime layer.** Discovery step 2.5 compares each detected family's `researched_date` against today. For a family older than 90 days, the skill routes into the **existing** Unknown Model Protocol (SKILL.md steps 2 through 5) to offer live WebSearch verification, and marks the family STALE in the System Map. Findings derived from a stale profile carry the confidence caveat that protocol already defines.

No new machinery. The Unknown Model Protocol already handles ask-research-cache-apply; this extends its trigger from "family absent" to "family absent or stale".

### 4. De-rot enforcement

The date check reports that data is old. It does nothing about facts being duplicated into checklists in the first place. That needs a separate guard.

A test greps `agent-architect/checklists/*.md` for model-version patterns — vendor-version strings (`gpt-4o`, `gpt-4.1`, `claude-opus-4`, `deepseek-chat`, `gemini-2.5`), and numeric context-limit claims (`~80-100K`, `beyond ~150K`) — and fails on any hit outside an explicit allowlist. The allowlist covers genuinely generic mentions: the Discovery grep term list in SKILL.md, and illustrative severity examples that name no specific version.

This is what makes the fix durable. With it in place, a perishable model fact structurally cannot re-enter a checklist; the only place it can live is a family profile, where the date check governs it.

`checklists/model-awareness.md` is rewritten accordingly: every hard-coded model fact is replaced by a pointer to the detected family profile. The checklist keeps its structure, precedence rule, dedup rule, and confidence calibration; it loses its embedded data.

### 5. Content changes driven by the research

These are corrections, not additions.

| File | Change |
|---|---|
| `checklists/model-awareness.md` | Strip hard-coded facts from 1.2, 1.3, 1.4, 1.7 and 2.1; replace with family-profile lookups. |
| `checklists/multimodal-architecture.md`, `references/multimodal-agents.md` | Fixed frame-sampling guidance becomes conditional on the model; add agentic video processing; add embodied/robotics as a modality; reclassify computer-use from exotic to mainstream. |
| `checklists/memory-architecture.md`, `references/memory-systems.md` | Add tool-based memory (memory operations exposed as callable tools invoked during the reasoning loop, rather than a fixed retrieval pre-step). Add file-backed managed-agent memory, including the cross-agent sharing trust boundary the current checklist has no finding for. |
| `checklists/tool-design.md`, `checklists/context-management.md` | Add Tool Search and Programmatic Tool Calling. Update MCP references to the 2026-07-28 specification: stateless core, cacheable list results, multi-round-trip requests. |
| `checklists/security.md` | MCP 2026-07-28 authorization hardening; the extensions framework as a new trust surface. |
| `checklists/harness-architecture.md` | Managed-agent runtimes (Google Agent Platform, Anthropic Managed Agents); Codex-style context preservation. |
| `references/model-runtime-contracts-2026-06.md` | Rename to `model-runtime-contracts.md`. A date in a filename is itself a rot vector; the date belongs in a dated section inside the document. |

**New cognitive patterns:**

- **28 — Residency Is an Architecture Constraint.** Where inference runs, where prompts and traces land, and which models are legally usable are design inputs, not deployment details discovered at launch.
- **29 — Memory as Tool Surface, Not Pre-Step.** Exposing memory operations as callable tools lets the agent decide when to recall; a fixed retrieval pre-step pays full cost on every turn regardless of need.

### 6. Sourcing discipline

The gap analysis above was assembled partly from aggregator sources. Those are adequate for knowing what to look for and inadequate for a reference document.

Task 1 of the implementation plan re-verifies every family against primary provider documentation before any profile is written. The family inventory in this design is provisional until that pass completes; families that cannot be verified against primary sources are dropped rather than written from secondary reporting.

The existing repo convention of at least six cited links per reference document extends to at least three primary links per family file.

---

## Testing

`tests/agent_architect_contract.test.mjs` and `tests/source_links.test.mjs` are extended, and a new `tests/model_profiles.test.mjs` is added.

| Test | Asserts |
|---|---|
| Version alignment | `package.json` and `SKILL.md` both read 0.8.0. |
| Dimension consistency | SKILL.md advertises and reports 12 dimensions, including `Sovereignty & Residency`. |
| Linked-file existence | Every checklist and reference path named in SKILL.md exists. |
| Index integrity | Every family in the index has a file; every file appears in the index; every API-ID mapping resolves to a real family. |
| Required fields | Every family file carries the eleven required field headings and valid frontmatter. |
| Staleness | Warns past 90 days, fails past 180, per family file. |
| Source links | At least three primary-provider links per family file; existing per-reference-doc thresholds retained. |
| De-rot grep guard | No model-version string in any checklist outside the allowlist. |
| Discovery fields | System Map includes the new `Residency:` line alongside existing fields. |

Tests are written before the content changes, following the precedent set by the 0.7.0 plan.

---

## Migration and versioning

Version 0.8.0. New dimension and new file layout, no capability removed.

Trend comparison across the 11-to-12 dimension boundary: prior evaluation records have no Sovereignty & Residency row. The trend table renders it as `—` for sessions predating 0.8.0 rather than treating the absence as a regression. Cached evaluations from 0.7.x are invalidated by the version change, which the existing cache-invalidation logic already handles on skill version bump.

`model-profiles.md` retains its path, so any external reference to it continues to resolve — it changes from a monolith to an index.

---

## Open risks

1. **Primary-source verification may contradict this design's family list.** Mitigated by making Task 1 a gate: the inventory is provisional and the plan expects it to change.
2. **Regional model documentation is uneven.** Some sovereign models publish little agent-relevant runtime detail. Where a profile cannot meet the three-primary-link bar, it is recorded in `regional-other.md` with an explicit evidence caveat rather than being padded out.
3. **The grep guard may produce false positives.** Mitigated by the explicit allowlist and by tuning the pattern set during Task 1, before the checklists are rewritten.
