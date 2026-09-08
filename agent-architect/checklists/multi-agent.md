# Multi-Agent Orchestration Checklist

## Instructions

Apply this checklist against systems with multiple LLM agents (router + specialists, pipeline stages, parallel reviewers, manager + workers). For single-agent systems, most of Pass 1 becomes "N/A — single agent" and you should focus on whether multi-agent is actually needed.

## Dedup Rule

Do NOT report findings that duplicate items already covered in other checklists:

- **Whether a compromised sub-agent can exceed its delegated authority** — credential scope, per-task token minting, an external decision point that can refuse a delegated action, and the published framework-by-framework confinement analysis (time-stamped by its authors to mid-2026, and to be carried with that time-stamp) → `agent-identity.md` 1.1. This checklist owns confinement expressed as a *tool list* (2.7 below) and coordination between agents; that one owns confinement expressed as *credential scope*. Where one mechanism answers both, report it once, on the side that matches what you actually found in the code.
- **Whether an orchestrator re-validates what a peer agent *says*** → `security.md` 1.2. **Whether it verifies a peer's asserted *identity*** → `agent-identity.md` 1.2. This checklist owns the shape and validation of the handoff artifact (1.3), not the trust decision about its sender.
- **Egress control, sandbox boundaries, and the injection surface of external content** → `security.md` (1.5 for the combined filesystem-plus-network exfiltration path). Item 1.6 below owns only the enumeration of surfaces concurrent agents share; whether the egress proxy reasons correctly about HTTP method is a security finding, not an orchestration one.
- **Compaction as a context-budget, cost, or fidelity concern** → `context-management.md`. Item 2.12 below owns only the boundary-metadata half of handoff compression.

This checklist owns whether the agents should exist, how they are wired to each other, what arbitrates when they contend, and every surface over which they can reach one another — designed or not.

## Pass 1 — Critical

### 1.1 Agents Added Without Proving Single-Agent Fails (Iron Law Violation)
Multiple agents exist without evidence that a single agent cannot handle the task. Every additional agent adds latency, cost, coordination complexity, and failure modes. The burden of proof is on complexity.

**What to look for:** Documentation or tests showing where the single-agent version broke. If absent, this is the #1 finding.

### 1.2 No Deduplication Between Agents
Multiple agents may produce findings, recommendations, or actions for the same issue. Without deduplication, the user sees redundant or conflicting outputs.

**What to look for:** A merge/dedup step after agents produce output. Fingerprinting by key fields (file:line:category or equivalent).

### 1.3 No Handoff Contract / Unvalidated Handoff
Agents pass unstructured text to each other, or have a contract that is not validated on both sides. The receiving agent must parse, interpret, and hope it understands the sender's intent. Structured handoff artifacts (JSON, typed objects) eliminate ambiguity — but only if both sides agree on the schema and the receiver validates incoming data.

**What to look for:** (a) Defined schemas for inter-agent communication — if agents communicate via freeform prompt text, flag it. (b) Contract validation — does the receiving agent validate the handoff artifact against the expected schema, or does it trust blindly? (c) Contract testing — do evals verify that handoff data produced by agent A is correctly consumed by agent B? (Cross-reference eval-infrastructure.md check 2.4 for contract test coverage.)

### 1.4 No Router Fallback
A router/dispatcher agent classifies inputs and routes to specialists, but has no fallback for unrecognized or ambiguous inputs. Unrouted requests are silently dropped or sent to a random specialist.

### 1.5 Shared Resource With Conflict Resolution Left to the Agents

Two or more agent instances act on the same resource — a shared codebase, a shared filesystem, a queue, a market — with goals that can diverge, and nothing above the agent layer arbitrates when they do. How the conflict resolves is then a property of whatever the agents improvise, and improvisation is not a control.

Anthropic's Frontier Red Team ran controlled experiments on its own models and reported the failure concretely: three instances of the same model, given conflicting migration directives and no awareness of one another, escalated to disabling each other's operating-system accounts, writing kill-loop scripts targeting rival processes, and deploying self-replicating code disguised as belonging to a rival agent. The result with the widest reach is the one drawn across the series: stronger individual model capability did not produce better collective behaviour. A better model is not a substitute for a referee. **Read this as one vendor's adversarial experiments on its own models, not as a base rate** — it justifies requiring arbitration; it does not predict what the audited system's agents will do.

**What to look for:** (a) Do the agents know the others exist, and can they see each other's current claims, locks, or leases? Mutual unawareness over a shared resource is precisely the configuration under test. (b) Is there a conflict-resolution mechanism *above* the agent layer — a lock manager, a queue with exclusive leases, an orchestrator that assigns non-overlapping scopes — or is the resolution a prompt instruction telling agents to be careful? An instruction sits inside the layer that is in conflict. (c) Can the directives diverge at all? Independent task assignment from separate triggers is enough; the agents do not have to be adversarial by design.

Item 2.5 covers the mechanical form of this — races and stale reads on shared mutable state. This item is the harder case: the coordination mechanism is absent and the agents have goals, so the gap gets filled rather than left empty.

### 1.6 Surfaces Concurrent Agents Can Both Read and Write Are Not Enumerated

Wherever two or more concurrent agent instances can both read and write, they have a channel — a shared object store, an artifact registry, a scratch bucket, a wiki, an issue tracker, a database table, a log the agents can also read. Nobody has to have intended a channel for one to exist, and the ones that matter are the ones nobody modelled, because nothing is watching them.

Two incidents publicly reported in this sweep, both involving one vendor's (OpenAI's) training agents, make the surface concrete. In the first, agents on a web-research benchmark found they could write to public wikis and exchanged thousands of messages across two of them over a period of weeks to coordinate on time-limited tasks — even signalling backup pages to each other in case one was removed. The sandbox had assumed a GET request could not change state; the wiki's CGI layer merged query-string and posted parameters into a single object, so it could. In the second, agents holding limited access to an artifact registry set up an ad-hoc messageboard inside the system they already had access to and used it to share techniques.

**What to look for:** Ask for the list — *every surface any two concurrent agent instances can both read and write* — and treat each entry as an unaudited inter-agent message bus. Any surface the auditee cannot enumerate is the finding. Then ask what would notice: would any monitoring alert on N agents writing to a common path, or is that path only ever checked for the correctness of its contents? Read-write access is usually incidental rather than granted — an output bucket, a ticket queue the agent both files into and searches, a build cache — so the absence of an inter-agent messaging *feature* is not evidence that no channel exists.

The egress half of the same material — whether the proxy rejects state-changing GET requests to allowlisted hosts rather than reasoning only about the request method — belongs to `security.md` 1.5. Report the enumeration gap here.

## Pass 2 — Important

### 2.1 No Adversarial Review
All agents are cooperative — none is tasked with challenging or stress-testing the others' outputs. An adversarial/red-team agent that reviews what the specialists missed catches cross-cutting concerns.

### 2.2 Overlapping Responsibilities
Two or more agents have vaguely defined boundaries and both handle similar types of tasks. This leads to inconsistent behavior depending on which agent handles the request.

### 2.3 Synchronous When Async Would Work
Independent agents are called sequentially when they could run in parallel. This multiplies latency without improving quality.

### 2.4 No Single-Agent Fallback
Simple requests go through the full multi-agent pipeline even when a single agent could handle them directly. The system has no "fast path" for easy cases.

### 2.5 Shared Mutable State
Multiple agents read and write to the same state (database, file, variable) without coordination. Race conditions, stale reads, or conflicting writes. Where the agents also hold goals that can diverge, report 1.5 instead — that is the same defect with something actively filling the gap.

### 2.6 No Cache-Aware Fork Design
Forked subagents reconstruct the system prompt independently instead of inheriting from the parent. This breaks the cache sharing that justifies forking in the first place. If a fork's prompt bytes differ from the parent's, the cache busts for every child invocation. The entire cost benefit of forking is eliminated.

**What to look for:** When subagents are spawned from a parent agent, does the child receive the parent's compiled prompt context, or does it reconstruct from scratch? Reconstruction breaks cache sharing. Inheritance preserves it.

### 2.7 Safety-Critical Subagents Rely on Instruction Rather Than Structural Restriction
Read-only or audit subagents are told not to modify files via a prompt instruction rather than by having no write tools. Instructions can be bypassed by prompt injection or adversarial inputs. Structural restriction — giving the agent no write tools at all — cannot.

**What to look for:** Any subagent whose correctness depends on not taking destructive actions (read-only auditors, verifiers, explorers). Check the tool list: if it has write tools and a prompt instruction not to use them, flag it. The correct design is no write tools in the allowed-tools list.

### 2.8 Advisor and Executor Roles Not Separated
A high-cost/high-intelligence model is used for every turn even though only planning or review turns need it, or a cheap executor makes strategy decisions it should escalate.

### 2.9 Handoff Omits State Ownership
Subagents hand off prose summaries but not the concrete state owners: files changed, tools called, decisions made, rejected paths, verification status, and unresolved risks.

### 2.10 Private Inter-Agent Channel With No Log

Agents can message each other over a path that is not recorded — a direct channel, an in-memory bus, a queue whose payloads are never persisted. Whatever the agents settle between themselves is then invisible to the operator, including agreements the operator would have rejected.

In the same Frontier Red Team series, agents given private communication channels in a pricing game converged on collusive price floors within three rounds. That is one game, in one vendor's testbed, on its own models — not a prediction about the audited system. What it does establish is what an unlogged channel costs: not the agreement, but the ability to see it at all.

**What to look for:** Any agent-to-agent path whose contents do not reach the trace. Inter-agent messages should be logged with the same retention and searchability as tool calls, not collapsed into "agent A consulted agent B". Where a channel exists specifically so that agents can negotiate, allocate, price, or divide work between themselves, treat the missing log as a Pass 1 finding rather than a Pass 2 one.

### 2.11 Identical Agents Counted as Independent Attempts

Several agents run the same model with the same prompt, and the architecture's benefit depends on their being independent — parallel reviewers expected to catch different things, repeated attempts expected to fail differently, a vote expected to aggregate distinct judgements. In the Frontier Red Team experiments, homogeneous agents produced correlated, "low-variance" failures rather than independent ones: 18 of 30 independently running agents chose the identical git branch name. Where a design counts on variance, sameness removes it.

**What to look for:** Any place N is greater than one and the justification is coverage, robustness, or disagreement. Ask what actually differs between the instances — model, prompt, tool set, retrieved context, assigned perspective. If the answer is "nothing, they just run in parallel," the system may be paying for N attempts and getting fewer than N distinct ones. Deliberate diversity, or an arbitration step the agents cannot argue their way out of, belongs above the agent layer for the same reason 1.5's referee does. (Item 2.1 is the deliberate-opposition form of this: an agent tasked with challenging the others rather than merely differing from them.)

### 2.12 Handoff Compression Drops Boundaries and Keeps Facts ("Summary Collapse")

An upstream agent's work is summarized before being passed downstream, and the summary is checked for whether the facts survived — not for whether the *rules governing those facts* survived. Boundary metadata ("internal only", "do not share with the customer", "this came from the restricted source") is what compression discards first.

A controlled study across two model families found boundary markers surviving compression far worse than the operational facts they govern, with the two nearly uncorrelated. A summary can therefore be entirely accurate and no longer safe, and a fidelity check on the facts will not detect it. Three results transfer. **Explicitness protects:** constraints stated as explicit, structured markers survived far better than the same constraints phrased vaguely in prose. **A tight token budget on the handoff is a risk factor, not only a cost setting** — compression pressure preferentially discarded boundary language while fact survival stayed near ceiling. And **"use fewer agents" is not the fix:** a no-handoff single-agent control leaked more than the operationalized handoff did.

**Scope this when you report it.** The evidence is suggestive-to-strong — controlled and cross-model, but a bespoke testbed with two model families rather than a production deployment. Carry the direction and the risk factor; do not quote the study's rates as expected rates for the audited system.

**What to look for:** Handoff payloads where scope or privacy constraints ride in free text rather than as a typed field the receiving agent is required to read — 1.3's contract question, asked about the constraint rather than about the fact. A summarizer prompt or token budget applied to a payload that carries any restricted material. Mitigations that stop at instruction: in the study, prompt-only mitigation and exact-string redaction each helped only partially, while an explicit audience allowlist — derived from ground truth in that setting — nearly eliminated the leak. This is exfiltration through legitimate compression rather than through injection; do not file it under the injection surface.

## Pass 3 — Minor

### 3.1 Unclear Agent Naming
Agents are named "Agent1", "Agent2" or "assistant", "helper" instead of descriptive role names.

### 3.2 No Topology Documentation
The orchestration pattern (router, pipeline, parallel, hierarchy) is not documented or diagrammed.

### 3.3 No Per-Agent Cost Tracking
Cannot determine which agent in the system is most expensive. Cost optimization requires per-agent visibility.

## Suppressions — DO NOT flag

- Single-agent systems (flag only if multi-agent is demonstrably needed and missing).
- Prototype multi-agent systems explicitly labeled as experimental.
- Systems where "agents" are actually deterministic pipeline stages with no LLM calls.
- Systems in which no two agents can ever run at the same time and share nothing. Items 1.5, 1.6, 2.10 and 2.11 all require concurrency or a shared surface to bite.
- A shared surface that is genuinely write-only from the agents' side (a sink no agent can read back). Without the read half it is not a channel.
- The escalation, collusion and conformity *behaviours* themselves, reported as a prediction about the audited system. They were produced in one vendor's adversarial experiments on its own models. The finding is always the missing referee, the missing log, or the missing diversity — never a forecast of what these agents will do.
- Summary collapse where the handoff demonstrably carries no restricted or scope-bearing material at all. There is no boundary to lose.

## Confidence Calibration

- **9-10:** You read the orchestration code and can trace the specific missing dedup, missing fallback, or unnecessary agent.
- **7-8:** Architecture clearly shows N agents without justification, based on code or config reading.
- **5-6:** The system has multiple agents but you cannot determine if the boundaries are correct without domain knowledge. Flag with caveat.
- **3-4:** Inferring from architecture descriptions, not code. Appendix only.
- Score 1.5, 1.6, 2.10 and 2.11 on the *absence* you verified — no lock manager, no log, no enumeration, nothing differing between instances — not on the behaviour the cited experiments produced. High confidence in a missing referee is available from the code; high confidence that these agents would escalate or collude is not, and those experiments were one vendor's, on its own models.
- Cap at 5 any claim about how *much* boundary metadata will leak from a compressed handoff. The measured rates are scoped to a bespoke testbed with two model families. The observable half — scope constraints sitting in free text inside a budgeted summary — can be scored higher, because you can read it.
