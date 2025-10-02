<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class UpdateProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return Auth::check() && Auth::user()->isAdmin();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'shop_id' => 'required|exists:shops,id',
            'category_id' => 'nullable|exists:categories,id',
            'name' => 'required|string|max:255',
            'type' => 'nullable|string|max:100',
            'min_price' => 'required|numeric|min:0',
            'max_price' => 'nullable|numeric|min:0|gte:min_price',
            'description' => 'nullable|string|max:1000',
            'image' => 'nullable|image|max:10240', // 10MB max (sesuai PHP limits)
            'is_available' => 'boolean',
            'stock_quantity' => 'nullable|integer|min:0',
        ];
    }

    /**
     * Get custom validation messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'shop_id.required' => 'Toko harus dipilih.',
            'shop_id.exists' => 'Toko yang dipilih tidak valid.',
            'category_id.exists' => 'Kategori yang dipilih tidak valid.',
            'name.required' => 'Nama produk harus diisi.',
            'min_price.required' => 'Harga minimum harus diisi.',
            'min_price.numeric' => 'Harga minimum harus berupa angka.',
            'min_price.min' => 'Harga minimum tidak boleh negatif.',
            'max_price.numeric' => 'Harga maksimum harus berupa angka.',
            'max_price.min' => 'Harga maksimum tidak boleh negatif.',
            'max_price.gte' => 'Harga maksimum harus lebih besar atau sama dengan harga minimum.',
            'image.image' => 'File harus berupa gambar.',
            'image.max' => 'Ukuran gambar maksimal 10MB.',
            'stock_quantity.integer' => 'Stok harus berupa angka.',
            'stock_quantity.min' => 'Stok tidak boleh negatif.',
        ];
    }
}
