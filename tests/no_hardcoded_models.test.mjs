import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const CHECKLIST_DIR = path.join(root, 'agent-architect/checklists');

// A line may keep a model-version string only if it carries this marker,
// with a stated reason. Everything else belongs in a family profile.
const ALLOW_MARKER = /<!--\s*model-ref-ok:\s*\S+/;

const MODEL_VERSION_PATTERNS = [
  { name: 'openai-version', re: /\bgpt-[0-9]/i },
  { name: 'openai-o-series', re: /\bo[1-9]\b(?!\w)/ },
  { name: 'claude-version', re: /\bclaude-(opus|sonnet|haiku|fable|mythos)-?[0-9]/i },
  { name: 'gemini-version', re: /\bgemini[- ][0-9]/i },
  { name: 'deepseek-version', re: /\bdeepseek[- ](chat|reasoner|v[0-9]|r[0-9])/i },
  { name: 'llama-version', re: /\bllama[- ]?[0-9]/i },
  { name: 'qwen-version', re: /\bqwen[0-9]/i },
  { name: 'mistral-version', re: /\bmistral (large|small|medium) [0-9]/i },
  { name: 'command-version', re: /\bcommand[- ]r\+?/i },
  { name: 'context-limit-claim', re: /~?\s?\d{2,3}\s?-\s?\d{2,3}K\b/ },
  { name: 'context-ceiling-claim', re: /beyond\s+~?\d+K/i },
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
