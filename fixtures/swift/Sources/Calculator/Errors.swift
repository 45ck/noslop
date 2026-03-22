import Foundation

/// Errors that can occur during calculator operations.
public enum CalculatorError: Error, CustomStringConvertible {
    case divisionByZero

    public var description: String {
        switch self {
        case .divisionByZero:
            return "division by zero"
        }
    }
}
