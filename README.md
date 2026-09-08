# agent-skills

Claude Code and Codex skills for evaluating and designing multi-agent systems.

## Skills

### `/agent-architect`

Senior architect review for agent systems, prompt engineering, and harness design.

**Three modes:**
- **AUDIT** — Full 13-dimension evaluation of an existing agent system. Scores prompt architecture, tool design, context management, multi-agent orchestration, eval infrastructure, production readiness, model awareness, agent security, memory architecture, harness architecture, multimodal architecture, sovereignty & residency, and agent identity & authorization. Produces a maturity score with prioritized recommendations.
- **REVIEW** — Focused teardown of a specific prompt, skill file, or tool definition. Line-by-line findings with confidence scores.
- **DESIGN** — Architect a new agent system from scratch. Produces system prompt drafts, tool specs, failure mode maps, eval plans, and implementation checklists.

The current agent-architect version is built for production AI systems, not just prompt review. It evaluates runtime API contracts, tool harness boundaries, MCP/tool governance, background task execution, trace-based evaluation, voice/image/video surfaces when those modalities are present, data-residency/sovereignty constraints when a model, deployment region, or regulatory obligation makes them conditional, and — when the system delegates authority to an agent at all — which principal each agent acts as and what outside the model can refuse a delegated action.

**Research provenance.** The guidance is backed by dated, source-linked reference briefs under `agent-architect/references/`: `agent-engineering-landscape-2026-09.md` (the agent-engineering sweep — loop, harness, identity, evaluation, and cross-model failure modes), `model-landscape-2026-09.md` (model families and runtime contracts), `harness-engineering.md`, `memory-systems.md`, `model-runtime-contracts.md`, and `multimodal-agents.md`. The landscape file labels every research finding `strong` / `suggestive` / `single-result` with its scope conditions, records what it could *not* source as an explicit gap rather than filling it with something plausible, and carries precedence rules for the places its independently-run sweeps disagree with each other. Checklists are written to those labels: a `suggestive` or single-domain result is written as a question to ask, not a defect to expect. A test (`tests/no_unsupported_claims.test.mjs`) greps the checklists for two shapes that repeatedly outran their sources — a single vendor's behaviour pluralized into an industry-wide claim, and a superlative attached to a named source — with an annotated `<!-- source-claim-ok: reason -->` opt-out that requires quoting what the reference actually says. Like the model-fact guard it is two greppable shapes rather than a proof, and it covers `agent-architect/checklists/` only.

**Model data.** Facts about individual model families (context windows, tool-calling semantics, reasoning-state requirements, known failure modes) live one place: `agent-architect/model-profiles/`, one file per family (Anthropic, OpenAI, Google, xAI, Amazon Nova, DeepSeek, Qwen, Meta, Mistral, Cohere, Moonshot, Zhipu, MiniMax, IBM Granite, AI21, Nvidia Nemotron, Ai2 OLMo, Sarvam, Falcon, and other regional families), behind a thin index at `agent-architect/model-profiles.md`. Checklists are kept clear of model names, version strings, context-window numbers, and dated claims, so a checklist finding reads the current profile instead of a fact frozen at write time. A test (`tests/no_hardcoded_models.test.mjs`) greps for them, with one pattern per shipped family plus context-window and dated-fact patterns, and it carries its own two-sided corpus test — a set of strings that must trip it and a set of generic prose that must not — so the guard cannot be silently narrowed. It is still a grep guard rather than a proof: it catches the usual shapes, not every possible phrasing, and it deliberately lets through generic prompt-size thresholds and illustrative dates in examples. A line that genuinely needs a version string opts out with an annotated `<!-- model-ref-ok: reason -->` marker. Each profile carries a `researched_date`; a second test flags any profile over 90 days old and fails the suite past 180, and the skill's own Unknown Model Protocol routes stale or unrecognized families into live re-verification before giving model-specific advice.

## Install

`./setup` installs each skill into both `~/.claude/skills` and `~/.agents/skills`.

```bash
git clone git@github.com:YOUR_ORG/agent-skills.git ~/.claude/skills/agent-skills
cd ~/.claude/skills/agent-skills
./setup
```

Or install from any location:

```bash
git clone git@github.com:YOUR_ORG/agent-skills.git ~/path/to/agent-skills
cd ~/path/to/agent-skills
./setup
```

## Usage

In Claude Code:

```
/agent-architect
```

In Codex, once installed under `~/.agents/skills`, reference `agent-architect` by name in your request.

The skill auto-detects your codebase and selects the appropriate mode. You can also be explicit:

```
/agent-architect audit this system
/agent-architect review this prompt: path/to/prompt.md
/agent-architect design a new agent for customer support
```

## Adding New Skills

Create a new directory with a `SKILL.md` file:

```
agent-skills/
├── agent-architect/SKILL.md    # existing
├── my-new-skill/SKILL.md       # new skill
└── setup                       # auto-discovers all */SKILL.md
```

Run `./setup` to register the new skill.
