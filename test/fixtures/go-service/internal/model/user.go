// Package model holds the domain types.
package model

import (
	"fmt"
	"time"
)

// ID identifies a user.
type ID string

// Role is what a user may do.
type Role int

const (
	Guest Role = iota
	Member
	Admin
	maxRole
)

// User is a customer account.
type User struct {
	ID        ID        `json:"id"`
	Name      string    `json:"name"`
	Email     string
	CreatedAt time.Time
	Roles     []Role
	password  string
	Audit
}

// Audit is embedded in records that track changes.
type Audit struct {
	UpdatedBy *User
}

// Validator checks a record.
type Validator interface {
	fmt.Stringer
	Validate() error
	validateInternal()
}

// Page is one page of results.
type Page[T any] struct {
	Items []T
	Next  *string
}

// Name is an alias kept for compatibility.
type Name = string
