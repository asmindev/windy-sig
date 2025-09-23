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
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { Search, X } from 'lucide-react';
import { useState } from 'react';
import ProductService from '../services/ProductService';
import DataTablePagination from './DataTablePagination';

/**
 * Advanced DataTable component with sorting, filtering, and pagination
 * @param {Object} props
 * @param {Array} props.columns - Table column definitions
 * @param {Array} props.data - Table data
 * @param {Object} props.paginationData - Laravel pagination data
 * @param {Function} props.onSearch - Search handler
 * @param {Function} props.onClearSearch - Clear search handler
 * @param {string} props.initialSearchValue - Initial search value
 * @param {string} props.searchPlaceholder - Search input placeholder
 */
export default function ProductDataTable({
    columns,
    data,
    paginationData,
    onSearch,
    onClearSearch,
    initialSearchValue = '',
    searchPlaceholder = 'Search...',
}) {
    const [sorting, setSorting] = useState([]);
    const [columnFilters, setColumnFilters] = useState([]);
    const [columnVisibility, setColumnVisibility] = useState({});
    const [rowSelection, setRowSelection] = useState({});
    const [globalFilter, setGlobalFilter] = useState(initialSearchValue);

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: 'includesString',
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            globalFilter,
        },
        initialState: {
            pagination: {
                pageSize: 10,
            },
        },
    });

    const handleSearch = (e) => {
        e.preventDefault();
        if (onSearch) {
            onSearch(globalFilter);
        }
    };

    const handleClearSearch = () => {
        setGlobalFilter('');
        if (onClearSearch) {
            onClearSearch();
        }
    };

    return (
        <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex items-center justify-between">
                <form
                    onSubmit={handleSearch}
                    className="flex max-w-sm flex-1 gap-4"
                >
                    <div className="relative flex-1">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder={searchPlaceholder}
                            value={globalFilter}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Button type="submit">Search</Button>
                    {(globalFilter || initialSearchValue) && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClearSearch}
                        >
                            <X className="mr-2 h-4 w-4" />
                            Clear
                        </Button>
                    )}
                </form>

                {/* Per Page Selector */}
                {paginationData && (
                    <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium">Rows per page</p>
                        <Select
                            value={paginationData.per_page?.toString()}
                            onValueChange={(value) =>
                                ProductService.changePerPage(parseInt(value))
                            }
                        >
                            <SelectTrigger className="h-8 w-[70px]">
                                <SelectValue
                                    placeholder={paginationData.per_page}
                                />
                            </SelectTrigger>
                            <SelectContent side="top">
                                {[5, 10, 15, 20, 50].map((pageSize) => (
                                    <SelectItem
                                        key={pageSize}
                                        value={pageSize.toString()}
                                    >
                                        {pageSize}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : typeof header.column.columnDef
                                                        .header === 'function'
                                                  ? header.column.columnDef.header(
                                                        header.getContext(),
                                                    )
                                                  : header.column.columnDef
                                                        .header}
                                        </TableHead>
                                    );
                                })}
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
                                                cell.getContext(),
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
                                    No results found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {paginationData && (
                <DataTablePagination
                    table={table}
                    data={paginationData}
                    onPageChange={(page) => ProductService.navigateToPage(page)}
                />
            )}
        </div>
    );
}
