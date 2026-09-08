# Production Readiness Checklist

## Instructions

Apply this checklist against agent systems intended for production use (real users, real data, real money). Examine error handling, cost controls, observability, and degradation paths. For prototypes not yet in production, note findings as "pre-production advisory."

## Pass 1 — Critical

### 1.1 No Timeout on LLM Calls
LLM API calls have no timeout configured. A hung API call blocks the agent indefinitely. Users see a spinner forever. Server resources are consumed without bound.

**What to look for:** Timeout parameters on HTTP clients, LLM SDK calls, or wrapper functions. Default timeouts (often 60s+) may be too long for user-facing interactions.

### 1.2 No Rate Limiting
No limit on how many LLM calls the agent can make per request, per user, or per time window. A bug (infinite loop, retry storm) can spend thousands of dollars in minutes.

**What to look for:** Rate limiters, max-iteration counters, per-request cost caps, or circuit breakers. At minimum: a max_iterations parameter on any loop that calls an LLM.

### 1.3 No Graceful Degradation
When the LLM API fails (timeout, rate limit, server error), the user sees a raw 500 error, a stack trace, or a silent hang. There is no fallback behavior.

**What to look for:** Error handling around LLM calls that provides a user-visible message, retries with backoff, or degrades to a simpler (non-LLM) path.

### 1.4 Unvalidated LLM Output Persisted
LLM-generated content (text, JSON, code, URLs, emails) is written directly to a database, sent in an email, or executed without validation. Hallucinated data becomes the source of truth.

**What to look for:** Any path from LLM response to database write, email send, or code execution. Check for validation, format checking, or human review gates between generation and persistence. A human review gate closes this finding only under the evidence test in `security.md` 2.8 — a review that is granted as a matter of routine is consent, not validation, so prefer a deterministic check where one is expressible.

### 1.5 No Cost Controls
No mechanism to detect or prevent runaway costs. No daily/weekly spend alerts. No per-invocation cost cap. A prompt regression that doubles token usage is invisible until the bill arrives.

### 1.6 Credentials Co-Located with Code Execution Environment
The agent runs untrusted code or user-supplied inputs (via Bash, a sandbox, eval, or equivalent) in the same environment where credentials — API keys, access tokens, database passwords — are present. A prompt injection attack only needs to convince the agent to read its own environment to exfiltrate them. Once an attacker has those tokens, they can spawn unrestricted sessions and delegate work to them.

**What to look for:** Any path where (a) the agent executes code and (b) credentials are available as environment variables, files, or in-process config within that same execution scope. The structural fix: credentials must not enter the execution environment. Two patterns work: bundle auth into the resource during initialization (e.g., clone a git repo with its token wired into the remote — subsequent push/pull work without the agent ever handling the token), or hold credentials in an external vault and proxy tool calls through it (the agent calls the proxy; the proxy fetches credentials and makes the external call; the harness is never made aware of any credentials).

### 1.7 No Background Task Lifecycle for Long-Running Agents
Long-running work has no durable status, cancellation, retry ownership, timeout, progress event, or cleanup path.

## Pass 2 — Important

### 2.1 No Observability
Cannot answer basic operational questions: How many agent invocations per day? What is the p95 latency? What is the error rate? What is the daily cost?

**What to look for:** Structured logging, metrics (counters, histograms), traces, or dashboards for agent operations.

### 2.2 Raw Exception Traces to Users
Error messages shown to users contain raw exception traces, internal file paths, or model names. Exposes implementation details and provides a poor user experience.

### 2.3 Flat or Missing Recovery Strategy
Flat retry (same context, same model, same prompt, N times) is not a recovery strategy — it is a loop. Recovery must be layered: same-context retry first, then pruned-context retry, then model fallback, then user escalation. Circuit breakers must be explicit: max 3 consecutive attempts, 20 total, to prevent runaway cost. Recovery should be invisible to the user while it is running — surface only if all layers fail.

### 2.4 No Request Tracing
Cannot trace a user's request through the agent pipeline. When a user reports "the agent gave me a wrong answer," you cannot reconstruct what happened.

### 2.5 No Model Fallback
The system depends on a single model endpoint. If that model is down, degraded, or deprecated, the entire system fails. No fallback to an alternative model.

### 2.6 No Live Media Latency Budget
Voice/realtime systems lack p50/p95 latency targets and monitoring for first audio, interruption, tool-mediated turns, and full response time.

### 2.7 No Provider Deprecation or Alias Migration Gate
Production model IDs can change or be deprecated without a stored eval baseline, rollout gate, or rollback path.

### 2.8 Recovery or Escalation Triggered on Mid-Run Confidence
The harness decides whether to intervene — restart, re-plan, escalate to a human, abandon the run — from an uncertainty signal read part-way through a trajectory: the agent's own verbal confidence, a perplexity score, a self-rated progress estimate. On deep-research-style tasks, verbal confidence separated eventual successes from failures well **at trajectory completion** but no evaluated signal did so around the mid-point; the proposed mechanism is path switching — agents routinely abandon a search direction mid-run, which breaks the link between an early signal and the eventual outcome. A trigger built on the mid-run reading then fires on noise: it restarts runs that would have recovered on their own and lets through runs that will not.

**Scope — read before flagging.** This is a single-domain result (deep-research tasks; verbal confidence and perplexity as the signals tested), suggestive rather than established, and it is not a general law about every agent or every uncertainty signal. Treat it as a question the system must be able to answer, not as an automatic defect. On a task class where the team can show from its own traces that a mid-run signal predicts outcome, the trigger is fine and the finding does not apply. What is not fine is *assuming* it predicts.

**What to look for:** A threshold on a confidence, uncertainty, self-assessment, or "am I making progress" field that is consumed by a restart, retry, model-fallback, escalation, or abort branch before the run completes — with no validation that the signal separates outcomes at that point in the trajectory. Ask directly: has anyone compared the signal's separation of success from failure at intermediate progress against its separation at completion, in this system's own logs? Where the signal has only been validated at completion, the decisions it can support are post-run ones (re-run, escalate a finished trajectory, gate the result) rather than a mid-run interrupt. Note the related design smell even where the trigger is validated: an intervention policy with no recorded false-restart rate is a cost line nobody is watching.

## Pass 3 — Minor

### 3.1 No Structured Logging
Logging uses print statements or unstructured text instead of structured log entries (JSON, key-value pairs) that can be queried.

### 3.2 No Health Check Endpoint
No way to programmatically check if the agent system is operational.

### 3.3 No Admin Tooling
No way to inspect agent sessions, replay requests, or manually override agent decisions for debugging or customer support.

### 3.4 No Usage Analytics
No tracking of which features users actually use, which queries fail most often, or which tool calls are most expensive.

## Suppressions — DO NOT flag

- Pre-production prototypes explicitly labeled as such (note as advisory instead).
- Internal tools with <5 users where the operator IS the developer.
- Systems where cost is negligible (<$10/month) and blast radius is low.
- Finding 1.6: agents with no code execution surface (no Bash, no eval, no sandbox). If the agent cannot run code, credential co-location is not exploitable via this path.

## Confidence Calibration

- **9-10:** You read the code and found no timeout, no rate limiter, no error handler around LLM calls.
- **7-8:** Error handling exists but has clear gaps (catches errors but shows raw traces, retries but no backoff).
- **5-6:** Error handling code exists but you cannot determine if it covers all paths without runtime testing.
- **3-4:** Inferring from architecture, not code. Appendix only.
