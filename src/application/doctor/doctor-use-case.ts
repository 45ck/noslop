import type { IFilesystem } from '../ports/filesystem.js';
import type { IProcessRunner } from '../ports/process-runner.js';

export type DoctorCommand = Readonly<{
  targetDir: string;
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
    hooksPathResult = { exitCode: 1, stdout: '', stderr: String(err) };
  }
  const hooksPath = hooksPathResult.stdout.replace(/\r?\n$/, '').trim();
  checks.push({
    name: 'git core.hooksPath',
    passed: hooksPathResult.exitCode === 0 && hooksPath.length > 0,
    detail:
      hooksPathResult.exitCode === 0
        ? `core.hooksPath = ${hooksPath}`
        : 'core.hooksPath not set — run: noslop init',
  });

  const hooksDir = `${command.targetDir}/.githooks`;
  const hooksDirExists = await fs.exists(hooksDir);
  checks.push({
    name: '.githooks directory',
    passed: hooksDirExists,
    detail: hooksDirExists ? '.githooks/ present' : '.githooks/ missing — run: noslop init',
  });

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

  return {
    checks,
    healthy: checks.every((c) => c.passed),
  };
}
