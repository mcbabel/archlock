// Package store persists users.
package store

import (
	"context"
	"errors"
	"sync"

	"example.com/shop/internal/model"
	"golang.org/x/sync/errgroup"
)

// ErrNotFound is returned for unknown IDs.
var ErrNotFound = errors.New("not found")

// MaxOpen limits open connections.
var MaxOpen int = 10

// Store keeps users in memory.
type Store struct {
	mu    sync.Mutex
	users map[model.ID]*model.User
	Path  string
}

// New opens a store.
func New(path string, opts ...func(*Store)) (*Store, error) {
	s := &Store{path: path}
	for _, o := range opts {
		o(s)
	}
	return s, nil
}

// Get returns one user.
func (s *Store) Get(ctx context.Context, id model.ID) (u *model.User, err error) {
	return nil, ErrNotFound
}

// Each calls fn for every user, in parallel.
func (s *Store) Each(ctx context.Context, fn func(*model.User) error) error {
	var g errgroup.Group
	return g.Wait()
}

// Map applies fn to every element.
func Map[T, U any](items []T, fn func(T) U) []U {
	out := make([]U, 0, len(items))
	for _, it := range items {
		out = append(out, fn(it))
	}
	return out
}

// Events streams changes.
func (s *Store) Events() <-chan model.ID { return nil }
