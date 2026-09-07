---
family: cohere
tier: open-weight
researched_date: 2026-06-14
---

# Command (Cohere)

### API surface

- Strong document/RAG-oriented surfaces with citation capabilities and structured output modes.

### Reasoning state

- Do not assume hidden reasoning-state preservation beyond provider-supported conversation history.

### Tool semantics

- Strong multi-step tool behavior for retrieval-heavy workflows, but structured outputs and RAG modes can have compatibility constraints.

### Modality support

- Treat as text/document-first unless exact model docs say otherwise.

### Context behavior

- Good fit for cited RAG answers. Use explicit document boundaries and source attribution.

### Structured output path

- Use JSON schema / JSON object response formats where supported and include explicit "Generate a JSON" instruction.

### Deployment & residency

Not yet verified — see Task 4-7.

### Version-specific notes

- **Command R+**: Strong retrieval/tool worker for cited answers. Cost tier: $$.

### Known production failure modes

- Infinite generation loop if JSON instruction is omitted with JSON mode.
- Structured output incompatible with some RAG configurations.

### Harness requirements

- Choose either structured output or native RAG mode when provider limitations require it.
- Leverage built-in citations instead of adding a separate citation hallucination surface.

### Retired / migration targets

Not yet verified — see Task 4-7.

### Re-evaluate when

- Changing RAG mode, structured-output mode, or citation requirements.


### Primary sources

- [Cohere models](https://docs.cohere.com/docs/models)
- [Deprecations](https://docs.cohere.com/docs/deprecations)
- [Tool use overview](https://docs.cohere.com/docs/tool-use-overview)
- [Structured outputs](https://docs.cohere.com/docs/structured-outputs)
- [Private deployment overview](https://docs.cohere.com/docs/private-deployment-overview)
