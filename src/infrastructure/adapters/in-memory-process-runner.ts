import type {
  IProcessRunner,
  RunOptions,
  RunResult,
} from '../../application/ports/process-runner.js';

export class InMemoryProcessRunner implements IProcessRunner {
  private readonly exitCodes: Map<string, number>;
  private readonly stdouts = new Map<string, string>();
  private readonly stderrs = new Map<string, string>();

  constructor(exitCodes: Record<string, number> = {}) {
    this.exitCodes = new Map(Object.entries(exitCodes));
  }

  setStdout(command: string, stdout: string): void {
    this.stdouts.set(command, stdout);
  }

  setStderr(command: string, stderr: string): void {
    this.stderrs.set(command, stderr);
  }

  async run(command: string, _cwd?: string, _options?: RunOptions): Promise<RunResult> {
    const exitCode = this.exitCodes.get(command) ?? 0;
    const stdout = this.stdouts.get(command) ?? '';
    const stderr = this.stderrs.get(command) ?? '';
    return { exitCode, stdout, stderr };
  }
}
