import { distance } from '@turf/turf';

/**
 * Floyd-Warshall Algorithm implementation for finding shortest paths
 * between all pairs of shops using geographical distances
 * Based on trekhleb/javascript-algorithms implementation combined with Turf.js
 */
export class ShopRouteOptimizer {
    constructor(shops) {
        this.shops = shops;
        this.vertices = shops.length;

        // Initialize the Floyd-Warshall matrices
        const result = this.floydWarshall();
        this.optimizedDistances = result.distances;
        this.optimizedPaths = result.nextVertices;
    }

    /**
     * Floyd-Warshall Algorithm implementation
     * Based on trekhleb/javascript-algorithms
     */
    floydWarshall() {
        const vertices = this.shops;

        // Init previous vertices matrix with nulls meaning that there are no
        // previous vertices exist that will give us shortest path.
        const nextVertices = Array(vertices.length)
            .fill(null)
            .map(() => {
                return Array(vertices.length).fill(null);
            });

        // Init distances matrix with Infinities meaning there are no paths
        // between vertices exist so far.
        const distances = Array(vertices.length)
            .fill(null)
            .map(() => {
                return Array(vertices.length).fill(Infinity);
            });

        // Init distance matrix with the distance we already know (from existing edges).
        // And also init previous vertices from the edges.
        vertices.forEach((startVertex, startIndex) => {
            vertices.forEach((endVertex, endIndex) => {
                if (startVertex === endVertex) {
                    // Distance to the vertex itself is 0.
                    distances[startIndex][endIndex] = 0;
                } else {
                    // Calculate geographical distance using Turf.js (Haversine formula)
                    const dist = distance(
                        [startVertex.longitude, startVertex.latitude],
                        [endVertex.longitude, endVertex.latitude],
                        { units: 'kilometers' },
                    );

                    // There is a direct path between all shops (geographical distance)
                    distances[startIndex][endIndex] = dist;
                    nextVertices[startIndex][endIndex] = startVertex;
                }
            });
        });

        // Now let's go to the core of the algorithm.
        // Let's all pair of vertices (from start to end ones) and try to check if there
        // is a shorter path exists between them via middle vertex. Middle vertex may also
        // be one of the graph vertices. As you may see now we're going to have three
        // loops over all graph vertices: for start, end and middle vertices.
        vertices.forEach((middleVertex, middleIndex) => {
            // Path starts from startVertex with startIndex.
            vertices.forEach((startVertex, startIndex) => {
                // Path ends to endVertex with endIndex.
                vertices.forEach((endVertex, endIndex) => {
                    // Compare existing distance from startVertex to endVertex, with distance
                    // from startVertex to endVertex but via middleVertex.
                    // Save the shortest distance and previous vertex that allows
                    // us to have this shortest distance.
                    const distViaMiddle =
                        distances[startIndex][middleIndex] +
                        distances[middleIndex][endIndex];

                    if (distances[startIndex][endIndex] > distViaMiddle) {
                        // We've found a shortest pass via middle vertex.
                        distances[startIndex][endIndex] = distViaMiddle;
                        nextVertices[startIndex][endIndex] = middleVertex;
                    }
                });
            });
        });

        // Shortest distance from x to y: distance[x][y].
        // Next vertex after x one in path from x to y: nextVertices[x][y].
        return { distances, nextVertices };
    }

    /**
     * Execute Floyd-Warshall algorithm (already executed in constructor)
     */
    findShortestPaths() {
        return {
            distances: this.optimizedDistances,
            paths: this.optimizedPaths,
        };
    }

    /**
     * Get shortest path between two shops
     */
    getShortestPath(fromShopId, toShopId) {
        const fromIndex = this.shops.findIndex(
            (shop) => shop.id === fromShopId,
        );
        const toIndex = this.shops.findIndex((shop) => shop.id === toShopId);

        if (fromIndex === -1 || toIndex === -1) {
            return null;
        }

        const path = this.reconstructPath(fromIndex, toIndex);
        const totalDistance = this.optimizedDistances[fromIndex][toIndex];

        return {
            shops: path.map((index) => this.shops[index]),
            totalDistance,
            estimatedTime: this.calculateEstimatedTime(totalDistance),
        };
    }

    /**
     * Reconstruct the actual path from path matrix
     * Based on trekhleb/javascript-algorithms path reconstruction
     */
    reconstructPath(from, to) {
        if (this.optimizedPaths[from][to] === null) {
            return [];
        }

        const path = [from];
        let current = from;

        while (current !== to) {
            const next = this.optimizedPaths[current][to];
            if (next === null) break;

            const nextIndex = this.shops.findIndex((shop) => shop === next);
            if (nextIndex === -1) break;

            current = nextIndex;
            path.push(current);
        }

        return path;
    }

    /**
     * Find nearest shops to a given coordinate
     */
    findNearestShops(userLat, userLng, limit = 5) {
        const userLocation = [userLng, userLat]; // Note: Turf expects [lng, lat]

        const shopsWithDistance = this.shops.map((shop) => {
            const shopLocation = [shop.longitude, shop.latitude];
            const dist = distance(userLocation, shopLocation, {
                units: 'kilometers',
            });

            return {
                ...shop,
                distanceFromUser: dist,
            };
        });

        // Sort by distance and return top results
        return shopsWithDistance
            .sort((a, b) => a.distanceFromUser - b.distanceFromUser)
            .slice(0, limit);
    }

    /**
     * Calculate estimated travel time based on distance
     * Assumes average speed of 25 km/h in city traffic
     */
    calculateEstimatedTime(distanceKm) {
        const averageSpeedKmh = 25;
        const timeHours = distanceKm / averageSpeedKmh;
        const timeMinutes = Math.round(timeHours * 60);

        return {
            hours: Math.floor(timeMinutes / 60),
            minutes: timeMinutes % 60,
            totalMinutes: timeMinutes,
        };
    }

    /**
     * Get optimal tour visiting multiple shops (simplified TSP)
     * Using nearest neighbor heuristic starting from user location
     */
    getOptimalTour(userLat, userLng, shopIds) {
        if (shopIds.length === 0) return { tour: [], totalDistance: 0 };

        const selectedShops = this.shops.filter((shop) =>
            shopIds.includes(shop.id),
        );
        if (selectedShops.length !== shopIds.length) {
            throw new Error('Some shop IDs not found');
        }

        // Find nearest shop to start from
        const nearestShops = this.findNearestShops(
            userLat,
            userLng,
            selectedShops.length,
        );
        const startShop = nearestShops.find((shop) =>
            shopIds.includes(shop.id),
        );

        const unvisited = selectedShops.filter(
            (shop) => shop.id !== startShop.id,
        );
        const tour = [startShop];
        let currentShop = startShop;
        let totalDistance = startShop.distanceFromUser;

        // Nearest neighbor algorithm using Floyd-Warshall distances
        while (unvisited.length > 0) {
            let nearestShop = null;
            let minDistance = Infinity;

            for (const shop of unvisited) {
                const currentIndex = this.shops.findIndex(
                    (s) => s.id === currentShop.id,
                );
                const shopIndex = this.shops.findIndex((s) => s.id === shop.id);

                if (currentIndex !== -1 && shopIndex !== -1) {
                    const pathDistance =
                        this.optimizedDistances[currentIndex][shopIndex];
                    if (pathDistance < minDistance) {
                        minDistance = pathDistance;
                        nearestShop = shop;
                    }
                }
            }

            if (nearestShop) {
                tour.push(nearestShop);
                totalDistance += minDistance;
                currentShop = nearestShop;
                unvisited.splice(unvisited.indexOf(nearestShop), 1);
            } else {
                break;
            }
        }

        return {
            tour,
            totalDistance,
            estimatedTime: this.calculateEstimatedTime(totalDistance),
        };
    }
}

/**
 * Utility functions for route optimization
 */
export const RouteUtils = {
    /**
     * Format distance for display
     */
    formatDistance(distanceKm) {
        if (distanceKm < 1) {
            return `${Math.round(distanceKm * 1000)} m`;
        }
        return `${distanceKm.toFixed(1)} km`;
    },

    /**
     * Format time for display
     */
    formatTime(timeObj) {
        if (timeObj.hours > 0) {
            return `${timeObj.hours} jam ${timeObj.minutes} menit`;
        }
        return `${timeObj.minutes} menit`;
    },

    /**
     * Create route coordinates for map display
     */
    createRouteCoordinates(shops) {
        return shops.map((shop) => [shop.latitude, shop.longitude]);
    },
};

export default ShopRouteOptimizer;
