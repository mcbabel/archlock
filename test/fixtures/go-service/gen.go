//go:build ignore

// Generates fixtures; not part of the package.
package main

import "example.com/shop/internal/model"

func main() { _ = model.User{} }
