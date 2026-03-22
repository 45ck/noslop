import { add, subtract, multiply, divide } from './operations.js';

export class Calculator {
  private history: number[] = [];

  add(a: number, b: number): number {
    const result = add(a, b);
    this.history.push(result);
    return result;
  }

  subtract(a: number, b: number): number {
    const result = subtract(a, b);
    this.history.push(result);
    return result;
  }

  multiply(a: number, b: number): number {
    const result = multiply(a, b);
    this.history.push(result);
    return result;
  }

  divide(a: number, b: number): number {
    const result = divide(a, b);
    this.history.push(result);
    return result;
  }

  getHistory(): readonly number[] {
    return [...this.history];
  }

  clearHistory(): void {
    this.history = [];
  }
}
