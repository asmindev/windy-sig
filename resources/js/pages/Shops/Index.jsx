import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useGeolocation } from '@/hooks/use-geolocation';
import UserLayout from '@/layouts/UserLayout';
import { Link, router, usePage } from '@inertiajs/react';
import { Clock, MapPin, Search, Star } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function ShopsIndex({ shops, categories, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(
        filters.category || '',
    );
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const { url } = usePage();
    const { getCurrentPosition, hasPosition, position } = useGeolocation();

    const handleSearch = (e) => {
        e.preventDefault();
        const params = { search };
        if (selectedCategory) {
            params.category = selectedCategory;
        }
        router.get(url, params, { preserveState: true, replace: true });
    };

    const handleCategoryChange = (categoryId) => {
        setSelectedCategory(categoryId);
        const params = {};
        if (search) {
            params.search = search;
        }
        if (categoryId) {
            params.category = categoryId;
        }
        router.get(url, params, { preserveState: true, replace: true });
    };

    const handleGetNearestShops = async () => {
        setIsGettingLocation(true);

        try {
            // Show loading notification
            toast.loading('Mendapatkan lokasi Anda...', {
                id: 'location-loading',
            });

            // Get user's current location
            let userPosition = position;

            if (!hasPosition) {
                userPosition = await getCurrentPosition();
            }

            if (!userPosition) {
                throw new Error(
                    'Tidak dapat mengakses lokasi Anda. Pastikan izin lokasi telah diberikan.',
                );
            }

            // Show success notification
            toast.success('Mencari toko terdekat...', {
                id: 'location-loading',
                duration: 1000,
            });

            // Redirect to shops with location parameters
            const params = {
                latitude: userPosition.latitude,
                longitude: userPosition.longitude,
                radius: 10, // Default radius 10km
                sort: 'distance', // Sort by distance
            };

            // Keep existing search and category if any
            if (search) {
                params.search = search;
            }
            if (selectedCategory) {
                params.category = selectedCategory;
            }

            router.get('/shops', params, {
                preserveState: false,
                replace: true,
            });
        } catch (err) {
            console.error('Error getting location:', err);

            // Show error notification
            toast.error('Gagal mendapatkan lokasi', {
                id: 'location-loading',
                description: err.message || 'Silakan coba lagi nanti.',
                duration: 4000,
            });
        } finally {
            setIsGettingLocation(false);
        }
    };

    return (
        <UserLayout>
            <div className="py-8">
                <div className="mx-auto max-w-7xl overflow-hidden px-4 sm:px-6 lg:px-8">
                    <div className="mb-8 rounded-2xl bg-gradient-to-b from-primary via-primary/80 to-transparent p-6 text-center">
                        <h1 className="text-3xl font-bold text-white">
                            Toko Oleh-Oleh di Kendari
                        </h1>
                        <p className="mt-2 text-white">
                            Temukan berbagai toko oleh-oleh dan souvenir khas
                            Kendari
                        </p>
                    </div>

                    {/* Search and Filter */}
                    <div className="mb-8 space-y-4">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Cari toko berdasarkan nama atau alamat..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Button type="submit">Cari</Button>
                        </form>
                        <div className="flex items-center justify-between">
                            {/* Category Filter */}
                            <div className="flex items-center gap-2">
                                <Select
                                    value={selectedCategory}
                                    onValueChange={handleCategoryChange}
                                >
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="Semua Kategori" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem>Semua Kategori</SelectItem>
                                        {categories.map((category) => (
                                            <SelectItem
                                                key={category.id}
                                                value={category.id.toString()}
                                            >
                                                {category.name} (
                                                {category.products_count})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex items-center gap-2"
                                    onClick={handleGetNearestShops}
                                    disabled={isGettingLocation}
                                >
                                    <MapPin className="h-4 w-4" />
                                    {isGettingLocation
                                        ? 'Mencari...'
                                        : 'Toko Terdekat'}
                                </Button>
                                {filters.latitude && filters.longitude && (
                                    <>
                                        <Badge variant="secondary">
                                            Menampilkan toko dalam radius{' '}
                                            {filters.radius || 10} km
                                        </Badge>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                router.get(
                                                    '/shops',
                                                    {
                                                        search,
                                                        ...(selectedCategory && {
                                                            category:
                                                                selectedCategory,
                                                        }),
                                                    },
                                                    {
                                                        preserveState: false,
                                                        replace: true,
                                                    },
                                                )
                                            }
                                        >
                                            Tampilkan Semua Toko
                                        </Button>
                                    </>
                                )}
                                {filters.category && (
                                    <Badge variant="outline">
                                        Kategori:{' '}
                                        {
                                            categories.find(
                                                (cat) =>
                                                    cat.id.toString() ===
                                                    filters.category,
                                            )?.name
                                        }
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Results */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {shops.data.map((shop) => (
                            <Card
                                key={shop.id}
                                className="transition-shadow hover:shadow-lg"
                            >
                                <CardHeader>
                                    <CardTitle className="text-lg">
                                        {shop.name}
                                    </CardTitle>
                                    <CardDescription className="flex items-start gap-1">
                                        <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                                        {shop.address}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {shop.operating_hours && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Clock className="h-4 w-4" />
                                                {shop.operating_hours}
                                            </div>
                                        )}

                                        {shop.rating && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                                                <span className="font-semibold text-yellow-600">
                                                    {Number.parseFloat(
                                                        shop.rating,
                                                    ).toFixed(1)}
                                                </span>
                                                <span className="text-muted-foreground">
                                                    / 5.0
                                                </span>
                                            </div>
                                        )}

                                        {shop.distance && (
                                            <Badge
                                                variant="outline"
                                                className="text-xs"
                                            >
                                                {shop.distance.toFixed(1)} km
                                                dari lokasi Anda
                                            </Badge>
                                        )}

                                        {shop.products.length > 0 && (
                                            <div>
                                                <p className="mb-2 text-sm text-muted-foreground">
                                                    {shop.products.length}{' '}
                                                    produk tersedia
                                                </p>
                                                <div className="flex flex-wrap gap-1">
                                                    {shop.products
                                                        .slice(0, 3)
                                                        .map((product) => (
                                                            <Badge
                                                                key={product.id}
                                                                variant="secondary"
                                                                className="text-xs"
                                                            >
                                                                {product.name}
                                                                {product.category && (
                                                                    <span className="ml-1 text-muted-foreground">
                                                                        (
                                                                        {
                                                                            product
                                                                                .category
                                                                                .name
                                                                        }
                                                                        )
                                                                    </span>
                                                                )}
                                                            </Badge>
                                                        ))}
                                                    {shop.products.length >
                                                        3 && (
                                                        <Badge
                                                            variant="secondary"
                                                            className="text-xs"
                                                        >
                                                            +
                                                            {shop.products
                                                                .length -
                                                                3}{' '}
                                                            lainnya
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <Button asChild className="w-full">
                                            <Link href={`/shops/${shop.id}`}>
                                                Lihat Detail
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Pagination */}
                    {shops.links && shops.links.length > 3 && (
                        <div className="mt-8 flex justify-center">
                            <div className="flex gap-2">
                                {shops.links.map((link, index) => (
                                    <Button
                                        key={index}
                                        variant={
                                            link.active ? 'default' : 'outline'
                                        }
                                        size="sm"
                                        disabled={!link.url}
                                        onClick={() =>
                                            link.url && router.visit(link.url)
                                        }
                                    >
                                        <span
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}

                    {shops.data.length === 0 && (
                        <div className="py-12 text-center">
                            <div className="mx-auto h-24 w-24 text-gray-400">
                                <MapPin className="h-full w-full" />
                            </div>
                            <h3 className="mt-4 text-lg font-medium text-foreground">
                                Tidak ada toko ditemukan
                            </h3>
                            <p className="mt-2 text-muted-foreground">
                                {filters.category ? (
                                    <>
                                        Tidak ada toko dengan kategori "
                                        {
                                            categories.find(
                                                (cat) =>
                                                    cat.id.toString() ===
                                                    filters.category,
                                            )?.name
                                        }
                                        "
                                        {filters.search &&
                                            ` dan pencarian "${filters.search}"`}
                                    </>
                                ) : filters.search ? (
                                    `Tidak ada toko yang cocok dengan pencarian "${filters.search}"`
                                ) : (
                                    'Coba ubah kata kunci pencarian atau perluas area pencarian'
                                )}
                            </p>
                            {(filters.category || filters.search) && (
                                <div className="mt-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setSearch('');
                                            setSelectedCategory('');
                                            router.get(
                                                '/shops',
                                                {},
                                                {
                                                    preserveState: false,
                                                    replace: true,
                                                },
                                            );
                                        }}
                                    >
                                        Tampilkan Semua Toko
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </UserLayout>
    );
}
