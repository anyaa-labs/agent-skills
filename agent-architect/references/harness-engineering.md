# Harness Engineering Reference

This reference supports `checklists/harness-architecture.md` and DESIGN mode when the user asks about long-running agents, agent runtimes, sandboxes, MCP-heavy tools, code execution, approvals, or production operations.

## Core Thesis

A production agent is the model plus the harness. The harness owns execution boundaries, state, context assembly, tool availability, approvals, observability, budget enforcement, and recovery. A model upgrade can improve planning or tool use, but it does not remove the need for explicit state ownership or execution containment.

## Runtime Boundary Patterns

- Direct model call: use when one model response plus simple tools is enough.
- SDK-owned orchestration: use when application code owns tool execution, handoffs, guardrails, approvals, state, and traces.
- Sandbox-owned workspace: use when the task needs files, commands, packages, ports, artifacts, snapshots, or human review before resume.
- Managed-agent or brain/hands split: use when generated code or untrusted work should run outside the credentialed orchestration boundary.

## Long-Running Workflow Patterns

- Initializer context: first context window prepares environment and handoff material for later workers.
- Fresh-context handoff: completed phases write artifacts, summaries, and decisions to files, then the next worker starts from those artifacts.
- Snapshot and resume: every meaningful run has a restorable workspace state and a serialized run state.
- Artifact-first verification: downstream systems consume files or structured artifacts only after validation.

## Tool Surface Patterns

- Small tool sets: expose direct function tools with complete descriptions.
- Large MCP surfaces: use tool search, filesystem-discoverable tool APIs, or code-mode so the model loads only relevant definitions.
- Sensitive data flows: keep large or sensitive intermediate data inside the execution environment and return only summaries, counts, hashes, or validated artifacts to the model.

## Eval Implications

Harness evals must score complete traces, not only final text. Measure task success, state transitions, unsafe action prevention, recovery behavior, cost, latency, and pass rate across repeated trials.

## Sources

- [OpenAI Agents SDK](https://developers.openai.com/api/docs/guides/agents)
- [OpenAI sandbox agents](https://developers.openai.com/api/docs/guides/agents/sandboxes)
- [OpenAI reasoning models](https://developers.openai.com/api/docs/guides/reasoning)
- [Anthropic effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
- [Anthropic harness design for long-running application development](https://www.anthropic.com/engineering/harness-design-long-running-apps)
- [Anthropic managed agents](https://www.anthropic.com/engineering/managed-agents)
- [Anthropic code execution with MCP](https://www.anthropic.com/engineering/code-execution-with-mcp)
- [Anthropic advisor tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/advisor-tool)
- [MCP tools specification](https://modelcontextprotocol.io/specification/2025-11-25/server/tools)
- [MCP authorization specification](https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization)
