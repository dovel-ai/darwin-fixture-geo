// Package geo is a small great-circle geometry library. It is a Darwin test fixture: its exported API changes on a
// schedule (.github/fixture/release-next.mjs), so a repository depending on it keeps receiving real API changes.
package geo

import (
	"fmt"
	"math"
	"strconv"
	"strings"
)

// Point is a position in degrees.
type Point struct {
	Lat float64
	Lon float64
}

const earthRadiusKm = 6371.0

func radians(d float64) float64 { return d * math.Pi / 180 }
func degrees(r float64) float64 { return r * 180 / math.Pi }

func haversine(a, b Point) float64 {
	dLat := radians(b.Lat - a.Lat)
	dLon := radians(b.Lon - a.Lon)
	h := math.Sin(dLat/2)*math.Sin(dLat/2) + math.Cos(radians(a.Lat))*math.Cos(radians(b.Lat))*math.Sin(dLon/2)*math.Sin(dLon/2)
	return 2 * earthRadiusKm * math.Asin(math.Min(1, math.Sqrt(h)))
}

func initialBearing(a, b Point) float64 {
	y := math.Sin(radians(b.Lon-a.Lon)) * math.Cos(radians(b.Lat))
	x := math.Cos(radians(a.Lat))*math.Sin(radians(b.Lat)) - math.Sin(radians(a.Lat))*math.Cos(radians(b.Lat))*math.Cos(radians(b.Lon-a.Lon))
	return math.Mod(degrees(math.Atan2(y, x))+360, 360)
}

func interpolate(a, b Point, fraction float64) Point {
	d := haversine(a, b) / earthRadiusKm
	if d == 0 {
		return a
	}
	s := math.Sin(d)
	fa := math.Sin((1-fraction)*d) / s
	fb := math.Sin(fraction*d) / s
	x := fa*math.Cos(radians(a.Lat))*math.Cos(radians(a.Lon)) + fb*math.Cos(radians(b.Lat))*math.Cos(radians(b.Lon))
	y := fa*math.Cos(radians(a.Lat))*math.Sin(radians(a.Lon)) + fb*math.Cos(radians(b.Lat))*math.Sin(radians(b.Lon))
	z := fa*math.Sin(radians(a.Lat)) + fb*math.Sin(radians(b.Lat))
	return Point{Lat: degrees(math.Atan2(z, math.Sqrt(x*x+y*y))), Lon: degrees(math.Atan2(y, x))}
}

func formatPoint(p Point) string { return fmt.Sprintf("%.5f,%.5f", p.Lat, p.Lon) }

func parsePoint(s string) (Point, error) {
	parts := strings.Split(strings.TrimSpace(s), ",")
	if len(parts) != 2 {
		return Point{}, fmt.Errorf("geo: %q is not \"lat,lon\"", s)
	}
	lat, err := strconv.ParseFloat(strings.TrimSpace(parts[0]), 64)
	if err != nil {
		return Point{}, fmt.Errorf("geo: latitude: %w", err)
	}
	lon, err := strconv.ParseFloat(strings.TrimSpace(parts[1]), 64)
	if err != nil {
		return Point{}, fmt.Errorf("geo: longitude: %w", err)
	}
	return Point{Lat: lat, Lon: lon}, nil
}
