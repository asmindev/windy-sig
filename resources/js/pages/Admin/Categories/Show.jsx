import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AdminLayout from '@/layouts/AdminLayout';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Edit, Package, Tag } from 'lucide-react';

export default function CategoryShow({ auth, category }) {
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AdminLayout
            user={auth.user}
            header={
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={route('admin.categories.index')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <h2 className="text-xl font-semibold text-foreground">
                            Detail Kategori
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Informasi lengkap kategori {category.name}
                        </p>
                    </div>
                    <Button asChild>
                        <Link
                            href={route('admin.categories.edit', category.id)}
                        >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Kategori
                        </Link>
                    </Button>
                </div>
            }
        >
            <div className="py-6">
                <div className="mx-auto w-full px-4">
                    <div className="space-y-6">
                        {/* Category Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                        <Tag className="size-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold">
                                            {category.name}
                                        </h3>
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {category.description && (
                                    <div>
                                        <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                                            Deskripsi
                                        </h4>
                                        <p className="text-sm">
                                            {category.description}
                                        </p>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 gap-6 md:grid-cols-1">
                                    <div>
                                        <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                                            Jumlah Produk
                                        </h4>
                                        <div className="flex items-center gap-1">
                                            <Package className="size-4 text-muted-foreground" />
                                            <span className="font-medium">
                                                {category.products_count || 0}
                                            </span>
                                            <span className="text-sm text-muted-foreground">
                                                produk
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                <div className="grid grid-cols-1 gap-6 text-sm md:grid-cols-2">
                                    <div>
                                        <h4 className="mb-1 font-medium text-muted-foreground">
                                            Dibuat
                                        </h4>
                                        <p>{formatDate(category.created_at)}</p>
                                    </div>
                                    <div>
                                        <h4 className="mb-1 font-medium text-muted-foreground">
                                            Terakhir Diperbarui
                                        </h4>
                                        <p>{formatDate(category.updated_at)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Products in this Category */}
                        {category.products && category.products.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Produk dalam Kategori</CardTitle>
                                    <CardDescription>
                                        Daftar produk yang termasuk dalam
                                        kategori {category.name}
                                        {category.products.length >= 10 &&
                                            ' (menampilkan 10 teratas)'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>
                                                        Produk
                                                    </TableHead>
                                                    <TableHead>Toko</TableHead>
                                                    <TableHead>Harga</TableHead>
                                                    <TableHead>Aksi</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {category.products.map(
                                                    (product) => (
                                                        <TableRow
                                                            key={product.id}
                                                        >
                                                            <TableCell>
                                                                <div className="space-y-1">
                                                                    <div className="font-medium">
                                                                        {
                                                                            product.name
                                                                        }
                                                                    </div>
                                                                    {product.description && (
                                                                        <div className="line-clamp-1 text-sm text-muted-foreground">
                                                                            {
                                                                                product.description
                                                                            }
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                {product.shop ? (
                                                                    <div className="text-sm">
                                                                        <div className="font-medium">
                                                                            {
                                                                                product
                                                                                    .shop
                                                                                    .name
                                                                            }
                                                                        </div>
                                                                        <div className="text-muted-foreground">
                                                                            {
                                                                                product
                                                                                    .shop
                                                                                    .address
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-muted-foreground">
                                                                        -
                                                                    </span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="font-medium">
                                                                    Rp{' '}
                                                                    {new Intl.NumberFormat(
                                                                        'id-ID',
                                                                    ).format(
                                                                        product.price,
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    asChild
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
                                                            </TableCell>
                                                        </TableRow>
                                                    ),
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {category.products_count > 10 && (
                                        <div className="mt-4 text-center">
                                            <Button variant="outline" asChild>
                                                <Link
                                                    href={route(
                                                        'admin.products.index',
                                                        {
                                                            category:
                                                                category.id,
                                                        },
                                                    )}
                                                >
                                                    Lihat Semua Produk (
                                                    {category.products_count})
                                                </Link>
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Empty State */}
                        {(!category.products ||
                            category.products.length === 0) && (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <Package className="mb-4 size-12 text-muted-foreground" />
                                    <h3 className="mb-2 text-lg font-medium">
                                        Belum Ada Produk
                                    </h3>
                                    <p className="mb-4 text-center text-muted-foreground">
                                        Kategori ini belum memiliki produk. Anda
                                        dapat menambahkan produk baru dan
                                        mengassign ke kategori ini.
                                    </p>
                                    <Button asChild>
                                        <Link
                                            href={route(
                                                'admin.products.create',
                                            )}
                                        >
                                            Tambah Produk
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
