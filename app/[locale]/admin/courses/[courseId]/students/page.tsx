'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { instructorApi } from '@/lib/api/instructor';
import { toast } from 'sonner';
import { Loader2, User, Trash2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
} from '@/components/ui/alert-dialog';
import { formatPrice, withLatinDigits } from '@/lib/utils';


export default function CourseStudentsPage() {
    const t = useTranslations('admin.courses.students');
    const params = useParams();
    const router = useRouter();
    const locale = params.locale as string;
    const courseId = params.courseId as string;
    const [students, setStudents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [confirmClear, setConfirmClear] = useState('');

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                setIsLoading(true);
                // Use the dedicated endpoint for course students (no pagination yet, but safer than filtering global list)
                const courseStudents = await instructorApi.getCourseStudents(courseId);
                setStudents(courseStudents || []);
            } catch (error) {
                toast.error('Failed to load students');
            } finally {
                setIsLoading(false);
            }
        };
        fetchStudents();
    }, [courseId]);

    const handleClearEnrollments = async () => {
        if (confirmClear !== 'CLEAR') {
            toast.error('يرجى كتابة CLEAR للتأكيد');
            return;
        }
        try {
            setIsDeleting(true);
            const result: any = await instructorApi.clearCourseEnrollments(courseId);
            toast.success(`تم إلغاء تسجيل ${result.deletedCount || 0} طالب`);
            setStudents([]);
            setConfirmClear('');
        } catch (error) {
            toast.error('فشل إلغاء التسجيلات');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">{t('title')}</h2>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" disabled={isDeleting || students.length === 0}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            حذف جميع المنضمين
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                                <AlertTriangle className="h-5 w-5" />
                                إلغاء جميع التسجيلات
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                سيتم إلغاء تسجيل جميع الطلاب من هذه الدورة. اكتب <strong>CLEAR</strong> للتأكيد.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <Input 
                            placeholder="اكتب CLEAR للتأكيد" 
                            value={confirmClear}
                            onChange={(e) => setConfirmClear(e.target.value)}
                        />
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setConfirmClear('')}>إلغاء</AlertDialogCancel>
                            <AlertDialogAction 
                                onClick={handleClearEnrollments}
                                disabled={confirmClear !== 'CLEAR' || isDeleting}
                                className="bg-destructive hover:bg-destructive/90"
                            >
                                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'حذف الكل'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
            <Card>
                <CardContent className="p-0">
                    {isLoading ? <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto" /></div> : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('table.student')}</TableHead>
                                    <TableHead>{t('table.email')}</TableHead>
                                    <TableHead>{t('table.phone')}</TableHead>
                                    <TableHead>{t('table.paid')}</TableHead>
                                    <TableHead>{t('table.remaining')}</TableHead>
                                    <TableHead>{t('table.joined')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.map((student) => (
                                    <TableRow key={student.id} onClick={() => router.push(`/${locale}/admin/students/${student.id}`)} className="cursor-pointer hover:bg-muted/50">
                                        <TableCell className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={student.avatar || student.profilePicture} />
                                                <AvatarFallback><User /></AvatarFallback>
                                            </Avatar>
                                            <div className="font-medium">{student.firstName} {student.lastName}</div>
                                        </TableCell>
                                        <TableCell>{student.email}</TableCell>
                                        <TableCell>{student.phoneNumber || student.phone || '-'}</TableCell>
                                        <TableCell>{formatPrice(student.payment?.paidAmount || 0)}</TableCell>
                                        <TableCell>{formatPrice(student.payment?.remaining || 0)}</TableCell>
                                        <TableCell>
                                            {student.enrolledAt
                                                ? new Date(student.enrolledAt).toLocaleDateString(withLatinDigits())
                                                : '-'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {students.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            {t('table.noStudents')}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
