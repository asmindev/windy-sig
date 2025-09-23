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
import ShopService from '@/services/ShopService';
import { Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { ShopDataTable } from './components/ShopDataTable';
import { getShopColumns } from './components/shopColumns';

export default function ShopsIndex({ auth, shops, filters = {} }) {
    const [selectedShop, setSelectedShop] = useState(null);

    const handleDelete = (shop) => {
        setSelectedShop(shop);
    };

    const confirmDelete = () => {
        if (selectedShop) {
            ShopService.deleteShop(selectedShop.id);
            setSelectedShop(null);
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
                            <Link href={route('shops.create')}>
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
                onOpenChange={() => setSelectedShop(null)}
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
                        >
                            Batal
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminLayout>
    );
}
