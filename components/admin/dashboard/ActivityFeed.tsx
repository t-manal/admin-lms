'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DollarSign, GraduationCap, AlertCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityItem {
    id: string;
    type: 'PAYMENT' | 'ENROLLMENT';
    title: string;
    subtitle: string;
    date: Date;
    meta?: string; // Amount, Urgency, etc.
}

interface ActivityFeedProps {
    payments: any[];
    students: any[];
}

export function ActivityFeed({ payments, students }: ActivityFeedProps) {
    const t = useTranslations('admin.dashboard');

    // Merge and Sort
    const activities: ActivityItem[] = [
        ...payments.map(p => ({
            id: p.id,
            type: 'PAYMENT' as const,
            title: t('paymentReceived', { defaultMessage: 'Payment Received' }),
            subtitle: `${p.user?.firstName} ${p.user?.lastName} - ${p.course?.title}`,
            date: new Date(p.createdAt),
            meta: `$${p.amount}`
        })),
        ...students.map(s => ({
            id: s.id,
            type: 'ENROLLMENT' as const,
            title: t('newStudent', { defaultMessage: 'New Student' }),
            subtitle: `${s.firstName} ${s.lastName}`,
            // Fallback to current date if createdAt missing in this specific endpoint, but typically it exists
            date: s.createdAt ? new Date(s.createdAt) : new Date(),
            meta: 'Joined'
        }))
    ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 10);

    const getIcon = (type: string) => {
        switch (type) {
            case 'PAYMENT': return <DollarSign className="h-4 w-4 text-emerald-600" />;
            case 'ENROLLMENT': return <GraduationCap className="h-4 w-4 text-indigo-600" />;
            default: return <GraduationCap className="h-4 w-4 text-primary" />;
        }
    };

    const getBg = (type: string) => {
        switch (type) {
            case 'PAYMENT': return 'bg-emerald-100 dark:bg-emerald-900/20';
            case 'ENROLLMENT': return 'bg-indigo-100 dark:bg-indigo-900/20';
            default: return 'bg-blue-100 dark:bg-blue-900/20';
        }
    };

    return (
        <Card className="col-span-1 overflow-hidden border-slate-200/50 dark:border-white/5 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-[2rem] shadow-xl flex flex-col h-[400px]">
            <CardHeader className="pb-2 border-b border-slate-100 dark:border-white/5">
                <CardTitle className="text-xl font-bold flex items-center justify-between">
                    <span>{t('liveFeed', { defaultMessage: 'Happening Now' })}</span>
                    <Clock className="h-4 w-4 text-slate-400 animate-pulse" />
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                    <div className="flex flex-col p-4 gap-4">
                        {activities.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground text-sm">
                                {t('noActivity', { defaultMessage: 'No recent activity.' })}
                            </div>
                        ) : (
                            activities.map((item) => (
                                <div key={item.id} className="flex gap-4 items-start group">
                                    <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${getBg(item.type)} transition-transform group-hover:scale-110`}>
                                        {getIcon(item.type)}
                                    </div>
                                    <div className="flex-1 min-w-0 space-y-0.5">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                                {item.title}
                                            </p>
                                            <span className="text-[10px] text-slate-400 font-medium">
                                                {formatDistanceToNow(item.date, { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 max-w-[90%] truncate">
                                            {item.subtitle}
                                        </p>
                                    </div>
                                    <div className="shrink-0 self-center">
                                        {item.type === 'PAYMENT' && (
                                            <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-900/50 dark:text-emerald-400 font-bold">
                                                {item.meta}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
