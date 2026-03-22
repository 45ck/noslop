import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Calculator } from '../src/calculator.js';
import { DivisionByZeroError } from '../src/errors.js';

describe('Calculator', () => {
  it('adds two numbers', () => {
    const calc = new Calculator();
    assert.strictEqual(calc.add(2, 3), 5);
  });

  it('subtracts two numbers', () => {
    const calc = new Calculator();
    assert.strictEqual(calc.subtract(5, 3), 2);
  });

  it('multiplies two numbers', () => {
    const calc = new Calculator();
    assert.strictEqual(calc.multiply(4, 3), 12);
  });

  it('divides two numbers', () => {
    const calc = new Calculator();
    assert.strictEqual(calc.divide(10, 2), 5);
  });

  it('throws on division by zero', () => {
    const calc = new Calculator();
    assert.throws(() => calc.divide(1, 0), DivisionByZeroError);
  });

  it('tracks history', () => {
    const calc = new Calculator();
    calc.add(1, 2);
    calc.multiply(3, 4);
    assert.deepStrictEqual(calc.getHistory(), [3, 12]);
  });

  it('clears history', () => {
    const calc = new Calculator();
    calc.add(1, 2);
    calc.clearHistory();
    assert.deepStrictEqual(calc.getHistory(), []);
  });
});
