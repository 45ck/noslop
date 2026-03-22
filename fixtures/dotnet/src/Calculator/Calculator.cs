namespace Calculator;

public class Calculator
{
    private double _lastResult;

    public double Add(double a, double b)
    {
        _lastResult = Operations.Add(a, b);
        return _lastResult;
    }

    public double Subtract(double a, double b)
    {
        _lastResult = Operations.Subtract(a, b);
        return _lastResult;
    }

    public double Multiply(double a, double b)
    {
        _lastResult = Operations.Multiply(a, b);
        return _lastResult;
    }

    public double Divide(double a, double b)
    {
        _lastResult = Operations.Divide(a, b);
        return _lastResult;
    }

    public double GetLastResult()
    {
        return _lastResult;
    }
}
