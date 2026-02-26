'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { UserPlus, CreditCard } from 'lucide-react';
import Link from 'next/link';

export function QuickActions() {
    const t = useTranslations('admin.dashboard');

    const actions = [

        {
            label: t('addStudent', { defaultMessage: 'Students' }),
            description: t('newStudent', { defaultMessage: 'New Student' }),
            icon: UserPlus,
            href: '/admin/students',
            color: 'text-indigo-500',
            bg: 'bg-indigo-50 dark:bg-indigo-950/20',
            cardClass: 'border-slate-200/60 dark:border-white/5 bg-white/60 dark:bg-slate-900/60'
        },
        {
            label: t('paymentCenter', { defaultMessage: 'Payment Center' }),
            description: t('paymentCenterDesc', { defaultMessage: 'Review pending payments' }),
            icon: CreditCard,
            href: '/admin/purchases/pending',
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-100 dark:bg-emerald-950/30',
            cardClass: 'border-emerald-200/80 dark:border-emerald-500/30 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-slate-900/60'
        }
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {actions.map((action, i) => (
                <Link href={action.href} key={i}>
                    <Card className={`hover:-translate-y-1 transition-all duration-300 hover:shadow-xl backdrop-blur-md cursor-pointer group rounded-2xl ${action.cardClass}`}>
                        <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${action.bg} ${action.color} group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
                                <action.icon className="h-6 w-6" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300 group-hover:text-primary transition-colors">
                                {action.label}
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                                {action.description}
                            </span>
                            <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-slate-200 dark:via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    );
}
