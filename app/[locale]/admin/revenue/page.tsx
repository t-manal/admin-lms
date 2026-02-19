
'use client';

import { useQuery } from '@tanstack/react-query';
import { financeApi } from '@/lib/api/finance';
import { Loader2, Banknote, TrendingUp, BookOpen } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export default function RevenuePage() {
    const { data: revenue, isLoading } = useQuery({
        queryKey: ['revenue-summary'],
        queryFn: async () => {
            const data = await financeApi.getRevenueSummary();
            return data as any;
        }
    });

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        );
    }

    if (!revenue) return <div>No data</div>;

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-slate-900">تقرير الإيرادات</h1>

            {/* Total Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white shadow-xl shadow-indigo-100">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-white/10 rounded-xl">
                            <Banknote className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-indigo-100">إجمالي الإيرادات (المحققة)</p>
                            <h2 className="text-3xl font-black mt-1">{formatPrice(Number(revenue.total))}</h2>
                        </div>
                    </div>
                    <div className="items-center text-xs text-indigo-200 gap-1 bg-white/5 inline-flex px-2 py-1 rounded-lg">
                        <TrendingUp className="h-3 w-3" />
                         صافي الدخل من الطلبات اليدوية
                    </div>
                </div>
            </div>

            {/* Breakdown */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-bold text-slate-900">تفاصيل المبيعات حسب الدورة</h3>
                </div>
                
                <table className="w-full text-right text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-medium">
                        <tr>
                            <th className="p-4 pr-6">الدورة التدريبية</th>
                            <th className="p-4">عدد المبيعات</th>
                            <th className="p-4 pl-6">الإجمالي</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {revenue.byCourse.map((item: any) => (
                            <tr key={item.courseId} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4 pr-6 font-medium text-slate-900 flex items-center gap-2">
                                    <BookOpen className="h-4 w-4 text-slate-400" />
                                    {item.title}
                                </td>
                                <td className="p-4 text-slate-600">{item.count} عملية بيع</td>
                                <td className="p-4 pl-6 font-bold text-emerald-600">{formatPrice(Number(item.amount))}</td>
                            </tr>
                        ))}
                        {revenue.byCourse.length === 0 && (
                            <tr>
                                <td colSpan={3} className="p-8 text-center text-slate-400">لا توجد مبيعات حتى الآن</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
