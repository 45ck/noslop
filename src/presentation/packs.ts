import { TYPESCRIPT_PACK } from '../domain/packs/typescript/typescript.js';
import { RUST_PACK } from '../domain/packs/rust/rust.js';
import { DOTNET_PACK } from '../domain/packs/dotnet/dotnet.js';
import { JAVASCRIPT_PACK } from '../domain/packs/javascript/javascript.js';
import { GO_PACK } from '../domain/packs/go/go.js';
import { PYTHON_PACK } from '../domain/packs/python/python.js';
import { JAVA_PACK } from '../domain/packs/java/java.js';
import { PHP_PACK } from '../domain/packs/php/php.js';
import { RUBY_PACK } from '../domain/packs/ruby/ruby.js';
import { SWIFT_PACK } from '../domain/packs/swift/swift.js';
import { KOTLIN_PACK } from '../domain/packs/kotlin/kotlin.js';
import { CPP_PACK } from '../domain/packs/cpp/cpp.js';
import { SCALA_PACK } from '../domain/packs/scala/scala.js';
import { ELIXIR_PACK } from '../domain/packs/elixir/elixir.js';
import { DART_PACK } from '../domain/packs/dart/dart.js';
import { ZIG_PACK } from '../domain/packs/zig/zig.js';
import { HASKELL_PACK } from '../domain/packs/haskell/haskell.js';
import { LUA_PACK } from '../domain/packs/lua/lua.js';
import { OCAML_PACK } from '../domain/packs/ocaml/ocaml.js';
import type { Pack } from '../domain/pack/pack.js';
import type { IFilesystem } from '../application/ports/filesystem.js';

export const ALL_PACKS: Pack[] = [
  TYPESCRIPT_PACK,
  RUST_PACK,
  DOTNET_PACK,
  JAVASCRIPT_PACK,
  GO_PACK,
  PYTHON_PACK,
  JAVA_PACK,
  PHP_PACK,
  RUBY_PACK,
  SWIFT_PACK,
  KOTLIN_PACK,
  CPP_PACK,
  SCALA_PACK,
  ELIXIR_PACK,
  DART_PACK,
  ZIG_PACK,
  HASKELL_PACK,
  LUA_PACK,
  OCAML_PACK,
];

export async function detectPacks(targetDir: string, fs: IFilesystem): Promise<Pack[]> {
  const detected: Pack[] = [];

  // TypeScript detection also covers pure JavaScript repos (both use package.json).
  // For repos that explicitly don't use TypeScript, use --pack=javascript.
  const tsIndicators = ['tsconfig.json', 'package.json'];
  for (const indicator of tsIndicators) {
    if (await fs.exists(`${targetDir}/${indicator}`)) {
      detected.push(TYPESCRIPT_PACK);
      break;
    }
  }

  if (await fs.exists(`${targetDir}/Cargo.toml`)) {
    detected.push(RUST_PACK);
  }

  const rootEntries = await fs.readdir(targetDir).catch(() => []);
  const hasDotnet = rootEntries.some((e) => e.endsWith('.csproj') || e.endsWith('.sln'));
  const hasGlobalJson = await fs.exists(`${targetDir}/global.json`);
  if (hasDotnet || hasGlobalJson) detected.push(DOTNET_PACK);

  if (await fs.exists(`${targetDir}/go.mod`)) {
    detected.push(GO_PACK);
  }

  if (
    (await fs.exists(`${targetDir}/pyproject.toml`)) ||
    (await fs.exists(`${targetDir}/setup.py`)) ||
    (await fs.exists(`${targetDir}/requirements.txt`))
  ) {
    detected.push(PYTHON_PACK);
  }

  const hasMaven = await fs.exists(`${targetDir}/pom.xml`);
  const hasGradle =
    (await fs.exists(`${targetDir}/build.gradle`)) ||
    (await fs.exists(`${targetDir}/build.gradle.kts`));
  if (hasMaven || hasGradle) {
    // Distinguish Java from Kotlin: check for .kt files in src/
    const srcEntries = await fs.readdir(`${targetDir}/src`).catch(() => []);
    const hasKotlinSrc = srcEntries.some((e) => e.endsWith('.kt'));
    if (hasKotlinSrc) {
      detected.push(KOTLIN_PACK);
    } else {
      detected.push(JAVA_PACK);
    }
  }

  const hasComposer = await fs.exists(`${targetDir}/composer.json`);
  if (hasComposer) {
    detected.push(PHP_PACK);
  }

  const hasGemfile = await fs.exists(`${targetDir}/Gemfile`);
  if (hasGemfile) {
    detected.push(RUBY_PACK);
  }

  const hasPackageSwift = await fs.exists(`${targetDir}/Package.swift`);
  if (hasPackageSwift) {
    detected.push(SWIFT_PACK);
  }

  const hasCMakeLists = await fs.exists(`${targetDir}/CMakeLists.txt`);
  if (hasCMakeLists) {
    detected.push(CPP_PACK);
  }

  const hasBuildSbt = await fs.exists(`${targetDir}/build.sbt`);
  if (hasBuildSbt) {
    detected.push(SCALA_PACK);
  }

  const hasMixExs = await fs.exists(`${targetDir}/mix.exs`);
  if (hasMixExs) {
    detected.push(ELIXIR_PACK);
  }

  const hasPubspec = await fs.exists(`${targetDir}/pubspec.yaml`);
  if (hasPubspec) {
    detected.push(DART_PACK);
  }

  const hasBuildZig = await fs.exists(`${targetDir}/build.zig`);
  if (hasBuildZig) {
    detected.push(ZIG_PACK);
  }

  const hasCabalFile = rootEntries.some((e) => e.endsWith('.cabal'));
  if (hasCabalFile) {
    detected.push(HASKELL_PACK);
  }

  const hasLuaRock =
    (await fs.exists(`${targetDir}/rockspec`)) || rootEntries.some((e) => e.endsWith('.rockspec'));
  if (hasLuaRock) {
    detected.push(LUA_PACK);
  }

  const hasDuneProject = await fs.exists(`${targetDir}/dune-project`);
  if (hasDuneProject) {
    detected.push(OCAML_PACK);
  }

  return detected.length > 0 ? detected : [TYPESCRIPT_PACK];
}
