# agent-skills

Claude Code skills for evaluating and designing multi-agent systems.

## Skills

### `/agent-architect`

Senior architect review for agent systems, prompt engineering, and harness design.

**Three modes:**
- **AUDIT** — Full 7-dimension evaluation of an existing agent system. Scores prompt architecture, tool design, context management, multi-agent orchestration, eval infrastructure, production readiness, and model awareness. Produces a maturity score with prioritized recommendations.
- **REVIEW** — Focused teardown of a specific prompt, skill file, or tool definition. Line-by-line findings with confidence scores.
- **DESIGN** — Architect a new agent system from scratch. Produces system prompt drafts, tool specs, failure mode maps, eval plans, and implementation checklists.

## Install

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

In any Claude Code session:

```
/agent-architect
```

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
