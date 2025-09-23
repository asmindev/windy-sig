<?php

use App\Models\Shop;
use App\Services\RouteService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;

uses(RefreshDatabase::class);

describe('RouteService', function () {
    test('can calculate distance between two points using Haversine formula', function () {
        $routeService = app(RouteService::class);

        // Jakarta coordinates
        $lat1 = -6.2088;
        $lon1 = 106.8456;

        // Bandung coordinates
        $lat2 = -6.9175;
        $lon2 = 107.6191;

        $distance = $routeService->calculateDistance($lat1, $lon1, $lat2, $lon2);

        // Distance between Jakarta and Bandung is approximately 150km
        expect($distance)->toBeGreaterThan(140)
            ->and($distance)->toBeLessThan(160);
    });

    test('can find nearest shops within radius', function () {
        $routeService = app(RouteService::class);

        // Create test shops
        $userLat = -6.2088;
        $userLon = 106.8456;

        // Create a shop nearby (within 5km)
        $nearbyShop = Shop::factory()->create([
            'latitude' => -6.2100,
            'longitude' => 106.8460,
            'name' => 'Nearby Shop',
        ]);

        // Create a shop far away (outside 5km radius)
        $farShop = Shop::factory()->create([
            'latitude' => -6.9175,
            'longitude' => 107.6191,
            'name' => 'Far Shop',
        ]);

        $nearestShops = $routeService->findNearestShops($userLat, $userLon, 5, 10);

        expect($nearestShops)->toHaveCount(1)
            ->and($nearestShops[0]['name'])->toBe('Nearby Shop')
            ->and($nearestShops[0]['distance'])->toBeLessThan(5);
    });

    test('returns empty array when no shops found within radius', function () {
        $routeService = app(RouteService::class);

        $userLat = -6.2088;
        $userLon = 106.8456;

        // Create a shop far away
        Shop::factory()->create([
            'latitude' => -6.9175,
            'longitude' => 107.6191,
        ]);

        $nearestShops = $routeService->findNearestShops($userLat, $userLon, 1, 10);

        expect($nearestShops)->toBeEmpty();
    });

    test('can create straight line route as fallback', function () {
        Http::fake([
            'router.project-osrm.org/*' => Http::response(['code' => 'NoRoute'], 400),
        ]);

        $routeService = app(RouteService::class);
        $userLat = -6.2088;
        $userLon = 106.8456;
        $shopLat = -6.2100;
        $shopLon = 106.8460;

        $route = $routeService->getRoute($userLat, $userLon, $shopLat, $shopLon);

        expect($route)->toBeArray()
            ->and($route['type'])->toBe('Feature')
            ->and($route['properties']['fallback'])->toBeTrue()
            ->and($route['geometry']['type'])->toBe('LineString')
            ->and($route['geometry']['coordinates'])->toHaveCount(2);
    });

    test('can get route from OSRM API when available', function () {
        $mockResponse = [
            'code' => 'Ok',
            'routes' => [
                [
                    'distance' => 5000, // 5km in meters
                    'duration' => 600,  // 10 minutes in seconds
                    'geometry' => [
                        'type' => 'LineString',
                        'coordinates' => [
                            [106.8456, -6.2088],
                            [106.8460, -6.2100],
                        ],
                    ],
                    'legs' => [
                        ['summary' => 'Test Route'],
                    ],
                ],
            ],
        ];

        Http::fake([
            'router.project-osrm.org/*' => Http::response($mockResponse, 200),
        ]);

        $routeService = app(RouteService::class);
        $route = $routeService->getRoute(-6.2088, 106.8456, -6.2100, 106.8460);

        expect($route)->toBeArray()
            ->and($route['type'])->toBe('Feature')
            ->and($route['properties']['distance'])->toBe(5.0)
            ->and($route['properties']['duration'])->toBe(10.0)
            ->and(isset($route['properties']['fallback']))->toBeFalse();
    });

    test('can get batch routes for multiple shops', function () {
        Http::fake([
            'router.project-osrm.org/*' => Http::response([
                'code' => 'Ok',
                'routes' => [
                    [
                        'distance' => 1000,
                        'duration' => 120,
                        'geometry' => [
                            'type' => 'LineString',
                            'coordinates' => [[106.8456, -6.2088], [106.8460, -6.2100]],
                        ],
                        'legs' => [['summary' => 'Test Route']],
                    ],
                ],
            ], 200),
        ]);

        $routeService = app(RouteService::class);
        $shops = [
            ['id' => 1, 'latitude' => -6.2100, 'longitude' => 106.8460],
            ['id' => 2, 'latitude' => -6.2110, 'longitude' => 106.8470],
        ];

        $routes = $routeService->getBatchRoutes(-6.2088, 106.8456, $shops);

        expect($routes)->toHaveCount(2)
            ->and($routes)->toHaveKeys([1, 2]);
    });
});
