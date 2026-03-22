// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "Calculator",
    targets: [
        .target(name: "Calculator", path: "Sources/Calculator"),
        .testTarget(
            name: "CalculatorTests",
            dependencies: ["Calculator"],
            path: "Tests/CalculatorTests"
        ),
    ]
)
