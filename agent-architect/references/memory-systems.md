# Memory Systems Reference

This is the textbook for the Memory Architecture dimension. The checklist at `checklists/memory-architecture.md` is the audit rubric; this file is the design reference. Read it on demand when DESIGN mode tackles a memory question, when AUDIT needs justification for a finding, or when the architect needs to reason about a memory choice the cognitive patterns alone do not settle.

Every claim of fact is cited inline. Where industry has converged, the convergence is named. Where it has not, the open questions are stated.

## 1. The Four Memory Types (CoALA framework)

Borrowed from cognitive science and formalized for LLMs by the **CoALA framework** (Cognitive Architectures for Language Agents, Sumers et al. 2023). Production systems converged on this four-type split because a single uniform store cannot enforce the different write rules each type needs.

- **Working memory** — the active context window. Ephemeral, session-scoped. Token-budgeted. Cleared at session end. *Belongs to the Context Management dimension, not this one.*
- **Episodic memory** — specific past events tied to time and session. "On 2026-04-15 the user asked for poha for breakfast." Append-leaning by nature; reconciliation is rare because past events are immutable. Eviction is via decay or summarization.
- **Semantic memory** — general facts and durable preferences, independent of when learned. "Dad prefers vegan." "The household has 4 members." This is the type personal-assistant products lean on most. **Reconciliation is mandatory** because preferences change.
- **Procedural memory** — skills, routines, automated workflows. "The standard meal-plan workflow is 3 mains + 1 side." Updated by feedback loops, not by user statements.

> Personal assistants depend most on semantic memory (user preferences and profiles). Software engineering agents lean heavily on procedural memory. Game agents need tight integration of episodic and procedural memory. — atlan.com/know/types-of-ai-agent-memory (2025)

For Anyaa-class household products: ~70% of the value is semantic (per-entity preferences), ~20% is episodic (what we cooked when), ~10% is procedural (the planning workflow). Build for that ratio.

Citations: [CoALA paper](https://arxiv.org/abs/2309.02427); [Types of AI Agent Memory](https://atlan.com/know/types-of-ai-agent-memory/).

## 2. Storage Choices

| Choice | Best for | Worst for | Examples |
|---|---|---|---|
| **Flat KV / JSON** | Small preference sets, low cardinality, full-load-into-context patterns. | Anything with >100 entries; semantic recall; contradiction detection. | Anthropic memory tool's `CLAUDE.md` files; OpenAI's Bio. |
| **Vector store** | Semantic recall over many entries; episodic logs. | Strict-equality lookups; relational queries; temporal reasoning. | Mem0; LangMem; LlamaIndex memory; Cognee. |
| **Knowledge graph** | Relational facts; entity-centered reasoning; bi-temporal validity. | Free-text recall; small projects (overhead). | Zep / Graphiti. |
| **Tiered (OS-style)** | Long-running agents that move data between hot/cold tiers under their own control. | Apps that don't want the LLM to manage memory tiers. | Letta / MemGPT. |
| **File-based markdown** | Auditable, human-editable, simple, transparent. | Semantic search at scale; multi-entity scoping. | Anthropic memory tool (the "transparent file-based approach", `docs.claude.com/memory-tool`). |
| **Hybrid (vector + graph)** | Production systems that need both semantic recall and relational/temporal reasoning. | Solo prototypes — overhead exceeds benefit. | Zep (graph-first with embeddings); supermemory. |

**Decision rule.** Start with the simplest storage that fits the access pattern of your dominant memory type. For a household nutrition app where retrieval is mostly "what does this entity prefer?" the right starter is a structured KV per entity, not a vector store. Move to vector or graph only when you have evidence that simple lookup fails — Iron Law applies to memory architecture too.

Citations: [Anthropic Memory tool docs](https://docs.claude.com/en/docs/agents-and-tools/tool-use/memory-tool); [OpenAI memory architecture](https://openai.com/index/memory-and-new-controls-for-chatgpt/); [Mem0 paper](https://arxiv.org/html/2504.19413v1); [Zep paper](https://arxiv.org/abs/2501.13956); [Letta forum thread on memory comparisons](https://forum.letta.com/t/agent-memory-letta-vs-mem0-vs-zep-vs-cognee/88).

## 3. The Major Frameworks at a Glance

A one-paragraph profile of each major option, with the question each is trying to answer.

**Anthropic Memory Tool** (Sept 2025, beta `context-management-2025-06-27`). File-based: Claude reads/writes/edits markdown files via tool calls; storage is fully client-controlled. Pairs with context editing (compaction + tool-result clearing) for a stated +39% performance gain on multi-step tasks. Strength: transparent, auditable, runs anywhere you can mount a filesystem. Weakness: no built-in semantic search, no reconciliation logic — you bring those.

**OpenAI ChatGPT Memory** (April 2025 "improved memory" launch). Two layers — *Saved Memories* (the explicit Bio tool, surfaced in the system prompt under `Model Set Context`) and *Chat History reference*. The model auto-writes and auto-updates Saved Memories. Strength: zero plumbing, deeply integrated. Weaknesses (well-documented): no per-entity scoping, the dossier-collapse failure (Simon Willison: ChatGPT mixed his work-context "Half Moon Bay" into a pet photo because everything is one global pile); silent destruction incident in February 2025 illustrates the operational risks of an opaque store.

**Mem0**. Two-phase pipeline: an extraction call identifies candidate facts; an update call uses the LLM to pick **ADD / UPDATE / DELETE / NOOP** against semantically similar existing memories. Cloud-first SaaS or self-hosted; reports 26% accuracy boost over baseline LLM memory and 90% lower token usage in their benchmarks. Strength: the four-op reconciliation is the single most important pattern this reference describes. Weakness: extraction quality is bounded by the extractor LLM; flat fact-extraction can flatten richer structure.

**Letta / MemGPT**. Treats the context window as RAM in an OS metaphor. Tiers: in-context **core memory**, **recall memory** (conversation history), **archival memory** (long-term blob store). The agent itself decides what to move between tiers via tool calls. Strength: a clean mental model for long-running agents. Weakness: pushes memory management into the LLM's reasoning surface, which raises agent prompt complexity and is sensitive to model swaps.

**Zep / Graphiti**. Bi-temporal knowledge graph. Every edge carries four timestamps: `t_valid` and `t_invalid` (validity window in the real world), `t_created` and `t_expired` (validity window in the system). New edges trigger an LLM-driven contradiction check against semantically related existing edges; conflicting edges are *invalidated*, not deleted. You can query "what is true now?" or "what was true on 2026-01-15?". Strength: the most rigorous temporal model in the space. Weakness: graph plumbing is real overhead — only worth it when bi-temporal reasoning is a product requirement.

**LangMem (LangChain)**. SDK for memory extraction, management, and updates. Surfaces the **hot-path-vs-background** split as a first-class architectural choice: agents can write memories synchronously during a turn (`create_manage_memory_tool`) or via a background manager that extracts/consolidates after the turn. Includes a `delete_existing_memories` parameter that defaults to True — i.e., contradicted memories are removed rather than appended-around. Strength: the cleanest articulation of *when* to write. Weakness: agent-driven memory management requires the agent to be smart enough to call the tool well.

**A-MEM** (Xu et al., NeurIPS 2025). Zettelkasten-style: each memory is a structured note with keywords, tags, and *links* to other memories. New notes can trigger updates to the contextual representations of older notes — memory evolves rather than being immutable. Strength: the only system in this list that explicitly models memory evolution. Weakness: research-grade, fewer production deployments.

**Generative Agents (Park et al., 2023)** — not a framework but the canonical paper. Memory stream of natural-language records; retrieval scored by **`relevance × recency × importance`**; **reflections** are higher-level memories synthesized from lower-level ones and stored back into the stream. Every modern memory system either uses this scoring formula or argues with it.

**Titans (Google, Jan 2025)** — neural-network-internal memory, distinct from the database-style frameworks above. Surprise-based gating: memory updates are gradient-driven; surprising inputs (high gradient w.r.t. the network) get written, expected inputs do not. Three variants (MAC / MAG / MAL) for combining short-term attention, long-term neural memory, and persistent task parameters. Cited here as the architectural alternative to "memory as a database" — but for product engineers, the database-style frameworks above are still the practical choice.

Citations: [Anthropic memory tool](https://docs.claude.com/en/docs/agents-and-tools/tool-use/memory-tool); [OpenAI memory FAQ](https://help.openai.com/en/articles/8590148-memory-faq); [Mem0 paper](https://arxiv.org/html/2504.19413v1); [Letta MemGPT](https://github.com/cpacker/MemGPT); [Zep paper](https://arxiv.org/abs/2501.13956); [Graphiti](https://github.com/getzep/graphiti); [LangMem](https://langchain-ai.github.io/langmem/); [LangChain Memory for agents](https://blog.langchain.com/memory-for-agents/); [A-MEM paper](https://arxiv.org/abs/2502.12110); [Generative Agents](https://arxiv.org/abs/2304.03442); [Google Titans](https://research.google/blog/titans-miras-helping-ai-have-long-term-memory/).

## 4. Write Policy

Three orthogonal questions: **when** to write, **what** to write, **how** to reconcile.

### When — Hot Path vs. Background

LangChain's blog frames this most cleanly. **Hot path** writes happen synchronously during the user-facing turn. The agent uses a tool like `create_manage_memory_tool` to commit a fact immediately. Pros: low-latency-to-effect, the agent reasons about what to remember. Cons: every turn pays the latency, agent prompt has to know about memory tools, a memory bug raises the agent's failure rate.

**Background** writes happen asynchronously after the turn (or batched at session end). A separate worker takes the raw turn and runs extraction/reconciliation. Pros: zero turn-latency, separation of concerns, richer extraction. Cons: writes can lag user expectations, harder to debug "I just told it that and it didn't remember."

The mature stance is **both, with a small explicit hot-path channel for "remember this verbatim" signals and a richer background channel for everything else**. Anyaa should default to background for the bulk of extraction and use a thin hot-path tool only for explicit user statements.

### What — Extraction and Salience

Indiscriminate writes pollute the store. A salience step turns conversation into structured memory candidates. Mem0's two-phase pipeline is the canonical implementation:

1. **Extraction phase** — given a conversation summary plus recent messages, an LLM call returns a list of *candidate facts*.
2. **Update phase** — for each candidate, find semantically similar existing memories and let the LLM choose **ADD / UPDATE / DELETE / NOOP** as a tool call. The reconciler is also an LLM, with the existing-memory neighborhood as input.

The salience LLM is the *highest-leverage* prompt in the system. Tune it carefully: it controls what gets written, and a sloppy extractor permanently shapes the store. Park 2023 also adds an **importance** rating at write time (1–10), used later in retrieval — worth borrowing.

### How — Reconcile-on-Write

Append-only is not a memory system. Every write must answer: does this **add** new information, **update** existing information, **delete** information now contradicted, or **noop** (the candidate is already represented)? Mem0's four ops are the practical default. For products that need to reason temporally about *when* a fact was true — not just whether it is true now — graduate to Zep's bi-temporal model: instead of deleting an obsolete fact, mark it `valid_until = now`. Past states stay queryable.

Citations: [LangChain Memory for agents](https://blog.langchain.com/memory-for-agents/); [Mem0 paper](https://arxiv.org/html/2504.19413v1); [Park 2023](https://arxiv.org/abs/2304.03442).

## 5. Reconciliation

Expand on **how**. The four ops in detail:

- **ADD** — no semantically equivalent memory exists. Create a new record.
- **UPDATE** — an existing memory is mostly correct but the candidate adds information. Edit in place, preserve `created_at`, bump `updated_at`.
- **DELETE** (or **SUPERSEDE**) — an existing memory is contradicted. In a flat store, delete it. In a bi-temporal store, set `t_invalid = now` so the old fact is queryable but no longer current. Default to supersede over delete unless storage cost demands otherwise.
- **NOOP** — the candidate is already represented. Skip the write.

**Bi-temporal model (Zep, Graphiti).** Each memory edge stores four timestamps:

- `t_created` — when the system learned the fact.
- `t_expired` — when the system retired the fact.
- `t_valid` — when the fact became true *in the world*.
- `t_invalid` — when the fact stopped being true in the world.

The split between system-time and world-time matters because they diverge. A user might tell the agent on 2026-04-29 that they became vegan on 2026-04-01. The system-time is now, the world-time is a month ago. Querying "were they vegan in early April?" requires the world-time. Most products do not need this rigor, but if your product reasons about historical state (insurance, finance, medical, audit), build bi-temporal from day one.

**Tie-breakers.** When the LLM-as-reconciler is unsure whether two memories conflict, use:
1. Explicit user statements over model-extracted ones (provenance > inference).
2. Higher confidence over lower.
3. More recent over older (recency).
4. Higher importance over lower.

Citations: [Zep paper §3.2 Edge invalidation](https://arxiv.org/html/2501.13956v1); [Graphiti README](https://github.com/getzep/graphiti); [Mem0 paper §3 Update Phase](https://arxiv.org/html/2504.19413v1).

## 6. Temporal Handling

The single most preventable failure mode in long-running memory.

**Resolve relative time at ingest.** Anything in the user's text that is relative — "this week", "today", "tomorrow", "for summer", "starting next Monday" — is resolved to absolute dates by the extractor *before* the candidate fact is stored. The stored fact reads `valid_from: 2026-04-29, valid_until: 2026-05-05`, never "this week". This is non-negotiable.

**Every memory has a validity window.** Default to `indefinite` only when the extractor has positive evidence the fact is durable. A user saying "I'm vegan" is durable; "I want light dinners this week" is bounded. The extractor LLM should be prompted to assign a default TTL by category — preferences indefinite, weekly intents 7 days, daily intents 1 day, one-shot requests immediate.

**Decay.** Even durable facts can age out. Park 2023 multiplies the relevance score by an exponential recency term. Choose a decay constant that makes a 30-day-old memory rank ~0.5 of a fresh one for typical use. For preferences, decay should be much slower or off.

**The Anyaa worked example.** The stored memory `"This week, dinners should be light and liquid-based"` violates two rules: relative time was not resolved, and no validity window was set. The fix at ingest time:

```
candidate_fact: {
  type: "preference_episodic",          // a one-week intent, not a forever rule
  scope: { user_id, household_id },     // not per-family-member; whole household
  text: "Dinners should be light and liquid-based.",
  valid_from: "2026-04-22",             // resolved from "this week" at write time
  valid_until: "2026-04-28",
  created_in_session: "...",
  source: "user_explicit",
  confidence: 0.95,
  importance: 5
}
```

Once `valid_until` passes, retrieval excludes this memory automatically. No drift. No eternal-truth bug.

Citations: [Park 2023 §A.1 Retrieval](https://arxiv.org/abs/2304.03442); [Zep §3 Bi-temporal model](https://arxiv.org/html/2501.13956v1); [Drew Breunig — How Long Contexts Fail](https://www.dbreunig.com/2025/06/22/how-contexts-fail-and-how-to-fix-them.html).

## 7. Read Policy

Three patterns:

- **Always-load.** All memories injected into every prompt. Cheap to implement, fine for small stores (< ~50 entries), pollutes context as the store grows. This is what `CLAUDE.md` does. It works because users are forced to keep `CLAUDE.md` small.
- **Retrieve-on-demand.** A retrieval step at the top of each turn pulls the top-k relevant memories. Standard RAG-style. Default for vector stores. Risk: similarity-only retrieval misses important-but-distant memories.
- **Tool-call-to-recall.** The agent decides when to look something up via a tool call. The agent prompt has to be smart enough to know when to call the tool. Letta/MemGPT's model.

For the retrieve-on-demand case, the canonical scoring is **Park 2023's `relevance × recency × importance`**. Simple weighted combination, three terms, all 0–1 normalized. The system that uses this beats systems that use any one term alone (LongMemEval results bear this out).

**Abstention on contradiction.** When the retrieved set contains contradictory memories, prefer abstention or asking the user over silently choosing one. Track contradiction counts as a metric — they are a signal that reconciliation is failing upstream.

### Retrieval Pre-Step vs. Memory-as-Tool

These are two different read architectures, not two names for the same thing, and the choice is a real design decision:

- **Fixed retrieval pre-step.** A retrieval call runs at the top of every turn, before the model reasons about whether it needs anything. This is the standard RAG-style shape described above. Its defining cost: **you pay the retrieval call on every turn regardless of need.** A turn that is pure small talk pays the same vector-search latency and token cost as a turn that genuinely needs a recalled fact. The upside is predictability — retrieval always happens, so there is no failure mode where the model simply forgets to look something up.
- **Memory as a callable tool.** Memory operations (recall, and often write, update, or delete) are exposed as tool calls the model invokes mid-reasoning, the way it would invoke any other tool. Anthropic's memory tool (`view` / `create` / `str_replace` / `insert` / `delete` / `rename` over a file-backed `/memories` path) and Letta/MemGPT's archival-memory tool calls are the two clearest production examples. The defining property: **the agent decides whether a given turn needs memory at all**, and pays the retrieval cost only when it does. The cost moves from "every turn, unconditionally" to "only when the agent's own reasoning surfaces a need" — which is cheaper in aggregate for workloads where most turns don't need recall, but is only as reliable as the agent's judgment about when to call the tool. A model that under-calls the memory tool silently behaves as if it has less memory than it does; nothing forces the call the way a pre-step forces retrieval.
- **Choosing between them.** Favor a fixed pre-step when most turns genuinely need memory context, or when missed recall is unacceptable (compliance, safety-critical preference lookups) and cannot depend on the model choosing to look. Favor memory-as-tool when recall need is sparse and turn-dependent, when the memory store is large enough that blind retrieval on every turn is wasteful, or when the memory tool's own protocol (e.g. Anthropic's automatically-injected memory-protocol system prompt) is strong enough to make the model reliably check before answering. The two are not mutually exclusive — a thin always-on pre-step for a small set of pinned/critical facts, plus a tool-call path for the long tail, is a common and defensible hybrid.

## 8. Scope and Addressability

Per-user scope is the lazy default. Most household and team products need finer scope.

**Scope dimensions.** A real product's memory is addressed by a tuple, not a single user_id:

- `user_id` — the account holder. Always present.
- `entity_id` — the *subject* of the memory. For Anyaa this is `family_member_id`; for a project tool it is `project_id`; for a smart-home app it is `room_id` or `device_id`.
- `household_id` / `org_id` — shared scope above the user.
- `session_id` — when memory should be session-scoped (rare for long-term).
- `application_id` — when one user spans multiple products and you do not want bleed.

**The Anyaa-class failure mode.** Storing "prefers vegan" against `user_id` instead of `family_member_id` means dad's preferences contaminate the kids' lunches. The fix is not just adding the column — it is teaching the extractor to identify the entity at write time. Prompt the extractor with the household roster and require it to assign each candidate fact to a specific entity (or to `household` if it applies to all).

**Cross-scope leakage.** Audit retrieval to ensure a query for entity A never returns memories scoped to entity B. This is the same containment principle as multi-tenant RBAC — and the same incident class. Simon Willison's "Half Moon Bay" anecdote is exactly this failure: ChatGPT's memory had no scope dimension that separated work-context from pet-photo-context.

Citations: [Simon Willison on context collapse](https://simonwillison.net/2025/May/21/chatgpt-new-memory/); [LangGraph store namespaces](https://docs.langchain.com/oss/python/langgraph/memory).

## 9. Eviction

Memory without eviction is noise. Lesson 13 says it; this section operationalizes it.

**Three eviction strategies, often combined:**

- **TTL / validity-window expiry.** The cheapest. Already implied by §6 — when `valid_until` passes, the memory is dead. Background job sweeps and either deletes (flat store) or marks `t_expired` (bi-temporal store).
- **Decay-based eviction.** When `recency × importance` drops below a threshold for a configured period, evict. Park 2023 uses this implicitly via retrieval scoring; an eviction job uses the same formula offline.
- **Capacity-based eviction.** Cap the store at N entries per scope, evict lowest-scored when over capacity. Used by Letta for in-context core memory, by mobile apps with storage budgets.

**Reflection / summarization.** The Generative Agents paper introduces *reflection*: when a cluster of episodic memories shares a theme, the agent synthesizes a higher-level memory and (optionally) prunes the originals. Effective for collapsing long episodic histories without losing meaning. Schedule reflection as a background job; never do it on the hot path.

**User-initiated eviction.** First-class: every memory must be deletable by the user via UI in one click. The audit trail records the deletion; the entry is gone or soft-deleted depending on storage choice.

Citations: [Generative Agents §3 Reflection](https://arxiv.org/abs/2304.03442); SKILL.md Lesson 13.

## 10. Failure Modes

Drew Breunig's *How Long Contexts Fail* (2025-06-22) names four; subsequent practitioner writing names two more. All six show up in long-running memory systems.

- **Context Poisoning** — a hallucination or scrape error enters memory and is repeatedly retrieved as truth. Defense: provenance fields and trust boundaries (§5 of the checklist). This is also a **security** finding — co-file with the Agent Security dimension. **The single-agent version of this finding is not the whole story.** When memory is file-backed and shared across multiple agents — a common shape for managed-agent runtimes, where agents read a common memory directory or store — a poisoned write is no longer contained to the agent that made it. One agent's write becomes another agent's trusted input the moment it is read back, which turns memory poisoning into a **lateral-movement vector** across agent boundaries rather than a single agent's self-inflicted error. A trust-boundary defense scoped to "validate what this agent writes" does not cover "validate what this agent reads that some other agent wrote" — that is a second, separate boundary and needs its own provenance/quarantine treatment.
- **Context Distraction** — context grows so large the model defaults to repeating prior behavior rather than reasoning fresh. The Gemini 2.5 Pokémon agent past 100k tokens is the canonical example. Defense: eviction.
- **Context Confusion** — irrelevant retrieved memories drag response quality down. Defense: better retrieval scoring, lower top-k.
- **Context Clash** — newly retrieved info conflicts with older info still in context. Defense: reconcile-on-write, abstention on contradiction.
- **Context Collapse** (Simon Willison's term) — boundaries between life-contexts erode because memory has no scope dimension. Defense: per-entity scoping (§8).
- **Memory Drift / Temporal Drift** (kore.ai's framing) — rules that were once valid keep governing decisions long after they should have stopped. Anyaa's "this week" → forever-rule failure is exactly this. Defense: validity windows (§6).

**Real incidents to anchor the analysis.**

- *OpenAI silent memory destruction, February 2025.* Backend memory architecture update destroyed user data at scale; users only noticed because the model started behaving as if it had forgotten them. Lesson: opacity makes recovery impossible — audit logs and user-visible memory listings are not optional.
- *Simon Willison's dog photo, May 2025.* ChatGPT added a "Half Moon Bay" sign to a Cleo-in-pelican-costume image because Half Moon Bay was in his memory from work conversations. Lesson: scope is a containment problem; per-user is too coarse.
- *Drew Breunig's Gemini Pokémon agent.* Past 100k tokens, the agent looped on prior actions instead of synthesizing new plans. Lesson: more memory is not better memory.

Citations: [Drew Breunig — How Long Contexts Fail](https://www.dbreunig.com/2025/06/22/how-contexts-fail-and-how-to-fix-them.html); [Drew Breunig — How to Fix Your Context](https://www.dbreunig.com/2025/06/26/how-to-fix-your-context.html); [Simon Willison ChatGPT dossier](https://simonwillison.net/2025/May/21/chatgpt-new-memory/); [Kore.ai — Memory drift in AI agents](https://www.kore.ai/blog/memory-drift-in-ai-agents); [allaboutai.com — silent memory crisis](https://www.allaboutai.com/ai-news/why-openai-wont-talk-about-chatgpt-silent-memory-crisis/).

## 11. Evaluation

Memory systems regress silently. Without an eval suite, regressions land and nobody notices until users complain. Two benchmarks define the floor:

**LongMemEval** (Wu et al., ICLR 2025). 500 manually-constructed questions probing five core memory abilities:

1. **Information extraction** — can the system pull a fact out of a single past session?
2. **Multi-session reasoning** — can it combine facts across sessions?
3. **Temporal reasoning** — can it answer "when did I…" or "what was true on…"?
4. **Knowledge updates** — when a fact changes, does the system update *and* surface the change?
5. **Abstention** — when the answer is not in memory, does the system say so?

Knowledge updates and abstention are the two most-failed abilities in the original benchmark. They are also the two abilities most relevant to Anyaa (preferences change; the system should not invent unstored facts).

**LoCoMo** (Maharana et al. 2024). Multi-modal long-term dialogue benchmark. 35-session dialogues, ~9k tokens each, four reasoning categories (single-hop, multi-hop, open-domain, temporal). Use it to stress the retrieval and reconciliation paths over realistic conversation lengths.

**Building an in-house eval.** Even a small in-house eval beats no eval. For Anyaa: 30 fixture conversations, each ~5 sessions long, exercising the five LongMemEval abilities against actual family-member preferences. Run on every PR that touches memory. Track recall@1, abstention precision, and update-detection rate as the three primary metrics.

Citations: [LongMemEval paper](https://arxiv.org/pdf/2410.10813); [LoCoMo](https://snap-research.github.io/locomo/); [MemBench](https://aclanthology.org/2025.findings-acl.989.pdf).

## 12. Anti-Patterns

A short, harsh list. Each is something a real production system has shipped and regretted.

- **Flat append-only memory.** The Anyaa starting state. Every contradiction stays forever; every relative-time phrase becomes an eternal rule. This is not a memory system — it is a log waiting to rot.
- **Building a custom long-term memory layer when off-the-shelf would do.** Mem0, Zep, LangMem, Anthropic memory tool, Letta — these solve the same general problems. Custom layers tend to ship the easy parts (write, read) and skip the hard parts (reconcile, evict, evaluate). If you build custom, build the hard parts first.
- **Storing relative time verbatim.** "This week", "today", "tomorrow", "for summer" stored as the literal user text. Always resolves to absolute timestamps at ingest.
- **User-only scope when entities matter.** Per-user memory in a product where the actual subjects are entities under the user (family members, projects, devices). Mom's diet contaminates the kids' meals. Add the entity dimension or the system is wrong.
- **Eviction as an afterthought.** Designing storage first and pruning later. Pruning rules tend to be retrofitted poorly because by the time you need them, the store is already polluted. Design the eviction rule on day one, even if the rule is "we keep everything indefinitely" — that is a deliberate choice with a known cost.
- **Memory writes from untrusted sources.** Anything the model says, anything a tool returns, anything a user-facing channel emits — all of it can become an injection vector if written to memory without provenance. Long-term memory is the highest-value injection target because a single poison persists across all future sessions.
- **Memory as a black box.** No view UI, no edit, no delete, no audit log. Users cannot trust what they cannot see; operators cannot recover what they cannot inspect. The OpenAI February 2025 incident is the cautionary tale.
- **Memory without an eval.** No regression suite means regressions ship silently. At minimum, run LongMemEval-style fixtures against the actual memory layer on every PR.

## 13. Citations and Further Reading

Inline citations above. A consolidated list for skimming:

- Anthropic. *Memory tool* (beta `context-management-2025-06-27`, Sept 2025). https://docs.claude.com/en/docs/agents-and-tools/tool-use/memory-tool
- Anthropic. *Effective context engineering for AI agents.* https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- Anthropic. *Managing context on the Claude Developer Platform.* https://www.anthropic.com/news/context-management
- OpenAI. *Memory and new controls for ChatGPT.* https://openai.com/index/memory-and-new-controls-for-chatgpt/
- OpenAI. *Memory FAQ.* https://help.openai.com/en/articles/8590148-memory-faq
- Park et al. *Generative Agents: Interactive Simulacra of Human Behavior* (UIST 2023). https://arxiv.org/abs/2304.03442
- Sumers et al. *CoALA: Cognitive Architectures for Language Agents.* https://arxiv.org/abs/2309.02427
- Mem0. *Building Production-Ready AI Agents with Scalable Long-Term Memory.* https://arxiv.org/html/2504.19413v1
- Zep. *A Temporal Knowledge Graph Architecture for Agent Memory.* https://arxiv.org/abs/2501.13956
- Xu et al. *A-Mem: Agentic Memory for LLM Agents* (NeurIPS 2025). https://arxiv.org/abs/2502.12110
- Behrouz et al. *Titans: Learning to Memorize at Test Time* (Google, Jan 2025). https://arxiv.org/abs/2501.00663
- Wu et al. *LongMemEval* (ICLR 2025). https://arxiv.org/pdf/2410.10813
- Maharana et al. *LoCoMo: Evaluating Very Long-Term Conversational Memory.* https://snap-research.github.io/locomo/
- LangChain. *Memory for agents.* https://blog.langchain.com/memory-for-agents/
- LangMem SDK. https://langchain-ai.github.io/langmem/
- Drew Breunig. *How Long Contexts Fail* (2025-06-22). https://www.dbreunig.com/2025/06/22/how-contexts-fail-and-how-to-fix-them.html
- Drew Breunig. *How to Fix Your Context* (2025-06-26). https://www.dbreunig.com/2025/06/26/how-to-fix-your-context.html
- Simon Willison. *I really don't like ChatGPT's new memory dossier* (2025-05-21). https://simonwillison.net/2025/May/21/chatgpt-new-memory/
- Kore.ai. *Memory drift in AI agents.* https://www.kore.ai/blog/memory-drift-in-ai-agents
