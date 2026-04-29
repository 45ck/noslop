import { describe, expect, it } from 'vitest';
import { ALL_PACK_IDS, readTemplate } from './template-validation-support.js';

describe('template .claude/settings.json', () => {
  it.each(ALL_PACK_IDS)('%s settings are valid JSON and deny protected writes', (packId) => {
    const settings = JSON.parse(readTemplate(packId, '.claude/settings.json')) as {
      permissions?: { deny?: string[] };
    };
    const deny = settings.permissions?.deny ?? [];

    expect(deny).toContain('Write(.githooks/**)');
    expect(deny).toContain('Write(.github/workflows/**)');
    expect(deny).toContain('Write(.claude/hooks/**)');
    expect(deny).toContain('Write(.claude/settings.json)');
    expect(deny).toContain('Write(AGENTS.md)');
    expect(deny).toContain('Bash(*NOSLOP_ALLOW_PROTECTED_CHANGES*)');
  });

  it.each(ALL_PACK_IDS)('%s uses **/ prefixes for config deny rules', (packId) => {
    const settings = JSON.parse(readTemplate(packId, '.claude/settings.json')) as {
      permissions?: { deny?: string[] };
    };
    const deny = settings.permissions?.deny ?? [];
    const configRules = deny.filter((rule) => {
      const match = /^(Edit|Write)\((.+)\)$/.exec(rule);
      const pattern = match?.[2];
      if (!pattern) return false;
      return !pattern.startsWith('.') && pattern !== 'AGENTS.md';
    });

    for (const rule of configRules) {
      expect(rule).toMatch(/\((\*\*\/)/);
    }
  });
});

describe('template pre-tool-use.sh and AGENTS.md', () => {
  it.each(ALL_PACK_IDS)('%s pre-tool-use.sh contains the expected guardrails', (packId) => {
    const content = readTemplate(packId, '.claude/hooks/pre-tool-use.sh');
    expect(content.startsWith('#!/bin/sh')).toBe(true);
    expect(content.match(/^# Block direct Edit\/Write/gm)).toHaveLength(1);
    expect(content.trim()).toMatch(/echo '\{"decision":"allow"\}'\s*$/);
    for (const snippet of [
      'jq is not installed',
      '--no-verify bypasses pre-commit hooks and is not allowed',
      'NOSLOP_ALLOW_PROTECTED_CHANGES is a human-only local maintenance override',
      'CI-skip patterns',
      'quality gate configs are protected',
      '.githooks/',
      '.github/workflows/',
      'AGENTS.md',
    ]) {
      expect(content).toContain(snippet);
    }
  });

  it('typescript pre-tool-use.sh blocks --no-eslintrc', () => {
    const content = readTemplate('typescript', '.claude/hooks/pre-tool-use.sh');
    expect(content).toContain('--no-eslintrc is not allowed');
    expect(content).toContain('npx eslint');
  });

  it.each(ALL_PACK_IDS)('%s AGENTS.md includes recovery and bypass guidance', (packId) => {
    const content = readTemplate(packId, 'AGENTS.md');
    expect(content).toContain('noslop');
    expect(content).toContain('If a gate blocks you');
    expect(content).toContain('Fast tier fallback commands');
    expect(content).toContain('Slow tier fallback commands');
    expect(content).toMatch(/[Nn]ever.*--no-verify/);
    expect(content).toMatch(/[Nn]ever.*--force/);
    expect(content).toMatch(/[Nn]ever.*\[skip ci\]/);
    expect(content).toContain('Never use `NOSLOP_ALLOW_PROTECTED_CHANGES=1`');
  });
});

describe('template commit-msg hook', () => {
  it.each(ALL_PACK_IDS)('%s commit-msg includes remediation text and examples', (packId) => {
    const content = readTemplate(packId, '.githooks/commit-msg');
    expect(content.startsWith('#!/bin/sh')).toBe(true);
    expect(content).toContain('Remove the pattern from your commit message');
    expect(content).toContain('Example: feat(auth): add OAuth2 login flow');
  });
});
