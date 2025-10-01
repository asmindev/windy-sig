import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdminLayout from '@/layouts/AdminLayout';
import { Link, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import ProductDataTable from './components/ProductDataTable';
import { getProductColumns } from './components/productColumns';
import ProductService from './services/ProductService';

export default function ProductsIndex({ auth, products, filters = {} }) {
    const props = usePage().props;
    const { flash } = props;
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [deleteProduct, setDeleteProduct] = useState(null);
    if (flash?.message && flash?.status) {
        if (flash.status === 'success') {
            toast.success(flash.message);
        } else if (flash.status === 'error') {
            toast.error(flash.message);
        }
    }

    const handleSearch = (searchValue) => {
        setSearchTerm(searchValue);
        ProductService.search(searchValue);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        ProductService.clearFilters();
    };

    const handleDeleteProduct = (product) => {
        setDeleteProduct(product);
    };

    const confirmDelete = () => {
        if (deleteProduct) {
            ProductService.deleteProduct(deleteProduct, () => {
                setDeleteProduct(null);
            });
        }
    };

    // Get columns with delete handler
    const columns = getProductColumns(handleDeleteProduct);

    return (
        <AdminLayout
            user={auth.user}
            header={
                <div>
                    <h1 className="text-2xl font-semibold">Products</h1>
                    <p className="text-muted-foreground">
                        Manage your product inventory
                    </p>
                </div>
            }
        >
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>
                                All Products (
                                {products.total || products.data?.length || 0})
                            </CardTitle>
                            <Button asChild>
                                <Link
                                    href={ProductService.getRouteUrl('create')}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Product
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {products.data?.length > 0 ? (
                            <ProductDataTable
                                columns={columns}
                                data={products.data}
                                paginationData={products}
                                onSearch={handleSearch}
                                onClearSearch={handleClearSearch}
                                initialSearchValue={searchTerm}
                                searchPlaceholder="Search products by name, type, or shop..."
                            />
                        ) : (
                            <div className="py-12 text-center">
                                <p className="text-muted-foreground">
                                    No products found.
                                </p>
                                <Button asChild className="mt-4">
                                    <Link
                                        href={ProductService.getRouteUrl(
                                            'create',
                                        )}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Your First Product
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={!!deleteProduct}
                onOpenChange={() => setDeleteProduct(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Product</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "
                            {deleteProduct?.name}"? This action cannot be
                            undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminLayout>
    );
}
