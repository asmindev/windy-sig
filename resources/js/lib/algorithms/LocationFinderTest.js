import { LocationFinder } from './LocationFinder';

/**
 * Simple test function to verify LocationFinder functionality
 */
export function testLocationFinder() {
    // Sample shop data for testing
    const testShops = [
        {
            id: 1,
            name: 'Toko A',
            latitude: -3.9778,
            longitude: 122.5194,
            address: 'Jl. Test A',
        },
        {
            id: 2,
            name: 'Toko B',
            latitude: -3.98,
            longitude: 122.52,
            address: 'Jl. Test B',
        },
        {
            id: 3,
            name: 'Toko C',
            latitude: -3.975,
            longitude: 122.518,
            address: 'Jl. Test C',
        },
    ];

    try {
        console.log('Testing LocationFinder...');

        // Initialize LocationFinder
        const finder = new LocationFinder();
        finder.initialize(testShops);

        console.log('✓ LocationFinder initialized successfully');

        // Test nearest shops
        const userLat = -3.9785;
        const userLng = 122.519;
        const nearestShops = finder.findNearestShops(userLat, userLng, 2);

        console.log('✓ Found nearest shops:', nearestShops.length);

        // Test optimal route
        const shopIndices = [0, 1, 2];
        const optimalRoute = finder.findOptimalRoute(
            userLat,
            userLng,
            shopIndices,
        );

        console.log(
            '✓ Calculated optimal route:',
            optimalRoute.totalDistance.toFixed(2),
            'km',
        );

        // Test network stats
        const stats = finder.getNetworkStats();
        console.log('✓ Network stats:', stats);

        console.log('All tests passed! 🎉');
        return true;
    } catch (error) {
        console.error('❌ Test failed:', error);
        return false;
    }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
    window.testLocationFinder = testLocationFinder;
}
