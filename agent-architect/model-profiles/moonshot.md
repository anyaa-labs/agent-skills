---
family: moonshot
tier: open-weight
researched_date: 2026-09-08
---

# Moonshot AI / Kimi

**Documentation caveat:** Docs moved from `platform.moonshot.ai` to `platform.kimi.ai`. Kimi's tool-calling protocol is documented on a Moonshot-owned page **only for the K2 generation, not for K3.** K2.6 and K2.7-Code ship a `chat_template.jinja` with a prose spec (`github.com/MoonshotAI/Kimi-K2/docs/tool_call_guidance.md`). K3 ships **no chat template at all** — only vendor reference code (`encoding_k3.py`) using a different marker set. The K2 protocol does not transfer to K3.

### Current models

- `kimi-k3` — flagship. 2.8T total / 104B activated MoE, 93 layers, 896 experts (16 selected + 2 shared), vocab 160K, MoonViT-V2 (401M) vision encoder, native MXFP4 weights / MXFP8 activations via quantization-aware training. Context 1,048,576; `max_completion_tokens` defaults to 131,072, settable to 1,048,576.
- `kimi-k2.7-code` and `kimi-k2.7-code-highspeed` — coding models, 256K context, native INT4. Highspeed is the same model at roughly 180 tok/s (up to 260 in short context) — output speed is the only difference.
- `kimi-k2.6` — text, image, and video input; thinking and non-thinking; 256K context; native INT4. The only current hybrid.
- Open weights: `moonshotai/Kimi-K3`, `moonshotai/Kimi-K2.7-Code`, `moonshotai/Kimi-K2.6`. Older repos (`Kimi-K2.5`, `Kimi-K2-Instruct`, `Kimi-K2-Thinking`) remain on HF but their API IDs are retired. **The `-highspeed` variant has no open-weight repo.**

### API surface

- Three surfaces: OpenAI Chat Completions (`https://api.moonshot.ai/v1/chat/completions`); OpenAI Responses (`.../v1/responses`); **Anthropic Messages (`https://api.moonshot.ai/anthropic/v1/messages`)** — current, fully documented, with a dedicated Claude Code guide.
- A separate China platform mirrors the lineup at `platform.kimi.com` / API root `https://api.moonshot.cn`, same three protocol paths, identical model lineup and retirement dates.

### Reasoning state

- **Reasoning-echo rule is the strictest of the five Chinese open-weight families in this pass. Verbatim:** "Kimi K3 was trained in the **preserved thinking history mode**. For multi-turn conversations and tool calls, Kimi K3 requires the complete assistant message returned by the API to be passed back to `messages` as-is — including `reasoning_content` and `tool_calls`, not just `content`." Same rule for `kimi-k2.7-code`.
- On the Anthropic surface, reasoning arrives as a `thinking` block **with a `signature`** that must be passed back unchanged; block order is thinking → text → tool_use; `usage` carries `thinking_tokens`.
- **Thinking is not toggleable on the flagship.** `kimi-k3` always reasons — the `thinking` parameter is unsupported and must not be passed. `kimi-k2.7-code`: `{"type": "disabled"}` errors; `thinking.keep` accepts only `"all"` or omission. `kimi-k2.6`: `thinking.type` `enabled` (default) / `disabled`, `thinking.keep` `null` (default, history dropped) / `"all"`.
- Effort: top-level `reasoning_effort` = `low` / `high` / `max`, default `max`. The Anthropic surface uses `output_config.effort` with the same ladder. **Switching effort levels invalidates prefix-cache hits.**
- **Sampling parameters are locked** on K3, K2.7-Code, and K2.6: `temperature`, `top_p` (0.95), `n` (1), `presence_penalty` (0), `frequency_penalty` (0) are non-modifiable — passing any other value returns an error. `temperature` is fixed at 1.0 for K3 and K2.7-Code.
- One documented inconsistency: the Claude Code guide's table says K3 thinking is "On by default, can be turned off," contradicting the models-overview, thinking-models, and K3 quickstart pages. Trust those three.

### Tool semantics

- Standard OpenAI loop off `finish_reason == "tool_calls"`. **`tool_choice: "required"` works on `kimi-k3` only** — `kimi-k2.6` and `kimi-k2.7-code` error on it.
- Extensions: built-in tools declared with `"type": "builtin_function"` and a `$`-prefixed name (e.g. `$web_search`); and **dynamic tool loading** by injecting a `system` message carrying its own `tools` field mid-conversation (per-request, not server-retained). Changing `tool_choice` does not bust the prefix cache; changing the tool prefix does.
- Vendor caveat: `$web_search` "is being updated and is not recommended for use in the near term" for K3 — users are steered to the Formula API instead (`GET /v1/formulas/{uri}/tools`, `POST /v1/formulas/{uri}/fibers`; catalog includes `web-search`, `code-runner`, `quickjs`, `memory`, `excel`, `fetch`, `rethink`).
- K2-generation protocol (documented, prose spec): tokens `<|tool_calls_section_begin|>`, `<|tool_call_begin|>`, `<|tool_call_argument_begin|>`, tool IDs formatted `functions.{name}:{idx}` — present in the shipped `chat_template.jinja` of K2.6 and K2.7-Code, plus a vendor `tool_declaration_ts.py`.
- **K3 has no equivalent.** The K3 repo ships no `chat_template.jinja` and no `chat_template` key in `tokenizer_config.json`; instead it ships `encoding_k3.py` ("Kimi K3 XTML encoding helpers") using a different marker set (`<|open|>`, `<|close|>`, `<|sep|>`, `<|end_of_msg|>`) with `normalize_tool_arguments` and `normalize_xtml_tool_result_messages`. **K3's tool-call protocol exists as vendor reference code only — no prose spec, no chat template, no documented parser flag.**

### Modality support

- `kimi-k3`: MoonViT-V2 (401M) vision encoder for image input. Vision does **not** accept public image URLs — base64 or `ms://<file-id>` only.
- `kimi-k2.6`: text, image, and video input — the only current hybrid — but video-in-chat is "an experimental feature and is only supported in our official API for now."
- `kimi-k2.7-code` / `-highspeed`: coding-focused; no image/video input documented.

### Context behavior

- `kimi-k3`: 1,048,576 context; `max_completion_tokens` defaults to 131,072, settable to 1,048,576.
- `kimi-k2.7-code` / `kimi-k2.6`: 256K context.
- Prefix caching engages only when the prior prompt exceeded 256 tokens (K3). Switching `reasoning_effort` invalidates prefix-cache hits; changing `tool_choice` does not, but changing the tool prefix does.
- A `[1m]` model-ID suffix convention exists for 1M context in Claude Code integrations (shared by DeepSeek, GLM, and Kimi) but **`kimi-k3[1m]` is not publicly documented** — do not assume its exact semantics.

### Structured output path

- `{"type": "json_object"}` and `{"type": "json_schema", "json_schema": {name, strict, schema}}`. Under `strict: true` the schema must conform to **MFJS (Moonshot Flavored JSON Schema)**, validatable with Moonshot's own `walle` tool. The vendor rates `kimi-k2.7-code` most stable here (supports `anyOf` / `oneOf` / `$ref` / `additionalProperties: true`); `kimi-k2.6` is more likely to emit out-of-schema fields when strict is off.

### Deployment & residency

- **Licenses diverged at K3 — "Modified MIT" is no longer universal.** `moonshotai/Kimi-K3` → `license_name: "kimi-k3"`, LICENSE titled "Kimi K3 License." MIT-derived, but adds a **Model-as-a-Service revenue trigger**: if the licensee or its affiliates run a MaaS business exceeding **US$20M aggregate revenue over any consecutive 12 months**, a separate agreement with Moonshot is required before any commercial use, plus attribution for products over 100M MAU or US$20M monthly revenue. Both carve-outs are waived for purely internal use. `moonshotai/Kimi-K2.7-Code` and `moonshotai/Kimi-K2.6` → `modified-mit`, "Modified MIT License" — MIT plus the same attribution trigger, **no MaaS clause.**
- **Vendor-documented serving stacks:** K2.6 and K2.7-Code — **vLLM, SGLang, KTransformers**, `transformers >= 4.57.1, < 5.0.0`; each HF repo ships its own `docs/deploy_guidance.md`. K3 — the card names vLLM, SGLang, and TokenSpeed but links only to third-party recipes; **there is no `docs/deploy_guidance.md` in the K3 HF repo (404) and none in `github.com/MoonshotAI/Kimi-K3`.**
- **Exact parser flags, K2.6 and K2.7-Code only:**

  ```
  vllm serve $MODEL_PATH -tp 8 --mm-encoder-tp-mode data --trust-remote-code \
    --tool-call-parser kimi_k2 --reasoning-parser kimi_k2

  sglang serve --model-path $MODEL_PATH --tp 8 --trust-remote-code \
    --tool-call-parser kimi_k2 --reasoning-parser kimi_k2
  ```

  Both are `kimi_k2`, not `kimi_k2_6`. The vendor states `--tool-call-parser kimi_k2` is required to enable tool calling and `--reasoning-parser kimi_k2` is required for correct reasoning handling. Pins: vLLM 0.19.1 manually verified; SGLang `>= 0.5.10.post1`. **No vendor-stated parser name exists for K3.**
- **Self-hosted thinking is a chat-template kwarg, not a request field:** `extra_body={'chat_template_kwargs': {"thinking": False}}` for K2.6 instant mode; `{"thinking": True, "preserve_thinking": True}` for preserved thinking. Confirmed in the vendor's `chat_template.jinja` (`preserve_thinking | default(false)`).
- **What breaks self-hosted:** video-in-chat is official-API-only. The K2.7-Code card warns "Some API (e.g. vLLM) may not support `reasoning_content`, you can try `reasoning` instead" — **the field name for echoing preserved thinking is not stable across engines**, a live hazard given the mandatory echo rule. Context caching, Formula tools, `$web_search`, and the batch/files APIs are platform-only. Moonshot publishes `github.com/MoonshotAI/Kimi-Vendor-Verifier` to check that third-party deployments match theirs.
- **Residency (vendor-stated):** the privacy agreement says the service is "provided and controlled by MOONSHOT AI PTE. LTD. … in Singapore" and "We store the information we collect in secure servers located in Singapore," repeated under the EEA / Switzerland / UK terms. The CN-side privacy agreement was not fetched — **no claim is made that CN data stays in mainland China.**

### Known production failure modes

- Field-name instability for reasoning echo across serving engines (vLLM may need `reasoning` instead of `reasoning_content`) — a silent-degradation risk given the mandatory echo rule on K3 and K2.7-Code.
- Self-hosting K3 with a guessed parser name (e.g. reusing `kimi_k2`, or inventing `kimi_k3`) produces malformed tool calls silently, not an error — no vendor-stated parser exists for K3.
- `$web_search` on K3 is vendor-flagged as "being updated and not recommended for use in the near term" — validate before relying on it in production.
- One documentation page (Claude Code guide) contradicts three others on whether K3 thinking can be turned off — a harness built against the wrong page will attempt an unsupported toggle.
- The K3 blog states weights would be released "by July 27, 2026" while the HF repo's last-modified date is 2026-09-02, and no vendor page reconciles the discrepancy — treat vendor release-timeline claims for this family with extra scrutiny.
- **No large advertised sub-agent-orchestration or coordinated-step-count claim for Kimi appears in the primary sources reviewed for this pass.** If such a marketing claim is encountered elsewhere, treat it as an unvalidated capability claim requiring its own eval and citation before use — consistent with how this skill treats every unvalidated capability claim.

### Harness requirements

- Always echo the complete assistant message — including `reasoning_content` and `tool_calls` — back for K3 and K2.7-Code; omission degrades or breaks multi-turn/tool continuity.
- On the Anthropic surface, pass `thinking` blocks back with their `signature` unchanged, in thinking → text → tool_use order.
- Never pass a `thinking` parameter to `kimi-k3` — it is unsupported.
- Never modify the locked sampling parameters (`temperature`, `top_p`, `n`, `presence_penalty`, `frequency_penalty`) on any current model — non-default values error.
- Before self-hosting K3, budget engineering time to build a tool-call parser against `encoding_k3.py` — there is no vendor-published chat template or parser flag to reuse.
- Validate `strict: true` structured output against Moonshot's `walle` tool for MFJS conformance before shipping.
- Do not assume the `-highspeed` variant has an open-weight repo — it is API-only.

### Retired / migration targets

| Model IDs | Retired | Replacement |
| --- | --- | --- |
| `kimi-k2.5` | 2026-08-31 (16:00) — calls now return 404 "model not found" | `kimi-k3` |
| `moonshot-v1-8k`, `-32k`, `-128k`, `-auto`, `-8k-vision-preview`, `-32k-vision-preview`, `-128k-vision-preview` | 2026-08-31 | `kimi-k3` |
| `kimi-k2-0905-preview`, `kimi-k2-0711-preview`, `kimi-k2-turbo-preview`, `kimi-k2-thinking`, `kimi-k2-thinking-turbo` | 2026-05-25 | `kimi-k3` |
| `kimi-latest` | 2026-01-28 | `kimi-k3` |
| `kimi-thinking-preview` | 2025-11-11 | `kimi-k3` |

The same 2026-08-31 changelog entry carries three integration-breaking changes: Files API IDs now carry a `file_` prefix; images are no longer OCR'd for text extraction (use `purpose=image` for vision); and same-name uploads are auto-renamed server-side.

### Re-evaluate when

- Switching between K3 and K2.6/K2.7-Code — reasoning-echo rules, thinking toggles, and `tool_choice` support differ per model.
- Self-hosting K3 is proposed — no vendor parser flags or chat template exist for it; this is a build-it-yourself situation, not a configuration exercise.
- Moving between Moonshot's official API and self-hosted vLLM/SGLang for K2.6/K2.7-Code — the chat-template-kwarg shape and the request-field shape are not interchangeable.
- Effort level changes mid-session — this invalidates the prefix cache.
- Any config still references a retired ID in the table above.

### Primary sources

- [Kimi platform docs index](https://platform.kimi.ai/docs/introduction)
- [Models](https://platform.kimi.ai/docs/models)
- [Models overview / parameter reference](https://platform.kimi.ai/docs/api/models-overview)
- [Chat API](https://platform.kimi.ai/docs/api/chat)
- [Anthropic Messages API](https://platform.kimi.ai/docs/api/messages)
- [Platform changelog](https://platform.kimi.ai/docs/platform-changelog)
- [Kimi K3 quickstart](https://platform.kimi.ai/docs/guide/kimi-k3-quickstart)
- [Thinking models guide](https://platform.kimi.ai/docs/guide/use-thinking-models)
- [Tool calls guide](https://platform.kimi.ai/docs/guide/use-kimi-api-to-complete-tool-calls)
- [Response format guide](https://platform.kimi.ai/docs/guide/response_format)
- [Privacy agreement](https://platform.kimi.ai/docs/agreement/userprivacy)
- [Kimi-K3 model card](https://huggingface.co/moonshotai/Kimi-K3)
- [Kimi-K2.7-Code model card](https://huggingface.co/moonshotai/Kimi-K2.7-Code)
- [Kimi-K2.6 model card](https://huggingface.co/moonshotai/Kimi-K2.6)
- [Kimi K2 tool-call guidance](https://github.com/MoonshotAI/Kimi-K2/blob/master/docs/tool_call_guidance.md)
- [Kimi K3 blog](https://www.kimi.ai/blog/kimi-k3)

### Sourcing gap carried forward

K3's self-hosted tool-call and reasoning parser flag names are not on any vendor-owned page — do not assert `--tool-call-parser kimi_k3` or any K3 parser name. K3's chat template is not published; its protocol is inferable only from vendor reference code, not a spec. TensorRT-LLM is not mentioned by Moonshot for any current model. The `kimi-k3[1m]` suffix is not publicly documented. CN-platform residency has confirmed base URLs but an unfetched privacy agreement — no claim is made that CN data stays in mainland China. The `kimi-k2.7-code-highspeed` → open-weight repo mapping is presumed, not explicitly stated. The K3 weights-release date is internally inconsistent across vendor pages. No sub-agent-orchestration or coordinated-step capability claim for this family was found in the sources reviewed — if one surfaces elsewhere, it needs its own citation before being treated as a capability rather than a claim.
