module Main (main) where

import Calculator
  ( add,
    divide,
    lastResult,
    multiply,
    newCalculator,
    subtract,
  )
import Errors (CalculatorError (..))
import qualified Operations
import System.Exit (exitFailure, exitSuccess)

epsilon :: Double
epsilon = 1e-9

assertClose :: String -> Double -> Double -> IO Bool
assertClose label expected actual =
  if abs (expected - actual) < epsilon
    then return True
    else do
      putStrLn $ "FAIL: " ++ label ++ " expected " ++ show expected ++ " got " ++ show actual
      return False

main :: IO ()
main = do
  results <-
    sequence
      [ testNewCalculator,
        testAdd,
        testSubtract,
        testMultiply,
        testDivide,
        testDivideByZero,
        testLastResult,
        testOperationsAdd,
        testOperationsSubtract,
        testOperationsMultiply,
        testOperationsDivide,
        testOperationsDivideByZero
      ]
  if and results
    then do
      putStrLn "All tests passed."
      exitSuccess
    else do
      putStrLn "Some tests failed."
      exitFailure

testNewCalculator :: IO Bool
testNewCalculator =
  assertClose "newCalculator lastResult" 0.0 (lastResult newCalculator)

testAdd :: IO Bool
testAdd =
  let (result, _) = add 2.0 3.0 newCalculator
   in assertClose "add 2 3" 5.0 result

testSubtract :: IO Bool
testSubtract =
  let (result, _) = subtract 5.0 3.0 newCalculator
   in assertClose "subtract 5 3" 2.0 result

testMultiply :: IO Bool
testMultiply =
  let (result, _) = multiply 4.0 3.0 newCalculator
   in assertClose "multiply 4 3" 12.0 result

testDivide :: IO Bool
testDivide = case divide 10.0 2.0 newCalculator of
  Right (result, _) -> assertClose "divide 10 2" 5.0 result
  Left _ -> do
    putStrLn "FAIL: divide 10 2 returned error"
    return False

testDivideByZero :: IO Bool
testDivideByZero = case divide 10.0 0.0 newCalculator of
  Left DivisionByZero -> return True
  _ -> do
    putStrLn "FAIL: divide 10 0 should return DivisionByZero"
    return False

testLastResult :: IO Bool
testLastResult =
  let (_, calc1) = add 1.0 2.0 newCalculator
      (_, calc2) = multiply 3.0 4.0 calc1
   in do
        r1 <- assertClose "lastResult after add" 3.0 (lastResult calc1)
        r2 <- assertClose "lastResult after multiply" 12.0 (lastResult calc2)
        return (r1 && r2)

testOperationsAdd :: IO Bool
testOperationsAdd =
  assertClose "Operations.add 2 3" 5.0 (Operations.add 2.0 3.0)

testOperationsSubtract :: IO Bool
testOperationsSubtract =
  assertClose "Operations.subtract 5 3" 2.0 (Operations.subtract 5.0 3.0)

testOperationsMultiply :: IO Bool
testOperationsMultiply =
  assertClose "Operations.multiply 4 3" 12.0 (Operations.multiply 4.0 3.0)

testOperationsDivide :: IO Bool
testOperationsDivide = case Operations.divide 10.0 2.0 of
  Right result -> assertClose "Operations.divide 10 2" 5.0 result
  Left _ -> do
    putStrLn "FAIL: Operations.divide 10 2 returned error"
    return False

testOperationsDivideByZero :: IO Bool
testOperationsDivideByZero = case Operations.divide 10.0 0.0 of
  Left DivisionByZero -> return True
  _ -> do
    putStrLn "FAIL: Operations.divide 10 0 should return DivisionByZero"
    return False
