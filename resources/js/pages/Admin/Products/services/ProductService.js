import { route } from '@/ziggy-config';
import { router } from '@inertiajs/react';

/**
 * Product Service - Handles all product-related API calls and business logic
 */
class ProductService {
    /**
     * Navigate to products index page with optional filters
     * @param {Object} filters - Search and pagination filters
     * @param {Object} options - Inertia router options
     */
    static navigateToIndex(filters = {}, options = {}) {
        const defaultOptions = {
            preserveState: true,
            replace: true,
            ...options,
        };

        router.get(route('admin.products.index'), filters, defaultOptions);
    }

    /**
     * Search products with given term
     * @param {string} searchTerm - Search query
     * @param {number} page - Page number for pagination
     * @param {number} perPage - Items per page
     * @param {string} sortBy - Column to sort by
     * @param {string} sortOrder - Sort order (asc/desc)
     */
    static search(
        searchTerm,
        page = 1,
        perPage = 10,
        sortBy = null,
        sortOrder = 'asc',
    ) {
        const filters = {
            search: searchTerm,
            page: page,
            per_page: perPage,
        };

        if (sortBy) {
            filters.sort_by = sortBy;
            filters.sort_order = sortOrder;
        }

        this.navigateToIndex(filters);
    }

    /**
     * Navigate with full filter options
     * @param {Object} options - All filter options
     */
    static navigateWithFilters(options = {}) {
        this.navigateToIndex(options);
    }

    /**
     * Clear all filters and return to first page
     */
    static clearFilters() {
        this.navigateToIndex();
    }

    /**
     * Navigate to specific page
     * @param {number} page - Page number
     */
    static navigateToPage(page) {
        const url = new URL(window.location);
        url.searchParams.set('page', page);
        router.visit(url.toString(), {
            preserveState: true,
            preserveScroll: true,
        });
    }

    /**
     * Change items per page
     * @param {number} perPage - Number of items per page
     */
    static changePerPage(perPage) {
        const url = new URL(window.location);
        url.searchParams.set('per_page', perPage);
        url.searchParams.delete('page'); // Reset to first page
        router.visit(url.toString(), {
            preserveState: true,
            preserveScroll: true,
        });
    }

    /**
     * Navigate to specific page
     * @param {number} page - Page number
     * @param {Object} currentFilters - Current active filters
     */
    static goToPage(page, currentFilters = {}) {
        this.navigateToIndex({
            ...currentFilters,
            page: page,
        });
    }

    /**
     * Sort by column
     * @param {string} column - Column to sort by
     * @param {string} order - Sort order (asc/desc)
     * @param {Object} currentFilters - Current active filters
     */
    static sortBy(column, order = 'asc', currentFilters = {}) {
        this.navigateToIndex({
            ...currentFilters,
            sort_by: column,
            sort_order: order,
        });
    }

    /**
     * Delete a product
     * @param {Object} product - Product object to delete
     * @param {Function} onSuccess - Success callback
     * @param {Function} onError - Error callback
     */
    static deleteProduct(product, onSuccess = null, onError = null) {
        router.delete(route('admin.products.destroy', product.id), {
            onSuccess: () => {
                if (onSuccess) onSuccess();
            },
            onError: (errors) => {
                if (onError) onError(errors);
            },
        });
    }

    /**
     * Navigate to create product page
     */
    static navigateToCreate() {
        router.visit(route('admin.products.create'));
    }

    /**
     * Navigate to edit product page
     * @param {number} productId - Product ID
     */
    static navigateToEdit(productId) {
        router.visit(route('admin.products.edit', productId));
    }

    /**
     * Navigate to show product page
     * @param {number} productId - Product ID
     */
    static navigateToShow(productId) {
        router.visit(route('admin.products.show', productId));
    }

    /**
     * Format price to Indonesian Rupiah currency
     * @param {number} price - Price amount
     * @returns {string} Formatted price string
     */
    static formatPrice(price) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    }

    /**
     * Get status badge variant based on stock quantity
     * @param {number} stockQuantity - Stock quantity
     * @returns {string} Badge variant
     */
    static getStockBadgeVariant(stockQuantity) {
        return stockQuantity > 0 ? 'default' : 'destructive';
    }

    /**
     * Get status badge variant based on availability
     * @param {boolean} isAvailable - Product availability
     * @returns {string} Badge variant
     */
    static getAvailabilityBadgeVariant(isAvailable) {
        return isAvailable ? 'default' : 'secondary';
    }

    /**
     * Get availability status text
     * @param {boolean} isAvailable - Product availability
     * @returns {string} Status text
     */
    static getAvailabilityText(isAvailable) {
        return isAvailable ? 'Available' : 'Unavailable';
    }

    /**
     * Get route URL for product operations
     * @param {string} operation - Operation type (create, edit, show, index)
     * @param {number} productId - Product ID (for edit/show operations)
     * @returns {string} Route URL
     */
    static getRouteUrl(operation, productId = null) {
        switch (operation) {
            case 'create':
                return route('admin.products.create');
            case 'edit':
                return route('admin.products.edit', productId);
            case 'show':
                return route('admin.products.show', productId);
            case 'index':
            default:
                return route('admin.products.index');
        }
    }
}

export default ProductService;
