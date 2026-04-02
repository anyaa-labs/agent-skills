# Prompt Architecture Checklist

## Instructions

Apply this checklist against system prompts, skill files, and agent instructions. Be specific — cite file:line and quote the problematic text. Skip anything that is fine. Only flag real problems.

## Pass 1 — Critical

These cause production failures or fundamentally broken agent behavior.

### 1.1 Missing Iron Law
The prompt has no single, non-negotiable behavioral constraint. Every production agent needs ONE rule that overrides all other instructions — the thing the agent must never violate regardless of context. Without it, the agent drifts toward its default behavior (usually: be helpful and agreeable) which conflicts with task-specific requirements.

**What to look for:** A bolded or emphasized rule near the top of the prompt that constrains the agent's deepest instinct. Not a list of 10 rules — one rule.

**Example of good:** "NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST."
**Example of bad:** "Follow these guidelines: be thorough, be accurate, be helpful..."

### 1.2 No Stop Conditions
The prompt does not define when the agent should stop working. Without explicit stop conditions, agents either (a) stop too early out of caution or (b) loop forever. Both explicit "stop when" AND "never stop for" lists are needed.

**What to look for:** An explicit list of conditions that halt the agent AND conditions that should NOT halt it (false stops).

### 1.3 No Output Format Specification
The agent's output is freeform when it should be structured. Structured output templates serve as checklists — the agent must complete the work to fill in the blanks.

**What to look for:** A literal template the agent must fill (ASCII table, markdown structure, JSON schema). Not just "be organized" — a concrete format.

### 1.4 Prompt Exceeds 8K Tokens Without Justification
System prompt is over ~8K tokens without evidence that the length is necessary. Long prompts suffer from "context rot" — the model's attention to instructions degrades with length. The first 2K tokens of a well-crafted prompt are worth more than the next 20K of "helpful context."

**Measurement:** Count approximate tokens (words × 1.3). If over 8K, check whether each section earns its tokens.

### 1.5 Generic Persona
Persona is "You are a helpful assistant" or similar generic framing. The persona should define the specific role, experience level, and behavioral stance that constrains how the agent approaches every decision.

**What to look for:** A persona that names specific experience ("you have shipped production agent systems"), specific stance ("you think in failure modes first"), and specific behavioral constraints.

## Pass 2 — Important

These degrade quality but may not cause outright failures.

### 2.1 No Anti-Persona
The prompt defines what the agent IS but not what it must NEVER become. Without anti-persona rules, the agent defaults to sycophancy, hedging, and vagueness. Effective anti-personas provide specific BAD/GOOD substitution pairs.

**What to look for:** A table or list of "never say X, instead say Y" substitutions targeting the model's natural defaults (agreement, hedging, vagueness).

### 2.2 No Escalation Ladder
The prompt has no defined progression from autonomous work to asking for help. Without it, agents either never ask (and silently fail) or ask about everything (and annoy the user).

**What to look for:** Explicit thresholds that trigger user questions (e.g., "after 3 failed attempts, STOP and ask").

### 2.3 Implicit Gates
Decision points are implied rather than explicit. The agent must infer when to stop, when to ask, when to proceed. This leads to inconsistent behavior across runs.

**What to look for:** Explicit "STOP" instructions at decision points. "If X, STOP and ask. If Y, proceed silently."

### 2.4 Conflicting Instructions
The prompt says both "be concise" and "be thorough" (or similar contradictions) without specifying which takes priority in which context.

### 2.5 No Few-Shot Examples for Complex Output
When the output format is non-trivial (multi-field JSON, structured reports, code with specific patterns), the prompt lacks examples of correct output.

## Pass 3 — Minor

Nice-to-have improvements.

### 3.1 Zero-Indexed Lists
Lists in the prompt use 0-indexing. LLMs reliably produce 1-indexed output regardless, causing off-by-one mismatches.

### 3.2 Tool List Mismatch
Tools mentioned in the prompt text don't match the tools actually wired to the agent.

### 3.3 Redundant Instructions
The same rule is stated 3+ different ways, wasting tokens without improving compliance.

## Suppressions — DO NOT flag

- Long prompts where length is justified by genuine domain complexity (legal, medical, regulatory).
- Absence of anti-persona in simple single-turn agents (the pattern matters for agentic loops, not one-shot calls).
- Missing escalation ladder in fully autonomous batch processing agents (no user to escalate to).
- Generic persona in throwaway prototypes explicitly labeled as such.

## Confidence Calibration

- **9-10:** You read the prompt and can point to the specific missing section or problematic line.
- **7-8:** Pattern match against known anti-patterns. Very likely correct.
- **5-6:** The prompt is ambiguous — it might have the feature but it is unclear. Flag with caveat.
- **3-4:** You are inferring based on prompt structure, not specific evidence. Appendix only.
