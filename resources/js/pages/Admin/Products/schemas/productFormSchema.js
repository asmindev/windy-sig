import * as z from 'zod';

/**
 * Product form validation schema
 * Used for both create and edit operations
 */
export const productFormSchema = z.object({
    shop_id: z.string().min(1, 'Toko harus dipilih'),
    category_id: z.string().optional(),
    name: z.string().min(1, 'Nama produk harus diisi'),
    type: z.string().optional(),
    price: z
        .string()
        .min(1, 'Harga harus diisi')
        .refine(
            (val) => !isNaN(Number(val)) && Number(val) > 0,
            'Harga harus berupa angka positif',
        ),
    description: z.string().optional(),
    image: z.any().optional(),
    stock_quantity: z
        .string()
        .optional()
        .refine(
            (val) => !val || (!isNaN(Number(val)) && Number(val) >= 0),
            'Stok harus berupa angka positif atau nol',
        ),
    is_available: z.boolean().optional(),
});

/**
 * Get default values for creating a new product
 */
export const getCreateDefaultValues = () => ({
    shop_id: '',
    category_id: '',
    name: '',
    type: '',
    price: '',
    description: '',
    image: null,
    stock_quantity: '',
    is_available: true,
});

/**
 * Get default values for editing an existing product
 * @param {Object} product - The product object to edit
 */
export const getEditDefaultValues = (product) => ({
    shop_id: product.shop_id?.toString() || '',
    category_id: product.category_id?.toString() || '',
    name: product.name || '',
    type: product.type || '',
    price: product.price?.toString() || '',
    description: product.description || '',
    image: null, // Always null for file input
    stock_quantity: product.stock_quantity?.toString() || '',
    is_available: product.is_available ?? true,
});

/**
 * Transform form data for submission
 * @param {Object} values - Form values
 * @returns {FormData} - Form data ready for submission
 */
export const transformFormData = (values) => {
    const formData = new FormData();

    Object.keys(values).forEach((key) => {
        const value = values[key];
        if (value !== null && value !== undefined && value !== '') {
            if (key === 'is_available') {
                formData.append(key, value ? '1' : '0');
            } else {
                formData.append(key, value);
            }
        }
    });

    return formData;
};

export default productFormSchema;
