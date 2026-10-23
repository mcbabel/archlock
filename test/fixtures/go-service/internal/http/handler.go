// Package http serves the shop API.
package http

import (
	"encoding/json"
	"net/http"

	"example.com/shared/log"
	"example.com/shop"
	"example.com/shop/internal/model"
	"example.com/shop/internal/store"
	"github.com/google/uuid"
)

// Handler serves the API.
type Handler struct {
	Store  *store.Store
	Logger log.Logger
	cfg    shop.Config
}

// NewHandler builds a Handler.
func NewHandler(s *store.Store, opts ...shop.Option) *Handler {
	return &Handler{Store: s}
}

// ServeHTTP implements http.Handler.
func (h *Handler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	_ = json.NewEncoder(w).Encode(model.User{ID: model.ID(uuid.NewString())})
}
