import { createGate } from '../../gate/gate.js';
import { createPack, type Pack } from '../../pack/pack.js';

export const ELIXIR_PACK: Pack = createPack('elixir', 'Elixir', [
  createGate('format-check', 'mix format --check-formatted', 'fast'),
  createGate('lint', 'mix credo --strict', 'fast'),
  createGate('spell', 'typos', 'fast'),
  createGate('typecheck', 'mix dialyzer', 'slow'),
  createGate('test', 'mix test', 'slow'),
  createGate(
    'ci-full',
    'mix format --check-formatted && mix credo --strict && typos && mix dialyzer && mix test',
    'ci',
  ),
]);
