package calculator

import "errors"

// ErrDivisionByZero is returned when a division by zero is attempted.
var ErrDivisionByZero = errors.New("division by zero")
