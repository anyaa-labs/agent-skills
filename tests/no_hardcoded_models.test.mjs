import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const CHECKLIST_DIR = path.join(root, 'agent-architect/checklists');
const PROFILE_DIR = path.join(root, 'agent-architect/model-profiles');

// A line may keep a model-version string only if it carries this marker,
// with a stated reason. Everything else belongs in a family profile.
const ALLOW_MARKER = /<!--\s*model-ref-ok:\s*\S+/;

// Every profile family must be represented here. The coverage assertion below
// makes adding a profile without updating this guard a test failure.
const MODEL_VERSION_PATTERNS = [
  // --- frontier ---
  { name: 'openai-version', families: ['openai'], re: /\bgpt-[0-9]/i },
  { name: 'openai-o-series', families: ['openai'], re: /\bo[1-9]\b(?!\w)/ },
  { name: 'openai-oss-version', families: ['openai'], re: /\bgpt-oss\b/i },
  { name: 'claude-version', families: ['anthropic'], re: /\bclaude-(opus|sonnet|haiku|fable|mythos)-?[0-9]/i },
  { name: 'gemini-version', families: ['google'], re: /\bgemini[- ][0-9]/i },
  { name: 'gemma-version', families: ['google'], re: /\bgemma[- ]?[0-9]/i },
  // Covers `grok-4.6`, `Grok 4.6`, `grok-build-0.1`, `grok-imagine-image-2.0`,
  // `grok-voice-think-fast-2.0`, and the retired `grok-3` / `grok-code-fast-1` slugs.
  { name: 'grok-version', families: ['xai'], re: /\bgrok[\w.-]*[ -]\d/i },
  // Nova IDs carry a generation digit (`nova-2-lite`) or a named tier
  // (`nova-premier`, `amazon.nova-pro-v1:0`), so match both shapes rather than
  // the bare word `nova`, which has ordinary English uses.
  { name: 'nova-version', families: ['amazon-nova'], re: /\b(amazon\.nova|nova[- ](?:2|premier|pro|lite|micro|sonic|canvas|reel)\b)/i },
  // --- open-weight ---
  { name: 'deepseek-version', families: ['deepseek'], re: /\bdeepseek[- ](chat|reasoner|v[0-9]|r[0-9])/i },
  { name: 'llama-version', families: ['meta'], re: /\bllama[- ]?[0-9]/i },
  { name: 'qwen-version', families: ['qwen'], re: /\bqwen[- ]?[0-9]/i },
  { name: 'mistral-version', families: ['mistral'], re: /\b(mistral (large|small|medium) [0-9]|mistral-[a-z]*-?[0-9]{4}|codestral[- ]?[0-9])/i },
  // Cohere ships four lines and only `command-r` was covered. `Command A` needs
  // care: "the agent can command a subprocess" is ordinary English, so match the
  // hyphenated slug in any case, but the spaced form only when capitalised as the
  // product name. A sentence literally starting "Command a ..." would trip; no
  // checklist phrases it that way, and the allow-marker is the escape hatch.
  { name: 'cohere-command-r', families: ['cohere'], re: /\bcommand[- ]r\+?/i },
  { name: 'cohere-command-a', families: ['cohere'], re: /\bcommand-a\b|\bCommand A\b/ },
  { name: 'cohere-aya', families: ['cohere'], re: /\baya\b/i },
  { name: 'cohere-embed-rerank', families: ['cohere'], re: /\b(embed|rerank)[- ]v[0-9]/i },
  { name: 'moonshot-version', families: ['moonshot'], re: /\b(kimi|moonshot)[- ]?[a-z]?[0-9]/i },
  { name: 'zhipu-version', families: ['zhipu'], re: /\b(glm|chatglm)[- ]?[0-9]/i },
  { name: 'minimax-version', families: ['minimax'], re: /\b(minimax|abab)[- ]?[a-z]?[0-9]/i },
  // MiniMax's media lines drop the family name entirely (`Hailuo-02`, `image-01`).
  { name: 'minimax-hailuo', families: ['minimax'], re: /\bhailuo\b/i },
  { name: 'minimax-image', families: ['minimax'], re: /\bimage-0[0-9]\b/i },
  { name: 'granite-version', families: ['ibm-granite'], re: /\bgranite[- ]?[0-9]/i },
  // `jamba-large` / `jamba-mini` carry no version digit, and none of these three
  // family names has an ordinary English use, so match the bare name — the same
  // shape as the `command-r` pattern above.
  // No trailing \b: it blocked the HF org string `ai21labs`.
  { name: 'jamba-version', families: ['ai21'], re: /\b(jamba|ai21)/i },
  { name: 'nemotron-version', families: ['nvidia-nemotron'], re: /\bnemotron\b/i },
  { name: 'olmo-version', families: ['ai2-olmo'], re: /\bolmo\b/i },
  // --- regional ---
  { name: 'sarvam-version', families: ['sarvam'], re: /\bsarvam[- ]?[a-z]?[0-9]/i },
  { name: 'falcon-version', families: ['falcon'], re: /\bfalcon[- ]?[a-z]?[0-9]/i },
  {
    name: 'regional-other-version',
    families: ['regional-other'],
    re: /\b(jais|allam|sea-lion|hyperclova|hcx|solar|k2-think|k2-horizon)[- ]?[a-z]?[0-9]/i,
  },
  // --- perishable non-name facts ---
  { name: 'context-limit-claim', re: /~?\s?\d{2,3}\s?-\s?\d{2,3}K\b/ },
  { name: 'context-ceiling-claim', re: /beyond\s+~?\d+K/i },
  // A token count asserted *as a context window* is a per-model fact. Prompt-size
  // thresholds ("prompt exceeds 8K tokens", "<2K token prompts") are generic
  // quality guidance and stay legal, so the number must sit next to
  // context/window vocabulary within one clause to trip the guard.
  // The 15-char proximity window was too tight for ordinary phrasing: "the context
  // window on this tier is 200K" puts 17 chars between the two, and slipped through.
  // Widened to 30, which still keeps the number inside a single clause. Measured at
  // zero false positives across all twelve checklists.
  { name: 'context-window-claim', re: /\b(context|window)\b[^.\n]{0,30}\b\d{1,4}\s?K\b/i },
  { name: 'context-window-claim-reversed', re: /\b\d{1,4}\s?K\b[^.\n]{0,30}\b(context window|context length|window)\b/i },
  // Million-scale windows are now the common case and were entirely uncovered.
  { name: 'context-window-claim-m', re: /\b(context|window)\b[^.\n]{0,30}\b\d{1,4}\s?M\b/i },
  { name: 'context-window-claim-m-reversed', re: /\b\d{1,4}\s?M\b[^.\n]{0,30}\b(context window|context length|window)\b/i },
  // Comma-grouped token counts ("1,000,000 tokens") sidestep every K/M pattern.
  { name: 'context-window-claim-grouped', re: /\b\d{1,3}(?:,\d{3})+\s*tokens?\b/i },
  // A date attached to a verification, deprecation, or retirement claim is a fact
  // that expires. Illustrative dates inside memory/validity-window examples
  // ("on 2026-04-15 we cooked poha", `valid_until: 2026-05-05`) are generic, so
  // the guard requires the perishability verb rather than matching bare ISO dates.
  {
    name: 'dated-model-fact',
    re: /\b(as of|verified|re-?verified|researched|last updated|current as of|announced|available since|released|deprecat\w*|retir\w*|shut ?down|sunset\w*|end[- ]of[- ]life|EOL)\b[^.\n]{0,40}\b(19|20)\d{2}-\d{2}-\d{2}\b/i,
  },
  // Perishable facts written in prose ("deprecated in September 2026") escaped the
  // ISO-only patterns. Same perishability-verb requirement, so ordinary prose dates
  // in illustrative examples stay legal.
  {
    name: 'dated-model-fact-prose',
    re: /\b(as of|verified|re-?verified|researched|last updated|current as of|announced|available since|released|deprecat\w*|retir\w*|shut ?down|sunset\w*|end[- ]of[- ]life|EOL)\b[^.\n]{0,40}\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(19|20)\d{2}\b/i,
  },
  {
    name: 'dated-model-fact-reversed',
    re: /\b(19|20)\d{2}-\d{2}-\d{2}\b[^.\n]{0,40}\b(deprecat\w*|retir\w*|shut ?down|sunset\w*|end[- ]of[- ]life|EOL|knowledge cutoff|training cutoff)\b/i,
  },
];

test('the model-fact guard covers every shipped profile family', () => {
  const profileFamilies = fs.readdirSync(PROFILE_DIR)
    .filter((file) => file.endsWith('.md'))
    .map((file) => path.basename(file, '.md'))
    .sort();
  const coveredFamilies = new Set(
    MODEL_VERSION_PATTERNS.flatMap(({ families = [] }) => families),
  );
  const uncovered = profileFamilies.filter((family) => !coveredFamilies.has(family));

  assert.deepEqual(
    uncovered,
    [],
    `Every model profile needs at least one MODEL_VERSION_PATTERNS entry. Missing: ${uncovered.join(', ')}`,
  );
});

test('checklists contain no un-annotated model-version strings', () => {
  const violations = [];

  for (const file of fs.readdirSync(CHECKLIST_DIR).filter((f) => f.endsWith('.md'))) {
    const lines = fs.readFileSync(path.join(CHECKLIST_DIR, file), 'utf8').split('\n');
    lines.forEach((line, i) => {
      if (ALLOW_MARKER.test(line)) return;
      for (const { name, re } of MODEL_VERSION_PATTERNS) {
        if (re.test(line)) {
          violations.push(`${file}:${i + 1} [${name}] ${line.trim().slice(0, 100)}`);
          break;
        }
      }
    });
  }

  assert.deepEqual(
    violations,
    [],
    `Model-version facts belong in agent-architect/model-profiles/<family>.md, not in checklists.\n` +
      `If a mention is genuinely generic, append '<!-- model-ref-ok: reason -->' to the line.\n\n` +
      violations.join('\n'),
  );
});

// The 0.8.0 guard had no test of its own behaviour, so nobody noticed that most
// families' real ID shapes slipped straight through it. These two corpora pin the
// guard down from both sides: MUST_TRIP is every probe that escaped 0.8.0, and
// MUST_NOT_TRIP is the generic checklist prose the guard has to leave alone.
// Widening a pattern is fine; silently narrowing one now fails a test.
const MUST_TRIP = [
  'Command A is Cohere\'s current flagship for RAG workloads.',
  'Use Aya Expanse for multilingual routing.',
  'Prefer embed-v4 over the older embedding endpoint.',
  'rerank-v3.5 should sit behind the retrieval step.',
  'Hailuo-02 handles the video generation path.',
  'MiniMax image-01 is the cheaper option here.',
  'Weights are published under the ai21labs org on HuggingFace.',
  'The model has a 1M context window, so chunking is optional.',
  'Its context window is 2 M tokens on the newest tier.',
  'The window comfortably holds 1,000,000 tokens of transcript.',
  'The context window on this tier is 200K tokens.',
  'This endpoint was deprecated in September 2026 with no replacement.',
  'Route long jobs to llama-3.3-nemotron-super-49b instead.',
];

const MUST_NOT_TRIP = [
  'The agent can command a subprocess to exit cleanly.',
  'Flag any prompt that exceeds 8K tokens as instruction dilution.',
  'Keep system prompts under 2K tokens where possible.',
  'On 2026-04-15 the user said they cooked poha for breakfast.',
  'Set valid_until: 2026-05-05 on every volatile memory row.',
  'Embed the retrieved chunk verbatim rather than paraphrasing it.',
  'The image-only branch must still validate provenance.',
  'Summarise the trace before the window fills.',
];

const matchers = (line) =>
  MODEL_VERSION_PATTERNS.filter(({ re }) => re.test(line)).map(({ name }) => name);

test('the guard actually catches the model-fact shapes it claims to', () => {
  const missed = MUST_TRIP.filter((line) => matchers(line).length === 0);
  assert.deepEqual(
    missed,
    [],
    `These carry a model-version fact but no pattern matches them:\n${missed.join('\n')}`,
  );
});

test('the guard leaves generic checklist prose alone', () => {
  const falsePositives = MUST_NOT_TRIP.filter((line) => matchers(line).length > 0)
    .map((line) => `[${matchers(line).join(', ')}] ${line}`);
  assert.deepEqual(
    falsePositives,
    [],
    `These are generic guidance and must stay legal:\n${falsePositives.join('\n')}`,
  );
});
