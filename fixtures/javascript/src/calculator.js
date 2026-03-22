import { add, subtract, multiply, divide } from './operations.js';

export class Calculator {
  #history = [];

  add(a, b) {
    const result = add(a, b);
    this.#history.push(result);
    return result;
  }

  subtract(a, b) {
    const result = subtract(a, b);
    this.#history.push(result);
    return result;
  }

  multiply(a, b) {
    const result = multiply(a, b);
    this.#history.push(result);
    return result;
  }

  divide(a, b) {
    const result = divide(a, b);
    this.#history.push(result);
    return result;
  }

  getHistory() {
    return [...this.#history];
  }

  clearHistory() {
    this.#history = [];
  }
}
