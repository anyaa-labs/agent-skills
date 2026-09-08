---
family: nvidia-nemotron
tier: open-weight
researched_date: 2026-09-08
---

# Nemotron (Nvidia)

**Detection note.** The same model carries three different ID strings depending on how it is reached: a HuggingFace repo (`nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-FP8`), a hosted NIM catalog ID (`nemotron-3-super-120b-a12b`, or the API string `nvidia/nemotron-3-super`), or a NIM container tag (`nvcr.io/nim/nvidia/nemotron-3-ultra-550b-a55b:2.0.5-variant`). Grep for `nemotron`, `integrate.api.nvidia.com`, and `nvcr.io/nim`.

### API surface

- **A NIM container exposes an unusually broad set of endpoints:** OpenAI-compatible `/v1/chat/completions`, `/v1/completions`, **and `/v1/responses`**, plus **Anthropic-compatible `/v1/messages` and `/v1/messages/count_tokens`**. The Anthropic surface supports `tool_use`/`tool_result` blocks, a top-level `system` field, `thinking` content blocks, and SSE streaming with `message_start` / `content_block_delta` / `message_delta` / `message_stop`.
- **A harness written against either the OpenAI or the Anthropic wire format can target Nemotron without an adapter.** That is rare, and it makes Nemotron a realistic in-boundary substitute when a residency or cost constraint forces a model off a hosted frontier provider — the client code can often stay as-is.
- Also documented: `/tokenize`, `/detokenize`, `POST /inference/v1/generate` (disaggregated serving, vLLM 0.11.1+), `POST /generative_scoring` (vLLM 0.20.0+), and health/metrics/version/manifest/license endpoints.
- Hosted catalog base URL: `https://integrate.api.nvidia.com/v1`.
- NVIDIA's own open-scaffolding guidance points at OpenCode, OpenClaw, and Kilo Code CLI (via OpenRouter `nvidia/nemotron-3-super-120b-a12b:free`) and OpenHands CLI against `build.nvidia.com` — i.e. NVIDIA expects Nemotron to be driven by an existing agent harness rather than a bespoke one.

### Reasoning state

- **An explicit request-level toggle, not a separate checkpoint:** `"chat_template_kwargs": {"enable_thinking": true|false}`.
- **The server must be started with `--reasoning-parser nemotron_v3`.** Super's advanced deployment guide additionally documents a `super_v3` parser loaded via `--reasoning-parser-plugin super_v3_reasoning_parser.py --reasoning-parser super_v3`.
- Budget controls appear under three names depending on the model and surface: `thinking_token_budget`, `reasoning_budget` (Nano Omni: 16384 with `grace_period` 1024), and `low_effort: True` on Super.
- **Silent-failure mode worth naming: Nano Omni's card notes that reasoning traces land in the `content` field by default unless the reasoning parser strips them.** A self-hosted deployment that forgets `--reasoning-parser` will leak thinking into user-visible output with no error.
- **Gap:** whether reasoning must be replayed across turns is **not publicly documented as of 2026-09-08**.

### Tool semantics

- Standard OpenAI function-calling schema; `tool_choice` supports `none` / `auto` / named.
- **The self-hosting requirement is the finding: `--enable-auto-tool-choice --tool-call-parser qwen3_coder`. Nemotron 3 borrows the Qwen3-Coder tool parser** — there is no `nemotron` tool parser. An operator who reasons from the family name will not find one, and tool calls will not parse. This is the most likely single cause of a "Nemotron can't call tools" incident.
- **Nano Omni additionally requires `trust_remote_code=True`** for its custom chat template — a security-relevant flag that belongs in the deployment review, not just the runbook.
- MTP (multi-token prediction) is claimed to give a 2–3× speedup on structured generation, including tool calls.
- **Gaps:** parallel tool-call support, tool-call ID semantics, and **MCP support** are **not publicly documented as of 2026-09-08**. Do not assume Nemotron speaks MCP natively; the scaffolding page routes MCP through the surrounding agent harness instead.

### Modality support

- **Ultra, Super, Nano and 3.5 Lightning are text in / text out only.**
- **`Nemotron-3-Nano-Omni-30B-A3B-Reasoning` takes video, audio, image and text in, and emits text only.** It is the only multimodal chat model in the line.
- Speech, OCR, document parsing and vision embedding/reranking are **separate catalog models**, not modes of the chat models: `nemotron-asr-streaming`, `nemotron-voicechat`, `nemotron-ocr-v1`/`v2`, `nemotron-parse`, `nemotron-page-elements-v3`, `nemotron-table-structure-v1`, `nemotron-graphic-elements-v1`, `llama-nemotron-embed-vl-1b-v2`, `llama-nemotron-rerank-vl-1b-v2`. Safety models (`nemotron-3.5-content-safety`, `llama-3_1-nemotron-safety-guard-8b-v3`, `llama-3_1-nemoguard-8b-content-safety`, `llama-3_1-nemoguard-8b-topic-control`) are likewise separate components. A multimodal Nemotron system is a **pipeline of models**, and each hop is its own latency, cost, and failure surface.

### Context behavior

- **The 1M figure is family marketing; 256K is the per-model runtime default.** The Super build page states 1,048,576 tokens and `developer.nvidia.com` markets 1M for the family, but the Ultra NIM day-0 guide says **natively 262,144 tokens (256K), extensible to 1M only via `VLLM_ALLOW_LONG_MAX_MODEL_LEN=1` plus an explicit `--max-model-len`**. The Nano card says 1M max with a **256K default in the HF config**; the Nano Omni card says 256K max. **Check the specific repo's config before designing against 1M.**
- Long context comes from a **Mamba-2 hybrid backbone** with linear-time processing. **Serving caveat with teeth: the Super advanced deployment guide states that the Mamba-2 SSM state cache requires float32 for all checkpoint precisions** — but NVIDIA's own NIM day-0 Ultra guide documents `--mamba-ssm-cache-dtype float16 --enable-mamba-cache-stochastic-rounding` specifically for NVFP4 checkpoints, and the Super guide's own throughput-optimized TensorRT-LLM Config B (also NVFP4) sets the same float16 dtype. Both are NVIDIA-owned pages; see the sourcing gap below before picking a dtype for an NVFP4 deployment.
- `--kv-cache-dtype fp8` is a documented serving flag. **No prompt-caching product feature is documented** — cost control is a serving-configuration problem, not an API feature.
- **NVIDIA names two agent failure modes itself** on the scaffolding page: **"goal drift"** (the agent loses alignment as context accumulates) and **"tool-call failures"** (malformed or hallucinated function calls breaking execution loops) — and positions the long window as the mitigation. Note that a long window is a mitigation for context *exhaustion*, not for goal drift; treat NVIDIA's framing as a vendor claim and keep the usual initializer/handoff discipline.
- No family-wide max-output ceiling is documented: **Nano Omni gives 20,480 tokens in thinking mode and 1,024 in instruct mode**; Super examples use `max_tokens=16000`.

### Structured output path

- Two paths, with a stated NVIDIA preference. `response_format={"type":"json_object"}` works but, in NVIDIA's words, "permits the model to produce any valid JSON, including empty objects."
- **NVIDIA recommends `guided_json` inside the `nvext` extension via `extra_body`, backed by `xgrammar` (falling back to `outlines`).** Also available: `guided_regex`, `guided_grammar` (EBNF), and `guided_choice`.
- **This is genuine grammar-level constraint, not JSON mode**, and it is a real reason to choose Nemotron when output shape must be guaranteed on infrastructure you control. It is also a portability hazard in the other direction: `nvext`/`guided_*` is NVIDIA-specific, so a harness that depends on it cannot move to a provider without an equivalent.

### Deployment & residency

- **Both hosted and open weights.** Hosted: NIM microservices, `build.nvidia.com`, and OpenRouter. Weights: the `nvidia` HuggingFace org, runnable on **vLLM (0.17.1 cited), SGLang, TensorRT-LLM (1.3.0rc5), Ollama, and llama.cpp**.
- **On-prem is fully supported — that is the point of NIM**, which makes Nemotron one of the stronger candidates for a residency- or sovereignty-constrained deployment that still needs a large model and a documented grammar path.
- **Licensing is inconsistent across the family and must be checked per repo.** Super and Nano cards say **NVIDIA Nemotron Open Model License**; Nano Omni says **NVIDIA Open Model Agreement**; 3.5 Lightning NVFP4 says **OpenMDW-1.1**. Do not assume one license covers the family, and do not assume any of them is OSI-approved without reading it.
- Weights ship in multiple precisions (`BF16`, `FP8`, `NVFP4`, `GGUF`) as separate repos — the precision is part of the model identity, not a runtime flag.
- **Data residency for the hosted `integrate.api.nvidia.com` endpoint is not publicly documented as of 2026-09-08.** Self-hosted NIM residency is whatever your own infrastructure is, which is the posture to rely on if residency matters.

### Known production failure modes

- **Tool calls silently failing to parse** because the server was started without `--tool-call-parser qwen3_coder` — or because an operator looked for a `nemotron` parser that does not exist.
- **Reasoning traces leaking into `content`** because `--reasoning-parser nemotron_v3` was not set. No error; just thinking in the user-facing output.
- **A 1M context assumed from the marketing page** when the deployed model natively serves 256K and needs `VLLM_ALLOW_LONG_MAX_MODEL_LEN=1` plus an explicit `--max-model-len` to go further.
- **The Mamba-2 SSM cache set to float16 on a non-NVFP4 checkpoint**, or set to float16 without the required stochastic rounding — the Super guide's general guidance and its latency-optimized Config A require float32 for all checkpoint precisions; float16 is only documented for NVFP4 (NIM day-0 Ultra guide, and the Super guide's own throughput-optimized Config B), and there with `--enable-mamba-cache-stochastic-rounding` attached.
- **`trust_remote_code=True` enabled for Nano Omni without a security review** of the custom chat template it loads.
- **A license assumption applied family-wide** across three different license names.
- **A harness locked to `nvext`/`guided_json`** with no fallback, blocking any move to a provider without an equivalent grammar path.
- **MCP assumed native.** It is not documented; MCP must come from the surrounding harness.
- **A multimodal pipeline assumed to be one model.** ASR, OCR, parsing, and embedding are separate catalog models, each with its own latency and failure mode.
- **Goal drift on long agent loops**, which NVIDIA names explicitly and which a large context window does not by itself fix.
- **Reasoning state dropped or replayed on a guess**, since the requirement is undocumented.

### Harness requirements

- Start every self-hosted deployment with **`--enable-auto-tool-choice --tool-call-parser qwen3_coder`** and **`--reasoning-parser nemotron_v3`** (or the `super_v3` plugin where documented), and verify both with a smoke test that exercises a tool call and a thinking turn.
- Keep the **Mamba-2 SSM state cache in float32** for BF16/FP8 checkpoints, per the Super guide's general guidance and its latency-optimized Config A. For **NVFP4 checkpoints**, NVIDIA's NIM day-0 Ultra guide and the Super guide's own throughput-optimized Config B instead document `--mamba-ssm-cache-dtype float16 --enable-mamba-cache-stochastic-rounding` — the two NVIDIA pages disagree even within NVFP4 depending on which config you deploy, so verify against the specific profile/config table rather than assuming float32 unconditionally.
- Read the deployed repo's config for the real `max_position_embeddings`; do not design against the family's 1M marketing figure without setting the flags that enable it.
- Treat `trust_remote_code=True` (Nano Omni) as a reviewed security decision.
- Prefer **`guided_json` / `guided_grammar`** over JSON mode when output shape matters, and keep a schema-validation fallback so the harness is not permanently bound to `nvext`.
- Check the license on the specific repo before shipping.
- Supply MCP, approval gates, and trace from the surrounding harness — NVIDIA documents none of them at the model layer.
- If residency matters, self-host; NVIDIA publishes no residency posture for its hosted endpoint.

### Retired / migration targets

- **No deprecation notice exists for any Nemotron 3 LLM ID as of 2026-09-08.**
- The only first-party EOL notice reached is adjacent rather than Nemotron-3: **NVIDIA NIM Llama-3.1-70b-instruct → NVIDIA NIM Llama-3.3-70b-instruct, EOL July 2026, final supported version 1.10.**
- Retriever/reranker rebrands (`llama-3.2-nemoretriever-300m-embed-v2` → `llama-nemotron-embed-300m-v2` and similar) appear only in third-party snippets with **no fetchable first-party page — recorded as unverified, not as fact.**
- **The practical migration risk here is the absence of a policy, not a published date.** With no deprecation page for the Nemotron LLM line, a system pinned to a specific repo and precision has no vendor-published signal that it is aging. Track the HuggingFace org and the NIM catalog directly.

### Version-specific notes

- **Ultra** — `nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16` / `-NVFP4` / `-Base-BF16` / `-GenRM`; catalog `nemotron-3-ultra-550b-a55b`. Natively 256K, 1M behind an explicit flag. The largest model in the line. Cost tier: $$$ (or self-hosted compute).
- **Super** — `nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-BF16` / `-NVFP4` / `-FP8` / `-Base-BF16`; catalog `nemotron-3-super-120b-a12b`, API string `nvidia/nemotron-3-super`. Supports `low_effort: True` and the `super_v3` reasoning-parser plugin. The line NVIDIA's own scaffolding docs are written against. Cost tier: $$.
- **Nano** — `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-*` and `-4B-*` (including GGUF for llama.cpp). 1M max, 256K default in config. Cost tier: $.
- **Nano Omni** — `nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-BF16` / `-FP8` / `-NVFP4`; catalog `nemotron-3-nano-omni-30b-a3b-reasoning`. Video/audio/image/text in, text out. 256K max; 20,480 output tokens thinking / 1,024 instruct; `reasoning_budget` 16384 with `grace_period` 1024. Requires `trust_remote_code=True`. Cost tier: $$.
- **3.5 Lightning** — `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4` / `-DSpark` / `-DFlash` / `-BF16` / `-Base-BF16`; catalog `nemotron-3.5-lightning-30b-a3b`. Licensed **OpenMDW-1.1**, unlike its siblings. Cost tier: $.
- **Reward and teacher models** — `nvidia/Qwen3-Nemotron-235B-A22B-GenRM`, `-GenRM-2603`, and five `nvidia/NVIDIA-Nemotron-Labs-Teacher-*` repos. Evaluation and distillation components, not serving models.

### Re-evaluate when

- Changing the serving stack or its version (vLLM, SGLang, TensorRT-LLM, Ollama, llama.cpp) — parser flags and cache-dtype requirements are version-coupled.
- Moving between the hosted catalog, a NIM container, and raw weights, since the model ID and the residency posture change with it.
- Enabling thinking, changing a reasoning budget, or switching to the `super_v3` parser plugin.
- Adopting `guided_json` / `guided_grammar`, which binds the harness to an NVIDIA-specific extension.
- Adding Nano Omni or any of the separate ASR/OCR/parse/embed models — each is a new modality hop to audit.
- Extending context past the per-model native 256K.
- Any change to the license on a repo in use, given three different licenses across the family.
- NVIDIA publishing a deprecation policy for the Nemotron LLM line, which currently does not exist.

### Primary sources

- [NVIDIA Nemotron](https://developer.nvidia.com/nemotron)
- [NVIDIA API catalog — models](https://build.nvidia.com/models)
- [Nemotron 3 Super 120B](https://build.nvidia.com/nvidia/nemotron-3-super-120b-a12b)
- [Nemotron v3 collection](https://huggingface.co/collections/nvidia/nvidia-nemotron-v3)
- [Nemotron 3 Super 120B FP8 model card](https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-FP8)
- [Nemotron 3 Nano 30B BF16 model card](https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16)
- [Nemotron 3 Nano Omni model card](https://huggingface.co/nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-BF16)
- [Nemotron 3.5 Lightning NVFP4 model card](https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4)
- [NIM day-0 guide: Nemotron 3 Ultra](https://docs.nvidia.com/nim/large-language-models/2.0.6/day-0/get-started-nemotron-3-ultra.html)
- [NIM LLM API reference](https://docs.nvidia.com/nim/large-language-models/latest/reference/api-reference.html)
- [NIM structured generation](https://docs.nvidia.com/nim/large-language-models/1.13.0/structured-generation.html)
- [Nemotron 3 Super advanced deployment guide](https://docs.nvidia.com/nemotron/latest/usage-cookbook/Nemotron-3-Super/AdvancedDeploymentGuide/README.html)
- [Nemotron 3 Super open scaffolding resources](https://docs.nvidia.com/nemotron/latest/usage-cookbook/Nemotron-3-Super/OpenScaffoldingResources/README.html)
- [NVIDIA AI Enterprise EOL notices](https://docs.nvidia.com/ai-enterprise/lifecycle/latest/eol-notices.html)

### Sourcing gap carried forward

- **Parallel tool-call support and tool-call ID semantics are not publicly documented as of 2026-09-08.**
- **Whether reasoning traces must be replayed across turns is not publicly documented as of 2026-09-08.**
- **MCP support is not documented** on any Nemotron or NIM page reached — do not assert it.
- **Prompt caching is not publicly documented as of 2026-09-08** (only the `--kv-cache-dtype fp8` serving flag).
- **Data residency for `integrate.api.nvidia.com` is not publicly documented as of 2026-09-08.**
- **No deprecation policy exists for the Nemotron LLM line**, so profile age is the only staleness signal available.
- Context figures conflict between NVIDIA-owned pages (1M on the family/build pages, 256K native in the NIM day-0 guide and HF configs). Both are NVIDIA-owned; check the deployed repo's config.
- **The Mamba-2 SSM cache dtype conflicts between NVIDIA-owned pages for NVFP4 checkpoints.** The Super advanced deployment guide's general guidance and its latency-optimized Config A say `float32` for all checkpoint precisions; the NIM day-0 Ultra guide's "Additional Settings for NVFP4 Checkpoints" section and the Super guide's own throughput-optimized Config B instead say `float16` with `--enable-mamba-cache-stochastic-rounding`. Both are NVIDIA-owned; check which profile/config you are deploying before picking a dtype, rather than defaulting to float32 unconditionally.
- Pages that returned an empty body and could not be read: the nightly Ultra-Base cookbook README, the `latest` NIM function-calling page, and the `latest` NIM structured-generation page (the pinned `1.13.0` URL is cited instead). The Ultra NVFP4 model card exceeded the fetch size limit.
