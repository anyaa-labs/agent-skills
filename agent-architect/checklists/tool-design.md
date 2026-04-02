# Tool Design Checklist

## Instructions

Apply this checklist against tool definitions, function schemas, and API specifications exposed to agents. Be specific — cite the tool name and the problematic field. Skip anything that is fine.

## Pass 1 — Critical

### 1.1 Empty or Single-Sentence Description
Tool description is missing or a single generic sentence like "Updates the record." Descriptions should read like documentation for a smart junior developer who has never seen the codebase — including WHEN to use it, what each parameter means, edge cases, and relationships to other tools.

### 1.2 Full-Record Returns
Tool returns entire database records (20+ fields) when the agent only needs 2-3 fields to make its decision. Every extra field burns tokens and confuses reasoning. Tool responses should contain only fields that change the agent's next action.

### 1.3 No Error Response Format
Tool has no defined error response. The agent cannot distinguish success from failure, leading to silent errors or hallucinated recovery.

**What to look for:** Error responses that include (a) what went wrong, (b) whether the agent should retry, and (c) any recovery hints.

### 1.4 Misleading Tool Name
Tool name implies a different action than what the tool actually does. `update_user` that also deletes related records, or `get_status` that mutates state.

### 1.5 Unsandboxed Code Execution
`execute_sql`, `run_code`, `eval`, or similar tools exposed without sandboxing, input validation, or scope constraints. The agent can execute arbitrary operations.

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
