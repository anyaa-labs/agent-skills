---
family: openai
tier: frontier
researched_date: 2026-06-14
---

# OpenAI GPT, Reasoning, and Realtime

### API surface

- Use Responses API for production reasoning agents that call tools, preserve reasoning, or need hosted tools.
- Use Agents SDK when application code owns orchestration, state, tools, approvals, handoffs, guardrails, or tracing.
- Use sandbox agents when files, commands, packages, ports, artifacts, snapshots, mounts, or human review are part of the product.
- Preserve Chat Completions only for legacy simple chat paths where no reasoning-state or hosted-tool contract is needed.

### Reasoning state

- Reasoning models work best when reasoning items are carried forward with function-call outputs.
- In stateless or zero-data-retention setups, request encrypted reasoning content and replay it with subsequent turns.
- Dropping reasoning items can produce lower quality and can break multi-step tool loops.

### Tool semantics

- Function calling supports strict schemas and parallel calls on capable models.
- Tool calls are trace objects, not just generated JSON. Preserve call IDs, outputs, and reasoning items together.
- Hosted tools and SDK tools should be audited as part of the harness, not hidden behind "model capability."

### Modality support

- GPT-5.x covers text, coding, reasoning, image-capable workflows depending on model ID, and hosted tools.
- GPT-Realtime models cover low-latency speech-to-speech, translation, transcription, and live tool-mediated interactions.

### Context behavior

- Large context does not remove the need for relevance selection. Long conversations still need phase-aware handoffs and trace summaries.
- Treat cached/static context and per-turn dynamic state as separate cost surfaces.

### Structured output path

- Use strict schemas for tool definitions and structured outputs where supported.
- For non-tool JSON, validate output before persistence or downstream actions.

### Deployment & residency

Not yet verified — see Task 4-7.

### Version-specific notes

- **GPT-5.5**: Start here for complex reasoning, coding, scientific reasoning, and multi-step agentic workflows. Use Responses API for best reasoning/tool performance. Preserve reasoning items across tool calls; in stateless or ZDR mode include and replay encrypted reasoning content. Cost tier: $$$$.
- **GPT-5.5-pro**: Highest-intelligence option when latency can be higher. Use for reviewer, planner, scientific reasoning, and difficult coding roles, not bulk worker turns. Cost tier: $$$$.
- **GPT-5.4**: Lower-cost reasoning option. Good for production flows where GPT-5.5 quality is not required every turn. Cost tier: $$$.
- **GPT-5.4-mini / GPT-5.4-nano**: Use for latency/cost-sensitive routing, extraction, transformation, and lightweight tool workers after eval proves quality. Confirm tool-search and schema support before use. Cost tier: $$/$.
- **GPT-Realtime-2 / GPT-Realtime-Translate / GPT-Realtime-Whisper**: Voice runtime models. Evaluate VAD, interruption, live tool timing, transcript drift, and fallback behavior separately from text agents. Cost tier: varies by audio usage.
- **GPT-4.1 and GPT-4o legacy paths**: Keep existing mitigations for literal instruction following, sycophancy, and strict schema enforcement until evals prove the migration target absorbs them.

### Known production failure modes

- Reasoning state dropped across tool calls.
- Generic Chat Completions endpoint used for a workflow that needs SDK state, background execution, approvals, or sandbox artifacts.
- Realtime voice paths without VAD, interruption, transcript, or fallback contracts.
- Legacy prompt scaffolding retained after model upgrades without eval.

### Harness requirements

- Prefer Responses API for reasoning agents; use Agents SDK when application code owns orchestration, state, tools, approvals, handoffs, or observability.
- Preserve reasoning items with function-call outputs. In stateless/ZDR mode request encrypted reasoning content and replay it with subsequent turns.
- Use sandbox agents when files, commands, packages, ports, artifacts, snapshots, mounts, or human review are part of the product.
- For realtime voice, define turn-taking, transcript source of truth, tool timing, and fallback channels.

### Retired / migration targets

Not yet verified — see Task 4-7.

### Re-evaluate when

- Changing between Chat Completions and Responses.
- Changing reasoning effort or moving to/from GPT-5.5-pro.
- Adding realtime voice or hosted/sandbox tools.
- Changing storage mode, ZDR, or stateless conversation handling.


### Primary sources

- [OpenAI models](https://developers.openai.com/api/docs/models)
- [OpenAI deprecations](https://developers.openai.com/api/docs/deprecations)
- [Reasoning guide](https://developers.openai.com/api/docs/guides/reasoning)
- [Tools guide](https://developers.openai.com/api/docs/guides/tools)
- [Migrate to Responses](https://developers.openai.com/api/docs/guides/migrate-to-responses)
