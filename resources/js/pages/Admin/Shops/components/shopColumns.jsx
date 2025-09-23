import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link } from '@inertiajs/react';
import { MapPin, MoreHorizontal, Phone, Store } from 'lucide-react';

/**
 * Column definitions for shops data table
 * @param {Function} onDelete - Delete handler function
 */
export const getShopColumns = (onDelete) => [
    {
        accessorKey: 'name',
        header: 'Toko',
        cell: ({ row }) => (
            <div className="flex items-center space-x-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                    <Store className="size-6 text-blue-600" />
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
        accessorKey: 'address',
        header: 'Alamat',
        cell: ({ row }) => (
            <div className="w-64 space-y-1">
                <div className="flex items-start">
                    <MapPin className="mt-0.5 mr-1 size-4 text-muted-foreground" />
                    <div>
                        <div className="truncate font-medium">
                            {row.original.address}
                        </div>
                        {row.original.city && (
                            <div className="text-sm text-muted-foreground">
                                {row.original.city}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        ),
    },
    {
        accessorKey: 'contact',
        header: 'Kontak',
        cell: ({ row }) => (
            <div className="w-40 space-y-1">
                {row.original.phone && (
                    <div className="flex items-center">
                        <Phone className="mr-1 size-4 text-muted-foreground" />
                        <span className="truncate text-sm">
                            {row.original.phone}
                        </span>
                    </div>
                )}
                {row.original.email && (
                    <div className="text-sm text-muted-foreground">
                        {row.original.email}
                    </div>
                )}
                {!row.original.phone && !row.original.email && (
                    <span className="text-sm text-muted-foreground">-</span>
                )}
            </div>
        ),
    },
    {
        accessorKey: 'is_active',
        header: 'Status',
        cell: ({ row }) => (
            <div className="flex items-center space-x-1">
                <Badge
                    variant={row.original.is_active ? 'default' : 'secondary'}
                >
                    {row.original.is_active ? 'Aktif' : 'Nonaktif'}
                </Badge>
            </div>
        ),
    },
    {
        accessorKey: 'products_count',
        header: 'Produk',
        cell: ({ row }) => (
            <div className="flex items-center space-x-1">
                <span className="font-medium">
                    {row.original.products?.length || 0}
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
                        <Link href={`/admin/shops/${row.original.id}/edit`}>
                            Edit
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href={`/admin/shops/${row.original.id}`}>
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
