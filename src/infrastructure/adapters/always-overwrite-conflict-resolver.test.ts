import { describe, expect, it } from 'vitest';
import { AlwaysOverwriteConflictResolver } from './always-overwrite-conflict-resolver.js';

describe('AlwaysOverwriteConflictResolver', () => {
  it('always resolves to overwrite regardless of file path', async () => {
    const resolver = new AlwaysOverwriteConflictResolver();
    expect(await resolver.resolve('/any/path/eslint.config.js')).toBe('overwrite');
  });

  it('resolves to overwrite for any path', async () => {
    const resolver = new AlwaysOverwriteConflictResolver();
    expect(await resolver.resolve('/another/file.txt')).toBe('overwrite');
  });
});
