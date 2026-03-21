import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import type {
  IProcessRunner,
  RunOptions,
  RunResult,
} from '../../application/ports/process-runner.js';

const DEFAULT_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

function killProcessTree(pid: number): void {
  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/T', '/F', '/PID', String(pid)], { stdio: 'ignore' });
  } else {
    try {
      process.kill(-pid, 'SIGKILL');
    } catch {
      process.kill(pid, 'SIGKILL');
    }
  }
}

export class NodeProcessRunner implements IProcessRunner {
  async run(command: string, cwd?: string, options?: RunOptions): Promise<RunResult> {
    // shell:true is required because pack gate commands contain shell operators (&&, pipes).
    // Commands come exclusively from hardcoded pack definitions — never from user input —
    // so there is no command-injection surface here. Do not pass user-supplied strings
    // directly to this method without sanitization.
    const effectiveCwd = options?.cwd ?? cwd ?? process.cwd();
    const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const binDir = path.join(effectiveCwd, 'node_modules', '.bin');
    const currentPath = process.env['PATH'] ?? '';
    const env = { ...process.env, PATH: `${binDir}${path.delimiter}${currentPath}` };

    return new Promise((resolve) => {
      const proc = spawn(command, {
        cwd: effectiveCwd,
        shell: true,
        stdio: 'pipe',
        env,
        detached: process.platform !== 'win32',
      });

      const stdoutChunks: Buffer[] = [];
      const stderrChunks: Buffer[] = [];
      let timedOut = false;

      const timer = setTimeout(() => {
        timedOut = true;
        if (proc.pid !== undefined) killProcessTree(proc.pid);
      }, timeoutMs);

      proc.stdout.on('data', (chunk: Buffer) => stdoutChunks.push(chunk));
      proc.stderr.on('data', (chunk: Buffer) => stderrChunks.push(chunk));

      proc.on('error', (err) => {
        clearTimeout(timer);
        resolve({
          exitCode: 1,
          stdout: Buffer.concat(stdoutChunks).toString('utf8'),
          stderr: err.message,
        });
      });

      proc.on('close', (code) => {
        clearTimeout(timer);
        const stderr = Buffer.concat(stderrChunks).toString('utf8');
        resolve({
          exitCode: code ?? 1,
          stdout: Buffer.concat(stdoutChunks).toString('utf8'),
          stderr: timedOut ? `Gate timed out after ${timeoutMs}ms\n${stderr}` : stderr,
        });
      });
    });
  }
}
