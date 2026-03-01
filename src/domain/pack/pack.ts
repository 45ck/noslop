import type { Gate } from '../gate/gate.js';

export type PackId = string & { readonly _brand: 'PackId' };

export type Pack = Readonly<{
  id: PackId;
  name: string;
  gates: readonly Gate[];
}>;

export function createPack(id: string, name: string, gates: readonly Gate[]): Pack {
  if (id.trim().length === 0) {
    throw new Error('Pack id must not be empty.');
  }
  if (name.trim().length === 0) {
    throw new Error('Pack name must not be empty.');
  }
  if (gates.length === 0) {
    throw new Error(`Pack '${id}' must define at least one gate.`);
  }
  const labels = gates.map((g) => g.label);
  const uniqueLabels = new Set(labels);
  if (uniqueLabels.size !== labels.length) {
    const duplicates = labels.filter((l, i) => labels.indexOf(l) !== i);
    throw new Error(
      `Pack '${id}' has duplicate gate labels: ${[...new Set(duplicates)].join(', ')}.`,
    );
  }
  return { id: id as PackId, name, gates };
}
