#include "calculator.h"
#include "operations.h"
#include <cassert>
#include <cmath>
#include <iostream>

static const double EPSILON = 1e-9;

static void test_new_calculator() {
    Calculator calc;
    assert(std::abs(calc.lastResult()) < EPSILON);
}

static void test_add() {
    Calculator calc;
    double result = calc.add(2.0, 3.0);
    assert(std::abs(result - 5.0) < EPSILON);
}

static void test_subtract() {
    Calculator calc;
    double result = calc.subtract(5.0, 3.0);
    assert(std::abs(result - 2.0) < EPSILON);
}

static void test_multiply() {
    Calculator calc;
    double result = calc.multiply(4.0, 3.0);
    assert(std::abs(result - 12.0) < EPSILON);
}

static void test_divide() {
    Calculator calc;
    double result = calc.divide(10.0, 2.0);
    assert(std::abs(result - 5.0) < EPSILON);
}

static void test_divide_by_zero() {
    Calculator calc;
    bool caught = false;
    try {
        calc.divide(10.0, 0.0);
    } catch (const operations::DivisionByZeroError &) {
        caught = true;
    }
    assert(caught);
}

static void test_last_result() {
    Calculator calc;
    calc.add(1.0, 2.0);
    assert(std::abs(calc.lastResult() - 3.0) < EPSILON);
    calc.multiply(3.0, 4.0);
    assert(std::abs(calc.lastResult() - 12.0) < EPSILON);
}

static void test_operations_add() {
    assert(std::abs(operations::add(2.0, 3.0) - 5.0) < EPSILON);
}

static void test_operations_subtract() {
    assert(std::abs(operations::subtract(5.0, 3.0) - 2.0) < EPSILON);
}

static void test_operations_multiply() {
    assert(std::abs(operations::multiply(4.0, 3.0) - 12.0) < EPSILON);
}

static void test_operations_divide() {
    assert(std::abs(operations::divide(10.0, 2.0) - 5.0) < EPSILON);
}

int main() {
    test_new_calculator();
    test_add();
    test_subtract();
    test_multiply();
    test_divide();
    test_divide_by_zero();
    test_last_result();
    test_operations_add();
    test_operations_subtract();
    test_operations_multiply();
    test_operations_divide();

    std::cout << "All tests passed." << std::endl;
    return 0;
}
