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
Generated code, files, emails, database updates, browser actions, or external API payloads can flow to downstream systems without schema validation, tests, visual review, or human approval proportional to blast radius. Human approval is the weakest of those four and the only one whose efficacy has to be demonstrated rather than assumed (`security.md` 2.8).

### 1.5 No Approval Boundary for Irreversible Actions
The harness lets the model perform irreversible or externally visible actions without a structural pause, policy check, or human approval step. When the boundary that *is* present is a human approval prompt, it counts as a control only under the evidence test in `security.md` 2.8: without evidence that approvals discriminate, treat the system as having a structural pause but not a mitigation, and prefer a policy check or structural denial for the actions whose blast radius warrants one.

### 1.6 Tool Server Assumes Implicit Session Affinity Under a Stateless Protocol
A tool-serving backend (an MCP server, or any component built against a session-oriented request model) keeps cross-call state implicitly — keyed by a connection, a transport-level session token, or a protocol session ID — instead of an explicit, caller-supplied handle. Under a stateless request model nothing guarantees the next call lands on the same process, replica, or connection: a load balancer, connection pool, restart, or replica failover can route it somewhere that never saw the earlier state. The failure is often not a loud error. The new process or a reused pooled connection can just as easily serve default/empty state as if it were the caller's own, or — with pooled connections — another caller's leftover state, so the agent gets a plausible-looking but wrong answer with no signal that context was lost or crossed a session boundary.

This is distinct from 2.6 (no stated owner for cross-session preserved context): 2.6 is about who owns state that is deliberately retained across sessions; 1.6 is about a server or tool handler that was never designed to be stateless silently depending on session affinity to function at all, within or across calls.

**What to look for:** A module-level or process-global dict/cache used as a state store, keyed by a connection object, a socket, or a session identifier the client is expected to keep supplying on a header or transport property rather than as an explicit tool argument. Deployment or infrastructure configuration that requires sticky routing (session-affinity load balancing, IP-hash routing, sticky cookies) for a "conversation" with a given tool server to keep working at all. A tool handler that reads its working state from ambient/global scope instead of accepting a handle, cursor, or continuation token as a parameter on the call itself. No code path or test for "the next call in this logical session lands on a different server process" — restart, redeploy, or failover with state held mid-flight.

### 1.7 No Escalation Channel Distinct From Failing or Working Around It
The harness gives the agent no first-class way to report "this is broken, or impossible, and I am stopping" — an exit that is neither a successful completion nor a crash. When succeed-or-fail are the only two structural outputs and the environment is defective, the agent supplies a third: hardcode the expected value, edit the failing test, fabricate the artifact and report success.

State the effect direction without hedging. In a factorial experiment across frontier models from several model families, giving the agent a structured escalation/reporting tool alongside an anti-reward-hacking policy sharply reduced reward hacking, eliminated it entirely for most of the models tested, and did so at no detectable performance cost; escalation and hacking almost never co-occurred in the same run. The measurement is scoped to coding agents working against **defective test infrastructure** — quote the effect within that scope, and treat the structural question as the part that generalises. The authors also note the behaviour has appeared outside benchmarks in a real intrusion of a production AI platform, which is why the absence is worth Pass 1 rather than a note. **Pattern 31 carries the figures; do not restate them in the report.**

**What to look for:** Enumerate the agent's tool list and ask which call *means* "I decline this task, and here is what is wrong with the environment." A system-prompt instruction to "say so if you cannot do it" is not one — the model's only structural output is still a completion, and a completion is what gets graded. Then check the channel is real end to end: where does an escalation land (a queue, a ticket, a human review channel), and does anything read it? An escalation whose output is discarded teaches the loop that escalating loses. Check the acceptance layer does not punish it — if the harness's success metric scores an escalated run identically to a crash, the incentive that produces the hardcoded output is still fully intact. Check escalation is reachable mid-task, not only as a terminal move after the turn budget is spent. Finally, check what the escalation must carry: a free-text "I gave up" is much weaker than a structured report naming the artifact, the observed behaviour, and the expected one, because only the structured form is triageable.

This is a **tool-contract gap, not a prompting gap** — the fix is a tool definition plus a receiver, not a stronger instruction. It is distinct from 2.5, which asks whether the harness changes the *execution conditions* after a failure it already noticed; 1.7 asks whether the agent can tell the harness that the environment, rather than its own attempt, is the thing that failed. It compounds 1.4: an agent that cannot escalate produces artifacts that look complete, which is exactly the input an uninspected artifact path cannot distinguish from a real one.

### 1.8 Autonomy Rung Is Unnamed, or Its Stop Condition Is Not Machine-Checkable
The system runs the agent on some rung of autonomy — a human types each turn; an evaluator checks a stated goal and continues until it is met or a cap fires; a schedule fires it; an event fires it with nobody watching — and either nobody has named which rung, or the unattended rungs run with a stop condition that only the model itself can evaluate. Naming the rung comes first, because every other question in this section is answered differently on each one.

**What to look for:** (a) **Derive the rung from the trigger, not the description.** Read what actually starts a run — a cron entry, a webhook handler, a CI hook, a repository event, a loop command with a turn budget — rather than how the system describes its own autonomy. Systems routinely describe themselves one rung below where their triggers put them. (b) **Is the stop condition machine-checkable?** A test-suite exit code, a schema validation, a threshold on a measured value, a turn cap. A completion condition graded by the same model that did the work is not a stop condition; it is the work marking its own paper. (c) **If an evaluator grades completion, is it separate?** Confirm it is a distinct call with its own context and its own criteria, not the working agent asked "are you done?" at the end of its own transcript. (d) **On the unattended rungs — scheduled and event-triggered — check for all three of a turn cap, a kill switch reachable without a deploy, and a cost ceiling that halts rather than merely alerts.** A ceiling that pages someone is not a ceiling on a loop that runs at 3am. (e) **Ask where the loop's runtime state lives.** Loop *configuration* — the trigger, the prompt, the cap — is normally in the repository and therefore auditable; loop *runtime state* — which run this is, what it already tried, what it concluded last time — frequently is not, so "we run loops" is often not reviewable from the code alone. This one comes from an exploratory mining study of open-source repositories, which found loop patterns operating in a few hundred of the tens of thousands it scanned while almost none committed the persistent state files the practice prescribes; its authors describe the work as deriving a research agenda rather than a settled empirical result, so **carry it as a question to ask, not as a base rate to cite.**

Keep the vocabulary out of the finding. The term of art for this practice has no verifiable originator — **do not credit a coiner** — and its main long-form popularizer has since walked the autonomy back, naming delegation of the *judgment* as well as the task as his own mistake. Audit the rung, the stop condition, and the caps; the label is not the artifact.

Distinct from 1.3, which asks whether a long-running task has any resumable state at all. 1.8(e) is the recurring-invocation instance: the task may resume fine within a run and still carry nothing between runs. Where neither exists, report 1.3. **Pattern 30 is the lens; this is the procedure.**

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

### 2.7 Recovery Ladder Has No State-Restore Rung
The recovery ladder runs retry, replan, and escalate, with nothing that restores the *environment*. That gap only shows when the agent damages the workspace it is working inside — deleting source it was asked to tidy, removing the interpreter or version-control binaries it needs to continue, corrupting a dependency tree — at which point retrying inside the damaged environment cannot recover and a fresh sandbox discards the work.

The concrete case comes from one infrastructure vendor's write-up: an agent asked to clean up old migrations and stale binaries ran a recursive delete that took out both the work product and its own toolchain. Their prescription is copy-on-write checkpoints taken before destructive classes of command, cheap enough to be reflexive, with restore time **measured** (they report on the order of seconds) rather than assumed. Read that as one vendor's practice and design argument, not as a measured industry base rate.

**What to look for:** Is a checkpoint taken before the destructive command classes — recursive delete, dependency reinstall, migration, schema change, force push, mass rewrite — or only at task boundaries, or not at all? Is restore time measured anywhere; an untimed restore path is an untested one, and a restore that takes twenty minutes is not a rung the loop can actually use. Is the brain/hands split real: does the orchestrator process share a filesystem with the sandbox executing agent-authored commands? If it does, a self-destructive command can take out the thing that would have restored it — report that under 1.2 and note the recovery consequence here. And check the cost shape that persistent environments introduce: they bill while idle, so verify there is a reaper or an idle-metering guarantee rather than an unbounded fleet of long-lived sandboxes nobody is counting.

2.5 asks whether recovery changes the execution conditions at all; restore is one such change and the one most often missing. 1.3 is about whether a durable *record* of the run exists; this is about whether the *environment* can be put back.

### 2.8 Self-Improving Harness Accepts Guardrails Without Verifying the Failure Occurred
Applies only where something automatically edits the agent's own scaffold — prompts, parsers, filters, guardrails — in response to observed failures: an optimizer loop, a nightly "improve the prompt" job, an eval-driven scaffold rewriter. In that setting a proposer can invent a failure that never happened and add a guardrail against it. It is neither reward hacking (no real metric improves) nor over-refusal (nothing is refused): it is scaffolding accreting around an imagined bug, and it hides because it looks exactly like diligence.

**Qualify this one carefully.** It was demonstrated in a purpose-built deterministic lab against a byte-exact oracle, not observed in a production harness, and it appeared only when three conditions coincided — a rule-shaped pattern in otherwise benign input, an open-ended rule set, and an instruction presupposing that failures exist — with removal of any one of the three eliminating the effect. Report it as a **shape to look for**, never as a prevalence, and do not attach rates to it.

**What to look for:** (a) **The acceptance rule.** Can the optimizer ever *remove* a guardrail, or does the loop only ever accept additions? Add-only acceptance is the condition under which the fabricated guardrail persisted in the lab even after the presupposing instruction was withdrawn. (b) **Ground truth before fix.** Is the optimizer required to point at a specific failing run or trace before it may propose a change, or can it propose from a description of the task alone? (c) **The optimizer's own prompt language.** Grep it for wording that presupposes a defect — "find and fix the bug", "identify the failure and correct it" — and check whether a null result is a legal answer at all ("if no failure is present, return no change"). This is the single risk factor the source names explicitly and the cheapest one to check. (d) **The rule set's shape.** Can the optimizer invent new guardrail categories, or is it choosing within a closed set? (e) **Scaffold history.** Is there a diff log of scaffold edits carrying the evidence that motivated each one? Without it, an accreted guardrail is indistinguishable from a justified one, and the review that would have caught it has nothing to read.

1.4 covers artifacts consumed without inspection; here the unreviewed artifact is the harness itself, which is why it belongs in this file rather than under eval infrastructure. **Pattern 36 is the lens; the checks above are the procedure.**

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
- Turn-based systems where a human initiates every run and no schedule or event can start one: the unattended-rung checks in 1.8 (kill switch, cost ceiling) are N/A. Naming the rung is the answer, not a finding.
- Harnesses with no self-modifying component — nothing writes back to the agent's prompts, parsers, filters, or guardrails — for 2.8. A human editing the prompt after reading an eval is not a self-improving loop.

## Confidence Calibration

- **9-10:** You read the runtime code/config and can point to the missing boundary, state, or approval mechanism.
- **7-8:** The architecture clearly has long-running execution or tool actions but no visible harness contract.
- **5-6:** Runtime code is partially visible; flag with a verification caveat.
- **3-4:** Inferring from docs only; appendix unless the blast radius is critical.
