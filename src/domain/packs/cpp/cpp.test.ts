import { describe, expect, it } from 'vitest';
import type { Pack } from '../../pack/pack.js';
import { CPP_PACK } from './cpp.js';

const gate = (pack: Pack, label: string) => pack.gates.find((g) => g.label === label);

describe('CPP_PACK', () => {
  it('has correct id and name', () => {
    expect(CPP_PACK.id).toBe('cpp');
    expect(CPP_PACK.name).toBe('C/C++');
  });

  it('has 6 gates', () => {
    expect(CPP_PACK.gates).toHaveLength(6);
  });

  it('format-check gate is fast with exact command', () => {
    const g = gate(CPP_PACK, 'format-check');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe(
      'find . \\( -name "*.c" -o -name "*.cpp" -o -name "*.h" \\) | xargs clang-format --dry-run --Werror',
    );
  });

  it('lint gate is fast with exact command', () => {
    const g = gate(CPP_PACK, 'lint');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe('cppcheck --error-exitcode=1 --quiet .');
  });

  it('spell gate is fast with exact command', () => {
    const g = gate(CPP_PACK, 'spell');
    expect(g?.tier).toBe('fast');
    expect(g?.command).toBe('typos');
  });

  it('build gate is slow with exact command', () => {
    const g = gate(CPP_PACK, 'build');
    expect(g?.tier).toBe('slow');
    expect(g?.command).toBe('cmake -B build -DCMAKE_BUILD_TYPE=Release && cmake --build build');
  });

  it('test gate is slow with exact command', () => {
    const g = gate(CPP_PACK, 'test');
    expect(g?.tier).toBe('slow');
    expect(g?.command).toBe('ctest --test-dir build --output-on-failure');
  });

  it('ci-full gate is ci tier with exact command', () => {
    const g = gate(CPP_PACK, 'ci-full');
    expect(g?.tier).toBe('ci');
    expect(g?.command).toBe(
      'find . \\( -name "*.c" -o -name "*.cpp" -o -name "*.h" \\) | xargs clang-format --dry-run --Werror && cppcheck --error-exitcode=1 --quiet . && typos && cmake -B build -DCMAKE_BUILD_TYPE=Release && cmake --build build && ctest --test-dir build --output-on-failure',
    );
  });

  it('has no mutation gate', () => {
    expect(gate(CPP_PACK, 'mutation')).toBeUndefined();
  });
});
