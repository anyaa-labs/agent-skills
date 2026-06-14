# Multi-Agent Orchestration Checklist

## Instructions

Apply this checklist against systems with multiple LLM agents (router + specialists, pipeline stages, parallel reviewers, manager + workers). For single-agent systems, most of Pass 1 becomes "N/A — single agent" and you should focus on whether multi-agent is actually needed.

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
Multiple agents read and write to the same state (database, file, variable) without coordination. Race conditions, stale reads, or conflicting writes.

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

## Confidence Calibration

- **9-10:** You read the orchestration code and can trace the specific missing dedup, missing fallback, or unnecessary agent.
- **7-8:** Architecture clearly shows N agents without justification, based on code or config reading.
- **5-6:** The system has multiple agents but you cannot determine if the boundaries are correct without domain knowledge. Flag with caveat.
- **3-4:** Inferring from architecture descriptions, not code. Appendix only.
