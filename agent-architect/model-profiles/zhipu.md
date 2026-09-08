---
family: zhipu
access: open-weight
scope: global
researched_date: 2026-09-08
---

# Zhipu AI / Z.ai / GLM

**Documentation caveat:** VERIFIED except for retirements — **no vendor-owned deprecation page exists on either platform.** See Retired / migration targets below; this is a genuine absence, not an unreachable page.

### Current models

**API IDs, international (`docs.z.ai`) — text/chat enum:** `glm-5.3`, `glm-5.2`, `glm-5.1`, `glm-5`, `glm-4.7`, `glm-4.7-flash`, `glm-4.7-flashx`, `glm-4.6`, `glm-4.5`, `glm-4.5-air`, `glm-4.5-x`, `glm-4.5-airx`, `glm-4.5-flash`, `glm-4-32b-0414-128k`. **Vision enum:** `glm-5.3-flash`, `glm-4.6v`, `glm-4.6v-flash`, `glm-4.6v-flashx`, `glm-4.5v`, `autoglm-phone-multilingual`.

- `glm-5.3` — flagship, **text-only input**, 1M context / 128K max output, released 2026-08-18. Same base model as GLM-5.2; all gains from post-training.
- `glm-5.3-flash` — first native-multimodal model of the GLM-5 series (video, image, text, file input), 1M / 128K, 320B total / 18B active, hybrid sparse + linear attention. Released 2026-08-26.
- `glm-5.2`: 1M / 128K. `glm-5.1` and `glm-5`: 200K / 128K. `glm-4.7*` and `glm-4.6`: 200K. `glm-4.5*`: 128K / 96K. `glm-4.6v`: 128K / 32K. `glm-4.5v`: 64K / 16K.
- Non-LLM: `glm-ocr`, `glm-asr-2512`, `glm-image`, `cogview-4`, `cogvideox-3`.
- **The China platform (`open.bigmodel.cn`, `docs.bigmodel.cn`) carries extra IDs not on z.ai:** `glm-5-turbo`, `glm-5v-turbo`, `glm-4-long`, `glm-4-flashx-250414`, `glm-4-flash-250414`, `glm-4.1v-thinking` family, `glm-4v-flash`, `glm-realtime`, `glm-4-voice`, `glm-tts` family, `autoglm-phone`, `embedding-2`/`-3`, Vidu Q1/2, CogView-3-Flash, CodeGeeX-4, Rerank. **The two catalogs are not identical.**
- **Open weights (`zai-org`, formerly THUDM):** `GLM-5.3` (744B-A40B, FP8) + `-BF16`, `GLM-5.3-Flash` (320B-A18B, FP8) + `-BF16`, `GLM-5.2`/`-5.1`/`-5` (+FP8), `GLM-4.7` (+FP8) + `-Flash`, `GLM-4.6` (+FP8/`-V`), `GLM-4.5` family, `GLM-4.5V` (+FP8), `GLM-OCR`, `GLM-Image`, `GLM-ASR-Nano-2512`, `GLM-TTS`, `AutoGLM-Phone-9B` (+`-Multilingual`), the `GLM-4-32B-0414` family, and `GLM-Z1-*`. Also on ModelScope under `ZhipuAI/`.

### API surface

- **OpenAI-compatible** general endpoint `https://api.z.ai/api/paas/v4`. **Anthropic-compatible, current:** `https://api.z.ai/api/anthropic` (international), `https://open.bigmodel.cn/api/anthropic` (China, `x-api-key` header).
- **Three protocols on the Coding Plan endpoint:** Anthropic Messages `https://api.z.ai/api/anthropic`; OpenAI Chat Completions `https://api.z.ai/api/coding/paas/v4`; OpenAI Responses `https://api.z.ai/api/v1`. **Using the wrong one silently fails to draw on Coding Plan quota.** Anyone who has ever subscribed to a GLM Coding Plan — including an expired one — can currently access the model API "only through the OpenAI Chat Completion-compatible protocol."
- **Claude Code specifics:** 1M context requires a `[1m]` model-ID suffix (`glm-5.3[1m]`, `glm-5.3-flash[1m]`) plus `CLAUDE_CODE_AUTO_COMPACT_WINDOW: "1000000"`. Claude Code sends `thinking.type` plus `output_config.effort`, while Codex sends `reasoning.effort` — both normalized to the low/high/max ladder.

### Reasoning state

- **Thinking toggle:** `thinking: {"type": "enabled" | "disabled"}`. **On `glm-5.3` and `glm-5.3-flash` thinking is forced** — `"disabled"` returns an error. The vendor's migration note is explicit: change `disabled` → `enabled` and set `reasoning_effort: "low"` **before** switching model ID, or requests fail.
- **`reasoning_effort`** (GLM-5.2 and later): GLM-5.3 and 5.3-Flash accept only `low` / `high` / `max` (default `max`) and **error** on anything else. GLM-5.2 accepts a wider set (`max`/`xhigh`/`high`/`medium`/`low`/`minimal`/`none`) with documented remapping. **The Coding Plan endpoint remaps more forgivingly and never errors.** Priority: explicit effort > thinking toggle > default `max`.
- **Reasoning-echo rule — two named, separately controlled behaviors:**
  - *Interleaved thinking* (since GLM-4.5, on by default): thinking blocks "should be explicitly preserved and returned together with the tool results."
  - *Preserved thinking*: controlled by `thinking.clear_thinking`. **Default `true` on the standard API** (prior `reasoning_content` stripped) but **default `false` on the Coding Plan endpoint.** To use it on the standard API, set `clear_thinking: false` and return the complete, unmodified `reasoning_content`; reordering or editing degrades quality and cache hits. The vendor recommends `clear_thinking: false` for GLM-5.3-Flash.
- Reasoning arrives as `reasoning_content` / `delta.reasoning_content`, distinct from `content`.

### Tool semantics

- OpenAI-shaped, but **`tool_choice` supports only `auto`** — stated outright by the vendor. Optional `tool_stream: true` (with `stream: true`) streams tool-call argument deltas; default `false`; supported on GLM-5.3 / 5.2 / 5.1 / 5 / 4.7 / 4.6.
- **Why serving-stack parser flags are load-bearing:** the GLM-5.3 `chat_template.jinja` emits tool calls in a bespoke XML form — `<tool_call>{name}<arg_key>k</arg_key><arg_value>v</arg_value></tool_call>` inside a `<tools>` block — **not OpenAI JSON**, with reasoning in `<think>…</think>`. Without the server-side parsers, an OpenAI-compatible client receives that markup as plain `content`, with no `tool_calls` and no `reasoning_content`. **It does not error; it silently returns markup.**
- Parser history: the reasoning parser has been `glm45` continuously; the tool-call parser changed from `glm45` to `glm47` at the 4.7 generation, and GLM-5 still uses `glm47`. **The GLM-5.1, 5.2, and 5.3 cards defer to third-party cookbooks — the correct parser for those is not vendor-documented as of 2026-09-08.**

### Modality support

- `glm-5.3`: text-only input. `glm-5.3-flash`: first native-multimodal GLM-5 model — video, image, text, file input. `glm-4.6v`/`-flash`/`-flashx` and `glm-4.5v`: vision. `autoglm-phone-multilingual`: phone-agent multimodal. Non-LLM: `glm-ocr` (OCR), `glm-asr-2512` (speech), `glm-image`, `cogview-4`, `cogvideox-3` (image/video generation).

### Context behavior

- `glm-5.3` and `glm-5.3-flash`: 1M / 128K max output. `glm-5.2`: 1M / 128K. `glm-5.1` and `glm-5`: 200K / 128K. `glm-4.7*`/`4.6`: 200K. `glm-4.5*`: 128K / 96K. `glm-4.6v`: 128K / 32K. `glm-4.5v`: 64K / 16K.
- **Context caching is implicit and automatic**, no request parameter; hit rate reported via `usage.prompt_tokens_details.cached_tokens`. The vendor states the mechanism is open beta and its hit/retention logic "has not yet been announced" — it cannot be reasoned about or relied on in a cost model.
- 1M context in Claude Code requires both the `[1m]` model-ID suffix and the `CLAUDE_CODE_AUTO_COMPACT_WINDOW` environment variable — treat the pair as one mandatory configuration, not two independent options.

### Structured output path

- **JSON mode only.** `response_format` accepts `{"type": "text"}` or `{"type": "json_object"}`. **There is no `json_schema` or strict path** on either platform — the enum affirmatively lists only those two values.

### Deployment & residency

- **Licenses split by release, not uniform:** `zai-org/GLM-5.3` → `license_name: glm-5.3`, LICENSE titled "GLM-5.3 License." `zai-org/GLM-5.3-Flash` → **MIT**. `zai-org/GLM-5.2` → **MIT**. The flagship moved off MIT while the Flash variant and the prior release stayed on it.
- **Vendor-named serving stacks:** SGLang, vLLM, Transformers, KTransformers, Unsloth, TokenSpeed; plus vLLM-Ascend / xLLM / SGLang for Ascend NPU. **No vendor-documented TensorRT-LLM or llama.cpp path** for GLM-5. Version floors: GLM-5.2 → SGLang v0.5.13.post1+, vLLM v0.23.0+, KTransformers v0.5.12+; GLM-5.1 → SGLang v0.5.10+, vLLM v0.19.0+, xLLM v0.8.0+. Fine-tuning: `slime` (the GLM team's own RL framework), `ms-swift` v4.4.0+.
- **Exact parser flags the vendor publishes** (GLM-5 and GLM-4.7 cards):

  ```
  vllm serve zai-org/GLM-5 --tensor-parallel-size 8 --gpu-memory-utilization 0.85 \
    --speculative-config.method mtp --speculative-config.num_speculative_tokens 3 \
    --tool-call-parser glm47 --reasoning-parser glm45 --enable-auto-tool-choice \
    --served-model-name glm-5

  sglang serve --model-path zai-org/GLM-5 --tp-size 8 \
    --tool-call-parser glm47 --reasoning-parser glm45 \
    --speculative-algorithm EAGLE --speculative-num-steps 3 \
    --speculative-eagle-topk 1 --speculative-num-draft-tokens 4 \
    --mem-fraction-static 0.85 --served-model-name glm-5
  ```

  GLM-4.5 and 4.5-Air use `--tool-call-parser glm45 --reasoning-parser glm45`. **The GLM-5.1, 5.2, and 5.3 cards are not covered by a vendor-confirmed parser pair** — do not carry `glm47`/`glm45` forward onto them without a fresh citation.
- **Self-hosted thinking is a chat-template kwarg.** The template reads `reasoning_effort` and injects a literal `<|system|>Reasoning Effort: Max` turn; it also reads `clear_thinking`, gating whether prior `<think>` blocks are re-rendered. **In the GLM-5.3 and 5.3-Flash templates `clear_thinking` defaults to `false`** — the **inverse** of the hosted standard-API default (`true`). Self-hosted and vendor-API behavior diverge silently unless `clear_thinking` is set explicitly on every request. No thinking off-switch exists in the 5.3 templates.
- **What you lose self-hosted:** implicit context caching and `cached_tokens` accounting, the `/api/anthropic` shim, the `[1m]` suffix convention, the Coding-Plan effort remapping that swallows unsupported values instead of erroring, and the built-in Web Search / Web Reader / Vision / Zread MCP servers.
- **Residency (vendor-stated):** z.ai international is "provided and controlled by JINGSHENG HENGXING TECHNOLOGY PTE. LTD," registered in **Singapore**. "We generally provide the Services from Singapore… your personal data is generally processed in Singapore," with possible transfer outside your jurisdiction. The DPA states the company does "not store any of the content the Customer or its End Users provide or generate while using our Services… processed in real-time… and is not saved on our servers." The China platform is a **separate operator** (北京智谱华章科技股份有限公司) on separate endpoints with its own privacy policy and compliance pages — not independently fetched in this pass.

### Known production failure modes

- Using the wrong Coding Plan protocol (Anthropic Messages vs. OpenAI Chat Completions vs. Responses) silently fails to draw on Coding Plan quota rather than erroring.
- Self-hosting GLM-5.1, 5.2, or 5.3 without a vendor-confirmed parser pair risks the bespoke `<tool_call>` XML leaking into `content` as plain text — no `tool_calls`, no `reasoning_content`, and no error.
- `clear_thinking`'s default is inverted between the hosted standard API (`true`) and the self-hosted 5.3 chat templates (`false`) — code written against one silently no-ops against the other.
- `reasoning_effort` values outside `low`/`high`/`max` on GLM-5.3/5.3-Flash error outright, unlike GLM-5.2's forgiving remap — a version upgrade can turn a previously-silent remap into a hard failure.
- Cost models built on `cached_tokens` cannot be validated against any documented SLA — the caching mechanism is explicitly undocumented open beta.

### Harness requirements

- Route Coding Plan traffic through the exact protocol/base-path the vendor documents for that plan — do not assume any OpenAI-compatible client transparently draws on plan quota.
- Before deploying a self-hosted GLM-5.1, 5.2, or 5.3, re-verify tool-call-parser and reasoning-parser flags directly against that model's own card; `glm47`/`glm45` is confirmed only through GLM-5 and GLM-4.7.
- Explicitly set `clear_thinking` on every request rather than relying on the default — the default differs by surface and inverts between the hosted API and the 5.3 self-hosted template.
- On `glm-5.3`/`glm-5.3-flash`, always pass `reasoning_effort` as `low`/`high`/`max` — any other value errors, unlike prior GLM generations.
- For 1M context inside Claude Code, wire both the `[1m]` model-ID suffix and `CLAUDE_CODE_AUTO_COMPACT_WINDOW` as one required pair.

### Retired / migration targets

**No vendor-owned deprecation or retirement page exists on either platform.** Both sitemaps and both `llms.txt` indexes were checked, and candidate URLs (`/guides/overview/deprecations`, `/cn/update/model-deprecation`, `/release-notes/apis`, a models-list endpoint) all 404. Both the "New Released" and `模型与产品发布记录` pages are additive only. **Retired model IDs with stated replacements and dates are not publicly documented as of 2026-09-08.** This is a confirmed absence, not a research gap — do not infer or construct a retirement list for this family.

Two adjacent facts that *are* documented: `thinking.type: "disabled"` is retired **as a capability** on `glm-5.3` and `glm-5.3-flash` (migration: switch to `enabled` plus `reasoning_effort: "low"`); and older IDs (`glm-4.5*`, `glm-4-32b-0414-128k`, `glm-4.5v`) remain live in the current enum — i.e. **not** retired.

### Re-evaluate when

- Any self-hosted deployment moves to GLM-5.1, 5.2, 5.3, or 5.3-Flash — parser flag names for those generations are not vendor-documented; verify before deploying.
- Migrating from a GLM generation where thinking is optional (5.2 and earlier) toward 5.3/5.3-Flash where it is forced on — the `disabled` path is retired as a capability, not just a default change.
- Switching Coding Plan integration protocol, or onboarding any customer who has ever held a Coding Plan subscription.
- A vendor deprecation page appears for Zhipu/GLM where none exists today — re-run Discovery against it once published.

### Primary sources

- [Z.ai docs overview](https://docs.z.ai/guides/overview/overview)
- [GLM-5.3](https://docs.z.ai/guides/llm/glm-5.3)
- [GLM-5.2](https://docs.z.ai/guides/llm/glm-5.2)
- [GLM-5.3-Flash](https://docs.z.ai/guides/vlm/glm-5.3-flash)
- [Thinking](https://docs.z.ai/guides/capabilities/thinking)
- [Function calling](https://docs.z.ai/guides/capabilities/function-calling)
- [Structured output](https://docs.z.ai/guides/capabilities/struct-output)
- [Context caching](https://docs.z.ai/guides/capabilities/cache)
- [API reference: chat completion](https://docs.z.ai/api-reference/llm/chat-completion)
- [Model list and pricing](https://docs.z.ai/guides/overview/pricing)
- [Devpack: Claude Code](https://docs.z.ai/devpack/tool/claude)
- [Privacy policy](https://docs.z.ai/legal-agreement/privacy-policy)
- [China platform model overview](https://docs.bigmodel.cn/cn/guide/start/model-overview)
- [GLM-5.3 model card](https://huggingface.co/zai-org/GLM-5.3)
- [GLM-5.3-Flash model card](https://huggingface.co/zai-org/GLM-5.3-Flash)
- [GLM-5 model card](https://huggingface.co/zai-org/GLM-5)
- [zai-org HuggingFace org](https://huggingface.co/zai-org)

### Sourcing gap carried forward

vLLM/SGLang parser flags for GLM-5.1, 5.2, 5.3, and 5.3-Flash are not on any vendor-owned page — `glm47` and `glm45` are confirmed only for GLM-5, 4.7, and 4.5. **Retired model IDs, replacements, and sunset dates: no vendor-owned page exists**, and this is treated as a genuine absence rather than an unreachable page. JSON-schema / strict structured output is not documented; the `response_format` enum affirmatively lists only `text` and `json_object`. TensorRT-LLM and llama.cpp are never mentioned (absence, not denial). China-side residency, retention, and compliance specifics exist in the docs index but were not fetched — no China-specific claim is made. `glm-5-turbo` and `glm-5v-turbo` are verified only via the China model-overview table row (200K / 128K).
