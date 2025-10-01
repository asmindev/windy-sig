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
import { Link, router, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ShopDataTable } from './components/ShopDataTable';
import { getShopColumns } from './components/shopColumns';

export default function ShopsIndex({ auth, shops, filters = {} }) {
    const [selectedShop, setSelectedShop] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const { flash } = usePage().props;

    // Handle flash messages
    useEffect(() => {
        if (flash?.message && flash?.status) {
            if (flash.status === 'success') {
                toast.success(flash.message);
            } else if (flash.status === 'error') {
                toast.error(flash.message);
            }
        }
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const handleDelete = (shop) => {
        setSelectedShop(shop);
    };

    const confirmDelete = () => {
        if (selectedShop && !isDeleting) {
            console.log('Starting delete for shop:', selectedShop.id);
            setIsDeleting(true);

            router.delete(route('admin.shops.destroy', selectedShop.id), {
                preserveState: true,
                onStart: () => {
                    console.log('Delete request started');
                },
                onSuccess: (page) => {
                    console.log('Delete successful:', page);
                },
                onError: (errors) => {
                    console.error('Delete failed:', errors);
                    setIsDeleting(false);
                },
                onFinish: () => {
                    console.log('Delete request finished');
                    setIsDeleting(false);
                    setSelectedShop(null);
                },
            });
        }
    };

    // Create columns with delete handler
    const columns = getShopColumns(handleDelete);

    return (
        <AdminLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Toko</h1>
                        <p className="text-muted-foreground">
                            Kelola lokasi toko dan detailnya
                        </p>
                    </div>
                </div>
            }
        >
            <div className="space-y-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <CardTitle>Semua Toko ({shops.total || 0})</CardTitle>
                        <Button asChild>
                            <Link href={route('admin.shops.create')}>
                                <Plus className="mr-2 h-4 w-4" />
                                Tambah Toko
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <ShopDataTable
                            data={shops.data || []}
                            columns={columns}
                            filters={filters}
                            pagination={{
                                current_page: shops.current_page || 1,
                                last_page: shops.last_page || 1,
                                per_page: shops.per_page || 10,
                                total: shops.total || 0,
                            }}
                            onDelete={handleDelete}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={!!selectedShop}
                onOpenChange={(open) => {
                    if (!open && !isDeleting) {
                        setSelectedShop(null);
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Toko</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus toko "
                            {selectedShop?.name}"? Tindakan ini tidak dapat
                            dibatalkan dan akan menghapus semua produk yang
                            terkait dengan toko ini.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={() => setSelectedShop(null)}
                            disabled={isDeleting}
                        >
                            Batal
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            disabled={isDeleting}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {isDeleting ? 'Menghapus...' : 'Hapus'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminLayout>
    );
}
