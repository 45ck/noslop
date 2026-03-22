defmodule CalculatorTest do
  use ExUnit.Case, async: true

  alias Calculator.DivisionByZeroError

  test "adds two numbers" do
    calc = Calculator.new()
    {result, _calc} = Calculator.add(calc, 2, 3)
    assert result == 5
  end

  test "subtracts two numbers" do
    calc = Calculator.new()
    {result, _calc} = Calculator.subtract(calc, 5, 3)
    assert result == 2
  end

  test "multiplies two numbers" do
    calc = Calculator.new()
    {result, _calc} = Calculator.multiply(calc, 4, 3)
    assert result == 12
  end

  test "divides two numbers" do
    calc = Calculator.new()
    {result, _calc} = Calculator.divide(calc, 10, 2)
    assert result == 5.0
  end

  test "raises on division by zero" do
    calc = Calculator.new()

    assert_raise DivisionByZeroError, fn ->
      Calculator.divide(calc, 1, 0)
    end
  end

  test "tracks history" do
    calc = Calculator.new()
    {_r1, calc} = Calculator.add(calc, 1, 2)
    {_r2, calc} = Calculator.multiply(calc, 3, 4)
    assert Calculator.get_history(calc) == [3, 12]
  end

  test "clears history" do
    calc = Calculator.new()
    {_r1, calc} = Calculator.add(calc, 1, 2)
    calc = Calculator.clear_history(calc)
    assert Calculator.get_history(calc) == []
  end
end
