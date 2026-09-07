# Multimodal Agents Reference

This reference supports `checklists/multimodal-architecture.md` and DESIGN mode for voice, image, video, realtime, browser-use, computer-use, and embodied/robotics systems.

## Core Thesis

Multimodal agents are not text agents with extra inputs. Each modality adds a runtime contract: capture quality, latency, turn-taking, synchronization, transcript canonicalization, media token budgets, tool timing, and modality-specific injection surfaces.

## Voice and Realtime Contracts

- Turn-taking: define VAD, silence timeout, interruption, and barge-in behavior.
- Canonical transcript: decide whether the source of truth is audio, transcript, model summary, or tool state.
- Tool timing: live sessions may require synchronous tool responses before speech continues.
- Fallbacks: degraded STT, TTS, or realtime connection must fall back to typed chat or delayed response.
- Latency: set p50 and p95 targets for first audio, full response, and tool-mediated response.

## Image, Video, and Screen Contracts

- Media budget: choose per-item resolution and frame sampling based on decision need. **This is model-conditional, not universal.** A fixed-rate model (uniform frame sampling at ingest, no runtime control over what it sees) needs a fixed frame/resolution budget set at design time. A model with agentic video navigation (it requests transcripts or specific frames on demand during reasoning, rather than consuming a pre-sampled clip) does not have a frame-rate budget to set — the budget question becomes how many navigation/retrieval steps the agent may take before it must answer, the video analogue of a tool-call budget. Applying a fixed-sampling budget to an agentically-navigated model either starves it of frames it would have fetched itself or defeats the point of navigation by pre-deciding what it sees; applying no budget at all to a fixed-rate model is the classic unbounded-media-cost failure. Determine which regime a given model is in before setting the budget, and say so explicitly in the design — do not default to "fixed sampling" as if it were the only option.
- Visual grounding: computer-use actions need coordinate normalization and post-action visual validation. Computer use is no longer an exotic integration path — it now ships as a headline, first-class capability from frontier providers, with dedicated tool types and beta channels rather than a bespoke integration. Treat it with the same architectural rigor as any other mainstream tool surface: this raises rather than lowers the bar, because a common capability gets used more often and by less specialized teams.
- Generated media: validate outputs for text correctness, policy constraints, and artifact fit before downstream use.
- Video: define frame selection, audio/video synchronization, and what evidence is kept for audit. For an agentically-navigated model, "frame selection" is the agent's own retrieval decision — audit what it chose to fetch and why, not just what a fixed sampler would have produced.

## Embodied and Robotics Contracts

- Physical actions are categorically different from digital ones: a digital tool call can usually be retried, rolled back, or its effect inspected before consequences compound. A physical actuation (a gripper closing, a robot arm moving, a motor engaging) frequently cannot — the world has already changed, and "undo" may not exist.
- The correct control point is therefore pre-action validation, not post-action recovery. Post-action review (the pattern used for computer-use screen actions and most tool calls) assumes the action is cheap to have taken and the cost is in not noticing a bad outcome. Embodied action inverts that: the cost is in having taken the action at all. Validate the intended action, its physical preconditions, and its safety envelope *before* actuation, not after.
- Design implications: an explicit pre-action check (simulation, bounds/collision checking, a physical-world precondition verifier, or a human confirmation gate) ahead of any actuator command; a hard-stop/e-stop path independent of the model's own reasoning; and an audit trail of intended-vs-executed actions, since "what did it do" cannot be reconstructed from a screenshot the way a computer-use session can.
- Eval implications: embodied evals need physical or high-fidelity simulated fixtures, not just logged transcripts — a transcript replay cannot demonstrate that a pre-action check would have caught an unsafe command in the physical world.

## Security Contracts

- Treat image, audio, video, page DOM, screenshots, and generated media as untrusted instruction channels.
- Quarantine untrusted media interpretation from privileged action execution.
- Require human review for external side effects driven by visual or audio content.

## Eval Implications

Multimodal evals need fixture media, transcripts, latency metrics, interruption cases, noisy input, adversarial visual text, tool timing failures, state validation after screen actions, navigation-step traces for agentically-navigated video, and physical/simulated fixtures for embodied action.

## Sources

- [OpenAI advancing voice intelligence](https://openai.com/index/advancing-voice-intelligence-with-new-models-in-the-api/)
- [OpenAI Realtime API introduction](https://openai.com/index/introducing-gpt-realtime/)
- [Gemini Live API](https://ai.google.dev/gemini-api/docs/live-api)
- [Gemini Live tool use](https://ai.google.dev/gemini-api/docs/live-api/tools)
- [Gemini computer use](https://ai.google.dev/gemini-api/docs/computer-use)
- [Gemini models](https://ai.google.dev/gemini-api/docs/models)
- [Gemini Interactions API](https://ai.google.dev/gemini-api/docs/interactions/interactions-overview)
- [Model Landscape Research Brief, 2026-09-08](./model-landscape-2026-09.md) — agentic video understanding, robotics model lines, and the computer-use tool surface reclassification.
- [VPI-Bench](https://openreview.net/forum?id=UMauKu2azg)
- [Multimodal prompt injection attacks](https://arxiv.org/html/2509.05883v1)
