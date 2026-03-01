export type GateTier = 'fast' | 'slow' | 'ci';

export type Gate = Readonly<{
  label: string;
  command: string;
  tier: GateTier;
}>;

export function createGate(label: string, command: string, tier: GateTier): Gate {
  if (label.trim().length === 0) {
    throw new Error('Gate label must not be empty.');
  }
  if (command.trim().length === 0) {
    throw new Error('Gate command must not be empty.');
  }
  const validTiers: GateTier[] = ['fast', 'slow', 'ci'];
  if (!validTiers.includes(tier)) {
    throw new Error(
      `Invalid gate tier '${tier as string}'. Must be one of: ${validTiers.join(', ')}.`,
    );
  }
  return { label, command, tier };
}

export function isFast(gate: Gate): boolean {
  return gate.tier === 'fast';
}

export function isSlow(gate: Gate): boolean {
  return gate.tier === 'slow';
}

export function isCi(gate: Gate): boolean {
  return gate.tier === 'ci';
}

export function gatesForTier(gates: readonly Gate[], tier: GateTier): Gate[] {
  return gates.filter((g) => g.tier === tier);
}
