'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Layers, Search } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
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

const subjectSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
});

type SubjectFormValues = z.infer<typeof subjectSchema>;

export default function SubjectsPage() {
    const t = useTranslations('admin.catalog');
    const tCommon = useTranslations('common');
    const router = useRouter();
    const params = useParams();
    const locale = params.locale as string;
    const queryClient = useQueryClient();

    const [searchQuery, setSearchQuery] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const form = useForm<SubjectFormValues>({
        resolver: zodResolver(subjectSchema),
        defaultValues: {
            name: "",
        },
    });

    // Fetch Subjects
    const { data: subjects = [], isLoading } = useQuery({
        queryKey: ['subjects'],
        queryFn: () => catalogApi.getAllSubjects(),
    });

    const createMutation = useMutation({
        mutationFn: catalogApi.createSubject,
        onSuccess: () => {
            toast.success(tCommon('create'));
            form.reset({ name: "" });
            setIsDialogOpen(false);
            queryClient.invalidateQueries({ queryKey: ['subjects'] });
        },
        onError: () => {
            toast.error('Failed to create course.');
        }
    });

    const onSubmit = (values: SubjectFormValues) => {
        createMutation.mutate(values);
    };

    const filteredSubjects = subjects.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
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
                        <BreadcrumbPage>{t('subjectsTitle')}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/40 dark:bg-slate-900/40 p-6 rounded-[2rem] border border-white dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none backdrop-blur-md transition-colors duration-300">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">Courses</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-base">Manage all courses in your catalog</p>
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
                                <Plus className="me-2 h-5 w-5" /> Add Course
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[450px] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden bg-white dark:bg-slate-950">
                            <div className="bg-primary p-8 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                                <DialogTitle className="text-3xl font-black relative z-10">Add Course</DialogTitle>
                                <DialogDescription className="text-primary-foreground/90 mt-2 font-bold text-base relative z-10">
                                    Create a new course in your catalog.
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
                                                        <Input placeholder="e.g. Data Structures" {...field} className="rounded-xl h-12 border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-base font-medium" />
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
                ) : filteredSubjects.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-white/40 dark:bg-slate-900/40 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-white/5 backdrop-blur-sm">
                        <div className="bg-primary/5 w-20 h-20 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 transform rotate-12">
                            <Layers className="h-10 w-10 text-primary" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{tCommon('noDataFound')}</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto text-base font-medium">{t('noSubjects')}</p>
                    </div>
                ) : (
                    filteredSubjects.map((subject) => (
                        <CatalogCard
                            key={subject.id}
                            title={subject.name}
                            count={subject._count?.courses || 0}
                            countLabel="Courses"
                            onManage={() => router.push(`/${locale}/admin/courses?subjectId=${subject.id}`)}
                            icon={<Layers className="h-8 w-8 text-primary/60" />}
                        />
                    ))
                )}
            </div>

        </div>
    );
}
