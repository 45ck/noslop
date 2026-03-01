export type RunResult = Readonly<{
  exitCode: number;
  stdout: string;
  stderr: string;
}>;

export interface IProcessRunner {
  run(command: string, cwd?: string): Promise<RunResult>;
}
