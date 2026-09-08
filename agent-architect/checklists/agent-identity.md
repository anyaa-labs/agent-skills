# Agent Identity & Authorization Checklist

## Instructions

Apply this checklist only when Discovery's agent-identity step (2.11) detected delegated authority: an agent that holds a credential of its own, a sub-agent or tool call that acts under an inherited credential, a remote agent reached over MCP or A2A, or a hosted agent-identity platform (an agent-identity directory, a workload-identity federation config, an auth sidecar).

**Skip this checklist entirely if Discovery found no delegated authority at all.** Score the dimension N/A and exclude it from the weighted average. A single-turn assistant that holds nothing and delegates to nobody has no identity architecture to get wrong, and is not deficient for lacking one.

This dimension asks one question in several forms: **when the agent asks to do something, what refuses?** A credential the agent holds and is trusted not to misuse has no answer to that question. An external decision point — a broker, a scoped token exchange, a policy engine that sees the request and can say no — does.

**Honesty constraint:** most of the identity plane lives outside the repository. Directory configuration, conditional-access policy, certificate issuance, and sponsor records are console or IaC artifacts an auditor often cannot see from the code alone. Where the posture cannot be determined, **report the gap as the finding** — "the agent's auth mode is not determinable from the codebase; ask the auditee which identity type it is provisioned as" — rather than assuming either compliance or violation. Do not upgrade "not visible here" into "not present." A wrong identity verdict is worse than a recorded gap.

For each finding, cite the specific file/path and the mechanism (or its absence). Skip anything that is fine. Use the `[SEVERITY] (confidence: N/10) file — description / Current / Fix / Why` format.

## Dedup Rule

Do NOT report findings that duplicate items already covered in other checklists:

- **What untrusted content can do once it is inside the agent** — injection surfaces, the Rule of Two, tool-description integrity, credential co-location with untrusted content processing, MCP authorization-server and token-audience verification, exfiltration paths → `security.md`. That checklist owns the attack; this one owns whether the authority the attack captures was scoped and externally refusable in the first place.
- **Whether a human approval gate is a control at all** → `security.md` 2.8. Never resolve a finding here with "a human approves it." An approval prompt is not the external broker 1.1 asks for; treating it as one is the exact substitution that checklist item exists to reject.
- **Excessive tool surface relative to the task** (a summarizer with delete access) → `security.md` 2.2. This checklist owns the *credential* and the decision point, not the tool list.
- **Whether the orchestrator re-validates what a sub-agent says** → `security.md` 1.2. That is trust in a peer's *content*. This checklist owns trust in a peer's *asserted identity and capabilities* (1.2 below).
- **Whether a high-risk tool call is intercepted before execution for an allow/warn/block decision** → `security.md` 2.6. That interception evaluates *action shape* — is this command dangerous given its destination and blast radius — and does not scope a credential to what a specific agent was delegated. This checklist's 1.1 evaluates a proposed action *against the delegation* — is this agent authorized for this, given what it was actually delegated — which is a different question even when the same external component ends up answering both. Where a system has one broker doing both jobs, report it once, under 1.1, since the delegation-scoping half is the harder one to satisfy.
- **Topology, handoff contracts, dedup, contention, and shared mutable state between agents, including a safety-critical subagent restricted from destructive actions by prompt instruction rather than by removing its write tools** → `multi-agent.md` 2.7. That checklist owns whether the agents should exist, how they coordinate, and confinement expressed as *tool-list* restriction; this checklist owns confinement expressed as *credential-scope* restriction.

This checklist owns the authorization contract itself: which principal each agent acts as, who or what can refuse a delegated action, and how far a compromised participant can reach before something outside the model stops it. Cross-reference the other checklists rather than restating their findings.

## Pass 1 — Critical

### 1.1 Authorization Decided Inside the Model

The agent holds a broad bearer credential — a service token, an API key, a session cookie with the full scope of the workflow — and the only thing standing between that credential and its misuse is the model's own judgment. There is no external component that sees a proposed action and can refuse it. Authorization is not enforced; it is *hoped for*, inside the same context window an attacker is trying to control.

A threat-model analysis published in this sweep makes the failure concrete. Under an explicitly untrusted-model assumption — a fully prompt-injected agent must still not be able to exceed its delegated authority — the authors define four adversaries (confused deputy, token theft and replay, prompt-injection privilege escalation, compromised sub-agent) and eight security requirements. A default runtime modeling common practice, broad bearer credentials with authorization checked only inside the model, **fails all four**. That is the configuration this finding is about, and it is the ordinary one.

The same analysis examined four widely used delegation surfaces — LangGraph, CrewAI, AutoGen, and the MCP authorization model — and found three of the four provide *no* built-in confinement and one only partial, with no single existing standard covering the full requirement set. **Time-stamp that claim when you use it.** The authors scope it explicitly to those frameworks as of their writing, in mid-2026; framework internals change, and a version-specific claim stated as a permanent property of a named project is how an audit finding becomes wrong. Verify against the version the system actually pins, and say which version you checked.

**What to look for:** A credential loaded once at process start and passed unchanged into every tool call and every spawned sub-agent. Sub-agents that inherit the parent's client object, session, or token rather than receiving a narrower one minted for their specific task. A tool layer that executes whatever the model emitted because the model was the thing deciding — no policy check, no capability check, no per-action token exchange between the decision and the call. Ask directly: *if this agent were fully prompt-injected right now, what component outside the model would refuse it?* If the answer is a system-prompt instruction, a classifier score, or a human clicking approve, the answer is nothing.

**Fix direction:** an external decision point that holds the authority the agent does not — task-scoped, short-lived credentials minted per delegation, and a broker or policy engine that evaluates each action against the delegation rather than against the model's intent. The paper's own broker implementation reports blocking all four threats, resisting 11 direct attacks on its design, accepting none of 200,000 forged delegation tokens, and confining a compromised sub-agent to a mean of 1.5 reachable actions against all 8,100 reachable under bearer delegation, across 2,000 randomized scenarios, at roughly 2.6 microseconds per decision. **Treat those numbers as vendor-adjacent, not independent:** they are self-reported by authors whose design is also stated to ship in a named commercial product. The authors report brokered confinement as achievable at negligible cost — attribute that conclusion to them rather than asserting it as this checklist's own finding; do not cite the specific figures as an independent benchmark, and do not build a recommendation on the 1.5-versus-8,100 ratio holding in the audited system.

### 1.2 A Remote Agent's Declared Capabilities Are Trusted Unsigned

The system talks to a remote agent over A2A and reads that agent's Agent Card — its declared identity, skills, and capabilities — without verifying the card's signature. A2A v1.0 shipped signed Agent Cards for cryptographic agent identity verification. Accepting an unsigned card means any party that can answer at that address can declare itself to be whatever the orchestrator is looking for, and the orchestrator will route work, data, and delegated authority accordingly.

**What to look for:** A2A client code that fetches a card and reads `skills` / `capabilities` straight into a routing decision with no signature verification step, no trusted-key configuration, and no failure branch for an unverifiable card. Agent registries or discovery endpoints whose entries are consumed without attestation. A pinned pre-1.0 A2A SDK, where signed cards and the surrounding stability guarantees may not be available at all — that is a finding in its own right, not merely a version-hygiene note.

This is deliberately the identity twin of `security.md` 1.4 (MCP tool descriptions loaded without integrity verification). Report the *tool*-description case there and the *agent*-card case here; do not report one defect twice because both are "unverified metadata."

### 1.3 Auth Mode Assumed at Runtime Rather Than Provisioned as an Identity

The agent's authorization mode — acting autonomously with no user in the loop, versus acting on behalf of a specific user — is an implicit property of whichever code path happens to be executing, not a provisioned property of an identity that can be looked up, policy-governed, and audited. At least one major enterprise identity platform (Microsoft Entra Agent ID) now splits these as first-class, separately governed identity types with their own Conditional Access policy templates, because the distinction determines what the agent should be allowed to do.

The common failure is directional and specific: an agent provisioned only as on-behalf-of that nonetheless runs in paths where no user is present — a scheduled job, a retry worker, a webhook handler, a background reconciliation loop. It then acts autonomously under a user's authority, which is under-governed in both directions: the user is accountable for actions they never initiated, and the autonomous path escapes the policies written for autonomous agents.

**What to look for:** Compare the credential the agent is provisioned with against every entry point that reaches the agent loop. Scheduled triggers, queue consumers, and retry paths that reuse a user-context token captured from an earlier interactive session. A single credential serving both an interactive surface and a background one. Conversely: an autonomous identity used on an interactive path where the acting user's own permissions should have bounded the action, so the agent can do things the requesting user cannot. Where the provisioning is not visible in the repository, apply the honesty constraint and report the gap with the specific question to put to the auditee.

## Pass 2 — Important

### 2.1 The Agent Has No Identity of Its Own

The agent acts as a human user's account, or as a generic shared service account also used by unrelated workloads. There is no principal that *is* the agent. Nothing can be granted to it, scoped for it, revoked from it, or attributed to it specifically — and neither of the autonomy-mode policies in 1.3 can be applied, because there is no identity to attach one to.

**What to look for:** Agent authentication that reuses a human's OAuth tokens, personal access token, or SSO session. A service account whose name predates the agent and whose other consumers are unknown. Credentials shared across several agents with different privilege needs (cross-reference `security.md` 2.2 for the tool-surface half of this; the finding here is that the *principal* is shared, so revocation and attribution are impossible even if scopes were right).

### 2.2 Agent Identity With No Live Sponsor

The agent's identity exists with no accountable human owner attached, or with an owner who has left. Orphaned agent identities are a named failure mode that Microsoft is now shipping sponsor-lifecycle workflows against: a credential that outlives the person who justified it keeps its access indefinitely, because nothing triggers a review when that person's own access is deprovisioned.

**What to look for:** An identity or credential with no recorded sponsor, owner, or requesting team. Offboarding processes that revoke a departing employee's access with no step that examines the agent identities they sponsored. Long-lived credentials created for a project that has since ended. The check is not "is there a name in a wiki" — it is whether a specific human's departure would cause this agent's authority to be re-justified or revoked.

### 2.3 Third-Party or Externally Hosted Agents Outside the Identity Plane

Some agents in the system are governed by the identity platform and others are not: an automation-platform agent, a hosted agent on another cloud, a vendor's agent reached over a protocol boundary. The ungoverned ones hold their own credentials, obtained their own way, subject to none of the policies the governed ones are subject to. The system's actual security posture is the weakest participant's, not the platform's.

**What to look for:** Agents outside the primary platform (a workflow-automation runner, another cloud's hosted agent service, an internally built service agent) authenticating with their own static keys rather than being federated into the same identity plane via workload-identity federation or an auth sidecar. An inventory question worth asking out loud: *list every agent in this system and say which identity each one presents.* Any row you cannot fill is the finding.

### 2.4 Long-Lived Bearer Credential Where Certificate-Bound Workload Identity Is Available

Server-to-provider authentication rests on a long-lived bearer API key even though the provider offers mutual TLS and X.509 workload identity federation as an alternative. A leaked long-lived key is a materially larger blast radius than a short-lived, certificate-bound identity: the key works from anywhere, for anyone, until someone notices and rotates it.

**Check the detected family profile before writing this finding.** Recommend a certificate-bound path only where the profile records that the provider actually offers one; where the profile is silent, report the long-lived-key exposure without asserting a remediation that provider may not support. If the profile records the mechanism as unverified, say so rather than resolving it in either direction.

**What to look for:** A single static key in environment or config, unrotated, with no expiry, shared across environments. No per-environment or per-service credential separation. The same defect with a sharper edge: a long-lived wallet or payment credential held in the environment by an agent that can spend, where per-session, short-lived scoping is the documented control and the enforcement belongs in middleware rather than in the prompt.

## Pass 3 — Minor

### 3.1 Delegation Scope Correct by Convention Rather Than Configuration

The sub-agent's authority happens to be narrow today because of how the code is written, not because anything declares or enforces the narrowing. Nothing fails if the next change widens it — there is no scope declaration to review in a diff.

### 3.2 No Named Owner for the Agent's Authorization Policy

No individual or team is recorded as responsible for the authorization contract: who approves a new capability for an agent, who revokes a compromised agent identity, who is paged when a delegated credential leaks. Distinct from 2.2, which is about the identity's sponsor; this is about the policy that governs identities in general.

### 3.3 Identity Model Asserted in Documentation but Not Checked at Runtime

A design document, README, or architecture note states the identity posture — "the agent acts on behalf of the requesting user," "sub-agents receive scoped tokens" — with nothing in the code that would fail if it stopped being true. The fix is a concrete technical control: a startup assertion on the credential's type or scope, a CI check, a required config field with no permissive default. Not more documentation.

## Suppressions — DO NOT flag

- **Systems with no delegated authority at all.** No agent-held credential, no sub-agent, no remote agent, no tool that acts with privilege — the dimension is N/A, not zero.
- **A single agent holding one correctly scoped, read-only credential with nothing to delegate to.** 1.1 is about confining delegated authority; where there is no delegation and the credential cannot cause harm, there is nothing to broker.
- **Prototypes, local development harnesses, and internal tools explicitly out of scope for production identity governance.**
- **The absence of a hosted identity platform, on its own.** A home-grown authorization broker that can actually refuse an action satisfies 1.1. Do not convert this dimension into a product recommendation.
- **A named framework's confinement behavior you did not verify in the version the system pins.** The published framework-by-framework result is scoped to a point in time and to specific projects. Flagging "your framework provides no confinement" without checking the pinned version restates a citation as a code finding.
- **A capability the provider does not offer.** Do not recommend certificate-bound workload identity, per-request token exchange, or an identity-platform feature against a provider whose profile does not record it. Report the exposure; do not invent the remediation.

## Confidence Calibration

- **9-10:** You read the credential's construction, every path that reaches the agent loop, and the delegation code, and can point to exactly where an action is or is not externally refusable.
- **7-8:** The architecture makes the gap plain from code — a client constructed once with a broad key and passed into every sub-agent, or an A2A card consumed with no verification import anywhere in the module — even without tracing every call site.
- **5-6:** Delegation is visible but the enforcing layer may live outside the repository (a gateway, a sidecar, a policy engine configured elsewhere). Flag with the caveat: "no external authorization point found in the codebase; confirm whether one exists at the deployment layer."
- **3-4:** Identity posture inferred from naming or documentation alone — a config key called `agent_identity` with no observed effect. Appendix only.
- Never assign high confidence to a claim about a *named framework's* current confinement behavior on the basis of the published analysis alone; cap at 5 unless you verified the pinned version yourself, and carry the time-stamp into the finding text.
- Never assign high confidence to a quantitative claim about how well a broker would perform, and do not present the published broker's own figures as independent evidence — the authors report them for their own design, which also ships commercially. Cap those at 5 and state the caveat inline.
- Where the identity plane is not visible from the code, the finding is the gap, and its confidence describes how certain you are that the gap exists — not how certain you are about what is on the other side of it.
