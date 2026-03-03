defmodule App do
  def greet(name) do
    "Hello, #{name}!"
  end
end

IO.puts(App.greet("world"))
