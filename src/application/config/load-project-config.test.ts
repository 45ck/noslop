import { describe, expect, it } from 'vitest';
import { loadProjectConfig } from './load-project-config.js';
import { InMemoryFilesystem } from '../../infrastructure/adapters/in-memory-filesystem.js';

describe('loadProjectConfig', () => {
  it('returns null when .noslop.json does not exist', async () => {
    const fs = new InMemoryFilesystem();
    const config = await loadProjectConfig('/project', fs);
    expect(config).toBeNull();
  });

  it('returns parsed config when .noslop.json exists', async () => {
    const fs = new InMemoryFilesystem();
    fs.seed(
      '/project/.noslop.json',
      JSON.stringify({ packs: ['typescript'], skipGates: ['mutation'] }),
    );
    const config = await loadProjectConfig('/project', fs);
    expect(config?.packs).toEqual(['typescript']);
    expect(config?.skipGates).toEqual(['mutation']);
  });

  it('throws on invalid JSON with descriptive message', async () => {
    const fs = new InMemoryFilesystem();
    fs.seed('/project/.noslop.json', '{bad json');
    await expect(loadProjectConfig('/project', fs)).rejects.toThrow(
      /\.noslop\.json contains invalid JSON:/,
    );
  });

  it('throws on invalid config structure', async () => {
    const fs = new InMemoryFilesystem();
    fs.seed('/project/.noslop.json', JSON.stringify({ packs: 'not-array' }));
    await expect(loadProjectConfig('/project', fs)).rejects.toThrow('"packs" must be an array');
  });
});
