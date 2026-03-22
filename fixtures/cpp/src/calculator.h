#ifndef CALCULATOR_H
#define CALCULATOR_H

#include <stdexcept>

class Calculator {
  public:
    Calculator();

    double add(double a, double b);
    double subtract(double a, double b);
    double multiply(double a, double b);
    double divide(double a, double b);
    double lastResult() const;

  private:
    double last_result_;
};

#endif // CALCULATOR_H
