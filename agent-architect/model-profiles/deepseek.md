---
family: deepseek
tier: open-weight
researched_date: 2026-06-14
---

# DeepSeek

### API surface

- OpenAI-compatible APIs are common, but model aliases and hosted behavior can change.
- Verify the target provider's structured output and tool-call behavior directly.

### Reasoning state

- Thinking/non-thinking modes are different runtime contracts.
- R1-style reasoning can leak into output if not contained.

### Tool semantics

- Tool support and structured output reliability vary by model and provider.
- Long agent loops need hard iteration and retry limits.

### Modality support

- Primarily text/code/reasoning on common API surfaces. Treat multimodal support as provider-specific until verified.

### Context behavior

- Good cost/performance can hide weak multi-turn reliability. Validate with repeated tool-loop evals.

### Structured output path

- Use explicit schema inspection prompts and external validation.
- Do not rely on self-correction alone after tool errors.

### Deployment & residency

Not yet verified — see Task 4-7.

### Version-specific notes

- **DeepSeek V3.2**: Reasoning-first model framed for agents. Validate multi-turn tool behavior and structured output on the target provider before using as orchestrator.
- **DeepSeek V3.2-Speciale**: Reasoning-heavy API-only option. Treat as high-latency advisor/reasoner until evals prove agent-loop reliability.
- **DeepSeek R1**: Avoid system prompts, avoid few-shot, and keep it out of multi-step agent loops unless current provider evals prove otherwise.
- **deepseek-chat / deepseek-reasoner legacy aliases**: During the 2026 transition they point to `deepseek-v4-flash` non-thinking and thinking modes, and are scheduled for discontinuation on 2026-07-24. Do not build new production configs on these aliases.

### Known production failure modes

- Legacy aliases silently changing behavior or being discontinued.
- Error-loop retries after failed tools.
- Reasoning leakage into structured output.
- Provider-specific tool parser incompatibility.

### Harness requirements

- Pin exact model IDs where possible and track alias deprecations.
- Add hard turn limits and error-loop circuit breakers.
- Validate structured output outside the model.
- Run long-chain tool-use evals before using as an orchestrator.

### Retired / migration targets

Not yet verified — see Task 4-7.

### Re-evaluate when

- Any legacy alias is used.
- Switching thinking/non-thinking modes.
- Changing provider because structured output and tool support vary by host.


### Primary sources

- [DeepSeek API updates](https://api-docs.deepseek.com/updates)
- [Thinking mode](https://api-docs.deepseek.com/guides/thinking_mode)
- [Tool calls](https://api-docs.deepseek.com/guides/tool_calls)
- [Anthropic API compatibility](https://api-docs.deepseek.com/guides/anthropic_api)
- [JSON mode](https://api-docs.deepseek.com/guides/json_mode)
