import type {
  IProcessRunner,
  RunOptions,
  RunResult,
} from '../../application/ports/process-runner.js';

export class DryRunProcessRunner implements IProcessRunner {
  private readonly recorded: string[] = [];

  get commands(): readonly string[] {
    return this.recorded;
  }

  async run(command: string, _cwd?: string, _options?: RunOptions): Promise<RunResult> {
    this.recorded.push(command);
    return { exitCode: 0, stdout: '', stderr: '' };
  }
}
