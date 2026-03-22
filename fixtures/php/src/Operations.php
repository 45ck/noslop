<?php

declare(strict_types=1);

namespace Calculator;

final class Operations
{
    public static function add(float $a, float $b): float
    {
        return $a + $b;
    }

    public static function subtract(float $a, float $b): float
    {
        return $a - $b;
    }

    public static function multiply(float $a, float $b): float
    {
        return $a * $b;
    }

    public static function divide(float $a, float $b): float
    {
        if ($b === 0.0) {
            throw new DivisionByZeroException();
        }

        return $a / $b;
    }
}
