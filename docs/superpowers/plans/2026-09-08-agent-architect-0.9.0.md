# agent-architect 0.9.0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Correct the four places the skill's guidance is contradicted by evidence, then add Agent Identity & Authorization as the 13th dimension plus the patterns and findings the 2026-09 sweep surfaced.

**Architecture:** Markdown-only skill. Tests are Node's built-in runner asserting structural contracts (dimension count, pattern count, version, link existence, de-rot guard). Tasks 1–10 are intentionally red in sequence; Task 11 closes the suite green.

**Tech Stack:** Markdown, `node:test`, `node:assert/strict`, `node:fs`, `node:path`. Zero dependencies.

## Global Constraints

Every task's requirements implicitly include these.

1. **`agent-architect/references/agent-engineering-landscape-2026-09.md` is the source of truth for every factual claim. It governs over this plan's prose.** If this plan paraphrases a fact and the reference file says otherwise, the reference file wins and the implementer must say so in its report. This constraint exists because the 0.8.0 pass shipped three wrong facts that came from plan prose rather than researched sources.
2. **Never restate a fact from memory.** Read the reference file. Do not add a claim that is not in it.
3. **Respect the strength labels.** The reference labels findings `strong` / `suggestive` / `single-result` with scope conditions. A `single-result` finding must not be written as a confident audit claim; where scope conditions change the advice (e.g. "measured on deep-research tasks"), state them.
4. **The de-rot guard must stay green with zero new allow-markers.** No model-version strings, context-window numbers, or dated perishable facts in `agent-architect/checklists/`. Model facts belong in `agent-architect/model-profiles/<family>.md`. Run `node --test tests/no_hardcoded_models.test.mjs` before committing any checklist change.
5. **Never assert a coiner for "loop engineering".** Its origin is unconfirmed and it is contested by its own popularizer. Frame around the auditable rung and stop condition.
6. Conditional dimensions score **N/A** and drop out of the weighted average — follow the existing Memory / Multimodal / Sovereignty precedent exactly.
7. Commit after each task. Run the full suite (`npm test`) before each commit and report the pass/fail counts.

---

### Task 1: Drive the release from failing contract tests

**Files:** Modify `tests/agent_architect_contract.test.mjs`

Write the assertions for the finished state first. All of these must FAIL after this task.

- [ ] **Step 1:** Change the version pin to `0.9.0` in both places (`pkg.version` and the `SKILL.md` regex). Note there are THREE version sites in the repo — `package.json`, `agent-architect/SKILL.md` frontmatter, and this test. Task 11 updates the other two. 0.8.1 shipped red by moving only one.
- [ ] **Step 2:** Add `'Agent Identity & Authorization'` to the dimensions array and change the count assertion from 12 to 13. Read the existing test to match its exact style.
- [ ] **Step 3:** Update the cognitive-pattern count assertion. The current count is 29. Set it to 29 + (number of patterns Task 5 will add). Task 5 must land exactly that many; if it lands a different number, that is a spec conflict to escalate, not a number to quietly edit.
- [ ] **Step 4:** Add `agent-architect/checklists/agent-identity.md` to the checklist-link existence test.
- [ ] **Step 5:** Run `npm test`. Expected: several failures, all in this file. Record the exact failure list in your report — later tasks are verified against it.
- [ ] **Step 6:** Commit.

---

### Task 2: The four corrections

**Files:** Modify `agent-architect/checklists/context-management.md`, `eval-infrastructure.md`, `production-readiness.md`, `security.md` (only where an approval gate is treated as mitigation), and `agent-architect/SKILL.md` (patterns 3, 12, 15).

Read spec Part 1 and the corresponding reference-file findings before writing. This is the highest-priority task in the plan: these are places the skill would actively mislead an auditor today.

- [ ] **Step 1:** Grep for every place the four claims currently appear. Specifically: any guidance that recommends reducing context in response to long-horizon degradation; any finding that treats human approval as a mitigation; any use of an aggregate accuracy/pass-rate figure for a monitor or judge; any recovery trigger keyed on mid-run confidence. List every hit with file:line in your report **before** changing anything.
- [ ] **Step 2:** Correction 1.1 — context-management + Pattern 3. Require attribution before prescription: the auditor must establish whether degradation tracks step count or context length before recommending a context fix, because for step-driven decay the context fix is measured to make it worse. Cite the direction of the effect, not invented numbers.
- [ ] **Step 3:** Correction 1.2 — approval gates. An approval gate counts as a control only with evidence that approvals discriminate. Without that evidence it is not a control and must not be scored as mitigation.
- [ ] **Step 4:** Correction 1.3 — eval-infrastructure + Pattern 12. Ask for accuracy on the subset where the signal is the only defence, and add the rubric-only-ablation and criterion-reversal probes for LLM judges.
- [ ] **Step 5:** Correction 1.4 — production-readiness + Pattern 15. Flag recovery triggers keyed on mid-trajectory confidence. **Scope this to the task class it was measured on** — the finding is `suggestive`, not universal.
- [ ] **Step 6:** Run `node --test tests/no_hardcoded_models.test.mjs` then `npm test`. Guard must be green. Commit.

---

### Task 3: The Agent Identity & Authorization checklist

**Files:** Create `agent-architect/checklists/agent-identity.md`

**Interfaces:** Must match the structure of `agent-architect/checklists/sovereignty-residency.md` exactly — read it first and mirror its section order: `## Instructions`, `## Dedup Rule`, `## Pass 1 — Critical`, `## Pass 2 — Important`, `## Pass 3 — Minor`, `## Suppressions — DO NOT flag`, `## Confidence Calibration`.

- [ ] **Step 1:** Read `sovereignty-residency.md` in full for structure, tone, and the way it gates itself as conditional.
- [ ] **Step 2:** Read the identity material in the reference file (the Google/Microsoft/xAI sweep's Entra Agent ID theme, the OpenAI mTLS theme, the A2A signed-Agent-Cards theme, and the academic sweep's multi-agent-confinement finding).
- [ ] **Step 3:** Write Pass 1 with the headline finding first: **authorization decided inside the model** — an agent holding a broad bearer credential, trusted not to misuse it, with no external broker that can refuse. Give the confinement contrast from the reference file. Name the frameworks the paper names, and **time-stamp that claim** as the paper does — framework internals change.
- [ ] **Step 4:** Write the remaining findings: provisioned-vs-assumed auth mode (autonomous vs on-behalf-of mismatched to runtime behaviour), orphaned agent identities with no live sponsor, third-party agents outside the identity plane, unsigned A2A Agent Cards trusted for capability claims, long-lived bearer keys where workload identity federation is available.
- [ ] **Step 5:** Write the Dedup Rule pointing at the overlapping findings in `security.md` and `multi-agent.md` — say which one owns what, so the same issue is not reported twice.
- [ ] **Step 6:** Write Suppressions and Confidence Calibration. Include the honest-gap rule the sovereignty checklist uses: where the identity posture cannot be determined from the code, report the gap rather than assuming either way.
- [ ] **Step 7:** Guard green, `npm test`, commit.

---

### Task 4: Wire the 13th dimension into SKILL.md

**Files:** Modify `agent-architect/SKILL.md`

**Interfaces:** Consumes `checklists/agent-identity.md` from Task 3. Every site that lists dimensions must agree — the contract test asserts this across four surfaces.

- [ ] **Step 1:** Grep SKILL.md for `Sovereignty` to find every site the 12th dimension touches. That list is exactly the set of sites this task must update. Report the list.
- [ ] **Step 2:** Add a Discovery step that detects the trigger conditions (agent-held credentials, sub-agent/tool delegation, remote agents over MCP or A2A, hosted agent-identity platforms) and emits a System Map line, mirroring how step 2.10 emits `Residency:`.
- [ ] **Step 3:** Add the conditional Deep Evaluation item, the scoring-rubric row, and the completion-summary row, all following the Sovereignty precedent for N/A handling.
- [ ] **Step 4:** Update the frontmatter description (`12-dimension` → `13-dimension`) and the TREND row.
- [ ] **Step 5:** `npm test` — the dimension assertions from Task 1 should now pass. Version and pattern-count assertions still fail. Commit.

---

### Task 5: New cognitive patterns

**Files:** Modify `agent-architect/SKILL.md` (Cognitive Patterns section)

**Interfaces:** The number of patterns added must equal what Task 1 pinned. Read Task 1's committed test before writing.

- [ ] **Step 1:** Read the existing patterns 27–29 to match voice, length, and structure. Patterns are numbered prose entries that name a failure and the judgment that prevents it — not checklist items.
- [ ] **Step 2:** Write the patterns listed in spec Part 3. Each must name the failure it prevents and be usable as an analytical lens without the reader having the source open.
- [ ] **Step 3:** For The Autonomy Rung: frame around the rung and the machine-checkable stop condition. **Do not assert a coiner.** Include the auditable gap that the config is usually in the repo while the runtime state is not.
- [ ] **Step 4:** For Aggregate Accuracy Is a False Average and The Rubber Stamp, make the check concrete — what number to ask for, and what the number means if it is missing.
- [ ] **Step 5:** Count the patterns. Confirm the total matches Task 1's assertion exactly. `npm test` — the pattern-count assertion should now pass. Commit.

---

### Task 6: Multi-agent checklist findings

**Files:** Modify `agent-architect/checklists/multi-agent.md`

- [ ] **Step 1:** Read the reference file's multi-agent material: the Anthropic Frontier Red Team results, the framework-confinement paper, summary collapse, and the practitioner covert-channel observations.
- [ ] **Step 2:** Add findings for: shared-resource contention with no arbitration above the agent layer; private inter-agent channels being unlogged (collusion risk); correlated failure among homogeneous agents; covert channels through any surface concurrent agents can both read and write.
- [ ] **Step 3:** Add summary collapse: boundary/scope metadata surviving handoff compression far worse than the operational facts it governs. Include the explicit-vs-vague boundary-marker contrast and the tight-token-budget risk factor.
- [ ] **Step 4:** Update the Dedup Rule against the new `agent-identity.md`. Confinement of a compromised sub-agent belongs to agent-identity; contention and channel surface belong here.
- [ ] **Step 5:** Guard green, `npm test`, commit.

---

### Task 7: Tool design and security findings

**Files:** Modify `agent-architect/checklists/tool-design.md`, `agent-architect/checklists/security.md`

- [ ] **Step 1:** Read the reference file's MCP measurement findings and the A2A/AAIF material.
- [ ] **Step 2:** Add the MCP deployment base rates as an *expectation-setting* finding: the common case is missing authentication and unrestricted shell exposure, so these are not edge cases to note but defaults to check for. Include the churn consequence — a point-in-time MCP review goes stale almost immediately, so recommend periodic re-scanning rather than sign-off.
- [ ] **Step 3:** Add the meta-finding that automated MCP security scanners are themselves unreliable, so a scanner's "risky" flag is not ground truth and manual triage is currently required. Keep the reported true-positive figure qualified as the reference file qualifies it.
- [ ] **Step 4:** Add the A2A-vs-MCP layer finding: agent↔agent and agent↔tool are different layers, conflating them at the harness layer is a documented anti-pattern, and an agent exposing *itself* as an MCP server collapses the distinction. Add unsigned Agent Card trust as an injection surface, cross-referencing `agent-identity.md` rather than duplicating it.
- [ ] **Step 5:** Guard green, `npm test`, commit.

---

### Task 8: Harness architecture findings

**Files:** Modify `agent-architect/checklists/harness-architecture.md`

- [ ] **Step 1:** Read the reference file's escalation-tool finding, the phantom-guardrail finding, the loop-rung material, and the checkpoint/restore observation.
- [ ] **Step 2:** Add the escalation-channel finding: whether the harness gives the agent a first-class way to report "this is broken/impossible" distinct from failing or working around it. This is the best-evidenced finding in the sweep — state the effect direction and that it came at no measured performance cost, per the reference file.
- [ ] **Step 3:** Add the loop-rung finding: identify the rung, whether the stop condition is machine-checkable, whether a separate verifier grades completion rather than the same model self-grading, and whether unattended rungs have a turn cap, kill switch and cost ceiling. Add the runtime-state-not-in-version-control check.
- [ ] **Step 4:** Add the phantom-guardrail finding for self-improving/harness-optimizing loops: add-only acceptance, and whether the optimizer verifies a failure actually occurred before fixing it. Include the prompt-language risk factor. Keep it qualified — the finding is `suggestive` and was measured in a purpose-built lab.
- [ ] **Step 5:** Add checkpoint/restore as a recovery rung, per the practitioner sweep.
- [ ] **Step 6:** Guard green, `npm test`, commit.

---

### Task 9: Memory and eval findings

**Files:** Modify `agent-architect/checklists/memory-architecture.md`, `agent-architect/checklists/eval-infrastructure.md`

- [ ] **Step 1:** Memory — add the write-time audit finding: a semantic-similarity or factuality gate is precisely what memory-poisoning attacks are tuned to pass, so similarity is not evidence of benignity. Recommend provenance, write-frequency anomaly, and cross-session behavioural signals alongside content checks. **Qualify heavily** — this finding is `single-result` and the attack's "audit" baseline is defined by the same paper.
- [ ] **Step 2:** Eval — add the judge-as-third-party-artifact finding: vendor-post-trained versioned evaluators you did not write, so pin the version and calibrate, or inherit undetected drift.
- [ ] **Step 3:** Eval — add eval integrity as adversarial: whether the agent under evaluation has tool access broad enough to find or reverse-engineer the eval itself, and whether a perfect score triggers suspicion rather than celebration.
- [ ] **Step 4:** Eval — add protocol validity: a benchmark score is not evidence of the claimed capability without an exposure audit. Keep the reported rates scoped to the benchmark families they were measured on, as the reference file does.
- [ ] **Step 5:** Guard green, `npm test`, commit.

---

### Task 10: Model profile facts

**Files:** Modify `agent-architect/model-profiles/openai.md`, `anthropic.md`, `google.md`, `xai.md`

These are model/platform facts and belong in profiles, never in checklists.

- [ ] **Step 1:** Read the reference file for each fact listed in spec Part 4. Verify each against the profile's existing content first — three of these were already committed before this plan (Anthropic `inference_geo`, OpenAI per-request regional processing, Assistants API shutdown). Do not duplicate them. Report which were already present.
- [ ] **Step 2:** OpenAI — Agents SDK before v0.22.0 leaking guardrail-blocked terminal tool output into replayable/persisted state, and the v0.20.0 silent default-model change. Frame the second as a live instance of harness expiry.
- [ ] **Step 3:** OpenAI — mTLS/X.509 workload identity GA; spend-limit 429s being terminal rather than retryable; the `slow_down` (429) vs `server_is_overloaded` (503) split and what each implies for the retry layer.
- [ ] **Step 4:** Anthropic — memory-tool path traversal being the implementer's responsibility with no built-in expiration, and the thinking-block replay cutover for accounts created on or after the stated date.
- [ ] **Step 5:** Google — Interactions API GA as the default agent interface. xAI — the `xhigh` reasoning tier. Check `google.md` and `xai.md` for what is already recorded before adding.
- [ ] **Step 6:** `npm test`, commit.

---

### Task 11: Release — version, changelog, README, green suite

**Files:** Modify `package.json`, `agent-architect/SKILL.md`, `CHANGELOG.md`, `README.md`

- [ ] **Step 1:** Bump `package.json` to `0.9.0` and `SKILL.md` frontmatter `version:` to `0.9.0`. Task 1 already moved the test pin. **Verify all three agree** — 0.8.1 shipped red by moving only one.
- [ ] **Step 2:** Write the CHANGELOG entry. Lead with the corrections, not the new dimension: those are the items where the skill would previously have misled an auditor, and that is the more important thing for a reader to learn. Then the 13th dimension, then patterns and findings.
- [ ] **Step 3:** Update README's dimension count and description, and add the new reference file to whatever inventory it keeps.
- [ ] **Step 4:** Record the honest gaps from the sweep in the CHANGELOG or README as appropriate — that the research found no in-window material from several named individuals, that x.com is unfetchable so some term attributions are unresolved, and that "loop engineering" has no verified coiner. A reader should be able to tell what was checked and came back empty.
- [ ] **Step 5:** Run `npm test`. **Every test must pass.** Report the final count. Commit.
