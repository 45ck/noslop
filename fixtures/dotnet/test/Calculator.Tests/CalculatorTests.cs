using Xunit;

namespace Calculator.Tests;

public class CalculatorTests
{
    private const double Delta = 1e-9;

    [Fact]
    public void AddsTwoNumbers()
    {
        var calc = new Calculator();
        Assert.Equal(5.0, calc.Add(2.0, 3.0), Delta);
    }

    [Fact]
    public void SubtractsTwoNumbers()
    {
        var calc = new Calculator();
        Assert.Equal(2.0, calc.Subtract(5.0, 3.0), Delta);
    }

    [Fact]
    public void MultipliesTwoNumbers()
    {
        var calc = new Calculator();
        Assert.Equal(12.0, calc.Multiply(4.0, 3.0), Delta);
    }

    [Fact]
    public void DividesTwoNumbers()
    {
        var calc = new Calculator();
        Assert.Equal(5.0, calc.Divide(10.0, 2.0), Delta);
    }

    [Fact]
    public void ThrowsOnDivisionByZero()
    {
        var calc = new Calculator();
        Assert.Throws<DivisionByZeroException>(() => calc.Divide(1.0, 0.0));
    }

    [Fact]
    public void TracksLastResult()
    {
        var calc = new Calculator();
        calc.Add(1.0, 2.0);
        Assert.Equal(3.0, calc.GetLastResult(), Delta);
        calc.Multiply(3.0, 4.0);
        Assert.Equal(12.0, calc.GetLastResult(), Delta);
    }
}
