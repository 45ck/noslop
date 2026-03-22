"""Calculator module with history tracking."""

from operations import add, divide, multiply, subtract


class Calculator:
    """A calculator that tracks the history of results."""

    def __init__(self) -> None:
        self._history: list[float] = []

    def add(self, a: float, b: float) -> float:
        """Add two numbers and record the result."""
        result = add(a, b)
        self._history.append(result)
        return result

    def subtract(self, a: float, b: float) -> float:
        """Subtract b from a and record the result."""
        result = subtract(a, b)
        self._history.append(result)
        return result

    def multiply(self, a: float, b: float) -> float:
        """Multiply two numbers and record the result."""
        result = multiply(a, b)
        self._history.append(result)
        return result

    def divide(self, a: float, b: float) -> float:
        """Divide a by b and record the result.

        Raises:
            DivisionByZeroError: If b is zero.
        """
        result = divide(a, b)
        self._history.append(result)
        return result

    def get_history(self) -> list[float]:
        """Return a copy of the calculation history."""
        return list(self._history)

    def clear_history(self) -> None:
        """Clear the calculation history."""
        self._history.clear()
