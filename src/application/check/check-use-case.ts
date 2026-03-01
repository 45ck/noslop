import type { Pack } from '../../domain/pack/pack.js';
import type { GateTier } from '../../domain/gate/gate.js';
import { gatesForTier } from '../../domain/gate/gate.js';
import type { IProcessRunner, RunResult } from '../ports/process-runner.js';

export type CheckCommand = Readonly<{
  targetDir: string;
  packs: readonly Pack[];
  tier: GateTier;
}>;

export type GateOutcome = Readonly<{
  label: string;
  command: string;
  result: RunResult;
  passed: boolean;
}>;

export type CheckResult = Readonly<{
  outcomes: readonly GateOutcome[];
  passed: boolean;
}>;

export async function check(command: CheckCommand, runner: IProcessRunner): Promise<CheckResult> {
  const outcomes: GateOutcome[] = [];

  for (const pack of command.packs) {
    const gates = gatesForTier(pack.gates, command.tier);

    for (const gate of gates) {
      let result: RunResult;
      try {
        result = await runner.run(gate.command, command.targetDir);
      } catch (err) {
        result = { exitCode: 1, stdout: '', stderr: String(err) };
      }
      outcomes.push({
        label: gate.label,
        command: gate.command,
        result,
        passed: result.exitCode === 0,
      });
    }
  }

  return {
    outcomes,
    passed: outcomes.every((o) => o.passed),
  };
}
