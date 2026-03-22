import { describe, it, expect } from 'vitest';
import { Calculator } from './calculator.js';
import { DivisionByZeroError } from './errors.js';

describe('Calculator', () => {
  it('adds two numbers', () => {
    const calc = new Calculator();
    expect(calc.add(2, 3)).toBe(5);
  });

  it('subtracts two numbers', () => {
    const calc = new Calculator();
    expect(calc.subtract(5, 3)).toBe(2);
  });

  it('multiplies two numbers', () => {
    const calc = new Calculator();
    expect(calc.multiply(4, 3)).toBe(12);
  });

  it('divides two numbers', () => {
    const calc = new Calculator();
    expect(calc.divide(10, 2)).toBe(5);
  });

  it('throws on division by zero', () => {
    const calc = new Calculator();
    expect(() => calc.divide(1, 0)).toThrow(DivisionByZeroError);
  });

  it('tracks history', () => {
    const calc = new Calculator();
    calc.add(1, 2);
    calc.multiply(3, 4);
    expect(calc.getHistory()).toEqual([3, 12]);
  });

  it('clears history', () => {
    const calc = new Calculator();
    calc.add(1, 2);
    calc.clearHistory();
    expect(calc.getHistory()).toEqual([]);
  });
});
