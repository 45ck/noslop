/**
 * Data-driven validation of all template files.
 * Uses pure Node fs — no subprocesses, no noslop imports.
 * Excluded from coverage thresholds (see vitest.config.ts).
 */
import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { resolveTemplatesDir } from '../infrastructure/adapters/node-filesystem.js';

const templatesDir = resolveTemplatesDir();

function readTemplate(packId: string, relPath: string): string {
  return readFileSync(path.join(templatesDir, 'packs', packId, relPath), 'utf8');
}

function templateExists(packId: string, relPath: string): boolean {
  try {
    statSync(path.join(templatesDir, 'packs', packId, relPath));
    return true;
  } catch {
    return false;
  }
}

function allPackIds(): string[] {
  return readdirSync(path.join(templatesDir, 'packs'));
}

// All 19 pack IDs that noslop ships
const ALL_PACK_IDS = [
  'typescript',
  'javascript',
  'rust',
  'dotnet',
  'python',
  'java',
  'go',
  'ruby',
  'kotlin',
  'swift',
  'php',
  'scala',
  'elixir',
  'dart',
  'haskell',
  'lua',
  'cpp',
  'zig',
  'ocaml',
];

// Packs that use typos spell-checker (all non-TS/JS packs)
const TYPOS_PACKS = ALL_PACK_IDS.filter((id) => id !== 'typescript' && id !== 'javascript');

describe('template packs directory', () => {
  it('contains exactly 19 pack directories', () => {
    const packs = allPackIds();
    expect(packs).toHaveLength(19);
  });

  it('contains all expected pack IDs', () => {
    const packs = allPackIds();
    for (const id of ALL_PACK_IDS) {
      expect(packs).toContain(id);
    }
  });
});

describe('scripts/check — all packs', () => {
  for (const packId of ALL_PACK_IDS) {
    it(`${packId}/scripts/check starts with #!/bin/sh`, () => {
      const content = readTemplate(packId, 'scripts/check');
      expect(content.startsWith('#!/bin/sh')).toBe(true);
    });

    it(`${packId}/scripts/check is non-empty`, () => {
      const content = readTemplate(packId, 'scripts/check');
      expect(content.trim().length).toBeGreaterThan(0);
    });

    it(`${packId}/scripts/check has fast) slow) ci) branches`, () => {
      const content = readTemplate(packId, 'scripts/check');
      expect(content).toContain('fast)');
      expect(content).toContain('slow)');
      expect(content).toContain('ci)');
    });
  }
});

describe('git hooks — all packs', () => {
  for (const packId of ALL_PACK_IDS) {
    it(`${packId}/.githooks/pre-commit starts with #!/bin/sh`, () => {
      const content = readTemplate(packId, '.githooks/pre-commit');
      expect(content.startsWith('#!/bin/sh')).toBe(true);
    });

    it(`${packId}/.githooks/pre-commit contains noslop check`, () => {
      const content = readTemplate(packId, '.githooks/pre-commit');
      expect(content).toContain('noslop check');
    });

    it(`${packId}/.githooks/pre-commit has command -v noslop fallback`, () => {
      const content = readTemplate(packId, '.githooks/pre-commit');
      expect(content).toContain('command -v noslop');
    });
  }
});

describe('.github/workflows/quality.yml — all packs', () => {
  for (const packId of ALL_PACK_IDS) {
    it(`${packId}/quality.yml contains on: and jobs:`, () => {
      const content = readTemplate(packId, '.github/workflows/quality.yml');
      expect(content).toContain('on:');
      expect(content).toContain('jobs:');
    });

    it(`${packId}/quality.yml has a runs-on step`, () => {
      const content = readTemplate(packId, '.github/workflows/quality.yml');
      expect(content).toContain('runs-on:');
    });
  }

  for (const packId of TYPOS_PACKS) {
    it(`${packId}/quality.yml includes typos spell-checker`, () => {
      const content = readTemplate(packId, '.github/workflows/quality.yml');
      expect(content).toContain('typos');
    });
  }
});

describe('.claude/settings.json — all packs', () => {
  for (const packId of ALL_PACK_IDS) {
    it(`${packId}/.claude/settings.json is valid JSON`, () => {
      const content = readTemplate(packId, '.claude/settings.json');
      expect(() => JSON.parse(content)).not.toThrow();
    });
  }
});

describe('config files — typescript', () => {
  it('eslint.config.js exists and is non-empty', () => {
    expect(templateExists('typescript', 'eslint.config.js')).toBe(true);
    const content = readTemplate('typescript', 'eslint.config.js');
    expect(content.trim().length).toBeGreaterThan(0);
  });

  it('eslint.config.js enforces complexity rule', () => {
    const content = readTemplate('typescript', 'eslint.config.js');
    expect(content).toContain('complexity');
  });
});

describe('config files — javascript', () => {
  it('eslint.config.js exists and is non-empty', () => {
    expect(templateExists('javascript', 'eslint.config.js')).toBe(true);
    const content = readTemplate('javascript', 'eslint.config.js');
    expect(content.trim().length).toBeGreaterThan(0);
  });

  it('eslint.config.js enforces complexity rule', () => {
    const content = readTemplate('javascript', 'eslint.config.js');
    expect(content).toContain('complexity');
  });
});

describe('config files — dotnet', () => {
  it('.editorconfig exists and is non-empty', () => {
    expect(templateExists('dotnet', '.editorconfig')).toBe(true);
    const content = readTemplate('dotnet', '.editorconfig');
    expect(content.trim().length).toBeGreaterThan(0);
  });

  it('Directory.Build.props references SonarAnalyzer', () => {
    const content = readTemplate('dotnet', 'Directory.Build.props');
    expect(content).toContain('SonarAnalyzer');
  });
});

describe('config files — python', () => {
  it('pyproject.toml contains [tool.ruff]', () => {
    const content = readTemplate('python', 'pyproject.toml');
    expect(content).toContain('[tool.ruff]');
  });

  it('pyproject.toml contains max-complexity', () => {
    const content = readTemplate('python', 'pyproject.toml');
    expect(content).toContain('max-complexity');
  });

  it('pyproject.toml configures mypy strict', () => {
    const content = readTemplate('python', 'pyproject.toml');
    expect(content).toContain('strict');
  });
});

describe('config files — java', () => {
  it('config/checkstyle/checkstyle.xml exists', () => {
    expect(templateExists('java', 'config/checkstyle/checkstyle.xml')).toBe(true);
  });

  it('checkstyle.xml contains CyclomaticComplexity', () => {
    const content = readTemplate('java', 'config/checkstyle/checkstyle.xml');
    expect(content).toContain('CyclomaticComplexity');
  });

  it('config/pmd/pmd.xml exists', () => {
    expect(templateExists('java', 'config/pmd/pmd.xml')).toBe(true);
  });

  it('pmd.xml contains CyclomaticComplexity', () => {
    const content = readTemplate('java', 'config/pmd/pmd.xml');
    expect(content).toContain('CyclomaticComplexity');
  });
});

describe('config files — ruby', () => {
  it('.rubocop.yml exists', () => {
    expect(templateExists('ruby', '.rubocop.yml')).toBe(true);
  });

  it('.rubocop.yml contains CyclomaticComplexity', () => {
    const content = readTemplate('ruby', '.rubocop.yml');
    expect(content).toContain('CyclomaticComplexity');
  });
});

describe('config files — kotlin', () => {
  it('detekt.yml exists', () => {
    expect(templateExists('kotlin', 'detekt.yml')).toBe(true);
  });

  it('detekt.yml contains CyclomaticComplexMethod', () => {
    const content = readTemplate('kotlin', 'detekt.yml');
    expect(content).toContain('CyclomaticComplexMethod');
  });
});

describe('config files — swift', () => {
  it('.swiftlint.yml exists', () => {
    expect(templateExists('swift', '.swiftlint.yml')).toBe(true);
  });

  it('.swiftlint.yml contains cyclomatic_complexity', () => {
    const content = readTemplate('swift', '.swiftlint.yml');
    expect(content).toContain('cyclomatic_complexity');
  });
});

describe('config files — php', () => {
  it('phpstan.neon exists', () => {
    expect(templateExists('php', 'phpstan.neon')).toBe(true);
  });

  it('phpstan.neon has level: 8', () => {
    const content = readTemplate('php', 'phpstan.neon');
    expect(content).toContain('level: 8');
  });
});

describe('config files — go', () => {
  it('.golangci.yml exists', () => {
    expect(templateExists('go', '.golangci.yml')).toBe(true);
  });

  it('.golangci.yml configures gocyclo', () => {
    const content = readTemplate('go', '.golangci.yml');
    expect(content).toContain('gocyclo');
  });
});

describe('config files — scala', () => {
  it('.scalafix.conf exists', () => {
    expect(templateExists('scala', '.scalafix.conf')).toBe(true);
  });

  it('.scalafix.conf references RemoveUnused', () => {
    const content = readTemplate('scala', '.scalafix.conf');
    expect(content).toContain('RemoveUnused');
  });
});

describe('config files — elixir', () => {
  it('.credo.exs exists', () => {
    expect(templateExists('elixir', '.credo.exs')).toBe(true);
  });

  it('.credo.exs has strict mode enabled', () => {
    const content = readTemplate('elixir', '.credo.exs');
    expect(content).toContain('strict: true');
  });
});

describe('config files — dart', () => {
  it('analysis_options.yaml exists', () => {
    expect(templateExists('dart', 'analysis_options.yaml')).toBe(true);
  });

  it('analysis_options.yaml has strict type safety rules', () => {
    const content = readTemplate('dart', 'analysis_options.yaml');
    expect(content).toContain('type_annotate_public_apis');
  });
});

describe('config files — haskell', () => {
  it('.hlint.yaml exists', () => {
    expect(templateExists('haskell', '.hlint.yaml')).toBe(true);
  });

  it('.hlint.yaml is non-empty', () => {
    const content = readTemplate('haskell', '.hlint.yaml');
    expect(content.trim().length).toBeGreaterThan(0);
  });
});

describe('config files — lua', () => {
  it('.luacheckrc exists', () => {
    expect(templateExists('lua', '.luacheckrc')).toBe(true);
  });

  it('.luacheckrc sets max_line_length', () => {
    const content = readTemplate('lua', '.luacheckrc');
    expect(content).toContain('max_line_length');
  });
});

describe('config files — cpp', () => {
  it('.clang-tidy exists', () => {
    expect(templateExists('cpp', '.clang-tidy')).toBe(true);
  });

  it('.clang-tidy includes cppcoreguidelines checks', () => {
    const content = readTemplate('cpp', '.clang-tidy');
    expect(content).toContain('cppcoreguidelines');
  });
});

describe('config files — rust', () => {
  it('clippy.toml exists', () => {
    expect(templateExists('rust', 'clippy.toml')).toBe(true);
  });

  it('clippy.toml sets cognitive-complexity-threshold', () => {
    const content = readTemplate('rust', 'clippy.toml');
    expect(content).toContain('cognitive-complexity-threshold');
  });
});

describe('config files — zig and ocaml (no standalone config)', () => {
  it('zig has no standalone quality config file (compiler enforces)', () => {
    // Zig and OCaml rely on their compilers/build tools — no config file needed
    expect(templateExists('zig', 'clippy.toml')).toBe(false);
    expect(templateExists('zig', '.golangci.yml')).toBe(false);
  });
});
