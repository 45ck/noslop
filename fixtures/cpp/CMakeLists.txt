cmake_minimum_required(VERSION 3.14)
project(calculator LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_library(calculator
    src/calculator.cpp
    src/operations.cpp
)
target_include_directories(calculator PUBLIC src)

enable_testing()

add_executable(calculator_test tests/calculator_test.cpp)
target_link_libraries(calculator_test PRIVATE calculator)
add_test(NAME calculator_test COMMAND calculator_test)
