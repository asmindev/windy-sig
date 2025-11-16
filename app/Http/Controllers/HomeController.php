<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Shop;
use App\Services\RouteService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __construct(private RouteService $routeService) {}

    /**
     * Tampilkan halaman utama dengan peta Kota Kendari
     */
    public function index(Request $request): Response
    {
        $search = $request->get('search');
        $activeShopId = $request->get('active');
        $fromCoords = $request->get('from'); // format: "lat,lng"
        $toCoords = $request->get('to'); // format: "lat,lng"
        $categoryIds = $request->get('categories') ? explode(',', $request->get('categories')) : [];

        $shops = Shop::query()
            ->with('products.category')
            ->when($search, function ($query, $search) {
                return $query->where(function ($q) use ($search) {
                    // Cari berdasarkan nama toko, alamat, atau deskripsi
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('address', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        // Atau cari berdasarkan nama produk yang dimiliki toko
                        ->orWhereHas('products', function ($productQuery) use ($search) {
                            $productQuery->where('name', 'like', "%{$search}%")
                                ->orWhere('type', 'like', "%{$search}%")
                                ->orWhere('description', 'like', "%{$search}%")
                                // Atau cari berdasarkan nama kategori produk
                                ->orWhereHas('category', function ($categoryQuery) use ($search) {
                                    $categoryQuery->where('name', 'like', "%{$search}%");
                                });
                        });
                });
            })
            ->when(count($categoryIds) > 0, function ($query) use ($categoryIds) {
                return $query->whereHas('products', function ($productQuery) use ($categoryIds) {
                    $productQuery->whereIn('category_id', $categoryIds);
                });
            })
            ->get();

        // Auto-detect shop berdasarkan koordinat 'to' jika tidak ada active parameter
        $activeShop = null;
        if ($activeShopId) {
            $activeShop = $shops->firstWhere('id', $activeShopId);
        } elseif ($toCoords) {
            $coords = explode(',', $toCoords);
            if (count($coords) === 2 && is_numeric($coords[0]) && is_numeric($coords[1])) {
                $lat = (float) $coords[0];
                $lng = (float) $coords[1];

                // Find shop by exact coordinates match
                $activeShop = $shops->first(function ($shop) use ($lat, $lng) {
                    return abs((float) $shop->latitude - $lat) < 0.0001
                        && abs((float) $shop->longitude - $lng) < 0.0001;
                });
            }
        }

        // Prepare routing data
        $routingData = null;
        if ($activeShop && $fromCoords && $toCoords) {
            $fromCoordinates = explode(',', $fromCoords);
            $toCoordinates = explode(',', $toCoords);

            if (count($fromCoordinates) === 2 && count($toCoordinates) === 2) {
                $routingData = [
                    'activeShopId' => $activeShop->id,
                    'fromLat' => (float) $fromCoordinates[0],
                    'fromLng' => (float) $fromCoordinates[1],
                    'toLat' => (float) $toCoordinates[0],
                    'toLng' => (float) $toCoordinates[1],
                    'shouldShowRoute' => true,
                ];
            }
        }

        return Inertia::render('home/page', [
            'shops' => $shops,
            'search' => $search,
            'activeShop' => $activeShop,
            'routingData' => $routingData,
            'categories' => Category::withCount('products')->orderBy('name')->get(),
        ]);
    }
}
