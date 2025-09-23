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

    private const FLOYD_WARSHALL_CACHE_KEY = 'floyd_warshall_osrm_distances';

    private const CACHE_TTL = 3600; // 1 hour

    // Graph nodes - intersection points, waypoints penting
    private $nodes = [];

    private $distanceMatrix = [];

    private $nextMatrix = [];

    private $routeGeometryCache = [];

    /**
     * Initialize Floyd-Warshall algorithm dengan real distance dari OSRM
     */
    public function initializeFloydWarshall(?array $nodes = null): void
    {
        if ($nodes === null) {
            $this->nodes = $this->getDefaultNodes();
        } else {
            $this->nodes = $nodes;
        }

        $cacheKey = self::FLOYD_WARSHALL_CACHE_KEY . '_' . md5(serialize($this->nodes));
        $cachedData = Cache::get($cacheKey);

        if ($cachedData) {
            $this->distanceMatrix = $cachedData['distance'];
            $this->nextMatrix = $cachedData['next'];
            $this->routeGeometryCache = $cachedData['geometries'] ?? [];
            Log::info('Loaded Floyd-Warshall data from cache');
        } else {
            Log::info('Building Floyd-Warshall matrix with OSRM data...');
            $this->buildDistanceMatrixWithOSRM();
            $this->runFloydWarshall();

            Cache::put($cacheKey, [
                'distance' => $this->distanceMatrix,
                'next' => $this->nextMatrix,
                'geometries' => $this->routeGeometryCache,
            ], self::CACHE_TTL);

            Log::info('Floyd-Warshall matrix built and cached');
        }
    }

    /**
     * Get default nodes dari database shops
     */
    private function getDefaultNodes(): array
    {
        try {
            $nodes = [];

            // 1. Ambil shops dari database sebagai nodes
            $shops = Shop::select('id', 'name', 'latitude', 'longitude', 'address')
                ->whereNotNull('latitude')
                ->whereNotNull('longitude')
                ->get();

            foreach ($shops as $shop) {
                $nodes[] = [
                    'id' => 'SHOP_' . $shop->id,
                    'lat' => (float) $shop->latitude,
                    'lng' => (float) $shop->longitude,
                    'name' => $shop->name,
                    'type' => 'shop',
                    'shop_id' => $shop->id,
                    'address' => $shop->address,
                ];
            }

            Log::info('Floyd-Warshall nodes loaded', [
                'shops' => $shops->count(),
                'total_nodes' => count($nodes),
            ]);

            return $nodes;
        } catch (\Exception $e) {
            Log::error('Error loading nodes from database: ' . $e->getMessage());

            return [];
        }
    }

    /**
     * Build distance matrix menggunakan real data dari OSRM
     * Optimized untuk menangani banyak nodes dari shops
     */
    private function buildDistanceMatrixWithOSRM(): void
    {
        $nodeCount = count($this->nodes);
        Log::info("Building distance matrix for {$nodeCount} nodes");

        // Initialize matrices
        for ($i = 0; $i < $nodeCount; $i++) {
            for ($j = 0; $j < $nodeCount; $j++) {
                if ($i === $j) {
                    $this->distanceMatrix[$i][$j] = 0;
                    $this->nextMatrix[$i][$j] = $j;
                } else {
                    $this->distanceMatrix[$i][$j] = INF;
                    $this->nextMatrix[$i][$j] = -1;
                }
            }
        }

        // Strategi optimasi untuk banyak nodes:
        // 1. Connect hanya dengan nodes terdekat (max 5-8 connections per node)
        // 2. Connect shops dengan shops terdekat

        $maxConnections = 8;
        $maxDistance = 5.0; // km

        for ($i = 0; $i < $nodeCount; $i++) {
            $connections = [];

            // Cari nodes terdekat untuk koneksi
            for ($j = 0; $j < $nodeCount; $j++) {
                if ($i !== $j) {
                    $distance = $this->calculateDistance(
                        $this->nodes[$i]['lat'],
                        $this->nodes[$i]['lng'],
                        $this->nodes[$j]['lat'],
                        $this->nodes[$j]['lng']
                    );

                    if ($distance <= $maxDistance) {
                        $connections[] = [
                            'index' => $j,
                            'distance' => $distance,
                            'node' => $this->nodes[$j],
                        ];
                    }
                }
            }

            // Sort by distance dan ambil yang terdekat
            usort($connections, function ($a, $b) {
                return $a['distance'] <=> $b['distance'];
            });

            // Limit connections
            $connections = array_slice($connections, 0, $maxConnections);

            // Process connections dengan OSRM
            $this->processNodeConnections($i, $connections);

            if (($i + 1) % 10 === 0) {
                // Log::info("Processed {$i + 1}/{$nodeCount} nodes");
                $current = $i + 1;
                Log::info("Processed {$current}/{$nodeCount} nodes", [
                    'percentage' => round(($current / $nodeCount) * 100, 2) . '%',
                ]);
            }
        }
    }

    /**
     * Process connections untuk satu node
     */
    private function processNodeConnections(int $nodeIndex, array $connections): void
    {
        $batchSize = 5;
        $batches = array_chunk($connections, $batchSize);

        foreach ($batches as $batch) {
            foreach ($batch as $connection) {
                $j = $connection['index'];

                // Skip jika sudah diproses
                if ($this->distanceMatrix[$nodeIndex][$j] !== INF) {
                    continue;
                }

                $osrmData = $this->getOSRMDistance(
                    $this->nodes[$nodeIndex]['lat'],
                    $this->nodes[$nodeIndex]['lng'],
                    $this->nodes[$j]['lat'],
                    $this->nodes[$j]['lng']
                );

                if ($osrmData) {
                    $this->distanceMatrix[$nodeIndex][$j] = $osrmData['distance'];
                    $this->nextMatrix[$nodeIndex][$j] = $j;

                    // Cache route geometry
                    $routeKey = "{$nodeIndex}-{$j}";
                    $this->routeGeometryCache[$routeKey] = [
                        'geometry' => $osrmData['geometry'],
                        'duration' => $osrmData['duration'],
                        'distance' => $osrmData['distance'],
                    ];
                } else {
                    // Fallback ke haversine distance
                    $distance = $connection['distance'];
                    if ($distance <= 3.0) { // Hanya untuk jarak dekat
                        $this->distanceMatrix[$nodeIndex][$j] = $distance;
                        $this->nextMatrix[$nodeIndex][$j] = $j;
                    }
                }
            }

            // Rate limiting
            usleep(50000); // 0.05 second delay
        }
    }

    /**
     * Get distance dan geometry dari OSRM
     */
    private function getOSRMDistance(float $lat1, float $lng1, float $lat2, float $lng2): ?array
    {
        try {
            $coordinates = "{$lng1},{$lat1};{$lng2},{$lat2}";
            $url = self::OSRM_BASE_URL . "/route/v1/driving/{$coordinates}";

            $response = Http::timeout(10)->get($url, [
                'overview' => 'full',
                'geometries' => 'geojson',
                'steps' => 'false',
                'alternatives' => 'false',
            ]);

            if ($response->successful()) {
                $data = $response->json();

                if ($data['code'] === 'Ok' && ! empty($data['routes'])) {
                    $route = $data['routes'][0];

                    return [
                        'distance' => $route['distance'] / 1000, // Convert to km
                        'duration' => $route['duration'] / 60,   // Convert to minutes
                        'geometry' => $route['geometry'],
                    ];
                }
            }

            return null;
        } catch (\Exception $e) {
            Log::warning('OSRM request failed: ' . $e->getMessage());

            return null;
        }
    }

    /**
     * Run Floyd-Warshall algorithm
     */
    private function runFloydWarshall(): void
    {
        $nodeCount = count($this->nodes);

        for ($k = 0; $k < $nodeCount; $k++) {
            for ($i = 0; $i < $nodeCount; $i++) {
                for ($j = 0; $j < $nodeCount; $j++) {
                    if (
                        $this->distanceMatrix[$i][$k] !== INF &&
                        $this->distanceMatrix[$k][$j] !== INF &&
                        $this->distanceMatrix[$i][$k] + $this->distanceMatrix[$k][$j] < $this->distanceMatrix[$i][$j]
                    ) {

                        $this->distanceMatrix[$i][$j] = $this->distanceMatrix[$i][$k] + $this->distanceMatrix[$k][$j];
                        $this->nextMatrix[$i][$j] = $this->nextMatrix[$i][$k];
                    }
                }
            }
        }
    }

    /**
     * Find nearest shops from user coordinates using Haversine formula
     */
    public function findNearestShops(float $userLatitude, float $userLongitude, float $radiusKm = 10, int $limit = 10): array
    {
        try {
            $shops = Shop::withoutGlobalScopes()
                ->with('products')
                ->withinRadius($userLatitude, $userLongitude, $radiusKm)
                ->limit($limit)
                ->get();

            return $shops->map(function ($shop) {
                return [
                    'id' => $shop->id,
                    'name' => $shop->name,
                    'address' => $shop->address,
                    'latitude' => $shop->latitude,
                    'longitude' => $shop->longitude,
                    'operating_hours' => $shop->operating_hours,
                    'description' => $shop->description,
                    'phone' => $shop->phone,
                    'distance' => round($shop->distance, 2),
                    'products_count' => $shop->products->count(),
                ];
            })->toArray();
        } catch (\Exception $e) {
            Log::error('Error finding nearest shops: ' . $e->getMessage());

            return [];
        }
    }

    /**
     * Calculate distance between two points using Haversine formula
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
     * Get route menggunakan kombinasi OSRM + Floyd-Warshall
     */
    public function getRoute(float $userLatitude, float $userLongitude, float $shopLatitude, float $shopLongitude, array $excludeNodes = []): ?array
    {
        try {
            // Validasi koordinat
            if (
                $userLatitude < -90 || $userLatitude > 90 ||
                $userLongitude < -180 || $userLongitude > 180 ||
                $shopLatitude < -90 || $shopLatitude > 90 ||
                $shopLongitude < -180 || $shopLongitude > 180
            ) {
                throw new \InvalidArgumentException('Invalid coordinates provided');
            }

            // Cek jarak sangat dekat
            $distance = $this->calculateDistance($userLatitude, $userLongitude, $shopLatitude, $shopLongitude);
            if ($distance < 0.1) {
                Log::info('Returning straight line route due to close proximity', [
                    'distance_km' => $distance,
                ]);
                return $this->createStraightLineRoute($userLatitude, $userLongitude, $shopLatitude, $shopLongitude);
            }

            // Coba rute langsung OSRM terlebih dahulu
            $directRoute = $this->getDirectOSRMRoute($userLatitude, $userLongitude, $shopLatitude, $shopLongitude);
            $directDistance = $directRoute ? $directRoute['properties']['distance'] : INF;

            // Initialize graf jika belum
            if (empty($this->nodes)) {
                $this->initializeFloydWarshall();
            }

            // Coba rute Floyd-Warshall dengan exclude nodes
            $optimalRoute = $this->getOptimalRoute($userLatitude, $userLongitude, $shopLatitude, $shopLongitude, $excludeNodes);
            if ($optimalRoute && $optimalRoute['properties']['distance'] < $directDistance * 0.9) {
                Log::info('Using Floyd-Warshall route as it is shorter', [
                    'floyd_distance' => $optimalRoute['properties']['distance'],
                    'direct_distance' => $directDistance,
                ]);
                return $optimalRoute; // Gunakan Floyd-Warshall jika 10% lebih pendek
            }

            if ($directRoute) {
                Log::info('Using direct OSRM route', [
                    'distance' => $directDistance,
                    'user_coords' => [$userLatitude, $userLongitude],
                    'shop_coords' => [$shopLatitude, $shopLongitude],
                ]);
                return $directRoute;
            }

            Log::info('Falling back to straight line route', [
                'user_coords' => [$userLatitude, $userLongitude],
                'shop_coords' => [$shopLatitude, $shopLongitude],
            ]);
            return $this->createStraightLineRoute($userLatitude, $userLongitude, $shopLatitude, $shopLongitude);
        } catch (\Exception $e) {
            Log::error('Error in getRoute: ' . $e->getMessage(), [
                'user_coords' => [$userLatitude, $userLongitude],
                'shop_coords' => [$shopLatitude, $shopLongitude],
            ]);
            return $this->createStraightLineRoute($userLatitude, $userLongitude, $shopLatitude, $shopLongitude);
        }
    }

    /**
     * Get optimal route menggunakan Floyd-Warshall dengan OSRM data
     */
    private function getOptimalRoute(float $userLatitude, float $userLongitude, float $shopLatitude, float $shopLongitude, array $excludeNodes = []): ?array
    {
        try {
            // Find best entry dan exit nodes
            $startNode = $this->findBestNode($userLatitude, $userLongitude, $excludeNodes);
            $endNode = $this->findBestNode($shopLatitude, $shopLongitude, $excludeNodes);

            // Jika user/shop terlalu jauh dari nodes, gunakan direct OSRM
            if ($startNode['distance'] > 1.0 || $endNode['distance'] > 1.0) { // Dikurangi dari 3.0 ke 1.0 untuk lebih sering fallback ke direct
                Log::info('User/Shop too far from graph nodes, using direct OSRM', [
                    'start_distance' => $startNode['distance'],
                    'end_distance' => $endNode['distance'],
                ]);
                return null;
            }

            $startIndex = $startNode['index'];
            $endIndex = $endNode['index'];

            // Check apakah ada path di graph
            if ($this->distanceMatrix[$startIndex][$endIndex] === INF) {
                Log::info('No path in Floyd-Warshall graph');

                return null;
            }

            // Get optimal path
            $path = $this->reconstructPath($startIndex, $endIndex);

            if (empty($path)) {
                return null;
            }

            // Build route dengan real OSRM geometries
            return $this->buildOptimalRoute($userLatitude, $userLongitude, $shopLatitude, $shopLongitude, $path, $startNode, $endNode);
        } catch (\Exception $e) {
            Log::error('Error in getOptimalRoute: ' . $e->getMessage());

            return null;
        }
    }

    /**
     * Find best node (considering both distance and graph connectivity)
     */
    private function findBestNode(float $lat, float $lng, array $excludeNodes = []): array
    {
        $bestNode = null;
        $bestScore = INF;
        $bestIndex = -1;

        foreach ($this->nodes as $index => $node) {
            if (in_array($node['id'], $excludeNodes)) {
                continue;
            }

            $distance = $this->calculateDistance($lat, $lng, $node['lat'], $node['lng']);

            // Score berdasarkan jarak dan konektivitas node
            $connectivity = 0;
            for ($i = 0; $i < count($this->nodes); $i++) {
                if ($this->distanceMatrix[$index][$i] !== INF && $this->distanceMatrix[$index][$i] > 0) {
                    $connectivity++;
                }
            }

            // Score: distance + penalty untuk low connectivity
            $score = $distance + (10 - $connectivity) * 0.5;

            if ($score < $bestScore) {
                $bestScore = $score;
                $bestNode = $node;
                $bestIndex = $index;
            }
        }

        return [
            'node' => $bestNode,
            'index' => $bestIndex,
            'distance' => $this->calculateDistance($lat, $lng, $bestNode['lat'], $bestNode['lng']),
            'score' => $bestScore,
        ];
    }

    /**
     * Reconstruct path dari Floyd-Warshall result
     */
    private function reconstructPath(int $start, int $end): array
    {
        if ($this->nextMatrix[$start][$end] === -1) {
            return [];
        }

        $path = [$start];
        while ($start !== $end) {
            $start = $this->nextMatrix[$start][$end];
            $path[] = $start;
        }

        return $path;
    }

    /**
     * Build optimal route dengan OSRM geometries
     */
    private function buildOptimalRoute(float $userLat, float $userLng, float $shopLat, float $shopLng, array $path, array $startNode, array $endNode): array
    {
        $allCoordinates = [];
        $totalDistance = 0;
        $totalDuration = 0;
        $segments = [];

        // 1. User ke start node
        $userToStart = $this->getDirectOSRMRoute($userLat, $userLng, $startNode['node']['lat'], $startNode['node']['lng']);
        if ($userToStart) {
            $allCoordinates = array_merge($allCoordinates, $userToStart['geometry']['coordinates']);
            $totalDistance += $userToStart['properties']['distance'];
            $totalDuration += $userToStart['properties']['duration'];
            $segments[] = 'User to ' . $startNode['node']['name'];
        }

        // 2. Path through graph nodes menggunakan cached OSRM geometries
        for ($i = 0; $i < count($path) - 1; $i++) {
            $fromIndex = $path[$i];
            $toIndex = $path[$i + 1];
            $routeKey = "{$fromIndex}-{$toIndex}";

            if (isset($this->routeGeometryCache[$routeKey])) {
                $cachedRoute = $this->routeGeometryCache[$routeKey];

                // Merge coordinates (skip first point to avoid duplication)
                $coords = $cachedRoute['geometry']['coordinates'];
                if (count($allCoordinates) > 0) {
                    array_shift($coords);
                }
                $allCoordinates = array_merge($allCoordinates, $coords);

                $totalDistance += $cachedRoute['distance'];
                $totalDuration += $cachedRoute['duration'];
                $segments[] = $this->nodes[$fromIndex]['name'] . ' to ' . $this->nodes[$toIndex]['name'];
            }
        }

        // 3. End node ke shop
        $endToShop = $this->getDirectOSRMRoute($endNode['node']['lat'], $endNode['node']['lng'], $shopLat, $shopLng);
        if ($endToShop) {
            $coords = $endToShop['geometry']['coordinates'];
            if (count($allCoordinates) > 0) {
                array_shift($coords);
            }
            $allCoordinates = array_merge($allCoordinates, $coords);
            $totalDistance += $endToShop['properties']['distance'];
            $totalDuration += $endToShop['properties']['duration'];
            $segments[] = $endNode['node']['name'] . ' to Shop';
        }

        return [
            'type' => 'Feature',
            'properties' => [
                'distance' => round($totalDistance, 2),
                'duration' => round($totalDuration, 1),
                'summary' => 'Optimized route via ' . implode(' → ', $segments),
                'algorithm' => 'floyd-warshall-osrm',
                'waypoints' => count($path),
                'segments' => $segments,
            ],
            'geometry' => [
                'type' => 'LineString',
                'coordinates' => $allCoordinates,
            ],
        ];
    }

    /**
     * Get direct OSRM route
     */
    private function getDirectOSRMRoute(float $userLatitude, float $userLongitude, float $shopLatitude, float $shopLongitude): ?array
    {
        try {
            // Cek cache untuk direct OSRM
            $cacheKey = 'osrm_direct_' . md5("{$userLatitude},{$userLongitude};{$shopLatitude},{$shopLongitude}");
            $cachedRoute = Cache::get($cacheKey);
            if ($cachedRoute) {
                return $cachedRoute;
            }

            $coordinates = "{$userLongitude},{$userLatitude};{$shopLongitude},{$shopLatitude}";
            $url = self::OSRM_BASE_URL . "/route/v1/driving/{$coordinates}";

            $response = Http::timeout(10)->get($url, [
                'overview' => 'full',
                'geometries' => 'geojson',
                'steps' => 'false',
                'alternatives' => 'false',
            ]);

            if ($response->successful()) {
                $data = $response->json();

                if ($data['code'] === 'Ok' && ! empty($data['routes'])) {
                    $route = $data['routes'][0];

                    $result = [
                        'type' => 'Feature',
                        'properties' => [
                            'distance' => round($route['distance'] / 1000, 2),
                            'duration' => round($route['duration'] / 60, 1),
                            'summary' => 'Direct route via OSRM',
                            'algorithm' => 'osrm-direct',
                        ],
                        'geometry' => $route['geometry'],
                    ];

                    Cache::put($cacheKey, $result, self::CACHE_TTL);
                    return $result;
                }
            }

            return $this->createStraightLineRoute($userLatitude, $userLongitude, $shopLatitude, $shopLongitude);
        } catch (\Exception $e) {
            Log::error('Error getting direct OSRM route: ' . $e->getMessage());

            return $this->createStraightLineRoute($userLatitude, $userLongitude, $shopLatitude, $shopLongitude);
        }
    }

    /**
     * Create a straight line route as fallback
     */
    private function createStraightLineRoute(float $userLatitude, float $userLongitude, float $shopLatitude, float $shopLongitude): array
    {
        $distance = $this->calculateDistance($userLatitude, $userLongitude, $shopLatitude, $shopLongitude);
        $estimatedDuration = $distance * 2;

        return [
            'type' => 'Feature',
            'properties' => [
                'distance' => round($distance, 2),
                'duration' => round($estimatedDuration, 1),
                'summary' => 'Straight line route (fallback)',
                'algorithm' => 'straight-line',
                'fallback' => true,
            ],
            'geometry' => [
                'type' => 'LineString',
                'coordinates' => [
                    [$userLongitude, $userLatitude],
                    [$shopLongitude, $shopLatitude],
                ],
            ],
        ];
    }

    /**
     * Get route untuk specific shop (optimasi khusus)
     */
    public function getRouteToShop(float $userLatitude, float $userLongitude, int $shopId, array $excludeNodes = []): ?array
    {
        try {
            // Initialize jika belum
            if (empty($this->nodes)) {
                $this->initializeFloydWarshall();
            }

            // Cari shop dalam nodes
            $shopNode = null;
            $shopNodeIndex = null;

            foreach ($this->nodes as $index => $node) {
                if ($node['type'] === 'shop' && $node['shop_id'] === $shopId) {
                    $shopNode = $node;
                    $shopNodeIndex = $index;
                    break;
                }
            }

            if ($shopNode) {
                // Shop ada dalam graph, gunakan optimized routing
                Log::info('Shop found in graph, using Floyd-Warshall optimization');

                return $this->getRoute($userLatitude, $userLongitude, (float) $shopNode['lat'], (float) $shopNode['lng'], $excludeNodes);
            } else {
                // Shop tidak dalam graph, ambil data dari database
                $shop = Shop::find($shopId);
                if (! $shop) {
                    Log::error("Shop not found: {$shopId}");

                    return null;
                }

                Log::info('Shop not in graph, using standard routing');

                return $this->getRoute($userLatitude, $userLongitude, (float) $shop->latitude, (float) $shop->longitude, $excludeNodes);
            }
        } catch (\Exception $e) {
            Log::error('Error in getRouteToShop: ' . $e->getMessage());

            return null;
        }
    }

    /**
     * Get optimal route ke specific node dalam graph
     */
    private function getOptimalRouteToNode(float $userLatitude, float $userLongitude, int $targetNodeIndex, array $excludeNodes = []): ?array
    {
        try {
            // Find best entry node
            $startNode = $this->findBestNode($userLatitude, $userLongitude, $excludeNodes);

            // Jika user terlalu jauh dari graph
            if ($startNode['distance'] > 1.0) { // Dikurangi dari 3.0 ke 1.0
                $targetNode = $this->nodes[$targetNodeIndex];

                return $this->getDirectOSRMRoute($userLatitude, $userLongitude, $targetNode['lat'], $targetNode['lng']);
            }

            $startIndex = $startNode['index'];

            // Check path existence
            if ($this->distanceMatrix[$startIndex][$targetNodeIndex] === INF) {
                Log::info('No path to target shop in graph');
                $targetNode = $this->nodes[$targetNodeIndex];

                return $this->getDirectOSRMRoute($userLatitude, $userLongitude, $targetNode['lat'], $targetNode['lng']);
            }

            // Get optimal path
            $path = $this->reconstructPath($startIndex, $targetNodeIndex);

            if (empty($path)) {
                $targetNode = $this->nodes[$targetNodeIndex];

                return $this->getDirectOSRMRoute($userLatitude, $userLongitude, $targetNode['lat'], $targetNode['lng']);
            }

            // Build route
            return $this->buildOptimalRouteToNode($userLatitude, $userLongitude, $path, $startNode, $targetNodeIndex);
        } catch (\Exception $e) {
            Log::error('Error in getOptimalRouteToNode: ' . $e->getMessage());

            return null;
        }
    }

    /**
     * Build optimal route ke specific node
     */
    private function buildOptimalRouteToNode(float $userLat, float $userLng, array $path, array $startNode, int $targetNodeIndex): array
    {
        $allCoordinates = [];
        $totalDistance = 0;
        $totalDuration = 0;
        $segments = [];
        $targetNode = $this->nodes[$targetNodeIndex];

        // 1. User ke start node
        $userToStart = $this->getDirectOSRMRoute($userLat, $userLng, $startNode['node']['lat'], $startNode['node']['lng']);
        if ($userToStart) {
            $allCoordinates = array_merge($allCoordinates, $userToStart['geometry']['coordinates']);
            $totalDistance += $userToStart['properties']['distance'];
            $totalDuration += $userToStart['properties']['duration'];
            $segments[] = 'User to ' . $startNode['node']['name'];
        }

        // 2. Path through graph nodes
        for ($i = 0; $i < count($path) - 1; $i++) {
            $fromIndex = $path[$i];
            $toIndex = $path[$i + 1];
            $routeKey = "{$fromIndex}-{$toIndex}";

            if (isset($this->routeGeometryCache[$routeKey])) {
                $cachedRoute = $this->routeGeometryCache[$routeKey];

                $coords = $cachedRoute['geometry']['coordinates'];
                if (count($allCoordinates) > 0) {
                    array_shift($coords);
                }
                $allCoordinates = array_merge($allCoordinates, $coords);

                $totalDistance += $cachedRoute['distance'];
                $totalDuration += $cachedRoute['duration'];
                $segments[] = $this->nodes[$fromIndex]['name'] . ' to ' . $this->nodes[$toIndex]['name'];
            }
        }

        return [
            'type' => 'Feature',
            'properties' => [
                'distance' => round($totalDistance, 2),
                'duration' => round($totalDuration, 1),
                'summary' => 'Optimized route to ' . $targetNode['name'] . ' via ' . implode(' → ', $segments),
                'algorithm' => 'floyd-warshall-osrm-shop',
                'waypoints' => count($path),
                'segments' => $segments,
                'target_shop_id' => $targetNode['shop_id'] ?? null,
                'target_type' => $targetNode['type'],
            ],
            'geometry' => [
                'type' => 'LineString',
                'coordinates' => $allCoordinates,
            ],
        ];
    }

    /**
     * Clear cache dan rebuild graph
     */
    public function rebuildGraph(?array $nodes = null): void
    {
        $cacheKey = self::FLOYD_WARSHALL_CACHE_KEY . '_' . md5(serialize($nodes ?? $this->getDefaultNodes()));
        Cache::forget($cacheKey);
        $this->nodes = [];
        $this->distanceMatrix = [];
        $this->nextMatrix = [];
        $this->routeGeometryCache = [];
        $this->initializeFloydWarshall($nodes);
    }

    /**
     * Get graph statistics
     */
    public function getGraphStats(): array
    {
        if (empty($this->nodes)) {
            $this->initializeFloydWarshall();
        }

        $stats = [
            'nodes_count' => count($this->nodes),
            'total_connections' => 0,
            'avg_distance' => 0,
            'nodes' => [],
        ];

        $totalDistance = 0;
        $connectionCount = 0;

        for ($i = 0; $i < count($this->nodes); $i++) {
            $nodeConnections = 0;
            for ($j = 0; $j < count($this->nodes); $j++) {
                if ($i !== $j && $this->distanceMatrix[$i][$j] !== INF) {
                    $nodeConnections++;
                    $totalDistance += $this->distanceMatrix[$i][$j];
                    $connectionCount++;
                }
            }

            $stats['nodes'][] = [
                'id' => $this->nodes[$i]['id'],
                'name' => $this->nodes[$i]['name'],
                'connections' => $nodeConnections,
            ];
        }

        $stats['total_connections'] = $connectionCount;
        $stats['avg_distance'] = $connectionCount > 0 ? round($totalDistance / $connectionCount, 2) : 0;

        return $stats;
    }

    /**
     * Find shop by coordinates with tolerance for slight variations
     */
    public function findShopByCoordinates(float $latitude, float $longitude, float $tolerance = 0.001): ?Shop
    {
        return Shop::where(function ($query) use ($latitude, $longitude, $tolerance) {
            $query->whereBetween('latitude', [$latitude - $tolerance, $latitude + $tolerance])
                ->whereBetween('longitude', [$longitude - $tolerance, $longitude + $tolerance]);
        })->first();
    }
}
