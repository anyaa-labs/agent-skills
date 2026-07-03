# Agent Architect Production AI Systems Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade `agent-architect` from a strong prompt/tool/memory auditor into a current production AI systems architect that can evaluate 2026-era reasoning models, agent harnesses, MCP-heavy tool surfaces, multimodal agents, runtime security, and stochastic production evals.

**Architecture:** Keep the skill file-based and portable. Add two new audit dimensions only where the current rubric has demonstrable blind spots: `Harness Architecture` for long-running execution/runtime boundaries, and `Multimodal Architecture` for voice, image, video, and computer-use agents. Refresh model profiles into source-backed model-runtime contracts and add contract tests so future profile/checklist changes do not drift out of sync with `SKILL.md`.

**Tech Stack:** Markdown skill files, Node built-in test runner, `package.json` scripts, local skill references, web-sourced citations embedded in reference docs.

---

## Research Synthesis

The current skill is already ahead of many agent-audit prompts: it has an Iron Law, 9 scoring dimensions, model profiles, memory architecture, security, branch-aware evaluation history, and design mode. The upgrade should not add abstraction for its own sake. The concrete failure case is that current `agent-architect` can miss production issues that are no longer prompt-level problems:

- A system can use a strong 2026 reasoning model and still fail because the harness does not preserve reasoning state, sandbox state, tool-call IDs, or long-running workflow state. OpenAI reasoning docs now explicitly require reasoning items to be carried through tool loops in stateless mode, and the Agents SDK separates direct Responses calls from SDK-owned orchestration, state, approvals, and tools. Sources: [OpenAI reasoning models](https://developers.openai.com/api/docs/guides/reasoning), [OpenAI Agents SDK](https://developers.openai.com/api/docs/guides/agents).
- Agent building has shifted from prompt engineering to harness and context engineering. Anthropic now documents initializer prompts, long-running harnesses, managed agent execution boundaries, advisor/executor patterns, Skills, MCP code-mode, and eval design as first-class architecture. Sources: [Effective context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents), [Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents), [Managed Agents](https://www.anthropic.com/engineering/managed-agents), [Code execution with MCP](https://www.anthropic.com/engineering/code-execution-with-mcp), [Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills), [Advisor tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/advisor-tool).
- Model profiles are stale. `agent-architect/model-profiles.md` was researched on 2026-04-02 and does not reflect current OpenAI GPT-5.5/GPT-5.4 guidance, Claude Opus 4.8/Sonnet 4.6 effort/context behavior, Gemini Interactions API, Gemini 3.x tool IDs, Gemini Live, DeepSeek V3.2/V4 transition, Qwen3 agent tooling, or current voice/image/video model surfaces. Sources: [OpenAI models](https://developers.openai.com/api/docs/models), [Claude models](https://platform.claude.com/docs/en/about-claude/models/overview), [Gemini models](https://ai.google.dev/gemini-api/docs/models), [Gemini Interactions API](https://ai.google.dev/gemini-api/docs/interactions/interactions-overview), [DeepSeek updates](https://api-docs.deepseek.com/updates), [Qwen function calling](https://qwen.readthedocs.io/en/latest/framework/function_call.html).
- More context is not a substitute for context selection. Chroma's context-rot research and Drew Breunig's failure taxonomy show that long contexts introduce poisoning, distraction, confusion, and clash. Tool abundance has the same shape: MCP can expose hundreds or thousands of tools, but loading every definition and every intermediate result into model context is wasteful and fragile. Sources: [Chroma context rot](https://www.trychroma.com/research/context-rot), [How Long Contexts Fail](https://www.dbreunig.com/2025/06/22/how-contexts-fail-and-how-to-fix-them.html), [How to Fix Your Context](https://www.dbreunig.com/2025/06/26/how-to-fix-your-context.html), [Anthropic MCP code execution](https://www.anthropic.com/engineering/code-execution-with-mcp).
- Production voice, video, image, and computer-use agents have modality-specific failure modes that the existing text-centric rubrics do not cover: VAD and barge-in, transcript drift, media token/resolution budgets, synchronous live tool calls, visual prompt injection, screen-coordinate validation, and audio fallback paths. Sources: [OpenAI voice models](https://openai.com/index/advancing-voice-intelligence-with-new-models-in-the-api/), [Gemini Live API](https://ai.google.dev/gemini-api/docs/live-api), [Gemini computer use](https://ai.google.dev/gemini-api/docs/computer-use), [VPI-Bench](https://openreview.net/forum?id=UMauKu2azg), [Multimodal prompt injection survey](https://arxiv.org/html/2509.05883v1).
- Agent evals must score stochastic workflows, terminal state, and traces, not just final text. Tau-bench introduced dynamic user/tool interactions and `pass^k`; Anthropic emphasizes repeated trials for non-deterministic agents and tool-selection evals; AgentDojo separates utility and prompt-injection robustness. Sources: [tau-bench](https://arxiv.org/abs/2406.12045), [Anthropic agent evals](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents), [AgentDojo](https://arxiv.org/abs/2406.13352).
- Security guidance has moved toward capability and data-flow containment. OWASP now has a 2026 Agentic Applications Top 10; CaMeL extracts trusted control/data flows so untrusted data cannot drive program flow; Meta's Agents Rule of Two treats the combination of untrusted input, sensitive data, and external side effects as the core risk; MCP tool annotations must be treated as untrusted unless from trusted servers. Sources: [OWASP Top 10 for Agentic Applications 2026](https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/), [CaMeL](https://arxiv.org/abs/2503.18813), [Meta Agents Rule of Two](https://ai.meta.com/blog/practical-ai-agent-security/), [MCP tools spec](https://modelcontextprotocol.io/specification/2025-11-25/server/tools), [MCP authorization](https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization).

## Current Repo Baseline

- `agent-architect/SKILL.md` is 891 lines and currently claims `version: 0.6.1`, 9-dimension scoring, 14 lessons, and 20 cognitive patterns.
- `agent-architect/SKILL.md` has a small drift bug: the frontmatter says 9-dimension scoring, while the mode reference still says AUDIT returns a 7-dimension scored report.
- `agent-architect/model-profiles.md` is source-backed but stale for this research request. Its provenance says 2026-04-02 and its examples center on GPT-4.1, Claude Opus 4.6/Sonnet 4.5, Gemini 2.5/3, Llama 4, DeepSeek V3.1, Mistral Large 3, and Command R+.
- There is no automated validation that `SKILL.md` references real checklist/reference files, that package and skill versions match, or that scoring/report/trend tables include the same dimensions.

## Scope Decisions

1. Add `Harness Architecture` as a new always-considered dimension for production systems. The simpler existing rubric fails when a product has correct prompts/tools but no workspace contract, no state snapshot/resume, no sandbox/credential boundary, and no artifact inspection loop.
2. Add `Multimodal Architecture` as a conditional dimension only when Discovery detects voice, video, image generation/understanding, realtime APIs, browser/computer use, or media tool outputs. The simpler existing rubric fails because text-only context/security checks do not cover VAD, barge-in, transcript drift, frame budgets, image prompt injection, or coordinate-action validation.
3. Do not create a separate `MCP Architecture` dimension. Update `tool-design.md`, `context-management.md`, `security.md`, and the new `harness-architecture.md` instead. MCP issues are cross-cutting: tool discovery, token loadout, trust, authorization, and execution boundaries.
4. Keep `agent-architect` as a Markdown skill. Do not introduce a runtime engine, provider SDK, or external dependency. The skill should inspect systems; it should not become the system it evaluates.
5. Add tests after the plan begins, before changing the skill. This repo is mostly Markdown, so contract tests are the right guardrail.

## File Structure

- Modify `agent-architect/SKILL.md`: version, description, discovery, system map, cognitive patterns, deep-evaluation checklist wiring, scoring, completion summary, trend, review classification, design detailed design, stop conditions, principles.
- Modify `agent-architect/model-profiles.md`: refresh provenance, model matching, and provider/runtime profiles.
- Modify `agent-architect/checklists/model-awareness.md`: reasoning-state, effort-budget, API-surface, deprecation, and modality-runtime checks.
- Modify `agent-architect/checklists/context-management.md`: tool loadout, reasoning items, media budgets, code-mode, context quarantine, and explicit compaction triggers.
- Modify `agent-architect/checklists/tool-design.md`: MCP/tool-search loadout, tool annotations, task-shaped tool APIs, and result filtering.
- Modify `agent-architect/checklists/eval-infrastructure.md`: repeated trials, `pass^k`, terminal-state scoring, trace scoring, security/utility split, multimodal evals.
- Modify `agent-architect/checklists/security.md`: capability/data-flow containment, MCP auth/audience binding, runtime action interception, visual/audio injection, peer-agent trust.
- Modify `agent-architect/checklists/production-readiness.md`: background task state, live media latency, sandbox lifecycle, provider deprecation, modality usage caps.
- Modify `agent-architect/checklists/multi-agent.md`: advisor/executor, handoff state, subagent context quarantine, peer output validation.
- Create `agent-architect/checklists/harness-architecture.md`: production runtime and execution-boundary rubric.
- Create `agent-architect/checklists/multimodal-architecture.md`: voice/video/image/computer-use rubric.
- Create `agent-architect/references/harness-engineering.md`: source-backed design reference for long-running agent harnesses.
- Create `agent-architect/references/multimodal-agents.md`: source-backed design reference for voice, image, video, realtime, and computer-use agents.
- Create `agent-architect/references/model-runtime-contracts-2026-06.md`: source-backed changelog of model/runtime changes used by `model-profiles.md`.
- Create `tests/agent_architect_contract.test.mjs`: structural contract tests for skill version, dimensions, referenced files, and plan-critical strings.
- Create `tests/source_links.test.mjs`: link/source quality tests for new references and model profiles.
- Modify `package.json`: bump version to `0.7.0` and add `npm test`.
- Modify `README.md`: describe 11-dimension audit and new production systems coverage.
- Modify `CHANGELOG.md`: add `0.7.0` entry.

---

### Task 1: Add Contract Tests First

**Files:**
- Create: `tests/agent_architect_contract.test.mjs`
- Create: `tests/source_links.test.mjs`
- Modify: `package.json`

- [ ] **Step 1: Create the skill contract test**

Create `tests/agent_architect_contract.test.mjs` with this content:

```js
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const read = (filePath) => fs.readFileSync(path.join(root, filePath), 'utf8');

test('package and skill versions match the planned release', () => {
  const pkg = JSON.parse(read('package.json'));
  const skill = read('agent-architect/SKILL.md');

  assert.equal(pkg.version, '0.7.0');
  assert.match(skill, /^version: 0\.7\.0$/m);
});

test('SKILL advertises and reports the same 11 audit dimensions', () => {
  const skill = read('agent-architect/SKILL.md');
  const dimensions = [
    'Prompt Architecture',
    'Tool Design',
    'Context Management',
    'Multi-Agent Orch.',
    'Eval Infrastructure',
    'Production Readiness',
    'Model Awareness',
    'Agent Security',
    'Memory Architecture',
    'Harness Architecture',
    'Multimodal Architecture',
  ];

  assert.match(skill, /11-dimension scoring/);
  for (const dimension of dimensions) {
    assert.ok(
      skill.includes(dimension),
      `Expected SKILL.md to include dimension: ${dimension}`,
    );
  }
});

test('all checklist and reference links mentioned in SKILL exist', () => {
  const skill = read('agent-architect/SKILL.md');
  const linkedFiles = new Set([
    ...skill.matchAll(/`(checklists\/[^`]+?\.md)`/g),
    ...skill.matchAll(/`(references\/[^`]+?\.md)`/g),
  ].map((match) => `agent-architect/${match[1]}`));

  assert.ok(linkedFiles.size >= 13, 'Expected SKILL.md to reference the expanded checklist/reference set');

  for (const filePath of linkedFiles) {
    assert.ok(fs.existsSync(path.join(root, filePath)), `Missing linked file: ${filePath}`);
  }
});

test('Discovery records runtime, modality, and MCP surfaces in the system map', () => {
  const skill = read('agent-architect/SKILL.md');

  for (const expected of ['Runtime:', 'Modalities:', 'MCP/tools:', 'Sandbox:', 'Reasoning state:']) {
    assert.ok(skill.includes(expected), `Expected System Map field: ${expected}`);
  }
});
```

- [ ] **Step 2: Create the source-link test**

Create `tests/source_links.test.mjs` with this content:

```js
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const read = (filePath) => fs.readFileSync(path.join(root, filePath), 'utf8');

test('new reference files contain source sections with external links', () => {
  const referenceFiles = [
    'agent-architect/references/harness-engineering.md',
    'agent-architect/references/multimodal-agents.md',
    'agent-architect/references/model-runtime-contracts-2026-06.md',
  ];

  for (const filePath of referenceFiles) {
    const body = read(filePath);
    assert.match(body, /## Sources/);
    const linkCount = [...body.matchAll(/\]\(https?:\/\/[^)]+\)/g)].length;
    assert.ok(linkCount >= 6, `${filePath} needs at least 6 cited links`);
  }
});

test('model profiles declare current provenance and runtime contract fields', () => {
  const profiles = read('agent-architect/model-profiles.md');
  const required = [
    'Researched 2026-06-14',
    'API surface',
    'Reasoning state',
    'Tool semantics',
    'Modality support',
    'Re-evaluate when',
  ];

  for (const text of required) {
    assert.ok(profiles.includes(text), `model-profiles.md missing: ${text}`);
  }
});
```

- [ ] **Step 3: Add the test script and version bump**

Modify `package.json` to this exact structure:

```json
{
  "name": "agent-skills",
  "version": "0.7.0",
  "description": "Claude Code and Codex skills for evaluating and designing multi-agent systems",
  "private": true,
  "license": "MIT",
  "scripts": {
    "test": "node --test tests/*.test.mjs"
  }
}
```

- [ ] **Step 4: Run tests and verify the intended failure**

Run:

```bash
npm test
```

Expected result: FAIL. The failure should mention missing `0.7.0`, missing new dimensions, and missing reference/checklist files. If it fails because of a syntax error in the test files, fix the test files before continuing.

- [ ] **Step 5: Commit the failing tests**

Run:

```bash
git add package.json tests/agent_architect_contract.test.mjs tests/source_links.test.mjs
git commit -m "test: add agent architect contract checks"
```

### Task 2: Add Source-Backed Reference Material

**Files:**
- Create: `agent-architect/references/harness-engineering.md`
- Create: `agent-architect/references/multimodal-agents.md`
- Create: `agent-architect/references/model-runtime-contracts-2026-06.md`

- [ ] **Step 1: Create the harness engineering reference**

Create `agent-architect/references/harness-engineering.md` with sections in this order:

```md
# Harness Engineering Reference

This reference supports `checklists/harness-architecture.md` and DESIGN mode when the user asks about long-running agents, agent runtimes, sandboxes, MCP-heavy tools, code execution, approvals, or production operations.

## Core Thesis

A production agent is the model plus the harness. The harness owns execution boundaries, state, context assembly, tool availability, approvals, observability, budget enforcement, and recovery. A model upgrade can improve planning or tool use, but it does not remove the need for explicit state ownership or execution containment.

## Runtime Boundary Patterns

- Direct model call: use when one model response plus simple tools is enough.
- SDK-owned orchestration: use when application code owns tool execution, handoffs, guardrails, approvals, state, and traces.
- Sandbox-owned workspace: use when the task needs files, commands, packages, ports, artifacts, snapshots, or human review before resume.
- Managed-agent or brain/hands split: use when generated code or untrusted work should run outside the credentialed orchestration boundary.

## Long-Running Workflow Patterns

- Initializer context: first context window prepares environment and handoff material for later workers.
- Fresh-context handoff: completed phases write artifacts, summaries, and decisions to files, then the next worker starts from those artifacts.
- Snapshot and resume: every meaningful run has a restorable workspace state and a serialized run state.
- Artifact-first verification: downstream systems consume files or structured artifacts only after validation.

## Tool Surface Patterns

- Small tool sets: expose direct function tools with complete descriptions.
- Large MCP surfaces: use tool search, filesystem-discoverable tool APIs, or code-mode so the model loads only relevant definitions.
- Sensitive data flows: keep large or sensitive intermediate data inside the execution environment and return only summaries, counts, hashes, or validated artifacts to the model.

## Eval Implications

Harness evals must score complete traces, not only final text. Measure task success, state transitions, unsafe action prevention, recovery behavior, cost, latency, and pass rate across repeated trials.

## Sources

- [OpenAI Agents SDK](https://developers.openai.com/api/docs/guides/agents)
- [OpenAI sandbox agents](https://developers.openai.com/api/docs/guides/agents/sandboxes)
- [OpenAI reasoning models](https://developers.openai.com/api/docs/guides/reasoning)
- [Anthropic effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
- [Anthropic harness design for long-running application development](https://www.anthropic.com/engineering/harness-design-long-running-apps)
- [Anthropic managed agents](https://www.anthropic.com/engineering/managed-agents)
- [Anthropic code execution with MCP](https://www.anthropic.com/engineering/code-execution-with-mcp)
- [Anthropic advisor tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/advisor-tool)
- [MCP tools specification](https://modelcontextprotocol.io/specification/2025-11-25/server/tools)
- [MCP authorization specification](https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization)
```

- [ ] **Step 2: Create the multimodal agents reference**

Create `agent-architect/references/multimodal-agents.md` with sections in this order:

```md
# Multimodal Agents Reference

This reference supports `checklists/multimodal-architecture.md` and DESIGN mode for voice, image, video, realtime, browser-use, and computer-use systems.

## Core Thesis

Multimodal agents are not text agents with extra inputs. Each modality adds a runtime contract: capture quality, latency, turn-taking, synchronization, transcript canonicalization, media token budgets, tool timing, and modality-specific injection surfaces.

## Voice and Realtime Contracts

- Turn-taking: define VAD, silence timeout, interruption, and barge-in behavior.
- Canonical transcript: decide whether the source of truth is audio, transcript, model summary, or tool state.
- Tool timing: live sessions may require synchronous tool responses before speech continues.
- Fallbacks: degraded STT, TTS, or realtime connection must fall back to typed chat or delayed response.
- Latency: set p50 and p95 targets for first audio, full response, and tool-mediated response.

## Image, Video, and Screen Contracts

- Media budget: choose per-item resolution and frame sampling based on decision need.
- Visual grounding: computer-use actions need coordinate normalization and post-action visual validation.
- Generated media: validate outputs for text correctness, policy constraints, and artifact fit before downstream use.
- Video: define frame selection, audio/video synchronization, and what evidence is kept for audit.

## Security Contracts

- Treat image, audio, video, page DOM, screenshots, and generated media as untrusted instruction channels.
- Quarantine untrusted media interpretation from privileged action execution.
- Require human review for external side effects driven by visual or audio content.

## Eval Implications

Multimodal evals need fixture media, transcripts, latency metrics, interruption cases, noisy input, adversarial visual text, tool timing failures, and state validation after screen actions.

## Sources

- [OpenAI advancing voice intelligence](https://openai.com/index/advancing-voice-intelligence-with-new-models-in-the-api/)
- [OpenAI Realtime API introduction](https://openai.com/index/introducing-gpt-realtime/)
- [Gemini Live API](https://ai.google.dev/gemini-api/docs/live-api)
- [Gemini Live tool use](https://ai.google.dev/gemini-api/docs/live-api/tools)
- [Gemini computer use](https://ai.google.dev/gemini-api/docs/computer-use)
- [Gemini models](https://ai.google.dev/gemini-api/docs/models)
- [Gemini Interactions API](https://ai.google.dev/gemini-api/docs/interactions/interactions-overview)
- [VPI-Bench](https://openreview.net/forum?id=UMauKu2azg)
- [Multimodal prompt injection attacks](https://arxiv.org/html/2509.05883v1)
```

- [ ] **Step 3: Create the model runtime contracts source note**

Create `agent-architect/references/model-runtime-contracts-2026-06.md` with sections in this order:

```md
# Model Runtime Contracts Research, 2026-06-14

This reference records the current source snapshot used to refresh `model-profiles.md`. It separates model behavior from API/runtime contract because production agent failures increasingly come from preserving or mishandling runtime state.

## Profile Fields Required

Every provider family profile in `model-profiles.md` must include:

- API surface
- Reasoning state
- Tool semantics
- Modality support
- Context behavior
- Structured output path
- Known production failure modes
- Harness requirements
- Re-evaluate when

## Provider Notes

OpenAI: GPT-5.5 is the current default for complex reasoning and coding; GPT-5.4 mini/nano are lower cost/latency options. Reasoning models work better through Responses, and tool loops must preserve reasoning items, including encrypted reasoning in stateless or zero-data-retention setups.

Anthropic: Claude Opus 4.8, Opus 4.7, Opus 4.6, and Sonnet 4.6 support large output in batches; Opus 4.8 defaults to high effort unless explicitly configured. Opus/Sonnet 4.6-era workflows require attention to thinking blocks, effort, advisor/executor pairings, and long-context behavior.

Google Gemini: Interactions API is optimized for agentic workflows, server-side history, typed execution steps, background tasks, and complex multimodal multi-turn conversations. Gemini 3 function calls include unique IDs that must be returned in function responses when manually constructing history. Gemini Live and computer-use models add realtime and screen-action runtime contracts.

DeepSeek: API updates indicate legacy `deepseek-chat` and `deepseek-reasoner` names point to `deepseek-v4-flash` modes during a transition and will be discontinued on 2026-07-24. DeepSeek V3.2 is framed as reasoning-first and built for agents.

Qwen: Qwen3 supports function calling through templates and recommends Qwen-Agent for agentic use. Qwen3-Coder and subsequent series depend on thinking/tool parser configuration; self-hosted deployments must verify tokenizer, chat template, and parser compatibility.

Mistral: Function calling and structured output are supported, but JSON mode still requires explicit prompt instruction to output JSON and the expected format.

Meta Llama: Llama 4 Scout/Maverick are natively multimodal open-weight models with very large advertised context; production agent use still needs external grammar/tool parsing and context-selection validation.

## Sources

- [OpenAI models](https://developers.openai.com/api/docs/models)
- [OpenAI reasoning models](https://developers.openai.com/api/docs/guides/reasoning)
- [OpenAI tools](https://developers.openai.com/api/docs/guides/tools)
- [OpenAI voice models](https://openai.com/index/advancing-voice-intelligence-with-new-models-in-the-api/)
- [Claude models overview](https://platform.claude.com/docs/en/about-claude/models/overview)
- [Claude extended thinking](https://docs.anthropic.com/en/docs/build-with-claude/extended-thinking)
- [Claude advisor tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/advisor-tool)
- [Gemini models](https://ai.google.dev/gemini-api/docs/models)
- [Gemini function calling](https://ai.google.dev/gemini-api/docs/function-calling)
- [Gemini Interactions API](https://ai.google.dev/gemini-api/docs/interactions/interactions-overview)
- [Gemini Live API](https://ai.google.dev/gemini-api/docs/live-api)
- [DeepSeek updates](https://api-docs.deepseek.com/updates)
- [DeepSeek V3.2 release](https://api-docs.deepseek.com/news/news251201)
- [Mistral function calling](https://docs.mistral.ai/studio-api/conversations/function-calling)
- [Mistral structured output](https://docs.mistral.ai/studio-api/conversations/structured-output)
- [Qwen function calling](https://qwen.readthedocs.io/en/latest/framework/function_call.html)
- [Qwen3 blog](https://qwenlm.github.io/blog/qwen3/)
- [Meta Llama 4](https://ai.meta.com/blog/llama-4-multimodal-intelligence/)
```

- [ ] **Step 4: Run source-link tests**

Run:

```bash
npm test -- tests/source_links.test.mjs
```

Expected result: FAIL only on model profile provenance/runtime fields, because the new reference files now exist but `model-profiles.md` has not been refreshed.

- [ ] **Step 5: Commit the references**

Run:

```bash
git add agent-architect/references/harness-engineering.md agent-architect/references/multimodal-agents.md agent-architect/references/model-runtime-contracts-2026-06.md
git commit -m "docs: add production agent architecture references"
```

### Task 3: Refresh Model Profiles into Runtime Contracts

**Files:**
- Modify: `agent-architect/model-profiles.md`
- Modify: `agent-architect/checklists/model-awareness.md`

- [ ] **Step 1: Replace the model profile intro**

Replace the provenance and usage intro in `agent-architect/model-profiles.md` with:

```md
# Model Profiles for Agent Architecture Evaluation

> **Provenance:** Researched 2026-06-14. Sources: OpenAI model, reasoning, tools, Agents SDK, sandbox, and voice docs; Anthropic model, extended thinking, harness, advisor, context, MCP, and Skills docs; Google Gemini model, Interactions, function calling, Live API, and computer-use docs; DeepSeek API updates; Mistral function calling and structured output docs; Qwen function calling and agent docs; Meta Llama 4 announcement; context-rot and agent-eval research. See `references/model-runtime-contracts-2026-06.md` and `CHANGELOG.md` for update history.

These profiles describe *agent-relevant runtime contracts*, not just model personality. For current pricing, regional availability, rate limits, and provider-specific deployment constraints, use web research on the provider's official documentation.

## How to Use

During Discovery, detect model IDs, provider APIs, runtime surfaces, modalities, reasoning-state requirements, and tool protocols. Apply the closest family profile, then apply version-specific notes when the exact version is known.

Every profile includes:

- **API surface** — which endpoint/runtime the provider recommends for agentic work.
- **Reasoning state** — what hidden/summary/encrypted/thought-signature state must be preserved across turns.
- **Tool semantics** — function calling, parallel calls, tool IDs, MCP, tool search, or code-mode behavior.
- **Modality support** — text, image, audio, video, realtime, computer use, generated media.
- **Context behavior** — raw window and practical failure risks.
- **Structured output path** — strict schema, JSON mode, constrained decoding, grammar, or parser.
- **Known production failure modes** — agent-specific risks to check.
- **Harness requirements** — required state, boundaries, validation, and re-evaluation triggers.
- **Re-evaluate when** — provider/model events that should trigger a harness review.
```

- [ ] **Step 2: Update family matching**

Add these mappings in the API ID mapping section:

```md
- `gpt-5*`, `gpt-realtime*`, `o*` -> OpenAI GPT/reasoning/realtime family
- `claude-opus-4-*`, `claude-sonnet-4-*`, `claude-haiku-4-*`, `claude-*` -> Claude family
- `gemini-3*`, `gemini-2.5*`, `gemini-*` -> Gemini family
- `qwen3*`, `qwen-*`, `qwen_*` -> Qwen family
- `deepseek-v4*`, `deepseek-v3*`, `deepseek-chat`, `deepseek-reasoner`, `deepseek-*` -> DeepSeek family
- `llama-4*`, `llama-*`, `meta-llama/*` -> Llama family
```

- [ ] **Step 3: Add current OpenAI and Gemini profile content**

In the OpenAI/GPT section, add these version-specific notes:

```md
### Version-specific notes
- **GPT-5.5**: Start here for complex reasoning, coding, scientific reasoning, and multi-step agentic workflows. Use Responses API for best reasoning/tool performance. Preserve reasoning items across tool calls; in stateless or ZDR mode include and replay encrypted reasoning content. Cost tier: $$$$.
- **GPT-5.5-pro**: Highest-intelligence option when latency can be higher. Use for reviewer, planner, scientific reasoning, and difficult coding roles, not bulk worker turns. Cost tier: $$$$.
- **GPT-5.4**: Lower-cost reasoning option. Good for production flows where GPT-5.5 quality is not required every turn. Cost tier: $$$.
- **GPT-5.4-mini / GPT-5.4-nano**: Use for latency/cost-sensitive routing, extraction, transformation, and lightweight tool workers after eval proves quality. Confirm tool-search and schema support before use. Cost tier: $$/$.
- **GPT-Realtime-2 / GPT-Realtime-Translate / GPT-Realtime-Whisper**: Voice runtime models. Evaluate VAD, interruption, live tool timing, transcript drift, and fallback behavior separately from text agents. Cost tier: varies by audio usage.

### Harness requirements
- Prefer Responses API for reasoning agents; use Agents SDK when application code owns orchestration, state, tools, approvals, handoffs, or observability.
- Preserve reasoning items with function-call outputs. In stateless/ZDR mode request encrypted reasoning content and replay it with subsequent turns.
- Use sandbox agents when files, commands, packages, ports, artifacts, snapshots, mounts, or human review are part of the product.
- For realtime voice, define turn-taking, transcript source of truth, tool timing, and fallback channels.

### Re-evaluate when
- Changing between Chat Completions and Responses.
- Changing reasoning effort or moving to/from GPT-5.5-pro.
- Adding realtime voice or hosted/sandbox tools.
- Changing storage mode, ZDR, or stateless conversation handling.
```

In the Gemini section, add:

```md
### API surface
- Use `generateContent` for stable existing integrations.
- Use Interactions API for new agentic workflows that need server-side history, typed execution steps, background tasks, complex reasoning, or multimodal multi-turn state.

### Tool semantics
- Gemini 3 model APIs generate a unique `id` for every function call. If manually constructing conversation history or using REST, return the matching `id` in each function response.
- Gemini supports combined built-in tools and custom function calling on newer APIs. Verify exact model/API support before designing a mixed tool call.

### Modality support
- Gemini Live supports low-latency realtime voice and vision interactions, tool use, transcripts, barge-in, proactive audio, affective dialog, and live translation, with feature differences by model.
- Gemini computer use returns normalized screen coordinates and can emit multiple UI actions in one turn. The harness must execute actions and verify resulting screen state.

### Re-evaluate when
- Moving from `generateContent` to Interactions API.
- Moving to Gemini 3.x reasoning models.
- Adding Live API, computer use, media-resolution controls, or background execution.
```

- [ ] **Step 4: Add Qwen and DeepSeek updates**

Add a new `## Qwen` section and update DeepSeek with:

```md
## Qwen

### API surface
- Qwen deployments vary across DashScope, OpenAI-compatible APIs, vLLM, SGLang, local servers, and Qwen-Agent.

### Tool semantics
- Qwen3 function calling is template- and parser-sensitive. Prefer Qwen-Agent or provider-supported templates for agentic tool use.
- Self-hosted Qwen3-Coder deployments must verify tokenizer, chat template, and tool parser compatibility before production use.

### Reasoning state
- Qwen3-Coder and subsequent series may require explicit thinking-mode configuration depending on provider protocol.

### Harness requirements
- Add a startup validation that sends one simple tool-call fixture through the exact serving stack.
- Run long-chain tool-use evals on the deployment, not just the base model.

### Re-evaluate when
- Changing serving stack, tokenizer, chat template, tool parser, or thinking-mode configuration.
```

For DeepSeek:

```md
### Version-specific notes
- **DeepSeek V3.2**: Reasoning-first model framed for agents. Validate multi-turn tool behavior and structured output on the target provider before using as orchestrator.
- **DeepSeek V3.2-Speciale**: Reasoning-heavy API-only option. Treat as high-latency advisor/reasoner until evals prove agent-loop reliability.
- **deepseek-chat / deepseek-reasoner legacy aliases**: During the 2026 transition they point to `deepseek-v4-flash` non-thinking and thinking modes, and are scheduled for discontinuation on 2026-07-24. Do not build new production configs on these aliases.

### Re-evaluate when
- Any legacy alias is used.
- Switching thinking/non-thinking modes.
- Changing provider because structured output and tool support vary by host.
```

- [ ] **Step 5: Update `model-awareness.md` critical checks**

Add these Pass 1 findings to `agent-architect/checklists/model-awareness.md`:

```md
### 1.5 Reasoning State Not Preserved Across Tool Turns
The model/API requires reasoning items, thinking blocks, encrypted reasoning content, or thought signatures to be preserved across tool turns, but the harness drops them. The next turn loses planning state or returns provider errors.

### 1.6 API Surface Mismatched to Agent Runtime
The application uses a basic chat/content endpoint for a workflow that requires server-managed state, background execution, typed trace steps, sandbox state, realtime sessions, or SDK-owned orchestration.

### 1.7 Model Alias or Deprecated ID in Production
The production config uses a legacy alias, preview ID, or scheduled-deprecation model name without a migration gate or eval baseline.
```

- [ ] **Step 6: Run tests**

Run:

```bash
npm test
```

Expected result: FAIL only on missing new checklists, `SKILL.md` wiring, and missing dimensions.

- [ ] **Step 7: Commit model profile work**

Run:

```bash
git add agent-architect/model-profiles.md agent-architect/checklists/model-awareness.md
git commit -m "feat: refresh model runtime profiles"
```

### Task 4: Add Harness Architecture Checklist

**Files:**
- Create: `agent-architect/checklists/harness-architecture.md`

- [ ] **Step 1: Create `harness-architecture.md`**

Create `agent-architect/checklists/harness-architecture.md` with:

```md
# Harness Architecture Checklist

## Instructions

Apply this checklist to the runtime layer around the model: agent loop, SDK/runtime choice, sandbox/workspace, state persistence, approvals, execution boundaries, artifact flow, provider transport, and recovery orchestration. Read `references/harness-engineering.md` when a finding needs design justification.

## Pass 1 — Critical

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

## Pass 2 — Important

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

## Pass 3 — Minor

### 3.1 No Workspace Manifest Conventions
The workspace has no standard input, output, log, scratch, and artifact paths for agents to use.

### 3.2 No Runtime Capability Inventory
There is no local document listing which provider/runtime capabilities are available: hosted tools, sandbox, MCP, background tasks, voice sessions, structured output, or reasoning summaries.

### 3.3 No Harness Expiry Notes
Model-compensating harness code is not marked with the model capability or provider release that should trigger re-evaluation.

## Suppressions — DO NOT flag

- Single-turn agents with no tools, no filesystem, no external state, and no consequential side effects.
- Internal prototypes where the operator is the only user and the task cannot mutate external systems.
- Deterministic non-LLM workflows wrapped in an agent UI where the model does not control execution.

## Confidence Calibration

- **9-10:** You read the runtime code/config and can point to the missing boundary, state, or approval mechanism.
- **7-8:** The architecture clearly has long-running execution or tool actions but no visible harness contract.
- **5-6:** Runtime code is partially visible; flag with a verification caveat.
- **3-4:** Inferring from docs only; appendix unless the blast radius is critical.
```

- [ ] **Step 2: Run contract tests**

Run:

```bash
npm test
```

Expected result: FAIL because `multimodal-architecture.md` and `SKILL.md` wiring are not done yet.

- [ ] **Step 3: Commit harness checklist**

Run:

```bash
git add agent-architect/checklists/harness-architecture.md
git commit -m "feat: add harness architecture checklist"
```

### Task 5: Add Multimodal Architecture Checklist

**Files:**
- Create: `agent-architect/checklists/multimodal-architecture.md`

- [ ] **Step 1: Create `multimodal-architecture.md`**

Create `agent-architect/checklists/multimodal-architecture.md` with:

```md
# Multimodal Architecture Checklist

## Instructions

Apply this checklist only when the system accepts, generates, streams, or acts on audio, voice, images, screenshots, video, browser state, computer-use actions, or generated media. Read `references/multimodal-agents.md` when a finding needs design justification.

## Pass 1 — Critical

### 1.1 No Turn-Taking Contract for Voice or Realtime Sessions
Voice/realtime behavior depends on provider defaults. There is no explicit policy for voice activity detection, silence timeout, interruption, barge-in, partial speech, or who can speak while tools are running.

### 1.2 No Canonical State Between Media and Text
The system does not define whether audio, transcript, model summary, visual frame, DOM, or tool state is the source of truth. This allows transcript drift, stale screenshots, or generated summaries to override real state.

### 1.3 Multimodal Prompt Injection Not Contained
Images, screenshots, DOM, PDFs, audio transcripts, or video frames are treated as trusted instructions in the same context that has privileged tools or external side effects.

### 1.4 No Media Token, Frame, or Resolution Budget
The system streams or loads media without a budget for frame rate, image resolution, PDF/video sampling, transcript length, or per-modality cost.

### 1.5 Computer-Use Actions Lack Post-Action Validation
The agent can click, type, drag, submit, or navigate based on visual coordinates without verifying the resulting screen state before continuing or taking an external action.

## Pass 2 — Important

### 2.1 No Latency SLO for User-Facing Media
The system has no target for first audio, interruption response, tool-mediated response, full turn completion, or media generation time.

### 2.2 No Degraded-Mode Fallback
If realtime audio, STT, TTS, camera, media generation, or screen control fails, there is no fallback to typed chat, delayed response, lower-fidelity media, or human handoff.

### 2.3 Tool Calls in Live Sessions Have No Timing Policy
The live model can call tools but the product does not define whether tool calls pause speech, produce interim speech, require user confirmation, or time out.

### 2.4 Generated Media Is Not Validated
Images, video, audio, or documents generated by the model are not checked for requested content, text rendering, unsafe content, brand fit, accessibility, or downstream artifact requirements.

### 2.5 No Multimodal Eval Fixtures
Evals do not include noisy audio, interruptions, accents/languages, adversarial visual text, low-quality screenshots, stale frames, generated-media validation, or computer-use state checks.

## Pass 3 — Minor

### 3.1 No Transcript Retention Policy
The system does not specify which transcripts, audio snippets, screenshots, or frames are stored for audit and how long they are retained.

### 3.2 No Accessibility Alternative
A voice or visual workflow has no equivalent text path for users who cannot or do not want to use that modality.

### 3.3 No Per-Modality Cost Breakdown
Cost observability reports aggregate model spend without separating text, audio, image, video, realtime, and computer-use costs.

## Suppressions — DO NOT flag

- Text-only systems.
- Offline media generation tools where a human always reviews outputs before use.
- Internal prototypes where realtime behavior and modality security are explicitly out of scope and no privileged actions are available.

## Confidence Calibration

- **9-10:** You read media/runtime code and found missing policy, validation, budget, or containment.
- **7-8:** The modality is clearly in use and the architecture has no visible modality-specific handling.
- **5-6:** Media integration is visible but runtime behavior is provider-managed; verify with implementation owners.
- **3-4:** Inferring from product screenshots or docs only; appendix unless the side effect is critical.
```

- [ ] **Step 2: Run contract tests**

Run:

```bash
npm test
```

Expected result: FAIL because `SKILL.md` does not yet wire the new dimension names and system-map fields.

- [ ] **Step 3: Commit multimodal checklist**

Run:

```bash
git add agent-architect/checklists/multimodal-architecture.md
git commit -m "feat: add multimodal architecture checklist"
```

### Task 6: Wire the New Dimensions into `SKILL.md`

**Files:**
- Modify: `agent-architect/SKILL.md`

- [ ] **Step 1: Update frontmatter**

Change `version: 0.6.1` to:

```yaml
version: 0.7.0
```

Change the description phrases:

```md
9-dimension scoring
14 lessons
20 cognitive patterns
```

to:

```md
11-dimension scoring
16 lessons
26 cognitive patterns
```

Add these trigger phrases to the description:

```md
"design my agent harness", "audit my voice agent", "review my MCP tools", "evaluate my multimodal agent", "productionize my agent"
```

- [ ] **Step 2: Fix mode reference drift**

In the mode reference table, replace:

```md
7-dimension scored report
```

with:

```md
11-dimension scored report
```

- [ ] **Step 3: Extend Discovery**

After memory detection, add:

```md
2.7. **Detect harness/runtime surfaces (silent — no user interaction):**
   - Glob for: `**/*agent*`, `**/*runner*`, `**/*sandbox*`, `**/*workflow*`, `**/*orchestrat*`, `**/*handoff*`, `**/*trace*`, `**/*approval*`, `**/*guardrail*`
   - Grep for runtime markers: `Responses API`, `Agents SDK`, `SandboxAgent`, `generateContent`, `Interactions API`, `ClaudeAgentOptions`, `claude-agent-sdk`, `MCP`, `modelcontextprotocol`, `tool_search`, `computer_use`, `code_interpreter`, `background=true`, `previous_response_id`, `previous_interaction_id`, `reasoning.encrypted_content`, `thought_signature`
   - Classify runtime: **direct-call**, **SDK loop**, **workflow graph**, **sandbox**, **managed agent**, **custom loop**, or **unknown**
   - Classify execution boundary: **model-only**, **tool proxy**, **sandboxed code**, **host shell**, **browser/computer use**, or **external workflow**
   - Detect state ownership: **client history**, **provider history**, **local files**, **database**, **sandbox snapshot**, **none**, or **unknown**

2.8. **Detect modalities (silent — no user interaction):**
   - Grep for: `realtime`, `voice`, `audio`, `speech`, `transcription`, `TTS`, `STT`, `image`, `vision`, `video`, `screenshot`, `computer use`, `browser use`, `camera`, `webrtc`, `websocket`, `vad`
   - Classify modalities: **text**, **image input**, **image generation**, **audio input**, **audio output**, **voice realtime**, **video input**, **computer/browser use**, **generated video**, or **none**
   - Detect live-session requirements: VAD, barge-in, transcript handling, synchronous tool response, media storage, and latency metrics where visible.

2.9. **Detect MCP/tool ecosystem (silent — no user interaction):**
   - Grep for: `mcp`, `modelcontextprotocol`, `tool_search`, `remote MCP`, `server/tools`, `OAuth`, `resource`, `audience`, `tool annotations`
   - Count MCP servers and agent-facing tools where visible.
   - Classify tool loadout strategy: **all tools in context**, **dynamic tool search**, **filesystem/code-mode APIs**, **router tool**, **manual selection**, or **unknown**.
```

- [ ] **Step 4: Extend the System Map template**

Add these rows after `Memory:`:

```md
Runtime: [direct-call / SDK loop / workflow graph / sandbox / managed agent / custom loop / unknown]
Sandbox: [present / absent / unknown] — execution boundary: [model-only / tool proxy / sandboxed code / host shell / browser/computer use / external workflow]
Reasoning state: [preserved / dropped / not applicable / unknown]
Modalities: [text / image / audio / voice realtime / video / computer-use / none]
MCP/tools: [N MCP servers, M tools] — loadout: [all-in-context / dynamic search / code-mode / router / manual / unknown]
```

- [ ] **Step 5: Add cognitive patterns 21-26**

Append these to the cognitive patterns list:

```md
21. **The Model Runtime Contract** — A model is not just weights behind a string ID. It comes with an API surface, reasoning-state rules, tool semantics, modality support, context behavior, structured-output path, and deprecation schedule. When any of those change, the harness must be re-evaluated.

22. **The Brain/Hands Boundary** — The model should decide only inside the authority boundary it is allowed to affect. Code execution, browser actions, credentials, and external writes belong behind structural boundaries that can be inspected, approved, sandboxed, or denied.

23. **Tool Loadout Beats Tool Hoarding** — A model with every tool in context is not more capable; it is more distracted and easier to misroute. Expose the smallest useful tool set for the current task, and use tool search, filesystem-discoverable APIs, or code-mode for large MCP surfaces.

24. **Trace Is the Unit of Evaluation** — For agents, the answer is not the only output. The trace includes model turns, tool calls, approvals, state mutations, retries, costs, latency, and artifacts. Production evals score the trace and terminal state, not just final prose.

25. **Modality Is an Attack Surface** — Images, screenshots, audio, video, DOM, PDFs, and generated media can all carry instructions. Treat every modality as untrusted input until a containment layer converts it into validated data.

26. **State Has an Owner** — Conversation history, reasoning state, memory, sandbox files, workflow variables, and artifacts must each have one owner. If state ownership is implicit, resets, retries, provider changes, and handoffs will corrupt it.
```

- [ ] **Step 6: Wire checklist application**

In `AUDIT: Deep Evaluation`, add:

```md
6. Read `checklists/harness-architecture.md` — apply against runtime loop, SDK choice, sandbox/workspace, approvals, execution boundaries, state ownership, artifact flow, and recovery orchestration.
```

Then renumber the conditional list and add:

```md
11. Read `checklists/multimodal-architecture.md` — **only if** Discovery step 2.8 detected image, audio, voice realtime, video, computer/browser use, screenshots, generated media, or media tool outputs. For deeper background, read `references/multimodal-agents.md`.
```

Keep memory conditional. Harness Architecture should be scored for production agent systems; if the system is a single-turn no-tool agent, mark it N/A with the suppression reason.

- [ ] **Step 7: Add scoring rows**

Add rows to the scoring rubric:

```md
| Harness Architecture | 1.5x | Runtime boundaries explicit; state ownership clear; sandbox/workspace contract present; approvals before irreversible actions; traces and artifacts inspectable; recovery changes execution conditions | Agent loop works but state, sandbox, approvals, or artifact validation are implicit | Model-directed execution, credentials, tools, state, and artifacts are tangled in one opaque loop |
| Multimodal Architecture | 1.0x | Turn-taking, transcript source of truth, media budgets, modality injection containment, live tool timing, fallback paths, and multimodal evals are explicit | Media works on happy path but lacks latency, fallback, or adversarial-media coverage | Voice/image/video/computer-use actions run with no modality-specific policy or validation |
```

Update the weighted average note to include Harness Architecture at 1.5x.

- [ ] **Step 8: Add completion summary and trend rows**

Add these rows to both completion summary and trend table:

```md
| 10. Harness Architecture  | N/10 or N/A | [1-line summary or "Not applicable"] |
| 11. Multimodal Architecture | N/10 or N/A | [1-line summary or "Not applicable — text-only"] |
```

Also add `runtime_pattern`, `sandbox_present`, `modalities_detected`, `mcp_servers_detected`, `tool_loadout_strategy`, and the two new scores to persisted evaluation frontmatter.

- [ ] **Step 9: Extend DESIGN Detailed Design**

Add these sections after Cost model:

```md
7. **Harness architecture** — runtime/API surface, state owner for conversation/reasoning/workspace/artifacts, execution boundary, sandbox/workspace manifest, approval gates, trace schema, recovery ladder, and model-upgrade re-evaluation triggers.

8. **Multimodal architecture** — include only if the system uses media. Specify modalities, turn-taking, transcript/source-of-truth policy, media token/frame/resolution budget, live tool timing, fallback path, modality injection containment, media retention, and multimodal eval fixtures.
```

Renumber the existing Memory Architecture section to `9`.

- [ ] **Step 10: Run tests**

Run:

```bash
npm test
```

Expected result: PASS only if all linked files exist and dimension strings are wired.

- [ ] **Step 11: Commit SKILL wiring**

Run:

```bash
git add agent-architect/SKILL.md
git commit -m "feat: wire production agent architecture dimensions"
```

### Task 7: Update Existing Checklists for 2026 Failure Modes

**Files:**
- Modify: `agent-architect/checklists/context-management.md`
- Modify: `agent-architect/checklists/tool-design.md`
- Modify: `agent-architect/checklists/eval-infrastructure.md`
- Modify: `agent-architect/checklists/security.md`
- Modify: `agent-architect/checklists/production-readiness.md`
- Modify: `agent-architect/checklists/multi-agent.md`

- [ ] **Step 1: Update context management**

Add these findings:

```md
### 1.6 Reasoning or Thought State Dropped
Provider-required reasoning items, thinking blocks, encrypted reasoning content, or thought signatures are not carried forward even though the model/runtime requires them for multi-turn tool use.

### 2.8 No Tool Loadout Strategy
Large tool catalogs or MCP server definitions are included directly in context instead of selected by task relevance, searched dynamically, or exposed through code-mode/filesystem discovery.

### 2.9 No Media Context Budget
Image, video, audio, screenshots, or PDFs enter context without explicit sampling, resolution, frame, transcript, or per-item token budgets.
```

- [ ] **Step 2: Update tool design**

Add these findings:

```md
### 1.7 Tool Result Cannot Be Used Without Copying Large Payloads
The tool returns or requires a large intermediate payload that the model must copy into another tool call. The tool layer should pass references, file paths, handles, or filtered summaries instead.

### 2.7 MCP Tool Annotations Treated as Trusted
The system relies on MCP annotations, descriptions, or server-provided hints as trusted policy even when they come from untrusted or unverified servers.

### 2.8 No Tool Search or Discovery Interface for Large Tool Sets
The agent has more than 50 possible tools but no `search_tools`, tool categories, progressive disclosure, or filesystem API index.
```

- [ ] **Step 3: Update eval infrastructure**

Add these findings:

```md
### 1.5 No Trace or Terminal-State Evaluation for Agents
Evals score final text but not the tool-call trace, state mutations, approval decisions, artifact outputs, or final database/workspace state.

### 2.6 No Repeated-Trial Reliability Metric
Agent evals run each case once. They do not measure pass rate across repeated stochastic trials or report `pass^k` style reliability.

### 2.7 Security and Utility Not Scored Separately
The same score blends task success with safety behavior, hiding agents that complete tasks while violating prompt-injection, authorization, or approval constraints.

### 2.8 No Modality-Specific Eval Cases
Voice, image, video, realtime, or computer-use agents are evaluated only through text cases.
```

- [ ] **Step 4: Update security**

Add these findings:

```md
### 1.6 Untrusted Data Can Influence Control Flow
Untrusted retrieved content, external documents, media, or peer-agent output can change which tools are called, which recipients receive data, or which external actions are taken.

### 1.7 MCP Authorization or Token Audience Not Verified
HTTP MCP servers or remote tools use OAuth-style authorization but the client/server does not verify audience/resource binding or per-server token scope.

### 2.6 No Runtime Action Interception
High-risk tool calls are not intercepted before execution for allow/warn/block/review decisions based on command, destination, data flow, and blast radius.

### 2.7 Visual or Audio Prompt Injection Surface Untested
The system accepts images, screenshots, video, audio, or transcripts but has no adversarial modality test cases or containment pattern.
```

- [ ] **Step 5: Update production readiness**

Add these findings:

```md
### 1.7 No Background Task Lifecycle for Long-Running Agents
Long-running work has no durable status, cancellation, retry ownership, timeout, progress event, or cleanup path.

### 2.6 No Live Media Latency Budget
Voice/realtime systems lack p50/p95 latency targets and monitoring for first audio, interruption, tool-mediated turns, and full response time.

### 2.7 No Provider Deprecation or Alias Migration Gate
Production model IDs can change or be deprecated without a stored eval baseline, rollout gate, or rollback path.
```

- [ ] **Step 6: Update multi-agent**

Add these findings:

```md
### 2.8 Advisor and Executor Roles Not Separated
A high-cost/high-intelligence model is used for every turn even though only planning or review turns need it, or a cheap executor makes strategy decisions it should escalate.

### 2.9 Handoff Omits State Ownership
Subagents hand off prose summaries but not the concrete state owners: files changed, tools called, decisions made, rejected paths, verification status, and unresolved risks.
```

- [ ] **Step 7: Run tests**

Run:

```bash
npm test
```

Expected result: PASS.

- [ ] **Step 8: Commit checklist updates**

Run:

```bash
git add agent-architect/checklists/context-management.md agent-architect/checklists/tool-design.md agent-architect/checklists/eval-infrastructure.md agent-architect/checklists/security.md agent-architect/checklists/production-readiness.md agent-architect/checklists/multi-agent.md
git commit -m "feat: update agent checklists for runtime and multimodal risks"
```

### Task 8: Update README and Changelog

**Files:**
- Modify: `README.md`
- Modify: `CHANGELOG.md`

- [ ] **Step 1: Update README dimensions**

Replace the AUDIT description with:

```md
- **AUDIT** — Full 11-dimension evaluation of an existing agent system. Scores prompt architecture, tool design, context management, multi-agent orchestration, eval infrastructure, production readiness, model awareness, agent security, memory architecture, harness architecture, and multimodal architecture. Produces a maturity score with prioritized recommendations.
```

Add this paragraph after the mode list:

```md
The current `agent-architect` version is built for production AI systems, not just prompt review. It evaluates model-runtime contracts, long-running harnesses, sandbox and execution boundaries, MCP/tool loadout, memory, multimodal voice/image/video/computer-use surfaces, trace-based evals, and capability-oriented security.
```

- [ ] **Step 2: Add changelog entry**

Add this at the top of `CHANGELOG.md`:

```md
## [0.7.0] — 2026-06-14

### Added
- **Harness Architecture** as the 10th audit dimension, covering runtime boundaries, sandbox/workspace contracts, state ownership, approvals, traceability, artifact validation, and recovery orchestration.
- **Multimodal Architecture** as the 11th audit dimension, applied conditionally for voice, image, video, realtime, browser-use, computer-use, screenshots, and generated media.
- `references/harness-engineering.md`, `references/multimodal-agents.md`, and `references/model-runtime-contracts-2026-06.md` with source-backed guidance for production agent systems.
- Contract tests that verify version consistency, dimension wiring, checklist/reference links, and source-backed reference coverage.
- Cognitive patterns 21-26: Model Runtime Contract, Brain/Hands Boundary, Tool Loadout Beats Tool Hoarding, Trace Is the Unit of Evaluation, Modality Is an Attack Surface, and State Has an Owner.

### Changed
- Refreshed `model-profiles.md` from model-family notes into model-runtime contracts with current OpenAI, Anthropic, Gemini, DeepSeek, Qwen, Mistral, and Llama guidance.
- Expanded model, context, tool, eval, security, production, and multi-agent checklists for reasoning-state preservation, API surface mismatch, MCP/tool loadout, runtime action interception, stochastic evals, and multimodal risks.
- Updated README and package metadata for the 11-dimension production systems release.
```

- [ ] **Step 3: Run tests**

Run:

```bash
npm test
```

Expected result: PASS.

- [ ] **Step 4: Commit docs**

Run:

```bash
git add README.md CHANGELOG.md
git commit -m "docs: document agent architect 0.7.0"
```

### Task 9: Final Verification and Self-Review

**Files:**
- Review all changed files.

- [ ] **Step 1: Run full tests**

Run:

```bash
npm test
```

Expected result: PASS.

- [ ] **Step 2: Scan for plan-prohibited placeholders**

Run:

```bash
rg -n "T[B]D|T[O]DO|implement l[a]ter|fill in d[e]tails|Similar to T[a]sk|appropriate error h[a]ndling|write tests for the ab[o]ve" agent-architect tests README.md CHANGELOG.md package.json
```

Expected result: no matches. If a task-marker token appears in a quoted external source or historical changelog entry, move it out of new content or explain the existing legacy occurrence in the commit notes.

- [ ] **Step 3: Verify dimension consistency manually**

Run:

```bash
rg -n "11-dimension|Harness Architecture|Multimodal Architecture|runtime_pattern|modalities_detected|mcp_servers_detected|tool_loadout_strategy" agent-architect/SKILL.md README.md CHANGELOG.md
```

Expected result: matches in `SKILL.md`, `README.md`, and `CHANGELOG.md`; persistence metadata strings appear in `SKILL.md`.

- [ ] **Step 4: Review git diff**

Run:

```bash
git diff origin/main...
```

Expected result: diff is limited to `agent-architect`, `tests`, `package.json`, `README.md`, and `CHANGELOG.md`.

- [ ] **Step 5: Final commit if verification fixes were needed**

If any verification fixes were made, run:

```bash
git add agent-architect tests package.json README.md CHANGELOG.md
git commit -m "chore: verify agent architect production upgrade"
```

If no fixes were needed, do not create an empty commit.

## Acceptance Criteria

- `npm test` passes.
- `agent-architect/SKILL.md`, `README.md`, `CHANGELOG.md`, and `package.json` all agree on version `0.7.0`.
- `SKILL.md` consistently says 11 dimensions and includes Harness Architecture and Multimodal Architecture in deep evaluation, scoring, completion summary, trend, persistence, review, and design sections.
- New references contain source links and explain why harness, multimodal, and model-runtime updates are necessary.
- Model profiles include current runtime contract fields and current provider notes.
- New dimensions obey the Iron Law: Harness Architecture covers failure modes not fully captured by production/context/security checklists; Multimodal Architecture applies only when media surfaces exist.
- No production code or skill runtime dependencies are added.

## Implementation Estimate

Human team: 1.5-2.5 days.

With AI coding agents: 4-7 hours, split across independent workers for references, model profiles, checklist updates, and SKILL wiring, followed by one integration pass.
