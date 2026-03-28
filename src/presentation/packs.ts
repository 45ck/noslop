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

type DetectionSignals = Readonly<{
  rootEntries: readonly string[];
  hasTypeScript: boolean;
  hasRust: boolean;
  hasDotnetProject: boolean;
  hasGlobalJson: boolean;
  hasGo: boolean;
  hasPython: boolean;
  hasMaven: boolean;
  hasGradle: boolean;
  hasComposer: boolean;
  hasGemfile: boolean;
  hasSwiftPackage: boolean;
  hasCMakeLists: boolean;
  hasBuildSbt: boolean;
  hasMixExs: boolean;
  hasPubspec: boolean;
  hasBuildZig: boolean;
  hasDuneProject: boolean;
}>;

export async function detectPacks(targetDir: string, fs: IFilesystem): Promise<Pack[]> {
  const detected: Pack[] = [];
  const signals = await collectDetectionSignals(targetDir, fs);
  const detections = await buildDetections(targetDir, fs, signals);
  for (const detection of detections) {
    if (detection.detected) detected.push(detection.pack);
  }
  return detected.length > 0 ? detected : [TYPESCRIPT_PACK];
}

async function collectDetectionSignals(
  targetDir: string,
  fs: IFilesystem,
): Promise<DetectionSignals> {
  const rootEntries = await readDirSafe(targetDir, fs);
  return {
    rootEntries,
    hasTypeScript: await fs.exists(`${targetDir}/tsconfig.json`),
    hasRust: await fs.exists(`${targetDir}/Cargo.toml`),
    hasDotnetProject: hasAnyMatchingEntry(rootEntries, ['.csproj', '.sln']),
    hasGlobalJson: await fs.exists(`${targetDir}/global.json`),
    hasGo: await fs.exists(`${targetDir}/go.mod`),
    hasPython: await existsAny(fs, targetDir, ['pyproject.toml', 'setup.py', 'requirements.txt']),
    hasMaven: await fs.exists(`${targetDir}/pom.xml`),
    hasGradle: await existsAny(fs, targetDir, ['build.gradle', 'build.gradle.kts']),
    hasComposer: await fs.exists(`${targetDir}/composer.json`),
    hasGemfile: await fs.exists(`${targetDir}/Gemfile`),
    hasSwiftPackage: await fs.exists(`${targetDir}/Package.swift`),
    hasCMakeLists: await fs.exists(`${targetDir}/CMakeLists.txt`),
    hasBuildSbt: await fs.exists(`${targetDir}/build.sbt`),
    hasMixExs: await fs.exists(`${targetDir}/mix.exs`),
    hasPubspec: await fs.exists(`${targetDir}/pubspec.yaml`),
    hasBuildZig: await fs.exists(`${targetDir}/build.zig`),
    hasDuneProject: await fs.exists(`${targetDir}/dune-project`),
  };
}

async function buildDetections(
  targetDir: string,
  fs: IFilesystem,
  signals: DetectionSignals,
): Promise<readonly Readonly<{ pack: Pack; detected: boolean }>[]> {
  return [
    { pack: TYPESCRIPT_PACK, detected: signals.hasTypeScript },
    { pack: RUST_PACK, detected: signals.hasRust },
    { pack: DOTNET_PACK, detected: signals.hasDotnetProject || signals.hasGlobalJson },
    { pack: GO_PACK, detected: signals.hasGo },
    { pack: PYTHON_PACK, detected: signals.hasPython },
    {
      pack: await detectJvmPack(targetDir, fs, signals.hasMaven || signals.hasGradle),
      detected: signals.hasMaven || signals.hasGradle,
    },
    { pack: PHP_PACK, detected: signals.hasComposer },
    { pack: RUBY_PACK, detected: signals.hasGemfile },
    { pack: SWIFT_PACK, detected: signals.hasSwiftPackage },
    { pack: CPP_PACK, detected: signals.hasCMakeLists },
    { pack: SCALA_PACK, detected: signals.hasBuildSbt },
    { pack: ELIXIR_PACK, detected: signals.hasMixExs },
    { pack: DART_PACK, detected: signals.hasPubspec },
    { pack: ZIG_PACK, detected: signals.hasBuildZig },
    { pack: HASKELL_PACK, detected: hasAnyMatchingEntry(signals.rootEntries, ['.cabal']) },
    {
      pack: LUA_PACK,
      detected:
        (await fs.exists(`${targetDir}/rockspec`)) ||
        hasAnyMatchingEntry(signals.rootEntries, ['.rockspec']),
    },
    { pack: OCAML_PACK, detected: signals.hasDuneProject },
  ];
}

async function detectJvmPack(
  targetDir: string,
  fs: IFilesystem,
  hasJvmBuildFiles: boolean,
): Promise<Pack> {
  if (!hasJvmBuildFiles) return JAVA_PACK;
  const srcEntries = await readDirSafe(`${targetDir}/src`, fs);
  return hasAnyMatchingEntry(srcEntries, ['.kt']) ? KOTLIN_PACK : JAVA_PACK;
}

async function existsAny(
  fs: IFilesystem,
  targetDir: string,
  fileNames: readonly string[],
): Promise<boolean> {
  for (const fileName of fileNames) {
    if (await fs.exists(`${targetDir}/${fileName}`)) return true;
  }
  return false;
}

async function readDirSafe(targetPath: string, fs: IFilesystem): Promise<string[]> {
  try {
    return await fs.readdir(targetPath);
  } catch {
    return [];
  }
}

function hasAnyMatchingEntry(entries: readonly string[], suffixes: readonly string[]): boolean {
  return entries.some((entry) => {
    const lower = entry.toLowerCase();
    return suffixes.some((suffix) => lower.endsWith(suffix));
  });
}
