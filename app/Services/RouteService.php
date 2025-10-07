<?php

namespace App\Services;

use App\Models\Shop;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RouteService
{
    private const EARTH_RADIUS_KM = 6371;

    private const OSRM_BASE_URL = 'http://router.project-osrm.org';

    private const CACHE_TTL = 3600; // 1 hour

    /**
     * Get route with alternatives (main + 2 alternatives)
     * Strategy: OSRM for geometry, Floyd-Warshall for validation
     */
    public function getRoute(
        float $userLatitude,
        float $userLongitude,
        float $shopLatitude,
        float $shopLongitude
    ): ?array {
        try {
            // Validate coordinates
            $this->validateCoordinates($userLatitude, $userLongitude, $shopLatitude, $shopLongitude);

            Log::info('Getting routes', [
                'from' => [$userLatitude, $userLongitude],
                'to' => [$shopLatitude, $shopLongitude],
            ]);

            // Get 3 different routes from OSRM
            $osrmRoutes = $this->getOSRMAlternatives($userLatitude, $userLongitude, $shopLatitude, $shopLongitude);

            if (empty($osrmRoutes)) {
                return $this->createFallbackRoute($userLatitude, $userLongitude, $shopLatitude, $shopLongitude);
            }

            // Validate and score each route with Floyd-Warshall
            $scoredRoutes = $this->scoreRoutes($osrmRoutes, $userLatitude, $userLongitude, $shopLatitude, $shopLongitude);

            // Sort by score and add ranking
            usort($scoredRoutes, fn ($a, $b) => $a['score'] <=> $b['score']);

            foreach ($scoredRoutes as $index => &$route) {
                $route['rank'] = $index + 1;
            }

            Log::info('Routes prepared', [
                'count' => count($scoredRoutes),
                'scores' => array_map(fn ($r) => [
                    'rank' => $r['rank'],
                    'distance' => $r['properties']['distance'],
                    'score' => $r['score'],
                ], $scoredRoutes),
            ]);

            // Return main + alternatives
            return [
                'main' => $scoredRoutes[0] ?? null,
                'alternatives' => array_slice($scoredRoutes, 1, 2),
                'all' => $scoredRoutes,
            ];
        } catch (\Exception $e) {
            Log::error('Error in getRoute: '.$e->getMessage());

            return $this->createFallbackRoute($userLatitude, $userLongitude, $shopLatitude, $shopLongitude);
        }
    }

    /**
     * Get OSRM alternative routes (up to 3 routes)
     */
    private function getOSRMAlternatives(
        float $userLat,
        float $userLng,
        float $shopLat,
        float $shopLng
    ): array {
        $cacheKey = 'osrm_alt_'.md5("{$userLat},{$userLng};{$shopLat},{$shopLng}");

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($userLat, $userLng, $shopLat, $shopLng) {
            $routes = [];

            // 1. Try to get OSRM alternatives
            $osrmRoutes = $this->fetchOSRMRoutes($userLat, $userLng, $shopLat, $shopLng);
            $routes = array_merge($routes, $osrmRoutes);

            // 2. If less than 3, generate via geographic waypoints
            if (count($routes) < 3) {
                $additionalRoutes = $this->generateAlternativeRoutes(
                    $userLat,
                    $userLng,
                    $shopLat,
                    $shopLng,
                    3 - count($routes)
                );
                $routes = array_merge($routes, $additionalRoutes);
            }

            Log::info('OSRM alternatives fetched', [
                'count' => count($routes),
                'distances' => array_map(fn ($r) => $r['properties']['distance'], $routes),
            ]);

            return $routes;
        });
    }

    /**
     * Fetch routes from OSRM API
     */
    private function fetchOSRMRoutes(float $userLat, float $userLng, float $shopLat, float $shopLng): array
    {
        try {
            $coordinates = "{$userLng},{$userLat};{$shopLng},{$shopLat}";
            $url = self::OSRM_BASE_URL."/route/v1/driving/{$coordinates}";

            $response = Http::timeout(10)->get($url, [
                'overview' => 'full',
                'geometries' => 'geojson',
                'alternatives' => 'true',
                'continue_straight' => 'false',
            ]);

            if (! $response->successful() || $response->json('code') !== 'Ok') {
                return [];
            }

            $routes = [];
            foreach ($response->json('routes', []) as $index => $route) {
                $routes[] = [
                    'type' => 'Feature',
                    'geometry' => $route['geometry'],
                    'properties' => [
                        'distance' => round($route['distance'] / 1000, 2),
                        'duration' => round($route['duration'] / 60, 1),
                        'summary' => 'Route '.($index + 1),
                        'source' => 'osrm-direct',
                    ],
                ];
            }

            return $routes;
        } catch (\Exception $e) {
            Log::error('OSRM fetch error: '.$e->getMessage());

            return [];
        }
    }

    /**
     * Generate alternative routes via geographic waypoints
     */
    private function generateAlternativeRoutes(
        float $userLat,
        float $userLng,
        float $shopLat,
        float $shopLng,
        int $count
    ): array {
        $routes = [];

        // Calculate direct distance for reference
        $directDistance = $this->calculateDistance($userLat, $userLng, $shopLat, $shopLng);

        // Generate offset waypoints (left and right of direct path)
        $waypoints = $this->generateGeographicWaypoints($userLat, $userLng, $shopLat, $shopLng, $count * 3);

        Log::info('Generating alternative routes', [
            'direct_distance' => $directDistance,
            'waypoints_count' => count($waypoints),
        ]);

        foreach ($waypoints as $index => $waypoint) {
            $route = $this->getRouteViaWaypoint($userLat, $userLng, $waypoint['lat'], $waypoint['lng'], $shopLat, $shopLng);

            if ($route) {
                // More lenient filter: accept routes up to 2x direct distance (100% longer)
                $maxAcceptableDistance = $directDistance * 2.0;

                Log::info('Alternative route generated', [
                    'index' => $index,
                    'distance' => $route['distance'],
                    'direct_distance' => $directDistance,
                    'max_acceptable' => $maxAcceptableDistance,
                    'accepted' => $route['distance'] <= $maxAcceptableDistance,
                ]);

                if ($route['distance'] <= $maxAcceptableDistance) {
                    $routes[] = [
                        'type' => 'Feature',
                        'geometry' => $route['geometry'],
                        'properties' => [
                            'distance' => $route['distance'],
                            'duration' => $route['duration'],
                            'summary' => 'Alternative route '.($index + 1),
                            'source' => 'osrm-waypoint',
                        ],
                    ];

                    // Stop if we have enough routes
                    if (count($routes) >= $count) {
                        break;
                    }
                }
            }
        }

        Log::info('Alternative routes generated', [
            'requested' => $count,
            'generated' => count($routes),
        ]);

        return $routes;
    }

    /**
     * Generate geographic waypoints offset from direct path
     */
    private function generateGeographicWaypoints(
        float $userLat,
        float $userLng,
        float $shopLat,
        float $shopLng,
        int $count
    ): array {
        $waypoints = [];

        // Midpoint
        $midLat = ($userLat + $shopLat) / 2;
        $midLng = ($userLng + $shopLng) / 2;

        // Perpendicular vector
        $latDiff = $shopLat - $userLat;
        $lngDiff = $shopLng - $userLng;

        $perpLat = -$lngDiff;
        $perpLng = $latDiff;

        // Normalize
        $length = sqrt($perpLat * $perpLat + $perpLng * $perpLng);
        if ($length > 0) {
            $perpLat /= $length;
            $perpLng /= $length;
        }

        // Different offsets (in degrees, ~200-500 meters)
        // Smaller offsets for more realistic alternative routes
        $offsets = [0.003, -0.003, 0.005, -0.005];

        foreach (array_slice($offsets, 0, $count) as $offset) {
            $waypoints[] = [
                'lat' => $midLat + ($perpLat * $offset),
                'lng' => $midLng + ($perpLng * $offset),
            ];
        }

        return $waypoints;
    }

    /**
     * Get route via waypoint
     */
    private function getRouteViaWaypoint(
        float $userLat,
        float $userLng,
        float $wpLat,
        float $wpLng,
        float $shopLat,
        float $shopLng
    ): ?array {
        try {
            $coordinates = "{$userLng},{$userLat};{$wpLng},{$wpLat};{$shopLng},{$shopLat}";
            $url = self::OSRM_BASE_URL."/route/v1/driving/{$coordinates}";

            $response = Http::timeout(10)->get($url, [
                'overview' => 'full',
                'geometries' => 'geojson',
            ]);

            if (! $response->successful() || $response->json('code') !== 'Ok') {
                return null;
            }

            $route = $response->json('routes.0');

            return [
                'distance' => round($route['distance'] / 1000, 2),
                'duration' => round($route['duration'] / 60, 1),
                'geometry' => $route['geometry'],
            ];
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Score routes with Floyd-Warshall validation
     */
    private function scoreRoutes(array $routes, float $userLat, float $userLng, float $shopLat, float $shopLng): array
    {
        $scored = [];

        foreach ($routes as $index => $route) {
            $osrmDistance = $route['properties']['distance'];

            // Validate with Floyd-Warshall (future implementation)
            $floydScore = $this->validateWithFloydWarshall($route['geometry']['coordinates'], $osrmDistance);

            $scored[] = [
                'id' => $index + 1,
                'type' => 'Feature',
                'geometry' => $route['geometry'],
                'properties' => $route['properties'],
                'score' => $floydScore ?? $osrmDistance,
                'floyd_score' => $floydScore,
                'osrm_distance' => $osrmDistance,
            ];
        }

        return $scored;
    }

    /**
     * Validate route with Floyd-Warshall (placeholder)
     */
    private function validateWithFloydWarshall(array $geometry, float $osrmDistance): ?float
    {
        // TODO: Implement Floyd-Warshall validation
        // For now, return OSRM distance
        return $osrmDistance;
    }

    /**
     * Find nearest shops
     */
    public function findNearestShops(
        float $userLatitude,
        float $userLongitude,
        float $radiusKm = 10,
        int $limit = 10
    ): array {
        try {
            $shops = Shop::withinRadius($userLatitude, $userLongitude, $radiusKm)
                ->with('products')
                ->limit($limit)
                ->get();

            return $shops->map(function ($shop) {
                return [
                    'id' => $shop->id,
                    'name' => $shop->name,
                    'address' => $shop->address,
                    'latitude' => $shop->latitude,
                    'longitude' => $shop->longitude,
                    'distance' => round($shop->distance, 2),
                    'products_count' => $shop->products->count(),
                ];
            })->toArray();
        } catch (\Exception $e) {
            Log::error('Error finding nearest shops: '.$e->getMessage());

            return [];
        }
    }

    /**
     * Calculate distance using Haversine formula
     */
    public function calculateDistance(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $latDelta = deg2rad($lat2 - $lat1);
        $lonDelta = deg2rad($lon2 - $lon1);

        $a = sin($latDelta / 2) * sin($latDelta / 2) +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
            sin($lonDelta / 2) * sin($lonDelta / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return self::EARTH_RADIUS_KM * $c;
    }

    /**
     * Validate coordinates
     */
    private function validateCoordinates(float $lat1, float $lng1, float $lat2, float $lng2): void
    {
        if (
            $lat1 < -90 || $lat1 > 90 ||
            $lng1 < -180 || $lng1 > 180 ||
            $lat2 < -90 || $lat2 > 90 ||
            $lng2 < -180 || $lng2 > 180
        ) {
            throw new \InvalidArgumentException('Invalid coordinates');
        }
    }

    /**
     * Create fallback route
     */
    private function createFallbackRoute(float $userLat, float $userLng, float $shopLat, float $shopLng): array
    {
        $distance = $this->calculateDistance($userLat, $userLng, $shopLat, $shopLng);

        $route = [
            'id' => 1,
            'rank' => 1,
            'type' => 'Feature',
            'geometry' => [
                'type' => 'LineString',
                'coordinates' => [
                    [$userLng, $userLat],
                    [$shopLng, $shopLat],
                ],
            ],
            'properties' => [
                'distance' => round($distance, 2),
                'duration' => round($distance * 2, 1),
                'summary' => 'Direct route (fallback)',
                'source' => 'fallback',
            ],
            'score' => $distance,
        ];

        return [
            'main' => $route,
            'alternatives' => [],
            'all' => [$route],
        ];
    }
}
