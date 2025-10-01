import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/AdminLayout';
import { route } from '@/ziggy-config';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from '@inertiajs/react';
import { ArrowLeft, Package, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import {
    getCreateDefaultValues,
    productFormSchema,
    transformFormData,
} from './schemas/productFormSchema';
import ProductService from './services/ProductService';

export default function ProductCreate({ auth, shops, categories }) {
    const form = useForm({
        resolver: zodResolver(productFormSchema),
        defaultValues: getCreateDefaultValues(),
    });

    const onSubmit = (values) => {
        const formData = transformFormData(values);

        router.post(route('admin.products.store'), formData, {
            onSuccess: () => {
                ProductService.navigateToIndex();
            },
            onError: (errors) => {
                Object.keys(errors).forEach((key) => {
                    form.setError(key, { message: errors[key] });
                });
            },
        });
    };

    return (
        <AdminLayout
            user={auth.user}
            header={
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={ProductService.getRouteUrl('index')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h2 className="text-xl font-semibold text-foreground">
                        Tambah Produk Baru
                    </h2>
                </div>
            }
        >
            <div className="px-4 py-6">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Left Column - Form */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Package className="mr-2 h-5 w-5" />
                                    Informasi Produk
                                </CardTitle>
                                <CardDescription>
                                    Isi detail produk yang akan ditambahkan ke
                                    toko
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <Form {...form}>
                                    <form
                                        onSubmit={form.handleSubmit(onSubmit)}
                                        className="space-y-6"
                                    >
                                        <div className="space-y-6">
                                            {/* Pilih Toko */}
                                            <FormField
                                                control={form.control}
                                                name="shop_id"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Toko
                                                        </FormLabel>
                                                        <Select
                                                            onValueChange={
                                                                field.onChange
                                                            }
                                                            defaultValue={
                                                                field.value
                                                            }
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger className="w-full">
                                                                    <SelectValue placeholder="Pilih toko" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {shops.map(
                                                                    (shop) => (
                                                                        <SelectItem
                                                                            key={
                                                                                shop.id
                                                                            }
                                                                            value={shop.id.toString()}
                                                                        >
                                                                            {
                                                                                shop.name
                                                                            }
                                                                        </SelectItem>
                                                                    ),
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormDescription className="text-sm text-muted-foreground">
                                                            Pilih toko tempat
                                                            produk ini akan
                                                            dijual
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Pilih Kategori */}
                                            <FormField
                                                control={form.control}
                                                name="category_id"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Kategori
                                                        </FormLabel>
                                                        <Select
                                                            onValueChange={
                                                                field.onChange
                                                            }
                                                            defaultValue={
                                                                field.value
                                                            }
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger className="w-full">
                                                                    <SelectValue placeholder="Pilih kategori (opsional)" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {categories.map(
                                                                    (
                                                                        category,
                                                                    ) => (
                                                                        <SelectItem
                                                                            key={
                                                                                category.id
                                                                            }
                                                                            value={category.id.toString()}
                                                                        >
                                                                            {
                                                                                category.name
                                                                            }
                                                                        </SelectItem>
                                                                    ),
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormDescription className="text-sm text-muted-foreground">
                                                            Pilih kategori
                                                            produk (opsional)
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Nama Produk */}
                                            <FormField
                                                control={form.control}
                                                name="name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Nama Produk
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                className="w-full"
                                                                placeholder="Masukkan nama produk"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Jenis Produk */}
                                            <FormField
                                                control={form.control}
                                                name="type"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Jenis Produk
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                className="w-full"
                                                                placeholder="Contoh: Makanan, Kerajinan"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormDescription className="text-sm text-muted-foreground">
                                                            Opsional
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Harga */}
                                            <FormField
                                                control={form.control}
                                                name="price"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Harga (IDR)
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                className="w-full"
                                                                placeholder="Masukkan harga produk"
                                                                min="0"
                                                                step="1000"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormDescription className="text-sm text-muted-foreground">
                                                            Dalam Rupiah
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Deskripsi */}
                                            <FormField
                                                control={form.control}
                                                name="description"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Deskripsi
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Textarea
                                                                className="min-h-[100px] w-full"
                                                                placeholder="Deskripsi produk (opsional)"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Tips & Image Upload */}
                    <div className="space-y-6">
                        {/* Tips Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Package className="mr-2 h-5 w-5" />
                                    Tips Menambah Produk
                                </CardTitle>
                                <CardDescription>
                                    Panduan untuk mengisi informasi produk
                                    dengan baik
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <strong>Nama Produk:</strong>
                                        <p className="text-muted-foreground">
                                            Gunakan nama yang jelas dan mudah
                                            dipahami pembeli
                                        </p>
                                    </div>
                                    <div>
                                        <strong>Kategori:</strong>
                                        <p className="text-muted-foreground">
                                            Pilih kategori yang sesuai untuk
                                            memudahkan pencarian
                                        </p>
                                    </div>
                                    <div>
                                        <strong>Harga:</strong>
                                        <p className="text-muted-foreground">
                                            Pastikan harga sesuai dengan
                                            kualitas dan pasaran
                                        </p>
                                    </div>
                                    <div>
                                        <strong>Deskripsi:</strong>
                                        <p className="text-muted-foreground">
                                            Jelaskan keunikan, bahan, dan
                                            keunggulan produk
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Upload Gambar Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Gambar Produk</CardTitle>
                                <CardDescription>
                                    Upload gambar yang menarik untuk produk Anda
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Form {...form}>
                                    <FormField
                                        control={form.control}
                                        name="image"
                                        render={({
                                            field: {
                                                onChange,
                                                value,
                                                ...field
                                            },
                                        }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Upload Gambar
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="file"
                                                        className="w-full"
                                                        accept="image/*"
                                                        onChange={(e) =>
                                                            onChange(
                                                                e.target
                                                                    .files[0],
                                                            )
                                                        }
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription className="text-sm text-muted-foreground">
                                                    Format: JPG, PNG, GIF (Max:
                                                    2MB). Gambar berkualitas
                                                    baik akan menarik lebih
                                                    banyak pembeli.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </Form>
                            </CardContent>
                        </Card>

                        {/* Tombol Aksi - Right column for desktop, hidden on mobile */}
                        <div className="hidden justify-end gap-3 lg:flex">
                            <Button type="button" variant="outline" asChild>
                                <Link
                                    href={ProductService.getRouteUrl('index')}
                                >
                                    Batal
                                </Link>
                            </Button>
                            <Button
                                type="submit"
                                disabled={form.formState.isSubmitting}
                                className="min-w-[140px]"
                                onClick={form.handleSubmit(onSubmit)}
                            >
                                {form.formState.isSubmitting ? (
                                    'Menyimpan...'
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Simpan Produk
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Tombol Aksi - Bottom for mobile, hidden on desktop */}
                <div className="flex justify-end gap-3 lg:hidden">
                    <Button type="button" variant="outline" asChild>
                        <Link href={ProductService.getRouteUrl('index')}>
                            Batal
                        </Link>
                    </Button>
                    <Button
                        type="submit"
                        disabled={form.formState.isSubmitting}
                        className="min-w-[140px]"
                        onClick={form.handleSubmit(onSubmit)}
                    >
                        {form.formState.isSubmitting ? (
                            'Menyimpan...'
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Simpan Produk
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </AdminLayout>
    );
}
