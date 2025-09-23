/**
 * Map default configuration constants
 */
export const DEFAULT_LONGITUDE =
    parseFloat(import.meta.env.VITE_DEFAULT_LONGITUDE) || 122.5423;
export const DEFAULT_LATITUDE =
    parseFloat(import.meta.env.VITE_DEFAULT_LATITUDE) || -3.9942;
export const DEFAULT_ZOOM = parseInt(import.meta.env.VITE_DEFAULT_ZOOM) || 13;

/**
 * Search configuration
 */
export const SEARCH_DEBOUNCE_DELAY = 500; // milliseconds
