object Main {
  def greet(name: String): String = s"Hello, $name!"

  def main(args: Array[String]): Unit =
    println(greet("world"))
}
