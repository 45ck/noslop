const calc = @import("calculator.zig");
const std = @import("std");

pub fn main() void {
    const a: f64 = 10.0;
    const b: f64 = 3.0;

    const sum = calc.add(a, b);
    const diff = calc.subtract(a, b);
    const product = calc.multiply(a, b);

    std.debug.print("add({d}, {d}) = {d}\n", .{ a, b, sum });
    std.debug.print("subtract({d}, {d}) = {d}\n", .{ a, b, diff });
    std.debug.print("multiply({d}, {d}) = {d}\n", .{ a, b, product });

    if (calc.divide(a, b)) |quotient| {
        std.debug.print("divide({d}, {d}) = {d}\n", .{ a, b, quotient });
    } else |err| {
        std.debug.print("divide({d}, {d}) error: {}\n", .{ a, b, err });
    }
}

test "main module exists" {
    // Verify the main module compiles correctly.
    _ = main;
}
