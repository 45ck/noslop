import type { IFilesystem } from '../application/ports/filesystem.js';
import { createGate } from '../domain/gate/gate.js';
import type { GateTier } from '../domain/gate/gate.js';
import { createPack, type Pack } from '../domain/pack/pack.js';

const SCRIPT_CANDIDATES = ['gate', 'noslop', 'quality'] as const;

interface PackageJson {
  scripts?: Record<string, string>;
}

export async function detectRepositoryGatePack(
  targetDir: string,
  fs: IFilesystem,
  tier: GateTier,
): Promise<Pack | null> {
  const packageJsonPath = `${targetDir.replace(/\\/g, '/')}/package.json`;
  if (!(await fs.exists(packageJsonPath))) {
    return null;
  }

  let packageJson: PackageJson;
  try {
    packageJson = JSON.parse(await fs.readFile(packageJsonPath)) as PackageJson;
  } catch {
    return null;
  }

  const scripts = packageJson.scripts ?? {};

  for (const prefix of SCRIPT_CANDIDATES) {
    const scriptName = `${prefix}:${tier}`;
    const body = scripts[scriptName];
    if (!body || looksRecursive(scriptName, body, tier)) {
      continue;
    }

    return createPack('repository', 'Repository Scripts', [
      createGate(scriptName, `npm run ${scriptName}`, tier),
    ]);
  }

  return null;
}

function looksRecursive(scriptName: string, body: string, tier: GateTier): boolean {
  const normalized = body.toLowerCase();
  const selfRefs = [
    `npm run ${scriptName}`,
    `pnpm ${scriptName}`,
    `pnpm run ${scriptName}`,
    `yarn ${scriptName}`,
    `bun run ${scriptName}`,
  ];

  if (selfRefs.some((entry) => normalized.includes(entry))) {
    return true;
  }

  return (
    normalized.includes('noslop check') ||
    (normalized.includes(`--tier=${tier}`) && normalized.includes('noslop')) ||
    normalized.includes('scripts/noslop')
  );
}
