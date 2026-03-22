import 'package:test/test.dart';

import 'package:calculator/calculator.dart';
import 'package:calculator/errors.dart';
import 'package:calculator/operations.dart';

void main() {
  group('Calculator', () {
    late Calculator calc;

    setUp(() {
      calc = Calculator();
    });

    test('new calculator has zero last result', () {
      expect(calc.lastResult, closeTo(0.0, 1e-9));
    });

    test('add returns sum', () {
      expect(calc.add(2.0, 3.0), closeTo(5.0, 1e-9));
    });

    test('subtract returns difference', () {
      expect(calc.subtract(5.0, 3.0), closeTo(2.0, 1e-9));
    });

    test('multiply returns product', () {
      expect(calc.multiply(4.0, 3.0), closeTo(12.0, 1e-9));
    });

    test('divide returns quotient', () {
      expect(calc.divide(10.0, 2.0), closeTo(5.0, 1e-9));
    });

    test('divide by zero throws', () {
      expect(
        () => calc.divide(10.0, 0.0),
        throwsA(isA<DivisionByZeroError>()),
      );
    });

    test('last result tracks operations', () {
      calc.add(1.0, 2.0);
      expect(calc.lastResult, closeTo(3.0, 1e-9));
      calc.multiply(3.0, 4.0);
      expect(calc.lastResult, closeTo(12.0, 1e-9));
    });
  });

  group('Operations', () {
    test('add', () {
      expect(Operations.add(2.0, 3.0), closeTo(5.0, 1e-9));
    });

    test('subtract', () {
      expect(Operations.subtract(5.0, 3.0), closeTo(2.0, 1e-9));
    });

    test('multiply', () {
      expect(Operations.multiply(4.0, 3.0), closeTo(12.0, 1e-9));
    });

    test('divide', () {
      expect(Operations.divide(10.0, 2.0), closeTo(5.0, 1e-9));
    });

    test('divide by zero throws', () {
      expect(
        () => Operations.divide(10.0, 0.0),
        throwsA(isA<DivisionByZeroError>()),
      );
    });
  });
}
