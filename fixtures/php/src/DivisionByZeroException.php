<?php

declare(strict_types=1);

namespace Calculator;

use RuntimeException;

final class DivisionByZeroException extends RuntimeException
{
    public function __construct()
    {
        parent::__construct('Cannot divide by zero');
    }
}
