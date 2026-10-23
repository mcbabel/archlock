// Package log writes structured log lines.
package log

import "fmt"

// Logger writes lines with a prefix.
type Logger struct {
	Prefix string
}

// Printf writes one formatted line.
func (l Logger) Printf(format string, args ...any) {
	fmt.Printf(l.Prefix+format+"\n", args...)
}
