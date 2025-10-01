<?php

use App\Http\Controllers\Admin\AdminProductController;
use App\Http\Controllers\Admin\AdminShopController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Api\RouteController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ShopController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');

// Public routes
Route::get('/shops', [ShopController::class, 'index'])->name('shops.index');
Route::get('/shops/{shop}', [ShopController::class, 'show'])->name('shops.show');
Route::get('/api/shops/map-data', [ShopController::class, 'mapData'])->name('shops.map-data');

// Public product routes
Route::get('/products', [ProductController::class, 'index'])->name('products.index');
Route::get('/products/{product}', [ProductController::class, 'show'])->name('products.show');
Route::get('/api/products/search-suggestions', [ProductController::class, 'searchSuggestions'])->name('products.search-suggestions');

// Route API endpoints
Route::prefix('api/routes')->name('api.routes.')->group(function () {
    Route::post('/get-route', [RouteController::class, 'getRoute'])->name('get-route');
    Route::post('/nearest-shops', [RouteController::class, 'findNearestShops'])->name('nearest-shops');
    Route::post('/batch-routes', [RouteController::class, 'getBatchRoutes'])->name('batch-routes');
});

// Admin routes
Route::middleware(['auth', 'verified', 'admin'])->group(function () {
    // Admin dashboard
    Route::get('/admin', [DashboardController::class, 'admin'])->name('admin.dashboard');

    // Category management
    Route::resource('admin/categories', CategoryController::class, [
        'as' => 'admin',
    ]);

    // Shop management
    Route::get('/admin/shops', [AdminShopController::class, 'index'])->name('admin.shops.index');
    Route::get('/admin/shops/create', [AdminShopController::class, 'create'])->name('admin.shops.create');
    Route::post('/admin/shops', [AdminShopController::class, 'store'])->name('admin.shops.store');
    Route::get('/admin/shops/{shop}', [AdminShopController::class, 'show'])->name('admin.shops.show');
    Route::get('/admin/shops/{shop}/edit', [AdminShopController::class, 'edit'])->name('admin.shops.edit');
    Route::put('/admin/shops/{shop}', [AdminShopController::class, 'update'])->name('admin.shops.update');
    Route::delete('/admin/shops/{shop}', [AdminShopController::class, 'destroy'])->name('admin.shops.destroy');

    // Additional admin shop routes
    Route::post('/admin/shops/bulk-delete', [AdminShopController::class, 'bulkDelete'])->name('admin.shops.bulk-delete');

    // Product management
    Route::get('/admin/products', [AdminProductController::class, 'index'])->name('admin.products.index');
    Route::get('/admin/products/create', [AdminProductController::class, 'create'])->name('admin.products.create');
    Route::post('/admin/products', [AdminProductController::class, 'store'])->name('admin.products.store');
    Route::get('/admin/products/{product}', [AdminProductController::class, 'show'])->name('admin.products.show');
    Route::get('/admin/products/{product}/edit', [AdminProductController::class, 'edit'])->name('admin.products.edit');
    Route::put('/admin/products/{product}', [AdminProductController::class, 'update'])->name('admin.products.update');
    Route::delete('/admin/products/{product}', [AdminProductController::class, 'destroy'])->name('admin.products.destroy');

    // Additional admin product routes
    Route::post('/admin/products/bulk-delete', [AdminProductController::class, 'bulkDelete'])->name('admin.products.bulk-delete');
    Route::post('/admin/products/bulk-update-availability', [AdminProductController::class, 'bulkUpdateAvailability'])->name('admin.products.bulk-update-availability');
});
