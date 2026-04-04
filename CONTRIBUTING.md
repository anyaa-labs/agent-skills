# Contributing to agent-skills

## Local Data Persistence

Skills that need to persist runtime data locally (caches, research results, user preferences) should follow this convention:

```
~/.agent-skills/local/<skill-name>/<skill-decides-structure>
```

### Rules

1. **Namespace by skill name.** `local/<skill-name>/` is your sandbox. Don't write outside it.
2. **Universal vs project-scoped.** If data is universal (e.g., model profiles), store directly under `local/<skill-name>/`. If project-specific, use `local/<skill-name>/projects/{slug}/` (derive slug from git remote origin, sanitized to `[a-zA-Z0-9._-]`).
3. **Include metadata in files.** Use frontmatter with `created_date` or `researched_date`, `source`, and any staleness-relevant fields so the skill can detect outdated data.
4. **Never block on local data failures.** If `~/.agent-skills/` doesn't exist or a file is corrupted, the skill should work fine — just without cached data. Create directories on first write, not on startup.
5. **Don't store secrets.** No API keys, tokens, or credentials. This directory is not encrypted.

### Example

The `agent-architect` skill uses this for caching web-researched model profiles and persisting evaluation history:

```
~/.agent-skills/
└── local/
    └── agent-architect/
        ├── model-research/
        │   ├── qwen-72b.md
        │   └── yi-34b.md
        └── projects/
            └── my-agent-system/
                └── evaluations/
                    ├── 2026-03-15.md
                    └── 2026-04-04.md
```

Model research files have frontmatter with `researched_date` so the skill can flag stale profiles (>90 days) and offer to refresh them. Evaluation files have frontmatter with `evaluated_date`, `git_commit`, and `skill_version` so the skill can determine whether a cached evaluation is still valid or re-evaluation is needed.

### Conflict Avoidance

- Skill-shipped data lives in the skill directory (e.g., `agent-architect/model-profiles.md`)
- User-discovered data lives in `~/.agent-skills/local/<skill-name>/`
- Skill updates replace skill directory files but never touch `~/.agent-skills/`
- If a skill update adds shipped data for something previously user-discovered, the shipped version takes precedence (it's vetted)

## Adding New Skills

Create a new directory with a `SKILL.md` file and run `./setup` to register it. See `agent-architect/SKILL.md` for the expected structure.
