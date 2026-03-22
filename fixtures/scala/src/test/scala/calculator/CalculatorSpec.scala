package calculator

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class CalculatorSpec extends AnyFlatSpec with Matchers {
  val delta: Double = 1e-9

  "Calculator" should "add two numbers" in {
    val calc = new Calculator
    calc.add(2.0, 3.0) shouldBe 5.0 +- delta
  }

  it should "subtract two numbers" in {
    val calc = new Calculator
    calc.subtract(5.0, 3.0) shouldBe 2.0 +- delta
  }

  it should "multiply two numbers" in {
    val calc = new Calculator
    calc.multiply(4.0, 3.0) shouldBe 12.0 +- delta
  }

  it should "divide two numbers" in {
    val calc = new Calculator
    calc.divide(10.0, 2.0) shouldBe 5.0 +- delta
  }

  it should "throw on division by zero" in {
    val calc = new Calculator
    a[DivisionByZeroException] should be thrownBy calc.divide(1.0, 0.0)
  }

  it should "track the last result" in {
    val calc = new Calculator
    calc.add(1.0, 2.0)
    calc.getLastResult shouldBe 3.0 +- delta
    calc.multiply(3.0, 4.0)
    calc.getLastResult shouldBe 12.0 +- delta
  }
}
