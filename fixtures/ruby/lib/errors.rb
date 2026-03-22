# frozen_string_literal: true

# Raised when a division by zero is attempted.
class DivisionByZeroError < StandardError
  def initialize
    super("Cannot divide by zero")
  end
end
