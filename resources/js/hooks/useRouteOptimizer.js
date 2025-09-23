import {
    LocationFinder,
    formatDistance,
    formatTime,
} from '@/lib/algorithms/LocationFinder';
import { useCallback, useEffect, useState } from 'react';

/**
 * Custom hook for route optimization functionality
 */
export function useRouteOptimizer(shops) {
    const [optimizer, setOptimizer] = useState(null);
    const [isCalculating, setIsCalculating] = useState(false);
    const [error, setError] = useState(null);

    // Initialize optimizer when shops change
    useEffect(() => {
        if (shops && shops.length > 0) {
            try {
                setIsCalculating(true);
                setError(null);

                const locationFinder = new LocationFinder();
                locationFinder.initialize(shops);

                setOptimizer(locationFinder);
            } catch (err) {
                setError(
                    'Failed to initialize location finder: ' + err.message,
                );
                console.error('Location finder error:', err);
            } finally {
                setIsCalculating(false);
            }
        }
    }, [shops]);

    // Find nearest shops to user location
    const findNearestShops = useCallback(
        (userLat, userLng, limit = 5) => {
            if (!optimizer) return [];

            try {
                return optimizer.findNearestShops(userLat, userLng, limit);
            } catch (err) {
                console.error('Error finding nearest shops:', err);
                return [];
            }
        },
        [optimizer],
    );

    // Get shortest path between two shops
    const getShortestPath = useCallback(
        (shop1, shop2) => {
            if (!optimizer) return null;

            try {
                const shop1Index = shops.findIndex((s) => s.id === shop1.id);
                const shop2Index = shops.findIndex((s) => s.id === shop2.id);

                if (shop1Index === -1 || shop2Index === -1) return null;

                const shortestPaths = optimizer.applyFloydWarshall();
                const distance = shortestPaths[shop1Index][shop2Index];

                return {
                    distance,
                    path: [shop1, shop2],
                };
            } catch (err) {
                console.error('Error calculating shortest path:', err);
                return null;
            }
        },
        [optimizer, shops],
    );

    // Get optimal tour for multiple shops
    const getOptimalTour = useCallback(
        async (userLat, userLng, selectedShops) => {
            if (!optimizer || selectedShops.length === 0) return null;

            setIsCalculating(true);

            try {
                const shopIndices = selectedShops
                    .map((shop) => shops.findIndex((s) => s.id === shop.id))
                    .filter((index) => index !== -1);

                const result = optimizer.findOptimalRoute(
                    userLat,
                    userLng,
                    shopIndices,
                );

                return {
                    tour: result.route.map((shop, index) => ({
                        ...shop,
                        distanceFromPrevious:
                            index === 0 ? result.startDistance : 0,
                    })),
                    totalDistance: result.totalDistance,
                    estimatedTime: result.estimatedTime,
                };
            } catch (err) {
                console.error('Error calculating optimal tour:', err);
                return null;
            } finally {
                setIsCalculating(false);
            }
        },
        [optimizer, shops],
    );

    // Create route coordinates for map display
    const createRouteCoordinates = useCallback((tour, userLocation) => {
        if (!tour || tour.length === 0) return [];

        const coordinates = [];
        if (userLocation) {
            coordinates.push([userLocation.lng, userLocation.lat]);
        }

        tour.forEach((shop) => {
            coordinates.push([shop.longitude, shop.latitude]);
        });

        return coordinates;
    }, []);

    // Get network statistics
    const getNetworkStats = useCallback(() => {
        if (!optimizer) return null;
        return optimizer.getNetworkStats();
    }, [optimizer]);

    // Find shops in area
    const findShopsInArea = useCallback(
        (polygon) => {
            if (!optimizer) return [];
            return optimizer.findShopsInArea(polygon);
        },
        [optimizer],
    );

    // Find shops along route
    const findShopsAlongRoute = useCallback(
        (routeCoordinates, bufferDistance = 1) => {
            if (!optimizer) return [];
            return optimizer.findShopsAlongRoute(
                routeCoordinates,
                bufferDistance,
            );
        },
        [optimizer],
    );

    // Calculate isochrone
    const calculateIsochrone = useCallback(
        (centerLat, centerLng, maxDistance) => {
            if (!optimizer) return null;
            return optimizer.calculateIsochrone(
                centerLat,
                centerLng,
                maxDistance,
            );
        },
        [optimizer],
    );

    return {
        optimizer,
        isCalculating,
        error,
        findNearestShops,
        getShortestPath,
        getOptimalTour,
        formatDistance,
        formatTime,
        createRouteCoordinates,
        getNetworkStats,
        findShopsInArea,
        findShopsAlongRoute,
        calculateIsochrone,
    };
}

/**
 * Hook for managing route planning state
 */
export function useRoutePlanner() {
    const [selectedShops, setSelectedShops] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    const [plannedRoute, setPlannedRoute] = useState(null);
    const [isPlanning, setIsPlanning] = useState(false);

    // Add shop to selection
    const addShopToRoute = (shop) => {
        setSelectedShops((prev) => {
            if (prev.find((s) => s.id === shop.id)) return prev;
            return [...prev, shop];
        });
    };

    // Remove shop from selection
    const removeShopFromRoute = (shopId) => {
        setSelectedShops((prev) => prev.filter((shop) => shop.id !== shopId));
        // Clear planned route if it exists
        if (plannedRoute) {
            setPlannedRoute(null);
        }
    };

    // Clear all selected shops
    const clearRoute = () => {
        setSelectedShops([]);
        setPlannedRoute(null);
    };

    // Set user location
    const setLocation = (lat, lng) => {
        setUserLocation({ lat, lng });
    };

    // Plan optimal route
    const planRoute = async (optimizer) => {
        if (!userLocation || selectedShops.length === 0 || !optimizer) {
            return;
        }

        setIsPlanning(true);
        try {
            const shopIndices = selectedShops
                .map((shop) =>
                    optimizer.shops.findIndex((s) => s.id === shop.id),
                )
                .filter((index) => index !== -1);

            const result = optimizer.findOptimalRoute(
                userLocation.lat,
                userLocation.lng,
                shopIndices,
            );

            setPlannedRoute({
                tour: result.route,
                totalDistance: result.totalDistance,
                estimatedTime: result.estimatedTime,
            });
        } catch (err) {
            console.error('Error planning route:', err);
        } finally {
            setIsPlanning(false);
        }
    };

    return {
        selectedShops,
        userLocation,
        plannedRoute,
        isPlanning,
        addShopToRoute,
        removeShopFromRoute,
        clearRoute,
        setLocation,
        planRoute,
    };
}

export default { useRouteOptimizer, useRoutePlanner };
