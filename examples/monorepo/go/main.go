package main

import "fmt"

func greet(name string) string {
	return "Hello, " + name + "!"
}

func main() {
	fmt.Println(greet("world"))
}
