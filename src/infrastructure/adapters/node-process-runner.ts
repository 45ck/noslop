import { spawn } from 'node:child_process';
import type { IProcessRunner, RunResult } from '../../application/ports/process-runner.js';

export class NodeProcessRunner implements IProcessRunner {
  async run(command: string, cwd?: string): Promise<RunResult> {
    return new Promise((resolve) => {
      const proc = spawn(command, {
        cwd,
        shell: true,
        stdio: 'pipe',
      });

      const stdoutChunks: Buffer[] = [];
      const stderrChunks: Buffer[] = [];

      proc.stdout.on('data', (chunk: Buffer) => stdoutChunks.push(chunk));
      proc.stderr.on('data', (chunk: Buffer) => stderrChunks.push(chunk));

      proc.on('close', (code) => {
        resolve({
          exitCode: code ?? 1,
          stdout: Buffer.concat(stdoutChunks).toString('utf8'),
          stderr: Buffer.concat(stderrChunks).toString('utf8'),
        });
      });
    });
  }
}
