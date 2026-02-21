'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { studentApi } from '@/lib/api/student';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Loader2, ArrowLeft, Mail, Calendar, Eye, CheckCircle2, Lock, Unlock, AlertCircle, Video, FileText, ClipboardList, Phone } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { adminLocksApi } from '@/lib/api/admin-locks';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { withLatinDigits } from '@/lib/utils';

export default function StudentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const studentId = params.studentId as string;
    const t = useTranslations('admin.studentsPage');
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const [student, setStudent] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchDetails = useCallback(async () => {
        try {
            const data = await studentApi.getStudentFullDetails(studentId);
            setStudent(data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load student details');
        } finally {
            setIsLoading(false);
        }
    }, [studentId]);

    useEffect(() => {
        fetchDetails();
    }, [fetchDetails]);

    if (isLoading) return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-[#1e40af]" /></div>;
    if (!student) return <div className="p-8 text-center text-slate-500">Student not found</div>;

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-20 animate-in fade-in duration-500 px-4 pt-6">
            {/* Hero Section */}
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center bg-white dark:bg-slate-900 p-8 rounded-3xl border shadow-sm group">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                    className="md:self-start lg:hidden"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>

                <Avatar className="h-28 w-28 ring-4 ring-offset-4 ring-[#1e40af]/10">
                    <AvatarImage src={student.avatar} />
                    <AvatarFallback className="text-3xl bg-[#1e40af] text-white">
                        {student.firstName?.[0]}{student.lastName?.[0]}
                    </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                            {student.firstName} {student.lastName}
                        </h1>
                        <Badge variant="secondary" className="bg-blue-50 text-[#1e40af] border-blue-100">
                            ID: {student.id.slice(0, 8)}
                        </Badge>
                    </div>

                    <div className="flex flex-wrap gap-4 text-slate-500">
                        <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <span>{student.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{student.phoneNumber || 'Not documented yet in PROJECT_BRAIN'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Joined {new Date(student.createdAt).toLocaleDateString(withLatinDigits())}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Courses Overview */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-[#1e40af]">Enrollments & Progress</h2>
                    <Badge className="bg-[#f59e0b] text-white">{student.enrollments?.length || 0} Courses</Badge>
                </div>

                <div className="grid gap-6">
                    {student.enrollments.map((enrollment: any) => {
                        const course = enrollment.course;
                        const sections = course.lectures || course.sections || [];
                        
                        const totalLessons = sections.reduce((acc: number, s: any) => acc + (s.parts?.length || s.lessons?.length || 0), 0);
                        const completedLessons = sections.reduce((acc: number, s: any) => {
                            const items = s.parts || s.lessons || [];
                            return acc + items.filter((l: any) => {
                                const prog = l.partProgresses?.[0] || l.progress?.[0];
                                return !!prog?.completedAt;
                            }).length;
                        }, 0);
                        const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

                        return (
                            <Card key={enrollment.id} className="overflow-hidden border-2 transition-all hover:border-[#1e40af]/20">
                                <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <CardTitle className="text-xl font-bold text-[#1e40af]">{course.title}</CardTitle>
                                            <CardDescription>Enrolled on {new Date(enrollment.enrolledAt).toLocaleDateString(withLatinDigits())}</CardDescription>
                                        </div>
                                        <Badge className={enrollment.status === 'ACTIVE' ? 'bg-green-500' : 'bg-slate-400'}>
                                            {enrollment.status}
                                        </Badge>
                                    </div>
                                    <div className="mt-4 flex items-center gap-4">
                                        <div className="flex-1">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="font-medium">Completion</span>
                                                <span className="font-bold text-[#f59e0b]">{progressPercent}%</span>
                                            </div>
                                            <Progress value={progressPercent} className="h-2 bg-slate-200" />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Accordion type="single" collapsible className="w-full">
                                        {(course.lectures || course.sections || []).map((section: any) => (
                                            <AccordionItem key={section.id} value={section.id} className="border-b last:border-0">
                                                <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-slate-50 transition-colors">
                                                    <div className="text-left">
                                                        <span className="font-bold text-slate-700">{section.title}</span>
                                                        <p className="text-xs text-slate-400">
                                                            {(section.parts?.length || section.lessons?.length || 0)} Lessons
                                                        </p>
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent className="bg-slate-50/30 p-0">
                                                    <div className="divide-y">
                                                        {(section.parts || section.lessons || []).map((lesson: any) => {
                                                            const progress = lesson.partProgresses?.[0] || lesson.progress?.[0];
                                                            const isCompleted = !!progress?.completedAt;
                                                            const isVideoDone = progress?.isVideoCompleted;
                                                            
                                                            const rawAssets = lesson.assets || [];
                                                            const v2Assets = [
                                                                ...(lesson.lessons || []).map((v: any) => ({ ...v, type: 'VIDEO' })),
                                                                ...(lesson.files || []).map((f: any) => ({ ...f, type: 'PDF' }))
                                                            ].sort((a, b) => a.order - b.order);
                                                            
                                                            const displayAssets = rawAssets.length > 0 ? rawAssets : v2Assets;

                                                            return (
                                                                <div key={lesson.id} className="flex items-center justify-between px-8 py-4 bg-white dark:bg-slate-900/50">
                                                                    <div className="flex items-center gap-4">
                                                                        {isCompleted ? (
                                                                            <div className="p-1 rounded-full bg-green-100 text-green-600">
                                                                                <CheckCircle2 className="h-5 w-5" />
                                                                            </div>
                                                                        ) : (
                                                                            <div className="p-1 rounded-full bg-slate-100 text-slate-300">
                                                                                <Lock className="h-5 w-5" />
                                                                            </div>
                                                                        )}
                                                                        <div>
                                                                            <p className={`font-medium ${isCompleted ? 'text-slate-900' : 'text-slate-500'}`}>
                                                                                {lesson.title}
                                                                            </p>
                                                                            <div className="flex gap-4 mt-1">
                                                                                {displayAssets.map((asset: any) => (
                                                                                    <div key={asset.id} className="flex items-center gap-1 text-xs">
                                                                                        {asset.type === 'VIDEO' ? (
                                                                                            <>
                                                                                                <Eye className={`h-3 w-3 ${isVideoDone ? 'text-blue-500' : 'text-slate-300'}`} />
                                                                                                <span className={isVideoDone ? 'text-blue-600' : 'text-slate-400'}>Video {isVideoDone ? '(Watched)' : ''}</span>
                                                                                            </>
                                                                                        ) : asset.type === 'QUIZ' ? (
                                                                                            <>
                                                                                                <ClipboardList className={`h-3 w-3 ${asset.quiz?.attempts[0]?.passed ? 'text-green-500' : 'text-slate-300'}`} />
                                                                                                <span className={asset.quiz?.attempts[0]?.passed ? 'text-green-600 font-bold' : 'text-slate-400'}>
                                                                                                    Quiz {asset.quiz?.attempts[0] ? `(${asset.quiz.attempts[0].score}%)` : '(Not attempted)'}
                                                                                                </span>
                                                                                            </>
                                                                                        ) : (
                                                                                            <>
                                                                                                <FileText className="h-3 w-3 text-slate-300" />
                                                                                                <span className="text-slate-400">PDF</span>
                                                                                            </>
                                                                                        )}
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex gap-2">
                                                                        {isCompleted ? (
                                                                            <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                                                                                Completed
                                                                            </Badge>
                                                                        ) : (
                                                                            <div className="flex items-center gap-2">
                                                                                <Badge variant="outline" className="text-gray-500 border-gray-300">
                                                                                    {progress ? "In Progress" : "Locked"}
                                                                                </Badge>
                                                                                
                                                                                {/* LOCK CONTROL */}
                                                                                {(() => {
                                                                                    const isLocked = enrollment.locks?.some((l: any) => l.partId === lesson.id && l.isLocked);
                                                                                    return (
                                                                                        <Button
                                                                                            size="sm"
                                                                                            variant={isLocked ? "destructive" : "outline"}
                                                                                            className="h-6 text-xs px-2"
                                                                                            disabled={actionLoading === lesson.id}
                                                                                            onClick={async (e) => {
                                                                                                e.stopPropagation();
                                                                                                setActionLoading(lesson.id);
                                                                                                try {
                                                                                                    await adminLocksApi.toggleLock(enrollment.id, lesson.id);
                                                                                                    toast.success(isLocked ? 'Unlocked successfully' : 'Locked successfully');
                                                                                                    fetchDetails();
                                                                                                } catch (err) {
                                                                                                    toast.error('Failed to update lock');
                                                                                                } finally {
                                                                                                    setActionLoading(null);
                                                                                                }
                                                                                            }}
                                                                                        >
                                                                                            {actionLoading === lesson.id ? (
                                                                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                                                            ) : isLocked ? (
                                                                                                <>
                                                                                                    <Unlock className="h-3 w-3 mr-1" />
                                                                                                    {t('unlock')}
                                                                                                </>
                                                                                            ) : (
                                                                                                <>
                                                                                                    <Lock className="h-3 w-3 mr-1" />
                                                                                                    {t('lock')}
                                                                                                </>
                                                                                            )}
                                                                                        </Button>
                                                                                    );
                                                                                })()}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </div>
        </div>
    );
}
