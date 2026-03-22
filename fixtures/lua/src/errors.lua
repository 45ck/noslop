local errors = {}

--- Create a new DivisionByZeroError.
--- @return string
function errors.division_by_zero()
    return "DivisionByZeroError: Cannot divide by zero"
end

return errors
