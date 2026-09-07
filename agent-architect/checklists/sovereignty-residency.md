# Sovereignty & Residency Checklist

## Instructions

Apply this checklist only when Discovery step 2.10 detected a residency trigger: regional model identifiers, region configuration (endpoint pinning, sovereign-cloud regions), compliance or residency markers (data-residency law names, on-prem, VPC endpoint, air-gapped, data localization), or self-hosted serving bound to a declared region. Read the relevant family profile's `### Deployment & residency` section (in `agent-architect/model-profiles/`) before writing findings — this checklist is only as good as what that section actually records.

**Skip this checklist entirely if Discovery found no residency trigger.** Score the dimension N/A and exclude it from the weighted average. Do not penalize a single-region system that has no stated residency requirement — sovereignty is a requirement some systems have and others genuinely do not.

**Honesty constraint:** several family profiles deliberately record an absence rather than a fact, because the provider's own documentation could not be verified (a vendor trust-center page that 403-blocked, a claim reported widely but not confirmed on any reachable primary source). When the profile records an absence, your finding must report that absence — never upgrade "unverified" to "compliant" or "non-compliant." A wrong compliance finding is worse than none.

For each finding, cite the specific file/path and the mechanism (or its absence). Skip anything that is fine. Use the `[SEVERITY] (confidence: N/10) file — description / Current / Fix / Why` format.

## Dedup Rule

Do NOT report findings that duplicate items already covered in other checklists:
- Data-flow containment (how untrusted content is isolated once inside the boundary) → `security.md`
- Runtime placement (where the execution loop, sandbox, or workflow actually runs) → `harness-architecture.md`
- Compliance gating (approval workflows, launch checklists, regulatory sign-off) → `production-readiness.md`

This checklist owns the residency contract itself — what boundary is declared, and whether inference, telemetry, and fallback behavior actually respect it. Cross-reference the other checklists rather than restating their findings.

## Pass 1 — Critical

### 1.1 Inference Crosses a Declared Residency Boundary
The system declares a residency requirement (in config, docs, or compliance markers) but the actual inference call — the model endpoint, the region parameter, the hosting choice — does not honor it. The declared boundary and the enforced boundary are two different things.

**What to look for:** A residency claim (in README, config comments, or a compliance marker grepped in Discovery) with no corresponding region parameter, endpoint pin, or VPC/self-hosted deployment in the code that actually issues the inference call. Cross-reference the detected family's `### Deployment & residency` section for what that provider's inference path actually supports in-region — some providers offer regional storage without regional processing, so a residency claim can be technically true for storage and false for inference at the same time.

### 1.2 Observability Egress Bypasses the Residency Boundary the Inference Call Respects
The inference call is correctly pinned to a region or sovereign endpoint, but prompts, logs, traces, or eval data are shipped to a default observability pipeline, third-party logging service, or eval platform that is not subject to the same boundary. **This is the most common real failure**, because teams pin the model endpoint carefully and never revisit the observability stack that was wired up before residency mattered.

**What to look for:** A logging/tracing SDK (APM agent, eval platform, prompt-logging library) initialized with a default region or default endpoint while the model client is initialized with an explicit region override. Any place where the full prompt or completion — not just metadata — is sent to a telemetry destination whose region is unexamined. Ask specifically: where do logs, traces, and eval data go, and does that destination respect the same boundary as the inference call?

### 1.3 Model Legally Unusable in the Deployment
The model in use has a license or hosting restriction that makes it legally unusable in the way the system deploys it — for example, a non-OSI license with a hosting restriction (no shared instances or managed services without vendor permission) applied to a system that offers exactly that.

**What to look for:** Consult the detected family profile's `### Deployment & residency` section for license terms and hosting restrictions. Flag when the deployment pattern (managed multi-tenant service, shared instance, redistribution) conflicts with a restriction the profile documents. If the profile is silent on licensing for the detected model, this finding does not apply — do not infer a restriction the profile never states.

## Pass 2 — Important

### 2.1 Language or Script Coverage Mismatched to the User Population
The deployed model's documented language and script coverage does not match the population the system actually serves — a user base that writes in a script or dialect the model handles poorly, with no detection or routing around the gap.

**What to look for:** Consult the family profile for documented language/script coverage. Compare against the product's stated user population (locale config, market documentation). Flag a mismatch only when the profile documents a specific coverage limitation — do not speculate about capability the profile does not address.

### 2.2 Code-Switching Unevaluated in a Multilingual Deployment
Users in the target population mix languages or scripts within a single turn (code-switching), and the system has no eval fixtures or handling for it — only clean single-language inputs are tested.

**What to look for:** Eval fixtures (or their absence, per `eval-infrastructure.md`) that cover only monolingual inputs when the declared user population is multilingual. This is a residency-adjacent finding specifically when code-switching risk was named as a reason for choosing a regional/sovereign model in the first place — otherwise it belongs to eval-infrastructure generally.

### 2.3 No In-Boundary Fallback When a Sovereign Endpoint Is Unavailable
The system has a fallback path for when the primary (region-pinned or sovereign) endpoint fails, but the fallback silently routes to a default-region or third-party endpoint outside the declared boundary. Or: there is no fallback at all, so an outage becomes a hard failure with no boundary-respecting degraded mode.

**What to look for:** Retry/fallback logic (per `production-readiness.md`'s fallback finding) that switches provider, region, or model family without checking whether the fallback target respects the same residency boundary. The residency-specific angle: a fallback that works but silently crosses the boundary is worse than no fallback, because it fails without anyone noticing.

### 2.4 Residency Asserted in Documentation but Not Enforced in Code
README, compliance documentation, or a customer-facing claim states a residency guarantee, but nothing in the codebase — no region parameter, no deployment config, no CI check — actually enforces it. The guarantee depends entirely on nobody changing a default.

**What to look for:** A documented claim with no corresponding assertion, config validation, or test that would fail if the region drifted. The fix is a concrete technical control (a startup check, a CI assertion, a required config field with no safe default) — not more documentation.

## Pass 3 — Minor

### 3.1 Region Pinned by Convention Rather Than Configuration
The region is correct today because someone hardcoded it or because the deployment happens to run where it needs to, but there is no explicit, reviewable configuration value — the next person to touch the deploy pipeline can silently change it.

### 3.2 No Recorded Residency Owner
No individual or team is named as responsible for the residency contract — who gets paged if a region drifts, who signs off when a new vendor or subprocessor is added downstream of the model call.

### 3.3 Compliance Regime Named Without a Mapping to a Concrete Technical Control
A regulation or standard is named in documentation (a data-protection law, a certification) with no line connecting it to the specific control that satisfies it — no named endpoint, no named config flag, no named test. The name alone proves nothing.

## Suppressions — DO NOT flag

- **Single-region systems with no stated residency requirement.** A system with no compliance obligation and no residency claim is not deficient for lacking a residency architecture.
- **Prototypes and internal tools explicitly out of scope for compliance.**
- **A compliance obligation the codebase never states.** Do not infer that a system "should" have a residency requirement because of its domain (healthcare, finance) unless the codebase, docs, or Discovery markers actually name one. Inferring an obligation that was never stated produces a false-positive compliance finding — worse than staying silent.
- **A residency guarantee the model family profile itself could not verify.** When a profile records an unverifiable claim (a vendor site that blocked research access, a widely reported but unconfirmed hosting location), do not treat the claim as either satisfied or violated — report the gap and recommend the auditee verify directly with the vendor.

## Confidence Calibration

- **9-10:** You read the specific code path that issues the inference call, the logging/tracing initialization, and the fallback logic, and can point to exactly where the boundary is or is not respected.
- **7-8:** A residency claim and a family profile's `### Deployment & residency` section clearly document a gap (e.g., storage-only regions treated as processing regions), even without reading every call site.
- **5-6:** A residency marker was found in Discovery but the enforcement path is unclear — flag with caveat: "Residency claim detected; enforcement not confirmed from available code."
- **3-4:** Residency is inferred from naming or documentation alone (a config key called `region` with no observed effect). Appendix only.
- Never assign high confidence to a compliance verdict (satisfied or violated) that rests on a family profile's unverified claim — cap confidence at 5 and state the profile's own caveat.
