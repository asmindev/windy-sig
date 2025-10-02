<?php

use App\Models\Product;
use App\Models\Shop;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create(['role' => 'admin']);
    $this->shop = Shop::factory()->create();
});

test('can create product with min_price only', function () {
    $productData = [
        'shop_id' => $this->shop->id,
        'name' => 'Test Product',
        'min_price' => 50000,
        'is_available' => true,
    ];

    $response = $this->actingAs($this->user)
        ->post(route('admin.products.store'), $productData);

    $response->assertRedirect(route('admin.products.index'));

    $this->assertDatabaseHas('products', [
        'name' => 'Test Product',
        'min_price' => 50000,
        'max_price' => null,
    ]);
});

test('can create product with both min_price and max_price', function () {
    $productData = [
        'shop_id' => $this->shop->id,
        'name' => 'Test Product Range',
        'min_price' => 50000,
        'max_price' => 100000,
        'is_available' => true,
    ];

    $response = $this->actingAs($this->user)
        ->post(route('admin.products.store'), $productData);

    $response->assertRedirect(route('admin.products.index'));

    $this->assertDatabaseHas('products', [
        'name' => 'Test Product Range',
        'min_price' => 50000,
        'max_price' => 100000,
    ]);
});

test('validates min_price is required', function () {
    $productData = [
        'shop_id' => $this->shop->id,
        'name' => 'Test Product',
        'max_price' => 100000,
        'is_available' => true,
    ];

    $response = $this->actingAs($this->user)
        ->post(route('admin.products.store'), $productData);

    $response->assertSessionHasErrors('min_price');
});

test('validates max_price is greater than or equal to min_price', function () {
    $productData = [
        'shop_id' => $this->shop->id,
        'name' => 'Test Product',
        'min_price' => 100000,
        'max_price' => 50000, // Lower than min_price
        'is_available' => true,
    ];

    $response = $this->actingAs($this->user)
        ->post(route('admin.products.store'), $productData);

    $response->assertSessionHasErrors('max_price');
});

test('price_range accessor returns correct format', function () {
    // Product with only min_price
    $product1 = Product::factory()->create([
        'min_price' => 50000,
        'max_price' => null,
    ]);

    expect($product1->price_range)->toBe('Rp 50.000');

    // Product with both min and max price
    $product2 = Product::factory()->create([
        'min_price' => 50000,
        'max_price' => 100000,
    ]);

    expect($product2->price_range)->toBe('Rp 50.000 - Rp 100.000');

    // Product with same min and max price
    $product3 = Product::factory()->create([
        'min_price' => 75000,
        'max_price' => 75000,
    ]);

    expect($product3->price_range)->toBe('Rp 75.000');
});

test('can filter products by price range', function () {
    // Create products with different price ranges
    Product::factory()->create([
        'name' => 'Cheap Product',
        'min_price' => 25000,
        'max_price' => 50000,
    ]);

    Product::factory()->create([
        'name' => 'Expensive Product',
        'min_price' => 100000,
        'max_price' => 200000,
    ]);

    // Filter by min_price
    $response = $this->get(route('products.index', ['min_price' => 80000]));
    $response->assertStatus(200);

    // Filter by max_price
    $response = $this->get(route('products.index', ['max_price' => 60000]));
    $response->assertStatus(200);
});

test('removes max_price when updating product with empty max_price', function () {
    // Create product with both min and max price
    $product = Product::factory()->create([
        'min_price' => 50000,
        'max_price' => 100000,
    ]);

    // Update with empty max_price
    $updateData = [
        'shop_id' => $product->shop_id,
        'name' => $product->name,
        'min_price' => 60000,
        'max_price' => '', // Empty string should remove max_price
    ];

    $response = $this->actingAs($this->user)
        ->put(route('admin.products.update', $product), $updateData);

    $response->assertRedirect(route('admin.products.index'));

    // Refresh product from database
    $product->refresh();

    expect($product->min_price)->toBe('60000.00');
    expect($product->max_price)->toBeNull();
});

test('sets max_price to null when creating product with empty max_price', function () {
    $productData = [
        'shop_id' => $this->shop->id,
        'name' => 'Test Product No Max',
        'min_price' => 75000,
        'max_price' => '', // Empty string should be null
        'is_available' => true,
    ];

    $response = $this->actingAs($this->user)
        ->post(route('admin.products.store'), $productData);

    $response->assertRedirect(route('admin.products.index'));

    $this->assertDatabaseHas('products', [
        'name' => 'Test Product No Max',
        'min_price' => 75000,
        'max_price' => null,
    ]);
});
