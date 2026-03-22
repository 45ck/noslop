use calculator::Calculator;

#[test]
fn test_calculator_workflow() {
    let mut calc = Calculator::new();

    let sum = calc.add(10.0, 5.0);
    assert!((sum - 15.0).abs() < f64::EPSILON);

    let diff = calc.subtract(sum, 3.0);
    assert!((diff - 12.0).abs() < f64::EPSILON);

    let product = calc.multiply(diff, 2.0);
    assert!((product - 24.0).abs() < f64::EPSILON);

    let quotient = calc.divide(product, 4.0).unwrap();
    assert!((quotient - 6.0).abs() < f64::EPSILON);

    assert!((calc.last_result() - 6.0).abs() < f64::EPSILON);
}

#[test]
fn test_division_by_zero_returns_error() {
    let mut calc = Calculator::new();
    let result = calc.divide(10.0, 0.0);
    assert!(result.is_err());
}

#[test]
fn test_default_constructor() {
    let calc = Calculator::default();
    assert!((calc.last_result() - 0.0).abs() < f64::EPSILON);
}
