import { describe, expect, it } from 'vitest';
import { readTemplate, templateExists } from './template-validation-support.js';

describe('language config templates exist', () => {
  it.each([
    ['typescript', 'eslint.config.js'],
    ['javascript', 'eslint.config.js'],
    ['dotnet', '.editorconfig'],
    ['java', 'config/checkstyle/checkstyle.xml'],
    ['java', 'config/pmd/pmd.xml'],
    ['ruby', '.rubocop.yml'],
    ['kotlin', 'detekt.yml'],
    ['swift', '.swiftlint.yml'],
    ['php', 'phpstan.neon'],
    ['php', 'phpmd.xml'],
    ['go', '.golangci.yml'],
    ['scala', '.scalafix.conf'],
    ['elixir', '.credo.exs'],
    ['dart', 'analysis_options.yaml'],
    ['haskell', '.hlint.yaml'],
    ['lua', '.luacheckrc'],
    ['cpp', '.clang-tidy'],
    ['rust', 'clippy.toml'],
  ])('%s includes %s', (packId, relPath) => {
    expect(templateExists(packId, relPath)).toBe(true);
  });
});

describe('language config templates include expected rules', () => {
  it.each([
    ['typescript', 'eslint.config.js', 'complexity'],
    ['javascript', 'eslint.config.js', 'complexity'],
    ['dotnet', 'Directory.Build.props', 'SonarAnalyzer'],
    ['python', 'pyproject.toml', '[tool.ruff]'],
    ['python', 'pyproject.toml', 'max-complexity'],
    ['python', 'pyproject.toml', 'strict'],
    ['java', 'config/checkstyle/checkstyle.xml', 'CyclomaticComplexity'],
    ['java', 'config/pmd/pmd.xml', 'CyclomaticComplexity'],
    ['ruby', '.rubocop.yml', 'CyclomaticComplexity'],
    ['kotlin', 'detekt.yml', 'CyclomaticComplexMethod'],
    ['swift', '.swiftlint.yml', 'cyclomatic_complexity'],
    ['php', 'phpstan.neon', 'level: 8'],
    ['php', 'phpmd.xml', 'CyclomaticComplexity'],
    ['go', '.golangci.yml', 'gocyclo'],
    ['go', '.golangci.yml', 'argument-limit'],
    ['scala', '.scalafix.conf', 'RemoveUnused'],
    ['elixir', '.credo.exs', 'strict: true'],
    ['dart', 'analysis_options.yaml', 'type_annotate_public_apis'],
    ['lua', '.luacheckrc', 'max_line_length'],
    ['cpp', '.clang-tidy', 'cppcoreguidelines'],
    ['rust', 'clippy.toml', 'cognitive-complexity-threshold'],
  ])('%s %s contains %s', (packId, relPath, expectedSnippet) => {
    expect(readTemplate(packId, relPath)).toContain(expectedSnippet);
  });
});

describe('zig and ocaml compiler-only packs', () => {
  it('do not ship unrelated standalone config files', () => {
    expect(templateExists('zig', 'clippy.toml')).toBe(false);
    expect(templateExists('zig', '.golangci.yml')).toBe(false);
  });
});
