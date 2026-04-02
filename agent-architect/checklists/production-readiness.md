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

**What to look for:** Any path from LLM response to database write, email send, or code execution. Check for validation, format checking, or human review gates between generation and persistence.

### 1.5 No Cost Controls
No mechanism to detect or prevent runaway costs. No daily/weekly spend alerts. No per-invocation cost cap. A prompt regression that doubles token usage is invisible until the bill arrives.

## Pass 2 — Important

### 2.1 No Observability
Cannot answer basic operational questions: How many agent invocations per day? What is the p95 latency? What is the error rate? What is the daily cost?

**What to look for:** Structured logging, metrics (counters, histograms), traces, or dashboards for agent operations.

### 2.2 Raw Exception Traces to Users
Error messages shown to users contain raw exception traces, internal file paths, or model names. Exposes implementation details and provides a poor user experience.

### 2.3 No Retry Strategy
LLM calls that fail are not retried, or are retried without backoff (hammering a rate-limited API).

### 2.4 No Request Tracing
Cannot trace a user's request through the agent pipeline. When a user reports "the agent gave me a wrong answer," you cannot reconstruct what happened.

### 2.5 No Model Fallback
The system depends on a single model endpoint. If that model is down, degraded, or deprecated, the entire system fails. No fallback to an alternative model.

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

## Confidence Calibration

- **9-10:** You read the code and found no timeout, no rate limiter, no error handler around LLM calls.
- **7-8:** Error handling exists but has clear gaps (catches errors but shows raw traces, retries but no backoff).
- **5-6:** Error handling code exists but you cannot determine if it covers all paths without runtime testing.
- **3-4:** Inferring from architecture, not code. Appendix only.
