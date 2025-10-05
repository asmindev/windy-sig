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
import AdminLayout from '@/layouts/AdminLayout';
import { formatPrice } from '@/lib/utils';
import { route } from '@/ziggy-config';
import { Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Clock,
    Edit,
    MapPin,
    Package,
    Phone,
    Plus,
    Star,
    Store,
    Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminShopShow({ auth, shop }) {
    const handleDeleteProduct = (productId, productName) => {
        if (
            confirm(
                `Apakah Anda yakin ingin menghapus produk "${productName}"?`,
            )
        ) {
            router.delete(route('admin.products.destroy', productId), {
                onSuccess: () => {
                    toast.success('Produk berhasil dihapus');
                },
                onError: () => {
                    toast.error('Gagal menghapus produk');
                },
            });
        }
    };

    const getAvailabilityBadge = (isAvailable) => {
        return isAvailable ? (
            <Badge variant="default" className="bg-green-100 text-green-800">
                Tersedia
            </Badge>
        ) : (
            <Badge variant="secondary" className="bg-red-100 text-red-800">
                Tidak Tersedia
            </Badge>
        );
    };

    const getStockBadge = (stock) => {
        if (stock === 0) {
            return <Badge variant="destructive">Habis</Badge>;
        } else if (stock < 10) {
            return <Badge variant="secondary">Stok Sedikit</Badge>;
        } else {
            return <Badge variant="default">Stok Cukup</Badge>;
        }
    };

    return (
        <AdminLayout
            user={auth.user}
            header={
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={route('admin.shops.index')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h2 className="text-xl font-semibold text-foreground">
                            Detail Toko
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {shop.name}
                        </p>
                    </div>
                </div>
            }
        >
            <div className="py-6">
                <div className="w-full space-y-6">
                    {/* Main Shop Information */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Store className="h-6 w-6" />
                                <div>
                                    <CardTitle className="text-2xl">
                                        {shop.name}
                                    </CardTitle>
                                    {shop.description && (
                                        <CardDescription className="text-base">
                                            {shop.description}
                                        </CardDescription>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-sm">
                                    {shop.products.length} Produk
                                </Badge>
                                <Button asChild>
                                    <Link
                                        href={route(
                                            'admin.shops.edit',
                                            shop.id,
                                        )}
                                    >
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit Toko
                                    </Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Contact & Location Information */}
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="mb-2 font-semibold text-foreground">
                                            Informasi Kontak
                                        </h3>
                                        <div className="space-y-2">
                                            <div className="flex items-start gap-2">
                                                <MapPin className="mt-1 h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <p className="text-sm text-foreground">
                                                        {shop.address}
                                                    </p>
                                                    {shop.latitude &&
                                                        shop.longitude && (
                                                            <p className="text-xs text-muted-foreground">
                                                                Koordinat:{' '}
                                                                {shop.latitude},{' '}
                                                                {shop.longitude}
                                                            </p>
                                                        )}
                                                </div>
                                            </div>
                                            {shop.phone && (
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                                    <p className="text-sm text-foreground">
                                                        {shop.phone}
                                                    </p>
                                                </div>
                                            )}
                                            {shop.operating_hours && (
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                                    <p className="text-sm text-foreground">
                                                        {shop.operating_hours}
                                                    </p>
                                                </div>
                                            )}
                                            {shop.rating && (
                                                <div className="flex items-center gap-2">
                                                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                                                    <p className="text-sm text-foreground">
                                                        <span className="font-semibold">
                                                            {Number.parseFloat(
                                                                shop.rating,
                                                            ).toFixed(1)}
                                                        </span>{' '}
                                                        / 5.0
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="mb-2 font-semibold text-foreground">
                                            Aksi Cepat
                                        </h3>
                                        <div className="space-y-2">
                                            <Button
                                                asChild
                                                className="w-full justify-start"
                                            >
                                                <Link
                                                    href={route(
                                                        'admin.products.create',
                                                        { shop: shop.id },
                                                    )}
                                                >
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Tambah Produk Baru
                                                </Link>
                                            </Button>
                                            <Button
                                                asChild
                                                variant="outline"
                                                className="w-full justify-start"
                                            >
                                                <Link
                                                    href={route(
                                                        'shops.show',
                                                        shop.id,
                                                    )}
                                                >
                                                    <Store className="mr-2 h-4 w-4" />
                                                    Lihat Halaman Publik
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Products Section */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5" />
                                    Produk di Toko Ini
                                </CardTitle>
                                <CardDescription>
                                    Daftar semua produk yang tersedia di toko
                                    ini
                                </CardDescription>
                            </div>
                            <Button asChild>
                                <Link
                                    href={route('admin.products.create', {
                                        shop: shop.id,
                                    })}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Tambah Produk
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {shop.products.length > 0 ? (
                                <div className="space-y-4">
                                    {shop.products.map((product, index) => (
                                        <div key={product.id}>
                                            <div className="flex items-center justify-between rounded-lg border p-4">
                                                <div className="flex items-start gap-4">
                                                    {product.image && (
                                                        <img
                                                            src={`/storage/${product.image}`}
                                                            alt={product.name}
                                                            className="h-16 w-16 rounded-lg object-cover"
                                                        />
                                                    )}
                                                    <div className="space-y-2">
                                                        <div>
                                                            <h4 className="font-medium text-foreground">
                                                                {product.name}
                                                            </h4>
                                                            {product.type && (
                                                                <p className="text-sm text-muted-foreground">
                                                                    {
                                                                        product.type
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-lg font-semibold text-green-600">
                                                                {formatPrice(
                                                                    product,
                                                                )}
                                                            </span>
                                                            {/* {getAvailabilityBadge(
                                                                product.is_available,
                                                            )} */}
                                                            {getStockBadge(
                                                                product.stock_quantity,
                                                            )}
                                                            {product.category && (
                                                                <Badge variant="secondary">
                                                                    {
                                                                        product
                                                                            .category
                                                                            .name
                                                                    }
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        {product.description && (
                                                            <p className="max-w-md text-sm text-muted-foreground">
                                                                {product
                                                                    .description
                                                                    .length >
                                                                100
                                                                    ? `${product.description.substring(0, 100)}...`
                                                                    : product.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        asChild
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        <Link
                                                            href={route(
                                                                'admin.products.show',
                                                                product.id,
                                                            )}
                                                        >
                                                            Lihat
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        asChild
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        <Link
                                                            href={route(
                                                                'admin.products.edit',
                                                                product.id,
                                                            )}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleDeleteProduct(
                                                                product.id,
                                                                product.name,
                                                            )
                                                        }
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            {index <
                                                shop.products.length - 1 && (
                                                <Separator className="my-4" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center">
                                    <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                                    <h3 className="mt-4 text-lg font-medium text-foreground">
                                        Belum ada produk
                                    </h3>
                                    <p className="mt-2 text-muted-foreground">
                                        Toko ini belum memiliki produk.
                                        Tambahkan produk pertama sekarang.
                                    </p>
                                    <div className="mt-4">
                                        <Button asChild>
                                            <Link
                                                href={route(
                                                    'admin.products.create',
                                                    { shop: shop.id },
                                                )}
                                            >
                                                <Plus className="mr-2 h-4 w-4" />
                                                Tambah Produk Pertama
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Metadata Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi Metadata</CardTitle>
                            <CardDescription>
                                Informasi tambahan tentang toko ini
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <h4 className="font-medium text-foreground">
                                        Dibuat
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(
                                            shop.created_at,
                                        ).toLocaleDateString('id-ID', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-medium text-foreground">
                                        Terakhir Diperbarui
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(
                                            shop.updated_at,
                                        ).toLocaleDateString('id-ID', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
