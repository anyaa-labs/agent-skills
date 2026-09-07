---
family: google
tier: frontier
researched_date: 2026-06-14
---

# Gemini (Google)

### API surface

- Use `generateContent` for stable existing integrations.
- Use Interactions API for new agentic workflows that need server-side history, typed execution steps, background tasks, complex reasoning, or multimodal multi-turn state.

### Reasoning state

- Thinking budgets and thought-signature/state behavior are part of the runtime contract.
- Multi-turn function calling can require preserving provider-specific state/signatures.

### Tool semantics

- Gemini 3 model APIs generate a unique `id` for every function call. If manually constructing conversation history or using REST, return the matching `id` in each function response.
- Gemini supports combined built-in tools and custom function calling on newer APIs. Verify exact model/API support before designing a mixed tool call.

### Modality support

- Gemini models cover text, image, audio, video, and long-context multimodal workflows depending on model ID.
- Gemini Live supports low-latency realtime voice and vision interactions, tool use, transcripts, barge-in, proactive audio, affective dialog, and live translation, with feature differences by model.
- Gemini computer use returns normalized screen coordinates and can emit multiple UI actions in one turn. The harness must execute actions and verify resulting screen state.

### Context behavior

- Gemini can handle very large raw context, but long context still needs context-selection evals.
- Media resolution, frame sampling, and transcript budgets are architecture decisions.

### Structured output path

- Use `response_schema`, structured output modes, or validated function-call schemas.
- Preserve function-call IDs and responses exactly when manually constructing history.

### Deployment & residency

Not yet verified — see Task 4-7.

### Version-specific notes

- **Gemini 3 Pro / 3.x reasoning models**: Strong long-context and multimodal reasoning. Use Interactions API when agent state and background execution matter. Cost tier: $$$.
- **Gemini Flash 3 / Flash family**: Good high-throughput multimodal worker/router after eval. Cost tier: $$.
- **Gemini Live models**: Realtime voice/vision runtime. Evaluate latency, barge-in, synchronous tool calls, transcript drift, and modality fallback.
- **Gemini computer-use models**: Browser/screen action runtime. Require post-action visual validation and high-risk action approvals.

### Known production failure modes

- Thought signature or function-call ID not preserved.
- Long context used as a substitute for relevance selection.
- Computer-use actions continue after visual state diverges.
- Live tool calls lack timing and timeout policy.

### Harness requirements

- Preserve tool IDs and provider-required state across turns.
- Configure thinking budget, media resolution, and frame/transcript budgets explicitly.
- Validate screen state after computer-use actions.
- Treat media as untrusted instructions.

### Retired / migration targets

Not yet verified — see Task 4-7.

### Re-evaluate when

- Moving from `generateContent` to Interactions API.
- Moving to Gemini 3.x reasoning models.
- Adding Live API, computer use, media-resolution controls, or background execution.


### Primary sources

- [Gemini models](https://ai.google.dev/gemini-api/docs/models)
- [Gemini API changelog](https://ai.google.dev/gemini-api/docs/changelog)
- [Gemini function calling](https://ai.google.dev/gemini-api/docs/function-calling)
- [Interactions API overview](https://ai.google.dev/gemini-api/docs/interactions/interactions-overview)
- [Live API](https://ai.google.dev/gemini-api/docs/live-api)
