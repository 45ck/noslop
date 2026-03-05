import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(currentDir, '..', '..');
const templateRoot = path.join(projectRoot, 'templates', 'packs', 'typescript');

function readTemplate(relativePath: string): string {
  return readFileSync(path.join(templateRoot, relativePath), 'utf8');
}

describe('typescript template guardrails', () => {
  it('pre-commit protects enforcement files and routes through maintainer unlock', () => {
    const content = readTemplate(path.join('.githooks', 'pre-commit'));
    expect(content).toContain('SKIP_CI');
    expect(content).toContain('HUSKY_SKIP_HOOKS');
    expect(content).toContain('scripts/guardrails/check-protected-config-edit.mjs');
    expect(content).toContain('scripts/run-package-script format:check');
    expect(content).toContain('AGENTS.md');
    expect(content).toContain('.noslop.json');
  });

  it('pre-push blocks bypass env vars and uses package-manager-aware fallback scripts', () => {
    const content = readTemplate(path.join('.githooks', 'pre-push'));
    expect(content).toContain('SKIP_CI');
    expect(content).toContain('HUSKY_SKIP_HOOKS');
    expect(content).toContain('scripts/run-package-script typecheck');
    expect(content).toContain('scripts/run-package-script test');
  });

  it('Claude settings protect enforcement scripts and bypass patterns', () => {
    const content = readTemplate(path.join('.claude', 'settings.json'));
    expect(content).toContain('Bash(*SKIP_CI=*)');
    expect(content).toContain('Bash(*core.hooksPath*)');
    expect(content).toContain('Edit(AGENTS.md)');
    expect(content).toContain('Edit(.noslop.json)');
    expect(content).toContain('Edit(scripts/guardrails/**)');
    expect(content).toContain('Write(scripts/run-package-script)');
  });

  it('Claude pre-tool hook blocks destructive bypasses and enforcement-file edits', () => {
    const content = readTemplate(path.join('.claude', 'hooks', 'pre-tool-use.sh'));
    expect(content).toContain('HUSKY=0');
    expect(content).toContain('core.hooksPath');
    expect(content).toContain('push[[:space:]]+--force');
    expect(content).toContain('reset[[:space:]]+--hard');
    expect(content).toContain('scripts/guardrails/*');
  });

  it('guardrails workflow covers enforcement scripts and repo instructions', () => {
    const content = readTemplate(path.join('.github', 'workflows', 'guardrails.yml'));
    expect(content).toContain('AGENTS.md');
    expect(content).toContain('.noslop.json');
    expect(content).toContain('scripts/run-package-script');
    expect(content).toContain('scripts/guardrails/**');
  });

  it('maintainer guidance documents the unlock flow', () => {
    const content = readTemplate('AGENTS.md');
    expect(content).toContain('unlock-protected-config.mjs');
    expect(content).toContain('noslop-approved');
  });
});
