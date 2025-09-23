import { Button } from '@/components/ui/button';
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from 'lucide-react';

/**
 * DataTable Pagination Component
 * @param {Object} props
 * @param {Object} props.table - TanStack table instance
 * @param {Object} props.data - Pagination data from backend
 * @param {Function} props.onPageChange - Page change handler
 */
export default function DataTablePagination({ table, data, onPageChange }) {
    const { current_page, last_page, per_page, total, from, to } = data;

    const handlePageChange = (page) => {
        if (page >= 1 && page <= last_page && page !== current_page) {
            onPageChange(page);
        }
    };

    return (
        <div className="flex items-center justify-between px-2">
            <div className="flex-1 text-sm text-muted-foreground">
                {from && to ? (
                    <>
                        Showing {from} to {to} of {total} result
                        {total !== 1 ? 's' : ''}
                    </>
                ) : (
                    'No results'
                )}
            </div>

            <div className="flex items-center space-x-6 lg:space-x-8">
                <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                    Page {current_page} of {last_page}
                </div>

                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex"
                        onClick={() => handlePageChange(1)}
                        disabled={current_page === 1}
                    >
                        <span className="sr-only">Go to first page</span>
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => handlePageChange(current_page - 1)}
                        disabled={current_page === 1}
                    >
                        <span className="sr-only">Go to previous page</span>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => handlePageChange(current_page + 1)}
                        disabled={current_page === last_page}
                    >
                        <span className="sr-only">Go to next page</span>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex"
                        onClick={() => handlePageChange(last_page)}
                        disabled={current_page === last_page}
                    >
                        <span className="sr-only">Go to last page</span>
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
