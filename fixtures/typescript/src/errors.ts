export class DivisionByZeroError extends Error {
  constructor() {
    super('Cannot divide by zero');
    this.name = 'DivisionByZeroError';
  }
}
