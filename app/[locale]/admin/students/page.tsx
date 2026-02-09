'use client';

import { useState, useEffect } from 'react';
import { instructorApi } from '@/lib/api/instructor';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Loader2, Search, Eye, Trash2, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
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

export default function StudentsListPage() {
    const t = useTranslations('admin.studentsPage');
    const router = useRouter();
    const [students, setStudents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Pagination State
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalStudents, setTotalStudents] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [confirmDeleteAll, setConfirmDeleteAll] = useState('');

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                setIsLoading(true);
                // Call API with pagination and search
                const response: any = await instructorApi.getStudents({ 
                    page, 
                    limit: 10, 
                    q: searchQuery 
                });
                
                // Handle response structure depending on how apiClient wraps it
                // Backend sends { status: 'success', data: [...], meta: {...} }
                // If apiClient returns full body: response.data, response.meta
                // If apiClient returns just data: we might lose meta?
                // NOTE: We need to verify apiClient behavior. Assuming we get { data, meta } or full object.
                // Let's assume standard behavior: response itself has data and meta properties merged if using simple client,
                // or response is the payload.
                
                // Safe check
                const list = response.data || response || [];
                const meta = response.meta || { total: list.length, totalPages: 1, page: 1 };
                
                setStudents(list);
                setTotalPages(meta.totalPages);
                setTotalStudents(meta.total);
            } catch (error) {
                console.error(error);
                setStudents([]);
            } finally {
                setIsLoading(false);
            }
        };
        
        // Debounce search could be added here, but for now direct effect is okay per requirements
        const timer = setTimeout(() => {
            fetchStudents();
        }, 300);

        return () => clearTimeout(timer);
    }, [page, searchQuery]);

    // Reset page when search changes
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setPage(1); // UX Requirement: Reset to page 1 on search
    };

    const getInitials = (first: string, last: string) => {
        return `${first?.charAt(0) || ''}${last?.charAt(0) || ''}`.toUpperCase();
    };

    const handleDeleteStudent = async (e: React.MouseEvent, studentId: string) => {
        e.stopPropagation();
        if (!confirm('هل أنت متأكد من حذف هذا الطالب؟ سيتم حذف جميع بياناته.')) return;
        try {
            setIsDeleting(true);
            await instructorApi.deleteStudent(studentId);
            toast.success('تم حذف الطالب بنجاح');
            setStudents(prev => prev.filter(s => s.id !== studentId));
            setTotalStudents(prev => prev - 1);
        } catch (error) {
            toast.error('فشل حذف الطالب');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteAllStudents = async () => {
        if (confirmDeleteAll !== 'DELETE') {
            toast.error('يرجى كتابة DELETE للتأكيد');
            return;
        }
        try {
            setIsDeleting(true);
            const result: any = await instructorApi.deleteAllStudents();
            toast.success(`تم حذف ${result.deletedCount || 0} طالب`);
            setStudents([]);
            setTotalStudents(0);
            setConfirmDeleteAll('');
        } catch (error) {
            toast.error('فشل حذف جميع الطلاب');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
                    <p className="text-muted-foreground">{t('subtitle')}</p>
                </div>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" disabled={isDeleting || students.length === 0}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            حذف جميع الطلاب
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                                <AlertTriangle className="h-5 w-5" />
                                تحذير: حذف جميع الطلاب
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                سيتم حذف جميع الطلاب وبياناتهم بشكل نهائي. اكتب <strong>DELETE</strong> للتأكيد.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <Input 
                            placeholder="اكتب DELETE للتأكيد" 
                            value={confirmDeleteAll}
                            onChange={(e) => setConfirmDeleteAll(e.target.value)}
                        />
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setConfirmDeleteAll('')}>إلغاء</AlertDialogCancel>
                            <AlertDialogAction 
                                onClick={handleDeleteAllStudents}
                                disabled={confirmDeleteAll !== 'DELETE' || isDeleting}
                                className="bg-destructive hover:bg-destructive/90"
                            >
                                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'حذف الكل'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>{t('allStudents')}</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={t('searchPlaceholder')}
                                className="pl-8"
                                value={searchQuery}
                                onChange={handleSearchChange}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('table.student')}</TableHead>
                                    <TableHead>{t('table.contact')}</TableHead>
                                    <TableHead className="text-center">{t('table.enrolledCourses')}</TableHead>
                                    <TableHead className="text-right">{t('table.actions')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                            {t('table.noStudents')}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    students.map((student) => (
                                        <TableRow key={student.id} className="cursor-pointer hover:bg-muted/50" onClick={() => router.push(`/admin/students/${student.id}`)}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarImage src={student.avatar} />
                                                        <AvatarFallback>{getInitials(student.firstName, student.lastName)}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="font-medium">
                                                        {student.firstName} {student.lastName}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col text-sm">
                                                    <span>{student.email}</span>
                                                    <span className="text-muted-foreground text-xs">{student.phoneNumber || '-'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="inline-flex items-center justify-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                                    {student.enrolledCoursesCount || 0}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); router.push(`/admin/students/${student.id}`) }}>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        onClick={(e) => handleDeleteStudent(e, student.id)}
                                                        disabled={isDeleting}
                                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                    
                    {/* Pagination Controls */}
                    {!isLoading && students.length > 0 && (
                        <div className="flex items-center justify-end space-x-2 py-4">
                            <div className="flex-1 text-sm text-muted-foreground">
                                {t('table.total')}: {totalStudents}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                {t('table.previous')}
                            </Button>
                            <div className="text-sm font-medium">
                                {t('table.page')} {page} / {totalPages}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                            >
                                {t('table.next')}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
