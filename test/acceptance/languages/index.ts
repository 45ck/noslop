import type { LanguageFixture } from '../harness/types.js';
import { typescriptFixture } from './typescript.js';
import { javascriptFixture } from './javascript.js';
import { rustFixture } from './rust.js';
import { pythonFixture } from './python.js';
import { goFixture } from './go.js';
import { javaFixture } from './java.js';
import { kotlinFixture } from './kotlin.js';
import { dotnetFixture } from './dotnet.js';
import { rubyFixture } from './ruby.js';
import { phpFixture } from './php.js';
import { swiftFixture } from './swift.js';
import { scalaFixture } from './scala.js';
import { elixirFixture } from './elixir.js';
import { dartFixture } from './dart.js';
import { haskellFixture } from './haskell.js';
import { luaFixture } from './lua.js';
import { cppFixture } from './cpp.js';
import { zigFixture } from './zig.js';
import { ocamlFixture } from './ocaml.js';

export const ALL_FIXTURES: readonly LanguageFixture[] = [
  typescriptFixture,
  javascriptFixture,
  rustFixture,
  pythonFixture,
  goFixture,
  javaFixture,
  kotlinFixture,
  dotnetFixture,
  rubyFixture,
  phpFixture,
  swiftFixture,
  scalaFixture,
  elixirFixture,
  dartFixture,
  haskellFixture,
  luaFixture,
  cppFixture,
  zigFixture,
  ocamlFixture,
];
