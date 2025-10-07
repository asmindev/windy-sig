import { RouteSelector } from '@/components/RouteSelector';
import { useFlashToast } from '@/hooks/useFlashToast';
import { useState } from 'react';
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

export default function Page({ shops, search, activeShop, routingData }) {
    // Flash toast for Laravel flash messages
    useFlashToast();

    // Manual location state - untuk menyimpan lokasi yang dipilih dari peta
    const [manualLocation, setManualLocation] = useState(null);

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

    // Handler untuk route found - optional, bisa dikosongkan jika tidak diperlukan
    const handleRouteFound = (route) => {
        // Bisa digunakan untuk handle ketika route ditemukan
        // Misalnya untuk update state atau analytics
    };

    return (
        <>
            <div className="relative flex h-screen w-full flex-col">
                {/* Search Bar */}
                <SearchBar
                    searchValue={searchValue}
                    onSearchChange={handleSearchChange}
                    onSearchSubmit={handleSearchSubmit}
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
                    shops={shops}
                    routeData={routeData}
                    onMarkerClick={handleMarkerClick}
                    onRouteFound={handleRouteFound}
                    onMapClick={handleMapClick}
                    manualLocation={manualLocation}
                    alternativeRoutes={alternativeRoutes}
                    selectedRouteId={selectedRouteId}
                />
            </div>
        </>
    );
}
