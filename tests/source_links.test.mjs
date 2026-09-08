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
    'agent-architect/references/agent-engineering-landscape-2026-09.md',
  ];

  for (const filePath of referenceFiles) {
    const body = read(filePath);
    assert.match(body, /## Sources/);
    // Count markdown links AND bare URLs. The landscape files cite in
    // `- https://... (2026-08-13)` form deliberately: in a citation log the URL
    // and its date should both be visible without resolving link text. A bare
    // cited URL is a citation, so the guard counts it as one.
    const linkCount =
      [...body.matchAll(/\]\(https?:\/\/[^)]+\)/g)].length +
      [...body.matchAll(/(?<!\]\()https?:\/\/\S+/g)].length;
    assert.ok(linkCount >= 6, `${filePath} needs at least 6 cited sources, found ${linkCount}`);
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
