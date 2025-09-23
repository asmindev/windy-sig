<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class ShopSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\Shop::factory()
            ->count(8)
            ->create()
            ->each(function ($shop) {
                // Create 2-4 products for each shop
                \App\Models\Product::factory()
                    ->count(rand(2, 4))
                    ->create(['shop_id' => $shop->id]);
            });
    }
}
