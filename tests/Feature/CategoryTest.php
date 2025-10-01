<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\User;

beforeEach(function () {
    $this->adminUser = User::factory()->create(['role' => 'admin']);
    $this->user = User::factory()->create(['role' => 'user']);
});

it('can display categories index for admin', function () {
    Category::factory()->count(3)->create();

    $response = $this->actingAs($this->adminUser)
        ->get(route('admin.categories.index'));

    $response->assertSuccessful()
        ->assertInertia(
            fn($page) => $page
                ->component('Admin/Categories/Index')
                ->has('categories.data', 3)
        );
});

it('cannot access admin categories as regular user', function () {
    $response = $this->actingAs($this->user)
        ->get(route('admin.categories.index'));

    $response->assertForbidden();
});

it('can create a new category', function () {
    $categoryData = [
        'name' => 'Test Category',
        'description' => 'Test description',
        'color' => '#FF0000',
        'icon' => 'test-icon',
        'is_active' => true,
    ];

    $response = $this->actingAs($this->adminUser)
        ->post(route('admin.categories.store'), $categoryData);

    $response->assertRedirect(route('admin.categories.index'));

    $this->assertDatabaseHas('categories', [
        'name' => 'Test Category',
        'slug' => 'test-category',
        'description' => 'Test description',
        'color' => '#FF0000',
        'icon' => 'test-icon',
        'is_active' => true,
    ]);
});

it('validates required fields when creating category', function () {
    $response = $this->actingAs($this->adminUser)
        ->post(route('admin.categories.store'), []);

    $response->assertSessionHasErrors(['name']);
});

it('can update a category', function () {
    $category = Category::factory()->create([
        'name' => 'Original Name',
        'color' => '#000000',
    ]);

    $updateData = [
        'name' => 'Updated Category',
        'description' => 'Updated description',
        'color' => '#00FF00',
        'icon' => 'updated-icon',
        'is_active' => false,
    ];

    $response = $this->actingAs($this->adminUser)
        ->put(route('admin.categories.update', $category), $updateData);

    $response->assertRedirect(route('admin.categories.index'));

    $category->refresh();
    expect($category->name)->toBe('Updated Category');
    expect($category->slug)->toBe('updated-category');
    expect($category->color)->toBe('#00FF00');
    expect($category->is_active)->toBeFalse();
});

it('can delete a category without products', function () {
    $category = Category::factory()->create();

    $response = $this->actingAs($this->adminUser)
        ->delete(route('admin.categories.destroy', $category));

    $response->assertRedirect(route('admin.categories.index'));
    $this->assertDatabaseMissing('categories', ['id' => $category->id]);
});

it('cannot delete a category with products', function () {
    $category = Category::factory()->create();
    $shop = \App\Models\Shop::factory()->create();
    Product::factory()->create([
        'category_id' => $category->id,
        'shop_id' => $shop->id,
    ]);

    $response = $this->actingAs($this->adminUser)
        ->delete(route('admin.categories.destroy', $category));

    $response->assertRedirect(route('admin.categories.index'));
    $this->assertDatabaseHas('categories', ['id' => $category->id]);
});

it('automatically generates slug from name', function () {
    $category = Category::factory()->withName('Test Category Name')->create();

    expect($category->slug)->toBe('test-category-name');
});

it('updates slug when name changes', function () {
    $category = Category::factory()->withName('Original Name')->create();

    $category->update(['name' => 'New Category Name']);

    expect($category->slug)->toBe('new-category-name');
});

it('has correct relationship with products', function () {
    $category = Category::factory()->create();
    $shop = \App\Models\Shop::factory()->create();
    $products = Product::factory()->count(3)->create([
        'category_id' => $category->id,
        'shop_id' => $shop->id,
    ]);

    expect($category->products)->toHaveCount(3);
    expect($category->products->first()->category_id)->toBe($category->id);
});

it('can scope active categories', function () {
    Category::factory()->create(['is_active' => true]);
    Category::factory()->create(['is_active' => false]);

    $activeCategories = Category::active()->get();

    expect($activeCategories)->toHaveCount(1);
    expect($activeCategories->first()->is_active)->toBeTrue();
});

it('can get products count attribute', function () {
    $category = Category::factory()->create();
    $shop = \App\Models\Shop::factory()->create();
    Product::factory()->count(5)->create([
        'category_id' => $category->id,
        'shop_id' => $shop->id,
    ]);

    $category = Category::withCount('products')->find($category->id);

    expect($category->products_count)->toBe(5);
});
