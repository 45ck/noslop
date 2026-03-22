package calculator

object Operations {
  def add(a: Double, b: Double): Double = a + b

  def subtract(a: Double, b: Double): Double = a - b

  def multiply(a: Double, b: Double): Double = a * b

  def divide(a: Double, b: Double): Double = {
    if (b == 0.0) throw new DivisionByZeroException
    a / b
  }
}
