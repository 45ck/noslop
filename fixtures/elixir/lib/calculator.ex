defmodule Calculator do
  @moduledoc false

  alias Calculator.Operations

  defstruct history: []

  @type t :: %__MODULE__{history: [number()]}

  @spec new() :: t()
  def new, do: %__MODULE__{}

  @spec add(t(), number(), number()) :: {number(), t()}
  def add(%__MODULE__{} = calc, a, b) do
    result = Operations.add(a, b)
    {result, %{calc | history: calc.history ++ [result]}}
  end

  @spec subtract(t(), number(), number()) :: {number(), t()}
  def subtract(%__MODULE__{} = calc, a, b) do
    result = Operations.subtract(a, b)
    {result, %{calc | history: calc.history ++ [result]}}
  end

  @spec multiply(t(), number(), number()) :: {number(), t()}
  def multiply(%__MODULE__{} = calc, a, b) do
    result = Operations.multiply(a, b)
    {result, %{calc | history: calc.history ++ [result]}}
  end

  @spec divide(t(), number(), number()) :: {float(), t()}
  def divide(%__MODULE__{} = calc, a, b) do
    result = Operations.divide(a, b)
    {result, %{calc | history: calc.history ++ [result]}}
  end

  @spec get_history(t()) :: [number()]
  def get_history(%__MODULE__{history: history}), do: history

  @spec clear_history(t()) :: t()
  def clear_history(%__MODULE__{} = calc), do: %{calc | history: []}
end
