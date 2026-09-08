---
family: deepseek
access: open-weight
scope: global
researched_date: 2026-09-08
---

# DeepSeek

### Current models

| Model ID | Version | Architecture | Context | Max output |
| --- | --- | --- | --- | --- |
| `deepseek-v4-flash` | DeepSeek-V4-Flash-0731 | 284B total / 13B activated MoE | 1M | 384K |
| `deepseek-v4-pro` | DeepSeek-V4-Pro-0813 | 1.6T total / 49B activated MoE | 1M | 384K |
| `deepseek-v4-flash-vision-exp` | experimental vision | matches V4-Flash on text | 1M | 384K |

All three support thinking and non-thinking modes. `deepseek-v4-pro` adds three thinking effort levels: `low` / `high` / `max`. The vision model does not support FIM completion; the other two support FIM in non-thinking mode only. Open weights: `deepseek-ai/DeepSeek-V4-Pro`, `-Base`, `DeepSeek-V4-Flash`, `-Base`, `DeepSeek-V4-Flash-Vision-Exp`.

### API surface

- Three protocol surfaces: OpenAI Chat Completions and the OpenAI Responses API, both at `https://api.deepseek.com`, plus Anthropic Messages at `https://api.deepseek.com/anthropic`.
- **Anthropic model-name mapping is lossy and silent:** `claude-opus*` maps to `deepseek-v4-pro`; `claude-haiku*` and `claude-sonnet*` map to `deepseek-v4-flash`. Any unsupported model name silently maps to `deepseek-v4-flash` rather than erroring, and `anthropic-version` / `anthropic-beta` headers are ignored on `/messages`. A harness routing by model name against this endpoint can silently downgrade.
- DeepSeek's published Codex model catalog declares `context_window: 1048576`, `apply_patch_tool_type: "freeform"`, `supports_parallel_tool_calls: true`, and the same low/high/max effort levels.

### Reasoning state

- Thinking is **on by default at effort `high`**. The toggle differs per protocol: OpenAI-shaped requests use `{"thinking": {"type": "enabled" | "disabled"}}` plus `reasoning_effort` (`low` / `high` / `max`); Anthropic-shaped requests use `{"reasoning": {"effort": "none" | "low" | "high" | "max"}}` (`none` disables) plus `output_config.effort`. `medium` and `xhigh` are accepted on either surface and silently remapped to `high`.
- **Thinking mode silently ignores `temperature`, `top_p`, `presence_penalty`, and `frequency_penalty`** — they are accepted without error and have no effect. A harness that tunes these per-call will see no behavior change and may misdiagnose why.
- **Reasoning-state echo rule is conditional on `tools`.** A request without `tools` need not pass `reasoning_content` back (if passed, it's ignored). A request **with** `tools` must pass back `reasoning_content` for all previous turns — including turns with no tool call — or the API returns a hard 400. Reasoning arrives in a `reasoning_content` field sibling to `content`; `usage` carries `reasoning_tokens`.
- Self-hosted (reference implementation) thinking control is a function kwarg, not a request field: `thinking_mode="thinking" | "chat"`, plus `drop_thinking` (default `True`), which is automatically disabled when tools are present — mirroring the hosted API's 400-on-missing-reasoning rule. `reasoning_effort="max"` prepends a literal "Reasoning Effort: Absolute maximum..." block before the system message.

### Tool semantics

- Tool calling on the hosted API is OpenAI-shaped: max 128 functions, `tool_choice` supports `none` / `auto` / `required` / named. A `strict` schema-compliance mode exists and is marked **Beta**, requiring base URL `https://api.deepseek.com/beta`.
- **Self-hosted tool-calling wire format is proprietary DSML, not OpenAI JSON.** Tool calls are emitted inside `<｜DSML｜tool_calls｜>` / `<｜DSML｜invoke name="fn"｜>` / `<｜DSML｜parameter name="p" string="true"｜>` markup (`string="true"` = raw string, `string="false"` = JSON value). Tool results come back wrapped in `<tool_result>` inside **user** messages, sorted to match the preceding `tool_calls` order. The vendor states the parser "does not attempt to correct or recover from malformed output" — a self-hosted harness owns recovery entirely.
- `finish_reason` includes a non-standard value: `insufficient_system_resource`. `user_id` (via `extra_body`) provides content-safety, KV-cache, and scheduling isolation; concurrency limits are 500 (v4-pro) and 2500 (v4-flash / vision-exp).
- No vLLM, SGLang, TensorRT-LLM, or serving-stack `--tool-call-parser` path is vendor-documented for V4 at all (see Deployment & residency) — this is the one family in this pass with zero vendor-stated serving-stack story for tool calling.

### Modality support

- `deepseek-v4-flash-vision-exp` is the only vision-capable model; it bills images at up to 384 tokens each and matches V4-Flash on text otherwise.
- Otherwise text/code/reasoning only. Treat any other modality claim as unverified.

### Context behavior

- 1M-token context, 384K max output, across all three models. For Think Max effort, the vendor's own local-deploy recommendation calls for a context window of at least 384K.
- Long agentic loops with `tools` present carry the full-history `reasoning_content` echo burden above — context cost of a tool loop grows with every turn's reasoning, not just its output.

### Structured output path

- **JSON-mode only** — `response_format` supports `{"type": "json_object"}`; there is no `json_schema` path. The prompt (system or user) must also include the word "json" or the request errors. The docs warn JSON output "may occasionally return empty content," so external validation and retry remain mandatory regardless of mode.

### Deployment & residency

- **License: MIT** for all V4 weights — DeepSeek is the only one of the five open-weight families refreshed in this pass still on a fully permissive license.
- **No Jinja chat template is shipped.** Verbatim from the model card: "This release does not include a Jinja-format chat template. Instead, we provide a dedicated `encoding` folder with Python scripts" (`encode_messages(...)`, `parse_message_from_completion_text(...)` in `encoding_dsv4.py`).
- **DeepSeek documents no vLLM, SGLang, TensorRT-LLM, or llama.cpp path for V4** — zero mentions across the model card and encoding docs, and there is no `DeepSeek-V4` GitHub repo under `deepseek-ai`. The only vendor-documented local path is DeepSeek's own `inference/` reference implementation: `convert.py` then `torchrun generate.py --nproc-per-node ${MP}`, single- or multi-node. Vendor local-deploy sampling recommendation: `temperature = 1.0`, `top_p = 1.0`.
- Special tokens for self-hosting: `<｜begin▁of▁sentence｜>`, `<｜User｜>`, `<｜Assistant｜>`, `<think>` / `</think>`, `<｜latest_reminder｜>`. Roles supported by the encoder: `system`, `user`, `assistant`, `tool`, `latest_reminder`, `developer` — but the hosted API does not accept the `developer` role.
- **Residency: no vendor-owned page reachable.** The privacy-policy URL under `platform.deepseek.com` returns HTTP 403 and the `cdn.deepseek.com` policy URL does not resolve. No hosting-location or data-retention claim is recorded; treat residency as an open question for any compliance-gated deployment.

### Known production failure modes

- **Legacy alias retirement is discovery-hazardous**: the pricing page carries no deprecation notices; the retirement lived only on changelog/news pages. A reader checking "what models can I call" against the pricing page alone would never learn `deepseek-chat` / `deepseek-reasoner` had been retired.
- Missing `reasoning_content` on any prior turn once `tools` is present → hard 400, not a graceful degradation.
- Thinking mode silently ignoring sampling parameters, producing no error but no effect either.
- JSON mode returning empty content even when correctly configured.
- Anthropic-shaped requests silently mapping an unrecognized model name to `deepseek-v4-flash` instead of erroring.
- Self-hosted DSML tool-call parsing failing silently on malformed model output, since the vendor's own parser does not attempt recovery.

### Harness requirements

- Pin exact model IDs (`deepseek-v4-flash`, `deepseek-v4-pro`, `deepseek-v4-flash-vision-exp`) and track future alias/version changes against the changelog page, not the pricing page.
- When `tools` are present, echo `reasoning_content` for every prior turn, including turns with no tool call, or expect a 400.
- Validate structured output outside the model; JSON mode has a documented empty-content failure mode.
- If self-hosting, budget engineering time for the DSML parser and the `encoding_dsv4.py` scripts — there is no vLLM/SGLang shortcut, and the vendor parser does not recover from malformed output.
- Do not tune `temperature`/`top_p`/penalty parameters as a lever in thinking mode; they have no effect.

### Retired / migration targets

**`deepseek-chat` and `deepseek-reasoner` were retired on 2026-07-24 at 15:59 UTC** (per DeepSeek's V4 release note, verified verbatim: "deepseek-chat & deepseek-reasoner will be fully retired and inaccessible after Jul 24th, 2026, 15:59 (UTC Time)"). That date has passed — these IDs are dead, not scheduled for discontinuation.

The mapping during the transition window was **mode-split, not a single target**:

| Retired alias | Replacement |
| --- | --- |
| `deepseek-chat` | `deepseek-v4-flash`, **non-thinking** mode |
| `deepseek-reasoner` | `deepseek-v4-flash`, **thinking** mode |

Prior lineage (for historical audit context only, from the `/updates` changelog): 2025-12-01 both IDs → V3.2; 2025-09-29 → V3.2-Exp; 2025-09-22 → V3.1-Terminus; 2025-08-21 → V3.1; 2025-05-28 `deepseek-reasoner` → R1-0528; 2025-03-24 `deepseek-chat` → V3-0324. The V3.2-Speciale temporary endpoint expired 2025-12-15 15:59 UTC.

### Re-evaluate when

- Any config still references `deepseek-chat` or `deepseek-reasoner` — these are dead, not deprecated.
- Switching between thinking and non-thinking modes, or between protocol surfaces (OpenAI Chat Completions, Responses API, Anthropic Messages) — the reasoning-state contract differs per surface.
- Self-hosting is proposed — there is no vendor-documented serving-stack path; budget for the DSML parser directly.
- A regulated deployment needs a residency or retention answer — none is currently documented by DeepSeek.

### Primary sources

- [DeepSeek API updates](https://api-docs.deepseek.com/updates)
- [V4 release note, 2026-04-24](https://api-docs.deepseek.com/news/news260424)
- [V4-Pro GA, 2026-08-13](https://api-docs.deepseek.com/news/news260813)
- [Thinking mode](https://api-docs.deepseek.com/guides/thinking_mode)
- [Tool calls](https://api-docs.deepseek.com/guides/tool_calls)
- [Anthropic API compatibility](https://api-docs.deepseek.com/guides/anthropic_api)
- [Responses API](https://api-docs.deepseek.com/guides/responses_api)
- [JSON mode](https://api-docs.deepseek.com/guides/json_mode)
- [DeepSeek-V4-Pro model card](https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro)
- [DeepSeek-V4-Flash model card](https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash)

### Sourcing gap carried forward

Hosting location, data residency, and retention have no reachable vendor-owned page (403 and dead URLs as of 2026-09-08). The semantics of the `deepseek-v4-pro[1m]` model-ID suffix, which appears only in the Claude Code integration guide, are not publicly documented. vLLM / SGLang / TensorRT-LLM support for V4 is undocumented by DeepSeek — an absence of mention, not an explicit denial. There is no dedicated error-code page entry for the tools-plus-missing-`reasoning_content` 400; that rule is stated only in the thinking-mode guide.
