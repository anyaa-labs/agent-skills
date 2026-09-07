import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const read = (filePath) => fs.readFileSync(path.join(root, filePath), 'utf8');

test('new reference files contain source sections with external links', () => {
  const referenceFiles = [
    'agent-architect/references/harness-engineering.md',
    'agent-architect/references/multimodal-agents.md',
    'agent-architect/references/model-runtime-contracts.md',
  ];

  for (const filePath of referenceFiles) {
    const body = read(filePath);
    assert.match(body, /## Sources/);
    const linkCount = [...body.matchAll(/\]\(https?:\/\/[^)]+\)/g)].length;
    assert.ok(linkCount >= 6, `${filePath} needs at least 6 cited links`);
  }
});

test('model profiles declare current provenance and runtime contract fields', () => {
  const profiles = read('agent-architect/model-profiles.md');
  const required = [
    'API surface',
    'Reasoning state',
    'Tool semantics',
    'Modality support',
    'Re-evaluate when',
  ];

  for (const text of required) {
    assert.ok(profiles.includes(text), `model-profiles.md missing: ${text}`);
  }
});
