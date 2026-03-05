import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(currentDir, '..', '..');
const templateRoot = path.join(projectRoot, 'templates', 'packs', 'dotnet');

function readTemplate(relativePath: string): string {
  return readFileSync(path.join(templateRoot, relativePath), 'utf8');
}

describe('dotnet template guardrails', () => {
  it('pre-commit routes protected edits through maintainer unlock', () => {
    const content = readTemplate(path.join('.githooks', 'pre-commit'));
    expect(content).toContain('SKIP_CI');
    expect(content).toContain('HUSKY_SKIP_HOOKS');
    expect(content).toContain('scripts/guardrails/check-protected-config-edit.mjs');
    expect(content).toContain('Directory.Build.props');
    expect(content).toContain('.editorconfig');
  });

  it('dotnet Claude settings and hooks protect enforcement files', () => {
    const settings = readTemplate(path.join('.claude', 'settings.json'));
    const hook = readTemplate(path.join('.claude', 'hooks', 'pre-tool-use.sh'));
    expect(settings).toContain('Bash(*core.hooksPath*)');
    expect(settings).toContain('Edit(AGENTS.md)');
    expect(settings).toContain('Edit(scripts/guardrails/**)');
    expect(hook).toContain('HUSKY=0');
    expect(hook).toContain('core.hooksPath');
    expect(hook).toContain('scripts/guardrails/*');
  });

  it('maintainer guidance documents the unlock flow', () => {
    const content = readTemplate('AGENTS.md');
    expect(content).toContain('unlock-protected-config.mjs');
    expect(content).toContain('noslop-approved');
  });
});
