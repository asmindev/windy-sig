<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Search extends Model
{
    /** @use HasFactory<\Database\Factories\SearchFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'start_latitude',
        'start_longitude',
        'shop_id',
        'distance',
        'search_time',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'start_latitude' => 'decimal:8',
            'start_longitude' => 'decimal:8',
            'distance' => 'decimal:2',
            'search_time' => 'datetime',
        ];
    }

    /**
     * Get the user that owns the search.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the shop that was searched.
     */
    public function shop()
    {
        return $this->belongsTo(Shop::class);
    }
}
