import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { route } from '@/ziggy-config';
import { Link, router } from '@inertiajs/react';
import { MapPin, Search, Store, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

/**
 * Komponen SearchBar untuk pencarian toko dan produk dengan suggestions
 */
export default function SearchBar({
    searchValue,
    onSearchChange,
    onSearchSubmit,
    onFindNearestShops,
    userLocation,
    manualLocation,
    categories = [],
    selectedCategories = [],
}) {
    const [isFocused, setIsFocused] = useState(false);
    const [localSelectedCategories, setLocalSelectedCategories] =
        useState(selectedCategories);
    const searchRef = useRef(null);

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

    const handleFindNearest = () => {
        if (onFindNearestShops) {
            onFindNearestShops();
        }
    };

    const handleCategoryToggle = (categoryId) => {
        const newSelected = localSelectedCategories.includes(categoryId)
            ? localSelectedCategories.filter((id) => id !== categoryId)
            : [...localSelectedCategories, categoryId];

        setLocalSelectedCategories(newSelected);

        // Update URL with selected categories
        const params = new URLSearchParams(window.location.search);
        if (newSelected.length > 0) {
            params.set('categories', newSelected.join(','));
        } else {
            params.delete('categories');
        }

        // Preserve search value
        if (searchValue) {
            params.set('search', searchValue);
        }

        router.visit(route('home'), {
            data: Object.fromEntries(params),
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleClearCategories = () => {
        setLocalSelectedCategories([]);

        const params = new URLSearchParams(window.location.search);
        params.delete('categories');

        if (searchValue) {
            params.set('search', searchValue);
        }

        router.visit(route('home'), {
            data: Object.fromEntries(params),
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const hasLocation = userLocation || manualLocation;

    return (
        <div className="absolute z-[1000] w-full">
            <div
                ref={searchRef}
                className="relative mx-auto flex w-full flex-col gap-y-2 p-4 md:w-1/2"
            >
                <div className="flex w-full gap-x-2">
                    <div className="relative w-full">
                        <div className="w-full rounded-md bg-white shadow-lg">
                            <form
                                onSubmit={onSearchSubmit}
                                className="relative w-full"
                            >
                                <Search className="absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Cari toko atau produk..."
                                    value={searchValue}
                                    onChange={onSearchChange}
                                    onFocus={() => setIsFocused(true)}
                                    className="w-full border-none pr-10 pl-10 focus:ring-0 focus-visible:ring-0"
                                />
                            </form>
                        </div>

                        {/* Suggestions Dropdown */}
                        {isFocused && (
                            <div className="absolute top-full right-0 left-0 z-50 mt-1 rounded-md border bg-white shadow-lg">
                                <div className="p-3">
                                    {/* Category Filters */}
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

                                    {/* Search Tips */}
                                    {!searchValue && (
                                        <div className="mt-3 border-t pt-2">
                                            <p className="text-xs text-gray-500">
                                                💡 Tips: Cari berdasarkan nama
                                                toko, produk, atau kategori
                                            </p>
                                        </div>
                                    )}

                                    {/* Active Filters Summary */}
                                    {localSelectedCategories.length > 0 && (
                                        <div className="mt-2 border-t pt-2">
                                            <p className="text-xs text-gray-600">
                                                {localSelectedCategories.length}{' '}
                                                kategori dipilih
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Button Cari Toko Terdekat */}
                    <Button
                        onClick={handleFindNearest}
                        disabled={!hasLocation}
                        className="shadow-lg transition-all duration-200 hover:shadow-lg"
                        title={
                            hasLocation
                                ? 'Cari toko terdekat dari lokasi Anda'
                                : 'Pilih lokasi terlebih dahulu'
                        }
                    >
                        <MapPin className="h-4 w-4" />
                    </Button>

                    <Link href={route('shops.index')} className="shadow-lg">
                        <Button className="hover:cursor-pointer">
                            <Store />
                        </Button>
                    </Link>
                </div>

                {/* Selected Categories Display (when not focused) */}
                {!isFocused && localSelectedCategories.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 rounded-md bg-white px-3 py-2 shadow-md">
                        <span className="text-xs font-medium text-gray-600">
                            Filter:
                        </span>
                        {categories
                            .filter((cat) =>
                                localSelectedCategories.includes(cat.id),
                            )
                            .map((category) => (
                                <Badge
                                    key={category.id}
                                    variant="secondary"
                                    className="cursor-pointer"
                                    onClick={() =>
                                        handleCategoryToggle(category.id)
                                    }
                                >
                                    {category.name}
                                    <X className="ml-1 h-3 w-3" />
                                </Badge>
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
}
