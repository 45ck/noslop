import 'operations.dart';

/// A simple calculator that tracks the last result.
class Calculator {
  double _lastResult = 0.0;

  /// Returns the sum of [a] and [b].
  double add(double a, double b) {
    _lastResult = Operations.add(a, b);
    return _lastResult;
  }

  /// Returns the difference of [a] and [b].
  double subtract(double a, double b) {
    _lastResult = Operations.subtract(a, b);
    return _lastResult;
  }

  /// Returns the product of [a] and [b].
  double multiply(double a, double b) {
    _lastResult = Operations.multiply(a, b);
    return _lastResult;
  }

  /// Returns the quotient of [a] and [b].
  ///
  /// Throws [DivisionByZeroError] if [b] is zero.
  double divide(double a, double b) {
    _lastResult = Operations.divide(a, b);
    return _lastResult;
  }

  /// The result of the most recent operation.
  double get lastResult => _lastResult;
}
