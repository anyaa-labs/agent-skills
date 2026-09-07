import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const CHECKLIST_DIR = path.join(root, 'agent-architect/checklists');

// A line may keep a model-version string only if it carries this marker,
// with a stated reason. Everything else belongs in a family profile.
const ALLOW_MARKER = /<!--\s*model-ref-ok:\s*\S+/;

// One pattern per family in agent-architect/model-profiles/, so the guard's
// coverage tracks the data layer instead of lagging behind it. When a family
// file is added, add its version pattern here.
const MODEL_VERSION_PATTERNS = [
  // --- frontier ---
  { name: 'openai-version', re: /\bgpt-[0-9]/i },
  { name: 'openai-o-series', re: /\bo[1-9]\b(?!\w)/ },
  { name: 'openai-oss-version', re: /\bgpt-oss\b/i },
  { name: 'claude-version', re: /\bclaude-(opus|sonnet|haiku|fable|mythos)-?[0-9]/i },
  { name: 'gemini-version', re: /\bgemini[- ][0-9]/i },
  { name: 'gemma-version', re: /\bgemma[- ]?[0-9]/i },
  // --- open-weight ---
  { name: 'deepseek-version', re: /\bdeepseek[- ](chat|reasoner|v[0-9]|r[0-9])/i },
  { name: 'llama-version', re: /\bllama[- ]?[0-9]/i },
  { name: 'qwen-version', re: /\bqwen[- ]?[0-9]/i },
  { name: 'mistral-version', re: /\b(mistral (large|small|medium) [0-9]|mistral-[a-z]*-?[0-9]{4}|codestral[- ]?[0-9])/i },
  { name: 'command-version', re: /\bcommand[- ]r\+?/i },
  { name: 'moonshot-version', re: /\b(kimi|moonshot)[- ]?[a-z]?[0-9]/i },
  { name: 'zhipu-version', re: /\b(glm|chatglm)[- ]?[0-9]/i },
  { name: 'minimax-version', re: /\b(minimax|abab)[- ]?[a-z]?[0-9]/i },
  { name: 'granite-version', re: /\bgranite[- ]?[0-9]/i },
  // --- regional ---
  { name: 'sarvam-version', re: /\bsarvam[- ]?[a-z]?[0-9]/i },
  { name: 'falcon-version', re: /\bfalcon[- ]?[a-z]?[0-9]/i },
  {
    name: 'regional-other-version',
    re: /\b(jais|allam|sea-lion|hyperclova|hcx|solar|k2-think|k2-horizon)[- ]?[a-z]?[0-9]/i,
  },
  // --- perishable non-name facts ---
  { name: 'context-limit-claim', re: /~?\s?\d{2,3}\s?-\s?\d{2,3}K\b/ },
  { name: 'context-ceiling-claim', re: /beyond\s+~?\d+K/i },
  // A token count asserted *as a context window* is a per-model fact. Prompt-size
  // thresholds ("prompt exceeds 8K tokens", "<2K token prompts") are generic
  // quality guidance and stay legal, so the number must sit next to
  // context/window vocabulary within one clause to trip the guard.
  { name: 'context-window-claim', re: /\b(context|window)\b[^.\n]{0,15}\b\d{1,4}\s?K\b/i },
  { name: 'context-window-claim-reversed', re: /\b\d{1,4}\s?K\b[^.\n]{0,15}\b(context window|context length|window)\b/i },
  // A date attached to a verification, deprecation, or retirement claim is a fact
  // that expires. Illustrative dates inside memory/validity-window examples
  // ("on 2026-04-15 we cooked poha", `valid_until: 2026-05-05`) are generic, so
  // the guard requires the perishability verb rather than matching bare ISO dates.
  {
    name: 'dated-model-fact',
    re: /\b(as of|verified|re-?verified|researched|last updated|current as of|announced|available since|released|deprecat\w*|retir\w*|shut ?down|sunset\w*|end[- ]of[- ]life|EOL)\b[^.\n]{0,40}\b(19|20)\d{2}-\d{2}-\d{2}\b/i,
  },
  {
    name: 'dated-model-fact-reversed',
    re: /\b(19|20)\d{2}-\d{2}-\d{2}\b[^.\n]{0,40}\b(deprecat\w*|retir\w*|shut ?down|sunset\w*|end[- ]of[- ]life|EOL|knowledge cutoff|training cutoff)\b/i,
  },
];

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
