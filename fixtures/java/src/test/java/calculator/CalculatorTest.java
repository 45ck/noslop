package calculator;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;

class CalculatorTest {
    private static final double DELTA = 1e-9;

    @Test
    void addsTwoNumbers() {
        Calculator calc = new Calculator();
        assertEquals(5.0, calc.add(2.0, 3.0), DELTA);
    }

    @Test
    void subtractsTwoNumbers() {
        Calculator calc = new Calculator();
        assertEquals(2.0, calc.subtract(5.0, 3.0), DELTA);
    }

    @Test
    void multipliesTwoNumbers() {
        Calculator calc = new Calculator();
        assertEquals(12.0, calc.multiply(4.0, 3.0), DELTA);
    }

    @Test
    void dividesTwoNumbers() {
        Calculator calc = new Calculator();
        assertEquals(5.0, calc.divide(10.0, 2.0), DELTA);
    }

    @Test
    void throwsOnDivisionByZero() {
        Calculator calc = new Calculator();
        assertThrows(DivisionByZeroException.class, () -> calc.divide(1.0, 0.0));
    }

    @Test
    void tracksLastResult() {
        Calculator calc = new Calculator();
        calc.add(1.0, 2.0);
        assertEquals(3.0, calc.getLastResult(), DELTA);
        calc.multiply(3.0, 4.0);
        assertEquals(12.0, calc.getLastResult(), DELTA);
    }
}
