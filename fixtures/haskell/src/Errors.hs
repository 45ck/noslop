module Errors
  ( CalculatorError (..),
  )
where

-- | Errors that can occur during calculator operations.
data CalculatorError
  = DivisionByZero
  deriving (Show, Eq)
