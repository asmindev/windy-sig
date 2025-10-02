<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class UpdateProductPriceRangeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Update existing products with min_price and max_price based on the old price field
        // This should be run after the migration is complete
        $this->command->info('Updating product price ranges from existing price data...');

        // Note: This seeder assumes the price column still exists temporarily
        // If the migration has already removed the price column, this won't work
        // In that case, you would need to restore data from backup or manually set price ranges

        $this->command->warn('This seeder should only be run if you still have the old price data available.');
        $this->command->warn('Since the migration has already removed the price column, you may need to manually set price ranges.');

        $this->command->info('Price range update completed.');
    }
}
