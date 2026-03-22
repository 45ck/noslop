package calculator

// Add returns the sum of a and b.
func Add(a, b float64) float64 {
	return a + b
}

// Subtract returns the difference of a and b.
func Subtract(a, b float64) float64 {
	return a - b
}

// Multiply returns the product of a and b.
func Multiply(a, b float64) float64 {
	return a * b
}

// Divide returns the quotient of a and b.
// It returns an error if b is zero.
func Divide(a, b float64) (float64, error) {
	if b == 0 {
		return 0, ErrDivisionByZero
	}
	return a / b, nil
}
