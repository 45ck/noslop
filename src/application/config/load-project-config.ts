import type { ProjectConfig } from '../../domain/config/project-config.js';
import { parseProjectConfig } from '../../domain/config/project-config.js';
import type { IFilesystem } from '../ports/filesystem.js';

const CONFIG_FILENAME = '.noslop.json';

export async function loadProjectConfig(
  targetDir: string,
  fs: IFilesystem,
): Promise<ProjectConfig | null> {
  const configPath = `${targetDir}/${CONFIG_FILENAME}`;
  const exists = await fs.exists(configPath);
  if (!exists) return null;

  const content = await fs.readFile(configPath);
  let raw: unknown;
  try {
    raw = JSON.parse(content);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`.noslop.json contains invalid JSON: ${message}`);
  }
  return parseProjectConfig(raw);
}
