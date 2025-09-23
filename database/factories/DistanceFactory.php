<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Distance>
 */
class DistanceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'from_shop_id' => \App\Models\Shop::factory(),
            'to_shop_id' => \App\Models\Shop::factory(),
            'distance' => $this->faker->randomFloat(2, 0.1, 100.0),
        ];
    }
}
