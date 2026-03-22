"""Pure arithmetic operations."""

from errors import DivisionByZeroError


def add(a: float, b: float) -> float:
    """Return the sum of a and b."""
    return a + b


def subtract(a: float, b: float) -> float:
    """Return the difference of a and b."""
    return a - b


def multiply(a: float, b: float) -> float:
    """Return the product of a and b."""
    return a * b


def divide(a: float, b: float) -> float:
    """Return the quotient of a and b.

    Raises:
        DivisionByZeroError: If b is zero.
    """
    if b == 0:
        raise DivisionByZeroError
    return a / b
