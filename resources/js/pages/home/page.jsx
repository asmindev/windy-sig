import { RouteSelector } from '@/components/RouteSelector';
import { useGeolocation } from '@/hooks/use-geolocation';
import { useFlashToast } from '@/hooks/useFlashToast';
import { route } from '@/ziggy-config';
import axios from 'axios';
import { useState } from 'react';
import { toast } from 'sonner';
import DesktopSheet from './DesktopSheet';
import {
    useAlternativeRoutes,
    useAutoRouting,
    useHomeState,
    useRouteManagement,
    useSearch,
} from './hooks';
import Map from './Map';
import MobileDrawer from './MobileDrawer';
import SearchBar from './SearchBar';
import {
    createDrawerOpenChangeHandler,
    createMarkerClickHandler,
    createRouteInfoCloseHandler,
    createSheetOpenChangeHandler,
} from './utils';

export default function Page({
    shops,
    search,
    activeShop,
    routingData,
    categories,
}) {
    // Flash toast for Laravel flash messages
    useFlashToast();

    // Parse selected categories from URL
    const urlParams = new URLSearchParams(window.location.search);
    const categoriesParam = urlParams.get('categories');
    const selectedCategoryIds = categoriesParam
        ? categoriesParam.split(',').map((id) => parseInt(id))
        : [];

    // Manual location state - untuk menyimpan lokasi yang dipilih dari peta
    const [manualLocation, setManualLocation] = useState(null);

    // Nearest shops state
    const [nearestShops, setNearestShops] = useState([]);
    const [isFindingNearest, setIsFindingNearest] = useState(false);

    // Geolocation hook
    const { position: userPosition, hasPosition } = useGeolocation();

    // State management menggunakan custom hooks
    const {
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
    } = useHomeState({ activeShop, search });

    // Route management
    const { handleShowRoute } = useRouteManagement(
        routingData,
        setRouteData,
        setShowRouteInfo,
    );

    // Alternative routes management
    const {
        alternativeRoutes,
        selectedRouteId,
        selectRoute,
        clearAlternativeRoutes,
        setAlternativesDirectly,
    } = useAlternativeRoutes({
        setRouteData,
        setShowRouteInfo,
    });

    // Auto-routing based on URL parameters
    useAutoRouting({
        activeShop,
        setRouteData,
        setShowRouteInfo,
    });

    // Search functionality
    const { handleSearchChange, handleSearchSubmit } = useSearch(
        searchValue,
        setSearchValue,
        search,
    );

    // Event handlers menggunakan utility functions
    const handleMarkerClick = createMarkerClickHandler(
        setShopSelected,
        setIsDrawerOpen,
        setIsSheetOpen,
        isMobile,
    );

    const handleDrawerOpenChange = createDrawerOpenChangeHandler(
        setIsDrawerOpen,
        setShopSelected,
    );

    const handleSheetOpenChange = createSheetOpenChangeHandler(
        setIsSheetOpen,
        setShopSelected,
    );

    const handleRouteInfoClose = createRouteInfoCloseHandler(
        setShowRouteInfo,
        setRouteData,
        searchValue,
    );

    // Handler untuk klik di peta - set sebagai lokasi manual
    const handleMapClick = (lat, lng) => {
        setManualLocation({ latitude: lat, longitude: lng });
    };

    // Handler untuk mencari toko terdekat
    const handleFindNearestShops = async () => {
        // Gunakan koordinat manual jika ada, jika tidak gunakan koordinat user
        const locationToUse =
            manualLocation ||
            (hasPosition && userPosition
                ? {
                      latitude: userPosition.latitude,
                      longitude: userPosition.longitude,
                  }
                : null);

        if (!locationToUse) {
            toast.error('Tidak ada lokasi yang tersedia', {
                description:
                    'Silakan aktifkan lokasi atau pilih lokasi di peta',
            });
            return;
        }

        try {
            setIsFindingNearest(true);

            toast.loading('Mencari toko terdekat...', { id: 'find-nearest' });

            const response = await axios.post(
                route('api.routes.nearest-shops'),
                {
                    latitude: locationToUse.latitude,
                    longitude: locationToUse.longitude,
                    radius: 10, // 10km radius
                    limit: 20, // max 20 shops
                },
            );

            if (response.data.success) {
                const shops = response.data.data;
                setNearestShops(shops);

                toast.success(`Ditemukan ${shops.length} toko terdekat`, {
                    id: 'find-nearest',
                    description: `Dalam radius ${response.data.meta.radius_km} km`,
                    duration: 3000,
                });

                // Clear existing route data when showing nearest shops
                setRouteData(null);
                setShowRouteInfo(false);
                clearAlternativeRoutes();
            } else {
                throw new Error(
                    response.data.message || 'Gagal mencari toko terdekat',
                );
            }
        } catch (error) {
            console.error('Error finding nearest shops:', error);
            toast.error('Gagal mencari toko terdekat', {
                id: 'find-nearest',
                description: error.message || 'Silakan coba lagi nanti.',
                duration: 4000,
            });
            setNearestShops([]);
        } finally {
            setIsFindingNearest(false);
        }
    };

    // Handler untuk route found - optional, bisa dikosongkan jika tidak diperlukan
    const handleRouteFound = (route) => {
        // Bisa digunakan untuk handle ketika route ditemukan
        // Misalnya untuk update state atau analytics
    };

    // Handler untuk clear semua routes dan manual location
    const handleClearRoutes = () => {
        setRouteData(null);
        setShowRouteInfo(false);
        clearAlternativeRoutes();
    };

    const handleClearManualLocation = () => {
        setManualLocation(null);
    };

    return (
        <>
            <div className="relative flex h-screen w-full flex-col">
                {/* Search Bar */}
                <SearchBar
                    searchValue={searchValue}
                    onSearchChange={handleSearchChange}
                    onSearchSubmit={handleSearchSubmit}
                    onFindNearestShops={handleFindNearestShops}
                    userLocation={hasPosition ? userPosition : null}
                    manualLocation={manualLocation}
                    categories={categories}
                    selectedCategories={selectedCategoryIds}
                />

                {/* Route Selector Overlay - tampil di map */}
                {alternativeRoutes.length > 0 && (
                    <RouteSelector
                        routes={alternativeRoutes}
                        selectedRouteId={selectedRouteId}
                        onSelectRoute={(route) => {
                            console.log('Selecting route:', route);
                            console.log('Shop selected:', shopSelected);
                            console.log('Route data:', routeData);

                            // Get coordinates from route data or shopSelected
                            const startLat =
                                route.data?.startCoords?.lat ||
                                route.startCoords?.lat ||
                                routeData?.startCoords?.lat;
                            const startLng =
                                route.data?.startCoords?.lng ||
                                route.startCoords?.lng ||
                                routeData?.startCoords?.lng;
                            const endLat =
                                shopSelected?.latitude ||
                                route.data?.endCoords?.lat ||
                                route.endCoords?.lat;
                            const endLng =
                                shopSelected?.longitude ||
                                route.data?.endCoords?.lng ||
                                route.endCoords?.lng;

                            if (startLat && startLng && endLat && endLng) {
                                selectRoute(
                                    route,
                                    startLat,
                                    startLng,
                                    endLat,
                                    endLng,
                                );
                            } else {
                                console.error('Missing coordinates:', {
                                    startLat,
                                    startLng,
                                    endLat,
                                    endLng,
                                });
                            }
                        }}
                        onClose={() => {
                            clearAlternativeRoutes();
                        }}
                    />
                )}

                {/* Mobile Drawer */}
                <MobileDrawer
                    open={isDrawerOpen}
                    onOpenChange={handleDrawerOpenChange}
                    shop={shopSelected}
                    onShowRoute={handleShowRoute}
                    manualLocation={manualLocation}
                    setAlternativesDirectly={setAlternativesDirectly}
                />

                {/* Desktop Sheet */}
                <DesktopSheet
                    open={isSheetOpen}
                    onOpenChange={handleSheetOpenChange}
                    shop={shopSelected}
                    onShowRoute={handleShowRoute}
                    manualLocation={manualLocation}
                    setAlternativesDirectly={setAlternativesDirectly}
                />

                {/* Map */}
                <Map
                    shops={nearestShops.length > 0 ? nearestShops : shops}
                    routeData={routeData}
                    onMarkerClick={handleMarkerClick}
                    onRouteFound={handleRouteFound}
                    onMapClick={handleMapClick}
                    manualLocation={manualLocation}
                    alternativeRoutes={alternativeRoutes}
                    selectedRouteId={selectedRouteId}
                    showNearestShops={nearestShops.length > 0}
                    onClearRoutes={handleClearRoutes}
                    onClearManualLocation={handleClearManualLocation}
                />
            </div>
        </>
    );
}
