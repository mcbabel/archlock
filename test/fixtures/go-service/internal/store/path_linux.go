//go:build linux

package store

// DefaultPath is where the store lives on this system.
func DefaultPath() string { return "/var/lib/shop" }
