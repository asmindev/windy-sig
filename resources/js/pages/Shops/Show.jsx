import MapWrapper from '@/components/map/MapWrapper';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import UserLayout from '@/layouts/UserLayout';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Clock, MapPin, Package, Phone } from 'lucide-react';

export default function ShopShow({ shop }) {
    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const handleGetRoute = () => {
        // Create URL with active shop and destination coordinates
        const searchParams = new URLSearchParams();
        searchParams.set('active', shop.id.toString());
        searchParams.set('to', `${shop.latitude},${shop.longitude}`);

        // Generate home URL with route parameters
        const homeUrl = `/?${searchParams.toString()}`;

        // Navigate to home page - home/index akan handle auto-routing
        window.location.href = homeUrl;
    };

    return (
        <UserLayout>
            <div className="py-8">
                <div className="w-full px-4 sm:px-6 lg:px-8">
                    {/* Back button */}
                    <div className="mb-6">
                        <Button asChild variant="outline" size="sm">
                            <Link
                                href="/shops"
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Kembali ke Daftar Toko
                            </Link>
                        </Button>
                    </div>

                    {/* Shop Header */}
                    <div className="mb-8">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-2xl">
                                    {shop.name}
                                </CardTitle>
                                <CardDescription className="flex items-start gap-2 text-base">
                                    <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                                    {shop.address}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    {shop.operating_hours && (
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Clock className="h-5 w-5" />
                                            <div>
                                                <p className="font-medium">
                                                    Jam Operasional
                                                </p>
                                                <p className="text-sm">
                                                    {shop.operating_hours}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {shop.phone && (
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Phone className="h-5 w-5" />
                                            <div>
                                                <p className="font-medium">
                                                    Kontak
                                                </p>
                                                <p className="text-sm">
                                                    {shop.phone}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Package className="h-5 w-5" />
                                        <div>
                                            <p className="font-medium">
                                                Produk
                                            </p>
                                            <p className="text-sm">
                                                {shop.products.length} item
                                                tersedia
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {shop.description && (
                                    <>
                                        <Separator className="my-4" />
                                        <div>
                                            <h3 className="mb-2 font-medium">
                                                Deskripsi
                                            </h3>
                                            <p className="text-gray-600">
                                                {shop.description}
                                            </p>
                                        </div>
                                    </>
                                )}

                                <div className="mt-6 flex gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={handleGetRoute}
                                    >
                                        Dapatkan Rute
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Products */}
                    <div>
                        <h2 className="mb-6 text-xl font-bold">
                            Produk yang Tersedia
                        </h2>

                        {shop.products.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {shop.products.map((product) => (
                                    <Card key={product.id}>
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <CardTitle className="text-lg">
                                                    {product.name}
                                                </CardTitle>
                                                <Badge variant="secondary">
                                                    {product.type}
                                                </Badge>
                                            </div>
                                            <CardDescription className="text-lg font-semibold text-green-600">
                                                {formatPrice(product.price)}
                                            </CardDescription>
                                        </CardHeader>
                                        {product.description && (
                                            <CardContent className="pt-0">
                                                <p className="text-sm text-gray-600">
                                                    {product.description}
                                                </p>
                                            </CardContent>
                                        )}
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card>
                                <CardContent className="py-8 text-center">
                                    <Package className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Belum ada produk
                                    </h3>
                                    <p className="text-gray-600">
                                        Produk akan segera ditambahkan
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Map */}
                    <div className="mt-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Lokasi Toko</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <MapWrapper
                                    shops={[shop]}
                                    center={[shop.latitude, shop.longitude]}
                                    zoom={16}
                                    className="h-64 w-full rounded-lg"
                                />
                                <div className="mt-3 text-sm text-gray-600">
                                    Koordinat: {shop.latitude}, {shop.longitude}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </UserLayout>
    );
}
