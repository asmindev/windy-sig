import RouteInfo from '@/components/RouteInfo';
import { useFlashToast } from '@/hooks/useFlashToast';
import DesktopSheet from './DesktopSheet';
import {
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

    return (
        <>
            <div className="relative flex h-screen w-full flex-col">
                {/* Search Bar */}
                <SearchBar
                    searchValue={searchValue}
                    onSearchChange={handleSearchChange}
                    onSearchSubmit={handleSearchSubmit}
                />

                {/* Route Info Panel */}
                {showRouteInfo && routeData && (
                    <RouteInfo
                        routeData={routeData}
                        onClose={handleRouteInfoClose}
                    />
                )}

                {/* Mobile Drawer */}
                <MobileDrawer
                    open={isDrawerOpen}
                    onOpenChange={handleDrawerOpenChange}
                    shop={shopSelected}
                    onShowRoute={handleShowRoute}
                />

                {/* Desktop Sheet */}
                <DesktopSheet
                    open={isSheetOpen}
                    onOpenChange={handleSheetOpenChange}
                    shop={shopSelected}
                    onShowRoute={handleShowRoute}
                />

                {/* Map */}
                <Map
                    shops={shops}
                    routeData={routeData}
                    onMarkerClick={handleMarkerClick}
                    // onRouteFound={handleRouteFound}
                />
            </div>
        </>
    );
}
