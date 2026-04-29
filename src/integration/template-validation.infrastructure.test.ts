import { describe, expect, it } from 'vitest';
import {
  ALL_PACK_IDS,
  TYPOS_PACKS,
  allPackIds,
  readTemplate,
} from './template-validation-support.js';

describe('template packs directory', () => {
  it('contains exactly 19 pack directories and all expected IDs', () => {
    const packIds = allPackIds();
    expect(packIds).toHaveLength(19);
    for (const packId of ALL_PACK_IDS) {
      expect(packIds).toContain(packId);
    }
  });
});

describe('template scripts/check', () => {
  it.each(ALL_PACK_IDS)('%s scripts/check has the expected shell branches', (packId) => {
    const content = readTemplate(packId, 'scripts/check');
    expect(content.startsWith('#!/bin/sh')).toBe(true);
    expect(content.trim().length).toBeGreaterThan(0);
    for (const branch of ['fast)', 'slow)', 'ci)']) {
      expect(content).toContain(branch);
    }
  });
});

describe('template git hooks and workflows', () => {
  it.each(ALL_PACK_IDS)('%s pre-commit protects infrastructure paths', (packId) => {
    const content = readTemplate(packId, '.githooks/pre-commit');
    expect(content.startsWith('#!/bin/sh')).toBe(true);
    expect(content).toContain('.githooks/*');
    expect(content).toContain('.github/workflows/*');
    expect(content).toContain('.claude/hooks/*');
    expect(content).toContain('AGENTS.md');
    expect(content).toContain('NOSLOP_ALLOW_PROTECTED_CHANGES');
    expect(content).toContain('noslop-approved');
    expect(content).not.toContain('command -v noslop');
  });

  it.each(ALL_PACK_IDS)('%s quality workflow has core structure', (packId) => {
    const content = readTemplate(packId, '.github/workflows/quality.yml');
    expect(content).toContain('on:');
    expect(content).toContain('jobs:');
    expect(content).toContain('runs-on:');
  });

  it.each(TYPOS_PACKS)('%s quality workflow includes typos', (packId) => {
    expect(readTemplate(packId, '.github/workflows/quality.yml')).toContain('typos');
  });
});
