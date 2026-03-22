defmodule Calculator.Operations do
  @moduledoc false

  alias Calculator.DivisionByZeroError

  @spec add(number(), number()) :: number()
  def add(a, b), do: a + b

  @spec subtract(number(), number()) :: number()
  def subtract(a, b), do: a - b

  @spec multiply(number(), number()) :: number()
  def multiply(a, b), do: a * b

  @spec divide(number(), number()) :: float()
  def divide(_a, 0), do: raise(DivisionByZeroError)
  def divide(_a, 0.0), do: raise(DivisionByZeroError)
  def divide(a, b), do: a / b
end
