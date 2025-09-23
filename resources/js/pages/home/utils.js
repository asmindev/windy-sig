import { route } from '@/ziggy-config';
import { router } from '@inertiajs/react';

/**
 * Utility functions untuk aplikasi home
 */

/**
 * Handle ketika marker di map diklik
 */
export function createMarkerClickHandler(
    setShopSelected,
    setIsDrawerOpen,
    setIsSheetOpen,
    isMobile,
) {
    // remove url parameters
    // window.history.replaceState(
    //     {},
    //     document.title,
    //     window.location.pathname + window.location.hash,
    // );
    return (shop) => {
        setShopSelected(shop);

        if (isMobile) {
            setIsDrawerOpen(true);
            setIsSheetOpen(false);
        } else {
            setIsSheetOpen(true);
            setIsDrawerOpen(false);
        }
    };
}

/**
 * Handle ketika drawer state berubah
 */
export function createDrawerOpenChangeHandler(
    setIsDrawerOpen,
    setShopSelected,
) {
    return (open) => {
        setIsDrawerOpen(open);
        if (!open) {
            setShopSelected(null);
        }
    };
}

/**
 * Handle ketika sheet state berubah
 */
export function createSheetOpenChangeHandler(setIsSheetOpen, setShopSelected) {
    return (open) => {
        setIsSheetOpen(open);
        if (!open) {
            setShopSelected(null);
        }
    };
}

/**
 * Handle ketika route info panel ditutup
 */
export function createRouteInfoCloseHandler(
    setShowRouteInfo,
    setRouteData,
    searchValue,
) {
    return () => {
        setShowRouteInfo(false);
        setRouteData(null);
        // Clear URL parameters
        router.visit(route('home'), {
            data: { search: searchValue },
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };
}
