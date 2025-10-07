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
import { LogIn, LogOut, MapPin, ShoppingBag, Store, User } from 'lucide-react';

export default function UserSidebar({ children }) {
    const { auth } = usePage().props;
    const { url } = usePage();

    const navigation = [
        {
            name: 'Peta',
            href: '/',
            icon: MapPin,
            description: 'Temukan toko terdekat',
        },
        {
            name: 'Cari Toko',
            href: '/shops',
            icon: Store,
            description: 'Jelajahi semua toko',
        },
    ];

    const isActive = (href) => {
        if (href === '/') {
            return url === '/';
        }
        return url.startsWith(href);
    };

    return (
        <div className="flex min-h-screen bg-background">
            {/* Sidebar */}
            <Sidebar className="border-r">
                <SidebarHeader className="border-b">
                    <div className="flex flex-col items-center gap-3 p-6">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
                            <ShoppingBag className="h-8 w-8 text-white" />
                        </div>
                        <div className="text-center">
                            <h1 className="text-xl font-bold text-primary">
                                Toko Oleh-oleh
                            </h1>
                            <p className="text-xs text-muted-foreground">
                                Temukan oleh-oleh favoritmu
                            </p>
                        </div>
                    </div>
                </SidebarHeader>

                <SidebarContent className="px-3 py-4">
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu className="space-y-2">
                                {navigation.map((item) => {
                                    const active = isActive(item.href);
                                    return (
                                        <SidebarMenuItem key={item.name}>
                                            <SidebarMenuButton
                                                asChild
                                                className={`group relative h-auto overflow-hidden p-0 transition-all duration-200 ${
                                                    active
                                                        ? 'bg-primary text-primary-foreground shadow-md hover:bg-primary/90'
                                                        : 'hover:bg-accent'
                                                }`}
                                            >
                                                <Link
                                                    href={item.href}
                                                    className="flex w-full items-center gap-3 px-3 py-3"
                                                >
                                                    <div
                                                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg transition-colors ${
                                                            active
                                                                ? 'bg-white/20'
                                                                : 'bg-primary/10 group-hover:bg-primary/20'
                                                        }`}
                                                    >
                                                        <item.icon
                                                            className={`h-5 w-5 ${
                                                                active
                                                                    ? 'text-white'
                                                                    : 'text-primary'
                                                            }`}
                                                        />
                                                    </div>
                                                    <div className="flex flex-1 flex-col">
                                                        <span className="text-sm font-medium">
                                                            {item.name}
                                                        </span>
                                                        <span
                                                            className={`text-xs ${
                                                                active
                                                                    ? 'text-primary-foreground/80'
                                                                    : 'text-muted-foreground'
                                                            }`}
                                                        >
                                                            {item.description}
                                                        </span>
                                                    </div>
                                                    {active && (
                                                        <div className="absolute top-0 right-0 h-full w-1 bg-white/40" />
                                                    )}
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    );
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>

                <SidebarFooter className="border-t p-4">
                    {!auth.user ? (
                        <div className="space-y-2">
                            <div className="rounded-lg bg-primary/5 p-3 text-center">
                                <p className="mb-2 text-xs text-muted-foreground">
                                    Masuk untuk pengalaman lebih baik
                                </p>
                            </div>
                            <Button
                                asChild
                                className="w-full shadow-md transition-all hover:shadow-lg"
                            >
                                <Link
                                    href="/login"
                                    className="flex items-center justify-center gap-2"
                                >
                                    <LogIn className="h-4 w-4" />
                                    Masuk
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 rounded-lg bg-accent/50 p-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
                                    <User className="h-5 w-5" />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="truncate text-sm font-medium">
                                        {auth.user.name}
                                    </p>
                                    <p className="truncate text-xs text-muted-foreground">
                                        {auth.user.email}
                                    </p>
                                </div>
                            </div>
                            <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="w-full border-destructive/20 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                            >
                                <Link
                                    href="/logout"
                                    method="post"
                                    className="flex items-center justify-center gap-2"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Logout
                                </Link>
                            </Button>
                        </div>
                    )}
                </SidebarFooter>
            </Sidebar>
        </div>
    );
}
