---
family: qwen
access: open-weight
scope: global
researched_date: 2026-09-08
---

# Qwen

**Documentation caveat:** Alibaba's developer-facing surface is now **QwenCloud** (`www.qwencloud.com`, `docs.qwencloud.com`), fronting DashScope endpoints. `qwen.readthedocs.io` — a commonly cited source — is **stale**: it documents Qwen3 (2504) and Qwen3-2507 while the vendor's own HuggingFace org ships **Qwen3.8**. It remains accurate for deployment-framework pages it covers but must not be used as the current-lineup source. QwenCloud also resells non-Qwen models (GLM, Kimi, DeepSeek), so its model list is not all first-party.

### Current models

**API model IDs (QwenCloud):** `qwen3.8-max`, `qwen3.8-max-0902`, `qwen3.8-flash`, `qwen3.7-max` (+ snapshots), `qwen3.7-plus`, `qwen3.7-flash`, `qwen3.6-plus`, `qwen3.6-flash`, `qwen3.6-max-preview`, `qwen3.8-27b`, `qwen3.8-2.4t-a95b`.

**Open weights (HF `Qwen` org):** `Qwen/Qwen3.8-2.4T-A95B` (+ `-FP8`), `Qwen/Qwen3.8-27B` (+ `-FP8`), `Qwen/Qwen3.8-Flash-Next` (+ `-FP8`), `Qwen/Qwen3.6-35B-A3B`, `Qwen/Qwen3.6-27B`, `Qwen/Qwen3.5-397B-A17B`, `Qwen/Qwen3.5-122B-A10B`, `Qwen/Qwen3.5-27B`. `Qwen/Qwen3.8-27B` is a vision-language model with native image and video understanding, context **262,144 native, extensible to 1,000,000**.

**The hosted flagship is a superset of the open weight, not the same model:** "Qwen3.8-Max is the official version based on Qwen3.8-2.4T-A95B with more features, such as vision input & non-thinking support, 1M context length by default, official built-in tools." Do not assume feature parity when recommending "just self-host the open weight instead."

### API surface

- **OpenAI-compatible** at `https://dashscope-intl.aliyuncs.com/compatible-mode/v1`, plus a Responses API and native DashScope.
- **Anthropic-compatible endpoints differ by billing plan** — pay-as-you-go `.../apps/anthropic`, Coding Plan `coding-intl.dashscope.aliyuncs.com/apps/anthropic`, Token Plan `token-plan.ap-southeast-1.maas.aliyuncs.com/apps/anthropic`. The vendor states plainly that mismatching key type to base URL is a common failure — verify plan-to-endpoint mapping during Discovery, not after a 401.
- Vendor-run tools available: function calling, web search, web extractor, code interpreter, image search, MCP server connection.
- **Streaming is mandatory for some models**: Qwen3 open-source models and `qwen3.8-2.4t-a95b` require streaming; `qwen3.7-max`/`-plus`, `qwen3.6-plus`, `qwen3.5-plus`/`-flash`, and Qwen3.5 open-source models support non-streaming.

### Reasoning state

- **Four distinct, non-OpenAI-standard thinking knobs**, all passed via `extra_body` in the Python SDK: `enable_thinking` (bool, per-request toggle on hybrid models); `reasoning_effort` (levels vary by model — `qwen3.8-max` accepts `low`/`medium`/`xhigh`, default `xhigh`); `thinking_budget` (1–32768, console default 4000, Chat Completions/DashScope only, **not supported by the Responses API**); `preserve_thinking` (bool, see echo rule below). `qwen3.8-max` **errors** if `reasoning_effort` and `thinking_budget` are both set.
- **Reasoning-state echo rule is opt-in and only a quality warning, not a hard error** — the opposite failure mode from DeepSeek. Default is *not* to read `reasoning_content` back in multi-turn conversations; set `preserve_thinking: true` to append it. For tool-call flows the vendor is explicit: "Omitting it degrades accuracy" — but nothing errors, so a harness can run silently degraded for a long time before anyone notices.
- Reasoning surfaces as `reasoning_content` (Chat Completions/DashScope) or `reasoning_text` events (Responses API).
- **Prompt-level toggle**: with `enable_thinking: true`, `/no_think` skips thinking for one turn and `/think` restores it (last instruction wins) — supported only by open-source Qwen3 hybrid models and `qwen-plus-2025-04-28`, not the current flagship API models.
- **Thinking cannot be disabled on `Qwen3.8-2.4T-A95B`** — it is text-only and requires thinking mode for every interaction. `Qwen3.8-27B` is hybrid with thinking on by default, disabled via `chat_template_kwargs: {"enable_thinking": False}` when self-hosted.

### Tool semantics

- Function calling is template- and parser-sensitive; for self-hosted deployments the serving stack — not the base model — dominates whether tool calls parse correctly.
- **Self-hosted and cloud use different call shapes for the same feature, stated explicitly by the vendor**: self-hosted takes `extra_body={"chat_template_kwargs": {"enable_thinking": True, "preserve_thinking": True}}`; Qwen Cloud takes the same keys bare in `extra_body`, with no `chat_template_kwargs` wrapper. Code written against one silently no-ops against the other — no error, just a feature that stops applying.
- **Exact serving-stack parser flags are vendor-documented only for the previous generation.** Confirmed on the Qwen3.5 and Qwen3.6 model cards:

  ```
  vllm serve Qwen/Qwen3.6-35B-A3B --tensor-parallel-size 8 --max-model-len 262144 \
    --reasoning-parser qwen3 --enable-auto-tool-choice --tool-call-parser qwen3_coder

  python -m sglang.launch_server --model-path Qwen/Qwen3.6-35B-A3B --tp-size 8 \
    --context-length 262144 --reasoning-parser qwen3 --tool-call-parser qwen3_coder
  ```

  **The current Qwen3.8 flagship card carries no parser flags at all** — just bare `vllm serve` / `sglang.launch_server` invocations linking out to third-party cookbooks. Do not carry `qwen3` / `qwen3_coder` forward onto Qwen3.8 as a guess: the parser name has already changed at least once across generations (the Qwen3-era `qwen.readthedocs.io` docs a different pair, `--tool-call-parser hermes --reasoning-parser deepseek_r1`), and a wrong guess produces malformed tool calls silently, not an error.

### Modality support

- Support varies by submodel; treat vision, audio, and coding support as exact-model-specific. `Qwen/Qwen3.8-27B` is the vision-language model in the current lineup (native image + video, Apache-2.0). `Qwen3.8-2.4T-A95B` is text-only. Qwen3-Omni produces no audio output when thinking is enabled.

### Context behavior

- `Qwen/Qwen3.8-27B` context is 262,144 native, extensible to 1,000,000 — **but 1M is not the self-hosted default.** Reaching it requires explicit YaRN overrides on both engines (`VLLM_ALLOW_LONG_MAX_MODEL_LEN=1` plus a `--hf-overrides` RoPE-scaling block on vLLM; `SGLANG_ALLOW_OVERWRITE_LONGER_CONTEXT_LEN=1` plus JSON model-override args on SGLang).
- For agentic tasks within the 1M context, the vendor's own recommendation caps reasoning at 262,144 tokens and the final response at 131,072.
- Long-context claims need deployment-level testing regardless — template/parser mismatch can dominate base-model quality more than the advertised window does.

### Structured output path

- **Qwen is the only one of the five refreshed open-weight families with a documented strict schema path.** `{"type": "json_object"}` does not strictly follow a schema and requires the word "JSON" in the prompt or the API errors. `{"type": "json_schema", "json_schema": {..., "strict": true}}` does strictly follow the schema but is **"Selected models only"** — the vendor does not enumerate which. Caveat: models labeled non-thinking-mode accept `json_object` in thinking mode without erroring, but "structured output may not take effect" — a silent no-op, not a failure you'd catch from the response alone.

### Deployment & residency

- **Licenses have fragmented per repo — Apache-2.0 is no longer the family default.** `Qwen/Qwen3.8-2.4T-A95B` ships under a bespoke "Qwen3.8-Max License"; `Qwen/Qwen3.8-Flash-Next` under "Qwen Community License 1.0"; `Qwen/Qwen3.5-397B-A17B` and `Qwen/Qwen3.8-27B` remain Apache-2.0. **Check the individual repo's license, never assume from the family name.**
- Vendor-named serving stacks: SGLang, vLLM, TokenSpeed ("compatible with vLLM, SGLang, TokenSpeed, etc."; recommended for production). See Tool semantics above for the generation-specific parser-flag gap — the current Qwen3.8 flagship's parser names are **not publicly documented as of 2026-09-08.**
- Recommended sampling for self-hosting: `temperature=1.0, top_p=0.95, top_k=20, min_p=0.0, presence_penalty=0.0, repetition_penalty=1.0`.
- **Residency (vendor-stated, thin):** deprecation notices name "the Beijing and Singapore regions" explicitly; international endpoints route through `dashscope-intl.aliyuncs.com` and `ap-southeast-1` (Singapore). No data-retention or compliance-posture statement was found — only region names. A residency-constrained deployment gets a region choice, not a documented compliance guarantee.

### Known production failure modes

- Tool calls fail because the serving stack's tokenizer, chat template, or tool-parser name differs from what was used in eval — worse on Qwen3.8 since the vendor no longer documents the parser flags at all.
- `preserve_thinking` left at its off-by-default setting in a multi-turn tool loop: no error, just steadily degraded accuracy.
- Code written against the self-hosted `chat_template_kwargs` wrapper silently no-ops when pointed at Qwen Cloud, and vice versa.
- Assuming the open-weight model matches the hosted flagship's feature set (vision, non-thinking mode, 1M context, built-in tools) when the vendor states it does not.
- Requesting `json_object` structured output on a non-thinking-labeled model in thinking mode: no error, but the schema constraint silently does not apply.

### Harness requirements

- Add a startup validation fixture that sends one successful and one failed tool call through the **exact** serving stack and parser flags in use — do not validate against the base model alone.
- Treat `preserve_thinking` / thinking-echo configuration as a required, explicit setting in multi-turn tool loops, not a default to leave alone.
- Re-verify parser flag names whenever the deployed Qwen generation changes; never carry a parser name forward from one generation's model card to the next.
- Check the license of the specific repo being deployed, not the family's historical Apache-2.0 reputation.

### Retired / migration targets

QwenCloud publishes a formal deprecation policy: snapshot models get 30 days' notice, mainline models get 3 months; QPM/TPM throttle down from the notice date; after retirement, inference fails outright.

| Retired/scheduled | Effective | Replacement |
| --- | --- | --- |
| `qwen3.6-max-preview`, `qwen3-max-preview`, `qwen3-max` | 2026-10-10 | `qwen3.7-max` |
| `qwen3-vl-flash` | 2026-10-10 | `qwen3.6-flash` |
| `qwen3-coder-plus` | 2026-10-10 | `qwen3.7-plus` |
| `qwen-turbo`, `qwen-vl-max`, `qwen-vl-plus`, `qwq-plus`, `qvq-max` | 2026-10-10 | latest Qwen3.6/Qwen3.7 series |
| `qwen-max-latest`, `qwen-max-2025-01-25`, `qwen-turbo-latest` and snapshots, `qwen-vl-max-latest` and snapshots, `qwen-vl-plus-latest` and snapshots, `qvq-max-latest`, `qvq-max-2025-03-25`, and open-source snapshots (`qwen2.5-vl-*`, `qwen2.5-*-instruct[-1m]`, `qwen3-0.6b/1.7b/4b`) | Retired 2026-05-13 | latest Qwen3.6 series |
| `codeqwen1.5-7b-chat` | 2026-10-10 | `qwen3.7-plus` |
| GTE-RERANK | Retired 2026-05-30 | — |

### Re-evaluate when

- Changing serving stack, tokenizer, chat template, tool parser, or thinking-mode configuration.
- Moving between self-hosted and Qwen Cloud for the same feature — the call shape for thinking/preserve-thinking is not portable as-is.
- Advancing to a new Qwen generation — parser flags and licenses are not stable across generations or even across repos in the same generation.
- Any config still targets a model in the Retired table above.

### Primary sources

- [QwenCloud](https://www.qwencloud.com/)
- [QwenCloud docs](https://docs.qwencloud.com/)
- [Model changelog](https://docs.qwencloud.com/changelog/models)
- [Model deprecation policy](https://docs.qwencloud.com/changelog/model-deprecation)
- [Thinking guide](https://docs.qwencloud.com/developer-guides/text-generation/thinking.md)
- [Structured output guide](https://docs.qwencloud.com/developer-guides/text-generation/structured-output.md)
- [Qwen3.8-2.4T-A95B model card](https://huggingface.co/Qwen/Qwen3.8-2.4T-A95B)
- [Qwen3.8-27B model card](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Qwen3.6-35B-A3B model card](https://huggingface.co/Qwen/Qwen3.6-35B-A3B)
- [Qwen HuggingFace org](https://huggingface.co/Qwen)

### Sourcing gap carried forward

Parser flag names for the Qwen3.8 generation are not publicly documented as of 2026-09-08 — `--reasoning-parser qwen3` / `--tool-call-parser qwen3_coder` are confirmed only for Qwen3.5 and Qwen3.6. The legacy-mainline retirement list is published only as a PNG image, not machine-readable text, and was transcribed visually — verify before relying on it programmatically. Which models support `json_schema` strict mode is unenumerated ("Selected models only"). No vendor statement on data retention or compliance posture exists beyond region names.
