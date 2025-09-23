import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import DataTablePagination from '@/pages/Admin/Products/components/DataTablePagination';
import ShopService from '@/services/ShopService';
import {
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { ArrowUpDown, Search, X } from 'lucide-react';
import { useState } from 'react';

/**
 * Advanced data table for shops with search, sorting, and pagination
 * Using TanStack React Table for enhanced functionality
 */
export function ShopDataTable({
    data,
    columns,
    filters,
    pagination,
    onDelete,
}) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        manualPagination: true,
        manualSorting: true,
        pageCount: pagination.last_page,
        state: {
            pagination: {
                pageIndex: pagination.current_page - 1,
                pageSize: pagination.per_page,
            },
            sorting: filters.sort_by
                ? [
                      {
                          id: filters.sort_by,
                          desc: filters.sort_order === 'desc',
                      },
                  ]
                : [],
        },
    });

    // Handle search form submission
    const handleSearch = (e) => {
        e.preventDefault();
        ShopService.search(searchTerm, filters);
    };

    // Handle clear search
    const handleClearSearch = () => {
        setSearchTerm('');
        ShopService.clearFilters();
    };

    // Handle per page change
    const handlePerPageChange = (value) => {
        ShopService.changePerPage(parseInt(value), filters);
    };

    // Handle column sorting
    const handleSort = (column) => {
        ShopService.handleSort(column, filters);
    };

    return (
        <div className="space-y-4">
            {/* Search and Controls */}
            <div className="flex items-center justify-between gap-4">
                <form
                    onSubmit={handleSearch}
                    className="flex flex-1 items-center gap-2"
                >
                    <div className="relative max-w-sm flex-1">
                        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Cari toko..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Button type="submit" variant="secondary">
                        Cari
                    </Button>
                    {filters.search && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClearSearch}
                        >
                            <X className="mr-2 size-4" />
                            Hapus
                        </Button>
                    )}
                </form>

                {/* Per page selector */}
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Per halaman:</span>
                    <Select
                        value={String(pagination.per_page)}
                        onValueChange={handlePerPageChange}
                    >
                        <SelectTrigger className="w-20">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Data Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder ? null : (
                                            <div className="flex items-center space-x-2">
                                                {flexRender(
                                                    header.column.columnDef
                                                        .header,
                                                    header.getContext(),
                                                )}
                                                {header.column.getCanSort() && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 w-6 p-0"
                                                        onClick={() =>
                                                            handleSort(
                                                                header.column
                                                                    .id,
                                                            )
                                                        }
                                                    >
                                                        <ArrowUpDown className="h-3 w-3" />
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={
                                        row.getIsSelected() && 'selected'
                                    }
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                {
                                                    ...cell.getContext(),
                                                    onDelete,
                                                },
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    Tidak ada toko ditemukan.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <DataTablePagination
                data={pagination}
                currentPage={pagination.current_page}
                totalPages={pagination.last_page}
                totalItems={pagination.total}
                itemsPerPage={pagination.per_page}
                onPageChange={(page) =>
                    ShopService.navigateToPage(page, filters)
                }
            />
        </div>
    );
}
