<?php

namespace App\Http\Controllers;

use App\Models\Category;
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
        $query = Shop::with('products.category');

        // Search functionality
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

        // Category filter
        if ($request->has('category') && $request->category) {
            $query->whereHas('products', function ($productQuery) use ($request) {
                $productQuery->where('category_id', $request->category);
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

        // Get all categories for filter dropdown
        $categories = Category::withCount('products')
            ->orderBy('name')
            ->get();

        return Inertia::render('Shops/Index', [
            'shops' => $shops,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category', 'latitude', 'longitude', 'radius', 'sort']),
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
