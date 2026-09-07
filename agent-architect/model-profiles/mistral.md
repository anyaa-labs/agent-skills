---
family: mistral
tier: open-weight
researched_date: 2026-06-14
---

# Mistral

### API surface

- Mistral function calling and structured output are supported on current conversation APIs.

### Reasoning state

- Treat as short-chain unless the exact model and provider evals prove long-chain stability.

### Tool semantics

- Function calling uses standard schemas, but JSON mode still needs explicit prompt instructions.

### Modality support

- Depends on model and API surface; do not infer multimodal support from family name alone.

### Context behavior

- Strong fast worker profile. Avoid using as a deep multi-step orchestrator without eval evidence.

### Structured output path

- Use JSON mode or function calling plus explicit "output JSON" or format instruction.

### Deployment & residency

Not yet verified — see Task 4-7.

### Version-specific notes

- **Mistral Large 3 / Medium**: Solid general worker/tool user. Not the first choice for long autonomous chains. Cost tier: $$.
- **Mistral Small**: Use for simple extraction/routing only after schema eval. Cost tier: $.

### Known production failure modes

- Implicit JSON-mode assumptions.
- Limited self-correction in long tool loops.
- Using fast worker models for reviewer/planner roles.

### Harness requirements

- Keep sessions short and validate output externally.
- Include explicit output format instructions even with JSON mode.

### Retired / migration targets

Not yet verified — see Task 4-7.

### Re-evaluate when

- Changing structured-output mode, model tier, or function-calling transport.


### Primary sources

- [Models overview](https://docs.mistral.ai/getting-started/models/models_overview/)
- [Function calling](https://docs.mistral.ai/capabilities/function_calling/)
- [vLLM local deployment](https://docs.mistral.ai/models/deployment/local-deployment/vllm)
- [Zero data retention](https://docs.mistral.ai/admin/monitor-comply/zero-data-retention)
