import { describe, expect, it } from 'vitest';
import { createConfig, DEFAULT_PROTECTED_PATHS } from './noslop-config.js';

describe('createConfig', () => {
  it('creates a config with packs and protectedPaths', () => {
    const config = createConfig(['typescript'], ['.githooks/**']);
    expect(config.packs).toEqual(['typescript']);
    expect(config.protectedPaths).toEqual(['.githooks/**']);
  });

  it('throws when packs array is empty', () => {
    expect(() => createConfig([], [])).toThrow('NoslopConfig must include at least one pack.');
  });

  it('throws when any pack id is an empty string', () => {
    expect(() => createConfig([''], [])).toThrow('must not be empty strings');
  });

  it('throws when any pack id is whitespace-only', () => {
    expect(() => createConfig(['typescript', '  '], [])).toThrow('must not be empty strings');
  });

  it('accepts multiple packs', () => {
    const config = createConfig(['typescript', 'rust', 'dotnet'], []);
    expect(config.packs).toHaveLength(3);
  });

  it('accepts empty protectedPaths', () => {
    const config = createConfig(['typescript'], []);
    expect(config.protectedPaths).toHaveLength(0);
  });
});

describe('DEFAULT_PROTECTED_PATHS', () => {
  it('includes githooks directory', () => {
    expect(DEFAULT_PROTECTED_PATHS).toContain('.githooks/**');
  });

  it('includes github workflows directory', () => {
    expect(DEFAULT_PROTECTED_PATHS).toContain('.github/workflows/**');
  });

  it('includes claude settings and hooks', () => {
    expect(DEFAULT_PROTECTED_PATHS).toContain('.claude/settings.json');
    expect(DEFAULT_PROTECTED_PATHS).toContain('.claude/hooks/**');
  });

  it('includes common build artifacts', () => {
    expect(DEFAULT_PROTECTED_PATHS).toContain('node_modules/**');
    expect(DEFAULT_PROTECTED_PATHS).toContain('.git/**');
    expect(DEFAULT_PROTECTED_PATHS).toContain('dist/**');
    expect(DEFAULT_PROTECTED_PATHS).toContain('build/**');
  });
});
