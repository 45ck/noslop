use crate::errors::CalculatorError;

pub fn add(a: f64, b: f64) -> f64 {
    a + b
}

pub fn subtract(a: f64, b: f64) -> f64 {
    a - b
}

pub fn multiply(a: f64, b: f64) -> f64 {
    a * b
}

pub fn divide(a: f64, b: f64) -> Result<f64, CalculatorError> {
    if b == 0.0 {
        return Err(CalculatorError::DivisionByZero);
    }
    Ok(a / b)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_add() {
        assert!((add(2.0, 3.0) - 5.0).abs() < f64::EPSILON);
    }

    #[test]
    fn test_add_negative() {
        assert!((add(-2.0, 3.0) - 1.0).abs() < f64::EPSILON);
    }

    #[test]
    fn test_subtract() {
        assert!((subtract(5.0, 3.0) - 2.0).abs() < f64::EPSILON);
    }

    #[test]
    fn test_multiply() {
        assert!((multiply(4.0, 3.0) - 12.0).abs() < f64::EPSILON);
    }

    #[test]
    fn test_multiply_by_zero() {
        assert!((multiply(4.0, 0.0) - 0.0).abs() < f64::EPSILON);
    }

    #[test]
    fn test_divide() {
        assert!((divide(10.0, 2.0).unwrap() - 5.0).abs() < f64::EPSILON);
    }

    #[test]
    fn test_divide_by_zero() {
        assert!(divide(10.0, 0.0).is_err());
    }
}
