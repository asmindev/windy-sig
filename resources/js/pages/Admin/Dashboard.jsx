import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AdminLayout from '@/layouts/AdminLayout';
import { Link } from '@inertiajs/react';
import { BarChart3, MapPin, Package, Plus, Store, Users } from 'lucide-react';

export default function AdminDashboard({ auth, stats }) {
    return (
        <AdminLayout
            user={auth.user}
            header={
                <h2 className="text-xl leading-tight font-semibold text-foreground">
                    Panel Admin - Kelola SIG Toko Oleh-Oleh
                </h2>
            }
        >
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Admin Statistics */}
                    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Toko
                                </CardTitle>
                                <Store className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {stats?.shops_count || 0}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Toko terdaftar
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Produk
                                </CardTitle>
                                <Package className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {stats?.products_count || 0}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Produk tersedia
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total User
                                </CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {stats?.users_count || 0}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    User terdaftar
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Pencarian
                                </CardTitle>
                                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {stats?.searches_count || 0}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Pencarian dilakukan
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Actions */}
                    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Store className="mr-2 h-5 w-5" />
                                    Kelola Toko
                                </CardTitle>
                                <CardDescription>
                                    Tambah, edit, atau hapus toko oleh-oleh
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button asChild className="w-full">
                                    <Link href="/admin/shops">
                                        <Store className="mr-2 h-4 w-4" />
                                        Kelola Toko
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    variant="outline"
                                    className="w-full"
                                >
                                    <Link href="/admin/shops/create">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Tambah Toko Baru
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Package className="mr-2 h-5 w-5" />
                                    Kelola Produk
                                </CardTitle>
                                <CardDescription>
                                    Tambah, edit, atau hapus produk oleh-oleh
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button asChild className="w-full">
                                    <Link href="/admin/products">
                                        <Package className="mr-2 h-4 w-4" />
                                        Kelola Produk
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    variant="outline"
                                    className="w-full"
                                >
                                    <Link href="/admin/products/create">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Tambah Produk Baru
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <MapPin className="mr-2 h-5 w-5" />
                                    Monitoring Sistem
                                </CardTitle>
                                <CardDescription>
                                    Pantau penggunaan dan performa sistem
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button
                                    asChild
                                    variant="outline"
                                    className="w-full"
                                >
                                    <Link href="/shops/map">
                                        <MapPin className="mr-2 h-4 w-4" />
                                        Lihat Peta
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    variant="outline"
                                    className="w-full"
                                >
                                    <Link href="/admin/reports">
                                        <BarChart3 className="mr-2 h-4 w-4" />
                                        Laporan
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Activity */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Toko Terbaru</CardTitle>
                                <CardDescription>
                                    Toko yang baru ditambahkan ke sistem
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {stats?.recent_shops &&
                                stats.recent_shops.length > 0 ? (
                                    <div className="space-y-3">
                                        {stats.recent_shops.map((shop) => (
                                            <div
                                                key={shop.id}
                                                className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
                                            >
                                                <div>
                                                    <h4 className="font-medium">
                                                        {shop.name}
                                                    </h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        {shop.address}
                                                    </p>
                                                </div>
                                                <Button
                                                    asChild
                                                    size="sm"
                                                    variant="outline"
                                                >
                                                    <Link
                                                        href={`/shops/${shop.id}`}
                                                    >
                                                        Lihat
                                                    </Link>
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-6 text-center text-muted-foreground">
                                        Belum ada toko yang ditambahkan
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Statistik Penggunaan</CardTitle>
                                <CardDescription>
                                    Ringkasan aktivitas pengguna
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">
                                            Pencarian Hari Ini
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            {stats?.daily_searches || 0}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">
                                            Toko Dikunjungi
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            {stats?.daily_visits || 0}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">
                                            User Aktif
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            {stats?.active_users || 0}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">
                                            Rute Dibuat
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            {stats?.routes_created || 0}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
