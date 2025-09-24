import { Button } from '@/components/ui/button';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Link, usePage } from '@inertiajs/react';
import { LogIn, LogOut, MapPin, Store, UserPlus } from 'lucide-react';

export default function UserSidebar({ children }) {
    const { auth } = usePage().props;
    const navigation = [
        { name: 'Cari Toko', href: '/shops', icon: Store },
        { name: 'Peta', href: '/', icon: MapPin },
        ...(!auth.user
            ? []
            : [{ name: 'Dashboard', href: '/dashboard', icon: Store }]),
    ];

    return (
        <div className="flex min-h-screen bg-background">
            {/* Sidebar */}
            <Sidebar>
                <SidebarHeader>
                    <div className="flex min-h-24 w-full items-center justify-center rounded-md bg-gray-100 p-1">
                        <h1 className="text-center text-4xl font-bold text-primary">
                            Toko Oleh-oleh
                        </h1>
                    </div>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {navigation.map((item) => (
                                    <SidebarMenuItem key={item.name}>
                                        <SidebarMenuButton asChild>
                                            <Link
                                                href={item.href}
                                                className="flex items-center gap-2"
                                            >
                                                <item.icon className="h-4 w-4" />
                                                <span>{item.name}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
                <SidebarFooter>
                    <div className="flex flex-col gap-2 p-2">
                        {!auth.user ? (
                            <div className="grid grid-cols-2 gap-2">
                                <Button asChild variant="outline" size="sm">
                                    <Link
                                        href="/login"
                                        className="flex items-center gap-2"
                                    >
                                        <LogIn className="h-4 w-4" /> Masuk
                                    </Link>
                                </Button>
                                <Button asChild size="sm">
                                    <Link
                                        href="/register"
                                        className="flex items-center gap-2"
                                    >
                                        <UserPlus className="h-4 w-4" /> Daftar
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <Button
                                asChild
                                variant="destructive"
                                size="sm"
                                method="post"
                                href="/logout"
                            >
                                <Link className="flex items-center gap-2">
                                    <LogOut className="h-4 w-4" /> Logout
                                </Link>
                            </Button>
                        )}
                    </div>
                </SidebarFooter>
            </Sidebar>
        </div>
    );
}
