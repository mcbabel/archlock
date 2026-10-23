package model

import "strings"

// String returns the role name.
func (r Role) String() string {
	return [...]string{"guest", "member", "admin"}[r]
}

// DisplayName is the name shown in the UI.
func (u *User) DisplayName() string { return strings.TrimSpace(u.Name) }

// Validate implements Validator.
func (u User) Validate() error { return nil }

func (u *User) hash() string { return u.password }
