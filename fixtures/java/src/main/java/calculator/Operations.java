package calculator;

public final class Operations {
    private Operations() {
        // utility class
    }

    public static double add(double a, double b) {
        return a + b;
    }

    public static double subtract(double a, double b) {
        return a - b;
    }

    public static double multiply(double a, double b) {
        return a * b;
    }

    public static double divide(double a, double b) {
        if (b == 0) {
            throw new DivisionByZeroException();
        }
        return a / b;
    }
}
