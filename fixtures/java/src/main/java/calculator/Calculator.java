package calculator;

public class Calculator {
    private double lastResult;

    public Calculator() {
        this.lastResult = 0.0;
    }

    public double add(double a, double b) {
        lastResult = Operations.add(a, b);
        return lastResult;
    }

    public double subtract(double a, double b) {
        lastResult = Operations.subtract(a, b);
        return lastResult;
    }

    public double multiply(double a, double b) {
        lastResult = Operations.multiply(a, b);
        return lastResult;
    }

    public double divide(double a, double b) {
        lastResult = Operations.divide(a, b);
        return lastResult;
    }

    public double getLastResult() {
        return lastResult;
    }
}
