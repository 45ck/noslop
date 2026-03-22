package calculator

class Calculator {
    private var lastResult: Double = 0.0

    fun add(a: Double, b: Double): Double {
        lastResult = Operations.add(a, b)
        return lastResult
    }

    fun subtract(a: Double, b: Double): Double {
        lastResult = Operations.subtract(a, b)
        return lastResult
    }

    fun multiply(a: Double, b: Double): Double {
        lastResult = Operations.multiply(a, b)
        return lastResult
    }

    fun divide(a: Double, b: Double): Double {
        lastResult = Operations.divide(a, b)
        return lastResult
    }

    fun getLastResult(): Double = lastResult
}
