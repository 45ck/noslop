"""Tests for the calculator module."""

import pytest

from calculator import Calculator
from errors import DivisionByZeroError


class TestCalculator:
    """Tests for Calculator class."""

    def test_add(self) -> None:
        calc = Calculator()
        assert calc.add(2, 3) == 5  # noqa: PLR2004, S101

    def test_subtract(self) -> None:
        calc = Calculator()
        assert calc.subtract(5, 3) == 2  # noqa: PLR2004, S101

    def test_multiply(self) -> None:
        calc = Calculator()
        assert calc.multiply(4, 3) == 12  # noqa: PLR2004, S101

    def test_divide(self) -> None:
        calc = Calculator()
        assert calc.divide(10, 2) == 5  # noqa: PLR2004, S101

    def test_divide_by_zero(self) -> None:
        calc = Calculator()
        with pytest.raises(DivisionByZeroError):
            calc.divide(1, 0)

    def test_history(self) -> None:
        calc = Calculator()
        calc.add(1, 2)
        calc.multiply(3, 4)
        assert calc.get_history() == [3, 12]  # noqa: PLR2004, S101

    def test_clear_history(self) -> None:
        calc = Calculator()
        calc.add(1, 2)
        calc.clear_history()
        assert calc.get_history() == []  # noqa: S101
