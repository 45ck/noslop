/// Pure arithmetic operations.
public enum Operations {
    /// Returns the sum of a and b.
    public static func add(_ a: Double, _ b: Double) -> Double {
        return a + b
    }

    /// Returns the difference of a and b.
    public static func subtract(_ a: Double, _ b: Double) -> Double {
        return a - b
    }

    /// Returns the product of a and b.
    public static func multiply(_ a: Double, _ b: Double) -> Double {
        return a * b
    }

    /// Returns the quotient of a and b, or throws if b is zero.
    public static func divide(_ a: Double, _ b: Double) throws -> Double {
        if b == 0.0 {
            throw CalculatorError.divisionByZero
        }
        return a / b
    }
}
