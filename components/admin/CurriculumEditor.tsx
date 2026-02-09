'use client';

import { useState, useEffect, useCallback } from 'react';
import { instructorApi, type Lecture } from '@/lib/api/instructor';
import { toast } from 'sonner';
import { Loader2, Plus, GripVertical, FileText, Trash, ArrowRight, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function CurriculumEditor({ courseId }: { courseId: string }) {
    const t = useTranslations('admin.curriculum');
    const router = useRouter();
    const [lectures, setLectures] = useState<Lecture[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newLectureTitle, setNewLectureTitle] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const fetchContent = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await instructorApi.getCourseContent(courseId);
            setLectures(data.lectures || []);
        } catch (error) {
            toast.error('Failed to load curriculum');
        } finally {
            setIsLoading(false);
        }
    }, [courseId]);

    useEffect(() => {
        fetchContent();
    }, [fetchContent]);

    const handleCreateLecture = async () => {
        if (!newLectureTitle) return;
        try {
            const nextOrder = lectures.length > 0 ? Math.max(...lectures.map(s => s.order)) + 1 : 1;
            await instructorApi.createLecture(courseId, { title: newLectureTitle, order: nextOrder });
            toast.success(t('addLecture') + ' created');
            setNewLectureTitle('');
            setIsDialogOpen(false);
            fetchContent();
        } catch (error) {
            toast.error('Failed to create lecture');
        }
    };

    const handleDeleteLecture = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            await instructorApi.deleteLecture(id);
            toast.success(t('deleteLecture'));
            fetchContent();
        } catch (error) {
            toast.error('Failed to delete lecture');
        }
    };

    const handleQuickAddPart = async (lectureId: string) => {
        const title = prompt(t('partTitle') + ":");
        if (!title) return;
        try {
            const lecture = lectures.find(s => s.id === lectureId);
            const nextOrder = (lecture?.parts?.length || 0) > 0
                ? Math.max(...(lecture?.parts || []).map(l => l.order)) + 1
                : 1;
            await instructorApi.createPart(lectureId, { title, order: nextOrder });
            toast.success(t('addPart'));
            fetchContent();
        } catch (error) {
            toast.error('Failed to create part');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold tracking-tight">{t('manageContent')}</h2>
                </div>
                <div className="flex gap-2">
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm"><Plus className="mr-2 h-4 w-4" /> {t('addLecture')}</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{t('addLecture')}</DialogTitle>
                            </DialogHeader>
                            <div className="py-4">
                                <Input placeholder={t('lectureTitle')} value={newLectureTitle} onChange={e => setNewLectureTitle(e.target.value)} />
                            </div>
                            <DialogFooter>
                                <Button onClick={handleCreateLecture}>{t('addLecture')}</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {isLoading ? <Loader2 className="animate-spin" /> : (
                <Accordion type="multiple" className="w-full space-y-4" value={lectures.map(s => s.id)}>
                    {lectures.map(lecture => (
                        <AccordionItem key={lecture.id} value={lecture.id} className="border rounded-lg bg-card px-4">
                            <div className="flex items-center justify-between py-2">
                                <div className="flex items-center gap-2 flex-1">
                                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                                    <AccordionTrigger className="hover:no-underline py-2 font-semibold text-base">{lecture.title}</AccordionTrigger>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => handleDeleteLecture(lecture.id)}><Trash className="h-4 w-4 text-destructive" /></Button>
                                </div>
                            </div>
                            <AccordionContent className="pt-2 pb-4 space-y-2">
                                {lecture.parts?.map(part => {
                                    const isVideo = part.assets?.some(a => a.type === 'VIDEO');
                                    const isPdf = part.assets?.some(a => a.type === 'PDF' || a.type === 'PPTX');
                                    
                                    return (
                                        <div
                                            key={part.id}
                                            className="flex items-center justify-between p-2 rounded-md bg-muted/40 hover:bg-muted ml-6 transition-colors cursor-pointer group"
                                            onClick={() => router.push(`/admin/courses/${courseId}/curriculum/${part.id}`)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-1.5 bg-background rounded-full border`}>
                                                    {isVideo ? <Video className="h-3.5 w-3.5 text-purple-500" /> :
                                                        isPdf ? <FileText className="h-3.5 w-3.5 text-blue-500" /> :
                                                            <FileText className="h-3.5 w-3.5 text-muted-foreground" />}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-sm group-hover:text-primary transition-colors">{part.title}</div>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm">
                                                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                                            </Button>
                                        </div>
                                    );
                                })}
                                <div className="flex gap-2 ml-6 mt-2">
                                    <Button variant="outline" size="sm" className="flex-1 border-dashed h-8" onClick={() => handleQuickAddPart(lecture.id)}>
                                        <Plus className="mr-2 h-3.5 w-3.5" /> {t('addPart')}
                                    </Button>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            )}
        </div>
    );
}
