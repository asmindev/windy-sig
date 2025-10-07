<?php

use App\Models\Product;
use App\Models\Shop;
use App\Models\User;

use function Pest\Laravel\actingAs;

it('can create a product with top_product field', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $shop = Shop::factory()->create();

    $product = Product::factory()->create([
        'shop_id' => $shop->id,
        'top_product' => true,
    ]);

    expect($product->top_product)->toBeTrue();
});

it('defaults top_product to false', function () {
    $shop = Shop::factory()->create();

    $product = Product::factory()->create([
        'shop_id' => $shop->id,
        'top_product' => false,
    ]);

    expect($product->top_product)->toBeFalse();
});

it('can update product top_product status', function () {
    $shop = Shop::factory()->create();

    $product = Product::factory()->create([
        'shop_id' => $shop->id,
        'top_product' => false,
    ]);

    $product->update(['top_product' => true]);

    expect($product->fresh()->top_product)->toBeTrue();
});
