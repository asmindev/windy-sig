<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Category>
 */
class CategoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->randomElement([
            'Makanan Tradisional',
            'Kerajinan Tangan',
            'Pakaian & Tekstil',
            'Aksesoris',
            'Minuman Khas',
            'Souvenir',
            'Elektronik',
            'Kosmetik & Kecantikan',
            'Buku & Majalah',
            'Mainan',
        ]);

        return [
            'name' => $name,
            'description' => fake()->paragraph(),
        ];
    }
}
