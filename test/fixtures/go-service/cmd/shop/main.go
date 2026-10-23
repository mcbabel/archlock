package main

import (
	"log"

	"example.com/shop"
	shophttp "example.com/shop/internal/http"
	"example.com/shop/internal/store"
)

// Run is exported but main packages cannot be imported.
func Run() error { return nil }

func main() {
	s, err := store.New("shop.db")
	if err != nil {
		log.Fatal(err)
	}
	_ = shophttp.NewHandler(s, shop.WithAddr(":8080"))
}
