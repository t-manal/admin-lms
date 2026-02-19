'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { instructorApi, type Course } from '@/lib/api/instructor';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Save, Upload, Trash } from 'lucide-react';
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
    FormDescription,
} from '@/components/ui/form';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const courseSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    price: z.number().min(0, 'Price must be 0 or more'),
    description: z.string().min(10, 'Description must be at least 10 characters').optional().or(z.literal('')),
});

type CourseFormValues = z.infer<typeof courseSchema>;

export default function CourseOverviewPage() {
    const t = useTranslations('admin.courses.overview');
    const params = useParams();
    const router = useRouter();
    const courseId = params.courseId as string;

    const [course, setCourse] = useState<Course | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);

    const form = useForm<CourseFormValues>({
        resolver: zodResolver(courseSchema),
        defaultValues: {
            title: '',
            price: 0,
            description: '',
        },
    });

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                setIsLoading(true);
                // Use getCourse to fetch specific course details including latest status
                const data = await instructorApi.getCourse(courseId);
                setCourse(data);
                form.reset({
                    title: data.title,
                    price: data.price,
                    description: data.description || '',
                });
            } catch (error) {
                console.error(error);
                toast.error('Failed to load course details');
                // router.push('/admin/courses'); // Optional: redirect on error
            } finally {
                setIsLoading(false);
            }
        };

        if (courseId) fetchCourse();
    }, [courseId, router, form]);

    const handleSave = async (data: CourseFormValues) => {
        if (!course) return;
        try {
            setIsSaving(true);
            await instructorApi.updateCourse(course.id, data);
            toast.success('Course details updated');
        } catch (error) {
            toast.error('Failed to update course details');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!course) return;

        try {
            setIsDeleting(true);
            await instructorApi.deleteCourse(course.id);
            toast.success('Course deleted');
            router.push('/admin/courses');
        } catch (error) {
            toast.error('Failed to delete course');
        } finally {
            setIsDeleting(false);
        }
    };



    const handlePublishToggle = async () => {
        if (!course) return;

        try {
            setIsPublishing(true);

            if (!course.isPublished) {
                // Validate before publishing
                // Fetch fresh data using getCourse to properly see sections/lessons
                const freshCourse = await instructorApi.getCourse(course.id) as Course;

                // Check for at least 1 lecture
                if (!freshCourse.lectures || freshCourse.lectures.length === 0) {
                    toast.error("Cannot publish course", {
                        description: "You must add at least one lecture in the Curriculum tab before publishing."
                    });
                    setIsPublishing(false);
                    return;
                }

                // Check for at least 1 part in ANY lecture
                const hasPart = freshCourse.lectures.some(l => l.parts && l.parts.length > 0);
                if (!hasPart) {
                    toast.error("Cannot publish course", {
                        description: "You must add at least one part in the Curriculum tab before publishing."
                    });
                    setIsPublishing(false);
                    return;
                }
            }

            const newStatus = !course.isPublished;
            await instructorApi.updateCourse(course.id, { isPublished: newStatus });

            setCourse({ ...course, isPublished: newStatus });
            toast.success(newStatus ? "Course published live!" : "Course unpublished.");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update course status");
        } finally {
            setIsPublishing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!course) return null;

    return (
        <div className="space-y-6 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid gap-6 md:grid-cols-2">
                {/* Stats Card (Placeholder based on requirements) */}
                <Card>
                    <CardHeader>
                        <CardTitle>{t('performance')}</CardTitle>
                        <CardDescription>{t('metricsDesc', { title: course.title })}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                                <span className="text-sm font-medium">{t('totalStudents')}</span>
                                <span className="text-2xl font-bold">{course._count?.enrollments || 0}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('actions')}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <Button
                            onClick={handlePublishToggle}
                            disabled={isPublishing}
                            variant={course.isPublished ? "outline" : "default"}
                            className={course.isPublished ? "border-yellow-600 text-yellow-600 hover:bg-yellow-50" : "bg-green-600 hover:bg-green-700"}
                        >
                            {isPublishing ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Upload className={cn("mr-2 h-4 w-4", course.isPublished ? "rotate-180" : "")} />
                            )}
                            {course.isPublished ? t('unpublish') : t('publish')}
                        </Button>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" disabled={isDeleting} className="w-full">
                                    <Trash className="mr-2 h-4 w-4" />
                                    {isDeleting ? t('deleting') : t('delete')}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>{t('deleteConfirmTitle')}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        {t('deleteConfirmDesc')}
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('basicInfo')}</CardTitle>
                    <CardDescription>{t('basicInfoDesc')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('form.title')}</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder={t('form.title')} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="price"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('form.price')}</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        onChange={e => field.onChange(Number(e.target.value))}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('form.description')}</FormLabel>
                                                <FormControl>
                                                    <Textarea {...field} rows={6} placeholder={t('form.descriptionPlaceholder')} className="resize-none" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button type="submit" size="lg" disabled={isSaving}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {isSaving ? t('saving') : t('save')}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
