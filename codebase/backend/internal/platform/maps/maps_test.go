package maps

import (
	"context"
	"io"
	"net/http"
	"strings"
	"testing"
)

type roundTripFunc func(*http.Request) (*http.Response, error)

func (f roundTripFunc) RoundTrip(r *http.Request) (*http.Response, error) { return f(r) }

func TestOSRMRoute(t *testing.T) {
	client := &http.Client{Transport: roundTripFunc(func(r *http.Request) (*http.Response, error) {
		if r.URL.Path != "/route/v1/driving/96.200000,16.800000;96.210000,16.810000" {
			t.Errorf("path=%s", r.URL.Path)
		}
		return &http.Response{StatusCode: http.StatusOK, Header: make(http.Header), Body: io.NopCloser(strings.NewReader(`{"code":"Ok","routes":[{"distance":2450.4,"duration":721.6,"geometry":"encoded"}]}`))}, nil
	})}
	route, err := newOSRMWithClient("http://maps.test", client).Route(context.Background(), Point{Latitude: 16.8, Longitude: 96.2}, Point{Latitude: 16.81, Longitude: 96.21})
	if err != nil {
		t.Fatal(err)
	}
	if route.DistanceMeters != 2450 || route.DurationSeconds != 722 || route.EncodedGeometry != "encoded" {
		t.Fatalf("unexpected route: %+v", route)
	}
}
func TestOSRMRejectsZeroCoordinates(t *testing.T) {
	if _, err := NewOSRM("http://invalid").Route(context.Background(), Point{}, Point{Latitude: 1, Longitude: 1}); err == nil {
		t.Fatal("expected invalid coordinates")
	}
}
