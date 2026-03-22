local operations = require("src.operations")

local Calculator = {}
Calculator.__index = Calculator

--- Create a new Calculator instance.
--- @return table
function Calculator.new()
    local self = setmetatable({}, Calculator)
    self._history = {}
    return self
end

--- Add two numbers and record the result.
--- @param a number
--- @param b number
--- @return number
function Calculator:add(a, b)
    local result = operations.add(a, b)
    table.insert(self._history, result)
    return result
end

--- Subtract b from a and record the result.
--- @param a number
--- @param b number
--- @return number
function Calculator:subtract(a, b)
    local result = operations.subtract(a, b)
    table.insert(self._history, result)
    return result
end

--- Multiply two numbers and record the result.
--- @param a number
--- @param b number
--- @return number
function Calculator:multiply(a, b)
    local result = operations.multiply(a, b)
    table.insert(self._history, result)
    return result
end

--- Divide a by b and record the result.
--- @param a number
--- @param b number
--- @return number
function Calculator:divide(a, b)
    local result = operations.divide(a, b)
    table.insert(self._history, result)
    return result
end

--- Return a copy of the calculation history.
--- @return table
function Calculator:get_history()
    local copy = {}
    for i, v in ipairs(self._history) do
        copy[i] = v
    end
    return copy
end

--- Clear the calculation history.
function Calculator:clear_history()
    self._history = {}
end

return Calculator
