const std = @import("std");

pub const CalculatorError = error{
    DivisionByZero,
};

pub fn add(a: f64, b: f64) f64 {
    return a + b;
}

pub fn subtract(a: f64, b: f64) f64 {
    return a - b;
}

pub fn multiply(a: f64, b: f64) f64 {
    return a * b;
}

pub fn divide(a: f64, b: f64) CalculatorError!f64 {
    if (b == 0.0) {
        return CalculatorError.DivisionByZero;
    }
    return a / b;
}

const Calculator = struct {
    last_result: f64,

    pub fn init() Calculator {
        return .{ .last_result = 0.0 };
    }

    pub fn doAdd(self: *Calculator, a: f64, b: f64) f64 {
        self.last_result = add(a, b);
        return self.last_result;
    }

    pub fn doSubtract(self: *Calculator, a: f64, b: f64) f64 {
        self.last_result = subtract(a, b);
        return self.last_result;
    }

    pub fn doMultiply(self: *Calculator, a: f64, b: f64) f64 {
        self.last_result = multiply(a, b);
        return self.last_result;
    }

    pub fn doDivide(self: *Calculator, a: f64, b: f64) CalculatorError!f64 {
        self.last_result = try divide(a, b);
        return self.last_result;
    }

    pub fn lastResult(self: *const Calculator) f64 {
        return self.last_result;
    }
};

test "add" {
    try std.testing.expectApproxEqAbs(add(2.0, 3.0), 5.0, 1e-9);
}

test "add negative" {
    try std.testing.expectApproxEqAbs(add(-2.0, 3.0), 1.0, 1e-9);
}

test "subtract" {
    try std.testing.expectApproxEqAbs(subtract(5.0, 3.0), 2.0, 1e-9);
}

test "multiply" {
    try std.testing.expectApproxEqAbs(multiply(4.0, 3.0), 12.0, 1e-9);
}

test "multiply by zero" {
    try std.testing.expectApproxEqAbs(multiply(4.0, 0.0), 0.0, 1e-9);
}

test "divide" {
    const result = try divide(10.0, 2.0);
    try std.testing.expectApproxEqAbs(result, 5.0, 1e-9);
}

test "divide by zero" {
    const result = divide(10.0, 0.0);
    try std.testing.expectError(CalculatorError.DivisionByZero, result);
}

test "calculator workflow" {
    var c = Calculator.init();

    const sum = c.doAdd(10.0, 5.0);
    try std.testing.expectApproxEqAbs(sum, 15.0, 1e-9);

    const diff = c.doSubtract(sum, 3.0);
    try std.testing.expectApproxEqAbs(diff, 12.0, 1e-9);

    const product = c.doMultiply(diff, 2.0);
    try std.testing.expectApproxEqAbs(product, 24.0, 1e-9);

    const quotient = try c.doDivide(product, 4.0);
    try std.testing.expectApproxEqAbs(quotient, 6.0, 1e-9);

    try std.testing.expectApproxEqAbs(c.lastResult(), 6.0, 1e-9);
}

test "calculator divide by zero" {
    var c = Calculator.init();
    const result = c.doDivide(10.0, 0.0);
    try std.testing.expectError(CalculatorError.DivisionByZero, result);
}
