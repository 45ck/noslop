export type DefectSpec = Readonly<{
  /** File to corrupt (relative to fixture root) */
  relativePath: string;
  /** Original content substring to find */
  find: string;
  /** Replacement that breaks formatting */
  replace: string;
}>;

export type LanguageFixture = Readonly<{
  packId: string;
  displayName: string;
  fixtureDir: string;
  toolchainProbes: readonly string[];
  dependencyInstall?: string;
  fastTimeoutMs: number;
  slowTimeoutMs: number;
  defect: DefectSpec;
  skipGates?: readonly string[];
  skipOnPlatforms?: readonly NodeJS.Platform[];
}>;
