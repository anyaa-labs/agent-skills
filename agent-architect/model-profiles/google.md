---
family: google
access: open-weight
scope: global
researched_date: 2026-09-08
---

# Gemini (Google)

### API surface

- **The Interactions API went GA on 2026-06-22 and is now the primary, documentation-default interface for Gemini models and agents, superseding `generateContent`.** `generateContent` remains supported but is now legacy, and Google states that new long-running agent capabilities will increasingly ship on Interactions only. Interactions also carries Flex/Priority service tiers and the Managed Agents surface. A system still targeting `generateContent` is not broken — but it is on the legacy surface, and the gap widens with each release.
- Use `generateContent` for stable existing integrations.
- **Google states that "all new models, multimodal capabilities, tools, and agentic features will launch on the Interactions API."** It differs from `generateContent` by managing conversation state server-side, exposing observable typed execution steps (`function_call`, `function_result`, `model_output`, `thought`, `user_input`), and supporting background execution (`background=true`). `previous_interaction_id` links turns for server-side history retrieval; `store` defaults to `true`. `tools`, `system_instruction`, and `generation_config` are interaction-scoped and must be re-specified when running stateless.
- Google's enterprise agent surface appears to have been renamed from "Vertex AI" to **"Gemini Enterprise Agent Platform"** (Anthropic's own docs independently refer to "Google Cloud's Agent Platform" for the same surface). A managed-agent product, `antigravity-preview-05-2026`, is documented as running code, managing files, and browsing the web — Google's equivalent of a hosted agent runtime, currently in preview.

### Reasoning state

- Thinking budgets and thought-signature/state behavior are part of the runtime contract. **Thought signatures on Gemini 3-series models are handled automatically by the SDKs; hand-rolled HTTP clients must manage them manually** — the automatic-handling guarantee is SDK-scoped, not protocol-scoped.
- **Stateless mode (`store=false`) disables background execution and `previous_interaction_id`, and requires you to resend the full history including every model-generated `thought` and `function_call` step exactly as received.** Omitting or reformatting them breaks subsequent turns — this is the Gemini analogue of Anthropic's thinking-block preservation and OpenAI's reasoning-item replay.
- On `gemini-3.8-flash`, thinking is supported at `low` / `medium` / `high`; `minimal` is not supported.
- As of the 2026-07-21 changelog, `temperature`, `top_p`, and `top_k` are **deprecated** on Gemini — the same move Anthropic made on Opus 4.7+. Two of the three frontier providers profiled here have now removed sampling knobs from the agent-tuning surface.

### Tool semantics

- The model returns `function_call` steps with `type`, `name`, `arguments`, and an **`id`**. The `function_result` step you send back requires `name`, `call_id` (echoing that id), and `result` — manually constructed history that drops or mismatches `call_id` breaks.
- Modes: `auto` (default), `any`, `none`, and `validated` (schema adherence enforced). Parallel calling via `generation_config: {"tool_choice": "any"}`; compositional/sequential chaining happens across turns via `previous_interaction_id`.
- Gemini supports combined built-in tools and custom function calling on newer APIs; verify exact model/API support before designing a mixed tool call.

### Modality support

- Gemini models cover text, image, audio, video, and long-context multimodal workflows depending on model ID. `gemini-3.8-flash` specifically documents text, image, video, audio, and PDF input with text-only output.
- **Agentic video understanding** (shipped 2026-09-01) replaces fixed frame-sampling as the default architecture for supported Flash models: they dynamically request transcripts and frames on demand instead of ingesting a pre-sampled set, which Google reports reduces token usage by up to 88% for long-form video. This is just-in-time retrieval applied to a modality — the multimodal analogue of tool search, and it changes the harness question from "how many frames do I sample" to "does the model's on-demand retrieval actually reach the frame I need."
- **Embodied reasoning (Gemini Robotics ER 2, `gemini-robotics-er-2-preview`)** is a distinct modality with its own harness implications: the model's action space is a physical robot, not a sandboxed tool call. Failure modes are not recoverable by retry the way a failed API call is — a bad action can move a physical actuator into an unsafe state before any validation step runs. Any harness wrapping ER 2 needs pre-action safety bounds and human/hardware-level interlocks, not just post-hoc output validation. The prior generation, `gemini-robotics-er-1.6-preview`, is retired (see below).
- Gemini Live supports low-latency realtime voice and vision interactions, tool use, transcripts, barge-in, and live translation, with feature differences by model. **The Live API is a separate model line from the newest Flash models** — `gemini-3.8-flash` does not support Live; Live runs on `gemini-3.1-flash-live-preview` and `gemini-2.5-flash-native-audio-preview-12-2025` instead. This is a real architectural constraint: you cannot pair the newest, most capable Flash model with realtime voice today.
- Gemini computer use (`gemini-2.5-computer-use-preview-10-2025`) returns normalized screen coordinates and can emit multiple UI actions in one turn. The harness must execute actions and verify resulting screen state.

### Context behavior

- Gemini can handle very large raw context, but long context still needs context-selection evals.
- **The models index page does not state per-model context windows, output limits, or knowledge cutoffs — those live only on each model's own page** (`ai.google.dev/gemini-api/docs/models/<model-id>`), and the URL pattern is not uniform (a preview model's page can 404 even when the model is listed elsewhere). Do not write a context-window number for a Gemini model without fetching its own page first. Verified so far: `gemini-3.8-flash` — 1,048,576 input tokens, 65,536 output tokens.
- Media resolution and transcript budgets remain architecture decisions for non-agentic-video modalities; for agentic video on supported Flash models, frame/transcript retrieval is now dynamic rather than a fixed sampling configuration (see Modality support).

### Structured output path

- Use `response_schema`, structured output modes, or validated function-call schemas.
- Preserve function-call IDs and responses exactly when manually constructing history.

### Deployment & residency

- The Gemini API and Google AI Studio are available in roughly 195 countries and territories, but **that page documents geographic access eligibility only — it makes no data-residency commitment.** Users outside the supported territories are directed to the Gemini Enterprise Agent Platform instead.
- **No Google-owned page documenting Gemini data-residency or processing-location guarantees was reachable as of 2026-09-08** — `cloud.google.com/vertex-ai/generative-ai/docs/data-residency` redirects to a 404, and the Agent Platform's locations page returns a navigation index with no residency content. Treat Gemini residency as **not verified**; do not assert a regional-processing guarantee for any Gemini surface.
- The Gemini API terms distinguish **Unpaid Services** (Google may use submitted content to "provide, improve, and develop Google products and services," and "human reviewers may read, annotate, and process your API input and output" — the terms instruct: "Do not submit sensitive, confidential, or personal information to the Unpaid Services") from **Paid Services** (prompts/responses are not used to improve Google's products; processing follows the Data Processing Addendum for Products Where Google is a Data Processor; logs retained only briefly to detect Prohibited Use Policy violations).
- **On paid services, the terms state data "may be stored transiently or cached in any country in which Google or its agents maintain facilities."** For a sovereignty/residency audit, this is the operative fact on the Gemini Developer API — there is no geographic confinement commitment on this surface, paid or unpaid.
- Users in the EEA, Switzerland, or the UK receive paid-service protections even when the service is offered free of charge.
- Interaction data retention was reported as 55 days for paid projects and 1 day for free accounts on the Interactions overview — single-sourced; re-verify before quoting the number in a customer-facing report.

### Version-specific notes

- **Gemini 3.8 Flash** (`gemini-3.8-flash`): "Most intelligent Flash model, engineered for long-horizon software engineering" — Google's own framing. The current best-documented model in the family (see Context behavior). Cost tier: $$$.
- **Gemini 3.7 / 3.6 / 3.5 Flash**: General agentic and multimodal workloads at decreasing cost/capability; 3.7 targets complex coding and agentic workflows, 3.6 targets speed plus multimodal breadth, 3.5 targets routine high-throughput work. Cost tier: $$–$$$.
- **Gemini 3.5 Flash-Lite / 3.1 Flash-Lite**: Fastest, most cost-effective models in the stable lineup; 3.1 Flash-Lite is framed as frontier-class performance at reduced cost. Cost tier: $.
- **Note the shape of the Gemini 3 series lineup as of 2026-09-08: the stable tier is Flash-only.** The Pro tier (`gemini-3.1-pro-preview`) is in **preview**, not GA, and `gemini-3-pro-preview` has been shut down entirely. Do not assume a GA "Gemini 3 Pro" exists — an audit finding that assumes Pro-tier availability in the 3.x line should flag this as unverified/preview-only. This scoping is specific to Gemini 3: the prior generation's `gemini-2.5-pro` is still listed as stable (see Legacy Gemini 2.5 below) — do not extend the "no stable Pro" claim across generations.
- **Gemini Live models** (`gemini-3.1-flash-live-preview`, `gemini-2.5-flash-native-audio-preview-12-2025`, plus `gemini-3.1-flash-tts-preview`, `gemini-3.5-live-translate-preview`): Realtime voice/vision runtime, separate from the newest Flash line. Evaluate latency, barge-in, synchronous tool calls, transcript drift, and modality fallback.
- **Gemini computer-use models** (`gemini-2.5-computer-use-preview-10-2025`): Browser/screen action runtime. Require post-action visual validation and high-risk action approvals.
- **Gemini Robotics ER 2** (`gemini-robotics-er-2-preview`): Embodied reasoning / physical action space — see Modality support for the retry-safety implication. Its predecessor, ER 1.6, is retired.
- **Managed agent (preview)**: `antigravity-preview-05-2026` — runs code, manages files, and browses the web as a hosted agent on the Agent Platform. Preview status; do not treat as a GA harness option yet.
- **Legacy but still listed — Gemini 2.5**: `gemini-2.5-pro`, `gemini-2.5-flash`, `gemini-2.5-flash-lite`, `gemini-2.5-flash-native-audio-preview-12-2025`, `gemini-2.5-flash-preview-tts`, `gemini-2.5-pro-preview-tts`, and `gemini-2.5-computer-use-preview-10-2025` are still listed in the current models set as of 2026-09-08 — they do not appear in the Retired table below. `gemini-2.5-pro` in particular is the one still-stable Pro-tier model in the lineup, spanning the Gemini 3 series' Flash-only gap. Useful for cost/eval continuity on workloads not yet migrated to Gemini 3.x, but confirm current status against the models index before depending on it long-term, since Google has not published a 2.5-generation retirement date in this brief.

### Known production failure modes

- Thought signature or function-call `call_id` not preserved when manually constructing history in stateless mode.
- Long context used as a substitute for relevance selection.
- Computer-use actions continue after visual state diverges.
- Live tool calls lack timing and timeout policy.
- A harness pairs the newest Flash model with an assumed realtime/Live capability that only the separate Live model line actually supports.
- An embodied (Robotics ER) deployment relies on retry-after-failure logic borrowed from a text/tool-call harness, where a failed action already changed physical state.
- A system stays on `generateContent` on the assumption it is still the default surface — it has been the legacy one since the Interactions API went GA on 2026-06-22.
- A residency requirement is treated as satisfied because Gemini is "available" in a region, when the Gemini API terms make no processing-location commitment at all.

### Harness requirements

- Preserve tool IDs (`call_id`) and provider-required state (`thought` steps) across turns, especially in stateless (`store=false`) mode.
- Configure thinking level, media resolution, and frame/transcript budgets explicitly; for agentic-video-eligible Flash models, verify whether dynamic retrieval actually reaches the needed frame rather than assuming full coverage.
- Validate screen state after computer-use actions.
- Treat media as untrusted instructions.
- For an embodied (Robotics ER) integration, build pre-action safety bounds and hardware-level interlocks — do not rely on post-hoc validation or retry.
- Confirm whether a workload needs Pro-tier reasoning before assuming it is GA; today it means using a preview model (`gemini-3.1-pro-preview`) with the availability caveats that implies.

### Retired / migration targets

| Retired model | Status | Recommended replacement |
| --- | --- | --- |
| `gemini-2.0-flash`, `gemini-2.0-flash-lite` | Shut down 2026-06-01 | `gemini-3.5-flash` / `gemini-3.5-flash-lite` |
| `gemini-3-pro-preview` | Shut down | `gemini-3.1-pro-preview` (preview-only; no GA Pro model as of 2026-09-08) |
| `gemini-3.1-flash-lite-preview` | Shut down | `gemini-3.5-flash-lite` or `gemini-3.1-flash-lite` |
| `imagen-4.0-generate` (Imagen 4) and Gemini 3 Image models | Deprecated; shut down 2026-08-17 (announced 2026-06-15) | `gemini-3.1-flash-image` (Nano Banana 2) / `gemini-3-pro-image` (Nano Banana Pro) |
| Veo models (pre-3.1) | Shut down 2026-06-30 (announced 2026-06-15) | `veo-3.1-generate-preview` / `veo-3.1-lite-generate-preview` |
| `gemini-robotics-er-1.6-preview` | Shut down 2026-08-31 (announced 2026-07-30) | `gemini-robotics-er-2-preview` |
| `gemini-omni-flash-preview` | Deprecation **scheduled** for 2026-09-30, not yet in effect as of 2026-09-08 (announced 2026-08-27); no shutdown date published | `gemini-omni-1.1-flash` |
| Interactions API pre-2026-05-26 schema (`outputs` field, old `response_format`) | Legacy schema removed 2026-06-08 (new schema default since 2026-05-26, announced 2026-05-06) | Current Interactions API schema (`steps` field) |

`gemini-omni-flash-preview` does not appear in this brief's own Retired table for Google. Its row above was therefore verified directly, on 2026-09-08, against the [Gemini API changelog](https://ai.google.dev/gemini-api/docs/changelog) — a page the brief itself names among Google's primary sources. The 2026-08-27 entry states that the existing `gemini-omni-flash-preview` endpoint "will be deprecated on September 30, 2026", and introduces `gemini-omni-1.1-flash` as its GA successor. Two things follow, and both differ from the rest of this table: Google publishes **no shutdown date** for this endpoint, so the Status column here records the deprecation date rather than a shutdown date; and the deprecation is a **future** event as of 2026-09-08, not one that has already taken effect. Do not report a `gemini-omni-flash-preview` integration as already deprecated before that date.

### Re-evaluate when

- Moving from `generateContent` to the Interactions API.
- Moving to a newer Gemini 3.x Flash generation, or evaluating whether Pro-tier preview is ready for production.
- Adding Live API, computer use, Robotics ER, agentic video, or the Antigravity managed-agent preview.
- A residency or sovereignty requirement is introduced — Gemini's terms currently commit to no processing-location guarantee.

### Open-weight: Gemma

Folded into this profile as an open-weight subsection rather than a separate family file, per the design's scope decision. **This subsection is thin — no dedicated Google-owned Gemma family page was reached in the research pass; the only sightings are incidental, inside other vendors' model cards.**

- **Gemma 4 (31B, text + image)** appears in Sarvam AI's re-served open-weight model list (alongside GLM-5.2 and DeepSeek V4 Flash) as a Beta offering explicitly **not tuned for Indian languages** — a third-party redistribution note, not a Google-owned spec.
- **`google/gemma-4-E2B-it`** is named as the base model for AI Singapore's `aisingapore/Gemma-SEA-LION-v4.5-E2B-IT` fine-tune. Per that downstream model card: 128K context, and modality support described as text, image (variable aspect ratio/resolution), video, and audio.
- **Do not assert Gemma's own context window, license terms, tool-calling support, structured-output path, deployment stacks, or retirement policy from this brief** — none of those were verified against a Google-owned Gemma page as of 2026-09-08. If a Gemma model ID shows up in an audit, flag the family as under-researched rather than applying Gemini's runtime contract to it; Gemma is a separate, open-weight release line with no confirmed shared API surface with hosted Gemini.

### Primary sources

- [Gemini models](https://ai.google.dev/gemini-api/docs/models)
- [Gemini API changelog](https://ai.google.dev/gemini-api/docs/changelog)
- [Gemini function calling](https://ai.google.dev/gemini-api/docs/function-calling)
- [Interactions API overview](https://ai.google.dev/gemini-api/docs/interactions/interactions-overview)
- [Interactions API GA announcement](https://blog.google/innovation-and-ai/technology/developers-tools/interactions-api-general-availability/)
- [Live API](https://ai.google.dev/gemini-api/docs/live-api)
- [Available regions](https://ai.google.dev/gemini-api/docs/available-regions)
- [Gemini API additional terms of service](https://ai.google.dev/gemini-api/terms)
- [Gemini 3.8 Flash model page](https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash)

### Sourcing gap carried forward

Per-model context windows, output limits, and knowledge cutoffs are only on individual model pages, not the models index; only `gemini-3.8-flash`'s page was fetched in the research pass — do not extrapolate its numbers to other Gemini models. No Google-owned residency/data-processing-location guarantee page was reachable. Interaction data retention (55 days paid / 1 day free) is single-sourced and unverified. The Live API overview does not name which model IDs support it beyond the two called out above, nor session-duration limits or session-resumption behavior. Gemma's own runtime contract (context, license, tool calling, deployment, retirement) is not documented anywhere in this brief beyond the two incidental third-party sightings above — treat it as a standing research gap, not a family profile.
