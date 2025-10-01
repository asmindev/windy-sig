<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreShopRequest;
use App\Http\Requests\UpdateShopRequest;
use App\Models\Shop;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AdminShopController extends Controller
{
    /**
     * Display a listing of shops for admin.
     */
    public function index(Request $request)
    {
        $query = Shop::with('products');

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Sorting functionality
        $sortBy = $request->get('sort_by', 'name');
        $sortOrder = $request->get('sort_order', 'asc');

        $allowedSorts = ['name', 'address', 'operating_hours', 'created_at'];
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortOrder === 'desc' ? 'desc' : 'asc');
        }

        // Per page functionality
        $perPage = $request->get('per_page', 10);
        $allowedPerPage = [10, 25, 50, 100];
        if (! in_array((int) $perPage, $allowedPerPage)) {
            $perPage = 10;
        }

        $shops = $query->paginate($perPage)->withQueryString();

        return Inertia::render('Admin/Shops/Index', [
            'shops' => $shops,
            'filters' => $request->only(['search', 'sort_by', 'sort_order', 'per_page']),
        ]);
    }

    /**
     * Show the form for creating a new shop.
     */
    public function create()
    {
        return Inertia::render('Admin/Shops/Create');
    }

    /**
     * Store a newly created shop in storage.
     */
    public function store(StoreShopRequest $request)
    {
        $shop = Shop::create($request->validated());

        return redirect()->route('admin.shops.index')
            ->with('message', 'Toko berhasil dibuat.')->with('status', 'success');
    }

    /**
     * Display the specified shop for admin.
     */
    public function show(Shop $shop)
    {
        $shop->load(['products.category']);

        return Inertia::render('Admin/Shops/Show', [
            'shop' => $shop,
        ]);
    }

    /**
     * Show the form for editing the specified shop.
     */
    public function edit(Shop $shop)
    {
        return Inertia::render('Admin/Shops/Edit', [
            'shop' => $shop,
        ]);
    }

    /**
     * Update the specified shop in storage.
     */
    public function update(UpdateShopRequest $request, Shop $shop)
    {
        $shop->update($request->validated());

        return redirect()->route('admin.shops.index')
            ->with('message', 'Toko berhasil diperbarui.')->with('status', 'success');
    }

    /**
     * Remove the specified shop from storage.
     */
    public function destroy(Shop $shop)
    {
        try {
            Log::info('Deleting shop', ['shop_id' => $shop->id]);
            // Check if shop has products

            $shop->delete();
            Log::info('Shop deleted', ['shop_id' => $shop->id]);

            return back()->with('message', 'Toko berhasil dihapus.')->with('status', 'success');
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal menghapus toko: ' . $e->getMessage());
        }
    }

    /**
     * Bulk delete shops.
     */
    public function bulkDelete(Request $request)
    {
        $request->validate([
            'shop_ids' => 'required|array',
            'shop_ids.*' => 'exists:shops,id',
        ]);

        $deletedCount = 0;
        $errors = [];

        foreach ($request->shop_ids as $shopId) {
            $shop = Shop::find($shopId);
            if ($shop) {
                if ($shop->products()->count() > 0) {
                    $errors[] = "Toko '{$shop->name}' tidak dapat dihapus karena masih memiliki produk.";
                } else {
                    $shop->delete();
                    $deletedCount++;
                }
            }
        }

        if ($deletedCount > 0) {
            $message = "Berhasil menghapus {$deletedCount} toko.";
            if (! empty($errors)) {
                $message .= ' ' . implode(' ', $errors);
            }

            return redirect()->back()->with('success', $message);
        }

        return redirect()->back()->with('error', implode(' ', $errors));
    }
}
