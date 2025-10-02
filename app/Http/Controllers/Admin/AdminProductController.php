<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Category;
use App\Models\Product;
use App\Models\Shop;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Js;
use Inertia\Inertia;

class AdminProductController extends Controller
{
    /**
     * Display a listing of products for admin.
     */
    public function index(Request $request)
    {
        $query = Product::with(['shop', 'category']);

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('type', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhereHas('shop', function ($shopQuery) use ($search) {
                        $shopQuery->where('name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('category', function ($categoryQuery) use ($search) {
                        $categoryQuery->where('name', 'like', "%{$search}%");
                    });
            });
        }

        // Filter by shop
        if ($request->has('shop_id') && $request->shop_id) {
            $query->where('shop_id', $request->shop_id);
        }

        // Filter by category
        if ($request->has('category_id') && $request->category_id) {
            $query->where('category_id', $request->category_id);
        }

        // Filter by availability
        if ($request->has('is_available') && $request->is_available !== '') {
            $query->where('is_available', (bool) $request->is_available);
        }

        // Price range filter
        if ($request->has('min_price') && $request->min_price) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->has('max_price') && $request->max_price) {
            $query->where('price', '<=', $request->max_price);
        }

        // Sorting functionality
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');

        // Validate sort order
        $sortOrder = in_array($sortOrder, ['asc', 'desc']) ? $sortOrder : 'desc';

        // Handle nested sort (shop.name)
        if ($sortBy === 'shop.name') {
            $query->join('shops', 'products.shop_id', '=', 'shops.id')
                ->orderBy('shops.name', $sortOrder)
                ->select('products.*');
        } else {
            // Validate column exists to prevent SQL injection
            $allowedColumns = ['name', 'type', 'price', 'stock_quantity', 'is_available', 'created_at'];
            if (in_array($sortBy, $allowedColumns)) {
                $query->orderBy($sortBy, $sortOrder);
            }
        }

        // Per page functionality
        $perPage = $request->get('per_page', 15);
        $allowedPerPage = [5, 10, 15, 20, 50, 100];
        if (! in_array((int) $perPage, $allowedPerPage)) {
            $perPage = 15;
        }
        // $products with category
        $products = $query->with('category')->paginate($perPage)->withQueryString();
        $shops = Shop::all();
        $categories = Category::orderBy('name')->get();

        return Inertia::render('Admin/Products/Index', [
            'products' => $products,
            'shops' => $shops,
            'categories' => $categories,
            'filters' => $request->only(['search', 'shop_id', 'category_id', 'is_available', 'min_price', 'max_price', 'per_page', 'sort_by', 'sort_order']),
        ]);
    }

    /**
     * Show the form for creating a new product.
     */
    public function create(Request $request)
    {
        $shops = Shop::all();
        $categories = Category::orderBy('name')->get();

        // Pre-select shop if provided via query parameter
        $selectedShop = null;
        if ($request->has('shop')) {
            $selectedShop = Shop::find($request->shop);
        }

        return Inertia::render('Admin/Products/Create', [
            'shops' => $shops,
            'categories' => $categories,
            'selectedShop' => $selectedShop,
        ]);
    }

    /**
     * Store a newly created product in storage.
     */
    public function store(StoreProductRequest $request)
    {
        $validated = $request->validated();

        // Handle image upload
        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('products', 'public');
        }
        // Handle image upload, if provided
        Product::create($validated);

        return redirect()->route('admin.products.index')
            ->with('message', 'Produk berhasil ditambahkan.')
            ->with('status', 'success');
    }

    /**
     * Display the specified product for admin.
     */
    public function show(Product $product)
    {
        $product->load(['shop', 'category']);

        return Inertia::render('Admin/Products/Show', [
            'product' => $product,
        ]);
    }

    /**
     * Show the form for editing the specified product.
     */
    public function edit(Product $product)
    {
        $product->load(['shop', 'category']);
        $shops = Shop::all();
        $categories = Category::orderBy('name')->get();



        return Inertia::render('Admin/Products/Edit', [
            'product' => $product,
            'shops' => $shops,
            'categories' => $categories,
        ]);
    }

    /**
     * Update the specified product in storage.
     */
    public function update(UpdateProductRequest $request, Product $product)
    {
        $validated = $request->validated();

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            $validated['image'] = $request->file('image')->store('products', 'public');
        }

        $product->update($validated);

        return redirect()->route('admin.products.index')
            ->with('message', 'Produk berhasil diperbarui.')
            ->with('status', 'success');
    }

    /**
     * Remove the specified product from storage.
     */
    public function destroy(Product $product)
    {
        Log::info('Deleting product', ['product_id' => $product->id]);
        // Delete image if exists
        if ($product->image) {
            Storage::disk('public')->delete($product->image);
        }

        $product->delete();

        return redirect()->route('admin.products.index')
            ->with('message', 'Produk berhasil dihapus.')->with('status', 'success');
    }

    /**
     * Bulk delete products.
     */
    public function bulkDelete(Request $request)
    {
        $request->validate([
            'product_ids' => 'required|array',
            'product_ids.*' => 'exists:products,id',
        ]);

        $deletedCount = 0;

        foreach ($request->product_ids as $productId) {
            $product = Product::find($productId);
            if ($product) {
                // Delete image if exists
                if ($product->image) {
                    Storage::disk('public')->delete($product->image);
                }
                $product->delete();
                $deletedCount++;
            }
        }

        return redirect()->back()
            ->with('message', "Berhasil menghapus {$deletedCount} produk.")
            ->with('status', 'success');
    }

    /**
     * Bulk update availability status.
     */
    public function bulkUpdateAvailability(Request $request)
    {
        $request->validate([
            'product_ids' => 'required|array',
            'product_ids.*' => 'exists:products,id',
            'is_available' => 'required|boolean',
        ]);

        $updatedCount = Product::whereIn('id', $request->product_ids)
            ->update(['is_available' => $request->is_available]);

        $status = $request->is_available ? 'tersedia' : 'tidak tersedia';

        return redirect()->back()
            ->with('message', "Berhasil mengubah status {$updatedCount} produk menjadi {$status}.")
            ->with('status', 'success');
    }
}
