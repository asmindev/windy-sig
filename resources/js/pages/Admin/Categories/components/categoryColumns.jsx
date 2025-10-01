import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link } from '@inertiajs/react';
import { MoreHorizontal, Package, Tag } from 'lucide-react';

/**
 * Column definitions for categories data table
 * @param {Function} onDelete - Delete handler function
 */
export const getCategoryColumns = (onDelete) => [
    {
        accessorKey: 'name',
        header: 'Kategori',
        cell: ({ row }) => (
            <div className="flex items-center space-x-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Tag className="size-6 text-primary" />
                </div>
                <div className="w-48 space-y-1">
                    <span className="block truncate font-medium">
                        {row.original.name}
                    </span>
                    <p className="truncate text-sm text-muted-foreground">
                        {row.original.description || 'Tidak ada deskripsi'}
                    </p>
                </div>
            </div>
        ),
    },
    {
        accessorKey: 'products_count',
        header: 'Produk',
        cell: ({ row }) => (
            <div className="flex items-center space-x-1">
                <Package className="size-4 text-muted-foreground" />
                <span className="font-medium">
                    {row.original.products_count || 0}
                </span>
                <span className="text-sm text-muted-foreground">produk</span>
            </div>
        ),
    },
    {
        accessorKey: 'actions',
        header: 'Aksi',
        id: 'actions',
        cell: ({ row }) => (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Buka menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                        <Link
                            href={route(
                                'admin.categories.edit',
                                row.original.id,
                            )}
                        >
                            Edit
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link
                            href={route(
                                'admin.categories.show',
                                row.original.id,
                            )}
                        >
                            Lihat Detail
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => onDelete(row.original)}
                        className="text-red-600"
                        // disabled={row.original.products_count > 0}
                    >
                        Hapus
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        ),
    },
];
