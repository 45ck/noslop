<?php

declare(strict_types=1);

function greet(string $name): string
{
    return "Hello, {$name}!";
}

echo greet('world') . PHP_EOL;
