import type { Pack } from '../../domain/pack/pack.js';
import { getToolchainRequirements } from '../../domain/pack/toolchain.js';
import type { IFilesystem } from '../ports/filesystem.js';
import type { IProcessRunner } from '../ports/process-runner.js';

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

export async function doctor(
  command: DoctorCommand,
  fs: IFilesystem,
  runner: IProcessRunner,
): Promise<DoctorResult> {
  const checks: DoctorCheck[] = [];

  let hooksPathResult;
  try {
    hooksPathResult = await runner.run('git config core.hooksPath', command.targetDir);
  } catch (err) {
    hooksPathResult = {
      exitCode: 1,
      stdout: '',
      stderr: err instanceof Error ? err.message : String(err),
    };
  }
  const hooksPath = hooksPathResult.stdout.replace(/\r?\n$/, '').trim();
  checks.push({
    name: 'git core.hooksPath',
    passed: hooksPathResult.exitCode === 0 && hooksPath.length > 0,
    detail:
      hooksPathResult.exitCode === 0 && hooksPath.length > 0
        ? `core.hooksPath = ${hooksPath}`
        : hooksPathResult.exitCode === 0
          ? 'core.hooksPath is empty — run: noslop init'
          : 'core.hooksPath not set — run: noslop init',
  });

  const hooksDir = `${command.targetDir}/.githooks`;
  const hooksDirExists = await fs.exists(hooksDir);
  checks.push({
    name: '.githooks directory',
    passed: hooksDirExists,
    detail: hooksDirExists ? '.githooks/ present' : '.githooks/ missing — run: noslop init',
  });

  const preCommitPath = `${command.targetDir}/.githooks/pre-commit`;
  if (await fs.exists(preCommitPath)) {
    const executable = await fs.isExecutable(preCommitPath);
    checks.push({
      name: '.githooks/pre-commit permissions',
      passed: executable,
      detail: executable
        ? 'pre-commit is executable'
        : 'pre-commit is not executable — run: chmod +x .githooks/pre-commit',
    });
  }

  const ciWorkflow = `${command.targetDir}/.github/workflows/quality.yml`;
  const ciExists = await fs.exists(ciWorkflow);
  checks.push({
    name: '.github/workflows/quality.yml',
    passed: ciExists,
    detail: ciExists ? 'quality.yml present' : 'quality.yml missing — run: noslop init',
  });

  const claudeSettings = `${command.targetDir}/.claude/settings.json`;
  const claudeExists = await fs.exists(claudeSettings);
  checks.push({
    name: '.claude/settings.json',
    passed: claudeExists,
    detail: claudeExists
      ? '.claude/settings.json present'
      : '.claude/settings.json missing — run: noslop init',
  });

  const claudeHooks = `${command.targetDir}/.claude/hooks`;
  const claudeHooksExists = await fs.exists(claudeHooks);
  checks.push({
    name: '.claude/hooks directory',
    passed: claudeHooksExists,
    detail: claudeHooksExists
      ? '.claude/hooks/ present'
      : '.claude/hooks/ missing — run: noslop init',
  });

  const agentsMd = `${command.targetDir}/AGENTS.md`;
  const agentsExists = await fs.exists(agentsMd);
  checks.push({
    name: 'AGENTS.md',
    passed: agentsExists,
    detail: agentsExists ? 'AGENTS.md present' : 'AGENTS.md missing — run: noslop init',
  });

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
