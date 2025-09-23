<?php

use App\Models\Shop;
use Illuminate\Support\Facades\Http;

describe('Route API Endpoints', function () {
    test('can get route between user and shop coordinates', function () {
        Http::fake([
            'router.project-osrm.org/*' => Http::response([
                'code' => 'Ok',
                'routes' => [
                    [
                        'distance' => 5000,
                        'duration' => 600,
                        'geometry' => [
                            'type' => 'LineString',
                            'coordinates' => [[106.8456, -6.2088], [106.8460, -6.2100]],
                        ],
                        'legs' => [['summary' => 'Test Route']],
                    ],
                ],
            ], 200),
        ]);

        $response = $this->postJson('/api/routes/get-route', [
            'user_latitude' => -6.2088,
            'user_longitude' => 106.8456,
            'shop_latitude' => -6.2100,
            'shop_longitude' => 106.8460,
        ]);

        $response->assertSuccessful()
            ->assertJson([
                'success' => true,
                'data' => [
                    'type' => 'Feature',
                    'properties' => [
                        'distance' => 5.0,
                        'duration' => 10.0,
                    ],
                    'geometry' => [
                        'type' => 'LineString',
                    ],
                ],
            ]);
    });

    test('validates required coordinates for get route', function () {
        $response = $this->postJson('/api/routes/get-route', [
            'user_latitude' => -6.2088,
            // Missing required fields
        ]);

        $response->assertUnprocessable()
            ->assertJson([
                'success' => false,
                'message' => 'Invalid coordinates provided',
            ]);
    });

    test('can find nearest shops', function () {
        // Create test shops
        Shop::factory()->create([
            'latitude' => -6.2100,
            'longitude' => 106.8460,
            'name' => 'Nearby Shop',
        ]);

        $response = $this->postJson('/api/routes/nearest-shops', [
            'latitude' => -6.2088,
            'longitude' => 106.8456,
            'radius' => 10,
            'limit' => 5,
        ]);

        $response->assertSuccessful()
            ->assertJson([
                'success' => true,
                'meta' => [
                    'radius_km' => 10,
                    'user_coordinates' => [
                        'latitude' => -6.2088,
                        'longitude' => 106.8456,
                    ],
                ],
            ]);

        $data = $response->json('data');
        expect($data)->toBeArray()
            ->and(count($data))->toBeGreaterThan(0);
    });
});
