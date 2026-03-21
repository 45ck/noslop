import { afterEach, describe, expect, it, vi } from 'vitest';
import { runList } from './list-command.js';

describe('runList', () => {
  const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('lists all 19 packs in table format', () => {
    runList(false);
    const output = logSpy.mock.calls.map((c) => String(c[0])).join('\n');
    expect(output).toContain('typescript');
    expect(output).toContain('rust');
    expect(output).toContain('python');
    expect(output).toContain('ocaml');
    expect(logSpy.mock.calls.length).toBeGreaterThanOrEqual(21); // header + separator + 19 packs
  });

  it('outputs JSON when --json flag is set', () => {
    runList(true);
    const output = logSpy.mock.calls.map((c) => String(c[0])).join('');
    const parsed = JSON.parse(output) as { id: string; name: string }[];
    expect(parsed).toHaveLength(19);
    expect(parsed[0]?.id).toBe('typescript');
    expect(parsed[0]).toHaveProperty('gates');
  });
});
