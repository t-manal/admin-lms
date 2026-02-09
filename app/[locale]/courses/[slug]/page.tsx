'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { instructorApi } from '@/lib/api/instructor';
import { Loader2, ChevronLeft, PlayCircle, FileText, ClipboardList, CheckCircle2, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import QuizComponent from '@/components/QuizComponent';
import { toast } from 'sonner';

export default function CoursePlayerPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const [course, setCourse] = useState<any>(null);
    const [selectedPart, setSelectedPart] = useState<any>(null);
    const [selectedAsset, setSelectedAsset] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const fetchContent = useCallback(async () => {
        try {
            const data = await instructorApi.getMyCourses();
            const found = data.find((c: any) => c.slug === slug);
            if (found) {
                const content = await instructorApi.getCourseContent(found.id);
                setCourse({ ...found, lectures: content.lectures });

                // Select first part and asset
                if (content.lectures[0]?.parts[0]) {
                    setSelectedPart(content.lectures[0].parts[0]);
                    setSelectedAsset(content.lectures[0].parts[0].assets[0]);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [slug]);

    useEffect(() => {
        fetchContent();
    }, [fetchContent]);

    if (isLoading) return <div className="flex h-screen items-center justify-center bg-[#1e40af] text-white"><Loader2 className="animate-spin h-12 w-12" /></div>;
    if (!course) return <div className="p-8 text-center text-slate-500">Course not found</div>;

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* Sidebar */}
            <div className={cn(
                "fixed inset-y-0 left-0 z-50 w-80 bg-white border-r transition-transform lg:relative lg:translate-x-0",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex flex-col h-full">
                    <div className="p-6 border-b bg-[#1e40af] text-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-white hover:bg-white/10">
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                            <h2 className="font-bold truncate">{course.title}</h2>
                        </div>
                    </div>
                    <ScrollArea className="flex-1">
                        <div className="p-4 space-y-6">
                            {course.lectures?.map((lecture: any, lIdx: number) => (
                                <div key={lecture.id} className="space-y-3">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">
                                        Lecture {lIdx + 1}: {lecture.title}
                                    </h3>
                                    <div className="space-y-1">
                                        {lecture.parts?.map((part: any) => (
                                            <button
                                                key={part.id}
                                                onClick={() => {
                                                    setSelectedPart(part);
                                                    setSelectedAsset(part.assets[0]);
                                                }}
                                                className={cn(
                                                    "w-full text-left p-3 rounded-xl transition-all group flex items-start gap-3",
                                                    selectedPart?.id === part.id
                                                        ? "bg-blue-50 text-[#1e40af]"
                                                        : "hover:bg-slate-50 text-slate-600"
                                                )}
                                            >
                                                <div className="mt-0.5">
                                                    {selectedPart?.id === part.id ? (
                                                        <PlayCircle className="h-4 w-4" />
                                                    ) : (
                                                        <CheckCircle2 className="h-4 w-4 text-slate-300" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium leading-tight">{part.title}</p>
                                                    <div className="flex gap-2 mt-1">
                                                        {part.assets?.map((asset: any) => (
                                                            <div key={asset.id} title={asset.type}>
                                                                {asset.type === 'VIDEO' && <PlayCircle className="h-3 w-3" />}
                                                                {asset.type === 'PDF' && <FileText className="h-3 w-3" />}
                                                                {asset.type === 'QUIZ' && <ClipboardList className="h-3 w-3 text-[#f59e0b]" />}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-950">
                <header className="h-16 border-b flex items-center justify-between px-6 bg-white dark:bg-slate-900 sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                            <Menu className="h-5 w-5" />
                        </Button>
                        <h1 className="font-bold text-slate-800 dark:text-white truncate">
                            {selectedPart?.title || 'Watch Part'}
                        </h1>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8 lg:p-12">
                    <div className="max-w-4xl mx-auto space-y-8">
                        {/* Asset Switcher */}
                        {selectedPart?.assets?.length > 1 && (
                            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit">
                                {selectedPart.assets.map((asset: any) => (
                                    <Button
                                        key={asset.id}
                                        variant={selectedAsset?.id === asset.id ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setSelectedAsset(asset)}
                                        className={cn(
                                            "rounded-lg gap-2",
                                            selectedAsset?.id === asset.id ? "bg-[#1e40af] text-white" : "text-slate-500"
                                        )}
                                    >
                                        {asset.type === 'VIDEO' && <PlayCircle className="h-4 w-4" />}
                                        {asset.type === 'PDF' && <FileText className="h-4 w-4" />}
                                        {asset.type === 'QUIZ' && <ClipboardList className="h-4 w-4" />}
                                        {asset.type}
                                    </Button>
                                ))}
                            </div>
                        )}

                        <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl shadow-blue-500/10 border p-12 min-h-[500px] flex items-center justify-center">
                            {selectedAsset?.type === 'VIDEO' ? (
                                <div className="aspect-video w-full bg-slate-900 flex items-center justify-center text-white rounded-2xl overflow-hidden relative group">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-center transition-opacity group-hover:opacity-100 opacity-60">
                                        <PlayCircle className="h-24 w-24 text-white hover:scale-110 transition-transform cursor-pointer" />
                                    </div>
                                    <p className="absolute bottom-6 font-bold tracking-widest text-[#f59e0b]">ROYAL PLAYER</p>
                                </div>
                            ) : selectedAsset?.type === 'QUIZ' ? (
                                <div className="w-full">
                                    <QuizComponent
                                        assetId={selectedAsset.id}
                                        onComplete={() => {
                                            toast.success('Course progress synchronized!');
                                            fetchContent();
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-4 text-slate-400">
                                    <FileText className="h-16 w-16" />
                                    <p className="text-xl">PDF Resource: {selectedAsset?.title}</p>
                                    <Button variant="outline" className="border-[#1e40af] text-[#1e40af]">Download PDF</Button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-[#1e40af]">About this part</h2>
                            <p className="text-slate-600 leading-relaxed">
                                In this part, we explore the core concepts of {selectedPart?.title}.
                                Complete the video and any attached quizzes to mark this part as finished.
                            </p>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
