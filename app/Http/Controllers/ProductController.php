<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Shop;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    /**
     * Display a listing of products for public users.
     */
    public function index(Request $request)
    {
        $query = Product::with('shop')
            ->where('is_available', true); // Only show available products to public

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('type', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhereHas('shop', function ($shopQuery) use ($search) {
                        $shopQuery->where('name', 'like', "%{$search}%");
                    });
            });
        }

        // Filter by shop
        if ($request->has('shop_id') && $request->shop_id) {
            $query->where('shop_id', $request->shop_id);
        }

        // Filter by product type
        if ($request->has('type') && $request->type) {
            $query->where('type', $request->type);
        }

        // Price range filter
        if ($request->has('min_price') && $request->min_price) {
            $query->where('min_price', '>=', $request->min_price);
        }
        if ($request->has('max_price') && $request->max_price) {
            $query->where(function ($q) use ($request) {
                $q->where('max_price', '<=', $request->max_price)
                    ->orWhereNull('max_price');
            });
        }

        // Location-based search (products from nearby shops)
        if ($request->has(['latitude', 'longitude'])) {
            $latitude = $request->latitude;
            $longitude = $request->longitude;
            $radius = $request->radius ?? 10; // Default 10km radius

            $query->whereHas('shop', function ($shopQuery) use ($latitude, $longitude, $radius) {
                $shopQuery->withinRadius($latitude, $longitude, $radius);
            });
        }

        // Sorting functionality
        $sortBy = $request->get('sort_by', 'name');
        $sortOrder = $request->get('sort_order', 'asc');

        // Validate sort order
        $sortOrder = in_array($sortOrder, ['asc', 'desc']) ? $sortOrder : 'asc';

        // Handle nested sort (shop.name)
        if ($sortBy === 'shop.name') {
            $query->join('shops', 'products.shop_id', '=', 'shops.id')
                ->orderBy('shops.name', $sortOrder)
                ->select('products.*');
        } else {
            // Validate column exists
            $allowedColumns = ['name', 'type', 'min_price', 'created_at'];
            if (in_array($sortBy, $allowedColumns)) {
                $query->orderBy($sortBy, $sortOrder);
            }
        }

        $products = $query->paginate(12);

        // Get unique product types for filter
        $productTypes = Product::where('is_available', true)
            ->distinct()
            ->pluck('type')
            ->filter()
            ->sort()
            ->values();

        // Get shops that have available products
        $shops = Shop::whereHas('products', function ($q) {
            $q->where('is_available', true);
        })->get();

        return Inertia::render('Products/Index', [
            'products' => $products,
            'shops' => $shops,
            'productTypes' => $productTypes,
            'filters' => $request->only(['search', 'shop_id', 'type', 'min_price', 'max_price', 'latitude', 'longitude', 'radius', 'sort_by', 'sort_order']),
        ]);
    }

    /**
     * Display the specified product for public users.
     */
    public function show(Product $product)
    {
        // Only show available products to public
        if (! $product->is_available) {
            abort(404);
        }

        // load category relation
        $product->load('category', 'shop');
        // Get related products from the same shop
        $relatedProducts = Product::where('shop_id', $product->shop_id)
            ->where('id', '!=', $product->id)
            ->where('is_available', true)
            ->get();

        return Inertia::render('Products/Show', [
            'product' => $product,
            'relatedProducts' => $relatedProducts,
        ]);
    }

    /**
     * API endpoint for product search suggestions.
     */
    public function searchSuggestions(Request $request)
    {
        $query = $request->get('q', '');

        if (strlen($query) < 2) {
            return response()->json([]);
        }

        $suggestions = Product::where('is_available', true)
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                    ->orWhere('type', 'like', "%{$query}%");
            })
            ->select(['id', 'name', 'type', 'min_price', 'max_price', 'image'])
            ->limit(5)
            ->get();

        return response()->json($suggestions);
    }
}
