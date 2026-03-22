pub mod errors;
pub mod operations;

use errors::CalculatorError;
use operations::{add, divide, multiply, subtract};

pub struct Calculator {
    last_result: f64,
}

impl Calculator {
    pub fn new() -> Self {
        Self { last_result: 0.0 }
    }

    pub fn add(&mut self, a: f64, b: f64) -> f64 {
        self.last_result = add(a, b);
        self.last_result
    }

    pub fn subtract(&mut self, a: f64, b: f64) -> f64 {
        self.last_result = subtract(a, b);
        self.last_result
    }

    pub fn multiply(&mut self, a: f64, b: f64) -> f64 {
        self.last_result = multiply(a, b);
        self.last_result
    }

    pub fn divide(&mut self, a: f64, b: f64) -> Result<f64, CalculatorError> {
        let result = divide(a, b)?;
        self.last_result = result;
        Ok(self.last_result)
    }

    pub fn last_result(&self) -> f64 {
        self.last_result
    }
}

impl Default for Calculator {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_new_calculator() {
        let calc = Calculator::new();
        assert!((calc.last_result() - 0.0).abs() < f64::EPSILON);
    }

    #[test]
    fn test_add() {
        let mut calc = Calculator::new();
        assert!((calc.add(2.0, 3.0) - 5.0).abs() < f64::EPSILON);
    }

    #[test]
    fn test_subtract() {
        let mut calc = Calculator::new();
        assert!((calc.subtract(5.0, 3.0) - 2.0).abs() < f64::EPSILON);
    }

    #[test]
    fn test_multiply() {
        let mut calc = Calculator::new();
        assert!((calc.multiply(4.0, 3.0) - 12.0).abs() < f64::EPSILON);
    }

    #[test]
    fn test_divide() {
        let mut calc = Calculator::new();
        assert!((calc.divide(10.0, 2.0).unwrap() - 5.0).abs() < f64::EPSILON);
    }

    #[test]
    fn test_divide_by_zero() {
        let mut calc = Calculator::new();
        assert!(calc.divide(10.0, 0.0).is_err());
    }

    #[test]
    fn test_last_result() {
        let mut calc = Calculator::new();
        calc.add(1.0, 2.0);
        assert!((calc.last_result() - 3.0).abs() < f64::EPSILON);
        calc.multiply(3.0, 4.0);
        assert!((calc.last_result() - 12.0).abs() < f64::EPSILON);
    }

    #[test]
    fn test_default() {
        let calc = Calculator::default();
        assert!((calc.last_result() - 0.0).abs() < f64::EPSILON);
    }
}
