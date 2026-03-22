/// A simple calculator that tracks the last result.
public class Calculator {
    private var lastResult: Double = 0.0

    public init() {}

    /// Returns the sum of a and b.
    public func add(_ a: Double, _ b: Double) -> Double {
        lastResult = Operations.add(a, b)
        return lastResult
    }

    /// Returns the difference of a and b.
    public func subtract(_ a: Double, _ b: Double) -> Double {
        lastResult = Operations.subtract(a, b)
        return lastResult
    }

    /// Returns the product of a and b.
    public func multiply(_ a: Double, _ b: Double) -> Double {
        lastResult = Operations.multiply(a, b)
        return lastResult
    }

    /// Returns the quotient of a and b, or throws if b is zero.
    public func divide(_ a: Double, _ b: Double) throws -> Double {
        lastResult = try Operations.divide(a, b)
        return lastResult
    }

    /// The result of the most recent operation.
    public func getLastResult() -> Double {
        return lastResult
    }
}
