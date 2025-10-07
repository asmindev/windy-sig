import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { route } from '@/ziggy-config';
import { Link } from '@inertiajs/react';
import { MapPin, Search, Store } from 'lucide-react';

/**
 * Komponen SearchBar untuk pencarian toko dan produk
 */
export default function SearchBar({
    searchValue,
    onSearchChange,
    onSearchSubmit,
    onFindNearestShops,
    userLocation,
    manualLocation,
}) {
    const handleFindNearest = () => {
        if (onFindNearestShops) {
            onFindNearestShops();
        }
    };

    const hasLocation = userLocation || manualLocation;

    return (
        <div className="absolute z-[1000] w-full">
            <div className="relative mx-auto flex w-full justify-center gap-x-2 p-4 md:w-1/2">
                <div className="w-full rounded-md bg-white shadow-lg">
                    <form onSubmit={onSearchSubmit} className="relative w-full">
                        <Search className="absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Cari toko atau produk..."
                            value={searchValue}
                            onChange={onSearchChange}
                            className="w-full border-none pr-10 pl-10 focus:ring-0 focus-visible:ring-0"
                        />
                    </form>
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
        </div>
    );
}
