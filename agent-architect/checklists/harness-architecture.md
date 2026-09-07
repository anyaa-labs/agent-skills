# Harness Architecture Checklist

## Instructions

Apply this checklist to the runtime layer around the model: agent loop, SDK/runtime choice, sandbox/workspace, state persistence, approvals, execution boundaries, artifact flow, provider transport, and recovery orchestration. Recognized runtime classes include a custom agent loop, an SDK-managed loop, a workflow graph, a sandboxed execution environment, and a **managed-agent runtime** — a pre-built, provider-hosted agent harness (model, tools, sandbox/environment, and session lifecycle bundled and operated by the provider) used instead of a self-built loop. A managed-agent runtime does not exempt a system from this checklist; it relocates several of the questions below onto the provider's side of the boundary, which is itself worth naming explicitly rather than assuming away. Read `references/harness-engineering.md` when a finding needs design justification.

## Pass 1 - Critical

### 1.1 No Runtime Boundary Map
The system does not define which layer owns planning, tool execution, filesystem state, credentials, human approval, and final artifact publication.

### 1.2 Brain and Hands Share a Credentialed Execution Boundary
Model-directed code, shell commands, browser actions, or generated scripts run in the same environment that holds production credentials or broad user tokens.

### 1.3 No Resumable Workspace or Run State
Long-running work depends on conversation history alone. There is no workspace manifest, snapshot, serialized run state, artifact directory, or resume contract.

### 1.4 Consequential Artifacts Are Consumed Without Inspection
Generated code, files, emails, database updates, browser actions, or external API payloads can flow to downstream systems without schema validation, tests, visual review, or human approval proportional to blast radius.

### 1.5 No Approval Boundary for Irreversible Actions
The harness lets the model perform irreversible or externally visible actions without a structural pause, policy check, or human approval step.

## Pass 2 - Important

### 2.1 No Initializer or Handoff Contract for Multi-Context Work
Tasks expected to span multiple context windows do not produce handoff artifacts, environment notes, task status, decisions, or verification state for the next worker.

### 2.2 Trace Is Not a First-Class Runtime Object
The system cannot reconstruct the full sequence of model turns, tool calls, approvals, state mutations, retries, and artifact validations for a request.

### 2.3 Provider Runtime Is Hard-Coded
The agent is coupled to one provider endpoint or transport even though the workflow would benefit from a separable model/runtime contract.

### 2.4 Large Tool Surfaces Loaded Directly Into Context
The harness exposes 50+ tools, multiple MCP servers, or large tool result payloads directly to the model instead of using tool search, tool loadout, filesystem-discoverable APIs, or code-mode filtering.

### 2.5 Recovery Does Not Change the Execution Conditions
Retries reuse the same model, same context, same state, and same tool path after failure. There is no pruned-context retry, model fallback, sandbox reset, or user escalation.

### 2.6 No Stated Owner for Cross-Session Preserved Context
The system carries context forward across sessions — a provider-side session/history reference, a managed-agent runtime's retained conversation state, a persisted run manifest — without a clear answer to who owns it: the harness, the provider, or an external store the harness controls. This is a distinct question from 2.1 (handoff artifacts within a task) and from the Memory Architecture dimension (durable facts/preferences) — it is specifically about *runtime* context that spans sessions and who is responsible for its correctness once it does.

**What to look for:** Reliance on a provider-managed session/history identifier to carry context across sessions with no local record of what that identifier resolves to, no policy for when it expires or is invalidated server-side, and no plan for what happens when the harness's assumption about that state diverges from what the provider actually retained. No answer to: if the preserved context is stale or wrong (the provider expired it, truncated it, or a resumed session picks up a different snapshot than expected), does the harness detect that, and what does it do? Treat "the provider handles it" as an answer only if the harness can name the provider's stated retention/expiry contract — an unstated assumption about provider-side retention is itself the finding.

## Pass 3 - Minor

### 3.1 No Workspace Manifest Conventions
The workspace has no standard input, output, log, scratch, and artifact paths for agents to use.

### 3.2 No Runtime Capability Inventory
There is no local document listing which provider/runtime capabilities are available: hosted tools, sandbox, MCP, background tasks, voice sessions, structured output, or reasoning summaries.

### 3.3 No Harness Expiry Notes
Model-compensating harness code is not marked with the model capability or provider release that should trigger re-evaluation.

## Suppressions - DO NOT flag

- Single-turn agents with no tools, no filesystem, no external state, and no consequential side effects.
- Internal prototypes where the operator is the only user and the task cannot mutate external systems.
- Deterministic non-LLM workflows wrapped in an agent UI where the model does not control execution.

## Confidence Calibration

- **9-10:** You read the runtime code/config and can point to the missing boundary, state, or approval mechanism.
- **7-8:** The architecture clearly has long-running execution or tool actions but no visible harness contract.
- **5-6:** Runtime code is partially visible; flag with a verification caveat.
- **3-4:** Inferring from docs only; appendix unless the blast radius is critical.
