<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Add new price range columns
            $table->decimal('min_price', 15, 2)->after('type');
            $table->decimal('max_price', 15, 2)->nullable()->after('min_price');

            // Remove old price column
            $table->dropColumn('price');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Add back price column
            $table->decimal('price', 15, 2)->after('type');

            // Remove price range columns
            $table->dropColumn(['min_price', 'max_price']);
        });
    }
};
