package calculator

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class CalculatorTest {
    private val delta = 1e-9

    @Test
    fun addsTwoNumbers() {
        val calc = Calculator()
        assertEquals(5.0, calc.add(2.0, 3.0), delta)
    }

    @Test
    fun subtractsTwoNumbers() {
        val calc = Calculator()
        assertEquals(2.0, calc.subtract(5.0, 3.0), delta)
    }

    @Test
    fun multipliesTwoNumbers() {
        val calc = Calculator()
        assertEquals(12.0, calc.multiply(4.0, 3.0), delta)
    }

    @Test
    fun dividesTwoNumbers() {
        val calc = Calculator()
        assertEquals(5.0, calc.divide(10.0, 2.0), delta)
    }

    @Test
    fun throwsOnDivisionByZero() {
        val calc = Calculator()
        assertFailsWith<DivisionByZeroException> { calc.divide(1.0, 0.0) }
    }

    @Test
    fun tracksLastResult() {
        val calc = Calculator()
        calc.add(1.0, 2.0)
        assertEquals(3.0, calc.getLastResult(), delta)
        calc.multiply(3.0, 4.0)
        assertEquals(12.0, calc.getLastResult(), delta)
    }
}
