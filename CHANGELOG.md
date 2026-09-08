# Changelog

## [0.8.0] — 2026-09-08

### Added
- **Sovereignty & Residency** as the 12th audit dimension (weight 1.0x, conditionally applied when Discovery detects a regional model, a data-residency obligation, or a deployment region constraint). Backed by `checklists/sovereignty-residency.md` and Discovery step 2.10, it checks whether residency claims are enforced in code rather than convention, whether logging/tracing/eval pipelines honor the same boundary as inference, whether model choice is legally valid for the deployment, and whether an in-boundary fallback exists.
- **Pattern 28: Residency Is an Architecture Constraint** and **Pattern 29: Memory as Tool Surface, Not Pre-Step** — bringing the cognitive pattern count to 29.
- `agent-architect/model-profiles/` — model facts split out of the single `model-profiles.md` file into 20 per-family profiles (Anthropic, OpenAI, Google, xAI, Amazon Nova, DeepSeek, Qwen, Moonshot, Zhipu, MiniMax, Meta, Mistral, Cohere, IBM Granite, AI21, Nvidia Nemotron, Ai2 OLMo, Sarvam, Falcon, and a Regional-other file), behind a thin index that maps API ID prefixes to the right file. IBM Granite was added beyond the original set on the research pass's own recommendation. Every family file carries a `researched_date`, an 11-heading contract (including two new sections, `### Deployment & residency` and `### Retired / migration targets`), and at least 3 primary-provider citations.
- **xAI/Grok, Amazon Nova, AI21 Jamba, Nvidia Nemotron and Ai2 OLMo profiles, closing a family-inventory gap.** The refresh's reconciliation pass was scoped to VERIFY / DROP / MERGE over the families the design doc had already named, so nothing ever asked which families were missing from that list — and **xAI shipped omitted entirely**: no profile, no index row, no API-ID mapping, and no Discovery grep term, so the skill could not detect Grok at all despite Grok 4.6 being positioned for long-running agents. A corrective absentee sweep added five families and recorded an explicit ADD/SKIP decision for every candidate it considered. **Reka AI and Microsoft Phi were evaluated and deliberately SKIPPED** — Reka publishes no context window for any hosted model and supports function calling on one model only, which would leave five of the eleven required headings reading "not publicly documented"; both decisions and their reconsider-when triggers are recorded in `references/model-landscape-2026-09.md` so they are not re-litigated. The reference brief also now carries a process fix: any future refresh must run an absentee pass before the VERIFY/DROP/MERGE pass.
- A two-layer staleness protocol: `tests/model_profiles.test.mjs` warns when a family's `researched_date` is over 90 days old and fails the suite past 180, and the skill's own Unknown Model Protocol now routes any STALE family into live web-research re-verification before giving model-specific advice.
- `tests/no_hardcoded_models.test.mjs` — a grep guard over `agent-architect/checklists/`. It carries one model-version pattern per shipped family (all 20, plus the folded-in `gpt-oss` and Gemma lines), a context-window pattern that fires when a token count is asserted next to context/window vocabulary, and a dated-fact pattern that fires when an ISO date is attached to a perishability claim ("verified as of", "announced", "deprecated", "shut down"). It is a pattern guard, not a proof of absence: generic prompt-size thresholds ("prompt exceeds 8K tokens", "<2K token prompts") and illustrative dates inside memory-validity examples are deliberately allowed through, and a model fact phrased outside these shapes can still slip by. A line that genuinely needs a version string opts out with `<!-- model-ref-ok: reason -->`. Together with the per-family files, model facts now have one home and the common routes by which a perishable fact re-enters a checklist are closed mechanically. Profile age is guarded separately, by `tests/model_profiles.test.mjs`, so an aged profile can no longer pass silently either.
- Cross-cutting additions: model-conditional frame-sampling guidance for multimodal agents, an embodied/robotics modality entry, a Pass 1 cross-agent memory trust-boundary finding, tool-exposed memory (store/recall/update/discard as callable tools rather than a fixed pre-turn retrieval step), and MCP capability findings covering the stateless core, multi-round-trip requests, and cacheable list results.

### Changed
- `checklists/model-awareness.md` de-rotted: 23 hard-coded model facts removed. Findings now read the detected family's profile instead of a fact frozen at write time.
- `references/model-runtime-contracts-2026-06.md` renamed to `model-runtime-contracts.md` — the filename no longer bakes in a research date that the file itself now tracks via `researched_date`.
- Frontmatter description: "11-dimension scoring" → "12-dimension scoring", "26 cognitive patterns" → "29 cognitive patterns". Added a clause naming the Sovereignty & Residency dimension alongside Memory/Harness/Multimodal, and added "which model should I use" and "is my agent compliant with data residency" to the invocation triggers.
- README updated for the 12-dimension audit and a new section describing where model data lives and how the staleness protocol keeps it current.

### Fixed
- `model-profiles.md` described the DeepSeek legacy-alias (`deepseek-chat` / `deepseek-reasoner`) discontinuation as a **scheduled future event**, even though the retirement date had already passed by the time of the prior research pass. Anyone who audited a DeepSeek integration against that guidance was told a live risk was merely upcoming. The per-family DeepSeek profile now states the retirement as fact and documents the alias-to-ID replacement table.
- The multimodal guidance prescribed a single fixed frame-sampling budget as if it applied to every video-capable model. It does not: models with agentic video navigation (retrieving frames/transcripts on demand during reasoning) have no frame-rate budget to set at design time — the correct budget is a navigation-step limit, the video analogue of a tool-call budget. Applying the old fixed-budget guidance to such a model either starves it of frames it would have fetched itself or defeats the purpose of navigation. The guidance is now model-conditional and says so explicitly rather than defaulting to fixed sampling.

## [0.7.1] — 2026-07-08

### Added
- **Pattern 27: The Invariant/Judgment Boundary** — split every check by who can decide it: invariants (decidable from known values by a rulebook) belong in deterministic code; semantic judgments (require understanding what free text/intent means) belong to the model. Names the most seductive agent-engineering failure — patching deterministic code to compensate for a weak prompt (a dedup/equivalence/classification heuristic in the service because the agent emitted duplicates or misclassified) — and directs the fix to the model layer. Generalizes Pattern 18 (Reconcile-on-Write) beyond memory.

## [0.7.0] — 2026-06-14

### Added
- **Harness Architecture** as the 10th audit dimension (weight 1.5x, always applied), covering runtime API contracts, execution-loop ownership, tool governance, MCP boundaries, sandboxing, tracing, and deployment lifecycle.
- **Multimodal Architecture** as the 11th audit dimension (weight 1.0x, conditionally applied when Discovery detects voice, image, video, screen, or live-media surfaces), covering modality routing, media safety, latency budgets, observability, and fallback UX.
- `references/harness-engineering.md`, `references/multimodal-agents.md`, and `references/model-runtime-contracts-2026-06.md` as source-backed reference briefs for modern production agent systems.
- Contract tests for package/SKILL version alignment, audit-dimension consistency, source-link coverage, runtime discovery fields, and model-profile provenance.
- Cognitive patterns 21-26: Model Runtime Contract, Brain/Hands Boundary, Tool Loadout Beats Tool Hoarding, Trace Is the Unit of Evaluation, Modality Is an Attack Surface, and State Has an Owner.

### Changed
- Refreshed `model-profiles.md` around current runtime contracts, including OpenAI Responses/Agents, Anthropic Claude 4, Gemini 2.5, Llama 4, Mistral Medium 3, DeepSeek R1, and Cohere Command A.
- Expanded model, context, tool, eval, security, production, and multi-agent checklists with runtime-state, MCP, live-media, trace-eval, sandbox, and tool-loadout findings.
- Updated README and package metadata for the 0.7.0 production-agent architecture release.

## [0.6.1] — 2026-05-13

### Added
- Codex compatibility notes in `agent-architect/SKILL.md`, including an explicit mapping from Claude Code tool names to Codex equivalents for shell access, subagents, user questions, and web search.

### Changed
- `setup` now installs skills into both `~/.claude/skills` and `~/.agents/skills`.
- `agent-architect/SKILL.md` update-check preamble now resolves the installed skill from either Claude Code or Codex before running `bin/update-check` and `bin/do-upgrade`.
- Discovery guidance in `agent-architect/SKILL.md` now reads `AGENTS.md` and `GEMINI.md` alongside `CLAUDE.md` so architecture reviews are not coupled to a single agent environment.
- README, CONTRIBUTING, and package metadata now describe the repo as supporting both Claude Code and Codex.

## [0.6.0] — 2026-04-29

### Added
- **Memory Architecture** as 9th audit dimension (weight 1.0x, applied conditionally when Discovery detects persistent memory). Backed by research from Anthropic (Memory tool, context engineering), OpenAI (ChatGPT memory architecture), Mem0 (two-phase pipeline + ADD/UPDATE/DELETE/NOOP), Zep/Graphiti (bi-temporal knowledge graph), Letta/MemGPT, LangMem (hot-path vs. background), A-MEM (zettelkasten note evolution), Park 2023 (Generative Agents — relevance × recency × importance), CoALA framework, LongMemEval, LoCoMo, Drew Breunig (context rot), Simon Willison (dossier failure), Kore.ai (memory drift).
- `checklists/memory-architecture.md`: 16 findings across 3 severity passes.
  - Pass 1 (Critical): no memory typing, append-only without reconciliation, relative time stored as eternal truth, no eviction policy, memory-poisoning surface (no trust boundary).
  - Pass 2 (Important): indiscriminate writes (no extraction step), hot-path-only writes (no background option), pure-similarity retrieval (no recency/importance weighting), no abstention on contradiction, user-only scope when entities matter, no user audit/edit/delete UX, no memory evaluation.
  - Pass 3 (Minor): inconsistent namespace conventions, no deletion cascade, missing provenance fields, no soft-delete or versioning.
- `references/memory-systems.md`: 13-section design textbook covering CoALA's four memory types (working / episodic / semantic / procedural), storage choices (KV / vector / graph / tiered / file / hybrid), framework profiles (Anthropic memory tool, OpenAI Bio, Mem0, Letta, Zep/Graphiti, LangMem, A-MEM, Generative Agents, Titans), write/read/reconcile/temporal/scope/eviction policies, six failure modes (Context Poisoning/Distraction/Confusion/Clash/Collapse + Memory Drift), evaluation (LongMemEval, LoCoMo, MemBench), anti-patterns, and inline citations.
- **Pattern 17: Memory Type Discipline** — preferences, facts, episodes, and procedures have different write rules; classify before storing.
- **Pattern 18: Reconcile-on-Write** — every write asks ADD/UPDATE/DELETE/NOOP; append-only is not a memory system.
- **Pattern 19: The Validity Window** — every memory carries valid_from/valid_until (or TTL, or "indefinite" as a deliberate choice); relative time is resolved to absolute on ingest.
- **Pattern 20: Eviction is a Feature** — design the pruning rule alongside the storage rule; "we keep everything" is a choice with a known cost, not a default.
- **Failure mode: STALE BELIEF** — fifth failure path in the FAILURE MODE MAP, applicable only to agents with persistent memory. Distinct from hallucination because the source was once real.
- **Discovery step 2.6** — silent detection of memory and persistence (vector DB clients, mem0/letta/zep/langmem/graphiti imports, Anthropic memory tool, custom preference/profile stores, repeated string concatenation of stored content into prompts). Classifies storage type and emits a Memory line in the System Map.
- **DESIGN-mode topic** — "Memory architecture" added to the Design Conversation Loop topics. Greenfield Detailed Design now includes a Memory architecture section when the system needs persistence, covering CoALA types, storage choice, scope, write/reconcile/read/evict policies, validity windows, and a memory-specific evaluation plan.

### Changed
- Frontmatter description: "7-dimension scoring" → "9-dimension scoring", "13 lessons" → "14 lessons", "15 cognitive patterns" → "20 cognitive patterns". Added "design my memory system" to invocation triggers.
- Lesson 13 (Curate memory; don't hoard) expanded to name CoALA's four memory types, ADD/UPDATE/DELETE/NOOP reconciliation, and absolute-timestamp ingest. Defers depth to `references/memory-systems.md`.
- Overall Maturity Score note corrected: Agent Security is also weighted 1.5x (was missing from the prior 0.5.2 release).
- TREND comparison table now includes Agent Security and Memory Architecture rows (Agent Security was missing in 0.5.2).

## [0.5.2] — 2026-04-13

### Added
- **Agent Security** as 8th audit dimension (weight 1.5x, always applied). Backed by research from OWASP LLM Top 10 2025, Google DeepMind CaMeL, Anthropic browser agent research, Meta AI Rule of Two, Simon Willison, Palo Alto Unit42, and Elastic Security Labs.
- `checklists/security.md`: 13 findings across 3 severity passes.
  - Pass 1 (Critical): Rule of Two violation, inter-agent trust exploitation (82.4% success rate), credential co-location, MCP tool description integrity, complete exfiltration path (filesystem + network combined).
  - Pass 2 (Important): no injection-resistant architectural pattern (Plan-Then-Execute, Dual LLM, Map-Reduce, CaMeL), excessive agency (OWASP LLM06), memory/RAG poisoning, denial-of-wallet, LLM output passed to downstream systems without validation.
  - Pass 3 (Minor): no audit trail, system prompt leakage risk, missing Unicode/injection sanitization.
- **Pattern 16: The Injection Surface** — maps external content sources against available tools as the primary attack surface analysis lens.
- **Principle 14**: "Assume injection succeeds. Design so that a successful injection cannot cause catastrophic outcomes."

## [0.5.1] — 2026-04-12

### Added
- `production-readiness.md` checklist: 1.6 Credentials Co-Located with Code Execution Environment (Critical) — from Anthropic's Managed Agents engineering post. Flags any agent that executes untrusted code in the same environment where credentials are present. Includes structural fix patterns (resource-bundled auth, external vault + proxy). Suppressed for agents with no code execution surface.

## [0.5.0] — 2026-04-12

### Added
- **3 new lessons** (L11–13) derived from Claude Code's production architecture: cache as load-bearing infrastructure, structural tool restriction over instructed restriction, and memory curation over accumulation.
- **2 new cognitive patterns** (P14–15): The Cache Boundary (static/dynamic prompt split as a first-class architectural decision) and The Recovery Ladder (layered recovery with explicit circuit breakers).
- `context-management.md` checklist: 1.5 No Explicit Cache Boundary (Critical), 2.7 No Memory Tier Design for Persistent Agents (Important).
- `production-readiness.md` checklist: 2.3 expanded from flat retry advisory to full Recovery Ladder pattern with circuit breaker thresholds (3 consecutive, 20 total).
- `multi-agent.md` checklist: 2.6 No Cache-Aware Fork Design (Important), 2.7 Safety-Critical Subagents Rely on Instruction Rather Than Structural Restriction (Important).
- `tool-design.md` checklist: 2.6 Description Omits Anti-Patterns and Cross-References (Important).

### Changed
- Frontmatter description updated: "10 lessons" → "13 lessons", "13 cognitive patterns" → "15 cognitive patterns".

## [0.4.0] — 2026-04-09

### Changed
- **Branch-aware audit cache** — evaluation history is now scoped per git branch, preventing cross-branch trend pollution. Cache lookup partitions evaluation files into same-branch and cross-branch sets. Same-branch evaluations are always preferred; cross-branch evaluations are only used as a fallback when an exact commit match exists (handles fresh branches cut from an already-evaluated commit). TREND comparisons are strictly same-branch only.
- Evaluation files now store `git_branch` in YAML frontmatter (quoted string; detached HEAD stored as `"detached:{7-char-hash}"`). Legacy files without `git_branch` are treated as `"unknown"` and handled gracefully as cross-branch fallbacks.
- EVALUATION HISTORY block in System Map is now labeled with current branch; cross-branch evaluations are surfaced separately when no same-branch history exists.
- TREND block header now includes branch label (`branch: \`main\` — vs. [date]`). First evaluation on a new branch skips TREND and notes cross-branch count.

## [0.3.0] — 2026-04-04

### Added
- **Interactive update notifications** — skills now detect when a newer version is available upstream and prompt the user to update. Shows what's new from the changelog, asks for approval, and performs the upgrade automatically if accepted. Checks are cached (1 hour TTL) so they never slow down skill invocation.
- `bin/update-check` — lightweight bash script that compares local HEAD against `origin/main`, extracts changelog diff between versions.
- `bin/do-upgrade` — performs `git pull --ff-only` and clears the update cache.
- Update check preamble template documented in `CONTRIBUTING.md` for future skills.

## [0.2.0] — 2026-04-02

### Added
- **Model-aware evaluation** — 7th scoring dimension (Model Awareness) detects which LLM models a codebase uses and applies model-specific evaluation criteria. Shipped profiles for 7 model families (Claude, GPT, Gemini, Llama, Mistral, DeepSeek, Command R+). Unknown models researched via web search and cached locally.
- `model-profiles.md` — shipped knowledge base with per-family behavioral profiles and version-specific notes.
- `checklists/model-awareness.md` — new checklist with precedence rule (model-specific overrides generic) and dedup rule.
- Unknown Model Protocol — web search → local cache at `~/.agent-skills/local/agent-architect/model-research/`.
- Cognitive pattern #13: Model-Prompt Fit.
- `CONTRIBUTING.md` — local data persistence guidelines for future skills.

## [0.1.0] — 2026-04-01

### Added
- `/agent-architect` — Senior architect review for multi-agent systems, prompt engineering, and agent harness design. Three modes: AUDIT (full system evaluation), REVIEW (focused prompt teardown), DESIGN (new system from scratch). 6 evaluation dimensions, 12 cognitive patterns, confidence-scored findings.
