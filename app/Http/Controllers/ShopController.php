<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\Shop;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ShopController extends Controller
{
    /**
     * Display a listing of shops for public users.
     */
    public function index(Request $request)
    {
        $activeTab = $request->get('tab', 'products'); // Default to products tab

        // Get all categories for filter
        $categories = Category::withCount('products')
            ->orderBy('name')
            ->get();

        // Parse selected category IDs from URL
        $categoryIdsParam = $request->get('categories');
        $selectedCategoryIds = $categoryIdsParam ? explode(',', $categoryIdsParam) : [];

        if ($activeTab === 'products') {
            // Products Tab
            $query = Product::with(['category', 'shop']);

            // Search functionality for products
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhereHas('shop', function ($shopQuery) use ($search) {
                            $shopQuery->where('name', 'like', "%{$search}%");
                        });
                });
            }

            // Category filter for products
            if (count($selectedCategoryIds) > 0) {
                $query->whereIn('category_id', $selectedCategoryIds);
            }

            // Default sorting: top_product first, then by name
            $query->orderByRaw('top_product DESC')
                ->orderBy('name');

            $products = $query->paginate(12);

            return Inertia::render('Shops/Index', [
                'activeTab' => 'products',
                'products' => $products,
                'shops' => null,
                'categories' => $categories,
                'filters' => $request->only(['search', 'categories', 'tab']),
            ]);
        }

        // Shops Tab
        $query = Shop::with('products.category');

        // Shops Tab
        $query = Shop::with('products.category');

        // Search functionality for shops
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%")
                    ->orWhereHas('products', function ($productQuery) use ($search) {
                        $productQuery->where('name', 'like', "%{$search}%")
                            ->orWhere('description', 'like', "%{$search}%");
                    });
            });
        }

        // Category filter for shops
        if (count($selectedCategoryIds) > 0) {
            $query->whereHas('products', function ($productQuery) use ($selectedCategoryIds) {
                $productQuery->whereIn('category_id', $selectedCategoryIds);
            });
        }

        // Location-based search
        if ($request->has(['latitude', 'longitude'])) {
            $latitude = $request->latitude;
            $longitude = $request->longitude;
            $radius = $request->radius ?? 10; // Default 10km radius

            $query->withinRadius($latitude, $longitude, $radius);

            // If sorting by distance, the withinRadius scope already handles ordering
            // Otherwise, we can add other sorting options here
        } else {
            // Default sorting by rating (highest first), then by name
            $query->orderByRaw('rating IS NULL, rating DESC')
                ->orderBy('name');
        }

        $shops = $query->paginate(12);

        return Inertia::render('Shops/Index', [
            'activeTab' => 'shops',
            'products' => null,
            'shops' => $shops,
            'categories' => $categories,
            'filters' => $request->only(['search', 'categories', 'latitude', 'longitude', 'radius', 'sort', 'tab']),
        ]);
    }

    /**
     * Display the specified shop for public users.
     */
    public function show(Shop $shop)
    {
        $shop->load('products.category');

        return Inertia::render('Shops/Show', [
            'shop' => $shop,
        ]);
    }

    /**
     * API endpoint for map data.
     */
    public function mapData(Request $request)
    {
        $query = Shop::select(['id', 'name', 'address', 'latitude', 'longitude']);

        // Location-based filtering for map
        if ($request->has(['latitude', 'longitude'])) {
            $latitude = $request->latitude;
            $longitude = $request->longitude;
            $radius = $request->radius ?? 50; // Default 50km radius for map

            $query->withinRadius($latitude, $longitude, $radius);
        }

        $shops = $query->get();

        return response()->json($shops);
    }
}
