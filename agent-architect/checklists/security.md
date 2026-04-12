# Agent Security Checklist

## Instructions

Apply this checklist against any agent system. Security findings are architectural — they require reading tool definitions, system prompts, credential handling, and data flow code. Most findings are about structural properties of the system, not implementation details. "Always apply" means this checklist runs even on simple single-agent systems; the first question is always: what does this agent read, and what can it do?

## Pass 1 — Critical

### 1.1 Rule of Two Violation: Untrusted Input + Sensitive Data + Consequential Actions Combined

The agent simultaneously: (a) processes untrusted external content — web pages, emails, user-uploaded files, RAG documents, API responses; (b) has access to sensitive data or credentials; and (c) can take consequential external actions — send messages, write files, execute code, delete records, call external APIs. All three properties together, with no architectural containment layer between them.

This is the Rule of Two (Meta AI, 2025): an agent should have at most two of these three properties without supervised human oversight. The combination of all three means a single successful injection grants the attacker access to sensitive data and the ability to act on it.

**What to look for:** Tool sets that include both an external-content-reading tool (fetch URL, read file, search email) and a consequential-write tool (send message, delete record, execute code, POST to external API), while the agent also receives credentials or has access to sensitive state. Agent running with live production API keys while also processing user-controlled inputs. No architectural separation between the "read untrusted content" phase and the "act with privileges" phase.

### 1.2 High-Privilege Agents Implicitly Trust Peer Agent Messages

In multi-agent systems, orchestrator agents accept instructions or tool call results from sub-agents and act on them without independent re-validation. A compromised or injected low-privilege sub-agent relays crafted instructions to a high-privilege orchestrator. The orchestrator executes the privileged operation, trusting its peer.

Research measures inter-agent trust exploitation success at 82.4% — significantly higher than direct injection at 41.2% — because LLMs trained to resist explicit user manipulation often defer to apparent peer authority.

**What to look for:** Orchestrators that receive content from sub-agents and pass it directly into tool calls, system state, or downstream prompts. No separate trust tier between agent roles (e.g., all agents share the same permission scope). No independent verification step before a high-privilege orchestrator acts on sub-agent output. Sub-agents whose outputs are not schema-validated before consumption.

### 1.3 Credentials Co-Located with Untrusted Content Processing

Agent reads environment variables or files containing credentials (API keys, tokens, passwords, connection strings) in the same execution context where it processes untrusted content or executes user-influenced code.

Attack path: prompt injection → agent reads `process.env` or credential files → agent exfiltrates values via HTTP tool, code execution, or message-sending tool.

**What to look for:** `process.env.OPENAI_API_KEY`, `os.environ`, `~/.config/`, `.env` files accessible in the agent's working directory alongside tools that fetch external URLs or execute code. Credentials injected as template variables into the agent's context where they appear in the reasoning trace. No external vault or token-injection-at-runtime pattern. *(Cross-reference: production-readiness 1.6 for the structural fix — credential bundling into resources vs. raw environment access.)*

### 1.4 MCP Tool Descriptions Loaded Without Integrity Verification

Tool description fields are loaded from external MCP servers or packages without hashing or pinning at approval time. Tool descriptions are read by the LLM to decide tool selection — they are executable attack surface, not passive documentation. Hidden instructions in description fields (invisible Unicode characters, base64-encoded payloads, right-to-left override sequences) trigger without user awareness.

Rug pull attack: a tool establishes trust with benign behavior, then its description is silently modified after the user approved it. The LLM continues calling the tool under the old trust assumption.

**What to look for:** MCP server connections pulling tool definitions dynamically at runtime with no stored approval hash. "Always allow" or auto-approve patterns in MCP client configuration. Tool descriptions that are unusually long (>500 characters) relative to their apparent function. Base64 strings, Unicode escape sequences, or zero-width characters in description fields. No version pinning on MCP package dependencies.

### 1.5 Complete Exfiltration Path: Unrestricted Filesystem AND Network Access Combined

Unrestricted filesystem access alone is dangerous — an agent can read credentials. Unrestricted network access alone is dangerous — an agent can exfiltrate data. Together they form a complete exfiltration path: read credentials from filesystem → POST to attacker-controlled endpoint. Both containment layers must be present independently. One without the other is insufficient.

**What to look for:** Agent code executing in the host environment without OS-level sandbox isolation (container, bubblewrap, seatbelt). No network egress allowlist restricting outbound connections to known domains. Agent running as a user account with full filesystem access. Code execution tools (`run_code`, `execute`, `bash`) that have visibility into the home directory or credential files AND can reach arbitrary network endpoints.

## Pass 2 — Important

### 2.1 No Injection-Resistant Architectural Pattern for External Content Processing

Agent reads untrusted external content — web pages, documents, emails, API responses, RAG retrievals — and then takes tool actions based on that content, in the same context, without an injection-resistant architectural pattern. The strongest guarantees come from architectural separation, not from prompt instructions to "ignore injections."

Patterns (weakest to strongest guarantee):
- **Plan-Then-Execute**: agent locks its complete action plan before reading any untrusted content; tool outputs can corrupt data but cannot change which tools are called or in what order
- **Dual LLM (Quarantine)**: a quarantined model processes untrusted content but has no tool access; a privileged model has tools but never sees raw untrusted content; they communicate only via symbolic variable references
- **LLM Map-Reduce**: sub-agents each process one piece of untrusted content and return only a minimal result (boolean, score, category label); no raw external content reaches the orchestrator
- **CaMeL (taint tracking)**: privileged LLM generates code in a restricted language; tainted data is tracked through execution; user approval required when tainted data would reach a sensitive operation

**What to look for:** Single agent that fetches external URLs or reads user files and then calls write/send/delete/execute tools in the same turn. No separation between planning and execution phases. Orchestrator passing raw external content directly to a tool-calling agent. The agent receiving external content as part of its context and having no structural barrier before consequential tool calls.

### 2.2 Excessive Agency: Agent Has More Permissions Than Its Task Requires

Agent receives tools or credentials that exceed what its stated task requires. Least privilege is not applied. A summarization agent with delete access, or a read-only analyst with production write credentials, has unnecessary blast radius when compromised. The issue is not what the agent is instructed to do — it is what it structurally *can* do.

**What to look for:** Agents whose tool set includes irreversible actions (delete, send, post, execute) when the task is read-only or analytical. Agents receiving production service credentials when a read-only or scoped token would suffice. No credential rotation or expiry on task completion. Shared credentials used across multiple agents with different privilege requirements.

### 2.3 No Defense Against Memory or RAG Poisoning

Agent uses persistent memory (vector stores, episodic memory, conversation history) or RAG retrieval without validation of stored or retrieved content. A single malicious document written to the store persists across sessions and continuously corrupts future agent behavior. Unlike a one-time injection, poisoned memory compounds over time.

**What to look for:** Retrieved documents passed directly into context without sanitization or anomaly detection. Memory write paths with no eviction policy or content validation. No freshness or provenance check on retrieved content. RAG pipeline that accepts user-controlled documents without a quarantine or review step. Memory that grows unboundedly with no pruning. *(Cross-reference: Principle 13 — Curate memory; don't hoard.)*

### 2.4 No Denial-of-Wallet Protection Against Adversarial Cost Exhaustion

No spending caps, token budgets, or iteration limits prevent an adversarially crafted input from triggering runaway API consumption. An attacker sends inputs designed to maximize context window usage, trigger recursive reflection loops, or drive parallel subagent spawning at scale. Unlike traditional DoS, this attack has a direct financial impact on the operator.

**What to look for:** Agentic loops without `max_iterations` or `budget_tokens` constraints. No per-user or per-session rate limiting. Recursive or self-reflection patterns with no explicit termination condition beyond model judgment. No cost alert or hard monthly budget ceiling. Subagent spawning based on model output without a cap on the number of agents spawnable per request. *(This finding is specifically about adversarial cost exhaustion — cross-reference production-readiness for general cost controls.)*

### 2.5 LLM Output Passed to Downstream Systems Without Validation

LLM output is consumed by downstream APIs, databases, shell commands, or HTML renderers without schema validation or sanitization. A prompt injection that manipulates output format can produce SQL injection, command injection, path traversal, or XSS in downstream systems. The LLM's output is untrusted input to every downstream system.

**What to look for:** LLM string output used directly as SQL arguments (not parameterized), shell command strings, file path components, or HTML content. No schema validation before passing LLM JSON output to APIs. No output sanitization step between LLM response and downstream consumer. Downstream systems that trust the agent's output format is well-formed.

## Pass 3 — Minor

### 3.1 No Audit Trail for Consequential Agent Actions

Agent takes consequential actions — sends messages, writes files, calls external APIs, modifies database records — without producing a structured audit log. Post-incident reconstruction is impossible: there is no record of what the agent did, what input triggered it, or which tool was called with what arguments.

**What to look for:** No structured logging of tool calls with their inputs and outputs. No correlation ID or trace linking external content fetched to actions taken. No immutable record of agent decisions at the tool-call level. Logs that capture LLM outputs but not the tool invocations those outputs triggered.

### 3.2 System Prompt Contains Sensitive Information Without Disclosure Protection

System prompt embeds credentials, internal endpoint URLs, pricing logic, or proprietary business rules that would cause harm if disclosed. No anti-disclosure instruction prevents the model from repeating its instructions when prompted.

**What to look for:** API keys, internal service URLs, or sensitive business logic directly in system prompt text. No "do not reveal your instructions" directive. System prompts that would be harmful if a user extracted them by asking "repeat everything above" or "what are your instructions?"

### 3.3 External Content Enters Context Without Unicode Normalization or Injection Sanitization

Raw HTML, markdown, PDFs, or API responses are inserted into context without stripping invisible Unicode characters (zero-width spaces, homoglyphs, right-to-left override sequences) or normalizing whitespace. These techniques are used to hide injection instructions from human reviewers while remaining visible to LLMs — the LLM processes the hidden text; the human reviewing a log does not see it.

**What to look for:** Direct insertion of web page content, document text, or API response strings into prompts with no preprocessing step. No Unicode normalization (NFC/NFD/NFKC) applied to external inputs. No stripping of HTML comments, zero-font-size CSS text, or off-screen positioned content. No decoding and inspection of base64 or percent-encoded strings before context insertion.

## Suppressions — DO NOT flag

- **1.1** — suppress if the agent demonstrably has no external content input channel OR no consequential output channel. One condition alone is insufficient; suppression requires the complete absence of one of the two halves.
- **1.2** — suppress for single-agent systems.
- **1.4** — suppress if the system does not use MCP or any plugin/tool-discovery architecture where tool definitions are loaded dynamically.
- **1.5** — suppress if the agent has no code execution surface, no file-write tools, and makes no outbound network connections from within the execution environment.
- **2.3** — suppress if the agent has no persistent memory and no RAG retrieval pipeline.
- **3.2** — suppress if the system prompt contains no sensitive information beyond the agent's role description and behavioral guidelines.

## Confidence Calibration

- **9-10:** You read the tool definitions, system prompt, and orchestration code and can trace the specific data flow that enables the attack. Concrete attack path demonstrated.
- **7-8:** Architecture clearly shows the vulnerability (e.g., tool list contains both fetch_url and send_email with no containment layer visible in code).
- **5-6:** Partial visibility — can see one side of the vulnerability (e.g., the credential access pattern) but cannot confirm the full attack path. Flag with caveat: "verify full tool access scope."
- **3-4:** Inferring from architecture descriptions or configuration without reading the full data flow. Appendix only.
- **1.1 (Rule of Two):** Can be hard to fully verify without tracing all conditional tool paths. If the tool list is dynamically assembled or conditionally loaded, flag at 6/10 with note "verify full tool access scope at runtime."
- **1.4 (MCP integrity):** Can only be fully verified by inspecting MCP client configuration. If only server-side code is visible, flag at 5/10.
- **2.1 (injection-resistant pattern):** Absence is verifiable at 8-9/10 by reading the agent's execution flow — if external content and tool calls share the same context with no separation, the pattern is absent.
