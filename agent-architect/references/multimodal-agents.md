# Multimodal Agents Reference

This reference supports `checklists/multimodal-architecture.md` and DESIGN mode for voice, image, video, realtime, browser-use, and computer-use systems.

## Core Thesis

Multimodal agents are not text agents with extra inputs. Each modality adds a runtime contract: capture quality, latency, turn-taking, synchronization, transcript canonicalization, media token budgets, tool timing, and modality-specific injection surfaces.

## Voice and Realtime Contracts

- Turn-taking: define VAD, silence timeout, interruption, and barge-in behavior.
- Canonical transcript: decide whether the source of truth is audio, transcript, model summary, or tool state.
- Tool timing: live sessions may require synchronous tool responses before speech continues.
- Fallbacks: degraded STT, TTS, or realtime connection must fall back to typed chat or delayed response.
- Latency: set p50 and p95 targets for first audio, full response, and tool-mediated response.

## Image, Video, and Screen Contracts

- Media budget: choose per-item resolution and frame sampling based on decision need.
- Visual grounding: computer-use actions need coordinate normalization and post-action visual validation.
- Generated media: validate outputs for text correctness, policy constraints, and artifact fit before downstream use.
- Video: define frame selection, audio/video synchronization, and what evidence is kept for audit.

## Security Contracts

- Treat image, audio, video, page DOM, screenshots, and generated media as untrusted instruction channels.
- Quarantine untrusted media interpretation from privileged action execution.
- Require human review for external side effects driven by visual or audio content.

## Eval Implications

Multimodal evals need fixture media, transcripts, latency metrics, interruption cases, noisy input, adversarial visual text, tool timing failures, and state validation after screen actions.

## Sources

- [OpenAI advancing voice intelligence](https://openai.com/index/advancing-voice-intelligence-with-new-models-in-the-api/)
- [OpenAI Realtime API introduction](https://openai.com/index/introducing-gpt-realtime/)
- [Gemini Live API](https://ai.google.dev/gemini-api/docs/live-api)
- [Gemini Live tool use](https://ai.google.dev/gemini-api/docs/live-api/tools)
- [Gemini computer use](https://ai.google.dev/gemini-api/docs/computer-use)
- [Gemini models](https://ai.google.dev/gemini-api/docs/models)
- [Gemini Interactions API](https://ai.google.dev/gemini-api/docs/interactions/interactions-overview)
- [VPI-Bench](https://openreview.net/forum?id=UMauKu2azg)
- [Multimodal prompt injection attacks](https://arxiv.org/html/2509.05883v1)
