import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { useGeolocation } from '@/hooks/use-geolocation';
import axios from 'axios';
import { Navigation } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

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
    const [isCalculating, setIsCalculating] = useState(false);
    const [alternativeRoutes, setAlternativeRoutes] = useState([]);

    const { getCurrentPosition, hasPosition, position } = useGeolocation();

    const handleGetRoute = async () => {
        try {
            setIsCalculating(true);
            toast.loading('Menghitung rute...', { id: 'route-calculation' });

            // Get user position
            let userPosition = null;

            if (manualLocation) {
                userPosition = {
                    latitude: manualLocation.latitude,
                    longitude: manualLocation.longitude,
                };
            } else if (position && position.latitude && position.longitude) {
                userPosition = {
                    latitude: position.latitude,
                    longitude: position.longitude,
                };
            } else {
                try {
                    userPosition = await getCurrentPosition();
                } catch (err) {
                    throw new Error(
                        'Tidak dapat mengakses lokasi Anda. Pastikan izin lokasi telah diberikan.',
                    );
                }
            }

            if (
                !userPosition ||
                !userPosition.latitude ||
                !userPosition.longitude
            ) {
                throw new Error('Lokasi tidak valid');
            }

            // Fetch route from OSRM directly
            const coordinates = `${userPosition.longitude},${userPosition.latitude};${shop.longitude},${shop.latitude}`;
            const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coordinates}`;

            const response = await axios.get(osrmUrl, {
                params: {
                    overview: 'full',
                    geometries: 'geojson',
                    alternatives: 'true',
                    steps: 'true',
                },
            });

            if (
                response.data.code !== 'Ok' ||
                !response.data.routes ||
                response.data.routes.length === 0
            ) {
                throw new Error('Tidak dapat menemukan rute');
            }

            // Process routes
            const routes = response.data.routes.map((route, index) => {
                const distanceKm = (route.distance / 1000).toFixed(2);
                const durationMin = (route.duration / 60).toFixed(1);

                return {
                    id: index + 1,
                    rank: index + 1,
                    data: {
                        type: 'Feature',
                        geometry: route.geometry,
                        properties: {
                            distance: parseFloat(distanceKm),
                            duration: parseFloat(durationMin),
                            summary: `Rute ${index + 1}`,
                            source: 'osrm',
                        },
                        startCoords: {
                            lat: userPosition.latitude,
                            lng: userPosition.longitude,
                        },
                        endCoords: {
                            lat: parseFloat(shop.latitude),
                            lng: parseFloat(shop.longitude),
                        },
                    },
                    distance: parseFloat(distanceKm),
                    duration: parseFloat(durationMin),
                };
            });

            // Set main route (first one)
            const mainRoute = routes[0];
            setRouteInfo({
                distance: mainRoute.distance,
                duration: mainRoute.duration,
            });

            setUserCoords({
                lat: userPosition.latitude,
                lng: userPosition.longitude,
            });

            // Show route on map
            if (onShowRoute && typeof onShowRoute === 'function') {
                onShowRoute({
                    route: mainRoute.data,
                    shop: shop,
                    userPosition: userPosition,
                });
            }

            // Set alternative routes
            if (routes.length > 0) {
                setAlternativeRoutes(routes);
                if (setParentAlternatives) {
                    setParentAlternatives(routes);
                }
            }

            toast.success('Rute berhasil ditemukan!', {
                id: 'route-calculation',
                description: `${mainRoute.distance} km, ${mainRoute.duration} menit`,
            });

            // Update URL
            const searchParams = new URLSearchParams(window.location.search);
            searchParams.delete('active');
            searchParams.set('to', `${shop.latitude},${shop.longitude}`);

            if (manualLocation) {
                searchParams.set(
                    'from',
                    `${manualLocation.latitude},${manualLocation.longitude}`,
                );
            }

            const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
            window.history.replaceState({}, '', newUrl);

            // Close drawer/sheet
            if (onOpenChange) {
                setTimeout(() => {
                    onOpenChange(false);
                }, 100);
            }
        } catch (err) {
            console.error('Error calculating route:', err);
            toast.error('Gagal menghitung rute', {
                id: 'route-calculation',
                description: err.message || 'Silakan coba lagi nanti.',
                duration: 4000,
            });
        } finally {
            setIsCalculating(false);
        }
    };

    const handleSelectAlternativeRoute = (route) => {
        if (!userCoords) return;

        // Update route info
        setRouteInfo({
            distance: route.distance,
            duration: route.duration,
        });

        // Show selected route on map
        if (onShowRoute && typeof onShowRoute === 'function') {
            onShowRoute({
                route: route.data,
                shop: shop,
                userPosition: {
                    latitude: userCoords.lat,
                    longitude: userCoords.lng,
                },
            });
        }

        toast.success('Rute dipilih', {
            description: `${route.distance} km, ${route.duration} menit`,
            duration: 2000,
        });
    };

    const handleHideRoute = () => {
        setRouteInfo(null);
        setUserCoords(null);
        setAlternativeRoutes([]);
        if (setParentAlternatives) {
            setParentAlternatives([]);
        }
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
