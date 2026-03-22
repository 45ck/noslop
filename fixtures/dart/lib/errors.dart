/// Error thrown when a division by zero is attempted.
class DivisionByZeroError implements Exception {
  /// A human-readable description of the error.
  final String message;

  /// Creates a [DivisionByZeroError] with an optional [message].
  DivisionByZeroError([this.message = 'division by zero']);

  @override
  String toString() => 'DivisionByZeroError: $message';
}
