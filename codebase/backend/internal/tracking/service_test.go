package tracking

import (
	"math"
	"testing"
)

func TestHaversineYangonDistance(t *testing.T) {
	distance := haversine(16.8, 96.15, 16.81, 96.15)
	if math.Abs(distance-1112) > 10 {
		t.Fatalf("distance=%f", distance)
	}
}
