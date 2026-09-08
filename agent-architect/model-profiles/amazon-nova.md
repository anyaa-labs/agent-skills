---
family: amazon-nova
tier: frontier
researched_date: 2026-09-08
---

# Nova (Amazon)

**Detection note.** Nova is Bedrock-native and closed-weight. It appears in code as a Bedrock model ID (`amazon.nova-*`, or a cross-region form like `us.amazon.nova-2-lite-v1:0` / `global.amazon.nova-2-lite-v1:0`), inside a `boto3` `bedrock-runtime` client — **not** as a vendor SDK import. Grep for `nova`, `bedrock-runtime`, and `converse`, not for an Amazon SDK package.

### API surface

- Bedrock exposes five inference patterns across two endpoints: `bedrock-runtime.{region}.amazonaws.com` (Converse, Invoke, Responses, Chat Completions, Messages) and `bedrock-mantle.{region}.amazonaws.com` (Responses, Chat Completions, Messages). AWS recommends `bedrock-runtime` for new applications, and positions the mantle Responses API "for agentic applications that require built-in server-side tool use (search, code interpreter), multimodal inputs, and asynchronous inference," noting that on `bedrock-runtime` "requests are always synchronous and server-side tools are not available."
- **The decisive Nova fact: every Nova model card marks Responses `no`, Chat Completions `no`, and `bedrock-mantle` `no`.** Nova 2 Lite is Invoke + Converse on `bedrock-runtime` only. Nova 2 Sonic is `InvokeModelWithBidirectionalStream` only (Converse: no). Multimodal Embeddings is `StartAsyncInvoke` only.
- **There is therefore no OpenAI-compatible path to Nova, and no access to the Responses API that AWS itself recommends for agentic work.** A harness abstracted over an OpenAI-shaped client cannot reach Nova without a Bedrock-native adapter. Treat "we'll swap in Nova behind the same client" as a false assumption until an adapter exists.
- **Converse is the agentic surface.** Everything below — tools, extended thinking, structured output — is expressed through Converse request fields.

### Reasoning state

- Nova 2 Lite has extended thinking, **off by default**, enabled through `additionalModelRequestFields`: `"reasoningConfig": {"type": "enabled", "maxReasoningEffort": "low"}`. `type` is `"enabled"`/`"disabled"`; `maxReasoningEffort` is `"low"`/`"medium"`/`"high"`.
- AWS's own agent guidance: "Medium effort is optimal for agentic workflows that coordinate multiple tools and require the model to maintain context across several sequential operations."
- **Reasoning content comes back as `[REDACTED]`.** AWS: "With Amazon Nova 2, reasoning content displays as `[REDACTED]`. You're still charged for reasoning tokens... We include this field in the response structure now to preserve the option of exposing reasoning content in the future." **Reasoning tokens roll into `outputTokens` with no separate counter** — a reasoning-cost line item cannot be broken out from output cost.
- **Sampling and length parameters must be unset with `maxReasoningEffort: "high"` — and AWS states the rule twice, with two different lists.** The *Quick start* note reads: "Temperature, topP and topK cannot be used with `maxReasoningEffort` set to `high`. Using these parameters together causes an error." The *Configuration options* note reads: "when using `"high"`, temp, topP, and maxToken must be unset." `topK` appears only in the first list; **`maxTokens` only in the second**. Audit against the **union** — `temperature`, `topP`, `topK` *and* `maxTokens` all unset — because the page offers no basis for preferring one note over the other, and the second is corroborated by the output-length sentence that immediately follows it.
- At high effort, output "may generate output that exceeds 65k tokens... for some problems we have see it go up to 128K tokens" — budget for it.
- Extended thinking is available on **`us.amazon.nova-2-lite-v1:0` only**. Do not assume it on other Nova IDs.
- **Gap:** whether `reasoningContent` blocks must be replayed across turns is **not publicly documented as of 2026-09-08**. AWS's tool-use example appends the whole assistant message (carrying the block along) but states no rule. The safe default is to replay it, since that is what AWS's own sample does.

### Tool semantics

- Converse `toolConfig` carries `tools[].toolSpec` with `name`, `description`, and `inputSchema.json` (a JSON Schema).
- `toolChoice` has three forms: **Tool** (named — "will be called once, ideal for structured output use cases"), **Any** (at least one tool called), and **Auto** (default — "the model decides whether to call a tool and how many tools to call").
- Calls arrive as `toolUse` blocks with `stopReason: "tool_use"`, carrying `name`, `input`, `toolUseId`. Results go back as a **user-role** `toolResult` block with the matching `toolUseId`, `content` (`{"json": ...}`, text, or images), and `status` of `"success"`/`"error"`. **The user-role placement of tool results is a porting hazard** for harnesses that assume a dedicated tool role.
- AWS's schema guidance is unusually prescriptive and worth following: "Limit JSON schemas to two layers of nesting for best performance"; "Place long string arguments last in the schema and avoid nesting them"; avoid semantically similar tools.
- **Server-side tools (Nova 2 only), via `tools[].systemTool`:**
  - **`nova_code_interpreter`** — sandboxed Python returning `{"stdOut", "stdErr", "exitCode", "isError"}`. Region-limited: "available in the IAD, PDX, and NRT AWS Regions. To ensure your requests are routed to a supported Region, use Global CRIS." Operational trap: "When using Bedrock API keys, you'll need to manually add `InvokeTool` permissions to the policy definitions. **The default Bedrock role does not allow the `InvokeTool` action.**"
  - **`nova_grounding`** — web grounding.
- **MCP is a client-bridge pattern, not a request field.** AWS documents running an MCP server and letting "Amazon Nova discover its tools automatically through a client bridge," naming Strands' `MCPClient` as the convenience path; the launch post says Nova 2 models "support remote MCP tools." **There is no native MCP field in the Converse request** — the bridge is your code, and so is its trust boundary.
- **Gap:** explicit parallel-tool-call semantics are **not publicly documented as of 2026-09-08**. The Auto description implies multiple calls per turn; AWS never uses the term.

### Modality support

- **Nova 2 Lite: text, image, and video input; text output.** Audio and speech: no. Console limits: images JPEG/PNG/GIF/WEBP ≤ 25 MB; documents CSV/DOC/DOCX/HTML/MD/PDF/TXT/XLS/XLSX ≤ 4.5 MB; one video MKV/MOV/MP4 ≤ 25 MB, or up to 1 GB via S3.
- **Nova 2 Sonic: speech + text in, speech + text out**, realtime via `InvokeModelWithBidirectionalStream` (Converse not supported), seven languages, with "asynchronous tool use." When Discovery detects Nova Sonic, the Multimodal Architecture dimension applies.
- **Nova Multimodal Embeddings**: text, image, video and audio in; embedding out; `StartAsyncInvoke` only.
- **Generated media is Nova 1 only and is ending.** Nova Canvas (image) and Nova Reel (video) are both **Legacy with EOL 2026-09-30, and no Nova 2 replacement exists**. A system that generates images or video through Nova has no forward path inside the family — that is an architecture finding, not a version bump.

### Context behavior

- 1M on Nova 2 (Lite, Sonic) and Nova Premier; 300K on Nova Pro and Nova Lite; 128K on Nova Micro.
- The Nova 2 user guide says Nova 2 models "can generate up to 65,536 tokens in a single response," while the model cards say 64K max output. Both are AWS-owned; the discrepancy is recorded, not resolved. Nova Premier's card says 25K, Pro/Lite/Micro 5K — while the Nova 1 user guide spec table says 10K for all four. **Do not treat any single Nova max-output number as authoritative without checking the specific card.**
- **Prompt caching has a hard ceiling that dominates the context story: "Amazon Nova models support a maximum of 20K tokens for prompt caching. Prompt caching is primarily for text prompts."** Explicit caching takes a 1K-token minimum per checkpoint, at most 4 checkpoints per request, and a **5-minute TTL**. Nova 2 Lite and Nova Pro also list implicit caching. **A 20K cache cap against a 1M window means a long agent context is re-billed in full on nearly every turn** — the cost model of a long-running Nova agent is fundamentally different from one on a provider with full-prefix caching.
- Documented degradation, verbatim: "Amazon Nova Premier has a supported context length of 1 million tokens, which translates to 1M tokens of text, 500 images, or 90 minutes of video... It's performance can decline slightly as the context size increases." AWS's mitigations: long inputs first, instructions last, `[Document Start]`/`[Document End]` markers, citation-grounded responses. This guidance is written for Nova Premier; **the equivalent for Nova 2 Lite at 1M does not exist**.
- **Nova 2 Lite does not support "Count tokens"** — pre-dispatch token accounting is unavailable, so a context-budget guard must estimate rather than measure.
- **Gap:** overflow/truncation semantics are **not publicly documented as of 2026-09-08**.

### Structured output path

- Bedrock's named **"Structured outputs" feature is marked Not Supported on every Nova card** checked (Nova 2 Lite, Premier, Pro, Lite, Micro).
- Nova's documented path is **constrained decoding through forced tool choice**: "Amazon Nova models leverage constrained decoding to ensure high reliability in generated outputs. This technique uses grammar to constrain possible tokens at each generation step, preventing invalid keys and enforcing correct data types based on your defined schema." Define a tool whose `inputSchema` is the target schema, then set `"toolChoice": {"tool": {"name": "..."}}`.
- **Grammar-constrained JSON is genuinely available — but only through the tool-call channel, never a `response_format` field.** A harness that treats "structured output" and "tool calling" as separate subsystems will conclude Nova has no structured output; it has one, wearing a tool's clothes.

### Deployment & residency

- **No self-hosting.** Nova is Bedrock-only and closed-weight; licensing is the Bedrock third-party model EULA linked on each card. There are no weights, no vLLM path, and no on-prem option.
- **Nova 2 Lite has no in-region availability anywhere — it is cross-region-inference only.** US geo (us-east-1/2, us-west-1/2, ca-central-1, ca-west-1), EU geo (Frankfurt, Stockholm, Milan, Spain, Ireland, Paris), JP geo (Tokyo, Osaka), plus `global.` across roughly 26 regions. AWS: "If you are accessing the model from a US region, you must use the US CRIS endpoint which involves adding the `us` prefix." London, Seoul, Mumbai, Singapore, Sydney, Taipei, Tel Aviv and the UAE are **global-only**. **For a strict data-residency obligation this is the headline constraint: there is no single-region Nova 2 Lite deployment, so a "data stays in region X" claim cannot be satisfied by Nova 2 Lite at all.**
- Nova 2 Sonic is the inverse: in-region only (us-east-1, us-west-2, eu-north-1, ap-northeast-1), no geo or global CRIS. Multimodal Embeddings: us-east-1 and us-gov-west-1. Nova Pro/Lite/Micro include GovCloud (us-gov-west-1) in-region.
- Service tiers: Nova 2 Lite supports Standard, Priority and Flex (`"service_tier"`); Reserved is not supported. Nova 2 Sonic, Lite, Micro and Multimodal Embeddings are Standard-only.
- **Bedrock data retention is a configurable, SCP-enforceable control.** Modes: `none`, `default`, `aws_review`, legacy `provider_data_share`, `inherit`, ordered `none < default < aws_review < provider_data_share`; set per account (`PUT /v1/data_retention`) or per project; "enforced consistently across the Messages, Chat Completions, and Responses APIs." Under `none`, "No request or response data is written to durable storage by AWS or shared with the model provider"; otherwise prompts and completions are retained "within the AWS boundary for up to 30 days." Enforceable via the `bedrock-mantle:DataRetentionMode` condition key. AWS states model providers "don't have access to Amazon Bedrock logs or to customer prompts and completions."
- **Caveat specific to Nova: Nova is not on the Messages / Chat Completions / Responses surfaces, so that retention API's semantics do not describe Nova traffic**, and Nova's own per-model `allowed_modes` value is **not publicly documented as of 2026-09-08**. Verify retention posture for Nova traffic directly rather than inheriting it from the Bedrock retention page's worked examples, which are all Claude models.

### Known production failure modes

- **An abstraction layer that assumes OpenAI-shaped access to every Bedrock model.** Nova supports neither Responses nor Chat Completions nor the mantle endpoint; a "just change the model ID" swap silently has no valid code path.
- **Extended thinking assumed on rather than enabled.** It is off by default and available only on `us.amazon.nova-2-lite-v1:0`; a harness expecting reasoning gets none, with no error.
- **Sampling or length parameters set alongside `maxReasoningEffort: "high"`**, which errors. `maxTokens` is the one most harnesses trip on: nearly every client sets it unconditionally, and it appears in only one of AWS's two conflicting notes — so a harness built from the other note reads as correct and still fails at runtime.
- **A reasoning-cost line item that cannot be produced**, because reasoning tokens are folded into `outputTokens` — and a reasoning-trace inspection feature that cannot work, because content is `[REDACTED]`.
- **Long-context cost modelled on full-prefix caching.** The 20K cache cap and 5-minute TTL mean a long agent loop re-pays for its context almost every turn.
- **A context-budget guard built on token counting** on Nova 2 Lite, which does not support "Count tokens."
- **`nova_code_interpreter` wired up with the default Bedrock role**, which lacks the `InvokeTool` permission — and pinned to a region where it is unavailable (only IAD, PDX, NRT).
- **A residency claim that Nova 2 Lite cannot satisfy**, because it has no in-region deployment — only geo or global cross-region inference.
- **An MCP client bridge treated as a vendor-managed boundary.** The bridge is your code; its trust boundary and tool loadout are your responsibility.
- **Image or video generation built on Nova Canvas / Nova Reel**, both Legacy with EOL 2026-09-30 and **no successor in the family**.
- **A Legacy Nova model left in place on the assumption AWS will migrate it.** AWS: "Migration will not happen automatically," and after EOL "requests made to this version will fail." Existing customers "may lose access to Legacy models after 15 days of inactivity," and new Provisioned Throughput and fine-tuning jobs are already blocked.

### Harness requirements

- Write a **Bedrock-native adapter** for Nova (Converse for text/vision, `InvokeModelWithBidirectionalStream` for Sonic); do not route it through an OpenAI-compatible client layer.
- Enable extended thinking explicitly via `additionalModelRequestFields`, and confirm the model ID actually supports it.
- Never set `temperature`/`topP`/`topK`/`maxTokens` together with `maxReasoningEffort: "high"` — the union of AWS's two inconsistent notes. Dropping `maxTokens` is independently necessary: high effort "may generate output that exceeds 65k tokens... up to 128K tokens", so any cap the harness was relying on would truncate the answer.
- Replay the full assistant message (including any `reasoningContent` block) on tool-result round-trips — AWS's own example does, and the rule is undocumented.
- Return tool results as **user-role `toolResult` blocks** with the matching `toolUseId` and an explicit `status`.
- Keep tool schemas to **two levels of nesting**, with long string arguments last.
- Budget for the **20K prompt-cache ceiling and 5-minute TTL** in the cost model; do not assume prefix caching scales with the window.
- Grant `InvokeTool` explicitly and pin `nova_code_interpreter` traffic to Global CRIS so it lands in a supported region.
- For structured output, use a **forced named tool whose `inputSchema` is the target schema** — there is no `response_format`.
- Treat the MCP client bridge as an in-scope trust boundary, with its own tool loadout discipline.
- For any residency obligation, verify Nova's cross-region-inference posture against the requirement **before** selecting it, and verify the retention mode for Nova traffic directly.

### Retired / migration targets

| Model | Model ID | Legacy | EOL | Replacement |
| --- | --- | --- | --- | --- |
| Nova Premier | `amazon.nova-premier-v1:0` | 2026-03-13 | 2026-09-14 | **none named by AWS** |
| Nova Sonic | `amazon.nova-sonic-v1:0` | 2026-03-13 | 2026-09-14 | **none named**; Nova 2 Sonic is inferable but never stated as a mapping |
| Nova Canvas | `amazon.nova-canvas-v1:0` | 2026-03-30 | 2026-09-30 | **none — no Nova 2 image model exists** |
| Nova Reel | `amazon.nova-reel-v1:0`, `amazon.nova-reel-v1:1` | 2026-03-30 | 2026-09-30 | **none — no Nova 2 video model exists** |

Lifecycle policy: at least 6 months in Legacy before EOL; new customers cannot use Legacy models and existing customers "may lose access to Legacy models after 15 days of inactivity"; after ≥3 months in Legacy the model enters public extended access where "you should expect higher pricing"; at EOL "requests made to this version will fail" and "Migration will not happen automatically." New Provisioned Throughput and new fine-tuning jobs are blocked once a model is Legacy.

**AWS publishes dates without replacements.** Unlike providers that name a successor per retired ID, the Bedrock lifecycle table gives only dates plus generic guidance to move to "an Active model." Choosing the replacement is the customer's design decision — and for image and video generation there is no in-family option to choose.

Note also that Nova Pro / Lite / Micro carry EOL fields reading "No sooner than 12/4/2025" — a date already past while the models remain Active. **Treat those as stale placeholders, not commitments.**

### Version-specific notes

- **Nova 2 Lite** (`amazon.nova-2-lite-v1:0`; geo `us.`/`eu.`/`jp.`; `global.`) — 1M context, 64K output, text/image/video in, text out, extended thinking on the `us.` ID, Standard/Priority/Flex tiers, no in-region deployment. The current general-purpose Nova. Cost tier: $$.
- **Nova 2 Sonic** (`amazon.nova-2-sonic-v1:0`) — speech-to-speech realtime, bidirectional stream only, in-region only in four regions, seven languages, asynchronous tool use. Cost tier: $$.
- **Nova Multimodal Embeddings** (`amazon.nova-2-multimodal-embeddings-v1:0`) — text/image/video/audio in, embedding out, `StartAsyncInvoke` only, us-east-1 and us-gov-west-1.
- **Nova 2 Pro** — announced as the "most intelligent model for highly complex, multistep tasks" but **in preview, limited to Amazon Nova Forge customers, with no model card and no published model ID**. Do not design against it.
- **Nova Premier** (`amazon.nova-premier-v1:0`) — 1M context, **Legacy, EOL 2026-09-14**. Cost tier: $$$.
- **Nova Pro / Lite / Micro** (`amazon.nova-pro-v1:0`, `-lite-`, `-micro-`) — 300K / 300K / 128K, Active, GovCloud in-region. Cost tiers: $$ / $$ / $.

### Re-evaluate when

- Any Nova model in use enters Legacy, or an EOL date approaches — AWS names no replacement, so the migration is a design decision that needs lead time.
- Adopting extended thinking, or changing `maxReasoningEffort` (especially to `high`, which forbids sampling *and* length parameters — and which AWS documents inconsistently, so re-read both notes on the page).
- Adding `nova_code_interpreter` or `nova_grounding`, or standing up an MCP client bridge.
- Taking on a residency obligation, or changing regions — Nova's per-model geo/global/in-region posture varies sharply between models.
- Changing the Bedrock data-retention mode, or needing to assert one for Nova traffic specifically.
- Context growth that pushes the working prompt far past the 20K cache ceiling.
- Nova 2 Pro leaving preview, or any Nova 2 image/video generation model appearing.

### Primary sources

- [Bedrock model cards — Amazon](https://docs.aws.amazon.com/bedrock/latest/userguide/model-cards-amazon.html)
- [Model card: Nova 2 Lite](https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-amazon-nova-2-lite.html)
- [Model card: Nova 2 Sonic](https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-amazon-nova-2-sonic.html)
- [Model card: Nova Premier](https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-amazon-nova-premier.html)
- [Bedrock inference APIs](https://docs.aws.amazon.com/bedrock/latest/userguide/apis.html)
- [Bedrock model lifecycle](https://docs.aws.amazon.com/bedrock/latest/userguide/model-lifecycle.html)
- [Bedrock data retention](https://docs.aws.amazon.com/bedrock/latest/userguide/data-retention.html)
- [What is Amazon Nova 2](https://docs.aws.amazon.com/nova/latest/nova2-userguide/what-is-nova-2.html)
- [Nova 2 extended thinking](https://docs.aws.amazon.com/nova/latest/nova2-userguide/extended-thinking.html)
- [Nova 2 using tools](https://docs.aws.amazon.com/nova/latest/nova2-userguide/using-tools.html)
- [Nova 2 reasoning capabilities](https://docs.aws.amazon.com/nova/latest/nova2-userguide/reasoning-capabilities.html)
- [Nova long-context prompting](https://docs.aws.amazon.com/nova/latest/userguide/prompting-long-context.html)
- [Nova 2 launch announcement](https://aws.amazon.com/about-aws/whats-new/2025/12/nova-2-foundation-models-amazon-bedrock/)
- [Amazon Nova models](https://aws.amazon.com/nova/models/)

### Sourcing gap carried forward

- **Nova 2 Pro's API ID, context window, and output limit are not publicly documented as of 2026-09-08** (preview, Nova Forge only). Do not assert them.
- **Whether `reasoningContent` must be replayed across turns is not publicly documented as of 2026-09-08.**
- **Nova's per-model `allowed_modes` for Bedrock data retention is not publicly documented as of 2026-09-08.**
- **Context truncation / overflow semantics are not publicly documented as of 2026-09-08.**
- **Explicit parallel-tool-call semantics are not publicly documented as of 2026-09-08.**
- **Named replacements for the Legacy Nova models are not published** — dates only, and no Nova 2 image or video generation model exists at all.
- Max output tokens conflict between the Nova user guides and the Bedrock model cards; both are AWS-owned and the conflict is unresolved. Check the specific card.
- Long-context degradation guidance exists only for Nova Premier, not for Nova 2 Lite at 1M.
- `https://docs.aws.amazon.com/bedrock/latest/userguide/structured-outputs.html` returned a title-only shell on two attempts; the "Structured outputs: Not Supported" claim comes from the per-model cards instead.
