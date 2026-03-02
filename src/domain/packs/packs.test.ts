import { describe, expect, it } from 'vitest';
import type { Pack } from '../pack/pack.js';
import { DOTNET_PACK } from './dotnet.js';
import { RUST_PACK } from './rust.js';
import { TYPESCRIPT_PACK } from './typescript.js';
import { JAVASCRIPT_PACK } from './javascript.js';
import { GO_PACK } from './go.js';
import { PYTHON_PACK } from './python.js';
import { JAVA_PACK } from './java.js';
import { PHP_PACK } from './php.js';
import { RUBY_PACK } from './ruby.js';
import { SWIFT_PACK } from './swift.js';
import { KOTLIN_PACK } from './kotlin.js';
import { CPP_PACK } from './cpp.js';
import { SCALA_PACK } from './scala.js';
import { ELIXIR_PACK } from './elixir.js';
import { DART_PACK } from './dart.js';
import { ZIG_PACK } from './zig.js';
import { HASKELL_PACK } from './haskell.js';
import { LUA_PACK } from './lua.js';
import { OCAML_PACK } from './ocaml.js';

const gate = (pack: Pack, label: string) => pack.gates.find((g) => g.label === label);

describe('TYPESCRIPT_PACK', () => {
  it('has correct id and name', () => {
    expect(TYPESCRIPT_PACK.id).toBe('typescript');
    expect(TYPESCRIPT_PACK.name).toBe('TypeScript');
  });

  it('has a format-check gate with correct command and tier', () => {
    const g = gate(TYPESCRIPT_PACK, 'format-check');
    expect(g).toBeDefined();
    expect(g?.command).toBe('prettier . --check');
    expect(g?.tier).toBe('fast');
  });

  it('has a lint gate with correct command and tier', () => {
    const g = gate(TYPESCRIPT_PACK, 'lint');
    expect(g).toBeDefined();
    expect(g?.command).toBe('eslint . --max-warnings=0');
    expect(g?.tier).toBe('fast');
  });

  it('has a spell gate with tier fast', () => {
    expect(gate(TYPESCRIPT_PACK, 'spell')?.tier).toBe('fast');
  });

  it('has a typecheck gate with tier slow', () => {
    expect(gate(TYPESCRIPT_PACK, 'typecheck')?.tier).toBe('slow');
  });

  it('has a test gate with tier slow', () => {
    expect(gate(TYPESCRIPT_PACK, 'test')?.tier).toBe('slow');
  });

  it('has a ci-full gate with tier ci', () => {
    expect(gate(TYPESCRIPT_PACK, 'ci-full')?.tier).toBe('ci');
  });
});

describe('RUST_PACK', () => {
  it('has correct id and name', () => {
    expect(RUST_PACK.id).toBe('rust');
    expect(RUST_PACK.name).toBe('Rust');
  });

  it('format-check gate is fast and contains cargo fmt', () => {
    const g = gate(RUST_PACK, 'format-check');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toContain('cargo fmt');
  });

  it('lint gate is fast and contains cargo clippy', () => {
    const g = gate(RUST_PACK, 'lint');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toContain('cargo clippy');
  });

  it('test gate is slow and contains cargo test', () => {
    const g = gate(RUST_PACK, 'test');
    expect(g?.tier).toBe('slow');
    expect(g?.command).toContain('cargo test');
  });

  it('has a ci-full gate with tier ci', () => {
    expect(gate(RUST_PACK, 'ci-full')?.tier).toBe('ci');
  });
});

describe('DOTNET_PACK', () => {
  it('has correct id', () => {
    expect(DOTNET_PACK.id).toBe('dotnet');
  });

  it('format-check gate is fast and contains dotnet format', () => {
    const g = gate(DOTNET_PACK, 'format-check');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toContain('dotnet format');
  });

  it('build gate is slow and contains dotnet build', () => {
    const g = gate(DOTNET_PACK, 'build');
    expect(g?.tier).toBe('slow');
    expect(g?.command).toContain('dotnet build');
  });

  it('test gate is slow and contains dotnet test', () => {
    const g = gate(DOTNET_PACK, 'test');
    expect(g?.tier).toBe('slow');
    expect(g?.command).toContain('dotnet test');
  });

  it('has a ci-full gate with tier ci', () => {
    expect(gate(DOTNET_PACK, 'ci-full')?.tier).toBe('ci');
  });
});

// Standard pack contract: 4 gates, fast format-check, slow test, ci ci-full
const standardPacks: { pack: Pack; id: string; name: string }[] = [
  { pack: JAVASCRIPT_PACK, id: 'javascript', name: 'JavaScript' },
  { pack: GO_PACK, id: 'go', name: 'Go' },
  { pack: PYTHON_PACK, id: 'python', name: 'Python' },
  { pack: JAVA_PACK, id: 'java', name: 'Java' },
  { pack: PHP_PACK, id: 'php', name: 'PHP' },
  { pack: RUBY_PACK, id: 'ruby', name: 'Ruby' },
  { pack: SWIFT_PACK, id: 'swift', name: 'Swift' },
  { pack: KOTLIN_PACK, id: 'kotlin', name: 'Kotlin' },
  { pack: CPP_PACK, id: 'cpp', name: 'C/C++' },
  { pack: SCALA_PACK, id: 'scala', name: 'Scala' },
  { pack: ELIXIR_PACK, id: 'elixir', name: 'Elixir' },
  { pack: DART_PACK, id: 'dart', name: 'Dart' },
  { pack: ZIG_PACK, id: 'zig', name: 'Zig' },
  { pack: HASKELL_PACK, id: 'haskell', name: 'Haskell' },
  { pack: LUA_PACK, id: 'lua', name: 'Lua' },
  { pack: OCAML_PACK, id: 'ocaml', name: 'OCaml' },
];

for (const { pack, id, name } of standardPacks) {
  describe(`${name} pack`, () => {
    it('has correct id and name', () => {
      expect(pack.id).toBe(id);
      expect(pack.name).toBe(name);
    });

    it('has exactly 4 gates', () => {
      expect(pack.gates).toHaveLength(4);
    });

    it('format-check gate exists and is tier fast', () => {
      const g = gate(pack, 'format-check');
      expect(g).toBeDefined();
      expect(g?.tier).toBe('fast');
    });

    it('test gate exists and is tier slow', () => {
      const g = gate(pack, 'test');
      expect(g).toBeDefined();
      expect(g?.tier).toBe('slow');
    });

    it('ci-full gate exists and is tier ci', () => {
      const g = gate(pack, 'ci-full');
      expect(g).toBeDefined();
      expect(g?.tier).toBe('ci');
    });

    it('lint gate exists and is tier fast', () => {
      const g = gate(pack, 'lint');
      expect(g).toBeDefined();
      expect(g?.tier).toBe('fast');
    });
  });
}
