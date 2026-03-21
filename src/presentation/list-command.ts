import chalk from 'chalk';
import { gatesForTier } from '../domain/gate/gate.js';
import type { GateTier } from '../domain/gate/gate.js';
import { ALL_PACKS } from './packs.js';

export function runList(json: boolean): void {
  if (json) {
    const output = ALL_PACKS.map((p) => ({
      id: p.id,
      name: p.name,
      gates: {
        fast: gatesForTier(p.gates, 'fast').map((g) => g.label),
        slow: gatesForTier(p.gates, 'slow').map((g) => g.label),
        ci: gatesForTier(p.gates, 'ci').map((g) => g.label),
      },
    }));
    console.log(JSON.stringify(output, null, 2));
    return;
  }

  const tiers: GateTier[] = ['fast', 'slow', 'ci'];
  const idWidth = Math.max(...ALL_PACKS.map((p) => p.id.length), 'Pack'.length);

  const header =
    chalk.bold('Pack'.padEnd(idWidth)) + tiers.map((t) => chalk.bold(`  ${t}`)).join('');
  console.log(header);
  console.log('-'.repeat(idWidth + tiers.length * 30));

  for (const pack of ALL_PACKS) {
    const fast = gatesForTier(pack.gates, 'fast').map((g) => g.label);
    const slow = gatesForTier(pack.gates, 'slow').map((g) => g.label);
    const ci = gatesForTier(pack.gates, 'ci').map((g) => g.label);
    const fmtFast = fast.length > 0 ? fast.join(', ') : chalk.dim('—');
    const fmtSlow = slow.length > 0 ? slow.join(', ') : chalk.dim('—');
    const fmtCi = ci.length > 0 ? ci.join(', ') : chalk.dim('—');
    console.log(
      `${pack.id.padEnd(idWidth)}  ${fmtFast.padEnd(28)}  ${fmtSlow.padEnd(28)}  ${fmtCi}`,
    );
  }
}
