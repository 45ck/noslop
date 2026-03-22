package calculator;

public class DivisionByZeroException extends ArithmeticException {
    public DivisionByZeroException() {
        super("Cannot divide by zero");
    }
}
