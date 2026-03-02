export type RunResult = Readonly<{
  exitCode: number;
  stdout: string;
  stderr: string;
}>;

export interface IProcessRunner {
  /**
   * Run a shell command and return the result.
   *
   * SECURITY: Implementations that use shell: true (e.g. NodeProcessRunner) pass
   * `command` directly to a shell. Only pass hardcoded strings — never user-supplied
   * input — to avoid shell injection.
   */
  run(command: string, cwd?: string): Promise<RunResult>;
}
