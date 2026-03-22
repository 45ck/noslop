/**
 * llms-freshness: Ensures committed llms-full.txt matches what the build script
 * would generate. Breaks CI when a doc file changes without regenerating.
 */
import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

describe('llms-freshness', () => {
  it('llms-full.txt matches build script output', () => {
    const committed = readFileSync(path.join(projectRoot, 'llms-full.txt'), 'utf8');

    // Regenerate to a temp file by running the build script with DRY_RUN
    const generated = execFileSync(
      process.execPath,
      [path.join(projectRoot, 'scripts', 'build-llms-full.mjs'), '--verify'],
      { encoding: 'utf8', cwd: projectRoot },
    );

    expect(committed).toBe(generated);
  });
});
