import LocationPicker from '@/components/map/LocationPickerWrapper';
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
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/AdminLayout';
import { route } from '@/ziggy-config';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from '@inertiajs/react';
import { ArrowLeft, MapPin, Save, Store } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const formSchema = z.object({
    name: z.string().min(1, 'Nama toko harus diisi'),
    address: z.string().min(1, 'Alamat harus diisi'),
    latitude: z
        .string()
        .min(1, 'Latitude harus diisi')
        .refine(
            (val) =>
                !isNaN(Number(val)) && Number(val) >= -90 && Number(val) <= 90,
            'Latitude harus berupa angka antara -90 dan 90',
        ),
    longitude: z
        .string()
        .min(1, 'Longitude harus diisi')
        .refine(
            (val) =>
                !isNaN(Number(val)) &&
                Number(val) >= -180 &&
                Number(val) <= 180,
            'Longitude harus berupa angka antara -180 dan 180',
        ),
    phone: z.string().optional(),
    operating_hours: z.string().optional(),
    description: z.string().optional(),
    rating: z
        .string()
        .optional()
        .refine(
            (val) =>
                !val ||
                (!isNaN(Number(val)) && Number(val) >= 1 && Number(val) <= 5),
            'Rating harus berupa angka antara 1 dan 5',
        ),
});

export default function ShopEdit({ auth, shop }) {
    const [selectedPosition, setSelectedPosition] = useState({
        lat: parseFloat(shop.latitude),
        lng: parseFloat(shop.longitude),
    });
    const [suggestedAddress, setSuggestedAddress] = useState(shop.address);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: shop.name,
            address: shop.address,
            latitude: shop.latitude.toString(),
            longitude: shop.longitude.toString(),
            phone: shop.phone || '',
            operating_hours: shop.operating_hours || '',
            description: shop.description || '',
            rating: shop.rating ? shop.rating.toString() : '',
        },
    });

    const handleLocationSelect = (position) => {
        setSelectedPosition(position);
        form.setValue('latitude', position.lat.toString());
        form.setValue('longitude', position.lng.toString());

        toast.success('Lokasi berhasil diperbarui', {
            description: `Koordinat: ${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`,
            duration: 3000,
        });
    };

    const handleAddressFound = (address) => {
        setSuggestedAddress(address);
        if (address && !form.getValues('address')) {
            form.setValue('address', address);
        }
    };

    const onSubmit = (values) => {
        if (!selectedPosition) {
            toast.error('Pilih lokasi toko', {
                description: 'Silakan klik pada peta untuk memilih lokasi toko',
                duration: 4000,
            });
            return;
        }

        router.put(route('admin.shops.update', shop.id), values, {
            onSuccess: () => {
                toast.success('Toko berhasil diperbarui', {
                    description:
                        'Perubahan toko telah disimpan ke dalam sistem',
                    duration: 3000,
                });
                router.visit(route('admin.shops.index'));
            },
            onError: (errors) => {
                Object.keys(errors).forEach((key) => {
                    form.setError(key, { message: errors[key] });
                });

                toast.error('Gagal menyimpan perubahan', {
                    description: 'Periksa kembali data yang dimasukkan',
                    duration: 4000,
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
                        <Link href="/admin/shops">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h2 className="text-xl font-semibold text-foreground">
                            Edit Toko
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {shop.name}
                        </p>
                    </div>
                </div>
            }
        >
            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
                        {/* Form Section */}
                        <div className="xl:order-1">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Store className="mr-2 h-5 w-5" />
                                        Ubah Informasi Toko
                                    </CardTitle>
                                    <CardDescription>
                                        Update detail toko sesuai kebutuhan
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {/* Location Status */}
                                    <div
                                        className={`mb-6 rounded-lg border p-4 ${
                                            selectedPosition
                                                ? 'border-green-200 bg-green-50'
                                                : 'border-yellow-200 bg-yellow-50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <MapPin
                                                className={`h-5 w-5 ${
                                                    selectedPosition
                                                        ? 'text-green-600'
                                                        : 'text-yellow-600'
                                                }`}
                                            />
                                            <div>
                                                <p
                                                    className={`font-medium ${
                                                        selectedPosition
                                                            ? 'text-green-900'
                                                            : 'text-yellow-900'
                                                    }`}
                                                >
                                                    {selectedPosition
                                                        ? 'Lokasi telah dipilih'
                                                        : 'Belum memilih lokasi'}
                                                </p>
                                                <p
                                                    className={`text-sm ${
                                                        selectedPosition
                                                            ? 'text-green-700'
                                                            : 'text-yellow-700'
                                                    }`}
                                                >
                                                    {selectedPosition
                                                        ? `Koordinat: ${selectedPosition.lat.toFixed(6)}, ${selectedPosition.lng.toFixed(6)}`
                                                        : 'Silakan pilih lokasi toko pada peta di sebelah kanan'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <Form {...form}>
                                        <form
                                            onSubmit={form.handleSubmit(
                                                onSubmit,
                                            )}
                                            className="space-y-6"
                                        >
                                            <FormField
                                                control={form.control}
                                                name="name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Nama Toko
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Masukkan nama toko"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="address"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Alamat
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Textarea
                                                                placeholder={
                                                                    suggestedAddress ||
                                                                    'Masukkan alamat lengkap toko'
                                                                }
                                                                className="min-h-[80px]"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormDescription>
                                                            {suggestedAddress
                                                                ? 'Alamat otomatis dari lokasi yang dipilih (dapat diedit)'
                                                                : 'Alamat lengkap dan detail lokasi toko'}
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                <FormField
                                                    control={form.control}
                                                    name="latitude"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="flex items-center gap-2">
                                                                Latitude
                                                                {selectedPosition && (
                                                                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                                                                        ✓
                                                                        Terpilih
                                                                    </span>
                                                                )}
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    step="any"
                                                                    placeholder="Pilih di peta"
                                                                    readOnly
                                                                    className="bg-gray-50"
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <FormDescription>
                                                                Otomatis terisi
                                                                dari peta
                                                            </FormDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="longitude"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="flex items-center gap-2">
                                                                Longitude
                                                                {selectedPosition && (
                                                                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                                                                        ✓
                                                                        Terpilih
                                                                    </span>
                                                                )}
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    step="any"
                                                                    placeholder="Pilih di peta"
                                                                    readOnly
                                                                    className="bg-gray-50"
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <FormDescription>
                                                                Otomatis terisi
                                                                dari peta
                                                            </FormDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                <FormField
                                                    control={form.control}
                                                    name="phone"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>
                                                                Nomor Telepon
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    placeholder="0812-3456-7890"
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <FormDescription>
                                                                Opsional
                                                            </FormDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="operating_hours"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>
                                                                Jam Operasional
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    placeholder="08:00 - 20:00"
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <FormDescription>
                                                                Opsional
                                                            </FormDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <FormField
                                                control={form.control}
                                                name="rating"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Rating
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                step="0.1"
                                                                min="1"
                                                                max="5"
                                                                placeholder="1.0 - 5.0"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormDescription>
                                                            Rating toko dalam
                                                            skala 1-5 (opsional)
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

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
                                                                placeholder="Deskripsi singkat tentang toko (opsional)"
                                                                className="min-h-[100px]"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormDescription>
                                                            Berikan deskripsi
                                                            singkat tentang
                                                            toko, spesialisasi,
                                                            atau informasi
                                                            lainnya
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <div className="flex items-center justify-between pt-6">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    asChild
                                                >
                                                    <Link href="/admin/shops">
                                                        Batal
                                                    </Link>
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    disabled={
                                                        form.formState
                                                            .isSubmitting ||
                                                        !selectedPosition
                                                    }
                                                    className="min-w-[120px]"
                                                >
                                                    {form.formState
                                                        .isSubmitting ? (
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

                        {/* Map Section */}
                        <div className="xl:order-2">
                            <Card className="sticky top-6">
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <MapPin className="mr-2 h-5 w-5" />
                                        Pilih Lokasi Toko
                                    </CardTitle>
                                    <CardDescription>
                                        Klik pada peta untuk memilih lokasi toko
                                        atau gunakan pencarian alamat
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <LocationPicker
                                        selectedPosition={selectedPosition}
                                        onLocationSelect={handleLocationSelect}
                                        onAddressFound={handleAddressFound}
                                        className="h-[650px] w-full rounded-lg"
                                        center={[
                                            parseFloat(shop.latitude),
                                            parseFloat(shop.longitude),
                                        ]}
                                        zoom={13}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
