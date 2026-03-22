import XCTest

@testable import Calculator

final class CalculatorTests: XCTestCase {
    func testNewCalculator() {
        let calc = Calculator()
        XCTAssertEqual(calc.getLastResult(), 0.0, accuracy: 1e-9)
    }

    func testAdd() {
        let calc = Calculator()
        let result = calc.add(2.0, 3.0)
        XCTAssertEqual(result, 5.0, accuracy: 1e-9)
    }

    func testSubtract() {
        let calc = Calculator()
        let result = calc.subtract(5.0, 3.0)
        XCTAssertEqual(result, 2.0, accuracy: 1e-9)
    }

    func testMultiply() {
        let calc = Calculator()
        let result = calc.multiply(4.0, 3.0)
        XCTAssertEqual(result, 12.0, accuracy: 1e-9)
    }

    func testDivide() throws {
        let calc = Calculator()
        let result = try calc.divide(10.0, 2.0)
        XCTAssertEqual(result, 5.0, accuracy: 1e-9)
    }

    func testDivideByZero() {
        let calc = Calculator()
        XCTAssertThrowsError(try calc.divide(10.0, 0.0))
    }

    func testLastResult() {
        let calc = Calculator()
        _ = calc.add(1.0, 2.0)
        XCTAssertEqual(calc.getLastResult(), 3.0, accuracy: 1e-9)
        _ = calc.multiply(3.0, 4.0)
        XCTAssertEqual(calc.getLastResult(), 12.0, accuracy: 1e-9)
    }

    func testOperationsAdd() {
        XCTAssertEqual(Operations.add(2.0, 3.0), 5.0, accuracy: 1e-9)
    }

    func testOperationsSubtract() {
        XCTAssertEqual(Operations.subtract(5.0, 3.0), 2.0, accuracy: 1e-9)
    }

    func testOperationsMultiply() {
        XCTAssertEqual(Operations.multiply(4.0, 3.0), 12.0, accuracy: 1e-9)
    }

    func testOperationsDivide() throws {
        let result = try Operations.divide(10.0, 2.0)
        XCTAssertEqual(result, 5.0, accuracy: 1e-9)
    }

    func testOperationsDivideByZero() {
        XCTAssertThrowsError(try Operations.divide(10.0, 0.0))
    }
}
