import path from 'node:path';
import { spawn } from 'node:child_process';
import type { IProcessRunner, RunResult } from '../../application/ports/process-runner.js';

export class NodeProcessRunner implements IProcessRunner {
  async run(command: string, cwd?: string): Promise<RunResult> {
    // shell:true is required because pack gate commands contain shell operators (&&, pipes).
    // Commands come exclusively from hardcoded pack definitions — never from user input —
    // so there is no command-injection surface here. Do not pass user-supplied strings
    // directly to this method without sanitization.
    const effectiveCwd = cwd ?? process.cwd();
    const binDir = path.join(effectiveCwd, 'node_modules', '.bin');
    const currentPath = process.env['PATH'] ?? '';
    const env = { ...process.env, PATH: `${binDir}${path.delimiter}${currentPath}` };

    return new Promise((resolve) => {
      const proc = spawn(command, {
        cwd,
        shell: true,
        stdio: 'pipe',
        env,
      });

      const stdoutChunks: Buffer[] = [];
      const stderrChunks: Buffer[] = [];

      proc.stdout.on('data', (chunk: Buffer) => stdoutChunks.push(chunk));
      proc.stderr.on('data', (chunk: Buffer) => stderrChunks.push(chunk));

      proc.on('error', (err) => {
        resolve({
          exitCode: 1,
          stdout: Buffer.concat(stdoutChunks).toString('utf8'),
          stderr: err.message,
        });
      });

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
