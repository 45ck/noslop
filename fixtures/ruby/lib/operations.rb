# frozen_string_literal: true

require_relative "errors"

# Pure arithmetic operations.
module Operations
  module_function

  def add(a, b)
    a + b
  end

  def subtract(a, b)
    a - b
  end

  def multiply(a, b)
    a * b
  end

  def divide(a, b)
    raise DivisionByZeroError if b.zero?

    a.to_f / b
  end
end
