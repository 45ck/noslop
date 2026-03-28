import { describe, expect, it } from 'vitest';
import { cli, distExists, withTempDir } from './cli-spawn-support.js';

describe('CLI spawn check command JSON output', () => {
  it('emits the expected JSON structure', { timeout: 20_000 }, async () => {
    if (!distExists) return;
    await withTempDir('noslop-cli-spawn-json-', async (tmpDir) => {
      cli(['install', '--pack', 'rust', '--dir', tmpDir]);
      const result = cli(['check', '--json', '--tier', 'fast', '--dir', tmpDir]);
      const parsed = JSON.parse(String(result.stdout).trim()) as {
        passed: boolean;
        tier: string;
        gates: { label: string; command: string; passed: boolean; exitCode: number }[];
      };

      expect(typeof parsed.passed).toBe('boolean');
      expect(parsed.tier).toBe('fast');
      expect(Array.isArray(parsed.gates)).toBe(true);
      for (const gate of parsed.gates) {
        expect(typeof gate.label).toBe('string');
        expect(typeof gate.command).toBe('string');
        expect(typeof gate.passed).toBe('boolean');
        expect(typeof gate.exitCode).toBe('number');
      }
    });
  });

  it('omits skipped gates from JSON output', { timeout: 20_000 }, async () => {
    if (!distExists) return;
    await withTempDir('noslop-cli-spawn-skip-', async (tmpDir) => {
      cli(['install', '--pack', 'rust', '--dir', tmpDir]);
      const singleSkip = cli([
        'check',
        '--json',
        '--tier',
        'fast',
        '--skip-gate',
        'spell',
        '--dir',
        tmpDir,
      ]);
      const multiSkip = cli([
        'check',
        '--json',
        '--tier',
        'ci',
        '--skip-gate',
        'mutation',
        '--skip-gate',
        'spell',
        '--dir',
        tmpDir,
      ]);

      const singleLabels = (
        JSON.parse(String(singleSkip.stdout).trim()) as { gates: { label: string }[] }
      ).gates.map((gate) => gate.label);
      const multi = JSON.parse(String(multiSkip.stdout).trim()) as {
        tier: string;
        gates: { label: string }[];
      };

      expect(singleLabels).not.toContain('spell');
      expect(multi.tier).toBe('ci');
      expect(multi.gates.map((gate) => gate.label)).not.toContain('mutation');
      expect(multi.gates.map((gate) => gate.label)).not.toContain('spell');
    });
  });
});

describe('CLI spawn check command text output', () => {
  it('shows verbose output for all gates', { timeout: 20_000 }, async () => {
    if (!distExists) return;
    await withTempDir('noslop-cli-spawn-verbose-', async (tmpDir) => {
      cli(['install', '--pack', 'rust', '--dir', tmpDir]);
      const result = cli(['check', '--verbose', '--tier', 'fast', '--dir', tmpDir]);
      expect(String(result.stdout)).toContain('noslop check --tier=fast');
    });
  });
});
