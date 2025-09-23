<?php

use function Pest\Laravel\get;

it('dapat menampilkan semua toko ketika tidak ada parameter pencarian', function () {
    $shops = \App\Models\Shop::factory(3)->create();

    $response = get(route('home'));

    $response->assertSuccessful();
    $response->assertInertia(function ($assert) {
        $assert->component('home/page')
            ->has('shops', 3)
            ->where('search', null);
    });
});

it('dapat mencari toko berdasarkan nama', function () {
    $targetShop = \App\Models\Shop::factory()->create(['name' => 'Toko ABC']);
    $otherShop = \App\Models\Shop::factory()->create(['name' => 'Toko XYZ']);

    $response = get(route('home', ['search' => 'ABC']));

    $response->assertSuccessful();
    $response->assertInertia(function ($assert) use ($targetShop) {
        $assert->component('home/page')
            ->has('shops', 1)
            ->where('shops.0.name', $targetShop->name)
            ->where('search', 'ABC');
    });
});

it('dapat mencari toko berdasarkan alamat', function () {
    $targetShop = \App\Models\Shop::factory()->create(['address' => 'Jalan Sudirman No. 123']);
    $otherShop = \App\Models\Shop::factory()->create(['address' => 'Jalan Thamrin No. 456']);

    $response = get(route('home', ['search' => 'Sudirman']));

    $response->assertSuccessful();
    $response->assertInertia(function ($assert) use ($targetShop) {
        $assert->component('home/page')
            ->has('shops', 1)
            ->where('shops.0.address', $targetShop->address)
            ->where('search', 'Sudirman');
    });
});

it('dapat mencari toko berdasarkan produk yang dimiliki', function () {
    $shopWithProduct = \App\Models\Shop::factory()->create(['name' => 'Toko Elektronik']);
    $shopWithoutProduct = \App\Models\Shop::factory()->create(['name' => 'Toko Fashion']);

    \App\Models\Product::factory()->create([
        'shop_id' => $shopWithProduct->id,
        'name' => 'Laptop Gaming',
    ]);

    \App\Models\Product::factory()->create([
        'shop_id' => $shopWithoutProduct->id,
        'name' => 'Baju Kaos',
    ]);

    $response = get(route('home', ['search' => 'Laptop']));

    $response->assertSuccessful();
    $response->assertInertia(function ($assert) use ($shopWithProduct) {
        $assert->component('home/page')
            ->has('shops', 1)
            ->where('shops.0.name', $shopWithProduct->name)
            ->where('search', 'Laptop');
    });
});

it('dapat mencari toko berdasarkan tipe produk', function () {
    $shopWithElectronics = \App\Models\Shop::factory()->create(['name' => 'Toko Elektronik']);
    $shopWithFashion = \App\Models\Shop::factory()->create(['name' => 'Toko Fashion']);

    \App\Models\Product::factory()->create([
        'shop_id' => $shopWithElectronics->id,
        'type' => 'elektronik',
    ]);

    \App\Models\Product::factory()->create([
        'shop_id' => $shopWithFashion->id,
        'type' => 'fashion',
    ]);

    $response = get(route('home', ['search' => 'elektronik']));

    $response->assertSuccessful();
    $response->assertInertia(function ($assert) use ($shopWithElectronics) {
        $assert->component('home/page')
            ->has('shops', 1)
            ->where('shops.0.name', $shopWithElectronics->name)
            ->where('search', 'elektronik');
    });
});

it('mengembalikan hasil kosong ketika pencarian tidak ditemukan', function () {
    \App\Models\Shop::factory(3)->create();

    $response = get(route('home', ['search' => 'tidak ada hasil']));

    $response->assertSuccessful();
    $response->assertInertia(function ($assert) {
        $assert->component('home/page')
            ->has('shops', 0)
            ->where('search', 'tidak ada hasil');
    });
});

it('pencarian case insensitive', function () {
    $targetShop = \App\Models\Shop::factory()->create(['name' => 'Toko ABC']);

    $response = get(route('home', ['search' => 'abc']));

    $response->assertSuccessful();
    $response->assertInertia(function ($assert) use ($targetShop) {
        $assert->component('home/page')
            ->has('shops', 1)
            ->where('shops.0.name', $targetShop->name)
            ->where('search', 'abc');
    });
});

it('dapat mencari dengan spasi dan karakter khusus', function () {
    $targetShop = \App\Models\Shop::factory()->create(['name' => 'Toko A & B']);
    $otherShop = \App\Models\Shop::factory()->create(['name' => 'Toko C']);

    $response = get(route('home', ['search' => 'A & B']));

    $response->assertSuccessful();
    $response->assertInertia(function ($assert) use ($targetShop) {
        $assert->component('home/page')
            ->has('shops', 1)
            ->where('shops.0.name', $targetShop->name)
            ->where('search', 'A & B');
    });
});
