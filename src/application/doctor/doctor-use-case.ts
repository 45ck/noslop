import type { Pack } from '../../domain/pack/pack.js';
import { getToolchainRequirements } from '../../domain/pack/toolchain.js';
import type { IFilesystem } from '../ports/filesystem.js';
import type { IProcessRunner, RunResult } from '../ports/process-runner.js';

export type DoctorCommand = Readonly<{
  targetDir: string;
  packs?: readonly Pack[];
  strict?: boolean;
}>;

export type DoctorCheck = Readonly<{
  name: string;
  passed: boolean;
  detail: string;
}>;

export type DoctorResult = Readonly<{
  checks: readonly DoctorCheck[];
  healthy: boolean;
}>;

type PresenceCheckDefinition = Readonly<{
  name: string;
  path: string;
  presentDetail: string;
  missingDetail: string;
}>;

export async function doctor(
  command: DoctorCommand,
  fs: IFilesystem,
  runner: IProcessRunner,
): Promise<DoctorResult> {
  const checks = await collectBaseChecks(command, fs, runner);

  if (command.packs && command.packs.length > 0) {
    const toolchainChecks = await runToolchainChecks(
      command.packs,
      command.targetDir,
      runner,
      command.strict ?? false,
    );
    checks.push(...toolchainChecks);
  }

  return {
    checks,
    healthy: checks.every((c) => c.passed),
  };
}

async function collectBaseChecks(
  command: DoctorCommand,
  fs: IFilesystem,
  runner: IProcessRunner,
): Promise<DoctorCheck[]> {
  const checks = [buildHooksPathCheck(await runCommandSafely(runner, command.targetDir))];
  const targetDir = command.targetDir;

  checks.push(
    await buildPresenceCheck(fs, {
      name: '.githooks directory',
      path: `${targetDir}/.githooks`,
      presentDetail: '.githooks/ present',
      missingDetail: '.githooks/ missing — run: noslop init',
    }),
  );

  const preCommitCheck = await buildExecutableCheck(fs, `${targetDir}/.githooks/pre-commit`);
  if (preCommitCheck) checks.push(preCommitCheck);

  const presenceChecks = await Promise.all(
    createPresenceCheckDefinitions(targetDir).map((definition) =>
      buildPresenceCheck(fs, definition),
    ),
  );
  checks.push(...presenceChecks);

  return checks;
}

function createPresenceCheckDefinitions(targetDir: string): readonly PresenceCheckDefinition[] {
  return [
    {
      name: '.github/workflows/quality.yml',
      path: `${targetDir}/.github/workflows/quality.yml`,
      presentDetail: 'quality.yml present',
      missingDetail: 'quality.yml missing — run: noslop init',
    },
    {
      name: '.claude/settings.json',
      path: `${targetDir}/.claude/settings.json`,
      presentDetail: '.claude/settings.json present',
      missingDetail: '.claude/settings.json missing — run: noslop init',
    },
    {
      name: '.claude/hooks directory',
      path: `${targetDir}/.claude/hooks`,
      presentDetail: '.claude/hooks/ present',
      missingDetail: '.claude/hooks/ missing — run: noslop init',
    },
    {
      name: 'AGENTS.md',
      path: `${targetDir}/AGENTS.md`,
      presentDetail: 'AGENTS.md present',
      missingDetail: 'AGENTS.md missing — run: noslop init',
    },
  ];
}

async function runCommandSafely(runner: IProcessRunner, targetDir: string): Promise<RunResult> {
  try {
    return await runner.run('git config core.hooksPath', targetDir);
  } catch (err) {
    return {
      exitCode: 1,
      stdout: '',
      stderr: err instanceof Error ? err.message : String(err),
    };
  }
}

function buildHooksPathCheck(result: RunResult): DoctorCheck {
  const hooksPath = result.stdout.replace(/\r?\n$/, '').trim();
  const configured = result.exitCode === 0 && hooksPath.length > 0;
  const expectedHooksPath = '.githooks';
  const pointsToNoslopHooks = configured && hooksPath === expectedHooksPath;
  return {
    name: 'git core.hooksPath',
    passed: pointsToNoslopHooks,
    detail: pointsToNoslopHooks
      ? `core.hooksPath = ${hooksPath}`
      : configured
        ? `core.hooksPath = ${hooksPath}; expected .githooks — run: noslop init`
        : result.exitCode === 0
          ? 'core.hooksPath is empty — run: noslop init'
          : 'core.hooksPath not set — run: noslop init',
  };
}

async function buildPresenceCheck(
  fs: IFilesystem,
  definition: PresenceCheckDefinition,
): Promise<DoctorCheck> {
  const exists = await fs.exists(definition.path);
  return {
    name: definition.name,
    passed: exists,
    detail: exists ? definition.presentDetail : definition.missingDetail,
  };
}

async function buildExecutableCheck(fs: IFilesystem, path: string): Promise<DoctorCheck | null> {
  if (!(await fs.exists(path))) return null;
  const executable = await fs.isExecutable(path);
  return {
    name: '.githooks/pre-commit permissions',
    passed: executable,
    detail: executable
      ? 'pre-commit is executable'
      : 'pre-commit is not executable — run: chmod +x .githooks/pre-commit',
  };
}

async function runToolchainChecks(
  packs: readonly Pack[],
  targetDir: string,
  runner: IProcessRunner,
  strict: boolean,
): Promise<DoctorCheck[]> {
  const results: DoctorCheck[] = [];
  for (const pack of packs) {
    const requirements = getToolchainRequirements(pack.id);
    for (const req of requirements) {
      let found = false;
      try {
        const result = await runner.run(req.versionCommand, targetDir);
        found = result.exitCode === 0;
      } catch {
        found = false;
      }
      results.push({
        name: `toolchain: ${pack.id}/${req.binary}`,
        passed: found || !strict,
        detail: found ? `${req.binary} found` : `${req.binary} not found — ${req.installHint}`,
      });
    }
  }
  return results;
}
