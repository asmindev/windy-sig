<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Distance extends Model
{
    /** @use HasFactory<\Database\Factories\DistanceFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'from_shop_id',
        'to_shop_id',
        'distance',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'distance' => 'decimal:2',
        ];
    }

    /**
     * Get the shop this distance is from.
     */
    public function fromShop()
    {
        return $this->belongsTo(Shop::class, 'from_shop_id');
    }

    /**
     * Get the shop this distance is to.
     */
    public function toShop()
    {
        return $this->belongsTo(Shop::class, 'to_shop_id');
    }
}
