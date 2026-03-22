module Operations
  ( add,
    subtract,
    multiply,
    divide,
  )
where

import Errors (CalculatorError (..))

-- | Returns the sum of two numbers.
add :: Double -> Double -> Double
add a b = a + b

-- | Returns the difference of two numbers.
subtract :: Double -> Double -> Double
subtract a b = a - b

-- | Returns the product of two numbers.
multiply :: Double -> Double -> Double
multiply a b = a * b

-- | Returns the quotient of two numbers.
-- Returns an error if the divisor is zero.
divide :: Double -> Double -> Either CalculatorError Double
divide _ 0.0 = Left DivisionByZero
divide a b = Right (a / b)
