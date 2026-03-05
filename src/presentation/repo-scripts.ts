import type { IFilesystem } from '../application/ports/filesystem.js';
import { createGate } from '../domain/gate/gate.js';
import type { GateTier } from '../domain/gate/gate.js';
import { createPack, type Pack } from '../domain/pack/pack.js';

const SCRIPT_CANDIDATES = ['gate', 'noslop', 'quality'] as const;

interface PackageJson {
  packageManager?: string;
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
  const scriptRunner = await detectScriptRunner(targetDir, fs, packageJson);

  for (const prefix of SCRIPT_CANDIDATES) {
    const scriptName = `${prefix}:${tier}`;
    const body = scripts[scriptName];
    if (!body || looksRecursive(scriptName, body, tier)) {
      continue;
    }

    return createPack('repository', 'Repository Scripts', [
      createGate(scriptName, `${scriptRunner} ${scriptName}`, tier),
    ]);
  }

  return null;
}

async function detectScriptRunner(
  targetDir: string,
  fs: IFilesystem,
  packageJson: PackageJson,
): Promise<string> {
  const explicitRunner = parsePackageManager(packageJson.packageManager);
  if (explicitRunner) {
    return explicitRunner;
  }

  const candidates: readonly (readonly [string, string])[] = [
    ['bun.lock', 'bun run'],
    ['bun.lockb', 'bun run'],
    ['pnpm-lock.yaml', 'pnpm run'],
    ['yarn.lock', 'yarn'],
    ['package-lock.json', 'npm run'],
    ['npm-shrinkwrap.json', 'npm run'],
  ];

  for (const [fileName, runner] of candidates) {
    const lockPath = `${targetDir.replace(/\\/g, '/')}/${fileName}`;
    if (await fs.exists(lockPath)) {
      return runner;
    }
  }

  return 'npm run';
}

function parsePackageManager(packageManager: string | undefined): string | null {
  if (!packageManager) {
    return null;
  }

  const name = packageManager.split('@')[0]?.toLowerCase();
  switch (name) {
    case 'bun':
      return 'bun run';
    case 'pnpm':
      return 'pnpm run';
    case 'yarn':
      return 'yarn';
    case 'npm':
      return 'npm run';
    default:
      return null;
  }
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
