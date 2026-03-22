# frozen_string_literal: true

require_relative "../lib/calculator"
require_relative "../lib/errors"

RSpec.describe Calculator do
  subject(:calculator) { described_class.new }

  describe "#add" do
    it "returns the sum of two numbers" do
      expect(calculator.add(2, 3)).to eq(5)
    end
  end

  describe "#subtract" do
    it "returns the difference of two numbers" do
      expect(calculator.subtract(5, 3)).to eq(2)
    end
  end

  describe "#multiply" do
    it "returns the product of two numbers" do
      expect(calculator.multiply(4, 3)).to eq(12)
    end
  end

  describe "#divide" do
    it "returns the quotient of two numbers" do
      expect(calculator.divide(10, 2)).to eq(5.0)
    end

    it "raises DivisionByZeroError when dividing by zero" do
      expect { calculator.divide(1, 0) }.to raise_error(DivisionByZeroError)
    end
  end

  describe "#history" do
    it "tracks calculation results" do
      calculator.add(1, 2)
      calculator.multiply(3, 4)
      expect(calculator.history).to eq([3, 12])
    end
  end

  describe "#clear_history" do
    it "clears the history" do
      calculator.add(1, 2)
      calculator.clear_history
      expect(calculator.history).to eq([])
    end
  end
end
