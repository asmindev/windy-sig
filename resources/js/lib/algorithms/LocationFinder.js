import * as turf from '@turf/turf';

/**
 * LocationFinder class that combines Floyd-Warshall algorithm with Turf.js
 * for advanced location finding and route optimization
 */
export class LocationFinder {
    constructor(shops = []) {
        this.shops = shops;
        this.distanceMatrix = null;
        this.adjacencyMatrix = null;
        this.initialized = false;
    }

    /**
     * Initialize the location finder with shops data
     */
    initialize(shops) {
        this.shops = shops;
        this.buildDistanceMatrix();
        this.buildAdjacencyMatrix();
        this.initialized = true;
    }

    /**
     * Build distance matrix using Turf.js for accurate geographical distances
     */
    buildDistanceMatrix() {
        const n = this.shops.length;
        this.distanceMatrix = Array(n)
            .fill(null)
            .map(() => Array(n).fill(Infinity));

        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (i === j) {
                    this.distanceMatrix[i][j] = 0;
                } else {
                    const from = turf.point([
                        this.shops[i].longitude,
                        this.shops[i].latitude,
                    ]);
                    const to = turf.point([
                        this.shops[j].longitude,
                        this.shops[j].latitude,
                    ]);

                    // Calculate distance in kilometers using Turf.js
                    const distance = turf.distance(from, to, {
                        units: 'kilometers',
                    });
                    this.distanceMatrix[i][j] = distance;
                }
            }
        }
    }

    /**
     * Build adjacency matrix for Floyd-Warshall algorithm
     * Consider shops within a reasonable distance as connected
     */
    buildAdjacencyMatrix() {
        const n = this.shops.length;
        const maxDistance = 50; // Maximum distance in km to consider as connected

        this.adjacencyMatrix = Array(n)
            .fill(null)
            .map(() => Array(n).fill(Infinity));

        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (i === j) {
                    this.adjacencyMatrix[i][j] = 0;
                } else if (this.distanceMatrix[i][j] <= maxDistance) {
                    this.adjacencyMatrix[i][j] = this.distanceMatrix[i][j];
                }
            }
        }
    }

    /**
     * Find nearest shops to a given location using Turf.js
     */
    findNearestShops(latitude, longitude, limit = 5, maxDistance = 20) {
        if (!this.initialized) {
            throw new Error(
                'LocationFinder not initialized. Call initialize() first.',
            );
        }

        const userPoint = turf.point([longitude, latitude]);
        const shopsWithDistance = this.shops.map((shop, index) => {
            const shopPoint = turf.point([shop.longitude, shop.latitude]);
            const distance = turf.distance(userPoint, shopPoint, {
                units: 'kilometers',
            });

            return {
                ...shop,
                index,
                distance,
                bearing: turf.bearing(userPoint, shopPoint),
                rhumbDistance: turf.rhumbDistance(userPoint, shopPoint, {
                    units: 'kilometers',
                }),
            };
        });

        return shopsWithDistance
            .filter((shop) => shop.distance <= maxDistance)
            .sort((a, b) => a.distance - b.distance)
            .slice(0, limit);
    }

    /**
     * Find optimal route using Floyd-Warshall algorithm
     */
    findOptimalRoute(startLat, startLng, shopIndices) {
        if (!this.initialized) {
            throw new Error(
                'LocationFinder not initialized. Call initialize() first.',
            );
        }

        if (shopIndices.length === 0) {
            return { route: [], totalDistance: 0, estimatedTime: 0 };
        }

        // Apply Floyd-Warshall algorithm to find shortest paths
        const shortestPaths = this.applyFloydWarshall();

        // Find the best starting shop from user location
        const userPoint = turf.point([startLng, startLat]);
        const startDistances = shopIndices.map((index) => {
            const shopPoint = turf.point([
                this.shops[index].longitude,
                this.shops[index].latitude,
            ]);
            return {
                index,
                distance: turf.distance(userPoint, shopPoint, {
                    units: 'kilometers',
                }),
            };
        });

        // Sort by distance from user
        startDistances.sort((a, b) => a.distance - b.distance);

        // Use TSP-like approach to find optimal tour
        const tour = this.solveTSP(
            shopIndices,
            shortestPaths,
            startDistances[0].index,
        );

        // Calculate total distance and estimated time
        let totalDistance = startDistances[0].distance; // Distance from user to first shop

        for (let i = 0; i < tour.length - 1; i++) {
            totalDistance += shortestPaths[tour[i]][tour[i + 1]];
        }

        // Estimate time (assuming average speed of 30 km/h in city)
        const estimatedTime = (totalDistance / 30) * 60; // in minutes

        return {
            route: tour.map((index) => this.shops[index]),
            totalDistance,
            estimatedTime,
            startDistance: startDistances[0].distance,
        };
    }

    /**
     * Apply Floyd-Warshall algorithm to find all shortest paths
     */
    applyFloydWarshall() {
        const n = this.shops.length;
        const dist = this.adjacencyMatrix.map((row) => [...row]);

        // Floyd-Warshall algorithm
        for (let k = 0; k < n; k++) {
            for (let i = 0; i < n; i++) {
                for (let j = 0; j < n; j++) {
                    if (dist[i][k] + dist[k][j] < dist[i][j]) {
                        dist[i][j] = dist[i][k] + dist[k][j];
                    }
                }
            }
        }

        return dist;
    }

    /**
     * Solve TSP using nearest neighbor heuristic with Floyd-Warshall distances
     */
    solveTSP(shopIndices, distances, startIndex) {
        if (shopIndices.length <= 1) return shopIndices;

        const unvisited = new Set(shopIndices);
        const tour = [startIndex];
        unvisited.delete(startIndex);

        let current = startIndex;

        while (unvisited.size > 0) {
            let nearest = null;
            let minDistance = Infinity;

            for (const shop of unvisited) {
                const distance = distances[current][shop];
                if (distance < minDistance) {
                    minDistance = distance;
                    nearest = shop;
                }
            }

            if (nearest !== null) {
                tour.push(nearest);
                unvisited.delete(nearest);
                current = nearest;
            } else {
                // If no path found, add remaining shops by direct distance
                const remaining = Array.from(unvisited);
                tour.push(...remaining);
                break;
            }
        }

        return tour;
    }

    /**
     * Find shops within a polygon area using Turf.js
     */
    findShopsInArea(polygon) {
        if (!this.initialized) {
            throw new Error(
                'LocationFinder not initialized. Call initialize() first.',
            );
        }

        const turfPolygon = turf.polygon([polygon]);

        return this.shops.filter((shop) => {
            const point = turf.point([shop.longitude, shop.latitude]);
            return turf.booleanPointInPolygon(point, turfPolygon);
        });
    }

    /**
     * Find shops along a route with buffer distance
     */
    findShopsAlongRoute(routeCoordinates, bufferDistance = 1) {
        if (!this.initialized) {
            throw new Error(
                'LocationFinder not initialized. Call initialize() first.',
            );
        }

        const line = turf.lineString(routeCoordinates);
        const buffered = turf.buffer(line, bufferDistance, {
            units: 'kilometers',
        });

        return this.shops.filter((shop) => {
            const point = turf.point([shop.longitude, shop.latitude]);
            return turf.booleanPointInPolygon(point, buffered);
        });
    }

    /**
     * Calculate isochrone (area reachable within time/distance)
     */
    calculateIsochrone(centerLat, centerLng, maxDistance) {
        if (!this.initialized) {
            throw new Error(
                'LocationFinder not initialized. Call initialize() first.',
            );
        }

        const center = turf.point([centerLng, centerLat]);
        const circle = turf.circle(center, maxDistance, {
            units: 'kilometers',
        });

        const shopsInRange = this.shops.filter((shop) => {
            const shopPoint = turf.point([shop.longitude, shop.latitude]);
            const distance = turf.distance(center, shopPoint, {
                units: 'kilometers',
            });
            return distance <= maxDistance;
        });

        return {
            area: circle,
            shops: shopsInRange,
        };
    }

    /**
     * Get statistics about the shop network
     */
    getNetworkStats() {
        if (!this.initialized) {
            throw new Error(
                'LocationFinder not initialized. Call initialize() first.',
            );
        }

        const distances = this.distanceMatrix
            .flat()
            .filter((d) => d !== 0 && d !== Infinity);

        return {
            totalShops: this.shops.length,
            averageDistance:
                distances.reduce((a, b) => a + b, 0) / distances.length,
            minDistance: Math.min(...distances),
            maxDistance: Math.max(...distances),
            networkDensity:
                distances.length /
                (this.shops.length * (this.shops.length - 1)),
        };
    }
}

// Export singleton instance
export const locationFinder = new LocationFinder();

// Export utility functions
export const formatDistance = (distance) => {
    if (distance < 1) {
        return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
};

export const formatTime = (minutes) => {
    if (minutes < 60) {
        return `${Math.round(minutes)} menit`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    return `${hours}j ${remainingMinutes}m`;
};
