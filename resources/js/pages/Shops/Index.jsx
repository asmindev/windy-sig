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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGeolocation } from '@/hooks/use-geolocation';
import UserLayout from '@/layouts/UserLayout';
import { Link, router, usePage } from '@inertiajs/react';
import { Clock, MapPin, Package, Search, Star, Store, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

export default function ShopsIndex({
    shops,
    products,
    categories,
    filters,
    activeTab,
}) {
    const [search, setSearch] = useState(filters.search || '');
    const [isFocused, setIsFocused] = useState(false);
    const [localSelectedCategories, setLocalSelectedCategories] = useState(
        filters.categories ? filters.categories.split(',').map(Number) : [],
    );
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const { url } = usePage();
    const { getCurrentPosition, hasPosition, position } = useGeolocation();
    const searchRef = useRef(null);

    const currentTab = activeTab || 'products';

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                searchRef.current &&
                !searchRef.current.contains(event.target)
            ) {
                setIsFocused(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        const params = { search, tab: currentTab };
        if (localSelectedCategories.length > 0) {
            params.categories = localSelectedCategories.join(',');
        }
        router.get(url, params, { preserveState: true, replace: true });
    };

    const handleCategoryToggle = (categoryId) => {
        const newSelected = localSelectedCategories.includes(categoryId)
            ? localSelectedCategories.filter((id) => id !== categoryId)
            : [...localSelectedCategories, categoryId];

        setLocalSelectedCategories(newSelected);

        const params = { tab: currentTab };
        if (search) {
            params.search = search;
        }
        if (newSelected.length > 0) {
            params.categories = newSelected.join(',');
        }

        router.get(url, params, { preserveState: true, replace: true });
    };

    const handleClearCategories = () => {
        setLocalSelectedCategories([]);

        const params = { tab: currentTab };
        if (search) {
            params.search = search;
        }

        router.get(url, params, { preserveState: true, replace: true });
    };

    const handleTabChange = (newTab) => {
        const params = { tab: newTab };
        if (search) {
            params.search = search;
        }
        if (localSelectedCategories.length > 0) {
            params.categories = localSelectedCategories.join(',');
        }

        router.get(url, params, { preserveState: true, replace: true });
    };

    const handleGetNearestShops = async () => {
        setIsGettingLocation(true);

        try {
            toast.loading('Mendapatkan lokasi Anda...', {
                id: 'location-loading',
            });

            let userPosition = position;

            if (!hasPosition) {
                userPosition = await getCurrentPosition();
            }

            if (!userPosition) {
                throw new Error(
                    'Tidak dapat mengakses lokasi Anda. Pastikan izin lokasi telah diberikan.',
                );
            }

            toast.success('Mencari toko terdekat...', {
                id: 'location-loading',
                duration: 1000,
            });

            const params = {
                latitude: userPosition.latitude,
                longitude: userPosition.longitude,
                radius: 10,
                sort: 'distance',
                tab: 'shops', // Always go to shops tab for nearest shops
            };

            if (search) {
                params.search = search;
            }
            if (localSelectedCategories.length > 0) {
                params.categories = localSelectedCategories.join(',');
            }

            router.get('/shops', params, {
                preserveState: false,
                replace: true,
            });
        } catch (err) {
            console.error('Error getting location:', err);

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

                    {/* Search Bar with Category Suggestions */}
                    <div className="mb-8">
                        <div ref={searchRef} className="relative">
                            <form
                                onSubmit={handleSearch}
                                className="flex gap-2"
                            >
                                <div className="relative flex-1">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        type="text"
                                        placeholder={`Cari ${currentTab === 'products' ? 'produk' : 'toko'}...`}
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                        onFocus={() => setIsFocused(true)}
                                        className="pl-10"
                                    />
                                </div>
                                <Button type="submit">Cari</Button>
                            </form>

                            {/* Suggestions Dropdown */}
                            {isFocused && (
                                <div className="absolute top-full right-0 left-0 z-50 mt-1 rounded-md border bg-white shadow-lg">
                                    <div className="p-3">
                                        <div className="mb-2">
                                            <div className="mb-2 flex items-center justify-between">
                                                <p className="text-xs font-semibold text-gray-700">
                                                    Filter Kategori
                                                </p>
                                                {localSelectedCategories.length >
                                                    0 && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 px-2 text-xs"
                                                        onClick={
                                                            handleClearCategories
                                                        }
                                                    >
                                                        <X className="mr-1 h-3 w-3" />
                                                        Clear
                                                    </Button>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {categories.map((category) => {
                                                    const isSelected =
                                                        localSelectedCategories.includes(
                                                            category.id,
                                                        );
                                                    return (
                                                        <Badge
                                                            key={category.id}
                                                            variant={
                                                                isSelected
                                                                    ? 'default'
                                                                    : 'outline'
                                                            }
                                                            className="cursor-pointer transition-all hover:shadow-md"
                                                            onClick={() =>
                                                                handleCategoryToggle(
                                                                    category.id,
                                                                )
                                                            }
                                                        >
                                                            {category.name}
                                                            <span className="ml-1 text-xs opacity-70">
                                                                (
                                                                {
                                                                    category.products_count
                                                                }
                                                                )
                                                            </span>
                                                        </Badge>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {!search && (
                                            <div className="mt-3 border-t pt-2">
                                                <p className="text-xs text-gray-500">
                                                    💡 Tips: Cari berdasarkan
                                                    nama, atau kategori
                                                </p>
                                            </div>
                                        )}

                                        {localSelectedCategories.length > 0 && (
                                            <div className="mt-2 border-t pt-2">
                                                <p className="text-xs text-gray-600">
                                                    {
                                                        localSelectedCategories.length
                                                    }{' '}
                                                    kategori dipilih
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Selected Categories Display */}
                        {!isFocused && localSelectedCategories.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                                <span className="text-xs font-medium text-gray-600">
                                    Filter:
                                </span>
                                {categories
                                    .filter((cat) =>
                                        localSelectedCategories.includes(
                                            cat.id,
                                        ),
                                    )
                                    .map((category) => (
                                        <Badge
                                            key={category.id}
                                            variant="secondary"
                                            className="cursor-pointer"
                                            onClick={() =>
                                                handleCategoryToggle(
                                                    category.id,
                                                )
                                            }
                                        >
                                            {category.name}
                                            <X className="ml-1 h-3 w-3" />
                                        </Badge>
                                    ))}
                            </div>
                        )}
                    </div>

                    {/* Tabs */}
                    <Tabs
                        value={currentTab}
                        onValueChange={handleTabChange}
                        className="mb-6"
                    >
                        <div className="flex items-center justify-between">
                            <TabsList>
                                <TabsTrigger value="products">
                                    <Package className="mr-2 h-4 w-4" />
                                    Produk
                                </TabsTrigger>
                                <TabsTrigger value="shops">
                                    <Store className="mr-2 h-4 w-4" />
                                    Toko
                                </TabsTrigger>
                            </TabsList>

                            {currentTab === 'shops' && (
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
                            )}
                        </div>

                        {/* Location Filter Info */}
                        {currentTab === 'shops' &&
                            filters.latitude &&
                            filters.longitude && (
                                <div className="mt-4 flex items-center gap-2">
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
                                                    tab: 'shops',
                                                    search,
                                                    ...(localSelectedCategories.length >
                                                        0 && {
                                                        categories:
                                                            localSelectedCategories.join(
                                                                ',',
                                                            ),
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
                                </div>
                            )}

                        {/* Products Tab Content */}
                        <TabsContent value="products">
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {products?.data?.map((product) => (
                                    <Card
                                        key={product.id}
                                        className="transition-shadow hover:shadow-lg"
                                    >
                                        <CardHeader>
                                            <CardTitle className="text-lg">
                                                {product.name}
                                            </CardTitle>
                                            <CardDescription>
                                                {product.category && (
                                                    <Badge
                                                        variant="secondary"
                                                        className="mb-2"
                                                    >
                                                        {product.category.name}
                                                    </Badge>
                                                )}
                                                {product.shop && (
                                                    <div className="mt-1 flex items-center gap-1 text-xs">
                                                        <Store className="h-3 w-3" />
                                                        {product.shop.name}
                                                    </div>
                                                )}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                {product.description && (
                                                    <p className="line-clamp-2 text-sm text-muted-foreground">
                                                        {product.description}
                                                    </p>
                                                )}

                                                {product.min_price && (
                                                    <div className="text-sm font-semibold text-primary">
                                                        Rp{' '}
                                                        {Number(
                                                            product.min_price,
                                                        ).toLocaleString(
                                                            'id-ID',
                                                        )}
                                                        {product.max_price &&
                                                            product.max_price !==
                                                                product.min_price &&
                                                            ` - Rp ${Number(product.max_price).toLocaleString('id-ID')}`}
                                                    </div>
                                                )}

                                                {product.top_product && (
                                                    <Badge
                                                        variant="default"
                                                        className="bg-yellow-500 hover:bg-yellow-600"
                                                    >
                                                        ⭐ Top Product
                                                    </Badge>
                                                )}

                                                {product.shop && (
                                                    <Button
                                                        asChild
                                                        className="w-full"
                                                    >
                                                        <Link
                                                            href={`/shops/${product.shop.id}`}
                                                        >
                                                            Lihat Toko
                                                        </Link>
                                                    </Button>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {/* Products Pagination */}
                            {products?.links && products.links.length > 3 && (
                                <div className="mt-8 flex justify-center">
                                    <div className="flex gap-2">
                                        {products.links.map((link, index) => (
                                            <Button
                                                key={index}
                                                variant={
                                                    link.active
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                                size="sm"
                                                disabled={!link.url}
                                                onClick={() =>
                                                    link.url &&
                                                    router.visit(link.url)
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

                            {/* No Products Found */}
                            {products?.data?.length === 0 && (
                                <div className="py-12 text-center">
                                    <div className="mx-auto h-24 w-24 text-gray-400">
                                        <Package className="h-full w-full" />
                                    </div>
                                    <h3 className="mt-4 text-lg font-medium text-foreground">
                                        Tidak ada produk ditemukan
                                    </h3>
                                    <p className="mt-2 text-muted-foreground">
                                        {localSelectedCategories.length > 0
                                            ? `Tidak ada produk dengan kategori yang dipilih${filters.search ? ` dan pencarian "${filters.search}"` : ''}`
                                            : filters.search
                                              ? `Tidak ada produk yang cocok dengan pencarian "${filters.search}"`
                                              : 'Coba ubah kata kunci pencarian atau kategori'}
                                    </p>
                                    {(localSelectedCategories.length > 0 ||
                                        filters.search) && (
                                        <div className="mt-4">
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setSearch('');
                                                    setLocalSelectedCategories(
                                                        [],
                                                    );
                                                    router.get(
                                                        '/shops',
                                                        { tab: 'products' },
                                                        {
                                                            preserveState: false,
                                                            replace: true,
                                                        },
                                                    );
                                                }}
                                            >
                                                Tampilkan Semua Produk
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </TabsContent>

                        {/* Shops Tab Content */}
                        <TabsContent value="shops">
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {shops?.data?.map((shop) => (
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
                                                        {shop.distance.toFixed(
                                                            1,
                                                        )}{' '}
                                                        km dari lokasi Anda
                                                    </Badge>
                                                )}

                                                {shop.products.length > 0 && (
                                                    <div>
                                                        <p className="mb-2 text-sm text-muted-foreground">
                                                            {
                                                                shop.products
                                                                    .length
                                                            }{' '}
                                                            produk tersedia
                                                        </p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {shop.products
                                                                .slice(0, 3)
                                                                .map(
                                                                    (
                                                                        product,
                                                                    ) => (
                                                                        <Badge
                                                                            key={
                                                                                product.id
                                                                            }
                                                                            variant="secondary"
                                                                            className="text-xs"
                                                                        >
                                                                            {
                                                                                product.name
                                                                            }
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
                                                                    ),
                                                                )}
                                                            {shop.products
                                                                .length > 3 && (
                                                                <Badge
                                                                    variant="secondary"
                                                                    className="text-xs"
                                                                >
                                                                    +
                                                                    {shop
                                                                        .products
                                                                        .length -
                                                                        3}{' '}
                                                                    lainnya
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                <Button
                                                    asChild
                                                    className="w-full"
                                                >
                                                    <Link
                                                        href={`/shops/${shop.id}`}
                                                    >
                                                        Lihat Detail
                                                    </Link>
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {/* Shops Pagination */}
                            {shops?.links && shops.links.length > 3 && (
                                <div className="mt-8 flex justify-center">
                                    <div className="flex gap-2">
                                        {shops.links.map((link, index) => (
                                            <Button
                                                key={index}
                                                variant={
                                                    link.active
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                                size="sm"
                                                disabled={!link.url}
                                                onClick={() =>
                                                    link.url &&
                                                    router.visit(link.url)
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

                            {/* No Shops Found */}
                            {shops?.data?.length === 0 && (
                                <div className="py-12 text-center">
                                    <div className="mx-auto h-24 w-24 text-gray-400">
                                        <MapPin className="h-full w-full" />
                                    </div>
                                    <h3 className="mt-4 text-lg font-medium text-foreground">
                                        Tidak ada toko ditemukan
                                    </h3>
                                    <p className="mt-2 text-muted-foreground">
                                        {localSelectedCategories.length > 0 ? (
                                            <>
                                                Tidak ada toko dengan kategori
                                                yang dipilih
                                                {filters.search &&
                                                    ` dan pencarian "${filters.search}"`}
                                            </>
                                        ) : filters.search ? (
                                            `Tidak ada toko yang cocok dengan pencarian "${filters.search}"`
                                        ) : (
                                            'Coba ubah kata kunci pencarian atau perluas area pencarian'
                                        )}
                                    </p>
                                    {(localSelectedCategories.length > 0 ||
                                        filters.search) && (
                                        <div className="mt-4">
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setSearch('');
                                                    setLocalSelectedCategories(
                                                        [],
                                                    );
                                                    router.get(
                                                        '/shops',
                                                        { tab: 'shops' },
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
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </UserLayout>
    );
}
