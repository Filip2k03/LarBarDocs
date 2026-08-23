package maps

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"
)

type Place struct {
	ProviderID string  `json:"provider_id"`
	Name       string  `json:"name"`
	Address    string  `json:"address"`
	Latitude   float64 `json:"lat"`
	Longitude  float64 `json:"lng"`
}

type Geocoder interface {
	Search(context.Context, string, int) ([]Place, error)
	Reverse(context.Context, Point) (Place, error)
}

type Nominatim struct {
	baseURL string
	client  *http.Client
}

func NewNominatim(baseURL string) *Nominatim {
	return &Nominatim{baseURL: strings.TrimRight(baseURL, "/"), client: &http.Client{Timeout: 8 * time.Second}}
}

func (n *Nominatim) Search(ctx context.Context, query string, limit int) ([]Place, error) {
	query = strings.TrimSpace(query)
	if len(query) < 2 {
		return nil, errors.New("search query must contain at least two characters")
	}
	if limit <= 0 || limit > 10 {
		limit = 5
	}
	values := url.Values{"q": {query}, "format": {"jsonv2"}, "addressdetails": {"1"}, "limit": {strconv.Itoa(limit)}, "countrycodes": {"mm"}}
	var raw []struct {
		PlaceID     int64  `json:"place_id"`
		DisplayName string `json:"display_name"`
		Name        string `json:"name"`
		Lat         string `json:"lat"`
		Lon         string `json:"lon"`
	}
	if err := n.get(ctx, "/search?"+values.Encode(), &raw); err != nil {
		return nil, err
	}
	result := make([]Place, 0, len(raw))
	for _, item := range raw {
		lat, latErr := strconv.ParseFloat(item.Lat, 64)
		lng, lngErr := strconv.ParseFloat(item.Lon, 64)
		if latErr != nil || lngErr != nil {
			continue
		}
		name := item.Name
		if name == "" {
			name = item.DisplayName
		}
		result = append(result, Place{ProviderID: strconv.FormatInt(item.PlaceID, 10), Name: name, Address: item.DisplayName, Latitude: lat, Longitude: lng})
	}
	return result, nil
}

func (n *Nominatim) Reverse(ctx context.Context, point Point) (Place, error) {
	if !valid(point) {
		return Place{}, errors.New("invalid reverse-geocode coordinates")
	}
	values := url.Values{"lat": {strconv.FormatFloat(point.Latitude, 'f', 7, 64)}, "lon": {strconv.FormatFloat(point.Longitude, 'f', 7, 64)}, "format": {"jsonv2"}, "addressdetails": {"1"}}
	var raw struct {
		PlaceID     int64  `json:"place_id"`
		DisplayName string `json:"display_name"`
		Name        string `json:"name"`
		Lat         string `json:"lat"`
		Lon         string `json:"lon"`
	}
	if err := n.get(ctx, "/reverse?"+values.Encode(), &raw); err != nil {
		return Place{}, err
	}
	lat, err := strconv.ParseFloat(raw.Lat, 64)
	if err != nil {
		return Place{}, ErrRouteUnavailable
	}
	lng, err := strconv.ParseFloat(raw.Lon, 64)
	if err != nil {
		return Place{}, ErrRouteUnavailable
	}
	name := raw.Name
	if name == "" {
		name = raw.DisplayName
	}
	return Place{ProviderID: strconv.FormatInt(raw.PlaceID, 10), Name: name, Address: raw.DisplayName, Latitude: lat, Longitude: lng}, nil
}

func (n *Nominatim) get(ctx context.Context, path string, target any) error {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, n.baseURL+path, nil)
	if err != nil {
		return err
	}
	req.Header.Set("User-Agent", "LaBar-Backend/1.0")
	req.Header.Set("Accept", "application/json")
	response, err := n.client.Do(req)
	if err != nil {
		return err
	}
	defer response.Body.Close()
	if response.StatusCode != http.StatusOK {
		return ErrRouteUnavailable
	}
	return json.NewDecoder(response.Body).Decode(target)
}
