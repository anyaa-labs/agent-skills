# Changelog

## [0.9.0] — 2026-09-08

A research release. `references/agent-engineering-landscape-2026-09.md` records a
primary-source sweep of agent engineering between 2026-06-08 and 2026-09-08 — the loop,
the harness, identity, evaluation, and the failure modes that are not properties of any
one model — and this release is what that sweep changed in the skill. Every claim below
tracks a labelled finding in that file; where the file labels a result `suggestive` or
single-domain, the checklist says so and the auditor is told not to flag on it alone.

### Fixed — advice the skill was giving that the sweep contradicts

Two places. The release was planned as four, and the framing "four places the skill is
actively wrong" is **not accurate** — independent greps taken before any edit found that
two of the four had nothing to correct. Both are recorded below under Added, where they
belong.

- **Long-horizon degradation was prescribed a context fix without an attribution step.**
  `context-management.md` 1.4 asserted that a model's attention to early instructions
  degrades after enough turns, and offered reset/summarization/compaction as the remedy.
  Two separable mechanisms produce the same symptom — accumulated context and accumulated
  steps — and the largest-N study in this sweep found that bounding the context window
  made decay *steeper*, not shallower, on an agentic tool-use loop, with degradation
  tracking step count. So the standard fix is a known-wrong fix for one of the two
  mechanisms, and the skill named no way to tell which one you were looking at. New Pass 1 finding
  `context-management.md` **1.7** carries the attribution test; 1.4 is now the missing
  *recovery point* (which stands either way) with the causal claim removed; Pattern 3
  (Context is Calories) gained "attribute the decay before prescribing a diet."
  Pattern 4 (Fresh Eyes Doctrine) was still prescribing an unconditional context reset one
  entry down the same list, and now conditions it on that attribution step.
- **A human approval gate was counted as a mitigation with nothing asked of it.** It was
  the escape hatch on the Rule of Two, one of four equal members of the harness inspection
  set, a substitute for validation before persistence, and a Strong anchor in the Harness
  Architecture rubric — everywhere on the strength of existing, nowhere on the strength of
  working. Vendor telemetry on a production coding agent shows near-total approval of
  individual tool calls and markedly more scrutiny applied to whole plans than to the
  actions composing them: granularity buys consent, not scrutiny. New `security.md` **2.8**
  states the rule — a gate is a control only if approvals are sometimes refused for
  risk-connected reasons — and makes denial telemetry the checkable artifact. Every crediting site
  now defers to it, and the rubric anchor reads "with evidence those
  approvals discriminate." Percentages were deliberately left out of the checklists and
  stated directionally instead; they live in Pattern 33, attributed to the one vendor whose
  users they describe.

### Added — Agent Identity & Authorization, the 13th dimension

- **Agent Identity & Authorization** (weight 1.0x, conditional). It runs only when Discovery's
  new step **2.11** finds delegated authority — an agent holding a credential of its own, a
  sub-agent or tool acting under an inherited one, a remote agent over MCP or A2A, or a hosted
  agent-identity platform. A single-turn assistant that holds nothing and delegates to nobody
  scores N/A and is excluded from the weighted average; it is not deficient for lacking an
  identity architecture. Backed by `checklists/agent-identity.md`, 10 findings across three
  passes, asking one question in several forms: **when the agent asks to do something, what
  refuses?** A credential the agent holds and is trusted not to misuse has no answer.
- The checklist ships with an **honesty constraint** rather than a verdict, because most of
  the identity plane — directory configuration, conditional-access policy, certificate
  issuance, sponsor records — is console or IaC state an auditor cannot see from the code.
  Where the posture is not determinable, the *gap* is the finding. "Not visible here" is
  never "not present."
- Its Dedup Rule was written against the nearest collisions rather than around them: `security.md`
  owns what untrusted content can do once inside and whether an action's *shape* is dangerous;
  `multi-agent.md` owns whether the agents should exist and how they coordinate; this checklist
  owns the authorization contract — which principal each agent acts as, what can refuse a
  delegated action, and how far a compromised participant reaches before something outside the
  model stops it. Where one broker does two of those jobs, the checklist says to report it once.
- Wired into every site the dimension name appears in: the frontmatter description, the Discovery
  gate at step 2.11, the Deep Evaluation read list, the scoring rubric, the score table, the TREND
  table, and the regression note. The N/A phrasing matches the Memory / Sovereignty / Multimodal
  precedent verbatim rather than inventing a fourth wording for the same idea.

### Added — cognitive patterns 30-38 (29 → 38)

30. **The Autonomy Rung** — autonomy is a rung, not a dial; name the rung, then ask what stops it.
31. **Escalation Is a Tool, Not a Failure** — an agent whose only options are succeed or fail invents a third.
32. **Aggregate Accuracy Is a False Average** — ask for accuracy on the subset where the signal is the only defence.
33. **The Rubber Stamp** — an approval gate is a control only if someone can show it refusing.
34. **Summary Collapse** — under a tight handoff budget the facts survive and the rules governing their use do not.
35. **No Referee by Default** — divergent goals on a shared resource resolve however the agents improvise.
36. **Phantom Guardrail** — a self-improving harness can accrete defences against failures that never happened.
37. **Identity Is Provisioned, Not Assumed** — which principal does each agent present, and what can refuse it?
38. **Transactional Authority** — once an agent can move money, its budget is an authority boundary, not a preference.

Calibration is deliberately uneven across the nine, because the evidence is. Pattern 34 names
its testbed; Pattern 36 says explicitly that it is a shape to look for and not a measured
prevalence; Pattern 38 is marked as one vendor's shipped middleware rather than a base rate;
Pattern 30 says the surrounding vocabulary is contested and holds it loosely.

### Added — the two corrections that turned out to be additions

Both were planned as fixes and are not. The skill had never given the wrong advice; it had
said nothing at all, which is a different defect and warrants a different tone in the finding.

- **No aggregate-accuracy claim for a monitor or judge existed anywhere to correct.** What was
  missing was the question. `eval-infrastructure.md` **1.6** now asks for a monitor's accuracy on
  the subset where its signal is the only defence — a chain-of-thought monitor's high aggregate
  catch rate collapses to a small fraction of it there, against an adversary that rewrites only
  the trace and leaves commands and outputs byte-identical, and it transfers across monitor
  families and agent models (`strong`). Its Pass 2 companion **2.9** adds rubric-only and
  criterion-reversal probes for LLM judges, and is hedged accordingly: that source is
  `suggestive`, a methodology critique whose judge models and benchmarks are not detailed in the
  abstract, so the auditor reports a missing probe and not a broken judge.
- **No guidance anywhere keyed recovery on mid-trajectory confidence.** `production-readiness.md`
  **2.8** adds it as a question with a "Scope — read before flagging" paragraph attached:
  single-domain (deep-research tasks), two signals tested, `suggestive`, and explicitly not an
  automatic defect — a team that can show from its own traces that a mid-run signal predicts
  outcome on its task class closes the finding.

### Added — findings across eight existing checklists

- `multi-agent.md` — shared resource with no referee (1.5), read+write surfaces never enumerated
  (1.6), unlogged private inter-agent channel (2.10), identical agents counted as independent
  when their failures correlate (2.11), and summary collapse across a handoff (2.12). The
  contention finding collided with a pre-existing Shared Mutable State item the plan did not know
  about; it is written as the goal-divergence case, with the older finding redirecting up to it.
- `security.md` — third-party MCP servers assumed authenticated and shell-free (1.9), and MCP
  security posture evidenced only by an automated scanner (2.9): what a clean scan is and is not
  evidence of.
- `tool-design.md` — agent-to-agent and agent-to-tool boundaries collapsed into one harness layer
  (2.11), whose sharpest form is an agent exported as an MCP server: unless the exported surface is
  narrowed at the point of export, the caller's blast radius silently becomes the union of its own
  tools and the callee's.
- `harness-architecture.md` — no escalation channel distinct from failing or working around it (1.7),
  an unnamed autonomy rung or one whose stop condition is not machine-checkable (1.8), a Recovery
  Ladder with no state-restore rung (2.7), and a self-improving harness accepting guardrails without
  verifying the failure occurred (2.8).
- `memory-architecture.md` — a write-time similarity gate is not evidence of benignity (1.7). The
  attack's success figures are omitted entirely and the self-defined-baseline caveat is stated
  twice, so the grading instruction points at absent provenance, frequency and cross-session
  signals rather than at the attack's strength.
- `eval-infrastructure.md` — eval integrity treated as adversarial rather than design-time (1.7), a
  third-party judge neither version-pinned nor calibrated (2.10), a benchmark score accepted as
  capability evidence without an exposure audit (2.11), and eval infrastructure configuration not
  held constant across compared runs (2.12).
- `context-management.md`, `production-readiness.md` — see the two sections above.

### Added — model profile facts

- `openai.md` — an Agents SDK guardrail-output leak into replay and persisted state (v0.22.0); a
  silent default-model swap in v0.20.0, framed as harness expiry rather than a release note; spend-limit
  429s are terminal and not retryable; the `slow_down` / `server_is_overloaded` split; mTLS/X.509 GA.
- `anthropic.md` — no built-in memory expiration; the 2026-08-31 thinking-block replay cutover.
- `google.md` — the Interactions API at GA as the default agent interface.

The plan expected three of the researched facts to be already present. Five were — xAI's `xhigh`
effort level was in the profiles in three places, and the Anthropic memory-tool path-traversal fact
was there too, with only its "no built-in expiration" half genuinely new. `xai.md` was correctly left
untouched.

### Added — mechanical guards

- **`tests/no_unsupported_claims.test.mjs`.** Claims exceeding their source appeared in four
  consecutive tasks of this release — pluralizing a single-vendor fact into "frameworks now ship",
  attaching "largest" or "first" to the wrong paper, upgrading "in this sweep" to "to date". Per-task
  correction was not working, so the class got a guard. It greps `checklists/` for two shapes
  (plural-vendor capability claims, superlatives attached to a source) with a
  `<!-- source-claim-ok: ... -->` escape hatch that requires quoting what the reference actually says.
  Two-sided corpus, mutation-verified, zero false positives across all 13 checklists. It appears to be
  working: the next instance of the class was the first in the release caught *before* landing — an
  implementer refused a brief of mine that called a finding "the best-evidenced in the sweep", because
  the reference labels at least seven findings `strong` and ranks none of them. It is still a grep
  guard over two shapes, not a proof: a claim phrased outside them still gets through, and it does
  **not** cover `CHANGELOG.md`, `README.md`, the patterns in `SKILL.md`, or `references/`.
- A **contract test asserting every "N-dimension" claim anywhere in `SKILL.md` agrees with the
  dimension count.** The mode table still said "12-dimension" after the 13th dimension landed: it
  contains no dimension *name*, so a name-derived grep structurally could not find it, and the old
  test only checked the frontmatter phrase. That class of miss is now closed by count rather than
  by vigilance.

Suite 18 → 22.

### Known gaps in the underlying research

Recorded so a reader can tell what was checked and came back empty, rather than inferring that
silence means nothing was there.

- **"Loop engineering" has no verified coiner, and its own popularizer credits no originator.**
  Aggregators uniformly credit a 2026-06-07 X post; that permalink is unfetchable, and the author's
  own post index contains no post on loops at all. The earliest primary long-form use found claims no
  coinage. Pattern 30 therefore audits the rung and the stop condition and holds the label loosely.
  The same goes for the widely repeated claim about who inside Anthropic practices it — asserted by
  aggregators and one secondhand mention, primary-sourced nowhere in this sweep. "Context rot" and
  "comprehension debt" are likewise used as settled vocabulary with no coinage page located.
- **`x.com` returns HTTP 402 to the fetch tooling**, so no X post could be verified as primary. This
  blocked attribution work for several terms and left at least one vendor's apparent primary source
  for a widely reported agent product unreachable; the associated claims are recorded as unsourced
  rather than promoted.
- **Several frequently cited sources published nothing in the window.** Indexes were fetched, not
  merely searched: Karpathy's blog index has no June–September 2026 entries at all (latest 2026-04-30),
  Cognition's stops at 2026-07-28, and searches for Lilian Weng, Chip Huyen, Jason Liu and Omar Khattab
  returned only aggregator and course-marketing pages on the topics in scope. Recorded as a gap rather
  than filled. The individual-author signal that *did* land came from a smaller set — Simon Willison,
  Addy Osmani, Hamel Husain, Eugene Yan — with most of the quarter's remaining practitioner material
  coming from company engineering blogs. Any "X said this summer" claim about the absent names should
  be treated as unsourced until a primary page is produced.
- **The reference file contradicted itself in two unrelated ways**, both found during implementation
  and both annotated in place rather than silently corrected. The five sweeps ran independently and
  were concatenated without reconciliation: one sweep credited a coiner for "loop engineering" while
  another recorded the origin unconfirmed — an attribution conflict that then turned out to recur in
  more than one place, including inside the sentence written to fix it; and separately, one sweep's
  Sources block listed a page as fetched while its own raw source log recorded the same URL as never
  retrieved. The file now carries two
  precedence rules — the sweep holding the earlier primary source wins on attribution, and when a
  Sources list and the raw source log disagree about retrieval, the log wins — with both sides of
  each conflict left visible.

## [0.8.1] — 2026-09-08

Follow-ups parked during the 0.8.0 review, plus one field the review only
identified as wrong rather than fixed.

### Changed
- **`tier` split into `access` and `scope`.** The single field mixed three unrelated axes — `frontier` was market positioning, `open-weight` was licensing, `regional` was geography — so a family that was two of them at once had to be filed as one, and the discarded half was repeatedly the fact an audit needed. Falcon is open-weight *and* regional; Nova is API-only *and* frontier. Now `access: api-only | open-weight` (can this be self-hosted?) and `scope: global | regional` (is it selected for residency, language coverage or sovereignty reasons?). Values were derived per family from each profile's own `Deployment & residency` text rather than translated from the old word. Capability positioning is deliberately **not** migrated: "frontier" is the fastest-rotting claim this layer could carry, and the layer exists to stop shipping facts that expire.
- The split pays off in `sovereignty-residency.md` 1.1: which remediations exist now depends on `access`. On an open-weight family, self-hosting inside the boundary is a real option and the finding names it; on an api-only family with no published in-region path, the obligation cannot be met by configuration at all, and the honest finding is that the model choice is incompatible with the requirement — a model-selection decision, not a deployment bug.
- `model-awareness.md` 2.1 and 3.1 no longer fall back to the family-level field as a cost proxy. That fallback was never sound — families span the full cost range internally, so a family label says nothing about the deployed model. The checklists now report the gap instead of estimating.
- **AUDIT, REVIEW and the model-awareness header stopped naming the index as a data source.** The 0.8.0 final review fixed this for DESIGN mode only. Since the split, the index holds the family table, API-ID mapping, cost tiers and the staleness protocol — and no capability, context-window or tool-semantics facts — so an auditor following those three lines would open it, find nothing to reason with, and fall back on recollection: the exact failure the split was built to prevent.
- The API-ID mapping is order-sensitive and now says so. Nvidia's derivatives keep their base model's name, so `llama-3.3-nemotron-super-49b` matched Meta's broader pattern first and routed to the wrong family. Nemotron now precedes Meta and matches the derived shape explicitly.

### Fixed
- **The model-fact grep guard had no test of its own behaviour**, so nobody noticed that most families' real ID shapes walked straight through it — twelve of fifteen probes taken during the 0.8.0 final review slipped. Widened to cover Cohere's `Command A` / `Aya` / `embed-v*` / `rerank-v*` (only `command-r` was covered), MiniMax's prefix-less `Hailuo-02` and `image-01`, the AI21 HF org string `ai21labs` (a trailing word boundary was blocking it), million-scale and comma-grouped context claims, and perishable dates written in prose rather than ISO form. Each widening was measured at zero false positives across all twelve checklists.
- The durable half is a two-sided corpus — `MUST_TRIP` and `MUST_NOT_TRIP` — so the guard cannot be silently narrowed again. Verified by mutation: restoring either the `ai21` boundary or the old proximity window turns the suite red. The corpus immediately caught a wrong justification in its own commit.
- **`amazon-nova.md` now records that AWS states the high-effort parameter constraint twice, with two different lists.** One note says temperature/topP/topK; another on the same page says temp/topP/**maxToken**. `topK` appears only in the first, `maxTokens` only in the second. Recorded as the union, because the page gives no basis for preferring either and the `maxTokens` half is corroborated by the output-length sentence beside it. This is the one most harnesses will trip on — nearly every client sets `maxTokens` unconditionally — so a harness written from the first note reads as correct and still errors at runtime.
- `google.md` pointed a successor model at a "Current models" section this file has never had, a clause carried through from the 0.7.x structure.
- `ai2-olmo.md`'s refresh warning now names *which* claims depend on the `docs.allenai.org` SPA — the provider table, the `vllm serve` path, the Vertex/Modal guides, and the licensing wording — and states the failure mode explicitly: a fetch-only pass reads the intro shell, finds none of them, and silently converts four sourced operational facts into "not publicly documented".

Suite 16 → 18.

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
