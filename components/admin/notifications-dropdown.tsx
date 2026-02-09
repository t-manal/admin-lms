'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { adminPurchasesApi } from '@/lib/api/adminPurchases';
import { insightsApi } from '@/lib/api/insights';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Bell, CreditCard, UserPlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useParams } from 'next/navigation';

export function NotificationsDropdown() {
    const t = useTranslations('admin.notifications');
    const router = useRouter();
    const params = useParams();
    const currentLocale = params.locale as string;

    const { data: pendingPurchases } = useQuery({
        queryKey: ['admin', 'purchases', 'pending'],
        queryFn: () => adminPurchasesApi.getPending(),
        staleTime: 60 * 1000, 
    });

    const { data: insights } = useQuery({
        queryKey: ['admin', 'dashboard', 'insights'],
        queryFn: () => insightsApi.getDashboardInsights(),
        staleTime: 5 * 60 * 1000,
    });

    const pendingCount = pendingPurchases?.length || 0;
    const newestStudent = insights?.newestStudent;

    const hasNewestStudent = !!newestStudent;
    
    // Check if we have any "active" notifications to show highlight
    const hasNotifications = pendingCount > 0 || hasNewestStudent;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative rounded-xl text-slate-500 hover:text-primary hover:bg-primary/5 transition-all">
                    <Bell className="h-5 w-5" />
                    {pendingCount > 0 && (
                        <Badge 
                            variant="destructive" 
                            className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] rounded-full border border-white dark:border-slate-950"
                        >
                            {pendingCount}
                        </Badge>
                    )}
                    {/* If no pending count but we have a new student, show a small dot instead? 
                        For now, the badge is strictly for Pending Count per user request "Badge للعدد إذا > 0". 
                        We adhere to that strictly. */}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 rounded-[1.5rem] border-none shadow-2xl p-2 mt-2">
                <DropdownMenuLabel className="font-bold text-lg px-4 py-3">
                    {t('title')}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-1 bg-slate-100 dark:bg-slate-800" />
                
                <div className="flex flex-col gap-1">
                    {/* Item 1: Pending Purchases */}
                    <DropdownMenuItem 
                        className={cn(
                            "rounded-xl cursor-pointer p-4 flex items-start gap-3 transition-colors",
                            pendingCount > 0 ? "bg-amber-50 dark:bg-amber-950/20 hover:bg-amber-100 dark:hover:bg-amber-950/40" : "hover:bg-slate-50 dark:hover:bg-slate-800"
                        )}
                        onClick={() => router.push(`/${currentLocale}/admin/purchases/pending`)}
                    >
                        <div className={cn("p-2 rounded-full mt-0.5", pendingCount > 0 ? "bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400" : "bg-slate-100 text-slate-500 dark:bg-slate-800")}>
                            <CreditCard className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col gap-1 flex-1">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-sm">{t('pendingPurchases')}</span>
                                {pendingCount > 0 && (
                                    <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900 dark:text-amber-300 dark:border-amber-800">
                                        {pendingCount}
                                    </Badge>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                                {pendingCount > 0 
                                    ? t('pendingDesc', { count: pendingCount })
                                    : t('noPending')
                                }
                            </p>
                        </div>
                    </DropdownMenuItem>

                    {/* Item 2: Newest Student */}
                    <DropdownMenuItem 
                        className="rounded-xl cursor-pointer p-4 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        onClick={() => router.push(`/${currentLocale}/admin/students`)}
                    >
                        <div className="p-2 rounded-full bg-primary/10 text-primary mt-0.5">
                            <UserPlus className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col gap-1 flex-1">
                            <span className="font-bold text-sm">{t('newestStudent')}</span>
                            {hasNewestStudent ? (
                                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                                    {newestStudent.fullName}
                                </p>
                            ) : (
                                <p className="text-xs text-muted-foreground">{t('noNewStudent')}</p>
                            )}
                        </div>
                    </DropdownMenuItem>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
