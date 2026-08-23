package maps

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"
)

var ErrRouteUnavailable = errors.New("route unavailable")

type Point struct {
	Latitude  float64 `json:"lat"`
	Longitude float64 `json:"lng"`
}
type Route struct {
	DistanceMeters  int64  `json:"distance_meters"`
	DurationSeconds int64  `json:"duration_seconds"`
	EncodedGeometry string `json:"encoded_geometry,omitempty"`
}
type Provider interface {
	Route(context.Context, Point, Point) (Route, error)
}

type OSRM struct {
	baseURL string
	client  *http.Client
}

func NewOSRM(baseURL string) *OSRM {
	return &OSRM{baseURL: strings.TrimRight(baseURL, "/"), client: &http.Client{Timeout: 8 * time.Second}}
}
func (o *OSRM) Route(ctx context.Context, pickup, destination Point) (Route, error) {
	if !valid(pickup) || !valid(destination) {
		return Route{}, errors.New("invalid route coordinates")
	}
	path := fmt.Sprintf("%s/route/v1/driving/%f,%f;%f,%f", o.baseURL, pickup.Longitude, pickup.Latitude, destination.Longitude, destination.Latitude)
	query := url.Values{"overview": {"simplified"}, "geometries": {"polyline6"}, "steps": {"false"}}
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, path+"?"+query.Encode(), nil)
	if err != nil {
		return Route{}, err
	}
	response, err := o.client.Do(req)
	if err != nil {
		return Route{}, fmt.Errorf("OSRM request: %w", err)
	}
	defer response.Body.Close()
	if response.StatusCode != http.StatusOK {
		return Route{}, ErrRouteUnavailable
	}
	var body struct {
		Code   string `json:"code"`
		Routes []struct {
			Distance float64 `json:"distance"`
			Duration float64 `json:"duration"`
			Geometry string  `json:"geometry"`
		} `json:"routes"`
	}
	if err := json.NewDecoder(response.Body).Decode(&body); err != nil {
		return Route{}, fmt.Errorf("decode OSRM response: %w", err)
	}
	if body.Code != "Ok" || len(body.Routes) == 0 {
		return Route{}, ErrRouteUnavailable
	}
	route := body.Routes[0]
	return Route{DistanceMeters: int64(route.Distance + 0.5), DurationSeconds: int64(route.Duration + 0.5), EncodedGeometry: route.Geometry}, nil
}
func valid(p Point) bool {
	return p.Latitude >= -90 && p.Latitude <= 90 && p.Longitude >= -180 && p.Longitude <= 180 && !(p.Latitude == 0 && p.Longitude == 0)
}
