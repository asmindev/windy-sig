import AdminSidebar from '@/components/admin-sidebar';
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar';

export default function AdminLayout({ user, header, children }) {
    return (
        <SidebarProvider>
            <AdminSidebar user={user} />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="-ml-1" />
                    <div className="flex-1">{header}</div>
                </header>
                <main className="p-2">{children}</main>
            </SidebarInset>
        </SidebarProvider>
    );
}
