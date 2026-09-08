# Agent Security Checklist

## Instructions

Apply this checklist against any agent system. Security findings are architectural — they require reading tool definitions, system prompts, credential handling, and data flow code. Most findings are about structural properties of the system, not implementation details. "Always apply" means this checklist runs even on simple single-agent systems; the first question is always: what does this agent read, and what can it do?

## Pass 1 — Critical

### 1.1 Rule of Two Violation: Untrusted Input + Sensitive Data + Consequential Actions Combined

The agent simultaneously: (a) processes untrusted external content — web pages, emails, user-uploaded files, RAG documents, API responses; (b) has access to sensitive data or credentials; and (c) can take consequential external actions — send messages, write files, execute code, delete records, call external APIs. All three properties together, with no architectural containment layer between them.

This is the Rule of Two (Meta AI, 2025): an agent should have at most two of these three properties without supervised human oversight. The combination of all three means a single successful injection grants the attacker access to sensitive data and the ability to act on it. Note what "supervised human oversight" has to mean to relax the rule: supervision that demonstrably discriminates, per 2.8. A per-action approval prompt that is granted as a matter of routine does not restore the missing third constraint, and a system whose only answer to this finding is "a human approves each action" has not been shown to satisfy the Rule of Two.

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

### 1.6 Untrusted Data Can Influence Control Flow
Untrusted retrieved content, external documents, media, or peer-agent output can change which tools are called, which recipients receive data, or which external actions are taken.

### 1.7 MCP Authorization or Token Audience Not Verified
HTTP MCP servers or remote tools use OAuth-style authorization but the client/server does not verify audience/resource binding or per-server token scope. The current protocol-level authorization hardening adds three checks worth verifying explicitly, none of which are optional hygiene: (a) the client validates the authorization server's declared issuer identifier against the one it recorded before redeeming an authorization code, rather than trusting whatever issuer value comes back; (b) client credentials are bound to and stored keyed by the issuing authorization server, never reused against a different authorization server; and (c) dynamic client registration is treated as a legacy fallback, not the primary path — a client that only knows how to dynamically register may silently fail or mis-register against a server that expects pre-registered client metadata. A server or client that skips issuer validation, or that reuses one authorization server's credentials against another, has the same practical exposure as skipping audience verification altogether: a token minted for one trust context gets accepted in another.

### 1.8 MCP Extensions Treated as Trusted Code Without Verification
The protocol's extension mechanism (an opt-in, negotiated capability beyond the core protocol — long-running task handling, rich structured workflow instructions, or interactive UI elements rendered inline) is loaded and honored the same way core protocol behavior is, with no verification step of its own. An extension is code the agent's tool layer executes or renders on the model's or server's behalf — it is not passive metadata, and it should not inherit trust just because it arrived over the same connection as a verified tool list.

**What to look for:** Extension capabilities negotiated and acted on with no separate approval, pinning, or integrity check distinct from whatever check (if any) applies to ordinary tool definitions. Rendered or executed extension content (inline UI elements, workflow instructions, task-handle payloads) treated as trusted display/execution surface rather than being subject to the same untrusted-until-verified posture as tool annotations (cross-reference 1.4). An extension from an unverified or dynamically-discovered server accepted without the same integrity-hash-at-approval-time discipline applied to tool descriptions. The fix: extend whatever verification gate exists for tool definitions to cover extension capabilities explicitly — do not assume "it's part of the protocol" means "it's safe."

### 1.9 Third-Party MCP Servers Assumed Authenticated and Shell-Free

An MCP server the system connects to is integrated without independently establishing two things: that the server requires authentication at all, and whether anything in its advertised tool list runs raw shell or command execution with no capability restriction. The integration is treated as a normal dependency — added, configured, and trusted — because nothing about it looked alarming.

The base rate says start from the opposite assumption. The first published dynamic behavioral assessment of internet-discoverable MCP servers found that the large majority of the servers it actively audited had no OAuth authentication at all, and counted hundreds of tool instances exposing shell execution with no access control (figures, methodology and vintage: `references/agent-engineering-landscape-2026-09.md`). Missing authentication and unrestricted command execution are the common case in that population, not the exceptional one. So they are not edge cases to note in passing — they are the defaults an auditor should check for on every MCP integration, and their absence from a report usually means nobody looked. <!-- source-claim-ok: the source states "First dynamic behavioral security assessment of internet-facing MCP servers" -->

**Scope this correctly.** That measurement covers *internet-discoverable* servers reached through public discovery sources, and is a point-in-time snapshot of a fast-moving ecosystem, not a property of the protocol. It says nothing directly about a privately deployed or enterprise-internal server. Use it to set the prior you audit with, not as the verdict on any particular server.

**The churn half.** In the same measurement, a large fraction of confirmed servers disappeared within three days between measurement runs — deploy cycles fast enough that the thing reviewed and the thing running are frequently not the same artifact (figures, methodology and vintage: `references/agent-engineering-landscape-2026-09.md`). A one-time security review of an MCP server dependency is therefore stale almost immediately. The recommendation is a re-scanning cadence tied to the dependency, not a point-in-time sign-off recorded once and inherited forever.

**What to look for:** MCP client configuration listing remote or third-party servers with no authentication block, no credential, and no note of what authenticates the connection. Servers whose tool list includes `bash`, `exec`, `shell`, `run_command`, or an equivalent, consumed without checking what that tool is permitted to run. A threat model, ADR, or security sign-off that records an MCP integration as reviewed once, with no re-check cadence and no pinning of what was reviewed. Servers added by a developer or auto-discovered from a registry with no approval step at all. *(Cross-reference: 1.7 owns whether an authorization flow that does exist binds tokens correctly; this finding is the prior step — whether there is one. 1.4 owns the integrity of the descriptions those servers ship. `tool-design.md` 1.5 owns unsandboxed execution in the system's *own* tools; this owns it arriving through someone else's server.)*

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

*(Cross-reference: this finding owns the **tool list** — surface that exceeds the task. `agent-identity.md` owns the **credential and the decision point**: whether the authority behind those tools was scoped per delegation and whether anything outside the model can refuse its use. Report the excessive-surface half here and the credential-scope half there; do not report one defect under both.)*

### 2.3 No Defense Against Memory or RAG Poisoning

Agent uses persistent memory (vector stores, episodic memory, conversation history) or RAG retrieval without validation of stored or retrieved content. A single malicious document written to the store persists across sessions and continuously corrupts future agent behavior. Unlike a one-time injection, poisoned memory compounds over time.

**What to look for:** Retrieved documents passed directly into context without sanitization or anomaly detection. Memory write paths with no eviction policy or content validation. No freshness or provenance check on retrieved content. RAG pipeline that accepts user-controlled documents without a quarantine or review step. Memory that grows unboundedly with no pruning. *(Cross-reference: Principle 13 — Curate memory; don't hoard.)*

### 2.4 No Denial-of-Wallet Protection Against Adversarial Cost Exhaustion

No spending caps, token budgets, or iteration limits prevent an adversarially crafted input from triggering runaway API consumption. An attacker sends inputs designed to maximize context window usage, trigger recursive reflection loops, or drive parallel subagent spawning at scale. Unlike traditional DoS, this attack has a direct financial impact on the operator.

**What to look for:** Agentic loops without `max_iterations` or `budget_tokens` constraints. No per-user or per-session rate limiting. Recursive or self-reflection patterns with no explicit termination condition beyond model judgment. No cost alert or hard monthly budget ceiling. Subagent spawning based on model output without a cap on the number of agents spawnable per request. *(This finding is specifically about adversarial cost exhaustion — cross-reference production-readiness for general cost controls.)*

### 2.5 LLM Output Passed to Downstream Systems Without Validation

LLM output is consumed by downstream APIs, databases, shell commands, or HTML renderers without schema validation or sanitization. A prompt injection that manipulates output format can produce SQL injection, command injection, path traversal, or XSS in downstream systems. The LLM's output is untrusted input to every downstream system.

**What to look for:** LLM string output used directly as SQL arguments (not parameterized), shell command strings, file path components, or HTML content. No schema validation before passing LLM JSON output to APIs. No output sanitization step between LLM response and downstream consumer. Downstream systems that trust the agent's output format is well-formed.

### 2.6 No Runtime Action Interception
High-risk tool calls are not intercepted before execution for allow/warn/block/review decisions based on command, destination, data flow, and blast radius.

*(Cross-reference: this interception evaluates **action shape** — is this command dangerous given its destination and blast radius. `agent-identity.md` 1.1 evaluates a proposed action **against the delegation** — is this agent authorized for this, given what it was actually delegated. Where one broker does both jobs, report it once, under `agent-identity.md` 1.1, since the delegation-scoping half is the harder one to satisfy.)*

### 2.7 Visual or Audio Prompt Injection Surface Untested
The system accepts images, screenshots, video, audio, or transcripts but has no adversarial modality test cases or containment pattern.

### 2.8 Human Approval Gate Counted as a Control Without Evidence Approvals Discriminate
A human approval step is credited as the mitigation that makes an otherwise-unsafe capability acceptable — the escape hatch on a Rule of Two violation (1.1), the containment layer in front of an irreversible or externally visible action, the reason a broad credential or an excessive tool set (2.2) is treated as survivable — with no measurement of what the approver actually does when the prompt appears. An approval gate is a control only if approvals are sometimes refused, for reasons connected to the risk. Vendor telemetry from a large real deployment of per-action approval prompts reports near-total approval of individual tool calls, and markedly more scrutiny applied to whole plans than to the individual actions inside them: people read plans and rubber-stamp actions. Approval fatigue is the base case in this design, not an edge case. Absent evidence of discrimination, the gate is a logging and consent mechanism, not a control, and must not be scored as mitigation for any other finding.

**What to look for:** Ask for the approval telemetry the system already has or could have: approvals versus denials by prompt type, denial rate over time, time-to-decision. Concrete red flags — a threat model or design doc that resolves a risk with "the user approves this" and no measured denial rate; `alwaysAllow` / auto-approve / remember-this-decision settings in the client or MCP configuration, which convert the gate into a single past decision; a prompt that fires on nearly every tool call (frequency trains dismissal) rather than on the rare consequential one; approval requested at the individual-action level only, with no plan-level review where the consequential shape of the work is actually visible; no fallback to a stricter mode when approvals stop discriminating (a block-streak or denial-rate trigger that escalates to manual or blocked is the concrete, checkable circuit breaker here). Where the telemetry does not exist, the absence *is* the finding: report the gate as unproven and re-score any finding that was suppressed on account of it.

### 2.9 MCP Security Posture Evidenced Only by an Automated Scanner

The system's assurance that its MCP dependencies are safe rests on an automated MCP security scanner's output, and that output is treated as ground truth in both directions: a flagged server is blocked, an unflagged server is cleared, and no one triages either result. This is a finding about the reliability of the instrument, and it is worth stating plainly because it applies to the tool an auditor would themselves reach for first.

Ecosystem-scale measurement of the MCP server population found existing scanners reporting almost every server as "risky," while manual validation found fewer than half of the sampled alerts to be true positives, with substantial disagreement between different scanners on the same servers (figures, methodology and vintage: `references/agent-engineering-landscape-2026-09.md`). Carry the qualification the measurement carries: the true-positive figure comes from manual validation of a *sample* of alerts rather than from every alert in the corpus, so read it as the direction and rough magnitude of the error rate, not a precise one. That is still enough to settle the practical question — a scanner's "risky" flag is not evidence of risk, and manual triage of flagged findings is currently required rather than optional.

Note also what a near-universal flag rate means on its own terms: an alert that fires on almost every server carries almost no information about which server is actually dangerous. Ranking by it is close to ranking at random.

**Scope this when you report it.** The evidence is ecosystem-scale but scanner-alert-focused — a large measurement of what scanners flag and how often those flags hold up, not a permanent property of scanners in general or a guarantee about tools not yet built. Carry the direction and the magnitude; do not treat it as a verdict on a specific scanner you have not independently sampled.

**What to look for:** A CI gate or release check that passes or fails on a scanner's exit code with no triage record of which alerts were examined and dismissed, and why. A security review whose entire evidence for an MCP dependency is a scanner report. Reliance on a single scanner with no cross-check and no manual read of the flagged behavior. A risk register that inherits scanner severities verbatim as its own. Conversely, a server treated as cleared *because* the scanner was quiet — the same reliability problem read in the other direction. The fix is not a better scanner: it is a documented triage step between the scan and the decision, and an auditor applying the same discount to scanner output they would apply to any other unvalidated signal.

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
- **1.8** — suppress if the system does not use MCP or negotiate any extension capability beyond core tool/resource/prompt listing.
- **1.9** — suppress if the system connects to no MCP server it does not itself build and deploy. A first-party server in the same repository is audited as ordinary code; this finding is about depending on someone else's.
- **1.5** — suppress if the agent has no code execution surface, no file-write tools, and makes no outbound network connections from within the execution environment.
- **2.3** — suppress if the agent has no persistent memory and no RAG retrieval pipeline.
- **2.9** — suppress if no automated MCP security scanner is part of the system's review or CI process. Absence of a scanner is not this finding; over-trust of one is.
- **2.8** — suppress if the system has no human approval gate at all; a missing approval boundary is `harness-architecture.md` 1.5, not this finding. Also suppress where approval telemetry exists and shows a non-trivial denial rate on the prompts that matter — that is the evidence this finding asks for.
- **3.2** — suppress if the system prompt contains no sensitive information beyond the agent's role description and behavioral guidelines.

## Confidence Calibration

- **9-10:** You read the tool definitions, system prompt, and orchestration code and can trace the specific data flow that enables the attack. Concrete attack path demonstrated.
- **7-8:** Architecture clearly shows the vulnerability (e.g., tool list contains both fetch_url and send_email with no containment layer visible in code).
- **5-6:** Partial visibility — can see one side of the vulnerability (e.g., the credential access pattern) but cannot confirm the full attack path. Flag with caveat: "verify full tool access scope."
- **3-4:** Inferring from architecture descriptions or configuration without reading the full data flow. Appendix only.
- **1.1 (Rule of Two):** Can be hard to fully verify without tracing all conditional tool paths. If the tool list is dynamically assembled or conditionally loaded, flag at 6/10 with note "verify full tool access scope at runtime."
- **1.4 (MCP integrity):** Can only be fully verified by inspecting MCP client configuration. If only server-side code is visible, flag at 5/10.
- **2.1 (injection-resistant pattern):** Absence is verifiable at 8-9/10 by reading the agent's execution flow — if external content and tool calls share the same context with no separation, the pattern is absent.
