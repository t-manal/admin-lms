'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, BookOpen, MoreVertical, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardContent,
    CardFooter,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

import { instructorApi, type Course } from '@/lib/api/instructor';
import { catalogApi } from '@/lib/api/catalog';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import { CatalogCardSkeleton } from '@/components/admin/catalog/CatalogSkeleton';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function CoursesPage() {
    const t = useTranslations('admin.courses');
    const tCommon = useTranslations('common');
    const tCatalog = useTranslations('admin.catalog');
    const router = useRouter();
    const params = useParams();
    const locale = params.locale as string;
    const queryClient = useQueryClient();

    const searchParams = useSearchParams();
    const [searchQuery, setSearchQuery] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Creation Form State
    const [selectedUniId, setSelectedUniId] = useState('');
    const [newCourseTitle, setNewCourseTitle] = useState('');

    // Handle URL Params for pre-filling
    useEffect(() => {
        const createParam = searchParams.get('create');
        const uniParam = searchParams.get('universityId');
        if (createParam === 'true') {
            setIsDialogOpen(true);
            if (uniParam) {
                setSelectedUniId(uniParam);
            }
        }
    }, [searchParams]);

    // Queries
    const { data: courses = [], isLoading: isCoursesLoading } = useQuery({
        queryKey: ['my-courses'],
        queryFn: instructorApi.getMyCourses,
    });

    const { data: universities = [] } = useQuery({
        queryKey: ['universities'],
        queryFn: catalogApi.getUniversities,
        staleTime: 10 * 60 * 1000,
    });

    const createMutation = useMutation({
        mutationFn: async () => {
            return instructorApi.createCourse({
                title: newCourseTitle,
                universityId: selectedUniId || undefined,
            });
        },
        onSuccess: () => {
            toast.success(tCommon('create') + ' ' + t('title'));
            setNewCourseTitle('');
            setIsDialogOpen(false);
            queryClient.invalidateQueries({ queryKey: ['my-courses'] });
        },
        onError: () => {
            toast.error('Failed to create course');
        }
    });

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        // V2: Subject is optional if University is selected (or generally optional)
        if (!newCourseTitle || !selectedUniId) return; 
        createMutation.mutate();
    };

    const handleUniChange = (val: string) => {
        setSelectedUniId(val);
    };

    const filteredCourses = courses.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 pb-10 max-w-7xl mx-auto">
            {/* Breadcrumbs */}
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href={`/${locale}/admin`}>{tCommon('manage')}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>{t('title')}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/40 dark:bg-slate-900/40 p-6 rounded-[2rem] border border-white dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none backdrop-blur-md transition-colors duration-300">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">{t('title')}</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-base">{t('subtitle')}</p>
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
                                <Plus className="me-2 h-5 w-5" /> {t('create')}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden bg-white dark:bg-slate-950">
                            <div className="bg-primary p-8 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                                <DialogTitle className="text-3xl font-black relative z-10">{t('createTitle')}</DialogTitle>
                                <DialogDescription className="text-primary-foreground/90 mt-2 font-bold text-base relative z-10">
                                    {t('createDesc')}
                                </DialogDescription>
                            </div>
                            <div className="p-8">
                                <form onSubmit={handleCreate} className="space-y-5">
                                    <div className="grid gap-5">
                                        <div className="space-y-2">
                                            <Label className="text-slate-900 dark:text-slate-200 font-bold text-xs uppercase tracking-widest">{tCatalog('selectUniversity')}</Label>
                                            <Select onValueChange={handleUniChange} value={selectedUniId}>
                                                <SelectTrigger className="rounded-xl h-12 border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-base font-medium">
                                                    <SelectValue placeholder={tCatalog('selectUniversity')} />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-none shadow-2xl">
                                                    {universities.map(u => <SelectItem key={u.id} value={u.id} className="rounded-lg">{u.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="title" className="text-slate-900 dark:text-slate-200 font-bold text-xs uppercase tracking-widest">{t('courseTitle')}</Label>
                                            <Input
                                                id="title"
                                                value={newCourseTitle}
                                                onChange={(e) => setNewCourseTitle(e.target.value)}
                                                placeholder="e.g. Advanced Calculus"
                                                required
                                                className="rounded-xl h-12 border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-base font-medium"
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter className="pt-4">
                                        <Button type="submit" disabled={createMutation.isPending} className="w-full rounded-xl font-black h-14 text-lg shadow-xl shadow-primary/10 transition-all hover:scale-[1.02]">
                                            {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            {tCommon('create')}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Course Grid */}
            {isCoursesLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => <CatalogCardSkeleton key={i} />)}
                </div>
            ) : filteredCourses.length === 0 ? (
                <div className="col-span-full py-20 text-center bg-white/40 dark:bg-slate-900/40 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-white/5 backdrop-blur-sm">
                    <div className="bg-primary/5 w-20 h-20 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 transform rotate-12">
                        <BookOpen className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{t('noCourses')}</h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto text-base font-medium">{t('startCreating')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredCourses.map((course) => (
                        <Card key={course.id} className="group overflow-hidden border-slate-200/50 dark:border-white/5 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl flex flex-col h-full">
                            {/* Thumbnail Area */}
                            <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-indigo-700 via-primary to-cyan-600 p-4">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.25),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.18),transparent_35%)]" />
                                <div className="relative flex h-full items-center justify-center text-center">
                                    <span className="text-white text-lg font-black leading-tight line-clamp-3 drop-shadow-sm">
                                        {course.title}
                                    </span>
                                </div>

                                <div className="absolute top-2 right-2 flex gap-1">
                                    <Badge
                                        className={`font-bold uppercase text-[9px] tracking-widest shadow-sm backdrop-blur-md border hover:bg-white/90 ${course.isPublished
                                            ? "bg-emerald-500 text-white border-emerald-400"
                                            : "bg-amber-500 text-white border-amber-400"
                                            }`}
                                    >
                                        {course.isPublished ? t('published') : t('draft')}
                                    </Badge>
                                </div>
                            </div>

                            {/* Content Area */}
                            <CardContent className="p-4 flex-1 flex flex-col gap-2">
                                <div className="space-y-1">
                                    <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider flex items-center gap-1">
                                        <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-sm">{course.university?.name || "Unknown Uni"}</span>
                                    </div>
                                    <h3 className="text-base font-black tracking-tight text-slate-900 dark:text-white line-clamp-1 group-hover:text-primary transition-colors">
                                        {course.title}
                                    </h3>
                                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                        {course.description || "No description provided."}
                                    </p>
                                </div>
                                <div className="mt-auto pt-2 flex items-center justify-between">
                                    <Badge variant="outline" className="border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-300 font-bold text-xs px-2 py-0.5">
                                        {course.price > 0 ? formatPrice(course.price) : "Free"}
                                    </Badge>
                                </div>
                            </CardContent>

                            {/* Footer Action */}
                            <CardFooter className="p-0 border-t border-slate-100 dark:border-white/5">
                                <Button
                                    variant="ghost"
                                    className="w-full h-10 rounded-none rounded-b-2xl font-bold text-xs uppercase tracking-widest text-primary hover:text-primary hover:bg-primary/5 transition-colors"
                                    onClick={() => router.push(`/${locale}/admin/courses/${course.id}`)}
                                >
                                    <MoreVertical className="mr-2 h-3.5 w-3.5" /> {t('manage')}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

