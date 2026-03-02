import { describe, expect, it } from 'vitest';
import { AlwaysSkipConflictResolver } from './always-skip-conflict-resolver.js';

describe('AlwaysSkipConflictResolver', () => {
  it('always resolves to skip regardless of file path', async () => {
    const resolver = new AlwaysSkipConflictResolver();
    expect(await resolver.resolve('/any/path/eslint.config.js')).toBe('skip');
  });

  it('resolves to skip for any path', async () => {
    const resolver = new AlwaysSkipConflictResolver();
    expect(await resolver.resolve('/another/file.txt')).toBe('skip');
  });
});
