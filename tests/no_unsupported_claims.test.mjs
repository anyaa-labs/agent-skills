import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const CHECKLIST_DIR = path.join(root, 'agent-architect/checklists');

// Across the 0.9.0 release, four consecutive tasks shipped a claim that EXCEEDED
// its source, and every one was caught by a human reviewer reading the reference
// file rather than by a test. Two shapes accounted for almost all of them, and
// both are greppable:
//
//   1. A single-vendor fact pluralised into an industry trend. The reference
//      documented exactly one identity platform, one agent framework — and the
//      checklist said "platforms now split…", "frameworks now ship…".
//   2. A superlative attached to a source. One task called a study "the largest
//      published…" when the reference said "first", and the "largest" belonged
//      to a different paper — and was hedged even there.
//
// Neither shape is banned. Both are legitimate when the source actually supports
// them. The guard's job is to make the author point at the support: annotate the
// line with `<!-- source-claim-ok: <what the reference actually says> -->`. That
// turns "I believe this" into "here is the sentence I am relying on", which is
// the discipline the reviewers were applying by hand.
const ALLOW_MARKER = /<!--\s*source-claim-ok:\s*\S+/;

// A hedge already scoping the claim to what was actually observed.
const HEDGED = /\b(at least one|one major|some |a few|not all|several vendors)/i;

const CLAIM_PATTERNS = [
  {
    name: 'plural-vendor-capability',
    re: /\b(vendors|frameworks|platforms|providers)\s+now\s+(ship|offer|support|provide|expose|split|implement|carry|publish)\b/i,
    fix: 'Scope it ("at least one major …") or cite the source that shows it is industry-wide.',
  },
  {
    name: 'source-superlative',
    re: /\bthe\s+(largest|first|biggest|strongest|most\s+\w+)\s+(?:[\w-]+\s+){0,3}(study|assessment|analysis|measurement|survey|benchmark|evaluation)\b/i,
    fix: 'Superlatives about a source must be the source\'s own words. Quote them in the marker.',
  },
];

test('checklist claims do not exceed their sources unannotated', () => {
  const violations = [];

  for (const file of fs.readdirSync(CHECKLIST_DIR).filter((f) => f.endsWith('.md'))) {
    const lines = fs.readFileSync(path.join(CHECKLIST_DIR, file), 'utf8').split('\n');
    lines.forEach((line, i) => {
      if (ALLOW_MARKER.test(line) || HEDGED.test(line)) return;
      for (const { name, re, fix } of CLAIM_PATTERNS) {
        if (re.test(line)) {
          violations.push(`${file}:${i + 1} [${name}] ${fix}\n    ${line.trim().slice(0, 120)}`);
          break;
        }
      }
    });
  }

  assert.deepEqual(
    violations,
    [],
    'These lines make a claim shaped like one that exceeds its source.\n' +
      'Either scope the claim, or annotate the line with\n' +
      "  <!-- source-claim-ok: <what the reference actually says> -->\n\n" +
      violations.join('\n'),
  );
});

// Same two-sided discipline as the de-rot guard: prove the patterns fire on the
// real overclaims this release had to fix, and spare the corrected versions.
const MUST_TRIP = [
  'Frameworks now ship a call that serves an agent over the tool protocol.',
  'Enterprise identity platforms now split these as first-class identity types.',
  'Vendors now offer sponsor-lifecycle workflows against orphaned identities.',
  'This is the largest published dynamic behavioral assessment of these servers.',
];

const MUST_NOT_TRIP = [
  'At least one major agent framework now ships a call that serves an agent over the tool protocol.',
  'At least one major enterprise identity platform now splits these into separate types.',
  'Untrusted content can change which tools are called or in what order.',
  'Voice behavior depends on provider defaults, which vary between vendors.',
];

const trips = (line) =>
  !ALLOW_MARKER.test(line) && !HEDGED.test(line) && CLAIM_PATTERNS.some(({ re }) => re.test(line));

test('the claim guard catches the overclaim shapes this release actually shipped', () => {
  const missed = MUST_TRIP.filter((line) => !trips(line));
  assert.deepEqual(missed, [], `These exceed their source but no pattern matches:\n${missed.join('\n')}`);
});

test('the claim guard spares correctly scoped claims', () => {
  const falsePositives = MUST_NOT_TRIP.filter(trips);
  assert.deepEqual(
    falsePositives,
    [],
    `These are correctly scoped and must stay legal:\n${falsePositives.join('\n')}`,
  );
});
