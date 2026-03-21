import { createGate } from '../../gate/gate.js';
import { createPack, type Pack } from '../../pack/pack.js';

export const TYPESCRIPT_PACK: Pack = createPack('typescript', 'TypeScript', [
  createGate('format-check', 'prettier . --check', 'fast'),
  createGate('lint', 'eslint . --max-warnings=0', 'fast'),
  createGate('spell', 'cspell --no-progress "src/**/*"', 'fast'),
  createGate('typecheck', 'tsc -p tsconfig.json --noEmit', 'slow'),
  createGate('test', 'vitest run', 'slow'),
  createGate('ci-full', 'npm run ci', 'ci'),
  createGate('mutation', 'npx stryker run', 'ci'),
]);
