import { createGate } from '../gate/gate.js';
import { createPack, type Pack } from '../pack/pack.js';

export const DOTNET_PACK: Pack = createPack('dotnet', '.NET / C#', [
  createGate('format-check', 'dotnet format --verify-no-changes', 'fast'),
  createGate('build', 'dotnet build /warnaserror', 'slow'),
  createGate('test', 'dotnet test', 'slow'),
  createGate(
    'ci-full',
    'dotnet format --verify-no-changes && dotnet build /warnaserror && dotnet test',
    'ci',
  ),
]);
