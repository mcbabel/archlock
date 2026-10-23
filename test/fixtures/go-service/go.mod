module example.com/shop

go 1.22

require (
	example.com/shared v0.0.0
	github.com/google/uuid v1.6.0 // indirect
)

require golang.org/x/sync v0.7.0

replace example.com/shared => ./shared
