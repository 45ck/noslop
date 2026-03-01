import { createGate } from '../gate/gate.js';
import { createPack, type Pack } from '../pack/pack.js';

export const RUST_PACK: Pack = createPack('rust', 'Rust', [
  createGate('format-check', 'cargo fmt --check', 'fast'),
  createGate('lint', 'cargo clippy -- -D warnings', 'fast'),
  createGate('test', 'cargo test', 'slow'),
  createGate('ci-full', 'cargo fmt --check && cargo clippy -- -D warnings && cargo test', 'ci'),
]);
