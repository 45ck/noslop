package calculator

// Calculator performs basic arithmetic operations and tracks the last result.
type Calculator struct {
	lastResult float64
}

// New creates a new Calculator with a zero initial result.
func New() *Calculator {
	return &Calculator{lastResult: 0}
}

// Add returns the sum of a and b.
func (c *Calculator) Add(a, b float64) float64 {
	c.lastResult = Add(a, b)
	return c.lastResult
}

// Subtract returns the difference of a and b.
func (c *Calculator) Subtract(a, b float64) float64 {
	c.lastResult = Subtract(a, b)
	return c.lastResult
}

// Multiply returns the product of a and b.
func (c *Calculator) Multiply(a, b float64) float64 {
	c.lastResult = Multiply(a, b)
	return c.lastResult
}

// Divide returns the quotient of a and b, or an error if b is zero.
func (c *Calculator) Divide(a, b float64) (float64, error) {
	result, err := Divide(a, b)
	if err != nil {
		return 0, err
	}
	c.lastResult = result
	return c.lastResult, nil
}

// LastResult returns the result of the most recent operation.
func (c *Calculator) LastResult() float64 {
	return c.lastResult
}
