# agent-skills

Claude Code and Codex skills for evaluating and designing multi-agent systems.

## Skills

### `/agent-architect`

Senior architect review for agent systems, prompt engineering, and harness design.

**Three modes:**
- **AUDIT** — Full 12-dimension evaluation of an existing agent system. Scores prompt architecture, tool design, context management, multi-agent orchestration, eval infrastructure, production readiness, model awareness, agent security, memory architecture, harness architecture, multimodal architecture, and sovereignty & residency. Produces a maturity score with prioritized recommendations.
- **REVIEW** — Focused teardown of a specific prompt, skill file, or tool definition. Line-by-line findings with confidence scores.
- **DESIGN** — Architect a new agent system from scratch. Produces system prompt drafts, tool specs, failure mode maps, eval plans, and implementation checklists.

The current agent-architect version is built for production AI systems, not just prompt review. It evaluates runtime API contracts, tool harness boundaries, MCP/tool governance, background task execution, trace-based evaluation, voice/image/video surfaces when those modalities are present, and data-residency/sovereignty constraints when a model, deployment region, or regulatory obligation makes them conditional.

**Model data.** Facts about individual model families (context windows, tool-calling semantics, reasoning-state requirements, known failure modes) live one place: `agent-architect/model-profiles/`, one file per family (Anthropic, OpenAI, Google, DeepSeek, Qwen, Meta, Mistral, Cohere, Moonshot, Zhipu, MiniMax, IBM Granite, Sarvam, Falcon, and other regional families), behind a thin index at `agent-architect/model-profiles.md`. Checklists are kept clear of model names, version strings, context-window numbers, and dated claims, so a checklist finding reads the current profile instead of a fact frozen at write time. A test (`tests/no_hardcoded_models.test.mjs`) greps for them, with one pattern per shipped family plus context-window and dated-fact patterns. It is a grep guard rather than a proof: it catches the usual shapes, not every possible phrasing, and it deliberately lets through generic prompt-size thresholds and illustrative dates in examples. A line that genuinely needs a version string opts out with an annotated `<!-- model-ref-ok: reason -->` marker. Each profile carries a `researched_date`; a second test flags any profile over 90 days old and fails the suite past 180, and the skill's own Unknown Model Protocol routes stale or unrecognized families into live re-verification before giving model-specific advice.

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
