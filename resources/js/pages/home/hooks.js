import { useGeolocation } from '@/hooks/use-geolocation';
import { useIsMobile } from '@/hooks/use-mobile';
import { route } from '@/ziggy-config';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { SEARCH_DEBOUNCE_DELAY } from './constants';

/**
 * Custom hook untuk mengelola state utama aplikasi home
 */
export function useHomeState({ activeShop, search }) {
    const isMobile = useIsMobile();
    const [shopSelected, setShopSelected] = useState(activeShop || null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    // Initialize searchValue with actual search value, not empty string when search is null
    const [searchValue, setSearchValue] = useState(search ?? '');
    const [routeData, setRouteData] = useState(null);
    const [showRouteInfo, setShowRouteInfo] = useState(false);

    // Auto-open drawer/sheet if activeShop is provided
    useEffect(() => {
        if (activeShop) {
            setShopSelected(activeShop);
            if (isMobile) {
                setIsDrawerOpen(true);
                setIsSheetOpen(false);
            } else {
                setIsSheetOpen(true);
                setIsDrawerOpen(false);
            }
        }
    }, [activeShop, isMobile]);

    return {
        isMobile,
        shopSelected,
        setShopSelected,
        isDrawerOpen,
        setIsDrawerOpen,
        isSheetOpen,
        setIsSheetOpen,
        searchValue,
        setSearchValue,
        routeData,
        setRouteData,
        showRouteInfo,
        setShowRouteInfo,
    };
}

/**
 * Custom hook untuk mengelola routing functionality
 */
export function useRouteManagement(
    routingData,
    setRouteData,
    setShowRouteInfo,
) {
    const fetchAndDisplayRoute = useCallback(async () => {
        if (!routingData) return;

        try {
            const response = await axios.get(route('api.routes.osrm-route'), {
                params: {
                    from_lat: routingData.fromLat,
                    from_lng: routingData.fromLng,
                    to_lat: routingData.toLat,
                    to_lng: routingData.toLng,
                },
            });

            if (response.data.success) {
                const routeWithCoords = {
                    ...response.data,
                    startCoords: {
                        lat: routingData.fromLat,
                        lng: routingData.fromLng,
                    },
                    endCoords: {
                        lat: routingData.toLat,
                        lng: routingData.toLng,
                    },
                };

                setRouteData(routeWithCoords);
                setShowRouteInfo(true);
            } else {
                console.error('Error fetching route:', response.data.error);
            }
        } catch (error) {
            console.error('Error fetching route:', error);
        }
    }, [routingData, setRouteData, setShowRouteInfo]);

    // Handle routing data dari server
    useEffect(() => {
        if (routingData && routingData.shouldShowRoute) {
            fetchAndDisplayRoute();
        }
    }, [routingData, fetchAndDisplayRoute]);

    const handleShowRoute = (routeInfo) => {
        console.log('Received route info:', routeInfo);

        // Format route data for the RouteControl component
        const formattedRouteData = {
            ...routeInfo.route,
            startCoords: {
                lat: routeInfo.userPosition.latitude,
                lng: routeInfo.userPosition.longitude,
            },
            endCoords: {
                lat: routeInfo.shop.latitude,
                lng: routeInfo.shop.longitude,
            },
            // Extract geometry from the route data
            geometry: routeInfo.route.geometry,
            // Extract properties for RouteInfo display
            distance: routeInfo.route.properties.distance,
            duration: routeInfo.route.properties.duration,
        };

        console.log('Formatted route data:', formattedRouteData);

        setRouteData(formattedRouteData);
        // Always show route info when route is successfully calculated
        setShowRouteInfo(true);
    };

    return {
        handleShowRoute,
    };
}

/**
 * Custom hook untuk mengelola route calculation dan display
 */
export function useRouteCalculation({ setRouteData, setShowRouteInfo }) {
    const { getCurrentPosition, hasPosition, position } = useGeolocation();
    const [isCalculating, setIsCalculating] = useState(false);

    const calculateRoute = useCallback(
        async ({
            shopId,
            shopLat,
            shopLng,
            isAutomatic = false,
            manualStartLocation = null,
            onSuccess = null,
            onError = null,
        }) => {
            if (isCalculating) {
                console.log(
                    'Route calculation already in progress, skipping...',
                );
                return; // Prevent multiple calls
            }

            try {
                setIsCalculating(true);

                console.log('Starting route calculation...');
                console.log('hasPosition:', hasPosition, 'position:', position);
                console.log('manualStartLocation:', manualStartLocation);
                console.log('shopLat:', shopLat, 'shopLng:', shopLng);

                // Show loading notification only if not automatic
                if (!isAutomatic) {
                    const loadingMessage = isAutomatic
                        ? 'Mendeteksi lokasi dan menghitung rute otomatis...'
                        : 'Mendapatkan lokasi dan menghitung rute...';

                    toast.loading(loadingMessage, {
                        id: 'route-calculation',
                    });
                }

                // Get user's current location or use manual location
                let userPosition = null;

                // Use manual location if provided
                if (
                    manualStartLocation &&
                    manualStartLocation.lat &&
                    manualStartLocation.lng
                ) {
                    userPosition = {
                        latitude: manualStartLocation.lat,
                        longitude: manualStartLocation.lng,
                    };
                    console.log('Using manual start location:', userPosition);
                }
                // Check if we have valid position data from the hook
                else if (position && position.latitude && position.longitude) {
                    // Use existing position from geolocation hook
                    userPosition = {
                        latitude: position.latitude,
                        longitude: position.longitude,
                    };
                } else {
                    try {
                        userPosition = await getCurrentPosition();
                    } catch (err) {
                        console.error('Error getting user position:', err);
                        throw new Error(
                            'Tidak dapat mengakses lokasi Anda. Pastikan izin lokasi telah diberikan.',
                        );
                    }
                }

                // Validate user position
                if (
                    !userPosition ||
                    !userPosition.latitude ||
                    !userPosition.longitude
                ) {
                    throw new Error(
                        'Tidak dapat mengakses lokasi Anda. Pastikan izin lokasi telah diberikan.',
                    );
                }

                // Validate coordinates are valid numbers
                if (
                    isNaN(userPosition.latitude) ||
                    isNaN(userPosition.longitude) ||
                    isNaN(shopLat) ||
                    isNaN(shopLng)
                ) {
                    throw new Error(
                        'Koordinat tidak valid. Silakan coba lagi.',
                    );
                }

                console.log('Valid user position obtained:', userPosition);

                // Prepare request body
                const requestBody = {
                    user_latitude: userPosition.latitude,
                    user_longitude: userPosition.longitude,
                    shop_latitude: shopLat,
                    shop_longitude: shopLng,
                };

                console.log('Sending route request:', requestBody);

                // Call backend API to get route
                const response = await fetch(route('api.routes.get-route'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                    },
                    body: JSON.stringify(requestBody),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Route API error:', errorData);
                    throw new Error(
                        errorData.message ||
                            'Gagal mendapatkan informasi rute dari server',
                    );
                }

                const routeData = await response.json();

                if (!routeData.success) {
                    throw new Error(
                        routeData.message || 'Gagal menghitung rute',
                    );
                }

                console.log('Route API response:', routeData);

                // Extract main route and alternatives from new response structure
                const mainRoute = routeData.data.main;
                const alternatives = routeData.data.alternatives || [];

                // Format main route data for display
                const formattedRouteData = {
                    ...mainRoute,
                    startCoords: {
                        lat: userPosition.latitude,
                        lng: userPosition.longitude,
                    },
                    endCoords: {
                        lat: shopLat,
                        lng: shopLng,
                    },
                    geometry: mainRoute.geometry,
                    distance: mainRoute.properties.distance,
                    duration: mainRoute.properties.duration,
                };

                // Set main route data
                setRouteData(formattedRouteData);
                setShowRouteInfo(true);

                // Dismiss loading toast
                if (!isAutomatic) {
                    toast.dismiss('route-calculation');
                    toast.success('Rute berhasil ditemukan!', {
                        description: `${mainRoute.properties.distance} km, ${mainRoute.properties.duration} menit`,
                    });
                }

                // Prepare result with alternatives
                const result = {
                    routeInfo: {
                        distance: mainRoute.properties.distance,
                        duration: mainRoute.properties.duration,
                    },
                    userPosition,
                    mainRoute: formattedRouteData,
                    alternatives: [
                        // Include main route as first option
                        {
                            id: mainRoute.id || 1,
                            rank: mainRoute.rank || 1,
                            data: formattedRouteData,
                            osrm_distance:
                                mainRoute.osrm_distance ||
                                mainRoute.properties.distance,
                            floyd_score:
                                mainRoute.floyd_score ||
                                mainRoute.properties.distance,
                            score:
                                mainRoute.score ||
                                mainRoute.properties.distance,
                        },
                        // Then add alternatives
                        ...alternatives.map((alt) => ({
                            id: alt.id,
                            rank: alt.rank,
                            data: {
                                ...alt,
                                startCoords: {
                                    lat: userPosition.latitude,
                                    lng: userPosition.longitude,
                                },
                                endCoords: {
                                    lat: shopLat,
                                    lng: shopLng,
                                },
                                geometry: alt.geometry,
                                distance: alt.properties.distance,
                                duration: alt.properties.duration,
                            },
                            osrm_distance: alt.osrm_distance,
                            floyd_score: alt.floyd_score,
                            score: alt.score,
                        })),
                    ],
                };

                console.log('Formatted result with alternatives:', result);

                // Call success callback with alternatives
                if (onSuccess) {
                    await onSuccess(result);
                }

                return result;
            } catch (err) {
                console.error('Error calculating route:', err);

                // Show error notification only if not automatic
                if (!isAutomatic) {
                    const errorMessage = isAutomatic
                        ? 'Gagal membuat rute otomatis'
                        : 'Gagal mendapatkan rute';

                    toast.error(errorMessage, {
                        id: 'route-calculation',
                        description: err.message || 'Silakan coba lagi nanti.',
                        duration: 4000,
                    });
                }

                // Call error callback
                if (onError && typeof onError === 'function') {
                    onError(err);
                }

                throw err;
            } finally {
                setIsCalculating(false);
            }
        },
        [
            getCurrentPosition,
            hasPosition,
            position,
            setRouteData,
            setShowRouteInfo,
            isCalculating,
        ],
    );

    return {
        calculateRoute,
        isCalculating,
    };
}

/**
 * Custom hook untuk menghitung rute alternatif
 */
export function useAlternativeRoutes({ setRouteData, setShowRouteInfo }) {
    const [alternativeRoutes, setAlternativeRoutes] = useState([]);
    const [selectedRouteId, setSelectedRouteId] = useState(null);
    const [isLoadingAlternatives, setIsLoadingAlternatives] = useState(false);

    // New method to set alternatives directly (from main route response)
    const setAlternativesDirectly = useCallback((alternatives) => {
        setAlternativeRoutes(alternatives);
        // Auto-select first route if available
        if (alternatives.length > 0) {
            setSelectedRouteId(alternatives[0].id);
        }
    }, []);

    const fetchAlternativeRoutes = useCallback(
        async ({ userLat, userLng, shopLat, shopLng }) => {
            try {
                setIsLoadingAlternatives(true);

                toast.loading('Mencari rute alternatif...', {
                    id: 'alternative-routes',
                });

                const requestBody = {
                    user_latitude: userLat,
                    user_longitude: userLng,
                    shop_latitude: shopLat,
                    shop_longitude: shopLng,
                };

                const response = await fetch(
                    route('api.routes.alternative-routes'),
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN':
                                document
                                    .querySelector('meta[name="csrf-token"]')
                                    ?.getAttribute('content') || '',
                        },
                        body: JSON.stringify(requestBody),
                    },
                );

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(
                        errorData.message ||
                            'Gagal mendapatkan rute alternatif',
                    );
                }

                const data = await response.json();

                if (!data.success || !data.data || data.data.length === 0) {
                    throw new Error('Tidak ada rute alternatif yang tersedia');
                }

                setAlternativeRoutes(data.data);

                // Auto-select recommended route (first one)
                if (data.data.length > 0) {
                    const recommendedRoute = data.data[0];
                    setSelectedRouteId(recommendedRoute.id);

                    // Display the recommended route
                    const formattedRouteData = {
                        ...recommendedRoute.data,
                        startCoords: { lat: userLat, lng: userLng },
                        endCoords: { lat: shopLat, lng: shopLng },
                        geometry: recommendedRoute.data.geometry,
                        distance: recommendedRoute.data.properties.distance,
                        duration: recommendedRoute.data.properties.duration,
                    };

                    setRouteData(formattedRouteData);
                    setShowRouteInfo(true);
                }

                toast.success(`${data.data.length} rute ditemukan`, {
                    id: 'alternative-routes',
                    description: 'Pilih rute yang Anda inginkan',
                    duration: 3000,
                });

                return data.data;
            } catch (err) {
                console.error('Error fetching alternative routes:', err);
                toast.error('Gagal mendapatkan rute alternatif', {
                    id: 'alternative-routes',
                    description: err.message || 'Silakan coba lagi nanti.',
                    duration: 4000,
                });
                setAlternativeRoutes([]);
                throw err;
            } finally {
                setIsLoadingAlternatives(false);
            }
        },
        [setRouteData, setShowRouteInfo],
    );

    const selectRoute = useCallback(
        (route, userLat, userLng, shopLat, shopLng) => {
            setSelectedRouteId(route.id);

            // Format and display the selected route
            const formattedRouteData = {
                ...route.data,
                startCoords: { lat: userLat, lng: userLng },
                endCoords: { lat: shopLat, lng: shopLng },
                geometry: route.data.geometry,
                distance: route.data.properties.distance,
                duration: route.data.properties.duration,
            };

            setRouteData(formattedRouteData);
            setShowRouteInfo(true);

            toast.success(`Rute dipilih: ${route.name}`, {
                description: `Jarak: ${route.data.properties.distance} km, Waktu: ~${Math.round(route.data.properties.duration)} menit`,
                duration: 3000,
            });
        },
        [setRouteData, setShowRouteInfo],
    );

    const clearAlternativeRoutes = useCallback(() => {
        setAlternativeRoutes([]);
        setSelectedRouteId(null);
    }, []);

    return {
        alternativeRoutes,
        selectedRouteId,
        isLoadingAlternatives,
        fetchAlternativeRoutes,
        selectRoute,
        clearAlternativeRoutes,
        setAlternativesDirectly, // Export the new method
    };
}

/**
 * Custom hook untuk auto-routing berdasarkan URL parameters
 */
export function useAutoRouting({ activeShop, setRouteData, setShowRouteInfo }) {
    const [hasAttemptedAutoRoute, setHasAttemptedAutoRoute] = useState(false);
    const [autoRouteFailed, setAutoRouteFailed] = useState(false);
    const { calculateRoute, isCalculating } = useRouteCalculation({
        setRouteData,
        setShowRouteInfo,
    });

    const handleAutoRoute = useCallback(async () => {
        // Prevent multiple attempts or retry after failure
        if (hasAttemptedAutoRoute || isCalculating || autoRouteFailed) {
            console.log(
                'Auto route skipped - already attempted, calculating, or previously failed',
            );
            return;
        }

        // Parse URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const toParam = urlParams.get('to');
        const fromParam = urlParams.get('from');

        // Only proceed if we have 'to' parameter and active shop
        if (!toParam || !activeShop) {
            console.log('Auto route skipped - missing toParam or activeShop');
            return;
        }

        // Mark as attempted to prevent infinite loops
        setHasAttemptedAutoRoute(true);

        try {
            console.log(
                'Starting auto route for shop:',
                activeShop.id,
                'to:',
                toParam,
            );

            // Parse destination coordinates from URL
            const toCoords = toParam.split(',');
            if (toCoords.length !== 2) {
                throw new Error('Format koordinat tujuan tidak valid');
            }

            const shopLat = parseFloat(toCoords[0]);
            const shopLng = parseFloat(toCoords[1]);

            if (isNaN(shopLat) || isNaN(shopLng)) {
                throw new Error('Koordinat tujuan tidak valid');
            }

            console.log(
                'Parsed coordinates - shopLat:',
                shopLat,
                'shopLng:',
                shopLng,
            );

            // Show toast notification for location information from URL
            let toastMessage = `Menampilkan lokasi: ${activeShop.name}`;
            let toastDescription = `Koordinat tujuan: ${shopLat.toFixed(6)}, ${shopLng.toFixed(6)}`;

            // If there's also a 'from' parameter, show that info too
            if (fromParam) {
                const fromCoords = fromParam.split(',');
                if (fromCoords.length === 2) {
                    const fromLat = parseFloat(fromCoords[0]);
                    const fromLng = parseFloat(fromCoords[1]);
                    if (!isNaN(fromLat) && !isNaN(fromLng)) {
                        toastDescription += `\nTitik awal: ${fromLat.toFixed(6)}, ${fromLng.toFixed(6)}`;
                    }
                }
            }

            toast.info(toastMessage, {
                description: toastDescription,
                duration: 4000,
            });

            // Use the universal calculateRoute function
            await calculateRoute({
                shopId: activeShop.id,
                shopLat: shopLat,
                shopLng: shopLng,
                isAutomatic: true,
            });
        } catch (err) {
            console.error('Error in auto routing:', err);
            // Mark as failed to prevent further attempts
            setAutoRouteFailed(true);
            // Don't reset hasAttemptedAutoRoute to prevent infinite loops
        }
    }, [
        activeShop,
        calculateRoute,
        hasAttemptedAutoRoute,
        isCalculating,
        autoRouteFailed,
    ]);

    // Auto-trigger when component mounts and conditions are met
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const toParam = urlParams.get('to');
        const fromParam = urlParams.get('from');

        // Only auto-route if:
        // 1. We have 'to' parameter
        // 2. No 'from' parameter (meaning user hasn't manually set route)
        // 3. We have an active shop
        // 4. We haven't already attempted auto-routing
        // 5. Not currently calculating
        // 6. Auto-routing hasn't failed before
        if (
            toParam &&
            !fromParam &&
            activeShop &&
            !hasAttemptedAutoRoute &&
            !isCalculating &&
            !autoRouteFailed
        ) {
            // Add longer delay to ensure geolocation has time to get user position
            const timer = setTimeout(() => {
                handleAutoRoute();
            }, 3000); // Increased from 1500ms to 3000ms

            return () => clearTimeout(timer);
        }
    }, [
        activeShop,
        handleAutoRoute,
        hasAttemptedAutoRoute,
        isCalculating,
        autoRouteFailed,
    ]);

    // Reset flags when URL changes (new shop)
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const activeParam = urlParams.get('active');

        if (
            activeParam &&
            activeShop &&
            activeParam !== activeShop.id.toString()
        ) {
            setHasAttemptedAutoRoute(false);
            setAutoRouteFailed(false);
        }
    }, [activeShop]);

    return {
        isAutoRouting: isCalculating,
        handleAutoRoute,
        hasAttemptedAutoRoute,
        autoRouteFailed,
    };
}

export function useSearch(searchValue, setSearchValue, search) {
    // Debounced search function
    useEffect(() => {
        const timer = setTimeout(() => {
            // Only trigger search if:
            // 1. searchValue is different from search parameter
            // 2. searchValue is not empty OR search parameter exists
            // This prevents unwanted redirects when URL has other parameters like 'active' and 'to'
            if (
                searchValue !== search &&
                (searchValue.trim() !== '' || search !== null)
            ) {
                router.visit(route('home'), {
                    data: { search: searchValue },
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                });
            }
        }, SEARCH_DEBOUNCE_DELAY);

        return () => clearTimeout(timer);
    }, [searchValue, search]);

    const handleSearchChange = (e) => {
        setSearchValue(e.target.value);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Get current URL params to preserve them
        const currentParams = new URLSearchParams(window.location.search);
        const params = { search: searchValue };

        // Preserve active, from, to parameters if they exist
        if (currentParams.has('active')) {
            params.active = currentParams.get('active');
        }
        if (currentParams.has('from')) {
            params.from = currentParams.get('from');
        }
        if (currentParams.has('to')) {
            params.to = currentParams.get('to');
        }

        router.visit(route('home'), {
            data: params,
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    return {
        handleSearchChange,
        handleSearchSubmit,
    };
}
