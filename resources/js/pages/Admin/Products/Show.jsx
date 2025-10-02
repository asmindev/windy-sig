import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AdminLayout from '@/layouts/AdminLayout';
import { route } from '@/ziggy-config';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Edit, Package, Plus, Tag } from 'lucide-react';
import ProductService from './services/ProductService';

export default function ProductShow({ auth, product }) {
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
    return (
        <AdminLayout
            user={auth.user}
            header={
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={ProductService.getRouteUrl('index')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h2 className="text-xl font-semibold text-foreground">
                            Product Details
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {product.name}
                        </p>
                    </div>
                </div>
            }
        >
            <div className="py-6">
                <div className="w-full">
                    <div className="grid gap-6">
                        {/* Main Product Information */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Package className="h-6 w-6" />
                                    <div>
                                        <CardTitle className="text-2xl">
                                            {product.name}
                                        </CardTitle>
                                        {product.type && (
                                            <CardDescription className="text-base">
                                                {product.type}
                                            </CardDescription>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button asChild>
                                        <Link
                                            href={ProductService.getRouteUrl(
                                                'edit',
                                                product.id,
                                            )}
                                        >
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit Product
                                        </Link>
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-6 md:grid-cols-2">
                                    {/* Basic Information */}
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="font-semibold text-foreground">
                                                Shop Information
                                            </h3>
                                            <p className="text-muted-foreground">
                                                {product.shop?.name ||
                                                    'Unknown Shop'}
                                            </p>
                                            {product.shop?.address && (
                                                <p className="text-sm text-muted-foreground">
                                                    {product.shop.address}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-semibold text-foreground">
                                                    Category
                                                </h3>
                                                <div className="flex items-center gap-2">
                                                    {product.category && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            asChild
                                                        >
                                                            <Link
                                                                href={route(
                                                                    'admin.categories.edit',
                                                                    product
                                                                        .category
                                                                        .id,
                                                                )}
                                                            >
                                                                <Edit className="mr-1 h-3 w-3" />
                                                                Edit
                                                            </Link>
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={route(
                                                                'admin.categories.create',
                                                            )}
                                                        >
                                                            <Plus className="mr-1 h-3 w-3" />
                                                            Add Category
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </div>
                                            {product.category ? (
                                                <div className="mt-2">
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-sm"
                                                    >
                                                        <Tag className="mr-1 h-3 w-3" />
                                                        {product.category.name}
                                                    </Badge>
                                                    {product.category
                                                        .description && (
                                                        <p className="mt-1 text-sm text-muted-foreground">
                                                            {
                                                                product.category
                                                                    .description
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="mt-2 text-muted-foreground">
                                                    No category assigned
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <h3 className="font-semibold text-foreground">
                                                Range Harga
                                            </h3>
                                            <p className="text-2xl font-bold text-green-600">
                                                {formatPrice(product)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Description and Additional Info */}
                                    <div className="space-y-4">
                                        {product.description && (
                                            <div>
                                                <h3 className="font-semibold text-foreground">
                                                    Description
                                                </h3>
                                                <p className="whitespace-pre-line text-muted-foreground">
                                                    {product.description}
                                                </p>
                                            </div>
                                        )}

                                        {product.image && (
                                            <div>
                                                <h3 className="font-semibold text-foreground">
                                                    Product Image
                                                </h3>
                                                <div className="mt-2">
                                                    <img
                                                        src={product.image}
                                                        alt={product.name}
                                                        className="h-auto max-w-full rounded-lg border"
                                                        style={{
                                                            maxHeight: '300px',
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Additional Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Product Metadata</CardTitle>
                                <CardDescription>
                                    Additional information about this product
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <h4 className="font-medium text-foreground">
                                            Created
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(
                                                product.created_at,
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
                                            Last Updated
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(
                                                product.updated_at,
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
            </div>
        </AdminLayout>
    );
}
