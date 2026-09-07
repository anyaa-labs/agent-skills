---
family: qwen
tier: open-weight
researched_date: 2026-06-14
---

# Qwen

### API surface

- Qwen deployments vary across DashScope, OpenAI-compatible APIs, vLLM, SGLang, local servers, and Qwen-Agent.

### Reasoning state

- Qwen3-Coder and subsequent series may require explicit thinking-mode configuration depending on provider protocol.

### Tool semantics

- Qwen3 function calling is template- and parser-sensitive. Prefer Qwen-Agent or provider-supported templates for agentic tool use.
- Self-hosted Qwen3-Coder deployments must verify tokenizer, chat template, and tool parser compatibility before production use.

### Modality support

- Qwen family support varies by submodel. Treat vision, audio, and coding support as exact-model-specific.

### Context behavior

- Long-context claims need deployment-level testing because template/parser mismatch can dominate base model quality.

### Structured output path

- Use provider-supported tool templates, Qwen-Agent, or a validated external parser.
- Add a startup validation fixture for at least one successful and one failed tool call.

### Deployment & residency

Not yet verified — see Task 4-7.

### Known production failure modes

- Tool calls fail because serving stack, tokenizer, or chat template differs from training/eval setup.
- Thinking-mode configuration changes output format.
- Self-hosted endpoints expose incomplete tool parser behavior.

### Harness requirements

- Add a startup validation that sends one simple tool-call fixture through the exact serving stack.
- Run long-chain tool-use evals on the deployment, not just the base model.

### Retired / migration targets

Not yet verified — see Task 4-7.

### Re-evaluate when

- Changing serving stack, tokenizer, chat template, tool parser, or thinking-mode configuration.


### Primary sources

- [QwenCloud docs](https://docs.qwencloud.com/)
- [Model changelog](https://docs.qwencloud.com/changelog/models)
- [Model deprecation policy](https://docs.qwencloud.com/changelog/model-deprecation)
- [Thinking guide](https://docs.qwencloud.com/developer-guides/text-generation/thinking.md)
- [Structured output guide](https://docs.qwencloud.com/developer-guides/text-generation/structured-output.md)
