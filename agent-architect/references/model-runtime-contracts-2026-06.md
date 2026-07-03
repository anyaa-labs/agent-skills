# Model Runtime Contracts Research, 2026-06-14

This reference records the current source snapshot used to refresh `model-profiles.md`. It separates model behavior from API/runtime contract because production agent failures increasingly come from preserving or mishandling runtime state.

## Profile Fields Required

Every provider family profile in `model-profiles.md` must include:

- API surface
- Reasoning state
- Tool semantics
- Modality support
- Context behavior
- Structured output path
- Known production failure modes
- Harness requirements
- Re-evaluate when

## Provider Notes

OpenAI: GPT-5.5 is the current default for complex reasoning and coding; GPT-5.4 mini/nano are lower cost/latency options. Reasoning models work better through Responses, and tool loops must preserve reasoning items, including encrypted reasoning in stateless or zero-data-retention setups.

Anthropic: Claude Opus 4.8, Opus 4.7, Opus 4.6, and Sonnet 4.6 support large output in batches; Opus 4.8 defaults to high effort unless explicitly configured. Opus/Sonnet 4.6-era workflows require attention to thinking blocks, effort, advisor/executor pairings, and long-context behavior.

Google Gemini: Interactions API is optimized for agentic workflows, server-side history, typed execution steps, background tasks, and complex multimodal multi-turn conversations. Gemini 3 function calls include unique IDs that must be returned in function responses when manually constructing history. Gemini Live and computer-use models add realtime and screen-action runtime contracts.

DeepSeek: API updates indicate legacy `deepseek-chat` and `deepseek-reasoner` names point to `deepseek-v4-flash` modes during a transition and will be discontinued on 2026-07-24. DeepSeek V3.2 is framed as reasoning-first and built for agents.

Qwen: Qwen3 supports function calling through templates and recommends Qwen-Agent for agentic use. Qwen3-Coder and subsequent series depend on thinking/tool parser configuration; self-hosted deployments must verify tokenizer, chat template, and parser compatibility.

Mistral: Function calling and structured output are supported, but JSON mode still requires explicit prompt instruction to output JSON and the expected format.

Meta Llama: Llama 4 Scout/Maverick are natively multimodal open-weight models with very large advertised context; production agent use still needs external grammar/tool parsing and context-selection validation.

## Sources

- [OpenAI models](https://developers.openai.com/api/docs/models)
- [OpenAI reasoning models](https://developers.openai.com/api/docs/guides/reasoning)
- [OpenAI tools](https://developers.openai.com/api/docs/guides/tools)
- [OpenAI voice models](https://openai.com/index/advancing-voice-intelligence-with-new-models-in-the-api/)
- [Claude models overview](https://platform.claude.com/docs/en/about-claude/models/overview)
- [Claude extended thinking](https://docs.anthropic.com/en/docs/build-with-claude/extended-thinking)
- [Claude advisor tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/advisor-tool)
- [Gemini models](https://ai.google.dev/gemini-api/docs/models)
- [Gemini function calling](https://ai.google.dev/gemini-api/docs/function-calling)
- [Gemini Interactions API](https://ai.google.dev/gemini-api/docs/interactions/interactions-overview)
- [Gemini Live API](https://ai.google.dev/gemini-api/docs/live-api)
- [DeepSeek updates](https://api-docs.deepseek.com/updates)
- [DeepSeek V3.2 release](https://api-docs.deepseek.com/news/news251201)
- [Mistral function calling](https://docs.mistral.ai/studio-api/conversations/function-calling)
- [Mistral structured output](https://docs.mistral.ai/studio-api/conversations/structured-output)
- [Qwen function calling](https://qwen.readthedocs.io/en/latest/framework/function_call.html)
- [Qwen3 blog](https://qwenlm.github.io/blog/qwen3/)
- [Meta Llama 4](https://ai.meta.com/blog/llama-4-multimodal-intelligence/)
