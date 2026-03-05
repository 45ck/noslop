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
    hooksPathResult = {
      exitCode: 1,
      stdout: '',
      stderr: err instanceof Error ? err.message : String(err),
    };
  }
  const hooksPath = hooksPathResult.stdout.replace(/\r?\n$/, '').trim();
  checks.push({
    name: 'git core.hooksPath',
    passed: hooksPathResult.exitCode === 0 && isNoslopHooksPath(hooksPath),
    detail:
      hooksPathResult.exitCode === 0 && isNoslopHooksPath(hooksPath)
        ? `core.hooksPath = ${hooksPath}`
        : hooksPathResult.exitCode === 0
          ? hooksPath.length === 0
            ? 'core.hooksPath is empty — run: noslop init'
            : `core.hooksPath points to '${hooksPath}' instead of .githooks — run: noslop init`
          : 'core.hooksPath not set — run: noslop init',
  });

  await pushFileCheck(checks, fs, `${command.targetDir}/.githooks/pre-commit`, 'pre-commit');
  await pushFileCheck(checks, fs, `${command.targetDir}/.githooks/pre-push`, 'pre-push');
  await pushFileCheck(checks, fs, `${command.targetDir}/.githooks/commit-msg`, 'commit-msg');
  await pushFileCheck(
    checks,
    fs,
    `${command.targetDir}/.github/workflows/quality.yml`,
    '.github/workflows/quality.yml',
  );
  await pushFileCheck(
    checks,
    fs,
    `${command.targetDir}/.github/workflows/guardrails.yml`,
    '.github/workflows/guardrails.yml',
  );
  await pushFileCheck(
    checks,
    fs,
    `${command.targetDir}/.claude/settings.json`,
    '.claude/settings.json',
  );
  await pushFileCheck(
    checks,
    fs,
    `${command.targetDir}/.claude/hooks/pre-tool-use.sh`,
    '.claude/hooks/pre-tool-use.sh',
  );
  await pushFileCheck(checks, fs, `${command.targetDir}/AGENTS.md`, 'AGENTS.md');

  return {
    checks,
    healthy: checks.every((c) => c.passed),
  };
}

async function pushFileCheck(
  checks: DoctorCheck[],
  fs: IFilesystem,
  path: string,
  label: string,
): Promise<void> {
  const exists = await fs.exists(path);
  checks.push({
    name: label,
    passed: exists,
    detail: exists ? `${label} present` : `${label} missing — run: noslop init`,
  });
}

function isNoslopHooksPath(hooksPath: string): boolean {
  const normalized = hooksPath.replace(/\\/g, '/').replace(/\/+$/, '');
  return (
    normalized === '.githooks' || normalized === './.githooks' || normalized.endsWith('/.githooks')
  );
}
