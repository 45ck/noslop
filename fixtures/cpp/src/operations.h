#ifndef OPERATIONS_H
#define OPERATIONS_H

#include <stdexcept>

namespace operations {

double add(double a, double b);
double subtract(double a, double b);
double multiply(double a, double b);
double divide(double a, double b);

class DivisionByZeroError : public std::runtime_error {
  public:
    DivisionByZeroError();
};

} // namespace operations

#endif // OPERATIONS_H
