import 'errors.dart';

/// Pure arithmetic operations.
class Operations {
  /// Returns the sum of [a] and [b].
  static double add(double a, double b) {
    return a + b;
  }

  /// Returns the difference of [a] and [b].
  static double subtract(double a, double b) {
    return a - b;
  }

  /// Returns the product of [a] and [b].
  static double multiply(double a, double b) {
    return a * b;
  }

  /// Returns the quotient of [a] and [b].
  ///
  /// Throws [DivisionByZeroError] if [b] is zero.
  static double divide(double a, double b) {
    if (b == 0.0) {
      throw DivisionByZeroError();
    }
    return a / b;
  }
}
