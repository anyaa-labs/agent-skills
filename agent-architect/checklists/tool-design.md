# Tool Design Checklist

## Instructions

Apply this checklist against tool definitions, function schemas, and API specifications exposed to agents. Be specific — cite the tool name and the problematic field. Skip anything that is fine.

## Pass 1 — Critical

### 1.1 Empty or Single-Sentence Description
Tool description is missing or a single generic sentence like "Updates the record." Descriptions should read like documentation for a smart junior developer who has never seen the codebase — including WHEN to use it, what each parameter means, edge cases, and relationships to other tools.

### 1.2 Full-Record Returns
Tool returns entire database records (20+ fields) when the agent only needs 2-3 fields to make its decision. Every extra field burns tokens and confuses reasoning. Tool responses should contain only fields that change the agent's next action.

### 1.3 No Error Response Format / Error Messages Don't Guide Self-Correction
Tool has no defined error response, or error responses do not guide the agent toward self-correction. The agent cannot distinguish success from failure, leading to silent errors, hallucinated recovery, or blind retries with the same bad input.

**What to look for:** Error responses that include (a) what went wrong in terms the agent can act on, (b) whether the agent should retry, (c) recovery hints with the correct format or valid values. Compare: `"400 Bad Request"` (agent retries blindly) vs `"Expected ISO date YYYY-MM-DD, got '12/25/2025'. Use YYYY-MM-DD format."` (agent self-corrects). If the error message does not change what the agent does next, it is useless.

### 1.4 Misleading Tool Name
Tool name implies a different action than what the tool actually does. `update_user` that also deletes related records, or `get_status` that mutates state.

### 1.5 Unsandboxed Code Execution
`execute_sql`, `run_code`, `eval`, or similar tools exposed without sandboxing, input validation, or scope constraints. The agent can execute arbitrary operations.

### 1.6 Tool I/O Mismatched to Agent Decision
The tool's input/output shape does not match the agent's actual decision. The agent must hold intermediate state, reconstruct full objects, or do cognitive work that the tool layer should handle.

**What to look for:** (a) Tool requires a complete object when the agent only wants to change one field (e.g., `update_slot(full_slot_dict)` when the agent just wants to swap a dish — should be `swap_dish_in_slot(date, slot, old_dish, new_dish)`). (b) Tool returns raw data the agent must transform before acting on it. (c) Agent needs multiple tool calls for what is conceptually one decision. The test: describe what the agent is deciding in one sentence, then check if the tool call matches that sentence.

## Pass 2 — Important

### 2.1 No Parameter Constraints
Parameters lack type constraints, enums, or valid ranges. The agent must guess valid values, leading to trial-and-error tool calls.

### 2.2 Multi-Action Tools
A single tool performs both read and write operations (e.g., `manage_user` that can GET, UPDATE, and DELETE). Separate tools for separate actions reduce error rates.

### 2.3 Missing "When to Use" Guidance
Description explains WHAT the tool does but not WHEN to use it. The agent must infer from context, leading to wrong tool selection.

### 2.4 Noisy Responses
Tool responses include internal IDs, timestamps, metadata, or debug info the agent never uses. Increases token consumption without improving decisions.

### 2.5 Schema-Shaped Instead of Task-Shaped
Tools mirror the database schema (`create_user`, `create_event`, `create_notification`) instead of the agent's task (`onboard_new_customer`). Forces the agent to orchestrate multi-step sequences that could be a single tool call.

### 2.6 Description Omits Anti-Patterns and Cross-References
The description explains what the tool does but not: (a) what it must NOT do ("NEVER call this before verifying X"), (b) when to use a different tool instead ("if you need Y, use tool Z"), or (c) how this tool relates to adjacent tools. Anti-patterns and cross-references are as important as the primary description. Without them, the agent learns only the happy path.

**What to look for:** Tool descriptions that describe capabilities but not constraints, exclusions, or tool-selection guidance. The fix: encode anti-patterns as "NEVER..." rules, encode cross-references as "When X, use Y instead" clauses, and encode ordering constraints as "Only call after X" statements.

## Pass 3 — Minor

### 3.1 Inconsistent Naming
Some tools use camelCase, others snake_case. Some use verb_noun, others noun_verb.

### 3.2 Implementation Jargon
Descriptions use internal terms ("updates the JSONB column") instead of task-oriented language ("changes the customer's preferences").

### 3.3 Missing Idempotency Information
No indication of whether calling the tool twice with the same parameters is safe or destructive.

## Suppressions — DO NOT flag

- Internal tools used only by developers for debugging (not agent-facing).
- Tools in early prototype stage explicitly labeled as draft.
- Schema-shaped tools where the agent genuinely needs fine-grained control (e.g., data migration agents).

## Confidence Calibration

- **9-10:** You read the tool schema and can point to the specific problematic field or missing section.
- **7-8:** The tool follows a known anti-pattern (e.g., returns 500 rows, has no description).
- **5-6:** The tool might be fine for the specific agent context but looks wrong in general. Flag with caveat.
- **3-4:** You are inferring the tool is poorly designed based on naming alone. Appendix only.
