/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      comment: 'No circular dependencies (coupling explosion).',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
    {
      name: 'domain-no-infra',
      comment: 'Domain must not depend on infrastructure or presentation.',
      severity: 'error',
      from: { path: '^src/domain' },
      to: { path: '^src/(infrastructure|presentation)' },
    },
    {
      name: 'domain-no-application',
      comment: 'Domain must not depend on application layer (inward dependency only).',
      severity: 'error',
      from: { path: '^src/domain' },
      to: { path: '^src/application' },
    },
    {
      name: 'application-no-presentation',
      comment: 'Application layer should not depend on presentation.',
      severity: 'error',
      from: { path: '^src/application' },
      to: { path: '^src/presentation' },
    },
    {
      name: 'no-src-to-test',
      comment: 'Production code should not depend on test code.',
      severity: 'error',
      from: { path: '^src' },
      to: { path: '^test' },
    },
    {
      name: 'infrastructure-no-presentation',
      comment: 'Infrastructure should not depend on presentation.',
      severity: 'error',
      from: { path: '^src/infrastructure' },
      to: { path: '^src/presentation' },
    },
  ],
  options: {
    doNotFollow: {
      path: 'node_modules',
    },
    tsPreCompilationDeps: true,
    combinedDependencies: true,
    preserveSymlinks: false,
    tsConfig: {
      fileName: './tsconfig.json',
    },
  },
};
