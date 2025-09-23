import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Link, usePage } from '@inertiajs/react';
import {
    Home,
    LogOut,
    MapPin,
    Menu,
    Package,
    Settings,
    Store,
    User,
} from 'lucide-react';
import { useState } from 'react';

export default function AuthenticatedLayout({ user, header, children }) {
    const { url } = usePage();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navigation = [
        {
            name: 'Dashboard',
            href: '/dashboard',
            icon: Home,
            current: url === '/dashboard',
        },
        {
            name: 'Peta Toko',
            href: '/shops/map',
            icon: MapPin,
            current: url === '/shops/map',
        },
        {
            name: 'Daftar Toko',
            href: '/shops',
            icon: Store,
            current: url.startsWith('/shops') && url !== '/shops/map',
        },
    ];

    const adminNavigation = [
        {
            name: 'Panel Admin',
            href: '/admin',
            icon: Settings,
            current: url === '/admin',
        },
        {
            name: 'Kelola Toko',
            href: '/admin/shops',
            icon: Store,
            current: url.startsWith('/admin/shops'),
        },
        {
            name: 'Kelola Produk',
            href: '/admin/products',
            icon: Package,
            current: url.startsWith('/admin/products'),
        },
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Navigation */}
            <nav className="border-b bg-card shadow-sm">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            {/* Logo */}
                            <div className="flex flex-shrink-0 items-center">
                                <Link
                                    href="/dashboard"
                                    className="flex items-center space-x-2 text-xl font-bold text-foreground transition-colors hover:text-primary"
                                >
                                    <Home className="h-6 w-6 text-primary" />
                                    <span>SIG Toko Oleh-Oleh</span>
                                </Link>
                            </div>

                            {/* Primary Navigation */}
                            <div className="hidden space-x-8 lg:-my-px lg:ml-10 lg:flex">
                                {navigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium transition-colors ${
                                            item.current
                                                ? 'border-primary text-foreground'
                                                : 'border-transparent text-muted-foreground hover:border-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        <item.icon className="mr-2 h-4 w-4" />
                                        {item.name}
                                    </Link>
                                ))}

                                {user.role === 'admin' &&
                                    adminNavigation.map((item) => (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium transition-colors ${
                                                item.current
                                                    ? 'border-secondary text-foreground'
                                                    : 'border-transparent text-muted-foreground hover:border-muted-foreground hover:text-foreground'
                                            }`}
                                        >
                                            <item.icon className="mr-2 h-4 w-4" />
                                            {item.name}
                                        </Link>
                                    ))}
                            </div>
                        </div>

                        {/* Desktop User menu */}
                        <div className="hidden lg:ml-6 lg:flex lg:items-center">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="relative h-8 w-8 rounded-full"
                                    >
                                        <User className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    className="w-56"
                                    align="end"
                                    forceMount
                                >
                                    <div className="flex items-center justify-start gap-2 p-2">
                                        <div className="flex flex-col space-y-1 leading-none">
                                            <p className="font-medium">
                                                {user.name}
                                            </p>
                                            <p className="w-[200px] truncate text-sm text-muted-foreground">
                                                {user.email}
                                            </p>
                                            <span
                                                className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${
                                                    user.role === 'admin'
                                                        ? 'bg-secondary/10 text-secondary-foreground'
                                                        : 'bg-primary/10 text-primary'
                                                }`}
                                            >
                                                {user.role === 'admin'
                                                    ? 'Administrator'
                                                    : 'User'}
                                            </span>
                                        </div>
                                    </div>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Pengaturan</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                            className="w-full"
                                        >
                                            <LogOut className="mr-2 h-4 w-4" />
                                            <span>Keluar</span>
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Mobile menu button */}
                        <div className="flex items-center space-x-2 lg:hidden">
                            {/* Mobile User Menu */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="h-8 w-8 rounded-full"
                                    >
                                        <User className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    className="w-56"
                                    align="end"
                                    forceMount
                                >
                                    <div className="flex items-center justify-start gap-2 p-2">
                                        <div className="flex flex-col space-y-1 leading-none">
                                            <p className="font-medium">
                                                {user.name}
                                            </p>
                                            <p className="w-[200px] truncate text-sm text-muted-foreground">
                                                {user.email}
                                            </p>
                                            <span
                                                className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${
                                                    user.role === 'admin'
                                                        ? 'bg-secondary/10 text-secondary-foreground'
                                                        : 'bg-primary/10 text-primary'
                                                }`}
                                            >
                                                {user.role === 'admin'
                                                    ? 'Administrator'
                                                    : 'User'}
                                            </span>
                                        </div>
                                    </div>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Pengaturan</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                            className="w-full"
                                        >
                                            <LogOut className="mr-2 h-4 w-4" />
                                            <span>Keluar</span>
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Mobile Navigation Menu */}
                            <Sheet
                                open={isMobileMenuOpen}
                                onOpenChange={setIsMobileMenuOpen}
                            >
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                        <Menu className="h-5 w-5" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent
                                    side="right"
                                    className="w-[300px] sm:w-[400px]"
                                >
                                    <div className="mt-6 flex flex-col space-y-4">
                                        <div className="flex items-center space-x-2 border-b pb-4">
                                            <Home className="h-6 w-6 text-primary" />
                                            <span className="text-lg font-bold text-foreground">
                                                Menu Navigasi
                                            </span>
                                        </div>

                                        {navigation.map((item) => (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                onClick={() =>
                                                    setIsMobileMenuOpen(false)
                                                }
                                                className={`flex items-center space-x-3 rounded-lg p-3 transition-colors ${
                                                    item.current
                                                        ? 'bg-primary/10 text-primary'
                                                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                                                }`}
                                            >
                                                <item.icon className="h-5 w-5" />
                                                <span className="text-base">
                                                    {item.name}
                                                </span>
                                            </Link>
                                        ))}

                                        {user.role === 'admin' && (
                                            <>
                                                <div className="border-t pt-4">
                                                    <p className="mb-2 px-3 text-sm font-medium text-muted-foreground">
                                                        Admin Menu
                                                    </p>
                                                    {adminNavigation.map(
                                                        (item) => (
                                                            <Link
                                                                key={item.name}
                                                                href={item.href}
                                                                onClick={() =>
                                                                    setIsMobileMenuOpen(
                                                                        false,
                                                                    )
                                                                }
                                                                className={`flex items-center space-x-3 rounded-lg p-3 transition-colors ${
                                                                    item.current
                                                                        ? 'bg-secondary/10 text-secondary-foreground'
                                                                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                                                                }`}
                                                            >
                                                                <item.icon className="h-5 w-5" />
                                                                <span className="text-base">
                                                                    {item.name}
                                                                </span>
                                                            </Link>
                                                        ),
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <div className="sm:hidden">
                    <div className="space-y-1 pt-2 pb-3">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`block border-l-4 py-2 pr-4 pl-3 text-base font-medium transition-colors ${
                                    item.current
                                        ? 'border-primary bg-primary/5 text-primary'
                                        : 'border-transparent text-muted-foreground hover:border-muted-foreground hover:bg-muted/50 hover:text-foreground'
                                }`}
                            >
                                <div className="flex items-center">
                                    <item.icon className="mr-3 h-4 w-4" />
                                    {item.name}
                                </div>
                            </Link>
                        ))}

                        {user.role === 'admin' &&
                            adminNavigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`block border-l-4 py-2 pr-4 pl-3 text-base font-medium transition-colors ${
                                        item.current
                                            ? 'border-secondary bg-secondary/5 text-secondary-foreground'
                                            : 'border-transparent text-muted-foreground hover:border-muted-foreground hover:bg-muted/50 hover:text-foreground'
                                    }`}
                                >
                                    <div className="flex items-center">
                                        <item.icon className="mr-3 h-4 w-4" />
                                        {item.name}
                                    </div>
                                </Link>
                            ))}
                    </div>
                    <div className="border-t pt-4 pb-1">
                        <div className="px-4">
                            <div className="text-base font-medium text-foreground">
                                {user.name}
                            </div>
                            <div className="text-sm font-medium text-muted-foreground">
                                {user.email}
                            </div>
                        </div>
                        <div className="mt-3 space-y-1">
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="block px-4 py-2 text-base font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                            >
                                Keluar
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Page Heading */}
            {header && (
                <header className="border-b bg-card shadow-sm">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            {/* Page Content */}
            <main>{children}</main>
        </div>
    );
}
