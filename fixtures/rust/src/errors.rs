use std::fmt;

#[derive(Debug, PartialEq)]
pub enum CalculatorError {
    DivisionByZero,
}

impl fmt::Display for CalculatorError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            CalculatorError::DivisionByZero => write!(f, "division by zero"),
        }
    }
}

impl std::error::Error for CalculatorError {}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_display() {
        let err = CalculatorError::DivisionByZero;
        assert_eq!(format!("{err}"), "division by zero");
    }

    #[test]
    fn test_debug() {
        let err = CalculatorError::DivisionByZero;
        assert_eq!(format!("{err:?}"), "DivisionByZero");
    }

    #[test]
    fn test_equality() {
        assert_eq!(CalculatorError::DivisionByZero, CalculatorError::DivisionByZero);
    }
}
