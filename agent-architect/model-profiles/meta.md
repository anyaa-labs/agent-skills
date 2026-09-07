---
family: meta
tier: open-weight
researched_date: 2026-06-14
---

# Llama (Meta)

### API surface

- Usually self-hosted or provider-hosted through an OpenAI-compatible surface; actual tool support depends on serving stack.

### Reasoning state

- External state management is usually required for complex agents. Do not assume persistent reasoning state.

### Tool semantics

- Tool calling often depends on special tokens, chat templates, parser config, and serving framework.
- External grammar constraints remain important for reliable JSON in production.

### Modality support

- Llama 4 Scout/Maverick are natively multimodal open-weight models; verify exact host support for images and long context.

### Context behavior

- Advertised context can exceed effective reasoning range. Validate context selection and long-context performance on the deployed stack.

### Structured output path

- Use external grammar constraints where available: llama.cpp grammars, vLLM guided decoding, Outlines, or equivalent.

### Deployment & residency

Not yet verified — see Task 4-7.

### Version-specific notes

- **Llama 4 Scout / Maverick**: Multimodal open-weight models with very large advertised context. Use context-selection validation and external output constraints before production agent use. Cost tier: $/$$ depending on host.
- **Llama 3.3 70B / 3.1 405B**: Viable open-weight options for controlled workers. Cost tier: $/$$.
- **Small Llama variants**: Restrict to short, bounded, validated tasks. Cost tier: $.

### Known production failure modes

- Path forgetting, malformed JSON, template mismatch, cascading self-correction, and hallucinated placeholders.
- Small models loop on capability descriptions instead of acting.

### Harness requirements

- Validate the exact serving stack with tool-call fixtures.
- Keep system prompts and tool sets small for smaller models.
- Detect cascading errors and stop rather than relying on self-correction.

### Retired / migration targets

Not yet verified — see Task 4-7.

### Re-evaluate when

- Changing serving framework, tokenizer, chat template, parser, quantization, or context length.


### Primary sources

- [Meta AI developer docs overview](https://developer.meta.com/ai/docs/overview/)
- [Model cards and prompt formats](https://developer.meta.com/ai/docs/model-cards-and-prompt-formats/)
- [Llama 4 model card and prompt format](https://developer.meta.com/ai/docs/model-cards-and-prompt-formats/llama4/)
- [Llama 4 license](https://developer.meta.com/ai/llama4/license/)
