<?php

declare(strict_types=1);

namespace Calculator\Tests;

use Calculator\Calculator;
use Calculator\DivisionByZeroException;
use PHPUnit\Framework\TestCase;

final class CalculatorTest extends TestCase
{
    public function testAdd(): void
    {
        $calc = new Calculator();
        self::assertSame(5.0, $calc->add(2, 3));
    }

    public function testSubtract(): void
    {
        $calc = new Calculator();
        self::assertSame(2.0, $calc->subtract(5, 3));
    }

    public function testMultiply(): void
    {
        $calc = new Calculator();
        self::assertSame(12.0, $calc->multiply(4, 3));
    }

    public function testDivide(): void
    {
        $calc = new Calculator();
        self::assertSame(5.0, $calc->divide(10, 2));
    }

    public function testDivideByZero(): void
    {
        $calc = new Calculator();
        $this->expectException(DivisionByZeroException::class);
        $calc->divide(1, 0);
    }

    public function testHistory(): void
    {
        $calc = new Calculator();
        $calc->add(1, 2);
        $calc->multiply(3, 4);
        self::assertSame([3.0, 12.0], $calc->getHistory());
    }

    public function testClearHistory(): void
    {
        $calc = new Calculator();
        $calc->add(1, 2);
        $calc->clearHistory();
        self::assertSame([], $calc->getHistory());
    }
}
