import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { useRouteCalculation } from './hooks';

export default function Detail({ shop, onOpenChange, onShowRoute }) {
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

    const handleGetRoute = async () => {
        try {
            await calculateRoute({
                shopId: shop.id,
                shopLat: parseFloat(shop.latitude),
                shopLng: parseFloat(shop.longitude),
                isAutomatic: false,
                onSuccess: (result) => {
                    // Set route info untuk ditampilkan di dalam detail panel
                    setRouteInfo(result.routeInfo);

                    // Update URL
                    const searchParams = new URLSearchParams();
                    searchParams.set('active', shop.id.toString());
                    searchParams.set(
                        'to',
                        `${shop.latitude},${shop.longitude}`,
                    );
                    const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
                    router.visit(newUrl, { preserveState: true });
                },
            });
        } catch (err) {
            // Error already handled by calculateRoute
            console.error('Route calculation failed:', err);
        }
    };

    const handleHideRoute = () => {
        setRouteInfo(null);
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
                                </div>

                                <Button
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
                        <h3 className="text-md px-4 pt-4 font-semibold text-gray-900">
                            Produk
                        </h3>
                        <div className="grid max-h-96 grid-cols-2 gap-2 overflow-y-auto px-4 pt-2">
                            {shop.products && shop.products.length > 0 ? (
                                shop.products.map((product) => (
                                    <Card key={product.id}>
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

            <div className="grid grid-cols-2 gap-2 p-4">
                {!routeInfo ? (
                    <Button
                        variant={'outline'}
                        className={'mb-2 w-full'}
                        onClick={handleGetRoute}
                        disabled={isCalculating}
                    >
                        {isCalculating ? 'Mendapatkan Rute...' : 'Rute'}
                    </Button>
                ) : (
                    <Button
                        variant={'outline'}
                        className={'mb-2 w-full'}
                        onClick={handleHideRoute}
                    >
                        Sembunyikan Rute
                    </Button>
                )}

                {/* Close Button */}
                <Button
                    className={'w-full'}
                    onClick={() => {
                        handleHideRoute(); // Reset route info saat tutup
                        onOpenChange(false);
                    }}
                >
                    Tutup
                </Button>
            </div>
        </div>
    );
}
