'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, GraduationCap, Search } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { catalogApi, type University } from '@/lib/api/catalog';
import { toast } from 'sonner';
import { CatalogCard } from '@/components/admin/catalog/CatalogCard';
import { CatalogCardSkeleton } from '@/components/admin/catalog/CatalogSkeleton';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

const universitySchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    logo: z.string().optional().nullable(),
});

type UniversityFormValues = z.infer<typeof universitySchema>;

function getErrorMessage(error: unknown, fallback: string): string {
    if (typeof error === 'object' && error !== null) {
        const maybeError = error as any;
        const apiMessage = maybeError?.response?.data?.message;
        if (typeof apiMessage === 'string' && apiMessage.trim().length > 0) {
            return apiMessage;
        }
        if (typeof maybeError?.message === 'string' && maybeError.message.trim().length > 0) {
            return maybeError.message;
        }
    }

    return fallback;
}

export default function UniversitiesPage() {
    const t = useTranslations('admin.catalog');
    const tCommon = useTranslations('common');
    const router = useRouter();
    const params = useParams();
    const locale = params.locale as string;

    const [universities, setUniversities] = useState<University[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingUniversityId, setDeletingUniversityId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const form = useForm<UniversityFormValues>({
        resolver: zodResolver(universitySchema),
        defaultValues: {
            name: "",
            logo: "",
        },
    });

    const fetchUniversities = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await catalogApi.getUniversities();
            setUniversities(response || []);
        } catch (error) {
            toast.error(tCommon('noData'));
        } finally {
            setIsLoading(false);
        }
    }, [tCommon]);

    useEffect(() => {
        fetchUniversities();
    }, [fetchUniversities]);

    const onSubmit = async (values: UniversityFormValues) => {
        setIsSubmitting(true);
        try {
            // 1. Create university first
            const apiResponse = await catalogApi.createUniversity({
                name: values.name,
                logo: "" // Initially empty
            });
            
            const newUniversity = apiResponse as unknown as University;
            const newId = newUniversity?.id;
            let logoUploadFailed = false;

            // 2. Upload logo in a separate error boundary so create success is not masked
            if (newId && selectedFile) {
                try {
                    await catalogApi.uploadUniversityLogo(newId, selectedFile);
                } catch {
                    logoUploadFailed = true;
                }
            }

            if (logoUploadFailed) {
                toast.warning(
                    locale === 'ar'
                        ? 'تم إنشاء الجامعة، لكن فشل رفع الشعار.'
                        : 'University was created, but logo upload failed.'
                );
            } else {
                toast.success(tCommon('create'));
            }

            form.reset();
            setSelectedFile(null); // Reset file
            setIsDialogOpen(false);
            fetchUniversities();
        } catch (error) {
            toast.error(
                getErrorMessage(
                    error,
                    locale === 'ar' ? 'فشل إنشاء الجامعة.' : 'Failed to create university.'
                )
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteUniversity = async (university: University) => {
        const confirmMessage = locale === 'ar'
            ? `هل أنت متأكد من حذف جامعة "${university.name}" وكل ما يرتبط بها؟ لا يمكن التراجع عن هذا الإجراء.`
            : `Are you sure you want to delete "${university.name}" and all related data? This action cannot be undone.`;

        if (!window.confirm(confirmMessage)) {
            return;
        }

        setDeletingUniversityId(university.id);
        try {
            await catalogApi.deleteUniversity(university.id);
            toast.success(locale === 'ar' ? 'تم حذف الجامعة بنجاح.' : 'University deleted successfully.');
            await fetchUniversities();
        } catch (error) {
            toast.error(
                getErrorMessage(
                    error,
                    locale === 'ar' ? 'فشل حذف الجامعة.' : 'Failed to delete university.'
                )
            );
        } finally {
            setDeletingUniversityId(null);
        }
    };

    const filteredUniversities = universities.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 pb-10 max-w-7xl mx-auto">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href={`/${locale}/admin`}>{tCommon('manage')}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>{t('universitiesTitle')}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/40 dark:bg-slate-900/40 p-6 rounded-[2rem] border border-white dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none backdrop-blur-md">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">{t('universitiesTitle')}</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-base">{t('universitiesDesc')}</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative group w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 rtl:left-auto rtl:right-3 group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder={tCommon('search')}
                            className="ps-10 rtl:pe-10 bg-white/80 dark:bg-white/5 border-slate-200 dark:border-white/10 focus:bg-white dark:focus:bg-white/10 transition-all rounded-xl h-11 shadow-sm text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="rounded-xl shadow-lg shadow-primary/20 px-6 font-bold h-11 text-base hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95">
                                <Plus className="me-2 h-5 w-5" /> {t('addUniversity')}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[450px] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden bg-white dark:bg-slate-950">
                            <div className="bg-primary p-8 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                                <DialogTitle className="text-3xl font-black relative z-10">{t('addUniversity')}</DialogTitle>
                                <DialogDescription className="text-primary-foreground/90 mt-2 font-bold text-base relative z-10">
                                    Expand your educational network.
                                </DialogDescription>
                            </div>
                            <div className="p-8">
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-slate-900 dark:text-slate-200 font-bold text-xs uppercase tracking-widest">{t('name')}</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g. Damascus University" {...field} className="rounded-xl h-12 border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-base font-medium" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="space-y-4">
                                            <div className="space-y-4">
                                                <FormLabel className="text-slate-900 dark:text-slate-200 font-bold text-xs uppercase tracking-widest">{t('logo')}</FormLabel>
                                                
                                                {!selectedFile ? (
                                                    <div className="relative">
                                                        <Input
                                                            id="file-upload"
                                                            type="file"
                                                            accept="image/png, image/jpeg, image/webp"
                                                            className="hidden"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    if (file.size > 2 * 1024 * 1024) {
                                                                        toast.error('File size must be less than 2MB');
                                                                        e.target.value = '';
                                                                        return;
                                                                    }
                                                                    setSelectedFile(file);
                                                                    form.setValue('logo', '');
                                                                }
                                                            }}
                                                        />
                                                        <label 
                                                            htmlFor="file-upload"
                                                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                                        >
                                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                                <svg className="w-8 h-8 mb-3 text-slate-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                                                                </svg>
                                                                <p className="text-sm text-slate-500 font-medium">{t('uploadLogo')}</p>
                                                                <p className="text-xs text-slate-400 mt-1">SVG, PNG, JPG (MAX. 2MB)</p>
                                                            </div>
                                                        </label>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 rounded-xl group relative">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                                                <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100">{selectedFile.name}</p>
                                                                <p className="text-xs text-emerald-600 dark:text-emerald-400">{(selectedFile.size / 1024).toFixed(0)} KB</p>
                                                            </div>
                                                        </div>
                                                        <button 
                                                            type="button" 
                                                            onClick={() => setSelectedFile(null)}
                                                            className="p-2 hover:bg-white/50 dark:hover:bg-black/20 rounded-full transition-colors text-emerald-700 dark:text-emerald-300"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <DialogFooter className="pt-4">
                                            <Button type="submit" disabled={isSubmitting} className="w-full rounded-xl font-black h-14 text-lg shadow-xl shadow-primary/10 transition-all hover:scale-[1.02]">
                                                {isSubmitting ? tCommon('loading') : tCommon('create')}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </Form>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {isLoading ? (
                    Array.from({ length: 8 }).map((_, i) => <CatalogCardSkeleton key={i} />)
                ) : filteredUniversities.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-white/40 dark:bg-slate-900/40 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-white/5 backdrop-blur-sm">
                        <div className="bg-primary/5 w-20 h-20 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 transform rotate-12">
                            <GraduationCap className="h-10 w-10 text-primary" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{tCommon('noDataFound')}</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto text-base font-medium">{t('noUniversities')}</p>
                    </div>
                ) : (
                    filteredUniversities.map((uni) => (
                        <CatalogCard
                            key={uni.id}
                            title={uni.name}
                            image={uni.logo}
                            onDelete={() => handleDeleteUniversity(uni)}
                            isDeleting={deletingUniversityId === uni.id}
                            onManage={() => router.push(`/${locale}/admin/catalog/universities/${uni.id}`)}
                            icon={<GraduationCap className="h-8 w-8 text-primary/60" />}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

