import { describe, expect, it } from 'vitest';
import { detectPacks } from './cli.js';
import { InMemoryFilesystem } from '../infrastructure/adapters/in-memory-filesystem.js';
import { TYPESCRIPT_PACK } from '../domain/packs/typescript.js';
import { RUST_PACK } from '../domain/packs/rust.js';
import { DOTNET_PACK } from '../domain/packs/dotnet.js';
import { GO_PACK } from '../domain/packs/go.js';
import { PYTHON_PACK } from '../domain/packs/python.js';
import { JAVA_PACK } from '../domain/packs/java.js';
import { PHP_PACK } from '../domain/packs/php.js';
import { RUBY_PACK } from '../domain/packs/ruby.js';
import { SWIFT_PACK } from '../domain/packs/swift.js';
import { CPP_PACK } from '../domain/packs/cpp.js';
import { SCALA_PACK } from '../domain/packs/scala.js';
import { ELIXIR_PACK } from '../domain/packs/elixir.js';
import { DART_PACK } from '../domain/packs/dart.js';
import { ZIG_PACK } from '../domain/packs/zig.js';
import { HASKELL_PACK } from '../domain/packs/haskell.js';
import { OCAML_PACK } from '../domain/packs/ocaml.js';
import { KOTLIN_PACK } from '../domain/packs/kotlin.js';
import { LUA_PACK } from '../domain/packs/lua.js';

describe('detectPacks', () => {
  it('detects TypeScript pack when tsconfig.json exists', async () => {
    const fs = new InMemoryFilesystem();
    fs.seed('/project/tsconfig.json', '{}');

    const packs = await detectPacks('/project', fs);

    expect(packs).toEqual([TYPESCRIPT_PACK]);
  });

  it('detects TypeScript pack when package.json exists', async () => {
    const fs = new InMemoryFilesystem();
    fs.seed('/project/package.json', '{}');

    const packs = await detectPacks('/project', fs);

    expect(packs).toEqual([TYPESCRIPT_PACK]);
  });

  it('detects Rust pack when Cargo.toml exists', async () => {
    const fs = new InMemoryFilesystem();
    fs.seed('/project/Cargo.toml', '');

    const packs = await detectPacks('/project', fs);

    expect(packs).toEqual([RUST_PACK]);
  });

  it('detects dotnet pack when root .csproj file exists', async () => {
    const fs = new InMemoryFilesystem();
    fs.seed('/project/MyApp.csproj', '');

    const packs = await detectPacks('/project', fs);

    expect(packs).toEqual([DOTNET_PACK]);
  });

  it('detects dotnet pack when global.json exists', async () => {
    const fs = new InMemoryFilesystem();
    fs.seed('/project/global.json', '{}');

    const packs = await detectPacks('/project', fs);

    expect(packs).toEqual([DOTNET_PACK]);
  });

  it('returns TypeScript pack as default fallback for empty directory', async () => {
    const fs = new InMemoryFilesystem();

    const packs = await detectPacks('/project', fs);

    expect(packs).toEqual([TYPESCRIPT_PACK]);
  });

  it('detects TypeScript and Rust packs together in a monorepo', async () => {
    const fs = new InMemoryFilesystem();
    fs.seed('/project/tsconfig.json', '{}');
    fs.seed('/project/Cargo.toml', '');

    const packs = await detectPacks('/project', fs);

    expect(packs).toContain(TYPESCRIPT_PACK);
    expect(packs).toContain(RUST_PACK);
    expect(packs).toHaveLength(2);
  });

  it('detects all three packs together in a polyglot repo', async () => {
    const fs = new InMemoryFilesystem();
    fs.seed('/project/tsconfig.json', '{}');
    fs.seed('/project/Cargo.toml', '');
    fs.seed('/project/MyApp.csproj', '');

    const packs = await detectPacks('/project', fs);

    expect(packs).toHaveLength(3);
  });

  it('detects Go pack when go.mod exists', async () => {
    const fs = new InMemoryFilesystem();
    fs.seed('/project/go.mod', 'module example.com/myapp');
    const packs = await detectPacks('/project', fs);
    expect(packs).toContain(GO_PACK);
  });

  it('detects Python pack when pyproject.toml exists', async () => {
    const fs = new InMemoryFilesystem();
    fs.seed('/project/pyproject.toml', '[tool.poetry]');
    const packs = await detectPacks('/project', fs);
    expect(packs).toContain(PYTHON_PACK);
  });

  it('detects Python pack when requirements.txt exists', async () => {
    const fs = new InMemoryFilesystem();
    fs.seed('/project/requirements.txt', 'flask');
    const packs = await detectPacks('/project', fs);
    expect(packs).toContain(PYTHON_PACK);
  });

  it('detects Java pack when pom.xml exists', async () => {
    const fs = new InMemoryFilesystem();
    fs.seed('/project/pom.xml', '<project/>');
    const packs = await detectPacks('/project', fs);
    expect(packs).toContain(JAVA_PACK);
  });

  it('detects PHP pack when composer.json exists', async () => {
    const fs = new InMemoryFilesystem();
    fs.seed('/project/composer.json', '{}');
    const packs = await detectPacks('/project', fs);
    expect(packs).toContain(PHP_PACK);
  });

  it('detects Ruby pack when Gemfile exists', async () => {
    const fs = new InMemoryFilesystem();
    fs.seed('/project/Gemfile', 'source "https://rubygems.org"');
    const packs = await detectPacks('/project', fs);
    expect(packs).toContain(RUBY_PACK);
  });

  it('detects Swift pack when Package.swift exists', async () => {
    const fs = new InMemoryFilesystem();
    fs.seed('/project/Package.swift', '// swift-tools-version:5.9');
    const packs = await detectPacks('/project', fs);
    expect(packs).toContain(SWIFT_PACK);
  });

  it('detects C/C++ pack when CMakeLists.txt exists', async () => {
    const fs = new InMemoryFilesystem();
    fs.seed('/project/CMakeLists.txt', 'cmake_minimum_required(VERSION 3.20)');
    const packs = await detectPacks('/project', fs);
    expect(packs).toContain(CPP_PACK);
  });

  it('detects Scala pack when build.sbt exists', async () => {
    const fs = new InMemoryFilesystem();
    fs.seed('/project/build.sbt', 'name := "myapp"');
    const packs = await detectPacks('/project', fs);
    expect(packs).toContain(SCALA_PACK);
  });

  it('detects Elixir pack when mix.exs exists', async () => {
    const fs = new InMemoryFilesystem();
    fs.seed('/project/mix.exs', 'defmodule MyApp.MixProject do');
    const packs = await detectPacks('/project', fs);
    expect(packs).toContain(ELIXIR_PACK);
  });

  it('detects Dart pack when pubspec.yaml exists', async () => {
    const fs = new InMemoryFilesystem();
    fs.seed('/project/pubspec.yaml', 'name: myapp');
    const packs = await detectPacks('/project', fs);
    expect(packs).toContain(DART_PACK);
  });

  it('detects Zig pack when build.zig exists', async () => {
    const fs = new InMemoryFilesystem();
    fs.seed('/project/build.zig', 'const std = @import("std");');
    const packs = await detectPacks('/project', fs);
    expect(packs).toContain(ZIG_PACK);
  });

  it('detects Haskell pack when .cabal file exists', async () => {
    const fs = new InMemoryFilesystem();
    fs.seed('/project/myapp.cabal', 'name: myapp');
    const packs = await detectPacks('/project', fs);
    expect(packs).toContain(HASKELL_PACK);
  });

  it('detects OCaml pack when dune-project exists', async () => {
    const fs = new InMemoryFilesystem();
    fs.seed('/project/dune-project', '(lang dune 3.0)');
    const packs = await detectPacks('/project', fs);
    expect(packs).toContain(OCAML_PACK);
  });

  it('detects Kotlin pack when .kt file exists in src/', async () => {
    const fs = new InMemoryFilesystem();
    fs.seed('/project/build.gradle.kts', 'plugins { kotlin("jvm") }');
    fs.seed('/project/src/Main.kt', 'fun main() {}');
    const packs = await detectPacks('/project', fs);
    expect(packs).toContain(KOTLIN_PACK);
  });

  it('detects Lua pack when .rockspec file exists', async () => {
    const fs = new InMemoryFilesystem();
    fs.seed('/project/mylib-1.0-1.rockspec', 'package = "mylib"');
    const packs = await detectPacks('/project', fs);
    expect(packs).toContain(LUA_PACK);
  });
});
