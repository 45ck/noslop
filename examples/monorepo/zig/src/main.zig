const std = @import("std");

fn greet(name: []const u8, writer: anytype) !void {
    try writer.print("Hello, {s}!\n", .{name});
}

pub fn main() !void {
    const stdout = std.io.getStdOut().writer();
    try greet("world", stdout);
}
