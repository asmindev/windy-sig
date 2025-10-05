<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Shop>
 */
class ShopFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Kendari coordinates: approximately -3.977, 122.515
        // Creating realistic coordinates around Kendari city center
        $baseLatitude = -3.977;
        $baseLongitude = 122.515;

        return [
            'name' => $this->faker->randomElement([
                'Toko Oleh-Oleh Kendari Asli',
                'Sarung Sutera Kendari',
                'Kerajinan Batik Tolaki',
                'Oleh-Oleh Khas Sulawesi Tenggara',
                'Toko Souvenir Benteng Keraton',
                'Kerajinan Anyaman Pandan',
                'Oleh-Oleh Makanan Khas Kendari',
                'Toko Cinderamata Wua-Wua',
                'Kerajinan Tangan Konawe',
                'Souvenir Kendari Heritage',
            ]),
            'address' => $this->faker->randomElement([
                'Jl. Diponegoro No. 15, Kendari',
                'Jl. Sultan Hasanuddin No. 23, Kendari',
                'Jl. Mayjen Sutoyo No. 45, Kendari',
                'Jl. Ahmad Yani No. 78, Kendari',
                'Jl. Sudirman No. 12, Kendari',
                'Jl. Sam Ratulangi No. 34, Kendari',
                'Jl. Pattimura No. 56, Kendari',
                'Jl. Teuku Umar No. 89, Kendari',
            ]),
            'latitude' => $baseLatitude + $this->faker->randomFloat(6, -0.02, 0.02),
            'longitude' => $baseLongitude + $this->faker->randomFloat(6, -0.02, 0.02),
            'operating_hours' => $this->faker->randomElement([
                '08:00 - 21:00',
                '09:00 - 20:00',
                '07:00 - 22:00',
                '10:00 - 19:00',
            ]),
            'description' => $this->faker->randomElement([
                'Menyediakan berbagai oleh-oleh khas Kendari dan Sulawesi Tenggara',
                'Toko souvenir dengan koleksi kerajinan tradisional',
                'Spesialis sarung sutera dan batik motif Tolaki',
                'Pusat oleh-oleh makanan dan kerajinan khas daerah',
                'Menjual berbagai cinderamata dan produk UMKM lokal',
            ]),
            'phone' => '0401-'.$this->faker->numerify('######'),
            'rating' => $this->faker->randomFloat(1, 1, 5),
        ];
    }
}
