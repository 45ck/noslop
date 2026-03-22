"""Custom exception types for the calculator."""


class DivisionByZeroError(Exception):
    """Raised when a division by zero is attempted."""

    def __init__(self) -> None:
        super().__init__("Cannot divide by zero")
