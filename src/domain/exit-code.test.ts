import { describe, expect, it } from 'vitest';
import { EXIT_CONFIG_ERROR, EXIT_GATE_FAILURE, EXIT_SUCCESS } from './exit-code.js';

describe('exit codes', () => {
  it('defines distinct exit codes', () => {
    expect(EXIT_SUCCESS).toBe(0);
    expect(EXIT_GATE_FAILURE).toBe(1);
    expect(EXIT_CONFIG_ERROR).toBe(2);
  });

  it('all codes are unique', () => {
    const codes = [EXIT_SUCCESS, EXIT_GATE_FAILURE, EXIT_CONFIG_ERROR];
    expect(new Set(codes).size).toBe(codes.length);
  });
});
