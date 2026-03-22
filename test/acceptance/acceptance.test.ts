import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { ALL_FIXTURES } from './languages/index.js';
import { isToolchainAvailable } from './harness/toolchain-detect.js';
import { setupFixture, cleanupFixture } from './harness/fixture-setup.js';
import { injectDefect } from './harness/defect-injector.js';
import { runCheck } from './harness/cli-runner.js';

const ALWAYS_SKIP_GATES = ['spell', 'mutation'] as const;

for (const fixture of ALL_FIXTURES) {
  const shouldSkipPlatform = fixture.skipOnPlatforms?.includes(process.platform) ?? false;
  const toolchainReady = !shouldSkipPlatform && isToolchainAvailable(fixture.toolchainProbes);

  describe.skipIf(!toolchainReady)(`${fixture.displayName} acceptance`, () => {
    let tmpDir: string;
    const skipGates = [...ALWAYS_SKIP_GATES, ...(fixture.skipGates ?? [])];

    beforeAll(async () => {
      tmpDir = await setupFixture(fixture);
    }, fixture.slowTimeoutMs);

    afterAll(async () => {
      if (tmpDir) {
        await cleanupFixture(tmpDir);
      }
    });

    it('check --tier=fast passes on clean code', () => {
      const result = runCheck(tmpDir, 'fast', {
        timeoutMs: fixture.fastTimeoutMs,
        skipGates,
      });
      expect(
        result.status,
        `fast gates failed:\nstdout: ${result.stdout}\nstderr: ${result.stderr}`,
      ).toBe(0);
    });

    it('check --tier=slow passes on clean code', () => {
      const result = runCheck(tmpDir, 'slow', {
        timeoutMs: fixture.slowTimeoutMs,
        skipGates,
      });
      expect(
        result.status,
        `slow gates failed:\nstdout: ${result.stdout}\nstderr: ${result.stderr}`,
      ).toBe(0);
    });
  });

  describe.skipIf(!toolchainReady)(`${fixture.displayName} defect detection`, () => {
    let tmpDir: string;
    const skipGates = [...ALWAYS_SKIP_GATES, ...(fixture.skipGates ?? [])];

    beforeAll(async () => {
      tmpDir = await setupFixture(fixture);
      await injectDefect(tmpDir, fixture.defect);
    }, fixture.slowTimeoutMs);

    afterAll(async () => {
      if (tmpDir) {
        await cleanupFixture(tmpDir);
      }
    });

    it('check --tier=fast fails after format defect', () => {
      const result = runCheck(tmpDir, 'fast', {
        timeoutMs: fixture.fastTimeoutMs,
        skipGates,
      });
      expect(result.status).not.toBe(0);
    });
  });
}
