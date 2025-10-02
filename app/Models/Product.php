<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;

class Product extends Model
{
    /** @use HasFactory<\Database\Factories\ProductFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'shop_id',
        'category_id',
        'name',
        'type',
        'min_price',
        'max_price',
        'image',
        'description',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'min_price' => 'decimal:2',
            'max_price' => 'decimal:2',
        ];
    }

    // change image url to full path
    public function getImageAttribute(): ?string
    {
        $rawImage = $this->attributes['image'] ?? null;

        Log::info('getImageAttribute called');
        if ($rawImage) {
            Log::info('Image: '.$rawImage);
        } else {
            Log::info('No image available.');
        }

        return $rawImage ? asset('storage/'.$rawImage) : null;
    }

    /**
     * Get formatted price range.
     */
    public function getPriceRangeAttribute(): string
    {
        $minPrice = number_format((float) $this->min_price, 0, ',', '.');

        if ($this->max_price && $this->max_price != $this->min_price) {
            $maxPrice = number_format((float) $this->max_price, 0, ',', '.');

            return "Rp {$minPrice} - Rp {$maxPrice}";
        }

        return "Rp {$minPrice}";
    }

    /**
     * Get the shop that owns the product.
     */
    public function shop()
    {
        return $this->belongsTo(Shop::class);
    }

    /**
     * Get the category that owns the product.
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
