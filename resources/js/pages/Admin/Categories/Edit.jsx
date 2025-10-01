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
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from '@inertiajs/react';
import { ArrowLeft, Save, Tag } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const formSchema = z.object({
    name: z.string().min(1, 'Nama kategori harus diisi'),
    description: z.string().optional(),
});

export default function CategoryEdit({ auth, category }) {
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: category.name || '',
            description: category.description || '',
        },
    });

    const onSubmit = (values) => {
        router.put(route('admin.categories.update', category.id), values, {
            onSuccess: () => {
                toast.success('Kategori berhasil diperbarui', {
                    description:
                        'Perubahan kategori telah disimpan ke dalam sistem',
                    duration: 3000,
                });
                router.visit(route('admin.categories.index'));
            },
            onError: (errors) => {
                Object.keys(errors).forEach((key) => {
                    form.setError(key, { message: errors[key] });
                });

                toast.error('Gagal memperbarui kategori', {
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
                        <Link href={route('admin.categories.index')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h2 className="text-xl font-semibold text-foreground">
                        Edit Kategori: {category.name}
                    </h2>
                </div>
            }
        >
            <div className="py-6">
                <div className="mx-auto w-full px-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Tag className="mr-2 h-5 w-5" />
                                Edit Informasi Kategori
                            </CardTitle>
                            <CardDescription>
                                Perbarui detail kategori dalam sistem
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form
                                    onSubmit={form.handleSubmit(onSubmit)}
                                    className="space-y-6"
                                >
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Nama Kategori
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Masukkan nama kategori"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Nama unik untuk kategori
                                                    produk
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
                                                <FormLabel>Deskripsi</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Deskripsi singkat tentang kategori (opsional)"
                                                        className="min-h-[80px]"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Berikan deskripsi singkat
                                                    tentang kategori ini
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
                                            <Link
                                                href={route(
                                                    'admin.categories.index',
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
                                            className="min-w-[120px]"
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
