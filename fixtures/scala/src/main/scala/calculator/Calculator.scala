package calculator

class Calculator {
  private var lastResult: Double = 0.0

  def add(a: Double, b: Double): Double = {
    lastResult = Operations.add(a, b)
    lastResult
  }

  def subtract(a: Double, b: Double): Double = {
    lastResult = Operations.subtract(a, b)
    lastResult
  }

  def multiply(a: Double, b: Double): Double = {
    lastResult = Operations.multiply(a, b)
    lastResult
  }

  def divide(a: Double, b: Double): Double = {
    lastResult = Operations.divide(a, b)
    lastResult
  }

  def getLastResult: Double = lastResult
}
