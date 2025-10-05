import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export const formatPrice = (product) => {
    const min_price = product.min_price;
    const max_price = product.max_price;

    if (min_price == null && max_price == null) {
        return 'Tidak disebutkan';
    }

    const format_min_price = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(min_price);
    let format_max_price = '';

    if (max_price) {
        format_max_price = new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(max_price);
    }
    return max_price
        ? `${format_min_price} - ${format_max_price}`
        : format_min_price;
};
