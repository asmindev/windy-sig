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
        Schema::create('distances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('from_shop_id')->constrained('shops')->onDelete('cascade');
            $table->foreignId('to_shop_id')->constrained('shops')->onDelete('cascade');
            $table->decimal('distance', 8, 2); // Distance in kilometers
            $table->timestamps();

            // Ensure unique combinations and add indexes for performance
            $table->unique(['from_shop_id', 'to_shop_id']);
            $table->index('from_shop_id');
            $table->index('to_shop_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('distances');
    }
};
