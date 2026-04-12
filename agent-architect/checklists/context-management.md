# Context Management Checklist

## Instructions

Apply this checklist against how the agent system manages its context window — what goes in, how much, when it resets, and what gets prioritized. Examine system prompts, retrieval pipelines, conversation history management, and context assembly code.

## Pass 1 — Critical

### 1.1 No Token Budget
No explicit calculation or enforcement of token limits. The system assembles context without knowing whether it fits in the window. This leads to silent truncation (the model never sees the end of the context) or API errors.

**What to look for:** Code or documentation that calculates token counts before sending to the model. Absence of this is a critical gap.

### 1.2 Full-File Context Dumps
Entire files, documents, or database tables are loaded into context without selection. A 2000-line file where only 50 lines are relevant wastes 97.5% of the context budget.

**What to look for:** `read_file` or equivalent that loads complete files. Check if there is any filtering, chunking, or relevance selection downstream.

### 1.3 RAG Without Relevance Threshold
Retrieval-augmented generation returns top-K results without a minimum relevance score. Low-relevance chunks inject noise that degrades reasoning. The agent cannot distinguish "highly relevant context" from "vaguely related text."

**What to look for:** Vector search with only a `limit` parameter and no `min_score` or `threshold` parameter.

### 1.4 No Reset Strategy for Long Tasks
Long-running agent sessions accumulate context indefinitely with no checkpoint or reset mechanism. After 50+ turns, the model's attention to early instructions degrades significantly.

**What to look for:** Any mechanism for context resets — periodic summarization, checkpoint-and-restart, structured handoff artifacts, or conversation compaction.

### 1.5 No Explicit Cache Boundary
System prompt is treated as monolithic — no static/dynamic split. Every call recomputes the full prompt. Tool description text edits (77% of cache busts in production) flush the entire shared cache with no isolation. For high-volume systems, this is a direct cost multiplier.

**What to look for:** Any mechanism for separating stable content (tool schemas, system identity, behavioral rules) from per-call dynamic content (session state, date, user context). Absence of this distinction means every tool description edit is paid in full on the next call.

## Pass 2 — Important

### 2.1 "Just in Case" Context
Context includes information "the agent might need" rather than information the agent demonstrably uses. Each "just in case" addition degrades attention to the content that matters.

### 2.2 No Prioritization
All context is treated as equally important. System instructions, retrieved documents, and conversation history compete for attention without explicit ordering or emphasis.

**What to look for:** System prompt at the beginning (highest attention), most important context near the beginning and end (primacy/recency effects), less important context in the middle.

### 2.3 Unbounded Conversation History
Full conversation history is passed to every call with no truncation, summarization, or sliding window. A 200-turn conversation has 190 turns of irrelevant history.

### 2.4 Duplicate Retrieved Context
The same passage or information is retrieved multiple times (from overlapping chunks, multiple queries, or redundant sources) without deduplication.

### 2.5 Static Context for Dynamic Tasks
Context is assembled once at the start and never updated. For multi-step tasks, the agent works with stale information.

### 2.6 No Phase-Aware Compaction
The conversation has natural phase boundaries (discovery, planning, execution, confirmation) where context needs shift, but these boundaries are not used for compaction. Context from completed phases remains at full fidelity, competing for attention with the current phase.

**What to look for:** Identify conversation phases — do information needs change between them? After a user confirms a plan, are the raw discovery results (search outputs, candidate lists, rejected options) still in context at full size? Phase transitions are natural compaction points: summarize completed phases into their decisions and discard the reasoning artifacts.

### 2.7 No Memory Tier Design for Persistent Agents
For agents intended to run across multiple sessions or maintain long-running state: no cross-session persistence, no eviction policy, no consolidation pass. In-session state only. Memory either grows unbounded or resets completely on session end. Neither is acceptable for agents that accumulate context over time.

**What to look for:** Any mechanism for persisting agent state between sessions (files, databases), with an eviction or summarization strategy to prevent unbounded growth. For long-running agents, "save everything" and "reset every session" are both wrong — what is needed is structured accumulation with selective pruning.

## Pass 3 — Minor

### 3.1 Compressible System Prompt
The system prompt contains verbose explanations that could be compressed without losing meaning. "Please note that you should always make sure to carefully consider..." → "Always consider..."

### 3.2 Overlong Few-Shot Examples
Few-shot examples are longer than necessary. Trim to the minimum that demonstrates the pattern.

### 3.3 No Context Observability
No logging or metrics on context size, composition, or token usage per call. Cannot diagnose context-related issues without visibility.

## Suppressions — DO NOT flag

- Systems with small, bounded context (e.g., single-turn chatbots with <2K token prompts).
- RAG systems where all retrieved content is human-curated and guaranteed relevant.
- Prototype systems where context optimization is explicitly deferred.

## Confidence Calibration

- **9-10:** You found code that assembles context and can measure the token waste or missing budget.
- **7-8:** Architecture clearly has no reset mechanism or dumps full files, based on code reading.
- **5-6:** Context management exists but you cannot determine if it is effective without runtime data.
- **3-4:** Inferring from architecture diagrams or descriptions, not code. Appendix only.
