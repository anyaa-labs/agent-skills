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

### 1.7 Tool Result Cannot Be Used Without Copying Large Payloads
The tool returns or requires a large intermediate payload that the model must copy into another tool call. The tool layer should pass references, file paths, handles, or filtered summaries instead.

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

### 2.7 MCP Tool Annotations Treated as Trusted
The system relies on MCP annotations, descriptions, or server-provided hints as trusted policy even when they come from untrusted or unverified servers.

### 2.8 No Tool Search or Discovery Interface for Large Tool Sets
The agent has more than 50 possible tools but no `search_tools`, tool categories, progressive disclosure, or filesystem API index.

### 2.9 Tool Search or Programmatic Tool Calling Available but Not Used for a Large Static Surface
The runtime/provider offers a tool search mechanism (deferred tool definitions, resolved by name/regex/semantic search at call time rather than loaded into context up front) or a programmatic tool-calling path (the model invokes tools from inside a code-execution step rather than round-tripping every call through the conversation), and the system's tool loadout is large or static enough to benefit, but the harness still sends every tool definition into context on every turn and drives every call through the model directly. These are both recognized tool-loadout strategies alongside router tools, filesystem/code-mode APIs, and manual selection — not an exotic optimization to bolt on later once things get slow.

**What to look for:** A tool count or combined tool-definition token size that clears the platform's own stated threshold for enabling search (context bloat past several thousand tokens of definitions, or accuracy degradation past a few dozen tools), with no deferred-loading flag set on any tool and no evidence the harness calls a search/discovery tool before selecting. Repetitive, high-volume, or loop-driven tool calls (e.g., iterating a tool over a list, chaining several tool outputs into the next tool's input) that round-trip through the model on every single invocation when a programmatic/code-execution calling path is available and would let the model orchestrate the loop without a model round trip per step. The fix is not a new tool — it's turning on the loadout mechanism the provider already exposes.

### 2.10 Mid-Call Input or Confirmation Handling Assumes a Server-Initiated Callback
A tool's contract for "I need something more from the caller before I can finish" — confirming a destructive action, collecting a missing parameter, eliciting a credential — is built around the server pausing mid-call and issuing its own request back to the client, rather than returning a distinct "not finished, here is what I still need" result that the caller recognizes and retries with the missing input supplied as an argument. Under a plain request/response contract where the server cannot call back into the client mid-request, that confirmation or elicitation step simply never arrives: the tool call either hangs waiting for a callback that is never coming, or completes without ever collecting the input it needed. This is the same idea as 1.3 (error responses that guide self-correction) applied to the "not finished yet" case instead of the failure case: the caller needs a result shape it can act on, not silence or a hang.

**What to look for:** Tool or server code that issues its own outbound request to the caller partway through handling a call (a roots/sampling/elicitation-style callback initiated by the server) instead of returning a typed "needs more input" result and expecting to be re-invoked with the answer supplied as a parameter. A calling harness whose result handling only branches on success/error, with no case for "this call is not finished — retry it with the additional input." A confirmation or elicitation flow implemented as a blocking wait inside the tool handler for an out-of-band signal, instead of the tool returning control to the caller between rounds and letting the caller decide when and how to supply the answer.

### 2.11 Agent-to-Agent and Agent-to-Tool Boundaries Collapsed into One Layer

The system has two structurally different boundaries — delegating work to another *agent*, and calling a *tool* — and implements both through the same harness mechanism, typically by registering a remote agent as just another entry in the tool registry. The two protocol families that have grown up around these boundaries (A2A for agent-to-agent interoperability and delegation, MCP for agent-to-tool and agent-to-data connectivity) now sit under one neutral governance body, which describes them as complementary layers of the same stack rather than as competing options. Conflating them at the harness layer is a documented anti-pattern, not a matter of taste.

The distinction is load-bearing for tool design because a tool and an agent make different promises. A tool has a fixed surface: the parameters it accepts and the result it returns are the whole contract. An agent behind the same registry entry has its own model, its own reasoning, and its own tool surface — the caller sees one tool, the callee is a whole system. Result handling written for tools (schema-check and continue) is the wrong shape for output that another model produced.

**The sharpest form of the collapse: an agent exposed as an MCP server.** Frameworks now ship a call that serves an agent over the tool protocol, so one process is simultaneously a tool client and a tool server. Unless the exported surface is explicitly narrowed, every tool that agent holds becomes reachable, recursively, by whatever calls it — the caller's blast radius silently becomes the union of its own tools and the callee's. This is the tool-surface-scoping question, and it has to be answered at the point of export, not assumed from the fact that the inner agent was scoped correctly for its own use.

**What to look for:** A remote agent registered alongside ordinary tools in the same registry, with the same trust tier, the same timeout policy, and the same result handling. A framework call that serves an agent over the tool protocol (`to_mcp_server` or equivalent) with no explicit allowlist narrowing the exported tool set, and no test asserting which tools are visible from outside. Documentation or a diagram that draws one undifferentiated "integrations" edge covering both peer agents and tools. Nested exposure — an agent-as-server whose own tool list contains another agent-as-server — with no bound on the depth. *(Cross-reference: whether a peer agent's *declared identity and capabilities* are verified before it is trusted — unsigned Agent Card acceptance is an injection and spoofing surface — belongs to `agent-identity.md` 1.2, which owns it; do not restate it here. Whether the orchestrator re-validates what a peer agent *says* is `security.md` 1.2. Whether the resulting permission set exceeds the task is `security.md` 2.2.)*

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
