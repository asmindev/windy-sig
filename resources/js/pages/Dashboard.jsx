import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import UserLayout from '@/layouts/UserLayout';
import { Link } from '@inertiajs/react';
import { Activity, MapPin, Package, Store, TrendingUp } from 'lucide-react';

export default function Dashboard({ auth, stats }) {
    const { user } = auth;

    return (
        <UserLayout
            user={auth.user}
            header={
                <h2 className="text-xl leading-tight font-semibold text-foreground">
                    Dashboard - Selamat datang, {user.name}!
                </h2>
            }
        >
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Welcome Section */}
                    <div className="mb-8 overflow-hidden bg-card shadow-sm sm:rounded-lg">
                        <div className="p-6 text-card-foreground">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="mb-2 text-2xl font-bold text-foreground">
                                        SIG Toko Oleh-Oleh Kendari
                                    </h1>
                                    <p className="text-muted-foreground">
                                        Sistem Informasi Geografis untuk
                                        pencarian toko oleh-oleh di Kota Kendari
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-muted-foreground">
                                        Role:
                                    </p>
                                    <span
                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                            user.role === 'admin'
                                                ? 'bg-primary/10 text-primary'
                                                : 'bg-secondary/10 text-secondary-foreground'
                                        }`}
                                    >
                                        {user.role === 'admin'
                                            ? 'Administrator'
                                            : 'User'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Jelajahi Peta
                                </CardTitle>
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <Button asChild className="w-full">
                                    <Link href="/shops/map">
                                        Lihat Peta Toko
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Daftar Toko
                                </CardTitle>
                                <Store className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <Button
                                    asChild
                                    variant="outline"
                                    className="w-full"
                                >
                                    <Link href="/shops">Lihat Semua Toko</Link>
                                </Button>
                            </CardContent>
                        </Card>

                        {user.role === 'admin' && (
                            <>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            Kelola Toko
                                        </CardTitle>
                                        <Store className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <Button
                                            asChild
                                            variant="outline"
                                            className="w-full"
                                        >
                                            <Link href="/admin">
                                                Panel Admin
                                            </Link>
                                        </Button>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            Kelola Produk
                                        </CardTitle>
                                        <Package className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <Button
                                            asChild
                                            variant="outline"
                                            className="w-full"
                                        >
                                            <Link href="/admin/products/create">
                                                Tambah Produk
                                            </Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            </>
                        )}
                    </div>

                    {/* Statistics */}
                    {stats && (
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
                                        {stats.shops_count || 0}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Toko terdaftar di sistem
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
                                        {stats.products_count || 0}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Produk tersedia
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Total Pencarian
                                    </CardTitle>
                                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {stats.searches_count || 0}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Pencarian dilakukan
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Status Sistem
                                    </CardTitle>
                                    <Activity className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-primary">
                                        Online
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Sistem berjalan normal
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Feature Information */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Fitur Utama</CardTitle>
                                <CardDescription>
                                    Fitur-fitur yang tersedia dalam sistem
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center space-x-3">
                                    <MapPin className="h-5 w-5 text-primary" />
                                    <div>
                                        <h4 className="font-medium">
                                            Peta Interaktif
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                            Lihat lokasi toko pada peta dengan
                                            marker yang informatif
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Store className="h-5 w-5 text-secondary" />
                                    <div>
                                        <h4 className="font-medium">
                                            Pencarian Toko
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                            Cari toko berdasarkan nama, alamat,
                                            atau jenis produk
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <TrendingUp className="h-5 w-5 text-accent" />
                                    <div>
                                        <h4 className="font-medium">
                                            Optimasi Rute
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                            Dapatkan rute optimal untuk
                                            mengunjungi beberapa toko
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Panduan Penggunaan</CardTitle>
                                <CardDescription>
                                    Langkah-langkah menggunakan sistem
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-start space-x-3">
                                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                                        1
                                    </span>
                                    <div>
                                        <h4 className="font-medium">
                                            Klik "Lihat Peta Toko"
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                            Mulai dengan melihat lokasi toko
                                            pada peta interaktif
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                                        2
                                    </span>
                                    <div>
                                        <h4 className="font-medium">
                                            Aktifkan "Rencanakan Rute"
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                            Pilih beberapa toko untuk
                                            mendapatkan rute optimal
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                                        3
                                    </span>
                                    <div>
                                        <h4 className="font-medium">
                                            Lihat Detail Toko
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                            Klik pada marker untuk melihat
                                            informasi lengkap toko
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </UserLayout>
    );
}
