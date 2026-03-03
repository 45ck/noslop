// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "monorepo-swift",
    targets: [
        .executableTarget(name: "App", path: "Sources/App")
    ]
)
