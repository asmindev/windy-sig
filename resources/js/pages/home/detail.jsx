import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { Navigation } from 'lucide-react';
import { useState } from 'react';
import { useAlternativeRoutes, useRouteCalculation } from './hooks';

export default function Detail({
    shop,
    onOpenChange,
    onShowRoute,
    manualLocation,
    setAlternativesDirectly: setParentAlternatives, // Rename untuk clarity
}) {
    const formatPrice = (product) => {
        const min_price = product.min_price;
        const max_price = product.max_price;

        if (min_price == null && max_price == null) {
            return 'Tidak disebutkan';
        }

        const format_min_price = new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(min_price);
        let format_max_price = '';

        if (max_price) {
            format_max_price = new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
            }).format(max_price);
        }
        return max_price
            ? `${format_min_price} - ${format_max_price}`
            : format_min_price;
    };
    const [routeInfo, setRouteInfo] = useState(null);
    const [userCoords, setUserCoords] = useState(null);

    const { calculateRoute, isCalculating } = useRouteCalculation({
        setRouteData: (data) => {
            // Pass route data to parent component for map display
            if (onShowRoute && typeof onShowRoute === 'function') {
                onShowRoute({
                    route: data,
                    shop: shop,
                    userPosition: data.startCoords
                        ? {
                              latitude: data.startCoords.lat,
                              longitude: data.startCoords.lng,
                          }
                        : null,
                });
            }
        },
        setShowRouteInfo: () => {}, // Not used in detail component
    });

    const {
        alternativeRoutes,
        selectedRouteId,
        isLoadingAlternatives,
        fetchAlternativeRoutes,
        selectRoute,
        clearAlternativeRoutes,
        setAlternativesDirectly, // Get the new method
    } = useAlternativeRoutes({
        setRouteData: (data) => {
            // Pass route data to parent component for map display
            if (onShowRoute && typeof onShowRoute === 'function') {
                onShowRoute({
                    route: data,
                    shop: shop,
                    userPosition: data.startCoords
                        ? {
                              latitude: data.startCoords.lat,
                              longitude: data.startCoords.lng,
                          }
                        : null,
                });
            }
        },
        setShowRouteInfo: () => {},
    });

    const handleGetRoute = async () => {
        try {
            // Gunakan manualLocation jika ada, jika tidak akan fallback ke GPS
            const startLocation = manualLocation
                ? {
                      lat: manualLocation.latitude,
                      lng: manualLocation.longitude,
                  }
                : null;

            await calculateRoute({
                shopId: shop.id,
                shopLat: parseFloat(shop.latitude),
                shopLng: parseFloat(shop.longitude),
                isAutomatic: false,
                manualStartLocation: startLocation,
                onSuccess: async (result) => {
                    // Set route info untuk ditampilkan di dalam detail panel
                    setRouteInfo(result.routeInfo);

                    // Store user coords for alternative routes
                    const coords = {
                        lat: result.userPosition.latitude,
                        lng: result.userPosition.longitude,
                    };
                    setUserCoords(coords);

                    // Set alternative routes directly from result
                    if (result.alternatives && result.alternatives.length > 0) {
                        setAlternativesDirectly(result.alternatives);
                        // Also pass to parent component to show RouteSelector on map
                        if (setParentAlternatives) {
                            setParentAlternatives(result.alternatives);
                        }
                        console.log('Alternatives set:', result.alternatives);
                    }

                    // Update URL without 'active' parameter to prevent re-opening
                    const searchParams = new URLSearchParams(
                        window.location.search,
                    );
                    searchParams.delete('active'); // Remove active to prevent re-open
                    searchParams.set(
                        'to',
                        `${shop.latitude},${shop.longitude}`,
                    );

                    // Add start location to URL if set
                    if (startLocation) {
                        searchParams.set(
                            'from',
                            `${startLocation.lat},${startLocation.lng}`,
                        );
                    }

                    const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
                    window.history.replaceState({}, '', newUrl);

                    // Close the drawer/sheet after URL is updated
                    if (onOpenChange) {
                        setTimeout(() => {
                            onOpenChange(false);
                        }, 100);
                    }
                },
            });
        } catch (err) {
            // Error already handled by calculateRoute
            console.error('Route calculation failed:', err);
        }
    };

    const handleSelectAlternativeRoute = (route) => {
        if (!userCoords) return;

        selectRoute(
            route,
            userCoords.lat,
            userCoords.lng,
            parseFloat(shop.latitude),
            parseFloat(shop.longitude),
        );

        // Update route info
        setRouteInfo({
            distance: route.data.properties.distance,
            duration: route.data.properties.duration,
            userPosition: userCoords,
        });
    };

    const handleHideRoute = () => {
        setRouteInfo(null);
        setUserCoords(null);
        clearAlternativeRoutes();
        // Bersihkan rute dari peta juga jika ada callback untuk itu
        if (onShowRoute && typeof onShowRoute === 'function') {
            onShowRoute(null);
        }
    };

    return (
        <div className="flex h-full flex-col justify-between">
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
                <h2 className="text-lg font-semibold text-gray-900">
                    {shop.name}
                </h2>
            </div>
            <div className="max-h-[40vh] overflow-y-auto border-gray-200 py-4 sm:max-h-full">
                {/* Header */}
                <div>
                    <div className="p-4">
                        <p className="mb-2 text-sm text-gray-600">
                            {shop.description}
                        </p>
                        <table>
                            <tbody>
                                <tr>
                                    <td className="pr-2 align-top text-sm font-medium text-gray-900">
                                        Alamat
                                    </td>
                                    <td>:</td>
                                    <td className="text-sm text-gray-600">
                                        {shop.address}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="pr-2 align-top text-sm font-medium text-gray-900">
                                        Telepon
                                    </td>
                                    <td>:</td>
                                    <td className="text-sm text-gray-600">
                                        {shop.phone}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="pr-2 align-top text-sm font-medium text-gray-900">
                                        Jam Operasional
                                    </td>
                                    <td>:</td>
                                    <td className="text-sm text-gray-600">
                                        {shop.operating_hours}
                                    </td>
                                </tr>
                                {shop.rating && (
                                    <tr>
                                        <td className="pr-2 align-top text-sm font-medium text-gray-900">
                                            Rating
                                        </td>
                                        <td>:</td>
                                        <td className="text-sm">
                                            <span className="font-semibold text-yellow-600">
                                                ⭐{' '}
                                                {Number.parseFloat(
                                                    shop.rating,
                                                ).toFixed(1)}
                                            </span>
                                            <span className="text-gray-600">
                                                {' '}
                                                / 5.0
                                            </span>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Route Info Section */}
                    {routeInfo && (
                        <div className="border-t border-gray-200 pt-4">
                            <h3 className="text-md mb-3 px-4 font-semibold text-gray-900">
                                Informasi Rute
                            </h3>
                            <div className="space-y-3 px-4">
                                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                                    <div className="mb-2 flex items-center justify-between">
                                        <span className="text-sm font-medium text-blue-900">
                                            Jarak Tempuh
                                        </span>
                                        <span className="text-lg font-bold text-blue-700">
                                            {routeInfo.distance} km
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-blue-900">
                                            Estimasi Waktu
                                        </span>
                                        <span className="text-lg font-bold text-blue-700">
                                            {routeInfo.duration} menit
                                        </span>
                                    </div>
                                </div>

                                <div className="text-center text-xs text-gray-500">
                                    Rute ditampilkan di peta
                                    {alternativeRoutes.length > 1 && (
                                        <span className="mt-1 block font-medium text-blue-600">
                                            Pilih rute alternatif di panel peta
                                        </span>
                                    )}
                                </div>

                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    onClick={handleHideRoute}
                                >
                                    Sembunyikan Rute
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* product list */}
                    <div>
                        {/* Top Products Section */}
                        {shop.products &&
                            shop.products.some(
                                (product) => product.top_product,
                            ) && (
                                <div className="mb-4">
                                    <h3 className="text-md mb-2 px-4 pt-4 font-semibold text-gray-900">
                                        🌟 Produk Unggulan
                                    </h3>
                                    <div className="grid max-h-64 grid-cols-2 gap-2 overflow-y-auto px-4">
                                        {shop.products
                                            .filter(
                                                (product) =>
                                                    product.top_product,
                                            )
                                            .map((product) => (
                                                <Card
                                                    key={product.id}
                                                    className="border-yellow-300 bg-yellow-50 p-0"
                                                >
                                                    <CardHeader className="p-2">
                                                        <div className="mb-1 flex items-center gap-1">
                                                            <span className="text-xs font-bold text-yellow-600">
                                                                ⭐ TOP
                                                            </span>
                                                        </div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {product.name}
                                                        </div>
                                                        <div className="text-xs text-gray-600">
                                                            {product.type}
                                                        </div>
                                                        <div className="mt-1 text-sm font-semibold text-gray-900">
                                                            {formatPrice(
                                                                product,
                                                            )}
                                                        </div>
                                                    </CardHeader>
                                                </Card>
                                            ))}
                                    </div>
                                </div>
                            )}

                        {/* Regular Products Section */}
                        <h3 className="text-md px-4 pt-4 font-semibold text-gray-900">
                            {shop.products &&
                            shop.products.some((product) => product.top_product)
                                ? 'Produk Lainnya'
                                : 'Produk'}
                        </h3>
                        <div className="grid max-h-96 grid-cols-2 gap-2 overflow-y-auto px-4 pt-2">
                            {shop.products && shop.products.length > 0 ? (
                                shop.products
                                    .filter((product) => !product.top_product)
                                    .map((product) => (
                                        <Card
                                            key={product.id}
                                            className={'p-0'}
                                        >
                                            <CardHeader className="p-2">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {product.name}
                                                </div>
                                                <div className="text-xs text-gray-600">
                                                    {product.type}
                                                </div>
                                                <div className="mt-1 text-sm font-semibold text-gray-900">
                                                    {formatPrice(product)}
                                                </div>
                                            </CardHeader>
                                        </Card>
                                    ))
                            ) : (
                                <p className="col-span-2 text-sm text-gray-600">
                                    Tidak ada produk tersedia
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-2 p-4">
                {/* Location Info - show if manual location is set */}
                {manualLocation && (
                    <div className="rounded-lg bg-blue-50 p-2 text-xs">
                        <div className="flex items-center gap-1 text-blue-900">
                            <Navigation className="h-3 w-3" />
                            <span className="font-medium">
                                Lokasi awal dipilih dari peta
                            </span>
                        </div>
                        <p className="mt-1 text-blue-700">
                            {manualLocation.latitude.toFixed(6)},{' '}
                            {manualLocation.longitude.toFixed(6)}
                        </p>
                        <p className="mt-1 text-xs text-blue-600">
                            Klik di peta untuk mengubah lokasi awal
                        </p>
                    </div>
                )}

                {/* Route Buttons */}
                <div className="grid grid-cols-2 gap-2">
                    {!routeInfo ? (
                        <Button
                            type="button"
                            variant="outline"
                            className="col-span-2 w-full"
                            onClick={handleGetRoute}
                            disabled={isCalculating}
                        >
                            <Navigation className="mr-2 h-4 w-4" />
                            {isCalculating
                                ? 'Menghitung Rute...'
                                : manualLocation
                                  ? 'Rute dari Lokasi Terpilih'
                                  : 'Rute dari Lokasi Saya'}
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            variant="outline"
                            className="col-span-2 w-full"
                            onClick={handleHideRoute}
                        >
                            Sembunyikan Rute
                        </Button>
                    )}
                </div>

                {/* Close Button */}
                <Button
                    type="button"
                    className="w-full"
                    onClick={() => {
                        handleHideRoute();
                        onOpenChange(false);
                    }}
                >
                    Tutup
                </Button>
            </div>
        </div>
    );
}
