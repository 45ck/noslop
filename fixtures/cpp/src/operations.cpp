#include "operations.h"

namespace operations {

double add(double a, double b) { return a + b; }

double subtract(double a, double b) { return a - b; }

double multiply(double a, double b) { return a * b; }

double divide(double a, double b) {
    if (b == 0.0) {
        throw DivisionByZeroError();
    }
    return a / b;
}

DivisionByZeroError::DivisionByZeroError() : std::runtime_error("division by zero") {}

} // namespace operations
