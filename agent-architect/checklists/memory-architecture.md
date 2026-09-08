# Memory Architecture Checklist

## Instructions

Apply this checklist against any persistence layer that stores information across turns or sessions for an agent — explicit memory tools (Anthropic memory tool, OpenAI Bio, Mem0, Letta/MemGPT, Zep/Graphiti, LangMem, A-MEM, Cognee, Supermemory), custom JSON/SQL preference stores, vector-DB-backed long-term memory, or ad-hoc "remember this" patterns where prior content is concatenated into future prompts.

Skip this checklist entirely if the system is single-session and stateless — there is no memory to evaluate.

For each finding, cite the specific file/path and the problematic mechanism. Skip anything that is fine. Use the `[SEVERITY] (confidence: N/10) file — description / Current / Fix / Why` format.

For the `Why` line, prefer connecting to a named cognitive pattern: **17 Memory Type Discipline**, **18 Reconcile-on-Write**, **19 The Validity Window**, **20 Eviction is a Feature** — or to **Lesson 13 (Curate memory; don't hoard)**.

## Pass 1 — Critical

### 1.1 No Memory Typing — Flat Store Conflates Different Memory Categories
Memory is stored as undifferentiated strings, JSON blobs, or vector entries with no distinction between user **preferences** ("dad prefers vegan"), **facts** ("the household has 4 members"), **episodes** ("on 2026-04-15 we cooked poha for breakfast"), and **procedures** ("the standard meal-plan workflow is 3 mains + 1 side"). A flat store cannot enforce different write rules per type, which makes contradictions inevitable: a one-week request collides with a forever-preference because the system cannot tell them apart.

**What to look for:** A single table/collection/file holding every kind of remembered string, with no `type` / `kind` / `namespace` discriminator. The reverse is also a smell — a system with five types but no rule about which writes go where.

### 1.2 Append-Only Without Reconciliation
New memories are written without comparing against existing ones. There is no equivalent of Mem0's ADD / UPDATE / DELETE / NOOP decision, no edge-invalidation step, no "supersedes" link. Contradictions accumulate silently; the agent reads back a corpus that argues with itself.

**What to look for:** Code paths where a new fact is `INSERT`-ed, `append()`-ed, or `add_memory()`-ed without first searching for related/contradicting entries and choosing an operation. If the write path is one line and there is no reconciliation function, this finding applies. The fix: introduce a reconciliation step that classifies the candidate fact against semantically related existing memories and picks ADD / UPDATE / DELETE / NOOP. Use the LLM as the reconciler if a deterministic function is impractical — but never skip the step.

### 1.3 Relative Time Stored as Eternal Truth
Phrases like "this week", "today", "for summer", "right now", or "starting next Monday" are written verbatim into memory without resolving to absolute timestamps and without a `valid_from` / `valid_until` (or TTL) window. Once written, the entry will guide the agent forever even though the user meant it for a few days.

**What to look for:** Stored memory strings containing relative-time tokens. A memory record without any of: `valid_from`, `valid_until`, `expires_at`, `effective_date`, `ttl`. Or: an ingestion path that takes raw user text and stores it directly, with no LLM-side resolution step that normalizes "this week" → `valid_from: 2026-04-29, valid_until: 2026-05-05`. This is the canonical Anyaa-class failure: the breakfast preference said "this week" once and now it is the family's eternal breakfast.

### 1.4 No Eviction Policy — Memory Grows Unbounded
Memory is added but never removed except by explicit user deletion. There is no decay, no capacity cap, no importance threshold, no "supersede and prune" rule. Stale memories pile up; retrieval quality drops; cost rises; the agent eventually exhibits Drew Breunig's *context distraction* and *context clash*.

**What to look for:** No background job, no `prune()` function, no `last_accessed` decay, no max-size constraint on the memory store. A system where `count(memories)` only goes up. Eviction must be explicit and deliberate even if the choice is "we keep everything" — that is a design decision with a cost, not a default.

### 1.5 Memory-Poisoning Surface — Model Output Written Back Without a Trust Boundary
Anything the model says, anything the model reads from a tool, or anything an unauthenticated user says can flow into long-term memory and then be retrieved as an authoritative fact on a future turn. There is no provenance, no source-of-truth tag, and no validation gate between "ingested string" and "fact the agent acts on."

**What to look for:** Code that writes assistant responses, tool outputs, scraped web content, or untrusted user input directly to the memory store. No `source` or `provenance` field on memory records. No quarantine for memories derived from external content. Cross-reference this with the existing **Pattern 16: Injection Surface** in SKILL.md — long-term memory is the most expensive injection target because a single successful poison persists across all future sessions. The fix: structurally separate "trusted preference set by the user" from "candidate fact extracted from a conversation" from "fact derived from an external source"; require explicit promotion across the boundary.

**This finding assumes a single-agent store — verify the multi-agent case separately.** 1.5 as written covers one agent poisoning its own memory. It does not cover a distinct and more dangerous shape: **shared managed-agent memory that multiple agents read and write** — most commonly a file-backed store (a shared memory directory, a common `/memories`-style path, a shared workspace file) that more than one agent has read access to.

### 1.6 Cross-Agent Memory Trust Boundary Absent in Shared Memory
When two or more agents read from and write to the same memory store — file-backed shared memory being the most common shape in managed-agent runtimes — a write made by one agent is consumed as trusted input by another agent the moment it is read back. This is structurally different from single-agent poisoning: the write and the read happen in **different trust contexts** (different agent roles, different privilege levels, potentially different task scopes), so a compromised or merely buggy low-privilege agent's poisoned write can propagate directly into a high-privilege agent's context with no re-validation in between. **One agent's poisoned write becomes another agent's trusted input — a lateral-movement vector across the agent boundary, not just a self-inflicted data-quality problem.**

**What to look for:** Multiple agents (or agent roles) pointed at the same memory directory, file, or store with no per-agent read/write scoping. No re-validation step when Agent B reads a memory record written by Agent A — the record is trusted purely because it came from "the memory store," with no check on which agent wrote it, at what privilege level, or from what source. No provenance field distinguishing "written by this agent from a user-confirmed fact" from "written by a different agent from its own model output or tool results." The fix: scope memory writes/reads per agent or per trust tier where agents differ in privilege; if a shared store is required, require explicit promotion (the same pattern as 1.5) at the point where a lower-trust agent's write becomes visible to a higher-trust agent, not just at the point where content first enters memory. Cross-reference **Pattern 16 (Injection Surface)** and the multi-agent trust findings in the Agent Security checklist (1.2 — high-privilege agents implicitly trusting peer agent messages) — this is the memory-specific instance of that same problem.

### 1.7 Write-Time Memory Audit Rests on Content Similarity Alone
Findings 1.5 and 1.6 describe memory stores with no trust boundary at all. This one describes the system that built one and reached for the wrong instrument. A write-time gate exists — a semantic-similarity check against known-good memories, a factuality or consistency score, an LLM asked "does this look like a normal memory?" — and a passing score is treated as clearance to write. That inference does not hold, and it fails in the one direction that matters: **high similarity to legitimate content is precisely the property a memory-poisoning payload is built to preserve, so passing a similarity gate is evidence that a write is well-formed, not evidence that it is benign.** A published query-only poisoning framework is designed against exactly this setting — a large pool of benign memories plus active write-time input auditing — pairing retrieval-competitive placement with payloads ("compact factual cloaks") that hold semantic similarity high while keeping their effect; measured against its own audit baseline, detection falls to a small fraction of that baseline's best rate.

**Strength note for the auditor — read this before writing the finding.** The source is a single result: one attack-framework paper, unreplicated, with the models and memory systems it attacked not detailed, and — decisively — the "audit" it evades is a baseline **defined by the same paper**, not an independent auditing standard. Do not carry its success figures into a report, and do not tell a team their gate has been broken; nobody has tested their gate. Carry the structural argument, which does not depend on the numbers: a content-similarity check is visible to anyone who can query the system, and a check an attacker can see is a check an attacker can tune against. Similarity is what such an attack optimizes for, so similarity cannot also be the evidence that it did not happen.

**What to look for:** A memory write path whose only defense is content inspection — an embedding-distance threshold, `is_similar_to_known_good()`, a factuality classifier, a screening prompt — with the write committed on a pass and no other signal consulted. Also: a design doc or PR description that presents the similarity gate as *the* memory security control. The fix is not to remove the content check; it is to stop it standing alone. Add provenance (which component wrote this, from what source, at what trust tier — see 1.5 and 3.3). Add write-frequency and placement anomaly detection: a burst of writes competing for the same retrieval slot is a signal no content check can see. Add cross-session behavioural monitoring: does the agent's behaviour shift after a write in a way the write's stated content does not explain? Grade this finding on the absence of those complementary signals, which you can verify in the code, rather than on the strength of any particular attack, which you cannot.

## Pass 2 — Important

### 2.1 Indiscriminate Writes — No Extraction or Salience Step
Every conversation turn writes either everything (full transcripts) or nothing (no extraction). There is no step where the system identifies which spans of a turn carry durable, useful information versus chatter. Consequence: the memory store becomes a low-signal log; recall scores drop because the *real* fact is buried in noise.

**What to look for:** Memory writes that take whole turns, whole messages, or whole tool outputs unchanged. Or: a hand-coded extractor that looks only for "remember that …" / "I prefer …" surface patterns and misses everything else. The fix: a Mem0-style two-phase pipeline — an extraction LLM call that names the candidate facts plus a separate update step that reconciles them. Run it in the background if hot-path latency matters.

### 2.2 Hot-Path-Only Writes (No Background Option)
Memory writes are always synchronous on the user-facing turn. Latency increases on every turn even when extraction could be deferred. Worse, the agent and memory logic are tangled in the same prompt, so a memory bug raises the agent's failure rate.

**What to look for:** No `enqueue_memory_extraction()` / async worker / batch job. The write path is on the same call stack as the response. The fix: keep a small, cheap hot-path write for explicit "remember this" signals; move richer extraction and reconciliation to a background worker that processes session ends or message batches. Reference the LangChain memory-for-agents post for the canonical hot-path-vs-background split.

### 2.3 Pure-Similarity Retrieval — No Recency or Importance Weighting
Memory retrieval is vector-similarity-only or pure recency-only. Park 2023's `relevance × recency × importance` weighting is absent. Result: a critical fact ("dad is allergic to peanuts") gets out-ranked by a casually-similar recent fact ("we tried peanut sauce last Sunday").

**What to look for:** Retrieval code that calls `vector.search(k=N)` and stops there. No `importance` field or `pinned` flag on memory records. No decay function on the recency component. The fix: add an importance signal (LLM-rated at write time, or user-settable), a recency decay, and combine the three with explicit weights you can tune.

### 2.4 No Abstention When Memory Contradicts Itself
When two memories in the retrieval set disagree, the agent silently picks one without flagging the conflict to the user, the logs, or the reconciler. The user never finds out the system was confused; the architecture has no signal that reconciliation has failed.

**What to look for:** No "conflict detected" branch in the retrieval/use path. No metric that counts contradictions. The agent always answers, even when its memory is internally inconsistent. The fix: detect contradictions at retrieval time, prefer abstention or asking the user, and feed the conflict back into the reconciliation queue.

### 2.5 User-Only Scoping When Entities Matter
The memory store is scoped per user account but the actual subjects of the memory are entities *under* the user — family members, projects, devices, characters. Preferences for one entity bleed into recommendations for another because the addressing scheme cannot tell them apart.

**What to look for:** A schema where `user_id` is the only foreign key on memory records, but the application talks about "mom", "dad", "the kids", "Project X", "the master bedroom Nest." The fix: introduce an `entity_id` (or `subject_id`) dimension. For Anyaa-class household products this is the difference between a useful memory layer and a useless one.

### 2.6 No User Control or Audit UX
Users cannot see what is remembered, cannot edit a single memory, cannot delete one, and cannot turn the system off. There is no audit log of when each memory was written and by which signal. This is the failure mode Simon Willison named the "dossier" problem and the failure mode behind OpenAI's February 2025 silent-destruction incident: when memory is invisible, neither users nor operators can trust or recover it.

**What to look for:** No `/memory` UI, no list endpoint, no per-entry delete, no export, no "memory off" toggle. No write-side audit log. The fix: every memory record needs `created_at`, `created_by_signal`, `created_in_session`, plus a UI that surfaces all of it. Deletion must be cheap and granular.

### 2.7 No Memory Evaluation
The team has no way to measure whether memory works. There is no eval suite that tests information extraction, multi-session reasoning, temporal reasoning, knowledge updates (does the system update when a fact changes?), or abstention (does it correctly say "I don't know" when memory is empty?). LongMemEval and LoCoMo exist; if the team is not using them or an internal equivalent, regressions will land silently.

**What to look for:** No memory-specific test file. No fixture conversations exercising "I told you my favorite breakfast last week, what is it?" No regression on "you used to like X but now you like Y." The fix: at minimum, build a small in-house eval that exercises LongMemEval's five abilities against the system's actual memory layer. Treat it as a regression suite that runs on every memory-related PR.

### 2.8 Fixed Retrieval Pre-Step Where a Tool Surface Would Fit
Memory retrieval runs as an unconditional pre-step on every single turn — a retrieval call fires before the model has any chance to decide whether it needs one — even though the workload's actual recall need is sparse and turn-dependent (most turns are small talk, task execution, or otherwise don't touch stored preferences/facts). The system pays retrieval latency and token cost on every turn regardless of need, when the model's own tool-calling loop could be trusted to fetch memory only when it actually needs it.

**What to look for:** A retrieval call hard-wired into the top of the request-assembly path with no conditional gate, on a system where the runtime already supports tool/function calling and the memory access pattern is naturally sparse (not every turn needs a lookup). No "does this turn need memory" decision point anywhere in the pipeline — retrieval is unconditional by construction, not by measured need. The fix is not "remove retrieval" — it is exposing memory read (and where appropriate write) operations as callable tools the model invokes mid-reasoning, so retrieval cost is paid only on the turns that need it. This does not apply where most turns genuinely need memory context or where missed recall is unacceptable (compliance-sensitive lookups) — a fixed pre-step is the right choice there; flag this finding only when the sparse-need condition holds and no tool alternative exists.

## Pass 3 — Minor

### 3.1 Inconsistent Namespace Conventions
Memory keys mix conventions (`user:42:prefs`, `userId_42_preferences`, `users/42/memory`) across modules. Makes ad-hoc queries painful and increases the chance of cross-namespace leakage bugs.

### 3.2 No Deletion Cascade
Deleting an entity (a family member, a project) leaves orphan memories pointing to a now-missing subject. They will be retrieved and used as if the entity still exists.

### 3.3 Missing Provenance Fields
Memory records lack `source` (user-stated / model-extracted / tool-derived / imported), `confidence` (how sure was the writer?), and `created_in_session`. Without these, reconciliation cannot prefer high-confidence sources and audit trails are incomplete.

### 3.4 No Soft-Delete or Versioning
Updates and deletions are destructive. There is no way to recover a memory the user accidentally edited, no way to ask "what was true last month?", and no way to debug a regression by looking at a prior memory state. Bi-temporal stores (Zep/Graphiti) get this right by default; flat stores must opt in.

## Suppressions — DO NOT flag

- **Demo or prototype agents explicitly marked as ephemeral / single-session.** Memory architecture is not in scope.
- **Caches that look like memory but are not memory.** A KV cache for tool responses with a 5-minute TTL is not a memory system.
- **In-context "remember within this turn" structures.** That is working memory and belongs to the Context Management dimension.
- **Read-only memory imported from a fixed corpus** (e.g., a static knowledge base). Reconciliation, eviction, and write-policy findings do not apply; retrieval-quality findings still do.
- **1.6** — suppress for single-agent systems, or for multi-agent systems where each agent has its own isolated memory store with no shared read/write path between agents.

## Confidence Calibration

- **9–10:** You read the specific code path that writes, retrieves, or evicts memory and can name the missing mechanism.
- **7–8:** The system clearly follows a known anti-pattern (flat append-only store, no validity windows, no reconciliation function), even without reading the full path.
- **5–6:** The pattern is suspicious — names like `memories.json` or `preferences.append()` suggest the failure but you have not confirmed the write/read paths. Flag with caveat.
- **3–4:** You inferred from architecture diagrams or naming alone that memory is poorly designed. Appendix only.

## Cross-references

- Pattern 16 (Injection Surface): long-term memory is the highest-value injection target because a single poison persists across sessions. Always evaluate 1.5 in light of the security checklist.
- Agent Security checklist 1.2 (high-privilege agents implicitly trusting peer agent messages): 1.6 is the memory-specific instance of that same trust-boundary problem. Co-file 1.6 with a 1.2 finding when both apply to the same shared-memory path.
- Agent Security checklist / Pattern 16: 1.7 is the case where a defense exists but is the wrong kind — a content check where a provenance-and-behaviour check is needed. Co-file with 1.5 when the store also lacks provenance fields (3.3).
- Lesson 13 (Curate memory, don't hoard): is the parent principle for 1.4 (eviction).
- Context Management dimension: working memory and within-turn assembly. Memory Architecture covers across-turn persistence. Findings about prompt-time context assembly belong there, not here.
- Tool Design / Context Management loadout findings: 2.8 (fixed pre-step where a tool surface fits) is the memory-specific instance of the same tool-loadout-vs-context-stuffing tradeoff those dimensions evaluate for non-memory tools.
- Production Readiness: memory failures (silent destruction, accidental cross-user leakage) are also production-readiness failures — co-file findings when they touch operational hygiene.
