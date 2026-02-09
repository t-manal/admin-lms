
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeApi } from '@/lib/api/finance';
import { Loader2, CheckCircle, Clock, User, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/utils'; // Assuming this helper exists or I should mock it

export default function PendingPurchasesPage() {
    const queryClient = useQueryClient();

    const { data: purchases, isLoading } = useQuery({
        queryKey: ['pending-purchases'],
        queryFn: financeApi.getPendingPurchases
    });

    const approveMutation = useMutation({
        mutationFn: (id: string) => financeApi.markPaid(id),
        onSuccess: () => {
            toast.success('تم تفعيل الاشتراك بنجاح');
            queryClient.invalidateQueries({ queryKey: ['pending-purchases'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'فشل التفعيل');
        }
    });

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900">طلبات الشراء المعلقة</h1>
                <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full">
                    {purchases?.length || 0} قيد الانتظار
                </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                {(!purchases || purchases.length === 0) ? (
                    <div className="p-12 text-center text-slate-500">
                        <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-100" />
                        <p>لا توجد طلبات معلقة حالياً</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {purchases.map((enrollment: any) => (
                            <div key={enrollment.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 font-bold text-slate-900">
                                        <BookOpen className="h-4 w-4 text-slate-400" />
                                        {enrollment.course.title}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <User className="h-4 w-4" />
                                        {enrollment.user.firstName} {enrollment.user.lastName} ({enrollment.user.email})
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
                                        <Clock className="h-3 w-3" />
                                        {new Date(enrollment.enrolledAt).toLocaleDateString('ar-SA')} 
                                        ({new Date(enrollment.enrolledAt).toLocaleTimeString('ar-SA')})
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="text-left">
                                        <div className="text-lg font-bold text-slate-900">
                                            {enrollment.course.price ? `$${enrollment.course.price}` : 'مجاني'}
                                        </div>
                                        <div className="text-xs text-amber-600 font-medium">بانتظار التحقق</div>
                                    </div>
                                    
                                    <button
                                        onClick={() => {
                                            if (confirm(`هل تحققت من استلام الدفع لـ ${enrollment.user.email}؟`)) {
                                                approveMutation.mutate(enrollment.id);
                                            }
                                        }}
                                        disabled={approveMutation.isPending}
                                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all disabled:opacity-50"
                                    >
                                        {approveMutation.isPending ? 'جاري التفعيل...' : 'تأكيد الدفع وتفعيل'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
