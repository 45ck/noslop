local Calculator = require("src.calculator")

describe("Calculator", function()
    local calc

    before_each(function()
        calc = Calculator.new()
    end)

    it("adds two numbers", function()
        assert.are.equal(5, calc:add(2, 3))
    end)

    it("subtracts two numbers", function()
        assert.are.equal(2, calc:subtract(5, 3))
    end)

    it("multiplies two numbers", function()
        assert.are.equal(12, calc:multiply(4, 3))
    end)

    it("divides two numbers", function()
        assert.are.equal(5, calc:divide(10, 2))
    end)

    it("raises error on division by zero", function()
        assert.has_error(function()
            calc:divide(1, 0)
        end)
    end)

    it("tracks history", function()
        calc:add(1, 2)
        calc:multiply(3, 4)
        local history = calc:get_history()
        assert.are.equal(3, history[1])
        assert.are.equal(12, history[2])
    end)

    it("clears history", function()
        calc:add(1, 2)
        calc:clear_history()
        assert.are.same({}, calc:get_history())
    end)
end)
