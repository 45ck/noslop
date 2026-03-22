module Calculator
  ( Calculator (..),
    newCalculator,
    add,
    subtract,
    multiply,
    divide,
    lastResult,
  )
where

import Errors (CalculatorError (..))
import qualified Operations

-- | A simple calculator that tracks the last result.
data Calculator = Calculator
  { calcLastResult :: Double
  }
  deriving (Show)

-- | Creates a new calculator with a zero initial result.
newCalculator :: Calculator
newCalculator = Calculator {calcLastResult = 0.0}

-- | Returns the sum of two numbers and updates the last result.
add :: Double -> Double -> Calculator -> (Double, Calculator)
add a b calc =
  let result = Operations.add a b
   in (result, calc {calcLastResult = result})

-- | Returns the difference of two numbers and updates the last result.
subtract :: Double -> Double -> Calculator -> (Double, Calculator)
subtract a b calc =
  let result = Operations.subtract a b
   in (result, calc {calcLastResult = result})

-- | Returns the product of two numbers and updates the last result.
multiply :: Double -> Double -> Calculator -> (Double, Calculator)
multiply a b calc =
  let result = Operations.multiply a b
   in (result, calc {calcLastResult = result})

-- | Returns the quotient of two numbers and updates the last result.
-- Returns an error if the divisor is zero.
divide :: Double -> Double -> Calculator -> Either CalculatorError (Double, Calculator)
divide a b calc = case Operations.divide a b of
  Left err -> Left err
  Right result -> Right (result, calc {calcLastResult = result})

-- | Returns the last result from the calculator.
lastResult :: Calculator -> Double
lastResult = calcLastResult
