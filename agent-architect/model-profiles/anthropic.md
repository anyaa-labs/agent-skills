---
family: anthropic
tier: frontier
researched_date: 2026-06-14
---

# Claude (Anthropic)

### API surface

- Messages API remains the base surface; Claude Agent SDK, code execution, MCP, Skills, and advisor/executor patterns are separate harness decisions.
- Use advisor/executor split when a high-intelligence model should guide a cheaper or more stateful execution worker.

### Reasoning state

- Extended thinking blocks and tool-use history must be preserved according to the API contract.
- Thinking effort changes are behavior changes and should trigger evals, especially for long-running tasks.

### Tool semantics

- Tool descriptions receive prompt-engineering-level attention.
- MCP tools and Skills can reduce prompt bloat, but their descriptions and file contents become part of the instruction/data surface.
- Code-mode or filesystem-discoverable APIs are preferable when an MCP server exposes many tools.

### Modality support

- Claude supports text, vision, document, code, MCP, and skill-driven file workflows depending on model/API surface.
- Voice/realtime support is usually product-harness specific rather than the default Claude API surface.

### Context behavior

- Strong instruction adherence, but long context still suffers from distraction and context rot.
- Initializer prompts and fresh-context handoffs are preferred for long-running work.

### Structured output path

- Use tool schemas, constrained output features where available, XML structure, and assistant prefill/template strategies.

### Deployment & residency

Not yet verified — see Task 4-7.

### Version-specific notes

- **Opus 4.8**: Strong advisor/reviewer/planner model. High effort may be the default on some surfaces; set effort deliberately. Cost tier: $$$$.
- **Opus 4.7 / Opus 4.6**: Use for high-stakes planning, review, and subtle bug finding. Cost tier: $$$$.
- **Sonnet 4.6**: Strong default executor/orchestrator when cost matters and evals support it. Cost tier: $$$.
- **Haiku 4.5**: Good for routing, extraction, and low-risk worker tasks after eval. Cost tier: $$.

### Known production failure modes

- Harness assumes model context alone can carry a multi-hour task.
- Tool descriptions are treated as passive docs instead of model instructions.
- MCP server or Skill content enters the prompt without trust and loadout boundaries.
- Over-conservative abstention is overridden by aggressive retry loops.

### Harness requirements

- Use XML or clearly delimited structure for Claude prompts.
- Build long-running work around initializer output, artifacts, and fresh-context handoffs.
- Keep tool loadouts small or searchable; do not dump huge MCP catalogs into context.
- Respect abstention and escalate with evidence rather than forcing retries.

### Retired / migration targets

Not yet verified — see Task 4-7.

### Re-evaluate when

- Changing model generation or thinking effort.
- Moving tool surfaces into MCP/Skills/code execution.
- Introducing managed-agent or advisor/executor architecture.
- Adding long-running task harnesses or background execution.


### Primary sources

- [Models overview](https://platform.claude.com/docs/en/about-claude/models/overview)
- [Model deprecations](https://platform.claude.com/docs/en/about-claude/model-deprecations)
- [Tool use with Claude](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview)
- [Effort](https://platform.claude.com/docs/en/build-with-claude/effort)
- [Thinking](https://platform.claude.com/docs/en/build-with-claude/thinking)
