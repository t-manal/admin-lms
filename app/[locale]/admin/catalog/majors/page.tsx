'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, BookOpen, Search } from 'lucide-react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { catalogApi } from '@/lib/api/catalog';
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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const majorSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    universityId: z.string().uuid("Please select a university"),
});

type MajorFormValues = z.infer<typeof majorSchema>;

export default function MajorsPage() {
    const t = useTranslations('admin.catalog');
    const tCommon = useTranslations('common');
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const locale = params.locale as string;
    const queryClient = useQueryClient();

    // Check if universityId is in query params for filtering
    const universityIdParam = searchParams.get('universityId') || 'all';

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterUniId, setFilterUniId] = useState(universityIdParam);

    const form = useForm<MajorFormValues>({
        resolver: zodResolver(majorSchema),
        defaultValues: {
            name: "",
            universityId: universityIdParam !== 'all' ? universityIdParam : "",
        },
    });

    // Fetch Universities (for dropdown)
    const { data: universities = [] } = useQuery({
        queryKey: ['universities'],
        queryFn: catalogApi.getUniversities,
        staleTime: 5 * 60 * 1000, // cache for 5 mins
    });

    // Fetch Majors (dependent on filter)
    const { data: majors = [], isLoading } = useQuery({
        queryKey: ['majors', filterUniId],
        queryFn: () => filterUniId !== 'all' && filterUniId
            ? catalogApi.getMajors(filterUniId)
            : catalogApi.getAllMajors(),
    });

    const createMutation = useMutation({
        mutationFn: catalogApi.createMajor,
        onSuccess: () => {
            toast.success(tCommon('create'));
            form.reset({ universityId: filterUniId !== 'all' ? filterUniId : "", name: "" });
            setIsDialogOpen(false);
            queryClient.invalidateQueries({ queryKey: ['majors'] });
            // Also invalidate university counts if necessary, but skipping for now
        },
        onError: () => {
            toast.error('Failed to create major.');
        }
    });

    const onSubmit = (values: MajorFormValues) => {
        createMutation.mutate(values);
    };

    const filteredMajors = majors.filter(m => {
        // Client-side search filtering
        const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase());
        // Double check uni filter if 'all' was fetched but client state out of sync? 
        // Logic above handles fetching right data, so this is mostly for search.
        // If 'all' is fetched, we already have all. If specific is fetched, we have specific.
        // But if we toggle filterUniId, the query updates. Use client filter just for search.
        return matchesSearch;
    });

    return (
        <div className="space-y-6 pb-10 max-w-7xl mx-auto">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href={`/${locale}/admin`}>{tCommon('manage')}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>{t('majorsTitle')}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/40 dark:bg-slate-900/40 p-6 rounded-[2rem] border border-white dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none backdrop-blur-md transition-colors duration-300">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">{t('majorsTitle')}</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-base">{t('majorsDesc')}</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <Select value={filterUniId} onValueChange={setFilterUniId}>
                        <SelectTrigger className="w-full md:w-56 h-11 rounded-xl bg-white/80 dark:bg-white/5 border-slate-200 dark:border-white/10 shadow-sm text-sm font-medium">
                            <SelectValue placeholder={t('selectUniversity')} />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-none shadow-2xl">
                            <SelectItem value="all" className="text-sm">All Universities</SelectItem>
                            {universities.map(uni => (
                                <SelectItem key={uni.id} value={uni.id} className="rounded-lg font-medium text-sm">{uni.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

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
                                <Plus className="me-2 h-5 w-5" /> {t('addMajor')}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[450px] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden bg-white dark:bg-slate-950">
                            <div className="bg-primary p-8 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                                <DialogTitle className="text-3xl font-black relative z-10">{t('addMajor')}</DialogTitle>
                                <DialogDescription className="text-primary-foreground/90 mt-2 font-bold text-base relative z-10">
                                    Categorize subjects by adding a new academic major.
                                </DialogDescription>
                            </div>
                            <div className="p-8">
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                        <FormField
                                            control={form.control}
                                            name="universityId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-slate-900 dark:text-slate-200 font-bold text-xs uppercase tracking-widest">{t('university')}</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="rounded-xl h-12 border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-base font-medium">
                                                                <SelectValue placeholder={t('selectUniversity')} />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="rounded-xl border-none shadow-2xl">
                                                            {universities.map(uni => (
                                                                <SelectItem key={uni.id} value={uni.id} className="rounded-lg font-medium text-sm">{uni.name}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-slate-900 dark:text-slate-200 font-bold text-xs uppercase tracking-widest">{t('name')}</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g. Computer Science" {...field} className="rounded-xl h-12 border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-base font-medium" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <DialogFooter className="pt-4">
                                            <Button type="submit" disabled={createMutation.isPending} className="w-full rounded-xl font-black h-14 text-lg shadow-xl shadow-primary/10 transition-all hover:scale-[1.02]">
                                                {createMutation.isPending ? tCommon('loading') : tCommon('create')}
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
                ) : filteredMajors.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-white/40 dark:bg-slate-900/40 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-white/5 backdrop-blur-sm">
                        <div className="bg-primary/5 w-20 h-20 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 transform rotate-12">
                            <BookOpen className="h-10 w-10 text-primary" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{tCommon('noDataFound')}</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto text-base font-medium">{t('noMajors')}</p>
                    </div>
                ) : (
                    filteredMajors.map((major) => (
                        <CatalogCard
                            key={major.id}
                            title={major.name}
                            tag={major.university?.name}
                            count={major._count?.subjects || 0}
                            countLabel={t('subjectsCount')}
                            onManage={() => router.push(`/${locale}/admin/catalog/subjects?majorId=${major.id}`)}
                            icon={<BookOpen className="h-8 w-8 text-primary/60" />}
                        />
                    ))
                )}
            </div>
        </div>
    );
}


