export type ToolchainRequirement = Readonly<{
  binary: string;
  versionCommand: string;
  installHint: string;
}>;

const TOOLCHAIN_MAP: Record<string, readonly ToolchainRequirement[]> = {
  typescript: [
    { binary: 'tsc', versionCommand: 'npx tsc --version', installHint: 'npm install typescript' },
    {
      binary: 'eslint',
      versionCommand: 'npx eslint --version',
      installHint: 'npm install eslint',
    },
    {
      binary: 'prettier',
      versionCommand: 'npx prettier --version',
      installHint: 'npm install prettier',
    },
  ],
  javascript: [
    {
      binary: 'eslint',
      versionCommand: 'npx eslint --version',
      installHint: 'npm install eslint',
    },
    {
      binary: 'prettier',
      versionCommand: 'npx prettier --version',
      installHint: 'npm install prettier',
    },
  ],
  rust: [
    {
      binary: 'cargo',
      versionCommand: 'cargo --version',
      installHint: 'curl --proto =https --tlsv1.2 -sSf https://sh.rustup.rs | sh',
    },
    {
      binary: 'clippy',
      versionCommand: 'cargo clippy --version',
      installHint: 'rustup component add clippy',
    },
  ],
  python: [
    {
      binary: 'python',
      versionCommand: 'python3 --version',
      installHint: 'install Python 3 from python.org',
    },
    { binary: 'ruff', versionCommand: 'ruff --version', installHint: 'pip install ruff' },
    { binary: 'mypy', versionCommand: 'mypy --version', installHint: 'pip install mypy' },
  ],
  go: [
    { binary: 'go', versionCommand: 'go version', installHint: 'install Go from go.dev' },
    {
      binary: 'golangci-lint',
      versionCommand: 'golangci-lint --version',
      installHint: 'go install github.com/golangci-lint/golangci-lint/cmd/golangci-lint@latest',
    },
  ],
  java: [
    {
      binary: 'javac',
      versionCommand: 'javac -version',
      installHint: 'install JDK from adoptium.net',
    },
    {
      binary: 'gradle',
      versionCommand: './gradlew --version',
      installHint: 'install Gradle or use the Gradle wrapper',
    },
  ],
  dotnet: [
    {
      binary: 'dotnet',
      versionCommand: 'dotnet --version',
      installHint: 'install .NET SDK from dotnet.microsoft.com',
    },
  ],
  ruby: [
    {
      binary: 'ruby',
      versionCommand: 'ruby --version',
      installHint: 'install Ruby from ruby-lang.org',
    },
    {
      binary: 'rubocop',
      versionCommand: 'bundle exec rubocop --version',
      installHint: 'gem install rubocop',
    },
  ],
  php: [
    { binary: 'php', versionCommand: 'php --version', installHint: 'install PHP from php.net' },
    {
      binary: 'composer',
      versionCommand: 'composer --version',
      installHint: 'install Composer from getcomposer.org',
    },
  ],
  kotlin: [
    {
      binary: 'kotlin',
      versionCommand: 'kotlin -version',
      installHint: 'install Kotlin from kotlinlang.org',
    },
    {
      binary: 'gradle',
      versionCommand: './gradlew --version',
      installHint: 'install Gradle or use the Gradle wrapper',
    },
  ],
  swift: [
    {
      binary: 'swift',
      versionCommand: 'swift --version',
      installHint: 'install Swift from swift.org',
    },
    {
      binary: 'swiftlint',
      versionCommand: 'swiftlint version',
      installHint: 'brew install swiftlint',
    },
  ],
  cpp: [
    {
      binary: 'cmake',
      versionCommand: 'cmake --version',
      installHint: 'install CMake from cmake.org',
    },
    {
      binary: 'clang-format',
      versionCommand: 'clang-format --version',
      installHint: 'install clang-format via your package manager',
    },
  ],
  scala: [
    {
      binary: 'sbt',
      versionCommand: 'sbt --version',
      installHint: 'install sbt from scala-sbt.org',
    },
    {
      binary: 'scalac',
      versionCommand: 'scalac -version',
      installHint: 'install Scala from scala-lang.org',
    },
  ],
  elixir: [
    {
      binary: 'elixir',
      versionCommand: 'elixir --version',
      installHint: 'install Elixir from elixir-lang.org',
    },
    { binary: 'mix', versionCommand: 'mix --version', installHint: 'mix is included with Elixir' },
  ],
  dart: [
    { binary: 'dart', versionCommand: 'dart --version', installHint: 'install Dart from dart.dev' },
  ],
  haskell: [
    { binary: 'ghc', versionCommand: 'ghc --version', installHint: 'install GHC via ghcup' },
    { binary: 'cabal', versionCommand: 'cabal --version', installHint: 'install Cabal via ghcup' },
  ],
  lua: [
    { binary: 'lua', versionCommand: 'lua -v', installHint: 'install Lua from lua.org' },
    {
      binary: 'luacheck',
      versionCommand: 'luacheck --version',
      installHint: 'luarocks install luacheck',
    },
  ],
  zig: [
    { binary: 'zig', versionCommand: 'zig version', installHint: 'install Zig from ziglang.org' },
  ],
  ocaml: [
    { binary: 'ocaml', versionCommand: 'ocaml --version', installHint: 'install OCaml via opam' },
    { binary: 'dune', versionCommand: 'dune --version', installHint: 'opam install dune' },
  ],
};

export function getToolchainRequirements(packId: string): readonly ToolchainRequirement[] {
  return TOOLCHAIN_MAP[packId] ?? [];
}
