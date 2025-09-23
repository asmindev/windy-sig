import { Ziggy } from './ziggy.js';

// Make Ziggy available globally
if (typeof window !== 'undefined') {
    window.Ziggy = Ziggy;
}

// Enhanced route function
export function route(name, params = {}, absolute = false) {
    const ziggy = typeof window !== 'undefined' ? window.Ziggy : Ziggy;

    if (!ziggy.routes[name]) {
        console.warn(`Route ${name} not found`);
        return '#';
    }

    const route = ziggy.routes[name];
    let uri = route.uri;

    // Handle parameters
    if (typeof params === 'object' && params !== null) {
        // Object form: { product: 1 }
        Object.keys(params).forEach((key) => {
            uri = uri.replace(`{${key}}`, params[key]);
        });
    } else if (params !== undefined && params !== null) {
        // Direct value form: just the ID
        // Try to match with the first parameter in the route
        if (route.parameters && route.parameters.length > 0) {
            const firstParam = route.parameters[0];
            uri = uri.replace(`{${firstParam}}`, params);
        }
    }

    // Build full URL
    const baseUrl = absolute ? ziggy.url : '';
    const fullUrl = `${baseUrl}/${uri}`;

    // Clean up multiple slashes and trailing slash
    return fullUrl.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
}

// Export Ziggy for direct access
export { Ziggy };
