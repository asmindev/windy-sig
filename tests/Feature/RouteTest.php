<?php

use function Pest\Laravel\get;

it('dapat menampilkan halaman home dengan parameter routing', function () {
    $shop = \App\Models\Shop::factory()->create([
        'latitude' => -3.9942,
        'longitude' => 122.5423,
    ]);

    $response = get(route('home', [
        'active' => $shop->id,
        'from' => '-3.9942,122.5423',
        'to' => '-3.9942,122.5423',
    ]));

    $response->assertSuccessful();
    $response->assertInertia(function ($assert) use ($shop) {
        $assert->component('home/page')
            ->where('activeShop.id', $shop->id)
            ->has('routingData')
            ->where('routingData.activeShopId', $shop->id)
            ->where('routingData.shouldShowRoute', true);
    });
});

it('dapat auto-detect shop berdasarkan koordinat tanpa parameter active', function () {
    $shop = \App\Models\Shop::factory()->create([
        'latitude' => -3.9942,
        'longitude' => 122.5423,
    ]);

    $response = get(route('home', [
        'from' => '-3.9942,122.5423',
        'to' => '-3.9942,122.5423',
    ]));

    $response->assertSuccessful();
    $response->assertInertia(function ($assert) use ($shop) {
        $assert->component('home/page')
            ->where('activeShop.id', $shop->id);
    });
});

it('dapat mengakses API endpoint untuk shortest path', function () {
    $shop1 = \App\Models\Shop::factory()->create();
    $shop2 = \App\Models\Shop::factory()->create();

    // Create distance data
    \App\Models\Distance::factory()->create([
        'from_shop_id' => $shop1->id,
        'to_shop_id' => $shop2->id,
        'distance' => 5.0,
    ]);

    $response = get(route('api.routes.shortest-path', [
        'from_shop_id' => $shop1->id,
        'to_shop_id' => $shop2->id,
    ]));

    $response->assertSuccessful();
    $response->assertJsonStructure([
        'path',
        'distance',
        'shops',
    ]);
});

it('dapat mengakses API endpoint untuk OSRM route', function () {
    $response = get(route('api.routes.osrm-route', [
        'from_lat' => -3.9942,
        'from_lng' => 122.5423,
        'to_lat' => -3.9950,
        'to_lng' => 122.5430,
    ]));

    $response->assertSuccessful();
    $response->assertJsonStructure([
        'success',
        'route',
        'geometry',
        'duration',
        'distance',
    ]);
});

it('dapat mengakses API endpoint untuk multi-waypoint route', function () {
    $shop1 = \App\Models\Shop::factory()->create();
    $shop2 = \App\Models\Shop::factory()->create();

    $response = get(route('api.routes.multi-waypoint', [
        'shop_path' => [$shop1->id, $shop2->id],
        'from_lat' => -3.9942,
        'from_lng' => 122.5423,
    ]));

    $response->assertSuccessful();
    $response->assertJsonStructure([
        'success',
    ]);
});

it('dapat mengakses API endpoint untuk find shop by coordinates', function () {
    $shop = \App\Models\Shop::factory()->create([
        'latitude' => -3.9942,
        'longitude' => 122.5423,
    ]);

    $response = get(route('api.routes.find-shop', [
        'lat' => -3.9942,
        'lng' => 122.5423,
        'radius' => 0.1,
    ]));

    $response->assertSuccessful();
    $response->assertJsonStructure([
        'shop',
        'found',
    ]);
    $response->assertJson([
        'found' => true,
    ]);
});

it('validasi parameter API route endpoints', function () {
    // Test validation untuk shortest path
    $response = get(route('api.routes.shortest-path'), [], [
        'Accept' => 'application/json',
    ]);
    $response->assertStatus(422);

    // Test validation untuk OSRM route
    $response = get(route('api.routes.osrm-route'), [], [
        'Accept' => 'application/json',
    ]);
    $response->assertStatus(422);

    // Test validation untuk multi-waypoint
    $response = get(route('api.routes.multi-waypoint'), [], [
        'Accept' => 'application/json',
    ]);
    $response->assertStatus(422);

    // Test validation untuk find shop
    $response = get(route('api.routes.find-shop'), [], [
        'Accept' => 'application/json',
    ]);
    $response->assertStatus(422);
});

it('mengembalikan error ketika shop tidak ditemukan untuk shortest path', function () {
    $response = get(route('api.routes.shortest-path', [
        'from_shop_id' => 999,
        'to_shop_id' => 998,
    ]), [], [
        'Accept' => 'application/json',
    ]);

    $response->assertStatus(422);
});

it('mengembalikan shop null ketika koordinat tidak ditemukan', function () {
    $response = get(route('api.routes.find-shop', [
        'lat' => -90,
        'lng' => -180,
        'radius' => 0.1,
    ]));

    $response->assertSuccessful();
    $response->assertJson([
        'shop' => null,
        'found' => false,
    ]);
});
