---
family: minimax
tier: open-weight
researched_date: 2026-09-08
---

# MiniMax

**Documentation caveat:** VERIFIED. The most restrictive licensing of the Chinese open-weight families in this pass, and the weakest structured-output story — no `json_schema` path is documented for any current model.

### Current models

| Model ID | Context (vendor-stated) | Notes |
| --- | --- | --- |
| `MiniMax-M3` | 1,000,000 | Flagship, "frontier multimodal coding model"; the only model accepting image/video input |
| `MiniMax-M2.7` | 204,800 | "Beginning the journey of recursive self-improvement" |
| `MiniMax-M2.7-highspeed` | 204,800 | Same performance, faster |
| `MiniMax-M2.5` / `-highspeed` | 204,800 | Legacy, still served |
| `MiniMax-M2.1` / `-highspeed` | 204,800 | Legacy, still served |
| `MiniMax-M2` | 204,800 | Legacy, still served |
| `M2-her` | 64K | Chat/roleplay; `model` field "fixed as `M2-her`" |

Spec caveat: the native `POST /v1/text/chatcompletion_v2` OpenAPI `model` enum **omits** `MiniMax-M2.1-highspeed` though the guides list it, and `MiniMax-Text-01` and `MiniMax-M1` linger in that spec's parameter defaults without being in the enum.

**Open weights:** `MiniMaxAI/MiniMax-M3` (~428B total / ~23B activated, native multimodal, MiniMax Sparse Attention), `MiniMaxAI/MiniMax-M3-MXFP8`, `MiniMaxAI/MiniMax-M2.7`, `MiniMax-M2.5`, `MiniMax-M2.1`, `MiniMax-M2` (230B / 10B). Older: `MiniMax-M1-40k`/`-80k` (+`-hf`), `MiniMax-Text-01` (+`-hf`), `MiniMax-VL-01`, `SynLogic-{7B,32B,Mix-3-32B}`, `VTP-{Small,Base,Large}-f16d64`. **The `-highspeed` variants have no open-weight repo — API-only.**

Non-text: video `MiniMax-H3`, `MiniMax-H3-Max`, legacy `MiniMax-Hailuo-2.3`/`-Fast`/`Hailuo-02` (open: `MiniMaxAI/MiniMax-H3`); speech `speech-2.8-hd`/`-turbo`; music `music-3.0`, `music-2.6`, `music-cover` (open: `MiniMaxAI/MiniMax-Music3`); image `image-01`.

### API surface

**Four surfaces, all on `https://api.minimax.io`:** Anthropic-compatible `/anthropic` — **which the vendor labels "Recommended,"** noting it "supports thinking blocks, interleaved thinking, and other advanced features" — plus `/anthropic/v1/messages/count_tokens`; OpenAI-compatible `/v1`; OpenAI Responses `/v1/responses`; and MiniMax-native `/v1/text/chatcompletion_v2`. Official AI SDK provider: `vercel-minimax-ai-provider`.

### Reasoning state

- **Reasoning-echo rule — a hard requirement, stated four different ways across surfaces:**
  - "the complete model response... must be append to the conversation history to maintain the continuity of the reasoning chain."
  - OpenAI-native: "do not modify the `content` field. You must preserve the model's thinking content completely, i.e., `<think>reasoning_content</think>`. This is essential to ensure Interleaved Thinking works effectively."
  - With `reasoning_split=True`: "the entire `response_message` — including the `reasoning_details` field — must be preserved."
  - Anthropic path: "Append the full `response.content` list to the message history"; preserve `thinking` blocks unchanged in later turns, "especially in tool-use conversations."
- **Thinking representation differs by surface — the sharp edge.** Anthropic → typed `thinking` blocks. OpenAI with `reasoning_split=true` → `reasoning_content` plus `reasoning_details` (the vendor "strongly recommend[s]" this format). OpenAI with `reasoning_split=false` (**the default**) → thinking inlined in `content` as `<think>…</think>`. M3's own `chat_template.jinja` uses `<mm:think>` natively, so the `<think>` form is an API-layer rendering, and **self-hosted M3 leaking raw `<mm:think>` is an explicitly documented failure mode.**
- **The M3 thinking on/off default is contradicted across three MiniMax-owned pages.** One says thinking is off by default and enabled with `adaptive`; another says thinking is on by default when omitted; a third says the reasoning-disabled state is the default behavior. The M3 card and chat template document three modes — `enabled` / `adaptive` / `disabled` — with a template default of `adaptive`. **Treat the default as surface-dependent and always set it explicitly.** For all M2.x: "thinking cannot be disabled; `thinking: {"type": "disabled"}` is accepted but thinking remains on." On the Responses API, `minimal`/`low`/`medium`/`high` are "accepted for compatibility" but do not tune MiniMax-M3's reasoning depth.

### Tool semantics

- Standard `tools` / `tool_choice`; **`function_call` is not supported**. On the wire the model emits `<minimax:tool_call>…</minimax:tool_call>` XML for M2 through M2.7 (M2.7 "supports the same toolcall syntax as MiniMax-M2"); M3's template uses a namespaced `<tool_call>` variant. A server-side `web_search` tool (Beta) exists on the Anthropic Messages API and the OpenAI Responses API **only**.

### Modality support

- **`MiniMax-M3` is the only model in the current chat/text lineup that accepts image/video input.** Multimodal limits: images ≤10 MB, URL or base64 video ≤50 MB, request body ≤64 MB, Files API video ≤512 MB via `mm_file://{file_id}`.
- Non-text model families — video (`H3`/`H3-Max`/Hailuo), speech (`speech-2.8-hd`/`-turbo`), music (`music-3.0`/`2.6`/`cover`), image (`image-01`) — are separate product lines, not part of the chat/text API.

### Context behavior

- `MiniMax-M3`: 1,000,000 vendor-advertised, but self-hosting is marked **Experimental** and "context is validated only from 1K to 128K input tokens" — **"1M is a model limit, not the validated production default."**
- M2.x family: 204,800 advertised on the API, but the vendor's own hardware guidance states **"the maximum context length per individual sequence remains 196K tokens"** self-hosted — lower than the API-advertised figure.
- `M2-her`: 64K.
- **Prompt caching: automatic caching covers M3, M2.7, M2.5, M2.1; explicit `cache_control` covers M2.7, M2.5, M2.1, M2 — M3 is notably absent from the explicit list.**

### Structured output path

- **Structured output is effectively unavailable for current models.** `response_format` with `{"type": "json_schema", …}` exists **only** on the native `/v1/text/chatcompletion_v2` endpoint, and the spec scopes it to `MiniMax-Text-01`. **No `response_format` or `json_schema` support for M3 or M2.x is documented on any MiniMax-owned page as of 2026-09-08.** Tool calling is the vendor-blessed structured path.

### Deployment & residency

- **Licenses — the most restrictive of the Chinese open-weight families, and they tightened over time:**
  - `MiniMax-M3` and `-MXFP8` → `license_name: minimax-community`, "MINIMAX COMMUNITY LICENSE." **Non-commercial by default.** Commercial use requires displaying "Built with MiniMax M3," a one-time notice to `api@minimax.io`, and **prior written authorization above $20M yearly revenue.** Has a Prohibited Uses appendix.
  - `MiniMax-M2.7` → "NON-COMMERCIAL LICENSE": non-commercial use permitted on MIT-style terms; commercial use requires prior written authorization, plus a "Built with MiniMax M2.7" display requirement. Personal self-hosted development and non-profit/academic research are explicitly free. **A material tightening versus M2.**
  - `MiniMax-M2.5` → HF frontmatter says `modified-mit` but the repo file is `LICENSE-MODEL` headed "MINIMAX MODEL LICENSE" — **frontmatter and file disagree; trust the file.**
  - `MiniMax-M2.1` → `modified-mit`; MIT plus a display requirement ("MiniMax M2.1" on the UI) for commercial products.
  - `MiniMax-M2` → `modified-mit`; MIT plus attribution triggered only above 100M MAU or $30M ARR. **The most permissive of the family.**
  - `MiniMax-H3` → `license_name: minimax-h3-community-license-agreement`, dated 2026-08-02, **expressly limited to a defined "Applicable Territory"** — a territorial restriction worth flagging in any procurement review.
- **Exact parser flags, vendor-published for the M2 family** (one guide covers M2, M2.1, M2.5, M2.7 — "You only need to change the model name"):

  ```
  SAFETENSORS_FAST_GPU=1 vllm serve MiniMaxAI/MiniMax-M2.7 --trust-remote-code \
      --tensor-parallel-size 4 \
      --enable-auto-tool-choice --tool-call-parser minimax_m2 \
      --reasoning-parser minimax_m2_append_think

  python -m sglang.launch_server --model-path MiniMaxAI/MiniMax-M2.7 --tp-size 4 \
      --tool-call-parser minimax-m2 --reasoning-parser minimax-append-think \
      --trust-remote-code --host 0.0.0.0 --port 8000 --mem-fraction-static 0.85
  ```

  **The parser names differ by engine: vLLM uses underscores (`minimax_m2`, `minimax_m2_append_think`), SGLang uses hyphens (`minimax-m2`, `minimax-append-think`).** `--enable-auto-tool-choice` is vLLM-only. SGLang requires `>= v0.5.4.post1`. Documented workarounds: `CUDA error: illegal memory access` → add `--compilation-config "{\"cudagraph_mode\": \"PIECEWISE\"}"`; garbled output → a specific vLLM nightly build.
- **M2.x hardware, vendor-stated:** 220 GB weights, 240 GB per 1M context tokens; 96G×4 → 400K aggregate KV cache; 144G×8 → up to 3M — but again, **the per-sequence limit is 196K**, not the aggregate figure.
- **M3 self-hosting is explicitly marked Experimental by MiniMax** ("Last documentation review: August 26, 2026"). Reference baseline: 8×B200, `MiniMaxAI/MiniMax-M3-MXFP8` pinned to a specific revision (~444 GB), an SGLang image pinned by digest, with `--reasoning-parser auto --tool-call-parser auto --tp 8`. **M3 gets `auto` parsers, not a named `minimax_m3` parser.** The M3 card also names SGLang, vLLM, Transformers (`minimax_m3_vl`), KTransformers, Unsloth, ATOM (ROCm), and MLX-LM.
- **Recommended sampling:** M2 family → `temperature=1.0, top_p=0.95, top_k=40`; M3 → `temperature=1.0, top_p=0.95` (no `top_k`).
- **What breaks self-hosted (vendor-stated):** video input "Not validated in this SGLang recipe"; context validated only 1K–128K input tokens; the ROCm path has no vision validation. Omitting the parsers surfaces raw `<mm:think>` and raw tool-call tokens in `content`. Open weights "do not include MiniMax Platform managed files, caching, content safeguards, or platform-only workflows" — prompt caching, server-side `web_search`, the Files API, and `service_tier` are API-only.
- **Residency (vendor-stated, verbatim):** "The `ANTHROPIC_BASE_URL` should be set based on your location: for international users, use `https://api.minimax.io/anthropic`; for users in China, use `https://api.minimax.cn/anthropic`." Region auto-detects from key origin, with manual override. **No data-retention or compliance difference between the two regions is stated.** MiniMax publishes **EU AI Act Article 53(1)(d) training-content summaries** for M3 and H3 — the only such disclosure found across the families researched in this pass.

### Known production failure modes

- Raw `<mm:think>` or raw tool-call tokens leaking into `content` when self-hosted parsers are omitted or misconfigured — an explicitly documented failure mode, not a hypothetical.
- Three MiniMax-owned pages give three different answers for M3's thinking default — a harness that assumes any single default risks silently running the wrong reasoning mode. Always set it explicitly.
- Self-hosted M3 is Experimental with only 1K–128K context validated in practice, despite a 1,000,000-token API limit — treating the full 1M as production-ready self-hosted capacity is unvalidated.
- Self-hosted M2.x per-sequence context (196K) is lower than the vendor's own API-advertised figure (204,800) — sizing a deployment to the API number will fall short.
- No structured-output / `json_schema` capability is documented for M3 or M2.x anywhere — treat any such claim (vendor or third-party) as unverified pending a fresh citation.
- **No large advertised sub-agent-orchestration or coordinated-step-count claim for MiniMax appears in the primary sources reviewed for this pass.** If encountered elsewhere, treat it as an unvalidated capability claim requiring its own eval, consistent with how this skill treats every such claim.

### Harness requirements

- Echo the complete prior response back into history on every turn — including `reasoning_details` when `reasoning_split=true`, or the full `<think>` block when it is `false` — the vendor states this requirement four separate times across surfaces, and skipping it degrades Interleaved Thinking silently.
- Set the M3 thinking mode explicitly (`enabled`/`adaptive`/`disabled`) on every request rather than relying on a default — the vendor's own pages disagree on what that default is.
- Do not size a self-hosted M3 or M2.x deployment to the advertised 1,000,000 / 204,800 context; validate against the vendor's stated validated ranges (128K for M3, 196K per-sequence for M2.x) first.
- Confirm parser flag syntax per engine before deploying — vLLM uses underscores, SGLang uses hyphens, and mixing them silently fails to enable tool calling or reasoning parsing.
- Do not rely on `response_format`/`json_schema` for structured output on M3 or M2.x; use tool calling as the structured-data path instead.
- Check the specific license *file* in the repo being deployed, not the HF frontmatter tag or family reputation — MiniMax-M2.5's frontmatter and license file disagree, and MiniMax-H3 carries a territorial restriction.

### Retired / migration targets

**No MiniMax text/LLM retirement, deprecation, or shutdown date is publicly documented as of 2026-09-08.** `MiniMax-M2.5`, `-M2.5-highspeed`, `-M2.1`, `-M2.1-highspeed`, and `-M2` sit under a "Legacy Models" accordion but are all still listed as supported on all three endpoints with no replacement date. The `/docs/faq/history-modelinfo` page linked from the FAQ returns HTTP 404.

Documented retirements, **non-text only**:

- Music, effective **2026-08-20**: paid Music Generation and Lyrics Generation APIs "will no longer be available to new users; existing paying users can continue"; free `Music-3.0-free`, `Music-2.6-free`, and `music-cover-free` "will be discontinued." Replacement: MiniMax Audio, or open-source `MiniMaxAI/MiniMax-Music3`.
- Speech, **2025-06-20**: the previous text-to-voice API is now legacy — service continues uninterrupted but receives no future updates — replaced by Voice Design.

Release dates: M3 2026-06-01 · M2.7 2026-03-18 · M2.5 2026-02 · M2.1 2025-12-22 · M2 2025-10-27 · MiniMax-Text-01 and VL-01 2025-01-15.

### Re-evaluate when

- Any self-hosted deployment is sized against the advertised context window rather than the vendor's own validated range.
- `reasoning_split` configuration changes (`true` vs. `false`) on the OpenAI-compatible surface — the shape of thinking state changes entirely.
- Self-hosting M3 is proposed — it remains vendor-labeled Experimental; treat it as such in any production risk assessment.
- A MiniMax deprecation page appears where none exists today — re-run Discovery once one is published.
- A MiniMax repo's specific license file has not been checked directly (not just the HF frontmatter tag).

### Primary sources

- [Models introduction](https://platform.minimax.io/docs/guides/models-intro)
- [Text generation guide](https://platform.minimax.io/docs/guides/text-generation)
- [M3 function calling](https://platform.minimax.io/docs/guides/text-m3-function-call)
- [M2 reasoning](https://platform.minimax.io/docs/guides/text-m2-reasoning)
- [Local deployment](https://platform.minimax.io/docs/guides/local-deploy)
- [Local deployment: M3](https://platform.minimax.io/docs/guides/local-deploy-m3)
- [Anthropic-compatible API](https://platform.minimax.io/docs/api-reference/text-anthropic-api)
- [OpenAI-compatible API](https://platform.minimax.io/docs/api-reference/text-openai-api)
- [Responses API](https://platform.minimax.io/docs/api-reference/responses-create)
- [Prompt caching](https://platform.minimax.io/docs/api-reference/text-prompt-caching)
- [Model release notes](https://platform.minimax.io/docs/release-notes/models)
- [Transparency / EU AI Act summaries](https://platform.minimax.io/docs/guides/transparency)
- [MiniMax-M3 model card](https://huggingface.co/MiniMaxAI/MiniMax-M3)
- [MiniMax-M2.7 model card](https://huggingface.co/MiniMaxAI/MiniMax-M2.7)
- [MiniMax-M2 model card](https://huggingface.co/MiniMaxAI/MiniMax-M2)
- [MiniMaxAI HuggingFace org](https://huggingface.co/MiniMaxAI)

### Sourcing gap carried forward

Structured output for M3 and M2.x is not publicly documented as of 2026-09-08 — do not assume constrained JSON decoding. The M3 thinking default is unresolvable from vendor docs — three MiniMax-owned pages give three different answers; record the contradiction, not a value. M3 self-host parser identifiers are not published — only `--reasoning-parser auto --tool-call-parser auto` is vendor-stated, with no `minimax_m3` analogue. MiniMax publishes no vLLM command of its own for M3 — the card links to third-party `recipes.vllm.ai`. The "do not remove `<think>`" warning appears on the M2 card and the M3 function-call guide but is not repeated on the M2.7, M2.5, or M2.1 cards. Residency has only base-URL routing vendor-stated — no region-specific data-retention, storage-location, or compliance claim was found, and `platform.minimaxi.com` docs were not independently fetched. `/docs/faq/history-modelinfo` is linked from the FAQ but 404s. The native `chatcompletion_v2` per-model defaults list only M2, M1, and Text-01 — a stale spec, unusable for current models.
