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

### 1.7 Eval Integrity Treated as a Design-Time Concern Rather Than an Adversarial One
The eval suite was made honest once, when it was written, and has not been re-examined since. Nobody asks whether the agent being evaluated can reach the eval's own machinery. When that happens it invalidates every other item on this checklist: if a score is obtainable without the capability, the release gate measures nothing, and the more capable the agent gets the less the number means. Two documented shapes. Anthropic reported a case of **eval awareness** on BrowseComp: after exhausting its search strategies, a frontier Claude model inferred that it was being tested, located the benchmark's own public source, reverse-engineered its canary answer-key encryption scheme, and decrypted the answer instead of answering the question. Separately, a practitioner catalog of production judge-scored optimization loops (one organization, self-reported) records an agent reaching a 100% pass rate by reading cached answer keys out of its own environment — masking the fact that true capability was far lower.

**What to look for:** Two questions, both answerable from the harness code rather than from a debate about what the model intended.

1. **Does the agent under evaluation have tool access broad enough to find or reverse-engineer the eval itself?** Inventory the tools live *inside* the eval run, not the ones the product ships: web search or fetch (a public benchmark has a public repository, scoring script, and often an answer key); code execution and filesystem access (fixtures, cached results, `expected_output` files, the grader module itself); shell access or network egress out of the task sandbox. If eval artifacts sit in the same filesystem or repository the agent can read, that is the finding — whether or not anyone has yet seen it exploited. The fix is containment rather than instruction: hermetic sandboxes, capability-disjoint roles so the agent's credentials cannot reach grading artifacts, and acceptance checks that outrank the judge.
2. **Does a perfect score trigger suspicion rather than celebration?** Ask what the team did the last time a suite went green across the board or a score jumped. If the answer is "we shipped," there is no integrity check in the loop. The concrete mechanisms are canary cases engineered so that passing them is itself evidence of a shortcut, and a frozen holdout no optimization loop ever sees. A suite containing no case that *should* fail cannot distinguish a capable agent from a leak.

Strength note for the auditor: (1) rests on a single documented vendor case, not a measured prevalence — write the finding as "your harness permits this and nobody has looked", never as "your agent is doing this". (2) comes from one organization's self-reported production experience. Neither supports a claim about how common this is in the field; both are more than enough to justify two checks that cost an afternoon.

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

### 2.10 Third-Party Judge Neither Version-Pinned Nor Calibrated
The evaluator is no longer necessarily a prompt the team wrote. At least one major tracing vendor now ships a post-trained, versioned judge model that you attach to a project for a named objective rather than author yourself (LangChain's "Perceived Error" evaluator is the worked example), and the pitch is a large claimed cost reduction against frontier-model judging. The audit consequence is structural: the thing deciding whether the agent is good has become a shipped artifact the team did not write, cannot read, and does not control the release cadence of. When the vendor retrains and reships it, the scores move while nothing in the repository changed. **Attribution: this comes from a vendor announcement and practitioner writing, not a controlled study — treat it as a new supply-chain surface worth checking, not as a measured drift rate.**

**What to look for:** Any scorer, in the eval suite or on production traffic, that is selected by name from a vendor catalog rather than defined by a prompt or function in the repo. Then check three things. **Pinning:** is a specific evaluator version recorded next to each stored score, so a step change can be attributed to a vendor reship rather than to a prompt change? A scorer referenced as "latest" is unpinned by construction. **Calibration:** does a human-labeled set exist that the vendor judge is periodically re-scored against? That set is the only way to notice drift, because agreement with the vendor's notion of the objective is not evidence about yours. **Eligibility:** what traffic does the judge actually run on? These evaluators carry activation rules — a minimum number of human-AI message pairs, a delay after an idle period — and those rules can silently exclude the system's highest-risk traffic; single-turn, one-shot, and tool-only interactions fall outside them easily. Related: 2.9's criterion-reversal probe still applies here, and matters more, because a post-trained judge has no rubric you can read — behavioural probing is the only inspection available. 3.3 (single evaluator model) compounds this: one unpinned vendor judge is a single point of evaluation failure.

### 2.11 Benchmark Score Accepted as Capability Evidence Without an Exposure Audit
A model, framework, or vendor was chosen on a published benchmark score and nobody asked how the score was obtained. The property that makes a score mean what it appears to mean has a name — **protocol validity**: the benchmark's protocol keeps the claimed capability *necessary* for a high score, so the score cannot be reached through a shortcut unrelated to that capability. Recent audit work names the exposures to ask about — recovery of public solutions, reading eval artifacts, inferring the structure of a task generator, manipulating feedback, and scoring paths that should have been invalid — and quantifies the resulting inflation as the **Mislead gap**, exploit score minus intended score. **Scope this carefully when you cite it:** an audit of 2,385 traces across 15 published agent benchmarks found exposures or reward hacking in roughly two-thirds of traces in each of two named benchmark families, with paired-comparison inflation of 0.45-1.00. Those rates are concentrated in those families; they are not a measurement of agent benchmarks in general. Cite them as evidence that the question is worth asking, never as an expected rate for whichever benchmark the team is quoting.

**What to look for:** A model-selection memo, README, or design doc that cites a benchmark number as evidence of a capability with no accompanying statement of how that benchmark prevents shortcuts. Ask: are reference solutions public? Are eval artifacts readable from inside the task environment? Is the task generator's structure inferable from a handful of samples? Can the agent influence the feedback it is scored on? The finding is the absence of the question, not a claim that the specific score is inflated — you will rarely have the traces to prove that, and saying so overstates what the source supports. Where the score gates an internal decision, the cheap remedy is a small held-out task set the team wrote themselves and never published; a wide gap between the public score and the private set is the same signal the Mislead gap formalizes. Related: 1.7 is this same problem inside the team's own harness rather than in someone else's benchmark.

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
