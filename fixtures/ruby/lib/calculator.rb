# frozen_string_literal: true

require_relative "operations"

# A calculator that tracks the history of results.
class Calculator
  attr_reader :history

  def initialize
    @history = []
  end

  def add(a, b)
    result = Operations.add(a, b)
    @history << result
    result
  end

  def subtract(a, b)
    result = Operations.subtract(a, b)
    @history << result
    result
  end

  def multiply(a, b)
    result = Operations.multiply(a, b)
    @history << result
    result
  end

  def divide(a, b)
    result = Operations.divide(a, b)
    @history << result
    result
  end

  def clear_history
    @history = []
  end
end
