# Model Profiles for Agent Architecture Evaluation

> **Provenance:** Researched 2026-09-08. Every family file under `model-profiles/` carries its own `researched_date` and its own primary-source citations; all 20 currently read 2026-09-08. Sources are provider-owned pages only — Anthropic platform docs (models, deprecations, tool use, thinking, context editing, memory tool, managed agents); OpenAI models, deprecations, reasoning, tools, and Responses-migration docs; Google Gemini models, changelog, function calling, Interactions API, Live API, and available-regions docs; xAI/Grok docs (`docs.x.ai` models, reasoning, Responses, tools, remote MCP, structured outputs, compaction, voice, Imagine, retirement, and security pages) and `x.ai` release announcements; DeepSeek API docs and update notes; Qwen (QwenCloud docs and the Qwen HuggingFace org); Moonshot AI (`platform.kimi.ai`); Zhipu AI / Z.ai; MiniMax; Meta (`developer.meta.com`, Llama and Muse); Mistral docs and API reference; Cohere docs; IBM Granite docs and model cards; Amazon (Bedrock user guide model cards, inference APIs, model lifecycle and data-retention pages, the Nova user guides, and `aws.amazon.com` launch pages); AI21 (`docs.ai21.com`, `www.ai21.com`, and the `ai21labs` HuggingFace org); Nvidia (`developer.nvidia.com`, `build.nvidia.com`, `docs.nvidia.com` NIM and Nemotron cookbooks, and the `nvidia` HuggingFace org); Ai2 (`allenai.org`, `docs.allenai.org`, and the `allenai` HuggingFace org); Sarvam AI; Falcon / TII; the other regional families (Jais, ALLaM, K2, SEA-LION, HyperCLOVA X, Upstage Solar); and the Model Context Protocol 2026-07-28 specification changelog. Aggregator blogs, leaderboards, and benchmark roundups are never cited. See `references/model-runtime-contracts.md` for the runtime-contract snapshot and its pointer to the full primary-source evidence pass (`references/model-landscape-2026-09.md`, which also records where a fact could *not* be sourced), and `CHANGELOG.md` for update history.

These profiles describe *agent-relevant runtime contracts*, not just model personality. For current pricing, regional availability, rate limits, and provider-specific deployment constraints, use web research on the provider's official documentation.

## How to Use

During Discovery, detect model IDs, provider APIs, runtime surfaces, modalities, reasoning-state requirements, and tool protocols. Apply the closest family profile, then apply version-specific notes when the exact version is known.

Every profile includes:

- **API surface** - which endpoint/runtime the provider recommends for agentic work.
- **Reasoning state** - what hidden/summary/encrypted/thought-signature state must be preserved across turns.
- **Tool semantics** - function calling, parallel calls, tool IDs, MCP, tool search, or code-mode behavior.
- **Modality support** - text, image, audio, video, realtime, computer use, generated media.
- **Context behavior** - raw window and practical failure risks.
- **Structured output path** - strict schema, JSON mode, constrained decoding, grammar, or parser.
- **Known production failure modes** - agent-specific risks to check.
- **Harness requirements** - required state, boundaries, validation, and re-evaluation triggers.
- **Re-evaluate when** - provider/model events that should trigger a harness review.

**Precedence rule:** When a model profile contradicts a generic checklist item, the model-specific guidance takes precedence. Suppress the generic finding and report the model-aware finding instead.

**Version matching:** Detect the specific version string (for example, `gpt-5.5`, `claude-opus-4-8`, `gemini-3-pro`, `deepseek-v3.2`). Match to the closest version in the family profile. If only the family is known, apply family-wide patterns and flag: "Applying [family] profile. Exact version behavior may differ."

**API ID to family mapping:** Model strings in code often differ from marketing names. Match by prefix/substring:

- `gpt-5*`, `gpt-6*`, `gpt-realtime*`, `o*`, `gpt-*`, `openai/gpt-oss*` -> `model-profiles/openai.md`
- `claude-opus-4-*`, `claude-sonnet-4-*`, `claude-haiku-4-*`, `claude-fable-*`, `claude-mythos-*`, `claude-*`, `anthropic.*` -> `model-profiles/anthropic.md`
- `gemini-3*`, `gemini-2.5*`, `gemini-*`, `gemma-*`, `google/gemma*` -> `model-profiles/google.md`
- `grok-4*`, `grok-build-*`, `grok-imagine-*`, `grok-voice-*`, `grok-*`, `xai/*`, `xai-*` -> `model-profiles/xai.md`
- `amazon.nova-*`, `us.amazon.nova-*`, `eu.amazon.nova-*`, `jp.amazon.nova-*`, `global.amazon.nova-*`, `nova-*` -> `model-profiles/amazon-nova.md`
- `qwen3*`, `qwen-*`, `qwen_*` -> `model-profiles/qwen.md`
- `deepseek-v4*`, `deepseek-v3*`, `deepseek-chat`, `deepseek-reasoner`, `deepseek-*` -> `model-profiles/deepseek.md`
- `llama-4*`, `llama-*`, `meta-llama/*` -> `model-profiles/meta.md`
- `mistral-*`, `open-mistral-*`, `codestral-*` -> `model-profiles/mistral.md`
- `command-r*`, `cohere.*` -> `model-profiles/cohere.md`
- `jamba-*`, `ai21.jamba-*`, `ai21labs/*` -> `model-profiles/ai21.md`
- `nemotron-*`, `nvidia/*nemotron*`, `nvcr.io/nim/nvidia/*` -> `model-profiles/nvidia-nemotron.md`
- `olmo-*`, `allenai/olmo*`, `allenai/Olmo-*` -> `model-profiles/ai2-olmo.md`
- `kimi-*`, `moonshot-*`, `moonshotai/*` -> `model-profiles/moonshot.md`
- `glm-*`, `chatglm-*`, `zai-org/*` -> `model-profiles/zhipu.md`
- `minimax-*`, `abab-*`, `MiniMaxAI/*` -> `model-profiles/minimax.md`
- `granite-*`, `ibm-granite/*` -> `model-profiles/ibm-granite.md`
- `sarvam-*` -> `model-profiles/sarvam.md`
- `falcon-*`, `tiiuae/*` -> `model-profiles/falcon.md`
- `jais-*`, `allam-*`, `k2-think-*`, `k2-horizon-*`, `sea-lion-*`, `hyperclova-*`, `hcx-*`, `solar-*` -> `model-profiles/regional-other.md`

If an API ID matches a family but not a specific version in the profile, apply family-wide patterns and note the uncertainty. Do not treat it as UNKNOWN if the family is known.

**Cost tiers** are intentionally approximate for offline reasoning:

- **$$$$** - Premium frontier/advisor/reviewer.
- **$$$** - Standard frontier/orchestrator.
- **$$** - Mid-tier worker/router/extractor.
- **$** - Budget or self-hosted worker.

---

## Family Index

| Family | Profile | Tier | Researched |
|---|---|---|---|
| Claude (Anthropic) | `model-profiles/anthropic.md` | frontier | 2026-09-08 |
| GPT / reasoning / realtime / gpt-oss (OpenAI) | `model-profiles/openai.md` | frontier | 2026-09-08 |
| Gemini / Gemma (Google) | `model-profiles/google.md` | frontier | 2026-09-08 |
| Grok (xAI) | `model-profiles/xai.md` | frontier | 2026-09-08 |
| Nova (Amazon) | `model-profiles/amazon-nova.md` | frontier | 2026-09-08 |
| DeepSeek | `model-profiles/deepseek.md` | open-weight | 2026-09-08 |
| Qwen | `model-profiles/qwen.md` | open-weight | 2026-09-08 |
| Llama (Meta) | `model-profiles/meta.md` | open-weight | 2026-09-08 |
| Mistral | `model-profiles/mistral.md` | open-weight | 2026-09-08 |
| Command (Cohere) | `model-profiles/cohere.md` | open-weight | 2026-09-08 |
| Kimi (Moonshot AI) | `model-profiles/moonshot.md` | open-weight | 2026-09-08 |
| GLM (Zhipu AI / Z.ai) | `model-profiles/zhipu.md` | open-weight | 2026-09-08 |
| MiniMax | `model-profiles/minimax.md` | open-weight | 2026-09-08 |
| Granite (IBM) | `model-profiles/ibm-granite.md` | open-weight | 2026-09-08 |
| Jamba (AI21 Labs) | `model-profiles/ai21.md` | open-weight | 2026-09-08 |
| Nemotron (Nvidia) | `model-profiles/nvidia-nemotron.md` | open-weight | 2026-09-08 |
| OLMo (Ai2) | `model-profiles/ai2-olmo.md` | open-weight | 2026-09-08 |
| Sarvam AI (India) | `model-profiles/sarvam.md` | regional | 2026-09-08 |
| Falcon / TII (UAE) | `model-profiles/falcon.md` | regional | 2026-09-08 |
| Regional — other (Jais, ALLaM, K2, SEA-LION, HyperCLOVA X, Upstage Solar) | `model-profiles/regional-other.md` | regional | 2026-09-08 |

**Regional tier.** These models are selected for residency, language coverage, or
sovereignty obligations as often as for capability. When one is detected, the
Sovereignty & Residency dimension applies — see `checklists/sovereignty-residency.md`.

**Folded-in open-weight lines:** OpenAI's open-weight `gpt-oss` family and Google's `Gemma` family are documented as subsections inside `openai.md` and `google.md` respectively, rather than as separate family files — same vendor, no separate profile file needed.

**Not covered here.** Ai2's Molmo (multimodal) and OLMoASR (speech) are separate families from OLMo and are not covered by `ai2-olmo.md`. Reka AI and Microsoft Phi were evaluated on the 2026-09-08 sweep and **deliberately not profiled** — see the *Inventory sweep* table in `references/model-landscape-2026-09.md` for the reasoning and the reconsider-when triggers, so the decision is not re-litigated.

**Load only the families Discovery detected.** Reading every profile to reason about one wastes context — the same loadout discipline this skill applies to tool definitions (Pattern 23).

## Staleness Protocol

Each family file carries `researched_date`. Compare it against today:

- **≤ 90 days** — use the profile as authoritative.
- **> 90 days** — mark the family STALE in the System Map, and offer live verification via the Unknown Model Protocol (Step 2 onward). Findings derived from a stale profile carry the caveat: "Based on a profile last verified [date]; provider behavior may have changed."
- **> 180 days** — the contract test fails. The profile must be re-researched before release.

