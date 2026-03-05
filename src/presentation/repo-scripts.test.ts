import { describe, expect, it } from 'vitest';
import { InMemoryFilesystem } from '../infrastructure/adapters/in-memory-filesystem.js';
import { detectRepositoryGatePack } from './repo-scripts.js';

describe('detectRepositoryGatePack', () => {
  it('returns null when package.json is missing', async () => {
    const fs = new InMemoryFilesystem();

    await expect(detectRepositoryGatePack('/project', fs, 'fast')).resolves.toBeNull();
  });

  it('prefers gate scripts when available', async () => {
    const fs = new InMemoryFilesystem();
    fs.seed(
      '/project/package.json',
      JSON.stringify({
        packageManager: 'pnpm@10.8.0',
        scripts: {
          'gate:fast': 'npm run lint && npm run test:smoke',
          'noslop:fast': 'npm run gate:fast',
        },
      }),
    );

    const pack = await detectRepositoryGatePack('/project', fs, 'fast');

    expect(pack?.gates[0]?.label).toBe('gate:fast');
    expect(pack?.gates[0]?.command).toBe('pnpm run gate:fast');
  });

  it('uses non-recursive noslop scripts when no gate script exists', async () => {
    const fs = new InMemoryFilesystem();
    fs.seed(
      '/project/package.json',
      JSON.stringify({
        scripts: {
          'noslop:slow': 'npm run typecheck && npm run contracts:check',
        },
      }),
    );

    const pack = await detectRepositoryGatePack('/project', fs, 'slow');

    expect(pack?.gates[0]?.label).toBe('noslop:slow');
    expect(pack?.gates[0]?.command).toBe('npm run noslop:slow');
  });

  it('falls back to lockfile detection when packageManager is missing', async () => {
    const fs = new InMemoryFilesystem();
    fs.seed(
      '/project/package.json',
      JSON.stringify({
        scripts: {
          'quality:fast': 'eslint . && vitest run --changed',
        },
      }),
    );
    fs.seed('/project/yarn.lock', '');

    const pack = await detectRepositoryGatePack('/project', fs, 'fast');

    expect(pack?.gates[0]?.label).toBe('quality:fast');
    expect(pack?.gates[0]?.command).toBe('yarn quality:fast');
  });

  it('skips recursive noslop scripts', async () => {
    const fs = new InMemoryFilesystem();
    fs.seed(
      '/project/package.json',
      JSON.stringify({
        scripts: {
          'noslop:fast': 'noslop check --tier=fast',
        },
      }),
    );

    await expect(detectRepositoryGatePack('/project', fs, 'fast')).resolves.toBeNull();
  });
});
