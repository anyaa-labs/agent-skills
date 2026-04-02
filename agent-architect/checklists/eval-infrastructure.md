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

## Pass 3 — Minor

### 3.1 No Eval Persistence
Eval results are printed to stdout but not stored. Cannot track trends over time or compare runs.

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
