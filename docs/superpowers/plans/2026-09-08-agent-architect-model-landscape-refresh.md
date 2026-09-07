# Agent Architect Model Landscape Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring `agent-architect`'s model knowledge current to 2026-09-08, add Sovereignty & Residency as a 12th audit dimension, and restructure the model layer into a per-family data layer whose staleness and fact-duplication are both mechanically detectable.

**Architecture:** `model-profiles.md` becomes a thin index; each provider family moves to `model-profiles/<family>.md` loaded on demand. Every family file carries a `researched_date` that a test checks against today (warn at 90 days, fail at 180) and that Discovery checks at runtime. A grep-guard test forbids model-version strings from re-entering the checklists, so perishable facts can only live in profiles.

**Tech Stack:** Markdown skill files, Node.js built-in test runner (`node --test`), `package.json` scripts, WebSearch/WebFetch for primary-source verification.

**Design doc:** `docs/superpowers/specs/2026-09-08-agent-architect-model-landscape-refresh-design.md`

## Global Constraints

- Target version is **0.8.0**. `package.json` `version` and `SKILL.md` frontmatter `version:` must both read `0.8.0` by the end of Task 11 and must match each other at every commit.
- Audit dimension count becomes **12**. The 12th is named exactly `Sovereignty & Residency` everywhere it appears (frontmatter, Deep Evaluation list, scoring rubric, completion summary, trend table, README).
- Dimension weights: Prompt Architecture, Production Readiness, Agent Security, and Harness Architecture are `1.5x`. All others, including Sovereignty & Residency, are `1.0x`.
- Every family profile file must contain these **11 field headings**, spelled exactly: `### API surface`, `### Reasoning state`, `### Tool semantics`, `### Modality support`, `### Context behavior`, `### Structured output path`, `### Deployment & residency`, `### Known production failure modes`, `### Harness requirements`, `### Retired / migration targets`, `### Re-evaluate when`.
- Every family profile file must carry YAML frontmatter with `family`, `tier` (one of `frontier`, `open-weight`, `regional`), and `researched_date` in `YYYY-MM-DD` form.
- Every family profile file must cite **at least 3 primary-provider links** (the provider's own documentation, model card, or release post). Aggregator blogs, leaderboards, and news roundups do not count toward the minimum and must not be the sole source for any claim.
- No benchmark scores, no pricing tables. Cost stays on the existing coarse `$`/`$$`/`$$$`/`$$$$` tiers.
- **The research brief governs over this plan's prose.** This plan's gap analysis was written before Task 1's primary-source pass and its model names, versions and dates are pre-research paraphrases. Task 4 proved this concretely: three factual claims in its task text (an o3 retirement date, a GPT-4.5 entry, a "Gemini 3.5 Pro") were contradicted by the verified brief, and the implementer was right to override all three. Where this plan names a specific model, version or date, treat it as a pointer to look the fact up in `agent-architect/references/model-landscape-2026-09.md` — never as the fact itself. Overriding this plan on a sourced basis is correct behavior and must be reported, not silently applied.
- No new runtime dependency. `package.json` `dependencies` stays empty; tests use only `node:test`, `node:assert/strict`, `node:fs`, `node:path`.
- Run `npm test` before every commit and record the result in your report. This plan is TDD-ordered: Tasks 2–10 are **expected red** on the specific assertions their successor tasks satisfy, and each task names which failures are expected. No task may introduce a *new* failure outside that named set, and no task may make the suite green by weakening an assertion. Task 11 ends fully green.

---

## File Structure

**Created:**

| Path | Responsibility |
|---|---|
| `agent-architect/model-profiles/anthropic.md` | Claude family runtime contracts |
| `agent-architect/model-profiles/openai.md` | GPT / reasoning / realtime family |
| `agent-architect/model-profiles/google.md` | Gemini family, including Live, computer-use, embodied, and Gemma |
| `agent-architect/model-profiles/deepseek.md` | DeepSeek family |
| `agent-architect/model-profiles/qwen.md` | Qwen family |
| `agent-architect/model-profiles/moonshot.md` | Kimi family |
| `agent-architect/model-profiles/zhipu.md` | GLM family |
| `agent-architect/model-profiles/minimax.md` | MiniMax family |
| `agent-architect/model-profiles/meta.md` | Llama family |
| `agent-architect/model-profiles/mistral.md` | Mistral family |
| `agent-architect/model-profiles/cohere.md` | Command family |
| `agent-architect/model-profiles/sarvam.md` | Sarvam family |
| `agent-architect/model-profiles/falcon.md` | Falcon family |
| `agent-architect/model-profiles/regional-other.md` | Jais 2, ALLaM, K2 Think V2, SEA-LION/Sailor2, HyperCLOVA X, Upstage |
| `agent-architect/checklists/sovereignty-residency.md` | 12th dimension checklist |
| `agent-architect/references/model-landscape-2026-09.md` | Primary-source research brief from Task 1 |
| `tests/model_profiles.test.mjs` | Index integrity, required fields, staleness, per-family source links |
| `tests/no_hardcoded_models.test.mjs` | De-rot grep guard over checklists |

**Modified:**

| Path | Change |
|---|---|
| `agent-architect/model-profiles.md` | Monolith → thin index |
| `agent-architect/SKILL.md` | Version, description, Discovery 2.5 + new 2.10, System Map, Deep Evaluation item 12, scoring rubric, completion summary, trend table, patterns 28–29, Unknown Model Protocol staleness trigger |
| `agent-architect/checklists/model-awareness.md` | Strip hard-coded model facts |
| `agent-architect/checklists/multimodal-architecture.md` | Agentic video, embodied modality, mainstream computer-use |
| `agent-architect/checklists/memory-architecture.md` | Tool-based memory, managed-agent memory trust boundary |
| `agent-architect/checklists/tool-design.md` | Tool Search, Programmatic Tool Calling, MCP 2026-07-28 |
| `agent-architect/checklists/context-management.md` | Tool loadout via search, MCP cacheable lists |
| `agent-architect/checklists/security.md` | MCP 2026-07-28 auth hardening, extensions framework trust |
| `agent-architect/checklists/harness-architecture.md` | Managed-agent runtimes, context preservation |
| `agent-architect/references/multimodal-agents.md` | Frame-sampling guidance made model-conditional |
| `agent-architect/references/memory-systems.md` | Tool-based memory section |
| `tests/agent_architect_contract.test.mjs` | Version 0.8.0, 12 dimensions, `Residency:` System Map field |
| `tests/source_links.test.mjs` | Drop the `Researched 2026-06-14` pin; point at renamed reference |
| `README.md`, `CHANGELOG.md`, `package.json` | 0.8.0 release notes and dimension count |

**Renamed:**

- `agent-architect/references/model-runtime-contracts-2026-06.md` → `agent-architect/references/model-runtime-contracts.md`

---

### Task 1: Primary-source research pass

This task produces no skill changes. It produces the evidence every later task writes from. **Later tasks must not invent model facts; they copy from this brief.**

**Files:**
- Create: `agent-architect/references/model-landscape-2026-09.md`

**Interfaces:**
- Consumes: nothing.
- Produces: `agent-architect/references/model-landscape-2026-09.md`, containing one `## <Family>` section per family with subsections `### Current models`, `### Runtime contract notes`, `### Deployment & residency`, `### Retired`, and `### Primary sources` (a markdown list of provider-owned URLs). Tasks 4–7 read only this file plus the URLs it cites.

- [ ] **Step 1: Verify the frontier families against provider documentation**

Use WebFetch against provider-owned domains only. For each, record current model IDs, the recommended agentic API surface, reasoning-state requirements, tool semantics, modality support, deployment regions, and retired IDs with replacements.

- Anthropic: `https://platform.claude.com/docs/en/about-claude/models/overview`, plus the docs pages for tool search, programmatic tool calling, and managed-agent memory.
- OpenAI: `https://developers.openai.com/api/docs/models`, plus `https://help.openai.com/en/articles/9624314-model-release-notes` for retirement dates.
- Google: `https://ai.google.dev/gemini-api/docs/models` and `https://ai.google.dev/gemini-api/docs/changelog`.

Record every claim with the URL it came from. If a claim cannot be traced to a provider-owned page, drop it.

- [ ] **Step 2: Verify the open-weight families**

DeepSeek (`https://api-docs.deepseek.com/updates`), Qwen (`https://qwen.readthedocs.io/`), Moonshot/Kimi, Zhipu/GLM, MiniMax, Meta Llama (`https://ai.meta.com/blog/`), Mistral (`https://docs.mistral.ai/`), Cohere.

For each, the agent-relevant question is not the benchmark score. It is: what serving stack does the vendor support, does tool calling depend on a chat template or parser, is there a thinking/non-thinking mode switch, and what breaks when self-hosted. Record those.

- [ ] **Step 3: Verify the regional families**

Sarvam (`https://www.sarvam.ai/`), Falcon/TII, and for `regional-other.md`: Jais, ALLaM, K2 Think, SEA-LION/Sailor2, HyperCLOVA X, Upstage.

For these the residency facts are first-class: where inference is hosted, whether self-hosting is offered, which languages and scripts are covered, and any stated compliance posture. Language coverage is an agent capability question, not marketing — an agent serving users in a language the model handles poorly fails in ways no prompt fixes.

- [ ] **Step 4: Verify the MCP specification delta**

Fetch `https://blog.modelcontextprotocol.io/posts/2026-07-28/` and the current spec index. Record what changed from 2025-11-25: stateless core, multi-round-trip requests, header-based routing, cacheable list results, authorization hardening, extensions framework. Note which changes alter agent-architecture guidance versus which are transport details.

- [ ] **Step 5: Write the brief and reconcile against the design's provisional family list**

Write `agent-architect/references/model-landscape-2026-09.md` in the structure named in the Interfaces block above.

Then explicitly reconcile: for each family in the design doc's provisional inventory, state VERIFIED, DROPPED (no primary sources found), or MERGED (folded into another file). **If a family is dropped or merged, say so at the top of the brief** — Tasks 4–7 and the index in Task 3 depend on the final list. This is expected; the design marked the inventory provisional.

- [ ] **Step 6: Commit**

```bash
git add agent-architect/references/model-landscape-2026-09.md
git commit -m "docs: primary-source model landscape research brief for 2026-09"
```

---

### Task 2: Contract tests first

Tests are written before any content change, so every later task has a failing target and a green gate. All tests in this task will fail initially — that is correct.

**Files:**
- Create: `tests/model_profiles.test.mjs`
- Create: `tests/no_hardcoded_models.test.mjs`

**Interfaces:**
- Consumes: the family list finalized in Task 1 Step 5.
- Produces: exported nothing; these are test files. Later tasks depend on the behaviors they enforce — in particular that `agent-architect/model-profiles/` exists, that each file carries the frontmatter and 11 headings from Global Constraints, and that checklists carry no un-annotated model-version strings.

- [ ] **Step 1: Write the profile structure and staleness tests**

Create `tests/model_profiles.test.mjs`:

```javascript
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const PROFILE_DIR = path.join(root, 'agent-architect/model-profiles');
const INDEX_PATH = path.join(root, 'agent-architect/model-profiles.md');

const REQUIRED_HEADINGS = [
  '### API surface',
  '### Reasoning state',
  '### Tool semantics',
  '### Modality support',
  '### Context behavior',
  '### Structured output path',
  '### Deployment & residency',
  '### Known production failure modes',
  '### Harness requirements',
  '### Retired / migration targets',
  '### Re-evaluate when',
];

const VALID_TIERS = new Set(['frontier', 'open-weight', 'regional']);

const familyFiles = () =>
  fs.readdirSync(PROFILE_DIR).filter((f) => f.endsWith('.md')).sort();

const readProfile = (file) =>
  fs.readFileSync(path.join(PROFILE_DIR, file), 'utf8');

const parseFrontmatter = (body) => {
  const match = body.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  const fields = {};
  for (const line of match[1].split('\n')) {
    const kv = line.match(/^([a-z_]+):\s*(.+)$/);
    if (kv) fields[kv[1]] = kv[2].trim();
  }
  return fields;
};

const daysOld = (isoDate) =>
  Math.floor((Date.now() - Date.parse(isoDate)) / 86_400_000);

test('the model-profiles directory exists and is not empty', () => {
  assert.ok(fs.existsSync(PROFILE_DIR), 'agent-architect/model-profiles/ must exist');
  // Raised to 14 in Task 7, once the regional families land.
  assert.ok(familyFiles().length >= 8, 'expected at least 8 family profile files');
});

test('no profile still carries the Task 3 placeholder', () => {
  for (const file of familyFiles()) {
    assert.ok(
      !readProfile(file).includes('Not yet verified'),
      `${file}: still carries the Task 3 placeholder — Tasks 4-7 must replace every instance`,
    );
  }
});

test('every family file has valid frontmatter', () => {
  for (const file of familyFiles()) {
    const fm = parseFrontmatter(readProfile(file));
    assert.ok(fm, `${file}: missing YAML frontmatter`);
    assert.ok(fm.family, `${file}: missing 'family'`);
    assert.ok(VALID_TIERS.has(fm.tier), `${file}: tier '${fm.tier}' not one of ${[...VALID_TIERS]}`);
    assert.match(fm.researched_date ?? '', /^\d{4}-\d{2}-\d{2}$/, `${file}: researched_date must be YYYY-MM-DD`);
  }
});

test('every family file has all 11 required field headings', () => {
  for (const file of familyFiles()) {
    const body = readProfile(file);
    for (const heading of REQUIRED_HEADINGS) {
      assert.ok(body.includes(heading), `${file}: missing '${heading}'`);
    }
  }
});

test('every family file cites at least 3 primary-provider links', () => {
  for (const file of familyFiles()) {
    const links = [...readProfile(file).matchAll(/\]\((https?:\/\/[^)]+)\)/g)];
    assert.ok(links.length >= 3, `${file}: needs at least 3 cited links, found ${links.length}`);
  }
});

test('the index lists exactly the family files that exist', () => {
  const index = fs.readFileSync(INDEX_PATH, 'utf8');
  const listed = new Set(
    [...index.matchAll(/`model-profiles\/([a-z0-9-]+\.md)`/g)].map((m) => m[1]),
  );
  const onDisk = new Set(familyFiles());

  for (const file of onDisk) {
    assert.ok(listed.has(file), `${file} exists on disk but is not listed in model-profiles.md`);
  }
  for (const file of listed) {
    assert.ok(onDisk.has(file), `model-profiles.md lists ${file} but it does not exist on disk`);
  }
});

test('profile data is not dangerously stale', (t) => {
  for (const file of familyFiles()) {
    const fm = parseFrontmatter(readProfile(file));
    const age = daysOld(fm.researched_date);
    assert.ok(
      age <= 180,
      `${file}: researched_date is ${age} days old (hard limit 180). Re-run the research pass.`,
    );
    if (age > 90) {
      t.diagnostic(`WARNING: ${file} is ${age} days old — schedule a refresh.`);
    }
  }
});
```

- [ ] **Step 2: Write the de-rot grep guard**

Create `tests/no_hardcoded_models.test.mjs`. This is the test that makes the fix durable: with it in place, a perishable model fact structurally cannot re-enter a checklist.

```javascript
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const CHECKLIST_DIR = path.join(root, 'agent-architect/checklists');

// A line may keep a model-version string only if it carries this marker,
// with a stated reason. Everything else belongs in a family profile.
const ALLOW_MARKER = /<!--\s*model-ref-ok:\s*\S+/;

const MODEL_VERSION_PATTERNS = [
  { name: 'openai-version', re: /\bgpt-[0-9]/i },
  { name: 'openai-o-series', re: /\bo[1-9]\b(?!\w)/ },
  { name: 'claude-version', re: /\bclaude-(opus|sonnet|haiku|fable|mythos)-?[0-9]/i },
  { name: 'gemini-version', re: /\bgemini[- ][0-9]/i },
  { name: 'deepseek-version', re: /\bdeepseek[- ](chat|reasoner|v[0-9]|r[0-9])/i },
  { name: 'llama-version', re: /\bllama[- ]?[0-9]/i },
  { name: 'qwen-version', re: /\bqwen[0-9]/i },
  { name: 'mistral-version', re: /\bmistral (large|small|medium) [0-9]/i },
  { name: 'command-version', re: /\bcommand[- ]r\+?/i },
  { name: 'context-limit-claim', re: /~?\s?\d{2,3}\s?-\s?\d{2,3}K\b/ },
  { name: 'context-ceiling-claim', re: /beyond\s+~?\d+K/i },
];

test('checklists contain no un-annotated model-version strings', () => {
  const violations = [];

  for (const file of fs.readdirSync(CHECKLIST_DIR).filter((f) => f.endsWith('.md'))) {
    const lines = fs.readFileSync(path.join(CHECKLIST_DIR, file), 'utf8').split('\n');
    lines.forEach((line, i) => {
      if (ALLOW_MARKER.test(line)) return;
      for (const { name, re } of MODEL_VERSION_PATTERNS) {
        if (re.test(line)) {
          violations.push(`${file}:${i + 1} [${name}] ${line.trim().slice(0, 100)}`);
          break;
        }
      }
    });
  }

  assert.deepEqual(
    violations,
    [],
    `Model-version facts belong in agent-architect/model-profiles/<family>.md, not in checklists.\n` +
      `If a mention is genuinely generic, append '<!-- model-ref-ok: reason -->' to the line.\n\n` +
      violations.join('\n'),
  );
});
```

- [ ] **Step 3: Update the two existing test files**

In `tests/agent_architect_contract.test.mjs`, change the version assertions from `0.7.1` to `0.8.0`, change `/11-dimension scoring/` to `/12-dimension scoring/`, append `'Sovereignty & Residency'` to the `dimensions` array, and add `'Residency:'` to the System Map field list in the last test.

In `tests/source_links.test.mjs`, delete the `'Researched 2026-06-14'` entry from the `required` array — it is a freshness pin, not a check, and Task 2 Step 1 replaced it with a real date comparison. Change the `referenceFiles` array entry `'agent-architect/references/model-runtime-contracts-2026-06.md'` to `'agent-architect/references/model-runtime-contracts.md'`.

- [ ] **Step 4: Run the suite and confirm the expected failures**

Run: `npm test`

Expected: FAIL. Specifically — `model-profiles` directory does not exist; index integrity fails; version is `0.7.1` not `0.8.0`; dimension count is 11; `Residency:` absent; renamed reference file absent.

**The grep guard's expected output was verified against the current tree while this plan was written:**

```
VIOLATIONS: 23
```

All 23 are in `agent-architect/checklists/model-awareness.md`, at lines 14, 15, 31, 41, 43, 44, 50, 56, 59, 65, 66, 67, 76, 77, 78, 80, 81, 96, 106, 107, 109, 110, 132. **Zero violations in the other ten checklists** — the pattern set produces no false positives against the existing content, and the rot is concentrated in exactly one file.

If your run reports a different count, the pattern set was transcribed incorrectly — fix the transcription rather than the patterns. Task 8 clears all 23.

- [ ] **Step 5: Commit**

```bash
git add tests/
git commit -m "test: add profile-structure, staleness, and de-rot contract tests

These fail until tasks 3-11 land. The grep guard is the durable fix:
model-version facts can only live in family profiles."
```

---

### Task 3: Build the index and split existing families

Pure mechanical refactor. **No new model data in this task** — content moves verbatim from the monolith so the diff stays reviewable. Tasks 4–7 then refresh the content.

**Files:**
- Create: `agent-architect/model-profiles/{anthropic,openai,google,deepseek,qwen,meta,mistral,cohere}.md`
- Modify: `agent-architect/model-profiles.md` (monolith → index)

**Interfaces:**
- Consumes: the final family list from Task 1 Step 5; the heading and frontmatter contract from Task 2.
- Produces: `agent-architect/model-profiles.md` as an index whose family table rows reference files as `` `model-profiles/<family>.md` `` — the exact backtick form Task 2's index-integrity test matches on.

- [ ] **Step 1: Create the eight family files from the existing content**

For each existing `## <Provider>` section in `agent-architect/model-profiles.md`, create the corresponding file under `agent-architect/model-profiles/`. Move the section body verbatim. Add the frontmatter, using the existing provenance date since the content has not been re-verified yet:

```markdown
---
family: anthropic
tier: frontier
researched_date: 2026-06-14
---

# Claude (Anthropic)

### API surface
...
```

Add the two new required headings to each file. Populate `### Deployment & residency` and `### Retired / migration targets` from the research brief where it covers them; where it does not yet, write `Not yet verified — see Task 4-7.` as a single line.

**This placeholder is explicitly sanctioned for this task only, and it is mechanically bounded:** Task 2's `no profile still carries the Task 3 placeholder` test fails while any instance survives, so it is expected red from here until Task 7 clears the last one. It is a tracked debt with an automatic due date, not an untracked TODO. Reviewers: this is deliberate and enforced — do not flag it as a placeholder defect in Task 3, and do flag it anywhere after Task 7.

The existing "Version-specific notes" content stays as-is for now.

- [ ] **Step 2: Rewrite `model-profiles.md` as the index**

Replace the file's body with the index. Keep the "How to Use", precedence, version-matching, and cost-tier sections that are family-independent. Replace the per-provider sections with:

```markdown
## Family Index

| Family | Profile | Tier | Researched |
|---|---|---|---|
| Claude (Anthropic) | `model-profiles/anthropic.md` | frontier | 2026-06-14 |
| GPT / reasoning / realtime (OpenAI) | `model-profiles/openai.md` | frontier | 2026-06-14 |
| Gemini (Google) | `model-profiles/google.md` | frontier | 2026-06-14 |
| DeepSeek | `model-profiles/deepseek.md` | open-weight | 2026-06-14 |
| Qwen | `model-profiles/qwen.md` | open-weight | 2026-06-14 |
| Llama (Meta) | `model-profiles/meta.md` | open-weight | 2026-06-14 |
| Mistral | `model-profiles/mistral.md` | open-weight | 2026-06-14 |
| Command (Cohere) | `model-profiles/cohere.md` | open-weight | 2026-06-14 |

**Load only the families Discovery detected.** Reading every profile to reason about one wastes context — the same loadout discipline this skill applies to tool definitions (Pattern 23).

## Staleness Protocol

Each family file carries `researched_date`. Compare it against today:

- **≤ 90 days** — use the profile as authoritative.
- **> 90 days** — mark the family STALE in the System Map, and offer live verification via the Unknown Model Protocol (Step 2 onward). Findings derived from a stale profile carry the caveat: "Based on a profile last verified [date]; provider behavior may have changed."
- **> 180 days** — the contract test fails. The profile must be re-researched before release.
```

Keep the existing API-ID-to-family mapping section, and update each bullet to name the file, e.g. `` `claude-*`, `anthropic.*` -> `model-profiles/anthropic.md` ``.

- [ ] **Step 3: Run the tests**

Run: `npm test`

Expected PASS: directory exists, frontmatter, required headings, per-family source links, index integrity, staleness (86 days at plan time — under the 90-day warning).

Expected still-FAIL, all cleared by later tasks: the placeholder test (Task 7), version and dimension count and `Residency:` (Tasks 9, 11), renamed reference (Task 10), grep guard (Task 8).

Introducing any failure outside that list means something went wrong — report it rather than working around it.

- [ ] **Step 4: Commit**

```bash
git add agent-architect/model-profiles.md agent-architect/model-profiles/
git commit -m "refactor: split model profiles into per-family files behind an index

Content moved verbatim; no data refresh in this commit. Discovery now
loads only detected families instead of all eight."
```

---

### Task 4: Refresh the frontier families

**Files:**
- Modify: `agent-architect/model-profiles/anthropic.md`
- Modify: `agent-architect/model-profiles/openai.md`
- Modify: `agent-architect/model-profiles/google.md`
- Modify: `agent-architect/model-profiles.md` (index dates)

**Interfaces:**
- Consumes: `agent-architect/references/model-landscape-2026-09.md` from Task 1.
- Produces: three refreshed profiles with `researched_date: 2026-09-08`, each with a populated `### Retired / migration targets` section that Task 8's rewritten `model-awareness.md` finding 1.7 points at.

- [ ] **Step 1: Refresh `anthropic.md`**

Rewrite the version-specific notes around the current lineup from the research brief: Opus 5, Sonnet 5, Haiku 4.5, and the Mythos-class tier (Fable 5, Fable 5.1, Mythos 5). Keep the existing cost-tier convention.

Add to `### Tool semantics`: tool search and programmatic tool calling as loadout strategies, and the harness implication — an agent with a large MCP surface should discover tools rather than preload every definition.

Add to `### Deployment & residency`: the cloud surfaces the brief verified (Claude API, Bedrock, Google Cloud, Microsoft Foundry) and any region constraints.

Populate `### Retired / migration targets` with superseded 4.x IDs and their replacements.

Set `researched_date: 2026-09-08`.

- [ ] **Step 2: Refresh `openai.md`**

Add GPT-6 Astra with its documented emphasis — computer use, browsing, software engineering, context preservation across Codex sessions — and note the availability status the brief recorded, since a model in limited rollout is a different architectural bet than a GA one.

Populate `### Retired / migration targets` with the retirements the brief verified: o3 (2026-08-26), GPT-4.5 (2026-06-27), and the GPT-4o/4.1 status. **This is the section that lets the skill tell an auditee their production model is gone.** Give each a replacement.

Fix the reasoning-state guidance if the brief shows it changed. Set `researched_date: 2026-09-08`.

- [ ] **Step 3: Refresh `google.md`**

Add the current Gemini lineup (3.5/3.6/3.7 Flash, 3.5 Pro) and Managed Agents API on Agent Platform.

In `### Modality support`, replace fixed frame-sampling guidance with agentic video processing where the brief confirms it, and add embodied reasoning (Robotics ER 2) as a modality with its own harness implications — an embodied agent's action space is physical and its failure modes are not recoverable by retry.

Fold Gemma into this file as an open-weight subsection rather than a separate family, and note that in the index.

Set `researched_date: 2026-09-08`.

- [ ] **Step 4: Update the index dates**

Change the `Researched` column for the three frontier rows to `2026-09-08`.

- [ ] **Step 5: Run the tests**

Run: `npm test`

Expected: profile tests PASS with no staleness diagnostics for these three files. Remaining failures unchanged.

- [ ] **Step 6: Commit**

```bash
git add agent-architect/model-profiles.md agent-architect/model-profiles/{anthropic,openai,google}.md
git commit -m "docs: refresh frontier model profiles to 2026-09 primary sources"
```

---

### Task 5: Refresh the existing open-weight families

**Files:**
- Modify: `agent-architect/model-profiles/{deepseek,qwen,meta,mistral,cohere}.md`
- Modify: `agent-architect/model-profiles.md` (index dates)

**Interfaces:**
- Consumes: `agent-architect/references/model-landscape-2026-09.md`.
- Produces: five refreshed profiles at `researched_date: 2026-09-08`.

- [ ] **Step 1: Fix the incorrect DeepSeek fact and refresh the family**

`deepseek.md` currently states the legacy alias discontinuation of 2026-07-24 as a scheduled future event. That date has passed. Move it into `### Retired / migration targets` in the past tense with its replacement.

Add the current DeepSeek lineup **exactly as the research brief records it**. Keep the existing guidance about validating structured output and tool loops on the target provider — that guidance is about deployment variance, not a specific version, so it survives.

- [ ] **Step 2: Refresh `qwen.md`**

Add the current Qwen lineup **exactly as the research brief records it** — do not carry forward any model name from this plan's own prose. Keep the template/parser/tokenizer validation guidance, which is the most load-bearing content in this profile: for self-hosted Qwen the serving stack dominates base model quality.

- [ ] **Step 3: Refresh `meta.md`, `mistral.md`, and `cohere.md`**

Meta and Cohere: current lineups **exactly as the research brief records them**. For Cohere, keep the structured-output-versus-RAG-mode incompatibility only if the brief confirms it still holds.

**Mistral is a known blocker.** Task 1 found two Mistral documentation pages giving conflicting model-ID conventions and verified only `mistral-large-2512`. Write no other Mistral ID. Refresh what the brief supports, record the rest as a sourcing gap in the file's existing style, and say plainly in your report that Mistral needs a dedicated re-verification pass. An honest gap here is the correct outcome; a plausible-looking ID list is not.

Also fix a Task 3 carry-over while you are in this file: `cohere.md`'s H1 reads `# Command (Cohere)` but the pre-split section title was `## Command R / Cohere`. Use whichever name the refreshed content actually covers.

For each, populate `### Deployment & residency` — for open-weight families the answer includes the self-host path, which is exactly what makes them viable under a residency constraint.

- [ ] **Step 4: Update index dates, run tests, commit**

Run: `npm test` — expected: PASS for all profile tests.

```bash
git add agent-architect/model-profiles.md agent-architect/model-profiles/{deepseek,qwen,meta,mistral,cohere}.md
git commit -m "docs: refresh open-weight model profiles; correct stale DeepSeek deprecation"
```

---

### Task 6: Add the new open-weight families

**Files:**
- Create: `agent-architect/model-profiles/moonshot.md`
- Create: `agent-architect/model-profiles/zhipu.md`
- Create: `agent-architect/model-profiles/minimax.md`
- Modify: `agent-architect/model-profiles.md` (index rows and API-ID mapping)

**Interfaces:**
- Consumes: `agent-architect/references/model-landscape-2026-09.md`.
- Produces: three new profiles, plus API-ID mapping entries `kimi-*`/`moonshot-*` → `moonshot.md`, `glm-*`/`chatglm-*` → `zhipu.md`, `minimax-*`/`abab-*` → `minimax.md`. Task 9's Discovery grep list adds the same identifiers.

- [ ] **Step 1: Write `moonshot.md` (Kimi)**

All 11 headings, frontmatter `family: moonshot`, `tier: open-weight`, `researched_date: 2026-09-08`, at least 3 primary links.

The agent-relevant content the brief should supply: current Kimi models, context handling, tool-calling protocol, and any documented sub-agent orchestration claims. Treat large advertised sub-agent counts as claims to validate, not capabilities to assume — record them under `### Known production failure modes` as something to eval, consistent with how this skill treats every unvalidated capability claim.

- [ ] **Step 2: Write `zhipu.md` (GLM)**

Same structure. Record the serving stacks, tool-calling protocol, and hosted-versus-self-hosted split.

- [ ] **Step 3: Write `minimax.md`**

Same structure.

- [ ] **Step 4: Add index rows and API-ID mappings**

Add three rows to the family table and three bullets to the API-ID-to-family mapping.

- [ ] **Step 5: Run the tests**

Run: `npm test`

Expected: index-integrity test PASSES with the new files (it fails if a file exists but is unlisted, or listed but missing — verify both directions by temporarily removing a row, seeing the failure, then restoring it).

- [ ] **Step 6: Commit**

```bash
git add agent-architect/model-profiles.md agent-architect/model-profiles/{moonshot,zhipu,minimax}.md
git commit -m "docs: add Moonshot, Zhipu, and MiniMax model profiles"
```

---

### Task 7: Add the regional and sovereign families

**Files:**
- Create: `agent-architect/model-profiles/sarvam.md`
- Create: `agent-architect/model-profiles/falcon.md`
- Create: `agent-architect/model-profiles/regional-other.md`
- Modify: `agent-architect/model-profiles.md` (index rows, API-ID mapping, and a tier note)

**Interfaces:**
- Consumes: `agent-architect/references/model-landscape-2026-09.md`.
- Produces: three `tier: regional` profiles whose `### Deployment & residency` sections are the evidence base Task 9's `sovereignty-residency.md` checklist reads.

- [ ] **Step 1: Write `sarvam.md`**

Frontmatter `family: sarvam`, `tier: regional`.

`### Deployment & residency` carries the most weight in this file: India-hosted inference, what that means for a system with a data-residency obligation, and the self-host path if one exists.

`### Modality support` must record language and script coverage explicitly. For a regional model this is a capability boundary, not a marketing line — an agent that routes a Marathi request to a model evaluated only on Hindi fails in a way no prompt engineering repairs. Note voice-first optimization where the brief confirms it, since that interacts with the Multimodal dimension.

- [ ] **Step 2: Write `falcon.md`**

Same structure, with UAE/TII hosting and self-host posture in `### Deployment & residency`, and Arabic-script and code-switching coverage in `### Modality support`.

- [ ] **Step 3: Write `regional-other.md`**

One `## <Model>` subsection each for Jais 2, ALLaM, K2 Think V2, SEA-LION/Sailor2, HyperCLOVA X, and Upstage — but the 11 required headings apply at the **file** level, covering what is common across the group, with per-model deltas in the subsections. This keeps the file passing the structural test without forcing eleven near-empty headings per model.

Where a model has thin public agent-relevant documentation, say so plainly under `### Known production failure modes`: "Agent runtime semantics not publicly documented as of 2026-09-08; validate tool-calling and structured output against the deployment before production use." An honest gap is more useful than a padded profile.

- [ ] **Step 4: Add index rows, mappings, and a tier note**

Add the three rows. Add API-ID mappings for `sarvam-*`, `falcon-*`, `jais-*`, `allam-*`, `sea-lion-*`, `sailor-*`, `hyperclova-*`, `solar-*`.

Add a short note under the family table:

```markdown
**Regional tier.** These models are selected for residency, language coverage, or
sovereignty obligations as often as for capability. When one is detected, the
Sovereignty & Residency dimension applies — see `checklists/sovereignty-residency.md`.
```

- [ ] **Step 5: Raise the family-count floor and clear the placeholder**

All families now exist, so pin the total. In `tests/model_profiles.test.mjs`, change the count assertion and drop the now-obsolete comment:

```javascript
  assert.ok(familyFiles().length >= 14, 'expected at least 14 family profile files');
```

Then confirm no profile still carries the Task 3 placeholder:

```bash
grep -rn "Not yet verified" agent-architect/model-profiles/
```

Expected: no output. If any line remains, the family it belongs to was not fully refreshed in Tasks 4–7 — go back and finish it rather than deleting the placeholder.

- [ ] **Step 6: Run the tests and commit**

Run: `npm test`

Expected: **every test in `tests/model_profiles.test.mjs` now PASSES**, including the placeholder test that has been red since Task 3. Still failing: version, dimension count, `Residency:`, renamed reference, grep guard — Tasks 8–11.

```bash
git add tests/model_profiles.test.mjs agent-architect/model-profiles.md agent-architect/model-profiles/{sarvam,falcon,regional-other}.md
git commit -m "docs: add Sarvam, Falcon, and regional sovereign model profiles

Pins the family count at 14 and clears the Task 3 placeholder debt."
```

---

### Task 8: De-rot `model-awareness.md`

This task clears the 23 grep-guard violations recorded in Task 2 Step 4. It is the structural payoff of the whole plan.

The violations cluster into five findings — 1.1 (format), 1.2 (structured output), 1.3 (context window), 1.4 (failure modes), 1.7 (deprecated IDs) — plus 2.1 (wrong model for role), 3.1 (suboptimal selection), and the two precedence-rule examples at lines 14–15. Steps 1–3 below address them in that order.

**Files:**
- Modify: `agent-architect/checklists/model-awareness.md`

**Interfaces:**
- Consumes: the grep-guard test from Task 2; the populated `### Retired / migration targets` sections from Tasks 4–7.
- Produces: a checklist with zero un-annotated model-version strings. No later task depends on its internal structure.

- [ ] **Step 1: Rewrite finding 1.1 (prompt format mismatch)**

Replace the bulleted list of per-model format rules with a pointer:

```markdown
**What to look for:** Read the detected family's profile and compare its
documented prompt-format preference against the artifact. Report the mismatch
with the profile's own wording as evidence. If the profile is silent on format,
this finding does not apply.
```

- [ ] **Step 2: Rewrite findings 1.2, 1.3, 1.4, 1.7, and 2.1 the same way**

Each currently embeds a per-model fact list. Each becomes a procedure that reads the family profile:

- **1.2 (structured output):** consult `### Structured output path`; flag when the profile documents an enforcement mechanism the code does not use.
- **1.3 (context window):** consult `### Context behavior`; drop the hard-coded per-model thresholds entirely. Keep the existing note that the 8K prompt-quality threshold is not a context-window question — that note is model-independent and stays.
- **1.4 (known failure mode):** consult `### Known production failure modes`; flag any listed mode with no mitigation present.
- **1.7 (deprecated ID):** consult `### Retired / migration targets`; flag a production config naming a retired ID, and cite the profile's replacement. This finding gets **stronger** after the refresh, because the retired lists are now populated and current.
- **2.1 (wrong model for role):** consult the profile's version-specific notes and cost tier.
- **3.1 (suboptimal selection):** replace the named upgrade examples with "compare the detected model's cost tier and documented strengths against the role it fills."

- [ ] **Step 3: Rewrite the precedence-rule examples**

The precedence section's worked examples name specific models. Rewrite them to use a placeholder form — "profile states X; generic checklist item says Y; suppress Y and report the model-aware finding" — so the mechanism is taught without embedding perishable facts.

- [ ] **Step 4: Add the staleness caveat**

Under "Confidence Calibration", add:

```markdown
- **Stale profile:** If the family profile's `researched_date` is more than 90 days
  old, cap confidence at 6 and append: "Based on a profile last verified [date];
  provider behavior may have changed." Offer live verification via the Unknown
  Model Protocol.
```

- [ ] **Step 5: Annotate any genuinely generic survivor**

If a line legitimately needs a model name — for instance an illustrative example that teaches a pattern rather than asserting a current fact — append `<!-- model-ref-ok: illustrative, not a current-state claim -->`. Use this sparingly; each use is a small debt.

- [ ] **Step 6: Run the grep guard**

Run: `node --test tests/no_hardcoded_models.test.mjs`

Expected: PASS. If it reports violations, they are either facts that belong in a family profile (move them) or genuinely generic lines (annotate them). Do not widen the pattern set to make the test pass.

- [ ] **Step 7: Run the full suite and commit**

Run: `npm test`

```bash
git add agent-architect/checklists/model-awareness.md
git commit -m "refactor: remove hard-coded model facts from model-awareness checklist

Findings now read the detected family profile instead of embedding a
copy. The grep guard prevents regressions."
```

---

### Task 9: Add the Sovereignty & Residency dimension

**Files:**
- Create: `agent-architect/checklists/sovereignty-residency.md`
- Modify: `agent-architect/SKILL.md` (Discovery 2.10, System Map, Deep Evaluation item 12, scoring rubric, completion summary, trend table)

**Interfaces:**
- Consumes: the `### Deployment & residency` sections from Tasks 4–7; the 12-dimension assertions from Task 2 Step 3.
- Produces: the dimension name `Sovereignty & Residency` and the System Map field `Residency:`, both asserted by `tests/agent_architect_contract.test.mjs`.

- [ ] **Step 1: Write the checklist**

Create `agent-architect/checklists/sovereignty-residency.md` following the exact shape of the existing checklists: Instructions, a conditional-application note, a Dedup Rule, three severity passes, Suppressions, and Confidence Calibration.

Pass 1 (Critical): inference crosses a declared residency boundary; prompts, logs, or traces egress to a region the inference call itself respects — **the most common real failure, because teams pin the model endpoint and forget the observability pipeline**; a model is used in a deployment where its licence or hosting makes it legally unusable.

Pass 2 (Important): language or script coverage mismatched to the user population; code-switching unevaluated in a multilingual deployment; no fallback when a sovereign endpoint is unavailable, or a fallback that silently crosses the boundary; residency asserted in documentation but not enforced in code.

Pass 3 (Minor): region pinned by convention rather than configuration; no recorded residency owner; compliance regime named without a mapping to a concrete technical control.

Dedup Rule: data-flow containment belongs to `security.md`; runtime placement belongs to `harness-architecture.md`; compliance gating belongs to `production-readiness.md`. This checklist owns the residency contract itself. Cross-reference rather than restate.

Suppressions: do not flag single-region systems with no stated residency requirement; do not flag prototypes; do not infer a compliance obligation the codebase never states.

**Do not name specific model versions in this file** — the grep guard covers it.

- [ ] **Step 2: Add Discovery step 2.10**

Insert after step 2.9 in `agent-architect/SKILL.md`:

```markdown
2.10. **Detect residency and sovereignty constraints (silent — no user interaction):**
   - Grep for regional model identifiers: `sarvam`, `falcon`, `jais`, `allam`, `sea-lion`, `sailor`, `hyperclova`, `solar`, `k2-think`
   - Grep for region configuration: `region=`, `ap-south`, `eu-west`, `me-central`, `us-gov`, sovereign-cloud endpoints, Bedrock/Azure/Vertex region pinning
   - Grep for compliance and residency markers: `DPDP`, `GDPR`, `data residency`, `on-prem`, `VPC endpoint`, `air-gapped`, `sovereign`, `data localization`
   - Grep for self-hosted serving bound to a declared region: `vllm`, `sglang`, `text-generation-inference`, `ollama` alongside any region marker
   - Also check where logs, traces, and eval data are sent — an observability pipeline that egresses is a residency finding even when inference does not
   - Output as a new line in the System Map: `Residency: [declared region(s); inference host; egress boundary] / [absent]`
   - This detection gates whether the Sovereignty & Residency checklist runs in Deep Evaluation. If absent, the dimension scores N/A and is excluded from the weighted average.
```

- [ ] **Step 3: Add Deep Evaluation item 12**

Under "Apply conditionally" in `### AUDIT: Deep Evaluation`:

```markdown
12. Read `checklists/sovereignty-residency.md` — **only if** Discovery step 2.10 detected regional models, region pinning, compliance markers, or region-bound self-hosted serving. Cross-reference the detected family's `### Deployment & residency` section for what the provider actually supports.
```

- [ ] **Step 4: Add the scoring rubric row**

Append to the rubric table, after Multimodal Architecture:

```markdown
| Sovereignty & Residency | 1.0x | Residency boundary declared and enforced in code; inference, logs, traces, and eval data all respect it; model choice legally valid for the deployment; language/script coverage matches the user population; in-boundary fallback exists | Residency stated in docs but enforced only by convention; observability pipeline egresses; no in-boundary fallback | Regional obligation claimed with no technical control; inference or telemetry crosses the boundary unnoticed |
```

Leave the "Overall Maturity Score" weighting sentence unchanged — Sovereignty & Residency is 1.0x, so the list of 1.5x dimensions does not change.

- [ ] **Step 5: Add the completion summary and trend rows**

In the completion summary block, add after row 11:

```
| 12. Sovereignty & Residency | N/10 or N/A | [1-line summary or "Not applicable — no residency constraint"] |
```

In the TREND table, add after Multimodal Architecture:

```
| Sovereignty & Residency  | N → N          | ↑/→/↓ | [1-line why]    |
```

Then add, immediately below the TREND table:

```markdown
Evaluations recorded before skill version 0.8.0 have no Sovereignty & Residency
score. Render the row as `— → N` with the note "new dimension in 0.8.0". Do not
report its appearance as a regression.
```

- [ ] **Step 6: Run the tests**

Run: `npm test`

Expected: the dimension-consistency and System Map tests PASS. Version test still fails until Task 11.

- [ ] **Step 7: Commit**

```bash
git add agent-architect/checklists/sovereignty-residency.md agent-architect/SKILL.md
git commit -m "feat: add Sovereignty & Residency as the 12th audit dimension"
```

---

### Task 10: Cross-cutting checklist and reference updates

**Files:**
- Modify: `agent-architect/checklists/{multimodal-architecture,memory-architecture,tool-design,context-management,security,harness-architecture}.md`
- Modify: `agent-architect/references/{multimodal-agents,memory-systems}.md`
- Rename: `agent-architect/references/model-runtime-contracts-2026-06.md` → `agent-architect/references/model-runtime-contracts.md`
- Modify: `agent-architect/SKILL.md` (reference path, Discovery grep additions)

**Interfaces:**
- Consumes: the MCP delta and provider capability notes from Task 1.
- Produces: `agent-architect/references/model-runtime-contracts.md` at the path `tests/source_links.test.mjs` expects after Task 2 Step 3.

- [ ] **Step 1: Rename the runtime-contracts reference**

```bash
git mv agent-architect/references/model-runtime-contracts-2026-06.md agent-architect/references/model-runtime-contracts.md
```

Inside the file, change the title to `# Model Runtime Contracts` and move the date into a `## Current Snapshot` section header (`Researched 2026-09-08`). Update the "Profile Fields Required" list to the 11 headings from Global Constraints. Refresh the Provider Notes from the Task 1 brief.

Then update the two references to the old filename in `agent-architect/SKILL.md` and `agent-architect/model-profiles.md`.

- [ ] **Step 2: Correct the multimodal frame-sampling guidance**

In `references/multimodal-agents.md` and `checklists/multimodal-architecture.md`, the current guidance prescribes fixed frame sampling and media-resolution budgets as universal. Make it conditional: where a model supports agentic video navigation, a fixed sampling rate is the wrong default and the budget question becomes how many navigation steps the agent may take.

Add embodied/robotics as a modality in the checklist, with a Pass 1 finding: physical actions are not retry-safe, so an embodied agent needs pre-action validation rather than post-action recovery.

Reclassify computer-use from an exotic surface to a mainstream one now that frontier models ship it as a headline capability.

- [ ] **Step 3: Add tool-based memory**

In `references/memory-systems.md`, add a section covering memory operations exposed as callable tools invoked during the reasoning loop, contrasted with a fixed retrieval pre-step: the pre-step pays retrieval cost on every turn regardless of need, while the tool form lets the agent decide.

In `checklists/memory-architecture.md`, add a Pass 2 finding for a fixed pre-step where a tool surface would fit, and a **Pass 1** finding for the trust boundary that file-backed, cross-agent-shared managed memory creates: when one agent's memory writes are readable by another, a poisoned write becomes a lateral-movement vector — which the current checklist's memory-poisoning finding does not cover, because it assumes a single-agent store.

- [ ] **Step 4: Update tool and context guidance for MCP 2026-07-28**

In `checklists/tool-design.md`, add tool search and programmatic tool calling as recognized loadout strategies, and a finding for a large static tool surface where search is available.

In `checklists/context-management.md`, add cacheable list results and their effect on the loadout budget.

In both, update MCP spec references from 2025-11-25 to 2026-07-28. Record only what changes agent architecture — the stateless core, multi-round-trip requests, and cacheable lists. Header-based routing is a transport detail; leave it out.

- [ ] **Step 5: Update security and harness checklists**

`security.md`: MCP 2026-07-28 authorization hardening, and the extensions framework as a new trust surface — an extension is code the agent's tool layer honors, so it inherits the same untrusted-until-verified posture as tool annotations.

`harness-architecture.md`: managed-agent runtimes as a recognized runtime class, and cross-session context preservation as a state-ownership question — who owns the preserved context, and what happens when it is stale or wrong.

- [ ] **Step 6: Add the new Discovery grep terms**

In Discovery step 2.5, add the new family identifiers: `kimi`, `moonshot`, `glm`, `minimax`, `sarvam`, `falcon`, `jais`, `allam`, `sea-lion`, `hyperclova`, `solar`.

In step 2.5, add the staleness check:

```markdown
   - For each KNOWN family, compare its `researched_date` against today. If more than 90 days old, mark it STALE in the System Map and route into the Unknown Model Protocol (Step 2 onward) to offer live verification.
```

In step 2.9, add `tool_search`, `programmatic tool calling`, and MCP extension markers.

- [ ] **Step 7: Update the Unknown Model Protocol trigger**

Change its opening line from "When a model is detected in the codebase but NOT found in shipped `model-profiles.md`" to:

```markdown
When a model is detected in the codebase but NOT found in the shipped family
profiles, **or when its family profile is more than 90 days old**:
```

- [ ] **Step 8: Run the grep guard and full suite**

Run: `npm test`

Expected: the grep guard still passes — Steps 2–5 must not reintroduce version strings into checklists. If it fails, the offending fact belongs in a family profile.

- [ ] **Step 9: Commit**

```bash
git add agent-architect/
git commit -m "docs: update checklists and references for MCP 2026-07-28, agentic video, tool-based memory"
```

---

### Task 11: Patterns, version bump, and release notes

**Files:**
- Modify: `agent-architect/SKILL.md` (patterns 28–29, frontmatter version and description)
- Modify: `package.json`, `README.md`, `CHANGELOG.md`

**Interfaces:**
- Consumes: everything from Tasks 3–10.
- Produces: version `0.8.0` in both `package.json` and `SKILL.md` frontmatter, satisfying the version test from Task 2 Step 3.

- [ ] **Step 1: Add cognitive patterns 28 and 29**

Append to the Cognitive Patterns section, matching the existing entries' voice — a named principle, the failure it prevents, and the question to ask when reviewing:

```markdown
28. **Residency Is an Architecture Constraint** — Where inference runs, where prompts and traces land, and which models are legally usable are design inputs, not deployment details discovered at launch. The common failure is partial: the team pins the model endpoint to a region and leaves the logging, tracing, and eval pipeline pointed at the default. When you see a residency claim, ask: which line of code enforces it, and does the telemetry respect the same boundary?

29. **Memory as Tool Surface, Not Pre-Step** — A fixed retrieval step before every turn pays full cost whether or not the turn needs memory. Exposing store, recall, update, and discard as callable tools lets the agent decide. Ask: does this system retrieve because the turn needs it, or because the pipeline always does?
```

- [ ] **Step 2: Update the SKILL.md frontmatter**

Set `version: 0.8.0`. In the description, change `11-dimension scoring` to `12-dimension scoring` and `26 cognitive patterns` to `28 cognitive patterns`. Add a clause naming the Sovereignty & Residency dimension alongside the existing Memory/Harness/Multimodal clause, and add `"which model should I use"` and `"is my agent compliant with data residency"` to the invocation triggers.

- [ ] **Step 3: Update `package.json` and `README.md`**

Set `"version": "0.8.0"`.

In `README.md`, update the AUDIT bullet from 11 to 12 dimensions and name the new one. Add a short paragraph on the per-family profile layout and the staleness protocol, since a contributor's first question will be where model data lives and when it needs refreshing.

- [ ] **Step 4: Write the CHANGELOG entry**

Add a `## [0.8.0] — 2026-09-08` section above `## [0.7.1]`, with Added / Changed / Fixed subsections, matching the existing entries' level of detail.

Under **Fixed**, name the two corrected errors explicitly: the DeepSeek alias deprecation stated as a future event after its date had passed, and the fixed frame-sampling guidance superseded by agentic video processing. These are corrections, not additions, and a reader upgrading deserves to know their prior audits may have carried them.

- [ ] **Step 5: Run the full suite**

Run: `npm test`

Expected: **all tests PASS**, with no staleness diagnostics.

- [ ] **Step 6: Verify the skill still self-describes consistently**

Run:

```bash
grep -c 'Sovereignty & Residency' agent-architect/SKILL.md
```

Expected: at least 4 — Deep Evaluation, scoring rubric, completion summary, and trend table. The frontmatter mention may add a fifth.

- [ ] **Step 7: Commit**

```bash
git add agent-architect/SKILL.md package.json README.md CHANGELOG.md
git commit -m "feat: agent-architect 0.8.0 — 12 dimensions, per-family profiles, staleness protocol"
```

---

## Self-Review Notes

**Spec coverage.** Each design section maps to tasks: profile split → Tasks 3–7; 12th dimension → Task 9; staleness protocol → Tasks 2 (test), 3 (index doc), 10 (runtime trigger); de-rot enforcement → Tasks 2 and 8; content changes table → Task 10; sourcing discipline → Task 1 and the Global Constraints link minimum; testing table → Task 2; migration and versioning → Tasks 9 (trend note) and 11.

**Known risk carried forward.** Task 1 may drop or merge families, changing the file list in Tasks 3, 6, and 7. This is expected and the design marked the inventory provisional. Task 1 Step 5 requires the reconciliation to be stated at the top of the brief so later tasks read the final list, not the provisional one.

**Placeholder exception.** Task 3 Step 1 permits the literal line `Not yet verified — see Task 4-7.` in two headings. This is bounded: Tasks 4–7 replace every instance, and Task 11 Step 5's green suite plus a manual `grep -rn "Not yet verified" agent-architect/model-profiles/` returning nothing confirms it.
