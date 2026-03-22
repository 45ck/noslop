package calculator

import (
	"math"
	"testing"
)

const epsilon = 1e-9

func TestNew(t *testing.T) {
	calc := New()
	if math.Abs(calc.LastResult()) > epsilon {
		t.Errorf("expected 0, got %f", calc.LastResult())
	}
}

func TestAdd(t *testing.T) {
	calc := New()
	result := calc.Add(2, 3)
	if math.Abs(result-5) > epsilon {
		t.Errorf("expected 5, got %f", result)
	}
}

func TestSubtract(t *testing.T) {
	calc := New()
	result := calc.Subtract(5, 3)
	if math.Abs(result-2) > epsilon {
		t.Errorf("expected 2, got %f", result)
	}
}

func TestMultiply(t *testing.T) {
	calc := New()
	result := calc.Multiply(4, 3)
	if math.Abs(result-12) > epsilon {
		t.Errorf("expected 12, got %f", result)
	}
}

func TestDivide(t *testing.T) {
	calc := New()
	result, err := calc.Divide(10, 2)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if math.Abs(result-5) > epsilon {
		t.Errorf("expected 5, got %f", result)
	}
}

func TestDivideByZero(t *testing.T) {
	calc := New()
	_, err := calc.Divide(10, 0)
	if err == nil {
		t.Fatal("expected error, got nil")
	}
	if err != ErrDivisionByZero {
		t.Errorf("expected ErrDivisionByZero, got %v", err)
	}
}

func TestLastResult(t *testing.T) {
	calc := New()
	calc.Add(1, 2)
	if math.Abs(calc.LastResult()-3) > epsilon {
		t.Errorf("expected 3, got %f", calc.LastResult())
	}
	calc.Multiply(3, 4)
	if math.Abs(calc.LastResult()-12) > epsilon {
		t.Errorf("expected 12, got %f", calc.LastResult())
	}
}

func TestOperationsAdd(t *testing.T) {
	if math.Abs(Add(2, 3)-5) > epsilon {
		t.Errorf("expected 5, got %f", Add(2, 3))
	}
}

func TestOperationsSubtract(t *testing.T) {
	if math.Abs(Subtract(5, 3)-2) > epsilon {
		t.Errorf("expected 2, got %f", Subtract(5, 3))
	}
}

func TestOperationsMultiply(t *testing.T) {
	if math.Abs(Multiply(4, 3)-12) > epsilon {
		t.Errorf("expected 12, got %f", Multiply(4, 3))
	}
}

func TestOperationsDivide(t *testing.T) {
	result, err := Divide(10, 2)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if math.Abs(result-5) > epsilon {
		t.Errorf("expected 5, got %f", result)
	}
}

func TestOperationsDivideByZero(t *testing.T) {
	_, err := Divide(10, 0)
	if err == nil {
		t.Fatal("expected error, got nil")
	}
}
