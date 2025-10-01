<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Makanan Tradisional',
                'description' => 'Produk makanan khas daerah dan tradisional',
            ],
            [
                'name' => 'Kerajinan Tangan',
                'description' => 'Produk kerajinan tangan buatan lokal',
            ],
            [
                'name' => 'Pakaian & Tekstil',
                'description' => 'Pakaian dan produk tekstil khas daerah',
            ],
            [
                'name' => 'Aksesoris',
                'description' => 'Aksesoris dan perhiasan lokal',
            ],
            [
                'name' => 'Minuman Khas',
                'description' => 'Minuman khas dan tradisional daerah',
            ],
            [
                'name' => 'Souvenir',
                'description' => 'Souvenir dan kenang-kenangan wisata',
            ],
        ];

        foreach ($categories as $category) {
            \App\Models\Category::create($category);
        }
    }
}
