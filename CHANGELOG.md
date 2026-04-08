# Changelog

## [0.4.0] — 2026-04-09

### Changed
- **Branch-aware audit cache** — evaluation history is now scoped per git branch, preventing cross-branch trend pollution. Cache lookup partitions evaluation files into same-branch and cross-branch sets. Same-branch evaluations are always preferred; cross-branch evaluations are only used as a fallback when an exact commit match exists (handles fresh branches cut from an already-evaluated commit). TREND comparisons are strictly same-branch only.
- Evaluation files now store `git_branch` in YAML frontmatter (quoted string; detached HEAD stored as `"detached:{7-char-hash}"`). Legacy files without `git_branch` are treated as `"unknown"` and handled gracefully as cross-branch fallbacks.
- EVALUATION HISTORY block in System Map is now labeled with current branch; cross-branch evaluations are surfaced separately when no same-branch history exists.
- TREND block header now includes branch label (`branch: \`main\` — vs. [date]`). First evaluation on a new branch skips TREND and notes cross-branch count.

## [0.3.0] — 2026-04-04

### Added
- **Interactive update notifications** — skills now detect when a newer version is available upstream and prompt the user to update. Shows what's new from the changelog, asks for approval, and performs the upgrade automatically if accepted. Checks are cached (1 hour TTL) so they never slow down skill invocation.
- `bin/update-check` — lightweight bash script that compares local HEAD against `origin/main`, extracts changelog diff between versions.
- `bin/do-upgrade` — performs `git pull --ff-only` and clears the update cache.
- Update check preamble template documented in `CONTRIBUTING.md` for future skills.

## [0.2.0] — 2026-04-02

### Added
- **Model-aware evaluation** — 7th scoring dimension (Model Awareness) detects which LLM models a codebase uses and applies model-specific evaluation criteria. Shipped profiles for 7 model families (Claude, GPT, Gemini, Llama, Mistral, DeepSeek, Command R+). Unknown models researched via web search and cached locally.
- `model-profiles.md` — shipped knowledge base with per-family behavioral profiles and version-specific notes.
- `checklists/model-awareness.md` — new checklist with precedence rule (model-specific overrides generic) and dedup rule.
- Unknown Model Protocol — web search → local cache at `~/.agent-skills/local/agent-architect/model-research/`.
- Cognitive pattern #13: Model-Prompt Fit.
- `CONTRIBUTING.md` — local data persistence guidelines for future skills.

## [0.1.0] — 2026-04-01

### Added
- `/agent-architect` — Senior architect review for multi-agent systems, prompt engineering, and agent harness design. Three modes: AUDIT (full system evaluation), REVIEW (focused prompt teardown), DESIGN (new system from scratch). 6 evaluation dimensions, 12 cognitive patterns, confidence-scored findings.
