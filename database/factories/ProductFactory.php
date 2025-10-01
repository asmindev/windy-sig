<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $products = [
            ['name' => 'Sarung Sutera Tolaki', 'type' => 'Tekstil', 'price_range' => [150000, 350000]],
            ['name' => 'Batik Motif Kendari', 'type' => 'Tekstil', 'price_range' => [75000, 200000]],
            ['name' => 'Kerajinan Anyaman Pandan', 'type' => 'Kerajinan', 'price_range' => [25000, 75000]],
            ['name' => 'Kaos Khas Sulawesi Tenggara', 'type' => 'Tekstil', 'price_range' => [45000, 85000]],
            ['name' => 'Tas Rajutan Tradisional', 'type' => 'Kerajinan', 'price_range' => [50000, 125000]],
            ['name' => 'Kacang Mete Kendari', 'type' => 'Makanan', 'price_range' => [35000, 65000]],
            ['name' => 'Gula Aren Asli', 'type' => 'Makanan', 'price_range' => [15000, 30000]],
            ['name' => 'Keripik Pisang Raja', 'type' => 'Makanan', 'price_range' => [12000, 25000]],
            ['name' => 'Miniatur Perahu Tradisional', 'type' => 'Souvenir', 'price_range' => [35000, 85000]],
            ['name' => 'Gantungan Kunci Benteng Keraton', 'type' => 'Souvenir', 'price_range' => [8000, 15000]],
            ['name' => 'Minyak Kelapa Murni', 'type' => 'Makanan', 'price_range' => [25000, 45000]],
            ['name' => 'Kopi Robusta Konawe', 'type' => 'Makanan', 'price_range' => [40000, 75000]],
        ];

        $product = $this->faker->randomElement($products);

        return [
            'shop_id' => \App\Models\Shop::factory(),
            'category_id' => \App\Models\Category::inRandomOrder()->first()?->id,
            'name' => $product['name'],
            'type' => $product['type'],
            'price' => $this->faker->numberBetween($product['price_range'][0], $product['price_range'][1]),
            'description' => $this->faker->randomElement([
                'Produk khas daerah dengan kualitas terbaik',
                'Kerajinan tangan asli buatan lokal',
                'Oleh-oleh tradisional Sulawesi Tenggara',
                'Produk UMKM berkualitas tinggi',
                'Souvenir authentik khas Kendari',
            ]),
            'image' => null, // We'll add images later if needed
        ];
    }
}
