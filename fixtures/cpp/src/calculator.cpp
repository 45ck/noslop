#include "calculator.h"
#include "operations.h"

Calculator::Calculator() : last_result_(0.0) {}

double Calculator::add(double a, double b) {
    last_result_ = operations::add(a, b);
    return last_result_;
}

double Calculator::subtract(double a, double b) {
    last_result_ = operations::subtract(a, b);
    return last_result_;
}

double Calculator::multiply(double a, double b) {
    last_result_ = operations::multiply(a, b);
    return last_result_;
}

double Calculator::divide(double a, double b) {
    last_result_ = operations::divide(a, b);
    return last_result_;
}

double Calculator::lastResult() const { return last_result_; }
