local errors = require("src.errors")

local operations = {}

--- Return the sum of a and b.
--- @param a number
--- @param b number
--- @return number
function operations.add(a, b)
    return a + b
end

--- Return the difference of a and b.
--- @param a number
--- @param b number
--- @return number
function operations.subtract(a, b)
    return a - b
end

--- Return the product of a and b.
--- @param a number
--- @param b number
--- @return number
function operations.multiply(a, b)
    return a * b
end

--- Return the quotient of a and b.
--- Raises an error if b is zero.
--- @param a number
--- @param b number
--- @return number
function operations.divide(a, b)
    if b == 0 then
        error(errors.division_by_zero())
    end
    return a / b
end

return operations
