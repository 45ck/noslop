import type { Pack } from '../domain/pack/pack.js';
import type { ProjectConfig } from '../domain/config/project-config.js';
import type { IFilesystem } from '../application/ports/filesystem.js';
import { ALL_PACKS, detectPacks } from './packs.js';

export async function resolvePacks(
  cliPacks: readonly string[],
  projectConfig: ProjectConfig | null,
  targetDir: string,
  fs: IFilesystem,
): Promise<Pack[]> {
  if (cliPacks.length > 0) {
    return ALL_PACKS.filter((p) => cliPacks.includes(p.id));
  }
  if (projectConfig?.packs && projectConfig.packs.length > 0) {
    return ALL_PACKS.filter((p) => projectConfig.packs?.includes(p.id));
  }
  return detectPacks(targetDir, fs);
}
