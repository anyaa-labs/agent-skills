# Evaluation Infrastructure Checklist

## Instructions

Apply this checklist against how the agent system is tested, evaluated, and monitored for quality. Examine eval scripts, test suites, rubrics, scoring code, and CI/CD integration for agent quality.

## Pass 1 — Critical

### 1.1 No Evals of Any Kind
The system has no automated evaluation. Quality is assessed by "we run it and check the output." This means regressions are invisible until users report them.

**What to look for:** Any test files, eval scripts, scoring functions, or CI jobs that exercise agent behavior. Complete absence is the finding.

### 1.2 Generator Equals Evaluator (GAN Instinct Violation)
The same model and prompt that generates output also evaluates it. Self-evaluation is unreliable — agents grade their own work generously. A separate evaluator prompt, tuned to be skeptical, consistently outperforms self-eval.

**What to look for:** Evaluation done by the same LLM call as generation, or an "evaluate your own output" step in the same prompt.

### 1.3 Subjective Rubrics
Evaluation criteria use subjective language: "is the output good?", "is it helpful?", "rate quality 1-5." Without concrete, gradable criteria, evaluator scores oscillate and are not actionable.

**What to look for:** Rubrics with specific, measurable criteria. "Does the response include the customer's name?" is gradable. "Is the response high quality?" is not.

### 1.4 No Regression Baseline
There is no baseline to compare against. You cannot tell if a prompt change made things better or worse because there is no "before" measurement.

**What to look for:** Stored eval results from previous runs, comparison scripts, or baseline scores checked into the repo.

### 1.5 No Trace or Terminal-State Evaluation for Agents
Evals score final text but not the tool-call trace, state mutations, approval decisions, artifact outputs, or final database/workspace state.

### 1.6 Monitor or Judge Quality Reported Only as an Aggregate Number
A safety monitor, classifier, or LLM judge is justified by a single headline figure — accuracy, catch rate, precision/recall, pass rate — computed over a mixed eval set. That aggregate is a false average. It is dominated by the cases where some *other* signal would also have caught the problem, and it conceals the subset where the monitor is the only thing standing between the failure and production. Measured directly: a chain-of-thought monitor holding a very high aggregate catch rate fell to a small fraction of that rate on the subset of hacks where the reasoning trace was the only tell — under an attack that rewrote only the reasoning trace and left every command and output byte-identical, that transferred across monitor families and agent models, and that trace-only defenses recovered from only partially even when primed on the attack itself. The number the team quotes and the number that carries the safety case are different numbers.

**What to look for:** For each failure category the monitor is credited with catching, ask what else in the system would have caught it — test outcomes, byte-level diffs, external verification, an independent-of-trace signal. Then ask for the monitor's accuracy **on the subset where it is the only defense**. If that number does not exist, the safety case has not been measured; say so rather than accepting the aggregate. Specific red flags: one accuracy figure quoted for a monitor across a mixed eval set with no per-category or only-defense breakdown; a monitor whose primary evidence is the model's own reasoning trace, which is an output the agent under evaluation controls and can shape while leaving its actions unchanged; a safety argument of the form "our monitor catches N% of X" where nobody has partitioned X by what other signal covers it; monitor eval sets built only from attacks the actions already give away.

## Pass 2 — Important

### 2.1 Manual-Only Evals
Evals exist but require manual triggering. They do not run in CI or on prompt changes. This means regressions can ship between manual eval runs.

### 2.2 No Cost Tracking Per Eval Run
Eval runs consume LLM tokens but cost is not tracked. Cannot budget for evaluation or detect cost regressions.

### 2.3 Eval Dataset Too Small
Fewer than 20 eval cases. Too small for statistical significance — results are noisy and a single outlier swings the score.

### 2.4 No Contract Tests for Tool Interfaces
Tool schemas can change without breaking any test. The agent's expectations about tool inputs/outputs are not verified against the actual tool implementation.

### 2.5 No Edge-Case Eval Coverage
Evals only test the happy path. No eval cases for: empty input, malformed input, model refusal, tool failure, timeout, or adversarial input.

### 2.6 No Repeated-Trial Reliability Metric
Agent evals run each case once. They do not measure pass rate across repeated stochastic trials or report `pass^k` style reliability.

### 2.7 Security and Utility Not Scored Separately
The same score blends task success with safety behavior, hiding agents that complete tasks while violating prompt-injection, authorization, or approval constraints.

### 2.8 No Modality-Specific Eval Cases
Voice, image, video, realtime, or computer-use agents are evaluated only through text cases.

### 2.9 LLM Judge Never Probed for Rubric Artifacts
The judge is validated (if at all) on agreement with human labels, and never tested for whether its verdict depends on the candidate response at all. Two cheap probes close that gap. **Rubric-only ablation:** predict the judge's scores from the rubric text alone, with no access to the response being graded — classifiers trained this way have been shown to reach non-trivial accuracy, which means part of the verdict encodes rubric phrasing rather than reasoning over the output. **Criterion reversal:** flip the rubric criterion (or the candidate response) and check that the verdict flips accordingly — judges often fail to. Strength note for the auditor: this is a methodology critique rather than a benchmark-pinned result — the judge models and benchmarks it was demonstrated on are not detailed in the abstract — so report it as a missing probe the team can run in an afternoon, not as a claim that their judge is broken.

**What to look for:** Any eval or gate whose verdict comes from an LLM scoring against a rubric, with no ablation in the eval suite. Concretely: no test case that runs the judge with the response withheld; no test that inverts a criterion and asserts the score moves; a rubric that has been iteratively tuned until scores looked right (rubric-shaped overfitting is exactly what these probes detect); a judge whose scores are stable across substantially different candidate responses. Both probes belong in the eval suite as standing cases, not as a one-off investigation.

## Pass 3 — Minor

### 3.1 No Eval Persistence
Eval results are printed to stdout but not stored. Cannot track trends over time or compare runs. Note: the agent-architect skill itself persists its evaluation scores to `~/.agent-skills/local/` for cross-session trend tracking — this checklist item is about the evaluated system's own eval infrastructure, not the skill's.

### 3.2 No Eval for Negative Cases
No test that verifies the agent correctly REFUSES to do something it should not do.

### 3.3 Single Evaluator Model
All evals use the same model. Cross-model agreement (two different models agree the output is good) is a stronger signal than single-model evaluation.

## Suppressions — DO NOT flag

- Brand-new prototypes (<1 week old) where evals are explicitly in the roadmap.
- Internal tools with <10 users where manual QA is the stated strategy.
- Systems where the output is deterministic (no LLM in the critical path) — standard unit tests suffice.

## Confidence Calibration

- **9-10:** You searched for eval files, test scripts, and CI config and found nothing. Or: you read the eval code and found the generator-evaluator violation.
- **7-8:** Eval infrastructure exists but has clear gaps (no baselines, no CI integration).
- **5-6:** Evals exist but you cannot assess quality without running them. Flag with caveat.
- **3-4:** Inferring eval quality from repo structure, not code. Appendix only.
