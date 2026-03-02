import { createGate } from '../gate/gate.js';
import { createPack, type Pack } from '../pack/pack.js';

export const LUA_PACK: Pack = createPack('lua', 'Lua', [
  createGate('format-check', 'stylua --check .', 'fast'),
  createGate('lint', 'luacheck .', 'fast'),
  createGate('test', 'busted', 'slow'),
  createGate('ci-full', 'stylua --check . && luacheck . && busted', 'ci'),
]);
