import { route } from '@/ziggy-config';
import { router } from '@inertiajs/react';

/**
 * Service for handling shop-related operations
 * Centralized business logic for shop data table navigation, search, and state management
 */
export class ShopService {
    /**
     * Navigate to a specific page
     * @param {number} page - Page number to navigate to
     * @param {Object} currentFilters - Current filters and sort parameters
     */
    static navigateToPage(page, currentFilters = {}) {
        router.get(
            route('admin.shops.index'),
            {
                ...currentFilters,
                page,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    }

    /**
     * Change the number of items per page
     * @param {number} perPage - Number of items per page
     * @param {Object} currentFilters - Current filters and sort parameters
     */
    static changePerPage(perPage, currentFilters = {}) {
        router.get(
            route('admin.shops.index'),
            {
                ...currentFilters,
                per_page: perPage,
                page: 1, // Reset to first page when changing per page
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    }

    /**
     * Apply search filter
     * @param {string} searchTerm - Search term to apply
     * @param {Object} currentFilters - Current filters and sort parameters
     */
    static search(searchTerm, currentFilters = {}) {
        router.get(
            route('admin.shops.index'),
            {
                ...currentFilters,
                search: searchTerm,
                page: 1, // Reset to first page when searching
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    }

    /**
     * Clear all filters
     */
    static clearFilters() {
        router.get(
            route('admin.shops.index'),
            {},
            {
                preserveState: true,
                replace: true,
            },
        );
    }

    /**
     * Handle column sorting
     * @param {string} column - Column to sort by
     * @param {Object} currentFilters - Current filters and sort parameters
     */
    static handleSort(column, currentFilters = {}) {
        const isCurrentColumn = currentFilters.sort_by === column;
        let sortOrder = 'asc';

        if (isCurrentColumn) {
            sortOrder = currentFilters.sort_order === 'asc' ? 'desc' : 'asc';
        }

        router.get(
            route('admin.shops.index'),
            {
                ...currentFilters,
                sort_by: column,
                sort_order: sortOrder,
                page: 1, // Reset to first page when sorting
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    }

    /**
     * Navigate to shop detail page
     * @param {number} shopId - Shop ID
     */
    static viewShop(shopId) {
        router.visit(route('admin.shops.show', shopId));
    }

    /**
     * Navigate to shop edit page
     * @param {number} shopId - Shop ID
     */
    static editShop(shopId) {
        router.visit(route('admin.shops.edit', shopId));
    }

    /**
     * Delete a shop
     * @param {number} shopId - Shop ID
     */
    static deleteShop(shopId) {
        router.delete(route('admin.shops.destroy', shopId), {
            onSuccess: () => {
                // Optionally show success message
            },
        });
    }

    /**
     * Generate route URL with parameters
     * @param {string} routeName - Route name
     * @param {number|Object} params - Route parameters
     * @returns {string} Generated URL
     */
    static getRouteUrl(routeName, params) {
        try {
            return route(routeName, params);
        } catch (error) {
            console.error('Route generation error:', error);
            return '#';
        }
    }
}

export default ShopService;
