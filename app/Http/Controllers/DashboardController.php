<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Search;
use App\Models\Shop;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Display the admin dashboard.
     */
    public function admin(Request $request)
    {
        $stats = [
            'shops_count' => Shop::count(),
            'products_count' => Product::count(),
            'users_count' => User::count(),
            'searches_count' => Search::count(),
            'recent_shops' => Shop::latest()->take(5)->get(),
            'daily_searches' => Search::whereDate('created_at', today())->count(),
            'daily_visits' => 0, // Placeholder for now
            'active_users' => User::whereDate('updated_at', '>=', now()->subDays(7))->count(),
            'routes_created' => 0, // Placeholder for now
        ];

        return Inertia::render('Admin/Dashboard', compact('stats'));
    }
}
