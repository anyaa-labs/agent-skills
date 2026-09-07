import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const PROFILE_DIR = path.join(root, 'agent-architect/model-profiles');
const INDEX_PATH = path.join(root, 'agent-architect/model-profiles.md');

const REQUIRED_HEADINGS = [
  '### API surface',
  '### Reasoning state',
  '### Tool semantics',
  '### Modality support',
  '### Context behavior',
  '### Structured output path',
  '### Deployment & residency',
  '### Known production failure modes',
  '### Harness requirements',
  '### Retired / migration targets',
  '### Re-evaluate when',
];

const VALID_TIERS = new Set(['frontier', 'open-weight', 'regional']);

const familyFiles = () =>
  fs.readdirSync(PROFILE_DIR).filter((f) => f.endsWith('.md')).sort();

const readProfile = (file) =>
  fs.readFileSync(path.join(PROFILE_DIR, file), 'utf8');

const parseFrontmatter = (body) => {
  const match = body.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  const fields = {};
  for (const line of match[1].split('\n')) {
    const kv = line.match(/^([a-z_]+):\s*(.+)$/);
    if (kv) fields[kv[1]] = kv[2].trim();
  }
  return fields;
};

const daysOld = (isoDate) =>
  Math.floor((Date.now() - Date.parse(isoDate)) / 86_400_000);

test('the model-profiles directory exists and is not empty', () => {
  assert.ok(fs.existsSync(PROFILE_DIR), 'agent-architect/model-profiles/ must exist');
  assert.ok(familyFiles().length >= 15, 'expected at least 15 family profile files');
});

test('no profile still carries the Task 3 placeholder', () => {
  for (const file of familyFiles()) {
    assert.ok(
      !readProfile(file).includes('Not yet verified'),
      `${file}: still carries the Task 3 placeholder — Tasks 4-7 must replace every instance`,
    );
  }
});

test('every family file has valid frontmatter', () => {
  for (const file of familyFiles()) {
    const fm = parseFrontmatter(readProfile(file));
    assert.ok(fm, `${file}: missing YAML frontmatter`);
    assert.ok(fm.family, `${file}: missing 'family'`);
    assert.ok(VALID_TIERS.has(fm.tier), `${file}: tier '${fm.tier}' not one of ${[...VALID_TIERS]}`);
    assert.match(fm.researched_date ?? '', /^\d{4}-\d{2}-\d{2}$/, `${file}: researched_date must be YYYY-MM-DD`);
  }
});

test('every family file has all 11 required field headings', () => {
  for (const file of familyFiles()) {
    const body = readProfile(file);
    for (const heading of REQUIRED_HEADINGS) {
      assert.ok(body.includes(heading), `${file}: missing '${heading}'`);
    }
  }
});

test('every family file cites at least 3 primary-provider links', () => {
  for (const file of familyFiles()) {
    const links = [...readProfile(file).matchAll(/\]\((https?:\/\/[^)]+)\)/g)];
    assert.ok(links.length >= 3, `${file}: needs at least 3 cited links, found ${links.length}`);
  }
});

test('the index lists exactly the family files that exist', () => {
  const index = fs.readFileSync(INDEX_PATH, 'utf8');
  const listed = new Set(
    [...index.matchAll(/`model-profiles\/([a-z0-9-]+\.md)`/g)].map((m) => m[1]),
  );
  const onDisk = new Set(familyFiles());

  for (const file of onDisk) {
    assert.ok(listed.has(file), `${file} exists on disk but is not listed in model-profiles.md`);
  }
  for (const file of listed) {
    assert.ok(onDisk.has(file), `model-profiles.md lists ${file} but it does not exist on disk`);
  }
});

// The index is the first model file the skill reads (SKILL.md Discovery 2.5), and
// the Staleness Protocol lower in that same file tells the reader to do date
// arithmetic against what they find there. A banner date older than the family
// files therefore marks every family STALE on a schedule the data does not
// warrant; one newer overstates freshness. Pin it to the family files' range.
test('the index provenance banner agrees with the family files it indexes', () => {
  const index = fs.readFileSync(INDEX_PATH, 'utf8');
  const banner = index.match(/\*\*Provenance:\*\*\s*Researched\s*(\d{4}-\d{2}-\d{2})/);
  assert.ok(
    banner,
    'model-profiles.md must open with a "**Provenance:** Researched YYYY-MM-DD" banner',
  );

  const dates = familyFiles().map((f) => parseFrontmatter(readProfile(f)).researched_date).sort();
  const oldest = dates[0];
  const newest = dates[dates.length - 1];

  assert.ok(
    banner[1] >= oldest,
    `model-profiles.md provenance banner says ${banner[1]}, older than the oldest family ` +
      `researched_date (${oldest}). The Staleness Protocol in this same file would mark ` +
      `families stale off a date the data does not support.`,
  );
  assert.ok(
    banner[1] <= newest,
    `model-profiles.md provenance banner says ${banner[1]}, newer than the newest family ` +
      `researched_date (${newest}). The banner must not claim freshness no profile has.`,
  );
});

test('profile data is not dangerously stale', (t) => {
  for (const file of familyFiles()) {
    const fm = parseFrontmatter(readProfile(file));
    const age = daysOld(fm.researched_date);
    assert.ok(
      age <= 180,
      `${file}: researched_date is ${age} days old (hard limit 180). Re-run the research pass.`,
    );
    if (age > 90) {
      t.diagnostic(`WARNING: ${file} is ${age} days old — schedule a refresh.`);
    }
  }
});
