// Package shop is the public entry point of the shop service.
package shop

// Version is the release of the service.
const Version = "1.4.0"

// Config holds the service settings.
type Config struct {
	Addr    string
	Debug   bool
	retries int
}

// Option changes a Config.
type Option func(*Config)

// WithAddr sets the listen address.
func WithAddr(addr string) Option {
	return func(c *Config) { c.Addr = addr }
}
