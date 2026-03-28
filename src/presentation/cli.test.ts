import { describe, expect, it } from 'vitest';
import { detectPacks } from './packs.js';
import { InMemoryFilesystem } from '../infrastructure/adapters/in-memory-filesystem.js';
import { TYPESCRIPT_PACK } from '../domain/packs/typescript/typescript.js';
import { RUST_PACK } from '../domain/packs/rust/rust.js';
import { DOTNET_PACK } from '../domain/packs/dotnet/dotnet.js';
import { GO_PACK } from '../domain/packs/go/go.js';
import { PYTHON_PACK } from '../domain/packs/python/python.js';
import { JAVA_PACK } from '../domain/packs/java/java.js';
import { PHP_PACK } from '../domain/packs/php/php.js';
import { RUBY_PACK } from '../domain/packs/ruby/ruby.js';
import { SWIFT_PACK } from '../domain/packs/swift/swift.js';
import { CPP_PACK } from '../domain/packs/cpp/cpp.js';
import { SCALA_PACK } from '../domain/packs/scala/scala.js';
import { ELIXIR_PACK } from '../domain/packs/elixir/elixir.js';
import { DART_PACK } from '../domain/packs/dart/dart.js';
import { ZIG_PACK } from '../domain/packs/zig/zig.js';
import { HASKELL_PACK } from '../domain/packs/haskell/haskell.js';
import { OCAML_PACK } from '../domain/packs/ocaml/ocaml.js';
import { KOTLIN_PACK } from '../domain/packs/kotlin/kotlin.js';
import { LUA_PACK } from '../domain/packs/lua/lua.js';

async function detectWith(files: Record<string, string>) {
  const fs = new InMemoryFilesystem();
  for (const [path, content] of Object.entries(files)) {
    fs.seed(`/project/${path}`, content);
  }
  return detectPacks('/project', fs);
}

describe('detectPacks fallback and mixed repos', () => {
  it('defaults to TypeScript for empty directories and package.json-only repos', async () => {
    expect(await detectWith({})).toEqual([TYPESCRIPT_PACK]);
    expect(await detectWith({ 'package.json': '{}' })).toEqual([TYPESCRIPT_PACK]);
  });

  it('combines TypeScript, Rust, and dotnet detections in polyglot repos', async () => {
    const packs = await detectWith({
      'tsconfig.json': '{}',
      'Cargo.toml': '',
      'MyApp.csproj': '',
    });
    expect(packs).toContain(TYPESCRIPT_PACK);
    expect(packs).toContain(RUST_PACK);
    expect(packs).toContain(DOTNET_PACK);
  });

  it('does not infer TypeScript from package.json when a stronger pack is present', async () => {
    const packs = await detectWith({ 'composer.json': '{}', 'package.json': '{}' });
    expect(packs).toEqual([PHP_PACK]);
  });
});

describe('detectPacks language markers', () => {
  it.each([
    [{ 'tsconfig.json': '{}' }, TYPESCRIPT_PACK],
    [{ 'Cargo.toml': '' }, RUST_PACK],
    [{ 'MyApp.csproj': '' }, DOTNET_PACK],
    [{ 'global.json': '{}' }, DOTNET_PACK],
    [{ 'go.mod': 'module example.com/myapp' }, GO_PACK],
    [{ 'pyproject.toml': '[tool.poetry]' }, PYTHON_PACK],
    [{ 'requirements.txt': 'flask' }, PYTHON_PACK],
    [{ 'setup.py': 'from setuptools import setup' }, PYTHON_PACK],
    [{ 'pom.xml': '<project/>' }, JAVA_PACK],
    [{ 'composer.json': '{}' }, PHP_PACK],
    [{ Gemfile: 'source "https://rubygems.org"' }, RUBY_PACK],
    [{ 'Package.swift': '// swift-tools-version:5.9' }, SWIFT_PACK],
    [{ 'CMakeLists.txt': 'cmake_minimum_required(VERSION 3.20)' }, CPP_PACK],
    [{ 'build.sbt': 'name := "myapp"' }, SCALA_PACK],
    [{ 'mix.exs': 'defmodule MyApp.MixProject do' }, ELIXIR_PACK],
    [{ 'pubspec.yaml': 'name: myapp' }, DART_PACK],
    [{ 'build.zig': 'const std = @import("std");' }, ZIG_PACK],
    [{ 'myapp.cabal': 'name: myapp' }, HASKELL_PACK],
    [{ 'dune-project': '(lang dune 3.0)' }, OCAML_PACK],
    [{ 'mylib-1.0-1.rockspec': 'package = "mylib"' }, LUA_PACK],
  ])('detects the expected pack for %j', async (files, expectedPack) => {
    expect(await detectWith(files)).toContain(expectedPack);
  });
});

describe('detectPacks JVM and case-insensitive detection', () => {
  it('detects Java when Maven sources are Java-only and Kotlin when .kt files exist', async () => {
    const javaPacks = await detectWith({
      'pom.xml': '<project/>',
      'src/Main.java': 'class Main {}',
    });
    const kotlinPacks = await detectWith({
      'build.gradle.kts': 'plugins { kotlin("jvm") }',
      'src/Main.kt': 'fun main() {}',
    });

    expect(javaPacks).toContain(JAVA_PACK);
    expect(javaPacks).not.toContain(KOTLIN_PACK);
    expect(kotlinPacks).toContain(KOTLIN_PACK);
  });

  it('matches case-insensitive file extensions for dotnet and Haskell', async () => {
    expect(await detectWith({ 'MyApp.CSPROJ': '' })).toContain(DOTNET_PACK);
    expect(await detectWith({ 'myapp.Cabal': 'name: myapp' })).toContain(HASKELL_PACK);
  });
});
