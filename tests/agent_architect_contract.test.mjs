import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const read = (filePath) => fs.readFileSync(path.join(root, filePath), 'utf8');

test('package and skill versions match the planned release', () => {
  const pkg = JSON.parse(read('package.json'));
  const skill = read('agent-architect/SKILL.md');

  assert.equal(pkg.version, '0.8.0');
  assert.match(skill, /^version: 0\.8\.0$/m);
});

test('SKILL advertises and reports the same 12 audit dimensions', () => {
  const skill = read('agent-architect/SKILL.md');
  const dimensions = [
    'Prompt Architecture',
    'Tool Design',
    'Context Management',
    'Multi-Agent Orch.',
    'Eval Infrastructure',
    'Production Readiness',
    'Model Awareness',
    'Agent Security',
    'Memory Architecture',
    'Harness Architecture',
    'Multimodal Architecture',
    'Sovereignty & Residency',
  ];

  assert.match(skill, /12-dimension scoring/);
  for (const dimension of dimensions) {
    assert.ok(
      skill.includes(dimension),
      `Expected SKILL.md to include dimension: ${dimension}`,
    );
  }
});

test('all checklist and reference links mentioned in SKILL exist', () => {
  const skill = read('agent-architect/SKILL.md');
  const linkedFiles = new Set([
    ...skill.matchAll(/`(checklists\/[^`]+?\.md)`/g),
    ...skill.matchAll(/`(references\/[^`]+?\.md)`/g),
  ].map((match) => `agent-architect/${match[1]}`));

  assert.ok(linkedFiles.size >= 13, 'Expected SKILL.md to reference the expanded checklist/reference set');

  for (const filePath of linkedFiles) {
    assert.ok(fs.existsSync(path.join(root, filePath)), `Missing linked file: ${filePath}`);
  }
});

test('Discovery records runtime, modality, and MCP surfaces in the system map', () => {
  const skill = read('agent-architect/SKILL.md');

  for (const expected of ['Runtime:', 'Modalities:', 'MCP/tools:', 'Sandbox:', 'Reasoning state:', 'Residency:']) {
    assert.ok(skill.includes(expected), `Expected System Map field: ${expected}`);
  }
});
