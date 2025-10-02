import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { route } from '@/ziggy-config';
import { Link } from '@inertiajs/react';
import { ImageIcon, MoreHorizontal, Store } from 'lucide-react';

/**
 * Column definitions for products data table
 * @param {Function} onDelete - Delete handler function
 */
export const getProductColumns = (onDelete) => [
    {
        accessorKey: 'name',
        header: 'Produk',
        cell: ({ row }) => (
            <div className="flex items-center space-x-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                    {row.original.image ? (
                        <img
                            src={row.original.image}
                            alt={row.original.name}
                            className="size-12 rounded-lg object-cover"
                        />
                    ) : (
                        <ImageIcon className="size-6 text-gray-400" />
                    )}
                </div>
                <div className="w-64 space-y-1">
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
        accessorKey: 'shop',
        header: 'Toko',
        cell: ({ row }) => (
            <div className="space-y-1">
                <div className="flex items-center">
                    <Store className="mr-1 size-4" />
                    <span className="truncate font-medium">
                        {row.original.shop?.name || 'Tidak ada toko'}
                    </span>
                </div>
                <div className="text-sm text-muted-foreground">
                    {row.original.shop?.address || ''}
                </div>
            </div>
        ),
    },
    {
        accessorKey: 'category',
        header: 'Kategori',
        cell: ({ row }) => (
            <div className="flex items-center space-x-1">
                <Badge variant="outline">
                    {row.original.category?.name || 'Umum'}
                </Badge>
            </div>
        ),
    },
    {
        accessorKey: 'price',
        header: 'Harga',
        cell: ({ row }) => (
            <div className="flex items-center space-x-1">
                <span className="font-medium">
                    {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                    }).format(row.original.price)}
                </span>
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
                            href={route('admin.products.edit', {
                                product: row.original.id,
                            })}
                        >
                            Edit
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link
                            href={route('admin.products.show', {
                                product: row.original.id,
                            })}
                        >
                            Lihat Detail
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => onDelete(row.original)}
                        className="text-red-600"
                    >
                        Hapus
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        ),
    },
];
