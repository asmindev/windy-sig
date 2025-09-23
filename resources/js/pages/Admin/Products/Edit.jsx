import { Badge } from '@/components/ui/badge';
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
    getEditDefaultValues,
    productFormSchema,
    transformFormData,
} from './schemas/productFormSchema';
import ProductService from './services/ProductService';

export default function ProductEdit({ auth, product, shops }) {
    const form = useForm({
        resolver: zodResolver(productFormSchema),
        defaultValues: getEditDefaultValues(product),
    });

    const onSubmit = (values) => {
        const formData = transformFormData(values);
        formData.append('_method', 'PUT');

        router.post(route('admin.products.update', product.id), formData, {
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

    const formatPrice = (price) => ProductService.formatPrice(price);

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
                    <div>
                        <h2 className="text-xl font-semibold text-foreground">
                            Edit Produk
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {product.name}
                        </p>
                    </div>
                </div>
            }
        >
            <div className="py-6">
                <div className="w-full space-y-6">
                    {/* Informasi Saat Ini */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span className="flex items-center">
                                    <Package className="mr-2 h-5 w-5" />
                                    Informasi Saat Ini
                                </span>
                                <div className="flex items-center gap-2">
                                    {product.type && (
                                        <Badge variant="outline">
                                            {product.type}
                                        </Badge>
                                    )}
                                    <Badge className="bg-green-100 text-green-800">
                                        {formatPrice(product.price)}
                                    </Badge>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                                <div>
                                    <strong>Toko:</strong>{' '}
                                    {product.shop?.name || 'Tidak diketahui'}
                                </div>
                                <div>
                                    <strong>Nama:</strong> {product.name}
                                </div>
                                {product.description && (
                                    <div className="md:col-span-2">
                                        <strong>Deskripsi:</strong>{' '}
                                        {product.description}
                                    </div>
                                )}
                                {product.image && (
                                    <div className="md:col-span-2">
                                        <strong>Gambar:</strong> {product.image}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Form Edit */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Package className="mr-2 h-5 w-5" />
                                Ubah Informasi Produk
                            </CardTitle>
                            <CardDescription>
                                Update detail produk sesuai kebutuhan
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <Form {...form}>
                                <form
                                    onSubmit={form.handleSubmit(onSubmit)}
                                    className="space-y-6"
                                >
                                    <div className="grid grid-cols-1 items-baseline gap-6 md:grid-cols-2">
                                        {/* Pilih Toko */}
                                        <FormField
                                            control={form.control}
                                            name="shop_id"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Toko</FormLabel>
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
                                                        Pilih toko tempat produk
                                                        ini akan dijual
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
                                                <FormItem className="md:col-span-2">
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

                                        {/* Gambar Produk */}
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
                                                <FormItem className="md:col-span-2">
                                                    <FormLabel>
                                                        Gambar Produk
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
                                                        Kosongkan jika tidak
                                                        ingin mengubah
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* Tombol Aksi */}
                                    <div className="flex justify-end gap-3 pt-6">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            asChild
                                        >
                                            <Link
                                                href={ProductService.getRouteUrl(
                                                    'index',
                                                )}
                                            >
                                                Batal
                                            </Link>
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={
                                                form.formState.isSubmitting
                                            }
                                            className="min-w-[140px]"
                                        >
                                            {form.formState.isSubmitting ? (
                                                'Menyimpan...'
                                            ) : (
                                                <>
                                                    <Save className="mr-2 h-4 w-4" />
                                                    Simpan Perubahan
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
