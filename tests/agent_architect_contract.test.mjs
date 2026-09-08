import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const read = (filePath) => fs.readFileSync(path.join(root, filePath), 'utf8');

test('package and skill versions match the planned release', () => {
  const pkg = JSON.parse(read('package.json'));
  const skill = read('agent-architect/SKILL.md');

  assert.equal(pkg.version, '0.9.0');
  assert.match(skill, /^version: 0\.9\.0$/m);
});

test('SKILL advertises and reports the same 13 audit dimensions', () => {
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
    'Agent Identity & Authorization',
  ];

  assert.match(skill, /13-dimension scoring/);
  for (const dimension of dimensions) {
    assert.ok(
      skill.includes(dimension),
      `Expected SKILL.md to include dimension: ${dimension}`,
    );
  }
});

test('SKILL description claims the same cognitive pattern count the section actually lists', () => {
  const skill = read('agent-architect/SKILL.md');

  const claimMatch = skill.match(/(\d+) cognitive patterns/);
  assert.ok(claimMatch, 'Expected SKILL.md description to claim "N cognitive patterns"');
  const claimedCount = Number(claimMatch[1]);

  const sectionStart = skill.indexOf('## Cognitive Patterns');
  assert.ok(sectionStart !== -1, 'Expected a "## Cognitive Patterns" section in SKILL.md');
  const nextHeading = skill.indexOf('\n## ', sectionStart + 1);
  const section = nextHeading === -1 ? skill.slice(sectionStart) : skill.slice(sectionStart, nextHeading);

  const actualCount = (section.match(/^\d+\. \*\*/gm) || []).length;

  assert.equal(
    claimedCount,
    actualCount,
    `SKILL.md description claims ${claimedCount} cognitive patterns but the Cognitive Patterns section lists ${actualCount}`,
  );

  assert.equal(
    actualCount,
    38,
    `Expected 38 cognitive patterns (29 existing + 9 new) but the Cognitive Patterns section lists ${actualCount}`,
  );
});

test('all checklist and reference links mentioned in SKILL exist', () => {
  const skill = read('agent-architect/SKILL.md');
  const linkedFiles = new Set([
    ...skill.matchAll(/`(checklists\/[^`]+?\.md)`/g),
    ...skill.matchAll(/`(references\/[^`]+?\.md)`/g),
  ].map((match) => `agent-architect/${match[1]}`));
  linkedFiles.add('agent-architect/checklists/agent-identity.md');

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
