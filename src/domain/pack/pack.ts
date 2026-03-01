import type { Gate } from '../gate/gate.js';

export type PackId = string;

export type Pack = Readonly<{
  id: PackId;
  name: string;
  gates: readonly Gate[];
}>;

export function createPack(id: PackId, name: string, gates: readonly Gate[]): Pack {
  if (id.trim().length === 0) {
    throw new Error('Pack id must not be empty.');
  }
  if (name.trim().length === 0) {
    throw new Error('Pack name must not be empty.');
  }
  return { id, name, gates };
}

export function packGates(pack: Pack): readonly Gate[] {
  return pack.gates;
}
