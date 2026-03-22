namespace Calculator;

public class DivisionByZeroException : ArithmeticException
{
    public DivisionByZeroException()
        : base("Cannot divide by zero")
    {
    }
}
