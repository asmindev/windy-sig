<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\Shop;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('displays product details with category information on admin show page', function () {
    $user = User::factory()->create(['role' => 'admin']);
    $category = Category::factory()->create([
        'name' => 'Makanan',
        'description' => 'Produk makanan dan minuman'
    ]);
    $shop = Shop::factory()->create(['name' => 'Toko Oleh-oleh']);
    $product = Product::factory()->create([
        'name' => 'Keripik Singkong',
        'category_id' => $category->id,
        'shop_id' => $shop->id,
        'price' => 15000,
        'stock_quantity' => 50,
        'description' => 'Keripik singkong rasa original',
    ]);

    $response = $this->actingAs($user)
        ->get("/admin/products/{$product->id}");

    $response->assertSuccessful()
        ->assertInertia(function ($assert) use ($product, $category, $shop) {
            $assert->component('Admin/Products/Show')
                ->has('product')
                ->where('product.id', $product->id)
                ->where('product.name', 'Keripik Singkong')
                ->where('product.category.id', $category->id)
                ->where('product.category.name', 'Makanan')
                ->where('product.category.description', 'Produk makanan dan minuman')
                ->where('product.shop.id', $shop->id)
                ->where('product.shop.name', 'Toko Oleh-oleh');
        });
});

it('displays product without category on admin show page', function () {
    $user = User::factory()->create(['role' => 'admin']);
    $shop = Shop::factory()->create(['name' => 'Toko Souvenir']);
    $product = Product::factory()->create([
        'name' => 'Gantungan Kunci',
        'category_id' => null,
        'shop_id' => $shop->id,
        'price' => 25000,
        'stock_quantity' => 30,
    ]);

    $response = $this->actingAs($user)
        ->get("/admin/products/{$product->id}");

    $response->assertSuccessful()
        ->assertInertia(function ($assert) use ($product, $shop) {
            $assert->component('Admin/Products/Show')
                ->has('product')
                ->where('product.id', $product->id)
                ->where('product.name', 'Gantungan Kunci')
                ->where('product.category', null)
                ->where('product.shop.id', $shop->id)
                ->where('product.shop.name', 'Toko Souvenir');
        });
});

it('requires admin role to access product show page', function () {
    $user = User::factory()->create(['role' => 'user']);
    $product = Product::factory()->create();

    $response = $this->actingAs($user)
        ->get("/admin/products/{$product->id}");

    $response->assertForbidden();
});
