package model

// Number is any numeric type a price can have.
type Number interface {
	~int | ~int64 | ~float64
}

// Sum adds up numbers.
func Sum[N Number](values ...N) N {
	var total N
	for _, v := range values {
		total += v
	}
	return total
}
