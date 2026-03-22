<?php

declare(strict_types=1);

namespace Calculator;

final class Calculator
{
    /** @var list<float> */
    private array $history = [];

    public function add(float $a, float $b): float
    {
        $result = Operations::add($a, $b);
        $this->history[] = $result;

        return $result;
    }

    public function subtract(float $a, float $b): float
    {
        $result = Operations::subtract($a, $b);
        $this->history[] = $result;

        return $result;
    }

    public function multiply(float $a, float $b): float
    {
        $result = Operations::multiply($a, $b);
        $this->history[] = $result;

        return $result;
    }

    public function divide(float $a, float $b): float
    {
        $result = Operations::divide($a, $b);
        $this->history[] = $result;

        return $result;
    }

    /** @return list<float> */
    public function getHistory(): array
    {
        return $this->history;
    }

    public function clearHistory(): void
    {
        $this->history = [];
    }
}
