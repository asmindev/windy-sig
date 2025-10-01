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
import { route } from '@/ziggy-config';
import { Link, router, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { CategoryDataTable } from './components/CategoryDataTable';
import { getCategoryColumns } from './components/categoryColumns';

export default function CategoriesIndex({ auth, categories, filters = {} }) {
    const { flash } = usePage().props;
    if (flash?.message && flash?.status) {
        if (flash.status === 'success') {
            toast.success(flash.message);
        } else if (flash.status === 'error') {
            toast.error(flash.message);
        }
    }
    const [selectedCategory, setSelectedCategory] = useState(null);

    const handleDelete = (category) => {
        setSelectedCategory(category);
    };

    const confirmDelete = () => {
        if (selectedCategory) {
            router.delete(
                route('admin.categories.destroy', selectedCategory.id),
                {
                    onSuccess: () => {
                        setSelectedCategory(null);
                    },
                    onError: (errors) => {
                        console.error('Delete failed:', errors);
                    },
                },
            );
        }
    };

    // Create columns with delete handler
    const columns = getCategoryColumns(handleDelete);

    return (
        <AdminLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Kategori</h1>
                        <p className="text-muted-foreground">
                            Kelola kategori produk di aplikasi
                        </p>
                    </div>
                </div>
            }
        >
            <div className="space-y-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <CardTitle>
                            Semua Kategori ({categories.total || 0})
                        </CardTitle>
                        <Button asChild>
                            <Link href={route('admin.categories.create')}>
                                <Plus className="mr-2 h-4 w-4" />
                                Tambah Kategori
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <CategoryDataTable
                            data={categories.data || []}
                            columns={columns}
                            filters={filters}
                            pagination={{
                                current_page: categories.current_page || 1,
                                last_page: categories.last_page || 1,
                                per_page: categories.per_page || 10,
                                total: categories.total || 0,
                            }}
                            onDelete={handleDelete}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={!!selectedCategory}
                onOpenChange={() => setSelectedCategory(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Kategori</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus kategori "
                            {selectedCategory?.name}"? Tindakan ini tidak dapat
                            dibatalkan. Kategori yang memiliki produk tidak
                            dapat dihapus.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={() => setSelectedCategory(null)}
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
